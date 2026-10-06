/* =========================================================
   EPS ONE — Outil « Crosstraining / HYROX »
   Épreuves (blocs, séries, familles, exercices N1-N4, run) ·
   Séance (groupes duo/trio/quatuor, time cap, temps réalisé, écart) ·
   Résultats
   ========================================================= */
DB.wod = DB.wod || { epreuves: [], seances: [], current: null };
// Migration « passeport » : noms, niveaux des exercices déjà utilisés ; exercices ajoutés qui existent maintenant dans le passeport
function wodMigrate() {
  const W = DB.wod; if (W.passeport >= 2) return;
  if (W.passeport === 1) { // v8.3 : niveaux ajoutés pour Squats (N1) et Gainage latéral (N3)
    (W.epreuves || []).forEach(e => (e.blocs || []).forEach(b => (b.ex || []).forEach(x => { const m = exMeta(x.nom); if (m && ['Squats', 'Gainage latéral'].includes(m.nom)) x.niv = m.n; })));
    W.passeport = 2; save(); return; }
  (W.epreuves || []).forEach(e => (e.blocs || []).forEach(b => (b.ex || []).forEach(x => { const m = exMeta(x.nom); if (m && m.cat) { x.nom = m.nom; if (m.n) x.niv = m.n; } })));
  W.customEx = (W.customEx || []).filter(c => !(exMeta(c) || {}).cat);
  W.passeport = 2; save();
}
ICONS.wod = '<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/><path d="M12 3.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 9.5l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4z" stroke-width="1.4"/>';

