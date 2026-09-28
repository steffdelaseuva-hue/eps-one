/* =========================================================
   EPS ONE — Outil « Gestion de match »
   Sports collectifs & raquettes : terrain, chrono, score, bonus,
   zones de progression, statistiques, historique
   ========================================================= */
DB.matchs = DB.matchs || [];
DB.tournois = DB.tournois || [];   // tournois (équipes + rencontres) PARTAGÉS entre les tablettes (synchronisés)
const TR = () => (DB.tournois = DB.tournois || []);
const tuid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
/* Championnat aller simple (méthode du cercle, comme l'outil « Poule ») ; nombre impair → une équipe exempte par tour */
function roundRobin(names) {
  const t = [...names], out = []; if (t.length % 2) t.push(null); const r = t.length - 1;
  for (let k = 0; k < r; k++) { for (let i = 0; i < t.length / 2; i++) { const x = t[i], y = t[t.length - 1 - i]; if (x && y) out.push({ id: tuid(), round: k + 1, a: x, b: y }); } t.splice(1, 0, t.pop()); }
  return out;
}
/* Dernier match enregistré pour chaque rencontre (plusieurs tablettes → le plus récent) ; observations seules exclues */
function tResults(t) { const o = {}; DB.matchs.forEach(m => { if (m.tid === t.id && m.rid && !m.obsOnly && (!o[m.rid] || (m.date || 0) >= (o[m.rid].date || 0))) o[m.rid] = m; }); return o; }
const tScore = (r, m) => m.a === r.b && m.b === r.a && r.a !== r.b ? [+m.sb || 0, +m.sa || 0] : [+m.sa || 0, +m.sb || 0];  // score dans le sens de la rencontre
/* Classement d'un championnat ; g (facultatif) = nom de la poule (« Poule niveau 1 »…) */
function tStand(t, g) {
  const P = t.pts || { v: 3, n: 2, d: 1 }, res = tResults(t), inG = x => g === undefined || (x.g || '') === g;
  const s = Object.fromEntries(t.teams.filter(inG).map(x => [x.name, { t: x.name, j: 0, g: 0, n: 0, p: 0, bp: 0, bc: 0, pts: 0 }]));
  t.rencontres.filter(inG).forEach(r => { const m = res[r.id], A = s[r.a], B = s[r.b]; if (!m || !A || !B) return; const [x, y] = tScore(r, m);
    A.j++; B.j++; A.bp += x; A.bc += y; B.bp += y; B.bc += x;
    if (x > y) { A.g++; B.p++; A.pts += P.v; B.pts += P.d } else if (x < y) { B.g++; A.p++; B.pts += P.v; A.pts += P.d } else { A.n++; B.n++; A.pts += P.n; B.pts += P.n } });
  return Object.values(s).sort((a, b) => b.pts - a.pts || (b.bp - b.bc) - (a.bp - a.bc) || b.bp - a.bp || a.t.localeCompare(b.t));
}
/* ---------- Formats de tournoi ---------- */
const TFMT = { poule: { i: '🔁', n: 'Championnat (poule)', d: 'Tout le monde se rencontre · classement aux points · une poule par niveau (« Niveau 1 · … »)' },
  elim: { i: '🏅', n: 'Élimination directe', d: 'Tableau à élimination · exempts qualifiés d\'office · le vainqueur passe au tour suivant' },
  pyramide: { i: '🔺', n: 'Pyramide des victoires', d: 'On défie une équipe de la ligne juste au-dessus (ou de sa ligne) · victoire = on prend sa place' } };
const tFmt = t => TFMT[t.format] ? t.format : 'poule';
/* Championnat : poules par niveau (équipes « Niveau n · … ») ; une équipe seule dans son niveau rejoint le niveau le plus proche */
const tLvlOf = n => { const x = /^Niveau\s*(\d+)/i.exec(n || ''); return x ? 'Poule niveau ' + x[1] : ''; };
function tPoules(names) {
  const G = {}; names.forEach(n => (G[tLvlOf(n)] = G[tLvlOf(n)] || []).push(n));
  const num = k => +(/\d+$/.exec(k) || [0])[0];
  Object.keys(G).filter(k => G[k].length < 2).forEach(k => { const rest = Object.keys(G).filter(x => x !== k && G[x].length); if (!rest.length) return;
    const dst = rest.sort((a, b) => Math.abs(num(a) - num(k)) - Math.abs(num(b) - num(k)))[0]; G[dst].push(...G[k]); delete G[k]; });
  return Object.fromEntries(Object.keys(G).sort((a, b) => num(a) - num(b)).map(k => [k, G[k]]));
}
/* Élimination directe : tableau recalculé à partir des matchs enregistrés (le dernier match valide de chaque rencontre compte) */
const RNAMES = ['Finale', 'Demi-finales', 'Quarts de finale', '8es de finale', '16es de finale', '32es de finale'];
const elimRounds = t => Math.max(1, ...t.rencontres.map(r => r.round));
const elimName = (t, k) => RNAMES[elimRounds(t) - k] || 'Tour ' + k;
function tElim(t) {
  const recs = DB.matchs.filter(m => m.tid === t.id && m.rid && !m.obsOnly), R = elimRounds(t), out = [];
  for (let k = 1; k <= R; k++) {
    const rs = t.rencontres.filter(r => r.round === k).sort((x, y) => (x.slot || 0) - (y.slot || 0));
    out.push(rs.map((r, i) => {
      const p = out[k - 2], a = k === 1 ? r.a ?? null : (p[2 * i] || {}).w ?? null, b = k === 1 ? r.b ?? null : (p[2 * i + 1] || {}).w ?? null;
      const n = { id: r.id, round: k, a, b, r: { id: r.id, round: k, a, b }, m: null, sc: null, w: null, tie: false, bye: false };
      if (k === 1 && (a == null) !== (b == null)) { n.bye = true; n.w = a ?? b; return n; }
      if (a == null || b == null) return n;
      // seuls les matchs joués par les équipes actuellement qualifiées comptent (un match rejoué en amont invalide la suite)
      recs.forEach(m => { if (m.rid === r.id && ((m.a === a && m.b === b) || (m.a === b && m.b === a)) && (!n.m || (m.date || 0) >= (n.m.date || 0))) n.m = m; });
      if (n.m) { const [x, y] = n.sc = tScore(n.r, n.m); if (x > y) n.w = a; else if (y > x) n.w = b;
        else { n.tie = true; const q = (t.qualif || {})[r.id] ?? n.m.tb; n.w = q === a || q === b ? q : null; } }
      return n;
    }));
  }
  return out;
}
/* Pyramide : classement rejoué à partir de tous les défis enregistrés, dans l'ordre chronologique */
const pyrRow = k => { let r = 0; while ((r + 1) * (r + 2) / 2 <= k) r++; return r; };
const pyrTargets = (ranks, ci) => ranks.map((n, j) => j).filter(j => j < ci && (pyrRow(j) === pyrRow(ci) || pyrRow(j) === pyrRow(ci) - 1));
function tPyr(t) {
  const ranks = [...(t.order || t.teams.map(x => x.name))], log = [];
  DB.matchs.filter(m => m.tid === t.id && m.defi && !m.obsOnly).sort((x, y) => (x.date || 0) - (y.date || 0)).forEach(m => {
    const c = m.defi.challenger, d = m.defi.defie, ci = ranks.indexOf(c), di = ranks.indexOf(d); if (ci < 0 || di < 0 || c === d) return;
    const cs = m.a === c ? +m.sa || 0 : +m.sb || 0, ds = m.a === c ? +m.sb || 0 : +m.sa || 0, won = cs > ds, up = won && ci > di;
    if (up) { ranks.splice(ci, 1); ranks.splice(di, 0, c); }
    log.push({ m, c, d, cs, ds, won, up, from: ci + 1, to: di + 1 });
  });
  return { ranks, log };
}
/* Avancement (carte « Tournois en cours ») */
function tProgress(t) {
  const f = tFmt(t);
  if (f === 'elim') { const E = tElim(t), fin = E[E.length - 1][0], n = E.flat().filter(x => !x.bye && x.w != null).length; return `${n}/${Math.max(0, t.teams.length - 1)} matchs joués${fin && fin.w != null ? ' · 🏆 ' + fin.w : ''}`; }
  if (f === 'pyramide') { const n = tPyr(t).log.length; return `${n} défi${n > 1 ? 's' : ''} joué${n > 1 ? 's' : ''}`; }
  const res = tResults(t); return `${t.rencontres.filter(r => res[r.id]).length}/${t.rencontres.length} matchs joués`;
}
ICONS.match = '<rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="M12 5v14"/><circle cx="12" cy="12" r="2.8"/><path d="M2.5 9.5h2.5v5H2.5M21.5 9.5H19v5h2.5"/>';

const SPORTS = {
  basket:   { name: 'Basket', coll: true, zones: true, shot: 'Panier', type: 'temps', dur: 8,
              score: [{ l: '+1', p: 1, sub: 'lancer franc' }, { l: '+2', p: 2, sub: 'panier' }, { l: '+3', p: 3, sub: 'à 3 points' }] },
  handball: { name: 'Handball', coll: true, zones: true, shot: 'But', type: 'temps', dur: 10, score: [{ l: 'But +1', p: 1 }] },
  football: { name: 'Football', coll: true, zones: false, shot: 'But', type: 'temps', dur: 10, score: [{ l: 'But +1', p: 1 }] },
  rugby:    { name: 'Rugby', coll: true, zones: true, shot: 'Essai', type: 'temps', dur: 10,
              score: [{ l: 'Essai +5', p: 5, try: true }, { l: 'Transfo +2', p: 2 }, { l: 'Pénalité / drop +3', p: 3 }] },
  ultimate: { name: 'Ultimate', coll: true, zones: true, shot: 'Point', type: 'temps', dur: 10, score: [{ l: 'Point +1', p: 1 }] },
  volley:   { name: 'Volley-ball', coll: false, type: 'points', target: 25, ecart: true, score: [{ l: 'Point +1', p: 1 }] },
  badminton:{ name: 'Badminton', coll: false, type: 'points', target: 21, ecart: true, score: [{ l: 'Point +1', p: 1 }] },
  shortennis:{ name: 'Shortennis', coll: false, type: 'points', target: 11, ecart: true, score: [{ l: 'Point +1', p: 1 }] },
  tennis:   { name: 'Tennis', coll: false, type: 'points', target: 11, ecart: true, score: [{ l: 'Point +1', p: 1 }] },
  escrime:  { name: 'Escrime', coll: false, touch: true, type: 'points', target: 5, ecart: false, score: [] },
  tt:       { name: 'Tennis de table', coll: false, type: 'points', target: 11, ecart: true, score: [{ l: 'Point +1', p: 1 }] },
};
const BONUS_VALUES = [1, 2, 3, 5, 10, 100, 1000];
/* Observations individuelles : critères selon le sport */
function obsCrit(sport) {
  const sp = SPORTS[sport];
  if (sp.coll) { const c = [['poss', 'Possession'], ['tir', 'Tirs'], ['but', sp.shot], ['perte', 'Balle perdue']]; if (sport === 'basket') c.push(['reb', 'Rebond']); return c; }
  if (sport === 'volley') return [['serv', 'Service'], ['pt', 'Point marqué'], ['faute', 'Faute']];
  if (sport === 'escrime') return [['touche', 'Touche donnée'], ['recue', 'Touche reçue']];
  return [['pt', 'Point gagné'], ['gagnant', 'Coup gagnant'], ['faute', 'Faute directe']];
}
const obsLine = (o, sport) => obsCrit(sport).map(([k, l]) => `${l.toLowerCase()} ${o.c[k] || 0}`).join(' · ') + (o.c.tir ? ` · réussite ${Math.round((o.c.but || 0) / o.c.tir * 100)} %` : '');
const TOUCH_ZONES = ['Casque', 'Cou', 'Buste', 'Bras', 'Dos'];

