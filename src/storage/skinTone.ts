export const skinTonePreferences = [
  'neutral',
  'light',
  'medium-light',
  'medium',
  'medium-dark',
  'dark',
] as const;

export type SkinTonePreference = (typeof skinTonePreferences)[number];

const storageKey = 'emojideck.skinTone';

export interface SkinToneStore {
  read(): SkinTonePreference;
  write(preference: SkinTonePreference): void;
}

export function createSkinToneStore(storage: Storage | null): SkinToneStore {
  let preference = readStoredPreference(storage);

  return {
    read: () => preference,
    write: (nextPreference) => {
      preference = skinTonePreferences.includes(nextPreference) ? nextPreference : 'neutral';

      try {
        storage?.setItem(storageKey, preference);
      } catch {
        // The preference remains available for the current session.
      }
    },
  };
}

export function applySkinTone(
  emoji: string,
  variants: readonly string[] | undefined,
  preference: SkinTonePreference,
): string {
  if (preference === 'neutral' || !variants || variants.length < 5) {
    return emoji;
  }

  const index = skinTonePreferences.indexOf(preference) - 1;
  return variants[index] ?? emoji;
}

function readStoredPreference(storage: Storage | null): SkinTonePreference {
  if (!storage) {
    return 'neutral';
  }

  try {
    const value = storage.getItem(storageKey);
    return skinTonePreferences.includes(value as SkinTonePreference)
      ? (value as SkinTonePreference)
      : 'neutral';
  } catch {
    return 'neutral';
  }
}
