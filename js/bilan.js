/* =========================================================
   EPS ONE — 📊 Bilan (fichier HTML en couleurs : camemberts, tableaux par classe et par outil)
   Le fichier est fabriqué au moment du clic à partir de DB.resultats : rien n'est stocké dans l'appli.
   ========================================================= */
const BIL_COLS = ['#1E5BD8', '#C9A227', '#1B9E5A', '#E0892F', '#8E44AD', '#D64545', '#0B2A5B', '#16A3A3', '#9C7A1E', '#5B8DEF', '#B0127A', '#4F6D7A'];

function bilanPie(seg, size = 150) {
  seg = seg.filter(x => x.v > 0); const tot = seg.reduce((a, x) => a + x.v, 0); if (!tot) return '';
  const R = 56, cx = 60, cy = 60, pt = (a, r = R) => [(cx + r * Math.cos(a)).toFixed(2), (cy + r * Math.sin(a)).toFixed(2)]; let a0 = -Math.PI / 2;
  const parts = seg.map(x => { const f = x.v / tot, a1 = a0 + f * 2 * Math.PI, mid = (a0 + a1) / 2, p0 = pt(a0), p1 = pt(a1), pc = Math.round(f * 100), tp = pt(mid, f >= .9999 ? 0 : R * .62);
    const shape = f >= .9999 ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${x.c}"/>` : `<path d="M${cx},${cy} L${p0} A${R},${R} 0 ${f > .5 ? 1 : 0} 1 ${p1} Z" fill="${x.c}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>`;
    const lab = pc >= 7 ? `<text x="${tp[0]}" y="${(+tp[1] + 4).toFixed(2)}" text-anchor="middle" font-size="${pc >= 20 ? 12 : 10}" font-weight="900" fill="#fff" stroke="rgba(0,0,0,.35)" stroke-width=".5" paint-order="stroke">${pc} %</text>` : '';
    a0 = a1; return shape + lab; }).join('');
  return `<div class="pie"><svg viewBox="0 0 120 120" width="${size}" height="${size}">${parts}</svg><div class="lg">${seg.map(x => `<div><i style="background:${x.c}"></i><span>${esc(x.l)}</span><b>${x.v}</b></div>`).join('')}</div></div>`;
}

/* Résultats collectifs (tournois, matchs, HYROX, C.O. par équipes…) et grilles d'évaluation d'une classe */
function bilanExtras(cls, opt) {
  let html = '', nColl = 0, nGr = 0; const esc2 = esc;
  if (opt.coll && typeof epsCollectifs === 'function') {
    const E = epsCollectifs(cls).filter(e => e.rows && e.rows.length); nColl = E.length;
    if (E.length) {
      const kinds = {}; E.forEach(e => { const k = (typeof epsCollSect === 'function' ? epsCollSect(e.k) : e.k).replace(/^[^\p{L}]+/u, ''); kinds[k] = (kinds[k] || 0) + 1; });
      html += `<h3>Résultats collectifs <small>${E.length} événement${E.length > 1 ? 's' : ''}</small></h3><div class="grid2"><div class="card"><h3 class="nb">Événements par type</h3>${bilanPie(Object.entries(kinds).map(([l, v], i) => ({ l, v, c: BIL_COLS[(i + 5) % BIL_COLS.length] })))}</div></div>`;
      html += E.map(e => { const title = String(e.title || e.event || '').replace(/<[^>]+>/g, ''), sub = String(e.sub || '').replace(/<[^>]+>/g, ''), lead = String(e.lead || '').replace(/<[^>]+>/g, '');
        const med = r => r === '' || r == null ? '–' : typeof r === 'number' ? (r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : r) : r;
        return `<div class="ev"><div class="evh"><b>${esc2(title)}</b><span>${esc2(sub || new Date(e.date).toLocaleDateString('fr-FR'))}</span></div>${lead ? `<div class="lead">${esc2(lead)}</div>` : ''}
          <div class="sc"><table><tr><th>#</th><th class="l">Équipe / élève</th><th class="l">Membres</th><th class="l">Résultat</th></tr>${e.rows.map(r => `<tr><td>${esc2(String(med(r[0])))}</td><td class="l"><b>${esc2(String(r[1] ?? ''))}</b></td><td class="l d">${esc2(String(r[2] || ''))}</td><td class="l">${esc2(String(r[3] ?? ''))}</td></tr>`).join('')}</table></div></div>`; }).join('');
    }
  }
  (opt.grilles || []).forEach(gi => { const g = (DB.grilles || [])[gi]; if (!g) return; const E = (g.evals || {})[cls] || {}, st = studentsOf(cls) || [];
    const names = [...new Set([...st, ...Object.keys(E)])].filter(n => E[n] && Object.keys(E[n]).length); if (!names.length) return; nGr++;
    const L = grLevels(g), pts = (g.type || 'points') === 'points', nL = L.length, col = x => GR_COLORS[Math.round(x / Math.max(1, nL - 1) * 3)] || '#2F6BD8';
    const tot = g.criteria.reduce((a, c) => a + (c.pts || 0), 0), sc = n => { let s = 0, k = 0; g.criteria.forEach((c, i) => { if (E[n][i] != null) { s += (c.pts || 0) * grK(g, E[n][i]); k++; } }); return { s, k, s20: tot ? s / tot * 20 : 0 }; };
    const dist = L.map((l, x) => ({ l, c: col(x), v: names.reduce((a, n) => a + g.criteria.filter((c, i) => E[n][i] === x).length, 0) }));
    const moy = pts ? names.map(n => sc(n)).filter(s => s.k).reduce((a, s, _, arr) => a + s.s20 / arr.length, 0) : null;
    html += `<h3><span class="dot" style="background:#B0127A"></span>Évaluation · ${esc2(g.name)} <small>${names.length} élève${names.length > 1 ? 's' : ''}${moy != null ? ' · moyenne ' + moy.toFixed(1).replace('.', ',') + ' / 20' : ''}</small></h3>
      <div class="grid2"><div class="card"><h3 class="nb">Répartition des niveaux</h3>${bilanPie(dist)}</div></div>
      <div class="sc"><table><tr><th class="l">Élève</th>${pts ? '<th>/20</th>' : ''}${g.criteria.map((c, k) => `<th title="${esc2(c.label)}">${esc2(c.label)}${pts ? ` <small>(${c.pts})</small>` : ''}</th>`).join('')}</tr>
      ${names.map(n => { const s = sc(n); return `<tr><td class="l"><b>${esc2(n)}</b></td>${pts ? `<td style="font-weight:900">${s.k ? s.s20.toFixed(1).replace('.', ',') : '–'}</td>` : ''}${g.criteria.map((c, k) => { const v = E[n][k]; return v != null ? `<td style="background:${col(v)};color:#fff;font-weight:700">${esc2(L[v])}</td>` : '<td class="none">–</td>'; }).join('')}</tr>`; }).join('')}</table></div>`; });
  return { html, nColl, nGr };
}

