/* =========================================================
   EPS ONE — Outil « Sauvetage aquatique » (APPN)
   Épreuve en étapes (départ, nage en distance ou en temps limité,
   obstacles, victimes / objets à ramener, matériel, geste de secours) ·
   bassin 15 / 25 / 50 m · individuel ou groupes de 2 à 6 (relais,
   ensemble, nageur / observateur) · projet (temps, distance, objets) ·
   séance en direct (longueurs, obstacles, objets, arrêts, gestes,
   relais, arrivées, bips) · écart projet / réalisé · historique · CSV ·
   Résultats des élèves. Même architecture que js/demifond.js
   (réutilise ses utilitaires dfFr, dfT, dfDur, dfParseT… et ses styles df-*).
   ========================================================= */
DB.sauvetage = DB.sauvetage || { seances: [], current: null };
ICONS.sauvetage = '<circle cx="12" cy="10" r="7"/><circle cx="12" cy="10" r="3"/><path d="M7.1 5.1l2.8 2.8M16.9 5.1l-2.8 2.8M7.1 14.9l2.8-2.8M16.9 14.9l-2.8-2.8"/><path d="M2 21c2 0 2-1.3 4-1.3s2 1.3 4 1.3 2-1.3 4-1.3 2 1.3 4 1.3 2-1.3 4-1.3"/>';

if (!document.getElementById('sv-css')) document.head.insertAdjacentHTML('beforeend', `<style id="sv-css">
.sv-et{border:1.5px solid var(--line);border-radius:14px;margin-top:10px;background:var(--card);min-width:0}
.sv-et>summary{list-style:none;cursor:pointer;padding:10px 12px;display:flex;gap:10px;align-items:center}
.sv-et>summary::-webkit-details-marker{display:none}
.sv-et>summary .n{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--grad);color:#fff;font-weight:900;flex:0 0 auto}
.sv-et>summary .t{flex:1;min-width:0;font-weight:800;line-height:1.25}
.sv-et>summary .t small{display:block;font-weight:600;color:var(--muted);font-size:.76rem}
.sv-et>summary .chev{flex:0 0 auto;transition:transform .2s;color:var(--muted)}
.sv-et[open]>summary .chev{transform:rotate(180deg)}
.sv-et .bd{padding:2px 12px 12px;border-top:1px solid var(--line)}
.sv-et .bd>label:first-child{margin-top:8px}
.sv-stp{display:inline-flex;align-items:center;border:1.5px solid var(--line);border-radius:10px;margin:4px 4px 0 0;overflow:hidden;background:var(--card);max-width:100%}
.sv-stp button{border:0;background:transparent;padding:7px 11px;font-weight:900;font-size:1rem;color:var(--text);min-width:0;cursor:pointer}
.sv-stp b{padding:0 2px;font-size:.84rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sv-stp.on{border-color:#2F6BD8;background:rgba(47,107,216,.1)}
.sv-stp .x{font-size:.75rem;color:var(--muted);padding:7px 8px 7px 2px}
.sv-inl{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.sv-inl input{width:88px;padding:8px;text-align:center}
.sv-bdg{display:inline-block;padding:1px 7px;border-radius:99px;background:var(--grad-soft);font-size:.72rem;font-weight:800;margin:2px 3px 0 0;white-space:nowrap;color:var(--text)}
.sv-acts{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
.sv-acts .btn{flex:1 1 auto;padding:8px 10px;font-size:.84rem;min-width:0}
.sv-safe{border-left:5px solid #E0463C}
.sv-safe ul{margin:6px 0 0;padding-left:18px;font-size:.82rem;line-height:1.45}
.sv-c .who{font-size:.9rem;font-weight:900;color:#2F6BD8;margin-top:2px}
.sv-c .stp{font-size:.76rem;font-weight:700;color:var(--muted);margin-top:3px;line-height:1.3}
.sv-c .cnt{display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin-top:6px}
.sv-c .cnt span{padding:2px 7px;border-radius:8px;background:var(--grad-soft);font-size:.78rem;font-weight:800;white-space:nowrap}
.sv-c .cnt span.ok{background:rgba(27,158,90,.2)}
.sv-c .cnt span.ko{background:rgba(224,70,60,.18)}
.sv-c .tt{font-size:.75rem;color:var(--muted);font-weight:700}
.sv-c .sv-nx{margin-top:8px;padding:15px 4px;font-size:1.02rem}
.sv-sk{display:flex;gap:4px;overflow-x:auto;margin-top:8px;padding-bottom:2px}
.sv-sk button{flex:0 0 auto;padding:5px 8px;border-radius:8px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.72rem;color:var(--text);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sv-sk .cur{border-color:#2F6BD8;box-shadow:inset 0 0 0 1px #2F6BD8}
.sv-sk .done{background:var(--grad-soft)}
.sv-sk .vw{outline:3px solid var(--gold);outline-offset:-1px}
.sv-ge{display:flex;flex-direction:column;gap:5px;margin-top:8px}
.sv-ge button{padding:10px 8px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.85rem;text-align:left;color:var(--text)}
.sv-ge button.on{border-color:var(--ok);background:rgba(27,158,90,.16)}
.sv-ge button:disabled{opacity:.4}
.df-obs .sv-ge button{padding:16px 10px;font-size:1.05rem}
.df-obs .sv-c .sv-nx{padding:22px 6px;font-size:1.3rem}
.sv-tot{font-size:.8rem;color:var(--muted);margin-top:8px;line-height:1.4}
</style>`);

/* ---------- Référentiels ---------- */
const svDB = () => { const D = DB.sauvetage = DB.sauvetage || {}; D.seances = D.seances || []; if (D.current === undefined) D.current = null; return D; };
const SV_DEP = { eau: ['🌊', 'Dans l\'eau'], saut: ['🦶', 'Saut du bord'], plongeon: ['🤿', 'Plongeon'], suite: ['➡️', 'Enchaîné'] };
const SV_NAGE = { dist: ['📏', 'Distance'], duree: ['⏱', 'Temps limité'], none: ['🧍', 'Au bord'] };
// [emoji, singulier, pluriel, victime|objet, féminin]
const SV_OJ = { mannequin: ['🧍', 'mannequin', 'mannequins', 'victime', 0], partenaire: ['🙋', 'partenaire', 'partenaires', 'victime', 0], anneau: ['⭕', 'anneau', 'anneaux', 'objet', 0], brique: ['🧱', 'brique', 'briques', 'objet', 1], objet: ['🔸', 'objet', 'objets', 'objet', 0] };
const SV_MAT = [['frite', 'Frite'], ['planche', 'Planche'], ['tube', 'Bouée-tube'], ['nipper', 'Nipper / perche'], ['palmes', 'Palmes']];
const SV_GEST = ['Protéger / sécuriser', 'Vérifier la conscience', 'Libérer les voies aériennes', 'Vérifier la respiration', 'PLS', 'Alerter (15 / 18 / 112)', 'Surveiller / couvrir'];
const SV_GEST_DEF = ['Vérifier la respiration', 'PLS', 'Alerter (15 / 18 / 112)'];
const SV_OBT = ['Tapis', 'Cage', 'Ligne d\'eau', 'Cerceau'];
const SV_ORG = {
  relais: ['🔁 Relais', 'Les membres se relaient : une étape chacun à tour de rôle (choix du nageur de chaque étape dans l\'onglet Épreuve). Le relais passe au suivant quand on touche « 🔁 Relais ».'],
  ensemble: ['👥 Ensemble', 'Le groupe réalise l\'épreuve ensemble (ex. sauveteur + « victime », remorquage à deux) : un seul résultat et un projet de groupe.'],
  vagues: ['👀 Nageur / observateur', 'Chaque membre fait toute l\'épreuve à son tour (vague 1, vague 2…) pendant que son partenaire l\'observe au bord et compte.'] };
const SV_GRPN = ['', 'individuel', 'duos', 'trios', 'quatuors', 'groupes de 5', 'groupes de 6'];

