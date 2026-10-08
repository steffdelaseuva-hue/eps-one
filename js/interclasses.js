/* =========================================================
   EPS ONE — Outil « Interclasses » (sports collectifs)
   · 2 classes ou plus, équipes par classe ou mélangées (tirage + retouches)
   · Poules + phases finales (des 16es à la finale) ou championnat simple
   · Plusieurs terrains en même temps (une poule par terrain ou placement libre)
   · Paramètres : durée / points, aller ou aller-retour, points V/N/D/forfait,
     bonus offensif / défensif, équipes au repos à l'arbitrage
   · Calendrier, rotations chronométrées, classements et tableau final automatiques
   Données : DB.interclasses = [{ id, nom, date, sport, cls[], teams[], absents[], cfg, matches[] }]
   (synchronisées entre tablettes : chaque match est un objet à id)
   ========================================================= */
ICONS.interclasses = '<path d="M7 4h10v3a5 5 0 0 1-10 0z"/><path d="M7 5H4.5a2.5 2.5 0 0 0 2.6 3.6M17 5h2.5a2.5 2.5 0 0 1-2.6 3.6"/><path d="M12 12v4M8.5 20h7M9.5 16h5v4h-5z"/><circle cx="4" cy="17" r="2" fill="url(#icoGrad)" stroke="none"/><circle cx="20" cy="17" r="2" fill="url(#icoGrad)" stroke="none"/>';
(() => {
  const IC_SP = { handball: ['Handball', '🤾', 'temps', 8], basket: ['Basket-ball', '🏀', 'temps', 8], football: ['Football', '⚽', 'temps', 8], rugby: ['Rugby', '🏉', 'temps', 8], ultimate: ['Ultimate', '🥏', 'temps', 8], volley: ['Volley-ball', '🏐', 'points', 15] };
  const COLS = [['Rouges', '#D64545'], ['Bleus', '#1E5BD8'], ['Verts', '#1E9E5A'], ['Jaunes', '#D9A400'], ['Oranges', '#E8792B'], ['Violets', '#8E44AD'], ['Noirs', '#2B2B2B'], ['Blancs', '#9AA5B1'], ['Roses', '#D9468F'], ['Turquoises', '#0E9AA7'], ['Marron', '#8B5A2B'], ['Gris', '#6B7280'], ['Bordeaux', '#7B1E3A'], ['Ciel', '#4FA3E0'], ['Kaki', '#6B7B3A'], ['Corail', '#F07167']];
  const ROUND = { 32: '16es de finale', 16: '8es de finale', 8: 'Quarts de finale', 4: 'Demi-finales', 2: 'Finale' };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const IC = () => (Array.isArray(DB.interclasses) ? DB.interclasses : (DB.interclasses = []));
  const allClasses = () => [...((window.dbGet ? dbGet('classes') : DB.classes) || []), ...(DB.classesAll || [])];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const DEF_BTN = { handball: [1], basket: [1, 2, 3], football: [1], rugby: [5, 2, 3], ultimate: [1], volley: [1] }, DEF_BONUS = [1, 2, 3, 5, 10, 100, 1000];
  const btnsOf = T => (Array.isArray(T.cfg.btn) && T.cfg.btn.length ? T.cfg.btn : DEF_BTN[T.sport] || [1]);
  const bonusOf = T => T.cfg.bon === false ? [] : (Array.isArray(T.cfg.bonv) && T.cfg.bonv.length ? T.cfg.bonv : DEF_BONUS);
  const parseNums = v => [...new Set(String(v || '').split(/[^\d]+/).map(Number).filter(n => n > 0 && n <= 100000))];
  const nFor = (count, sz, min) => Math.max(min, Math.round(count / Math.max(1, sz | 0)) || min);   // équipes pour une taille visée
  const defCfg = sp => ({ by: 'nb', sz: 6, btn: DEF_BTN[sp].slice(), bon: true, bonv: DEF_BONUS.slice(), fmt: 'poules', np: 2, fin: 'auto', petite: true, ter: 2, place: 'poule', mode: IC_SP[sp][2], dur: IC_SP[sp][3], target: IC_SP[sp][2] === 'points' ? IC_SP[sp][3] : 0, ar: false, pw: 3, pd: 2, pl: 1, pf: 0, bo: 0, bd: 0, arb: true, tm: 'classe', npc: 2, nt: 4 });

  if (!document.getElementById('ic-css')) document.head.insertAdjacentHTML('beforeend', `<style id="ic-css">
.ic-tabs{display:flex;gap:6px;overflow-x:auto;margin:12px 0;scrollbar-width:none}.ic-tabs button{flex:1 0 auto;padding:10px 12px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.85rem;white-space:nowrap;color:var(--text)}.ic-tabs button.on{background:var(--grad);color:#fff;border-color:transparent}
.ic-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.ic-chips button{padding:9px 13px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.88rem;color:var(--text)}
.ic-chips button.on{background:var(--grad);color:#fff;border-color:transparent}
.ic-teams{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;margin-top:10px}
.ic-team{border:2px solid var(--line);border-left:8px solid var(--tc);border-radius:14px;padding:10px;background:var(--card)}
.ic-team.tg{box-shadow:0 0 0 3px rgba(30,91,216,.3);border-color:#1E5BD8}
.ic-team h4{margin:0;display:flex;align-items:center;gap:6px}.ic-team h4 input{font-weight:800;padding:6px 8px}
.ic-st{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.ic-p{padding:5px 9px;border-radius:99px;border:1.5px solid var(--line);background:var(--card);font-weight:700;font-size:.8rem;color:var(--text)}
.ic-p.on{background:#1E5BD8;color:#fff;border-color:transparent}
.ic-dot{display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--tc);flex:0 0 auto}
.ic-rot{margin-top:12px}.ic-rot h3{display:flex;align-items:center;gap:8px;margin:0 0 6px}
.ic-ms{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px}
.ic-m{border:1.5px solid var(--line);border-radius:14px;padding:10px;background:var(--card);cursor:pointer;text-align:left;color:var(--text);width:100%}
.ic-m.done{background:var(--grad-soft)}.ic-m .ter{font-size:.72rem;font-weight:900;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.ic-m .vs{display:flex;align-items:center;gap:6px;margin-top:4px;font-weight:800}.ic-m .vs span.n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ic-m .sc{font-size:1.15rem;font-weight:900;font-variant-numeric:tabular-nums}
.ic-m .ref{font-size:.75rem;color:var(--muted);margin-top:4px}
.ic-tbl td,.ic-tbl th{padding:6px 5px;text-align:center}.ic-tbl td:nth-child(2),.ic-tbl th:nth-child(2){text-align:left}
.ic-br{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}.ic-br .col{min-width:210px;display:flex;flex-direction:column;justify-content:space-around;gap:10px}
.ic-br .col h4{margin:0;text-align:center;font-size:.85rem}
.ic-tm{font-size:2.6rem;font-weight:900;font-variant-numeric:tabular-nums;text-align:center}
.ic-pad{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:8px}.ic-pad button{width:56px;height:56px;border-radius:16px;font-size:1.5rem;font-weight:900}
.ic-pad b{font-size:2.4rem;min-width:64px;text-align:center;font-variant-numeric:tabular-nums}
</style>`);

  /* ---------- Équipes ---------- */
  function buildTeams(T) {
    const c = T.cfg, abs = new Set(T.absents || []), teams = [];
    const studs = cl => studentsOf(cl).filter(n => !abs.has(cl + '|' + n));
    if (c.tm === 'classe') T.cls.forEach((cl, i) => teams.push({ id: uid(), name: cl, col: COLS[i % COLS.length][1], members: studs(cl).map(n => ({ n, c: cl })) }));
    else if (c.tm === 'parclasse') { let k = 0; T.cls.forEach(cl => { const S = shuffle(studs(cl)), n = c.by === 'sz' ? nFor(S.length, c.sz, 1) : Math.max(1, c.npc | 0);
      for (let j = 0; j < n; j++) teams.push({ id: uid(), name: `${cl} · ${j + 1}`, col: COLS[k++ % COLS.length][1], members: S.filter((_, x) => x % n === j).map(s => ({ n: s, c: cl })) }); }); }
    else { const n = c.by === 'sz' ? nFor(T.cls.reduce((a, cl) => a + studs(cl).length, 0), c.sz, 2) : Math.max(2, c.nt | 0); for (let j = 0; j < n; j++) teams.push({ id: uid(), name: n <= COLS.length ? COLS[j][0] : 'Équipe ' + (j + 1), col: COLS[j % COLS.length][1], members: [] });
      let k = 0; T.cls.forEach(cl => shuffle(studs(cl)).forEach(s => { teams.sort((a, b) => a.members.length - b.members.length || 0); teams[0].members.push({ n: s, c: cl }); k++; }));
      teams.sort((a, b) => COLS.findIndex(x => x[1] === a.col) - COLS.findIndex(x => x[1] === b.col)); }
    T.teams = teams;
  }

  /* ---------- Calendrier ---------- */
  const rr = ids => { const L = ids.slice(); if (L.length % 2) L.push(null); const n = L.length, R = [];
    for (let r = 0; r < n - 1; r++) { const P = []; for (let i = 0; i < n / 2; i++) { const a = L[i], b = L[n - 1 - i]; if (a && b) P.push(r % 2 ? [b, a] : [a, b]); } R.push(P); L.splice(1, 0, L.pop()); }
    return R; };
  const poulesOf = T => { const c = T.cfg, ids = T.teams.map(t => t.id); if (c.fmt !== 'poules') return [ids];
    const np = Math.max(1, Math.min(c.np | 0, Math.floor(ids.length / 2) || 1)), P = Array.from({ length: np }, () => []);
    ids.forEach((id, i) => { const r = Math.floor(i / np), k = r % 2 ? np - 1 - (i % np) : i % np; P[k].push(id); }); return P; };   // répartition en serpentin
  function generate(T) {
    const c = T.cfg, P = poulesOf(T); T.poules = P; const M = [];
    P.forEach((ids, g) => { let R = rr(ids); if (c.ar) R = R.concat(R.map(r => r.map(([a, b]) => [b, a])));
      R.forEach((pairs, r) => pairs.forEach(([a, b]) => M.push({ id: uid(), ph: 'p', g, r, a, b }))); });
    schedule(T, M, 1); T.matches = M; T.gen = Date.now();
  }
  // Affectation rotations / terrains / arbitres
  function schedule(T, M, rot0) {
    const c = T.cfg, N = Math.max(1, c.ter | 0), refN = {}; T.teams.forEach(t => { refN[t.id] = 0; });
    (T.matches || []).forEach(m => { if (m.ref) refN[m.ref] = (refN[m.ref] || 0) + 1; });
    const slots = [];
    if (c.place === 'poule' && M.every(m => m.ph === 'p') && (T.poules || []).length > 1) {
      // une poule par terrain : chaque poule avance sur « son » terrain ; s'il y a plus de poules que de terrains, elles se suivent
      const byG = {}; M.forEach(m => (byG[m.g] = byG[m.g] || []).push(m));
      const G = Object.keys(byG).map(Number), lane = {}; G.forEach((g, i) => { lane[g] = { ter: i % N, start: 0 }; });
      for (let t = 0; t < N; t++) { let at = 0; G.filter(g => lane[g].ter === t).forEach(g => { lane[g].start = at; at += order(byG[g]).length; }); }
      G.forEach(g => order(byG[g]).forEach((m, i) => { m.rot = rot0 + lane[g].start + i; m.ter = lane[g].ter + 1; }));
    } else {
      // placement libre : on remplit les terrains rotation par rotation (une équipe ne joue qu'un match à la fois)
      const todo = M.slice().sort((a, b) => (a.r || 0) - (b.r || 0)), last = {}; let rot = rot0;
      while (todo.length) { const busy = new Set(), now = [];
        const cand = todo.filter(m => m.a !== undefined).sort((x, y) => Math.min(last[x.a] ?? -9, last[x.b] ?? -9) - Math.min(last[y.a] ?? -9, last[y.b] ?? -9) || (x.r || 0) - (y.r || 0));
        for (const m of cand) { if (now.length >= N) break; if (m.a && busy.has(m.a) || m.b && busy.has(m.b)) continue; now.push(m); if (m.a) busy.add(m.a); if (m.b) busy.add(m.b); }
        if (!now.length) now.push(todo[0]);
        now.forEach((m, i) => { m.rot = rot; m.ter = i + 1; last[m.a] = last[m.b] = rot; todo.splice(todo.indexOf(m), 1); }); rot++; }
    }
    // arbitres : une équipe qui ne joue pas pendant cette rotation (de la même poule si possible), la moins sollicitée
    if (c.arb) { const byRot = {}; [...(T.matches || []).filter(m => !M.includes(m)), ...M].forEach(m => (byRot[m.rot] = byRot[m.rot] || []).push(m));
      M.slice().sort((a, b) => a.rot - b.rot || a.ter - b.ter).forEach(m => { const same = byRot[m.rot], busy = new Set(same.flatMap(x => [x.a, x.b, x.ref]).filter(Boolean));
        const free = T.teams.map(t => t.id).filter(id => !busy.has(id)); if (!free.length) { m.ref = null; return; }
        const pg = m.ph === 'p' && T.poules ? new Set(T.poules[m.g] || []) : null;
        free.sort((x, y) => (pg ? (pg.has(y) ? 1 : 0) - (pg.has(x) ? 1 : 0) : 0) || refN[x] - refN[y]); m.ref = free[0]; refN[free[0]]++; }); }
    function order(L) { return L.slice().sort((a, b) => (a.r || 0) - (b.r || 0)); }
  }

  /* ---------- Classements ---------- */
  const tName = (T, id) => (T.teams.find(t => t.id === id) || {}).name || '—';
  const tCol = (T, id) => (T.teams.find(t => t.id === id) || {}).col || '#999';
  function table(T, ids, ph = 'p') {
    const c = T.cfg, S = {}; ids.forEach(id => { S[id] = { id, j: 0, g: 0, n: 0, p: 0, bp: 0, bc: 0, bo: 0, pts: 0 }; });
    (T.matches || []).filter(m => m.ph === ph && m.done && S[m.a] && S[m.b]).forEach(m => {
      const A = S[m.a], B = S[m.b], sa = +m.sa || 0, sb = +m.sb || 0; A.j++; B.j++; A.bp += sa; A.bc += sb; B.bp += sb; B.bc += sa;
      const win = (W, L, d) => { W.g++; L.p++; W.pts += c.pw; L.pts += m.ff === (W === A ? 'b' : 'a') ? c.pf : c.pl;
        if (c.bo > 0 && d >= c.bo) { W.bo++; W.pts++; } if (c.bd > 0 && d <= c.bd && !m.ff) { L.bo++; L.pts++; } };
      if (m.ff === 'a') win(B, A, Math.abs(sb - sa)); else if (m.ff === 'b') win(A, B, Math.abs(sa - sb));
      else if (sa > sb) win(A, B, sa - sb); else if (sb > sa) win(B, A, sb - sa); else { A.n++; B.n++; A.pts += c.pd; B.pts += c.pd; } });
    return Object.values(S).sort((x, y) => y.pts - x.pts || (y.bp - y.bc) - (x.bp - x.bc) || y.bp - x.bp || tName(T, x.id).localeCompare(tName(T, y.id), 'fr'));
  }
  const tableHTML = (T, rows, q) => `<div class="sheet-table"><table class="ic-tbl"><tr><th>#</th><th>Équipe</th><th>J</th><th>G</th><th>N</th><th>P</th><th>${T.sport === 'volley' ? 'Pts +' : 'BP'}</th><th>${T.sport === 'volley' ? 'Pts −' : 'BC'}</th><th>Diff</th>${T.cfg.bo || T.cfg.bd ? '<th>Bonus</th>' : ''}<th>Pts</th></tr>
    ${rows.map((r, i) => `<tr style="${q && i < q ? 'background:rgba(30,158,90,.10)' : ''}"><td><b>${i + 1}</b></td><td><span style="display:inline-flex;align-items:center;gap:6px"><i class="ic-dot" style="--tc:${tCol(T, r.id)}"></i><b>${esc(tName(T, r.id))}</b></span></td><td>${r.j}</td><td>${r.g}</td><td>${r.n}</td><td>${r.p}</td><td>${r.bp}</td><td>${r.bc}</td><td>${r.bp - r.bc > 0 ? '+' : ''}${r.bp - r.bc}</td>${T.cfg.bo || T.cfg.bd ? `<td>${r.bo}</td>` : ''}<td><b>${r.pts}</b></td></tr>`).join('')}</table></div>`;

  /* ---------- Phases finales ---------- */
  const pow2 = n => { let p = 1; while (p < n) p *= 2; return p; };
  const seedOrder = P => { let a = [1]; while (a.length < P) { const L = a.length * 2 + 1; a = a.flatMap(s => [s, L - s]); } return a; };
  const pow2down = n => { let p = 2; while (p * 2 <= n) p *= 2; return p; };
  // taille du tableau final : automatique = 2 qualifiés par poule (arrondi à 2, 4, 8, 16, 32), sans dépasser le nombre d'équipes
  const finSize = (fin, n, np) => n < 2 ? 0 : fin === 'auto' ? pow2down(Math.min(n, Math.max(2, np * 2))) : Math.min(+fin, pow2(n));
  function finalSize(T) { return finSize(T.cfg.fin, T.teams.length, (T.poules || poulesOf(T)).length); }
  function qualifiers(T, P) {   // 1ers de poule (classés entre eux), puis 2es, etc.
    const tabs = (T.poules || []).map(ids => table(T, ids)), out = [];
    for (let place = 0; out.length < P && place < Math.max(...tabs.map(t => t.length)); place++) {
      const L = tabs.map(t => t[place]).filter(Boolean).sort((x, y) => y.pts / Math.max(1, y.j) - x.pts / Math.max(1, x.j) || (y.bp - y.bc) / Math.max(1, y.j) - (x.bp - x.bc) / Math.max(1, x.j) || y.bp - x.bp);
      L.forEach(r => { if (out.length < P) out.push(r.id); }); }
    return out; }
  function makeFinals(T) {
    const P0 = finalSize(T), Q = qualifiers(T, P0), P = pow2(Math.max(2, Q.length)), ord = seedOrder(P), F = [];
    let rounds = Math.log2(P), size = P;
    for (let r = 0; r < rounds; r++, size /= 2) for (let k = 0; k < size / 2; k++) {
      const m = { id: uid(), ph: 'f', r, k, size };
      if (r === 0) { const s1 = ord[2 * k], s2 = ord[2 * k + 1]; m.a = Q[s1 - 1] || null; m.b = Q[s2 - 1] || null; if (!m.a || !m.b) { m.bye = true; m.done = true; m.w = m.a || m.b; } }
      F.push(m); }
    if (T.cfg.petite && P >= 4) F.push({ id: uid(), ph: 'f', r: rounds - 1, k: 1, size: 2, petite: true });
    T.matches = (T.matches || []).filter(m => m.ph !== 'f').concat(F); propagate(T);
    const rot0 = Math.max(0, ...T.matches.filter(m => m.ph === 'p').map(m => m.rot || 0)) + 1;
    // une rotation par tour (ou plusieurs si plus de matchs que de terrains)
    let rot = rot0; for (let r = 0; r < rounds; r++) { const L = F.filter(m => m.r === r && !m.bye); const N = Math.max(1, T.cfg.ter | 0);
      L.forEach((m, i) => { m.rot = rot + Math.floor(i / N); m.ter = (i % N) + 1; }); rot += Math.max(1, Math.ceil(L.length / N)); }
    T.finalsAt = Date.now();
  }
  const winnerOf = m => m.bye ? m.w : !m.done ? null : m.ff === 'a' ? m.b : m.ff === 'b' ? m.a : (+m.sa > +m.sb ? m.a : +m.sb > +m.sa ? m.b : m.w || null);
  const loserOf = m => { const w = winnerOf(m); return w && !m.bye ? (w === m.a ? m.b : m.a) : null; };
  function propagate(T) {
    const F = (T.matches || []).filter(m => m.ph === 'f' && !m.petite), R = Math.max(-1, ...F.map(m => m.r));
    for (let r = 1; r <= R; r++) F.filter(m => m.r === r).forEach(m => { const s1 = F.find(x => x.r === r - 1 && x.k === 2 * m.k), s2 = F.find(x => x.r === r - 1 && x.k === 2 * m.k + 1);
      const a = s1 ? winnerOf(s1) : null, b = s2 ? winnerOf(s2) : null; if (m.a !== a || m.b !== b) { if (m.done && (m.a !== a || m.b !== b)) { m.done = false; m.sa = m.sb = ''; delete m.w; delete m.ff; } m.a = a; m.b = b; } });
    const pt = (T.matches || []).find(m => m.petite); if (pt) { const S = F.filter(m => m.r === R - 1); const a = S[0] ? loserOf(S[0]) : null, b = S[1] ? loserOf(S[1]) : null; if (pt.a !== a || pt.b !== b) { pt.a = a; pt.b = b; if (pt.done) { pt.done = false; pt.sa = pt.sb = ''; } } }
    // arbitres des phases finales : équipes libres pendant la rotation
    if (T.cfg.arb) { const refN = {}; T.teams.forEach(t => { refN[t.id] = 0; }); T.matches.forEach(m => { if (m.ref && m.ph === 'p') refN[m.ref]++; });
      T.matches.filter(m => m.ph === 'f' && !m.bye && !m.done).forEach(m => { const same = T.matches.filter(x => x.rot === m.rot), busy = new Set(same.flatMap(x => [x.a, x.b]).concat(same.filter(x => x !== m).map(x => x.ref)).filter(Boolean));
        if (m.ref && !busy.has(m.ref)) return; const free = T.teams.map(t => t.id).filter(id => !busy.has(id)).sort((x, y) => refN[x] - refN[y]); m.ref = free[0] || null; if (m.ref) refN[m.ref]++; }); }
  }
  function finalRanking(T) {
    const F = (T.matches || []).filter(m => m.ph === 'f');
    if (!F.length) return T.cfg.fmt === 'champ' ? table(T, T.teams.map(t => t.id)).map(r => r.id) : [];
    const R = Math.max(...F.filter(m => !m.petite).map(m => m.r)), fin = F.find(m => m.r === R && !m.petite), pt = F.find(m => m.petite), out = [];
    if (fin && winnerOf(fin)) out.push(winnerOf(fin), loserOf(fin));
    if (pt && winnerOf(pt)) out.push(winnerOf(pt), loserOf(pt));
    return out;
  }

  /* ---------- Outil ---------- */
  let curId = null, tab = 'eq', sel = null, undo = null, timer = { rot: null, end: 0, rem: 0, run: false }, tickIv = null;
  TOOL_IMPL.interclasses = function (el) {
    const cur = () => IC().find(t => t.id === curId) || null;
    const commit = () => { save(); window.syncFlush && window.syncFlush(); };
    const snap = l => { const T = cur(); if (T) undo = { id: T.id, l, v: JSON.stringify(T) }; };
    const doUndo = () => { if (!undo) return; const L = IC(), i = L.findIndex(t => t.id === undo.id); if (i >= 0) L[i] = JSON.parse(undo.v); undo = null; commit(); draw(); };
    const undoBtn = () => undo && undo.id === curId ? `<button class="btn btn-ghost btn-block" style="margin-top:10px" id="ic-und">↶ Annuler : ${esc(undo.l)}</button>` : '';
    const vis = T => !window.teamSees || teamSees({ prof: T.prof, classe: (T.cls || []).join(', ') });

    function draw() { const T = cur(); if (!T) return home(); frame(T); }

    /* ----- Accueil : liste + création ----- */
    function home() {
      curId = null; const L = IC().filter(vis).sort((a, b) => (b.created || 0) - (a.created || 0));
      el.innerHTML = `<div class="card"><h3 style="margin-top:0">🏆 Interclasses</h3><p class="muted" style="margin:4px 0 0">Tournoi de sport collectif entre plusieurs classes : équipes, poules, phases finales, terrains, arbitres et classements calculés automatiquement.</p>
          <button class="btn btn-grad btn-block" style="margin-top:12px" id="ic-new" data-prof>＋ Nouvel interclasses</button></div>
        ${L.length ? `<div class="section-title"><h2>Mes interclasses</h2></div>${L.map(T => { const M = T.matches || [], d = M.filter(m => m.done && !m.bye).length, n = M.filter(m => !m.bye).length;
          return `<div class="list-item" data-open="${T.id}" style="cursor:pointer"><div style="flex:1"><b>${IC_SP[T.sport][1]} ${esc(T.nom)}</b><div class="muted" style="font-size:.82rem">${esc(T.cls.join(', '))} · ${T.teams.length} équipes · ${n ? `${d}/${n} matchs joués` : 'calendrier à générer'}</div></div><span class="chev">›</span></div>`; }).join('')}` : ''}`;
      el.querySelector('#ic-new').onclick = () => setup();
      el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { curId = b.dataset.open; tab = (cur().matches || []).length ? 'mt' : 'eq'; draw(); });
    }

    /* ----- Création / réglages ----- */
    function setup(T0) {
      const edit = !!T0, cls = allClasses();
      if (!cls.length) { el.innerHTML = noClassMsg; return; }
      const T = T0 ? JSON.parse(JSON.stringify(T0)) : { id: uid(), nom: 'Interclasses ' + new Date().toLocaleDateString('fr-FR'), date: new Date().toISOString().slice(0, 10), created: Date.now(), sport: 'handball', cls: [], teams: [], absents: [], cfg: defCfg('handball'), matches: [] };
      const c = T.cfg;
      const num = (id, v, lab, min = 0, max = 99, step = 1, help = '') => `<div><label>${lab}</label><input type="number" id="${id}" value="${v}" min="${min}" max="${max}" step="${step}" inputmode="numeric">${help ? `<div class="muted" style="font-size:.75rem">${help}</div>` : ''}</div>`;
      const seg = (id, v, opts) => `<div class="seg" data-seg="${id}">${opts.map(([k, l]) => `<button data-v="${k}" class="${String(v) === String(k) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
      const cnt = cl => studentsOf(cl).length, tot = () => T.cls.reduce((a, cl) => a + cnt(cl), 0);
      const nT = () => c.tm === 'classe' ? T.cls.length : c.tm === 'parclasse' ? T.cls.reduce((a, cl) => a + (c.by === 'sz' ? nFor(cnt(cl), c.sz, 1) : Math.max(1, c.npc)), 0) : c.by === 'sz' ? nFor(tot(), c.sz, 2) : Math.max(2, c.nt);
      const sizeTxt = () => { const n = nT(); if (!n || !T.cls.length) return ''; if (c.tm === 'mix') { const a = Math.floor(tot() / n), b = Math.ceil(tot() / n); return ` de ${a === b ? a : a + ' à ' + b} joueurs`; }
        if (c.tm === 'parclasse') { const z = T.cls.flatMap(cl => { const k = c.by === 'sz' ? nFor(cnt(cl), c.sz, 1) : Math.max(1, c.npc); return [Math.floor(cnt(cl) / k), Math.ceil(cnt(cl) / k)]; }); const a = Math.min(...z), b = Math.max(...z); return ` de ${a === b ? a : a + ' à ' + b} joueurs`; } return ''; };
      const render = () => {
        const n = edit ? T.teams.length : nT(), np = Math.max(1, Math.min(c.np, Math.floor(n / 2) || 1));
        const fs = c.fmt === 'poules' ? finSize(c.fin, n, np) : 0;
        el.innerHTML = `<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3 style="flex:1;margin:0">${edit ? '⚙️ Réglages' : '＋ Nouvel interclasses'}</h3><button class="btn btn-ghost" style="flex:0 0 auto" id="ic-x">✕</button></div>
            <label>Nom</label><input id="ic-nom" value="${esc(T.nom)}">
            <label>Sport collectif</label><div class="ic-chips">${Object.entries(IC_SP).map(([k, s]) => `<button data-sp="${k}" class="${T.sport === k ? 'on' : ''}">${s[1]} ${s[0]}</button>`).join('')}</div></div>
          ${edit ? '' : `<div class="card" style="margin-top:12px"><b>🏫 Classes (2 ou plus)</b><div class="ic-chips">${cls.map(x => `<button data-cl="${esc(x.name)}" class="${T.cls.includes(x.name) ? 'on' : ''}">${esc(x.name)} <small>${x.students.length}</small></button>`).join('')}</div>
            <label>Équipes</label>${seg('tm', c.tm, [['classe', 'Une équipe par classe'], ['parclasse', 'Plusieurs par classe'], ['mix', '🔀 Classes mélangées']])}
            ${c.tm !== 'classe' ? `<label>Choisir</label>${seg('by', c.by, [['nb', 'Le nombre d\'équipes'], ['sz', 'Le nombre de joueurs par équipe']])}` : ''}
            ${c.tm === 'parclasse' ? `<div class="row">${c.by === 'sz' ? num('ic-sz', c.sz, 'Joueurs par équipe', 2, 30) : num('ic-npc', c.npc, 'Équipes par classe', 1, 8)}</div>` : ''}${c.tm === 'mix' ? `<div class="row">${c.by === 'sz' ? num('ic-sz', c.sz, 'Joueurs par équipe', 2, 30, 1, 'Le nombre d\'équipes est calculé ; tirage équilibré avec des élèves de chaque classe.') : num('ic-nt', c.nt, 'Nombre d\'équipes', 2, 32, 1, 'Tirage au sort équilibré : chaque équipe reçoit des élèves de chaque classe.')}</div>` : ''}
            <p class="muted" style="font-size:.8rem;margin:6px 0 0">${T.cls.length ? `<b>${n} équipe${n > 1 ? 's' : ''}${sizeTxt()}</b> · vous pourrez ensuite déplacer des élèves, noter les absents et renommer les équipes.` : 'Touchez les classes qui participent.'}</p></div>`}
          <div class="card" style="margin-top:12px" data-cfg><b>🏆 Formule</b>${seg('fmt', c.fmt, [['poules', 'Poules + phases finales'], ['champ', 'Championnat (classement simple)']])}
            ${c.fmt === 'poules' ? `<div class="row">${num('ic-np', c.np, 'Nombre de poules', 1, 16)}<div><label>Phases finales à partir des</label><select id="ic-fin">${[['auto', 'Automatique'], [32, '16es de finale'], [16, '8es de finale'], [8, 'Quarts de finale'], [4, 'Demi-finales'], [2, 'Finale']].map(([k, l]) => `<option value="${k}" ${String(c.fin) === String(k) ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
              <p class="muted" style="font-size:.8rem;margin:6px 0 0">${n >= 2 ? `${np} poule${np > 1 ? 's' : ''} de ${Math.floor(n / np)}${n % np ? ` à ${Math.ceil(n / np)}` : ''} équipes · ${ROUND[fs] || 'Finale'} : ${fs} qualifiés${fs >= np && fs % np === 0 ? ` (les ${fs / np} premiers de chaque poule)` : fs > np ? ` (les ${Math.floor(fs / np)} premiers de chaque poule + ${fs % np} meilleur${fs % np > 1 ? 's' : ''} suivant${fs % np > 1 ? 's' : ''})` : ` (les ${fs} meilleurs 1ers de poule)`}` : ''}</p>
              <label class="cx-chk" style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="ic-pt" ${c.petite ? 'checked' : ''} style="width:auto"> Match pour la 3e place</label>` : ''}
            <label>Matchs</label>${seg('ar', c.ar ? 1 : 0, [[0, 'Aller simple'], [1, 'Aller-retour']])}</div>
          <div class="card" style="margin-top:12px" data-cfg><b>🏟 Terrains</b><div class="row">${num('ic-ter', c.ter, 'Terrains en même temps', 1, 16)}</div>
            ${c.fmt === 'poules' ? `<label>Placement</label>${seg('place', c.place, [['poule', 'Une poule par terrain'], ['libre', 'Placement libre']])}` : ''}
            <label class="cx-chk" style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="ic-arb" ${c.arb ? 'checked' : ''} style="width:auto"> 🟨 Les équipes au repos arbitrent (désignées automatiquement)</label>${c.arb && n >= 2 && n < 3 * c.ter ? `<p class="muted" style="font-size:.78rem;margin:6px 0 0">⚠️ Avec ${n} équipes sur ${c.ter} terrains, il n'y aura pas toujours une équipe au repos pour arbitrer chaque match (il faudrait ${3 * c.ter} équipes, ou moins de terrains).</p>` : ''}</div>
          <div class="card" style="margin-top:12px" data-cfg><b>⏱ Match</b><div class="row">${num('ic-dur', c.dur, 'Durée (min)', 0, 60, 0.5)}${num('ic-tg', c.target, 'Points pour gagner', 0, 99, 1, '0 = au temps')}</div>
            <label>Boutons de points du sport</label><input id="ic-btn" value="${esc(btnsOf(T).join(', '))}" inputmode="numeric"><div class="muted" style="font-size:.75rem">ex. rugby : 5, 2, 3 (essai, transformation, pénalité) · basket : 1, 2, 3</div>
            <label class="cx-chk" style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="ic-bon" ${c.bon !== false ? 'checked' : ''} style="width:auto"> ⭐ Points bonus (attribués par l'enseignant pendant le match)</label>
            ${c.bon !== false ? `<input id="ic-bonv" value="${esc(bonusOf(T).join(', '))}" inputmode="numeric" style="margin-top:6px"><div class="muted" style="font-size:.75rem">valeurs proposées, ex. 3, 5, 10, 100, 1000 · ajoutés au score de l'équipe</div>` : ''}
            <b style="display:block;margin-top:12px">📊 Points au classement</b><div class="row">${num('ic-pw', c.pw, 'Victoire', 0, 10)}${num('ic-pd', c.pd, 'Nul', 0, 10)}${num('ic-pl', c.pl, 'Défaite', -5, 10)}${num('ic-pf', c.pf, 'Forfait', -5, 10)}</div>
            <div class="row">${num('ic-bo', c.bo, 'Bonus offensif : +1 si victoire d\'au moins', 0, 50, 1, 'écart de buts / points · 0 = sans')}${num('ic-bd', c.bd, 'Bonus défensif : +1 si défaite d\'au plus', 0, 50, 1, '0 = sans')}</div>
            <p class="muted" style="font-size:.78rem;margin:6px 0 0">Départage : points, puis différence, puis ${T.sport === 'volley' ? 'points' : 'buts'} marqués.</p></div>
          <button class="btn btn-grad btn-block" style="margin-top:12px;padding:16px;font-size:1.1rem" id="ic-ok">${edit ? '💾 Enregistrer les réglages' : '✔ Créer les équipes'}</button>`;
        const $ = s => el.querySelector(s), keep = () => {
          T.nom = $('#ic-nom').value.trim() || T.nom; const g = (id, k, f = x => x) => { const e = $(id); if (e && e.value !== '') c[k] = f(+e.value); };
          g('#ic-npc', 'npc'); g('#ic-nt', 'nt'); g('#ic-sz', 'sz'); g('#ic-np', 'np'); g('#ic-ter', 'ter'); g('#ic-dur', 'dur'); g('#ic-tg', 'target'); g('#ic-pw', 'pw'); g('#ic-pd', 'pd'); g('#ic-pl', 'pl'); g('#ic-pf', 'pf'); g('#ic-bo', 'bo'); g('#ic-bd', 'bd');
          if ($('#ic-btn')) { const v = parseNums($('#ic-btn').value); c.btn = v.length ? v : DEF_BTN[T.sport].slice(); }
          if ($('#ic-bon')) c.bon = $('#ic-bon').checked; if ($('#ic-bonv')) { const v = parseNums($('#ic-bonv').value); c.bonv = v.length ? v : DEF_BONUS.slice(); }
          if ($('#ic-fin')) c.fin = $('#ic-fin').value === 'auto' ? 'auto' : +$('#ic-fin').value; if ($('#ic-pt')) c.petite = $('#ic-pt').checked; c.arb = $('#ic-arb').checked; };
        $('#ic-x').onclick = () => edit ? draw() : home();
        el.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => { keep(); T.sport = b.dataset.sp; const d = defCfg(T.sport); c.mode = d.mode; c.dur = d.dur; c.target = d.target; c.btn = d.btn; render(); });
        el.querySelectorAll('[data-cl]').forEach(b => b.onclick = () => { keep(); const k = b.dataset.cl; T.cls = T.cls.includes(k) ? T.cls.filter(x => x !== k) : [...T.cls, k]; render(); });
        el.querySelectorAll('[data-seg]').forEach(s => s.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { keep(); const k = s.dataset.seg, v = b.dataset.v; c[k] = k === 'ar' ? v === '1' : v; render(); }));
        if ($('#ic-bon')) $('#ic-bon').onchange = () => { keep(); render(); };
        el.querySelectorAll('input[type=number]').forEach(i => i.onchange = () => { keep(); if (['ic-npc', 'ic-nt', 'ic-np', 'ic-sz'].includes(i.id)) render(); });
        if ($('#ic-fin')) $('#ic-fin').onchange = () => { keep(); render(); };
        $('#ic-ok').onclick = () => { keep();
          if (!edit) { if (T.cls.length < 2 && !(c.tm !== 'classe' && T.cls.length === 1)) return toast('Choisissez au moins 2 classes'); buildTeams(T); if (T.teams.length < 2) return toast('Il faut au moins 2 équipes');
            if (window.teamTag) teamTag(T); IC().push(T); curId = T.id; tab = 'eq'; commit(); toast(`${T.teams.length} équipes créées ✔`); return draw(); }
          const L = IC(), i = L.findIndex(x => x.id === T.id), old = L[i], played = (old.matches || []).some(m => m.done && !m.bye);
          const struct = ['fmt', 'np', 'ter', 'place', 'ar', 'arb'].some(k => old.cfg[k] !== c[k]) || old.cfg.fin !== c.fin || old.cfg.petite !== c.petite;
          snap('réglages modifiés'); L[i] = T;
          if (struct && (old.matches || []).length) { if (!played || confirm('Les réglages du calendrier ont changé.\nRegénérer le calendrier ? (les scores déjà saisis seront effacés)\n\nAnnuler = garder le calendrier actuel (seuls les points / bonus changent).')) generate(T); }
          commit(); toast('Réglages enregistrés ✔'); draw(); };
      };
      render();
    }

    /* ----- Écran d'un interclasses ----- */
    function frame(T) {
      const M = T.matches || [], hasP = M.some(m => m.ph === 'p'), hasF = M.some(m => m.ph === 'f');
      const tabs = [['eq', '👥 Équipes'], ['mt', '📅 Matchs'], ['cl', '📊 Classement'], ...(T.cfg.fmt === 'poules' ? [['fi', '🥇 Phases finales']] : [])];
      el.innerHTML = `<div class="cx-bar" style="display:flex;gap:8px;align-items:center"><button class="btn btn-ghost" style="flex:0 0 auto" id="ic-back">← Liste</button><b style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${IC_SP[T.sport][1]} ${esc(T.nom)}</b><button class="btn btn-ghost" style="flex:0 0 auto" id="ic-set" data-prof>⚙️</button></div>
        <div class="ic-tabs">${tabs.map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div><div id="ic-b"></div>`;
      const $ = s => el.querySelector(s), box = $('#ic-b');
      $('#ic-back').onclick = () => { stopTick(); home(); };
      $('#ic-set').onclick = () => setup(T);
      el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; sel = null; draw(); });
      if (tab === 'eq') teamsView(T, box); else if (tab === 'mt') matchesView(T, box); else if (tab === 'cl') rankView(T, box); else finalsView(T, box);
      if (box.querySelector('#ic-und')) box.querySelector('#ic-und').onclick = doUndo;
    }

    /* ----- Équipes ----- */
    function teamsView(T, box) {
      const abs = T.absents || [];
      box.innerHTML = `<div class="card"><div class="muted" style="font-size:.85rem">Touchez un élève, puis l'équipe où le placer (ou « Absent »). Les noms d'équipes sont modifiables.</div>
          <div class="row" style="margin-top:10px;gap:6px"><button class="btn btn-ghost" id="ic-redraw" data-prof>🎲 Refaire les équipes</button><button class="btn btn-grad" id="ic-gen" data-prof>📅 ${(T.matches || []).length ? 'Regénérer' : 'Générer'} le calendrier</button></div></div>
        ${sel ? `<div class="card" style="margin-top:10px;position:sticky;top:0;z-index:5;border:2px solid #1E5BD8"><b>${esc(sel.n)}</b> <span class="muted">(${esc(sel.c)})</span> → touchez une équipe <button class="btn btn-ghost" style="padding:6px 10px;margin-left:6px" id="ic-abs">🚫 Absent</button> <button class="btn btn-ghost" style="padding:6px 10px" id="ic-unsel">✕</button></div>` : ''}
        <div class="ic-teams">${T.teams.map(t => `<div class="ic-team ${sel ? 'tg' : ''}" style="--tc:${t.col}" data-team="${t.id}"><h4><i class="ic-dot"></i><input data-tn="${t.id}" value="${esc(t.name)}"><span class="muted" style="font-size:.8rem">${t.members.length}</span></h4>
          <div class="ic-st">${t.members.map(m => `<button class="ic-p ${sel && sel.n === m.n && sel.c === m.c ? 'on' : ''}" data-pk="${esc(m.c)}|${esc(m.n)}">${esc(m.n)}${T.cls.length > 1 && T.cfg.tm !== 'classe' ? ` <small style="opacity:.7">${esc(m.c)}</small>` : ''}</button>`).join('') || '<span class="muted" style="font-size:.8rem">Aucun élève</span>'}</div></div>`).join('')}</div>
        ${abs.length ? `<div class="card" style="margin-top:10px"><b>🚫 Absents (${abs.length})</b><div class="ic-st">${abs.map(k => `<button class="ic-p" data-back="${esc(k)}">↩ ${esc(k.split('|')[1])} <small>${esc(k.split('|')[0])}</small></button>`).join('')}</div></div>` : ''}${undoBtn()}`;
      const $ = s => box.querySelector(s);
      box.querySelectorAll('[data-tn]').forEach(i => i.onchange = () => { const t = T.teams.find(x => x.id === i.dataset.tn); if (t && i.value.trim()) { t.name = i.value.trim(); commit(); } });
      box.querySelectorAll('[data-pk]').forEach(b => b.onclick = e => { e.stopPropagation(); const [c, ...n] = b.dataset.pk.split('|'); const N = n.join('|'); sel = sel && sel.n === N && sel.c === c ? null : { c, n: N }; draw(); });
      box.querySelectorAll('[data-team]').forEach(d => d.onclick = e => { if (!sel || e.target.closest('input')) return; const to = T.teams.find(t => t.id === d.dataset.team);
        T.teams.forEach(t => { t.members = t.members.filter(m => !(m.n === sel.n && m.c === sel.c)); }); to.members.push(sel); sel = null; commit(); draw(); });
      if ($('#ic-abs')) $('#ic-abs').onclick = () => { T.teams.forEach(t => { t.members = t.members.filter(m => !(m.n === sel.n && m.c === sel.c)); }); T.absents = [...(T.absents || []), sel.c + '|' + sel.n]; sel = null; commit(); draw(); };
      if ($('#ic-unsel')) $('#ic-unsel').onclick = () => { sel = null; draw(); };
      box.querySelectorAll('[data-back]').forEach(b => b.onclick = () => { const k = b.dataset.back, [c, ...n] = k.split('|'); T.absents = T.absents.filter(x => x !== k);
        const t = T.cfg.tm === 'classe' ? T.teams.find(x => x.name === c) || T.teams[0] : T.teams.slice().sort((a, b) => a.members.length - b.members.length)[0]; t.members.push({ c, n: n.join('|') }); commit(); draw(); });
      $('#ic-redraw').onclick = () => { if ((T.matches || []).some(m => m.done) && !confirm('Des matchs ont déjà été joués. Refaire les équipes efface le calendrier et les scores. Continuer ?')) return;
        if (!confirm('Refaire toutes les équipes (nouveau tirage) ?')) return; snap('équipes refaites'); buildTeams(T); T.matches = []; delete T.poules; commit(); draw(); };
      $('#ic-gen').onclick = () => { if ((T.matches || []).some(m => m.done && !m.bye) && !confirm('Regénérer le calendrier efface les scores déjà saisis. Continuer ?')) return;
        snap('calendrier généré'); generate(T); tab = 'mt'; commit(); toast(`${T.matches.length} matchs programmés ✔`); draw(); };
    }

    /* ----- Matchs par rotation (+ chrono de rotation) ----- */
    function matchesView(T, box) {
      const M = (T.matches || []).filter(m => !m.bye && m.rot);
      if (!M.length) { box.innerHTML = `<div class="card empty">Pas encore de calendrier.<br><br><button class="btn btn-grad" id="ic-gen2" data-prof>📅 Générer le calendrier</button></div>${undoBtn()}`;
        box.querySelector('#ic-gen2').onclick = () => { snap('calendrier généré'); generate(T); commit(); draw(); }; return; }
      const rots = [...new Set(M.map(m => m.rot))].sort((a, b) => a - b), next = rots.find(r => M.some(m => m.rot === r && !m.done));
      const dur = (+T.cfg.dur || 0) * 60000; if (timer.rot == null || !rots.includes(timer.rot)) timer = { rot: next ?? rots[0], end: 0, rem: dur, run: false };
      const mCard = m => { const fin = m.ph === 'f' ? (m.petite ? '3e place' : ROUND[m.size] || '') : (T.poules && T.poules.length > 1 ? 'Poule ' + String.fromCharCode(65 + m.g) : '');
        return `<button class="ic-m ${m.done ? 'done' : ''}" data-m="${m.id}"><div class="ter">Terrain ${m.ter}${fin ? ' · ' + fin : ''}</div>
          <div class="vs"><i class="ic-dot" style="--tc:${tCol(T, m.a)}"></i><span class="n">${m.a ? esc(tName(T, m.a)) : '<i class="muted">à venir</i>'}</span><span class="sc">${m.done ? `${m.ff === 'a' ? 'F' : m.sa}` : ''}</span></div>
          <div class="vs"><i class="ic-dot" style="--tc:${tCol(T, m.b)}"></i><span class="n">${m.b ? esc(tName(T, m.b)) : '<i class="muted">à venir</i>'}</span><span class="sc">${m.done ? `${m.ff === 'b' ? 'F' : m.sb}` : ''}</span></div>
          ${m.done && (m.ba || m.bb) ? `<div class="ref">⭐ dont bonus : ${m.ba || 0} – ${m.bb || 0}</div>` : ''}${m.ref ? `<div class="ref">🟨 Arbitre : ${esc(tName(T, m.ref))}</div>` : ''}</button>`; };
      box.innerHTML = `${dur ? `<div class="card" style="position:sticky;top:0;z-index:5"><div style="display:flex;align-items:center;gap:8px"><select id="ic-tr" style="flex:1">${rots.map(r => `<option value="${r}" ${r === timer.rot ? 'selected' : ''}>Rotation ${r}</option>`).join('')}</select>
            <span class="ic-tm" id="ic-tm" style="flex:0 0 auto;font-size:2rem">--:--</span></div>
          <div class="row" style="margin-top:8px;gap:6px"><button class="btn btn-grad" id="ic-go">▶ Lancer</button><button class="btn btn-ghost" id="ic-rz">↺</button></div></div>` : ''}
        <p class="muted" style="font-size:.8rem;margin:10px 2px 0">${M.filter(m => m.done).length}/${M.length} matchs joués · touchez un match pour saisir le score.</p>
        ${rots.map(r => `<div class="ic-rot" id="rot-${r}"><h3>${r === next ? '▶ ' : ''}Rotation ${r}${M.filter(m => m.rot === r).every(m => m.done) ? ' ✅' : ''}</h3><div class="ic-ms">${M.filter(m => m.rot === r).sort((a, b) => a.ter - b.ter).map(mCard).join('')}</div>
          ${(() => { const busy = new Set(M.filter(m => m.rot === r).flatMap(m => [m.a, m.b, m.ref])); const rest = T.teams.filter(t => !busy.has(t.id)); return rest.length ? `<div class="muted" style="font-size:.78rem;margin-top:4px">Au repos : ${rest.map(t => esc(t.name)).join(', ')}</div>` : ''; })()}</div>`).join('')}
        <button class="btn btn-ghost btn-block" style="margin-top:12px" id="ic-csv">📤 Exporter le calendrier (CSV)</button>${undoBtn()}`;
      box.querySelectorAll('[data-m]').forEach(b => b.onclick = () => scoreModal(T, T.matches.find(m => m.id === b.dataset.m)));
      box.querySelector('#ic-csv').onclick = () => download(`interclasses-${T.nom.replace(/[^\w-]+/g, '_')}.csv`, csv([['Rotation', 'Terrain', 'Phase', 'Équipe A', 'Score A', 'Score B', 'Équipe B', 'Arbitre'],
        ...M.slice().sort((a, b) => a.rot - b.rot || a.ter - b.ter).map(m => [m.rot, m.ter, m.ph === 'p' ? (T.poules && T.poules.length > 1 ? 'Poule ' + String.fromCharCode(65 + m.g) : 'Championnat') : (m.petite ? '3e place' : ROUND[m.size]), tName(T, m.a), m.done ? m.sa : '', m.done ? m.sb : '', tName(T, m.b), m.ref ? tName(T, m.ref) : ''])]));
      if (dur) { const $ = s => box.querySelector(s);
        const show = () => { const rem = timer.run ? Math.max(0, timer.end - Date.now()) : timer.rem, s = Math.ceil(rem / 1000), e = $('#ic-tm'); if (!e) return stopTick();
          e.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; e.style.color = timer.run && rem < 60000 ? 'var(--danger,#D64545)' : '';
          if (timer.run && rem <= 0) { timer.run = false; timer.rem = 0; try { beep(660, .5, .6); setTimeout(() => beep(660, .9, .6), 650); navigator.vibrate && navigator.vibrate([400, 200, 600]); } catch (e) {} toast(`⏱ Fin de la rotation ${timer.rot}`); draw(); } };
        $('#ic-tr').onchange = e => { timer = { rot: +e.target.value, end: 0, rem: dur, run: false }; draw(); };
        $('#ic-go').textContent = timer.run ? '⏸ Pause' : timer.rem < dur && timer.rem > 0 ? '▶ Reprendre' : '▶ Lancer';
        $('#ic-go').onclick = () => { if (timer.run) { timer.rem = Math.max(0, timer.end - Date.now()); timer.run = false; } else { if (timer.rem <= 0) timer.rem = dur; timer.end = Date.now() + timer.rem; timer.run = true; try { beep(880, .3); } catch (e) {} } draw(); };
        $('#ic-rz').onclick = () => { timer.run = false; timer.rem = dur; draw(); };
        show(); stopTick(); tickIv = setInterval(show, 250); }
    }
    function stopTick() { clearInterval(tickIv); tickIv = null; }

    function scoreModal(T, m) {
      if (!m.a || !m.b) return toast('Équipes pas encore connues');
      let sa = m.done ? +m.sa || 0 : 0, sb = m.done ? +m.sb || 0 : 0, w = m.w || null, ba = +m.ba || 0, bb = +m.bb || 0; const fin = m.ph === 'f', hist = [], B = btnsOf(T), BO = bonusOf(T);
      const add = (s, k, bonus) => { if (s === 'a') { sa = Math.max(0, sa + k); if (bonus) ba += k; } else { sb = Math.max(0, sb + k); if (bonus) bb += k; } if (k > 0) hist.push([s, k, bonus]); };
      const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:320;background:rgba(7,18,42,.65);display:flex;padding:14px;overflow:auto';
      const r = () => { o.innerHTML = `<div class="card" style="margin:auto;width:100%;max-width:520px"><div style="display:flex;align-items:center;gap:8px"><b style="flex:1">Rotation ${m.rot} · Terrain ${m.ter}${fin ? ' · ' + (m.petite ? '3e place' : ROUND[m.size]) : ''}</b><button class="btn btn-ghost" style="flex:0 0 auto" data-q>✕</button></div>
          ${[['a', m.a], ['b', m.b]].map(([s, id]) => `<div style="margin-top:12px;text-align:center"><div style="font-weight:900;display:flex;align-items:center;justify-content:center;gap:6px"><i class="ic-dot" style="--tc:${tCol(T, id)}"></i>${esc(tName(T, id))}</div>
            <div class="ic-pad"><button class="btn btn-ghost" data-d="${s}" data-k="-1">−</button><b>${s === 'a' ? sa : sb}</b>${B.map((k, i) => `<button class="btn ${i ? 'btn-ghost' : 'btn-grad'}" style="${String(k).length > 1 || B.length > 1 ? 'width:auto;padding:0 12px;font-size:1.05rem' : ''}" data-d="${s}" data-k="${k}">+${k}</button>`).join('')}</div>
            ${BO.length ? `<div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:6px"><span class="muted" style="font-size:.78rem;align-self:center">⭐ Bonus${(s === 'a' ? ba : bb) ? ` (${s === 'a' ? ba : bb})` : ''} :</span>${BO.map(k => `<button class="btn btn-ghost" style="width:auto;padding:5px 9px;font-size:.8rem;flex:0 0 auto" data-d="${s}" data-k="${k}" data-bo="1">+${k}</button>`).join('')}</div>` : ''}</div>`).join('')}
          ${hist.length ? `<button class="btn btn-ghost btn-block" style="margin-top:8px;padding:8px" id="hb">↶ Annuler le dernier ajout (+${hist[hist.length - 1][1]} ${esc(tName(T, hist[hist.length - 1][0] === 'a' ? m.a : m.b))})</button>` : ''}
          ${fin && sa === sb ? `<div style="margin-top:12px"><b>Égalité : qui se qualifie ?</b> <span class="muted" style="font-size:.8rem">(tirs au but, point en or…)</span><div class="row" style="gap:6px;margin-top:6px">${[m.a, m.b].map(id => `<button class="btn ${w === id ? 'btn-grad' : 'btn-ghost'}" data-w="${id}">${esc(tName(T, id))}</button>`).join('')}</div></div>` : ''}
          ${T.cfg.target ? `<p class="muted" style="font-size:.8rem;text-align:center;margin:8px 0 0">Match en ${T.cfg.target} points${T.cfg.dur ? ` ou ${T.cfg.dur} min` : ''}</p>` : ''}
          <button class="btn btn-grad btn-block" style="margin-top:14px;padding:14px" id="ok">✔ Valider le score</button>
          <div class="row" style="gap:6px;margin-top:8px"><button class="btn btn-ghost" data-ff="a" style="font-size:.82rem">Forfait ${esc(tName(T, m.a))}</button><button class="btn btn-ghost" data-ff="b" style="font-size:.82rem">Forfait ${esc(tName(T, m.b))}</button></div>
          ${m.done ? '<button class="btn btn-ghost btn-block" style="margin-top:8px" id="clr">🗑 Effacer le résultat</button>' : ''}</div>`;
        o.querySelector('[data-q]').onclick = () => o.remove();
        o.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { add(b.dataset.d, +b.dataset.k, !!b.dataset.bo); r(); });
        if (o.querySelector('#hb')) o.querySelector('#hb').onclick = () => { const [s, k, bo] = hist.pop(); if (s === 'a') { sa = Math.max(0, sa - k); if (bo) ba -= k; } else { sb = Math.max(0, sb - k); if (bo) bb -= k; } r(); };
        o.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { w = b.dataset.w; r(); });
        const fin2 = () => { if (fin) propagate(T); commit(); o.remove(); draw(); checkEnd(T); };
        o.querySelector('#ok').onclick = () => { if (fin && sa === sb && !w) return toast('Choisissez l\'équipe qualifiée'); snap('score ' + tName(T, m.a) + ' – ' + tName(T, m.b));
          Object.assign(m, { sa, sb, ba: Math.max(0, ba), bb: Math.max(0, bb), done: true, t: Date.now() }); delete m.ff; if (fin && sa === sb) m.w = w; else delete m.w; fin2(); };
        o.querySelectorAll('[data-ff]').forEach(b => b.onclick = () => { if (!confirm(`Forfait de ${tName(T, b.dataset.ff === 'a' ? m.a : m.b)} ?`)) return; snap('forfait');
          const g = T.cfg.target || 3; Object.assign(m, { done: true, ff: b.dataset.ff, sa: b.dataset.ff === 'a' ? 0 : Math.max(sa, g), sb: b.dataset.ff === 'b' ? 0 : Math.max(sb, g), t: Date.now() }); delete m.w; fin2(); });
        if (o.querySelector('#clr')) o.querySelector('#clr').onclick = () => { if (!confirm('Effacer ce résultat ?')) return; snap('résultat effacé'); m.done = false; m.sa = m.sb = ''; delete m.ff; delete m.w; fin2(); };
      };
      r(); document.body.appendChild(o);
    }
    function checkEnd(T) {
      const P = (T.matches || []).filter(m => m.ph === 'p');
      if (T.cfg.fmt === 'poules' && P.length && P.every(m => m.done) && !(T.matches || []).some(m => m.ph === 'f')) toast('✅ Poules terminées : générez les phases finales (onglet 🥇)');
      const fr = finalRanking(T), all = (T.matches || []).every(m => m.done);
      if (fr[0] && (T.cfg.fmt === 'champ' ? all : (T.matches || []).some(m => m.ph === 'f'))) { const F = T.matches.filter(m => m.ph === 'f' && !m.petite); if (T.cfg.fmt === 'champ' || F.every(m => m.done)) setTimeout(() => toast(`🏆 Vainqueur : ${tName(T, fr[0])}`), 900); }
    }

    /* ----- Classements ----- */
    function rankView(T, box) {
      const P = T.poules || [T.teams.map(t => t.id)], fs = T.cfg.fmt === 'poules' ? finalSize(T) : 0, q = fs ? Math.ceil(fs / P.length) : 0;
      const fr = finalRanking(T), done = T.cfg.fmt === 'champ' ? (T.matches || []).length && T.matches.every(m => m.done) : fr.length >= 2;
      box.innerHTML = `${done && fr[0] ? `<div class="card" style="text-align:center;background:var(--grad-soft)"><div style="font-size:2rem">🏆</div><b style="font-size:1.3rem">${esc(tName(T, fr[0]))}</b>${fr[1] ? `<div class="muted">2e : ${esc(tName(T, fr[1]))}${fr[2] ? ` · 3e : ${esc(tName(T, fr[2]))}` : ''}</div>` : ''}</div>` : ''}
        ${P.map((ids, g) => `<div class="section-title"><h2>${P.length > 1 ? 'Poule ' + String.fromCharCode(65 + g) : T.cfg.fmt === 'champ' ? 'Classement' : 'Poule unique'}</h2></div><div class="card">${tableHTML(T, table(T, ids), q)}</div>`).join('')}
        ${fs ? `<p class="muted" style="font-size:.8rem">En vert : places qualificatives (${fs} qualifiés pour les ${ROUND[fs] ? ROUND[fs].toLowerCase() : 'phases finales'}).</p>` : ''}
        <div class="row" style="gap:6px;margin-top:10px"><button class="btn btn-ghost" id="ic-ccsv">📤 Exporter (CSV)</button><button class="btn btn-ghost" id="ic-res" data-prof>💾 Envoyer dans Résultats des élèves</button></div>`;
      box.querySelector('#ic-ccsv').onclick = () => download(`interclasses-classement-${T.nom.replace(/[^\w-]+/g, '_')}.csv`, csv([['Poule', 'Rang', 'Équipe', 'J', 'G', 'N', 'P', 'Pour', 'Contre', 'Diff', 'Bonus', 'Points'], ...P.flatMap((ids, g) => table(T, ids).map((r, i) => [P.length > 1 ? String.fromCharCode(65 + g) : '', i + 1, tName(T, r.id), r.j, r.g, r.n, r.p, r.bp, r.bc, r.bp - r.bc, r.bo, r.pts]))]));
      box.querySelector('#ic-res').onclick = () => { if (typeof saveResult !== 'function') return;
        const rk = {}; fr.forEach((id, i) => { rk[id] = i + 1; }); P.forEach(ids => table(T, ids).forEach((r, i) => { if (!rk[r.id]) rk[r.id] = (P.length > 1 ? `${i + 1}e poule` : i + 1); }));
        let n = 0; T.teams.forEach(t => t.members.forEach(m => { const v = rk[t.id]; saveResult({ key: `ic|${T.id}|${m.c}|${m.n}`, tool: 'interclasses', label: `Interclasses ${IC_SP[T.sport][0]} · ${T.nom}`, classe: m.c, eleve: m.n, valeur: typeof v === 'number' ? `${v}${v === 1 ? 'er' : 'e'} / ${T.teams.length}` : String(v), detail: `Équipe ${t.name}` }); n++; }));
        toast(`${n} résultat(s) enregistré(s) ✔`); };
    }

    /* ----- Phases finales ----- */
    function finalsView(T, box) {
      const F = (T.matches || []).filter(m => m.ph === 'f'), P = (T.matches || []).filter(m => m.ph === 'p'), left = P.filter(m => !m.done).length;
      if (!F.length) { const fs = finalSize(T);
        box.innerHTML = `<div class="card"><b>🥇 Phases finales</b><p class="muted" style="margin:6px 0 0">${fs ? `${ROUND[fs] || 'Finale'} · ${fs} équipes qualifiées d'après le classement des poules${T.cfg.petite ? ' · match pour la 3e place' : ''}.` : ''}${left ? `<br>⚠️ Encore ${left} match${left > 1 ? 's' : ''} de poule à jouer.` : ''}</p>
          <button class="btn btn-grad btn-block" style="margin-top:10px" id="ic-mkf" data-prof ${P.length ? '' : 'disabled'}>🥇 Générer le tableau final</button></div>${undoBtn()}`;
        box.querySelector('#ic-mkf').onclick = () => { if (left && !confirm(`Il reste ${left} match(s) de poule. Générer quand même le tableau avec le classement actuel ?`)) return; snap('tableau final généré'); makeFinals(T); commit(); toast('Tableau final prêt ✔'); draw(); };
        return; }
      const R = Math.max(...F.filter(m => !m.petite).map(m => m.r));
      const cell = m => `<button class="ic-m ${m.done ? 'done' : ''}" data-m="${m.id}" ${m.bye ? 'disabled' : ''}>${m.bye ? `<div class="ter">Qualifié d'office</div><div class="vs"><b>${esc(tName(T, m.w))}</b></div>` : `<div class="ter">${m.rot ? `Rotation ${m.rot} · T${m.ter}` : ''}</div>
        ${[['a', m.a, m.sa], ['b', m.b, m.sb]].map(([s, id, sc]) => `<div class="vs" style="${m.done && winnerOf(m) === id ? 'color:#1E9E5A' : ''}"><i class="ic-dot" style="--tc:${tCol(T, id)}"></i><span class="n">${id ? esc(tName(T, id)) : '<i class="muted">à venir</i>'}</span><span class="sc">${m.done ? (m.ff === s ? 'F' : sc) + (m.w === id ? '*' : '') : ''}</span></div>`).join('')}
        ${m.ref && !m.done ? `<div class="ref">🟨 ${esc(tName(T, m.ref))}</div>` : ''}`}</button>`;
      box.innerHTML = `<div class="ic-br">${Array.from({ length: R + 1 }, (_, r) => { const L = F.filter(m => m.r === r && !m.petite).sort((a, b) => a.k - b.k); return `<div class="col"><h4>${ROUND[L[0].size] || ''}</h4>${L.map(cell).join('')}${r === R && F.find(m => m.petite) ? `<h4 style="margin-top:14px">3e place</h4>${cell(F.find(m => m.petite))}` : ''}</div>`; }).join('')}</div>
        <p class="muted" style="font-size:.78rem">* qualifié après égalité (tirs au but, point en or…). Les vainqueurs avancent automatiquement.</p>
        <button class="btn btn-ghost btn-block" style="margin-top:8px" id="ic-rmf" data-prof>🗑 Supprimer le tableau final</button>${undoBtn()}`;
      box.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { const m = T.matches.find(x => x.id === b.dataset.m); if (m && !m.bye) scoreModal(T, m); });
      box.querySelector('#ic-rmf').onclick = () => { if (!confirm('Supprimer le tableau final (et ses scores) ?')) return; snap('tableau final supprimé'); T.matches = T.matches.filter(m => m.ph !== 'f'); commit(); draw(); };
    }

    // mise à jour quand une autre tablette envoie des scores
    const onRemote = () => { if (!el.isConnected) return; if (!document.querySelector('[data-q]') || !document.querySelector('.ic-pad')) draw(); };
    window.addEventListener('eps-remote', onRemote);
    if (curId && cur()) draw(); else home();
    return () => { stopTick(); window.removeEventListener('eps-remote', onRemote); };
  };

  // tests / autres outils
  window.IC_LIB = { rr, seedOrder, poulesOf, generate, table, makeFinals, propagate, finalRanking, winnerOf, finalSize, qualifiers, buildTeams };
})();
