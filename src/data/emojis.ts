import englishData from './generated/emojis.en.json';
import frenchData from './generated/emojis.fr.json';

export type LocaleCode = 'fr' | 'en';

export type EmojiCategoryId =
  | 'faces'
  | 'animals'
  | 'food'
  | 'objects'
  | 'symbols'
  | 'flags';

export type LocalizedText = Record<LocaleCode, string>;
export type LocalizedKeywords = Record<LocaleCode, string[]>;

export interface EmojiCategory {
  id: EmojiCategoryId;
  icon: string;
  label: LocalizedText;
}

export interface EmojiEntry {
  id: string;
  emoji: string;
  category: EmojiCategoryId;
  name: LocalizedText;
  keywords: LocalizedKeywords;
  codepoints: string[];
  supportsSkinTone: boolean;
  skinToneVariants?: string[];
}

interface GeneratedEmojiEntry {
  id: string;
  emoji: string;
  category: EmojiCategoryId;
  name: string;
  keywords: string[];
  codepoints: string[];
  supportsSkinTone: boolean;
  skinToneVariants?: string[];
}

export const emojiCategories: EmojiCategory[] = [
  { id: 'faces', icon: 'smile', label: { fr: 'Visages', en: 'Faces' } },
  { id: 'animals', icon: 'paw-print', label: { fr: 'Animaux', en: 'Animals' } },
  { id: 'food', icon: 'apple', label: { fr: 'Nourriture', en: 'Food' } },
  { id: 'objects', icon: 'briefcase', label: { fr: 'Objets', en: 'Objects' } },
  { id: 'symbols', icon: 'sparkles', label: { fr: 'Symboles', en: 'Symbols' } },
  { id: 'flags', icon: 'flag', label: { fr: 'Drapeaux', en: 'Flags' } },
];

const frenchById = new Map(
  (frenchData.emojis as GeneratedEmojiEntry[]).map((entry) => [entry.id, entry]),
);

export const emojis: EmojiEntry[] = (englishData.emojis as GeneratedEmojiEntry[]).map(
  (englishEntry) => {
    const frenchEntry = frenchById.get(englishEntry.id);

    if (!frenchEntry) {
      throw new Error(`Missing French emoji data for ${englishEntry.id}`);
    }

    return {
      id: englishEntry.id,
      emoji: englishEntry.emoji,
      category: englishEntry.category,
      name: { fr: frenchEntry.name, en: englishEntry.name },
      keywords: { fr: frenchEntry.keywords, en: englishEntry.keywords },
      codepoints: englishEntry.codepoints,
      supportsSkinTone: englishEntry.supportsSkinTone,
      ...(englishEntry.skinToneVariants
        ? { skinToneVariants: englishEntry.skinToneVariants }
        : {}),
    };
  },
);

const emojisById = new Map(emojis.map((entry) => [entry.id, entry]));
const emojisByCategory = new Map(
  emojiCategories.map((category) => [
    category.id,
    emojis.filter((entry) => entry.category === category.id),
  ]),
);

export function getEmojiById(id: string): EmojiEntry | undefined {
  return emojisById.get(id);
}

export function getEmojisByCategory(category: EmojiCategoryId): EmojiEntry[] {
  return emojisByCategory.get(category) ?? [];
}
