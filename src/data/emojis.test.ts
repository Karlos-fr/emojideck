import { describe, expect, it } from 'vitest';
import {
  emojiCategories,
  getEmojiById,
  getEmojisByCategory,
  sampleEmojis,
  type EmojiCategoryId,
} from './emojis';

describe('emoji seed data', () => {
  it('defines the compact category set used by the first UI', () => {
    expect(emojiCategories.map((category) => category.id)).toEqual([
      'faces',
      'animals',
      'food',
      'objects',
      'symbols',
      'flags',
    ]);
  });

  it('keeps every sample emoji compatible with the internal data contract', () => {
    const categoryIds = new Set<EmojiCategoryId>(
      emojiCategories.map((category) => category.id),
    );

    expect(sampleEmojis.length).toBeGreaterThanOrEqual(24);

    for (const entry of sampleEmojis) {
      expect(entry.id).toMatch(/^[a-z0-9-]+$/);
      expect(entry.emoji.length).toBeGreaterThan(0);
      expect(categoryIds.has(entry.category)).toBe(true);
      expect(entry.name.fr.length).toBeGreaterThan(0);
      expect(entry.name.en.length).toBeGreaterThan(0);
      expect(entry.keywords.fr.length).toBeGreaterThan(0);
      expect(entry.keywords.en.length).toBeGreaterThan(0);
      expect(entry.codepoints.length).toBeGreaterThan(0);
      expect(entry.codepoints.every((codepoint) => /^U\+[0-9A-F]+$/.test(codepoint))).toBe(true);
      expect(entry.supportsSkinTone).toBe(Boolean(entry.skinToneVariants?.length));
    }
  });

  it('can retrieve one emoji by id', () => {
    expect(getEmojiById('face-with-tears-of-joy')?.emoji).toBe('😂');
  });

  it('can filter emojis by category', () => {
    const faces = getEmojisByCategory('faces');

    expect(faces.length).toBeGreaterThan(8);
    expect(faces.every((entry) => entry.category === 'faces')).toBe(true);
  });
});
