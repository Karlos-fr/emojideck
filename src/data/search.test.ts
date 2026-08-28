import { describe, expect, it } from 'vitest';
import { createEmojiCatalog, type GeneratedEmojiData } from './emojis';
import germanData from './generated/emojis.de.json';
import englishData from './generated/emojis.en.json';
import spanishData from './generated/emojis.es.json';
import frenchData from './generated/emojis.fr.json';
import italianData from './generated/emojis.it.json';
import portugueseData from './generated/emojis.pt.json';
import { normalizeSearchText, searchEmojis } from './search';

const generatedByLocale = {
  fr: frenchData,
  en: englishData,
  de: germanData,
  it: italianData,
  es: spanishData,
  pt: portugueseData,
} as const;
const catalogFor = (locale: keyof typeof generatedByLocale) =>
  createEmojiCatalog(
    locale,
    generatedByLocale[locale] as GeneratedEmojiData,
    englishData as GeneratedEmojiData,
  );
const emojis = catalogFor('fr').emojis;

describe('emoji search', () => {
  it('normalizes case and accents for user queries', () => {
    expect(normalizeSearchText('CŒUR')).toBe('coeur');
    expect(normalizeSearchText('Étincelles')).toBe('etincelles');
  });

  it('searches French names and keywords first', () => {
    const results = searchEmojis(emojis, 'rire');

    expect(results.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(['face-with-tears-of-joy', 'rolling-on-the-floor-laughing']),
    );
  });

  it('finds laughter emojis from the two-letter prefix ri', () => {
    const resultIds = searchEmojis(emojis, 'ri').map((entry) => entry.id);

    expect(resultIds).toEqual(
      expect.arrayContaining([
        'face-with-tears-of-joy',
        'rolling-on-the-floor-laughing',
      ]),
    );
  });

  it('finds French queries without requiring accents', () => {
    const results = searchEmojis(emojis, 'coeur');

    expect(results.map((entry) => entry.id)).toContain('red-heart');
    expect(results.map((entry) => entry.id)).toContain('smiling-face-with-heart-eyes');
  });

  it('falls back to English names and keywords when French has no match', () => {
    const results = searchEmojis(emojis, 'phone');

    expect(results.map((entry) => entry.id)).toContain('mobile-phone');
  });

  it('covers the priority launch queries', () => {
    expect(searchEmojis(emojis, 'rire').length).toBeGreaterThan(0);
    expect(searchEmojis(emojis, 'coeur').length).toBeGreaterThan(0);
    expect(searchEmojis(emojis, 'voiture').length).toBeGreaterThan(0);
    expect(searchEmojis(emojis, 'feu').length).toBeGreaterThan(0);
  });

  it.each([
    ['fr', 'rire'],
    ['en', 'laugh'],
    ['de', 'lachen'],
    ['it', 'ridere'],
    ['es', 'risa'],
    ['pt', 'rir'],
  ] as const)('searches CLDR annotations in %s', (locale, query) => {
    expect(searchEmojis(catalogFor(locale).emojis, query).length).toBeGreaterThan(0);
  });
});