const WOD_FAM = ['Bas du corps — Explosivité', 'Haut du corps — Force', 'Cardio — Global', 'Résistance — Abdominaux / gainage'];
// Passeport technique : exercices classés par famille et niveau [nom, famille (0-3), niveau (1-4 ou null), anciens noms]
const WOD_CAT = [
  ['Air squats', 0, 1], ['Fentes', 0, 2, ['Fentes (lunges)']], ['Squats ball', 0, 2], ['Box step up', 0, 3, ['Box step']], ['Squats sautés', 0, 4], ['Squats', 0, 1],
  ['Pompes sur box', 1, 1, ['Pompes adaptées', 'Pompes box']], ['Pompes classiques', 1, 2, ['Pompes']], ['Dips avec pauses', 1, 3, ['Dips adaptés']], ['Développé haltères', 1, 3], ['Rowing kettlebell', 1, 3], ['Dips', 1, 4],
  ['Jumping jacks', 2, 1], ['Corde à sauter', 2, 2], ['Farmer carry', 2, 2], ['Box jump', 2, 3], ['Wall ball', 2, 3], ['Burpees', 2, 4],
  ['Mountain climbers', 3, 1], ['Gainage coudes', 3, 2, ['Gainage planche']], ['Levés de jambes (axe)', 3, 3, ['Levés de jambes axiaux']], ['Levés de jambes (côté)', 3, 4, ['Levés de jambes latéraux']], ['Gainage latéral', 3, 3],
];
const WOD_EX = WOD_CAT.map(x => x[0]);
const WOD_COL = ['#1FA2E8', '#E53935', '#F4B400', '#43A047'];
const exNorm = t => (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').map(w => w.replace(/(s|x)$/, '')).join(' ');
// famille / niveau d'un exercice : passeport, sinon réglage de l'enseignant (DB.wod.exMeta)
function exMeta(nom) {
  const k = exNorm(nom), c = WOD_CAT.find(x => exNorm(x[0]) === k || (x[3] || []).some(a => exNorm(a) === k));
  if (c) return { nom: c[0], f: c[1], n: c[2], cat: true };
  const m = (DB.wod.exMeta || {})[k]; return m ? { nom, f: m.f, n: m.n } : null;
}
const RUN_T = { tours: 'tours', m: 'mètres', ar: 'allers-retours' };
// RUN en tours ou allers-retours : une case à cocher par tour (ex. 4 tours → 4 cases) ; en mètres : une seule case
const runCount = b => b && b.run && (b.runType === 'tours' || b.runType === 'ar') ? Math.max(1, Math.min(20, +b.runVal || 1)) : 1;
const wid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const mmss = s => { if (s == null || isNaN(s)) return '–'; const neg = s < 0; s = Math.abs(Math.round(s)); return (neg ? '−' : '') + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
// Format de l'épreuve : absent = plan commun (comportement historique) · 1 individuel · 2 duo · 3 trio · 4 quatuor
// Duo/trio/quatuor : chaque bloc porte b.pe = [plan Élève 1, plan Élève 2, …] (listes d'exercices) et b.obj = { famille: objectif de groupe par série }
const WOD_FMT = ['Plan commun', 'Individuel', 'Duo', 'Trio', 'Quatuor'];
const WOD_STU = ['#7E57C2', '#00897B', '#EF6C00', '#3949AB'];
const wodMulti = e => e && e.format >= 2 && (e.blocs || []).every(b => Array.isArray(b.pe) && b.pe.length) ? e.format : 0;
const wodClone = o => JSON.parse(JSON.stringify(o));
const famOf = nom => { const m = exMeta(nom); return m && m.f != null ? m.f : null; };
const famShort = f => WOD_FAM[f].split(' — ')[0];
// options « changer d'exercice » : exercices du passeport de la même famille, du niveau 1 au niveau 4
const swapOpts = x => { const f = famOf(x.nom), L = WOD_CAT.filter(c => f == null || c[1] === f).map(c => ({ nom: c[0], n: c[2] })).sort((a, b) => (a.n || 9) - (b.n || 9) || a.nom.localeCompare(b.nom));
  if (!L.some(c => c.nom === x.nom)) L.unshift({ nom: x.nom, n: (exMeta(x.nom) || {}).n });
  return L.map(c => `<option value="${esc(c.nom)}" ${c.nom === x.nom ? 'selected' : ''}>${c.n ? 'N' + c.n + ' · ' : ''}${esc(c.nom)}</option>`).join(''); };

document.head.insertAdjacentHTML('beforeend', `<style>
.blk{border:1.5px solid var(--line);border-radius:16px;padding:12px;margin-top:10px;background:var(--card)}
.blk-h{display:flex;align-items:center;gap:8px}
.blk-h b{flex:1}
.ex-row{display:flex;align-items:center;gap:6px;padding:7px 0;border-bottom:1px solid var(--line);flex-wrap:wrap}
.ex-row:last-child{border-bottom:none}
.ex-row .nm{flex:1 1 130px;font-weight:700;font-size:.9rem}
.ex-row input{width:62px;padding:7px;text-align:center}
.nv{display:flex;gap:3px}
.nv button{padding:6px 7px;border-radius:8px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.72rem}
.nv button.on{background:var(--grad);color:#fff;border-color:transparent}
.splits{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.splits button{padding:8px 10px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.8rem}
.splits button.on{background:#1B9E5A;color:#fff;border-color:transparent}
.gv-clock{font-size:clamp(3.4rem,18vw,6.5rem);font-weight:900;text-align:center;font-variant-numeric:tabular-nums;line-height:1.05;padding:6px 0}
.gv-it{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:14px 12px;margin-top:8px;border-radius:14px;border:2px solid var(--line);background:var(--card);font-weight:800;font-size:1.02rem;color:var(--text)}
.gv-it .bx{flex:0 0 30px;height:30px;border-radius:9px;border:2.5px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#fff}
.gv-it.on{background:rgba(27,158,90,.1);border-color:#1B9E5A}
.gv-it.on .bx{background:#1B9E5A;border-color:#1B9E5A}
.gv-it.on span.t{text-decoration:line-through;opacity:.65}
.gv-it:disabled{opacity:.55}
.wod-stabs{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.wod-stabs button{flex:1 1 90px;padding:10px 8px;border-radius:12px;border:2px solid var(--line);background:var(--card);font-weight:800;font-size:.85rem;color:var(--text)}
.wod-stabs button.on{color:#fff;border-color:transparent}
.wod-obj{margin-top:12px;padding:10px;border-radius:12px;background:var(--grad-soft,rgba(0,0,0,.03))}
.wod-obj-r{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:7px 0;border-top:1px solid var(--line)}
.wod-obj-r .fn{flex:1 1 150px;font-weight:800;font-size:.86rem}
.wod-obj-r input{width:72px;padding:7px;text-align:center}
.wod-obj-r .sum{flex:1 1 100%;font-size:.8rem}
.wod-dot{display:inline-block;width:10px;height:10px;border-radius:50%;flex:0 0 10px}
.wod-cols{display:grid;grid-template-columns:repeat(var(--n,1),minmax(0,1fr));gap:8px;margin-top:6px}
@media (max-width:600px){.wod-cols{grid-template-columns:minmax(0,1fr)}}
.wod-col{border:1.5px solid var(--line);border-radius:14px;padding:6px 7px 8px;min-width:0}
.wod-ch{color:#fff;font-weight:900;font-size:.85rem;padding:6px 9px;border-radius:9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wod-col .gv-it{padding:11px 8px;font-size:.92rem;gap:8px;margin-top:6px}
.wod-col .gv-it .bx{flex:0 0 26px;height:26px}
.wod-col select,.wod-col input{margin-top:6px;padding:8px}
.wod-fam{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.wod-fam span{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:99px;border:2px solid var(--line);font-weight:800;font-size:.85rem;background:var(--card)}
.wod-fam span.ok{border-color:#1B9E5A;background:rgba(27,158,90,.1)}
.wod-syn{margin-top:8px;border-radius:12px;border:1.5px solid var(--line);overflow:hidden}
.wod-syn>div{display:flex;gap:8px;align-items:flex-start;padding:8px 10px;border-top:1px solid var(--line);font-size:.88rem}
.wod-syn>div:first-child{border-top:none}
.wod-syn .who{flex:0 0 auto;color:#fff;font-weight:900;font-size:.78rem;padding:3px 8px;border-radius:8px;max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wod-gsum{margin-top:8px;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.035);font-size:.86rem}
.wod-gsum>div{display:flex;gap:8px;align-items:baseline;margin-top:5px}
.wod-gsum>div .wod-dot{flex:0 0 10px;transform:translateY(1px)}
.wod-gsum>div.ok{color:var(--ok,#1B7F4A);font-weight:700}
.wod-itw{display:flex;gap:6px;align-items:stretch}
.wod-itw .gv-it{flex:1 1 auto;min-width:0}
.wod-pt{flex:0 0 38px;margin-top:6px;border-radius:12px;border:2px solid var(--line);background:var(--card);font-weight:900;font-size:.95rem;color:var(--text);padding:0}
.wod-pt:disabled{opacity:.45}
.gv-it.pt{border-color:#F4B400;background:rgba(244,180,0,.1)}
.gv-it.pt .bx{border-color:#F4B400;color:#8a6400;font-size:.62rem;font-weight:900}
.wod-vs{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.wod-vs button{flex:1 1 auto;padding:9px 10px;border-radius:10px;border:2px solid var(--line);background:var(--card);font-weight:800;font-size:.82rem;color:var(--text)}
.wod-vs button.on{color:#fff;border-color:transparent}
</style>`);

TOOL_IMPL.wod = function (el) {
  wodMigrate();
  let tab = DB.wod.current || partToday('wod').length || partRecoverHTML('wod') ? 'seance' : 'epreuves';
  const E = id => DB.wod.epreuves.find(e => e.id === id);
  function frame() {
    el.innerHTML = `<div class="co-tabs">${[['epreuves', '🏋️ Épreuves'], ['seance', '⏱ Séance'], ['resultats', '📊 Résultats']].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div><div id="w-body"></div>`;
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; frame(); });
    ({ epreuves: listEp, seance, resultats })[tab](el.querySelector('#w-body'));
  }
  const summaryOf = e => `${e.format ? WOD_FMT[e.format] + ' · ' : ''}${e.sport === 'hyrox' ? 'HYROX' : 'Crosstraining'} · ${e.blocs.length} bloc${e.blocs.length > 1 ? 's' : ''} · ${e.prevu} min prévues · cap ${e.cap} min`;

  /* ================= 1. ÉPREUVES ================= */
  function listEp(box) {
    box.innerHTML = `<div class="card" style="padding:0">${DB.wod.epreuves.length ? DB.wod.epreuves.map((e, i) => `<div class="list-item"><div style="flex:1"><b>${esc(e.nom)}</b><div class="muted">${summaryOf(e)}</div></div>
      <button class="btn btn-ghost" data-cfg="bare" data-e="${i}">✏️</button><button class="btn btn-ghost" data-cfg="bare" data-c="${i}" title="Dupliquer">⧉</button></div>`).join('') : '<div class="empty">Aucune épreuve. Créez la première !</div>'}</div>
      <button class="btn btn-grad btn-block" data-cfg style="margin-top:12px" id="new">＋ Créer une épreuve</button>`;
    box.querySelector('#new').onclick = () => editEp(box, null);
    box.querySelectorAll('[data-e]').forEach(b => b.onclick = () => editEp(box, +b.dataset.e));
    box.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { const c = JSON.parse(JSON.stringify(DB.wod.epreuves[+b.dataset.c])); c.id = wid(); c.nom += ' (copie)'; DB.wod.epreuves.push(c); save(); listEp(box); });
  }
  const newBloc = (sport, i) => ({ famille: i % 4, series: sport === 'hyrox' ? 1 : 3, ex: [{ nom: ['Air squats', 'Pompes sur box', 'Jumping jacks', 'Mountain climbers'][i % 4], reps: 10, niv: 1 }],
    run: sport === 'hyrox', runType: 'm', runVal: sport === 'hyrox' ? 400 : 200 });

  function editEp(box, idx) {
    const e = idx != null ? JSON.parse(JSON.stringify(DB.wod.epreuves[idx])) : { id: wid(), nom: 'WOD 1', sport: 'cross', prevu: 12, cap: 15, blocs: [newBloc('cross', 0)] };
    let custom = JSON.parse(JSON.stringify(DB.wod.customEx || [])), nf = null;
    // liste « Ajouter un exercice » rangée par famille (famille du bloc en premier), du niveau 1 au niveau 4
    const exList = () => [...WOD_CAT.map(x => ({ nom: x[0], f: x[1], n: x[2] })), ...custom.map(c => { const m = exMeta(c); return { nom: c, f: m ? m.f : null, n: m ? m.n : null }; })];
    const exOptions = bi => { const L = exList(), fb = e.blocs[bi].famille, order = [fb, ...[0, 1, 2, 3].filter(f => f !== fb)];
      const opt = x => `<option value="${esc(x.nom)}">${x.n ? 'N' + x.n + ' · ' : ''}${esc(x.nom)}</option>`, srt = (a, b) => (a.n || 9) - (b.n || 9) || a.nom.localeCompare(b.nom);
      return order.map(f => `<optgroup label="Famille ${f + 1} · ${WOD_FAM[f]}">${L.filter(x => x.f === f).sort(srt).map(opt).join('')}</optgroup>`).join('')
        + (L.some(x => x.f == null) ? `<optgroup label="Autres exercices">${L.filter(x => x.f == null).sort(srt).map(opt).join('')}</optgroup>` : ''); };
    const tagOf = nom => { const m = exMeta(nom); return m && m.f != null ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${WOD_COL[m.f]};margin-right:6px"></span>` : ''; };
    /* ---- Format duo / trio / quatuor : un plan par élève (b.pe) + objectifs de groupe (b.obj) ---- */
    let cs = 0;                                                // onglet « Élève » affiché
    const nMulti = () => e.format >= 2 ? e.format : 0;
    const norm = () => { const n = nMulti(); if (!n) return;
      e.blocs.forEach(b => { if (!Array.isArray(b.pe) || !b.pe.length) b.pe = [wodClone(b.ex || [])];
        while (b.pe.length < n) b.pe.push(wodClone(b.pe[0])); b.pe.length = n; b.obj = b.obj || {}; });
      cs = Math.min(cs, n - 1); };
    const exs = bi => nMulti() ? e.blocs[bi].pe[cs] : e.blocs[bi].ex;
    const setFormat = v => { const was = nMulti();
      if (was && v < 2) e.blocs.forEach(b => b.ex = wodClone(b.pe[0]));            // on garde le plan de l'Élève 1
      if (!was && v >= 2) e.blocs.forEach(b => { if (Array.isArray(b.pe) && b.pe.length) b.pe[0] = wodClone(b.ex); });
      if (v) e.format = v; else delete e.format; norm(); };
    const famsB = b => [...new Set([...b.pe.flat().map(x => famOf(x.nom)).filter(f => f != null), ...Object.keys(b.obj || {}).filter(f => +b.obj[f] > 0).map(Number)])].sort();
    const sumTxt = (bi, f) => { const b = e.blocs[bi], per = b.pe.map(L => L.filter(x => famOf(x.nom) === f).reduce((a, x) => a + (+x.reps || 0), 0)), sum = per.reduce((a, x) => a + x, 0), tg = +(b.obj || {})[f] || 0;
      return `${per.map((v, s) => `<span style="color:${WOD_STU[s]};font-weight:800">É${s + 1}</span> ${v}`).join(' + ')} = <b>${sum}</b>${tg ? (sum === tg ? ' <b style="color:#1B9E5A">✔ objectif atteint</b>' : ` <b style="color:var(--danger)">⚠ ${sum > tg ? '+' : ''}${sum - tg} par rapport à l'objectif (${tg})</b>`) : ' <span class="muted">(pas d\'objectif de groupe)</span>'}${tg && b.series > 1 ? ` <span class="muted">· × ${b.series} séries = ${tg * b.series}</span>` : ''}`; };
    const objHTML = bi => { const b = e.blocs[bi], F = famsB(b); if (!F.length) return '';
      return `<div class="wod-obj"><b>🎯 Objectifs du groupe</b> <span class="muted" style="font-size:.8rem">cumul des ${b.pe.length} élèves, par série</span>
        ${F.map(f => `<div class="wod-obj-r"><span class="wod-dot" style="background:${WOD_COL[f]}"></span><span class="fn">${WOD_FAM[f]}</span><input type="number" min="0" data-obj="${bi}-${f}" value="${+(b.obj || {})[f] || ''}" placeholder="—"><span class="muted" style="font-size:.75rem">rép.</span>
          <button class="btn btn-ghost" style="flex:0 0 auto;padding:6px 10px;font-size:.8rem" data-rep="${bi}-${f}" title="Répartir l'objectif entre les élèves">⚖️ Répartir</button><div class="sum" data-sum="${bi}-${f}">${sumTxt(bi, f)}</div></div>`).join('')}</div>`; };
    // Répartit l'objectif de la famille f entre les élèves qui ont un exercice de cette famille (puis entre leurs exercices)
    const repartir = (bi, f) => { const b = e.blocs[bi], tg = +(b.obj || {})[f] || 0, who = b.pe.map((L, s) => s).filter(s => b.pe[s].some(x => famOf(x.nom) === f));
      if (!tg) return toast('Indiquez d\'abord l\'objectif du groupe'); if (!who.length) return toast('Aucun élève n\'a d\'exercice de cette famille dans ce bloc');
      const split = (t, k) => Array.from({ length: k }, (_, i) => Math.floor(t / k) + (i < t % k ? 1 : 0));
      split(tg, who.length).forEach((part, i) => { const L = b.pe[who[i]].filter(x => famOf(x.nom) === f); split(part, L.length).forEach((r, j) => L[j].reps = r); }); };
    norm();
    let busy = false;                                          // pas de rendu imbriqué (change déclenché par un blur pendant le rendu)
    const draw = () => { if (busy) return; busy = true; try { draw0(); } finally { busy = false; } };
    const draw0 = () => {
      norm(); const nM = nMulti();
      const allEx = exList().map(x => x.nom);
      box.innerHTML = `<div data-cfg="bare"><div class="card" data-cfg><h3>${idx != null ? 'Modifier' : 'Nouvelle'} épreuve</h3>
        <label>Nom</label><input id="nm" value="${esc(e.nom)}">
        <label>Sport</label><div class="seg"><button data-sp="cross" class="${e.sport === 'cross' ? 'on' : ''}">Crosstraining</button><button data-sp="hyrox" class="${e.sport === 'hyrox' ? 'on' : ''}">HYROX</button></div>
        <div class="row"><div><label>Temps d'épreuve prévu (min)</label><input id="pv" type="number" min="1" value="${e.prevu}"></div><div><label>Temps limite / time cap (min)</label><input id="cp" type="number" min="1" value="${e.cap}"></div></div>
        <label>Format de l'épreuve</label><div class="seg" id="fmt">${WOD_FMT.map((l, k) => `<button data-fmt="${k}" class="${(e.format || 0) === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <p class="muted" style="margin:6px 2px 0;font-size:.78rem">${!e.format ? 'Plan commun : le même plan pour tout le groupe ; la séance peut se faire en individuel ou en groupes.' : e.format === 1 ? 'Individuel : chaque élève réalise le plan seul (séance en individuel).' : `${WOD_FMT[e.format]} : ${e.format} élèves par groupe, chacun avec ses exercices et ses répétitions ; les objectifs de groupe se cumulent.`}</p></div>
      ${nM ? `<div class="card" style="margin-top:10px"><b>👥 Plan de chaque élève</b><div class="wod-stabs">${Array.from({ length: nM }, (_, s) => `<button data-stu="${s}" class="${s === cs ? 'on' : ''}" style="${s === cs ? `background:${WOD_STU[s]}` : `border-color:${WOD_STU[s]}`}">Élève ${s + 1}</button>`).join('')}${nM < 4 ? '<button id="addstu">➕ Ajouter un élève</button>' : ''}</div>
        <div class="row" style="margin-top:8px">${cs ? '<button class="btn btn-ghost" id="cpy">⧉ Copier depuis Élève 1</button>' : ''}${nM > 2 ? `<button class="btn btn-ghost" id="rmstu">✕ Retirer l'Élève ${cs + 1}</button>` : ''}</div>
        <p class="muted" style="margin:6px 2px 0;font-size:.78rem">Famille, séries et course sont communes au groupe. Exercices, répétitions et niveaux ci-dessous : <b style="color:${WOD_STU[cs]}">Élève ${cs + 1}</b>.</p></div>` : ''}
      ${e.blocs.map((b, bi) => `<div class="blk"><div class="blk-h"><b>Bloc ${bi + 1}</b><button class="btn btn-ghost" style="padding:6px 10px" data-up="${bi}" ${bi ? '' : 'disabled'}>↑</button><button class="btn btn-ghost" style="padding:6px 10px" data-rmb="${bi}">✕</button></div>
          <label>Famille</label><select data-fam="${bi}">${WOD_FAM.map((f, k) => `<option value="${k}" ${b.famille === k ? 'selected' : ''}>${f}</option>`).join('')}</select>
          <label>Séries (nombre de tours du bloc)</label><input type="number" min="1" data-ser="${bi}" value="${b.series}">
          <label>${nM ? `<span style="color:${WOD_STU[cs]}">Élève ${cs + 1}</span> · exercices · répétitions · niveau` : 'Exercices · répétitions · niveau'}</label>
          <div>${exs(bi).map((x, xi) => `<div class="ex-row" style="border-left:5px solid ${(exMeta(x.nom) || {}).f != null ? WOD_COL[exMeta(x.nom).f] : 'transparent'};padding-left:8px">${nM ? `<select class="nm" data-swap="${bi}-${xi}" style="flex:1 1 150px;padding:7px" title="Changer d'exercice (même famille)">${swapOpts(x)}</select>` : `<span class="nm">${tagOf(x.nom)}${esc(x.nom)}${(exMeta(x.nom) || {}).n ? `<span class="muted" style="font-size:.72rem;font-weight:600"> · ${exMeta(x.nom).cat ? 'passeport' : 'niveau'} N${exMeta(x.nom).n}</span>` : ''}</span>`}<button class="btn btn-danger" style="flex:0 0 auto;padding:6px 10px;font-size:.8rem" data-rmx="${bi}-${xi}" title="Retirer cet exercice">🗑 Retirer</button>
            <div style="display:flex;gap:6px;align-items:center;width:100%"><input type="number" min="0" data-reps="${bi}-${xi}" value="${x.reps}" title="répétitions (ou secondes pour le gainage)"><span class="muted" style="font-size:.75rem">rép.</span>
            <div class="nv">${[1, 2, 3, 4].map(n => `<button data-nv="${bi}-${xi}-${n}" class="${x.niv === n ? 'on' : ''}">N${n}</button>`).join('')}</div></div></div>`).join('') || '<div class="muted">Aucun exercice.</div>'}</div>
          <div class="row" style="margin-top:8px"><select data-add="${bi}"><option value="">＋ Ajouter un exercice…</option>${exOptions(bi)}<option value="__new">✎ Exercice non répertorié…</option></select></div>
          ${nf && nf.bi === bi ? `<div class="card" style="margin-top:8px;background:var(--grad-soft)"><b>Nouvel exercice</b><label>Nom</label><input id="nf-nm" value="${esc(nf.nom || '')}">
            <div class="row"><div><label>Famille</label><select id="nf-f">${WOD_FAM.map((f, k) => `<option value="${k}" ${k === nf.f ? 'selected' : ''}>${k + 1} · ${f}</option>`).join('')}</select></div><div><label>Niveau</label><select id="nf-n">${[1, 2, 3, 4].map(n => `<option value="${n}" ${n === nf.n ? 'selected' : ''}>N${n}</option>`).join('')}</select></div></div>
            <div class="row" style="margin-top:8px"><button class="btn btn-grad" id="nf-ok">＋ Ajouter</button><button class="btn btn-ghost" id="nf-no">Annuler</button></div></div>` : ''}
          <label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" data-run="${bi}" ${b.run ? 'checked' : ''} style="width:auto"> Course / RUN dans ce bloc</label>
          ${b.run ? `<div class="row"><select data-rt="${bi}">${Object.entries(RUN_T).map(([k, v]) => `<option value="${k}" ${b.runType === k ? 'selected' : ''}>${v}</option>`).join('')}</select>${nM ? `<select data-rby="${bi}" title="Qui coche les courses ?"><option value="g" ${b.runBy !== 'e' ? 'selected' : ''}>à cocher par le groupe</option><option value="e" ${b.runBy === 'e' ? 'selected' : ''}>à cocher par chaque élève</option></select>` : ''}<input type="number" min="1" data-rv="${bi}" value="${b.runVal}"></div>` : ''}
          ${nM ? `<div data-objbox="${bi}">${objHTML(bi)}</div>` : ''}
        </div>`).join('')}
      <button class="btn btn-ghost btn-block" style="margin-top:10px" id="addb">＋ Ajouter un bloc</button>
      ${custom.length ? `<details class="card" style="margin-top:10px"><summary style="cursor:pointer;font-weight:800">✎ Mes exercices ajoutés (${custom.length})</summary><p class="muted" style="margin:6px 0;font-size:.8rem">Exercices créés avec « Exercice non répertorié ». Les retirer de la liste ne les enlève pas des blocs déjà composés.</p>
        ${custom.map((x, k) => { const m = exMeta(x) || {}; return `<div class="ex-row"><span class="nm">${tagOf(x)}${esc(x)}</span><select data-cf="${k}" style="flex:1 1 140px;padding:6px"><option value="">Famille ?</option>${WOD_FAM.map((f, j) => `<option value="${j}" ${m.f === j ? 'selected' : ''}>${j + 1} · ${f}</option>`).join('')}</select><select data-cn="${k}" style="flex:0 0 80px;padding:6px"><option value="">N ?</option>${[1, 2, 3, 4].map(n => `<option value="${n}" ${m.n === n ? 'selected' : ''}>N${n}</option>`).join('')}</select><button class="btn btn-ghost" style="flex:0 0 auto;padding:5px 10px" data-rmc="${k}">🗑</button></div>`; }).join('')}</details>` : ''}
      <p class="muted" style="margin:10px 2px">Répétitions : pour le gainage, indiquez des secondes.</p>
      <div class="row" style="margin-top:6px"><button class="btn btn-grad" id="sv">💾 Enregistrer</button><button class="btn btn-ghost" id="bk">Annuler</button>${idx != null ? '<button class="btn btn-danger" id="del">Supprimer</button>' : ''}</div></div>`;
      const $ = s => box.querySelector(s), all = s => box.querySelectorAll(s);
      const read = () => { e.nom = $('#nm').value.trim() || 'Épreuve'; e.prevu = Math.max(1, +$('#pv').value || 1); e.cap = Math.max(1, +$('#cp').value || 1);
        all('[data-fam]').forEach(s => e.blocs[+s.dataset.fam].famille = +s.value);
        all('[data-ser]').forEach(s => e.blocs[+s.dataset.ser].series = Math.max(1, +s.value || 1));
        all('[data-reps]').forEach(s => { const [bi, xi] = s.dataset.reps.split('-').map(Number); exs(bi)[xi].reps = +s.value || 0; });
        all('[data-obj]').forEach(s => { const [bi, f] = s.dataset.obj.split('-').map(Number), b = e.blocs[bi]; b.obj = b.obj || {}; if (+s.value > 0) b.obj[f] = +s.value; else delete b.obj[f]; });
        all('[data-rt]').forEach(s => e.blocs[+s.dataset.rt].runType = s.value);
        all('[data-rv]').forEach(s => e.blocs[+s.dataset.rv].runVal = +s.value || 0);
        all('[data-rby]').forEach(s => e.blocs[+s.dataset.rby].runBy = s.value); };
      all('[data-sp]').forEach(b => b.onclick = () => { read(); e.sport = b.dataset.sp; if (e.sport === 'hyrox') e.blocs.forEach(x => x.run = true); draw(); });
      all('[data-nv]').forEach(b => b.onclick = () => { read(); const [bi, xi, n] = b.dataset.nv.split('-').map(Number); exs(bi)[xi].niv = n; draw(); });
      all('[data-rmx]').forEach(b => b.onclick = () => { read(); const [bi, xi] = b.dataset.rmx.split('-').map(Number); exs(bi).splice(xi, 1); draw(); });
      all('[data-add]').forEach(s => s.onchange = () => { read(); let v = s.value; if (!v) return;
        if (v === '__new') { nf = { bi: +s.dataset.add, f: e.blocs[+s.dataset.add].famille, n: 1 }; draw(); const i = box.querySelector('#nf-nm'); i && i.focus(); return; }
        const m = exMeta(v); exs(+s.dataset.add).push({ nom: v, reps: 10, niv: (m && m.n) || 1 }); draw(); });
      const setMeta = (nom, f, n) => { DB.wod.exMeta = DB.wod.exMeta || {}; const k = exNorm(nom), o = DB.wod.exMeta[k] || {}; if (f !== undefined) o.f = f; if (n !== undefined) o.n = n; DB.wod.exMeta[k] = o; save(); };
      if ($('#nf-ok')) $('#nf-ok').onclick = () => { read(); const v = $('#nf-nm').value.trim(), f = +$('#nf-f').value, n = +$('#nf-n').value; if (!v) return toast('Indiquez le nom de l\'exercice');
        const m = exMeta(v); if (m && m.cat) { exs(nf.bi).push({ nom: m.nom, reps: 10, niv: m.n || n }); toast(`« ${m.nom} » existe déjà dans le passeport`); }
        else { if (!allEx.some(x => exNorm(x) === exNorm(v))) custom.push(v); DB.wod.customEx = custom.slice(); setMeta(v, f, n); exs(nf.bi).push({ nom: v, reps: 10, niv: n }); }
        nf = null; draw(); };
      if ($('#nf-no')) $('#nf-no').onclick = () => { read(); nf = null; draw(); };
      all('[data-cf]').forEach(x => x.onchange = () => { read(); setMeta(custom[+x.dataset.cf], x.value === '' ? null : +x.value); draw(); });
      all('[data-cn]').forEach(x => x.onchange = () => { read(); const nom = custom[+x.dataset.cn], n = x.value === '' ? null : +x.value; setMeta(nom, undefined, n);
        if (n) e.blocs.forEach(b => [b.ex, ...(b.pe || [])].forEach(L => (L || []).forEach(y => { if (exNorm(y.nom) === exNorm(nom)) y.niv = n; }))); draw(); });
      all('[data-run]').forEach(c => c.onchange = () => { read(); e.blocs[+c.dataset.run].run = c.checked; draw(); });
      all('[data-rmc]').forEach(b => b.onclick = () => { read(); if (!confirm(`Retirer « ${custom[+b.dataset.rmc]} » de la liste des exercices ?`)) return; custom.splice(+b.dataset.rmc, 1); DB.wod.customEx = custom.slice(); save(); draw(); });
      all('[data-rmb]').forEach(b => b.onclick = () => { read(); if (e.blocs.length > 1) e.blocs.splice(+b.dataset.rmb, 1); draw(); });
      all('[data-up]').forEach(b => b.onclick = () => { read(); const i = +b.dataset.up; [e.blocs[i - 1], e.blocs[i]] = [e.blocs[i], e.blocs[i - 1]]; draw(); });
      $('#addb').onclick = () => { read(); e.blocs.push(newBloc(e.sport, e.blocs.length)); draw(); };   // norm() crée les plans des élèves
      $('#bk').onclick = () => listEp(box);
      if ($('#del')) $('#del').onclick = () => { if (confirm('Supprimer cette épreuve ?')) { DB.wod.epreuves.splice(idx, 1); save(); listEp(box); } };
      // Format / élèves (duo, trio, quatuor)
      all('[data-fmt]').forEach(b => b.onclick = () => { read(); const v = +b.dataset.fmt;
        if (nMulti() > v && v >= 2 && !confirm(`Passer en ${WOD_FMT[v]} ? Les plans des élèves ${v + 1} à ${nMulti()} seront retirés.`)) return; setFormat(v); draw(); });
      all('[data-stu]').forEach(b => b.onclick = () => { read(); cs = +b.dataset.stu; draw(); });
      if ($('#addstu')) $('#addstu').onclick = () => { read(); const n = nMulti(); e.format = n + 1; e.blocs.forEach(b => b.pe.push(wodClone(b.pe[0]))); cs = n; draw(); toast(`Élève ${n + 1} ajouté (copie de l'Élève 1) · format ${WOD_FMT[n + 1]}`); };
      if ($('#rmstu')) $('#rmstu').onclick = () => { read(); if (!confirm(`Retirer l'Élève ${cs + 1} et son plan ?`)) return; e.blocs.forEach(b => b.pe.splice(cs, 1)); e.format--; cs = Math.max(0, cs - 1); draw(); };
      if ($('#cpy')) $('#cpy').onclick = () => { read(); e.blocs.forEach(b => b.pe[cs] = wodClone(b.pe[0])); draw(); toast(`Plan de l'Élève 1 copié pour l'Élève ${cs + 1}`); };
      all('[data-swap]').forEach(s => s.onchange = () => { read(); const [bi, xi] = s.dataset.swap.split('-').map(Number), x = exs(bi)[xi], m = exMeta(s.value); x.nom = s.value; if (m && m.n) x.niv = m.n; draw(); });
      const refreshObj = () => all('[data-sum]').forEach(d => { const [bi, f] = d.dataset.sum.split('-').map(Number); d.innerHTML = sumTxt(bi, f); });
      all('[data-reps],[data-obj],[data-ser]').forEach(i => i.addEventListener('input', () => { if (nMulti()) { read(); refreshObj(); } }));
      all('[data-obj]').forEach(i => { const was = +i.value || 0; i.onchange = () => { read(); const [bi, f] = i.dataset.obj.split('-').map(Number); if (!was && +i.value > 0) { repartir(bi, f); draw(); } else refreshObj(); }; });
      all('[data-rep]').forEach(b => b.onclick = () => { read(); const [bi, f] = b.dataset.rep.split('-').map(Number); repartir(bi, f); draw(); });
      $('#sv').onclick = () => { read(); if (e.cap < e.prevu && !confirm('Le temps limite est plus court que le temps prévu. Enregistrer quand même ?')) return;
        norm();
        if (nMulti()) { const bad = [];
          e.blocs.forEach((b, bi) => famsB(b).forEach(f => { const tg = +(b.obj || {})[f] || 0, sum = b.pe.flat().filter(x => famOf(x.nom) === f).reduce((a, x) => a + (+x.reps || 0), 0); if (tg && sum !== tg) bad.push(`Bloc ${bi + 1} · ${famShort(f)} : ${sum} / ${tg}`); }));
          if (bad.length && !confirm(`La somme des répétitions des élèves ne correspond pas à l'objectif du groupe :\n${bad.join('\n')}\n\nEnregistrer quand même ?`)) return;
          e.blocs.forEach(b => b.ex = wodClone(b.pe[0])); }                          // repli : plan de l'Élève 1
        else e.blocs.forEach(b => { delete b.pe; delete b.obj; });
        DB.wod.customEx = custom; if (idx != null) DB.wod.epreuves[idx] = e; else DB.wod.epreuves.push(e); save(); toast('Épreuve enregistrée ✔'); listEp(box); };
    };
    draw();
  }

  /* ================= 2. SÉANCE ================= */
  const resOf = (g, e) => { const t = g.dep && g.arr ? (g.arr - g.dep) / 1000 : null;
    return { t, ecart: t != null ? t - e.prevu * 60 : null, cap: g.capped || (t != null && t > e.cap * 60) }; };

  // Liste des étapes à cocher : pour chaque bloc, chaque série, (RUN) + exercices
  // Duo/trio/quatuor : profil (Élève 1…n) → membre du groupe ; plan d'un profil (ajustements du groupe avant le départ dans g.plan)
  // g.prof absent (anciennes séances) : un membre peut prendre plusieurs profils (rotation) · g.prof présent : '' = profil vide (absent)
  const profOf = (g, n) => { const M = g.members || [];
    if (!Array.isArray(g.prof)) return Array.from({ length: n }, (_, s) => M.length ? M[s % M.length] : '');
    const Q = Array.from({ length: n }, (_, s) => { const p = g.prof[s]; return p === '' ? '' : p && M.includes(p) ? p : null; }), free = M.filter(m => !Q.includes(m));
    return Q.map(p => p != null ? p : free.shift() || ''); };
  const profInit = (members, n) => Array.from({ length: n }, (_, s) => members[s] || '');
  const planOf = (g, e, k, s) => (g && g.plan && g.plan[k] && g.plan[k][s]) || e.blocs[k].pe[s] || [];
  const exTxt = x => `${x.reps} ${x.nom}${/gainage/i.test(x.nom) ? ' (s)' : ''} · N${x.niv}`;
  // Liste des étapes à cocher : pour chaque bloc, chaque série, (RUN) + exercices (duo/trio/quatuor : une colonne par élève dans cols)
  const itemsOf = (e, g) => { const n = wodMulti(e), P = n && g ? profOf(g, n) : []; return e.blocs.map((b, k) => { const L = [];
    for (let sr = 0; sr < (b.series || 1); sr++) {
      const runN = runCount(b), unit = b.runType === 'ar' ? 'aller-retour' : 'tour';
      const runIt = (base, s) => !b.run ? [] : runN > 1
        ? Array.from({ length: runN }, (_, i) => ({ id: i ? `${base}${i}` : base, s, nom: '🏃 RUN', reps: 1, run: 1, txt: `🏃 RUN ${i + 1} / ${runN} · 1 ${unit}` }))
        : [{ id: base, s, nom: '🏃 RUN', reps: 1, run: 1, txt: `🏃 RUN ${b.runVal} ${RUN_T[b.runType] || ''}` }];
      const perStu = n && b.runBy === 'e', run = perStu ? [] : runIt(`${k}-${sr}-r`).map(it => ({ ...it, s: undefined }));
      if (n) { const cols = Array.from({ length: n }, (_, s) => [...(perStu ? runIt(`${k}-${sr}-p${s}-r`, s) : []), ...planOf(g, e, k, s).map((x, j) => { const f = famOf(x.nom);
          return { id: `${k}-${sr}-p${s}-${j}`, s, f, nom: x.nom, niv: x.niv, reps: +x.reps || 0, col: f != null ? WOD_COL[f] : null, txt: exTxt(x) }; })]);
        const act = cols.filter((_, s) => !g || P[s] !== '').flat();          // profil vide (absent) : pas à cocher
        L.push({ sr, run, cols, list: e.sport === 'hyrox' ? [...run, ...act] : [...act, ...run] }); continue; }
      const ex = b.ex.map((x, j) => ({ id: `${k}-${sr}-${j}`, col: (exMeta(x.nom) || {}).f != null ? WOD_COL[exMeta(x.nom).f] : null, txt: exTxt(x) }));
      L.push({ sr, list: e.sport === 'hyrox' ? [...run, ...ex] : [...ex, ...run] }); }
    return L; }); };
  const progOf = (g, e) => { const all = itemsOf(e, g).flat().flatMap(x => x.list); return [all.filter(x => g.checks && g.checks[x.id]).length, all.length]; };
  // Bilan d'un bloc : ce que chaque élève a fait (exercices, rép. faites / prévues) et cumul du groupe par famille vs objectif
  const bilanOf = (g, e, k, IT) => { const n = wodMulti(e), b = e.blocs[k], ser = (IT || itemsOf(e, g))[k], P = profOf(g, n), ck = g.checks || {}, pt = g.part || {};
    const stu = Array.from({ length: n }, (_, s) => { const m = new Map();
      ser.forEach(x => x.cols[s].forEach(it => { const key = it.nom + '|' + it.niv, o = m.get(key) || { nom: it.nom, niv: it.niv, f: it.f, done: 0, plan: 0 }; o.plan += it.reps; if (ck[it.id]) o.done += it.reps; else if (pt[it.id]) o.done += Math.min(it.reps, pt[it.id]); m.set(key, o); }));
      return { s, name: P[s], empty: P[s] === '', ex: [...m.values()] }; });
    const act = stu.filter(x => !x.empty);
    const F = [...new Set([...act.flatMap(x => x.ex.map(y => y.f)).filter(f => f != null), ...Object.keys(b.obj || {}).filter(f => +b.obj[f] > 0).map(Number)])].sort();
    const fam = F.map(f => { const parts = act.flatMap(x => x.ex.filter(y => y.f === f).map(y => ({ ...y, s: x.s, name: x.name })));
      return { f, parts, done: parts.reduce((a, y) => a + y.done, 0), plan: parts.reduce((a, y) => a + y.plan, 0), target: (+(b.obj || {})[f] || 0) * (b.series || 1) }; });
    const R = ser.flatMap(x => x.run || []), run = b.run && R.length ? { done: R.filter(it => ck[it.id]).length, tot: R.length } : null;
    return { stu, fam, run }; };
  // pastilles « cumul du groupe » par famille (pre = avant le départ : on affiche l'objectif)
  const famChips = (fam, pre, lbl) => fam.length ? `<div class="wod-fam">${lbl ? `<b style="align-self:center;font-size:.8rem">${lbl}</b>` : ''}${fam.map(x => { const tg = x.target || x.plan, ok = !pre && tg && x.done >= tg;
    return `<span class="${ok ? 'ok' : ''}"><i class="wod-dot" style="background:${WOD_COL[x.f]}"></i>${famShort(x.f)} <b>${pre ? (x.target ? '🎯 ' + tg : tg) : x.done + '/' + tg}</b>${x.target ? (pre ? ' <small class="muted">rép. à cumuler</small>' : '') : ' <small class="muted">prévu</small>'}${ok ? ' ✔' : ''}</span>`; }).join('')}</div>` : '';
  const exDone = x => `${x.done === x.plan ? x.done : x.done + '/' + x.plan} ${x.nom}${/gainage/i.test(x.nom) ? ' (s)' : ''}${x.niv ? ` (N${x.niv})` : ''}${x.done >= x.plan ? ' ✔' : ''}`;
  // cumul du groupe par famille : « Haut du corps : 40 Pompes (É1) + 30 Pompes sur box (É2) + 30 Dips (É3) = 100 / 100 ✔ »
  const famLine = x => { const tg = x.target || x.plan, ok = tg && x.done >= tg;
    return { ok, txt: `${famShort(x.f)} : ${x.parts.map(y => `${y.name || 'É' + (y.s + 1)} ${y.done}${y.done < y.plan ? '/' + y.plan : ''} ${y.nom}`).join(' + ') || '—'} = ${x.done} / ${tg}${x.target ? '' : ' prévu'}${ok ? ' ✔' : x.target ? ` (manque ${tg - x.done})` : ''}` }; };
  const synthHTML = (g, e, k, IT) => { const B = bilanOf(g, e, k, IT);
    return `<div class="wod-syn">${B.stu.map(x => `<div><span class="who" style="background:${WOD_STU[x.s]}">Élève ${x.s + 1}${x.name ? ' · ' + esc(x.name) : ''}</span><span style="flex:1;min-width:0">${x.empty ? '<i class="muted">profil vide (absent)</i>' : x.ex.map(y => `<span style="white-space:nowrap">${y.f != null ? `<span style="color:${WOD_COL[y.f]}">●</span> ` : ''}${esc(exDone(y))}</span>`).join(' · ') || '—'}</span></div>`).join('')}
      ${B.run ? `<div><span class="who" style="background:#555">Groupe</span><span>🏃 RUN ${B.run.done}/${B.run.tot}</span></div>` : ''}</div>
      ${B.fam.length ? `<div class="wod-gsum"><b>👥 Cumul du groupe</b>${B.fam.map(x => { const L = famLine(x); return `<div class="${L.ok ? 'ok' : ''}"><i class="wod-dot" style="background:${WOD_COL[x.f]}"></i><span>${esc(L.txt)}</span></div>`; }).join('')}</div>` : ''}`; };
  // version texte (résultats des élèves, CSV)
  const synthTxt = (g, e, k, only) => { const B = bilanOf(g, e, k);
    const st = B.stu.filter(x => only == null || x.name === only).map(x => `Élève ${x.s + 1}${only == null && x.name ? ' (' + x.name + ')' : ''} : ${x.empty ? 'profil vide' : x.ex.map(exDone).join(', ') || '—'}`).join(' ; ');
    const gr = B.fam.filter(x => x.target).map(x => famLine(x).txt).join(' ; ');
    return `B${k + 1} ${st || 'sans profil'}${gr ? ' — groupe : ' + gr : ''}`; };

  // cumul du groupe d'un bloc (CSV) : familles + RUN
  const grpTxt = (g, e, k) => { const B = bilanOf(g, e, k); return `B${k + 1} ${[...B.fam.map(x => famLine(x).txt), ...(B.run ? [`RUN ${B.run.done}/${B.run.tot}`] : [])].join(' ; ') || '—'}`; };

  /* ---- Séance partagée avec les autres tablettes (modèle sans résultats) ---- */
  const pub = (cur, create) => { if (cur.joined) return; const e = cur.snap, indiv = cur.groups.every(g => g.members.length === 1 && g.name === g.members[0]);
    partPublish('wod', cur.id, { nom: e.nom, classe: cur.classe || '', ng: cur.groups.length, indiv, ep: summaryOf(e),
      tpl: { classe: cur.classe || '', snap: e, groups: cur.groups.map(g => ({ name: g.name, members: g.members })) } }, create); };
  const join = (box, p) => { const T = p.tpl, e = T.snap;
    DB.wod.current = { id: p.id, date: Date.now(), classe: T.classe, snap: JSON.parse(JSON.stringify(e)), start: null, joined: true,
      groups: T.groups.map(g => ({ name: g.name, members: [...g.members], ...(wodMulti(e) ? { prof: profInit(g.members, wodMulti(e)) } : {}), dep: null, arr: null, capped: false, splits: e.blocs.map(() => null) })) };
    save(); const cur = DB.wod.current;
    partPickGroup(box, cur.groups, i => { if (!DB.wod.current) return prepare(box); cur.only = i; save(); seance(box); }, !!p.indiv); };

  function seance(box) {
    const cur = DB.wod.current;
    if (!cur) return prepare(box);
    const e = cur.snap;
    let iv;
    const VS = {};                                              // duo/trio/quatuor : colonne affichée par groupe (absent = tous les élèves)
    // Blocs d'un groupe duo/trio/quatuor : une colonne par élève ; avant le départ, choix des profils et ajustement des exercices
    const multiHTML = (g, gi, IT, P, run) => { const n = P.length, fin = g.arr || g.capped, curK = IT.findIndex((_, j) => !g.splits[j]), vs = VS[gi] ?? null;
      const itBtn = (it, on) => { const ok = g.checks[it.id], pt = !ok && it.s != null && (g.part || {})[it.id];
        const B = `<button class="gv-it ${ok ? 'on' : pt ? 'pt' : ''}" data-ck="${it.id}" ${on ? '' : 'disabled'}${it.col ? ` style="border-left:8px solid ${it.col}"` : ''}><span class="bx">${ok ? '✓' : pt ? pt + '/' + it.reps : ''}</span><span class="t">${esc(it.txt)}</span></button>`;
        return it.s != null && it.reps > 1 ? `<div class="wod-itw">${B}<button class="wod-pt" data-pt="${it.id}" ${on ? '' : 'disabled'} title="Saisir les répétitions réalisées (en partie)" aria-label="Répétitions réalisées">✎</button></div>` : B; };
      const chead = s => `<div class="wod-ch" style="background:${WOD_STU[s]}">Élève ${s + 1}${P[s] ? ' · ' + esc(P[s]) : ' · vide'}</div>`;
      const cols = (ser, on) => ser.map(x => { const R = x.run.map(it => itBtn(it, on)).join('');
        const C = `<div class="wod-cols" style="--n:${vs == null ? n : 1}">${x.cols.map((L, s) => vs == null || vs === s ? `<div class="wod-col" data-col="${s}"${P[s] ? '' : ' style="opacity:.5"'}>${chead(s)}${L.map(it => itBtn(it, on && !!P[s])).join('') || '<div class="muted" style="padding:8px 2px;font-size:.85rem">Rien dans ce bloc</div>'}</div>` : '').join('')}</div>`;
        return `${ser.length > 1 ? `<div class="muted" style="margin-top:10px;font-size:.8rem;font-weight:800">Série ${x.sr + 1} / ${ser.length}</div>` : ''}${e.sport === 'hyrox' ? R + C : C + R}`; }).join('');
      const planEdit = k => `<div class="wod-cols" style="--n:${n}">${P.map((m, s) => `<div class="wod-col">${chead(s)}${planOf(g, e, k, s).map((x, j) => { const f = famOf(x.nom);
          return `<div style="border-left:6px solid ${f != null ? WOD_COL[f] : 'var(--line)'};padding-left:6px;margin-top:6px"><select data-ov="${k}-${s}-${j}" aria-label="Exercice">${swapOpts(x)}</select><div style="display:flex;align-items:center;gap:6px"><input type="number" min="0" inputmode="numeric" data-ovr="${k}-${s}-${j}" value="${x.reps}" style="width:80px;text-align:center" aria-label="Répétitions"><span class="muted" style="font-size:.8rem">${/gainage/i.test(x.nom) ? 's' : 'rép.'} · N${x.niv}</span></div></div>`; }).join('') || '<div class="muted" style="padding:8px 2px">—</div>'}</div>`).join('')}</div>`;
      const extra = g.members.filter(m => !P.includes(m)), empty = P.map((m, s) => m ? -1 : s).filter(s => s >= 0);
      const pfRows = P.map((m, s) => `<div style="display:flex;align-items:center;gap:8px;margin-top:8px"><span class="wod-ch" style="background:${WOD_STU[s]};flex:0 0 88px;text-align:center">Élève ${s + 1}</span><select data-pf="${s}" style="flex:1;min-width:0">${g.members.map(x => `<option value="${esc(x)}" ${x === m ? 'selected' : ''}>${esc(x)}</option>`).join('')}<option value="" ${m ? '' : 'selected'}>— personne (absent) —</option></select></div>`).join('')
        + (extra.length ? `<p style="margin:8px 0 0;font-size:.82rem;color:var(--danger);font-weight:700">⚠ Sans profil : ${extra.map(esc).join(', ')} — son travail n'est pas compté (groupe de ${g.members.length} pour ${n} profils).</p>` : '')
        + (empty.length ? `<p class="muted" style="margin:8px 0 0;font-size:.8rem">${empty.map(s => 'Élève ' + (s + 1)).join(', ')} : profil vide, non compté. Attribuez-le à un membre (il peut prendre deux profils) pour que le groupe réalise aussi ce plan.</p>` : '');
      return `${!g.dep ? `<div class="card" style="margin-top:10px"><b>👥 Qui est qui ?</b><p class="muted" style="margin:4px 0 0;font-size:.82rem">Chacun choisit son profil (Élève 1, 2…), puis peut adapter son exercice et ses répétitions dans chaque bloc avant le départ.</p>${pfRows}</div>`
        : `<div class="wod-vs">${[null, ...P.keys()].map(s => `<button data-vs="${s == null ? '' : s}" class="${vs === s ? 'on' : ''}"${vs === s ? ` style="background:${s == null ? '#555' : WOD_STU[s]}"` : ''}>${s == null ? '👥 Tous' : `Élève ${s + 1}${P[s] ? ' · ' + esc(P[s]) : ' · —'}`}</button>`).join('')}</div>
          <details style="margin-top:6px"><summary style="cursor:pointer;font-weight:700;font-size:.82rem">👥 Changer qui est qui${extra.length ? ' ⚠' : ''}</summary>${pfRows}</details>`}
        ${IT.map((ser, k) => { const b = e.blocs[k], done = !!g.splits[k], B = bilanOf(g, e, k, IT), cur = g.dep && !fin && k === curK;
          const head = `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>Bloc ${k + 1}${done ? ' · synthèse' : cur ? ' · en cours' : ''}</b><span class="muted" style="font-size:.8rem;text-align:right">${done ? '✅ ' + mmss((g.splits[k] - g.dep) / 1000) : WOD_FAM[b.famille] + (b.series > 1 ? ` · ${b.series} séries` : '')}</span></div>`;
          const body = !g.dep ? famChips(B.fam, true) + planEdit(k) + (b.series > 1 ? `<div class="muted" style="margin-top:6px;font-size:.8rem">× ${b.series} séries</div>` : '') + (b.run ? `<div class="muted" style="margin-top:6px;font-size:.85rem">🏃 RUN ${b.runVal} ${RUN_T[b.runType] || ''} (groupe)</div>` : '')
            : done || fin ? synthHTML(g, e, k, IT) + `<details style="margin-top:8px"><summary style="cursor:pointer;font-weight:700;font-size:.85rem">${run ? '✏️ Voir / corriger les coches' : 'Voir le détail'}</summary>${cols(ser, run)}</details>`
            : cur ? famChips(B.fam) + cols(ser, run) + `<button class="btn btn-ghost btn-block" style="margin-top:10px" data-nx="${k}">⏭ Valider le bloc et passer au suivant</button>`
            : `<details style="margin-top:6px"><summary style="cursor:pointer;font-weight:700;font-size:.85rem">À venir · voir le bloc</summary>${famChips(B.fam)}${cols(ser, run)}</details>`;
          return `<div class="card" style="margin-top:10px${done ? ';border:2px solid #1B9E5A' : cur ? ';border:2px solid #1FA2E8' : ''}">${head}${body}</div>`; }).join('')}`; };
    // Gestes d'un groupe (coches, profils, ajustements, vue par élève) — tablette du groupe ou vue enseignant (root = carte du groupe)
    const bindGroup = (root, g, gi, IT, nM, redraw) => { const q = x => root.querySelectorAll(x);
      const upd = k => { const blk = IT[k].flatMap(x => x.list);
        if (!(g.fz && g.fz[k])) g.splits[k] = blk.every(x => g.checks[x.id]) ? Math.max(...blk.map(x => g.checks[x.id])) : null; };   // bloc validé à la main : on garde son temps
      q('[data-ck]').forEach(b => b.onclick = () => { const id = b.dataset.ck, k = +id.split('-')[0]; g.checks = g.checks || {};
        if (g.checks[id]) delete g.checks[id]; else { g.checks[id] = Date.now(); beep(900, .06); }
        if (g.part) delete g.part[id];
        upd(k); save(); redraw(); });
      // répétitions faites en partie (duo/trio/quatuor) : comptent dans le cumul du groupe, l'étape reste à cocher
      q('[data-pt]').forEach(b => b.onclick = () => { const id = b.dataset.pt, k = +id.split('-')[0], it = IT[k].flatMap(x => x.list).find(x => x.id === id); if (!it) return;
        g.part = g.part || {}; g.checks = g.checks || {};
        const v = prompt(`Répétitions réalisées — ${it.nom}${P0(it.s)} (sur ${it.reps}) :`, g.checks[id] ? it.reps : g.part[id] || ''); if (v == null) return;
        const r = Math.max(0, parseInt(v, 10) || 0);
        if (r >= it.reps) { g.checks[id] = g.checks[id] || Date.now(); delete g.part[id]; beep(900, .06); }
        else { delete g.checks[id]; if (r > 0) g.part[id] = r; else delete g.part[id]; }
        upd(k); save(); redraw(); });
      if (!nM) return;
      function P0(s) { const m = profOf(g, nM)[s]; return m ? ` (${m})` : ''; }
      const ensure = (k, s) => { g.plan = g.plan || {}; g.plan[k] = g.plan[k] || {}; if (!g.plan[k][s]) g.plan[k][s] = wodClone(e.blocs[k].pe[s]); return g.plan[k][s]; };
      q('[data-pf]').forEach(x => x.onchange = () => { const s = +x.dataset.pf, v = x.value, Q = profOf(g, nM), t = Q.indexOf(v);
        if (v && t >= 0 && t !== s && g.members.length >= nM) Q[t] = Q[s];            // échange de profils ; groupe incomplet : un membre peut en prendre deux
        Q[s] = v; g.prof = Q; save(); redraw(); });
      q('[data-ov]').forEach(x => x.onchange = () => { const [k, s, j] = x.dataset.ov.split('-').map(Number), it = ensure(k, s)[j], m = exMeta(x.value); it.nom = x.value; if (m && m.n) it.niv = m.n; save(); redraw(); });
      q('[data-ovr]').forEach(x => x.onchange = () => { const [k, s, j] = x.dataset.ovr.split('-').map(Number); ensure(k, s)[j].reps = Math.max(0, +x.value || 0); save(); });   // pas de nouveau rendu : le prochain geste (ex. Départ) n'est pas perdu
      q('[data-vs]').forEach(x => x.onclick = () => { VS[gi] = x.dataset.vs === '' ? null : +x.dataset.vs; redraw(); });
      q('[data-nx]').forEach(x => x.onclick = () => { const k = +x.dataset.nx, blk = IT[k].flatMap(y => y.list);
        if (!blk.every(y => g.checks[y.id]) && !confirm('Tout n\'est pas coché dans ce bloc. Le valider quand même et passer au suivant ?')) return;
        g.splits[k] = Date.now(); g.fz = g.fz || {}; g.fz[k] = 1; beep(900, .1); save(); redraw(); });
    };
    // Vue « un seul groupe » : ce que voient les élèves sur leur tablette
    const drawGroup = () => {
      const i = cur.only, g = cur.groups[i]; g.checks = g.checks || {};
      const tb = box.parentElement && box.parentElement.querySelector('.co-tabs'); if (tb) tb.style.display = 'none';   // élèves : pas d'accès aux onglets
      const r = resOf(g, e), [n, tot] = progOf(g, e), run = g.dep && !g.arr && !g.capped, IT = itemsOf(e, g), nM = wodMulti(e), P = nM ? profOf(g, nM) : [];
      box.innerHTML = `<div class="card" style="text-align:center"><div style="font-weight:900;font-size:1.3rem">${esc(g.name)}</div><div class="muted">${nM ? `${WOD_FMT[nM]} · ` + P.map((m, s) => `<b style="color:${WOD_STU[s]}">Élève ${s + 1}</b> ${m ? esc(m) : '—'}`).join(' · ') : g.members.map(esc).join(', ')}</div>
          <div class="gv-clock" data-live="${i}" style="color:${g.arr || g.capped ? '#1B9E5A' : 'inherit'}">${r.t != null ? mmss(r.t) : g.dep ? mmss((Date.now() - g.dep) / 1000) : '0:00'}</div>
          <div class="muted" id="capinfo"></div>
          <div style="height:10px;border-radius:99px;background:var(--line);overflow:hidden;margin:10px 0 4px"><div style="height:100%;width:${tot ? n / tot * 100 : 0}%;background:#1B9E5A"></div></div>
          <div class="muted" style="font-size:.85rem">${n} / ${tot} étapes réalisées · ${esc(e.nom)}</div>
          ${!g.dep ? '<button class="btn btn-grad btn-block" style="margin-top:12px;font-size:1.2rem;padding:16px" id="gv-go">▶ Départ</button>' : ''}
          ${run ? `<button class="btn ${n === tot ? 'btn-grad' : 'btn-danger'} btn-block" style="margin-top:12px;font-size:1.15rem;padding:14px" id="gv-fin">🏁 Arrivée${n === tot ? ' — tout est fait !' : ''}</button>` : ''}
          ${g.arr || g.capped ? `<div style="margin-top:10px;font-weight:800">${r.cap ? '⏱ Time cap atteint' : '✅ Épreuve terminée'} · écart ${r.ecart > 0 ? '+' : ''}${mmss(r.ecart)} / ${e.prevu} min</div>` : ''}</div>
        ${nM ? multiHTML(g, i, IT, P, run) : IT.map((ser, k) => { const b = e.blocs[k], done = !!g.splits[k];
          return `<div class="card" style="margin-top:10px${done ? ';border:2px solid #1B9E5A' : ''}"><div style="display:flex;justify-content:space-between;align-items:center"><b>Bloc ${k + 1}</b><span class="muted" style="font-size:.8rem">${done ? '✅ ' + mmss((g.splits[k] - g.dep) / 1000) : WOD_FAM[b.famille]}</span></div>
            ${ser.map(x => `${ser.length > 1 ? `<div class="muted" style="margin-top:8px;font-size:.8rem;font-weight:800">Série ${x.sr + 1} / ${ser.length}</div>` : ''}
              ${x.list.map(it => `<button class="gv-it ${g.checks[it.id] ? 'on' : ''}" data-ck="${it.id}" ${run ? '' : 'disabled'}${it.col ? ` style="border-left:8px solid ${it.col}"` : ''}><span class="bx">${g.checks[it.id] ? '✓' : ''}</span><span class="t">${esc(it.txt)}</span></button>`).join('')}`).join('')}</div>`; }).join('')}
        ${g.arr || g.capped ? '<button class="btn btn-grad btn-block" style="margin-top:12px" id="save">💾 Enregistrer le résultat</button>' : ''}
        <div style="text-align:center;margin:18px 0 6px"><button class="link" id="gv-prof">🔒 Mode enseignant</button></div>`;
      const $ = q => box.querySelector(q);
      if ($('#gv-go')) $('#gv-go').onclick = () => { g.dep = Date.now(); cur.start = cur.start || g.dep; beep(1300, .45); save(); drawGroup(); };
      if ($('#gv-fin')) $('#gv-fin').onclick = () => { if (n < tot && !confirm('Toutes les étapes ne sont pas cochées. Valider l\'arrivée ?')) return; g.arr = Date.now(); beep(1000, .3); save(); drawGroup(); };
      bindGroup(box, g, i, IT, nM, drawGroup);
      $('#gv-prof').onclick = () => { if (!confirm('Passer en mode enseignant (tous les groupes, réglages) ?')) return; cur.only = null; save(); draw(); };
      if ($('#save')) $('#save').onclick = saveSeance;
    };
    const saveSeance = () => { if (cur.groups.some(g => g.dep && !g.arr && !g.capped) && !confirm('Certains groupes n\'ont pas terminé. Enregistrer quand même ?')) return;
      // seuls les groupes partis sont enregistrés (une tablette par groupe → pas de lignes vides)
      const done = cur.groups.filter(g => g.dep); if (!done.length) return toast('Aucun groupe n\'est parti');
      const rec = { ...cur, id: cur.id + Math.random().toString(36).slice(2, 5), groups: done }; delete rec.only; delete rec.joined;
      DB.wod.seances.push(rec);
      // synthèse « Résultats des élèves » : une ligne par élève
      const nM = wodMulti(e);
      done.forEach(g => { const r = resOf(g, e); g.members.forEach(n => { if (!rec.classe || !studentsOf(rec.classe).includes(n)) return;
        // duo/trio/quatuor : ce que l'élève a fait (son profil) bloc par bloc + cumul du groupe
        const mine = nM ? profOf(g, nM).map((m, s) => m === n ? s : -1).filter(s => s >= 0) : [];
        saveResult({ tool: 'wod', label: 'Crosstraining / HYROX', classe: rec.classe, eleve: n, key: `wod|${cur.id}|${rec.classe}|${n}`,
          valeur: r.t != null ? mmss(r.t) + (r.cap ? ' (time cap)' : '') : 'non terminé',
          detail: `${e.nom} · ${g.name}${g.members.length > 1 ? ' (' + g.members.join(', ') + ')' : ''} · écart ${r.ecart != null ? (r.ecart > 0 ? '+' : '') + mmss(r.ecart) : '–'} / ${e.prevu} min · blocs ${g.splits.filter(Boolean).length}/${e.blocs.length}`
            + (nM ? ` · ${WOD_FMT[nM]}, ${mine.length ? mine.map(s => 'Élève ' + (s + 1)).join(' + ') : 'sans profil'} · ${e.blocs.map((b, k) => synthTxt(g, e, k, n)).join(' | ')}` : '') }); }); });
      DB.wod.current = null; save(); clearInterval(iv); toast('Séance enregistrée ✔'); tab = 'resultats'; frame(); };
    /* ✍️ Saisie des résultats prof (sans lancer l'épreuve) : temps final (ou time cap atteint) */
    if (cur.manual) {
      clearInterval(iv);
      spTable(box, { title: `Saisie des résultats · ${e.nom}`, who: cur.groups.every(g => g.members.length === 1) ? 'Élève' : 'Groupe', rows: cur.groups.map(g => ({ label: g.name, sub: g.members.length > 1 ? g.members.join(', ') : '' })),
        help: `Temps final (ex. 12:45). Time cap ${e.cap} min atteint : cochez la case (le temps est alors facultatif). Les lignes vides sont ignorées.`,
        fields: [{ k: 't', l: 'Temps final', type: 'time' }, { k: 'cap', l: `Time cap (${e.cap} min)`, type: 'check' }],
        cancelLbl: 'Annuler (rien n\'est enregistré)',
        onCancel: () => { if (!confirm('Abandonner cette saisie ? Rien ne sera enregistré.')) return; DB.wod.current = null; save(); frame(); },
        onSave: V => { if (!V.some(v => v.t != null || v.cap)) return toast('Aucun résultat saisi');
          V.forEach((v, gi) => { const g = cur.groups[gi]; if (v.t == null && !v.cap) return; const t = v.t != null ? v.t : e.cap * 60;
            g.dep = 1; g.arr = 1 + Math.round(t * 1000); g.capped = !!v.cap || t > e.cap * 60; g.splits = e.blocs.map(() => null); });
          delete cur.manual; saveSeance(); } });
      return;
    }
    const shut = new Set();                                     // vue enseignant : suivis par élève repliés
    const draw = () => {
      if (cur.only != null && cur.groups[cur.only]) return drawGroup();
      const nM = wodMulti(e); cur.groups.forEach(g => g.checks = g.checks || {});
      { const tb = box.parentElement && box.parentElement.querySelector('.co-tabs'); if (tb) tb.style.display = ''; }
      box.innerHTML = `<div class="card"><b>${esc(e.nom)}</b><div class="muted">${esc(cur.classe || '')} · ${summaryOf(e)}</div>
          <div class="big clock" id="gclk" style="font-size:clamp(2.4rem,12vw,4rem);padding:4px 0">0:00</div>
          <div class="muted" style="text-align:center" id="capinfo"></div>
          ${cur.groups.length > 1 ? `<div data-cfg="bare"><label>📱 Tablette d'un groupe (les élèves ne verront que leur groupe)</label><select id="only"><option value="">Tous les groupes</option>${cur.groups.map((g, i) => `<option value="${i}" ${cur.only === i ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></div>` : ''}
          <div class="row" style="margin-top:8px"><button class="btn btn-grad" id="all">🚩 Départ ${cur.only != null ? 'du groupe' : 'groupé'}</button></div><button class="btn btn-ghost btn-block" data-cfg="bare" style="margin-top:8px" id="edg">✏️ Modifier les groupes / participants (absent, blessé…)</button></div>
        <details class="card" style="margin-top:10px"><summary style="font-weight:800;cursor:pointer">📋 Rappel de l'épreuve</summary>${e.blocs.map((b, i) => `<div style="margin-top:8px"><b>Bloc ${i + 1}</b> <span class="muted">· ${WOD_FAM[b.famille]} · ${b.series} série${b.series > 1 ? 's' : ''}</span>
          ${nM ? b.pe.map((L, s) => `<div class="muted" style="font-size:.85rem"><b style="color:${WOD_STU[s]}">Élève ${s + 1}</b> : ${L.map(x => `${famOf(x.nom) != null ? `<span style="color:${WOD_COL[famOf(x.nom)]}">●</span> ` : ''}${x.reps} ${esc(x.nom)} (N${x.niv})`).join(' · ') || '—'}</div>`).join('')
            + (Object.keys(b.obj || {}).length ? `<div class="muted" style="font-size:.85rem">🎯 Groupe : ${Object.keys(b.obj).map(f => `${famShort(+f)} ${b.obj[f]} rép.${b.series > 1 ? ' / série' : ''}`).join(' · ')}${b.run ? ` · RUN ${b.runVal} ${RUN_T[b.runType]}` : ''}</div>` : b.run ? `<div class="muted" style="font-size:.85rem">RUN ${b.runVal} ${RUN_T[b.runType]}</div>` : '') : `
          <div class="muted" style="font-size:.85rem">${b.ex.map(x => `${(exMeta(x.nom) || {}).f != null ? `<span style="color:${WOD_COL[exMeta(x.nom).f]}">●</span> ` : ''}${x.reps} ${esc(x.nom)} (N${x.niv})`).join(' · ')}${b.run ? ` · RUN ${b.runVal} ${RUN_T[b.runType]}` : ''}</div>`}</div>`).join('')}</details>
        ${cur.groups.map((g, i) => { if (cur.only != null && cur.only !== i) return ''; const r = resOf(g, e);
          return `<div class="run ${g.arr || g.capped ? 'fin' : g.dep ? 'go' : ''}"><div class="run-h"><b>${esc(g.name)}</b><span class="run-t" data-live="${i}">${r.t != null ? mmss(r.t) : g.dep ? '…' : '0:00'}</span></div>
            <div class="muted" style="font-size:.8rem">${nM ? profOf(g, nM).map((m, s) => `<b style="color:${WOD_STU[s]}">É${s + 1}</b> ${m ? esc(m) : '—'}`).join(' · ') : g.members.map(esc).join(', ')}${g.checks && Object.keys(g.checks).length ? ` · ✔ ${progOf(g, e).join(' / ')} étapes` : ''}</div>
            <div class="splits">${e.blocs.map((b, k) => `<button data-sp="${i}-${k}" class="${g.splits[k] ? 'on' : ''}" ${g.dep && !g.arr && !g.capped ? '' : 'disabled'}>Bloc ${k + 1}${g.splits[k] ? ' · ' + mmss((g.splits[k] - g.dep) / 1000) : ''}</button>`).join('')}</div>
            <div class="row" style="margin-top:8px">${g.dep ? '' : `<button class="btn btn-grad" data-go="${i}">▶ Départ</button>`}${g.dep && !g.arr && !g.capped ? `<button class="btn btn-danger" data-fin="${i}">🏁 Arrivée</button>` : ''}${g.arr || g.capped ? `<button class="btn btn-ghost" data-undo="${i}">↺ Annuler l'arrivée</button>` : ''}</div>
            ${r.t != null ? `<div style="margin-top:6px;font-size:.88rem">Temps réalisé <b>${mmss(r.t)}</b> · écart <b style="color:${r.ecart > 0 ? 'var(--danger)' : 'var(--ok)'}">${r.ecart > 0 ? '+' : ''}${mmss(r.ecart)}</b> par rapport aux ${e.prevu} min ${r.cap ? '· <span class="pill warn">time cap</span>' : ''}</div>` : ''}
            ${nM ? `<details class="wod-gd" data-gd="${i}" style="margin-top:8px" ${shut.has(i) ? '' : 'open'}><summary style="cursor:pointer;font-weight:800;font-size:.88rem">✔ Suivi par élève · coches et synthèse des blocs</summary><div data-gi="${i}">${multiHTML(g, i, itemsOf(e, g), profOf(g, nM), g.dep && !g.arr && !g.capped)}</div></details>` : ''}</div>`; }).join('')}
        <div class="row" style="margin-top:12px"><button class="btn btn-grad" data-cfg="bare" id="save">💾 Terminer et enregistrer</button><button class="btn btn-ghost" data-cfg="bare" id="cancel">Abandonner</button></div>`;
      const $ = s => box.querySelector(s), all = s => box.querySelectorAll(s), keep = () => save();
      if ($('#only')) $('#only').onchange = ev => { cur.only = ev.target.value === '' ? null : +ev.target.value; keep(); draw(); };
      $('#all').onclick = () => { const t = Date.now(); cur.groups.forEach((g, i) => { if (!g.dep && (cur.only == null || cur.only === i)) g.dep = t; }); cur.start = cur.start || t; beep(1300, .45); keep(); draw(); };
      $('#edg').onclick = () => { const indiv = cur.groups.every(g => g.members.length === 1 && g.name === g.members[0]);
        editGroupsPanel(indiv ? 'Participants' : 'Groupes de la séance', { cls: cur.classe, indiv, list: () => cur.groups, names: g => g.members,
          take: (g, n) => { g.members.splice(g.members.indexOf(n), 1); return indiv ? { dep: g.dep, arr: g.arr, capped: g.capped, splits: g.splits } : null; },
          put: (g, n, d) => { g.members.push(n); if (indiv && d) Object.assign(g, d); },
          make: name => ({ name, members: [], dep: null, arr: null, capped: false, splits: (cur.groups[0]?.splits || []).map(() => null) }), onChange: () => { keep(); pub(cur); }, onClose: draw }); };
      all('[data-go]').forEach(b => b.onclick = () => { cur.groups[+b.dataset.go].dep = Date.now(); cur.start = cur.start || Date.now(); beep(1300, .3); keep(); draw(); });
      all('[data-fin]').forEach(b => b.onclick = () => { const g = cur.groups[+b.dataset.fin]; g.arr = Date.now(); beep(1000, .3); keep(); draw(); });
      all('[data-undo]').forEach(b => b.onclick = () => { const g = cur.groups[+b.dataset.undo]; g.arr = null; g.capped = false; keep(); draw(); });
      all('[data-sp]').forEach(b => b.onclick = () => { const [i, k] = b.dataset.sp.split('-').map(Number), g = cur.groups[i]; g.splits[k] = g.splits[k] ? null : Date.now(); if (g.fz) delete g.fz[k]; beep(900, .06); keep(); draw(); });
      all('[data-gd]').forEach(d => d.ontoggle = () => { if (d.open) shut.delete(+d.dataset.gd); else shut.add(+d.dataset.gd); });
      all('[data-gi]').forEach(r => { const gi = +r.dataset.gi, g = cur.groups[gi]; bindGroup(r, g, gi, itemsOf(e, g), nM, draw); });
      $('#save').onclick = saveSeance;
      $('#cancel').onclick = () => { if (confirm('Abandonner la séance ?')) { partAskRemove(cur); DB.wod.current = null; save(); clearInterval(iv); prepare(box); } };
    };
    const tick = () => {
      if (!box.isConnected || !DB.wod.current) return clearInterval(iv);
      const now = Date.now(), capMs = e.cap * 60000;
      const gc = box.querySelector('#gclk'); if (gc) gc.textContent = cur.start ? mmss((now - cur.start) / 1000) : '0:00';
      const t0 = cur.only != null && cur.groups[cur.only] ? cur.groups[cur.only].dep : cur.start, gOnly = cur.only != null && cur.groups[cur.only];
      const ci = box.querySelector('#capinfo'); if (ci) ci.textContent = gOnly && (gOnly.arr || gOnly.capped) ? '' : t0 ? `Time cap dans ${mmss(Math.max(0, (t0 + capMs - now) / 1000))}` : `Time cap : ${e.cap} min`;
      let changed = false;
      cur.groups.forEach((g, i) => {
        if (g.dep && !g.arr && !g.capped && now - g.dep >= capMs) { g.capped = true; g.arr = g.dep + capMs; changed = true; }
        const l = box.querySelector(`[data-live="${i}"]`); if (l && g.dep && !g.arr) l.textContent = mmss((now - g.dep) / 1000);
      });
      if (changed) { [0, 350, 700].forEach(d => setTimeout(() => beep(700, .5), d)); save(); draw(); }
    };
    draw(); clearInterval(window._wodTick); iv = window._wodTick = setInterval(tick, 500); tick();
  }

  let wodManual = false;
  function prepare(box) {
    if (!DB.wod.epreuves.length) { box.innerHTML = '<div class="card empty">Créez d\'abord une épreuve dans l\'onglet 🏋️ Épreuves.</div>'; partMount(box, 'wod', p => join(box, p)); return; }
    let mode = 'grp', sel = DB.wod.epreuves[0].id;
    const draw = () => {
      const ep = E(sel) || DB.wod.epreuves[0], fmt = ep.format || 0, md = fmt === 1 ? 'indiv' : fmt >= 2 ? 'grp' : mode;   // le format de l'épreuve impose l'organisation
      box.innerHTML = `<div class="card" data-cfg><h3>Nouvelle séance</h3>
        <label>Épreuve</label><select id="ep">${DB.wod.epreuves.map(e => `<option value="${e.id}" ${e.id === ep.id ? 'selected' : ''}>${esc(e.nom)} — ${e.format ? WOD_FMT[e.format] + ' · ' : ''}${e.sport === 'hyrox' ? 'HYROX' : 'Crosstraining'}</option>`).join('')}</select>
        ${fmt ? `<div class="pill" style="margin-top:10px;display:inline-block">Format de l'épreuve : <b>${WOD_FMT[fmt]}</b>${fmt >= 2 ? ` · groupes de ${fmt} (Élève 1 à ${fmt})` : ' · un élève = une fiche'}</div>`
          : `<label>Organisation</label><div class="seg"><button data-md="indiv" class="${md === 'indiv' ? 'on' : ''}">Individuel</button><button data-md="grp" class="${md === 'grp' ? 'on' : ''}">Groupes<br><small style="font-weight:600;opacity:.85">duo · trio · quatuor</small></button></div>`}
        <label>Déroulement</label><div class="seg"><button data-wm="live" class="${wodManual ? '' : 'on'}">⏱ Séance en direct (tablettes)</button><button data-wm="man" class="${wodManual ? 'on' : ''}">${SP_BTN.replace(' (', '<br><small>(').replace(')', ')</small>')}</button></div>
        <div id="who" style="margin-top:10px"></div></div>`;
      box.querySelectorAll('[data-wm]').forEach(b => b.onclick = () => { wodManual = b.dataset.wm === 'man'; draw(); });
      box.querySelectorAll('[data-md]').forEach(b => b.onclick = () => { mode = b.dataset.md; draw(); });
      box.querySelector('#ep').onchange = ev => { sel = ev.target.value; draw(); };
      const who = box.querySelector('#who');
      const launch = (groups, classe) => { const e = E(box.querySelector('#ep').value);
        DB.wod.current = { id: wid(), date: Date.now(), classe, snap: JSON.parse(JSON.stringify(e)), start: null,
          groups: groups.map(g => ({ ...g, ...(wodMulti(e) ? { prof: profInit(g.members, wodMulti(e)) } : {}), dep: null, arr: null, capped: false, splits: e.blocs.map(() => null) })) }; if (wodManual) DB.wod.current.manual = true; else pub(DB.wod.current, true); save(); seance(box); };
      if (md === 'indiv') {
        who.innerHTML = DB.classes.length ? `<label>Classe</label><select id="cl">${DB.classes.map(c => `<option>${esc(c.name)}</option>`).join('')}</select><button class="btn btn-grad btn-block" style="margin-top:12px" id="go">▶ Préparer la séance</button>` : noClassMsg;
        const go = who.querySelector('#go'); if (go) go.onclick = () => { const c = who.querySelector('#cl').value; launch(studentsOf(c).map(n => ({ name: n, members: [n] })), c); };
      } else {
        who.innerHTML = `<div ${fmt ? 'hidden' : ''}><label>Taille des groupes</label><div class="seg" id="sz">${[[2, 'Duos'], [3, 'Trios'], [4, 'Quatuors']].map(([n, l]) => `<button data-n="${n}" class="${n === 2 ? 'on' : ''}">${l}</button>`).join('')}</div></div><div id="cmp" style="margin-top:6px"></div>`;
        mountComposer(who.querySelector('#cmp'), { id: 'wodc', modes: ['random', 'hetero', 'homo'], button: '▶ Former les groupes et préparer la séance',
          onTeams: teams => launch(teams.map(t => ({ name: t.name.replace('Équipe', 'Groupe'), members: t.members.map(m => m.n) })), who.querySelector('#wodc-cls')?.value || '') });
        const setSize = n => { who.querySelector('#wodc-k').value = 's'; who.querySelector('#wodc-v').value = n; who.querySelectorAll('#sz [data-n]').forEach(b => b.classList.toggle('on', +b.dataset.n === n)); };
        who.querySelectorAll('#sz [data-n]').forEach(b => b.onclick = () => setSize(+b.dataset.n)); setSize(fmt >= 2 ? fmt : 2);
      }
      partMount(box, 'wod', p => join(box, p));
    };
    draw();
  }

  /* ================= 3. RÉSULTATS ================= */
  function resultats(box) {
    const S = DB.wod.seances;
    if (!S.length) { box.innerHTML = '<div class="card empty">Aucune séance enregistrée pour l\'instant.</div>'; return; }
    // Regroupement à l'affichage : même jour + même classe + même épreuve = une seule séance (plusieurs tablettes)
    const day = t => new Date(t).toLocaleDateString('fr-FR'), G = [];
    S.forEach(s => { const k = [day(s.date), s.classe || '', s.snap.id || s.snap.nom].join('|'); let x = G.find(y => y.k === k); if (!x) G.push(x = { k, list: [] }); x.list.push(s); });
    G.sort((a, b) => Math.max(...b.list.map(s => s.date)) - Math.max(...a.list.map(s => s.date)));
    box.innerHTML = `<div class="section-title" style="margin-top:0"><h2>Séances (${G.length})</h2><button class="link" id="exp">Exporter CSV</button></div>
      ${G.map((x, gi) => { const e = x.list[0].snap;
        const rows = x.list.flatMap(s => s.groups.map(g => ({ g, r: resOf(g, s.snap) }))).sort((a, b) => (a.r.cap - b.r.cap) || ((a.r.t ?? 1e9) - (b.r.t ?? 1e9)));
        return `<div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><b>${day(x.list[0].date)} · ${esc(e.nom)}</b><div class="muted">${esc(x.list[0].classe || '')} · ${summaryOf(e)}${x.list.length > 1 ? ` · ${rows.length} groupes (${x.list.length} tablettes)` : ''}</div></div><button class="btn btn-ghost" data-cfg="bare" data-x="${gi}">🗑</button></div>
          <div class="sheet-table"><table><tr><th>#</th><th>Groupe / élève</th><th>Temps réalisé</th><th>Écart</th><th>Blocs</th></tr>
          ${rows.map(({ g, r }, k) => `<tr><td>${k + 1}</td><td><b>${esc(g.name)}</b><div class="muted" style="font-size:.75rem">${g.members.map(esc).join(', ')}</div></td><td>${r.t != null ? mmss(r.t) : '–'}${r.cap ? ' <span class="pill warn">cap</span>' : ''}</td><td>${r.ecart != null ? (r.ecart > 0 ? '+' : '') + mmss(r.ecart) : '–'}</td><td>${g.splits.filter(Boolean).length}/${e.blocs.length}</td></tr>`).join('')}</table></div>
          ${rows.some(({ g }) => wodMulti(x.list.find(s => s.groups.includes(g)).snap)) ? `<details style="margin-top:8px"><summary style="cursor:pointer;font-weight:800">📋 Détail par élève (${WOD_FMT[e.format] || ''})</summary>
            ${rows.map(({ g }) => { const se = x.list.find(s => s.groups.includes(g)).snap; return wodMulti(se) ? `<div style="margin-top:12px"><b>${esc(g.name)}</b>${se.blocs.map((b, k) => `<div style="margin-top:6px"><span class="muted" style="font-size:.82rem;font-weight:800">Bloc ${k + 1}</span>${synthHTML(g, se, k)}</div>`).join('')}</div>` : ''; }).join('')}</details>` : ''}</div>`; }).join('')}`;
    box.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { const L = G[+b.dataset.x].list;
      if (!confirm(L.length > 1 ? `Supprimer cette séance ? (${L.length} enregistrements de tablettes)` : 'Supprimer cette séance ?')) return;
      DB.wod.seances = S.filter(s => !L.includes(s)); save(); resultats(box); });
    const NB = Math.max(...S.map(s => s.snap.blocs.length)), anyM = S.some(s => wodMulti(s.snap));
    // CSV : une ligne par groupe ; duo/trio/quatuor : puis une ligne par élève (profil) avec ce qu'il a fait bloc par bloc
    box.querySelector('#exp').onclick = () => download(`crosstraining-hyrox-${new Date().toISOString().slice(0, 10)}.csv`, csv([
      ['Date', 'Classe', 'Épreuve', 'Sport', 'Temps prévu (min)', 'Time cap (min)', 'Groupe', 'Membres', 'Temps réalisé', 'Écart', 'Time cap atteint', ...Array.from({ length: NB }, (_, k) => 'Bloc ' + (k + 1)), ...(anyM ? ['Format', 'Ligne', 'Détail'] : [])],
      ...S.flatMap(s => s.groups.flatMap(g => { const e = s.snap, r = resOf(g, e), nM = wodMulti(e);
        const base = m => [new Date(s.date).toLocaleDateString('fr-FR'), s.classe, e.nom, e.sport === 'hyrox' ? 'HYROX' : 'Crosstraining', e.prevu, e.cap, g.name, m, mmss(r.t), r.ecart != null ? mmss(r.ecart) : '', r.cap ? 'oui' : 'non', ...g.splits.map(x => x && g.dep ? mmss((x - g.dep) / 1000) : ''), ...Array(NB - g.splits.length).fill('')];
        const L = [[...base(g.members.join(', ')), ...(anyM ? [e.format ? WOD_FMT[e.format] : '', nM ? 'Groupe' : '', nM ? e.blocs.map((b, k) => grpTxt(g, e, k)).join(' | ') : ''] : [])]];
        if (nM) profOf(g, nM).forEach((m, st) => L.push([...base(m || '(profil vide)'), WOD_FMT[e.format], 'Élève ' + (st + 1), e.blocs.map((b, k) => { const x = bilanOf(g, e, k).stu[st]; return `B${k + 1} ${x.empty ? 'profil vide' : x.ex.map(exDone).join(', ') || '—'}`; }).join(' | ')]));
        return L; }))]));
  }

  frame();
  return () => clearInterval(window._wodTick);
};
