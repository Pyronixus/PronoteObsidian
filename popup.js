// Popup controls
const enabled = document.getElementById("enabled");
const accent = document.getElementById("accent");
const accentOff = document.getElementById("accentOff");
const status = document.getElementById("status");
const colorWrap = document.querySelector(".color-wrap");
const switchControl = document.querySelector(".switch");
let accentPreference = true;
let accentSaveTimer;
let pendingAccent;

// Defaults are shared with content.js through the same storage keys
const DEFAULTS = {
  pronoteObsidianEnabled: true,
  pronoteObsidianAccent: "#4f8cff",
  pronoteObsidianAccentEnabled: true,
};

// Keep the accent controls synchronized with the effective theme state
function setAccentState(themeOn) {
  const accentOn = themeOn && accentPreference;
  accentOff.classList.toggle("active", !accentOn);
  accentOff.disabled = !themeOn;
  colorWrap.classList.toggle("disabled", !accentOn);
  accent.disabled = !accentOn;
}

// Synchronize the controls with the persisted extension state
function render(data) {
  const on = Boolean(data.pronoteObsidianEnabled);
  accentPreference = Boolean(data.pronoteObsidianAccentEnabled);
  enabled.checked = on;
  accent.value = data.pronoteObsidianAccent;
  setAccentState(on);
  status.textContent = on ? "Activé" : "Désactivé";
  status.style.color = on ? "#8490a0" : "#68717d";
}

// Restore the last selected settings when the popup opens
chrome.storage.sync.get(DEFAULTS).then(render);

// Avoid flooding synchronized storage while the color picker is moving
function saveAccent() {
  if (!pendingAccent) return;
  const accentToSave = pendingAccent;
  pendingAccent = undefined;
  clearTimeout(accentSaveTimer);
  chrome.storage.sync
    .set({
      pronoteObsidianAccent: accentToSave,
      pronoteObsidianAccentEnabled: true,
    })
    .catch(() => {
      pendingAccent = accentToSave;
    });
}

function scheduleAccentSave(value) {
  pendingAccent = value;
  clearTimeout(accentSaveTimer);
  accentSaveTimer = setTimeout(saveAccent, 120);
}

// Theme toggle and its visual feedback
enabled.addEventListener("change", () => {
  chrome.storage.sync.set({ pronoteObsidianEnabled: enabled.checked });
  setAccentState(enabled.checked);
  status.textContent = enabled.checked ? "Activé" : "Désactivé";
  switchControl.classList.remove("is-animating");
  void switchControl.offsetWidth;
  switchControl.classList.add("is-animating");
});

// Remove the temporary animation class after the crystal has finished moving
switchControl.addEventListener("animationend", (event) => {
  if (event.animationName.startsWith("crystal-spin")) {
    switchControl.classList.remove("is-animating");
  }
});

// Selecting a color also enables custom accent colors
accent.addEventListener("input", () => {
  scheduleAccentSave(accent.value);
  accentPreference = true;
  setAccentState(enabled.checked);
});

accent.addEventListener("change", saveAccent);

// Toggle between the custom accent and PRONOTE's native accent
accentOff.addEventListener("click", () => {
  if (!enabled.checked) return;
  accentPreference = !accentPreference;
  chrome.storage.sync.set({
    pronoteObsidianAccentEnabled: accentPreference,
  });
  setAccentState(enabled.checked);
});
