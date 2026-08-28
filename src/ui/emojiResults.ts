import type { EmojiEntry } from '../data/emojis';
import type { Messages } from '../i18n/messages';
import { applySkinTone, type SkinTonePreference } from '../storage/skinTone';

export interface EmojiResultsElements {
  heading: HTMLElement;
  meta: HTMLElement;
  results: HTMLElement;
}

export interface EmojiResultsView {
  heading: string;
  gridLabel: string;
  query: string | null;
  emojis: EmojiEntry[];
  favoriteIds: ReadonlySet<string>;
  skinTonePreference: SkinTonePreference;
  messages: Messages;
}

interface ProgressiveGridState {
  grid: HTMLDivElement;
  sentinel: HTMLDivElement;
  observer: IntersectionObserver;
  entries: EmojiEntry[];
  index: number;
  batchSize: number;
  isSearchResult: boolean;
  favoriteIds: ReadonlySet<string>;
  skinTonePreference: SkinTonePreference;
  messages: Messages;
}

const progressiveGrids = new WeakMap<HTMLElement, ProgressiveGridState>();

export function renderEmojiResults(
  elements: EmojiResultsElements,
  view: EmojiResultsView,
): void {
  disposeEmojiResults(elements.results);
  elements.heading.textContent = view.heading;
  elements.meta.replaceChildren();
  elements.results.replaceChildren();

  if (view.query !== null) {
    const summary = document.createElement('p');
    summary.className = 'search-summary';
    summary.dataset.searchSummary = '';
    summary.textContent = view.messages.searchResults(view.emojis.length, view.query);
    elements.meta.append(summary);
  }

  if (view.emojis.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.dataset.emptyState = '';
    emptyState.textContent = view.messages.noResults(view.query ?? '');
    elements.results.append(emptyState);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'emoji-grid';
  grid.setAttribute('role', 'group');
  grid.setAttribute('aria-label', view.gridLabel);
  elements.results.append(grid);

  const batchSize = getRenderBatchSize(grid);

  if (typeof IntersectionObserver === 'undefined' || view.emojis.length <= 80) {
    appendEmojiCells(grid, view.emojis, view, 0, view.emojis.length, batchSize);
    return;
  }

  const sentinel = document.createElement('div');
  sentinel.className = 'emoji-grid-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  grid.setAttribute('aria-busy', 'true');
  appendEmojiCells(grid, view.emojis, view, 0, batchSize, batchSize);
  elements.results.append(sentinel);

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        revealMoreEmojiResults(elements.results);
      }
    },
    {
      root: elements.results.closest('.content-scroll'),
      rootMargin: '300px 0px',
    },
  );
  progressiveGrids.set(elements.results, {
    grid,
    sentinel,
    observer,
    entries: view.emojis,
    index: Math.min(batchSize, view.emojis.length),
    batchSize,
    isSearchResult: view.query !== null,
    favoriteIds: view.favoriteIds,
    skinTonePreference: view.skinTonePreference,
    messages: view.messages,
  });
  observer.observe(sentinel);
}

export function revealMoreEmojiResults(results: HTMLElement): void {
  const state = progressiveGrids.get(results);
  if (!state) {
    return;
  }

  const end = Math.min(state.index + state.batchSize, state.entries.length);
  appendEmojiCells(state.grid, state.entries, state, state.index, end, state.batchSize);
  state.index = end;

  if (state.index >= state.entries.length) {
    disposeEmojiResults(results);
  } else {
    state.observer.unobserve(state.sentinel);
    requestAnimationFrame(() => {
      if (progressiveGrids.get(results) === state) {
        state.observer.observe(state.sentinel);
      }
    });
  }
}

export function completeEmojiResults(results: HTMLElement): void {
  const state = progressiveGrids.get(results);
  if (!state) {
    return;
  }

  appendEmojiCells(
    state.grid,
    state.entries,
    state,
    state.index,
    state.entries.length,
    state.batchSize,
  );
  state.index = state.entries.length;
  disposeEmojiResults(results);
}

export function disposeEmojiResults(results: HTMLElement): void {
  const state = progressiveGrids.get(results);
  if (!state) {
    return;
  }

  state.observer.disconnect();
  state.grid.setAttribute('aria-busy', 'false');
  state.sentinel.remove();
  progressiveGrids.delete(results);
}

