import { createEmojiDeckApp } from './app';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  createEmojiDeckApp(app);
}
