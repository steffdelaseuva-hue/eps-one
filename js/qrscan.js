/* =========================================================
   Lecteur de QR code autonome (hors ligne) — EPS ONE
   Pendant de js/qr.js : décode une image (caméra) sans réseau.
   Versions 1 à 10, niveaux L/M/Q/H, modes octet / numérique /
   alphanumérique, correction d'erreurs Reed-Solomon.
   QRScan.decode({data, width, height}) -> texte ou null
   (data : RGBA d'un ImageData, ou niveaux de gris si gray:true)
   ========================================================= */
const QRScan = (() => {
  /* ---------- Corps de Galois GF(256), polynôme 0x11D ---------- */
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  for (let i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11D; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  const mul = (a, b) => a && b ? EXP[LOG[a] + LOG[b]] : 0;
  const div = (a, b) => a ? EXP[(LOG[a] + 255 - LOG[b]) % 255] : 0;
  const pw = (x, e) => e === 0 ? 1 : x ? EXP[(LOG[x] * e) % 255] : 0;
  const synd = (cw, nec) => { const S = new Array(nec); for (let j = 0; j < nec; j++) { let s = 0; const a = EXP[j]; for (let i = 0; i < cw.length; i++) s = mul(s, a) ^ cw[i]; S[j] = s; } return S; };

  /* Corrige un bloc (données + correction) sur place ; false si irrécupérable */
  function rsCorrect(cw, nec) {
    const n = cw.length, S = synd(cw, nec);
    if (S.every(s => !s)) return true;
    let C = [1], B = [1], L = 0, m = 1, b = 1;                 // Berlekamp-Massey
    for (let k = 0; k < nec; k++) {
      let d = S[k]; for (let i = 1; i <= L; i++) d ^= mul(C[i] || 0, S[k - i]);
      if (!d) { m++; continue; }
      const coef = div(d, b), T = C.slice();
      while (C.length < B.length + m) C.push(0);
      for (let i = 0; i < B.length; i++) C[i + m] ^= mul(coef, B[i]);
      if (2 * L <= k) { L = k + 1 - L; B = T; b = d; m = 1; } else m++;
    }
    if (2 * L > nec) return false;
    const pos = [];                                              // Chien
    for (let i = 0; i < n; i++) { const xi = EXP[(255 - i % 255) % 255]; let v = 0; for (let j = L; j >= 0; j--) v = mul(v, xi) ^ (C[j] || 0); if (!v) pos.push(i); }
    if (pos.length !== L) return false;
    const O = new Array(nec).fill(0);                            // Forney
    for (let i = 0; i < nec; i++) for (let j = 0; j <= L && j <= i; j++) O[i] ^= mul(S[i - j], C[j] || 0);
    for (const i of pos) {
      const X = EXP[i % 255], xi = EXP[(255 - i % 255) % 255];
      let o = 0; for (let j = nec - 1; j >= 0; j--) o = mul(o, xi) ^ O[j];
      let dl = 0; for (let j = 1; j <= L; j += 2) dl ^= mul(C[j] || 0, pw(xi, j - 1));
      if (!dl) return false;
      cw[n - 1 - i] ^= mul(X, div(o, dl));
    }
    return synd(cw, nec).every(s => !s);
  }

  /* ---------- Tables de la norme (versions 1 à 10) ---------- */
  // [codewords correction / bloc, nb blocs gr.1, données gr.1, nb blocs gr.2, données gr.2]
  const TAB = {
    L: [null, [7, 1, 19, 0, 0], [10, 1, 34, 0, 0], [15, 1, 55, 0, 0], [20, 1, 80, 0, 0], [26, 1, 108, 0, 0], [18, 2, 68, 0, 0], [20, 2, 78, 0, 0], [24, 2, 97, 0, 0], [30, 2, 116, 0, 0], [18, 2, 68, 2, 69]],
    M: [null, [10, 1, 16, 0, 0], [16, 1, 28, 0, 0], [26, 1, 44, 0, 0], [18, 2, 32, 0, 0], [24, 2, 43, 0, 0], [16, 4, 27, 0, 0], [18, 4, 31, 0, 0], [22, 2, 38, 2, 39], [22, 3, 36, 2, 37], [26, 4, 43, 1, 44]],
    Q: [null, [13, 1, 13, 0, 0], [22, 1, 22, 0, 0], [18, 2, 17, 0, 0], [26, 2, 24, 0, 0], [18, 2, 15, 2, 16], [24, 4, 19, 0, 0], [18, 2, 14, 4, 15], [22, 4, 18, 2, 19], [20, 4, 16, 4, 17], [24, 6, 19, 2, 20]],
    H: [null, [17, 1, 9, 0, 0], [28, 1, 16, 0, 0], [22, 2, 13, 0, 0], [16, 4, 9, 0, 0], [22, 2, 11, 2, 12], [28, 4, 15, 0, 0], [26, 4, 13, 1, 14], [26, 4, 14, 2, 15], [24, 4, 12, 4, 13], [28, 6, 15, 2, 16]]
  };
  const ECL = ['M', 'L', 'H', 'Q'];                              // 2 bits de format -> niveau
  const ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
  const MASKS = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
    (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0];
  const FORMATS = [];
  for (let d = 0; d < 32; d++) { let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); FORMATS.push([((d << 10) | r) ^ 0x5412, d]); }
  const popc = x => { let c = 0; while (x) { c += x & 1; x >>>= 1; } return c; };
  const AN = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

  /* Modules « fonction » (non-données) d'une version */
  function funcMap(ver) {
    const n = ver * 4 + 17, F = Array.from({ length: n }, () => new Uint8Array(n));
    const set = (x, y) => { if (x >= 0 && y >= 0 && x < n && y < n) F[y][x] = 1; };
    for (let i = 0; i < n; i++) { set(6, i); set(i, 6); }
    [[3, 3], [n - 4, 3], [3, n - 4]].forEach(([cx, cy]) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) set(cx + dx, cy + dy); });
    const al = ALIGN[ver], L = al.length;
    for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === L - 1) || (i === L - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(al[i] + dx, al[j] + dy);
    }
    for (let i = 0; i <= 8; i++) { set(8, i); set(i, 8); }
    for (let i = 0; i < 8; i++) { set(n - 1 - i, 8); set(8, n - 1 - i); }
    if (ver >= 7) for (let i = 0; i < 18; i++) { const a = n - 11 + i % 3, c = Math.floor(i / 3); set(a, c); set(c, a); }
    return F;
  }

  /* ---------- Matrice de modules -> texte ---------- */
  function decodeMatrix(M) {
    const n = M.length, ver = (n - 17) / 4;
    if (ver < 1 || ver > 10 || ver % 1) return null;
    const g = (x, y) => M[y][x] ? 1 : 0;
    let f1 = 0, f2 = 0;
    for (let x = 0; x <= 5; x++) f1 = (f1 << 1) | g(x, 8);
    f1 = (f1 << 1) | g(7, 8); f1 = (f1 << 1) | g(8, 8); f1 = (f1 << 1) | g(8, 7);
    for (let y = 5; y >= 0; y--) f1 = (f1 << 1) | g(8, y);
    for (let y = n - 1; y >= n - 7; y--) f2 = (f2 << 1) | g(8, y);
    for (let x = n - 8; x < n; x++) f2 = (f2 << 1) | g(x, 8);
    let best = null, bd = 99;
    for (const [c, d] of FORMATS) { const k = Math.min(popc(c ^ f1), popc(c ^ f2)); if (k < bd) { bd = k; best = d; } }
    if (bd > 3) return null;
    const lvl = ECL[best >> 3], mask = MASKS[best & 7], [ecLen, b1, d1, b2, d2] = TAB[lvl][ver];
    const total = b1 * (d1 + ecLen) + b2 * (d2 + ecLen), F = funcMap(ver), raw = new Uint8Array(total);
    let i = 0;
    for (let right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let v = 0; v < n; v++) for (let j = 0; j < 2; j++) {
        const x = right - j, up = ((right + 1) & 2) === 0, y = up ? n - 1 - v : v;
        if (!F[y][x] && i < total * 8) { if (g(x, y) ^ (mask(x, y) ? 1 : 0)) raw[i >>> 3] |= 1 << (7 - (i & 7)); i++; }
      }
    }
    // Désentrelacement des blocs + correction
    const blocks = []; for (let k = 0; k < b1 + b2; k++) blocks.push({ d: [], e: [], n: k < b1 ? d1 : d2 });
    let p = 0;
    for (let k = 0; k < Math.max(d1, d2); k++) blocks.forEach(b => { if (k < b.n) b.d.push(raw[p++]); });
    for (let k = 0; k < ecLen; k++) blocks.forEach(b => b.e.push(raw[p++]));
    const data = [];
    for (const b of blocks) { const cw = [...b.d, ...b.e]; if (!rsCorrect(cw, ecLen)) return null; data.push(...cw.slice(0, b.n)); }
    return parseData(data, ver);
  }

  function parseData(bytes, ver) {
    let p = 0; const N = bytes.length * 8;
    const bit = k => { if (p + k > N) throw new Error('fin'); let v = 0; for (let i = 0; i < k; i++) { v = (v << 1) | ((bytes[p >> 3] >> (7 - (p & 7))) & 1); p++; } return v; };
    let txt = '';
    try {
      while (p + 4 <= N) {
        const mode = bit(4);
        if (mode === 0) break;
        if (mode === 4) { const k = bit(ver < 10 ? 8 : 16), a = new Uint8Array(k); for (let i = 0; i < k; i++) a[i] = bit(8); txt += new TextDecoder().decode(a); }
        else if (mode === 1) { let k = bit(ver < 10 ? 10 : 12); while (k >= 3) { txt += String(bit(10)).padStart(3, '0'); k -= 3; } if (k === 2) txt += String(bit(7)).padStart(2, '0'); else if (k === 1) txt += String(bit(4)); }
        else if (mode === 2) { let k = bit(ver < 10 ? 9 : 11); while (k >= 2) { const v = bit(11); txt += AN[Math.floor(v / 45)] + AN[v % 45]; k -= 2; } if (k) txt += AN[bit(6)]; }
        else if (mode === 7) bit(8);
        else return txt || null;
      }
    } catch (e) { return txt || null; }
    return txt;
  }

  /* ---------- Image -> noir / blanc (seuil local par blocs de 8 px) ---------- */
  function binarize(gray, w, h) {
    const B = 8, bw = Math.ceil(w / B), bh = Math.ceil(h / B), avg = new Float32Array(bw * bh), out = new Uint8Array(w * h);
    for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
      let s = 0, c = 0, mn = 255, mx = 0;
      for (let y = by * B; y < Math.min(h, by * B + B); y++) for (let x = bx * B; x < Math.min(w, bx * B + B); x++) { const v = gray[y * w + x]; s += v; c++; if (v < mn) mn = v; if (v > mx) mx = v; }
      let a = s / c;
      if (mx - mn <= 24) { a = mn / 2; if (by > 0 && bx > 0) { const nb = (avg[(by - 1) * bw + bx] + 2 * avg[by * bw + bx - 1] + avg[(by - 1) * bw + bx - 1]) / 4; if (mn < nb) a = nb; } }
      avg[by * bw + bx] = a;
    }
    for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
      let s = 0, c = 0;
      for (let yy = Math.max(0, by - 2); yy <= Math.min(bh - 1, by + 2); yy++) for (let xx = Math.max(0, bx - 2); xx <= Math.min(bw - 1, bx + 2); xx++) { s += avg[yy * bw + xx]; c++; }
      const t = s / c;
      for (let y = by * B; y < Math.min(h, by * B + B); y++) for (let x = bx * B; x < Math.min(w, bx * B + B); x++) out[y * w + x] = gray[y * w + x] <= t ? 1 : 0;
    }
    return out;
  }

  /* ---------- Motifs de repérage (1:1:3:1:1) ---------- */
  const ratioOK = (st, tol = 2) => { let t = 0; for (const c of st) { if (!c) return false; t += c; } if (t < 7) return false;
    const m = t / 7, v = m / tol; return Math.abs(m - st[0]) < v && Math.abs(m - st[1]) < v && Math.abs(3 * m - st[2]) < 3 * v && Math.abs(m - st[3]) < v && Math.abs(m - st[4]) < v; };

  function findFinders(bin, w, h) {
    const at = (x, y) => x >= 0 && y >= 0 && x < w && y < h ? bin[y * w + x] : -1;
    // Vérification croisée le long d'un axe (dx,dy) depuis (cx,cy) ; renvoie [centre, total] en coordonnée continue
    const check = (cx, cy, dx, dy, orig) => {
      const maxC = orig, st = [0, 0, 0, 0, 0]; let x = cx, y = cy, bd = 0, fd = 0;
      while (at(x, y) === 1) { st[2]++; bd++; x -= dx; y -= dy; }
      if (at(x, y) < 0) return null;
      while (at(x, y) === 0 && st[1] <= maxC) { st[1]++; x -= dx; y -= dy; }
      if (at(x, y) < 0 || st[1] > maxC) return null;
      while (at(x, y) === 1 && st[0] <= maxC) { st[0]++; x -= dx; y -= dy; }
      if (st[0] > maxC) return null;
      x = cx + dx; y = cy + dy;
      while (at(x, y) === 1) { st[2]++; fd++; x += dx; y += dy; }
      if (at(x, y) < 0) return null;
      while (at(x, y) === 0 && st[3] < maxC) { st[3]++; x += dx; y += dy; }
      if (at(x, y) < 0 || st[3] >= maxC) return null;
      while (at(x, y) === 1 && st[4] < maxC) { st[4]++; x += dx; y += dy; }
      if (st[4] >= maxC) return null;
      const t = st.reduce((a, b) => a + b, 0);
      if (5 * Math.abs(t - orig) >= 2 * orig || !ratioOK(st, 1.6)) return null;
      return [(dx ? cx : cy) + (fd - bd) / 2 + 1, t];
    };
    const C = [];
    const handle = (st, x, y) => {
      const tot = st.reduce((a, b) => a + b, 0), cx0 = x - st[4] - st[3] - st[2] / 2;
      const v = check(Math.floor(cx0), y, 0, 1, tot); if (!v) return false;
      const cy = v[0], hz = check(Math.floor(cx0), Math.floor(cy), 1, 0, tot); if (!hz) return false;
      const cx = hz[0], ms = (v[1] + hz[1]) / 14;
      const e = C.find(c => Math.abs(c.x - cx) <= ms && Math.abs(c.y - cy) <= ms && Math.abs(c.ms - ms) <= Math.max(1, c.ms * .5));
      if (e) { const k = e.n; e.x = (e.x * k + cx) / (k + 1); e.y = (e.y * k + cy) / (k + 1); e.ms = (e.ms * k + ms) / (k + 1); e.n++; }
      else C.push({ x: cx, y: cy, ms, n: 1 });
      return true;
    };
    for (let y = 0; y < h; y++) {
      const st = [0, 0, 0, 0, 0]; let s = 0;
      for (let x = 0; x < w; x++) {
        if (bin[y * w + x]) { if (s & 1) s++; st[s]++; }
        else if (!(s & 1)) {
          if (s === 4) {
            if (ratioOK(st) && handle(st, x, y + .5 | 0)) { st.fill(0); s = 0; }
            else { st[0] = st[2]; st[1] = st[3]; st[2] = st[4]; st[3] = 1; st[4] = 0; s = 3; }
          } else st[++s]++;
        } else st[s]++;
      }
      if (s === 4 && ratioOK(st)) handle(st, w, y);
    }
    return C;
  }

  /* Petit motif d'alignement (anneau clair autour d'un point sombre) près de (ex,ey) */
  function findAlign(bin, w, h, ex, ey, ms) {
    const r = Math.ceil(ms * 5), at = (x, y) => x >= 0 && y >= 0 && x < w && y < h ? bin[y * w + x] : -1;
    const near = (v) => v >= ms * .4 && v <= ms * 1.7 + 1;
    let best = null, bd = Infinity;
    for (let y = Math.max(0, Math.round(ey - r)); y <= Math.min(h - 1, Math.round(ey + r)); y++) {
      const runs = []; let x = Math.max(0, Math.round(ex - r)), end = Math.min(w - 1, Math.round(ex + r));
      while (x <= end) { const c = at(x, y); let k = 0; while (x <= end && at(x, y) === c) { k++; x++; } runs.push([c, x - k, k]); }
      for (let i = 1; i + 3 < runs.length; i++) {
        const [c0] = runs[i - 1], a = runs[i], b = runs[i + 1], c = runs[i + 2], [c4] = runs[i + 3];
        if (c0 !== 1 || a[0] !== 0 || b[0] !== 1 || c[0] !== 0 || c4 !== 1 || !near(a[2]) || !near(b[2]) || !near(c[2])) continue;
        const cx = b[1] + b[2] / 2, ix = Math.floor(cx);
        let up = 0, dn = 0, yy = y; while (at(ix, yy) === 1) { up++; yy--; } let wu = 0; while (at(ix, yy) === 0) { wu++; yy--; }
        yy = y + 1; while (at(ix, yy) === 1) { dn++; yy++; } let wd = 0; while (at(ix, yy) === 0) { wd++; yy++; }
        if (!near(up + dn) || !near(wu) || !near(wd)) continue;
        const cy = y + (dn - up) / 2 + 1, d = Math.hypot(cx - ex, cy - ey);
        if (d < bd) { bd = d; best = { x: cx, y: cy }; }
      }
    }
    return best;
  }

  /* Homographie : 4 points source -> 4 points destination */
  function homography(src, dst) {
    const A = [];
    for (let i = 0; i < 4; i++) { const [x, y] = src[i], [X, Y] = dst[i];
      A.push([x, y, 1, 0, 0, 0, -x * X, -y * X, X]); A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y, Y]); }
    for (let c = 0; c < 8; c++) {
      let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      if (Math.abs(A[p][c]) < 1e-12) return null; [A[c], A[p]] = [A[p], A[c]];
      for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k]; }
    }
    const h = A.map((r, i) => r[8] / r[i]);
    return (x, y) => { const d = h[6] * x + h[7] * y + 1; return [(h[0] * x + h[1] * y + h[2]) / d, (h[3] * x + h[4] * y + h[5]) / d]; };
  }

  function sample(bin, w, h, T, n) {
    const M = [];
    for (let r = 0; r < n; r++) { const row = []; for (let c = 0; c < n; c++) { const [x, y] = T(c + .5, r + .5), xi = Math.floor(x), yi = Math.floor(y);
      if (xi < 0 || yi < 0 || xi >= w || yi >= h) return null; row.push(bin[yi * w + xi] === 1); } M.push(row); }
    return M;
  }

  function tryTriple(bin, w, h, P) {
    // Coin haut-gauche = sommet opposé au plus grand côté
    const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const s = [[d(P[1], P[2]), 0], [d(P[0], P[2]), 1], [d(P[0], P[1]), 2]].sort((a, b) => b[0] - a[0]);
    const TL = P[s[0][1]], o = P.filter(p => p !== TL); let TR = o[0], BL = o[1];
    if ((TR.x - TL.x) * (BL.y - TL.y) - (TR.y - TL.y) * (BL.x - TL.x) < 0) [TR, BL] = [BL, TR];
    // Les tailles mesurées le long des axes x/y sont gonflées quand le code est tourné
    const th = Math.atan2(TR.y - TL.y, TR.x - TL.x), ms = (TL.ms + TR.ms + BL.ms) / 3 * Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th)));
    const raw = (d(TL, TR) + d(TL, BL)) / 2 / ms + 7;
    const dims = []; for (let v = 1; v <= 10; v++) dims.push(v * 4 + 17);
    dims.sort((a, b) => Math.abs(a - raw) - Math.abs(b - raw));
    for (const n of dims.slice(0, 3)) {
      if (Math.abs(n - raw) > 8) continue;
      const src = [[3.5, 3.5], [n - 3.5, 3.5], [3.5, n - 3.5]], dst = [[TL.x, TL.y], [TR.x, TR.y], [BL.x, BL.y]], tries = [];
      if (n > 21) { const k = (n - 10) / (n - 7), ex = TL.x + (TR.x - TL.x + BL.x - TL.x) * k, ey = TL.y + (TR.y - TL.y + BL.y - TL.y) * k;
        const a = findAlign(bin, w, h, ex, ey, ms); if (a) tries.push([[n - 6.5, n - 6.5], [a.x, a.y]]); }
      // Coin bas-droit estimé (parallélogramme), puis petits décalages pour absorber la perspective
      const ux = (TR.x - TL.x) / (n - 7), uy = (TR.y - TL.y) / (n - 7), vx = (BL.x - TL.x) / (n - 7), vy = (BL.y - TL.y) / (n - 7), off = [];
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) off.push([i, j]);
      off.sort((a, b) => Math.abs(a[0]) + Math.abs(a[1]) - Math.abs(b[0]) - Math.abs(b[1]));
      off.forEach(([i, j]) => tries.push([[n - 3.5, n - 3.5], [TR.x + BL.x - TL.x + (ux * i + vx * j) * .75, TR.y + BL.y - TL.y + (uy * i + vy * j) * .75]]));
      for (const [s4, d4] of tries) {
        const T = homography([...src, s4], [...dst, d4]); if (!T) continue;
        const M = sample(bin, w, h, T, n); if (!M) continue;
        const txt = decodeMatrix(M); if (txt != null) return txt;
      }
    }
    return null;
  }

  function decode(img) {
    const { width: w, height: h, data } = img; let gray = data;
    if (!img.gray) { gray = new Uint8Array(w * h); for (let i = 0, j = 0; i < gray.length; i++, j += 4) gray[i] = (data[j] * 77 + data[j + 1] * 150 + data[j + 2] * 29) >> 8; }
    const bin = binarize(gray, w, h);
    let C = findFinders(bin, w, h);
    if (C.length < 3) return null;
    const strong = C.filter(c => c.n >= 2); if (strong.length >= 3) C = strong;
    C = C.sort((a, b) => b.n - a.n).slice(0, 8);
    const T = [];
    for (let i = 0; i < C.length; i++) for (let j = i + 1; j < C.length; j++) for (let k = j + 1; k < C.length; k++) {
      const P = [C[i], C[j], C[k]], m = P.map(p => p.ms);
      if (Math.max(...m) / Math.min(...m) > 1.6) continue;
      const L = [Math.hypot(P[0].x - P[1].x, P[0].y - P[1].y), Math.hypot(P[0].x - P[2].x, P[0].y - P[2].y), Math.hypot(P[1].x - P[2].x, P[1].y - P[2].y)].sort((a, b) => a - b);
      const mm = (m[0] + m[1] + m[2]) / 3; if (L[0] / mm < 8 || L[0] / mm > 70) continue;
      const sc = Math.abs(L[1] / L[0] - 1) + Math.abs(L[2] / Math.hypot(L[0], L[1]) - 1);
      if (sc < .6) T.push([sc, P]);
    }
    T.sort((a, b) => a[0] - b[0]);
    for (const [, P] of T.slice(0, 4)) { const r = tryTriple(bin, w, h, P); if (r != null) return r; }
    return null;
  }

  return { decode, decodeMatrix, rsCorrect };
})();
if (typeof module !== 'undefined') module.exports = QRScan;
