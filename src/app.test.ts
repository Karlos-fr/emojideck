/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmojiDeckApp } from './app';

describe('EmojiDeck MVP app', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders the compact picker layout from the design phase', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    expect(screenText('EmojiDeck')).toBeTruthy();
    expect(document.querySelector('.desktop-sidebar')).toBeTruthy();
    expect(document.querySelector('.mobile-category-bar')).toBeTruthy();
    expect(document.querySelector<HTMLInputElement>('[type="search"]')?.placeholder).toBe(
      'Rechercher un emoji',
    );
    expect(document.querySelector('[data-theme-mode]')?.textContent).toContain('Systeme');
    expect(document.querySelector('[data-language-select]')?.textContent).toContain('FR');
    expect(document.querySelector('[data-composer-toggle]')).toBeNull();
  });

  it('marks controls from future phases as unavailable', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    expect(document.querySelector<HTMLButtonElement>('[data-theme-mode]')?.disabled).toBe(true);
    expect(document.querySelector<HTMLButtonElement>('[data-language-select]')?.disabled).toBe(true);
    expect(document.querySelector<HTMLButtonElement>('.mobile-menu-button')?.disabled).toBe(true);
  });

  it('shows only the active category in the main grid', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    const heading = document.querySelector('[data-section-heading]');
    const visibleButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]'));

    expect(heading?.textContent).toBe('Visages');
    expect(visibleButtons.length).toBeGreaterThan(8);
    expect(visibleButtons.every((button) => button.dataset.category === 'faces')).toBe(true);
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

  it('copies an emoji and displays a discreet success toast', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    document.querySelector<HTMLButtonElement>('[data-emoji-id="face-with-tears-of-joy"]')?.click();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('😂');
    expect(await findToast()).toBe('Copie !');
  });

  it('shows search results in a single grid while a query is active', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    typeSearch('coeur');

    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Recherche');
    expect(document.querySelector('[data-search-summary]')?.textContent).toBe('2 resultats pour "coeur"');
    expect(document.querySelector<HTMLButtonElement>('[data-emoji-id="red-heart"]')).toBeTruthy();
    expect(
      Array.from(document.querySelectorAll<HTMLButtonElement>('[data-emoji-button]')).every(
        (button) => button.dataset.searchResult === 'true',
      ),
    ).toBe(true);
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

  it('renders the search query as text instead of interpreting HTML', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    const query = '</p><img data-injected="true">';
    typeSearch(query);

    expect(document.querySelector('[data-injected]')).toBeNull();
    expect(document.querySelector('[data-empty-state]')?.textContent).toContain(query);
  });

  it('keeps copy behavior available from search results', async () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    typeSearch('feu');
    document.querySelector<HTMLButtonElement>('[data-emoji-id="fire"]')?.click();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('🔥');
    expect(await findToast()).toBe('Copie !');
  });

  it('shows a sober empty state when no emoji matches the query', () => {
    createEmojiDeckApp(document.querySelector<HTMLDivElement>('#app')!);

    typeSearch('zzzz');

    expect(document.querySelector('[data-section-heading]')?.textContent).toBe('Recherche');
    expect(document.querySelector('[data-empty-state]')?.textContent).toBe('Aucun emoji trouve pour "zzzz"');
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
