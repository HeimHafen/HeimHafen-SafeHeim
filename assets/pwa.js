// SW registrieren + Update-Button + A2HS (Android)
let deferredPrompt;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(reg => {
      // Update UX
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw?.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            const b = document.getElementById('updateBtn');
            if (b) { b.hidden = false; b.onclick = () => reg.waiting?.postMessage({ type: 'SKIP_WAITING' }); }
          }
        });
      });
    }).catch(err => console.warn('SW registration failed:', err));
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
}

// Install-Prompt (Android)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('installBtn');
  if (btn) btn.hidden = false;
});

document.addEventListener('click', async (e) => {
  if (e.target && e.target.id === 'installBtn' && deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    e.target.hidden = true;
  }
});