// Simpler QR-Scanner mit BarcodeDetector (Chrome, Edge, Android).
// iOS/Safari zeigt freundliche Fallback-Meldung (Bild-Upload möglich).
const out = document.getElementById('out');

(async function run(){
  if ('BarcodeDetector' in window) {
    try {
      const det = new BarcodeDetector({ formats: ['qr_code'] });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const v = document.getElementById('v'); v.srcObject = stream;

      const tick = async () => {
        if (v.readyState === v.HAVE_ENOUGH_DATA) {
          try {
            const res = await det.detect(v);
            if (res[0]) {
              out.textContent = res[0].rawValue;
              stream.getTracks().forEach(t => t.stop());
              return;
            }
          } catch (e) { /* ignore */ }
        }
        requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      out.textContent = 'Kamera nicht verfügbar: ' + e.message;
    }
  } else {
    out.textContent = 'Kein BarcodeDetector – nutze den Bild-Upload.';
  }
})();

document.getElementById('file').addEventListener('change', async (e) => {
  const file = e.target.files[0]; if (!file) return;
  out.textContent = 'Bild geladen – lokale Decoder-Implementierung kann später ergänzt werden.';
});