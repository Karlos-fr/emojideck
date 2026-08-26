/* @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import {
  createThemeController,
  type ColorSchemePreference,
} from './theme';

describe('theme controller', () => {
  it('defaults to system and follows color scheme changes', () => {
    const root = document.createElement('div');
    const colorScheme = new FakeColorScheme(true);
    const controller = createThemeController({ root, storage: null, colorScheme });

    expect(controller.getMode()).toBe('system');
    expect(root.dataset.themeMode).toBe('system');
    expect(root.dataset.theme).toBe('dark');

    colorScheme.setMatches(false);

    expect(root.dataset.theme).toBe('light');
  });

  it('persists a manual choice and keeps it above system changes', () => {
    const storage = createMemoryStorage();
    const root = document.createElement('div');
    const colorScheme = new FakeColorScheme(true);
    const controller = createThemeController({ root, storage, colorScheme });

    controller.setMode('light');
    colorScheme.setMatches(true);

    expect(root.dataset.theme).toBe('light');
    expect(storage.getItem('emojideck.theme')).toBe('light');

    const restoredRoot = document.createElement('div');
    const restored = createThemeController({ root: restoredRoot, storage, colorScheme });
    expect(restored.getMode()).toBe('light');
    expect(restoredRoot.dataset.theme).toBe('light');
  });

  it('falls back to system for invalid values and survives rejected writes', () => {
    const storage = createMemoryStorage('sepia');
    const originalSetItem = storage.setItem;
    storage.setItem = () => {
      throw new Error('storage denied');
    };
    const root = document.createElement('div');
    const controller = createThemeController({
      root,
      storage,
      colorScheme: new FakeColorScheme(false),
    });

    expect(controller.getMode()).toBe('system');
    expect(() => controller.setMode('dark')).not.toThrow();
    expect(controller.getMode()).toBe('dark');
    expect(root.dataset.theme).toBe('dark');

    storage.setItem = originalSetItem;
  });
});

class FakeColorScheme implements ColorSchemePreference {
  private listeners: Array<(matches: boolean) => void> = [];

  constructor(public matches: boolean) {}

  addChangeListener(listener: (matches: boolean) => void): void {
    this.listeners.push(listener);
  }

  setMatches(matches: boolean): void {
    this.matches = matches;
    this.listeners.forEach((listener) => listener(matches));
  }
}

function createMemoryStorage(initialValue: string | null = null): Storage {
  const values = new Map<string, string>();

  if (initialValue !== null) {
    values.set('emojideck.theme', initialValue);
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
