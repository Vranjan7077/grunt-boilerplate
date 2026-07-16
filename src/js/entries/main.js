import { onReady } from '../modules/dom.js';

onReady(() => {
  document.documentElement.dataset.jsReady = 'true';
});
