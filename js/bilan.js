/* =========================================================
   EPS ONE — 📊 Bilan (fichier HTML en couleurs : camemberts, tableaux par classe et par outil)
   Le fichier est fabriqué au moment du clic à partir de DB.resultats : rien n'est stocké dans l'appli.
   ========================================================= */
const BIL_COLS = ['#1E5BD8', '#C9A227', '#1B9E5A', '#E0892F', '#8E44AD', '#D64545', '#0B2A5B', '#16A3A3', '#9C7A1E', '#5B8DEF', '#B0127A', '#4F6D7A'];

function bilanPie(seg, size = 150) {
  seg = seg.filter(x => x.v > 0); const tot = seg.reduce((a, x) => a + x.v, 0); if (!tot) return '';
  const R = 56, cx = 60, cy = 60, pt = (a, r = R) => [(cx + r * Math.cos(a)).toFixed(2), (cy + r * Math.sin(a)).toFixed(2)]; let a0 = -Math.PI / 2;
  const parts = seg.map(x => { const f = x.v / tot, a1 = a0 + f * 2 * Math.PI, mid = (a0 + a1) / 2, p0 = pt(a0), p1 = pt(a1), pc = Math.round(f * 100), tp = pt(mid, f >= .9999 ? 0 : R * .62);
    const shape = f >= .9999 ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${x.c}"/>` : `<path d="M${cx},${cy} L${p0} A${R},${R} 0 ${f > .5 ? 1 : 0} 1 ${p1} Z" fill="${x.c}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>`;
    const lab = pc >= 7 ? `<text x="${tp[0]}" y="${(+tp[1] + 4).toFixed(2)}" text-anchor="middle" font-size="${pc >= 20 ? 12 : 10}" font-weight="900" fill="#fff" stroke="rgba(0,0,0,.35)" stroke-width=".5" paint-order="stroke">${pc} %</text>` : '';
    a0 = a1; return shape + lab; }).join('');
  return `<div class="pie"><svg viewBox="0 0 120 120" width="${size}" height="${size}">${parts}</svg><div class="lg">${seg.map(x => `<div><i style="background:${x.c}"></i><span>${esc(x.l)}</span><b>${x.v}</b></div>`).join('')}</div></div>`;
}

/* Résultats collectifs (tournois, matchs, HYROX, C.O. par équipes…) et grilles d'évaluation d'une classe */
function bilanExtras(cls, opt) {
  let html = '', nColl = 0, nGr = 0; const esc2 = esc;
  if (opt.coll && typeof epsCollectifs === 'function') {
    const E = epsCollectifs(cls).filter(e => e.rows && e.rows.length && (typeof fichesEvData !== 'function' || fichesEvData(e)) && (!opt.act || typeof fichesEvOk !== 'function' || fichesEvOk(e, { act: opt.act }))); nColl = E.length;
    if (E.length) {
      const kinds = {}; E.forEach(e => { const k = (typeof epsCollSect === 'function' ? epsCollSect(e.k) : e.k).replace(/^[^\p{L}]+/u, ''); kinds[k] = (kinds[k] || 0) + 1; });
      html += `<h3>Résultats collectifs <small>${E.length} événement${E.length > 1 ? 's' : ''}</small></h3><div class="grid2"><div class="card"><h3 class="nb">Événements par type</h3>${bilanPie(Object.entries(kinds).map(([l, v], i) => ({ l, v, c: BIL_COLS[(i + 5) % BIL_COLS.length] })))}</div></div>`;
      html += E.map(e => { const title = String(e.title || e.event || '').replace(/<[^>]+>/g, ''), sub = String(e.sub || '').replace(/<[^>]+>/g, ''), lead = String(e.lead || '').replace(/<[^>]+>/g, '');
        const med = r => r === '' || r == null ? '–' : typeof r === 'number' ? (r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : r) : r;
        return `<div class="ev"><div class="evh"><b>${esc2(title)}</b><span>${esc2(sub || new Date(e.date).toLocaleDateString('fr-FR'))}</span></div>${lead ? `<div class="lead">${esc2(lead)}</div>` : ''}
          <div class="sc"><table><tr><th>#</th><th class="l">Équipe / élève</th><th class="l">Membres</th><th class="l">Résultat</th></tr>${e.rows.map(r => `<tr><td>${esc2(String(med(r[0])))}</td><td class="l"><b>${esc2(String(r[1] ?? ''))}</b></td><td class="l d">${esc2(String(r[2] || ''))}</td><td class="l">${esc2(String(r[3] ?? ''))}</td></tr>`).join('')}</table></div></div>`; }).join('');
    }
  }
  (opt.grilles || []).forEach(gi => { const g = (DB.grilles || [])[gi]; if (!g) return; const E = (g.evals || {})[cls] || {}, st = studentsOf(cls) || [];
    const names = [...new Set([...st, ...Object.keys(E)])].filter(n => E[n] && Object.keys(E[n]).length); if (!names.length) return; nGr++;
    const L = grLevels(g), pts = (g.type || 'points') === 'points', nL = L.length, col = x => GR_COLORS[Math.round(x / Math.max(1, nL - 1) * 3)] || '#2F6BD8';
    const tot = g.criteria.reduce((a, c) => a + (c.pts || 0), 0), sc = n => { let s = 0, k = 0; g.criteria.forEach((c, i) => { if (E[n][i] != null) { s += (c.pts || 0) * grK(g, E[n][i]); k++; } }); return { s, k, s20: tot ? s / tot * 20 : 0 }; };
    const dist = L.map((l, x) => ({ l, c: col(x), v: names.reduce((a, n) => a + g.criteria.filter((c, i) => E[n][i] === x).length, 0) }));
    const moy = pts ? names.map(n => sc(n)).filter(s => s.k).reduce((a, s, _, arr) => a + s.s20 / arr.length, 0) : null;
    html += `<h3><span class="dot" style="background:#B0127A"></span>Évaluation · ${esc2(g.name)} <small>${names.length} élève${names.length > 1 ? 's' : ''}${moy != null ? ' · moyenne ' + moy.toFixed(1).replace('.', ',') + ' / 20' : ''}</small></h3>
      <div class="grid2"><div class="card"><h3 class="nb">Répartition des niveaux</h3>${bilanPie(dist)}</div></div>
      <div class="sc"><table><tr><th class="l">Élève</th>${pts ? '<th>/20</th>' : ''}${g.criteria.map((c, k) => `<th title="${esc2(c.label)}">${esc2(c.label)}${pts ? ` <small>(${c.pts})</small>` : ''}</th>`).join('')}</tr>
      ${names.map(n => { const s = sc(n); return `<tr><td class="l"><b>${esc2(n)}</b></td>${pts ? `<td style="font-weight:900">${s.k ? s.s20.toFixed(1).replace('.', ',') : '–'}</td>` : ''}${g.criteria.map((c, k) => { const v = E[n][k]; return v != null ? `<td style="background:${col(v)};color:#fff;font-weight:700">${esc2(L[v])}</td>` : '<td class="none">–</td>'; }).join('')}</tr>`; }).join('')}</table></div>`; });
  return { html, nColl, nGr };
}


