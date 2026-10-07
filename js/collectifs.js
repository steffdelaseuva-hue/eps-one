/* =========================================================
   EPS ONE — Outil « Résultats collectifs »
   Par classe : tournois, matchs, séances de groupes (HYROX,
   course d'orientation, combiné, duathlon, relais) · export CSV
   Les données restent dans chaque outil ; la « sélection multiple » (enseignant)
   supprime les séances choisies de leur outil d'origine (mêmes enregistrements
   que la suppression 🗑 de l'historique de l'outil). Tournois et cross : non.
   ========================================================= */
ICONS.collectifs = '<path d="M3 20.5h18M4.5 20.5V14h5v6.5M9.5 20.5V10h5v10.5M14.5 20.5V16h5v4.5"/><path d="M12 2.8l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z"/>';
if (!document.getElementById('cl-css')) document.head.insertAdjacentHTML('beforeend', `<style id="cl-css">
.cl-ev{margin-top:10px;padding:12px 14px}
.cl-ev>summary{list-style:none;cursor:pointer}.cl-ev>summary::-webkit-details-marker{display:none}
.cl-h{display:flex;gap:10px;align-items:flex-start}
.cl-i{font-size:1.5rem;line-height:1.2;flex:0 0 auto}
.cl-h b{display:block}
.cl-lead{font-size:.85rem;font-weight:700;margin-top:3px}
.cl-ch{flex:0 0 auto;color:var(--muted);transition:transform .2s;margin-top:4px}
.cl-ev[open] .cl-ch{transform:rotate(90deg)}
.cl-b{margin-top:8px}
.cl-sc{display:flex;align-items:center;gap:8px;margin-top:8px}
.cl-sc>div{flex:1;min-width:0}.cl-sc>div:last-child{text-align:right}
.cl-sc .s{font-size:1.4rem;font-weight:900;font-variant-numeric:tabular-nums;white-space:nowrap}
.cl-w{color:var(--ok,#1B9E5A)}
.cl-ev .tn-champ{font-size:1.1rem;padding:12px;margin-top:4px}
.cl-ev .tn-pyr .pr{flex-wrap:nowrap}
.cl-ev .tn-pyr .pc{flex:0 1 150px;min-width:0;padding:7px 6px;font-size:.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cl-ev table{margin-top:4px}
.cl-sl{display:flex;gap:10px;align-items:flex-start}.cl-sl>:last-child{flex:1;min-width:0}
.cl-sl>input{width:24px;height:24px;margin:22px 0 0;flex:0 0 auto;accent-color:var(--blue)}
.cl-sl .cl-ev{margin-top:10px}.cl-sl.on .cl-ev{outline:2px solid var(--blue);outline-offset:-2px}
.cl-bar{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.cl-bar .btn{padding:9px 12px}
</style>`);

