/* =========================================================
   EPS ONE — « ✅ Validation enseignant » : niveaux de maîtrise par critère
   (comme la validation des éléments en gym / acrosport), dans :
   combiné, demi-fond, duathlon (lancers et courses), danse, escalade,
   course d'orientation. Bouton ✅ dans l'en-tête de l'outil (protégé par
   le code enseignant).
   Données : DB.valid = { crit: { outil: [{ id, n }] }, v: { outil: { classe: { élève: { idCritère: niveau 0-3, _t } } } } }
   ========================================================= */
const VAL_TOOLS = {
  combine: { n: 'Combiné athlétique', c: ['Course : départ réactif, accélération', 'Course : vitesse maintenue jusqu\'à la ligne', 'Saut : course d\'élan régulière', 'Saut : impulsion d\'un pied, bras actifs', 'Lancer : placement et orientation', 'Lancer : action du bras (poussée / fouetté)', 'Lancer : respect de la zone, sécurité', 'Enchaîner les épreuves, gérer l\'effort'] },
  demifond: { n: 'Demi-fond', c: ['Allure régulière (respect du projet)', 'Projet réaliste (connaissance de soi)', 'Foulée et posture de course', 'Respiration, relâchement', 'Gestion de l\'effort et récupération', 'Rôle d\'observateur / coach'] },
  duathlon: { n: 'Duathlon athlétique', c: ['Course : allure régulière', 'Course : gestion de l\'effort', 'Lancer : placement et orientation', 'Lancer : action du bras', 'Transition course → lancer', 'Sécurité dans la zone de lancer'] },
  danse: { n: 'Danse', c: ['Engagement, concentration, regard', 'Utilisation de l\'espace (niveaux, directions)', 'Rythme, utilisation du temps', 'Énergie, qualités de mouvement', 'Composition (procédés)', 'Relation aux autres, synchronisation', 'Mémorisation de la chorégraphie', 'Rôle de spectateur / juge'] },
  escalade: { n: 'Escalade', c: ['Encordement, nœud de huit', 'Assurage : avaler, bloquer', 'Contre-assurage', 'Communication de la cordée', 'Lecture de la voie', 'Pieds précis, poids sur les jambes', 'Fluidité, économie', 'Descente, mouflage'] },
  match: { n: 'Sports collectifs', c: ['Attaque · Porteur : conserver, progresser vers la cible', 'Attaque · Tireur : tirer au bon moment, tir efficace', 'Attaque · Passeur : passe adaptée vers un partenaire démarqué', 'Attaque · Non-porteur : se démarquer, offrir une solution', 'Attaque · Prise d\'informations (lever la tête)', 'Attaque · Choix pertinents (passer, tirer, dribbler)', 'Défense · Récupérer le ballon (harceler, intercepter)', 'Défense · Se replacer, défendre sa cible', 'Défense · Marquer un adversaire', 'Défense · Prise d\'informations (ballon et adversaire)', 'Rôles · Respect des règles, fair-play', 'Rôles · Arbitre / observateur'] },
  matchr: { n: 'Sports de raquette', c: ['Attaque · Rompre l\'échange (accélérer, varier)', 'Attaque · Viser les espaces libres', 'Attaque · Frappe décisive au bon moment', 'Attaque · Service varié et réglementaire', 'Défense · Se replacer au centre', 'Défense · Renvoyer les balles / volants difficiles', 'Défense · Prise d\'informations sur l\'adversaire', 'Choix tactiques (long / court, gauche / droite)', 'Rôles · Arbitre / compteur', 'Rôles · Respect, fair-play'] },
  escrime: { n: 'Escrime', c: ['Attaque · Toucher au bon moment (distance)', 'Attaque · Fente, marche-fente', 'Attaque · Feinte, attaque composée', 'Défense · Parade et riposte', 'Défense · Garder la distance (rompre)', 'Prise d\'informations (lire l\'adversaire)', 'Choix d\'action (attaque, contre, attente)', 'Garde et déplacements', 'Rôles · Sécurité, salut, respect', 'Rôles · Arbitre'] },
  lutte: { n: 'Lutte', c: ['Attaque · Déséquilibrer, amener au sol', 'Attaque · Retourner (mettre en danger)', 'Attaque · Immobiliser', 'Attaque · Enchaîner les actions', 'Défense · Se protéger (rester à plat ventre, en boule)', 'Défense · Se dégager, contrer', 'Prise d\'informations (appuis, poids de l\'adversaire)', 'Choix d\'action', 'Rôles · Règle d\'or : sécurité, respect', 'Rôles · Arbitre'] },
  co: { n: 'Course d\'orientation', c: ['Orienter la carte', 'Lire les symboles, la légende', 'Choisir un itinéraire', 'Se situer en permanence', 'Gérer son allure', 'Contrôler / poinçonner', 'Respect des consignes de sécurité'] }
};
const valSplit = n => { const m = /^([^·]{2,20}) · (.+)$/.exec(n); return m ? [m[1].trim(), m[2]] : [null, n]; };
const VAL_SEC = { Attaque: '#D64545', 'Défense': '#1E5BD8', 'Rôles': '#8E44AD' };
const VD = () => { if (!DB.valid || typeof DB.valid !== 'object') DB.valid = {}; const v = DB.valid; v.crit = v.crit || {}; v.v = v.v || {}; return v; };
const valCrit = tool => { const v = VD(); if (!Array.isArray(v.crit[tool])) v.crit[tool] = VAL_TOOLS[tool].c.map((n, i) => ({ id: 'c' + i, n })); return v.crit[tool]; };
const valOf = (tool, cls) => { const v = VD(); v.v[tool] = v.v[tool] || {}; return (v.v[tool][cls] = v.v[tool][cls] || {}); };
const valLvls = o => Object.keys(o || {}).filter(k => k[0] !== '_').map(k => o[k]).filter(x => x != null);

