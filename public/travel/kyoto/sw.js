const CACHE='kyoto-wander-v8';
const FILES=['./','./index.html','./style.css','./app.js','./city-pack.js','./data.js','./planner.js','./icons.js','./food.js','./ambience.js','./favicon.svg','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('kyoto-wander-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(cached=>cached||(event.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));});
self.addEventListener('message',event=>{if(event.data?.type==='CACHE_INFO')event.waitUntil(caches.has(CACHE).then(ready=>{if(ready)event.source?.postMessage({type:'CACHE_READY',version:CACHE});}));});
