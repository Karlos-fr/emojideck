# Phase 9 - Multilingue complet

## Langues prises en charge

EmojiDeck prend en charge le francais (`fr`), l'anglais (`en`), l'allemand (`de`), l'italien (`it`), l'espagnol (`es`) et le portugais (`pt`). Les variantes regionales du navigateur sont ramenees a leur langue de base, par exemple `pt-BR` vers `pt`.

## Resolution de la langue

La langue active suit cet ordre de priorite :

1. choix manuel valide enregistre dans `emojideck.language` ;
2. premiere langue compatible de `navigator.languages` ;
3. anglais.

Un stockage indisponible ou corrompu ne bloque pas l'application. Le choix manuel reste utilisable pour la session courante meme si `localStorage` refuse l'ecriture.

## Chargement des donnees

Chaque fichier CLDR genere est importe dynamiquement par `src/data/emojis.ts`. L'anglais est charge comme index de fallback, puis seule la langue active est demandee. En anglais, un seul index est necessaire. Les autres langues restent dans des chunks distincts et ne sont pas telechargees tant qu'elles ne sont pas choisies.

Le catalogue actif contient les noms et mots-cles localises ainsi que les champs anglais de secours. Si une annotation locale est absente, son nom et ses mots-cles anglais sont utilises.

## Interface

Les textes, categories, collections, themes, recherche, etats vides, actions Favoris, messages de copie et libelles accessibles sont traduits dans `src/i18n/messages.ts`. Les selecteurs desktop et mobile restent synchronises et `document.documentElement.lang` suit la langue active.

Changer de langue remplace uniquement le catalogue et les textes affiches. La recherche est reevaluee dans la nouvelle langue, tandis que le theme, les emojis recents et les favoris restent dans leurs stores existants.

## Verification

Les tests couvrent la detection, la priorite de la preference, la persistance, le stockage bloque, le fallback anglais, les recherches CLDR dans les six langues, la synchronisation des selecteurs et la conservation de Recents, Favoris et theme pendant un changement de langue.