/* ---------- Étapes ---------- */
const svEt = (o = {}) => svNormEt({ lb: '', dep: 'suite', k: 'dist', m: 25, d: 120, ob: {}, oj: { n: 0, ty: 'mannequin', pr: 'surface' }, mat: [], matTx: '', gs: false, ge: [], ...o });
function svNormEt(s) {
  const d = { lb: '', dep: 'suite', k: 'dist', m: 25, d: 120, matTx: '', gs: false };
  Object.keys(d).forEach(k => { if (s[k] == null) s[k] = d[k]; });
  s.ob = s.ob && typeof s.ob === 'object' ? s.ob : {}; s.mat = Array.isArray(s.mat) ? s.mat : []; s.ge = Array.isArray(s.ge) ? s.ge : [];
  s.oj = { n: 0, ty: 'mannequin', pr: 'surface', ...(s.oj || {}) }; if (!SV_OJ[s.oj.ty]) s.oj.ty = 'objet';
  return s;
}
const svObN = s => Object.values(s.ob || {}).reduce((a, v) => a + (+v || 0), 0);
const svOjName = (ty, n) => (SV_OJ[ty] || SV_OJ.objet)[n > 1 ? 2 : 1];
const svOjTxt = s => { if (!s.oj.n) return ''; const T = SV_OJ[s.oj.ty] || SV_OJ.objet; return `${T[0]} ${s.oj.n} ${svOjName(s.oj.ty, s.oj.n)}${s.oj.pr === 'immerge' ? ' immergé' + (T[4] ? 'e' : '') + (s.oj.n > 1 ? 's' : '') : ''}`; };
const svNageLbl = s => s.k === 'duree' ? `⏱ ${dfDur(s.d)}` : s.k === 'none' ? '🧍 au bord' : `${dfFr(s.m, 0)} m`;
const svMatTxt = s => [...s.mat.map(m => (SV_MAT.find(x => x[0] === m) || [m, m])[1]), s.matTx].filter(Boolean).join(', ');
// Libellé court d'une étape (chips, en-têtes de colonnes)
const svEtShort = s => [svNageLbl(s), svObN(s) ? `🚧${svObN(s)}` : '', s.oj.n ? `${SV_OJ[s.oj.ty][0]}${s.oj.n}` : '', s.gs ? '⛑' : ''].filter(Boolean).join(' ');
// Libellé complet
function svEtLbl(s, c, short) {
  const P = [];
  if (s.dep !== 'suite') P.push(`${SV_DEP[s.dep][0]} ${SV_DEP[s.dep][1]}`);
  P.push(s.k === 'dist' ? `${dfFr(s.m, 0)} m (${svLongTxt(s.m, c)})` : s.k === 'duree' ? `⏱ ${dfDur(s.d)} de nage` : '🧍 au bord');
  if (svObN(s)) P.push('🚧 ' + Object.entries(s.ob).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${k.toLowerCase()}`).join(', '));
  if (s.oj.n) P.push(svOjTxt(s) + ' à ramener');
  if (svMatTxt(s)) P.push('🛟 ' + svMatTxt(s));
  if (s.gs) P.push('⛑ ' + (short ? `geste de secours (${s.ge.length} point${s.ge.length > 1 ? 's' : ''})` : s.ge.length ? s.ge.join(', ') : 'geste de secours'));
  return P.join(' · ');
}
const svLong = (m, c) => m / (c.bassin || 25);
const svLongTxt = (m, c) => { const n = svLong(m, c); return `${dfFr(n, 1)} longueur${n >= 2 ? 's' : ''}`; };
const svFormat = c => {
  const E = c.et, rel = c.grp > 1 && c.org === 'relais';
  if (E.length > 1 && E.every(s => s.k === 'dist' && s.m === E[0].m && !svObN(s) && !s.oj.n && !s.gs)) return `${rel ? 'Relais ' : ''}${E.length} × ${dfFr(E[0].m, 0)} m`;
  return (rel ? 'Relais · ' : '') + E.map(svEtShort).join(' → ');
};
const svDfix = c => c.et.reduce((a, s) => a + (s.k === 'dist' ? s.m : 0), 0);
const svTdur = c => c.et.reduce((a, s) => a + (s.k === 'duree' ? s.d : 0), 0);
const svNeed = c => ({ t: c.et.some(s => s.k !== 'duree'), m: c.et.some(s => s.k === 'duree'), o: c.et.some(s => s.oj.n > 0) });
const svKind = c => { const K = new Set(c.et.filter(s => s.oj.n).map(s => SV_OJ[s.oj.ty][3])); return K.size === 1 ? (K.has('victime') ? 'victimes' : 'objets') : 'victimes / objets'; };
const svV = v => v ? `${dfFr(v, 2)} m/s` : '–';
const svT25 = v => v ? `${dfFr(25 / v, 1)} s / 25 m` : '';

/* ---------- Configuration ---------- */
const SV_PRESETS = [
  ['Relais 4 × 25 m', () => ({ et: [0, 1, 2, 3].map(i => svEt({ dep: i ? 'suite' : 'plongeon', m: 25 })), relais: true })],
  ['Relais 4 × 25 m + victime', () => ({ et: [0, 1, 2, 3].map(i => svEt({ dep: i ? 'suite' : 'plongeon', m: 25, ...(i === 3 ? { lb: 'Remorquer la victime', oj: { n: 1, ty: 'mannequin', pr: 'surface' }, mat: ['tube'] } : {}) })), relais: true })],
  ['Ramener un mannequin 15 m', () => ({ et: [svEt({ lb: 'Aller vers la victime', dep: 'saut', m: 15 }), svEt({ lb: 'Remorquer la victime au bord', m: 15, oj: { n: 1, ty: 'mannequin', pr: 'immerge' } })] })],
  ['5 min : distance + objets', () => ({ et: [svEt({ lb: 'Nager et ramener un maximum d\'objets', dep: 'eau', k: 'duree', d: 300, oj: { n: 6, ty: 'anneau', pr: 'immerge' } })] })],
  ['Parcours obstacles + victime', () => ({ et: [svEt({ lb: 'Parcours d\'obstacles', dep: 'plongeon', m: 25, ob: { Tapis: 1, 'Ligne d\'eau': 1 } }),
    svEt({ lb: 'Ramener la victime', m: 25, oj: { n: 1, ty: 'partenaire', pr: 'surface' }, mat: ['tube'] }), svEt({ lb: 'Geste de secours', k: 'none', gs: true, ge: [...SV_GEST_DEF] })] })],
  ['Longueurs en 6 min', () => ({ et: [svEt({ dep: 'eau', k: 'duree', d: 360 })] })],
  ['50 m simple', () => ({ et: [svEt({ dep: 'eau', m: 50 })] })]];
const svDefCfg = () => ({ bassin: 25, grp: 1, org: 'relais', et: SV_PRESETS[4][1]().et, arrets: -1, tol: 10, cap: 0, refV: 0.8, obT: [...SV_OBT], geT: [...SV_GEST], bip: { mode: 'off', n: 30 }, pUnit: 'm' });
function svNorm(c) {
  const d = svDefCfg(); Object.keys(d).forEach(k => { if (c[k] == null) c[k] = dfClone(d[k]); });
  if (!Array.isArray(c.et) || !c.et.length) c.et = [svEt({ dep: 'eau' })];
  c.et.forEach(svNormEt); if (c.et[0].dep === 'suite') c.et[0].dep = 'eau';
  c.grp = Math.min(6, Math.max(1, +c.grp || 1)); if (!SV_ORG[c.org]) c.org = 'relais';
  return c;
}

/* ---------- Participants, projets, résultats ---------- */
const svNV = C => C.cfg.grp > 1 && C.cfg.org === 'vagues' ? Math.max(1, ...C.groups.map(g => g.members.length)) : 1;
const svRelay = (g, k) => { const r = g.relay && g.relay[k]; return r != null && r < g.members.length ? r : k % Math.max(1, g.members.length); };
function svSwimmers(C, g, k, w) {
  const c = C.cfg; if (!g.members.length) return [];
  if (c.grp === 1 || c.org === 'ensemble') return w ? [] : [...g.members];
  if (c.org === 'relais') return w ? [] : [g.members[svRelay(g, k)]];
  return g.members[w] ? [g.members[w]] : [];
}
const svUnits = (C, w, only) => C.groups.map((g, gi) => ({ g, gi, w })).filter(u => (only == null || u.gi === only) && svSwimmers(C, u.g, 0, w).length);
const svRel = C => C.cfg.grp > 1 && C.cfg.org === 'relais';
const svGrpProj = C => C.cfg.grp > 1 && ['relais', 'ensemble'].includes(C.cfg.org);
// étapes et vague d'un élève
function svMemRuns(C, g, n) {
  const all = C.cfg.et.map((s, k) => k);
  if (C.cfg.grp > 1 && C.cfg.org === 'vagues') { const w = g.members.indexOf(n); return { w: Math.max(0, w), ks: all }; }
  if (svRel(C)) return { w: 0, ks: all.filter(k => g.members[svRelay(g, k)] === n) };
  return { w: 0, ks: all };
}
const svRun = (g, w) => (g.res || {})[w] || null;
const svMkX = s => ({ s, e: null, fin: false, arr: false, L: 0, adj: 0, ob: 0, oj: 0, g: {}, st: 0 });
const svRaw = (x, c) => Math.max(0, x.L * c.bassin + (x.adj || 0));
// Résultat d'une étape terminée
function svStepR(C, R, k) {
  const c = C.cfg, s = c.et[k], x = R && R.x && R.x[k]; if (!s || !x || !x.fin) return null;
  const raw = svRaw(x, c), dist = s.k === 'none' ? 0 : s.k === 'dist' ? (x.arr ? s.m : Math.min(raw, s.m)) : raw;
  const gT = s.gs ? s.ge.length : 0, gN = s.gs ? s.ge.filter(n => x.g && x.g[n]).length : 0;
  return { k, t: Math.max(0, (x.e || 0) - x.s), dist, dDur: s.k === 'duree' ? dist : 0, partial: s.k === 'dist' && !x.arr, L: x.L, ob: x.ob, obT: svObN(s), oj: x.oj, ojT: s.oj.n, gN, gT, st: x.st, swim: s.k !== 'none' };
}
// Bilan d'un ensemble d'étapes + écarts au projet P = { t, m, o }
function svAgg(C, R, ks, P) {
  const c = C.cfg, L = ks.map(k => svStepR(C, R, k)).filter(Boolean); if (!L.length) return null;
  const sum = f => L.reduce((a, r) => a + (+r[f] || 0), 0);
  const S = { steps: L, n: L.length, nT: ks.length, t: sum('t'), dist: sum('dist'), dDur: sum('dDur'), swT: L.filter(r => r.swim).reduce((a, r) => a + r.t, 0), ob: sum('ob'), obT: ks.reduce((a, k) => a + svObN(c.et[k]), 0),
    oj: sum('oj'), ojT: ks.reduce((a, k) => a + c.et[k].oj.n, 0), gN: sum('gN'), gT: ks.reduce((a, k) => a + (c.et[k].gs ? c.et[k].ge.length : 0), 0), st: sum('st'), capped: !!(R && R.capped) };
  S.partial = L.some(r => r.partial) || L.length < ks.length;
  return svFin(C, S, P);
}
function svFin(C, S, P) {
  const c = C.cfg, N = svNeed(c);
  S.v = S.swT > 0 && S.dist > 0 ? S.dist / S.swT : null; S.allowed = c.arrets < 0 ? null : c.arrets; S.over = S.allowed != null && S.st > S.allowed;
  S.gOK = S.gT ? S.gN >= S.gT : null; S.P = P || null;
  if (P) { const E = [];
    if (N.t && P.t > 0 && !S.partial) { S.et = S.t - P.t; S.etp = S.et / P.t; E.push(S.etp); }
    if (N.m && P.m > 0) { S.ed = (N.t ? S.dDur : S.dist) - P.m; S.edp = S.ed / P.m; E.push(S.edp); }
    if (N.o && P.o != null && P.o !== '' && P.o >= 0) { S.eo = S.oj - P.o; S.eop = P.o > 0 ? S.eo / P.o : null; if (S.eop != null) E.push(S.eop); else E.push(S.eo ? 1 : 0); }
    S.eAbs = E.length ? E.reduce((a, e) => a + Math.abs(e), 0) / E.length : null; }
  return S;
}
function svMember(C, g, n) {
  const M = svMemRuns(C, g, n); if (!M.ks.length) return null;
  const P = svRel(C) ? null : (g.proj || {})[svGrpProj(C) ? '_g' : n];
  const S = svAgg(C, svRun(g, M.w), M.ks, P); if (S && svRel(C)) S.relOf = g.name; return S;
}
function svGroup(C, g) {
  const c = C.cfg;
  if (c.grp === 1) return svMember(C, g, g.members[0]);
  if (c.org !== 'vagues') return svAgg(C, svRun(g, 0), c.et.map((s, k) => k), (g.proj || {})._g);
  const M = g.members.map(n => svMember(C, g, n)).filter(Boolean); if (!M.length) return null;
  const S = {}; ['n', 'nT', 't', 'dist', 'dDur', 'swT', 'ob', 'obT', 'oj', 'ojT', 'gN', 'gT', 'st'].forEach(f => S[f] = M.reduce((a, m) => a + (m[f] || 0), 0));
  S.partial = M.some(m => m.partial) || M.length < g.members.length; svFin(C, S, null);
  const E = M.filter(m => m.eAbs != null); S.eAbs = E.length ? E.reduce((a, m) => a + m.eAbs, 0) / E.length : null; S.over = M.some(m => m.over); return S;
}
const svCls = (e, c) => e == null ? '' : Math.abs(e) * 100 <= c.tol ? 'df-ok' : Math.abs(e) * 100 <= 2 * c.tol ? 'df-mid' : 'df-ko';
const svClsO = eo => eo == null ? '' : eo === 0 ? 'df-ok' : Math.abs(eo) <= 1 ? 'df-mid' : 'df-ko';
// Vitesse (m/s) correspondant à un projet
function svProjV(c, P) {
  if (!P) return null; const N = svNeed(c), Df = svDfix(c), Td = svTdur(c);
  if (N.t && N.m) return P.t > 0 && P.m > 0 ? (Df + P.m) / P.t : null;
  if (N.t) return P.t > 0 && Df ? Df / P.t : null;
  return P.m > 0 && Td ? P.m / Td : null;
}
const svProjOf = (C, g, w) => { const c = C.cfg; if (svGrpProj(C)) return (g.proj || {})._g; return (g.proj || {})[c.grp > 1 && c.org === 'vagues' ? g.members[w] : g.members[0]]; };

/* =========================================================
   L'OUTIL
   ========================================================= */
TOOL_IMPL.sauvetage = function (el) {
  const D = liveDB(svDB);   // toujours l'objet synchronisé actuel
  let tab = D.current ? 'live' : 'prep', rk = 'ecart', iv = null, openRec = null;
  const openEt = new Set([0]), view = {};
  const cur = () => svDB().current;
  const started = C => C && C.live && (C.live.st !== 'idle' || C.live.w > 0 || C.groups.some(g => g.res && Object.keys(g.res).length));

  function frame() {
    el.innerHTML = `<div class="co-tabs df-tabs">${[['prep', '⚙️', 'Épreuve'], ['projet', '🎯', 'Projets'], ['live', '⏱', 'Séance'], ['res', '📊', 'Résultats']].map(([k, i, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}"><span>${i}</span>${l}</button>`).join('')}</div><div id="sv-body"></div>`;
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; frame(); });
    const box = el.querySelector('#sv-body'), C = cur();
    if (tab === 'res') return results(box);
    if (tab === 'prep') return C ? prepCur(box, C) : prepNew(box);
    if (!C) { box.innerHTML = `<div class="card empty">Préparez d'abord l'épreuve et les groupes dans l'onglet <b>⚙️ Épreuve</b>.<br><br><button class="btn btn-grad" id="gop">⚙️ Préparer l'épreuve</button></div>`; box.querySelector('#gop').onclick = () => { tab = 'prep'; frame(); }; return; }
    if (tab === 'projet') return projets(box, C);
    live(box, C);
  }
  const tabsVisible = on => { const tb = el.querySelector('.co-tabs'); if (tb) tb.style.display = on ? '' : 'none'; };

  const safetyCard = c => `<details class="card sv-safe" style="margin-top:12px"><summary style="cursor:pointer"><b>⚠️ Sécurité</b> <span class="muted" style="font-size:.8rem">surveillance, binômes, profondeur, matériel</span></summary><ul>
      <li><b>Surveillance</b> : l'enseignant reste au bord avec une vue sur tout le bassin ; perche et bouée à portée de main ; signal d'arrêt connu de tous.</li>
      <li><b>Binômes</b> : chaque nageur a un observateur au bord qui le suit des yeux du départ à l'arrivée.</li>
      <li><b>Profondeur</b> : plongeon seulement si la profondeur le permet (≥ 1,80 m) ; objets et mannequins immergés adaptés au niveau (pas d'apnée prolongée, pas d'hyperventilation).</li>
      <li><b>Matériel</b> : bouées-tubes, frites et mannequins vérifiés ; lignes d'eau et obstacles fixés ; « victime » partenaire volontaire et consignes de simulation claires.</li></ul>
      ${c && c.et.some(s => s.dep === 'plongeon') ? '<p class="df-help" style="color:var(--danger);font-weight:700">🤿 L\'épreuve comporte un plongeon : vérifiez la profondeur à l\'endroit du départ.</p>' : ''}</details>`;

  /* ---------- Formulaire de configuration (lié à un objet cfg) ---------- */
  function cfgForm(host, c, onChange, locked) {
    svNorm(c);
    const tog = (attr, list, val, extra = '') => `<div class="tog">${list.map(([v, l]) => `<button data-${attr}="${v}" ${extra} class="${String(val) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    const etog = (k, f, list, val) => `<div class="tog">${list.map(([v, l]) => `<button data-ek="${k}" data-f="${f}" data-v="${esc(String(v))}" class="${String(val) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    const stp = (k, f, v, lbl, on, del) => `<span class="sv-stp ${on ? 'on' : ''}"><button data-ek="${k}" data-f="${f}-" data-v="${esc(v)}" aria-label="moins">−</button><b>${lbl}</b><button data-ek="${k}" data-f="${f}+" data-v="${esc(v)}" aria-label="plus">+</button>${del ? `<button class="x" data-obdel="${esc(v)}" aria-label="Supprimer ce type">✕</button>` : ''}</span>`;
    const eq = s => s.k === 'dist' ? `= ${svLongTxt(s.m, c)} de ${c.bassin} m · ≈ ${dfT(s.m / c.refV)} à ${dfFr(c.refV, 2)} m/s`
      : s.k === 'duree' ? `≈ ${dfFr(c.refV * s.d, 0)} m à ${dfFr(c.refV, 2)} m/s, soit ${svLongTxt(c.refV * s.d, c)} de ${c.bassin} m` : 'Atelier au bord : chronométré, sans distance nagée.';
    const etHTML = (s, k) => `<details class="sv-et" data-et="${k}" ${openEt.has(k) ? 'open' : ''}><summary data-free><span class="n">${k + 1}</span><span class="t">${s.lb ? esc(s.lb) : `Étape ${k + 1}`}<small>${esc(svEtLbl(s, c))}</small></span><span class="chev">▾</span></summary><div class="bd">
        <label>Intitulé (facultatif)</label><input data-ek="${k}" data-f="lb" value="${esc(s.lb)}" placeholder="ex. Aller chercher la victime">
        <label>Départ</label>${etog(k, 'dep', Object.entries(SV_DEP).filter(([d]) => k || d !== 'suite').map(([d, v]) => [d, v[0] + ' ' + (d === 'suite' && svRel({ cfg: c }) ? 'Enchaîné / relais' : v[1])]), s.dep)}
        <label>Nage</label>${etog(k, 'k', Object.entries(SV_NAGE).map(([d, v]) => [d, v[0] + ' ' + v[1]]), s.k)}
        ${s.k === 'dist' ? `<div class="sv-inl" style="margin-top:6px"><input data-ek="${k}" data-f="m" type="number" min="5" step="5" value="${s.m}" aria-label="Distance étape ${k + 1}"><span class="muted">m</span><span class="muted">ou</span><input data-ek="${k}" data-f="L" type="number" min="0.5" step="0.5" value="${dfFr(svLong(s.m, c), 2).replace(',', '.')}" aria-label="Longueurs étape ${k + 1}"><span class="muted">longueur(s)</span></div>`
          : s.k === 'duree' ? `<div class="sv-inl" style="margin-top:6px"><input data-ek="${k}" data-f="d" value="${dfT(s.d)}" inputmode="numeric" aria-label="Durée étape ${k + 1}"><span class="muted">min:s · distance maximale dans le temps</span></div>` : ''}
        <div class="df-eq">${eq(s)}</div>
        <label>🚧 Obstacles à franchir</label><div>${c.obT.map(t => stp(k, 'ob', t, `${esc(t)} ${s.ob[t] || 0}`, s.ob[t] > 0, !SV_OBT.includes(t) && !c.et.some(e => e.ob[t] > 0))).join('')}</div>
        <div class="sv-inl" style="margin-top:6px"><input data-obadd="${k}" placeholder="Autre obstacle…" style="width:170px;text-align:left"><button class="btn btn-ghost" data-obaddok="${k}" style="padding:8px 12px">＋</button></div>
        <label>🧍 Victimes / objets à ramener au bord</label><div class="sv-inl">${stp(k, 'ojn', '', `${s.oj.n} à ramener${s.k === 'duree' && s.oj.n ? ' (objectif)' : ''}`, s.oj.n > 0)}</div>
        ${s.oj.n ? `${etog(k, 'ojty', Object.entries(SV_OJ).map(([t, v]) => [t, v[0] + ' ' + v[1][0].toUpperCase() + v[1].slice(1)]), s.oj.ty)}${etog(k, 'ojpr', [['surface', '〰️ En surface'], ['immerge', '⬇️ Immergé']], s.oj.pr)}` : ''}
        <label>🛟 Matériel de sauvetage</label><div class="tog">${SV_MAT.map(([m, l]) => `<button data-ek="${k}" data-f="mat" data-v="${m}" class="${s.mat.includes(m) ? 'on' : ''}">${l}</button>`).join('')}</div>
        <input data-ek="${k}" data-f="matTx" value="${esc(s.matTx)}" placeholder="Autre matériel (texte libre)…" style="margin-top:6px">
        <label>⛑ Geste de secours à réaliser au bord</label>${etog(k, 'gs', [[0, 'Non'], [1, 'Oui']], s.gs ? 1 : 0)}
        ${s.gs ? `<div class="tog" style="margin-top:6px">${[...new Set([...c.geT, ...s.ge])].map(n => `<button data-ek="${k}" data-f="ge" data-v="${esc(n)}" class="${s.ge.includes(n) ? 'on' : ''}">${s.ge.includes(n) ? '☑' : '☐'} ${esc(n)}</button>`).join('')}</div>
          <div class="sv-inl" style="margin-top:6px"><input data-geadd="${k}" placeholder="Autre geste…" style="width:170px;text-align:left"><button class="btn btn-ghost" data-geaddok="${k}" style="padding:8px 12px">＋</button></div>
          <p class="df-help">Liste validée en direct (✔ case par case) ; geste réussi = toutes les cases cochées.</p>` : ''}
        <div class="sv-acts"><button class="btn btn-ghost" data-ek="${k}" data-f="up" ${k ? '' : 'disabled'}>↑ Monter</button><button class="btn btn-ghost" data-ek="${k}" data-f="dn" ${k < c.et.length - 1 ? '' : 'disabled'}>↓ Descendre</button><button class="btn btn-ghost" data-ek="${k}" data-f="dup" ${c.et.length >= 12 ? 'disabled' : ''}>⧉ Dupliquer</button>${c.et.length > 1 ? `<button class="btn btn-ghost" data-ek="${k}" data-f="del">✕ Supprimer</button>` : ''}</div>
      </div></details>`;
    const N = svNeed(c), Df = svDfix(c), Td = svTdur(c), obTot = c.et.reduce((a, s) => a + svObN(s), 0), ojTot = c.et.reduce((a, s) => a + s.oj.n, 0);
    host.innerHTML = `<div class="card" data-cfg><h3 style="margin-top:0">🏊 Bassin et groupement</h3>
        ${locked ? '<p class="muted" style="margin:0 0 8px">🔒 Épreuve commencée : le format n\'est plus modifiable (les bips restent réglables dans l\'onglet Séance).</p>' : ''}
        <label style="margin-top:0">Longueur du bassin</label>${tog('bas', [[15, '15 m'], [25, '25 m'], [50, '50 m'], ['x', 'Autre']], [15, 25, 50].includes(c.bassin) ? c.bassin : 'x')}
        ${[15, 25, 50].includes(c.bassin) ? '' : `<div class="sv-inl" style="margin-top:6px"><input id="basx" type="number" min="5" step="1" value="${c.bassin}"> m</div>`}
        <label>Groupement</label>${tog('grp', [[1, 'Individuel'], [2, 'Duo'], [3, 'Trio'], [4, 'Quatuor'], [5, '5'], [6, '6']], c.grp)}
        ${c.grp > 1 ? `<label>Organisation</label>${tog('org', Object.entries(SV_ORG).map(([k, v]) => [k, v[0]]), c.org)}<p class="df-help">${SV_ORG[c.org][1]}</p>` : ''}</div>

      <div class="card" data-cfg style="margin-top:12px"><h3 style="margin-top:0">🛟 Épreuve (${c.et.length} étape${c.et.length > 1 ? 's' : ''})</h3>
        <label style="margin-top:0">Épreuves types</label><div class="tog" id="pre">${SV_PRESETS.map(([l], i) => `<button data-pre="${i}">${l}</button>`).join('')}</div>
        <p class="df-help">Une épreuve = une suite d'étapes (ateliers) enchaînées : départ, nage (distance ou temps limité), obstacles, victimes / objets, matériel, geste de secours. ${svRel({ cfg: c }) ? 'En relais, chaque étape = un relayeur.' : ''}</p>
        <div id="ets">${c.et.map(etHTML).join('')}</div>
        <button class="btn btn-ghost btn-block" id="add" style="margin-top:10px" ${c.et.length >= 12 ? 'disabled' : ''}>＋ Ajouter une étape</button>
        <div class="sv-tot">Total : ${Df ? `<b>${dfFr(Df, 0)} m</b> (${svLongTxt(Df, c)})` : ''}${Df && Td ? ' + ' : ''}${Td ? `<b>${dfDur(Td)}</b> de nage libre en distance` : ''}${obTot ? ` · 🚧 ${obTot} obstacle${obTot > 1 ? 's' : ''}` : ''}${ojTot ? ` · ${ojTot} ${svKind(c)}` : ''}${c.et.some(s => s.gs) ? ' · ⛑ geste de secours' : ''}
          <br>Projet demandé : ${[N.t ? 'temps' : '', N.m ? 'distance' : '', N.o ? svKind(c) : ''].filter(Boolean).join(', ')}.</div>
        <label>⏳ Temps limite de l'épreuve (facultatif)</label><div class="sv-inl"><input id="cap" value="${c.cap ? dfT(c.cap) : ''}" placeholder="aucun" inputmode="numeric"><span class="muted">min:s · au-delà, arrêt pour tous (bip 1 min avant)</span></div></div>

      <div class="card" data-cfg style="margin-top:12px"><h3 style="margin-top:0">🎯 Règles</h3>
        <label style="margin-top:0">Arrêts / appuis au bord autorisés (sur l'épreuve)</label>${tog('arr', [[0, '0'], [1, '1'], [2, '2'], [3, '3'], [-1, 'Illimité']], c.arrets)}
        <label>Tolérance « projet respecté » (± %)</label><input id="tol" type="number" min="1" max="50" step="1" value="${c.tol}" style="max-width:120px">
        <p class="df-help">Temps et distance : vert si l'écart ≤ ${c.tol} %, orange ≤ ${2 * c.tol} %, rouge au-delà. Victimes / objets : vert si exact, orange à ± 1.</p>
        <label>Vitesse de référence pour les équivalences</label><div class="sv-inl"><input id="refv" type="number" step="0.05" min="0.2" max="2.5" value="${c.refV}"><span class="muted">m/s (${dfFr(c.refV * 3.6, 1)} km/h · ${dfFr(25 / c.refV, 1)} s / 25 m)</span></div></div>`;
    const $ = s => host.querySelector(s), all = s => host.querySelectorAll(s), ch = () => onChange();
    all('details.sv-et').forEach(d => d.ontoggle = () => { const k = +d.dataset.et; if (d.open) openEt.add(k); else openEt.delete(k); });
    all('[data-pre]').forEach(b => b.onclick = () => { const p = SV_PRESETS[+b.dataset.pre][1](); c.et = p.et; c.cap = 0; if (p.relais) { c.org = 'relais'; if (c.grp === 1) c.grp = 4; }
      openEt.clear(); if (c.et.length === 1) openEt.add(0); ch(); });
    all('[data-bas]').forEach(b => b.onclick = () => { const v = b.dataset.bas; c.bassin = v === 'x' ? ([15, 25, 50].includes(c.bassin) ? 33 : c.bassin) : +v; ch(); });
    if ($('#basx')) $('#basx').onchange = () => { c.bassin = Math.max(5, Math.round(dfNum($('#basx').value) || 25)); ch(); };
    all('[data-grp]').forEach(b => b.onclick = () => { c.grp = +b.dataset.grp; ch(); });
    all('[data-org]').forEach(b => b.onclick = () => { c.org = b.dataset.org; ch(); });
    all('[data-arr]').forEach(b => b.onclick = () => { c.arrets = +b.dataset.arr; ch(); });
    $('#tol').onchange = () => { c.tol = Math.min(50, Math.max(1, dfNum($('#tol').value) || 10)); ch(); };
    $('#refv').onchange = () => { c.refV = Math.min(3, Math.max(0.2, dfNum($('#refv').value) || 0.8)); ch(); };
    $('#cap').onchange = () => { const v = $('#cap').value.trim(); if (!v || v === '0') c.cap = 0; else { const s = dfParseT(v); if (s == null) toast('Durée non reconnue (ex. 6:00)'); else c.cap = Math.max(10, s); } ch(); };
    $('#add').onclick = () => { c.et.push(svEt({ m: c.bassin })); openEt.add(c.et.length - 1); ch(); };
    const act = (b, ev) => { const k = +b.dataset.ek, s = c.et[k], f = b.dataset.f, v = b.dataset.v; if (!s) return;
      if (ev === 'input') {
        if (f === 'lb') s.lb = b.value.trim(); else if (f === 'matTx') s.matTx = b.value.trim();
        else if (f === 'm') s.m = Math.max(5, Math.round(dfNum(b.value) || c.bassin));
        else if (f === 'L') s.m = Math.max(5, Math.round((dfNum(b.value) || 1) * c.bassin));
        else if (f === 'd') { const t = dfParseT(b.value); if (t == null) toast('Durée non reconnue (ex. 5:00 ou 90 s)'); else s.d = Math.max(10, t); }
        return ch(); }
      if (f === 'dep') s.dep = v; else if (f === 'k') s.k = v;
      else if (f === 'ob+' || f === 'ob-') { s.ob[v] = Math.max(0, (s.ob[v] || 0) + (f === 'ob+' ? 1 : -1)); if (!s.ob[v]) delete s.ob[v]; }
      else if (f === 'ojn+' || f === 'ojn-') s.oj.n = Math.min(30, Math.max(0, s.oj.n + (f === 'ojn+' ? 1 : -1)));
      else if (f === 'ojty') s.oj.ty = v; else if (f === 'ojpr') s.oj.pr = v;
      else if (f === 'mat') s.mat = s.mat.includes(v) ? s.mat.filter(x => x !== v) : [...s.mat, v];
      else if (f === 'gs') { s.gs = v === '1'; if (s.gs && !s.ge.length) s.ge = [...SV_GEST_DEF]; }
      else if (f === 'ge') s.ge = s.ge.includes(v) ? s.ge.filter(x => x !== v) : [...s.ge, v];
      else if (f === 'up' || f === 'dn') { const j = f === 'up' ? k - 1 : k + 1; if (j < 0 || j >= c.et.length) return; [c.et[k], c.et[j]] = [c.et[j], c.et[k]]; if (!k || !j) [c.et[k].dep, c.et[j].dep] = [c.et[j].dep, c.et[k].dep];
        const a = openEt.has(k), bb = openEt.has(j); openEt.delete(k); openEt.delete(j); if (a) openEt.add(j); if (bb) openEt.add(k); if (!c.et[0].dep || c.et[0].dep === 'suite') c.et[0].dep = 'eau'; }
      else if (f === 'dup') { c.et.splice(k + 1, 0, svNormEt(dfClone({ ...s, dep: 'suite' }))); openEt.add(k + 1); }
      else if (f === 'del') { if (!confirm(`Supprimer l'étape ${k + 1} ?`)) return; c.et.splice(k, 1); openEt.clear(); if (c.et[0].dep === 'suite') c.et[0].dep = 'eau'; }
      ch(); };
    all('[data-f]').forEach(b => { if (b.tagName === 'INPUT') b.onchange = () => act(b, 'input'); else b.onclick = () => act(b, 'click'); });
    all('[data-obaddok]').forEach(b => b.onclick = () => { const k = +b.dataset.obaddok, i = host.querySelector(`[data-obadd="${k}"]`), t = (i.value || '').trim().replace(/^\w/, m => m.toUpperCase());
      if (!t) return toast('Nom de l\'obstacle ?'); if (!c.obT.includes(t)) c.obT.push(t); c.et[k].ob[t] = (c.et[k].ob[t] || 0) + 1; ch(); });
    all('[data-obdel]').forEach(b => b.onclick = () => { const t = b.dataset.obdel; c.obT = c.obT.filter(x => x !== t); c.et.forEach(s => delete s.ob[t]); ch(); });
    all('[data-geaddok]').forEach(b => b.onclick = () => { const k = +b.dataset.geaddok, i = host.querySelector(`[data-geadd="${k}"]`), t = (i.value || '').trim();
      if (!t) return toast('Nom du geste ?'); if (!c.geT.includes(t)) c.geT.push(t); if (!c.et[k].ge.includes(t)) c.et[k].ge.push(t); ch(); });
    all('[data-obadd],[data-geadd]').forEach(i => i.onkeydown = e => { if (e.key === 'Enter') host.querySelector(i.dataset.obadd != null ? `[data-obaddok="${i.dataset.obadd}"]` : `[data-geaddok="${i.dataset.geadd}"]`).click(); });
    if (locked) all('input,button:not(.chev)').forEach(x => x.disabled = true);
  }

  /* ---------- Préparation (pas encore de séance) ---------- */
  function prepNew(box) {
    const c = D.lastCfg = svNorm(D.lastCfg || svDefCfg());
    box.innerHTML = `<div class="card" data-cfg><label style="margin-top:0">Nom de la séance</label><input id="nm" value="Sauvetage ${new Date().toLocaleDateString('fr-FR')}"></div>
      <div id="cfg" style="margin-top:12px"></div>
      <div class="card" data-cfg style="margin-top:12px"><h3 style="margin-top:0" id="cmpt"></h3><div id="cmp"></div></div>
      ${safetyCard(c)}`;
    const $ = s => box.querySelector(s);
    const syncCmp = () => {
      $('#cmpt').textContent = c.grp === 1 ? '🧑 Élèves (épreuve individuelle)' : `👥 Former les ${SV_GRPN[c.grp]}`;
      if ($('#sv-k')) { $('#sv-k').value = 's'; $('#sv-v').value = c.grp; const rw = $('#sv-k').closest('.row'); if (rw) rw.style.display = c.grp === 1 ? 'none' : ''; }
      const sg = $('#sv-seg'); if (sg) { sg.style.display = c.grp === 1 ? 'none' : ''; if (sg.previousElementSibling && sg.previousElementSibling.tagName === 'LABEL') sg.previousElementSibling.style.display = c.grp === 1 ? 'none' : ''; }
      const go = $('#sv-go'); if (go) go.textContent = c.grp === 1 ? '▶ Valider les élèves de la classe' : '▶ Former les groupes';
    };
    const redraw = () => { save(); cfgForm($('#cfg'), c, redraw); syncCmp(); const sf = box.querySelector('.sv-safe'); if (sf) { const o = sf.open; sf.outerHTML = safetyCard(c); if (o) box.querySelector('.sv-safe').open = true; } };
    cfgForm($('#cfg'), c, redraw);
    if (!DB.classes.length) { $('#cmp').innerHTML = noClassMsg; syncCmp(); partMount(box, 'sauvetage', p => join(box, p)); return; }
    mountComposer($('#cmp'), { id: 'sv', modes: ['random', 'hetero', 'homo'], button: '▶ Former les groupes', prep: false,
      onTeams: teams => {
        const cls = $('#sv-cls') ? $('#sv-cls').value : '', order = studentsOf(cls);
        let T = teams.filter(t => t.members.length);
        if (c.grp === 1) T = T.flatMap(t => t.members).sort((a, b) => order.indexOf(a.n) - order.indexOf(b.n)).map(m => ({ name: m.n, members: [m] }));
        const groups = T.map(t => { const members = t.members.map(m => m.n); return { name: c.grp === 1 ? members[0] : t.name.replace('Équipe', 'Groupe'), members, relay: [], proj: {}, res: {} }; });
        D.current = { id: Date.now().toString(36), date: Date.now(), nom: $('#nm').value.trim() || 'Sauvetage', classe: cls, cfg: dfClone(c), groups, live: { st: 'idle', w: 0 }, undo: [] };
        pub(D.current, true); save(); tab = 'prep'; frame(); toast(c.grp === 1 ? `${groups.length} élèves prêts ✔` : `${groups.length} groupes formés ✔`);
      } });
    syncCmp();
    partMount(box, 'sauvetage', p => join(box, p));
  }

  /* ---------- Séance partagée avec d'autres tablettes (une tablette par groupe) ---------- */
  const pub = (C, create) => { if (!C || C.joined || typeof partPublish !== 'function') return;
    partPublish('sauvetage', C.id, { nom: C.nom, classe: C.classe, ng: C.groups.length, indiv: C.cfg.grp === 1, ep: svFormat(C.cfg),
      tpl: { nom: C.nom, classe: C.classe, cfg: C.cfg, groups: C.groups.map(g => ({ name: g.name, members: g.members, relay: g.relay || [], proj: g.proj || {} })) } }, create); };
  const join = (box, p) => { const T = p.tpl;
    D.current = { id: p.id, date: Date.now(), nom: T.nom, classe: T.classe, cfg: svNorm(T.cfg), joined: true, live: { st: 'idle', w: 0 }, undo: [],
      groups: T.groups.map(g => ({ name: g.name, members: [...g.members], relay: [...(g.relay || [])], proj: dfClone(g.proj || {}), res: {} })) };
    save(); partPickGroup(box, D.current.groups, i => { if (!D.current) return frame(); D.current.only = i; save(); tab = 'live'; frame(); }, D.current.cfg.grp === 1); };

  /* ---------- Préparation (séance créée) : groupes, relais ---------- */
  function prepCur(box, C) {
    const c = svNorm(C.cfg), lock = started(C), rel = svRel(C);
    box.innerHTML = `<div class="card"><b style="font-size:1.1rem">${esc(C.nom)}</b>
        <div class="muted">${esc(C.classe || '')} · bassin ${c.bassin} m · ${esc(svFormat(c))} · ${c.grp === 1 ? 'individuel' : SV_GRPN[c.grp] + ' · ' + SV_ORG[c.org][0]}</div>
        <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="gopj">🎯 Projets</button><button class="btn btn-ghost" id="golv">⏱ Aller à la séance</button></div></div>
      <div class="card" data-cfg style="margin-top:12px"><div style="display:flex;align-items:center;gap:8px"><h3 style="margin:0;flex:1">${c.grp === 1 ? '🧑 Élèves' : '👥 Groupes'} (${C.groups.length})</h3><button class="btn btn-ghost" id="edg" style="padding:8px 12px">✏️ Modifier</button></div>
        ${rel ? '<p class="df-help">Choisissez qui nage chaque étape (relais).</p>' : ''}
        ${c.grp === 1 ? `<div style="margin-top:6px">${C.groups.map(g => `<span class="df-mem">${esc(g.members[0])}</span>`).join('')}</div>`
          : C.groups.map((g, gi) => `<div style="padding:8px 0;border-top:1px solid var(--line)"><b>${esc(g.name)}</b><br>${g.members.map(n => `<span class="df-mem">${esc(n)}</span>`).join('')}
          ${rel ? `<div style="display:flex;flex-wrap:wrap;gap:6px 10px;margin-top:6px">${c.et.map((s, k) => `<div style="display:flex;align-items:center;gap:4px"><span class="muted" style="font-size:.75rem">É${k + 1}</span><select data-rl="${gi}|${k}" style="padding:5px 6px;width:auto;font-size:.82rem" ${lock ? 'disabled' : ''}>${g.members.map((n, mi) => `<option value="${mi}" ${svRelay(g, k) === mi ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>`).join('')}</div>
            <div class="muted" style="font-size:.75rem;margin-top:4px">${g.members.map((n, mi) => `${esc(n)} : ${c.et.filter((s, k) => svRelay(g, k) === mi).length} étape(s)`).join(' · ')}</div>` : ''}</div>`).join('')}
        ${c.grp > 1 && c.org === 'vagues' ? `<p class="df-help">Vague 1 : ${C.groups.map(g => esc(g.members[0] || '—')).join(', ')} nagent, leurs partenaires observent ; puis on inverse.</p>` : ''}</div>
      <div id="cfg" style="margin-top:12px"></div>
      ${safetyCard(c)}
      <div class="row" style="margin-top:12px"><button class="btn btn-ghost" data-prof id="aband">🗑 Abandonner la séance</button></div>`;
    const $ = s => box.querySelector(s), keep = () => { save(); pub(C); };
    $('#gopj').onclick = () => { tab = 'projet'; frame(); };
    $('#golv').onclick = () => { tab = 'live'; frame(); };
    box.querySelectorAll('[data-rl]').forEach(s => s.onchange = () => { const [gi, k] = s.dataset.rl.split('|').map(Number), g = C.groups[gi]; g.relay = g.relay || []; g.relay[k] = +s.value; keep(); prepCur(box, C); });
    $('#edg').onclick = () => editGroupsPanel(c.grp === 1 ? 'Élèves de l\'épreuve' : 'Groupes de l\'épreuve', { cls: C.classe, indiv: c.grp === 1, list: () => C.groups, names: g => g.members,
      take: (g, n) => { const i = g.members.indexOf(n); g.members.splice(i, 1); const d = { proj: g.proj && g.proj[n] }; if (g.proj) delete g.proj[n]; return d; },
      put: (g, n, d) => { g.members.push(n); g.proj = g.proj || {}; if (d && d.proj) g.proj[n] = d.proj; },
      make: name => ({ name, members: [], relay: [], proj: {}, res: {} }), rename: (g, nm) => { g.name = nm; }, onChange: keep, onClose: () => prepCur(box, C) });
    $('#aband').onclick = () => { if (!confirm('Abandonner cette séance (les saisies seront perdues) ?')) return; if (typeof partAskRemove === 'function') partAskRemove(C); D.current = null; save(); tab = 'prep'; frame(); };
    cfgForm($('#cfg'), c, () => { keep(); prepCur(box, C); }, lock);
  }

  /* ---------- Projets ---------- */
  function projets(box, C) {
    const c = C.cfg, N = svNeed(c), grpP = svGrpProj(C), Df = svDfix(c), Td = svTdur(c), ojT = c.et.reduce((a, s) => a + s.oj.n, 0), kind = svKind(c);
    const parts = C.groups.flatMap((g, gi) => grpP ? [{ g, gi, key: '_g', label: g.name, sub: g.members.join(', ') }] : g.members.map(n => ({ g, gi, key: n, label: n, sub: c.grp > 1 ? g.name : '' })));
    const PL = c.pUnit === 'L';
    const eqTxt = P => { const v = svProjV(c, P); if (!v) return '';
      return `⇒ <b>${svV(v)}</b> · ${dfFr(v * 3.6, 1)} km/h · ${svT25(v)}${N.t && N.m ? '' : N.t ? ` · ${svLongTxt(Df, c)} en ${dfT(P.t)}` : ` · ${svLongTxt(P.m, c)} en ${dfDur(Td)}`}${v > 2.2 || v < 0.2 ? ' <span class="df-ko">⚠️ vitesse inhabituelle</span>' : ''}`; };
    const cell = P => { const O = (P.g.proj || {})[P.key] || {}, id = `${P.gi}|${esc(P.key)}`;
      return `<div class="df-pj">
        ${N.t ? `<div class="it"><b style="font-size:.82rem">⏱ Temps${N.m ? ' total' : ''}</b> <span class="muted" style="font-size:.72rem">min:s${Df ? ` · ${dfFr(Df, 0)} m` : ''}</span><input data-pj="${id}|t" value="${O.t ? dfT(O.t) : ''}" inputmode="numeric" placeholder="1:30"></div>` : ''}
        ${N.m ? `<div class="it"><b style="font-size:.82rem">📏 Distance${Td ? ` en ${dfDur(Td)}` : ''}</b> <span class="muted" style="font-size:.72rem">${PL ? `longueurs de ${c.bassin} m` : 'm'}</span><input data-pj="${id}|m" value="${O.m ? (PL ? dfFr(svLong(O.m, c), 1) : O.m) : ''}" inputmode="decimal" placeholder="—"></div>` : ''}
        ${N.o ? `<div class="it"><b style="font-size:.82rem">🧍 ${kind[0].toUpperCase() + kind.slice(1)}</b> <span class="muted" style="font-size:.72rem">sur ${ojT}${c.et.some(s => s.k === 'duree' && s.oj.n) ? ' (objectif)' : ''}</span><input data-pj="${id}|o" value="${O.o ?? ''}" type="number" min="0" inputmode="numeric" placeholder="—"></div>` : ''}
        </div><div class="df-eq" style="margin-top:6px">${eqTxt(O)}</div>`; };
    const filled = parts.filter(P => { const O = (P.g.proj || {})[P.key] || {}; return (!N.t || O.t) && (!N.m || O.m) && (!N.o || O.o != null); }).length;
    box.innerHTML = `<div class="card"><h3 style="margin-top:0">🎯 Projet ${grpP ? 'de chaque groupe' : 'de chaque élève'}</h3>
        <p class="df-help" style="margin-top:0">Avant de nager, chaque ${grpP ? 'groupe' : 'élève'} annonce ce qu'il pense réaliser : ${[N.t ? 'un temps' : '', N.m ? 'une distance (ou un nombre de longueurs)' : '', N.o ? `un nombre de ${kind} ramené${kind === 'objets' ? 's' : 's'}` : ''].filter(Boolean).join(', ')}. La vitesse de nage correspondante s'affiche aussitôt.</p>
        <div class="muted" style="font-size:.82rem">${esc(svFormat(c))} · bassin ${c.bassin} m</div>
        ${N.m ? `<label>Distance saisie en</label><div class="tog">${[['m', 'Mètres'], ['L', `Longueurs (${c.bassin} m)`]].map(([k, l]) => `<button data-pu="${k}" class="${c.pUnit === k ? 'on' : ''}">${l}</button>`).join('')}</div>` : ''}
        <label>Proposer d'après une vitesse</label><div data-cfg="bare" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><input id="pv" type="number" min="0.2" max="2.5" step="0.05" value="${c.refV}" style="width:80px;text-align:center"> <span>m/s</span>
          <button class="btn btn-ghost" id="fill" style="padding:9px 12px">Remplir les projets vides</button></div>
        <p class="df-help">${filled}/${parts.length} projets complets.</p></div>
      ${dfPjPick('sv', parts, P => `<div class="card" style="margin-top:10px"><div style="display:flex;gap:8px;align-items:baseline;flex-wrap:wrap"><b style="font-size:1.05rem">${esc(P.label)}</b>${P.sub ? `<span class="muted" style="font-size:.78rem">${esc(P.sub)}</span>` : ''}</div>${cell(P)}</div>`, null)}
      <button class="btn btn-grad btn-block" style="margin-top:12px" id="golv">⏱ Aller à la séance</button>`;
    const keep = () => { save(); pub(C); };
    dfPjWire(box, 'sv', parts, () => projets(box, C));
    box.querySelectorAll('[data-pu]').forEach(b => b.onclick = () => { c.pUnit = b.dataset.pu; keep(); projets(box, C); });
    box.querySelectorAll('[data-pj]').forEach(i => i.onchange = () => { const [gi, ...rest] = i.dataset.pj.split('|'), f = rest.pop(), key = rest.join('|'), g = C.groups[+gi], s = i.value.trim();
      g.proj = g.proj || {}; const O = g.proj[key] = g.proj[key] || {};
      if (s === '') delete O[f];
      else if (f === 't') { const t = dfParseT(s); if (!t) { toast('Temps non reconnu (ex. 1:30)'); return projets(box, C); } O.t = t; }
      else if (f === 'm') { const n = dfNum(s); if (n == null || n < 0) { toast('Valeur non reconnue'); return projets(box, C); } O.m = Math.round(PL ? n * c.bassin : n); }
      else { const n = dfNum(s); if (n == null || n < 0) { toast('Valeur non reconnue'); return projets(box, C); } O.o = Math.round(n); }
      keep(); const y = window.scrollY, sc = el.scrollTop; projets(box, C); el.scrollTop = sc; window.scrollTo(0, y);
      const nx = box.querySelectorAll('[data-pj]'), idx = [...nx].findIndex(x => x.dataset.pj === i.dataset.pj); if (nx[idx + 1]) nx[idx + 1].focus({ preventScroll: true }); });
    box.querySelector('#fill').onclick = () => { const v = Math.min(3, Math.max(0.2, dfNum(box.querySelector('#pv').value) || c.refV)); let n = 0;
      const nb = c.et.filter(s => s.k === 'none').length;
      parts.forEach(P => { const g = P.g; g.proj = g.proj || {}; const O = g.proj[P.key] = g.proj[P.key] || {};
        if (N.t && !O.t) { O.t = Math.round(Df / v + Td + nb * 30); n++; }
        if (N.m && !O.m) { O.m = Math.round(v * Td / 5) * 5; n++; }
        if (N.o && O.o == null) { O.o = ojT; n++; } });
      keep(); projets(box, C); toast(`${n} valeur(s) proposée(s)`); };
    box.querySelector('#golv').onclick = () => { tab = 'live'; frame(); };
  }

  /* ---------- Chronologie en direct ---------- */
  const sig = (now, t, f, d) => { if (Math.abs(now - t) < 2500) beep(f, d); };
  function startVague(C, t, now) {
    const L = C.live; L.t0 = t; L.st = 'go'; L.lastS = null; L.bipN = 0; L.w1 = false; C.undo = [];
    svUnits(C, L.w, C.only).forEach(u => { u.g.res = u.g.res || {}; u.g.res[u.w] = { k: 0, x: [svMkX(0)], done: false }; });
    Object.keys(view).forEach(k => delete view[k]);
    sig(now, t, 1400, .6); L.flash = now;
  }
  // Termine l'étape en cours d'une unité (how : 'arr' arrivée / fin, 'time' temps écoulé, 'stop' arrêt forcé)
  function endStep(C, g, w, e, how) {
    const c = C.cfg, R = svRun(g, w); if (!R || R.done) return;
    const k = R.k, x = R.x[k]; x.e = Math.round(e * 10) / 10; x.fin = true; x.arr = how !== 'stop';
    if (how === 'stop' || k + 1 >= c.et.length) { R.done = true; R.t = x.e; R.k = c.et.length; if (how === 'stop') R.capped = true; }
    else { R.k = k + 1; R.x[R.k] = svMkX(x.e); }
  }
  function checkVague(C, now) {
    const L = C.live; if (L.st !== 'go') return false;
    const U = svUnits(C, L.w, C.only); if (!U.every(u => { const R = svRun(u.g, u.w); return R && R.done; })) return false;
    sig(now, now, 1000, .35); setTimeout(() => beep(1000, .35), 380);
    if (L.w + 1 < svNV(C)) { L.w++; L.st = 'idle'; L.t0 = null; } else L.st = 'done';
    L.flash = now; return true;
  }
  function advance(C) {
    const L = C.live, c = C.cfg, now = Date.now(); let changed = false;
    if (L.st === 'cd') { const rem = (L.cdEnd - now) / 1000, s = Math.ceil(rem);
      if (rem <= 0) { startVague(C, L.cdEnd, now); changed = true; } else if (s !== L.lastS) { L.lastS = s; beep(880, .12); } }
    if (L.st === 'go') {
      const el = (now - L.t0) / 1000, U = svUnits(C, L.w, C.only); let minRem = null;
      U.forEach(u => { const R = svRun(u.g, u.w); let guard = 0;
        while (R && !R.done && guard++ < 50) { const s = c.et[R.k], x = R.x[R.k]; if (!s || !x) break;
          if (s.k === 'duree') { const end = x.s + s.d;
            if (el >= end && !(c.cap && end > c.cap)) { endStep(C, u.g, u.w, end, 'time'); sig(now, L.t0 + end * 1000, 1000, .35); changed = true; continue; }
            if (minRem == null || end - el < minRem) minRem = end - el; }
          break; } });
      if (c.cap && el >= c.cap) { U.forEach(u => { const R = svRun(u.g, u.w); if (R && !R.done) { endStep(C, u.g, u.w, c.cap, 'stop'); changed = true; } }); sig(now, L.t0 + c.cap * 1000, 700, .8); }
      else if (c.cap) { const r = c.cap - el; if (minRem == null || r < minRem) minRem = r;
        if (c.cap > 90 && !L.w1 && r <= 60) { L.w1 = true; if (r > 55) { beep(1200, .15); setTimeout(() => beep(1200, .15), 260); } } }
      if (minRem != null) { const s = Math.ceil(minRem); if (s <= 3 && s >= 1 && s !== L.lastS) { L.lastS = s; beep(880, .1); } }
      const b = c.bip || {}; if (b.mode === 'n' && L.st === 'go') { const j = Math.floor(el / Math.max(3, b.n || 30)); if (j > (L.bipN || 0)) { L.bipN = j; beep(1100, .06, .35); } }
      if (checkVague(C, now)) changed = true;
    }
    if (changed) save();
    return changed;
  }

  /* ---------- Écran « Séance » ---------- */
  function live(box, C) {
    const c = svNorm(C.cfg), L = C.live = C.live || { st: 'idle', w: 0 }, nV = svNV(C), obs = C.only != null && C.groups[C.only], N = c.et.length, rel = svRel(C);
    tabsVisible(!obs);
    const U = svUnits(C, L.w, obs ? C.only : null);
    const card = ({ g, gi, w }) => {
      const R = svRun(g, w), key = `${gi}|${w}`, running = L.st === 'go' && R && !R.done;
      const kc = R ? (R.done ? R.x.length - 1 : Math.min(R.k, N - 1)) : 0, vk = view[key] != null && R && R.x[view[key]] ? view[key] : kc, s = c.et[vk], x = R && R.x[vk], isCur = running && vk === R.k;
      const sw = svSwimmers(C, g, vk, w), can = !!x && (isCur || x.fin);
      const title = c.grp === 1 ? g.members[0] : c.org === 'vagues' ? g.members[w] : g.name;
      const sub = c.grp === 1 ? '' : c.org === 'vagues' ? `${g.name} · 👀 ${g.members.filter((n, i) => i !== w).join(', ')}` : g.members.join(', ');
      const obT = svObN(s), cnt = [];
      if (x && s.k !== 'none') cnt.push(`<span>${x.L} long. · ${dfFr(s.k === 'dist' && x.arr ? s.m : svRaw(x, c), 0)} m</span>`);
      if (x && (obT || x.ob)) cnt.push(`<span class="${x.ob >= obT ? 'ok' : ''}">🚧 ${x.ob}/${obT}</span>`);
      if (x && (s.oj.n || x.oj)) cnt.push(`<span class="${x.oj >= s.oj.n ? 'ok' : ''}">${SV_OJ[s.oj.ty][0]} ${x.oj}/${s.oj.n}</span>`);
      if (x && s.gs) { const gn = s.ge.filter(n => x.g[n]).length; cnt.push(`<span class="${gn >= s.ge.length ? 'ok' : ''}">⛑ ${gn}/${s.ge.length}</span>`); }
      if (R) { const st = R.x.reduce((a, y) => a + (y ? y.st : 0), 0), over = c.arrets >= 0 && st > c.arrets; cnt.push(`<span class="${over ? 'ko' : ''}">✋ ${st}${c.arrets >= 0 ? '/' + c.arrets : ''}</span>`); }
      const last = vk === N - 1, nxSw = !last && rel ? svSwimmers(C, g, vk + 1, w)[0] : null;
      const nxLbl = s.k === 'duree' ? (last ? '⏭ Terminer (avant la fin du temps)' : '⏭ Terminer l\'étape') : last ? (s.k === 'none' ? '✔ Terminé' : '🏁 Arrivé') : nxSw && nxSw !== sw[0] ? `🔁 Relais → ${esc(nxSw)}` : `✔ Étape ${vk + 2} →`;
      const kindBtn = SV_OJ[s.oj.ty][3] === 'victime' ? '+1 victime' : '+1 objet';
      const S = R && R.done ? (c.grp > 1 && c.org === 'vagues' ? svMember(C, g, g.members[w]) : svGroup(C, g)) : null;
      return `<div class="df-c sv-c ${R && R.done ? 'arr' : ''}"><div class="nm">${esc(title)}</div>${sub && !obs ? `<div class="gn">${esc(sub)}</div>` : ''}
        ${rel ? `<div class="who">🏊 ${esc(sw[0] || '—')}</div>` : ''}
        <div class="stp">Étape ${vk + 1}/${N}${s.lb ? ' · ' + esc(s.lb) : ''}<br>${esc(svEtLbl(s, c, true))}</div>
        <div class="d" data-tm="${key}">${R && R.done ? `🏁 ${dfT(R.t)}` : x && x.fin ? dfT(x.e - x.s) : '–'}</div><div class="tt" data-tt="${key}"></div>
        <div class="cnt">${cnt.join('')}</div>
        <div class="df-eq" data-exp="${key}">${S ? svEcShort(S, c) : ''}</div>
        <div class="btns">${s.k !== 'none' ? `<button class="btn btn-grad plot" data-a="L" data-k="${key}" data-s="${vk}" ${can ? '' : 'disabled'}>+1 longueur</button>` : ''}
          ${obT || (x && x.ob) ? `<button class="btn btn-ghost" data-a="ob" data-k="${key}" data-s="${vk}" ${can ? '' : 'disabled'}>🚧 +1 obstacle</button>` : ''}
          ${s.oj.n || (x && x.oj) ? `<button class="btn btn-ghost" data-a="oj" data-k="${key}" data-s="${vk}" ${can ? '' : 'disabled'}>${SV_OJ[s.oj.ty][0]} ${kindBtn}</button>` : ''}
          <button class="btn btn-ghost" data-a="st" data-k="${key}" data-s="${vk}" ${can ? '' : 'disabled'}>✋ Arrêt</button>
</div>
        ${s.gs ? `<div class="sv-ge">${s.ge.map(n => `<button data-a="g" data-k="${key}" data-s="${vk}" data-ge="${esc(n)}" class="${x && x.g[n] ? 'on' : ''}" ${can ? '' : 'disabled'}>${x && x.g[n] ? '✅' : '⬜'} ${esc(n)}</button>`).join('')}</div>` : ''}
        ${isCur ? `<button class="btn ${s.k === 'duree' ? 'btn-ghost' : last ? 'btn-danger' : 'btn-grad'} btn-block sv-nx" data-a="nx" data-k="${key}" data-s="${vk}">${nxLbl}</button>` : ''}
        ${can ? `<div class="adj">${s.k !== 'none' ? `<button data-a="mL" data-k="${key}" data-s="${vk}">−1 long.</button>${s.k === 'duree' || !x.arr ? `<button data-a="m5" data-k="${key}" data-s="${vk}">−5 m</button><button data-a="p5" data-k="${key}" data-s="${vk}">+5 m</button>` : ''}` : ''}${x.ob ? `<button data-a="mob" data-k="${key}" data-s="${vk}">−🚧</button>` : ''}${x.oj ? `<button data-a="moj" data-k="${key}" data-s="${vk}">−${SV_OJ[s.oj.ty][0]}</button>` : ''}${x.st ? `<button data-a="ms" data-k="${key}" data-s="${vk}">−✋</button>` : ''}</div>` : ''}
        ${N > 1 ? `<div class="sv-sk">${c.et.map((e, j) => { const y = R && R.x[j]; return `<button data-sk="${key}|${j}" class="${running && R.k === j ? 'cur' : ''} ${y && y.fin ? 'done' : ''} ${j === vk ? 'vw' : ''}" ${y ? '' : 'disabled'}>É${j + 1}${rel ? ' · ' + esc(svSwimmers(C, g, j, w)[0] || '') : y && y.fin ? ' · ' + dfT(y.e - y.s) : ''}</button>`; }).join('')}</div>` : ''}</div>`; };
    const b = c.bip || (c.bip = { mode: 'off', n: 30 });
    box.innerHTML = `<div class="${obs ? 'df-obs' : ''}">
      ${obs ? `<div class="card" style="text-align:center;margin-bottom:10px"><div style="font-weight:900;font-size:1.25rem">${esc(obs.name)}</div>${c.grp > 1 ? `<div class="muted">${obs.members.map(esc).join(', ')}</div>` : ''}</div>` : `<div class="muted" style="margin:0 2px 6px"><b style="color:var(--text)">${esc(C.nom)}</b> · bassin ${c.bassin} m · ${esc(svFormat(c))}${nV > 1 ? ` · vague ${L.w + 1}/${nV}` : ''}</div>`}
      <div class="df-ph ${L.st === 'go' ? 'work' : L.st === 'done' ? 'end' : L.st === 'cd' ? 'rest' : 'idle'}" id="ph">
        <div class="lb" id="phl"></div><div class="big" id="phb">–</div><div class="sub" id="phs"></div><div class="bar"><i id="phbar"></i></div></div>
      <div class="row" style="margin-top:10px">
        ${L.st === 'idle' ? `<button class="btn btn-grad" id="go" style="flex:2;padding:16px;font-size:1.1rem">▶ Départ${nV > 1 ? ` vague ${L.w + 1}` : ''}</button><button class="btn btn-ghost" id="go0">⚡ Sans 3-2-1</button>` : ''}
        ${L.st === 'cd' || L.st === 'go' ? `<button class="btn btn-ghost" id="stop" ${obs ? 'data-prof' : ''}>⏹ Stop</button>` : ''}
        <button class="btn btn-ghost" id="undo" ${(C.undo || []).length ? '' : 'disabled'}>↶ Annuler</button></div>
      ${L.st === 'done' ? `<button class="btn btn-grad btn-block" style="margin-top:10px;padding:16px" id="save">💾 Terminer et enregistrer</button>` : ''}
      <div class="muted" style="margin-top:8px;font-size:.8rem">Touchez « +1 longueur » à chaque longueur, « +1 obstacle / victime / objet » à chaque réussite, puis « ✔ Étape suivante », « 🔁 Relais » ou « 🏁 Arrivé ». Les étapes (É1, É2…) permettent de corriger après coup.</div>
      ${U.length ? `<div class="df-grid">${U.map(card).join('')}</div>` : '<div class="card empty" style="margin-top:10px">Aucun nageur pour cette vague.</div>'}
      <div class="card" data-cfg style="margin-top:12px"><b>🔔 Bips</b>
        <div class="tog">${[['off', 'Départ / fin seulement'], ['n', 'Toutes les N s']].map(([m, l]) => `<button data-bm="${m}" class="${b.mode === m ? 'on' : ''}">${l}</button>`).join('')}</div>
        ${b.mode === 'n' ? `<div style="display:flex;gap:6px;align-items:center;margin-top:8px">Bip toutes les <input id="bn" type="number" min="3" value="${b.n}" style="width:76px;text-align:center"> s</div>` : ''}
        <p class="df-help">Toujours actifs : 3-2-1 et départ, fin des étapes en temps limité (3-2-1 puis double bip), rappel 1 min avant le temps limite de l'épreuve${c.cap ? ` (${dfT(c.cap)})` : ''}, fin de vague.</p></div>
      ${obs ? '<div style="text-align:center;margin:18px 0 6px"><button class="link" id="gv-prof">🔒 Mode enseignant</button></div>'
        : `${C.groups.length > 1 ? `<div class="card" data-cfg style="margin-top:12px"><label style="margin-top:0">📱 Tablette d'un ${c.grp === 1 ? 'élève' : 'groupe'} (l'observateur ne voit que son ${c.grp === 1 ? 'nageur' : 'groupe'})</label><select id="only"><option value="">Tous</option>${C.groups.map((g, i) => `<option value="${i}">${esc(g.name)}</option>`).join('')}</select></div>` : ''}
        ${L.st !== 'done' && started(C) ? '<button class="btn btn-ghost btn-block" data-cfg="bare" style="margin-top:12px" id="save">💾 Enregistrer maintenant (séance incomplète)</button>' : ''}`}
      </div>`;
    const $ = s => box.querySelector(s), redraw = () => live(box, C);
    box.querySelectorAll('[data-a]').forEach(bt => bt.onclick = () => {
      const [gi, w] = bt.dataset.k.split('|').map(Number), g = C.groups[gi], R = svRun(g, w); if (!R) return;
      const vk = +bt.dataset.s, x = R.x[vk], s = c.et[vk], a = bt.dataset.a; if (!x) return;
      const prev = JSON.stringify(R), pl = JSON.stringify(L);
      if (a === 'L') { x.L++; beep(1000, .04, .3); } else if (a === 'ob') { x.ob++; beep(1200, .05, .3); } else if (a === 'oj') { x.oj++; beep(1300, .08, .35); } else if (a === 'st') { x.st++; beep(500, .08, .3); }
      else if (a === 'mL') x.L = Math.max(0, x.L - 1); else if (a === 'm5') x.adj = (x.adj || 0) - 5; else if (a === 'p5') x.adj = (x.adj || 0) + 5;
      else if (a === 'mob') x.ob = Math.max(0, x.ob - 1); else if (a === 'moj') x.oj = Math.max(0, x.oj - 1); else if (a === 'ms') x.st = Math.max(0, x.st - 1);
      else if (a === 'g') { const n = bt.dataset.ge; x.g[n] = !x.g[n]; if (!x.g[n]) delete x.g[n]; else beep(1300, .05, .3); }
      else if (a === 'nx') { if (L.st !== 'go' || R.done || vk !== R.k) return;
        endStep(C, g, w, Math.round((Date.now() - L.t0) / 100) / 10, 'arr'); beep(R.done ? 1500 : 1250, R.done ? .25 : .12); delete view[`${gi}|${w}`]; }
      if (svRaw(x, c) < 0) x.adj -= svRaw(x, c);
      if (s.k === 'dist' && !x.arr && a !== 'nx' && x.L * c.bassin > s.m) { x.L = Math.ceil(s.m / c.bassin); }
      (C.undo = C.undo || []).push({ gi, w, R: prev, L: pl }); if (C.undo.length > 80) C.undo.shift();
      save(); advance(C); redraw(); });
    box.querySelectorAll('[data-sk]').forEach(bt => bt.onclick = () => { const p = bt.dataset.sk.split('|'), key = p[0] + '|' + p[1], j = +p[2];
      const R = svRun(C.groups[+p[0]], +p[1]); view[key] = view[key] === j || (R && !R.done && R.k === j) ? undefined : j; if (view[key] == null) delete view[key]; redraw(); });
    if ($('#go')) $('#go').onclick = () => { L.st = 'cd'; L.cdEnd = Date.now() + 3000; L.lastS = null; save(); advance(C); redraw(); };
    if ($('#go0')) $('#go0').onclick = () => { const t = Date.now(); startVague(C, t, t); save(); redraw(); };
    if ($('#stop')) $('#stop').onclick = () => { if (!confirm('Arrêter le chrono ? Les saisies sont conservées ; les nageurs en cours sont arrêtés à ce temps.')) return;
      const now = Date.now();
      if (L.st === 'go') { const e = Math.round((now - L.t0) / 100) / 10; svUnits(C, L.w, C.only).forEach(u => endStep(C, u.g, u.w, e, 'stop')); checkVague(C, now); }
      else { L.st = 'idle'; }
      save(); redraw(); };
    $('#undo').onclick = () => { const u = (C.undo || []).pop(); if (!u) return; const g = C.groups[u.gi]; if (g) { g.res = g.res || {}; g.res[u.w] = JSON.parse(u.R); }
      const Lp = JSON.parse(u.L); if (Lp.w === L.w) Object.assign(L, { st: Lp.st, t0: Lp.t0 }); save(); toast('Dernière saisie annulée'); redraw(); };
    box.querySelectorAll('[data-bm]').forEach(bt => bt.onclick = () => { b.mode = bt.dataset.bm; L.bipN = L.t0 ? Math.floor(((Date.now() - L.t0) / 1000) / Math.max(3, b.n || 30)) : 0; save(); pub(C); redraw(); });
    if ($('#bn')) $('#bn').onchange = () => { b.n = Math.max(3, dfNum($('#bn').value) || 30); save(); redraw(); };
    if ($('#only')) $('#only').onchange = e => { C.only = e.target.value === '' ? null : +e.target.value; save(); redraw(); window.scrollTo(0, 0); };
    if ($('#gv-prof')) $('#gv-prof').onclick = () => { if (!confirm('Passer en mode enseignant (tous les groupes, réglages) ?')) return; C.only = null; save(); frame(); };
    box.querySelectorAll('#save').forEach(s => s.onclick = saveSeance);
    paint(C);
  }
  // Mise à jour légère (chronos) sans reconstruire l'écran
  function paint(C) {
    const box = el.querySelector('#sv-body'); if (!box || tab !== 'live') return;
    const c = C.cfg, L = C.live, $ = s => box.querySelector(s), now = Date.now(); if (!$('#ph')) return;
    const nV = svNV(C), U = svUnits(C, L.w, C.only), el2 = L.t0 ? (now - L.t0) / 1000 : 0;
    let lb = '', big = '–', sub = '', pr = 0;
    if (L.st === 'idle') { lb = nV > 1 ? `Vague ${L.w + 1} / ${nV} · prêt` : 'Prêt'; big = c.cap ? dfT(c.cap) : '0:00'; sub = `${c.et.length} étape${c.et.length > 1 ? 's' : ''} · ${esc(svFormat(c))}`;
      if (nV > 1) sub += ' · nageurs : ' + C.groups.map(g => g.members[L.w]).filter(Boolean).map(esc).join(', '); }
    else if (L.st === 'cd') { lb = 'Attention…'; big = String(Math.max(1, Math.ceil((L.cdEnd - now) / 1000))); sub = SV_DEP[c.et[0].dep] ? `Départ : ${SV_DEP[c.et[0].dep][1].toLowerCase()}` : ''; }
    else if (L.st === 'done') { lb = 'Épreuve terminée'; big = '🏁'; sub = 'Vérifiez / corrigez les saisies puis enregistrez'; pr = 1; }
    else { const dn = U.filter(u => { const R = svRun(u.g, u.w); return R && R.done; }).length;
      lb = `Épreuve en cours${nV > 1 ? ` · vague ${L.w + 1}/${nV}` : ''}`; big = c.cap ? dfT(Math.max(0, Math.ceil(c.cap - el2))) : dfT(el2);
      sub = `${dn}/${U.length} terminé${dn > 1 ? 's' : ''}${c.cap ? ` · temps écoulé ${dfT(el2)} · limite ${dfT(c.cap)}` : ''}`; pr = c.cap ? Math.min(1, el2 / c.cap) : U.length ? dn / U.length : 0; }
    $('#phl').textContent = lb; $('#phb').textContent = big; $('#phs').innerHTML = sub; $('#phbar').style.width = (pr * 100) + '%';
    const phEl = $('#ph'); if (L.flash && now - L.flash < 1200 && !phEl.classList.contains('flash')) phEl.classList.add('flash');
    if (L.st !== 'go') return;
    box.querySelectorAll('[data-tm]').forEach(d => { const [gi, w] = d.dataset.tm.split('|').map(Number), g = C.groups[gi], R = svRun(g, w); if (!R || R.done) return;
      const s = c.et[R.k], x = R.x[R.k], key = `${gi}|${w}`; if (!s || !x) return;
      const vk = view[key] != null && R.x[view[key]] ? view[key] : R.k; if (vk !== R.k) return;
      d.textContent = s.k === 'duree' ? dfT(Math.max(0, Math.ceil(x.s + s.d - el2))) : dfT(el2 - x.s);
      const tt = box.querySelector(`[data-tt="${key}"]`); if (tt) tt.textContent = `${s.k === 'duree' ? 'temps restant' : 'temps de l\'étape'} · total ${dfT(el2)}`;
      // attendu selon le projet (allure régulière)
      const ex = box.querySelector(`[data-exp="${key}"]`), P = svProjOf(C, g, w), v = svProjV(c, P || {}); if (!ex) return;
      if (s.k === 'none') { ex.innerHTML = ''; return; }
      if (!v || (svNeed(c).t && svNeed(c).m)) { ex.innerHTML = P && (P.t || P.m) ? '' : '<span class="muted">pas de projet</span>'; return; }
      let got = 0; for (let j = 0; j < R.k; j++) { const r = svStepR(C, R, j); if (r) got += r.dist; } got += s.k === 'none' ? 0 : svRaw(x, c);
      const swEl = el2 - c.et.slice(0, R.k).reduce((a, e, j) => a + (e.k === 'none' && R.x[j] && R.x[j].fin ? R.x[j].e - R.x[j].s : 0), 0);
      const exp = v * swEl, diff = Math.round((got - exp) / c.bassin);
      ex.innerHTML = `Projet ${svV(v)} → attendu : <b>${dfFr(exp / c.bassin, 1)} long.</b> ${diff > 0 ? `<span class="df-mid">▲ +${diff} en avance</span>` : diff < 0 ? `<span class="df-ko">▼ ${diff} en retard</span>` : '<span class="df-ok">✓ dans l\'allure</span>'}`; });
  }
  // Écart court (carte terminée)
  function svEcShort(S, c) {
    const P = []; if (S.et != null) P.push(`<span class="${svCls(S.etp, c)}">⏱ ${dfSign(S.et, a => dfT(a))} (${dfPct(S.etp)})</span>`);
    if (S.ed != null) P.push(`<span class="${svCls(S.edp, c)}">📏 ${dfSign(S.ed, a => dfFr(a, 0))} m (${dfPct(S.edp)})</span>`);
    if (S.eo != null) P.push(`<span class="${svClsO(S.eo)}">🧍 ${dfSign(S.eo, a => a)}</span>`);
    return (P.length ? 'Écart projet : ' + P.join(' · ') : '') + (S.v ? `<br>${svV(S.v)} · ${svT25(S.v)}` : '');
  }

  /* ---------- Enregistrement ---------- */
  const hasData = g => g.res && Object.values(g.res).some(R => R && R.x && R.x.some(x => x && (x.fin || x.L || x.ob || x.oj || x.st)));
  function saveSeance() {
    const C = cur(); if (!C) return; const done = C.groups.filter(hasData);
    if (!done.length) return toast('Aucun résultat saisi');
    if (C.live && C.live.st !== 'done' && !confirm('L\'épreuve n\'est pas terminée. Enregistrer quand même les étapes terminées ?')) return;
    const rec = dfClone({ ...C, groups: done }); rec.id = C.id + '-' + Math.random().toString(36).slice(2, 6); ['live', 'undo', 'only', 'joined'].forEach(k => delete rec[k]);
    D.seances.push(rec); D.current = null; save(); window.syncFlush && window.syncFlush(); toast('Séance de sauvetage enregistrée ✔'); tab = 'res'; openRec = rec.id; frame();
  }

  /* ---------- Résultats ---------- */
  const svCmp = (rank, N) => rank === 'perf'
    ? (a, b) => (b.S.n / b.S.nT - a.S.n / a.S.nT) || (N.m ? (b.S.oj - a.S.oj) || (b.S.dist - a.S.dist) || (a.S.t - b.S.t) : (b.S.oj - a.S.oj) || (a.S.t - b.S.t) || (b.S.dist - a.S.dist))
    : rank === 'v' ? (a, b) => (b.S.v || 0) - (a.S.v || 0)
      : (a, b) => ((a.S.eAbs == null) - (b.S.eAbs == null)) || ((a.S.eAbs ?? 9) - (b.S.eAbs ?? 9)) || (b.S.v || 0) - (a.S.v || 0);
  function resHTML(C, rank) {
    const c = svNorm(C.cfg), N = svNeed(c), obT = c.et.some(s => svObN(s)), gT = c.et.some(s => s.gs), rel = svRel(C), kind = svKind(c);
    const cells = (S, grp) => {
      const P = S.P || {};
      const ec = S.eAbs != null ? `<b class="${svCls(S.eAbs, c)}">± ${dfFr(S.eAbs * 100, 1)} %</b><small>écart moyen</small>` : `<small class="muted">${rel && !grp ? 'projet du relais' : 'pas de projet'}</small>`;
      const tC = N.t ? `<td><b>${dfT(S.t)}</b>${S.partial ? ' <span class="df-ko">(incomplet)</span>' : ''}${P.t ? `<small>projet ${dfT(P.t)}</small>` : ''}${S.et != null ? `<div class="ec ${svCls(S.etp, c)}">${dfSign(S.et, a => dfT(a))} (${dfPct(S.etp)})</div>` : ''}</td>` : '';
      const dC = `<td><b>${dfFr(S.dist, 0)} m</b><small>${svLongTxt(S.dist, c)}${N.t ? '' : ` · ${dfT(S.t)}`}</small>${P.m ? `<small>projet ${dfFr(P.m, 0)} m${N.t ? ` en ${dfDur(svTdur(c))} (réalisé ${dfFr(S.dDur, 0)} m)` : ''}</small>` : ''}${S.ed != null ? `<div class="ec ${svCls(S.edp, c)}">${dfSign(S.ed, a => dfFr(a, 0))} m (${dfPct(S.edp)})</div>` : ''}</td>`;
      const oC = N.o ? !S.ojT && !S.oj ? '<td class="muted">–</td>' : `<td><b>${S.oj}</b>${S.ojT ? `<small>sur ${S.ojT}</small>` : ''}${P.o != null && S.P ? `<small>projet ${P.o}</small>` : ''}${S.eo != null ? `<div class="ec ${svClsO(S.eo)}">${dfSign(S.eo, a => a)}${S.eop != null ? ` (${dfPct(S.eop)})` : ''}</div>` : ''}</td>` : '';
      const bC = obT ? !S.obT && !S.ob ? '<td class="muted">–</td>' : `<td class="${S.obT ? (S.ob >= S.obT ? 'df-ok' : 'df-ko') : ''}"><b>${S.ob}/${S.obT}</b></td>` : '';
      const gC = gT ? `<td>${S.gT ? `<b class="${S.gOK ? 'df-ok' : 'df-ko'}">${S.gOK ? '✅ oui' : '❌ non'}</b><small>${S.gN}/${S.gT} validé(s)</small>` : '<span class="muted">–</span>'}</td>` : '';
      return `<td>${ec}</td>${tC}${dC}${oC}${bC}${gC}<td class="${S.over ? 'df-ko' : ''}"><b>${S.st}</b>${S.allowed != null ? `<small>/ ${S.allowed} autorisé(s)</small>` : ''}</td>
        <td>${S.v ? `<b>${svV(S.v)}</b><small>${dfFr(S.v * 3.6, 1)} km/h</small><small>${svT25(S.v)}</small>` : '<span class="muted">–</span>'}</td>`; };
    const stepCell = r => r ? `<td><b>${dfT(r.t)}</b>${r.partial ? ' <span class="df-ko">(partiel)</span>' : ''}<small>${r.swim ? `${dfFr(r.dist, 0)} m${r.t > 0 && r.dist ? ` · ${svV(r.dist / r.t)}` : ''}` : 'au bord'}</small>${r.obT ? `<small>🚧 ${r.ob}/${r.obT}</small>` : ''}${r.ojT || r.oj ? `<small>🧍 ${r.oj}/${r.ojT}</small>` : ''}${r.gT ? `<small>⛑ ${r.gN}/${r.gT}</small>` : ''}${r.st ? `<small>✋ ${r.st}</small>` : ''}</td>` : '<td class="muted">–</td>';
    const head = who => `<th>#</th><th>${who}</th><th>Écart projet</th>${N.t ? '<th>Temps</th>' : ''}<th>Distance</th>${N.o ? `<th>${kind[0].toUpperCase() + kind.slice(1)}</th>` : ''}${obT ? '<th>Obstacles</th>' : ''}${gT ? '<th>Geste de secours</th>' : ''}<th>Arrêts</th><th>Vitesse</th>`;
    const cmp = svCmp(rank, N);
    const rows = C.groups.flatMap(g => g.members.map(n => ({ g, n, S: svMember(C, g, n) }))).filter(r => r.S).sort(cmp);
    let h = `<div class="sheet-table df-tbl"><table><tr>${head('Élève')}${c.et.length > 1 ? c.et.map((s, k) => `<th>É${k + 1} · ${esc(svEtShort(s))}</th>`).join('') : ''}</tr>${rows.map((r, i) => `<tr><td>${i + 1}</td><td><b>${esc(r.n)}</b>${c.grp > 1 ? `<small>${esc(r.g.name)}</small>` : ''}${rel ? `<small>${svMemRuns(C, r.g, r.n).ks.map(k => 'É' + (k + 1)).join(', ')}</small>` : ''}</td>
      ${cells(r.S)}${c.et.length > 1 ? c.et.map((s, k) => { const M = svMemRuns(C, r.g, r.n); return stepCell(M.ks.includes(k) ? svStepR(C, svRun(r.g, M.w), k) : null); }).join('') : ''}</tr>`).join('')}</table></div>`;
    if (c.grp > 1) {
      const G = C.groups.map(g => ({ g, S: svGroup(C, g) })).filter(r => r.S).sort(cmp);
      h += `<h4 style="margin:14px 2px 4px">👥 Groupes · ${SV_ORG[c.org][0]}</h4>
        <div class="sheet-table df-tbl"><table><tr>${head('Groupe')}${c.org !== 'vagues' && c.et.length > 1 ? c.et.map((s, k) => `<th>É${k + 1}</th>`).join('') : ''}</tr>
        ${G.map((r, i) => `<tr><td>${i + 1}</td><td><b>${esc(r.g.name)}</b><small>${r.g.members.map(esc).join(', ')}</small></td>${cells(r.S, true)}${c.org !== 'vagues' && c.et.length > 1 ? c.et.map((s, k) => { const x = stepCell(svStepR(C, svRun(r.g, 0), k)); return rel ? x.replace(/<\/td>$/, `<small>(${esc(r.g.members[svRelay(r.g, k)] || '')})</small></td>`) : x; }).join('') : ''}</tr>`).join('')}</table></div>`;
    }
    h += `<p class="df-help">Classement ${rank === 'perf' ? 'à la performance (étapes terminées, puis ' + (N.m ? `${N.o ? kind + ', ' : ''}distance, temps` : `${N.o ? kind + ', ' : ''}temps`) + ')' : rank === 'v' ? 'à la vitesse de nage' : 'au respect du projet : plus petit écart moyen (valeur absolue) entre projet et réalisation'}. Temps / distance : vert ≤ ${c.tol} %, orange ≤ ${2 * c.tol} % ; ${kind} : vert si exact, orange à ± 1. Vitesse = distance nagée ÷ temps de nage (ateliers au bord exclus). ${rel ? 'Relais : le projet et l\'écart sont ceux du groupe.' : ''}</p>`;
    return h;
  }
  function csvOf(list) {
    const rows = [['Séance', 'Date', 'Classe', 'Épreuve', 'Bassin (m)', 'Groupement', 'Groupe', 'Élève', 'Étape', 'Consigne', 'Temps', 'Temps (s)', 'Distance (m)', 'Longueurs', 'Obstacles', 'Obstacles prévus', 'Victimes / objets', 'Victimes / objets prévus', 'Gestes validés', 'Gestes prévus', 'Geste réussi', 'Arrêts', 'Vitesse (m/s)', 'Vitesse (km/h)', 'Temps / 25 m (s)', 'Projet temps', 'Projet distance (m)', 'Projet victimes / objets', 'Écart temps (s)', 'Écart temps (%)', 'Écart distance (m)', 'Écart distance (%)', 'Écart victimes / objets', 'Écart moyen (%)']];
    const f = (x, d = 1) => x == null || !isFinite(x) ? '' : (+x).toFixed(d).replace('.', ',');
    list.forEach(C => { const c = svNorm(C.cfg), grp = c.grp === 1 ? 'Individuel' : SV_GRPN[c.grp] + ' · ' + SV_ORG[c.org][0].replace(/^\S+\s/, ''), base = [C.nom, new Date(C.date).toLocaleDateString('fr-FR'), C.classe, svFormat(c), c.bassin, grp];
      C.groups.forEach(g => g.members.forEach(n => { const M = svMemRuns(C, g, n), R = svRun(g, M.w);
        M.ks.forEach(k => { const r = svStepR(C, R, k); if (!r) return; const v = r.swim && r.t > 0 && r.dist ? r.dist / r.t : null;
          rows.push([...base, c.grp > 1 ? g.name : '', n, k + 1, svEtLbl(c.et[k], c), dfT(r.t), f(r.t), f(r.dist, 0), f(svLong(r.dist, c), 1), r.ob, r.obT, r.oj, r.ojT, r.gN, r.gT, r.gT ? (r.gN >= r.gT ? 'oui' : 'non') : '', r.st, f(v, 2), f(v && v * 3.6), f(v && 25 / v), '', '', '', '', '', '', '', '', '']); });
        const S = svMember(C, g, n); if (!S) return; const P = S.P || {};
        rows.push([...base, c.grp > 1 ? g.name : '', n, 'TOTAL', S.partial ? 'incomplet' : '', dfT(S.t), f(S.t), f(S.dist, 0), f(svLong(S.dist, c), 1), S.ob, S.obT, S.oj, S.ojT, S.gN, S.gT, S.gT ? (S.gOK ? 'oui' : 'non') : '', S.st, f(S.v, 2), f(S.v && S.v * 3.6), f(S.v && 25 / S.v),
          P.t ? dfT(P.t) : '', P.m ?? '', P.o ?? '', f(S.et), f(S.etp != null ? S.etp * 100 : null), f(S.ed, 0), f(S.edp != null ? S.edp * 100 : null), S.eo ?? '', f(S.eAbs != null ? S.eAbs * 100 : null)]); })); });
    return csv(rows);
  }
  function sendRes(C) {
    const base = String(C.id).split('-')[0]; let nMaj = 0;
    let n = 0; const inCls = C.classe ? studentsOf(C.classe) : null, c = svNorm(C.cfg), N = svNeed(c), kind = svKind(c);
    C.groups.forEach(g => { const G = svGrpProj(C) ? svGroup(C, g) : null;
      g.members.forEach(e => { if (inCls && !inCls.includes(e)) return; const S = svMember(C, g, e); if (!S) return; const E = svRel(C) ? G : S;
        nMaj += saveResult({ key: `sauvetage|${base}|${C.classe || ''}|${e}`, tool: 'sauvetage', label: 'Sauvetage aquatique', classe: C.classe, eleve: e,
          valeur: [N.m ? `${dfFr(S.dist, 0)} m` : dfT(S.t), S.ojT ? `${S.oj}/${S.ojT} ${kind}` : '', S.gT ? `geste ${S.gOK ? '✔' : '✘'}` : ''].filter(Boolean).join(' · '),
          detail: `${C.nom} · ${svFormat(c)} · bassin ${c.bassin} m${c.grp > 1 ? ' · ' + g.name : ''} · ${dfFr(S.dist, 0)} m (${svLongTxt(S.dist, c)}) en ${dfT(S.t)}${S.partial ? ' (incomplet)' : ''}${S.v ? ` · ${svV(S.v)} (${dfFr(S.v * 3.6, 1)} km/h)` : ''}${S.obT ? ` · obstacles ${S.ob}/${S.obT}` : ''}${S.gT ? ` · geste de secours ${S.gOK ? 'réussi' : 'non réussi'} (${S.gN}/${S.gT})` : ''} · écart projet ${E && E.eAbs != null ? dfFr(E.eAbs * 100, 1) + ' % (moy.)' : '–'}${svRel(C) ? ' (relais)' : ''} · ${S.st} arrêt(s)${S.over ? ' (au-delà du nombre autorisé)' : ''}` }) === 'maj'; n++; }); });
    C.sent = Date.now(); save(); toast(nMaj ? `${n} résultat(s) mis à jour ✔ (déjà envoyés : remplacés, sans doublon)` : `${n} résultat(s) envoyé(s) ✔`);
  }
  function results(box) {
    const C = cur(), S = D.seances.slice().sort((a, b) => b.date - a.date);
    const lbl = R => `${esc(svFormat(svNorm(R.cfg)))} · bassin ${R.cfg.bassin} m · ${R.cfg.grp === 1 ? 'individuel' : SV_GRPN[R.cfg.grp] + ' · ' + SV_ORG[R.cfg.org][0]}`;
    box.innerHTML = `${C ? `<div class="card" style="border:2px solid var(--gold)"><h3 style="margin-top:0">⏱ Séance en cours · ${esc(C.nom)}</h3><div class="muted">${esc(C.classe || '')} · ${lbl(C)} · résultats provisoires (étapes terminées)</div>
        <div id="rcur"></div><button class="btn btn-grad btn-block" data-cfg="bare" style="margin-top:10px" id="save">💾 Terminer et enregistrer</button></div>` : ''}
      <div class="section-title"><h2>Historique (${S.length})</h2>${S.length ? '<button class="link" id="expall">Exporter tout (CSV)</button>' : ''}</div>
      <div class="seg" style="margin-bottom:10px">${[['ecart', '🎯 Respect du projet'], ['perf', '🏆 Performance'], ['v', '⚡ Vitesse']].map(([k, l]) => `<button data-rk="${k}" class="${rk === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      ${S.length ? S.map(R => `<details class="card" style="margin-top:10px" data-id="${esc(R.id)}" ${openRec === R.id ? 'open' : ''}><summary style="cursor:pointer"><b>${new Date(R.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} · ${esc(R.classe || '')} · ${esc(R.nom)}</b>
          <div class="muted">${lbl(R)} · ${R.groups.reduce((a, g) => a + g.members.length, 0)} élèves${R.sent ? ' · 📤 envoyé' : ''}</div></summary>
          <div data-body></div>
          <div class="row" style="margin-top:10px"><button class="btn btn-grad" data-send="${esc(R.id)}">📤 Envoyer dans Résultats des élèves</button><button class="btn btn-ghost" data-csv="${esc(R.id)}">⬇️ Export CSV</button><button class="btn btn-ghost" data-prof data-del="${esc(R.id)}">🗑</button></div></details>`).join('')
        : '<div class="card empty">Aucune séance de sauvetage enregistrée.</div>'}`;
    const $ = s => box.querySelector(s), byId = id => D.seances.find(x => x.id === id);
    if (C) { $('#rcur').innerHTML = C.groups.some(g => svGroup(C, g)) ? resHTML(C, rk) : '<p class="muted">Aucune étape terminée pour l\'instant.</p>'; $('#save').onclick = saveSeance; }
    const fill = d => { const R = byId(d.dataset.id); if (R && d.open) d.querySelector('[data-body]').innerHTML = resHTML(R, rk); };
    box.querySelectorAll('details[data-id]').forEach(d => { fill(d); d.ontoggle = () => { if (d.open) { openRec = d.dataset.id; fill(d); } }; });
    box.querySelectorAll('[data-rk]').forEach(b => b.onclick = () => { rk = b.dataset.rk; results(box); });
    box.querySelectorAll('[data-send]').forEach(b => b.onclick = () => { const R = byId(b.dataset.send); if (R) { sendRes(R); results(box); } });
    box.querySelectorAll('[data-csv]').forEach(b => b.onclick = () => { const R = byId(b.dataset.csv); if (R) download(`sauvetage-${(R.classe || 'classe').replace(/\W+/g, '_')}-${new Date(R.date).toISOString().slice(0, 10)}.csv`, csvOf([R])); });
    box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const R = byId(b.dataset.del); if (R && confirm(`Supprimer la séance « ${R.nom} » ?`)) { D.seances.splice(D.seances.indexOf(R), 1); save(); results(box); } });
    if ($('#expall')) $('#expall').onclick = () => download(`sauvetage-${new Date().toISOString().slice(0, 10)}.csv`, csvOf(D.seances));
  }

  /* ---------- Horloge ---------- */
  const tick = () => {
    if (!el.isConnected) return clearInterval(iv);
    const C = cur(); if (!C || !C.live || !['cd', 'go'].includes(C.live.st)) return;
    const ch = advance(C);
    if (tab === 'live') { if (ch) { const y = el.scrollTop; live(el.querySelector('#sv-body'), C); el.scrollTop = y; } else paint(C); }
  };
  frame();
  clearInterval(window._svTick); iv = window._svTick = setInterval(tick, 250);
  return () => { clearInterval(window._svTick); tabsVisible(true); };
};
