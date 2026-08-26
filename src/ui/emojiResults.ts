import type { EmojiEntry } from '../data/emojis';

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
}

export function renderEmojiResults(
  elements: EmojiResultsElements,
  view: EmojiResultsView,
): void {
  elements.heading.textContent = view.heading;
  elements.meta.replaceChildren();
  elements.results.replaceChildren();

  if (view.query !== null) {
    const summary = document.createElement('p');
    summary.className = 'search-summary';
    summary.dataset.searchSummary = '';
    summary.textContent = `${view.emojis.length} ${view.emojis.length > 1 ? 'resultats' : 'resultat'} pour "${view.query}"`;
    elements.meta.append(summary);
  }

  if (view.emojis.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.dataset.emptyState = '';
    emptyState.textContent = `Aucun emoji trouve pour "${view.query ?? ''}"`;
    elements.results.append(emptyState);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'emoji-grid';
  grid.setAttribute('aria-label', view.gridLabel);
  grid.append(...view.emojis.map((entry) => createEmojiButton(entry, view.query !== null)));
  elements.results.append(grid);
}

function createEmojiButton(entry: EmojiEntry, isSearchResult: boolean): HTMLButtonElement {
  const button = document.createElement('button');
  const emoji = document.createElement('span');

  button.className = 'emoji-button';
  button.type = 'button';
  button.title = entry.name.fr;
  button.setAttribute('aria-label', entry.name.fr);
  button.dataset.emojiButton = '';
  button.dataset.emojiId = entry.id;
  button.dataset.emoji = entry.emoji;
  button.dataset.category = entry.category;
  button.dataset.searchResult = String(isSearchResult);
  emoji.setAttribute('aria-hidden', 'true');
  emoji.textContent = entry.emoji;
  button.append(emoji);

  return button;
}
