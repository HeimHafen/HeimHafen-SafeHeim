<script>
// ============ PWA Service Worker + Install/Hinweis ============
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('assets/sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          const b = document.getElementById('btn-update');
          if (b) { b.style.display = 'inline-flex'; b.onclick = () => location.reload(); }
        }
      });
    });
  });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('btn-install');
  if (btn) { btn.style.display = 'inline-flex'; }
});
function installApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.finally(() => { deferredPrompt = null; });
}

// ============ Utils: Zeit, Clipboard, Share ============
function fmtTimestamp(d=new Date()) {
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const hh = String(d.getHours()).padStart(2,'0');
  const mi = String(d.getMinutes()).padStart(2,'0');
  return `${dd}.${mm}.${d.getFullYear()} ${hh}:${mi}`;
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('Link kopiert'); }
  catch { const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Link kopiert'); }
}

function toast(msg) {
  const live = document.getElementById('live') || document.body.appendChild(Object.assign(document.createElement('div'),{id:'live'}));
  live.textContent = msg;
  live.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);background:#111;color:#fff;padding:8px 12px;border-radius:8px;z-index:9999;opacity:.95';
  setTimeout(()=>live.textContent='',1600);
}

// ============ Geolocation → Karten-/Textlinks ============
function mapsLinks(lat, lon) {
  const q = `${lat.toFixed(6)},${lon.toFixed(6)}`;
  const apple = `http://maps.apple.com/?ll=${q}&q=Ich%20bin%20hier`;
  const gmaps = `https://maps.google.com/?q=${q}`;
  return {apple, gmaps, any: apple};
}

function getPosition(timeoutMs=8000) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('no-geo'));
    const t = setTimeout(()=>reject(new Error('timeout')), timeoutMs);
    navigator.geolocation.getCurrentPosition(pos => {
      clearTimeout(t);
      resolve({lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy});
    }, err => { clearTimeout(t); reject(err); }, {enableHighAccuracy:true, maximumAge:20000, timeout: timeoutMs});
  });
}

// ============ Sharing (Web Share / Fallback Buttons) ============
async function shareSituation(kind='ok') {
  const ts = fmtTimestamp();
  let text, url;
  try {
    const {lat, lon} = await getPosition().catch(()=>({lat:null,lon:null}));
    let mapUrl = '';
    if (lat && lon) mapUrl = mapsLinks(lat, lon).any;
    if (kind === 'ok') {
      text = `✅ Ich bin gut angekommen (${ts}).`;
    } else {
      text = `🚨 SOS – Ich brauche Hilfe (${ts}).`;
    }
    url = mapUrl || location.href;
    const full = mapUrl ? `${text} Standort: ${mapUrl}` : `${text}`;
    // Web Share
    if (navigator.share) {
      await navigator.share({title: 'SafeHeim', text: full, url: mapUrl || undefined});
    } else {
      // show fallback sheet
      document.getElementById('fallback').style.display = 'block';
      document.getElementById('fallback-whatsapp').href = `https://wa.me/?text=${encodeURIComponent(full)}`;
      document.getElementById('fallback-sms').href = `sms:?&body=${encodeURIComponent(full)}`;
      document.getElementById('fallback-mail').href = `mailto:?subject=${encodeURIComponent('SafeHeim')}&body=${encodeURIComponent(full)}`;
      document.getElementById('fallback-copy').onclick = ()=>copy(full);
    }
  } catch (e) {
    const msg = (kind==='ok'?'Ankunft':'SOS') + ' ohne Standort geteilt';
    toast(msg);
  }
}

// Expose for pages
window.SafeHeim = { shareSituation, installApp };
</script>