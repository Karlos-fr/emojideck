import {
  emojiCategories,
  getEmojisByCategory,
  sampleEmojis,
  type EmojiCategory,
  type EmojiCategoryId,
} from './data/emojis';
import { searchEmojis } from './data/search';
import { renderEmojiResults } from './ui/emojiResults';

const categoryIcons: Record<EmojiCategoryId, string> = {
  faces: '☺',
  animals: '♧',
  food: '♢',
  objects: '▣',
  symbols: '✧',
  flags: '⚑',
};

interface EmojiDeckState {
  activeCategory: EmojiCategoryId;
  query: string;
  toastMessage: string | null;
}

export function createEmojiDeckApp(root: HTMLElement): void {
  const state: EmojiDeckState = {
    activeCategory: 'faces',
    query: '',
    toastMessage: null,
  };

  function renderShell(): void {
    root.innerHTML = `
      <main class="app-shell" aria-label="EmojiDeck">
        <aside class="desktop-sidebar" aria-label="Categories">
          <a class="brand" href="#" aria-label="EmojiDeck accueil">EmojiDeck</a>
          <nav class="sidebar-nav" aria-label="Categories emoji">
            ${emojiCategories.map((category) => renderSidebarButton(category, state.activeCategory)).join('')}
          </nav>
          <div class="sidebar-separator" role="presentation"></div>
          <nav class="sidebar-nav utility-nav" aria-label="Collections">
            <button class="sidebar-item" type="button" disabled>
              <span class="nav-icon" aria-hidden="true">◷</span>
              <span>Recents</span>
            </button>
            <button class="sidebar-item" type="button" disabled>
              <span class="nav-icon" aria-hidden="true">☆</span>
              <span>Favoris</span>
            </button>
          </nav>
        </aside>

        <section class="main-panel">
          <header class="desktop-topbar">
            ${renderSearch()}
            <div class="desktop-controls" aria-label="Preferences">
              <button class="plain-control" type="button" data-theme-mode disabled>
                <span>Theme</span>
                <span aria-hidden="true">◐</span>
                <span class="control-value">Systeme</span>
              </button>
              <button class="plain-control language-control" type="button" data-language-select disabled>
                <span>Langue</span>
                <span class="control-value">FR</span>
                <span aria-hidden="true">⌄</span>
              </button>
            </div>
          </header>

          <header class="mobile-header">
            <a class="brand" href="#" aria-label="EmojiDeck accueil">EmojiDeck</a>
            <button class="mobile-menu-button" type="button" aria-label="Ouvrir le menu" disabled>☰</button>
          </header>
          <div class="mobile-search">${renderSearch()}</div>
          <nav class="mobile-category-bar" aria-label="Categories emoji mobile">
            ${emojiCategories.map((category) => renderMobileCategoryButton(category, state.activeCategory)).join('')}
          </nav>

          <div class="content-scroll">
            <section class="emoji-section" aria-labelledby="emoji-section-heading">
              <h1 id="emoji-section-heading" data-section-heading></h1>
              <div data-search-meta></div>
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

      const categoryButton = target.closest<HTMLButtonElement>('[data-category-id]');

      if (categoryButton?.dataset.categoryId) {
        state.activeCategory = categoryButton.dataset.categoryId as EmojiCategoryId;
        updateView();
        return;
      }

      const emojiButton = target.closest<HTMLButtonElement>('[data-emoji-id]');
      const emoji = emojiButton?.dataset.emoji;

      if (!emoji) {
        return;
      }

      try {
        await navigator.clipboard.writeText(emoji);
        showToast('Copie !');
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
    updateResults();
  }

  function updateCategoryNavigation(): void {
    root.querySelectorAll<HTMLButtonElement>('[data-category-id]').forEach((button) => {
      const isActive = button.dataset.categoryId === state.activeCategory;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  function updateResults(): void {
    const activeCategory = getCategory(state.activeCategory);
    const trimmedQuery = state.query.trim();
    const isSearching = trimmedQuery.length > 0;
    const visibleEmojis = isSearching
      ? searchEmojis(sampleEmojis, trimmedQuery, 'fr')
      : getEmojisByCategory(state.activeCategory);
    const heading = root.querySelector<HTMLElement>('[data-section-heading]');
    const meta = root.querySelector<HTMLElement>('[data-search-meta]');
    const results = root.querySelector<HTMLElement>('[data-results-region]');

    if (!heading || !meta || !results) {
      return;
    }

    renderEmojiResults(
      { heading, meta, results },
      {
        heading: isSearching ? 'Recherche' : activeCategory.label.fr,
        gridLabel: isSearching ? `Resultats pour ${trimmedQuery}` : activeCategory.label.fr,
        query: isSearching ? trimmedQuery : null,
        emojis: visibleEmojis,
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
      <kbd>Ctrl K</kbd>
    </label>
  `;
}

function renderSidebarButton(category: EmojiCategory, activeCategory: EmojiCategoryId): string {
  const isActive = category.id === activeCategory;

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

function renderMobileCategoryButton(category: EmojiCategory, activeCategory: EmojiCategoryId): string {
  const isActive = category.id === activeCategory;

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
