/* =========================================================
   EPS ONE — Outil « Acrosport »
   Banque de pyramides (dessins originaux générés en SVG)
   Filtres : effectif (duo / trio / quatuor), position des porteurs
   (horizontal, assis, debout, trépied), position du voltigeur (debout,
   horizontale, semi-renversé, renversé), hauteur, appuis au sol.
   Liaisons dynamiques avec vidéo.
   ========================================================= */
if (!document.getElementById('ac-css')) document.head.insertAdjacentHTML('beforeend', `<style id="ac-css">
.ac-tabs{flex-wrap:wrap}.ac-tabs button{flex:1 1 28%;min-width:0;font-size:.82rem;padding:10px 4px}
.ac-gold{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;background:linear-gradient(135deg,#D23B2F,#8E1B1B);color:#fff;font-weight:900;font-size:1.1rem;line-height:1.15;box-shadow:var(--shadow)}
.ac-gold .ic{font-size:1.9rem;line-height:1}.ac-gold small{display:block;font-weight:700;font-size:.78rem;opacity:.95;margin-top:3px}</style>`);
ICONS.acrosport = '<circle cx="8" cy="12.5" r="1.6"/><path d="M4 21v-4l4-2 4 2v4M8 15v-1"/><circle cx="12" cy="4" r="1.6"/><path d="M12 6v4M9 7.5l3 1 3-1M12 10l-2 3.5M12 10l2 3.5"/><circle cx="16" cy="12.5" r="1.6"/><path d="M12 21v-4M16 15v-1M20 21v-4l-4-2"/>';

/* ---------- Poses (repère : sol y = 0, y vers le haut, personne debout ≈ 90) ---------- */
const AC = (() => {
  const arms = (n, a, m) => {
    const [x, y] = n;
    switch (a) {
      case 'up': return [[x - 7, y + 17], [x - 10, y + 34], [x + 7, y + 17], [x + 10, y + 34]];
      case 'side': return [[x - 18, y], [x - 35, y + 2], [x + 18, y], [x + 35, y + 2]];
      case 'front': return [[x + 17 * m, y - 1], [x + 34 * m, y], [x + 16 * m, y - 3], [x + 33 * m, y - 2]];
      case 'hold': return [[x + 10 * m, y - 15], [x + 24 * m, y - 9], [x + 9 * m, y - 16], [x + 22 * m, y - 11]];
      case 'upfront': return [[x + 12 * m, y + 12], [x + 24 * m, y + 26], [x + 11 * m, y + 11], [x + 22 * m, y + 25]];
      case 'hip': return [[x - 12, y - 14], [x - 5, y - 27], [x + 12, y - 14], [x + 5, y - 27]];
      default: return [[x - 5, y - 17], [x - 7, y - 34], [x + 5, y - 17], [x + 7, y - 34]];
    }
  };
  const P = (h, n, p, k1, f1, k2, f2, ar) => ({ h, n, p, k1, f1, k2, f2, e1: ar[0], m1: ar[1], e2: ar[2], m2: ar[3] });
  const poses = {
    // debout
    stand: (x, y, o) => { const m = o.m || 1, w = o.wide ? 12 : 5;
      return { j: P([x, y + 87], [x, y + 78], [x, y + 50], [x - w + 1, y + 26], [x - w, y], [x + w - 1, y + 26], [x + w, y], arms([x, y + 78], o.a, m)), sol: 2 }; },
    // debout sur une jambe, jambe arrière tendue (arabesque)
    arab: (x, y, o) => { const m = o.m || 1;
      return { j: P([x + 22 * m, y + 80], [x + 15 * m, y + 73], [x, y + 50], [x, y + 26], [x, y], [x - 24 * m, y + 55], [x - 49 * m, y + 60], arms([x + 15 * m, y + 73], o.a || 'upfront', m)), sol: 1 }; },
    // à quatre pattes (banc / table)
    table: (x, y, o) => { const m = o.m || 1;
      return { j: P([x + 27 * m, y + 42], [x + 19 * m, y + 36], [x - 16 * m, y + 27], [x - 16 * m, y], [x - 40 * m, y + 1], [x - 14 * m, y], [x - 38 * m, y + 1], [[x + 19 * m, y + 18], [x + 19 * m, y], [x + 21 * m, y + 18], [x + 21 * m, y]]), sol: 4, top: [x, y + 35] }; },
    // allongé sur le dos, jambes à la verticale
    dos: (x, y, o) => { const m = o.m || 1;
      return { j: P([x - 38 * m, y + 6], [x - 30 * m, y + 5], [x, y + 5], [x + 2 * m, y + 30], [x + 2 * m, y + 55], [x + 4 * m, y + 30], [x + 4 * m, y + 55], [[x - 30 * m, y + 22], [x - 29 * m, y + 40], [x - 28 * m, y + 22], [x - 27 * m, y + 40]]), sol: 1, top: [x + 3 * m, y + 58], hands: [x - 28 * m, y + 42] }; },
    // assis, jambes fléchies, bras tendus devant
    assis: (x, y, o) => { const m = o.m || 1;
      return { j: P([x - 3 * m, y + 44], [x - 2 * m, y + 35], [x, y + 6], [x + 21 * m, y + 26], [x + 30 * m, y], [x + 23 * m, y + 25], [x + 32 * m, y], arms([x - 2 * m, y + 35], o.a || 'front', m)), sol: 3, top: [x + 22 * m, y + 29] }; },
    // trépied (chevalier servant) : un genou + deux pieds au sol, cuisse avant horizontale
    trep: (x, y, o) => { const m = o.m || 1;
      return { j: P([x - 4 * m, y + 63], [x - 4 * m, y + 54], [x - 6 * m, y + 25], [x - 8 * m, y], [x - 32 * m, y + 1], [x + 19 * m, y + 25], [x + 19 * m, y], arms([x - 4 * m, y + 54], o.a || 'hold', m)), sol: 3, top: [x + 9 * m, y + 28] }; },
    // à genoux sur un support
    genoux: (x, y, o) => { const m = o.m || 1;
      return { j: P([x, y + 61], [x, y + 52], [x, y + 25], [x, y], [x - 25 * m, y + 1], [x + 1, y], [x - 24 * m, y + 1], arms([x, y + 52], o.a || 'side', m)), sol: 2 }; },
    // planche (corps horizontal, ventre vers le bas)
    planche: (x, y, o) => { const m = o.m || 1;
      return { j: P([x + 39 * m, y + 2], [x + 30 * m, y], [x, y], [x - 25 * m, y], [x - 51 * m, y + 1], [x - 25 * m, y + 1], [x - 51 * m, y + 2], o.a === 'side' ? [[x + 30 * m, y + 12], [x + 30 * m, y + 28], [x + 30 * m, y - 12], [x + 30 * m, y - 28]] : [[x + 47 * m, y + 1], [x + 64 * m, y + 2], [x + 47 * m, y], [x + 64 * m, y + 1]]), sol: 0 }; },
    // assis sur un support (fessier en x,y), jambes vers l'avant
    siege: (x, y, o) => { const m = o.m || 1;
      return { j: P([x - 2 * m, y + 38], [x - 1 * m, y + 29], [x, y], [x + 22 * m, y + 6], [x + 34 * m, y - 16], [x + 23 * m, y + 5], [x + 35 * m, y - 17], arms([x - 1 * m, y + 29], o.a || 'up', m)), sol: 0 }; },
    // à califourchon sur les épaules (vue de face)
    epaules: (x, y, o) => ({ j: P([x, y + 38], [x, y + 29], [x, y], [x - 10, y - 2], [x - 12, y - 24], [x + 10, y - 2], [x + 12, y - 24], arms([x, y + 29], o.a || 'up', 1)), sol: 0 }),
    // brouette : mains au sol en x,y, pieds posés en hauteur (corps semi-renversé, tête plus basse que les pieds)
    brouette: (x, y, o) => { const m = o.m || 1;
      return { j: P([x + 6 * m, y + 22], [x - 3 * m, y + 27], [x - 33 * m, y + 35], [x - 52 * m, y + 34], [x - 72 * m, y + 31], [x - 52 * m, y + 35], [x - 72 * m, y + 32], [[x - 1 * m, y + 13], [x, y], [x + 1 * m, y + 13], [x + 2 * m, y]]), sol: 2 }; },
    // semi-renversé : mains au sol en x,y, corps incliné (ang° par rapport au sol), pieds tenus en hauteur
    semi: (x, y, o) => { const m = o.m || 1, t = (o.ang == null ? 45 : +o.ang) * Math.PI / 180, d = [-m * Math.cos(t), Math.sin(t)];
      const at = (q, k) => [q[0] + d[0] * k, q[1] + d[1] * k], n = [x, y + 35], p = at(n, 29), k = at(p, 24), f = at(k, 24), sp = o.split ? 7 : 1;
      const q = [-d[1] * sp, d[0] * sp];
      return { j: P(at(n, -9), n, p, [k[0] + q[0], k[1] + q[1]], [f[0] + 2 * q[0], f[1] + 2 * q[1]], [k[0] - q[0], k[1] - q[1]], [f[0] - 2 * q[0], f[1] - 2 * q[1]],
        [[x - 2, y + 18], [x - 2, y], [x + 2, y + 18], [x + 2, y]]), sol: 2 }; },
    // appui renversé (ATR), mains en x,y
    atr: (x, y, o) => ({ j: P([x, y + 26], [x, y + 35], [x, y + 64], [x - (o.split ? 12 : 1), y + 88], [x - (o.split ? 26 : 2), y + 112], [x + (o.split ? 12 : 1), y + 88], [x + (o.split ? 26 : 2), y + 112], [[x - 5, y + 18], [x - 4, y], [x + 5, y + 18], [x + 4, y]]), sol: y === 0 ? 2 : 0 }),
  };
  /* Pose « libre » par angles (degrés, 0 = vers l'avant, 90 = vers le haut ; m = sens) :
     tr tronc (bassin→épaules), t1/s1 cuisse/jambe 1, t2/s2 cuisse/jambe 2, u1/a1 bras/avant-bras 1, u2/a2 bras 2.
     at : articulation placée en (x, y) — 'p' bassin, 'f1' pied, 'm1' main, 'n' épaules, 'k1' genou… */
  const K = (x, y, o, d, sol, at = 'p') => {
    const m = o.m || 1, R = Math.PI / 180, go = (q, a, l) => [q[0] + m * Math.cos(a * R) * l, q[1] + Math.sin(a * R) * l];
    const p = [0, 0], n = go(p, d.tr, 28), h = go(n, d.hd == null ? d.tr : d.hd, 9);
    const k1 = go(p, d.t1, 25), f1 = go(k1, d.s1, 26), k2 = go(p, d.t2 == null ? d.t1 : d.t2, 25), f2 = go(k2, d.s2 == null ? d.s1 : d.s2, 26);
    let ar;
    if (o.a && !d.fixArms) ar = arms(n, o.a, m);
    else { const e1 = go(n, d.u1, 17), m1 = go(e1, d.a1 == null ? d.u1 : d.a1, 17), e2 = go(n, d.u2 == null ? d.u1 : d.u2, 17), m2 = go(e2, d.a2 == null ? (d.u2 == null ? d.a1 == null ? d.u1 : d.a1 : d.u2) : d.a2, 17); ar = [e1, m1, e2, m2]; }
    const J = { h, n, p, k1, f1, k2, f2, e1: ar[0], m1: ar[1], e2: ar[2], m2: ar[3] }, A0 = J[o.at || at], dx = x - A0[0], dy = y - A0[1];
    Object.keys(J).forEach(k => { J[k] = [J[k][0] + dx, J[k][1] + dy]; });
    return { j: J, sol };
  };
  Object.assign(poses, {
    // ----- porteurs -----
    // pont / table renversée : ventre vers le haut, mains et pieds au sol (x,y = pieds)
    pont: (x, y, o) => { const r = K(x, y, o, { tr: 180, hd: 190, t1: -8, s1: -88, t2: -8, s2: -92, u1: -97, a1: -97, fixArms: 1 }, 4, 'f1'); r.top = r.j.p; return r; },
    // allongé sur le dos, jambes fléchies pieds au sol (x,y = bassin)
    dosf: (x, y, o) => K(x, y + 5, o, { tr: 180, t1: 58, s1: -55, u1: 95, a1: 90 }, 3),
    // allongé sur le dos à plat, bras tendus vers le haut (x,y = bassin)
    allonge: (x, y, o) => K(x, y + 5, o, { tr: 180, t1: -2, s1: 0, u1: 92, a1: 90 }, 1),
    // fente avant : cuisse avant horizontale, jambe arrière tendue (x,y = pied avant)
    fente: (x, y, o) => { const r = K(x, y, o, { tr: 92, t1: 0, s1: -90, t2: -122, s2: -168, u1: 30, a1: 40 }, 2, 'f1'); r.top = r.j.k1; return r; },
    // à genoux assis sur les talons (x,y = genoux)
    talons: (x, y, o) => K(x, y, o, { tr: 90, t1: -42, s1: 180, u1: 20, a1: 60 }, 2, 'k1'),
    // assis jambes tendues (x,y = bassin)
    assisl: (x, y, o) => K(x, y + 6, o, { tr: 100, t1: -4, s1: -6, u1: 10, a1: 10 }, 3),
    // ----- voltigeurs -----
    // équerre (assis en V, x,y = bassin)
    equerre: (x, y, o) => K(x, y, o, { tr: 112, t1: 38, s1: 38, u1: 30, a1: 30 }, y === 0 ? 1 : 0),
    // pompe / planche faciale vers le sol : mains en x,y, corps horizontal, pieds posés ou tenus
    pompe: (x, y, o) => K(x, y, o, { tr: -4, hd: 0, t1: 176, s1: 176, u1: -90, a1: -90, fixArms: 1 }, y === 0 ? 2 : 0, 'm1'),
    // équerre en appui sur les mains (x,y = mains)
    equerrem: (x, y, o) => K(x, y, o, { tr: 98, t1: 6, s1: 6, u1: -82, a1: -88, fixArms: 1 }, y === 0 ? 2 : 0, 'm1'),
    // planche faciale (ventre vers le haut, x,y = bassin)
    planchef: (x, y, o) => K(x, y, o, { tr: 180, hd: 185, t1: 0, s1: 0, u1: 175, a1: 178 }, 0),
    // pike / carpé renversé : mains en x,y, bassin haut, jambes horizontales tenues
    carpe: (x, y, o) => K(x, y, o, { tr: -92, hd: -92, t1: 2, s1: 2, u1: -90, a1: -90, fixArms: 1 }, y === 0 ? 2 : 0, 'm1'),
  });
  return poses;
})();

/* ---------- Banque de pyramides ----------
   por : positions de porteurs présentes · h : hauteur (étages) · p : personnes
   r 'p' porteur / 'v' voltigeur · z 1 = plan arrière (en retrait)            */
