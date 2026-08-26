# Phase 7 - Navigation clavier et accessibilite

## Grille emoji

Les boutons de copie restent des elements HTML `button`. `Enter` et `Space`
conservent donc leur activation native. Chaque bouton annonce explicitement
`Copier : <nom>` et chaque action Favoris annonce son etat et son action.

Le groupe de resultats porte un nom accessible correspondant a la categorie,
a la collection ou a la recherche active.

La navigation directe dans la grille utilise :

- `ArrowLeft` et `ArrowRight` pour l'emoji precedent ou suivant ;
- `ArrowUp` et `ArrowDown` pour l'emoji visuellement le plus proche dans la
  rangee adjacente ;
- `Home` et `End` pour le premier ou le dernier emoji.

Le calcul vertical repose sur la position reelle des boutons. Il reste donc
valide lorsque le nombre de colonnes change entre desktop, mobile et petits
ecrans. Aux limites, le focus reste en place et la page ne defile pas.

## Recherche

`Ctrl+F` et `Cmd+F` placent le focus dans le champ de recherche visible et
selectionnent son contenu. `Escape` vide la recherche sans remplacer le champ
ni perdre le focus.

Le resume des resultats utilise une zone `aria-live="polite"` et
`aria-atomic="true"` afin d'annoncer les mises a jour sans interrompre la
saisie.

## Categories

Dans la sidebar desktop, `ArrowUp` et `ArrowDown` ouvrent respectivement la vue
precedente ou suivante. Dans la barre mobile horizontale, la meme navigation
utilise `ArrowLeft` et `ArrowRight`. Le parcours inclut `Recents` et `Favoris`
des qu'ils sont disponibles. La categorie ou collection est activee
immediatement et le focus suit son bouton. Aux extremites, le focus reste en
place et le defilement de la page est bloque.

## Focus dynamique

Le focus est restaure apres l'ajout ou le retrait d'un favori. Lorsqu'un favori
disparait de la collection, l'action voisine recoit le focus. La copie depuis
Recents conserve egalement le focus lorsque l'ordre de la collection change.

## Validation

Les parcours et attributs accessibles sont couverts par les tests jsdom. Une
validation manuelle avec un lecteur d'ecran reste necessaire sur un poste ou
NVDA, Narrator ou VoiceOver peut etre pilote et observe.
