import type { EmojiEntry, LocaleCode } from './emojis';

const fallbackLocale: LocaleCode = 'en';

export function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase()
    .replaceAll('œ', 'oe')
    .replaceAll('æ', 'ae')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

export function searchEmojis(
  emojis: EmojiEntry[],
  rawQuery: string,
  locale: LocaleCode,
): EmojiEntry[] {
  const query = normalizeSearchText(rawQuery);

  if (!query) {
    return [];
  }

  return emojis
    .map((entry) => ({ entry, score: scoreEmoji(entry, query, locale) }))
    .filter((result) => result.score > 0)
    .sort((first, second) => second.score - first.score)
    .map((result) => result.entry);
}

function scoreEmoji(entry: EmojiEntry, query: string, locale: LocaleCode): number {
  const localizedScore = scoreFields(entry, query, locale, 100);
  const fallbackScore =
    locale === fallbackLocale ? 0 : scoreFields(entry, query, fallbackLocale, 40);

  return Math.max(localizedScore, fallbackScore);
}

function scoreFields(
  entry: EmojiEntry,
  query: string,
  locale: LocaleCode,
  baseScore: number,
): number {
  const name = normalizeSearchText(entry.name[locale]);
  const keywords = entry.keywords[locale].map(normalizeSearchText);
  const nameTokens = tokenize(name);
  const keywordTokens = keywords.flatMap(tokenize);

  if (name === query) {
    return baseScore + 30;
  }

  if (keywords.includes(query)) {
    return baseScore + 20;
  }

  if (nameTokens.includes(query)) {
    return baseScore + 10;
  }

  if (keywordTokens.includes(query)) {
    return baseScore;
  }

  if (query.length >= 2 && [...nameTokens, ...keywordTokens].some((token) => token.startsWith(query))) {
    return baseScore;
  }

  return 0;
}

function tokenize(value: string): string[] {
  return value.split(/[^a-z0-9]+/).filter(Boolean);
}
