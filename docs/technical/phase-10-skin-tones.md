# Phase 10 - Teintes de peau

## Donnees

Les variantes Unicode restent attachees a leur emoji parent dans `skinToneVariants`. Elles ne sont jamais ajoutees a la liste principale ni aux categories. Les emojis a une personne exposent cinq variantes uniformes. Les emojis multi-personnes peuvent aussi exposer leurs combinaisons mixtes dans le meme menu.

## Preference par defaut

La preference globale accepte six valeurs : `neutral`, `light`, `medium-light`, `medium`, `medium-dark` et `dark`. Elle est geree par `src/storage/skinTone.ts`, persistee sous la cle `emojideck.skinTone` et reste utilisable en memoire lorsque le stockage navigateur est indisponible.

La grille applique uniquement l'une des cinq premieres variantes uniformes. Les emojis incompatibles conservent leur representation neutre. La preference est partagee entre les controles desktop et mobile et reste intacte lors d'un changement de langue.

## Menu de variantes

Le menu s'ouvre depuis le bouton discret de la cellule, avec un clic secondaire sur l'emoji ou apres un appui long de 500 ms. Il contient la forme neutre, les cinq teintes uniformes et, lorsqu'elles existent, les combinaisons mixtes.

Le menu utilise un dialogue non modal nomme, des boutons avec labels localises et une navigation par fleches, `Home`, `End` et `Escape`. Choisir une variante la copie directement et ajoute l'identifiant de l'emoji parent aux recents.

## Verification

Les tests couvrent la validation et la persistance de la preference, son application dans la grille, les emojis incompatibles, les ouvertures par bouton, clic secondaire et appui long, la navigation clavier, la copie directe et le maintien des variantes mixtes sous leur emoji parent.
