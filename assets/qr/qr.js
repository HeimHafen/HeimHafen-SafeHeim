/* QR-Scanner: BarcodeDetector + Torch + Canvas-Fallback */
(function () {
const makeBmp = window.createImageBitmap
? (v)=>createImageBitmap(v)
: (v)=>{ const c=document.createElement('canvas'); c.width=v.videoWidth; c.height=v.videoHeight; c.getContext('2d').drawImage(v,0,0); return Promise.resolve(c); };

async function startQR(videoEl, onResult) {
if ('BarcodeDetector' in window) {
const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
videoEl.srcObject = stream; await videoEl.play();
const det = new BarcodeDetector({ formats: ['qr_code'] });
let stop=false;

const track=stream.getVideoTracks()[0]; const caps=track.getCapabilities?.()||{};
if(caps.torch){
videoEl.addEventListener('click',async()=>{
try{ const cur=track.getSettings().torch; await track.applyConstraints({advanced:[{torch:!cur}]}); }catch(_){}
},{passive:true});
}

async function loop(){
if(stop) return;
try{
const bmp = await makeBmp(videoEl);
const codes = await det.detect(bmp);
if(codes && codes[0] && codes[0].rawValue){
stop=true; stream.getTracks().forEach(t=>t.stop()); onResult?.(codes[0].rawValue); return;
}
}catch(_){}
requestAnimationFrame(loop);
}
loop();
return ()=>{ stop=true; stream.getTracks().forEach(t=>t.stop()); };
} else {
const inp=document.getElementById('file-fallback'); inp?.classList.remove('hidden');
inp?.addEventListener('change', async()=>{
const url=URL.createObjectURL(inp.files[0]);
alert('Fallback geöffnet. Bitte den QR-Link im neuen Tab öffnen.');
window.open(url, '_blank');
},{once:true});
return ()=>{};
}
}
window.startQR = startQR;
})();