const ACRO = [
  // ===== DUOS =====
  { id: 'd1', n: 'Le banc', eff: 2, por: ['horizontal'], h: 2, p: [{ r: 'p', s: 'table', x: 0, y: 0 }, { r: 'v', s: 'stand', x: 2, y: 35, a: 'up' }],
    c: 'Voltigeur : pieds sur le bassin et les épaules du porteur, jamais au milieu du dos.' },
  { id: 'd2', n: 'La statue à genoux', eff: 2, por: ['horizontal'], h: 2, p: [{ r: 'p', s: 'table', x: 0, y: 0 }, { r: 'v', s: 'genoux', x: 4, y: 35, a: 'side' }],
    c: 'Genoux du voltigeur sur le bassin du porteur, gainage des deux.' },
  { id: 'd3', n: 'L\'avion', eff: 2, por: ['horizontal'], h: 2, p: [{ r: 'p', s: 'dos', x: 0, y: 0 }, { r: 'v', s: 'planche', x: 3, y: 58 }],
    c: 'Pieds du porteur sur le bassin du voltigeur, mains aux épaules ; montée et descente contrôlées.' },
  { id: 'd4', n: 'Le fauteuil', eff: 2, por: ['horizontal'], h: 2, p: [{ r: 'p', s: 'dos', x: 0, y: 0 }, { r: 'v', s: 'siege', x: 3, y: 58, a: 'up' }],
    c: 'Voltigeur assis sur les pieds du porteur, dos droit ; le porteur verrouille les jambes.' },
  { id: 'd5', n: 'Le chevalier', eff: 2, por: ['trepied'], h: 2, p: [{ r: 'p', s: 'trep', x: 0, y: 0 }, { r: 'v', s: 'stand', x: 9, y: 28, a: 'up' }],
    c: 'Pied du voltigeur sur la cuisse près de la hanche ; le porteur tient la taille.' },
  { id: 'd6', n: 'L\'arabesque sur cuisse', eff: 2, por: ['trepied'], h: 2, p: [{ r: 'p', s: 'trep', x: 0, y: 0, a: 'upfront' }, { r: 'v', s: 'arab', x: 9, y: 28, m: -1, a: 'side' }],
    c: 'Le porteur tient une main du voltigeur ; regard fixe devant.' },
  { id: 'd7', n: 'Sur les épaules', eff: 2, por: ['debout'], h: 2, p: [{ r: 'p', s: 'stand', x: 0, y: 0, wide: 1, a: 'hip' }, { r: 'v', s: 'epaules', x: 0, y: 80, a: 'up' }],
    c: 'Porteur jambes fléchies pour la montée, dos droit ; il tient les tibias du voltigeur.' },
  { id: 'd8', n: 'L\'ATR tenu', eff: 2, por: ['debout'], h: 1, p: [{ r: 'v', s: 'atr', x: 0, y: 0 }, { r: 'p', s: 'stand', x: 26, y: 0, m: -1, a: 'upfront' }],
    c: 'Le porteur saisit les chevilles, le voltigeur reste gainé, épaules au-dessus des mains.' },
  { id: 'd10', n: 'La brouette sur le banc', eff: 2, por: ['horizontal'], h: 2, p: [{ r: 'p', s: 'table', x: 0, y: 0 }, { r: 'v', s: 'brouette', x: -88, y: 0, m: -1 }],
    c: 'Mains du voltigeur au sol, pieds posés sur le bassin du porteur ; corps gainé, tête dans l\'alignement.' },
  { id: 'd9', n: 'Le trône', eff: 2, por: ['assis'], h: 2, p: [{ r: 'p', s: 'assis', x: 0, y: 0, a: 'hold' }, { r: 'v', s: 'stand', x: 22, y: 29, a: 'side' }],
    c: 'Pieds du voltigeur sur les genoux du porteur, qui le tient aux mollets.' },
  { id: 'd11', n: 'Le semi-renversé au chevalier', eff: 2, por: ['trepied'], h: 1, p: [{ r: 'p', s: 'trep', x: -56, y: 0, grip: { i: 1, j: 'f1' } }, { r: 'v', s: 'semi', x: 0, y: 0, ang: 45 }],
    c: 'Mains du voltigeur au sol à l\'aplomb des épaules, corps gainé ; le porteur en trépied tient les chevilles, sans monter jusqu\'à l\'ATR.' },
  { id: 'd12', n: 'Le semi-renversé tenu debout', eff: 2, por: ['debout'], h: 1, p: [{ r: 'p', s: 'stand', x: -58, y: 0, grip: { i: 1, j: 'f1' } }, { r: 'v', s: 'semi', x: 0, y: 0, ang: 62 }],
    c: 'Le porteur debout, dos droit, tient les chevilles à hauteur de poitrine ; le voltigeur repousse le sol, tête entre les bras.' },

  // ===== TRIOS =====
  { id: 't1', n: 'Le double banc', eff: 3, por: ['horizontal'], h: 2, p: [{ r: 'p', s: 'table', x: 8, y: 6, z: 1 }, { r: 'p', s: 'table', x: 0, y: 0 }, { r: 'v', s: 'stand', x: 4, y: 37, a: 'up' }],
    c: 'Un pied du voltigeur sur chaque bassin ; porteurs épaule contre épaule.' },
  { id: 't2', n: 'Les deux chevaliers', eff: 3, por: ['trepied'], h: 2, p: [{ r: 'p', s: 'trep', x: -30, y: 0 }, { r: 'p', s: 'trep', x: 30, y: 0, m: -1 }, { r: 'v', s: 'stand', x: 0, y: 28, wide: 1, a: 'up' }],
    c: 'Un pied sur chaque cuisse, les porteurs tiennent les mollets.' },
  { id: 't3', n: 'La chaise à porteurs', eff: 3, por: ['debout'], h: 2, p: [{ r: 'p', s: 'stand', x: -22, y: 0, a: 'front' }, { r: 'p', s: 'stand', x: 22, y: 0, m: -1, a: 'front' }, { r: 'v', s: 'siege', x: -8, y: 76, a: 'up' }],
    c: 'Mains croisées des porteurs à hauteur de taille, voltigeur assis dessus.' },
  { id: 't4', n: 'L\'avion à deux porteurs', eff: 3, por: ['horizontal'], h: 2, p: [{ r: 'p', s: 'dos', x: -20, y: 0 }, { r: 'p', s: 'dos', x: 22, y: 0, m: -1 }, { r: 'v', s: 'planche', x: 12, y: 58 }],
    c: 'Un porteur sous le bassin, l\'autre sous les épaules ; même rythme de montée.' },
  { id: 't5', n: 'L\'éventail', eff: 3, por: ['debout'], h: 1, p: [{ r: 'v', s: 'stand', x: -34, y: 0, a: 'side' }, { r: 'p', s: 'stand', x: 0, y: 0, wide: 1, a: 'side' }, { r: 'v', s: 'stand', x: 34, y: 0, a: 'side' }],
    c: 'Voltigeurs inclinés vers l\'extérieur, mains tenues par le porteur central.' },
  { id: 't6', n: 'La pyramide 2 + 1', eff: 3, por: ['horizontal'], h: 2, p: [{ r: 'p', s: 'table', x: 8, y: 6, z: 1 }, { r: 'p', s: 'table', x: 0, y: 0 }, { r: 'v', s: 'table', x: 4, y: 37 }],
    c: 'Deux porteurs côte à côte ; le voltigeur pose les genoux sur un bassin et les mains sur l\'autre porteur, perpendiculaire aux porteurs.' },
  { id: 't7', n: 'Le trône et l\'éventail', eff: 3, por: ['assis'], h: 2, p: [{ r: 'p', s: 'assis', x: 0, y: 0, a: 'hold' }, { r: 'v', s: 'stand', x: 22, y: 29, a: 'side' }, { r: 'v', s: 'stand', x: 60, y: 0, m: -1, a: 'side' }],
    c: 'Le voltigeur au sol tient la main du voltigeur perché.' },
  { id: 't8', n: 'Chevalier et banc', eff: 3, por: ['trepied', 'horizontal'], h: 2, p: [{ r: 'p', s: 'table', x: -34, y: 0 }, { r: 'p', s: 'trep', x: 30, y: 0, m: -1 }, { r: 'v', s: 'stand', x: -2, y: 30, wide: 1, a: 'up' }],
    c: 'Un pied sur le bassin du banc, l\'autre sur la cuisse du chevalier.' },

  { id: 't9', n: 'La brouette sur double banc', eff: 3, por: ['horizontal'], h: 2, p: [{ r: 'p', s: 'table', x: 8, y: 6, z: 1 }, { r: 'p', s: 'table', x: 0, y: 0 }, { r: 'v', s: 'brouette', x: -84, y: 0, m: -1 }],
    c: 'Un pied sur chaque bassin, mains au sol à l\'aplomb des épaules ; montée et descente contrôlées.' },
  { id: 't10', n: 'Le semi-renversé à deux chevaliers', eff: 3, por: ['trepied'], h: 1, p: [{ r: 'p', s: 'trep', x: -48, y: 6, z: 1, grip: { i: 2, j: 'f2' } }, { r: 'p', s: 'trep', x: -56, y: 0, grip: { i: 2, j: 'f1' } }, { r: 'v', s: 'semi', x: 0, y: 0, ang: 45, split: 1 }],
    c: 'Chaque porteur en trépied tient une cheville ; le voltigeur reste gainé, mains au sol, sans aller jusqu\'à l\'ATR.' },
  { id: 't11', n: 'Le semi-renversé à deux porteurs debout', eff: 3, por: ['debout'], h: 1, p: [{ r: 'p', s: 'stand', x: -50, y: 6, z: 1, grip: { i: 2, j: 'f2' } }, { r: 'p', s: 'stand', x: -58, y: 0, grip: { i: 2, j: 'f1' } }, { r: 'v', s: 'semi', x: 0, y: 0, ang: 62, split: 1 }],
    c: 'Deux porteurs debout, une cheville chacun, montée au même signal ; épaules du voltigeur au-dessus des mains.' },

  // ===== QUATUORS =====
  { id: 'q1', n: 'Le mur', eff: 4, por: ['horizontal'], h: 2, p: [{ r: 'p', s: 'table', x: 16, y: 12, z: 1 }, { r: 'p', s: 'table', x: 8, y: 6, z: 1 }, { r: 'p', s: 'table', x: 0, y: 0 }, { r: 'v', s: 'stand', x: 6, y: 40, wide: 1, a: 'up' }],
    c: 'Trois bancs serrés ; le voltigeur a un pied sur chaque banc extérieur.' },
  { id: 'q2', n: 'La pyramide 3 étages', eff: 4, por: ['horizontal'], h: 3, p: [{ r: 'p', s: 'table', x: 8, y: 6, z: 1 }, { r: 'p', s: 'table', x: 0, y: 0 }, { r: 'p', s: 'table', x: 4, y: 37 }, { r: 'v', s: 'genoux', x: 6, y: 72, a: 'up' }],
    c: 'Montée par l\'arrière, un pareur conseillé ; le sommet reste à genoux.' },
  { id: 'q3', n: 'Double chevalier et épaules', eff: 4, por: ['trepied', 'debout'], h: 2, p: [{ r: 'p', s: 'trep', x: -60, y: 0 }, { r: 'v', s: 'stand', x: -51, y: 28, a: 'up' }, { r: 'p', s: 'stand', x: 30, y: 0, wide: 1, a: 'hip' }, { r: 'v', s: 'epaules', x: 30, y: 80, a: 'side' }],
    c: 'Deux duos synchronisés : montée et descente au même signal.' },
  { id: 'q4', n: 'Les deux chevaliers et l\'éventail', eff: 4, por: ['trepied'], h: 2, p: [{ r: 'p', s: 'trep', x: -30, y: 0 }, { r: 'p', s: 'trep', x: 30, y: 0, m: -1 }, { r: 'v', s: 'stand', x: 0, y: 28, wide: 1, a: 'side' }, { r: 'v', s: 'arab', x: 66, y: 0, m: -1, a: 'upfront' }],
    c: 'Le 4e élève termine la figure en arabesque, main tenue.' },
  { id: 'q5', n: 'L\'avion et les banquettes', eff: 4, por: ['horizontal'], h: 2, p: [{ r: 'p', s: 'dos', x: -20, y: 0 }, { r: 'p', s: 'dos', x: 22, y: 0, m: -1 }, { r: 'v', s: 'planche', x: 12, y: 58 }, { r: 'p', s: 'table', x: 90, y: 0, m: -1 }],
    c: 'Figure à deux étages avec un banc en décor ; synchroniser les porteurs.' },
  { id: 'q6', n: 'La grande chaise', eff: 4, por: ['debout'], h: 2, p: [{ r: 'p', s: 'stand', x: -22, y: 0, a: 'front' }, { r: 'p', s: 'stand', x: 22, y: 0, m: -1, a: 'front' }, { r: 'v', s: 'siege', x: -8, y: 76, a: 'up' }, { r: 'v', s: 'stand', x: 60, y: 0, m: -1, a: 'side' }],
    c: 'Le 4e élève sécurise et tient la main du voltigeur assis.' },
  { id: 'q7', n: 'Les trônes', eff: 4, por: ['assis'], h: 2, p: [{ r: 'p', s: 'assis', x: -40, y: 0, a: 'hold' }, { r: 'v', s: 'stand', x: -18, y: 29, a: 'up' }, { r: 'p', s: 'assis', x: 40, y: 0, m: -1, a: 'hold' }, { r: 'v', s: 'stand', x: 18, y: 29, a: 'up' }],
    c: 'Deux trônes face à face, les voltigeurs se tiennent les mains au sommet.' },
  { id: 'q8', n: 'La table et l\'ATR', eff: 4, por: ['horizontal', 'debout'], h: 2, p: [{ r: 'p', s: 'table', x: -50, y: 0 }, { r: 'v', s: 'stand', x: -48, y: 35, a: 'side' }, { r: 'v', s: 'atr', x: 30, y: 0, split: 1 }, { r: 'p', s: 'stand', x: 56, y: 0, m: -1, a: 'upfront' }],
    c: 'Un duo en hauteur, un duo au sol : figures tenues 3 secondes.' },
];
/* Banque enrichie (dessins originaux) : nv = niveau de référence proposé (A → D), modifiable dans la fiche */
ACRO.push(
  // ===== DUOS =====
  {"id": "nd1", "n": "La planche aux pieds tenus", "eff": 2, "por": ["horizontal"], "h": 2, "nv": "A", "p": [{"r": "p", "s": "allonge", "x": 0, "y": 0, "m": 1}, {"r": "v", "s": "pompe", "at": "f1", "on": [0, "m1", 0, 0], "m": -1}], "c": "Porteur allongé, bras tendus verrouillés, il tient les chevilles ; voltigeur gainé, mains à l'aplomb des épaules."},
  {"id": "nd2", "n": "L'avion sur les genoux", "eff": 2, "por": ["horizontal"], "h": 2, "nv": "B", "p": [{"r": "p", "s": "dosf", "x": 0, "y": 0, "grip": {"i": 1, "j": "n"}}, {"r": "v", "s": "planche", "on": [0, "k1", 4, 3], "m": -1}], "c": "Bassin du voltigeur posé sur les genoux du porteur, qui tient ses mains ; corps gainé, regard devant."},
  {"id": "nd3", "n": "La planche faciale", "eff": 2, "por": ["horizontal"], "h": 2, "nv": "C", "p": [{"r": "p", "s": "dos", "x": 0, "y": 0, "grip": {"i": 1, "j": "n"}}, {"r": "v", "s": "planchef", "on": [0, "f1", 0, 3]}], "c": "Pieds du porteur sous le bas du dos du voltigeur, ventre vers le haut ; montée accompagnée par un pareur."},
  {"id": "nd4", "n": "L'avion sur les mains", "eff": 2, "por": ["horizontal"], "h": 2, "nv": "D", "p": [{"r": "p", "s": "allonge", "x": 0, "y": 0}, {"r": "v", "s": "planche", "on": [0, "m1", 6, 3], "a": "side"}], "c": "Mains du porteur sous le bassin du voltigeur, bras verrouillés ; voltigeur très gainé, bras écartés. Pareur conseillé."},
  {"id": "nd5", "n": "L'équerre face à face", "eff": 2, "por": ["assis"], "h": 1, "nv": "A", "p": [{"r": "p", "s": "assis", "x": 0, "y": 0, "grip": {"i": 1, "j": "f1"}}, {"r": "v", "s": "equerre", "x": 92, "y": 0, "m": -1}], "c": "Le porteur assis tient les chevilles ; le voltigeur garde le dos droit, jambes tendues."},
  {"id": "nd6", "n": "L'équerre sur les pieds", "eff": 2, "por": ["horizontal"], "h": 2, "nv": "B", "p": [{"r": "p", "s": "dos", "x": 0, "y": 0}, {"r": "v", "s": "equerre", "on": [0, "f1", -2, 3], "a": "up"}], "c": "Voltigeur assis sur les pieds du porteur, jambes tendues devant ; le porteur verrouille les genoux."},
  {"id": "nd7", "n": "L'équerre en appui sur les genoux", "eff": 2, "por": ["horizontal"], "h": 2, "nv": "C", "p": [{"r": "p", "s": "dosf", "x": 0, "y": 0, "grip": {"i": 1, "j": "k1"}}, {"r": "v", "s": "equerrem", "on": [0, "k1", 0, 3]}], "c": "Mains du voltigeur sur les genoux du porteur, bras tendus ; le porteur tient les tibias pour stabiliser."},
  {"id": "nd8", "n": "L'équerre sur les mains", "eff": 2, "por": ["horizontal"], "h": 2, "nv": "D", "p": [{"r": "p", "s": "allonge", "x": 0, "y": 0}, {"r": "v", "s": "equerre", "on": [0, "m1", 0, 3], "a": "side"}], "c": "Le porteur tient le voltigeur sous les fesses, bras verrouillés à la verticale. Pareur obligatoire."},
  {"id": "nd9", "n": "Le semi-renversé à genoux", "eff": 2, "por": ["assis"], "h": 1, "nv": "A", "p": [{"r": "p", "s": "talons", "x": -60, "y": 0, "grip": {"i": 1, "j": "f1"}}, {"r": "v", "s": "semi", "x": 0, "y": 0, "ang": 30}], "c": "Porteur assis sur les talons, dos droit, il tient les chevilles ; voltigeur gainé, mains au sol."},
  {"id": "nd10", "n": "L'ATR tenu en fente", "eff": 2, "por": ["debout"], "h": 1, "nv": "B", "p": [{"r": "v", "s": "atr", "x": 0, "y": 0}, {"r": "p", "s": "fente", "x": 28, "y": 0, "m": -1, "grip": {"i": 0, "j": "f1"}}], "c": "Le porteur en fente saisit les chevilles ; le voltigeur repousse le sol, épaules au-dessus des mains."},
  {"id": "nd11", "n": "Le carpé sur les épaules", "eff": 2, "por": ["assis"], "h": 1, "nv": "C", "p": [{"r": "v", "s": "carpe", "x": 0, "y": 0}, {"r": "p", "s": "genoux", "x": 54, "y": 0, "m": -1, "a": "up"}], "c": "Jambes tendues du voltigeur posées sur les épaules du porteur à genoux, qui tient les chevilles ; bassin au-dessus des épaules."},
  {"id": "nd12", "n": "L'ATR sur les genoux", "eff": 2, "por": ["horizontal"], "h": 2, "nv": "D", "p": [{"r": "p", "s": "dosf", "x": 0, "y": 0, "grip": {"i": 1, "j": "n"}}, {"r": "v", "s": "atr", "on": [0, "k1", 0, 2]}], "c": "Mains du voltigeur sur les genoux du porteur, qui tient ses épaules ; montée par un pareur. Réservé aux élèves à l'aise à l'ATR."},
  {"id": "nd13", "n": "Debout sur les cuisses", "eff": 2, "por": ["assis"], "h": 2, "nv": "A", "p": [{"r": "p", "s": "talons", "x": 0, "y": 0, "a": "hip"}, {"r": "v", "s": "stand", "on": [0, "p", 9, 2], "a": "up"}], "c": "Pieds du voltigeur sur les cuisses, près des hanches ; le porteur tient le bassin."},
  {"id": "nd14", "n": "Debout sur la fente", "eff": 2, "por": ["debout"], "h": 2, "nv": "B", "p": [{"r": "p", "s": "fente", "x": 0, "y": 0, "a": "hip"}, {"r": "v", "s": "stand", "on": [0, "p", 9, 2], "a": "side"}], "c": "Pied du voltigeur sur la cuisse avant, près de la hanche ; le porteur tient la taille."},
  {"id": "nd15", "n": "Debout sur le pont", "eff": 2, "por": ["horizontal"], "h": 2, "nv": "C", "p": [{"r": "p", "s": "pont", "x": 0, "y": 0}, {"r": "v", "s": "stand", "on": [0, "p", -2, 3], "a": "up"}], "c": "Pieds du voltigeur sur le bassin du porteur, jamais au milieu du ventre ; le porteur pousse fort sur ses appuis."},
  {"id": "nd16", "n": "Debout sur les épaules en fente", "eff": 2, "por": ["debout"], "h": 2, "nv": "D", "p": [{"r": "p", "s": "fente", "x": 0, "y": 0, "a": "hip"}, {"r": "v", "s": "stand", "on": [0, "n", 0, 2], "a": "up"}], "c": "Montée par la cuisse avant puis les épaules ; le porteur tient les mollets. Pareur obligatoire."},
  // ===== TRIOS =====
  {"id": "nt1", "n": "La passerelle sur deux bancs", "eff": 3, "por": ["horizontal"], "h": 2, "nv": "A", "p": [{"r": "p", "s": "table", "x": -28, "y": 0, "m": -1}, {"r": "p", "s": "table", "x": 34, "y": 0, "m": 1}, {"r": "v", "s": "planche", "x": 0, "y": 37}], "c": "Épaules du voltigeur sur un banc, bassin et cuisses sur l'autre ; porteurs dos plat, bras tendus."},
  {"id": "nt2", "n": "L'avion à deux porteurs allongés", "eff": 3, "por": ["horizontal"], "h": 2, "nv": "B", "p": [{"r": "p", "s": "allonge", "x": 9, "y": 0}, {"r": "p", "s": "allonge", "x": -4, "y": 0, "m": -1, "z": 1}, {"r": "v", "s": "planche", "x": 2, "y": 41}], "c": "Un porteur tient les épaules, l'autre les cuisses ; bras verrouillés, montée au même signal."},
  {"id": "nt3", "n": "La planche faciale tenue", "eff": 3, "por": ["horizontal", "debout"], "h": 2, "nv": "C", "p": [{"r": "p", "s": "dos", "x": 0, "y": 0}, {"r": "v", "s": "planchef", "on": [0, "f1", 0, 3]}, {"r": "p", "s": "stand", "x": -90, "y": 0, "grip": {"i": 1, "j": "m1"}}], "c": "Pieds du porteur allongé sous le bas du dos ; le porteur debout tient les mains du voltigeur et équilibre."},
  {"id": "nt4", "n": "L'avion porté à genoux", "eff": 3, "por": ["assis"], "h": 2, "nv": "D", "p": [{"r": "p", "s": "talons", "x": -40, "y": 0, "grip": {"i": 2, "j": "n"}}, {"r": "p", "s": "talons", "x": 44, "y": 0, "m": -1, "grip": {"i": 2, "j": "k1"}}, {"r": "v", "s": "planche", "x": 10, "y": 74, "m": -1}], "c": "Les porteurs à genoux tiennent épaules et genoux du voltigeur, bras tendus au-dessus de la tête. Pareur conseillé."},
  {"id": "nt5", "n": "L'équerre entre deux assis", "eff": 3, "por": ["assis"], "h": 1, "nv": "A", "p": [{"r": "p", "s": "assis", "x": -62, "y": 0, "grip": {"i": 2, "j": "n"}}, {"r": "p", "s": "assis", "x": 96, "y": 0, "m": -1, "grip": {"i": 2, "j": "f1"}}, {"r": "v", "s": "equerre", "x": 0, "y": 0}], "c": "Un porteur soutient le dos, l'autre tient les chevilles ; voltigeur dos droit, jambes tendues."},
  {"id": "nt6", "n": "L'équerre sur les genoux, mains tenues", "eff": 3, "por": ["horizontal", "assis"], "h": 2, "nv": "B", "p": [{"r": "p", "s": "dosf", "x": 0, "y": 0}, {"r": "v", "s": "equerre", "on": [0, "k1", -2, 3], "m": -1}, {"r": "p", "s": "genoux", "x": -45, "y": 0, "grip": {"i": 1, "j": "m1"}}], "c": "Voltigeur assis sur les genoux du porteur allongé ; le porteur à genoux tient ses mains."},
  {"id": "nt7", "n": "L'équerre en appui sur deux bancs", "eff": 3, "por": ["horizontal"], "h": 2, "nv": "C", "p": [{"r": "p", "s": "table", "x": -30, "y": 0}, {"r": "p", "s": "table", "x": 30, "y": 0, "m": -1, "z": 1}, {"r": "v", "s": "equerrem", "x": -28, "y": 37}], "c": "Une main sur chaque bassin, bras tendus, jambes à l'horizontale ; porteurs épaule contre épaule."},
  {"id": "nt8", "n": "L'équerre suspendue", "eff": 3, "por": ["debout"], "h": 2, "nv": "D", "p": [{"r": "p", "s": "fente", "x": -40, "y": 0, "grip": {"i": 2, "j": "n"}}, {"r": "p", "s": "fente", "x": 62, "y": 0, "m": -1, "grip": {"i": 2, "j": "f1"}}, {"r": "v", "s": "equerre", "x": 0, "y": 48, "a": "side"}], "c": "Les porteurs en fente tiennent le dos et les chevilles ; voltigeur très gainé. Pareur conseillé."},
  {"id": "nt9", "n": "L'ATR tenu à deux", "eff": 3, "por": ["assis", "debout"], "h": 1, "nv": "A", "p": [{"r": "v", "s": "atr", "x": 0, "y": 0}, {"r": "p", "s": "genoux", "x": -30, "y": 0, "grip": {"i": 0, "j": "k1"}}, {"r": "p", "s": "stand", "x": 30, "y": 0, "m": -1, "grip": {"i": 0, "j": "f2"}}], "c": "Un porteur à genoux tient les cuisses, l'autre debout les chevilles ; montée jambe après jambe."},
  {"id": "nt10", "n": "Le double semi-renversé à genoux", "eff": 3, "por": ["assis"], "h": 1, "nv": "B", "p": [{"r": "p", "s": "genoux", "x": 0, "y": 0, "a": "side"}, {"r": "v", "s": "semi", "x": -107, "y": 0, "m": -1, "ang": 16}, {"r": "v", "s": "semi", "x": 107, "y": 0, "ang": 16}], "c": "Porteur central assis sur les talons, il tient une cheville de chaque voltigeur ; voltigeurs gainés, mains au sol."},
  {"id": "nt11", "n": "L'ATR sur les genoux du porteur assis", "eff": 3, "por": ["assis", "debout"], "h": 2, "nv": "C", "p": [{"r": "p", "s": "assis", "x": -30, "y": 0, "a": "hold"}, {"r": "v", "s": "atr", "on": [0, "k1", 2, 2]}, {"r": "p", "s": "stand", "x": 24, "y": 0, "m": -1, "grip": {"i": 1, "j": "f1"}}], "c": "Mains du voltigeur sur les genoux du porteur assis ; le porteur debout tient les chevilles."},
  {"id": "nt12", "n": "L'ATR sur les cuisses", "eff": 3, "por": ["assis", "debout"], "h": 2, "nv": "D", "p": [{"r": "p", "s": "talons", "x": 0, "y": 0, "a": "hip"}, {"r": "v", "s": "atr", "on": [0, "p", 10, 2]}, {"r": "p", "s": "stand", "x": 36, "y": 0, "m": -1, "grip": {"i": 1, "j": "f1"}}], "c": "Mains du voltigeur sur les cuisses du porteur à genoux ; le porteur debout tient les chevilles. Réservé aux élèves à l'aise à l'ATR."},
  {"id": "nt13", "n": "La statue, mains tenues", "eff": 3, "por": ["assis", "debout"], "h": 2, "nv": "A", "p": [{"r": "p", "s": "talons", "x": 0, "y": 0, "a": "hip"}, {"r": "v", "s": "stand", "on": [0, "p", 9, 2], "grip": {"i": 2, "j": "m1"}}, {"r": "p", "s": "stand", "x": 50, "y": 0, "m": -1, "a": "upfront"}], "c": "Pieds sur les cuisses du porteur à genoux, mains dans celles du porteur debout ; on monte et on descend lentement."},
  {"id": "nt14", "n": "Debout sur deux fentes", "eff": 3, "por": ["debout"], "h": 2, "nv": "B", "p": [{"r": "p", "s": "fente", "x": -2, "y": 0, "a": "hip"}, {"r": "p", "s": "fente", "x": 2, "y": 0, "m": -1, "a": "hip"}, {"r": "v", "s": "stand", "x": 0, "y": 28, "wide": 1, "a": "side"}], "c": "Un pied sur chaque cuisse avant, près de la hanche ; les porteurs tiennent les genoux du voltigeur."},
  {"id": "nt15", "n": "Debout sur le pont et le banc", "eff": 3, "por": ["horizontal"], "h": 2, "nv": "C", "p": [{"r": "p", "s": "pont", "x": -14, "y": 0}, {"r": "p", "s": "table", "x": 30, "y": 0, "m": -1}, {"r": "v", "s": "stand", "x": 0, "y": 33, "wide": 1, "a": "up"}], "c": "Un pied sur le bassin du pont, l'autre sur le bassin du banc ; jamais au milieu du dos."},
  {"id": "nt16", "n": "Debout sur les épaules, pareur", "eff": 3, "por": ["debout"], "h": 2, "nv": "D", "p": [{"r": "p", "s": "fente", "x": 0, "y": 0, "a": "hip"}, {"r": "v", "s": "stand", "on": [0, "n", 0, 2], "grip": {"i": 2, "j": "m1"}}, {"r": "p", "s": "stand", "x": 44, "y": 0, "m": -1, "a": "upfront"}], "c": "Montée par la cuisse puis les épaules ; le 3e élève tient les mains du voltigeur et pare la chute."},
  // ===== QUATUORS =====
  {"id": "nq1", "n": "La passerelle et le pareur", "eff": 4, "por": ["horizontal"], "h": 2, "nv": "A", "p": [{"r": "p", "s": "table", "x": -28, "y": 0, "m": -1}, {"r": "p", "s": "table", "x": 34, "y": 0}, {"r": "v", "s": "planche", "x": 0, "y": 37}, {"r": "p", "s": "stand", "x": 100, "y": 0, "grip": {"i": 2, "j": "m1"}, "m": -1}], "c": "Voltigeur allongé sur deux bancs ; le 4e élève, debout, tient ses mains et l'aide à monter et descendre."},
  {"id": "nq2", "n": "L'avion et la planche aux pieds tenus", "eff": 4, "por": ["horizontal"], "h": 2, "nv": "B", "p": [{"r": "p", "s": "dos", "x": -60, "y": 0}, {"r": "v", "s": "planche", "on": [0, "f1", 0, 3]}, {"r": "p", "s": "allonge", "x": 20, "y": 0, "m": -1}, {"r": "v", "s": "pompe", "at": "f1", "on": [2, "m1", 0, 0]}], "c": "Deux duos côte à côte : l'avion et la planche aux pieds tenus, montée et descente au même signal."},
  {"id": "nq3", "n": "L'avion porté et le pareur", "eff": 4, "por": ["assis", "debout"], "h": 2, "nv": "C", "p": [{"r": "p", "s": "talons", "x": -40, "y": 0, "grip": {"i": 2, "j": "n"}}, {"r": "p", "s": "fente", "x": 60, "y": 0, "m": -1, "grip": {"i": 2, "j": "k1"}}, {"r": "v", "s": "planche", "x": 10, "y": 74, "m": -1}, {"r": "p", "s": "genoux", "x": 5, "y": 0, "z": 1, "a": "up"}], "c": "Porteur à genoux aux épaules, porteur en fente aux genoux ; le 4e élève, à genoux dessous, pare la chute."},
  {"id": "nq4", "n": "L'avion sur deux paires de mains", "eff": 4, "por": ["horizontal", "debout"], "h": 2, "nv": "D", "p": [{"r": "p", "s": "allonge", "x": 9, "y": 0}, {"r": "p", "s": "allonge", "x": -4, "y": 0, "m": -1, "z": 1}, {"r": "v", "s": "planche", "x": 2, "y": 41, "a": "side"}, {"r": "p", "s": "stand", "x": -80, "y": 0, "a": "front"}], "c": "Deux porteurs allongés, bras verrouillés, tiennent épaules et cuisses ; le 4e élève pare devant. Montée au signal."},
  {"id": "nq5", "n": "L'équerre sur les genoux de deux assis", "eff": 4, "por": ["assis"], "h": 2, "nv": "A", "p": [{"r": "p", "s": "assis", "x": -30, "y": 0, "a": "hold"}, {"r": "p", "s": "assis", "x": 34, "y": 0, "m": -1, "a": "hold"}, {"r": "v", "s": "equerre", "x": -6, "y": 30, "a": "up"}, {"r": "p", "s": "stand", "x": -70, "y": 0, "grip": {"i": 2, "j": "n"}}], "c": "Voltigeur assis sur les genoux joints des deux porteurs ; le 4e élève le tient aux épaules."},
  {"id": "nq6", "n": "Les équerres en appui", "eff": 4, "por": ["horizontal"], "h": 2, "nv": "C", "p": [{"r": "p", "s": "dosf", "x": -50, "y": 0, "grip": {"i": 1, "j": "k1"}}, {"r": "v", "s": "equerrem", "on": [0, "k1", 0, 3]}, {"r": "p", "s": "dosf", "x": 60, "y": 0, "grip": {"i": 3, "j": "k1"}}, {"r": "v", "s": "equerrem", "on": [2, "k1", 0, 3]}], "c": "Deux duos synchronisés : mains sur les genoux du porteur, jambes à l'horizontale, tenue 3 secondes."},
  {"id": "nq7", "n": "L'ATR et le carpé", "eff": 4, "por": ["assis", "debout"], "h": 1, "nv": "B", "p": [{"r": "v", "s": "atr", "x": -40, "y": 0}, {"r": "p", "s": "stand", "x": -12, "y": 0, "m": -1, "grip": {"i": 0, "j": "f1"}}, {"r": "v", "s": "carpe", "x": 40, "y": 0}, {"r": "p", "s": "genoux", "x": 94, "y": 0, "m": -1, "a": "up"}], "c": "Un ATR tenu aux chevilles et un carpé sur les épaules d'un porteur à genoux, montés au même signal."},
  {"id": "nq8", "n": "L'ATR sur les cuisses, double parade", "eff": 4, "por": ["assis", "debout"], "h": 2, "nv": "D", "p": [{"r": "p", "s": "talons", "x": 0, "y": 0, "a": "hip"}, {"r": "v", "s": "atr", "on": [0, "p", 10, 2]}, {"r": "p", "s": "stand", "x": 36, "y": 0, "m": -1, "grip": {"i": 1, "j": "f1"}}, {"r": "p", "s": "stand", "x": -34, "y": 0, "z": 1, "grip": {"i": 1, "j": "f2"}}], "c": "Mains sur les cuisses du porteur à genoux ; deux porteurs debout tiennent chacun une cheville."},
  {"id": "nq9", "n": "La statue sur les cuisses et les pompes", "eff": 4, "por": ["assis", "horizontal"], "h": 2, "nv": "A", "p": [{"r": "p", "s": "talons", "x": 0, "y": 0, "a": "hip"}, {"r": "v", "s": "stand", "on": [0, "p", 9, 2], "a": "up"}, {"r": "p", "s": "allonge", "x": 75, "y": 0, "m": -1}, {"r": "v", "s": "pompe", "at": "f1", "on": [2, "m1", 0, 0]}], "c": "Un duo statue sur les cuisses et un duo planche aux pieds tenus, tenus 3 secondes."},
  {"id": "nq10", "n": "Debout sur la fente et la planche", "eff": 4, "por": ["debout", "horizontal"], "h": 2, "nv": "C", "p": [{"r": "p", "s": "fente", "x": 0, "y": 0, "a": "hip"}, {"r": "v", "s": "stand", "on": [0, "p", 9, 2], "a": "up"}, {"r": "p", "s": "allonge", "x": 50, "y": 0, "m": -1}, {"r": "v", "s": "pompe", "at": "f1", "on": [2, "m1", 0, 0]}], "c": "Le voltigeur debout sur la cuisse du porteur en fente ; derrière, un duo planche aux pieds tenus."},
  {"id": "nq11", "n": "Debout sur les épaules et double parade", "eff": 4, "por": ["debout"], "h": 2, "nv": "D", "p": [{"r": "p", "s": "fente", "x": 0, "y": 0, "a": "hip"}, {"r": "v", "s": "stand", "on": [0, "n", 0, 2], "a": "side"}, {"r": "p", "s": "stand", "x": 44, "y": 0, "m": -1, "a": "upfront"}, {"r": "p", "s": "stand", "x": -44, "y": 0, "a": "upfront"}], "c": "Montée par la cuisse puis les épaules ; deux pareurs, bras levés, restent prêts à saisir le voltigeur."},
  {"id": "nq12", "n": "Debout sur deux fentes, mains tenues", "eff": 4, "por": ["debout"], "h": 2, "nv": "B", "p": [{"r": "p", "s": "fente", "x": -2, "y": 0, "a": "hip"}, {"r": "p", "s": "fente", "x": 2, "y": 0, "m": -1, "a": "hip"}, {"r": "v", "s": "stand", "x": 0, "y": 28, "wide": 1, "grip": {"i": 3, "j": "m1"}}, {"r": "p", "s": "stand", "x": 60, "y": 0, "m": -1, "a": "upfront"}], "c": "Un pied sur chaque cuisse ; le 4e élève tient les mains du voltigeur pour la montée et la descente."},
);
/* Position du voltigeur, déduite des postures des voltigeurs de la figure */
const ACRO_VOL = { debout: 'Debout / redressé', horizontale: 'À l\'horizontale', equerre: 'À l\'équerre', renverse: 'Renversé (ATR)' };   // semi-renversés regroupés avec les renversés
const ACRO_VOL_OF = { stand: 'debout', arab: 'debout', epaules: 'debout', genoux: 'debout', siege: 'debout', planche: 'horizontale', table: 'horizontale', dos: 'horizontale', brouette: 'renverse', semi: 'renverse', atr: 'renverse', equerre: 'equerre', equerrem: 'equerre', planchef: 'horizontale', pompe: 'horizontale', carpe: 'renverse' };
const ACRO_SEMI = ['semi', 'brouette', 'carpe'];   // semi-renversés : un peu moins difficiles que l'ATR dans le calcul du niveau
const acroVol = f => [...new Set(f.p.filter(q => q.r === 'v').map(q => ACRO_VOL_OF[q.s]).filter(Boolean))];
/* ---------- Niveau de difficulté A (facile) → D (très difficile) ----------
   Calcul automatique : stabilité des porteurs (appuis au sol), hauteur
   (étages), position du voltigeur (renversé > semi > horizontal > debout),
   et combinaisons (renversé en hauteur…). Modifiable à la main : DB.acro.niv[id]. */
