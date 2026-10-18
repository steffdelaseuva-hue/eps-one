/* =========================================================
   🗑 Suppression en masse des résultats (élèves et collectifs)
   epsPurge({ cls, act, eleves, coll }, onDone)
   Utilisé par « Résultats des élèves », « Résultats collectifs » et le bouton 📊 Bilan des outils.
   ========================================================= */
(function () {
  const DAY = 864e5;
  const toolName = id => ((typeof TOOLS !== 'undefined' ? TOOLS : []).find(t => t.id === id) || {}).name || id;
  const KIND = { tournoi: '🏆 Tournois', match: '⚔️ Matchs', wod: '🏋️ HYROX / Crosstraining', co: '🧭 Course d\'orientation', combine: '🏃 Combiné athlétique', duathlon: '🥏 Duathlon athlétique', relais: '🔁 Relais', cross: '🏁 Cross du collège' };
  const classes = () => { const s = new Set([...(DB.classes || []).map(c => c.name), ...(DB.resultats || []).map(r => r && r.classe).filter(Boolean)]);
    try { (window.epsCollClasses ? epsCollClasses() : []).forEach(c => s.add(c)); } catch (e) {} return [...s].filter(Boolean); };
  const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
  function periodOk(p, d) { d = d || 0; if (p === 'today') return d >= startOfToday(); if (p === '30') return d < Date.now() - 30 * DAY; if (p === '90') return d < Date.now() - 90 * DAY; return true; }
  function collect(f) {
    const res = f.eleves ? (DB.resultats || []).filter(r => r && (f.cls === '*' || r.classe === f.cls) && (!f.act || r.tool === f.act) && periodOk(f.per, r.date)) : [];
    const ev = []; if (f.coll && window.epsCollectifs) { const seen = new Set();
      (f.cls === '*' ? classes() : [f.cls]).forEach(c => { try { epsCollectifs(c).forEach(e => { if (!e.own || !e.own.recs || !e.own.recs.length) return; const k = e.own.recs[0]; if (seen.has(k)) return;
        if ((!f.act || e.kind === f.act) && periodOk(f.per, e.date)) { seen.add(k); ev.push(e); } }); } catch (err) {} }); }
    return { res, ev };
  }
  window.epsPurge = function (pre, onDone) {
    pre = pre || {}; const cl = classes(); if (!cl.length && !(DB.resultats || []).length) return toast('Aucun résultat à supprimer');
    const f = { cls: pre.cls || (cl.includes(DB.lastClass) ? DB.lastClass : cl[0]) || '*', act: pre.act || '', per: 'all', eleves: pre.eleves !== false, coll: pre.coll !== false, bak: true };
    const acts = () => { const m = new Map(); (DB.resultats || []).forEach(r => { if (r && r.tool) m.set(r.tool, toolName(r.tool)); }); Object.keys(KIND).forEach(k => { if (!m.has(k)) m.set(k, KIND[k]); });
      if (f.act && !m.has(f.act)) m.set(f.act, toolName(f.act)); return [...m].sort((a, b) => a[1].localeCompare(b[1], 'fr')); };
    const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:310;background:rgba(0,0,0,.55);display:grid;place-items:center;padding:14px;overflow:auto';
    const close = () => o.remove();
    const draw = () => {
      const { res, ev } = collect(f), nr = ev.reduce((a, e) => a + e.own.recs.length, 0), tot = res.length + ev.length;
      o.innerHTML = `<div class="card" style="max-width:440px;width:100%;max-height:94vh;overflow:auto"><h3 style="margin-top:0">🗑 Supprimer en masse</h3>
        <p class="muted" style="font-size:.82rem;margin:0 0 8px">Choisissez ce qu'il faut effacer. La suppression est définitive et se répercute sur les tablettes synchronisées.</p>
        <label style="margin-top:0">Classe</label><select id="pg-c"><option value="*" ${f.cls === '*' ? 'selected' : ''}>Toutes les classes</option>${cl.map(c => `<option ${c === f.cls ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
        <label>Activité / outil</label><select id="pg-a"><option value="">Toutes les activités</option>${acts().map(([k, n]) => `<option value="${esc(k)}" ${k === f.act ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
        <label>Période</label><select id="pg-p">${[['all', 'Tout (toutes les dates)'], ['today', 'Aujourd\'hui seulement'], ['30', 'Plus de 30 jours'], ['90', 'Plus de 90 jours']].map(([k, n]) => `<option value="${k}" ${k === f.per ? 'selected' : ''}>${n}</option>`).join('')}</select>
        <label style="display:flex;align-items:center;gap:8px;margin:12px 0 0;font-weight:700"><input type="checkbox" id="pg-e" ${f.eleves ? 'checked' : ''} style="width:20px;height:20px;margin:0"> Résultats des élèves</label>
        <label style="display:flex;align-items:center;gap:8px;margin:8px 0 0;font-weight:700"><input type="checkbox" id="pg-k" ${f.coll ? 'checked' : ''} style="width:20px;height:20px;margin:0"> Résultats collectifs (équipes, tournois, matchs…)</label>
        <label style="display:flex;align-items:center;gap:8px;margin:8px 0 0;font-weight:700"><input type="checkbox" id="pg-b" ${f.bak ? 'checked' : ''} style="width:20px;height:20px;margin:0"> Télécharger une sauvegarde avant</label>
        <div class="card" style="margin-top:12px;background:${tot ? 'color-mix(in srgb,#D64545 10%,transparent)' : 'transparent'}"><b>${tot ? `${res.length} résultat${res.length > 1 ? 's' : ''} d'élève${res.length > 1 ? 's' : ''} · ${ev.length} résultat${ev.length > 1 ? 's' : ''} collectif${ev.length > 1 ? 's' : ''}${nr > ev.length ? ` (${nr} enregistrements)` : ''}` : 'Rien ne correspond à ces critères.'}</b>${tot ? '<div class="muted" style="font-size:.8rem;margin-top:2px">seront supprimés.</div>' : ''}</div>
        <button class="btn btn-danger btn-block" style="margin-top:12px;padding:14px" id="pg-go" ${tot ? '' : 'disabled'}>🗑 Supprimer${tot ? ` (${res.length + nr})` : ''}</button>
        <button class="btn btn-ghost btn-block" style="margin-top:8px" id="pg-x">Annuler</button></div>`;
      const $ = s => o.querySelector(s);
      $('#pg-c').onchange = () => { f.cls = $('#pg-c').value; draw(); }; $('#pg-a').onchange = () => { f.act = $('#pg-a').value; draw(); }; $('#pg-p').onchange = () => { f.per = $('#pg-p').value; draw(); };
      $('#pg-e').onchange = () => { f.eleves = $('#pg-e').checked; draw(); }; $('#pg-k').onchange = () => { f.coll = $('#pg-k').checked; draw(); }; $('#pg-b').onchange = () => { f.bak = $('#pg-b').checked; };
      $('#pg-x').onclick = close;
      $('#pg-go').onclick = () => {
        const { res, ev } = collect(f), nr = ev.reduce((a, e) => a + e.own.recs.length, 0), tot = res.length + nr; if (!tot) return;
        const where = f.cls === '*' ? 'toutes les classes' : f.cls;
        if (!confirm(`Supprimer définitivement ${res.length} résultat(s) d'élève et ${ev.length} résultat(s) collectif(s) (${where}) ?`)) return;
        if (f.bak) { try { const u = URL.createObjectURL(new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' })), a = document.createElement('a');
          a.href = u; a.download = 'EPS-ONE-avant-suppression-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); } catch (e) {} }
        const S = new Set(res); for (let i = DB.resultats.length - 1; i >= 0; i--) if (S.has(DB.resultats[i])) DB.resultats.splice(i, 1);
        ev.forEach(e => { const A = e.own.arr(); if (!Array.isArray(A)) return; e.own.recs.forEach(r => { const i = A.indexOf(r); if (i >= 0) { if (A === DB.tournois && window.epsTrashTournoi) epsTrashTournoi(r); A.splice(i, 1); } }); });
        save(); window.syncFlush && window.syncFlush(); close(); toast(`${tot} enregistrement${tot > 1 ? 's' : ''} supprimé${tot > 1 ? 's' : ''}`); if (typeof onDone === 'function') onDone();
      };
    };
    document.body.appendChild(o); draw();
  };
})();
