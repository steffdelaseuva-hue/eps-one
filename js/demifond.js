/* =========================================================
   EPS ONE — Outil « Demi-fond »
   Enchaînement de courses (durée et/ou distance) + repos ·
   individuel / duo / trio / quatuor (relais, course en groupe,
   coureur-observateur) · projet de course · équivalences
   vitesse ↔ distance ↔ durée ↔ plots · % VMA · marche rapide ·
   saisie en direct (plots, tours, arrêts, arrivées, bips) ·
   écart projet / réalisation · historique · CSV · Résultats.
   ========================================================= */
DB.demifond = DB.demifond || { seances: [], current: null };
ICONS.demifond = '<circle cx="14.5" cy="3.8" r="1.9"/><path d="M13.5 7 10.5 12l3.2 2-1.4 4.5M10.5 12 7 11.2M13.5 7l2.8 2.8 3 .4"/><path d="M2 21.5h20"/><path d="M3.5 21.5 5 17l1.5 4.5M17.5 21.5 19 17l1.5 4.5"/><path d="M8.5 19h1.5M12 19h1.5" stroke-dasharray="1.5 1.5"/>';

if (!document.getElementById('df-css')) document.head.insertAdjacentHTML('beforeend', `<style id="df-css">
.df-tabs button{padding:8px 2px;line-height:1.15;font-size:.78rem;min-width:0}
.df-tabs button span{display:block;font-size:1.05rem}
.df-run{display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:8px 0;border-top:1px solid var(--line)}
.df-run input{width:84px;padding:8px;text-align:center}
.df-run .tog{margin:0}
.df-rest{padding-left:14px;background:var(--grad-soft);border-radius:10px;border-top:none;margin:2px 0}
.df-eq{font-size:.78rem;color:var(--muted);margin-top:3px;line-height:1.35}
.df-eq small{display:block}
.df-help{font-size:.78rem;color:var(--muted);margin:6px 0 0;line-height:1.4}
.df-ph{border-radius:18px;color:#fff;padding:12px 14px;text-align:center;transition:background .3s}
.df-ph.work{background:linear-gradient(135deg,#D4AF37,#A67C1A)}
.df-ph.rest{background:linear-gradient(135deg,#3C7BE0,#0B2A5B)}
.df-ph.idle{background:#6E7A93}
.df-ph.end{background:#1B9E5A}
.df-ph .lb{font-weight:800;letter-spacing:.4px;text-transform:uppercase;font-size:.85rem;opacity:.95}
.df-ph .big{font-size:clamp(2.8rem,15vw,5.2rem);font-weight:900;font-variant-numeric:tabular-nums;line-height:1.05}
.df-ph .sub{font-weight:700;font-size:.85rem;opacity:.95}
.df-ph .bar{height:8px;border-radius:99px;background:rgba(255,255,255,.3);overflow:hidden;margin-top:8px}
.df-ph .bar i{display:block;height:100%;background:#fff;width:0}
.df-ph.flash{animation:dfflash .6s 2}
@keyframes dfflash{50%{filter:brightness(1.6)}}
.df-tl{display:flex;gap:4px;overflow-x:auto;margin-top:10px;padding-bottom:3px}
.df-tl button,.df-tl span{flex:0 0 auto;padding:6px 9px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.76rem;color:var(--text)}
.df-tl span{border-style:dashed;color:var(--muted);font-weight:600}
.df-tl .cur{border-color:#2F6BD8;box-shadow:inset 0 0 0 1px #2F6BD8}
.df-tl .done{background:var(--grad-soft)}
.df-tl .vw{outline:3px solid var(--gold);outline-offset:-1px}
.df-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:10px;margin-top:10px}
.df-c{border:2px solid var(--line);border-radius:16px;padding:10px;background:var(--card);text-align:center;min-width:0}
.df-c.arr{border-color:var(--ok)}
.df-c.mr{border-style:dashed;border-color:#8E5BD8}
.df-c .nm{font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.df-c .gn{font-size:.7rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.df-c .d{font-size:1.45rem;font-weight:900;font-variant-numeric:tabular-nums;margin-top:2px}
.df-c .btns{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
.df-c .btns .btn{padding:12px 4px;font-size:.88rem;min-width:0}
.df-c .btns .plot{grid-column:1/-1;padding:16px 4px;font-size:1.1rem}
.df-c .btns .btn:disabled{opacity:.35}
.df-c .adj{display:flex;gap:4px;margin-top:6px}
.df-c .adj button{flex:1;padding:7px 0;border-radius:9px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.76rem;min-width:0;color:var(--text)}
.df-c .st{font-size:.8rem;font-weight:800;margin-top:2px}
.df-gh{margin:14px 2px 0;font-weight:900}
.df-mr{display:inline-block;padding:1px 7px;border-radius:99px;background:#8E5BD8;color:#fff;font-size:.68rem;font-weight:800;vertical-align:1px;white-space:nowrap}
.df-ok{color:var(--ok);font-weight:800}.df-mid{color:#C77C00;font-weight:800}.df-ko{color:var(--danger);font-weight:800}
.df-mem{display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);font-weight:700;font-size:.85rem;margin:3px 3px 0 0;color:var(--text)}
.df-mem.on{border-color:#8E5BD8;background:rgba(142,91,216,.14)}
.df-pj{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px;margin-top:8px}
.df-pj .it{border:1px solid var(--line);border-radius:12px;padding:8px}
.df-pj .it input{width:100%;padding:8px;text-align:center;font-weight:800}
.df-pj .it .w{font-size:.75rem;font-weight:700;color:var(--danger);margin-top:2px}
.df-tbl td,.df-tbl th{font-size:.8rem;padding:6px 7px;vertical-align:top;white-space:nowrap}
.df-tbl td small{display:block;color:var(--muted);font-size:.7rem}
.df-tbl td .ec{font-size:.72rem}
.df-c .btns .btn:last-child:nth-child(even){grid-column:1/-1}
.df-obs .df-grid{grid-template-columns:1fr}
.df-obs .df-c .btns .btn{padding:18px 6px;font-size:1.15rem}
.df-obs .df-c .btns .plot{padding:26px 6px;font-size:1.5rem}
.df-obs .df-c .d{font-size:2.4rem}
.df-obs .df-c .nm{font-size:1.25rem}
.df-calc .out{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:12px}
.df-calc .out div{border:1px solid var(--line);border-radius:12px;padding:8px;text-align:center}
.df-calc .out b{display:block;font-size:1.2rem}
.df-calc .out small{color:var(--muted);font-size:.72rem}
</style>`);

