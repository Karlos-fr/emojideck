import type { LocaleCode } from '../i18n/language';

export type EmojiCategoryId =
  | 'faces'
  | 'people'
  | 'animals'
  | 'food'
  | 'activities'
  | 'travel'
  | 'objects'
  | 'symbols'
  | 'flags';

export interface EmojiCategory {
  id: EmojiCategoryId;
  icon: string;
}

export interface EmojiEntry {
  id: string;
  emoji: string;
  category: EmojiCategoryId;
  name: string;
  keywords: string[];
  fallbackName: string;
  fallbackKeywords: string[];
  codepoints: string[];
  supportsSkinTone: boolean;
  skinToneVariants?: string[];
}

export interface GeneratedEmojiEntry {
  id: string;
  emoji: string;
  category: EmojiCategoryId;
  name: string;
  keywords: string[];
  codepoints: string[];
  supportsSkinTone: boolean;
  skinToneVariants?: string[];
}

export interface GeneratedEmojiData {
  locale: LocaleCode;
  unicodeVersion: string;
  cldrVersion: string;
  emojis: GeneratedEmojiEntry[];
}

export interface EmojiCatalog {
  locale: LocaleCode;
  emojis: EmojiEntry[];
  getById(id: string): EmojiEntry | undefined;
  getByCategory(category: EmojiCategoryId): EmojiEntry[];
}

export const emojiCategories: EmojiCategory[] = [
  { id: 'faces', icon: '☺' },
  { id: 'people', icon: '♙' },
  { id: 'animals', icon: '♧' },
  { id: 'food', icon: '♢' },
  { id: 'activities', icon: '◉' },
  { id: 'travel', icon: '✈' },
  { id: 'objects', icon: '▣' },
  { id: 'symbols', icon: '✧' },
  { id: 'flags', icon: '⚑' },
];

const dataLoaders: Record<LocaleCode, () => Promise<GeneratedEmojiData>> = {
  fr: () => import('./generated/emojis.fr.json').then((module) => module.default as GeneratedEmojiData),
  en: () => import('./generated/emojis.en.json').then((module) => module.default as GeneratedEmojiData),
  de: () => import('./generated/emojis.de.json').then((module) => module.default as GeneratedEmojiData),
  it: () => import('./generated/emojis.it.json').then((module) => module.default as GeneratedEmojiData),
  es: () => import('./generated/emojis.es.json').then((module) => module.default as GeneratedEmojiData),
  pt: () => import('./generated/emojis.pt.json').then((module) => module.default as GeneratedEmojiData),
};

const dataPromises = new Map<LocaleCode, Promise<GeneratedEmojiData>>();
const catalogPromises = new Map<LocaleCode, Promise<EmojiCatalog>>();

export function loadEmojiCatalog(locale: LocaleCode): Promise<EmojiCatalog> {
  const cached = catalogPromises.get(locale);
  if (cached) {
    return cached;
  }

  const promise = loadEmojiData(locale)
    .then(async (localizedData) => {
      const englishData = hasMissingAnnotations(localizedData)
        ? await loadEmojiData('en')
        : localizedData;
      return createEmojiCatalog(locale, localizedData, englishData);
    })
    .catch(async () => {
      const englishData = await loadEmojiData('en');
      return createEmojiCatalog(locale, englishData, englishData);
    });
  const retryablePromise = promise.catch((error: unknown) => {
    catalogPromises.delete(locale);
    throw error;
  });
  catalogPromises.set(locale, retryablePromise);
  return retryablePromise;
}

function hasMissingAnnotations(data: GeneratedEmojiData): boolean {
  return data.emojis.some(
    (entry) => entry.name.trim().length === 0 || entry.keywords.length === 0,
  );
}

export function createEmojiCatalog(
  locale: LocaleCode,
  localizedData: GeneratedEmojiData,
  englishData: GeneratedEmojiData,
): EmojiCatalog {
  const englishById = new Map(englishData.emojis.map((entry) => [entry.id, entry]));
  const emojis = localizedData.emojis.map((localizedEntry) => {
    const englishEntry = englishById.get(localizedEntry.id) ?? localizedEntry;

    return {
      ...localizedEntry,
      name: localizedEntry.name || englishEntry.name,
      keywords: localizedEntry.keywords.length > 0 ? localizedEntry.keywords : englishEntry.keywords,
      fallbackName: englishEntry.name,
      fallbackKeywords: englishEntry.keywords,
    };
  });
  const byId = new Map(emojis.map((entry) => [entry.id, entry]));
  const byCategory = new Map(
    emojiCategories.map((category) => [
      category.id,
      emojis.filter((entry) => entry.category === category.id),
    ]),
  );

  return {
    locale,
    emojis,
    getById: (id) => byId.get(id),
    getByCategory: (category) => byCategory.get(category) ?? [],
  };
}

function loadEmojiData(locale: LocaleCode): Promise<GeneratedEmojiData> {
  const cached = dataPromises.get(locale);
  if (cached) {
    return cached;
  }

  const promise = dataLoaders[locale]().catch((error: unknown) => {
    dataPromises.delete(locale);
    throw error;
  });
  dataPromises.set(locale, promise);
  return promise;
}
