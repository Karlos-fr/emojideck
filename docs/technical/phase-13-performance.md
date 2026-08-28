# Phase 13 - Performance et finition

## Budgets de production

Apres build, le JavaScript applicatif hors catalogues pese 10,08 Kio gzip et la feuille de styles 3,10 Kio gzip. `npm run quality:check` impose des budgets respectifs de 15 Kio et 5 Kio afin de detecter les regressions.

Les six catalogues restent des chunks independants. Avant cette phase, une ouverture en francais chargeait les chunks francais et anglais, soit 149,09 Kio gzip. Le chargement normal ne recupere maintenant que le francais, soit 79,65 Kio gzip : une reduction de 46,6 % des donnees initiales. Le catalogue anglais n'est charge qu'en cas d'echec de la langue active ou d'annotation manquante.

## Rendu de la grille

La plus grande categorie Unicode actuelle contient 388 emojis. Les cellules sont rendues progressivement par lots de 24 sur desktop et 20 sur mobile. L'observateur de la zone de scroll revele les lots suivants a l'approche du bas de la grille. La touche `End` materialise immediatement le reste de la grille avant de placer le focus sur le dernier emoji ; `ArrowDown` revele aussi un lot supplementaire lorsque la navigation atteint la limite courante.

Les cellules et boutons conservent des dimensions fixes sur desktop et mobile. `content-visibility` et le confinement CSS evitent le rendu des cellules hors ecran. Les actions favorite et teinte restent dans les limites de leur cellule.

Le premier rendu coute surtout la rasterisation des glyphes couleur par le navigateur, et non la creation du DOM. Les 24 premiers glyphes des categories sont donc rechauffes sur un canvas, un par un pendant les creneaux inactifs. En mesure Chromium locale, le premier affichage de `Personnes` passe d'environ 750 ms a 2-3 ms apres 500 ms d'inactivite, sans introduire de longue tache prioritaire.

Les catalogues de langue restent absents du chargement initial. Ils sont precharges uniquement lorsque l'utilisateur focalise ou ouvre le selecteur de langue. Dans la meme mesure locale, un passage au catalogue allemand tombe d'environ 650-700 ms a 50-65 ms lorsque le selecteur est reste ouvert 300 ms.

## Etats et reprise

L'application affiche desormais un shell de chargement localise pendant l'import du catalogue. Si le catalogue et son fallback echouent, un etat d'erreur localise propose une reprise. Les promesses d'import rejetees sont retirees du cache pour que cette reprise puisse reellement relancer le chargement.

Les etats sans resultat et les resumes de recherche ont aussi un espacement, une couleur secondaire et des dimensions stables dans les themes clair et sombre. Les animations sont ralenties et les transitions secondaires retirees lorsque `prefers-reduced-motion` est actif.

## Verification navigateur

`npm run test:browser` execute Playwright dans Chromium et Firefox. Les parcours couvrent les viewports 320x640, 390x844, 1024x768 et 1440x900, l'absence de debordement de page, la stabilite des boutons, le chargement a la demande des langues et les ressources same-origin.

`npm run quality:check` verifie egalement qu'aucun acces aux cookies, domaine de tracking ou URL de backend n'est present dans le code applicatif `src`.

Commandes de validation :

```text
npm test
npm run typecheck
npm run build
npm run quality:check
npm run test:browser
npm run data:check
```
