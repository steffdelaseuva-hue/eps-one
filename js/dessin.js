/* =========================================================
   EPS ONE — Dessiner sur la vidéo (Vidéo différée, Photo-finish)
   Outils : main levée, trait, flèche, point, cercle, rectangle, angle, texte.
   Couleurs de l'app, épaisseur, annuler, effacer, capture PNG.
   Les dessins sont en coordonnées relatives : ils suivent la taille de l'écran.
   ========================================================= */
(() => {
  document.head.insertAdjacentHTML('beforeend', `<style>
.dw-ov{position:absolute;inset:0;width:100%;height:100%;z-index:3;touch-action:none;pointer-events:none}
.dw-ov.on{pointer-events:auto;cursor:crosshair}
.dw-bar{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch}
.dw-bar button{flex:0 0 auto;min-width:48px;padding:9px 10px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.95rem;color:var(--text)}
.dw-bar button.on{background:var(--grad);color:#fff;border-color:transparent}
.dw-col{width:34px;height:34px;min-width:34px!important;padding:0!important;border-radius:50%!important;border:3px solid #fff!important;box-shadow:0 0 0 1.5px var(--line)}
.dw-col.on{box-shadow:0 0 0 3px var(--navy,#0B2A5B)}
.dw-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:8px}
</style>`);

  const COLS = ['#E6C76E', '#1E5BD8', '#E53935', '#FFFFFF', '#111111', '#22C55E'];
  const TOOLS = [['none', '✋', 'Aucun (regarder la vidéo)'], ['free', '✏️', 'Main levée'], ['line', '╱', 'Trait'], ['arrow', '➜', 'Flèche'], ['dot', '•', 'Point'],
    ['circle', '◯', 'Cercle'], ['rect', '▭', 'Rectangle'], ['angle', '∠', 'Angle (3 points)'], ['text', 'T', 'Texte']];

  window.mountDraw = function (host) {
    const wrap = host.querySelector('.cam-wrap'); if (!wrap) return () => {};
    const ov = document.createElement('canvas'); ov.className = 'dw-ov'; wrap.appendChild(ov);
    const S = { tool: 'none', col: COLS[0], w: 4 }, shapes = [];
    let cur = null, angPts = null;
    const bar = document.createElement('div'); bar.className = 'card'; bar.style.marginTop = '12px';
    bar.innerHTML = `<b>✏️ Dessiner sur l'image</b>
      <div class="dw-bar" style="margin-top:8px">${TOOLS.map(([k, i, t]) => `<button data-tl="${k}" title="${t}" aria-label="${t}" class="${k === S.tool ? 'on' : ''}">${i}</button>`).join('')}</div>
      <div class="dw-row">${COLS.map(c => `<button class="dw-col ${c === S.col ? 'on' : ''}" data-cl="${c}" style="background:${c}" aria-label="Couleur"></button>`).join('')}
        <span style="flex:1"></span>${[[2, 'Fin'], [4, 'Moyen'], [7, 'Épais']].map(([w, l]) => `<button class="btn btn-ghost" data-wd="${w}" style="padding:8px 10px;flex:0 0 auto${w === S.w ? ';outline:2px solid var(--gold)' : ''}">${l}</button>`).join('')}</div>
      <div class="dw-row"><button class="btn btn-ghost" id="dw-un" style="flex:1">↶ Annuler</button><button class="btn btn-ghost" id="dw-cl" style="flex:1">🗑 Effacer</button><button class="btn btn-ghost" id="dw-sv" style="flex:1">📸 Capture</button></div>
      <p class="muted" id="dw-h" style="margin:8px 0 0;font-size:.8rem">Choisissez un outil puis dessinez directement sur l'image (conseil : ⏸ Figer d'abord). ✋ pour revenir à la vidéo.</p>`;
    wrap.after(bar);
    const q = s => bar.querySelector(s);

    const size = () => { const r = wrap.getBoundingClientRect(), d = Math.min(3, devicePixelRatio || 1); const W = Math.round(r.width * d), H = Math.round(r.height * d);
      if (ov.width !== W || ov.height !== H) { ov.width = W; ov.height = H; } redraw(); };
    const P = e => { const r = ov.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
    const X = p => [p[0] * ov.width, p[1] * ov.height];
    const deg = (a, o, b) => { const v1 = [a[0] - o[0], a[1] - o[1]], v2 = [b[0] - o[0], b[1] - o[1]]; let t = Math.abs(Math.atan2(v1[0] * v2[1] - v1[1] * v2[0], v1[0] * v2[0] + v1[1] * v2[1])) * 180 / Math.PI; return Math.round(t); };

    function paint(c, s, W, H) {
      const k = W / 800, lw = Math.max(1.5, s.w * Math.max(1, (W / 700))), px = p => [p[0] * W, p[1] * H];
      c.save(); c.strokeStyle = c.fillStyle = s.col; c.lineWidth = lw; c.lineCap = c.lineJoin = 'round';
      c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 3 * Math.max(1, k);
      const [a, b] = [s.p[0], s.p[s.p.length - 1]].map(px);
      switch (s.t) {
        case 'free': c.beginPath(); s.p.map(px).forEach((q, i) => i ? c.lineTo(...q) : c.moveTo(...q)); c.stroke(); break;
        case 'line': c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke(); break;
        case 'arrow': { c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke(); const an = Math.atan2(b[1] - a[1], b[0] - a[0]), L = lw * 4.5;
          c.beginPath(); c.moveTo(...b); c.lineTo(b[0] - L * Math.cos(an - .45), b[1] - L * Math.sin(an - .45)); c.lineTo(b[0] - L * Math.cos(an + .45), b[1] - L * Math.sin(an + .45)); c.closePath(); c.fill(); break; }
        case 'dot': c.beginPath(); c.arc(a[0], a[1], lw * 2.2, 0, 2 * Math.PI); c.fill(); break;
        case 'circle': c.beginPath(); c.arc(a[0], a[1], Math.hypot(b[0] - a[0], b[1] - a[1]), 0, 2 * Math.PI); c.stroke(); break;
        case 'rect': c.strokeRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])); break;
        case 'angle': { const Q = s.p.map(px); c.beginPath(); Q.forEach((q, i) => i ? c.lineTo(...q) : c.moveTo(...q)); c.stroke();
          Q.forEach(q => { c.beginPath(); c.arc(q[0], q[1], lw * 1.6, 0, 2 * Math.PI); c.fill(); });
          if (Q.length === 3) { const d = deg(Q[0], Q[1], Q[2]), a1 = Math.atan2(Q[0][1] - Q[1][1], Q[0][0] - Q[1][0]), a2 = Math.atan2(Q[2][1] - Q[1][1], Q[2][0] - Q[1][0]);
            let s1 = a1, s2 = a2; let diff = s2 - s1; while (diff > Math.PI) diff -= 2 * Math.PI; while (diff < -Math.PI) diff += 2 * Math.PI;
            c.beginPath(); c.arc(Q[1][0], Q[1][1], lw * 7, s1, s1 + diff, diff < 0); c.stroke();
            const fs = Math.max(11, W * .034); c.font = `900 ${fs}px system-ui,-apple-system,sans-serif`; c.textBaseline = 'middle';
            const m = s1 + diff / 2, tx = Q[1][0] + Math.cos(m) * lw * 12, ty = Q[1][1] + Math.sin(m) * lw * 12; c.textAlign = 'center';
            c.lineWidth = Math.max(3, fs / 5); c.strokeStyle = 'rgba(0,0,0,.75)'; c.strokeText(d + '°', tx, ty); c.fillText(d + '°', tx, ty); }
          break; }
        case 'text': { const fs = Math.max(11, W * (.02 + s.w * .005)); c.font = `900 ${fs}px system-ui,-apple-system,sans-serif`; c.textBaseline = 'middle';
          c.lineWidth = Math.max(3, fs / 5); c.strokeStyle = 'rgba(0,0,0,.75)'; c.shadowBlur = 0; c.strokeText(s.txt, a[0], a[1]); c.fillText(s.txt, a[0], a[1]); break; }
      }
      c.restore();
    }
    function redraw() { const c = ov.getContext('2d'); c.clearRect(0, 0, ov.width, ov.height); [...shapes, ...(cur ? [cur] : []), ...(angPts ? [angPts] : [])].forEach(s => paint(c, s, ov.width, ov.height)); }

    ov.addEventListener('pointerdown', e => {
      if (S.tool === 'none') return; e.preventDefault(); const p = P(e);
      if (S.tool === 'text') { const t = prompt('Texte à afficher :'); if (t && t.trim()) { shapes.push({ t: 'text', p: [p], col: S.col, w: S.w, txt: t.trim() }); redraw(); } return; }
      if (S.tool === 'dot') { shapes.push({ t: 'dot', p: [p], col: S.col, w: S.w }); redraw(); return; }
      if (S.tool === 'angle') { angPts = angPts || { t: 'angle', p: [], col: S.col, w: S.w }; angPts.p.push(p);
        if (angPts.p.length === 3) { shapes.push(angPts); angPts = null; q('#dw-h').textContent = 'Angle mesuré. Touchez 3 nouveaux points pour un autre angle.'; }
        else q('#dw-h').textContent = angPts.p.length === 1 ? 'Touchez le sommet de l\'angle (ex. le genou).' : 'Touchez le 3e point.';
        redraw(); return; }
      ov.setPointerCapture(e.pointerId); cur = { t: S.tool, p: [p, p], col: S.col, w: S.w };
    });
    ov.addEventListener('pointermove', e => { if (!cur) return; const p = P(e); if (cur.t === 'free') cur.p.push(p); else cur.p[1] = p; redraw(); });
    const end = () => { if (!cur) return; const [a, b] = [cur.p[0], cur.p[cur.p.length - 1]]; if (cur.t === 'free' || Math.hypot(a[0] - b[0], a[1] - b[1]) > .01) shapes.push(cur); cur = null; redraw(); };
    ov.addEventListener('pointerup', end); ov.addEventListener('pointercancel', end);

    bar.querySelectorAll('[data-tl]').forEach(b => b.onclick = () => { S.tool = b.dataset.tl; angPts = null; bar.querySelectorAll('[data-tl]').forEach(x => x.classList.toggle('on', x === b)); ov.classList.toggle('on', S.tool !== 'none');
      q('#dw-h').textContent = S.tool === 'angle' ? 'Touchez le 1er point (ex. la hanche), puis le sommet (le genou), puis le 3e point (la cheville).' : S.tool === 'text' ? 'Touchez l\'endroit où placer le texte.' : S.tool === 'none' ? 'Dessins conservés. Choisissez un outil pour dessiner.' : 'Dessinez directement sur l\'image.'; redraw(); });
    bar.querySelectorAll('[data-cl]').forEach(b => b.onclick = () => { S.col = b.dataset.cl; bar.querySelectorAll('[data-cl]').forEach(x => x.classList.toggle('on', x === b)); });
    bar.querySelectorAll('[data-wd]').forEach(b => b.onclick = () => { S.w = +b.dataset.wd; bar.querySelectorAll('[data-wd]').forEach(x => x.style.outline = x === b ? '2px solid var(--gold)' : ''); });
    q('#dw-un').onclick = () => { if (angPts) angPts = null; else shapes.pop(); redraw(); };
    q('#dw-cl').onclick = () => { if (shapes.length && !confirm('Effacer tous les dessins ?')) return; shapes.length = 0; angPts = null; redraw(); };
    q('#dw-sv').onclick = () => {           // image + dessins → PNG téléchargé
      const cv = wrap.querySelector('canvas:not(.dw-ov)'), o = document.createElement('canvas'); o.width = ov.width; o.height = ov.height; const c = o.getContext('2d');
      c.fillStyle = '#000'; c.fillRect(0, 0, o.width, o.height);
      if (cv && cv.width) { const s = Math.min(o.width / cv.width, o.height / cv.height), w = cv.width * s, h = cv.height * s; c.drawImage(cv, (o.width - w) / 2, (o.height - h) / 2, w, h); }
      c.drawImage(ov, 0, 0);
      o.toBlob(b => { if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `eps-one-analyse-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('📸 Image enregistrée'); }, 'image/png');
    };
    const ro = new ResizeObserver(size); ro.observe(wrap); size();
    return () => { ro.disconnect(); };
  };

  ['video', 'photo'].forEach(id => { const orig = TOOL_IMPL[id]; if (!orig) return;
    TOOL_IMPL[id] = function (el) { const c = orig.call(this, el); const d = mountDraw(el); return () => { c && c(); d(); }; }; });
})();
