/* =========================================================
   EPS ONE — Outil « Duathlon athlétique »
   Groupes duo/trio/quatuor · 3 étapes · points de lancers ·
   tours · temps par étape + cumul · pénalités lancers / course
   ========================================================= */
DB.duathlon = DB.duathlon || { seances: [], current: null };
ICONS.duathlon = '<circle cx="7" cy="5" r="2"/><path d="M6 8 4 13l3 1 1 6M6 8l4 3 3-1"/><path d="M14.5 14.5 21 8"/><circle cx="19" cy="17" r="2.5"/>';
// Vue « tablette d'un groupe » (athlétisme) : gros compteurs et champs tactiles
if (!document.getElementById('gv-ath')) document.head.insertAdjacentHTML('beforeend', `<style id="gv-ath">
.gv-cnt{display:flex;align-items:center;gap:10px;margin-top:10px}
.gv-cnt .l{flex:1;font-weight:800;text-align:left}
.gv-cnt .btn{min-width:64px;min-height:56px;font-size:1.45rem;padding:0 12px}
.gv-cnt b{min-width:46px;text-align:center;font-size:1.8rem;font-variant-numeric:tabular-nums}
.gv-in{width:84px;padding:12px 6px;text-align:center;font-size:1.3rem;font-weight:800}
.gv-big{font-size:1.2rem;padding:16px;margin-top:12px}
</style>`);
/* Objectifs affichés sous les boutons d'étape (aide pour les élèves) */
/* Points de lancers à atteindre (en groupe) avant de pouvoir courir : réglables à la préparation */
const DUA_SEUIL = [15, 20, 30];
const duaSeuil = (c, e) => { const v = c && Array.isArray(c.seuil) ? +c.seuil[e] : NaN; return v > 0 ? v : DUA_SEUIL[e]; };
/* Tours comptés en commun (une seule case pour le binôme / groupe) : étape 3 par défaut */
const duaCommun = (c, e) => c && Array.isArray(c.tc) ? !!c.tc[e] : e === 2;
const DUA_OBJ = ['6 tours en relais', '8 tours en relais', '8 tours en binômes'];
const duaObj = (k, c) => `<small style="display:block;font-weight:600;font-size:.72rem;opacity:.75;margin-top:3px;line-height:1.2">${duaSeuil(c, k)} points de lancers · ${DUA_OBJ[k]}</small>`;
const dmss = s => { if (s == null || isNaN(s)) return '–'; s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

/* ---- Potentiel VMA et coefficient de performance / maîtrise ---- */
const DUA_DIST = 4400;   // distance d'épreuve par défaut (m)
/* Formule unique (à modifier ici si besoin) :
   vitesse réalisée (km/h) = distance (km) ÷ temps cumulé des 3 étapes (h, pénalités comprises)
   VMA moyenne du groupe   = potentiel VMA (somme des VMA) ÷ nombre d'élèves
   coefficient             = vitesse réalisée ÷ VMA moyenne  (affiché en %)
   Si une VMA manque : pas de coefficient (un potentiel incomplet fausserait la comparaison entre groupes). */
function duaCoef(distM, tempsS, vmas) {
  const known = vmas.filter(v => v != null), pot = known.reduce((a, v) => a + v, 0);
  const R = { pot, n: vmas.length, manque: vmas.length - known.length, vMoy: known.length ? pot / known.length : null,
    vReal: tempsS > 0 ? (distM / 1000) / (tempsS / 3600) : null, coef: null };
  if (!R.manque && R.n && R.vMoy && R.vReal) R.coef = R.vReal / R.vMoy;
  return R;
}
const DUA_FORMULE = `<b>Coefficient de maîtrise</b> = vitesse réalisée ÷ VMA moyenne du groupe.<br>Vitesse réalisée = distance d'épreuve ÷ temps cumulé des 3 étapes (pénalités comprises) ; VMA moyenne = potentiel VMA (somme des VMA des membres) ÷ nombre d'élèves.<br>Ex. : 4,4 km en 22:00 → 12 km/h ; duo 11 + 13 = potentiel 24 km/h → VMA moyenne 12 km/h → 100 %.<br>Si la VMA d'un membre manque, le coefficient du groupe n'est pas calculé (« VMA manquante »).`;
const duaFr = (n, d = 1) => n == null || isNaN(n) ? '–' : n.toLocaleString('fr-FR', { maximumFractionDigits: d });
const duaPct = c => c == null ? '–' : Math.round(c * 100) + ' %';
const duaDd = d => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
const duaNum = v => { const m = String(v ?? '').replace(',', '.').match(/\d+(\.\d+)?/), n = m ? +m[0] : NaN; return n >= 3 && n <= 30 ? n : null; };
// dernière VMA connue d'un élève : Test VMA / calcul VMA (« Résultats des élèves ») ou colonne « VMA » d'un tableau de suivi
function duaFoundVma(cls, n) {
  let best = null; const take = (v, d, src) => { if (v != null && (!best || d > best.d)) best = { v, d, src }; };
  (DB.resultats || []).forEach(r => { if ((r.tool === 'testvma' || r.tool === 'vma') && r.eleve === n && (!r.classe || r.classe === cls))
    take(duaNum(r.valeur), r.date || 0, `${r.tool === 'testvma' ? 'Test VMA' : 'Calcul VMA'} du ${duaDd(r.date || 0)}`); });
  const S = (DB.suivi || {})[cls];
  if (S && Array.isArray(S.cols)) S.cols.forEach((c, k) => { if (/vma/i.test(c.title || '')) { const d = c.date ? new Date(c.date + 'T12:00').getTime() : 0; take(duaNum(S.vals[k + '|' + n]), d, `Suivi « ${c.title} »${d ? ' du ' + duaDd(d) : ''}`); } });
  return best;
}
// VMA de la classe (synchronisées : DB.duathlon.vma[classe][élève] = { v, src, d, auto }) ; les valeurs automatiques suivent le dernier test
function duaVmaSync(cls, force) {
  const V = DB.duathlon.vma = DB.duathlon.vma || {}; if (!cls) return {};
  const K = V[cls] = V[cls] || {}; let ch = false;
  studentsOf(cls).forEach(n => { const f = duaFoundVma(cls, n), o = K[n];
    if (f && (force || !o || (o.auto && (f.d > o.d || f.v !== o.v)))) { K[n] = { v: f.v, src: f.src, d: f.d, auto: true }; ch = true; } });
  if (ch) save(); return K;
}

TOOL_IMPL.duathlon = function (el) {
  let tab = 'seance', iv, rk = 'temps';
  const D = liveDB(() => DB.duathlon = DB.duathlon || { seances: [], current: null });   // toujours l'objet synchronisé actuel
  function frame() {
    el.innerHTML = `<div class="co-tabs">${[['seance', '⏱ Épreuve'], ['resultats', '📊 Résultats']].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div><div id="d-body"></div>`;
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; frame(); });
    const box = el.querySelector('#d-body');
    if (tab === 'seance') D.current ? live(box) : prepare(box); else results(box);
  }

  /* ---- Calculs ---- */
  const mem = (g, e, n) => g.etapes[e].m[n];
  const stepOf = (c, g, e) => {
    const E = g.etapes[e], ms = g.members.map(n => E.m[n]);
    const pts = ms.reduce((a, m) => a + m.pts, 0), tours = duaCommun(c, e) ? (E.tc || 0) : ms.reduce((a, m) => a + m.tours, 0);
    const inval = ms.reduce((a, m) => a + m.inval, 0), penC = ms.reduce((a, m) => a + m.penC, 0);
    const temps = E.dep && E.arr ? (E.arr - E.dep) / 1000 : null;
    const penS = c.optC ? penC * c.secC : 0;
    return { pts, tours, inval, boucles: c.optL ? inval * c.boucles : 0, penC, penS, temps, total: temps != null ? temps + penS : null };
  };
  const totalOf = (c, g) => { const st = [0, 1, 2].map(e => stepOf(c, g, e));
    return { st, pts: st.reduce((a, x) => a + x.pts, 0), tours: st.reduce((a, x) => a + x.tours, 0), boucles: st.reduce((a, x) => a + x.boucles, 0),
      penS: st.reduce((a, x) => a + x.penS, 0), temps: st.every(x => x.total != null) ? st.reduce((a, x) => a + x.total, 0) : null,
      partiel: st.reduce((a, x) => a + (x.total || 0), 0), done: st.filter(x => x.total != null).length }; };
  // VMA d'un membre : celle figée dans le groupe au lancement (g.vma), sinon celle de la classe
  const vmaOf = (g, n, cls) => { const v = g.vma && g.vma[n]; if (v != null) return v; const K = ((DB.duathlon.vma || {})[cls] || {})[n]; return K ? K.v : null; };
  const potOf = (C, g, T) => { const R = duaCoef(C.cfg.dist || DUA_DIST, T.temps, g.members.map(n => vmaOf(g, n, C.classe)));
    R.miss = g.members.filter(n => vmaOf(g, n, C.classe) == null); return R; };
  const potTxt = R => R.manque ? `<span style="color:var(--danger);font-weight:700">⚠️ VMA manquante : ${R.miss.map(esc).join(', ')}</span>`
    : `⚡ Potentiel VMA <b style="color:var(--text)">${duaFr(R.pot)} km/h</b> (VMA moy. ${duaFr(R.vMoy)})${R.coef != null ? ` · ${duaFr(R.vReal)} km/h réalisés → <b style="color:var(--text)">${duaPct(R.coef)} de la VMA moyenne</b>` : ''}`;
  const snapVma = (cls, members) => { const K = duaVmaSync(cls); return Object.fromEntries(members.filter(n => K[n]).map(n => [n, K[n].v])); };

  /* ---- Carte « ⚡ VMA des élèves » (préparation et vue enseignant) ---- */
  let vmaOpen = false;
  function vmaCard(host, cls, names, onChange) {
    if (!host) return; if (!cls) { host.innerHTML = ''; return; }
    const K = duaVmaSync(cls), L = [...new Set([...studentsOf(cls), ...(names || [])])], miss = L.filter(n => !K[n]).length;
    host.innerHTML = `<div class="card" data-cfg style="margin-top:12px"><details ${vmaOpen ? 'open' : ''}><summary style="cursor:pointer"><b>⚡ VMA des élèves</b> <span class="muted">· ${esc(cls)} · ${L.length - miss}/${L.length} renseignée${L.length - miss > 1 ? 's' : ''}${miss ? ` · <span style="color:var(--danger)">${miss} manquante${miss > 1 ? 's' : ''}</span>` : ''}</span></summary>
        <p class="muted" style="font-size:.78rem;margin:8px 0 6px">Reprises automatiquement du dernier Test VMA enregistré (Résultats des élèves), modifiables. <b>Potentiel VMA</b> d'un groupe = somme des VMA de ses membres.</p>
        <div class="sheet-table"><table><tr><th>Élève</th><th>VMA (km/h)</th><th>Source</th></tr>
        ${L.map((n, i) => `<tr><td><b>${esc(n)}</b></td><td><input type="number" step="0.5" min="0" inputmode="decimal" data-vma="${i}" value="${K[n] ? K[n].v : ''}" placeholder="—" style="width:80px;padding:6px;text-align:center"></td><td class="muted" style="font-size:.75rem" data-vsrc="${i}">${K[n] ? esc(K[n].src) : '<span style="color:var(--danger)">VMA manquante</span>'}</td></tr>`).join('')}</table></div>
        <button class="btn btn-ghost btn-block" style="margin-top:8px" data-vre>↻ Reprendre les VMA du Test VMA</button>
        <p class="muted" style="font-size:.74rem;margin:8px 0 0">${DUA_FORMULE}</p></details></div>`;
    const dt = host.querySelector('details'); dt.ontoggle = () => { vmaOpen = dt.open; };
    const after = n => setTimeout(() => { const a = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.vma : null;
      if (onChange) onChange(n); else vmaCard(host, cls, names, onChange);
      if (a != null) { const i = document.querySelector(`[data-vma="${a}"]`); if (i) i.focus(); } });
    host.querySelectorAll('[data-vma]').forEach(inp => inp.onchange = () => { const n = L[+inp.dataset.vma], v = parseFloat(String(inp.value).replace(',', '.'));
      if (v > 0) K[n] = { v: Math.round(v * 10) / 10, src: 'Saisie manuelle du ' + duaDd(Date.now()), d: Date.now() }; else delete K[n];
      save(); after(n); });
    host.querySelector('[data-vre]').onclick = () => {
      if (!L.some(n => duaFoundVma(cls, n))) return toast('Aucune VMA trouvée dans les résultats du Test VMA pour cette classe');
      if (!confirm('Remplacer les VMA par celles du dernier Test VMA (les saisies manuelles des élèves testés seront remplacées) ?')) return;
      duaVmaSync(cls, true); toast('VMA reprises du Test VMA ✔'); after(null); };
  }

  /* ---- Séance partagée avec les autres tablettes (modèle sans résultats) ---- */
  const blankM = () => ({ pts: 0, tours: 0, inval: 0, penC: 0 });
  const pub = (C, create) => { if (C.joined) return;
    partPublish('duathlon', C.id, { nom: C.nom, classe: C.classe, ng: C.groups.length, ep: `3 étapes${C.cfg.optL ? ` · ${C.cfg.boucles} boucle(s) / lancer ✗` : ''}${C.cfg.optC ? ` · pén. course ${C.cfg.secC} s` : ''}`,
      tpl: { nom: C.nom, classe: C.classe, cfg: C.cfg, groups: C.groups.map(g => ({ name: g.name, members: g.members, vma: g.vma || {} })) } }, create); };
  const join = (box, p) => { const T = p.tpl;
    D.current = { id: p.id, date: Date.now(), nom: T.nom, classe: T.classe, cfg: T.cfg, etape: 0, joined: true,
      groups: T.groups.map(g => ({ name: g.name, members: [...g.members], vma: { ...(g.vma || {}) }, etapes: [0, 1, 2].map(() => ({ dep: null, arr: null, m: Object.fromEntries(g.members.map(n => [n, blankM()])) })) })) };
    save(); partPickGroup(box, D.current.groups, i => { if (!D.current) return prepare(box); D.current.only = i; save(); live(box); }); };

  /* ---- Préparation ---- */
  let duaManual = false;
  function prepare(box) {
    const c = D.lastCfg || { optL: true, boucles: 1, optC: false, secC: 10 };
    box.innerHTML = `<div class="card" data-cfg><h3>Nouvelle épreuve de duathlon</h3>
        <label>Nom</label><input id="nm" value="Duathlon ${new Date().toLocaleDateString('fr-FR')}">
        <label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="ol" ${c.optL ? 'checked' : ''} style="width:auto"> Pénalité lancers : petite boucle par lancer non valide</label>
        <div id="olw"><label>Tours de petite boucle par lancer non valide</label><input id="bo" type="number" min="1" value="${c.boucles}"></div>
        <label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="oc" ${c.optC ? 'checked' : ''} style="width:auto"> Pénalité de course (secondes ajoutées)</label>
        <div id="ocw"><label>Secondes par pénalité</label><input id="sc" type="number" min="1" value="${c.secC}"></div>
        <label>🎯 Points de lancers à atteindre en groupe avant de courir</label><div class="row">${[0, 1, 2].map(k => `<div><label style="margin-top:0;font-size:.8rem">Étape ${k + 1}</label><input id="se${k}" type="number" min="1" value="${duaSeuil(c, k)}"></div>`).join('')}</div>
        <p class="muted" style="margin:4px 0 0;font-size:.8rem">Tant que le groupe n'a pas atteint ces points, les boutons ＋/− des tours sont bloqués.</p>
        <label>🏃 Tours comptés en commun (une seule case pour le binôme / groupe)</label><div class="row">${[0, 1, 2].map(k => `<label style="display:flex;gap:6px;align-items:center;margin:4px 0;font-weight:700;color:var(--text)"><input type="checkbox" id="tc${k}" ${duaCommun(c, k) ? 'checked' : ''} style="width:auto"> Étape ${k + 1}</label>`).join('')}</div>
        <p class="muted" style="margin:2px 0 0;font-size:.8rem">Coché : les élèves qui courent ensemble cochent <b>un seul</b> compteur de tours (ex. étape 3 : 8 tours en binôme, pas 8 + 8).</p>
        <label>Distance d'épreuve (m) — pour le coefficient de maîtrise</label><input id="di" type="number" min="100" step="100" value="${c.dist || DUA_DIST}"></div>
      <div class="card" data-cfg style="margin-top:12px"><h3>Groupes</h3><label style="margin-top:0">Taille des groupes</label><div class="seg" id="sz">${[[2, 'Duos'], [3, 'Trios'], [4, 'Quatuors']].map(([n, l]) => `<button data-n="${n}">${l}</button>`).join('')}</div><div id="cmp" style="margin-top:6px"></div></div>
      <div class="card" data-cfg style="margin-top:12px"><label style="margin-top:0">Déroulement</label><div class="seg" id="dmode"><button data-dm="live" class="${duaManual ? '' : 'on'}">⏱ Épreuve en direct (tablettes)</button><button data-dm="man" class="${duaManual ? 'on' : ''}">${SP_BTN.replace(' (', '<br><small>(').replace(')', ')</small>')}</button></div></div>
      <div id="vmac"></div>`;
    const $ = s => box.querySelector(s);
    box.querySelectorAll('[data-dm]').forEach(b => b.onclick = () => { duaManual = b.dataset.dm === 'man'; box.querySelectorAll('[data-dm]').forEach(x => x.classList.toggle('on', x === b)); const g = box.querySelector('#dua-go'); if (g) g.textContent = duaManual ? '✍️ Former les groupes et saisir les résultats' : '▶ Former les groupes et commencer'; });
    const vis = () => { $('#olw').style.display = $('#ol').checked ? 'block' : 'none'; $('#ocw').style.display = $('#oc').checked ? 'block' : 'none'; };
    $('#ol').onchange = $('#oc').onchange = vis; vis();
    mountComposer($('#cmp'), { id: 'dua', modes: ['random', 'hetero', 'homo'], button: '▶ Former les groupes et commencer',
      onTeams: teams => {
        const cfg = { optL: $('#ol').checked, boucles: Math.max(1, +$('#bo').value || 1), optC: $('#oc').checked, secC: Math.max(1, +$('#sc').value || 10), dist: Math.max(100, +$('#di').value || DUA_DIST), seuil: [0, 1, 2].map(k => Math.max(1, +$('#se' + k).value || DUA_SEUIL[k])), tc: [0, 1, 2].map(k => $('#tc' + k).checked) };
        D.lastCfg = cfg;
        const blank = () => ({ pts: 0, tours: 0, inval: 0, penC: 0 }), cls = $('#dua-cls')?.value || '';
        D.current = { id: Date.now().toString(36), date: Date.now(), nom: $('#nm').value.trim() || 'Duathlon', classe: cls, cfg, etape: 0,
          groups: teams.map(t => { const members = t.members.map(m => m.n);
            return { name: t.name.replace('Équipe', 'Groupe'), members, vma: snapVma(cls, members), etapes: [0, 1, 2].map(() => ({ dep: null, arr: null, m: Object.fromEntries(members.map(n => [n, blank()])) })) }; }) };
        if (duaManual) D.current.manual = true; else pub(D.current, true); save(); live(box);
      } });
    const setSize = n => { $('#dua-k').value = 's'; $('#dua-v').value = n; box.querySelectorAll('#sz [data-n]').forEach(b => b.classList.toggle('on', +b.dataset.n === n)); };
    box.querySelectorAll('#sz [data-n]').forEach(b => b.onclick = () => setSize(+b.dataset.n)); setSize(2);
    const vc = () => vmaCard($('#vmac'), $('#dua-cls')?.value || '');
    if ($('#dua-cls')) $('#dua-cls').addEventListener('change', vc); vc();
    partMount(box, 'duathlon', p => join(box, p));
    if (typeof partOutboxCard === 'function') { const ob = document.createElement('div'); box.prepend(ob); partOutboxCard(ob, 'duathlon', () => D.seances, rec => D.seances.push(rec)); }
  }

  /* ---- Épreuve en direct ---- */
  function live(box) {
    const C = D.current, c = C.cfg;
    const hasData = g => g.etapes.some(E => E.dep || E.tc || Object.values(E.m).some(m => m.pts || m.tours || m.inval || m.penC));
    const saveSeance = () => {
      // seuls les groupes ayant des résultats sont enregistrés (une tablette par groupe → pas de lignes vides)
      const done = C.groups.filter(hasData); if (!done.length) return toast('Aucun groupe n\'a de résultat');
      if (C.only != null && done.some(g => g.etapes.some(E => E.dep && !E.arr)) && !confirm('Une étape n\'est pas terminée (pas d\'arrivée). Enregistrer quand même ?')) return;
      const rec = { ...C, id: C.id + '-' + Math.random().toString(36).slice(2, 6), groups: done }; delete rec.only; delete rec.joined;   // id unique par tablette (fusion de synchro par id)
      D.seances.push(rec); const wasGroup = C.only != null; D.current = null;
      if (typeof partOutboxAdd === 'function') partOutboxAdd('duathlon', rec, `${done.map(g => g.name).join(', ')} · ${C.nom}`);
      // synthèse « Résultats des élèves » : une ligne par élève des groupes enregistrés
      done.forEach(g => { const T = totalOf(c, g), R = potOf(C, g, T), vt = R.manque ? ' · VMA manquante' : ` · potentiel VMA ${duaFr(R.pot)} km/h${R.coef != null ? ` · coef. maîtrise ${duaPct(R.coef)} (${duaFr(R.vReal)} km/h sur ${duaFr((c.dist || DUA_DIST) / 1000, 2)} km)` : ''}`; g.members.forEach(n => { const P = [0, 1, 2].reduce((a, e) => { const m = g.etapes[e].m[n] || {}; a.pts += m.pts || 0; a.tours += duaCommun(c, e) ? (g.etapes[e].tc || 0) : (m.tours || 0); return a; }, { pts: 0, tours: 0 });
        saveResult({ tool: 'duathlon', label: 'Duathlon athlétique', classe: C.classe, eleve: n, valeur: T.temps != null ? `${dmss(T.temps)} (temps groupe)` : `${dmss(T.partiel)} (${T.done}/3 étapes)`,
          detail: `${g.name} · groupe ${T.pts} pts · ${T.tours} tours · perso ${P.pts} pts · ${P.tours} tours${T.boucles ? ` · ${T.boucles} boucle(s)` : ''}${T.penS ? ` · +${T.penS} s` : ''}${vt}` }); }); });
      save(); clearInterval(iv); const s0 = typeof partSync === 'function' && partSync(); if (s0 && s0.send) s0.send(); toast('Duathlon enregistré ✔'); tab = wasGroup ? 'seance' : 'resultats'; frame(); };
    // Suivi des tablettes des groupes : résultats reçus pour cette séance (même séance partagée = même identifiant)
    const recvHTML = () => { if (C.joined || !partGet(C.id) && !D.seances.some(r => String(r.id).startsWith(C.id + '-'))) return '';
      const got = new Set(D.seances.filter(r => String(r.id).startsWith(C.id + '-')).flatMap(r => (r.groups || []).map(g => g.name)));
      return `<div class="card" style="margin-top:12px"><h3 style="margin-top:0">📥 Résultats reçus des tablettes : ${C.groups.filter(g => got.has(g.name)).length} / ${C.groups.length}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${C.groups.map(g => `<span class="pill" style="font-size:.85rem;padding:6px 10px;${got.has(g.name) ? 'background:rgba(27,158,90,.15);color:#1B9E5A' : ''}">${got.has(g.name) ? '✅' : '⏳'} ${esc(g.name)}</span>`).join('')}</div>
        <p class="muted" style="font-size:.78rem;margin:8px 0 0">⏳ = pas encore reçu : le groupe doit toucher « 💾 Enregistrer », et sa tablette avoir du réseau.</p></div>`; };
    /* ✍️ Saisie des résultats prof (sans lancer l'épreuve) : par groupe, temps des 3 étapes (ou temps total), points de lancers, tours */
    if (C.manual) {
      clearInterval(window._duaTick);
      spTable(box, { title: `Saisie des résultats · ${C.nom}`, who: 'Groupe', rows: C.groups.map(g => ({ label: g.name, sub: g.members.join(', ') })),
        help: 'Temps de chaque étape (ex. 3:25), ou seulement le temps total. Points de lancers et tours : total du groupe. Les lignes vides sont ignorées.',
        fields: [{ k: 't1', l: 'Étape 1', type: 'time' }, { k: 't2', l: 'Étape 2', type: 'time' }, { k: 't3', l: 'Étape 3', type: 'time' }, { k: 'tt', l: 'ou temps total', type: 'time' },
          { k: 'pts', l: 'Points lancers', type: 'num' }, { k: 'tours', l: 'Tours', type: 'num' }],
        cancelLbl: 'Annuler (rien n\'est enregistré)',
        onCancel: () => { if (!confirm('Abandonner cette saisie ? Rien ne sera enregistré.')) return; D.current = null; save(); frame(); },
        onSave: V => { V.forEach((v, gi) => { const g = C.groups[gi], ts = [v.t1, v.t2, v.t3];
            if (ts.every(x => x == null) && v.tt != null) ts.splice(0, 3, v.tt, 0, 0);
            ts.forEach((t, e) => { if (t == null) return; const E = g.etapes[e]; E.dep = 1; E.arr = 1 + Math.round(t * 1000); });
            const m0 = g.etapes[0].m[g.members[0]]; if (m0) { if (v.pts != null) m0.pts = Math.round(v.pts); if (v.tours != null) m0.tours = Math.round(v.tours); } });
          delete C.manual; saveSeance(); } });
      return;
    }
    const etT = E => E.dep ? ((E.arr || Date.now()) - E.dep) / 1000 : 0;
    // Vue « un seul groupe » : ce que voient les élèves sur leur tablette
    const drawGroup = () => {
      const gi = C.only, g = C.groups[gi], e = C.etape, E = g.etapes[e], s = stepOf(c, g, e), T = totalOf(c, g);
      const L = [['pts', '🎯 Points lancers'], ...(c.optL ? [['inval', '❌ Lancers non valides']] : []), ...(duaCommun(c, e) ? [] : [['tours', '🏃 Tours']]), ...(c.optC ? [['penC', '⚠️ Pénalités course']] : [])], sv = duaSeuil(c, e), lock = s.pts < sv, com = duaCommun(c, e);
      box.innerHTML = `<div class="card" style="text-align:center"><div style="font-weight:900;font-size:1.3rem">${esc(g.name)}</div><div class="muted">${g.members.map(esc).join(', ')}</div>
          <div class="seg" style="margin-top:10px">${[0, 1, 2].map(k => `<button data-e="${k}" class="${k === e ? 'on' : ''}" style="padding:12px 4px">Étape ${k + 1}${g.etapes[k].arr ? ' ✅' : ''}${duaObj(k, c)}</button>`).join('')}</div>
          <div class="gv-clock" data-live="${gi}" style="color:${E.arr ? '#1B9E5A' : 'inherit'}">${dmss(etT(E))}</div>
          ${!E.dep ? `<button class="btn btn-grad btn-block gv-big" data-go="${gi}">▶ Départ — étape ${e + 1}</button>` : ''}
          ${E.dep && !E.arr ? `<button class="btn btn-danger btn-block gv-big" data-fin="${gi}">🏁 Arrivée — étape ${e + 1}</button>` : ''}
          ${E.arr ? `<div style="margin-top:8px;font-weight:800">✅ Étape ${e + 1} : ${dmss(s.total)}${s.penS ? ` (dont ${s.penS} s de pénalité)` : ''} <button class="link" data-undo="${gi}">↺ annuler</button></div>` : ''}
          <div style="margin-top:10px;padding:10px;border-radius:12px;font-weight:800;${lock ? 'background:rgba(220,38,38,.1);color:var(--danger)' : 'background:rgba(27,158,90,.12);color:#1B9E5A'}">${lock ? `🔒 Course bloquée : ${s.pts} / ${sv} points de lancers` : `✅ ${sv} points atteints : la course est ouverte !`}</div>
          ${com ? `<div class="gv-cnt" style="margin-top:12px;${lock ? 'opacity:.6' : ''}"><span class="l" style="font-size:1.1rem">🏃 Tours ${g.members.length === 2 ? 'du binôme' : 'du groupe'}${lock ? ' 🔒' : ''}<br><small class="muted" style="font-weight:600">un tour = le ${g.members.length === 2 ? 'binôme' : 'groupe'} a couru ensemble</small></span><button class="btn btn-ghost" data-tcd="${gi}"${lock ? ' disabled style="opacity:.35"' : ''}>−</button><b style="font-size:1.6rem">${E.tc || 0}</b><button class="btn btn-grad" data-tci="${gi}"${lock ? ' disabled style="opacity:.35"' : ''}>+</button></div>` : ''}
          ${c.optL && s.boucles ? `<div style="margin-top:8px;font-weight:800;color:var(--danger)">🔁 ${s.boucles} petite(s) boucle(s) de pénalité</div>` : ''}</div>
        ${g.members.map((n, mi) => { const m = mem(g, e, n);
          return `<div class="card" style="margin-top:10px"><b style="font-size:1.2rem">${esc(n)}</b>
            ${L.map(([k, l]) => { const off = k === 'tours' && lock ? ' disabled style="opacity:.35"' : ''; return `<div class="gv-cnt"${k === 'tours' && lock ? ' style="opacity:.6"' : ''}><span class="l">${l}${k === 'tours' && lock ? ' 🔒' : ''}</span><button class="btn btn-ghost" data-dec="${gi}|${mi}|${k}"${off}>−</button><b>${m[k]}</b><button class="btn ${k === 'pts' || k === 'tours' ? 'btn-grad' : 'btn-ghost'}" data-inc="${gi}|${mi}|${k}"${off}>+</button></div>`; }).join('')}</div>`; }).join('')}
        <div class="card" style="margin-top:10px;text-align:center"><b>Groupe · étape ${e + 1}</b> : ${s.pts} pts · ${s.tours} tours${c.optL ? ` · ${s.inval} lancer(s) ✗` : ''}
          <div class="muted" style="margin-top:4px">Cumul ${T.done}/3 étapes : <b style="color:var(--text)">${dmss(T.partiel)}</b> · ${T.pts} pts · ${T.tours} tours</div></div>
        ${T.done === 3 ? (() => { const R = potOf(C, g, T); return `<div class="card" style="margin-top:10px;text-align:center"><b style="font-size:1.1rem">⚡ Bilan des 3 étapes</b>
          ${R.manque ? `<div style="margin-top:6px;color:var(--danger);font-weight:700">⚠️ VMA manquante : ${R.miss.map(esc).join(', ')}</div>` : `<div style="margin-top:6px">Potentiel VMA du groupe : <b>${duaFr(R.pot)} km/h</b> <span class="muted">(VMA moyenne ${duaFr(R.vMoy)} km/h)</span></div>
          <div style="margin-top:4px">Vitesse réalisée : <b>${duaFr(R.vReal)} km/h</b> <span class="muted">(${duaFr((c.dist || DUA_DIST) / 1000, 2)} km en ${dmss(T.temps)})</span></div>
          <div style="margin-top:8px;font-size:1.6rem;font-weight:900">${duaPct(R.coef)}</div><div class="muted">de la VMA moyenne · coefficient de maîtrise</div>`}</div>`; })() : ''}
        ${hasData(g) ? '<button class="btn btn-grad btn-block" style="margin-top:12px" id="save">💾 Enregistrer les résultats du groupe</button>' : ''}
        <div style="text-align:center;margin:18px 0 6px"><button class="link" id="gv-prof">🔒 Mode enseignant</button></div>`;
      bind();
      box.querySelector('#gv-prof').onclick = () => { if (!confirm('Passer en mode enseignant (tous les groupes, réglages) ?')) return; C.only = null; save(); draw(); };
    };
    // actions communes aux deux vues
    const bind = () => {
      const $ = s => box.querySelector(s), all = s => box.querySelectorAll(s), keep = () => save(), e = C.etape, redraw = () => (C.only != null && C.groups[C.only] ? drawGroup() : draw());
      all('[data-e]').forEach(b => b.onclick = () => { C.etape = +b.dataset.e; keep(); redraw(); });
      all('[data-go]').forEach(b => b.onclick = () => { C.groups[+b.dataset.go].etapes[e].dep = Date.now(); beep(1300, .3); keep(); redraw(); });
      all('[data-fin]').forEach(b => b.onclick = () => { C.groups[+b.dataset.fin].etapes[e].arr = Date.now(); beep(1000, .3); keep(); redraw(); });
      all('[data-undo]').forEach(b => b.onclick = () => { C.groups[+b.dataset.undo].etapes[e].arr = null; keep(); redraw(); });
      const upd = (key, d) => { const [gi, mi, k] = key.split('|'), g = C.groups[+gi]; const m = g.etapes[e].m[g.members[+mi]], sv = duaSeuil(c, e), before = stepOf(c, g, e).pts;
        if (k === 'tours' && before < sv) return toast(`🔒 Tours bloqués : ${before} / ${sv} points de lancers`);
        m[k] = Math.max(0, m[k] + d); if (k === 'pts' && before < sv && stepOf(c, g, e).pts >= sv) { toast(`✅ ${sv} points : la course est ouverte !`); [0, 150].forEach(t => setTimeout(() => beep(1400, .12), t)); } if (d > 0 && C.only != null) beep(900, .05); keep(); redraw(); };
      const updT = (gi, d) => { const g = C.groups[+gi], E = g.etapes[e], sv = duaSeuil(c, e), p = stepOf(c, g, e).pts;
        if (p < sv) return toast(`🔒 Tours bloqués : ${p} / ${sv} points de lancers`);
        E.tc = Math.max(0, (E.tc || 0) + d); if (d > 0 && C.only != null) beep(900, .05); keep(); redraw(); };
      all('[data-tci]').forEach(b => b.onclick = () => updT(b.dataset.tci, 1));
      all('[data-tcd]').forEach(b => b.onclick = () => updT(b.dataset.tcd, -1));
      all('[data-inc]').forEach(b => b.onclick = () => upd(b.dataset.inc, 1));
      all('[data-dec]').forEach(b => b.onclick = () => upd(b.dataset.dec, -1));
      all('[data-pts]').forEach(i => i.onchange = () => { const [gi, mi] = i.dataset.pts.split('|'), g = C.groups[+gi]; g.etapes[e].m[g.members[+mi]].pts = Math.max(0, +i.value || 0); keep(); redraw(); });
      if ($('#save')) $('#save').onclick = saveSeance;
    };
    const draw = () => {
      if (C.only != null && C.groups[C.only]) return drawGroup();
      const e = C.etape;
      box.innerHTML = `<div class="card"><b>${esc(C.nom)}</b><div class="muted">${esc(C.classe)} · ${C.groups.length} groupes${c.optL ? ` · ${c.boucles} boucle(s) par lancer non valide` : ''}${c.optC ? ` · pénalité course ${c.secC} s` : ''} · distance ${duaFr((c.dist || DUA_DIST) / 1000, 2)} km</div>
          <label>Étape</label><div class="seg" id="et">${[0, 1, 2].map(k => `<button data-e="${k}" class="${k === e ? 'on' : ''}">Étape ${k + 1}${duaObj(k, c)}</button>`).join('')}</div>
          <button class="btn btn-grad btn-block" style="margin-top:10px" id="all">🚩 Départ groupé — étape ${e + 1}</button><button class="btn btn-ghost btn-block" data-cfg="bare" style="margin-top:8px" id="edg">✏️ Modifier les groupes / participants (absent, blessé…)</button>
          ${C.groups.length > 1 ? `<div data-cfg="bare"><label>📱 Tablette d'un groupe (les élèves ne verront que leur groupe)</label><select id="only"><option value="">Tous les groupes</option>${C.groups.map((g, i) => `<option value="${i}">${esc(g.name)}</option>`).join('')}</select></div>` : ''}</div>
        ${C.groups.map((g, gi) => { const E = g.etapes[e], s = stepOf(c, g, e), T = totalOf(c, g);
          return `<div class="run ${E.arr ? 'fin' : E.dep ? 'go' : ''}"><div class="run-h"><b>${esc(g.name)}</b><span class="run-t" data-live="${gi}">${s.temps != null ? dmss(s.temps) : E.dep ? '…' : '0:00'}</span></div>
            <div class="row" style="margin-top:6px">${E.dep ? '' : `<button class="btn btn-grad" data-go="${gi}">▶ Départ</button>`}${E.dep && !E.arr ? `<button class="btn btn-danger" data-fin="${gi}">🏁 Arrivée</button>` : ''}${E.arr ? `<button class="btn btn-ghost" data-undo="${gi}">↺ Annuler l'arrivée</button>` : ''}</div>
            <div class="sheet-table" style="margin-top:8px"><table><tr><th>Élève</th><th>Pts</th>${c.optL ? '<th>Lancers ✗</th>' : ''}<th>Tours${s.pts < duaSeuil(c, e) ? ' 🔒' : ''}</th>${c.optC ? '<th>Pén.</th>' : ''}</tr>
              ${g.members.map((n, mi) => { const m = mem(g, e, n), off = k => k === 'tours' && s.pts < duaSeuil(c, e) ? ' disabled style="padding:4px 9px;opacity:.35"' : ' style="padding:4px 9px"', cell = (k, v) => `<td><div style="display:flex;align-items:center;gap:4px;justify-content:center"><button class="btn btn-ghost" data-dec="${gi}|${mi}|${k}"${off(k)}>−</button><b style="min-width:22px;text-align:center">${v}</b><button class="btn btn-ghost" data-inc="${gi}|${mi}|${k}"${off(k)}>+</button></div></td>`;
                return `<tr><td><b>${esc(n)}</b></td>${cell('pts', m.pts)}${c.optL ? cell('inval', m.inval) : ''}${duaCommun(c, e) ? '<td class="muted">↓</td>' : cell('tours', m.tours)}${c.optC ? cell('penC', m.penC) : ''}</tr>`; }).join('')}
              <tr><td><b>Groupe</b></td><td><b>${s.pts}</b>${s.pts < duaSeuil(c, e) ? `<div class="muted" style="font-size:.7rem">/ ${duaSeuil(c, e)}</div>` : ' ✅'}</td>${c.optL ? `<td><b>${s.inval}</b> → <b>${s.boucles}</b> boucle(s)</td>` : ''}<td>${duaCommun(c, e) ? (() => { const lk = s.pts < duaSeuil(c, e), d = lk ? ' disabled style="padding:4px 9px;opacity:.35"' : ' style="padding:4px 9px"'; return `<div style="display:flex;align-items:center;gap:4px;justify-content:center"><button class="btn btn-ghost" data-tcd="${gi}"${d}>−</button><b style="min-width:22px;text-align:center">${s.tours}</b><button class="btn btn-ghost" data-tci="${gi}"${d}>+</button></div><div class="muted" style="font-size:.7rem">en commun</div>`; })() : `<b>${s.tours}</b>`}</td>${c.optC ? `<td><b>+${s.penS} s</b></td>` : ''}</tr></table></div>
            <div class="muted" style="font-size:.82rem;margin-top:6px">Étape ${e + 1} : ${s.total != null ? `<b style="color:var(--text)">${dmss(s.total)}</b>${s.penS ? ` (dont ${s.penS} s de pénalité)` : ''}` : '—'} · Cumul ${T.done}/3 étapes : <b style="color:var(--text)">${dmss(T.partiel)}</b> · ${T.pts} pts · ${T.tours} tours</div>
            <div class="muted" style="font-size:.82rem;margin-top:4px">${potTxt(potOf(C, g, T))}</div></div>`; }).join('')}
        <div id="dua-recv">${recvHTML()}</div>
        <div id="vmac"></div>
        <div class="section-title"><h2>Classement provisoire</h2></div>${table(C)}
        <div class="row" style="margin-top:12px"><button class="btn btn-grad" data-cfg="bare" id="save">💾 Terminer et enregistrer</button><button class="btn btn-ghost" data-cfg="bare" id="cancel">Abandonner</button></div>`;
      const $ = s => box.querySelector(s), keep = () => save();
      $('#all').onclick = () => { const t = Date.now(); C.groups.forEach(g => { if (!g.etapes[e].dep) g.etapes[e].dep = t; }); beep(1300, .45); keep(); draw(); };
      $('#edg').onclick = () => editGroupsPanel('Groupes du duathlon', { cls: C.classe, list: () => C.groups, names: g => g.members,
        take: (g, n) => { g.members.splice(g.members.indexOf(n), 1); const d = g.etapes.map(E => E.m[n]); g.etapes.forEach(E => delete E.m[n]); d.vma = g.vma ? g.vma[n] : null; if (g.vma) delete g.vma[n]; return d; },
        put: (g, n, d) => { g.members.push(n); g.etapes.forEach((E, k) => E.m[n] = (d && d[k]) || { pts: 0, tours: 0, inval: 0, penC: 0 });
          const v = d && d.vma != null ? d.vma : vmaOf({}, n, C.classe); g.vma = g.vma || {}; if (v != null) g.vma[n] = v; },
        make: name => ({ name, members: [], vma: {}, etapes: [0, 1, 2].map(() => ({ dep: null, arr: null, m: {} })) }), onChange: () => { keep(); pub(C); }, onClose: draw });
      if ($('#only')) $('#only').onchange = ev => { C.only = ev.target.value === '' ? null : +ev.target.value; keep(); draw(); };
      // VMA modifiées pendant l'épreuve → mises à jour dans les groupes (et la séance partagée)
      if (C.joined && C.classe) { const K = duaVmaSync(C.classe);   // tablette ayant rejoint : VMA reçues avec la séance partagée
        C.groups.forEach(g => g.members.forEach(n => { if (!K[n] && g.vma && g.vma[n] != null) K[n] = { v: g.vma[n], src: 'Séance partagée', d: C.date }; })); }
      vmaCard($('#vmac'), C.classe, C.groups.flatMap(g => g.members), who => { const K = ((DB.duathlon.vma || {})[C.classe]) || {};
        C.groups.forEach(g => { g.vma = g.vma || {}; g.members.forEach(n => { if (who != null && n !== who) return; if (K[n]) g.vma[n] = K[n].v; else if (who != null) delete g.vma[n]; }); }); keep(); pub(C); draw(); });
      bind();
      $('#cancel').onclick = () => { if (confirm('Abandonner cette épreuve ?')) { partAskRemove(C); D.current = null; save(); clearInterval(iv); prepare(box); } };
    };
    const tick = () => { if (!box.isConnected || !D.current) return clearInterval(iv);
      { const rv = box.querySelector('#dua-recv'); if (rv && (tick.n = (tick.n || 0) + 1) % 4 === 0) { const h = recvHTML(); if (rv.innerHTML !== h) rv.innerHTML = h; } }
      C.groups.forEach((g, gi) => { const E = g.etapes[C.etape], l = box.querySelector(`[data-live="${gi}"]`); if (l && E.dep && !E.arr) l.textContent = dmss((Date.now() - E.dep) / 1000); }); };
    draw(); clearInterval(window._duaTick); iv = window._duaTick = setInterval(tick, 500);
  }

  /* ---- Tableau des résultats ---- */
  function table(C, byCoef) {
    const c = C.cfg, byTime = (a, b) => (b.T.done - a.T.done) || (a.T.partiel - b.T.partiel) || (b.T.pts - a.T.pts);
    const rows = C.groups.map(g => { const T = totalOf(c, g); return { g, T, R: potOf(C, g, T) }; })
      .sort(byCoef ? (a, b) => ((b.R.coef != null) - (a.R.coef != null)) || ((b.R.coef || 0) - (a.R.coef || 0)) || byTime(a, b) : byTime);
    return `<div class="card sheet-table"><table><tr><th>#</th><th>Groupe</th><th>Temps cumulé</th><th>Coef. maîtrise</th><th>Potentiel VMA</th>${[1, 2, 3].map(k => `<th>Étape ${k}</th>`).join('')}<th>Pts lancers</th><th>Tours</th>${c.optL ? '<th>Boucles pén.</th>' : ''}${c.optC ? '<th>Pén. course</th>' : ''}</tr>
      ${rows.map(({ g, T, R }, i) => `<tr><td>${i + 1}</td><td><b>${esc(g.name)}</b><div class="muted" style="font-size:.72rem">${g.members.map(esc).join(', ')}</div></td>
        <td><b>${T.temps != null ? dmss(T.temps) : dmss(T.partiel) + ` <span class="muted">(${T.done}/3)</span>`}</b></td>
        <td>${R.coef != null ? `<b>${duaPct(R.coef)}</b><div class="muted" style="font-size:.7rem">${duaFr(R.vReal)} km/h</div>` : '–'}</td>
        <td>${R.manque ? `<span style="color:var(--danger);font-size:.78rem;font-weight:700">VMA manquante</span><div class="muted" style="font-size:.7rem">${R.miss.map(esc).join(', ')}</div>` : `<b>${duaFr(R.pot)} km/h</b><div class="muted" style="font-size:.7rem">moy. ${duaFr(R.vMoy)}</div>`}</td>
        ${T.st.map(s => `<td>${s.total != null ? dmss(s.total) : '–'}<div class="muted" style="font-size:.7rem">${s.pts} pts · ${s.tours} t.</div></td>`).join('')}
        <td><b>${T.pts}</b></td><td><b>${T.tours}</b></td>${c.optL ? `<td>${T.boucles}</td>` : ''}${c.optC ? `<td>+${T.penS} s</td>` : ''}</tr>`).join('')}</table>
      <p class="muted" style="font-size:.75rem;margin:6px 0 0">${byCoef ? 'Classement au coefficient de maîtrise (groupes sans coefficient à la fin, classés au temps).' : 'Classement au temps cumulé (pénalités de course comprises) ; à égalité, aux points de lancers.'}</p>
      <details style="margin-top:4px"><summary class="muted" style="font-size:.75rem;cursor:pointer">ℹ️ Calcul du coefficient de maîtrise (distance ${duaFr((c.dist || DUA_DIST) / 1000, 2)} km)</summary><p class="muted" style="font-size:.74rem;margin:4px 0 0">${DUA_FORMULE}</p></details></div>`;
  }

  /* ---- Résultats enregistrés ---- */
  // Affichage fusionné : les enregistrements des différentes tablettes (même jour, même classe, mêmes réglages) = UNE épreuve
  const merged = S => { const M = new Map();
    S.forEach(C => { const k = [new Date(C.date).toDateString(), C.classe, JSON.stringify(C.cfg)].join('|'), m = M.get(k) || M.set(k, { date: C.date, classe: C.classe, cfg: C.cfg, noms: [], recs: [], groups: [] }).get(k);
      m.recs.push(C); m.groups.push(...C.groups); m.date = Math.min(m.date, C.date); if (!m.noms.includes(C.nom)) m.noms.push(C.nom); });
    return [...M.values()].map(m => (m.groups.sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true })), m)); };
  function results(box) {
    const S = D.seances;
    if (!S.length) { box.innerHTML = '<div class="card empty">Aucun duathlon enregistré pour l\'instant.</div>'; return; }
    const M = merged(S);
    box.innerHTML = `<div class="section-title" style="margin-top:0"><h2>Épreuves (${M.length})</h2><button class="link" id="exp">Exporter CSV</button></div>
      <div class="seg" id="rk">${[['temps', 'Classer par temps'], ['coef', 'Classer par coefficient de maîtrise']].map(([k, l]) => `<button data-rk="${k}" class="${rk === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      ${M.slice().reverse().map(m => { const i = M.indexOf(m);
        return `<div style="margin-top:12px"><div style="display:flex;justify-content:space-between;align-items:center"><div><b>${new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} · ${esc(m.classe)} · ${m.groups.length} groupe${m.groups.length > 1 ? 's' : ''}${m.recs.length > 1 ? ` (${m.recs.length} tablettes)` : ''}</b><div class="muted">${m.noms.map(esc).join(' / ')}</div></div><button class="btn btn-ghost" data-cfg="bare" data-x="${i}">🗑</button></div>${table(m, rk === 'coef')}</div>`; }).join('')}`;
    box.querySelectorAll('[data-rk]').forEach(b => b.onclick = () => { rk = b.dataset.rk; results(box); });
    box.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { const m = M[+b.dataset.x];
      if (confirm(`Supprimer cette épreuve${m.recs.length > 1 ? ` (${m.recs.length} enregistrements de tablettes)` : ''} ?`)) { m.recs.forEach(r => { const k = S.indexOf(r); if (k >= 0) S.splice(k, 1); }); save(); results(box); } });
    box.querySelector('#exp').onclick = () => download(`duathlon-${new Date().toISOString().slice(0, 10)}.csv`, csv([
      ['Épreuve', 'Date', 'Classe', 'Groupe', 'Élève', 'Étape', 'Points lancers', 'Tours', 'Lancers non valides', 'Boucles de pénalité', 'Pénalités course', 'Temps étape (groupe)', 'Temps cumulé (groupe)',
        'Distance (m)', 'VMA élève (km/h)', 'Potentiel VMA (km/h)', 'VMA moyenne (km/h)', 'Vitesse réalisée (km/h)', 'Coef. maîtrise (%)'],
      ...S.flatMap(C => C.groups.flatMap(g => { const T = totalOf(C.cfg, g), R = potOf(C, g, T), f = x => x == null ? '' : duaFr(x, 2);
        return [0, 1, 2].flatMap(e => g.members.map(n => { const m = g.etapes[e].m[n];
          return [C.nom, new Date(C.date).toLocaleDateString('fr-FR'), C.classe, g.name, n, e + 1, m.pts, duaCommun(C.cfg, e) ? (g.etapes[e].tc || 0) : m.tours, C.cfg.optL ? m.inval : '', C.cfg.optL ? m.inval * C.cfg.boucles : '', C.cfg.optC ? m.penC : '', dmss(T.st[e].total), T.temps != null ? dmss(T.temps) : '',
            C.cfg.dist || DUA_DIST, f(vmaOf(g, n, C.classe)), R.manque ? 'VMA manquante' : f(R.pot), R.manque ? '' : f(R.vMoy), f(R.vReal), R.coef != null ? Math.round(R.coef * 100) : '']; })); }))]));
  }

  frame();
  return () => clearInterval(window._duaTick);
};
