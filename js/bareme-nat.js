/* =========================================================
   EPS ONE — « 📐 Barèmes » de la Natation de vitesse (dans ✅ Validation enseignant)
   Barème = temps de nage (s) + indice de nage (temps en s + coups de bras, sur 25 m) + critère « plongeon » (note saisie par le prof).
   Garçons / Filles. Tables modifiables (valeurs proposées à ajuster). Données : DB.valid.barNat = { list, who, plong }
   ========================================================= */
function barNatDefault(name, lv) {
  const T = (rows, max) => brTbl(rows, { dir: 'down', lin: true, max });
  return { id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), name: name || 'Barème natation 25 m', lv: lv || '', dist: 25, plong: { lbl: 'Plongeon (entrée, coulée, alignement)', max: 4 },
    t: { 'time.G': T([[14, 10], [16, 9], [18, 8], [20, 7], [22, 6], [24, 5], [26, 4], [28, 3], [30, 2], [35, 1], [40, 0]], 10), 'time.F': T([[16, 10], [18, 9], [20, 8], [22, 7], [24, 6], [26, 5], [28, 4], [30, 3], [32, 2], [37, 1], [42, 0]], 10),
      'ind.G': T([[30, 6], [40, 5], [50, 4], [60, 3], [70, 2], [80, 1], [90, 0]], 6), 'ind.F': T([[35, 6], [45, 5], [55, 4], [65, 3], [75, 2], [85, 1], [95, 0]], 6) } };
}
function barNatStore() { const v = VD(); v.barNat = v.barNat || {}; const B = v.barNat; B.who = B.who || {}; B.plong = B.plong || {}; if (!Array.isArray(B.list) || !B.list.length) B.list = [barNatDefault()]; return B; }
const barNatFor = cls => { const B = barNatStore(); return B.list.find(b => b.lv && b.lv === valLevelOf(cls)) || B.list.find(b => !b.lv) || B.list[0]; };
/* dernier résultat de l'élève à la distance du barème */
const barNatRec = (cls, nom, b) => (DB.natation || []).filter(r => r && r.classe === cls && r.eleve === nom && r.d === b.dist && r.t > 0).sort((a, c) => c.date - a.date)[0] || null;
function barNatScore(b, pub, r, plong) {
  const g = pub === 'F' ? 'F' : 'G', items = [], add = (key, nm, v, tb) => { if (v == null || !tb) return; const n = barNote(tb, v); if (n != null) items.push({ key, nm, v, n, max: tb.max }); };
  if (r) { add('time', 'Temps de nage (s)', r.t, b.t['time.' + g]); if (r.c > 0) add('ind', `Indice de nage (temps + coups)`, Math.round((r.t + r.c) * 10) / 10, b.t['ind.' + g]); }
  if (plong != null && b.plong) items.push({ key: 'plong', nm: b.plong.lbl, v: plong, n: Math.min(b.plong.max, Math.max(0, plong)), max: b.plong.max });
  const pts = items.reduce((a, x) => a + x.n, 0), max = items.reduce((a, x) => a + x.max, 0); return { items, pts, max, n20: max ? pts / max * 20 : null };
}
function barNatSave(cls, nom) { const B = barNatStore(), b = barNatFor(cls), pub = (B.who[cls] || {})[nom]; if (!pub) return false; const r = barNatRec(cls, nom, b); if (!r) return false;
  const S = barNatScore(b, pub, r, ((B.plong[cls] || {})[nom])); if (S.n20 == null) return false;
  saveResult({ key: `valid|natation-bareme|${cls}|${nom}`, tool: 'natation', label: 'Natation · ' + b.name, classe: cls, eleve: nom, valeur: `${brFr(S.n20, 1)} / 20`,
    detail: S.items.map(x => `${x.nm} ${brFr(x.v, 1)} → ${brFr(x.n)}/${brFr(x.max)}`).join(' · ') + ` · ${BAR_PUB[pub === 'F' ? 'F' : 'G']} · ${b.dist} m` }); return true; }
