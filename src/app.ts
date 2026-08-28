import {
  emojiCategories,
  loadEmojiCatalog,
  type EmojiCategory,
  type EmojiCatalog,
  type EmojiCategoryId,
} from './data/emojis';
import {
  Clock3,
  createIcons,
  Flag,
  LayoutGrid,
  Lightbulb,
  Maximize2,
  Menu,
  Minimize2,
  PawPrint,
  Plane,
  Search,
  Shapes,
  Smile,
  Star,
  Trophy,
  Users,
  Utensils,
} from 'lucide';
import { searchEmojis } from './data/search';
import { resolveLocale, saveLocale, supportedLocales, type LocaleCode } from './i18n/language';
import { messages, type Messages } from './i18n/messages';
import { createFavoriteEmojiStore } from './storage/favoriteEmojis';
import { createLayoutStore } from './storage/layout';
import { createRecentEmojiStore } from './storage/recentEmojis';
import {
  createSkinToneStore,
  skinTonePreferences,
  type SkinTonePreference,
} from './storage/skinTone';
import {
  createThemeController,
  type ColorSchemePreference,
  type ThemeMode,
} from './theme/theme';
import {
  completeEmojiResults,
  disposeEmojiResults,
  renderEmojiResults,
  revealMoreEmojiResults,
} from './ui/emojiResults';

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
  locale: LocaleCode;
  catalog: EmojiCatalog;
  activeView: EmojiDeckView;
  lastCategory: EmojiCategoryId;
  query: string;
  recentIds: string[];
  favoriteIds: string[];
  skinTonePreference: SkinTonePreference;
  isExpanded: boolean;
  toastMessage: string | null;
}

export interface EmojiDeckAppOptions {
  locale: LocaleCode;
  catalog: EmojiCatalog;
  loadCatalog?: (locale: LocaleCode) => Promise<EmojiCatalog>;
}

export interface EmojiDeckInitializationOptions {
  loadCatalog?: (locale: LocaleCode) => Promise<EmojiCatalog>;
}

export async function initializeEmojiDeckApp(
  root: HTMLElement,
  options: EmojiDeckInitializationOptions = {},
): Promise<void> {
  const storage = getBrowserStorage();
  const locale = resolveLocale(storage, navigator.languages);
  const text = messages[locale] ?? messages.en;
  const loader = options.loadCatalog ?? loadEmojiCatalog;
  renderAppStatus(root, text.loading);

  try {
    const catalog = await loader(locale);
    createEmojiDeckApp(root, { locale, catalog, loadCatalog: loader });
  } catch {
    renderAppStatus(root, text.loadFailed, text.retry, () => {
      void initializeEmojiDeckApp(root, options);
    });
  }
}

function renderAppStatus(
  root: HTMLElement,
  message: string,
  actionLabel?: string,
  action?: () => void,
): void {
  const shell = document.createElement('main');
  const indicator = document.createElement('span');
  const text = document.createElement('p');
  shell.className = 'app-status-shell';
  shell.setAttribute('aria-live', 'polite');
  shell.setAttribute('aria-busy', String(!action));
  indicator.className = 'app-status-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  text.textContent = message;
  shell.append(indicator, text);

  if (actionLabel && action) {
    const button = document.createElement('button');
    button.className = 'status-retry-button';
    button.type = 'button';
    button.textContent = actionLabel;
    button.addEventListener('click', action, { once: true });
    shell.append(button);
  }

  root.replaceChildren(shell);
}