function bilanHTML(opt) {
  const names = Object.fromEntries(TOOLS.map(t => [t.id, t.name])), tName = r => names[r.tool] || r.label || r.tool || 'Autre';
  const all = (DB.resultats || []).filter(r => r && r.classe && r.eleve && opt.classes.includes(r.classe) && (!opt.tools || opt.tools.includes(r.tool)));
  const toolList = [...new Set(all.map(tName))].sort((a, b) => a.localeCompare(b, 'fr')), tc = Object.fromEntries(toolList.map((t, i) => [t, BIL_COLS[i % BIL_COLS.length]]));
  const dt = ts => new Date(ts).toLocaleDateString('fr-FR'), today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const tint = c => c + '22';
  const clsSections = opt.classes.map(cls => {
    const rs = all.filter(r => r.classe === cls); const st = studentsOf(cls) || [];
    const ex = bilanExtras(cls, opt), exHTML = ex.html;
    const pupils = [...new Set([...st, ...rs.map(r => r.eleve)])].filter(n => rs.some(r => r.eleve === n) || st.includes(n));
    if (!rs.length) return `<section class="page"><h2>${esc(cls)}</h2><p class="mut">${st.length} élève${st.length > 1 ? 's' : ''} · aucun résultat d'outil enregistré.</p>${exHTML}</section>`;
    const byTool = {}; rs.forEach(r => (byTool[tName(r)] = byTool[tName(r)] || []).push(r));
    const tools = Object.keys(byTool).sort((a, b) => a.localeCompare(b, 'fr'));
    const perPupil = pupils.map(n => ({ n, v: rs.filter(r => r.eleve === n).length })).filter(x => x.v);
    const maxP = Math.max(1, ...perPupil.map(x => x.v));
    const last = (n, t) => (byTool[t] || []).filter(r => r.eleve === n).sort((a, b) => b.date - a.date)[0];
    const matrix = `<h3>Tableau élèves × outils <small>(dernier résultat de chaque outil)</small></h3><div class="sc"><table class="mx"><tr><th class="l">Élève</th>${tools.map(t => `<th style="background:${tc[t]}">${esc(t)}</th>`).join('')}</tr>
      ${pupils.map(n => `<tr><td class="l"><b>${esc(n)}</b></td>${tools.map(t => { const r = last(n, t); return r ? `<td style="background:${tint(tc[t])}">${esc(String(r.valeur))}</td>` : '<td class="none">–</td>'; }).join('')}</tr>`).join('')}</table></div>`;
    const blocks = tools.map(t => { const L = byTool[t].slice().sort((a, b) => (pupils.indexOf(a.eleve) - pupils.indexOf(b.eleve)) || a.date - b.date);
      const num = r => { const m = /-?\d+(?:[.,]\d+)?/.exec(String(r.valeur)); return m && !/:/.test(String(r.valeur)) ? parseFloat(m[0].replace(',', '.')) : null; };
      const nums = L.map(num), ok = nums.filter(x => x != null).length >= 3, mx = ok ? Math.max(...nums.filter(x => x != null), 0) : 0;
      return `<h3 style="border-color:${tc[t]}"><span class="dot" style="background:${tc[t]}"></span>${esc(t)} <small>${L.length} résultat${L.length > 1 ? 's' : ''}</small></h3><div class="sc"><table><tr><th class="l">Élève</th><th>Date</th><th>Résultat</th>${ok ? '<th class="bar"></th>' : ''}<th class="l">Détail</th></tr>
        ${L.map((r, i) => `<tr><td class="l"><b>${esc(r.eleve)}</b></td><td>${dt(r.date)}</td><td style="background:${tint(tc[t])};font-weight:800">${esc(String(r.valeur))}</td>${ok ? `<td class="bar">${nums[i] != null && mx > 0 ? `<i style="width:${Math.max(3, Math.round(nums[i] / mx * 100))}%;background:${tc[t]}"></i>` : ''}</td>` : ''}<td class="l d">${esc(r.detail || '')}</td></tr>`).join('')}</table></div>`; }).join('');
    return `<section class="page"><h2>${esc(cls)}</h2>
      <div class="chips"><div><b>${st.length || pupils.length}</b><span>élèves</span></div><div><b>${rs.length}</b><span>résultats</span></div><div><b>${tools.length}</b><span>outils utilisés</span></div><div><b>${perPupil.length}</b><span>élèves avec résultat</span></div></div>
      <div class="grid2"><div class="card"><h3 class="nb">Résultats par outil</h3>${bilanPie(tools.map(t => ({ l: t, v: byTool[t].length, c: tc[t] })))}</div>
      <div class="card"><h3 class="nb">Résultats par élève</h3>${perPupil.sort((a, b) => b.v - a.v).map(x => `<div class="hb"><span>${esc(x.n)}</span><div><i style="width:${Math.round(x.v / maxP * 100)}%"></i></div><b>${x.v}</b></div>`).join('')}</div></div>
      ${matrix}${blocks}${exHTML}</section>`;
  }).join('');
  const XT = opt.classes.map(c => bilanExtras(c, opt));
  const tot = all.length, byT = Object.fromEntries(toolList.map(t => [t, all.filter(r => tName(r) === t).length]));
  const sum = `<section class="page cover"><div class="band"><h1>📊 Bilan EPS</h1><p>${esc(DB.annee || '')} · édité le ${today}</p></div>
    <div class="chips"><div><b>${opt.classes.length}</b><span>classe${opt.classes.length > 1 ? 's' : ''}</span></div><div><b>${tot}</b><span>résultats d'outils</span></div><div><b>${toolList.length}</b><span>outils</span></div>${opt.coll ? `<div><b>${XT.reduce((a, x) => a + x.nColl, 0)}</b><span>événements collectifs</span></div>` : ''}${(opt.grilles || []).length ? `<div><b>${XT.reduce((a, x) => a + x.nGr, 0)}</b><span>évaluations (grilles)</span></div>` : ''}</div>
    <div class="grid2"><div class="card"><h3 class="nb">Résultats par classe</h3>${bilanPie(opt.classes.map((c, i) => ({ l: c, v: all.filter(r => r.classe === c).length, c: BIL_COLS[(i + 3) % BIL_COLS.length] })))}</div>
    <div class="card"><h3 class="nb">Résultats par outil</h3>${bilanPie(toolList.map(t => ({ l: t, v: byT[t], c: tc[t] })))}</div></div>
    <h3>Sommaire</h3><ul class="toc">${opt.classes.map(c => `<li><b>${esc(c)}</b> — ${all.filter(r => r.classe === c).length} résultat(s)</li>`).join('')}</ul></section>`;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bilan EPS ${esc(DB.annee || '')}</title><style>
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#0E1A33;background:#EEF1F7;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:1000px;margin:14px auto;background:#fff;padding:22px;border-radius:14px;box-shadow:0 2px 12px rgba(11,42,91,.1)}
.band{background:linear-gradient(120deg,#C9A227,#1E5BD8 60%,#0B2A5B);color:#fff;border-radius:12px;padding:22px 24px;margin-bottom:16px}.band h1{margin:0;font-size:1.9rem}.band p{margin:6px 0 0;opacity:.92}
h2{margin:0 0 12px;font-size:1.5rem;border-bottom:3px solid #C9A227;padding-bottom:6px;color:#0B2A5B}
h3{margin:20px 0 8px;font-size:1.05rem;border-bottom:2px solid #0B2A5B;padding-bottom:4px;display:flex;align-items:center;gap:8px}h3 small{font-weight:600;color:#667}h3.nb{border:0;margin:0 0 8px}.dot{width:12px;height:12px;border-radius:50%;display:inline-block}
.mut{color:#667}.chips{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px}.chips div{flex:1 1 120px;background:linear-gradient(135deg,#F7F1DC,#E4ECFB);border-radius:12px;padding:10px 12px;text-align:center}.chips b{display:block;font-size:1.6rem;color:#0B2A5B}.chips span{font-size:.78rem;color:#556}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}.card{border:1px solid #D9DFEB;border-radius:12px;padding:12px}
.pie{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.lg{flex:1;min-width:140px;font-size:.82rem}.lg div{display:flex;align-items:center;gap:6px;padding:2px 0}.lg i{width:12px;height:12px;border-radius:3px;flex:0 0 12px}.lg span{flex:1}
.hb{display:flex;align-items:center;gap:8px;font-size:.82rem;margin:3px 0}.hb span{width:34%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hb div{flex:1;background:#E4E9F3;border-radius:99px;height:10px;overflow:hidden}.hb i{display:block;height:100%;background:linear-gradient(90deg,#C9A227,#1E5BD8)}.hb b{width:24px;text-align:right}
.sc{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.84rem}th,td{border:1px solid #DDE3EE;padding:6px 8px;text-align:center}th{background:#0B2A5B;color:#fff}.mx th{color:#fff;font-size:.78rem}.l{text-align:left}.d{color:#445;font-size:.78rem}.none{color:#AAB;background:#FAFBFD}
td.bar{width:20%;padding:6px;text-align:left}td.bar i{display:block;height:10px;border-radius:99px}tr:nth-child(even) td:not([style]){background:#F8FAFD}
.toc{columns:2;line-height:1.8}
.ev{border:1px solid #D9DFEB;border-left:5px solid #C9A227;border-radius:10px;padding:10px 12px;margin:10px 0;break-inside:avoid}.evh{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.evh span{color:#667;font-size:.8rem}.lead{font-weight:700;font-size:.85rem;margin:4px 0}
@media print{body{background:#fff}.page{box-shadow:none;border-radius:0;margin:0;padding:6mm;max-width:none;page-break-after:always;break-after:page}.page:last-child{page-break-after:auto;break-after:auto}.sc{overflow:visible}tr{break-inside:avoid}@page{size:A4 landscape;margin:8mm}}
</style></head><body>${sum}${clsSections}</body></html>`;
}

function openBilan() {
  const res = (DB.resultats || []).filter(r => r && r.classe && r.eleve);
  const gr = (DB.grilles || []).map((g, i) => ({ g, i })).filter(x => Object.values(x.g.evals || {}).some(E => Object.values(E || {}).some(e => e && Object.keys(e).length)));
  const hasColl = typeof epsCollClasses === 'function' ? epsCollClasses().some(c => epsCollectifs(c).some(e => e.rows && e.rows.length)) : false;
  if (!res.length && !gr.length && !hasColl) return toast('Aucun résultat enregistré pour l\'instant');
  const cl0 = new Set([...DB.classes.map(c => c.name), ...res.map(r => r.classe), ...(typeof epsCollClasses === 'function' ? epsCollClasses() : []), ...gr.flatMap(x => Object.keys(x.g.evals || {}))]);
  const classes = [...cl0].filter(c => c);
  const names = Object.fromEntries(TOOLS.map(t => [t.id, t.name])), tools = [...new Set(res.map(r => r.tool))].map(id => [id, names[id] || id]).sort((a, b) => a[1].localeCompare(b[1], 'fr'));
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.55);display:grid;place-items:center;padding:14px;overflow:auto';
  const chk = (k, v, l, n) => `<label style="display:flex;align-items:center;gap:8px;margin:6px 0;font-weight:700"><input type="checkbox" data-${k}="${esc(v)}" checked style="width:20px;height:20px;margin:0"> ${esc(l)}${n != null ? ` <small class="muted">(${n})</small>` : ''}</label>`;
  o.innerHTML = `<div class="card" style="max-width:420px;width:100%;max-height:92vh;overflow:auto"><h3 style="margin-top:0">📊 Exporter un bilan</h3>
    <p class="muted" style="font-size:.82rem;margin:0 0 8px">Un fichier en couleurs (camemberts, tableaux par classe et par outil) à ouvrir, imprimer ou envoyer sur ton ordinateur. Rien n'est conservé dans l'appli.</p>
    <b>Classes</b>${classes.map(c => chk('c', c, c, null)).join('')}
    ${tools.length ? `<b style="display:block;margin-top:10px">Résultats des outils</b>${tools.map(([id, n]) => chk('t', id, n, res.filter(r => r.tool === id).length)).join('')}` : ''}
    ${hasColl ? `<b style="display:block;margin-top:10px">Résultats collectifs</b>${chk('k', 'coll', 'Tournois, matchs, HYROX, C.O. par équipes, relais, cross…', null)}` : ''}
    ${gr.length ? `<b style="display:block;margin-top:10px">Grilles d'évaluation</b>${gr.map(x => chk('g', x.i, x.g.name, null)).join('')}` : ''}
    <div class="row" style="margin-top:12px"><button class="btn btn-ghost" data-x>Annuler</button><button class="btn btn-grad" data-go>Créer le bilan</button></div>
    </div>`;
  document.body.appendChild(o);
  o.querySelector('[data-x]').onclick = () => o.remove();
  o.querySelector('[data-go]').onclick = async () => {
    const cs = [...o.querySelectorAll('[data-c]:checked')].map(x => x.dataset.c), ts = [...o.querySelectorAll('[data-t]:checked')].map(x => x.dataset.t), coll = !!o.querySelector('[data-k]:checked'), gs = [...o.querySelectorAll('[data-g]:checked')].map(x => +x.dataset.g);
    if (!cs.length || (!ts.length && !coll && !gs.length)) return toast('Choisissez au moins une classe et un contenu');
    const html = bilanHTML({ classes: cs, tools: ts, coll, grilles: gs }); o.remove();
    const name = 'bilan-eps-' + new Date().toISOString().slice(0, 10) + '.html', blob = new Blob([html], { type: 'text/html' });
    const v = document.createElement('div'); v.style.cssText = 'position:fixed;inset:0;z-index:300;background:#333;display:flex;flex-direction:column';
    v.innerHTML = `<div style="display:flex;gap:8px;padding:10px;align-items:center;background:var(--grad,#0B2A5B);color:#fff;flex-wrap:wrap"><b style="flex:1">📊 Bilan</b><button class="btn btn-white" data-s>📤 Enregistrer / envoyer</button><button class="btn btn-white" data-p>🖨 Imprimer / PDF</button><button class="btn btn-ghost" style="color:#fff" data-x>✕ Fermer</button></div><iframe title="Bilan" style="flex:1;border:0;background:#EEF1F7"></iframe>`;
    document.body.appendChild(v); v.querySelector('iframe').srcdoc = html; v.querySelector('[data-x]').onclick = () => v.remove();
    v.querySelector('[data-s]').onclick = async () => {
      const f = new File([blob], name, { type: 'text/html' });
      try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'Bilan EPS' }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); toast('Bilan téléchargé ✔'); };
    v.querySelector('[data-p]').onclick = () => {   // impression dans la page (l'impression d'un cadre échoue sur Safari)
      const d = new DOMParser().parseFromString(html, 'text/html'); document.getElementById('bil-print')?.remove(); document.getElementById('bil-print-css')?.remove();
      const st = document.createElement('style'); st.id = 'bil-print-css'; st.media = 'print'; st.textContent = d.querySelector('style').textContent.replace('body{margin:0;', 'body.x{margin:0;') + '\nbody>*:not(#bil-print){display:none!important}#bil-print{display:block!important;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#0E1A33}html,body{background:#fff!important;height:auto!important;overflow:visible!important}';
      const box = document.createElement('div'); box.id = 'bil-print'; box.style.display = 'none'; box.innerHTML = d.body.innerHTML; document.head.appendChild(st); document.body.appendChild(box);
      const clean = () => { box.remove(); st.remove(); window.removeEventListener('afterprint', clean); }; window.addEventListener('afterprint', clean);
      setTimeout(() => { try { window.print(); } catch (e) { toast('Impression impossible'); } }, 200); };
  };
}
