/* =========================================================
   EPS ONE — Outil « Combiné athlétique »
   Duathlon (course + lancer) / Triathlon (course + saut + lancer)
   Individuel ou groupes · course en une ou plusieurs courses (durée et/ou
   distance, récupérations) · tours/plots · projet de course par course et
   écart projet / réalisation · essais de saut et de lancer, sans élan,
   avec élan ou les deux (gain de l'élan) · cumuls
   Utilise les utilitaires de js/demifond.js (dfFr, dfT, dfDur, dfParseT,
   dfNum, dfSign, dfPct, dfEval, dfCls) et ses styles (.df-ph, .df-tl…).
   ========================================================= */
DB.combine = DB.combine || { cfg: null, seances: [], current: null };
ICONS.combine = '<circle cx="6" cy="5" r="2"/><path d="M5 8l-2 5 3 1 1 6M5 8l4 3"/><path d="M13 20l3-7 3 7M14.2 17h3.6"/><path d="M15 4.5 21 8"/><circle cx="20.5" cy="10.5" r="1.5"/>';
const cmss = s => { if (s == null || isNaN(s) || s <= 0) return '–'; s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0'); };
const n1 = x => (Math.round(x * 100) / 100).toString().replace('.', ',');
// Vue « tablette d'un groupe » (athlétisme) : gros compteurs et champs tactiles
if (!document.getElementById('gv-ath')) document.head.insertAdjacentHTML('beforeend', `<style id="gv-ath">
.gv-cnt{display:flex;align-items:center;gap:10px;margin-top:10px}
.gv-cnt .l{flex:1;font-weight:800;text-align:left}
.gv-cnt .btn{min-width:64px;min-height:56px;font-size:1.45rem;padding:0 12px}
.gv-cnt b{min-width:46px;text-align:center;font-size:1.8rem;font-variant-numeric:tabular-nums}
.gv-in{width:84px;padding:12px 6px;text-align:center;font-size:1.3rem;font-weight:800}
.gv-big{font-size:1.2rem;padding:16px;margin-top:12px}
</style>`);
if (!document.getElementById('cb-css')) document.head.insertAdjacentHTML('beforeend', `<style id="cb-css">
.cb-ec{font-size:.8rem;margin-top:5px;line-height:1.4;text-align:left}
.cb-sum{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.cb-sum span{padding:3px 8px;border-radius:9px;border:1px solid var(--line);font-size:.74rem;font-weight:700;background:var(--card)}
.cb-sum span.tot{background:var(--grad-soft)}
.cb-pjd{margin-top:10px;border:1px solid var(--line);border-radius:12px;padding:8px 10px;text-align:left}
.cb-pjd summary{cursor:pointer;font-weight:800}
.cb-pjd .df-pj{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.cb-ph{margin-top:8px}
.cb-ph .big{font-size:clamp(2.6rem,13vw,4.4rem)}
.cb-el{font-size:.8rem;margin-top:3px}
@media (max-width:520px){.cb-tabs button{padding:8px 2px;line-height:1.15;min-width:0}.cb-tabs button span{display:block}}
.cb-tbl td,.cb-tbl th{font-size:.8rem;padding:6px 7px;vertical-align:top;white-space:nowrap}
.cb-tbl td small{display:block;color:var(--muted);font-size:.7rem}
</style>`);

/* ---------- Courses : une ou plusieurs (durée / distance) + récupérations ---------- */
// Ancien réglage (cMode / cDist / cDur) = une seule course
const cbLegacyRun = c => ({ k: c.cMode === 'duree' ? 'duree' : 'dist', d: Math.max(5, Math.round((+c.cDur || 6) * 60)), m: +c.cDist || 800 });
const cbRuns = c => Array.isArray(c.runs) && c.runs.length > 1 ? c.runs : [cbLegacyRun(c)];
const cbRests = c => cbRuns(c).slice(1).map((_, k) => { const v = (c.rests || [])[k]; return v == null || isNaN(v) ? 60 : Math.max(0, +v); });
const cbRunLbl = r => r.k === 'duree' ? dfDur(r.d) : `${dfFr(r.m, 0)} m`;
function cbFmt(c) {
  const R = cbRuns(c), S = cbRests(c);
  if (R.length === 1) return cbRunLbl(R[0]);
  if (R.every(r => cbRunLbl(r) === cbRunLbl(R[0]))) return `${R.length} × ${cbRunLbl(R[0])}${S.every(x => x === S[0]) ? (S[0] ? ` · R ${dfDur(S[0])}` : '') : ` · R ${S.map(x => x ? dfDur(x) : '0').join(' / ')}`}`;
  return R.map((r, k) => cbRunLbl(r) + (k < S.length && S[k] ? ` · R ${dfDur(S[k])}` : '')).join(' · ');
}
// garde cMode / cDist / cDur (lus par les anciennes versions et la synthèse « Collectifs ») = 1re course
const cbSync = c => { const r = c.runs[0]; c.cMode = r.k === 'duree' ? 'duree' : 'distance'; c.cDist = r.m; c.cDur = r.d / 60; };
function cbNorm(c) {
  if (!Array.isArray(c.runs) || c.runs.length < 2) { c.runs = [cbLegacyRun(c)]; c.rests = []; }
  else { c.runs = c.runs.map(r => ({ k: r.k === 'duree' ? 'duree' : 'dist', d: Math.max(5, Math.round(+r.d || 180)), m: Math.max(10, Math.round(+r.m || 500)) })); c.rests = cbRests(c); cbSync(c); }
  return c;
}
// Données d'une course pour un élève : course 1 = champs historiques de l'élève (dep, arr, tours, plots), suivantes dans e.rx
const cbX = (e, k, make) => { if (!k) return e; if (!e.rx) { if (!make) return null; e.rx = []; }
  if (!e.rx[k - 1] && make) e.rx[k - 1] = { dep: null, arr: null, tours: 0, plots: 0 }; return e.rx[k - 1] || null; };
const cbRaw = (c, x) => (x.tours || 0) * c.tour + (c.plotOn ? (x.plots || 0) * c.plot : 0);
// Résultat d'une course (distance, temps, vitesse, projet et écarts via dfEval)
function cbRun(c, e, k) {
  const run = cbRuns(c)[k], x = cbX(e, k) || {}, pv = (e.proj || [])[k] > 0 ? +e.proj[k] : null;
  let dist = 0, t = null;
  if (run.k === 'duree') { dist = cbRaw(c, x); t = dist > 0 ? run.d : null; }
  else if (x.dep && x.arr) { dist = run.m; t = (x.arr - x.dep) / 1000; }
  const R = t ? dfEval(c, run, dist, t, pv, true) : { dist: 0, t: null, v: null, pv };
  R.k = k; R.run = run; R.done = !!t; R.x = x; return R;
}
// Total de l'enchaînement + écart global au projet (courses ayant un projet et un résultat)
function cbTot(c, e) {
  const L = cbRuns(c).map((r, k) => cbRun(c, e, k)), D = L.filter(r => r.done), dist = D.reduce((a, r) => a + r.dist, 0), t = D.reduce((a, r) => a + r.t, 0);
  const T = { runs: L, n: D.length, N: L.length, dist, t, v: t ? dist / t * 3.6 : 0 }, P = D.filter(r => r.pv);
  if (P.length) {
    let aD = 0, aT = 0, pD = 0, pT = 0;
    P.forEach(r => { aD += r.dist; aT += r.t; if (r.run.k === 'duree') { pD += r.pv / 3.6 * r.run.d; pT += r.run.d; } else { pD += r.run.m; pT += r.run.m / (r.pv / 3.6); } });
    T.pv = pD / pT * 3.6; T.pvA = aD / aT * 3.6; T.ev = (T.pvA - T.pv) / T.pv; T.np = P.length;
    if (P.every(r => r.run.k === 'duree')) { T.ed = aD - pD; T.edp = T.ed / pD; } else if (P.every(r => r.run.k === 'dist')) { T.et = aT - pT; T.etp = T.et / pT; }
    T.eAbs = P.reduce((a, r) => a + Math.abs(r.ev), 0) / P.length;
  }
  return T;
}
const cbCls = (ev, c) => dfCls(ev, { tol: c.tol || 5 });
// Écart en unité naturelle (mètres pour une durée, temps pour une distance) + % + écart de vitesse
function cbEcTxt(R, c, speed = true) {
  if (!R || R.ev == null) return '';
  const nat = R.et != null ? dfSign(R.et, a => dfT(a)) : R.ed != null ? `${dfSign(R.ed, a => dfFr(a, 0))} m` : '';
  const pct = R.etp != null ? R.etp : R.edp != null ? R.edp : R.ev, v = R.pvA != null ? R.pvA : R.v;
  return `<span class="${cbCls(R.ev, c)}">${nat ? `${nat} (${dfPct(pct)})` : dfPct(R.ev)}</span>${speed ? ` · vitesse ${dfSign(v - R.pv, a => dfFr(a, 1))} km/h (${dfPct(R.ev)})` : ''}`;
}
const cbPlain = h => String(h).replace(/<[^>]+>/g, '');
// Équivalences : « 10 km/h pendant 3 min → 500 m → 2,5 tours = 2 tours + 5 plots »
function cbTP(m, c) {
  const t = c.tour || 200, tr = Math.floor(m / t + 1e-6), pl = c.plotOn ? Math.round((m - tr * t) / (c.plot || 20)) : 0;
  return `${dfFr(m / t, 2)} tour${m / t >= 2 ? 's' : ''}${c.plotOn ? ` = ${tr} tour${tr > 1 ? 's' : ''} + ${pl} plot${pl > 1 ? 's' : ''}` : ''}`;
}
function cbEq(v, run, c) {
  if (!v || v <= 0) return ''; const ms = v / 3.6;
  return run.k === 'duree' ? `${dfFr(v)} km/h pendant ${dfDur(run.d)} → <b>${dfFr(ms * run.d, 0)} m</b> → ${cbTP(ms * run.d, c)}`
    : `${dfFr(v)} km/h sur ${dfFr(run.m, 0)} m → <b>${dfT(run.m / ms)}</b> → ${cbTP(run.m, c)}`;
}
const cbPjShort = (v, run) => `${dfFr(v)} km/h → ${run.k === 'duree' ? dfFr(v / 3.6 * run.d, 0) + ' m' : dfT(run.m / (v / 3.6))}`;

/* ---------- Sauts / lancers : sans élan, avec élan ou les deux (gain de l'élan) ---------- */
const cbVals = arr => (arr || []).map(x => parseFloat(String(x).replace(',', '.'))).filter(x => !isNaN(x) && x > 0);
function cbElan(c, e, w) {
  const deux = c[w + 'Elan'] === 'deux', A = cbVals(w === 's' ? e.sauts : e.lancers), B = deux ? cbVals(w === 's' ? e.sautsA : e.lancersA) : [];
  const a = A.length ? Math.max(...A) : 0, b = B.length ? Math.max(...B) : 0;
  const R = { deux, sans: a, avec: b, best: Math.max(a, b), sum: [...A, ...B].reduce((x, y) => x + y, 0), gain: null, gainP: null };
  if (deux && a && b) { R.gain = b - a; R.gainP = (b - a) / a; }
  return R;
}
const cbLU = c => c.lMesure === 'distance' ? 'm' : c.lMesure === 'zones' ? 'zone' : 'pts';
const cbGainTxt = (E, u, html = true) => E.gain == null ? '–' : (html ? `<span class="${E.gain > 0 ? 'df-ok' : E.gain < 0 ? 'df-ko' : ''}">` : '') + `${dfSign(E.gain, a => dfFr(a, 2))} ${u} (${dfPct(E.gainP)})` + (html ? '</span>' : '');
const cbElanTxt = (E, u, nm) => E.deux && (E.sans || E.avec) ? `${nm} sans élan ${E.sans ? dfFr(E.sans, 2) + ' ' + u : '–'} / avec élan ${E.avec ? dfFr(E.avec, 2) + ' ' + u : '–'}${E.gain != null ? ` (gain ${cbGainTxt(E, u, false)})` : ''}` : `${nm} ${E.best ? n1(E.best) + ' ' + u : '–'}`;
// Résultat complet d'un élève (utilisé aussi par la synthèse « Collectifs »)
function cbRes(c, e) {
  const T = cbTot(c, e), S = cbElan(c, e, 's'), L = cbElan(c, e, 'l');
  return { tot: T, d: T.dist, t: T.n ? T.t : null, v: T.v, done: T.n === T.N, sEl: S, lEl: L, sBest: S.best, sSum: S.sum, lBest: L.best, lSum: L.sum };
}
// Classement : courses toutes en distance → temps ; toutes en durée → distance ; mixte → vitesse
const cbRankCmp = c => { const R = cbRuns(c), allM = R.every(r => r.k === 'dist'), allD = R.every(r => r.k === 'duree');
  return (a, b) => ((b.done ? 1 : 0) - (a.done ? 1 : 0)) || (allM ? (a.t || 1e9) - (b.t || 1e9) : allD ? b.d - a.d : (b.v || 0) - (a.v || 0)) || (b.lBest - a.lBest); };
const CB_PRE = [['1 course', null], ['4 × 3 min', ['duree', 180, 4, 60]], ['3 × 3 min', ['duree', 180, 3, 60]], ['2 × 500 m', ['dist', 500, 2, 120]], ['3 × 500 m', ['dist', 500, 3, 120]]];

TOOL_IMPL.combine = function (el) {
  const C0 = { format: 'duathlon', orga: 'indiv', cMode: 'distance', cDist: 800, cDur: 6, tour: 200, plotOn: true, plot: 20,
    lEssais: 3, lEssaisA: 3, lMesure: 'distance', lElan: 'sans', sEssais: 3, sEssaisA: 3, sElan: 'sans', projOn: true, tol: 5, refV: 10 };
  let tab = DB.combine.current ? 'saisie' : 'config', iv, pu = 'nat', vk = null;
  const cfg = () => { const c = DB.combine.cfg = DB.combine.cfg || {}; Object.keys(C0).forEach(k => { if (c[k] == null) c[k] = C0[k]; }); return cbNorm(c); };
  const projOn = () => { const S = DB.combine.current; return (S ? S.cfg : cfg()).projOn !== false; };
  function frame() {
    if (tab === 'projets' && !projOn()) tab = 'saisie';
    el.innerHTML = `<div class="co-tabs cb-tabs">${[['config', '⚙️', 'Épreuve'], ...(projOn() ? [['projets', '🎯', 'Projets']] : []), ['saisie', '⏱', 'Saisie'], ['bilan', '📊', 'Bilan']].map(([k, i, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}"><span>${i}</span> ${l}</button>`).join('')}</div><div id="cb-body"></div>`;
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; frame(); });
    const box = el.querySelector('#cb-body');
    if (tab !== 'saisie') clearInterval(window._cbTick);
    ({ config, projets, saisie, bilan })[tab](box);
  }
  const hasSaut = c => c.format === 'triathlon';
  const vit = (d, t) => d && t ? d / t * 3.6 : 0;
  const lUnit = cbLU;
  const elanLbl = v => v === 'deux' ? 'sans + avec élan' : v + ' élan';
  const resTxt = (c, e, gName) => { const r = cbRes(c, e), T = r.tot, N = T.N;
    let valeur;
    if (N === 1) { const x = T.runs[0]; valeur = x.run.k === 'dist' ? (x.done ? `${cmss(x.t)} au ${x.run.m} m (${n1(x.v)} km/h)` : 'course non terminée') : `${cbRaw(c, e)} m en ${n1(x.run.d / 60)} min (${n1(x.v || 0)} km/h)`; }
    else valeur = T.n ? `${cbFmt(c)} : ${dfFr(T.dist, 0)} m en ${dfT(T.t)} (${n1(T.v)} km/h)${T.n < N ? ` · ${T.n}/${N} courses` : ''}` : 'courses non terminées';
    const runs = N > 1 ? T.runs.map(R => `C${R.k + 1} ${R.done ? (R.run.k === 'dist' ? dfT(R.t) : dfFr(R.dist, 0) + ' m') : '–'}${R.ev != null ? ` (${dfPct(R.ev)})` : ''}`).join(', ') : '';
    const ec = T.ev != null ? `écart projet ${cbPlain(cbEcTxt(T, c))}` : '';
    return { valeur, detail: [hasSaut(c) ? 'Triathlon' : 'Duathlon', gName, runs, ec, hasSaut(c) ? cbElanTxt(r.sEl, 'm', 'saut') : '', cbElanTxt(r.lEl, lUnit(c), 'lancer')].filter(Boolean).join(' · ') }; };
  // Affichage fusionné : les enregistrements des différentes tablettes (même jour, même classe, même épreuve) = UNE épreuve
  const sig = s => { const c = s.cfg; return [new Date(s.date).toDateString(), s.classe, c.format, c.orga, cbFmt(c), c.tour, c.plotOn ? c.plot : 0, c.lEssais, c.lMesure, c.lElan, c.lElan === 'deux' ? c.lEssaisA : '', hasSaut(c) ? c.sEssais + c.sElan + (c.sElan === 'deux' ? c.sEssaisA : '') : ''].join('|'); };
  const merged = L => { const M = new Map();
    L.forEach(s => { const k = sig(s), m = M.get(k) || M.set(k, { date: s.date, classe: s.classe, cfg: s.cfg, recs: [], groups: [] }).get(k); m.recs.push(s); m.groups.push(...s.groups); m.date = Math.min(m.date, s.date); });
    return [...M.values()].map(m => (m.groups.sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true })), m)); };

  /* ---- Séance partagée avec les autres tablettes (modèle sans résultats) ---- */
  const blankE = (c, n) => { const e = { nom: n, dep: null, arr: null, tours: 0, plots: 0, sauts: Array(c.sEssais).fill(''), lancers: Array(c.lEssais).fill(''), proj: [] };
    if (c.sElan === 'deux') e.sautsA = Array(c.sEssaisA || c.sEssais).fill(''); if (c.lElan === 'deux') e.lancersA = Array(c.lEssaisA || c.lEssais).fill(''); return e; };
  const normE = (c, e) => { if (!Array.isArray(e.proj)) e.proj = []; if (!Array.isArray(e.sauts)) e.sauts = []; if (!Array.isArray(e.lancers)) e.lancers = [];
    if (c.sElan === 'deux' && !Array.isArray(e.sautsA)) e.sautsA = Array(c.sEssaisA || c.sEssais || 3).fill('');
    if (c.lElan === 'deux' && !Array.isArray(e.lancersA)) e.lancersA = Array(c.lEssaisA || c.lEssais || 3).fill(''); };
  const pub = (S, create) => { if (S.joined) return; const c = S.cfg;
    partPublish('combine', S.id, { nom: `${hasSaut(c) ? 'Triathlon' : 'Duathlon'} athlétique`, classe: S.classe, ng: S.groups.length, indiv: c.orga !== 'grp',
      ep: `course ${cbFmt(c)}${hasSaut(c) ? ` · saut ${c.sEssais} essais` : ''} · lancer ${c.lEssais} essais`,
      tpl: { classe: S.classe, cfg: c, groups: S.groups.map(g => ({ name: g.name, members: g.eleves.map(e => e.nom) })) } }, create); };
  const join = (box, p) => { const T = p.tpl, c = T.cfg;
    DB.combine.current = { id: p.id, date: Date.now(), classe: T.classe, cfg: JSON.parse(JSON.stringify(c)), start: null, joined: true,
      groups: T.groups.map(g => ({ name: g.name, eleves: g.members.map(n => blankE(c, n)) })) };
    save(); const S = DB.combine.current;
    partPickGroup(box, S.groups.map(g => ({ name: g.name, members: g.eleves.map(e => e.nom) })), i => { if (!DB.combine.current) { tab = 'config'; return frame(); } S.only = i; save(); tab = 'saisie'; frame(); }, c.orga !== 'grp'); };

  /* ================= 1. CONFIGURATION ================= */
  function config(box) {
    const c = cfg(), R = c.runs, RS = c.rests, multi = R.length > 1;
    const nSel = (id, v) => `<select id="${id}">${Array.from({ length: 10 }, (_, i) => `<option ${v === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>`;
    const elSel = (id, v) => `<select id="${id}">${[['sans', 'Sans élan'], ['avec', 'Avec élan'], ['deux', 'Les deux (sans + avec)']].map(([k, l]) => `<option value="${k}" ${v === k ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
    const preOn = i => { const P = CB_PRE[i][1]; if (!P) return !multi; const [k, v, n, rs] = P; return multi && R.length === n && R.every(r => r.k === k && (k === 'duree' ? r.d === v : r.m === v)) && RS.every(x => x === rs); };
    const tog = (attr, list, val) => `<div class="tog" style="margin:0">${list.map(([v, l]) => `<button data-${attr}="${v}" class="${val === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    const runRows = R.map((r, k) => `<div class="df-run"><b style="min-width:70px">Course ${k + 1}</b>${tog('rk', [[k + '|duree', '⏱ Durée'], [k + '|dist', '📏 Distance']], k + '|' + r.k)}
        ${r.k === 'duree' ? `<input data-rd="${k}" value="${dfT(r.d)}" inputmode="numeric" aria-label="Durée course ${k + 1}"><span class="muted">min:s</span>` : `<input data-rm="${k}" type="number" min="10" step="10" value="${r.m}" aria-label="Distance course ${k + 1}"><span class="muted">m</span>`}
        <button class="btn btn-ghost" data-rx="${k}" style="padding:6px 11px;margin-left:auto" aria-label="Supprimer la course ${k + 1}">✕</button>
        <div class="df-eq" style="flex-basis:100%">${cbEq(c.refV, r, c)}</div></div>
      ${k < R.length - 1 ? `<div class="df-run df-rest">😮‍💨 <b>Récup ${k + 1}</b><input data-sd="${k}" value="${dfT(RS[k])}" inputmode="numeric" aria-label="Récupération ${k + 1}"><span class="muted">min:s</span></div>` : ''}`).join('');
    box.innerHTML = `<div class="card" data-cfg><h3>Format</h3><div class="seg"><button data-f="duathlon" class="${c.format === 'duathlon' ? 'on' : ''}">Duathlon<br><small style="font-weight:600;opacity:.85">course + lancer</small></button><button data-f="triathlon" class="${c.format === 'triathlon' ? 'on' : ''}">Triathlon<br><small style="font-weight:600;opacity:.85">course + saut + lancer</small></button></div>
        <label>Organisation</label><div class="seg"><button data-o="indiv" class="${c.orga === 'indiv' ? 'on' : ''}">Individuel</button><button data-o="grp" class="${c.orga === 'grp' ? 'on' : ''}">Groupes</button></div></div>
      <div class="card" data-cfg style="margin-top:12px"><h3>🏃 Course (obligatoire)</h3>
        <label style="margin-top:0">Formats rapides</label><div class="tog" id="pre">${CB_PRE.map(([l], i) => `<button data-pre="${i}" class="${preOn(i) ? 'on' : ''}">${l}</button>`).join('')}</div>
        ${multi ? `<label>Enchaînement de courses (${R.length})</label><div id="runs">${runRows}</div>
          <div class="row" style="margin-top:8px"><button class="btn btn-ghost" id="radd" ${R.length >= 10 ? 'disabled' : ''}>＋ Ajouter une course</button>
            <div style="display:flex;gap:6px;align-items:center;flex:1;min-width:210px"><span class="muted">Même récup partout</span><input id="allr" style="width:76px;padding:8px;text-align:center" value="${dfT(RS[0])}"><button class="btn btn-ghost" id="allrok" style="padding:8px 12px">OK</button></div></div>
          <p class="df-help">Durée : « 3:00 », « 45 s », « 12 min ». Récupération à 0:00 = enchaînement direct. Pendant la saisie, le chrono enchaîne course → récupération → course suivante (bips 3-2-1).</p>`
        : `<div class="seg"><button data-cm="distance" class="${c.cMode === 'distance' ? 'on' : ''}">Distance imposée<br><small style="font-weight:600;opacity:.85">on mesure le temps</small></button><button data-cm="duree" class="${c.cMode === 'duree' ? 'on' : ''}">Durée imposée<br><small style="font-weight:600;opacity:.85">on compte tours et plots</small></button></div>
          ${c.cMode === 'distance' ? `<label>Distance (m)</label><input id="cd" type="number" value="${c.cDist}">` : `<label>Durée (min)</label><input id="cu" type="number" step="0.5" value="${c.cDur}">`}
          <button class="btn btn-ghost btn-block" id="radd" style="margin-top:10px">＋ Ajouter une course (plusieurs courses avec récupération)</button>`}
        <label>Longueur du tour</label><div class="tog" id="tr">${[100, 200, 300, 400].map(v => `<button data-t="${v}" class="${c.tour === v ? 'on' : ''}">${v} m</button>`).join('')}</div>
        <label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="po" ${c.plotOn ? 'checked' : ''} style="width:auto"> Comptage des plots (fin de tour incomplet)</label>
        ${c.plotOn ? `<label>Distance entre 2 plots (m)</label><input id="pd" type="number" value="${c.plot}">` : ''}
        ${multi ? '' : `<p class="muted" style="margin:8px 0 0">Équivalence : ${c.cMode === 'distance' ? `${c.cDist} m = ${n1(c.cDist / c.tour)} tour(s) de ${c.tour} m${c.plotOn ? ` = ${Math.floor(c.cDist / c.tour)} tour(s) + ${Math.round((c.cDist % c.tour) / c.plot)} plot(s)` : ''}` : `1 tour = ${c.tour} m${c.plotOn ? ` = ${n1(c.tour / c.plot)} plots` : ''}`}</p>`}</div>
      <div class="card" data-cfg style="margin-top:12px"><h3>🎯 Projet de course</h3>
        <label style="display:flex;gap:8px;align-items:center;margin-top:0"><input type="checkbox" id="pjon" ${c.projOn ? 'checked' : ''} style="width:auto"> Chaque élève annonce un projet pour chaque course</label>
        ${c.projOn ? `<p class="df-help">En vitesse (km/h), en distance (m, tours ou plots) pour une course en durée, ou en temps pour une course en distance. Écart projet / réalisation après chaque course et sur le total.</p>
          <div class="row"><div><label>Tolérance « projet respecté » (± %)</label><input id="tol" type="number" min="1" max="30" step="1" value="${c.tol}"></div><div><label>Vitesse de référence (km/h)</label><input id="refv" type="number" min="3" step="0.5" value="${c.refV}"></div></div>
          <p class="df-help">Écart vert si ≤ ${c.tol} %, orange si ≤ ${2 * c.tol} %, rouge au-delà.${multi ? '' : `<br>Équivalence à ${dfFr(c.refV)} km/h : ${cbEq(c.refV, R[0], c)}`}</p>` : ''}</div>
      ${hasSaut(c) ? `<div class="card" data-cfg style="margin-top:12px"><h3>🦘 Saut</h3><div class="row"><div><label>${c.sElan === 'deux' ? 'Essais sans élan' : 'Nombre d\'essais'}</label>${nSel('se', c.sEssais)}</div>
          <div><label>Élan</label>${elSel('sl', c.sElan)}</div>${c.sElan === 'deux' ? `<div><label>Essais avec élan</label>${nSel('sea', c.sEssaisA)}</div>` : ''}</div><p class="muted" style="margin:6px 0 0">Mesure en mètres.${c.sElan === 'deux' ? ' Meilleur essai sans élan et avec élan → gain de l\'élan (m et %).' : ''}</p></div>` : ''}
      <div class="card" data-cfg style="margin-top:12px"><h3>🥏 Lancer</h3><div class="row"><div><label>${c.lElan === 'deux' ? 'Essais sans élan' : 'Nombre d\'essais'}</label>${nSel('le', c.lEssais)}</div>
          <div><label>Élan</label>${elSel('ll', c.lElan)}</div>${c.lElan === 'deux' ? `<div><label>Essais avec élan</label>${nSel('lea', c.lEssaisA)}</div>` : ''}</div>
        <label>Mesure</label><div class="seg">${[['distance', 'Distance (m)'], ['zones', 'Zones'], ['points', 'Points']].map(([k, l]) => `<button data-lm="${k}" class="${c.lMesure === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        ${c.lElan === 'deux' ? '<p class="muted" style="margin:6px 0 0">Meilleur essai sans élan et avec élan → gain de l\'élan (écart et %).</p>' : ''}</div>
      <details class="card" style="margin-top:12px"><summary style="font-weight:800;cursor:pointer">🔁 Convertisseur distance ⇄ vitesse</summary>
        <div class="row"><div><label>Distance (m)</label><input id="xd" type="number"></div><div><label>Temps (min)</label><input id="xm" type="number" min="0"></div><div><label>(s)</label><input id="xs" type="number" min="0"></div><div><label>Vitesse (km/h)</label><input id="xv" type="number" step="0.1"></div></div>
        <p class="muted" style="margin:6px 0 0">Remplissez 2 des 3 valeurs (distance, temps, vitesse) : la 3e est calculée.</p><button class="btn btn-ghost btn-block" style="margin-top:8px" id="xgo">Calculer</button><div id="xr" style="margin-top:8px;font-weight:800;text-align:center"></div></details>
      <button class="btn btn-grad btn-block" data-cfg="bare" style="margin-top:14px;padding:15px" id="go">▶ Préparer la saisie</button>`;
    const $ = s => box.querySelector(s), all = s => box.querySelectorAll(s);
    const read = () => { if ($('#cd')) c.cDist = +$('#cd').value || 0; if ($('#cu')) c.cDur = +$('#cu').value || 0; c.plotOn = $('#po').checked; if ($('#pd')) c.plot = +$('#pd').value || 1;
      if ($('#se')) c.sEssais = +$('#se').value; if ($('#sl')) c.sElan = $('#sl').value; if ($('#sea')) c.sEssaisA = +$('#sea').value;
      c.lEssais = +$('#le').value; c.lElan = $('#ll').value; if ($('#lea')) c.lEssaisA = +$('#lea').value;
      c.projOn = $('#pjon').checked; if ($('#tol')) c.tol = Math.min(50, Math.max(1, dfNum($('#tol').value) || 5)); if ($('#refv')) c.refV = Math.max(3, dfNum($('#refv').value) || 10);
      if (!multi) { c.runs = [cbLegacyRun(c)]; c.rests = []; } save(); };
    const re = () => { if (c.runs.length > 1) cbSync(c); save(); config(box); };
    all('[data-f]').forEach(b => b.onclick = () => { read(); c.format = b.dataset.f; config(box); });
    all('[data-o]').forEach(b => b.onclick = () => { read(); c.orga = b.dataset.o; config(box); });
    all('[data-cm]').forEach(b => b.onclick = () => { read(); c.cMode = b.dataset.cm; config(box); });
    all('[data-t]').forEach(b => b.onclick = () => { read(); c.tour = +b.dataset.t; config(box); });
    all('[data-lm]').forEach(b => b.onclick = () => { read(); c.lMesure = b.dataset.lm; config(box); });
    $('#po').onchange = () => { read(); config(box); };
    ['#cd', '#cu', '#pd', '#pjon', '#tol', '#refv', '#sl', '#ll'].forEach(s => { if ($(s)) $(s).onchange = () => { read(); config(box); }; });
    // plusieurs courses
    all('[data-pre]').forEach(b => b.onclick = () => { read(); const P = CB_PRE[+b.dataset.pre][1];
      if (!P) { const r0 = c.runs[0]; c.runs = [r0]; c.rests = []; c.cMode = r0.k === 'duree' ? 'duree' : 'distance'; c.cDist = r0.m; c.cDur = r0.d / 60; }
      else { const [k, v, n, rs] = P; c.runs = Array.from({ length: n }, () => ({ k, d: k === 'duree' ? v : 180, m: k === 'dist' ? v : 500 })); c.rests = Array(n - 1).fill(rs); }
      re(); });
    $('#radd').onclick = () => { read(); const l = c.runs[c.runs.length - 1]; c.runs.push({ ...l }); c.rests.push(c.rests.length ? c.rests[c.rests.length - 1] : 60); re(); };
    all('[data-rk]').forEach(b => b.onclick = () => { const [k, v] = b.dataset.rk.split('|'); read(); c.runs[+k].k = v; re(); });
    all('[data-rd]').forEach(i => i.onchange = () => { const s = dfParseT(i.value); read(); if (s == null) toast('Durée non reconnue (ex. 3:00 ou 45 s)'); else c.runs[+i.dataset.rd].d = Math.max(5, s); re(); });
    all('[data-rm]').forEach(i => i.onchange = () => { read(); c.runs[+i.dataset.rm].m = Math.max(10, Math.round(dfNum(i.value) || 500)); re(); });
    all('[data-sd]').forEach(i => i.onchange = () => { read(); const s = dfParseT(i.value); c.rests[+i.dataset.sd] = Math.max(0, s || 0); re(); });
    all('[data-rx]').forEach(b => b.onclick = () => { read(); const k = +b.dataset.rx; c.runs.splice(k, 1); c.rests.splice(Math.min(k, c.rests.length - 1), 1);
      if (c.runs.length === 1) { const r0 = c.runs[0]; c.rests = []; c.cMode = r0.k === 'duree' ? 'duree' : 'distance'; c.cDist = r0.m; c.cDur = r0.d / 60; } re(); });
    if ($('#allrok')) $('#allrok').onclick = () => { read(); const s = dfParseT($('#allr').value); if (s == null) return toast('Durée non reconnue'); c.rests = c.rests.map(() => s); re(); };
    $('#xgo').onclick = () => { const d = +$('#xd').value || 0, t = (+$('#xm').value || 0) * 60 + (+$('#xs').value || 0), v = +$('#xv').value || 0;
      if (d && t) { $('#xv').value = n1(vit(d, t)).replace(',', '.'); $('#xr').textContent = `${d} m en ${cmss(t)} = ${n1(vit(d, t))} km/h`; }
      else if (v && t) { const dd = v / 3.6 * t; $('#xd').value = Math.round(dd); $('#xr').textContent = `${n1(v)} km/h pendant ${cmss(t)} = ${Math.round(dd)} m (${n1(dd / c.tour)} tours de ${c.tour} m)`; }
      else if (v && d) { const tt = d / (v / 3.6); $('#xm').value = Math.floor(tt / 60); $('#xs').value = Math.round(tt % 60); $('#xr').textContent = `${d} m à ${n1(v)} km/h = ${cmss(tt)}`; }
      else $('#xr').textContent = 'Renseignez 2 valeurs.'; };
    $('#go').onclick = () => { read(); if (DB.combine.current && !confirm('Une saisie est déjà en cours. La remplacer ?')) return; prepare(box); };
    if (!DB.combine.current) partMount(box, 'combine', p => join(box, p));
  }

  function prepare(box) {
    const c = cfg();
    if (!DB.classes.length) { box.innerHTML = noClassMsg; return; }
    const launch = (classe, groups) => { vk = null; DB.combine.current = { id: Date.now().toString(36), date: Date.now(), classe, cfg: JSON.parse(JSON.stringify(c)), start: null,
      groups: groups.map(g => ({ name: g.name, eleves: g.members.map(n => blankE(c, n)) })) }; pub(DB.combine.current, true); save(); tab = 'saisie'; frame(); };
    if (c.orga === 'indiv') {
      box.innerHTML = `<div class="card" data-cfg><label style="margin-top:0">Classe</label><select id="cl">${DB.classes.map(x => `<option ${x.name === (DB.lastClass || '') ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><button class="btn btn-grad btn-block" style="margin-top:12px" id="ok">▶ Commencer</button></div>`;
      box.querySelector('#ok').onclick = () => { const cl = box.querySelector('#cl').value; DB.lastClass = cl; launch(cl, studentsOf(cl).map(n => ({ name: n, members: [n] }))); };
    } else {
      box.innerHTML = `<div class="card" data-cfg><label style="margin-top:0">Taille des groupes</label><div class="seg" id="sz">${[[2, 'Duos'], [3, 'Trios'], [4, 'Quatuors']].map(([n, l]) => `<button data-n="${n}">${l}</button>`).join('')}</div><div id="cmp" style="margin-top:6px"></div></div>`;
      mountComposer(box.querySelector('#cmp'), { id: 'cbc', modes: ['random', 'hetero', 'homo'], button: '▶ Former les groupes et commencer',
        onTeams: teams => launch(box.querySelector('#cbc-cls')?.value || '', teams.map(t => ({ name: t.name.replace('Équipe', 'Groupe'), members: t.members.map(m => m.n) }))) });
      const setSize = n => { box.querySelector('#cbc-k').value = 's'; box.querySelector('#cbc-v').value = n; box.querySelectorAll('#sz [data-n]').forEach(b => b.classList.toggle('on', +b.dataset.n === n)); };
      box.querySelectorAll('#sz [data-n]').forEach(b => b.onclick = () => setSize(+b.dataset.n)); setSize(2);
    }
  }

  /* ---------- Projets (action élève : libre, hors data-cfg) ---------- */
  const pjKit = S => {
    const c = S.cfg, R = cbRuns(c), anyD = R.some(r => r.k === 'duree'), allD = R.every(r => r.k === 'duree'), allM = R.every(r => r.k === 'dist');
    const U = run => pu === 'v' ? 'v' : run.k === 'dist' ? 't' : pu === 'tours' ? 'tours' : pu === 'plots' && c.plotOn ? 'plots' : 'm';
    const uLbl = { v: 'km/h', m: 'mètres', tours: `tours de ${c.tour} m`, plots: `plots de ${c.plot} m`, t: 'temps (min:s)' };
    const fmtIn = (v, run) => { if (!v) return ''; const u = U(run), m = v / 3.6 * run.d;
      return u === 'v' ? dfFr(v, 1) : u === 't' ? dfT(run.m / (v / 3.6)) : u === 'tours' ? dfFr(m / c.tour, 2) : u === 'plots' ? dfFr(m / c.plot, 1) : String(Math.round(m)); };
    const parseIn = (s, run) => { if (String(s).trim() === '') return 0; const u = U(run);
      if (u === 'v') return dfNum(s);
      if (u === 't') { const t = dfParseT(s); return t ? run.m / t * 3.6 : null; }
      const n = dfNum(s); if (n == null) return null; return n * (u === 'tours' ? c.tour : u === 'plots' ? c.plot : 1) / run.d * 3.6; };
    const warn = v => v && (v > 25 || v < 3) ? '<div class="w">⚠️ vitesse inhabituelle</div>' : '';
    const cell = (gi, ei, e, k) => { const run = R[k], v = (e.proj || [])[k] || 0;
      return `<div class="it"><div style="display:flex;justify-content:space-between;gap:6px"><b style="font-size:.82rem">C${k + 1} · ${cbRunLbl(run)}</b><span class="muted" style="font-size:.72rem">${uLbl[U(run)]}</span></div>
        <input data-pj="${gi}|${ei}|${k}" value="${fmtIn(v, run)}" inputmode="decimal" placeholder="${U(run) === 't' ? 'ex. 2:30' : '—'}" aria-label="Projet course ${k + 1}">
        <div class="df-eq">${v ? cbEq(v, run, c) : ''}</div>${warn(v)}</div>`; };
    const unitTog = () => `<div class="tog">${[['v', 'Vitesse (km/h)'], ['nat', allD ? 'Distance (m)' : allM ? 'Temps' : 'Distance / temps'], ...(anyD ? [['tours', 'Tours']] : []), ...(anyD && c.plotOn ? [['plots', 'Plots']] : [])].map(([k, l]) => `<button data-pu="${k}" class="${pu === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    const bind = (box, redraw) => {
      box.querySelectorAll('[data-pu]').forEach(b => b.onclick = () => { pu = b.dataset.pu; redraw(); });
      box.querySelectorAll('[data-pj]').forEach(i => i.onchange = () => { const [gi, ei, k] = i.dataset.pj.split('|').map(Number), e = S.groups[gi].eleves[ei], v = parseIn(i.value, R[k]);
        if (v == null || v < 0) { toast('Valeur non reconnue'); return redraw(); }
        e.proj = e.proj || []; e.proj[k] = v ? Math.round(v * 100) / 100 : null; save();
        const id = i.dataset.pj; redraw(); const L = [...box.querySelectorAll('[data-pj]')], j = L.findIndex(x => x.dataset.pj === id); if (L[j + 1]) L[j + 1].focus({ preventScroll: true }); });
    };
    const filled = e => R.every((r, k) => (e.proj || [])[k] > 0);
    return { cell, unitTog, bind, filled, help: `Chaque élève annonce ce qu'il pense réaliser sur chaque course : ${allD ? 'une distance (m, tours ou plots)' : allM ? 'un temps' : 'une distance (courses en durée) ou un temps (courses en distance)'} ou une vitesse. Les équivalences s'affichent aussitôt.` };
  };
  function projets(box) {
    const S = DB.combine.current;
    if (!S) { box.innerHTML = '<div class="card empty">Préparez d\'abord l\'épreuve (⚙️ Épreuve → « Préparer la saisie ») : chaque élève pourra ensuite annoncer son projet de course.</div>'; return; }
    const c = S.cfg, R = cbRuns(c), grp = c.orga === 'grp', K = pjKit(S);
    S.groups.forEach(g => g.eleves.forEach(e => normE(c, e)));
    const parts = S.groups.flatMap((g, gi) => S.only != null && S.only !== gi ? [] : g.eleves.map((e, ei) => ({ g, gi, e, ei })));
    box.innerHTML = `<div class="card"><h3 style="margin-top:0">🎯 Projets de course</h3><p class="df-help" style="margin-top:0">${K.help}</p>
        <label>Saisir en</label>${K.unitTog()}<p class="df-help">${cbFmt(c)} · ${parts.filter(p => K.filled(p.e)).length}/${parts.length} projets complets · tolérance ± ${c.tol} %</p></div>
      ${parts.map(p => `<div class="card" style="margin-top:10px"><b style="font-size:1.05rem">${esc(p.e.nom)}</b>${grp ? ` <span class="muted" style="font-size:.8rem">· ${esc(p.g.name)}</span>` : ''}
        <div class="df-pj">${R.map((r, k) => K.cell(p.gi, p.ei, p.e, k)).join('')}</div></div>`).join('')}
      <button class="btn btn-grad btn-block" style="margin-top:12px" id="gosa">⏱ Aller à la saisie</button>`;
    K.bind(box, () => projets(box));
    box.querySelector('#gosa').onclick = () => { tab = 'saisie'; frame(); };
  }

  /* ================= 2. SAISIE ================= */
  function saisie(box) {
    const S = DB.combine.current;
    if (!S) { box.innerHTML = '<div class="card empty">Aucune saisie en cours. Réglez l\'épreuve dans ⚙️ Épreuve puis « Préparer la saisie ».</div>'; partMount(box, 'combine', p => join(box, p)); return; }
    const c = S.cfg, grp = c.orga === 'grp', R = cbRuns(c), RS = cbRests(c), N = R.length, multi = N > 1, pj = c.projOn !== false, K = pjKit(S);
    // anciennes saisies : chrono S.start / g.start / départs individuels → chronologie
    S.groups.forEach(g => g.eleves.forEach(e => normE(c, e)));
    if (!S.tl) { const d0 = S.groups.flatMap(g => g.eleves.map(e => e.dep)).filter(Boolean).sort((a, b) => a - b)[0]; S.tl = S.start || d0 ? { k: 0, ph: 'run', t0: S.start || d0 } : { k: 0, ph: 'idle', t0: null }; }
    S.groups.forEach(g => { if (!g.tl && g.start) g.tl = { k: 0, ph: 'run', t0: g.start }; });
    const hasData = e => !!(R.some((r, k) => { const x = cbX(e, k); return x && (r.k === 'dist' ? x.dep : x.tours || x.plots); }) || cbVals(e.sauts).length || cbVals(e.lancers).length || cbVals(e.sautsA).length || cbVals(e.lancersA).length);
    // chronologie : S (vue enseignant, toutes les classes) ou g (tablette d'un groupe)
    const scope = o => o === S ? S.groups : [o];
    const own = g => g.tl ? g : S.tl && S.tl.ph !== 'idle' ? S : g;
    const TL = o => o.tl || { k: 0, ph: 'idle', t0: null };
    const beepIf = (now, t, f, d) => { if (Math.abs(now - t) < 2500) beep(f, d); };
    const startRun = (o, k, t, now, all = true) => { const T = o.tl = o.tl || {}; Object.assign(T, { k, ph: 'run', t0: t, t1: null, ls: null });
      if (all) scope(o).forEach(g => g.eleves.forEach(e => { const x = cbX(e, k, true); if (!x.dep) x.dep = t; }));
      if (o === S) S.start = S.start || t; beepIf(now, t, 1300, .45); };
    const endRun = (o, t, now) => { const T = o.tl; T.t1 = t;
      if (R[T.k].k === 'duree' && Math.abs(now - t) < 2500) [0, 350, 700].forEach(d => setTimeout(() => beep(700, .5), d));
      if (T.k < N - 1) { if (RS[T.k] > 0) Object.assign(T, { ph: 'rest', t0: t, ls: null }); else startRun(o, T.k + 1, t, now); }
      else T.ph = 'done'; };
    const tick3 = (T, left, f) => { const s = Math.ceil(left); if (s <= 3 && s >= 1 && s !== T.ls) { T.ls = s; beep(f, .1); } };
    const adv = (o, now) => { const T = o.tl; if (!T) return false; let ch = false, guard = 0;
      while (guard++ < 40) {
        if (T.ph === 'run') { const run = R[T.k];
          if (run.k === 'duree') { const left = run.d - (now - T.t0) / 1000; if (left <= 0) { endRun(o, T.t0 + run.d * 1000, now); ch = true; continue; } tick3(T, left, 880); }
          else { const X = scope(o).flatMap(g => g.eleves.map(e => cbX(e, T.k))); if (X.length && X.every(x => x && x.arr)) { endRun(o, Math.max(...X.map(x => x.arr)), now); ch = true; continue; } } }
        else if (T.ph === 'rest') { const left = RS[T.k] - (now - T.t0) / 1000; if (left <= 0) { startRun(o, T.k + 1, T.t0 + RS[T.k] * 1000, now); ch = true; continue; } tick3(T, left, 1200); }
        break; }
      if (ch) save(); return ch; };
    const clk = (o, now = Date.now()) => { const T = TL(o), run = R[T.k];
      if (T.ph === 'idle') return { txt: run.k === 'duree' ? cmss(run.d) : '0:00', ph: 'idle', pr: 0 };
      if (T.ph === 'run') { if (run.k === 'duree') { const l = run.d - (now - T.t0) / 1000; return { txt: l > 0 ? cmss(Math.ceil(l - 1e-6)) : 'STOP', ph: 'run', pr: 1 - Math.max(0, l) / run.d, end: l <= 0 }; } return { txt: cmss((now - T.t0) / 1000) === '–' ? '0:00' : cmss((now - T.t0) / 1000), ph: 'run', pr: 0 }; }
      if (T.ph === 'rest') { const l = RS[T.k] - (now - T.t0) / 1000; return { txt: l > 0 ? cmss(Math.ceil(l - 1e-6)) : '0:00', ph: 'rest', pr: 1 - Math.max(0, l) / RS[T.k] }; }
      return { txt: multi ? 'FIN' : run.k === 'duree' ? 'STOP' : cmss(((T.t1 || now) - T.t0) / 1000), ph: 'done', pr: 1, end: true }; };
    const phLbl = o => { const T = TL(o);
      if (T.ph === 'idle') return `Prêt · course ${T.k + 1}/${N} · ${cbRunLbl(R[T.k])}`;
      if (T.ph === 'run') return `Course ${T.k + 1}/${N} · ${cbRunLbl(R[T.k])}${T.k < N - 1 ? ` · ensuite récup ${dfT(RS[T.k])}` : ' · dernière course'}`;
      if (T.ph === 'rest') return `😮‍💨 Récupération · ensuite course ${T.k + 2}/${N} · ${cbRunLbl(R[T.k + 1])}`;
      return '🏁 Toutes les courses sont terminées'; };
    const nextK = o => { const T = TL(o); return T.ph === 'idle' ? T.k : T.ph === 'rest' ? T.k + 1 : null; };
    const started = (o, k) => { const T = TL(o); return T.k > k || (T.k === k && T.ph !== 'idle'); };
    const vrun = o => vk != null && vk < N ? vk : TL(o).k;
    const phCls = o => ({ idle: 'idle', run: 'work', rest: 'rest', done: 'end' })[TL(o).ph];
    const chips = o => { const T = TL(o), v = vrun(o);
      return `<div class="df-tl">${R.map((r, k) => `<button data-vk="${k}" class="${T.ph === 'run' && T.k === k ? 'cur' : ''} ${T.k > k || (T.k === k && ['rest', 'done'].includes(T.ph)) ? 'done' : ''} ${v === k ? 'vw' : ''}">C${k + 1} · ${cbRunLbl(r)}</button>${k < N - 1 ? `<span class="${T.ph === 'rest' && T.k === k ? 'cur' : ''}">R ${dfT(RS[k])}</span>` : ''}`).join('')}</div>`; };
    // lignes « projet / écart » et récapitulatif des courses d'un élève
    const pjLine = (e, k) => { if (!pj) return ''; const r = cbRun(c, e, k), pv = r.pv;
      if (!pv) return '';
      if (!r.done) return `<div class="cb-ec">🎯 Projet : ${cbEq(pv, R[k], c)}</div>`;
      return `<div class="cb-ec">🎯 Projet ${cbPjShort(pv, R[k])} · réalisé <b>${R[k].k === 'dist' ? dfT(r.t) : dfFr(r.dist, 0) + ' m'}</b> (${dfFr(r.v)} km/h)<br>Écart : <b>${cbEcTxt(r, c)}</b></div>`; };
    const sumLine = e => { if (!multi) return ''; const T = cbTot(c, e); if (!T.n) return '';
      return `<div class="cb-sum">${T.runs.map(r => r.done ? `<span>C${r.k + 1} · ${r.run.k === 'dist' ? dfT(r.t) : dfFr(r.dist, 0) + ' m'} · ${dfFr(r.v)} km/h${r.ev != null ? ` · <b class="${cbCls(r.ev, c)}">${dfPct(r.ev)}</b>` : ''}</span>` : `<span class="muted">C${r.k + 1} –</span>`).join('')}
        <span class="tot">Total ${dfFr(T.dist, 0)} m · ${dfT(T.t)} · ${dfFr(T.v)} km/h${T.ev != null ? ` · écart <b class="${cbCls(T.ev, c)}">${dfPct(T.ev)}</b>` : ''}</span></div>`; };
    const pjBlock = (gi, ei, e, T) => { if (!pj) return ''; const ok = K.filled(e);
      return `<details class="cb-pjd" ${TL(T).ph === 'idle' && !started(T, 0) && !ok ? 'open' : ''}><summary>🎯 ${grp ? 'Projet de ' + esc(e.nom) : 'Mon projet'} <span class="muted" style="font-weight:600;font-size:.8rem">· ${R.filter((r, k) => (e.proj || [])[k] > 0).length}/${N} ${ok ? '✅' : ''}</span></summary>
        <p class="df-help" style="margin-top:4px">Saisir en :</p>${K.unitTog()}<div class="df-pj">${R.map((r, k) => K.cell(gi, ei, e, k)).join('')}</div></details>`; };
    // sauts / lancers : champs sans élan (ou unique) + avec élan si « les deux »
    const essaisHTML = (k, e, big) => { const inp = (attr, arr) => arr.map((v, i) => big ? `<input class="gv-in" inputmode="decimal" data-${attr}="${k}|${i}" value="${esc(v)}" placeholder="${i + 1}">` : `<input style="width:58px;padding:6px;text-align:center" inputmode="decimal" data-${attr}="${k}|${i}" value="${esc(v)}" placeholder="${i + 1}">`).join(big ? '' : ' ');
      const block = (ico, nm, u, E, a1, arr1, a2, arr2, elan) => {
        if (!E.deux) return big ? `<div style="margin-top:12px;font-weight:800">${ico} ${nm} (${u})${elan === 'avec' ? ' · avec élan' : ''}</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">${inp(a1, arr1)}</div><div class="muted" style="font-size:.85rem">meilleur <b>${E.best ? n1(E.best) : '–'}</b> · cumul ${E.sum ? n1(E.sum) : '–'}</div>`
          : `<div style="margin-top:6px;font-size:.85rem"><b>${nm} (${u})</b> ${inp(a1, arr1)} <span class="muted">meilleur <b>${E.best ? n1(E.best) : '–'}</b> · cumul ${E.sum ? n1(E.sum) : '–'}</span></div>`;
        return big ? `<div style="margin-top:12px;font-weight:800">${ico} ${nm} sans élan (${u})</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">${inp(a1, arr1)}</div><div class="muted" style="font-size:.85rem">meilleur sans élan <b>${E.sans ? n1(E.sans) : '–'}</b></div>
            <div style="margin-top:10px;font-weight:800">${ico} ${nm} avec élan (${u})</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">${inp(a2, arr2)}</div><div class="muted" style="font-size:.85rem">meilleur avec élan <b>${E.avec ? n1(E.avec) : '–'}</b></div>
            <div style="margin-top:6px;font-weight:800">⚡ Gain de l'élan : ${cbGainTxt(E, u)}</div>`
          : `<div style="margin-top:6px;font-size:.85rem"><b>${nm} sans élan (${u})</b> ${inp(a1, arr1)} <span class="muted">meilleur <b>${E.sans ? n1(E.sans) : '–'}</b></span></div>
            <div style="margin-top:4px;font-size:.85rem"><b>${nm} avec élan</b> ${inp(a2, arr2)} <span class="muted">meilleur <b>${E.avec ? n1(E.avec) : '–'}</b></span></div>
            <div class="cb-el">⚡ Gain de l'élan : <b>${cbGainTxt(E, u)}</b></div>`; };
      return (hasSaut(c) ? block('🦘', 'Sauts', 'm', cbElan(c, e, 's'), 'sa', e.sauts, 'sb', e.sautsA || [], c.sElan) : '') + block('🥏', 'Lancers', lUnit(c), cbElan(c, e, 'l'), 'la', e.lancers, 'lb', e.lancersA || [], c.lElan); };
    const saveSeance = () => {
      // seuls les groupes / élèves ayant des résultats sont enregistrés (une tablette par groupe → pas de lignes vides)
      const done = S.groups.filter(g => g.eleves.some(hasData)); if (!done.length) return toast(grp ? 'Aucun groupe n\'a de résultat' : 'Aucun résultat saisi');
      if (S.only != null && done.some(g => g.eleves.some(e => R.some((r, k) => { const x = cbX(e, k); return r.k === 'dist' && x && x.dep && !x.arr; }))) && !confirm('Tout le monde n\'est pas arrivé. Enregistrer quand même ?')) return;
      const rec = { ...S, id: S.id + '-' + Math.random().toString(36).slice(2, 6), groups: done }; ['only', 'joined', 'tl'].forEach(k => delete rec[k]);   // id unique par tablette (fusion de synchro par id)
      rec.groups = JSON.parse(JSON.stringify(done)); rec.groups.forEach(g => delete g.tl);
      DB.combine.seances.push(rec); DB.combine.current = null; vk = null;
      // synthèse « Résultats des élèves » : une ligne par élève ayant des résultats
      done.forEach(g => g.eleves.filter(hasData).forEach(e => saveResult({ tool: 'combine', label: 'Combiné athlétique', classe: S.classe, eleve: e.nom, ...resTxt(c, e, grp ? g.name : '') })));
      save(); clearInterval(iv); toast('Épreuve enregistrée ✔'); tab = 'bilan'; frame(); };
    const startBtnLbl = (o, prefix) => { const k = nextK(o), T = TL(o); if (k == null) return '';
      return T.ph === 'rest' ? `⏭ Départ course ${k + 1} maintenant` : multi ? `${prefix} course ${k + 1}` : ''; };
    // Vue « un seul groupe » : ce que voient les élèves sur leur tablette
    const drawGroup = () => {
      const gi = S.only, g = S.groups[gi], o = own(g), T = TL(o), k = vrun(o), run = R[k], dist = run.k === 'dist', ck = clk(o), on = started(o, k), nk = nextK(o);
      box.innerHTML = `<div class="card" style="text-align:center"><div style="font-weight:900;font-size:1.3rem">${esc(g.name)}</div>${grp ? `<div class="muted">${g.eleves.map(e => esc(e.nom)).join(', ')}</div>` : ''}
          ${multi ? `<div class="df-ph cb-ph ${phCls(o)}"><div class="lb" id="gvphl">${phLbl(o)}</div><div class="big" id="gvclk">${ck.txt}</div><div class="bar"><i id="gvbar" style="width:${ck.pr * 100}%"></i></div></div>`
            : `<div class="gv-clock" id="gvclk" style="color:${ck.end ? (dist ? '#1B9E5A' : 'var(--danger)') : 'inherit'}">${ck.txt}</div>`}
          <div class="muted" style="font-size:.85rem">${hasSaut(c) ? 'Triathlon' : 'Duathlon'} · course ${cbFmt(c)} · tour ${c.tour} m${c.plotOn ? ` · plots ${c.plot} m` : ''}</div>
          ${nk != null ? `<button class="btn btn-grad btn-block gv-big" id="gv-go">${startBtnLbl(o, '▶ Départ') || `▶ Départ ${grp ? 'du groupe' : ''}`}</button>` : ''}
          ${multi ? chips(o) : ''}</div>
        ${g.eleves.map((e, ei) => { const r = cbRun(c, e, k), x = cbX(e, k) || {}, key = `${gi}|${ei}`, raw = cbRaw(c, x), cur = T.ph === 'run' && T.k === k;
          return `<div class="card" style="margin-top:10px${dist && x.arr ? ';border:2px solid #1B9E5A' : ''}"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:1.2rem">${grp ? esc(e.nom) : '🏃 Course'}${multi ? ` <span class="muted" style="font-size:.85rem">· C${k + 1}</span>` : ''}</b><span style="font-size:1.5rem;font-weight:900;font-variant-numeric:tabular-nums" data-live="${key}">${dist ? (r.t ? cmss(r.t) : x.dep ? '…' : '') : raw + ' m'}</span></div>
            ${dist
              ? (x.dep && !x.arr && (cur || !multi) ? `<button class="btn btn-danger btn-block gv-big" data-fin="${key}">🏁 Arrivée ${grp ? 'de ' + esc(e.nom) : ''}</button>`
                : x.arr ? `<div style="margin-top:8px;font-weight:800">✅ Course ${multi ? k + 1 + ' ' : ''}terminée · ${n1(r.v)} km/h ${cur || !multi ? `<button class="link" data-undo="${key}">↺ annuler</button>` : ''}</div>` : x.dep ? '<div class="muted" style="margin-top:6px">Non arrivé</div>' : '<div class="muted" style="margin-top:6px">En attente du départ</div>')
              : `<div class="gv-cnt"><span class="l">🏃 Tours</span><button class="btn btn-ghost" data-dec="${key}|tours" ${on ? '' : 'disabled'}>−</button><b>${x.tours || 0}</b><button class="btn btn-grad" data-inc="${key}|tours" ${on ? '' : 'disabled'}>+1</button></div>
                ${c.plotOn ? `<div class="gv-cnt"><span class="l">🔶 Plots</span><button class="btn btn-ghost" data-dec="${key}|plots" ${on ? '' : 'disabled'}>−</button><b>${x.plots || 0}</b><button class="btn btn-ghost" data-inc="${key}|plots" ${on ? '' : 'disabled'}>+</button></div>` : ''}
                <div class="muted" style="font-size:.85rem;text-align:right">${raw} m · ${n1(r.v || 0)} km/h</div>`}
            ${pjLine(e, k)}${sumLine(e)}${pjBlock(gi, ei, e, o)}
            ${essaisHTML(key, e, true)}</div>`; }).join('')}
        ${g.eleves.some(hasData) ? `<button class="btn btn-grad btn-block" style="margin-top:12px" id="save">💾 Enregistrer ${grp ? 'les résultats du groupe' : 'mon résultat'}</button>` : ''}
        <div style="text-align:center;margin:18px 0 6px"><button class="link" id="gv-prof">🔒 Mode enseignant</button></div>`;
      bind(o, k);
      const $ = s => box.querySelector(s);
      if ($('#gv-go')) $('#gv-go').onclick = () => { const t = Date.now(), n = nextK(o); if (n == null) return; startRun(o, n, t, t); if (o !== S) S.start = S.start || t; vk = null; save(); drawGroup(); };
      $('#gv-prof').onclick = () => { if (!confirm('Passer en mode enseignant (tous les groupes, réglages) ?')) return; S.only = null; save(); draw(); };
    };
    // actions communes aux deux vues (départ / arrivée / tours / essais / projets…)
    const bind = (o, k) => {
      const $ = s => box.querySelector(s), all = s => box.querySelectorAll(s), keep = () => save(), redraw = () => (S.only != null && S.groups[S.only] ? drawGroup() : draw());
      const E = key => { const [gi, ei] = key.split('|').map(Number); return S.groups[gi].eleves[ei]; };
      all('[data-go]').forEach(b => b.onclick = () => { const t = Date.now(), T = TL(o); if (!(T.ph === 'run' && T.k === k)) startRun(o, k, t, t, false); cbX(E(b.dataset.go), k, true).dep = t; beep(1300, .3); keep(); redraw(); });
      all('[data-fin]').forEach(b => b.onclick = () => { cbX(E(b.dataset.fin), k, true).arr = Date.now(); beep(1000, .3); keep(); adv(o, Date.now()); redraw(); });
      all('[data-undo]').forEach(b => b.onclick = () => { cbX(E(b.dataset.undo), k, true).arr = null; keep(); redraw(); });
      all('[data-edt]').forEach(b => b.onclick = () => { const e = E(b.dataset.edt), x = cbX(e, k, true), r = cbRun(c, e, k);
        const s = prompt(`Temps de ${e.nom} sur la course ${k + 1} (${cbRunLbl(R[k])}) — min:s, vide = non arrivé`, r.t ? dfT(r.t) : ''); if (s == null) return;
        const t = dfParseT(s); if (!String(s).trim()) x.arr = null; else if (!t) return toast('Temps non reconnu (ex. 2:45)'); else { x.dep = x.dep || Date.now() - t * 1000; x.arr = x.dep + t * 1000; } keep(); redraw(); });
      const step = (s, d) => { const [gi, ei, f] = s.split('|'); const x = cbX(S.groups[+gi].eleves[+ei], k, true); x[f] = Math.max(0, (x[f] || 0) + d); if (d > 0) beep(f === 'tours' ? 1100 : 800, .05); keep(); redraw(); };
      all('[data-inc]').forEach(b => b.onclick = () => step(b.dataset.inc, 1));
      all('[data-dec]').forEach(b => b.onclick = () => step(b.dataset.dec, -1));
      [['sa', 'sauts'], ['sb', 'sautsA'], ['la', 'lancers'], ['lb', 'lancersA']].forEach(([a, f]) => all(`[data-${a}]`).forEach(i => i.onchange = () => { const [gi, ei, n] = i.dataset[a].split('|').map(Number), e = S.groups[gi].eleves[ei]; (e[f] = e[f] || [])[n] = i.value.trim(); keep(); redraw(); }));
      all('[data-vk]').forEach(b => b.onclick = () => { const v = +b.dataset.vk; vk = v === TL(o).k || v === vk ? null : v; redraw(); });
      K.bind(box, () => { redraw(); box.querySelectorAll('.cb-pjd').forEach(d => d.open = true); });
      if ($('#save')) $('#save').onclick = saveSeance;
    };
    const draw = () => {
      if (S.only != null && S.groups[S.only]) return drawGroup();
      const T = TL(S), k = vrun(S), run = R[k], dist = run.k === 'dist', ck = clk(S), nk = nextK(S), cur = T.ph === 'run' && T.k === k;
      const others = T.ph === 'run' && R[T.k].k === 'dist' && S.groups.some(g => g.eleves.some(e => !(cbX(e, T.k) || {}).dep));
      const allLbl = nk != null ? (startBtnLbl(S, '🚩 Départ') || '🚩 Départ course') : others ? '🚩 Départ des autres' : '';
      box.innerHTML = `<div class="card"><b>${c.format === 'triathlon' ? 'Triathlon' : 'Duathlon'} athlétique</b><div class="muted">${esc(S.classe)} · course ${cbFmt(c)} · tour ${c.tour} m${c.plotOn ? ` · plots ${c.plot} m` : ''}${hasSaut(c) ? ` · saut ${elanLbl(c.sElan)} (${c.sEssais}${c.sElan === 'deux' ? ' + ' + c.sEssaisA : ''} essais)` : ''} · lancer ${elanLbl(c.lElan)} (${c.lEssais}${c.lElan === 'deux' ? ' + ' + c.lEssaisA : ''} essais, ${lUnit(c)})${pj ? ` · 🎯 projets ± ${c.tol} %` : ''}</div>
          ${multi ? `<div class="df-ph cb-ph ${phCls(S)}"><div class="lb" id="gphl">${phLbl(S)}</div><div class="big" id="gclk">${ck.txt}</div><div class="bar"><i id="gbar" style="width:${ck.pr * 100}%"></i></div></div>${chips(S)}`
            : `<div class="big clock" id="gclk" style="font-size:clamp(2.2rem,11vw,3.6rem);padding:4px 0">${ck.txt}</div>`}
          <div class="row" style="margin-top:8px">${allLbl ? `<button class="btn btn-grad" id="all">${allLbl}</button>` : ''}${T.ph === 'run' && R[T.k].k === 'dist' ? `<button class="btn btn-ghost" data-cfg="bare" id="endrun">⏹ Terminer la course${multi ? ' ' + (T.k + 1) : ''}</button>` : ''}${T.ph === 'run' ? '<button class="btn btn-ghost" data-cfg="bare" id="rz">↺ Chrono</button>' : ''}</div>
          <button class="btn btn-ghost btn-block" data-cfg="bare" style="margin-top:8px" id="edg">✏️ Modifier les groupes / participants (absent, blessé…)</button>
          ${pj ? '<button class="btn btn-ghost btn-block" style="margin-top:8px" id="gopj">🎯 Projets des élèves</button>' : ''}
          ${S.groups.length > 1 ? `<div data-cfg="bare"><label>📱 Tablette ${grp ? 'd\'un groupe (les élèves ne verront que leur groupe)' : 'd\'un élève (il ne verra que sa fiche)'}</label><select id="only"><option value="">${grp ? 'Tous les groupes' : 'Tous les élèves'}</option>${S.groups.map((g, i) => `<option value="${i}">${esc(g.name)}</option>`).join('')}</select></div>` : ''}</div>
        ${multi ? `<div class="muted" style="margin:10px 2px 0;font-size:.82rem"><b style="color:var(--text)">Course ${k + 1} · ${cbRunLbl(run)}</b> ${cur ? '· en cours' : started(S, k) ? '· terminée : corrigez si besoin' : '· pas encore courue'} ${dist ? '· « 🏁 Arrivée » pour chaque coureur' : '· comptez tours et plots'}</div>` : ''}
        ${S.groups.map((g, gi) => { const RR = g.eleves.map(e => cbRes(c, e));
          const Tg = { d: RR.reduce((a, r) => a + r.d, 0), t: RR.reduce((a, r) => a + (r.t || 0), 0), l: RR.reduce((a, r) => a + r.lBest, 0), s: RR.reduce((a, r) => a + r.sBest, 0) };
          return `<div class="run">${grp ? `<div class="run-h"><b>${esc(g.name)}</b></div>` : ''}
            ${g.eleves.map((e, ei) => { const r = cbRun(c, e, k), x = cbX(e, k) || {}, key = `${gi}|${ei}`, canGo = !x.dep && (cur || nk === k);
              return `<div style="${grp ? 'border-top:1px solid var(--line);padding-top:8px;margin-top:8px' : ''}"><div class="run-h"><b>${esc(e.nom)}</b><span class="run-t" style="font-size:1.2rem" data-live="${key}">${dist ? (r.t ? cmss(r.t) : x.dep ? '…' : '') : cbRaw(c, x) + ' m'}</span></div>
                ${dist
                  ? `<div class="row" style="margin-top:6px">${canGo ? `<button class="btn btn-grad" data-go="${key}">▶ Départ</button>` : ''}${x.dep && !x.arr && (cur || !multi) ? `<button class="btn btn-danger" data-fin="${key}">🏁 Arrivée</button>` : ''}${x.arr && (cur || !multi) ? `<button class="btn btn-ghost" data-undo="${key}">↺</button>` : ''}${x.arr ? `<span class="muted" style="align-self:center">${n1(r.v)} km/h</span>` : ''}${multi && started(S, k) && !cur ? `<button class="btn btn-ghost" data-edt="${key}" style="padding:8px 12px">✏️ ${x.arr ? 'Temps' : 'Saisir le temps'}</button>` : ''}</div>`
                  : `<div class="row" style="margin-top:6px;align-items:center;gap:6px;flex-wrap:nowrap"><span style="flex:0 0 auto;font-weight:700;font-size:.8rem">Tours</span><button class="btn btn-ghost" style="flex:0 0 42px;padding:8px" data-dec="${key}|tours">−</button><b style="flex:0 0 26px;text-align:center">${x.tours || 0}</b><button class="btn btn-grad" style="flex:0 0 52px;padding:8px" data-inc="${key}|tours">+1</button>
                      ${c.plotOn ? `<span style="flex:0 0 auto;font-weight:700;font-size:.8rem">Plots</span><button class="btn btn-ghost" style="flex:0 0 36px;padding:8px 4px" data-dec="${key}|plots">−</button><b style="flex:0 0 22px;text-align:center">${x.plots || 0}</b><button class="btn btn-ghost" style="flex:0 0 36px;padding:8px 4px" data-inc="${key}|plots">+</button>` : ''}</div>
                    <div class="muted" style="font-size:.8rem">${cbRaw(c, x)} m · ${n1(r.v || 0)} km/h</div>`}
                ${pjLine(e, k)}${sumLine(e)}
                ${essaisHTML(key, e, false)}</div>`; }).join('')}
            ${grp ? `<div class="muted" style="margin-top:8px;font-size:.82rem;border-top:1px solid var(--line);padding-top:6px"><b style="color:var(--text)">Total groupe</b> · course ${dfFr(Tg.d, 0)} m${Tg.t ? ` en ${cmss(Tg.t)}` : ''}${hasSaut(c) ? ` · sauts ${n1(Tg.s)} m` : ''} · lancers ${n1(Tg.l)} ${lUnit(c)} (meilleurs essais)</div>` : ''}</div>`; }).join('')}
        <div class="row" style="margin-top:12px"><button class="btn btn-grad" data-cfg="bare" id="save">💾 Terminer et enregistrer</button><button class="btn btn-ghost" data-cfg="bare" id="cancel">Abandonner</button></div>`;
      const $ = s => box.querySelector(s), keep = () => save();
      if ($('#all')) $('#all').onclick = () => { const t = Date.now(), n = nextK(S);
        if (n != null) startRun(S, n, t, t); else S.groups.forEach(g => g.eleves.forEach(e => { const x = cbX(e, S.tl.k, true); if (!x.dep) x.dep = t; }));
        vk = null; beep(1300, .45); keep(); draw(); };
      if ($('#endrun')) $('#endrun').onclick = () => { const T = S.tl, miss = S.groups.some(g => g.eleves.some(e => !(cbX(e, T.k) || {}).arr));
        if (miss && !confirm('Certains élèves ne sont pas arrivés : terminer la course quand même ?')) return; const t = Date.now(); endRun(S, t, t); keep(); draw(); };
      $('#edg').onclick = () => { const indiv = c.orga !== 'grp';
        editGroupsPanel(indiv ? 'Participants' : 'Groupes', { cls: S.classe, indiv, list: () => S.groups, names: g => g.eleves.map(e => e.nom),
          take: (g, n) => g.eleves.splice(g.eleves.findIndex(e => e.nom === n), 1)[0],
          put: (g, n, d) => g.eleves.push(d || blankE(c, n)), make: name => ({ name, eleves: [] }), onChange: () => { keep(); pub(S); }, onClose: draw }); };
      if ($('#rz')) $('#rz').onclick = () => { const T = S.tl; if (!confirm(`Remettre le chrono de la course ${T.k + 1} à zéro (départs et arrivées de cette course effacés) ?`)) return;
        S.groups.forEach(g => g.eleves.forEach(e => { const x = cbX(e, T.k); if (x) { x.dep = null; x.arr = null; } })); S.tl = { k: T.k, ph: 'idle', t0: null }; if (!T.k) S.start = null; keep(); draw(); };
      if ($('#gopj')) $('#gopj').onclick = () => { tab = 'projets'; frame(); };
      if ($('#only')) $('#only').onchange = ev => { S.only = ev.target.value === '' ? null : +ev.target.value; vk = null; keep(); draw(); };
      bind(S, k);
      $('#cancel').onclick = () => { if (confirm('Abandonner cette saisie ?')) { partAskRemove(S); DB.combine.current = null; vk = null; save(); clearInterval(iv); tab = 'config'; frame(); } };
    };
    const redraw = () => (S.only != null && S.groups[S.only] ? drawGroup() : draw());
    let dirty = false;
    const paint = now => {
      const g = S.only != null ? S.groups[S.only] : null, o = g ? own(g) : S, ck = clk(o, now), k = vrun(o);
      const cl = box.querySelector(g ? '#gvclk' : '#gclk'); if (cl) cl.textContent = ck.txt;
      const bar = box.querySelector(g ? '#gvbar' : '#gbar'); if (bar) bar.style.width = (ck.pr * 100) + '%';
      if (R[k].k === 'dist') (g ? [[S.only, g]] : S.groups.map((x, i) => [i, x])).forEach(([gi, gr]) => gr.eleves.forEach((e, ei) => { const x = cbX(e, k), l = box.querySelector(`[data-live="${gi}|${ei}"]`); if (l && x && x.dep && !x.arr) l.textContent = cmss((now - x.dep) / 1000) === '–' ? '0:00' : cmss((now - x.dep) / 1000); }));
    };
    const tick = () => { if (!box.isConnected || !DB.combine.current || DB.combine.current !== S) return clearInterval(iv);
      const now = Date.now(); let ch = adv(S, now); S.groups.forEach(g => { if (g.tl) ch = adv(g, now) || ch; });
      if (ch || dirty) { const a = document.activeElement; if (a && box.contains(a) && /INPUT|SELECT|TEXTAREA/.test(a.tagName)) { dirty = true; paint(now); return; } dirty = false; redraw(); return; }
      paint(now); };
    const t0 = Date.now(); adv(S, t0); S.groups.forEach(g => { if (g.tl) adv(g, t0); });
    draw(); clearInterval(window._cbTick); iv = window._cbTick = setInterval(tick, 500); tick();
  }

  /* ================= 3. BILAN (cumuls) ================= */
  function bilan(box) {
    const L = DB.combine.seances;
    if (!L.length) { box.innerHTML = '<div class="card empty">Aucune épreuve enregistrée pour l\'instant.</div>'; return; }
    const classes = [...new Set(L.map(s => s.classe))]; let cls = classes.includes(DB.lastClass) ? DB.lastClass : classes[0];
    const draw = () => {
      const ss = L.filter(s => s.classe === cls), M = merged(ss), A = {};
      let anyPj = false, anySG = false, anyLG = false;
      ss.forEach(s => s.groups.forEach(g => g.eleves.forEach(e => { const r = cbRes(s.cfg, e), a = A[e.nom] = A[e.nom] || { n: 0, d: 0, t: 0, s: 0, sb: 0, l: 0, lb: 0, ec: [], sg: [], lg: [] };
        a.n++; a.d += r.d; a.t += r.t || 0; a.s += r.sSum; a.sb = Math.max(a.sb, r.sBest); a.l += r.lSum; a.lb = Math.max(a.lb, r.lBest);
        if (r.tot.eAbs != null) { a.ec.push(r.tot.eAbs); anyPj = true; } if (r.sEl.gainP != null) { a.sg.push(r.sEl); anySG = true; } if (r.lEl.gainP != null) { a.lg.push(r.lEl); anyLG = true; } })));
      const mean = (X, f) => X.reduce((x, y) => x + f(y), 0) / X.length;
      const gainCell = (X, u) => X.length ? `<span style="white-space:nowrap">${dfSign(mean(X, E => E.gain), a => dfFr(a, 2))} ${u}</span><br><small class="muted" style="white-space:nowrap">${dfPct(mean(X, E => E.gainP))}</small>` : '–';
      box.innerHTML = `<div class="card"><label style="margin-top:0">Classe</label><select id="bc">${classes.map(x => `<option ${x === cls ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
        <div class="section-title"><h2>Cumuls par élève (${M.length} épreuve${M.length > 1 ? 's' : ''})</h2><button class="link" id="exp">Exporter CSV</button></div>
        <div class="card sheet-table"><table><tr><th>Élève</th><th>Épreuves</th><th>Course : distance</th><th>Course : temps</th><th>Vitesse moy.</th>${anyPj ? '<th>Écart projet moy.</th>' : ''}<th>Sauts : cumul</th><th>Meilleur saut</th>${anySG ? '<th>Gain élan saut (moy.)</th>' : ''}<th>Lancers : cumul</th><th>Meilleur lancer</th>${anyLG ? '<th>Gain élan lancer (moy.)</th>' : ''}</tr>
          ${Object.entries(A).sort((a, b) => a[0].localeCompare(b[0])).map(([n, a]) => `<tr><td><b>${esc(n)}</b></td><td>${a.n}</td><td>${a.d ? dfFr(a.d, 0) + ' m' : '–'}</td><td>${cmss(a.t)}</td><td>${a.t && a.d ? n1(vit(a.d, a.t)) + ' km/h' : '–'}</td>${anyPj ? `<td>${a.ec.length ? `± ${dfFr(mean(a.ec, x => x) * 100, 1)} %` : '–'}</td>` : ''}<td>${a.s ? n1(a.s) + ' m' : '–'}</td><td>${a.sb ? n1(a.sb) + ' m' : '–'}</td>${anySG ? `<td>${gainCell(a.sg, 'm')}</td>` : ''}<td>${a.l ? n1(a.l) : '–'}</td><td>${a.lb ? n1(a.lb) : '–'}</td>${anyLG ? `<td>${gainCell(a.lg, '')}</td>` : ''}</tr>`).join('')}</table></div>
        <div class="section-title"><h2>Épreuves</h2></div>
        <div class="card" style="padding:0">${M.slice().reverse().map(m => { const c = m.cfg, grp = c.orga === 'grp', RN = cbRuns(c), N = RN.length, i = M.indexOf(m), tol = c.tol || 5;
          const RR = m.groups.flatMap(g => g.eleves.map(e => ({ g, e, r: cbRes(c, e) }))), cmp = cbRankCmp(c); RR.sort((a, b) => cmp(a.r, b.r));
          const hasPj = RR.some(x => x.r.tot.runs.some(y => y.pv)), sD = hasSaut(c) && c.sElan === 'deux', lD = c.lElan === 'deux', allM = RN.every(r => r.k === 'dist'), allD = RN.every(r => r.k === 'duree');
          const runCell = y => y.done ? `<td><b>${y.run.k === 'dist' ? dfT(y.t) : dfFr(y.dist, 0) + ' m'}</b><small>${dfFr(y.v)} km/h${y.pv ? ` · projet ${cbPjShort(y.pv, y.run)}` : ''}</small>${y.ev != null ? `<small>${cbEcTxt(y, c, false)}</small>` : ''}</td>` : `<td class="muted">–${y.pv ? `<small>projet ${cbPjShort(y.pv, y.run)}</small>` : ''}</td>`;
          const courseCell = r => { const T = r.tot; if (!T.n) return '–'; return N === 1 ? (allM ? cmss(T.t) : dfFr(T.dist, 0) + ' m') : `${allM ? dfT(T.t) : dfFr(T.dist, 0) + ' m'}${allD || allM ? '' : ' · ' + dfT(T.t)}${T.n < N ? ` <small>${T.n}/${N} courses</small>` : ''}`; };
          return `<div class="list-item" style="flex-wrap:wrap"><div style="flex:1"><b>${new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} · ${esc(m.classe)} · ${m.groups.length} ${grp ? 'groupe' : 'élève'}${m.groups.length > 1 ? 's' : ''}${m.recs.length > 1 ? ` (${m.recs.length} tablettes)` : ''}</b><div class="muted">${hasSaut(c) ? 'Triathlon' : 'Duathlon'} · ${cbFmt(c)}${hasPj ? ` · 🎯 projets ± ${tol} %` : ''}${sD || lD ? ' · sans / avec élan' : ''}</div></div><button class="btn btn-ghost" data-cfg="bare" data-x="${i}">🗑</button>
            <details style="flex-basis:100%;min-width:0;max-width:100%;margin-top:6px"><summary class="muted" style="cursor:pointer">Classement (${RR.length} élève${RR.length > 1 ? 's' : ''})</summary><div class="sheet-table cb-tbl" style="margin-top:6px"><table><tr><th>#</th><th>Élève</th>${grp ? '<th>Groupe</th>' : ''}<th>Course</th><th>Vitesse</th>${hasPj ? '<th>Écart projet</th>' : ''}${N > 1 || hasPj ? RN.map((r, k) => `<th>C${k + 1} · ${cbRunLbl(r)}</th>`).join('') : ''}${hasSaut(c) ? (sD ? '<th>Saut sans élan</th><th>Saut avec élan</th><th>Gain élan (saut)</th>' : '<th>Meilleur saut</th>') : ''}${lD ? '<th>Lancer sans élan</th><th>Lancer avec élan</th><th>Gain élan (lancer)</th>' : '<th>Meilleur lancer</th>'}</tr>
              ${RR.map(({ g, e, r }, k) => `<tr><td>${k + 1}</td><td><b>${esc(e.nom)}</b></td>${grp ? `<td>${esc(g.name)}</td>` : ''}<td>${courseCell(r)}</td><td>${r.v ? n1(r.v) + ' km/h' : '–'}</td>
                ${hasPj ? `<td>${r.tot.ev != null ? `<b>${cbEcTxt(r.tot, c, false)}</b><small>vitesse ${dfSign(r.tot.pvA - r.tot.pv, a => dfFr(a, 1))} km/h</small>${N > 1 ? `<small>moy. ± ${dfFr(r.tot.eAbs * 100, 1)} %</small>` : ''}` : '<span class="muted">–</span>'}</td>` : ''}
                ${N > 1 || hasPj ? r.tot.runs.map(runCell).join('') : ''}
                ${hasSaut(c) ? (sD ? `<td>${r.sEl.sans ? n1(r.sEl.sans) + ' m' : '–'}</td><td>${r.sEl.avec ? n1(r.sEl.avec) + ' m' : '–'}</td><td>${cbGainTxt(r.sEl, 'm')}</td>` : `<td>${r.sBest ? n1(r.sBest) + ' m' : '–'}</td>`) : ''}
                ${lD ? `<td>${r.lEl.sans ? n1(r.lEl.sans) + ' ' + lUnit(c) : '–'}</td><td>${r.lEl.avec ? n1(r.lEl.avec) + ' ' + lUnit(c) : '–'}</td><td>${cbGainTxt(r.lEl, lUnit(c))}</td>` : `<td>${r.lBest ? n1(r.lBest) + ' ' + lUnit(c) : '–'}</td>`}</tr>`).join('')}</table></div>
              ${hasPj ? `<p class="df-help">Écart projet / réalisation : course en durée → écart en mètres ; course en distance → écart de temps (négatif = plus rapide que prévu). Vert ≤ ${tol} %, orange ≤ ${2 * tol} %, rouge au-delà.</p>` : ''}${sD || lD ? '<p class="df-help">Gain de l\'élan = meilleur essai avec élan − meilleur essai sans élan (en % du sans élan).</p>' : ''}</details></div>`; }).join('')}</div>`;
      const $ = s => box.querySelector(s);
      $('#bc').onchange = () => { cls = $('#bc').value; draw(); };
      box.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { const m = M[+b.dataset.x];
        if (confirm(`Supprimer cette épreuve${m.recs.length > 1 ? ` (${m.recs.length} enregistrements de tablettes)` : ''} ?`)) { m.recs.forEach(r => { const k = L.indexOf(r); if (k >= 0) L.splice(k, 1); }); save(); bilan(box); } });
      $('#exp').onclick = () => download(`combine-athletique-${cls}.csv`, csv(csvRows(ss)));
    };
    draw();
  }
  function csvRows(ss) {
    const f = (x, d = 1) => x == null || !isFinite(x) ? '' : (+x).toFixed(d).replace('.', ','), sf = (x, d = 1) => x == null || !isFinite(x) ? '' : (x > 0 ? '+' : '') + f(x, d);
    const NX = Math.max(1, ...ss.map(s => cbRuns(s.cfg).length));
    const head = ['Date', 'Format', 'Course', 'Groupe', 'Élève', 'Course (m)', 'Temps course', 'Vitesse (km/h)', 'Tours', 'Plots'];
    for (let k = 1; k <= NX; k++) head.push(`C${k} consigne`, `C${k} distance (m)`, `C${k} temps`, `C${k} vitesse (km/h)`, `C${k} projet (km/h)`, `C${k} projet (distance ou temps)`, `C${k} écart (m ou temps)`, `C${k} écart (%)`, `C${k} écart vitesse (km/h)`);
    head.push('Écart projet total (m ou temps)', 'Écart projet total (%)', 'Écart vitesse total (km/h)', 'Écart moyen par course (± %)', 'Tolérance (± %)',
      'Élan saut', 'Sauts', 'Meilleur saut', 'Cumul sauts', 'Sauts avec élan', 'Meilleur saut sans élan', 'Meilleur saut avec élan', 'Gain élan saut (m)', 'Gain élan saut (%)',
      'Élan lancer', 'Lancers', 'Meilleur lancer', 'Cumul lancers', 'Lancers avec élan', 'Meilleur lancer sans élan', 'Meilleur lancer avec élan', 'Gain élan lancer', 'Gain élan lancer (%)');
    return [head, ...ss.flatMap(s => s.groups.flatMap(g => g.eleves.map(e => { const c = s.cfg, r = cbRes(c, e), T = r.tot, sD = c.sElan === 'deux', lD = c.lElan === 'deux';
      const row = [new Date(s.date).toLocaleDateString('fr-FR'), c.format, cbFmt(c), c.orga === 'grp' ? g.name : '', e.nom, r.d || '', cmss(r.t), r.v ? n1(r.v) : '',
        T.runs.reduce((a, y) => a + (y.x.tours || 0), 0), T.runs.reduce((a, y) => a + (y.x.plots || 0), 0)];
      for (let k = 0; k < NX; k++) { const y = T.runs[k];
        if (!y) { row.push('', '', '', '', '', '', '', '', ''); continue; }
        row.push(cbRunLbl(y.run), y.done ? Math.round(y.dist) : '', y.done ? dfT(y.t) : '', y.done ? f(y.v) : '', y.pv ? f(y.pv) : '', y.pv ? (y.run.k === 'duree' ? Math.round(y.pv / 3.6 * y.run.d) + ' m' : dfT(y.run.m / (y.pv / 3.6))) : '',
          y.et != null ? dfSign(y.et, a => dfT(a)) : y.ed != null ? sf(y.ed, 0) + ' m' : '', y.etp != null ? sf(y.etp * 100) : y.edp != null ? sf(y.edp * 100) : '', y.ev != null ? sf(y.v - y.pv) : ''); }
      row.push(T.et != null ? dfSign(T.et, a => dfT(a)) : T.ed != null ? sf(T.ed, 0) + ' m' : '', T.ev != null ? sf((T.etp ?? T.edp ?? T.ev) * 100) : '', T.ev != null ? sf(T.pvA - T.pv) : '', T.eAbs != null ? f(T.eAbs * 100) : '', T.ev != null ? c.tol || 5 : '');
      row.push(hasSaut(c) ? c.sElan : '', hasSaut(c) ? (e.sauts || []).join(' / ') : '', r.sBest ? n1(r.sBest) : '', r.sSum ? n1(r.sSum) : '', sD ? (e.sautsA || []).join(' / ') : '', sD && r.sEl.sans ? n1(r.sEl.sans) : '', sD && r.sEl.avec ? n1(r.sEl.avec) : '', sD ? sf(r.sEl.gain, 2) : '', sD && r.sEl.gainP != null ? sf(r.sEl.gainP * 100) : '');
      row.push(c.lElan, (e.lancers || []).join(' / '), r.lBest ? n1(r.lBest) : '', r.lSum ? n1(r.lSum) : '', lD ? (e.lancersA || []).join(' / ') : '', lD && r.lEl.sans ? n1(r.lEl.sans) : '', lD && r.lEl.avec ? n1(r.lEl.avec) : '', lD ? sf(r.lEl.gain, 2) : '', lD && r.lEl.gainP != null ? sf(r.lEl.gainP * 100) : '');
      return row; })))];
  }

  frame();
  return () => clearInterval(window._cbTick);
};
