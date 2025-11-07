// ===== Service Worker + Update-Hinweis =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(reg => {
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

// Install-Button
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredPrompt = e;
  const btn = document.getElementById('btn-install');
  if (btn) btn.style.display = 'inline-flex';
});
function installApp(){ if(!deferredPrompt) return; deferredPrompt.prompt(); deferredPrompt.userChoice.finally(()=>deferredPrompt=null); }
window.SafeHeim = { installApp };

// ===== Helpers =====
function fmtTimestamp(d=new Date()){
  const dd=String(d.getDate()).padStart(2,'0'), mm=String(d.getMonth()+1).padStart(2,'0');
  const hh=String(d.getHours()).padStart(2,'0'), mi=String(d.getMinutes()).padStart(2,'0');
  return `${dd}.${mm}.${d.getFullYear()} ${hh}:${mi}`;
}
function toast(msg){
  let n=document.getElementById('live'); if(!n){ n=document.createElement('div'); n.id='live'; document.body.appendChild(n); }
  n.textContent=msg; n.style.cssText='position:fixed;left:50%;bottom:16px;transform:translateX(-50%);background:#111;color:#fff;padding:8px 12px;border-radius:8px;z-index:9999;opacity:.95';
  setTimeout(()=>n.textContent='',1600);
}
async function copy(text){
  try { await navigator.clipboard.writeText(text); toast('Link kopiert'); }
  catch { const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Link kopiert'); }
}

function mapsLinks(lat, lon){
  const q=`${lat.toFixed(6)},${lon.toFixed(6)}`;
  const apple=`http://maps.apple.com/?ll=${q}&q=Ich%20bin%20hier`;
  const gmaps=`https://maps.google.com/?q=${q}`;
  return {apple, gmaps, any: apple};
}
function getPosition(timeoutMs=8000){
  return new Promise((resolve,reject)=>{
    if(!('geolocation' in navigator)) return reject(new Error('no-geo'));
    const t=setTimeout(()=>reject(new Error('timeout')),timeoutMs);
    navigator.geolocation.getCurrentPosition(pos=>{ clearTimeout(t);
      resolve({lat:pos.coords.latitude, lon:pos.coords.longitude, acc:pos.coords.accuracy});
    },err=>{ clearTimeout(t); reject(err); }, {enableHighAccuracy:true,maximumAge:20000,timeout:timeoutMs});
  });
}

// ===== Share (OK / SOS) =====
async function shareSituation(kind='ok'){
  const ts = fmtTimestamp();
  try{
    let mapUrl='';
    try{
      const {lat,lon}=await getPosition();
      mapUrl = mapsLinks(lat,lon).any;
    }catch{} // Standort optional
    const text = (kind==='ok')
      ? `✅ Ich bin gut angekommen (${ts}).`
      : `🚨 SOS – Ich brauche Hilfe (${ts}).`;
    const full = mapUrl ? `${text} Standort: ${mapUrl}` : text;

    if(navigator.share){
      await navigator.share({title:'SafeHeim', text: full, url: mapUrl || undefined});
    }else{
      const fb=document.getElementById('fallback');
      if(fb){
        fb.style.display='block';
        document.getElementById('fallback-whatsapp').href=`https://wa.me/?text=${encodeURIComponent(full)}`;
        document.getElementById('fallback-sms').href=`sms:?&body=${encodeURIComponent(full)}`;
        document.getElementById('fallback-mail').href=`mailto:?subject=${encodeURIComponent('SafeHeim')}&body=${encodeURIComponent(full)}`;
        document.getElementById('fallback-copy').onclick=()=>copy(full);
      }else{
        copy(full);
      }
    }
  }catch(e){
    toast('Teilen fehlgeschlagen');
  }
}
window.SafeHeim.shareSituation = shareSituation;

// ===== QR-Scan (Bild hochladen → decode API) =====
async function bindQrScan(){
  const input = document.getElementById('qrupload');
  const out   = document.getElementById('qrout');
  if(!input || !out) return;

  input.addEventListener('change', async ()=>{
    if(!input.files || !input.files[0]) return;
    out.textContent = 'Erkenne QR…';
    try{
      const fd = new FormData();
      fd.append('file', input.files[0], 'qr.jpg');
      const r  = await fetch('https://api.qrserver.com/v1/read-qr-code/', { method:'POST', body:fd });
      const j  = await r.json();
      const val = j?.[0]?.symbol?.[0]?.data || '(kein QR erkannt)';
      out.innerHTML = val ? `<strong>Ergebnis:</strong> <br><a href="${val}" target="_blank" rel="noopener">${val}</a>` : 'Kein QR erkannt.';
    }catch(err){
      out.textContent = 'Scan-Fehler. Prüfe Internetverbindung.';
    }
  });
}
document.addEventListener('DOMContentLoaded', bindQrScan);