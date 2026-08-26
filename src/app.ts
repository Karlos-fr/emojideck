import {
  emojiCategories,
  getEmojiById,
  getEmojisByCategory,
  sampleEmojis,
  type EmojiCategory,
  type EmojiCategoryId,
} from './data/emojis';
import { searchEmojis } from './data/search';
import { createFavoriteEmojiStore } from './storage/favoriteEmojis';
import { createRecentEmojiStore } from './storage/recentEmojis';
import {
  createThemeController,
  type ColorSchemePreference,
  type ThemeMode,
} from './theme/theme';
import { renderEmojiResults } from './ui/emojiResults';

const categoryIcons: Record<EmojiCategoryId, string> = {
  faces: '☺',
  animals: '♧',
  food: '♢',
  objects: '▣',
  symbols: '✧',
  flags: '⚑',
};

const emojiNavigationKeys = new Set([
  'ArrowRight',
  'ArrowLeft',
  'ArrowDown',
  'ArrowUp',
  'Home',
  'End',
]);
let globalSearchShortcutBound = false;

type CollectionId = 'recents' | 'favorites';
type EmojiDeckView = EmojiCategoryId | CollectionId;

interface EmojiDeckState {
  activeView: EmojiDeckView;
  lastCategory: EmojiCategoryId;
  query: string;
  recentIds: string[];
  favoriteIds: string[];
  toastMessage: string | null;
}

