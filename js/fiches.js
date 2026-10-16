/* =========================================================
   EPS ONE — 🧑‍🎓 Fiches élèves visuelles + validation de la classe en couleurs
   Fabriquées au clic à partir des données existantes (rien n'est stocké) :
   - validation enseignant : 4 niveaux de maîtrise en couleurs, points par critère, note /20, radar
   - tournois, matchs, classements, courses d'équipes… où l'élève a joué (tous les outils)
   - résultats des outils, grilles d'évaluation
   ========================================================= */
(() => {
  const fr = x => (Math.round(x * 10) / 10).toString().replace('.', ',');
  const dt = ts => new Date(ts).toLocaleDateString('fr-FR');
  const plain = s => String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
  const noteCol = n => n >= 16 ? '#1B9E5A' : n >= 11 ? '#2F6BD8' : n >= 6 ? '#E0892F' : '#D64545';
  const Mx = () => window.EPS_M || [['Maîtrise insuffisante', '#D64545', 'Insuff.'], ['Maîtrise fragile', '#E0892F', 'Fragile'], ['Maîtrise satisfaisante', '#2F6BD8', 'Satisf.'], ['Très bonne maîtrise', '#1B9E5A', 'Très bonne']];
  const KCOL = { tournoi: '#C9A227', match: '#E0892F', wod: '#E53935', co: '#1B9E5A', combine: '#1E5BD8', duathlon: '#16A3A3', relais: '#8E44AD', cross: '#D64545' };
  const COLS = ['#1E5BD8', '#C9A227', '#1B9E5A', '#E0892F', '#8E44AD', '#D64545', '#0B2A5B', '#16A3A3', '#9C7A1E', '#5B8DEF', '#B0127A', '#4F6D7A'];
  const has = f => typeof f === 'function';
  const toolOfSport = sp => { try { return typeof matchToolOf === 'function' ? matchToolOf(sp) : 'match'; } catch (e) { return 'match'; } };
  const KT = { tournoi: null, match: null, wod: 'wod', co: 'co', combine: 'combine', duathlon: 'duathlon', relais: 'relais', cross: 'cross' };
  /* événement collectif sans aucune donnée enregistrée (ex. tournoi dont les matchs ne sont pas arrivés) : à ne pas afficher */
  const evHasData = e => !(e && e.kind === 'tournoi' && e.tid) || (Array.isArray(DB.matchs) && DB.matchs.some(m => m.tid === e.tid && !m.obsOnly));
  window.fichesEvData = evHasData;
  const dayS = ts => ts ? new Date(+ts).toDateString() : '';
  /* événement collectif retenu ? (activité choisie / outils cochés / jour de l'évaluation) */
  const actValOk = (act, k) => { const [t, sb] = k.split(':'); if (t !== act.tool) return false; if (!act.sport) return true; const VT = (typeof VAL_TOOLS !== 'undefined' && VAL_TOOLS[t]) || {}; return sb ? sb === act.sport : !(VT.sub && VT.sub[act.sport]); };
  const actById = id => { const m = /^(sp|tl):(.+)$/.exec(id || ''); if (!m) return null; if (m[1] === 'sp') { const t = toolOfSport(m[2]); return { id, sport: m[2], tool: t, tools: [t] }; } return { id, sport: null, tool: m[2], tools: [m[2]] }; };
  window.fichesActById = actById; window.fichesActValOk = actValOk;
  function evOk(e, o) {
    o = o || {}; if (!evHasData(e)) return false; const act = o.act, tl = o.tools, isSp = e.kind === 'tournoi' || e.kind === 'match', tool = isSp ? toolOfSport(e.sport) : KT[e.kind];
    if (act) { if (isSp) { if (!act.sport || e.sport !== act.sport) return false; } else if (!(act.tools || []).includes(tool)) return false; }
    else if (tl && tool && !tl.includes(tool)) return false;
    if (o.days && o.days.size) { const ds = [e.date]; if (e.tid && Array.isArray(DB.matchs)) DB.matchs.filter(m => m.tid === e.tid).forEach(m => ds.push(m.date)); if (!ds.some(d => o.days.has(dayS(d)))) return false; }
    return true;
  }
  /* poule d'une équipe dans un tournoi : { g, n, rank, pts, level } (level : niveau de jeu de la poule d'après les niveaux de la classe) */
  /* classement d'une poule d'après les RENCONTRES réellement jouées (même barème et mêmes départages que l'appli) */
  function stand2(T, g) {
    const P = T.pts || { v: 3, n: 2, d: 1 }, res = tResults(T), rs = T.rencontres.filter(r => (r.g || '') === g), s = {};
    rs.forEach(r => [r.a, r.b].forEach(x => { if (!s[x]) s[x] = { t: x, j: 0, g: 0, n: 0, p: 0, bp: 0, bc: 0, pts: 0 }; }));
    rs.forEach(r => { const m = res[r.id], A = s[r.a], B = s[r.b]; if (!m) return; const [x, y] = tScore(r, m);
      A.j++; B.j++; A.bp += x; A.bc += y; B.bp += y; B.bc += x;
      if (x > y) { A.g++; B.p++; A.pts += P.v; B.pts += P.d; } else if (x < y) { B.g++; A.p++; B.pts += P.v; A.pts += P.d; } else { A.n++; B.n++; A.pts += P.n; B.pts += P.n; } });
    return Object.values(s).sort((a, b) => b.pts - a.pts || (b.bp - b.bc) - (a.bp - a.bc) || b.bp - a.bp || a.t.localeCompare(b.t));
  }
  function poolOf(T, team) {
    try { if (!T || !T.rencontres || typeof tResults !== 'function' || typeof tScore !== 'function') return null; const fm = (typeof tFmt === 'function' ? tFmt(T) : T.format); if (fm !== 'poule') return null;
      const mine = [...new Set(T.rencontres.filter(r => r.a === team || r.b === team).map(r => r.g || ''))]; if (!mine.length) return null;
      const C = mine.map(g => { const st = stand2(T, g), i = st.findIndex(x => x.t === team); return { g, st, i, me: st[i] }; }).filter(x => x.me).sort((a, b) => b.me.j - a.me.j)[0]; if (!C) return null;
      const gs = [...new Set(T.rencontres.map(r => r.g || ''))], memOf = n => { const x = (T.teams || []).find(t => t.name === n); return x ? (x.members || []) : []; }; let level = '';
      if (gs.length > 1 && typeof lvlOf === 'function' && T.classe) { const av = G2 => { const L = stand2(T, G2).flatMap(x => memOf(x.t).map(m => lvlOf(T.classe, typeof m === 'object' ? m.n : m))).filter(v => v > 0); return L.length ? L.reduce((a, b) => a + b, 0) / L.length : 0; };
        const A = gs.map(x => [x, av(x)]); if (A.every(x => x[1] > 0)) { const sorted = A.slice().sort((a, b) => b[1] - a[1]), k = sorted.findIndex(x => x[0] === C.g); if (sorted[0][1] !== sorted[sorted.length - 1][1]) level = 'niveau ' + (sorted.length - k) + ' sur ' + sorted.length; } }
      const me = C.me; return { g: C.g, n: C.st.length, rank: me.j ? C.i + 1 : null, pts: me.pts, V: me.g, N: me.n, D: me.p, diff: me.bp - me.bc, j: me.j, level, multi: gs.length > 1 }; } catch (e) { return null; }
  }

  /* ---------- Validation enseignant : entrées d'un élève ---------- */
  function valEntries(cls, n, tools, act) {
    if (!has(window.valCrit) && typeof valCrit !== 'function') return [];
    const V = (DB.valid || {}).v || {}, lv = valLevelOf(cls), out = [];
    Object.keys(V).forEach(k => {
      const W = V[k] && V[k][cls] && V[k][cls][n]; if (!W || !valLvls(W).length) return;
      const [t, sb] = k.split(':'); if (act ? !actValOk(act, k) : tools && !tools.includes(t)) return;
      const T = VAL_TOOLS[t] || { n: t }, ck = valHasSet(k, lv) ? k + '@' + lv : k; let C = []; try { C = valCrit(ck); } catch (e) {} if (!C.length) return;
      const cfg = valCfg(ck), NT = cfg.on ? valNote(C, W, cfg) : null, L = valLvls(W), avg = epsMAvg(L);
      out.push({ k, ck, t, title: T.n + (sb ? ' · ' + ((T.sub && T.sub[sb] && T.sub[sb].n) || sb) : ''), C, W, cfg, NT, L, avg });
    });
    return out;
  }
  const valKeys = cls => Object.keys((DB.valid || {}).v || {}).filter(k => ((DB.valid.v[k] || {})[cls]));

  /* Radar (≥ 3 axes) : valeurs 0..1 */
  function radar(labels, vals, color) {
    const n = labels.length, S = 250, c = S / 2, R = 60, pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [c + r * Math.cos(a), c + r * Math.sin(a)]; };
    const ring = f => labels.map((_, i) => pt(i, R * f).map(x => x.toFixed(1)).join(',')).join(' ');
    const poly = vals.map((v, i) => pt(i, R * Math.max(.04, v)).map(x => x.toFixed(1)).join(',')).join(' ');
    return `<svg viewBox="0 0 ${S} ${S}" width="220" height="220" class="rad">${[.25, .5, .75, 1].map(f => `<polygon points="${ring(f)}" fill="none" stroke="#D5DCEA" stroke-width="1"/>`).join('')}
      ${labels.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#D5DCEA"/>`; }).join('')}
      <polygon points="${poly}" fill="${color}44" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>
      ${vals.map((v, i) => { const [x, y] = pt(i, R * Math.max(.04, v)); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="${color}"/>`; }).join('')}
      ${labels.map((l, i) => { const [x, y] = pt(i, R + 17), a = x < c - 6 ? 'end' : x > c + 6 ? 'start' : 'middle'; return `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="${a}" font-size="9.5" font-weight="800" fill="#0E1A33">${esc(l.length > 11 ? l.slice(0, 10) + '…' : l)}</text>`; }).join('')}</svg>`;
  }

  /* Une ligne de critère : 4 cases de couleur (la case choisie est pleine) + points */
  function critRow(c, W, cfg) {
    const M = Mx(), l = W[c.id], [sec, nm] = typeof valSplit === 'function' ? valSplit(c.n) : [null, c.n];
    if (l == null) return `<div class="cr"><div class="cn d">${esc(nm)}</div><div class="lv4 none"><span>non observé</span></div><div class="cp"></div></div>`;
    const p = cfg.on ? valPt(c.id, W, cfg) : null;
    return `<div class="cr"><div class="cn">${esc(nm)}</div><div class="lv4">${M.map((m, i) => `<span style="background:${i === l ? m[1] : m[1] + '26'};${i === l ? 'color:#fff;font-weight:900' : ''}">${i === l ? esc(m[2] || m[0]) : ''}</span>`).join('')}</div>
      <div class="cp" style="${p != null ? `background:${noteCol(p)}` : `background:${M[l][1]}`}">${p != null ? fr(p) : ''}</div></div>`;
  }

  /* Carte d'une validation (un outil) pour un élève */
  function valCard(e) {
    const M = Mx(), { C, W, cfg, NT, L, avg } = e, G = valGroups(C), cnt = M.map((_, i) => L.filter(x => x === i).length), tot = L.length;
    const obsDate = W._t && +W._t > 1e12 ? ` · ${dt(+W._t)}` : '';
    const secRows = G.map(g => { const sc = g.sec ? (NT && NT.sub[g.sec] != null ? NT.sub[g.sec] : null) : null, lv = epsMAvg(g.items.map(c => W[c.id]).filter(x => x != null));
      return `${g.sec ? `<div class="sh" style="border-color:${VAL_SEC[g.sec] || '#0B2A5B'};color:${VAL_SEC[g.sec] || '#0B2A5B'}"><b>${esc(g.sec)}</b>${sc != null ? `<span class="sn" style="background:${noteCol(sc)}">${fr(sc)}/20</span>` : lv != null ? `<span class="sn" style="background:${M[lv][1]}">${esc(M[lv][2] || M[lv][0])}</span>` : ''}</div>` : ''}${g.items.map(c => critRow(c, W, cfg)).join('')}`; }).join('');
    const rl = G.filter(g => g.sec).length >= 3 ? G.filter(g => g.sec).map(g => { const sc = NT && NT.sub[g.sec] != null ? NT.sub[g.sec] / 20 : null, a = epsMAvg(g.items.map(c => W[c.id]).filter(x => x != null)); return { l: g.sec, v: sc != null ? sc : a != null ? (a + 1) / 4 : null }; }).filter(x => x.v != null) : [];
    const radarHTML = rl.length >= 3 ? `<div class="rdw">${radar(rl.map(x => x.l), rl.map(x => x.v), avg != null ? M[avg][1] : '#1E5BD8')}</div>` : '';
    const leg = `<div class="lgd">${M.map((m, i) => `<span><i style="background:${m[1]}"></i>${esc(m[0])}${cfg.on ? ` <small>${cfg.bands[i][0]}–${cfg.bands[i][1]} pts</small>` : ''}</span>`).join('')}</div>`;
    return `<div class="fa vcard"><div class="vh" style="background:linear-gradient(110deg,${avg != null ? M[avg][1] : '#667'},${avg != null ? M[avg][1] + 'BB' : '#889'})">
        <div><b style="font-size:1.08rem">${esc(e.title)}</b><div class="vsub">${avg != null ? esc(M[avg][0]) : ''} · ${tot}/${C.length} critère${C.length > 1 ? 's' : ''} observé${tot > 1 ? 's' : ''}${obsDate}</div></div>
        ${NT ? `<div class="bign"><b>${fr(NT.n20)}</b><small>/20</small></div>` : ''}</div>
      <div class="vbody"><div class="vcol">${leg}<div class="dist">${cnt.map((k, i) => k ? `<i style="width:${k / tot * 100}%;background:${M[i][1]}" title="${esc(M[i][0])}">${k}</i>` : '').join('')}</div>${secRows}</div>${radarHTML}</div></div>`;
  }

  /* Synthèse : une ligne par activité validée */
  function valSummary(E) {
    if (!E.length) return '';
    const M = Mx();
    return `<div class="fa"><div class="fah"><b>🎯 Synthèse des niveaux de maîtrise</b></div>${E.map(e => `<div class="sy"><span class="syn">${esc(e.title)}</span><span class="sybar">${M.map((m, i) => `<i style="background:${e.avg != null && i <= e.avg ? M[e.avg][1] : '#E4E9F3'}"></i>`).join('')}</span><span class="syt" style="color:${e.avg != null ? M[e.avg][1] : '#667'}">${e.avg != null ? esc(M[e.avg][0]) : '–'}</span>${e.NT ? `<span class="sno" style="background:${noteCol(e.NT.n20)}">${fr(e.NT.n20)}<small>/20</small></span>` : '<span class="sno" style="visibility:hidden"></span>'}</div>`).join('')}</div>`;
  }

  /* ---------- Tournois, matchs, classements… ---------- */
  function collEntries(cls, n, o) {
    const EV = (has(window.epsCollectifs) ? window.epsCollectifs(cls) : []).filter(e => evOk(e, o));
    const out = EV.map(e => { const rows = e.rows || [], row = rows.find(r => String(r[2] || '').split(',').map(s => s.trim()).includes(n) || String(r[1]) === n); return row ? { e, row, N: rows.length } : null; }).filter(Boolean);
    // tournoi dont le classement affiché est vide (équipes rangées dans une autre poule que celle des rencontres) : on reconstruit la ligne d'après les rencontres jouées
    try { (typeof TR === 'function' ? TR() : []).forEach(T => { if (!T || T.classe !== cls || out.some(x => x.e.tid === T.id)) return; const tm = (T.teams || []).find(t => (t.members || []).includes(n) || t.name === n); if (!tm) return;
      const PL = poolOf(T, tm.name); if (!PL) return; const e = EV.find(x => x.tid === T.id) || (evOk({ kind: 'tournoi', sport: T.sport, tid: T.id, date: T.date }, o) ? { kind: 'tournoi', tid: T.id, sport: T.sport, date: T.date, icon: '🔁', title: T.nom || 'Tournoi', sub: `Championnat (poule) · ${SPN(T.sport)} · ${dt(T.date)}` } : null); if (!e) return;
      out.push({ e, row: [PL.rank || '', tm.name, (tm.members || []).join(', '), ''], N: PL.n }); }); } catch (er) {}
    // tournoi sans aucun match enregistré pour cette équipe (résultats non arrivés) : pas de carte du tout
    const played = x => x.e.kind !== 'tournoi' || !x.e.tid || (Array.isArray(DB.matchs) && DB.matchs.some(m => m.tid === x.e.tid && !m.obsOnly && (m.a === String(x.row[1]) || m.b === String(x.row[1]))));
    return out.filter(played).sort((a, b) => b.e.date - a.e.date);
  }
  function matchChips(e, team) {
    if (!e.tid || !Array.isArray(DB.matchs)) return null;
    const ms = DB.matchs.filter(m => m.tid === e.tid && !m.obsOnly && (m.a === team || m.b === team)).sort((a, b) => (a.date || 0) - (b.date || 0)); if (!ms.length) return null;
    const L = ms.map(m => { const own = m.a === team, a = +m.sa || 0, b = +m.sb || 0, my = own ? a : b, op = own ? b : a; return { opp: own ? m.b : m.a, my, op, r: my > op ? 'V' : my < op ? 'D' : 'N' }; });
    return L;
  }
  const medal = r => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : '';
  function collCard(x) {
    const { e, row, N } = x, c = KCOL[e.kind] || '#1E5BD8', rk = typeof row[0] === 'number' ? row[0] : null, team = String(row[1] || '');
    const M2 = matchChips(e, team), rs = String(row[3] || '').replace(/&nbsp;/g, ' ');
    const W = M2 ? { V: M2.filter(m => m.r === 'V').length, N: M2.filter(m => m.r === 'N').length, D: M2.filter(m => m.r === 'D').length } : null;
    const outcome = !M2 && e.kind === 'match' ? (/Victoire/.test(rs) ? 'V' : /D[ée]faite/.test(rs) ? 'D' : /Nul/.test(rs) ? 'N' : '') : '';
    const mem = String(row[2] || '').trim();
    const T0 = e.kind === 'tournoi' && e.tid && typeof TR === 'function' ? TR().find(t => t.id === e.tid) : null, PL = T0 ? poolOf(T0, team) : null, NN = PL ? PL.n : N;
    const rk0 = PL ? PL.rank : rk, rs0 = PL ? `${PL.pts} pts · ${PL.V} V ${PL.N} N ${PL.D} D · diff ${PL.diff > 0 ? '+' : ''}${PL.diff}${PL.g ? ' · ' + PL.g : ''}` : rs;
    const rankBox = rk0 != null && typeof rk0 === 'number' ? `<div class="rk" style="background:${c}"><span>${medal(rk0) || ''}</span><b>${rk0}${rk0 === 1 ? 'er' : 'e'}</b><small>sur ${NN}${PL && PL.multi ? ' · ' + esc(PL.g || 'poule') : ''}</small></div>` : outcome ? `<div class="rk" style="background:${outcome === 'V' ? '#1B9E5A' : outcome === 'D' ? '#D64545' : '#8A94AA'}"><b>${outcome === 'V' ? 'Victoire' : outcome === 'D' ? 'Défaite' : 'Nul'}</b></div>` : '';
    return `<div class="ev2" style="--c:${c}"><div class="e-top"><span class="e-ic">${e.icon || '🏆'}</span><div class="e-t"><b>${esc(plain(e.title || e.event))}</b><div class="mut">${esc(plain(e.sub || dt(e.date)))}</div></div>${rankBox}</div>
      ${PL && PL.multi ? `<div class="e-team" style="color:#8E44AD;font-weight:800">🎚 Poule par niveau de jeu : ${esc(PL.g || 'poule')}${PL.level ? ' — ' + esc(PL.level) : ''}${PL.rank ? ` · ${PL.rank}${PL.rank === 1 ? 'er' : 'e'} sur ${PL.n}` : ''}</div>` : ''}
      ${team && team !== x.n ? `<div class="e-team"><b>${esc(team)}</b>${mem ? ` <span class="mut">${esc(mem)}</span>` : ''}</div>` : ''}
      ${M2 ? `<div class="mch">${M2.map(m => `<span class="mc ${m.r}"><b>${m.r}</b> ${m.my}–${m.op}<small>${esc(String(m.opp))}</small></span>`).join('')}</div>
        <div class="wl"><i style="width:${W.V / M2.length * 100}%;background:#1B9E5A"></i><i style="width:${W.N / M2.length * 100}%;background:#8A94AA"></i><i style="width:${W.D / M2.length * 100}%;background:#D64545"></i></div>
        <div class="wlt"><span style="color:#1B9E5A">${W.V} victoire${W.V > 1 ? 's' : ''}</span><span>${W.N} nul${W.N > 1 ? 's' : ''}</span><span style="color:#D64545">${W.D} défaite${W.D > 1 ? 's' : ''}</span></div>` : ''}
      <div class="e-res">${esc(rs0)}</div>
      ${rk != null && NN > 1 ? `<div class="pos"><span>1er</span><div><i style="width:${Math.max(6, (NN - rk + 1) / NN * 100)}%;background:${c}"></i></div><span>${NN}e</span></div>` : ''}</div>`;
  }

  /* ---------- Résultats des outils ---------- */
  function perfCards(cls, n, tools) {
    const names = Object.fromEntries((typeof TOOLS !== 'undefined' ? TOOLS : []).map(t => [t.id, t.name]));
    const mine = (DB.resultats || []).filter(r => r && r.classe === cls && r.eleve === n && !/^valid\|/.test(String(r.key || '')) && r.tool !== 'valid' && (!tools || tools.includes(r.tool)));
    const byT = {}; mine.forEach(r => { const k = r.tool || r.label; (byT[k] = byT[k] || []).push(r); });
    return Object.entries(byT).map(([tid, L], i) => { const t = names[tid] || (L[0] && L[0].label) || tid, col = COLS[i % COLS.length]; L.sort((a, b) => a.date - b.date);
      // tableaux à double entrée (comme dans le bilan de classe), limités à l'élève : HYROX, duathlon, puis tous les autres outils
      let tb = ''; try {
        if (tid === 'wod' && typeof bilanWod === 'function') tb = bilanWod(cls, n);
        else if (tid === 'duathlon' && typeof bilanDua === 'function') tb = bilanDua(cls, n);
        else if (typeof bilanGen === 'function') tb = bilanGen(L, col, [n]);
      } catch (e) { tb = ''; }
      if (tb) return `<div class="fa" style="border-top:4px solid ${col}"><div class="fah"><b>${esc(t)}</b><span class="mut">${L.length} résultat${L.length > 1 ? 's' : ''}</span></div><div class="tb">${tb}</div></div>`;
      const num = r => { const m = /^\s*(-?\d+(?:[.,]\d+)?)\s*(?:%|pts?|m|km\/h|tours?|points?)?\s*$/i.exec(String(r.valeur)); return m ? parseFloat(m[1].replace(',', '.')) : null; };
      const nums = L.map(num), ok = nums.filter(x => x != null).length >= 2, mx = ok ? Math.max(...nums.filter(x => x != null), 0.0001) : 0;
      return `<div class="fa" style="border-top:4px solid ${col}"><div class="fah"><b>${esc(t)}</b><span class="mut">${L.length} résultat${L.length > 1 ? 's' : ''}</span></div>
        ${L.map((r, k) => `<div class="pr2"><span class="pd">${dt(r.date)}</span><span class="pv" style="background:${col}">${esc(String(r.valeur))}</span><div class="px">${ok && nums[k] != null ? `<div class="pb"><i style="width:${Math.max(4, nums[k] / mx * 100)}%;background:${col}"></i></div>` : ''}<div>${String(r.detail || '').split(' · ').filter(Boolean).map(s => `<span class="chip3">${esc(s)}</span>`).join(' ')}</div></div></div>`).join('')}</div>`; }).join('');
  }

  /* ---------- Grilles d'évaluation ---------- */
  function grilleCards(cls, n, ids) {
    let h = ''; (ids || []).forEach(gi => { const g = (DB.grilles || [])[gi]; if (!g) return; const E = ((g.evals || {})[cls] || {})[n]; if (!E || !Object.keys(E).length) return;
      const L = grLevels(g), pts = (g.type || 'points') === 'points', nL = L.length, col = x => GR_COLORS[Math.round(x / Math.max(1, nL - 1) * 3)] || '#2F6BD8', tot = g.criteria.reduce((a, c) => a + (c.pts || 0), 0);
      let s = 0; g.criteria.forEach((c, i) => { if (E[i] != null) s += (c.pts || 0) * grK(g, E[i]); }); const s20 = tot ? s / tot * 20 : 0;
      h += `<div class="fa"><div class="fah"><b>📝 ${esc(g.name)}</b>${pts ? `<span class="fn" style="background:${noteCol(s20)}">${fr(s20)}<small>/20</small></span>` : ''}</div>
        ${g.criteria.map((c, i) => E[i] == null ? '' : `<div class="cr"><div class="cn">${esc(c.label)}${pts ? ` <small class="d">(${c.pts} pts)</small>` : ''}</div><div class="lv4 g1"><span style="background:${col(E[i])};color:#fff;font-weight:800">${esc(L[E[i]])}</span></div><div class="cp"></div></div>`).join('')}</div>`; });
    return h;
  }

  /* ---------- 🥧 Camemberts : points bonus, consignes paramétrées, rapports (pieds / mains…) ----------
     names = [élève] pour une fiche, null pour toute la classe. Chaque camembert : { t: titre, seg: [{ l, v, c }], note } */
  const PC = ['#1E5BD8', '#C9A227', '#1B9E5A', '#E0892F', '#8E44AD', '#D64545', '#16A3A3', '#B0127A', '#5B8DEF', '#9C7A1E'];
  const mk = (t, o, cols = {}, note = '') => ({ t, note, seg: Object.entries(o).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([l, v], i) => ({ l, v, c: cols[l] || PC[i % PC.length] })) });
  function pieSVG(P) {
    const seg = P.seg, tot = seg.reduce((a, x) => a + x.v, 0); if (!tot) return '';
    const R = 56, cx = 60, cy = 60, pt = (a, r = R) => [(cx + r * Math.cos(a)).toFixed(2), (cy + r * Math.sin(a)).toFixed(2)]; let a0 = -Math.PI / 2;
    const parts = seg.map(x => { const f = x.v / tot, a1 = a0 + f * 2 * Math.PI, mid = (a0 + a1) / 2, p0 = pt(a0), p1 = pt(a1), pc = Math.round(f * 100), tp = pt(mid, f >= .9999 ? 0 : R * .62);
      const sh = f >= .9999 ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${x.c}"/>` : `<path d="M${cx},${cy} L${p0} A${R},${R} 0 ${f > .5 ? 1 : 0} 1 ${p1} Z" fill="${x.c}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>`;
      const lab = pc >= 7 ? `<text x="${tp[0]}" y="${(+tp[1] + 4).toFixed(2)}" text-anchor="middle" font-size="${pc >= 20 ? 12 : 10}" font-weight="900" fill="#fff" stroke="rgba(0,0,0,.35)" stroke-width=".5" paint-order="stroke">${pc} %</text>` : '';
      a0 = a1; return sh + lab; }).join('');
    return `<div class="pbox"><b class="pt">${esc(P.t)}</b><div class="pbd"><svg viewBox="0 0 120 120" width="118" height="118">${parts}</svg><div class="plg">${seg.map(x => `<div><i style="background:${x.c}"></i><span>${esc(x.l)}</span><b>${x.v} · ${Math.round(x.v / tot * 100)} %</b></div>`).join('')}<div class="ptot">Total : <b>${tot}</b></div></div></div>${P.note ? `<div class="pn">${esc(P.note)}</div>` : ''}</div>`;
  }
  const sideOf = (m, n) => { if ((m.pa || []).includes(n)) return 0; if ((m.pb || []).includes(n)) return 1;
    const T = m.tid && typeof TR === 'function' ? TR().find(t => t.id === m.tid) : null; if (T) { const tm = (T.teams || []).find(t => (t.members || []).includes(n)); if (tm) return tm.name === m.a ? 0 : tm.name === m.b ? 1 : -1; }
    return m.a === n ? 0 : m.b === n ? 1 : -1; };
  const inCls = (m, cls) => { const T = m.tid && typeof TR === 'function' ? TR().find(t => t.id === m.tid) : null; if (T && T.classe) return T.classe === cls; const st = studentsOf(cls) || []; return [...(m.pa || []), ...(m.pb || [])].some(x => st.includes(x)); };
  const SPN = sp => (window.SPORTS || (typeof SPORTS !== 'undefined' ? SPORTS : {}))[sp]?.name || sp || '';
  function piesFor(cls, names, o) {
    o = o || {}; const act = o.act, tl = o.tools, days = o.days && o.days.size ? o.days : null;
    const okTool = t => (act ? (act.tools || []).includes(t) || act.tool === t : true) && (!tl || tl.includes(t)) && !(act && act.sport && t !== act.tool);
    const okSport = sp => act ? act.sport === sp : (!tl || tl.includes(toolOfSport(sp)));
    const inDay = m => !days || days.has(dayS(m.date));
    const out = [], one = names && names.length === 1 ? names[0] : null, who = one ? '' : ' de la classe';
    const all = (Array.isArray(DB.matchs) ? DB.matchs : []).filter(m => !m.obsOnly && okSport(m.sport) && inDay(m));
    // matchs : un jeu de camemberts PAR tournoi (ou par sport pour les matchs hors tournoi) ; sides = (élève → son côté) ou (classe → les deux)
    const L = []; all.forEach(m => { if (one) { const t = sideOf(m, one); if (t >= 0) L.push({ m, t }); } else if (inCls(m, cls)) { L.push({ m, t: 0 }); L.push({ m, t: 1 }); } });
    const byG = {}; L.forEach(x => { const k = x.m.tid ? 't:' + x.m.tid : 'libre:' + x.m.sport; (byG[k] = byG[k] || []).push(x); });
    Object.entries(byG).forEach(([k, A]) => { const sp = A[0].m.sport, nm = SPN(sp), T = k[0] === 't' ? (typeof TR === 'function' ? TR().find(t => t.id === A[0].m.tid) : null) : null;
      const ctx = T ? `${T.nom || 'Tournoi'} · ${dt(T.date)}` : `${nm} · matchs hors tournoi`;
      let PL = null; if (T && one) { const sd = A[0].t, mm = A[0].m, team = sd ? mm.b : mm.a; PL = poolOf(T, team); }
      const pnote = PL ? `${PL.multi ? '🎚 Poule par niveau de jeu : ' + (PL.g || 'poule') + (PL.level ? ' (' + PL.level + ')' : '') + ' · ' : ''}${PL.rank ? `Classement dans la poule : ${PL.rank}${PL.rank === 1 ? 'er' : 'e'} sur ${PL.n} (${PL.pts} pts)` : 'Aucun match enregistré dans la poule'}` : '';
      const sfx = ` · ${ctx}${PL && PL.multi ? ' · ' + (PL.g || '') : ''}`;
      const r = { Victoires: 0, Nuls: 0, Défaites: 0 }, pts = { 'Points marqués': 0, 'Points encaissés': 0 }, nb = { 'Points normaux': 0, 'Points bonus': 0 }, ty = {};
      A.forEach(({ m, t }) => { const a = +m.sa || 0, b = +m.sb || 0, my = t ? b : a, op = t ? a : b; if (my > op) r.Victoires++; else if (my < op) r.Défaites++; else r.Nuls++; pts['Points marqués'] += my; pts['Points encaissés'] += op;
        (m.ev || []).filter(e => e.team === t && (e.kind === 'score' || e.kind === 'bonus')).forEach(e => { if (e.kind === 'bonus') nb['Points bonus'] += e.pts || 0; else nb['Points normaux'] += e.pts || 0; const l = typeof epsEvLabel === 'function' ? epsEvLabel(e) : (e.label || 'Point'); ty[l] = (ty[l] || 0) + 1; }); });
      const nM = Math.round(A.length / (one ? 1 : 2));
      out.push(mk(`Résultats des matchs${sfx}`, r, { Victoires: '#1B9E5A', Nuls: '#8A94AA', Défaites: '#D64545' }, [`${nM} match${nM > 1 ? 's' : ''} joué${nM > 1 ? 's' : ''}`, pnote].filter(Boolean).join(' · ')));
      out.push(mk(`Points marqués / encaissés${sfx}`, pts, { 'Points marqués': '#1B9E5A', 'Points encaissés': '#D64545' }));
      if (nb['Points bonus']) out.push(mk(`Points normaux / bonus${sfx}`, nb, { 'Points normaux': '#1E5BD8', 'Points bonus': '#1B9E5A' }, `${one ? 'Points de son équipe' : 'Points des équipes de la classe'} : ${Math.round(nb['Points bonus'] / ((nb['Points bonus'] + nb['Points normaux']) || 1) * 100)} % de bonus`));
      if (Object.keys(ty).length > 1) out.push(mk(`Types de points marqués${sfx}`, ty, {}, 'Nombre de chaque type (points normaux, bonus +2…)')); });
    // observations individuelles (critères propres au sport : points gagnés, coups gagnants, fautes, tirs…)
    const ob = {}; all.concat((DB.matchs || []).filter(m => m.obsOnly && okSport(m.sport) && inDay(m))).forEach(m => (m.obs || []).forEach(ob0 => { if (!ob0 || !ob0.name) return; if (one ? ob0.name !== one : !(studentsOf(cls) || []).includes(ob0.name)) return; const kk = m.sport + '|' + (m.tid || ''); (ob[kk] = ob[kk] || []).push(ob0); }));
    Object.entries(ob).forEach(([kk, os]) => { const sp = kk.split('|')[0], tid0 = kk.split('|')[1], T0 = tid0 && typeof TR === 'function' ? TR().find(t => t.id === tid0) : null, who0 = who + (T0 ? ` · ${T0.nom || 'Tournoi'} · ${dt(T0.date)}` : ''); let crit = []; try { crit = typeof obsCrit === 'function' ? obsCrit(sp) : []; } catch (e) {} if (!crit.length) return; const sum = {}; crit.forEach(([k, l]) => sum[l] = os.reduce((a, o) => a + ((o.c || {})[k] || 0), 0));
      out.push(mk(`Observations${who0} · ${SPN(sp)}`, sum, { 'Faute directe': '#D64545', 'Balle perdue': '#D64545', Faute: '#D64545', 'Touche reçue': '#D64545' }, `${os.length} observation${os.length > 1 ? 's' : ''}`));
      const tk = os.reduce((a, o) => a + ((o.c || {}).tir || 0), 0), bt = os.reduce((a, o) => a + ((o.c || {}).but || 0), 0); if (tk > 0) out.push(mk(`Réussite aux tirs${who0} · ${SPN(sp)}`, { Réussis: Math.min(bt, tk), Ratés: Math.max(0, tk - bt) }, { Réussis: '#1B9E5A', Ratés: '#D64545' }, `${Math.round(Math.min(bt, tk) / tk * 100)} % de réussite`)); });
    // escalade : poses de pieds / mains (PME), fluidité, rôles, voies
    const PS = !okTool('escalade') ? [] : ((DB.escalade || {}).passages || []).filter(p => p.classe === cls && (one ? (p.eleve === one || p.as === one || p.ca === one) : true));
    const mine = one ? PS.filter(p => p.eleve === one) : PS;
    if (mine.length) { const pi = mine.reduce((a, p) => a + (p.pieds || 0), 0), pm = mine.reduce((a, p) => a + (p.pme || 0), 0);
      if (pi + pm) out.push(mk(`Escalade${who} · poses de pieds / PME`, { 'Poses de pieds': pi, PME: pm }, { 'Poses de pieds': '#1E5BD8', PME: '#E0892F' }, pm ? `${(pi / pm).toFixed(1).replace('.', ',')} pose de pieds pour 1 PME` : ''));
      const fl = {}; mine.forEach(p => { if (p.flu) { const l = (typeof ESC_FLU !== 'undefined' && ESC_FLU[p.flu]) || 'Niveau ' + p.flu; fl[l] = (fl[l] || 0) + 1; } });
      out.push(mk(`Escalade${who} · fluidité`, fl, { Saccadée: '#D64545', Hésitante: '#E0892F', Fluide: '#2F6BD8', 'Très fluide': '#1B9E5A' }));
      const cot = {}; mine.forEach(p => { const k = 'Voies ' + String(p.cot || '?')[0] + 'x'; cot[k] = (cot[k] || 0) + 1; }); if (Object.keys(cot).length > 1) out.push(mk(`Escalade${who} · niveau des voies`, cot, { 'Voies 3x': '#3BA55C', 'Voies 4x': '#2F6FE0', 'Voies 5x': '#D9A21B', 'Voies 6x': '#D8433B' }));
      const md = {}; mine.forEach(p => { const k = p.mode === 'tete' ? 'Tête' : 'Moulinette'; md[k] = (md[k] || 0) + 1; }); if (Object.keys(md).length > 1) out.push(mk(`Escalade${who} · mode de grimpe`, md));
      if (one) { const ro = { 'Grimpeur': PS.filter(p => p.eleve === one).length, 'Assureur': PS.filter(p => p.as === one).length, 'Contre-assureur': PS.filter(p => p.ca === one).length }; out.push(mk('Escalade · rôles dans la cordée', ro, { Grimpeur: '#1E5BD8', Assureur: '#E0892F', 'Contre-assureur': '#8E44AD' })); } }
    // autres outils : compteurs paramétrés (« recule 2 · avance 5 », « 8/10 balises »…) additionnés par outil
    const names2 = Object.fromEntries((typeof TOOLS !== 'undefined' ? TOOLS : []).map(t => [t.id, t.name]));
    const R = (DB.resultats || []).filter(r => r && (!days || days.has(dayS(r.date))) && r.classe === cls && (one ? r.eleve === one : true) && !/^valid\|/.test(String(r.key || '')) && !['escalade', 'match', 'valid', 'co', 'lutte', 'demifond', 'combine', 'duathlon', 'natation', 'wod'].includes(r.tool) && okTool(r.tool));
    const byTool = {}; R.forEach(r => (byTool[names2[r.tool] || r.label || r.tool] = byTool[names2[r.tool] || r.label || r.tool] || []).push(r));
    Object.entries(byTool).forEach(([t, L2]) => { const cnt = {}, fr2 = {};
      L2.forEach(r => String(r.detail || '').split(' · ').forEach(sg => { sg = sg.trim(); let m;
        if ((m = /^(\d+)\s*\/\s*(\d+)\s+(.+)$/.exec(sg))) { const o = fr2[m[3]] = fr2[m[3]] || { a: 0, t: 0 }; o.a += +m[1]; o.t += +m[2]; }
        else if ((m = /^([A-Za-zÀ-ÿ’' -]{2,22}?)\s+(\d+)$/.exec(sg))) cnt[m[1].trim()] = (cnt[m[1].trim()] || 0) + (+m[2]);
        else if ((m = /^(\d+)\s+([A-Za-zÀ-ÿ’' -]{2,22})$/.exec(sg))) cnt[m[2].trim()] = (cnt[m[2].trim()] || 0) + (+m[1]); }));
      if (Object.keys(cnt).length >= 2) out.push(mk(`${t}${who} · répartition`, cnt));
      Object.entries(fr2).forEach(([l, o]) => { if (o.t > 0) out.push(mk(`${t}${who} · ${l}`, { 'Réussi / trouvé': o.a, 'Manqué': Math.max(0, o.t - o.a) }, { 'Réussi / trouvé': '#1B9E5A', 'Manqué': '#D64545' }, `${Math.round(o.a / o.t * 100)} %`)); }); });
    /* ---- Outils dédiés : un jeu de camemberts propre à chaque outil (consignes paramétrées de l'enseignant) ---- */
    const sub = (fn) => { try { fn(); } catch (e) { if (window.console) console.warn('pies', e); } };
    const stu = studentsOf(cls) || [], mineN = n => one ? n === one : stu.includes(n);
    const RT = t => !okTool(t) ? [] : (DB.resultats || []).filter(r => r && (!days || days.has(dayS(r.date))) && r.classe === cls && r.tool === t && (one ? r.eleve === one : true) && !/^valid\|/.test(String(r.key || '')));
    const num = s => parseFloat(String(s).replace(',', '.').replace('−', '-'));
    // 🏃 Demi-fond : respect du projet, arrêts, % VMA
    sub(() => { const L2 = RT('demifond'); if (!L2.length) return; const pr = { 'Projet respecté': 0, 'Écart modéré': 0, 'Écart important': 0 }, ar = { 'Sans arrêt': 0, '1 arrêt': 0, '2 arrêts ou +': 0 }, vm = {}; let mr = 0, tol = 5;
      try { const D2 = DB.demifond || {}; const t0 = ((D2.seances || [])[D2.seances.length - 1] || {}).cfg; if (t0 && t0.tol) tol = t0.tol; } catch (e) {}
      L2.forEach(r => { const d = String(r.detail || ''), m = /écart projet\s*([+\-−]?\d+(?:[.,]\d+)?)\s*%/.exec(d); if (m) { const a = Math.abs(num(m[1])); pr[a <= tol ? 'Projet respecté' : a <= 2 * tol ? 'Écart modéré' : 'Écart important']++; }
        const s = /(\d+)\s*arrêt/.exec(d); if (s) { const k = +s[1]; ar[k === 0 ? 'Sans arrêt' : k === 1 ? '1 arrêt' : '2 arrêts ou +']++; }
        const v = /\((\d+)\s*%\s*VMA\)/.exec(String(r.valeur || '')); if (v) { const x = +v[1], b = x < 60 ? '< 60 % VMA' : x < 70 ? '60–70 % VMA' : x < 80 ? '70–80 % VMA' : x < 90 ? '80–90 % VMA' : '≥ 90 % VMA'; vm[b] = (vm[b] || 0) + 1; }
        if (/marche rapide/.test(String(r.valeur || ''))) mr++; });
      const g = { 'Projet respecté': '#1B9E5A', 'Écart modéré': '#E0892F', 'Écart important': '#D64545', 'Sans arrêt': '#1B9E5A', '1 arrêt': '#E0892F', '2 arrêts ou +': '#D64545' };
      out.push(mk(`Demi-fond${who} · respect du projet`, pr, g, `Écart de vitesse ≤ ${tol} % = projet respecté`)); out.push(mk(`Demi-fond${who} · arrêts pendant la course`, ar, g, mr ? `${mr} marche${mr > 1 ? 's' : ''} rapide${mr > 1 ? 's' : ''}` : ''));
      out.push(mk(`Demi-fond${who} · intensité (% de VMA)`, vm, { '< 60 % VMA': '#8A94AA', '60–70 % VMA': '#5B8DEF', '70–80 % VMA': '#2F6BD8', '80–90 % VMA': '#E0892F', '≥ 90 % VMA': '#D64545' })); });
    // 🏅 Combiné / Duathlon-triathlon athlétique : courses terminées, écart au projet
    sub(() => { const L2 = RT('combine'); if (!L2.length) return; const fin = { 'Courses terminées': 0, 'Non terminées': 0 }, pr = { 'Projet respecté': 0, 'Écart modéré': 0, 'Écart important': 0 };
      L2.forEach(r => { const v = String(r.valeur || ''), d = String(r.detail || ''); if (/non termin/.test(v)) fin['Non terminées']++; else fin['Courses terminées']++;
        const re = /\(([+\-−]?\d+(?:[.,]\d+)?)\s*%\)/g; let m; while ((m = re.exec(d))) { const a = Math.abs(num(m[1])); pr[a <= 5 ? 'Projet respecté' : a <= 10 ? 'Écart modéré' : 'Écart important']++; }
        if (!/\(\s*[+\-−]?\d/.test(d)) { const e = /écart projet\s*([+\-−]?\d+(?:[.,]\d+)?)\s*%/.exec(d); if (e) { const a = Math.abs(num(e[1])); pr[a <= 5 ? 'Projet respecté' : a <= 10 ? 'Écart modéré' : 'Écart important']++; } } });
      const g = { 'Courses terminées': '#1B9E5A', 'Non terminées': '#D64545', 'Projet respecté': '#1B9E5A', 'Écart modéré': '#E0892F', 'Écart important': '#D64545' };
      out.push(mk(`Combiné${who} · courses`, fin, g)); out.push(mk(`Combiné${who} · respect du projet`, pr, g, 'Écart ≤ 5 % = respecté, ≤ 10 % = modéré')); });
    sub(() => { const L2 = RT('duathlon'); if (!L2.length) return; const ps = { Lancers: 0, Tours: 0 }, tm = { 'Temps d\'équipe complet': 0, 'Étapes incomplètes': 0 };
      L2.forEach(r => { const d = String(r.detail || ''), m = /perso\s+(\d+)\s*pts?\s*·\s*(\d+)\s*tours?/.exec(d); if (m) { ps.Lancers += +m[1]; ps.Tours += +m[2]; } tm[/étapes\)/.test(String(r.valeur || '')) ? 'Étapes incomplètes' : 'Temps d\'équipe complet']++; });
      out.push(mk(`Duathlon${who} · points de lancers / tours de course`, ps, { Lancers: '#8E44AD', Tours: '#1E5BD8' }, 'Contribution personnelle'));
      out.push(mk(`Duathlon${who} · épreuves terminées`, tm, { 'Temps d\'équipe complet': '#1B9E5A', 'Étapes incomplètes': '#E0892F' })); });
    // 🧭 Course d'orientation : balises trouvées / manquées (par niveau), erreurs, statut, pénalités
    sub(() => { if (!okTool('co')) return; const S = ((DB.co || {}).seances || []).filter(s => s.classe === cls && (!days || days.has(dayS(s.date)))); if (!S.length) return; const fm = { 'Balises trouvées': 0, 'Balises manquées': 0 }, nv = {}, nvM = {}, st = {}; let wr = 0, ok = 0;
      S.forEach(s => { const p = s.parcoursSnap || {}, B = p.balises || []; (s.runs || []).filter(r => r.dep).forEach(r => (r.members || []).filter(mineN).forEach(m => {
        const mine2 = (r.found || []).filter(n => !(r.who || {})[n] || r.who[n] === m); B.forEach(b => { const f = mine2.includes(b.num), k = 'Niveau ' + (b.niv || 1); fm[f ? 'Balises trouvées' : 'Balises manquées']++; if (f) nv[k] = (nv[k] || 0) + 1; else nvM[k] = (nvM[k] || 0) + 1; });
        wr += r.wrong || 0; ok++; })); });
      if (!ok) return; const g = { 'Balises trouvées': '#1B9E5A', 'Balises manquées': '#D64545' }, lc = { 'Niveau 1': '#3BA55C', 'Niveau 2': '#2F6FE0', 'Niveau 3': '#E0892F', 'Niveau 4': '#D64545' };
      out.push(mk(`Orientation${who} · balises trouvées / manquées`, fm, g, fm['Balises trouvées'] + fm['Balises manquées'] ? `${Math.round(fm['Balises trouvées'] / (fm['Balises trouvées'] + fm['Balises manquées']) * 100)} % de balises trouvées sur ${ok} course${ok > 1 ? 's' : ''}` : ''));
      if (Object.keys(nv).length > 1 || Object.keys(nvM).length) { out.push(mk(`Orientation${who} · niveau des balises trouvées`, nv, lc)); out.push(mk(`Orientation${who} · niveau des balises manquées`, nvM, lc)); }
      RT('co').forEach(r => { const d = String(r.detail || ''); const s = /(hors délai|non arrivé|arrivé[^·]*|dans les temps|abandon[^·]*)\s*$/i.exec(d); const k = /non arrivé/i.test(d) ? 'Non arrivé' : /hors/i.test(d) ? 'Hors délai' : 'Arrivé à temps'; st[k] = (st[k] || 0) + 1; });
      out.push(mk(`Orientation${who} · arrivées`, st, { 'Arrivé à temps': '#1B9E5A', 'Hors délai': '#E0892F', 'Non arrivé': '#D64545' }));
      if (wr) out.push(mk(`Orientation${who} · poinçons`, { 'Bonnes balises': fm['Balises trouvées'], 'Mauvaises balises': wr }, { 'Bonnes balises': '#1B9E5A', 'Mauvaises balises': '#D64545' }, 'Erreurs de balise (mauvais symbole / mauvaise pince)')); });
    // 🏊 Natation : épreuves du savoir-nager
    sub(() => { if (!okTool('natation')) return; const A = (DB.asns || {})[cls]; if (!A || typeof ASNS === 'undefined') return; const ep = { Réussies: 0, 'À reprendre': 0, 'Non évaluées': 0 }, per = ASNS.map(() => ({ ok: 0, ko: 0 })), sn = { 'Savoir-nager validé': 0, 'En cours': 0, 'Non commencé': 0 }; let any = false;
      (one ? [one] : stu).forEach(n => { const r = A[n]; if (!r || !r.r) { if (!one) sn['Non commencé']++; return; } any = true; r.r.forEach((v, i) => { if (v === 1) { ep.Réussies++; per[i].ok++; } else if (v === 0) { ep['À reprendre']++; per[i].ko++; } else ep['Non évaluées']++; });
        if (r.r.every(v => v === 1)) sn['Savoir-nager validé']++; else if (r.r.some(v => v != null)) sn['En cours']++; else sn['Non commencé']++; });
      if (!any || !(ep.Réussies + ep['À reprendre'])) return; const g = { Réussies: '#1B9E5A', 'À reprendre': '#D64545', 'Non évaluées': '#C7CEDB', 'Savoir-nager validé': '#1B9E5A', 'En cours': '#E0892F', 'Non commencé': '#C7CEDB' };
      out.push(mk(`Natation${who} · épreuves du savoir-nager`, ep, g)); if (!one) { out.push(mk('Natation de la classe · savoir-nager', sn, g)); const w = per.map((x, i) => [ASNS[i], x.ko]).sort((a, b) => b[1] - a[1])[0]; if (w && w[1]) out[out.length - 2].note = `Épreuve la plus échouée : ${w[0]} (${w[1]})`; } });
    // 🏋️ Crosstraining / HYROX : séances terminées dans le temps, blocs réalisés, écart au prévu
    sub(() => { const L2 = RT('wod'); if (!L2.length) return; const fin = { 'Dans le temps limite': 0, 'Temps limite atteint': 0, 'Non terminé': 0 }, bl = { 'Blocs réalisés': 0, 'Blocs non réalisés': 0 }, ec = { 'Plus vite que prévu': 0, 'Dans le prévu': 0, 'Plus lent que prévu': 0 };
      L2.forEach(r => { const v = String(r.valeur || ''), d = String(r.detail || ''); fin[/non termin/.test(v) ? 'Non terminé' : /time cap|limite/.test(v) ? 'Temps limite atteint' : 'Dans le temps limite']++;
        const b = /blocs\s+(\d+)\/(\d+)/.exec(d); if (b) { bl['Blocs réalisés'] += +b[1]; bl['Blocs non réalisés'] += Math.max(0, +b[2] - +b[1]); }
        const e = /écart\s*([+\-−])?\s*(\d+):(\d+)/.exec(d); if (e) { const s = (+e[2]) * 60 + (+e[3]), sg = e[1] === '+' ? 1 : e[1] ? -1 : 0; ec[!s ? 'Dans le prévu' : sg > 0 ? 'Plus lent que prévu' : 'Plus vite que prévu']++; } });
      const g = { 'Dans le temps limite': '#1B9E5A', 'Temps limite atteint': '#E0892F', 'Non terminé': '#D64545', 'Blocs réalisés': '#1B9E5A', 'Blocs non réalisés': '#D64545', 'Plus vite que prévu': '#1B9E5A', 'Dans le prévu': '#2F6BD8', 'Plus lent que prévu': '#E0892F' };
      out.push(mk(`Crosstraining${who} · temps limite`, fin, g)); out.push(mk(`Crosstraining${who} · blocs réalisés`, bl, g)); });
    // 🤼 Lutte : issues, formes de corps, défense, pénalités, tombés
    sub(() => { if (!okTool('lutte') || typeof luAgg !== 'function') return; const nm = (one ? [one] : stu), A = luAgg(nm).filter(x => x.c || Object.keys(x.fo).length || Object.keys(x.de).length || x.pen); if (!A.length) return; const sum = f => A.reduce((a, x) => a + (f(x) || 0), 0), mg = k => { const o = {}; A.forEach(x => Object.entries(x[k]).forEach(([l, v]) => o[l] = (o[l] || 0) + v)); return o; };
      out.push(mk(`Lutte${who} · issues des combats`, { Victoires: sum(x => x.v), Nuls: sum(x => x.nul), Défaites: sum(x => x.d) }, { Victoires: '#1B9E5A', Nuls: '#8A94AA', Défaites: '#D64545' }, sum(x => x.tb) ? `${sum(x => x.tb)} tombé${sum(x => x.tb) > 1 ? 's' : ''}` : ''));
      out.push(mk(`Lutte${who} · points marqués / encaissés`, { 'Points marqués': sum(x => x.pm), 'Points encaissés': sum(x => x.pe) }, { 'Points marqués': '#1B9E5A', 'Points encaissés': '#D64545' }));
      out.push(mk(`Lutte${who} · formes de corps`, mg('fo'))); out.push(mk(`Lutte${who} · défense`, mg('de'))); out.push(mk(`Lutte${who} · pénalités`, mg('pl'), { }, 'Pénalités par type')); });
    // 🟢 Niveaux de maîtrise validés par l'enseignant, activité par activité
    sub(() => { const V = (DB.valid || {}).v || {}; Object.keys(V).forEach(k => { const C = V[k][cls]; if (!C) return; if (act ? !actValOk(act, k) : (tl && !tl.includes(k.split(':')[0]))) return; const M = window.EPS_M || [], cnt = {}; M.forEach(m => cnt[m[0]] = 0); let n = 0;
      Object.keys(C).filter(e => one ? e === one : true).forEach(e => (typeof valLvls === 'function' ? valLvls(C[e]) : []).forEach(l => { if (M[l]) { cnt[M[l][0]]++; n++; } })); if (!n) return;
      const base = k.split(':')[0], nmk = (typeof VAL_TOOLS !== 'undefined' && VAL_TOOLS[base] && VAL_TOOLS[base].n) || (names2[base]) || k; const col = {}; M.forEach(m => col[m[0]] = m[1]);
      out.push(mk(`Maîtrise validée${who} · ${nmk}${act && act.sport ? ' (' + SPN(act.sport) + ')' : ''}${k.includes(':') ? ' (' + k.split(':').slice(1).join(' ') + ')' : ''}`, cnt, col, `${n} critère${n > 1 ? 's' : ''} validé${n > 1 ? 's' : ''}`)); }); });
    return out.filter(P => P.seg.length && P.seg.reduce((a, x) => a + x.v, 0) > 0);
  }
  window.fichesPies = piesFor;
  window.fichesPieHTML = pieSVG;
  const piesBlock = (cls, names, o) => { const P = piesFor(cls, names, o).map(pieSVG).filter(Boolean); return P.length ? `<div class="pies">${P.join('')}</div>` : ''; };

  /* ---------- Activités d'une classe : sport (tournois / matchs / validation du bon outil) ou outil ---------- */
  function actsFor(cls) {
    const A = [], vk = valKeys(cls), TN = Object.fromEntries((typeof TOOLS !== 'undefined' ? TOOLS : []).map(t => [t.id, t.name])), sports = {}, claimed = new Set();
    const addSp = (sp, d) => { if (!sp) return; const x = sports[sp] = sports[sp] || { d: 0 }; x.d = Math.max(x.d, d || 0); };
    (Array.isArray(DB.matchs) ? DB.matchs : []).forEach(m => { if (m && m.sport && inCls(m, cls)) addSp(m.sport, m.date); });
    (typeof TR === 'function' ? TR() : []).forEach(t => { if (t && t.sport && t.classe === cls) addSp(t.sport, t.date); });
    Object.entries(sports).sort((a, b) => b[1].d - a[1].d).forEach(([sp, x]) => { const tool = toolOfSport(sp), VT = (typeof VAL_TOOLS !== 'undefined' && VAL_TOOLS[tool]) || {};
      const val = vk.filter(k => { const [t, sb] = k.split(':'); return t === tool && (sb ? sb === sp : !(VT.sub && VT.sub[sp])); }); claimed.add(tool);
      A.push({ id: 'sp:' + sp, label: SPN(sp), icon: tool === 'matchr' ? '🏸' : '🏅', sport: sp, tool, tools: [tool], val, date: x.d }); });
    const tools = new Set(vk.map(k => k.split(':')[0])); (DB.resultats || []).forEach(r => { if (r && r.classe === cls && r.tool && r.tool !== 'valid' && !/^valid\|/.test(String(r.key || ''))) tools.add(r.tool); });
    if (((DB.escalade || {}).passages || []).some(p => p.classe === cls)) tools.add('escalade');
    tools.forEach(t => { if (claimed.has(t) || ['match', 'matchr', 'escrime'].includes(t) && A.some(a => a.tool === t)) return; const VT = (typeof VAL_TOOLS !== 'undefined' && VAL_TOOLS[t]) || {};
      A.push({ id: 'tl:' + t, label: VT.n || TN[t] || t, icon: '🎯', sport: null, tool: t, tools: [t], val: vk.filter(k => k.split(':')[0] === t) }); });
    return A;
  }
  window.fichesActs = actsFor; window.fichesEvOk = evOk;
  /* jour(s) de l'évaluation = date(s) de validation enseignant de l'élève pour l'activité */
  function daysOf(cls, n, act) { const S = new Set(); const V = (DB.valid || {}).v || {}; Object.keys(V).filter(k => actValOk(act, k)).forEach(k => { const W = V[k] && V[k][cls] && V[k][cls][n]; if (W && W._t && +W._t > 1e12) S.add(dayS(W._t)); }); return S; }

  /* ---------- Une fiche (une page ou plus) ---------- */
  function ficheHTML(cls, n, o) {
    const act = o.act || null, days = act && o.day ? daysOf(cls, n, act) : null, oo = { ...o, days };
    const M = Mx(), V = o.val !== false ? valEntries(cls, n, o.tools, act) : [], C = o.coll !== false ? collEntries(cls, n, oo) : [];
    const P = o.res !== false ? perfCards(cls, n, act ? (act.sport ? [] : act.tools) : o.tools) : '', G = o.gr !== false && !act ? grilleCards(cls, n, o.grilles || (DB.grilles || []).map((_, i) => i)) : '';
    const PI = o.pie !== false ? piesBlock(cls, [n], oo) : '';
    if (!V.length && !C.length && !P && !G && !PI) return '';
    const notes = V.filter(e => e.NT).map(e => e.NT.n20), moy = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : null, avgAll = epsMAvg(V.map(e => e.avg).filter(x => x != null));
    const mt = C.map(x => matchChips(x.e, String(x.row[1] || ''))).filter(Boolean).flat(), nV = mt.filter(m => m.r === 'V').length, medals = C.filter(x => typeof x.row[0] === 'number' && x.row[0] <= 3).length;
    const chips = [[V.length, 'activité' + (V.length > 1 ? 's' : '') + ' validée' + (V.length > 1 ? 's' : ''), '#1E5BD8'], moy != null ? [fr(moy), 'note moyenne /20', noteCol(moy)] : null, avgAll != null ? [M[avgAll][2] || M[avgAll][0], 'niveau global', M[avgAll][1]] : null,
      C.length ? [C.length, 'événement' + (C.length > 1 ? 's' : '') + ' collectif' + (C.length > 1 ? 's' : ''), '#C9A227'] : null, mt.length ? [`${nV}/${mt.length}`, 'matchs gagnés', '#1B9E5A'] : null, medals ? [medals, 'podium' + (medals > 1 ? 's' : ''), '#C9A227'] : null].filter(Boolean);
    return `<section class="page fiche"><div class="fh"><div><h2>${esc(n)}</h2><div>${esc(cls)} · ${esc(DB.annee || '')}</div></div><div class="kp">${chips.map(c => `<div style="background:${c[2]}"><b>${esc(String(c[0]))}</b><span>${esc(c[1])}</span></div>`).join('')}</div></div>
      ${V.length ? `<h3 class="st">✅ Validation de l'enseignant</h3>${valSummary(V)}${V.map(valCard).join('')}` : ''}
      ${C.length ? `<h3 class="st">🏆 Tournois, matchs et classements</h3>${C.map(x => collCard({ ...x, n })).join('')}` : ''}
      ${PI ? `<h3 class="st">🥧 Répartitions en camemberts</h3>${PI}` : ''}
      ${P ? `<h3 class="st">📈 Résultats des outils</h3>${P}` : ''}
      ${G ? `<h3 class="st">📝 Évaluations</h3>${G}` : ''}
      <div class="mut" style="font-size:.7rem;margin-top:10px">Édité le ${dt(Date.now())} — EPS ONE</div></section>`;
  }

  const CSS = `*{box-sizing:border-box}body{margin:0;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#0E1A33;background:#EEF1F7;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:860px;margin:14px auto;background:#fff;padding:20px;border-radius:14px;box-shadow:0 2px 12px rgba(11,42,91,.1)}
.mut{color:#667;font-size:.8rem}.d{color:#556}
.fh{background:linear-gradient(120deg,#C9A227,#1E5BD8 60%,#0B2A5B);color:#fff;border-radius:14px;padding:14px 18px;margin-bottom:10px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center}.fh h2{margin:0;font-size:1.7rem;border:0;color:#fff}
.kp{display:flex;gap:6px;flex-wrap:wrap}.kp div{border:2px solid rgba(255,255,255,.75);border-radius:12px;padding:5px 10px;text-align:center;min-width:76px}.kp b{display:block;font-size:1.25rem}.kp span{font-size:.64rem;opacity:.95;line-height:1.1;display:block}
h3.st{margin:18px 0 6px;font-size:1.05rem;color:#0B2A5B;border-bottom:3px solid #C9A227;padding-bottom:4px}
.fa{border:1px solid #D9DFEB;border-radius:14px;padding:10px 12px;margin:9px 0;break-inside:avoid;overflow:hidden}.fah{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;font-size:1.02rem}
.fn{color:#fff;font-weight:900;font-size:1.25rem;border-radius:10px;padding:2px 12px}.fn small,.sno small{font-size:.65rem;opacity:.85}
.sy{display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid #EEF1F7}.sy:first-of-type{border-top:0}.syn{flex:1 1 38%;font-weight:700;font-size:.86rem}.sybar{display:flex;gap:3px;flex:0 0 100px}.sybar i{flex:1;height:10px;border-radius:5px}.syt{flex:0 0 120px;font-weight:800;font-size:.8rem}.sno{color:#fff;font-weight:900;border-radius:9px;padding:2px 9px;min-width:64px;text-align:center}
.vcard{padding:0;border-width:1.5px}.vh{color:#fff;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px}.vsub{font-size:.76rem;opacity:.95;margin-top:2px}.bign{background:#fff;color:#0B2A5B;border-radius:14px;padding:3px 12px;text-align:center}.bign b{font-size:1.7rem}.bign small{font-size:.8rem;font-weight:800}
.vbody{display:flex;gap:10px;padding:8px 12px 12px;flex-wrap:wrap}.vcol{flex:1 1 380px;min-width:0}.rdw{flex:0 0 220px;display:grid;place-items:center}
.lgd{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:.7rem;color:#334;margin-bottom:6px}.lgd i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:4px;vertical-align:-1px}.lgd small{color:#778}
.dist{display:flex;height:20px;border-radius:99px;overflow:hidden;margin-bottom:8px;background:#E4E9F3}.dist i{color:#fff;font-style:normal;font-weight:900;font-size:.74rem;display:grid;place-items:center}
.sh{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid;margin:10px 0 3px;padding-bottom:2px;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em}.sn{color:#fff;font-weight:900;border-radius:99px;padding:1px 10px;font-size:.78rem;letter-spacing:0;text-transform:none}
.cr{display:flex;align-items:center;gap:8px;padding:3px 0;border-top:1px solid #F0F3F8}.cn{flex:1 1 40%;font-size:.8rem;line-height:1.2}.lv4{flex:1 1 50%;display:grid;grid-template-columns:repeat(4,1fr);gap:3px;max-width:300px}.lv4 span{height:23px;border-radius:7px;display:grid;place-items:center;font-size:.64rem;white-space:nowrap}
.lv4.none{display:block}.lv4.none span{background:#F2F4F9;color:#9AA3B8;font-size:.7rem;height:23px;display:grid}.lv4.g1{display:block}.lv4.g1 span{width:100%}.cp{flex:0 0 36px;height:26px;border-radius:99px;color:#fff;font-weight:900;font-size:.82rem;display:grid;place-items:center}.cp:empty{background:transparent!important}
.ev2{border:1px solid #D9DFEB;border-left:6px solid var(--c);border-radius:14px;padding:10px 12px;margin:9px 0;break-inside:avoid}.e-top{display:flex;gap:10px;align-items:center}.e-ic{font-size:1.6rem}.e-t{flex:1;min-width:0}.e-t b{font-size:1rem}
.rk{color:#fff;border-radius:12px;padding:4px 12px;text-align:center;min-width:74px}.rk b{font-size:1.25rem;display:block;line-height:1.1}.rk small{font-size:.66rem;opacity:.95}.rk span{font-size:1.2rem}
.e-team{margin:6px 0 2px;font-size:.88rem}.e-res{font-size:.8rem;color:#445;margin-top:6px;font-weight:600}
.mch{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.mc{border-radius:10px;padding:3px 9px;font-size:.78rem;color:#fff;display:flex;flex-direction:column;line-height:1.15}.mc small{font-size:.62rem;opacity:.92;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mc.V{background:#1B9E5A}.mc.D{background:#D64545}.mc.N{background:#8A94AA}
.wl{display:flex;height:9px;border-radius:99px;overflow:hidden;margin-top:8px;background:#E4E9F3}.wlt{display:flex;justify-content:space-between;font-size:.7rem;font-weight:800;margin-top:2px;color:#667}
.pos{display:flex;align-items:center;gap:6px;font-size:.66rem;color:#667;margin-top:7px}.pos div{flex:1;height:7px;background:#E4E9F3;border-radius:9px;overflow:hidden}.pos i{display:block;height:100%}
.pr2{display:flex;gap:8px;align-items:flex-start;padding:5px 0;border-top:1px solid #F0F3F8}.pd{flex:0 0 66px;font-size:.74rem;color:#667;padding-top:4px}.pv{color:#fff;font-weight:900;border-radius:10px;padding:3px 10px;font-size:.92rem;flex:0 0 auto;max-width:42%}.px{flex:1;min-width:0}.pb{height:6px;background:#E4E9F3;border-radius:9px;overflow:hidden;margin-bottom:3px}.pb i{display:block;height:100%}
.chip3{display:inline-block;background:#EEF1F7;border-radius:99px;padding:1px 8px;margin:1px;font-size:.72rem;color:#223}
.cl2 table{border-collapse:collapse;width:100%;font-size:.8rem}.cl2 th,.cl2 td{border:1px solid #DDE3EE;padding:4px 5px;text-align:center}.cl2 th{background:#0B2A5B;color:#fff}.cl2 .l{text-align:left}.cl2 th.v{height:120px;vertical-align:bottom;padding:4px 2px;background:#fff;color:#0E1A33;font-weight:700;font-size:.68rem;width:38px;max-width:38px}.cl2 th.v div{writing-mode:vertical-rl;transform:rotate(180deg);max-height:112px;overflow:hidden;margin:0 auto;line-height:1.1}
.tb .sc{overflow-x:auto}.tb table{border-collapse:collapse;width:100%;font-size:.82rem}.tb th,.tb td{border:1px solid #DDE3EE;padding:5px 6px;text-align:center}.tb th{background:#0B2A5B;color:#fff}.tb .l{text-align:left}.tb .d{color:#445;font-size:.76rem}.tb .none{color:#AAB;background:#FAFBFD}.tb .mut{color:#667}
.tb .ev{border:0;padding:0;margin:0}.tb .evh{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:4px}.tb .evh span{color:#667;font-size:.78rem}.tb .lead{font-weight:700;font-size:.85rem;margin:4px 0}
.tb .wg{border:1px solid #D9DFEB;border-radius:12px;padding:8px 10px;margin:8px 0;break-inside:avoid}.tb .wgh{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:flex-start;margin-bottom:6px}.tb .wgt{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.tb .tm{font-weight:900;font-size:1.05rem;color:#0B2A5B}.tb .tm.nt{color:#889;font-size:.85rem}.tb .ec{color:#fff;font-weight:800;font-size:.76rem;border-radius:99px;padding:3px 10px}
.tb table.wt th{font-size:.76rem}.tb th.ex{font-weight:700;font-size:.72rem}.tb table.wt td{font-size:.84rem}.tb div.mb{height:5px;background:#E4E9F3;border-radius:9px;margin-top:3px;overflow:hidden}.tb div.mb i{display:block;height:100%}.tb tr.cum td{border-top:2px solid #0B2A5B}.tb .vr{margin-top:8px;font-size:.8rem}.tb .vr>div{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:3px 0;border-top:1px solid #EEF1F7}.tb .vr>div>span:first-child{width:140px;font-weight:700}.tb .chip2{display:inline-block;color:#fff;font-size:.7rem;font-weight:800;border-radius:99px;padding:2px 8px;margin:1px 2px 1px 0}
.pies{display:flex;flex-wrap:wrap;gap:10px}.pbox{flex:1 1 300px;border:1px solid #D9DFEB;border-radius:14px;padding:8px 12px;break-inside:avoid;min-width:0}.pt{display:block;font-size:.88rem;margin-bottom:4px}.pbd{display:flex;gap:10px;align-items:center}.plg{flex:1;font-size:.76rem;min-width:0}.plg div{display:flex;align-items:center;gap:6px;padding:1px 0}.plg i{width:11px;height:11px;border-radius:3px;flex:0 0 11px}.plg span{flex:1;min-width:0}.plg b{white-space:nowrap}.plg .ptot{color:#667;justify-content:flex-end;font-size:.7rem}.pn{font-size:.74rem;color:#445;font-weight:700;margin-top:3px}
@media print{body{background:#fff}.page{box-shadow:none;border-radius:0;margin:0;padding:5mm;max-width:none;page-break-after:always;break-after:page}.page:last-child{page-break-after:auto;break-after:auto}@page{size:A4 portrait;margin:8mm}}`;

  /* Fiches : [{cls, names:[…]}] → document HTML complet */
  function fichesBody(sel, o) {
    const before = JSON.stringify(DB.valid === undefined ? null : DB.valid);   // lecture seule : les helpers de validation créent des valeurs par défaut
    try { return sel.flatMap(s => s.names.map(n => ficheHTML(s.cls, n, o))).filter(Boolean).join(''); }
    finally { if (JSON.stringify(DB.valid === undefined ? null : DB.valid) !== before) { const b = JSON.parse(before); if (b === null) delete DB.valid; else DB.valid = b; } }
  }
  window.fichesHTML = (sel, o = {}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fiches élèves ${esc(DB.annee || '')}</title><style>${CSS}</style></head><body>${fichesBody(sel, o) || '<section class="page"><p class="mut">Aucune donnée pour cette sélection (validations, tournois, résultats…).</p></section>'}</body></html>`;
  window.fichesCSS = CSS;
  window.fichesPieCSS = CSS.slice(CSS.indexOf('.pies{'), CSS.indexOf('@media print'));
  const namesOf = cls => { const st = (studentsOf(cls) || []).slice(); (DB.resultats || []).forEach(r => { if (r && r.classe === cls && r.eleve && !st.includes(r.eleve)) st.push(r.eleve); }); valKeys(cls).forEach(k => Object.keys(DB.valid.v[k][cls] || {}).forEach(n => { if (!st.includes(n)) st.push(n); })); return st; };
  window.fichesNames = namesOf;
  window.fichesBodyFor = opt => fichesBody(opt.classes.map(cls => ({ cls, names: namesOf(cls) })), { tools: opt.tools, grilles: opt.grilles, coll: opt.coll !== false, act: opt.act, day: opt.day });

  /* ---------- Bilan de classe : validation enseignant en carte de chaleur ---------- */
  window.bilanValid = (cls, opt = {}) => {
    if (typeof valCrit !== 'function') return '';
    const M = Mx(), st = (studentsOf(cls) || []).slice(), V = (DB.valid || {}).v || {}, lv = valLevelOf(cls); let html = '';
    valKeys(cls).forEach(k => { const [t, sb] = k.split(':'); if (opt.act ? !actValOk(opt.act, k) : opt.tools && !opt.tools.includes(t)) return;
      const D = V[k][cls], names = [...new Set([...st, ...Object.keys(D)])].filter(n => D[n] && valLvls(D[n]).length); if (!names.length) return;
      const T = VAL_TOOLS[t] || { n: t }, ck = valHasSet(k, lv) ? k + '@' + lv : k; let C = []; try { C = valCrit(ck); } catch (e) {} if (!C.length) return;
      const cfg = valCfg(ck), title = T.n + (sb ? ' · ' + ((T.sub && T.sub[sb] && T.sub[sb].n) || sb) : ''), pts = cfg.on;
      const rows = names.map(n => { const W = D[n], NT = pts ? valNote(C, W, cfg) : null, avg = epsMAvg(valLvls(W)); return { n, W, NT, avg }; });
      const dist = M.map((m, i) => ({ l: m[0], c: m[1], v: rows.reduce((a, r) => a + C.filter(c => r.W[c.id] === i).length, 0) }));
      const moy = pts ? rows.filter(r => r.NT).reduce((a, r, _, A) => a + r.NT.n20 / A.length, 0) : null;
      html += `<h3><span class="dot" style="background:#1B9E5A"></span>✅ Validation enseignant · ${esc(title)} <small>${names.length} élève${names.length > 1 ? 's' : ''}${moy != null ? ' · moyenne ' + fr(moy) + ' / 20' : ''}</small></h3>
        <div class="grid2"><div class="card"><h3 class="nb">Répartition des niveaux (tous critères)</h3>${typeof bilanPie === 'function' ? bilanPie(dist) : ''}</div>
        <div class="card"><h3 class="nb">Niveau par élève</h3>${M.map((m, i) => `<div class="hb"><span style="color:${m[1]};font-weight:800">${esc(m[2] || m[0])}</span><div><i style="width:${rows.length ? rows.filter(r => r.avg === i).length / rows.length * 100 : 0}%;background:${m[1]}"></i></div><b>${rows.filter(r => r.avg === i).length}</b></div>`).join('')}</div></div>
        <div class="sc cl2"><table><tr><th class="l">Élève</th>${C.map(c => `<th class="v"><div>${esc(typeof valSplit === 'function' ? valSplit(c.n)[1] : c.n)}</div></th>`).join('')}${pts ? '<th>/20</th>' : ''}<th>Niveau</th></tr>
        ${rows.map(r => `<tr><td class="l"><b>${esc(r.n)}</b></td>${C.map(c => { const l = r.W[c.id]; if (l == null) return '<td style="background:#F6F8FB;color:#B5BCCB">·</td>'; const p = pts ? valPt(c.id, r.W, cfg) : null;
          return `<td style="background:${M[l][1]};color:#fff;font-weight:800" title="${esc(M[l][0])}">${p != null ? fr(p) : esc((M[l][2] || '')[0] || '')}</td>`; }).join('')}${pts ? `<td style="font-weight:900;color:${r.NT ? noteCol(r.NT.n20) : '#889'}">${r.NT ? fr(r.NT.n20) : '–'}</td>` : ''}<td>${r.avg != null ? `<span style="background:${M[r.avg][1]};color:#fff;border-radius:99px;padding:2px 9px;font-weight:800;font-size:.72rem">${esc(M[r.avg][2] || M[r.avg][0])}</span>` : '–'}</td></tr>`).join('')}
        <tr><td class="l"><b>Répartition</b></td>${C.map(c => { const o = M.map((m, i) => rows.filter(r => r.W[c.id] === i).length), s = o.reduce((a, b) => a + b, 0) || 1;
          return `<td style="padding:3px"><div style="display:flex;flex-direction:column-reverse;height:34px;border-radius:5px;overflow:hidden;background:#EEF1F7">${o.map((v, i) => v ? `<i style="height:${v / s * 100}%;background:${M[i][1]}"></i>` : '').join('')}</div></td>`; }).join('')}${pts ? '<td></td>' : ''}<td></td></tr></table></div>
        <div class="lgd" style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.74rem">${M.map((m, i) => `<span><i style="display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:4px;background:${m[1]}"></i>${esc(m[0])}${pts ? ` (${cfg.bands[i][0]}–${cfg.bands[i][1]} pts)` : ''}</span>`).join('')}</div>`; });
    return html;
  };

  window.bilanPies = (cls, opt) => { const P = piesFor(cls, null, { tools: opt && opt.tools, act: opt && opt.act }).map(pieSVG).filter(Boolean); return P.length ? `<h3><span class="dot" style="background:#8E44AD"></span>🥧 Répartitions de la classe <small>points bonus, consignes, rapports</small></h3><div class="pies">${P.join('')}</div>` : ''; };
  /* ---------- Fenêtre : choisir classe / élève / contenu, puis aperçu, partage, impression ---------- */
  window.epsShowDoc = (html, name, title) => {
    const v = document.createElement('div'); v.style.cssText = 'position:fixed;inset:0;z-index:310;background:#333;display:flex;flex-direction:column';
    const blob = new Blob([html], { type: 'text/html' });
    v.innerHTML = `<div style="display:flex;gap:8px;padding:10px;align-items:center;background:var(--grad,#0B2A5B);color:#fff;flex-wrap:wrap"><b style="flex:1">${esc(title || 'Aperçu')}</b><button class="btn btn-white" data-s>📤 Enregistrer / envoyer</button><button class="btn btn-white" data-p>🖨 Imprimer / PDF</button><button class="btn btn-ghost" style="color:#fff" data-x>✕ Fermer</button></div><iframe title="${esc(title || 'Aperçu')}" style="flex:1;border:0;background:#EEF1F7"></iframe>`;
    document.body.appendChild(v); v.querySelector('iframe').srcdoc = html; v.querySelector('[data-x]').onclick = () => v.remove();
    v.querySelector('[data-s]').onclick = async () => {
      const f = new File([blob], name, { type: 'text/html' });
      try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); toast('Fichier téléchargé ✔'); };
    v.querySelector('[data-p]').onclick = () => {
      const d = new DOMParser().parseFromString(html, 'text/html'); document.getElementById('bil-print')?.remove(); document.getElementById('bil-print-css')?.remove();
      const st = document.createElement('style'); st.id = 'bil-print-css'; st.media = 'print'; st.textContent = d.querySelector('style').textContent.replace('body{margin:0;', 'body.x{margin:0;') + '\nbody>*:not(#bil-print){display:none!important}#bil-print{display:block!important;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#0E1A33}html,body{background:#fff!important;height:auto!important;overflow:visible!important}';
      const box = document.createElement('div'); box.id = 'bil-print'; box.style.display = 'none'; box.innerHTML = d.body.innerHTML; document.head.appendChild(st); document.body.appendChild(box);
      const clean = () => { box.remove(); st.remove(); window.removeEventListener('afterprint', clean); }; window.addEventListener('afterprint', clean);
      setTimeout(() => { try { window.print(); } catch (e) { toast('Impression impossible'); } }, 200); };
  };

  /* ---------- ZIP (sans compression) : un fichier HTML indépendant par élève ---------- */
  const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = u => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = crcT[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zipBlob(files) {
    const enc = new TextEncoder(), parts = [], cen = [], d = new Date(); let off = 0;
    const dd = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(), tm = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    files.forEach(f => { const nm = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint16(10, tm, true); h.setUint16(12, dd, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nm.length, true); h.setUint16(28, 0, true);
      parts.push(h.buffer, nm, data);
      const c = new DataView(new ArrayBuffer(46)); c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true); c.setUint16(12, tm, true); c.setUint16(14, dd, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
      cen.push(c.buffer, nm); off += 30 + nm.length + data.length; });
    const cs = cen.reduce((a, b) => a + b.byteLength, 0), e = new DataView(new ArrayBuffer(22)); e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
    return new Blob([...parts, ...cen, e.buffer], { type: 'application/zip' });
  }
  window.epsZipBlob = zipBlob;
  const safe = x => String(x).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();
  /* fichiers = [{ dir, name, html }] pour une classe : un par élève (et par activité si split) */
  function fichesFiles(cls, op, split, AC, dayOn) {
    const out = [], used = new Set(), names = namesOf(cls), add = (dir, n, html) => { if (!/class="page fiche"/.test(html)) return; let f = (dir ? safe(dir) + '/' : '') + safe(n), k = 1; while (used.has(f)) f = f.replace(/( \(\d+\))?$/, ` (${++k})`); used.add(f); out.push({ name: f + '.html', data: html }); };
    if (split) AC.forEach(a => names.forEach(n => add(a.label, n, window.fichesHTML([{ cls, names: [n] }], { ...op, act: window.fichesActById(a.id), day: false }))));
    else names.forEach(n => add('', n, window.fichesHTML([{ cls, names: [n] }], op)));
    return out;
  }
  window.fichesZip = (cls, op, split) => { const AC = actsFor(cls), F = fichesFiles(cls, op || {}, !!split, AC); if (!F.length) return null; return { blob: zipBlob(F), n: F.length }; };
  async function saveZip(blob, name) {
    const f = new File([blob], name, { type: 'application/zip' });
    try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: name }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); toast('ZIP téléchargé ✔');
  }

  window.openFiches = (pre) => {
    pre = pre || {};
    const classes = [...new Set([...(DB.classes || []).map(c => c.name), ...(DB.resultats || []).map(r => r && r.classe).filter(Boolean), ...(typeof epsCollClasses === 'function' ? epsCollClasses() : [])])].filter(Boolean);
    if (!classes.length) return toast('Créez d\'abord une classe');
    let cls = pre.cls && classes.includes(pre.cls) ? pre.cls : classes.includes(DB.lastClass) ? DB.lastClass : classes[0], actId = pre.actId || '', dayOn = pre.day != null ? !!pre.day : true, who0 = pre.who || '';
    if (!actId && pre.valKey) { const A0 = actsFor(cls).filter(a => a.val.includes(pre.valKey)).sort((a, b) => (b.date || 0) - (a.date || 0))[0]; if (A0) actId = A0.id; }
    const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.55);display:grid;place-items:center;padding:14px;overflow:auto';
    const chk = (k, l, on = true) => `<label style="display:flex;align-items:center;gap:8px;margin:6px 0;font-weight:700"><input type="checkbox" data-o="${k}" ${on ? 'checked' : ''} style="width:20px;height:20px;margin:0"> ${l}</label>`;
    const draw = () => { const st = namesOf(cls), AC = actsFor(cls); if (actId && !AC.some(a => a.id === actId)) actId = '';
      o.innerHTML = `<div class="card" style="max-width:420px;width:100%;max-height:92vh;overflow:auto"><h3 style="margin-top:0">🧑‍🎓 Fiches élèves en couleurs</h3>
        <p class="muted" style="font-size:.82rem;margin:0 0 8px">Une fiche visuelle par élève : niveaux de maîtrise validés avec les points, tournois, matchs et classements, résultats des outils. À imprimer, enregistrer en PDF ou envoyer. Rien n'est conservé dans l'appli.</p>
        <label style="margin-top:0">Classe</label><select id="fc">${classes.map(c => `<option ${c === cls ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
        <label>Élève</label><select id="fe"><option value="">👥 Toute la classe (${st.length})</option>${st.map(n => `<option>${esc(n)}</option>`).join('')}</select>
        <label>🎯 Activité</label><select id="fa"><option value="">Toutes les activités</option>${AC.map(a => `<option value="${esc(a.id)}" ${a.id === actId ? 'selected' : ''}>${esc(a.icon + ' ' + a.label)}</option>`).join('')}</select>
        <div class="muted" style="font-size:.76rem;margin-top:3px">Choisis une activité (ex. Badminton) : la fiche ne contient que sa validation, ses tournois / matchs et ses camemberts.</div>
        ${actId ? `<label style="display:flex;align-items:center;gap:8px;margin:8px 0 0;font-weight:700"><input type="checkbox" id="fday" ${dayOn ? 'checked' : ''} style="width:20px;height:20px;margin:0"> 📅 Seulement le tournoi / les matchs du jour de l'évaluation <small class="muted">(date de la validation)</small></label>` : ''}
        <b style="display:block;margin-top:12px">Contenu</b>${chk('val', '✅ Validation enseignant (niveaux, points, note)')}${chk('coll', '🏆 Tournois, matchs, classements')}${chk('res', '📈 Résultats des outils')}${chk('pie', '🥧 Camemberts (points bonus, consignes, rapports)')}${chk('gr', '📝 Grilles d\'évaluation')}
        <div style="margin-top:12px;padding:10px;border:2px dashed var(--line,#C9D3E6);border-radius:12px"><b>📦 Envoyer élève par élève</b>
          <div class="muted" style="font-size:.78rem;margin:3px 0 6px">Un ZIP avec <b>un fichier indépendant par élève</b> (toute la classe), à envoyer un par un.</div>
          ${actId ? '' : `<label style="display:flex;align-items:center;gap:8px;margin:4px 0;font-weight:700"><input type="checkbox" id="fsp" checked style="width:20px;height:20px;margin:0"> 📁 Un dossier par activité (sinon : une seule fiche par élève avec tout)</label>`}
          <button class="btn btn-grad btn-block" data-zip>📦 Créer le ZIP de la classe</button></div>
        <div class="row" style="margin-top:12px"><button class="btn btn-ghost" data-x>Annuler</button><button class="btn btn-grad" data-go>Créer</button></div></div>`;
      o.querySelector('#fe').value = who0; o.querySelector('#fe').onchange = e => { who0 = e.target.value; };
      o.querySelector('#fc').onchange = e => { cls = e.target.value; who0 = ''; draw(); };
      o.querySelector('#fa').onchange = e => { actId = e.target.value; draw(); };
      if (o.querySelector('#fday')) o.querySelector('#fday').onchange = e => { dayOn = e.target.checked; };
      o.querySelector('[data-x]').onclick = () => o.remove();
      o.querySelector('[data-zip]').onclick = async () => { const op = {}; o.querySelectorAll('[data-o]').forEach(x => op[x.dataset.o] = x.checked); if (actId) { op.act = actById(actId); op.day = dayOn; }
        const R = window.fichesZip(cls, op, !actId && (o.querySelector('#fsp') || {}).checked); if (!R) return toast('Aucune donnée pour cette sélection');
        const al = actId ? (AC.find(a => a.id === actId) || {}).label : 'toutes-activites'; o.remove(); await saveZip(R.blob, `fiches-${safe(cls)}-${safe(al).replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.zip`); toast(`${R.n} fiche${R.n > 1 ? 's' : ''} dans le ZIP ✔`); };
      o.querySelector('[data-go]').onclick = () => { const who = o.querySelector('#fe').value, op = {}; if (actId) { op.act = actById(actId); op.day = dayOn; } o.querySelectorAll('[data-o]').forEach(x => op[x.dataset.o] = x.checked);
        const names = who ? [who] : namesOf(cls); const html = window.fichesHTML([{ cls, names }], op); o.remove();
        if (!/class="page fiche"/.test(html)) return toast('Aucune donnée pour cette sélection');
        const al = actId ? (AC.find(a => a.id === actId) || {}).label : ''; epsShowDoc(html, `fiches-${(al ? al + '-' : '')}${(who || cls).replace(/[^\w-]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.html`.replace(/\s+/g, '-'), (who ? '🧑‍🎓 Fiche de ' + who : '🧑‍🎓 Fiches élèves · ' + cls) + (al ? ' · ' + al : '')); }; };
    document.body.appendChild(o); draw();
  };
})();
