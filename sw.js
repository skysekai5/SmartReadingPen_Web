const VERSION='smartreadingpen-web-v2-20261030';
const ASSETS=['./','./index.html','./styles.css','./js/app.js','./js/data.js','./js/core.js','./js/games.js','./js/photo.js','./js/ocr.js','./js/tools.js','./js/mathTutor.js','./assets/audio/answer_correct.wav','./assets/audio/answer_try_again.wav','./assets/audio/shooter_laser.wav','./assets/icons/icon.png','./assets/icons/icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('smartreadingpen-web-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;// Network-first for page/code so updates are not frozen by stale PWA caches.
 const isCode=u.pathname.endsWith('/')||/\.(html|js|css|webmanifest)$/.test(u.pathname);
 if(isCode){e.respondWith(fetch(e.request).then(async resp=>{if(resp.ok){const cache=await caches.open(VERSION);cache.put(e.request,resp.clone())}return resp}).catch(()=>caches.match(e.request)));return;}
 e.respondWith(caches.match(e.request).then(v=>v||fetch(e.request)));});