/* ---------- Petits utilitaires ---------- */
const dfDB = () => { const D = DB.demifond = DB.demifond || {}; D.seances = D.seances || []; if (D.current === undefined) D.current = null; return D; };
const dfFr = (n, d = 1) => n == null || !isFinite(n) ? '–' : (+n).toLocaleString('fr-FR', { maximumFractionDigits: d });
const dfT = s => { if (s == null || !isFinite(s)) return '–'; s = Math.round(s); const neg = s < 0 ? '−' : ''; s = Math.abs(s); return neg + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const dfDur = s => s < 60 ? `${s} s` : s % 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')}` : `${s / 60} min`;
// « 3:20 », « 3'20 », « 3 min 20 », « 200 » (s), « 45 s », « 3 min » → secondes
function dfParseT(v) {
  v = String(v ?? '').trim().toLowerCase().replace(',', '.'); if (!v) return null;
  let m = v.match(/^(\d+)\s*(?::|'|’|min|mn|m)\s*(\d{1,2})?\s*(?:s|")?$/); if (m) return (+m[1]) * 60 + (+m[2] || 0);
  m = v.match(/^(\d+(?:\.\d+)?)\s*(?:s|sec|")?$/); if (m) return Math.round(+m[1]);
  return null;
}
const dfNum = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : null; };
const dfSign = (x, f) => (x > 0 ? '+' : x < 0 ? '−' : '±') + f(Math.abs(x));
const dfPct = e => e == null ? '–' : dfSign(e * 100, a => dfFr(a, 1)) + ' %';
const dfClone = o => JSON.parse(JSON.stringify(o));

/* ---------- Plots, tours et équivalences ---------- */
const dfPlots = (m, c) => { const sp = c.plot || 25, n = Math.floor(m / sp + 1e-6); return { n, r: Math.round(m - n * sp), sp }; };
function dfPlotTxt(m, c) {
  const p = dfPlots(m, c); let t = `${p.n} plot${p.n > 1 ? 's' : ''} de ${p.sp} m (+${p.r} m)`;
  if (c.piste) { const k = Math.floor(m / c.piste + 1e-6), r = Math.round(m - k * c.piste); t += ` · ${k} tour${k > 1 ? 's' : ''} de ${c.piste} m${r ? ` + ${r} m` : ''}`; }
  return t;
}
const dfRunLbl = r => r.k === 'duree' ? dfDur(r.d) : `${dfFr(r.m, 0)} m`;
/* Équivalence d'une vitesse (km/h) sur une course : distance ou durée + plots + allure + % VMA
   ex. « 10 km/h pendant 3 min → 500 m → 20 plots de 25 m (+0 m) » */
function dfEq(v, run, c, vma, short) {
  if (!v || v <= 0) return '';
  const ms = v / 3.6, sp = c.plot || 25;
  const head = run.k === 'duree'
    ? `${dfFr(v)} km/h pendant ${dfDur(run.d)} → <b>${dfFr(ms * run.d, 0)} m</b> → ${dfPlotTxt(ms * run.d, c)}`
    : `${dfFr(v)} km/h sur ${dfFr(run.m, 0)} m → <b>${dfT(run.m / ms)}</b> → ${dfPlotTxt(run.m, c)}`;
  return head + (short ? '' : ` · ${dfFr(sp / ms, 1)} s par plot · ${dfT(1000 / ms)} /km`) + (vma ? ` · <b>${Math.round(v / vma * 100)} % VMA</b>` : '');
}
const dfFormat = c => {
  const R = c.runs, same = R.every(r => r.k === R[0].k && (r.k === 'duree' ? r.d === R[0].d : r.m === R[0].m)), rs = c.rests.slice(0, R.length - 1), sameR = rs.every(x => x.d === (rs[0] || {}).d);
  if (same && sameR) return `${R.length > 1 ? R.length + ' × ' : ''}${dfRunLbl(R[0])}${rs.length && rs[0].d ? ` · R ${dfDur(rs[0].d)}` : ''}`;
  return R.map((r, k) => dfRunLbl(r) + (k < R.length - 1 && c.rests[k].d ? ` · R ${dfDur(c.rests[k].d)}` : '')).join(' · ');
};

/* ---------- Configuration de l'épreuve ---------- */
const dfDefCfg = () => ({ runs: [0, 1, 2].map(() => ({ k: 'duree', d: 180, m: 500 })), rests: [{ d: 60, actif: false }, { d: 60, actif: false }],
  plot: 25, piste: 0, refV: 10, tol: 5, arrets: 0, arretsMR: -1, grp: 1, org: 'vagues', grpRes: 'lent', projMode: 'run',
  bip: { mode: 'off', n: 30, v: 10 }, mrMin: 5, mrMax: 8, pct: 85 });
function dfNorm(c) {
  const d = dfDefCfg(); Object.keys(d).forEach(k => { if (c[k] == null) c[k] = dfClone(d[k]); });
  if (!c.runs.length) c.runs.push({ k: 'duree', d: 180, m: 500 });
  while (c.rests.length < c.runs.length - 1) c.rests.push({ d: (c.rests[c.rests.length - 1] || { d: 60 }).d, actif: false });
  c.rests.length = Math.max(0, c.runs.length - 1);
  return c;
}
const dfMk = (k, v, n, rest) => ({ runs: Array.from({ length: n }, () => ({ k, d: k === 'duree' ? v : 180, m: k === 'dist' ? v : 500 })), rests: Array.from({ length: n - 1 }, () => ({ d: rest, actif: false })) });
const dfMix = (durs, rest) => ({ runs: durs.map(d => ({ k: 'duree', d, m: 500 })), rests: durs.slice(1).map(() => ({ d: rest, actif: false })) });
const DF_PRESETS = [
  ['9 min + 3 min · R 2 min', () => dfMix([540, 180], 120)], ['6 min + 3 min · R 2 min', () => dfMix([360, 180], 120)],
  ['4 × 3 min · R 1 min', () => dfMk('duree', 180, 4, 60)], ['3 × 500 m · R 2 min', () => dfMk('dist', 500, 3, 120)],
  ['2 × 800 m · R 3 min', () => dfMk('dist', 800, 2, 180)]];
const DF_ORG = {
  vagues: ['👀 Coureur / observateur', 'Chaque membre fait tout l\'enchaînement à son tour (vague 1, vague 2…) pendant que son partenaire l\'observe et compte ses plots.'],
  relais: ['🔁 Relais', 'Les membres se relaient : une course chacun à tour de rôle (choix du coureur de chaque course dans l\'onglet Épreuve). Le nombre de courses = nombre de relais.'],
  groupe: ['👥 Course en groupe', 'Tous les membres courent ensemble chaque course. Chaque élève est compté ; le résultat du groupe est celui du plus lent (le groupe « arrive ensemble ») ou la moyenne des membres.'] };

/* ---------- Participants, projets, résultats ---------- */
const dfNV = C => C.cfg.grp > 1 && C.cfg.org === 'vagues' ? Math.max(1, ...C.groups.map(g => g.members.length)) : 1;
const dfRelay = (g, k) => { const r = g.relay && g.relay[k]; return r != null && r < g.members.length ? r : k % Math.max(1, g.members.length); };
function dfRunners(C, g, k, w) {
  const c = C.cfg; if (!g.members.length) return [];
  if (c.grp === 1 || c.org === 'groupe') return w ? [] : [...g.members];
  if (c.org === 'relais') return w ? [] : [g.members[dfRelay(g, k)]];
  return g.members[w] ? [g.members[w]] : [];
}
const dfRunsOf = (C, g, n) => C.cfg.runs.map((r, k) => k).filter(k => { for (let w = 0; w < dfNV(C); w++) if (dfRunners(C, g, k, w).includes(n)) return true; return false; });
const dfVagueOf = (C, g, n) => C.cfg.grp > 1 && C.cfg.org === 'vagues' ? Math.max(0, g.members.indexOf(n)) : 0;
const dfPKey = (C, n) => C.cfg.grp > 1 && C.cfg.org === 'groupe' ? '_g' : n;
function dfProj(C, g, key, k) { const P = g.proj && g.proj[key]; if (!P) return null; const v = C.cfg.projMode === 'global' ? P.g : P[k]; return v > 0 ? v : null; }
function dfVma(C, n) {
  if (C.vma && C.vma[n] != null) return C.vma[n];
  const K = ((DB.duathlon || {}).vma || {})[C.classe] || {}; return K[n] ? K[n].v : null;
}
function dfClassVma(cls) { if (!cls) return {}; try { if (typeof duaVmaSync === 'function') return duaVmaSync(cls); } catch (e) {} return ((DB.duathlon || {}).vma || {})[cls] || {}; }
const dfX = (g, n, k, make) => { g.res = g.res || {}; const R = g.res[n] = g.res[n] || (make ? {} : null); if (!R) return null;
  if (!R[k] && make) R[k] = { p: 0, tr: 0, adj: 0, st: 0, arr: false, t: null, fin: false }; return R[k] || null; };
const dfRaw = (x, c) => Math.max(0, x.p * (c.plot || 25) + x.tr * (c.piste || 0) + (x.adj || 0));
const dfAllowed = (c, mr) => mr && c.arretsMR != null && c.arretsMR !== -2 ? (c.arretsMR < 0 ? null : c.arretsMR) : (c.arrets < 0 ? null : c.arrets);
// Évalue une réalisation (distance m, temps s) face au projet (vitesse km/h)
function dfEval(c, run, dist, t, pv, arr) {
  const v = t > 0 ? dist / t * 3.6 : null, R = { dist, t, v, pv, arr };
  if (pv && v != null) {
    R.ev = (v - pv) / pv;                                   // écart de vitesse (référence pour la tolérance)
    if (run.k === 'duree') { R.pd = pv / 3.6 * run.d; R.ed = dist - R.pd; R.edp = R.ed / R.pd; }
    else if (arr) { R.pt = run.m / (pv / 3.6); R.et = t - R.pt; R.etp = R.et / R.pt; }
    else { R.pt = run.m / (pv / 3.6); R.pd = pv / 3.6 * t; R.ed = dist - R.pd; R.edp = R.ed / R.pd; }
  }
  return R;
}
// Résultat d'un élève sur une course (null si la course n'est pas terminée pour lui)
function dfRR(C, g, n, k) {
  const c = C.cfg, run = c.runs[k], x = dfX(g, n, k); if (!run || !x || !(x.fin || x.arr)) return null;
  let dist, t; const raw = dfRaw(x, c);
  if (run.k === 'duree') { dist = raw; t = run.d; } else if (x.arr) { dist = run.m; t = x.t; } else { dist = Math.min(raw, run.m); t = x.t; }
  const mr = !!(g.mr && g.mr[n]), vma = dfVma(C, n), R = dfEval(c, run, dist, t, dfProj(C, g, dfPKey(C, n), k), run.k !== 'dist' || x.arr);
  R.partial = run.k === 'dist' && !x.arr; R.st = x.st || 0; R.allowed = dfAllowed(c, mr); R.over = R.allowed != null && R.st > R.allowed;
  R.mr = mr; R.vma = vma; R.pVma = R.v && vma ? R.v / vma : null; R.k = k; R.n = n; return R;
}
function dfSum(L, vma) {
  L = L.filter(Boolean); if (!L.length) return null;
  const dist = L.reduce((a, r) => a + r.dist, 0), t = L.reduce((a, r) => a + (r.t || 0), 0), E = L.filter(r => r.ev != null);
  const S = { runs: L, n: L.length, dist, t, v: t > 0 ? dist / t * 3.6 : null, st: L.reduce((a, r) => a + (r.st || 0), 0), over: L.filter(r => r.over).length,
    eAbs: E.length ? E.reduce((a, r) => a + Math.abs(r.ev), 0) / E.length : null, eMoy: E.length ? E.reduce((a, r) => a + r.ev, 0) / E.length : null, partial: L.some(r => r.partial) };
  S.vma = vma; S.pVma = S.v && vma ? S.v / vma : null; return S;
}
const dfMember = (C, g, n) => dfSum(dfRunsOf(C, g, n).map(k => dfRR(C, g, n, k)), dfVma(C, n));
const dfMeanVma = (C, g) => { const V = g.members.map(n => dfVma(C, n)).filter(v => v != null); return V.length === g.members.length && V.length ? V.reduce((a, v) => a + v, 0) / V.length : null; };
// Résultat d'un groupe sur une course (relais : le relayeur · groupe : le plus lent ou la moyenne)
function dfGR(C, g, k) {
  const c = C.cfg, run = c.runs[k];
  if (c.org === 'relais') { const n = g.members[dfRelay(g, k)]; return n ? dfRR(C, g, n, k) : null; }
  const L = g.members.map(n => dfRR(C, g, n, k)); if (!L.length || L.some(r => !r)) return null;
  const pv = dfProj(C, g, '_g', k); let R;
  if (c.grpRes === 'moy') { const d = L.reduce((a, r) => a + r.dist, 0) / L.length, t = L.reduce((a, r) => a + r.t, 0) / L.length; R = dfEval(c, run, d, t, pv, L.every(r => !r.partial)); }
  else { const s = L.slice().sort((a, b) => (a.v || 0) - (b.v || 0))[0]; R = dfEval(c, run, s.dist, s.t, pv, !s.partial); R.who = s.n; }
  R.partial = L.some(r => r.partial); R.st = L.reduce((a, r) => a + r.st, 0); R.over = L.some(r => r.over); R.k = k; return R;
}
function dfGroup(C, g) {
  const c = C.cfg;
  if (c.grp === 1) return dfMember(C, g, g.members[0]);
  if (c.org === 'vagues') { const S = dfSum(g.members.flatMap(n => dfRunsOf(C, g, n).map(k => dfRR(C, g, n, k))), dfMeanVma(C, g)); return S; }
  return dfSum(c.runs.map((r, k) => dfGR(C, g, k)), dfMeanVma(C, g));
}
const dfCls = (e, c) => e == null ? '' : Math.abs(e) * 100 <= c.tol ? 'df-ok' : Math.abs(e) * 100 <= 2 * c.tol ? 'df-mid' : 'df-ko';
// Texte de l'écart dans l'unité naturelle de la course (distance pour une durée, temps pour une distance)
function dfEcTxt(R, c) {
  if (!R || R.ev == null) return '<small class="muted">pas de projet</small>';
  const nat = R.et != null ? `${dfSign(R.et, a => dfT(a))} (${dfPct(R.etp)})` : R.ed != null ? `${dfSign(R.ed, a => dfFr(a, 0))} m (${dfPct(R.edp)})` : '';
  return `<span class="${dfCls(R.ev, c)}">${nat}</span><small>vitesse ${dfSign(R.v - R.pv, a => dfFr(a, 1))} km/h (${dfPct(R.ev)})</small>`;
}
const dfPhases = c => { const P = []; c.runs.forEach((r, k) => { P.push({ r: k }); if (k < c.runs.length - 1 && c.rests[k] && c.rests[k].d > 0) P.push({ rest: k }); }); return P; };
const dfPhDur = (c, ph) => ph.rest != null ? c.rests[ph.rest].d : c.runs[ph.r].k === 'duree' ? c.runs[ph.r].d : null;

/* =========================================================
   L'OUTIL
   ========================================================= */
/* Projets : un élève (ou groupe) à la fois, avec sélecteur ◀ liste ▶ (au lieu d'une longue liste) */
const dfPjSel = {};
function dfPjPick(tool, parts, card, ok) {
  if (!parts.length) return '';
  const i = Math.max(0, Math.min(dfPjSel[tool] || 0, parts.length - 1)); dfPjSel[tool] = i; const P = parts[i];
  return `<div class="card" style="margin-top:10px"><label style="margin-top:0">${parts.length > 1 ? `Projet de · ${i + 1}/${parts.length}` : 'Projet de'}</label>
    <div class="row" style="align-items:center;gap:6px"><button class="btn btn-ghost" style="flex:0 0 52px" data-pjnav="-1" aria-label="Précédent">◀</button>
      <select data-pjsel style="flex:1">${parts.map((x, k) => `<option value="${k}" ${k === i ? 'selected' : ''}>${ok && ok(x) ? '✅ ' : ''}${esc(x.label)}${x.sub ? ' · ' + esc(x.sub) : ''}</option>`).join('')}</select>
      <button class="btn btn-ghost" style="flex:0 0 52px" data-pjnav="1" aria-label="Suivant">▶</button></div></div>
    ${card(P)}${i < parts.length - 1 ? `<button class="btn btn-grad btn-block" style="margin-top:10px" data-pjnav="1">Suivant : ${esc(parts[i + 1].label)} ▶</button>` : ''}`;
}
function dfPjWire(box, tool, parts, redraw) {
  const go = k => { dfPjSel[tool] = ((k % parts.length) + parts.length) % parts.length; redraw(); };
  box.querySelectorAll('[data-pjnav]').forEach(b => b.onclick = () => go((dfPjSel[tool] || 0) + +b.dataset.pjnav));
  const s = box.querySelector('[data-pjsel]'); if (s) s.onchange = () => go(+s.value);
}

TOOL_IMPL.demifond = function (el) {
  const D = liveDB(dfDB);   // toujours l'objet synchronisé actuel
  let tab = D.current ? 'live' : 'prep', rk = 'ecart', iv = null, lastSig = '', unit = 'nat';
  const cur = () => dfDB().current;
  const started = C => C && C.live && (C.live.st !== 'idle' || C.live.w > 0 || C.groups.some(g => g.res && Object.keys(g.res).length));

  function frame() {
    el.innerHTML = `<div class="co-tabs df-tabs">${[['prep', '⚙️', 'Épreuve'], ['projet', '🎯', 'Projets'], ['live', '⏱', 'Course'], ['res', '📊', 'Résultats'], ['calc', '🧮', 'Calculette']].map(([k, i, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}"><span>${i}</span>${l}</button>`).join('')}</div><div id="df-body"></div>`;
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; frame(); });
    const box = el.querySelector('#df-body'), C = cur();
    if (tab === 'calc') return calc(box);
    if (tab === 'res') return results(box);
    if (tab === 'prep') return C ? prepCur(box, C) : prepNew(box);
    if (!C) { box.innerHTML = `<div class="card empty">Préparez d'abord l'épreuve et les groupes dans l'onglet <b>⚙️ Épreuve</b>.<br><br><button class="btn btn-grad" id="gop">⚙️ Préparer l'épreuve</button></div>`; box.querySelector('#gop').onclick = () => { tab = 'prep'; frame(); }; return; }
    if (tab === 'projet') return projets(box, C);
    live(box, C);
  }
  const tabsVisible = on => { const tb = el.querySelector('.co-tabs'); if (tb) tb.style.display = on ? '' : 'none'; };

  /* ---------- Formulaire de configuration (lié à un objet cfg) ---------- */
  function cfgForm(host, c, onChange, locked) {
    dfNorm(c);
    const tog = (attr, list, val) => `<div class="tog">${list.map(([v, l]) => `<button data-${attr}="${v}" class="${String(val) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    const refRun = r => dfEq(c.refV, r, c, null, true);
    host.innerHTML = `<div class="card" data-cfg><h3 style="margin-top:0">🏃 Format de l'épreuve</h3>
        ${locked ? '<p class="muted" style="margin:0 0 8px">🔒 Épreuve commencée : le format n\'est plus modifiable (les bips restent réglables dans l\'onglet Course).</p>' : ''}
        <label style="margin-top:0">Formats rapides</label><div class="tog" id="pre">${DF_PRESETS.map(([l], i) => `<button data-pre="${i}">${l}</button>`).join('')}</div>
        <label>Enchaînement de courses (${c.runs.length})</label>
        <div id="runs">${c.runs.map((r, k) => `<div class="df-run"><b style="min-width:70px">Course ${k + 1}</b>
            ${tog('rk' + k, [['duree', '⏱ Durée'], ['dist', '📏 Distance']], r.k)}
            ${r.k === 'duree' ? `<input data-rd="${k}" value="${dfT(r.d)}" inputmode="numeric" aria-label="Durée course ${k + 1}"><span class="muted">min:s</span>` : `<input data-rm="${k}" type="number" min="15" step="5" value="${r.m}" aria-label="Distance course ${k + 1}"><span class="muted">m</span>`}
            ${c.runs.length > 1 ? `<button class="btn btn-ghost" data-rx="${k}" style="padding:6px 11px;margin-left:auto" aria-label="Supprimer la course">✕</button>` : ''}
            <div class="df-eq" style="flex-basis:100%">${refRun(r)}</div></div>
          ${k < c.runs.length - 1 ? `<div class="df-run df-rest">😮‍💨 <b>Repos ${k + 1}</b><input data-sd="${k}" value="${dfT(c.rests[k].d)}" inputmode="numeric" aria-label="Durée repos ${k + 1}"><span class="muted">min:s</span>${tog('sa' + k, [[0, 'Passif'], [1, 'Actif']], c.rests[k].actif ? 1 : 0)}</div>` : ''}`).join('')}</div>
        <div class="row" style="margin-top:8px"><button class="btn btn-ghost" id="add" ${c.runs.length >= 12 ? 'disabled' : ''}>＋ Ajouter une course</button>
          ${c.runs.length > 1 ? `<div style="display:flex;gap:6px;align-items:center;flex:1;min-width:210px"><span class="muted">Même repos partout</span><input id="allr" style="width:76px;padding:8px;text-align:center" value="${dfT(c.rests[0].d)}"><button class="btn btn-ghost" id="allrok" style="padding:8px 12px">OK</button></div>` : ''}</div>
        <p class="df-help">Durée : de 15 s à 20 min et plus (« 3:00 », « 45 s », « 12 min »). Distance : de 15 m à 1 000 m et plus. Repos à 0:00 = enchaînement direct. Équivalences calculées à <input id="refv" type="number" step="0.5" min="3" value="${c.refV}" style="width:64px;padding:4px;text-align:center;display:inline-block"> km/h (vitesse de référence).</p></div>

      <div class="card" data-cfg style="margin-top:12px"><h3 style="margin-top:0">📍 Plots et piste</h3>
        <label style="margin-top:0">Écart entre deux plots</label>${tog('plot', [[20, '20 m'], [25, '25 m'], [50, '50 m'], ['x', 'Autre']], [20, 25, 50].includes(c.plot) ? c.plot : 'x')}
        ${[20, 25, 50].includes(c.plot) ? '' : `<input id="plotx" type="number" min="5" step="1" value="${c.plot}" style="margin-top:6px;max-width:120px"> m`}
        <label>Tour de piste (facultatif)</label>${tog('piste', [[0, 'Aucun'], [150, '150 m'], [200, '200 m'], [250, '250 m'], [400, '400 m']], c.piste)}</div>

      <div class="card" data-cfg style="margin-top:12px"><h3 style="margin-top:0">👥 Groupement</h3>
        ${tog('grp', [[1, 'Individuel'], [2, 'Duo'], [3, 'Trio'], [4, 'Quatuor']], c.grp)}
        ${c.grp > 1 ? `<label>Organisation pendant l'épreuve</label>${tog('org', Object.entries(DF_ORG).map(([k, v]) => [k, v[0]]), c.org)}<p class="df-help">${DF_ORG[c.org][1]}</p>
          ${c.org === 'groupe' ? `<label>Résultat du groupe</label>${tog('gres', [['lent', '🐢 Le plus lent'], ['moy', '⚖️ La moyenne']], c.grpRes)}<p class="df-help">${c.grpRes === 'lent' ? 'Le groupe vaut son membre le plus lent : on apprend à courir ensemble, à l\'allure du plus faible.' : 'Moyenne des distances et des temps des membres : chacun contribue au résultat.'} Le projet est fixé par le groupe.</p>` : ''}` : ''}</div>

      <div class="card" data-cfg style="margin-top:12px"><h3 style="margin-top:0">🎯 Règles</h3>
        <label style="margin-top:0">Arrêts autorisés par course (marche / arrêt)</label>${tog('arr', [[0, '0'], [1, '1'], [2, '2'], [3, '3'], [-1, 'Illimité']], c.arrets)}
        <label>Tolérance « projet respecté » (± %)</label><input id="tol" type="number" min="1" max="30" step="1" value="${c.tol}" style="max-width:120px">
        <p class="df-help">Écart vert si ≤ ${c.tol} %, orange si ≤ ${2 * c.tol} %, rouge au-delà (écart de vitesse, équivalent à l'écart de distance sur une durée).</p>
        <label>🚶 Marche rapide (élèves à besoin particulier) : plage de vitesse</label>
        <div style="display:flex;gap:6px;align-items:center"><input id="mr1" type="number" step="0.5" min="2" value="${c.mrMin}" style="width:76px;text-align:center"> à <input id="mr2" type="number" step="0.5" min="2" value="${c.mrMax}" style="width:76px;text-align:center"> km/h</div>
        <label>Arrêts des élèves en marche rapide</label>${tog('amr', [[-2, 'Même règle'], [-1, 'Non comptés']], c.arretsMR === -1 ? -1 : -2)}
        <p class="df-help">Le statut « marche rapide » se donne élève par élève (onglet Épreuve, une fois les groupes formés) ; il apparaît en violet 🚶 pendant la course, dans les résultats et les exports.</p></div>`;
    const $ = s => host.querySelector(s), all = s => host.querySelectorAll(s), ch = () => { onChange(); };
    all('[data-pre]').forEach(b => b.onclick = () => { const p = DF_PRESETS[+b.dataset.pre][1](); c.runs = p.runs; c.rests = p.rests; ch(); });
    c.runs.forEach((r, k) => {
      all(`[data-rk${k}]`).forEach(b => b.onclick = () => { r.k = b.getAttribute('data-rk' + k); ch(); });
      all(`[data-sa${k}]`).forEach(b => b.onclick = () => { c.rests[k].actif = b.getAttribute('data-sa' + k) === '1'; ch(); });
    });
    all('[data-rd]').forEach(i => i.onchange = () => { const s = dfParseT(i.value); if (s == null) { toast('Durée non reconnue (ex. 3:00 ou 45 s)'); return ch(); } c.runs[+i.dataset.rd].d = Math.max(5, s); ch(); });
    all('[data-rm]').forEach(i => i.onchange = () => { const m = dfNum(i.value); c.runs[+i.dataset.rm].m = Math.max(10, Math.round(m || 500)); ch(); });
    all('[data-sd]').forEach(i => i.onchange = () => { const s = dfParseT(i.value); c.rests[+i.dataset.sd].d = Math.max(0, s || 0); ch(); });
    all('[data-rx]').forEach(b => b.onclick = () => { const k = +b.dataset.rx; c.runs.splice(k, 1); c.rests.splice(Math.min(k, c.rests.length - 1), 1); ch(); });
    $('#add').onclick = () => { const l = c.runs[c.runs.length - 1]; c.runs.push({ ...l }); c.rests.push({ d: (c.rests[c.rests.length - 1] || { d: 60 }).d, actif: false }); ch(); };
    if ($('#allrok')) $('#allrok').onclick = () => { const s = dfParseT($('#allr').value); if (s == null) return toast('Durée non reconnue'); c.rests.forEach(x => x.d = s); ch(); };
    $('#refv').onchange = () => { c.refV = Math.max(2, dfNum($('#refv').value) || 10); ch(); };
    all('[data-plot]').forEach(b => b.onclick = () => { const v = b.dataset.plot; c.plot = v === 'x' ? ([20, 25, 50].includes(c.plot) ? 30 : c.plot) : +v; ch(); });
    if ($('#plotx')) $('#plotx').onchange = () => { c.plot = Math.max(1, Math.round(dfNum($('#plotx').value) || 25)); ch(); };
    all('[data-piste]').forEach(b => b.onclick = () => { c.piste = +b.dataset.piste; ch(); });
    all('[data-grp]').forEach(b => b.onclick = () => { c.grp = +b.dataset.grp; ch(); });
    all('[data-org]').forEach(b => b.onclick = () => { c.org = b.dataset.org; ch(); });
    all('[data-gres]').forEach(b => b.onclick = () => { c.grpRes = b.dataset.gres; ch(); });
    all('[data-arr]').forEach(b => b.onclick = () => { c.arrets = +b.dataset.arr; ch(); });
    all('[data-amr]').forEach(b => b.onclick = () => { c.arretsMR = +b.dataset.amr; ch(); });
    $('#tol').onchange = () => { c.tol = Math.min(50, Math.max(1, dfNum($('#tol').value) || 5)); ch(); };
    $('#mr1').onchange = $('#mr2').onchange = () => { const a = dfNum($('#mr1').value) || 5, b = dfNum($('#mr2').value) || 8; c.mrMin = Math.min(a, b); c.mrMax = Math.max(a, b); ch(); };
    if (locked) all('input,button').forEach(x => x.disabled = true);
  }

  /* ---------- Préparation (pas encore de séance) ---------- */
  function prepNew(box) {
    const c = D.lastCfg = dfNorm(D.lastCfg || dfDefCfg());
    box.innerHTML = `<div class="card" data-cfg><label style="margin-top:0">Nom de la séance</label><input id="nm" value="Demi-fond ${new Date().toLocaleDateString('fr-FR')}"></div>
      <div id="cfg" style="margin-top:12px"></div>
      <div class="card" data-cfg style="margin-top:12px"><h3 style="margin-top:0" id="cmpt"></h3><div id="cmp"></div></div>`;
    const $ = s => box.querySelector(s);
    const syncCmp = () => {
      $('#cmpt').textContent = c.grp === 1 ? '🧑 Élèves (course individuelle)' : `👥 Former les ${['', '', 'duos', 'trios', 'quatuors'][c.grp]}`;
      if ($('#df-k')) { $('#df-k').value = 's'; $('#df-v').value = c.grp; const rw = $('#df-k').closest('.row'); if (rw) rw.style.display = c.grp === 1 ? 'none' : ''; }
      const sg = $('#df-seg'); if (sg) { sg.style.display = c.grp === 1 ? 'none' : ''; if (sg.previousElementSibling && sg.previousElementSibling.tagName === 'LABEL') sg.previousElementSibling.style.display = c.grp === 1 ? 'none' : ''; }
      const go = $('#df-go'); if (go) go.textContent = c.grp === 1 ? '▶ Valider les élèves de la classe' : '▶ Former les groupes';
    };
    const redraw = () => { save(); cfgForm($('#cfg'), c, redraw); syncCmp(); };
    cfgForm($('#cfg'), c, redraw);
    if (!DB.classes.length) { $('#cmp').innerHTML = noClassMsg; syncCmp(); return; }
    mountComposer($('#cmp'), { id: 'df', modes: ['random', 'hetero', 'homo'], button: '▶ Former les groupes', prep: false,
      onTeams: teams => {
        const cls = $('#df-cls') ? $('#df-cls').value : '', K = dfClassVma(cls), MR = ((D.mr = D.mr || {})[cls]) || {}, order = studentsOf(cls);
        let T = teams.filter(t => t.members.length);
        if (c.grp === 1) T = T.flatMap(t => t.members).sort((a, b) => order.indexOf(a.n) - order.indexOf(b.n)).map(m => ({ name: m.n, members: [m] }));
        const groups = T.map(t => { const members = t.members.map(m => m.n);
          return { name: c.grp === 1 ? members[0] : t.name.replace('Équipe', 'Groupe'), members, mr: Object.fromEntries(members.filter(n => MR[n]).map(n => [n, true])), relay: [], proj: {}, res: {} }; });
        const vma = {}; groups.forEach(g => g.members.forEach(n => { if (K[n]) vma[n] = K[n].v; }));
        D.current = { id: Date.now().toString(36), date: Date.now(), nom: $('#nm').value.trim() || 'Demi-fond', classe: cls, cfg: dfClone(c), groups, vma, live: { st: 'idle', w: 0, ph: 0 }, undo: [] };
        pub(D.current, true); save(); tab = 'prep'; frame(); toast(c.grp === 1 ? `${groups.length} élèves prêts ✔` : `${groups.length} groupes formés ✔`);
      } });
    syncCmp();
    partMount(box, 'demifond', p => join(box, p));
  }

  /* ---------- Séance partagée avec d'autres tablettes (une tablette par groupe) ---------- */
  const pub = (C, create) => { if (!C || C.joined || typeof partPublish !== 'function') return;
    partPublish('demifond', C.id, { nom: C.nom, classe: C.classe, ng: C.groups.length, indiv: C.cfg.grp === 1, ep: dfFormat(C.cfg),
      tpl: { nom: C.nom, classe: C.classe, cfg: C.cfg, vma: C.vma || {}, groups: C.groups.map(g => ({ name: g.name, members: g.members, mr: g.mr || {}, relay: g.relay || [], proj: g.proj || {} })) } }, create); };
  const join = (box, p) => { const T = p.tpl;
    D.current = { id: p.id, date: Date.now(), nom: T.nom, classe: T.classe, cfg: T.cfg, vma: T.vma || {}, joined: true, live: { st: 'idle', w: 0, ph: 0 }, undo: [],
      groups: T.groups.map(g => ({ name: g.name, members: [...g.members], mr: { ...(g.mr || {}) }, relay: [...(g.relay || [])], proj: dfClone(g.proj || {}), res: {} })) };
    save(); partPickGroup(box, D.current.groups, i => { if (!D.current) return frame(); D.current.only = i; save(); tab = 'live'; frame(); }, D.current.cfg.grp === 1); };

  /* ---------- Préparation (séance créée) : groupes, relais, marche rapide, VMA ---------- */
  function prepCur(box, C) {
    const c = C.cfg, lock = started(C), relais = c.grp > 1 && c.org === 'relais';
    box.innerHTML = `<div class="card"><div style="display:flex;gap:8px;align-items:flex-start"><div style="flex:1"><b style="font-size:1.1rem">${esc(C.nom)}</b>
        <div class="muted">${esc(C.classe || '')} · ${dfFormat(c)} · ${c.grp === 1 ? 'individuel' : ['', '', 'duos', 'trios', 'quatuors'][c.grp] + ' · ' + DF_ORG[c.org][0]}</div></div></div>
        <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="gopj">🎯 Projets de course</button><button class="btn btn-ghost" id="golv">⏱ Aller à la course</button></div></div>
      <div class="card" data-cfg style="margin-top:12px"><div style="display:flex;align-items:center;gap:8px"><h3 style="margin:0;flex:1">${c.grp === 1 ? '🧑 Élèves' : '👥 Groupes'} (${C.groups.length})</h3><button class="btn btn-ghost" id="edg" style="padding:8px 12px">✏️ Modifier</button></div>
        <p class="df-help">Touchez un élève pour activer / retirer 🚶 <b>marche rapide</b> (projet limité à ${dfFr(c.mrMin)}–${dfFr(c.mrMax)} km/h${c.arretsMR === -1 ? ', arrêts non comptés' : ''}).${relais ? ' Choisissez qui court chaque course (relais).' : ''}</p>
        ${C.groups.map((g, gi) => `<div style="padding:8px 0;border-top:1px solid var(--line)">${c.grp > 1 ? `<b>${esc(g.name)}</b><br>` : ''}
          ${g.members.map(n => { const v = dfVma(C, n); return `<button class="df-mem ${g.mr && g.mr[n] ? 'on' : ''}" data-mr="${gi}|${esc(n)}">${esc(n)}${v ? ` <span class="muted" style="font-size:.72rem">${dfFr(v)}</span>` : ''}${g.mr && g.mr[n] ? ' <span class="df-mr">🚶 MR</span>' : ''}</button>`; }).join('')}
          ${relais ? `<div style="display:flex;flex-wrap:wrap;gap:6px 10px;margin-top:6px">${c.runs.map((r, k) => `<div style="display:flex;align-items:center;gap:4px"><span class="muted" style="font-size:.75rem">C${k + 1}</span><select data-rl="${gi}|${k}" style="padding:5px 6px;width:auto;font-size:.82rem" ${lock ? 'disabled' : ''}>${g.members.map((n, mi) => `<option value="${mi}" ${dfRelay(g, k) === mi ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>`).join('')}</div>
            <div class="muted" style="font-size:.75rem;margin-top:4px">${g.members.map((n, mi) => `${esc(n)} : ${c.runs.filter((r, k) => dfRelay(g, k) === mi).length} relais`).join(' · ')}</div>` : ''}</div>`).join('')}
        ${c.grp > 1 && c.org === 'vagues' ? `<p class="df-help">Vague 1 : ${C.groups.map(g => esc(g.members[0] || '—')).join(', ')} courent, leurs partenaires observent ; puis on inverse.</p>` : ''}</div>
      <div class="card" data-cfg style="margin-top:12px"><details id="vmad"><summary data-free style="cursor:pointer"><b>⚡ VMA des élèves</b> <span class="muted">· ${C.groups.flatMap(g => g.members).filter(n => dfVma(C, n) != null).length}/${C.groups.flatMap(g => g.members).length} connues</span></summary>
        <p class="df-help">Reprises du Test VMA (Résultats des élèves), des tableaux de suivi (colonne « VMA ») ou des VMA saisies dans le Duathlon. Modifiables ici.</p>
        <div class="sheet-table"><table><tr><th>Élève</th><th>VMA (km/h)</th></tr>${C.groups.flatMap(g => g.members).map((n, i) => `<tr><td><b>${esc(n)}</b></td><td><input data-vma="${esc(n)}" type="number" step="0.5" min="0" inputmode="decimal" value="${dfVma(C, n) ?? ''}" placeholder="—" style="width:84px;padding:6px;text-align:center"></td></tr>`).join('')}</table></div></details></div>
      <div id="cfg" style="margin-top:12px"></div>
      <div class="row" style="margin-top:12px"><button class="btn btn-ghost" data-prof id="aband">🗑 Abandonner la séance</button></div>`;
    const $ = s => box.querySelector(s), keep = () => { save(); pub(C); };
    $('#gopj').onclick = () => { tab = 'projet'; frame(); };
    $('#golv').onclick = () => { tab = 'live'; frame(); };
    box.querySelectorAll('[data-mr]').forEach(b => b.onclick = () => { const [gi, n] = [+b.dataset.mr.split('|')[0], b.dataset.mr.split('|').slice(1).join('|')], g = C.groups[gi];
      g.mr = g.mr || {}; const on = !g.mr[n]; if (on) g.mr[n] = true; else delete g.mr[n];
      if (C.classe) { const M = (D.mr = D.mr || {})[C.classe] = D.mr[C.classe] || {}; if (on) M[n] = true; else delete M[n]; }
      keep(); prepCur(box, C); });
    box.querySelectorAll('[data-rl]').forEach(s => s.onchange = () => { const [gi, k] = s.dataset.rl.split('|').map(Number), g = C.groups[gi]; g.relay = g.relay || []; g.relay[k] = +s.value; keep(); prepCur(box, C); });
    box.querySelectorAll('[data-vma]').forEach(i => i.onchange = () => { const n = i.dataset.vma, v = dfNum(i.value); C.vma = C.vma || {};
      if (v > 0) { C.vma[n] = Math.round(v * 10) / 10; if (C.classe) { const V = (DB.duathlon = DB.duathlon || { seances: [], current: null }).vma = DB.duathlon.vma || {}; (V[C.classe] = V[C.classe] || {})[n] = { v: C.vma[n], src: 'Saisie manuelle (Demi-fond) du ' + new Date().toLocaleDateString('fr-FR'), d: Date.now() }; } }
      else delete C.vma[n];
      keep(); prepCur(box, C); box.querySelector('#vmad').open = true; });
    $('#edg').onclick = () => editGroupsPanel(c.grp === 1 ? 'Élèves de l\'épreuve' : 'Groupes de l\'épreuve', { cls: C.classe, indiv: c.grp === 1, list: () => C.groups, names: g => g.members,
      take: (g, n) => { g.members.splice(g.members.indexOf(n), 1); const d = { res: g.res && g.res[n], proj: g.proj && g.proj[n], mr: g.mr && g.mr[n] }; if (g.res) delete g.res[n]; if (g.proj) delete g.proj[n]; if (g.mr) delete g.mr[n]; return d; },
      put: (g, n, d) => { g.members.push(n); g.res = g.res || {}; g.proj = g.proj || {}; g.mr = g.mr || {};
        if (d) { if (d.res) g.res[n] = d.res; if (d.proj) g.proj[n] = d.proj; if (d.mr) g.mr[n] = true; } else if (((D.mr || {})[C.classe] || {})[n]) g.mr[n] = true;
        C.vma = C.vma || {}; if (C.vma[n] == null) { const K = dfClassVma(C.classe); if (K[n]) C.vma[n] = K[n].v; } },
      make: name => ({ name, members: [], mr: {}, relay: [], proj: {}, res: {} }), rename: (g, nm) => { g.name = nm; }, onChange: keep, onClose: () => prepCur(box, C) });
    $('#aband').onclick = () => { if (!confirm('Abandonner cette séance (les saisies seront perdues) ?')) return; if (typeof partAskRemove === 'function') partAskRemove(C); D.current = null; save(); tab = 'prep'; frame(); };
    const cf = () => cfgForm($('#cfg'), c, () => { keep(); prepCur(box, C); }, lock);
    cf();
  }

  /* ---------- Projets de course ---------- */
  function projets(box, C) {
    const c = C.cfg, grpMode = c.grp > 1 && c.org === 'groupe', allD = c.runs.every(r => r.k === 'duree'), allM = c.runs.every(r => r.k === 'dist');
    const tD = c.runs.reduce((a, r) => a + (r.k === 'duree' ? r.d : 0), 0), tM = c.runs.reduce((a, r) => a + (r.k === 'dist' ? r.m : 0), 0);
    // participants : un élève (ou le groupe en « course en groupe »)
    const parts = C.groups.flatMap((g, gi) => grpMode ? [{ g, gi, key: '_g', label: g.name, sub: g.members.join(', '), runs: c.runs.map((r, k) => k), mr: g.members.some(n => g.mr && g.mr[n]),
      vma: dfMeanVma(C, g) }] : g.members.map(n => ({ g, gi, key: n, label: n, sub: c.grp > 1 ? g.name : '', runs: dfRunsOf(C, g, n), mr: !!(g.mr && g.mr[n]), vma: dfVma(C, n) })));
    const U = c.projMode === 'global' ? (unit === 'plots' && !allD ? 'v' : unit === 'nat' && !allD && !allM ? 'v' : unit === 'plots' ? 'plots' : unit) : unit;
    const fmtIn = (v, run) => { if (!v) return '';
      if (U === 'v') return dfFr(v, 1);
      if (run.k === 'duree') { const m = v / 3.6 * run.d; return U === 'plots' ? dfFr(m / c.plot, 1) : String(Math.round(m)); }
      return dfT(run.m / (v / 3.6)); };
    const unitLbl = run => U === 'v' ? 'km/h' : run.k === 'duree' ? (U === 'plots' ? `plots de ${c.plot} m` : 'm') : 'temps (min:s)';
    const parseIn = (s, run) => { if (String(s).trim() === '') return 0;
      if (U === 'v') return dfNum(s);
      if (run.k === 'duree') { const n = dfNum(s); if (n == null) return null; const m = U === 'plots' ? n * c.plot : n; return m / run.d * 3.6; }
      const t = dfParseT(s); return t ? run.m / t * 3.6 : null; };
    // « run » virtuel pour le projet global
    const gRun = allD ? { k: 'duree', d: tD } : allM ? { k: 'dist', m: tM } : { k: 'duree', d: tD || 60 };
    const warn = (v, P) => { if (!v) return ''; if (P.mr && (v < c.mrMin - 1e-6 || v > c.mrMax + 1e-6)) return `🚶 hors plage marche rapide (${dfFr(c.mrMin)}–${dfFr(c.mrMax)} km/h)`;
      if (P.vma && v > P.vma * 1.05) return `au-delà de la VMA (${dfFr(v / P.vma * 100, 0)} %)`; if (v > 25 || v < 2) return 'vitesse inhabituelle'; return ''; };
    const cell = (P, k) => { const P0 = (P.g.proj || {})[P.key] || {}, v = k === 'g' ? P0.g : P0[k], run = k === 'g' ? gRun : c.runs[k];
      return `<div class="it"><div style="display:flex;justify-content:space-between;gap:6px"><b style="font-size:.82rem">${k === 'g' ? `Toutes les courses${allD ? ` (${dfDur(tD)} de course)` : allM ? ` (${dfFr(tM, 0)} m)` : ''}` : `C${k + 1} · ${dfRunLbl(run)}`}</b><span class="muted" style="font-size:.72rem">${unitLbl(run)}</span></div>
        <input data-pj="${P.gi}|${esc(P.key)}|${k}" value="${fmtIn(v, run)}" inputmode="decimal" placeholder="${U === 'nat' && run.k === 'dist' ? '2:30' : '—'}">
        <div class="df-eq">${v ? (k === 'g' ? c.runs.map((r, j) => `C${j + 1} : ${dfEq(v, r, c, P.vma, true)}`).join('<br>') : dfEq(v, run, c, P.vma)) : ''}</div>${warn(v, P) ? `<div class="w">⚠️ ${warn(v, P)}</div>` : ''}</div>`; };
    const filled = parts.filter(P => P.runs.length && (c.projMode === 'global' ? ((P.g.proj || {})[P.key] || {}).g : P.runs.every(k => ((P.g.proj || {})[P.key] || {})[k]))).length;
    box.innerHTML = `<div class="card"><h3 style="margin-top:0">🎯 Projet de course</h3>
        <p class="df-help" style="margin-top:0">Avant de courir, chaque ${grpMode ? 'groupe' : 'élève'} annonce ce qu'il pense réaliser : ${allD ? 'une distance' : allM ? 'un temps' : 'une distance (courses en durée) ou un temps (courses en distance)'}, en mètres, en plots ou en vitesse. Les équivalences s'affichent aussitôt.</p>
        <label>Projet</label><div class="tog" data-cfg="bare">${[['run', 'Course par course'], ['global', 'Global (même allure partout)']].map(([k, l]) => `<button data-pm="${k}" class="${c.projMode === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <label>Saisir en</label><div class="tog">${[['nat', allM ? 'Temps' : allD ? 'Distance (m)' : 'Distance / temps'], ['plots', 'Plots'], ['v', 'Vitesse (km/h)']].map(([k, l]) => `<button data-un="${k}" class="${unit === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <label>Proposer d'après la VMA</label><div data-cfg="bare" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><input id="pct" type="number" min="40" max="120" step="5" value="${c.pct}" style="width:76px;text-align:center"> <span>% VMA</span>
          <button class="btn btn-ghost" id="fill" style="padding:9px 12px">Remplir les projets vides</button><button class="btn btn-ghost" id="fillall" style="padding:9px 12px">Tout remplacer</button></div>
        <p class="df-help">Élèves 🚶 marche rapide : projet ramené dans ${dfFr(c.mrMin)}–${dfFr(c.mrMax)} km/h (${dfFr((c.mrMin + c.mrMax) / 2)} km/h si la VMA est inconnue). ${filled}/${parts.length} projets complets.</p></div>
      ${dfPjPick('df', parts, P => `<div class="card" style="margin-top:10px${P.mr ? ';border:2px dashed #8E5BD8' : ''}"><div style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap"><b style="font-size:1.05rem">${esc(P.label)}</b>${P.mr ? '<span class="df-mr">🚶 marche rapide</span>' : ''}
          <span class="muted" style="font-size:.78rem">${P.sub ? esc(P.sub) + ' · ' : ''}${P.vma ? `VMA ${dfFr(P.vma)} km/h` : 'VMA inconnue'}</span></div>
        ${P.runs.length ? `<div class="df-pj">${c.projMode === 'global' ? cell(P, 'g') : P.runs.map(k => cell(P, k)).join('')}</div>` : '<p class="muted" style="margin:6px 0 0">Ne court aucune course (voir relais).</p>'}</div>`, P => P.runs.length && (c.projMode === 'global' ? ((P.g.proj || {})[P.key] || {}).g : P.runs.every(k => ((P.g.proj || {})[P.key] || {})[k])))}
      <button class="btn btn-grad btn-block" style="margin-top:12px" id="golv">⏱ Aller à la course</button>`;
    const keep = () => { save(); pub(C); };
    dfPjWire(box, 'df', parts, () => projets(box, C));
    box.querySelectorAll('[data-pm]').forEach(b => b.onclick = () => { c.projMode = b.dataset.pm; keep(); projets(box, C); });
    box.querySelectorAll('[data-un]').forEach(b => b.onclick = () => { unit = b.dataset.un; projets(box, C); });
    box.querySelectorAll('[data-pj]').forEach(i => i.onchange = () => { const [gi, ...rest] = i.dataset.pj.split('|'), k = rest.pop(), key = rest.join('|'), g = C.groups[+gi];
      const run = k === 'g' ? gRun : c.runs[+k], v = parseIn(i.value, run);
      if (v == null || v < 0) { toast('Valeur non reconnue'); return projets(box, C); }
      g.proj = g.proj || {}; const P = g.proj[key] = g.proj[key] || {}; if (v) P[k] = Math.round(v * 100) / 100; else delete P[k];
      keep(); const y = window.scrollY, sc = el.scrollTop; projets(box, C); el.scrollTop = sc; window.scrollTo(0, y);
      const nx = box.querySelectorAll('[data-pj]'), idx = [...nx].findIndex(x => x.dataset.pj === i.dataset.pj); if (nx[idx + 1]) nx[idx + 1].focus({ preventScroll: true }); });
    const fill = force => { c.pct = Math.max(30, Math.min(130, dfNum(box.querySelector('#pct').value) || 85)); let n = 0, miss = 0;
      parts.forEach(P => { if (!P.runs.length) return; let v = P.vma ? P.vma * c.pct / 100 : null;
        if (P.mr) v = v ? Math.min(c.mrMax, Math.max(c.mrMin, v)) : (c.mrMin + c.mrMax) / 2;
        if (!v) { miss++; return; } v = Math.round(v * 10) / 10;
        const g = P.g; g.proj = g.proj || {}; const O = g.proj[P.key] = g.proj[P.key] || {};
        (c.projMode === 'global' ? ['g'] : P.runs).forEach(k => { if (force || !O[k]) { O[k] = v; n++; } }); });
      keep(); projets(box, C); toast(`${n} projet(s) rempli(s)${miss ? ` · ${miss} sans VMA` : ''}`); };
    box.querySelector('#fill').onclick = () => fill(false);
    box.querySelector('#fillall').onclick = () => { if (confirm('Remplacer tous les projets par ' + (dfNum(box.querySelector('#pct').value) || 85) + ' % de la VMA ?')) fill(true); };
    box.querySelector('#golv').onclick = () => { tab = 'live'; frame(); };
  }

  /* ---------- Chronologie en direct ---------- */
  const P_ = C => dfPhases(C.cfg);
  function pvRef(C) {           // vitesse de référence du bip « allure du projet »
    const L = C.live, P = P_(C), ph = P[L.ph]; if (!ph || ph.r == null) return null;
    const V = []; C.groups.forEach((g, gi) => { if (C.only != null && gi !== C.only) return; dfRunners(C, g, ph.r, L.w).forEach(n => { const v = dfProj(C, g, dfPKey(C, n), ph.r); if (v) V.push(v); }); });
    return V.length ? V.reduce((a, v) => a + v, 0) / V.length : null;
  }
  const bipInt = C => { const b = C.cfg.bip || {}; if (b.mode === 'n') return Math.max(3, b.n || 30); if (b.mode === 'allure') return C.cfg.plot / ((b.v || 10) / 3.6);
    if (b.mode === 'projet') { const v = pvRef(C); return v ? C.cfg.plot / (v / 3.6) : null; } return null; };
  const sig = (now, t, f, d) => { if (Math.abs(now - t) < 2500) beep(f, d); };
  function startPhase(C, i, t, now) {
    const L = C.live, ph = P_(C)[i]; L.ph = i; L.t0 = t; L.st = 'go'; L.bipN = 0; L.lastS = null; L.view = null;
    if (ph.rest != null) sig(now, t, 700, .5); else { sig(now, t, 1400, .6); C.groups.forEach(g => dfRunners(C, g, ph.r, L.w).forEach(n => dfX(g, n, ph.r, true))); }
    L.flash = now;
  }
  function endPhase(C, tEnd, now) {
    const L = C.live, P = P_(C), ph = P[L.ph], c = C.cfg;
    if (ph.r != null) { C.groups.forEach(g => dfRunners(C, g, ph.r, L.w).forEach(n => { const x = dfX(g, n, ph.r, true); x.fin = true; if (!x.arr) x.t = Math.round((tEnd - L.t0) / 100) / 10; }));
      sig(now, tEnd, 1000, .35); setTimeout(() => sig(Date.now(), Date.now(), 1000, .35), 380); }
    if (L.ph + 1 < P.length) return startPhase(C, L.ph + 1, tEnd, now);
    if (L.w + 1 < dfNV(C)) { L.w++; L.ph = 0; L.st = 'idle'; L.t0 = null; L.view = null; }
    else { L.st = 'done'; L.view = null; }
    L.flash = now;
  }
  const allArrived = (C, k) => C.groups.every((g, gi) => dfRunners(C, g, k, C.live.w).every(n => { const x = dfX(g, n, k); return x && x.arr; }));
  // Avance la chronologie (rattrape aussi le temps écoulé si l'écran était en veille) ; renvoie true si la phase a changé
  function advance(C) {
    const L = C.live, now = Date.now(); let changed = false;
    if (L.st === 'cd') { const rem = (L.cdEnd - now) / 1000, s = Math.ceil(rem);
      if (rem <= 0) { startPhase(C, 0, L.cdEnd, now); changed = true; } else if (s !== L.lastS) { L.lastS = s; beep(880, .12); } }
    let guard = 0;
    while (L.st === 'go' && guard++ < 100) {
      const ph = P_(C)[L.ph]; if (!ph) { L.st = 'done'; changed = true; break; }
      const dur = dfPhDur(C.cfg, ph), elp = (now - L.t0) / 1000;
      if (dur != null && elp >= dur) { endPhase(C, L.t0 + dur * 1000, now); changed = true; continue; }
      if (dur == null && allArrived(C, ph.r)) { endPhase(C, now, now); changed = true; continue; }
      if (dur != null) { const s = Math.ceil(dur - elp); if (s <= 3 && s >= 1 && s !== L.lastS) { L.lastS = s; beep(ph.rest != null ? 1200 : 880, .1); } }
      if (ph.r != null) { const I = bipInt(C); if (I) { const j = Math.floor(elp / I); if (j > (L.bipN || 0)) { L.bipN = j; if (dur == null || dur - elp > 3.2) beep(1100, .06, .35); } } }
      break;
    }
    if (changed) save();
    return changed;
  }
  const viewRun = C => { const L = C.live, P = P_(C);
    if (L.view != null) return L.view;
    if (L.st === 'done') return C.cfg.runs.length - 1;
    if (L.st !== 'go') return 0;
    const ph = P[L.ph]; return ph.r != null ? ph.r : ph.rest; };

  /* ---------- Écran « Course » ---------- */
  function live(box, C) {
    const c = C.cfg, L = C.live = C.live || { st: 'idle', w: 0, ph: 0 }, P = P_(C), nV = dfNV(C), obs = C.only != null && C.groups[C.only];
    tabsVisible(!obs);
    const k = viewRun(C), run = c.runs[k], ph = L.st === 'go' ? P[L.ph] : null, isCur = ph && ph.r === k, nextRun = ph && ph.rest != null ? ph.rest + 1 : null;
    const runners = []; C.groups.forEach((g, gi) => { if (obs && gi !== C.only) return; dfRunners(C, g, k, L.w).forEach(n => runners.push({ g, gi, n })); });
    const card = ({ g, gi, n }) => { const x = dfX(g, n, k) || { p: 0, tr: 0, adj: 0, st: 0, arr: false, t: null, fin: false }, mr = !!(g.mr && g.mr[n]), dist = dfRaw(x, c), al = dfAllowed(c, mr);
      const canCount = isCur || x.fin || x.arr, canArr = isCur && run.k === 'dist' && !x.arr, key = `${gi}|${esc(n)}`;
      const big = run.k === 'duree' ? `${x.p} <small style="font-size:.9rem">pl.</small> · ${dfFr(dist, 0)} m` : x.arr ? `🏁 ${dfT(x.t)}` : `${dfFr(Math.min(dist, run.m), 0)}<small style="font-size:.9rem">/${dfFr(run.m, 0)} m</small>`;
      const R = x.fin || x.arr ? dfRR(C, g, n, k) : null;
      return `<div class="df-c ${x.arr ? 'arr' : ''} ${mr ? 'mr' : ''}"><div class="nm">${esc(n)}</div>${mr ? '<div><span class="df-mr">🚶 marche rapide</span></div>' : ''}${c.grp > 1 && !obs && c.org !== 'groupe' ? `<div class="gn">${esc(g.name)}</div>` : ''}
        <div class="d">${big}</div>${c.piste && x.tr ? `<div class="muted" style="font-size:.75rem">${x.tr} tour(s) + ${x.p} plot(s)${x.adj ? ` ${x.adj > 0 ? '+' : '−'} ${Math.abs(x.adj)} m` : ''}</div>` : x.adj ? `<div class="muted" style="font-size:.75rem">ajustement ${x.adj > 0 ? '+' : '−'}${Math.abs(x.adj)} m</div>` : ''}
        <div class="df-eq" data-exp="${key}">${R ? dfEcTxt(R, c) : ''}</div>
        <div class="st ${al != null && x.st > al ? 'df-ko' : ''}">✋ ${x.st} arrêt${x.st > 1 ? 's' : ''}${al != null ? ` / ${al} autorisé${al > 1 ? 's' : ''}` : mr && c.arretsMR === -1 ? ' (non comptés)' : ''}</div>
        <div class="btns"><button class="btn btn-grad plot" data-a="p" data-k="${key}" ${canCount ? '' : 'disabled'}>+1 plot</button>
          ${c.piste ? `<button class="btn btn-ghost" data-a="tr" data-k="${key}" ${canCount ? '' : 'disabled'}>+1 tour</button>` : ''}
          <button class="btn btn-ghost" data-a="st" data-k="${key}" ${canCount ? '' : 'disabled'}>✋ Arrêt</button>
          ${run.k === 'dist' ? (x.arr ? `<button class="btn btn-ghost" data-a="ua" data-k="${key}">↺ Arrivée</button>` : `<button class="btn btn-danger" data-a="arr" data-k="${key}" ${canArr ? '' : 'disabled'}>🏁 Arrivé</button>`) : ''}</div>
        <div class="adj"><button data-a="mp" data-k="${key}" ${canCount ? '' : 'disabled'}>−1 pl.</button><button data-a="m5" data-k="${key}" ${canCount ? '' : 'disabled'}>−5 m</button><button data-a="p5" data-k="${key}" ${canCount ? '' : 'disabled'}>+5 m</button>${x.st ? `<button data-a="ms" data-k="${key}">−✋</button>` : ''}</div></div>`; };
    const tl = `<div class="df-tl">${P.map((q, i) => q.rest != null ? `<span class="${L.st === 'go' && L.ph === i ? 'cur' : ''}">R ${dfT(c.rests[q.rest].d)}</span>`
      : `<button data-v="${q.r}" class="${L.st === 'go' && L.ph === i ? 'cur' : ''} ${(L.st === 'done' || (L.st === 'go' && L.ph > i)) ? 'done' : ''} ${q.r === k ? 'vw' : ''}">C${q.r + 1} · ${dfRunLbl(c.runs[q.r])}</button>`).join('')}</div>`;
    const b = c.bip || (c.bip = { mode: 'off', n: 30, v: 10 });
    let grid = '';
    if (obs || c.grp === 1 || c.org !== 'groupe') grid = `<div class="df-grid">${runners.map(card).join('')}</div>`;
    else C.groups.forEach((g, gi) => { const R = runners.filter(r => r.gi === gi); if (!R.length) return; grid += `<div class="df-gh">${esc(g.name)}${c.org === 'relais' ? ' <span class="muted" style="font-weight:600">· relais</span>' : ''}</div><div class="df-grid" style="margin-top:6px">${R.map(card).join('')}</div>`; });
    const nextNames = nextRun != null && c.grp > 1 && c.org === 'relais' ? C.groups.filter((g, gi) => !obs || gi === C.only).map(g => `${esc(g.name)} : ${esc(g.members[dfRelay(g, nextRun)] || '—')}`).join(' · ') : '';
    box.innerHTML = `<div class="${obs ? 'df-obs' : ''}">
      ${obs ? `<div class="card" style="text-align:center;margin-bottom:10px"><div style="font-weight:900;font-size:1.25rem">${esc(obs.name)}</div>${c.grp > 1 ? `<div class="muted">${obs.members.map(esc).join(', ')}</div>` : ''}</div>` : `<div class="muted" style="margin:0 2px 6px"><b style="color:var(--text)">${esc(C.nom)}</b> · ${dfFormat(c)}${nV > 1 ? ` · vague ${L.w + 1}/${nV}` : ''}</div>`}
      <div class="df-ph ${L.st === 'go' ? (ph.rest != null ? 'rest' : 'work') : L.st === 'done' ? 'end' : 'idle'}" id="ph">
        <div class="lb" id="phl"></div><div class="big" id="phb">–</div><div class="sub" id="phs"></div><div class="bar"><i id="phbar"></i></div></div>
      ${nextNames ? `<div class="muted" style="margin-top:6px;text-align:center">Prochain relais → ${nextNames}</div>` : ''}
      <div class="row" style="margin-top:10px">
        ${L.st === 'idle' ? `<button class="btn btn-grad" id="go" style="flex:2;padding:16px;font-size:1.1rem">▶ Départ${nV > 1 ? ` vague ${L.w + 1}` : ''}</button><button class="btn btn-ghost" id="go0">⚡ Sans 3-2-1</button>` : ''}
        ${L.st === 'go' ? `<button class="btn btn-ghost" id="skip">⏭ ${ph.rest != null ? 'Fin du repos' : run.k === 'dist' ? 'Terminer la course' : 'Fin de la course'}</button>` : ''}
        ${L.st === 'cd' || L.st === 'go' ? `<button class="btn btn-ghost" id="stop" ${obs ? 'data-prof' : ''}>⏹ Stop</button>` : ''}
        <button class="btn btn-ghost" id="undo" ${(C.undo || []).length ? '' : 'disabled'}>↶ Annuler</button></div>
      ${L.st === 'done' ? `<button class="btn btn-grad btn-block" style="margin-top:10px;padding:16px" id="save">💾 Terminer et enregistrer</button>` : ''}
      ${tl}
      <div class="muted" style="margin-top:6px;font-size:.8rem">${isCur ? `Course ${k + 1} en cours` : L.view != null || L.st === 'go' || L.st === 'done' ? `Course ${k + 1} : corrigez si besoin (+/− plots, mètres, arrêts)` : `Course ${k + 1} : attend le départ`}${run.k === 'dist' ? ' · touchez « 🏁 Arrivé » à l\'arrivée de chaque coureur' : ` · touchez « +1 plot » à chaque plot franchi (${c.plot} m)`}</div>
      ${grid || '<div class="card empty" style="margin-top:10px">Aucun coureur pour cette course.</div>'}
      <div class="card" data-cfg style="margin-top:12px"><b>🔔 Bips d'allure</b>
        <div class="tog">${[['off', 'Aucun'], ['n', 'Toutes les N s'], ['allure', 'Allure fixe'], ['projet', 'Allure du projet']].map(([m, l]) => `<button data-bm="${m}" class="${b.mode === m ? 'on' : ''}">${l}</button>`).join('')}</div>
        ${b.mode === 'n' ? `<div style="display:flex;gap:6px;align-items:center;margin-top:8px">Bip toutes les <input id="bn" type="number" min="3" value="${b.n}" style="width:76px;text-align:center"> s</div>` : ''}
        ${b.mode === 'allure' ? `<div style="display:flex;gap:6px;align-items:center;margin-top:8px"><input id="bv" type="number" step="0.5" min="3" value="${b.v}" style="width:76px;text-align:center"> km/h → bip à chaque plot, soit toutes les <b>${dfFr(c.plot / (b.v / 3.6), 1)} s</b></div>` : ''}
        <p class="df-help" id="bipinfo">${b.mode === 'projet' ? `Bip à chaque plot (${c.plot} m) à l'allure du projet ${obs ? 'du coureur suivi' : 'moyenne des coureurs en piste'} : l'élève doit passer son plot au bip.` : b.mode === 'off' ? 'Bips de départ, de fin et 3-2-1 toujours actifs. Un bip d\'allure aide l\'élève à régler sa vitesse (« bip à chaque plot »).' : ''}</p></div>
      ${obs ? '<div style="text-align:center;margin:18px 0 6px"><button class="link" id="gv-prof">🔒 Mode enseignant</button></div>'
        : `${C.groups.length > 1 ? `<div class="card" data-cfg style="margin-top:12px"><label style="margin-top:0">📱 Tablette d'un ${c.grp === 1 ? 'élève' : 'groupe'} (l'observateur ne voit que son coureur)</label><select id="only"><option value="">Tous</option>${C.groups.map((g, i) => `<option value="${i}">${esc(g.name)}</option>`).join('')}</select></div>` : ''}
        ${L.st !== 'done' && started(C) ? '<button class="btn btn-ghost btn-block" data-cfg="bare" style="margin-top:12px" id="save">💾 Enregistrer maintenant (séance incomplète)</button>' : ''}`}
      </div>`;
    const $ = s => box.querySelector(s), redraw = () => live(box, C), keep = () => save();
    const find = key => { const [gi, ...r] = key.split('|'); return { g: C.groups[+gi], gi: +gi, n: r.join('|') }; };
    box.querySelectorAll('[data-a]').forEach(bt => bt.onclick = () => {
      const { g, gi, n } = find(bt.dataset.k), a = bt.dataset.a, x = dfX(g, n, k, true), prev = JSON.stringify(x);
      if (a === 'p') { x.p++; beep(1000, .04, .3); } else if (a === 'tr') { x.tr++; beep(1000, .04, .3); } else if (a === 'st') { x.st++; beep(500, .08, .3); }
      else if (a === 'mp') x.p = Math.max(0, x.p - 1); else if (a === 'm5') x.adj = (x.adj || 0) - 5; else if (a === 'p5') x.adj = (x.adj || 0) + 5; else if (a === 'ms') x.st = Math.max(0, x.st - 1);
      else if (a === 'arr') { x.arr = true; x.fin = true; x.t = Math.round((Date.now() - L.t0) / 100) / 10; beep(1500, .2); }
      else if (a === 'ua') { if (!confirm(`Annuler l'arrivée de ${n} ?`)) return; x.arr = false; if (isCur) x.fin = false; }
      if (dfRaw(x, c) < 0) x.adj -= dfRaw(x, c);
      (C.undo = C.undo || []).push({ gi, n, k, x: prev }); if (C.undo.length > 60) C.undo.shift();
      keep(); advance(C); redraw(); });
    box.querySelectorAll('[data-v]').forEach(bt => bt.onclick = () => { const v = +bt.dataset.v; L.view = L.view === v || (L.st === 'go' && P[L.ph].r === v) ? null : v; keep(); redraw(); });
    if ($('#go')) $('#go').onclick = () => { L.st = 'cd'; L.cdEnd = Date.now() + 3000; L.lastS = null; keep(); advance(C); redraw(); };
    if ($('#go0')) $('#go0').onclick = () => { const t = Date.now(); startPhase(C, 0, t, t); keep(); redraw(); };
    if ($('#skip')) $('#skip').onclick = () => { if (ph.r != null && run.k === 'dist' && !allArrived(C, ph.r) && !confirm('Certains coureurs ne sont pas arrivés : terminer la course (distance partielle, temps au moment de l\'arrêt) ?')) return;
      const t = Date.now(); endPhase(C, t, t); keep(); redraw(); };
    if ($('#stop')) $('#stop').onclick = () => { if (!confirm('Arrêter le chrono ? Les saisies sont conservées ; la course en cours est considérée comme terminée.')) return;
      const t = Date.now(); if (L.st === 'go' && P[L.ph].r != null) { const r = P[L.ph].r; C.groups.forEach(g => dfRunners(C, g, r, L.w).forEach(n => { const x = dfX(g, n, r, true); x.fin = true; if (!x.arr) x.t = Math.round((t - L.t0) / 100) / 10; })); }
      L.st = L.w + 1 < nV ? 'idle' : 'done'; if (L.st === 'idle') { L.w++; L.ph = 0; } L.view = null; keep(); redraw(); };
    $('#undo').onclick = () => { const u = (C.undo || []).pop(); if (!u) return; const g = C.groups[u.gi]; if (g) { g.res = g.res || {}; g.res[u.n] = g.res[u.n] || {}; g.res[u.n][u.k] = JSON.parse(u.x); } keep(); toast('Dernière saisie annulée'); redraw(); };
    box.querySelectorAll('[data-bm]').forEach(bt => bt.onclick = () => { b.mode = bt.dataset.bm; L.bipN = Math.floor(((Date.now() - (L.t0 || Date.now())) / 1000) / (bipInt(C) || 1e9)); keep(); redraw(); });
    if ($('#bn')) $('#bn').onchange = () => { b.n = Math.max(3, dfNum($('#bn').value) || 30); keep(); redraw(); };
    if ($('#bv')) $('#bv').onchange = () => { b.v = Math.max(3, dfNum($('#bv').value) || 10); keep(); redraw(); };
    if ($('#only')) $('#only').onchange = e => { C.only = e.target.value === '' ? null : +e.target.value; keep(); redraw(); window.scrollTo(0, 0); };
    if ($('#gv-prof')) $('#gv-prof').onclick = () => { if (!confirm('Passer en mode enseignant (tous les groupes, réglages) ?')) return; C.only = null; keep(); frame(); };
    box.querySelectorAll('#save').forEach(s => s.onclick = saveSeance);
    paint(C);
  }
  // Mise à jour légère (chrono, attendu du projet) sans reconstruire l'écran
  function paint(C) {
    const box = el.querySelector('#df-body'); if (!box || tab !== 'live') return;
    const c = C.cfg, L = C.live, P = P_(C), $ = s => box.querySelector(s), now = Date.now(); if (!$('#ph')) return;
    let lb = '', big = '–', sub = '', pr = 0;
    if (L.st === 'idle') { lb = dfNV(C) > 1 ? `Vague ${L.w + 1} / ${dfNV(C)} · prêt` : 'Prêt'; big = dfRunLbl(c.runs[0]); sub = `${c.runs.length} course${c.runs.length > 1 ? 's' : ''} · ${dfFormat(c)}`;
      if (dfNV(C) > 1) sub += ' · coureurs : ' + C.groups.map(g => g.members[L.w]).filter(Boolean).map(esc).join(', '); }
    else if (L.st === 'cd') { lb = 'Attention…'; big = String(Math.max(1, Math.ceil((L.cdEnd - now) / 1000))); sub = 'Départ de la course 1'; }
    else if (L.st === 'done') { lb = 'Épreuve terminée'; big = '🏁'; sub = 'Vérifiez / corrigez les distances puis enregistrez'; pr = 1; }
    else { const ph = P[L.ph], dur = dfPhDur(c, ph), e = (now - L.t0) / 1000, nx = P[L.ph + 1];
      if (ph.rest != null) { lb = `Repos ${c.rests[ph.rest].actif ? 'actif' : 'passif'}`; big = dfT(Math.ceil(dur - e)); sub = `Ensuite : course ${ph.rest + 2} · ${dfRunLbl(c.runs[ph.rest + 1])}`; }
      else { const r = c.runs[ph.r]; lb = `Course ${ph.r + 1} / ${c.runs.length} · ${dfRunLbl(r)}`;
        big = r.k === 'duree' ? dfT(Math.ceil(dur - e)) : dfT(e);
        sub = nx ? `Ensuite : repos ${dfT(c.rests[nx.rest].d)}` : ph.r + 1 < c.runs.length ? `Ensuite : course ${ph.r + 2}` : 'Dernière course';
        const I = bipInt(C); if (I) sub += ` · 🔔 bip toutes les ${dfFr(I, 1)} s`; }
      pr = dur ? Math.min(1, e / dur) : 0; }
    $('#phl').textContent = lb; $('#phb').textContent = big; $('#phs').innerHTML = sub; $('#phbar').style.width = (pr * 100) + '%';
    const phEl = $('#ph'); if (L.flash && now - L.flash < 1200 && !phEl.classList.contains('flash')) { phEl.classList.add('flash'); }
    // « attendu » selon le projet pendant une course en cours
    const ph = L.st === 'go' ? P[L.ph] : null;
    if (ph && ph.r != null) { const run = c.runs[ph.r], e = (now - L.t0) / 1000;
      box.querySelectorAll('[data-exp]').forEach(d => { const [gi, ...r] = d.dataset.exp.split('|'), g = C.groups[+gi], n = r.join('|'), x = dfX(g, n, ph.r); if (!x || x.arr || viewRun(C) !== ph.r) return;
        const pv = dfProj(C, g, dfPKey(C, n), ph.r); if (!pv) { d.innerHTML = '<span class="muted">pas de projet</span>'; return; }
        const exp = pv / 3.6 * e, got = dfRaw(x, c), diff = Math.round((got - exp) / c.plot), tot = run.k === 'duree' ? pv / 3.6 * run.d : run.m;
        d.innerHTML = `Projet ${dfFr(pv)} km/h → ${run.k === 'duree' ? `${dfFr(tot, 0)} m` : dfT(run.m / (pv / 3.6))}<br>attendu : <b>${Math.floor(exp / c.plot)} plots</b> ${diff > 0 ? `<span class="df-mid">▲ +${diff} en avance</span>` : diff < 0 ? `<span class="df-ko">▼ ${diff} en retard</span>` : '<span class="df-ok">✓ dans l\'allure</span>'}`; }); }
  }

  /* ---------- Enregistrement ---------- */
  const hasData = g => g.res && Object.values(g.res).some(R => Object.values(R || {}).some(x => x && (x.fin || x.arr || x.p || x.tr || x.st)));
  function saveSeance() {
    const C = cur(); if (!C) return; const done = C.groups.filter(hasData);
    if (!done.length) return toast('Aucun résultat saisi');
    if (C.live && C.live.st !== 'done' && !confirm('L\'épreuve n\'est pas terminée. Enregistrer quand même les courses terminées ?')) return;
    const rec = dfClone({ ...C, groups: done }); rec.id = C.id + '-' + Math.random().toString(36).slice(2, 6); ['live', 'undo', 'only', 'joined'].forEach(k => delete rec[k]);
    D.seances.push(rec); D.current = null; save(); window.syncFlush && window.syncFlush(); toast('Séance de demi-fond enregistrée ✔'); tab = 'res'; openRec = rec.id; frame();
  }

  /* ---------- Résultats ---------- */
  let openRec = null;
  function resHTML(C, rank) {
    const c = C.cfg, N = c.runs.length;
    const rows = C.groups.flatMap(g => g.members.map(n => ({ g, n, S: dfMember(C, g, n), mr: !!(g.mr && g.mr[n]) }))).filter(r => r.S);
    const cmp = rank === 'vitesse' ? (a, b) => (b.S.v || 0) - (a.S.v || 0) : (a, b) => ((a.S.eAbs == null) - (b.S.eAbs == null)) || ((a.S.eAbs ?? 9) - (b.S.eAbs ?? 9)) || (b.S.v || 0) - (a.S.v || 0);
    rows.sort(cmp);
    const runCell = R => R ? `<td><b>${dfFr(R.dist, 0)} m</b> · ${dfT(R.t)}${R.partial ? ' <span class="df-ko">(partiel)</span>' : ''}<small>${dfFr(R.v)} km/h${R.pVma ? ` · ${Math.round(R.pVma * 100)} % VMA` : ''}${R.pv ? ` · projet ${dfFr(R.pv)}` : ''}</small><div class="ec">${dfEcTxt(R, c)}</div>${R.st ? `<small class="${R.over ? 'df-ko' : ''}">✋ ${R.st}${R.allowed != null ? '/' + R.allowed : ''}</small>` : ''}${R.who ? `<small>(${esc(R.who)})</small>` : ''}</td>` : '<td class="muted">–</td>';
    const sumCells = S => `<td>${S.eAbs != null ? `<b class="${dfCls(S.eAbs, c)}">± ${dfFr(S.eAbs * 100, 1)} %</b><small>moy. signée ${dfPct(S.eMoy)}</small>` : '<small class="muted">pas de projet</small>'}</td><td><b>${dfFr(S.v)} km/h</b></td><td>${S.pVma ? `<b>${Math.round(S.pVma * 100)} %</b><small>VMA ${dfFr(S.vma)}</small>` : '<span class="muted">–</span>'}</td>
      <td><b>${dfFr(S.dist, 0)} m</b><small>${dfT(S.t)}${S.partial ? ' · partiel' : ''}</small></td><td class="${S.over ? 'df-ko' : ''}"><b>${S.st}</b>${S.over ? `<small>${S.over} course(s) au-delà</small>` : ''}</td>`;
    const head = `<th>#</th><th>Élève</th><th>Écart projet</th><th>V moy.</th><th>% VMA</th><th>Total</th><th>Arrêts</th>${c.runs.map((r, k) => `<th>C${k + 1} · ${dfRunLbl(r)}</th>`).join('')}`;
    let h = `<div class="sheet-table df-tbl"><table><tr>${head}</tr>${rows.map((r, i) => `<tr><td>${i + 1}</td><td><b>${esc(r.n)}</b>${r.mr ? ' <span class="df-mr">🚶 MR</span>' : ''}${c.grp > 1 ? `<small>${esc(r.g.name)}</small>` : ''}</td>
      ${sumCells(r.S)}${c.runs.map((x, k) => runCell(dfRunsOf(C, r.g, r.n).includes(k) ? dfRR(C, r.g, r.n, k) : null)).join('')}</tr>`).join('')}</table></div>`;
    if (c.grp > 1) {
      const G = C.groups.map(g => ({ g, S: dfGroup(C, g) })).filter(r => r.S).sort((a, b) => cmp({ S: a.S }, { S: b.S }));
      h += `<h4 style="margin:14px 2px 4px">👥 Groupes · ${DF_ORG[c.org][0]}${c.org === 'groupe' ? ` · ${c.grpRes === 'lent' ? 'le plus lent' : 'moyenne'}` : ''}</h4>
        <div class="sheet-table df-tbl"><table><tr><th>#</th><th>Groupe</th><th>Écart projet</th><th>V moy.</th><th>% VMA moy.</th><th>Total</th><th>Arrêts</th>${c.org === 'vagues' ? '' : c.runs.map((r, k) => `<th>C${k + 1}</th>`).join('')}</tr>
        ${G.map((r, i) => `<tr><td>${i + 1}</td><td><b>${esc(r.g.name)}</b><small>${r.g.members.map(n => esc(n) + (r.g.mr && r.g.mr[n] ? ' 🚶' : '')).join(', ')}</small></td>${sumCells(r.S)}${c.org === 'vagues' ? '' : c.runs.map((x, k) => { const R = dfGR(C, r.g, k); if (R && c.org === 'relais') R.who = r.g.members[dfRelay(r.g, k)]; return runCell(R); }).join('')}</tr>`).join('')}</table></div>`;
    }
    h += `<p class="df-help">Classement ${rank === 'vitesse' ? 'à la vitesse moyenne réalisée' : 'au respect du projet : plus petit écart moyen (en valeur absolue) entre vitesse projetée et vitesse réalisée'}. Écart vert ≤ ${c.tol} %, orange ≤ ${2 * c.tol} %. Course en durée : écart en mètres ; course en distance : écart en temps (négatif = plus rapide que prévu). Vitesse = distance ÷ temps ; % VMA = vitesse ÷ VMA.</p>`;
    return h;
  }
  function csvOf(list) {
    const rows = [['Séance', 'Date', 'Classe', 'Format', 'Groupement', 'Groupe', 'Élève', 'Marche rapide', 'VMA (km/h)', 'Course', 'Consigne', 'Projet (km/h)', 'Projet (distance ou temps)', 'Distance réalisée (m)', 'Temps', 'Vitesse (km/h)', '% VMA', 'Écart (m ou s)', 'Écart projet (%)', 'Arrêts', 'Arrêts autorisés', 'Plots', 'Tours']];
    const f = (x, d = 1) => x == null || !isFinite(x) ? '' : (+x).toFixed(d).replace('.', ',');
    list.forEach(C => { const c = C.cfg, grp = c.grp === 1 ? 'Individuel' : ['', '', 'Duo', 'Trio', 'Quatuor'][c.grp] + ' · ' + DF_ORG[c.org][0].replace(/^\S+\s/, '');
      C.groups.forEach(g => g.members.forEach(n => { const mr = g.mr && g.mr[n] ? 'oui' : '', vma = dfVma(C, n);
        dfRunsOf(C, g, n).forEach(k => { const R = dfRR(C, g, n, k), r = c.runs[k], x = dfX(g, n, k) || {}; if (!R) return;
          rows.push([C.nom, new Date(C.date).toLocaleDateString('fr-FR'), C.classe, dfFormat(c), grp, c.grp > 1 ? g.name : '', n, mr, f(vma), k + 1, dfRunLbl(r), f(R.pv),
            R.pv ? (r.k === 'duree' ? f(R.pd, 0) + ' m' : dfT(R.pt)) : '', f(R.dist, 0), dfT(R.t) + (R.partial ? ' (partiel)' : ''), f(R.v), R.pVma ? Math.round(R.pVma * 100) : '',
            R.et != null ? f(R.et, 0) + ' s' : R.ed != null ? f(R.ed, 0) + ' m' : '', R.ev != null ? f(R.ev * 100) : '', R.st, R.allowed ?? (R.mr && c.arretsMR === -1 ? 'non comptés (marche rapide)' : 'illimité'), x.p || 0, x.tr || 0]); });
        const S = dfMember(C, g, n); if (S) rows.push([C.nom, new Date(C.date).toLocaleDateString('fr-FR'), C.classe, dfFormat(c), grp, c.grp > 1 ? g.name : '', n, mr, f(vma), 'TOTAL', '', '', '', f(S.dist, 0), dfT(S.t), f(S.v), S.pVma ? Math.round(S.pVma * 100) : '', '', S.eAbs != null ? f(S.eAbs * 100) + ' (moy. abs.)' : '', S.st, '', '', '']); })); });
    return csv(rows);
  }
  function sendRes(C) {
    const base = String(C.id).split('-')[0]; let nMaj = 0;
    let n = 0; const inCls = C.classe ? studentsOf(C.classe) : null;
    C.groups.forEach(g => g.members.forEach(e => { if (inCls && !inCls.includes(e)) return; const S = dfMember(C, g, e); if (!S) return; const mr = g.mr && g.mr[e];
      nMaj += saveResult({ key: `demifond|${base}|${C.classe || ''}|${e}`, tool: 'demifond', label: 'Demi-fond', classe: C.classe, eleve: e, valeur: `${dfFr(S.v)} km/h${S.pVma ? ` (${Math.round(S.pVma * 100)} % VMA)` : ''}${mr ? ' · 🚶 marche rapide' : ''}`,
        detail: `${C.nom} · ${dfFormat(C.cfg)}${C.cfg.grp > 1 ? ' · ' + g.name : ''} · ${dfFr(S.dist, 0)} m en ${dfT(S.t)} · écart projet ${S.eAbs != null ? dfFr(S.eAbs * 100, 1) + ' % (moy.)' : '–'} · ${S.st} arrêt(s)${S.over ? ' (au-delà du nombre autorisé)' : ''}` }) === 'maj'; n++; }));
    C.sent = Date.now(); save(); toast(nMaj ? `${n} résultat(s) mis à jour ✔ (déjà envoyés : remplacés, sans doublon)` : `${n} résultat(s) envoyé(s) ✔`);
  }
  function results(box) {
    const C = cur(), S = D.seances.slice().sort((a, b) => b.date - a.date);
    box.innerHTML = `${C ? `<div class="card" style="border:2px solid var(--gold)"><h3 style="margin-top:0">⏱ Séance en cours · ${esc(C.nom)}</h3><div class="muted">${esc(C.classe || '')} · ${dfFormat(C.cfg)} · résultats provisoires (courses terminées)</div>
        <div id="rcur"></div><button class="btn btn-grad btn-block" data-cfg="bare" style="margin-top:10px" id="save">💾 Terminer et enregistrer</button></div>` : ''}
      <div class="section-title"><h2>Historique (${S.length})</h2>${S.length ? '<button class="link" id="expall">Exporter tout (CSV)</button>' : ''}</div>
      <div class="seg" style="margin-bottom:10px">${[['ecart', '🎯 Classer par respect du projet'], ['vitesse', '⚡ Classer par vitesse']].map(([k, l]) => `<button data-rk="${k}" class="${rk === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      ${S.length ? S.map(R => `<details class="card" style="margin-top:10px" data-id="${esc(R.id)}" ${openRec === R.id ? 'open' : ''}><summary style="cursor:pointer"><b>${new Date(R.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} · ${esc(R.classe || '')} · ${esc(R.nom)}</b>
          <div class="muted">${dfFormat(R.cfg)} · ${R.cfg.grp === 1 ? 'individuel' : ['', '', 'duos', 'trios', 'quatuors'][R.cfg.grp] + ' · ' + DF_ORG[R.cfg.org][0]} · ${R.groups.reduce((a, g) => a + g.members.length, 0)} élèves${R.sent ? ' · 📤 envoyé' : ''}</div></summary>
          <div data-body></div>
          <div class="row" style="margin-top:10px"><button class="btn btn-grad" data-send="${esc(R.id)}">📤 Envoyer dans Résultats des élèves</button><button class="btn btn-ghost" data-csv="${esc(R.id)}">⬇️ Export CSV</button><button class="btn btn-ghost" data-prof data-del="${esc(R.id)}">🗑</button></div></details>`).join('')
        : '<div class="card empty">Aucune séance de demi-fond enregistrée.</div>'}`;
    const $ = s => box.querySelector(s), byId = id => D.seances.find(x => x.id === id);
    if (C) { $('#rcur').innerHTML = C.groups.some(g => C.groups && dfGroup(C, g)) ? resHTML(C, rk) : '<p class="muted">Aucune course terminée pour l\'instant.</p>'; $('#save').onclick = saveSeance; }
    const fill = d => { const R = byId(d.dataset.id); if (R && d.open) d.querySelector('[data-body]').innerHTML = resHTML(R, rk); };
    box.querySelectorAll('details[data-id]').forEach(d => { fill(d); d.ontoggle = () => { if (d.open) { openRec = d.dataset.id; fill(d); } }; });
    box.querySelectorAll('[data-rk]').forEach(b => b.onclick = () => { rk = b.dataset.rk; results(box); });
    box.querySelectorAll('[data-send]').forEach(b => b.onclick = () => { const R = byId(b.dataset.send); if (R) { sendRes(R); results(box); } });
    box.querySelectorAll('[data-csv]').forEach(b => b.onclick = () => { const R = byId(b.dataset.csv); if (R) download(`demi-fond-${(R.classe || 'classe').replace(/\W+/g, '_')}-${new Date(R.date).toISOString().slice(0, 10)}.csv`, csvOf([R])); });
    box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const R = byId(b.dataset.del); if (R && confirm(`Supprimer la séance « ${R.nom} » ?`)) { D.seances.splice(D.seances.indexOf(R), 1); save(); results(box); } });
    if ($('#expall')) $('#expall').onclick = () => download(`demi-fond-${new Date().toISOString().slice(0, 10)}.csv`, csvOf(D.seances));
  }

  /* ---------- Calculette ---------- */
  function calc(box) {
    const K = D.calc = D.calc || { mode: 'vd', v: 10, t: 180, m: 500, vma: '', pct: '', plot: (D.lastCfg || {}).plot || 25, piste: (D.lastCfg || {}).piste || 0 };
    box.innerHTML = `<div class="card df-calc"><h3 style="margin-top:0">🧮 Calculette demi-fond</h3>
        <label style="margin-top:0">Je connais</label><div class="seg">${[['vd', 'Vitesse + durée'], ['vm', 'Vitesse + distance'], ['mt', 'Distance + temps']].map(([k, l]) => `<button data-cm="${k}" class="${K.mode === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <div class="row" style="margin-top:4px">
          ${K.mode !== 'mt' ? `<div style="flex:1;min-width:120px"><label>Vitesse (km/h)</label><input id="cv" inputmode="decimal" value="${dfFr(K.v, 2)}"></div>` : ''}
          ${K.mode !== 'vm' ? `<div style="flex:1;min-width:120px"><label>Durée (min:s)</label><input id="ct" inputmode="numeric" value="${dfT(K.t)}"></div>` : ''}
          ${K.mode !== 'vd' ? `<div style="flex:1;min-width:120px"><label>Distance (m)</label><input id="cm" inputmode="numeric" value="${K.m}"></div>` : ''}</div>
        <div class="row"><div style="flex:1;min-width:120px"><label>VMA de l'élève (facultatif)</label><input id="cvma" inputmode="decimal" value="${K.vma}" placeholder="ex. 12"></div>
          <div style="flex:1;min-width:120px"><label>ou vitesse = % VMA</label><input id="cpct" inputmode="decimal" value="${K.pct}" placeholder="ex. 85" ${K.mode === 'mt' ? 'disabled' : ''}></div></div>
        <label>Plots tous les</label><div class="tog">${[20, 25, 50].map(p => `<button data-cp="${p}" class="${K.plot === p ? 'on' : ''}">${p} m</button>`).join('')}<input id="cpx" type="number" min="1" value="${[20, 25, 50].includes(K.plot) ? '' : K.plot}" placeholder="autre" style="width:80px;padding:8px"></div>
        <label>Tour de piste</label><div class="tog">${[0, 150, 200, 250, 400].map(p => `<button data-cpi="${p}" class="${K.piste === p ? 'on' : ''}">${p ? p + ' m' : 'Aucun'}</button>`).join('')}</div>
        <div class="out" id="out"></div><p class="df-help" id="osent"></p></div>
      <div class="card" style="margin-top:12px"><h3 style="margin-top:0">📋 Table d'allures</h3><p class="df-help" style="margin-top:0">Pour la durée / distance ci-dessus : distance et plots selon la vitesse.</p><div class="sheet-table df-tbl" id="tbl"></div></div>`;
    const $ = s => box.querySelector(s);
    const comp = () => {
      const vma = dfNum(K.vma), pct = dfNum(K.pct); let v = K.v, t = K.t, m = K.m;
      if (K.mode !== 'mt' && vma && pct) v = vma * pct / 100;
      if (K.mode === 'vd') m = v / 3.6 * t; else if (K.mode === 'vm') t = m / (v / 3.6); else v = t > 0 ? m / t * 3.6 : 0;
      const c = { plot: K.plot, piste: K.piste }, p = dfPlots(m, c), I = K.plot / (v / 3.6);
      $('#out').innerHTML = [[dfFr(v, 2) + ' km/h', 'vitesse'], [dfT(t), 'durée'], [dfFr(m, 0) + ' m', 'distance'], [`${p.n} <small>(+${p.r} m)</small>`, `plots de ${K.plot} m`],
        ...(K.piste ? [[`${Math.floor(m / K.piste)} <small>+ ${Math.round(m % K.piste)} m</small>`, `tours de ${K.piste} m`]] : []), [dfFr(I, 1) + ' s', 'par plot (bip)'], [dfT(1000 / (v / 3.6)), 'allure au km'],
        [vma ? Math.round(v / vma * 100) + ' %' : '–', 'de la VMA']].map(([a, b]) => `<div><b>${a}</b><small>${b}</small></div>`).join('');
      $('#osent').innerHTML = `${dfFr(v, 1)} km/h pendant ${dfDur(Math.round(t))} → ${dfFr(m, 0)} m → ${dfPlotTxt(m, c)}.`;
      const base = K.mode === 'vd' || (K.mode === 'mt' && false) ? { k: 'duree', d: t } : { k: 'dist', m };
      const V = []; for (let s = 5; s <= 18; s += 1) V.push(s);
      $('#tbl').innerHTML = `<table><tr><th>km/h</th><th>${base.k === 'duree' ? `Distance en ${dfDur(Math.round(t))}` : `Temps sur ${dfFr(m, 0)} m`}</th><th>Plots (${K.plot} m)</th><th>s / plot</th>${vma ? '<th>% VMA</th>' : ''}</tr>
        ${V.map(s => { const d = base.k === 'duree' ? s / 3.6 * t : m; return `<tr${Math.abs(s - v) < .5 ? ' style="background:var(--grad-soft)"' : ''}><td><b>${s}</b>${s <= 8 && s >= 5 ? ' <span class="df-mr">🚶</span>' : ''}</td><td>${base.k === 'duree' ? dfFr(d, 0) + ' m' : dfT(m / (s / 3.6))}</td><td>${dfPlots(d, c).n} (+${dfPlots(d, c).r} m)</td><td>${dfFr(K.plot / (s / 3.6), 1)}</td>${vma ? `<td>${Math.round(s / vma * 100)} %</td>` : ''}</tr>`; }).join('')}</table>`;
    };
    const rd = () => { save(); calc(box); };
    box.querySelectorAll('[data-cm]').forEach(b => b.onclick = () => { K.mode = b.dataset.cm; rd(); });
    box.querySelectorAll('[data-cp]').forEach(b => b.onclick = () => { K.plot = +b.dataset.cp; rd(); });
    box.querySelectorAll('[data-cpi]').forEach(b => b.onclick = () => { K.piste = +b.dataset.cpi; rd(); });
    $('#cpx').onchange = () => { const p = dfNum($('#cpx').value); if (p > 0) { K.plot = p; rd(); } };
    const inp = (id, f) => { const i = $(id); if (i) i.oninput = () => { f(i.value); save(); comp(); }; };
    inp('#cv', s => { const v = dfNum(s); if (v > 0) { K.v = v; K.pct = ''; if ($('#cpct')) $('#cpct').value = ''; } });
    inp('#ct', s => { const t = dfParseT(s); if (t > 0) K.t = t; });
    inp('#cm', s => { const m = dfNum(s); if (m > 0) K.m = m; });
    inp('#cvma', s => { K.vma = s; });
    inp('#cpct', s => { K.pct = s; });
    comp();
  }

  /* ---------- Horloge ---------- */
  const tick = () => {
    if (!el.isConnected) return clearInterval(iv);
    const C = cur(); if (!C || !C.live || !['cd', 'go'].includes(C.live.st)) return;
    const ch = advance(C);
    if (tab === 'live') { if (ch) { const y = el.scrollTop; live(el.querySelector('#df-body'), C); el.scrollTop = y; } else paint(C); }
  };
  frame();
  clearInterval(window._dfTick); iv = window._dfTick = setInterval(tick, 250);
  return () => { clearInterval(window._dfTick); tabsVisible(true); };
};
