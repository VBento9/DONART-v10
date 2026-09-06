const CACHE_NAME='donart-v12-3-1';
const STATIC_ASSETS=['./icon-192.png','./icon-512.png','./logo-donart-ui.png','./logo-donart.png'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(STATIC_ASSETS).catch(()=>{}))
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;

  const url=new URL(req.url);
  const isNavigation=req.mode==='navigate' || req.destination==='document' || url.pathname.endsWith('/index.html');

  if(isNavigation){
    event.respondWith((async()=>{
      try{
        return await fetch(req,{cache:'no-store'});
      }catch(e){
        const cached=await caches.match(req);
        if(cached)return cached;
        return new Response('DONART offline',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
      }
    })());
    return;
  }

  if(STATIC_ASSETS.some(a=>url.pathname.endsWith(a.replace('./','/')))){
    event.respondWith(
      caches.match(req).then(cached=>cached||fetch(req).then(resp=>{
        const copy=resp.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));
        return resp;
      }))
    );
  }
});