export function createEmojiDeckApp(root: HTMLElement): void {
  bindGlobalSearchShortcut();
  const browserStorage = getBrowserStorage();
  const recentStore = createRecentEmojiStore(browserStorage);
  const favoriteStore = createFavoriteEmojiStore(browserStorage);
  const themeController = createThemeController({
    root: document.documentElement,
    storage: browserStorage,
    colorScheme: getColorSchemePreference(),
  });
  const state: EmojiDeckState = {
    activeView: 'faces',
    lastCategory: 'faces',
    query: '',
    recentIds: recentStore.read(),
    favoriteIds: favoriteStore.read(),
    toastMessage: null,
  };

  function renderShell(): void {
    root.innerHTML = `
      <main class="app-shell" aria-label="EmojiDeck">
        <aside class="desktop-sidebar" aria-label="Categories">
          <a class="brand" href="#" aria-label="EmojiDeck accueil">EmojiDeck</a>
          <nav class="sidebar-nav" aria-label="Categories emoji">
            ${emojiCategories.map((category) => renderSidebarButton(category, state.activeView)).join('')}
          </nav>
          <div class="sidebar-separator" role="presentation"></div>
          <nav class="sidebar-nav utility-nav" aria-label="Collections">
            <button class="sidebar-item" type="button" data-collection-id="recents" disabled>
              <span class="nav-icon" aria-hidden="true">◷</span>
              <span>Recents</span>
            </button>
            <button class="sidebar-item" type="button" data-collection-id="favorites" disabled>
              <span class="nav-icon" aria-hidden="true">☆</span>
              <span>Favoris</span>
            </button>
          </nav>
        </aside>

        <section class="main-panel">
          <header class="desktop-topbar">
            ${renderSearch()}
            <div class="desktop-controls" aria-label="Preferences">
              <label class="theme-control">
                <span>Theme</span>
                ${renderThemeSelect('desktop', themeController.getMode())}
              </label>
              <button class="plain-control language-control" type="button" data-language-select disabled>
                <span>Langue</span>
                <span class="control-value">FR</span>
                <span aria-hidden="true">⌄</span>
              </button>
            </div>
          </header>

          <header class="mobile-header">
            <a class="brand" href="#" aria-label="EmojiDeck accueil">EmojiDeck</a>
            <button
              class="mobile-menu-button"
              type="button"
              aria-label="Ouvrir le menu"
              aria-controls="mobile-settings"
              aria-expanded="false"
            >☰</button>
          </header>
          <div id="mobile-settings" class="mobile-settings" data-mobile-menu hidden>
            <label class="mobile-setting-row">
              <span>Theme</span>
              ${renderThemeSelect('mobile', themeController.getMode())}
            </label>
            <button class="mobile-setting-row" type="button" data-language-select disabled>
              <span>Langue</span>
              <span class="control-value">FR</span>
            </button>
          </div>
          <div class="mobile-search">${renderSearch()}</div>
          <nav class="mobile-category-bar" aria-label="Categories emoji mobile">
            ${emojiCategories.map((category) => renderMobileCategoryButton(category, state.activeView)).join('')}
          </nav>

          <div class="content-scroll">
            <section class="emoji-section" aria-labelledby="emoji-section-heading">
              <h1 id="emoji-section-heading" data-section-heading></h1>
              <div data-search-meta aria-live="polite" aria-atomic="true"></div>
              <div data-results-region></div>
            </section>
          </div>
        </section>

        <div data-toast-region></div>
      </main>
    `;

    bindEvents();
    updateView();
  }

  function bindEvents(): void {
    root.addEventListener('keydown', (event) => {
      if (
        event.key === 'Escape' &&
        event.target instanceof HTMLInputElement &&
        event.target.type === 'search' &&
        state.query.length > 0
      ) {
        event.preventDefault();
        clearSearch();
        updateResults();
        return;
      }

      const navigationButton =
        event.target instanceof Element
          ? event.target.closest<HTMLButtonElement>('[data-category-id], [data-collection-id]')
          : null;

      if (
        navigationButton?.closest('.desktop-sidebar') &&
        (event.key === 'ArrowDown' || event.key === 'ArrowUp')
      ) {
        const buttons = Array.from(
          root.querySelectorAll<HTMLButtonElement>(
            '.desktop-sidebar [data-category-id], .desktop-sidebar [data-collection-id]:not(:disabled)',
          ),
        );
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const nextButton = buttons[buttons.indexOf(navigationButton) + direction];
        event.preventDefault();

        if (nextButton) {
          nextButton.click();
          nextButton.focus();
        }

        return;
      }

      if (
        navigationButton?.closest('.mobile-category-bar') &&
        (event.key === 'ArrowRight' || event.key === 'ArrowLeft')
      ) {
        const buttons = Array.from(
          root.querySelectorAll<HTMLButtonElement>(
            '.mobile-category-bar [data-category-id], .mobile-category-bar [data-collection-id]',
          ),
        );
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextButton = buttons[buttons.indexOf(navigationButton) + direction];
        event.preventDefault();

        if (nextButton) {
          nextButton.click();
          nextButton.focus();
        }

        return;
      }

      const button = event.target;

      if (!(button instanceof HTMLButtonElement) || !button.matches('[data-emoji-button]')) {
        return;
      }

      if (!emojiNavigationKeys.has(event.key)) {
        return;
      }

      event.preventDefault();

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const buttons = Array.from(
          root.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'),
        );
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextButton = buttons[buttons.indexOf(button) + direction];

        if (nextButton) {
          nextButton.focus();
        }
      } else if (event.key === 'Home') {
        const firstButton = root.querySelector<HTMLButtonElement>('[data-emoji-button]');

        if (firstButton) {
          firstButton.focus();
        }
      } else if (event.key === 'End') {
        const buttons = root.querySelectorAll<HTMLButtonElement>('[data-emoji-button]');
        const lastButton = buttons.item(buttons.length - 1);

        if (lastButton) {
          lastButton.focus();
        }
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const buttons = Array.from(
          root.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'),
        );
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const nextButton = findVerticalEmoji(button, buttons, direction);

        if (nextButton) {
          nextButton.focus();
        }
      }
    });

    root.addEventListener('change', (event) => {
      const select = event.target;

      if (!(select instanceof HTMLSelectElement) || !select.matches('[data-theme-select]')) {
        return;
      }

      themeController.setMode(select.value as ThemeMode);
      syncThemeSelects();
    });

    root.addEventListener('input', (event) => {
      const input = event.target;

      if (!(input instanceof HTMLInputElement) || input.type !== 'search') {
        return;
      }

      state.query = input.value;
      syncSearchInputs(input);
      updateResults();
    });

    root.addEventListener('click', async (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const menuButton = target.closest<HTMLButtonElement>('.mobile-menu-button');

      if (menuButton) {
        const menu = root.querySelector<HTMLElement>('[data-mobile-menu]');

        if (menu) {
          menu.hidden = !menu.hidden;
          menuButton.setAttribute('aria-expanded', String(!menu.hidden));
          menuButton.setAttribute('aria-label', menu.hidden ? 'Ouvrir le menu' : 'Fermer le menu');
        }

        return;
      }

      const categoryButton = target.closest<HTMLButtonElement>('[data-category-id]');

      if (categoryButton?.dataset.categoryId) {
        state.lastCategory = categoryButton.dataset.categoryId as EmojiCategoryId;
        state.activeView = state.lastCategory;
        updateView();
        return;
      }

      const collectionButton = target.closest<HTMLButtonElement>('[data-collection-id]');
      const collectionId = collectionButton?.dataset.collectionId as CollectionId | undefined;

      if (collectionId && getCollectionEmojis(collectionId).length > 0) {
        state.activeView = collectionId;
        clearSearch();
        updateView();
        return;
      }

      const favoriteButton = target.closest<HTMLButtonElement>('[data-favorite-toggle]');

      if (favoriteButton?.dataset.emojiId) {
        const emojiId = favoriteButton.dataset.emojiId;
        const shouldRestoreFocus = document.activeElement === favoriteButton;
        const focusedIndex = Array.from(
          root.querySelectorAll<HTMLButtonElement>('[data-favorite-toggle]'),
        ).indexOf(favoriteButton);
        state.favoriteIds = favoriteStore.toggle(emojiId);

        if (state.activeView === 'favorites' && getFavoriteEmojis().length === 0) {
          state.activeView = state.lastCategory;
        }

        updateView();

        if (shouldRestoreFocus) {
          const sameAction = root.querySelector<HTMLButtonElement>(
            `[data-favorite-toggle][data-emoji-id="${emojiId}"]`,
          );
          const remainingActions = root.querySelectorAll<HTMLButtonElement>(
            '[data-favorite-toggle]',
          );
          const nearestAction = remainingActions.item(
            Math.min(focusedIndex, remainingActions.length - 1),
          );
          (sameAction ?? nearestAction)?.focus();
        }

        return;
      }

      const emojiButton = target.closest<HTMLButtonElement>('[data-emoji-id]');
      const emoji = emojiButton?.dataset.emoji;
      const emojiId = emojiButton?.dataset.emojiId;

      if (!emoji || !emojiId) {
        return;
      }

      try {
        await navigator.clipboard.writeText(emoji);
        const shouldRestoreFocus = document.activeElement === emojiButton;
        state.recentIds = recentStore.add(emojiId);
        updateCollectionNavigation();

        if (state.activeView === 'recents' && state.query.trim().length === 0) {
          updateResults();

          if (shouldRestoreFocus) {
            root
              .querySelector<HTMLButtonElement>(
                `[data-emoji-button][data-emoji-id="${emojiId}"]`,
              )
              ?.focus();
          }
        }

        showToast('Copié !');
      } catch {
        showToast('Copie impossible');
      }
    });
  }

  function showToast(message: string): void {
    state.toastMessage = message;
    updateToast();

    window.setTimeout(() => {
      if (state.toastMessage === message) {
        state.toastMessage = null;
        updateToast();
      }
    }, 1500);
  }

  function updateView(): void {
    updateCategoryNavigation();
    updateCollectionNavigation();
    updateResults();
  }

  function updateCategoryNavigation(): void {
    root.querySelectorAll<HTMLButtonElement>('[data-category-id]').forEach((button) => {
      const isActive = button.dataset.categoryId === state.activeView;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  function updateCollectionNavigation(): void {
    updateCollectionButton('recents', getRecentEmojis().length > 0, 'Recents', '◷');
    updateCollectionButton('favorites', getFavoriteEmojis().length > 0, 'Favoris', '☆');
  }

  function updateCollectionButton(
    collectionId: CollectionId,
    hasItems: boolean,
    label: string,
    icon: string,
  ): void {
    const desktopButton = root.querySelector<HTMLButtonElement>(
      `.desktop-sidebar [data-collection-id="${collectionId}"]`,
    );
    const mobileBar = root.querySelector<HTMLElement>('.mobile-category-bar');
    let mobileButton = mobileBar?.querySelector<HTMLButtonElement>(
      `[data-collection-id="${collectionId}"]`,
    );

    if (desktopButton) {
      desktopButton.disabled = !hasItems;
      desktopButton.classList.toggle('is-active', state.activeView === collectionId);
      desktopButton.setAttribute(
        'aria-current',
        state.activeView === collectionId ? 'page' : 'false',
      );
    }

    if (hasItems && mobileBar && !mobileButton) {
      mobileButton = createMobileCollectionButton(collectionId, label, icon);
      mobileBar.append(mobileButton);
    } else if (!hasItems && mobileButton) {
      mobileButton.remove();
      return;
    }

    mobileButton?.classList.toggle('is-active', state.activeView === collectionId);
    mobileButton?.setAttribute(
      'aria-current',
      state.activeView === collectionId ? 'page' : 'false',
    );
  }

  function updateResults(): void {
    const activeView = state.activeView;
    const isCollection = isCollectionView(activeView);
    const activeCategory = getCategory(isCollection ? state.lastCategory : activeView);
    const trimmedQuery = state.query.trim();
    const isSearching = trimmedQuery.length > 0;
    const visibleEmojis = isSearching
      ? searchEmojis(sampleEmojis, trimmedQuery, 'fr')
      : isCollection
        ? getCollectionEmojis(activeView)
        : getEmojisByCategory(activeView);
    const sectionLabel = isCollection
      ? state.activeView === 'recents'
        ? 'Recents'
        : 'Favoris'
      : activeCategory.label.fr;
    const heading = root.querySelector<HTMLElement>('[data-section-heading]');
    const meta = root.querySelector<HTMLElement>('[data-search-meta]');
    const results = root.querySelector<HTMLElement>('[data-results-region]');

    if (!heading || !meta || !results) {
      return;
    }

    renderEmojiResults(
      { heading, meta, results },
      {
        heading: isSearching ? 'Recherche' : sectionLabel,
        gridLabel: isSearching ? `Resultats pour ${trimmedQuery}` : sectionLabel,
        query: isSearching ? trimmedQuery : null,
        emojis: visibleEmojis,
        favoriteIds: new Set(state.favoriteIds),
      },
    );
  }

  function updateToast(): void {
    const region = root.querySelector<HTMLElement>('[data-toast-region]');

    if (!region) {
      return;
    }

    region.replaceChildren();

    if (!state.toastMessage) {
      return;
    }

    const toast = document.createElement('div');
    const icon = document.createElement('span');
    toast.className = 'copy-toast';
    toast.setAttribute('role', 'status');
    icon.setAttribute('aria-hidden', 'true');
    toast.append(icon, state.toastMessage);
    region.append(toast);
  }

  function syncSearchInputs(source: HTMLInputElement): void {
    root.querySelectorAll<HTMLInputElement>('input[type="search"]').forEach((input) => {
      if (input !== source) {
        input.value = state.query;
      }
    });
  }

  function syncThemeSelects(): void {
    root.querySelectorAll<HTMLSelectElement>('[data-theme-select]').forEach((select) => {
      select.value = themeController.getMode();
    });
  }

  function clearSearch(): void {
    state.query = '';
    root.querySelectorAll<HTMLInputElement>('input[type="search"]').forEach((input) => {
      input.value = '';
    });
  }

  function getRecentEmojis() {
    return state.recentIds.flatMap((id) => {
      const entry = getEmojiById(id);
      return entry ? [entry] : [];
    });
  }

  function getFavoriteEmojis() {
    return state.favoriteIds.flatMap((id) => {
      const entry = getEmojiById(id);
      return entry ? [entry] : [];
    });
  }

  function getCollectionEmojis(collectionId: CollectionId) {
    return collectionId === 'recents' ? getRecentEmojis() : getFavoriteEmojis();
  }

  renderShell();
}

function getCategory(id: EmojiCategoryId): EmojiCategory {
  return emojiCategories.find((category) => category.id === id) ?? emojiCategories[0];
}

function renderSearch(): string {
  return `
    <label class="search-field">
      <span aria-hidden="true">⌕</span>
      <input type="search" placeholder="Rechercher un emoji" aria-label="Rechercher un emoji" value="" />
      <kbd>Ctrl F</kbd>
    </label>
  `;
}

function renderThemeSelect(location: 'desktop' | 'mobile', mode: ThemeMode): string {
  return `
    <select
      class="theme-select"
      data-theme-select="${location}"
      aria-label="Choisir le theme"
    >
      <option value="system"${mode === 'system' ? ' selected' : ''}>Systeme</option>
      <option value="light"${mode === 'light' ? ' selected' : ''}>Clair</option>
      <option value="dark"${mode === 'dark' ? ' selected' : ''}>Sombre</option>
    </select>
  `;
}

function renderSidebarButton(
  category: EmojiCategory,
  activeView: EmojiDeckView,
): string {
  const isActive = category.id === activeView;

  return `
    <button
      class="sidebar-item${isActive ? ' is-active' : ''}"
      type="button"
      data-category-id="${category.id}"
      aria-current="${isActive ? 'page' : 'false'}"
    >
      <span class="nav-icon" aria-hidden="true">${categoryIcons[category.id]}</span>
      <span>${category.label.fr}</span>
    </button>
  `;
}

function renderMobileCategoryButton(
  category: EmojiCategory,
  activeView: EmojiDeckView,
): string {
  const isActive = category.id === activeView;

  return `
    <button
      class="mobile-category-button${isActive ? ' is-active' : ''}"
      type="button"
      data-category-id="${category.id}"
      aria-label="${category.label.fr}"
      aria-current="${isActive ? 'page' : 'false'}"
    >
      <span aria-hidden="true">${categoryIcons[category.id]}</span>
    </button>
  `;
}

function createMobileCollectionButton(
  collectionId: CollectionId,
  label: string,
  iconText: string,
): HTMLButtonElement {
  const button = document.createElement('button');
  const icon = document.createElement('span');

  button.className = 'mobile-category-button';
  button.type = 'button';
  button.dataset.collectionId = collectionId;
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-current', 'false');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = iconText;
  button.append(icon);

  return button;
}

function getBrowserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getColorSchemePreference(): ColorSchemePreference {
  if (typeof window.matchMedia !== 'function') {
    return {
      matches: false,
      addChangeListener: () => undefined,
    };
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  return {
    matches: mediaQuery.matches,
    addChangeListener(listener) {
      const handleChange = (event: MediaQueryListEvent) => listener(event.matches);

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
      }
    },
  };
}

function isCollectionView(view: EmojiDeckView): view is CollectionId {
  return view === 'recents' || view === 'favorites';
}

function bindGlobalSearchShortcut(): void {
  if (globalSearchShortcutBound) {
    return;
  }

  document.addEventListener('keydown', (event) => {
    const hasSinglePlatformModifier = event.ctrlKey !== event.metaKey;

    if (
      event.key.toLowerCase() !== 'f' ||
      !hasSinglePlatformModifier ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const shell = document.querySelector<HTMLElement>('.app-shell');
    const searches = Array.from(
      shell?.querySelectorAll<HTMLInputElement>('input[type="search"]') ?? [],
    );
    const search = searches.find((input) => input.getClientRects().length > 0) ?? searches[0];

    if (search) {
      event.preventDefault();
      search.focus();
      search.select();
    }
  });

  globalSearchShortcutBound = true;
}

function findVerticalEmoji(
  current: HTMLButtonElement,
  buttons: HTMLButtonElement[],
  direction: -1 | 1,
): HTMLButtonElement | undefined {
  const currentRect = current.getBoundingClientRect();
  const currentX = currentRect.left + currentRect.width / 2;
  const currentY = currentRect.top + currentRect.height / 2;

  return buttons
    .filter((button) => button !== current)
    .map((button) => {
      const rect = button.getBoundingClientRect();
      const deltaY = (rect.top + rect.height / 2 - currentY) * direction;
      const deltaX = Math.abs(rect.left + rect.width / 2 - currentX);
      return { button, deltaY, deltaX };
    })
    .filter(({ deltaY }) => deltaY > 0)
    .sort((left, right) => left.deltaY - right.deltaY || left.deltaX - right.deltaX)[0]?.button;
}
