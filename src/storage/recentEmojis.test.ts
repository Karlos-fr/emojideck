import { describe, expect, it } from 'vitest';
import { createRecentEmojiStore } from './recentEmojis';

describe('recent emoji storage', () => {
  it('persists at most 24 unique ids with the latest one first', () => {
    const storage = createMemoryStorage();
    const store = createRecentEmojiStore(storage);

    for (let index = 1; index <= 25; index += 1) {
      store.add(`emoji-${index}`);
    }
    store.add('emoji-10');

    expect(store.read()).toHaveLength(24);
    expect(store.read().slice(0, 3)).toEqual(['emoji-10', 'emoji-25', 'emoji-24']);
    expect(store.read()).not.toContain('emoji-1');
    expect(createRecentEmojiStore(storage).read()).toEqual(store.read());
  });

  it('ignores malformed storage values and non-string entries', () => {
    const malformedStorage = createMemoryStorage('{broken');
    const mixedStorage = createMemoryStorage(
      JSON.stringify(['fire', 42, null, 'fire', 'red-heart']),
    );

    expect(createRecentEmojiStore(malformedStorage).read()).toEqual([]);
    expect(createRecentEmojiStore(mixedStorage).read()).toEqual(['fire', 'red-heart']);
  });

  it('keeps session recents when persistent writes are rejected', () => {
    const storage = createMemoryStorage();
    storage.setItem = () => {
      throw new Error('storage denied');
    };
    const store = createRecentEmojiStore(storage);

    expect(store.add('fire')).toEqual(['fire']);
    expect(store.add('red-heart')).toEqual(['red-heart', 'fire']);
    expect(store.read()).toEqual(['red-heart', 'fire']);
  });
});

function createMemoryStorage(initialValue: string | null = null): Storage {
  const values = new Map<string, string>();

  if (initialValue !== null) {
    values.set('emojideck.recents', initialValue);
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
