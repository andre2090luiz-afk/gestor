/* Gestor PrintAR 3D — service worker (funciona sem internet).
   - index.html: tenta a internet primeiro (pega a versão nova) e usa a cópia guardada se estiver offline.
   - bibliotecas e fontes: usa a cópia guardada e atualiza por trás.
   - nuvem (Supabase): nunca guarda, sempre direto. */
const CACHE = "printar-4.56";
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!/^https?:$/.test(url.protocol) || url.hostname.endsWith("supabase.co")) return;
  const isPage = req.mode === "navigate" || (url.origin === location.origin && /\/(index\.html)?$/.test(url.pathname));
  if (isPage) {
    /* "no-cache": sempre confere com o servidor se ha versao nova (nao usa a copia do navegador) */
    e.respondWith(fetch(url.href, { cache: "no-cache", credentials: "same-origin" }).then((r) => { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req).then((m) => m || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then((m) => {
    const net = fetch(req).then((r) => { if (r && (r.ok || r.type === "opaque")) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return r; }).catch(() => m);
    return m || net;
  }));
});
