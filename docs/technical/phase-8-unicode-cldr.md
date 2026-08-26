# Phase 8 - Import Unicode / CLDR

## Sources versionnees

Le generateur utilise uniquement des sources officielles et fige leurs versions :

- Unicode Emoji 17.0.0 : `emoji-test.txt` fournit les sequences qualifiees, leur ordre et leur groupe ;
- CLDR JSON 48.2.0 : `cldr-annotations-full` fournit les noms courts et mots-cles ;
- CLDR JSON 48.2.0 : `cldr-annotations-derived-full` complete les sequences derivees, notamment les drapeaux et variantes.

Les URL exactes sont centralisees dans `scripts/generate-emoji-data.mjs` et recopiees dans le manifeste genere.

## Generation

```sh
npm run data:generate
```

Cette commande telecharge les sources versionnees, valide leur contenu et genere :

- `src/data/generated/emojis.fr.json` ;
- `src/data/generated/emojis.en.json` ;
- `src/data/generated/manifest.json`.

Les fichiers generes sont suivis par Git. Le site reste donc entierement statique et ne contacte ni Unicode ni CLDR a l'execution.

Pour verifier que les fichiers suivis sont reproductibles et a jour sans les modifier :

```sh
npm run data:check
```

## Modele de donnees

Chaque fichier localise contient le nom et les mots-cles de sa langue, ainsi que les champs structurels communs : identifiant stable, emoji, categorie, codepoints et variantes de teinte.

Les groupes Unicode sont regroupes dans les six categories de la maquette :

| Groupe Unicode | Categorie EmojiDeck |
| --- | --- |
| Smileys & Emotion, People & Body | `faces` |
| Animals & Nature | `animals` |
| Food & Drink | `food` |
| Travel & Places, Activities, Objects | `objects` |
| Symbols | `symbols` |
| Flags | `flags` |

Les sequences avec teinte de peau ne sont pas ajoutees a la grille principale. Elles sont rattachees a leur emoji de base dans `skinToneVariants`, y compris les sequences mixtes et les anciennes sequences Unicode possedant un codepoint de base distinct.

## Controles

La generation echoue si :

- une source distante est indisponible ;
- un groupe Unicode n'a pas de categorie EmojiDeck ;
- une variante de peau ne peut pas etre rattachee a une base ;
- un emoji n'a pas d'identifiant, de nom, de mots-cles, de categorie ou de codepoint ;
- des identifiants sont dupliques ;
- le corpus contient moins de 1 800 emojis de base.

Pour Unicode 17.0.0, le manifeste attendu contient 1 914 emojis de base et 2 030 variantes de teinte.
