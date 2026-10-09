/* =========================================================
   EPS ONE — Outil « Course d'orientation »
   Parcours (balises, niveaux, obligatoires) · Séance (départs,
   arrivées, balises, pénalités, RK) · Bilan cumulé
   ========================================================= */
DB.co = DB.co || { parcours: [], seances: [], current: null };
ICONS.co = '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/><circle cx="12" cy="12" r=".8" fill="url(#icoGrad)"/>';

const CO_TYPES = {
  etoile:   ['Étoile', 'Retour au départ après chaque balise : le carton est contrôlé à chaque retour.'],
  papillon: ['Papillon', 'Retour au départ toutes les 2, 3… balises (boucles) : contrôle à chaque retour.'],
  reseau:   ['Réseau de postes', 'Balises obligatoires en groupe, balises facultatives en individuel pour marquer un maximum de points.'],
  suivi:    ['Suivi d\'itinéraire', 'L\'enseignant fixe l\'ordre des balises et surligne l\'itinéraire sur la carte importée.'],
  relais:   ['Relais', 'Équipes : chaque élève part à son tour chercher 1 ou plusieurs balises, puis passe le relais.'],
  libre:   ['Parcours libre', 'Balises dans l\'ordre choisi.'],
  photo:   ['Parcours photo', 'Chaque balise a une photo de son emplacement : l\'élève touche la balise et la photo s\'affiche en grand pour le guider.'],
  defs:    ['Parcours définitions', 'Chaque balise a une définition (ex. « proche d\'une butte ») : l\'élève touche la balise et lit où la chercher.'],
  koh:     ['Boussole Koh-Lanta', 'Depuis une zone (photo), l\'élève mémorise une couleur (direction) et un nombre de pas pour trouver une super balise ; il peut revenir revoir l\'indice.'],
};
const coId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const hms = s => { if (s == null || isNaN(s)) return '–'; s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
const clock = t => t ? new Date(t).toLocaleTimeString('fr-FR') : '––:––:––';
const mpk = (sec, km) => km > 0 && sec > 0 ? hms(sec / km) + ' /km' : '–';

document.head.insertAdjacentHTML('beforeend', `<style>
.co-tabs{display:flex;gap:6px;margin-bottom:12px}
.co-tabs button{flex:1;padding:11px 6px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800}
.co-tabs button.on{background:var(--grad);color:#fff;border-color:transparent}
.bal-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)}
.bal-row:last-child{border-bottom:none}
.bal-row input.num{width:64px;text-align:center;padding:7px}
.bal-row .lvl{margin:0;flex:1}
.bal-row .lvl button{padding:7px 2px}
.chk-ob{display:flex;align-items:center;gap:4px;font-size:.75rem;font-weight:800;color:var(--muted);white-space:nowrap}
.chk-ob input{width:18px;height:18px}
.run{border:2px solid var(--line);border-radius:16px;padding:12px;background:var(--card);margin-top:10px}
.run.go{border-color:#2F6BD8}.run.fin{border-color:var(--gold);background:var(--grad-soft)}
.run-h{display:flex;align-items:center;gap:8px}
.run-h b{flex:1}
.run-t{font-size:1.6rem;font-weight:900;font-variant-numeric:tabular-nums}
.bal-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.co-pick{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
.bal-chips button{min-width:46px;padding:8px 6px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);font-weight:900;font-size:.85rem}
.bal-chips button.on{background:#1B9E5A;color:#fff;border-color:transparent}
.bal-chips button.ob{box-shadow:inset 0 -3px 0 var(--danger)}
.bal-chips button sup{font-size:.6rem;opacity:.8}
.co-times{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.co-times input{padding:8px}
</style>`);

/* ---------- Symboles de pinces : grille 4 × 4 de points (code = 16 caractères 0/1) ---------- */
const PAT_N = 16;
const isPat = c => typeof c === 'string' && /^[01]{16}$/.test(c) && c.includes('1');
const CO_PATS = (() => {                       // répertoire de 90 symboles distincts (les 50 premiers inchangés)
  let seed = 20260926; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const out = [], dist = (a, b) => [...a].filter((x, i) => x !== b[i]).length;
  while (out.length < 90) { const k = 4 + Math.floor(rnd() * 4), cells = new Set(); while (cells.size < k) cells.add(Math.floor(rnd() * PAT_N));
    const c = Array.from({ length: PAT_N }, (_, i) => cells.has(i) ? '1' : '0').join('');
    if (out.every(o => dist(o, c) >= 4)) out.push(c); }
  return out;
})();
function patSVG(code, px = 44, col = '#0B2A5B') {
  const on = isPat(code) ? code : '0'.repeat(PAT_N);
  return `<svg viewBox="0 0 44 44" width="${px}" height="${px}" style="display:block"><rect x="1" y="1" width="42" height="42" rx="5" fill="#fff" stroke="#9AA6B8" stroke-width="1.5"/>${[...on].map((v, i) => { const x = 8 + (i % 4) * 9.3, y = 8 + Math.floor(i / 4) * 9.3;
    return v === '1' ? `<circle cx="${x}" cy="${y}" r="3.4" fill="${col}"/>` : `<circle cx="${x}" cy="${y}" r="1.1" fill="#D5DBE5"/>`; }).join('')}</svg>`;
}
/* Sélecteur de symbole : répertoire, dessin libre, options supplémentaires */
function patPicker({ title, options, draw = true, extra = [], current, used = [], onPick, only }) {
  const o = document.createElement('div');
  o.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(7,18,42,.72);display:grid;place-items:center;padding:12px';
  let tab = only === 'draw' ? 'draw' : 'rep', cells = [...(isPat(current) ? current : '0'.repeat(PAT_N))];
  const render = () => {
    o.innerHTML = `<div class="card" style="max-width:520px;width:100%;max-height:92vh;overflow:auto"><h3>${esc(title)}</h3>
      ${draw && only !== 'draw' ? `<div class="co-tabs" style="margin-top:8px"><button data-t="rep" class="${tab === 'rep' ? 'on' : ''}">📚 Répertoire</button><button data-t="draw" class="${tab === 'draw' ? 'on' : ''}">✏️ Dessiner</button></div>` : ''}
      ${tab === 'rep' ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:6px">${options.map(c => `<button data-c="${c}" style="padding:4px;border-radius:10px;border:2px solid ${c === current ? 'var(--gold)' : 'transparent'};background:${used.includes(c) && c !== current ? 'var(--line)' : 'transparent'};cursor:pointer;opacity:${used.includes(c) && c !== current ? .45 : 1}">${patSVG(c, 46)}</button>`).join('')}</div>
          ${extra.map(x => `<button class="btn ${x.cls || 'btn-ghost'} btn-block" style="margin-top:8px" data-x="${x.v}">${x.l}</button>`).join('')}`
        : `<p class="muted" style="margin:0 0 8px">Touchez les points pour reproduire le symbole de la pince.</p>
          <div style="display:grid;grid-template-columns:repeat(4,56px);gap:8px;justify-content:center">${cells.map((v, i) => `<button data-i="${i}" style="width:56px;height:56px;border-radius:50%;border:2px solid var(--line);background:${v === '1' ? '#0B2A5B' : 'var(--card)'};cursor:pointer"></button>`).join('')}</div>
          <button class="btn btn-grad btn-block" style="margin-top:12px" id="pv">✔ ${only === 'draw' ? 'Valider mon dessin' : 'Utiliser ce symbole'}</button>${only === 'draw' ? extra.map(x => `<button class="btn ${x.cls || 'btn-ghost'} btn-block" style="margin-top:8px" data-x="${x.v}">${x.l}</button>`).join('') : ''}`}
      <button class="btn btn-ghost btn-block" style="margin-top:8px" id="pc">Annuler</button></div>`;
    o.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; render(); });
    o.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { o.remove(); onPick(b.dataset.c); });
    o.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { o.remove(); onPick(b.dataset.x); });
    o.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { cells[+b.dataset.i] = cells[+b.dataset.i] === '1' ? '0' : '1'; render(); });
    const pv = o.querySelector('#pv'); if (pv) pv.onclick = () => { const c = cells.join(''); if (!isPat(c)) return toast('Ajoutez au moins un point'); o.remove(); onPick(c); };
    o.querySelector('#pc').onclick = () => o.remove();
  };
  o.onclick = e => { if (e.target === o) o.remove(); };
  render(); document.body.appendChild(o);
}

/* Contrôle des balises par l'élève sur la tablette de son équipe :
   when = 'live' (pendant la course, l'élève a la tablette / le téléphone) ou 'arrivee' (carton papier, contrôle après l'arrivée)
   how  = 'choix' (choisir le symbole) · 'dessin' (redessiner le symbole) · 'auto' (symboles affichés, l'élève coche VALIDÉ / FAUX) */
const coCtl = () => Object.assign({ when: 'arrivee', how: 'choix' }, DB.co.ctl || {});
// réglage figé dans la séance au lancement (et transmis aux tablettes qui la rejoignent)
const curCtl = cur => Object.assign(coCtl(), (cur && cur.ctl) || {});
const CTL_TXT = c => `${c.when === 'arrivee' ? '📝 à l\'arrivée (carton papier)' : '📱 pendant la course'} · ${{ choix: '🔣 choisir le symbole', dessin: '✏️ dessiner le symbole', auto: '👀 comparer avec le carton' }[c.how]}`;
/* ---------- Organisation selon le type de parcours ----------
   Étoile (1 balise), Papillon (boucles de N balises), Relais (N balises par relayeur) : la course est une suite d'allers-retours
   au point de départ (r.legs = [{ bal:[n…], dep, ret, who }]) ; le carton est contrôlé à chaque retour ; le temps = somme des allers-retours. */
const CO_LEG = { etoile: 1, papillon: 1, relais: 1 };
const legK = p => p.type === 'etoile' ? 1 : Math.max(1, +(p.type === 'papillon' ? p.boucle : p.relais) || (p.type === 'papillon' ? 2 : 1));
const isLegRun = (r, p) => !!CO_LEG[p.type] && !(r.dep && !r.legs);          // séance commencée avant la v22.2 : ancien fonctionnement
const curLeg = r => { const L = r.legs || [], l = L[L.length - 1]; return l && !l.ret ? l : null; };
const legLeft = (r, p) => { const used = new Set((r.legs || []).flatMap(l => l.bal)); return p.balises.filter(b => !used.has(b.num)); };
const legNext = (r, p) => { const left = legLeft(r, p).map(b => b.num), nx = (r.nx || []).filter(n => left.includes(n)); return nx.length ? nx : left.slice(0, legK(p)); };
const legWho = (r, p) => p.type === 'relais' && r.members.length ? r.members[(r.legs || []).length % r.members.length] : null;
const legSec = r => (r.legs || []).reduce((a, l) => a + ((l.ret || (r.arr ? l.dep : Date.now())) - l.dep), 0) / 1000;
const elapsed = r => !r.dep ? 0 : r.legs ? legSec(r) : ((r.arr || Date.now()) - r.dep) / 1000;
const CO_ORG = p => ({ etoile: '⭐ Étoile : l\'élève revient au départ après chaque balise ; son carton est contrôlé à chaque retour avant de repartir.',
  papillon: `🦋 Papillon : retour au départ toutes les ${legK(p)} balises ; contrôle du carton à chaque retour.`,
  relais: `🔁 Relais : les élèves d'une équipe partent chacun leur tour chercher ${legK(p)} balise${legK(p) > 1 ? 's' : ''}, puis passent le relais au retour (contrôle à chaque retour).`,
  reseau: '🕸 Réseau : les balises obligatoires se font en groupe, les facultatives en individuel (attribuez chaque facultative à l\'élève qui l\'a trouvée).',
  suivi: '🧵 Suivi d\'itinéraire : balises dans l\'ordre fixé par l\'enseignant, itinéraire tracé sur la carte.',
  photo: '📷 Parcours photo : sur la tablette, l\'élève touche une balise et voit en grand la photo de son emplacement.',
  defs: '📝 Parcours définitions : sur la tablette, l\'élève touche une balise et lit sa définition (où la chercher) ; les définitions sont aussi imprimées sous la carte.',
  koh: `🏝 Boussole Koh-Lanta : l'élève affiche l'indice d'une super balise (zone, couleur = direction, nombre de pas), le mémorise ${p.memo || 10} s, puis part la chercher ; il peut revenir revoir l'indice${p.kohPen ? ` (−${p.kohPen} pt à chaque fois)` : ''}.`,
  libre: '🧭 Parcours libre : les élèves trouvent les balises dans l\'ordre de leur choix.' })[p.type] || '';

/* ---------- Carte du parcours : image importée + itinéraire surligné + balises placées ----------
   p.map = { img: dataURL, w, h, lines: [[x,y,x,y…]], marks: { D:[x,y], 31:[x,y]… } } — coordonnées sur une largeur de 1000 */
