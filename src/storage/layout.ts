const expandedStorageKey = 'emojideck.expanded';

export interface LayoutStore {
  readExpanded(): boolean;
  writeExpanded(expanded: boolean): void;
}

export function createLayoutStore(storage: Storage | null): LayoutStore {
  return {
    readExpanded(): boolean {
      try {
        return storage?.getItem(expandedStorageKey) === 'true';
      } catch {
        return false;
      }
    },
    writeExpanded(expanded: boolean): void {
      try {
        storage?.setItem(expandedStorageKey, String(expanded));
      } catch {
        // The layout remains usable when storage is unavailable.
      }
    },
  };
}