window.barNatAuto = (cls, nom) => { try { if (barNatSave(cls, nom)) save(); } catch (e) { console.warn(e); } };
/* Bloc « Barème » de la fiche élève (Validation prof › Natation) */
window.barNatEleveHTML = function (cls, nom) {
  const B = barNatStore(), b = barNatFor(cls), pub = (B.who[cls] || {})[nom] || '', r = barNatRec(cls, nom, b), pl = (B.plong[cls] || {})[nom], S = pub ? barNatScore(b, pub, r, pl) : null;
  const sel = `<select data-nwho style="padding:6px"><option value="">Public ?</option>${['G', 'F'].map(k => `<option value="${k}" ${pub === k ? 'selected' : ''}>${BAR_PUB[k]}</option>`).join('')}</select>`;
  const row = x => x.key === 'plong' ? `<div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-top:1px solid var(--line)"><span style="flex:1;font-weight:700;font-size:.88rem">🤿 ${esc(x.nm)}</span><input data-npl value="${pl == null ? '' : brFr(pl)}" inputmode="decimal" style="width:70px;padding:6px;text-align:center"><b style="min-width:70px;text-align:right">${brFr(x.n)} / ${brFr(x.max)}</b></div>`
    : `<div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-top:1px solid var(--line)"><span style="flex:1;font-weight:700;font-size:.88rem">${x.key === 'time' ? '⏱' : '📊'} ${esc(x.nm)}</span><span style="min-width:60px;text-align:center">${brFr(x.v, 1)}</span><b style="min-width:70px;text-align:right">${brFr(x.n)} / ${brFr(x.max)}</b></div>`;
  return `<div class="card" style="margin-top:12px"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><b style="flex:1">📐 ${esc(b.name)}</b>${sel}</div>
    <div class="muted" style="font-size:.78rem;margin-top:4px">${r ? `Dernier ${b.dist} m : ${brFr(r.t, 2)} s · ${r.c || 0} coups de bras (${new Date(r.date).toLocaleDateString('fr-FR')})` : `Aucun résultat sur ${b.dist} m pour cet élève.`}</div>
    ${!pub ? '<div style="margin-top:8px;font-size:.88rem">Choisis le public (Garçons / Filles) pour calculer la note.</div>' : S.items.map(row).join('') + (b.plong && !S.items.some(x => x.key === 'plong') ? `<div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-top:1px solid var(--line)"><span style="flex:1;font-weight:700;font-size:.88rem">🤿 ${esc(b.plong.lbl)}</span><input data-npl value="" placeholder="0–${brFr(b.plong.max)}" inputmode="decimal" style="width:70px;padding:6px;text-align:center"></div>` : '')
      + (S.n20 != null ? `<div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:var(--grad-soft);display:flex;justify-content:space-between;align-items:baseline"><b>Note du barème</b><span style="font-size:1.6rem;font-weight:900">${brFr(S.n20, 1)} / 20</span></div>` : '')}</div>`;
};
window.barNatEleveBind = function (o, cls, nom, redraw) {
  const B = barNatStore(), b = barNatFor(cls), done = () => { save(); window.syncFlush && window.syncFlush(); barNatSave(cls, nom); save(); redraw(); };
  const w = o.querySelector('[data-nwho]'); if (w) w.onchange = () => { const W = (B.who[cls] = B.who[cls] || {}); if (w.value) W[nom] = w.value; else delete W[nom]; done(); };
  const p = o.querySelector('[data-npl]'); if (p) p.onchange = () => { const P = (B.plong[cls] = B.plong[cls] || {}), v = brNum(p.value); if (v == null) delete P[nom]; else P[nom] = Math.max(0, Math.min(b.plong.max, v)); done(); };
};
/* ---------- Écran : notes de la classe + barèmes ---------- */
function openBaremeNat(cls0, onClose) {
  const B = barNatStore(), commit = () => { save(); window.syncFlush && window.syncFlush(); };
  let cls = cls0 || DB.lastClass || (DB.classes[0] || {}).name || '', view = 'notes', bi = 0, edit = false, pubSel = 'G';
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:320;background:var(--bg,#fff);overflow:auto;padding:14px 14px 40px'; document.body.appendChild(o);
  const close = () => { o.remove(); onClose && onClose(); };
  const KEYS = [['time', 'Temps de nage (s)', 'Valeur = temps maximal (en s) pour obtenir la note. Plus c\'est rapide, plus la note est haute.'], ['ind', 'Indice de nage (temps en s + coups de bras)', 'Plus l\'indice est bas, mieux c\'est.']];
  const tblEd = (key, b, title, note) => { const tb = b.t[key];
    return `<div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b>${title}</b><span class="muted" style="font-size:.8rem">note max <input data-tmax="${key}" value="${brFr(tb.max)}" inputmode="decimal" style="width:54px;padding:4px;text-align:center"></span></div>
      <div class="muted" style="font-size:.78rem;margin:4px 0">${note}</div>
      <div class="sheet-table" style="overflow:auto"><table><tr><th>Jusqu'à</th><th>Note</th><th></th></tr>${tb.rows.map((r, i) => `<tr><td><input data-tx="${key}|${i}" value="${r[0] == null ? '' : brFr(r[0], 2)}" inputmode="decimal" style="width:84px;padding:5px;text-align:center"></td><td><input data-tn="${key}|${i}" value="${r[1] == null ? '' : brFr(r[1])}" inputmode="decimal" style="width:70px;padding:5px;text-align:center"></td><td><button class="btn btn-ghost" style="padding:3px 8px" data-trm="${key}|${i}">✕</button></td></tr>`).join('')}</table></div>
      <div class="row" style="gap:6px;margin-top:6px;align-items:center;flex-wrap:wrap"><button class="btn btn-ghost" style="padding:6px 10px" data-tadd="${key}">＋ Ligne</button><label style="margin:0;display:flex;align-items:center;gap:6px;font-size:.82rem"><input type="checkbox" data-tlin="${key}" ${tb.lin ? 'checked' : ''} style="width:18px;height:18px;margin:0"> Notes progressives entre deux lignes</label></div>
      <div class="row" style="gap:6px;margin-top:6px;align-items:center;flex-wrap:wrap"><span class="muted" style="font-size:.8rem">Combler avec un pas de</span><input data-fstep="${key}" value="${key.startsWith('time') ? 1 : 5}" inputmode="decimal" style="width:60px;padding:5px;text-align:center"><button class="btn btn-ghost" style="padding:6px 10px" data-fill="${key}">↔ Combler</button></div></div>`; };
  const draw = () => { const y = o.scrollTop; if (bi >= B.list.length) bi = 0; const b = B.list[bi];
    o.innerHTML = `<div style="display:flex;align-items:center;gap:8px;max-width:900px;margin:0 auto"><h2 style="flex:1;margin:0;font-size:1.15rem">📐 Barèmes · Natation</h2><button class="btn btn-ghost" style="flex:0 0 auto" data-q>✕ Fermer</button></div>
      <div style="max-width:900px;margin:10px auto 0"><div class="tog">${[['notes', '📊 Notes de la classe'], ['list', '📐 Mes barèmes']].map(([k, l]) => `<button data-bv="${k}" class="${view === k && !edit ? 'on' : ''}">${l}</button>`).join('')}</div>${view === 'notes' ? notesHTML() : edit ? editHTML(b) : listHTML()}</div>`;
    bind(); o.scrollTop = y; };
  const listHTML = () => `<div class="card" style="margin-top:12px"><b>Barèmes natation</b><div class="muted" style="font-size:.82rem">Un barème = temps de nage + indice de nage + critère plongeon. Les valeurs proposées sont à ajuster. Un barème sans niveau vaut pour toutes les classes ; un barème avec niveau est utilisé en priorité pour ce niveau.</div>
      <button class="btn btn-grad btn-block" style="margin-top:8px" id="bnew">＋ Créer un barème (copie du 1er)</button></div>
    ${B.list.map((x, i) => `<div class="card" style="margin-top:10px"><div style="display:flex;gap:8px;align-items:center"><b style="flex:1">${esc(x.name)}</b><span class="pill">${x.lv ? x.lv + 'è' : 'tous niveaux'}</span></div><div class="row" style="gap:6px;margin-top:8px"><button class="btn btn-grad" style="padding:8px" data-bed="${i}">✏️ Modifier</button><button class="btn btn-ghost" style="padding:8px" data-bdup="${i}">⧉ Dupliquer</button><button class="btn btn-ghost" style="padding:8px" data-bdel="${i}">🗑</button></div></div>`).join('')}`;
  const editHTML = b => `<div class="card" style="margin-top:12px"><button class="btn btn-ghost" style="padding:6px 10px" id="bback">← Barèmes</button><div class="row" style="margin-top:8px"><div style="flex:3"><label style="margin-top:0">Nom</label><input id="bname" value="${esc(b.name)}" style="font-weight:800"></div><div style="flex:1"><label style="margin-top:0">Niveau</label><select id="blv2"><option value="">Tous</option>${VAL_LV.map(l => `<option value="${l}" ${b.lv === l ? 'selected' : ''}>${l}è</option>`).join('')}</select></div></div>
      <label>Distance du barème (m)</label><input data-bdist value="${b.dist}" inputmode="numeric" style="width:90px"><div class="muted" style="font-size:.78rem">L'indice de nage (temps + coups de bras) est défini sur 25 m.</div>
      <label>Critère « plongeon »</label><div class="row" style="gap:6px"><input data-plbl value="${esc(b.plong.lbl)}" style="flex:3"><input data-plmax value="${brFr(b.plong.max)}" inputmode="decimal" style="flex:1;text-align:center" title="Note maximale"></div><div class="muted" style="font-size:.78rem">Libellé et note maximale modifiables ; la note du plongeon est saisie par l'enseignant dans la fiche de l'élève.</div>
      <label>Public</label><div class="tog">${['G', 'F'].map(k => `<button data-pub="${k}" class="${pubSel === k ? 'on' : ''}">${BAR_PUB[k]}</button>`).join('')}</div></div>
    ${KEYS.map(([k, t, n]) => tblEd(`${k}.${pubSel}`, b, `${t} · ${BAR_PUB[pubSel]}`, n)).join('')}`;
  const notesHTML = () => { const b = barNatFor(cls), st = studentsOf(cls), W = B.who[cls] || {};
    const rows = st.map(nom => { const pub = W[nom] || '', r = barNatRec(cls, nom, b), pl = (B.plong[cls] || {})[nom], S = pub && r ? barNatScore(b, pub, r, pl) : null, it = k => S && S.items.find(x => x.key === k);
      return `<tr><td><b>${esc(nom)}</b></td><td><select data-nw="${esc(nom)}" style="padding:4px"><option value="">?</option>${['G', 'F'].map(k => `<option value="${k}" ${pub === k ? 'selected' : ''}>${BAR_PUB[k]}</option>`).join('')}</select></td><td>${r ? brFr(r.t, 2) + ' s' : '–'}</td><td>${r ? r.c || 0 : '–'}</td>
        <td>${it('time') ? brFr(it('time').n) + '/' + brFr(it('time').max) : '–'}</td><td>${it('ind') ? brFr(it('ind').v, 1) + ' → ' + brFr(it('ind').n) + '/' + brFr(it('ind').max) : '–'}</td><td><input data-np="${esc(nom)}" value="${pl == null ? '' : brFr(pl)}" inputmode="decimal" style="width:60px;padding:4px;text-align:center" placeholder="0–${brFr(b.plong.max)}"></td><td><b>${S && S.n20 != null ? brFr(S.n20, 1) : '–'}</b></td></tr>`; }).join('');
    return `<div class="card" style="margin-top:12px"><div class="row"><div><label style="margin-top:0">Classe</label><select id="nc">${DB.classes.map(c => `<option ${c.name === cls ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div><div><label style="margin-top:0">Barème utilisé</label><div style="padding:10px 0;font-weight:700">${esc(b.name)}</div></div></div></div>
      <div class="card sheet-table cb-tbl" style="margin-top:10px;overflow:auto"><table><tr><th>Élève</th><th>Public</th><th>Temps ${b.dist} m</th><th>Coups</th><th>Note temps</th><th>Indice → note</th><th>${esc(b.plong.lbl.split('(')[0].trim())} /${brFr(b.plong.max)}</th><th>Note /20</th></tr>${rows}</table></div>
      <div class="row" style="gap:6px;margin-top:10px"><button class="btn btn-grad" style="flex:1" id="nsave">💾 Enregistrer dans Résultats des élèves</button><button class="btn btn-ghost" style="flex:1" id="ncsv">📤 CSV</button></div>`; };
  const bind = () => { const $ = s => o.querySelector(s), A = s => o.querySelectorAll(s), b = B.list[bi];
    $('[data-q]').onclick = close; A('[data-bv]').forEach(x => x.onclick = () => { view = x.dataset.bv; edit = false; draw(); });
    if ($('#nc')) $('#nc').onchange = e => { cls = e.target.value; DB.lastClass = cls; save(); draw(); };
    A('[data-nw]').forEach(x => x.onchange = () => { const W = (B.who[cls] = B.who[cls] || {}); if (x.value) W[x.dataset.nw] = x.value; else delete W[x.dataset.nw]; commit(); draw(); });
    A('[data-np]').forEach(x => x.onchange = () => { const P = (B.plong[cls] = B.plong[cls] || {}), v = brNum(x.value), bb = barNatFor(cls); if (v == null) delete P[x.dataset.np]; else P[x.dataset.np] = Math.max(0, Math.min(bb.plong.max, v)); commit(); draw(); });
    if ($('#nsave')) $('#nsave').onclick = () => { let n = 0; studentsOf(cls).forEach(nm => { if (barNatSave(cls, nm)) n++; }); if (!n) return toast('Choisis le public et vérifie qu\'il y a un temps de nage'); save(); toast(n + ' notes enregistrées ✔'); };
    if ($('#ncsv')) $('#ncsv').onclick = () => { const bb = barNatFor(cls), W = B.who[cls] || {}; download(`bareme-natation-${cls}.csv`.replace(/[^\w.-]+/g, '-'), csv([['Élève', 'Public', 'Temps (s)', 'Coups de bras', 'Indice', 'Note temps', 'Note indice', 'Plongeon', 'Note /20'],
      ...studentsOf(cls).map(nm => { const r = barNatRec(cls, nm, bb), pl = (B.plong[cls] || {})[nm], S = W[nm] && r ? barNatScore(bb, W[nm], r, pl) : null, it = k => S && S.items.find(x => x.key === k); return [nm, W[nm] ? BAR_PUB[W[nm]] : '', r ? r.t : '', r ? r.c || 0 : '', r && r.c ? Math.round((r.t + r.c) * 10) / 10 : '', it('time') ? it('time').n : '', it('ind') ? it('ind').n : '', pl == null ? '' : pl, S && S.n20 != null ? brFr(S.n20, 1) : '']; })])); };
    if ($('#bnew')) $('#bnew').onclick = () => { const nb = JSON.parse(JSON.stringify(B.list[0])); nb.id = 'n' + Date.now().toString(36); nb.name = 'Nouveau barème natation'; nb.lv = '4'; B.list.push(nb); bi = B.list.length - 1; edit = true; commit(); draw(); };
    A('[data-bed]').forEach(x => x.onclick = () => { bi = +x.dataset.bed; edit = true; draw(); });
    A('[data-bdup]').forEach(x => x.onclick = () => { const c0 = JSON.parse(JSON.stringify(B.list[+x.dataset.bdup])); c0.id = 'n' + Date.now().toString(36); c0.name += ' (copie)'; B.list.push(c0); commit(); draw(); });
    A('[data-bdel]').forEach(x => x.onclick = () => { const i = +x.dataset.bdel; if (B.list.length < 2) return toast('Garde au moins un barème'); if (!confirm(`Supprimer « ${B.list[i].name} » ?`)) return; B.list.splice(i, 1); bi = 0; commit(); draw(); });
    if (!edit) return;
    $('#bback').onclick = () => { edit = false; draw(); }; $('#bname').onchange = e => { b.name = e.target.value.trim() || b.name; commit(); }; $('#blv2').onchange = e => { b.lv = e.target.value; commit(); };
    $('[data-bdist]').onchange = e => { b.dist = Math.max(5, Math.round(brNum(e.target.value) || 25)); commit(); };
    $('[data-plbl]').onchange = e => { b.plong.lbl = e.target.value.trim() || b.plong.lbl; commit(); }; $('[data-plmax]').onchange = e => { b.plong.max = Math.max(0, brNum(e.target.value) || 0); commit(); };
    A('[data-pub]').forEach(x => x.onclick = () => { pubSel = x.dataset.pub; draw(); });
    A('[data-tx],[data-tn]').forEach(x => x.onchange = () => { const [k, i] = (x.dataset.tx || x.dataset.tn).split('|'), r = b.t[k].rows[+i]; r[x.dataset.tx ? 0 : 1] = brNum(x.value); if (x.dataset.tx) b.t[k].rows.sort((p, q) => p[0] == null ? 1 : q[0] == null ? -1 : p[0] - q[0]); commit(); draw(); });
    A('[data-tmax]').forEach(x => x.onchange = () => { b.t[x.dataset.tmax].max = Math.max(0, brNum(x.value) || 0); commit(); });
    A('[data-trm]').forEach(x => x.onclick = () => { const [k, i] = x.dataset.trm.split('|'); b.t[k].rows.splice(+i, 1); commit(); draw(); });
    A('[data-tadd]').forEach(x => x.onclick = () => { b.t[x.dataset.tadd].rows.push([null, null]); commit(); draw(); });
    A('[data-tlin]').forEach(x => x.onchange = () => { b.t[x.dataset.tlin].lin = x.checked; commit(); });
    A('[data-fill]').forEach(x => x.onclick = () => { const k = x.dataset.fill, n = barFill(b.t[k], brNum(o.querySelector(`[data-fstep="${k}"]`).value)); commit(); draw(); toast(n ? n + ' ligne(s) ajoutée(s)' : 'Rien à combler avec ce pas'); }); };
  draw();
}
window.openBaremeNat = openBaremeNat;
