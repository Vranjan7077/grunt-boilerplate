export function onReady(callback) {
  if (document.readyState !== 'loading') {
    callback();
    return;
  }
  document.addEventListener('DOMContentLoaded', callback, { once: true });
}