/* ---------- Terrains (SVG, orientés en longueur) ---------- */
function courtSVG(sport) {
  const L = 'stroke="#fff" stroke-width="1.4" fill="none"';
  switch (sport) {
    case 'basket': return { vb: '0 0 280 150', bg: '#C98B4A', svg: `<rect x="5" y="5" width="270" height="140" ${L}/><line x1="140" y1="5" x2="140" y2="145" ${L}/><circle cx="140" cy="75" r="18" ${L}/>
      <rect x="5" y="51" width="58" height="48" ${L}/><rect x="217" y="51" width="58" height="48" ${L}/><circle cx="63" cy="75" r="18" ${L}/><circle cx="217" cy="75" r="18" ${L}/>
      <path d="M5 14h14a67 67 0 0 1 0 122H5M275 14h-14a67 67 0 0 0 0 122h14" ${L}/><circle cx="21" cy="75" r="4" stroke="#F26B1D" stroke-width="1.6" fill="none"/><circle cx="259" cy="75" r="4" stroke="#F26B1D" stroke-width="1.6" fill="none"/>` };
    case 'handball': return { vb: '0 0 400 200', bg: '#2F6BD8', svg: `<rect x="5" y="5" width="390" height="190" ${L}/><line x1="200" y1="5" x2="200" y2="195" ${L}/>
      <path d="M5 40a60 60 0 0 1 60 60 60 60 0 0 1-60 60M395 40a60 60 0 0 0-60 60 60 60 0 0 0 60 60" stroke="#fff" stroke-width="1.4" fill="rgba(255,255,255,.12)"/>
      <path d="M5 10a90 90 0 0 1 90 90 90 90 0 0 1-90 90M395 10a90 90 0 0 0-90 90 90 90 0 0 0 90 90" ${L} stroke-dasharray="5 5"/><rect x="0" y="85" width="5" height="30" fill="#fff"/><rect x="395" y="85" width="5" height="30" fill="#fff"/>` };
    case 'football': return { vb: '0 0 315 204', bg: '#2E8B57', svg: `<rect x="5" y="5" width="305" height="194" ${L}/><line x1="157.5" y1="5" x2="157.5" y2="199" ${L}/><circle cx="157.5" cy="102" r="27" ${L}/>
      <rect x="5" y="42" width="50" height="120" ${L}/><rect x="260" y="42" width="50" height="120" ${L}/><rect x="5" y="75" width="17" height="54" ${L}/><rect x="293" y="75" width="17" height="54" ${L}/>
      <path d="M55 82a27 27 0 0 1 0 40M260 82a27 27 0 0 0 0 40" ${L}/><rect x="0" y="91" width="5" height="22" fill="#fff"/><rect x="310" y="91" width="5" height="22" fill="#fff"/>` };
    case 'rugby': return { vb: '0 0 360 210', bg: '#3A9A55', svg: `<rect x="5" y="5" width="350" height="200" ${L}/><rect x="5" y="5" width="30" height="200" fill="rgba(255,255,255,.12)"/><rect x="325" y="5" width="30" height="200" fill="rgba(255,255,255,.12)"/>
      <line x1="35" y1="5" x2="35" y2="205" ${L}/><line x1="325" y1="5" x2="325" y2="205" ${L}/><line x1="101" y1="5" x2="101" y2="205" ${L}/><line x1="259" y1="5" x2="259" y2="205" ${L}/>
      <line x1="180" y1="5" x2="180" y2="205" ${L}/><line x1="150" y1="5" x2="150" y2="205" ${L} stroke-dasharray="5 5"/><line x1="210" y1="5" x2="210" y2="205" ${L} stroke-dasharray="5 5"/>
      <path d="M35 92v26M29 95h12M325 92v26M319 95h12" stroke="#fff" stroke-width="2"/>` };
    case 'ultimate': return { vb: '0 0 400 148', bg: '#2E8B57', svg: `<rect x="4" y="4" width="392" height="140" ${L}/><rect x="4" y="4" width="70" height="140" fill="rgba(255,255,255,.14)"/><rect x="326" y="4" width="70" height="140" fill="rgba(255,255,255,.14)"/>
      <line x1="74" y1="4" x2="74" y2="144" ${L}/><line x1="326" y1="4" x2="326" y2="144" ${L}/><line x1="200" y1="4" x2="200" y2="144" ${L} stroke-dasharray="4 6" opacity=".6"/>` };
    case 'volley': return { vb: '0 0 190 100', bg: '#E08A3C', svg: `<rect x="5" y="5" width="180" height="90" stroke="#fff" stroke-width="1.6" fill="#E9A05A"/><line x1="95" y1="0" x2="95" y2="100" stroke="#fff" stroke-width="3"/>
      <line x1="65" y1="5" x2="65" y2="95" ${L}/><line x1="125" y1="5" x2="125" y2="95" ${L}/>` };
    case 'badminton': return { vb: '0 0 268 122', bg: '#2E8B6B', svg: `<rect x="4" y="4" width="260" height="114" ${L}/><line x1="4" y1="13" x2="264" y2="13" ${L}/><line x1="4" y1="109" x2="264" y2="109" ${L}/>
      <line x1="134" y1="0" x2="134" y2="122" stroke="#fff" stroke-width="3"/><line x1="94" y1="4" x2="94" y2="118" ${L}/><line x1="174" y1="4" x2="174" y2="118" ${L}/><line x1="19" y1="4" x2="19" y2="118" ${L}/><line x1="249" y1="4" x2="249" y2="118" ${L}/>
      <line x1="4" y1="61" x2="94" y2="61" ${L}/><line x1="174" y1="61" x2="264" y2="61" ${L}/>` };
    case 'shortennis': return { vb: '0 0 268 122', bg: '#C8663A', svg: `<rect x="4" y="4" width="260" height="114" ${L}/><line x1="134" y1="0" x2="134" y2="122" stroke="#fff" stroke-width="3"/>
      <line x1="94" y1="4" x2="94" y2="118" ${L}/><line x1="174" y1="4" x2="174" y2="118" ${L}/><line x1="4" y1="61" x2="94" y2="61" ${L}/><line x1="174" y1="61" x2="264" y2="61" ${L}/>` };
    case 'tennis': return { vb: '0 0 250 124', bg: '#3C7BE0', svg: `<rect x="6" y="6" width="238" height="112" stroke="#fff" stroke-width="1.6" fill="#2E62B8"/><line x1="6" y1="20" x2="244" y2="20" ${L}/><line x1="6" y1="104" x2="244" y2="104" ${L}/>
      <line x1="125" y1="0" x2="125" y2="124" stroke="#fff" stroke-width="3"/><line x1="61" y1="20" x2="61" y2="104" ${L}/><line x1="189" y1="20" x2="189" y2="104" ${L}/><line x1="61" y1="62" x2="189" y2="62" ${L}/>` };
    case 'escrime': return { vb: '0 0 300 60', bg: '#26324A', svg: `<rect x="10" y="14" width="280" height="32" fill="#8E9BB0"/>
      <rect x="10" y="14" width="40" height="32" fill="#C0504D" opacity=".75"/><rect x="250" y="14" width="40" height="32" fill="#C0504D" opacity=".75"/>
      <rect x="10" y="14" width="280" height="32" ${L}/><line x1="150" y1="14" x2="150" y2="46" stroke="#fff" stroke-width="2"/>
      <line x1="110" y1="14" x2="110" y2="46" ${L}/><line x1="190" y1="14" x2="190" y2="46" ${L}/>
      <text x="150" y="10" text-anchor="middle" font-size="7" fill="#fff" opacity=".8">ligne médiane</text><text x="110" y="56" text-anchor="middle" font-size="6.5" fill="#fff" opacity=".8">en garde</text><text x="190" y="56" text-anchor="middle" font-size="6.5" fill="#fff" opacity=".8">en garde</text>
      <text x="30" y="56" text-anchor="middle" font-size="6.5" fill="#fff" opacity=".8">avertissement</text><text x="270" y="56" text-anchor="middle" font-size="6.5" fill="#fff" opacity=".8">avertissement</text>` };
    case 'tt': return { vb: '0 0 274 152', bg: '#1F2A44', svg: `<rect x="6" y="6" width="262" height="140" fill="#1E5BD8" stroke="#fff" stroke-width="2.5"/><line x1="6" y1="76" x2="268" y2="76" stroke="#fff" stroke-width="1"/>
      <line x1="137" y1="0" x2="137" y2="152" stroke="#fff" stroke-width="3.5"/>` };
  }
}

document.head.insertAdjacentHTML('beforeend', `<style>
.court{position:relative;border-radius:14px;overflow:hidden;box-shadow:var(--shadow)}
.court svg{display:block;width:100%;height:auto}
.zone-band{cursor:pointer}
.zone-band:active{fill:rgba(255,255,255,.35)}
.sb{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center}
.sb .tm{border-radius:16px;padding:10px 6px;text-align:center;color:#fff}
.sb .tm.a{background:linear-gradient(160deg,#D4AF37,#9C7A1E)}
.sb .tm.b{background:linear-gradient(160deg,#3C7BE0,#0B2A5B)}
.sb .tm b{display:block;font-size:clamp(2.4rem,12vw,4rem);line-height:1;font-variant-numeric:tabular-nums}
.sb .tm span{font-weight:800;font-size:.85rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb .ck{text-align:center}
.sb .ck b{font-size:1.6rem;font-variant-numeric:tabular-nums}
.act{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.act .col{display:flex;flex-direction:column;gap:6px}
.act h4{margin:0;text-align:center;font-size:.85rem;padding:6px;border-radius:10px;color:#fff}
.act .ca h4{background:#B8912A}.act .cb h4{background:#1E5BD8}
.act button{padding:11px 6px;border-radius:12px;font-weight:800;font-size:.85rem;border:1.5px solid var(--line);background:var(--card);line-height:1.15}
.act button small{display:block;font-weight:600;font-size:.68rem;color:var(--muted)}
.act button.sc{background:var(--grad);color:#fff;border:none}
.act button.sc small{color:rgba(255,255,255,.85)}
.bn{display:flex;flex-wrap:wrap;gap:5px}
.bn button{flex:1 1 30%;padding:8px 2px;font-size:.78rem}
.poss{display:flex;gap:8px;align-items:center;margin:10px 0 8px;font-weight:800;font-size:.85rem}
.poss button{flex:1;padding:9px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800}
.poss button.on.a{background:#B8912A;color:#fff;border-color:transparent}
.poss button.on.b{background:#1E5BD8;color:#fff;border-color:transparent}
.tog{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.tog button{padding:9px 12px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.85rem}
.tog button.on{background:var(--grad);color:#fff;border-color:transparent}
.pl-chip{padding:6px 10px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);font-weight:700;font-size:.82rem;cursor:pointer}
.pl-chip.sel{background:var(--grad);color:#fff;border-color:transparent}
.mt-team{cursor:pointer}
.mt-team .pls{display:flex;flex-wrap:wrap;gap:5px}
.roster{font-size:.75rem;color:var(--muted);text-align:center;margin-top:4px}
.mo-clock{font-size:clamp(3.4rem,18vw,6.5rem);font-weight:900;text-align:center;font-variant-numeric:tabular-nums;line-height:1.05;padding:6px 0}
.mo-vs{display:flex;gap:8px;align-items:center;justify-content:center;font-weight:900;font-size:1.15rem}
.mo-vs span{padding:6px 12px;border-radius:12px;color:#fff;max-width:42%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;margin-top:12px}
.mo-grid select{padding:10px;font-weight:800;font-size:1.05rem}
.mo-row{display:flex;gap:8px;margin-top:8px}
.mo-row button{border-radius:14px;font-weight:800;min-height:62px}
.mo-row .m{flex:0 0 62px;font-size:1.7rem;border:2px solid var(--line);background:var(--card);color:var(--text)}
.mo-row .p{flex:1;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 16px;font-size:1.12rem;border:none;background:var(--grad);color:#fff;text-align:left}
.mo-row .p b{font-size:1.8rem;font-variant-numeric:tabular-nums}
.tn-r{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;padding:10px 0 6px;font-weight:800;font-size:1.05rem}
.tn-r .ta{text-align:right;color:#9C7A1E}.tn-r .tb{color:#1E5BD8}
.tn-sc{padding:8px 14px;border-radius:12px;border:none;background:var(--grad);color:#fff;font-weight:900;font-size:1.2rem;font-variant-numeric:tabular-nums;cursor:pointer}
.tn-go{padding:15px!important;font-size:1.1rem!important;margin-bottom:6px}
.tn-it{display:flex;align-items:center;gap:10px;width:100%;padding:14px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);color:var(--text);text-align:left;margin-top:8px;cursor:pointer}
.tn-it b{font-size:1.05rem}
.tn-tag{display:inline-block;padding:1px 8px;border-radius:99px;background:#F4E7BE;color:#7A5C10;font-size:.72rem;font-weight:800;margin-left:6px;vertical-align:middle}
.tn-fmts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:6px}
.tn-fmt{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:14px;border-radius:16px;border:2px solid var(--line);background:var(--card);color:var(--text);text-align:left;cursor:pointer;min-height:110px}
.tn-fmt b{font-size:1.05rem}.tn-fmt span.i{font-size:1.8rem;line-height:1}.tn-fmt small{color:var(--muted);font-size:.78rem;line-height:1.3}
.tn-fmt.on{border-color:transparent;background:var(--grad);color:#fff}.tn-fmt.on small{color:rgba(255,255,255,.9)}
.tn-br{display:flex;gap:14px;overflow-x:auto;padding:4px 2px 10px}
.tn-br .rd{min-width:150px;flex:1;display:flex;flex-direction:column;justify-content:space-around;gap:10px}
.tn-br h4{margin:0 0 2px;text-align:center;font-size:.8rem;color:var(--muted)}
.tn-br .mt{border:1.5px solid var(--line);border-radius:12px;background:var(--card);overflow:hidden;font-size:.85rem}
.tn-br .mt div{display:flex;justify-content:space-between;gap:6px;padding:6px 9px;font-weight:700}
.tn-br .mt div+div{border-top:1px solid var(--line)}
.tn-br .mt .w{background:var(--grad);color:#fff}.tn-br .mt .l{opacity:.5}.tn-br .mt .e{color:var(--muted);font-weight:600;font-style:italic}
.tn-champ{text-align:center;font-size:1.5rem;font-weight:900;padding:18px;border-radius:18px;background:linear-gradient(160deg,#D4AF37,#9C7A1E);color:#fff;margin-top:12px;box-shadow:var(--shadow)}
.tn-q{display:flex;gap:8px;margin:4px 0 8px}.tn-q button{flex:1;padding:12px 6px;font-weight:800}
.tn-pyr{display:flex;flex-direction:column;gap:8px;align-items:center}
.tn-pyr .pr{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;width:100%}
.tn-pyr .pc{min-width:120px;max-width:200px;flex:0 1 180px;padding:10px 8px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);text-align:center;font-weight:800}
.tn-pyr .pc small{display:block;color:var(--muted);font-size:.72rem}
.tn-pyr .pr:first-child .pc{background:linear-gradient(160deg,#D4AF37,#9C7A1E);color:#fff;border-color:transparent}.tn-pyr .pr:first-child .pc small{color:#fff}
.tn-pyr .pc.c{outline:3px solid #B8912A}.tn-pyr .pc.d{outline:3px solid #1E5BD8}
.win{text-align:center;font-size:1.3rem;font-weight:900;padding:14px;border-radius:16px;background:var(--grad);color:#fff}
</style>`);

