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
});

function screenText(text: string): Element | null {
  return Array.from(document.querySelectorAll('*')).find((element) => element.textContent === text) ?? null;
}

async function findToast(): Promise<string | null> {
  await Promise.resolve();
  return document.querySelector('[role="status"]')?.textContent?.trim() ?? null;
}
