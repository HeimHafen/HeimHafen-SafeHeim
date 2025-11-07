/* SafeHeim – Core (privacy-first, offline PWA, QR, ICS, Trusted Places, Stealth, Branding, i18n) */
const $ = s => document.querySelector(s);

/* ---------- Storage ---------- */
const store = {
get(k, d){ try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch(_) { return d; } },
set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};

const defaults = {
ownerName:"", contacts:[], checkinMinutes:15, lastLoc:null,
trustedPlaces:[], stealth:false, quietUI:true, lang:null
};
let settings = { ...defaults, ...store.get('sh.settings', {}) };
saveSettings({});

export function settingsSnapshot(){ return JSON.parse(JSON.stringify(settings)); }
export function setSettings(obj){ settings = { ...defaults, ...obj }; store.set('sh.settings', settings); renderSettings(); }

/* ---------- i18n ---------- */
const I18N = { /* … (DE/EN aus vorheriger Version, unverändert) … */ };
// (um Platz zu sparen in dieser Antwort ist das I18N-Objekt identisch mit vorher – bitte aus deiner aktuellen Datei übernehmen)
// → Wenn du willst, sende ich dir das I18N-Objekt nochmal vollständig.

function pickLang(){
const q = new URLSearchParams(location.search);
const ql = q.get('lang');
if (ql) { saveSettings({lang: ql}); return ql; }
return settings.lang || (navigator.language||'de').slice(0,2);
}
export function i18nApply(){
const lang = (pickLang()==='en') ? 'en':'de';
document.documentElement.lang = lang;
document.querySelectorAll('[data-i18n]').forEach(el=>{
const key = el.getAttribute('data-i18n');
const txt = I18N[lang][key];
if (!txt) return;
if (txt.includes('<b>')) el.innerHTML = txt; else el.textContent = txt;
});
}

