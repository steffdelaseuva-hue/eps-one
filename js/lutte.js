/* =========================================================
   EPS ONE — Outil « Lutte »
   Lutte au sol / lutte debout · match 1 contre 1, relais en équipe, tournoi à élimination
   · avec observation : chrono, barème 1 / 10 / 100, pénalités −10, défense, formes de corps
   · ou « libre · résultats simples » : vainqueur (score facultatif)
   · règle d'or : NE PAS FAIRE MAL !
   Données : DB.lutte = { cfg      barème et règles (réglages enseignant, synchronisés)
                          seances  relais / tournois partagés entre les tablettes (synchronisés)
                          combats  combats enregistrés (synchronisés)
                          current  combat en cours sur CET appareil (non synchronisé) }
   ========================================================= */
ICONS.lutte = '<circle cx="6.5" cy="5" r="2"/><circle cx="17.5" cy="5" r="2"/><path d="M7.5 7.5 10 13.5M16.5 7.5 14 13.5"/><path d="M8.3 9.8 14.5 8.6M15.7 9.8 9.5 8.6"/><path d="M10 13.5 6.5 16.5l1 4M10 13.5l1.2 7M14 13.5l3.5 3-1 4.5M14 13.5l-1.2 7"/><path d="M3 21.5h18"/>';

const LU_ATT = [{ k: 'pa', l: 'Passage arrière', p: 1 }, { k: 'sz', l: 'Sortie de zone', p: 1 }, { k: 'md', l: 'Mise en danger', p: 10 }, { k: 'tb', l: 'Tombé', p: 100, tombe: true }];
const LU_PEN = [{ k: 'coup', l: 'Coup', p: -10 }, { k: 'cle', l: 'Clé de bras', p: -10 }, { k: 'etr', l: 'Étranglement', p: -10 }, { k: 'tete', l: 'Traction sur la tête', p: -10 }];
const LU_DEF = { sol: [{ k: 'table', l: 'Se met en table', p: 0 }, { k: 'tortue', l: 'Se met en tortue', p: 0 }, { k: 'ventre', l: 'Se retourne sur le ventre', p: 0 }],
  debout: [{ k: 'lache', l: 'Fait lâcher la saisie', p: 0 }, { k: 'esq', l: 'Évite (esquive)', p: 0 }, { k: 'equi', l: 'Garde son équilibre', p: 0 }, { k: 'sort', l: 'Sort de la saisie', p: 0 }] };
const LU_FORMES = { sol: ['Retournement', 'Bascule', 'Ceinturage arrière', 'Tour de bras', 'Renversement par la jambe', 'Cravate (contrôlée)', 'Contrôle / immobilisation'],
  debout: ['Ceinturage avant', 'Ceinturage arrière', 'Crochet de jambe', 'Balayage', 'Amenée au sol', 'Tour de bras', 'Tour de hanche', 'Ramassement de jambe(s)', 'Cravate (contrôlée)'] };
const LU_RULES = { sol: { mode: 'temps', sec: 90, target: 30, rounds: 1, rest: 30, alt: true, tombeEnd: true, hold: true, formes: true, def: true, depart: 'Départ au sol : le défenseur à 4 pattes (en table), l\'attaquant à genoux à côté de lui.' },
  debout: { mode: 'temps', sec: 120, target: 30, rounds: 1, rest: 30, alt: false, tombeEnd: true, hold: true, formes: true, def: true, depart: 'Départ debout, face à face, en garde (mains sur les épaules et les bras).' } };
const LU_T = { sol: { i: '🧎', n: 'Lutte au sol', d: 'À genoux · retourner l\'adversaire sur le dos · défense : table, tortue, ventre' },
  debout: { i: '🧍', n: 'Lutte debout', d: 'Face à face · amener au sol, faire sortir de la zone · défense : lâcher, esquiver' } };
const LU_FP = { match: { i: '🤼', n: 'Match 1 contre 1', d: 'Deux lutteurs et un arbitre · combat isolé' },
  relais: { i: '🔁', n: 'Relais en équipe', d: '2 équipes, ordre de passage · score d\'équipe = somme des points' },
  tournoi: { i: '🏅', n: 'Tournoi à élimination', d: 'Tableau avec exempts · le vainqueur passe au tour suivant · une tablette par tapis' } };
const LU_SAI = { obs: { i: '👁', n: 'Avec observation', d: 'Chrono, points 1 · 10 · 100, pénalités, défense, formes de corps' },
  simple: { i: '✍️', n: 'Libre · résultats simples', d: 'On lutte, puis on saisit seulement le vainqueur (et le score si on veut)' } };
const LU_VAR = { reste: { i: '👑', n: 'Je gagne, je reste', d: 'Le vainqueur reste sur le tapis, le perdant est remplacé par le suivant de son équipe · égalité : les deux sortent · fin quand une équipe n\'a plus de lutteur' },
  sortent: { i: '↔️', n: 'Les deux sortent', d: 'Après chaque combat les deux lutteurs sortent, la paire suivante entre · chacun lutte une fois (la plus petite équipe recommence au début)' } };
const LU_SAFE = ['Tapis en place et jointifs, espace dégagé autour', 'Pas de coups, pas de clés de bras, pas d\'étranglements, pas de traction sur la tête ou la nuque',
  'Au signal « STOP » de l\'arbitre (ou si l\'adversaire tape 2 fois), on lâche tout immédiatement', 'Un arbitre par combat : il lance, arrête et compte les points',
  'Adversaires de taille et de poids proches', 'Ongles courts, pas de bijoux, cheveux attachés, pieds nus ou chaussettes', 'On se salue au début et à la fin du combat'];

const luClone = o => JSON.parse(JSON.stringify(o));
const luIsObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
const luId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function LU() { if (!luIsObj(DB.lutte)) DB.lutte = {}; const L = DB.lutte; if (!Array.isArray(L.combats)) L.combats = []; if (!Array.isArray(L.seances)) L.seances = []; return L; }
function luCfg() {
  const L = LU(); if (!luIsObj(L.cfg)) L.cfg = {}; const c = L.cfg;
  if (c.type !== 'debout') c.type = 'sol';
  if (!Array.isArray(c.att)) c.att = luClone(LU_ATT); if (!Array.isArray(c.pen)) c.pen = luClone(LU_PEN);
  ['def', 'formes', 'rules'].forEach(k => { if (!luIsObj(c[k])) c[k] = {}; });
  ['sol', 'debout'].forEach(t => { if (!Array.isArray(c.def[t])) c.def[t] = luClone(LU_DEF[t]); if (!Array.isArray(c.formes[t])) c.formes[t] = [...LU_FORMES[t]];
    c.rules[t] = { ...LU_RULES[t], ...(luIsObj(c.rules[t]) ? c.rules[t] : {}) }; });
  return c;
}
/* Barème + règles figés au lancement (une séance partagée garde les siens : mêmes règles sur toutes les tablettes) */
const luSnap = type => { const c = luCfg(); return luClone({ type, att: c.att, pen: c.pen, def: c.def[type], formes: c.formes[type], r: c.rules[type] }); };
const luSgn = p => p > 0 ? '+' + p : p < 0 ? '−' + -p : '0';
const luPts = p => `${luSgn(p)} pt${Math.abs(p) > 1 ? 's' : ''}`;
const luDur = s => `${Math.floor(s / 60)} min${s % 60 ? ' ' + String(s % 60).padStart(2, '0') : ''}`;
const luRulesLine = R => { const r = R.r, p = [];
  if (r.mode !== 'points') p.push(`${r.rounds > 1 ? r.rounds + ' manches de ' : ''}${luDur(r.sec)}`);
  if (r.mode !== 'temps') p.push(`${r.mode === 'both' ? 'ou ' : ''}${r.target} pts`);
  if (r.tombeEnd) p.push('tombé = victoire');
  return p.join(' · '); };
const luScore = (ev, w) => (ev || []).filter(e => e.w === w).reduce((s, e) => s + (+e.p || 0), 0);
function luOutcome(ev, R) {
  const sa = luScore(ev, 0), sb = luScore(ev, 1), tb = R.r.tombeEnd && ev.find(e => e.kind === 'att' && e.tombe);
  if (tb) return { sa, sb, w: tb.w ? 'b' : 'a', how: 'tombe' };
  if (sa !== sb) return { sa, sb, w: sa > sb ? 'a' : 'b', how: 'points' };
  return { sa, sb, w: null, how: 'nul' };
}
const luHm = d => new Date(d).toLocaleTimeString('fr-FR').slice(0, 5);
const luDate = d => new Date(d).toLocaleDateString('fr-FR');
const luEnc = s => Array.isArray(s.enCours) ? s.enCours.filter(e => e && e.id) : [];
const luWinName = m => m.w === 'a' ? m.a : m.w === 'b' ? m.b : null;
const luHow = m => m.how === 'tombe' ? 'par tombé' : m.how === 'points' ? 'aux points' : m.how === 'decision' ? 'décision de l\'arbitre' : '';
const luScTxt = m => m.sa == null || m.sb == null ? '' : `${m.sa} – ${m.sb}`;