function coMapHTML(m, p, opt = {}) {
  if (!m || !m.img) return '';
  const H = Math.round(1000 * m.h / m.w), ord = p.balises.map(b => String(b.num));
  const lines = (m.lines || []).map(l => `<polyline points="${l.join(',')}" fill="none" stroke="#E0218A" stroke-opacity=".55" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const mk = Object.entries(m.marks || {}).map(([k, [x, y]]) => k === 'D'
    ? `<polygon points="${x},${y - 30} ${x - 26},${y + 16} ${x + 26},${y + 16}" fill="none" stroke="#B0127A" stroke-width="6"/>`
    : `<circle cx="${x}" cy="${y}" r="24" fill="none" stroke="#B0127A" stroke-width="6"/><text x="${x + 28}" y="${y - 20}" font-size="34" font-weight="900" fill="#B0127A" stroke="#fff" stroke-width="6" paint-order="stroke">${p.type === 'suivi' && ord.includes(k) ? (ord.indexOf(k) + 1) + '·' : ''}${k}</text>`).join('');
  return `<div class="co-map" style="position:relative;line-height:0;border-radius:12px;overflow:hidden;background:#fff"><img src="${m.img}" style="width:100%;display:block" alt="Carte"><svg viewBox="0 0 1000 ${H}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;${opt.edit ? 'touch-action:none' : 'pointer-events:none'}">${lines}${mk}</svg></div>`;
}
function coMapShow(p) {
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(7,18,42,.9);overflow:auto;padding:12px';
  const V = coMapOf(p), hasObj = V && (V.objs || []).length; let picto = coPictoGet(); const Z = { s: 1, tx: 0, ty: 0 };
  const render = () => { o.innerHTML = `<div style="max-width:900px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;color:#fff;margin-bottom:8px"><b style="flex:1">🗺 ${esc(p.nom)}</b>${hasObj ? `<button class="btn ${picto ? 'btn-grad' : 'btn-ghost'}" id="mpi" style="color:#fff">🖼 Symboles illustrés${picto ? ' ✓' : ''}</button>` : ''}<button class="btn btn-ghost" id="mx">✕ Fermer</button></div>${coZoomHTML(coMapView(V, { picto }))}<p style="color:#fff;font-size:.8rem;margin:6px 0 0;opacity:.8">2 doigts pour zoomer · 1 doigt pour faire glisser${hasObj ? ' · 🖼 Symboles illustrés : dessins à la place des symboles de course d\'orientation (adaptation)' : ''}</p>${(() => { const lg = coLegend(V, picto); return lg ? `<div class="card" style="margin-top:8px">${lg}</div>` : ''; })()}
    ${coAideList(p).length ? `<div class="card" style="margin-top:8px"><b>🔎 Aide pour trouver les balises</b>${coAideChips(p)}</div>` : ''}
    ${p.type === 'suivi' ? `<div class="card" style="margin-top:8px"><b>Ordre des balises :</b> ${p.balises.map((b, i) => `${i + 1}. <b>${b.num}</b>`).join(' → ')}</div>` : ''}</div>`;
    o.querySelector('#mx').onclick = () => o.remove();
    coAideBind(o, p);
    if (o.querySelector('#mpi')) o.querySelector('#mpi').onclick = () => { picto = !picto; coPictoSet(picto); render(); };
    if (V) coZoom(o.querySelector('.co-zv'), V, Z, { vh: .8 }); };
  document.body.appendChild(o); render();
}
const coImg = (file, cb, max = 1400) => { const url = URL.createObjectURL(file), img = new Image();
  img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); cb(c.toDataURL('image/jpeg', max > 1400 ? .78 : .7), c.width, c.height); };
  img.onerror = () => toast('Image illisible'); img.src = url; };
function coMapEdit(p, onDone) {
  const m = JSON.parse(JSON.stringify(p.map || {})); m.lines = m.lines || []; m.marks = m.marks || {};
  let mode = 'trace', pick = null; const Z = { s: 1, tx: 0, ty: 0 };
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:300;background:var(--bg,#F3F6FB);overflow:auto;padding:12px';
  const next = () => ['D', ...p.balises.map(b => String(b.num))].find(k => !m.marks[k]) || null;
  const render = () => { if (pick == null) pick = next();
    o.innerHTML = `<div style="max-width:900px;margin:0 auto"><div class="card"><h3 style="margin-top:0">🗺 Carte · ${esc(p.nom)}</h3>
      <div class="seg">${[['trace', '🖍 Tracer l\'itinéraire'], ['bal', '📍 Placer départ / balises'], ['vue', '✋ Déplacer la carte']].map(([k, l]) => `<button data-mo="${k}" class="${mode === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      ${mode === 'bal' ? `<p class="muted" style="margin:8px 0 4px;font-size:.8rem">Choisissez ce que vous placez puis touchez la carte (toucher à nouveau déplace le repère).</p><div class="bal-chips">${['D', ...p.balises.map(b => String(b.num))].map(k => `<button data-pk="${k}" class="${pick === k ? 'on' : ''}" style="${m.marks[k] ? '' : 'border-style:dashed'}">${k === 'D' ? '△ Départ' : k}</button>`).join('')}</div>`
        : mode === 'trace' ? '<p class="muted" style="margin:8px 0 0;font-size:.8rem">1 doigt : surligner l\'itinéraire · 2 doigts : zoomer et déplacer la carte.</p>' : '<p class="muted" style="margin:8px 0 0;font-size:.8rem">1 doigt : faire glisser · 2 doigts : zoomer.</p>'}
      <div class="row" style="margin-top:8px"><button class="btn btn-ghost" id="mu">↶ Annuler le dernier trait</button><button class="btn btn-ghost" id="mc">🗑 Effacer traits et repères</button></div></div>
      <div style="margin-top:10px" id="mw">${coZoomHTML(coMapHTML(m, p))}</div>
      <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="ms">✔ Valider la carte</button><button class="btn btn-ghost" id="mq">Annuler</button></div></div>`;
    o.querySelectorAll('[data-mo]').forEach(b => b.onclick = () => { mode = b.dataset.mo; render(); });
    o.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { pick = b.dataset.pk; render(); });
    o.querySelector('#mu').onclick = () => { if (!m.lines.length) return toast('Aucun trait à annuler'); m.lines.pop(); render(); };
    o.querySelector('#mc').onclick = () => { if (!confirm('Effacer l\'itinéraire et tous les repères ?')) return; m.lines = []; m.marks = {}; pick = null; render(); };
    o.querySelector('#ms').onclick = () => { o.remove(); onDone(m); };
    o.querySelector('#mq').onclick = () => { if (confirm('Quitter sans enregistrer les modifications de la carte ?')) o.remove(); };
    const svg = o.querySelector('#mw svg'), zv = o.querySelector('#mw .co-zv');
    if (mode === 'vue') return coZoom(zv, m, Z);
    if (mode === 'bal') return coZoom(zv, m, Z, { onTap: e => { if (!pick) return toast('Tous les repères sont placés : choisissez-en un pour le déplacer'); m.marks[pick] = coSvgPt(svg, m, e); pick = next(); render(); } });
    coZoom(zv, m, Z, { trace: coTrace(svg, m, m.lines) });
  };
  render(); document.body.appendChild(o);
}
/* ---------- Lieux (établissement, bois…) : carte vierge + postes placés (numéro + symbole), comme Purple Pen ----------
   DB.co.lieux = [{ id, nom, map:{img,w,h}, postes:[{ id, num, code, x, y }], dep:[x,y], arr:[x,y] }]
   Un parcours lié à un lieu (p.lieu) prend ses balises parmi les postes (b.pid) ; le tracé se dessine selon le type ; p.hl = surlignage. */
const coLieux = () => (DB.co.lieux = DB.co.lieux || []);
const coLieu = id => id && coLieux().find(l => l.id === id);
const coMS = L => Math.min(2, Math.max(.15, +(L && L.taille) || .6));   // taille des repères du lieu (1 = grande)
/* ---------- Objets de carte (comme Purple Pen / ISOM simplifié) ----------
   L.objs = [{ id, t, x, y } (point) | { id, t, pts:[x,y,…] } (ligne / zone)] */
const CO_OBJ = {   // symboles inspirés de la norme ISOM (cartes de course d'orientation) et des symboles de traçage (magenta)
  arbre:    { g: 'pt', l: 'Arbre remarquable' },          // ISOM 417 : rond vert
  banc:     { g: 'pt', l: 'Banc / petit objet construit' },   // petit objet construit : noir
  eau:      { g: 'pt', l: 'Point d\'eau / ravitaillement' },  // symbole de traçage : gobelet magenta
  secours:  { g: 'pt', l: 'Poste de secours' },           // symbole de traçage : croix magenta
  fontaine: { g: 'pt', l: 'Fontaine / robinet / puits' }, // ISOM 311 : rond bleu
  trou:     { g: 'pt', l: 'Trou d\'eau / petite mare' },  // petit point bleu plein
  buisson:  { g: 'pt', l: 'Buisson' },                    // ISOM 418 : petit rond vert
  butte:    { g: 'pt', l: 'Petite butte' },               // ISOM 112 : point marron
  fosse:    { g: 'pt', l: 'Trou / fosse' },               // ISOM 115 : V marron
  construit:{ g: 'pt', l: 'Élément construit remarquable' },  // ISOM 540 : rond noir (poteau, lampadaire, panier…)
  rocher:   { g: 'pt', l: 'Rocher' },                     // ISOM 206 : point noir
  objet:    { g: 'pt', l: 'Objet particulier' },          // ISOM 540 : croix noire
  cloture:  { g: 'ln', l: 'Clôture' },                    // ISOM 516
  clotureX: { g: 'ln', l: 'Clôture infranchissable' },    // ISOM 518
  mur:      { g: 'ln', l: 'Mur' },                        // ISOM 513
  chemin:   { g: 'ln', l: 'Chemin / sentier' },           // ISOM 505-506 : tirets noirs
  haie:     { g: 'ln', l: 'Haie / végétation infranchissable' },  // ISOM 411 : vert foncé
  ruisseau: { g: 'ln', l: 'Ruisseau / fossé' },           // ISOM 305 : ligne bleue
  limite:   { g: 'ln', l: 'Limite de la zone de course' },  // traçage : ligne magenta
  interdit: { g: 'zn', l: 'Zone interdite' },             // traçage / ISOM 709 : hachures magenta
  danger:   { g: 'zn', l: 'Zone dangereuse' },            // traçage : quadrillage magenta
  bat:      { g: 'zn', l: 'Bâtiment' },                   // ISOM 521 : noir
  etang:    { g: 'zn', l: 'Eau / étang' },                // ISOM 301 : bleu, bord noir
  veg:      { g: 'zn', l: 'Végétation dense' },           // ISOM 408-410 : vert
  degage:   { g: 'zn', l: 'Terrain dégagé' },             // ISOM 401 : jaune
  bitume:   { g: 'zn', l: 'Cour / zone goudronnée' },     // ISOM 529 : beige bordé de noir
};
const CO_OBJ_G = { pt: 'Points (touchez la carte)', ln: 'Lignes (touchez chaque point, puis ✔ Terminer)', zn: 'Zones (touchez le contour, puis ✔ Terminer)' };
const coTicks = (pts, step, len, both) => { let out = '', acc = step / 2;
  for (let i = 2; i < pts.length; i += 2) { const ax = pts[i - 2], ay = pts[i - 1], bx = pts[i], by = pts[i + 1], L = Math.hypot(bx - ax, by - ay); if (!L) continue; const ux = (bx - ax) / L, uy = (by - ay) / L;
    for (; acc < L; acc += step) { const x = ax + ux * acc, y = ay + uy * acc; out += `M${x.toFixed(1)},${y.toFixed(1)} l${(-uy * len).toFixed(1)},${(ux * len).toFixed(1)}`; if (both) out += ` M${x.toFixed(1)},${y.toFixed(1)} l${(uy * len).toFixed(1)},${(-ux * len).toFixed(1)}`; }
    acc -= L; }
  return out; };
// symbole d'un point, centré en 0,0 (taille ≈ 30)
const coObjPt = t => ({
  arbre: '<circle r="10" fill="#3FAE49"/>',
  banc: '<rect x="-13" y="-4.5" width="26" height="9" fill="#000"/>',
  eau: '<path d="M-11,-12 L11,-12 L7,12 L-7,12 Z" fill="none" stroke="#B0127A" stroke-width="4" stroke-linejoin="round"/>',
  secours: '<path d="M-4,-14 h8 v10 h10 v8 h-10 v10 h-8 v-10 h-10 v-8 h10 Z" fill="none" stroke="#B0127A" stroke-width="3.5" stroke-linejoin="round"/>',
  rocher: '<circle r="7" fill="#000"/>',
  fontaine: '<circle r="9" fill="none" stroke="#00A0E0" stroke-width="4.5"/>',
  trou: '<circle r="7" fill="#00A0E0"/>',
  buisson: '<circle r="6.5" fill="#3FAE49"/>',
  butte: '<circle r="7" fill="#B3591B"/>',
  fosse: '<path d="M-9,-8 L0,9 L9,-8" fill="none" stroke="#B3591B" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>',
  construit: '<circle r="9" fill="none" stroke="#000" stroke-width="4.5"/>',
  objet: '<path d="M-9,-9 L9,9 M9,-9 L-9,9" stroke="#000" stroke-width="4.5" stroke-linecap="round"/>' })[t] || '';
/* Symboles illustrés (adaptation pour élèves à besoins particuliers) : dessin parlant à la place du symbole ISOM */
const CO_PICTO = { fontaine: '🚰', trou: '💧', buisson: '🌱', butte: '⛰️', fosse: '🕳️', construit: '🏛️', ruisseau: '🏞️', bitume: '🛣️', arbre: '🌳', banc: '🪑', eau: '🥤', secours: '⛑️', rocher: '🪨', objet: '❌', cloture: '🚧', clotureX: '🚫', mur: '🧱', chemin: '👣', haie: '🌿', limite: '🛑', interdit: '⛔', danger: '⚠️', bat: '🏠', etang: '🌊', veg: '🌲', degage: '🌼' };
const coPictoGet = () => { try { return localStorage.getItem('epsone_co_picto') === '1'; } catch (e) { return false; } };
const coPictoSet = v => { try { localStorage.setItem('epsone_co_picto', v ? '1' : '0'); } catch (e) {} };
const coEmo = (e, x, y, MS, id, sz = 40) => `<g class="mk" data-id="${id}" data-x="${x.toFixed(1)}" data-y="${y.toFixed(1)}" data-k="${MS}" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${MS})"><text font-size="${sz}" text-anchor="middle" dominant-baseline="central" y="2">${e}</text></g>`;
function coObjSVG(o, MS, uid, picto) {
  const T = CO_OBJ[o.t]; if (!T) return '';
  if (picto) { if (T.g === 'pt') return coEmo(CO_PICTO[o.t], o.x, o.y, MS, 'o:' + o.id, 64);
    const p = o.pts || []; let cx = 0, cy = 0, n = p.length / 2; for (let i = 0; i < p.length; i += 2) { cx += p[i]; cy += p[i + 1]; } cx /= n || 1; cy /= n || 1;
    if (T.g === 'ln') { const k = Math.floor(n / 2) * 2; cx = n > 2 ? p[k] : (p[0] + p[2]) / 2; cy = n > 2 ? p[k + 1] : (p[1] + p[3]) / 2; }
    return coObjSVG(o, MS, uid) + coEmo(CO_PICTO[o.t], cx, cy, MS, 'p:' + o.id, T.g === 'zn' ? 70 : 52); }
  if (T.g === 'pt') return `<g class="mk" data-id="o:${o.id}" data-x="${o.x}" data-y="${o.y}" data-k="${MS}" transform="translate(${o.x},${o.y}) scale(${MS})"><g transform="scale(1.4)">${coObjPt(o.t)}</g></g>`;
  const P = (o.pts || []).map(v => Math.round(v)).join(','), w = v => (v * MS).toFixed(1);
  if (T.g === 'ln') { const d = `<polyline points="${P}" fill="none" stroke-linejoin="round" stroke-linecap="round" `;
    return { cloture: `${d}stroke="#000" stroke-width="${w(4)}"/><path d="${coTicks(o.pts, 22 * MS, 11 * MS)}" stroke="#000" stroke-width="${w(3)}"/>`,
      clotureX: `${d}stroke="#000" stroke-width="${w(7)}"/><path d="${coTicks(o.pts, 18 * MS, 13 * MS, true)}" stroke="#000" stroke-width="${w(4)}"/>`,
      mur: `${d}stroke="#000" stroke-width="${w(6)}"/>`,
      chemin: `${d}stroke="#000" stroke-width="${w(5)}" stroke-dasharray="${w(18)} ${w(10)}"/>`,
      haie: `${d}stroke="#1F8A3A" stroke-width="${w(11)}"/>`,
      ruisseau: `${d}stroke="#00A0E0" stroke-width="${w(6)}"/>`,
      limite: `${d}stroke="#B0127A" stroke-width="${w(7)}"/>` }[o.t] || ''; }
  const fill = { interdit: `url(#hz${uid})`, danger: `url(#hx${uid})`, bat: 'rgba(0,0,0,.85)', etang: 'rgba(0,160,224,.75)', veg: 'rgba(60,170,70,.6)', degage: 'rgba(255,186,53,.6)', bitume: 'rgba(222,200,160,.7)' }[o.t];
  const stroke = { interdit: '#B0127A', danger: '#B0127A', bat: '#000', etang: '#000', veg: 'none', degage: 'none', bitume: '#000' }[o.t];
  return `<polygon points="${P}" fill="${fill}" stroke="${stroke}" stroke-width="${w(o.t === 'interdit' || o.t === 'danger' ? 5 : 3)}" stroke-linejoin="round"/>`;
}
const coObjDefs = (MS, uid) => `<defs><pattern id="hz${uid}" patternUnits="userSpaceOnUse" width="${(14 * MS).toFixed(1)}" height="20"><rect width="${(5 * MS).toFixed(1)}" height="20" fill="#B0127A" fill-opacity=".8"/></pattern>
  <pattern id="hx${uid}" patternUnits="userSpaceOnUse" width="${(16 * MS).toFixed(1)}" height="${(16 * MS).toFixed(1)}" patternTransform="rotate(45)"><rect width="${(4 * MS).toFixed(1)}" height="${(16 * MS).toFixed(1)}" fill="#B0127A" fill-opacity=".75"/><rect width="${(16 * MS).toFixed(1)}" height="${(4 * MS).toFixed(1)}" fill="#B0127A" fill-opacity=".75"/></pattern></defs>`;
// objet sous le doigt (lim en unités carte)
function coObjHit(objs, x, y, lim) {
  const dSeg = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy, t = L2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2)) : 0; return Math.hypot(px - ax - t * dx, py - ay - t * dy); };
  const inPoly = (pts) => { let c = false; for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) { const xi = pts[i], yi = pts[i + 1], xj = pts[j], yj = pts[j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  let best = null, bd = Infinity;
  (objs || []).forEach(o => { const T = CO_OBJ[o.t]; if (!T) return; let d;
    if (T.g === 'pt') d = Math.hypot(o.x - x, o.y - y);
    else { d = Infinity; const p = o.pts || []; for (let i = 2; i < p.length; i += 2) d = Math.min(d, dSeg(x, y, p[i - 2], p[i - 1], p[i], p[i + 1])); if (T.g === 'zn') { d = Math.min(d, dSeg(x, y, p[p.length - 2], p[p.length - 1], p[0], p[1])); if (inPoly(p)) d = Math.min(d, lim * .9); } }
    if (d < lim && d < bd) { bd = d; best = o; } });
  return best;
}
function coViewLieu(p, L, opt = {}) {
  const pos = id => { const q = L.postes.find(x => x.id === id); return q && q.x != null ? q : null; };
  const ordered = ['suivi', 'papillon', 'relais'].includes(p.type), marks = [], sel = new Set(p.balises.map(b => b.pid));
  if (L.dep) marks.push({ kind: 'D', x: L.dep[0], y: L.dep[1] });
  if (L.arr) marks.push({ kind: 'A', x: L.arr[0], y: L.arr[1] });
  if (opt.all) L.postes.filter(q => q.x != null && !sel.has(q.id)).forEach(q => marks.push({ kind: 'g', x: q.x, y: q.y, lab: String(q.num), id: q.id }));
  p.balises.forEach((b, i) => { const q = pos(b.pid); if (q) marks.push({ kind: 'c', x: q.x, y: q.y, lab: (ordered ? (i + 1) + '-' : '') + b.num, col: p.type === 'reseau' && !b.ob ? '#2F6BD8' : '#B0127A', id: q.id }); });
  const D = L.dep, A = L.arr || L.dep, P = p.balises.map(b => pos(b.pid)).filter(Boolean).map(q => [q.x, q.y]), paths = [];
  if (D && p.type === 'etoile') P.forEach(q => paths.push([D, q]));
  else if (D && (p.type === 'papillon' || p.type === 'relais')) { const K = legK(p); for (let i = 0; i < P.length; i += K) paths.push([D, ...P.slice(i, i + K), D]); }
  else if (p.type === 'suivi') paths.push([D, ...P, A].filter(Boolean));
  return { img: L.map.img, w: L.map.w, h: L.map.h, hl: p.hl || [], paths, marks, lieu: L.nom, ms: coMS(L), objs: L.objs || [] };
}
// carte à afficher pour un parcours : lieu (calculée) → copie transmise aux tablettes (p.mapv) → carte propre au parcours (p.map)
function coMapOf(p, opt) {
  if (!p) return null; const L = coLieu(p.lieu);
  if (L && L.map && L.map.img) return coViewLieu(p, L, opt);
  if (p.mapv && p.mapv.img) return p.mapv;
  const m = p.map; if (!m || !m.img) return null; const ord = p.balises.map(b => String(b.num));
  return { img: m.img, w: m.w, h: m.h, hl: m.lines || [], paths: [], marks: Object.entries(m.marks || {}).map(([k, [x, y]]) => k === 'D' ? { kind: 'D', x, y } : { kind: 'c', x, y, col: '#B0127A', lab: (p.type === 'suivi' && ord.includes(k) ? (ord.indexOf(k) + 1) + '-' : '') + k }) };
}
// copie transmise aux tablettes : carte calculée + photos / définitions affichées par le parcours
const coSnap = p => { const L = coLieu(p.lieu); let q = L && L.map && L.map.img ? { ...p, mapv: coViewLieu(p, L) } : { ...p };
  if (coAideOn(p)) q.balises = p.balises.map(b => { const a = coAide(p, b); return { ...b, ...(a.photo ? { photo: a.photo } : {}), ...(a.def ? { def: a.def } : {}) }; });
  return q; };
const coLite = pp => { const q = JSON.parse(JSON.stringify(pp)); if (q.map) delete q.map.img; delete q.mapv; (q.balises || []).forEach(b => { delete b.photo; if (b.koh) delete b.koh.photo; }); return q; };   // fiches enregistrées : sans les images
/* ---------- 🏝 Koh-Lanta : depuis une zone (photo), l'élève mémorise une couleur (direction) et un nombre de pas → super balise ----------
   b.koh = { photo, coul, pas } sur chaque super balise du parcours ; p.memo = secondes d'affichage ; p.kohPen = points perdus par indice revu */
const CO_COUL = { rouge: ['Rouge', '#E53935'], bleu: ['Bleu', '#1E6FE0'], vert: ['Vert', '#2E9D46'], jaune: ['Jaune', '#FFD21F'], orange: ['Orange', '#FF8A1F'], violet: ['Violet', '#8E44AD'], rose: ['Rose', '#FF5FA8'], blanc: ['Blanc', '#FFFFFF'], noir: ['Noir', '#111111'] };
const CO_DIR = { N: ['Nord', 0], NE: ['Nord-Est', 45], E: ['Est', 90], SE: ['Sud-Est', 135], S: ['Sud', 180], SO: ['Sud-Ouest', 225], O: ['Ouest', 270], NO: ['Nord-Ouest', 315] };
const coDirSVG = (d, px = 60, col = '#fff') => { const a = (CO_DIR[d] || [0, 0])[1]; return `<svg viewBox="-50 -50 100 100" width="${px}" height="${px}" style="display:block;margin:0 auto"><circle r="46" fill="none" stroke="${col}" stroke-width="4" opacity=".6"/><text y="-30" text-anchor="middle" font-size="16" font-weight="900" fill="${col}">N</text><g transform="rotate(${a})"><path d="M0,-40 L12,4 L0,-4 L-12,4 Z" fill="${col}"/><path d="M0,40 L12,4 L0,-4 L-12,4 Z" fill="${col}" opacity=".35"/></g></svg>`; };
// correspondances couleur → direction, réglées par l'enseignant pour le parcours (p.kohDir = { rouge: 'NE', … })
const coKohMap = p => Object.entries(p.kohDir || {}).filter(([c, d]) => CO_COUL[c] && CO_DIR[d]);
const coKohTableHTML = (p, print) => `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(${print ? '55mm' : '140px'},1fr));gap:${print ? '4mm' : '10px'};margin-top:${print ? '6mm' : '0'}">${coKohMap(p).map(([c, d]) => { const C = CO_COUL[c], fg = c === 'blanc' || c === 'jaune' ? '#111' : '#fff';
  return `<div style="border-radius:16px;background:${C[1]};border:2px solid #000;color:${fg};text-align:center;padding:${print ? '4mm' : '10px'};font-weight:900"><div style="font-size:${print ? '18pt' : '1.3rem'}">${C[0]}</div>${coDirSVG(d, print ? 90 : 70, fg)}<div style="font-size:${print ? '15pt' : '1.1rem'}">${CO_DIR[d][0]}</div></div>`; }).join('')}</div>`;
function coKohTable(p) {
  if (!coKohMap(p).length) return toast('Aucune correspondance couleur → direction réglée pour ce parcours');
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:330;background:#07122A;overflow:auto;padding:12px';
  o.innerHTML = `<div style="max-width:900px;margin:0 auto;color:#fff"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><b style="flex:1;font-size:1.3rem">🧭 Couleurs → directions</b><button class="btn btn-ghost" id="kx" style="color:#fff">✕ Fermer</button></div>${coKohTableHTML(p)}</div>`;
  o.querySelector('#kx').onclick = () => o.remove(); document.body.appendChild(o);
}
const coKohOk = b => b.koh && b.koh.coul && b.koh.pas;
function coKohShow(p, b, opt = {}) {
  const K = b.koh || {}, C = CO_COUL[K.coul] || ['?', '#999'], memo = opt.memo || 0, i = p.balises.filter(coKohOk).indexOf(b) + 1;
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:330;background:#07122A;overflow:auto;padding:12px;display:flex;flex-direction:column';
  let left = memo, tm = null;
  const body = () => `<div style="max-width:900px;width:100%;margin:0 auto;display:flex;flex-direction:column;gap:12px;flex:1;color:#fff">
      <div style="display:flex;align-items:center;gap:8px"><b style="flex:1;font-size:1.3rem">🏝 Super balise ${i || ''}</b><button class="btn btn-ghost" id="kx" style="color:#fff">✕ Fermer</button></div>
      ${K.photo ? `<div><div style="font-weight:800;margin-bottom:6px">📍 Place-toi dans cette zone :</div><img src="${K.photo}" style="width:100%;max-height:42vh;object-fit:contain;border-radius:14px;background:#000" alt="Zone de départ"></div>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="border-radius:18px;background:${C[1]};border:3px solid #fff;min-height:150px;display:grid;place-items:center;text-align:center;font-weight:900;color:${K.coul === 'blanc' || K.coul === 'jaune' ? '#111' : '#fff'}"><div><div style="font-size:2rem">${C[0]}</div><div style="font-size:.9rem;font-weight:700;opacity:.85">🧭 direction</div></div></div>
        <div style="border-radius:18px;background:#fff;color:#07122A;min-height:150px;display:grid;place-items:center;text-align:center"><div><div style="font-size:3.4rem;font-weight:900;line-height:1">${esc(String(K.pas))}</div><div style="font-size:1.3rem;font-weight:800">👣 pas</div></div></div></div>
      ${memo ? `<div><div style="height:12px;border-radius:99px;background:rgba(255,255,255,.2);overflow:hidden"><div id="kb" style="height:100%;width:100%;background:#FFD21F;transition:width 1s linear"></div></div><div id="kt" style="text-align:center;font-weight:800;margin-top:6px">Mémorise ! ${left} s</div></div>` : ''}</div>`;
  const done = () => { clearInterval(tm); o.innerHTML = `<div style="max-width:600px;margin:auto;text-align:center;color:#fff"><div style="font-size:3rem">🧠</div><h2 style="color:#fff">Temps écoulé !</h2><p style="font-size:1.1rem">Tu as mémorisé la couleur et le nombre de pas ? À toi de trouver la super balise.<br><small style="opacity:.8">Tu peux revenir ici pour revoir l'indice${p.kohPen ? ` (−${p.kohPen} pt à chaque fois)` : ''}.</small></p><button class="btn btn-grad btn-block" id="kx">🏃 J'y vais !</button></div>`;
    o.querySelector('#kx').onclick = () => o.remove(); };
  o.innerHTML = body(); o.querySelector('#kx').onclick = () => { clearInterval(tm); o.remove(); };
  document.body.appendChild(o);
  if (memo) { requestAnimationFrame(() => { const kb = o.querySelector('#kb'); if (kb) kb.style.width = '0%', kb.style.transition = `width ${memo}s linear`; });
    tm = setInterval(() => { left--; const kt = o.querySelector('#kt'); if (kt) kt.textContent = `Mémorise ! ${left} s`; if (left <= 0) done(); }, 1000); }
}
function coKohEdit(b, onDone) {
  const K = { ...(b.koh || {}) };
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:310;background:rgba(7,18,42,.72);overflow:auto;padding:12px;display:grid;place-items:center';
  const render = () => { o.innerHTML = `<div class="card" style="max-width:560px;width:100%"><h3 style="margin-top:0">🏝 Super balise ${b.num} : l'indice</h3>
      <label>📍 Photo de la zone de départ (où l'élève se place)</label>${K.photo ? `<img src="${K.photo}" style="width:100%;max-height:240px;object-fit:contain;border-radius:10px;background:#000">` : '<p class="muted" style="margin:0;font-size:.85rem">Facultatif.</p>'}
      <div class="row" style="margin-top:6px"><label class="btn btn-ghost" style="text-align:center;cursor:pointer;margin:0">📷 ${K.photo ? 'Changer' : 'Prendre / choisir'}<input id="kf" type="file" accept="image/*" capture="environment" style="display:none"></label>${K.photo ? '<button class="btn btn-ghost" id="kr" style="flex:0 0 auto">🗑</button>' : ''}</div>
      <label style="margin-top:10px">🎨 Couleur (direction : repère de couleur posé dans la zone)</label>
      <div style="display:flex;flex-wrap:wrap;gap:8px">${Object.entries(CO_COUL).map(([k, [n, c]]) => `<button data-kc="${k}" title="${n}" style="width:54px;height:54px;border-radius:14px;background:${c};border:${K.coul === k ? '4px solid var(--gold,#C9A227)' : '2px solid var(--line)'};font-size:.62rem;font-weight:900;color:${k === 'blanc' || k === 'jaune' ? '#111' : '#fff'};cursor:pointer">${n}</button>`).join('')}</div>
      <label style="margin-top:10px">👣 Nombre de pas</label><input id="kp" type="number" min="1" value="${K.pas || ''}" placeholder="ex. 25">
      <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="ks">✔ Valider</button><button class="btn btn-ghost" id="kq">Annuler</button>${b.koh ? '<button class="btn btn-danger" id="kd" style="flex:0 0 auto">Retirer l\'indice</button>' : ''}</div></div>`;
    const rdP = () => { K.pas = Math.max(0, +o.querySelector('#kp').value || 0); };
    o.querySelector('#kf').onchange = e => { const f0 = e.target.files[0]; if (!f0) return; rdP(); coImg(f0, img => { K.photo = img; render(); }, 1000); };
    if (o.querySelector('#kr')) o.querySelector('#kr').onclick = () => { rdP(); delete K.photo; render(); };
    o.querySelectorAll('[data-kc]').forEach(x => x.onclick = () => { rdP(); K.coul = x.dataset.kc; render(); });
    o.querySelector('#ks').onclick = () => { rdP(); if (!K.coul || !K.pas) return toast('Choisissez une couleur et un nombre de pas'); b.koh = K; o.remove(); onDone && onDone(); };
    o.querySelector('#kq').onclick = () => o.remove();
    if (o.querySelector('#kd')) o.querySelector('#kd').onclick = () => { if (!confirm('Retirer l\'indice de cette balise ?')) return; delete b.koh; o.remove(); onDone && onDone(); }; };
  render(); document.body.appendChild(o);
}
/* ---------- Aide pour trouver les balises : 📷 parcours photo · 📝 définitions de postes ----------
   photo / définition rangées sur le poste du lieu (réutilisables dans tous les parcours) ou sur la balise (parcours sans lieu) ;
   le parcours choisit de les montrer : p.aidePhoto, p.aideDef */
const coBalSrc = (p, b) => { const L = coLieu(p.lieu), q = L && b.pid && L.postes.find(z => z.id === b.pid); return q || b; };
const coShowPh = p => p.type === 'photo' || !!p.aidePhoto, coShowDef = p => p.type === 'defs' || !!p.aideDef, coAideOn = p => coShowPh(p) || coShowDef(p);
const coAide = (p, b) => { const s = coBalSrc(p, b); return { photo: coShowPh(p) && s.photo ? s.photo : null, def: coShowDef(p) && s.def ? s.def : '' }; };
const coAideList = p => p && coAideOn(p) ? p.balises.filter(b => { const a = coAide(p, b); return a.photo || a.def; }) : [];
function coAideShow(p, num, only) {
  const L0 = coAideList(p).filter(b => !only || only.includes(b.num)); let k = Math.max(0, L0.findIndex(b => b.num === num)); if (!L0.length) return toast('Pas de photo ni de définition pour ce parcours');
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:320;background:rgba(7,18,42,.97);overflow:auto;padding:12px;display:flex;flex-direction:column';
  const render = () => { const b = L0[k], a = coAide(p, b), i = p.balises.indexOf(b);
    o.innerHTML = `<div style="max-width:900px;width:100%;margin:0 auto;display:flex;flex-direction:column;gap:10px;flex:1">
      <div style="display:flex;align-items:center;gap:8px;color:#fff"><b style="flex:1;font-size:1.3rem">Balise ${b.num}${p.type === 'suivi' ? ` <span style="opacity:.75;font-size:.9rem">(${i + 1}e)</span>` : ''}</b><button class="btn btn-ghost" id="ax" style="color:#fff">✕ Fermer</button></div>
      ${a.def ? `<div class="card" style="font-size:1.25rem;font-weight:800;line-height:1.35">📝 ${esc(a.def)}</div>` : ''}
      ${a.photo ? `<img src="${a.photo}" style="width:100%;max-height:70vh;object-fit:contain;border-radius:14px;background:#000" alt="Photo de l'emplacement de la balise ${b.num}">` : ''}
      ${L0.length > 1 ? `<div class="row"><button class="btn btn-ghost" id="ap" style="color:#fff" ${k ? '' : 'disabled'}>‹ Balise précédente</button><button class="btn btn-ghost" id="an" style="color:#fff" ${k < L0.length - 1 ? '' : 'disabled'}>Balise suivante ›</button></div>` : ''}</div>`;
    o.querySelector('#ax').onclick = () => o.remove();
    if (o.querySelector('#ap')) o.querySelector('#ap').onclick = () => { if (k) { k--; render(); } };
    if (o.querySelector('#an')) o.querySelector('#an').onclick = () => { if (k < L0.length - 1) { k++; render(); } }; };
  render(); document.body.appendChild(o);
}
// boutons « aide » des balises d'un parcours (tablette élève, séance, carte agrandie)
const coAideChips = (p, only, r) => { const L0 = coAideList(p).filter(b => !only || only.includes(b.num)); if (!L0.length) return '';
  return `<div class="bal-chips">${L0.map(b => { const a = coAide(p, b); return `<button data-aide="${b.num}"${r != null ? ` data-r="${r}"` : ''} style="min-width:64px">${b.num} ${a.photo ? '📷' : ''}${a.def ? '📝' : ''}</button>`; }).join('')}</div>`; };
const coAideBind = (root, p) => root.querySelectorAll('[data-aide]:not([data-r])').forEach(bt => bt.onclick = e => { e.stopPropagation(); coAideShow(p, +bt.dataset.aide); });
// édition de la photo et de la définition d'un poste / d'une balise
function coAideEdit(src, title, onDone, mode) {   // mode : 'photo' | 'defs' | (les deux)
  let photo = src.photo || null, def = src.def || '';
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:310;background:rgba(7,18,42,.72);overflow:auto;padding:12px;display:grid;place-items:center';
  const render = () => { o.innerHTML = `<div class="card" style="max-width:560px;width:100%"><h3 style="margin-top:0">${esc(title)}</h3>
      <div style="${mode === 'photo' ? 'display:none' : ''}"><label>📝 Définition du poste</label><textarea id="ad" rows="3" placeholder="ex. : au pied de la butte, côté nord du gros chêne…" style="width:100%">${esc(def)}</textarea></div>
      <div style="${mode === 'defs' ? 'display:none' : ''}"><label style="margin-top:10px">📷 Photo de l'emplacement</label>${photo ? `<img src="${photo}" style="width:100%;max-height:280px;object-fit:contain;border-radius:10px;background:#000">` : '<p class="muted" style="margin:0;font-size:.85rem">Aucune photo.</p>'}
      <div class="row" style="margin-top:8px"><label class="btn btn-ghost" style="text-align:center;cursor:pointer;margin:0">📷 ${photo ? 'Changer' : 'Prendre / choisir'}<input id="af" type="file" accept="image/*" capture="environment" style="display:none"></label>${photo ? '<button class="btn btn-ghost" id="ar" style="flex:0 0 auto">🗑 Retirer la photo</button>' : ''}</div></div>
      <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="as">✔ Valider</button><button class="btn btn-ghost" id="aq">Annuler</button></div></div>`;
    const rdD = () => { def = o.querySelector('#ad').value; };
    o.querySelector('#af').onchange = e => { const f0 = e.target.files[0]; if (!f0) return; rdD(); coImg(f0, img => { photo = img; render(); }, 1000); };
    if (o.querySelector('#ar')) o.querySelector('#ar').onclick = () => { rdD(); photo = null; render(); };
    o.querySelector('#as').onclick = () => { rdD(); if (photo) src.photo = photo; else delete src.photo; const d = def.trim(); if (d) src.def = d; else delete src.def; o.remove(); onDone && onDone(); };
    o.querySelector('#aq').onclick = () => o.remove(); };
  render(); document.body.appendChild(o);
}
   // fiches enregistrées : sans l'image
function coMapView(V, opt = {}) {
  if (!V || !V.img) return '';
  const H = Math.round(1000 * V.h / V.w), M = '#B0127A', MS = V.ms || 1;
  const segs = (V.paths || []).flatMap(P => P.slice(1).map((b, i) => [P[i], b])).map(([a, b]) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), r = 32 * MS; if (L < 2 * r + 4) return '';
    const ux = dx / L, uy = dy / L; return `<line x1="${(a[0] + ux * r).toFixed(1)}" y1="${(a[1] + uy * r).toFixed(1)}" x2="${(b[0] - ux * r).toFixed(1)}" y2="${(b[1] - uy * r).toFixed(1)}" stroke="${M}" stroke-width="${(5 * MS).toFixed(1)}" stroke-linecap="round"/>`; }).join('');
  const hl = (V.hl || []).map(l => `<polyline points="${l.join(',')}" fill="none" stroke="#E0218A" stroke-opacity=".5" stroke-width="${Math.max(4, 14 * MS).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const uid = Math.random().toString(36).slice(2, 7), O = V.objs || [], ord = { zn: 0, ln: 1, pt: 2 };
  const objs = O.length ? coObjDefs(MS, uid) + O.slice().sort((a, b) => (ord[(CO_OBJ[a.t] || {}).g] || 0) - (ord[(CO_OBJ[b.t] || {}).g] || 0)).map(o => `<g${opt.osel === o.id ? ' opacity=".55"' : ''}>${coObjSVG(o, MS, uid, opt.picto)}</g>`).join('') : '';
  const lab = (t, c) => `<text x="27" y="-20" font-size="32" font-weight="900" fill="${c}" stroke="#fff" stroke-width="6" paint-order="stroke" font-family="Arial,sans-serif">${esc(t)}</text>`;
  // chaque repère est un groupe centré : il garde une taille lisible quand on zoome (coZoom ajuste l'échelle)
  const mk = (V.marks || []).map(m => `<g class="mk" data-id="${m.id || m.kind}" data-x="${m.x}" data-y="${m.y}" data-k="${MS}" transform="translate(${m.x},${m.y}) scale(${MS})">${m.kind === 'D' ? `<polygon points="0,-32 -28,17 28,17" fill="none" stroke="${M}" stroke-width="6"/>`
    : m.kind === 'A' ? `<circle r="17" fill="none" stroke="${M}" stroke-width="5"/><circle r="28" fill="none" stroke="${M}" stroke-width="5"/>`
    : m.kind === 'g' ? `<circle r="24" fill="rgba(255,255,255,.35)" stroke="#8A94A6" stroke-width="4" stroke-dasharray="7 5"/>${lab(m.lab, '#6B7587')}`
    : `<circle r="24" fill="${opt.sel === m.id ? 'rgba(201,162,39,.35)' : 'none'}" stroke="${m.col || M}" stroke-width="6"/>${lab(m.lab, m.col || M)}`}</g>`).join('');
  return `<div class="co-map" style="position:relative;line-height:0;border-radius:${opt.print ? 0 : 12}px;overflow:hidden;background:#fff"><img src="${V.img}" draggable="false" style="width:100%;display:block;-webkit-user-drag:none;pointer-events:none" alt="Carte"><svg viewBox="0 0 1000 ${H}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;${opt.edit ? 'touch-action:none;cursor:crosshair' : 'pointer-events:none'}">${objs}${hl}${segs}${mk}${opt.draft || ''}</svg></div>`;
}
const coSvgPt = (svg, V, e) => { const R = svg.getBoundingClientRect(), H = 1000 * V.h / V.w; return [Math.round((e.clientX - R.left) / R.width * 1000), Math.round((e.clientY - R.top) / R.height * H)]; };
/* ---------- Carte zoomable : 1 doigt = faire glisser (ou tracer), 2 doigts = zoomer / déplacer, toucher bref = placer ----------
   Z = { s, tx, ty } gardé par l'éditeur (le zoom reste en place après chaque poste posé) */
const coZoomHTML = inner => `<div class="co-zv" style="position:relative;overflow:hidden;touch-action:none;border-radius:12px;background:#E9EDF3;-webkit-user-select:none;user-select:none"><div class="co-zi" style="transform-origin:0 0;will-change:transform">${inner}</div>
  <div style="position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:6px;z-index:2">${[['+', '＋'], ['-', '−'], ['0', '⤢']].map(([k, l]) => `<button data-z="${k}" style="width:42px;height:42px;border-radius:12px;border:1.5px solid var(--line);background:rgba(255,255,255,.92);font-size:1.3rem;font-weight:900;color:#0B2A5B;cursor:pointer">${l}</button>`).join('')}</div></div>`;
const coMkScale = (root, k) => root.querySelectorAll('g.mk').forEach(m => m.setAttribute('transform', `translate(${m.dataset.x},${m.dataset.y}) scale(${(+m.dataset.k || 1) * k})`));
function coZoom(zv, V, Z, h = {}) {
  if (!zv) return; if (!zv.isConnected || !zv.clientWidth) { if ((h.tries = (h.tries || 0) + 1) < 60) requestAnimationFrame(() => coZoom(zv, V, Z, h)); return; }   // fenêtre pas encore affichée : on attend sa largeur
  const inner = zv.querySelector('.co-zi'); delete Z.k;
  const W = () => zv.clientWidth, CH = () => W() * V.h / V.w;
  zv.style.height = Math.round(Math.min(CH(), innerHeight * (h.vh || .68))) + 'px';
  const apply = () => { Z.s = Math.min(8, Math.max(1, Z.s)); const w = W(), hc = zv.clientHeight;
    Z.tx = Math.min(0, Math.max(w - w * Z.s, Z.tx)); Z.ty = Math.min(0, Math.max(Math.min(0, hc - CH() * Z.s), Z.ty)); inner.style.transform = `translate(${Z.tx}px,${Z.ty}px) scale(${Z.s})`;
    const k = (1 / Math.sqrt(Z.s)).toFixed(3); if (k !== Z.k) { Z.k = k; coMkScale(inner, k); } };
  const zoomAt = (k, cx, cy) => { const ns = Math.min(8, Math.max(1, Z.s * k)); k = ns / Z.s; Z.tx = cx - (cx - Z.tx) * k; Z.ty = cy - (cy - Z.ty) * k; Z.s = ns; apply(); };
  apply();
  const P = new Map(); let g = null;
  const loc = e => { const R = zv.getBoundingClientRect(); return [e.clientX - R.left, e.clientY - R.top]; };
  const two = () => { const [a, b] = [...P.values()]; return { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; };
  zv.onpointerdown = e => { if (e.target.closest('[data-z]')) return; e.preventDefault(); try { zv.setPointerCapture(e.pointerId); } catch (er) {} P.set(e.pointerId, loc(e));
    if (P.size === 1) { g = { t0: Date.now(), x0: loc(e), last: loc(e), moved: false, multi: false, drag: h.grab ? h.grab(e) : null }; if (h.trace) h.trace.start(e); }
    else if (g) { g.multi = true; if (h.trace) h.trace.cancel(); if (g.drag && g.moved && h.dragCancel) h.dragCancel(g.drag); g.drag = null; Object.assign(g, two()); } };
  zv.onpointermove = e => { if (!P.has(e.pointerId) || !g) return; P.set(e.pointerId, loc(e));
    if (P.size >= 2) { const t = two(); zoomAt(t.d / g.d, t.m[0], t.m[1]); Z.tx += t.m[0] - g.m[0]; Z.ty += t.m[1] - g.m[1]; apply(); g.d = t.d; g.m = t.m; return; }
    if (g.multi) return; const p = loc(e);
    if (!g.moved && Math.hypot(p[0] - g.x0[0], p[1] - g.x0[1]) > 8) g.moved = true;
    if (h.trace) return h.trace.move(e);
    if (g.drag) { if (g.moved) h.dragMove(g.drag, e); return; }
    if (g.moved) { Z.tx += p[0] - g.last[0]; Z.ty += p[1] - g.last[1]; apply(); } g.last = p; };
  const up = e => { if (!P.has(e.pointerId)) return; P.delete(e.pointerId); if (P.size || !g) return;
    if (h.trace) { if (!g.multi) h.trace.end(); }
    else if (g.drag && g.moved && !g.multi) h.dragEnd(g.drag, e);
    else if (!g.moved && !g.multi && Date.now() - g.t0 < 700 && h.onTap) h.onTap(e);
    g = null; };
  zv.onpointerup = up;
  zv.onpointercancel = e => { if (h.trace) h.trace.cancel(); P.delete(e.pointerId); if (!P.size) g = null; };
  zv.onwheel = e => { e.preventDefault(); const p = loc(e); zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, p[0], p[1]); };
  zv.querySelectorAll('[data-z]').forEach(b => b.onclick = () => { if (b.dataset.z === '0') { Z.s = 1; Z.tx = Z.ty = 0; apply(); } else zoomAt(b.dataset.z === '+' ? 1.6 : 1 / 1.6, W() / 2, zv.clientHeight / 2); });
}
// tracé au doigt (surlignage) : objet utilisé par coZoom
function coTrace(svg, V, lines, onEnd) {
  let line = null, el = null;
  return {
    start: e => { line = coSvgPt(svg, V, e); el = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      [['fill', 'none'], ['stroke', '#E0218A'], ['stroke-opacity', '.5'], ['stroke-width', '14'], ['stroke-linecap', 'round'], ['stroke-linejoin', 'round']].forEach(([k, v]) => el.setAttribute(k, v)); svg.appendChild(el); el.setAttribute('points', line.join(',')); },
    move: e => { if (!line) return; const [x, y] = coSvgPt(svg, V, e), n = line.length; if (Math.hypot(x - line[n - 2], y - line[n - 1]) < 4) return; line.push(x, y); el.setAttribute('points', line.join(',')); },
    end: () => { if (line && line.length >= 4) { lines.push(line); onEnd && onEnd(); } else if (el) el.remove(); line = null; },
    cancel: () => { if (el) el.remove(); line = null; el = null; } };
}
function coHlEdit(V0, title, onDone) {
  const lines = JSON.parse(JSON.stringify(V0.hl || [])); let mode = 'trace'; const Z = { s: 1, tx: 0, ty: 0 };
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:300;background:var(--bg,#F3F6FB);overflow:auto;padding:12px';
  const render = () => { o.innerHTML = `<div style="max-width:900px;margin:0 auto"><div class="card"><h3 style="margin-top:0">🖍 ${esc(title)}</h3>
      <div class="seg">${[['trace', '🖍 Surligner'], ['pan', '✋ Déplacer la carte']].map(([k, l]) => `<button data-mo="${k}" class="${mode === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <p class="muted" style="margin:8px 0 0;font-size:.8rem">${mode === 'trace' ? '1 doigt : surligner l\'itinéraire · 2 doigts : zoomer et déplacer la carte (ou boutons ＋ −).' : '1 doigt : faire glisser · 2 doigts : zoomer.'}</p>
      <div class="row" style="margin-top:8px"><button class="btn btn-ghost" id="hu">↶ Annuler le dernier trait</button><button class="btn btn-ghost" id="hc">🗑 Tout effacer</button></div></div>
      <div style="margin-top:10px" id="hw">${coZoomHTML(coMapView({ ...V0, hl: lines }))}</div>
      <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="hs">✔ Valider</button><button class="btn btn-ghost" id="hq">Annuler</button></div></div>`;
    o.querySelectorAll('[data-mo]').forEach(b => b.onclick = () => { mode = b.dataset.mo; render(); });
    o.querySelector('#hu').onclick = () => { if (!lines.length) return toast('Aucun trait à annuler'); lines.pop(); render(); };
    o.querySelector('#hc').onclick = () => { if (confirm('Effacer tout le surlignage ?')) { lines.length = 0; render(); } };
    o.querySelector('#hs').onclick = () => { o.remove(); onDone(lines); };
    o.querySelector('#hq').onclick = () => { if (confirm('Quitter sans enregistrer le surlignage ?')) o.remove(); };
    const svg = o.querySelector('#hw svg'); coZoom(o.querySelector('#hw .co-zv'), V0, Z, mode === 'trace' ? { trace: coTrace(svg, V0, lines) } : {});
  };
  render(); document.body.appendChild(o);
}
// symbole d'un objet en vignette (boutons, légende)
const coObjIcon = (t, w = 34, h = 24, picto) => { const G = CO_OBJ[t].g, u = 'ic' + t + w; if (picto) return `<span style="font-size:${Math.round(h * .9)}px;line-height:1;display:inline-block;width:${w}px;text-align:center;vertical-align:middle">${CO_PICTO[t]}</span>`;
  const o = G === 'pt' ? { id: 'x', t, x: 20, y: 14 } : G === 'ln' ? { id: 'x', t, pts: [3, 14, 37, 14] } : { id: 'x', t, pts: [4, 3, 36, 3, 36, 25, 4, 25] };
  return `<svg viewBox="0 0 40 28" width="${w}" height="${h}" style="vertical-align:middle;flex:0 0 auto;background:#fff;border-radius:3px">${coObjDefs(.6, u)}${coObjSVG(o, .6, u)}</svg>`; };
// légende des objets présents sur la carte
function coLegend(V, picto) {
  const ts = [...new Set(((V && V.objs) || []).map(o => o.t))].filter(t => CO_OBJ[t]); if (!ts.length) return '';
  return `<div class="lg" style="display:flex;flex-wrap:wrap;gap:2mm 6mm;font-size:8.5pt;margin-top:2mm">${ts.map(t => `<span>${coObjIcon(t, 34, 24, picto)} ${esc(CO_OBJ[t].l)}</span>`).join('')}</div>`;
}
/* Impression : une page A4 par parcours — carte + tracé + carton de contrôle vierge */
function coPrint(ps) {
  let picto = coPictoGet(); const hasObj = ps.some(p => ((coMapOf(p) || {}).objs || []).length);
  const page = p => { const V = coMapOf(p), ordered = ['suivi', 'papillon', 'relais'].includes(p.type), n = p.balises.length, cols = n > 12 ? 8 : 6;
    return `<div class="page"><div class="hd"><b>${esc(p.nom)}</b><span>${CO_TYPES[p.type][0]}${V && V.lieu ? ' · ' + esc(V.lieu) : ''} · ${n} balises${p.distance ? ' · ' + (p.distance / 1000).toFixed(2).replace('.', ',') + ' km' : ''}</span></div>
      <div class="mp" style="${V ? `width:${Math.min(194, 185 * V.w / V.h).toFixed(1)}mm` : ''}">${V ? coMapView(V, { print: true, picto }) : '<p>Pas de carte pour ce parcours.</p>'}</div>
      ${coLegend(V, picto)}
      ${coShowDef(p) && p.balises.some(b => coAide(p, b).def) ? `<div style="font-size:9pt;margin-top:2mm"><b>Définitions des postes :</b> ${p.balises.map((b, i) => { const d = coAide(p, b).def; return d ? `<span style="white-space:nowrap">${ordered ? (i + 1) + '·' : ''}<b>${b.num}</b> ${esc(d)}</span>` : ''; }).filter(Boolean).join(' &nbsp;·&nbsp; ')}</div>` : ''}
      <div class="id"><span>Nom : ……………………………………</span><span>Classe : ………</span><span>Départ : ………</span><span>Arrivée : ………</span></div>
      <div class="ct" style="grid-template-columns:repeat(${cols},1fr)">${p.balises.map((b, i) => `<div class="cs"><div class="cn">${ordered ? (i + 1) + ' · ' : ''}${b.num}</div><div class="cb"></div></div>`).join('')}</div></div>`; };
  // Koh-Lanta : une fiche « indice » par super balise, à afficher dans la zone de départ
  const kohPages = p => p.type !== 'koh' ? '' : p.balises.filter(coKohOk).map((b, k) => { const K = b.koh, C = CO_COUL[K.coul];
    return `<div class="page" style="text-align:center"><div class="hd"><b>🏝 Super balise ${k + 1}</b><span>${esc(p.nom)}</span></div>
      ${K.photo ? `<img src="${K.photo}" style="max-width:100%;max-height:95mm;object-fit:contain;margin:2mm auto;display:block">` : ''}
      <div style="display:flex;gap:6mm;justify-content:center;margin-top:6mm"><div style="width:85mm;height:85mm;border-radius:6mm;background:${C[1]};border:1mm solid #000;display:grid;place-items:center;text-align:center;font-weight:900;color:${K.coul === 'blanc' || K.coul === 'jaune' ? '#111' : '#fff'}"><div><div style="font-size:30pt">${C[0]}</div></div></div>
      <div style="width:85mm;height:85mm;border-radius:6mm;border:1mm solid #000;display:grid;place-items:center"><div><div style="font-size:70pt;font-weight:900;line-height:1">${esc(String(K.pas))}</div><div style="font-size:24pt;font-weight:800">pas</div></div></div></div></div>`; }).join('')
    + (p.type === 'koh' && coKohMap(p).length ? `<div class="page"><div class="hd"><b>🧭 Correspondances couleurs → directions</b><span>${esc(p.nom)} · document enseignant</span></div>${coKohTableHTML(p, true)}</div>` : '');
  const build = () => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Parcours</title><style>
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#0E1A33;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:194mm;margin:0 auto;page-break-after:always;break-after:page;padding-top:2mm}.page:last-child{page-break-after:auto;break-after:auto}
.hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:2px solid #B0127A;padding-bottom:2mm;margin-bottom:2mm}.hd b{font-size:15pt}.hd span{font-size:9pt;color:#555}
.mp{margin:0 auto;border:1px solid #999}.mp .co-map{max-width:100%}
.id{display:flex;flex-wrap:wrap;gap:4mm 8mm;font-size:10pt;margin:3mm 0}
.ct{display:grid;gap:2mm}.cs{border:1.5px solid #333}.cn{font-size:9pt;font-weight:700;text-align:center;border-bottom:1px solid #333;padding:1mm}.cb{height:16mm}
@media screen{body{background:#777;padding:10px}.page{background:#fff;padding:6mm;margin-bottom:10px}}
@page{size:A4;margin:8mm}</style></head><body>${ps.map(p => page(p) + kohPages(p)).join('')}<script>function fit(){document.body.style.zoom=Math.min(1,(innerWidth-20)/760)}fit();addEventListener('resize',fit);<\/script></body></html>`;
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:300;background:#333;display:flex;flex-direction:column';
  o.innerHTML = `<div style="display:flex;gap:8px;padding:10px;align-items:center;background:var(--grad,#0B2A5B);color:#fff"><b style="flex:1">🖨 Cartes à imprimer (${ps.length})</b>${hasObj ? `<button class="btn btn-ghost" data-pi style="color:#fff;font-size:.8rem;padding:8px">🖼 Symboles illustrés${picto ? ' ✓' : ''}</button>` : ''}<button class="btn btn-white" data-p>🖨 Imprimer</button><button class="btn btn-ghost" style="color:#fff" data-x>✕ Fermer</button></div><iframe title="Aperçu" style="flex:1;border:0;background:#777"></iframe>`;
  let html = build(); document.body.appendChild(o); o.querySelector('iframe').srcdoc = html; o.querySelector('[data-x]').onclick = () => o.remove();
  if (o.querySelector('[data-pi]')) o.querySelector('[data-pi]').onclick = e => { picto = !picto; coPictoSet(picto); html = build(); o.querySelector('iframe').srcdoc = html; e.currentTarget.textContent = '🖼 Symboles illustrés' + (picto ? ' ✓' : ''); };
  o.querySelector('[data-p]').onclick = () => {   // impression dans la page (iPad / iPhone : l'impression d'un cadre échoue sur Safari)
    const d = new DOMParser().parseFromString(html, 'text/html'); document.getElementById('co-print')?.remove(); document.getElementById('co-print-css')?.remove();
    const st = document.createElement('style'); st.id = 'co-print-css'; st.media = 'print';
    st.textContent = d.querySelector('style').textContent.replace(/@media screen\{[^}]*\{[^}]*\}[^}]*\{[^}]*\}\}/, '') + '\nbody>*:not(#co-print){display:none!important}#co-print{display:block!important}html,body{background:#fff!important;padding:0!important;margin:0!important;height:auto!important;overflow:visible!important}';
    const box = document.createElement('div'); box.id = 'co-print'; box.style.display = 'none'; box.innerHTML = d.body.innerHTML; document.head.appendChild(st); document.body.appendChild(box);
    const clean = () => { box.remove(); st.remove(); window.removeEventListener('afterprint', clean); }; window.addEventListener('afterprint', clean);
    setTimeout(() => { try { window.print(); } catch (e) { toast('Impression impossible'); } }, 200); };
}
TOOL_IMPL.co = function (el) {
  let tab = DB.co.current || partToday('co').length || partRecoverHTML('co') ? 'seance' : 'parcours';
  const P = id => DB.co.parcours.find(p => p.id === id);

  function frame() {
    el.innerHTML = `<div class="co-tabs">${[['parcours', '🗺 Parcours'], ['controle', '🔎 Contrôle'], ['seance', '⏱ Séance'], ['bilan', '📊 Bilan']].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div><div id="co-body"></div>`;
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; frame(); });
    const body = el.querySelector('#co-body');
    ({ parcours: listParcours, seance: seance, controle: controle, bilan: bilan })[tab](body);
  }

  /* ================= 1. PARCOURS ================= */
  function listParcours(box) {
    box.innerHTML = `<div class="section-title"><h2>📍 Lieux et cartes</h2></div><div class="card" style="padding:0">${coLieux().length ? coLieux().map((L, i) => `<div class="list-item"><div style="flex:1"><b>${esc(L.nom)}</b>
        <div class="muted">${L.map ? '🗺 carte' : '⚠️ pas de carte'} · ${L.postes.length} poste${L.postes.length > 1 ? 's' : ''}${L.postes.some(q => q.x == null) ? ` (${L.postes.filter(q => q.x == null).length} à placer)` : ''} · ${DB.co.parcours.filter(p => p.lieu === L.id).length} parcours</div></div><button class="btn btn-ghost" data-cfg="bare" data-le="${i}">✏️</button></div>`).join('')
        : '<div class="empty" style="font-size:.85rem">Importez la carte vierge d\'un lieu (établissement, bois…) et placez-y les postes : les parcours se créeront ensuite en touchant les postes.</div>'}</div>
      <button class="btn btn-ghost btn-block" data-cfg style="margin-top:8px" id="newl">＋ Nouveau lieu (carte vierge + postes)</button>
      <div class="section-title"><h2>🗺 Parcours</h2>${DB.co.parcours.some(p => coMapOf(p) || (p.type === 'koh' && p.balises.some(coKohOk))) ? '<button class="link" id="prall">🖨 Imprimer les cartes</button>' : ''}</div><div class="card" style="padding:0">${DB.co.parcours.length ? DB.co.parcours.map((p, i) => `<div class="list-item"><div style="flex:1"><b>${esc(p.nom)}</b>
        <div class="muted">${CO_TYPES[p.type][0]} · ${p.distance ? (p.distance / 1000).toFixed(2).replace('.', ',') + ' km' : 'distance ?'}${p.deniv ? ' · D+ ' + p.deniv + ' m' : ''} · ${p.balises.length} balises${p.type === 'papillon' ? ` · boucles de ${legK(p)}` : p.type === 'relais' ? ` · ${legK(p)} bal./relayeur` : ''}${coLieu(p.lieu) ? ' · 📍 ' + esc(coLieu(p.lieu).nom) : p.map && p.map.img ? ' · 🗺 carte' : ''}${p.alloue ? ' · ' + p.alloue + ' min' : ''}</div></div>
        ${coMapOf(p) || (p.type === 'koh' && p.balises.some(coKohOk)) ? `<button class="btn btn-ghost" data-pr="${i}" title="Imprimer la carte${p.type === 'koh' ? ' et les indices' : ''}">🖨</button>` : ''}<button class="btn btn-ghost" data-cfg="bare" data-e="${i}">✏️</button><button class="btn btn-ghost" data-cfg="bare" data-c="${i}" title="Dupliquer">⧉</button></div>`).join('') : '<div class="empty">Aucun parcours. Créez le premier !</div>'}</div>
      <button class="btn btn-grad btn-block" data-cfg style="margin-top:12px" id="new">＋ Créer un parcours</button>`;
    box.querySelector('#new').onclick = () => editParcours(box, null);
    box.querySelector('#newl').onclick = () => editLieu(box, null);
    box.querySelectorAll('[data-le]').forEach(b => b.onclick = () => editLieu(box, +b.dataset.le));
    box.querySelectorAll('[data-pr]').forEach(b => b.onclick = () => coPrint([DB.co.parcours[+b.dataset.pr]]));
    { const a = box.querySelector('#prall'); if (a) a.onclick = () => { const L = DB.co.parcours.filter(p => coMapOf(p) || (p.type === 'koh' && p.balises.some(coKohOk))); coPrint(L); }; }
    box.querySelectorAll('[data-e]').forEach(b => b.onclick = () => editParcours(box, +b.dataset.e));
    box.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { const c = JSON.parse(JSON.stringify(DB.co.parcours[+b.dataset.c])); c.id = coId(); c.nom += ' (copie)'; DB.co.parcours.push(c); save(); listParcours(box); });
  }

  /* ---- Lieu : carte vierge + postes ---- */
  function editLieu(box, idx) {
    const L = idx != null ? JSON.parse(JSON.stringify(coLieux()[idx])) : { id: coId(), nom: coLieux().length ? 'Bois' : 'Établissement', postes: [] };
    let mode = 'add', pick = null, sel = null, otype = null, draft = [], osel = null, pv = false; const Z = { s: 1, tx: 0, ty: 0 }; L.objs = L.objs || [];
    const nextNum = () => L.postes.reduce((a, q) => Math.max(a, q.num), 30) + 1;
    const freeCode = () => CO_PATS.find(c => !L.postes.some(q => q.code === c)) || '';
    const V = () => ({ img: L.map.img, w: L.map.w, h: L.map.h, hl: [], paths: [], ms: coMS(L), objs: L.objs, marks: [...(L.dep ? [{ kind: 'D', x: L.dep[0], y: L.dep[1] }] : []), ...(L.arr ? [{ kind: 'A', x: L.arr[0], y: L.arr[1] }] : []),
      ...L.postes.filter(q => q.x != null).map(q => ({ kind: 'c', x: q.x, y: q.y, lab: String(q.num), id: q.id }))] });
    const draw = () => { const un = L.postes.filter(q => q.x == null); if (pick && !un.some(q => q.id === pick)) pick = null;
      const S = L.postes.find(q => q.id === sel);
      box.innerHTML = `<div data-cfg="bare"><div class="card" data-cfg><h3>${idx != null ? 'Modifier le lieu' : 'Nouveau lieu'}</h3>
          <label>Nom du lieu</label><input id="ln" value="${esc(L.nom)}" placeholder="Établissement, bois de…">
          <label class="btn btn-ghost btn-block" style="display:block;text-align:center;cursor:pointer;margin:10px 0 0">📷 ${L.map ? 'Changer la carte vierge' : 'Importer la carte vierge (photo ou capture d\'écran)'}<input id="lf" type="file" accept="image/*" style="display:none"></label></div>
        ${L.map ? `<div class="card" style="margin-top:12px"><h3 style="margin-top:0">📍 Postes sur la carte</h3>
          <div class="seg">${[['add', '➕ Poste'], ['move', '✋ Déplacer'], ['D', '△ Départ'], ['A', '◎ Arrivée'], ['obj', '🧱 Objets']].map(([k, l]) => `<button data-mo="${k}" class="${mode === k ? 'on' : ''}">${l}</button>`).join('')}</div>
          <p class="muted" style="margin:8px 0 4px;font-size:.8rem">🔍 2 doigts pour zoomer, 1 doigt pour faire glisser la carte : seul un <b>toucher bref</b> place un repère ; un repère existant se <b>déplace en le faisant glisser</b>.<br>${{ add: un.length ? 'Choisissez un poste déjà saisi puis touchez la carte pour le placer — ou touchez la carte sans en choisir pour créer un nouveau poste.' : 'Touchez la carte pour créer un poste (numéro et symbole attribués automatiquement, modifiables). Touchez un poste pour le modifier ; <b>maintenez-le et faites-le glisser</b> pour le déplacer (départ et arrivée aussi).', move: 'Touchez un poste, puis l\'endroit où le déplacer.', D: 'Touchez la carte à l\'endroit du départ (triangle).', A: 'Touchez la carte à l\'endroit de l\'arrivée (double cercle). Sans arrivée, elle se fait au départ.',obj: '' }[mode]}</p>
          ${mode === 'obj' ? `<div style="margin-top:4px">${['pt', 'ln', 'zn'].map(G => `<div class="muted" style="font-size:.75rem;font-weight:800;margin-top:6px">${CO_OBJ_G[G]}</div><div class="bal-chips" style="margin-top:4px">${Object.entries(CO_OBJ).filter(([, T]) => T.g === G).map(([k, T]) => `<button data-ot="${k}" class="${otype === k ? 'on' : ''}" style="font-size:.76rem;display:inline-flex;align-items:center;gap:6px;text-align:left">${coObjIcon(k, 30, 21)}${T.l}</button>`).join('')}</div>`).join('')}
            <p class="muted" style="margin:6px 0 0;font-size:.78rem">${otype ? `Objet choisi : <b>${CO_OBJ[otype].l}</b> — ${CO_OBJ[otype].g === 'pt' ? 'touchez la carte pour le poser (glissez-le pour le déplacer).' : 'touchez la carte point par point, puis ✔ Terminer.'} <button class="link" id="onone">Sélectionner / supprimer un objet</button>` : 'Choisissez un objet à dessiner, ou touchez un objet de la carte pour le sélectionner (et le supprimer).'}</p>
            ${draft.length ? `<div class="row" style="margin-top:6px"><button class="btn btn-grad" id="od">✔ Terminer (${draft.length / 2} pts)</button><button class="btn btn-ghost" id="ou">↶ Point</button><button class="btn btn-ghost" id="ox">✕ Abandonner</button></div>` : ''}
            ${osel ? `<div class="row" style="margin-top:6px;align-items:center"><b style="flex:1;font-size:.85rem">Sélection : ${(CO_OBJ[(L.objs.find(o => o.id === osel) || {}).t] || {}).l || ''}</b><button class="btn btn-danger" id="odel" style="flex:0 0 auto">🗑 Supprimer l'objet</button></div>` : ''}
            ${L.objs.length && !draft.length ? `<button class="btn btn-ghost btn-block" style="margin-top:6px;padding:8px" id="olast">↶ Annuler le dernier objet (${L.objs.length} sur la carte)</button>` : ''}</div>` : ''}
          ${mode === 'add' && un.length ? `<div class="bal-chips">${un.map(q => `<button data-pk="${q.id}" class="${pick === q.id ? 'on' : ''}" style="border-style:dashed">${q.num}</button>`).join('')}</div>` : ''}
          <div style="display:flex;align-items:center;gap:10px;margin-top:8px"><span style="font-size:.8rem;font-weight:800;white-space:nowrap">⭕ Taille des repères</span><input id="lt" type="range" min="0.15" max="1.5" step="0.05" value="${coMS(L)}" style="flex:1"><b id="ltv" style="font-size:.8rem;min-width:38px;text-align:right">${Math.round(coMS(L) * 100)} %</b></div>
          ${L.objs.length ? `<label style="display:flex;gap:8px;align-items:center;margin-top:8px;font-size:.82rem;font-weight:700"><input type="checkbox" id="lpv" ${pv ? 'checked' : ''} style="width:auto"> 🖼 Aperçu en symboles illustrés (version adaptée de la carte)</label>` : ''}
          <div style="margin-top:8px" id="lw">${coZoomHTML(coMapView(V(), { picto: pv, sel, osel, draft: draft.length ? `<polyline points="${draft.join(',')}${otype && CO_OBJ[otype].g === 'zn' && draft.length > 4 ? ',' + draft[0] + ',' + draft[1] : ''}" fill="none" stroke="#E07A00" stroke-width="4" stroke-dasharray="10 6"/>${draft.map((v, i) => i % 2 ? '' : `<circle cx="${v}" cy="${draft[i + 1]}" r="7" fill="#E07A00"/>`).join('')}` : '' }))}</div>
          ${S ? `<div style="margin-top:10px;padding:10px;border-radius:12px;border:2px solid var(--gold,#C9A227)"><b>Poste sélectionné</b><div class="row" style="align-items:center;margin-top:6px"><div><label style="margin:0">Numéro</label><input id="sn" type="number" value="${S.num}"></div>
            <button id="sp" style="flex:0 0 auto;padding:0;border:none;background:none;cursor:pointer">${isPat(S.code) ? patSVG(S.code, 48) : '<span style="display:grid;place-items:center;width:48px;height:48px;border:1.5px dashed var(--line);border-radius:6px;font-size:.62rem;font-weight:800">＋ pince</span>'}</button>
            <button class="btn btn-ghost" id="sa" style="flex:0 0 auto">${S.photo ? '📷' : ''}${S.def ? '📝' : ''}${S.photo || S.def ? ' Photo / définition' : '📷 📝 Photo / définition'}</button><button class="btn btn-ghost" id="su" style="flex:0 0 auto">Retirer de la carte</button><button class="btn btn-danger" id="sd" style="flex:0 0 auto">Supprimer</button></div></div>` : ''}
          ${L.dep || L.arr ? `<div class="row" style="margin-top:8px;align-items:center;font-size:.85rem">${L.dep ? `<span style="${sel === 'D' ? 'font-weight:900' : ''}">△ Départ placé</span><button class="btn btn-ghost" style="flex:0 0 auto;padding:6px 10px" id="dx">🗑 Retirer le départ</button>` : ''}${L.arr ? `<span style="${sel === 'A' ? 'font-weight:900' : ''}">◎ Arrivée placée</span><button class="btn btn-ghost" style="flex:0 0 auto;padding:6px 10px" id="ax">🗑 Retirer l'arrivée</button>` : ''}</div>` : ''}</div>` : ''}
        <div class="card" style="margin-top:12px"><h3 style="margin-top:0">Postes (${L.postes.length})</h3>
          <p class="muted" style="margin:0 0 6px;font-size:.8rem">Saisissez-les ici à l'avance (numéro + symbole de la pince) puis placez-les sur la carte, ou créez-les directement en touchant la carte.</p>
          <div class="row" style="align-items:end"><div><label>Nombre</label><input id="gn" type="number" min="1" value="${Math.max(1, 10 - L.postes.length)}"></div><div><label>À partir du n°</label><input id="g0" type="number" value="${nextNum()}"></div><button class="btn btn-ghost" style="flex:0 0 auto" id="gg">＋ Ajouter</button></div>
          ${L.postes.length ? `<button class="btn btn-ghost btn-block" id="ga" style="margin-top:8px">🎲 Symbole différent pour chaque poste sans symbole</button>` : ''}
          <div style="margin-top:8px">${L.postes.slice().sort((a, b) => a.num - b.num).map(q => `<div class="bal-row"><b style="min-width:44px">${q.num}</b>
            <button data-qp="${q.id}" style="flex:0 0 auto;padding:0;border:none;background:none;cursor:pointer">${isPat(q.code) ? patSVG(q.code, 36) : '<span style="display:grid;place-items:center;width:36px;height:36px;border:1.5px dashed var(--line);border-radius:6px;font-size:.6rem;font-weight:800;color:var(--muted)">＋ pince</span>'}</button>
            <span class="muted" style="flex:1;font-size:.8rem">${q.x != null ? '📍 placé' : '⚠️ à placer'}${q.photo ? ' · 📷' : ''}${q.def ? ' · 📝 ' + esc(q.def.slice(0, 40)) + (q.def.length > 40 ? '…' : '') : ''}</span><button class="btn btn-ghost" style="padding:6px 9px" data-qa="${q.id}" title="Photo et définition">${q.photo || q.def ? '📝' : '＋📷'}</button>${L.map ? `<button class="btn btn-ghost" style="padding:6px 9px" data-qs="${q.id}">${q.x != null ? '✏️' : '📍'}</button>` : ''}<button class="btn btn-ghost" style="padding:6px 9px" data-qx="${q.id}">✕</button></div>`).join('')}</div></div>
        <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="lsv">💾 Enregistrer le lieu</button><button class="btn btn-ghost" id="lbk">Annuler</button>${idx != null ? '<button class="btn btn-danger" id="ldel">Supprimer</button>' : ''}</div></div>`;
      const $ = s => box.querySelector(s), rd = () => { L.nom = $('#ln').value.trim() || 'Lieu'; };
      $('#lf').onchange = e => { const f0 = e.target.files[0]; if (!f0) return; rd(); if (L.map && L.postes.some(q => q.x != null) && !confirm('Changer la carte ? Les postes gardent leur position : replacez-les si la nouvelle carte est différente.')) return; coImg(f0, (img, w, h) => { L.map = { img, w, h }; draw(); }, 1800); };
      box.querySelectorAll('[data-mo]').forEach(b => b.onclick = () => { rd(); if (draft.length && !confirm('Abandonner l\'objet en cours ?')) return; mode = b.dataset.mo; draft = []; osel = null; if (mode !== 'move' && mode !== 'add') sel = null; draw(); });
      if ($('#lf')) $('#lf').addEventListener('change', () => { Z.s = 1; Z.tx = Z.ty = 0; });
      if ($('#lt')) { $('#lt').oninput = e => { L.taille = +e.target.value; $('#ltv').textContent = Math.round(L.taille * 100) + ' %'; $('#lw').querySelectorAll('g.mk').forEach(m => m.dataset.k = L.taille); coMkScale($('#lw'), 1 / Math.sqrt(Z.s)); };
        $('#lt').onchange = () => { rd(); draw(); }; }
      box.querySelectorAll('[data-ot]').forEach(b => b.onclick = () => { rd(); if (draft.length && !confirm('Abandonner l\'objet en cours ?')) return; draft = []; osel = null; otype = otype === b.dataset.ot ? null : b.dataset.ot; draw(); });
      if ($('#lpv')) $('#lpv').onchange = e => { rd(); pv = e.target.checked; draw(); };
      if ($('#onone')) $('#onone').onclick = () => { rd(); draft = []; otype = null; draw(); };
      if ($('#od')) $('#od').onclick = () => { rd(); const G = CO_OBJ[otype].g; if (draft.length < (G === 'zn' ? 6 : 4)) return toast(G === 'zn' ? 'Une zone demande au moins 3 points' : 'Une ligne demande au moins 2 points'); L.objs.push({ id: coId(), t: otype, pts: draft }); draft = []; beep(900, .04); draw(); };
      if ($('#ou')) $('#ou').onclick = () => { rd(); draft = draft.slice(0, -2); draw(); };
      if ($('#ox')) $('#ox').onclick = () => { rd(); draft = []; draw(); };
      if ($('#odel')) $('#odel').onclick = () => { rd(); L.objs = L.objs.filter(o => o.id !== osel); osel = null; draw(); };
      if ($('#olast')) $('#olast').onclick = () => { rd(); const o = L.objs[L.objs.length - 1]; if (!confirm(`Retirer le dernier objet (${CO_OBJ[o.t].l}) ?`)) return; L.objs.pop(); osel = null; draw(); };
      box.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { rd(); pick = pick === b.dataset.pk ? null : b.dataset.pk; draw(); });
      box.querySelectorAll('[data-qp]').forEach(b => b.onclick = () => { rd(); const q = L.postes.find(x => x.id === b.dataset.qp);
        patPicker({ title: `Symbole du poste ${q.num}`, options: CO_PATS, current: q.code, used: L.postes.map(x => x.code).filter(isPat), extra: isPat(q.code) ? [{ v: '', l: 'Retirer le symbole' }] : [], onPick: c => { q.code = c; draw(); } }); });
      box.querySelectorAll('[data-qs]').forEach(b => b.onclick = () => { rd(); const q = L.postes.find(x => x.id === b.dataset.qs); if (q.x != null) { sel = q.id; mode = 'add'; } else { pick = q.id; mode = 'add'; } draw(); $('#lw') && $('#lw').scrollIntoView({ block: 'center' }); });
      box.querySelectorAll('[data-qx]').forEach(b => b.onclick = () => { rd(); const q = L.postes.find(x => x.id === b.dataset.qx); if (!confirm(`Supprimer le poste ${q.num} ? (il sera retiré des parcours de ce lieu)`)) return; L.postes = L.postes.filter(x => x !== q); if (sel === q.id) sel = null; draw(); });
      $('#gg').onclick = () => { rd(); const n = Math.min(60, Math.max(1, +$('#gn').value || 1)), n0 = +$('#g0').value || nextNum(); let k = 0;
        for (let v = n0; k < n; v++) if (!L.postes.some(q => q.num === v)) { L.postes.push({ id: coId() + k, num: v, code: freeCode(), x: null, y: null }); k++; } draw(); };
      if ($('#ga')) $('#ga').onclick = () => { rd(); L.postes.forEach(q => { if (!isPat(q.code)) q.code = freeCode(); }); draw(); };
      if ($('#ax')) $('#ax').onclick = () => { rd(); if (!confirm('Retirer l\'arrivée ? (sans arrivée, elle se fait au départ)')) return; delete L.arr; sel = null; draw(); };
      if ($('#dx')) $('#dx').onclick = () => { rd(); if (!confirm('Retirer le départ ? Vous pourrez le replacer avec « △ Départ ».')) return; delete L.dep; sel = null; draw(); };
      if ($('#sn')) $('#sn').onchange = e => { const v = +e.target.value, S2 = L.postes.find(q => q.id === sel); if (!v) return; if (L.postes.some(q => q !== S2 && q.num === v)) { toast('Ce numéro existe déjà'); return draw(); } S2.num = v; rd(); draw(); };
      if ($('#sp')) $('#sp').onclick = () => { rd(); const S2 = L.postes.find(q => q.id === sel); patPicker({ title: `Symbole du poste ${S2.num}`, options: CO_PATS, current: S2.code, used: L.postes.map(x => x.code).filter(isPat), onPick: c => { S2.code = c; draw(); } }); };
      if ($('#sa')) $('#sa').onclick = () => { rd(); const S2 = L.postes.find(q => q.id === sel); coAideEdit(S2, `Poste ${S2.num} : photo et définition`, draw); };
      box.querySelectorAll('[data-qa]').forEach(b => b.onclick = () => { rd(); const q = L.postes.find(x => x.id === b.dataset.qa); coAideEdit(q, `Poste ${q.num} : photo et définition`, draw); });
      if ($('#su')) $('#su').onclick = () => { rd(); const S2 = L.postes.find(q => q.id === sel); S2.x = S2.y = null; sel = null; draw(); };
      if ($('#sd')) $('#sd').onclick = () => { rd(); const S2 = L.postes.find(q => q.id === sel); if (!confirm(`Supprimer le poste ${S2.num} ?`)) return; L.postes = L.postes.filter(q => q !== S2); sel = null; draw(); };
      const svg = $('#lw svg');
      // repère sous le doigt : rayon mesuré à l'écran (au moins 26 px), départ et arrivée compris
      const near = (e, withObj) => { const R = svg.getBoundingClientRect(), u = R.width / 1000, [x, y] = coSvgPt(svg, V(), e), lim = Math.max(26, 30 * coMS(L) / Math.sqrt(Z.s) * u) / u;
        const it = [...L.postes.filter(q => q.x != null).map(q => ({ id: q.id, x: q.x, y: q.y })), ...(L.dep ? [{ id: 'D', x: L.dep[0], y: L.dep[1] }] : []), ...(L.arr ? [{ id: 'A', x: L.arr[0], y: L.arr[1] }] : []), ...(withObj ? L.objs.filter(o => CO_OBJ[o.t] && CO_OBJ[o.t].g === 'pt').map(o => ({ id: 'o:' + o.id, x: o.x, y: o.y })) : [])]
          .map(o => ({ ...o, d: Math.hypot(o.x - x, o.y - y) })).filter(o => o.d < lim).sort((a, b) => a.d - b.d)[0]; return it || null; };
      const setPos = (id, x, y) => { if (id.startsWith('o:')) { const o = L.objs.find(z => 'o:' + z.id === id); if (o) { o.x = x; o.y = y; } } else if (id === 'D') L.dep = [x, y]; else if (id === 'A') L.arr = [x, y]; else { const q = L.postes.find(z => z.id === id); q.x = x; q.y = y; } };
      if (svg) coZoom($('#lw .co-zv'), L.map, Z, {
        grab: e => draft.length ? null : near(e, true),
        dragMove: (it, e) => { const [x, y] = coSvgPt(svg, V(), e), gm = [...svg.querySelectorAll('g.mk')].find(m => m.dataset.id === it.id); it.nx = x; it.ny = y;
          if (gm) { gm.dataset.x = x; gm.dataset.y = y; coMkScale(gm.parentNode, 1 / Math.sqrt(Z.s)); } },
        dragEnd: it => { if (it.nx == null) return; rd(); setPos(it.id, it.nx, it.ny); if (it.id !== 'D' && it.id !== 'A' && !it.id.startsWith('o:')) sel = it.id; beep(900, .03); draw(); },
        dragCancel: () => draw(),
        onTap: e => { rd(); const [x, y] = coSvgPt(svg, V(), e);
        if (mode === 'obj') { const u = svg.getBoundingClientRect().width / 1000, lim = Math.max(22, 20 * coMS(L)) / u;
          if (!otype) { const o = coObjHit(L.objs, x, y, lim); osel = o ? (osel === o.id ? null : o.id) : null; if (!o) toast('Choisissez d\'abord un objet à dessiner'); return draw(); }
          if (CO_OBJ[otype].g === 'pt') { L.objs.push({ id: coId(), t: otype, x, y }); beep(900, .04); return draw(); }
          draft = [...draft, x, y]; beep(1100, .02); return draw(); }
        const nh = near(e), hit = nh && nh.id !== 'D' && nh.id !== 'A' ? L.postes.find(q => q.id === nh.id) : null;
        if (nh && (nh.id === 'D' || nh.id === 'A') && mode !== 'D' && mode !== 'A') { sel = nh.id; toast(`${nh.id === 'D' ? 'Départ' : 'Arrivée'} : faites-le glisser pour le déplacer, ou « 🗑 Retirer » sous la carte`); return draw(); }
        if (mode === 'D') { L.dep = [x, y]; mode = 'add'; return draw(); }
        if (mode === 'A') { L.arr = [x, y]; mode = 'add'; return draw(); }
        if (mode === 'move') { if (hit && !sel) { sel = hit.id; return draw(); } if (!sel) return toast('Touchez d\'abord un poste'); const S2 = L.postes.find(q => q.id === sel); S2.x = x; S2.y = y; sel = null; return draw(); }
        if (hit) { sel = sel === hit.id ? null : hit.id; return draw(); }
        if (pick) { const q = L.postes.find(z => z.id === pick); q.x = x; q.y = y; pick = (L.postes.find(z => z.x == null) || {}).id || null; beep(900, .04); return draw(); }
        L.postes.push({ id: coId(), num: nextNum(), code: freeCode(), x, y }); sel = null; beep(900, .04); draw(); } });
      $('#lbk').onclick = () => { if (confirm('Quitter sans enregistrer ?')) listParcours(box); };
      if ($('#ldel')) $('#ldel').onclick = () => { const n = DB.co.parcours.filter(p => p.lieu === L.id).length; if (!confirm(`Supprimer le lieu « ${L.nom} » ?${n ? ` ${n} parcours garderont leurs balises mais plus la carte.` : ''}`)) return;
        DB.co.parcours.forEach(p => { if (p.lieu === L.id) delete p.lieu; }); coLieux().splice(idx, 1); save(); listParcours(box); };
      $('#lsv').onclick = () => { rd(); const nums = L.postes.map(q => q.num); if (new Set(nums).size !== nums.length) return toast('Deux postes ont le même numéro');
        // parcours de ce lieu : numéros et symboles mis à jour, postes supprimés retirés
        DB.co.parcours.forEach(p => { if (p.lieu !== L.id) return; p.balises = p.balises.filter(b => L.postes.some(q => q.id === b.pid)).map(b => { const q = L.postes.find(z => z.id === b.pid); return { ...b, num: q.num, code: q.code }; }); });
        if (idx != null) coLieux()[idx] = L; else coLieux().push(L); save(); toast('Lieu enregistré ✔'); listParcours(box); };
    };
    draw();
  }
  function editParcours(box, idx) {
    const p = idx != null ? JSON.parse(JSON.stringify(DB.co.parcours[idx])) : {
      id: coId(), nom: 'Parcours 1', type: 'libre', distance: 1200, denivOn: false, deniv: 0, alloue: 20, ecart: 2,
      balises: Array.from({ length: 8 }, (_, i) => ({ num: 31 + i, niv: 1, ob: true })),
      pts: [1, 2, 3], penWrongP: 1, penWrongS: 30, penMissS: 60, penOverP: 1 };
    if (idx == null && coLieux().length) { p.lieu = coLieux()[0].id; p.balises = []; }
    const ZP = { s: 1, tx: 0, ty: 0 };
    const draw = () => { const LU = coLieu(p.lieu);
      box.innerHTML = `<div data-cfg="bare"><div class="card" data-cfg><h3>${idx != null ? 'Modifier' : 'Nouveau'} parcours</h3>
        <label>Nom</label><input id="nm" value="${esc(p.nom)}">
        <label>Type de parcours</label><select id="ty">${Object.entries(CO_TYPES).map(([k, v]) => `<option value="${k}" ${p.type === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select>
        <p class="muted" style="margin:6px 0 0">${CO_TYPES[p.type][1]}</p>
        <label>📍 Lieu de la course</label><select id="lu"><option value="">— Sans lieu (balises saisies à la main) —</option>${coLieux().map(L => `<option value="${L.id}" ${p.lieu === L.id ? 'selected' : ''}>${esc(L.nom)}${L.map ? '' : ' (pas de carte)'}</option>`).join('')}</select>
        ${p.type === 'papillon' ? `<label>Retour au départ toutes les … balises</label><input id="bk2" type="number" min="2" value="${p.boucle || 2}">` : ''}
        ${p.type === 'koh' ? `<div class="row"><div><label>⏱ Temps de mémorisation (s)</label><input id="kmemo" type="number" min="3" value="${p.memo || 10}"></div><div><label>Pénalité par indice revu (pt)</label><input id="kpen" type="number" min="0" value="${p.kohPen || 0}"></div></div><p class="muted" style="margin:4px 0 0;font-size:.78rem">Posez des repères de couleur dans chaque zone (un par direction). Donnez un indice 🏝 à chaque super balise dans la liste des balises ; pensez à leur donner beaucoup de points (niveau 3).</p>
          <div style="margin-top:10px;padding:8px 10px;border-radius:10px;background:var(--grad-soft)"><b style="font-size:.88rem">🧭 Correspondances couleurs → directions</b><p class="muted" style="margin:2px 0 6px;font-size:.76rem">Les élèves ne voient que la couleur ; la correspondance s'affiche sur leur tablette avec le code enseignant (bouton « 🧭 Correspondances »). Elle s'imprime aussi sur une page à part.</p>
          ${Object.entries(CO_COUL).map(([c, [n, col]]) => `<div style="display:flex;align-items:center;gap:8px;margin-top:4px"><span style="width:26px;height:26px;border-radius:7px;background:${col};border:1.5px solid var(--line);flex:0 0 auto"></span><b style="min-width:64px;font-size:.85rem">${n}</b><select data-kdir="${c}" style="padding:6px;flex:1"><option value="">—</option>${Object.entries(CO_DIR).map(([d, [dn]]) => `<option value="${d}" ${(p.kohDir || {})[c] === d ? 'selected' : ''}>${dn}</option>`).join('')}</select></div>`).join('')}</div>` : ''}
        ${p.type === 'relais' ? `<label>Balises par relayeur (avant de passer le relais)</label><input id="rl" type="number" min="1" value="${p.relais || 1}">` : ''}
        <div class="row"><div><label>Distance (m)</label><input id="di" type="number" value="${p.distance}"></div><div><label>Temps attribué (min)</label><input id="al" type="number" value="${p.alloue}"></div><div><label>Écart toléré (± min)</label><input id="ec" type="number" value="${p.ecart}"></div></div>
        <label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="dn" ${p.denivOn ? 'checked' : ''} style="width:auto"> Option dénivelé</label>
        ${p.denivOn ? `<label>Dénivelé positif (m)</label><input id="dv" type="number" value="${p.deniv}">` : ''}
      </div>
      ${LU ? `<div class="card" style="margin-top:12px"><h3>🗺 ${esc(LU.nom)} : postes du parcours</h3>
        ${LU.map ? `<p class="muted" style="margin:0 0 6px;font-size:.8rem">Touchez les postes ${['suivi', 'papillon', 'relais'].includes(p.type) ? '<b>dans l\'ordre du parcours</b>' : 'du parcours'} (gris pointillé = non retenu ; toucher à nouveau le retire). Le tracé se dessine selon le type. 🔍 2 doigts pour zoomer, 1 doigt pour faire glisser.</p>
          <div id="pw">${coZoomHTML(coMapView(coViewLieu(p, LU, { all: true })))}</div>
          <div class="row" style="margin-top:8px"><button class="btn btn-ghost" id="pall">Tous les postes</button><button class="btn btn-ghost" id="pnone">Aucun</button><button class="btn btn-ghost" id="pzoom">🔍 Agrandir</button></div>
          <button class="btn ${p.type === 'suivi' ? 'btn-grad' : 'btn-ghost'} btn-block" style="margin-top:8px" id="phl">🖍 ${p.hl && p.hl.length ? 'Modifier le surlignage de l\'itinéraire' : 'Surligner l\'itinéraire au doigt'}</button>`
          : `<p class="muted" style="margin:0">Ce lieu n'a pas encore de carte. <button class="link" id="plu">Ouvrir le lieu</button></p>`}
        ${LU.postes.length ? `<div class="bal-chips" style="margin-top:8px">${LU.postes.slice().sort((a, b) => a.num - b.num).map(q => `<button data-tq="${q.id}" class="${p.balises.some(b => b.pid === q.id) ? 'on' : ''}">${q.num}</button>`).join('')}</div>` : '<p class="muted">Aucun poste dans ce lieu.</p>'}</div>` : `
      <div class="card" style="margin-top:12px"><h3>🗺 Carte du parcours${p.type === 'suivi' ? ' et itinéraire' : ''}</h3>
        ${p.map && p.map.img ? `<button id="mpv" style="display:block;width:100%;padding:0;border:none;background:none;cursor:pointer">${coMapHTML(p.map, p)}</button>` : `<p class="muted" style="margin:0 0 8px;font-size:.85rem">${p.type === 'suivi' ? 'Importez la carte (photo ou capture) puis surlignez l\'itinéraire que les élèves devront suivre et placez les balises.' : 'Facultatif : importez la carte pour la montrer aux élèves (et placer les balises).'}</p>`}
        <div class="row" style="margin-top:8px"><label class="btn btn-ghost" style="text-align:center;cursor:pointer;margin:0">📷 ${p.map && p.map.img ? 'Changer la carte' : 'Importer la carte'}<input id="mpf" type="file" accept="image/*" style="display:none"></label>${p.map && p.map.img ? `<button class="btn btn-grad" id="mpe">🖍 ${p.type === 'suivi' ? 'Tracer l\'itinéraire' : 'Annoter'}</button><button class="btn btn-ghost" id="mpx" style="flex:0 0 auto">🗑</button>` : ''}</div></div>`}
      <div class="card" style="margin-top:12px"><h3>Balises (${p.balises.length})</h3>${p.type === 'suivi' ? '<p class="muted" style="margin:0 0 6px;font-size:.8rem">🧵 Ordre imposé : les balises se font dans l\'ordre de cette liste (↑ pour remonter une balise).</p>' : ''}
        <p class="muted" style="margin:0 0 6px;font-size:.8rem">Symbole : le motif de points de la pince de chaque balise (répertoire ou dessin), utilisé par l'onglet 🔎 Contrôle.</p>
        ${LU ? '<p class="muted" style="margin:0 0 6px;font-size:.8rem">📍 Numéros et symboles viennent des postes du lieu (modifiables dans le lieu).</p>' : '<button class="btn btn-ghost btn-block" id="autop" style="margin-bottom:6px">🎲 Attribuer un symbole différent à chaque balise</button>'}
        ${p.type === 'photo' || p.type === 'defs' ? `<div style="margin:6px 0;padding:8px 10px;border-radius:10px;background:var(--grad-soft);font-size:.85rem">${p.type === 'photo' ? '📷 <b>Parcours photo</b> : ajoutez la photo de l\'emplacement de chaque balise avec son bouton 📷' : '📝 <b>Parcours définitions</b> : écrivez la définition de chaque balise avec son bouton 📝 (ex. « proche d\'une butte »)'}${LU ? ' — rangée dans le poste du lieu, réutilisable dans d\'autres parcours' : ''}. ${(() => { const n = p.balises.filter(b => { const sB = coBalSrc(p, b); return p.type === 'photo' ? sB.photo : sB.def; }).length; return `<b>${n}/${p.balises.length}</b> balise${p.balises.length > 1 ? 's' : ''} prête${n > 1 ? 's' : ''}.`; })()}</div>` : ''}
        <p class="muted" style="margin:4px 0 8px;font-size:.78rem">🧑‍🎓 Comment l'élève contrôle ses balises (pendant la course ou à l'arrivée ; choisir, dessiner ou comparer) : onglet <b>🔎 Contrôle</b>.</p>
        ${LU ? '' : `<div class="row" style="align-items:end"><div><label>Nombre</label><input id="nb" type="number" min="1" value="${p.balises.length}"></div><div><label>1er numéro</label><input id="n0" type="number" value="${p.balises[0]?.num ?? 31}"></div><button class="btn btn-ghost" style="flex:0 0 auto" id="genb">Générer</button></div>`}
        <div class="row" style="margin-top:8px"><button class="btn btn-ghost" id="allob">Toutes obligatoires</button><button class="btn btn-ghost" id="allfa">Toutes facultatives</button></div>
        <div style="margin-top:8px">${p.balises.map((b, i) => `<div class="bal-row">${p.type === 'suivi' ? `<b style="min-width:22px;text-align:center">${i + 1}.</b>` : ''}<input class="num" type="number" data-num="${i}" value="${b.num}" ${LU ? 'readonly' : ''}>${(p.type === 'suivi' || (LU && ['papillon', 'relais'].includes(p.type))) && i ? `<button class="btn btn-ghost" style="padding:6px 8px;flex:0 0 auto" data-up="${i}">↑</button>` : ''}
          <button data-pat="${i}" ${LU ? 'disabled' : ''} title="Symbole de la pince" style="flex:0 0 auto;padding:0;border:none;background:none;cursor:pointer">${isPat(b.code) ? patSVG(b.code, 40) : '<span style="display:grid;place-items:center;width:40px;height:40px;border:1.5px dashed var(--line);border-radius:6px;font-size:.62rem;font-weight:800;color:var(--muted)">＋ pince</span>'}</button>
          <div class="lvl">${[1, 2, 3].map(l => `<button data-niv="${i}" data-l="${l}" class="${b.niv === l ? 'on' : ''}">Niv ${l}</button>`).join('')}</div>
          <label class="chk-ob"><input type="checkbox" data-ob="${i}" ${b.ob ? 'checked' : ''}>oblig.</label>${(() => { const sB = coBalSrc(p, b); return `${p.type === 'koh' ? `<button class="btn ${coKohOk(b) ? 'btn-grad' : 'btn-ghost'}" style="padding:6px 7px;flex:0 0 auto" data-kh="${i}" title="Indice Boussole Koh-Lanta">🏝${coKohOk(b) ? `<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${CO_COUL[b.koh.coul][1]};margin-left:3px;border:1px solid #fff"></span>${b.koh.pas}` : ''}</button>` : ''}${p.type === 'photo' || p.type === 'defs' ? (() => { const ok = p.type === 'photo' ? sB.photo : sB.def; return `<button class="btn ${ok ? 'btn-grad' : 'btn-ghost'}" style="padding:6px 8px;flex:0 0 auto" data-ba="${i}" title="${p.type === 'photo' ? 'Photo' : 'Définition'}">${p.type === 'photo' ? (ok ? '📷 ✓' : '＋📷') : (ok ? '📝 ✓' : '＋📝')}</button>`; })() : ''}`; })()}<button class="btn btn-ghost" style="padding:6px 9px" data-rm="${i}">✕</button></div>`).join('')}</div>
        ${LU ? '' : '<button class="btn btn-ghost btn-block" style="margin-top:8px" id="addb">＋ Ajouter une balise</button>'}</div>
      <div class="card" style="margin-top:12px"><h3>Points & pénalités</h3>
        <div class="row"><div><label>Points niveau 1</label><input id="p1" type="number" value="${p.pts[0]}"></div><div><label>Niveau 2</label><input id="p2" type="number" value="${p.pts[1]}"></div><div><label>Niveau 3</label><input id="p3" type="number" value="${p.pts[2]}"></div></div>
        <label>Mauvaise balise poinçonnée</label><div class="row"><div><input id="pwp" type="number" value="${p.penWrongP}"><small class="muted">point(s) en moins</small></div><div><input id="pws" type="number" value="${p.penWrongS}"><small class="muted">secondes ajoutées</small></div></div>
        <label>Balise obligatoire manquante</label><input id="pms" type="number" value="${p.penMissS}"><small class="muted">secondes ajoutées par balise</small>
        <label>Dépassement du temps attribué + écart</label><input id="pop" type="number" value="${p.penOverP}"><small class="muted">point(s) en moins par minute de retard</small></div>
      <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="sv">💾 Enregistrer</button><button class="btn btn-ghost" id="bk">Annuler</button>${idx != null ? '<button class="btn btn-danger" id="del">Supprimer</button>' : ''}</div></div>`;
      const $ = s => box.querySelector(s);
      const read = () => { p.nom = $('#nm').value.trim() || 'Parcours'; p.distance = +$('#di').value || 0; p.alloue = +$('#al').value || 0; p.ecart = +$('#ec').value || 0;
        p.denivOn = $('#dn').checked; if ($('#dv')) p.deniv = +$('#dv').value || 0;
        p.pts = [+$('#p1').value || 0, +$('#p2').value || 0, +$('#p3').value || 0]; p.penWrongP = +$('#pwp').value || 0; p.penWrongS = +$('#pws').value || 0; p.penMissS = +$('#pms').value || 0; p.penOverP = +$('#pop').value || 0;
        if ($('#kmemo')) p.memo = Math.max(3, +$('#kmemo').value || 10); if ($('#kpen')) p.kohPen = Math.max(0, +$('#kpen').value || 0);
        if ($('#bk2')) p.boucle = Math.max(2, +$('#bk2').value || 2); if ($('#rl')) p.relais = Math.max(1, +$('#rl').value || 1);
        box.querySelectorAll('[data-num]').forEach(i => p.balises[+i.dataset.num].num = +i.value || 0); };
      box.querySelectorAll('[data-kdir]').forEach(sl => sl.onchange = () => { p.kohDir = { ...(p.kohDir || {}) }; if (sl.value) p.kohDir[sl.dataset.kdir] = sl.value; else delete p.kohDir[sl.dataset.kdir]; });
      box.querySelectorAll('[data-kh]').forEach(bt => bt.onclick = () => { read(); const b = p.balises[+bt.dataset.kh]; coKohEdit(b, () => { if (b.koh) b.niv = Math.max(b.niv, 3); draw(); }); });
      box.querySelectorAll('[data-ba]').forEach(bt => bt.onclick = () => { read(); const b = p.balises[+bt.dataset.ba], sB = coBalSrc(p, b);
        coAideEdit(sB, `Balise ${b.num} : ${p.type === 'photo' ? 'photo de l\'emplacement' : 'définition'}`, () => { if (sB !== b) save(); draw(); }, p.type); });
      box.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { read(); const i = +b.dataset.up; [p.balises[i - 1], p.balises[i]] = [p.balises[i], p.balises[i - 1]]; draw(); });
      if ($('#mpf')) $('#mpf').onchange = e => { const f0 = e.target.files[0]; if (!f0) return; read(); coImg(f0, (img, w, h) => { p.map = { img, w, h, lines: [], marks: {} }; draw(); if (p.type === 'suivi') coMapEdit(p, m => { p.map = m; draw(); }); }); };
      if ($('#mpe')) $('#mpe').onclick = () => { read(); coMapEdit(p, m => { p.map = m; draw(); }); };
      if ($('#mpv')) $('#mpv').onclick = () => coMapShow(p);
      if ($('#mpx')) $('#mpx').onclick = () => { if (!confirm('Retirer la carte de ce parcours ?')) return; read(); delete p.map; draw(); };
      $('#ty').onchange = () => { read(); p.type = $('#ty').value; if (p.type === 'koh' && (p.pts || []).join() === '1,2,3') p.pts = [1, 2, 10]; if (p.type === 'reseau') p.balises.forEach(b => b.ob = false); if (p.type === 'suivi') p.balises.forEach(b => b.ob = true); draw(); };
      $('#dn').onchange = () => { read(); draw(); };
      $('#lu').onchange = e => { read(); const v = e.target.value; if (p.balises.length && !confirm(v ? 'Prendre les balises parmi les postes de ce lieu ? Les balises actuelles seront retirées.' : 'Ne plus utiliser de lieu ? Les balises sont gardées, sans la carte.')) { e.target.value = p.lieu || ''; return; }
        if (v) { p.lieu = v; p.balises = []; delete p.hl; } else { if (p.lieu) { const L0 = coLieu(p.lieu); p.balises.forEach(b => delete b.pid); } delete p.lieu; delete p.hl; } draw(); };
      const tog = id => { const L0 = coLieu(p.lieu), q = L0.postes.find(z => z.id === id); if (!q) return;
        if (p.balises.some(b => b.pid === id)) p.balises = p.balises.filter(b => b.pid !== id); else p.balises.push({ num: q.num, code: q.code, pid: q.id, niv: 1, ob: p.type !== 'reseau' }); beep(900, .03); draw(); };
      box.querySelectorAll('[data-tq]').forEach(b => b.onclick = () => { read(); tog(b.dataset.tq); });
      { const svg = box.querySelector('#pw svg'); if (svg) coZoom(box.querySelector('#pw .co-zv'), LU.map, ZP, { onTap: e => { read(); const L0 = coLieu(p.lieu), [x, y] = coSvgPt(svg, L0.map, e), hit = L0.postes.filter(q => q.x != null).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
        const u = svg.getBoundingClientRect().width / 1000; if (hit && Math.hypot(hit.x - x, hit.y - y) * u < Math.max(28, 32 * coMS(L0) / Math.sqrt(ZP.s) * u)) tog(hit.id); } }); }
      if ($('#pall')) $('#pall').onclick = () => { read(); const L0 = coLieu(p.lieu); L0.postes.slice().sort((a, b) => a.num - b.num).forEach(q => { if (!p.balises.some(b => b.pid === q.id)) p.balises.push({ num: q.num, code: q.code, pid: q.id, niv: 1, ob: p.type !== 'reseau' }); }); draw(); };
      if ($('#pnone')) $('#pnone').onclick = () => { if (!p.balises.length || !confirm('Retirer tous les postes du parcours ?')) return; read(); p.balises = []; draw(); };
      if ($('#pzoom')) $('#pzoom').onclick = () => { read(); coMapShow(p); };
      if ($('#phl')) $('#phl').onclick = () => { read(); coHlEdit(coViewLieu(p, coLieu(p.lieu)), `Itinéraire · ${p.nom}`, lines => { p.hl = lines; draw(); }); };
      if ($('#plu')) $('#plu').onclick = () => { if (confirm('Quitter ce parcours sans l\'enregistrer pour ouvrir le lieu ?')) editLieu(box, coLieux().indexOf(coLieu(p.lieu))); };
      if ($('#genb')) $('#genb').onclick = () => { read(); const n = Math.max(1, +$('#nb').value || 1), n0 = +$('#n0').value || 31;
        p.balises = Array.from({ length: n }, (_, i) => p.balises[i] ? { ...p.balises[i], num: n0 + i } : { num: n0 + i, niv: 1, ob: p.type !== 'reseau' }); draw(); };
      $('#allob').onclick = () => { read(); p.balises.forEach(b => b.ob = true); draw(); };
      $('#allfa').onclick = () => { read(); p.balises.forEach(b => b.ob = false); draw(); };
      if ($('#addb')) $('#addb').onclick = () => { read(); const last = p.balises[p.balises.length - 1]; p.balises.push({ num: last ? last.num + 1 : 31, niv: 1, ob: p.type !== 'reseau' }); draw(); };
      box.querySelectorAll('[data-niv]').forEach(b => b.onclick = () => { read(); p.balises[+b.dataset.niv].niv = +b.dataset.l; draw(); });
      box.querySelectorAll('[data-ob]').forEach(c => c.onchange = () => { p.balises[+c.dataset.ob].ob = c.checked; });
      box.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { read(); p.balises.splice(+b.dataset.rm, 1); draw(); });
      box.querySelectorAll('[data-pat]').forEach(b => b.onclick = () => { read(); const i = +b.dataset.pat;
        patPicker({ title: `Symbole de la balise ${p.balises[i].num}`, options: CO_PATS, current: p.balises[i].code, used: p.balises.map(x => x.code).filter(isPat),
          extra: isPat(p.balises[i].code) ? [{ v: '', l: 'Retirer le symbole' }] : [], onPick: c => { p.balises[i].code = c; draw(); } }); });
      if ($('#autop')) $('#autop').onclick = () => { read(); const free = CO_PATS.filter(c => !p.balises.some(b => b.code === c)); p.balises.forEach(b => { if (!isPat(b.code)) b.code = free.shift() || ''; }); draw(); };
      $('#bk').onclick = () => listParcours(box);
      if ($('#del')) $('#del').onclick = () => { if (confirm('Supprimer ce parcours ?')) { DB.co.parcours.splice(idx, 1); save(); listParcours(box); } };
      $('#sv').onclick = () => { read(); if (p.lieu && !p.balises.length) return toast('Touchez au moins un poste sur la carte'); const nums = p.balises.map(b => b.num); if (new Set(nums).size !== nums.length) return toast('Deux balises ont le même numéro');
        if (idx != null) DB.co.parcours[idx] = p; else DB.co.parcours.push(p); save(); toast('Parcours enregistré ✔'); listParcours(box); };
    };
    draw();
  }

  /* ================= 2. SÉANCE ================= */
  function result(r, p) {
    const found = new Set(r.found);
    const pts = p.balises.filter(b => found.has(b.num)).reduce((a, b) => a + (p.pts[b.niv - 1] || 0), 0);
    const miss = p.balises.filter(b => b.ob && !found.has(b.num)).length;
    const temps = r.dep && r.arr ? (r.legs ? legSec(r) : (r.arr - r.dep) / 1000) : null;
    const limit = (p.alloue + p.ecart) * 60;
    const overMin = temps != null && p.alloue ? Math.max(0, Math.ceil((temps - limit) / 60)) : 0;
    const revus = p.type === 'koh' ? Object.values(r.vues || {}).reduce((a, v) => a + Math.max(0, v - 1), 0) : 0;   // Koh-Lanta : indices revus
    const penS = r.wrong * p.penWrongS + miss * p.penMissS, penP = r.wrong * p.penWrongP + overMin * p.penOverP + revus * (p.kohPen || 0);
    const km = (p.distance || 0) / 1000, kmE = km + (p.denivOn ? (p.deniv || 0) / 100 : 0);
    let statut = '';
    if (temps != null && p.alloue) { const d = temps / 60 - p.alloue; statut = Math.abs(d) <= p.ecart ? '✔ dans l\'écart' : d > 0 ? `hors délai +${Math.ceil(temps / 60 - p.alloue - p.ecart)} min` : 'plus rapide que prévu'; }
    return { pts, miss, temps, penS, penP, total: temps != null ? temps + penS : null, score: pts - penP, overMin, km, kmE, statut,
      rk: temps ? mpk(temps, km) : '–', rkE: temps && p.denivOn ? mpk(temps, kmE) : null, vit: temps && km ? (km / (temps / 3600)).toFixed(1).replace('.', ',') + ' km/h' : '–' };
  }

  // réseau en groupe : chaque élève garde les obligatoires du groupe + les facultatives qui lui sont attribuées (ou au groupe)
  const resultFor = (r, p, m) => { const W = r.who || {}; return Object.keys(W).length ? result({ ...r, found: r.found.filter(n => !W[n] || W[n] === m) }, p) : result(r, p); };
  /* ---- Séance partagée avec les autres tablettes (modèle sans résultats) ---- */
  const pub = (cur, create) => { if (cur.joined || cur.profOnly) return; const p = P(cur.parcours) || cur.psnap; if (!p) return;
    const indiv = cur.runs.every(r => r.members.length === 1 && r.name === r.members[0]);
    partPublish('co', cur.id, { nom: p.nom, classe: cur.classe || '', ng: cur.runs.length, indiv, ep: `${CO_TYPES[p.type][0]} · ${p.balises.length} balises`,
      tpl: { classe: cur.classe || '', parcours: cur.parcours, psnap: coSnap(p), gap: cur.gap || 60, ctl: curCtl(cur), runs: cur.runs.map(r => ({ name: r.name, members: r.members, pc: r.pc || null, libre: r.libre || 0, choix: r.choix || 0 })) } }, create); };
  const join = (box, sp) => { const T = sp.tpl;
    DB.co.current = { id: sp.id, date: Date.now(), parcours: T.parcours, psnap: T.psnap, classe: T.classe, gap: T.gap || 60, joined: true, ctl: T.ctl || coCtl(),
      runs: T.runs.map(r => ({ name: r.name, members: [...r.members], pc: r.pc || null, libre: r.libre || 0, choix: r.choix || 0, sel: [], dep: null, arr: null, found: [], wrong: 0 })) };
    save(); const cur = DB.co.current;
    partPickGroup(box, cur.runs, i => { if (!DB.co.current) return prepare(box); cur.only = i; save(); seance(box); }, !!sp.indiv); };

  function seance(box) {
    const cur = DB.co.current;
    if (!cur) return prepare(box);
    const p = P(cur.parcours) || cur.psnap; if (!p) { DB.co.current = null; save(); return prepare(box); }
    let raf;
    /* Parcours de chaque équipe : celui de la séance, un autre parcours choisi (r.pc), ou « choix libre » de N balises (r.libre, r.sel) */
    const baseOf = r => (r.pc && P(r.pc)) || p;
    const pOf = r => { const b = baseOf(r); if (!r.libre) return b; const sel = r.sel || [];
      return { ...b, id: b.id + '~libre' + r.libre, nom: `${b.nom} · choix libre (${r.libre} balises)`, balises: b.balises.filter(x => sel.includes(x.num)) }; };
    const needSel = r => r.libre && (r.sel || []).length < r.libre;
    const pcPick = (r, i) => `<div class="co-pick"><select data-pcs="${i}" style="padding:8px">${DB.co.parcours.map(x => `<option value="${x.id}" ${baseOf(r).id === x.id ? 'selected' : ''}>${esc(x.nom)} · ${x.balises.length} bal.</option>`).join('')}</select>
      <select data-lib="${i}" style="padding:8px"><option value="0">Toutes les balises du parcours</option>${Array.from({ length: Math.max(0, baseOf(r).balises.length - 1) }, (_, k) => k + 2).map(n => `<option value="${n}" ${r.libre === n ? 'selected' : ''}>🎯 Choix libre : ${n} balises</option>`).join('')}</select></div>`;
    const selPick = (r, i) => { const b = baseOf(r), sel = r.sel || [];
      return `<div style="margin-top:8px"><div style="font-weight:800;font-size:.85rem">🎯 Choisissez ${r.libre} balises · ${sel.length}/${r.libre}</div><div class="bal-chips">${b.balises.map(x => `<button data-sel="${i}" data-n="${x.num}" class="${sel.includes(x.num) ? 'on' : ''}">${x.num}<sup> N${x.niv}</sup></button>`).join('')}</div></div>`; };
    const bindPick = (root, redraw) => {
      root.querySelectorAll('[data-pcs]').forEach(sl => sl.onchange = () => { const r = cur.runs[+sl.dataset.pcs]; r.pc = sl.value === cur.parcours ? null : sl.value; r.sel = []; r.found = []; save(); pub(cur); redraw(); });
      root.querySelectorAll('[data-lib]').forEach(sl => sl.onchange = () => { const r = cur.runs[+sl.dataset.lib]; r.libre = +sl.value; r.sel = []; r.found = []; save(); pub(cur); redraw(); });
      root.querySelectorAll('[data-sel]').forEach(bt => bt.onclick = () => { const r = cur.runs[+bt.dataset.sel], n = +bt.dataset.n; r.sel = r.sel || [];
        if (r.sel.includes(n)) r.sel = r.sel.filter(x => x !== n); else if (r.sel.length < r.libre) r.sel = [...r.sel, n]; else return toast(`Déjà ${r.libre} balises choisies : retirez-en une`);
        beep(900, .04); save(); redraw(); }); };
    // 🔁 Nouveau parcours après l'arrivée : la course terminée est enregistrée, l'équipe repart sur un autre parcours
    const again = (i, redraw) => { const r = cur.runs[i], pp = pOf(r);
      const rec = { ...cur, id: cur.id + '-' + Math.random().toString(36).slice(2, 6), parcours: baseOf(r).id, runs: [JSON.parse(JSON.stringify(r))], parcoursSnap: coLite(pp) };
      ['only', 'joined', 'psnap', 'profOnly'].forEach(k => delete rec[k]); DB.co.seances.push(rec); coResults(rec);
      Object.assign(r, { dep: null, arr: null, found: [], wrong: 0, sel: [], done: (r.done || 0) + 1 }); delete r.tries; delete r.auto; delete r.legs; delete r.nx; delete r.who; delete r.vues; save(); toast(`Course enregistrée ✔ · ${r.name} : choisissez le nouveau parcours`); redraw(); };
    /* ---- Allers-retours (étoile, papillon, relais) ---- */
    const legGo = r => { const pp = pOf(r), nx = legNext(r, pp); if (!nx.length) return false; const t = Date.now(), w = legWho(r, pp); if (!r.dep) r.dep = t;
      r.legs = [...(r.legs || []), { bal: nx, dep: t, ...(w ? { who: w } : {}) }]; delete r.nx; return true; };
    const legBox = (r, i, pp, eleve) => { const L = r.legs || [], cl = curLeg(r), left = legLeft(r, pp), nx = legNext(r, pp), w = legWho(r, pp), K = legK(pp);
      const rows = L.map((l, k) => `<div style="display:flex;gap:8px;font-size:.8rem;padding:4px 0;border-top:1px solid var(--line)"><span style="flex:1">${k + 1}. ${l.who ? esc(l.who) + ' · ' : ''}balise${l.bal.length > 1 ? 's' : ''} ${l.bal.join(', ')}</span><b>${l.ret ? hms((l.ret - l.dep) / 1000) : '…'}</b>${l.ret ? `<span>${l.bal.filter(n => r.found.includes(n)).length}/${l.bal.length} ✔</span>` : ''}</div>`).join('');
      return `<div class="co-legs" style="margin-top:8px">${r.arr ? `<div style="font-weight:800">🏁 Course terminée · ${L.length} aller${L.length > 1 ? 's' : ''}-retour${L.length > 1 ? 's' : ''}</div>`
        : cl ? `<div style="font-weight:800">🏃 ${cl.who ? esc(cl.who) + ' : ' : ''}en route vers ${cl.bal.length > 1 ? 'les balises' : 'la balise'} ${cl.bal.join(', ')}</div>${coAideChips(pp, cl.bal, i)}<button class="btn btn-danger btn-block" style="margin-top:8px;padding:12px" data-lret="${i}">🔙 ${eleve ? 'Je suis revenu au départ' : 'Retour au départ'} · contrôler le carton</button>`
        : left.length ? `<div class="muted" style="font-size:.8rem">${r.dep ? 'Prochain départ' : 'Premier départ'}${w ? ` : <b style="color:var(--text)">${esc(w)}</b>` : ''} · touchez pour choisir ${K > 1 ? `les balises (${K} prévues)` : 'la balise'}</div>
            <div class="bal-chips">${left.map(b => `<button data-lnx="${i}" data-n="${b.num}" class="${b.ob ? 'ob' : ''}" style="${nx.includes(b.num) ? 'background:var(--grad);color:#fff;border-color:transparent' : ''}">${b.num}<sup> N${b.niv}</sup></button>`).join('')}</div>
            <button class="btn btn-grad btn-block" style="margin-top:8px;padding:12px" data-lgo="${i}">▶ ${w ? esc(w) + ' part' : 'Départ'} vers ${nx.length > 1 ? 'les balises' : 'la balise'} ${nx.join(', ')}</button>${r.dep ? `<button class="btn btn-ghost btn-block" style="margin-top:6px;padding:8px" data-lend="${i}">🏁 Terminer la course ici</button>` : ''}`
        : `<button class="btn btn-ghost btn-block" data-lend="${i}">🏁 Terminer la course</button>`}
        ${rows ? `<div style="margin-top:8px">${rows}</div>` : ''}${L.length ? `<div style="text-align:right;margin-top:4px"><button class="link" data-lundo="${i}">↶ ${r.arr ? 'Rouvrir la course' : cl ? 'Annuler ce départ' : 'Annuler le dernier retour'}</button></div>` : ''}</div>`; };
    const bindLegs = (root, redraw, eleve) => {
      root.querySelectorAll('[data-aide][data-r]').forEach(bt => bt.onclick = e => { e.stopPropagation(); const r0 = cur.runs[+bt.dataset.r], l0 = curLeg(r0); coAideShow(pOf(r0), +bt.dataset.aide, l0 ? l0.bal : null); });
      root.querySelectorAll('[data-lnx]').forEach(b => b.onclick = () => { const r = cur.runs[+b.dataset.lnx], pp = pOf(r), n = +b.dataset.n, nx = legNext(r, pp); r.nx = nx.includes(n) ? nx.filter(y => y !== n) : [...nx, n]; save(); redraw(); });
      root.querySelectorAll('[data-lgo]').forEach(b => b.onclick = () => { const r = cur.runs[+b.dataset.lgo]; if (needSel(r)) return toast(`Choisissez ${r.libre} balises`); if (!legGo(r)) return; beep(1300, .3); save(); redraw(); });
      root.querySelectorAll('[data-lret]').forEach(b => b.onclick = () => { const i = +b.dataset.lret, r = cur.runs[i], pp = pOf(r), l = curLeg(r); if (!l) return; l.ret = Date.now(); beep(1000, .3);
        if (!legLeft(r, pp).length) r.arr = l.ret; save(); redraw(); profCtl(i, redraw, { nums: l.bal, eleve }); });
      root.querySelectorAll('[data-lend]').forEach(b => b.onclick = () => { const r = cur.runs[+b.dataset.lend], n = legLeft(r, pOf(r)).length; if (curLeg(r)) return toast('Attendez le retour au départ');
        if (!confirm(`Terminer la course de ${r.name} ?${n ? ` (${n} balise${n > 1 ? 's' : ''} non faite${n > 1 ? 's' : ''})` : ''}`)) return; const L = r.legs || []; r.arr = (L[L.length - 1] || {}).ret || Date.now(); save(); redraw(); });
      root.querySelectorAll('[data-lundo]').forEach(b => b.onclick = () => { const r = cur.runs[+b.dataset.lundo], L = r.legs || [], cl = curLeg(r);
        if (r.arr) { if (!confirm('Rouvrir la course ?')) return; r.arr = null; }
        else if (cl) { if (!confirm('Annuler ce départ ?')) return; L.pop(); if (!L.length) r.dep = null; }
        else { if (!confirm('Annuler le dernier retour ? (le chrono de cet aller reprend)')) return; L[L.length - 1].ret = null; }
        save(); redraw(); }); };
    const tabs = on => { const t = el.querySelector('.co-tabs'); if (t) t.style.display = on ? '' : 'none'; };
    // Vue « une seule équipe » : ce que voient les élèves sur leur tablette (cur.only reste sur l'appareil)
    const drawGroup = () => {
      const i = cur.only, r = cur.runs[i], p = pOf(r), x = result(r, p), run = r.dep && !r.arr, tot = p.balises.length, n = r.found.length;
      const CT = curCtl(cur), LATE = CT.when === 'arrivee', act = LATE ? !!r.arr : run, LG = isLegRun(r, p);   // act : balises contrôlables maintenant ; LG : allers-retours
      const missOb = p.balises.filter(b => b.ob && !r.found.includes(b.num)).length;
      tabs(false);
      box.innerHTML = `<div class="card" style="text-align:center"><div style="font-weight:900;font-size:1.3rem">🧭 ${esc(r.name)}</div>${r.members.length > 1 || r.name !== r.members[0] ? `<div class="muted">${r.members.map(esc).join(', ')}</div>` : ''}
          <div class="gv-clock" data-live="${i}" style="color:${r.arr ? '#1B9E5A' : 'inherit'}">${r.dep ? hms(elapsed(r)) : '0:00'}</div>
          <div class="muted">${esc(p.nom)} · ${CO_TYPES[p.type][0]}${p.alloue ? ` · temps attribué ${p.alloue} min ± ${p.ecart}` : ''}</div>
          <div style="height:10px;border-radius:99px;background:var(--line);overflow:hidden;margin:10px 0 4px"><div style="height:100%;width:${tot ? n / tot * 100 : 0}%;background:#1B9E5A"></div></div>
          <div class="muted" style="font-size:.85rem">${n} / ${tot} balises trouvées · <b style="color:var(--text)">${x.score} pts</b>${missOb ? ` · ${missOb} obligatoire${missOb > 1 ? 's' : ''} à trouver` : ''}${r.wrong ? ` · ${r.wrong} mauvaise${r.wrong > 1 ? 's' : ''} balise${r.wrong > 1 ? 's' : ''}` : ''}</div>
          ${!r.dep ? `${r.choix || DB.co.parcours.length > 1 || r.libre ? `<div style="margin-top:10px;text-align:left">${pcPick(r, i)}${r.libre ? selPick(r, i) : ''}</div>` : ''}${LG ? '' : `<button class="btn btn-grad btn-block" style="margin-top:12px;font-size:1.2rem;padding:16px" id="gv-go" ${needSel(r) ? 'disabled' : ''}>▶ Départ${r.plan ? ' à ' + clock(r.plan).slice(0, 5) : ''}</button>`}` : ''}
          ${coMapOf(p) ? '<button class="btn btn-ghost btn-block" style="margin-top:8px" id="gv-map">🗺 Voir la carte</button>' : ''}
          ${run && !LG ? `<button class="btn ${missOb && !LATE ? 'btn-danger' : 'btn-grad'} btn-block" style="margin-top:12px;font-size:1.15rem;padding:14px" id="gv-fin">🏁 Arrivée${!missOb && !LATE ? ' — toutes les obligatoires sont trouvées !' : ''}</button>` : ''}
          ${r.arr ? `<div style="margin-top:10px;font-weight:800">✅ Course terminée · ${x.score} pts${x.temps != null ? ` · RK ${x.rk}` : ''}${x.penS ? ` · pénalités +${hms(x.penS)}` : ''}${x.statut ? ' · ' + x.statut : ''}</div>` : ''}</div>
        ${p.type === 'koh' && p.balises.some(coKohOk) ? `<div class="card" style="margin-top:10px;border:2px solid #FFD21F"><b>🏝 Boussole Koh-Lanta</b> <span class="muted" style="font-size:.8rem">· ${r.dep && !r.arr ? `touchez pour afficher l'indice (${p.memo || 10} s pour mémoriser)` : 'après le départ'}</span>
          ${coKohMap(p).length ? '<button class="btn btn-ghost btn-block" style="margin-top:8px;padding:9px" id="gv-kdir">🧭 Correspondances couleurs → directions <small class="muted">(code enseignant)</small></button>' : ''}
          ${p.balises.filter(coKohOk).map((b, k) => { const v = (r.vues || {})[b.num] || 0, got = r.found.includes(b.num); return `<button class="btn ${got ? 'btn-ghost' : 'btn-grad'} btn-block" style="margin-top:8px;padding:12px" data-kv="${b.num}" ${r.dep && !r.arr ? '' : 'disabled'}>${got ? '✅' : '👁'} Super balise ${k + 1}${v ? ` · indice vu ${v} fois` : ''}</button>`; }).join('')}</div>` : ''}
        ${coAideList(p).length ? `<div class="card" style="margin-top:10px"><b>${p.type === 'photo' ? '📷 Parcours photo' : p.type === 'defs' ? '📝 Parcours définitions' : '🔎 Aide pour trouver les balises'}</b> <span class="muted" style="font-size:.8rem">· touchez une balise pour voir ${p.type === 'photo' ? 'sa photo' : p.type === 'defs' ? 'sa définition' : 'l\'aide'}</span>${coAideChips(p)}</div>` : ''}
        ${LG ? `<div class="card" style="margin-top:10px"><b>${{ etoile: '⭐ Étoile', papillon: '🦋 Papillon', relais: '🔁 Relais' }[p.type]}</b> <span class="muted" style="font-size:.8rem">· retour au départ ${legK(p) > 1 ? `toutes les ${legK(p)} balises` : 'après chaque balise'}, contrôle du carton à chaque retour</span>${legBox(r, i, p, true)}</div>` : ''}
        <div class="card" style="margin-top:10px;${LG ? 'display:none' : ''}"><div style="display:flex;justify-content:space-between;align-items:center"><b>Balises</b><span class="muted" style="font-size:.8rem">${LATE ? (run ? '📝 Note le symbole de chaque balise sur ton carton · contrôle à l\'arrivée' : r.arr ? (CT.how === 'auto' ? 'Compare avec ton carton (ci-dessous)' : 'Touchez chaque balise de ton carton pour la contrôler') : !r.dep ? 'Appuyez sur ▶ Départ pour commencer' : '')
            : run ? p.balises.some(b => isPat(b.code)) ? 'Touchez une balise trouvée puis le symbole de sa pince' : 'Touchez une balise dès qu\'elle est trouvée' : !r.dep ? 'Appuyez sur ▶ Départ pour commencer' : ''}</span></div>
          ${p.balises.map((b, bi) => { const on = r.found.includes(b.num);
            return `<button class="gv-it ${on ? 'on' : ''}" data-bal="${b.num}" ${act && !LG && !(LATE && CT.how === 'auto' && isPat(b.code)) ? '' : 'disabled'}><span class="bx">${on ? '✓' : ''}</span><span class="t" style="flex:1">${p.type === 'suivi' ? (bi + 1) + '. ' : ''}Balise ${b.num}</span><span class="muted" style="font-size:.8rem;font-weight:700">N${b.niv} · ${p.pts[b.niv - 1] || 0} pt${(p.pts[b.niv - 1] || 0) > 1 ? 's' : ''}${b.ob ? ' · <b style="color:var(--danger)">obligatoire</b>' : ''}</span>${on && isPat(b.code) && (CT.how !== 'auto' || (r.auto || {})[b.num] === 'ok') ? patSVG(b.code, 34) : ''}</button>`; }).join('')}</div>
        ${r.arr ? ctlCard(r, p) : ''}
        ${r.arr ? `<button class="btn btn-grad btn-block" style="margin-top:12px;font-size:1.1rem;padding:16px" id="save">💾 Enregistrer notre course</button><button class="btn btn-ghost btn-block" style="margin-top:8px" data-again="${i}">🔁 Enregistrer et repartir sur un nouveau parcours</button>` : ''}
        <div style="text-align:center;margin:18px 0 6px"><button class="link" id="gv-prof">🔒 Mode enseignant</button></div>`;
      const $ = s => box.querySelector(s);
      if ($('#gv-go')) $('#gv-go').onclick = () => { if (needSel(r)) return toast(`Choisissez ${r.libre} balises`); r.dep = Date.now(); beep(1300, .45); save(); drawGroup(); };
      box.querySelectorAll('[data-ac]').forEach(bt => bt.onclick = () => { const [num0, v] = bt.dataset.ac.split('|'); if (setAuto(r, +num0, v)) { save(); drawGroup(); } });
      bindPick(box, drawGroup); bindLegs(box, drawGroup, true); box.querySelectorAll('[data-again]').forEach(b => b.onclick = () => again(+b.dataset.again, drawGroup));
      if ($('#gv-map')) $('#gv-map').onclick = () => coMapShow(p); coAideBind(box, p);
      if ($('#gv-kdir')) $('#gv-kdir').onclick = () => (window.profAsk ? profAsk(() => coKohTable(p), 'Correspondances : code enseignant') : coKohTable(p));
      box.querySelectorAll('[data-kv]').forEach(bt => bt.onclick = () => { const b = p.balises.find(y => y.num === +bt.dataset.kv); r.vues = { ...(r.vues || {}), [b.num]: ((r.vues || {})[b.num] || 0) + 1 }; save(); coKohShow(p, b, { memo: p.memo || 10 }); drawGroup(); });
      if ($('#gv-fin')) $('#gv-fin').onclick = () => { if (missOb && !LATE && !confirm(`Il reste ${missOb} balise(s) obligatoire(s) à trouver. Valider l'arrivée ?`)) return; r.arr = Date.now(); beep(1000, .3); save(); drawGroup(); };
      const mark = num => { r.found = [...r.found, num]; beep(900, .06); save(); drawGroup(); };
      box.querySelectorAll('[data-bal]').forEach(bt => bt.onclick = () => { const num = +bt.dataset.bal, b = p.balises.find(y => y.num === num);
        if (r.found.includes(num)) { if (confirm(`Décocher la balise ${num} ?`)) { r.found = r.found.filter(y => y !== num); save(); drawGroup(); } return; }
        const ctl = CT.how;
        if (!isPat(b.code) || ctl === 'auto') return mark(num);   // comparaison : vérification avec le carton à l'arrivée
        // validation par le symbole de la pince : un mauvais symbole compte comme une mauvaise balise
        const judge = c => { r.tries = { ...(r.tries || {}), [num]: c || 'X' };
          if (c === 'V') { save(); return drawGroup(); }   // case vide : balise pas trouvée, pas de pénalité
          if (c === b.code) return mark(num);
          r.wrong++; beep(300, .35); save(); toast(c === 'X' ? '✗ Symbole absent : cette pince n\'est pas une balise de ton parcours (mauvaise balise)' : '✗ Ce n\'est pas le symbole de cette balise (mauvaise balise)'); drawGroup(); };
        const vide = LATE ? [{ v: 'V', l: '⬜ Case vide : balise pas trouvée' }] : [];
        if (ctl === 'dessin') return patPicker({ title: `Balise ${num} : dessine le symbole ${LATE ? 'de ton carton' : 'laissé par la pince'}`, options: [], only: 'draw', extra: vide, onPick: judge });
        const opts = [...new Set(p.balises.map(y => y.code).filter(isPat))].sort();
        patPicker({ title: `Balise ${num} : quel symbole a laissé la pince ?`, options: opts, draw: false, extra: [{ v: 'X', l: '❓ Le symbole n\'est pas dans la liste' }, ...vide], onPick: judge }); });
      $('#gv-prof').onclick = () => { if (!confirm('Passer en mode enseignant (toutes les équipes, réglages) ?')) return; cur.only = null; save(); draw(); };
      if ($('#save')) $('#save').onclick = saveSeance;
    };
    // comparaison : VALIDÉ (ok) / FAUX (ko, mauvaise balise) / pas trouvée (na)
    const setAuto = (r, num, v) => { r.auto = r.auto || {}; const was = r.auto[num]; if (was === v) return false;
      if (was === 'ko') r.wrong = Math.max(0, r.wrong - 1);
      r.found = r.found.filter(y => y !== num); if (v === 'ok') r.found = [...r.found, num]; if (v === 'ko') r.wrong++;
      r.auto[num] = v; return true; };
    // symbole du carton (choisi ou dessiné) : annule l'effet du contrôle précédent de cette balise puis applique le nouveau
    const setTry = (r, b, c) => { const T = r.tries || {}, prev = T[b.num];
      if (prev && prev !== 'V' && prev !== b.code) r.wrong = Math.max(0, r.wrong - 1);
      r.found = r.found.filter(y => y !== b.num); r.tries = { ...T, [b.num]: c || 'X' };
      if (c === b.code) r.found = [...r.found, b.num]; else if (c !== 'V') r.wrong++; };
    /* 📋 Contrôle du carton papier par l'enseignant (élèves sans tablette), avec la méthode réglée dans 🔎 Contrôle */
    const profCtl = (i, redraw, opt = {}) => { const r = cur.runs[i], p0 = pOf(r), CT = curCtl(cur), p = opt.nums ? { ...p0, balises: p0.balises.filter(b => opt.nums.includes(b.num)) } : p0, PB = p.balises.filter(b => isPat(b.code));
      let photo = null;
      const snap = JSON.stringify({ found: r.found, wrong: r.wrong, tries: r.tries, auto: r.auto });
      const o = document.createElement('div'); o.className = 'co-pctl';
      o.style.cssText = 'position:fixed;inset:0;z-index:290;background:rgba(7,18,42,.72);overflow:auto;padding:12px';
      const close = () => { o.remove(); if (photo) URL.revokeObjectURL(photo); save(); redraw(); };
      const render = () => { const T = r.tries || {}, A = r.auto || {};
        const left = CT.how === 'auto' ? PB.filter(b => !A[b.num]).length : PB.filter(b => !T[b.num]).length;
        const plain = p.balises.filter(b => !isPat(b.code));
        o.innerHTML = `<div class="card" style="max-width:560px;margin:0 auto"><h3 style="margin-top:0">🔎 ${opt.eleve ? 'Contrôle de ton carton' : 'Carton de ' + esc(r.name)}${opt.nums ? ` · balise${opt.nums.length > 1 ? 's' : ''} ${opt.nums.join(', ')}` : ''}</h3>
          <div class="muted" style="font-size:.85rem">Méthode : ${{ choix: '🔣 choisir le symbole noté sur le carton', dessin: '✏️ dessiner le symbole noté sur le carton', auto: '👀 comparer le carton avec les symboles attendus' }[CT.how]}</div>
          ${photo ? `<img src="${photo}" style="width:100%;max-height:300px;object-fit:contain;border-radius:10px;background:#000;margin-top:8px">` : ''}
          <label class="btn btn-ghost btn-block" style="display:block;text-align:center;cursor:pointer;margin:8px 0 0;padding:8px;font-size:.85rem">📷 ${photo ? 'Changer la photo du carton' : 'Photo du carton (facultatif, pour comparer)'}<input id="pt-ph" type="file" accept="image/*" capture="environment" style="display:none"></label>
          <div style="margin:8px 0;font-weight:800">${r.found.length}/${p0.balises.length} balises · ${result(r, p0).score} pts${r.wrong ? ` · <span style="color:var(--danger)">${r.wrong} mauvaise${r.wrong > 1 ? 's' : ''}</span>` : ''}${PB.length ? ` · ${left ? `encore ${left} à contrôler` : '✅ tout est contrôlé'}` : ''}</div>
          ${plain.length ? `<div class="muted" style="font-size:.8rem">Balises sans symbole : touchez celles trouvées</div><div class="bal-chips">${plain.map(b => `<button data-pb="${b.num}" class="${r.found.includes(b.num) ? 'on' : ''} ${b.ob ? 'ob' : ''}">${b.num}</button>`).join('')}</div>` : ''}
          ${CT.how === 'auto' ? ctlCard(r, p, true).replace('<h3 style="margin-top:0">👀 Auto-correction</h3>', '<h3 style="margin-top:0">👀 Comparaison avec le carton</h3>').replace('ton carton', 'son carton')
            : PB.map(b => { const t = T[b.num], ok = t && t === b.code;
              return `<button class="gv-it" data-pt="${b.num}" style="border-color:${!t ? 'var(--line)' : ok ? '#1B9E5A' : t === 'V' ? '#9AA6B8' : '#D64545'}"><span style="flex:0 0 auto;width:28px;font-size:1.3rem;font-weight:900;color:${ok ? '#1B9E5A' : t === 'V' ? '#9AA6B8' : '#D64545'}">${!t ? '○' : ok ? '✓' : t === 'V' ? '⬜' : '✗'}</span><span class="t" style="flex:1;text-align:left">Balise ${b.num}${b.ob ? ' <b style="color:var(--danger);font-size:.75rem">oblig.</b>' : ''}<br><span class="muted" style="font-size:.75rem;font-weight:600">${!t ? 'à contrôler : touchez' : ok ? 'bon symbole' : t === 'V' ? 'case vide (pas trouvée)' : t === 'X' ? 'symbole absent de la liste : mauvaise balise' : 'mauvais symbole : mauvaise balise'}</span></span>${isPat(t) ? `<span style="flex:0 0 auto">${patSVG(t, 34)}</span>` : ''}</button>`; }).join('') + ctlCard(r, p, true).replace('Mes symboles', 'Symboles du carton').replace(/mon dessin|mon choix/g, 'carton')}
          <button class="btn btn-grad btn-block" style="margin-top:12px" id="pt-ok">✔ Terminé</button>
          <button class="btn btn-ghost btn-block" style="margin-top:8px" id="pt-undo">↶ Annuler les modifications de ce carton</button></div>`;
        o.querySelector('#pt-ph').onchange = e => { const f0 = e.target.files[0]; if (!f0) return; if (photo) URL.revokeObjectURL(photo); photo = URL.createObjectURL(f0); render(); };
        o.querySelectorAll('[data-pb]').forEach(bt => bt.onclick = () => { const n = +bt.dataset.pb; r.found = r.found.includes(n) ? r.found.filter(y => y !== n) : [...r.found, n]; render(); });
        o.querySelectorAll('[data-ac]').forEach(bt => bt.onclick = () => { const [n, v] = bt.dataset.ac.split('|'); if (setAuto(r, +n, v)) render(); });
        o.querySelectorAll('[data-pt]').forEach(bt => bt.onclick = () => { const b = p.balises.find(y => y.num === +bt.dataset.pt);
          const pick = c => { setTry(r, b, c); beep(c === b.code ? 900 : c === 'V' ? 600 : 300, .08); render(); };
          const vide = [{ v: 'V', l: '⬜ Case vide : balise pas trouvée' }];
          if (CT.how === 'dessin') return patPicker({ title: `Balise ${b.num} : dessinez le symbole noté sur le carton`, options: [], only: 'draw', extra: vide, current: T[b.num], onPick: pick });
          patPicker({ title: `Balise ${b.num} : quel symbole est noté sur le carton ?`, options: [...new Set(p0.balises.map(y => y.code).filter(isPat))].sort(), draw: false, current: T[b.num], extra: [{ v: 'X', l: '❓ Le symbole n\'est pas dans la liste' }, ...vide], onPick: pick }); });
        o.querySelector('#pt-ok').onclick = close;
        o.querySelector('#pt-undo').onclick = () => { if (!confirm('Annuler les modifications faites sur ce carton ?')) return; const S = JSON.parse(snap); r.found = S.found || []; r.wrong = S.wrong || 0; if (S.tries) r.tries = S.tries; else delete r.tries; if (S.auto) r.auto = S.auto; else delete r.auto; close(); };
      };
      render(); document.body.appendChild(o); };
    /* Après l'arrivée : auto-correction (symboles attendus affichés, l'élève coche VALIDÉ / FAUX) ou comparaison de ses symboles */
    const ctlCard = (r, p, late) => { const ctl = curCtl(cur).how, LATE = late || curCtl(cur).when === 'arrivee', PB = p.balises.filter(b => isPat(b.code)); if (!PB.length) return '';
      if (ctl === 'auto') { const L = LATE ? PB : PB.filter(b => r.found.includes(b.num) || (r.auto || {})[b.num]); if (!L.length) return '';
        const left = L.filter(b => !(r.auto || {})[b.num]).length;
        return `<div class="card" style="margin-top:10px;border:2px solid var(--gold,#C9A227)"><h3 style="margin-top:0">👀 Auto-correction</h3><p class="muted" style="margin:0 0 8px;font-size:.85rem">Compare chaque symbole avec la case de ton carton, puis coche <b>VALIDÉ</b> ou <b>FAUX</b>.${left ? ` Encore ${left} à vérifier.` : ' ✅ Tout est vérifié.'}</p>
          ${L.map(b => { const v = (r.auto || {})[b.num]; return `<div style="padding:8px 0;border-top:1px solid var(--line)"><div style="display:flex;align-items:center;gap:12px"><b style="flex:1;min-width:0">Balise ${b.num}</b><span style="flex:0 0 auto;display:inline-block">${patSVG(b.code, 56)}</span></div>
            <div style="display:flex;gap:6px;margin-top:6px"><button class="btn ${v === 'ok' ? 'btn-grad' : 'btn-ghost'}" style="flex:1;padding:9px 6px" data-ac="${b.num}|ok">✅ VALIDÉ</button><button class="btn ${v === 'ko' ? 'btn-danger' : 'btn-ghost'}" style="flex:1;padding:9px 6px" data-ac="${b.num}|ko">❌ FAUX</button>${LATE ? `<button class="btn ${v === 'na' ? 'btn-grad' : 'btn-ghost'}" style="flex:1;padding:9px 6px" data-ac="${b.num}|na">⬜ Pas trouvée</button>` : ''}</div></div>`; }).join('')}</div>`; }
      const T = r.tries || {}, L = PB.filter(b => T[b.num]); if (!L.length) return '';
      return `<div class="card" style="margin-top:10px"><h3 style="margin-top:0">🔍 Mes symboles / symboles attendus</h3>
        ${L.map(b => { const ok = T[b.num] === b.code; return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)"><b style="min-width:84px">Balise ${b.num}</b>
          <div style="text-align:center;flex:0 0 auto"><div class="muted" style="font-size:.7rem">${ctl === 'dessin' ? 'mon dessin' : 'mon choix'}</div>${isPat(T[b.num]) ? patSVG(T[b.num], 44) : '<span style="font-size:1.6rem">❓</span>'}</div>
          <div style="text-align:center;flex:0 0 auto"><div class="muted" style="font-size:.7rem">attendu</div>${patSVG(b.code, 44)}</div><b style="margin-left:auto;font-size:1.3rem;color:${ok ? '#1B9E5A' : '#D64545'}">${ok ? '✓' : '✗'}</b></div>`; }).join('')}</div>`; };
    const saveSeance = () => { const tab1 = cur.only != null && cur.runs[cur.only];
      if (!tab1 && cur.runs.some(r => r.dep && !r.arr) && !confirm('Certains élèves ne sont pas arrivés. Enregistrer quand même ?')) return;
      // tablette d'une équipe : seule SA course est enregistrée (pas de lignes vides pour les autres)
      // id unique par tablette (fusion de synchro par id) ; regroupées à l'affichage (même jour + classe + parcours)
      // une fiche par parcours (les équipes peuvent courir des parcours différents)
      const by = new Map(); (tab1 ? [tab1] : cur.runs).forEach(r => { const pp = pOf(r); if (!by.has(pp.id)) by.set(pp.id, { pp, base: baseOf(r).id, runs: [] }); by.get(pp.id).runs.push(r); });
      by.forEach(({ pp, base, runs }) => { if (!runs.some(r => r.dep) && by.size > 1) return;
        const rec = { ...cur, id: cur.id + '-' + Math.random().toString(36).slice(2, 6), parcours: base, runs, parcoursSnap: coLite(pp) }; ['only', 'joined', 'psnap', 'profOnly'].forEach(k => delete rec[k]);
        DB.co.seances.push(rec); coResults(rec); });
      DB.co.current = null; save(); toast('Séance enregistrée ✔'); tabs(true); tab = 'bilan'; frame(); };
    const draw = () => {
      if (cur.only != null && cur.runs[cur.only]) return drawGroup();
      tabs(true);
      const rs = cur.runs.map(r => ({ r, x: result(r, pOf(r)) }));
      box.innerHTML = `<div class="card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><div><b>${esc(p.nom)}</b><div class="muted">${esc(cur.classe || '')} · ${CO_TYPES[p.type][0]} · ${p.balises.length} balises${p.alloue ? ` · ${p.alloue} min ± ${p.ecart}` : ''}</div></div><div class="run-t" id="now">${clock(Date.now())}</div></div>
          <div style="margin-top:6px;font-size:.8rem;font-weight:700">${CO_ORG(p)}${coMapOf(p) ? ' <button class="link" id="smap">🗺 Carte</button>' : ''}${coAideList(p).length ? ' <button class="link" id="said">🔎 Photos / définitions</button>' : ''}${p.type === 'koh' && p.balises.some(coKohOk) ? `<div class="bal-chips" style="margin-top:6px">${p.balises.filter(coKohOk).map((b, k) => `<button data-kt="${b.num}">🏝 Indice ${k + 1} · balise ${b.num}</button>`).join('')}${coKohMap(p).length ? '<button id="skdir">🧭 Correspondances</button>' : ''}</div>` : ''}</div>
          <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="all">🚩 Départ groupé</button><button class="btn btn-ghost btn-block" data-cfg="bare" style="margin-top:8px" id="edg">✏️ Modifier les groupes / participants (absent, blessé…)</button><div data-cfg="bare" style="display:flex;gap:6px;align-items:center;flex:1.3"><input id="gap" type="number" value="${cur.gap || 60}" style="width:70px;padding:8px"><button class="btn btn-ghost" id="stag" style="padding:9px 8px;font-size:.8rem">Départs échelonnés (s)</button></div></div>
          <p class="muted" style="margin:8px 0 0;font-size:.8rem">Balises : touchez un numéro trouvé (souligné rouge = obligatoire).</p>
          ${cur.profOnly ? '<p class="muted" style="margin:8px 0 0;font-size:.8rem">📋 Suivi enseignant uniquement : les élèves courent sans tablette ; arrêtez le temps à leur retour puis touchez « 🔎 Contrôler le carton » pour vérifier leur coupon papier.</p>' : ''}
          ${cur.runs.length > 1 && !cur.profOnly ? `<div data-cfg="bare"><label>📱 Tablette d'une équipe (les élèves ne verront que leur équipe)</label><select id="only"><option value="">Toutes</option>${cur.runs.map((r, i) => `<option value="${i}">${esc(r.name)}</option>`).join('')}</select></div>` : ''}</div>
        ${rs.map(({ r, x }, i) => `<div class="run ${r.arr ? 'fin' : r.dep ? 'go' : ''}"><div class="run-h"><b>${esc(r.name)}</b><span class="run-t" data-live="${i}">${r.dep ? hms(elapsed(r)) : '0:00'}</span></div>
            ${r.members.length > 1 || r.name !== r.members[0] ? `<div class="muted" style="font-size:.8rem">${r.members.map(esc).join(', ')}</div>` : ''}
            ${isLegRun(r, pOf(r)) ? (!r.dep && (r.choix || r.libre || (DB.co.parcours.length > 1 && cur.runs.length <= 12)) ? pcPick(r, i) + (r.libre ? selPick(r, i) : '') : '') + legBox(r, i, pOf(r), false) : `<div class="co-times"><div><label style="margin:0 0 3px">Départ</label>${r.dep ? `<input type="time" step="1" data-cfg="bare" data-dep="${i}" value="${new Date(r.dep).toTimeString().slice(0, 8)}">` : `<button class="btn btn-grad btn-block" data-go="${i}">▶ Départ${r.plan ? ' ' + clock(r.plan).slice(0, 5) : ''}</button>`}</div>
              <div><label style="margin:0 0 3px">Arrivée</label>${r.arr ? `<input type="time" step="1" data-cfg="bare" data-arr="${i}" value="${new Date(r.arr).toTimeString().slice(0, 8)}">` : `<button class="btn ${r.dep ? 'btn-danger' : 'btn-ghost'} btn-block" data-fin="${i}" ${r.dep ? '' : 'disabled'}>🏁 Arrivée</button>`}</div></div>
            ${!r.dep && (r.choix || r.libre || (DB.co.parcours.length > 1 && cur.runs.length <= 12)) ? pcPick(r, i) + (r.libre ? selPick(r, i) : '') : `${baseOf(r) !== p || r.libre ? `<div class="muted" style="font-size:.78rem;margin-top:4px">🗺 ${esc(pOf(r).nom)}</div>` : ''}<div class="bal-chips">${pOf(r).balises.map(b => `<button data-b="${i}" data-n="${b.num}" class="${r.found.includes(b.num) ? 'on' : ''} ${b.ob ? 'ob' : ''}">${b.num}<sup> N${b.niv}</sup></button>`).join('')}</div>`}`}
            ${(() => { const pp = pOf(r), fac = pp.type === 'reseau' && r.members.length > 1 ? pp.balises.filter(b => !b.ob && r.found.includes(b.num)) : [];
              return fac.length ? `<div style="margin-top:8px;font-size:.82rem"><b>🕸 Facultatives : qui l'a trouvée ?</b>${fac.map(b => `<div style="display:flex;align-items:center;gap:6px;margin-top:4px"><span style="min-width:72px">Balise ${b.num}</span><select data-who="${i}" data-n="${b.num}" style="padding:6px">${['', ...r.members].map(m => `<option value="${esc(m)}" ${((r.who || {})[b.num] || '') === m ? 'selected' : ''}>${m ? esc(m) : 'Tout le groupe'}</option>`).join('')}</select></div>`).join('')}</div>` : ''; })()}
            ${r.dep ? (() => { const PB = pOf(r).balises.filter(b => isPat(b.code)), CT = curCtl(cur), k = CT.how === 'auto' ? PB.filter(b => (r.auto || {})[b.num]).length : PB.filter(b => (r.tries || {})[b.num]).length;
              return `<button class="btn ${r.arr && PB.length && k < PB.length ? 'btn-grad' : 'btn-ghost'} btn-block" style="margin-top:8px;padding:10px;display:block" data-pctl="${i}">🔎 Contrôler le carton${PB.length ? ` · ${k}/${PB.length}${k === PB.length ? ' ✔' : ''}` : ''}<span style="display:block;font-size:.72rem;font-weight:600;opacity:.85">${{ choix: '🔣 choisir le symbole', dessin: '✏️ dessiner le symbole', auto: '👀 comparer avec le carton' }[CT.how]}</span></button>`; })() : ''}
            ${r.arr ? `<button class="btn btn-ghost btn-block" style="margin-top:8px;padding:9px" data-again="${i}">🔁 Enregistrer et repartir sur un nouveau parcours</button>` : ''}${r.done ? `<div class="muted" style="font-size:.75rem;margin-top:4px">${r.done} parcours déjà terminé${r.done > 1 ? 's' : ''} dans cette séance</div>` : ''}
            <div style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:.85rem"><span>Mauvaises balises :</span><button class="btn btn-ghost" style="padding:5px 12px" data-wm="${i}">−</button><b>${r.wrong}</b><button class="btn btn-ghost" style="padding:5px 12px" data-wp="${i}">+</button></div>
            ${pOf(r).type === 'koh' && Object.keys(r.vues || {}).length ? `<div class="muted" style="margin-top:6px;font-size:.78rem">🏝 Indices vus : ${Object.entries(r.vues).map(([n, v]) => `balise ${n} × ${v}`).join(' · ')}</div>` : ''}
            <div class="muted" style="margin-top:6px;font-size:.8rem">${r.found.length}/${pOf(r).balises.length} balises · <b style="color:var(--text)">${x.score} pts</b>${x.penP ? ` (−${x.penP})` : ''}${x.miss ? ` · ${x.miss} oblig. manquante(s)` : ''}${x.temps != null ? ` · RK ${x.rk}${x.penS ? ` · pénalités +${hms(x.penS)}` : ''}${x.statut ? ' · ' + x.statut : ''}` : ''}</div></div>`).join('')}
        <div class="section-title"><h2>Classement</h2></div>${ranking(rs, p)}
        <div class="row" style="margin-top:12px"><button class="btn btn-grad" data-cfg="bare" id="save">💾 Terminer et enregistrer la séance</button><button class="btn btn-ghost" data-cfg="bare" id="cancel">Abandonner</button></div>`;
      const $ = s => box.querySelector(s), keep = () => save();
      $('#all').onclick = () => { const t = Date.now(), w = cur.runs.filter(r => !r.dep && needSel(r)); cur.runs.forEach(r => { if (!r.dep && !needSel(r)) { if (isLegRun(r, pOf(r))) legGo(r); else r.dep = t; } }); if (w.length) toast(`${w.length} équipe(s) doivent d'abord choisir leurs balises`); beep(1300, .4); keep(); draw(); };
      $('#edg').onclick = () => { const indiv = cur.runs.every(r => r.members.length === 1 && r.name === r.members[0]);
        editGroupsPanel(indiv ? 'Participants' : 'Groupes de la séance', { cls: cur.classe, indiv, list: () => cur.runs, names: r => r.members,
          take: (r, n) => { r.members.splice(r.members.indexOf(n), 1); return indiv ? { dep: r.dep, arr: r.arr, found: r.found, wrong: r.wrong, plan: r.plan } : null; },
          put: (r, n, d) => { r.members.push(n); if (indiv && d) Object.assign(r, d); },
          make: name => ({ name, members: [], dep: null, arr: null, found: [], wrong: 0 }), onChange: () => { keep(); pub(cur); }, onClose: draw }); };
      $('#stag').onclick = () => { cur.gap = Math.max(5, +$('#gap').value || 60); const t0 = Date.now() + 60000; cur.runs.forEach((r, i) => r.plan = t0 + i * cur.gap * 1000); keep(); toast('Horaires de départ prévus (1er départ dans 1 min)'); draw(); };
      box.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { const r = cur.runs[+b.dataset.go]; if (needSel(r)) return toast(`${r.name} : choisissez ${r.libre} balises`); r.dep = Date.now(); beep(1300, .3); keep(); draw(); });
      bindPick(box, draw); box.querySelectorAll('[data-again]').forEach(b => b.onclick = () => again(+b.dataset.again, draw));
      box.querySelectorAll('[data-pctl]').forEach(b => b.onclick = () => profCtl(+b.dataset.pctl, draw));
      bindLegs(box, draw, false); if ($('#smap')) $('#smap').onclick = () => coMapShow(p); if ($('#said')) $('#said').onclick = () => coAideShow(p, coAideList(p)[0].num);
      if ($('#skdir')) $('#skdir').onclick = () => coKohTable(p);
      box.querySelectorAll('[data-kt]').forEach(bt => bt.onclick = () => coKohShow(p, p.balises.find(y => y.num === +bt.dataset.kt)));
      box.querySelectorAll('[data-who]').forEach(sl => sl.onchange = () => { const r = cur.runs[+sl.dataset.who]; r.who = { ...(r.who || {}) }; if (sl.value) r.who[sl.dataset.n] = sl.value; else delete r.who[sl.dataset.n]; keep(); });
      box.querySelectorAll('[data-fin]').forEach(b => b.onclick = () => { cur.runs[+b.dataset.fin].arr = Date.now(); beep(1000, .3); keep(); draw(); });
      const setT = (i, k, v) => { const [h, m, s] = v.split(':').map(Number); const d = new Date(cur.runs[i][k]); d.setHours(h || 0, m || 0, s || 0, 0); cur.runs[i][k] = d.getTime(); keep(); draw(); };
      box.querySelectorAll('[data-dep]').forEach(inp => inp.onchange = () => setT(+inp.dataset.dep, 'dep', inp.value));
      box.querySelectorAll('[data-arr]').forEach(inp => inp.onchange = () => setT(+inp.dataset.arr, 'arr', inp.value));
      box.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { const r = cur.runs[+b.dataset.b], n = +b.dataset.n; r.found = r.found.includes(n) ? r.found.filter(x => x !== n) : [...r.found, n]; keep(); draw(); });
      box.querySelectorAll('[data-wp]').forEach(b => b.onclick = () => { cur.runs[+b.dataset.wp].wrong++; keep(); draw(); });
      box.querySelectorAll('[data-wm]').forEach(b => b.onclick = () => { const r = cur.runs[+b.dataset.wm]; r.wrong = Math.max(0, r.wrong - 1); keep(); draw(); });
      if ($('#only')) $('#only').onchange = ev => { if (ev.target.value === '') return; cur.only = +ev.target.value; keep(); draw(); };
      $('#save').onclick = saveSeance;
      $('#cancel').onclick = () => { if (confirm('Abandonner cette séance ? Les temps saisis seront perdus.')) { partAskRemove(cur); DB.co.current = null; save(); draw2(); } };
    };
    const draw2 = () => { cancelAnimationFrame(raf); prepare(box); };
    const tick = () => { if (!box.isConnected || !DB.co.current) return; const n = box.querySelector('#now'); if (n) n.textContent = clock(Date.now());
      cur.runs.forEach((r, i) => { const e = box.querySelector(`[data-live="${i}"]`); if (e && r.dep && !r.arr) e.textContent = hms(elapsed(r)); });
      raf = requestAnimationFrame(tick); };
    draw(); tick();
  }

  function ranking(rs, p) {
    const done = rs.filter(({ x }) => x.temps != null).sort((a, b) => b.x.score - a.x.score || a.x.total - b.x.total);
    if (!done.length) return '<div class="card empty">Le classement apparaît dès les premières arrivées.</div>';
    return `<div class="card sheet-table"><table><tr><th>#</th><th>Nom</th><th>Pts</th><th>Temps</th><th>+ Pén.</th><th>Total</th><th>RK</th>${p.denivOn ? '<th>RK effort</th>' : ''}<th>Vitesse</th></tr>
      ${done.map(({ r, x }, i) => `<tr><td>${i + 1}</td><td><b>${esc(r.name)}</b></td><td><b>${x.score}</b></td><td>${hms(x.temps)}</td><td>${x.penS ? '+' + hms(x.penS) : '–'}</td><td><b>${hms(x.total)}</b></td><td>${x.rk}</td>${p.denivOn ? `<td>${x.rkE}</td>` : ''}<td>${x.vit}</td></tr>`).join('')}</table>
      <p class="muted" style="font-size:.75rem;margin:6px 0 0">Classement : points (balises − pénalités), puis temps total (temps réalisé + pénalités). RK = rythme au kilomètre${p.denivOn ? ' ; RK effort = avec 100 m de D+ comptés comme 1 km' : ''}.</p></div>`;
  }

  /* Synthèse « Résultats des élèves » : une ligne par élève (de la classe) de chaque course enregistrée */
  function coResults(s) {
    const p = s.parcoursSnap, cls = s.classe || '', st = cls ? studentsOf(cls) : [];
    if (!st.length || typeof saveResult !== 'function') return;
    s.runs.filter(r => r.dep).forEach(r => { const grp = r.members.length > 1 || r.name !== r.members[0];
      r.members.filter(m => st.includes(m)).forEach(m => { const x = resultFor(r, p, m), fd = r.found.filter(n => !(r.who || {})[n] || r.who[n] === m);
      const valeur = `${x.score} pts${x.total != null ? ' · ' + hms(x.total) : ''}`;
      const detail = [p.nom + (grp ? ` (${r.name})` : ''), `${fd.length}/${p.balises.length} balises`, x.penS || x.penP ? `pén. ${[x.penS ? '+' + hms(x.penS) : '', x.penP ? '−' + x.penP + ' pt' : ''].filter(Boolean).join(' ')}` : '', r.arr ? x.statut : 'non arrivé'].filter(Boolean).join(' · ');
      saveResult({ tool: 'co', label: 'Course d\'orientation', classe: cls, eleve: m, valeur, detail }); }); });
  }

  /* Fusion d'affichage : séances enregistrées sur plusieurs tablettes (même jour + classe + parcours) = une seule séance.
     Les enregistrements restent séparés dans DB.co.seances (sync par id sans risque). */
  const dayKey = t => { const d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  function coGroups(ss) {
    const G = new Map();
    ss.forEach(s => { const k = dayKey(s.date) + '|' + (s.classe || '') + '|' + (s.parcours || s.parcoursSnap.nom);
      if (!G.has(k)) G.set(k, { recs: [], date: s.date }); const g = G.get(k); g.recs.push(s); g.date = Math.max(g.date, s.date); });
    return [...G.values()].map(g => { const by = new Map(), rank = r => r.arr ? 2 : r.dep ? 1 : 0;
      // une même équipe enregistrée par 2 tablettes (ex. tablette d'équipe + tablette enseignant) : on garde la plus complète
      g.recs.forEach(s => s.runs.forEach(r => { const k = r.name + '|' + r.members.join(','), o = by.get(k); if (!o || rank(r) > rank(o.r)) by.set(k, { r, p: s.parcoursSnap }); }));
      g.p = g.recs.reduce((a, s) => s.date >= a.date ? s : a).parcoursSnap; g.runs = [...by.values()]; return g; }).sort((a, b) => b.date - a.date);
  }

  function prepare(box) {
    if (!DB.co.parcours.length) { box.innerHTML = '<div class="card empty">Créez d\'abord un parcours dans l\'onglet 🗺 Parcours.</div>'; partMount(box, 'co', sp => join(box, sp)); return; }
    let mode = 'indiv', choice = false, profOnly = false, pcSel = DB.co.parcours[0].id;
    const draw = () => { const pp = P(pcSel) || DB.co.parcours[0]; pcSel = pp.id; if (pp.type === 'relais') mode = 'grp';
      box.innerHTML = `<div class="card" data-cfg style="margin-bottom:12px;padding:10px 14px"><b>🧑‍🎓 Contrôle par l'élève :</b> ${CTL_TXT(coCtl())} <button class="link" id="goctl">modifier</button></div><div class="card" data-cfg><h3>Nouvelle séance</h3>
        <label>Parcours</label><select id="pc">${DB.co.parcours.map(p => `<option value="${p.id}" ${p.id === pcSel ? 'selected' : ''}>${esc(p.nom)} — ${CO_TYPES[p.type][0]} · ${p.balises.length} balises</option>`).join('')}</select>
        <div style="margin-top:8px;padding:8px 10px;border-radius:10px;background:var(--grad-soft);font-size:.85rem;font-weight:700">${CO_ORG(pp)}${coMapOf(pp) ? ' <button class="link" id="pmap">🗺 voir la carte</button>' : ''}</div>
        <label>Organisation</label>${pp.type === 'relais' ? '<p class="muted" style="margin:0 0 6px;font-size:.8rem">Relais : formez des équipes (les élèves de chaque équipe partiront à tour de rôle).</p>' : ''}<div class="seg">${pp.type === 'relais' ? '' : `<button data-md="indiv" class="${mode === 'indiv' ? 'on' : ''}">Parcours individuels</button>`}<button data-md="grp" class="${mode === 'grp' ? 'on' : ''}">${pp.type === 'relais' ? 'Équipes de relais' : 'Groupes'}<br><small style="font-weight:600;opacity:.85">homogènes / hétérogènes</small></button></div>
        <label style="display:flex;gap:8px;align-items:flex-start;margin-top:12px"><input type="checkbox" id="pchoice" ${choice ? 'checked' : ''} style="width:auto;margin-top:3px"> <span>Chaque ${mode === 'indiv' ? 'élève' : 'groupe'} choisit son parcours (ou ses balises en choix libre) au départ</span></label>
        <label style="display:flex;gap:8px;align-items:flex-start;margin-top:8px"><input type="checkbox" id="profo" ${profOnly ? 'checked' : ''} style="width:auto;margin-top:3px"> <span>📋 Suivi enseignant uniquement (pas de tablette pour les élèves : temps à l'arrivée, balises du coupon papier)</span></label>
        <div id="who" style="margin-top:10px"></div></div>`;
      box.querySelector('#pchoice').onchange = e => { choice = e.target.checked; };
      box.querySelector('#profo').onchange = e => { profOnly = e.target.checked; };
      box.querySelector('#pc').onchange = e => { pcSel = e.target.value; draw(); };
      { const m = box.querySelector('#pmap'); if (m) m.onclick = () => coMapShow(pp); }
      box.querySelectorAll('[data-md]').forEach(b => b.onclick = () => { mode = b.dataset.md; draw(); });
      const who = box.querySelector('#who');
      { const g = box.querySelector('#goctl'); if (g) g.onclick = () => { tab = 'controle'; frame(); }; }
      const launch = (runs, classe) => { if (choice) runs.forEach(r => { r.choix = 1; });
        DB.co.current = { id: coId(), date: Date.now(), parcours: box.querySelector('#pc').value, classe, runs, gap: 60, ctl: coCtl(), ...(profOnly ? { profOnly: true } : {}) }; pub(DB.co.current, true); save(); seance(box); };
      if (mode === 'indiv') {
        who.innerHTML = DB.classes.length ? `<label>Classe</label><select id="cl">${DB.classes.map(c => `<option>${esc(c.name)}</option>`).join('')}</select>
          <button class="btn btn-grad btn-block" style="margin-top:12px" id="go">▶ Préparer la séance</button>` : noClassMsg;
        const go = who.querySelector('#go');
        if (go) go.onclick = () => { const c = who.querySelector('#cl').value; launch(studentsOf(c).map(n => ({ name: n, members: [n], dep: null, arr: null, found: [], wrong: 0 })), c); };
      } else {
        mountComposer(who, { id: 'coc', modes: ['random', 'hetero', 'homo'], button: '▶ Former les groupes et préparer la séance',
          onTeams: teams => { const c = who.querySelector('#coc-cls')?.value || ''; launch(teams.map(t => ({ name: t.name.replace('Équipe', 'Groupe'), members: t.members.map(m => m.n), dep: null, arr: null, found: [], wrong: 0 })), c); } });
      }
      partMount(box, 'co', sp => join(box, sp));
    };
    draw();
  }

  /* ================= CONTRÔLE DES CARTONS ================= */
  const CK = { pc: null, ans: {}, photo: null, run: '' };
  function ctlSettings(box) {
    box.innerHTML = ''; const C = coCtl(), h = document.createElement('div');
    h.innerHTML = `<div class="card" data-cfg style="margin-bottom:12px;border:2px solid var(--gold,#C9A227)"><h3 style="margin-top:0">🔎 Méthode de contrôle des cartons</h3><p class="muted" style="margin:0 0 4px;font-size:.8rem">Réglée avant la séance ; elle s'applique à l'élève (tablette de l'équipe) comme à l'enseignant (bouton « 🔎 Contrôler le carton » de chaque élève dans ⏱ Séance).</p>
      <label>Quand ?</label><div class="seg">${[['arrivee', '📝 À l\'arrivée (carton papier)'], ['live', '📱 Pendant la course']].map(([k, l]) => `<button data-cw="${k}" class="${C.when === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <label>Comment ?</label><div class="seg">${[['choix', '🔣 Choisir le symbole'], ['dessin', '✏️ Dessiner le symbole'], ['auto', '👀 Comparer avec le carton']].map(([k, l]) => `<button data-chw="${k}" class="${C.how === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div style="margin-top:10px;padding:8px 10px;border-radius:10px;background:var(--grad-soft);font-weight:800;font-size:.88rem">✅ Réglage retenu : ${CTL_TXT(C)}${DB.co.current ? ' · appliqué à la séance en cours' : ''}</div>
      <p class="muted" style="margin:6px 0 0;font-size:.8rem">${C.when === 'arrivee' ? 'Les élèves partent sans tablette, avec leur carton et un stylo. À l\'arrivée, le chrono s\'arrête puis ils contrôlent leurs balises sur la tablette : ' : 'Les élèves gardent la tablette ou le téléphone et contrôlent chaque balise dès qu\'elle est trouvée : '}${{ choix: 'ils touchent la balise puis choisissent le symbole de la pince (« Le symbole n\'est pas dans la liste » si besoin).', dessin: 'ils redessinent le symbole sur la grille de points, puis voient « mon dessin / attendu ».', auto: C.when === 'arrivee' ? 'les symboles attendus s\'affichent à côté de chaque balise ; ils comparent avec leur carton et cochent VALIDÉ, FAUX ou Pas trouvée.' : 'ils cochent leurs balises ; à l\'arrivée, les symboles attendus s\'affichent et ils cochent VALIDÉ ou FAUX.' }[C.how]}</p>
      <p class="muted" style="margin:6px 0 0;font-size:.8rem">⭐ Étoile, 🦋 papillon et 🔁 relais : le carton est contrôlé à chaque retour au départ, avec la méthode choisie.</p></div>`;
    box.prepend(h);
    const apply = patch => { DB.co.ctl = { ...coCtl(), ...patch }; const c0 = DB.co.current; if (c0) { c0.ctl = coCtl(); try { if (!c0.joined) pub(c0); } catch (e) {} } save(); window.syncFlush && window.syncFlush(); ctlSettings(box); };
    h.querySelectorAll('[data-cw]').forEach(b => b.onclick = () => apply({ when: b.dataset.cw }));
    h.querySelectorAll('[data-chw]').forEach(b => b.onclick = () => apply({ how: b.dataset.chw }));
  }
  function controle(box) { box.innerHTML = ''; const top = document.createElement('div'), sub = document.createElement('div'); box.append(top, sub); ctlSettings(top); controle0(sub); }
  function controle0(box) {
    const withCodes = DB.co.parcours.filter(p => p.balises.some(b => isPat(b.code)));
    if (!withCodes.length) { box.innerHTML = `<div class="card empty">Attribuez d'abord un <b>symbole de pince</b> aux balises d'un parcours (onglet 🗺 Parcours → ✏️).</div>`; return; }
    const cur = DB.co.current;
    if (!withCodes.some(p => p.id === CK.pc)) CK.pc = cur && withCodes.some(p => p.id === cur.parcours) ? cur.parcours : withCodes[0].id;
    const p = P(CK.pc), live = null;   // les cartons d'une séance se contrôlent sur chaque élève dans ⏱ Séance
    const status = b => { const a = CK.ans[b.num]; if (!a || !isPat(b.code)) return 0; return a === b.code ? 1 : -1; };
    const cell = b => { const a = CK.ans[b.num]; return !a ? '<span style="display:grid;place-items:center;width:44px;height:44px;border:1.5px dashed var(--line);border-radius:6px;font-size:.62rem;font-weight:800;color:var(--muted)">choisir</span>'
      : a === 'X' ? '<span style="display:grid;place-items:center;width:44px;height:44px;border:1.5px solid var(--danger);border-radius:6px;font-weight:900;color:var(--danger)">?</span>' : patSVG(a, 44); };
    const res = b => { const s2 = status(b); return s2 === 1 ? '<b style="color:#1B9E5A">✔ bon</b>' : s2 === -1 ? '<b style="color:var(--danger)">✗ faux</b>' : '<span class="muted">non poinçonnée</span>'; };
    const draw = () => {
      const st = p.balises.map(status), ok = st.filter(x => x === 1).length, ko = st.filter(x => x === -1).length;
      box.innerHTML = `${cur ? `<div class="card" style="margin-bottom:12px"><b>⏱ Séance en cours</b><p class="muted" style="margin:4px 0 8px;font-size:.85rem">Les cartons des élèves se contrôlent directement sur chacun d'eux (bouton « 🔎 Contrôler le carton ») : la séance est lancée pour toute la classe.</p><button class="btn btn-grad btn-block" id="kgo">Aller à la séance</button></div>` : ''}
        <div class="section-title"><h2>Vérifier un carton hors séance</h2></div><div class="card"><label>Parcours</label><select id="kp">${withCodes.map(x => `<option value="${x.id}" ${x.id === p.id ? 'selected' : ''}>${esc(x.nom)}</option>`).join('')}</select>
          ${live ? `<label>Participant (séance en cours)</label><select id="kr"><option value="">— Contrôle seul —</option>${live.runs.map((r, i) => `<option value="${i}" ${String(i) === CK.run ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select>` : ''}</div>
        <div class="card" style="margin-top:12px"><h3>📷 Photo du carton de l'élève</h3>
          ${CK.photo ? `<img src="${CK.photo}" id="kimg" style="width:100%;max-height:360px;object-fit:contain;border-radius:12px;background:#000;cursor:zoom-in">` : '<p class="muted" style="margin:0 0 8px">Facultatif : la photo reste affichée ici pendant que vous comparez les symboles.</p>'}
          <label class="btn btn-ghost btn-block" style="display:block;text-align:center;cursor:pointer;margin:8px 0 0">📷 ${CK.photo ? 'Changer la photo' : 'Prendre / choisir une photo'}<input id="kf" type="file" accept="image/*" capture="environment" style="display:none"></label></div>
        <div class="card" style="margin-top:12px"><h3>Symboles poinçonnés par l'élève</h3>
          <p class="muted" style="margin:0 0 6px;font-size:.8rem">Pour chaque case du carton, touchez le symbole que vous voyez.</p>
          <div class="sheet-table"><table><tr><th>Balise</th><th>Attendu</th><th>Carton</th><th>Résultat</th></tr>
          ${p.balises.map(b => `<tr><td><b>${b.num}</b>${b.ob ? ' <span class="muted" style="font-size:.7rem">oblig.</span>' : ''}</td><td>${isPat(b.code) ? patSVG(b.code, 34, '#8A94A6') : '<span class="muted">—</span>'}</td>
            <td>${isPat(b.code) ? `<button data-a="${b.num}" style="padding:0;border:none;background:none;cursor:pointer">${cell(b)}</button>` : ''}</td><td>${res(b)}</td></tr>`).join('')}</table></div>
          <div class="result" style="margin-top:10px"><div class="card"><b>${ok}</b><small>bonnes</small></div><div class="card"><b>${ko}</b><small>fausses</small></div><div class="card"><b>${p.balises.length - ok - ko}</b><small>non poinçonnées</small></div></div>
          ${live ? `<button class="btn btn-grad btn-block" style="margin-top:12px" id="kap">✔ Reporter dans la séance</button>` : ''}
          <button class="btn btn-ghost btn-block" style="margin-top:8px" id="kz">↺ Carton suivant</button></div>`;
      const $ = s => box.querySelector(s);
      if ($('#kgo')) $('#kgo').onclick = () => { tab = 'seance'; frame(); };
      $('#kp').onchange = e => { CK.pc = e.target.value; CK.ans = {}; CK.run = ''; controle(box); };
      if ($('#kr')) $('#kr').onchange = e => { CK.run = e.target.value; };
      if ($('#kimg')) $('#kimg').onclick = () => { const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.92);display:grid;place-items:center;padding:12px'; o.innerHTML = `<img src="${CK.photo}" style="max-width:100%;max-height:100%;object-fit:contain">`; o.onclick = () => o.remove(); document.body.appendChild(o); };
      $('#kf').onchange = e => { const f = e.target.files[0]; if (!f) return; const url = URL.createObjectURL(f), img = new Image();
        img.onload = () => { const r = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = img.width * r; c.height = img.height * r; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); CK.photo = c.toDataURL('image/jpeg', .85); draw(); };
        img.src = url; };
      box.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const num = b.dataset.a;
        const opts = [...new Set(p.balises.map(x => x.code).filter(isPat))];
        patPicker({ title: `Carton — case de la balise ${num}`, options: opts, draw: false, current: CK.ans[num],
          extra: [{ v: 'X', l: '❓ Autre symbole (faux)' }, { v: '', l: '◻︎ Case vide (non poinçonnée)' }], onPick: c => { CK.ans[num] = c; draw(); } }); });
      if ($('#kap')) $('#kap').onclick = () => { if (CK.run === '') return toast('Choisissez le participant'); const r = live.runs[+CK.run];
        r.found = p.balises.filter(b => status(b) === 1).map(b => b.num); r.wrong = p.balises.filter(b => status(b) === -1).length; save();
        toast(`${r.name} : ${r.found.length} balise(s) ✔`); CK.ans = {}; CK.photo = null; CK.run = String(Math.min(+CK.run + 1, live.runs.length - 1)); draw(); };
      $('#kz').onclick = () => { CK.ans = {}; CK.photo = null; draw(); };
    };
    draw();
  }

  /* ================= 3. BILAN ================= */
  function bilan(box) {
    const S = window.teamFilter ? teamFilter(DB.co.seances) : DB.co.seances;
    if (!S.length) { box.innerHTML = '<div class="card empty">Aucune séance enregistrée pour l\'instant.</div>'; return; }
    const classes = [...new Set(S.map(s => s.classe || '—'))];
    let cls = classes[0];
    const draw = () => {
      const ss = S.filter(s => (s.classe || '—') === cls), gs = coGroups(ss);
      const agg = {};
      gs.forEach(g => g.runs.forEach(({ r, p: q }) => {
        r.members.forEach(m => { const x = resultFor(r, q, m), a = agg[m] = agg[m] || { n: 0, km: 0, t: 0, pts: 0, bal: 0 };
          if (!r.dep) return; a.n++; a.pts += x.score; a.bal += r.found.filter(n => !(r.who || {})[n] || r.who[n] === m).length; if (x.temps != null) { a.km += x.km; a.t += x.temps; } }); }));
      const rows = Object.entries(agg).sort((a, b) => a[0].localeCompare(b[0]));
      box.innerHTML = `<div class="card"><label>Classe</label><select id="bc">${classes.map(c => `<option ${c === cls ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
        <div class="section-title"><h2>Cumul des séances (${gs.length})</h2><button class="link" id="exp">Exporter CSV</button></div>
        <div class="card sheet-table"><table><tr><th>Élève</th><th>Séances</th><th>Distance</th><th>Temps</th><th>RK moyen</th><th>Balises</th><th>Points</th></tr>
          ${rows.map(([n, a]) => `<tr><td><b>${esc(n)}</b></td><td>${a.n}</td><td>${a.km.toFixed(2).replace('.', ',')} km</td><td>${hms(a.t)}</td><td>${mpk(a.t, a.km)}</td><td>${a.bal}</td><td><b>${a.pts}</b></td></tr>`).join('')}</table></div>
        <div class="section-title"><h2>Séances</h2></div>
        <div class="card" style="padding:0">${gs.map((g, gi) => { const p = g.p, fin = g.runs.filter(({ r }) => r.arr).length, grp = g.runs.some(({ r }) => r.members.length > 1), n = g.runs.length;
          return `<div class="list-item"><div style="flex:1"><b>${new Date(g.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} · ${esc(p.nom)}${cls !== '—' ? ' · ' + esc(cls) : ''} · ${n} ${grp ? 'équipe' : 'élève'}${n > 1 ? 's' : ''}${g.recs.length > 1 ? ` (${g.recs.length} tablettes)` : ''}</b><div class="muted">${CO_TYPES[p.type][0]} · ${fin} arrivé${fin > 1 ? 's' : ''}</div></div><button class="btn btn-ghost" data-v="${gi}">👁</button><button class="btn btn-ghost" data-cfg="bare" data-x="${gi}">🗑</button></div>`; }).join('')}</div>
        <div id="det"></div>`;
      const $ = s => box.querySelector(s);
      $('#bc').onchange = () => { cls = $('#bc').value; draw(); };
      box.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { const g = gs[+b.dataset.x];
        if (!confirm(g.recs.length > 1 ? `Supprimer cette séance ? (${g.recs.length} enregistrements de tablettes seront supprimés)` : 'Supprimer cette séance ?')) return;
        g.recs.forEach(s => { const A0 = DB.co.seances, i = A0.indexOf(s); if (i >= 0) A0.splice(i, 1); }); save(); bilan(box); });
      box.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { const g = gs[+b.dataset.v], p = g.p;
        $('#det').innerHTML = `<div class="section-title"><h2>${new Date(g.date).toLocaleDateString('fr-FR')} — ${esc(p.nom)}${g.recs.length > 1 ? ` <small class="muted">(${g.recs.length} tablettes)</small>` : ''}</h2></div>${ranking(g.runs.map(({ r, p: q }) => ({ r, x: result(r, q) })), p)}`; $('#det').scrollIntoView({ behavior: 'smooth' }); });
      $('#exp').onclick = () => download(`course-orientation-${cls}.csv`, csv([
        ['Date', 'Parcours', 'Type', 'Participant', 'Membres', 'Départ', 'Arrivée', 'Temps réalisé', 'Balises trouvées', 'Mauvaises balises', 'Oblig. manquantes', 'Points', 'Pénalités temps', 'Temps total', 'Distance (km)', 'RK', 'Vitesse', 'Statut'],
        ...ss.flatMap(s => s.runs.map(r => { const p = s.parcoursSnap, x = result(r, p);
          return [new Date(s.date).toLocaleDateString('fr-FR'), p.nom, CO_TYPES[p.type][0], r.name, r.members.join(', '), r.dep ? clock(r.dep) : '', r.arr ? clock(r.arr) : '', hms(x.temps), r.found.join(' '), r.wrong, x.miss, x.score, hms(x.penS), hms(x.total), x.km.toFixed(2).replace('.', ','), x.rk, x.vit, x.statut]; }))]));
    };
    draw();
  }

  frame();
};
