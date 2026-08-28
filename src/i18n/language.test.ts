import { describe, expect, it, vi } from 'vitest';
import { languageStorageKey, resolveLocale, saveLocale } from './language';

describe('language preference', () => {
  it('gives a stored supported language priority over browser detection', () => {
    const storage = { getItem: vi.fn().mockReturnValue('it') };

    expect(resolveLocale(storage, ['de-DE', 'en'])).toBe('it');
  });

  it('detects the first supported base language from navigator.languages', () => {
    expect(resolveLocale(null, ['nl-BE', 'pt-BR', 'fr-FR'])).toBe('pt');
  });

  it('falls back to English for unknown or inaccessible preferences', () => {
    const storage = { getItem: vi.fn(() => { throw new DOMException('blocked'); }) };

    expect(resolveLocale(storage, ['ja-JP'])).toBe('en');
  });

  it('persists a manual choice without failing when storage is blocked', () => {
    const storage = { setItem: vi.fn() };

    saveLocale(storage, 'es');
    expect(storage.setItem).toHaveBeenCalledWith(languageStorageKey, 'es');
    expect(() => saveLocale({ setItem: () => { throw new DOMException('blocked'); } }, 'de')).not.toThrow();
  });
});
