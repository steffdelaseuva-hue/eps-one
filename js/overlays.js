/* =========================================================
   EPS ONE — Fenêtres par-dessus l'écran (overlays) : toujours fermables
   Sur iPhone / iPad, une fenêtre plus haute que l'écran pouvait cacher
   son bouton de fermeture (hors écran, impossible à faire défiler).
   Pour toute fenêtre plein écran ajoutée à la page :
   · défilement vertical possible, marges « encoche / barre » respectées ;
   · bouton ✕ toujours visible en haut à droite. Il déclenche le bouton
     de fermeture de la fenêtre (Fermer, Terminé, Annuler, Retour…), sinon
     il retire simplement la fenêtre.
   ========================================================= */
(() => {
  const SKIP = new Set(['eps-gate', 'pin-ov', 'who-ov', 'inst-ov', 'sync-pill']);   // écrans qui gèrent eux-mêmes leur fermeture (ou ne doivent pas être fermés)
  const SKIP_CLS = ['lu-hold', 'screen'];
  const CLOSE_RE = /^(✕|×|x|fermer|terminé|✔ terminé|annuler|← retour|retour|ok|j'ai compris|plus tard|← annuler)(?=$|[\s.!·,:])/i;
  document.head.insertAdjacentHTML('beforeend', `<style>
[data-ov-grid]>:not(.ov-x){margin:auto}
.ov-x{position:fixed;top:calc(8px + env(safe-area-inset-top));right:calc(10px + env(safe-area-inset-right));z-index:2147483000;width:44px;height:44px;border-radius:50%;border:none;
  background:rgba(255,255,255,.95);color:#0B2A5B;font-size:1.35rem;font-weight:900;box-shadow:0 4px 14px rgba(0,0,0,.25);display:grid;place-items:center;cursor:pointer}
</style>`);
  const isOverlay = n => {
    if (!(n instanceof HTMLElement) || n.dataset.ovFix || SKIP.has(n.id) || SKIP_CLS.some(c => n.classList.contains(c))) return false;
    const cs = getComputedStyle(n);
    if (cs.position !== 'fixed' || (+cs.zIndex || 0) < 150) return false;
    const r = n.getBoundingClientRect();
    return r.width >= innerWidth * .9 && r.height >= innerHeight * .9;
  };
  const closeBtn = o => [...o.querySelectorAll('button')].filter(b => !b.classList.contains('ov-x'))
    .find(b => CLOSE_RE.test((b.textContent || '').trim()) || /fermer|close/i.test(b.getAttribute('aria-label') || '') || /x$|-bk$|close|cancel/i.test(b.id || ''));
  const fix = o => {
    o.dataset.ovFix = '1';
    const cs = getComputedStyle(o);
    // défilement + marges de sécurité (encoche, barre d'accueil)
    o.style.overflowY = 'auto'; o.style.webkitOverflowScrolling = 'touch'; o.style.overscrollBehavior = 'contain';
    o.style.paddingTop = `max(${cs.paddingTop}, calc(56px + env(safe-area-inset-top)))`;
    o.style.paddingBottom = `max(${cs.paddingBottom}, calc(16px + env(safe-area-inset-bottom)))`;
    // une fenêtre centrée (grille) ne peut pas défiler quand elle dépasse : on la centre autrement
    if (cs.display === 'grid' && o.children.length === 1) { o.style.display = 'flex'; o.style.alignItems = 'flex-start'; o.style.justifyContent = 'center'; o.dataset.ovGrid = '1'; }
    if (o.querySelector(':scope > .ov-x')) return;
    const own = closeBtn(o); if (own) { const r = own.getBoundingClientRect(); if (r.height && r.top >= 0 && r.bottom <= innerHeight * .3) return; }   // déjà un bouton de fermeture visible en haut
    const add = () => { if (o.querySelector(':scope > .ov-x')) return;
      const x = document.createElement('button'); x.type = 'button'; x.className = 'ov-x'; x.setAttribute('aria-label', 'Fermer'); x.textContent = '✕';
      x.onclick = e => { e.stopPropagation(); const b = closeBtn(o); if (b) b.click(); else o.remove(); };
      o.appendChild(x); };
    add();
    // la fenêtre se redessine (innerHTML) : on remet le bouton
    new MutationObserver(() => { if (o.isConnected) add(); }).observe(o, { childList: true });
  };
  const scan = nodes => nodes.forEach(n => { if (n.nodeType === 1 && n.parentNode === document.body) requestAnimationFrame(() => { if (n.isConnected && isOverlay(n)) fix(n); }); });
  new MutationObserver(ms => ms.forEach(m => scan([...m.addedNodes]))).observe(document.body, { childList: true });
})();

/* =========================================================
   Historiques repliables (tous les outils) : les sections
   « Historique des matchs », « Combats enregistrés », « Défis enregistrés »…
   sont fermées par défaut ; on touche le titre pour les ouvrir / fermer.
   ========================================================= */
(() => {
  const RE = /^(📜\s*)?(Historique des matchs|Combats enregistrés|Combats joués|Défis enregistrés|Historique des combats|Historique des assauts)/i;
  const open = {};                                         // état mémorisé pendant la session, par titre
  document.head.insertAdjacentHTML('beforeend', '<style>.hfold h2{cursor:pointer;user-select:none}.hfold h2::before{content:"▸ ";color:var(--muted)}.hfold.on h2::before{content:"▾ "}</style>');
  const apply = st => { const on = st.classList.contains('on'); let n = st.nextElementSibling;
    while (n && !n.classList.contains('section-title')) { if (on) { if (n.dataset.hfHid) { n.style.display = n.dataset.hfDisp || ''; delete n.dataset.hfHid; } }
      else if (!n.dataset.hfHid && n.style.display !== 'none') { n.dataset.hfDisp = n.style.display; n.style.display = 'none'; n.dataset.hfHid = '1'; } n = n.nextElementSibling; } };
  const scan = () => document.querySelectorAll('.section-title:not([data-hf])').forEach(st => { const h = st.querySelector('h2'); st.dataset.hf = '1';
    if (!h || !RE.test(h.textContent.trim()) || st.style.display === 'none') return;
    const key = h.textContent.replace(/\(\d+\)/, '').trim(); st.classList.add('hfold'); if (open[key]) st.classList.add('on');
    h.onclick = () => { st.classList.toggle('on'); open[key] = st.classList.contains('on'); apply(st); };
    apply(st); });
  let t = 0; new MutationObserver(() => { if (!t) t = requestAnimationFrame(() => { t = 0; scan(); }); }).observe(document.body, { childList: true, subtree: true });
})();
