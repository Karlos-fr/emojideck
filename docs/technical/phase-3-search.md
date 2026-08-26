# EmojiDeck - Phase 3 Search

Phase 3 ajoute une recherche instantanee en francais avec fallback anglais sur le jeu de donnees initial.

## Architecture

- `src/data/search.ts` normalise, classe et filtre les entrees emoji sans dependre de l'interface.
- `src/ui/emojiResults.ts` construit le titre, le resume, l'etat vide et la grille avec les API DOM.
- `src/app.ts` conserve l'etat de recherche, synchronise les champs desktop et mobile et orchestre les interactions.

Le shell de l'application est construit une seule fois. Une saisie met uniquement a jour la zone de resultats. Le champ actif reste donc le meme noeud DOM et conserve naturellement son focus ainsi que la position de son curseur.

## Securite

La requete utilisateur est affectee avec `textContent` et les attributs DOM. Elle n'est jamais concatenee dans le HTML dynamique, ce qui empeche son interpretation comme balisage.

## Verification

Les tests couvrent :

- la normalisation de la casse, des accents et des ligatures courantes ;
- les recherches prioritaires `rire`, `coeur`, `voiture` et `feu` ;
- le fallback anglais ;
- le resultat vide et la copie depuis les resultats ;
- la conservation du champ, du focus et du curseur ;
- l'absence d'interpretation HTML de la requete.
