// Offline support: precache the page and every lazy chunk, so the whole book works offline after the first visit.
const CACHE = 'mw-7b586658c9a3';
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./live/chunk-G4DU6IIE.js", "./live/chunk-UGQNDQER.js", "./live/chunk-XUAL2ZCV.js", "./live/chunk-YVAPA4BS.js", "./live/three-6HN7VJXD.js", "./live/w_airfall-CTIEQA7L.js", "./live/w_buoyancy-BFB3YGTS.js", "./live/w_cannon3d-TZJQXKLG.js", "./live/w_circuit-L3KDRCV7.js", "./live/w_colourmix-PXYCFWUT.js", "./live/w_conduction-BPTPEKCZ.js", "./live/w_doppler-JOVKG5QH.js", "./live/w_energystores-D2A3OQ7Q.js", "./live/w_energytrack-FIE2XU4G.js", "./live/w_expansion-ELRSYREM.js", "./live/w_eye3d-GOHBEYF6.js", "./live/w_field3d-45DWY25V.js", "./live/w_forces-4GGEB465.js", "./live/w_freefall-XZ3CLI5Z.js", "./live/w_graphwalk-CTOXTTHX.js", "./live/w_harmonics-PBTLIO6V.js", "./live/w_induction-35FPDDCG.js", "./live/w_interference-XM6MENA5.js", "./live/w_magnetometer-NOKSIDGW.js", "./live/w_mirror-IJ7JYGWW.js", "./live/w_momentum_carts-4CXGJE4U.js", "./live/w_parallax-TAOK4YRJ.js", "./live/w_phases-VOMIB7BM.js", "./live/w_pressuretank-HZRT673V.js", "./live/w_projectile-KR2G7SRI.js", "./live/w_ramp-BQUEVFSZ.js", "./live/w_refraction-FCPF63LQ.js", "./live/w_ripple-NR24BYGM.js", "./live/w_scope-TRPWXMHY.js", "./live/w_seasons-PNJ5OIAK.js", "./live/w_seriesparallel-2JQMOU2F.js", "./live/w_shadow-DE5S2T3D.js", "./live/w_skycolour-GAWYATZR.js", "./live/w_tides-JWJSF372.js", "./live/w_videotrack-TSHNPI4Y.js", "./live/w_whirl-DNRAXADP.js", "./live/x_scale-6EN4533Q.js", "./live/x_sky-NGVE33BK.js", "./live/x_spectrum-MPHQUDSS.js", "./assets/scale/neighbourhood.webp", "./assets/scale/coast.webp", "./assets/scale/room.webp"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
// only this book's old caches: other books on the same origin keep theirs
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mw-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // network first for the page (so new editions arrive), cache as fallback; cache first for everything else
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
