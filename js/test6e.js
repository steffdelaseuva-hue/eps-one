/* =========================================================
   EPS ONE — Outil « Tests 6e »
   Batterie nationale de tests de condition physique en 6e :
   · obligatoires : endurance (test Léger → palier + VMA), force (saut à pieds joints),
     vitesse (30 m)
   · optionnels : équilibre (1 jambe, max 45 s), coordination (lancers contre un mur en 30 s),
     souplesse (flexion avant assis, intitulé modifiable), endurance musculaire (chaise, max 2 min 30)
   Sessions (date + classe) pour refaire les tests en fin d'année et voir la progression.
   Données : DB.test6e = { cfg, sessions: { id: { id, date, classe, nom, res: { élève: { test: {...} } } } } }
   ========================================================= */
DB.test6e = DB.test6e || { cfg: {}, sessions: {} };
ICONS.test6e = '<circle cx="8.5" cy="14.5" r="6"/><path d="M8.5 14.5v-3M7 6.5h3M8.5 6.5v2"/><path d="M13.5 9.5c1.6-4 5.4-4.6 7.5-1.5"/><path d="M21 5.2V8h-2.8"/><path d="M16 20.5h5.5M18.75 20.5v-6"/>';

if (!document.getElementById('t6-css')) document.head.insertAdjacentHTML('beforeend', `<style id="t6-css">
.t6-tabs{display:flex;gap:6px;margin:12px 0}
.t6-tabs button{flex:1;min-width:0;padding:8px 2px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.78rem;line-height:1.15;color:var(--text)}
.t6-tabs button span{display:block;font-size:1.05rem}
.t6-tabs button.on{background:var(--grad);color:#fff;border-color:transparent}
.t6-seg{display:flex;gap:6px;flex-wrap:wrap}
.t6-seg button{flex:1 1 auto;padding:9px 10px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.82rem;color:var(--text);min-width:0}
.t6-seg button.on{background:var(--grad);color:#fff;border-color:transparent}
.t6-chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}
.t6-chips button{flex:0 0 auto;padding:8px 12px;border-radius:999px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.8rem;color:var(--muted)}
.t6-chips button.on{background:var(--grad);color:#fff;border-color:transparent}
.t6-chips button small{display:block;font-weight:600;font-size:.66rem;opacity:.9}
.t6-help{font-size:.86rem;line-height:1.45;margin:0}
.t6-tbl{overflow:auto;margin-top:0;padding:0}
.t6-tbl table{border-collapse:collapse;min-width:100%;font-variant-numeric:tabular-nums}
.t6-tbl th{font-size:.7rem;line-height:1.2;vertical-align:bottom;padding:8px 5px;min-width:66px;max-width:112px;white-space:normal}
.t6-tbl th small{display:block;color:var(--muted);font-weight:600}
.t6-tbl td{padding:4px 5px}
.t6-tbl th:first-child,.t6-tbl td:first-child{position:sticky;left:0;background:var(--card);z-index:1;font-weight:700;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.t6-cell{width:100%;min-width:62px;padding:9px 4px;border-radius:10px;border:1.5px dashed var(--line);background:transparent;font-weight:800;font-size:.86rem;color:var(--muted);white-space:nowrap}
.t6-cell.ok{border-style:solid;background:var(--grad-soft);color:var(--text)}
.t6-cell.ab{border-style:solid;color:var(--danger);font-size:.75rem}
.t6-foot td{font-size:.76rem;color:var(--muted);font-weight:700;text-align:center;border-bottom:none}
.t6-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;padding:9px 12px;border-bottom:1px solid var(--line)}
.t6-row:last-child{border-bottom:none}
.t6-row .nm{flex:1 1 110px;font-weight:800;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.t6-row .ins{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.t6-row input{width:74px;padding:9px 6px;text-align:center;font-weight:700}
.t6-row .best{min-width:62px;text-align:right;font-weight:900;font-variant-numeric:tabular-nums}
.t6-row.t6ab,.t6-c.t6ab{opacity:.5}
.t6-row.t6ok{background:var(--grad-soft)}
.t6-st{padding:8px 8px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.72rem;color:var(--muted);min-width:44px}
.t6-st.A,.t6-st.D{color:#fff;background:var(--danger);border-color:transparent}
.t6-ch{padding:9px 10px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.82rem;color:var(--text);min-width:78px;font-variant-numeric:tabular-nums}
.t6-ch.t6on{background:var(--gold);color:#fff;border-color:transparent}
.t6-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:10px;margin-top:10px}
.t6-c{border:2px solid var(--line);border-radius:16px;padding:10px;background:var(--card);text-align:center;min-width:0}
.t6-c.t6on{border-color:var(--gold);box-shadow:0 0 0 2px rgba(201,162,39,.25)}
.t6-c.t6ok{border-color:var(--ok)}
.t6-c .nm{font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.t6-c .big{font-size:1.9rem;font-weight:900;font-variant-numeric:tabular-nums;line-height:1.1;margin:4px 0}
.t6-c .big small{font-size:.8rem;color:var(--muted);font-weight:700}
.t6-c .bar{height:6px;border-radius:99px;background:var(--line);overflow:hidden}
.t6-c .bar i{display:block;height:100%;width:0;background:var(--grad)}
.t6-c .go{width:100%;margin-top:8px;padding:16px 4px;font-size:1.05rem}
.t6-c .sub{display:flex;gap:4px;margin-top:6px;align-items:center}
.t6-c .sub input{flex:1;min-width:0;padding:7px 4px;text-align:center}
.t6-c .sub button{flex:0 0 auto;padding:7px 8px;border-radius:9px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.76rem;color:var(--text)}
.t6-c .plus{width:100%;margin-top:8px;padding:22px 4px;font-size:1.6rem;font-weight:900}
.t6-c .flag{font-size:.72rem;font-weight:800;color:var(--ok);min-height:1em}
.t6-timer{border-radius:18px;color:#fff;padding:12px;text-align:center;background:#6E7A93}
.t6-timer.t6on{background:linear-gradient(135deg,#D4AF37,#A67C1A)}
.t6-timer.t6end{background:var(--ok)}
.t6-timer b{display:block;font-size:clamp(2.6rem,14vw,4.6rem);font-weight:900;line-height:1.05;font-variant-numeric:tabular-nums}
.t6-timer span{font-weight:800;text-transform:uppercase;letter-spacing:.5px;font-size:.82rem}
.t6-up{color:var(--ok);font-weight:800}.t6-down{color:var(--danger);font-weight:800}.t6-eq{color:var(--muted);font-weight:800}
.t6-ov{position:fixed;inset:0;z-index:300;background:rgba(7,18,42,.6);display:flex;align-items:flex-start;justify-content:center;padding:max(16px,env(safe-area-inset-top)) 16px 16px;overflow:auto}
.t6-box{background:var(--card);border-radius:20px;padding:16px;width:100%;max-width:440px;box-shadow:var(--shadow);margin-top:4vh}
.t6-box h3{margin:0}
.t6-box .ess{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px;margin-top:8px}
.t6-box input{text-align:center;font-size:1.15rem;font-weight:800}
.t6-kv{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid var(--line)}
.t6-kv:last-child{border-bottom:none}
.t6-lbl{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}
@media (max-width:480px){.t6-row .ins{order:3;flex-basis:100%}.t6-row input{width:70px}.t6-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.t6-c .big{font-size:1.6rem}}
</style>`);

