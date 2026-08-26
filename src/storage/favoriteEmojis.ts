const storageKey = 'emojideck.favorites';

export interface FavoriteEmojiStore {
  read(): string[];
  toggle(id: string): string[];
}

export function createFavoriteEmojiStore(storage: Storage | null): FavoriteEmojiStore {
  let favoriteIds = readStoredIds();

  function readStoredIds(): string[] {
    if (!storage) {
      return [];
    }

    try {
      const value: unknown = JSON.parse(storage.getItem(storageKey) ?? '[]');

      if (!Array.isArray(value)) {
        return [];
      }

      const ids = value.filter((id): id is string => typeof id === 'string');
      return [...new Set(ids)];
    } catch {
      return [];
    }
  }

  function read(): string[] {
    return [...favoriteIds];
  }

  function toggle(id: string): string[] {
    favoriteIds = favoriteIds.includes(id)
      ? favoriteIds.filter((favoriteId) => favoriteId !== id)
      : [...favoriteIds, id];

    try {
      storage?.setItem(storageKey, JSON.stringify(favoriteIds));
    } catch {
      // The in-memory list remains available for the current session.
    }

    return read();
  }

  return { read, toggle };
}
