<p align="center">
  <img src="docs/assets/header.png" alt="EmojiDeck" />
</p>

<p align="center">
  <a href="README.md"><img src="docs/assets/flag-fr.svg" alt="" width="18" height="12" /> Français</a>
  /
  <a href="docs/README.en.md"><img src="docs/assets/flag-gb.svg" alt="" width="18" height="12" /> English</a>
</p>

# EmojiDeck

Sélecteur d’emojis rapide, léger et multilingue pour trouver puis copier un emoji en quelques secondes.

EmojiDeck est une application web statique, responsive et sans compte utilisateur. Elle fonctionne entièrement dans le navigateur : aucun backend, aucun cookie, aucune publicité et aucun outil de suivi. Les préférences, les emojis récents et les favoris restent stockés localement sur l’appareil.

## Fonctionnalités

- Catalogue complet de **1 914 emojis Unicode 17.0** et **2 030 variantes de teinte de peau**.
- Recherche localisée par noms, mots-clés et synonymes CLDR.
- Recherche limitée à la catégorie active, avec une catégorie `Tous` pour interroger le catalogue entier.
- Catégories : Smileys, Personnes, Animaux, Nourriture, Activités, Voyages, Objets, Symboles et Drapeaux.
- Copie immédiate dans le presse-papiers avec confirmation discrète.
- Historique des emojis récents et collection de favoris.
- Teinte de peau par défaut et sélecteur de variantes par emoji.
- Interface en français, anglais, allemand, italien, espagnol et portugais.
- Thèmes clair, sombre et système, mémorisés localement.
- Mode compact ou élargi avec mise en page responsive desktop et mobile.
- Navigation complète au clavier : `Ctrl+F` ou `Cmd+F`, flèches, `Home`, `End` et `Échap`.
- Chargement à la demande des catalogues de langue et rendu progressif des grandes catégories.

## Utilisation

1. Choisissez une catégorie ou `Tous`.
2. Parcourez la grille ou saisissez un mot dans la recherche.
3. Cliquez sur un emoji pour le copier.
4. Utilisez l’étoile pour l’ajouter aux favoris.
5. Pour un emoji compatible, ouvrez le sélecteur de teinte avec sa petite action, un clic droit ou un appui long.

Les préférences de langue, thème, teinte de peau et largeur d’affichage sont conservées dans `localStorage`. Les récents et favoris y sont également enregistrés, sans synchronisation extérieure.

## Langues

EmojiDeck sélectionne la langue selon cette priorité :

```text
langue choisie par l’utilisateur
        ↓
localStorage
        ↓
navigator.languages
        ↓
anglais
```

Les textes d’interface sont définis dans `src/i18n/messages.ts`. Les annotations emoji proviennent des données Unicode CLDR et sont générées dans un chunk indépendant pour chaque langue :

- `fr` — Français ;
- `en` — English ;
- `de` — Deutsch ;
- `it` — Italiano ;
- `es` — Español ;
- `pt` — Português.

## Données emoji

Le script `scripts/generate-emoji-data.mjs` transforme les annotations Unicode CLDR en catalogues optimisés pour l’application. Les teintes de peau sont attachées à leur emoji parent au lieu d’être affichées comme des entrées indépendantes.

```powershell
npm run data:generate
npm run data:check
```

Le manifeste généré dans `src/data/generated/manifest.json` conserve les versions Unicode et CLDR ainsi que les sources utilisées.

## Architecture

```text
src/
├── data/       # Catalogue généré, catégories et moteur de recherche
├── i18n/       # Détection de langue et textes de l’interface
├── storage/    # Récents, favoris et préférences locales
├── theme/      # Résolution clair, sombre et système
├── ui/         # Rendu progressif et interactif des résultats
├── app.ts      # Orchestration de l’application
├── main.ts     # Point d’entrée
└── styles.css  # Interface responsive desktop et mobile

scripts/        # Génération CLDR et contrôles de qualité
e2e/            # Parcours Playwright Chromium et Firefox
docs/           # Documentation de conception et notes techniques
public/         # Favicons et ressources publiques
```

L’application repose sur TypeScript et Vite, sans framework d’interface. Les catalogues de langue sont chargés dynamiquement afin de ne télécharger que les données nécessaires.

## Prérequis

- Node.js 20.19 ou plus récent ;
- npm 10 ou plus récent ;
- un navigateur moderne avec accès au presse-papiers.

## Développement

```powershell
npm install
npm run dev
```

Vite affiche l’URL locale à ouvrir dans le navigateur.

## Build

```powershell
npm run build
npm run preview
```

Le site statique est produit dans `dist/`.

## Vérification

```powershell
npm test
npm run typecheck
npm run build
npm run quality:check
npm run test:browser
npm run data:check
```

Les tests couvrent le catalogue, la recherche, les préférences locales, l’accessibilité clavier, les thèmes, le multilingue et les viewports desktop/mobile. Le contrôle de qualité impose également un budget au JavaScript et au CSS applicatifs et vérifie l’absence de tracking, de cookies et d’URL de backend.

## Confidentialité

- Aucun compte utilisateur.
- Aucun backend applicatif.
- Aucun cookie.
- Aucun tracking.
- Aucune publicité.
- Données personnelles et préférences conservées uniquement dans le navigateur.

## Choix techniques

- TypeScript et Vite.
- Données Unicode 17.0 et CLDR 48.2.
- Interface sans framework, pensée comme un véritable sélecteur d’emojis.
- Chargement différé des langues.
- Rendu progressif et confinement des éléments hors écran.
- Icônes d’interface Lucide.
- Tests Vitest, JSDOM et Playwright.

