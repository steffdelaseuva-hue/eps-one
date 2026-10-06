/* =========================================================
   EPS ONE — Outil « Montée-descente » (sports de raquette)
   En fin de séance : placer rapidement chaque élève sur le terrain
   où il a terminé son dernier match (joueurs + arbitres), pour
   repartir de là à la séance suivante.
   Données : DB.montee = { sport, cfg: { sport: { n, demi } }, pl: { classe: { sport: { élève: { t, r } } } } }
   ========================================================= */
ICONS.montee = '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M3 12h18"/><path d="M7.5 9.5V6.5M6 8l1.5-1.5L9 8M16.5 14.5v3M15 16l1.5 1.5L18 16"/>';
const MD_SP = { badminton: { n: 'Badminton', ic: '🏸', cc: '#2E8B57', def: { n: 6, demi: true } }, shortennis: { n: 'Shortennis', ic: '🎾', cc: '#2F7FC1', def: { n: 6, demi: true } },
  tennis: { n: 'Tennis', ic: '🎾', cc: '#C8643B', def: { n: 6, demi: true } }, tt: { n: 'Tennis de table', ic: '🏓', cc: '#1F4FA0', def: { n: 12, demi: false }, table: true } };
const mdZ = r => r === 'a' ? 'a1' : r === 'j' || !r ? 'j1' : r;   // anciens placements (joueurs / arbitres sans côté)
const MD_CAP = { j: 6, a: 4 };   // par demi-terrain / table ; doublé sur un terrain entier