const RLA_BOX = '<details class="card" style="margin-top:12px"><summary style="font-weight:800;cursor:pointer">🏉 Ligne d\'avantage : recueil individuel (recule / avance / bloque)</summary><div id="rla-host" style="margin-top:10px"></div></details>';

TOOL_IMPL.match = function (el) {
  let S = { sport: 'handball', a: 'Équipe A', b: 'Équipe B', type: 'temps', dur: 10, target: 21, ecart: true, bonus: [1, 2, 5], stats: true, zones: false, nz: 4, ia: 0, ib: 1, obsOn: false, obsN: 2, role: (DB.tablette && DB.tablette.match && DB.tablette.match.role) || 'table' };
  let selPl = null;
  let M = null, iv = null;
  const SP = () => SPORTS[S.sport];

  /* ===== 1. Paramètres ===== */
  function setup() {
    clearInterval(iv); M = null; S.view = null;
    const sp = SP(), lt = S.tid && TR().find(x => x.id === S.tid), lr = lt && S.rid && lt.rencontres.find(r => r.id === S.rid);
    if (S.tid && !lt) S.tid = S.rid = null;                     // tournoi supprimé entre-temps
    const recent = TR().filter(x => x.date >= Date.now() - 7 * 864e5).sort((x, y) => y.date - x.date);
    el.innerHTML = `${lt ? `<div class="card" style="margin-bottom:12px;border:2px solid #B8912A"><h3>🏆 ${esc(lt.nom)}</h3>
        <div class="mo-vs" style="margin:6px 0"><span style="background:#B8912A">${esc(S.a)}</span><span class="muted" style="color:var(--muted);padding:0">vs</span><span style="background:#1E5BD8">${esc(S.b)}</span></div>
        <div class="muted" style="text-align:center;font-size:.85rem">${S.defi ? `🔺 Défi de la pyramide · ${esc(S.defi.challenger)} défie ${esc(S.defi.defie)} · compte pour le classement` : lr ? `${tFmt(lt) === 'elim' ? `🏅 ${elimName(lt, lr.round)} · le vainqueur se qualifie` : `Rencontre du tour ${lr.round}${lr.g ? ' · ' + esc(lr.g) : ''} · compte pour le classement`}` : 'Match amical · hors classement'} · ${esc(SPORTS[lt.sport]?.name || '')}</div>
        <button class="btn btn-grad btn-block" style="margin-top:10px;padding:16px;font-size:1.1rem" id="go2">▶ Lancer le match</button>
        <div class="row" style="margin-top:8px"><button class="btn btn-ghost" id="tl-bk">← Retour au tournoi</button><button class="btn btn-ghost" id="tl-x">✕ Délier du tournoi</button></div></div>` : ''}
      ${recent.length ? `<div class="card" style="margin-bottom:12px"><h3>🏆 Tournois en cours</h3>${recent.map(x => `<button class="tn-it" data-tv="${x.id}"><span style="font-size:1.6rem" title="${TFMT[tFmt(x)].n}">${TFMT[tFmt(x)].i}</span><span style="flex:1"><b>${esc(x.nom)}</b><div class="muted" style="font-size:.8rem">${TFMT[tFmt(x)].n} · ${esc(SPORTS[x.sport]?.name || x.sport)}${x.classe ? ' · ' + esc(x.classe) : ''} · ${x.teams.length} équipes · ${esc(tProgress(x))} · ${new Date(x.date).toLocaleDateString('fr-FR')}</div></span><span style="font-size:1.3rem">›</span></button>`).join('')}</div>` : ''}
      <div class="card"><h3>Sport</h3><div class="tog" id="sp">${Object.entries(SPORTS).map(([k, x]) => `<button data-s="${k}" class="${k === S.sport ? 'on' : ''}">${x.name}</button>`).join('')}</div></div>
      <div class="court" style="margin-top:12px;background:${courtSVG(S.sport).bg}"><svg viewBox="${courtSVG(S.sport).vb}">${courtSVG(S.sport).svg}</svg></div>
      <div class="card" style="margin-top:12px"><h3>Équipes</h3>
        <details id="mt-d" ${DB.classes.length && !DB.matchTeams ? 'open' : ''}><summary style="font-weight:800;cursor:pointer">👥 Constituer les équipes avec les élèves d'une classe</summary><div id="mt-host" style="margin-top:6px"></div></details>
        ${teamsBlock()}
        <div class="row"><div><label>Nom équipe A</label><input id="na" value="${esc(S.a)}"></div><div><label>Nom équipe B</label><input id="nb" value="${esc(S.b)}"></div></div></div>
      <div class="card" style="margin-top:12px"><h3>Règles du match</h3>
        <div class="tog" id="ty"><button data-t="temps" class="${S.type === 'temps' ? 'on' : ''}">⏱ Match au temps</button><button data-t="points" class="${S.type === 'points' ? 'on' : ''}">🎯 Match au point</button></div>
        ${S.type === 'temps' ? `<label>Durée (minutes)</label><input id="du" type="number" min="1" value="${S.dur}">`
          : `<label>Points à atteindre</label><input id="tg" type="number" min="1" value="${S.target}"><label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="ec" ${S.ecart ? 'checked' : ''} style="width:auto"> 2 points d'écart pour gagner</label>`}
        <label>Boutons « points bonus » à afficher</label><div class="tog" id="bo">${BONUS_VALUES.map(v => `<button data-b="${v}" class="${S.bonus.includes(v) ? 'on' : ''}">+${v}</button>`).join('')}</div>
        ${sp.coll ? `<label style="display:flex;gap:8px;align-items:center;margin-top:14px"><input type="checkbox" id="st" ${S.stats ? 'checked' : ''} style="width:auto"> Statistiques : tirs tentés, ${sp.shot === 'Essai' ? 'essais' : sp.shot === 'Panier' ? 'paniers' : sp.shot === 'Point' ? 'points' : 'buts'} marqués, pertes de balle, passes décisives</label>` : ''}
        ${sp.zones ? `<label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="zo" ${S.zones ? 'checked' : ''} style="width:auto"> Zones visées (progression du ballon sur le terrain)</label>
          <div id="nzw" style="display:${S.zones ? 'block' : 'none'}"><label>Nombre de zones dans la longueur</label><div class="tog" id="nz">${[3, 4, 5].map(n => `<button data-n="${n}" class="${S.nz === n ? 'on' : ''}">${n} zones</button>`).join('')}</div></div>` : ''}
        <label style="display:flex;gap:8px;align-items:center;margin-top:14px"><input type="checkbox" id="ob" ${S.obsOn ? 'checked' : ''} style="width:auto"> Observations individuelles : ${obsCrit(S.sport).map(c => c[1].toLowerCase()).join(', ')}</label>
        <div id="obw" style="display:${S.obsOn ? 'block' : 'none'}"><label>Nombre de joueurs observés</label><div class="tog" id="obn">${[2, 3, 4].map(n => `<button data-on="${n}" class="${S.obsN === n ? 'on' : ''}">${n} joueurs</button>`).join('')}</div>
          <label>Rôle de cette tablette</label><div class="tog" id="ro"><button data-ro="table" class="${S.role !== 'obs' ? 'on' : ''}">🏁 Table de marque (complet)</button><button data-ro="obs" class="${S.role === 'obs' ? 'on' : ''}">👁 Observateurs (élèves)</button></div>
          <p class="muted" style="font-size:.78rem;margin:6px 0 0">📱 Observateurs : les élèves ne voient que le chrono et les fiches des joueurs observés (réglage propre à cet appareil).</p></div>
      </div>
      ${S.sport === 'rugby' ? RLA_BOX : ''}
      <button class="btn btn-grad btn-block" style="margin-top:14px;padding:16px;font-size:1.05rem" id="go">▶ Lancer le match</button>
      <div class="section-title"><h2>Historique des matchs</h2>${DB.matchs.length ? '<button class="link" id="hx">Exporter CSV</button>' : ''}</div>
      <div class="card" style="padding:0">${DB.matchs.length ? DB.matchs.slice().reverse().slice(0, 15).map((m, j) => { const i = DB.matchs.length - 1 - j;
        return `<div class="list-item"><div style="flex:1"><b>${m.obsOnly ? `👁 Observations · ${esc(m.a)} vs ${esc(m.b)}` : `${esc(m.a)} ${m.sa} – ${m.sb} ${esc(m.b)}`}</b>${m.tid ? `<span class="tn-tag">🏆 ${esc((TR().find(x => x.id === m.tid) || {}).nom || m.tn || 'Tournoi')}${m.defi && !m.obsOnly ? ' · défi' : m.tid && !m.rid && !m.obsOnly ? ' · amical' : ''}</span>` : ''}<div class="muted">${esc(SPORTS[m.sport]?.name || m.sport)} · ${new Date(m.date).toLocaleDateString('fr-FR')} ${new Date(m.date).toLocaleTimeString('fr-FR').slice(0, 5)}</div></div><button class="btn btn-ghost" data-v="${i}">👁</button><button class="btn btn-ghost" data-x="${i}">🗑</button></div>`; }).join('') : '<div class="empty">Aucun match enregistré.</div>'}</div>`;
    const $ = s => el.querySelector(s);
    const keep = () => { S.a = $('#na').value.trim() || 'Équipe A'; S.b = $('#nb').value.trim() || 'Équipe B';
      if ($('#du')) S.dur = Math.max(1, +$('#du').value || 1); if ($('#tg')) S.target = Math.max(1, +$('#tg').value || 1); if ($('#ec')) S.ecart = $('#ec').checked;
      if ($('#st')) S.stats = $('#st').checked; if ($('#zo')) S.zones = $('#zo').checked; S.obsOn = $('#ob').checked; };
    el.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { keep(); S.sport = b.dataset.s; const sp = SP(); S.type = sp.type; if (sp.dur) S.dur = sp.dur; if (sp.target) S.target = sp.target; S.ecart = !!sp.ecart; if (!sp.zones) S.zones = false; setup(); });
    el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { keep(); S.type = b.dataset.t; setup(); });
    el.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { const v = +b.dataset.b; S.bonus = S.bonus.includes(v) ? S.bonus.filter(x => x !== v) : [...S.bonus, v].sort((x, y) => x - y); b.classList.toggle('on'); });
    el.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { S.nz = +b.dataset.n; el.querySelectorAll('[data-n]').forEach(x => x.classList.toggle('on', x === b)); });
    if ($('#zo')) $('#zo').onchange = () => $('#nzw').style.display = $('#zo').checked ? 'block' : 'none';
    $('#ob').onchange = () => $('#obw').style.display = $('#ob').checked ? 'block' : 'none';
    el.querySelectorAll('[data-on]').forEach(b => b.onclick = () => { S.obsN = +b.dataset.on; el.querySelectorAll('[data-on]').forEach(x => x.classList.toggle('on', x === b)); });
    el.querySelectorAll('[data-ro]').forEach(b => b.onclick = () => { S.role = b.dataset.ro; DB.tablette = DB.tablette || {}; DB.tablette.match = { ...(DB.tablette.match || {}), role: S.role }; save();
      el.querySelectorAll('[data-ro]').forEach(x => x.classList.toggle('on', x === b)); });
    $('#go').onclick = () => { keep(); start(); };
    if ($('#go2')) $('#go2').onclick = () => { keep(); start(); };
    if ($('#tl-x')) $('#tl-x').onclick = () => { keep(); unlinkT(); setup(); };
    if ($('#tl-bk')) $('#tl-bk').onclick = () => { keep(); tview(S.tid); };
    el.querySelectorAll('[data-tv]').forEach(b => b.onclick = () => { keep(); tview(b.dataset.tv); });
    wireTeams();
    mountRLA();
    el.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { if (confirm('Supprimer ce match de l\'historique ?')) { DB.matchs.splice(+b.dataset.x, 1); save(); setup(); } });
    el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => summary(DB.matchs[+b.dataset.v], true));
    if ($('#hx')) $('#hx').onclick = () => download(`matchs-${new Date().toISOString().slice(0, 10)}.csv`, csv([
      ['Date', 'Sport', 'Équipe A', 'Score A', 'Score B', 'Équipe B', 'Tirs A', 'Marqués A', 'Pertes A', 'Passes déc. A', 'Bonus A', 'Tirs B', 'Marqués B', 'Pertes B', 'Passes déc. B', 'Bonus B', 'Joueurs A', 'Joueurs B'],
      ...DB.matchs.map(m => [new Date(m.date).toLocaleString('fr-FR'), SPORTS[m.sport]?.name || m.sport, m.a, m.sa, m.sb, m.b, ...[0, 1].flatMap(t => { const s = m.stats[t]; return [s.tirs, s.marques, s.pertes, s.passes, s.bonus]; }), (m.pa || []).join(', '), (m.pb || []).join(', ')])]));
  }

  /* ----- Observations individuelles (2 à 4 joueurs) ----- */
  function drawObs() {
    const h = el.querySelector('#obs-host'); if (!h || !M) return;
    const C = obsCrit(S.sport), pool = [...M.pa.map(n => [n, 0]), ...M.pb.map(n => [n, 1])];
    if (!M.obs) M.obs = Array.from({ length: S.obsN }, (_, i) => ({ name: pool[i] ? pool[i][0] : '', team: pool[i] ? pool[i][1] : 0, c: {} }));
    h.innerHTML = `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">${M.obs.map((o, i) => `<div class="card" style="padding:8px;border-top:4px solid ${o.team ? '#1E5BD8' : '#B8912A'}">
        ${pool.length ? `<select data-op="${i}" style="padding:6px;font-weight:700">${pool.map(([n, t]) => `<option value="${t}|${esc(n)}" ${n === o.name ? 'selected' : ''}>${esc(n)} (${esc(t ? S.b : S.a)})</option>`).join('')}</select>`
          : `<input data-oi="${i}" value="${esc(o.name)}" placeholder="Joueur ${i + 1}" style="padding:6px;font-weight:700">`}
        <div style="display:flex;flex-direction:column;gap:5px;margin-top:6px">${C.map(([k, l]) => `<div style="display:flex;gap:4px;align-items:center"><button class="btn btn-ghost" style="flex:0 0 32px;padding:8px 0" data-om="${i}|${k}">−</button>
          <button class="btn btn-grad" style="flex:1;padding:8px 4px;font-size:.8rem;justify-content:space-between;display:flex" data-oa="${i}|${k}"><span>${k === 'tir' ? 'Tir raté' : l}</span><b>${k === 'tir' ? (o.c.tir || 0) - (o.c.but || 0) : o.c[k] || 0}</b></button></div>`).join('')}</div>
        ${o.c.tir ? `<div class="muted" style="font-size:.72rem;margin-top:4px">Réussite ${Math.round((o.c.but || 0) / o.c.tir * 100)} %</div>` : ''}</div>`).join('')}</div>
      ${pool.length ? '' : '<p class="muted" style="font-size:.78rem;margin:6px 0 0">Astuce : constituez les équipes avec les élèves pour choisir les joueurs dans une liste.</p>'}`;
    h.querySelectorAll('[data-op]').forEach(x => x.onchange = () => { const [t, n] = x.value.split('|'); Object.assign(M.obs[+x.dataset.op], { name: n, team: +t }); drawObs(); });
    h.querySelectorAll('[data-oi]').forEach(x => x.onchange = () => { M.obs[+x.dataset.oi].name = x.value.trim(); });
    h.querySelectorAll('[data-oa]').forEach(b => b.onclick = () => { const [i, k] = b.dataset.oa.split('|'), c = M.obs[+i].c; c[k] = (c[k] || 0) + 1; if (k === 'but') c.tir = (c.tir || 0) + 1; beep(1000, .03, .15); drawObs(); });
    h.querySelectorAll('[data-om]').forEach(b => b.onclick = () => { const [i, k] = b.dataset.om.split('|'), c = M.obs[+i].c; if (k === 'tir' && (c.tir || 0) <= (c.but || 0)) return; c[k] = Math.max(0, (c[k] || 0) - 1); if (k === 'but') c.tir = Math.max(0, (c.tir || 0) - 1); drawObs(); });
  }

  /* ----- Rugby : ligne d'avantage intégrée ----- */
  const mountRLA = () => { const h = el.querySelector('#rla-host'); if (h && TOOL_IMPL.rugbyla) TOOL_IMPL.rugbyla(h); };

  /* ----- Équipes constituées avec les élèves ----- */
  const T = () => DB.matchTeams && DB.matchTeams.teams && DB.matchTeams.teams.length ? DB.matchTeams : null;
  const freeOf = t => { const placed = new Set(t.teams.flatMap(x => x.members)); return t.cls ? studentsOf(t.cls).filter(n => !placed.has(n)) : []; };
  const membersOf = i => (T() && T().teams[i] ? T().teams[i].members : []);
  function teamsBlock() {
    const t = T(); if (!t) return '';
    if (S.ia >= t.teams.length) S.ia = 0; if (S.ib >= t.teams.length || S.ib === S.ia) S.ib = S.ia === 0 ? Math.min(1, t.teams.length - 1) : 0;
    const opt = sel => t.teams.map((x, i) => `<option value="${i}" ${i === sel ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
    return `<div style="margin-top:10px"><div class="muted" style="font-size:.8rem">${t.cls ? 'Classe ' + esc(t.cls) + ' · ' : ''}touchez un élève puis une autre équipe pour le déplacer, ou « Non placés / absents » pour le retirer.</div>
      <div class="teams">${t.teams.map((x, i) => `<div class="card team mt-team" data-tm="${i}" style="border-top:5px solid ${i === S.ia ? '#B8912A' : i === S.ib ? '#1E5BD8' : 'var(--line)'}">
        <h3><span>${esc(x.name)}${i === S.ia ? ' · A' : i === S.ib ? ' · B' : ''}</span><span class="muted">${x.members.length}</span></h3>
        <div class="pls">${x.members.map((n, j) => `<button class="pl-chip ${selPl === i + '|' + j ? 'sel' : ''}" data-pl="${i}|${j}">${esc(n)}</button>`).join('') || '<span class="muted">—</span>'}</div></div>`).join('')}
        ${(() => { const fr = freeOf(t); return `<div class="card team mt-team" data-tm="-1" style="border-top:5px dashed var(--line);background:var(--grad-soft)"><h3><span>Non placés / absents</span><span class="muted">${fr.length}</span></h3>
          <div class="pls">${fr.map((n, j) => `<button class="pl-chip ${selPl === '-1|' + j ? 'sel' : ''}" data-pl="-1|${j}">${esc(n)}</button>`).join('') || '<span class="muted">—</span>'}</div></div>`; })()}</div>
      ${t.teams.length > 1 ? `<div class="row"><div><label>Équipe A (sur le terrain)</label><select id="ia">${opt(S.ia)}</select></div><div><label>Équipe B</label><select id="ib">${opt(S.ib)}</select></div></div>` : ''}
      ${t.teams.length > 1 ? '<button class="btn btn-grad btn-block" style="margin-top:10px;padding:13px" id="mt-tn">🏆 Créer un tournoi avec ces équipes (partagé avec les tablettes)</button>' : ''}
      <div class="row" style="margin-top:8px"><button class="btn btn-ghost" id="mt-ed">✏️ Modifier / supprimer des équipes</button><button class="btn btn-ghost" id="mt-clr">🗑 Supprimer toutes les équipes</button></div></div>`;
  }
  function wireTeams() {
    const $ = s => el.querySelector(s);
    const host = $('#mt-host');
    if (host) { mountComposer(host, { id: 'mt', modes: ['random', 'hetero', 'homo'], button: '🧩 Former les équipes',
      onTeams: teams => { const $n = s => el.querySelector(s); if ($n('#na')) { S.a = $n('#na').value; S.b = $n('#nb').value; }
        unlinkT(); DB.matchTeams = { cls: el.querySelector('#mt-cls')?.value || '', teams: teams.map(x => ({ name: x.name, members: x.members.map(m => m.n) })) };
        S.ia = 0; S.ib = teams.length > 1 ? 1 : 0; S.a = teams[S.ia].name; S.b = teams[S.ib].name; selPl = null; save(); setup(); } });
      const v = el.querySelector('#mt-v'); if (v && !DB.matchTeams) v.value = 2; }
    const t = T(); if (!t) return;
    const pick = (k, i) => { unlinkT(); S.a = $('#na').value; S.b = $('#nb').value; S[k] = i; if (k === 'ia') S.a = t.teams[i].name; else S.b = t.teams[i].name; setup(); };
    if ($('#ia')) $('#ia').onchange = e => pick('ia', +e.target.value);
    if ($('#ib')) $('#ib').onchange = e => pick('ib', +e.target.value);
    el.querySelectorAll('[data-pl]').forEach(b => b.onclick = ev => { ev.stopPropagation(); selPl = selPl === b.dataset.pl ? null : b.dataset.pl; S.a = $('#na').value; S.b = $('#nb').value; setup(); });
    el.querySelectorAll('[data-tm]').forEach(c => c.onclick = () => { if (!selPl) return; const [i, j] = selPl.split('|').map(Number), k = +c.dataset.tm; selPl = null;
      if (k !== i) { const n = i < 0 ? freeOf(t)[j] : t.teams[i].members.splice(j, 1)[0]; if (n && k >= 0) t.teams[k].members.push(n); save(); } S.a = $('#na').value; S.b = $('#nb').value; setup(); });
    $('#mt-ed').onclick = () => { S.a = $('#na').value; S.b = $('#nb').value; editGroupsPanel('Équipes', { cls: t.cls, list: () => DB.matchTeams.teams, names: x => x.members,
      take: (x, n) => { x.members.splice(x.members.indexOf(n), 1); }, put: (x, n) => x.members.push(n), make: name => ({ name: name.replace('Groupe', 'Équipe'), members: [] }),
      onChange: save, onClose: () => { if (!DB.matchTeams.teams.length) { DB.matchTeams = null; S.a = 'Équipe A'; S.b = 'Équipe B'; } else { const L = DB.matchTeams.teams.length; if (S.ia >= L) S.ia = 0; if (S.ib >= L) S.ib = Math.min(1, L - 1); } save(); setup(); } }); };
    if ($('#mt-tn')) $('#mt-tn').onclick = () => { S.a = $('#na').value; S.b = $('#nb').value; createT(t); };
    $('#mt-clr').onclick = () => { if (!confirm('Effacer la composition des équipes ?')) return; DB.matchTeams = null; selPl = null; S.a = 'Équipe A'; S.b = 'Équipe B'; save(); setup(); };
  }

  /* ===== Tournoi partagé entre les tablettes (DB.tournois, synchronisé) ===== */
  /* Formats : championnat (poules par niveau), élimination directe, pyramide des victoires */
  const unlinkT = () => { S.tid = S.rid = null; S.pa = S.pb = null; S.defi = null; };
  const tlink = () => { const t = S.tid && TR().find(x => x.id === S.tid); return t ? { tid: t.id, rid: S.rid || null, tn: t.nom, ...(S.defi ? { defi: { ...S.defi } } : {}) } : {}; };
  const afterSave = m => { unlinkT(); if (m.tid && TR().some(x => x.id === m.tid)) tview(m.tid); else setup(); };
  function createT(tm) {
    const seen = {}, teams = tm.teams.filter(x => x.name || x.members.length).map((x, i) => { let n = (x.name || '').trim() || 'Équipe ' + (i + 1); if (seen[n]) n += ' (' + (++seen[n]) + ')'; else seen[n] = 1; return { name: n, members: [...x.members] }; });
    if (teams.length < 2) return toast('Au moins 2 équipes');
    const def = `Tournoi ${tm.cls ? tm.cls + ' · ' : '· '}${SP().name}`, names = teams.map(x => x.name), G = tPoules(names), gk = Object.keys(G);
    const C = { nom: def, format: 'poule', v: 3, n: 2, d: 1, mx: false };
    const $ = q => el.querySelector(q);
    const keepC = () => { C.nom = $('#c-nom').value; if ($('#c-v')) { C.v = +$('#c-v').value || 0; C.n = +$('#c-n').value || 0; C.d = +$('#c-d').value || 0; } if ($('#c-mx')) C.mx = $('#c-mx').checked; };
    const draw = () => {
      clearInterval(iv); M = null;
      const size = 2 ** Math.ceil(Math.log2(teams.length)), nbR = gk.reduce((a, g) => a + G[g].length * (G[g].length - 1) / 2, 0);
      const opts = C.format === 'poule' ? `<label>Points au classement</label><div class="row"><div><label>Victoire</label><input id="c-v" type="number" value="${C.v}"></div><div><label>Nul</label><input id="c-n" type="number" value="${C.n}"></div><div><label>Défaite</label><input id="c-d" type="number" value="${C.d}"></div></div>
          <p class="muted" style="font-size:.82rem;margin:8px 0 0">${gk.length > 1 ? `🎚 ${gk.length} poules par niveau (équipes « Niveau 1 · … », « Niveau 2 · … ») · ` : ''}${nbR} rencontres${gk.length > 1 ? '' : ' · tout le monde se rencontre une fois'}.</p>`
        : `<label style="display:flex;gap:8px;align-items:center;margin-top:14px"><input type="checkbox" id="c-mx" ${C.mx ? 'checked' : ''} style="width:auto"> ${C.format === 'elim' ? 'Mélanger au hasard' : 'Placement de départ au hasard'}</label>
          <p class="muted" style="font-size:.82rem;margin:8px 0 0">${C.format === 'elim' ? `Tableau de ${size} · ${teams.length - 1} matchs${size > teams.length ? ` · ${size - teams.length} équipe${size - teams.length > 1 ? 's' : ''} exempte${size - teams.length > 1 ? 's' : ''} au 1er tour (qualifiée${size - teams.length > 1 ? 's' : ''} d'office)` : ''}.`
            : 'Sans placement au hasard, l\'ordre des équipes ci-dessous donne le classement de départ (1re = sommet de la pyramide).'}</p>`;
      const list = ns => ns.map((n, i) => `<div class="list-item">${C.format === 'pyramide' && !C.mx ? `<span class="muted" style="width:28px">#${i + 1}</span>` : ''}<b style="flex:1">${esc(n)}</b><span class="muted" style="font-size:.8rem">${(teams.find(x => x.name === n) || {}).members?.length || 0} élèves</span></div>`).join('');
      el.innerHTML = `<button class="btn btn-ghost" id="c-bk">← Annuler</button>
        <div class="card" style="margin-top:10px;border-top:6px solid #B8912A"><h3>🏆 Nouveau tournoi · ${esc(SP().name)}</h3>
          <label>Nom du tournoi (visible sur toutes les tablettes)</label><input id="c-nom" value="${esc(C.nom)}" style="font-weight:800;font-size:1.05rem">
          <label>Format du tournoi</label><div class="tn-fmts">${Object.entries(TFMT).map(([k, f]) => `<button class="tn-fmt ${C.format === k ? 'on' : ''}" data-fmt="${k}"><span class="i">${f.i}</span><b>${f.n}</b><small>${f.d}</small></button>`).join('')}</div>
          ${opts}</div>
        ${C.format === 'poule' && gk.length > 1 ? gk.map(g => `<div class="card" style="margin-top:12px;padding:10px 14px"><h3 style="margin:0">${esc(g || 'Autres équipes')} · ${G[g].length} équipes</h3>${list(G[g])}</div>`).join('')
          : `<div class="card" style="margin-top:12px;padding:10px 14px"><h3 style="margin:0">Équipes · ${teams.length}</h3>${list(names)}</div>`}
        <button class="btn btn-grad btn-block" id="c-ok" style="margin-top:14px;padding:17px;font-size:1.15rem">✔ Créer le tournoi</button>`;
      $('#c-bk').onclick = setup;
      el.querySelectorAll('[data-fmt]').forEach(b => b.onclick = () => { keepC(); C.format = b.dataset.fmt; draw(); });
      if ($('#c-mx')) $('#c-mx').onchange = () => { keepC(); draw(); };
      $('#c-ok').onclick = () => { keepC(); create(size); };
    };
    const create = size => {
      const tn = { id: tuid(), date: Date.now(), nom: C.nom.trim() || def, classe: tm.cls || '', sport: S.sport, format: C.format, teams, rencontres: [] };
      let msg;
      if (C.format === 'poule') {
        gk.forEach(g => { G[g].forEach(n => { if (g) teams.find(x => x.name === n).g = g; }); tn.rencontres.push(...roundRobin(G[g]).map(r => g ? { ...r, g } : r)); });
        tn.pts = { v: C.v, n: C.n, d: C.d }; msg = `${tn.rencontres.length} rencontres${gk.length > 1 ? ` · ${gk.length} poules` : ''}`;
      } else if (C.format === 'elim') {
        const o = C.mx ? shuffle(names) : [...names], slots = [...o, ...Array(size - o.length).fill(null)];
        for (let i = 0; i < size / 2; i++) tn.rencontres.push({ id: tuid(), round: 1, slot: i, a: slots[i], b: slots[size - 1 - i] });
        for (let k = 2, c = size / 4; c >= 1; k++, c /= 2) for (let i = 0; i < c; i++) tn.rencontres.push({ id: tuid(), round: k, slot: i, a: null, b: null });
        tn.qualif = {}; msg = `tableau de ${size}`;
      } else { tn.order = C.mx ? shuffle(names) : [...names]; msg = 'pyramide prête'; }
      TR().push(tn); save(); beep(1200, .15); toast(`Tournoi créé ✔ ${msg}`); tview(tn.id);
    };
    draw(); window.scrollTo(0, 0);
  }
  function playT(t, a, b, rid, defi) {
    if (SPORTS[t.sport] && t.sport !== S.sport) { const sp = SPORTS[t.sport]; S.sport = t.sport; S.type = sp.type; if (sp.dur) S.dur = sp.dur; if (sp.target) S.target = sp.target; S.ecart = !!sp.ecart; if (!sp.zones) S.zones = false; }
    const ta = t.teams.find(x => x.name === a), tb = t.teams.find(x => x.name === b);
    Object.assign(S, { a, b, pa: [...(ta ? ta.members : [])], pb: [...(tb ? tb.members : [])], tid: t.id, rid: rid || null, defi: defi || null });
    setup(); window.scrollTo(0, 0); beep(1000, .08);
  }
  const scoreBtn = (id, sc) => `<button class="tn-sc" data-tm="${esc(id)}" title="Voir le match">${sc[0]} – ${sc[1]}</button>`;
  const csvName = (p, t) => `${p}-${t.nom}.csv`.replace(/[^\w.-]+/g, '-');
  const members = (t, n) => ((t.teams.find(x => x.name === n) || {}).members || []).join(', ');

  /* ----- Championnat (une poule par niveau) ----- */
  function vPoule(t) {
    const P = t.pts || { v: 3, n: 2, d: 1 }, res = tResults(t), groups = [...new Set(t.rencontres.map(r => r.g || ''))];
    if (!groups.length) groups.push('');
    const html = groups.map(g => { const rk = tStand(t, g), rs = t.rencontres.filter(r => (r.g || '') === g), rounds = [...new Set(rs.map(r => r.round))].sort((x, y) => x - y), gt = t.teams.filter(x => (x.g || '') === g);
      return `<div class="section-title"><h2>${g ? esc(g) + ' — classement' : 'Classement'}</h2></div>
      <div class="card" style="overflow:auto"><table><tr><th>#</th><th>Équipe</th><th>Pts</th><th>J</th><th>G</th><th>N</th><th>P</th><th>BP</th><th>BC</th><th>Diff</th></tr>
        ${rk.map((r, i) => `<tr><td>${i + 1}</td><td><b>${esc(r.t)}</b></td><td><b>${r.pts}</b></td><td>${r.j}</td><td>${r.g}</td><td>${r.n}</td><td>${r.p}</td><td>${r.bp}</td><td>${r.bc}</td><td>${r.bp - r.bc > 0 ? '+' : ''}${r.bp - r.bc}</td></tr>`).join('')}</table></div>
      <div class="section-title"><h2>${g ? esc(g) + ' — rencontres' : 'Rencontres'}</h2></div>
      ${rounds.map(k => { const rr = rs.filter(r => r.round === k), inR = new Set(rr.flatMap(r => [r.a, r.b])), bye = gt.filter(x => !inR.has(x.name));
        return `<div class="card" style="margin-top:10px;padding:10px 14px"><h3 style="margin:0">Tour ${k}</h3>${bye.length ? `<div class="muted" style="font-size:.8rem">Exempt : ${bye.map(x => esc(x.name)).join(', ')}</div>` : ''}
          ${rr.map(r => { const m = res[r.id], sc = m && tScore(r, m);
            return `<div style="border-top:1px solid var(--line);margin-top:6px"><div class="tn-r"><span class="ta">${esc(r.a)}</span>${m ? `<button class="tn-sc" data-tr="${r.id}" title="Voir le match">${sc[0]} – ${sc[1]}</button>` : '<span class="muted">vs</span>'}<span class="tb">${esc(r.b)}</span></div>
              ${m ? `<div style="text-align:center;margin-bottom:6px"><button class="link" data-tp="${r.id}" style="font-size:.8rem">↻ Rejouer (le dernier score enregistré compte)</button></div>` : `<button class="btn btn-grad btn-block tn-go" data-tp="${r.id}">▶ Jouer ce match</button>`}</div>`; }).join('')}</div>`; }).join('')}`; }).join('');
    return { info: `Victoire ${P.v} pts · Nul ${P.n} pts · Défaite ${P.d} pt${P.d > 1 ? 's' : ''}${groups.length > 1 ? ` · ${groups.length} poules par niveau` : ''}`, html, csvLbl: 'Exporter le classement (CSV)',
      wire: () => { el.querySelectorAll('[data-tp]').forEach(b => b.onclick = () => { const r = t.rencontres.find(x => x.id === b.dataset.tp); if (r) playT(t, r.a, r.b, r.id); });
        el.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => { const m = res[b.dataset.tr]; if (m) summary(m, true); }); },
      csv: () => download(csvName('classement', t), csv([
        ['Rang', 'Équipe', 'Pts', 'J', 'G', 'N', 'P', 'Buts pour', 'Buts contre', 'Diff', 'Joueurs', 'Poule'],
        ...groups.flatMap(g => tStand(t, g).map((r, i) => [i + 1, r.t, r.pts, r.j, r.g, r.n, r.p, r.bp, r.bc, r.bp - r.bc, members(t, r.t), g])),
        [], ['Tour', 'Équipe A', 'Score A', 'Score B', 'Équipe B', 'Poule'],
        ...t.rencontres.map(r => { const m = res[r.id], sc = m ? tScore(r, m) : ['', '']; return [r.round, r.a, sc[0], sc[1], r.b, r.g || '']; })])) };
  }

  /* ----- Élimination directe ----- */
  function vElim(t) {
    const E = tElim(t), R = E.length, fin = E[R - 1][0], champ = fin && fin.w, all = E.flat();
    const side = (n, s, j) => { const nm = n[s], cls = nm == null ? 'e' : n.w != null && !n.bye ? (n.w === nm ? 'w' : 'l') : n.bye ? 'w' : '';
      return `<div class="${cls}"><span>${nm != null ? esc(nm) : n.bye ? 'exempt' : '…'}</span><b>${n.sc ? n.sc[j] : ''}</b></div>`; };
    const line = n => {
      if (n.bye) return `<div class="tn-r"><span class="ta">${esc(n.w)}</span><span class="muted">exempt</span><span class="tb" style="color:var(--muted)">✔ qualifié d'office</span></div>`;
      if (n.a == null || n.b == null) return `<div class="tn-r"><span class="ta">${n.a != null ? esc(n.a) : '…'}</span><span class="muted">vs</span><span class="tb">${n.b != null ? esc(n.b) : '…'}</span></div><div class="muted" style="text-align:center;font-size:.8rem;margin-bottom:6px">En attente des vainqueurs du tour précédent</div>`;
      const last = n.round === R;
      return `<div class="tn-r"><span class="ta" style="${n.w === n.a ? '' : n.w ? 'opacity:.5' : ''}">${esc(n.a)}</span>${n.m ? scoreBtn(n.m.id, n.sc) : '<span class="muted">vs</span>'}<span class="tb" style="${n.w === n.b ? '' : n.w ? 'opacity:.5' : ''}">${esc(n.b)}</span></div>
        ${n.tie ? `<div class="muted" style="text-align:center;font-size:.85rem;font-weight:700">🤝 Match nul — l'enseignant choisit l'équipe qualifiée :</div>
          <div class="tn-q"><button class="btn ${n.w === n.a ? 'btn-grad' : 'btn-ghost'}" data-q="${n.id}|a">Qualifier ${esc(n.a)}</button><button class="btn ${n.w === n.b ? 'btn-grad' : 'btn-ghost'}" data-q="${n.id}|b">Qualifier ${esc(n.b)}</button></div>` : ''}
        ${n.w != null ? `<div style="text-align:center;font-weight:800;margin-bottom:4px">${last ? '🏆 ' + esc(n.w) + ' remporte le tournoi' : '✔ ' + esc(n.w) + ' se qualifie'}</div>` : ''}
        ${n.m ? `<div style="text-align:center;margin-bottom:6px"><button class="link" data-tp="${n.id}" style="font-size:.8rem">↻ Rejouer (le dernier score enregistré compte, la suite du tableau est recalculée)</button></div>` : `<button class="btn btn-grad btn-block tn-go" data-tp="${n.id}">▶ Jouer ce match</button>`}`;
    };
    const html = `${champ ? `<div class="tn-champ">🏆 Champion : ${esc(champ)}</div>` : ''}
      <div class="section-title"><h2>Tableau</h2></div>
      <div class="card"><div class="tn-br">${E.map((rd, k) => `<div class="rd"><h4>${elimName(t, k + 1)}</h4>${rd.map(n => `<div class="mt">${side(n, 'a', 0)}${side(n, 'b', 1)}</div>`).join('')}</div>`).join('')}</div></div>
      ${E.map((rd, k) => `<div class="card" style="margin-top:10px;padding:10px 14px"><h3 style="margin:0">${elimName(t, k + 1)}</h3>${rd.map(n => `<div style="border-top:1px solid var(--line);margin-top:6px">${line(n)}</div>`).join('')}</div>`).join('')}`;
    return { info: `${all.filter(n => !n.bye && n.w != null).length}/${Math.max(0, t.teams.length - 1)} matchs décidés · le vainqueur de chaque match passe au tour suivant`, html, csvLbl: 'Exporter le tableau (CSV)',
      wire: () => {
        el.querySelectorAll('[data-tp]').forEach(b => b.onclick = () => { const n = all.find(x => x.id === b.dataset.tp); if (n && n.a != null && n.b != null) playT(t, n.a, n.b, n.id); });
        el.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { const [rid, s] = b.dataset.q.split('|'), n = all.find(x => x.id === rid); if (!n) return;
          const nm = n[s]; if (!confirm(`Qualifier « ${nm} » pour le tour suivant ?`)) return;
          t.qualif = t.qualif || {}; t.qualif[rid] = nm; save(); beep(1200, .12); tview(t.id); });
      },
      csv: () => download(csvName('tableau', t), csv([['Tour', 'Équipe A', 'Score A', 'Score B', 'Équipe B', 'Qualifié'],
        ...all.map(n => [elimName(t, n.round), n.a ?? (n.bye ? 'exempt' : ''), n.sc ? n.sc[0] : '', n.sc ? n.sc[1] : '', n.b ?? (n.bye ? 'exempt' : ''), (n.w ?? '') + (n.tie && n.w ? ' (choix enseignant)' : '')]),
        [], ['Champion', champ || '—']])) };
  }

  /* ----- Pyramide des victoires ----- */
  function vPyr(t) {
    const { ranks, log } = tPyr(t);
    if (!ranks.includes(S.pc) || ranks.indexOf(S.pc) === 0) S.pc = ranks[ranks.length - 1];
    let rows = '', i = 0, w = 1;
    while (i < ranks.length) { rows += `<div class="pr">${ranks.slice(i, i + w).map((n, k) => `<div class="pc" data-pn="${esc(n)}"><small>#${i + k + 1}</small>${esc(n)}</div>`).join('')}</div>`; i += w; w++; }
    const html = `<div class="section-title"><h2>Pyramide</h2></div><div class="card"><div class="tn-pyr">${rows}</div></div>
      <div class="section-title"><h2>⚔️ Lancer un défi</h2></div>
      <div class="card"><p class="muted" style="margin:0 0 6px;font-size:.85rem">On défie une équipe de la <b>ligne juste au-dessus</b> ou de sa propre ligne (mieux classée). Si le challenger gagne, il prend sa place ; nul ou défaite : rien ne change.</p>
        <div class="row"><div><label>Challenger</label><select id="p-c" style="padding:12px;font-weight:800;font-size:1.05rem">${ranks.slice(1).map((n, k) => `<option value="${esc(n)}" ${n === S.pc ? 'selected' : ''}>#${k + 2} ${esc(n)}</option>`).join('')}</select></div>
          <div><label>Défié</label><select id="p-d" style="padding:12px;font-weight:800;font-size:1.05rem"></select></div></div>
        <button class="btn btn-grad btn-block tn-go" style="margin-top:10px" id="p-go">▶ Jouer ce défi</button></div>
      <div class="section-title"><h2>Historique des défis</h2></div>
      <div class="card" style="padding:0">${log.length ? log.slice().reverse().map(l => `<div class="list-item"><div style="flex:1"><b>${esc(l.c)}</b> <span class="muted">(#${l.from})</span> défie <b>${esc(l.d)}</b> <span class="muted">(#${l.to})</span>
        <div class="muted" style="font-size:.82rem">${new Date(l.m.date).toLocaleDateString('fr-FR')} ${new Date(l.m.date).toLocaleTimeString('fr-FR').slice(0, 5)} · ${l.up ? `⬆ ${esc(l.c)} gagne et monte en #${l.to}` : l.won ? `${esc(l.c)} gagne (déjà mieux classé)` : l.cs === l.ds ? 'Match nul · pas de changement' : `🛡 ${esc(l.d)} résiste · pas de changement`}</div></div>${scoreBtn(l.m.id, [l.cs, l.ds])}</div>`).join('') : '<div class="empty">Aucun défi joué.</div>'}</div>`;
    return { info: `${ranks.length} équipes · ${log.length} défi${log.length > 1 ? 's' : ''} joué${log.length > 1 ? 's' : ''} · en tête : ${esc(ranks[0])}`, html, csvLbl: 'Exporter la pyramide (CSV)',
      wire: () => {
        const $ = q => el.querySelector(q);
        const upd = () => { S.pc = $('#p-c').value; const ci = ranks.indexOf(S.pc), tg = pyrTargets(ranks, ci), cur = $('#p-d').value;
          $('#p-d').innerHTML = tg.map(j => `<option value="${esc(ranks[j])}">#${j + 1} ${esc(ranks[j])}</option>`).join('');
          if (tg.some(j => ranks[j] === cur)) $('#p-d').value = cur; else if (tg.length) $('#p-d').value = ranks[tg[tg.length - 1]];
          el.querySelectorAll('[data-pn]').forEach(c => { c.classList.toggle('c', c.dataset.pn === S.pc); c.classList.toggle('d', c.dataset.pn === $('#p-d').value); }); };
        $('#p-c').onchange = upd; $('#p-d').onchange = upd; upd();
        $('#p-go').onclick = () => { const c = $('#p-c').value, d = $('#p-d').value; if (!c || !d || c === d) return toast('Choisissez le défié');
          playT(t, c, d, null, { challenger: c, defie: d }); };
      },
      csv: () => download(csvName('pyramide', t), csv([['Rang', 'Équipe', 'Ligne', 'Joueurs'], ...ranks.map((n, k) => [k + 1, n, pyrRow(k) + 1, members(t, n)]),
        [], ['Date', 'Challenger', 'Défié', 'Score challenger', 'Score défié', 'Résultat'],
        ...log.map(l => [new Date(l.m.date).toLocaleString('fr-FR'), l.c, l.d, l.cs, l.ds, l.up ? `monte de #${l.from} à #${l.to}` : l.won ? 'victoire (déjà mieux classé)' : l.cs === l.ds ? 'nul · pas de changement' : 'défaite · pas de changement'])])) };
  }

  function tview(id) {
    clearInterval(iv); M = null;
    const t = TR().find(x => x.id === id); if (!t) { toast('Tournoi introuvable'); return setup(); }
    S.view = id;
    const f = tFmt(t), V = f === 'elim' ? vElim(t) : f === 'pyramide' ? vPyr(t) : vPoule(t);
    const amic = DB.matchs.filter(m => m.tid === t.id && !m.rid && !m.defi && !m.obsOnly).length;
    const opt = sel => t.teams.map((x, i) => `<option value="${i}" ${i === sel ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
    el.innerHTML = `<button class="btn btn-ghost" id="t-bk">← Gestion de match</button>
      <div class="card" style="margin-top:10px;border-top:6px solid #B8912A"><h3>${TFMT[f].i} ${esc(t.nom)}</h3>
        <div class="muted" style="font-size:.85rem">${TFMT[f].n} · ${esc(SPORTS[t.sport]?.name || t.sport)}${t.classe ? ' · ' + esc(t.classe) : ''} · ${new Date(t.date).toLocaleDateString('fr-FR')} · ${t.teams.length} équipes${amic ? ` · ${amic} match${amic > 1 ? 's' : ''} amica${amic > 1 ? 'ux' : 'l'}` : ''}</div>
        <div class="muted" style="font-size:.78rem;margin-top:4px">${V.info}</div></div>
      ${V.html}
      <div class="section-title"><h2>Match libre</h2></div>
      <div class="card"><p class="muted" style="margin:0 0 6px;font-size:.85rem">Match amical ou supplémentaire : lié au tournoi mais <b>non compté</b> ${f === 'elim' ? 'dans le tableau' : f === 'pyramide' ? 'dans la pyramide' : 'dans le classement'}.</p>
        <div class="row"><div><label>Mon équipe</label><select id="t-fa" style="padding:12px;font-weight:800;font-size:1.05rem">${opt(0)}</select></div><div><label>Adversaire</label><select id="t-fb" style="padding:12px;font-weight:800;font-size:1.05rem">${opt(1)}</select></div></div>
        <button class="btn btn-grad btn-block tn-go" style="margin-top:10px" id="t-fr">▶ Jouer</button></div>
      <details class="card" style="margin-top:14px"><summary style="font-weight:800;cursor:pointer">🔒 Enseignant</summary>
        <div class="row" style="margin-top:10px"><button class="btn btn-ghost" id="t-csv">📤 ${V.csvLbl}</button><button class="btn btn-danger" id="t-del">🗑 Supprimer le tournoi</button></div>
        <p class="muted" style="font-size:.78rem;margin:6px 0 0">Les matchs déjà enregistrés restent dans l'historique.</p></details>`;
    const $ = q => el.querySelector(q);
    $('#t-bk').onclick = setup;
    V.wire();
    el.querySelectorAll('[data-tm]').forEach(b => b.onclick = () => { const m = DB.matchs.find(x => x.id === b.dataset.tm); if (m) summary(m, true); });
    $('#t-fr').onclick = () => { const a = +$('#t-fa').value, b = +$('#t-fb').value; if (a === b) return toast('Choisissez deux équipes différentes'); playT(t, t.teams[a].name, t.teams[b].name, null); };
    $('#t-csv').onclick = V.csv;
    $('#t-del').onclick = () => { if (!confirm(`Supprimer le tournoi « ${t.nom} » sur toutes les tablettes ?\nLes matchs enregistrés restent dans l'historique.`)) return;
      DB.tournois = TR().filter(x => x.id !== t.id); if (S.tid === t.id) unlinkT(); save(); toast('Tournoi supprimé'); setup(); };
  }

  /* ===== 2. Match ===== */
  const stats = (ev, nz) => [0, 1].map(t => {
    const e = ev.filter(x => x.team === t);
    const marques = e.filter(x => x.kind === 'score' && x.shot).length, tirsRates = e.filter(x => x.kind === 'tir').length;
    const zones = Array.from({ length: nz || 0 }, (_, z) => e.filter(x => x.kind === 'zone' && x.zone === z + 1).length);
    return { marques, tirs: marques + tirsRates, pertes: e.filter(x => x.kind === 'perte').length, passes: e.filter(x => x.kind === 'passe').length,
      bonus: e.filter(x => x.kind === 'bonus').reduce((a, x) => a + x.pts, 0), zones, touches: TOUCH_ZONES.map(z => e.filter(x => x.tz === z).length) };
  });
  const scoreOf = t => M.ev.filter(x => x.team === t && (x.kind === 'score' || x.kind === 'bonus')).reduce((a, x) => a + x.pts, 0);
  const now = () => M.acc + (M.run ? performance.now() - M.t0 : 0);

  function start(full) {
    M = { ev: [], acc: 0, t0: 0, run: false, poss: 0, over: false, pa: S.tid ? [...(S.pa || [])] : T() ? [...membersOf(S.ia)] : [], pb: S.tid ? [...(S.pb || [])] : T() ? [...membersOf(S.ib)] : [] };
    if (S.obsOn && S.role === 'obs' && !full) return startObs();
    const sp = SP(), c = courtSVG(S.sport), zonesOn = sp.zones && S.zones;
    const vbW = +c.vb.split(' ')[2], vbH = +c.vb.split(' ')[3];
    const bands = zonesOn ? Array.from({ length: S.nz }, (_, z) => { const w = vbW / S.nz;
      return `<rect class="zone-band" data-z="${z}" x="${z * w}" y="0" width="${w}" height="${vbH}" fill="rgba(255,255,255,${z % 2 ? .06 : .14})" stroke="rgba(255,255,255,.55)" stroke-dasharray="4 4" stroke-width="1"/>
        <text x="${z * w + w / 2}" y="${vbH * .18}" text-anchor="middle" font-size="${vbH * .09}" font-weight="900" fill="#fff" opacity=".9" pointer-events="none" data-zl="${z}"></text>
        <text x="${z * w + w / 2}" y="${vbH * .92}" text-anchor="middle" font-size="${vbH * .075}" font-weight="800" fill="#fff" pointer-events="none" data-zc="${z}"></text>`; }).join('') : '';
    el.innerHTML = `<div class="sb"><div class="tm a"><span>${esc(S.a)}</span><b id="sa">0</b></div>
        <div class="ck"><div class="muted" style="font-size:.72rem;font-weight:800">${S.type === 'temps' ? 'TEMPS RESTANT' : 'TEMPS'}</div><b id="ck">${S.type === 'temps' ? fmt(S.dur * 60000, false) : '00:00'}</b>
          <div class="row" style="margin-top:6px;gap:6px"><button class="btn btn-grad" style="padding:9px 12px;font-size:.85rem" id="go">▶ Démarrer</button></div></div>
        <div class="tm b"><span>${esc(S.b)}</span><b id="sb">0</b></div></div>
      ${M.pa.length || M.pb.length ? `<div class="roster"><b style="color:#B8912A">${esc(S.a)}</b> : ${M.pa.map(esc).join(', ') || '—'}<br><b style="color:#1E5BD8">${esc(S.b)}</b> : ${M.pb.map(esc).join(', ') || '—'}</div>` : ''}
      <div class="muted" style="text-align:center;margin-top:6px;font-size:.8rem">${S.type === 'temps' ? `Match au temps · ${S.dur} min` : `Match en ${S.target} points${S.ecart ? ' (2 pts d\'écart)' : ''}`} · ${sp.name}</div>
      ${zonesOn ? `<div class="poss">Ballon :<button class="a on" data-p="0">${esc(S.a)} ➜</button><button class="b" data-p="1">⬅ ${esc(S.b)}</button></div>` : '<div style="height:10px"></div>'}
      <div class="court" style="background:${c.bg}"><svg viewBox="${c.vb}">${c.svg}${bands}</svg></div>
      ${zonesOn ? '<p class="muted" style="margin:6px 2px 0;font-size:.8rem">Touchez la zone atteinte par l\'équipe qui a le ballon. Zone 1 = son propre camp, zone ' + S.nz + ' = près du but adverse.</p>' : ''}
      <div class="act">${[0, 1].map(t => `<div class="col ${t ? 'cb' : 'ca'}"><h4>${esc(t ? S.b : S.a)}</h4>
          ${sp.touch ? TOUCH_ZONES.map(z => `<button class="sc" data-t="${t}" data-tz="${z}">Touche ${z.toLowerCase()}<small>+1</small></button>`).join('') : ''}
          ${sp.score.map((s, i) => `<button class="sc" data-t="${t}" data-sc="${i}">${s.l}${s.sub ? `<small>${s.sub}</small>` : ''}</button>`).join('')}
          ${S.bonus.length ? `<div class="bn">${S.bonus.map(v => `<button data-t="${t}" data-bo="${v}">Bonus<br>+${v}</button>`).join('')}</div>` : ''}
          ${sp.coll && S.stats ? `<button data-t="${t}" data-k="tir">🎯 Tir tenté<small>raté</small></button><button data-t="${t}" data-k="passe">🤝 Passe décisive</button><button data-t="${t}" data-k="perte">❌ Perte de balle</button>` : ''}
        </div>`).join('')}</div>
      <div class="row" style="margin-top:12px"><button class="btn btn-ghost" id="un">↶ Annuler la dernière action</button><button class="btn btn-danger" id="end">🏁 Fin du match</button></div>
      <p class="muted" id="last" style="text-align:center;margin:8px 0"></p>
      ${S.obsOn ? '<details class="card" open style="margin-top:12px"><summary style="font-weight:800;cursor:pointer">👁 Observations individuelles</summary><div id="obs-host" style="margin-top:8px"></div></details>' : ''}
      ${S.sport === 'rugby' ? RLA_BOX : ''}`;
    const $ = s => el.querySelector(s);
    const setPoss = p => { M.poss = p; el.querySelectorAll('[data-p]').forEach(b => b.classList.toggle('on', +b.dataset.p === p)); paintZones(); };
    const add = e => { if (M.over) return; e.t = Math.round(now() / 1000); M.ev.push(e); paint(e); check(); };
    el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => setPoss(+b.dataset.p));
    el.querySelectorAll('[data-sc]').forEach(b => b.onclick = () => { const t = +b.dataset.t, s = sp.score[+b.dataset.sc];
      add({ team: t, kind: 'score', pts: s.p, label: s.l, shot: sp.coll ? (S.sport === 'rugby' ? !!s.try : true) : false }); beep(1200, .12); if (zonesOn) setPoss(1 - t); });
    el.querySelectorAll('[data-tz]').forEach(b => b.onclick = () => { add({ team: +b.dataset.t, kind: 'score', pts: 1, label: 'Touche ' + b.dataset.tz.toLowerCase(), tz: b.dataset.tz }); beep(1200, .12); });
    el.querySelectorAll('[data-bo]').forEach(b => b.onclick = () => { add({ team: +b.dataset.t, kind: 'bonus', pts: +b.dataset.bo, label: 'Bonus +' + b.dataset.bo }); beep(1500, .08); });
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const t = +b.dataset.t, k = b.dataset.k;
      add({ team: t, kind: k, pts: 0, label: { tir: 'Tir tenté', passe: 'Passe décisive', perte: 'Perte de balle' }[k] }); beep(700, .05); if (k === 'perte' && zonesOn) setPoss(1 - t); });
    el.querySelectorAll('.zone-band').forEach(r => r.onclick = () => { const z = +r.dataset.z, t = M.poss, zone = t === 0 ? z + 1 : S.nz - z;
      add({ team: t, kind: 'zone', zone, pts: 0, label: `Zone ${zone} atteinte` }); beep(900, .04); });
    $('#go').onclick = () => { if (M.over) return; if (M.run) { M.acc = now(); M.run = false; $('#go').textContent = '▶ Reprendre'; } else { M.t0 = performance.now(); M.run = true; $('#go').textContent = 'Pause'; beep(1300, .3); } };
    $('#un').onclick = () => { const e = M.ev.pop(); if (!e) return; if (M.over) M.over = false; paint(); $('#last').textContent = 'Annulé : ' + e.label + ' (' + (e.team ? S.b : S.a) + ')'; };
    $('#end').onclick = () => { if (confirm('Terminer le match ?')) finish(); };
    iv = setInterval(tick, 200); paint(); paintZones();
    mountRLA(); drawObs();
  }
  /* ----- Tablette « observateurs » : chrono + fiches des joueurs observés uniquement ----- */
  const obsPool = () => [...M.pa.map(n => [n, 0]), ...M.pb.map(n => [n, 1])];
  function startObs() {
    M.obsView = true; clearInterval(iv);
    if (!M.obs) { const pool = obsPool(); M.obs = Array.from({ length: S.obsN }, (_, i) => ({ name: pool[i] ? pool[i][0] : '', team: pool[i] ? pool[i][1] : 0, c: {} })); }
    const sp = SP();
    el.innerHTML = `<div class="card" style="text-align:center"><div class="mo-vs"><span style="background:#B8912A">${esc(S.a)}</span><span class="muted" style="color:var(--muted);padding:0">vs</span><span style="background:#1E5BD8">${esc(S.b)}</span></div>
        <div class="muted" style="font-size:.78rem;font-weight:800;margin-top:8px">${S.type === 'temps' ? 'TEMPS RESTANT' : 'TEMPS DE JEU'} · ${esc(sp.name)}</div>
        <div class="mo-clock" id="ck">${S.type === 'temps' ? fmt(S.dur * 60000, false) : '00:00'}</div>
        <button class="btn btn-grad btn-block" style="font-size:1.2rem;padding:16px" id="go">▶ Démarrer</button></div>
      <div id="obs-host"></div>
      <button class="btn btn-danger btn-block" style="margin-top:14px;font-size:1.1rem;padding:15px" id="end">🏁 Fin — enregistrer les observations</button>
      <div style="text-align:center;margin:18px 0 6px"><button class="link" id="gv-prof">🔒 Mode enseignant</button></div>`;
    const $ = q => el.querySelector(q);
    const goTxt = () => { $('#go').textContent = M.run ? '⏸ Pause' : M.acc ? (S.type === 'temps' && M.acc >= S.dur * 60000 ? '⏱ Temps écoulé' : '▶ Reprendre') : '▶ Démarrer'; };
    M.goTxt = goTxt;
    $('#go').onclick = () => { if (S.type === 'temps' && M.acc >= S.dur * 60000) return; if (M.run) { M.acc = now(); M.run = false; } else { M.t0 = performance.now(); M.run = true; beep(1300, .3); } goTxt(); };
    $('#end').onclick = () => { if (confirm('Terminer et enregistrer les observations ?')) saveObs(); };
    $('#gv-prof').onclick = () => { if (!confirm('Passer en mode enseignant (score, statistiques, réglages) ?')) return;
      const saved = M; saved.acc = now(); const wasRun = saved.run; start(true);
      Object.assign(M, { acc: saved.acc, pa: saved.pa, pb: saved.pb, obs: saved.obs });
      if (wasRun) { M.t0 = performance.now(); M.run = true; el.querySelector('#go').textContent = 'Pause'; } else if (M.acc) el.querySelector('#go').textContent = '▶ Reprendre';
      drawObs(); tick(); };
    goTxt(); drawObsBig(); iv = setInterval(tick, 200); tick();
  }
  function drawObsBig() {
    const h = el.querySelector('#obs-host'); if (!h || !M) return;
    const C = obsCrit(S.sport), pool = obsPool();
    h.innerHTML = `<div class="mo-grid">${M.obs.map((o, i) => `<div class="card" style="padding:12px;border-top:6px solid ${o.team ? '#1E5BD8' : '#B8912A'}">
        ${pool.length ? `<select data-op="${i}">${pool.map(([n, t]) => `<option value="${t}|${esc(n)}" ${n === o.name ? 'selected' : ''}>${esc(n)} (${esc(t ? S.b : S.a)})</option>`).join('')}</select>`
          : `<input data-oi="${i}" value="${esc(o.name)}" placeholder="Joueur ${i + 1}" style="padding:10px;font-weight:800;font-size:1.05rem">`}
        ${C.map(([k, l]) => `<div class="mo-row"><button class="m" data-om="${i}|${k}" aria-label="Retirer">−</button>
          <button class="p" data-oa="${i}|${k}"><span>${k === 'tir' ? 'Tir raté' : esc(l)}</span><b>${k === 'tir' ? (o.c.tir || 0) - (o.c.but || 0) : o.c[k] || 0}</b></button></div>`).join('')}
        ${o.c.tir ? `<div class="muted" style="font-size:.85rem;margin-top:8px;font-weight:700">Réussite ${Math.round((o.c.but || 0) / o.c.tir * 100)} %</div>` : ''}</div>`).join('')}</div>`;
    h.querySelectorAll('[data-op]').forEach(x => x.onchange = () => { const [t, n] = x.value.split('|'); Object.assign(M.obs[+x.dataset.op], { name: n, team: +t }); drawObsBig(); });
    h.querySelectorAll('[data-oi]').forEach(x => x.onchange = () => { M.obs[+x.dataset.oi].name = x.value.trim(); });
    h.querySelectorAll('[data-oa]').forEach(b => b.onclick = () => { const [i, k] = b.dataset.oa.split('|'), c = M.obs[+i].c; c[k] = (c[k] || 0) + 1; if (k === 'but') c.tir = (c.tir || 0) + 1; beep(1000, .03, .15); drawObsBig(); });
    h.querySelectorAll('[data-om]').forEach(b => b.onclick = () => { const [i, k] = b.dataset.om.split('|'), c = M.obs[+i].c; if (k === 'tir' && (c.tir || 0) <= (c.but || 0)) return; c[k] = Math.max(0, (c[k] || 0) - 1); if (k === 'but') c.tir = Math.max(0, (c.tir || 0) - 1); drawObsBig(); });
  }
  const saveObsResults = m => (m.obs || []).forEach(o => { if (DB.classes.some(c => studentsOf(c.name).includes(o.name))) saveResult({ tool: 'match', label: 'Match · ' + (SPORTS[m.sport]?.name || ''), classe: (DB.classes.find(c => studentsOf(c.name).includes(o.name)) || {}).name || '', eleve: o.name,
    valeur: m.obsOnly ? `Observé (${o.team ? m.b : m.a})` : `${m.sa}–${m.sb} (${o.team ? m.b : m.a})`, detail: obsLine(o, m.sport) }); });
  function saveObs() {
    // seuls les joueurs réellement observés (au moins une action) sont enregistrés
    const obs = (M.obs || []).filter(o => o.name && Object.values(o.c).some(v => v > 0));
    if (!obs.length) return toast('Aucune observation saisie');
    M.acc = now(); M.run = false; M.over = true; clearInterval(iv);
    const m = { id: tuid(), ...tlink(), date: Date.now(), sport: S.sport, a: S.a, b: S.b, sa: 0, sb: 0, duree: Math.round(M.acc / 1000), nz: 0, pa: M.pa, pb: M.pb, obs, obsOnly: true, coll: false, stats: stats([], 0), ev: [] };
    DB.matchs.push(m); saveObsResults(m); save(); beep(1000, .3); toast('Observations enregistrées ✔'); afterSave(m);
  }
  function paintZones() {
    if (!el.querySelector('[data-zl]')) return;
    const st = stats(M.ev, S.nz);
    for (let z = 0; z < S.nz; z++) {
      const za = z + 1, zb = S.nz - z;
      el.querySelector(`[data-zl="${z}"]`).textContent = 'Z' + (M.poss === 0 ? za : zb);
      el.querySelector(`[data-zc="${z}"]`).textContent = `A ${st[0].zones[za - 1]} · B ${st[1].zones[zb - 1]}`;
    }
  }
  function paint(e) {
    el.querySelector('#sa').textContent = scoreOf(0); el.querySelector('#sb').textContent = scoreOf(1);
    if (e) el.querySelector('#last').textContent = `${e.label} — ${e.team ? S.b : S.a}`;
    paintZones();
  }
  function tick() {
    if (!M || !el.querySelector('#ck')) return;
    const t = now();
    if (S.type === 'temps') { const left = S.dur * 60000 - t; el.querySelector('#ck').textContent = fmt(Math.max(0, left) + 999, false);
      if (left <= 0 && M.obsView && M.run) { M.acc = S.dur * 60000; M.run = false; el.querySelector('#ck').textContent = '00:00'; [0, 350, 700].forEach(d => setTimeout(() => beep(700, .5), d)); M.goTxt(); return; }
      if (left <= 0 && !M.over && !M.obsView) { M.acc = S.dur * 60000; M.run = false; el.querySelector('#ck').textContent = '00:00'; [0, 350, 700].forEach(d => setTimeout(() => beep(700, .5), d)); finish(); } }
    else el.querySelector('#ck').textContent = fmt(t, false);
  }
  function check() {
    if (S.type !== 'points') return;
    const a = scoreOf(0), b = scoreOf(1), mx = Math.max(a, b);
    if (mx >= S.target && (!S.ecart || Math.abs(a - b) >= 2)) { [0, 350, 700].forEach(d => setTimeout(() => beep(1000, .4), d)); M.run = false; M.acc = now(); finish(); }
  }
  function finish() {
    if (!M) return; M.over = true; M.run = false; clearInterval(iv);
    const rec = { id: tuid(), ...tlink(), date: Date.now(), sport: S.sport, a: S.a, b: S.b, sa: scoreOf(0), sb: scoreOf(1), duree: Math.round(M.acc / 1000), nz: SP().zones && S.zones ? S.nz : 0,
      pa: M.pa, pb: M.pb, obs: M.obs && M.obs.filter(o => o.name) || null, coll: SP().coll && S.stats, stats: stats(M.ev, SP().zones && S.zones ? S.nz : 0), ev: M.ev };
    summary(rec, false);
  }

  /* ===== 3. Bilan ===== */
  function summary(m, fromHistory) {
    const win = m.obsOnly ? `👁 Observations · ${esc(m.a)} vs ${esc(m.b)}` : m.sa === m.sb ? 'Match nul' : `🏆 Victoire : ${esc(m.sa > m.sb ? m.a : m.b)}`, sp = SPORTS[m.sport];
    const row = (l, f) => `<tr><td>${l}</td><td><b>${f(m.stats[0], 0)}</b></td><td><b>${f(m.stats[1], 1)}</b></td></tr>`;
    el.innerHTML = `<div class="win">${win}</div>
      ${m.obsOnly ? `<div class="muted" style="text-align:center;margin-top:8px">${esc(sp?.name || '')} · ${new Date(m.date).toLocaleDateString('fr-FR')} · durée ${fmt(m.duree * 1000, false)}</div>` : `<div class="sb" style="margin-top:12px"><div class="tm a"><span>${esc(m.a)}</span><b>${m.sa}</b></div><div class="ck"><b>–</b><div class="muted" style="font-size:.75rem">${fmt(m.duree * 1000, false)}</div></div><div class="tm b"><span>${esc(m.b)}</span><b>${m.sb}</b></div></div>`}
      ${(m.pa || []).length || (m.pb || []).length ? `<div class="roster" style="margin-top:8px"><b style="color:#B8912A">${esc(m.a)}</b> : ${(m.pa || []).map(esc).join(', ') || '—'}<br><b style="color:#1E5BD8">${esc(m.b)}</b> : ${(m.pb || []).map(esc).join(', ') || '—'}</div>` : ''}
      ${m.obsOnly ? '' : `<div class="section-title"><h2>Statistiques · ${esc(sp?.name || '')}</h2></div>
      <div class="card" style="overflow:auto"><table><tr><th></th><th>${esc(m.a)}</th><th>${esc(m.b)}</th></tr>
        ${row('Score', (s, t) => t ? m.sb : m.sa)}
        ${row('dont points bonus', s => s.bonus)}
        ${m.coll ? row(`${sp.shot}s marqués`, s => s.marques) + row('Tirs tentés', s => s.tirs) + row('Réussite', s => s.tirs ? Math.round(s.marques / s.tirs * 100) + ' %' : '–') + row('Passes décisives', s => s.passes) + row('Pertes de balle', s => s.pertes) : ''}
        ${m.nz ? Array.from({ length: m.nz }, (_, z) => row(`Zone ${z + 1} atteinte`, s => s.zones[z])).join('') : ''}
        ${m.sport === 'escrime' ? TOUCH_ZONES.map((z, i) => row(`Touches ${z.toLowerCase()}`, s => (s.touches || [])[i] || 0)).join('') : ''}
      </table>${m.nz ? `<p class="muted" style="margin:8px 0 0;font-size:.8rem">Zone 1 = camp de l'équipe, zone ${m.nz} = près du but adverse.</p>` : ''}</div>`}
      ${(m.obs || []).length ? `<div class="section-title"><h2>Observations individuelles</h2></div><div class="card sheet-table"><table><tr><th>Joueur</th>${obsCrit(m.sport).map(c => `<th>${c[1]}</th>`).join('')}${SPORTS[m.sport]?.coll ? '<th>Réussite</th>' : ''}</tr>
        ${m.obs.map(o => `<tr><td><b>${esc(o.name)}</b><div class="muted" style="font-size:.72rem">${esc(o.team ? m.b : m.a)}</div></td>${obsCrit(m.sport).map(([k]) => `<td>${o.c[k] || 0}</td>`).join('')}${SPORTS[m.sport]?.coll ? `<td>${o.c.tir ? Math.round((o.c.but || 0) / o.c.tir * 100) + ' %' : '–'}</td>` : ''}</tr>`).join('')}</table></div>` : ''}
      ${m.obsOnly ? '' : `<div class="section-title"><h2>Déroulé du match</h2></div>
      <div class="card" style="max-height:260px;overflow:auto;padding:4px 12px">${m.ev.length ? m.ev.map(e => `<div class="muted" style="padding:4px 0;border-bottom:1px solid var(--line)"><b style="color:var(--text)">${fmt(e.t * 1000, false)}</b> · ${esc(e.team ? m.b : m.a)} · ${esc(e.label)}</div>`).join('') : '<div class="empty">Aucune action.</div>'}</div>`}
      <div class="row" style="margin-top:14px">${fromHistory ? '<button class="btn btn-ghost" id="bk">← Retour</button>' : '<button class="btn btn-grad" id="sv">💾 Enregistrer le match</button><button class="btn btn-ghost" id="rs">↶ Reprendre</button>'}<button class="btn btn-ghost" id="ex">📤 CSV</button></div>
      ${fromHistory ? '' : '<button class="btn btn-ghost btn-block" style="margin-top:10px" id="nw">Nouveau match sans enregistrer</button>'}`;
    const $ = s => el.querySelector(s);
    $('#ex').onclick = () => download(`match-${m.a}-${m.b}.csv`.replace(/[^\w.-]+/g, '-'), csv([['Temps', 'Équipe', 'Action', 'Points'], ...m.ev.map(e => [fmt(e.t * 1000, false), e.team ? m.b : m.a, e.label, e.pts || '']), ...((m.obs || []).length ? [[], ['Joueur observé', 'Équipe', ...obsCrit(m.sport).map(c => c[1])], ...m.obs.map(o => [o.name, o.team ? m.b : m.a, ...obsCrit(m.sport).map(([k]) => o.c[k] || 0)])] : [])]));
    if (fromHistory) { $('#bk').onclick = () => { const v = S.view; v ? tview(v) : setup(); }; return; }
    $('#sv').onclick = () => { DB.matchs.push(m); saveObsResults(m);
      save(); toast('Match enregistré ✔'); afterSave(m); };
    $('#nw').onclick = () => { if (confirm('Quitter sans enregistrer ?')) setup(); };
    $('#rs').onclick = () => { // revenir au match (ex. fin par erreur)
      const saved = M; start(true); M.ev = saved.ev; M.acc = saved.acc; M.pa = saved.pa; M.pb = saved.pb; M.obs = saved.obs; drawObs(); M.poss = saved.poss; M.over = false; paint(); tick(); };
  }

  setup();
  return () => clearInterval(iv);
};
