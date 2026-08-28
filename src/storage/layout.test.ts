import { describe, expect, it } from 'vitest';
import { createLayoutStore } from './layout';

describe('layout preference', () => {
  it('persists the expanded state', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    } as unknown as Storage;
    const store = createLayoutStore(storage);

    store.writeExpanded(true);

    expect(store.readExpanded()).toBe(true);
    expect(createLayoutStore(storage).readExpanded()).toBe(true);
  });

  it('falls back to the compact layout when storage is unavailable', () => {
    const storage = {
      getItem: () => {
        throw new Error('storage denied');
      },
      setItem: () => {
        throw new Error('storage denied');
      },
    } as unknown as Storage;

    expect(createLayoutStore(null).readExpanded()).toBe(false);
    expect(createLayoutStore(storage).readExpanded()).toBe(false);
    expect(() => createLayoutStore(storage).writeExpanded(true)).not.toThrow();
  });
});
