import { initializeEmojiDeckApp } from './app';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  void initializeEmojiDeckApp(app);
}
