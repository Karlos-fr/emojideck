export const supportedLocales = ['fr', 'en', 'de', 'it', 'es', 'pt'] as const;
export type LocaleCode = (typeof supportedLocales)[number];

export const languageStorageKey = 'emojideck.language';

export function resolveLocale(
  storage: Pick<Storage, 'getItem'> | null,
  browserLanguages: readonly string[],
): LocaleCode {
  const storedLocale = normalizeLocale(readStoredLocale(storage));

  if (storedLocale) {
    return storedLocale;
  }

  for (const language of browserLanguages) {
    const locale = normalizeLocale(language);
    if (locale) {
      return locale;
    }
  }

  return 'en';
}

export function saveLocale(
  storage: Pick<Storage, 'setItem'> | null,
  locale: LocaleCode,
): void {
  try {
    storage?.setItem(languageStorageKey, locale);
  } catch {
    // A blocked storage must not prevent changing language for the current session.
  }
}

function readStoredLocale(storage: Pick<Storage, 'getItem'> | null): string | null {
  try {
    return storage?.getItem(languageStorageKey) ?? null;
  } catch {
    return null;
  }
}

function normalizeLocale(value: string | null): LocaleCode | null {
  const baseLocale = value?.trim().toLocaleLowerCase().split('-')[0];

  return supportedLocales.find((locale) => locale === baseLocale) ?? null;
}
