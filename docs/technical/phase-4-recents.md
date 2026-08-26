# EmojiDeck - Phase 4 Recents

Phase 4 conserve localement les emojis copies avec succes afin de rendre les usages repetitifs plus rapides.

## Stockage

- cle `localStorage` : `emojideck.recents` ;
- valeur : tableau JSON d'identifiants emoji ;
- limite : 24 identifiants ;
- ordre : emoji le plus recemment copie en premier ;
- un identifiant deja present est deplace en tete sans doublon ;
- les valeurs corrompues et les entrees non textuelles sont ignorees ;
- les doublons provenant d'une ancienne valeur sont supprimes a la lecture.

Le module `src/storage/recentEmojis.ts` ne depend pas de l'interface. Il retourne aussi la liste mise a jour lorsque le navigateur refuse l'ecriture, afin que la session courante reste utilisable.

Si l'acces a `window.localStorage` lui-meme est bloque, l'application demarre avec un stockage en memoire pour la session au lieu d'echouer completement.

## Interface

- l'entree desktop `Recents` reste visible mais desactivee lorsque la collection est vide ;
- l'icone mobile apparait uniquement apres la premiere copie reussie ;
- selectionner `Recents` ferme la recherche active et affiche une grille dediee ;
- les identifiants inconnus dans une ancienne valeur sont ignores par la grille ;
- copier depuis la grille deplace immediatement l'emoji en tete ;
- une copie refusee par le presse-papiers n'est jamais enregistree.

## Verification

Les tests couvrent la persistance, la limite, la deduplication, les donnees corrompues, les navigations desktop et mobile, la restauration apres recreation de l'application, la copie depuis la collection et l'echec du presse-papiers.