export function createEmojiDeckApp(root: HTMLElement, options: EmojiDeckAppOptions): void {
  bindGlobalSearchShortcut();
  const browserStorage = getBrowserStorage();
  const recentStore = createRecentEmojiStore(browserStorage);
  const favoriteStore = createFavoriteEmojiStore(browserStorage);
  const layoutStore = createLayoutStore(browserStorage);
  const skinToneStore = createSkinToneStore(browserStorage);
  const themeController = createThemeController({
    root: document.documentElement,
    storage: browserStorage,
    colorScheme: getColorSchemePreference(),
  });
  const loadCatalog = options.loadCatalog ?? loadEmojiCatalog;
  const state: EmojiDeckState = {
    locale: options.locale,
    catalog: options.catalog,
    activeView: 'faces',
    lastCategory: 'faces',
    query: '',
    recentIds: recentStore.read(),
    favoriteIds: favoriteStore.read(),
    skinTonePreference: skinToneStore.read(),
    isExpanded: layoutStore.readExpanded(),
    toastMessage: null,
  };
  let languageRequest = 0;
  let languageCatalogsWarmed = false;
  let activeVariantTrigger: HTMLButtonElement | null = null;
  let longPressTimer: number | null = null;
  let longPressTriggeredId: string | null = null;
  document.documentElement.lang = state.locale;

  function getMessages(): Messages {
    return messages[state.locale] ?? messages.en;
  }

  function renderShell(): void {
    const text = getMessages();
    activeVariantTrigger = null;
    const previousResults = root.querySelector<HTMLElement>('[data-results-region]');
    if (previousResults) {
      disposeEmojiResults(previousResults);
    }

    root.innerHTML = `
      <main class="app-shell${state.isExpanded ? ' is-expanded' : ''}" aria-label="EmojiDeck">
        <aside class="desktop-sidebar" aria-label="${text.categoriesLabel}">
          <a class="brand" href="#" aria-label="${text.home}">EmojiDeck</a>
          <nav class="sidebar-nav" aria-label="${text.categoriesLabel}">
            ${emojiCategories.map((category) => renderSidebarButton(category, state.activeView, text)).join('')}
          </nav>
          <div class="sidebar-separator" role="presentation"></div>
          <nav class="sidebar-nav utility-nav" aria-label="${text.collectionsLabel}">
            <button class="sidebar-item" type="button" data-collection-id="recents" disabled>
              <span class="nav-icon" aria-hidden="true">${renderIcon('clock-3')}</span>
              <span>${text.recents}</span>
            </button>
            <button class="sidebar-item" type="button" data-collection-id="favorites" disabled>
              <span class="nav-icon" aria-hidden="true">${renderIcon('star')}</span>
              <span>${text.favorites}</span>
            </button>
          </nav>
        </aside>

        <section class="main-panel">
          <header class="desktop-topbar">
            ${renderSearch(text)}
            <div class="desktop-controls" aria-label="${text.preferences}">
              <label class="theme-control">
                <span>${text.theme}</span>
                ${renderThemeSelect('desktop', themeController.getMode(), text)}
              </label>
              <label class="skin-tone-control">
                <span>${text.skinTone}</span>
                ${renderSkinToneSelect('desktop', state.skinTonePreference, text)}
              </label>
              <label class="language-control">
                <span>${text.language}</span>
                ${renderLanguageSelect('desktop', state.locale, text)}
              </label>
              ${renderLayoutToggle(state.isExpanded, text)}
            </div>
          </header>

          <header class="mobile-header">
            <a class="brand" href="#" aria-label="${text.home}">EmojiDeck</a>
            <button
              class="mobile-menu-button"
              type="button"
              aria-label="${text.openMenu}"
              aria-controls="mobile-settings"
              aria-expanded="false"
            >${renderIcon('menu')}</button>
          </header>
          <div id="mobile-settings" class="mobile-settings" data-mobile-menu hidden>
            <label class="mobile-setting-row">
              <span>${text.theme}</span>
              ${renderThemeSelect('mobile', themeController.getMode(), text)}
            </label>
            ${renderMobileLayoutToggle(state.isExpanded, text)}
            <label class="mobile-setting-row">
              <span>${text.language}</span>
              ${renderLanguageSelect('mobile', state.locale, text)}
            </label>
            <label class="mobile-setting-row">
              <span>${text.skinTone}</span>
              ${renderSkinToneSelect('mobile', state.skinTonePreference, text)}
            </label>
          </div>
          <div class="mobile-search">${renderSearch(text)}</div>
          <nav class="mobile-category-bar" aria-label="${text.mobileCategoriesLabel}">
            ${emojiCategories.map((category) => renderMobileCategoryButton(category, state.activeView, text)).join('')}
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
        <div data-variant-menu-region></div>
      </main>
    `;

    root.querySelectorAll<HTMLInputElement>('input[type="search"]').forEach((input) => {
      input.value = state.query;
    });
    renderLucideIcons();
    updateView();
  }

  async function copyEmojiValue(
    emoji: string,
    emojiId: string,
    sourceButton?: HTMLButtonElement,
  ): Promise<void> {
    try {
      await navigator.clipboard.writeText(emoji);
      const shouldRestoreFocus = sourceButton && document.activeElement === sourceButton;
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

      showToast(getMessages().copied);
    } catch {
      showToast(getMessages().copyFailed);
    }
  }

  function openVariantMenu(emojiId: string, source: HTMLButtonElement): void {
    const entry = state.catalog.getById(emojiId);
    if (!entry?.skinToneVariants?.length) {
      return;
    }

    closeVariantMenu(false);
    const trigger =
      source.matches('[data-variant-toggle]')
        ? source
        : source.closest('.emoji-cell')?.querySelector<HTMLButtonElement>('[data-variant-toggle]') ??
          source;
    const region = root.querySelector<HTMLElement>('[data-variant-menu-region]');
    if (!region) {
      return;
    }

    const text = getMessages();
    const popover = document.createElement('div');
    const heading = document.createElement('h2');
    const grid = document.createElement('div');
    const variants = [entry.emoji, ...entry.skinToneVariants];
    const headingId = `skin-tone-heading-${entry.id}`;
    popover.className = 'skin-tone-popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-modal', 'false');
    popover.setAttribute('aria-labelledby', headingId);
    heading.id = headingId;
    heading.textContent = text.variantsFor(entry.name);
    grid.className = 'skin-tone-variant-grid';

    for (const [index, variant] of variants.entries()) {
      const option = document.createElement('button');
      const toneLabel = getVariantToneLabel(variant, index, text);
      option.className = 'skin-tone-variant';
      option.type = 'button';
      option.dataset.variantOption = '';
      option.dataset.emoji = variant;
      option.dataset.emojiId = entry.id;
      option.setAttribute('aria-label', text.copyVariant(entry.name, toneLabel));
      option.title = toneLabel;
      option.textContent = variant;
      grid.append(option);
    }

    popover.append(heading, grid);
    region.append(popover);
    activeVariantTrigger = trigger;
    trigger.setAttribute('aria-expanded', 'true');

    const rect = source.getBoundingClientRect();
    const width = popover.offsetWidth || 336;
    const height = popover.offsetHeight || 260;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    popover.style.left = `${Math.max(12, Math.min(rect.left, viewportWidth - width - 12))}px`;
    popover.style.top = `${rect.bottom + height + 12 > viewportHeight ? Math.max(12, rect.top - height - 8) : rect.bottom + 8}px`;
    grid.querySelector<HTMLButtonElement>('[data-variant-option]')?.focus();
  }

  function closeVariantMenu(restoreFocus: boolean): void {
    const trigger = activeVariantTrigger;
    root.querySelector<HTMLElement>('[data-variant-menu-region]')?.replaceChildren();
    trigger?.setAttribute('aria-expanded', 'false');
    activeVariantTrigger = null;
    if (restoreFocus) {
      trigger?.focus();
    }
  }

  function clearLongPressTimer(): void {
    if (longPressTimer !== null) {
      window.clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function bindEvents(): void {
    root.addEventListener('focusin', (event) => {
      if (event.target instanceof Element && event.target.matches('[data-language-select]')) {
        warmLanguageCatalogs();
      }
    });

    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && activeVariantTrigger) {
        event.preventDefault();
        closeVariantMenu(true);
        return;
      }

      const variantOption =
        event.target instanceof Element
          ? event.target.closest<HTMLButtonElement>('[data-variant-option]')
          : null;

      if (variantOption && ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        const options = Array.from(
          root.querySelectorAll<HTMLButtonElement>('[data-variant-option]'),
        );
        const currentIndex = options.indexOf(variantOption);
        const columns = 6;
        const nextIndex =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? options.length - 1
              : currentIndex +
                (event.key === 'ArrowRight'
                  ? 1
                  : event.key === 'ArrowLeft'
                    ? -1
                    : event.key === 'ArrowDown'
                      ? columns
                      : -columns);
        event.preventDefault();
        options[nextIndex]?.focus();
        return;
      }

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
        const resultsRegion = root.querySelector<HTMLElement>('[data-results-region]');
        if (resultsRegion) {
          completeEmojiResults(resultsRegion);
        }
        const buttons = root.querySelectorAll<HTMLButtonElement>('[data-emoji-button]');
        const lastButton = buttons.item(buttons.length - 1);

        if (lastButton) {
          lastButton.focus();
        }
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        let buttons = Array.from(
          root.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'),
        );
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        let nextButton = findVerticalEmoji(button, buttons, direction);

        if (!nextButton && direction === 1) {
          const resultsRegion = root.querySelector<HTMLElement>('[data-results-region]');
          if (resultsRegion) {
            revealMoreEmojiResults(resultsRegion);
            buttons = Array.from(
              root.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'),
            );
            nextButton = findVerticalEmoji(button, buttons, direction);
          }
        }

        if (nextButton) {
          nextButton.focus();
        }
      }
    });

    root.addEventListener('change', async (event) => {
      const select = event.target;

      if (!(select instanceof HTMLSelectElement)) {
        return;
      }

      if (select.matches('[data-theme-select]')) {
        themeController.setMode(select.value as ThemeMode);
        syncThemeSelects();
        return;
      }

      if (select.matches('[data-language-select]')) {
        await changeLanguage(select.value as LocaleCode);
        return;
      }

      if (select.matches('[data-skin-tone-select]')) {
        const preference = select.value as SkinTonePreference;
        if (skinTonePreferences.includes(preference)) {
          state.skinTonePreference = preference;
          skinToneStore.write(preference);
          syncSkinToneSelects();
          closeVariantMenu(false);
          updateResults();
        }
      }
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

      const variantOption = target.closest<HTMLButtonElement>('[data-variant-option]');

      if (variantOption?.dataset.emoji && variantOption.dataset.emojiId) {
        const trigger = activeVariantTrigger;
        closeVariantMenu(false);
        await copyEmojiValue(variantOption.dataset.emoji, variantOption.dataset.emojiId);
        trigger?.focus();
        return;
      }

      const variantToggle = target.closest<HTMLButtonElement>('[data-variant-toggle]');

      if (variantToggle?.dataset.emojiId) {
        if (activeVariantTrigger === variantToggle) {
          closeVariantMenu(true);
        } else {
          openVariantMenu(variantToggle.dataset.emojiId, variantToggle);
        }
        return;
      }

      if (activeVariantTrigger && !target.closest('.skin-tone-popover')) {
        closeVariantMenu(false);
      }

      const menuButton = target.closest<HTMLButtonElement>('.mobile-menu-button');

      if (menuButton) {
        const menu = root.querySelector<HTMLElement>('[data-mobile-menu]');

        if (menu) {
          const text = getMessages();
          menu.hidden = !menu.hidden;
          menuButton.setAttribute('aria-expanded', String(!menu.hidden));
          menuButton.setAttribute('aria-label', menu.hidden ? text.openMenu : text.closeMenu);
        }

        return;
      }

      const layoutButton = target.closest<HTMLButtonElement>('[data-layout-toggle]');

      if (layoutButton) {
        state.isExpanded = !state.isExpanded;
        layoutStore.writeExpanded(state.isExpanded);
        syncExpandedLayout();
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

      if (longPressTriggeredId === emojiId) {
        longPressTriggeredId = null;
        return;
      }

      await copyEmojiValue(emoji, emojiId, emojiButton);
    });

    root.addEventListener('contextmenu', (event) => {
      const button =
        event.target instanceof Element
          ? event.target.closest<HTMLButtonElement>('[data-emoji-button][data-supports-skin-tone="true"]')
          : null;

      if (button?.dataset.emojiId) {
        event.preventDefault();
        openVariantMenu(button.dataset.emojiId, button);
      }
    });

    root.addEventListener('pointerdown', (event) => {
      if (event.target instanceof Element && event.target.matches('[data-language-select]')) {
        warmLanguageCatalogs();
        return;
      }

      const button =
        event.target instanceof Element
          ? event.target.closest<HTMLButtonElement>('[data-emoji-button][data-supports-skin-tone="true"]')
          : null;

      clearLongPressTimer();
      if (!button?.dataset.emojiId || event.button !== 0) {
        return;
      }

      const emojiId = button.dataset.emojiId;
      longPressTriggeredId = null;
      longPressTimer = window.setTimeout(() => {
        longPressTriggeredId = emojiId;
        openVariantMenu(emojiId, button);
      }, 500);
    });

    root.addEventListener('pointerup', clearLongPressTimer);
    root.addEventListener('pointercancel', clearLongPressTimer);
    root.addEventListener('pointermove', clearLongPressTimer);
  }

  function warmLanguageCatalogs(): void {
    if (languageCatalogsWarmed) {
      return;
    }

    languageCatalogsWarmed = true;
    for (const locale of supportedLocales) {
      if (locale !== state.locale) {
        void loadCatalog(locale).catch(() => undefined);
      }
    }
  }

  async function changeLanguage(locale: LocaleCode): Promise<void> {
    if (!supportedLocales.includes(locale) || locale === state.locale) {
      syncLanguageSelects();
      return;
    }

    const request = ++languageRequest;
    setLanguageSelectsDisabled(true);

    try {
      const catalog = await loadCatalog(locale);
      if (request !== languageRequest) {
        return;
      }

      state.locale = locale;
      state.catalog = catalog;
      document.documentElement.lang = locale;
      saveLocale(browserStorage, locale);
      renderShell();
    } finally {
      if (request === languageRequest) {
        setLanguageSelectsDisabled(false);
      }
    }
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
    const text = getMessages();
    updateCollectionButton('recents', getRecentEmojis().length > 0, text.recents, 'clock-3');
    updateCollectionButton('favorites', getFavoriteEmojis().length > 0, text.favorites, 'star');
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
      renderLucideIcons();
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
    const text = getMessages();
    const activeView = state.activeView;
    const isCollection = isCollectionView(activeView);
    const activeCategory = getCategory(isCollection ? state.lastCategory : activeView);
    const trimmedQuery = state.query.trim();
    const isSearching = trimmedQuery.length > 0;
    const viewEmojis = isCollection
      ? getCollectionEmojis(activeView)
      : state.catalog.getByCategory(activeView);
    const visibleEmojis = isSearching
      ? searchEmojis(viewEmojis, trimmedQuery)
      : viewEmojis;
    const sectionLabel = isCollection
      ? state.activeView === 'recents'
        ? text.recents
        : text.favorites
      : text.categories[activeCategory.id];
    const heading = root.querySelector<HTMLElement>('[data-section-heading]');
    const meta = root.querySelector<HTMLElement>('[data-search-meta]');
    const results = root.querySelector<HTMLElement>('[data-results-region]');

    if (!heading || !meta || !results) {
      return;
    }

    renderEmojiResults(
      { heading, meta, results },
      {
        heading: isSearching ? text.searchHeading : sectionLabel,
        gridLabel: isSearching ? text.resultsLabel(trimmedQuery) : sectionLabel,
        query: isSearching ? trimmedQuery : null,
        emojis: visibleEmojis,
        favoriteIds: new Set(state.favoriteIds),
        messages: text,
        skinTonePreference: state.skinTonePreference,
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

  function syncLanguageSelects(): void {
    root.querySelectorAll<HTMLSelectElement>('[data-language-select]').forEach((select) => {
      select.value = state.locale;
    });
  }

  function syncSkinToneSelects(): void {
    root.querySelectorAll<HTMLSelectElement>('[data-skin-tone-select]').forEach((select) => {
      select.value = state.skinTonePreference;
    });
  }

  function syncExpandedLayout(): void {
    const text = getMessages();
    const label = state.isExpanded ? text.collapseApp : text.expandApp;
    const icon = state.isExpanded ? 'minimize-2' : 'maximize-2';
    root.querySelector<HTMLElement>('.app-shell')?.classList.toggle(
      'is-expanded',
      state.isExpanded,
    );
    root.querySelectorAll<HTMLButtonElement>('[data-layout-toggle]').forEach((button) => {
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', String(state.isExpanded));
      button.dataset.tooltip = label;
      button.title = label;
      button.innerHTML = button.classList.contains('mobile-layout-toggle')
        ? `<span>${label}</span>${renderIcon(icon)}`
        : renderIcon(icon);
    });
    renderLucideIcons();
    updateResults();
  }

  function setLanguageSelectsDisabled(disabled: boolean): void {
    root.querySelectorAll<HTMLSelectElement>('[data-language-select]').forEach((select) => {
      select.disabled = disabled;
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
      const entry = state.catalog.getById(id);
      return entry ? [entry] : [];
    });
  }

  function getFavoriteEmojis() {
    return state.favoriteIds.flatMap((id) => {
      const entry = state.catalog.getById(id);
      return entry ? [entry] : [];
    });
  }

  function getCollectionEmojis(collectionId: CollectionId) {
    return collectionId === 'recents' ? getRecentEmojis() : getFavoriteEmojis();
  }

  renderShell();
  bindEvents();
  scheduleEmojiGlyphWarmup(state.catalog);
}

function getCategory(id: EmojiCategoryId): EmojiCategory {
  return emojiCategories.find((category) => category.id === id) ?? emojiCategories[0];
}

function scheduleEmojiGlyphWarmup(catalog: EmojiCatalog): void {
  if (typeof CanvasRenderingContext2D === 'undefined') {
    return;
  }

  const canvas = document.createElement('canvas');
  let context: CanvasRenderingContext2D | null;
  try {
    context = canvas.getContext('2d');
  } catch {
    return;
  }
  if (!context) {
    return;
  }

  canvas.width = 64;
  canvas.height = 64;
  context.font = '38px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  context.textBaseline = 'top';
  const priorityCategories: EmojiCategoryId[] = [
    'people',
    'objects',
    'flags',
    'animals',
    'food',
    'travel',
    'activities',
    'symbols',
  ];
  const queue = priorityCategories.flatMap((category) =>
    catalog.getByCategory(category).slice(0, 24),
  );

  function warmNext(): void {
    const entry = queue.shift();
    if (!entry) {
      return;
    }

    context?.clearRect(0, 0, canvas.width, canvas.height);
    context?.fillText(entry.emoji, 4, 4);
    scheduleIdleWork(warmNext);
  }

  scheduleIdleWork(warmNext);
}

function scheduleIdleWork(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 1500 });
  } else {
    setTimeout(callback, 16);
  }
}

