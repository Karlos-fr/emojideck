import { describe, expect, it } from 'vitest';
import { createFavoriteEmojiStore } from './favoriteEmojis';

describe('favorite emoji storage', () => {
  it('toggles favorites while preserving their order of addition', () => {
    const storage = createMemoryStorage();
    const store = createFavoriteEmojiStore(storage);

    expect(store.toggle('fire')).toEqual(['fire']);
    expect(store.toggle('red-heart')).toEqual(['fire', 'red-heart']);
    expect(store.toggle('fire')).toEqual(['red-heart']);
    expect(store.toggle('fire')).toEqual(['red-heart', 'fire']);
    expect(createFavoriteEmojiStore(storage).read()).toEqual(['red-heart', 'fire']);
  });

  it('sanitizes stored values and keeps session favorites when writes fail', () => {
    const storage = createMemoryStorage(
      JSON.stringify(['fire', 42, 'fire', null, 'red-heart']),
    );
    storage.setItem = () => {
      throw new Error('storage denied');
    };
    const store = createFavoriteEmojiStore(storage);

    expect(store.read()).toEqual(['fire', 'red-heart']);
    expect(store.toggle('party-popper')).toEqual(['fire', 'red-heart', 'party-popper']);
    expect(store.toggle('fire')).toEqual(['red-heart', 'party-popper']);
    expect(store.read()).toEqual(['red-heart', 'party-popper']);
  });

  it('starts empty when storage is unavailable or malformed', () => {
    expect(createFavoriteEmojiStore(null).read()).toEqual([]);
    expect(createFavoriteEmojiStore(createMemoryStorage('{broken')).read()).toEqual([]);
  });
});

function createMemoryStorage(initialValue: string | null = null): Storage {
  const values = new Map<string, string>();

  if (initialValue !== null) {
    values.set('emojideck.favorites', initialValue);
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
