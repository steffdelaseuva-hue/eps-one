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
  window.openStoredData = function () {
    openPanel('Données stockées', el => {
      let bak = true;
      const draw = () => {
        const R = rows(), tot = R.reduce((a, r) => a + r.z, 0);
        el.innerHTML = `<div class="card"><b>🗂 Ce que l'appli garde sur cette tablette</b>
          <p class="muted" style="margin:6px 0 0;font-size:.85rem">Touchez 🗑 pour vider une rubrique (le contenu est définitivement effacé). Les classes et listes d'élèves ne sont pas listées ici : elles se gèrent dans l'outil Classes ou dans « Nouvelle année scolaire ».</p>
          <label style="display:flex;align-items:center;gap:8px;margin:10px 0 0;font-weight:700"><input type="checkbox" id="dn-b" ${bak ? 'checked' : ''} style="width:20px;height:20px;margin:0"> Télécharger une sauvegarde avant de supprimer</label></div>
          ${R.length ? R.map((r, i) => `<div class="card" style="margin-top:10px"><div style="display:flex;align-items:center;gap:10px"><div style="flex:1;min-width:0"><b>${esc(nm(r.k))}</b><div class="muted" style="font-size:.8rem">${r.n} élément${r.n > 1 ? 's' : ''} · ${ko(r.z)}</div></div>
              <button class="btn btn-danger" data-cfg="bare" data-d="${i}" style="padding:8px 12px">🗑 Tout vider</button></div>
            ${r.subs.length > 1 || (r.subs.length === 1 && !Array.isArray(DB[r.k])) ? `<details style="margin-top:8px"><summary class="muted" style="font-size:.82rem;cursor:pointer">Détail (${r.subs.length})</summary>${r.subs.map((s, j) => `<div style="display:flex;align-items:center;gap:10px;margin-top:8px;padding-top:8px;border-top:1px solid var(--line)"><div style="flex:1;min-width:0"><b style="font-size:.9rem">${esc(subLab(r.k, s.s))}</b><div class="muted" style="font-size:.78rem">${s.n} élément${s.n > 1 ? 's' : ''} · ${ko(s.z)}</div></div><button class="btn btn-ghost" data-cfg="bare" data-d="${i}" data-s="${j}" style="padding:7px 10px;color:#D64545">🗑</button></div>`).join('')}</details>` : ''}</div>`).join('')
            : '<div class="card empty" style="margin-top:10px">Aucune donnée à afficher.</div>'}
          <p class="muted" style="margin:12px 4px;font-size:.8rem">Total des rubriques listées : <b>${ko(tot)}</b>. Les photos et vidéos sont rangées à part (voir « Espace utilisé »).</p>`;
        el.querySelector('#dn-b').onchange = e => { bak = e.target.checked; };
        el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => {
          const r = R[+b.dataset.d], sub = b.dataset.s != null ? r.subs[+b.dataset.s] : null, what = sub ? `« ${subLab(r.k, sub.s)} » de « ${nm(r.k)} »` : `« ${nm(r.k)} »`, n = sub ? sub.n : r.n;
          if (!confirm(`Vider ${what} (${n} élément${n > 1 ? 's' : ''}) ?\nCette suppression est définitive, sur toutes les tablettes synchronisées.`)) return;
          if (bak) backup();
          const v = DB[r.k];
          if (sub) v[sub.s] = empty(v[sub.s]);
          else if (Array.isArray(v)) DB[r.k] = [];
          else if (ROOTDICT.has(r.k)) DB[r.k] = {};
          else Object.keys(v).forEach(s => { if (delOK(s, v[s])) v[s] = empty(v[s]); else if (s === 'current' && v[s]) v[s] = null; });
          save(); window.syncFlush && window.syncFlush(); toast('Rubrique vidée'); draw();
        });
      };
      draw();
    });
  };
})();