TOOL_IMPL.montee = function (el) {
  if (!DB.classes.length) { el.innerHTML = noClassMsg; return; }
  const M = () => { if (!DB.montee || typeof DB.montee !== 'object') DB.montee = {}; const m = DB.montee; m.cfg = m.cfg || {}; m.pl = m.pl || {}; if (!MD_SP[m.sport]) m.sport = 'badminton'; return m; };
  let cls = DB.classes.some(c => c.name === DB.lastClass) ? DB.lastClass : DB.classes[0].name, sel = new Set(), undo = [], cfgOpen = false;
  if (!document.getElementById('md-css')) document.head.insertAdjacentHTML('beforeend', `<style id="md-css">
.md-sp{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.md-sp button{padding:10px 4px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.82rem;color:var(--text)}
.md-sp button.on{background:var(--grad);color:#fff;border-color:transparent}
.md-pool{position:sticky;top:0;z-index:5;margin-top:12px;max-height:38vh;overflow:auto}
.md-ps{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.md-p{display:inline-flex;align-items:center;gap:4px;padding:7px 11px;border-radius:99px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.85rem;color:var(--text);cursor:pointer;user-select:none;-webkit-user-select:none;line-height:1.1}
.md-p.a{border-color:#C9A227;background:rgba(201,162,39,.12)}
.md-p.on{background:var(--blue,#1E5BD8);color:#fff;border-color:transparent;box-shadow:0 0 0 3px rgba(30,91,216,.25)}
.md-role{display:flex;gap:6px;margin-top:10px}.md-role button{flex:1;padding:9px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800;color:var(--text)}
.md-role button.on{background:#1B9E5A;color:#fff;border-color:transparent}.md-role button.on.a{background:#C9A227}
.md-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;margin-top:12px}
.md-t{border:2px solid var(--line);border-radius:16px;background:var(--card);overflow:hidden}
.md-t.tg{border-color:var(--blue,#1E5BD8);box-shadow:0 0 0 3px rgba(30,91,216,.18)}
.md-t h4{margin:0;padding:6px 10px;font-size:.92rem;display:flex;justify-content:space-between;align-items:center;gap:6px}
.md-t h4 small{font-weight:800;font-size:.7rem;color:var(--muted)}.md-t h4 small .over{color:var(--danger,#D64545)}
.md-cw{padding:4px 8px 8px;display:flex;flex-direction:column;align-items:center;gap:4px}
.md-ref{width:56%;min-height:30px;border:1.5px dashed #C9A227;border-radius:10px;background:rgba(201,162,39,.09);display:flex;flex-wrap:wrap;gap:3px;justify-content:center;align-items:center;padding:3px;cursor:pointer}
.md-ref .lb{font-size:.62rem;font-weight:900;color:#9C7A1E;text-transform:uppercase;letter-spacing:.04em}
.md-court{position:relative;width:100%;min-height:118px;display:grid;grid-template-columns:1fr 10px 1fr;border-radius:6px;background:var(--cc);box-shadow:inset 0 0 0 3px rgba(255,255,255,.95),inset 0 0 0 4px rgba(0,0,0,.08)}
.md-court::before{content:'';position:absolute;inset:14px 9%;border:2px solid rgba(255,255,255,.75);border-radius:2px;pointer-events:none}
.md-court.tt::before{inset:50% 3px auto;height:0;border:0;border-top:2px solid rgba(255,255,255,.8)}
.md-side{position:relative;z-index:1;padding:8px 5px;display:flex;flex-wrap:wrap;gap:3px;align-content:center;justify-content:center;cursor:pointer;min-height:110px}
.md-side .lb{font-size:.62rem;font-weight:900;color:rgba(255,255,255,.85);text-transform:uppercase;letter-spacing:.04em}
.md-net{position:relative;z-index:2;align-self:stretch;margin:-6px 0;background:repeating-linear-gradient(0deg,#1B1F2A 0 3px,#fff 3px 5px);border-left:2px solid #1B1F2A;border-right:2px solid #1B1F2A;width:6px;justify-self:center}
.md-net::before,.md-net::after{content:'';position:absolute;left:50%;width:10px;height:10px;border-radius:50%;background:#1B1F2A;transform:translateX(-50%)}.md-net::before{top:-4px}.md-net::after{bottom:-4px}
.md-side .md-p,.md-ref .md-p{padding:4px 8px;font-size:.74rem;background:#fff;color:#0E1A33;border-color:transparent;box-shadow:0 1px 3px rgba(0,0,0,.25)}
.md-ref .md-p{background:#FFF7DD;border-color:#C9A227}
.md-side .md-p.on,.md-ref .md-p.on{background:var(--blue,#1E5BD8);color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.9)}
.md-ov{position:fixed;inset:0;z-index:320;background:var(--bg,#fff);overflow:auto;padding:14px}
.md-ov .md-grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
.md-ov .md-t h4{font-size:1.2rem;padding:8px 12px}.md-ov .md-side,.md-ov .md-ref{cursor:default}.md-ov .md-side .md-p,.md-ov .md-ref .md-p{font-size:.95rem;padding:6px 10px;cursor:default}
</style>`);
  const cfgOf = sp => Object.assign({}, MD_SP[sp].def, M().cfg[sp] || {});
  const PL = () => { const m = M(); m.pl[cls] = m.pl[cls] || {}; return (m.pl[cls][m.sport] = m.pl[cls][m.sport] || {}); };
  /* Liste des terrains : { k, name, mult } (mult = 2 pour un terrain entier) */
  const courts = () => { const sp = M().sport, c = cfgOf(sp), L = [];
    for (let i = 1; i <= c.n; i++) { if (MD_SP[sp].table) L.push({ k: 'T' + i, name: 'Table ' + i, mult: 1 });
      else if (c.demi) ['A', 'B'].forEach(h => L.push({ k: i + h, name: `Terrain ${i} · ${h === 'A' ? '½ gauche' : '½ droite'}`, short: `T${i} ${h}`, mult: 1 }));
      else L.push({ k: 'G' + i, name: 'Terrain ' + i, mult: 2 }); }
    return L; };
  const snap = () => { const m = M(); undo.push(JSON.stringify({ p: PL(), c: m.cfg[m.sport] || null })); if (undo.length > 40) undo.shift(); };
  const commit = () => { save(); window.syncFlush && window.syncFlush(); };
  const pill = (n, r, on) => `<span class="md-p ${r[0] === 'a' ? 'a' : ''} ${on ? 'on' : ''}" data-st="${esc(n)}">${r[0] === 'a' ? '⚖️ ' : ''}${esc(n)}</span>`;
  /* Terrain dessiné : 2 côtés du filet (joueurs) + 2 petites zones arbitres, une à chaque bout du filet */
  const court = (c, st, P, live) => { const sp = M().sport, at = z => st.filter(n => P[n] && P[n].t === c.k && mdZ(P[n].r) === z), Z = { j1: at('j1'), j2: at('j2'), a1: at('a1'), a2: at('a2') };
    const nJ = Z.j1.length + Z.j2.length, nA = Z.a1.length + Z.a2.length, cJ = MD_CAP.j * c.mult, cA = MD_CAP.a * c.mult;
    if (!live && !nJ && !nA) return '';
    const zone = (z, cl, lb) => `<div class="${cl}" ${live ? `data-z="${c.k}|${z}"` : ''}>${Z[z].length ? Z[z].map(n => pill(n, z, live && sel.has(n))).join('') : live ? `<span class="lb">${lb}</span>` : ''}</div>`;
    return `<div class="md-t ${live && sel.size ? 'tg' : ''}"><h4><span>${esc(c.short || c.name)}</span>${live ? `<small><span class="${nJ > cJ ? 'over' : ''}">${nJ}/${cJ} j.</span> · <span class="${nA > cA ? 'over' : ''}">${nA}/${cA} arb.</span></small>` : ''}</h4>
      <div class="md-cw">${zone('a1', 'md-ref', '⚖️ Arbitres')}<div class="md-court ${MD_SP[sp].table ? 'tt' : ''}" style="--cc:${MD_SP[sp].cc}">${zone('j1', 'md-side', 'Côté 1')}<div class="md-net"></div>${zone('j2', 'md-side', 'Côté 2')}</div>${zone('a2', 'md-ref', '⚖️ Arbitres')}</div></div>`; };

  function draw() {
    const m = M(), sp = m.sport, P = PL(), st = studentsOf(cls), C = courts(), keys = new Set(C.map(c => c.k));
    sel = new Set([...sel].filter(n => st.includes(n)));
    const on = n => P[n] && keys.has(P[n].t), free = st.filter(n => !on(n)), cfg = cfgOf(sp), nPl = st.length - free.length;
    el.innerHTML = `<div class="card"><div class="row"><div><label style="margin-top:0">Classe</label><select id="md-c">${DB.classes.map(c => `<option ${c.name === cls ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div></div>
        <div class="md-sp" style="margin-top:10px">${Object.entries(MD_SP).map(([k, s]) => `<button data-sp="${k}" class="${k === sp ? 'on' : ''}">${s.ic} ${s.n}</button>`).join('')}</div>
        <details data-cfg="bare" id="md-cfg" style="margin-top:10px" ${cfgOpen ? 'open' : ''}><summary class="muted" style="cursor:pointer;font-weight:800">⚙️ Terrains · ${MD_SP[sp].table ? cfg.n + ' tables' : cfg.demi ? `${cfg.n} terrains en ${cfg.n * 2} demi-terrains` : cfg.n + ' terrains entiers'}</summary>
          <div class="row"><div><label>Nombre de ${MD_SP[sp].table ? 'tables' : 'grands terrains'}</label><input id="md-n" type="number" min="1" max="30" value="${cfg.n}"></div>
          ${MD_SP[sp].table ? '' : `<div><label>Découpage</label><div class="md-role" style="margin-top:0"><button data-dm="1" class="${cfg.demi ? 'on' : ''}">½ Demi-terrains</button><button data-dm="0" class="${cfg.demi ? '' : 'on'}">Terrains entiers</button></div></div>`}</div>
          <p class="muted" style="font-size:.75rem;margin:6px 0 0">Jusqu'à ${MD_CAP.j} joueurs et ${MD_CAP.a} arbitres par ${MD_SP[sp].table ? 'table' : 'demi-terrain'}${MD_SP[sp].table ? '' : ` (${MD_CAP.j * 2} et ${MD_CAP.a * 2} sur un terrain entier)`}.</p></details></div>
      <div class="card md-pool"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><b>👥 À placer (${free.length})</b><span class="muted" style="font-size:.78rem">${nPl}/${st.length} placés</span></div>
        <div class="md-ps">${free.length ? free.map(n => pill(n, '', sel.has(n))).join('') : '<span class="muted" style="font-size:.85rem">Tous les élèves sont placés ✔</span>'}</div>
        <div class="muted" style="font-size:.78rem;margin-top:6px">${sel.size ? `<b style="color:var(--text)">${sel.size} élève${sel.size > 1 ? 's' : ''} sélectionné${sel.size > 1 ? 's' : ''}</b> → touchez un côté du filet (joueurs) ou une zone ⚖️ (arbitres)` : 'Touchez un ou plusieurs élèves, puis le terrain où ils ont fini.'}</div>
        <div class="row" style="margin-top:8px;gap:6px">${free.length ? `<button class="btn btn-ghost" style="padding:8px" id="md-all">${free.every(n => sel.has(n)) ? 'Tout désélectionner' : 'Tout sélectionner'}</button>` : ''}${sel.size ? `<button class="btn btn-ghost" style="padding:8px" id="md-out">↩ Remettre à placer</button><button class="btn btn-ghost" style="padding:8px" id="md-none">✕ Désélectionner</button>` : ''}</div></div>
      <div class="md-grid">${C.map(c => court(c, st, P, true)).join('')}</div>
      <div class="row" style="margin-top:14px"><button class="btn btn-grad" id="md-show">📺 Afficher les terrains (élèves)</button>${undo.length ? '<button class="btn btn-ghost" id="md-undo">↶ Annuler</button>' : ''}</div>
      ${nPl ? '<button class="btn btn-ghost btn-block" style="margin-top:8px" data-cfg="bare" id="md-rz">↺ Tout remettre à placer</button>' : ''}`;
    const $ = q => el.querySelector(q);
    $('#md-c').onchange = e => { cls = e.target.value; DB.lastClass = cls; sel.clear(); undo = []; save(); draw(); };
    el.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => { M().sport = b.dataset.sp; sel.clear(); undo = []; commit(); draw(); });
    $('#md-cfg').ontoggle = e => { cfgOpen = e.target.open; };
    const setCfg = f => { const m = M(); m.cfg[sp] = Object.assign(cfgOf(sp), m.cfg[sp] || {}); f(m.cfg[sp]); cfgOpen = true; commit(); draw(); };
    $('#md-n').onchange = e => { const n = Math.max(1, Math.min(30, +e.target.value || 1)); const lost = st.filter(x => on(x) && +(/\d+/.exec(P[x].t) || [0])[0] > n).length;
      if (lost && !confirm(`${lost} élève(s) placé(s) sur les terrains retirés reviendront « à placer ». Continuer ?`)) return draw(); snap(); setCfg(c => { c.n = n; }); };
    el.querySelectorAll('[data-dm]').forEach(b => b.onclick = () => { const v = b.dataset.dm === '1'; if (v === cfg.demi) return;
      if (nPl && !confirm('Changer le découpage remet les élèves de ce sport « à placer » (↶ Annuler possible). Continuer ?')) return; snap(); setCfg(c => { c.demi = v; }); });
    el.querySelectorAll('[data-st]').forEach(p => p.onclick = e => { e.stopPropagation(); const n = p.dataset.st; sel.has(n) ? sel.delete(n) : sel.add(n); draw(); });
    el.querySelectorAll('[data-z]').forEach(z => z.onclick = () => { if (!sel.size) return toast('Touchez d\'abord un ou plusieurs élèves'); const [k, r] = z.dataset.z.split('|');
      snap(); sel.forEach(n => { P[n] = { t: k, r }; }); const c = C.find(x => x.k === k), N = sel.size; sel.clear(); commit(); draw(); toast(`${N} élève${N > 1 ? 's' : ''} → ${c.short || c.name} (${r[0] === 'a' ? 'arbitres' : 'joueurs · côté ' + r[1]})`); });
    if ($('#md-all')) $('#md-all').onclick = () => { if (free.every(n => sel.has(n))) free.forEach(n => sel.delete(n)); else free.forEach(n => sel.add(n)); draw(); };
    if ($('#md-none')) $('#md-none').onclick = () => { sel.clear(); draw(); };
    if ($('#md-out')) $('#md-out').onclick = () => { snap(); sel.forEach(n => delete P[n]); sel.clear(); commit(); draw(); };
    if ($('#md-undo')) $('#md-undo').onclick = () => { const s = undo.pop(); if (!s) return; const m = M(), u = JSON.parse(s); m.pl[cls][m.sport] = u.p; if (u.c) m.cfg[m.sport] = u.c; else delete m.cfg[m.sport]; sel.clear(); commit(); draw(); toast('Annulé ✔'); };
    if ($('#md-rz')) $('#md-rz').onclick = () => { if (!confirm(`Remettre tous les élèves de ${cls} « à placer » (${MD_SP[sp].n}) ?\n↶ Annuler possible.`)) return; snap(); Object.keys(P).forEach(n => delete P[n]); sel.clear(); commit(); draw(); };
    $('#md-show').onclick = show;
  }
  /* Affichage plein écran pour les élèves : où aller en début de séance */
  function show() {
    const P = PL(), st = studentsOf(cls), C = courts(), sp = M().sport, keys = new Set(C.map(c => c.k)), o = document.createElement('div'); o.className = 'md-ov';
    o.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2 style="margin:0">${MD_SP[sp].ic} ${esc(cls)} · ${MD_SP[sp].n}</h2><button class="btn btn-ghost" style="flex:0 0 auto" data-q>✕ Fermer</button></div>
      <div class="md-grid">${C.map(c => court(c, st, P, false)).join('') || '<div class="card empty">Aucun élève placé.</div>'}</div>
      ${st.some(n => !(P[n] && keys.has(P[n].t))) ? `<p class="muted" style="margin-top:12px">Non placés : ${st.filter(n => !(P[n] && keys.has(P[n].t))).map(esc).join(', ')}</p>` : ''}`;
    o.querySelector('[data-q]').onclick = () => o.remove(); document.body.appendChild(o);
  }
  draw();
  const onRemote = () => { if (el.isConnected && !document.querySelector('.md-ov')) draw(); };
  window.addEventListener('eps-remote', onRemote);
  return () => window.removeEventListener('eps-remote', onRemote);
};
