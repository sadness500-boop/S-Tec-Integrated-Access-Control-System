/* 통합 출입관리 시스템 오프라인 캐시: 새 버전을 먼저 받고(네트워크 우선), 안 되면 저장본으로 엽니다.
   같은 주소(origin)의 프로그램 파일만 캐시하고, 서버(Supabase) 응답 · 외부 자료는 캐시하지 않습니다. — Designed & Developed by Rat Rae Choi */
const CACHE = "stac-v102";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || e.request.headers.has("range") || u.pathname.includes("/media/") || /auth-config|version\.json/.test(u.pathname)) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});
