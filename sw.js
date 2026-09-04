const CACHE='donart-v10-1-9-1-menu-delivery';
const CORE=['/','/manifest.webmanifest','/icon-192.png','/icon-512.png','/logo-donart.png','/logo-donart-ui.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 if(e.request.mode==='navigate'){e.respondWith(fetch('/',{cache:'no-store'}).catch(()=>caches.match('/')));return}
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const cp=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return resp}).catch(()=>caches.match('/'))))
});
