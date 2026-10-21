/* =========================================================
   Bouton « 📊 Bilan » en haut de chaque outil qui enregistre des résultats :
   fiches élèves (PDF / ZIP) et bilan de classe, limités à cet outil.
   Les bilans de l'onglet « Plus » restent inchangés (toutes activités).
   ========================================================= */
(function () {
  const IDS = ['co', 'combine', 'duathlon', 'escalade', 'lutte', 'natation', 'relais', 'demifond', 'sauvetage', 'wod', 'chronos12', 'rugbyla', 'cross', 'parkour', 'gym', 'acrosport'];
  const hasBil = id => IDS.includes(id), hasClean = id => (window.epsCleanTools ? epsCleanTools() : []).includes(id);
  const tname = id => ((typeof TOOLS !== 'undefined' ? TOOLS : []).find(t => t.id === id) || {}).name || id;
  const classes = () => [...new Set([...(DB.classes || []).map(c => c.name), ...(DB.resultats || []).map(r => r && r.classe).filter(Boolean)])].filter(Boolean);
  function panel(tool) {
    const cl = classes(); if (!cl.length) return toast('Créez d\'abord une classe');
    let cls = cl.includes(DB.lastClass) ? DB.lastClass : cl[0];
    const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.55);display:grid;place-items:center;padding:14px;overflow:auto';
    o.innerHTML = `<div class="card" style="max-width:420px;width:100%"><h3 style="margin-top:0">📊 Bilan · ${esc(tname(tool))}</h3>
      <p class="muted" style="font-size:.82rem;margin:0 0 8px">Résultats de cet outil uniquement. Pour tous les outils et toutes les activités : onglet « Plus » → Bilan / Fiches élèves.</p>
      <label style="margin-top:0">Classe</label><select id="tb-c">${cl.map(c => `<option ${c === cls ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
      ${hasBil(tool) ? `<button class="btn btn-grad btn-block" style="margin-top:12px;padding:14px" id="tb-f">🧑‍🎓 Fiches élèves (PDF · ZIP de la classe)</button>
      <button class="btn btn-ghost btn-block" style="margin-top:8px;padding:14px" id="tb-b">📊 Bilan de la classe (PDF)</button>` : ''}
      ${hasClean(tool) ? `<button class="btn btn-ghost btn-block" data-cfg="bare" style="margin-top:8px;color:#D64545" id="tb-c">🧹 Supprimer ce qui est terminé…</button>` : ''}
      ${hasClean(tool) ? '' : `<button class="btn btn-ghost btn-block" data-cfg="bare" style="margin-top:8px;color:#D64545" id="tb-d">🗑 Supprimer les résultats de cet outil…</button>`}
      <button class="btn btn-ghost btn-block" style="margin-top:8px" id="tb-x">Fermer</button></div>`;
    document.body.appendChild(o);
    const cur = () => o.querySelector('#tb-c').value;
    o.querySelector('#tb-x').onclick = () => o.remove();
    if (o.querySelector('#tb-c')) o.querySelector('#tb-c').onclick = () => { o.remove(); epsCleanTool(tool); };
    if (o.querySelector('#tb-d')) o.querySelector('#tb-d').onclick = () => { const c = cur(); o.remove(); if (typeof epsPurge === 'function') epsPurge({ cls: c, act: tool }); };
    if (o.querySelector('#tb-f')) o.querySelector('#tb-f').onclick = () => { const c = cur(); o.remove(); DB.lastClass = c; if (typeof openFiches !== 'function') return toast('Fiches indisponibles'); openFiches({ cls: c, tools: [tool] }); };
    if (o.querySelector('#tb-b')) o.querySelector('#tb-b').onclick = () => { const c = cur(); o.remove(); DB.lastClass = c; if (typeof openBilan !== 'function') return toast('Bilan indisponible'); openBilan({ cls: c, tools: [tool], coll: true }); };
  }
  window.epsToolBilan = panel;
  function btn() {
    let b = document.getElementById('screen-bil');
    if (!b) { const star = document.getElementById('screen-star'); if (!star) return null;
      b = document.createElement('button'); b.id = 'screen-bil'; b.className = 'icon-btn'; b.type = 'button'; b.textContent = '📊 Bilan'; b.setAttribute('aria-label', 'Bilan et fiches élèves de cet outil');
      b.style.cssText = 'width:auto;padding:0 12px;font-size:.82rem;font-weight:800;white-space:nowrap;display:none';
      b.onclick = () => { if (typeof currentTool !== 'undefined' && (hasBil(currentTool) || hasClean(currentTool))) panel(currentTool); };
      star.parentNode.insertBefore(b, star); }
    return b; }
  const o0 = window.openTool;
  if (typeof o0 === 'function') window.openTool = openTool = function (id) { const r = o0.apply(this, arguments); try { const b = btn(); if (b) { const ok = (hasBil(id) || hasClean(id)) && TOOL_IMPL[id]; b.style.display = ok ? '' : 'none'; b.textContent = hasBil(id) ? '📊 Bilan' : '🧹 Terminé'; } } catch (e) {} return r; };
})();
