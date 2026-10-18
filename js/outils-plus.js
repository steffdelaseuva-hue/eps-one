/* =========================================================
   MES OUTILS EPS — outils complémentaires (v0.2)
   Chargé après le script principal : complète TOOL_IMPL.
   ========================================================= */

/* ---------- Données supplémentaires ---------- */
DB.dispenses = DB.dispenses || [];
DB.oublis    = DB.oublis    || {};
DB.journal   = DB.journal   || [];
DB.grilles   = DB.grilles   || [];
DB.suivi     = DB.suivi     || {};
DB.debrief   = DB.debrief   || [];
DB.relais    = DB.relais    || { courses: [] }; // courses de relais enregistrées (synchronisées ; la course en cours reste en mémoire)

/* ---------- Styles propres à ces outils ---------- */
document.head.insertAdjacentHTML('beforeend', `<style>
.screen .body.flush{padding:0;max-width:none;display:flex;flex-direction:column}
.chronos-bar{display:flex;gap:8px;align-items:center;padding:8px 10px;background:var(--card);border-bottom:1px solid var(--line);flex-wrap:wrap}
.chronos-bar select{flex:1;min-width:140px;padding:8px}
.chronos-bar .btn{padding:9px 12px;font-size:.85rem}
.chronos-frame{flex:1;border:0;width:100%;background:var(--bg)}
.cam-wrap{position:relative;background:#000;border-radius:16px;overflow:hidden;aspect-ratio:16/9;display:grid;place-items:center}
.cam-wrap canvas{width:100%;height:100%;object-fit:contain;display:block}
.cam-overlay{position:absolute;left:10px;top:10px;background:rgba(0,0,0,.6);color:#fff;padding:6px 10px;border-radius:10px;font-weight:800;font-variant-numeric:tabular-nums}
.cam-msg{position:absolute;inset:0;display:grid;place-items:center;color:#fff;text-align:center;padding:20px;font-weight:700}
input[type=range]{padding:0;border:none;background:none;accent-color:var(--blue)}
.bracket{display:flex;gap:18px;overflow-x:auto;padding:6px 2px 14px}
.round{min-width:170px;display:flex;flex-direction:column;justify-content:space-around;gap:12px}
.round h4{margin:0 0 4px;font-size:.75rem;text-transform:uppercase;letter-spacing:1px;color:var(--muted);text-align:center}
.match{background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;box-shadow:var(--shadow)}
.match button{display:block;width:100%;text-align:left;padding:9px 10px;font-weight:700;font-size:.88rem;border-bottom:1px solid var(--line)}
.match button:last-child{border-bottom:none}
.match button.win{background:var(--grad);color:#fff}
.match button.lose{opacity:.45;text-decoration:line-through}
.match button:disabled{color:var(--muted);font-weight:500;font-style:italic}
.champion{text-align:center;font-size:1.4rem;font-weight:900;padding:16px;border-radius:16px;background:var(--grad);color:#fff;margin-top:8px}
.pyr{display:flex;flex-direction:column;align-items:center;gap:8px;margin:14px 0}
.pyr-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.pyr-cell{min-width:92px;padding:9px 10px;border-radius:12px;background:var(--card);border:1.5px solid var(--line);text-align:center;font-weight:700;font-size:.85rem;box-shadow:var(--shadow)}
.pyr-cell small{display:block;color:var(--muted);font-size:.7rem}
.pyr-row:first-child .pyr-cell{background:var(--grad);color:#fff;border-color:transparent}
.pyr-row:first-child .pyr-cell small{color:#fff}
.relay-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin-top:12px}
.relay{padding:12px;border-radius:16px;background:var(--card);border:2px solid var(--line);text-align:center}
.relay.done{border-color:var(--gold);background:var(--grad-soft)}
.relay .t{font-size:1.8rem;font-weight:900;font-variant-numeric:tabular-nums}
.relay .legs{font-size:.78rem;color:var(--muted);min-height:1.2em}
.relay .rk{font-size:1.1rem;font-weight:900;color:var(--gold)}
.lvl{display:flex;gap:6px;margin-top:6px}
.lvl button{flex:1;padding:9px 4px;border-radius:10px;border:1.5px solid var(--line);font-size:.75rem;font-weight:800;background:var(--card)}
.lvl button.on{background:var(--grad);color:#fff;border-color:transparent}
.crit{padding:10px 0;border-bottom:1px solid var(--line)}
.crit:last-child{border-bottom:none}
.pill{display:inline-block;padding:3px 9px;border-radius:99px;font-size:.72rem;font-weight:800;background:var(--grad-soft);border:1px solid var(--line)}
.pill.warn{background:rgba(214,69,69,.12);color:var(--danger);border-color:rgba(214,69,69,.3)}
.pill.ok{background:rgba(27,158,90,.12);color:var(--ok);border-color:rgba(27,158,90,.3)}
.count{min-width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-weight:900;background:var(--grad-soft);border:1px solid var(--line)}
.count.hot{background:var(--grad);color:#fff;border:none}
.sheet-table{overflow:auto;margin-top:10px}
.sheet-table table{min-width:100%}
.sheet-table td input{padding:6px;min-width:64px;text-align:center}
.sheet-table th:first-child,.sheet-table td:first-child{position:sticky;left:0;background:var(--card);z-index:1}
.question{font-size:clamp(1.4rem,6vw,2.3rem);font-weight:900;text-align:center;padding:26px 12px;min-height:150px;display:grid;place-items:center;line-height:1.25}
</style>`);

