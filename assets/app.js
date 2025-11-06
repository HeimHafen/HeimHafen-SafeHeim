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
const I18N = {
de: {
brand:"SafeHeim",
"nav.help":"Hilfe","nav.privacy":"Datenschutz","nav.setup":"Jetzt einrichten","nav.imprint":"Impressum","nav.arrived":"Check-in","nav.panic":"SOS","nav.print":"Drucken","nav.onepager":"One-Pager",
"home.badge":"Sicher ankommen — für dich & deine Liebsten",
"home.h1":"Dein smarter Sicherheits-Link",
"home.lead":"1-Tap „Ich bin gut angekommen“ & „SOS“ inkl. Standortlink. Keine Cloud. Keine Registrierung. Offline nutzbar. Trusted Places & Kalender-Erinnerung.",
"home.cta.arrived":"Ich bin gut angekommen","home.cta.panic":"SOS / Panik","home.cta.qr":"QR scannen","home.cta.setup":"Einrichten",
"arrived.h3":"Ich bin gut angekommen","arrived.share":"Teilen / Kopieren","arrived.direct":"Direkt an Kontakte",
"panic.h3":"🚨 SOS / Panik","panic.share":"Teilen / Kopieren","panic.call":"112 anrufen","panic.direct":"Direkt an Kontakte",
"qr.tip":"Tipp: Tippe auf das Kamerabild, um die Taschenlampe zu togglen (falls verfügbar).",
"help.h3":"FAQ",
"help.privacy":"<b>Privatsphäre:</b> Keine Cloud, keine Konten. Alles bleibt lokal.",
"help.ios":"<b>iPhone-App-Icon:</b> Seite öffnen → Teilen → „Zum Home-Bildschirm“.",
"help.offline":"<b>Offline:</b> Nach dem ersten Laden überall nutzbar (PWA).",
"help.location":"<b>Standort:</b> Nur bei Bedarf (Check-in/SOS). Keine Hintergrundverfolgung.",
"help.timer":"<b>Timer:</b> Kalender-.ics erzeugt lokale Erinnerung – ohne Server.",
"help.places":"<b>Trusted Places:</b> Orte hinzufügen und Nähe sehen.",
"help.stealth":"<b>Stealth-Modus:</b> Unauffällige UI in den Einstellungen.",
"privacy.h3":"Datenschutz","privacy.p1":"SafeHeim speichert Einstellungen (Name, Kontakte, Orte, Timer) ausschließlich lokal (LocalStorage). Es werden keine personenbezogenen Daten an Server übertragen.","privacy.p2":"Beim Teilen übergibst du den Text selbst an Apps wie SMS oder WhatsApp.","privacy.p3":"Der optionale externe QR-Dienst wird nur aufgerufen, wenn du ihn aktiv nutzt.",
"imprint.h3":"Impressum",
"offline.h3":"Du bist offline","offline.p":"Viele Funktionen (Kontakte, Check-in-Nachricht) funktionieren dennoch.","offline.home":"Zur Startseite",
"setup.h3a":"Kontakte & Check-in","setup.name":"Dein Name","setup.addContact":"Kontakt hinzufügen","setup.timer":"Check-in Timer (Minuten)","setup.ics":"Kalender-Erinnerung (.ics)",
"setup.h3b":"Teilen, QR & Orte","setup.link":"Dein Check-in-Link","setup.copy":"Link kopieren","setup.whatsapp":"WhatsApp","setup.qr":"QR anzeigen (extern)","setup.qrNote":"QR über externen Dienst (api.qrserver.com). Alternativ Link teilen/kopieren.",
"setup.places":"Trusted Places","setup.placesInfo":"Orte (z. B. Zuhause, Uni) hinzufügen und Nähe sehen.","setup.placeAdd":"Aktuellen Ort speichern",
"setup.stealth":"Stealth-Modus","setup.stealthInfo":"Unauffällige UI (z. B. „Notiz senden“ statt „SOS“).","setup.stealthToggle":"Stealth umschalten",
"setup.export":"Einstellungen exportieren","setup.import":"Importieren","setup.branding":"Partner-Branding via URL-Parameter: ?brand=NAME&primary=#HEX&accent=#HEX&logo=URL&lang=en"
},
en: {
brand:"SafeHeim",
"nav.help":"Help","nav.privacy":"Privacy","nav.setup":"Set up now","nav.imprint":"Imprint","nav.arrived":"Check-in","nav.panic":"SOS","nav.print":"Print","nav.onepager":"One-pager",
"home.badge":"Arrive safely — for you & your loved ones",
"home.h1":"Your smart safety link",
"home.lead":"1-tap “I arrived” & “SOS” with location link. No cloud. No signup. Works offline. Trusted places & calendar reminder.",
"home.cta.arrived":"I arrived safely","home.cta.panic":"SOS","home.cta.qr":"Scan QR","home.cta.setup":"Set up",
"arrived.h3":"I arrived safely","arrived.share":"Share / Copy","arrived.direct":"Send to contacts",
"panic.h3":"🚨 SOS","panic.share":"Share / Copy","panic.call":"Call 112","panic.direct":"Send to contacts",
"qr.tip":"Tip: Tap the video to toggle the flashlight (if available).",
"help.h3":"FAQ",
"help.privacy":"<b>Privacy:</b> No cloud, no accounts. Everything stays on your device.",
"help.ios":"<b>iPhone app icon:</b> Open → Share → “Add to Home Screen”.",
"help.offline":"<b>Offline:</b> Works everywhere after first load (PWA).",
"help.location":"<b>Location:</b> Only on demand (check-in/SOS). No background tracking.",
"help.timer":"<b>Timer:</b> Calendar .ics creates local reminder — no server.",
"help.places":"<b>Trusted places:</b> Add places and see when you’re near.",
"help.stealth":"<b>Stealth mode:</b> Discreet UI in settings.",
"privacy.h3":"Privacy","privacy.p1":"SafeHeim stores settings (name, contacts, places, timer) locally (LocalStorage). No personal data is sent to servers.","privacy.p2":"When sharing, you hand the text to your chosen app (SMS/WhatsApp).","privacy.p3":"The optional external QR service is only used when you open it.",
"imprint.h3":"Imprint",
"offline.h3":"You’re offline","offline.p":"Many features (contacts, check-in text) still work.","offline.home":"Home",
"setup.h3a":"Contacts & check-in","setup.name":"Your name","setup.addContact":"Add contact","setup.timer":"Check-in timer (minutes)","setup.ics":"Calendar reminder (.ics)",
"setup.h3b":"Sharing, QR & places","setup.link":"Your check-in link","setup.copy":"Copy link","setup.whatsapp":"WhatsApp","setup.qr":"Show QR (external)","setup.qrNote":"QR via external service (api.qrserver.com). Or share/copy the link.",
"setup.places":"Trusted places","setup.placesInfo":"Add places (home, uni) and see proximity.","setup.placeAdd":"Save current place",
"setup.stealth":"Stealth mode","setup.stealthInfo":"Discreet UI (e.g., “Send note” instead of “SOS”).","setup.stealthToggle":"Toggle stealth",
"setup.export":"Export settings","setup.import":"Import","setup.branding":"Partner branding via URL: ?brand=NAME&primary=#HEX&accent=#HEX&logo=URL&lang=en"
}
};

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
function abs(path){ return new URL(path, location.origin + '/safe-heim-/').href; }
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