(() => {
  let per = 'all', act = 'all', multi = false, sel = new Set();   // sel : 1er enregistrement de chaque résultat coché
  const KINDS = [['all', 'Tous'], ['tournoi', '🏆 Tournois'], ['match', '⚔️ Matchs'], ['wod', '🏋️ HYROX'], ['co', '🧭 CO'], ['combine', '🏃 Combiné'], ['duathlon', '🥏 Duathlon'], ['relais', '🔁 Relais'], ['cross', '🏁 Cross']];
  const SECT = { tournoi: '🏆 Tournois', match: '⚔️ Matchs', wod: '🏋️ HYROX / Crosstraining', co: '🧭 Course d\'orientation', combine: '🏃 Combiné athlétique', duathlon: '🥏 Duathlon athlétique', relais: '🔁 Relais', cross: '🏁 Cross du collège' };
  const ACT = { tournoi: 'Tournoi', match: 'Match', wod: 'HYROX / Crosstraining', co: 'Course d\'orientation', combine: 'Combiné athlétique', duathlon: 'Duathlon athlétique', relais: 'Relais', cross: 'Cross' };
  const dFr = t => new Date(t).toLocaleDateString('fr-FR');
  const dFull = t => new Date(t).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  const hhmm = t => new Date(t).toLocaleTimeString('fr-FR').slice(0, 5);
  const medal = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1;
  const memb = a => a && a.length ? `<div class="muted" style="font-size:.75rem">${esc(a.join(', '))}</div>` : '';
  const sportN = s => (window.SPORTS || (typeof SPORTS !== 'undefined' ? SPORTS : {}))[s]?.name || s || '';
  const sec = s => { if (s == null || isNaN(s)) return '–'; const neg = s < 0; s = Math.abs(Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
    return (neg ? '−' : '') + (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0'); };
  const dec = x => (Math.round(x * 100) / 100).toString().replace('.', ',');
  /* Tableau de classement générique : rows = [{ rk, name, members, res }] */
  const rankTable = (rows, head = 'Résultat', showM = true) => `<div class="sheet-table" style="margin-top:0"><table><tr><th>#</th><th>Équipe / groupe</th><th>${head}</th></tr>
    ${rows.map(r => `<tr><td>${r.rk === '' ? '–' : typeof r.rk === 'number' ? medal(r.rk - 1) : esc(r.rk)}</td><td><b>${esc(r.name)}</b>${showM ? memb(r.members) : ''}</td><td>${esc(r.res).replace(/(\d) (?=\S)/g, '$1&nbsp;')}</td></tr>`).join('')}</table></div>`;
  const csvRows = rows => rows.map(r => [r.rk, r.name, (r.members || []).join(', '), r.res]);

  /* Classe d'un ensemble de noms d'élèves : la classe qui en contient le plus */
  const inferClass = names => { const N = new Set(names.filter(Boolean)); if (!N.size) return ''; let best = '', n = 0;
    DB.classes.forEach(c => { const k = (c.students || []).filter(x => N.has(x)).length; if (k > n) { n = k; best = c.name; } }); return best; };
  const tClass = t => t.classe || inferClass(t.teams.flatMap(x => x.members || []));

  /* ================= TOURNOIS ================= */
  function tournois(cls) {
    if (typeof TR !== 'function') return [];
    return TR().filter(t => t && Array.isArray(t.teams) && tClass(t) === cls).map(t => {
      const f = tFmt(t), M = (t.teams || []), mOf = n => (M.find(x => x.name === n) || {}).members || [];
      const ms = DB.matchs.filter(m => m.tid === t.id && !m.obsOnly), last = Math.max(t.date || 0, ...ms.map(m => m.date || 0));
      let body = '', rows = [], lead = tProgress(t);
      if (f === 'poule') {
        const groups = [...new Set((t.rencontres || []).map(r => r.g || ''))]; if (!groups.length) groups.push('');
        body = groups.map(g => { const rk = tStand(t, g), R = rk.map((r, i) => ({ rk: r.j ? i + 1 : '', name: r.t, members: mOf(r.t), res: `${r.pts} pts · ${r.g} V ${r.n} N ${r.p} D · diff ${r.bp - r.bc > 0 ? '+' : ''}${r.bp - r.bc}${g ? ' · ' + g : ''}` }));
          rows.push(...R);
          return `${groups.length > 1 ? `<div style="font-weight:800;margin:10px 0 2px">${esc(g)}</div>` : ''}<div class="sheet-table" style="margin-top:0"><table><tr><th>#</th><th>Équipe</th><th>Pts</th><th>J</th><th>G-N-P</th><th>Diff</th></tr>
            ${rk.map((r, i) => `<tr><td>${r.j ? medal(i) : '–'}</td><td><b>${esc(r.t)}</b>${memb(mOf(r.t))}</td><td><b>${r.pts}</b></td><td>${r.j}</td><td>${r.g}-${r.n}-${r.p}</td><td>${r.bp - r.bc > 0 ? '+' : ''}${r.bp - r.bc}</td></tr>`).join('')}</table></div>`; }).join('');
        const top = groups.map(g => tStand(t, g)[0]).filter(r => r && r.j);
        if (top.length) lead += ' · en tête : ' + top.map(r => r.t).join(', ');
      } else if (f === 'elim') {
        const E = tElim(t), R = E.length, fin = E[R - 1][0], champ = fin && fin.w, out = {};
        E.forEach((rd, k) => rd.forEach(n => { if (n.bye || n.w == null || n.a == null || n.b == null) return; const l = n.w === n.a ? n.b : n.a; out[l] = k + 1; }));
        const side = (n, s, j) => { const nm = n[s], c = nm == null ? 'e' : n.w != null && !n.bye ? (n.w === nm ? 'w' : 'l') : n.bye ? 'w' : '';
          return `<div class="${c}"><span>${nm != null ? esc(nm) : n.bye ? 'exempt' : '…'}</span><b>${n.sc ? n.sc[j] : ''}</b></div>`; };
        rows = M.map(x => { const k = out[x.name], ch = champ != null && x.name === champ;
          return { rk: ch ? 1 : k ? 2 ** (R - k) + 1 : '', name: x.name, members: x.members || [], res: ch ? '🏆 Vainqueur' : k ? (k === R ? 'Finaliste' : 'Éliminé en ' + elimName(t, k).toLowerCase()) : 'En course' }; })
          .sort((a, b) => (a.rk === '' ? 1e9 : a.rk) - (b.rk === '' ? 1e9 : b.rk) || a.name.localeCompare(b.name, 'fr', { numeric: true }));
        body = `${champ ? `<div class="tn-champ">🏆 Champion : ${esc(champ)}</div>` : ''}
          <div class="tn-br" style="margin-top:8px">${E.map((rd, k) => `<div class="rd"><h4>${elimName(t, k + 1)}</h4>${rd.map(n => `<div class="mt">${side(n, 'a', 0)}${side(n, 'b', 1)}</div>`).join('')}</div>`).join('')}</div>
          ${rankTable(rows, 'Parcours')}`;
      } else if (f === 'pyramide') {
        const { ranks, log } = tPyr(t), V = {}, Dd = {};
        log.forEach(l => { if (l.cs === l.ds) return; const w = l.won ? l.c : l.d, lo = l.won ? l.d : l.c; V[w] = (V[w] || 0) + 1; Dd[lo] = (Dd[lo] || 0) + 1; });
        let pyr = '', i = 0, w = 1;
        while (i < ranks.length) { pyr += `<div class="pr">${ranks.slice(i, i + w).map((n, k) => `<div class="pc"><small>#${i + k + 1}</small>${esc(n)}</div>`).join('')}</div>`; i += w; w++; }
        rows = ranks.map((n, k) => ({ rk: k + 1, name: n, members: mOf(n), res: `ligne ${pyrRow(k) + 1} · ${V[n] || 0} V · ${Dd[n] || 0} D` }));
        body = `<div class="tn-pyr" style="margin:6px 0 10px">${pyr}</div>${rankTable(rows, 'Pyramide')}`;
      } else {
        const { ranks } = tAtp(t);
        rows = ranks.map((r, i) => ({ rk: i + 1, name: r.n, members: [], res: `${fmtP(r.pts)} pts · ${r.v} V ${r.nul} N ${r.d} D${r.arb ? ` · ${r.arb} arbitrage${r.arb > 1 ? 's' : ''}` : ''}` }));
        body = rankTable(rows, 'Points', false);
      }
      if (typeof epsMatchesPies === 'function') body += epsPieCard('📊 Synthèse du tournoi', f === 'atp' ? [epsPie(epsSegs(Object.fromEntries(tAtp(t).ranks.map(r => [r.n, r.v]))), 'Victoires'), epsPie(epsSegs(Object.fromEntries(tAtp(t).ranks.map(r => [r.n, Math.round(r.pts)]))), 'Points ATP')] : epsMatchesPies(ms), true);
      body += `<button class="btn btn-ghost btn-block" style="margin-top:10px" data-om="${esc(t.id)}">🏆 Ouvrir dans Gestion de match</button>`;
      return { kind: 'tournoi', date: last, icon: fmtI(f, t.sport), title: t.nom || 'Tournoi', event: t.nom || 'Tournoi',
        sub: `${fmtN(f, t.sport)} · ${esc(sportN(t.sport))} · ${dFr(t.date)}${last > (t.date || 0) && dFr(last) !== dFr(t.date) ? ' → ' + dFr(last) : ''} · ${M.length} ${f === 'atp' ? 'joueurs' : 'équipes'}`,
        lead, body, rows: csvRows(rows) };
    });
  }

  /* ================= MATCHS (hors tournoi) ================= */
  function matchs(cls) {
    const T = new Set((typeof TR === 'function' ? TR() : []).map(t => t.id));
    return DB.matchs.filter(m => !m.obsOnly && !(m.tid && T.has(m.tid)) && inferClass([...(m.pa || []), ...(m.pb || [])]) === cls).map(m => {
      const a = +m.sa || 0, b = +m.sb || 0, wa = a > b, wb = b > a;
      const rk = x => a === b ? 1 : x ? 1 : 2, res = x => `${x ? a : b}–${x ? b : a} · ${a === b ? 'Nul' : (x ? wa : wb) ? 'Victoire' : 'Défaite'}`;
      return { kind: 'match', date: m.date || 0, flat: true, icon: '⚔️', event: `${m.a} – ${m.b}`, own: { arr: () => DB.matchs, recs: [m] },
        body: `<div class="card cl-ev"><div class="muted" style="font-size:.82rem">${esc(sportN(m.sport))} · ${dFull(m.date)} ${hhmm(m.date)}${m.tn ? ' · ' + esc(m.tn) : ''}</div>
          <div class="cl-sc"><div><b class="${wa ? 'cl-w' : ''}">${wa ? '🏆 ' : ''}${esc(m.a)}</b>${memb(m.pa)}</div><span class="s">${a} – ${b}</span><div><b class="${wb ? 'cl-w' : ''}">${esc(m.b)}${wb ? ' 🏆' : ''}</b>${memb(m.pb)}</div></div>
          ${typeof epsMatchPies === 'function' && (a || b) ? `<details style="margin-top:8px"><summary style="cursor:pointer;font-weight:800;font-size:.85rem">📊 Synthèse du match</summary><div class="pie-wrap" style="margin-top:8px">${epsMatchPies(m).join('')}</div></details>` : ''}</div>`,
        rows: [[rk(true), m.a, (m.pa || []).join(', '), res(true)], [rk(false), m.b, (m.pb || []).join(', '), res(false)]].sort((x, y) => x[0] - y[0]) };
    });
  }

  /* ================= HYROX / CROSSTRAINING (même jour + classe + épreuve = 1 séance) ================= */
  function wods(cls) {
    const S = ((DB.wod || {}).seances || []).filter(s => s.classe === cls && s.snap), G = [];
    S.forEach(s => { const k = [dFr(s.date), s.classe || '', s.snap.id || s.snap.nom].join('|'); let x = G.find(y => y.k === k); if (!x) G.push(x = { k, list: [] }); x.list.push(s); });
    const resOf = (g, e) => { const t = g.dep && g.arr ? (g.arr - g.dep) / 1000 : null; return { t, ecart: t != null ? t - e.prevu * 60 : null, cap: g.capped || (t != null && t > e.cap * 60) }; };
    return G.map(x => { const e = x.list[0].snap, hy = e.sport === 'hyrox', date = Math.max(...x.list.map(s => s.date));
      const L = x.list.flatMap(s => (s.groups || []).map(g => ({ g, r: resOf(g, s.snap) }))).sort((a, b) => (a.r.cap - b.r.cap) || ((a.r.t ?? 1e9) - (b.r.t ?? 1e9)));
      const rows = L.map(({ g, r }, k) => ({ rk: r.t != null ? k + 1 : '', name: g.name, members: g.members || [],
        res: r.t != null ? `${sec(r.t)}${r.cap ? ' (time cap)' : ''} · écart ${r.ecart > 0 ? '+' : ''}${sec(r.ecart)} / ${e.prevu} min · blocs ${(g.splits || []).filter(Boolean).length}/${(e.blocs || []).length}` : 'non terminé' }));
      const w = rows.find(r => r.rk === 1);
      return { kind: 'wod', date, icon: '🏋️', own: { arr: () => (DB.wod || {}).seances, recs: x.list }, title: `${hy ? 'HYROX' : 'Crosstraining'} · ${e.nom}`, event: `${hy ? 'HYROX' : 'Crosstraining'} · ${e.nom}`,
        sub: `${dFull(date)} · ${L.length} groupe${L.length > 1 ? 's' : ''} · ${e.prevu} min prévues · cap ${e.cap} min${x.list.length > 1 ? ` · ${x.list.length} tablettes` : ''}`,
        lead: w ? `🥇 ${w.name} · ${w.res.split(' · ')[0]}` : '', body: rankTable(rows, 'Temps · écart'), rows: csvRows(rows) }; });
  }

  /* ================= COURSE D'ORIENTATION (même jour + classe + parcours) ================= */
  function cos(cls) {
    const S = ((DB.co || {}).seances || []).filter(s => s.classe === cls && s.parcoursSnap), G = new Map();
    const dk = t => { const d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
    S.forEach(s => { const k = dk(s.date) + '|' + (s.classe || '') + '|' + (s.parcours || s.parcoursSnap.nom); if (!G.has(k)) G.set(k, { recs: [], date: s.date }); const g = G.get(k); g.recs.push(s); g.date = Math.max(g.date, s.date); });
    const res = (r, p) => { const found = new Set(r.found || []), bal = p.balises || [], pts = bal.filter(b => found.has(b.num)).reduce((a, b) => a + ((p.pts || [])[b.niv - 1] || 0), 0);
      const miss = bal.filter(b => b.ob && !found.has(b.num)).length, temps = r.dep && r.arr ? (r.arr - r.dep) / 1000 : null, wrong = r.wrong || 0;
      const overMin = temps != null && p.alloue ? Math.max(0, Math.ceil((temps - (p.alloue + p.ecart) * 60) / 60)) : 0;
      const penS = wrong * (p.penWrongS || 0) + miss * (p.penMissS || 0), penP = wrong * (p.penWrongP || 0) + overMin * (p.penOverP || 0);
      return { temps, penS, total: temps != null ? temps + penS : null, score: pts - penP, nb: found.size, tot: bal.length }; };
    return [...G.values()].map(g => { const by = new Map(), lvl = r => r.arr ? 2 : r.dep ? 1 : 0;
      g.recs.forEach(s => (s.runs || []).forEach(r => { const k = r.name + '|' + (r.members || []).join(','), o = by.get(k); if (!o || lvl(r) > lvl(o.r)) by.set(k, { r, p: s.parcoursSnap }); }));
      const p = g.recs.reduce((a, s) => s.date >= a.date ? s : a).parcoursSnap;
      const L = [...by.values()].filter(({ r }) => r.dep).map(({ r, p: q }) => ({ r, x: res(r, q) }))
        .sort((a, b) => (b.x.temps != null) - (a.x.temps != null) || b.x.score - a.x.score || (a.x.total ?? 1e9) - (b.x.total ?? 1e9));
      const grp = L.some(({ r }) => (r.members || []).length > 1);
      const rows = L.map(({ r, x }, k) => ({ rk: x.temps != null ? k + 1 : '', name: r.name, members: grp || r.name !== (r.members || [])[0] ? r.members || [] : [],
        res: `${x.score} pts · ${x.temps != null ? sec(x.total) + (x.penS ? ` (dont +${sec(x.penS)} pén.)` : '') : 'non arrivé'} · ${x.nb}/${x.tot} balises` }));
      const w = rows.find(r => r.rk === 1), typ = (typeof CO_TYPES !== 'undefined' && CO_TYPES[p.type] || [''])[0];
      return { kind: 'co', date: g.date, icon: '🧭', own: { arr: () => (DB.co || {}).seances, recs: g.recs }, title: p.nom, event: 'CO · ' + p.nom,
        sub: `${dFull(g.date)}${typ ? ' · ' + typ : ''} · ${L.length} ${grp ? 'équipe' : 'coureur'}${L.length > 1 ? 's' : ''}${g.recs.length > 1 ? ` · ${g.recs.length} tablettes` : ''}`,
        lead: w ? `🥇 ${w.name} · ${w.res.split(' · ').slice(0, 2).join(' · ')}` : '', body: rankTable(rows, 'Points · temps'), rows: csvRows(rows) }; });
  }

  /* ================= COMBINÉ ATHLÉTIQUE (même jour + classe + épreuve) ================= */
  function combines(cls) {
    const S = ((DB.combine || {}).seances || []).filter(s => s.classe === cls && s.cfg), hasS = c => c.format === 'triathlon';
    const cbOK = typeof cbRes === 'function' && typeof cbFmt === 'function';   // combine.js : plusieurs courses, élan sans / avec
    const sig = s => { const c = s.cfg; return [new Date(s.date).toDateString(), s.classe, c.format, c.orga, c.cMode, cbOK ? cbFmt(c) : c.cMode === 'distance' ? c.cDist : c.cDur, c.tour, c.plotOn ? c.plot : 0, c.lEssais, c.lMesure, c.lElan, hasS(c) ? c.sEssais + c.sElan : ''].join('|'); };
    const vals = a => (a || []).map(x => parseFloat(String(x).replace(',', '.'))).filter(x => !isNaN(x) && x > 0);
    const resOf = (c, e) => { if (cbOK) { const r = cbRes(c, e); return { d: r.d, t: r.t, v: r.v, l: r.lBest, s: r.sBest }; } const d = c.cMode === 'distance' ? c.cDist : (e.tours || 0) * c.tour + (c.plotOn ? (e.plots || 0) * c.plot : 0);
      const t = c.cMode === 'duree' ? (d > 0 ? c.cDur * 60 : null) : (e.dep && e.arr ? (e.arr - e.dep) / 1000 : null), L = vals(e.lancers), Sa = vals(e.sauts);
      return { d, t, v: t && d ? d / t * 3.6 : 0, l: L.length ? Math.max(...L) : 0, s: Sa.length ? Math.max(...Sa) : 0 }; };
    const M = new Map();
    S.forEach(s => { const k = sig(s), m = M.get(k) || M.set(k, { date: s.date, last: s.date, cfg: s.cfg, recs: [], groups: [] }).get(k); m.recs.push(s); m.groups.push(...(s.groups || [])); m.last = Math.max(m.last, s.date); });
    return [...M.values()].map(m => { const c = m.cfg, grp = c.orga === 'grp', dist = c.cMode === 'distance', lu = c.lMesure === 'distance' ? 'm' : c.lMesure === 'zones' ? 'zone' : 'pts';
      const L = m.groups.map(g => { const R = (g.eleves || []).map(e => resOf(c, e)), okv = R.filter(r => r.v);
        return { g, R, v: okv.length ? okv.reduce((a, r) => a + r.v, 0) / okv.length : 0, t: okv.length && dist ? okv.reduce((a, r) => a + r.t, 0) / okv.length : null,
          d: R.length ? R.reduce((a, r) => a + r.d, 0) / R.length : 0, l: Math.max(0, ...R.map(r => r.l)), s: Math.max(0, ...R.map(r => r.s)), any: R.some(r => r.v || r.l || r.s) }; })
        .filter(x => x.any).sort((a, b) => b.v - a.v || b.l - a.l);
      const rows = L.map((x, k) => ({ rk: x.v ? k + 1 : '', name: x.g.name, members: grp ? (x.g.eleves || []).map(e => e.nom) : [],
        res: [x.v ? `${grp ? 'moy. ' : ''}${dist ? sec(x.t) : Math.round(x.d) + ' m'} (${dec(x.v)} km/h)` : 'course non terminée', hasS(c) ? `saut ${x.s ? dec(x.s) + ' m' : '–'}` : '', `lancer ${x.l ? dec(x.l) + ' ' + lu : '–'}`].filter(Boolean).join(' · ') }));
      const w = rows.find(r => r.rk === 1), nm = `${hasS(c) ? 'Triathlon' : 'Duathlon'} · ${cbOK ? cbFmt(c) : dist ? c.cDist + ' m' : c.cDur + ' min'}`;
      return { kind: 'combine', date: m.last, icon: '🏃', own: { arr: () => (DB.combine || {}).seances, recs: m.recs }, title: 'Combiné · ' + nm, event: 'Combiné · ' + nm,
        sub: `${dFull(m.date)} · ${grp ? 'groupes' : 'individuel'} · ${L.length} ${grp ? 'groupe' : 'élève'}${L.length > 1 ? 's' : ''}${m.recs.length > 1 ? ` · ${m.recs.length} tablettes` : ''}`,
        lead: w ? `🥇 ${w.name} · ${w.res.split(' · ')[0]}` : '', body: rankTable(rows, grp ? 'Moyenne course · meilleurs essais' : 'Course · essais'), rows: csvRows(rows) }; });
  }

  /* ================= DUATHLON (même jour + classe + réglages) ================= */
  function duathlons(cls) {
    const S = ((DB.duathlon || {}).seances || []).filter(s => s.classe === cls && s.cfg), M = new Map();
    const stepOf = (c, g, e) => { const E = g.etapes[e] || { m: {} }, ms = g.members.map(n => E.m[n] || { pts: 0, tours: 0, inval: 0, penC: 0 }), S2 = k => ms.reduce((a, m) => a + (m[k] || 0), 0);
      const temps = E.dep && E.arr ? (E.arr - E.dep) / 1000 : null, penS = c.optC ? S2('penC') * c.secC : 0;
      return { pts: S2('pts'), tours: S2('tours'), total: temps != null ? temps + penS : null }; };
    const totalOf = (c, g) => { const st = [0, 1, 2].map(e => stepOf(c, g, e));
      return { pts: st.reduce((a, x) => a + x.pts, 0), tours: st.reduce((a, x) => a + x.tours, 0), temps: st.every(x => x.total != null) ? st.reduce((a, x) => a + x.total, 0) : null,
        partiel: st.reduce((a, x) => a + (x.total || 0), 0), done: st.filter(x => x.total != null).length }; };
    S.forEach(C => { const k = [new Date(C.date).toDateString(), C.classe, JSON.stringify(C.cfg)].join('|'), m = M.get(k) || M.set(k, { date: C.date, last: C.date, cfg: C.cfg, noms: [], recs: [], groups: [] }).get(k);
      m.recs.push(C); m.groups.push(...(C.groups || [])); m.last = Math.max(m.last, C.date); if (!m.noms.includes(C.nom)) m.noms.push(C.nom); });
    return [...M.values()].map(m => { const L = m.groups.filter(g => Array.isArray(g.etapes)).map(g => ({ g, T: totalOf(m.cfg, g) })).sort((a, b) => (b.T.done - a.T.done) || (a.T.partiel - b.T.partiel) || (b.T.pts - a.T.pts));
      const rows = L.map(({ g, T }, k) => ({ rk: T.done ? k + 1 : '', name: g.name, members: g.members,
        res: `${T.temps != null ? sec(T.temps) : T.done ? sec(T.partiel) + ` (${T.done}/3 étapes)` : 'non parti'} · ${T.pts} pts lancers · ${T.tours} tours` }));
      const w = rows.find(r => r.rk === 1), nm = m.noms.join(' / ') || 'Duathlon';
      return { kind: 'duathlon', date: m.last, icon: '🥏', own: { arr: () => (DB.duathlon || {}).seances, recs: m.recs }, title: nm, event: 'Duathlon · ' + nm,
        sub: `${dFull(m.date)} · ${L.length} groupe${L.length > 1 ? 's' : ''} · 3 étapes${m.recs.length > 1 ? ` · ${m.recs.length} tablettes` : ''}`,
        lead: w ? `🥇 ${w.name} · ${w.res.split(' · ')[0]}` : '', body: rankTable(rows, 'Temps cumulé · lancers'), rows: csvRows(rows) }; });
  }

  /* ================= RELAIS (même jour + classe + nombre de relais) ================= */
  function relais(cls) {
    const G = [];
    ((DB.relais || {}).courses || []).filter(c => c.classe === cls).sort((a, b) => (a.at || 0) - (b.at || 0)).forEach(c => {
      const g = G.find(x => x.date === c.date && x.legs === c.legs); if (g) g.recs.push(c); else G.push({ date: c.date, legs: c.legs, recs: [c] }); });
    return G.map(g => { const Mp = new Map(); g.recs.forEach(r => (r.teams || []).forEach(t => Mp.set(t.name, t)));
      const dist = (g.recs.find(r => r.dist) || {}).dist || 0, T = [...Mp.values()].sort((a, b) => (a.total || Infinity) - (b.total || Infinity) || (b.legs || []).length - (a.legs || []).length);
      const at = Math.max(...g.recs.map(r => r.at || 0)) || new Date(g.date + 'T12:00').getTime();
      const rows = T.map((t, k) => ({ rk: t.total ? k + 1 : '', name: t.name, members: t.members || [], res: t.total ? fmt(t.total) : `${(t.legs || []).length}/${g.legs} relais` }));
      const w = rows.find(r => r.rk === 1), nm = `${g.legs} relais${dist ? ' × ' + dist + ' m' : ''}`, zr = g.recs.slice().reverse().find(r => r.zt != null) || {};
      const zs = ` · transmission ${dec(zr.zt != null ? +zr.zt || 20 : 20)} m · élan ${dec(zr.ze != null ? +zr.ze || 0 : 10)} m`;
      return { kind: 'relais', date: at, icon: '🔁', own: { arr: () => (DB.relais || {}).courses, recs: g.recs }, title: 'Relais · ' + nm, event: 'Relais · ' + nm,
        sub: `${dFull(at)} · ${T.length} équipe${T.length > 1 ? 's' : ''}${zs}${g.recs.length > 1 ? ` · ${g.recs.length} enregistrements` : ''}`,
        lead: w ? `🥇 ${w.name} · ${w.res}` : '', body: rankTable(rows, 'Temps'), rows: csvRows(rows) }; });
  }

  /* ================= CROSS DU COLLÈGE (élèves de la classe arrivés + rang de la classe) ================= */
  function crosses(cls) {
    if (!window.CROSS) return [];
    return CROSS.events().filter(E => (E.classes || []).includes(cls)).map(E => {
      const K = CROSS.compute(E), R = K.courses.flatMap((x, i) => x.R.filter(r => r.s.cls === cls).map(r => ({ r, n: x.R.length, i })));
      if (!R.length) return null;
      R.sort((a, b) => a.i - b.i || a.r.place - b.r.place);
      const L = CROSS.lvOf(E, cls), CR = L ? CROSS.classRank(E, K, L) : [], me = CR.find(c => c.cls === cls);
      const date = Math.max(E.created || 0, ...(E.arr || []).map(a => a.t || 0));
      const rows = R.map(({ r, n }) => ({ rk: r.place, name: r.s.name, members: [], res: `${r.c.name} · ${CROSS.perf(r)} · ${r.place}${r.place === 1 ? 'er' : 'e'}/${n}` }));
      return { kind: 'cross', date, icon: '🏁', title: E.name, event: 'Cross · ' + E.name,
        sub: `${dFull(date)} · ${R.length} élève${R.length > 1 ? 's' : ''} arrivé${R.length > 1 ? 's' : ''}`,
        lead: me ? `🏆 Classement des classes (${L}e) : ${me.rk}${me.rk === 1 ? 're' : 'e'} / ${CR.length} · score ${dec(me.score)}` : '',
        body: rankTable(rows, 'Course · perf · place', false), rows: csvRows(rows) };
    }).filter(Boolean);
  }

  const SRC = { tournoi: tournois, match: matchs, wod: wods, co: cos, combine: combines, duathlon: duathlons, relais, cross: crosses };
  /* Classes : celles de « Mes classes » + celles trouvées dans les résultats (classe supprimée ou renommée) */
  const allClasses = () => { const s = new Set(DB.classes.map(c => c.name));
    [...(typeof TR === 'function' ? TR() : []).map(t => t.classe), ...((DB.wod || {}).seances || []).map(x => x.classe), ...((DB.co || {}).seances || []).map(x => x.classe),
      ...((DB.combine || {}).seances || []).map(x => x.classe), ...((DB.duathlon || {}).seances || []).map(x => x.classe), ...((DB.relais || {}).courses || []).map(x => x.classe), ...((DB.cross || {}).events || []).flatMap(e => e.classes || [])].forEach(c => c && (!window.teamSees || teamSees(c)) && s.add(c));
    return [...s]; };
  const inPer = d => { if (per === 'all') return true; if (per === 'day') return new Date(d).toDateString() === new Date().toDateString(); return d >= Date.now() - 7 * 864e5; };
  const collect = cls => { const all = {}; Object.keys(SRC).forEach(k => { try { all[k] = SRC[k](cls).filter(e => inPer(e.date)).sort((a, b) => b.date - a.date); } catch (err) { console.warn('collectifs', k, err); all[k] = []; } }); return all; };

  TOOL_IMPL.collectifs = function (el) {
    const CL = allClasses();
    if (!CL.length) { el.innerHTML = noClassMsg; return; }
    let cls = CL.includes(DB.lastClass) ? DB.lastClass : CL[0];
    const draw = () => {
      const all = collect(cls), kinds = act === 'all' ? Object.keys(SRC) : [act], shown = kinds.flatMap(k => all[k]), n = k => k === 'all' ? Object.values(all).reduce((a, l) => a + l.length, 0) : all[k].length;
      const selOK = shown.filter(e => e.own && e.own.recs.length), key = e => e.own.recs[0];
      if (!selOK.length) multi = false;
      sel = new Set(selOK.map(key).filter(o => sel.has(o)));
      const card0 = e => e.flat ? e.body : `<details class="card cl-ev"><summary><div class="cl-h"><span class="cl-i">${e.icon}</span><div style="flex:1;min-width:0"><b>${esc(e.title)}</b><div class="muted" style="font-size:.82rem">${e.sub}</div>${e.lead ? `<div class="cl-lead">${esc(e.lead)}</div>` : ''}</div><span class="cl-ch">▶</span></div></summary><div class="cl-b">${e.body}</div></details>`;
      const card = e => !multi ? card0(e) : e.own ? `<div class="cl-sl"><input type="checkbox" data-cfg="bare" data-sk="${selOK.indexOf(e)}" aria-label="Sélectionner ${esc(e.event)}"><div>${card0(e)}</div></div>`
        : `<div class="cl-sl"><span style="width:24px;flex:0 0 auto"></span><div>${card0(e)}<div class="muted" style="font-size:.75rem;margin-top:3px">${e.kind === 'cross' ? 'À supprimer dans l\'outil Cross.' : 'À supprimer dans Gestion de match.'}</div></div></div>`;
      const perTxt = { day: 'aujourd\'hui', week: 'ces 7 derniers jours', all: '' }[per];
      el.innerHTML = `<div class="card"><label style="margin-top:0">Classe</label><select id="cc">${CL.map(c => `<option ${c === cls ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
          <div class="seg" style="margin-top:10px">${[['day', 'Aujourd\'hui'], ['week', '7 derniers jours'], ['all', 'Tout']].map(([k, l]) => `<button data-per="${k}" class="${per === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
        <div class="chips">${KINDS.map(([k, l]) => `<button class="chip ${act === k ? 'active' : ''}" data-act="${k}">${l}${n(k) ? ` · ${n(k)}` : ''}</button>`).join('')}</div>
        <div class="section-title"><h2>Résultats collectifs (${shown.length})</h2><span style="display:flex;gap:14px;flex-wrap:wrap;justify-content:flex-end">${selOK.length ? `<button class="link" id="cl-multi" data-cfg="bare">${multi ? '✕ Fermer la sélection' : '☑️ Sélection multiple'}</button>` : ''}${shown.length ? '<button class="link" id="exp">📤 Exporter CSV</button>' : ''}</span></div>
        ${multi ? `<div class="card" id="cl-sel" data-cfg="bare" style="position:sticky;top:0;z-index:5"><b>☑️ Sélection multiple</b><div class="muted" style="font-size:.8rem;margin-top:2px">Cochez les résultats à supprimer. Ils seront aussi effacés de leur outil (Relais, HYROX, CO…).</div>
          <div class="cl-bar"><button class="btn btn-ghost" id="cl-all">Tout cocher</button><button class="btn btn-danger" id="cl-del" disabled>🗑 Supprimer la sélection</button></div></div>` : ''}
        ${shown.length ? kinds.filter(k => all[k].length).map(k => `<div class="section-title" style="margin-top:16px"><h2>${SECT[k]} <span class="muted" style="font-weight:700">(${all[k].length})</span></h2></div>${all[k].map(card).join('')}`).join('')
          : `<div class="card empty">Aucun résultat collectif pour <b>${esc(cls)}</b>${perTxt ? ' ' + perTxt : ''}${act !== 'all' ? ' dans cette activité' : ''}.<br><br>
            <span style="font-size:.88rem">Les résultats d'équipes et de groupes apparaissent ici automatiquement :<br>🏆 tournois et ⚔️ matchs de <b>Gestion de match</b> (équipes composées avec les élèves de la classe),<br>🏋️ séances <b>HYROX / Crosstraining</b>, 🧭 <b>Course d'orientation</b>, 🏃 <b>Combiné</b>, 🥏 <b>Duathlon</b>, 🔁 <b>Relais</b> et 🏁 <b>Cross</b> enregistrés avec cette classe.</span></div>`}`;
      const $ = s => el.querySelector(s);
      $('#cc').onchange = () => { cls = $('#cc').value; if (DB.classes.some(c => c.name === cls)) { DB.lastClass = cls; save(); } draw(); };
      el.querySelectorAll('[data-per]').forEach(b => b.onclick = () => { per = b.dataset.per; draw(); });
      el.querySelectorAll('[data-act]').forEach(b => b.onclick = () => { act = b.dataset.act; draw(); });
      el.querySelectorAll('[data-om]').forEach(b => b.onclick = () => { const id = b.dataset.om, tn = (DB.tournois || []).find(x => x.id === id); openTool(window.matchToolOf && tn ? matchToolOf(tn.sport) : 'match');
        setTimeout(() => { const x = document.querySelector(`#screen-body [data-tv="${CSS.escape(id)}"]`); if (x) x.click(); else toast('Tournoi disponible dans l\'historique de Gestion de match'); }, 60); });
      if ($('#cl-multi')) $('#cl-multi').onclick = () => { multi = !multi; sel.clear(); draw(); };
      if (multi) {
        const upd = () => { el.querySelectorAll('[data-sk]').forEach(c => { c.checked = sel.has(key(selOK[+c.dataset.sk])); c.closest('.cl-sl').classList.toggle('on', c.checked); });
          const n = sel.size; $('#cl-del').disabled = !n; $('#cl-del').textContent = n ? `🗑 Supprimer la sélection (${n})` : '🗑 Supprimer la sélection';
          $('#cl-all').textContent = n === selOK.length ? 'Tout décocher' : 'Tout cocher'; };
        el.querySelectorAll('[data-sk]').forEach(c => c.onchange = () => { const o = key(selOK[+c.dataset.sk]); c.checked ? sel.add(o) : sel.delete(o); upd(); });
        $('#cl-all').onclick = () => { if (sel.size === selOK.length) sel.clear(); else selOK.forEach(e => sel.add(key(e))); upd(); };
        $('#cl-del').onclick = () => { const E = selOK.filter(e => sel.has(key(e))); if (!E.length) return;
          const nr = E.reduce((a, e) => a + e.own.recs.length, 0), kinds = [...new Set(E.map(e => ACT[e.kind]))].join(', ');
          if (!confirm(`Supprimer ${E.length} résultat${E.length > 1 ? 's' : ''} collectif${E.length > 1 ? 's' : ''} (${kinds})${nr > E.length ? ` — ${nr} enregistrements de tablettes` : ''} ?\nIls seront aussi effacés de leur outil, sur toutes les tablettes synchronisées.`)) return;
          E.forEach(e => { const A = e.own.arr(); if (!Array.isArray(A)) return; e.own.recs.forEach(r => { const i = A.indexOf(r); if (i >= 0) A.splice(i, 1); }); });
          sel.clear(); multi = false; save(); window.syncFlush && window.syncFlush(); toast(`${E.length} résultat${E.length > 1 ? 's' : ''} supprimé${E.length > 1 ? 's' : ''}`); draw(); };
        upd();
      }
      if ($('#exp')) $('#exp').onclick = () => download(`resultats-collectifs-${cls}-${new Date().toISOString().slice(0, 10)}.csv`.replace(/[^\w.-]+/g, '-'), csv([
        ['Date', 'Activité', 'Événement', 'Rang', 'Équipe / groupe', 'Membres', 'Résultat'],
        ...shown.slice().sort((a, b) => a.date - b.date).flatMap(e => e.rows.map(r => [dFr(e.date), ACT[e.kind], e.event, ...r]))]));
    };
    draw();
  };
})();
