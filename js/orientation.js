/* =========================================================
   EPS ONE — Outil « Course d'orientation »
   Parcours (balises, niveaux, obligatoires) · Séance (départs,
   arrivées, balises, pénalités, RK) · Bilan cumulé
   ========================================================= */
DB.co = DB.co || { parcours: [], seances: [], current: null };
ICONS.co = '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/><circle cx="12" cy="12" r=".8" fill="url(#icoGrad)"/>';

const CO_TYPES = {
  etoile:  ['Étoile / papillon', 'Retour au départ entre chaque balise.'],
  reseau:  ['Réseau de postes', 'L\'élève choisit ses balises (facultatives) pour marquer un maximum de points.'],
  suivi:   ['Suivi d\'itinéraire', 'Itinéraire imposé, balises dans l\'ordre.'],
  relais:  ['Relais', 'Les membres du groupe partent l\'un après l\'autre.'],
  libre:   ['Parcours libre', 'Balises dans l\'ordre choisi.'],
};
const coId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const hms = s => { if (s == null || isNaN(s)) return '–'; s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
const clock = t => t ? new Date(t).toLocaleTimeString('fr-FR') : '––:––:––';
const mpk = (sec, km) => km > 0 && sec > 0 ? hms(sec / km) + ' /km' : '–';

document.head.insertAdjacentHTML('beforeend', `<style>
.co-tabs{display:flex;gap:6px;margin-bottom:12px}
.co-tabs button{flex:1;padding:11px 6px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800}
.co-tabs button.on{background:var(--grad);color:#fff;border-color:transparent}
.bal-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)}
.bal-row:last-child{border-bottom:none}
.bal-row input.num{width:64px;text-align:center;padding:7px}
.bal-row .lvl{margin:0;flex:1}
.bal-row .lvl button{padding:7px 2px}
.chk-ob{display:flex;align-items:center;gap:4px;font-size:.75rem;font-weight:800;color:var(--muted);white-space:nowrap}
.chk-ob input{width:18px;height:18px}
.run{border:2px solid var(--line);border-radius:16px;padding:12px;background:var(--card);margin-top:10px}
.run.go{border-color:#2F6BD8}.run.fin{border-color:var(--gold);background:var(--grad-soft)}
.run-h{display:flex;align-items:center;gap:8px}
.run-h b{flex:1}
.run-t{font-size:1.6rem;font-weight:900;font-variant-numeric:tabular-nums}
.bal-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.co-pick{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
.bal-chips button{min-width:46px;padding:8px 6px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);font-weight:900;font-size:.85rem}
.bal-chips button.on{background:#1B9E5A;color:#fff;border-color:transparent}
.bal-chips button.ob{box-shadow:inset 0 -3px 0 var(--danger)}
.bal-chips button sup{font-size:.6rem;opacity:.8}
.co-times{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.co-times input{padding:8px}
</style>`);

/* ---------- Symboles de pinces : grille 4 × 4 de points (code = 16 caractères 0/1) ---------- */
const PAT_N = 16;
const isPat = c => typeof c === 'string' && /^[01]{16}$/.test(c) && c.includes('1');
const CO_PATS = (() => {                       // répertoire de 90 symboles distincts (les 50 premiers inchangés)
  let seed = 20260926; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const out = [], dist = (a, b) => [...a].filter((x, i) => x !== b[i]).length;
  while (out.length < 90) { const k = 4 + Math.floor(rnd() * 4), cells = new Set(); while (cells.size < k) cells.add(Math.floor(rnd() * PAT_N));
    const c = Array.from({ length: PAT_N }, (_, i) => cells.has(i) ? '1' : '0').join('');
    if (out.every(o => dist(o, c) >= 4)) out.push(c); }
  return out;
})();
function patSVG(code, px = 44, col = '#0B2A5B') {
  const on = isPat(code) ? code : '0'.repeat(PAT_N);
  return `<svg viewBox="0 0 44 44" width="${px}" height="${px}" style="display:block"><rect x="1" y="1" width="42" height="42" rx="5" fill="#fff" stroke="#9AA6B8" stroke-width="1.5"/>${[...on].map((v, i) => { const x = 8 + (i % 4) * 9.3, y = 8 + Math.floor(i / 4) * 9.3;
    return v === '1' ? `<circle cx="${x}" cy="${y}" r="3.4" fill="${col}"/>` : `<circle cx="${x}" cy="${y}" r="1.1" fill="#D5DBE5"/>`; }).join('')}</svg>`;
}
/* Sélecteur de symbole : répertoire, dessin libre, options supplémentaires */
function patPicker({ title, options, draw = true, extra = [], current, used = [], onPick, only }) {
  const o = document.createElement('div');
  o.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(7,18,42,.72);display:grid;place-items:center;padding:12px';
  let tab = only === 'draw' ? 'draw' : 'rep', cells = [...(isPat(current) ? current : '0'.repeat(PAT_N))];
  const render = () => {
    o.innerHTML = `<div class="card" style="max-width:520px;width:100%;max-height:92vh;overflow:auto"><h3>${esc(title)}</h3>
      ${draw && only !== 'draw' ? `<div class="co-tabs" style="margin-top:8px"><button data-t="rep" class="${tab === 'rep' ? 'on' : ''}">📚 Répertoire</button><button data-t="draw" class="${tab === 'draw' ? 'on' : ''}">✏️ Dessiner</button></div>` : ''}
      ${tab === 'rep' ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:6px">${options.map(c => `<button data-c="${c}" style="padding:4px;border-radius:10px;border:2px solid ${c === current ? 'var(--gold)' : 'transparent'};background:${used.includes(c) && c !== current ? 'var(--line)' : 'transparent'};cursor:pointer;opacity:${used.includes(c) && c !== current ? .45 : 1}">${patSVG(c, 46)}</button>`).join('')}</div>
          ${extra.map(x => `<button class="btn ${x.cls || 'btn-ghost'} btn-block" style="margin-top:8px" data-x="${x.v}">${x.l}</button>`).join('')}`
        : `<p class="muted" style="margin:0 0 8px">Touchez les points pour reproduire le symbole de la pince.</p>
          <div style="display:grid;grid-template-columns:repeat(4,56px);gap:8px;justify-content:center">${cells.map((v, i) => `<button data-i="${i}" style="width:56px;height:56px;border-radius:50%;border:2px solid var(--line);background:${v === '1' ? '#0B2A5B' : 'var(--card)'};cursor:pointer"></button>`).join('')}</div>
          <button class="btn btn-grad btn-block" style="margin-top:12px" id="pv">✔ ${only === 'draw' ? 'Valider mon dessin' : 'Utiliser ce symbole'}</button>${only === 'draw' ? extra.map(x => `<button class="btn ${x.cls || 'btn-ghost'} btn-block" style="margin-top:8px" data-x="${x.v}">${x.l}</button>`).join('') : ''}`}
      <button class="btn btn-ghost btn-block" style="margin-top:8px" id="pc">Annuler</button></div>`;
    o.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; render(); });
    o.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { o.remove(); onPick(b.dataset.c); });
    o.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { o.remove(); onPick(b.dataset.x); });
    o.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { cells[+b.dataset.i] = cells[+b.dataset.i] === '1' ? '0' : '1'; render(); });
    const pv = o.querySelector('#pv'); if (pv) pv.onclick = () => { const c = cells.join(''); if (!isPat(c)) return toast('Ajoutez au moins un point'); o.remove(); onPick(c); };
    o.querySelector('#pc').onclick = () => o.remove();
  };
  o.onclick = e => { if (e.target === o) o.remove(); };
  render(); document.body.appendChild(o);
}

/* Contrôle des balises par l'élève sur la tablette de son équipe :
   when = 'live' (pendant la course, l'élève a la tablette / le téléphone) ou 'arrivee' (carton papier, contrôle après l'arrivée)
   how  = 'choix' (choisir le symbole) · 'dessin' (redessiner le symbole) · 'auto' (symboles affichés, l'élève coche VALIDÉ / FAUX) */
const coCtl = p => Object.assign({ when: 'arrivee', how: (p && p.ctrl) || 'choix' }, DB.co.ctl || {});
TOOL_IMPL.co = function (el) {
  let tab = DB.co.current || partToday('co').length || partRecoverHTML('co') ? 'seance' : 'parcours';
  const P = id => DB.co.parcours.find(p => p.id === id);

  function frame() {
    el.innerHTML = `<div class="co-tabs">${[['parcours', '🗺 Parcours'], ['seance', '⏱ Séance'], ['controle', '🔎 Contrôle'], ['bilan', '📊 Bilan']].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div><div id="co-body"></div>`;
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; frame(); });
    const body = el.querySelector('#co-body');
    ({ parcours: listParcours, seance: seance, controle: controle, bilan: bilan })[tab](body);
  }

  /* ================= 1. PARCOURS ================= */
  function listParcours(box) {
    box.innerHTML = `<div class="card" style="padding:0">${DB.co.parcours.length ? DB.co.parcours.map((p, i) => `<div class="list-item"><div style="flex:1"><b>${esc(p.nom)}</b>
        <div class="muted">${CO_TYPES[p.type][0]} · ${p.distance ? (p.distance / 1000).toFixed(2).replace('.', ',') + ' km' : 'distance ?'}${p.deniv ? ' · D+ ' + p.deniv + ' m' : ''} · ${p.balises.length} balises${p.alloue ? ' · ' + p.alloue + ' min' : ''}</div></div>
        <button class="btn btn-ghost" data-cfg="bare" data-e="${i}">✏️</button><button class="btn btn-ghost" data-cfg="bare" data-c="${i}" title="Dupliquer">⧉</button></div>`).join('') : '<div class="empty">Aucun parcours. Créez le premier !</div>'}</div>
      <button class="btn btn-grad btn-block" data-cfg style="margin-top:12px" id="new">＋ Créer un parcours</button>`;
    box.querySelector('#new').onclick = () => editParcours(box, null);
    box.querySelectorAll('[data-e]').forEach(b => b.onclick = () => editParcours(box, +b.dataset.e));
    box.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { const c = JSON.parse(JSON.stringify(DB.co.parcours[+b.dataset.c])); c.id = coId(); c.nom += ' (copie)'; DB.co.parcours.push(c); save(); listParcours(box); });
  }

  function editParcours(box, idx) {
    const p = idx != null ? JSON.parse(JSON.stringify(DB.co.parcours[idx])) : {
      id: coId(), nom: 'Parcours 1', type: 'libre', distance: 1200, denivOn: false, deniv: 0, alloue: 20, ecart: 2,
      balises: Array.from({ length: 8 }, (_, i) => ({ num: 31 + i, niv: 1, ob: true })),
      pts: [1, 2, 3], penWrongP: 1, penWrongS: 30, penMissS: 60, penOverP: 1 };
    const draw = () => {
      box.innerHTML = `<div data-cfg="bare"><div class="card" data-cfg><h3>${idx != null ? 'Modifier' : 'Nouveau'} parcours</h3>
        <label>Nom</label><input id="nm" value="${esc(p.nom)}">
        <label>Type de parcours</label><select id="ty">${Object.entries(CO_TYPES).map(([k, v]) => `<option value="${k}" ${p.type === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select>
        <p class="muted" style="margin:6px 0 0">${CO_TYPES[p.type][1]}</p>
        <div class="row"><div><label>Distance (m)</label><input id="di" type="number" value="${p.distance}"></div><div><label>Temps attribué (min)</label><input id="al" type="number" value="${p.alloue}"></div><div><label>Écart toléré (± min)</label><input id="ec" type="number" value="${p.ecart}"></div></div>
        <label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="dn" ${p.denivOn ? 'checked' : ''} style="width:auto"> Option dénivelé</label>
        ${p.denivOn ? `<label>Dénivelé positif (m)</label><input id="dv" type="number" value="${p.deniv}">` : ''}
      </div>
      <div class="card" style="margin-top:12px"><h3>Balises (${p.balises.length})</h3>
        <p class="muted" style="margin:0 0 6px;font-size:.8rem">Symbole : le motif de points de la pince de chaque balise (répertoire ou dessin), utilisé par l'onglet 🔎 Contrôle.</p>
        <button class="btn btn-ghost btn-block" id="autop" style="margin-bottom:6px">🎲 Attribuer un symbole différent à chaque balise</button>
        <p class="muted" style="margin:4px 0 8px;font-size:.78rem">🧑‍🎓 Comment l'élève contrôle ses balises (pendant la course ou à l'arrivée ; choisir, dessiner ou comparer) : onglet <b>🔎 Contrôle</b>.</p>
        <div class="row" style="align-items:end"><div><label>Nombre</label><input id="nb" type="number" min="1" value="${p.balises.length}"></div><div><label>1er numéro</label><input id="n0" type="number" value="${p.balises[0]?.num ?? 31}"></div><button class="btn btn-ghost" style="flex:0 0 auto" id="genb">Générer</button></div>
        <div class="row" style="margin-top:8px"><button class="btn btn-ghost" id="allob">Toutes obligatoires</button><button class="btn btn-ghost" id="allfa">Toutes facultatives</button></div>
        <div style="margin-top:8px">${p.balises.map((b, i) => `<div class="bal-row"><input class="num" type="number" data-num="${i}" value="${b.num}">
          <button data-pat="${i}" title="Symbole de la pince" style="flex:0 0 auto;padding:0;border:none;background:none;cursor:pointer">${isPat(b.code) ? patSVG(b.code, 40) : '<span style="display:grid;place-items:center;width:40px;height:40px;border:1.5px dashed var(--line);border-radius:6px;font-size:.62rem;font-weight:800;color:var(--muted)">＋ pince</span>'}</button>
          <div class="lvl">${[1, 2, 3].map(l => `<button data-niv="${i}" data-l="${l}" class="${b.niv === l ? 'on' : ''}">Niv ${l}</button>`).join('')}</div>
          <label class="chk-ob"><input type="checkbox" data-ob="${i}" ${b.ob ? 'checked' : ''}>oblig.</label><button class="btn btn-ghost" style="padding:6px 9px" data-rm="${i}">✕</button></div>`).join('')}</div>
        <button class="btn btn-ghost btn-block" style="margin-top:8px" id="addb">＋ Ajouter une balise</button></div>
      <div class="card" style="margin-top:12px"><h3>Points & pénalités</h3>
        <div class="row"><div><label>Points niveau 1</label><input id="p1" type="number" value="${p.pts[0]}"></div><div><label>Niveau 2</label><input id="p2" type="number" value="${p.pts[1]}"></div><div><label>Niveau 3</label><input id="p3" type="number" value="${p.pts[2]}"></div></div>
        <label>Mauvaise balise poinçonnée</label><div class="row"><div><input id="pwp" type="number" value="${p.penWrongP}"><small class="muted">point(s) en moins</small></div><div><input id="pws" type="number" value="${p.penWrongS}"><small class="muted">secondes ajoutées</small></div></div>
        <label>Balise obligatoire manquante</label><input id="pms" type="number" value="${p.penMissS}"><small class="muted">secondes ajoutées par balise</small>
        <label>Dépassement du temps attribué + écart</label><input id="pop" type="number" value="${p.penOverP}"><small class="muted">point(s) en moins par minute de retard</small></div>
      <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="sv">💾 Enregistrer</button><button class="btn btn-ghost" id="bk">Annuler</button>${idx != null ? '<button class="btn btn-danger" id="del">Supprimer</button>' : ''}</div></div>`;
      const $ = s => box.querySelector(s);
      const read = () => { p.nom = $('#nm').value.trim() || 'Parcours'; p.distance = +$('#di').value || 0; p.alloue = +$('#al').value || 0; p.ecart = +$('#ec').value || 0;
        p.denivOn = $('#dn').checked; if ($('#dv')) p.deniv = +$('#dv').value || 0;
        p.pts = [+$('#p1').value || 0, +$('#p2').value || 0, +$('#p3').value || 0]; p.penWrongP = +$('#pwp').value || 0; p.penWrongS = +$('#pws').value || 0; p.penMissS = +$('#pms').value || 0; p.penOverP = +$('#pop').value || 0;
        box.querySelectorAll('[data-num]').forEach(i => p.balises[+i.dataset.num].num = +i.value || 0); };
      $('#ty').onchange = () => { read(); p.type = $('#ty').value; if (p.type === 'reseau') p.balises.forEach(b => b.ob = false); draw(); };
      $('#dn').onchange = () => { read(); draw(); };
      $('#genb').onclick = () => { read(); const n = Math.max(1, +$('#nb').value || 1), n0 = +$('#n0').value || 31;
        p.balises = Array.from({ length: n }, (_, i) => p.balises[i] ? { ...p.balises[i], num: n0 + i } : { num: n0 + i, niv: 1, ob: p.type !== 'reseau' }); draw(); };
      $('#allob').onclick = () => { read(); p.balises.forEach(b => b.ob = true); draw(); };
      $('#allfa').onclick = () => { read(); p.balises.forEach(b => b.ob = false); draw(); };
      $('#addb').onclick = () => { read(); const last = p.balises[p.balises.length - 1]; p.balises.push({ num: last ? last.num + 1 : 31, niv: 1, ob: p.type !== 'reseau' }); draw(); };
      box.querySelectorAll('[data-niv]').forEach(b => b.onclick = () => { read(); p.balises[+b.dataset.niv].niv = +b.dataset.l; draw(); });
      box.querySelectorAll('[data-ob]').forEach(c => c.onchange = () => { p.balises[+c.dataset.ob].ob = c.checked; });
      box.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { read(); p.balises.splice(+b.dataset.rm, 1); draw(); });
      box.querySelectorAll('[data-pat]').forEach(b => b.onclick = () => { read(); const i = +b.dataset.pat;
        patPicker({ title: `Symbole de la balise ${p.balises[i].num}`, options: CO_PATS, current: p.balises[i].code, used: p.balises.map(x => x.code).filter(isPat),
          extra: isPat(p.balises[i].code) ? [{ v: '', l: 'Retirer le symbole' }] : [], onPick: c => { p.balises[i].code = c; draw(); } }); });
      $('#autop').onclick = () => { read(); const free = CO_PATS.filter(c => !p.balises.some(b => b.code === c)); p.balises.forEach(b => { if (!isPat(b.code)) b.code = free.shift() || ''; }); draw(); };
      $('#bk').onclick = () => listParcours(box);
      if ($('#del')) $('#del').onclick = () => { if (confirm('Supprimer ce parcours ?')) { DB.co.parcours.splice(idx, 1); save(); listParcours(box); } };
      $('#sv').onclick = () => { read(); const nums = p.balises.map(b => b.num); if (new Set(nums).size !== nums.length) return toast('Deux balises ont le même numéro');
        if (idx != null) DB.co.parcours[idx] = p; else DB.co.parcours.push(p); save(); toast('Parcours enregistré ✔'); listParcours(box); };
    };
    draw();
  }

  /* ================= 2. SÉANCE ================= */
  function result(r, p) {
    const found = new Set(r.found);
    const pts = p.balises.filter(b => found.has(b.num)).reduce((a, b) => a + (p.pts[b.niv - 1] || 0), 0);
    const miss = p.balises.filter(b => b.ob && !found.has(b.num)).length;
    const temps = r.dep && r.arr ? (r.arr - r.dep) / 1000 : null;
    const limit = (p.alloue + p.ecart) * 60;
    const overMin = temps != null && p.alloue ? Math.max(0, Math.ceil((temps - limit) / 60)) : 0;
    const penS = r.wrong * p.penWrongS + miss * p.penMissS, penP = r.wrong * p.penWrongP + overMin * p.penOverP;
    const km = (p.distance || 0) / 1000, kmE = km + (p.denivOn ? (p.deniv || 0) / 100 : 0);
    let statut = '';
    if (temps != null && p.alloue) { const d = temps / 60 - p.alloue; statut = Math.abs(d) <= p.ecart ? '✔ dans l\'écart' : d > 0 ? `hors délai +${Math.ceil(temps / 60 - p.alloue - p.ecart)} min` : 'plus rapide que prévu'; }
    return { pts, miss, temps, penS, penP, total: temps != null ? temps + penS : null, score: pts - penP, overMin, km, kmE, statut,
      rk: temps ? mpk(temps, km) : '–', rkE: temps && p.denivOn ? mpk(temps, kmE) : null, vit: temps && km ? (km / (temps / 3600)).toFixed(1).replace('.', ',') + ' km/h' : '–' };
  }

  /* ---- Séance partagée avec les autres tablettes (modèle sans résultats) ---- */
  const pub = (cur, create) => { if (cur.joined || cur.profOnly) return; const p = P(cur.parcours) || cur.psnap; if (!p) return;
    const indiv = cur.runs.every(r => r.members.length === 1 && r.name === r.members[0]);
    partPublish('co', cur.id, { nom: p.nom, classe: cur.classe || '', ng: cur.runs.length, indiv, ep: `${CO_TYPES[p.type][0]} · ${p.balises.length} balises`,
      tpl: { classe: cur.classe || '', parcours: cur.parcours, psnap: p, gap: cur.gap || 60, runs: cur.runs.map(r => ({ name: r.name, members: r.members, pc: r.pc || null, libre: r.libre || 0, choix: r.choix || 0 })) } }, create); };
  const join = (box, sp) => { const T = sp.tpl;
    DB.co.current = { id: sp.id, date: Date.now(), parcours: T.parcours, psnap: T.psnap, classe: T.classe, gap: T.gap || 60, joined: true,
      runs: T.runs.map(r => ({ name: r.name, members: [...r.members], pc: r.pc || null, libre: r.libre || 0, choix: r.choix || 0, sel: [], dep: null, arr: null, found: [], wrong: 0 })) };
    save(); const cur = DB.co.current;
    partPickGroup(box, cur.runs, i => { if (!DB.co.current) return prepare(box); cur.only = i; save(); seance(box); }, !!sp.indiv); };

  function seance(box) {
    const cur = DB.co.current;
    if (!cur) return prepare(box);
    const p = P(cur.parcours) || cur.psnap; if (!p) { DB.co.current = null; save(); return prepare(box); }
    let raf;
    /* Parcours de chaque équipe : celui de la séance, un autre parcours choisi (r.pc), ou « choix libre » de N balises (r.libre, r.sel) */
    const baseOf = r => (r.pc && P(r.pc)) || p;
    const pOf = r => { const b = baseOf(r); if (!r.libre) return b; const sel = r.sel || [];
      return { ...b, id: b.id + '~libre' + r.libre, nom: `${b.nom} · choix libre (${r.libre} balises)`, balises: b.balises.filter(x => sel.includes(x.num)) }; };
    const needSel = r => r.libre && (r.sel || []).length < r.libre;
    const pcPick = (r, i) => `<div class="co-pick"><select data-pcs="${i}" style="padding:8px">${DB.co.parcours.map(x => `<option value="${x.id}" ${baseOf(r).id === x.id ? 'selected' : ''}>${esc(x.nom)} · ${x.balises.length} bal.</option>`).join('')}</select>
      <select data-lib="${i}" style="padding:8px"><option value="0">Toutes les balises du parcours</option>${Array.from({ length: Math.max(0, baseOf(r).balises.length - 1) }, (_, k) => k + 2).map(n => `<option value="${n}" ${r.libre === n ? 'selected' : ''}>🎯 Choix libre : ${n} balises</option>`).join('')}</select></div>`;
    const selPick = (r, i) => { const b = baseOf(r), sel = r.sel || [];
      return `<div style="margin-top:8px"><div style="font-weight:800;font-size:.85rem">🎯 Choisissez ${r.libre} balises · ${sel.length}/${r.libre}</div><div class="bal-chips">${b.balises.map(x => `<button data-sel="${i}" data-n="${x.num}" class="${sel.includes(x.num) ? 'on' : ''}">${x.num}<sup> N${x.niv}</sup></button>`).join('')}</div></div>`; };
    const bindPick = (root, redraw) => {
      root.querySelectorAll('[data-pcs]').forEach(sl => sl.onchange = () => { const r = cur.runs[+sl.dataset.pcs]; r.pc = sl.value === cur.parcours ? null : sl.value; r.sel = []; r.found = []; save(); pub(cur); redraw(); });
      root.querySelectorAll('[data-lib]').forEach(sl => sl.onchange = () => { const r = cur.runs[+sl.dataset.lib]; r.libre = +sl.value; r.sel = []; r.found = []; save(); pub(cur); redraw(); });
      root.querySelectorAll('[data-sel]').forEach(bt => bt.onclick = () => { const r = cur.runs[+bt.dataset.sel], n = +bt.dataset.n; r.sel = r.sel || [];
        if (r.sel.includes(n)) r.sel = r.sel.filter(x => x !== n); else if (r.sel.length < r.libre) r.sel = [...r.sel, n]; else return toast(`Déjà ${r.libre} balises choisies : retirez-en une`);
        beep(900, .04); save(); redraw(); }); };
    // 🔁 Nouveau parcours après l'arrivée : la course terminée est enregistrée, l'équipe repart sur un autre parcours
    const again = (i, redraw) => { const r = cur.runs[i], pp = pOf(r);
      const rec = { ...cur, id: cur.id + '-' + Math.random().toString(36).slice(2, 6), parcours: baseOf(r).id, runs: [JSON.parse(JSON.stringify(r))], parcoursSnap: JSON.parse(JSON.stringify(pp)) };
      ['only', 'joined', 'psnap', 'profOnly'].forEach(k => delete rec[k]); DB.co.seances.push(rec); coResults(rec);
      Object.assign(r, { dep: null, arr: null, found: [], wrong: 0, sel: [], done: (r.done || 0) + 1 }); save(); toast(`Course enregistrée ✔ · ${r.name} : choisissez le nouveau parcours`); redraw(); };
    const tabs = on => { const t = el.querySelector('.co-tabs'); if (t) t.style.display = on ? '' : 'none'; };
    // Vue « une seule équipe » : ce que voient les élèves sur leur tablette (cur.only reste sur l'appareil)
    const drawGroup = () => {
      const i = cur.only, r = cur.runs[i], p = pOf(r), x = result(r, p), run = r.dep && !r.arr, tot = p.balises.length, n = r.found.length;
      const CT = coCtl(p), LATE = CT.when === 'arrivee', act = LATE ? !!r.arr : run;   // act : balises contrôlables maintenant
      const missOb = p.balises.filter(b => b.ob && !r.found.includes(b.num)).length;
      tabs(false);
      box.innerHTML = `<div class="card" style="text-align:center"><div style="font-weight:900;font-size:1.3rem">🧭 ${esc(r.name)}</div>${r.members.length > 1 || r.name !== r.members[0] ? `<div class="muted">${r.members.map(esc).join(', ')}</div>` : ''}
          <div class="gv-clock" data-live="${i}" style="color:${r.arr ? '#1B9E5A' : 'inherit'}">${r.dep ? hms(((r.arr || Date.now()) - r.dep) / 1000) : '0:00'}</div>
          <div class="muted">${esc(p.nom)} · ${CO_TYPES[p.type][0]}${p.alloue ? ` · temps attribué ${p.alloue} min ± ${p.ecart}` : ''}</div>
          <div style="height:10px;border-radius:99px;background:var(--line);overflow:hidden;margin:10px 0 4px"><div style="height:100%;width:${tot ? n / tot * 100 : 0}%;background:#1B9E5A"></div></div>
          <div class="muted" style="font-size:.85rem">${n} / ${tot} balises trouvées · <b style="color:var(--text)">${x.score} pts</b>${missOb ? ` · ${missOb} obligatoire${missOb > 1 ? 's' : ''} à trouver` : ''}${r.wrong ? ` · ${r.wrong} mauvaise${r.wrong > 1 ? 's' : ''} balise${r.wrong > 1 ? 's' : ''}` : ''}</div>
          ${!r.dep ? `${r.choix || DB.co.parcours.length > 1 || r.libre ? `<div style="margin-top:10px;text-align:left">${pcPick(r, i)}${r.libre ? selPick(r, i) : ''}</div>` : ''}<button class="btn btn-grad btn-block" style="margin-top:12px;font-size:1.2rem;padding:16px" id="gv-go" ${needSel(r) ? 'disabled' : ''}>▶ Départ${r.plan ? ' à ' + clock(r.plan).slice(0, 5) : ''}</button>` : ''}
          ${run ? `<button class="btn ${missOb && !LATE ? 'btn-danger' : 'btn-grad'} btn-block" style="margin-top:12px;font-size:1.15rem;padding:14px" id="gv-fin">🏁 Arrivée${!missOb && !LATE ? ' — toutes les obligatoires sont trouvées !' : ''}</button>` : ''}
          ${r.arr ? `<div style="margin-top:10px;font-weight:800">✅ Course terminée · ${x.score} pts${x.temps != null ? ` · RK ${x.rk}` : ''}${x.penS ? ` · pénalités +${hms(x.penS)}` : ''}${x.statut ? ' · ' + x.statut : ''}</div>` : ''}</div>
        <div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between;align-items:center"><b>Balises</b><span class="muted" style="font-size:.8rem">${LATE ? (run ? '📝 Note le symbole de chaque balise sur ton carton · contrôle à l\'arrivée' : r.arr ? (CT.how === 'auto' ? 'Compare avec ton carton (ci-dessous)' : 'Touchez chaque balise de ton carton pour la contrôler') : !r.dep ? 'Appuyez sur ▶ Départ pour commencer' : '')
            : run ? p.balises.some(b => isPat(b.code)) ? 'Touchez une balise trouvée puis le symbole de sa pince' : 'Touchez une balise dès qu\'elle est trouvée' : !r.dep ? 'Appuyez sur ▶ Départ pour commencer' : ''}</span></div>
          ${p.balises.map(b => { const on = r.found.includes(b.num);
            return `<button class="gv-it ${on ? 'on' : ''}" data-bal="${b.num}" ${act && !(LATE && CT.how === 'auto' && isPat(b.code)) ? '' : 'disabled'}><span class="bx">${on ? '✓' : ''}</span><span class="t" style="flex:1">Balise ${b.num}</span><span class="muted" style="font-size:.8rem;font-weight:700">N${b.niv} · ${p.pts[b.niv - 1] || 0} pt${(p.pts[b.niv - 1] || 0) > 1 ? 's' : ''}${b.ob ? ' · <b style="color:var(--danger)">obligatoire</b>' : ''}</span>${on && isPat(b.code) && (CT.how !== 'auto' || (r.auto || {})[b.num] === 'ok') ? patSVG(b.code, 34) : ''}</button>`; }).join('')}</div>
        ${r.arr ? ctlCard(r, p) : ''}
        ${r.arr ? `<button class="btn btn-grad btn-block" style="margin-top:12px;font-size:1.1rem;padding:16px" id="save">💾 Enregistrer notre course</button><button class="btn btn-ghost btn-block" style="margin-top:8px" data-again="${i}">🔁 Enregistrer et repartir sur un nouveau parcours</button>` : ''}
        <div style="text-align:center;margin:18px 0 6px"><button class="link" id="gv-prof">🔒 Mode enseignant</button></div>`;
      const $ = s => box.querySelector(s);
      if ($('#gv-go')) $('#gv-go').onclick = () => { if (needSel(r)) return toast(`Choisissez ${r.libre} balises`); r.dep = Date.now(); beep(1300, .45); save(); drawGroup(); };
      box.querySelectorAll('[data-ac]').forEach(bt => bt.onclick = () => { const [num0, v] = bt.dataset.ac.split('|'), num = +num0; r.auto = r.auto || {}; const was = r.auto[num];
        if (was === v) return;
        if (was === 'ko') r.wrong = Math.max(0, r.wrong - 1);
        r.found = r.found.filter(y => y !== num); if (v === 'ok') r.found = [...r.found, num]; if (v === 'ko') r.wrong++;
        r.auto[num] = v; save(); drawGroup(); });
      bindPick(box, drawGroup); box.querySelectorAll('[data-again]').forEach(b => b.onclick = () => again(+b.dataset.again, drawGroup));
      if ($('#gv-fin')) $('#gv-fin').onclick = () => { if (missOb && !LATE && !confirm(`Il reste ${missOb} balise(s) obligatoire(s) à trouver. Valider l'arrivée ?`)) return; r.arr = Date.now(); beep(1000, .3); save(); drawGroup(); };
      const mark = num => { r.found = [...r.found, num]; beep(900, .06); save(); drawGroup(); };
      box.querySelectorAll('[data-bal]').forEach(bt => bt.onclick = () => { const num = +bt.dataset.bal, b = p.balises.find(y => y.num === num);
        if (r.found.includes(num)) { if (confirm(`Décocher la balise ${num} ?`)) { r.found = r.found.filter(y => y !== num); save(); drawGroup(); } return; }
        const ctl = CT.how;
        if (!isPat(b.code) || ctl === 'auto') return mark(num);   // comparaison : vérification avec le carton à l'arrivée
        // validation par le symbole de la pince : un mauvais symbole compte comme une mauvaise balise
        const judge = c => { r.tries = { ...(r.tries || {}), [num]: c || 'X' };
          if (c === 'V') { save(); return drawGroup(); }   // case vide : balise pas trouvée, pas de pénalité
          if (c === b.code) return mark(num);
          r.wrong++; beep(300, .35); save(); toast(c === 'X' ? '✗ Symbole absent : cette pince n\'est pas une balise de ton parcours (mauvaise balise)' : '✗ Ce n\'est pas le symbole de cette balise (mauvaise balise)'); drawGroup(); };
        const vide = LATE ? [{ v: 'V', l: '⬜ Case vide : balise pas trouvée' }] : [];
        if (ctl === 'dessin') return patPicker({ title: `Balise ${num} : dessine le symbole ${LATE ? 'de ton carton' : 'laissé par la pince'}`, options: [], only: 'draw', extra: vide, onPick: judge });
        const opts = [...new Set(p.balises.map(y => y.code).filter(isPat))].sort();
        patPicker({ title: `Balise ${num} : quel symbole a laissé la pince ?`, options: opts, draw: false, extra: [{ v: 'X', l: '❓ Le symbole n\'est pas dans la liste' }, ...vide], onPick: judge }); });
      $('#gv-prof').onclick = () => { if (!confirm('Passer en mode enseignant (toutes les équipes, réglages) ?')) return; cur.only = null; save(); draw(); };
      if ($('#save')) $('#save').onclick = saveSeance;
    };
    /* Après l'arrivée : auto-correction (symboles attendus affichés, l'élève coche VALIDÉ / FAUX) ou comparaison de ses symboles */
    const ctlCard = (r, p) => { const ctl = coCtl(p).how, LATE = coCtl(p).when === 'arrivee', PB = p.balises.filter(b => isPat(b.code)); if (!PB.length) return '';
      if (ctl === 'auto') { const L = LATE ? PB : PB.filter(b => r.found.includes(b.num) || (r.auto || {})[b.num]); if (!L.length) return '';
        const left = L.filter(b => !(r.auto || {})[b.num]).length;
        return `<div class="card" style="margin-top:10px;border:2px solid var(--gold,#C9A227)"><h3 style="margin-top:0">👀 Auto-correction</h3><p class="muted" style="margin:0 0 8px;font-size:.85rem">Compare chaque symbole avec la case de ton carton, puis coche <b>VALIDÉ</b> ou <b>FAUX</b>.${left ? ` Encore ${left} à vérifier.` : ' ✅ Tout est vérifié.'}</p>
          ${L.map(b => { const v = (r.auto || {})[b.num]; return `<div style="padding:8px 0;border-top:1px solid var(--line)"><div style="display:flex;align-items:center;gap:12px"><b style="flex:1;min-width:0">Balise ${b.num}</b><span style="flex:0 0 auto;display:inline-block">${patSVG(b.code, 56)}</span></div>
            <div style="display:flex;gap:6px;margin-top:6px"><button class="btn ${v === 'ok' ? 'btn-grad' : 'btn-ghost'}" style="flex:1;padding:9px 6px" data-ac="${b.num}|ok">✅ VALIDÉ</button><button class="btn ${v === 'ko' ? 'btn-danger' : 'btn-ghost'}" style="flex:1;padding:9px 6px" data-ac="${b.num}|ko">❌ FAUX</button>${LATE ? `<button class="btn ${v === 'na' ? 'btn-grad' : 'btn-ghost'}" style="flex:1;padding:9px 6px" data-ac="${b.num}|na">⬜ Pas trouvée</button>` : ''}</div></div>`; }).join('')}</div>`; }
      const T = r.tries || {}, L = PB.filter(b => T[b.num]); if (!L.length) return '';
      return `<div class="card" style="margin-top:10px"><h3 style="margin-top:0">🔍 Mes symboles / symboles attendus</h3>
        ${L.map(b => { const ok = T[b.num] === b.code; return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)"><b style="min-width:84px">Balise ${b.num}</b>
          <div style="text-align:center;flex:0 0 auto"><div class="muted" style="font-size:.7rem">${ctl === 'dessin' ? 'mon dessin' : 'mon choix'}</div>${isPat(T[b.num]) ? patSVG(T[b.num], 44) : '<span style="font-size:1.6rem">❓</span>'}</div>
          <div style="text-align:center;flex:0 0 auto"><div class="muted" style="font-size:.7rem">attendu</div>${patSVG(b.code, 44)}</div><b style="margin-left:auto;font-size:1.3rem;color:${ok ? '#1B9E5A' : '#D64545'}">${ok ? '✓' : '✗'}</b></div>`; }).join('')}</div>`; };
    const saveSeance = () => { const tab1 = cur.only != null && cur.runs[cur.only];
      if (!tab1 && cur.runs.some(r => r.dep && !r.arr) && !confirm('Certains élèves ne sont pas arrivés. Enregistrer quand même ?')) return;
      // tablette d'une équipe : seule SA course est enregistrée (pas de lignes vides pour les autres)
      // id unique par tablette (fusion de synchro par id) ; regroupées à l'affichage (même jour + classe + parcours)
      // une fiche par parcours (les équipes peuvent courir des parcours différents)
      const by = new Map(); (tab1 ? [tab1] : cur.runs).forEach(r => { const pp = pOf(r); if (!by.has(pp.id)) by.set(pp.id, { pp, base: baseOf(r).id, runs: [] }); by.get(pp.id).runs.push(r); });
      by.forEach(({ pp, base, runs }) => { if (!runs.some(r => r.dep) && by.size > 1) return;
        const rec = { ...cur, id: cur.id + '-' + Math.random().toString(36).slice(2, 6), parcours: base, runs, parcoursSnap: JSON.parse(JSON.stringify(pp)) }; ['only', 'joined', 'psnap', 'profOnly'].forEach(k => delete rec[k]);
        DB.co.seances.push(rec); coResults(rec); });
      DB.co.current = null; save(); toast('Séance enregistrée ✔'); tabs(true); tab = 'bilan'; frame(); };
    const draw = () => {
      if (cur.only != null && cur.runs[cur.only]) return drawGroup();
      tabs(true);
      const rs = cur.runs.map(r => ({ r, x: result(r, pOf(r)) }));
      box.innerHTML = `<div class="card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><div><b>${esc(p.nom)}</b><div class="muted">${esc(cur.classe || '')} · ${CO_TYPES[p.type][0]} · ${p.balises.length} balises${p.alloue ? ` · ${p.alloue} min ± ${p.ecart}` : ''}</div></div><div class="run-t" id="now">${clock(Date.now())}</div></div>
          <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="all">🚩 Départ groupé</button><button class="btn btn-ghost btn-block" data-cfg="bare" style="margin-top:8px" id="edg">✏️ Modifier les groupes / participants (absent, blessé…)</button><div data-cfg="bare" style="display:flex;gap:6px;align-items:center;flex:1.3"><input id="gap" type="number" value="${cur.gap || 60}" style="width:70px;padding:8px"><button class="btn btn-ghost" id="stag" style="padding:9px 8px;font-size:.8rem">Départs échelonnés (s)</button></div></div>
          <p class="muted" style="margin:8px 0 0;font-size:.8rem">Balises : touchez un numéro trouvé (souligné rouge = obligatoire).</p>
          ${cur.profOnly ? '<p class="muted" style="margin:8px 0 0;font-size:.8rem">📋 Suivi enseignant uniquement : les élèves courent sans tablette ; arrêtez le temps à leur retour et cochez les balises de leur coupon papier.</p>' : ''}
          ${cur.runs.length > 1 && !cur.profOnly ? `<div data-cfg="bare"><label>📱 Tablette d'une équipe (les élèves ne verront que leur équipe)</label><select id="only"><option value="">Toutes</option>${cur.runs.map((r, i) => `<option value="${i}">${esc(r.name)}</option>`).join('')}</select></div>` : ''}</div>
        ${rs.map(({ r, x }, i) => `<div class="run ${r.arr ? 'fin' : r.dep ? 'go' : ''}"><div class="run-h"><b>${esc(r.name)}</b><span class="run-t" data-live="${i}">${r.dep ? hms(((r.arr || Date.now()) - r.dep) / 1000) : '0:00'}</span></div>
            ${r.members.length > 1 || r.name !== r.members[0] ? `<div class="muted" style="font-size:.8rem">${r.members.map(esc).join(', ')}</div>` : ''}
            <div class="co-times"><div><label style="margin:0 0 3px">Départ</label>${r.dep ? `<input type="time" step="1" data-cfg="bare" data-dep="${i}" value="${new Date(r.dep).toTimeString().slice(0, 8)}">` : `<button class="btn btn-grad btn-block" data-go="${i}">▶ Départ${r.plan ? ' ' + clock(r.plan).slice(0, 5) : ''}</button>`}</div>
              <div><label style="margin:0 0 3px">Arrivée</label>${r.arr ? `<input type="time" step="1" data-cfg="bare" data-arr="${i}" value="${new Date(r.arr).toTimeString().slice(0, 8)}">` : `<button class="btn ${r.dep ? 'btn-danger' : 'btn-ghost'} btn-block" data-fin="${i}" ${r.dep ? '' : 'disabled'}>🏁 Arrivée</button>`}</div></div>
            ${!r.dep && (r.choix || r.libre || (DB.co.parcours.length > 1 && cur.runs.length <= 12)) ? pcPick(r, i) + (r.libre ? selPick(r, i) : '') : `${baseOf(r) !== p || r.libre ? `<div class="muted" style="font-size:.78rem;margin-top:4px">🗺 ${esc(pOf(r).nom)}</div>` : ''}<div class="bal-chips">${pOf(r).balises.map(b => `<button data-b="${i}" data-n="${b.num}" class="${r.found.includes(b.num) ? 'on' : ''} ${b.ob ? 'ob' : ''}">${b.num}<sup> N${b.niv}</sup></button>`).join('')}</div>`}
            ${r.arr ? `<button class="btn btn-ghost btn-block" style="margin-top:8px;padding:9px" data-again="${i}">🔁 Enregistrer et repartir sur un nouveau parcours</button>` : ''}${r.done ? `<div class="muted" style="font-size:.75rem;margin-top:4px">${r.done} parcours déjà terminé${r.done > 1 ? 's' : ''} dans cette séance</div>` : ''}
            <div style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:.85rem"><span>Mauvaises balises :</span><button class="btn btn-ghost" style="padding:5px 12px" data-wm="${i}">−</button><b>${r.wrong}</b><button class="btn btn-ghost" style="padding:5px 12px" data-wp="${i}">+</button></div>
            <div class="muted" style="margin-top:6px;font-size:.8rem">${r.found.length}/${pOf(r).balises.length} balises · <b style="color:var(--text)">${x.score} pts</b>${x.penP ? ` (−${x.penP})` : ''}${x.miss ? ` · ${x.miss} oblig. manquante(s)` : ''}${x.temps != null ? ` · RK ${x.rk}${x.penS ? ` · pénalités +${hms(x.penS)}` : ''}${x.statut ? ' · ' + x.statut : ''}` : ''}</div></div>`).join('')}
        <div class="section-title"><h2>Classement</h2></div>${ranking(rs, p)}
        <div class="row" style="margin-top:12px"><button class="btn btn-grad" data-cfg="bare" id="save">💾 Terminer et enregistrer la séance</button><button class="btn btn-ghost" data-cfg="bare" id="cancel">Abandonner</button></div>`;
      const $ = s => box.querySelector(s), keep = () => save();
      $('#all').onclick = () => { const t = Date.now(), w = cur.runs.filter(r => !r.dep && needSel(r)); cur.runs.forEach(r => { if (!r.dep && !needSel(r)) r.dep = t; }); if (w.length) toast(`${w.length} équipe(s) doivent d'abord choisir leurs balises`); beep(1300, .4); keep(); draw(); };
      $('#edg').onclick = () => { const indiv = cur.runs.every(r => r.members.length === 1 && r.name === r.members[0]);
        editGroupsPanel(indiv ? 'Participants' : 'Groupes de la séance', { cls: cur.classe, indiv, list: () => cur.runs, names: r => r.members,
          take: (r, n) => { r.members.splice(r.members.indexOf(n), 1); return indiv ? { dep: r.dep, arr: r.arr, found: r.found, wrong: r.wrong, plan: r.plan } : null; },
          put: (r, n, d) => { r.members.push(n); if (indiv && d) Object.assign(r, d); },
          make: name => ({ name, members: [], dep: null, arr: null, found: [], wrong: 0 }), onChange: () => { keep(); pub(cur); }, onClose: draw }); };
      $('#stag').onclick = () => { cur.gap = Math.max(5, +$('#gap').value || 60); const t0 = Date.now() + 60000; cur.runs.forEach((r, i) => r.plan = t0 + i * cur.gap * 1000); keep(); toast('Horaires de départ prévus (1er départ dans 1 min)'); draw(); };
      box.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { const r = cur.runs[+b.dataset.go]; if (needSel(r)) return toast(`${r.name} : choisissez ${r.libre} balises`); r.dep = Date.now(); beep(1300, .3); keep(); draw(); });
      bindPick(box, draw); box.querySelectorAll('[data-again]').forEach(b => b.onclick = () => again(+b.dataset.again, draw));
      box.querySelectorAll('[data-fin]').forEach(b => b.onclick = () => { cur.runs[+b.dataset.fin].arr = Date.now(); beep(1000, .3); keep(); draw(); });
      const setT = (i, k, v) => { const [h, m, s] = v.split(':').map(Number); const d = new Date(cur.runs[i][k]); d.setHours(h || 0, m || 0, s || 0, 0); cur.runs[i][k] = d.getTime(); keep(); draw(); };
      box.querySelectorAll('[data-dep]').forEach(inp => inp.onchange = () => setT(+inp.dataset.dep, 'dep', inp.value));
      box.querySelectorAll('[data-arr]').forEach(inp => inp.onchange = () => setT(+inp.dataset.arr, 'arr', inp.value));
      box.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { const r = cur.runs[+b.dataset.b], n = +b.dataset.n; r.found = r.found.includes(n) ? r.found.filter(x => x !== n) : [...r.found, n]; keep(); draw(); });
      box.querySelectorAll('[data-wp]').forEach(b => b.onclick = () => { cur.runs[+b.dataset.wp].wrong++; keep(); draw(); });
      box.querySelectorAll('[data-wm]').forEach(b => b.onclick = () => { const r = cur.runs[+b.dataset.wm]; r.wrong = Math.max(0, r.wrong - 1); keep(); draw(); });
      if ($('#only')) $('#only').onchange = ev => { if (ev.target.value === '') return; cur.only = +ev.target.value; keep(); draw(); };
      $('#save').onclick = saveSeance;
      $('#cancel').onclick = () => { if (confirm('Abandonner cette séance ? Les temps saisis seront perdus.')) { partAskRemove(cur); DB.co.current = null; save(); draw2(); } };
    };
    const draw2 = () => { cancelAnimationFrame(raf); prepare(box); };
    const tick = () => { if (!box.isConnected || !DB.co.current) return; const n = box.querySelector('#now'); if (n) n.textContent = clock(Date.now());
      cur.runs.forEach((r, i) => { const e = box.querySelector(`[data-live="${i}"]`); if (e && r.dep && !r.arr) e.textContent = hms((Date.now() - r.dep) / 1000); });
      raf = requestAnimationFrame(tick); };
    draw(); tick();
  }

  function ranking(rs, p) {
    const done = rs.filter(({ x }) => x.temps != null).sort((a, b) => b.x.score - a.x.score || a.x.total - b.x.total);
    if (!done.length) return '<div class="card empty">Le classement apparaît dès les premières arrivées.</div>';
    return `<div class="card sheet-table"><table><tr><th>#</th><th>Nom</th><th>Pts</th><th>Temps</th><th>+ Pén.</th><th>Total</th><th>RK</th>${p.denivOn ? '<th>RK effort</th>' : ''}<th>Vitesse</th></tr>
      ${done.map(({ r, x }, i) => `<tr><td>${i + 1}</td><td><b>${esc(r.name)}</b></td><td><b>${x.score}</b></td><td>${hms(x.temps)}</td><td>${x.penS ? '+' + hms(x.penS) : '–'}</td><td><b>${hms(x.total)}</b></td><td>${x.rk}</td>${p.denivOn ? `<td>${x.rkE}</td>` : ''}<td>${x.vit}</td></tr>`).join('')}</table>
      <p class="muted" style="font-size:.75rem;margin:6px 0 0">Classement : points (balises − pénalités), puis temps total (temps réalisé + pénalités). RK = rythme au kilomètre${p.denivOn ? ' ; RK effort = avec 100 m de D+ comptés comme 1 km' : ''}.</p></div>`;
  }

  /* Synthèse « Résultats des élèves » : une ligne par élève (de la classe) de chaque course enregistrée */
  function coResults(s) {
    const p = s.parcoursSnap, cls = s.classe || '', st = cls ? studentsOf(cls) : [];
    if (!st.length || typeof saveResult !== 'function') return;
    s.runs.filter(r => r.dep).forEach(r => { const x = result(r, p), grp = r.members.length > 1 || r.name !== r.members[0];
      const valeur = `${x.score} pts${x.total != null ? ' · ' + hms(x.total) : ''}`;
      const detail = [p.nom + (grp ? ` (${r.name})` : ''), `${r.found.length}/${p.balises.length} balises`, x.penS || x.penP ? `pén. ${[x.penS ? '+' + hms(x.penS) : '', x.penP ? '−' + x.penP + ' pt' : ''].filter(Boolean).join(' ')}` : '', r.arr ? x.statut : 'non arrivé'].filter(Boolean).join(' · ');
      r.members.filter(m => st.includes(m)).forEach(m => saveResult({ tool: 'co', label: 'Course d\'orientation', classe: cls, eleve: m, valeur, detail })); });
  }

  /* Fusion d'affichage : séances enregistrées sur plusieurs tablettes (même jour + classe + parcours) = une seule séance.
     Les enregistrements restent séparés dans DB.co.seances (sync par id sans risque). */
  const dayKey = t => { const d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  function coGroups(ss) {
    const G = new Map();
    ss.forEach(s => { const k = dayKey(s.date) + '|' + (s.classe || '') + '|' + (s.parcours || s.parcoursSnap.nom);
      if (!G.has(k)) G.set(k, { recs: [], date: s.date }); const g = G.get(k); g.recs.push(s); g.date = Math.max(g.date, s.date); });
    return [...G.values()].map(g => { const by = new Map(), rank = r => r.arr ? 2 : r.dep ? 1 : 0;
      // une même équipe enregistrée par 2 tablettes (ex. tablette d'équipe + tablette enseignant) : on garde la plus complète
      g.recs.forEach(s => s.runs.forEach(r => { const k = r.name + '|' + r.members.join(','), o = by.get(k); if (!o || rank(r) > rank(o.r)) by.set(k, { r, p: s.parcoursSnap }); }));
      g.p = g.recs.reduce((a, s) => s.date >= a.date ? s : a).parcoursSnap; g.runs = [...by.values()]; return g; }).sort((a, b) => b.date - a.date);
  }

  function prepare(box) {
    if (!DB.co.parcours.length) { box.innerHTML = '<div class="card empty">Créez d\'abord un parcours dans l\'onglet 🗺 Parcours.</div>'; partMount(box, 'co', sp => join(box, sp)); return; }
    let mode = 'indiv', choice = false, profOnly = false;
    const draw = () => {
      box.innerHTML = `<div class="card" data-cfg><h3>Nouvelle séance</h3>
        <label>Parcours</label><select id="pc">${DB.co.parcours.map(p => `<option value="${p.id}">${esc(p.nom)} — ${p.balises.length} balises</option>`).join('')}</select>
        <label>Organisation</label><div class="seg"><button data-md="indiv" class="${mode === 'indiv' ? 'on' : ''}">Parcours individuels</button><button data-md="grp" class="${mode === 'grp' ? 'on' : ''}">Groupes<br><small style="font-weight:600;opacity:.85">homogènes / hétérogènes</small></button></div>
        <label style="display:flex;gap:8px;align-items:flex-start;margin-top:12px"><input type="checkbox" id="pchoice" ${choice ? 'checked' : ''} style="width:auto;margin-top:3px"> <span>Chaque ${mode === 'indiv' ? 'élève' : 'groupe'} choisit son parcours (ou ses balises en choix libre) au départ</span></label>
        <label style="display:flex;gap:8px;align-items:flex-start;margin-top:8px"><input type="checkbox" id="profo" ${profOnly ? 'checked' : ''} style="width:auto;margin-top:3px"> <span>📋 Suivi enseignant uniquement (pas de tablette pour les élèves : temps à l'arrivée, balises du coupon papier)</span></label>
        <div id="who" style="margin-top:10px"></div></div>`;
      box.querySelector('#pchoice').onchange = e => { choice = e.target.checked; };
      box.querySelector('#profo').onchange = e => { profOnly = e.target.checked; };
      box.querySelectorAll('[data-md]').forEach(b => b.onclick = () => { mode = b.dataset.md; draw(); });
      const who = box.querySelector('#who');
      const launch = (runs, classe) => { if (choice) runs.forEach(r => { r.choix = 1; });
        DB.co.current = { id: coId(), date: Date.now(), parcours: box.querySelector('#pc').value, classe, runs, gap: 60, ...(profOnly ? { profOnly: true } : {}) }; pub(DB.co.current, true); save(); seance(box); };
      if (mode === 'indiv') {
        who.innerHTML = DB.classes.length ? `<label>Classe</label><select id="cl">${DB.classes.map(c => `<option>${esc(c.name)}</option>`).join('')}</select>
          <button class="btn btn-grad btn-block" style="margin-top:12px" id="go">▶ Préparer la séance</button>` : noClassMsg;
        const go = who.querySelector('#go');
        if (go) go.onclick = () => { const c = who.querySelector('#cl').value; launch(studentsOf(c).map(n => ({ name: n, members: [n], dep: null, arr: null, found: [], wrong: 0 })), c); };
      } else {
        mountComposer(who, { id: 'coc', modes: ['random', 'hetero', 'homo'], button: '▶ Former les groupes et préparer la séance',
          onTeams: teams => { const c = who.querySelector('#coc-cls')?.value || ''; launch(teams.map(t => ({ name: t.name.replace('Équipe', 'Groupe'), members: t.members.map(m => m.n), dep: null, arr: null, found: [], wrong: 0 })), c); } });
      }
      partMount(box, 'co', sp => join(box, sp));
    };
    draw();
  }

  /* ================= CONTRÔLE DES CARTONS ================= */
  const CK = { pc: null, ans: {}, photo: null, run: '' };
  function ctlSettings(box) {
    box.innerHTML = ''; const C = coCtl(), h = document.createElement('div');
    h.innerHTML = `<div class="card" data-cfg style="margin-bottom:12px;border:2px solid var(--gold,#C9A227)"><h3 style="margin-top:0">🧑‍🎓 Contrôle par l'élève (tablette de l'équipe)</h3>
      <label>Quand ?</label><div class="seg">${[['arrivee', '📝 À l\'arrivée (carton papier)'], ['live', '📱 Pendant la course']].map(([k, l]) => `<button data-cw="${k}" class="${C.when === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <label>Comment ?</label><div class="seg">${[['choix', '🔣 Choisir le symbole'], ['dessin', '✏️ Dessiner le symbole'], ['auto', '👀 Comparer avec le carton']].map(([k, l]) => `<button data-chw="${k}" class="${C.how === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <p class="muted" style="margin:6px 0 0;font-size:.8rem">${C.when === 'arrivee' ? 'Les élèves partent sans tablette, avec leur carton et un stylo. À l\'arrivée, le chrono s\'arrête puis ils contrôlent leurs balises sur la tablette : ' : 'Les élèves gardent la tablette ou le téléphone et contrôlent chaque balise dès qu\'elle est trouvée : '}${{ choix: 'ils touchent la balise puis choisissent le symbole de la pince (« Le symbole n\'est pas dans la liste » si besoin).', dessin: 'ils redessinent le symbole sur la grille de points, puis voient « mon dessin / attendu ».', auto: C.when === 'arrivee' ? 'les symboles attendus s\'affichent à côté de chaque balise ; ils comparent avec leur carton et cochent VALIDÉ, FAUX ou Pas trouvée.' : 'ils cochent leurs balises ; à l\'arrivée, les symboles attendus s\'affichent et ils cochent VALIDÉ ou FAUX.' }[C.how]}</p></div>`;
    box.prepend(h);
    h.querySelectorAll('[data-cw]').forEach(b => b.onclick = () => { DB.co.ctl = { ...coCtl(), when: b.dataset.cw }; save(); window.syncFlush && window.syncFlush(); ctlSettings(box); });
    h.querySelectorAll('[data-chw]').forEach(b => b.onclick = () => { DB.co.ctl = { ...coCtl(), how: b.dataset.chw }; save(); window.syncFlush && window.syncFlush(); ctlSettings(box); });
  }
  function controle(box) { box.innerHTML = ''; const top = document.createElement('div'), sub = document.createElement('div'); box.append(top, sub); ctlSettings(top); controle0(sub); }
  function controle0(box) {
    const withCodes = DB.co.parcours.filter(p => p.balises.some(b => isPat(b.code)));
    if (!withCodes.length) { box.innerHTML = `<div class="card empty">Attribuez d'abord un <b>symbole de pince</b> aux balises d'un parcours (onglet 🗺 Parcours → ✏️).</div>`; return; }
    const cur = DB.co.current;
    if (!withCodes.some(p => p.id === CK.pc)) CK.pc = cur && withCodes.some(p => p.id === cur.parcours) ? cur.parcours : withCodes[0].id;
    const p = P(CK.pc), live = cur && cur.parcours === p.id ? cur : null;
    const status = b => { const a = CK.ans[b.num]; if (!a || !isPat(b.code)) return 0; return a === b.code ? 1 : -1; };
    const cell = b => { const a = CK.ans[b.num]; return !a ? '<span style="display:grid;place-items:center;width:44px;height:44px;border:1.5px dashed var(--line);border-radius:6px;font-size:.62rem;font-weight:800;color:var(--muted)">choisir</span>'
      : a === 'X' ? '<span style="display:grid;place-items:center;width:44px;height:44px;border:1.5px solid var(--danger);border-radius:6px;font-weight:900;color:var(--danger)">?</span>' : patSVG(a, 44); };
    const res = b => { const s2 = status(b); return s2 === 1 ? '<b style="color:#1B9E5A">✔ bon</b>' : s2 === -1 ? '<b style="color:var(--danger)">✗ faux</b>' : '<span class="muted">non poinçonnée</span>'; };
    const draw = () => {
      const st = p.balises.map(status), ok = st.filter(x => x === 1).length, ko = st.filter(x => x === -1).length;
      box.innerHTML = `<div class="card"><label>Parcours</label><select id="kp">${withCodes.map(x => `<option value="${x.id}" ${x.id === p.id ? 'selected' : ''}>${esc(x.nom)}</option>`).join('')}</select>
          ${live ? `<label>Participant (séance en cours)</label><select id="kr"><option value="">— Contrôle seul —</option>${live.runs.map((r, i) => `<option value="${i}" ${String(i) === CK.run ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select>` : ''}</div>
        <div class="card" style="margin-top:12px"><h3>📷 Photo du carton de l'élève</h3>
          ${CK.photo ? `<img src="${CK.photo}" id="kimg" style="width:100%;max-height:360px;object-fit:contain;border-radius:12px;background:#000;cursor:zoom-in">` : '<p class="muted" style="margin:0 0 8px">Facultatif : la photo reste affichée ici pendant que vous comparez les symboles.</p>'}
          <label class="btn btn-ghost btn-block" style="display:block;text-align:center;cursor:pointer;margin:8px 0 0">📷 ${CK.photo ? 'Changer la photo' : 'Prendre / choisir une photo'}<input id="kf" type="file" accept="image/*" capture="environment" style="display:none"></label></div>
        <div class="card" style="margin-top:12px"><h3>Symboles poinçonnés par l'élève</h3>
          <p class="muted" style="margin:0 0 6px;font-size:.8rem">Pour chaque case du carton, touchez le symbole que vous voyez.</p>
          <div class="sheet-table"><table><tr><th>Balise</th><th>Attendu</th><th>Carton</th><th>Résultat</th></tr>
          ${p.balises.map(b => `<tr><td><b>${b.num}</b>${b.ob ? ' <span class="muted" style="font-size:.7rem">oblig.</span>' : ''}</td><td>${isPat(b.code) ? patSVG(b.code, 34, '#8A94A6') : '<span class="muted">—</span>'}</td>
            <td>${isPat(b.code) ? `<button data-a="${b.num}" style="padding:0;border:none;background:none;cursor:pointer">${cell(b)}</button>` : ''}</td><td>${res(b)}</td></tr>`).join('')}</table></div>
          <div class="result" style="margin-top:10px"><div class="card"><b>${ok}</b><small>bonnes</small></div><div class="card"><b>${ko}</b><small>fausses</small></div><div class="card"><b>${p.balises.length - ok - ko}</b><small>non poinçonnées</small></div></div>
          ${live ? `<button class="btn btn-grad btn-block" style="margin-top:12px" id="kap">✔ Reporter dans la séance</button>` : ''}
          <button class="btn btn-ghost btn-block" style="margin-top:8px" id="kz">↺ Carton suivant</button></div>`;
      const $ = s => box.querySelector(s);
      $('#kp').onchange = e => { CK.pc = e.target.value; CK.ans = {}; CK.run = ''; controle(box); };
      if ($('#kr')) $('#kr').onchange = e => { CK.run = e.target.value; };
      if ($('#kimg')) $('#kimg').onclick = () => { const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.92);display:grid;place-items:center;padding:12px'; o.innerHTML = `<img src="${CK.photo}" style="max-width:100%;max-height:100%;object-fit:contain">`; o.onclick = () => o.remove(); document.body.appendChild(o); };
      $('#kf').onchange = e => { const f = e.target.files[0]; if (!f) return; const url = URL.createObjectURL(f), img = new Image();
        img.onload = () => { const r = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = img.width * r; c.height = img.height * r; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); CK.photo = c.toDataURL('image/jpeg', .85); draw(); };
        img.src = url; };
      box.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const num = b.dataset.a;
        const opts = [...new Set(p.balises.map(x => x.code).filter(isPat))];
        patPicker({ title: `Carton — case de la balise ${num}`, options: opts, draw: false, current: CK.ans[num],
          extra: [{ v: 'X', l: '❓ Autre symbole (faux)' }, { v: '', l: '◻︎ Case vide (non poinçonnée)' }], onPick: c => { CK.ans[num] = c; draw(); } }); });
      if ($('#kap')) $('#kap').onclick = () => { if (CK.run === '') return toast('Choisissez le participant'); const r = live.runs[+CK.run];
        r.found = p.balises.filter(b => status(b) === 1).map(b => b.num); r.wrong = p.balises.filter(b => status(b) === -1).length; save();
        toast(`${r.name} : ${r.found.length} balise(s) ✔`); CK.ans = {}; CK.photo = null; CK.run = String(Math.min(+CK.run + 1, live.runs.length - 1)); draw(); };
      $('#kz').onclick = () => { CK.ans = {}; CK.photo = null; draw(); };
    };
    draw();
  }

  /* ================= 3. BILAN ================= */
  function bilan(box) {
    const S = window.teamFilter ? teamFilter(DB.co.seances) : DB.co.seances;
    if (!S.length) { box.innerHTML = '<div class="card empty">Aucune séance enregistrée pour l\'instant.</div>'; return; }
    const classes = [...new Set(S.map(s => s.classe || '—'))];
    let cls = classes[0];
    const draw = () => {
      const ss = S.filter(s => (s.classe || '—') === cls), gs = coGroups(ss);
      const agg = {};
      gs.forEach(g => g.runs.forEach(({ r, p: q }) => { const x = result(r, q);
        r.members.forEach(m => { const a = agg[m] = agg[m] || { n: 0, km: 0, t: 0, pts: 0, bal: 0 };
          if (!r.dep) return; a.n++; a.pts += x.score; a.bal += r.found.length; if (x.temps != null) { a.km += x.km; a.t += x.temps; } }); }));
      const rows = Object.entries(agg).sort((a, b) => a[0].localeCompare(b[0]));
      box.innerHTML = `<div class="card"><label>Classe</label><select id="bc">${classes.map(c => `<option ${c === cls ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
        <div class="section-title"><h2>Cumul des séances (${gs.length})</h2><button class="link" id="exp">Exporter CSV</button></div>
        <div class="card sheet-table"><table><tr><th>Élève</th><th>Séances</th><th>Distance</th><th>Temps</th><th>RK moyen</th><th>Balises</th><th>Points</th></tr>
          ${rows.map(([n, a]) => `<tr><td><b>${esc(n)}</b></td><td>${a.n}</td><td>${a.km.toFixed(2).replace('.', ',')} km</td><td>${hms(a.t)}</td><td>${mpk(a.t, a.km)}</td><td>${a.bal}</td><td><b>${a.pts}</b></td></tr>`).join('')}</table></div>
        <div class="section-title"><h2>Séances</h2></div>
        <div class="card" style="padding:0">${gs.map((g, gi) => { const p = g.p, fin = g.runs.filter(({ r }) => r.arr).length, grp = g.runs.some(({ r }) => r.members.length > 1), n = g.runs.length;
          return `<div class="list-item"><div style="flex:1"><b>${new Date(g.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} · ${esc(p.nom)}${cls !== '—' ? ' · ' + esc(cls) : ''} · ${n} ${grp ? 'équipe' : 'élève'}${n > 1 ? 's' : ''}${g.recs.length > 1 ? ` (${g.recs.length} tablettes)` : ''}</b><div class="muted">${CO_TYPES[p.type][0]} · ${fin} arrivé${fin > 1 ? 's' : ''}</div></div><button class="btn btn-ghost" data-v="${gi}">👁</button><button class="btn btn-ghost" data-cfg="bare" data-x="${gi}">🗑</button></div>`; }).join('')}</div>
        <div id="det"></div>`;
      const $ = s => box.querySelector(s);
      $('#bc').onchange = () => { cls = $('#bc').value; draw(); };
      box.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { const g = gs[+b.dataset.x];
        if (!confirm(g.recs.length > 1 ? `Supprimer cette séance ? (${g.recs.length} enregistrements de tablettes seront supprimés)` : 'Supprimer cette séance ?')) return;
        g.recs.forEach(s => { const A0 = DB.co.seances, i = A0.indexOf(s); if (i >= 0) A0.splice(i, 1); }); save(); bilan(box); });
      box.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { const g = gs[+b.dataset.v], p = g.p;
        $('#det').innerHTML = `<div class="section-title"><h2>${new Date(g.date).toLocaleDateString('fr-FR')} — ${esc(p.nom)}${g.recs.length > 1 ? ` <small class="muted">(${g.recs.length} tablettes)</small>` : ''}</h2></div>${ranking(g.runs.map(({ r, p: q }) => ({ r, x: result(r, q) })), p)}`; $('#det').scrollIntoView({ behavior: 'smooth' }); });
      $('#exp').onclick = () => download(`course-orientation-${cls}.csv`, csv([
        ['Date', 'Parcours', 'Type', 'Participant', 'Membres', 'Départ', 'Arrivée', 'Temps réalisé', 'Balises trouvées', 'Mauvaises balises', 'Oblig. manquantes', 'Points', 'Pénalités temps', 'Temps total', 'Distance (km)', 'RK', 'Vitesse', 'Statut'],
        ...ss.flatMap(s => s.runs.map(r => { const p = s.parcoursSnap, x = result(r, p);
          return [new Date(s.date).toLocaleDateString('fr-FR'), p.nom, CO_TYPES[p.type][0], r.name, r.members.join(', '), r.dep ? clock(r.dep) : '', r.arr ? clock(r.arr) : '', hms(x.temps), r.found.join(' '), r.wrong, x.miss, x.score, hms(x.penS), hms(x.total), x.km.toFixed(2).replace('.', ','), x.rk, x.vit, x.statut]; }))]));
    };
    draw();
  }

  frame();
};
