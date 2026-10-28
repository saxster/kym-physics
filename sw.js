// Offline support: precache the page and every lazy chunk, so the whole book works offline after the first visit.
const CACHE = 'mw-ab72a1cf8616';
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./live/chunk-CFOTGZ3T.js", "./live/chunk-G4DU6IIE.js", "./live/chunk-G54ALBCI.js", "./live/chunk-I4KURCN4.js", "./live/chunk-TKF4ZEXY.js", "./live/chunk-UGQNDQER.js", "./live/chunk-XUAL2ZCV.js", "./live/chunk-YVAPA4BS.js", "./live/three-6HN7VJXD.js", "./live/w_airfall-Y3DDS7AH.js", "./live/w_buoyancy-VW3XARPD.js", "./live/w_cannon3d-5SA7W4GA.js", "./live/w_circuit-X7GY2NUH.js", "./live/w_colourmix-ICAFIGUO.js", "./live/w_conduction-G7CELHPU.js", "./live/w_doppler-H4B5PIE7.js", "./live/w_energystores-OVLS32RF.js", "./live/w_energytrack-E2LDTEW7.js", "./live/w_expansion-5LV26EON.js", "./live/w_eye3d-XIYZDAID.js", "./live/w_field3d-OFAOP7PB.js", "./live/w_forces-BIFYMKV3.js", "./live/w_freefall-O76SPBK7.js", "./live/w_graphwalk-PXQTAJJU.js", "./live/w_harmonics-6FEY6M5F.js", "./live/w_induction-FDJNFM74.js", "./live/w_interference-ECCUHAGO.js", "./live/w_magnetometer-R7ZWAAPS.js", "./live/w_mirror-Y5AY7LFH.js", "./live/w_momentum_carts-VSTJB4JT.js", "./live/w_parallax-NIM3HWIP.js", "./live/w_phases-R5JUIDTB.js", "./live/w_pressuretank-NE7WNQAW.js", "./live/w_projectile-6V57CAAK.js", "./live/w_ramp-NJI2H732.js", "./live/w_refraction-J3IMKEMY.js", "./live/w_ripple-CNKHN2JJ.js", "./live/w_scope-5TPU2VLV.js", "./live/w_seasons-DFTUCZNT.js", "./live/w_seriesparallel-HXWWCRI2.js", "./live/w_shadow-2KJTY25W.js", "./live/w_skycolour-3RXOG3M3.js", "./live/w_tides-CZ4IKDCP.js", "./live/w_videotrack-6MXEB64T.js", "./live/w_whirl-ZDBQQF5S.js", "./live/x_map-WLDTIALQ.js", "./live/x_scale-Y7YI2OS2.js", "./live/x_sky-MTM6KP7K.js", "./live/x_spectrum-RJY6PQLN.js", "./assets/scale/neighbourhood.webp", "./assets/scale/coast.webp", "./assets/scale/room.webp"];
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
