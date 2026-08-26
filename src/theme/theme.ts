const storageKey = 'emojideck.theme';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface ColorSchemePreference {
  matches: boolean;
  addChangeListener(listener: (matches: boolean) => void): void;
}

export interface ThemeController {
  getMode(): ThemeMode;
  setMode(mode: ThemeMode): void;
}

interface ThemeControllerOptions {
  root: HTMLElement;
  storage: Storage | null;
  colorScheme: ColorSchemePreference;
}

export function createThemeController({
  root,
  storage,
  colorScheme,
}: ThemeControllerOptions): ThemeController {
  let systemPrefersDark = colorScheme.matches;
  let mode = readStoredMode(storage);

  function apply(): void {
    const resolvedTheme: ResolvedTheme =
      mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode;
    root.dataset.themeMode = mode;
    root.dataset.theme = resolvedTheme;
  }

  function getMode(): ThemeMode {
    return mode;
  }

  function setMode(nextMode: ThemeMode): void {
    mode = nextMode;

    try {
      storage?.setItem(storageKey, mode);
    } catch {
      // The selected mode remains active for the current session.
    }

    apply();
  }

  colorScheme.addChangeListener((matches) => {
    systemPrefersDark = matches;

    if (mode === 'system') {
      apply();
    }
  });

  apply();

  return { getMode, setMode };
}

function readStoredMode(storage: Storage | null): ThemeMode {
  try {
    const value = storage?.getItem(storageKey);
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
  } catch {
    return 'system';
  }
}
