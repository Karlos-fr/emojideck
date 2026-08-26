# EmojiDeck - Phase 1 Foundation

Phase 1 creates the static frontend foundation for EmojiDeck.

## Stack

- Vite
- TypeScript
- Vitest
- No frontend framework yet
- No backend
- No account system
- No cookies
- No analytics or tracking

This keeps the first implementation intentionally small. A framework can still be introduced later if the UI state becomes complex enough to justify it.

## Data Source Strategy

The project starts with a small hand-curated emoji dataset in `src/data/emojis.ts`. This seed exists only to unblock the MVP UI and tests.

The complete dataset should later come from Unicode / CLDR during Phase 9. The build pipeline should transform localized emoji annotations into one generated data file per language.

## Internal Emoji Format

Each emoji entry has:

- `id`: stable slug for app logic;
- `emoji`: copyable emoji string;
- `category`: one of the supported category ids;
- `name`: localized display name;
- `keywords`: localized search terms;
- `codepoints`: Unicode codepoints in `U+XXXX` format;
- `supportsSkinTone`: boolean for variant-aware UI;
- `skinToneVariants`: optional list of skin tone variants.

## Initial Categories

- Faces
- Animals
- Food
- Objects
- Symbols
- Flags

`Recents` and `Favoris` are user collections, not catalog categories. They remain separate app sections backed by local storage in later phases.

## Technical Goals

- 100% static app
- Zero backend
- Zero cookie
- Zero ad
- Offline-ready later through PWA
- Local-first preferences through `localStorage`
- Lightweight JavaScript outside generated emoji data
