/* =========================================================
   EPS ONE — 📄 Fiche en vrai PDF (hors ligne, sans bibliothèque)
   La fiche HTML est affichée dans un cadre invisible de la largeur d'une page A4, puis dessinée sur un canvas
   (fonds, dégradés, bordures arrondies, texte, camemberts SVG), découpée en pages A4 SANS couper les cartes,
   et assemblée dans un PDF (une image JPEG par page).
   ========================================================= */
(() => {
  let PW = 794, PH = 1123; const MT = 26, SC = 2;           // page A4 à 96 dpi (px CSS), marge haut/bas, facteur de netteté
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const FIX = () => `html,body{background:#fff!important;margin:0!important}.page{box-shadow:none!important;margin:0!important;max-width:none!important;width:${PW}px!important;border-radius:0!important;box-sizing:border-box}`;

  async function openFrame(html) {
    const f = document.createElement('iframe'); f.style.cssText = `position:fixed;left:-12000px;top:0;width:${PW}px;height:1200px;border:0;visibility:hidden`;
    f.srcdoc = html.replace('</head>', `<style>${FIX()}</style></head>`); document.body.appendChild(f);
    await new Promise(res => { f.onload = res; setTimeout(res, 4000); });
    try { if (f.contentDocument.fonts && f.contentDocument.fonts.ready) await f.contentDocument.fonts.ready; } catch (e) {}
    await sleep(60); return f;
  }

  const splitTop = s => { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && !d) { out.push(cur); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur); return out; };
  function gradient(ctx, bg, x, y, w, h) {
    const m = /^linear-gradient\((.*)\)$/.exec(bg || ''); if (!m) return null; const parts = splitTop(m[1]); let ang = 180, i = 0;
    if (/deg\s*$/.test(parts[0].trim())) { ang = parseFloat(parts[0]); i = 1; } else if (/^\s*to\s/.test(parts[0])) { const t = parts[0]; ang = /right/.test(t) ? 90 : /left/.test(t) ? 270 : /top/.test(t) ? 0 : 180; i = 1; }
    const st = parts.slice(i).map(p => { const mm = /^(.*?)(?:\s+(-?[\d.]+)%)?\s*$/.exec(p.trim()); return { c: mm[1], p: mm[2] != null ? parseFloat(mm[2]) / 100 : null }; }); if (st.length < 2) return null;
    if (st[0].p == null) st[0].p = 0; if (st[st.length - 1].p == null) st[st.length - 1].p = 1;
    for (let k = 1; k < st.length - 1; k++) if (st[k].p == null) { let a = k - 1, b = k + 1; while (st[b].p == null) b++; st[k].p = st[a].p + (st[b].p - st[a].p) * (k - a) / (b - a); }
    const rad = ang * Math.PI / 180, dx = Math.sin(rad), dy = -Math.cos(rad), len = Math.abs(w * dx) + Math.abs(h * dy), cx = x + w / 2, cy = y + h / 2;
    const g = ctx.createLinearGradient(cx - dx * len / 2, cy - dy * len / 2, cx + dx * len / 2, cy + dy * len / 2); st.forEach(s => { try { g.addColorStop(Math.min(1, Math.max(0, s.p)), s.c); } catch (e) {} }); return g;
  }
  function radii(cs, r) { const f = (s, d) => !s ? 0 : s.endsWith('%') ? parseFloat(s) / 100 * d : parseFloat(s) || 0;
    const g = p => { const [a, b] = String(cs[p]).split(' '); return [f(a, r.width), f(b || a, r.height)]; }; return { tl: g('borderTopLeftRadius'), tr: g('borderTopRightRadius'), br: g('borderBottomRightRadius'), bl: g('borderBottomLeftRadius') }; }
  function rrPath(ctx, x, y, w, h, R) {
    const k = Math.min(1, w / ((R.tl[0] + R.tr[0]) || 1e9), w / ((R.bl[0] + R.br[0]) || 1e9), h / ((R.tl[1] + R.bl[1]) || 1e9), h / ((R.tr[1] + R.br[1]) || 1e9));
    const tl = R.tl.map(v => v * k), tr = R.tr.map(v => v * k), br = R.br.map(v => v * k), bl = R.bl.map(v => v * k);
    ctx.beginPath(); ctx.moveTo(x + tl[0], y); ctx.lineTo(x + w - tr[0], y); if (tr[0] || tr[1]) ctx.ellipse(x + w - tr[0], y + tr[1], tr[0], tr[1], 0, -Math.PI / 2, 0);
    ctx.lineTo(x + w, y + h - br[1]); if (br[0] || br[1]) ctx.ellipse(x + w - br[0], y + h - br[1], br[0], br[1], 0, 0, Math.PI / 2);
    ctx.lineTo(x + bl[0], y + h); if (bl[0] || bl[1]) ctx.ellipse(x + bl[0], y + h - bl[1], bl[0], bl[1], 0, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + tl[1]); if (tl[0] || tl[1]) ctx.ellipse(x + tl[0], y + tl[1], tl[0], tl[1], 0, Math.PI, Math.PI * 1.5); ctx.closePath();
  }
  const clear = c => !c || c === 'transparent' || /rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)/.test(c);
  const ascCache = {};
  function ascent(ctx, font, size) { const k = font; if (ascCache[k] != null) return ascCache[k]; let a = size * .8; try { const m = ctx.measureText('Mg'); if (m.fontBoundingBoxAscent) a = m.fontBoundingBoxAscent; } catch (e) {} return (ascCache[k] = a); }

  function paintText(ctx, node, cs, st) {
    const text = node.nodeValue; if (!/\S/.test(text)) return; const doc = node.ownerDocument, range = doc.createRange(), size = parseFloat(cs.fontSize) || 14;
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; ctx.font = font; ctx.fillStyle = cs.color; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const asc = ascent(ctx, font, size), up = cs.textTransform === 'uppercase', vert = /^vertical/.test(cs.writingMode || '');
    for (let i = 0; i < text.length;) { const cp = text.codePointAt(i), ch = String.fromCodePoint(cp), n = ch.length;
      if (!/\s/.test(ch)) { range.setStart(node, i); range.setEnd(node, i + n); const rc = range.getClientRects()[0];
        if (rc && vert && rc.width > 0) { ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.translate(rc.left + rc.width / 2, rc.top + rc.height / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(up ? ch.toUpperCase() : ch, 0, 0); ctx.restore(); }
        else if (rc && rc.width > 0 && rc.bottom >= st.y0 - 2 && rc.top <= st.y1 + 2) ctx.fillText(up ? ch.toUpperCase() : ch, rc.left, rc.top + (rc.height - (asc + (parseFloat(cs.fontSize) * .2))) / 2 + asc - 0); }
      i += n; }
  }
  function paintEl(ctx, el, st) {
    const win = el.ownerDocument.defaultView, cs = win.getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const tag = el.tagName.toLowerCase(); if (tag === 'script' || tag === 'style' || tag === 'head') return;
    const r = el.getBoundingClientRect(); if (r.bottom < st.y0 - 2 || r.top > st.y1 + 2) return;
    if (tag === 'svg') { const im = st.imgs.get(el); if (im) ctx.drawImage(im, r.left, r.top, r.width, r.height); return; }
    const x = r.left, y = r.top, w = r.width, h = r.height;
    if (w > 0 && h > 0) {
      const R = radii(cs, r), bt = parseFloat(cs.borderTopWidth) || 0, brr = parseFloat(cs.borderRightWidth) || 0, bb = parseFloat(cs.borderBottomWidth) || 0, bl = parseFloat(cs.borderLeftWidth) || 0;
      const bg = cs.backgroundColor, bi = cs.backgroundImage;
      if (!clear(bg)) { ctx.fillStyle = bg; rrPath(ctx, x, y, w, h, R); ctx.fill(); }
      if (bi && bi !== 'none') { const g = gradient(ctx, bi, x, y, w, h); if (g) { ctx.fillStyle = g; rrPath(ctx, x, y, w, h, R); ctx.fill(); } }
      if ((bt || brr || bb || bl) && !/none|hidden/.test(cs.borderTopStyle + cs.borderLeftStyle + cs.borderRightStyle + cs.borderBottomStyle) || (bt || brr || bb || bl)) {
        ctx.save(); rrPath(ctx, x, y, w, h, R); ctx.clip();
        if (bt && cs.borderTopStyle !== 'none' && !clear(cs.borderTopColor)) { ctx.fillStyle = cs.borderTopColor; ctx.fillRect(x, y, w, bt); }
        if (bb && cs.borderBottomStyle !== 'none' && !clear(cs.borderBottomColor)) { ctx.fillStyle = cs.borderBottomColor; ctx.fillRect(x, y + h - bb, w, bb); }
        if (bl && cs.borderLeftStyle !== 'none' && !clear(cs.borderLeftColor)) { ctx.fillStyle = cs.borderLeftColor; ctx.fillRect(x, y, bl, h); }
        if (brr && cs.borderRightStyle !== 'none' && !clear(cs.borderRightColor)) { ctx.fillStyle = cs.borderRightColor; ctx.fillRect(x + w - brr, y, brr, h); }
        ctx.restore(); }
      var clip = cs.overflowX !== 'visible' || cs.overflowY !== 'visible';
      if (clip) { ctx.save(); const Ri = { tl: [Math.max(0, R.tl[0] - bl), Math.max(0, R.tl[1] - bt)], tr: [Math.max(0, R.tr[0] - brr), Math.max(0, R.tr[1] - bt)], br: [Math.max(0, R.br[0] - brr), Math.max(0, R.br[1] - bb)], bl: [Math.max(0, R.bl[0] - bl), Math.max(0, R.bl[1] - bb)] };
        rrPath(ctx, x + bl, y + bt, Math.max(0, w - bl - brr), Math.max(0, h - bt - bb), Ri); ctx.clip(); }
    }
    for (const c of el.childNodes) { if (c.nodeType === 1) paintEl(ctx, c, st); else if (c.nodeType === 3) paintText(ctx, c, cs, st); }
    if (typeof clip !== 'undefined' && clip && w > 0 && h > 0) ctx.restore();
  }

  async function svgImages(root) {
    const imgs = new Map(); const list = [...root.querySelectorAll('svg')];
    await Promise.all(list.map(s => new Promise(res => { try { const r = s.getBoundingClientRect(), c = s.cloneNode(true); c.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); c.setAttribute('width', Math.round(r.width)); c.setAttribute('height', Math.round(r.height));
      c.setAttribute('style', 'font-family:Helvetica,Arial,sans-serif'); const im = new Image(); im.onload = () => { imgs.set(s, im); res(); }; im.onerror = () => res();
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(c)); } catch (e) { res(); } })));
    return imgs;
  }

  /* hauteurs de coupure : au début d'une carte plutôt qu'au milieu */
  function pageBreaks(section) {
    const top = section.getBoundingClientRect().top, H = section.getBoundingClientRect().height, CH = PH - 2 * MT;
    const cand = [...section.querySelectorAll('.fa,.ev2,.pbox,h3.st,.wg,.fh,.vcard,.cr,tbody tr,.cl2 h3')].map(e => e.getBoundingClientRect().top).filter(t => t > top + 8).sort((a, b) => a - b);
    const out = []; let y = top; const end = top + H;
    while (y < end - 1) { let e = y + CH; if (e >= end) e = end; else { const ok = cand.filter(c => c > y + CH * .3 && c <= e); if (ok.length) e = ok[ok.length - 1]; } out.push([y, e]); y = e; }
    return out;
  }

  const toBytes = blob => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(new Uint8Array(fr.result)); fr.readAsArrayBuffer(blob); });
  function pdfFromJpegs(pages, MW, MH) {
    const enc = new TextEncoder(), chunks = [], off = []; let pos = 0; const push = b => { const u = typeof b === 'string' ? enc.encode(b) : b; chunks.push(u); pos += u.length; };
    const N = 2 + pages.length * 3; push('%PDF-1.4\n');
    off[1] = pos; push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    off[2] = pos; push(`2 0 obj\n<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] >>\nendobj\n`);
    pages.forEach((p, i) => { const po = 3 + i * 3, co = po + 1, io = po + 2, cont = `q ${MW} 0 0 ${MH} 0 0 cm /Im0 Do Q`;
      off[po] = pos; push(`${po} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${MW} ${MH}] /Resources << /XObject << /Im0 ${io} 0 R >> >> /Contents ${co} 0 R >>\nendobj\n`);
      off[co] = pos; push(`${co} 0 obj\n<< /Length ${cont.length} >>\nstream\n${cont}\nendstream\nendobj\n`);
      off[io] = pos; push(`${io} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.data.length} >>\nstream\n`); push(p.data); push('\nendstream\nendobj\n'); });
    const xr = pos; push(`xref\n0 ${N + 1}\n0000000000 65535 f \n`); for (let i = 1; i <= N; i++) push(String(off[i]).padStart(10, '0') + ' 00000 n \n');
    push(`trailer\n<< /Size ${N + 1} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF\n`); return new Blob(chunks, { type: 'application/pdf' });
  }

  /* html (document complet, une ou plusieurs <section class="page">) → Blob PDF */
  window.epsPdfFromHtml = async (html, onProg) => {
    const land = !/class="page fiche"/.test(html); PW = land ? 1123 : 794; PH = land ? 794 : 1123;
    const f = await openFrame(html); const pages = [];
    try { const doc = f.contentDocument, secs = [...doc.querySelectorAll('section.page')]; if (!secs.length) secs.push(doc.body);
      for (let si = 0; si < secs.length; si++) { const sec = secs[si], imgs = await svgImages(sec), br = pageBreaks(sec);
        for (let pi = 0; pi < br.length; pi++) { const [y0, y1] = br[pi], cv = document.createElement('canvas'); cv.width = PW * SC; cv.height = PH * SC; const ctx = cv.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.save(); ctx.scale(SC, SC); ctx.beginPath(); ctx.rect(0, MT, PW, y1 - y0); ctx.clip(); ctx.translate(0, MT - y0);
          paintEl(ctx, sec, { y0, y1, imgs }); ctx.restore();
          const blob = await new Promise(res => cv.toBlob(res, 'image/jpeg', .86)); pages.push({ data: await toBytes(blob), w: cv.width, h: cv.height }); cv.width = cv.height = 1;
          if (onProg) onProg(si, secs.length, pages.length); await sleep(0); } }
    } finally { f.remove(); }
    return land ? pdfFromJpegs(pages, 841.89, 595.28) : pdfFromJpegs(pages, 595.28, 841.89);
  };
})();

/* bouton « PDF » commun (fiches et bilans) : crée le PDF puis partage / télécharge */
window.epsSavePdf = async (html, name, title, btn) => {
  const t0 = btn && btn.textContent; if (btn) { btn.disabled = true; btn.textContent = '⏳ Création du PDF…'; }
  try { const pb = await window.epsPdfFromHtml(html), pn = String(name).replace(/\.html$/, '') + '.pdf', f = new File([pb], pn, { type: 'application/pdf' });
    try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title }); return; } } catch (er) { if (er && er.name === 'AbortError') return; }
    const u = URL.createObjectURL(pb), a = document.createElement('a'); a.href = u; a.download = pn; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); toast('PDF téléchargé ✔');
  } catch (er) { toast('PDF impossible — utilise « Imprimer / PDF »'); } finally { if (btn) { btn.disabled = false; btn.textContent = t0; } }
};
