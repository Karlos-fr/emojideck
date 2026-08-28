/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmojiDeckApp as mountEmojiDeckApp, initializeEmojiDeckApp } from './app';
import { createEmojiCatalog, type EmojiCatalog, type GeneratedEmojiData } from './data/emojis';
import germanData from './data/generated/emojis.de.json';
import englishData from './data/generated/emojis.en.json';
import spanishData from './data/generated/emojis.es.json';
import frenchData from './data/generated/emojis.fr.json';
import italianData from './data/generated/emojis.it.json';
import portugueseData from './data/generated/emojis.pt.json';
import type { LocaleCode } from './i18n/language';

const localizedData: Record<LocaleCode, GeneratedEmojiData> = {
  fr: frenchData as GeneratedEmojiData,
  en: englishData as GeneratedEmojiData,
  de: germanData as GeneratedEmojiData,
  it: italianData as GeneratedEmojiData,
  es: spanishData as GeneratedEmojiData,
  pt: portugueseData as GeneratedEmojiData,
};
const catalogs = Object.fromEntries(
  Object.entries(localizedData).map(([locale, data]) => [
    locale,
    createEmojiCatalog(locale as LocaleCode, data, localizedData.en),
  ]),
) as Record<LocaleCode, EmojiCatalog>;

function createEmojiDeckApp(root: HTMLElement): void {
  mountEmojiDeckApp(root, {
    locale: 'fr',
    catalog: catalogs.fr,
    loadCatalog: async (locale) => catalogs[locale],
  });
}

