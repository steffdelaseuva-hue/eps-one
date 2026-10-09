// EPS ONE — hors ligne et démarrage instantané : cache d'abord, mise à jour en arrière-plan (stale-while-revalidate)
const CACHE = 'eps-one-v218';
const FILES = ['./', './index.html', './js/icons.js', './js/saisieprof.js', './js/outils-plus.js', './js/test-vma.js', './js/test6e.js', './js/import-classes.js', './js/niveaux.js', './js/match.js', './js/montee.js', './js/interclasses.js', './js/partages.js', './js/lutte.js', './js/orientation.js', './js/natation.js', './js/crosstraining.js', './js/parkour.js', './js/danse-bank.js', './icons/danse/tour-eiffel.jpg', './icons/danse/guggenheim-bilbao.jpg', './icons/danse/viaduc-millau.jpg', './js/danse.js', './icons/parkour-arzacq.jpg', './js/duathlon.js', './js/demifond.js', './js/sauvetage.js', './js/escalade.js', './js/acrosport.js', './js/gym.js', './js/rugby-la.js', './js/combine.js', './js/sauvegardes.js', './js/collectifs.js', './js/valid.js', './js/grilles.js', './js/qr.js', './js/pdfmini.js', './js/qrscan.js', './js/cross.js', './js/plus.js', './js/install.js', './js/roue.js', './js/dessin.js', './js/profpin.js', './js/team.js', './js/secours.js', './js/overlays.js', './js/musique.js', './js/firebase-config.js', './js/cloud.js', './js/sync.js', './outils/chronos-eps.html',
  './manifest.webmanifest', './mentions-legales.html', './confidentialite.html', './icons/icone-v3-192.png', './icons/chronos-eps.png', './icons/icone-v3-512.png', './icons/icone-v3-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  const fb = u.href.startsWith('https://www.gstatic.com/firebasejs/');            // SDK Firebase versionné : cache
  if (u.origin !== location.origin && !fb) return;                                 // Firebase (auth, données), Google, Dropbox… : jamais en cache
  if (u.pathname.endsWith('/version.json')) {                                      // vérification de mise à jour : toujours le réseau
    e.respondWith(fetch(req, { cache: 'no-store' }).catch(() => caches.match(req, { ignoreSearch: true }))); return; }
  // page de l'app (racine / index.html) : coquille de l'app ; autres pages (chronos, mentions…) : leur propre fichier
  const nav = req.mode === 'navigate' && (/\/$/.test(u.pathname) || /\/index\.html$/.test(u.pathname));
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(nav ? './index.html' : req, { ignoreSearch: nav || u.search.startsWith('?v=') });
    const net = fetch(req).then(r => { if (r && r.ok && (r.type === 'basic' || fb)) c.put(nav ? './index.html' : req, r.clone()); return r; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }                   // réponse immédiate depuis le cache, rafraîchie en fond
    return net.catch(() => c.match(nav || req.mode !== 'navigate' ? './index.html' : req, { ignoreSearch: true }).then(r => r || c.match('./index.html')));
  }));
});