/* ---------- Helpers ---------- */
function saveSettings(partial){ settings = { ...settings, ...partial }; store.set('sh.settings', settings); renderSettings(); }
export function announce(msg){ const n = $('#live'); if(n){ n.textContent=''; setTimeout(()=>n.textContent=msg, 10); } }
function escapeHtml(s=''){ return s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
function abs(path){ return new URL(path, location.origin + '/HeimHafen-SafeHeim/').href; }
function mapLink(lat, lon){ return `https://maps.google.com/?q=${encodeURIComponent(`${lat},${lon}`)}`; }
function hardenExternalLinks(){ document.querySelectorAll('a[target="_blank"]').forEach(a=>{ if(!a.rel) a.rel='noopener noreferrer'; }); }
export const isStealthMode = () => !!settings.stealth;

/* ---------- Location & Places ---------- */
export function getLocationOnce(){
return new Promise((res,rej)=>{
if(!('geolocation' in navigator)) return rej(new Error('geo'));
navigator.geolocation.getCurrentPosition(p=>{
const {latitude:lat, longitude:lon, accuracy:acc}=p.coords;
const loc={lat,lon,acc,ts:Date.now()}; saveSettings({lastLoc:loc}); res(loc);
},rej,{enableHighAccuracy:false, maximumAge:600000, timeout:8000});
});
}
function haversine(a,b){
const toRad = d=>d*Math.PI/180, R=6371000;
const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
const s1=Math.sin(dLat/2), s2=Math.sin(dLon/2);
return 2*R*Math.asin(Math.sqrt(s1*s1 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*s2*s2));
}
export function nearTrustedPlace(){
if(!settings.lastLoc || !settings.trustedPlaces?.length) return null;
const pos = settings.lastLoc;
for(const p of settings.trustedPlaces){
const dist = haversine({lat:pos.lat,lon:pos.lon},{lat:p.lat,lon:p.lon});
if(dist <= (p.radius || 150)) return p;
}
return null;
}

/* ---------- Messages ---------- */
export function composeMessage(type){
const lang=(pickLang()==='en')?'en':'de';
const who=settings.ownerName || (lang==='en'?'I':'Ich');
const when=new Date().toLocaleString();
const loc=settings.lastLoc?`\n${lang==='en'?'Location':'Standort'}: ${mapLink(settings.lastLoc.lat, settings.lastLoc.lon)}`:'';
if(type==='arrived') return lang==='en' ? `${who} arrived safely. ${when}${loc}` : `${who} bin gut angekommen. ${when}${loc}`;
if(type==='panic') return lang==='en' ? `🚨 ${who} need help! Please respond now. ${when}${loc}` : `🚨 ${who} brauche Hilfe! Bitte sofort melden. ${when}${loc}`;
return `${who}`;
}
export const smsLink=(n,t)=>`sms:${encodeURIComponent(n)}&body=${encodeURIComponent(t||'')}`;
export const waLink=(n,t)=> n ? `https://wa.me/${encodeURIComponent(n)}?text=${encodeURIComponent(t||'')}` : `https://wa.me/?text=${encodeURIComponent(t||'')}`;

/* ---------- UI Rendering (ride/) ---------- */
export function renderSettings(){
const owner=$('#ownerName'); if(owner) owner.value=settings.ownerName||'';
const mins=$('#checkinMinutes'); if(mins) mins.value=settings.checkinMinutes;

const list=$('#contact-list');
if(list){
list.innerHTML=settings.contacts.map((c,i)=>`
<div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:10px">
<div><div><b>${escapeHtml(c.label||'Kontakt')}</b></div><div class="small">${escapeHtml(c.tel||'')}</div></div>
<div class="buttons">
<a class="btn" href="${smsLink(c.tel,'')}">SMS</a>
<a class="btn" target="_blank" href="${waLink(c.tel,'')}">WhatsApp</a>
<button class="btn danger-outline" data-act="delContact" data-idx="${i}">Löschen</button>
</div>
</div>
`).join('') || `<p class="small">Noch keine Kontakte. Tippe „Kontakt hinzufügen“.</p>`;
}
const share=$('#shareLink'); if(share) share.value=abs('arrived.html');
}

/* ---------- Theming / Campaign ---------- */
function safeHttpUrlMaybe(u){ try{ const url=new URL(u, location.origin); if(url.protocol==='http:'||url.protocol==='https:') return url.href; }catch(_){ } return null; }
export function applyThemeAndCampaign(){
const p=new URLSearchParams(location.search);
const primary=p.get('primary'), accent=p.get('accent'), logo=p.get('logo'), brand=p.get('brand');
if(primary) document.documentElement.style.setProperty('--brand', primary);
if(accent) document.documentElement.style.setProperty('--brand-2', accent);
const safeLogo = logo && safeHttpUrlMaybe(logo);
if(safeLogo) document.querySelectorAll('.brand img').forEach(img=>img.src=safeLogo);
if(brand) document.getElementById('brand')?.textContent=brand;

const cid=p.get('cid'), sponsor=p.get('sponsor')||p.get('partner');
if(cid) localStorage.setItem('sh.cid',cid);
if(sponsor) localStorage.setItem('sh.sponsor',sponsor);
const badge=document.getElementById('cidBadge');
if(badge){
const s=localStorage.getItem('sh.sponsor'), c=localStorage.getItem('sh.cid');
if(s||c){ badge.textContent=s?`Partner: ${s}`:`Kampagne: ${c}`; badge.style.display='inline-block'; }
}
if(p.get('stealth')==='1'){ saveSettings({stealth:true}); }
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
i18nApply(); renderSettings(); applyThemeAndCampaign(); hardenExternalLinks();
try{ if('serviceWorker' in navigator){ navigator.serviceWorker.register('./assets/sw.js'); } }catch(e){}
});

/* ---------- Global UI events ---------- */
document.addEventListener('input', e=>{
if(e.target.id==='ownerName') saveSettings({ownerName:e.target.value});
if(e.target.id==='checkinMinutes') saveSettings({checkinMinutes:parseInt(e.target.value,10)||15});
});
document.addEventListener('click', e=>{
const el=e.target.closest('[data-act]'); if(!el) return;
const act=el.getAttribute('data-act');
if(act==='addContact'){ const label=prompt('Name des Kontakts?'); if(!label) return; const tel=prompt('Telefonnummer (mit +49 …)?'); if(!tel) return; settings.contacts.push({label,tel}); saveSettings({}); }
if(act==='delContact'){ const idx=+el.getAttribute('data-idx'); settings.contacts.splice(idx,1); saveSettings({}); }
if(act==='copyShare'){ const a=$('#shareLink'); if(a){ navigator.clipboard?.writeText(a.value); el.textContent='Kopiert ✓'; announce('Link kopiert'); setTimeout(()=>el.textContent='Link kopieren',1200); } }
});