const lucideIcons = {
  Clock3,
  Flag,
  LayoutGrid,
  Lightbulb,
  Maximize2,
  Menu,
  Minimize2,
  PawPrint,
  Plane,
  Search,
  Shapes,
  Smile,
  Star,
  Trophy,
  Users,
  Utensils,
};

function renderIcon(name: string): string {
  return `<i data-lucide="${name}"></i>`;
}

function renderLucideIcons(): void {
  createIcons({
    icons: lucideIcons,
    attrs: {
      'aria-hidden': 'true',
      'stroke-width': 1.8,
    },
  });
}

function renderLayoutToggle(isExpanded: boolean, text: Messages): string {
  const label = isExpanded ? text.collapseApp : text.expandApp;
  return `
    <button
      class="layout-toggle"
      type="button"
      data-layout-toggle
      aria-label="${label}"
      aria-pressed="${isExpanded}"
      data-tooltip="${label}"
      title="${label}"
    >${renderIcon(isExpanded ? 'minimize-2' : 'maximize-2')}</button>
  `;
}

function renderMobileLayoutToggle(isExpanded: boolean, text: Messages): string {
  const label = isExpanded ? text.collapseApp : text.expandApp;
  return `
    <button
      class="mobile-setting-row mobile-layout-toggle"
      type="button"
      data-layout-toggle
      aria-label="${label}"
      aria-pressed="${isExpanded}"
      title="${label}"
    ><span>${label}</span>${renderIcon(isExpanded ? 'minimize-2' : 'maximize-2')}</button>
  `;
}

