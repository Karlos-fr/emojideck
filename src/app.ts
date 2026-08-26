import {
  emojiCategories,
  getEmojisByCategory,
  type EmojiCategory,
  type EmojiCategoryId,
  type EmojiEntry,
} from './data/emojis';

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
  toastMessage: string | null;
}

export function createEmojiDeckApp(root: HTMLElement): void {
  const state: EmojiDeckState = {
    activeCategory: 'faces',
    toastMessage: null,
  };

  function render(): void {
    const activeCategory = getCategory(state.activeCategory);
    const activeEmojis = getEmojisByCategory(state.activeCategory);

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
              <button class="plain-control" type="button" data-theme-mode>
                <span>Theme</span>
                <span aria-hidden="true">◐</span>
                <span class="control-value">Systeme</span>
              </button>
              <button class="plain-control language-control" type="button" data-language-select>
                <span>Langue</span>
                <span class="control-value">FR</span>
                <span aria-hidden="true">⌄</span>
              </button>
            </div>
          </header>

          <header class="mobile-header">
            <a class="brand" href="#" aria-label="EmojiDeck accueil">EmojiDeck</a>
            <button class="mobile-menu-button" type="button" aria-label="Ouvrir le menu">☰</button>
          </header>
          <div class="mobile-search">${renderSearch()}</div>
          <nav class="mobile-category-bar" aria-label="Categories emoji mobile">
            ${emojiCategories.map((category) => renderMobileCategoryButton(category, state.activeCategory)).join('')}
          </nav>

          <div class="content-scroll">
            <section class="emoji-section" aria-labelledby="emoji-section-heading">
              <h1 id="emoji-section-heading" data-section-heading>${activeCategory.label.fr}</h1>
              <div class="emoji-grid" aria-label="${activeCategory.label.fr}">
                ${activeEmojis.map(renderEmojiButton).join('')}
              </div>
            </section>
          </div>
        </section>

        ${state.toastMessage ? `<div class="copy-toast" role="status"><span aria-hidden="true"></span>${state.toastMessage}</div>` : ''}
      </main>
    `;

    bindEvents();
  }

  function bindEvents(): void {
    root.querySelectorAll<HTMLButtonElement>('[data-category-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.dataset.categoryId as EmojiCategoryId | undefined;

        if (category) {
          state.activeCategory = category;
          render();
        }
      });
    });

    root.querySelectorAll<HTMLButtonElement>('[data-emoji-id]').forEach((button) => {
      button.addEventListener('click', async () => {
        const emoji = button.dataset.emoji;

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
    });
  }

  function showToast(message: string): void {
    state.toastMessage = message;
    render();

    window.setTimeout(() => {
      if (state.toastMessage === message) {
        state.toastMessage = null;
        render();
      }
    }, 1500);
  }

  render();
}

function getCategory(id: EmojiCategoryId): EmojiCategory {
  return emojiCategories.find((category) => category.id === id) ?? emojiCategories[0];
}

function renderSearch(): string {
  return `
    <label class="search-field">
      <span aria-hidden="true">⌕</span>
      <input type="search" placeholder="Rechercher un emoji" aria-label="Rechercher un emoji" />
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

function renderEmojiButton(entry: EmojiEntry): string {
  return `
    <button
      class="emoji-button"
      type="button"
      title="${entry.name.fr}"
      aria-label="${entry.name.fr}"
      data-emoji-button
      data-emoji-id="${entry.id}"
      data-emoji="${entry.emoji}"
      data-category="${entry.category}"
    >
      <span aria-hidden="true">${entry.emoji}</span>
    </button>
  `;
}
