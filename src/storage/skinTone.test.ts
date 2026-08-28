import { describe, expect, it } from 'vitest';
import { applySkinTone, createSkinToneStore } from './skinTone';

describe('skin tone preference', () => {
  it('persists a supported preference', () => {
    const storage = createMemoryStorage();
    const store = createSkinToneStore(storage);

    store.write('medium-dark');

    expect(store.read()).toBe('medium-dark');
    expect(createSkinToneStore(storage).read()).toBe('medium-dark');
  });

  it('falls back to neutral for unavailable, malformed or inaccessible storage', () => {
    const malformed = createMemoryStorage('unsupported');
    expect(createSkinToneStore(malformed).read()).toBe('neutral');
    expect(createSkinToneStore(null).read()).toBe('neutral');

    malformed.getItem = () => {
      throw new Error('storage denied');
    };
    expect(createSkinToneStore(malformed).read()).toBe('neutral');
  });

  it('keeps a session preference when storage writes fail', () => {
    const storage = createMemoryStorage();
    storage.setItem = () => {
      throw new Error('storage denied');
    };
    const store = createSkinToneStore(storage);

    store.write('dark');

    expect(store.read()).toBe('dark');
  });

  it('applies the matching uniform variant without expanding mixed variants', () => {
    const variants = ['👋🏻', '👋🏼', '👋🏽', '👋🏾', '👋🏿', 'mixed'];

    expect(applySkinTone('👋', variants, 'neutral')).toBe('👋');
    expect(applySkinTone('👋', variants, 'medium')).toBe('👋🏽');
    expect(applySkinTone('👋', variants, 'dark')).toBe('👋🏿');
    expect(applySkinTone('🔥', undefined, 'dark')).toBe('🔥');
  });
});

function createMemoryStorage(initialValue: string | null = null): Storage {
  const values = new Map<string, string>();
  if (initialValue !== null) {
    values.set('emojideck.skinTone', initialValue);
  }

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}