function renderSearch(text: Messages): string {
  return `
    <label class="search-field">
      <span class="search-icon" aria-hidden="true">${renderIcon('search')}</span>
      <input type="search" placeholder="${text.searchPlaceholder}" aria-label="${text.searchPlaceholder}" />
      <kbd>Ctrl F</kbd>
    </label>
  `;
}

function renderThemeSelect(
  location: 'desktop' | 'mobile',
  mode: ThemeMode,
  text: Messages,
): string {
  return `
    <select
      class="theme-select"
      data-theme-select="${location}"
      aria-label="${text.chooseTheme}"
    >
      <option value="system"${mode === 'system' ? ' selected' : ''}>${text.system}</option>
      <option value="light"${mode === 'light' ? ' selected' : ''}>${text.light}</option>
      <option value="dark"${mode === 'dark' ? ' selected' : ''}>${text.dark}</option>
    </select>
  `;
}

function renderLanguageSelect(
  location: 'desktop' | 'mobile',
  locale: LocaleCode,
  text: Messages,
): string {
  return `
    <select
      class="language-select"
      data-language-select="${location}"
      aria-label="${text.chooseLanguage}"
    >
      ${supportedLocales.map((option) => `<option value="${option}"${option === locale ? ' selected' : ''}>${option.toUpperCase()}</option>`).join('')}
    </select>
  `;
}

