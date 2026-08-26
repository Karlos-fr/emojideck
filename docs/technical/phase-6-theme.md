# Phase 6 - Theme

## Comportement

EmojiDeck propose trois preferences : `system`, `light` et `dark`. Le mode systeme
est utilise par defaut et suit en direct la media query
`(prefers-color-scheme: dark)`. Un choix manuel reste prioritaire sur les
changements de preference du systeme.

Le choix est enregistre dans `localStorage` sous la cle `emojideck.theme`. Une
valeur absente ou invalide revient au mode systeme. Si le stockage est bloque,
l'application continue de fonctionner avec la preference de la session.

## Interface

Le controle desktop est place dans la barre superieure. Sur mobile, le bouton de
menu ouvre une petite zone de preferences contenant le meme selecteur. Les deux
selecteurs sont toujours synchronises.

Le controle de langue reste visible mais desactive jusqu'a la phase multilingue.

## Implementation

`src/theme/theme.ts` isole la resolution et la persistance du theme. Il applique
sur l'element `html` :

- `data-theme-mode`, qui conserve la preference `system`, `light` ou `dark` ;
- `data-theme`, qui contient le theme effectivement affiche, `light` ou `dark`.

Les palettes dans `src/styles.css` utilisent uniquement les variables de couleur
communes. Le passage clair/sombre ne modifie donc ni la geometrie, ni les
dimensions, ni la densite de la maquette.