describe('EmojiDeck MVP app', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.themeMode;

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('keeps headers fixed around a dedicated central scroll region', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const scroller = document.querySelector<HTMLElement>('.content-scroll')!;

    expect(scroller.contains(document.querySelector('.desktop-topbar'))).toBe(false);
    expect(scroller.contains(document.querySelector('.mobile-category-bar'))).toBe(false);
  });

  it('renders the compact picker layout from the design phase', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    expect(screenText('EmojiDeck')).toBeTruthy();
    expect(document.querySelector('.desktop-sidebar')).toBeTruthy();
    expect(document.querySelector('.mobile-category-bar')).toBeTruthy();
    expect(document.querySelector<HTMLInputElement>('[type="search"]')?.placeholder).toBe(
      'Rechercher un emoji',
    );
    expect(document.querySelector('.desktop-topbar kbd')?.textContent).toBe('Ctrl F');
    expect(document.querySelector<HTMLSelectElement>('[data-theme-select="desktop"]')?.value).toBe(
      'system',
    );
    expect(document.querySelector('[data-language-select]')?.textContent).toContain('FR');
    expect(document.querySelector('[data-composer-toggle]')).toBeNull();
    expect(document.querySelector('[data-category-id="all"]')).toBeTruthy();
    expect(document.querySelector('[data-lucide="layout-grid"]')).toBeTruthy();
    expect(document.querySelector('.layout-toggle')?.getAttribute('data-tooltip')).toBe(
      "Agrandir l’application",
    );
  });

  it('expands the app with equal viewport margins and persists the preference', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const toggle = document.querySelector<HTMLButtonElement>('.layout-toggle')!;

    toggle.click();

    expect(document.querySelector('.app-shell')?.classList.contains('is-expanded')).toBe(true);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('emojideck.expanded')).toBe('true');

    document.body.innerHTML = '<div id="app"></div>';
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    expect(document.querySelector('.app-shell')?.classList.contains('is-expanded')).toBe(true);
  });

  it('enables language selection while keeping future controls unavailable', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    expect(languageSelect('desktop').disabled).toBe(false);
    expect(Array.from(languageSelect('desktop').options, (option) => option.value)).toEqual([
      'fr',
      'en',
      'de',
      'it',
      'es',
      'pt',
    ]);
    expect(document.querySelector<HTMLButtonElement>('.mobile-menu-button')?.disabled).toBe(false);
  });

  it('switches interface and search language without clearing local preferences', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    changeTheme('desktop', 'dark');
    favoriteToggle('face-with-tears-of-joy').click();
    await copyEmoji('face-with-tears-of-joy');

    await changeLanguage('de');

    expect(document.documentElement.lang).toBe('de');
    expect(languageSelect('desktop').value).toBe('de');
    expect(languageSelect('mobile').value).toBe('de');
    expect(localStorage.getItem('emojideck.language')).toBe('de');
    expect(localStorage.getItem('emojideck.theme')).toBe('dark');
    expect(JSON.parse(localStorage.getItem('emojideck.recents') ?? '[]')).toContain(
      'face-with-tears-of-joy',
    );
    expect(JSON.parse(localStorage.getItem('emojideck.favorites') ?? '[]')).toContain(
      'face-with-tears-of-joy',
    );

    document.querySelector<HTMLButtonElement>('[data-category-id="people"]')?.click();
    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Personen');
    document.querySelector<HTMLButtonElement>('[data-category-id="all"]')?.click();
    typeSearch('lachen');
    expect(document.querySelectorAll('[data-emoji-button]').length).toBeGreaterThan(0);
  });

  it('initializes from the stored language before browser detection', async () => {
    localStorage.setItem('emojideck.language', 'es');

    await initializeEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    expect(document.documentElement.lang).toBe('es');
    expect(languageSelect('desktop').value).toBe('es');
    expect(document.querySelector<HTMLInputElement>('[type="search"]')?.placeholder).toBe(
      'Buscar un emoji',
    );
  });

  it('shows a localized loading state until the active catalog is ready', async () => {
    localStorage.setItem('emojideck.language', 'fr');
    let finishLoading: ((catalog: EmojiCatalog) => void) | undefined;
    const initialization = initializeEmojiDeckApp(
      document.querySelector<HTMLDivElement>('#app')!,
      {
        loadCatalog: () =>
          new Promise<EmojiCatalog>((resolve) => {
            finishLoading = resolve;
          }),
      },
    );

    expect(document.querySelector('.app-status-shell')?.textContent).toContain(
      'Chargement des emojis',
    );
    expect(document.querySelector('.app-status-shell')?.getAttribute('aria-busy')).toBe('true');

    finishLoading?.(catalogs.fr);
    await initialization;

    expect(document.querySelector('.app-status-shell')).toBeNull();
    expect(document.querySelector('.app-shell')).toBeTruthy();
  });

  it('offers a retry after a catalog loading failure', async () => {
    localStorage.setItem('emojideck.language', 'en');
    const loader = vi
      .fn<(locale: LocaleCode) => Promise<EmojiCatalog>>()
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValue(catalogs.en);

    await initializeEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!, {
      loadCatalog: loader,
    });

    expect(document.querySelector('.app-status-shell')?.getAttribute('aria-busy')).toBe('false');
    expect(document.querySelector('.app-status-shell')?.textContent).toContain(
      'Unable to load emojis.',
    );
    document.querySelector<HTMLButtonElement>('.status-retry-button')?.click();

    await vi.waitFor(() => expect(document.querySelector('.app-shell')).toBeTruthy());
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('applies the system theme by default and renders synchronized controls', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    expect(document.documentElement.dataset.themeMode).toBe('system');
    expect(themeSelect('desktop').value).toBe('system');
    expect(themeSelect('mobile').value).toBe('system');
  });

  it('connects system mode to the dark color scheme media query', () => {
    const listeners: Array<(event: MediaQueryListEvent) => void> = [];
    const matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.push(listener);
      },
    });
    vi.stubGlobal('matchMedia', matchMedia);

    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    expect(matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(document.documentElement.dataset.theme).toBe('dark');

    listeners[0]({ matches: false } as MediaQueryListEvent);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('restores a manual theme and synchronizes changes from desktop', () => {
    localStorage.setItem('emojideck.theme', 'dark');
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(themeSelect('mobile').value).toBe('dark');

    changeTheme('desktop', 'light');

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('emojideck.theme')).toBe('light');
    expect(themeSelect('mobile').value).toBe('light');
  });

  it('opens the mobile settings and synchronizes changes from mobile', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const menuButton = document.querySelector<HTMLButtonElement>('.mobile-menu-button')!;
    const menu = document.querySelector<HTMLElement>('[data-mobile-menu]')!;

    expect(menu.hidden).toBe(true);
    menuButton.click();

    expect(menu.hidden).toBe(false);
    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(menuButton.getAttribute('aria-label')).toBe('Fermer le menu');

    changeTheme('mobile', 'dark');

    expect(themeSelect('desktop').value).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    menuButton.click();
    expect(menu.hidden).toBe(true);
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(menuButton.getAttribute('aria-label')).toBe('Ouvrir le menu');
  });

  it('keeps favorites unavailable while empty and exposes a separate star action', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    expect(
      document.querySelector<HTMLButtonElement>('.desktop-sidebar [data-collection-id="favorites"]')
        ?.disabled,
    ).toBe(true);
    expect(
      document.querySelector('.mobile-category-bar [data-collection-id="favorites"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-favorite-toggle][data-emoji-id="face-with-tears-of-joy"]'),
    ).toBeTruthy();
  });

  it('adds a favorite without copying and enables both collection navigations', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    favoriteToggle('face-with-tears-of-joy').click();

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('emojideck.favorites') ?? '[]')).toEqual([
      'face-with-tears-of-joy',
    ]);
    expect(favoriteToggle('face-with-tears-of-joy').getAttribute('aria-pressed')).toBe('true');
    expect(
      document.querySelector<HTMLButtonElement>('.desktop-sidebar [data-collection-id="favorites"]')
        ?.disabled,
    ).toBe(false);
    expect(
      document.querySelector('.mobile-category-bar [data-collection-id="favorites"]'),
    ).toBeTruthy();
  });

  it('keeps focus on the favorite action after toggling it', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const toggle = favoriteToggle('face-with-tears-of-joy');
    toggle.focus();

    toggle.click();

    expect(document.activeElement).toBe(favoriteToggle('face-with-tears-of-joy'));
  });

  it('preserves favorite order across search, reload and the favorites grid', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    favoriteToggle('face-with-tears-of-joy').click();
    document.querySelector<HTMLButtonElement>('[data-category-id="all"]')?.click();
    typeSearch('feu');
    favoriteToggle('fire').click();

    document.body.innerHTML = '<div id="app"></div>';
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    document
      .querySelector<HTMLButtonElement>('.desktop-sidebar [data-collection-id="favorites"]')
      ?.click();

    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Favoris');
    expect(visibleEmojiIds()).toEqual(['face-with-tears-of-joy', 'fire']);
  });

  it('adds a favorite from recents without triggering another copy', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    await copyEmoji('face-with-tears-of-joy');
    document
      .querySelector<HTMLButtonElement>('.desktop-sidebar [data-collection-id="recents"]')
      ?.click();

    favoriteToggle('face-with-tears-of-joy').click();

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem('emojideck.favorites') ?? '[]')).toEqual([
      'face-with-tears-of-joy',
    ]);
    expect(favoriteToggle('face-with-tears-of-joy').getAttribute('aria-pressed')).toBe('true');
  });

  it('returns to the last category after removing the final favorite', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    document.querySelector<HTMLButtonElement>('[data-category-id="food"]')?.click();
    favoriteToggle('pizza').click();
    document
      .querySelector<HTMLButtonElement>('.mobile-category-bar [data-collection-id="favorites"]')
      ?.click();

    favoriteToggle('pizza').click();

    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Nourriture');
    expect(
      document.querySelector('.mobile-category-bar [data-collection-id="favorites"]'),
    ).toBeNull();
    expect(
      document.querySelector<HTMLButtonElement>('.desktop-sidebar [data-collection-id="favorites"]')
        ?.disabled,
    ).toBe(true);
  });

  it('moves focus to the nearest favorite action after removing an item', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    favoriteToggle('face-with-tears-of-joy').click();
    favoriteToggle('beaming-face-with-smiling-eyes').click();
    document
      .querySelector<HTMLButtonElement>('.desktop-sidebar [data-collection-id="favorites"]')
      ?.click();
    const removedToggle = favoriteToggle('face-with-tears-of-joy');
    removedToggle.focus();

    removedToggle.click();

    expect(document.activeElement).toBe(favoriteToggle('beaming-face-with-smiling-eyes'));
  });

  it('shows only the active category in the main grid', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    const heading = document.querySelector('[data-section-heading]');
    const visibleButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'));

    expect(heading?.textContent).toBe('Smileys');
    expect(visibleButtons.length).toBeGreaterThan(8);
    expect(visibleButtons.every((button) => button.dataset.category === 'faces')).toBe(true);
  });

  it('announces the copy action in each emoji button label', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    expect(
      document
        .querySelector<HTMLButtonElement>('[data-emoji-id="grinning-face"]')
        ?.getAttribute('aria-label'),
    ).toBe('Copier : visage rieur');
  });

  it('exposes the emoji results as a named group', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const grid = document.querySelector<HTMLElement>('.emoji-grid');

    expect(grid?.getAttribute('role')).toBe('group');
    expect(grid?.getAttribute('aria-label')).toBe('Smileys');
  });

  it('moves focus to the next emoji with ArrowRight', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'),
    );

    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(document.activeElement).toBe(buttons[1]);
  });

  it('moves focus to the previous emoji with ArrowLeft', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'),
    );

    buttons[1].focus();
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

    expect(document.activeElement).toBe(buttons[0]);
  });

  it('keeps focus in place at a grid boundary without scrolling', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const firstButton = document.querySelector<HTMLButtonElement>('[data-emoji-button]')!;
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    });
    firstButton.focus();

    firstButton.dispatchEvent(event);

    expect(document.activeElement).toBe(firstButton);
    expect(event.defaultPrevented).toBe(true);
  });

  it('moves focus to the first emoji with Home', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'),
    );

    buttons[4].focus();
    buttons[4].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));

    expect(document.activeElement).toBe(buttons[0]);
  });

  it('moves focus to the last emoji with End', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'),
    );

    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));

    expect(document.activeElement).toBe(buttons.at(-1));
  });

  it('moves focus to the closest emoji below with ArrowDown', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'),
    );
    arrangeButtons(buttons, 3);

    buttons[1].focus();
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    expect(document.activeElement).toBe(buttons[4]);
  });

  it('moves focus to the closest emoji above with ArrowUp', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'),
    );
    arrangeButtons(buttons, 3);

    buttons[4].focus();
    buttons[4].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));

    expect(document.activeElement).toBe(buttons[1]);
  });

  it('navigates to the closest item in an incomplete responsive row', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'),
    );
    buttons.slice(9).forEach((button) => button.remove());
    const incompleteGrid = buttons.slice(0, 9);
    arrangeButtons(incompleteGrid, 4);

    incompleteGrid[7].focus();
    incompleteGrid[7].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );

    expect(document.activeElement).toBe(incompleteGrid[8]);
  });

  it('switches category from the compact navigation', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    document.querySelector<HTMLButtonElement>('[data-category-id="food"]')?.click();

    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Nourriture');
    expect(
      Array.from(document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]')).every(
        (button) => button.dataset.category === 'food',
      ),
    ).toBe(true);
  });

  it('opens the next desktop category with ArrowDown', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const faces = document.querySelector<HTMLButtonElement>(
      '.desktop-sidebar [data-category-id="faces"]',
    )!;
    const people = document.querySelector<HTMLButtonElement>(
      '.desktop-sidebar [data-category-id="people"]',
    )!;
    faces.focus();

    faces.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
    );

    expect(document.activeElement).toBe(people);
    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Personnes');
  });

  it('opens the previous desktop category with ArrowUp', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const faces = document.querySelector<HTMLButtonElement>(
      '.desktop-sidebar [data-category-id="faces"]',
    )!;
    const people = document.querySelector<HTMLButtonElement>(
      '.desktop-sidebar [data-category-id="people"]',
    )!;
    people.click();
    people.focus();

    people.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }),
    );

    expect(document.activeElement).toBe(faces);
    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Smileys');
  });

  it('continues desktop navigation into available collections', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    await copyEmoji('face-with-tears-of-joy');
    const flags = document.querySelector<HTMLButtonElement>(
      '.desktop-sidebar [data-category-id="flags"]',
    )!;
    const recents = document.querySelector<HTMLButtonElement>(
      '.desktop-sidebar [data-collection-id="recents"]',
    )!;
    flags.click();
    flags.focus();

    flags.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
    );

    expect(document.activeElement).toBe(recents);
    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Récents');
  });

  it('returns from a desktop collection to the previous category', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    await copyEmoji('face-with-tears-of-joy');
    const flags = document.querySelector<HTMLButtonElement>(
      '.desktop-sidebar [data-category-id="flags"]',
    )!;
    const recents = document.querySelector<HTMLButtonElement>(
      '.desktop-sidebar [data-collection-id="recents"]',
    )!;
    recents.click();
    recents.focus();

    recents.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }),
    );

    expect(document.activeElement).toBe(flags);
    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Drapeaux');
  });

  it('opens the next mobile category with ArrowRight', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const faces = document.querySelector<HTMLButtonElement>(
      '.mobile-category-bar [data-category-id="faces"]',
    )!;
    const people = document.querySelector<HTMLButtonElement>(
      '.mobile-category-bar [data-category-id="people"]',
    )!;
    faces.focus();

    faces.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
    );

    expect(document.activeElement).toBe(people);
    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Personnes');
  });

  it('opens the previous mobile category with ArrowLeft', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const faces = document.querySelector<HTMLButtonElement>(
      '.mobile-category-bar [data-category-id="faces"]',
    )!;
    const people = document.querySelector<HTMLButtonElement>(
      '.mobile-category-bar [data-category-id="people"]',
    )!;
    people.click();
    people.focus();

    people.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }),
    );

    expect(document.activeElement).toBe(faces);
    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Smileys');
  });

  it('continues mobile navigation into and out of available collections', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    await copyEmoji('face-with-tears-of-joy');
    const flags = document.querySelector<HTMLButtonElement>(
      '.mobile-category-bar [data-category-id="flags"]',
    )!;
    const recents = document.querySelector<HTMLButtonElement>(
      '.mobile-category-bar [data-collection-id="recents"]',
    )!;
    flags.focus();

    flags.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(recents);
    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Récents');

    recents.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(flags);
    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Drapeaux');
  });

  it('keeps navigation focus at desktop and mobile boundaries', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const desktopFirst = document.querySelector<HTMLButtonElement>(
      '.desktop-sidebar [data-category-id="all"]',
    )!;
    const mobileFirst = document.querySelector<HTMLButtonElement>(
      '.mobile-category-bar [data-category-id="all"]',
    )!;
    const desktopEvent = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    });
    const mobileEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    });

    desktopFirst.focus();
    desktopFirst.dispatchEvent(desktopEvent);
    expect(document.activeElement).toBe(desktopFirst);
    expect(desktopEvent.defaultPrevented).toBe(true);

    mobileFirst.focus();
    mobileFirst.dispatchEvent(mobileEvent);
    expect(document.activeElement).toBe(mobileFirst);
    expect(mobileEvent.defaultPrevented).toBe(true);
  });

  it('copies an emoji and displays a discreet success toast', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    document.querySelector<HTMLButtonElement>('[data-emoji-id="face-with-tears-of-joy"]')?.click();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('😂');
    expect(await findToast()).toBe('Copié !');
  });

  it('reveals recent navigation only after a successful copy', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    expect(
      document.querySelector<HTMLButtonElement>('.desktop-sidebar [data-collection-id="recents"]')
        ?.disabled,
    ).toBe(true);
    expect(
      document.querySelector('.mobile-category-bar [data-collection-id="recents"]'),
    ).toBeNull();

    await copyEmoji('face-with-tears-of-joy');

    expect(JSON.parse(localStorage.getItem('emojideck.recents') ?? '[]')).toEqual([
      'face-with-tears-of-joy',
    ]);
    expect(
      document.querySelector<HTMLButtonElement>('.desktop-sidebar [data-collection-id="recents"]')
        ?.disabled,
    ).toBe(false);
    expect(
      document.querySelector('.mobile-category-bar [data-collection-id="recents"]'),
    ).toBeTruthy();
  });

  it('shows recent emojis newest first without duplicates and allows copying them', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    await copyEmoji('face-with-tears-of-joy');
    document.querySelector<HTMLButtonElement>('[data-category-id="all"]')?.click();
    typeSearch('feu');
    await copyEmoji('fire');
    typeSearch('rire');
    await copyEmoji('face-with-tears-of-joy');

    document
      .querySelector<HTMLButtonElement>('.desktop-sidebar [data-collection-id="recents"]')
      ?.click();

    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Récents');
    expect(visibleEmojiIds()).toEqual(['face-with-tears-of-joy', 'fire']);

    await copyEmoji('fire');

    expect(visibleEmojiIds()).toEqual(['fire', 'face-with-tears-of-joy']);
  });

  it('keeps focus on an emoji when copying reorders recents', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    await copyEmoji('face-with-tears-of-joy');
    document.querySelector<HTMLButtonElement>('[data-category-id="all"]')?.click();
    typeSearch('feu');
    await copyEmoji('fire');
    document
      .querySelector<HTMLButtonElement>('.desktop-sidebar [data-collection-id="recents"]')
      ?.click();
    const emoji = document.querySelector<HTMLButtonElement>(
      '[data-emoji-button][data-emoji-id="face-with-tears-of-joy"]',
    )!;
    emoji.focus();

    emoji.click();
    await Promise.resolve();

    expect(document.activeElement).toBe(
      document.querySelector('[data-emoji-button][data-emoji-id="face-with-tears-of-joy"]'),
    );
  });

  it('does not reclaim focus when clipboard writing finishes late', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    await copyEmoji('face-with-tears-of-joy');
    document
      .querySelector<HTMLButtonElement>('.desktop-sidebar [data-collection-id="recents"]')
      ?.click();
    const emoji = document.querySelector<HTMLButtonElement>('[data-emoji-button]')!;
    const search = document.querySelector<HTMLInputElement>('input[type="search"]')!;
    let finishCopy: (() => void) | undefined;
    vi.mocked(navigator.clipboard.writeText).mockImplementationOnce(
      () => new Promise<void>((resolve) => (finishCopy = resolve)),
    );
    emoji.focus();

    emoji.click();
    search.focus();
    finishCopy?.();
    await Promise.resolve();
    await Promise.resolve();

    expect(document.activeElement).toBe(search);
  });

  it('restores recent emojis from local storage after the app is recreated', () => {
    localStorage.setItem(
      'emojideck.recents',
      JSON.stringify(['fire', 'missing-emoji', 'red-heart']),
    );

    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    document
      .querySelector<HTMLButtonElement>('.desktop-sidebar [data-collection-id="recents"]')
      ?.click();

    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Récents');
    expect(visibleEmojiIds()).toEqual(['fire', 'red-heart']);
  });

  it('keeps the app usable when browser storage access is blocked', () => {
    const localStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw new DOMException('Storage blocked', 'SecurityError');
      },
    });

    try {
      expect(() => createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!)).not.toThrow();
      expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Smileys');
    } finally {
      if (localStorageDescriptor) {
        Object.defineProperty(window, 'localStorage', localStorageDescriptor);
      }
    }
  });

  it('opens recents and clears search from the mobile navigation', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    await copyEmoji('face-with-tears-of-joy');
    typeSearch('feu');

    document
      .querySelector<HTMLButtonElement>('.mobile-category-bar [data-collection-id="recents"]')
      ?.click();

    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Récents');
    expect(document.querySelector<HTMLInputElement>('input[type="search"]')?.value).toBe('');
    expect(visibleEmojiIds()).toEqual(['face-with-tears-of-joy']);
  });

  it('does not add an emoji to recents when clipboard copy fails', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('denied'));
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    await copyEmoji('face-with-tears-of-joy');

    expect(localStorage.getItem('emojideck.recents')).toBeNull();
    expect(await findToast()).toBe('Copie impossible');
  });

  it('shows search results in a single grid while a query is active', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    document.querySelector<HTMLButtonElement>('[data-category-id="all"]')?.click();
    typeSearch('coeur');

    const resultCount = document.querySelectorAll('[data-emoji-button]').length;
    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Recherche');
    expect(document.querySelector('[data-search-summary]')?.textContent).toBe(
      `${resultCount} résultats pour "coeur"`,
    );
    expect(resultCount).toBeGreaterThan(2);
    expect(document.querySelector<HTMLButtonElement>('[data-emoji-id="red-heart"]')).toBeTruthy();
    expect(
      Array.from(document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]')).every(
        (button) => button.dataset.searchResult === 'true',
      ),
    ).toBe(true);
  });

  it('announces search result updates without moving focus', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const meta = document.querySelector<HTMLElement>('[data-search-meta]');
    const search = document.querySelector<HTMLInputElement>('input[type="search"]')!;
    search.focus();

    typeSearch('rire', search);

    const resultCount = document.querySelectorAll('[data-emoji-button]').length;
    expect(meta?.getAttribute('aria-live')).toBe('polite');
    expect(meta?.getAttribute('aria-atomic')).toBe('true');
    expect(meta?.textContent).toBe(`${resultCount} résultats pour "rire"`);
    expect(resultCount).toBeGreaterThan(2);
    expect(document.activeElement).toBe(search);
  });

  it('applies category changes to the current search', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    document.querySelector<HTMLButtonElement>('[data-category-id="all"]')?.click();
    typeSearch('feu');

    expect(document.querySelector('[data-emoji-id="fire"]')).toBeTruthy();

    document.querySelector<HTMLButtonElement>('[data-category-id="food"]')?.click();
    expect(document.querySelector('[data-emoji-id="fire"]')).toBeNull();
    expect(
      Array.from(document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]')).every(
        (button) => button.dataset.category === 'food',
      ),
    ).toBe(true);

    document.querySelector<HTMLButtonElement>('[data-category-id="all"]')?.click();
    expect(document.querySelector('[data-emoji-id="fire"]')).toBeTruthy();
  });

  it('keeps the same search field, focus and cursor position while typing', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    const input = document.querySelector<HTMLInputElement>('input[type="search"]');

    input?.focus();
    if (input) {
      input.value = 'rire';
    }
    input?.setSelectionRange(2, 2);
    input?.dispatchEvent(new InputEvent('input', { bubbles: true }));

    const focusedInput = document.activeElement as HTMLInputElement | null;
    expect(focusedInput).toBe(input);
    expect(focusedInput?.value).toBe('rire');
    expect(focusedInput?.selectionStart).toBe(2);
  });

  it('focuses search with Ctrl+F', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const search = document.querySelector<HTMLInputElement>('input[type="search"]')!;
    typeSearch('rire', search);
    search.blur();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true, cancelable: true }),
    );

    expect(document.activeElement).toBe(search);
    expect(search.selectionStart).toBe(0);
    expect(search.selectionEnd).toBe(4);
  });

  it('focuses the visible mobile search with Cmd+F', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const searches = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="search"]'),
    );
    searches[0].getClientRects = () => [] as unknown as DOMRectList;
    searches[1].getClientRects = () =>
      [DOMRect.fromRect({ width: 320, height: 46 })] as unknown as DOMRectList;

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'f', metaKey: true, bubbles: true, cancelable: true }),
    );

    expect(document.activeElement).toBe(searches[1]);
  });

  it('does not intercept Ctrl+K or modified Ctrl+F shortcuts', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const ctrlK = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const ctrlShiftF = new KeyboardEvent('keydown', {
      key: 'f',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(ctrlK);
    expect(ctrlK.defaultPrevented).toBe(false);

    document.dispatchEvent(ctrlShiftF);
    expect(ctrlShiftF.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(document.body);
  });

  it('clears search with Escape without losing focus', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    const search = document.querySelector<HTMLInputElement>('input[type="search"]')!;
    typeSearch('rire', search);
    search.focus();

    search.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );

    expect(search.value).toBe('');
    expect(document.activeElement).toBe(search);
    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Smileys');
  });

  it('renders the search query as text instead of interpreting HTML', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    const query = '</p><img data-injected="true">';
    typeSearch(query);

    expect(document.querySelector('[data-injected]')).toBeNull();
    expect(document.querySelector('[data-empty-state]')?.textContent).toContain(query);
  });

  it('keeps copy behavior available from search results', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    document.querySelector<HTMLButtonElement>('[data-category-id="all"]')?.click();
    typeSearch('feu');
    document.querySelector<HTMLButtonElement>('[data-emoji-id="fire"]')?.click();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('🔥');
    expect(await findToast()).toBe('Copié !');
  });

  it('persists and applies the default skin tone to compatible emojis', () => {
    localStorage.setItem('emojideck.skinTone', 'medium');
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    document.querySelector<HTMLButtonElement>('[data-category-id="people"]')?.click();

    const wavingHand = document.querySelector<HTMLButtonElement>(
      '[data-emoji-button][data-emoji-id="waving-hand"]',
    );
    expect(skinToneSelect('desktop').value).toBe('medium');
    expect(skinToneSelect('mobile').value).toBe('medium');
    expect(wavingHand?.dataset.emoji).toBe('👋🏽');
    expect(wavingHand?.textContent).toBe('👋🏽');

    skinToneSelect('desktop').value = 'dark';
    skinToneSelect('desktop').dispatchEvent(new Event('change', { bubbles: true }));

    expect(localStorage.getItem('emojideck.skinTone')).toBe('dark');
    expect(skinToneSelect('mobile').value).toBe('dark');
    expect(
      document.querySelector<HTMLButtonElement>(
        '[data-emoji-button][data-emoji-id="waving-hand"]',
      )?.dataset.emoji,
    ).toBe('👋🏿');
  });

  it('does not alter emojis that do not support skin tones', () => {
    localStorage.setItem('emojideck.skinTone', 'dark');
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    const emoji = document.querySelector<HTMLButtonElement>(
      '[data-emoji-button][data-emoji-id="face-with-tears-of-joy"]',
    );
    expect(emoji?.dataset.emoji).toBe('😂');
    expect(
      emoji?.closest('.emoji-cell')?.querySelector('[data-variant-toggle]'),
    ).toBeNull();
  });

  it('opens an accessible skin tone menu and restores focus with Escape', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    document.querySelector<HTMLButtonElement>('[data-category-id="people"]')?.click();
    const toggle = document.querySelector<HTMLButtonElement>(
      '[data-variant-toggle][data-emoji-id="waving-hand"]',
    )!;

    toggle.click();

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const options = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-variant-option]'),
    );
    expect(dialog?.getAttribute('aria-labelledby')).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(options).toHaveLength(6);
    expect(document.activeElement).toBe(options[0]);

    options[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(options[1]);

    options[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('copies a chosen variant directly and records its parent in recents', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    document.querySelector<HTMLButtonElement>('[data-category-id="people"]')?.click();
    document
      .querySelector<HTMLButtonElement>('[data-variant-toggle][data-emoji-id="waving-hand"]')
      ?.click();
    const variants = document.querySelectorAll<HTMLButtonElement>('[data-variant-option]');

    variants.item(5).click();
    await Promise.resolve();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('👋🏿');
    expect(JSON.parse(localStorage.getItem('emojideck.recents') ?? '[]')).toContain(
      'waving-hand',
    );
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('keeps mixed skin tone variants inside the parent emoji menu', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
    document.querySelector<HTMLButtonElement>('[data-category-id="people"]')?.click();
    const handshake = document.querySelector<HTMLButtonElement>(
      '[data-emoji-button][data-emoji-id="handshake"]',
    )!;

    handshake.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }),
    );

    expect(document.querySelectorAll('[data-variant-option]')).toHaveLength(26);
    expect(visibleEmojiIds().filter((id) => id === 'handshake')).toHaveLength(1);
    expect(
      Array.from(document.querySelectorAll<HTMLButtonElement>('[data-variant-option]')).some(
        (option) => option.dataset.emoji === '🫱🏻‍🫲🏼',
      ),
    ).toBe(true);
  });

  it('opens the variant menu after a long press without copying the base emoji', () => {
    vi.useFakeTimers();
    try {
      createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);
      document.querySelector<HTMLButtonElement>('[data-category-id="people"]')?.click();
      const wavingHand = document.querySelector<HTMLButtonElement>(
        '[data-emoji-button][data-emoji-id="waving-hand"]',
      )!;

      wavingHand.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }));
      vi.advanceTimersByTime(500);

      expect(document.querySelector('[role="dialog"]')).toBeTruthy();
      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows a sober empty state when no emoji matches the query', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    typeSearch('zzzz');

    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Recherche');
    expect(document.querySelector('[data-empty-state]')?.textContent).toBe('Aucun emoji trouvé pour "zzzz"');
    expect(document.querySelectorAll('[data-emoji-button]').length).toBe(0);
  });
});

