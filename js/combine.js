/* =========================================================
   EPS ONE — Outil « Combiné athlétique »
   Duathlon (course + lancer) / Triathlon (course + saut + lancer)
   Individuel ou groupes · course à distance ou à durée · tours/plots ·
   conversions · essais de saut et de lancer · cumuls
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

TOOL_IMPL.combine = function (el) {
  const C0 = { format: 'duathlon', orga: 'indiv', cMode: 'distance', cDist: 800, cDur: 6, tour: 200, plotOn: true, plot: 20,
    lEssais: 3, lMesure: 'distance', lElan: 'sans', sEssais: 3, sElan: 'sans' };
  let tab = DB.combine.current ? 'saisie' : 'config', iv;
  const cfg = () => DB.combine.cfg = { ...C0, ...(DB.combine.cfg || {}) };
  function frame() {
    el.innerHTML = `<div class="co-tabs">${[['config', '⚙️ Épreuve'], ['saisie', '⏱ Saisie'], ['bilan', '📊 Bilan']].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div><div id="cb-body"></div>`;
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; frame(); });
    const box = el.querySelector('#cb-body');
    ({ config, saisie, bilan })[tab](box);
  }
  const hasSaut = c => c.format === 'triathlon';
  const courseDist = (c, r) => c.cMode === 'distance' ? c.cDist : r.tours * c.tour + (c.plotOn ? r.plots * c.plot : 0);
  const courseTime = (c, r) => c.cMode === 'duree' ? (courseDist(c, r) > 0 ? c.cDur * 60 : null) : (r.dep && r.arr ? (r.arr - r.dep) / 1000 : null);
  const vit = (d, t) => d && t ? d / t * 3.6 : 0;
  const essaisVals = arr => arr.map(x => parseFloat(String(x).replace(',', '.'))).filter(x => !isNaN(x) && x > 0);
  const resOf = (c, r) => { const d = courseDist(c, r), t = courseTime(c, r), L = essaisVals(r.lancers), S = essaisVals(r.sauts);
    return { d, t, v: t ? vit(d, t) : 0, lBest: L.length ? Math.max(...L) : 0, lSum: L.reduce((a, b) => a + b, 0), sBest: S.length ? Math.max(...S) : 0, sSum: S.reduce((a, b) => a + b, 0) }; };
  const lUnit = c => c.lMesure === 'distance' ? 'm' : c.lMesure === 'zones' ? 'zone' : 'pts';
  const resTxt = (c, e, gName) => { const r = resOf(c, e);
    return { valeur: c.cMode === 'distance' ? (r.t ? `${cmss(r.t)} au ${c.cDist} m (${n1(r.v)} km/h)` : 'course non terminée') : `${r.d} m en ${c.cDur} min (${n1(r.v)} km/h)`,
      detail: [hasSaut(c) ? 'Triathlon' : 'Duathlon', gName, hasSaut(c) ? `saut ${r.sBest ? n1(r.sBest) + ' m' : '–'}` : '', `lancer ${r.lBest ? n1(r.lBest) + ' ' + lUnit(c) : '–'}`].filter(Boolean).join(' · ') }; };
  // Affichage fusionné : les enregistrements des différentes tablettes (même jour, même classe, même épreuve) = UNE épreuve
  const sig = s => { const c = s.cfg; return [new Date(s.date).toDateString(), s.classe, c.format, c.orga, c.cMode, c.cMode === 'distance' ? c.cDist : c.cDur, c.tour, c.plotOn ? c.plot : 0, c.lEssais, c.lMesure, c.lElan, hasSaut(c) ? c.sEssais + c.sElan : ''].join('|'); };
  const merged = L => { const M = new Map();
    L.forEach(s => { const k = sig(s), m = M.get(k) || M.set(k, { date: s.date, classe: s.classe, cfg: s.cfg, recs: [], groups: [] }).get(k); m.recs.push(s); m.groups.push(...s.groups); m.date = Math.min(m.date, s.date); });
    return [...M.values()].map(m => (m.groups.sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true })), m)); };

  /* ---- Séance partagée avec les autres tablettes (modèle sans résultats) ---- */
  const blankE = (c, n) => ({ nom: n, dep: null, arr: null, tours: 0, plots: 0, sauts: Array(c.sEssais).fill(''), lancers: Array(c.lEssais).fill('') });
  const pub = (S, create) => { if (S.joined) return; const c = S.cfg;
    partPublish('combine', S.id, { nom: `${hasSaut(c) ? 'Triathlon' : 'Duathlon'} athlétique`, classe: S.classe, ng: S.groups.length, indiv: c.orga !== 'grp',
      ep: `course ${c.cMode === 'distance' ? c.cDist + ' m' : c.cDur + ' min'}${hasSaut(c) ? ` · saut ${c.sEssais} essais` : ''} · lancer ${c.lEssais} essais`,
      tpl: { classe: S.classe, cfg: c, groups: S.groups.map(g => ({ name: g.name, members: g.eleves.map(e => e.nom) })) } }, create); };
  const join = (box, p) => { const T = p.tpl, c = T.cfg;
    DB.combine.current = { id: p.id, date: Date.now(), classe: T.classe, cfg: JSON.parse(JSON.stringify(c)), start: null, joined: true,
      groups: T.groups.map(g => ({ name: g.name, eleves: g.members.map(n => blankE(c, n)) })) };
    save(); const S = DB.combine.current;
    partPickGroup(box, S.groups.map(g => ({ name: g.name, members: g.eleves.map(e => e.nom) })), i => { if (!DB.combine.current) { tab = 'config'; return frame(); } S.only = i; save(); tab = 'saisie'; frame(); }, c.orga !== 'grp'); };

  /* ================= 1. CONFIGURATION ================= */
  function config(box) {
    const c = cfg();
    box.innerHTML = `<div class="card"><h3>Format</h3><div class="seg"><button data-f="duathlon" class="${c.format === 'duathlon' ? 'on' : ''}">Duathlon<br><small style="font-weight:600;opacity:.85">course + lancer</small></button><button data-f="triathlon" class="${c.format === 'triathlon' ? 'on' : ''}">Triathlon<br><small style="font-weight:600;opacity:.85">course + saut + lancer</small></button></div>
        <label>Organisation</label><div class="seg"><button data-o="indiv" class="${c.orga === 'indiv' ? 'on' : ''}">Individuel</button><button data-o="grp" class="${c.orga === 'grp' ? 'on' : ''}">Groupes</button></div></div>
      <div class="card" style="margin-top:12px"><h3>🏃 Course (obligatoire)</h3>
        <div class="seg"><button data-cm="distance" class="${c.cMode === 'distance' ? 'on' : ''}">Distance imposée<br><small style="font-weight:600;opacity:.85">on mesure le temps</small></button><button data-cm="duree" class="${c.cMode === 'duree' ? 'on' : ''}">Durée imposée<br><small style="font-weight:600;opacity:.85">on compte tours et plots</small></button></div>
        ${c.cMode === 'distance' ? `<label>Distance (m)</label><input id="cd" type="number" value="${c.cDist}">` : `<label>Durée (min)</label><input id="cu" type="number" step="0.5" value="${c.cDur}">`}
        <label>Longueur du tour</label><div class="tog" id="tr">${[100, 200, 300, 400].map(v => `<button data-t="${v}" class="${c.tour === v ? 'on' : ''}">${v} m</button>`).join('')}</div>
        <label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="po" ${c.plotOn ? 'checked' : ''} style="width:auto"> Comptage des plots (fin de tour incomplet)</label>
        ${c.plotOn ? `<label>Distance entre 2 plots (m)</label><input id="pd" type="number" value="${c.plot}">` : ''}
        <p class="muted" style="margin:8px 0 0">Équivalence : ${c.cMode === 'distance' ? `${c.cDist} m = ${n1(c.cDist / c.tour)} tour(s) de ${c.tour} m${c.plotOn ? ` = ${Math.floor(c.cDist / c.tour)} tour(s) + ${Math.round((c.cDist % c.tour) / c.plot)} plot(s)` : ''}` : `1 tour = ${c.tour} m${c.plotOn ? ` = ${n1(c.tour / c.plot)} plots` : ''}`}</p></div>
      ${hasSaut(c) ? `<div class="card" style="margin-top:12px"><h3>🦘 Saut</h3><div class="row"><div><label>Nombre d'essais</label><select id="se">${Array.from({ length: 10 }, (_, i) => `<option ${c.sEssais === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></div>
          <div><label>Élan</label><select id="sl"><option value="sans" ${c.sElan === 'sans' ? 'selected' : ''}>Sans élan</option><option value="avec" ${c.sElan === 'avec' ? 'selected' : ''}>Avec élan</option></select></div></div><p class="muted" style="margin:6px 0 0">Mesure en mètres.</p></div>` : ''}
      <div class="card" style="margin-top:12px"><h3>🥏 Lancer</h3><div class="row"><div><label>Nombre d'essais</label><select id="le">${Array.from({ length: 10 }, (_, i) => `<option ${c.lEssais === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></div>
          <div><label>Élan</label><select id="ll"><option value="sans" ${c.lElan === 'sans' ? 'selected' : ''}>Sans élan</option><option value="avec" ${c.lElan === 'avec' ? 'selected' : ''}>Avec élan</option></select></div></div>
        <label>Mesure</label><div class="seg">${[['distance', 'Distance (m)'], ['zones', 'Zones'], ['points', 'Points']].map(([k, l]) => `<button data-lm="${k}" class="${c.lMesure === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <details class="card" style="margin-top:12px"><summary style="font-weight:800;cursor:pointer">🔁 Convertisseur distance ⇄ vitesse</summary>
        <div class="row"><div><label>Distance (m)</label><input id="xd" type="number"></div><div><label>Temps (min)</label><input id="xm" type="number" min="0"></div><div><label>(s)</label><input id="xs" type="number" min="0"></div><div><label>Vitesse (km/h)</label><input id="xv" type="number" step="0.1"></div></div>
        <p class="muted" style="margin:6px 0 0">Remplissez 2 des 3 valeurs (distance, temps, vitesse) : la 3e est calculée.</p><button class="btn btn-ghost btn-block" style="margin-top:8px" id="xgo">Calculer</button><div id="xr" style="margin-top:8px;font-weight:800;text-align:center"></div></details>
      <button class="btn btn-grad btn-block" style="margin-top:14px;padding:15px" id="go">▶ Préparer la saisie</button>`;
    const $ = s => box.querySelector(s), all = s => box.querySelectorAll(s);
    const read = () => { if ($('#cd')) c.cDist = +$('#cd').value || 0; if ($('#cu')) c.cDur = +$('#cu').value || 0; c.plotOn = $('#po').checked; if ($('#pd')) c.plot = +$('#pd').value || 1;
      if ($('#se')) c.sEssais = +$('#se').value; if ($('#sl')) c.sElan = $('#sl').value; c.lEssais = +$('#le').value; c.lElan = $('#ll').value; save(); };
    all('[data-f]').forEach(b => b.onclick = () => { read(); c.format = b.dataset.f; config(box); });
    all('[data-o]').forEach(b => b.onclick = () => { read(); c.orga = b.dataset.o; config(box); });
    all('[data-cm]').forEach(b => b.onclick = () => { read(); c.cMode = b.dataset.cm; config(box); });
    all('[data-t]').forEach(b => b.onclick = () => { read(); c.tour = +b.dataset.t; config(box); });
    all('[data-lm]').forEach(b => b.onclick = () => { read(); c.lMesure = b.dataset.lm; config(box); });
    $('#po').onchange = () => { read(); config(box); };
    ['#cd', '#cu', '#pd'].forEach(s => { if ($(s)) $(s).onchange = () => { read(); config(box); }; });
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
    const blank = n => ({ nom: n, dep: null, arr: null, tours: 0, plots: 0, sauts: Array(c.sEssais).fill(''), lancers: Array(c.lEssais).fill('') });
    const launch = (classe, groups) => { DB.combine.current = { id: Date.now().toString(36), date: Date.now(), classe, cfg: JSON.parse(JSON.stringify(c)), start: null,
      groups: groups.map(g => ({ name: g.name, eleves: g.members.map(blank) })) }; pub(DB.combine.current, true); save(); tab = 'saisie'; frame(); };
    if (c.orga === 'indiv') {
      box.innerHTML = `<div class="card"><label style="margin-top:0">Classe</label><select id="cl">${DB.classes.map(x => `<option ${x.name === (DB.lastClass || '') ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><button class="btn btn-grad btn-block" style="margin-top:12px" id="ok">▶ Commencer</button></div>`;
      box.querySelector('#ok').onclick = () => { const cl = box.querySelector('#cl').value; DB.lastClass = cl; launch(cl, studentsOf(cl).map(n => ({ name: n, members: [n] }))); };
    } else {
      box.innerHTML = `<div class="card"><label style="margin-top:0">Taille des groupes</label><div class="seg" id="sz">${[[2, 'Duos'], [3, 'Trios'], [4, 'Quatuors']].map(([n, l]) => `<button data-n="${n}">${l}</button>`).join('')}</div><div id="cmp" style="margin-top:6px"></div></div>`;
      mountComposer(box.querySelector('#cmp'), { id: 'cbc', modes: ['random', 'hetero', 'homo'], button: '▶ Former les groupes et commencer',
        onTeams: teams => launch(box.querySelector('#cbc-cls')?.value || '', teams.map(t => ({ name: t.name.replace('Équipe', 'Groupe'), members: t.members.map(m => m.n) }))) });
      const setSize = n => { box.querySelector('#cbc-k').value = 's'; box.querySelector('#cbc-v').value = n; box.querySelectorAll('#sz [data-n]').forEach(b => b.classList.toggle('on', +b.dataset.n === n)); };
      box.querySelectorAll('#sz [data-n]').forEach(b => b.onclick = () => setSize(+b.dataset.n)); setSize(2);
    }
  }

  /* ================= 2. SAISIE ================= */
  function saisie(box) {
    const S = DB.combine.current;
    if (!S) { box.innerHTML = '<div class="card empty">Aucune saisie en cours. Réglez l\'épreuve dans ⚙️ Épreuve puis « Préparer la saisie ».</div>'; partMount(box, 'combine', p => join(box, p)); return; }
    const c = S.cfg, grp = c.orga === 'grp', dist = c.cMode === 'distance';
    const hasData = e => !!(e.dep || e.tours || e.plots || essaisVals(e.sauts).length || essaisVals(e.lancers).length);
    // Chrono propre au groupe : départ du groupe (ou 1er départ) · compte à rebours en durée imposée
    const gStart = g => g.start || (dist ? g.eleves.map(e => e.dep).filter(Boolean).sort((a, b) => a - b)[0] : S.start) || null;
    const gClock = (g, now = Date.now()) => { const st = gStart(g);
      if (!dist) { const left = st ? c.cDur * 60 - (now - st) / 1000 : c.cDur * 60; return { txt: left > 0 ? cmss(left + .99) : 'STOP', end: left <= 0 }; }
      const fin = g.eleves.length && g.eleves.every(e => e.arr);
      return { txt: !st ? '0:00' : cmss(((fin ? Math.max(...g.eleves.map(e => e.arr)) : now) - st) / 1000), end: fin }; };
    const saveSeance = () => {
      // seuls les groupes / élèves ayant des résultats sont enregistrés (une tablette par groupe → pas de lignes vides)
      const done = S.groups.filter(g => g.eleves.some(hasData)); if (!done.length) return toast(grp ? 'Aucun groupe n\'a de résultat' : 'Aucun résultat saisi');
      if (S.only != null && dist && done.some(g => g.eleves.some(e => e.dep && !e.arr)) && !confirm('Tout le monde n\'est pas arrivé. Enregistrer quand même ?')) return;
      const rec = { ...S, id: S.id + '-' + Math.random().toString(36).slice(2, 6), groups: done }; delete rec.only; delete rec.joined;   // id unique par tablette (fusion de synchro par id)
      DB.combine.seances.push(rec); DB.combine.current = null;
      // synthèse « Résultats des élèves » : une ligne par élève ayant des résultats
      done.forEach(g => g.eleves.filter(hasData).forEach(e => saveResult({ tool: 'combine', label: 'Combiné athlétique', classe: S.classe, eleve: e.nom, ...resTxt(c, e, grp ? g.name : '') })));
      save(); clearInterval(iv); toast('Épreuve enregistrée ✔'); tab = 'bilan'; frame(); };
    // Vue « un seul groupe » : ce que voient les élèves sur leur tablette
    const drawGroup = () => {
      const gi = S.only, g = S.groups[gi], st = gStart(g), ck = gClock(g), on = !!st;
      box.innerHTML = `<div class="card" style="text-align:center"><div style="font-weight:900;font-size:1.3rem">${esc(g.name)}</div>${grp ? `<div class="muted">${g.eleves.map(e => esc(e.nom)).join(', ')}</div>` : ''}
          <div class="gv-clock" id="gvclk" style="color:${ck.end ? (dist ? '#1B9E5A' : 'var(--danger)') : 'inherit'}">${ck.txt}</div>
          <div class="muted" style="font-size:.85rem">${hasSaut(c) ? 'Triathlon' : 'Duathlon'} · course ${dist ? c.cDist + ' m' : c.cDur + ' min'} · tour ${c.tour} m${c.plotOn ? ` · plots ${c.plot} m` : ''}</div>
          ${!on ? `<button class="btn btn-grad btn-block gv-big" id="gv-go">▶ Départ ${grp ? 'du groupe' : ''}</button>` : ''}</div>
        ${g.eleves.map((e, ei) => { const r = resOf(c, e), k = `${gi}|${ei}`;
          return `<div class="card" style="margin-top:10px${dist && e.arr ? ';border:2px solid #1B9E5A' : ''}"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:1.2rem">${grp ? esc(e.nom) : '🏃 Course'}</b><span style="font-size:1.5rem;font-weight:900;font-variant-numeric:tabular-nums" data-live="${k}">${dist ? (r.t ? cmss(r.t) : e.dep ? '…' : '') : r.d + ' m'}</span></div>
            ${dist
              ? (e.dep && !e.arr ? `<button class="btn btn-danger btn-block gv-big" data-fin="${k}">🏁 Arrivée ${grp ? 'de ' + esc(e.nom) : ''}</button>`
                : e.arr ? `<div style="margin-top:8px;font-weight:800">✅ Course terminée · ${n1(r.v)} km/h <button class="link" data-undo="${k}">↺ annuler</button></div>` : '<div class="muted" style="margin-top:6px">En attente du départ</div>')
              : `<div class="gv-cnt"><span class="l">🏃 Tours</span><button class="btn btn-ghost" data-dec="${k}|tours" ${on ? '' : 'disabled'}>−</button><b>${e.tours}</b><button class="btn btn-grad" data-inc="${k}|tours" ${on ? '' : 'disabled'}>+1</button></div>
                ${c.plotOn ? `<div class="gv-cnt"><span class="l">🔶 Plots</span><button class="btn btn-ghost" data-dec="${k}|plots" ${on ? '' : 'disabled'}>−</button><b>${e.plots}</b><button class="btn btn-ghost" data-inc="${k}|plots" ${on ? '' : 'disabled'}>+</button></div>` : ''}
                <div class="muted" style="font-size:.85rem;text-align:right">${r.d} m · ${n1(r.v)} km/h</div>`}
            ${hasSaut(c) ? `<div style="margin-top:12px;font-weight:800">🦘 Sauts (m)</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">${e.sauts.map((v, i) => `<input class="gv-in" inputmode="decimal" data-sa="${k}|${i}" value="${esc(v)}" placeholder="${i + 1}">`).join('')}</div><div class="muted" style="font-size:.85rem">meilleur <b>${r.sBest ? n1(r.sBest) : '–'}</b> · cumul ${r.sSum ? n1(r.sSum) : '–'}</div>` : ''}
            <div style="margin-top:12px;font-weight:800">🥏 Lancers (${lUnit(c)})</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">${e.lancers.map((v, i) => `<input class="gv-in" inputmode="decimal" data-la="${k}|${i}" value="${esc(v)}" placeholder="${i + 1}">`).join('')}</div><div class="muted" style="font-size:.85rem">meilleur <b>${r.lBest ? n1(r.lBest) : '–'}</b> · cumul ${r.lSum ? n1(r.lSum) : '–'}</div></div>`; }).join('')}
        ${g.eleves.some(hasData) ? `<button class="btn btn-grad btn-block" style="margin-top:12px" id="save">💾 Enregistrer ${grp ? 'les résultats du groupe' : 'mon résultat'}</button>` : ''}
        <div style="text-align:center;margin:18px 0 6px"><button class="link" id="gv-prof">🔒 Mode enseignant</button></div>`;
      bind();
      const $ = s => box.querySelector(s);
      if ($('#gv-go')) $('#gv-go').onclick = () => { const t = Date.now(); g.start = t; S.start = S.start || t; if (dist) g.eleves.forEach(e => { if (!e.dep) e.dep = t; }); beep(1300, .45); save(); drawGroup(); };
      $('#gv-prof').onclick = () => { if (!confirm('Passer en mode enseignant (tous les groupes, réglages) ?')) return; S.only = null; save(); draw(); };
    };
    // actions communes aux deux vues (départ / arrivée / tours / essais…)
    const bind = () => {
      const $ = s => box.querySelector(s), all = s => box.querySelectorAll(s), keep = () => save(), redraw = () => (S.only != null && S.groups[S.only] ? drawGroup() : draw());
      const E = k => { const [gi, ei] = k.split('|').map(Number); return S.groups[gi].eleves[ei]; };
      all('[data-go]').forEach(b => b.onclick = () => { E(b.dataset.go).dep = Date.now(); S.start = S.start || Date.now(); beep(1300, .3); keep(); redraw(); });
      all('[data-fin]').forEach(b => b.onclick = () => { E(b.dataset.fin).arr = Date.now(); beep(1000, .3); keep(); redraw(); });
      all('[data-undo]').forEach(b => b.onclick = () => { E(b.dataset.undo).arr = null; keep(); redraw(); });
      const step = (s, d) => { const [gi, ei, f] = s.split('|'); const e = S.groups[+gi].eleves[+ei]; e[f] = Math.max(0, e[f] + d); if (d > 0) beep(f === 'tours' ? 1100 : 800, .05); keep(); redraw(); };
      all('[data-inc]').forEach(b => b.onclick = () => step(b.dataset.inc, 1));
      all('[data-dec]').forEach(b => b.onclick = () => step(b.dataset.dec, -1));
      all('[data-sa]').forEach(i => i.onchange = () => { const [gi, ei, n] = i.dataset.sa.split('|').map(Number); S.groups[gi].eleves[ei].sauts[n] = i.value.trim(); keep(); redraw(); });
      all('[data-la]').forEach(i => i.onchange = () => { const [gi, ei, n] = i.dataset.la.split('|').map(Number); S.groups[gi].eleves[ei].lancers[n] = i.value.trim(); keep(); redraw(); });
      if ($('#save')) $('#save').onclick = saveSeance;
    };
    const draw = () => {
      if (S.only != null && S.groups[S.only]) return drawGroup();
      box.innerHTML = `<div class="card"><b>${c.format === 'triathlon' ? 'Triathlon' : 'Duathlon'} athlétique</b><div class="muted">${esc(S.classe)} · course ${c.cMode === 'distance' ? c.cDist + ' m' : c.cDur + ' min'} · tour ${c.tour} m${c.plotOn ? ` · plots ${c.plot} m` : ''}${hasSaut(c) ? ` · saut ${c.sElan} élan (${c.sEssais} essais)` : ''} · lancer ${c.lElan} élan (${c.lEssais} essais, ${lUnit(c)})</div>
          <div class="big clock" id="gclk" style="font-size:clamp(2.2rem,11vw,3.6rem);padding:4px 0">${c.cMode === 'duree' ? cmss(c.cDur * 60) : '0:00'}</div>
          <div class="row"><button class="btn btn-grad" id="all">🚩 Départ course</button>${S.start ? '<button class="btn btn-ghost" id="rz">↺ Chrono</button>' : ''}</div><button class="btn btn-ghost btn-block" style="margin-top:8px" id="edg">✏️ Modifier les groupes / participants (absent, blessé…)</button>
          ${S.groups.length > 1 ? `<label>📱 Tablette ${grp ? 'd\'un groupe (les élèves ne verront que leur groupe)' : 'd\'un élève (il ne verra que sa fiche)'}</label><select id="only"><option value="">${grp ? 'Tous les groupes' : 'Tous les élèves'}</option>${S.groups.map((g, i) => `<option value="${i}">${esc(g.name)}</option>`).join('')}</select>` : ''}</div>
        ${S.groups.map((g, gi) => { const R = g.eleves.map(e => resOf(c, e));
          const T = { d: R.reduce((a, r) => a + r.d, 0), t: R.reduce((a, r) => a + (r.t || 0), 0), l: R.reduce((a, r) => a + r.lBest, 0), s: R.reduce((a, r) => a + r.sBest, 0) };
          return `<div class="run">${grp ? `<div class="run-h"><b>${esc(g.name)}</b></div>` : ''}
            ${g.eleves.map((e, ei) => { const r = R[ei], k = `${gi}|${ei}`;
              return `<div style="${grp ? 'border-top:1px solid var(--line);padding-top:8px;margin-top:8px' : ''}"><div class="run-h"><b>${esc(e.nom)}</b><span class="run-t" style="font-size:1.2rem" data-live="${k}">${c.cMode === 'distance' ? (r.t ? cmss(r.t) : e.dep ? '…' : '') : r.d + ' m'}</span></div>
                ${c.cMode === 'distance'
                  ? `<div class="row" style="margin-top:6px">${e.dep ? '' : `<button class="btn btn-grad" data-go="${k}">▶ Départ</button>`}${e.dep && !e.arr ? `<button class="btn btn-danger" data-fin="${k}">🏁 Arrivée</button>` : ''}${e.arr ? `<button class="btn btn-ghost" data-undo="${k}">↺</button><span class="muted" style="align-self:center">${n1(r.v)} km/h</span>` : ''}</div>`
                  : `<div class="row" style="margin-top:6px;align-items:center;gap:6px;flex-wrap:nowrap"><span style="flex:0 0 auto;font-weight:700;font-size:.8rem">Tours</span><button class="btn btn-ghost" style="flex:0 0 42px;padding:8px" data-dec="${k}|tours">−</button><b style="flex:0 0 26px;text-align:center">${e.tours}</b><button class="btn btn-grad" style="flex:0 0 52px;padding:8px" data-inc="${k}|tours">+1</button>
                      ${c.plotOn ? `<span style="flex:0 0 auto;font-weight:700;font-size:.8rem">Plots</span><button class="btn btn-ghost" style="flex:0 0 36px;padding:8px 4px" data-dec="${k}|plots">−</button><b style="flex:0 0 22px;text-align:center">${e.plots}</b><button class="btn btn-ghost" style="flex:0 0 36px;padding:8px 4px" data-inc="${k}|plots">+</button>` : ''}</div>
                    <div class="muted" style="font-size:.8rem">${r.d} m · ${n1(r.v)} km/h</div>`}
                ${hasSaut(c) ? `<div style="margin-top:6px;font-size:.85rem"><b>Sauts (m)</b> ${e.sauts.map((v, i) => `<input style="width:58px;padding:6px;text-align:center" inputmode="decimal" data-sa="${k}|${i}" value="${esc(v)}" placeholder="${i + 1}">`).join(' ')} <span class="muted">meilleur <b>${r.sBest ? n1(r.sBest) : '–'}</b> · cumul ${r.sSum ? n1(r.sSum) : '–'}</span></div>` : ''}
                <div style="margin-top:6px;font-size:.85rem"><b>Lancers (${lUnit(c)})</b> ${e.lancers.map((v, i) => `<input style="width:58px;padding:6px;text-align:center" inputmode="decimal" data-la="${k}|${i}" value="${esc(v)}" placeholder="${i + 1}">`).join(' ')} <span class="muted">meilleur <b>${r.lBest ? n1(r.lBest) : '–'}</b> · cumul ${r.lSum ? n1(r.lSum) : '–'}</span></div></div>`; }).join('')}
            ${grp ? `<div class="muted" style="margin-top:8px;font-size:.82rem;border-top:1px solid var(--line);padding-top:6px"><b style="color:var(--text)">Total groupe</b> · course ${T.d} m${c.cMode === 'distance' ? ` en ${cmss(T.t)}` : ''}${hasSaut(c) ? ` · sauts ${n1(T.s)} m` : ''} · lancers ${n1(T.l)} ${lUnit(c)} (meilleurs essais)</div>` : ''}</div>`; }).join('')}
        <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="save">💾 Terminer et enregistrer</button><button class="btn btn-ghost" id="cancel">Abandonner</button></div>`;
      const $ = s => box.querySelector(s), keep = () => save();
      $('#all').onclick = () => { const t = Date.now(); S.start = S.start || t; if (c.cMode === 'distance') S.groups.forEach(g => g.eleves.forEach(e => { if (!e.dep) e.dep = t; })); beep(1300, .45); keep(); draw(); };
      $('#edg').onclick = () => { const indiv = c.orga !== 'grp', blank = n => ({ nom: n, dep: null, arr: null, tours: 0, plots: 0, sauts: Array(c.sEssais).fill(''), lancers: Array(c.lEssais).fill('') });
        editGroupsPanel(indiv ? 'Participants' : 'Groupes', { cls: S.classe, indiv, list: () => S.groups, names: g => g.eleves.map(e => e.nom),
          take: (g, n) => g.eleves.splice(g.eleves.findIndex(e => e.nom === n), 1)[0],
          put: (g, n, d) => g.eleves.push(d || blank(n)), make: name => ({ name, eleves: [] }), onChange: () => { keep(); pub(S); }, onClose: draw }); };
      if ($('#rz')) $('#rz').onclick = () => { if (confirm('Remettre le chrono de course à zéro ?')) { S.start = null; keep(); draw(); } };
      if ($('#only')) $('#only').onchange = ev => { S.only = ev.target.value === '' ? null : +ev.target.value; keep(); draw(); };
      bind();
      $('#cancel').onclick = () => { if (confirm('Abandonner cette saisie ?')) { partAskRemove(S); DB.combine.current = null; save(); clearInterval(iv); tab = 'config'; frame(); } };
    };
    const tick = () => { if (!box.isConnected || !DB.combine.current) return clearInterval(iv);
      const g = box.querySelector('#gclk'), now = Date.now(), gv = box.querySelector('#gvclk');
      if (gv && S.only != null && S.groups[S.only]) { const G = S.groups[S.only], ck = gClock(G, now); gv.textContent = ck.txt;
        if (!dist && ck.end && gStart(G) && !G.stopBeep) { G.stopBeep = true; [0, 350, 700].forEach(d => setTimeout(() => beep(700, .5), d)); save(); drawGroup(); return; } }
      if (g) { if (c.cMode === 'duree') { const left = S.start ? c.cDur * 60 - (now - S.start) / 1000 : c.cDur * 60; g.textContent = left > 0 ? cmss(left + .99) : 'STOP';
          if (S.start && left <= 0 && !S.stopBeep) { S.stopBeep = true; [0, 350, 700].forEach(d => setTimeout(() => beep(700, .5), d)); save(); } }
        else g.textContent = S.start ? cmss((now - S.start) / 1000) : '0:00'; }
      if (c.cMode === 'distance') S.groups.forEach((gr, gi) => gr.eleves.forEach((e, ei) => { const l = box.querySelector(`[data-live="${gi}|${ei}"]`); if (l && e.dep && !e.arr) l.textContent = cmss((now - e.dep) / 1000); }));
    };
    draw(); clearInterval(window._cbTick); iv = window._cbTick = setInterval(tick, 500); tick();
  }

  /* ================= 3. BILAN (cumuls) ================= */
  function bilan(box) {
    const L = DB.combine.seances;
    if (!L.length) { box.innerHTML = '<div class="card empty">Aucune épreuve enregistrée pour l\'instant.</div>'; return; }
    const classes = [...new Set(L.map(s => s.classe))]; let cls = classes.includes(DB.lastClass) ? DB.lastClass : classes[0];
    const draw = () => {
      const ss = L.filter(s => s.classe === cls), M = merged(ss), A = {};
      ss.forEach(s => s.groups.forEach(g => g.eleves.forEach(e => { const r = resOf(s.cfg, e), a = A[e.nom] = A[e.nom] || { n: 0, d: 0, t: 0, s: 0, sb: 0, l: 0, lb: 0 };
        a.n++; a.d += r.d; a.t += r.t || 0; a.s += r.sSum; a.sb = Math.max(a.sb, r.sBest); a.l += r.lSum; a.lb = Math.max(a.lb, r.lBest); })));
      box.innerHTML = `<div class="card"><label style="margin-top:0">Classe</label><select id="bc">${classes.map(x => `<option ${x === cls ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
        <div class="section-title"><h2>Cumuls par élève (${M.length} épreuve${M.length > 1 ? 's' : ''})</h2><button class="link" id="exp">Exporter CSV</button></div>
        <div class="card sheet-table"><table><tr><th>Élève</th><th>Épreuves</th><th>Course : distance</th><th>Course : temps</th><th>Vitesse moy.</th><th>Sauts : cumul</th><th>Meilleur saut</th><th>Lancers : cumul</th><th>Meilleur lancer</th></tr>
          ${Object.entries(A).sort((a, b) => a[0].localeCompare(b[0])).map(([n, a]) => `<tr><td><b>${esc(n)}</b></td><td>${a.n}</td><td>${a.d ? a.d + ' m' : '–'}</td><td>${cmss(a.t)}</td><td>${a.t && a.d ? n1(vit(a.d, a.t)) + ' km/h' : '–'}</td><td>${a.s ? n1(a.s) + ' m' : '–'}</td><td>${a.sb ? n1(a.sb) + ' m' : '–'}</td><td>${a.l ? n1(a.l) : '–'}</td><td>${a.lb ? n1(a.lb) : '–'}</td></tr>`).join('')}</table></div>
        <div class="section-title"><h2>Épreuves</h2></div>
        <div class="card" style="padding:0">${M.slice().reverse().map(m => { const c = m.cfg, grp = c.orga === 'grp', dist = c.cMode === 'distance', i = M.indexOf(m);
          const R = m.groups.flatMap(g => g.eleves.map(e => ({ g, e, r: resOf(c, e) }))).sort((a, b) => (dist ? (a.r.t || 1e9) - (b.r.t || 1e9) : b.r.d - a.r.d) || (b.r.lBest - a.r.lBest));
          return `<div class="list-item" style="flex-wrap:wrap"><div style="flex:1"><b>${new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} · ${esc(m.classe)} · ${m.groups.length} ${grp ? 'groupe' : 'élève'}${m.groups.length > 1 ? 's' : ''}${m.recs.length > 1 ? ` (${m.recs.length} tablettes)` : ''}</b><div class="muted">${hasSaut(c) ? 'Triathlon' : 'Duathlon'} · ${dist ? c.cDist + ' m' : c.cDur + ' min'}</div></div><button class="btn btn-ghost" data-x="${i}">🗑</button>
            <details style="flex-basis:100%;margin-top:6px"><summary class="muted" style="cursor:pointer">Classement (${R.length} élève${R.length > 1 ? 's' : ''})</summary><div class="sheet-table" style="margin-top:6px"><table><tr><th>#</th><th>Élève</th>${grp ? '<th>Groupe</th>' : ''}<th>Course</th><th>Vitesse</th>${hasSaut(c) ? '<th>Meilleur saut</th>' : ''}<th>Meilleur lancer</th></tr>
              ${R.map(({ g, e, r }, k) => `<tr><td>${k + 1}</td><td><b>${esc(e.nom)}</b></td>${grp ? `<td>${esc(g.name)}</td>` : ''}<td>${dist ? cmss(r.t) : r.d + ' m'}</td><td>${r.v ? n1(r.v) + ' km/h' : '–'}</td>${hasSaut(c) ? `<td>${r.sBest ? n1(r.sBest) + ' m' : '–'}</td>` : ''}<td>${r.lBest ? n1(r.lBest) + ' ' + lUnit(c) : '–'}</td></tr>`).join('')}</table></div></details></div>`; }).join('')}</div>`;
      const $ = s => box.querySelector(s);
      $('#bc').onchange = () => { cls = $('#bc').value; draw(); };
      box.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { const m = M[+b.dataset.x];
        if (confirm(`Supprimer cette épreuve${m.recs.length > 1 ? ` (${m.recs.length} enregistrements de tablettes)` : ''} ?`)) { m.recs.forEach(r => { const k = L.indexOf(r); if (k >= 0) L.splice(k, 1); }); save(); bilan(box); } });
      $('#exp').onclick = () => download(`combine-athletique-${cls}.csv`, csv([['Date', 'Format', 'Groupe', 'Élève', 'Course (m)', 'Temps course', 'Vitesse (km/h)', 'Tours', 'Plots', 'Sauts', 'Meilleur saut', 'Cumul sauts', 'Lancers', 'Meilleur lancer', 'Cumul lancers'],
        ...ss.flatMap(s => s.groups.flatMap(g => g.eleves.map(e => { const r = resOf(s.cfg, e);
          return [new Date(s.date).toLocaleDateString('fr-FR'), s.cfg.format, s.cfg.orga === 'grp' ? g.name : '', e.nom, r.d, cmss(r.t), r.v ? n1(r.v) : '', e.tours, e.plots, e.sauts.join(' / '), r.sBest ? n1(r.sBest) : '', r.sSum ? n1(r.sSum) : '', e.lancers.join(' / '), r.lBest ? n1(r.lBest) : '', r.lSum ? n1(r.lSum) : '']; })))]));
    };
    draw();
  }

  frame();
  return () => clearInterval(window._cbTick);
};
