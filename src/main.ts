import { emojiCategories, sampleEmojis } from './data/emojis';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  const total = sampleEmojis.length;
  const categories = emojiCategories.length;

  app.innerHTML = `
    <main class="app-shell" aria-labelledby="app-title">
      <p class="eyebrow">Phase 1 foundation</p>
      <h1 id="app-title">EmojiDeck</h1>
      <p>${total} sample emojis across ${categories} categories are ready for the MVP.</p>
    </main>
  `;
}
