import { describe, expect, it } from 'vitest';
import { emojis } from './emojis';
import { normalizeSearchText, searchEmojis } from './search';

describe('emoji search', () => {
  it('normalizes case and accents for user queries', () => {
    expect(normalizeSearchText('CŒUR')).toBe('coeur');
    expect(normalizeSearchText('Étincelles')).toBe('etincelles');
  });

  it('searches French names and keywords first', () => {
    const results = searchEmojis(emojis, 'rire', 'fr');

    expect(results.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(['face-with-tears-of-joy', 'rolling-on-the-floor-laughing']),
    );
  });

  it('finds laughter emojis from the two-letter prefix ri', () => {
    const resultIds = searchEmojis(emojis, 'ri', 'fr').map((entry) => entry.id);

    expect(resultIds).toEqual(
      expect.arrayContaining([
        'face-with-tears-of-joy',
        'rolling-on-the-floor-laughing',
      ]),
    );
  });

  it('finds French queries without requiring accents', () => {
    const results = searchEmojis(emojis, 'coeur', 'fr');

    expect(results.map((entry) => entry.id)).toContain('red-heart');
    expect(results.map((entry) => entry.id)).toContain('smiling-face-with-heart-eyes');
  });

  it('falls back to English names and keywords when French has no match', () => {
    const results = searchEmojis(emojis, 'phone', 'fr');

    expect(results.map((entry) => entry.id)).toContain('mobile-phone');
  });

  it('covers the priority launch queries', () => {
    expect(searchEmojis(emojis, 'rire', 'fr').length).toBeGreaterThan(0);
    expect(searchEmojis(emojis, 'coeur', 'fr').length).toBeGreaterThan(0);
    expect(searchEmojis(emojis, 'voiture', 'fr').length).toBeGreaterThan(0);
    expect(searchEmojis(emojis, 'feu', 'fr').length).toBeGreaterThan(0);
  });
});