const ACRO_NIV = { A: 'Facile', B: 'Moyen', C: 'Difficile', D: 'Très difficile' };
const ACRO_NIV_COL = { A: '#1E9E5A', B: '#E0A100', C: '#E06A1E', D: '#C62828' };
const ACRO_STAB = { table: 4, dos: 4, assis: 3, trep: 3, genoux: 2, stand: 2, arab: 1, brouette: 2, semi: 2, atr: 1, planche: 1, siege: 1, epaules: 1, pont: 4, dosf: 4, allonge: 4, fente: 2, talons: 3, assisl: 3 };   // appuis « utiles » d'un porteur
const ACRO_VOLPTS = { debout: 0, horizontale: 1, equerre: 1.5, semi: 2, renverse: 3 };
function acroScore(f) {
  const por = f.p.filter(q => q.r === 'p'), vol = f.p.filter(q => q.r === 'v');
  const stab = por.length ? Math.min(...por.map(q => ACRO_STAB[q.s] || 2)) : 4;   // le porteur le moins stable fait la difficulté
  const h = +f.h || 1;
  const app = Math.max(0, 4 - stab) * (h > 1 ? 1 : .5);
  const haut = h >= 3 ? 4 : h === 2 ? 1 : 0;
  const vp = vol.map(q => ACRO_SEMI.includes(q.s) ? 2 : ACRO_VOLPTS[ACRO_VOL_OF[q.s]] || 0), vMax = vp.length ? Math.max(...vp) : 0;
  let bonus = 0;
  if (acroBuild(f).some(b => b.q.r === 'v' && b.q.y > 0 && ['semi', 'atr', 'carpe'].includes(b.q.s))) bonus += 2.5;   // renversé / semi en hauteur (porté)
  if (vol.some(q => q.s === 'arab')) bonus += .5;                                                                 // équilibre sur un pied
  return { app, haut, vol: vMax, bonus, stab, total: app + haut + vMax + bonus };
}
const acroAutoNiv = f => { const t = acroScore(f).total; return t <= 2 ? 'A' : t <= 3.5 ? 'B' : t <= 6 ? 'C' : 'D'; };
const acroNivRaw = f => DB.acro && DB.acro.niv && DB.acro.niv[f.id];   // 'A'…'D' = classé à la main · 'auto' = calcul forcé
const acroNiv = f => { const r = acroNivRaw(f); return r && r !== 'auto' ? r : r === 'auto' ? acroAutoNiv(f) : f.nv || acroAutoNiv(f); };
const acroNivMan = f => { const r = acroNivRaw(f); return !!r && r !== 'auto'; };
const acroNivBadge = (f, big) => { const n = acroNiv(f); return `<span title="Niveau ${n} : ${ACRO_NIV[n]}${acroNivMan(f) ? ' (modifié)' : ''}" style="display:inline-grid;place-items:center;min-width:${big ? 34 : 24}px;height:${big ? 34 : 24}px;border-radius:8px;background:${ACRO_NIV_COL[n]};color:#fff;font-weight:900;font-size:${big ? '1.1rem' : '.85rem'}">${n}${acroNivMan(f) ? '<sup style="font-size:.55em">✋</sup>' : ''}</span>`; };
const ACRO_POR = { horizontal: 'Horizontal (banc, dos)', assis: 'Assis', debout: 'Debout', trepied: 'Trépied' };
const ACRO_EFF = { 2: 'Duo', 3: 'Trio', 4: 'Quatuor' };