function renderSkinToneSelect(
  location: 'desktop' | 'mobile',
  preference: SkinTonePreference,
  text: Messages,
): string {
  const previews: Record<SkinTonePreference, string> = {
    neutral: '✋',
    light: '✋🏻',
    'medium-light': '✋🏼',
    medium: '✋🏽',
    'medium-dark': '✋🏾',
    dark: '✋🏿',
  };

  return `
    <select
      class="skin-tone-select"
      data-skin-tone-select="${location}"
      aria-label="${text.chooseSkinTone}"
    >
      ${skinTonePreferences.map((option) => `<option value="${option}" aria-label="${text.skinToneNames[option]}"${option === preference ? ' selected' : ''}>${previews[option]}</option>`).join('')}
    </select>
  `;
}

function getVariantToneLabel(variant: string, index: number, text: Messages): string {
  if (index === 0) {
    return text.skinToneNames.neutral;
  }

  const preferenceByModifier = new Map<number, SkinTonePreference>([
    [0x1f3fb, 'light'],
    [0x1f3fc, 'medium-light'],
    [0x1f3fd, 'medium'],
    [0x1f3fe, 'medium-dark'],
    [0x1f3ff, 'dark'],
  ]);
  const tones = [
    ...new Set(
      [...variant]
        .map((character) => preferenceByModifier.get(character.codePointAt(0) ?? 0))
        .filter((tone): tone is SkinTonePreference => tone !== undefined),
    ),
  ];

  return tones.map((tone) => text.skinToneNames[tone]).join(' + ');
}

