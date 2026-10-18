/* =========================================================
   🗂 Données stockées (Plus → Espace utilisé → « Voir les données stockées »)
   Liste ce que l'appli garde sur la tablette, avec le nombre d'éléments et la taille, et permet de vider ce qu'on veut.
   Une suppression remet la rubrique à vide (liste vide) : l'appli continue de fonctionner normalement.
   ========================================================= */
(function () {
  const LAB = { resultats: 'Résultats des élèves', matchs: 'Matchs (gestion de match)', tournois: 'Tournois', suivi: 'Tableaux de suivi', dispenses: 'Dispenses', oublis: 'Oublis de tenue', journal: 'Journal',
    grilles: 'Grilles d\'évaluation (modèles et évaluations)', debrief: 'Questions de débrief', relais: 'Relais', co: 'Course d\'orientation', combine: 'Combiné athlétique', cross: 'Cross du collège', demifond: 'Demi-fond',
    duathlon: 'Duathlon athlétique', escalade: 'Escalade', wod: 'HYROX / Crosstraining', natation: 'Natation', sauvetage: 'Sauvetage', rugbyLA: 'Rugby (observations)', parkour: 'Parkour', acro: 'Acrosport',
    gym: 'Gymnastique', niveaux: 'Niveaux et groupes', prepGroups: 'Équipes composées', asns: 'ASNS / sections', recentBy: 'Outils récents par enseignant', tablette: 'Réglages de la tablette' };
  const SUB = { courses: 'Courses enregistrées', seances: 'Séances', parcours: 'Parcours', lieux: 'Lieux (cartes)', voies: 'Voies', epreuves: 'Épreuves', events: 'Épreuves / événements', obs: 'Observations', groupes: 'Groupes', evals: 'Évaluations', cfg: 'Réglages' };
  // jamais proposés : sans eux l'appli ne démarre plus correctement (classes : Plus → Nouvelle année scolaire)
  const HIDE = new Set(['classes', 'classesAll', 'annee', 'favs', 'recent', 'lastClass', 'exportDate', 'tablette', 'recentBy']);
  const isBig = k => /^(acroImg_|gymImg_|escImg_|danseImg_)/.test(k);
  const size = v => { try { return JSON.stringify(v ?? null).length * 2; } catch (e) { return 0; } };
  const ko = n => n >= 1048576 ? (n / 1048576).toFixed(1) + ' Mo' : Math.max(1, Math.round(n / 1024)) + ' Ko';
  const cnt = v => Array.isArray(v) ? v.length : (v && typeof v === 'object') ? Object.keys(v).length : 0;
  const empty = v => Array.isArray(v) ? [] : {};
  const ROOTDICT = new Set(['prepGroups', 'niveaux', 'suivi', 'oublis', 'asns', 'gym', 'acro']);   // dictionnaires {classe/id: données} : se vident en {} entier
  const DICT = new Set(['vma', 'groupes', 'pl', 'evals', 'passages']);   // dictionnaires de DONNÉES (jamais les réglages « cfg » ni la séance en cours « current »)
  const delOK = (k, v) => Array.isArray(v) || (v && typeof v === 'object' && DICT.has(k));
  /* 🩹 Réparation : une séance en cours « current » vidée en {} (ancienne version 23.84) empêche l'ouverture de plusieurs outils → on la remet à null */
  /* ♻️ Corbeille des tournois : tout tournoi supprimé (quel que soit le chemin) y est conservé pour pouvoir le restaurer */
  window.epsTrashTournoi = function (t) { try { if (!t || !t.id) return; const L = Array.isArray(DB.tournoisDel) ? DB.tournoisDel : [];
    DB.tournoisDel = [...L.filter(x => x && x.id !== t.id), { ...JSON.parse(JSON.stringify(t)), delDate: Date.now() }].slice(-30); } catch (e) {} };
  window.epsRepairData = function () { let n = 0;
    try { Object.keys(DB).forEach(k => { const v = DB[k]; if (!v || typeof v !== 'object' || Array.isArray(v)) return;
      if (v.current && typeof v.current === 'object' && !Array.isArray(v.current) && !Object.keys(v.current).length) { v.current = null; n++; }
      if (ROOTDICT.has(k)) Object.keys(v).forEach(x => { const e = v[x]; if (e && typeof e === 'object' && !Array.isArray(e) && !Object.keys(e).length) { delete v[x]; n++; } });
      if (k === 'combine' && v.cfg && typeof v.cfg === 'object' && !Object.keys(v.cfg).length) { v.cfg = null; n++; } });
      if (n) save(); } catch (e) {} return n; };
  window.epsRepairData();
  const container = v => Array.isArray(v) || (v && typeof v === 'object');
  const nm = k => LAB[k] || k;
  const subLab = (k, s) => (Array.isArray(DB[k]) ? s : (SUB[s] || s));
  function rows() {
    return Object.keys(DB).filter(k => !HIDE.has(k) && !isBig(k) && container(DB[k]) && cnt(DB[k]) > 0).map(k => {
      const v = DB[k]; if (ROOTDICT.has(k)) return { k, n: cnt(v), z: size(v), subs: [] };
      const subs = Array.isArray(v) ? [] : Object.keys(v).filter(s => delOK(s, v[s]) && cnt(v[s]) > 0).map(s => ({ s, n: cnt(v[s]), z: size(v[s]) }));
      return { k, n: Array.isArray(v) ? v.length : subs.reduce((a, x) => a + x.n, 0), z: Array.isArray(v) ? size(v) : subs.reduce((a, x) => a + x.z, 0), subs }; }).filter(r => r.n > 0).sort((a, b) => b.z - a.z);
  }
  function backup() { try { const u = URL.createObjectURL(new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' })), a = document.createElement('a');
    a.href = u; a.download = 'EPS-ONE-avant-suppression-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); } catch (e) {} }
  /* Si un outil plante à l'ouverture : on tente la réparation des données puis on réessaie une fois ; sinon message clair */
  const o0 = window.openTool;
  if (typeof o0 === 'function') window.openTool = openTool = function (id) {
    try { return o0.apply(this, arguments); }
    catch (err) { let fixed = 0; try { fixed = window.epsRepairData(); } catch (e2) {}
      if (fixed) { try { return o0.apply(this, arguments); } catch (e3) { err = e3; } }
      try { toast('⚠️ Cet outil n\'a pas pu s\'ouvrir : ' + String(err && err.message || err).slice(0, 90)); } catch (e4) {}
      try { console.error('openTool', id, err); } catch (e5) {} }
  };
  /* ---- 3 familles seulement, listées explicitement : jamais de réglages, de classes ni de séance en cours ---- */
  const arr = (o, k) => (o && Array.isArray(o[k])) ? o[k] : [];
  const obj = k => DB[k] && typeof DB[k] === 'object' && !Array.isArray(DB[k]) ? DB[k] : null;
  const A = (label, get, clr) => ({ label, get, clr });
  /* Mode Équipe EPS : on ne touche qu'à ce qui concerne l'enseignant actif (jamais aux données d'un collègue) */
  const see = x => { try { return !window.teamSees || teamSees(x); } catch (e) { return true; } };
  const teamNote = () => (DB.team && DB.team.on) ? '<div class="muted" style="font-size:.8rem;margin:6px 0 0">👥 Mode Équipe : seules <b>vos</b> données (et celles qui n\'appartiennent à aucun collègue) sont supprimées, jamais celles d\'un collègue.</div>' : '';
  const listOf = (k, label) => A(label, () => arr(DB, k).filter(see).length, () => { if (Array.isArray(DB[k])) DB[k] = DB[k].filter(x => !see(x)); });
  const subOf = (k, sub, label) => A(label, () => arr(obj(k), sub).filter(see).length, () => { const o = obj(k); if (o && Array.isArray(o[sub])) o[sub] = o[sub].filter(x => !see(x)); });
  const CATS = [
    { id: 'eq', ico: '👥', title: 'Équipes et groupes créés', sub: 'Les équipes / groupes préparés dans les outils (relais, duathlon, tournois, duels…). Les classes et les listes d\'élèves ne sont pas touchées.',
      items: [A('Équipes et groupes préparés', () => Object.keys(DB.prepGroups || {}).filter(k => see(k.split('|')[1] || '')).length, () => { Object.keys(DB.prepGroups || {}).forEach(k => { if (see(k.split('|')[1] || '')) delete DB.prepGroups[k]; }); })] },
    { id: 'res', ico: '📊', title: 'Bilans et résultats', sub: 'Les résultats enregistrés (élèves et collectifs) : ce sont eux qui alimentent les bilans et les fiches élèves.',
      items: [listOf('resultats', 'Résultats des élèves'), listOf('matchs', 'Matchs'), A('Tournois (restaurables depuis la corbeille de l\'outil)', () => arr(DB, 'tournois').filter(see).length, () => { const K = (DB.tournois || []).filter(see); K.forEach(t => epsTrashTournoi(t)); DB.tournois = (DB.tournois || []).filter(t => !see(t)); }),
        subOf('escalade', 'passages', 'Escalade : passages'), subOf('lutte', 'combats', 'Lutte : combats'), subOf('parkour', 'evals', 'Parkour : évaluations'), subOf('rugbyLA', 'obs', 'Rugby : observations'),
        A('Évaluations saisies dans les grilles', () => (DB.grilles || []).reduce((a, g) => a + Object.keys((g && g.evals) || {}).filter(c => see(c)).length, 0), () => (DB.grilles || []).forEach(g => { if (g && g.evals) Object.keys(g.evals).forEach(c => { if (see(c)) delete g.evals[c]; }); }))] },
    { id: 'sea', ico: '🏁', title: 'Séances terminées', sub: 'Les séances enregistrées de chaque outil. La séance en cours n\'est jamais supprimée.',
      items: [subOf('relais', 'courses', 'Relais : courses'), subOf('duathlon', 'seances', 'Duathlon : séances'), subOf('combine', 'seances', 'Combiné athlétique : séances'), subOf('demifond', 'seances', 'Demi-fond : séances'),
        subOf('co', 'seances', 'Course d\'orientation : séances'), subOf('sauvetage', 'seances', 'Sauvetage : séances'), subOf('wod', 'seances', 'HYROX / Crosstraining : séances'), subOf('lutte', 'seances', 'Lutte : séances'),
        listOf('interclasses', 'Interclasses')] }
  ];
  window.openStoredData = function () {
    openPanel('Supprimer des données', el => {
      let bak = true;
      const draw = () => {
        el.innerHTML = `<div class="card"><b>🗑 Que voulez-vous supprimer ?</b>
          <p class="muted" style="margin:6px 0 0;font-size:.85rem">Trois familles seulement. Les classes, les listes d'élèves, les réglages et les séances en cours ne sont jamais touchés. La suppression est définitive, y compris sur les tablettes synchronisées.</p>${teamNote()}
          <label style="display:flex;align-items:center;gap:8px;margin:10px 0 0;font-weight:700"><input type="checkbox" id="dn-b" ${bak ? 'checked' : ''} style="width:20px;height:20px;margin:0"> Télécharger une sauvegarde avant de supprimer</label></div>
          ${CATS.map(c => { const L = c.items.map(it => ({ it, n: it.get() })).filter(x => x.n > 0), tot = L.reduce((a, x) => a + x.n, 0);
            return `<div class="card" style="margin-top:12px"><b style="font-size:1.05rem">${c.ico} ${esc(c.title)}</b><p class="muted" style="margin:4px 0 0;font-size:.82rem">${esc(c.sub)}</p>
              ${L.length ? `<ul style="margin:8px 0 0 18px;padding:0;font-size:.88rem;line-height:1.5">${L.map(x => `<li>${esc(x.it.label)} : <b>${x.n}</b></li>`).join('')}</ul>
                <button class="btn btn-danger btn-block" data-cfg="bare" data-c="${c.id}" style="margin-top:10px">🗑 Vider « ${esc(c.title)} » (${tot})</button>`
              : '<div class="muted" style="margin-top:8px;font-size:.85rem">✔ Rien à supprimer.</div>'}</div>`; }).join('')}`;
        el.querySelector('#dn-b').onchange = e => { bak = e.target.checked; };
        el.querySelectorAll('[data-c]').forEach(b => b.onclick = () => {
          const c = CATS.find(x => x.id === b.dataset.c), L = c.items.map(it => ({ it, n: it.get() })).filter(x => x.n > 0); if (!L.length) return;
          if (!confirm(`Supprimer définitivement :\n${L.map(x => '• ' + x.it.label + ' (' + x.n + ')').join('\n')}\n\nCela se répercute sur les tablettes synchronisées.`)) return;
          if (bak) backup();
          L.forEach(x => { try { x.it.clr(); } catch (e) {} });
          try { window.epsRepairData(); } catch (e) {}
          save(); window.syncFlush && window.syncFlush(); toast('Données supprimées'); draw();
        });
      };
      draw();
    });
  };

  /* ---- 🧹 Dans chaque outil : supprimer ce qui est terminé (séances, résultats, tournois terminés…) ---- */
  const GRP = { match: 'col', matchr: 'raq', escrime: 'esc' };
  const SEA = { relais: [['relais', 'courses', 'Courses de relais']], duathlon: [['duathlon', 'seances', 'Séances de duathlon']], combine: [['combine', 'seances', 'Séances de combiné athlétique']],
    demifond: [['demifond', 'seances', 'Séances de demi-fond']], co: [['co', 'seances', 'Séances de course d\'orientation']], sauvetage: [['sauvetage', 'seances', 'Séances de sauvetage']],
    wod: [['wod', 'seances', 'Séances HYROX / Crosstraining']], lutte: [['lutte', 'seances', 'Séances de lutte'], ['lutte', 'combats', 'Combats de lutte']],
    escalade: [['escalade', 'passages', 'Passages d\'escalade']], parkour: [['parkour', 'evals', 'Évaluations de parkour']], rugbyla: [['rugbyLA', 'obs', 'Observations de rugby']] };
  window.epsCleanTools = () => [...Object.keys(SEA), ...Object.keys(GRP), 'interclasses', 'natation'];
  function toolItems(tool) {
    const it = [];
    (SEA[tool] || []).forEach(([k, sub, lab]) => it.push(subOf(k, sub, lab)));
    if (tool === 'interclasses') it.push(listOf('interclasses', 'Interclasses terminés'));
    if (tool === 'natation') it.push(listOf('natation', 'Résultats de natation'));
    if (GRP[tool] && typeof MATCH_GRP !== 'undefined') { const GS = MATCH_GRP[GRP[tool]] || [], inG = x => x && GS.includes(x.sport);
      it.push(A('Tournois terminés', () => arr(DB, 'tournois').filter(x => inG(x) && x.fin && see(x)).length, () => { DB.tournois = arr(DB, 'tournois').filter(x => !(inG(x) && x.fin && see(x))); }));
      it.push(A('Tournois supprimés (corbeille)', () => arr(DB, 'tournoisDel').filter(x => inG(x) && see(x)).length, () => { DB.tournoisDel = arr(DB, 'tournoisDel').filter(x => !(inG(x) && see(x))); }));
      it.push(A('Matchs enregistrés', () => arr(DB, 'matchs').filter(x => inG(x) && see(x)).length, () => { DB.matchs = arr(DB, 'matchs').filter(x => !(inG(x) && see(x))); })); }
    it.push(A('Résultats d\'élèves enregistrés avec cet outil', () => arr(DB, 'resultats').filter(r => r && r.tool === tool && see(r)).length, () => { DB.resultats = arr(DB, 'resultats').filter(r => !(r && r.tool === tool && see(r))); }));
    return it;
  }
  window.epsCleanTool = function (tool) {
    const nm = ((typeof TOOLS !== 'undefined' ? TOOLS : []).find(t => t.id === tool) || {}).name || tool;
    const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:310;background:rgba(0,0,0,.55);display:grid;place-items:center;padding:14px;overflow:auto'; let bak = true;
    const close = () => o.remove();
    const draw = () => { const L = toolItems(tool).map(it => ({ it, n: it.get() })).filter(x => x.n > 0), tot = L.reduce((a, x) => a + x.n, 0);
      o.innerHTML = `<div class="card" style="max-width:440px;width:100%;max-height:94vh;overflow:auto"><h3 style="margin-top:0">🧹 Supprimer ce qui est terminé</h3><div class="muted" style="font-size:.85rem;margin-bottom:8px"><b>${esc(nm)}</b> · la séance en cours, les réglages et les classes ne sont jamais touchés.</div>${teamNote()}
        ${L.length ? `<ul style="margin:0 0 0 18px;padding:0;font-size:.92rem;line-height:1.6">${L.map(x => `<li>${esc(x.it.label)} : <b>${x.n}</b></li>`).join('')}</ul>
          <label style="display:flex;align-items:center;gap:8px;margin:12px 0 0;font-weight:700"><input type="checkbox" id="ct-b" ${bak ? 'checked' : ''} style="width:20px;height:20px;margin:0"> Télécharger une sauvegarde avant</label>
          <button class="btn btn-danger btn-block" style="margin-top:12px;padding:14px" id="ct-go">🗑 Tout supprimer (${tot})</button>` : '<div class="card empty" style="margin-top:8px">✔ Rien de terminé à supprimer pour cet outil.</div>'}
        <button class="btn btn-ghost btn-block" style="margin-top:8px" id="ct-x">Fermer</button></div>`;
      o.querySelector('#ct-x').onclick = close;
      if (L.length) { o.querySelector('#ct-b').onchange = e => { bak = e.target.checked; };
        o.querySelector('#ct-go').onclick = () => { if (!confirm(`Supprimer définitivement :\n${L.map(x => '• ' + x.it.label + ' (' + x.n + ')').join('\n')}\n\nCela se répercute sur les tablettes synchronisées.`)) return;
          if (bak) backup(); L.forEach(x => { try { x.it.clr(); } catch (e) {} }); try { window.epsRepairData(); } catch (e) {}
          save(); window.syncFlush && window.syncFlush(); toast('Supprimé ✔'); close(); try { if (typeof currentTool !== 'undefined' && currentTool === tool && typeof openTool === 'function') openTool(tool); } catch (e) {} }; } };
    document.body.appendChild(o); draw();
  };
})();
