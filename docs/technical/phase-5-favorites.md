# EmojiDeck - Phase 5 Favoris

Phase 5 permet de constituer une collection personnelle locale sans compte ni backend.

## Stockage

- cle `localStorage` : `emojideck.favorites` ;
- valeur : tableau JSON d'identifiants emoji ;
- ordre : ordre d'ajout conserve ;
- ajouter un identifiant existant le retire, puis un ajout ulterieur le place en fin ;
- les valeurs corrompues, entrees non textuelles et doublons anciens sont ignores ;
- si le stockage navigateur est bloque, les favoris restent utilisables pendant la session.

Le module `src/storage/favoriteEmojis.ts` est independant de l'interface et expose uniquement `read()` et `toggle(id)`.

## Interaction

- chaque cellule emoji contient un bouton de copie et un bouton etoile distincts ;
- l'etoile est visible au survol, au focus ou lorsque l'emoji est favori sur desktop ;
- elle reste discretement visible sur mobile pour offrir une cible tactile directe ;
- sous `360px`, la grille passe a quatre colonnes et garde l'etoile dans la largeur de sa cellule pour eviter tout chevauchement de cibles ;
- son etat est expose avec `aria-pressed` et un libelle accessible explicite ;
- ajouter ou retirer un favori ne copie pas l'emoji ;
- l'action est disponible depuis une categorie, la recherche, Recents et Favoris.

## Navigation

- `Favoris` reste visible mais desactive dans la sidebar desktop quand la collection est vide ;
- l'icone mobile apparait uniquement quand au moins un favori connu existe ;
- la vue Favoris conserve l'ordre d'ajout et permet la copie normale ;
- retirer le dernier favori depuis cette vue revient a la derniere categorie consultee.

## Verification

Les tests couvrent l'ajout, le retrait, l'ordre, la deduplication, la persistance, le fallback memoire, les etoiles depuis la recherche, les navigations desktop et mobile, la copie distincte et le retrait du dernier favori.
