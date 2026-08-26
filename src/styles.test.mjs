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
});
