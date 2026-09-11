# <img src="assets/icon-592.png" alt="" width="42" align="absmiddle"> PRONOTE Obsidian

> Une extension Chromium qui donne à PRONOTE une interface sombre, lisible et personnalisable, avec une vraie couleur d'accentuation

<p>
	<img src="https://img.shields.io/badge/Manifest-V3-20232A?style=flat-square" alt="Manifest V3">
	<img src="https://img.shields.io/badge/Chrome%20%7C%20Edge-compatible-4F8CFF?style=flat-square" alt="Compatible Chrome et Edge">
	<img src="https://img.shields.io/badge/version-1.6-7C5CFC?style=flat-square" alt="Version 1.6">
</p>

## Ce que l'extension apporte

- **Un mode sombre cohérent** : fonds, fenêtres, tableaux, formulaires, menus et barre d'en-tête suivent la même hiérarchie visuelle
- **Une accentuation personnalisable** : liens, états actifs, boutons, champs sélectionnés, focus, progressions et sélections reprennent la couleur choisie
- **Un retour natif propre** : désactiver le thème retire les classes, attributs et variables ajoutés par l'extension
- **Le respect de PRONOTE** : les images, vidéos, SVG et couleurs sémantiques conservent leur rendu d'origine
- **Une préférence synchronisée** : les réglages sont enregistrés via `chrome.storage.sync`

## Installation

1. Ouvrir `chrome://extensions`
2. Activer **Mode développeur**
3. Cliquer sur **Charger l'extension non empaquetée**
4. Sélectionner le dossier `PronoteObsidian`
5. Ouvrir PRONOTE, puis cliquer sur l'icône de l'extension

## Personnalisation

| Réglage                       | Effet                                                                    |
| ----------------------------- | ------------------------------------------------------------------------ |
| **Mode sombre**               | Active ou désactive le thème sans modifier le contenu de PRONOTE         |
| **Couleur d'accentuation**    | Colore les interactions et les repères importants dans toute l'interface |
| **Couleur PRONOTE d'origine** | Désactive l'accent personnalisé et restaure les couleurs natives         |

La couleur choisie génère automatiquement des variantes plus sombres, plus douces et plus claires pour garder un contraste lisible selon le contexte

## Fonctionnement technique

L'extension est composée de trois couches simples :

1. `content.js` détecte PRONOTE, lit les réglages et applique l'état du thème
2. `theme.css` contient les variables, surfaces, états interactifs et règles d'accessibilité visuelle
3. `popup.html`, `popup.css` et `popup.js` fournissent les contrôles du thème et de l'accent

Le thème est limité aux pages reconnues comme PRONOTE et utilise les variables CSS natives lorsque l'accent personnalisé est désactivé

## Permissions

- `storage` permet de mémoriser les préférences
- `<all_urls>` permet d'injecter le thème sur les différentes adresses PRONOTE utilisées par les établissements

Aucune donnée de navigation n'est collectée et aucun service distant n'est requis pour le fonctionnement de l'extension

## Dépannage

Si le thème n'apparaît pas, rechargez l'extension depuis `chrome://extensions`, puis rechargez la page PRONOTE. L'extension doit être activée et le site doit exposer une interface PRONOTE reconnue