function appendEmojiCells(
  grid: HTMLDivElement,
  entries: EmojiEntry[],
  view: Pick<EmojiResultsView, 'query' | 'favoriteIds' | 'skinTonePreference' | 'messages'> | ProgressiveGridState,
  start: number,
  end: number,
  renderBatchSize: number,
): void {
  const isSearchResult = 'isSearchResult' in view ? view.isSearchResult : view.query !== null;
  const fragment = document.createDocumentFragment();

  if (isFirefox()) {
    for (let index = start; index < end; index += 1) {
      const entry = entries[index];
      fragment.append(
        createEmojiCell(
          entry,
          isSearchResult,
          view.favoriteIds.has(entry.id),
          view.skinTonePreference,
          view.messages,
        ),
      );
    }
    grid.append(fragment);
    return;
  }

  for (let batchStart = start; batchStart < end; batchStart += renderBatchSize) {
    const batch = document.createElement('div');
    const batchEnd = Math.min(batchStart + renderBatchSize, end);
    batch.className = 'emoji-grid-batch';

    for (let index = batchStart; index < batchEnd; index += 1) {
      const entry = entries[index];
      batch.append(
        createEmojiCell(
          entry,
          isSearchResult,
          view.favoriteIds.has(entry.id),
          view.skinTonePreference,
          view.messages,
        ),
      );
    }

    fragment.append(batch);
  }
  grid.append(fragment);
}

function isFirefox(): boolean {
  return typeof navigator !== 'undefined' && /Firefox\//.test(navigator.userAgent);
}

function getRenderBatchSize(grid: HTMLDivElement): number {
  const isMobile = typeof matchMedia === 'function' && matchMedia('(max-width: 899px)').matches;
  if (isMobile) {
    return 20;
  }

  const width = grid.clientWidth;
  const columns = width > 0 ? Math.max(1, Math.floor((width + 20) / 78)) : 10;
  return columns * 2;
}

function createEmojiCell(
  entry: EmojiEntry,
  isSearchResult: boolean,
  isFavorite: boolean,
  skinTonePreference: SkinTonePreference,
  messages: Messages,
): HTMLDivElement {
  const cell = document.createElement('div');
  const button = document.createElement('button');
  const emoji = document.createElement('span');
  const favoriteButton = document.createElement('button');
  const variantButton = entry.supportsSkinTone ? document.createElement('button') : null;
  const displayedEmoji = applySkinTone(entry.emoji, entry.skinToneVariants, skinTonePreference);
  const favoriteLabel = isFavorite
    ? messages.removeFavorite(entry.name)
    : messages.addFavorite(entry.name);

  cell.className = 'emoji-cell';
  button.className = 'emoji-button';
  button.type = 'button';
  button.title = entry.name;
  button.setAttribute('aria-label', messages.copy(entry.name));
  button.dataset.emojiButton = '';
  button.dataset.emojiId = entry.id;
  button.dataset.emoji = displayedEmoji;
  button.dataset.supportsSkinTone = String(entry.supportsSkinTone);
  button.dataset.category = entry.category;
  button.dataset.searchResult = String(isSearchResult);
  emoji.setAttribute('aria-hidden', 'true');
  emoji.textContent = displayedEmoji;
  button.append(emoji);

  favoriteButton.className = 'favorite-toggle';
  favoriteButton.type = 'button';
  favoriteButton.dataset.favoriteToggle = '';
  favoriteButton.dataset.emojiId = entry.id;
  favoriteButton.setAttribute('aria-label', favoriteLabel);
  favoriteButton.setAttribute('aria-pressed', String(isFavorite));
  favoriteButton.title = favoriteLabel;
  favoriteButton.textContent = isFavorite ? '★' : '☆';
  cell.append(button, favoriteButton);

  if (variantButton) {
    const swatch = document.createElement('span');
    variantButton.className = 'skin-tone-toggle';
    variantButton.type = 'button';
    variantButton.dataset.variantToggle = '';
    variantButton.dataset.emojiId = entry.id;
    variantButton.setAttribute('aria-label', messages.variantsFor(entry.name));
    variantButton.setAttribute('aria-haspopup', 'dialog');
    variantButton.setAttribute('aria-expanded', 'false');
    variantButton.title = messages.variantsFor(entry.name);
    swatch.className = 'skin-tone-swatch';
    swatch.dataset.tone = skinTonePreference;
    swatch.setAttribute('aria-hidden', 'true');
    variantButton.append(swatch);
    cell.append(variantButton);
  }

  return cell;
}
