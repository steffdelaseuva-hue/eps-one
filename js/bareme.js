/* =========================================================
   EPS ONE — « 📐 Barèmes » du Combiné athlétique (dans ✅ Validation enseignant)
   Un barème = un niveau de classe (ex. « Barème classe de 3è »), avec 3 sous-barèmes :
     • Demi-fond : performance cumulée (Garçons / Filles / Marche rapide) + maîtrise du projet
       (moyenne des écarts, en % ou en m ou en s) + contrat de course (% de VMA)
     • Lancer et Saut : Garçons / Filles × sans élan / avec élan + maîtrise du projet (écart en m)
   Tout est modifiable ; les « … » du tableau d'origine sont comblés (pas régulier) et re-comblables.
   Données : DB.valid.bar = { list: [barème], who: { classe: { élève: 'G'|'F'|'M' } } }
   ========================================================= */
const BAR_PUB = { G: 'Garçons', F: 'Filles', M: '🚶 Marche rapide' };
const brFr = (x, d = 2) => x == null || !isFinite(x) ? '–' : (+x).toLocaleString('fr-FR', { maximumFractionDigits: d });
const brNum = s => { const v = parseFloat(String(s).replace(',', '.').replace(/\s/g, '')); return isNaN(v) ? null : v; };
const brTbl = (rows, o) => Object.assign({ rows, lin: false, dir: 'up', max: Math.max(...rows.map(r => r[1])) }, o || {});
function barDefault(lv, name) {
  const DF_G = [[2800, 12], [2700, 11], [2600, 10], [2500, 9], [2400, 8], [2300, 7], [2200, 6], [2100, 5], [2000, 4], [1900, 3], [1800, 2.5], [1700, 2], [1650, 1.75], [1600, 1.5], [1550, 1.25], [1500, 1], [1450, .75], [1400, .5], [1300, .25], [1200, 0]];
  const DF_F = [[2600, 12], [2500, 11], [2400, 10], [2300, 9], [2200, 8], [2100, 7], [2000, 6], [1900, 5], [1800, 4], [1700, 3.5], [1600, 3], [1500, 2.5], [1400, 2], [1350, 1.75], [1300, 1.5], [1200, 1], [1100, .5], [1000, 0]];
  const cp = a => a.map(r => r.slice());
  const t = {
    'df.G': brTbl(cp(DF_G), { max: 12 }), 'df.F': brTbl(cp(DF_F), { max: 12 }), 'df.M': brTbl(cp(DF_F), { max: 12 }),
    'df.pj.pct': brTbl([[0, 6], [5, 5], [10, 4], [15, 3], [20, 2], [25, 1]], { dir: 'down', lin: true, max: 6 }),
    'df.pj.dist': brTbl([[0, 6], [100, 5], [200, 4], [300, 3], [400, 2], [500, 1]], { dir: 'down', lin: true, max: 6 }),
    'df.pj.time': brTbl([[0, 6], [36, 5], [72, 4], [108, 3], [144, 2], [180, 1]], { dir: 'down', lin: true, max: 6 }),
    'df.ct': brTbl([[100, 2], [95, 1.75], [90, 1.5], [85, 1.25], [80, 1], [75, .75], [70, .5], [65, .25], [60, 0]], { max: 2 }),
    'la.G.sans': brTbl([[18, 5], [17, 4.5], [16, 4], [15, 3.5], [14, 3], [13, 2.5], [12, 2], [11, 1.5], [10, 1], [9, .5], [8, 0]], { max: 5 }),
    'la.G.avec': brTbl([[20, 10], [19, 9], [18, 8], [17, 7], [16, 6], [15, 5], [14, 4], [13, 3], [12, 2], [11, 1], [10, 0]], { max: 10 }),
    'la.F.sans': brTbl([[12, 5], [11, 4.5], [10, 4], [9, 3.5], [8, 3], [7, 2.5], [6, 2], [5, 1.5], [4, 1], [3, .5], [2, 0]], { max: 5 }),
    'la.F.avec': brTbl([[15, 10], [14, 9], [13, 8], [12, 7], [11, 6], [10, 5], [9, 4], [8, 3], [7, 2], [6, 1], [5, 0]], { max: 10 }),
    'la.pj': brTbl([[3, 5], [0, .5], [-.5, 0]], { lin: true, max: 5 }),
    'sa.G.sans': brTbl([[7, 5], [6, 3.75], [5, 2.5], [4, 1.25], [3, 0]], { max: 5 }),
    'sa.G.avec': brTbl([[9, 10], [8, 7.25], [7, 5], [6, 2.5], [5, 0]], { max: 10 }),
    'sa.F.sans': brTbl([[5.8, 5], [5, 4], [4, 2.75], [3, 1.5], [2, .25], [1.8, 0]], { max: 5 }),
    'sa.F.avec': brTbl([[7.6, 10], [7, 8.5], [6, 6], [5, 3.5], [4, 1], [3.6, 0]], { max: 10 }),
    'sa.pj': brTbl([[2, 5], [1.8, 4.5], [1.6, 4], [1.4, 3.5], [1.2, 3], [1, 2.5], [.8, 2], [.6, 1.5], [.4, 1], [.2, .5], [0, 0]], { max: 5 })
  };
  if (lv === '4') {   // 4è : même logique que le 3è, un cran en dessous (course −150 m, lancer −1 m) ; saut non utilisé par défaut
    Object.keys(t).forEach(k => { const d = /^df\.[GFM]$/.test(k) ? 150 : /^la\.[GF]\./.test(k) ? 1 : 0; if (d) t[k].rows.forEach(r => { r[0] = Math.round((r[0] - d) * 1000) / 1000; }); }); }
  return { id: 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: name || `Barème classe de ${lv}è`, lv: lv || '3', dfMin: 12, pjUnit: 'pct', ctOn: true, w: { df: 1, la: 1, sa: lv === '4' ? 0 : 1 }, t };
}
function barStore() {
  const v = VD(); v.bar = v.bar || {}; const B = v.bar; B.who = B.who || {};
  if (!Array.isArray(B.list)) { const b3 = barDefault('3'), b4 = barDefault('4'); B.list = [b3, b4]; }
  B.list.forEach((b, i) => { if (b.name === 'Barème classe de 4è (copie du 3è : à ajuster)') B.list[i] = barDefault('4'); });
  return B;
}
/* Note d'une valeur x dans un tableau : par paliers (dernier seuil atteint) ou progressive (interpolation entre deux lignes) */
function barNote(tb, x) {
  if (!tb || x == null || isNaN(x)) return null;
  const R = tb.rows.filter(r => r[0] != null && r[1] != null).slice().sort((a, b) => a[0] - b[0]); if (!R.length) return null;
  const clamp = v => Math.round(Math.max(0, Math.min(tb.max == null ? v : tb.max, v)) * 100) / 100;
  if (tb.dir === 'down') {           // plus c'est petit, mieux c'est (écart au projet)
    if (x > R[R.length - 1][0] + 1e-9) return 0;
    if (x <= R[0][0]) return clamp(R[0][1]);
    for (let i = 0; i < R.length - 1; i++) if (x <= R[i + 1][0] + 1e-9) return clamp(tb.lin ? R[i][1] + (R[i + 1][1] - R[i][1]) * (x - R[i][0]) / (R[i + 1][0] - R[i][0]) : R[i + 1][1]);
    return clamp(R[R.length - 1][1]);
  }
  if (x < R[0][0] - 1e-9) return 0;  // en dessous de la dernière ligne
  if (x >= R[R.length - 1][0] - 1e-9) return clamp(R[R.length - 1][1]);
  for (let i = R.length - 2; i >= 0; i--) if (x >= R[i][0] - 1e-9) return clamp(tb.lin ? R[i][1] + (R[i + 1][1] - R[i][1]) * (x - R[i][0]) / (R[i + 1][0] - R[i][0]) : R[i][1]);
  return 0;
}
/* Comble les trous : insère des lignes intermédiaires (pas donné), notes interpolées entre les deux lignes voisines */
function barFill(tb, step) {
  step = Math.abs(step); if (!(step > 0)) return 0; const R = tb.rows.filter(r => r[0] != null && r[1] != null).sort((a, b) => a[0] - b[0]), add = [];
  for (let i = 0; i < R.length - 1; i++) { const a = R[i], b = R[i + 1]; for (let x = a[0] + step; x < b[0] - step * 0.01; x += step) { const xx = Math.round(x * 1000) / 1000; add.push([xx, Math.round((a[1] + (b[1] - a[1]) * (xx - a[0]) / (b[0] - a[0])) * 100) / 100]); } }
  tb.rows = R.concat(add).sort((a, b) => tb.dir === 'down' ? a[0] - b[0] : b[0] - a[0]); return add.length;
}
/* ---------- Mesures d'un élève dans une épreuve ---------- */
function barMesures(c, e, cls) {
  const T = cbTot(c, e), M = { T, df: { dist: T.n ? T.dist : null, t: T.t, pj: null, ct: null, ok: T.n === T.N } };
  const P = T.runs.filter(r => r.done && r.pv);
  if (P.length) {
    const ec = P.map(r => { const ms = r.pv / 3.6, pct = Math.abs(r.edp != null ? r.edp : r.etp != null ? r.etp : r.ev) * 100;
      const dist = r.run.k === 'duree' ? Math.abs(r.ed) : Math.abs(r.et) * ms, tm = r.run.k === 'duree' ? Math.abs(r.ed) / ms : Math.abs(r.et); return { pct, dist, time: tm }; });
    const mean = k => ec.reduce((a, x) => a + x[k], 0) / ec.length;
    M.df.pj = { pct: mean('pct'), dist: mean('dist'), time: mean('time'), n: P.length };
    let vma = null; try { const K = typeof dfClassVma === 'function' ? dfClassVma(cls) : {}, x = K[e.nom]; vma = x == null ? null : typeof x === 'object' ? x.v : x; } catch (er) { }
    if (vma > 0) M.df.ct = P.reduce((a, r) => a + r.pv / vma * 100, 0) / P.length;
    M.df.vma = vma;
  }
  [['la', 'l'], ['sa', 's']].forEach(([k, w]) => { if (k === 'sa' && c.format !== 'triathlon') return; const E = cbElan(c, e, w), mode = c[w + 'Elan'];
    M[k] = { sans: E.deux ? E.sans || null : mode === 'sans' ? E.best || null : null, avec: E.deux ? E.avec || null : mode === 'avec' ? E.best || null : null, pj: E.deux && E.sans && E.avec ? E.gain : null, deux: E.deux, mesure: w === 'l' ? c.lMesure : 'distance' }; });
  return M;
}
/* Notes d'un élève selon un barème et son public (G / F / M) */
function barScore(b, c, M, pub) {
  const t = b.t, S = { df: null, la: null, sa: null }, add = (o, nm, v, tb, val) => { if (val == null || !tb) return; const n = barNote(tb, val); if (n == null) return; o.items.push({ nm, v: val, n, max: tb.max }); };
  const sub = (key, fn) => { const o = { items: [] }; fn(o); if (o.items.length) { o.pts = o.items.reduce((a, x) => a + x.n, 0); o.max = o.items.reduce((a, x) => a + x.max, 0); o.n20 = o.pts / o.max * 20; S[key] = o; } };
  sub('df', o => { add(o, 'Distance cumulée', M.df.dist, t['df.' + pub], M.df.dist); add(o, 'Maîtrise du projet', null, t['df.pj.' + b.pjUnit], M.df.pj ? M.df.pj[b.pjUnit === 'pct' ? 'pct' : b.pjUnit] : null);
    if (b.ctOn) add(o, 'Contrat de course', null, t['df.ct'], M.df.ct);
    o.items.forEach(x => { if (x.nm === 'Maîtrise du projet') x.v = M.df.pj[b.pjUnit]; if (x.nm === 'Contrat de course') x.v = M.df.ct; }); });
  [['la', 'Lancer'], ['sa', 'Saut']].forEach(([k]) => { if (!M[k]) return; const g = pub === 'G' ? 'G' : 'F';
    sub(k, o => { add(o, 'Sans élan', null, t[`${k}.${g}.sans`], M[k].sans); add(o, 'Avec élan', null, t[`${k}.${g}.avec`], M[k].avec); add(o, 'Maîtrise du projet', null, t[`${k}.pj`], M[k].pj);
      o.items.forEach(x => { x.v = x.nm === 'Sans élan' ? M[k].sans : x.nm === 'Avec élan' ? M[k].avec : M[k].pj; }); }); });
  const ks = Object.keys(S).filter(k => S[k]), wt = ks.reduce((a, k) => a + (+b.w[k] || 0), 0);
  S.n20 = ks.length && wt > 0 ? ks.reduce((a, k) => a + S[k].n20 * (+b.w[k] || 0), 0) / wt : null; return S;
}
/* ---------- Écran ---------- */
function openBareme(cls0, onClose) {
  const B = barStore(), commit = () => { save(); window.syncFlush && window.syncFlush(); };
  let cls = cls0 || DB.lastClass || (DB.classes[0] || {}).name || '', view = 'notes', bi = Math.max(0, B.list.findIndex(b => b.lv === valLevelOf(cls))), part = 'df', pub = 'G', el = 'sans', sid = -1, edit = false;
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:320;background:var(--bg,#fff);overflow:auto;padding:14px 14px 40px'; document.body.appendChild(o);
  const close = () => { o.remove(); onClose && onClose(); };
  const seances = () => (DB.combine.seances || []).filter(s => s && s.classe === cls).sort((a, b) => b.date - a.date);
  const SPART = { df: '🏃 Demi-fond', la: '🥏 Lancer', sa: '🦘 Saut' };
  const tblEd = (key, b, title, note) => { const tb = b.t[key]; if (!tb) return '';
    return `<div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b>${title}</b><span class="muted" style="font-size:.8rem">note max <input data-tmax="${key}" value="${brFr(tb.max)}" inputmode="decimal" style="width:54px;padding:4px;text-align:center"></span></div>
      ${note ? `<div class="muted" style="font-size:.78rem;margin:4px 0">${note}</div>` : ''}
      <div class="sheet-table" style="overflow:auto"><table><tr><th>${tb.dir === 'down' ? 'Écart jusqu\'à' : 'À partir de'}</th><th>Note</th><th></th></tr>
      ${tb.rows.map((r, i) => `<tr><td><input data-tx="${key}|${i}" value="${r[0] == null ? '' : brFr(r[0], 3)}" inputmode="decimal" style="width:84px;padding:5px;text-align:center"></td><td><input data-tn="${key}|${i}" value="${r[1] == null ? '' : brFr(r[1])}" inputmode="decimal" style="width:70px;padding:5px;text-align:center"></td><td><button class="btn btn-ghost" style="padding:3px 8px" data-trm="${key}|${i}" title="Supprimer cette ligne">✕</button></td></tr>`).join('')}</table></div>
      <div class="row" style="gap:6px;margin-top:6px;align-items:center;flex-wrap:wrap"><button class="btn btn-ghost" style="padding:6px 10px" data-tadd="${key}">＋ Ligne</button>
        <label style="margin:0;display:flex;align-items:center;gap:6px;font-size:.82rem"><input type="checkbox" data-tlin="${key}" ${tb.lin ? 'checked' : ''} style="width:18px;height:18px;margin:0"> Notes progressives entre deux lignes</label></div>
      <div class="row" style="gap:6px;margin-top:6px;align-items:center;flex-wrap:wrap"><span class="muted" style="font-size:.8rem">Combler les « … » avec un pas de</span><input data-fstep="${key}" value="${key.startsWith('df.pj.pct') ? 1 : key.startsWith('df.ct') ? 5 : key === 'df.pj.dist' ? 50 : key === 'df.pj.time' ? 6 : key.startsWith('df.') ? 50 : 0.5}" inputmode="decimal" style="width:60px;padding:5px;text-align:center"><button class="btn btn-ghost" style="padding:6px 10px" data-fill="${key}">↔ Combler</button></div></div>`; };
  const draw = () => {
    const y = o.scrollTop; if (bi >= B.list.length) bi = 0; const b = B.list[bi];
    o.innerHTML = `<div style="display:flex;align-items:center;gap:8px;max-width:900px;margin:0 auto"><h2 style="flex:1;margin:0;font-size:1.15rem">📐 Barèmes · Combiné athlétique</h2><button class="btn btn-ghost" style="flex:0 0 auto" data-q>✕ Fermer</button></div>
      <div style="max-width:900px;margin:10px auto 0"><div class="tog">${[['notes', '📊 Notes de la classe'], ['list', '📐 Mes barèmes']].map(([k, l]) => `<button data-bv="${k}" class="${view === k && !edit ? 'on' : ''}">${l}</button>`).join('')}</div>
      ${view === 'notes' ? notesHTML() : edit ? editHTML(b) : listHTML()}</div>`;
    bind(); o.scrollTop = y;
  };
  /* --- liste des barèmes --- */
  const listHTML = () => `<div class="card" style="margin-top:12px"><b>📐 Créer un barème</b><div class="muted" style="font-size:.82rem">Un barème par niveau de classe (ex. « Barème classe de 3è »), avec ses 3 sous-barèmes : Demi-fond, Lancer, Saut. Les barèmes 3è et 4è sont proposés d'office (4è : demi-fond et lancer, un cran sous le 3è ; le saut y est désactivé, poids 0).</div>
      <div class="row" style="margin-top:8px;gap:6px"><input id="bnm" placeholder="Nom (ex. Barème classe de 5è)" style="flex:3"><select id="blv" style="flex:1">${VAL_LV.map(l => `<option value="${l}">${l}è</option>`).join('')}</select></div>
      <div class="row" style="margin-top:6px;gap:6px"><select id="bfrom" style="flex:3"><option value="">Partir du barème 3è d'origine</option>${B.list.map((x, i) => `<option value="${i}">Copie de : ${esc(x.name)}</option>`).join('')}</select><button class="btn btn-grad" style="flex:0 0 auto" id="bnew">＋ Créer</button></div></div>
    ${B.list.map((x, i) => `<div class="card" style="margin-top:10px"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b style="flex:1;min-width:150px">${esc(x.name)}</b><span class="pill">${esc(x.lv)}è</span></div>
      <div class="row" style="gap:6px;margin-top:8px"><button class="btn btn-grad" style="padding:8px" data-bed="${i}">✏️ Modifier</button><button class="btn btn-ghost" style="padding:8px" data-bdup="${i}">⧉ Dupliquer</button><button class="btn btn-ghost" style="padding:8px" data-bdel="${i}">🗑</button></div></div>`).join('')}
    <button class="btn btn-ghost btn-block" style="margin-top:12px" id="bdef">↺ Remettre les barèmes proposés (3è et 4è) en plus des miens</button>`;
  /* --- édition d'un barème --- */
  const editHTML = b => {
    return `<div class="card" style="margin-top:12px"><button class="btn btn-ghost" style="padding:6px 10px" id="bback">← Barèmes</button><div class="row" style="margin-top:8px"><div style="flex:3"><label style="margin-top:0">Nom du barème</label><input id="bname" value="${esc(b.name)}" style="font-weight:800"></div><div style="flex:1"><label style="margin-top:0">Niveau</label><select id="blv2">${VAL_LV.map(l => `<option value="${l}" ${b.lv === l ? 'selected' : ''}>${l}è</option>`).join('')}</select></div></div>
      <label>Pondération des sous-barèmes dans la note finale /20</label><div class="row" style="gap:6px">${['df', 'la', 'sa'].map(k => `<div><span class="muted" style="font-size:.78rem">${SPART[k]}</span><input data-bw="${k}" value="${brFr(b.w[k], 2)}" inputmode="decimal" style="text-align:center"></div>`).join('')}</div>
      <div class="muted" style="font-size:.78rem;margin-top:4px">1 / 1 / 1 = moyenne des sous-barèmes. Mets 0 pour ne pas utiliser une épreuve (ex. Saut en 4è), 2 pour la compter double.</div>
      <div class="tog" style="margin-top:10px">${Object.entries(SPART).map(([k, l]) => `<button data-part="${k}" class="${part === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    ${part === 'df' ? dfHTML(b) : lsHTML(b, part)}`;
  };
  const dfHTML = b => `<div class="card" style="margin-top:10px"><b>Public</b><div class="tog" style="margin-top:6px">${Object.entries(BAR_PUB).map(([k, l]) => `<button data-pub="${k}" class="${pub === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <label>Durée de la course de référence (min)</label><input data-bdm value="${brFr(b.dfMin)}" inputmode="decimal" style="width:90px"><div class="muted" style="font-size:.78rem">Performance = <b>somme des distances</b> de toutes les courses (ex. 4 × 3 min : 500 + 500 + 450 + 500 = 1 950 m en 12 min). Une alerte s'affiche si le temps total est différent.</div></div>
    ${tblEd('df.' + (pub === 'M' ? 'M' : pub), b, `Performance · ${BAR_PUB[pub]}`, pub === 'M' ? 'Rempli d\'office comme le barème Filles : à ajuster pour la marche rapide.' : '')}
    <div class="card" style="margin-top:10px"><b>🎯 Maîtrise du projet</b><div class="muted" style="font-size:.8rem">Moyenne des écarts (en valeur absolue) des courses ayant un projet. Choisis l'unité qui sert à noter (les trois s'affichent dans les notes) :</div>
      <div class="tog" style="margin-top:6px">${[['pct', 'en %'], ['dist', 'en mètres'], ['time', 'en secondes']].map(([k, l]) => `<button data-pju="${k}" class="${b.pjUnit === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    ${tblEd('df.pj.' + b.pjUnit, b, `Maîtrise du projet · écart moyen ${b.pjUnit === 'pct' ? '(%)' : b.pjUnit === 'dist' ? '(m)' : '(s)'}`, b.pjUnit === 'pct' ? '' : 'Valeurs d\'exemple déduites du tableau en %, à ajuster.')}
    <div class="card" style="margin-top:10px"><label style="display:flex;align-items:center;gap:8px;margin:0;font-weight:800"><input type="checkbox" id="bct" ${b.ctOn ? 'checked' : ''} style="width:20px;height:20px;margin:0"> Contrat de course (% de la VMA)</label><div class="muted" style="font-size:.78rem">Moyenne des % de VMA des projets annoncés. Nécessite la VMA de l'élève (outils VMA / Duathlon) ; sinon ce critère est ignoré et la note est ramenée sur 20.</div></div>
    ${b.ctOn ? tblEd('df.ct', b, 'Contrat de course (% de VMA)') : ''}`;
  const lsHTML = (b, k) => `<div class="card" style="margin-top:10px"><b>Public</b><div class="tog" style="margin-top:6px">${['G', 'F'].map(p => `<button data-pub="${p}" class="${pub !== 'F' ? (p === 'G' ? 'on' : '') : (p === 'F' ? 'on' : '')}">${BAR_PUB[p]}</button>`).join('')}</div>
      <label>Élan</label><div class="tog">${[['sans', 'Sans élan'], ['avec', 'Avec élan']].map(([e, l]) => `<button data-el="${e}" class="${el === e ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="muted" style="font-size:.78rem;margin-top:6px">Mesures en <b>mètres</b>. Écart au projet = meilleur essai avec élan − référence sans élan (en mètres).</div></div>
    ${tblEd(`${k}.${pub === 'F' ? 'F' : 'G'}.${el}`, b, `${SPART[k]} · ${BAR_PUB[pub === 'F' ? 'F' : 'G']} · ${el === 'sans' ? 'sans' : 'avec'} élan (m)`)}
    ${tblEd(`${k}.pj`, b, `${SPART[k]} · Maîtrise du projet (écart en m)`, 'Écart favorable à l\'élève. Pour les filles et les garçons.')}`;
  /* --- notes de la classe --- */
  const notesHTML = () => {
    const b = B.list[bi], L = seances(), s = L[sid >= 0 && L[sid] ? sid : 0];
    const head = `<div class="card" style="margin-top:12px"><div class="row"><div><label style="margin-top:0">Classe</label><select id="nc">${DB.classes.map(c => `<option ${c.name === cls ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div><label style="margin-top:0">Barème</label><select id="nb">${B.list.map((x, i) => `<option value="${i}" ${i === bi ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div></div>
      ${L.length ? `<label>Épreuve</label><select id="ns">${L.map((x, i) => `<option value="${i}" ${x === s ? 'selected' : ''}>${new Date(x.date).toLocaleDateString('fr-FR')} · ${esc(cbFmt(x.cfg))}</option>`).join('')}</select>` : ''}</div>`;
    if (!s) return head + '<div class="card empty" style="margin-top:12px">Aucune épreuve enregistrée pour cette classe dans le Combiné.</div>';
    const c = s.cfg, W = (B.who[cls] = B.who[cls] || {}), eleves = s.groups.flatMap(g => g.eleves);
    const rows = eleves.map(e => { const pub = W[e.nom] || '', M = barMesures(c, e, cls), S = pub ? barScore(b, c, M, pub) : null; return { e, pub, M, S }; });
    const warn = []; if (c.lMesure && c.lMesure !== 'distance') warn.push('Le lancer est mesuré en ' + (c.lMesure === 'zones' ? 'zones' : 'points') + ' : le barème attend des mètres.');
    const tm = rows.find(r => r.M.df.t); if (tm && Math.abs(tm.M.df.t / 60 - b.dfMin) > 0.05) warn.push(`Temps total de course : ${brFr(tm.M.df.t / 60, 1)} min (barème prévu pour ${brFr(b.dfMin, 1)} min).`);
    const cell = (it) => it ? `${it.v == null ? '' : brFr(it.v, 2)} → <b>${brFr(it.n)}</b>/${brFr(it.max)}` : '–';
    const tab = rows.map(({ e, pub, M, S }, i) => { const g = (k, nm) => S && S[k] ? S[k].items.find(x => x.nm === nm) : null;
      return `<tr><td><b>${esc(e.nom)}</b></td><td><select data-who="${esc(e.nom)}" style="padding:4px"><option value="">?</option>${Object.entries(BAR_PUB).map(([k, l]) => `<option value="${k}" ${pub === k ? 'selected' : ''}>${l}</option>`).join('')}</select></td>
        <td>${cell(g('df', 'Distance cumulée'))}${M.df.ok ? '' : ' <small>incomplet</small>'}</td>
        <td>${M.df.pj ? `${brFr(M.df.pj.pct, 1)} % · ${brFr(M.df.pj.dist, 0)} m · ${brFr(M.df.pj.time, 0)} s<small>${g('df', 'Maîtrise du projet') ? '→ ' + brFr(g('df', 'Maîtrise du projet').n) + '/' + brFr(g('df', 'Maîtrise du projet').max) : ''}</small>` : '–'}</td>
        <td>${b.ctOn ? (M.df.ct != null ? cell(g('df', 'Contrat de course')) : '<small>VMA ?</small>') : '–'}</td>
        <td><b>${S && S.df ? brFr(S.df.n20, 1) : '–'}</b></td>
        <td>${M.la ? `${cell(g('la', 'Sans élan'))}<small>${cell(g('la', 'Avec élan'))}</small><small>écart ${M.la.pj != null ? brFr(M.la.pj) + ' m → ' + brFr(g('la', 'Maîtrise du projet') ? g('la', 'Maîtrise du projet').n : 0) : '–'}</small>` : '–'}</td><td><b>${S && S.la ? brFr(S.la.n20, 1) : '–'}</b></td>
        ${c.format === 'triathlon' ? `<td>${M.sa ? `${cell(g('sa', 'Sans élan'))}<small>${cell(g('sa', 'Avec élan'))}</small><small>écart ${M.sa.pj != null ? brFr(M.sa.pj) + ' m → ' + brFr(g('sa', 'Maîtrise du projet') ? g('sa', 'Maîtrise du projet').n : 0) : '–'}</small>` : '–'}</td><td><b>${S && S.sa ? brFr(S.sa.n20, 1) : '–'}</b></td>` : ''}
        <td style="font-size:1.05rem"><b>${S && S.n20 != null ? brFr(S.n20, 1) : '–'}</b></td></tr>`; }).join('');
    return head + `${warn.map(w => `<div class="card" style="margin-top:10px;border:1.5px solid #E0892F">⚠️ ${esc(w)}</div>`).join('')}
      <div class="card sheet-table cb-tbl" style="margin-top:10px;overflow:auto"><table><tr><th>Élève</th><th>Public</th><th>Demi-fond · distance</th><th>Écart au projet</th><th>Contrat</th><th>DF /20</th><th>Lancer</th><th>L /20</th>${c.format === 'triathlon' ? '<th>Saut</th><th>S /20</th>' : ''}<th>Note /20</th></tr>${tab}</table></div>
      <div class="row" style="gap:6px;margin-top:10px"><button class="btn btn-grad" style="flex:1" id="nsave">💾 Enregistrer dans Résultats des élèves</button><button class="btn btn-ghost" style="flex:1" id="ncsv">📤 CSV</button></div>
      <div class="muted" style="font-size:.78rem;margin-top:8px">Indique le <b>public</b> de chaque élève (Garçons / Filles / Marche rapide) : il détermine le tableau utilisé. Les notes de chaque sous-barème sont ramenées sur 20 puis pondérées (voir « Modifier » du barème).</div>`;
  };
  const bind = () => {
    const $ = s => o.querySelector(s), A = s => o.querySelectorAll(s), b = B.list[bi];
    $('[data-q]').onclick = close;
    A('[data-bv]').forEach(x => x.onclick = () => { view = x.dataset.bv; edit = false; draw(); });
    if ($('#nc')) $('#nc').onchange = e => { cls = e.target.value; DB.lastClass = cls; sid = -1; const k = B.list.findIndex(x => x.lv === valLevelOf(cls)); if (k >= 0) bi = k; save(); draw(); };
    if ($('#nb')) $('#nb').onchange = e => { bi = +e.target.value; draw(); };
    if ($('#ns')) $('#ns').onchange = e => { sid = +e.target.value; draw(); };
    A('[data-who]').forEach(x => x.onchange = () => { const W = (B.who[cls] = B.who[cls] || {}); if (x.value) W[x.dataset.who] = x.value; else delete W[x.dataset.who]; commit(); draw(); });
    const collect = () => { const L = seances(), s = L[sid >= 0 && L[sid] ? sid : 0]; if (!s) return []; const W = B.who[cls] || {}; return s.groups.flatMap(g => g.eleves).map(e => ({ e, pub: W[e.nom], S: W[e.nom] ? barScore(b, s.cfg, barMesures(s.cfg, e, cls), W[e.nom]) : null })); };
    if ($('#nsave')) $('#nsave').onclick = () => { const R = collect().filter(r => r.S && r.S.n20 != null); if (!R.length) return toast('Choisis le public de chaque élève');
      R.forEach(({ e, pub, S }) => saveResult({ key: `valid|combine-bareme|${cls}|${e.nom}`, tool: 'combine', label: 'Combiné athlétique · ' + b.name, classe: cls, eleve: e.nom, valeur: `${brFr(S.n20, 1)} / 20`,
        detail: [['df', 'Demi-fond'], ['la', 'Lancer'], ['sa', 'Saut']].filter(([k]) => S[k]).map(([k, l]) => `${l} ${brFr(S[k].n20, 1)}/20 (${S[k].items.map(x => x.nm + ' ' + brFr(x.n) + '/' + brFr(x.max)).join(', ')})`).join(' · ') + ` · ${BAR_PUB[pub]}` }));
      save(); toast(R.length + ' notes enregistrées ✔'); };
    if ($('#ncsv')) $('#ncsv').onclick = () => { const R = collect(); download(`bareme-combine-${cls}.csv`.replace(/[^\w.-]+/g, '-'), csv([['Élève', 'Public', 'Distance cumulée (m)', 'Écart projet (%)', 'Écart projet (m)', 'Écart projet (s)', 'Demi-fond /20', 'Lancer /20', 'Saut /20', 'Note /20'],
      ...R.map(({ e, pub, S }) => { const s0 = seances()[0], M = barMesures(s0.cfg, e, cls); return [e.nom, pub ? BAR_PUB[pub] : '', M.df.dist == null ? '' : Math.round(M.df.dist), M.df.pj ? brFr(M.df.pj.pct, 1) : '', M.df.pj ? Math.round(M.df.pj.dist) : '', M.df.pj ? Math.round(M.df.pj.time) : '', S && S.df ? brFr(S.df.n20, 1) : '', S && S.la ? brFr(S.la.n20, 1) : '', S && S.sa ? brFr(S.sa.n20, 1) : '', S && S.n20 != null ? brFr(S.n20, 1) : '']; })])); };
    /* liste */
    if ($('#bnew')) $('#bnew').onclick = () => { const lv = $('#blv').value, nm = $('#bnm').value.trim() || `Barème classe de ${lv}è`, f = $('#bfrom').value, nb = f === '' ? barDefault(lv, nm) : JSON.parse(JSON.stringify(B.list[+f]));
      nb.id = 'b' + Date.now().toString(36); nb.name = nm; nb.lv = lv; B.list.push(nb); bi = B.list.length - 1; edit = true; part = 'df'; pub = 'G'; commit(); draw(); };
    A('[data-bed]').forEach(x => x.onclick = () => { bi = +x.dataset.bed; edit = true; part = 'df'; pub = 'G'; draw(); });
    A('[data-bdup]').forEach(x => x.onclick = () => { const c0 = JSON.parse(JSON.stringify(B.list[+x.dataset.bdup])); c0.id = 'b' + Date.now().toString(36); c0.name += ' (copie)'; B.list.push(c0); commit(); draw(); });
    A('[data-bdel]').forEach(x => x.onclick = () => { const i = +x.dataset.bdel; if (B.list.length < 2) return toast('Garde au moins un barème'); if (!confirm(`Supprimer « ${B.list[i].name} » ?`)) return; B.list.splice(i, 1); bi = 0; commit(); draw(); });
    if ($('#bdef')) $('#bdef').onclick = () => { B.list.push(barDefault('3', 'Barème classe de 3è (d\'origine)'), barDefault('4', 'Barème classe de 4è (d\'origine)')); commit(); draw(); toast('Barèmes d\'origine ajoutés'); };
    /* édition */
    if (!edit) return;
    $('#bback').onclick = () => { edit = false; draw(); };
    $('#bname').onchange = e => { b.name = e.target.value.trim() || b.name; commit(); };
    $('#blv2').onchange = e => { b.lv = e.target.value; commit(); };
    A('[data-bw]').forEach(x => x.onchange = () => { b.w[x.dataset.bw] = Math.max(0, brNum(x.value) || 0); commit(); });
    A('[data-part]').forEach(x => x.onclick = () => { part = x.dataset.part; draw(); });
    A('[data-pub]').forEach(x => x.onclick = () => { pub = x.dataset.pub; draw(); });
    A('[data-el]').forEach(x => x.onclick = () => { el = x.dataset.el; draw(); });
    A('[data-pju]').forEach(x => x.onclick = () => { b.pjUnit = x.dataset.pju; commit(); draw(); });
    if ($('[data-bdm]')) $('[data-bdm]').onchange = e => { b.dfMin = Math.max(1, brNum(e.target.value) || 12); commit(); };
    if ($('#bct')) $('#bct').onchange = e => { b.ctOn = e.target.checked; commit(); draw(); };
    A('[data-tx],[data-tn]').forEach(x => x.onchange = () => { const [k, i] = (x.dataset.tx || x.dataset.tn).split('|'), r = b.t[k].rows[+i], v = brNum(x.value); r[x.dataset.tx ? 0 : 1] = v; if (x.dataset.tx) { const tb = b.t[k]; tb.rows.sort((p, q) => p[0] == null ? 1 : q[0] == null ? -1 : tb.dir === 'down' ? p[0] - q[0] : q[0] - p[0]); } commit(); draw(); });
    A('[data-tmax]').forEach(x => x.onchange = () => { b.t[x.dataset.tmax].max = Math.max(0, brNum(x.value) || 0); commit(); });
    A('[data-trm]').forEach(x => x.onclick = () => { const [k, i] = x.dataset.trm.split('|'); b.t[k].rows.splice(+i, 1); commit(); draw(); });
    A('[data-tadd]').forEach(x => x.onclick = () => { const tb = b.t[x.dataset.tadd], last = tb.rows[tb.rows.length - 1] || [0, 0]; tb.rows.push([null, null]); commit(); draw(); });
    A('[data-tlin]').forEach(x => x.onchange = () => { b.t[x.dataset.tlin].lin = x.checked; commit(); });
    A('[data-fill]').forEach(x => x.onclick = () => { const k = x.dataset.fill, st = brNum(o.querySelector(`[data-fstep="${k}"]`).value), n = barFill(b.t[k], st); commit(); draw(); toast(n ? n + ' ligne(s) ajoutée(s)' : 'Rien à combler avec ce pas'); });
  };
  draw();
}
window.openBareme = openBareme;
