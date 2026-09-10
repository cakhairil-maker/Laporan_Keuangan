// Service worker sederhana: menyimpan salinan aplikasi di HP
// supaya tetap bisa dibuka walau tidak ada koneksi internet.
const NAMA_CACHE = "catatan-keuangan-v1";
const BERKAS_INTI = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(NAMA_CACHE).then((cache) => cache.addAll(BERKAS_INTI))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== NAMA_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategi: coba ambil dari internet dulu; kalau gagal (offline), pakai salinan tersimpan.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const salinan = res.clone();
        caches.open(NAMA_CACHE).then((cache) => cache.put(event.request, salinan));
        return res;
      })
      .catch(() => caches.match(event.request).then((res) => res || caches.match("./index.html")))
  );
});