/* HYROX / Crosstraining : tableaux par groupe (élèves × exercices), couleurs par famille, temps et écart du groupe */
function bilanWod(cls, who) {
  if (typeof epsWodSeances !== 'function') return '';
  const S0 = epsWodSeances(cls).sort((a, b) => a.date - b.date); if (!S0.length) return '';
  const S = []; S0.forEach(x => { const k = new Date(x.date).toDateString() + '|' + (x.nom || '') + '|' + x.prevu; let y = S.find(z => z.k === k); if (!y) S.push(y = { ...x, k, groups: [] }); y.groups.push(...x.groups); });   // une tablette par groupe : on réunit les groupes d'une même épreuve du même jour
  if (who) { S.forEach(y => { y.groups = y.groups.filter(g => (g.members || []).includes(who)); }); for (let i = S.length - 1; i >= 0; i--) if (!S[i].groups.length) S.splice(i, 1); if (!S.length) return ''; }   // fiche élève : seulement son groupe
  const FN = (window.epsWodFam || {}).names || ['Bas du corps', 'Haut du corps', 'Cardio', 'Résistance'], FC = (window.epsWodFam || {}).cols || ['#1FA2E8', '#E53935', '#F4B400', '#43A047'];
  const mm = s => { if (s == null || isNaN(s)) return '–'; const neg = s < 0; s = Math.abs(Math.round(s)); return (neg ? '−' : '') + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const tint = c => c + '26', fcol = f => f == null ? '#6B7280' : FC[f], fnm = f => f == null ? 'RUN / autre' : FN[f];
  const natural = (a, b) => String(a.name).localeCompare(String(b.name), 'fr', { numeric: true });
  // validation enseignant (maîtrise par critère), si elle existe pour cette classe
  const vk = typeof valHasSet === 'function' && valHasSet('wod', valLevelOf(cls)) ? 'wod@' + valLevelOf(cls) : 'wod';
  const VC = typeof valCrit === 'function' ? (() => { try { return valCrit(vk); } catch (e) { return []; } })() : [], VV = ((DB.valid || {}).v || {}).wod && DB.valid.v.wod[cls] || {};
  const chips = n => { const W = VV[n]; if (!W || !VC.length) return ''; return VC.filter(c => W[c.id] != null).map(c => { const m = EPS_M[W[c.id]]; return `<span class="chip2" style="background:${m[1]}">${esc(String(c.n).replace(/^Maîtrise des exercices\s*/i, '').replace(/^Maîtrise\s*/i, ''))} · ${esc(m[2] || m[0])}</span>`; }).join(' '); };
  return S.map(se => {
    const gs = se.groups.slice().sort(natural);
    const tbl = (g, bl) => { const col = bl.cols, fam = []; col.forEach(c => { const l = fam[fam.length - 1]; if (l && l.f === c.f) l.n++; else fam.push({ f: c.f, n: 1 }); });
      const head = `<tr><th class="l" rowspan="2">Élève</th>${fam.map(x => `<th colspan="${x.n}" style="background:${fcol(x.f)}">${esc(fnm(x.f))}</th>`).join('')}</tr><tr>${col.map(c => `<th class="ex" style="background:${tint(fcol(c.f))};color:#0E1A33">${esc(c.nom)}${c.niv ? ` <small>N${c.niv}</small>` : ''}</th>`).join('')}</tr>`;
      const rows = bl.rows.filter(r => !who || r.name === who).map(r => `<tr><td class="l"><b>${esc(r.name)}</b></td>${r.cells.map((x, i) => !x ? '<td class="none">–</td>' : `<td style="background:${tint(fcol(col[i].f))};font-weight:800">${x.done >= x.plan ? x.done + ' ✔' : `<span style="color:#B45309">${x.done}/${x.plan}</span>`}</td>`).join('')}</tr>`).join('');
      const foot = bl.fam.length ? `<tr class="cum"><td class="l"><b>👥 Cumul du groupe</b></td>${fam.map(x => { const F = bl.fam.find(y => y.f === x.f); return `<td colspan="${x.n}" style="background:${F ? tint(fcol(x.f)) : '#fff'};font-weight:900">${F ? `${F.done} / ${F.target}${F.done >= F.target ? ' ✔' : ''}` : ''}</td>`; }).join('')}</tr>` : '';
      const run = bl.run ? `<div class="mut" style="margin-top:4px">🏃 RUN du groupe : <b>${bl.run.done} / ${bl.run.tot}</b></div>` : '';
      return `<div class="sc"><table class="wt">${head}${rows}${foot}</table></div>${run}`; };
    const over = g => !!g.capped || (g.t != null && se.cap != null && g.t > se.cap * 60);
    const cards = gs.map(g => {
      const valRows = g.members.filter(n => !who || n === who).map(n => [n, chips(n)]).filter(x => x[1]);
      return `<div class="wg"><div class="wgh"><div><b>${esc(g.name)}</b><div class="mut" style="font-size:.78rem">${who ? `groupe de ${g.members.length}` : esc(g.members.join(' · '))}</div></div>
        <div class="wgt">${g.t != null ? `<span class="tm">⏱ ${mm(g.t)}</span>` : '<span class="tm nt">non terminé</span>'}${g.t != null || g.capped ? `<span class="ec" style="background:${over(g) ? '#D64545' : '#1B9E5A'}">${over(g) ? '⏱ temps limite de ' + se.cap + ' min atteint' : '✅ dans le temps limite (' + se.cap + ' min)'}</span>` : ''}</div></div>
        ${g.blocks.map((b, i) => `${g.blocks.length > 1 ? `<div style="font-weight:800;margin:8px 0 2px">Bloc ${b.k + 1}</div>` : ''}${tbl(g, b)}`).join('')}
        ${valRows.length ? `<div class="vr"><b>✅ Validation enseignant</b>${valRows.map(([n, c]) => `<div><span>${esc(n)}</span><span>${c}</span></div>`).join('')}</div>` : ''}</div>`; }).join('');
    const tg = gs.filter(g => g.t != null), best = tg.length ? tg.slice().sort((a, b) => Math.abs(a.ecart) - Math.abs(b.ecart))[0] : null;
    const sumT = gs.length > 1 && !who ? `<div class="sc"><table><tr><th class="l">Groupe</th><th>Temps</th><th>Temps limite (${se.cap} min)</th></tr>${gs.map(g => `<tr><td class="l"><b>${esc(g.name)}</b> <span class="d">${esc(g.members.join(', '))}</span></td><td>${g.t != null ? mm(g.t) : '–'}${g.capped ? ' ⏱ cap' : ''}</td><td style="background:${g.t == null && !g.capped ? '#fff' : over(g) ? '#FBE0E0' : '#DDF3E7'};font-weight:800">${g.t == null && !g.capped ? '–' : over(g) ? 'atteint' : 'respecté'}</td></tr>`).join('')}</table></div>` : '';
    return `<div class="ev" style="border-left-color:#E53935"><div class="evh"><b>${esc(se.nom || 'Épreuve')}</b><span>${new Date(se.date).toLocaleDateString('fr-FR')} · temps limite ${se.cap} min · ${gs.length} groupe${gs.length > 1 ? 's' : ''}</span></div>${sumT}${cards}</div>`; }).join('');
}

/* Duathlon : un tableau par groupe (élèves × étapes), couleurs par étape, temps et totaux du groupe */
function bilanDua(cls, who) {
  const S0 = ((DB.duathlon || {}).seances || []).filter(r => r && r.classe === cls).sort((a, b) => a.date - b.date); if (!S0.length) return '';
  const mm = s => { if (s == null || isNaN(s)) return '–'; s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const S = []; S0.forEach(x => { const base = String(x.id).split('-')[0]; let y = S.find(z => z.base === base); if (!y) S.push(y = { ...x, base, groups: [] }); y.groups.push(...(x.groups || [])); });
  if (who) { S.forEach(y => { y.groups = y.groups.filter(g => (g.members || []).includes(who)); }); for (let i = S.length - 1; i >= 0; i--) if (!S[i].groups.length) S.splice(i, 1); if (!S.length) return ''; }
  const SC = ['#1E88E5', '#E8832A', '#43A047'], tint = c => c + '26', nat = (a, b) => String(a.name).localeCompare(String(b.name), 'fr', { numeric: true });
  return S.map(se => { const c = se.cfg || {}, commun = e => Array.isArray(c.tc) ? !!c.tc[e] : e === 2;
    const cols = () => [['pts', '🎯 Pts'], ...(c.optL ? [['inval', '❌ Lancers']] : []), ['tours', '🏃 Tours'], ...(c.optC ? [['penC', '⚠️ Pén.']] : [])];
    const step = (g, e) => { const E = g.etapes[e], ms = g.members.map(n => E.m[n] || {}), sum = k => ms.reduce((a, m) => a + (m[k] || 0), 0), temps = E.dep && E.arr ? (E.arr - E.dep) / 1000 : null, penS = c.optC ? sum('penC') * (c.secC || 10) : 0;
      return { pts: sum('pts'), tours: commun(e) ? (E.tc || 0) : sum('tours'), inval: sum('inval'), penC: sum('penC'), temps, penS, total: temps != null ? temps + penS : null }; };
    const tot = g => { const st = [0, 1, 2].map(e => step(g, e)); return { st, T: st.every(x => x.total != null) ? st.reduce((a, x) => a + x.total, 0) : null, part: st.reduce((a, x) => a + (x.total || 0), 0), pts: st.reduce((a, x) => a + x.pts, 0), tours: st.reduce((a, x) => a + x.tours, 0), pen: st.reduce((a, x) => a + x.penS, 0) }; };
    const cs = cols();
    /* ⚡ Potentiel VMA du groupe + % de maîtrise (même formule que l'écran du duathlon : duaCoef) */
    const vmaN = (g, n) => { const v = g.vma && g.vma[n]; if (v != null) return v; const K = (((DB.duathlon || {}).vma || {})[cls] || {})[n]; return K ? K.v : null; };
    const pm = (g, T) => { const R = duaCoef(c.dist || DUA_DIST, T, g.members.map(n => vmaN(g, n))); R.miss = g.members.filter(n => vmaN(g, n) == null); return R; };
    const mcol = k => k == null ? '#8A94AA' : k >= .9 ? '#1B9E5A' : k >= .75 ? '#E0892F' : '#D64545';
    const pills = R => R.manque ? `<span class="ec" style="background:#8A94AA" title="${esc(R.miss.join(', '))}">⚠️ VMA manquante</span>` : `<span class="ec" style="background:#5B4BC4">⚡ Potentiel VMA ${duaFr(R.pot)} km/h</span>${R.coef != null ? `<span class="ec" style="background:${mcol(R.coef)}">🎯 Maîtrise ${duaPct(R.coef)}</span>` : ''}`;
    const cards = se.groups.slice().sort(nat).map(g => { const { st, T, part, pts, tours, pen } = tot(g), PM = pm(g, T);
      const head = `<tr><th class="l" rowspan="2">Élève</th>${[0, 1, 2].map(e => `<th colspan="${cs.length}" style="background:${SC[e]}">Étape ${e + 1}${st[e].temps != null ? ` · ⏱ ${mm(st[e].temps)}${st[e].penS ? ` (+${st[e].penS} s)` : ''}` : ''}</th>`).join('')}<th colspan="2" style="background:#0B2A5B">Total élève</th></tr>
        <tr>${[0, 1, 2].map(e => cs.map(([k, l]) => `<th class="ex" style="background:${tint(SC[e])};color:#0E1A33">${l}</th>`).join('')).join('')}<th class="ex" style="background:#E4E9F3;color:#0E1A33">🎯 Pts</th><th class="ex" style="background:#E4E9F3;color:#0E1A33">🏃 Tours</th></tr>`;
      const rows = g.members.filter(n => !who || n === who).map(n => { let tp = 0, tt = 0, anyT = false; const tds = [0, 1, 2].map(e => { const m = (g.etapes[e].m[n]) || {}; tp += m.pts || 0; if (!commun(e)) { tt += m.tours || 0; anyT = true; }
        return cs.map(([k]) => k === 'tours' && commun(e) ? `<td style="background:${tint(SC[e])}" class="d">↓ groupe</td>` : `<td style="background:${tint(SC[e])};font-weight:800;${k === 'inval' || k === 'penC' ? (m[k] ? 'color:#C62828' : 'color:#9AA') : ''}">${m[k] || 0}</td>`).join(''); }).join('');
        return `<tr><td class="l"><b>${esc(n)}</b>${vmaN(g, n) != null ? `<div class="mut" style="font-size:.7rem">VMA ${duaFr(vmaN(g, n))}</div>` : ''}</td>${tds}<td style="font-weight:900">${tp}</td><td style="font-weight:900">${anyT ? tt : '–'}</td></tr>`; }).join('');
      const foot = `<tr class="cum"><td class="l"><b>👥 Groupe</b></td>${[0, 1, 2].map(e => cs.map(([k]) => `<td style="background:${tint(SC[e])};font-weight:900">${st[e][k]}</td>`).join('')).join('')}<td style="font-weight:900">${pts}</td><td style="font-weight:900">${tours}</td></tr>`;
      return `<div class="wg"><div class="wgh"><div><b>${esc(g.name)}</b><div class="mut" style="font-size:.78rem">${who ? `groupe de ${g.members.length}` : esc(g.members.join(' · '))}</div></div>
        <div class="wgt">${T != null ? `<span class="tm">⏱ ${mm(T)}</span>` : `<span class="tm nt">${mm(part)} · incomplet</span>`}${pen ? `<span class="ec" style="background:#E0892F">+${pen} s pénalités</span>` : ''}<span class="ec" style="background:#1B9E5A">${pts} pts · ${tours} tours</span></div></div>
        <div class="wgt" style="margin:4px 0 8px">${pills(PM)}${PM.vReal != null && !PM.manque ? `<span class="mut" style="font-size:.78rem">${duaFr(PM.vReal)} km/h réalisés · VMA moy. ${duaFr(PM.vMoy)}</span>` : ''}</div>
        <div class="sc"><table class="wt">${head}${rows}${foot}</table></div></div>`; }).join('');
    const ranked = se.groups.map(g => { const t = tot(g); const R = pm(g, t.T); return { name: g.name, t: t.T, pts: t.pts, tours: t.tours, pot: R.manque ? null : R.pot, k: R.coef }; });
    const best = Math.min(...ranked.filter(r => r.t != null).map(r => r.t), Infinity);
    const sum = se.groups.length > 1 && !who ? `<div class="sc"><table><tr><th class="l">Groupe</th><th>Temps total</th><th>Points lancers</th><th>Tours</th><th>⚡ Potentiel VMA</th><th>🎯 Maîtrise</th></tr>${ranked.slice().sort((a, b) => (a.t ?? 1e9) - (b.t ?? 1e9)).map(r => `<tr><td class="l"><b>${esc(r.name)}</b></td><td style="background:${r.t === best ? '#DDF3E7' : '#fff'};font-weight:800">${r.t != null ? mm(r.t) + (r.t === best ? ' 🏆' : '') : '–'}</td><td>${r.pts}</td><td>${r.tours}</td><td>${r.pot != null ? duaFr(r.pot) + ' km/h' : '–'}</td><td style="font-weight:900;color:${mcol(r.k)}">${duaPct(r.k)}</td></tr>`).join('')}</table></div>` : '';
    return `<div class="ev" style="border-left-color:#1E88E5"><div class="evh"><b>${esc(se.nom || 'Duathlon')}</b><span>${new Date(se.date).toLocaleDateString('fr-FR')} · ${se.groups.length} groupe${se.groups.length > 1 ? 's' : ''}</span></div>${sum}${cards}</div>`; }).join('');
}

/* Toutes les autres activités : tableau élèves × indicateurs (lus dans le détail), regroupé par séance et par groupe/équipe, cases colorées selon la valeur */
function bilanGen(L, color, pupils) {
  const dt = ts => new Date(ts).toLocaleDateString('fr-FR'), day = ts => new Date(ts).toDateString();
  const BAD = /faute|p[ée]nalit|erreur|non valid|perdu|abandon|chute|rat[ée]|manqu|recule|temps|✗|❌/i;
  const GRP = /^(groupe|[ée]quipe|bin[ôo]me|relais|team|poule|couloir|atelier)\b/i;
  const num = s => { const m = /-?\d+(?:[.,]\d+)?/.exec(String(s)); return m ? parseFloat(m[0].replace(',', '.')) : null; };
  const P = L.map(r => { const segs = String(r.detail || '').split(' · ').map(s => s.trim()).filter(Boolean), M = [], notes = []; let grp = '';
    segs.forEach((s, i) => { if (i === 0 && GRP.test(s)) { grp = s; return; }
      const fq = /^(.*?)[\s:]*(\d+)\s*\/\s*(\d+)$/.exec(s), fq2 = /^(\d+)\s*\/\s*(\d+)\s+(.+)$/.exec(s), tq = /^(.*?)[\s:]*(\d+):(\d{2})(?:[,.](\d+))?$/.exec(s);   // « fluidité 3/4 », « 8/10 balises », « temps 1:05,3 »
      if (fq2 && fq2[3].length < 26) { M.push({ l: fq2[3].trim(), v: +fq2[1], u: '/' + fq2[2] }); return; }
      if (fq && fq[1] && fq[1].length < 26) { M.push({ l: fq[1].trim(), v: +fq[2], u: '/' + fq[3] }); return; }
      if (tq && tq[1] && tq[1].length < 26) { M.push({ l: tq[1].trim(), v: +tq[2] * 60 + parseFloat(tq[3] + (tq[4] ? '.' + tq[4] : '')), u: '', t: s.slice(tq[1].length).replace(/^[\s:]+/, '') }); return; }
      const m = /^(.*?)[\s:]*(-?\d+(?:[.,]\d+)?)\s*(%|pts?|s|m|min|km\/h|tours?)?$/i.exec(s), m2 = /^(-?\d+(?:[.,]\d+)?)\s*(%|pts?|s|m|min|km\/h)?\s+(.+)$/i.exec(s);
      if (m && m[1] && m[1].length < 26) M.push({ l: m[1].trim(), v: parseFloat(m[2].replace(',', '.')), u: m[3] || '' });
      else if (m2 && m2[3].length < 26) M.push({ l: m2[3].trim(), v: parseFloat(m2[1].replace(',', '.')), u: m2[2] || '' });
      else notes.push(s); });
    const seen = {}; M.forEach(x => { seen[x.l] = (seen[x.l] || 0) + 1; if (seen[x.l] > 1) x.l += ' ' + seen[x.l]; });
    if (!grp) { const q = /([ÉE]quipe\s+[A-Z0-9]+)/.exec(String(r.valeur)); if (q) grp = q[1]; }
    return { r, grp, M, notes }; });
  const outc = v => { v = String(v); return /^victoire|valid[ée]/i.test(v) ? '#1B9E5A33' : /^d[ée]faite/i.test(v) ? '#D6454533' : /^(nul|observ)/i.test(v) ? '#8A94AA33' : /^1er\b/.test(v) ? '#C9A22744' : /^[23]e\b/.test(v) ? '#C9A22722' : ''; };
  const days = new Set(L.map(r => day(r.date))), multi = days.size > 1;
  const secs = []; P.forEach(p => { const k = (multi && p.grp ? day(p.r.date) : '') + '|' + p.grp; let s = secs.find(x => x.k === k); if (!s) secs.push(s = { k, date: p.r.date, grp: p.grp, rows: [] }); s.rows.push(p); });
  secs.sort((a, b) => a.date - b.date || String(a.grp).localeCompare(String(b.grp), 'fr', { numeric: true }));
  const tbl = s => { const cnt = {}; s.rows.forEach(p => p.M.forEach(x => cnt[x.l] = (cnt[x.l] || 0) + 1)); const top = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).slice(0, 7);
    const ord = []; s.rows.forEach(p => p.M.forEach(x => { if (top.includes(x.l) && !ord.includes(x.l)) ord.push(x.l); }));
    const st = {}; ord.forEach(l => { const v = s.rows.map(p => (p.M.find(x => x.l === l) || {}).v).filter(x => x != null); st[l] = { mn: Math.min(...v), mx: Math.max(...v), bad: BAD.test(l) }; });
    const rn = s.rows.map(p => /^\s*-?\d+(?:[.,]\d+)?\s*(?:%|pts?|m|s|km\/h|tours?|points?)?\s*$/i.test(String(p.r.valeur)) ? num(p.r.valeur) : null), okR = rn.filter(x => x != null).length >= 2, rmx = Math.max(...rn.filter(x => x != null), 0), rmn = Math.min(...rn.filter(x => x != null), 0);
    const heat = (v, S) => { if (v == null) return ''; if (S.mx === S.mn) return 'background:#9AA6BF22;'; const t = (v - S.mn) / (S.mx - S.mn), good = S.bad ? 1 - t : t, c = good > .66 ? '#1B9E5A' : good < .34 ? '#D64545' : '#E0A92F'; return `background:${c}${Math.round(24 + good * 40).toString(16).padStart(2, '0')};`; };
    const showD = !s.grp && multi, notes = s.rows.some(p => p.notes.length), base = Math.min(rmn, 0);
    return `<div class="sc"><table class="wt"><tr><th class="l">Élève</th>${showD ? '<th>Date</th>' : ''}<th style="background:${color}">Résultat</th>${ord.map(l => `<th style="background:${color}CC">${esc(l)}</th>`).join('')}${notes ? '<th class="l" style="background:#667">Remarques</th>' : ''}</tr>
      ${s.rows.map((p, i) => `<tr><td class="l"><b>${esc(p.r.eleve)}</b></td>${showD ? `<td>${dt(p.r.date)}</td>` : ''}<td style="background:${outc(p.r.valeur) || color + '22'};font-weight:900">${esc(String(p.r.valeur))}${okR && rn[i] != null && rmx > base ? `<div class="mb"><i style="width:${Math.max(4, Math.round((rn[i] - base) / (rmx - base) * 100))}%;background:${color}"></i></div>` : ''}</td>${ord.map(l => { const x = p.M.find(y => y.l === l); return x ? `<td style="${heat(x.v, st[l])}font-weight:800">${x.t || x.v}${x.u && !/^tours?$/i.test(x.u) ? ' <small>' + esc(x.u) + '</small>' : ''}</td>` : '<td class="none">–</td>'; }).join('')}${notes ? `<td class="l d">${esc(p.notes.join(' · '))}</td>` : ''}</tr>`).join('')}</table></div>`; };
  return secs.map(s => `<div class="wg">${s.grp ? `<div class="wgh"><div><b>${esc(s.grp)}</b>${multi ? ` <span class="mut" style="font-size:.78rem">· ${dt(s.date)}</span>` : ''}<div class="mut" style="font-size:.78rem">${esc([...new Set(s.rows.map(p => p.r.eleve))].join(' · '))}</div></div></div>` : ''}${tbl(s)}</div>`).join('');
}

/* Fiches individuelles : une page par élève (activités, critères/objectifs, niveaux de maîtrise en couleurs, notes, performances) */
function bilanFiches(opt) {
  if (typeof fichesBodyFor === 'function') return fichesBodyFor(opt);
  const fr = x => (Math.round(x * 10) / 10).toString().replace('.', ','), dt = ts => new Date(ts).toLocaleDateString('fr-FR');
  const names = Object.fromEntries(TOOLS.map(t => [t.id, t.name])), M = window.EPS_M;
  const noteCol = n => n >= 16 ? '#1B9E5A' : n >= 11 ? '#2F6BD8' : n >= 6 ? '#E0892F' : '#D64545';
  const pages = [];
  opt.classes.forEach(cls => {
    const st = (studentsOf(cls) || []).slice(), V = (DB.valid || {}).v || {}, lv = typeof valLevelOf === 'function' ? valLevelOf(cls) : '';
    const rs = (DB.resultats || []).filter(r => r && r.classe === cls && r.eleve && (!opt.tools || opt.tools.includes(r.tool)));
    rs.forEach(r => { if (!st.includes(r.eleve)) st.push(r.eleve); });
    const vKeys = Object.keys(V).filter(k => V[k] && V[k][cls]);
    st.forEach(n => {
      let body = '', badges = '';
      // 1) validation enseignant : objectifs/critères, maîtrise, note
      vKeys.forEach(k => { const W = V[k][cls][n]; if (!W || typeof valLvls !== 'function' || !valLvls(W).length) return;
        const [t, sb] = k.split(':'), T = (typeof VAL_TOOLS !== 'undefined' && VAL_TOOLS[t]) || { n: t }, ck = typeof valHasSet === 'function' && valHasSet(k, lv) ? k + '@' + lv : k;
        let C = []; try { C = valCrit(ck); } catch (e) {} if (!C.length) return;
        const cfg = valCfg(ck), NT = cfg.on ? valNote(C, W, cfg) : null, avg = epsMAvg(valLvls(W)), title = T.n + (sb ? ' · ' + ((T.sub && T.sub[sb] && T.sub[sb].n) || sb) : '');
        badges += `<span class="fb" style="background:${avg != null ? M[avg][1] : '#889'}">${esc(title)} · ${avg != null ? esc(M[avg][2] || M[avg][0]) : '–'}${NT ? ' · ' + fr(NT.n20) + '/20' : ''}</span>`;
        const subs = NT && Object.keys(NT.sub).filter(x => x).length ? `<div class="fsub">${Object.entries(NT.sub).filter(([x]) => x).map(([x, v]) => `<span style="border-color:${noteCol(v)};color:${noteCol(v)}">${esc(x)} : <b>${fr(v)}/20</b></span>`).join('')}</div>` : '';
        body += `<div class="fa"><div class="fah"><b>${esc(title)}</b>${NT ? `<span class="fn" style="background:${noteCol(NT.n20)}">${fr(NT.n20)}<small>/20</small></span>` : ''}</div>
          <div class="fgoal">🎯 Objectifs et critères observés</div>
          <table class="wt"><tr><th class="l">Critère</th><th style="width:34%">Niveau de maîtrise</th>${cfg.on ? '<th style="width:60px">Note</th>' : ''}</tr>
          ${C.map(c => { const l = W[c.id]; if (l == null) return `<tr><td class="l d">${esc(c.n)}</td><td class="none">non observé</td>${cfg.on ? '<td class="none">–</td>' : ''}</tr>`;
            return `<tr><td class="l">${esc(c.n)}</td><td><div class="lvb">${M.map((m, i) => `<i style="background:${i <= l ? M[l][1] : '#E4E9F3'}"></i>`).join('')}</div><span class="lvt" style="color:${M[l][1]}">${esc(M[l][0])}</span></td>${cfg.on ? `<td style="font-weight:900">${fr(valPt(c.id, W, cfg))}</td>` : ''}</tr>`; }).join('')}</table>${subs}</div>`; });
      // 2) performances (résultats des outils)
      const mine = rs.filter(r => r.eleve === n && r.tool !== 'valid' && !/^valid\|/.test(String(r.key || '')));
      const byT = {}; mine.forEach(r => (byT[names[r.tool] || r.label || r.tool] = byT[names[r.tool] || r.label || r.tool] || []).push(r));
      const perf = Object.entries(byT).map(([t, L], i) => { const col = BIL_COLS[i % BIL_COLS.length]; L.sort((a, b) => a.date - b.date);
        return `<div class="fa"><div class="fah"><b>${esc(t)}</b><span class="mut">${L.length} résultat${L.length > 1 ? 's' : ''}</span></div>
          <table class="wt"><tr><th style="background:${col};width:90px">Date</th><th style="background:${col}">Résultat</th><th class="l" style="background:${col}CC">Détail</th></tr>${L.map(r => `<tr><td>${dt(r.date)}</td><td style="background:${col}22;font-weight:900">${esc(String(r.valeur))}</td><td class="l d">${esc(String(r.detail || '')).split(' · ').map(s => `<span class="chip3">${s}</span>`).join(' ')}</td></tr>`).join('')}</table></div>`; }).join('');
      // 3) grilles d'évaluation
      let gh = ''; (opt.grilles || []).forEach(gi => { const g = (DB.grilles || [])[gi]; if (!g) return; const E = ((g.evals || {})[cls] || {})[n]; if (!E || !Object.keys(E).length) return;
        const L = grLevels(g), pts = (g.type || 'points') === 'points', nL = L.length, col = x => GR_COLORS[Math.round(x / Math.max(1, nL - 1) * 3)] || '#2F6BD8', tot = g.criteria.reduce((a, c) => a + (c.pts || 0), 0);
        let s = 0; g.criteria.forEach((c, i) => { if (E[i] != null) s += (c.pts || 0) * grK(g, E[i]); }); const s20 = tot ? s / tot * 20 : 0;
        gh += `<div class="fa"><div class="fah"><b>Évaluation · ${esc(g.name)}</b>${pts ? `<span class="fn" style="background:${noteCol(s20)}">${fr(s20)}<small>/20</small></span>` : ''}</div>
          <table class="wt"><tr><th class="l">Critère</th><th>Niveau</th></tr>${g.criteria.map((c, i) => E[i] != null ? `<tr><td class="l">${esc(c.label)}${pts ? ` <small class="d">(${c.pts} pts)</small>` : ''}</td><td style="background:${col(E[i])};color:#fff;font-weight:800">${esc(L[E[i]])}</td></tr>` : '').join('')}</table></div>`; });
      if (!body && !perf && !gh) return;
      pages.push(`<section class="page fiche"><div class="fh"><div><h2 style="border:0;margin:0;color:#fff">${esc(n)}</h2><div>${esc(cls)} · ${esc(DB.annee || '')}</div></div><div class="fbs">${badges}</div></div>${body}${perf}${gh}<div class="mut" style="font-size:.7rem;margin-top:10px">Édité le ${new Date().toLocaleDateString('fr-FR')} — EPS ONE</div></section>`);
    });
  });
  return pages.join('') || '<section class="page"><p class="mut">Aucune donnée individuelle pour les classes choisies.</p></section>';
}

/* Le bilan est en lecture seule : il ne doit rien écrire dans les données (les helpers de validation créent des valeurs par défaut en mémoire → on les annule) */
function bilanHTML(opt) {
  const before = JSON.stringify(DB.valid === undefined ? null : DB.valid);
  try { return bilanHTML0(opt); } finally { if (JSON.stringify(DB.valid === undefined ? null : DB.valid) !== before) { const b = JSON.parse(before); if (b === null) delete DB.valid; else DB.valid = b; } }
}
function bilanHTML0(opt) {
  const names = Object.fromEntries(TOOLS.map(t => [t.id, t.name])), tName = r => names[r.tool] || r.label || r.tool || 'Autre';
  const isVal = r => /^valid\|/.test(String(r.key || '')) || r.tool === 'valid', vis = typeof bilanValid === 'function';
  const all = (DB.resultats || []).filter(r => r && r.classe && r.eleve && opt.classes.includes(r.classe) && (!opt.tools || opt.tools.includes(r.tool)) && !(vis && isVal(r)));
  const toolList = [...new Set(all.map(tName))].sort((a, b) => a.localeCompare(b, 'fr')), tc = Object.fromEntries(toolList.map((t, i) => [t, BIL_COLS[i % BIL_COLS.length]]));
  const dt = ts => new Date(ts).toLocaleDateString('fr-FR'), today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const tint = c => c + '22';
  const clsSections = opt.classes.map(cls => {
    const rs = all.filter(r => r.classe === cls); const st = studentsOf(cls) || [];
    const ex = bilanExtras(cls, opt), vHTML = vis ? bilanValid(cls, opt) : '', exHTML = vHTML + (typeof bilanPies === 'function' && opt.pie !== false ? bilanPies(cls, opt) : '') + ex.html;
    const pupils = [...new Set([...st, ...rs.map(r => r.eleve)])].filter(n => rs.some(r => r.eleve === n) || st.includes(n));
    if (!rs.length) return `<section class="page"><h2>${esc(cls)}</h2><p class="mut">${st.length} élève${st.length > 1 ? 's' : ''} · aucun résultat d'outil enregistré.</p>${exHTML}</section>`;
    const byTool = {}; rs.forEach(r => (byTool[tName(r)] = byTool[tName(r)] || []).push(r));
    const tools = Object.keys(byTool).sort((a, b) => a.localeCompare(b, 'fr'));
    const perPupil = pupils.map(n => ({ n, v: rs.filter(r => r.eleve === n).length })).filter(x => x.v);
    const maxP = Math.max(1, ...perPupil.map(x => x.v));
    const last = (n, t) => (byTool[t] || []).filter(r => r.eleve === n).sort((a, b) => b.date - a.date)[0];
    const matrix = `<h3>Tableau élèves × outils <small>(dernier résultat de chaque outil)</small></h3><div class="sc"><table class="mx"><tr><th class="l">Élève</th>${tools.map(t => `<th style="background:${tc[t]}">${esc(t)}</th>`).join('')}</tr>
      ${pupils.map(n => `<tr><td class="l"><b>${esc(n)}</b></td>${tools.map(t => { const r = last(n, t); return r ? `<td style="background:${tint(tc[t])}">${esc(String(r.valeur))}</td>` : '<td class="none">–</td>'; }).join('')}</tr>`).join('')}</table></div>`;
    const blocks = tools.map(t => { let L = byTool[t].slice(); const wodX = L.some(r => r.tool === 'wod') ? (typeof bilanWod === 'function' ? bilanWod(cls) : '') : '';
      if (wodX) { L = L.filter(r => !/^(wod\||valid\|wod)/.test(String(r.key || ''))); const head = `<h3 style="border-color:${tc[t]}"><span class="dot" style="background:${tc[t]}"></span>${esc(t)} <small>par groupe</small></h3>${wodX}`; if (!L.length) return head; return head + (() => { const L2 = L.slice().sort((a, b) => (pupils.indexOf(a.eleve) - pupils.indexOf(b.eleve)) || a.date - b.date); return `<div class="sc"><table><tr><th class="l">Élève</th><th>Date</th><th>Résultat</th><th class="l">Détail</th></tr>${L2.map(r => `<tr><td class="l"><b>${esc(r.eleve)}</b></td><td>${dt(r.date)}</td><td style="background:${tint(tc[t])};font-weight:800">${esc(String(r.valeur))}</td><td class="l d">${esc(String(r.detail || ''))}</td></tr>`).join('')}</table></div>`; })(); }
      if (L.length && L.every(r => r.tool === 'duathlon') && typeof bilanDua === 'function') { const dx = bilanDua(cls); if (dx) return `<h3 style="border-color:${tc[t]}"><span class="dot" style="background:${tc[t]}"></span>${esc(t)} <small>par groupe</small></h3>${dx}`; }
      L = L.sort((a, b) => (pupils.indexOf(a.eleve) - pupils.indexOf(b.eleve)) || a.date - b.date);
      if (typeof bilanGen === 'function' && !L.every(r => r.tool === 'valid')) { const gx = bilanGen(L, tc[t], pupils); if (gx) return `<h3 style="border-color:${tc[t]}"><span class="dot" style="background:${tc[t]}"></span>${esc(t)} <small>${L.length} résultat${L.length > 1 ? 's' : ''}</small></h3>${gx}`; }
      const num = r => { const m = /-?\d+(?:[.,]\d+)?/.exec(String(r.valeur)); return m && !/:/.test(String(r.valeur)) ? parseFloat(m[0].replace(',', '.')) : null; };
      const nums = L.map(num), ok = nums.filter(x => x != null).length >= 3, mx = ok ? Math.max(...nums.filter(x => x != null), 0) : 0;
      return `<h3 style="border-color:${tc[t]}"><span class="dot" style="background:${tc[t]}"></span>${esc(t)} <small>${L.length} résultat${L.length > 1 ? 's' : ''}</small></h3><div class="sc"><table><tr><th class="l">Élève</th><th>Date</th><th>Résultat</th>${ok ? '<th class="bar"></th>' : ''}<th class="l">Détail</th></tr>
        ${L.map((r, i) => `<tr><td class="l"><b>${esc(r.eleve)}</b></td><td>${dt(r.date)}</td><td style="background:${tint(tc[t])};font-weight:800">${esc(String(r.valeur))}</td>${ok ? `<td class="bar">${nums[i] != null && mx > 0 ? `<i style="width:${Math.max(3, Math.round(nums[i] / mx * 100))}%;background:${tc[t]}"></i>` : ''}</td>` : ''}<td class="l d">${esc(r.detail || '')}</td></tr>`).join('')}</table></div>`; }).join('');
    return `<section class="page"><h2>${esc(cls)}</h2>
      <div class="chips"><div><b>${st.length || pupils.length}</b><span>élèves</span></div><div><b>${rs.length}</b><span>résultats</span></div><div><b>${tools.length}</b><span>outils utilisés</span></div><div><b>${perPupil.length}</b><span>élèves avec résultat</span></div></div>
      <div class="grid2"><div class="card"><h3 class="nb">Résultats par outil</h3>${bilanPie(tools.map(t => ({ l: t, v: byTool[t].length, c: tc[t] })))}</div>
      <div class="card"><h3 class="nb">Résultats par élève</h3>${perPupil.sort((a, b) => b.v - a.v).map(x => `<div class="hb"><span>${esc(x.n)}</span><div><i style="width:${Math.round(x.v / maxP * 100)}%"></i></div><b>${x.v}</b></div>`).join('')}</div></div>
      ${matrix}${blocks}${exHTML}</section>`;
  }).join('');
  const XT = opt.classes.map(c => bilanExtras(c, opt));
  const tot = all.length, byT = Object.fromEntries(toolList.map(t => [t, all.filter(r => tName(r) === t).length]));
  const sum = `<section class="page cover"><div class="band"><h1>📊 Bilan EPS</h1><p>${esc(DB.annee || '')} · édité le ${today}</p></div>
    <div class="chips"><div><b>${opt.classes.length}</b><span>classe${opt.classes.length > 1 ? 's' : ''}</span></div><div><b>${tot}</b><span>résultats d'outils</span></div><div><b>${toolList.length}</b><span>outils</span></div>${opt.coll ? `<div><b>${XT.reduce((a, x) => a + x.nColl, 0)}</b><span>événements collectifs</span></div>` : ''}${(opt.grilles || []).length ? `<div><b>${XT.reduce((a, x) => a + x.nGr, 0)}</b><span>évaluations (grilles)</span></div>` : ''}</div>
    <div class="grid2"><div class="card"><h3 class="nb">Résultats par classe</h3>${bilanPie(opt.classes.map((c, i) => ({ l: c, v: all.filter(r => r.classe === c).length, c: BIL_COLS[(i + 3) % BIL_COLS.length] })))}</div>
    <div class="card"><h3 class="nb">Résultats par outil</h3>${bilanPie(toolList.map(t => ({ l: t, v: byT[t], c: tc[t] })))}</div></div>
    <h3>Sommaire</h3><ul class="toc">${opt.classes.map(c => `<li><b>${esc(c)}</b> — ${all.filter(r => r.classe === c).length} résultat(s)</li>`).join('')}</ul></section>`;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bilan EPS ${esc(DB.annee || '')}</title><style>
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#0E1A33;background:#EEF1F7;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:1000px;margin:14px auto;background:#fff;padding:22px;border-radius:14px;box-shadow:0 2px 12px rgba(11,42,91,.1)}
.band{background:linear-gradient(120deg,#C9A227,#1E5BD8 60%,#0B2A5B);color:#fff;border-radius:12px;padding:22px 24px;margin-bottom:16px}.band h1{margin:0;font-size:1.9rem}.band p{margin:6px 0 0;opacity:.92}
h2{margin:0 0 12px;font-size:1.5rem;border-bottom:3px solid #C9A227;padding-bottom:6px;color:#0B2A5B}
h3{margin:20px 0 8px;font-size:1.05rem;border-bottom:2px solid #0B2A5B;padding-bottom:4px;display:flex;align-items:center;gap:8px}h3 small{font-weight:600;color:#667}h3.nb{border:0;margin:0 0 8px}.dot{width:12px;height:12px;border-radius:50%;display:inline-block}
.mut{color:#667}.chips{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px}.chips div{flex:1 1 120px;background:linear-gradient(135deg,#F7F1DC,#E4ECFB);border-radius:12px;padding:10px 12px;text-align:center}.chips b{display:block;font-size:1.6rem;color:#0B2A5B}.chips span{font-size:.78rem;color:#556}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}.card{border:1px solid #D9DFEB;border-radius:12px;padding:12px}
.pie{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.lg{flex:1;min-width:140px;font-size:.82rem}.lg div{display:flex;align-items:center;gap:6px;padding:2px 0}.lg i{width:12px;height:12px;border-radius:3px;flex:0 0 12px}.lg span{flex:1}
.hb{display:flex;align-items:center;gap:8px;font-size:.82rem;margin:3px 0}.hb span{width:34%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hb div{flex:1;background:#E4E9F3;border-radius:99px;height:10px;overflow:hidden}.hb i{display:block;height:100%;background:linear-gradient(90deg,#C9A227,#1E5BD8)}.hb b{width:24px;text-align:right}
.sc{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.84rem}th,td{border:1px solid #DDE3EE;padding:6px 8px;text-align:center}th{background:#0B2A5B;color:#fff}.mx th{color:#fff;font-size:.78rem}.l{text-align:left}.d{color:#445;font-size:.78rem}.none{color:#AAB;background:#FAFBFD}
td.bar{width:20%;padding:6px;text-align:left}td.bar i{display:block;height:10px;border-radius:99px}tr:nth-child(even) td:not([style]){background:#F8FAFD}
.toc{columns:2;line-height:1.8}
.ev{border:1px solid #D9DFEB;border-left:5px solid #C9A227;border-radius:10px;padding:10px 12px;margin:10px 0;break-inside:avoid}.evh{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.evh span{color:#667;font-size:.8rem}.lead{font-weight:700;font-size:.85rem;margin:4px 0}
.wg{border:1px solid #D9DFEB;border-radius:12px;padding:10px 12px;margin:10px 0;break-inside:avoid}.wgh{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:flex-start;margin-bottom:6px}.wgt{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.tm{font-weight:900;font-size:1.05rem;color:#0B2A5B}.tm.nt{color:#889;font-size:.85rem}.ec{color:#fff;font-weight:800;font-size:.78rem;border-radius:99px;padding:3px 10px}
table.wt th{font-size:.78rem}th.ex{font-weight:700;font-size:.74rem}table.wt td{font-size:.86rem}div.mb{height:5px;background:#E4E9F3;border-radius:9px;margin-top:3px;overflow:hidden}div.mb i{display:block;height:100%}tr.cum td{border-top:2px solid #0B2A5B}.vr{margin-top:8px;font-size:.82rem}.vr>div{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:3px 0;border-top:1px solid #EEF1F7}.vr>div>span:first-child{width:180px;font-weight:700}.chip2{display:inline-block;color:#fff;font-size:.72rem;font-weight:800;border-radius:99px;padding:2px 8px;margin:1px 2px 1px 0}
.fiche{max-width:820px}.fh{background:linear-gradient(120deg,#C9A227,#1E5BD8 60%,#0B2A5B);color:#fff;border-radius:12px;padding:14px 18px;margin-bottom:12px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center}.fh h2{font-size:1.6rem}.fbs{display:flex;gap:6px;flex-wrap:wrap}.fb{color:#fff;font-weight:800;font-size:.78rem;border-radius:99px;padding:4px 10px;border:2px solid rgba(255,255,255,.7)}
.fa{border:1px solid #D9DFEB;border-radius:12px;padding:10px 12px;margin:10px 0;break-inside:avoid}.fah{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px;font-size:1.05rem}.fn{color:#fff;font-weight:900;font-size:1.3rem;border-radius:10px;padding:2px 12px}.fn small{font-size:.7rem;opacity:.85}.fgoal{font-size:.8rem;font-weight:700;color:#445;margin:2px 0 6px}
.lvb{display:flex;gap:3px;justify-content:center}.lvb i{width:26px;height:9px;border-radius:5px;display:block}.lvt{font-size:.74rem;font-weight:800}.fsub{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.fsub span{border:2px solid;border-radius:99px;padding:2px 10px;font-size:.8rem;font-weight:700}.chip3{display:inline-block;background:#EEF1F7;border-radius:99px;padding:1px 8px;margin:1px;font-size:.76rem;color:#223}
.cl2 table{border-collapse:collapse;width:100%;font-size:.8rem}.cl2 th,.cl2 td{border:1px solid #DDE3EE;padding:4px 5px;text-align:center}.cl2 th{background:#0B2A5B;color:#fff}.cl2 .l{text-align:left}.cl2 th.v{height:120px;vertical-align:bottom;padding:4px 2px;background:#fff;color:#0E1A33;font-weight:700;font-size:.68rem;width:38px;max-width:38px}.cl2 th.v div{writing-mode:vertical-rl;transform:rotate(180deg);max-height:112px;overflow:hidden;margin:0 auto;line-height:1.1}
${window.fichesPieCSS || ''}
@media print{body{background:#fff}.page{box-shadow:none;border-radius:0;margin:0;padding:6mm;max-width:none;page-break-after:always;break-after:page}.page:last-child{page-break-after:auto;break-after:auto}.sc{overflow:visible}tr{break-inside:avoid}@page{size:A4 landscape;margin:8mm}}${opt.fiches ? '@page{size:A4 portrait;margin:8mm}' : ''}
</style></head><body>${opt.fiches ? bilanFiches(opt) : sum + clsSections}</body></html>`;
}

function openBilan() {
  const res = (DB.resultats || []).filter(r => r && r.classe && r.eleve);
  const gr = (DB.grilles || []).map((g, i) => ({ g, i })).filter(x => Object.values(x.g.evals || {}).some(E => Object.values(E || {}).some(e => e && Object.keys(e).length)));
  const hasColl = typeof epsCollClasses === 'function' ? epsCollClasses().some(c => epsCollectifs(c).some(e => e.rows && e.rows.length)) : false;
  if (!res.length && !gr.length && !hasColl) return toast('Aucun résultat enregistré pour l\'instant');
  const cl0 = new Set([...DB.classes.map(c => c.name), ...res.map(r => r.classe), ...(typeof epsCollClasses === 'function' ? epsCollClasses() : []), ...gr.flatMap(x => Object.keys(x.g.evals || {}))]);
  const classes = [...cl0].filter(c => c);
  const names = Object.fromEntries(TOOLS.map(t => [t.id, t.name])), tools = [...new Set(res.map(r => r.tool))].map(id => [id, names[id] || id]).sort((a, b) => a[1].localeCompare(b[1], 'fr'));
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.55);display:grid;place-items:center;padding:14px;overflow:auto';
  const chk = (k, v, l, n) => `<label style="display:flex;align-items:center;gap:8px;margin:6px 0;font-weight:700"><input type="checkbox" data-${k}="${esc(v)}" checked style="width:20px;height:20px;margin:0"> ${esc(l)}${n != null ? ` <small class="muted">(${n})</small>` : ''}</label>`;
  o.innerHTML = `<div class="card" style="max-width:420px;width:100%;max-height:92vh;overflow:auto"><h3 style="margin-top:0">📊 Exporter un bilan</h3>
    <p class="muted" style="font-size:.82rem;margin:0 0 8px">Un fichier en couleurs (camemberts, tableaux par classe et par outil) à ouvrir, imprimer ou envoyer sur ton ordinateur. Rien n'est conservé dans l'appli.</p>
    <b>Classes</b>${classes.map(c => chk('c', c, c, null)).join('')}
    <b style="display:block;margin-top:10px">🎯 Activité</b><select id="bil-act" style="margin-top:4px"><option value="">Toutes les activités</option>${(() => { const M = new Map(); classes.forEach(c => (window.fichesActs ? window.fichesActs(c) : []).forEach(a => { if (!M.has(a.id)) M.set(a.id, a); })); return [...M.values()].map(a => `<option value="${esc(a.id)}">${esc(a.icon + ' ' + a.label)}</option>`).join(''); })()}</select><div class="muted" style="font-size:.76rem;margin-top:3px">Choisis une seule activité (ex. Badminton) : le bilan ne contient que celle-ci (validation, tournois, camemberts).</div>
    ${tools.length ? `<b style="display:block;margin-top:10px">Résultats des outils</b>${tools.map(([id, n]) => chk('t', id, n, res.filter(r => r.tool === id).length)).join('')}` : ''}
    ${hasColl ? `<b style="display:block;margin-top:10px">Résultats collectifs</b>${chk('k', 'coll', 'Tournois, matchs, HYROX, C.O. par équipes, relais, cross…', null)}` : ''}
    ${gr.length ? `<b style="display:block;margin-top:10px">Grilles d'évaluation</b>${gr.map(x => chk('g', x.i, x.g.name, null)).join('')}` : ''}
    <b style="display:block;margin-top:10px">Fiches individuelles</b>${chk('f', 'fiches', '📄 Ajouter aussi une fiche par élève (objectifs, niveaux de maîtrise, notes, performances)', null).replace(' checked','')}
    <div class="row" style="margin-top:12px"><button class="btn btn-ghost" data-x>Annuler</button><button class="btn btn-grad" data-go>Créer le bilan</button></div>
    </div>`;
  document.body.appendChild(o);
  o.querySelector('[data-x]').onclick = () => o.remove();
  o.querySelector('[data-go]').onclick = async () => {
    const cs = [...o.querySelectorAll('[data-c]:checked')].map(x => x.dataset.c), ts = [...o.querySelectorAll('[data-t]:checked')].map(x => x.dataset.t), coll = !!o.querySelector('[data-k]:checked'), gs = [...o.querySelectorAll('[data-g]:checked')].map(x => +x.dataset.g);
    if (!cs.length || (!ts.length && !coll && !gs.length && !(o.querySelector('#bil-act') || {}).value)) return toast('Choisissez au moins une classe et un contenu');
    const fic = !!o.querySelector('[data-f]:checked'), opt0 = { classes: cs, tools: ts, coll, grilles: gs }, aid = (o.querySelector('#bil-act') || {}).value, A0 = aid && window.fichesActById ? window.fichesActById(aid) : null; if (A0) Object.assign(opt0, { act: A0, tools: A0.tools, coll: true, grilles: [] }); let html = bilanHTML(opt0); o.remove();
    const dd = new Date().toISOString().slice(0, 10); let name = 'bilan-eps-' + dd + '.html', blob = new Blob([html], { type: 'text/html' });
    const docs = fic ? [{ html, name, blob }, (() => { const h = window.fichesHTML ? window.fichesHTML(cs.map(c => ({ cls: c, names: window.fichesNames(c) })), { tools: ts, grilles: gs, coll, act: opt0.act }) : bilanHTML({ ...opt0, fiches: true }); return { html: h, name: 'fiches-eleves-' + dd + '.html', blob: new Blob([h], { type: 'text/html' }) }; })()] : null;
    const v = document.createElement('div'); v.style.cssText = 'position:fixed;inset:0;z-index:300;background:#333;display:flex;flex-direction:column';
    v.innerHTML = `<div style="display:flex;gap:8px;padding:10px;align-items:center;background:var(--grad,#0B2A5B);color:#fff;flex-wrap:wrap"><b style="flex:1">📊 Bilan</b>${fic ? '<button class="btn btn-white" data-d="0" style="outline:3px solid #C9A227">📊 Bilan</button><button class="btn btn-white" data-d="1">📄 Fiches élèves</button>' : ''}<button class="btn btn-white" data-s>📤 Enregistrer / envoyer</button><button class="btn btn-white" data-p>🖨 Imprimer / PDF</button><button class="btn btn-ghost" style="color:#fff" data-x>✕ Fermer</button></div><iframe title="Bilan" style="flex:1;border:0;background:#EEF1F7"></iframe>`;
    document.body.appendChild(v); v.querySelector('iframe').srcdoc = html; v.querySelector('[data-x]').onclick = () => v.remove();
    v.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { const d = docs[+b.dataset.d]; html = d.html; name = d.name; blob = d.blob; v.querySelector('iframe').srcdoc = html; v.querySelectorAll('[data-d]').forEach(x => x.style.outline = x === b ? '3px solid #C9A227' : ''); });
    v.querySelector('[data-s]').onclick = async () => {
      const f = new File([blob], name, { type: 'text/html' });
      try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'Bilan EPS' }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); toast('Bilan téléchargé ✔'); };
    v.querySelector('[data-p]').onclick = () => {   // impression dans la page (l'impression d'un cadre échoue sur Safari)
      const d = new DOMParser().parseFromString(html, 'text/html'); document.getElementById('bil-print')?.remove(); document.getElementById('bil-print-css')?.remove();
      const st = document.createElement('style'); st.id = 'bil-print-css'; st.media = 'print'; st.textContent = d.querySelector('style').textContent.replace('body{margin:0;', 'body.x{margin:0;') + '\nbody>*:not(#bil-print){display:none!important}#bil-print{display:block!important;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#0E1A33}html,body{background:#fff!important;height:auto!important;overflow:visible!important}';
      const box = document.createElement('div'); box.id = 'bil-print'; box.style.display = 'none'; box.innerHTML = d.body.innerHTML; document.head.appendChild(st); document.body.appendChild(box);
      const clean = () => { box.remove(); st.remove(); window.removeEventListener('afterprint', clean); }; window.addEventListener('afterprint', clean);
      setTimeout(() => { try { window.print(); } catch (e) { toast('Impression impossible'); } }, 200); };
  };
}