function renderSidebarButton(
  category: EmojiCategory,
  activeView: EmojiDeckView,
  text: Messages,
): string {
  const isActive = category.id === activeView;

  return `
    <button
      class="sidebar-item${isActive ? ' is-active' : ''}"
      type="button"
      data-category-id="${category.id}"
      aria-current="${isActive ? 'page' : 'false'}"
    >
      <span class="nav-icon" aria-hidden="true">${renderIcon(category.icon)}</span>
      <span>${text.categories[category.id]}</span>
    </button>
  `;
}

function renderMobileCategoryButton(
  category: EmojiCategory,
  activeView: EmojiDeckView,
  text: Messages,
): string {
  const isActive = category.id === activeView;

  return `
    <button
      class="mobile-category-button${isActive ? ' is-active' : ''}"
      type="button"
      data-category-id="${category.id}"
      aria-label="${text.categories[category.id]}"
      aria-current="${isActive ? 'page' : 'false'}"
    >
      <span aria-hidden="true">${renderIcon(category.icon)}</span>
    </button>
  `;
}

function createMobileCollectionButton(
  collectionId: CollectionId,
  label: string,
  iconName: string,
): HTMLButtonElement {
  const button = document.createElement('button');
  const icon = document.createElement('span');

  button.className = 'mobile-category-button';
  button.type = 'button';
  button.dataset.collectionId = collectionId;
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-current', 'false');
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = renderIcon(iconName);
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
