import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

describe('scroll layout styles', () => {
  it('constrains the main panel and gives the central region its own visible scrollbar', () => {
    expect(styles).toMatch(/\.main-panel\s*{[^}]*min-height:\s*0;/s);
    expect(styles).toMatch(/\.main-panel\s*{[^}]*overflow:\s*hidden;/s);
    expect(styles).toMatch(/\.content-scroll\s*{[^}]*flex:\s*1 1 0;/s);
    expect(styles).toMatch(/\.content-scroll\s*{[^}]*overflow-y:\s*scroll;/s);
    expect(styles).toMatch(/\.content-scroll::-webkit-scrollbar-thumb\s*{/);
  });

  it('does not turn the desktop category sidebar into a scroll region', () => {
    const sidebarRule = styles.match(/\.desktop-sidebar\s*{[^}]*}/s)?.[0] ?? '';

    expect(sidebarRule).not.toMatch(/overflow-[xy]:\s*(auto|scroll)/);
  });
});

describe('stable rendering styles', () => {
  it('keeps emoji cells and buttons at explicit desktop and mobile dimensions', () => {
    expect(styles).toMatch(/\.emoji-cell\s*{[^}]*width:\s*60px;[^}]*height:\s*60px;/s);
    expect(styles).toMatch(/\.emoji-button\s*{[^}]*width:\s*60px;[^}]*height:\s*60px;/s);
    expect(styles).toMatch(
      /@media \(max-width: 899px\)[\s\S]*\.emoji-button\s*{[^}]*width:\s*48px;[^}]*height:\s*48px;/,
    );
    expect(styles).toMatch(/\.emoji-cell\s*{[^}]*contain:\s*layout style paint;/s);
    expect(styles).toMatch(/\.emoji-cell\s*{[^}]*content-visibility:\s*auto;/s);
  });

  it('provides stable loading, error and empty-state surfaces', () => {
    expect(styles).toMatch(/\.app-status-shell\s*{[^}]*min-height:\s*560px;/s);
    expect(styles).toMatch(/\.empty-state\s*{[^}]*min-height:\s*180px;/s);
    expect(styles).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});