function acroBuild(f) {
  // q.on = [i, 'articulation', dx, dy] : placé par rapport à une articulation d'une personne déjà construite
  const B = []; f.p.forEach(q => { let x = q.x, y = q.y; if (q.on && B[q.on[0]]) { const t = B[q.on[0]].j[q.on[1]]; x = t[0] + (q.on[2] || 0); y = t[1] + (q.on[3] || 0); }
    B.push({ q: q.on ? { ...q, x, y } : q, ...AC[q.s](x, y, q) }); });
  B.forEach(b => {   // bras dirigés vers une prise : [x, y] ou { i: personne, j: articulation }
    const g = b.q.grip; if (!g) return; const t = Array.isArray(g) ? g : B[g.i] && B[g.i] !== b && B[g.i].j[g.j]; if (!t) return;
    const n = b.j.n, dx = t[0] - n[0], dy = t[1] - n[1], L = Math.hypot(dx, dy) || 1, bd = Math.max(2, 14 - L / 4), e = [(n[0] + t[0]) / 2 - dy / L * bd, (n[1] + t[1]) / 2 + dx / L * bd];
    Object.assign(b.j, { e1: e, m1: [t[0] - 1, t[1]], e2: [e[0] + 2, e[1] - 1], m2: [t[0] + 1, t[1]] });
  });
  return B;
}
const acroAll = () => [...ACRO, ...((DB.acro && DB.acro.custom) || [])];
const acroFind = id => acroAll().find(x => x.id === id);
function acroAppuis(f) { return acroBuild(f).reduce((a, b) => a + (b.q.y === 0 || b.q.z ? b.sol : 0), 0); }
function acroSVG(f, big) {
  const B = acroBuild(f), pts = B.flatMap(b => Object.values(b.j));
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs) - 12, x1 = Math.max(...xs) + 12, y1 = Math.max(...ys) + 12, W = x1 - x0, H = y1 + 6;
  const T = ([x, y]) => `${(x - x0).toFixed(1)},${(y1 - y).toFixed(1)}`;
  const draw = b => { const j = b.j, col = b.q.r === 'p' ? '#1E5BD8' : '#C9A227', op = b.q.z ? .45 : 1;
    const L = (...k) => `<polyline points="${k.map(n => T(j[n])).join(' ')}" />`;
    return `<g stroke="${col}" fill="none" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" opacity="${op}">${L('m1', 'e1', 'n', 'e2', 'm2')}${L('f1', 'k1', 'p', 'k2', 'f2')}${L('n', 'p')}<circle cx="${T(j.h).split(',')[0]}" cy="${T(j.h).split(',')[1]}" r="7" fill="${col}" stroke="none"/></g>`; };
  const order = [...B].sort((a, b) => (b.q.z || 0) - (a.q.z || 0) || (a.q.r === 'v') - (b.q.r === 'v'));
  return `<svg viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" style="width:100%;height:${big ? 'auto' : '120px'};max-height:${big ? '55vh' : '120px'}" role="img" aria-label="${esc(f.n)}">
    <line x1="0" y1="${y1.toFixed(1)}" x2="${W.toFixed(0)}" y2="${y1.toFixed(1)}" stroke="var(--line)" stroke-width="3"/>${order.map(draw).join('')}</svg>`;
}

