import type { EmojiEntry } from './emojis';

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
): EmojiEntry[] {
  const query = normalizeSearchText(rawQuery);

  if (!query) {
    return [];
  }

  return emojis
    .map((entry) => ({ entry, score: scoreEmoji(entry, query) }))
    .filter((result) => result.score > 0)
    .sort((first, second) => second.score - first.score)
    .map((result) => result.entry);
}

function scoreEmoji(entry: EmojiEntry, query: string): number {
  const localizedScore = scoreFields(entry.name, entry.keywords, query, 100);
  const fallbackScore = scoreFields(entry.fallbackName, entry.fallbackKeywords, query, 40);

  return Math.max(localizedScore, fallbackScore);
}

function scoreFields(
  localizedName: string,
  localizedKeywords: string[],
  query: string,
  baseScore: number,
): number {
  const name = normalizeSearchText(localizedName);
  const keywords = localizedKeywords.map(normalizeSearchText);
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
