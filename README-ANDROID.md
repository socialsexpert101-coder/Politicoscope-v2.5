# PolitiScope sur Android

Cette version est une PWA statique compatible GitHub Pages. Les données sont dans `data/` et la veille quotidienne peut être exécutée par GitHub Actions.

## Publication gratuite depuis Android
1. Créer un dépôt GitHub public nommé `politicoscope`.
2. Téléverser le contenu de ce dossier à la racine du dépôt, notamment `.github/`, `data/`, `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, `sw.js` et `icon.svg`.
3. Dans GitHub : Settings → Pages → Source: GitHub Actions.
4. Attendre le workflow « Deploy PolitiScope ».
5. Ouvrir l'URL Pages sur Android.
6. Dans Chrome : menu ⋮ → « Ajouter à l'écran d'accueil » / « Installer l'application ».

Le workflow « PolitiScope daily update » tente ensuite une mise à jour quotidienne. Les sources réelles doivent être configurées dans `scripts/sources.json`; les données présentes par défaut peuvent être de démonstration.