function openValid(tool) {
  const T = VAL_TOOLS[tool]; if (!T) return;
  if (!DB.classes.length) return toast('Créez d\'abord une classe');
  let cls = DB.classes.some(c => c.name === DB.lastClass) ? DB.lastClass : DB.classes[0].name, si = 0, view = 'eleve', undo = null;
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:300;background:var(--bg,#fff);overflow:auto;padding:14px 14px 40px';
  document.body.appendChild(o);
  const close = () => { o.remove(); };
  const commit = () => { save(); window.syncFlush && window.syncFlush(); };
  const sync = (n, V) => { const L = valLvls(V); if (typeof saveResult !== 'function') return; const av = epsMAvg(L);
    if (av == null) return; const C = valCrit(tool);
    saveResult({ key: `valid|${tool}|${cls}|${n}`, tool, label: T.n + ' · validation enseignant', classe: cls, eleve: n, valeur: EPS_M[av][0],
      detail: C.filter(c => V[c.id] != null).map(c => `${c.n} : ${EPS_M[V[c.id]][2]}`).join(' · ') }); };
  const draw = () => {
    const st = studentsOf(cls), C = valCrit(tool), all = valOf(tool, cls); if (si >= st.length) si = 0; const n = st[si], V = all[n] || {};
    const L = valLvls(V), av = epsMAvg(L);
    o.innerHTML = `<div style="display:flex;align-items:center;gap:8px;max-width:900px;margin:0 auto"><h2 style="flex:1;margin:0;font-size:1.15rem">✅ Validation enseignant · ${esc(T.n)}</h2><button class="btn btn-ghost" style="flex:0 0 auto" data-q>✕ Fermer</button></div>
      <div style="max-width:900px;margin:10px auto 0">
      <div class="card"><div class="row"><div><label style="margin-top:0">Classe</label><select id="vc">${DB.classes.map(c => `<option ${c.name === cls ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        ${view === 'eleve' ? `<div><label style="margin-top:0">Élève</label><select id="ve">${st.map((x, k) => { const q = epsMAvg(valLvls(all[x])); return `<option value="${k}" ${k === si ? 'selected' : ''}>${q != null ? '✓ ' : ''}${esc(x)}</option>`; }).join('')}</select></div>` : ''}</div>
        <div class="tog" style="margin-top:10px">${[['eleve', '👤 Par élève'], ['classe', '📋 Tableau de la classe'], ['crit', '⚙️ Critères']].map(([k, l]) => `<button data-v="${k}" class="${view === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      ${view === 'eleve' ? (st.length ? `<div class="card" style="margin-top:12px"><div style="display:flex;align-items:center;gap:8px"><button class="btn btn-ghost" style="flex:0 0 auto;padding:8px 12px" id="vp" ${si ? '' : 'disabled'}>◀</button><h3 style="flex:1;margin:0;text-align:center">${esc(n)}</h3><button class="btn btn-ghost" style="flex:0 0 auto;padding:8px 12px" id="vn" ${si < st.length - 1 ? '' : 'disabled'}>▶</button></div>
          ${C.map((c, i) => { const [sec, nm] = valSplit(c.n), prev = i ? valSplit(C[i - 1].n)[0] : null;
            return `${sec && sec !== prev ? `<div style="margin-top:12px;font-size:.78rem;font-weight:900;text-transform:uppercase;letter-spacing:.05em;color:${VAL_SEC[sec] || 'var(--muted)'}">${esc(sec)}</div>` : ''}<div data-crow="${c.id}" style="padding:10px 0;border-top:1px solid var(--line)"><div style="font-weight:800;margin-bottom:6px">${esc(nm)} ${epsMTag(V[c.id])}</div>${epsMBar(V[c.id], 'data-vm')}</div>`; }).join('')}
          <div style="margin-top:10px;padding-top:10px;border-top:2px solid var(--line)">${av != null ? `Bilan : <b style="color:${EPS_M[av][1]}">${EPS_M[av][0]}</b> <span class="muted" style="font-size:.8rem">(${L.length}/${C.length} critères · enregistré dans Résultats des élèves)</span>` : '<span class="muted">Touchez un niveau pour chaque critère observé.</span>'}</div>
          <div class="row" style="margin-top:10px;gap:6px">${L.length ? '<button class="btn btn-ghost" style="padding:9px" id="vclr">🗑 Effacer la validation de cet élève</button>' : ''}${si < st.length - 1 ? '<button class="btn btn-grad" style="padding:9px" id="vnext">Élève suivant →</button>' : ''}</div>
          ${undo ? `<button class="btn btn-ghost btn-block" style="margin-top:8px" id="vund">↶ Annuler : ${esc(undo.l)}</button>` : ''}</div>` : '<div class="card empty" style="margin-top:12px">Classe vide.</div>')
      : view === 'classe' ? `<div class="card sheet-table" style="margin-top:12px;overflow:auto"><table><tr><th>Élève</th>${C.map((c, i) => `<th title="${esc(c.n)}">C${i + 1}</th>`).join('')}<th>Bilan</th></tr>
          ${st.map((x, k) => { const W = all[x] || {}, q = epsMAvg(valLvls(W)); return `<tr><td><button class="link" data-go="${k}">${esc(x)}</button></td>${C.map(c => `<td>${W[c.id] != null ? `<span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${EPS_M[W[c.id]][1]}" title="${EPS_M[W[c.id]][0]}"></span>` : '<span class="muted">·</span>'}</td>`).join('')}<td>${q != null ? epsMTag(q) : ''}</td></tr>`; }).join('')}</table>
          <div class="muted" style="font-size:.78rem;margin-top:8px">${C.map((c, i) => `C${i + 1} : ${esc(c.n)}`).join(' · ')}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">${EPS_M.map(([l, c]) => `<span style="display:inline-flex;align-items:center;gap:4px;font-size:.78rem"><i style="width:12px;height:12px;border-radius:50%;background:${c};display:inline-block"></i>${l}</span>`).join('')}</div>
          <button class="btn btn-ghost btn-block" style="margin-top:10px" id="vcsv">📤 Exporter (CSV)</button></div>`
      : `<div class="card" style="margin-top:12px"><b>⚙️ Critères observés</b><div class="muted" style="font-size:.8rem">Modifiez, ajoutez ou retirez des critères (pour toutes les classes). Astuce : « Attaque · … », « Défense · … » ou « Rôles · … » range le critère dans une rubrique.</div>
          ${C.map((c, i) => `<div class="row" style="margin-top:8px;gap:6px"><input data-cn="${c.id}" value="${esc(c.n)}" style="flex:3"><button class="btn btn-ghost" style="flex:0 0 auto;padding:8px" data-cu="${i}" ${i ? '' : 'disabled'}>↑</button><button class="btn btn-ghost" style="flex:0 0 auto;padding:8px" data-cx="${c.id}">🗑</button></div>`).join('')}
          <div class="row" style="margin-top:10px;gap:6px"><input id="cnew" placeholder="Nouveau critère…" style="flex:3"><button class="btn btn-grad" style="flex:0 0 auto" id="cadd">＋ Ajouter</button></div>
          <button class="btn btn-ghost btn-block" style="margin-top:10px" id="cdef">↺ Revenir aux critères proposés</button>
          ${undo ? `<button class="btn btn-ghost btn-block" style="margin-top:8px" id="vund">↶ Annuler : ${esc(undo.l)}</button>` : ''}</div>`}
      </div>`;
    const $ = s => o.querySelector(s), A = s => o.querySelectorAll(s), snap = l => { undo = { l, v: JSON.stringify(VD()) }; };
    $('[data-q]').onclick = close;
    $('#vc').onchange = e => { cls = e.target.value; DB.lastClass = cls; si = 0; save(); draw(); };
    if ($('#ve')) $('#ve').onchange = e => { si = +e.target.value; draw(); };
    A('[data-v]').forEach(b => b.onclick = () => { view = b.dataset.v; draw(); });
    if ($('#vp')) $('#vp').onclick = () => { si--; draw(); };
    if ($('#vn')) $('#vn').onclick = () => { si++; draw(); };
    if ($('#vnext')) $('#vnext').onclick = () => { si++; draw(); o.scrollTo(0, 0); };
    A('[data-crow]').forEach(row => { const c = C.find(x => x.id === row.dataset.crow); if (!c) return;
      row.querySelectorAll('[data-vm]').forEach(b => b.onclick = () => { const lv = +b.dataset.vm, W = all[n] = all[n] || {}; if (W[c.id] === lv) delete W[c.id]; else W[c.id] = lv; W._t = Date.now(); commit(); sync(n, W); const y = o.scrollTop; draw(); o.scrollTop = y; }); });
    if ($('#vclr')) $('#vclr').onclick = () => { if (!confirm(`Effacer la validation de ${n} ?`)) return; snap('validation de ' + n + ' effacée'); delete all[n]; commit(); draw(); };
    if ($('#vund')) $('#vund').onclick = () => { DB.valid = JSON.parse(undo.v); undo = null; commit(); draw(); };
    A('[data-go]').forEach(b => b.onclick = () => { si = +b.dataset.go; view = 'eleve'; draw(); });
    if ($('#vcsv')) $('#vcsv').onclick = () => { const st = studentsOf(cls); download(`validation-${tool}-${cls}.csv`.replace(/[^\w.-]+/g, '-'), csv([['Élève', ...C.map(c => c.n), 'Bilan'], ...st.map(x => { const W = all[x] || {}, q = epsMAvg(valLvls(W)); return [x, ...C.map(c => W[c.id] != null ? EPS_M[W[c.id]][0] : ''), q != null ? EPS_M[q][0] : '']; })])); };
    A('[data-cn]').forEach(i => i.onchange = () => { const c = C.find(x => x.id === i.dataset.cn); if (c && i.value.trim()) { c.n = i.value.trim(); commit(); } });
    A('[data-cu]').forEach(b => b.onclick = () => { const i = +b.dataset.cu; [C[i - 1], C[i]] = [C[i], C[i - 1]]; commit(); draw(); });
    A('[data-cx]').forEach(b => b.onclick = () => { const c = C.find(x => x.id === b.dataset.cx); if (!confirm(`Retirer le critère « ${c.n} » ? (les niveaux déjà donnés pour ce critère ne comptent plus)`)) return; snap('critère retiré'); VD().crit[tool] = C.filter(x => x !== c); commit(); draw(); });
    if ($('#cadd')) $('#cadd').onclick = () => { const v = $('#cnew').value.trim(); if (!v) return; C.push({ id: 'u' + Date.now().toString(36), n: v }); commit(); draw(); };
    if ($('#cdef')) $('#cdef').onclick = () => { if (!confirm('Revenir aux critères proposés par l\'appli ?')) return; snap('critères réinitialisés'); delete VD().crit[tool]; commit(); draw(); };
  };
  draw();
}

/* Bouton ✅ dans l'en-tête des outils concernés (protégé par le code enseignant) */
Object.keys(VAL_TOOLS).forEach(k => { const orig = TOOL_IMPL[k]; if (!orig) return;
  TOOL_IMPL[k] = function (el, ...a) { const r = orig.call(this, el, ...a), h = document.querySelector('#screen header'), star = document.getElementById('screen-star');
    document.getElementById('val-btn')?.remove();
    if (h && star) { const b = document.createElement('button'); b.id = 'val-btn'; b.className = 'icon-btn'; b.setAttribute('data-prof', ''); b.title = 'Validation enseignant'; b.setAttribute('aria-label', 'Validation enseignant'); b.textContent = '✅'; b.onclick = () => openValid(k); h.insertBefore(b, star); }
    return () => { document.getElementById('val-btn')?.remove(); if (typeof r === 'function') r(); }; }; });
