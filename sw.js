const CACHE="maths-hub-v1";
const CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET"||new URL(r.url).origin!==self.location.origin) return;
  if(r.headers.has("range")||/\.mp4$/i.test(new URL(r.url).pathname)) return;
  const net=fetch(r).then(res=>{
    if(res.ok){ const copy=res.clone(); return caches.open(CACHE).then(c=>c.put(r,copy)).then(()=>res,()=>res); }
    return res;
  });
  e.waitUntil(net.catch(()=>{}));
  e.respondWith(new Promise(done=>{
    const t=setTimeout(()=>caches.match(r,{ignoreSearch:true}).then(m=>{ if(m) done(m); }),3000);
    net.then(res=>{ clearTimeout(t); done(res); },()=>{ clearTimeout(t); done(caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match("./index.html"))); });
  }));
});
