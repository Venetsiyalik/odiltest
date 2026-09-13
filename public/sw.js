// Odil School — talaba ilovasi uchun minimal service worker.
// Maqsad: internet uzilib qolganda navigatsiya so'rovlarini bo'sh xato
// ekrani o'rniga do'stona "/offline" sahifasiga yo'naltirish (texnik
// topshiriq 3.4-band). To'liq oflayn ilova emas — faqat fallback.
const CACHE_NOMI = "odilschool-oflayn-v1";
const OFLAYN_YOL = "/offline";

self.addEventListener("install", (hodisa) => {
  hodisa.waitUntil(
    caches.open(CACHE_NOMI).then((keshi) => keshi.add(OFLAYN_YOL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (hodisa) => {
  hodisa.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (hodisa) => {
  if (hodisa.request.mode === "navigate") {
    hodisa.respondWith(
      fetch(hodisa.request).catch(() => caches.match(OFLAYN_YOL)),
    );
  }
});
