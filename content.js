(() => {
  "use strict";

  // Storage keys and the fallback accent used by the extension
  const KEY_ENABLED = "pronoteObsidianEnabled";
  const KEY_ACCENT = "pronoteObsidianAccent";
  const KEY_ACCENT_ON = "pronoteObsidianAccentEnabled";
  const DEFAULT_ACCENT = "#4f8cff";

  // Limit theme changes to pages that expose known PRONOTE markers
  const looksLikePronote = () => {
    const root = document.documentElement;
    const body = document.body;
    if (!root) return false;
    const haystack =
      `${location.hostname} ${location.pathname} ${root.className || ""} ${body?.className || ""}`.toLowerCase();
    const markers = [
      "pronote",
      "index-education",
      "espaceindex",
      "objetbandeauentete",
      "objetfenetre",
      "themepronote",
    ];
    if (markers.some((m) => haystack.includes(m))) return true;
    return !!document.querySelector(
      '.EspaceIndex, .objetbandeauentete_global, .ObjetBandeauEntete, .ThemePronote, [class*="ObjetFenetre_"]',
    );
  };

  // Convert and derive the accent colors consumed by theme.css
  const hexToRgb = (hex) => {
    const v = String(hex || "")
      .replace("#", "")
      .trim();
    if (!/^[0-9a-f]{6}$/i.test(v)) return [79, 140, 255];
    return [
      parseInt(v.slice(0, 2), 16),
      parseInt(v.slice(2, 4), 16),
      parseInt(v.slice(4, 6), 16),
    ];
  };

  const mix = (a, b, amount) => Math.round(a + (b - a) * amount);
  const shade = (rgb, amount) =>
    rgb.map((c) => mix(c, amount < 0 ? 0 : 255, Math.abs(amount)));
  const rgbString = (rgb) => rgb.join(", ");
  const colorString = (rgb) => `rgb(${rgb.join(", ")})`;
  const accentProperties = [
    "--pronote-obsidian-accent",
    "--pronote-obsidian-accent-rgb",
    "--pronote-obsidian-accent-dark",
    "--pronote-obsidian-accent-dark-rgb",
    "--pronote-obsidian-accent-soft",
    "--pronote-obsidian-accent-soft-rgb",
    "--pronote-obsidian-accent-light",
    "--pronote-obsidian-accent-light-rgb",
  ];

  // Keep custom accent variables on the root element so CSS can react to storage changes
  const setAccent = (enabled, hex) => {
    const root = document.documentElement;
    if (!enabled) {
      root.removeAttribute("data-pronote-accent");
      accentProperties.forEach((property) =>
        root.style.removeProperty(property),
      );
      return;
    }
    const rgb = hexToRgb(hex);
    const dark = shade(rgb, -0.42);
    const soft = shade(rgb, 0.55);
    const light = shade(rgb, 0.72);
    root.setAttribute("data-pronote-accent", "custom");
    root.style.setProperty("--pronote-obsidian-accent", colorString(rgb));
    root.style.setProperty("--pronote-obsidian-accent-rgb", rgbString(rgb));
    root.style.setProperty("--pronote-obsidian-accent-dark", colorString(dark));
    root.style.setProperty(
      "--pronote-obsidian-accent-dark-rgb",
      rgbString(dark),
    );
    root.style.setProperty("--pronote-obsidian-accent-soft", colorString(soft));
    root.style.setProperty(
      "--pronote-obsidian-accent-soft-rgb",
      rgbString(soft),
    );
    root.style.setProperty(
      "--pronote-obsidian-accent-light",
      colorString(light),
    );
    root.style.setProperty(
      "--pronote-obsidian-accent-light-rgb",
      rgbString(light),
    );
  };

  // Apply the theme state after checking that the current page is PRONOTE
  const setTheme = (enabled, accentEnabled, accent) => {
    const isPronote = looksLikePronote();
    if (!isPronote && enabled) return;
    document.documentElement.classList.toggle(
      "pronote-obsidian-enabled",
      isPronote && enabled,
    );
    if (document.body)
      document.body.classList.toggle("dark-mode", isPronote && enabled);
    setAccent(isPronote && enabled && accentEnabled, accent);
  };

  // Read the persisted settings and apply their defaults when needed
  let applyRequest = 0;
  const apply = async () => {
    const request = ++applyRequest;
    const settings = await chrome.storage.sync.get({
      [KEY_ENABLED]: true,
      [KEY_ACCENT]: DEFAULT_ACCENT,
      [KEY_ACCENT_ON]: true,
    });
    if (request !== applyRequest) return;
    setTheme(
      Boolean(settings[KEY_ENABLED]),
      Boolean(settings[KEY_ACCENT_ON]),
      settings[KEY_ACCENT],
    );
  };

  // React immediately when the popup changes a synchronized setting
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (
      KEY_ENABLED in changes ||
      KEY_ACCENT in changes ||
      KEY_ACCENT_ON in changes
    )
      apply();
  });

  // Re-apply the state if PRONOTE replaces its body or theme classes
  let applying = false;
  const observer = new MutationObserver(() => {
    if (applying || !document.body || !looksLikePronote()) return;
    const needsDark =
      document.documentElement.classList.contains(
        "pronote-obsidian-enabled",
      ) !== document.body.classList.contains("dark-mode");
    if (needsDark) {
      applying = true;
      apply().finally(() => {
        applying = false;
      });
    }
  });

  // Start after the DOM exists so the observer can watch the complete page
  const boot = () => {
    apply();
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-pronote-accent"],
      childList: true,
      subtree: true,
    });
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