function screenText(text: string): Element | null {
  return Array.from(document.querySelectorAll('*')).find((element) => element.textContent === text) ?? null;
}

async function findToast(): Promise<string | null> {
  await Promise.resolve();
  return document.querySelector('[role="status"]')?.textContent?.trim() ?? null;
}

function typeSearch(
  query: string,
  input = document.querySelector<HTMLInputElement>('input[type="search"]'),
): void {

  if (!input) {
    throw new Error('Search input not found');
  }

  input.value = query;
  input.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

async function copyEmoji(id: string): Promise<void> {
  const button = document.querySelector<HTMLButtonElement>(`[data-emoji-id="${id}"]`);

  if (!button) {
    throw new Error(`Emoji button not found: ${id}`);
  }

  button.click();
  await Promise.resolve();
}

function visibleEmojiIds(): string[] {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]')).map(
    (button) => button.dataset.emojiId ?? '',
  );
}

function favoriteToggle(id: string): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>(
    `[data-favorite-toggle][data-emoji-id="${id}"]`,
  );

  if (!button) {
    throw new Error(`Favorite toggle not found: ${id}`);
  }

  return button;
}

function themeSelect(location: 'desktop' | 'mobile'): HTMLSelectElement {
  const select = document.querySelector<HTMLSelectElement>(`[data-theme-select="${location}"]`);

  if (!select) {
    throw new Error(`Theme select not found: ${location}`);
  }

  return select;
}

function languageSelect(location: 'desktop' | 'mobile'): HTMLSelectElement {
  const select = document.querySelector<HTMLSelectElement>(`[data-language-select="${location}"]`);

  if (!select) {
    throw new Error(`Language select not found: ${location}`);
  }

  return select;
}

function skinToneSelect(location: 'desktop' | 'mobile'): HTMLSelectElement {
  const select = document.querySelector<HTMLSelectElement>(
    `[data-skin-tone-select="${location}"]`,
  );

  if (!select) {
    throw new Error(`Skin tone select not found: ${location}`);
  }

  return select;
}

async function changeLanguage(locale: LocaleCode): Promise<void> {
  const select = languageSelect('desktop');
  select.value = locale;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  await vi.waitFor(() => expect(document.documentElement.lang).toBe(locale));
}

function changeTheme(location: 'desktop' | 'mobile', mode: 'system' | 'light' | 'dark'): void {
  const select = themeSelect(location);
  select.value = mode;
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

function arrangeButtons(buttons: HTMLButtonElement[], columns: number): void {
  buttons.forEach((button, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    button.getBoundingClientRect = () =>
      DOMRect.fromRect({ x: column * 60, y: row * 60, width: 48, height: 48 });
  });
}
