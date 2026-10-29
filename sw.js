// Offline support: precache the page and every lazy chunk, so the whole book works offline after the first visit.
const CACHE = 'mw-bacfbd2923c0';
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./live/chunk-7VZAQJBF.js", "./live/chunk-CFOTGZ3T.js", "./live/chunk-G54ALBCI.js", "./live/chunk-I4KURCN4.js", "./live/chunk-M4YHM7B4.js", "./live/chunk-TKF4ZEXY.js", "./live/chunk-UGQNDQER.js", "./live/chunk-WOT6VMZA.js", "./live/chunk-XUAL2ZCV.js", "./live/chunk-YVAPA4BS.js", "./live/three-3K6EQOUE.js", "./live/w_airfall-SE7Z7CQQ.js", "./live/w_buoyancy-IFFGF7K2.js", "./live/w_cannon3d-4TEYI6H4.js", "./live/w_circuit-FVJGQB4O.js", "./live/w_colourmix-QJI2NLEG.js", "./live/w_conduction-3JHUQSS6.js", "./live/w_doppler-ZZND3U42.js", "./live/w_energystores-43S4NG6K.js", "./live/w_energytrack-KTJNYB62.js", "./live/w_expansion-QHRQZBFS.js", "./live/w_eye3d-KNHOT3QY.js", "./live/w_field3d-6ENI4SZD.js", "./live/w_fieldslab-D7VBWR52.js", "./live/w_forces-WEFDIHSY.js", "./live/w_freefall-TOKTISK6.js", "./live/w_graphwalk-ZOCRHDS3.js", "./live/w_harmonics-6HK7QAUA.js", "./live/w_induction-5ZQV4UPP.js", "./live/w_interference-ZNGTWL5K.js", "./live/w_magnetometer-GWMA4TJ2.js", "./live/w_mechanicslab-T7D5F5PA.js", "./live/w_mirror-GECZW2FH.js", "./live/w_momentum_carts-65EP2BJN.js", "./live/w_parallax-PLHU2DVK.js", "./live/w_phases-5UMNCSVO.js", "./live/w_pressuretank-ST2BNSD2.js", "./live/w_projectile-3YQMZ7ZQ.js", "./live/w_ramp-6GLZEA33.js", "./live/w_refraction-CYHC7PBE.js", "./live/w_ripple-GAO3NIHK.js", "./live/w_scope-WGOF4QP7.js", "./live/w_seasons-IEWFJL3F.js", "./live/w_seriesparallel-QNXGOSPS.js", "./live/w_shadow-Y3O6WH43.js", "./live/w_skycolour-KFHUOPR2.js", "./live/w_tides-S5C2I752.js", "./live/w_videotrack-HK7LVJUD.js", "./live/w_waveslab-XH6FWIIK.js", "./live/w_whirl-4LI2VJHN.js", "./live/x_map-2T63VRNY.js", "./live/x_scale-4ZERKXRF.js", "./live/x_sky-GIV75YEE.js", "./live/x_spectrum-OKPVWXHX.js", "./assets/scale/neighbourhood.webp", "./assets/scale/coast.webp", "./assets/scale/room.webp"];
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