/* ---------- Petits utilitaires ---------- */
const today = () => new Date().toISOString().slice(0, 10);
const frDate = d => d ? new Date(d + 'T12:00').toLocaleDateString('fr-FR') : '';
function download(name, text, type = 'text/csv;charset=utf-8') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([type.startsWith('text/csv') ? '﻿' + text : text], { type }));
  a.download = name; a.click();
}
const csv = rows => rows.map(r => r.map(v => { v = String(v ?? ''); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(';')).join('\n');
function classNameSelect(id, withAll) {
  return `<select id="${id}">${withAll ? '<option value="">Toutes les classes</option>' : ''}${DB.classes.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('')}</select>`;
}
/* Accès « vivant » à une rubrique de DB : la synchronisation remplace DB.xxx par un nouvel objet
   quand des données arrivent d'une autre tablette. Un outil ouvert qui gardait l'ancien objet
   écrivait alors dans le vide (ex. résultats d'un groupe perdus). Ce proxy relit toujours DB.xxx. */
const liveDB = get => new Proxy({}, {
  get: (_, p) => get()[p], set: (_, p, v) => { get()[p] = v; return true; }, deleteProperty: (_, p) => { delete get()[p]; return true; },
  has: (_, p) => p in get(), ownKeys: () => Reflect.ownKeys(get()),
  getOwnPropertyDescriptor: (_, p) => { const d = Reflect.getOwnPropertyDescriptor(get(), p); if (d) d.configurable = true; return d; } });
const allCls = () => (window.dbGet ? dbGet('classes') : DB.classes) || [];   // mode Équipe : toutes les classes de l'équipe
const studentsOf = name => (allCls().find(c => c.name === name) || (DB.classesAll || []).find(c => c.name === name) || { students: [] }).students;
/* « Autres classes du collège » (hors EPS) : rangées dans DB.classesAll, visibles seulement dans Mes classes et le Cross */
const otherClasses = () => (DB.classesAll = DB.classesAll || []);
const noClassMsg = '<div class="card empty">Créez d\'abord une classe dans l\'outil <b>🗂 Mes classes</b>.<br><br><button class="btn btn-grad" onclick="closeTool();openTool(\'classes\')">Ouvrir Mes classes</button></div>';

/* Caméra : flux + capture JPEG en mémoire tournante */
async function startCamera(video, facing) {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Caméra non disponible sur ce navigateur (HTTPS requis).');
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
  video.srcObject = stream; video.muted = true; video.playsInline = true; await video.play();
  return stream;
}
const stopStream = s => s && s.getTracks().forEach(t => t.stop());

/* =========================================================
   NOUVEAUX OUTILS
   ========================================================= */
/* « NOM Prénom » → « Prénom N. » (si le nom n'est pas en majuscules, il reste tel quel) */
const nameShort = n => { const w = String(n || '').trim().split(/\s+/); let i = 0; while (i < w.length - 1 && w[i] === w[i].toUpperCase() && /[A-ZÀ-Ý]/.test(w[i])) i++;
  return i ? `${w.slice(i).join(' ')} ${w[0][0]}.` : String(n || ''); };
window.nameShort = nameShort;
/* ligne de prénoms sous un nom d'équipe : « Léa D. · Tom M. » */
window.epsMemLine = (names, extra) => names && names.length ? `<div class="muted" style="font-size:.76rem;line-height:1.3;font-weight:600;${extra || ''}">${names.map(n => esc(nameShort(n))).join(' · ')}</div>` : '';
/* membres d'une équipe composée par le module « Composer les équipes » (id = 'ctournoi', 'cpoule'…) */
window.epsPrepMembers = (id, cls, name) => { const P = (DB.prepGroups || {})[id + '|' + (cls || '')], t = P && (P.teams || []).find(x => x.name === name); return t ? t.members.map(m => m.n) : []; };
/* ---------- Relais : suivi par élève, classements de course (utilisés aussi par les fiches) ---------- */
const relCss = () => (typeof CO_CSS !== 'undefined' ? CO_CSS : '') + (window.fichesPieCSS || '');
const relTs = d => new Date(d + 'T12:00').getTime();
const relMy = (v, d) => (typeof coRankOf === 'function' ? coRankOf(v, d[0], d[1]) : null);
const relOrd = n => n == null ? '–' : n === 1 ? '1er' : n + 'e';
const relRg = n => n == null ? '–' : `<span class="rg${n <= 3 ? ' p' + n : ''}">${relOrd(n)}</span>`;
const relRankOf = (vals, i, dir) => { const v = vals[i]; if (v == null || isNaN(v)) return null; return 1 + vals.filter(x => x != null && !isNaN(x) && (dir > 0 ? x < v - 1e-9 : x > v + 1e-9)).length; };
/* courses d'une classe regroupées (même jour + même nombre de relais), équipe la plus récente gardée */
const relGroups = (cls, okDate) => { const G = [];
  (window.teamFilter ? teamFilter(DB.relais.courses) : DB.relais.courses).filter(c => (c.classe || '—') === cls && (!okDate || okDate(relTs(c.date)))).sort((a, b) => (a.at || 0) - (b.at || 0)).forEach(c => {
    const rn = c.run || 1; let g = G.find(x => x.date === c.date && x.legs === c.legs && x.run === rn); if (!g) G.push(g = { date: c.date, legs: c.legs, run: rn, dist: 0, M: new Map(), classe: cls });
    if (c.dist) g.dist = c.dist; (c.teams || []).forEach(t => g.M.set(t.name, t)); });
  G.forEach(g => { g.teams = [...g.M.values()]; });
  return G.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.run - b.run); };
/* lignes « élève » d'une course (g.teams, g.legs, g.dist) */
const relRows = g => { const fin = g.teams.filter(t => t.total).sort((a, b) => a.total - b.total), out = [];
  g.teams.forEach(t => { const M = (t.members || []).length, rank = t.total ? 1 + fin.filter(x => x.total < t.total).length : null;
    (t.members || []).forEach((m, k) => { let own = null, nOwn = 0;
      if (M && (t.legs || []).length && g.legs % M === 0) { const L = t.legs.filter((s, j) => j % M === k); nOwn = L.length; if (nOwn === g.legs / M) own = L.reduce((a, b) => a + b, 0); }
      const avg = own != null && nOwn ? own / nOwn : null, v = avg && g.dist ? g.dist / (avg / 1000) * 3.6 : null;
      out.push({ name: m, team: t.name, rank, of: fin.length, total: t.total || null, own, nOwn, avg, v, dist: g.dist, legsTxt: M && nOwn ? t.legs.filter((s, j) => j % M === k).map(s => fmt(s)).join(' + ') : '', best: M && nOwn ? Math.min(...t.legs.filter((s, j) => j % M === k)) : null }); }); });
  return out; };
window.relSuivi = (cls, name, okDate) => {
  const rows = []; let cum = 0;
  const GG = relGroups(cls, okDate), nd = {}; GG.forEach(g => { nd[g.date] = (nd[g.date] || 0) + 1; });
  GG.forEach(g => { const r = relRows(g).find(x => x.name === name); if (r) rows.push({ ...r, date: g.date, legs: g.legs, run: nd[g.date] > 1 ? g.run : 0 }); });
  if (!rows.length) return null;
  rows.forEach(r => { if (r.own != null) { cum += r.own; r.cum = cum; } else r.cum = null; });
  const A = rows.filter(r => r.own != null), V = rows.filter(r => r.v != null), R = rows.filter(r => r.rank != null);
  return { rows, n: rows.length, nOwn: A.length, own: A.reduce((a, r) => a + r.own, 0), nFr: A.reduce((a, r) => a + r.nOwn, 0), pod: R.filter(r => r.rank <= 3).length, nR: R.length, wins: R.filter(r => r.rank === 1).length,
    rkAvg: R.length ? R.reduce((a, r) => a + r.rank / r.of, 0) / R.length * 100 : null, best: A.length ? Math.min(...A.map(r => r.best)) : null,
    vAvg: V.length ? V.reduce((a, r) => a + r.dist * r.nOwn, 0) / (V.reduce((a, r) => a + r.own, 0) / 1000) * 3.6 : null, dm: rows.reduce((a, r) => a + (r.dist && r.nOwn ? r.dist * r.nOwn : 0), 0) };
};
window.relClassCumul = (cls, name, okDate) => {
  const names = [...new Set(relGroups(cls, okDate).flatMap(g => g.teams.flatMap(t => t.members || [])))], M = {};
  names.forEach(n => { const D = window.relSuivi(cls, n, okDate); if (D) M[n] = D; }); if (!M[name]) return [];
  const pick = f => { const o = {}; Object.keys(M).forEach(n => o[n] = f(M[n])); return o; };
  const rk = (vals, dir) => { const v = vals[name]; if (v == null || isNaN(v)) return null; const L = Object.values(vals).filter(x => x != null && !isNaN(x)); return { rank: 1 + L.filter(x => dir > 0 ? x < v - 1e-9 : x > v + 1e-9).length, of: L.length }; };
  const C = [
    { l: 'Vitesse moyenne de course', dir: -1, vals: pick(D => D.vAvg), txt: D => D.vAvg != null ? D.vAvg.toFixed(1).replace('.', ',') + ' km/h' : '–' },
    { l: 'Meilleur temps de relais', dir: 1, vals: pick(D => D.best), txt: D => D.best != null ? fmt(D.best) : '–' },
    { l: 'Rang moyen de l\'équipe', dir: 1, vals: pick(D => D.rkAvg), txt: D => D.rkAvg != null ? Math.round(D.rkAvg) + ' % (0 = toujours 1er)' : '–' },
    { l: 'Podiums de l\'équipe', dir: -1, vals: pick(D => D.pod), txt: D => D.pod + ' podium' + (D.pod > 1 ? 's' : '') },
    { l: 'Courses réalisées', dir: -1, vals: pick(D => D.n), txt: D => D.n + ' course' + (D.n > 1 ? 's' : '') }];
  return C.map(c => { const r = rk(c.vals, c.dir); return r ? { l: c.l, rank: r.rank, of: r.of, txt: c.txt(M[name]) } : null; }).filter(Boolean);
};
window.relSuiviHTML = (cls, name, okDate) => {
  const D = window.relSuivi(cls, name, okDate); if (!D) return '';
  const e = esc, kmh = v => v == null ? '–' : v.toFixed(1).replace('.', ',');
  const chip = (v, l, c) => `<div style="background:${c};color:#fff;border-radius:12px;padding:8px 6px;text-align:center"><b style="display:block;font-size:1.1rem">${e(String(v))}</b><span style="font-size:.68rem;opacity:.95">${e(l)}</span></div>`;
  let CL = []; try { CL = window.relClassCumul(cls, name, okDate); } catch (er) {}
  const medal = r => r === 1 ? '#C9A227' : r === 2 ? '#7F8AA0' : r === 3 ? '#B87333' : '#1E5BD8';
  const pie = D.nR && window.fichesPieHTML ? window.fichesPieHTML({ t: 'Classement de l\'équipe', note: `${D.wins} victoire${D.wins > 1 ? 's' : ''} · ${D.pod - D.wins} autre${D.pod - D.wins > 1 ? 's' : ''} podium${D.pod - D.wins > 1 ? 's' : ''} · ${D.nR - D.pod} hors podium`, seg: [{ l: '1er', v: D.wins, c: '#C9A227' }, { l: '2e-3e', v: D.pod - D.wins, c: '#7F8AA0' }, { l: 'Hors podium', v: D.nR - D.pod, c: '#8A94A8' }].filter(x => x.v > 0) }) : '';
  return `<style>${relCss()}</style>
    <div class="cs"><h3>🔁 Suivi relais séance par séance · ${e(name)}</h3>
      <div class="kp2">${chip(D.n, `course${D.n > 1 ? 's' : ''} de relais`, '#1E5BD8')}${chip(D.nFr, `fraction${D.nFr > 1 ? 's' : ''} courue${D.nFr > 1 ? 's' : ''}`, '#8E44AD')}${D.own ? chip(fmt(D.own), 'temps de course cumulé', '#0B2A5B') : ''}${D.vAvg != null ? chip(kmh(D.vAvg) + ' km/h', 'vitesse moyenne', '#16A3A3') : ''}${D.nR ? chip(`${D.pod} / ${D.nR}`, 'podiums de l\'équipe', D.pod ? '#C9A227' : '#8A94A8') : ''}</div>
      <table><colgroup><col style="width:17%"><col style="width:19%"><col style="width:16%"><col style="width:16%"><col style="width:16%"><col style="width:16%"></colgroup><tr><th>Séance</th><th>Équipe</th><th>Mon temps<br>de relais</th><th>Cumul</th><th>Vitesse</th><th>Classement<br>équipe</th></tr>
      ${D.rows.map(r => `<tr><td class="l"><b>${e(frDate(r.date).slice(0, 5))}</b><small>${r.run ? 'course ' + r.run + ' · ' : ''}${r.legs} relais${r.dist ? ' × ' + r.dist + ' m' : ''}</small></td><td class="l">${e(r.team)}${r.total ? `<small>${fmt(r.total)}</small>` : ''}</td><td>${r.own != null ? `<b>${fmt(r.own)}</b>${r.nOwn > 1 ? `<small>${e(r.legsTxt)}</small>` : ''}` : '<small>non relevé</small>'}</td><td>${r.cum != null ? fmt(r.cum) : '–'}</td><td>${r.v != null ? kmh(r.v) + '<small>km/h</small>' : '–'}</td><td>${r.rank ? relRg(r.rank) + `<small>sur ${r.of}</small>` : '<small>non classée</small>'}</td></tr>`).join('')}
      <tfoot><tr><td class="l">Total</td><td>${D.n} course${D.n > 1 ? 's' : ''}</td><td>${D.own ? fmt(D.own) : '–'}</td><td></td><td>${D.vAvg != null ? kmh(D.vAvg) : '–'}</td><td>${D.nR ? D.pod + ' podium' + (D.pod > 1 ? 's' : '') : '–'}</td></tr></tfoot></table>
      <p style="font-size:.7rem;color:#667;margin:6px 0 0">Mon temps de relais = temps de mes fractions (calculé si les relayeurs passent dans l'ordre de la liste de l'équipe et si le nombre de relais est un multiple du nombre d'élèves). Vitesse = distance ÷ temps (si la distance d'une fraction est renseignée).</p>
      ${CL.length ? `<h4 style="margin:12px 0 6px;font-size:.92rem">🏅 Classement dans la classe</h4><div class="kp2">${CL.map(c => `<div style="background:${medal(c.rank)};color:#fff;border-radius:12px;padding:8px 6px;text-align:center"><b style="display:block;font-size:1.1rem">${relOrd(c.rank)} / ${c.of}</b><span style="font-size:.68rem;opacity:.95;display:block">${e(c.l)}</span><span style="font-size:.64rem;opacity:.9;display:block;margin-top:2px">${e(c.txt)}</span></div>`).join('')}</div>` : ''}
      ${pie ? `<div class="pies">${pie}</div>` : ''}</div>`;
};
/* classements d'une course : équipes + élèves, g = { date, legs, dist, classe, teams:[{name,members,total,legs}] } */
const REL_CRIT = [
  { k: 'avg', l: 'Temps de relais (moyen par fraction)', dir: 1, val: x => x.avg, cell: x => x.avg != null ? `<b>${fmt(x.avg)}</b>${x.nOwn > 1 ? `<small>${x.nOwn} fractions</small>` : ''}` : '<small>non relevé</small>' },
  { k: 'v', l: 'Vitesse (km/h)', dir: -1, val: x => x.v, cell: x => x.v != null ? `<b>${x.v.toFixed(1).replace('.', ',')}</b>` : '–' },
  { k: 'rank', l: 'Classement de l\'équipe', dir: 1, val: x => x.rank, cell: x => x.rank ? `<b>${relOrd(x.rank)}</b><small>${fmt(x.total)}</small>` : '<small>non classée</small>' },
  { k: 'n', l: 'Courses réalisées', dir: -1, val: x => x.nCum, cell: x => '<b>' + x.nCum + '</b>' }];
window.relSeanceClassHTML = (g, sortK) => {
  const rows = relRows(g); if (!rows.length && !g.teams.length) return '';
  const cls = g.classe || '', S = cls ? relGroups(cls).filter(x => x.date <= g.date) : [g];
  rows.forEach(r => { r.nCum = S.filter(x => x.teams.some(t => (t.members || []).includes(r.name))).length || 1; });
  const crit = REL_CRIT.find(c => c.k === sortK) || REL_CRIT[0];
  const fin = g.teams.filter(t => t.total).sort((a, b) => a.total - b.total);
  const teamTbl = g.teams.length > 1 ? `<h4>👥 Classement par équipes</h4><table style="table-layout:auto"><tr><th>#</th><th>Équipe</th><th>Temps</th><th>Écart</th>${g.dist ? '<th>Vitesse</th>' : ''}</tr>
    ${[...fin, ...g.teams.filter(t => !t.total)].map(t => { const i = fin.indexOf(t); return `<tr><td>${i >= 0 ? relRg(i + 1) : '–'}</td><td class="l"><b>${esc(t.name)}</b>${(t.members || []).length ? `<small>${esc(t.members.join(', '))}</small>` : ''}</td><td>${t.total ? '<b>' + fmt(t.total) + '</b>' : `<small>${(t.legs || []).length}/${g.legs} relais</small>`}</td><td>${t.total && i > 0 ? '+' + fmt(t.total - fin[0].total) : '–'}</td>${g.dist ? `<td>${t.total ? (g.dist * g.legs / (t.total / 1000) * 3.6).toFixed(1).replace('.', ',') + '<small>km/h</small>' : '–'}</td>` : ''}</tr>`; }).join('')}</table>` : '';
  const R = {}; REL_CRIT.forEach(c => { const vals = rows.map(x => c.val(x)); R[c.k] = rows.map((x, i) => relRankOf(vals, i, c.dir)); });
  const ord = rows.map((x, i) => i).sort((a, b) => (R[crit.k][a] ?? 1e9) - (R[crit.k][b] ?? 1e9) || (R.rank[a] ?? 1e9) - (R.rank[b] ?? 1e9));
  const stud = rows.length && rows.some(x => x.nCum != null) ? `<h4>🧑‍🎓 Classement des élèves</h4><table style="table-layout:auto"><tr><th>Élève</th>${REL_CRIT.map(c => `<th${c.k === crit.k ? ' style="background:#C9A227"' : ''}>${c.l}</th>`).join('')}</tr>
    ${ord.map(i => { const x = rows[i]; return `<tr><td class="l"><b>${esc(x.name)}</b><small>${esc(x.team)}</small></td>${REL_CRIT.map(c => `<td>${c.cell(x)}<br>${relRg(R[c.k][i])}</td>`).join('')}</tr>`; }).join('')}</table>` : '';
  return `<style>${relCss()}</style><div class="cs cr2"><h3>🏅 Classements de la course</h3>
    ${rows.length ? `<label style="font-size:.8rem">Classer les élèves par : <select data-crit>${REL_CRIT.map(c => `<option value="${c.k}" ${c.k === crit.k ? 'selected' : ''}>${c.l}</option>`).join('')}</select></label>` : ''}
    ${teamTbl}${stud}<p style="font-size:.7rem;color:#667;margin:6px 0 0">Temps de relais : temps des fractions de l'élève (relayeurs dans l'ordre de la liste de l'équipe). Ex æquo : même rang. Temps : plus petit = mieux ; vitesse : plus grand = mieux.</p></div>`;
};
window.relSeanceClassMount = (host, g) => { if (!host) return; let k = 'avg'; const draw = () => { host.innerHTML = window.relSeanceClassHTML(g, k); const sel = host.querySelector('[data-crit]'); if (sel) sel.onchange = () => { k = sel.value; draw(); }; }; draw(); };

Object.assign(TOOL_IMPL, {

/* ---------- Chronos EPS (12 élèves) — web app de Stéphane ---------- */
chronos12(el) {
  el.classList.add('flush');
  el.innerHTML = `<div class="chronos-bar">
      ${DB.classes.length ? `<select id="cc" data-cfg="bare"><option value="">Charger les prénoms d'une classe…</option>${DB.classes.map((c, i) => `<option value="${i}">${esc(c.name)}</option>`).join('')}</select>` : '<span class="muted" style="flex:1">Astuce : créez une classe pour charger les prénoms.</span>'}
      <button class="btn btn-ghost" id="full">⛶ Plein écran</button>
    </div>
    <iframe class="chronos-frame" id="fr" src="outils/chronos-eps.html" title="Multi chrono (12 élèves)"></iframe>`;
  const fr = el.querySelector('#fr');
  const sel = el.querySelector('#cc');
  if (sel) sel.onchange = () => {
    if (sel.value === '') return;
    const st = DB.classes[sel.value].students;
    let S; try { S = JSON.parse(localStorage.getItem('chronos-eps-v1')); } catch (e) {}
    if (!Array.isArray(S) || S.length !== 13)
      S = Array.from({ length: 13 }, (_, i) => ({ id: i, name: '', running: false, startedAt: 0, accumulated: 0, laps: [], pauses: 0, pauseStartedAt: null, pauseTotal: 0 }));
    for (let i = 1; i <= 12; i++) S[i].name = st[i - 1] ? st[i - 1].slice(0, 20) : '';
    try { localStorage.setItem('chronos-eps-v1', JSON.stringify(S)); } catch (e) {}
    fr.contentWindow.location.reload();
    toast(`${Math.min(12, st.length)} prénoms chargés ✔`);
    sel.value = '';
  };
  // Plein écran DANS l'app (sans quitter EPS ONE) : bouton ✕ pour revenir
  if (!document.getElementById('chr-css')) document.head.insertAdjacentHTML('beforeend', `<style id="chr-css">.chronos-frame.fs{position:fixed;inset:0;width:100vw;height:100vh;height:100dvh;z-index:140;background:#fff;border:0}
    .chr-x{position:fixed;top:calc(8px + env(safe-area-inset-top));right:calc(10px + env(safe-area-inset-right));z-index:141;width:46px;height:46px;border-radius:50%;border:none;background:rgba(11,42,91,.9);color:#fff;font-size:1.3rem;font-weight:900;box-shadow:0 4px 14px rgba(0,0,0,.3)}</style>`);
  let xb = null;
  const exitFs = () => { fr.classList.remove('fs'); if (xb) { xb.remove(); xb = null; } };
  el.querySelector('#full').onclick = () => { fr.classList.add('fs'); xb = document.createElement('button'); xb.className = 'chr-x'; xb.type = 'button'; xb.textContent = '✕'; xb.setAttribute('aria-label', 'Quitter le plein écran'); xb.onclick = exitFs; document.body.appendChild(xb); };
  return () => { exitFs(); el.classList.remove('flush'); };
},

/* ---------- Vidéo différée ---------- */
video(el) {
  let stream = null, facing = 'environment', frames = [], capIv = null, raf = null, frozen = false, shown = null;
  el.innerHTML = `<div class="cam-wrap"><canvas id="cv" width="640" height="360"></canvas><div class="cam-overlay" id="ov">—</div><div class="cam-msg" id="msg">Touchez « Activer la caméra »</div></div>
    <div class="card" style="margin-top:12px">
      <div data-cfg><label>Délai de différé : <b id="dl">8 s</b></label><input type="range" id="d" min="2" max="30" value="8"></div>
      <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="on">📷 Activer la caméra</button><button class="btn btn-ghost" id="sw">🔄 Avant / arrière</button><button class="btn btn-ghost" id="fz">⏸ Figer</button></div>
      <p class="muted" style="margin:10px 0 0">Posez la tablette face à l'atelier : l'élève fait son passage puis vient se voir quelques secondes plus tard, sans toucher l'écran.</p></div>
    <video id="vd" playsinline muted style="display:none"></video>`;
  const $ = s => el.querySelector(s), cv = $('#cv'), ctx = cv.getContext('2d'), vd = $('#vd');
  const off = document.createElement('canvas'), octx = off.getContext('2d');
  const delay = () => +$('#d').value * 1000;
  $('#d').oninput = () => $('#dl').textContent = $('#d').value + ' s';
  const capture = () => {
    if (!vd.videoWidth || frozen) return;
    const w = 640, h = Math.round(w * vd.videoHeight / vd.videoWidth);
    if (off.width !== w || off.height !== h) { off.width = w; off.height = h; cv.width = w; cv.height = h; }
    octx.drawImage(vd, 0, 0, w, h);
    const t = performance.now();
    off.toBlob(b => { if (b) frames.push({ t, b }); }, 'image/jpeg', 0.6);
    const limit = t - delay() - 1500;
    while (frames.length && frames[0].t < limit) frames.shift();
  };
  const render = async () => {
    raf = requestAnimationFrame(render);
    if (frozen || !stream) return;
    const target = performance.now() - delay();
    let f = null; for (let i = frames.length - 1; i >= 0; i--) if (frames[i].t <= target) { f = frames[i]; break; }
    if (!f) { const wait = frames.length ? Math.ceil((frames[0].t - target) / 1000) : Math.ceil(delay() / 1000); $('#ov').textContent = `Différé dans ${wait} s…`; return; }
    if (f === shown) return; shown = f;
    try { const bmp = await createImageBitmap(f.b); ctx.drawImage(bmp, 0, 0, cv.width, cv.height); bmp.close?.(); } catch (e) {}
    $('#ov').textContent = `● Différé ${$('#d').value} s`;
  };
  const start = async () => {
    stopStream(stream); frames = []; shown = null;
    try { stream = await startCamera(vd, facing); $('#msg').style.display = 'none'; }
    catch (e) { $('#msg').textContent = 'Impossible d\'accéder à la caméra : ' + e.message; return; }
    clearInterval(capIv); capIv = setInterval(capture, 1000 / 15);
  };
  $('#on').onclick = start;
  $('#sw').onclick = () => { facing = facing === 'environment' ? 'user' : 'environment'; if (stream) start(); };
  $('#fz').onclick = () => { frozen = !frozen; $('#fz').textContent = frozen ? '▶ Reprendre' : '⏸ Figer'; if (!frozen) frames = []; };
  render();
  return () => { clearInterval(capIv); cancelAnimationFrame(raf); stopStream(stream); frames = []; };
},

/* ---------- Photo-finish ---------- */
photo(el) {
  let stream = null, facing = 'environment', frames = [], capIv = null, t0 = null, mode = 'live', idx = 0, raf = null, marks = [];
  el.innerHTML = `<div class="cam-wrap"><canvas id="cv" width="640" height="360"></canvas><div class="cam-overlay" id="ov">—</div><div class="cam-msg" id="msg">Placez la tablette dans l'axe de la ligne d'arrivée puis activez la caméra</div></div>
    <div class="card" style="margin-top:12px" id="live">
      <div class="row"><button class="btn btn-grad" id="on">📷 Caméra</button><button class="btn btn-ghost" id="sw">🔄</button></div>
      <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="go">🔫 Départ course</button><button class="btn btn-danger" id="fz">🏁 Figer l'arrivée</button></div>
      <p class="muted" style="margin:10px 0 0">La caméra garde en mémoire les 15 dernières secondes. Touchez « Figer » juste après la dernière arrivée, puis rembobinez image par image.</p></div>
    <div class="card" style="margin-top:12px;display:none" id="rev">
      <input type="range" id="sl" min="0" max="0" value="0">
      <div class="row" style="margin-top:10px"><button class="btn btn-ghost" id="p10">⏪</button><button class="btn btn-ghost" id="p1">◀ 1 img</button><button class="btn btn-ghost" id="n1">1 img ▶</button><button class="btn btn-ghost" id="n10">⏩</button></div>
      <div class="row" style="margin-top:10px"><input id="lb" placeholder="Nom / dossard"><button class="btn btn-grad" id="mk">📌 Marquer ce temps</button></div>
      <button class="btn btn-ghost btn-block" style="margin-top:10px" id="back">↺ Revenir au direct</button>
    </div>
    <div class="section-title"><h2>Arrivées</h2><button class="link" id="exp">Exporter</button></div>
    <div class="card" style="padding:0" id="ml"><div class="empty">Aucune arrivée marquée.</div></div>
    <video id="vd" playsinline muted style="display:none"></video>`;
  const $ = s => el.querySelector(s), cv = $('#cv'), ctx = cv.getContext('2d'), vd = $('#vd');
  const off = document.createElement('canvas'), octx = off.getContext('2d');
  const rel = t => t0 ? fmt(t - t0) : 'chrono non lancé';
  const capture = () => {
    if (!vd.videoWidth || mode !== 'live') return;
    const w = 640, h = Math.round(w * vd.videoHeight / vd.videoWidth);
    if (off.width !== w || off.height !== h) { off.width = w; off.height = h; cv.width = w; cv.height = h; }
    octx.drawImage(vd, 0, 0, w, h);
    const t = performance.now();
    off.toBlob(b => { if (b && mode === 'live') frames.push({ t, b }); }, 'image/jpeg', 0.7);
    while (frames.length && frames[0].t < t - 15000) frames.shift();
  };
  const live = () => {
    raf = requestAnimationFrame(live);
    if (mode !== 'live' || !vd.videoWidth) return;
    ctx.drawImage(vd, 0, 0, cv.width, cv.height);
    $('#ov').textContent = t0 ? '⏱ ' + fmt(performance.now() - t0) : '● Direct';
  };
  const show = async i => {
    idx = Math.max(0, Math.min(frames.length - 1, i)); $('#sl').value = idx;
    const f = frames[idx]; if (!f) return;
    try { const bmp = await createImageBitmap(f.b); ctx.drawImage(bmp, 0, 0, cv.width, cv.height); bmp.close?.(); } catch (e) {}
    $('#ov').textContent = '⏱ ' + rel(f.t) + `  ·  img ${idx + 1}/${frames.length}`;
  };
  const drawMarks = () => {
    $('#ml').innerHTML = marks.length ? marks.map((m, i) => `<div class="list-item"><b>${i + 1}.</b><span style="flex:1">${esc(m.label)}</span><b>${m.time}</b><button class="btn btn-ghost" data-x="${i}">✕</button></div>`).join('') : '<div class="empty">Aucune arrivée marquée.</div>';
    $('#ml').querySelectorAll('[data-x]').forEach(b => b.onclick = () => { marks.splice(b.dataset.x, 1); drawMarks(); });
  };
  const start = async () => {
    stopStream(stream);
    try { stream = await startCamera(vd, facing); $('#msg').style.display = 'none'; }
    catch (e) { $('#msg').textContent = 'Impossible d\'accéder à la caméra : ' + e.message; return; }
    clearInterval(capIv); capIv = setInterval(capture, 1000 / 30);
  };
  $('#on').onclick = start;
  $('#sw').onclick = () => { facing = facing === 'environment' ? 'user' : 'environment'; if (stream) start(); };
  $('#go').onclick = () => { t0 = performance.now(); beep(1500, .3); toast('Chrono lancé'); };
  $('#fz').onclick = () => {
    if (!frames.length) return toast('Activez d\'abord la caméra');
    setTimeout(() => {
      mode = 'review'; $('#live').style.display = 'none'; $('#rev').style.display = 'block';
      $('#sl').max = frames.length - 1; show(frames.length - 1);
    }, 400);
  };
  $('#sl').oninput = () => show(+$('#sl').value);
  [['#p10', -10], ['#p1', -1], ['#n1', 1], ['#n10', 10]].forEach(([s, d]) => $(s).onclick = () => show(idx + d));
  $('#mk').onclick = () => { const f = frames[idx]; if (!f) return; marks.push({ label: $('#lb').value.trim() || `Coureur ${marks.length + 1}`, time: rel(f.t), t: f.t }); marks.sort((a, b) => a.t - b.t); $('#lb').value = ''; drawMarks(); beep(1000, .08); };
  $('#back').onclick = () => { mode = 'live'; frames = []; $('#rev').style.display = 'none'; $('#live').style.display = 'block'; };
  $('#exp').onclick = () => { if (!marks.length) return toast('Rien à exporter'); download(`photo-finish-${today()}.csv`, csv([['Rang', 'Nom', 'Temps'], ...marks.map((m, i) => [i + 1, m.label, m.time])])); };
  live();
  return () => { clearInterval(capIv); cancelAnimationFrame(raf); stopStream(stream); frames = []; };
},

/* ---------- Dispenses ---------- */
dispenses(el) {
  let edit = null;   // dispense en cours de modification
  const draw = () => {
    const f = el.querySelector('#fc')?.value ?? '';
    const list = DB.dispenses.filter(d => (!f || d.classe === f) && (!window.teamSees || teamSees(d))).sort((a, b) => (b.fin || '9').localeCompare(a.fin || '9'));
    const actives = list.filter(d => !d.fin || d.fin >= today()), passees = list.filter(d => d.fin && d.fin < today());
    const item = d => `<div class="list-item"><div style="flex:1"><b>${esc(d.eleve)}</b> <span class="muted">${esc(d.classe || '')}</span><br>
      <span class="pill ${d.type === 'Totale' ? 'warn' : ''}">${d.type}</span> <span class="muted">du ${frDate(d.debut)}${d.fin ? ' au ' + frDate(d.fin) : ' (sans date de fin)'}</span>
      ${d.note ? `<div class="muted">${esc(d.note)}</div>` : ''}</div><button class="btn btn-ghost" data-cfg="bare" data-ed="${DB.dispenses.indexOf(d)}" aria-label="Modifier">✏️</button><button class="btn btn-ghost" data-cfg="bare" data-d="${DB.dispenses.indexOf(d)}">🗑</button></div>`;
    el.querySelector('#lists').innerHTML = `<div class="section-title"><h2>En cours (${actives.length})</h2></div><div class="card" style="padding:0">${actives.map(item).join('') || '<div class="empty">Aucune dispense en cours.</div>'}</div>
      <div class="section-title"><h2>Terminées (${passees.length})</h2></div><div class="card" style="padding:0">${passees.map(item).join('') || '<div class="empty">—</div>'}</div>`;
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (confirm('Supprimer ?')) { const x = DB.dispenses[+b.dataset.d]; if (x === edit) stopEdit(); DB.dispenses.splice(b.dataset.d, 1); save(); draw(); } });
    el.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => startEdit(DB.dispenses[+b.dataset.ed]));
  };
  el.innerHTML = `<div class="card" data-cfg id="dform"><h3 id="dtitle">Nouvelle dispense</h3>
    <div class="row"><div><label>Classe</label>${DB.classes.length ? classNameSelect('cl') : '<input id="cl" placeholder="ex : 6E1">'}</div><div><label>Élève</label><select id="els"></select><input id="el" placeholder="Nom de l'élève" style="display:none;margin-top:6px"></div></div>
    <div class="row"><div><label>Type</label><select id="ty"><option>Partielle</option><option>Totale</option></select></div><div><label>Du</label><input id="db" type="date" value="${today()}"></div><div><label>Au</label><input id="fn" type="date"></div></div>
    <label>Remarque (activités possibles, aménagements…)</label><input id="nt">
    <button class="btn btn-grad btn-block" style="margin-top:12px" id="add">＋ Enregistrer</button><button class="btn btn-ghost btn-block" style="margin-top:8px;display:none" id="dcancel">Annuler la modification</button></div>
    <div style="margin-top:14px"><label>Filtrer</label>${classNameSelect('fc', true)}</div><div id="lists"></div>`;
  const $ = s => el.querySelector(s);
  // Liste des élèves de la classe choisie (un <select> : la « datalist » ne s'affiche pas sur iPhone/iPad)
  const fillDl = () => { const st = studentsOf($('#cl').value), sel = $('#els'), inp = $('#el'), act = new Set(DB.dispenses.filter(d => d.classe === $('#cl').value && (!d.fin || d.fin >= today())).map(d => d.eleve));
    sel.innerHTML = st.length ? `<option value="">— Choisir l'élève (${st.length}) —</option>${st.map(n => `<option value="${esc(n)}">${esc(n)}${act.has(n) ? ' · déjà dispensé·e' : ''}</option>`).join('')}<option value="__autre">✏️ Autre élève (saisie libre)</option>` : '';
    sel.style.display = st.length ? '' : 'none'; inp.style.display = st.length ? 'none' : ''; inp.value = ''; };
  $('#els').onchange = () => { const o = $('#els').value === '__autre'; $('#el').style.display = o ? '' : 'none'; if (o) $('#el').focus(); };
  $('#cl').onchange = fillDl; fillDl();
  $('#fc').onchange = draw;
  const stopEdit = () => { edit = null; $('#dtitle').textContent = 'Nouvelle dispense'; $('#add').textContent = '＋ Enregistrer'; $('#dcancel').style.display = 'none'; $('#nt').value = ''; $('#fn').value = ''; $('#db').value = today(); $('#ty').value = 'Partielle'; fillDl(); };
  const startEdit = d => { if (!d) return; edit = d;
    if ($('#cl').tagName === 'SELECT' && ![...$('#cl').options].some(o => o.value === d.classe)) $('#cl').insertAdjacentHTML('beforeend', `<option>${esc(d.classe)}</option>`);
    $('#cl').value = d.classe || ''; fillDl();
    if ([...$('#els').options].some(o => o.value === d.eleve)) $('#els').value = d.eleve; else { if ($('#els').options.length) $('#els').value = '__autre'; $('#el').style.display = ''; $('#el').value = d.eleve; }
    $('#ty').value = d.type; $('#db').value = d.debut || ''; $('#fn').value = d.fin || ''; $('#nt').value = d.note || '';
    $('#dtitle').textContent = `Modifier la dispense · ${d.eleve}`; $('#add').textContent = '💾 Enregistrer les modifications'; $('#dcancel').style.display = '';
    $('#dform').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  $('#dcancel').onclick = stopEdit;
  $('#add').onclick = () => {
    const sv = $('#els').style.display !== 'none' ? $('#els').value : '__autre', eleve = (sv === '__autre' ? $('#el').value : sv).trim(); if (!eleve) return toast('Choisissez l\'élève');
    const o = { classe: $('#cl').value, eleve, type: $('#ty').value, debut: $('#db').value, fin: $('#fn').value, note: $('#nt').value.trim() };
    if (edit && DB.dispenses.includes(edit)) { Object.assign(edit, o); save(); stopEdit(); toast('Dispense modifiée ✔'); return draw(); }
    DB.dispenses.push(o);
    save(); $('#nt').value = ''; $('#fn').value = ''; fillDl(); toast('Dispense enregistrée ✔'); draw();
  };
  draw();
},

/* ---------- Oublis de tenue ---------- */
oubli(el) {
  if (!DB.classes.length) { el.innerHTML = noClassMsg; return; }
  el.innerHTML = `<div class="card" data-cfg><label>Classe</label>${classNameSelect('cl')}
    <div class="row" style="margin-top:10px"><button class="btn btn-ghost" id="exp" data-free>📤 Exporter</button><button class="btn btn-ghost" id="rz">↺ Remettre à zéro</button></div></div>
    <div class="card" style="padding:0;margin-top:12px" id="ls" data-cfg="bare"></div>`;
  const $ = s => el.querySelector(s);
  const data = () => (DB.oublis[$('#cl').value] = DB.oublis[$('#cl').value] || {});
  const draw = () => {
    const d = data(), st = studentsOf($('#cl').value);
    $('#ls').innerHTML = st.map((n, i) => { const c = (d[n] || []).length, last = (d[n] || []).slice(-1)[0];
      return `<div class="list-item"><div class="count ${c >= 3 ? 'hot' : ''}">${c}</div><div style="flex:1"><b>${esc(n)}</b>${last ? `<div class="muted">dernier : ${frDate(last)}</div>` : ''}</div>
      <button class="btn btn-ghost" data-m="${i}">−</button><button class="btn btn-grad" data-p="${i}">+1</button></div>`; }).join('') || '<div class="empty">Classe vide.</div>';
    $('#ls').querySelectorAll('[data-p]').forEach(b => b.onclick = () => { const n = st[b.dataset.p]; (d[n] = d[n] || []).push(today()); save(); draw(); if (d[n].length === 3) toast(`⚠️ 3e oubli pour ${n}`); });
    $('#ls').querySelectorAll('[data-m]').forEach(b => b.onclick = () => { const n = st[b.dataset.m]; (d[n] || []).pop(); save(); draw(); });
  };
  $('#cl').onchange = draw;
  $('#rz').onclick = () => { if (confirm('Remettre à zéro les oublis de cette classe ?')) { DB.oublis[$('#cl').value] = {}; save(); draw(); } };
  $('#exp').onclick = () => { const d = data(); download(`oublis-${$('#cl').value}-${today()}.csv`, csv([['Élève', 'Nombre', 'Dates'], ...studentsOf($('#cl').value).map(n => [n, (d[n] || []).length, (d[n] || []).map(frDate).join(', ')])])); };
  draw();
},

/* ---------- Tournoi à élimination directe ---------- */
tournoi(el) {
  let rounds = [];
  el.innerHTML = `<div class="card" data-cfg>${classSelect('ts')}<label>Équipes / joueurs (un par ligne)</label><textarea id="tl" style="min-height:110px">Équipe 1\nÉquipe 2\nÉquipe 3\nÉquipe 4\nÉquipe 5\nÉquipe 6</textarea>
    <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="mx" style="width:auto"> Mélanger au hasard</label>
    <button class="btn btn-grad btn-block" style="margin-top:10px" id="gen">🏅 Générer le tableau</button></div>
    <p class="muted" style="margin:12px 2px 0">Touchez le vainqueur de chaque match pour le qualifier.</p><div class="bracket" id="br"></div><div id="ch"></div>`;
  bindClassToTextarea('ts', 'tl');
  const $ = s => el.querySelector(s);
  let fromC = false; el.addEventListener('click', ev => { if (ev.target.closest('#ctournoi-go,#ctournoi-use')) fromC = true; }); $('#tl').addEventListener('input', () => { fromC = false; });
  const memT = nm => fromC && nm != null ? window.epsPrepMembers('ctournoi', (el.querySelector('#ctournoi-cls') || {}).value, nm) : [];
  const names = ['Finale', 'Demi-finales', 'Quarts', '8es', '16es', '32es'];
  const propagate = () => {
    for (let r = 0; r < rounds.length; r++) rounds[r].forEach((m, i) => {
      if (r > 0) { const p1 = rounds[r - 1][2 * i], p2 = rounds[r - 1][2 * i + 1]; m.a = p1.w ?? null; m.b = p2.w ?? null; }
      if (m.w != null && m.w !== m.a && m.w !== m.b) m.w = null;
      if (r === 0 && m.a != null && m.b == null) m.w = m.a;
    });
  };
  const draw = () => {
    propagate();
    const R = rounds.length;
    $('#br').innerHTML = rounds.map((rd, r) => `<div class="round"><h4>${names[R - 1 - r] || 'Tour ' + (r + 1)}</h4>${rd.map((m, i) => `<div class="match">
      ${['a', 'b'].map(k => `<button data-r="${r}" data-i="${i}" data-k="${k}" class="${m.w != null && m[k] != null ? (m.w === m[k] ? 'win' : 'lose') : ''}" ${m[k] == null || m.a == null || m.b == null ? 'disabled' : ''}>${m[k] != null ? esc(m[k]) + (memT(m[k]).length ? `<br><small style="font-weight:600;opacity:.85">${memT(m[k]).map(x => esc(nameShort(x))).join(' · ')}</small>` : '') : (r === 0 ? 'exempt' : '…')}</button>`).join('')}</div>`).join('')}</div>`).join('');
    $('#br').querySelectorAll('[data-r]').forEach(b => b.onclick = () => { const m = rounds[b.dataset.r][b.dataset.i]; m.w = m.w === m[b.dataset.k] ? null : m[b.dataset.k]; draw(); });
    const fin = rounds[R - 1]?.[0];
    $('#ch').innerHTML = fin?.w != null ? `<div class="champion">🏆 ${esc(fin.w)}${memT(fin.w).length ? `<div style="font-size:.9rem;font-weight:600">${memT(fin.w).map(x => esc(nameShort(x))).join(' · ')}</div>` : ''}</div>` : '';
    if (fin?.w != null) beep(1200, .4);
  };
  $('#gen').onclick = () => {
    let t = namesFrom('tl'); if (t.length < 2) return toast('Au moins 2 participants');
    if ($('#mx').checked) t = shuffle(t);
    const size = 2 ** Math.ceil(Math.log2(t.length)); const slots = [...t, ...Array(size - t.length).fill(null)];
    rounds = [Array.from({ length: size / 2 }, (_, i) => ({ a: slots[i], b: slots[size - 1 - i], w: null }))];
    while (rounds[rounds.length - 1].length > 1) rounds.push(Array.from({ length: rounds[rounds.length - 1].length / 2 }, () => ({ a: null, b: null, w: null })));
    draw();
  };
},

/* ---------- Pyramide des victoires ---------- */
pyramide(el) {
  let ranks = [], log = [];
  el.innerHTML = `<div class="card" id="setup" data-cfg>${classSelect('ps')}<label>Joueurs (ordre = classement de départ)</label><textarea id="pl"></textarea>
    <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="mx" checked style="width:auto"> Placement de départ au hasard</label>
    <button class="btn btn-grad btn-block" style="margin-top:10px" id="gen">🔺 Construire la pyramide</button></div>
    <div id="game" style="display:none">
      <div class="pyr" id="py"></div>
      <div class="card"><h3>Défi</h3><p class="muted" style="margin:4px 0 0">On défie un joueur de la ligne juste au-dessus (ou de sa propre ligne). Si le challenger gagne, il prend sa place.</p>
        <div class="row"><div><label>Challenger</label><select id="c1"></select></div><div><label>Défié</label><select id="c2"></select></div></div>
        <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="w1">Victoire challenger</button><button class="btn btn-ghost" id="w2">Victoire défié</button></div></div>
      <div class="section-title"><h2>Historique</h2><button class="link" id="new" data-cfg="bare">Nouvelle pyramide</button></div><div class="card" id="lg"></div>
    </div>`;
  bindClassToTextarea('ps', 'pl');
  const $ = s => el.querySelector(s);
  const draw = () => {
    let html = '', i = 0, row = 1;
    while (i < ranks.length) { html += `<div class="pyr-row">${ranks.slice(i, i + row).map((n, k) => `<div class="pyr-cell"><small>#${i + k + 1}</small>${esc(n)}</div>`).join('')}</div>`; i += row; row++; }
    $('#py').innerHTML = html;
    const opts = ranks.map((n, k) => `<option value="${k}">#${k + 1} ${esc(n)}</option>`).join('');
    const v1 = $('#c1').value, v2 = $('#c2').value; $('#c1').innerHTML = opts; $('#c2').innerHTML = opts;
    $('#c1').value = v1 || Math.min(1, ranks.length - 1); $('#c2').value = v2 || 0;
    $('#lg').innerHTML = log.length ? log.slice().reverse().map(l => `<div class="muted" style="padding:4px 0">${esc(l)}</div>`).join('') : '<div class="muted">Aucun match joué.</div>';
  };
  $('#gen').onclick = () => { let p = namesFrom('pl'); if (p.length < 3) return toast('Au moins 3 joueurs'); ranks = $('#mx').checked ? shuffle(p) : p; log = []; $('#setup').style.display = 'none'; $('#game').style.display = 'block'; draw(); };
  const play = challengerWins => {
    const a = +$('#c1').value, b = +$('#c2').value; if (a === b) return toast('Choisissez deux joueurs différents');
    const ca = ranks[a], cb = ranks[b];
    if (challengerWins && a > b) { ranks.splice(a, 1); ranks.splice(b, 0, ca); log.push(`${ca} bat ${cb} → monte en #${b + 1}`); beep(1200, .2); }
    else log.push(challengerWins ? `${ca} bat ${cb} (déjà mieux classé)` : `${cb} résiste à ${ca}`);
    $('#c1').value = ''; $('#c2').value = ''; draw();
  };
  $('#w1').onclick = () => play(true); $('#w2').onclick = () => play(false);
  $('#new').onclick = () => { $('#setup').style.display = 'block'; $('#game').style.display = 'none'; };
},

/* ---------- Relais ---------- */
relais(el) {
  // course en cours gardée en mémoire ; l'équipe suivie par la tablette est propre à l'appareil (DB.tablette, jamais synchronisé)
  // seules les courses enregistrées vont dans DB.relais.courses (synchronisé, fusion par id)
  if (!DB.relais || !Array.isArray(DB.relais.courses)) DB.relais = { courses: [] };
  let teams = [], t0 = null, raf = null, cls = '', fromCls = false, saved = {}, resDone = new Set(), run = 1;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const TB = () => (DB.tablette = DB.tablette || {}), onlyT = () => { const n = TB().relais; return n != null ? teams.find(t => t.name === n) : null; };
  const setOnly = n => { TB().relais = n; save(); };
  if (!document.getElementById('gv-ath')) document.head.insertAdjacentHTML('beforeend', `<style id="gv-ath">
.gv-cnt{display:flex;align-items:center;gap:10px;margin-top:10px}
.gv-cnt .l{flex:1;font-weight:800;text-align:left}
.gv-cnt .btn{min-width:64px;min-height:56px;font-size:1.45rem;padding:0 12px}
.gv-cnt b{min-width:46px;text-align:center;font-size:1.8rem;font-variant-numeric:tabular-nums}
.gv-in{width:84px;padding:12px 6px;text-align:center;font-size:1.3rem;font-weight:800}
.gv-big{font-size:1.2rem;padding:16px;margin-top:12px}
</style>`);
  // Zones : transmission (centrée sur la ligne de relais) + élan (juste avant). Dernières valeurs gardées sur l'appareil.
  const ZD = { zt: 20, ze: 10 }, ZI = { ...ZD, ...(TB().relaisZones || {}) };
  const zNum = (v, d) => { const x = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(x) && x >= 0 ? x : d; };
  const zOf = r => ({ zt: zNum(r && r.zt, ZD.zt) || ZD.zt, ze: zNum(r && r.ze, ZD.ze) });   // anciennes courses : valeurs par défaut
  const mF = x => (Math.round(x * 10) / 10).toString().replace('.', ',');
  el.innerHTML = `<div class="card" id="setup" data-cfg>
    <label>Équipes (une par ligne)</label><textarea id="tl" style="min-height:100px">Équipe 1\nÉquipe 2\nÉquipe 3\nÉquipe 4</textarea><div id="tcnt" class="muted" style="font-size:.82rem;margin-top:4px"></div>
    <div class="row"><div><label>Relayeurs / fractions par équipe</label><input id="lg" type="number" value="3" min="1" max="20"></div><div><label>Distance d'une fraction (m, optionnel)</label><input id="ds" type="number" value="40" placeholder="ex : 40"></div></div>
    <div class="row"><div><label>Zone de transmission (m)</label><input id="zt" type="number" value="${ZI.zt}" min="1" max="100" step="any"></div><div><label>Zone d'élan (m)</label><input id="ze" type="number" value="${ZI.ze}" min="0" max="100" step="any"></div></div>
    <div id="zprev"></div>
    <button class="btn btn-grad btn-block" style="margin-top:12px" id="gen">🔄 Préparer la course</button></div>
    <div id="race" style="display:none">
      <div class="card"><div id="zhd"></div><div class="big clock" id="tm">00:00,00</div><div class="row"><button class="btn btn-grad" id="go">🔫 Départ</button><button class="btn btn-ghost" id="exp">📤 Résultats</button><button class="btn btn-ghost" id="new" data-cfg="bare">↺ Nouvelle</button></div>
        <button class="btn btn-grad btn-block" style="margin-top:8px" id="nrun">🔁 Enregistrer et recommencer (mêmes équipes)</button>
        <div class="row" style="margin-top:6px"><button class="btn btn-ghost" id="edt" data-cfg="bare">✏️ Modifier les équipes / élèves</button><button class="btn btn-ghost" id="rsa" data-cfg="bare">⟲ Tout à zéro sans enregistrer</button></div>
        <button class="btn btn-ghost btn-block" style="margin-top:8px" id="sv">💾 Enregistrer la course</button><div id="onw"></div></div>
      <div class="relay-grid" id="rg"></div></div>
    <div id="gv" style="display:none"></div>
    <div id="hist"></div>`;
  const $ = s => el.querySelector(s); let legs = 3, dist = 40, zt = ZI.zt, ze = ZI.ze;
  // Schéma d'un passage + positions des plots (depuis la ligne de départ et depuis le départ de chaque fraction)
  const zSchema = (d, t, e) => { const W = 340, x0 = 12, x1 = W - 12, pre = e + t / 2 + 8, span = pre + t / 2 + 10;
      const X = m => x0 + (m + pre) / span * (x1 - x0), L = 0, Tb = -t / 2, Te = t / 2, Eb = Tb - e;
      const tick = (m, lab, y) => `<line x1="${X(m)}" y1="30" x2="${X(m)}" y2="62" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2"/><text x="${X(m)}" y="${y}" text-anchor="middle" font-size="10" fill="currentColor">${lab}</text>`;
      const lab = (a, b2, full, short, col) => { const w = X(b2) - X(a), t = full.length * 5.6 <= w - 4 ? full : short.length * 5.6 <= w - 4 ? short : '';
        return t ? `<text x="${(X(a) + X(b2)) / 2}" y="50" text-anchor="middle" font-size="10" font-weight="700" fill="${col}">${t}</text>` : ''; };
      const cone = m => `<path d="M${X(m) - 5} 70 L${X(m)} 60 L${X(m) + 5} 70 Z" fill="#F28C28"/>`;
      return `<svg viewBox="0 0 ${W} 112" width="100%" style="max-width:520px;display:block;margin:8px auto 0;color:var(--text)" role="img" aria-label="Schéma d'un passage de relais">
        <rect x="${x0}" y="34" width="${x1 - x0}" height="24" rx="4" fill="var(--line)"/>
        ${e ? `<rect x="${X(Eb)}" y="34" width="${X(Tb) - X(Eb)}" height="24" fill="#F5B94A"/>${lab(Eb, Tb, `élan ${mF(e)} m`, 'élan', '#222')}` : ''}
        <rect x="${X(Tb)}" y="34" width="${X(Te) - X(Tb)}" height="24" fill="#3B82F6"/>${lab(Tb, Te, `transmission ${mF(t)} m`, 'transm.', '#fff')}
        <line x1="${X(L)}" y1="28" x2="${X(L)}" y2="64" stroke="#D93025" stroke-width="2.5"/>
        <text x="${X(L)}" y="22" text-anchor="middle" font-size="10" font-weight="700" fill="#D93025">ligne de relais${d ? ` (fin des ${mF(d)} m)` : ''}</text>
        ${e ? cone(Eb) : ''}${cone(Tb)}${cone(Te)}
        ${e ? tick(Eb, 'début élan', 84) : ''}${tick(Tb, 'début transm.', e ? 98 : 84)}${tick(Te, 'fin transm.', 84)}
        <text x="${x0}" y="108" font-size="9.5" fill="currentColor" opacity=".7">sens de course →</text></svg>
      <div style="display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;font-size:.8rem;font-weight:700;margin-top:2px">${e ? `<span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#F5B94A;vertical-align:-1px"></span> Zone d'élan ${mF(e)} m</span>` : '<span class="muted">Pas de zone d\'élan</span>'}<span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#3B82F6;vertical-align:-1px"></span> Zone de transmission ${mF(t)} m (centrée sur la ligne)</span></div>`; };
  const zPlots = (L, d, t, e) => { if (!d) return `<p class="muted" style="font-size:.8rem;margin:6px 0 0">Indiquez la distance d'une fraction pour calculer l'emplacement des plots.</p>`;
    const warn = t / 2 + e > d ? `<p style="font-size:.8rem;margin:6px 0 0;color:#D93025">⚠️ Zones plus longues que la fraction : vérifiez les distances.</p>` : '';
    const rows = Array.from({ length: Math.max(0, L - 1) }, (_, k) => { const B = (k + 1) * d;
      return `<tr><td><b>${k + 1} → ${k + 2}</b></td><td>${e ? mF(B - t / 2 - e) + ' m' : '–'}</td><td>${mF(B - t / 2)} m</td><td><b>${mF(B)} m</b></td><td>${mF(B + t / 2)} m</td></tr>`; }).join('');
    return `${warn}${L > 1 ? `<div class="sheet-table" style="margin-top:8px"><table><tr><th>Passage</th><th>Début élan</th><th>Début transm.</th><th>Ligne</th><th>Fin transm.</th></tr>${rows}</table></div>
      <p class="muted" style="font-size:.78rem;margin:6px 0 0">Distances depuis la ligne de départ (${L} × ${mF(d)} m = ${mF(L * d)} m). Pour chaque fraction : début d'élan à ${mF(d - t / 2 - e)} m, début de transmission à ${mF(d - t / 2)} m et fin de transmission à ${mF(d + t / 2)} m de son départ${e ? ' · le relayeur suivant attend au début de la zone d\'élan' : ''}.</p>` : ''}`; };
  const zBlock = (L, d, t, e, open) => `<details class="rz-z" ${open ? 'open' : ''} style="margin-top:8px"><summary style="cursor:pointer;font-weight:800;font-size:.9rem">📐 Zones et plots</summary>${zSchema(d, t, e)}${zPlots(L, d, t, e)}</details>`;
  const zPrev = () => { const L = Math.max(1, +$('#lg').value || 1), d = zNum($('#ds').value, 0), t = zNum($('#zt').value, ZD.zt) || ZD.zt, e = zNum($('#ze').value, ZD.ze);
    $('#zprev').innerHTML = zBlock(L, d, t, e, true); };
  const undoLast = t => { if (!t.splits.length) return; t.splits.pop(); t.total = 0; beep(500, .1); draw(); };
  const resetTeam = t => { if (!confirm(`Remettre « ${t.name} » à zéro ? L'équipe repart du début${t0 ? ' (chrono relancé maintenant pour elle)' : ''}.`)) return; t.splits = []; t.total = 0; t.off = t0 ? performance.now() - t0 : 0; draw(); };
  // nouvelle course avec les mêmes équipes : la course en cours est enregistrée (si des passages ont eu lieu) puis tout repart de zéro
  const newRun = (only, keepSave) => { const T = only ? [only] : teams, any = T.some(t => t.splits.length);
    if (any && keepSave) { try { saveCourse(only || null); } catch (e) {} }
    T.forEach(t => { t.splits = []; t.total = 0; t.off = 0; }); t0 = null; saved = {}; resDone = new Set(); if (any) run++;
    const tm = $('#tm'); if (tm) tm.textContent = '00:00,00'; draw(); };
  const resetAll = keepSave => { if (!confirm(keepSave ? 'Enregistrer cette course puis recommencer à zéro avec les mêmes équipes ?' : 'Remettre TOUS les chronos à zéro SANS enregistrer (équipes conservées) ?')) return; newRun(null, keepSave); };
  const finished = () => teams.filter(t => t.splits.length === legs).sort((a, b) => a.total - b.total);
  const pass = t => { const now = performance.now() - t0 - (t.off || 0), prev = t.splits.reduce((a, c) => a + c, 0);
    if (now - prev < 300) return; t.splits.push(now - prev); if (t.splits.length === legs) { t.total = now; beep(1200, .3); } else beep(900, .08); draw();
    const ot = onlyT(); if (ot ? ot.splits.length === legs : teams.every(x => x.splits.length === legs)) setTimeout(() => { try { saveCourse(ot || null); } catch (e) {} }, 400); };   // course terminée : enregistrée automatiquement
  const ZH = ['Fraction (m)', 'Zone de transmission (m)', 'Zone d\'élan (m)'], zCsv = (d, t, e) => [d ? mF(d) : '', mF(t), mF(e)];
  const exportCsv = list => { const fin = finished(); download(`relais-${today()}.csv`, csv([['Rang', 'Équipe', 'Temps', ...ZH, ...Array.from({ length: legs }, (_, k) => 'Relais ' + (k + 1))],
    ...list.map(t => [fin.indexOf(t) + 1 || '', t.name, t.total ? fmt(t.total) : '', ...zCsv(dist, zt, ze), ...t.splits.map(s => fmt(s))])])); };
  // Enregistrement : toute la course (vue enseignant) ou la seule équipe de la tablette
  const rkTxt = r => r === 1 ? '1er' : r + 'e';
  const legsOf = (t, k) => { const M = (t.members || []).length; return M && t.legs.length && legs % M === 0 ? t.legs.filter((s, j) => j % M === k).map(s => fmt(s)).join(' + ') : ''; };
  const saveCourse = only => {
    if (!t0) return toast('Donnez d\'abord le départ');
    const list = only ? [only] : teams, fin = finished(), key = only ? 'T:' + only.name : '*';
    const rec = { id: saved[key] || uid(), date: today(), at: Date.now(), run, classe: cls, legs, dist: dist || 0, zt, ze,
      teams: list.map(t => ({ name: t.name, members: t.members || [], total: t.splits.length === legs ? Math.round(t.total) : 0, legs: t.splits.map(s => Math.round(s)) })) };
    const C = DB.relais.courses, i = C.findIndex(x => x.id === rec.id); if (i >= 0) C[i] = rec; else C.push(rec); saved[key] = rec.id;
    let n = 0;
    if (cls) rec.teams.forEach(t => { if (!t.total || resDone.has(t.name)) return; resDone.add(t.name);
      const rk = only ? 0 : fin.findIndex(x => x.name === t.name) + 1;
      t.members.forEach((m, k) => { const lg = legsOf(t, k);
        saveResult({ tool: 'relais', label: 'Relais', classe: cls, eleve: m, valeur: fmt(t.total), detail: [t.name, run > 1 ? `course ${run}` : '', rk ? `rang ${rkTxt(rk)} / ${teams.length}` : '', lg ? `son relais : ${lg}` : '', `zones : transmission ${mF(zt)} m, élan ${mF(ze)} m`].filter(Boolean).join(' · ') }); n++; }); });
    if (!n) { save(); window.syncFlush && window.syncFlush(); }
    beep(1000, .1); toast(`Course enregistrée ✔${n ? ` · ${n} résultat(s) élève` : ''}`); draw();
  };
  // Historique : courses du même jour, même classe, même nombre de relais = une seule course (affichage seulement)
  const groupsOf = () => { const G = [];
    DB.relais.courses.filter(c => !window.teamSees || teamSees(c)).sort((a, b) => (a.at || 0) - (b.at || 0)).forEach(c => { const rn = c.run || 1, g = c.classe && G.find(x => x.classe === c.classe && x.date === c.date && x.legs === c.legs && x.run === rn);
      if (g) g.recs.push(c); else G.push({ date: c.date, classe: c.classe, legs: c.legs, run: rn, recs: [c] }); });
    G.forEach(g => { const M = new Map(); g.recs.forEach(r => (r.teams || []).forEach(t => M.set(t.name, t))); // même équipe enregistrée 2 fois : la plus récente
      g.dist = (g.recs.find(r => r.dist) || {}).dist || 0; Object.assign(g, zOf(g.recs.slice().reverse().find(r => r.zt != null) || {})); g.teams = [...M.values()].sort((a, b) => (a.total || Infinity) - (b.total || Infinity) || b.legs.length - a.legs.length); });
    return G.sort((a, b) => b.recs[b.recs.length - 1].at - a.recs[a.recs.length - 1].at); };
  const groupCsv = g => download(`relais-${g.date}${g.classe ? '-' + g.classe.replace(/[^\w-]+/g, '_') : ''}.csv`, csv([['Rang', 'Équipe', 'Temps', 'Élèves', ...ZH, ...Array.from({ length: g.legs }, (_, k) => 'Relais ' + (k + 1))],
    ...g.teams.map((t, i) => [t.total ? i + 1 : '', t.name, t.total ? fmt(t.total) : '', (t.members || []).join(', '), ...zCsv(g.dist, g.zt, g.ze), ...(t.legs || []).map(s => fmt(s))])]));
  const drawHist = () => { const G = groupsOf(), h = $('#hist');
    h.innerHTML = G.length ? `<div class="section-title"><h2>Courses enregistrées</h2></div>` + G.map((g, gi) => `<div class="card" style="margin-top:10px">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div><b>${frDate(g.date)}${g.classe ? ' · ' + esc(g.classe) : ''}${G.filter(x => x.date === g.date && x.classe === g.classe).length > 1 ? ' · course ' + g.run : ''}</b>
        <div class="muted" style="font-size:.8rem">${g.legs} relais${g.dist ? ` × ${g.dist} m` : ''} · ${g.teams.length} équipe(s) · transmission ${mF(g.zt)} m · élan ${mF(g.ze)} m${g.recs.length > 1 ? ` · ${g.recs.length} enregistrements fusionnés` : ''}</div></div>
        <div style="display:flex;gap:6px;flex:0 0 auto"><button class="btn btn-ghost" style="padding:7px 10px" data-hx="${gi}">📤</button><button class="btn btn-ghost" style="padding:7px 10px" data-hd="${gi}" data-cfg="bare">🗑</button></div></div>
      <details style="margin-top:6px"><summary style="cursor:pointer;font-weight:800;font-size:.88rem" data-hc="${gi}">🏅 Classements détaillés (équipes et élèves)</summary><div data-hch="${gi}"></div></details>
      ${g.teams.map((t, i) => `<div style="display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-top:1px solid var(--line)"><div><b>${t.total ? (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1 + 'e') + ' ' : ''}${esc(t.name)}</b>${(t.members || []).length ? `<div class="muted" style="font-size:.78rem">${esc(t.members.join(', '))}</div>` : ''}</div>
        <span style="font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap">${t.total ? fmt(t.total) : `<span class="muted">${t.legs.length}/${g.legs} relais</span>`}</span></div>`).join('')}</div>`).join('') : '';
    h.querySelectorAll('[data-hx]').forEach(b => b.onclick = () => groupCsv(G[b.dataset.hx]));
    h.querySelectorAll('[data-hc]').forEach(sm => sm.onclick = () => { const host = h.querySelector(`[data-hch="${sm.dataset.hc}"]`); if (host && !host.dataset.on) { host.dataset.on = 1; window.relSeanceClassMount(host, G[sm.dataset.hc]); } });
    { const cl = [...new Set(DB.relais.courses.filter(c => c.classe && (!window.teamSees || teamSees(c))).map(c => c.classe))];
      if (cl.length) { const sv = document.createElement('div'); sv.className = 'card'; sv.style.marginTop = '12px';
        sv.innerHTML = `<h3 style="margin-top:0">🧑‍🎓 Suivi par élève (séance par séance)</h3><div class="row"><div><label>Classe</label><select id="rsc">${cl.map(c => `<option>${esc(c)}</option>`).join('')}</select></div><div><label>Élève</label><select id="rss"></select></div></div><div id="rsb"></div>`;
        h.appendChild(sv); const fillS = () => { const c = sv.querySelector('#rsc').value, ns = [...new Set(relGroups(c).flatMap(g => g.teams.flatMap(t => t.members || [])))].sort((a, b) => a.localeCompare(b, 'fr')); sv.querySelector('#rss').innerHTML = ns.length ? ns.map(n => `<option>${esc(n)}</option>`).join('') : '<option value="">Aucun élève rattaché aux équipes</option>'; showS(); };
        const showS = () => { const c = sv.querySelector('#rsc').value, n = sv.querySelector('#rss').value; sv.querySelector('#rsb').innerHTML = n ? window.relSuiviHTML(c, n) : '<p class="muted">Composez les équipes depuis une classe pour suivre chaque élève.</p>'; };
        sv.querySelector('#rsc').onchange = fillS; sv.querySelector('#rss').onchange = showS; fillS(); } }
    h.querySelectorAll('[data-hd]').forEach(b => b.onclick = () => { const g = G[b.dataset.hd], ids = new Set(g.recs.map(r => r.id));
      if (!confirm(`Supprimer la course du ${frDate(g.date)}${g.classe ? ' (' + g.classe + ')' : ''} ?`)) return;
      DB.relais.courses = DB.relais.courses.filter(r => !ids.has(r.id)); Object.keys(saved).forEach(k => ids.has(saved[k]) && delete saved[k]);
      save(); window.syncFlush && window.syncFlush(); drawHist(); });
  };
  // Vue « une seule équipe » : ce que voient les élèves sur leur tablette
  const drawTeam = t => {
    const done = t.splits.length === legs, n = t.splits.length;
    $('#gv').innerHTML = `<div class="card" style="text-align:center"><div style="font-weight:900;font-size:1.3rem">${esc(t.name)}</div>${memLine(t)}<div class="muted">${legs} relayeur${legs > 1 ? 's' : ''}${dist ? ` · ${dist} m par fraction` : ''}</div><div class="muted" style="font-size:.85rem">Zone de transmission ${mF(zt)} m · zone d'élan ${mF(ze)} m</div>
        <div class="gv-clock" id="gvt" style="color:${done ? '#1B9E5A' : 'inherit'}">${done ? fmt(t.total) : t0 ? fmt(performance.now() - t0 - (t.off || 0)) : '00:00,00'}</div>
        <div style="display:flex;gap:6px;justify-content:center;margin:6px 0">${Array.from({ length: legs }, (_, k) => `<span style="flex:0 1 44px;height:12px;border-radius:99px;background:${k < n ? '#1B9E5A' : k === n && t0 ? 'var(--blue)' : 'var(--line)'}"></span>`).join('')}</div>
        ${!t0 ? '<button class="btn btn-grad btn-block gv-big" id="gv-go">🔫 Départ</button>' : ''}
        ${t0 && !done ? `<button class="btn ${n === legs - 1 ? 'btn-danger' : 'btn-grad'} btn-block" id="gv-pass" style="margin-top:12px;font-size:1.5rem;padding:26px 16px">${n === legs - 1 ? '🏁 Arrivée' : `➡️ Passage ${n + 1} / ${legs}`}</button><div class="muted" style="margin-top:6px">Relayeur ${n + 1} en course</div>` : ''}
        ${done ? '<div style="margin-top:8px;font-weight:800">✅ Course terminée</div>' : ''}${n ? '<div style="margin-top:10px"><button class="btn btn-ghost" id="gv-un" style="padding:8px 12px">↩ Annuler le dernier passage</button></div>' : ''}${done ? '<div style="margin-top:10px"><button class="btn btn-grad btn-block" id="gv-nr">🔁 Nouvelle course (même équipe)</button></div>' : ''}${t0 ? '<div data-cfg="bare" style="margin-top:6px"><button class="btn btn-ghost" id="gv-rz" style="padding:8px 12px">⟲ Remettre l\'équipe à zéro</button></div>' : ''}</div>
      ${n ? `<div class="card" style="margin-top:10px">${t.splits.map((s, k) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:1.1rem"><b>Relayeur ${k + 1}</b><span style="font-weight:800;font-variant-numeric:tabular-nums">${fmt(s)}${dist ? ` <span class="muted" style="font-size:.85rem">(${(dist / (s / 1000) * 3.6).toFixed(1)} km/h)</span>` : ''}</span></div>`).join('')}</div>` : ''}
      ${n ? '<button class="btn btn-grad btn-block" style="margin-top:12px" id="gv-exp">📤 Résultats de l\'équipe</button>' : ''}
      ${t0 ? `<button class="btn btn-ghost btn-block" style="margin-top:8px" id="gv-sv">💾 ${saved['T:' + t.name] ? 'Enregistrer à nouveau' : 'Enregistrer la course'}</button>` : ''}
      <div style="text-align:center;margin:18px 0 6px"><button class="link" id="gv-prof">🔒 Mode enseignant</button></div>`;
    if ($('#gv-go')) $('#gv-go').onclick = () => { if (t0) return; t0 = performance.now(); beep(1500, .35); draw(); };
    if ($('#gv-pass')) $('#gv-pass').onclick = () => pass(t);
    if ($('#gv-nr')) $('#gv-nr').onclick = () => newRun(t, true); if ($('#gv-un')) $('#gv-un').onclick = () => undoLast(t); if ($('#gv-rz')) $('#gv-rz').onclick = () => resetTeam(t);
    if ($('#gv-exp')) $('#gv-exp').onclick = () => exportCsv([t]);
    if ($('#gv-sv')) $('#gv-sv').onclick = () => saveCourse(t);
    $('#gv-prof').onclick = () => { if (!confirm('Passer en mode enseignant (toutes les équipes, réglages) ?')) return; setOnly(null); draw(); };
  };
  // prénoms des élèves sous le nom de l'équipe (« Léa D. · Tom M. ») ; le relayeur en course est en gras
  const memLine = t => { const M = t.members || []; if (!M.length) return ''; const cur = t.splits.length < legs && t0 ? t.splits.length % M.length : -1;
    return `<div class="muted" style="font-size:.78rem;line-height:1.35;margin:2px 0 4px">${M.map((m, k) => k === cur ? `<b style="color:var(--blue,#1E5BD8)">▶ ${esc(nameShort(m))}</b>` : esc(nameShort(m))).join(' · ')}</div>`; };
  const draw = () => {
    const ot = onlyT(); $('#race').style.display = ot ? 'none' : 'block'; $('#gv').style.display = ot ? 'block' : 'none';
    [...el.children].forEach(c => { if (!['setup', 'race', 'gv'].includes(c.id)) c.style.display = ot ? 'none' : ''; }); // carte « Composer les équipes » masquée aux élèves
    if (ot) return drawTeam(ot);
    $('#gv').innerHTML = ''; drawHist();
    const zk = [legs, dist, zt, ze].join('|'); if ($('#zhd').dataset.k !== zk) { $('#zhd').dataset.k = zk;
      $('#zhd').innerHTML = `<div style="font-weight:800;font-size:.95rem">🔁 ${legs} relais${dist ? ` × ${mF(dist)} m` : ''} <span class="muted" style="font-weight:600">· transmission ${mF(zt)} m · élan ${mF(ze)} m</span></div>${zBlock(legs, dist, zt, ze, false)}`; } $('#sv').textContent = saved['*'] ? '💾 Enregistrer à nouveau' : '💾 Enregistrer la course';
    $('#onw').innerHTML = teams.length > 1 ? `<label>📱 Tablette d'une équipe (les élèves ne verront que leur équipe)</label><select id="only"><option value="">Toutes les équipes</option>${teams.map((t, i) => `<option value="${i}">${esc(t.name)}</option>`).join('')}</select>` : '';
    if ($('#only')) $('#only').onchange = ev => { if (ev.target.value === '') return; setOnly(teams[+ev.target.value].name); draw(); };
    const fin = finished();
    $('#rg').innerHTML = teams.map((t, i) => { const done = t.splits.length === legs, rk = fin.indexOf(t) + 1;
      return `<div class="relay ${done ? 'done' : ''}"><b>${esc(t.name)}</b> ${memLine(t)} ${done ? `<span class="rk">${rk === 1 ? '🥇' : rk === 2 ? '🥈' : rk === 3 ? '🥉' : rk + 'e'}</span>` : ''}
      <div class="t" data-t="${i}">${done ? fmt(t.total) : '00:00,00'}</div>
      <div class="legs">${t.splits.map((s, k) => `R${k + 1} ${fmt(s)}${dist ? ` (${(dist / (s / 1000) * 3.6).toFixed(1)} km/h)` : ''}`).join(' · ')}</div>
      <button class="btn ${done ? 'btn-ghost' : 'btn-grad'} btn-block" style="margin-top:8px" data-i="${i}" ${done || !t0 ? 'disabled' : ''}>${done ? 'Arrivée ✔' : t.splits.length === legs - 1 ? '🏁 Arrivée' : `➡️ Passage ${t.splits.length + 1}/${legs}`}</button>
      ${t.splits.length || t0 ? `<div style="display:flex;gap:6px;margin-top:6px">${t.splits.length ? `<button class="btn btn-ghost" style="flex:1;padding:7px 6px;font-size:.8rem" data-un="${i}">↩ Annuler passage</button>` : ''}${t0 ? `<button class="btn btn-ghost" style="flex:1;padding:7px 6px;font-size:.8rem" data-rz="${i}" data-cfg="bare">⟲ Équipe à zéro</button>` : ''}</div>` : ''}</div>`; }).join('');
    $('#rg').querySelectorAll('[data-i]').forEach(b => b.onclick = () => pass(teams[b.dataset.i]));
    $('#rg').querySelectorAll('[data-un]').forEach(b => b.onclick = () => undoLast(teams[b.dataset.un]));
    $('#rg').querySelectorAll('[data-rz]').forEach(b => b.onclick = () => resetTeam(teams[b.dataset.rz]));
  };
  const tick = () => { raf = requestAnimationFrame(tick); if (!t0) return; const now = performance.now() - t0; $('#tm').textContent = fmt(now);
    teams.forEach((t, i) => { if (t.splits.length < legs) { const d = $(`[data-t="${i}"]`); if (d) d.textContent = fmt(now - (t.off || 0)); } });
    const ot = onlyT(), g = $('#gvt'); if (ot && g && ot.splits.length < legs) g.textContent = fmt(now - (ot.off || 0)); };
  $('#gen').onclick = () => { const n = namesFrom('tl'); if (!n.length) return toast('Ajoutez des équipes'); legs = Math.max(1, +$('#lg').value || 1); dist = +$('#ds').value || 0;
    zt = zNum($('#zt').value, ZD.zt) || ZD.zt; ze = zNum($('#ze').value, ZD.ze); TB().relaisZones = { zt, ze };
    // équipes issues du module « Composer les équipes » : on retrouve la classe et les élèves de chaque équipe
    const c = fromCls ? (el.querySelector('#crelais-cls') || {}).value || '' : '', P = c && (DB.prepGroups || {})['crelais|' + c];
    teams = n.map(name => { const g = P && P.teams.find(x => x.name === name); return { name, splits: [], total: 0, members: g ? g.members.map(m => m.n) : [] }; });
    cls = teams.some(t => t.members.length) ? c : ''; saved = {}; resDone = new Set(); run = 1; t0 = null; setOnly(null); $('#setup').style.display = 'none'; $('#race').style.display = 'block'; $('#tm').textContent = '00:00,00'; draw(); };
  $('#go').onclick = () => { if (t0) return; t0 = performance.now(); beep(1500, .35); draw(); };
  $('#new').onclick = () => { if (!t0 || confirm('Abandonner cette course ?')) { t0 = null; $('#setup').style.display = 'block'; $('#race').style.display = 'none'; } };
  $('#exp').onclick = () => exportCsv(teams); $('#rsa').onclick = () => resetAll(false); $('#nrun').onclick = () => resetAll(true);
  $('#edt').onclick = () => editGroupsPanel('Équipes du relais', { cls: cls || '', list: () => teams, names: t => t.members || (t.members = []),
    take: (t, n) => { const i = (t.members || []).indexOf(n); if (i >= 0) t.members.splice(i, 1); return null; },
    put: (t, n) => { (t.members = t.members || []).push(n); },
    make: name => ({ name, splits: [], total: 0, members: [], off: t0 ? performance.now() - t0 : 0 }),
    onChange: () => {}, onClose: () => { const tl = $('#tl'); if (tl) tl.value = teams.map(t => t.name).join('\n'); draw(); } });
  $('#sv').onclick = () => saveCourse(null);
  // la carte « Composer les équipes » (ajoutée par niveaux.js) remplit #tl : on note que les équipes viennent d'une classe
  el.addEventListener('click', ev => { if (ev.target.closest('#crelais-go,#crelais-use')) fromCls = true; });
  $('#tl').addEventListener('input', () => { fromCls = false; cnt(); });
  const cnt = () => { const n = namesFrom('tl').length; $('#tcnt').innerHTML = `<b>${n}</b> équipe${n > 1 ? 's' : ''} (aucune limite) · si vous composez les équipes depuis une classe, validez avec « Former les équipes et les utiliser » : la liste ci-dessus se met à jour.`; };
  el.addEventListener('click', () => setTimeout(cnt, 80)); cnt();
  ['#lg', '#ds', '#zt', '#ze'].forEach(s => $(s).addEventListener('input', zPrev)); zPrev();
  drawHist(); tick(); return () => cancelAnimationFrame(raf);
},

/* ---------- Journal de musculation ---------- */
journal(el) {
  const EX = ['Squat', 'Développé couché', 'Soulevé de terre', 'Tirage horizontal', 'Presse à cuisses', 'Fentes', 'Pompes', 'Gainage', 'Tractions', 'Développé militaire', 'Curl biceps', 'Extension triceps'];
  el.innerHTML = `<div class="card"><h3>Nouvelle séance / exercice</h3>
    <div class="row"><div><label>Élève</label><input id="el" list="dle" placeholder="Nom"></div><div><label>Date</label><input id="dt" type="date" value="${today()}"></div></div>
    <label>Exercice</label><input id="ex" list="dlx" placeholder="ex : Squat">
    <div class="row"><div><label>Charge (kg)</label><input id="ch" type="number" step="0.5"></div><div><label>Séries</label><input id="se" type="number" value="3"></div><div><label>Répét.</label><input id="re" type="number" value="10"></div></div>
    <div class="row"><div><label>Ressenti (1 facile → 10 max)</label><input id="rp" type="range" min="1" max="10" value="6"></div><div style="flex:0 0 50px;text-align:center;padding-top:30px;font-weight:900" id="rpv">6</div></div>
    <label>Remarque</label><input id="nt" placeholder="Placement, sensations…">
    <button class="btn btn-grad btn-block" style="margin-top:12px" id="add">＋ Ajouter au journal</button></div>
    <datalist id="dle"></datalist><datalist id="dlx">${EX.map(e => `<option value="${e}">`).join('')}</datalist>
    <div class="section-title"><h2>Journal</h2><button class="link" id="exp">Exporter CSV</button></div>
    <select id="fl"></select><div class="card" style="padding:0;margin-top:10px" id="ls"></div>`;
  const $ = s => el.querySelector(s);
  $('#rp').oninput = () => $('#rpv').textContent = $('#rp').value;
  // mode Équipe : on masque le carnet des élèves des classes d'un collègue
  const jSee = j => { if (!window.teamSees || teamSees(j)) { if (!window.activeProf || !activeProf() || j.prof) return true; const raw = dbGet('classes') || []; const cs = raw.filter(c => (c.students || []).includes(j.eleve)); return !cs.length || cs.some(c => teamSees(c.name)); } return false; };
  const draw = () => {
    const names = [...new Set([...DB.journal.filter(jSee).map(j => j.eleve), ...DB.classes.flatMap(c => c.students)])].sort();
    $('#dle').innerHTML = names.map(n => `<option value="${esc(n)}">`).join('');
    const cur = $('#fl').value, used = [...new Set(DB.journal.filter(jSee).map(j => j.eleve))].sort();
    $('#fl').innerHTML = '<option value="">Tous les élèves</option>' + used.map(n => `<option ${n === cur ? 'selected' : ''}>${esc(n)}</option>`).join('');
    const list = DB.journal.map((j, i) => ({ ...j, i })).filter(j => jSee(j) && (!$('#fl').value || j.eleve === $('#fl').value)).sort((a, b) => b.date.localeCompare(a.date));
    $('#ls').innerHTML = list.map(j => `<div class="list-item"><div style="flex:1"><b>${esc(j.exercice)}</b> — ${j.charge || 0} kg · ${j.series}×${j.reps} <span class="pill">RPE ${j.rpe}</span>
      <div class="muted">${esc(j.eleve)} · ${frDate(j.date)} · volume ${Math.round((j.charge || 0) * j.series * j.reps)} kg${j.note ? ' · ' + esc(j.note) : ''}</div></div><button class="btn btn-ghost" data-d="${j.i}" data-cfg="bare">🗑</button></div>`).join('') || '<div class="empty">Journal vide.</div>';
    $('#ls').querySelectorAll('[data-d]').forEach(b => b.onclick = () => { DB.journal.splice(b.dataset.d, 1); save(); draw(); });
  };
  $('#fl').onchange = draw;
  $('#add').onclick = () => {
    const eleve = $('#el').value.trim(), exercice = $('#ex').value.trim(); if (!eleve || !exercice) return toast('Élève et exercice requis');
    DB.journal.push((window.teamTag || (o => o))({ eleve, date: $('#dt').value, exercice, charge: +$('#ch').value || 0, series: +$('#se').value || 0, reps: +$('#re').value || 0, rpe: +$('#rp').value, note: $('#nt').value.trim() }));
    save(); $('#nt').value = ''; toast('Ajouté ✔'); draw();
  };
  $('#exp').onclick = () => download(`journal-muscu-${today()}.csv`, csv([['Élève', 'Date', 'Exercice', 'Charge', 'Séries', 'Répétitions', 'Ressenti', 'Volume', 'Remarque'],
    ...DB.journal.filter(jSee).map(j => [j.eleve, frDate(j.date), j.exercice, j.charge, j.series, j.reps, j.rpe, (j.charge || 0) * j.series * j.reps, j.note])]));
  draw();
},

/* ---------- Grilles d'évaluation ---------- */
grilles(el) {
  const LV = [{ l: 'Non acquis', k: 0 }, { l: 'Fragile', k: 1 / 3 }, { l: 'Acquis', k: 2 / 3 }, { l: 'Expert', k: 1 }];
  const scoreOf = (g, ev) => { const tot = g.criteria.reduce((a, c) => a + c.pts, 0); let s = 0, n = 0;
    g.criteria.forEach((c, i) => { if (ev?.[i] != null) { s += c.pts * LV[ev[i]].k; n++; } }); return { s, tot, n, sur20: tot ? s / tot * 20 : 0 }; };
  const list = () => {
    el.innerHTML = `<div class="card"><h3>Mes grilles</h3><div id="gl"></div><button class="btn btn-grad btn-block" style="margin-top:12px" id="new">＋ Nouvelle grille</button></div>`;
    el.querySelector('#gl').innerHTML = DB.grilles.map((g, i) => `<div class="list-item"><div style="flex:1"><b>${esc(g.name)}</b><div class="muted">${g.criteria.length} critères · sur ${g.criteria.reduce((a, c) => a + c.pts, 0)} pts</div></div>
      <button class="btn btn-grad" data-v="${i}">Évaluer</button><button class="btn btn-ghost" data-e="${i}">✏️</button></div>`).join('') || '<div class="empty">Aucune grille. Créez-en une !</div>';
    el.querySelector('#new').onclick = () => edit(null);
    el.querySelectorAll('[data-e]').forEach(b => b.onclick = () => edit(+b.dataset.e));
    el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => evaluate(+b.dataset.v));
  };
  const edit = i => {
    const g = i != null ? DB.grilles[i] : { name: 'Demi-fond — 3×500 m', criteria: [{ label: 'Performance / VMA', pts: 8 }, { label: 'Respect du projet de course', pts: 6 }, { label: 'Analyse de sa course', pts: 4 }, { label: 'Rôle d\'observateur', pts: 2 }], evals: {} };
    el.innerHTML = `<div class="card"><h3>${i != null ? 'Modifier' : 'Nouvelle'} grille</h3><label>Nom</label><input id="gn" value="${esc(g.name)}">
      <label>Critères — un par ligne : « Critère ; points »</label><textarea id="gc" style="min-height:150px">${esc(g.criteria.map(c => c.label + ' ; ' + c.pts).join('\n'))}</textarea>
      <p class="muted">Niveaux : Non acquis (0) · Fragile (⅓) · Acquis (⅔) · Expert (100 %) des points du critère.</p>
      <div class="row"><button class="btn btn-grad" id="sv">💾 Enregistrer</button><button class="btn btn-ghost" id="bk">Annuler</button>${i != null ? '<button class="btn btn-danger" id="dl">Supprimer</button>' : ''}</div></div>`;
    el.querySelector('#bk').onclick = list;
    if (i != null) el.querySelector('#dl').onclick = () => { if (confirm('Supprimer la grille et ses évaluations ?')) { DB.grilles.splice(i, 1); save(); list(); } };
    el.querySelector('#sv').onclick = () => {
      const criteria = el.querySelector('#gc').value.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const [a, b] = l.split(';'); return { label: a.trim(), pts: +(b || '').replace(',', '.') || 1 }; });
      if (!criteria.length) return toast('Ajoutez au moins un critère');
      const ng = { ...g, name: el.querySelector('#gn').value.trim() || 'Grille', criteria };
      if (i != null) DB.grilles[i] = ng; else DB.grilles.push(ng); save(); toast('Grille enregistrée ✔'); list();
    };
  };
  const evaluate = gi => {
    const g = DB.grilles[gi]; if (!DB.classes.length) { el.innerHTML = noClassMsg; return; }
    let cls = DB.classes[0].name, si = 0;
    const draw = () => {
      const st = studentsOf(cls); g.evals[cls] = g.evals[cls] || {}; const E = g.evals[cls];
      const name = st[si], ev = E[name] || {}, sc = scoreOf(g, ev);
      el.innerHTML = `<div class="card"><div class="row" style="align-items:end"><div><label>Classe</label>${classNameSelect('cl')}</div><button class="btn btn-ghost" style="flex:0 0 auto" id="bk">← Grilles</button></div>
        <div class="row" style="margin-top:12px;align-items:center"><button class="btn btn-ghost" style="flex:0 0 52px" id="pv">◀</button>
        <select id="se">${st.map((n, k) => `<option value="${k}" ${k === si ? 'selected' : ''}>${E[n] && Object.keys(E[n]).length === g.criteria.length ? '✔ ' : ''}${esc(n)}</option>`).join('')}</select>
        <button class="btn btn-ghost" style="flex:0 0 52px" id="nx">▶</button></div></div>
        <div class="card" style="margin-top:12px"><div style="display:flex;justify-content:space-between;align-items:center"><h3>${esc(name || '—')}</h3><span class="pill ok" style="font-size:.95rem">${sc.sur20.toFixed(1)} / 20</span></div>
        ${g.criteria.map((c, k) => `<div class="crit"><b>${esc(c.label)}</b> <span class="muted">(${c.pts} pts)</span><div class="lvl">${LV.map((l, x) => `<button data-c="${k}" data-l="${x}" class="${ev[k] === x ? 'on' : ''}">${l.l}</button>`).join('')}</div></div>`).join('')}</div>
        <div class="section-title"><h2>Bilan de la classe</h2><button class="link" id="exp">Exporter CSV</button></div>
        <div class="card sheet-table"><table><tr><th>Élève</th><th>/20</th><th>Critères</th></tr>${st.map(n => { const s = scoreOf(g, E[n]); return `<tr><td>${esc(n)}</td><td><b>${s.n ? s.sur20.toFixed(1) : '–'}</b></td><td class="muted">${s.n}/${g.criteria.length}</td></tr>`; }).join('')}</table></div>`;
      const $ = s => el.querySelector(s); $('#cl').value = cls;
      $('#cl').onchange = () => { cls = $('#cl').value; si = 0; draw(); };
      $('#bk').onclick = list; $('#se').onchange = () => { si = +$('#se').value; draw(); };
      $('#pv').onclick = () => { si = Math.max(0, si - 1); draw(); }; $('#nx').onclick = () => { si = Math.min(st.length - 1, si + 1); draw(); };
      el.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { if (!name) return; E[name] = E[name] || {}; const k = +b.dataset.c, x = +b.dataset.l; E[name][k] = E[name][k] === x ? undefined : x; save(); draw(); });
      $('#exp').onclick = () => download(`${g.name}-${cls}.csv`, csv([['Élève', ...g.criteria.map(c => `${c.label} (/${c.pts})`), 'Total', 'Note /20'],
        ...st.map(n => { const e = E[n] || {}, s = scoreOf(g, e); return [n, ...g.criteria.map((c, k) => e[k] != null ? (c.pts * LV[e[k]].k).toFixed(2).replace('.', ',') : ''), s.s.toFixed(2).replace('.', ','), s.n ? s.sur20.toFixed(1).replace('.', ',') : '']; })]));
    };
    draw();
  };
  list();
},

/* ---------- Tableau de suivi ---------- */
suivi(el) {
  if (!DB.classes.length) { el.innerHTML = noClassMsg; return; }
  el.innerHTML = `<div class="card"><label>Classe</label>${classNameSelect('cl')}
    <div class="row" style="margin-top:10px" data-cfg="bare"><input id="ct" placeholder="Nouvelle colonne (ex : Test Luc Léger)"><input id="cd" type="date" value="${today()}" style="flex:0 0 150px"></div>
    <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="add" data-cfg="bare">＋ Ajouter la colonne</button><button class="btn btn-ghost" id="exp">📤 Export CSV</button></div>
    <p class="muted" style="margin:8px 0 0">Saisissez des nombres (notes, temps, paliers…) ou du texte (observations). La moyenne se calcule sur les valeurs numériques.</p></div>
    <div class="card sheet-table" id="tb" style="margin-top:12px"></div>`;
  const $ = s => el.querySelector(s);
  const data = () => (DB.suivi[$('#cl').value] = DB.suivi[$('#cl').value] || { cols: [], vals: {} });
  const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
  const avg = (d, n) => { const xs = d.cols.map((c, k) => num(d.vals[k + '|' + n])).filter(x => x != null); return xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : '–'; };
  const draw = () => {
    const d = data(), st = studentsOf($('#cl').value);
    if (!d.cols.length) { $('#tb').innerHTML = '<div class="empty">Ajoutez une première colonne pour commencer.</div>'; return; }
    $('#tb').innerHTML = `<table><tr><th>Élève</th>${d.cols.map((c, k) => `<th>${esc(c.title)}<br><span style="font-weight:500">${frDate(c.date)}</span> <button data-x="${k}" data-cfg="bare" title="Supprimer">✕</button></th>`).join('')}<th>Moy.</th></tr>
      ${st.map(n => `<tr><td><b>${esc(n)}</b></td>${d.cols.map((c, k) => `<td><input data-k="${k}" data-n="${esc(n)}" value="${esc(d.vals[k + '|' + n] ?? '')}"></td>`).join('')}<td><b data-avg="${esc(n)}">${avg(d, n)}</b></td></tr>`).join('')}</table>`;
    $('#tb').querySelectorAll('input').forEach(i => i.oninput = () => { d.vals[i.dataset.k + '|' + i.dataset.n] = i.value; save(); const a = $('#tb').querySelector(`[data-avg="${CSS.escape(i.dataset.n)}"]`); if (a) a.textContent = avg(d, i.dataset.n); });
    $('#tb').querySelectorAll('[data-x]').forEach(b => b.onclick = () => {
      if (!confirm('Supprimer cette colonne ?')) return; const k = +b.dataset.x, nv = {};
      Object.entries(d.vals).forEach(([key, v]) => { const [c, ...n] = key.split('|'); const ci = +c; if (ci < k) nv[key] = v; else if (ci > k) nv[(ci - 1) + '|' + n.join('|')] = v; });
      d.cols.splice(k, 1); d.vals = nv; save(); draw(); });
  };
  $('#cl').onchange = draw;
  $('#add').onclick = () => { const t = $('#ct').value.trim(); if (!t) return toast('Titre de colonne requis'); data().cols.push({ title: t, date: $('#cd').value }); $('#ct').value = ''; save(); draw(); };
  $('#exp').onclick = () => { const d = data(), st = studentsOf($('#cl').value);
    download(`suivi-${$('#cl').value}-${today()}.csv`, csv([['Élève', ...d.cols.map(c => `${c.title} (${frDate(c.date)})`), 'Moyenne'], ...st.map(n => [n, ...d.cols.map((c, k) => d.vals[k + '|' + n] ?? ''), avg(d, n).replace('.', ',')])])); };
  draw();
},

/* ---------- Questions de débrief ---------- */
debrief(el) {
  const BANK = {
    'Ressenti': ['Comment te sens-tu après cette séance ?', 'Quel moment as-tu préféré aujourd\'hui ? Pourquoi ?', 'Qu\'est-ce qui a été le plus difficile pour toi ?', 'Sur une échelle de 1 à 10, quel effort as-tu fourni ?'],
    'Technique': ['Quel geste as-tu amélioré aujourd\'hui ?', 'Quel conseil donnerais-tu à un camarade pour réussir cet exercice ?', 'Qu\'est-ce que tu dois encore travailler ?', 'Comment sais-tu que ton geste est réussi ?'],
    'Tactique': ['Quelle stratégie a le mieux fonctionné pour ton équipe ?', 'Qu\'aurais-tu fait différemment dans le dernier match ?', 'Comment avez-vous créé le déséquilibre chez l\'adversaire ?', 'Quand fallait-il accélérer ou temporiser ?'],
    'Coopération': ['Comment as-tu aidé un partenaire aujourd\'hui ?', 'Votre groupe a-t-il bien communiqué ? Donne un exemple.', 'Quel rôle as-tu tenu (arbitre, observateur, coach) ? Qu\'as-tu appris ?', 'Qu\'est-ce qui rend une équipe efficace ?'],
    'Sécurité & santé': ['Pourquoi s\'échauffe-t-on avant l\'effort ?', 'Quelle règle de sécurité était essentielle aujourd\'hui ?', 'Comment as-tu géré ta respiration pendant l\'effort ?', 'Que faire pour bien récupérer ce soir ?'],
    'Progrès': ['Qu\'as-tu appris de nouveau aujourd\'hui ?', 'Quel est ton objectif pour la prochaine séance ?', 'Qu\'est-ce qui t\'a fait progresser ?', 'Qu\'as-tu réussi aujourd\'hui que tu ne savais pas faire avant ?'],
  };
  let cat = '', last = '';
  const all = () => { const b = Object.entries(BANK).flatMap(([c, qs]) => qs.map(q => ({ c, q }))); return [...b, ...DB.debrief.map(q => ({ c: 'Mes questions', q }))]; };
  const draw = () => {
    const cats = ['', ...Object.keys(BANK), ...(DB.debrief.length ? ['Mes questions'] : [])];
    el.innerHTML = `<div class="chips">${cats.map(c => `<button class="chip ${c === cat ? 'active' : ''}" data-c="${esc(c)}">${c || '✨ Toutes'}</button>`).join('')}</div>
      <div class="card" style="margin-top:8px"><div class="question" id="q">${esc(last) || '💬'}</div><button class="btn btn-grad btn-block" id="go">🎲 Question au hasard</button></div>
      <div class="section-title"><h2>Mes questions</h2></div>
      <div class="card" data-cfg><div class="row"><input id="nq" placeholder="Ajouter ma question…"><button class="btn btn-grad" style="flex:0 0 auto" id="add">＋</button></div>
      ${DB.debrief.map((q, i) => `<div class="list-item" style="padding:10px 0"><span>${esc(q)}</span><button class="btn btn-ghost" data-d="${i}">🗑</button></div>`).join('')}</div>`;
    el.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { cat = b.dataset.c; draw(); });
    el.querySelector('#go').onclick = () => { const pool = all().filter(x => !cat || x.c === cat).map(x => x.q).filter(q => q !== last); if (!pool.length) return; last = pool[Math.floor(Math.random() * pool.length)]; el.querySelector('#q').textContent = last; beep(900, .08); };
    el.querySelector('#add').onclick = () => { const q = el.querySelector('#nq').value.trim(); if (!q) return; DB.debrief.push(q); save(); draw(); };
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { DB.debrief.splice(b.dataset.d, 1); save(); draw(); });
  };
  draw();
},
});