/* Photo : redimensionnée (900 px max), JPEG — une rubrique par photo pour une synchro légère */
function acroPhoto(file) {
  return new Promise((ok, ko) => { const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { const r = Math.min(1, 900 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', .65)); };
    img.onerror = () => { URL.revokeObjectURL(url); ko(new Error('Image illisible')); }; img.src = url; });
}
const acroImgKey = id => 'acroImg_' + id;
/* ---------- Vidéos (Gym / Acrosport) : gardées sur la tablette qui filme (IndexedDB), trop lourdes pour la synchronisation ---------- */
const epsVidOpen = () => new Promise((ok, ko) => { const r = indexedDB.open('epsone-videos', 1); r.onupgradeneeded = () => r.result.createObjectStore('v'); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
const epsVidOp = (mode, f) => epsVidOpen().then(db => new Promise((ok, ko) => { const tx = db.transaction('v', mode), q = f(tx.objectStore('v')); tx.oncomplete = () => ok(q && q.result); tx.onerror = () => ko(tx.error); tx.onabort = () => ko(tx.error || new Error('Espace insuffisant sur la tablette')); }));
const EPS_VURL = {};
window.epsVidPut = (id, blob) => { try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {} if (EPS_VURL[id]) { URL.revokeObjectURL(EPS_VURL[id]); delete EPS_VURL[id]; } return epsVidOp('readwrite', s => s.put(blob, id)); };
window.epsVidDel = id => { if (!id) return; if (EPS_VURL[id]) { URL.revokeObjectURL(EPS_VURL[id]); delete EPS_VURL[id]; } return epsVidOp('readwrite', s => s.delete(id)).catch(() => {}); };
window.epsVidUrl = id => EPS_VURL[id] ? Promise.resolve(EPS_VURL[id]) : epsVidOp('readonly', s => s.get(id)).then(b => b ? (EPS_VURL[id] = URL.createObjectURL(b)) : null).catch(() => null);
/* Enregistre le fichier vidéo choisi / filmé pour l'élément it (it.vid) */
window.epsVidSet = async (file, it, done) => {
  if (!file) return; if (!/^video\//.test(file.type || 'video/')) return toast('Ce fichier n\'est pas une vidéo');
  if (file.size > 600 * 1024 * 1024) return toast('Vidéo trop lourde (600 Mo max) : filmez une séquence plus courte');
  toast('🎬 Enregistrement de la vidéo…'); const id = it.vid || 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  try { await epsVidPut(id, file); it.vid = id; save(); toast('Vidéo enregistrée sur cette tablette ✔'); done && done(); } catch (e) { toast('Impossible d\'enregistrer la vidéo : ' + (e && e.message || 'espace insuffisant')); }
};
/* Emplacement vidéo (rempli par epsVidHydrate) */
window.epsVidSlot = (it, big) => it && it.vid ? `<div data-vid="${esc(it.vid)}"${big ? ' data-big="1"' : ''} style="flex:1 1 ${big ? '280px' : '0'};min-width:0;${big ? 'max-width:560px' : ''}"><div class="muted" style="font-size:.75rem;text-align:center;padding:8px">🎬 Chargement…</div></div>` : '';
window.epsVidHydrate = root => root.querySelectorAll('[data-vid]').forEach(async d => { const url = await epsVidUrl(d.dataset.vid);
  if (!url) { d.innerHTML = '<div class="muted" style="font-size:.75rem;text-align:center;padding:8px;border:1.5px dashed var(--line);border-radius:10px">🎬 Vidéo filmée sur une autre tablette</div>'; return; }
  if (d.dataset.big) { d.innerHTML = `<video src="${url}" controls playsinline preload="metadata" style="width:100%;max-height:62vh;border-radius:12px;background:#000"></video><div class="tog" data-cfg="bare" style="margin-top:6px;justify-content:center">${[.25, .5, 1].map(r => `<button data-vr="${r}" class="${r === 1 ? 'on' : ''}">×${String(r).replace('.', ',')}</button>`).join('')}</div>`;
    const v = d.querySelector('video'); d.querySelectorAll('[data-vr]').forEach(b => b.onclick = () => { v.playbackRate = +b.dataset.vr; d.querySelectorAll('[data-vr]').forEach(x => x.classList.toggle('on', x === b)); }); return; }
  d.innerHTML = `<div style="position:relative;cursor:pointer"><video src="${url}#t=0.1" muted playsinline preload="metadata" style="width:100%;max-height:120px;object-fit:contain;border-radius:10px;background:#000;display:block"></video><span style="position:absolute;inset:0;display:grid;place-items:center;font-size:2rem;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6);pointer-events:none">▶</span></div>`;
  d.firstChild.onclick = () => epsVidPlay(url); });
window.epsVidPlay = url => { const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:330;background:rgba(0,0,0,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:12px';
  o.innerHTML = `<video src="${url}" controls autoplay playsinline style="max-width:100%;max-height:80vh;border-radius:10px"></video><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">${[.25, .5, 1].map(r => `<button class="btn ${r === 1 ? 'btn-grad' : 'btn-ghost'}" style="flex:0 0 auto;padding:8px 14px" data-vr="${r}">×${String(r).replace('.', ',')}</button>`).join('')}<button class="btn btn-ghost" style="flex:0 0 auto;padding:8px 14px" data-vq>✕ Fermer</button></div>`;
  const v = o.querySelector('video'); o.querySelectorAll('[data-vr]').forEach(b => b.onclick = () => { v.playbackRate = +b.dataset.vr; o.querySelectorAll('[data-vr]').forEach(x => x.className = 'btn ' + (x === b ? 'btn-grad' : 'btn-ghost')); });
  o.querySelector('[data-vq]').onclick = () => { v.pause(); o.remove(); }; document.body.appendChild(o); };
/* Type de lien : diaporama (ppt, pptx, key, pdf, Google Slides, PowerPoint en ligne) ou vidéo */
const acroIsSlides = u => /\.(pptx?|ppsx?|key|pdf|odp)(\?|#|$)/i.test(u || '') || /docs\.google\.com\/presentation|1drv\.ms\/p\/|powerpoint|sharepoint\.com.*\.pptx/i.test(u || '');
const acroDriveId = u => ((/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]{10,})/.exec(u || '') || [])[1])
  || (/rtpof=true/.test(u || '') && (/docs\.google\.com\/(?:presentation|document|spreadsheets)\/d\/([\w-]{10,})/.exec(u) || [])[1]);   // fichier Office (pptx…) stocké dans Drive
const acroGSlidesId = u => !acroDriveId(u) && (/docs\.google\.com\/presentation\/d\/([\w-]{10,})/.exec(u || '') || [])[1];   // vrai Google Slides
const acroBtn = (u, long) => acroDriveId(u) || acroIsSlides(u) ? (long ? '📊 Voir le diaporama de la liaison' : '📊 Diaporama') : (long ? '▶ Voir la vidéo de la liaison' : '▶ Vidéo');
/* Vidéo d'une liaison : YouTube intégré, fichier vidéo lu dans l'app, sinon ouverture du lien */
function acroVideo(li) {
  if (!li || !li.url) return;
  const u = li.url, yt = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/.exec(u), file = /\.(mp4|m4v|mov|webm)(\?|#|$)/i.test(u);
  const did = acroDriveId(u);
  if (did) {   // Fichier Google Drive : éviter l'ouverture forcée dans Google Slides (fichiers PowerPoint)
    const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:330;background:rgba(7,18,42,.8);display:grid;place-items:center;padding:16px';
    o.innerHTML = `<div class="card" style="max-width:420px;width:100%"><h3 style="margin:0 0 4px">📊 ${esc(li.n)}</h3><p class="muted" style="margin:0 0 12px;font-size:.85rem">Diaporama (Google Drive)</p>
      <a class="btn btn-grad btn-block" style="text-decoration:none" href="https://drive.google.com/uc?export=download&id=${did}" target="_blank" rel="noopener">📥 Ouvrir dans PowerPoint / Keynote</a>
      <p class="muted" style="margin:4px 2px 12px;font-size:.78rem">Télécharge le fichier puis « Ouvrir dans… » : diaporama complet avec animations. Gros fichier : touchez « Télécharger quand même ».</p>
      <button class="btn btn-ghost btn-block" id="avx">✕ Fermer</button></div>`;
    o.onclick = e => { if (e.target === o || e.target.id === 'avx') o.remove(); }; document.body.appendChild(o); return;
  }
  const gs = acroGSlidesId(u);
  if (gs) {   // Google Slides natif : présentation plein écran ou export PowerPoint
    const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:330;background:rgba(7,18,42,.8);display:grid;place-items:center;padding:16px';
    o.innerHTML = `<div class="card" style="max-width:420px;width:100%"><h3 style="margin:0 0 4px">📊 ${esc(li.n)}</h3><p class="muted" style="margin:0 0 12px;font-size:.85rem">Google Slides</p>
      <a class="btn btn-grad btn-block" style="text-decoration:none" href="https://docs.google.com/presentation/d/${gs}/present" target="_blank" rel="noopener">▶ Présenter</a>
      <a class="btn btn-ghost btn-block" style="text-decoration:none;margin-top:10px" href="https://docs.google.com/presentation/d/${gs}/export/pptx" target="_blank" rel="noopener">📥 Ouvrir dans PowerPoint / Keynote</a>
      <button class="btn btn-ghost btn-block" style="margin-top:10px" id="avx">✕ Fermer</button></div>`;
    o.onclick = e => { if (e.target === o || e.target.id === 'avx') o.remove(); }; document.body.appendChild(o); return;
  }
  if (!yt && !file) { window.open(u, '_blank', 'noopener'); return; }   // diaporama, Drive, autre lien : ouvert dans le navigateur
  const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:330;background:rgba(0,0,0,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;gap:10px';
  o.innerHTML = `<b style="color:#fff">🔗 ${esc(li.n)}</b>${yt ? `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?playsinline=1&rel=0" style="width:min(960px,100%);aspect-ratio:16/9;border:0;border-radius:12px" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
    : `<video src="${esc(u)}" controls playsinline autoplay loop style="max-width:100%;max-height:78vh;border-radius:12px;background:#000"></video>`}
    <div class="row" style="gap:8px"><a class="btn btn-ghost" href="${esc(u)}" target="_blank" rel="noopener" style="text-decoration:none">↗ Ouvrir le lien</a><button class="btn btn-grad" id="avx">✕ Fermer</button></div>`;
  o.querySelector('#avx').onclick = () => o.remove(); document.body.appendChild(o);
}
const acroZoom = src => { const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:320;background:rgba(0,0,0,.92);display:grid;place-items:center;padding:12px'; o.innerHTML = `<img src="${src}" style="max-width:100%;max-height:100%;object-fit:contain">`; o.onclick = () => o.remove(); document.body.appendChild(o); };

/* Dessins des prises de mains (schémas originaux) — porteur bleu, voltigeur or */
const acroGripSVG = (() => {
  const B = '#1E5BD8', BH = '#6E9BF5', G = '#C9A227', GH = '#EBCB63', O = '#0B2A5B';
  const limb = (x1, y1, x2, y2, c, w = 18) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${O}" stroke-width="${w + 3}" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  // main qui entoure un segment (vue de côté) : centre cx,cy, angle a du segment, couleur, largeur du segment
  const wrap = (cx, cy, a, c, w = 18, thumbSide = 1) => `<g transform="translate(${cx} ${cy}) rotate(${a})">
    <rect x="-9" y="${-w / 2 - 5}" width="18" height="${w + 10}" rx="7" fill="${c}" stroke="${O}" stroke-width="1.5"/>
    ${[-4.5, 0, 4.5].map(d => `<line x1="${d}" y1="${-w / 2 - 4}" x2="${d}" y2="${thumbSide > 0 ? w / 2 - 2 : -w / 2 + 6}" stroke="${O}" stroke-width="1.1" opacity=".7"/>`).join('')}
    <ellipse cx="0" cy="${thumbSide * (w / 2 + 6)}" rx="8" ry="4.5" fill="${c}" stroke="${O}" stroke-width="1.5"/></g>`;
  // main à plat (vue de dessus) : poignet en x,y, doigts vers l'angle a
  const flat = (x, y, a, c, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">
    ${[-10.5, -3.5, 3.5, 10.5].map((d, i) => `<rect x="${d - 3.2}" y="${-44 + (i === 0 || i === 3 ? 6 : 0)}" width="6.4" height="${22 - (i === 0 || i === 3 ? 4 : 0)}" rx="3.2" fill="${c}" stroke="${O}" stroke-width="1.4"/>`).join('')}
    <rect x="-14" y="-26" width="28" height="26" rx="9" fill="${c}" stroke="${O}" stroke-width="1.5"/>
    <rect x="12" y="-22" width="7" height="18" rx="3.5" transform="rotate(35 15 -12)" fill="${c}" stroke="${O}" stroke-width="1.4"/></g>`;
  const svg = (inner, vb = '0 0 160 116') => `<svg viewBox="${vb}" style="width:100%;max-width:220px;display:block;margin:4px auto 0" role="img">${inner}</svg>`;
  const lab = (x, y, t, c) => `<text x="${x}" y="${y}" font-size="9" font-weight="800" fill="${c}" text-anchor="middle">${t}</text>`;
  const D = {
    // 1. main dans la main : les deux avant-bras se rejoignent, mains serrées, pouces croisés
    main: () => svg(limb(10, 70, 62, 58, B) + limb(150, 70, 98, 58, G) +
      `<rect x="58" y="44" width="44" height="26" rx="12" fill="${GH}" stroke="${O}" stroke-width="1.5"/>
       ${[66, 74, 82, 90].map(x => `<line x1="${x}" y1="46" x2="${x}" y2="62" stroke="${O}" stroke-width="1.1" opacity=".6"/>`).join('')}
       <rect x="56" y="50" width="40" height="22" rx="11" fill="${BH}" stroke="${O}" stroke-width="1.5"/>
       ${[64, 72, 80, 88].map(x => `<line x1="${x}" y1="56" x2="${x}" y2="70" stroke="${O}" stroke-width="1.1" opacity=".6"/>`).join('')}
       <ellipse cx="80" cy="45" rx="12" ry="4.5" fill="${BH}" stroke="${O}" stroke-width="1.5"/><ellipse cx="80" cy="76" rx="12" ry="4.5" fill="${GH}" stroke="${O}" stroke-width="1.5"/>` + lab(26, 96, 'porteur', B) + lab(134, 96, 'voltigeur', G)),
    // 2. poignet contre poignet : chacun entoure le poignet de l'autre
    poignet: () => svg(limb(8, 64, 112, 50, B) + limb(152, 64, 48, 50, G) + wrap(100, 52, -8, BH, 18, 1) + wrap(60, 52, 8, GH, 18, -1) +
      lab(80, 100, 'main ↔ poignet', O)),
    // 3. chaise à 4 mains : vue de dessus, les 4 avant-bras forment un carré
    chaise: () => svg(limb(30, 32, 112, 32, B, 14) + limb(48, 78, 130, 78, '#3E77E8', 14) + limb(40, 22, 40, 88, '#3E77E8', 14) + limb(120, 22, 120, 88, B, 14) +
      wrap(40, 32, 90, BH, 14, 1) + wrap(120, 32, 90, BH, 14, -1) + wrap(40, 78, 90, '#9DBBF7', 14, 1) + wrap(120, 78, 90, '#9DBBF7', 14, -1) +
      `<rect x="56" y="46" width="48" height="18" rx="8" fill="${GH}" opacity=".55"/>` + lab(80, 58, 'assise', '#7A5E10') + lab(80, 104, 'vue de dessus · 2 porteurs', O)),
    // 4. coupelle : doigts croisés, paumes vers le haut, un pied posé dedans
    coupelle: () => svg(limb(16, 92, 56, 74, B) + limb(144, 92, 104, 74, B) +
      `<path d="M50 66 Q80 92 110 66 L110 78 Q80 104 50 78 Z" fill="${BH}" stroke="${O}" stroke-width="1.5"/>
       ${[62, 70, 78, 86, 94].map((x, i) => `<line x1="${x}" y1="${70 + (i % 2) * 2}" x2="${x + (i % 2 ? -4 : 4)}" y2="${86}" stroke="${O}" stroke-width="1.2" opacity=".6"/>`).join('')}
       <path d="M64 70 L64 40 Q64 34 70 34 L80 34 L80 58 Q96 58 100 66 L100 70 Z" fill="${G}" stroke="${O}" stroke-width="1.6"/>` +
      lab(118, 30, 'pied', G) + lab(80, 112, 'doigts croisés, paumes en haut', B)),
    // 5. chevilles : jambes du voltigeur verticales (ATR), mains du porteur autour des chevilles, pouces en haut
    chevilles: () => svg(limb(68, 100, 68, 18, G, 16) + limb(92, 100, 92, 18, G, 16) +
      `<path d="M60 18 L58 6 L78 6 L76 18 Z M84 18 L82 6 L102 6 L100 18 Z" fill="${G}" stroke="${O}" stroke-width="1.4"/>` +
      limb(18, 60, 52, 34, B, 14) + limb(142, 60, 108, 34, B, 14) + wrap(66, 30, 90, BH, 16, -1) + wrap(94, 30, 90, BH, 16, 1)),
    // 6. mollets : main plaquée sur le mollet, sous le genou
    mollets: () => svg(limb(70, 4, 70, 46, G, 18) + limb(70, 46, 74, 100, G, 16) + `<circle cx="70" cy="46" r="6" fill="${O}" opacity=".35"/>` +
      `<path d="M66 100 L100 100 Q102 108 94 108 L66 108 Z" fill="${G}" stroke="${O}" stroke-width="1.4"/>` +
      limb(140, 86, 92, 64, B, 14) + wrap(74, 60, 2, BH, 18, 1) + lab(34, 49, 'genou', O) + `<line x1="46" y1="47" x2="62" y2="46" stroke="${O}" stroke-width="1"/>` + lab(124, 112, 'sous le genou', B)),
    // 7. bassin : mains sur les côtés du bassin (os des hanches)
    bassin: () => svg(`<path d="M50 8 L110 8 L114 52 Q116 64 104 70 L56 70 Q44 64 46 52 Z" fill="${GH}" stroke="${O}" stroke-width="1.6"/>` + limb(64, 70, 60, 106, G, 18) + limb(96, 70, 100, 106, G, 18) +
      limb(10, 100, 36, 70, B, 14) + limb(150, 100, 124, 70, B, 14) + flat(38, 70, 25, BH, .8) + flat(122, 70, -25, BH, .8) + lab(80, 34, 'ventre : NON', '#C62828')),
    // 8. épaules : paumes sous les épaules, bras verrouillés
    epaules: () => svg(`<circle cx="80" cy="24" r="14" fill="${G}" stroke="${O}" stroke-width="1.6"/><path d="M42 48 Q80 34 118 48 L114 108 L46 108 Z" fill="${GH}" stroke="${O}" stroke-width="1.6"/>` +
      limb(14, 110, 44, 78, B, 14) + limb(146, 110, 116, 78, B, 14) + flat(46, 78, 12, BH, .8) + flat(114, 78, -12, BH, .8) + lab(80, 96, 'voltigeur', '#7A5E10')),
    // 9. appui main sur épaule : mains à plat sur les épaules du porteur, doigts vers l'avant
    appuiep: () => svg(`<circle cx="80" cy="30" r="14" fill="${B}" stroke="${O}" stroke-width="1.6"/><path d="M36 58 Q80 42 124 58 L120 108 L40 108 Z" fill="${BH}" stroke="${O}" stroke-width="1.6"/>` +
      limb(46, 2, 52, 46, G, 14) + limb(114, 2, 108, 46, G, 14) + flat(52, 44, 180, GH, .8) + flat(108, 44, 180, GH, .8) + lab(80, 104, 'porteur', '#fff')),
    // 10. pied dans la main : main à plat, bras verrouillé, plante du pied posée
    piedmain: () => svg(limb(80, 106, 80, 58, B, 18) + flat(80, 60, 0, BH, .9) +
      `<path d="M58 30 L58 6 L74 6 L74 22 Q100 20 104 28 L104 32 L58 32 Z" fill="${G}" stroke="${O}" stroke-width="1.6"/>` + lab(120, 22, 'plante', G) + lab(122, 80, 'bras verrouillé', B)),
  };
  return k => (D[k] || (() => ''))();
})();

/* Validation par l'enseignant de chaque élément présenté : 4 niveaux de maîtrise (partagé Gym / Acrosport) */
window.EPS_M = window.EPS_M || [['Maîtrise insuffisante', '#D64545', 'Insuff.'], ['Maîtrise fragile', '#E0892F', 'Fragile'], ['Maîtrise satisfaisante', '#2F6BD8', 'Satisf.'], ['Très bonne maîtrise', '#1B9E5A', 'Très bonne']];
window.epsMBar = window.epsMBar || ((cur, attr) => `<div data-cfg="bare" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${EPS_M.map(([l, c, s], i) => `<button type="button" ${attr}="${i}" style="padding:10px 4px;border-radius:12px;border:1.5px solid ${cur === i ? 'transparent' : 'var(--line)'};background:${cur === i ? c : 'var(--card)'};color:${cur === i ? '#fff' : 'inherit'};font-weight:800;font-size:.78rem;line-height:1.15">${l}</button>`).join('')}</div>`);
window.epsMTag = window.epsMTag || (m => m == null ? '' : `<span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:.7rem;font-weight:800;color:#fff;background:${EPS_M[m][1]}">${EPS_M[m][2]}</span>`);
window.epsMAvg = window.epsMAvg || (L => { const v = L.filter(x => x != null); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null; });

/* ---------- Création de pyramide (éditeur glisser-déposer) ---------- */
const ACRO_POSES = { stand: 'Debout', arab: 'Arabesque (1 pied)', genoux: 'À genoux', assis: 'Assis, jambes fléchies', siege: 'Assis sur un appui', trep: 'Trépied (chevalier)',
  table: 'À 4 pattes (banc)', dos: 'Sur le dos, jambes en l\'air', planche: 'Planche (horizontal)', epaules: 'Sur les épaules (de face)', brouette: 'Brouette', semi: 'Semi-renversé (mains au sol)', atr: 'ATR (renversé)',
  pont: 'Pont (ventre vers le haut)', dosf: 'Allongé, jambes fléchies', allonge: 'Allongé, bras tendus en l\'air', fente: 'Fente avant', talons: 'À genoux assis sur les talons', assisl: 'Assis, jambes tendues',
  equerre: 'Équerre (assis en V)', equerrem: 'Équerre en appui sur les mains', planchef: 'Planche faciale (ventre en haut)', pompe: 'Planche en appui sur les mains', carpe: 'Carpé renversé (jambes horizontales)' };
const ACRO_POSES_P = ['stand', 'trep', 'table', 'dos', 'assis', 'genoux', 'pont', 'dosf', 'allonge', 'fente', 'talons', 'assisl'];
const ACRO_POR_OF = { stand: 'debout', trep: 'trepied', table: 'horizontal', dos: 'horizontal', assis: 'assis', genoux: 'assis', pont: 'horizontal', dosf: 'horizontal', allonge: 'horizontal', fente: 'debout', talons: 'assis', assisl: 'assis' };
const ACRO_ARMS = { '': 'Auto', up: 'En l\'air', side: 'Écartés', front: 'Devant', upfront: 'Devant en haut', hold: 'Tenir (bas)', hip: 'Aux hanches' };
const ACRO_GRIP_J = { f1: 'les chevilles', m1: 'les mains', p: 'le bassin', k1: 'les genoux', n: 'les épaules' };
const acroLevels = p => { const ys = [...p.map(q => q.y)].sort((a, b) => a - b); let L = 0, last = -99; ys.forEach(y => { if (y > last + 20) { L++; last = y; } }); return Math.max(1, Math.min(3, L)); };

function acroEditor(src, onSave) {
  const F0 = src ? { ...JSON.parse(JSON.stringify(src)), p: acroBuild(src).map(b => { const q = { ...b.q, x: Math.round(b.q.x), y: Math.round(b.q.y) }; delete q.on; return q; }) } : { n: '', c: '', p: [{ r: 'p', s: 'table', x: 0, y: 0 }, { r: 'v', s: 'stand', x: 2, y: 35, a: 'up' }] };
  const E = { n: F0.n || '', c: F0.c || '', p: F0.p.map(q => ({ ...q })) };
  let sel = E.p.length - 1;
  const X0 = -170, X1 = 170, YT = 230, SC = { x0: X0, W: X1 - X0, H: YT + 10 };
  const o = document.createElement('div');
  o.style.cssText = 'position:fixed;inset:0;z-index:320;background:var(--bg,#f3f6fc);overflow:auto;padding:14px';
  document.body.appendChild(o);
  const close = () => o.remove();
  const T = ([x, y]) => [x - X0, YT - y];
  const svg = () => { const B = acroBuild(E);
    const order = B.map((b, i) => ({ b, i })).sort((a, c) => (c.b.q.z || 0) - (a.b.q.z || 0));
    const g = ({ b, i }) => { const j = b.j, col = b.q.r === 'p' ? '#1E5BD8' : '#C9A227', op = b.q.z ? .45 : 1, L = (...k) => `<polyline points="${k.map(n => T(j[n]).map(v => v.toFixed(1)).join(',')).join(' ')}"/>`, h = T(j.h);
      const pts = Object.values(j).map(T), bx = [Math.min(...pts.map(p => p[0])) - 8, Math.min(...pts.map(p => p[1])) - 8, Math.max(...pts.map(p => p[0])) + 8, Math.max(...pts.map(p => p[1])) + 8];
      return `<g data-pi="${i}" style="cursor:grab">${i === sel ? `<rect x="${bx[0]}" y="${bx[1]}" width="${bx[2] - bx[0]}" height="${bx[3] - bx[1]}" rx="8" fill="rgba(30,91,216,.08)" stroke="#1E5BD8" stroke-dasharray="5 4" stroke-width="1.5"/>` : `<rect x="${bx[0]}" y="${bx[1]}" width="${bx[2] - bx[0]}" height="${bx[3] - bx[1]}" fill="transparent"/>`}
        <g stroke="${col}" fill="none" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" opacity="${op}">${L('m1', 'e1', 'n', 'e2', 'm2')}${L('f1', 'k1', 'p', 'k2', 'f2')}${L('n', 'p')}<circle cx="${h[0]}" cy="${h[1]}" r="7" fill="${col}" stroke="none"/></g>
        <text x="${h[0]}" y="${h[1] - 11}" text-anchor="middle" font-size="11" font-weight="800" fill="${col}">${b.q.r === 'p' ? 'P' : 'V'}${E.p.filter((q, k) => q.r === b.q.r && k <= i).length}</text></g>`; };
    return `<svg id="aed-svg" viewBox="0 0 ${SC.W} ${SC.H}" style="width:100%;max-height:52vh;background:var(--card);border-radius:14px;touch-action:none;user-select:none;-webkit-user-select:none">
      <line x1="0" y1="${YT}" x2="${SC.W}" y2="${YT}" stroke="var(--line)" stroke-width="3"/>${order.map(g).join('')}</svg>`; };
  const who = i => { const q = E.p[i]; return (q.r === 'p' ? 'Porteur ' : 'Voltigeur ') + E.p.filter((x, k) => x.r === q.r && k <= i).length; };
  const draw = () => {
    const q = E.p[sel], nP = E.p.filter(x => x.r === 'p').length, nV = E.p.length - nP, eff = E.p.length;
    const poses = q ? (q.r === 'p' ? ACRO_POSES_P : Object.keys(ACRO_POSES)) : [];
    o.innerHTML = `<div style="max-width:760px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px"><h3 style="flex:1;margin:0">${src && src.custom ? '✏️ Modifier la pyramide' : '✏️ Nouvelle pyramide'}</h3><button class="btn btn-ghost" id="aex">✕ Fermer</button></div>
      <div class="card" style="margin-top:10px"><label style="margin-top:0">Nom</label><input id="aen" value="${esc(E.n)}" placeholder="ex : Le pont à deux chevaliers">
        <label>Effectif</label><div class="tog">${[2, 3, 4].map(n => `<button data-eff="${n}" class="${eff === n ? 'on' : ''}">${ACRO_EFF[n]}</button>`).join('')}</div>
        <p class="muted" style="margin:6px 0 0;font-size:.8rem">${nP} porteur${nP > 1 ? 's' : ''} · ${nV} voltigeur${nV > 1 ? 's' : ''} · ${acroLevels(E.p)} étage${acroLevels(E.p) > 1 ? 's' : ''} · ${acroAppuis(E)} appuis au sol</p></div>
      <div style="margin-top:10px">${svg()}</div>
      <p class="muted" style="margin:6px 2px 0;font-size:.8rem">Faites glisser un élève pour le placer. Touchez-le pour le régler. Près du sol, il se pose automatiquement.</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">${E.p.map((x, i) => `<button class="btn ${i === sel ? 'btn-grad' : 'btn-ghost'}" style="padding:8px 12px;flex:0 0 auto;border-bottom:4px solid ${x.r === 'p' ? '#1E5BD8' : '#C9A227'}" data-sel="${i}">${who(i)}</button>`).join('')}</div>
      ${q ? `<div class="card" style="margin-top:10px">
        <div class="row"><div><label style="margin-top:0">Rôle</label><div class="tog"><button data-role="p" class="${q.r === 'p' ? 'on' : ''}">Porteur</button><button data-role="v" class="${q.r === 'v' ? 'on' : ''}">Voltigeur</button></div></div>
          <div><label style="margin-top:0">Posture</label><select id="aes">${poses.map(k => `<option value="${k}" ${q.s === k ? 'selected' : ''}>${ACRO_POSES[k]}</option>`).join('')}</select></div></div>
        ${q.s === 'semi' ? `<label>Inclinaison du corps : <b id="aeav">${q.ang == null ? 45 : q.ang}°</b> <span class="muted">(90° = ATR)</span></label><input type="range" id="aea" min="15" max="85" step="1" value="${q.ang == null ? 45 : q.ang}">` : ''}
        <div class="row"><div><label>Bras</label><select id="aeb" ${q.grip ? 'disabled' : ''}>${Object.entries(ACRO_ARMS).map(([k, l]) => `<option value="${k}" ${(q.a || '') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Tient…</label><select id="aeg"><option value="">— rien —</option>${E.p.map((x, i) => i === sel ? '' : Object.entries(ACRO_GRIP_J).map(([j, l]) => `<option value="${i}|${j}" ${q.grip && q.grip.i === i && q.grip.j === j ? 'selected' : ''}>${who(i)} : ${l}</option>`).join('')).join('')}</select></div></div>
        <div class="row" style="margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-ghost" id="aem">⇆ Retourner</button>
          <button class="btn ${q.z ? 'btn-grad' : 'btn-ghost'}" id="aez">${q.z ? '◐ Plan arrière' : '● Plan avant'}</button>
          ${['semi', 'atr', 'stand'].includes(q.s) ? `<button class="btn ${q.split || q.wide ? 'btn-grad' : 'btn-ghost'}" id="aesp">↔ Jambes écartées</button>` : ''}</div>
        <div style="display:flex;gap:6px;margin-top:10px;align-items:center;justify-content:center"><span class="muted" style="font-size:.8rem">Ajuster</span>
          ${[['←', -2, 0], ['→', 2, 0], ['↑', 0, 2], ['↓', 0, -2]].map(([l, dx, dy]) => `<button class="btn btn-ghost" style="padding:8px 14px" data-nx="${dx}" data-ny="${dy}">${l}</button>`).join('')}
          <button class="btn btn-ghost" style="padding:8px 12px" id="aedel" ${eff <= 2 ? 'disabled' : ''}>🗑</button></div></div>` : ''}
      <div class="card" style="margin-top:10px"><label style="margin-top:0">Consigne de sécurité / réalisation</label><textarea id="aec" rows="2" placeholder="ex : Mains à l'aplomb des épaules, porteur dos droit.">${esc(E.c)}</textarea></div>
      <div class="row" style="margin:12px 0 30px"><button class="btn btn-grad" id="aeok">💾 Enregistrer la pyramide</button><button class="btn btn-ghost" id="aeko">Annuler</button></div></div>`;
    const $ = s => o.querySelector(s);
    $('#aen').oninput = e => { E.n = e.target.value; };
    $('#aec').oninput = e => { E.c = e.target.value; };
    $('#aex').onclick = $('#aeko').onclick = () => { if (confirm('Fermer sans enregistrer ?')) close(); };
    o.querySelectorAll('[data-eff]').forEach(b => b.onclick = () => { const n = +b.dataset.eff;
      while (E.p.length > n) { const i = E.p.length - 1; E.p.pop(); E.p.forEach(x => { if (x.grip && x.grip.i >= i) delete x.grip; }); }
      while (E.p.length < n) E.p.push({ r: 'v', s: 'stand', x: -60 + 45 * E.p.length, y: 0, a: 'side' });
      sel = Math.min(sel, E.p.length - 1); draw(); });
    o.querySelectorAll('[data-sel]').forEach(b => b.onclick = () => { sel = +b.dataset.sel; draw(); });
    if (q) {
      o.querySelectorAll('[data-role]').forEach(b => b.onclick = () => { q.r = b.dataset.role; if (q.r === 'p' && !ACRO_POSES_P.includes(q.s)) q.s = 'table'; draw(); });
      $('#aes').onchange = e => { q.s = e.target.value; if (q.s === 'semi' && q.ang == null) q.ang = 45; draw(); };
      if ($('#aea')) $('#aea').oninput = e => { q.ang = +e.target.value; $('#aeav').textContent = q.ang + '°'; redrawSvg(); };
      $('#aeb').onchange = e => { if (e.target.value) q.a = e.target.value; else delete q.a; draw(); };
      $('#aeg').onchange = e => { const v = e.target.value; if (v) { const [i, j] = v.split('|'); q.grip = { i: +i, j }; } else delete q.grip; draw(); };
      $('#aem').onclick = () => { q.m = (q.m || 1) === 1 ? -1 : 1; draw(); };
      $('#aez').onclick = () => { if (q.z) delete q.z; else q.z = 1; draw(); };
      if ($('#aesp')) $('#aesp').onclick = () => { const k = q.s === 'stand' ? 'wide' : 'split'; if (q[k]) delete q[k]; else q[k] = 1; draw(); };
      o.querySelectorAll('[data-nx]').forEach(b => b.onclick = () => { q.x = Math.max(X0 + 20, Math.min(X1 - 20, q.x + +b.dataset.nx)); q.y = Math.max(0, q.y + +b.dataset.ny); redrawSvg(); });
      $('#aedel').onclick = () => { if (E.p.length <= 2) return; E.p.splice(sel, 1); E.p.forEach(x => { if (x.grip) { if (x.grip.i === sel) delete x.grip; else if (x.grip.i > sel) x.grip.i--; } }); sel = Math.max(0, sel - 1); draw(); };
    }
    $('#aeok').onclick = () => {
      const n = E.n.trim(); if (!n) { toast('Donnez un nom à la pyramide'); $('#aen').focus(); return; }
      const por = [...new Set(E.p.filter(x => x.r === 'p').map(x => ACRO_POR_OF[x.s]).filter(Boolean))];
      if (!por.length) return toast('Il faut au moins un porteur');
      if (!E.p.some(x => x.r === 'v')) return toast('Il faut au moins un voltigeur');
      const fig = { id: src && src.custom ? src.id : 'c' + Date.now().toString(36), n, eff: E.p.length, por, h: acroLevels(E.p), p: E.p.map(x => ({ ...x, x: Math.round(x.x), y: Math.round(x.y) })), c: E.c.trim() || '—', custom: 1 };
      close(); onSave(fig);
    };
    bindDrag();
  };
  const redrawSvg = () => { const w = o.querySelector('#aed-svg'); if (!w) return; w.outerHTML = svg(); bindDrag(); };
  function bindDrag() {
    const sv = o.querySelector('#aed-svg'); if (!sv) return;
    const pt = e => { const r = (o.querySelector('#aed-svg') || sv).getBoundingClientRect(); return [(e.clientX - r.left) / r.width * SC.W, (e.clientY - r.top) / r.height * SC.H]; };
    sv.querySelectorAll('[data-pi]').forEach(gEl => gEl.onpointerdown = e => {
      e.preventDefault(); const i = +gEl.dataset.pi, q = E.p[i], s0 = pt(e), x0 = q.x, y0 = q.y; let moved = false;
      if (sel !== i) { sel = i; }
      const mv = ev => { const p = pt(ev), dx = p[0] - s0[0], dy = s0[1] - p[1]; if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
        q.x = Math.max(X0 + 20, Math.min(X1 - 20, x0 + dx)); let ny = Math.max(0, y0 + dy); if (ny < 8) ny = 0; q.y = ny;
        const w = o.querySelector('#aed-svg'); if (w) { w.outerHTML = svg(); } };
      const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); q.x = Math.round(q.x); q.y = Math.round(q.y); draw(); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    });
  }
  draw();
}

TOOL_IMPL.acrosport = function (el) {
  DB.acro = DB.acro || { groupes: {} };
  const A = liveDB(() => DB.acro);
  const F = DB.acroFiltre = Object.assign({ eff: '0', por: '', vol: '', h: '0', app: '', niv: '' }, DB.acroFiltre || {});
  A.liaisons = A.liaisons || [];
  const APP = { '': 'Tous', a: '1 à 4', b: '5 à 8', c: '9 et +' };
  const appOk = (n, k) => !k || (k === 'a' ? n <= 4 : k === 'b' ? n >= 5 && n <= 8 : n >= 9);
  let tab = 'banque', cls = DB.classes.some(c => c.name === DB.lastClass) ? DB.lastClass : (DB.classes[0] || {}).name || '', gi = 0;
  const groups = () => (A.groupes[cls] = A.groupes[cls] || []);
  const G = () => groups()[gi] || null;
  if (G()) tab = 'enchainement';

  function frame() {
    const gs = cls ? groups() : []; if (gi >= gs.length) gi = 0;
    el.innerHTML = `${DB.classes.length ? `<div class="card"><div class="row"><div data-cfg="bare"><label style="margin-top:0">Classe</label><select id="acl">${DB.classes.map(c => `<option ${c.name === cls ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div><label style="margin-top:0">Groupe</label><select id="agr">${gs.length ? gs.map((g, k) => `<option value="${k}" ${k === gi ? 'selected' : ''}>${esc(g.name)} (${g.seq.length})</option>`).join('') : '<option>— aucun groupe —</option>'}</select></div></div></div>` : ''}
      <div class="co-tabs ac-tabs" style="margin-top:12px">${[['groupes', '👥 Groupes'], ['banque', '📚 Pyramides'], ['liaisons', '🔗 Liaisons'], ['enchainement', '🎬 Enchaînement'], ['securite', '🛡️ Sécurité']].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div><div id="ab"></div>`;
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; frame(); });
    const $ = s => el.querySelector(s);
    if ($('#acl')) $('#acl').onchange = e => { cls = e.target.value; DB.lastClass = cls; gi = 0; save(); frame(); };
    if ($('#agr') && gs.length) $('#agr').onchange = e => { gi = +e.target.value; frame(); };
    ({ groupes: tabGroupes, banque: tabBanque, liaisons: tabLiaisons, enchainement: tabEnch, securite: tabSecu })[tab]($('#ab'));
  }

  /* ---------- Groupes (modifiables) ---------- */
  let selSt = null;                                   // élève sélectionné : { g: index de groupe ou -1 (non placés), n: nom }
  function tabGroupes(box) {
    if (!DB.classes.length) { box.innerHTML = noClassMsg; return; }
    const gs = groups(), placed = new Set(gs.flatMap(g => g.members)), free = studentsOf(cls).filter(n => !placed.has(n));
    const chip = (gIdx, n) => `<button class="pl-chip ${selSt && selSt.g === gIdx && selSt.n === n ? 'sel' : ''}" data-st="${gIdx}" data-n="${esc(n)}" style="padding:6px 10px;border-radius:10px;border:1.5px solid var(--line);background:${selSt && selSt.g === gIdx && selSt.n === n ? 'var(--grad)' : 'var(--card)'};color:${selSt && selSt.g === gIdx && selSt.n === n ? '#fff' : 'inherit'};font-weight:700;font-size:.85rem;cursor:pointer">${esc(n)}</button>`;
    box.innerHTML = `<details class="card" data-cfg ${gs.length ? '' : 'open'}><summary style="font-weight:800;cursor:pointer">🧩 ${gs.length ? 'Refaire les groupes automatiquement' : 'Former les groupes'}</summary><div id="acmp" style="margin-top:6px"></div></details>
      <div class="section-title"><h2>Groupes de ${esc(cls)} (${gs.length})</h2>${gs.length ? '<button class="link" data-cfg="bare" id="agdel">Supprimer tous les groupes</button>' : ''}</div>
      ${gs.length || free.length ? `<p class="muted" style="margin:-4px 0 8px;font-size:.82rem">Touchez un élève, puis un autre groupe pour l'y déplacer, ou « Non placés / absents » pour le retirer.</p>` : ''}
      <div class="teams">${gs.map((g, k) => `<div class="card team" data-cfg="bare" data-drop="${k}" style="cursor:pointer;border-top:5px solid ${k === gi ? 'var(--gold)' : 'var(--line)'}">
          <h3><span>${esc(g.name)}</span><span class="muted">${g.members.length}</span></h3>
          <div style="display:flex;flex-wrap:wrap;gap:5px">${g.members.map(n => chip(k, n)).join('') || '<span class="muted">Groupe vide</span>'}</div>
          <div class="muted" style="font-size:.78rem;margin-top:6px">${g.seq.length} élément(s) dans l'enchaînement</div>
          <div class="row" style="margin-top:8px;gap:6px"><button class="btn btn-grad" style="padding:8px" data-free data-open="${k}">🎬 Ouvrir</button><button class="btn btn-ghost" style="padding:8px;flex:0 0 42px" data-ren="${k}">✏️</button><button class="btn btn-ghost" style="padding:8px;flex:0 0 42px" data-gdel="${k}">🗑</button></div></div>`).join('')}
        <div class="card team" data-cfg="bare" data-drop="-1" style="cursor:pointer;border-top:5px dashed var(--line);background:var(--grad-soft)"><h3><span>Non placés / absents</span><span class="muted">${free.length}</span></h3>
          <div style="display:flex;flex-wrap:wrap;gap:5px">${free.map(n => chip(-1, n)).join('') || '<span class="muted">Tous les élèves sont dans un groupe.</span>'}</div></div></div>
      <button class="btn btn-ghost btn-block" data-cfg="bare" style="margin-top:12px" id="agadd">＋ Nouveau groupe</button>`;
    mountComposer(box.querySelector('#acmp'), { id: 'acg', prep: false, modes: ['random', 'hetero', 'homo'], button: '👥 Former les groupes',
      onTeams: teams => { if (gs.some(g => g.seq.length) && !confirm('Remplacer les groupes existants ? Leurs enchaînements seront supprimés.')) return;
        clearImgs(gs);
        A.groupes[cls] = teams.map(t => ({ id: newId(), name: t.name.replace('Équipe', 'Groupe'), members: t.members.map(m => m.n), seq: [] }));
        gi = 0; selSt = null; save(); toast('Groupes formés ✔'); frame(); } });
    const sel = box.querySelector('#acg-cls'); if (sel) { sel.value = cls; sel.dispatchEvent(new Event('change')); }
    const k = box.querySelector('#acg-k'), v = box.querySelector('#acg-v'); if (k && v) { k.value = 's'; v.value = 3; }
    box.querySelectorAll('[data-st]').forEach(b => b.onclick = e => { e.stopPropagation(); const g = +b.dataset.st, n = b.dataset.n;
      selSt = selSt && selSt.g === g && selSt.n === n ? null : { g, n }; tabGroupes(box); });
    box.querySelectorAll('[data-drop]').forEach(c => c.onclick = () => { if (!selSt) return; const to = +c.dataset.drop;
      if (to !== selSt.g) { if (selSt.g >= 0) { const m = gs[selSt.g].members; m.splice(m.indexOf(selSt.n), 1); } if (to >= 0) gs[to].members.push(selSt.n); save(); }
      selSt = null; frame(); });
    box.querySelectorAll('[data-open]').forEach(b => b.onclick = e => { e.stopPropagation(); gi = +b.dataset.open; tab = 'enchainement'; frame(); });
    box.querySelectorAll('[data-ren]').forEach(b => b.onclick = e => { e.stopPropagation(); const g = gs[+b.dataset.ren], n = prompt('Nom du groupe', g.name); if (n && n.trim()) { g.name = n.trim(); save(); frame(); } });
    box.querySelectorAll('[data-gdel]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.gdel, g = gs[i];
      if (!confirm(`Supprimer ${g.name} ?${g.seq.length ? '\nSon enchaînement sera supprimé.' : ''}\nSes élèves passent dans « Non placés ».`)) return;
      clearImgs([g]); gs.splice(i, 1); if (gi >= gs.length) gi = Math.max(0, gs.length - 1); selSt = null; save(); frame(); });
    box.querySelector('#agadd').onclick = () => { gs.push({ id: newId(), name: 'Groupe ' + (gs.length + 1), members: [], seq: [] }); gi = gs.length - 1; save(); frame(); };
    const d = box.querySelector('#agdel'); if (d) d.onclick = () => { if (!confirm('Supprimer tous les groupes de la classe et leurs enchaînements ?')) return; clearImgs(gs); A.groupes[cls] = []; gi = 0; selSt = null; save(); frame(); };
  }
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const clearImgs = list => list.forEach(g => g.seq.forEach(it => { if (it.img) DB[acroImgKey(it.img)] = null; if (it.vid) epsVidDel(it.vid); }));

  /* ---------- Banque de pyramides ---------- */
  const chips = (key, opts) => `<div class="tog">${opts.map(([v, l]) => `<button data-f="${key}" data-v="${v}" class="${String(F[key]) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  function tabBanque(box) {
    const list = acroAll().filter(f => (+F.eff === 0 || f.eff === +F.eff) && (!F.por || f.por.includes(F.por)) && (!F.vol || !ACRO_VOL[F.vol] || acroVol(f).includes(F.vol)) && (+F.h === 0 || f.h === +F.h) && appOk(acroAppuis(f), F.app) && (!F.niv || acroNiv(f) === F.niv));
    const g = G();
    box.innerHTML = `<button class="btn btn-grad btn-block" data-cfg="bare" id="acnew" style="margin-bottom:12px">✏️ Créer une pyramide</button><div class="card">
        <label style="margin-top:0">Effectif</label>${chips('eff', [[0, 'Tous'], [2, 'Duo'], [3, 'Trio'], [4, 'Quatuor']])}
        <label>Position des porteurs</label>${chips('por', [['', 'Toutes'], ...Object.entries(ACRO_POR)])}
        <label>Position du voltigeur</label>${chips('vol', [['', 'Toutes'], ...Object.entries(ACRO_VOL)])}
        <label>Hauteur de la pyramide</label>${chips('h', [[0, 'Toutes'], [1, '1 étage'], [2, '2 étages'], [3, '3 étages']])}
        <label>Appuis au sol</label>${chips('app', Object.entries(APP))}
        <label>Niveau de difficulté</label>${chips('niv', [['', 'Tous'], ...Object.entries(ACRO_NIV).map(([k, l]) => [k, `${k} · ${l}`])])}</div>
      <div class="section-title"><h2>${list.length} pyramide${list.length > 1 ? 's' : ''}</h2><span class="muted" style="font-size:.8rem"><b style="color:#1E5BD8">●</b> porteur · <b style="color:#C9A227">●</b> voltigeur</span></div>
      ${g ? `<p class="muted" style="margin:-4px 0 8px;font-size:.82rem">Touchez ＋ pour ajouter une pyramide à l'enchaînement de <b>${esc(g.name)}</b>.</p>` : ''}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px">${list.map(f => `<div class="card" style="padding:10px;border:1.5px solid var(--line);position:relative">
          <button data-id="${f.id}" style="all:unset;display:block;cursor:pointer;width:100%">${acroSVG(f)}<span style="position:absolute;top:8px;left:8px">${acroNivBadge(f)}</span><b style="display:block;margin-top:6px">${f.custom ? '✏️ ' : ''}${esc(f.n)}</b>
          <span class="muted" style="font-size:.75rem">${ACRO_EFF[f.eff]} · ${f.h} étage${f.h > 1 ? 's' : ''} · ${acroAppuis(f)} appuis<br>Voltigeur : ${acroVol(f).map(v => ACRO_VOL[v]).join(', ')}</span></button>
          ${g ? `<button class="btn btn-grad" data-add="${f.id}" style="position:absolute;top:6px;right:6px;padding:4px 10px">＋</button>` : ''}</div>`).join('') || '<div class="card empty" style="grid-column:1/-1">Aucune pyramide avec ces critères.</div>'}</div>`;
    box.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { F[b.dataset.f] = b.dataset.v; save(); tabBanque(box); });
    box.querySelectorAll('[data-id]').forEach(b => b.onclick = () => detail(acroFind(b.dataset.id)));
    box.querySelectorAll('[data-add]').forEach(b => b.onclick = () => addFig(b.dataset.add));
    box.querySelector('#acnew').onclick = () => acroEditor(null, saveCustom);
  }
  const saveCustom = fig => { A.custom = A.custom || []; const i = A.custom.findIndex(x => x.id === fig.id); if (i >= 0) A.custom[i] = fig; else A.custom.push(fig);
    save(); toast('Pyramide enregistrée ✔'); frame(); };
  const addFig = id => { const g = G(); if (!g) return; g.seq.push({ k: Date.now().toString(36), t: 'fig', fig: id }); save(); toast(`Ajoutée à ${g.name} (${g.seq.length}) ✔`); frame(); };
  const detail = f => {
    const o = document.createElement('div'), g = G();
    o.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(7,18,42,.72);display:grid;place-items:center;padding:16px';
    const nb = r => f.p.filter(q => q.r === r).length;
    o.innerHTML = `<div class="card" style="max-width:560px;width:100%;max-height:92vh;overflow:auto">
        <h3 style="font-size:1.25rem">${esc(f.n)}</h3>${acroSVG(f, true)}
        <div class="result" style="margin-top:10px"><div class="card"><b>${ACRO_EFF[f.eff]}</b><small>${nb('p')} porteur${nb('p') > 1 ? 's' : ''} · ${nb('v')} voltigeur${nb('v') > 1 ? 's' : ''}</small></div>
          <div class="card"><b>${f.h}</b><small>étage${f.h > 1 ? 's' : ''}</small></div><div class="card"><b>${acroAppuis(f)}</b><small>appuis au sol</small></div></div>
        <p style="margin:10px 0 4px"><b>Porteur${f.por.length > 1 ? 's' : ''} :</b> ${f.por.map(p => ACRO_POR[p]).join(', ')}</p>
        <p style="margin:4px 0"><b>Voltigeur${acroVol(f).length > 1 ? 's' : ''} :</b> ${acroVol(f).map(v => ACRO_VOL[v]).join(', ')}</p>
        <p style="margin:4px 0"><b>Consigne :</b> ${esc(f.c)}</p>
        <div id="acniv" style="margin-top:12px"></div>
        ${g ? `<button class="btn btn-grad btn-block" style="margin-top:12px" id="acadd">＋ Ajouter à l'enchaînement de ${esc(g.name)}</button>` : ''}
        <div class="row" data-cfg="bare" style="margin-top:8px">${f.custom ? '<button class="btn btn-ghost" id="aced">✏️ Modifier</button><button class="btn btn-ghost" id="acdel">🗑 Supprimer</button>' : '<button class="btn btn-ghost" id="accp">✏️ Copier et modifier</button>'}</div>
        <button class="btn btn-ghost btn-block" style="margin-top:8px" id="acx">Fermer</button></div>`;
    o.onclick = e => { const id = e.target.id; if (e.target === o || id === 'acx') o.remove(); if (id === 'acadd') { o.remove(); addFig(f.id); }
      if (id === 'aced') { o.remove(); acroEditor(f, saveCustom); }
      if (id === 'accp') { o.remove(); acroEditor({ ...JSON.parse(JSON.stringify(f)), n: f.n + ' (variante)', custom: 0 }, saveCustom); }
      if (id === 'acdel' && confirm(`Supprimer « ${f.n} » ?`)) { o.remove(); A.custom = (A.custom || []).filter(x => x.id !== f.id); save(); toast('Pyramide supprimée'); frame(); } };
    let chg = 0;
    const nivBox = () => { const sc = acroScore(f), au = acroAutoNiv(f), raw = A.niv && A.niv[f.id], man = raw && raw !== 'auto', isAuto = raw === 'auto' || (!raw && !f.nv);
      const vl = sc.vol === 2 ? 'semi' : Object.keys(ACRO_VOLPTS).find(k => ACRO_VOLPTS[k] === sc.vol);
      const how = man ? `Classé à la main${f.nv ? ` (référence : ${f.nv}` : ` (calcul auto : ${au}`})` : isAuto ? 'Calcul automatique' : 'Niveau de référence de la banque';
      o.querySelector('#acniv').innerHTML = `<div style="border:1.5px solid var(--line);border-radius:12px;padding:10px">
        <div style="display:flex;align-items:center;gap:10px">${acroNivBadge(f, true)}<div><b>Niveau ${acroNiv(f)} · ${ACRO_NIV[acroNiv(f)]}</b>
          <div class="muted" style="font-size:.78rem">${how}</div></div></div>
        <p class="muted" style="margin:8px 0 6px;font-size:.78rem">Calcul auto (${au}) : porteur le moins stable ${sc.stab} appui${sc.stab > 1 ? 's' : ''} · ${f.h} étage${f.h > 1 ? 's' : ''} · voltigeur ${vl === 'semi' ? 'semi-renversé' : ACRO_VOL[vl] || '—'}${sc.bonus ? ' · combinaison difficile' : ''}</p>
        <div class="tog">${Object.keys(ACRO_NIV).map(k => `<button data-niv="${k}" class="${man && raw === k ? 'on' : ''}">${k}</button>`).join('')}
          ${f.nv ? `<button data-niv="" class="${!raw ? 'on' : ''}">Réf. (${f.nv})</button>` : ''}<button data-niv="${f.nv ? 'auto' : ''}" class="${isAuto ? 'on' : ''}">Auto (${au})</button></div></div>`;
      o.querySelectorAll('[data-niv]').forEach(b => b.onclick = e => { e.stopPropagation(); const v = b.dataset.niv; A.niv = A.niv || {};
        if (v) A.niv[f.id] = v; else delete A.niv[f.id]; chg = 1; save();
        toast(v === 'auto' || (!v && !f.nv) ? `Niveau automatique (${au})` : v ? `Niveau ${v} enregistré ✔` : `Niveau de référence (${f.nv})`); nivBox(); }); };
    document.body.appendChild(o); nivBox();
    const obs = new MutationObserver(() => { if (!o.isConnected) { obs.disconnect(); if (chg) frame(); } }); obs.observe(document.body, { childList: true });
  };

  /* ---------- Sécurité : règle d'or, zones d'appui, rôles, prises de mains ---------- */
  function tabSecu(box) {
    const j = acroBuild({ p: [{ r: 'p', s: 'table', x: 0, y: 0 }] })[0].j, X = x => (x + 50).toFixed(1), Y = y => (62 - y).toFixed(1);
    const L = (...k) => `<polyline points="${k.map(n => X(j[n][0]) + ',' + Y(j[n][1])).join(' ')}"/>`;
    const mid = [(j.n[0] + j.p[0]) / 2, (j.n[1] + j.p[1]) / 2];
    const zones = `<svg viewBox="0 0 100 70" style="width:100%;max-width:260px;display:block;margin:6px auto">
      <line x1="0" y1="62" x2="100" y2="62" stroke="var(--line)" stroke-width="2"/>
      <g stroke="#1E5BD8" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${L('m1', 'e1', 'n', 'e2', 'm2')}${L('f1', 'k1', 'p', 'k2', 'f2')}${L('n', 'p')}<circle cx="${X(j.h[0])}" cy="${Y(j.h[1])}" r="5" fill="#1E5BD8" stroke="none"/></g>
      <circle cx="${X(j.p[0])}" cy="${Y(j.p[1] + 3)}" r="6" fill="#1E9E5A" opacity=".9"/><circle cx="${X(j.n[0])}" cy="${Y(j.n[1] + 3)}" r="6" fill="#1E9E5A" opacity=".9"/>
      <g stroke="#C62828" stroke-width="3.5" stroke-linecap="round"><line x1="${+X(mid[0]) - 5}" y1="${+Y(mid[1] + 3) - 5}" x2="${+X(mid[0]) + 5}" y2="${+Y(mid[1] + 3) + 5}"/><line x1="${+X(mid[0]) + 5}" y1="${+Y(mid[1] + 3) - 5}" x2="${+X(mid[0]) - 5}" y2="${+Y(mid[1] + 3) + 5}"/></g></svg>`;
    const PRISES = [
      ['main', 'Main dans la main', 'Paumes l\'une contre l\'autre, pouces croisés.', 'Équilibres faciles, éventails, liaisons.'],
      ['poignet', 'Poignet contre poignet', 'Chacun saisit le poignet de l\'autre : la prise la plus solide, elle ne glisse pas.', 'Montées, voltigeur suspendu ou tiré.'],
      ['chaise', 'Chaise à 4 mains', 'Chaque porteur tient son propre poignet droit et le poignet gauche de l\'autre : on forme un carré.', 'Chaise à porteurs, voltigeur assis.'],
      ['coupelle', 'Coupelle (courte échelle)', 'Doigts croisés, paumes vers le haut, bras serrés contre le corps : le voltigeur y pose un pied.', 'Montée sur les épaules ou sur un porteur debout.'],
      ['chevilles', 'Prise aux chevilles', 'Mains autour des chevilles, pouces vers le haut, bras tendus.', 'ATR, semi-renversés, brouette.'],
      ['mollets', 'Prise aux mollets / tibias', 'Mains plaquées sur les mollets, juste sous le genou, pour bloquer les jambes.', 'Voltigeur debout sur les épaules ou les cuisses.'],
      ['bassin', 'Prise au bassin', 'Mains de chaque côté du bassin, sur les os des hanches (pas sur le ventre).', 'Voltigeur debout sur les cuisses, montées.'],
      ['epaules', 'Prise aux épaules', 'Paumes sous ou sur les épaules, bras verrouillés.', 'Avions, planches portées, ATR sur les genoux.'],
      ['appuiep', 'Appui main sur épaule', 'Le voltigeur pose ses mains à plat sur les épaules du porteur, doigts vers l\'avant.', 'Montées, équilibres en appui.'],
      ['piedmain', 'Pied dans la main', 'Le porteur offre sa main à plat, bras verrouillé ; le voltigeur y pose la plante du pied.', 'Figures de niveau C / D, avec pareur.'],
    ];
    box.innerHTML = `<div class="ac-gold"><span class="ic">🛡️</span><span>Règle d'or : JAMAIS D'APPUI SUR LA COLONNE !<small>Appuis sur le bassin et les épaules · on monte et on descend sans sauter</small></span></div>
      <div class="card" style="margin-top:12px"><h3 style="margin:0">Où poser les pieds et les mains ?</h3>${zones}
        <p style="margin:4px 0;line-height:1.45"><b style="color:#1E9E5A">● Autorisé :</b> bassin, épaules, cuisses près de la hanche (porteur en chevalier ou en fente), pieds et mains du porteur.<br>
        <b style="color:#C62828">✕ Interdit :</b> milieu du dos, ventre, nuque, tête, articulations (genoux, coudes) et cuisses près du genou.</p></div>
      <div class="card" style="margin-top:12px"><h3 style="margin:0 0 6px">Les rôles</h3>
        <p style="margin:6px 0;line-height:1.45"><b style="color:#1E5BD8">Porteur :</b> dos plat et gainé, bras tendus et verrouillés, appuis larges et stables ; il ne bouge pas tant que le voltigeur n'est pas redescendu.</p>
        <p style="margin:6px 0;line-height:1.45"><b style="color:#C9A227">Voltigeur :</b> gainé de la tête aux pieds ; il monte et descend lentement, par le même chemin, sans sauter ni donner d'à-coups.</p>
        <p style="margin:6px 0;line-height:1.45"><b>Pareur :</b> tout près de la zone de chute, mains prêtes, il ne quitte pas le voltigeur des yeux ; il parle (« 1, 2, 3… hop ! ») pour synchroniser.</p></div>
      <div class="card" style="margin-top:12px"><h3 style="margin:0 0 6px">Montée, tenue, descente</h3>
        <ul style="margin:0;padding-left:18px;line-height:1.5"><li>Annoncer chaque étape à voix haute : « Prêt ? Je monte… Je descends. »</li><li>Tenir la figure <b>3 secondes</b>, immobile.</li><li>Descendre <b>sans sauter</b>, en contrôlant, à l'inverse de la montée.</li><li>Une douleur, un déséquilibre : on dit « stop » et on redescend tout de suite.</li><li>Tapis sous les figures à 2 étages et plus ; pareur obligatoire pour les niveaux C et D.</li></ul></div>
      <div class="section-title"><h2>✋ Les prises de mains</h2><span class="muted" style="font-size:.8rem"><b style="color:#1E5BD8">●</b> porteur · <b style="color:#C9A227">●</b> voltigeur</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px">${PRISES.map(([i, n, d, u], k) => `<div class="card" style="padding:12px"><b>${k + 1}. ${n}</b>${acroGripSVG(i)}
        <p style="margin:6px 0 4px;font-size:.88rem;line-height:1.4">${d}</p><p class="muted" style="margin:0;font-size:.78rem">Pour : ${u}</p></div>`).join('')}</div>`;
  }

  /* ---------- Liaisons dynamiques (vidéos) ---------- */
  let liEdit = null;                                   // id de la liaison modifiée, 'new' pour une nouvelle
  function tabLiaisons(box) {
    const L = A.liaisons, g = G(), ed = liEdit === 'new' ? { n: '', url: '', d: '' } : L.find(x => x.id === liEdit);
    box.innerHTML = `<div class="card doc"><p style="margin:0;line-height:1.45">Les <b>liaisons dynamiques</b> relient deux figures de l'enchaînement (roulade, saut, rotation, déplacement…). Chaque liaison a son lien de démonstration : vidéo ou diaporama (PowerPoint, Google Slides, PDF).</p></div>
      ${ed ? `<div class="card" data-cfg style="margin-top:12px"><h3>${liEdit === 'new' ? 'Nouvelle liaison' : 'Modifier la liaison'}</h3>
        <label>Nom</label><input id="lin" value="${esc(ed.n)}" placeholder="Ex. : roulade avant">
        <label>Lien (vidéo ou diaporama)</label><input id="liu" value="${esc(ed.url)}" placeholder="https://… (YouTube, vidéo, PowerPoint, Google Slides, PDF…)" inputmode="url" autocapitalize="off">
        <label>Description / critères de réussite</label><textarea id="lid" style="min-height:70px">${esc(ed.d || '')}</textarea>
        <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="lis">💾 Enregistrer</button><button class="btn btn-ghost" id="lic">Annuler</button></div></div>`
      : '<button class="btn btn-grad btn-block" data-cfg="bare" style="margin-top:12px" id="linew">＋ Ajouter une liaison dynamique</button>'}
      <div class="section-title"><h2>${L.length} liaison${L.length > 1 ? 's' : ''}</h2></div>
      ${L.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">${L.map(x => `<div class="card" style="padding:12px">
          <b style="font-size:1.05rem">🔗 ${esc(x.n)}</b>${x.d ? `<div class="muted" style="font-size:.85rem;margin-top:4px">${esc(x.d)}</div>` : ''}
          <div class="row" style="margin-top:10px;gap:6px">${x.url ? `<button class="btn btn-grad" data-lv="${x.id}">${acroBtn(x.url)}</button>` : '<span class="muted" style="font-size:.8rem">Pas de lien</span>'}${g ? `<button class="btn btn-ghost" data-la="${x.id}">＋ ${esc(g.name)}</button>` : ''}</div>
          <div class="row" data-cfg="bare" style="margin-top:6px;gap:6px"><button class="btn btn-ghost" style="padding:6px" data-le="${x.id}">✏️ Modifier</button><button class="btn btn-ghost" style="padding:6px" data-lx="${x.id}">🗑</button></div></div>`).join('')}</div>`
      : '<div class="card empty">Aucune liaison pour l\'instant. Ajoutez-en avec leur lien (vidéo ou diaporama).</div>'}`;
    const $ = q => box.querySelector(q);
    if ($('#linew')) $('#linew').onclick = () => { liEdit = 'new'; tabLiaisons(box); };
    if ($('#lic')) $('#lic').onclick = () => { liEdit = null; tabLiaisons(box); };
    if ($('#lis')) $('#lis').onclick = () => { const n = $('#lin').value.trim(), url = $('#liu').value.trim(), d = $('#lid').value.trim(); if (!n) return toast('Indiquez le nom de la liaison');
      if (url && !/^https?:\/\//i.test(url)) return toast('Le lien doit commencer par https://');
      if (liEdit === 'new') L.push({ id: newId(), n, url, d }); else Object.assign(L.find(x => x.id === liEdit), { n, url, d });
      liEdit = null; save(); toast('Liaison enregistrée ✔'); tabLiaisons(box); };
    box.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => acroVideo(L.find(x => x.id === b.dataset.lv)));
    box.querySelectorAll('[data-le]').forEach(b => b.onclick = () => { liEdit = b.dataset.le; tabLiaisons(box); window.scrollTo(0, 0); });
    box.querySelectorAll('[data-lx]').forEach(b => b.onclick = () => { if (!confirm('Supprimer cette liaison ?')) return; A.liaisons = A.liaisons.filter(x => x.id !== b.dataset.lx); save(); tabLiaisons(box); });
    box.querySelectorAll('[data-la]').forEach(b => b.onclick = () => { const g2 = G(); if (!g2) return; g2.seq.push({ k: Date.now().toString(36), t: 'liaison', lid: b.dataset.la }); save(); toast(`Liaison ajoutée à ${g2.name} (${g2.seq.length}) ✔`); });
  }

  /* ---------- Enchaînement du groupe ---------- */
  let reqOpen = false;
  function tabEnch(box) {
    if (!DB.classes.length) { box.innerHTML = noClassMsg; return; }
    const g = G();
    if (!g) { box.innerHTML = `<div class="card empty">Formez d'abord les groupes de la classe.<br><br><button class="btn btn-grad" id="ago">👥 Former les groupes</button></div>`; box.querySelector('#ago').onclick = () => { tab = 'groupes'; frame(); }; return; }
    const R = A.req = Object.assign({ nb: 5, max: 'D', duo: 0, trio: 0, quat: 0, ren: 0 }, A.req || {});
    const figs = g.seq.filter(it => it.t === 'fig').map(it => acroFind(it.fig)).filter(Boolean), NV = 'ABCD';
    const cE = n => figs.filter(f => f.eff === n).length, cR = figs.filter(f => acroVol(f).includes('renverse')).length, trop = figs.filter(f => NV.indexOf(acroNiv(f)) > NV.indexOf(R.max));
    const W = [];
    if (figs.length < R.nb) W.push(`${figs.length} pyramide${figs.length > 1 ? 's' : ''} sur ${R.nb} demandées`);
    if (trop.length) W.push(`${trop.length} pyramide${trop.length > 1 ? 's' : ''} au-dessus du niveau ${R.max} : ${trop.map(f => f.n).join(', ')}`);
    [['duo', 2, 'duo'], ['trio', 3, 'trio'], ['quat', 4, 'quatuor']].forEach(([k, n, l]) => { if (cE(n) < R[k]) W.push(`${cE(n)} ${l}${cE(n) > 1 ? 's' : ''} sur ${R[k]} demandé${R[k] > 1 ? 's' : ''}`); });
    if (cR < R.ren) W.push(`${cR} pyramide${cR > 1 ? 's' : ''} avec voltigeur renversé sur ${R.ren} obligatoire${R.ren > 1 ? 's' : ''}`);
    const num = (id, v, min, max) => `<input id="${id}" type="number" min="${min}" max="${max}" value="${v}">`;
    const L = g.seq.filter(it => it.t !== 'liaison').map(it => it.m), av = epsMAvg(L), nm = L.filter(x => x != null).length;
    box.innerHTML = `<div class="card"><b>${esc(g.name)}</b><div class="muted">${g.members.map(esc).join(', ')}</div></div>
      <div class="card" style="margin-top:12px">
        <div class="result" style="margin-top:0"><div class="card"><b>${figs.length}</b><small>pyramide${figs.length > 1 ? 's' : ''} / ${R.nb}</small></div><div class="card"><b>${cE(2)} · ${cE(3)} · ${cE(4)}</b><small>duo · trio · quatuor</small></div><div class="card"><b>${cR}</b><small>renversé${cR > 1 ? 's' : ''}</small></div></div>
        ${W.length ? `<div class="gy-warn" style="margin-top:10px;padding:8px 10px;border-radius:10px;background:rgba(224,137,47,.12);color:#9A5A12;font-weight:700;font-size:.85rem">⚠️ ${W.map(esc).join('<br>⚠️ ')}</div>` : figs.length ? '<div style="margin-top:10px;font-weight:800;color:var(--ok)">✓ Exigences respectées</div>' : ''}
        <details id="areq" data-cfg="bare" style="margin-top:10px" ${reqOpen ? 'open' : ''}><summary class="muted" style="cursor:pointer;font-weight:800">⚙️ Exigences de l'enchaînement</summary>
          <div class="row"><div><label>Nombre de pyramides</label>${num('arnb', R.nb, 1, 20)}</div><div><label>Niveau maximal</label><select id="armx">${[...NV].map(l => `<option ${R.max === l ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
          <div class="row"><div><label>Duos minimum</label>${num('ardu', R.duo, 0, 10)}</div><div><label>Trios minimum</label>${num('artr', R.trio, 0, 10)}</div><div><label>Quatuors minimum</label>${num('arqu', R.quat, 0, 10)}</div></div>
          <div class="row"><div><label>Voltigeurs renversés obligatoires</label>${num('arre', R.ren, 0, 10)}</div></div></details></div>
      ${nm ? `<div class="card" style="margin-top:12px"><b>✅ Validation par l'enseignant</b> <span class="muted" style="font-size:.8rem">· ${nm} / ${L.length} figure(s)</span>
        <div style="display:flex;justify-content:center;margin-top:6px">${typeof epsMPie === 'function' ? epsMPie(L, 'Répartition') : ''}</div>
        ${av != null ? `<div style="margin-top:8px">Bilan : <b style="color:${EPS_M[av][1]}">${EPS_M[av][0]}</b></div>` : ''}<button class="link" data-cfg="bare" id="amclr" style="margin-top:6px">Effacer la validation</button></div>` : ''}
      <div class="row" style="margin-top:12px"><button class="btn btn-ghost" id="afig">📚 Ajouter une pyramide</button><button class="btn btn-ghost" id="alia">🔗 Ajouter une liaison</button>
        <label class="btn btn-ghost" style="display:block;text-align:center;cursor:pointer;margin:0">📷 Ajouter une photo<input id="aph" type="file" accept="image/*" capture="environment" style="display:none"></label>
        <label class="btn btn-ghost" style="display:block;text-align:center;cursor:pointer;margin:0">🎬 Ajouter une vidéo<input id="avd" type="file" accept="video/*" capture="environment" style="display:none"></label></div>
      ${g.seq.length ? `<button class="btn btn-grad btn-block" style="margin-top:10px" id="aplay">▶ Présenter l'enchaînement</button>` : ''}
      <div class="section-title"><h2>Enchaînement (${g.seq.length})</h2>${g.seq.length ? '<button class="link" data-cfg="bare" id="aclr">🗑 Vider l\'enchaînement</button>' : ''}</div>
      ${g.seq.length ? `<div style="display:flex;flex-direction:column;gap:10px">${g.seq.map((it, k) => { const f = it.t === 'fig' ? acroFind(it.fig) : null, img = it.img ? DB[acroImgKey(it.img)] : null, li = it.t === 'liaison' ? A.liaisons.find(x => x.id === it.lid) : null;
        if (it.t === 'liaison') return `<div class="card" style="padding:10px;display:flex;gap:10px;align-items:center;border-left:5px solid var(--gold)">
          <div style="flex:0 0 30px;height:30px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;font-weight:900">${k + 1}</div>
          <div style="flex:1;min-width:0"><b>🔗 ${li ? esc(li.n) : 'Liaison supprimée'}</b><div class="muted" style="font-size:.78rem">Liaison dynamique</div></div>
          ${li && li.url ? `<button class="btn btn-ghost" style="flex:0 0 auto;padding:6px 10px" data-vl="${esc(li.id)}">${acroBtn(li.url)}</button>` : ''}
          <div style="flex:0 0 auto;display:flex;gap:4px"><button class="btn btn-ghost" style="padding:5px 8px" data-up="${k}" ${k ? '' : 'disabled'}>↑</button><button class="btn btn-ghost" style="padding:5px 8px" data-dn="${k}" ${k < g.seq.length - 1 ? '' : 'disabled'}>↓</button><button class="btn btn-ghost" style="padding:5px 8px" data-rm="${k}">✕</button></div></div>`;
        return `<div class="card" style="padding:10px;display:flex;gap:10px;align-items:center">
          <div style="flex:0 0 30px;height:30px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;font-weight:900">${k + 1}</div>
          <div style="flex:1;min-width:0;display:flex;gap:8px;align-items:center">
            ${f ? `<div style="flex:1;min-width:0">${acroSVG(f)}</div>` : ''}
            ${img ? `<img src="${img}" data-z="${k}" style="flex:1;min-width:0;max-height:120px;object-fit:contain;border-radius:10px;background:#000;cursor:zoom-in">` : ''}${epsVidSlot(it)}</div>
          <div style="flex:0 0 auto;display:flex;flex-direction:column;gap:4px;align-items:stretch">
            <div class="muted" style="font-size:.75rem;font-weight:800;max-width:110px">${f ? `${acroNivBadge(f)} ${esc(f.n)}` : it.vid && !img ? 'Vidéo' : 'Photo'} ${epsMTag(it.m)}</div>
            ${f || img ? `<label class="btn btn-ghost" style="padding:5px 8px;font-size:.75rem;cursor:pointer;margin:0;text-align:center">📷 ${img ? 'Changer' : 'Photo'}<input data-ph="${k}" type="file" accept="image/*" capture="environment" style="display:none"></label>` : ''}
            <label class="btn btn-ghost" style="padding:5px 8px;font-size:.75rem;cursor:pointer;margin:0;text-align:center">🎬 ${it.vid ? 'Changer' : 'Vidéo'}<input data-vd="${k}" type="file" accept="video/*" capture="environment" style="display:none"></label>
            <div style="display:flex;gap:4px"><button class="btn btn-ghost" style="padding:5px 8px" data-up="${k}" ${k ? '' : 'disabled'}>↑</button><button class="btn btn-ghost" style="padding:5px 8px" data-dn="${k}" ${k < g.seq.length - 1 ? '' : 'disabled'}>↓</button><button class="btn btn-ghost" style="padding:5px 8px" data-rm="${k}">✕</button></div></div></div>`; }).join('')}</div>`
        : '<div class="card empty">L\'enchaînement est vide : ajoutez des pyramides de la banque ou des photos des figures du groupe.</div>'}`;
    const $ = s => box.querySelector(s);
    $('#afig').onclick = () => { tab = 'banque'; frame(); };
    if ($('#alia')) $('#alia').onclick = () => { tab = 'liaisons'; frame(); };
    box.querySelectorAll('[data-vl]').forEach(b => b.onclick = () => acroVideo(A.liaisons.find(x => x.id === b.dataset.vl)));
    const setImg = async (file, it) => { try { const d = await acroPhoto(file); const id = it.img || Date.now().toString(36) + Math.random().toString(36).slice(2, 5); DB[acroImgKey(id)] = d; it.img = id; save(); tabEnch(box); } catch (e) { toast(e.message); } };
    $('#aph').onchange = e => { const f = e.target.files[0]; if (!f) return; const it = { k: Date.now().toString(36), t: 'photo' }; g.seq.push(it); setImg(f, it); };
    box.querySelectorAll('[data-ph]').forEach(i => i.onchange = e => { const f = e.target.files[0]; if (f) setImg(f, g.seq[+i.dataset.ph]); });
    box.querySelectorAll('[data-z]').forEach(i => i.onclick = () => acroZoom(i.src));
    $('#avd').onchange = e => { const f = e.target.files[0]; if (!f) return; const it = { k: Date.now().toString(36), t: 'photo' }; epsVidSet(f, it, () => { g.seq.push(it); save(); tabEnch(box); }); };
    box.querySelectorAll('[data-vd]').forEach(i => i.onchange = e => { const f = e.target.files[0]; if (f) epsVidSet(f, g.seq[+i.dataset.vd], () => tabEnch(box)); });
    epsVidHydrate(box);
    const mv = (k, d) => { const [x] = g.seq.splice(k, 1); g.seq.splice(k + d, 0, x); save(); tabEnch(box); };
    box.querySelectorAll('[data-up]').forEach(b => b.onclick = () => mv(+b.dataset.up, -1));
    box.querySelectorAll('[data-dn]').forEach(b => b.onclick = () => mv(+b.dataset.dn, 1));
    box.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { if (!confirm('Retirer cet élément de l\'enchaînement ?')) return; const [x] = g.seq.splice(+b.dataset.rm, 1); if (x.img) DB[acroImgKey(x.img)] = null; if (x.vid) epsVidDel(x.vid); save(); frame(); });
    if ($('#aplay')) $('#aplay').onclick = () => present(g);
    const setR = (k, v) => { R[k] = v; reqOpen = true; save(); tabEnch(box); };
    $('#areq').ontoggle = e => { reqOpen = e.target.open; };
    $('#arnb').onchange = e => setR('nb', Math.max(1, Math.min(20, +e.target.value || 1))); $('#armx').onchange = e => setR('max', e.target.value);
    [['ardu', 'duo'], ['artr', 'trio'], ['arqu', 'quat'], ['arre', 'ren']].forEach(([id, k]) => { $('#' + id).onchange = e => setR(k, Math.max(0, Math.min(10, +e.target.value || 0))); });
    if ($('#amclr')) $('#amclr').onclick = () => { if (!confirm('Effacer la validation de toutes les figures ?')) return; g.seq.forEach(it => delete it.m); save(); tabEnch(box); };
    if ($('#aclr')) $('#aclr').onclick = () => { if (!confirm(`Vider l'enchaînement de ${g.name} ?`)) return; clearImgs([g]); g.seq = []; save(); frame(); };
  }
  function present(g) {
    let k = 0; const o = document.createElement('div');
    o.style.cssText = 'position:fixed;inset:0;z-index:310;background:var(--bg,#fff);display:flex;flex-direction:column;padding:16px;overflow:auto';
    const show = () => { const it = g.seq[k], f = it.t === 'fig' ? acroFind(it.fig) : null, img = it.img ? DB[acroImgKey(it.img)] : null, li = it.t === 'liaison' ? A.liaisons.find(x => x.id === it.lid) : null;
      o.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><b>${esc(g.name)} · ${k + 1} / ${g.seq.length}</b><button class="btn btn-ghost" id="pq">✕ Fermer</button></div>
        <h3 style="text-align:center;margin:10px 0">${f ? esc(f.n) : li ? '🔗 ' + esc(li.n) : 'Figure ' + (k + 1)}</h3>
        ${li ? `<div style="text-align:center">${li.d ? `<p class="muted">${esc(li.d)}</p>` : ''}${li.url ? `<button class="btn btn-grad" id="pv">${acroBtn(li.url, true)}</button>` : ''}</div>` : ''}
        <div style="flex:1;display:flex;gap:12px;align-items:center;justify-content:center;min-height:0;flex-wrap:wrap">${f ? `<div style="flex:1 1 280px;max-width:520px">${acroSVG(f, true)}</div>` : ''}${img ? `<img src="${img}" style="flex:1 1 280px;max-width:520px;max-height:70vh;object-fit:contain;border-radius:12px">` : ''}${epsVidSlot(it, true)}</div>
        ${!li ? `<div style="margin-top:12px" data-cfg="bare"><div class="muted" style="font-size:.78rem;font-weight:800;margin-bottom:4px">✅ Validation de l'enseignant</div>${epsMBar(it.m, 'data-pm')}</div>` : ''}
        <div class="row" style="margin-top:12px"><button class="btn btn-ghost" id="pp" ${k ? '' : 'disabled'}>← Précédente</button><button class="btn btn-grad" id="pn" ${k < g.seq.length - 1 ? '' : 'disabled'}>Suivante →</button></div>`;
      o.querySelector('#pq').onclick = () => { o.remove(); frame(); };
      o.querySelectorAll('[data-pm]').forEach(b => b.onclick = () => { const v = +b.dataset.pm; if (it.m === v) delete it.m; else it.m = v; save(); if (it.m != null && k < g.seq.length - 1) setTimeout(() => { k++; show(); }, 250); else show(); });
      if (o.querySelector('#pv')) o.querySelector('#pv').onclick = () => acroVideo(li);
      epsVidHydrate(o);
      o.querySelector('#pp').onclick = () => { k--; show(); }; o.querySelector('#pn').onclick = () => { k++; show(); }; };
    show(); document.body.appendChild(o);
  }

  frame();
};