const t6DB = () => { const D = DB.test6e = DB.test6e || {}; D.cfg = D.cfg || {}; D.sessions = D.sessions || {}; return D; };
const T6_BASE = [
  { id: 'leger', mand: true, kind: 'leger', name: 'Endurance', sub: 'Test Léger', unit: 'km/h', dec: 1, hb: true,
    help: 'Navette 20 m (Luc Léger). On note le <b>numéro du dernier palier</b> et la <b>VMA</b> (vitesse du dernier palier terminé).' },
  { id: 'saut', mand: true, kind: 'essais', name: 'Force', sub: 'Saut pieds joints', unit: 'm', dec: 2, hb: true,
    help: 'Saut en longueur <b>à l\'arrêt, départ pieds joints</b>. Mesure en mètres (ex. 1,65) jusqu\'à la trace la plus proche de la ligne. <b>Meilleur essai retenu.</b>' },
  { id: 'vitesse', mand: true, kind: 'essais', name: 'Vitesse', sub: '30 m', unit: 's', dec: 2, hb: false, chrono: true,
    help: 'Courir <b>30 m le plus vite possible</b>. Temps en secondes au 1/100e (ex. 5,84). <b>Meilleur essai retenu.</b> Saisie au clavier ou petit chrono ⏱ (Départ / Arrivée).' },
  { id: 'equilibre', kind: 'chrono', name: 'Équilibre', sub: 'Sur une jambe', unit: 's', dec: 1, hb: true, maxKey: 'equilibre',
    help: 'Tenir <b>le plus longtemps possible debout sur une jambe</b>, l\'autre jambe pliée à 90°. On arrête le chrono quand le pied se pose ou que l\'élève se déplace.' },
  { id: 'coordination', kind: 'count', name: 'Coordination', sub: 'Lancers mur 30 s', unit: 'lancers', dec: 0, hb: true,
    help: 'Le <b>maximum de lancers de balle contre un mur</b> (lancer + rattraper) en <b>30 s</b>. Un observateur touche « +1 » à chaque balle rattrapée.' },
  { id: 'souplesse', kind: 'signed', name: 'Souplesse', sub: 'Flexion avant assis', unit: 'cm', dec: 1, hb: true,
    help: 'Assis jambes tendues, pieds contre la boîte (ou le banc), <b>descendre les mains le plus loin possible</b> et tenir 2 s. Distance en cm par rapport aux pieds : <b>négative</b> si les doigts n\'atteignent pas les pieds, <b>positive</b> au-delà. L\'intitulé et l\'unité se changent dans ⚙️ Réglages.' },
  { id: 'chaise', kind: 'chrono', name: 'Endurance musc.', sub: 'Chaise contre le mur', unit: 's', dec: 1, hb: true, maxKey: 'chaise',
    help: 'Position de la <b>chaise contre le mur</b> (dos au mur, cuisses à l\'horizontale, genoux à 90°) <b>le plus longtemps possible</b>.' },
];
const T6_OPT = ['equilibre', 'coordination', 'souplesse', 'chaise'];
function t6Cfg() {
  const c = t6DB().cfg;
  return { opt: { equilibre: true, coordination: true, souplesse: true, chaise: true, ...(c.opt || {}) },
    essais: { saut: 2, vitesse: 2, ...(c.essais || {}) },
    max: { equilibre: 45, chaise: 150, coordination: 30, ...(c.max || {}) },
    lbl: c.lbl || {}, souplesseHb: c.souplesseHb !== false };
}
const t6Tests = (all) => { const c = t6Cfg();
  return T6_BASE.map(t => ({ ...t, ...(c.lbl[t.id] || {}), hb: t.id === 'souplesse' ? c.souplesseHb : t.hb, max: t.maxKey ? c.max[t.maxKey] : t.id === 'coordination' ? c.max.coordination : null,
    n: t.kind === 'essais' ? c.essais[t.id] : 1 })).filter(t => all || t.mand || c.opt[t.id]); };
const t6Fr = (n, d) => n == null || n === '' || !isFinite(n) ? '' : (+n).toFixed(d).replace('.', ',');
const t6Num = s => { s = String(s ?? '').trim().replace(/\s/g, '').replace(',', '.'); if (s === '' || s === '-' || s === '+') return null; const n = +s; return isFinite(n) ? n : null; };
const t6Today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const t6Date = d => d ? new Date(d + 'T12:00').toLocaleDateString('fr-FR') : '';
const t6VmaFromPalier = p => p > 1 ? 8.5 + (p - 2) * 0.5 : 0;   // même convention que l'outil Test VMA (Luc Léger, 8,5 km/h + 0,5/palier)
const t6Val = (t, r) => { if (!r) return ''; if (r.abs) return r.abs === 'D' ? 'Disp.' : 'Abs.';
  if (t.kind === 'leger') return r.palier == null && r.vma == null ? '' : `P${r.palier ?? '?'}${r.vma != null ? ' · ' + t6Fr(r.vma, 1) : ''}`;
  return t6Fr(r.v, t.dec); };
const t6Long = (t, r) => { if (!r) return ''; if (r.abs) return r.abs === 'D' ? 'Dispensé' : 'Absent';
  if (t.kind === 'leger') return [r.palier != null ? 'Palier ' + r.palier : '', r.vma != null ? t6Fr(r.vma, 1) + ' km/h' : ''].filter(Boolean).join(' · ');
  return r.v == null ? '' : `${t6Fr(r.v, t.dec)} ${t.unit}`; };
const t6Has = r => r && !r.abs && r.v != null;
const t6Best = (t, e) => { const v = (e || []).filter(x => x != null && isFinite(x)); return v.length ? (t.hb ? Math.max(...v) : Math.min(...v)) : null; };

