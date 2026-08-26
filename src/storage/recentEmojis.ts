const storageKey = 'emojideck.recents';
const recentEmojiLimit = 24;

export interface RecentEmojiStore {
  read(): string[];
  add(id: string): string[];
}

export function createRecentEmojiStore(storage: Storage | null): RecentEmojiStore {
  let recentIds = readStoredIds();

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
      return [...new Set(ids)].slice(0, recentEmojiLimit);
    } catch {
      return [];
    }
  }

  function read(): string[] {
    return [...recentIds];
  }

  function add(id: string): string[] {
    recentIds = [id, ...recentIds.filter((recentId) => recentId !== id)].slice(
      0,
      recentEmojiLimit,
    );

    try {
      storage?.setItem(storageKey, JSON.stringify(recentIds));
    } catch {
      // The in-memory list remains available for the current session.
    }

    return read();
  }

  return { read, add };
}
