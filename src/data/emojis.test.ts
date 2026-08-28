import { describe, expect, it } from 'vitest';
import {
  createEmojiCatalog,
  emojiCategories,
  type GeneratedEmojiData,
  type EmojiCategoryId,
} from './emojis';
import englishData from './generated/emojis.en.json';
import frenchData from './generated/emojis.fr.json';

const catalog = createEmojiCatalog(
  'fr',
  frenchData as GeneratedEmojiData,
  englishData as GeneratedEmojiData,
);
const { emojis } = catalog;

describe('generated emoji data', () => {
  it('defines the complete Unicode category set used by the picker', () => {
    expect(emojiCategories.map((category) => category.id)).toEqual([
      'faces',
      'people',
      'animals',
      'food',
      'activities',
      'travel',
      'objects',
      'symbols',
      'flags',
    ]);
  });

  it('imports the complete Unicode base set', () => {
    expect(emojis.length).toBeGreaterThan(1_800);
    expect(new Set(emojis.map((entry) => entry.id)).size).toBe(emojis.length);
    expect(new Set(emojis.map((entry) => entry.emoji)).size).toBe(emojis.length);
  });

  it('keeps every generated emoji compatible with the internal data contract', () => {
    const categoryIds = new Set<EmojiCategoryId>(
      emojiCategories.map((category) => category.id),
    );

    for (const entry of emojis) {
      expect(entry.id).toMatch(/^[a-z0-9-]+$/);
      expect(entry.emoji.length).toBeGreaterThan(0);
      expect(categoryIds.has(entry.category)).toBe(true);
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.fallbackName.length).toBeGreaterThan(0);
      expect(entry.keywords.length).toBeGreaterThan(0);
      expect(entry.fallbackKeywords.length).toBeGreaterThan(0);
      expect(entry.codepoints.length).toBeGreaterThan(0);
      expect(entry.codepoints.every((codepoint) => /^U\+[0-9A-F]+$/.test(codepoint))).toBe(true);
      expect(entry.supportsSkinTone).toBe(Boolean(entry.skinToneVariants?.length));
    }
  });

  it('attaches skin-tone variants to their base emoji instead of listing them separately', () => {
    const thumbsUp = catalog.getById('thumbs-up');
    const handshake = catalog.getById('handshake');

    expect(thumbsUp?.skinToneVariants).toEqual(
      expect.arrayContaining(['👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿']),
    );
    expect(emojis.some((entry) => entry.emoji === '👍🏻')).toBe(false);
    expect(handshake?.skinToneVariants).toContain('🫱🏻‍🫲🏼');
    expect(emojis.filter((entry) => entry.supportsSkinTone).length).toBeGreaterThan(100);
  });

  it('can retrieve one emoji by id', () => {
    expect(catalog.getById('face-with-tears-of-joy')?.emoji).toBe('😂');
  });

  it('uses English when a localized annotation is missing', () => {
    const englishEntry = (englishData as GeneratedEmojiData).emojis[0];
    const incompleteData: GeneratedEmojiData = {
      ...(frenchData as GeneratedEmojiData),
      emojis: [{ ...englishEntry, name: '', keywords: [] }],
    };
    const fallbackCatalog = createEmojiCatalog(
      'fr',
      incompleteData,
      englishData as GeneratedEmojiData,
    );

    expect(fallbackCatalog.emojis[0].name).toBe(englishEntry.name);
    expect(fallbackCatalog.emojis[0].keywords).toEqual(englishEntry.keywords);
  });

  it('can filter emojis by category', () => {
    const faces = catalog.getByCategory('faces');
    const people = catalog.getByCategory('people');
    const activities = catalog.getByCategory('activities');
    const travel = catalog.getByCategory('travel');

    expect(faces.length).toBeGreaterThan(8);
    expect(faces.every((entry) => entry.category === 'faces')).toBe(true);
    expect(people.length).toBeGreaterThan(100);
    expect(activities.length).toBeGreaterThan(50);
    expect(travel.length).toBeGreaterThan(100);
  });
});
