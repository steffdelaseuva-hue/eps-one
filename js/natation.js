/* =========================================================
   EPS ONE — Outil « Natation »
   Distance nagée · temps de nage · nombre de coups de bras
   ========================================================= */
DB.natation = DB.natation || [];
ICONS.natation = '<path d="M2 17c2 0 2-1.5 4-1.5S8 17 10 17s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 21c2 0 2-1.5 4-1.5S8 21 10 21s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><circle cx="16" cy="6" r="2"/><path d="M4 12.5 9 8l3 3 3-2"/>';

/* Indice de nage (sur 25 m) = temps en secondes + nombre de coups de bras (plus il est bas, mieux c'est) */
const natIndice = (d, t, c) => d === 25 && t && c ? Math.round((t + c) * 10) / 10 : null;
const natI = v => v == null ? '–' : String(v).replace('.', ',');

function natationVite(el) {
  let t0 = null, acc = 0, run = false, iv = null, coups = 0;
  const secOf = () => acc + (run ? (performance.now() - t0) / 1000 : 0);
  const calc = (d, t, c) => ({
    v: d && t ? d / t : 0,
    t100: d && t ? t / d * 100 : 0,
    amp: d && c ? d / c : 0,            // distance par coup de bras
    freq: t && c ? c / t * 60 : 0,       // coups de bras par minute
  });
  const n2 = x => x ? x.toFixed(2).replace('.', ',') : '–';
  const draw = () => {
    el.innerHTML = `<div class="card">
        <div class="row">${DB.classes.length ? `<div><label>Classe</label><select id="cl"><option value="">—</option>${DB.classes.map(c => `<option ${c.name === DB.lastClass ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>` : ''}<div><label>Élève</label><div id="elw"></div></div></div>
        <label>Distance nagée (m)</label><div class="row"><input id="d" type="number" value="25">${[25, 50, 100, 200].map(v => `<button class="btn btn-ghost" style="flex:0 0 auto;padding:10px" data-d="${v}">${v}</button>`).join('')}</div>
        <label>Temps de nage</label>
        <div class="big clock" id="tm" style="font-size:clamp(2.6rem,13vw,4.5rem);padding:4px 0">00:00,00</div>
        <div class="row"><button class="btn btn-grad" id="go">▶ Départ</button><button class="btn btn-ghost" id="rz">↺</button></div>
        <div class="row" style="margin-top:8px"><div><label>ou saisie : min</label><input id="mm" type="number" min="0" placeholder="0"></div><div><label>s</label><input id="ss" type="number" min="0" step="0.01" placeholder="0"></div></div>
        <label>Nombre de coups de bras</label>
        <div class="row" style="align-items:center"><button class="btn btn-ghost" style="flex:0 0 60px;font-size:1.3rem" id="cm">−</button><input id="c" type="number" min="0" value="0" style="text-align:center;font-size:1.4rem;font-weight:900"><button class="btn btn-grad" style="flex:1.4;font-size:1.1rem;padding:14px" id="cp">＋1 coup de bras</button></div>
        <div class="result" id="res"></div>
        <button class="btn btn-grad btn-block" style="margin-top:12px" id="sv">💾 Enregistrer</button></div>
      <div class="section-title"><h2>Résultats</h2><button class="link" id="exp">Exporter CSV</button></div>
      <select id="fl"></select><div class="card sheet-table" style="margin-top:10px" id="ls"></div>`;
    const $ = s => el.querySelector(s);
    const time = () => run || acc ? secOf() : (+$('#mm').value || 0) * 60 + (+String($('#ss').value).replace(',', '.') || 0);
    const res = () => { const d = +$('#d').value || 0, t = time(), c = +$('#c').value || 0, x = calc(d, t, c);
      $('#res').innerHTML = `<div class="card"><b>${n2(x.v)}</b><small>m/s</small></div><div class="card"><b>${x.t100 ? fmt(x.t100 * 1000) : '–'}</b><small>au 100 m</small></div>
        <div class="card"><b>${n2(x.amp)}</b><small>m par coup de bras</small></div><div class="card"><b>${x.freq ? Math.round(x.freq) : '–'}</b><small>coups de bras / min</small></div>
        <div class="card" style="grid-column:1/-1"><b>${natI(natIndice(d, t, c))}</b><small>indice de nage sur 25 m (temps en s + coups de bras)${d !== 25 ? ' — distance 25 m uniquement' : ''}</small></div>`; };
    const fillNames = () => { const c = $('#cl')?.value;
      $('#elw').innerHTML = c ? `<select id="el">${studentsOf(c).map(n => `<option>${esc(n)}</option>`).join('')}</select>` : '<input id="el" placeholder="Nom de l\'élève">'; };
    if ($('#cl')) $('#cl').onchange = () => { DB.lastClass = $('#cl').value || DB.lastClass; save(); fillNames(); }; fillNames();
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { $('#d').value = b.dataset.d; res(); });
    ['#d', '#mm', '#ss', '#c'].forEach(s => $(s).oninput = res);
    $('#go').onclick = () => { if (run) { acc = secOf(); run = false; $('#go').textContent = '▶ Reprendre'; beep(900, .2); }
      else { t0 = performance.now(); run = true; $('#go').textContent = '⏹ Arrivée'; beep(1300, .3); } res(); };
    $('#rz').onclick = () => { run = false; acc = 0; $('#go').textContent = '▶ Départ'; $('#tm').textContent = '00:00,00'; res(); };
    $('#cp').onclick = () => { $('#c').value = (+$('#c').value || 0) + 1; beep(1100, .03, .15); res(); };
    $('#cm').onclick = () => { $('#c').value = Math.max(0, (+$('#c').value || 0) - 1); res(); };
    $('#sv').onclick = () => { const eleve = $('#el').value.trim(), d = +$('#d').value || 0, t = time(), c = +$('#c').value || 0;
      if (!eleve) return toast('Nom de l\'élève requis'); if (!d || !t) return toast('Distance et temps requis');
      DB.natation.push({ date: Date.now(), classe: $('#cl')?.value || '', eleve, d, t: Math.round(t * 100) / 100, c }); save(); toast(`${eleve} : enregistré ✔`);
      run = false; acc = 0; { const e = $('#el'); if (e.tagName === 'SELECT') { if (e.selectedIndex < e.options.length - 1) e.selectedIndex++; } else e.value = ''; } $('#c').value = 0; $('#mm').value = ''; $('#ss').value = ''; $('#go').textContent = '▶ Départ'; $('#tm').textContent = '00:00,00'; res(); list(); };
    const list = () => {
      const own = r => !(window.eleveMode && eleveMode()) || r.classe === ($('#cl')?.value || '');   // mode élève : seulement la classe en cours
      const cur = $('#fl').value, names = [...new Set(DB.natation.filter(own).map(r => r.eleve))].sort();
      $('#fl').innerHTML = '<option value="">Tous les élèves</option>' + names.map(n => `<option ${n === cur ? 'selected' : ''}>${esc(n)}</option>`).join('');
      const rows = DB.natation.map((r, i) => ({ ...r, i })).filter(r => own(r) && (!$('#fl').value || r.eleve === $('#fl').value)).reverse();
      $('#ls').innerHTML = rows.length ? `<table><tr><th>Élève</th><th>Date</th><th>Dist.</th><th>Temps</th><th>Coups</th><th>m/s</th><th>m/coup</th><th>coups/min</th><th>Indice 25 m</th><th></th></tr>
        ${rows.map(r => { const x = calc(r.d, r.t, r.c); return `<tr><td><b>${esc(r.eleve)}</b></td><td>${new Date(r.date).toLocaleDateString('fr-FR')}</td><td>${r.d} m</td><td>${fmt(r.t * 1000)}</td><td>${r.c || '–'}</td><td>${n2(x.v)}</td><td>${n2(x.amp)}</td><td>${x.freq ? Math.round(x.freq) : '–'}</td><td><b>${natI(natIndice(r.d, r.t, r.c))}</b></td><td><button class="btn btn-ghost" style="padding:4px 8px" data-x="${r.i}" data-cfg="bare">✕</button></td></tr>`; }).join('')}</table>`
        : '<div class="empty">Aucun résultat enregistré.</div>';
      $('#ls').querySelectorAll('[data-x]').forEach(b => b.onclick = () => { if (confirm('Supprimer ?')) { DB.natation.splice(+b.dataset.x, 1); save(); list(); } });
    };
    $('#fl').onchange = list;
    $('#exp').onclick = () => { if ((window.eleveMode && eleveMode())) return profAsk(() => { profUnlock(); $('#exp').click(); }, 'Export réservé à l\'enseignant'); if (!DB.natation.length) return toast('Rien à exporter');
      download(`natation-${new Date().toISOString().slice(0, 10)}.csv`, csv([['Élève', 'Classe', 'Date', 'Distance (m)', 'Temps', 'Coups de bras', 'Vitesse (m/s)', 'Temps au 100 m', 'Distance par coup de bras (m)', 'Coups de bras / min', 'Indice de nage 25 m'],
        ...DB.natation.map(r => { const x = calc(r.d, r.t, r.c); return [r.eleve, r.classe, new Date(r.date).toLocaleDateString('fr-FR'), r.d, fmt(r.t * 1000), r.c, n2(x.v), fmt(x.t100 * 1000), n2(x.amp), x.freq ? Math.round(x.freq) : '', natI(natIndice(r.d, r.t, r.c)).replace('–', '')]; })])); };
    res(); list();
  };
  draw();
  iv = setInterval(() => { const e = el.querySelector('#tm'); if (e && run) e.textContent = fmt(secOf() * 1000); }, 50);
  return () => clearInterval(iv);
}

/* ---------- Nager vite : 2 à 4 nageurs en même temps ---------- */
function natationMulti(el, n) {
  const cls0 = DB.classes.some(c => c.name === DB.lastClass) ? DB.lastClass : (DB.classes[0] || {}).name || '';
  const st0 = cls0 ? studentsOf(cls0) : [];
  const S = { cls: cls0, d: 25, lanes: Array.from({ length: n }, (_, i) => ({ si: i % Math.max(1, st0.length), t0: 0, acc: 0, run: false, c: 0 })) };
  const sec = L => L.acc + (L.run ? (performance.now() - L.t0) / 1000 : 0);
  const cols = ['#B8912A', '#1E5BD8', '#1B9E5A', '#C0504D'];
  let iv;
  const draw = () => {
    const st = S.cls ? studentsOf(S.cls) : [];
    el.innerHTML = `<div class="card"><div class="row" data-cfg="bare">${DB.classes.length ? `<div><label style="margin-top:0">Classe</label><select id="mc">${DB.classes.map(c => `<option ${c.name === S.cls ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>` : ''}
        <div><label style="margin-top:0">Distance (m)</label><select id="md">${[25, 50, 100, 200].map(v => `<option ${v === S.d ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
        <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="mall">🚩 Départ groupé</button><button class="btn btn-ghost" id="mrz">↺ Tout remettre à zéro</button></div></div>
      ${st.length ? '' : '<div class="card empty" style="margin-top:12px">Créez d\'abord une classe dans « Mes classes ».</div>'}
      <div style="display:grid;grid-template-columns:repeat(${n > 2 ? 2 : n},1fr);gap:10px;margin-top:12px">${S.lanes.map((L, i) => { const t = sec(L), ix = natIndice(S.d, t, L.c);
        return `<div class="card" style="border-top:5px solid ${cols[i]};padding:10px">
          <div class="muted" style="font-size:.72rem;font-weight:800">LIGNE ${i + 1}</div>
          <select data-ls="${i}" style="padding:7px;margin-top:2px">${st.map((x, k) => `<option value="${k}" ${k === L.si ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>
          <div class="big" data-lt="${i}" style="font-size:clamp(1.7rem,7vw,2.6rem);margin:6px 0">${fmt(t * 1000)}</div>
          <button class="btn ${L.run ? 'btn-danger' : 'btn-grad'} btn-block" data-lg="${i}" style="padding:10px 4px">${L.run ? '⏹ Arrivée' : L.acc ? '▶ Reprendre' : '▶ Départ'}</button>
          <div class="muted" style="font-size:.72rem;font-weight:800;margin-top:8px">COUPS DE BRAS</div>
          <div class="row" style="gap:6px;align-items:center"><button class="btn btn-ghost" style="flex:0 0 40px;padding:12px 0" data-lm="${i}">−</button>
            <button class="btn btn-grad" style="padding:14px 4px;font-size:1.3rem;font-weight:900" data-lp="${i}">${L.c}</button></div>
          <div class="muted" style="font-size:.78rem;margin-top:6px" data-li="${i}">${S.d === 25 ? `Indice : <b style="color:var(--text)">${natI(ix)}</b>` : `${L.c && t ? (S.d / L.c).toFixed(2).replace('.', ',') + ' m / coup' : ''}`}</div></div>`; }).join('')}</div>
      <button class="btn btn-grad btn-block" style="margin-top:12px" id="msv">💾 Enregistrer les ${n} nageurs</button>
      <div class="section-title"><h2>Derniers enregistrements</h2></div><div class="card sheet-table" id="mls"></div>`;
    const $ = s => el.querySelector(s), all = s => el.querySelectorAll(s);
    if ($('#mc')) $('#mc').onchange = e => { S.cls = e.target.value; DB.lastClass = S.cls; save(); S.lanes.forEach((L, i) => L.si = i); draw(); };
    $('#md').onchange = e => { S.d = +e.target.value; draw(); };
    const go = L => { if (L.run) { L.acc = sec(L); L.run = false; beep(1000, .25); } else { L.t0 = performance.now(); L.run = true; beep(1300, .3); } };
    $('#mall').onclick = () => { const t = performance.now(); S.lanes.forEach(L => { if (!L.run && !L.acc) { L.t0 = t; L.run = true; } }); beep(1300, .45); draw(); };
    $('#mrz').onclick = () => { S.lanes.forEach(L => Object.assign(L, { t0: 0, acc: 0, run: false, c: 0 })); draw(); };
    all('[data-ls]').forEach(x => x.onchange = () => { S.lanes[+x.dataset.ls].si = +x.value; });
    all('[data-lg]').forEach(b => b.onclick = () => { go(S.lanes[+b.dataset.lg]); draw(); });
    all('[data-lp]').forEach(b => b.onclick = () => { const L = S.lanes[+b.dataset.lp]; L.c++; b.textContent = L.c; beep(1100, .03, .15); });
    all('[data-lm]').forEach(b => b.onclick = () => { const L = S.lanes[+b.dataset.lm]; L.c = Math.max(0, L.c - 1); draw(); });
    $('#msv').onclick = () => { if (S.lanes.some(L => L.run)) return toast('Arrêtez d\'abord tous les chronos'); let k = 0;
      S.lanes.forEach(L => { const eleve = st[L.si], t = Math.round(sec(L) * 100) / 100; if (!eleve || !t) return;
        DB.natation.push({ date: Date.now(), classe: S.cls, eleve, d: S.d, t, c: L.c }); k++; });
      if (!k) return toast('Aucun temps à enregistrer'); save(); toast(`${k} nageur(s) enregistré(s) ✔`);
      const next = Math.max(...S.lanes.map(L => L.si)) + 1;
      S.lanes.forEach((L, i) => Object.assign(L, { si: st.length ? (next + i) % st.length : 0, t0: 0, acc: 0, run: false, c: 0 })); draw(); };
    const R = DB.natation.filter(r => !(window.eleveMode && eleveMode()) || r.classe === S.cls).slice(-8).reverse();
    $('#mls').innerHTML = R.length ? `<table><tr><th>Élève</th><th>Dist.</th><th>Temps</th><th>Coups</th><th>Indice 25 m</th></tr>${R.map(r => `<tr><td><b>${esc(r.eleve)}</b></td><td>${r.d} m</td><td>${fmt(r.t * 1000)}</td><td>${r.c || '–'}</td><td><b>${natI(natIndice(r.d, r.t, r.c))}</b></td></tr>`).join('')}</table>
      <p class="muted" style="font-size:.75rem;margin:6px 0 0">Tous les résultats, avec l'export CSV, sont visibles en mode « 1 nageur ».</p>` : '<div class="empty">Aucun résultat enregistré.</div>';
  };
  draw();
  iv = setInterval(() => { S.lanes.forEach((L, i) => { if (!L.run) return; const e = el.querySelector(`[data-lt="${i}"]`); if (e) e.textContent = fmt(sec(L) * 1000);
    const x = el.querySelector(`[data-li="${i}"]`); if (x && S.d === 25) x.innerHTML = `Indice : <b style="color:var(--text)">${natI(natIndice(S.d, sec(L), L.c))}</b>`; }); }, 60);
  return () => clearInterval(iv);
}

/* ---------- Savoir nager (test ASNS) ---------- */
DB.asns = DB.asns || {};
const ASNS = ['Entrer dans l\'eau en chute arrière', 'Nager sur le ventre', 'Passer sous l\'obstacle', 'Nage ventrale', 'Surplace vertical (debout)',
  'Passage du ventre au dos', 'Nage dorsale', 'Flottaison en étoile sur le dos', '2e immersion (repasser sous l\'obstacle)'];
function natationSavoir(el) {
  if (!DB.classes.length) { el.innerHTML = noClassMsg; return; }
  let cls = DB.classes.some(c => c.name === DB.lastClass) ? DB.lastClass : DB.classes[0].name, si = 0;
  const rec = n => { DB.asns[cls] = DB.asns[cls] || {}; return DB.asns[cls][n] = DB.asns[cls][n] || { r: ASNS.map(() => null) }; };
  const ok = r => r.r.every(v => v === 1);
  const draw = () => {
    const st = studentsOf(cls); if (si >= st.length) si = 0; const n = st[si], R = n ? rec(n) : null;
    const nb = st.filter(x => DB.asns[cls]?.[x] && ok(DB.asns[cls][x])).length;
    el.innerHTML = `<div class="card"><div class="row"><div><label>Classe</label><select id="sc">${DB.classes.map(c => `<option ${c.name === cls ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div><label>Élève</label><select id="se">${st.map((x, k) => `<option value="${k}" ${k === si ? 'selected' : ''}>${esc(x)}${DB.asns[cls]?.[x] && ok(DB.asns[cls][x]) ? ' ✔' : ''}</option>`).join('')}</select></div></div></div>
      ${n ? `<div class="card" style="margin-top:12px"><h3>${esc(n)} — test du savoir-nager</h3>
        ${ASNS.map((l, i) => `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line)"><span style="flex:1;font-weight:700">${i + 1}. ${l}</span>
          <button class="btn ${R.r[i] === 1 ? 'btn-grad' : 'btn-ghost'}" style="flex:0 0 auto;padding:10px 12px" data-ok="${i}">✔</button><button class="btn ${R.r[i] === 0 ? 'btn-danger' : 'btn-ghost'}" style="flex:0 0 auto;padding:10px 12px" data-ko="${i}">✗</button></div>`).join('')}
        <div class="${ok(R) ? 'win' : 'card'}" style="margin-top:12px;text-align:center">${ok(R) ? '🏅 Savoir-nager validé' : `${R.r.filter(v => v === 1).length}/${ASNS.length} épreuves validées`}</div>
        <div class="row" style="margin-top:10px"><button class="btn btn-ghost" id="pv">← Élève précédent</button><button class="btn btn-grad" id="nx">Élève suivant →</button></div></div>` : ''}
      <div class="section-title"><h2>Bilan de la classe · ${nb}/${st.length} validés</h2><button class="link" id="exp">Exporter CSV</button></div>
      <div class="card sheet-table"><table><tr><th>Élève</th>${ASNS.map((l, i) => `<th title="${esc(l)}">${i + 1}</th>`).join('')}<th>Validé</th></tr>
        ${st.map((x, k) => { const r = DB.asns[cls]?.[x]; return `<tr data-row="${k}" style="cursor:pointer"><td><b>${esc(x)}</b></td>${ASNS.map((_, i) => { const v = r ? r.r[i] : null; return `<td>${v === 1 ? '<b style="color:#1B9E5A">✔</b>' : v === 0 ? '<b style="color:var(--danger)">✗</b>' : '<span class="muted">·</span>'}</td>`; }).join('')}<td>${r && ok(r) ? '🏅' : ''}</td></tr>`; }).join('')}</table>
        <p class="muted" style="font-size:.75rem;margin:6px 0 0">${ASNS.map((l, i) => `${i + 1}. ${l}`).join(' · ')}</p></div>`;
    const $ = s => el.querySelector(s);
    $('#sc').onchange = e => { cls = e.target.value; DB.lastClass = cls; si = 0; save(); draw(); };
    $('#se').onchange = e => { si = +e.target.value; draw(); };
    const set = (i, v) => { const was = ok(R); R.r[i] = R.r[i] === v ? null : v; R.d = Date.now();
      if (!was && ok(R)) { saveResult({ tool: 'natation', label: 'Savoir-nager', classe: cls, eleve: n, valeur: 'Savoir-nager validé', detail: 'Toutes les épreuves du test' }); toast(`🏅 ${n} : savoir-nager validé`); } else save(); draw(); };
    el.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => set(+b.dataset.ok, 1));
    el.querySelectorAll('[data-ko]').forEach(b => b.onclick = () => set(+b.dataset.ko, 0));
    if ($('#pv')) $('#pv').onclick = () => { si = Math.max(0, si - 1); draw(); };
    if ($('#nx')) $('#nx').onclick = () => { si = Math.min(st.length - 1, si + 1); draw(); };
    el.querySelectorAll('[data-row]').forEach(r => r.onclick = () => { si = +r.dataset.row; draw(); el.scrollIntoView({ behavior: 'smooth' }); });
    $('#exp').onclick = () => download(`savoir-nager-${cls}.csv`, csv([['Élève', ...ASNS, 'Savoir-nager validé'],
      ...st.map(x => { const r = DB.asns[cls]?.[x]; return [x, ...ASNS.map((_, i) => r ? (r.r[i] === 1 ? 'oui' : r.r[i] === 0 ? 'non' : '') : ''), r && ok(r) ? 'oui' : 'non']; })]));
  };
  draw();
}

/* ---------- Vue tablette d'un groupe ----------
   Le groupe suivi est propre à l'appareil (DB.tablette.natation, jamais synchronisé) :
   { cls, label, noms: [élèves], on: vue tablette active, d: distance }. */
const natTab = () => { const t = DB.tablette?.natation; return t && t.on && t.cls && t.noms?.length ? t : null; };
const natCls = () => DB.classes.some(c => c.name === DB.lastClass) ? DB.lastClass : (DB.classes[0] || {}).name || '';
const natTabSet = o => { DB.tablette = DB.tablette || {}; DB.tablette.natation = { ...(DB.tablette.natation || {}), ...o }; save(); };
const natProf = (el, back) => { el.insertAdjacentHTML('beforeend', '<div style="text-align:center;margin:18px 0 6px"><button class="link" id="gv-prof">🔒 Mode enseignant</button></div>');
  el.querySelector('#gv-prof').onclick = () => { if (!confirm('Passer en mode enseignant (toute la classe, réglages) ?')) return; DB.tablette.natation.on = false; save(); back(); }; };

// Choix « 📱 Cette tablette suit : » (vue enseignant). lanes > 1 : une ligne = élèves n° k, k + lanes, k + 2×lanes…
function natTabPicker(host, lanes, go) {
  const cls = natCls(); if (!cls) { host.innerHTML = ''; return; }
  const st = studentsOf(cls), T = DB.tablette?.natation, laneOf = k => st.filter((_, i) => i % lanes === k);
  const pick = () => {
    host.innerHTML = `<label>📱 Cette tablette suit :</label><select id="tp"><option value="">Toute la classe (vue enseignant)</option>
      ${lanes > 1 ? Array.from({ length: lanes }, (_, k) => laneOf(k)).map((g, k) => g.length ? `<option value="L${k}">Ligne ${k + 1} · ${g.map(esc).join(', ')}</option>` : '').join('') : ''}
      ${T && T.cls === cls && T.noms?.length ? `<option value="grp">${esc(T.label)} · ${T.noms.map(esc).join(', ')}</option>` : ''}
      <option value="new">➕ Choisir les élèves de mon groupe…</option></select>
      <p class="muted" style="font-size:.75rem;margin:4px 0 0">Les élèves ne verront que leur groupe (grand chrono, gros boutons). Retour par « 🔒 Mode enseignant ».</p>`;
    host.querySelector('#tp').onchange = e => { const v = e.target.value; if (!v) return;
      if (v === 'new') return edit();
      if (v === 'grp') natTabSet({ on: true });
      else { const k = +v.slice(1); natTabSet({ cls, label: `Ligne ${k + 1}`, noms: laneOf(k), on: true }); }
      go(); };
  };
  const edit = () => { const sel = new Set(T && T.cls === cls && !/^Ligne /.test(T.label) ? T.noms : []);
    const dr = () => { host.innerHTML = `<label>📱 Mon groupe (${esc(cls)}) — touchez les élèves</label>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0 8px">${st.map((x, k) => `<button class="gv-it ${sel.has(x) ? 'on' : ''}" data-tg="${k}" style="padding:12px 10px"><span class="bx">${sel.has(x) ? '✓' : ''}</span>${esc(x)}</button>`).join('')}</div>
        <label>Nom du groupe</label><input id="tn" value="${esc(T && T.cls === cls && T.label && !/^Ligne /.test(T.label) ? T.label : 'Mon groupe')}">
        <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="tok">📱 Vue tablette (${sel.size})</button><button class="btn btn-ghost" id="tno" style="flex:0 0 auto">Annuler</button></div>`;
      host.querySelectorAll('[data-tg]').forEach(b => b.onclick = () => { const n = st[+b.dataset.tg]; sel.has(n) ? sel.delete(n) : sel.add(n); const v = host.querySelector('#tn').value; dr(); host.querySelector('#tn').value = v; });
      host.querySelector('#tno').onclick = pick;
      host.querySelector('#tok').onclick = () => { if (!sel.size) return toast('Choisissez au moins un élève');
        natTabSet({ cls, label: host.querySelector('#tn').value.trim() || 'Mon groupe', noms: st.filter(x => sel.has(x)), on: true }); go(); }; };
    dr(); };
  pick();
}

// Nager vite — tablette : un nageur à la fois parmi ceux du groupe (ou de la ligne)
function natationTabVite(el, T, back) {
  const st = T.noms, day = new Date().toDateString();
  let cur = 0, d = T.d || 25, t0 = 0, acc = 0, run = false, c = 0, iv;
  const sec = () => acc + (run ? (performance.now() - t0) / 1000 : 0);
  const mine = () => DB.natation.filter(r => r.classe === T.cls && st.includes(r.eleve) && new Date(r.date).toDateString() === day);
  const ixTxt = () => { const t = sec(); return d === 25 ? `Indice de nage : <b style="color:var(--text)">${natI(natIndice(d, t, c))}</b>` : c && t ? `${(d / c).toFixed(2).replace('.', ',')} m par coup de bras` : '&nbsp;'; };
  const draw = () => {
    const R = mine(), n = st[cur];
    el.innerHTML = `<div class="card" style="text-align:center"><div style="font-weight:900;font-size:1.3rem">📱 ${esc(T.label)}</div><div class="muted">${esc(T.cls)} · ${R.length ? new Set(R.map(r => r.eleve)).size : 0} / ${st.length} nageur(s) passé(s) aujourd'hui</div>
        <div class="seg" style="margin-top:10px">${[25, 50, 100, 200].map(v => `<button data-d="${v}" class="${v === d ? 'on' : ''}" ${run || acc ? 'disabled' : ''}>${v} m</button>`).join('')}</div>
        <div style="font-weight:900;font-size:1.7rem;margin-top:14px">🏊 ${esc(n)}</div>
        <div class="gv-clock" id="tv-t" style="color:${!run && acc ? '#1B9E5A' : 'inherit'}">${fmt(sec() * 1000)}</div>
        <div class="row"><button class="btn ${run ? 'btn-danger' : 'btn-grad'}" style="font-size:1.3rem;padding:20px 6px" id="tv-go">${run ? '⏹ Arrivée' : acc ? '▶ Reprendre' : '▶ Départ'}</button><button class="btn btn-ghost" style="flex:0 0 76px;font-size:1.4rem" id="tv-rz">↺</button></div>
        <div class="muted" style="font-size:.78rem;font-weight:800;margin-top:16px">COUPS DE BRAS</div>
        <div class="row" style="align-items:stretch;margin-top:4px"><button class="btn btn-ghost" style="flex:0 0 76px;font-size:1.9rem" id="tv-cm">−</button><button class="btn btn-grad" style="font-size:2.8rem;font-weight:900;padding:22px 4px" id="tv-cp">${c}</button></div>
        <div class="muted" style="margin-top:8px" id="tv-ix">${ixTxt()}</div>
        ${!run && acc ? `<button class="btn btn-grad btn-block" style="margin-top:12px;font-size:1.2rem;padding:16px" id="tv-sv">💾 Enregistrer ${esc(n)}</button>` : ''}</div>
      <div class="card" style="margin-top:10px"><b>Nageurs du groupe</b><div class="muted" style="font-size:.8rem">Touchez un nom pour choisir le nageur suivant.</div>
        ${st.map((x, k) => { const rr = R.filter(r => r.eleve === x && r.d === d).pop();
          return `<button class="gv-it ${rr ? 'on' : ''}" data-sw="${k}" ${run ? 'disabled' : ''} style="${k === cur ? 'box-shadow:0 0 0 3px var(--blue)' : ''}"><span class="bx">${rr ? '✓' : ''}</span><span style="flex:1">${esc(x)}${k === cur ? ' 🏊' : ''}</span>${rr ? `<span class="muted" style="font-size:.85rem;font-weight:700">${fmt(rr.t * 1000)} · ${rr.c || '–'} coups${d === 25 ? ` · indice ${natI(natIndice(rr.d, rr.t, rr.c))}` : ''}</span>` : ''}</button>`; }).join('')}</div>`;
    natProf(el, back);
    const $ = s => el.querySelector(s);
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { d = T.d = +b.dataset.d; save(); draw(); });
    $('#tv-go').onclick = () => { if (run) { acc = sec(); run = false; beep(1000, .3); } else { t0 = performance.now(); run = true; beep(1300, .45); } draw(); };
    $('#tv-rz').onclick = () => { if ((run || acc || c) && !confirm('Remettre le chrono et les coups de bras à zéro ?')) return; run = false; acc = 0; c = 0; draw(); };
    $('#tv-cp').onclick = () => { c++; $('#tv-cp').textContent = c; $('#tv-ix').innerHTML = ixTxt(); beep(1100, .03, .15); };
    $('#tv-cm').onclick = () => { c = Math.max(0, c - 1); $('#tv-cp').textContent = c; $('#tv-ix').innerHTML = ixTxt(); };
    el.querySelectorAll('[data-sw]').forEach(b => b.onclick = () => { if (run) return; if ((acc || c) && !confirm('Le résultat en cours n\'est pas enregistré. Changer de nageur ?')) return; cur = +b.dataset.sw; acc = 0; c = 0; draw(); });
    if ($('#tv-sv')) $('#tv-sv').onclick = () => { const t = Math.round(sec() * 100) / 100; if (!t) return toast('Aucun temps à enregistrer');
      DB.natation.push({ date: Date.now(), classe: T.cls, eleve: n, d, t, c }); save(); toast(`${n} : enregistré ✔`);
      const done = new Set(mine().filter(r => r.d === d).map(r => r.eleve)), nx = st.findIndex((x, k) => k > cur && !done.has(x));
      cur = nx >= 0 ? nx : Math.max(0, st.findIndex(x => !done.has(x))); acc = 0; c = 0; draw(); };
  };
  draw();
  iv = setInterval(() => { if (!run) return; const e = el.querySelector('#tv-t'); if (e) e.textContent = fmt(sec() * 1000); const x = el.querySelector('#tv-ix'); if (x) x.innerHTML = ixTxt(); }, 60);
  return () => clearInterval(iv);
}

// Savoir nager — tablette : seuls les élèves du groupe, gros boutons ✔ / ✗
function natationTabSavoir(el, T, back) {
  const cls = T.cls, st = T.noms; let si = 0;
  const get = n => DB.asns[cls]?.[n], ok = r => !!r && r.r.every(v => v === 1), nOk = r => r ? r.r.filter(v => v === 1).length : 0;
  const draw = () => {
    const n = st[si], R = get(n) || { r: ASNS.map(() => null) }, nb = st.filter(x => ok(get(x))).length;
    el.innerHTML = `<div class="card" style="text-align:center"><div style="font-weight:900;font-size:1.3rem">📱 ${esc(T.label)}</div><div class="muted">${esc(cls)} · ${nb} / ${st.length} savoir-nager validé(s)</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0 8px">${st.map((x, k) => { const r = get(x);
        return `<button class="gv-it ${ok(r) ? 'on' : ''}" data-st="${k}" style="padding:12px 10px;${k === si ? 'box-shadow:0 0 0 3px var(--blue)' : ''}"><span class="bx">${ok(r) ? '🏅' : ''}</span><span style="flex:1">${esc(x)}</span><span class="muted" style="font-size:.8rem">${nOk(r)}/${ASNS.length}</span></button>`; }).join('')}</div>
      <div class="card" style="margin-top:12px"><h3 style="font-size:1.35rem">${esc(n)}</h3>
        ${ASNS.map((l, i) => `<div class="gv-it" style="cursor:default;${R.r[i] === 1 ? 'border-color:#1B9E5A;background:rgba(27,158,90,.1)' : R.r[i] === 0 ? 'border-color:var(--danger)' : ''}"><span style="flex:1">${i + 1}. ${l}</span>
          <button class="btn ${R.r[i] === 1 ? 'btn-grad' : 'btn-ghost'}" style="flex:0 0 64px;padding:16px 0;font-size:1.4rem" data-ok="${i}">✔</button><button class="btn ${R.r[i] === 0 ? 'btn-danger' : 'btn-ghost'}" style="flex:0 0 64px;padding:16px 0;font-size:1.4rem" data-ko="${i}">✗</button></div>`).join('')}
        <div class="${ok(R) ? 'win' : 'card'}" style="margin-top:12px;text-align:center;font-size:1.1rem">${ok(R) ? '🏅 Savoir-nager validé' : `${nOk(R)}/${ASNS.length} épreuves validées`}</div>
        ${st.length > 1 ? `<div class="row" style="margin-top:10px"><button class="btn btn-ghost" style="padding:16px" id="pv">← Précédent</button><button class="btn btn-grad" style="padding:16px" id="nx">Suivant →</button></div>` : ''}</div>`;
    natProf(el, back);
    const $ = s => el.querySelector(s);
    // l'enregistrement n'est créé qu'au premier appui : pas de fiche vide pour les élèves non évalués
    const set = (i, v) => { DB.asns[cls] = DB.asns[cls] || {}; const r = DB.asns[cls][n] = DB.asns[cls][n] || { r: ASNS.map(() => null) }, was = ok(r);
      r.r[i] = r.r[i] === v ? null : v; r.d = Date.now(); if (v === 1 && r.r[i] === 1) beep(900, .06);
      if (!was && ok(r)) { saveResult({ tool: 'natation', label: 'Savoir-nager', classe: cls, eleve: n, valeur: 'Savoir-nager validé', detail: 'Toutes les épreuves du test' }); toast(`🏅 ${n} : savoir-nager validé`); } else save(); draw(); };
    el.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => set(+b.dataset.ok, 1));
    el.querySelectorAll('[data-ko]').forEach(b => b.onclick = () => set(+b.dataset.ko, 0));
    el.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { si = +b.dataset.st; draw(); });
    if ($('#pv')) $('#pv').onclick = () => { si = (si - 1 + st.length) % st.length; draw(); };
    if ($('#nx')) $('#nx').onclick = () => { si = (si + 1) % st.length; draw(); };
  };
  draw();
}

/* Séance partagée : le prof forme des groupes (lignes d'eau) et les propose aux autres tablettes */
const natShareId = cls => 'nat-' + cls + '-' + new Date().toDateString();
function natShareCard(host, frame) {
  const cls = natCls(); if (!cls || typeof partPublish !== 'function') return;
  const st = studentsOf(cls), cur = partGet(natShareId(cls)); let n = cur?.tpl?.groups?.length || Math.max(2, DB.natLanes || 2);
  const grp = k => Array.from({ length: k }, (_, i) => ({ name: `Ligne ${i + 1}`, members: st.filter((_, j) => j % k === i) })).filter(g => g.members.length);
  const draw = () => { host.innerHTML = `<details class="card" data-cfg style="margin-bottom:12px"><summary style="font-weight:800;cursor:pointer">📤 Une tablette par ligne d'eau${cur ? ' · <span style="color:#1B9E5A">proposée ✓</span>' : ''}</summary>
      <p class="muted" style="font-size:.82rem;margin:6px 0 0">Répartit les élèves de <b>${esc(cls)}</b> en lignes et les propose aux autres tablettes : chacune touche « ▶ Rejoindre » puis sa ligne.</p>
      <label>Nombre de lignes</label><div class="seg">${[2, 3, 4, 5, 6].map(k => `<button data-ns="${k}" class="${k === n ? 'on' : ''}">${k}</button>`).join('')}</div>
      <div class="muted" style="font-size:.8rem;margin-top:6px">${grp(n).map(g => `<b>${g.name}</b> : ${g.members.map(esc).join(', ')}`).join('<br>')}</div>
      <button class="btn btn-grad btn-block" style="margin-top:10px" id="nshare">📤 Proposer ${n} lignes aux autres tablettes</button></details>`;
    host.querySelectorAll('[data-ns]').forEach(b => b.onclick = () => { n = +b.dataset.ns; draw(); host.querySelector('details').open = true; });
    host.querySelector('#nshare').onclick = () => { const G = grp(n); if (!G.length) return toast('Classe vide');
      partRemove(natShareId(cls)); partPublish('natation', natShareId(cls), { nom: 'Natation · ' + cls, classe: cls, ng: G.length, ep: 'lignes d\'eau', tpl: { cls, groups: G } }, true);
      toast(`📤 ${G.length} lignes proposées aux autres tablettes`); frame(); }; };
  draw();
}
const natJoin = (box, p, frame) => { const T = p.tpl; if (!T || !T.groups) return;
  partPickGroup(box, T.groups, i => { if (i == null) { if (DB.tablette?.natation) DB.tablette.natation.on = false; save(); return frame(); }
    natTabSet({ cls: T.cls, label: T.groups[i].name, noms: [...T.groups[i].members], on: true }); DB.lastClass = T.cls; save(); frame(); }); };

/* ✍️ Saisie des résultats prof (sans lancer l'épreuve) : distance, temps, coups de bras pour toute la classe */
function natManual(box, back) {
  let cls = natCls(), d = 25;
  const pick = () => {
    box.innerHTML = `<div class="card"><h3 style="margin-top:0">✍️ Saisie des résultats prof</h3><div class="row"><div><label>Classe</label><select id="nm-c">${DB.classes.map(c => `<option ${c.name === cls ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div><label>Distance (m)</label><select id="nm-d">${[25, 50, 100, 200, 400].map(v => `<option ${v === d ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
      <button class="btn btn-grad btn-block" style="margin-top:12px" id="nm-go">Continuer ▶</button><button class="btn btn-ghost btn-block" style="margin-top:8px" id="nm-x">Annuler</button></div>`;
    box.querySelector('#nm-x').onclick = back;
    box.querySelector('#nm-go').onclick = () => { cls = box.querySelector('#nm-c').value; d = +box.querySelector('#nm-d').value; DB.lastClass = cls; save(); table(); };
  };
  const table = () => { const st = studentsOf(cls);
    spTable(box, { title: `Natation · ${cls} · ${d} m`, rows: st.map(n => ({ label: n })), fields: [{ k: 't', l: `Temps ${d} m`, type: 'time', ph: '0:25,4' }, { k: 'c', l: 'Coups de bras', type: 'num' }],
      cancelLbl: '← Retour', onCancel: pick,
      onSave: V => { let n = 0; V.forEach((v, i) => { if (v.t == null) return; DB.natation.push({ date: Date.now(), classe: cls, eleve: st[i], d, t: Math.round(v.t * 100) / 100, c: v.c != null ? Math.round(v.c) : 0 }); n++; });
        if (!n) return toast('Saisissez au moins un temps'); save(); toast(`${n} résultat(s) enregistré(s) ✔`); back(); } }); };
  pick();
}

TOOL_IMPL.natation = function (el) {
  let mode = DB.natMode || 'vite', stop = null;
  const frame = () => {
    if (stop) { try { stop(); } catch (e) {} stop = null; }
    el.innerHTML = `<div class="co-tabs">${[['vite', '⏱ Nager vite'], ['savoir', '🏅 Savoir nager']].map(([k, l]) => `<button data-nm="${k}" class="${mode === k ? 'on' : ''}">${l}</button>`).join('')}</div><div id="nat-b"></div>`;
    el.querySelectorAll('[data-nm]').forEach(b => b.onclick = () => { mode = DB.natMode = b.dataset.nm; save(); frame(); });
    const box = el.querySelector('#nat-b'), T = natTab();
    if (T) { stop = mode === 'vite' ? natationTabVite(box, T, frame) : natationTabSavoir(box, T, frame); return; }   // tablette d'un groupe
    // le choix du groupe suit la classe sélectionnée dans la vue enseignant
    box.addEventListener('change', e => { const h = box.querySelector('#nat-tp'); if (h && ['cl', 'mc', 'sc'].includes(e.target.id)) natTabPicker(h, mode === 'vite' ? DB.natLanes || 1 : 1, frame); });
    if (mode === 'vite') {
      const L = DB.natLanes || 1;
      box.innerHTML = `<div class="card" style="margin-bottom:12px"><div data-cfg><label style="margin-top:0">Nageurs chronométrés en même temps</label><div class="seg">${[1, 2, 3, 4].map(n => `<button data-ln="${n}" class="${L === n ? 'on' : ''}">${n}</button>`).join('')}</div></div><div id="nat-tp"></div></div><div id="nat-v"></div>`;
      box.querySelectorAll('[data-ln]').forEach(b => b.onclick = () => { DB.natLanes = +b.dataset.ln; save(); frame(); });
      natTabPicker(box.querySelector('#nat-tp'), L, frame);
      const vb = box.querySelector('#nat-v');
      stop = L > 1 ? natationMulti(vb, L) : natationVite(vb);
    } else {
      box.innerHTML = DB.classes.length ? '<div class="card" style="margin-bottom:12px" id="nat-tp"></div><div id="nat-s"></div>' : '<div id="nat-s"></div>';
      if (DB.classes.length) natTabPicker(box.querySelector('#nat-tp'), 1, frame);
      stop = natationSavoir(box.querySelector('#nat-s'));
    }
    // séance partagée : proposer des lignes / rejoindre une séance d'une autre tablette
    const sh = document.createElement('div'); box.prepend(sh); natShareCard(sh, frame);
    if (mode === 'vite' && DB.classes.length) { const mb = document.createElement('button'); mb.className = 'btn btn-ghost btn-block'; mb.setAttribute('data-cfg', 'bare'); mb.style.marginBottom = '12px'; mb.textContent = SP_BTN;
      mb.onclick = () => natManual(box, frame); box.prepend(mb); }
    if (typeof partMount === 'function') partMount(box, 'natation', p => natJoin(box, p, frame));
  };
  frame();
  return () => { if (stop) stop(); };
};