/* Relais : état rejoué à partir des combats enregistrés */
function luRel(s) {
  const [A, B] = s.teams, nA = A.order.length, nB = B.order.length;
  const log = LU().combats.filter(m => m.sid === s.id && !m.obsOnly).sort((x, y) => (x.date || 0) - (y.date || 0));
  const st = { pts: [0, 0], v: [0, 0], nul: 0, log, ia: 0, ib: 0, k: log.length, done: false, next: null };
  log.forEach(m => { st.pts[0] += +m.sa || 0; st.pts[1] += +m.sb || 0; if (m.w === 'a') st.v[0]++; else if (m.w === 'b') st.v[1]++; else st.nul++;
    if (s.variant === 'reste') { if (m.w === 'a') st.ib++; else if (m.w === 'b') st.ia++; else { st.ia++; st.ib++; } } });
  if (s.variant === 'reste') { st.done = !nA || !nB || st.ia >= nA || st.ib >= nB; if (!st.done) st.next = { a: A.order[st.ia], b: B.order[st.ib] }; }
  else { st.total = Math.max(nA, nB); st.done = !nA || !nB || st.k >= st.total; if (!st.done) st.next = { a: A.order[st.k % nA], b: B.order[st.k % nB] }; }
  if (s.ended) { st.done = true; st.next = null; }
  st.win = !log.length ? null : st.pts[0] !== st.pts[1] ? (st.pts[0] > st.pts[1] ? 0 : 1) : st.v[0] !== st.v[1] ? (st.v[0] > st.v[1] ? 0 : 1) : -1;
  return st;
}
/* Tournoi à élimination : tableau (placement des têtes de série, exempts), recalculé à partir des combats */
const luSeed = n => { let o = [1]; while (o.length < n) { const m = o.length * 2; o = o.flatMap(x => [x, m + 1 - x]); } return o; };
function luBracket(players) {
  const n = players.length, size = 2 ** Math.ceil(Math.log2(Math.max(2, n))), ord = luSeed(size), rs = [];
  for (let i = 0; i < size / 2; i++) rs.push({ id: luId(), round: 1, slot: i, a: players[ord[2 * i] - 1] ?? null, b: players[ord[2 * i + 1] - 1] ?? null });
  for (let k = 2, c = size / 4; c >= 1; k++, c /= 2) for (let i = 0; i < c; i++) rs.push({ id: luId(), round: k, slot: i, a: null, b: null });
  return rs;
}
const LU_RN = ['Finale', 'Demi-finales', 'Quarts de finale', '8es de finale', '16es de finale', '32es de finale'];
const luRounds = s => Math.max(1, ...s.rencontres.map(r => r.round));
const luRName = (s, k) => LU_RN[luRounds(s) - k] || 'Tour ' + k;
function luElim(s) {
  const recs = LU().combats.filter(m => m.sid === s.id && m.rid && !m.obsOnly), R = luRounds(s), out = [];
  for (let k = 1; k <= R; k++) {
    const rs = s.rencontres.filter(r => r.round === k).sort((x, y) => (x.slot || 0) - (y.slot || 0));
    out.push(rs.map((r, i) => {
      const p = out[k - 2], a = k === 1 ? r.a ?? null : (p[2 * i] || {}).w ?? null, b = k === 1 ? r.b ?? null : (p[2 * i + 1] || {}).w ?? null;
      const n = { id: r.id, round: k, a, b, m: null, w: null, bye: false };
      if (k === 1 && (a == null) !== (b == null)) { n.bye = true; n.w = a ?? b; return n; }
      if (a == null || b == null) return n;
      recs.forEach(m => { if (m.rid === r.id && ((m.a === a && m.b === b) || (m.a === b && m.b === a)) && (!n.m || (m.date || 0) >= (n.m.date || 0))) n.m = m; });
      if (n.m) { const wn = luWinName(n.m) ?? (s.qualif || {})[r.id]; n.w = wn === a || wn === b ? wn : null; }
      return n;
    }));
  }
  return out;
}
function luRankT(s, E) {
  const R = E.length, out = {}, champ = E[R - 1][0] && E[R - 1][0].w;
  E.forEach((rd, k) => rd.forEach(n => { if (n.bye || n.w == null) return; const l = n.w === n.a ? n.b : n.a; out[l] = k + 1; }));
  return s.players.map(p => ({ n: p, rank: p === champ ? 1 : out[p] ? 2 ** (R - out[p]) + 1 : null, out: out[p] || null }))
    .sort((x, y) => (x.rank || 99) - (y.rank || 99) || x.n.localeCompare(y.n, 'fr'));
}
function luProgress(s) {
  const e = luEnc(s).length, ec = e ? ` · ⏳ ${e} en cours` : '';
  if (s.kind === 'relais') { const st = luRel(s); return `${st.k} combat${st.k > 1 ? 's' : ''} · ${s.teams[0].name} ${st.pts[0]} – ${st.pts[1]} ${s.teams[1].name}${st.done ? ' · terminé' : ''}${ec}`; }
  const E = luElim(s), fin = E[E.length - 1][0], n = E.flat().filter(x => !x.bye && x.w != null).length;
  return `${n}/${Math.max(0, s.players.length - 1)} combats${ec}${fin && fin.w ? ' · 🏆 ' + fin.w : ''}`;
}
/* Résumé d'un lutteur pour « Résultats des élèves » */
function luLine(m, i) {
  const E = (m.ev || []).filter(e => e.w === i), G = { att: {}, pen: {}, def: {}, forme: {} };
  E.forEach(e => { if (G[e.kind]) G[e.kind][e.l] = (G[e.kind][e.l] || 0) + 1; });
  const j = o => Object.entries(o).map(([l, n]) => `${l.toLowerCase()} ×${n}`).join(', ');
  const p = [`vs ${i ? m.a : m.b}`];
  if (Object.keys(G.att).length) p.push(j(G.att));
  if (Object.keys(G.pen).length) p.push('pénalités : ' + j(G.pen));
  if (Object.keys(G.def).length) p.push('défense : ' + j(G.def));
  if (Object.keys(G.forme).length) p.push('formes : ' + j(G.forme));
  if (m.sn) p.push(m.sn);
  return p.join(' · ');
}
const luClsOf = (m, n) => m.cls && studentsOf(m.cls).includes(n) ? m.cls : (DB.classes.find(c => studentsOf(c.name).includes(n)) || {}).name || '';
function luResults(m) {
  const lbl = 'Lutte ' + (m.type === 'debout' ? 'debout' : 'au sol');
  [0, 1].forEach(i => { const n = i ? m.b : m.a, cls = luClsOf(m, n); if (!cls || (m.obsOnly && m.obsW !== i)) return;
    const my = i ? m.sb : m.sa, op = i ? m.sa : m.sb, sc = my == null || op == null ? '' : ` ${my}–${op}`, w = m.w === (i ? 'b' : 'a');
    const valeur = m.obsOnly ? 'Observé' : m.w == null ? `Nul${sc}` : w ? `Victoire${sc}${m.how === 'tombe' ? ' (tombé)' : ''}` : `Défaite${sc}`;
    saveResult({ tool: 'lutte', key: `lutte:${m.id}:${i}`, label: lbl, classe: cls, eleve: n, valeur, detail: luLine(m, i) }); });
  if (m.arb && !m.obsOnly) { const cls = luClsOf(m, m.arb); if (cls) saveResult({ tool: 'lutte', key: `lutte:${m.id}:arb`, label: lbl, classe: cls, eleve: m.arb, valeur: 'Arbitre', detail: `${m.a} – ${m.b}${m.sn ? ' · ' + m.sn : ''}` }); }
}
function luDelCombat(id) {
  const L = LU(); L.combats = L.combats.filter(x => x.id !== id);
  const pre = 'r:lutte:' + id + ':'; DB.resultats = (DB.resultats || []).filter(r => !String(r.id || '').startsWith(pre));
  save(); window.syncFlush && window.syncFlush();
}
/* Bilan par élève */
function luAgg(names) {
  const A = Object.fromEntries(names.map(n => [n, { n, c: 0, v: 0, d: 0, nul: 0, pm: 0, pe: 0, tb: 0, md: 0, pen: 0, arb: 0, fo: {}, de: {}, pl: {} }]));
  LU().combats.forEach(m => {
    [0, 1].forEach(i => { const X = A[i ? m.b : m.a]; if (!X) return; if (m.obsOnly && m.obsW !== i) return;
      (m.ev || []).filter(e => e.w === i).forEach(e => { if (e.kind === 'forme') X.fo[e.l] = (X.fo[e.l] || 0) + 1; else if (e.kind === 'def') X.de[e.l] = (X.de[e.l] || 0) + 1;
        else if (e.kind === 'pen') { X.pen++; X.pl[e.l] = (X.pl[e.l] || 0) + 1; } else if (e.kind === 'att') { if (e.tombe) X.tb++; if (e.k === 'md') X.md++; } });
      if (m.obsOnly) return;
      X.c++; if (m.w == null) X.nul++; else if (m.w === (i ? 'b' : 'a')) X.v++; else X.d++;
      if (m.simple && m.how === 'tombe' && m.w === (i ? 'b' : 'a') && !(m.ev || []).length) X.tb++;
      X.pm += +(i ? m.sb : m.sa) || 0; X.pe += +(i ? m.sa : m.sb) || 0; });
    if (!m.obsOnly && A[m.arb]) A[m.arb].arb++;
  });
  return Object.values(A);
}
const luTop = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ×${n}`).join(', ');

document.head.insertAdjacentHTML('beforeend', `<style>
.lu-gold{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;background:linear-gradient(135deg,#D23B2F,#8E1B1B);color:#fff;font-weight:900;font-size:1.2rem;line-height:1.15;letter-spacing:.02em;box-shadow:var(--shadow)}
.lu-gold .ic{font-size:1.9rem;line-height:1}
.lu-gold small{display:block;font-weight:700;font-size:.78rem;opacity:.95;letter-spacing:0;margin-top:2px}
.lu-gold.sm{font-size:.98rem;padding:8px 12px;border-radius:12px;gap:8px}.lu-gold.sm .ic{font-size:1.3rem}
.lu-safe summary{font-weight:800;cursor:pointer}
.lu-safe ul{margin:8px 0 0;padding-left:20px}.lu-safe li{margin:4px 0;line-height:1.35}
.lu-h{font-size:.68rem;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:6px 2px 0}
.lu-act button{line-height:1.2}
.lu-act .lu-def{border-color:rgba(30,158,90,.55)}
.lu-act .lu-pen{border-color:rgba(214,69,69,.6);color:var(--danger);padding:8px 4px;font-size:.78rem}
.lu-act .lu-pen small{color:var(--danger)}
.lu-pens{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.lu-one{display:block;margin-top:12px}.lu-one .col{display:flex;flex-direction:column;gap:8px}
.lu-one button{padding:16px 10px;font-size:1.05rem;border-radius:14px}.lu-one .lu-pen{font-size:.9rem;padding:12px 6px}
.lu-one h4{font-size:1rem}
.lu-att{text-align:center;font-size:.88rem;margin-top:8px;font-weight:700}
.lu-att b.a{color:#9C7A1E}.lu-att b.b{color:#1E5BD8}
.lu-stop{background:#B42318;color:#fff;box-shadow:0 4px 12px rgba(180,35,24,.3)}
.lu-fc{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.lu-fc button{padding:9px 12px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);color:var(--text);font-weight:700;font-size:.86rem}
.lu-fc button b{display:inline-block;margin-left:4px;padding:0 6px;border-radius:99px;background:var(--grad);color:#fff;font-size:.75rem}
.lu-hold{position:fixed;inset:0;z-index:400;background:rgba(7,18,42,.86);display:grid;place-items:center;padding:16px}
.lu-hold .box{background:var(--card);color:var(--text);border-radius:22px;padding:22px 18px;max-width:430px;width:100%;text-align:center;box-shadow:var(--shadow)}
.lu-hold .big{font-size:4.6rem;font-weight:900;font-variant-numeric:tabular-nums;line-height:1.1;margin:6px 0}
.lu-hold .bar{height:14px;border-radius:99px;background:var(--line);overflow:hidden}.lu-hold .bar i{display:block;height:100%;width:0;background:var(--grad)}
.lu-win{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}
.lu-win button{padding:18px 8px;border-radius:16px;border:3px solid transparent;color:#fff;font-weight:900;font-size:1.1rem;line-height:1.2;opacity:.75;overflow-wrap:anywhere}
.lu-win button.a{background:linear-gradient(160deg,#D4AF37,#9C7A1E)}.lu-win button.b{background:linear-gradient(160deg,#3C7BE0,#0B2A5B)}
.lu-win button.on{opacity:1;border-color:var(--text);box-shadow:0 0 0 3px var(--gold2)}
.lu-it{display:flex;gap:6px;align-items:center;margin-top:6px}
.lu-it input[type=text]{flex:1;min-width:0}.lu-it input[type=number]{flex:0 0 74px;text-align:center;font-weight:800}
.lu-it button{flex:0 0 40px;height:40px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);color:var(--text);font-weight:800}
.lu-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.lu-chips span{display:inline-flex;align-items:center;gap:4px;padding:5px 6px 5px 10px;border-radius:99px;border:1.5px solid var(--line);font-weight:700;font-size:.85rem}
.lu-chips span button{border:none;background:none;color:var(--muted);font-weight:900;padding:2px 6px}
.lu-ord{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin-top:8px}
.lu-ord .card{padding:10px 12px}
.lu-ol{display:flex;align-items:center;gap:6px;padding:6px 0;border-top:1px solid var(--line);font-weight:700}
.lu-ol .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lu-ol button{flex:0 0 34px;height:34px;border-radius:9px;border:1.5px solid var(--line);background:var(--card);color:var(--text);font-weight:800;padding:0}
.lu-ol .st{font-size:.75rem;font-weight:800;color:var(--muted);white-space:nowrap}
.lu-ol.on{color:#1E9E5A}.lu-ol.out{opacity:.5}
.lu-tbl td,.lu-tbl th{text-align:center;white-space:nowrap}.lu-tbl td:first-child,.lu-tbl th:first-child{text-align:left}
.lu-tbl td.w{white-space:normal;min-width:140px;text-align:left;font-size:.8rem}
.lu-ck{display:flex;gap:8px;align-items:flex-start;margin-top:10px;font-weight:600}.lu-ck input{width:auto;margin-top:3px}
.lu-dim{opacity:.45}
</style>`);

TOOL_IMPL.lutte = function (el) {
  const luCls = () => (DB.classes.find(c => c.name === DB.lastClass) || DB.classes[0] || {}).name || '';
  const S = { forme: 'match', saisie: 'obs', cls: luCls(), a: '', b: '', view: null, barOpen: false };
  let M = null, iv = null, hold = null;
  const $ = q => el.querySelector(q);
  const role = () => (DB.tablette && DB.tablette.lutte && DB.tablette.lutte.role) === 'obs' ? 'obs' : 'arb';
  const stop = () => { clearInterval(iv); iv = null; if (hold) { clearInterval(hold.iv); hold.ov.remove(); hold = null; } };
  const flush = () => { save(); window.syncFlush && window.syncFlush(); };
  const keepY = fn => { const y = el.scrollTop; fn(); el.scrollTop = y; };
  const top = () => { el.scrollTop = 0; };
  const gold = sm => sm ? `<div class="lu-gold sm"><span class="ic">✋</span><span>NE PAS FAIRE MAL !<small>« STOP » de l'arbitre = on lâche tout immédiatement</small></span></div>`
    : `<div class="lu-gold"><span class="ic">✋</span><span>Règle d'or : NE PAS FAIRE MAL !<small>Règle incontournable, avant tout le reste</small></span></div>`;
  const safety = open => `<details class="card lu-safe" style="margin-top:10px" ${open ? 'open' : ''}><summary>🛡 Sécurité avant de lutter</summary><ul>${LU_SAFE.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>`;
  const tiles = (obj, cur, attr, keys) => `<div class="tn-fmts">${(keys || Object.keys(obj)).map(k => { const x = obj[k]; return `<button class="tn-fmt ${cur === k ? 'on' : ''}" data-${attr}="${k}" style="min-height:0"><span class="i">${x.i}</span><b>${x.n}</b><small>${x.d}</small></button>`; }).join('')}</div>`;
  const kindLbl = o => o.kind === 'relais' ? `🔁 ${esc(o.sn || 'Relais')}${o.lbl ? ' · ' + esc(o.lbl) : ''}` : o.kind === 'tournoi' ? `🏅 ${esc(o.sn || 'Tournoi')}${o.lbl ? ' · ' + esc(o.lbl) : ''}` : '🤼 Match 1 contre 1';
  const findS = id => LU().seances.find(x => x.id === id);
  /* combat « à moi » (lancé sur cette tablette) */
  const curO = () => M ? M.o : (LU().current && LU().current.o) || null;
  const release = o => { if (!o || !o.enc || !o.own) return; const s = findS(o.sid); if (s) { s.enCours = luEnc(s).filter(e => e.id !== o.enc); flush(); } };
  const clearCur = () => { delete LU().current; save(); };
  const back = o => { if (o && o.sid && findS(o.sid)) sview(o.sid); else home(); top(); };

  /* ===================== Accueil ===================== */
  function home() {
    stop(); M = null; S.view = null;
    const c = luCfg(), T = c.type, R = c.rules[T], cur = LU().current;
    const rec = LU().seances.filter(s => s.date >= Date.now() - 7 * 864e5).sort((x, y) => y.date - x.date);
    const hist = LU().combats.filter(m => !(window.eleveMode && eleveMode()) || !S.cls || m.cls === S.cls).sort((x, y) => (y.date || 0) - (x.date || 0));
    el.innerHTML = `${gold()}${safety(false)}
      ${cur && cur.o ? `<div class="card" style="margin-top:12px;border:2px solid #1E9E5A"><h3>⏸ Combat en cours sur cette tablette</h3>
        <div class="mo-vs" style="margin:6px 0"><span style="background:#B8912A">${esc(cur.o.a)}</span><span class="muted" style="color:var(--muted);padding:0">vs</span><span style="background:#1E5BD8">${esc(cur.o.b)}</span></div>
        <div class="muted" style="text-align:center;font-size:.85rem">${kindLbl(cur.o)} · ${LU_T[cur.o.R.type].n}</div>
        <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="lu-res" style="flex:2;padding:15px">▶ Reprendre</button><button class="btn btn-ghost" id="lu-abd">✕ Abandonner</button></div></div>` : ''}
      ${rec.length ? `<div class="card" style="margin-top:12px"><h3>🏆 Relais et tournois en cours</h3>${rec.map(s => `<button class="tn-it" data-sv="${esc(s.id)}"><span style="font-size:1.6rem">${s.kind === 'relais' ? '🔁' : '🏅'}</span><span style="flex:1"><b>${esc(s.nom)}</b><div class="muted" style="font-size:.8rem">${LU_T[s.type].n}${s.classe ? ' · ' + esc(s.classe) : ''} · ${s.saisie === 'simple' ? '✍️ résultats simples' : '👁 avec observation'} · ${esc(luProgress(s))} · ${luDate(s.date)}</div></span><span style="font-size:1.3rem">›</span></button>`).join('')}</div>` : ''}
      <div class="card" data-cfg style="margin-top:12px"><h3>Type de lutte</h3>${tiles(LU_T, T, 'lt')}
        <p class="muted" style="font-size:.82rem;margin:8px 0 0">📍 ${esc(R.depart)}</p></div>
      <div class="card" style="margin-top:12px"><h3>Forme de pratique</h3>${tiles(LU_FP, S.forme, 'fp')}
        <label>Déroulement</label>${tiles(LU_SAI, S.saisie, 'sai')}
        <div id="lu-fp" style="margin-top:12px">${fpHTML()}</div></div>
      ${rulesHTML(T, R)}
      ${baremeHTML(c, T)}
      <div class="card" data-cfg style="margin-top:12px"><h3>Rôle de cette tablette</h3>
        <div class="tog" id="lu-ro"><button data-ro="arb" class="${role() === 'arb' ? 'on' : ''}">🧑‍⚖️ Arbitre · combat complet</button><button data-ro="obs" class="${role() === 'obs' ? 'on' : ''}">👁 Observateur · suit un lutteur</button></div>
        <p class="muted" style="font-size:.78rem;margin:8px 0 0">📱 Observateur : un élève observe <b>un seul lutteur</b> (attaque, défense, pénalités, formes de corps). Ses observations sont enregistrées sans compter pour le résultat — idéal quand la tablette de l'arbitre est en « résultats simples ». Réglage propre à cet appareil.</p></div>
      <div class="section-title"><h2>Combats enregistrés (${hist.length})</h2><span style="display:flex;gap:14px"><button class="link" id="lu-bil">📊 Bilan des élèves</button>${hist.length ? '<button class="link" id="lu-csv">Exporter CSV</button>' : ''}</span></div>
      <div class="card" style="padding:0">${hist.length ? hist.slice(0, 15).map(m => `<div class="list-item"><div style="flex:1;min-width:0"><b>${m.obsOnly ? `👁 ${esc(m.obsW ? m.b : m.a)} (observé)` : `${esc(m.a)} ${luScTxt(m) || 'vs'} ${esc(m.b)}`}</b>
          <div class="muted" style="font-size:.8rem">${m.obsOnly ? 'Observation' : luWinName(m) ? '🏆 ' + esc(luWinName(m)) + (luHow(m) ? ' · ' + luHow(m) : '') : '🤝 Égalité'} · ${m.type === 'debout' ? 'debout' : 'au sol'}${m.sn ? ' · ' + esc(m.sn) : ''}${m.simple ? ' · ✍️' : ''} · ${luDate(m.date)} ${luHm(m.date)}</div></div>
          <button class="btn btn-ghost" data-hv="${esc(m.id)}" aria-label="Voir">👁</button><button class="btn btn-ghost" data-cfg="bare" data-hx="${esc(m.id)}" aria-label="Supprimer">🗑</button></div>`).join('') : '<div class="empty">Aucun combat enregistré.</div>'}</div>`;
    // type, forme, déroulement
    el.querySelectorAll('[data-lt]').forEach(b => b.onclick = () => { luCfg().type = b.dataset.lt; save(); keepY(home); });
    el.querySelectorAll('[data-fp]').forEach(b => b.onclick = () => { S.forme = b.dataset.fp; keepY(home); });
    el.querySelectorAll('[data-sai]').forEach(b => b.onclick = () => { S.saisie = b.dataset.sai; keepY(home); });
    el.querySelectorAll('[data-ro]').forEach(b => b.onclick = () => { DB.tablette = DB.tablette || {}; DB.tablette.lutte = { ...(DB.tablette.lutte || {}), role: b.dataset.ro }; save();
      el.querySelectorAll('[data-ro]').forEach(x => x.classList.toggle('on', x === b)); });
    el.querySelectorAll('[data-sv]').forEach(b => b.onclick = () => sview(b.dataset.sv));
    if ($('#lu-res')) $('#lu-res').onclick = () => resume();
    if ($('#lu-abd')) $('#lu-abd').onclick = () => { if (!confirm('Abandonner le combat en cours ?\nRien ne sera enregistré.')) return; release(cur.o); clearCur(); home(); };
    $('#lu-bil').onclick = bilan;
    if ($('#lu-csv')) $('#lu-csv').onclick = csvAll;
    el.querySelectorAll('[data-hv]').forEach(b => b.onclick = () => { const m = LU().combats.find(x => x.id === b.dataset.hv); if (m) summary(m, true); });
    el.querySelectorAll('[data-hx]').forEach(b => b.onclick = () => { if (!confirm('Supprimer ce combat (et les résultats des élèves associés) ?')) return; luDelCombat(b.dataset.hx); keepY(home); });
    wireFp(); wireRules(T); wireBareme(T);
  }

  /* ----- Forme de pratique ----- */
  function fpHTML() {
    if (S.forme === 'relais') return `<button class="btn btn-grad btn-block" data-cfg="bare" id="lu-crel" style="padding:15px;font-size:1.05rem">🔁 Créer un relais en équipe</button>
      <p class="muted" style="font-size:.8rem;margin:6px 0 0">Partagé avec vos autres tablettes · ordre de passage · « je gagne je reste » ou « les deux sortent ».</p>`;
    if (S.forme === 'tournoi') return `<button class="btn btn-grad btn-block" data-cfg="bare" id="lu-ctn" style="padding:15px;font-size:1.05rem">🏅 Créer un tournoi à élimination</button>
      <p class="muted" style="font-size:.8rem;margin:6px 0 0">Partagé avec vos autres tablettes : chaque tablette (un tapis) lance un combat du tableau.</p>`;
    if (S.cls && !DB.classes.some(c => c.name === S.cls)) S.cls = '';
    const st = S.cls ? studentsOf(S.cls) : [];
    if (st.length) { if (!st.includes(S.a)) S.a = st[0]; if (!st.includes(S.b) || S.b === S.a) S.b = st.find(x => x !== S.a) || ''; }
    const opt = sel => st.map(n => `<option ${n === sel ? 'selected' : ''}>${esc(n)}</option>`).join('');
    return `${DB.classes.length ? `<label>Classe</label><select id="lu-cls">${DB.classes.map(c => `<option value="${esc(c.name)}" ${c.name === S.cls ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}<option value="" ${S.cls ? '' : 'selected'}>✏️ Noms libres</option></select>` : ''}
      <div class="row">${st.length ? `<div><label>🟡 Lutteur A</label><select id="lu-a">${opt(S.a)}</select></div><div><label>🔵 Lutteur B</label><select id="lu-b">${opt(S.b)}</select></div>`
        : `<div><label>🟡 Lutteur A</label><input id="lu-ai" value="${esc(S.a)}" placeholder="Prénom"></div><div><label>🔵 Lutteur B</label><input id="lu-bi" value="${esc(S.b)}" placeholder="Prénom"></div>`}</div>
      <p class="muted" style="font-size:.78rem;margin:6px 0 0">⚖️ Choisir des adversaires de taille et de poids proches.</p>
      <button class="btn btn-grad btn-block" id="lu-go" style="margin-top:12px;padding:16px;font-size:1.1rem">▶ Préparer le combat</button>`;
  }
  function wireFp() {
    if ($('#lu-crel')) $('#lu-crel').onclick = () => createRelais();
    if ($('#lu-ctn')) $('#lu-ctn').onclick = () => createTournoi();
    const keepN = () => { if ($('#lu-a')) { S.a = $('#lu-a').value; S.b = $('#lu-b').value; } if ($('#lu-ai')) { S.a = $('#lu-ai').value.trim(); S.b = $('#lu-bi').value.trim(); } };
    if ($('#lu-cls')) $('#lu-cls').onchange = () => { S.cls = $('#lu-cls').value; if (S.cls) { DB.lastClass = S.cls; save(); } S.a = S.b = ''; $('#lu-fp').innerHTML = fpHTML(); wireFp(); };
    if ($('#lu-a')) $('#lu-a').onchange = $('#lu-b').onchange = keepN;
    if ($('#lu-go')) $('#lu-go').onclick = () => { keepN(); const a = S.a || 'Lutteur A', b = S.b || 'Lutteur B';
      if (a === b) return toast('Choisissez deux lutteurs différents');
      const c = luCfg(); prematch({ a, b, cls: S.cls, kind: 'match', saisie: S.saisie, R: luSnap(c.type) }); };
  }

  /* ----- Règles (réglages enseignant) ----- */
  function rulesHTML(T, R) {
    const ck = (id, on, txt) => `<label class="lu-ck"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><span>${txt}</span></label>`;
    return `<div class="card" data-cfg style="margin-top:12px"><h3>Règles du combat · ${LU_T[T].n}</h3>
      <label>Fin du combat</label><div class="seg" id="lu-mode">${[['temps', '⏱ Au temps'], ['points', '🎯 Aux points'], ['both', '⏱ + 🎯 Le 1er atteint']].map(([k, l]) => `<button data-md="${k}" class="${R.mode === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      ${R.mode !== 'points' ? `<label>Durée ${R.rounds > 1 ? 'd\'une manche' : 'du combat'}</label><div class="tog">${[60, 90, 120, 150, 180].map(s => `<button data-sec="${s}" class="${R.sec === s ? 'on' : ''}">${luDur(s)}</button>`).join('')}</div>
        <div class="row"><div><label>Autre durée (secondes)</label><input id="lu-sec" type="number" min="10" step="5" value="${R.sec}"></div>
          <div><label>Manches</label><div class="tog" style="margin-top:0">${[1, 2, 3].map(n => `<button data-rd="${n}" class="${R.rounds === n ? 'on' : ''}">${n}</button>`).join('')}</div></div></div>
        ${R.rounds > 1 ? `<div class="row"><div><label>Repos entre les manches (s)</label><input id="lu-rest" type="number" min="0" step="5" value="${R.rest}"></div></div>
          ${ck('lu-alt', R.alt, 'Alterner attaquant / défenseur à chaque manche')}` : ''}` : ''}
      ${R.mode !== 'temps' ? `<label>Points à atteindre (le premier qui y arrive gagne)</label><input id="lu-tg" type="number" min="1" value="${R.target}">` : ''}
      ${ck('lu-te', R.tombeEnd, 'Un <b>tombé</b> termine le combat (victoire immédiate)')}
      ${ck('lu-ho', R.hold, 'Tombé validé après <b>2 secondes</b> omoplates au tapis (minuteur à l\'écran)')}
      ${ck('lu-de', R.def, 'Observer le <b>défenseur</b> (' + esc(luCfg().def[T].map(x => x.l.toLowerCase()).join(', ')) + ')')}
      ${ck('lu-fo', R.formes, 'Observer les <b>formes de corps</b> utilisées')}
      <label>Position de départ</label><textarea id="lu-dep" rows="2">${esc(R.depart)}</textarea></div>`;
  }
  function wireRules(T) {
    const R = luCfg().rules[T], up = () => { save(); keepY(home); };
    el.querySelectorAll('[data-md]').forEach(b => b.onclick = () => { R.mode = b.dataset.md; up(); });
    el.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => { R.sec = +b.dataset.sec; up(); });
    el.querySelectorAll('[data-rd]').forEach(b => b.onclick = () => { R.rounds = +b.dataset.rd; up(); });
    const num = (id, k, min) => { const x = $(id); if (x) x.onchange = () => { R[k] = Math.max(min, Math.round(+x.value || 0)); up(); }; };
    num('#lu-sec', 'sec', 10); num('#lu-rest', 'rest', 0); num('#lu-tg', 'target', 1);
    [['#lu-alt', 'alt'], ['#lu-te', 'tombeEnd'], ['#lu-ho', 'hold'], ['#lu-de', 'def'], ['#lu-fo', 'formes']].forEach(([id, k]) => { const x = $(id); if (x) x.onchange = () => { R[k] = x.checked; save(); }; });
    $('#lu-dep').onchange = () => { R.depart = $('#lu-dep').value.trim() || LU_RULES[T].depart; up(); };
  }

  /* ----- Barème et observables (modifiables) ----- */
  function baremeHTML(c, T) {
    const list = (key, arr, title, hint) => `<div style="margin-top:14px"><b>${title}</b>${hint ? `<div class="muted" style="font-size:.78rem">${hint}</div>` : ''}
      ${arr.map((it, i) => `<div class="lu-it"><input type="text" data-il="${key}|${i}" value="${esc(it.l)}" aria-label="Intitulé"><input type="number" data-ip="${key}|${i}" value="${+it.p || 0}" aria-label="Points"><button data-ix="${key}|${i}" aria-label="Supprimer">✕</button></div>`).join('')}
      <button class="btn btn-ghost" data-ia="${key}" style="margin-top:6px;padding:8px 12px">＋ Ajouter</button></div>`;
    return `<details class="card" data-cfg style="margin-top:12px" id="lu-bar" ${S.barOpen ? 'open' : ''}><summary style="font-weight:800;cursor:pointer">⚙️ Barème et observables (modifiables)</summary>
      <p class="muted" style="font-size:.8rem;margin:8px 0 0">Intitulé et points de chaque bouton. Les combats déjà enregistrés gardent leur barème.</p>
      ${list('att', c.att, '🗡 Attaquant', 'Le bouton « Tombé » (validé après 2 s) garde son rôle même renommé.')}
      ${list('pen', c.pen, '⚠️ Pénalités', 'Points retirés au lutteur fautif (toujours négatifs).')}
      ${list('def', c.def[T], `🛡 Défenseur · ${LU_T[T].n.toLowerCase()}`, '0 point = simple observation.')}
      <div style="margin-top:14px"><b>🤼 Formes de corps · ${LU_T[T].n.toLowerCase()}</b>
        <div class="lu-chips">${c.formes[T].map((f, i) => `<span>${esc(f)}<button data-fx="${i}" aria-label="Retirer">✕</button></span>`).join('')}</div>
        <div class="lu-it"><input type="text" id="lu-fnew" placeholder="Nouvelle forme de corps"><button id="lu-fadd" style="flex:0 0 auto;padding:0 12px">＋</button></div></div>
      <button class="btn btn-ghost btn-block" id="lu-rst" style="margin-top:14px">↺ Rétablir le barème par défaut</button></details>`;
  }
  function wireBareme(T) {
    const c = luCfg(), L = k => k === 'def' ? c.def[T] : c[k], up = () => { save(); keepY(home); };
    $('#lu-bar').ontoggle = () => { S.barOpen = $('#lu-bar').open; };
    el.querySelectorAll('[data-il]').forEach(x => x.onchange = () => { const [k, i] = x.dataset.il.split('|'); const it = L(k)[+i]; if (it) { it.l = x.value.trim() || it.l; save(); } });
    el.querySelectorAll('[data-ip]').forEach(x => x.onchange = () => { const [k, i] = x.dataset.ip.split('|'); const it = L(k)[+i]; if (!it) return; let p = Math.round(+x.value || 0); if (k === 'pen') p = -Math.abs(p); it.p = p; x.value = p; save(); });
    el.querySelectorAll('[data-ix]').forEach(b => b.onclick = () => { const [k, i] = b.dataset.ix.split('|'), it = L(k)[+i]; if (!it || !confirm(`Retirer « ${it.l} » ?`)) return; L(k).splice(+i, 1); up(); });
    el.querySelectorAll('[data-ia]').forEach(b => b.onclick = () => { const k = b.dataset.ia; L(k).push({ k: 'c' + luId(), l: k === 'pen' ? 'Nouvelle pénalité' : k === 'def' ? 'Nouvel observable' : 'Nouvelle action', p: k === 'pen' ? -10 : k === 'def' ? 0 : 1 }); up(); });
    el.querySelectorAll('[data-fx]').forEach(b => b.onclick = () => { c.formes[T].splice(+b.dataset.fx, 1); up(); });
    const add = () => { const v = $('#lu-fnew').value.trim(); if (!v) return; if (!c.formes[T].includes(v)) c.formes[T].push(v); up(); };
    $('#lu-fadd').onclick = add; $('#lu-fnew').onkeydown = e => { if (e.key === 'Enter') add(); };
    $('#lu-rst').onclick = () => { if (!confirm(`Rétablir le barème, les observables, les formes de corps et les règles par défaut (${LU_T[T].n.toLowerCase()}) ?`)) return;
      c.att = luClone(LU_ATT); c.pen = luClone(LU_PEN); c.def[T] = luClone(LU_DEF[T]); c.formes[T] = [...LU_FORMES[T]]; c.rules[T] = { ...LU_RULES[T] }; up(); toast('Barème par défaut rétabli'); };
  }

  /* ===================== Avant le combat ===================== */
  function prematch(o) {
    stop(); M = null; const R = o.R, r = R.r;
    LU().current = { o, pre: true }; save();
    const st = o.cls ? studentsOf(o.cls).filter(n => n !== o.a && n !== o.b) : [];
    const askAtt = o.saisie !== 'simple' && role() !== 'obs' && (R.type === 'sol' || (r.rounds > 1 && r.alt));
    o.first = o.first || 0;
    el.innerHTML = `${gold()}
      <div class="card" style="margin-top:12px;text-align:center"><div class="muted" style="font-weight:800;font-size:.85rem">${kindLbl(o)}</div>
        <div class="mo-vs" style="margin:10px 0"><span style="background:#B8912A">${esc(o.a)}</span><span class="muted" style="color:var(--muted);padding:0">vs</span><span style="background:#1E5BD8">${esc(o.b)}</span></div>
        <div style="font-weight:800">${LU_T[R.type].i} ${LU_T[R.type].n} · ${o.saisie === 'simple' ? '✍️ résultats simples' : '👁 avec observation'}</div>
        <div class="muted" style="font-size:.85rem;margin-top:4px">${o.saisie === 'simple' ? '' : esc(luRulesLine(R)) + '<br>'}📍 ${esc(r.depart)}</div></div>
      ${askAtt ? `<div class="card" style="margin-top:12px"><h3>🗡 Qui attaque en premier ?</h3><div class="lu-win" style="margin-bottom:0"><button class="a ${o.first === 0 ? 'on' : ''}" data-fa="0">${esc(o.a)}</button><button class="b ${o.first === 1 ? 'on' : ''}" data-fa="1">${esc(o.b)}</button></div>
        ${r.rounds > 1 && r.alt ? '<p class="muted" style="font-size:.8rem;margin:8px 0 0">Les rôles s\'inversent à chaque manche.</p>' : ''}</div>` : ''}
      <div class="card" style="margin-top:12px"><h3>🧑‍⚖️ Arbitre</h3>
        ${st.length ? `<select id="lu-arb"><option value="">— Aucun / l'enseignant —</option>${st.map(n => `<option ${n === o.arb ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>` : `<input id="lu-arb" value="${esc(o.arb || '')}" placeholder="Prénom de l'arbitre (facultatif)">`}
        <p class="muted" style="font-size:.78rem;margin:6px 0 0">L'arbitre lance et arrête le combat, crie « STOP » au moindre danger, et compte les points.</p></div>
      ${safety(true)}
      <button class="btn btn-grad btn-block" id="lu-start" style="margin-top:14px;padding:18px;font-size:1.15rem">🤝 Saluez-vous · ${o.saisie === 'simple' ? '✍️ Saisir le résultat' : role() === 'obs' ? '👁 Observer' : '▶ Aller au tapis'}</button>
      <button class="btn btn-ghost btn-block" id="lu-bk" style="margin-top:8px">← Annuler</button>`;
    el.querySelectorAll('[data-fa]').forEach(b => b.onclick = () => { o.first = +b.dataset.fa; el.querySelectorAll('[data-fa]').forEach(x => x.classList.toggle('on', x === b)); });
    $('#lu-bk').onclick = () => { if (o.enc && o.own && !confirm('Annuler ce combat ?\nIl sera retiré des combats en cours.')) return; release(o); clearCur(); back(o); };
    $('#lu-start').onclick = () => { o.arb = ($('#lu-arb').value || '').trim(); beep(1000, .08); top();
      if (o.saisie === 'simple') simple(o); else fight(o); };
    top();
  }

  /* ===================== Combat (avec observation) ===================== */
  const now = () => M.acc + (M.run ? performance.now() - M.t0 : 0);
  function persist() { if (!M) return; const x = { o: M.o, ev: M.ev, acc: M.phase === 'rest' ? 0 : now(), round: M.round, phase: M.phase === 'end' ? 'fight' : M.phase, total: M.total, att: M.att, obsW: M.obsW, fw: M.fw, id: M.id }; LU().current = luClone(x); save(); }
  function resume() {
    const c = LU().current; if (!c || !c.o) return home();
    if (c.pre) return prematch(c.o);
    if (c.o.saisie === 'simple') return simple(c.o);
    fight(c.o, c);
  }
  function fight(o, res) {
    stop(); const R = o.R, r = R.r, timed = r.mode !== 'points';
    if (role() === 'obs' && !res) o.obsOnly = true;
    const obs = !!o.obsOnly;
    M = { id: luId(), o, ev: [], acc: 0, t0: 0, run: false, round: 1, phase: 'fight', total: 0, att: o.first || 0, obsW: 0, fw: 0, bp: {}, tk: 0 };
    if (res) Object.assign(M, luClone({ id: res.id || M.id, ev: res.ev || [], acc: res.acc || 0, round: res.round || 1, phase: res.phase === 'rest' ? 'rest' : 'fight', total: res.total || 0, att: res.att || 0, obsW: res.obsW || 0, fw: res.fw || 0 }), { run: false });
    if (M.phase === 'rest') { M.t0 = performance.now(); M.run = true; }
    const nm = w => w ? o.b : o.a;
    el.innerHTML = `${gold(true)}
      <div class="sb" style="margin-top:10px"><div class="tm a" id="lu-ta"><span>${esc(o.a)}</span><b id="lu-sa">0</b></div>
        <div class="ck"><div class="muted" id="lu-ckl" style="font-size:.66rem;font-weight:800;line-height:1.2"></div><b id="lu-ck">00:00</b></div>
        <div class="tm b" id="lu-tbb"><span>${esc(o.b)}</span><b id="lu-sb">0</b></div></div>
      <div class="lu-att" id="lu-att"></div>
      <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="lu-go" style="flex:2;padding:15px;font-size:1.1rem">▶ Démarrer</button><button class="btn lu-stop" id="lu-stop" style="padding:15px;font-size:1.1rem">✋ STOP</button></div>
      <div id="lu-body"></div>
      <div class="row" style="margin-top:12px"><button class="btn btn-ghost" id="lu-un">↶ Annuler la dernière action</button><button class="btn btn-danger" id="lu-end">🏁 Fin ${obs ? '— enregistrer les observations' : 'du combat'}</button></div>
      <p class="muted" id="lu-last" style="text-align:center;margin:8px 0;min-height:1.2em"></p>
      <div class="muted" style="text-align:center;font-size:.8rem">${kindLbl(o)} · ${LU_T[R.type].n} · ${esc(luRulesLine(R))}${o.arb ? ' · arbitre : ' + esc(o.arb) : ''}</div>
      <div style="text-align:center;margin:14px 0 4px"><button class="link" id="lu-quit">✕ Quitter sans enregistrer</button></div>`;
    const head = () => {
      if (!M || !$('#lu-go')) return;
      $('#lu-ckl').textContent = M.phase === 'rest' ? 'REPOS' : timed ? (r.rounds > 1 ? `MANCHE ${M.round}/${r.rounds}` : 'TEMPS RESTANT') : `TEMPS · objectif ${r.target} pts`;
      $('#lu-go').textContent = M.phase === 'rest' ? '⏭ Passer le repos' : M.run ? '⏸ Pause' : M.acc ? '▶ Reprendre' : M.round > 1 ? `▶ Manche ${M.round}` : '▶ Démarrer';
      const showAtt = !obs && (R.type === 'sol' || (r.rounds > 1 && r.alt));
      $('#lu-att').innerHTML = M.phase === 'rest' ? `😮‍💨 Repos · prochaine manche : ${M.round + 1}/${r.rounds}${r.alt ? ` · attaquant : <b class="${M.att ? 'a' : 'b'}">${esc(nm(1 - M.att))}</b>` : ''}`
        : showAtt ? `🗡 Attaquant : <b class="${M.att ? 'b' : 'a'}">${esc(nm(M.att))}</b> · 🛡 Défenseur : <b class="${M.att ? 'a' : 'b'}">${esc(nm(1 - M.att))}</b>` : '';
      if (obs) { $('#lu-ta').classList.toggle('lu-dim', M.obsW === 1); $('#lu-tbb').classList.toggle('lu-dim', M.obsW === 0); }
    };
    const cnt = (w, kind, k) => M.ev.filter(e => e.w === w && e.kind === kind && e.k === k).length;
    const col = w => `<div class="col ${w ? 'cb' : 'ca'}"><h4>${esc(nm(w))}</h4>
        <div class="lu-h">🗡 Attaque</div>
        ${R.att.map((it, i) => { const n = cnt(w, 'att', it.k); return `<button class="sc" data-la="${w}|${i}">${esc(it.l)}${it.tombe && r.hold ? ' ⏱' : ''}<small>${luPts(+it.p || 0)}${n ? ' · ×' + n : ''}</small></button>`; }).join('')}
        ${r.def && R.def.length ? `<div class="lu-h">🛡 Défense</div>${R.def.map((it, i) => { const n = cnt(w, 'def', it.k); return `<button class="lu-def" data-ld="${w}|${i}">${esc(it.l)}<small>${+it.p ? luPts(+it.p) + ' · ' : ''}×${n}</small></button>`; }).join('')}` : ''}
        ${R.pen.length ? `<div class="lu-h">⚠️ Pénalités</div><div class="lu-pens">${R.pen.map((it, i) => { const n = cnt(w, 'pen', it.k); return `<button class="lu-pen" data-lp="${w}|${i}">${esc(it.l)}<small>${luSgn(+it.p || 0)}${n ? ' · ×' + n : ''}</small></button>`; }).join('')}</div>` : ''}</div>`;
    const formes = () => { if (!r.formes || !R.formes.length) return ''; const w = obs ? M.obsW : M.fw;
      return `<div class="card" style="margin-top:12px;padding:12px"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><b>🤼 Forme de corps de</b>
        ${obs ? `<b style="color:${w ? '#1E5BD8' : '#9C7A1E'}">${esc(nm(w))}</b>` : `<div class="seg" style="flex:1;margin:0;min-width:200px">${[0, 1].map(x => `<button data-fw="${x}" class="${x === w ? 'on' : ''}">${esc(nm(x))}</button>`).join('')}</div>`}</div>
        <div class="lu-fc">${R.formes.map((f, i) => { const n = M.ev.filter(e => e.w === w && e.kind === 'forme' && e.l === f).length; return `<button data-lf="${i}">${esc(f)}${n ? `<b>×${n}</b>` : ''}</button>`; }).join('')}</div>
        ${obs ? '' : '<p class="muted" style="font-size:.75rem;margin:6px 0 0">Après une action d\'attaque, le lutteur qui a marqué est sélectionné automatiquement.</p>'}</div>`; };
    const body = () => obs ? `<div class="seg" style="margin-top:12px">${[0, 1].map(x => `<button data-ow="${x}" class="${x === M.obsW ? 'on' : ''}">👁 ${esc(nm(x))}</button>`).join('')}</div>
        <div class="act lu-act lu-one">${col(M.obsW)}</div>${formes()}` : `<div class="act lu-act">${col(0)}${col(1)}</div>${formes()}`;
    const elapsed = () => Math.round((M.total + (M.phase === 'fight' ? now() : 0)) / 1000);
    const paint = e => { if (!M || !$('#lu-body')) return; $('#lu-sa').textContent = luScore(M.ev, 0); $('#lu-sb').textContent = luScore(M.ev, 1);
      $('#lu-body').innerHTML = body(); wire(); head();
      if (e) $('#lu-last').textContent = `${e.kind === 'pen' ? '⚠️ Pénalité : ' : e.kind === 'def' ? '🛡 ' : e.kind === 'forme' ? '🤼 ' : ''}${e.l}${e.p ? ' (' + luSgn(e.p) + ')' : ''} — ${nm(e.w)}`; };
    const add = e => { if (!M || M.phase === 'end') return; e.t = elapsed(); e.r = M.round; M.ev.push(e); paint(e); persist(); checkPts(); };
    const checkPts = () => { if (r.mode === 'temps' || obs) return; const a = luScore(M.ev, 0), b = luScore(M.ev, 1);
      if (Math.max(a, b) >= r.target) { [0, 350, 700].forEach(d => setTimeout(() => beep(1000, .4), d)); toast(`🎯 ${a > b ? o.a : o.b} atteint ${r.target} points`); finish(); } };
    const tombe = (w, it) => {
      if (!r.hold) { add({ kind: 'att', w, k: it.k, l: it.l, p: +it.p || 0, tombe: true }); [0, 200, 400].forEach(d => setTimeout(() => beep(1500, .15), d)); if (r.tombeEnd && !obs) finish(); return; }
      if (hold) return;
      const ov = document.createElement('div'); ov.className = 'lu-hold';
      ov.innerHTML = `<div class="box"><div style="font-weight:900;font-size:1.25rem">⏱ Tombé de ${esc(nm(w))} ?</div>
        <p class="muted" style="margin:6px 0 0">Les deux omoplates de ${esc(nm(1 - w))} collées au tapis pendant 2 secondes</p>
        <div class="big" id="lu-hn">2,0</div><div class="bar"><i id="lu-hb"></i></div>
        <button class="btn btn-danger btn-block" id="lu-hx" style="margin-top:16px;padding:18px;font-size:1.1rem">✋ Il s'est dégagé — annuler</button></div>`;
      document.body.appendChild(ov); const t0 = performance.now(); beep(900, .1);
      hold = { ov, b1: false, iv: setInterval(() => { const d = performance.now() - t0, left = Math.max(0, 2000 - d);
        ov.querySelector('#lu-hn').textContent = (left / 1000).toFixed(1).replace('.', ','); ov.querySelector('#lu-hb').style.width = Math.min(100, d / 20) + '%';
        if (d >= 1000 && !hold.b1) { hold.b1 = true; beep(1000, .08); }
        if (left <= 0) { clearInterval(hold.iv); ov.remove(); hold = null; add({ kind: 'att', w, k: it.k, l: it.l, p: +it.p || 0, tombe: true });
          [0, 200, 400].forEach(dd => setTimeout(() => beep(1500, .15), dd)); toast(`✔ Tombé validé : ${nm(w)}`); if (r.tombeEnd && !obs && M && M.phase !== 'end') finish(); } }, 50) };
      ov.querySelector('#lu-hx').onclick = () => { if (!hold) return; clearInterval(hold.iv); ov.remove(); hold = null; beep(500, .2); toast('Tombé non validé'); };
    };
    const wire = () => {
      el.querySelectorAll('[data-la]').forEach(b => b.onclick = () => { const [w, i] = b.dataset.la.split('|').map(Number), it = R.att[i]; if (!it) return;
        if (!obs) M.fw = w;
        if (it.tombe) return tombe(w, it);
        add({ kind: 'att', w, k: it.k, l: it.l, p: +it.p || 0 }); beep(1200, .12); });
      el.querySelectorAll('[data-ld]').forEach(b => b.onclick = () => { const [w, i] = b.dataset.ld.split('|').map(Number), it = R.def[i]; if (it) { add({ kind: 'def', w, k: it.k, l: it.l, p: +it.p || 0 }); beep(900, .06); } });
      el.querySelectorAll('[data-lp]').forEach(b => b.onclick = () => { const [w, i] = b.dataset.lp.split('|').map(Number), it = R.pen[i]; if (it) { add({ kind: 'pen', w, k: it.k, l: it.l, p: -Math.abs(+it.p || 0) }); beep(400, .35); } });
      el.querySelectorAll('[data-lf]').forEach(b => b.onclick = () => { const f = R.formes[+b.dataset.lf]; if (f != null) { add({ kind: 'forme', w: obs ? M.obsW : M.fw, k: 'f', l: f, p: 0 }); beep(1000, .04); } });
      el.querySelectorAll('[data-fw]').forEach(b => b.onclick = () => { M.fw = +b.dataset.fw; paint(); });
      el.querySelectorAll('[data-ow]').forEach(b => b.onclick = () => { M.obsW = +b.dataset.ow; paint(); persist(); });
    };
    const endRest = () => { M.phase = 'fight'; M.round++; M.acc = 0; M.run = false; if (r.alt) M.att = 1 - M.att; beep(1300, .25); paint(); persist(); };
    const roundEnd = () => { M.total += r.sec * 1000; M.acc = 0; M.run = false; [0, 350, 700].forEach(d => setTimeout(() => beep(700, .5), d));
      if (M.round < (r.rounds || 1)) { M.phase = 'rest'; M.t0 = performance.now(); M.run = true; toast(`Fin de la manche ${M.round} · repos`); head(); persist(); }
      else { M.lastAcc = r.sec * 1000; finish(true); } };
    M.tick = () => {
      if (!M || !$('#lu-ck')) return; const t = now();
      if (M.phase === 'rest') { const left = r.rest * 1000 - t; $('#lu-ck').textContent = fmt(Math.max(0, left) + 999, false); if (left <= 0) endRest(); return; }
      if (timed) { const left = r.sec * 1000 - t; $('#lu-ck').textContent = fmt(Math.max(0, left) + 999, false);
        if (M.run) { const s = Math.ceil(left / 1000), k = M.round + ':' + s; if ((s === 10 || (s >= 1 && s <= 3)) && !M.bp[k]) { M.bp[k] = 1; beep(s === 10 ? 1000 : 900, .1); } }
        if (left <= 0 && M.run && !hold) roundEnd(); }
      else $('#lu-ck').textContent = fmt(t, false);
      if (M.run && ++M.tk % 25 === 0) persist();
    };
    $('#lu-go').onclick = () => { if (!M || M.phase === 'end') return; if (M.phase === 'rest') return endRest();
      if (M.run) { M.acc = now(); M.run = false; } else { if (timed && M.acc >= r.sec * 1000) return; M.t0 = performance.now(); M.run = true; beep(1300, .3); } head(); persist(); };
    $('#lu-stop').onclick = () => { if (M.run && M.phase === 'fight') { M.acc = now(); M.run = false; } beep(440, .7, .5); toast('✋ STOP ! On lâche tout.'); head(); persist(); };
    $('#lu-un').onclick = () => { const e = M.ev.pop(); if (!e) return; paint(); persist(); $('#lu-last').textContent = `Annulé : ${e.l} — ${nm(e.w)}`; };
    $('#lu-end').onclick = () => { if (obs && !M.ev.length) return toast('Aucune observation saisie'); if (confirm(obs ? 'Terminer et voir les observations ?' : 'Terminer le combat ?')) finish(); };
    $('#lu-quit').onclick = () => { if (!confirm(`Quitter sans enregistrer ?${o.enc && o.own ? '\nLe combat sera retiré des combats en cours.' : ''}`)) return; stop(); release(o); clearCur(); M = null; back(o); };
    M.finish = timeUp => {
      if (!M || M.phase === 'end') return;
      if (M.phase === 'fight' && !timeUp) { const t = timed ? Math.min(now(), r.sec * 1000) : now(); M.lastAcc = t; M.total += t; }
      if (M.phase === 'rest') M.lastAcc = 0;
      M.phase = 'end'; M.run = false; stop(); persist();
      const out = luOutcome(M.ev, R);
      const rec = { id: M.id, date: Date.now(), type: R.type, kind: o.kind || 'match', sid: o.sid || null, sn: o.sn || '', rid: o.rid || null, enc: o.enc || null, a: o.a, b: o.b, cls: o.cls || '', arb: o.arb || '',
        sa: out.sa, sb: out.sb, w: out.w, how: out.how, dur: Math.round(M.total / 1000), rounds: M.round, ev: luClone(M.ev), R: luClone(R) };
      if (o.obsOnly) Object.assign(rec, { obsOnly: true, obsW: M.obsW, w: null, how: 'obs' });
      summary(rec, false);
    };
    paint(); iv = setInterval(M.tick, 200); M.tick(); persist();
  }
  const finish = t => M && M.finish && M.finish(t);

  /* ===================== Résultats simples ===================== */
  function simple(o) {
    stop(); M = null; LU().current = { o }; save();
    let w = null, tb = false, xa = '', xb = '';
    const draw = () => {
      el.innerHTML = `${gold(true)}
        <div class="card" style="margin-top:12px;text-align:center"><div class="muted" style="font-weight:800;font-size:.85rem">${kindLbl(o)} · ${LU_T[o.R.type].n} · ✍️ résultats simples</div>
          <h3 style="margin:10px 0 0">Qui a gagné ?</h3>
          <div class="lu-win"><button class="a ${w === 'a' ? 'on' : ''}" data-sw="a">🏆 ${esc(o.a)}</button><button class="b ${w === 'b' ? 'on' : ''}" data-sw="b">🏆 ${esc(o.b)}</button></div>
          ${o.need ? '<p class="muted" style="font-size:.8rem;margin:0">Tournoi : il faut un vainqueur (en cas d\'égalité, décision de l\'arbitre).</p>' : `<button class="btn ${w === 'n' ? 'btn-grad' : 'btn-ghost'} btn-block" data-sw="n">🤝 Égalité</button>`}
          <label class="lu-ck" style="justify-content:center"><input type="checkbox" id="lu-stb" ${tb ? 'checked' : ''}><span>Victoire par <b>tombé</b></span></label></div>
        <div class="card" style="margin-top:12px"><h3>Score <span class="muted" style="font-size:.85rem">(facultatif)</span></h3>
          <div class="row"><div><label>Points ${esc(o.a)}</label><input id="lu-xa" type="number" inputmode="numeric" value="${esc(xa)}"></div><div><label>Points ${esc(o.b)}</label><input id="lu-xb" type="number" inputmode="numeric" value="${esc(xb)}"></div></div>
          <p class="muted" style="font-size:.78rem;margin:6px 0 0">Sans vainqueur choisi, il est déduit du score.</p></div>
        <button class="btn btn-grad btn-block" id="lu-ok" style="margin-top:14px;padding:17px;font-size:1.15rem">💾 Enregistrer le résultat</button>
        <button class="btn btn-ghost btn-block" id="lu-bk" style="margin-top:8px">← Annuler</button>`;
      const kx = () => { xa = $('#lu-xa').value; xb = $('#lu-xb').value; tb = $('#lu-stb').checked; };
      el.querySelectorAll('[data-sw]').forEach(b => b.onclick = () => { kx(); w = w === b.dataset.sw ? null : b.dataset.sw; beep(900, .05); draw(); });
      $('#lu-bk').onclick = () => { if (!confirm(`Annuler sans enregistrer ?${o.enc && o.own ? '\nLe combat sera retiré des combats en cours.' : ''}`)) return; release(o); clearCur(); back(o); };
      $('#lu-ok').onclick = () => { kx();
        const na = xa === '' ? null : Math.round(+xa || 0), nb = xb === '' ? null : Math.round(+xb || 0), hasSc = na != null && nb != null;
        let ww = w === 'n' ? null : w;
        if (!w && hasSc) ww = na > nb ? 'a' : nb > na ? 'b' : null;
        if (!w && !hasSc) return toast('Choisissez le vainqueur (ou saisissez le score)');
        if (o.need && !ww) return toast('Tournoi : désignez un vainqueur');
        if (hasSc && ww && w && ((ww === 'a' && na < nb) || (ww === 'b' && nb < na)) && !confirm('Le vainqueur choisi a moins de points. Enregistrer quand même ?')) return;
        const how = !ww ? 'nul' : tb ? 'tombe' : hasSc && na !== nb ? 'points' : hasSc ? 'decision' : 'simple';
        const rec = { id: luId(), date: Date.now(), type: o.R.type, kind: o.kind || 'match', sid: o.sid || null, sn: o.sn || '', rid: o.rid || null, enc: o.enc || null, a: o.a, b: o.b, cls: o.cls || '', arb: o.arb || '',
          sa: hasSc ? na : null, sb: hasSc ? nb : null, w: ww, how, simple: true, dur: 0, ev: [] };
        saveRec(rec, o); };
    };
    draw();
  }

  /* ===================== Bilan d'un combat ===================== */
  function summary(m, fromHist) {
    stop(); const o = !fromHist && M ? M.o : null, R = m.R || { att: [], def: [], pen: [], formes: [], r: {} }, need = o && o.need && !m.obsOnly;
    const A = m.a, B = m.b, cols = m.obsOnly ? [m.obsW] : [0, 1];
    const title = m.obsOnly ? `👁 Observation de ${esc(m.obsW ? B : A)}` : m.w ? `🏆 Victoire de ${esc(luWinName(m))}${luHow(m) ? ' · ' + luHow(m) : ''}` : '🤝 Égalité';
    // lignes du tableau : éléments du barème + ceux présents dans le déroulé
    const rows = [], seen = new Set(), put = (kind, k, l, p) => { const id = kind + '|' + (kind === 'forme' ? l : k); if (seen.has(id)) return; seen.add(id); rows.push({ kind, k, l, p }); };
    (R.att || []).forEach(x => put('att', x.k, x.l, x.p)); (R.def || []).forEach(x => put('def', x.k, x.l, x.p)); (R.pen || []).forEach(x => put('pen', x.k, x.l, x.p));
    (R.formes || []).forEach(f => put('forme', 'f', f, 0)); (m.ev || []).forEach(e => put(e.kind, e.k, e.l, e.p));
    const count = (w, x) => (m.ev || []).filter(e => e.w === w && e.kind === x.kind && (x.kind === 'forme' ? e.l === x.l : e.k === x.k)).length;
    const grp = { att: '🗡 Attaque', def: '🛡 Défense', pen: '⚠️ Pénalités', forme: '🤼 Formes de corps' };
    const tbl = !m.simple ? ['att', 'def', 'pen', 'forme'].map(g => { const rs = rows.filter(x => x.kind === g && (g === 'att' || cols.some(w => count(w, x)))); if (!rs.length) return '';
      return `<tr><th colspan="${cols.length + 2}" style="text-align:left;padding-top:10px">${grp[g]}</th></tr>${rs.map(x => `<tr><td>${esc(x.l)}</td><td class="muted">${g === 'forme' ? '' : luSgn(+x.p || 0)}</td>${cols.map(w => `<td><b>${count(w, x) || '–'}</b></td>`).join('')}</tr>`).join('')}`; }).join('') : '';
    el.innerHTML = `<div class="win">${title}</div>
      ${!m.obsOnly && !m.w && !fromHist ? `<div class="card" style="margin-top:12px;border:2px solid var(--gold);text-align:center"><b>Égalité : décision de l'arbitre ?</b>
        <div class="lu-win"><button class="a" data-dw="a">🏆 ${esc(A)}</button><button class="b" data-dw="b">🏆 ${esc(B)}</button></div>
        ${need ? '<p class="muted" style="font-size:.8rem;margin:0">Tournoi : un vainqueur est nécessaire pour passer au tour suivant.</p>' : '<p class="muted" style="font-size:.8rem;margin:0">Ou enregistrez directement le match nul.</p>'}</div>`
        : !m.obsOnly && m.how === 'decision' && !fromHist ? `<div style="text-align:center;margin-top:8px"><button class="link" data-dw="">↶ Revenir à l'égalité</button></div>` : ''}
      <div class="sb" style="margin-top:12px"><div class="tm a ${m.obsOnly && m.obsW === 1 ? 'lu-dim' : ''}"><span>${esc(A)}</span><b>${m.sa ?? '–'}</b></div><div class="ck"><b>–</b><div class="muted" style="font-size:.75rem">${m.dur ? fmt(m.dur * 1000, false) : ''}</div></div><div class="tm b ${m.obsOnly && m.obsW === 0 ? 'lu-dim' : ''}"><span>${esc(B)}</span><b>${m.sb ?? '–'}</b></div></div>
      <div class="muted" style="text-align:center;margin-top:8px;font-size:.85rem">${m.type === 'debout' ? '🧍 Lutte debout' : '🧎 Lutte au sol'}${m.sn ? ' · ' + esc(m.sn) : ''}${m.simple ? ' · ✍️ résultat saisi' : ''}${m.arb ? ' · arbitre : ' + esc(m.arb) : ''}${m.rounds > 1 ? ` · ${m.rounds} manches` : ''} · ${luDate(m.date)} ${luHm(m.date)}</div>
      ${tbl ? `<div class="section-title"><h2>Observations</h2></div><div class="card sheet-table" style="overflow:auto"><table class="lu-tbl"><tr><th>Action</th><th>Pts</th>${cols.map(w => `<th>${esc(w ? B : A)}</th>`).join('')}</tr>${tbl}
        <tr><th style="text-align:left;padding-top:10px">Total</th><th></th>${cols.map(w => `<th>${luScore(m.ev, w)}</th>`).join('')}</tr></table></div>` : ''}
      ${!m.simple && (m.ev || []).length ? `<div class="section-title"><h2>Déroulé</h2></div><div class="card" style="max-height:240px;overflow:auto;padding:4px 12px">${m.ev.map(e => `<div class="muted" style="padding:4px 0;border-bottom:1px solid var(--line)"><b style="color:var(--text)">${fmt(e.t * 1000, false)}</b>${m.rounds > 1 ? ` · M${e.r}` : ''} · ${esc(e.w ? B : A)} · ${esc(e.l)}${e.p ? ' (' + luSgn(e.p) + ')' : ''}</div>`).join('')}</div>` : ''}
      <div class="row" style="margin-top:14px">${fromHist ? '<button class="btn btn-ghost" id="lu-bk">← Retour</button>' : `<button class="btn btn-grad" id="lu-sv" style="flex:2;padding:15px">💾 Enregistrer ${m.obsOnly ? 'les observations' : 'le combat'}</button><button class="btn btn-ghost" id="lu-rs">↶ Reprendre</button>`}<button class="btn btn-ghost" id="lu-cx">📤 CSV</button></div>
      ${fromHist ? '' : '<button class="btn btn-ghost btn-block" style="margin-top:10px" id="lu-nw">Quitter sans enregistrer</button>'}`;
    el.querySelectorAll('[data-dw]').forEach(b => b.onclick = () => { const v = b.dataset.dw; if (v) { m.w = v; m.how = 'decision'; } else { m.w = null; m.how = 'nul'; } beep(1000, .06); summary(m, false); });
    $('#lu-cx').onclick = () => download(`lutte-${A}-${B}.csv`.replace(/[^\w.-]+/g, '-'), csv([['Temps', 'Manche', 'Lutteur', 'Catégorie', 'Action', 'Points'],
      ...(m.ev || []).map(e => [fmt(e.t * 1000, false), e.r || 1, e.w ? B : A, { att: 'Attaque', def: 'Défense', pen: 'Pénalité', forme: 'Forme de corps' }[e.kind] || e.kind, e.l, e.p || 0]),
      [], ['Score', A, m.sa ?? '', B, m.sb ?? ''], ['Vainqueur', luWinName(m) || (m.obsOnly ? 'observation' : 'égalité'), luHow(m)]]));
    if (fromHist) { $('#lu-bk').onclick = () => S.view ? sview(S.view) : home(); top(); return; }
    $('#lu-sv').onclick = () => { if (need && !m.w) return toast('Désignez le vainqueur (décision de l\'arbitre)'); saveRec(m, o); };
    $('#lu-rs').onclick = () => { const x = LU().current; if (!x || !o) return; x.phase = 'fight'; x.total = Math.max(0, (x.total || 0) - (M && M.lastAcc || 0)); x.acc = M && M.lastAcc || 0; fight(o, x); };
    $('#lu-nw').onclick = () => { if (!confirm(`Quitter sans enregistrer ?${o && o.enc && o.own ? '\nLe combat sera retiré des combats en cours.' : ''}`)) return; release(o); clearCur(); M = null; back(o); };
    top();
  }
  function saveRec(m, o) {
    const L = LU(), i = L.combats.findIndex(x => x.id === m.id);   // anti-doublon (double appui, reprise)
    if (i >= 0) L.combats[i] = m; else L.combats.push(m);
    luResults(m);
    if (o && o.enc && o.own && !m.obsOnly) { const s = findS(o.sid); if (s) s.enCours = luEnc(s).filter(e => e.id !== o.enc); }
    delete L.current; M = null; flush(); beep(1200, .15);
    toast(m.obsOnly ? 'Observations enregistrées ✔' : 'Combat enregistré ✔'); back(o || m);
  }

  /* ===================== Relais en équipe ===================== */
  function createRelais() {
    stop(); const c = luCfg(), T = c.type;
    const C = { nom: '', variant: 'reste', saisie: S.saisie, cls: S.cls || luCls(), teams: null, sel: null, ta: '', tb: '' };
    const def = () => `Relais ${C.cls ? C.cls + ' · ' : ''}${LU_T[T].n.toLowerCase()}`;
    C.nom = def();
    const keepC = () => { if ($('#r-nom')) C.nom = $('#r-nom').value; if ($('#r-ta')) { C.ta = $('#r-ta').value; C.tb = $('#r-tb').value; }
      el.querySelectorAll('[data-tn]').forEach(x => { C.teams[+x.dataset.tn].name = x.value.trim() || C.teams[+x.dataset.tn].name; }); };
    const draw = () => {
      el.innerHTML = `<button class="btn btn-ghost" id="r-bk">← Annuler</button>
        <div class="card" data-cfg style="margin-top:10px;border-top:6px solid #B8912A"><h3>🔁 Nouveau relais · ${LU_T[T].n}</h3>
          <label>Nom (visible sur toutes les tablettes)</label><input id="r-nom" value="${esc(C.nom)}" style="font-weight:800;font-size:1.05rem">
          <label>Règle du relais</label>${tiles(LU_VAR, C.variant, 'rv')}
          <label>Déroulement des combats</label>${tiles(LU_SAI, C.saisie, 'rs')}
          <p class="muted" style="font-size:.8rem;margin:8px 0 0">Score de l'équipe = somme des points de ses lutteurs (en résultats simples sans score : nombre de victoires). Règles : ${esc(luRulesLine(luSnap(T)))}.</p></div>
        <div class="card" data-cfg style="margin-top:12px"><h3>Équipes et ordre de passage</h3>
          ${DB.classes.length ? `<div id="r-cmp"></div>` : `<div class="row"><div><label>Équipe A · un nom par ligne, dans l'ordre</label><textarea id="r-ta" rows="6">${esc(C.ta)}</textarea></div><div><label>Équipe B</label><textarea id="r-tb" rows="6">${esc(C.tb)}</textarea></div></div>
            <button class="btn btn-ghost btn-block" id="r-mk" style="margin-top:8px">✔ Utiliser ces équipes</button>`}
          ${C.teams ? `<div class="lu-ord">${C.teams.map((t, ti) => `<div class="card" style="border-top:5px solid ${ti ? '#1E5BD8' : '#B8912A'}"><input data-tn="${ti}" value="${esc(t.name)}" style="font-weight:800" aria-label="Nom de l'équipe">
            ${t.order.map((n, i) => `<div class="lu-ol"><span class="st">${i + 1}.</span><span class="nm">${esc(n)}</span><button data-up="${ti}|${i}" aria-label="Monter">↑</button><button data-dn="${ti}|${i}" aria-label="Descendre">↓</button><button data-sw="${ti}|${i}" aria-label="Changer d'équipe">⇄</button><button data-rm="${ti}|${i}" aria-label="Retirer">✕</button></div>`).join('') || '<div class="muted">Aucun lutteur</div>'}</div>`).join('')}</div>
            <p class="muted" style="font-size:.78rem;margin:8px 0 0">↑ ↓ ordre de passage · ⇄ changer d'équipe · ✕ retirer (absent). ⚖️ Faites se rencontrer des gabarits proches.</p>` : ''}</div>
        <button class="btn btn-grad btn-block" data-cfg="bare" id="r-ok" style="margin-top:14px;padding:17px;font-size:1.15rem">✔ Créer le relais</button>`;
      $('#r-bk').onclick = home;
      el.querySelectorAll('[data-rv]').forEach(b => b.onclick = () => { keepC(); C.variant = b.dataset.rv; draw(); });
      el.querySelectorAll('[data-rs]').forEach(b => b.onclick = () => { keepC(); C.saisie = b.dataset.rs; draw(); });
      if ($('#r-cmp')) { mountComposer($('#r-cmp'), { id: 'lurel', modes: ['random', 'hetero'], button: '🧩 Former les 2 équipes', prep: false,
        onTeams: teams => { keepC(); const cl = el.querySelector('#lurel-cls'); const wasDef = C.nom === def(); C.cls = cl ? cl.value : C.cls; if (wasDef) C.nom = def();
          const T2 = [{ name: 'Équipe A', order: [] }, { name: 'Équipe B', order: [] }];
          if (teams.length === 1) teams[0].members.forEach((m, i) => T2[i % 2].order.push(m.n));
          else teams.forEach((t, i) => t.members.forEach(m => T2[i < 2 ? i : T2[0].order.length <= T2[1].order.length ? 0 : 1].order.push(m.n)));
          C.teams = T2; draw(); } });
        const v = el.querySelector('#lurel-v'); if (v) v.value = 2; const cl = el.querySelector('#lurel-cls'); if (cl && C.cls) cl.value = C.cls; }
      if ($('#r-mk')) $('#r-mk').onclick = () => { keepC(); const sp = t => [...new Set(t.split('\n').map(x => x.trim()).filter(Boolean))]; C.teams = [{ name: 'Équipe A', order: sp(C.ta) }, { name: 'Équipe B', order: sp(C.tb) }]; draw(); };
      const mv = (attr, fn) => el.querySelectorAll(`[data-${attr}]`).forEach(b => b.onclick = () => { keepC(); const [t, i] = b.dataset[attr].split('|').map(Number); fn(C.teams[t].order, i, t); draw(); });
      mv('up', (o, i) => { if (i > 0) [o[i - 1], o[i]] = [o[i], o[i - 1]]; });
      mv('dn', (o, i) => { if (i < o.length - 1) [o[i + 1], o[i]] = [o[i], o[i + 1]]; });
      mv('sw', (o, i, t) => { C.teams[1 - t].order.push(o.splice(i, 1)[0]); });
      mv('rm', (o, i) => { o.splice(i, 1); });
      $('#r-ok').onclick = () => { keepC(); if (!C.teams) return toast('Formez d\'abord les 2 équipes');
        if (C.teams.some(t => !t.order.length)) return toast('Chaque équipe doit avoir au moins un lutteur');
        if (C.teams[0].name === C.teams[1].name) C.teams[1].name += ' (2)';
        const s = { id: luId(), date: Date.now(), kind: 'relais', nom: C.nom.trim() || def(), classe: C.cls || '', type: T, saisie: C.saisie, variant: C.variant, teams: luClone(C.teams), regles: luSnap(T), enCours: [] };
        LU().seances.push(s); flush(); beep(1200, .15); toast('Relais créé ✔'); sview(s.id); };
    };
    draw(); top();
  }

  /* ===================== Tournoi à élimination ===================== */
  function createTournoi() {
    stop(); const c = luCfg(), T = c.type;
    const C = { cls: DB.classes.some(x => x.name === S.cls) ? S.cls : luCls(), off: new Set(), mx: true, saisie: S.saisie, txt: '', nom: '' };
    const def = () => `Tournoi ${C.cls ? C.cls + ' · ' : ''}${LU_T[T].n.toLowerCase()}`;
    C.nom = def();
    const all = () => C.cls ? [...new Set(studentsOf(C.cls))] : [];
    const players = () => C.cls ? all().filter(n => !C.off.has(n)) : [...new Set(C.txt.split('\n').map(x => x.trim()).filter(Boolean))];
    const keepC = () => { C.nom = $('#t-nom').value; C.mx = $('#t-mx').checked; if ($('#t-txt')) C.txt = $('#t-txt').value; };
    const draw = () => {
      const st = all(), n = players().length, size = 2 ** Math.ceil(Math.log2(Math.max(2, n)));
      el.innerHTML = `<button class="btn btn-ghost" id="t-bk">← Annuler</button>
        <div class="card" data-cfg style="margin-top:10px;border-top:6px solid #B8912A"><h3>🏅 Nouveau tournoi à élimination · ${LU_T[T].n}</h3>
          <label>Nom (visible sur toutes les tablettes)</label><input id="t-nom" value="${esc(C.nom)}" style="font-weight:800;font-size:1.05rem">
          <label>Déroulement des combats</label>${tiles(LU_SAI, C.saisie, 'ts')}
          <label class="lu-ck"><input type="checkbox" id="t-mx" ${C.mx ? 'checked' : ''}><span>Tirage au sort du tableau (sinon : l'ordre de la liste = têtes de série)</span></label>
          <p class="muted" style="font-size:.82rem;margin:8px 0 0">${n >= 2 ? `Tableau de ${size} · ${n - 1} combats${size > n ? ` · ${size - n} exempt${size - n > 1 ? 's' : ''} au 1er tour (qualifié${size - n > 1 ? 's' : ''} d'office)` : ''}` : 'Au moins 2 lutteurs'} · ${esc(luRulesLine(luSnap(T)))}.</p></div>
        <div class="card" data-cfg style="margin-top:12px"><h3>Lutteurs <span class="muted" style="font-size:.9rem;margin-left:6px">${n}${C.cls ? ' / ' + st.length : ''}</span></h3>
          ${DB.classes.length ? `<label>Classe</label><select id="t-cls">${DB.classes.map(x => `<option value="${esc(x.name)}" ${x.name === C.cls ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}<option value="" ${C.cls ? '' : 'selected'}>✏️ Saisir les noms…</option></select>` : ''}
          ${C.cls ? `<p class="muted" style="font-size:.82rem;margin:8px 0 0">Touchez un élève <b>absent</b> pour le décocher.</p>
            <div class="atp-ck">${st.map((x, i) => `<button class="pl-chip ${C.off.has(x) ? '' : 'sel'}" data-ab="${i}">${C.off.has(x) ? '' : '✓ '}${esc(x)}</button>`).join('')}</div>`
            : `<label>Un lutteur par ligne</label><textarea id="t-txt" rows="8">${esc(C.txt)}</textarea>`}</div>
        <button class="btn btn-grad btn-block" data-cfg="bare" id="t-ok" style="margin-top:14px;padding:17px;font-size:1.15rem">✔ Créer le tournoi</button>`;
      $('#t-bk').onclick = home;
      el.querySelectorAll('[data-ts]').forEach(b => b.onclick = () => { keepC(); C.saisie = b.dataset.ts; draw(); });
      $('#t-mx').onchange = () => keepC();
      if ($('#t-cls')) $('#t-cls').onchange = () => { keepC(); const wasDef = C.nom === def(); C.cls = $('#t-cls').value; C.off = new Set(); if (wasDef) C.nom = def(); draw(); };
      if ($('#t-txt')) $('#t-txt').oninput = () => { C.txt = $('#t-txt').value; };
      el.querySelectorAll('[data-ab]').forEach(b => b.onclick = () => { keepC(); const x = st[+b.dataset.ab]; C.off.has(x) ? C.off.delete(x) : C.off.add(x); draw(); });
      $('#t-ok').onclick = () => { keepC(); const ps = players(); if (ps.length < 2) return toast('Au moins 2 lutteurs');
        const order = C.mx ? shuffle(ps) : ps;
        const s = { id: luId(), date: Date.now(), kind: 'tournoi', nom: C.nom.trim() || def(), classe: C.cls || '', type: T, saisie: C.saisie, players: order, rencontres: luBracket(order), regles: luSnap(T), enCours: [], qualif: {} };
        LU().seances.push(s); flush(); beep(1200, .15); toast(`Tournoi créé ✔ ${order.length} lutteurs`); sview(s.id); };
    };
    draw(); top();
  }

  /* ===================== Séance partagée (relais / tournoi) ===================== */
  const myEnc = () => { const o = curO(); return o && o.own && o.enc ? o.enc : null; };
  function launch(sid, rid, a, b, lbl) {
    const s = findS(sid); if (!s) { toast('Séance introuvable'); return home(); }
    if (s.kind === 'tournoi') { const n = luElim(s).flat().find(x => x.id === rid);
      if (!n || n.a == null || n.b == null || !((n.a === a && n.b === b) || (n.a === b && n.b === a))) { toast('Le tableau a changé : ce combat n\'est plus à jouer'); return sview(sid); } }
    else { const st = luRel(s); if (!st.next || rid !== 'k' + st.k || st.next.a !== a || st.next.b !== b) { toast('Le relais a avancé : ce combat n\'est plus à jouer'); return sview(sid); } }
    const mine = myEnc(), other = luEnc(s).find(e => e.rid === rid && e.id !== mine);
    if (other) { toast(`${a} – ${b} est déjà en cours sur une autre tablette (depuis ${luHm(other.date)})`); return sview(sid); }
    const cur = curO();
    if (cur) { if (!confirm(`Abandonner le combat en cours sur cette tablette (${cur.a} – ${cur.b}) ?`)) return; release(cur); clearCur(); }
    const id = luId(); s.enCours = [...luEnc(s), { id, rid, a, b, date: Date.now() }]; flush();
    prematch({ a, b, cls: s.classe, sid: s.id, sn: s.nom, rid, lbl, enc: id, own: true, R: s.regles, saisie: s.saisie, kind: s.kind, need: s.kind === 'tournoi' });
  }
  const encLine = (s, e) => { const mine = myEnc() === e.id;
    return `<div class="atp-enc"><div class="vs"><span class="c">${esc(e.a)}</span> vs <span class="d">${esc(e.b)}</span></div>
      <div class="muted" style="font-size:.82rem">⏳ en cours depuis ${luHm(e.date)}${mine ? ' · sur cette tablette' : ' · sur une autre tablette'}</div>
      <div class="row">${mine ? `<button class="btn btn-grad" data-er="1" style="flex:2">▶ Reprendre</button>` : role() === 'obs' ? `<button class="btn btn-grad" data-ej="${esc(e.id)}" style="flex:2">👁 Observer ce combat</button>` : ''}<button class="btn btn-ghost" data-cfg="bare" data-ex="${esc(e.id)}">✕ Annuler</button></div></div>`; };
  const encCard = s => { const E = luEnc(s); if (!E.length) return '';
    return `<div class="section-title"><h2>⏳ Combats en cours · ${E.length}</h2></div><div class="card" style="border:2px solid #1E9E5A">${E.map(e => encLine(s, e)).join('')}
      <p class="muted" style="font-size:.78rem;margin:8px 0 0">Un combat en cours ne peut pas être lancé sur une autre tablette. « ✕ Annuler » si une tablette a été fermée en plein combat.</p></div>`; };
  const encWire = s => {
    el.querySelectorAll('[data-er]').forEach(b => b.onclick = () => resume());
    el.querySelectorAll('[data-ej]').forEach(b => b.onclick = () => { const s2 = findS(s.id), e = s2 && luEnc(s2).find(x => x.id === b.dataset.ej); if (!e) { toast('Ce combat est terminé ou annulé'); return sview(s.id); }
      if (curO() && !confirm('Abandonner le combat en cours sur cette tablette ?')) return; if (curO()) { release(curO()); clearCur(); }
      fight({ a: e.a, b: e.b, cls: s2.classe, sid: s2.id, sn: s2.nom, rid: e.rid, enc: e.id, own: false, R: s2.regles, saisie: 'obs', kind: s2.kind, obsOnly: true }); });
    el.querySelectorAll('[data-ex]').forEach(b => b.onclick = () => { const s2 = findS(s.id), e = s2 && luEnc(s2).find(x => x.id === b.dataset.ex); if (!e) return keepY(() => sview(s.id));
      if (!confirm(`Annuler le combat ${e.a} – ${e.b} en cours ?\nAucun résultat ne sera enregistré.`)) return;
      s2.enCours = luEnc(s2).filter(x => x.id !== e.id); if (myEnc() === e.id) clearCur(); flush(); toast('Combat annulé'); keepY(() => sview(s.id)); });
  };
  const headCard = (s, info) => `<span data-luroot="${esc(s.id)}" hidden></span><button class="btn btn-ghost" id="s-bk">← Lutte</button>
    ${gold(true).replace('lu-gold sm', 'lu-gold sm" style="margin-top:10px')}
    <div class="card" style="margin-top:10px;border-top:6px solid #B8912A"><h3>${s.kind === 'relais' ? '🔁' : '🏅'} ${esc(s.nom)}</h3>
      <div class="muted" style="font-size:.85rem">${LU_T[s.type].n}${s.kind === 'relais' ? ' · ' + LU_VAR[s.variant].n : ` · ${s.players.length} lutteurs`}${s.classe ? ' · ' + esc(s.classe) : ''} · ${s.saisie === 'simple' ? '✍️ résultats simples' : '👁 avec observation'} · ${luDate(s.date)}</div>
      <div class="muted" style="font-size:.78rem;margin-top:4px">⚙️ ${esc(luRulesLine(s.regles))}${info ? ' · ' + info : ''}</div></div>`;
  const profCard = (s, extra) => `<details class="card" data-cfg="bare" style="margin-top:14px"><summary data-prof style="font-weight:800;cursor:pointer">🔒 Enseignant</summary>
      ${extra || ''}<div class="row" style="margin-top:12px"><button class="btn btn-ghost" id="s-csv">📤 Exporter (CSV)</button><button class="btn btn-danger" id="s-del">🗑 Supprimer</button></div>
      <p class="muted" style="font-size:.78rem;margin:6px 0 0">Les combats enregistrés restent dans l'historique et dans les résultats des élèves.</p></details>`;
  const csvName = (p, s) => `${p}-${s.nom}.csv`.replace(/[^\w.-]+/g, '-');
  function sview(id) {
    stop(); M = null; const s = findS(id); if (!s) { toast('Séance introuvable'); return home(); }
    S.view = id; s.kind === 'relais' ? vRelais(s) : vTournoi(s);
    $('#s-bk').onclick = home;
    el.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => { const m = LU().combats.find(x => x.id === b.dataset.lv); if (m) summary(m, true); });
    $('#s-del').onclick = () => { if (!confirm(`Supprimer « ${s.nom} » sur toutes les tablettes ?\nLes combats enregistrés restent dans l'historique.`)) return;
      LU().seances = LU().seances.filter(x => x.id !== s.id); flush(); toast('Supprimé'); home(); };
    encWire(s);
  }
  function vRelais(s) {
    const st = luRel(s), [TA, TB] = s.teams, enc = luEnc(s), rid = 'k' + st.k, e = enc.find(x => x.rid === rid);
    const sc = st.pts[0] || st.pts[1] ? st.pts : st.v;
    const status = (ti, i) => { const n = s.teams[ti].order[i];
      if (s.variant === 'reste') { const p = ti ? st.ib : st.ia; return i < p ? ['out', 'sorti'] : i === p && !st.done ? ['on', '🟢 sur le tapis'] : ['', 'en attente']; }
      const f = st.log.filter(m => (ti ? m.b : m.a) === n).length; return st.next && (ti ? st.next.b : st.next.a) === n ? ['on', '🟢 au prochain combat'] : f ? ['out', `✔ ${f} combat${f > 1 ? 's' : ''}`] : ['', 'en attente']; };
    const wt = st.win == null ? '' : st.win < 0 ? '🤝 Égalité parfaite' : `🏆 ${esc(s.teams[st.win].name)} ${st.done ? 'remporte le relais' : 'mène'}`;
    el.innerHTML = `${headCard(s, `${st.k} combat${st.k > 1 ? 's' : ''}${s.variant === 'sortent' ? ' / ' + Math.max(TA.order.length, TB.order.length) : ''}`)}
      <div class="sb" style="margin-top:12px"><div class="tm a"><span>${esc(TA.name)}</span><b>${sc[0]}</b></div><div class="ck"><b>–</b><div class="muted" style="font-size:.72rem;font-weight:800">${st.pts[0] || st.pts[1] ? 'POINTS' : 'VICTOIRES'}<br>${st.v[0]} V · ${st.v[1]} V${st.nul ? ` · ${st.nul} N` : ''}</div></div><div class="tm b"><span>${esc(TB.name)}</span><b>${sc[1]}</b></div></div>
      ${st.done ? `<div class="tn-champ">${wt || 'Relais terminé'}</div>` : wt ? `<div class="muted" style="text-align:center;margin-top:8px;font-weight:800">${wt}</div>` : ''}
      ${encCard(s)}
      ${!st.done && st.next ? `<div class="section-title"><h2>Combat n° ${st.k + 1}</h2></div><div class="card">
        <div class="mo-vs" style="margin:4px 0 10px"><span style="background:#B8912A">${esc(st.next.a)}</span><span class="muted" style="color:var(--muted);padding:0">vs</span><span style="background:#1E5BD8">${esc(st.next.b)}</span></div>
        ${e ? `<div class="muted" style="text-align:center;font-weight:700">⏳ en cours${myEnc() === e.id ? ' sur cette tablette' : ' sur une autre tablette'}</div>`
          : role() === 'obs' ? '<div class="muted" style="text-align:center">👁 Tablette observateur : attendez que l\'arbitre lance le combat, puis « Observer ce combat ».</div>'
          : `<button class="btn btn-grad btn-block tn-go" id="s-go">${s.saisie === 'simple' ? '✍️' : '▶'} Lancer le combat</button>`}</div>` : ''}
      <div class="section-title"><h2>Ordre de passage</h2></div>
      <div class="lu-ord" style="margin-top:0">${s.teams.map((t, ti) => `<div class="card" style="border-top:5px solid ${ti ? '#1E5BD8' : '#B8912A'}"><b>${esc(t.name)}</b>
        ${t.order.map((n, i) => { const [c, l] = status(ti, i); return `<div class="lu-ol ${c}"><span class="st">${i + 1}.</span><span class="nm">${esc(n)}</span><span class="st">${l}</span></div>`; }).join('')}</div>`).join('')}</div>
      <div class="section-title"><h2>Combats joués (${st.k})</h2></div>
      <div class="card" style="padding:0">${st.log.length ? st.log.map((m, i) => `<div class="list-item"><div style="flex:1;min-width:0"><b>${i + 1}. ${esc(m.a)} ${luScTxt(m) || 'vs'} ${esc(m.b)}</b><div class="muted" style="font-size:.8rem">${luWinName(m) ? '🏆 ' + esc(luWinName(m)) + (luHow(m) ? ' · ' + luHow(m) : '') : '🤝 Égalité'}${m.simple ? ' · ✍️' : ''}</div></div><button class="btn btn-ghost" data-lv="${esc(m.id)}">👁</button></div>`).join('') : '<div class="empty">Aucun combat pour l\'instant.</div>'}</div>
      ${profCard(s, `<div class="row" style="margin-top:10px">${st.log.length ? '<button class="btn btn-ghost" id="s-undo">↶ Annuler le dernier combat</button>' : ''}<button class="btn btn-ghost" id="s-end">${s.ended ? '↺ Rouvrir le relais' : '🏁 Terminer le relais maintenant'}</button></div>`)}`;
    if ($('#s-go')) $('#s-go').onclick = () => launch(s.id, rid, st.next.a, st.next.b, `combat n° ${st.k + 1}`);
    if ($('#s-undo')) $('#s-undo').onclick = () => { const m = st.log[st.log.length - 1]; if (!m || !confirm(`Annuler le dernier combat (${m.a} – ${m.b}) ?\nIl sera supprimé, ainsi que les résultats des élèves associés.`)) return; luDelCombat(m.id); keepY(() => sview(s.id)); };
    $('#s-end').onclick = () => { s.ended = !s.ended; flush(); keepY(() => sview(s.id)); };
    $('#s-csv').onclick = () => download(csvName('relais', s), csv([['Équipe', 'Points', 'Victoires', 'Lutteurs (ordre)'], ...s.teams.map((t, i) => [t.name, st.pts[i], st.v[i], t.order.join(', ')]),
      [], ['N°', 'Lutteur A', 'Score A', 'Score B', 'Lutteur B', 'Vainqueur', 'Issue'], ...st.log.map((m, i) => [i + 1, m.a, m.sa ?? '', m.sb ?? '', m.b, luWinName(m) || 'égalité', luHow(m)])]));
  }
  function vTournoi(s) {
    const E = luElim(s), R = E.length, fin = E[R - 1][0], champ = fin && fin.w, all = E.flat(), enc = luEnc(s), RE = Object.fromEntries(enc.map(e => [e.rid, e]));
    const side = (n, k) => { const nm = n[k], c = nm == null ? 'e' : n.bye ? 'w' : n.w != null ? (n.w === nm ? 'w' : 'l') : ''; const m = n.m, sc = m && !n.bye ? (m.a === nm ? m.sa : m.sb) : '';
      return `<div class="${c}"><span>${nm != null ? esc(nm) : n.bye ? 'exempt' : '…'}</span><b>${sc ?? ''}</b></div>`; };
    const line = n => {
      if (n.bye) return `<div class="tn-r"><span class="ta">${esc(n.w)}</span><span class="muted">exempt</span><span class="tb" style="color:var(--muted)">✔ qualifié d'office</span></div>`;
      if (n.a == null || n.b == null) return `<div class="tn-r"><span class="ta">${n.a != null ? esc(n.a) : '…'}</span><span class="muted">vs</span><span class="tb">${n.b != null ? esc(n.b) : '…'}</span></div><div class="muted" style="text-align:center;font-size:.8rem;margin-bottom:6px">En attente des vainqueurs du tour précédent</div>`;
      const e = RE[n.id], m = n.m;
      return `<div class="tn-r"><span class="ta" style="${n.w && n.w !== n.a ? 'opacity:.5' : ''}">${esc(n.a)}</span>${m ? `<button class="tn-sc" data-lv="${esc(m.id)}">${m.sa == null ? (n.w === n.a ? 'V – D' : 'D – V') : `${m.a === n.a ? m.sa : m.sb} – ${m.a === n.a ? m.sb : m.sa}`}</button>` : '<span class="muted">vs</span>'}<span class="tb" style="${n.w && n.w !== n.b ? 'opacity:.5' : ''}">${esc(n.b)}</span></div>
        ${n.w ? `<div style="text-align:center;font-weight:800;margin-bottom:4px">${n.round === R ? '🏆 ' + esc(n.w) + ' remporte le tournoi' : '✔ ' + esc(n.w) + ' se qualifie'}${m && luHow(m) ? ` <span class="muted" style="font-weight:600">(${luHow(m)})</span>` : ''}</div>` : ''}
        ${e ? `<div class="muted" style="text-align:center;font-weight:700;margin-bottom:6px">⏳ en cours depuis ${luHm(e.date)}${myEnc() === e.id ? ' · cette tablette' : ''}</div>`
          : m ? `<div style="text-align:center;margin-bottom:6px" data-cfg="bare"><button class="link" data-lg="${esc(n.id)}" style="font-size:.8rem">↻ Rejouer (le dernier combat compte, la suite du tableau est recalculée)</button></div>`
          : role() === 'obs' ? '<div class="muted" style="text-align:center;font-size:.8rem;margin-bottom:6px">👁 En attente du lancement par l\'arbitre</div>'
          : `<button class="btn btn-grad btn-block tn-go" data-lg="${esc(n.id)}">${s.saisie === 'simple' ? '✍️' : '▶'} Lancer ce combat</button>`}`;
    };
    const rk = luRankT(s, E), dec = all.filter(n => !n.bye && n.w != null).length;
    el.innerHTML = `${headCard(s, `${dec}/${Math.max(0, s.players.length - 1)} combats décidés${enc.length ? ` · ⏳ ${enc.length} en cours` : ''}`)}
      ${champ ? `<div class="tn-champ">🏆 Champion : ${esc(champ)}</div>` : ''}
      ${encCard(s)}
      <div class="section-title"><h2>Tableau</h2></div>
      <div class="card"><div class="tn-br">${E.map((rd, k) => `<div class="rd"><h4>${luRName(s, k + 1)}</h4>${rd.map(n => `<div class="mt">${side(n, 'a')}${side(n, 'b')}</div>`).join('')}</div>`).join('')}</div></div>
      ${E.map((rd, k) => `<div class="card" style="margin-top:10px;padding:10px 14px"><h3 style="margin:0">${luRName(s, k + 1)}</h3>${rd.map(n => `<div style="border-top:1px solid var(--line);margin-top:6px">${line(n)}</div>`).join('')}</div>`).join('')}
      ${champ ? `<div class="section-title"><h2>Classement final</h2></div><div class="card sheet-table"><table><tr><th>Rang</th><th>Lutteur</th><th>Éliminé en</th></tr>${rk.map(x => `<tr><td><b>${x.rank || '–'}</b></td><td>${esc(x.n)}</td><td class="muted">${x.rank === 1 ? '🏆 Champion' : x.out ? luRName(s, x.out) : '—'}</td></tr>`).join('')}</table></div>` : ''}
      ${profCard(s)}`;
    el.querySelectorAll('[data-lg]').forEach(b => b.onclick = () => { const n = luElim(findS(s.id) || s).flat().find(x => x.id === b.dataset.lg); if (!n || n.a == null || n.b == null) return toast('Combat introuvable');
      if (n.m && !confirm(`Rejouer ${n.a} – ${n.b} ?\nLe nouveau résultat remplacera l'ancien.`)) return;
      launch(s.id, n.id, n.a, n.b, luRName(s, n.round)); });
    $('#s-csv').onclick = () => download(csvName('tournoi-lutte', s), csv([['Rang', 'Lutteur', 'Éliminé en'], ...rk.map(x => [x.rank || '', x.n, x.rank === 1 ? 'Champion' : x.out ? luRName(s, x.out) : '']),
      [], ['Tour', 'Lutteur A', 'Score A', 'Score B', 'Lutteur B', 'Qualifié', 'Issue'],
      ...all.map(n => { const m = n.m; return [luRName(s, n.round), n.a ?? (n.bye ? 'exempt' : ''), m && m.sa != null ? (m.a === n.a ? m.sa : m.sb) : '', m && m.sa != null ? (m.a === n.a ? m.sb : m.sa) : '', n.b ?? (n.bye ? 'exempt' : ''), n.w ?? '', n.bye ? 'exempt' : m ? luHow(m) : '']; }),
      [], ['Champion', champ || '—']]));
  }

  /* ===================== Bilan des élèves ===================== */
  function bilan() {
    stop(); M = null;
    const CL = [...new Set([...DB.classes.map(c => c.name), ...LU().combats.map(m => m.cls).filter(Boolean)])];
    let cls = CL.includes(S.cls) ? S.cls : CL[0] || '';
    const draw = () => {
      const names = cls ? [...new Set([...studentsOf(cls), ...LU().combats.filter(m => m.cls === cls).flatMap(m => [m.a, m.b])])] : [...new Set(LU().combats.flatMap(m => [m.a, m.b]))];
      const rows = luAgg(names), act = rows.filter(x => x.c || x.arb || Object.keys(x.fo).length || Object.keys(x.de).length);
      el.innerHTML = `<button class="btn btn-ghost" id="b-bk">← Lutte</button>
        <div class="card" style="margin-top:10px"><h3>📊 Bilan des élèves · lutte</h3>${CL.length ? `<label>Classe</label><select id="b-cls">${CL.map(c => `<option ${c === cls ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>` : ''}
          <p class="muted" style="font-size:.8rem;margin:8px 0 0">Tous les combats enregistrés (match, relais, tournoi). V/N/D : victoires, nuls, défaites · Pts + / − : points marqués / encaissés · Arb. : combats arbitrés. Chaque combat est aussi dans « Résultats des élèves ».</p></div>
        <div class="card sheet-table" style="margin-top:12px;overflow:auto">${act.length ? `<table class="lu-tbl"><tr><th>Élève</th><th>Comb.</th><th>V</th><th>N</th><th>D</th><th>Pts +</th><th>Pts −</th><th>Tombés</th><th>Mises en danger</th><th>Pénal.</th><th>Arb.</th><th>Formes de corps</th><th>Défense</th></tr>
          ${act.sort((a, b) => b.v - a.v || (b.pm - b.pe) - (a.pm - a.pe) || a.n.localeCompare(b.n, 'fr')).map(x => `<tr><td><b>${esc(x.n)}</b></td><td>${x.c}</td><td><b>${x.v}</b></td><td>${x.nul}</td><td>${x.d}</td><td>${x.pm}</td><td>${x.pe}</td><td>${x.tb}</td><td>${x.md}</td><td>${x.pen}</td><td>${x.arb}</td><td class="w">${esc(luTop(x.fo)) || '–'}</td><td class="w">${esc(luTop(x.de)) || '–'}</td></tr>`).join('')}</table>`
          : '<div class="empty">Aucun combat enregistré pour cette classe.</div>'}</div>
        ${act.length ? '<button class="btn btn-ghost btn-block" id="b-csv" style="margin-top:12px">📤 Exporter le bilan (CSV)</button>' : ''}`;
      $('#b-bk').onclick = home;
      if ($('#b-cls')) $('#b-cls').onchange = () => { cls = $('#b-cls').value; if (DB.classes.some(c => c.name === cls)) { DB.lastClass = cls; S.cls = cls; save(); } draw(); };
      if ($('#b-csv')) $('#b-csv').onclick = () => download(`bilan-lutte-${cls || 'tous'}.csv`.replace(/[^\w.-]+/g, '-'), csv([['Élève', 'Combats', 'Victoires', 'Nuls', 'Défaites', 'Points marqués', 'Points encaissés', 'Tombés', 'Mises en danger', 'Pénalités', 'Détail pénalités', 'Arbitrages', 'Formes de corps', 'Défense'],
        ...act.map(x => [x.n, x.c, x.v, x.nul, x.d, x.pm, x.pe, x.tb, x.md, x.pen, luTop(x.pl), x.arb, luTop(x.fo), luTop(x.de)])]));
    };
    draw(); top();
  }
  function csvAll() {
    const cnt = (m, i, kind) => luTop(Object.fromEntries(Object.entries((m.ev || []).filter(e => e.w === i && e.kind === kind).reduce((o, e) => (o[e.l] = (o[e.l] || 0) + 1, o), {}))));
    download(`lutte-combats-${new Date().toISOString().slice(0, 10)}.csv`, csv([['Date', 'Type', 'Forme', 'Séance', 'Classe', 'Lutteur A', 'Score A', 'Score B', 'Lutteur B', 'Vainqueur', 'Issue', 'Durée', 'Arbitre', 'Saisie', 'Attaque A', 'Attaque B', 'Pénalités A', 'Pénalités B', 'Défense A', 'Défense B', 'Formes A', 'Formes B'],
      ...LU().combats.slice().sort((x, y) => (x.date || 0) - (y.date || 0)).map(m => [new Date(m.date).toLocaleString('fr-FR'), m.type === 'debout' ? 'Debout' : 'Sol', LU_FP[m.kind] ? LU_FP[m.kind].n : m.kind, m.sn || '', m.cls || '', m.a, m.sa ?? '', m.sb ?? '', m.b,
        m.obsOnly ? 'observation de ' + (m.obsW ? m.b : m.a) : luWinName(m) || 'égalité', luHow(m), m.dur ? fmt(m.dur * 1000, false) : '', m.arb || '', m.simple ? 'simple' : m.obsOnly ? 'observateur' : 'observation',
        cnt(m, 0, 'att'), cnt(m, 1, 'att'), cnt(m, 0, 'pen'), cnt(m, 1, 'pen'), cnt(m, 0, 'def'), cnt(m, 1, 'def'), cnt(m, 0, 'forme'), cnt(m, 1, 'forme')])]));
  }

  home();
  // Relais / tournoi affiché : mis à jour quand une autre tablette enregistre un combat
  const onRemote = () => { const r = el.isConnected && el.querySelector('[data-luroot]'); if (!r || document.getElementById('pin-ov')) return; keepY(() => sview(r.dataset.luroot)); };
  window.addEventListener('eps-remote', onRemote);
  return () => { stop(); window.removeEventListener('eps-remote', onRemote); };
};