TOOL_IMPL.test6e = function (el) {
  if (!DB.classes.length) { el.innerHTML = noClassMsg; return; }
  let cls = (DB.classes.find(c => c.name === DB.lastClass) || DB.classes[0]).name;
  let sid = null, tab = 'grid', passId = 'saut', cmpId = null, who = '', hideDone = false;
  const live = {};            // chronos en cours : 'test|élève' → { t0, sid }
  let coord = null;           // minuteur coordination : { t0 } | { pre } | { end: true }
  let iv = null, preT = null;

  const sessionsOf = c => Object.values(t6DB().sessions).filter(s => s && s.classe === c).sort((a, b) => ((a.date || '') + a.id).localeCompare((b.date || '') + b.id));
  const pickLatest = () => { const L = sessionsOf(cls); sid = L.length ? L[L.length - 1].id : null; const i = L.findIndex(s => s.id === sid); cmpId = i > 0 ? L[i - 1].id : null; };
  const cur = () => (sid && t6DB().sessions[sid]) || null;
  const newSession = nom => { const id = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    t6DB().sessions[id] = { id, date: t6Today(), classe: cls, nom: nom || (sessionsOf(cls).length ? 'Fin d\'année' : 'Début d\'année'), res: {} }; save(); return id; };
  const ensure = (id) => { if (id && t6DB().sessions[id]) return t6DB().sessions[id]; if (!cur()) sid = newSession(); return cur(); };
  const getR = (e, tid, s = cur()) => s && s.res && s.res[e] ? s.res[e][tid] : undefined;
  const setR = (e, tid, r, id) => { const s = ensure(id); s.res = s.res || {}; s.res[e] = s.res[e] || {};
    if (r == null) delete s.res[e][tid]; else s.res[e][tid] = r; if (!Object.keys(s.res[e]).length) delete s.res[e]; save(); };
  const students = () => studentsOf(cls);
  const T = id => t6Tests(true).find(t => t.id === id);

  pickLatest();

  /* ---------- Squelette ---------- */
  function draw() {
    const L = sessionsOf(cls), s = cur();
    el.innerHTML = `<div class="card"><div class="row">
        <div style="flex:1 1 120px"><label>Classe</label><select id="t6c">${DB.classes.map(c => `<option ${c.name === cls ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div style="flex:2 1 230px"><label>Session de tests</label><select id="t6s">${L.length ? '' : '<option value="">Nouvelle session (créée à la 1re saisie)</option>'}${L.map(x => `<option value="${x.id}" ${x.id === sid ? 'selected' : ''}>${esc(x.nom || 'Session')} — ${t6Date(x.date)}</option>`).join('')}<option value="+">＋ Nouvelle session…</option></select></div></div>
        ${s ? '' : '<p class="muted" style="margin:8px 0 0;font-size:.8rem">Une session = une date + une classe. Refaites les tests en fin d\'année dans une nouvelle session pour voir la progression.</p>'}</div>
      <div class="t6-tabs">${[['grid', '📋', 'Tableau'], ['pass', '▶', 'Tester'], ['bilan', '📊', 'Bilan'], ['cfg', '⚙️', 'Réglages']].map(([k, i, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}"><span>${i}</span>${l}</button>`).join('')}</div>
      <div id="t6b"></div>`;
    const $ = q => el.querySelector(q);
    $('#t6c').onchange = () => { cls = $('#t6c').value; DB.lastClass = cls; save(); pickLatest(); draw(); };
    $('#t6s').onchange = () => { const v = $('#t6s').value;
      if (v === '+') { const n = prompt('Nom de la nouvelle session :', sessionsOf(cls).length ? 'Fin d\'année' : 'Début d\'année'); if (n) { const old = sid; sid = newSession(n.trim() || undefined); cmpId = old; toast('Nouvelle session créée'); } draw(); return; }
      sid = v || null; const L2 = sessionsOf(cls), i = L2.findIndex(x => x.id === sid); cmpId = i > 0 ? L2[i - 1].id : (L2.find(x => x.id !== sid) || {}).id || null; draw(); };
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; draw(); });
    body();
  }
  function body() {
    const b = el.querySelector('#t6b'); if (!b) return;
    if (!students().length) { b.innerHTML = '<div class="card empty">Cette classe n\'a pas d\'élèves. Ajoutez-les dans <b>🗂 Mes classes</b>.</div>'; return; }
    ({ grid: drawGrid, pass: drawPass, bilan: drawBilan, cfg: drawCfg })[tab](b);
  }

  /* ---------- Endurance : lien avec l'outil Test VMA ---------- */
  const legerCard = () => `<div class="card" style="margin-bottom:10px"><b>🏃 Endurance — test Léger</b>
      <p class="muted" style="margin:4px 0 8px;font-size:.82rem">Faites passer le test dans l'outil <b>Test VMA</b>, enregistrez les résultats avec sa carte 💾, puis récupérez-les ici (palier + VMA).</p>
      <div class="row"><button class="btn btn-grad" data-open-vma>▶ Ouvrir le test Luc Léger</button><button class="btn btn-ghost" data-import-vma>📥 Récupérer depuis Test VMA</button></div></div>`;
  const bindLeger = box => {
    box.querySelectorAll('[data-open-vma]').forEach(b => b.onclick = openVma);
    box.querySelectorAll('[data-import-vma]').forEach(b => b.onclick = importVma);
  };
  function openVma() {
    DB.lastClass = cls; save(); window.tvPreset = 'leger'; window.tvPresetClass = cls;
    try { if (typeof cleanup === 'function') cleanup(); cleanup = null; } catch (e) {}
    openTool('testvma');
  }
  function parseVma(r) {
    const txt = `${r.valeur || ''} ${r.detail || ''}`, p = /Palier\s*(\d+)/i.exec(txt);
    let vma = null; if (!/</.test(r.valeur || '')) { const m = /(\d+(?:[.,]\d+)?)/.exec(r.valeur || ''); if (m) vma = +m[1].replace(',', '.'); }
    if (!p && vma == null) return null;
    return { palier: p ? +p[1] : null, vma };
  }
  function importVma() {
    const st = students(), found = {};
    (DB.resultats || []).filter(r => r && r.tool === 'testvma' && st.includes(r.eleve)).forEach(r => {
      const p = parseVma(r); if (!p) return; const sc = r.classe === cls ? 1 : 0, prev = found[r.eleve];
      if (!prev || sc > prev.sc || (sc === prev.sc && (r.date || 0) >= prev.date)) found[r.eleve] = { ...p, sc, date: r.date || 0 }; });
    const names = Object.keys(found);
    if (!names.length) return toast('Aucun résultat « Test VMA » enregistré pour ces élèves');
    const diff = names.filter(n => { const r = getR(n, 'leger'); return r && !r.abs && (r.palier !== found[n].palier || r.vma !== found[n].vma) && (r.palier != null || r.vma != null); });
    let keep = false; if (diff.length && !confirm(`${diff.length} élève(s) ont déjà un résultat d'endurance différent. Le remplacer par celui du Test VMA ?`)) keep = true;
    let n = 0; names.forEach(e => { if (keep && diff.includes(e)) return; const f = found[e]; setR(e, 'leger', { palier: f.palier, vma: f.vma, v: f.vma }); n++; });
    toast(`📥 ${n} résultat(s) récupéré(s) depuis Test VMA`); draw();
  }

  /* ---------- 📋 Tableau (élèves × tests) ---------- */
  function drawGrid(b) {
    const TT = t6Tests(), st = students();
    const stat = t => { const v = st.map(e => getR(e, t.id)).filter(t6Has).map(r => r.v); return v.length ? t6Fr(v.reduce((a, x) => a + x, 0) / v.length, t.dec) : '—'; };
    b.innerHTML = legerCard() + `<p class="muted" style="margin:0 2px 8px;font-size:.8rem">Touchez une case pour saisir ou corriger un résultat (absent, dispensé…).</p>
      <div class="card t6-tbl"><table><tr><th>Élève</th>${TT.map(t => `<th>${esc(t.name)}<small>${esc(t.sub)}${t.kind === 'leger' ? ' · P / VMA' : ` · ${esc(t.unit)}`}</small></th>`).join('')}</tr>
      ${st.map((e, i) => `<tr><td title="${esc(e)}">${esc(e)}</td>${TT.map(t => { const r = getR(e, t.id), v = t6Val(t, r);
        return `<td><button class="t6-cell ${r && r.abs ? 'ab' : v ? 'ok' : ''}" data-e="${i}" data-t="${t.id}">${v ? esc(v) : '—'}</button></td>`; }).join('')}</tr>`).join('')}
      <tr class="t6-foot"><td>Moyenne</td>${TT.map(t => `<td>${stat(t)}</td>`).join('')}</tr></table></div>
      ${actionsCard()}`;
    bindLeger(b); bindActions(b);
    b.querySelectorAll('.t6-cell').forEach(c => c.onclick = () => editor(+c.dataset.e, c.dataset.t));
  }

  /* Fenêtre de saisie d'une case */
  function editor(i, tid) {
    const st = students(), e = st[i], t = T(tid); if (!e || !t) return;
    const r = getR(e, tid) || {}; let abs = r.abs || '';
    const o = document.createElement('div'); o.className = 't6-ov'; document.body.appendChild(o);
    const close = () => { o.remove(); drawGrid(el.querySelector('#t6b')); };
    const inputs = t.kind === 'leger'
      ? `<div class="ess"><div><label>Palier</label><input id="t6p" inputmode="numeric" value="${r.palier ?? ''}"></div><div><label>VMA (km/h)</label><input id="t6v" inputmode="decimal" value="${t6Fr(r.vma, 1)}"></div></div>`
      : t.kind === 'essais'
        ? `<div class="ess">${Array.from({ length: t.n }, (_, k) => `<div><label>Essai ${k + 1} (${esc(t.unit)})</label><input data-k="${k}" inputmode="decimal" value="${t6Fr((r.e || [])[k], t.dec)}"></div>`).join('')}</div>`
        : `<div class="ess"><div><label>${esc(t.name)} (${esc(t.unit)})${t.max ? ` — max ${t.max} s` : ''}</label>
            <div style="display:flex;gap:6px">${t.kind === 'signed' ? '<button class="btn btn-ghost" style="flex:0 0 auto" id="t6pm" type="button">±</button>' : ''}<input id="t6x" inputmode="${t.kind === 'count' ? 'numeric' : 'decimal'}" value="${t6Fr(r.v, t.dec)}"></div></div></div>`;
    o.innerHTML = `<div class="t6-box" role="dialog"><div class="muted" style="font-size:.8rem;font-weight:700">${esc(t.name)} · ${esc(t.sub)}</div><h3>${esc(e)}</h3>
      ${inputs}<div id="t6bst" class="muted" style="margin-top:6px;font-size:.85rem"></div>
      <div class="t6-seg" style="margin-top:10px">${[['', 'Présent'], ['A', 'Absent'], ['D', 'Dispensé']].map(([k, l]) => `<button type="button" data-a="${k}" class="${abs === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="row" style="margin-top:12px"><button class="btn btn-ghost" id="t6clr">Effacer</button><button class="btn btn-ghost" id="t6ok">✓ Valider</button></div>
      ${i < st.length - 1 ? `<button class="btn btn-grad btn-block" style="margin-top:8px" id="t6nx">Valider · élève suivant ›</button>` : ''}
      <button class="btn btn-ghost btn-block" style="margin-top:8px" id="t6x0">Fermer</button></div>`;
    const $ = q => o.querySelector(q);
    const showBest = () => { if (t.kind !== 'essais') return; const e2 = [...o.querySelectorAll('[data-k]')].map(x => t6Num(x.value)), bst = t6Best(t, e2);
      $('#t6bst').innerHTML = bst != null ? `Meilleur essai retenu : <b>${t6Fr(bst, t.dec)} ${esc(t.unit)}</b>` : ''; };
    o.querySelectorAll('[data-k]').forEach(x => x.oninput = showBest); showBest();
    if ($('#t6p')) $('#t6p').oninput = () => { const p = t6Num($('#t6p').value); if (p != null && (!$('#t6v').value || $('#t6v').dataset.auto)) { $('#t6v').value = t6Fr(t6VmaFromPalier(p), 1); $('#t6v').dataset.auto = '1'; } };
    if ($('#t6v')) $('#t6v').oninput = () => { delete $('#t6v').dataset.auto; };
    if ($('#t6pm')) $('#t6pm').onclick = () => { const x = $('#t6x'); x.value = x.value.startsWith('-') ? x.value.slice(1) : '-' + x.value; };
    o.querySelectorAll('[data-a]').forEach(bt => bt.onclick = () => { abs = bt.dataset.a; o.querySelectorAll('[data-a]').forEach(y => y.classList.toggle('on', y === bt)); });
    const commit = () => {
      let nr;
      if (t.kind === 'leger') { const p = t6Num($('#t6p').value), v = t6Num($('#t6v').value); nr = p == null && v == null ? {} : { palier: p == null ? null : Math.round(p), vma: v, v }; }
      else if (t.kind === 'essais') { const e2 = [...o.querySelectorAll('[data-k]')].map(x => t6Num(x.value)); nr = e2.some(x => x != null) ? { e: e2, v: t6Best(t, e2) } : {}; }
      else { let v = t6Num($('#t6x').value); if (v != null && t.max) v = Math.min(v, t.max); if (v != null && t.kind === 'count') v = Math.max(0, Math.round(v)); nr = v == null ? {} : { v }; }
      if (abs) nr.abs = abs;
      setR(e, tid, Object.keys(nr).length ? nr : null);
    };
    $('#t6clr').onclick = () => { if (!confirm('Effacer ce résultat ?')) return; setR(e, tid, null); close(); };
    $('#t6ok').onclick = () => { commit(); close(); };
    $('#t6x0').onclick = () => { o.remove(); };
    if ($('#t6nx')) $('#t6nx').onclick = () => { commit(); o.remove(); drawGrid(el.querySelector('#t6b')); editor(i + 1, tid); };
    o.onclick = ev => { if (ev.target === o) o.remove(); };
    o.querySelectorAll('input').forEach((x, k, all) => x.onkeydown = ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); if (all[k + 1]) all[k + 1].focus(); else ($('#t6nx') || $('#t6ok')).click(); });
    const f = o.querySelector('input'); if (f && matchMedia('(pointer:fine)').matches) f.focus();
  }

  /* ---------- ▶ Passer un test ---------- */
  const stBtn = (e, tid) => { const r = getR(e, tid), a = r && r.abs || ''; return `<button class="t6-st ${a}" data-st="${esc(e)}" data-tid="${tid}" title="Présent / Absent / Dispensé">${a === 'A' ? 'Abs.' : a === 'D' ? 'Disp.' : 'A / D'}</button>`; };
  function cycleAbs(e, tid) { const r = { ...(getR(e, tid) || {}) }; r.abs = !r.abs ? 'A' : r.abs === 'A' ? 'D' : ''; if (!r.abs) delete r.abs; setR(e, tid, Object.keys(r).length ? r : null); }
  function drawPass(b) {
    const TT = t6Tests(); if (!TT.find(t => t.id === passId)) passId = 'saut';
    const t = T(passId), st = students().filter(e => !hideDone || !(getR(e, passId) && (t6Has(getR(e, passId)) || getR(e, passId).abs) && !live[passId + '|' + e]));
    const nDone = students().filter(e => { const r = getR(e, passId); return r && (t6Has(r) || r.abs); }).length;
    b.innerHTML = `<div class="t6-chips">${TT.map(x => `<button data-p="${x.id}" class="${x.id === passId ? 'on' : ''}">${esc(x.name)}<small>${esc(x.sub)}</small></button>`).join('')}</div>
      <div class="card" style="margin-top:8px"><p class="t6-help">${t.help}${t.max && t.kind === 'chrono' ? ` <b>Durée max : ${t.max} s</b> (arrêt automatique).` : ''}${t.kind === 'essais' ? ` <b>${t.n} essai${t.n > 1 ? 's' : ''}.</b>` : ''}</p></div>
      ${t.kind === 'leger' ? '<div style="margin-top:10px"></div>' + legerCard() : ''}
      ${t.kind === 'count' ? `<div class="t6-timer" id="t6tm" style="margin-top:10px"><span id="t6tl">Prêt</span><b id="t6tv">${t.max}</b>
          <div class="row" style="margin-top:6px"><button class="btn" style="background:rgba(255,255,255,.22);color:#fff" id="t6go">▶ Lancer les ${t.max} s</button><button class="btn" style="background:rgba(255,255,255,.22);color:#fff" id="t6stop">⏹ Stop</button></div></div>` : ''}
      <div class="section-title" style="margin-top:14px"><h2>${esc(t.name)} · ${nDone}/${students().length}</h2>
        <label style="display:flex;gap:6px;align-items:center;font-size:.8rem;font-weight:700;color:var(--muted)"><input type="checkbox" id="t6hd" style="width:auto" ${hideDone ? 'checked' : ''}> Masquer les élèves testés</label></div>
      ${t.kind === 'chrono' ? `<div class="row" style="margin-bottom:4px"><button class="btn btn-ghost" id="t6all">⏹ Arrêter tous les chronos</button></div><p class="muted" style="margin:0 2px;font-size:.78rem">Jusqu'à 6 chronos en même temps.</p>` : ''}
      <div id="t6pl"></div>`;
    const pl = b.querySelector('#t6pl');
    if (!st.length) pl.innerHTML = '<div class="card empty">Tous les élèves ont été testés 👍</div>';
    else if (t.kind === 'chrono' || t.kind === 'count') pl.innerHTML = `<div class="t6-grid">${st.map(e => t.kind === 'chrono' ? chronoCard(t, e) : countCard(t, e)).join('')}</div>`;
    else pl.innerHTML = `<div class="card" style="padding:0">${st.map(e => passRow(t, e)).join('')}</div>`;
    b.querySelectorAll('[data-p]').forEach(x => x.onclick = () => { passId = x.dataset.p; drawPass(b); });
    b.querySelector('#t6hd').onchange = ev => { hideDone = ev.target.checked; drawPass(b); };
    b.querySelectorAll('[data-st]').forEach(x => x.onclick = () => { cycleAbs(x.dataset.st, x.dataset.tid); drawPass(b); });
    bindLeger(b);
    // Saisies (distances, temps, palier…)
    b.querySelectorAll('[data-in]').forEach(x => {
      x.onchange = () => writeInput(t, x.dataset.in, b);
      x.onkeydown = ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); x.blur(); const all = [...b.querySelectorAll('[data-in]')], k = all.indexOf(x); if (all[k + 1]) all[k + 1].focus(); };
    });
    b.querySelectorAll('[data-pal]').forEach(x => x.oninput = () => { const v = b.querySelector(`[data-in="${CSS.escape(x.dataset.pal)}"][data-f="vma"]`), p = t6Num(x.value);
      if (v && p != null && (!v.value || v.dataset.auto)) { v.value = t6Fr(t6VmaFromPalier(p), 1); v.dataset.auto = '1'; } });
    b.querySelectorAll('[data-f="vma"]').forEach(x => x.addEventListener('input', () => delete x.dataset.auto));
    b.querySelectorAll('[data-pm]').forEach(x => x.onclick = () => { const i = b.querySelector(`[data-in="${CSS.escape(x.dataset.pm)}"]`); i.value = i.value.startsWith('-') ? i.value.slice(1) : '-' + i.value; writeInput(t, x.dataset.pm, b); });
    // Chronos
    b.querySelectorAll('[data-go]').forEach(x => x.onclick = () => toggleChrono(t, x.dataset.go, b));
    b.querySelectorAll('[data-rz]').forEach(x => x.onclick = () => { const e = x.dataset.rz; if (live[t.id + '|' + e]) delete live[t.id + '|' + e];
      const r = getR(e, t.id); if (r && r.v != null && !confirm(`Remettre à zéro ${e} ?`)) return; setR(e, t.id, r && r.abs ? { abs: r.abs } : null); drawPass(b); });
    const all = b.querySelector('#t6all'); if (all) all.onclick = () => { Object.keys(live).filter(k => k.startsWith(t.id + '|')).forEach(k => stopChrono(T(t.id), k.split('|').slice(1).join('|'), false)); drawPass(b); };
    // Coordination
    b.querySelectorAll('[data-plus]').forEach(x => x.onclick = () => bump(t, x.dataset.plus, 1, b));
    b.querySelectorAll('[data-minus]').forEach(x => x.onclick = () => bump(t, x.dataset.minus, -1, b));
    if (b.querySelector('#t6go')) { b.querySelector('#t6go').onclick = startCoord; b.querySelector('#t6stop').onclick = () => { if (!coord) return; clearTimeout(preT); preT = null; coord = { end: true }; beep(500, .5); paintLive(); }; }
    paintLive();
  }
  function passRow(t, e) {
    const r = getR(e, t.id) || {}, cl = r.abs ? 't6ab' : t6Has(r) ? 't6ok' : '', k = esc(e);
    let ins = '';
    if (t.kind === 'leger') ins = `<input data-in="${k}" data-f="palier" data-pal="${k}" inputmode="numeric" placeholder="Palier" value="${r.palier ?? ''}"><input data-in="${k}" data-f="vma" inputmode="decimal" placeholder="VMA" value="${t6Fr(r.vma, 1)}">`;
    else if (t.kind === 'essais') ins = Array.from({ length: t.n }, (_, j) => `<input data-in="${k}" data-f="${j}" inputmode="decimal" placeholder="Essai ${j + 1}" value="${t6Fr((r.e || [])[j], t.dec)}">`).join('')
      + (t.chrono ? `<button class="t6-ch ${live[t.id + '|' + e] ? 't6on' : ''}" data-go="${k}" data-lt="${esc(t.id + '|' + e)}">${live[t.id + '|' + e] ? '⏹ ' + t6Fr(0, 2) : '⏱ Départ'}</button>` : '');
    else ins = `${t.kind === 'signed' ? `<button class="t6-st" data-pm="${k}" title="Changer le signe">±</button>` : ''}<input data-in="${k}" data-f="v" inputmode="${t.kind === 'count' ? 'numeric' : 'decimal'}" placeholder="${esc(t.unit)}" value="${t6Fr(r.v, t.dec)}">`;
    return `<div class="t6-row ${cl}"><span class="nm">${k}</span><span class="ins">${ins}</span><span class="best" data-best="${k}">${t.kind === 'leger' ? '' : t6Has(r) ? `${t6Fr(r.v, t.dec)} ${esc(t.unit)}` : ''}</span>${stBtn(e, t.id)}</div>`;
  }
  function writeInput(t, e, b) {
    const q = f => b.querySelector(`[data-in="${CSS.escape(e)}"][data-f="${f}"]`), old = getR(e, t.id) || {}, abs = old.abs;
    let nr;
    if (t.kind === 'leger') { const p = t6Num(q('palier').value), v = t6Num(q('vma').value); nr = p == null && v == null ? {} : { palier: p == null ? null : Math.round(p), vma: v, v }; }
    else if (t.kind === 'essais') { const e2 = Array.from({ length: t.n }, (_, j) => t6Num(q(j).value)); nr = e2.some(x => x != null) ? { e: e2, v: t6Best(t, e2) } : {}; }
    else { let v = t6Num(q('v').value); if (v != null && t.max && t.kind === 'chrono') v = Math.min(v, t.max); nr = v == null ? {} : { v }; }
    if (abs) nr.abs = abs;
    setR(e, t.id, Object.keys(nr).length ? nr : null);
    const bs = b.querySelector(`[data-best="${CSS.escape(e)}"]`), r = getR(e, t.id);
    if (bs && t.kind !== 'leger') bs.textContent = t6Has(r) ? `${t6Fr(r.v, t.dec)} ${t.unit}` : '';
    const row = bs && bs.closest('.t6-row'); if (row) row.classList.toggle('t6ok', t6Has(r));
  }
  function chronoCard(t, e) {
    const k = t.id + '|' + e, L = live[k], r = getR(e, t.id) || {}, cl = L ? 't6on' : r.abs ? 't6ab' : t6Has(r) ? 't6ok' : '';
    return `<div class="t6-c ${cl}"><div class="nm">${esc(e)}</div><div class="big"><span data-lt="${esc(k)}">${t6Fr(L ? 0 : r.v ?? 0, 1)}</span> <small>s</small></div>
      <div class="bar"><i data-lb="${esc(k)}" style="width:${L ? 0 : Math.min(100, (r.v || 0) / t.max * 100)}%"></i></div><div class="flag">${!L && r.v >= t.max ? `Max ${t.max} s atteint ✔` : ''}</div>
      <button class="btn ${L ? 'btn-grad' : 'btn-ghost'} go" data-go="${esc(e)}">${L ? '⏹ Stop' : '▶ Départ'}</button>
      <div class="sub"><input data-in="${esc(e)}" data-f="v" inputmode="decimal" placeholder="saisir s" value="${L ? '' : t6Fr(r.v, 1)}"><button data-rz="${esc(e)}" title="Remettre à zéro">↺</button>${stBtn(e, t.id)}</div></div>`;
  }
  function countCard(t, e) {
    const r = getR(e, t.id) || {}, cl = r.abs ? 't6ab' : t6Has(r) ? 't6ok' : '';
    return `<div class="t6-c ${cl}"><div class="nm">${esc(e)}</div><div class="big">${r.v ?? 0} <small>${esc(t.unit)}</small></div>
      <button class="btn btn-grad plus" data-plus="${esc(e)}">+1</button>
      <div class="sub"><button data-minus="${esc(e)}">−1</button><input data-in="${esc(e)}" data-f="v" inputmode="numeric" placeholder="nb" value="${r.v ?? ''}"><button data-rz="${esc(e)}" title="Remettre à zéro">↺</button>${stBtn(e, t.id)}</div></div>`;
  }
  function bump(t, e, d, b) {
    const r = { ...(getR(e, t.id) || {}) }; r.v = Math.max(0, (r.v || 0) + d); setR(e, t.id, r);
    const card = b.querySelector(`[data-plus="${CSS.escape(e)}"]`).closest('.t6-c');
    card.querySelector('.big').innerHTML = `${r.v} <small>${esc(t.unit)}</small>`; card.querySelector('[data-in]').value = r.v; card.classList.add('t6ok');
    if (d > 0) beep(1200, .04, .2);
  }
  function toggleChrono(t, e, b) {
    const k = t.id + '|' + e;
    if (live[k]) { stopChrono(t, e, false); drawPass(b); return; }
    const r = getR(e, t.id) || {};
    if (t.kind === 'essais') { const e2 = r.e || []; if (Array.from({ length: t.n }, (_, j) => e2[j]).every(x => x != null)) return toast(`${e} : les ${t.n} essais sont déjà saisis`); }
    else if (r.v != null && !confirm(`${e} a déjà ${t6Fr(r.v, 1)} s. Recommencer ?`)) return;
    if (Object.keys(live).filter(x => x.startsWith(t.id + '|')).length >= 6) return toast('6 chronos maximum en même temps');
    live[k] = { t0: performance.now(), sid: ensure().id }; beep(1300, .12); tickOn(); drawPass(b);
  }
  function stopChrono(t, e, auto) {
    const k = t.id + '|' + e, L = live[k]; if (!L) return; delete live[k];
    const ms = performance.now() - L.t0, s = L.sid, old = (getR(e, t.id, t6DB().sessions[s]) || {});
    if (t.kind === 'essais') { const e2 = Array.from({ length: t.n }, (_, j) => (old.e || [])[j] ?? null), j = e2.findIndex(x => x == null); e2[j < 0 ? t.n - 1 : j] = Math.round(ms / 10) / 100;
      setR(e, t.id, { ...old, e: e2, v: t6Best(t, e2) }, s); beep(900, .1); }
    else { const v = auto ? t.max : Math.min(t.max, Math.round(ms / 100) / 10); setR(e, t.id, { ...old, v }, s); beep(auto ? 1300 : 900, auto ? .6 : .12); if (auto) toast(`${e} : ${t.max} s atteint ✔`); }
  }
  function startCoord() {
    if (coord && (coord.t0 || coord.pre)) return;
    const t = T('coordination'); let n = 3; coord = { pre: true };
    const step = () => { const l = el.querySelector('#t6tl'), v = el.querySelector('#t6tv'); if (!coord || !coord.pre) return;
      if (n > 0) { if (l) l.textContent = 'Départ dans…'; if (v) v.textContent = n; beep(660, .12); n--; preT = setTimeout(step, 1000); }
      else { preT = null; coord = { t0: performance.now(), last: t.max }; beep(1300, .45); tickOn(); paintLive(); } };
    step();
  }
  function tickOn() { if (!iv) iv = setInterval(tick, 50); }
  function tick() {
    const now = performance.now();
    Object.keys(live).forEach(k => { const [tid, ...rest] = k.split('|'), t = T(tid);
      if (t && t.kind === 'chrono' && now - live[k].t0 >= t.max * 1000) { stopChrono(t, rest.join('|'), true); if (tab === 'pass' && passId === tid) drawPass(el.querySelector('#t6b')); } });
    if (coord && coord.t0) { const t = T('coordination'), left = Math.ceil((t.max * 1000 - (now - coord.t0)) / 1000);
      if (left !== coord.last) { coord.last = left; if (left <= 3 && left > 0) beep(660, .1); if (left === 10) beep(880, .08); }
      if (left <= 0) { coord = { end: true }; beep(1300, .8); } }
    paintLive();
    if (!Object.keys(live).length && !(coord && coord.t0)) { clearInterval(iv); iv = null; }
  }
  function paintLive() {
    const now = performance.now();
    el.querySelectorAll('[data-lt]').forEach(x => { const L = live[x.dataset.lt]; if (!L) return; const s = (now - L.t0) / 1000;
      x.textContent = x.tagName === 'BUTTON' ? '⏹ ' + t6Fr(s, 2) + ' s' : t6Fr(Math.floor(s * 10) / 10, 1); });
    el.querySelectorAll('[data-lb]').forEach(x => { const L = live[x.dataset.lb]; if (!L) return; const t = T(x.dataset.lb.split('|')[0]); x.style.width = Math.min(100, (now - L.t0) / 10 / t.max) + '%'; });
    const tm = el.querySelector('#t6tm'); if (tm && coord && !coord.pre) { const t = T('coordination');
      if (coord.t0) { tm.className = 't6-timer t6on'; el.querySelector('#t6tl').textContent = 'Lancez !'; el.querySelector('#t6tv').textContent = Math.max(0, Math.ceil((t.max * 1000 - (now - coord.t0)) / 1000)); }
      else if (coord.end) { tm.className = 't6-timer t6end'; el.querySelector('#t6tl').textContent = 'Temps écoulé — comptes enregistrés'; el.querySelector('#t6tv').textContent = '0'; } }
  }

  /* ---------- 📊 Bilan ---------- */
  function statsOf(t, s) { const v = students().map(e => getR(e, t.id, s)).filter(t6Has).map(r => r.v); const ab = students().filter(e => (getR(e, t.id, s) || {}).abs).length;
    const pal = t.kind === 'leger' ? students().map(e => getR(e, t.id, s)).filter(r => r && !r.abs && r.palier != null).map(r => r.palier) : [];
    return v.length ? { n: v.length, moy: v.reduce((a, x) => a + x, 0) / v.length, min: Math.min(...v), max: Math.max(...v), ab, pal: pal.length ? pal.reduce((a, x) => a + x, 0) / pal.length : null } : { n: 0, ab }; }
  const delta = (t, a, b) => { if (a == null || b == null) return ''; const d = a - b, good = t.hb ? d > 0 : d < 0, eq = Math.abs(d) < 1e-9;
    return `<span class="${eq ? 't6-eq' : good ? 't6-up' : 't6-down'}">${eq ? '=' : (d > 0 ? '+' : '−') + t6Fr(Math.abs(d), t.dec)}</span>`; };
  function drawBilan(b) {
    const TT = t6Tests(), s = cur(), L = sessionsOf(cls).filter(x => x.id !== sid), c = cmpId && t6DB().sessions[cmpId] && cmpId !== sid ? t6DB().sessions[cmpId] : null, st = students();
    if (!s) { b.innerHTML = '<div class="card empty">Aucun résultat pour cette classe. Commencez par 📋 Tableau ou ▶ Passer un test.</div>'; return; }
    if (who && !st.includes(who)) who = '';
    b.innerHTML = `<div class="section-title" style="margin-top:4px"><h2>Classe ${esc(cls)} — ${esc(s.nom || '')} (${t6Date(s.date)})</h2></div>
      <div class="card t6-tbl"><table><tr><th>Test</th><th>Élèves</th><th>Moyenne</th><th>Min</th><th>Max</th><th>Abs./Disp.</th>${c ? '<th>Moy. avant</th><th>Évol.</th>' : ''}</tr>
        ${TT.map(t => { const S = statsOf(t, s), C = c ? statsOf(t, c) : null; return `<tr><td>${esc(t.name)}<br><small class="muted">${esc(t.sub)} (${esc(t.unit)})</small></td><td>${S.n}</td>
          <td><b>${S.n ? t6Fr(S.moy, t.dec) : '—'}</b>${S.pal != null ? `<br><small class="muted">palier moy. ${t6Fr(S.pal, 1)}</small>` : ''}</td><td>${S.n ? t6Fr(S.min, t.dec) : '—'}</td><td>${S.n ? t6Fr(S.max, t.dec) : '—'}</td><td>${S.ab || ''}</td>
          ${c ? `<td>${C.n ? t6Fr(C.moy, t.dec) : '—'}</td><td>${S.n && C.n ? delta(t, S.moy, C.moy) : ''}</td>` : ''}</tr>`; }).join('')}</table></div>
      <div class="section-title"><h2>📈 Progression</h2></div>
      <div class="card">${L.length ? `<label style="margin-top:0">Comparer avec la session</label><select id="t6cmp"><option value="">—</option>${L.map(x => `<option value="${x.id}" ${c && x.id === c.id ? 'selected' : ''}>${esc(x.nom || 'Session')} — ${t6Date(x.date)}</option>`).join('')}</select>`
        : '<p class="muted" style="margin:0;font-size:.85rem">Créez une 2e session (menu « Session de tests » → ＋ Nouvelle session, ex. fin d\'année) pour comparer et voir la progression de chaque élève.</p>'}</div>
      ${c ? `<div class="card t6-tbl" style="margin-top:10px"><table><tr><th>Élève</th>${TT.map(t => `<th>${esc(t.name)}<small>${esc(t.unit)}</small></th>`).join('')}</tr>
        ${st.map(e => `<tr><td title="${esc(e)}">${esc(e)}</td>${TT.map(t => { const a = getR(e, t.id, s), p = getR(e, t.id, c);
          return `<td style="white-space:nowrap;font-size:.82rem">${t6Val(t, p) || '—'} → <b>${t6Val(t, a) || '—'}</b> ${t6Has(a) && t6Has(p) ? delta(t, a.v, p.v) : ''}</td>`; }).join('')}</tr>`).join('')}</table></div>
        <p class="muted" style="margin:6px 2px 0;font-size:.76rem">Vert = progrès (plus loin, plus longtemps, plus de lancers ; temps plus court au 30 m).</p>` : ''}
      <div class="section-title"><h2>👤 Fiche élève</h2></div>
      <div class="card"><select id="t6who"><option value="">Choisir un élève…</option>${st.map(e => `<option ${e === who ? 'selected' : ''}>${esc(e)}</option>`).join('')}</select>
        ${who ? `<div style="margin-top:8px">${TT.map(t => { const a = getR(who, t.id, s), p = c && getR(who, t.id, c), S = statsOf(t, s);
          return `<div class="t6-kv"><span><b>${esc(t.name)}</b><br><small class="muted">${esc(t.sub)}${t.kind === 'essais' && a && a.e ? ' · essais ' + a.e.map(x => t6Fr(x, t.dec) || '—').join(' / ') : ''}</small></span>
            <span style="text-align:right"><b>${esc(t6Long(t, a) || '—')}</b>${p ? `<br><small class="muted">avant : ${esc(t6Long(t, p) || '—')}</small> ${t6Has(a) && t6Has(p) ? delta(t, a.v, p.v) : ''}` : ''}${S.n && t6Has(a) ? `<br><small class="muted">moy. classe ${t6Fr(S.moy, t.dec)}</small>` : ''}</span></div>`; }).join('')}</div>` : ''}</div>
      ${actionsCard()}`;
    const cm = b.querySelector('#t6cmp'); if (cm) cm.onchange = () => { cmpId = cm.value || null; drawBilan(b); };
    b.querySelector('#t6who').onchange = ev => { who = ev.target.value; drawBilan(b); };
    bindActions(b);
  }

  /* ---------- Export CSV / Résultats des élèves ---------- */
  const actionsCard = () => `<div class="card" style="margin-top:12px"><div class="row"><button class="btn btn-ghost" data-csv>⬇️ Exporter CSV</button><button class="btn btn-grad" data-send>📤 Envoyer dans Résultats des élèves</button></div></div>`;
  function bindActions(b) {
    b.querySelectorAll('[data-csv]').forEach(x => x.onclick = exportCsv);
    b.querySelectorAll('[data-send]').forEach(x => x.onclick = sendResults);
  }
  function exportCsv() {
    const s = cur(), TT = t6Tests(), st = students(); if (!s) return toast('Aucun résultat à exporter');
    const head = ['Élève']; TT.forEach(t => { if (t.kind === 'leger') head.push('Endurance – palier', 'Endurance – VMA (km/h)');
      else { if (t.kind === 'essais') for (let j = 0; j < t.n; j++) head.push(`${t.name} – essai ${j + 1} (${t.unit})`); head.push(`${t.name} – ${t.sub} (${t.unit})${t.kind === 'essais' ? ' meilleur' : ''}`); } });
    const cellsOf = e => { const row = [e]; TT.forEach(t => { const r = getR(e, t.id), ab = r && r.abs ? (r.abs === 'D' ? 'DISP' : 'ABS') : null;
      if (t.kind === 'leger') row.push(ab || (r && r.palier != null ? r.palier : ''), ab || (r ? t6Fr(r.vma, 1) : ''));
      else { if (t.kind === 'essais') for (let j = 0; j < t.n; j++) row.push(ab || (r && r.e ? t6Fr(r.e[j], t.dec) : '')); row.push(ab || (r ? t6Fr(r.v, t.dec) : '')); } }); return row; };
    const agg = (lab, f) => { const row = [lab]; TT.forEach(t => { const S = statsOf(t, s);
      if (t.kind === 'leger') row.push(lab === 'Moyenne' && S.pal != null ? t6Fr(S.pal, 1) : '', S.n ? t6Fr(f(S), 1) : '');
      else { if (t.kind === 'essais') for (let j = 0; j < t.n; j++) row.push(''); row.push(S.n ? t6Fr(f(S), t.dec) : ''); } }); return row; };
    const rows = [[`Tests 6e — ${cls} — ${s.nom || ''} — ${t6Date(s.date)}`], head, ...st.map(cellsOf), [],
      agg('Moyenne', S => S.moy), agg('Min', S => S.min), agg('Max', S => S.max)];
    download(`tests-6e-${cls}-${s.date}.csv`.replace(/[^\w.-]+/g, '-'), csv(rows)); toast('CSV exporté');
  }
  function sendResults() {
    const s = cur(), TT = t6Tests(); if (!s) return toast('Aucun résultat à envoyer');
    let n = 0, maj = 0;
    students().forEach(e => TT.forEach(t => { const r = getR(e, t.id); if (!r || (!r.abs && r.v == null && !(t.kind === 'leger' && r.palier != null))) return;
      const det = [t.sub, t.kind === 'essais' && r.e && !r.abs ? 'essais ' + r.e.map(x => t6Fr(x, t.dec) || '—').join(' / ') : '', `${s.nom || 'session'} du ${t6Date(s.date)}`].filter(Boolean).join(' · ');
      const res = saveResult({ key: `test6e|${cls}|${e}|${t.id}`, tool: 'test6e', label: `Tests 6e — ${t.name}`, classe: cls, eleve: e, valeur: `${t.name} : ${t6Long(t, r)}`, detail: det });
      n++; if (res === 'maj') maj++; }));
    toast(n ? `📤 ${n} résultat(s) envoyé(s)${maj ? ` (${maj} mis à jour)` : ''}` : 'Aucun résultat à envoyer');
  }

  /* ---------- ⚙️ Réglages (verrouillés par le code enseignant) ---------- */
  function drawCfg(b) {
    const c = t6Cfg(), TT = t6Tests(true), L = sessionsOf(cls), raw = t6DB().cfg;
    b.innerHTML = `<div data-cfg>
      <div class="card"><b>Tests optionnels utilisés</b><p class="muted" style="margin:2px 0 6px;font-size:.8rem">Endurance, force et vitesse sont obligatoires.</p>
        ${T6_OPT.map(id => { const t = TT.find(x => x.id === id); return `<label style="display:flex;gap:10px;align-items:center;margin:8px 0;cursor:pointer"><input type="checkbox" data-opt="${id}" ${c.opt[id] ? 'checked' : ''} style="width:auto"> <span><b>${esc(t.name)}</b> <span class="muted">— ${esc(t.sub)}</span></span></label>`; }).join('')}</div>
      <div class="card" style="margin-top:10px"><b>Nombre d'essais (meilleur retenu)</b>
        <label>Force — saut pieds joints</label><div class="t6-seg">${[2, 3].map(n => `<button data-ess="saut" data-n="${n}" class="${c.essais.saut === n ? 'on' : ''}">${n} essais</button>`).join('')}</div>
        <label>Vitesse — 30 m</label><div class="t6-seg">${[1, 2, 3].map(n => `<button data-ess="vitesse" data-n="${n}" class="${c.essais.vitesse === n ? 'on' : ''}">${n} essai${n > 1 ? 's' : ''}</button>`).join('')}</div></div>
      <div class="card" style="margin-top:10px"><b>Durées</b><div class="row">
        <div><label>Équilibre — max (s)</label><input type="number" inputmode="numeric" data-max="equilibre" value="${c.max.equilibre}"></div>
        <div><label>Chaise — max (s)</label><input type="number" inputmode="numeric" data-max="chaise" value="${c.max.chaise}"></div>
        <div><label>Coordination — durée (s)</label><input type="number" inputmode="numeric" data-max="coordination" value="${c.max.coordination}"></div></div></div>
      <div class="card" style="margin-top:10px"><b>Intitulés des tests</b><p class="muted" style="margin:2px 0 0;font-size:.8rem">Pour la souplesse, adaptez aussi l'unité et le sens si votre test est différent.</p>
        ${TT.map(t => `<div style="margin-top:10px"><div class="muted" style="font-size:.72rem;font-weight:800;text-transform:uppercase">${esc(T6_BASE.find(x => x.id === t.id).name)}</div><div class="t6-lbl">
          <input data-lbl="${t.id}" data-f="name" value="${esc(t.name)}" aria-label="Nom"><input data-lbl="${t.id}" data-f="sub" value="${esc(t.sub)}" aria-label="Détail"></div>
          ${t.id === 'souplesse' ? `<div class="t6-lbl"><div><label>Unité</label><input data-lbl="souplesse" data-f="unit" value="${esc(t.unit)}"></div><div><label>Meilleur résultat</label><select id="t6hb"><option value="1" ${c.souplesseHb ? 'selected' : ''}>le plus grand</option><option value="0" ${c.souplesseHb ? '' : 'selected'}>le plus petit</option></select></div></div>` : ''}</div>`).join('')}
        ${Object.keys(raw.lbl || {}).length ? '<button class="btn btn-ghost btn-block" style="margin-top:10px" id="t6lr">↺ Intitulés d\'origine</button>' : ''}</div>
      <div class="card" style="margin-top:10px"><b>Sessions de la classe ${esc(cls)}</b>
        ${L.length ? L.map(x => `<div class="t6-lbl" style="grid-template-columns:1fr 150px auto;align-items:center;margin-top:8px"><input data-sn="${x.id}" value="${esc(x.nom || '')}" aria-label="Nom de la session"><input type="date" data-sd="${x.id}" value="${x.date || ''}"><button class="btn btn-ghost" style="padding:10px" data-sx="${x.id}" title="Supprimer">🗑</button></div>`).join('')
          : '<p class="muted" style="margin:6px 0 0">Aucune session pour l\'instant.</p>'}</div></div>`;
    const set = (k, v) => { const r = t6DB().cfg; r[k] = v; save(); };
    b.querySelectorAll('[data-opt]').forEach(x => x.onchange = () => { set('opt', { ...(raw.opt || {}), [x.dataset.opt]: x.checked }); });
    b.querySelectorAll('[data-ess]').forEach(x => x.onclick = () => { set('essais', { ...(raw.essais || {}), [x.dataset.ess]: +x.dataset.n }); drawCfg(b); });
    b.querySelectorAll('[data-max]').forEach(x => x.onchange = () => { const v = Math.round(t6Num(x.value)); if (!(v > 0)) { x.value = c.max[x.dataset.max]; return; } set('max', { ...(raw.max || {}), [x.dataset.max]: v }); });
    b.querySelectorAll('[data-lbl]').forEach(x => x.onchange = () => { const L2 = { ...(raw.lbl || {}) }, id = x.dataset.lbl, v = x.value.trim(); L2[id] = { ...(L2[id] || {}) };
      if (v && v !== T6_BASE.find(y => y.id === id)[x.dataset.f]) L2[id][x.dataset.f] = v; else delete L2[id][x.dataset.f]; if (!Object.keys(L2[id]).length) delete L2[id]; set('lbl', L2); });
    const hb = b.querySelector('#t6hb'); if (hb) hb.onchange = () => set('souplesseHb', hb.value === '1');
    const lr = b.querySelector('#t6lr'); if (lr) lr.onclick = () => { set('lbl', {}); set('souplesseHb', true); drawCfg(b); };
    b.querySelectorAll('[data-sn]').forEach(x => x.onchange = () => { const s = t6DB().sessions[x.dataset.sn]; if (s) { s.nom = x.value.trim() || 'Session'; save(); } });
    b.querySelectorAll('[data-sd]').forEach(x => x.onchange = () => { const s = t6DB().sessions[x.dataset.sd]; if (s && x.value) { s.date = x.value; save(); } });
    b.querySelectorAll('[data-sx]').forEach(x => x.onclick = () => { const s = t6DB().sessions[x.dataset.sx]; if (!s) return;
      if (!confirm(`Supprimer la session « ${s.nom} » du ${t6Date(s.date)} et tous ses résultats ?`)) return;
      delete t6DB().sessions[x.dataset.sx]; save(); if (sid === x.dataset.sx) pickLatest(); if (cmpId === x.dataset.sx) cmpId = null; toast('Session supprimée'); draw(); });
  }

  draw();
  return () => { clearInterval(iv); iv = null; clearTimeout(preT); Object.keys(live).forEach(k => delete live[k]); coord = null; };
};
