/* =========================================================
   EPS ONE — Petit générateur de PDF autonome (hors ligne, sans bibliothèque)
   Pages A4, rectangles (pleins / pointillés / arrondis), texte Helvetica (accents français).
   Coordonnées en mm, origine en haut à gauche.
   ========================================================= */
const PdfMini = (() => {
  const WB = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,761,556,761,278,556,500,1000,556,556,333,1000,667,333,1000,761,611,761,761,278,278,500,500,350,556,1000,333,1000,556,333,944,761,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556], WR = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,761,556,761,222,556,333,1000,556,556,333,1000,667,333,1000,761,611,761,761,222,222,333,333,350,556,1000,333,1000,500,333,944,761,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500];   // largeurs Helvetica-Bold / Helvetica (codes 32 à 255, en 1/1000 em)
  const CP = { 8364: 128, 8218: 130, 402: 131, 8222: 132, 8230: 133, 8224: 134, 8225: 135, 710: 136, 8240: 137, 352: 138, 8249: 139, 338: 140, 381: 142, 8216: 145, 8217: 146, 8220: 147, 8221: 148, 8226: 149, 8211: 150, 8212: 151, 732: 152, 8482: 153, 353: 154, 8250: 155, 339: 156, 382: 158, 376: 159 };
  const enc = s => [...String(s)].map(ch => { const c = ch.codePointAt(0); return c < 128 || (c >= 160 && c < 256) ? c : CP[c] || (ch.normalize('NFD').charCodeAt(0) < 128 ? ch.normalize('NFD').charCodeAt(0) : 63); });
  const K = 72 / 25.4, f = n => (Math.round(n * 100) / 100).toString();
  const rgb = h => { h = (h || '#000').replace('#', ''); if (h.length === 3) h = h.replace(/./g, c => c + c); return [0, 2, 4].map(i => f(parseInt(h.slice(i, i + 2), 16) / 255)).join(' '); };
  return function () {
    const pages = []; let cur = null; const PH = 297;
    const api = {
      get pages() { return pages.length; },
      page() { cur = []; pages.push(cur); return api; },
      width(s, size, bold) { const T = bold ? WB : WR; return enc(s).reduce((a, c) => a + (T[c - 32] || 556), 0) / 1000 * size / K; },   // en mm (size en pt)
      fit(s, size, bold, maxW) { s = String(s); if (api.width(s, size, bold) <= maxW) return s; while (s.length > 1 && api.width(s + '…', size, bold) > maxW) s = s.slice(0, -1); return s.trimEnd() + '…'; },
      rect(x, y, w, h, o = {}) {
        const X = x * K, Y = (PH - y - h) * K, Wd = w * K, Hd = h * K, r = Math.min((o.r || 0) * K, Wd / 2, Hd / 2), c = .5523 * r;
        let p = r ? `${f(X + r)} ${f(Y)} m ${f(X + Wd - r)} ${f(Y)} l ${f(X + Wd - r + c)} ${f(Y)} ${f(X + Wd)} ${f(Y + r - c)} ${f(X + Wd)} ${f(Y + r)} c ${f(X + Wd)} ${f(Y + Hd - r)} l ${f(X + Wd)} ${f(Y + Hd - r + c)} ${f(X + Wd - r + c)} ${f(Y + Hd)} ${f(X + Wd - r)} ${f(Y + Hd)} c ${f(X + r)} ${f(Y + Hd)} l ${f(X + r - c)} ${f(Y + Hd)} ${f(X)} ${f(Y + Hd - r + c)} ${f(X)} ${f(Y + Hd - r)} c ${f(X)} ${f(Y + r)} l ${f(X)} ${f(Y + r - c)} ${f(X + r - c)} ${f(Y)} ${f(X + r)} ${f(Y)} c h` : `${f(X)} ${f(Y)} ${f(Wd)} ${f(Hd)} re`;
        cur.push('q ' + (o.fill ? rgb(o.fill) + ' rg ' : '') + (o.stroke ? rgb(o.stroke) + ' RG ' + f((o.lw || .3) * K) + ' w ' + (o.dash ? `[${o.dash.map(d => f(d * K)).join(' ')}] 0 d ` : '') : '') + p + (o.fill && o.stroke ? ' B' : o.fill ? ' f' : ' S') + ' Q');
        return api; },
      text(s, x, y, size, o = {}) {   // y = ligne de base (mm)
        const w = api.width(s, size, o.bold), X = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
        const str = enc(s).map(c => c === 40 || c === 41 || c === 92 ? '\\' + String.fromCharCode(c) : String.fromCharCode(c)).join('');
        cur.push(`BT ${rgb(o.color)} rg /${o.bold ? 'F2' : 'F1'} ${f(size)} Tf ${f(X * K)} ${f((PH - y) * K)} Td (${str}) Tj ET`); return api; },
      blob() {
        const obj = [], add = s => { obj.push(s); return obj.length; };
        add('<< /Type /Catalog /Pages 2 0 R >>'); add(''); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
        const kids = pages.map(pg => { const st = pg.join('\n'), c = add(`<< /Length ${st.length} >>\nstream\n${st}\nendstream`);
          return add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${c} 0 R >>`); });
        obj[1] = `<< /Type /Pages /Kids [${kids.map(k => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
        let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'; const off = [];
        obj.forEach((o, i) => { off.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
        const x = out.length; out += `xref\n0 ${obj.length + 1}\n0000000000 65535 f \n` + off.map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${obj.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
        const b = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) b[i] = out.charCodeAt(i) & 255;
        return new Blob([b], { type: 'application/pdf' }); }
    };
    return api;
  };
})();
/* Envoie un PDF : feuille de partage (Mail, Fichiers, AirDrop…) si possible, sinon téléchargement */
async function epsSharePdf(blob, name, title) {
  const file = new File([blob], name, { type: 'application/pdf' });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); toast('PDF téléchargé ✔');
}
/* Plusieurs PDF d'un coup : [{ blob, name }] — une seule feuille de partage (Mail joint tous les fichiers), sinon téléchargements successifs */
async function epsSharePdfs(items, title) {
  const files = items.map(x => new File([x.blob], x.name, { type: 'application/pdf' }));
  try { if (navigator.canShare && navigator.canShare({ files })) { await navigator.share({ files, title }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  items.forEach((x, i) => setTimeout(() => { const u = URL.createObjectURL(x.blob), a = document.createElement('a'); a.href = u; a.download = x.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); }, i * 400));
  toast(`${items.length} PDF téléchargé${items.length > 1 ? 's' : ''} ✔`);
}
