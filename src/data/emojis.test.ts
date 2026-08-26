import { describe, expect, it } from 'vitest';
import {
  emojiCategories,
  getEmojiById,
  getEmojisByCategory,
  emojis,
  type EmojiCategoryId,
} from './emojis';

describe('generated emoji data', () => {
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
      expect(entry.name.fr.length).toBeGreaterThan(0);
      expect(entry.name.en.length).toBeGreaterThan(0);
      expect(entry.keywords.fr.length).toBeGreaterThan(0);
      expect(entry.keywords.en.length).toBeGreaterThan(0);
      expect(entry.codepoints.length).toBeGreaterThan(0);
      expect(entry.codepoints.every((codepoint) => /^U\+[0-9A-F]+$/.test(codepoint))).toBe(true);
      expect(entry.supportsSkinTone).toBe(Boolean(entry.skinToneVariants?.length));
    }
  });

  it('attaches skin-tone variants to their base emoji instead of listing them separately', () => {
    const thumbsUp = getEmojiById('thumbs-up');
    const handshake = getEmojiById('handshake');

    expect(thumbsUp?.skinToneVariants).toEqual(
      expect.arrayContaining(['👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿']),
    );
    expect(emojis.some((entry) => entry.emoji === '👍🏻')).toBe(false);
    expect(handshake?.skinToneVariants).toContain('🫱🏻‍🫲🏼');
    expect(emojis.filter((entry) => entry.supportsSkinTone).length).toBeGreaterThan(100);
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
