/* =========================================================
   EPS ONE — Outil « Cross du collège »
   Courses (distance ou temps) · inscriptions F/G par classe ·
   dossards QR imprimables · scan à l'arrivée (caméra ou pavé) ·
   classements par course, par niveau et des classes.
   Données : DB.cross.events[] (synchronisées entre tablettes ;
   les passages sont une liste d'objets à id → fusion multi-tablettes)
   ========================================================= */
DB.cross = DB.cross || { events: [] };
ICONS.cross = ICONS['cat-cross'] = '<circle cx="7.5" cy="4.5" r="2"/><path d="M6.5 8 4 12.5l3 1.5-1.5 6M6.5 8l4 2.5 2.5-1M9 13.5l3 2.5-.5 4.5"/><path d="M16 21V3.5"/><path d="M16 4h5.5v5.5H16"/><path d="M16 4h2.75v2.75H16zM18.75 6.75h2.75v2.75h-2.75z" fill="url(#icoGrad)" stroke="none"/>';
if (!document.getElementById('cx-css')) document.head.insertAdjacentHTML('beforeend', `<style id="cx-css">
.cx-bar{display:flex;gap:8px;align-items:center}
.cx-bar select{flex:1;min-width:0}
.cx-bar .btn{flex:0 0 auto;padding:10px 12px}
.cx-tabs{display:flex;gap:6px;overflow-x:auto;margin:12px 0;scrollbar-width:none}
.cx-tabs::-webkit-scrollbar{display:none}
.cx-tabs button{flex:1 0 auto;padding:10px 12px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.85rem;white-space:nowrap}
.cx-tabs button.on{background:var(--grad);color:#fff;border-color:transparent}
.cx-course{margin-top:10px;border-left:6px solid var(--cc)}
.cx-course .hd{display:flex;gap:6px;align-items:center}
.cx-course .hd input{font-weight:800}
.cx-course .hd .btn{flex:0 0 auto;padding:8px 10px}
.cx-dot{width:14px;height:14px;border-radius:50%;background:var(--cc);flex:0 0 auto;display:inline-block}
.cx-chk{display:flex;gap:8px;align-items:center;margin-top:10px;font-weight:700;font-size:.88rem}
.cx-chk input{width:auto}
.cx-cls{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.cx-cls button{padding:9px 13px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.88rem}
.cx-cls button.on{background:var(--grad);color:#fff;border-color:transparent}
.cx-cls button small{font-weight:600;opacity:.8;margin-left:4px}
.cx-st{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 2px;border-bottom:1px solid var(--line)}
.cx-st:last-child{border-bottom:none}
.cx-st .ck{width:26px;height:26px;flex:0 0 26px;accent-color:var(--navy,#0B2A5B)}
.cx-st.sel{background:var(--grad-soft);border-radius:10px}
.cx-mbar{position:sticky;top:0;z-index:3;background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:10px;margin:10px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center;box-shadow:var(--shadow)}
.cx-mbar select{width:auto;flex:1 1 170px;padding:9px 8px}
.cx-st .nm{flex:1 1 150px;font-weight:700;min-width:0}
.cx-st .nm small{display:block;color:var(--muted);font-weight:600;font-size:.74rem}
.cx-st.off .nm b{text-decoration:line-through;opacity:.55}
.cx-fg{display:flex;gap:6px;flex:0 0 auto}
.cx-fg button{width:52px;height:46px;border-radius:12px;border:2px solid var(--line);font-weight:900;font-size:1.15rem;background:var(--card)}
.cx-fg button.onF{background:#C9A227;color:#fff;border-color:transparent}
.cx-fg button.onG{background:#1E5BD8;color:#fff;border-color:transparent}
.cx-st select{width:auto;flex:1 1 130px;max-width:210px;padding:9px 8px;font-size:.85rem}
.cx-bib{font-weight:900;font-variant-numeric:tabular-nums;min-width:44px;text-align:right;color:var(--muted)}
.cx-bibin{width:84px!important;flex:0 0 84px!important;text-align:center;font-weight:900;padding:8px}
.cx-scan{display:grid;gap:12px}
@media(min-width:760px){.cx-scan{grid-template-columns:1.15fr 1fr;align-items:start}}
.cx-cam{position:relative;background:#000;border-radius:16px;overflow:hidden;aspect-ratio:4/3}
.cx-cam video{width:100%;height:100%;object-fit:cover;display:block}
.cx-guide{position:absolute;left:22.5%;top:22.5%;width:55%;height:55%;border:3px solid rgba(255,255,255,.85);border-radius:14px;box-shadow:0 0 0 999px rgba(0,0,0,.28);pointer-events:none}
.cx-cmsg{position:absolute;inset:0;display:grid;place-items:center;color:#fff;text-align:center;padding:18px;font-weight:700;background:#0B1A38;line-height:1.4}
.cx-disp{font-size:2.6rem;font-weight:900;text-align:center;font-variant-numeric:tabular-nums;padding:6px;border-radius:14px;background:var(--grad-soft);margin-bottom:10px;min-height:1.5em}
.cx-keys{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cx-keys button{padding:14px 0;font-size:1.55rem;font-weight:800;border-radius:14px;border:1.5px solid var(--line);background:var(--card)}
.cx-keys button:active{background:var(--grad-soft)}
.cx-keys .ok{background:var(--grad);color:#fff;border-color:transparent}
.cx-start{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)}
.cx-start:last-child{border-bottom:none}
.cx-start .nm{flex:1;min-width:0;font-weight:800;line-height:1.2}
.cx-start .nm small{display:block;color:var(--muted);font-weight:600;font-size:.74rem}
.cx-start .clk{font-variant-numeric:tabular-nums;font-weight:900;font-size:1.25rem}
.cx-stop{background:var(--grad-soft);border:1.5px solid var(--line);color:var(--text);padding:9px 11px;border-radius:12px;font-weight:800;flex:0 0 auto}
.cx-go{background:var(--danger);color:#fff;padding:12px 14px;border-radius:14px;font-weight:900;flex:0 0 auto}
.cx-gsel{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.cx-gsel button{padding:9px 12px;border-radius:12px;border:2px solid var(--line);background:var(--grad-soft);font-weight:800;font-size:.82rem}
.cx-gsel button.on{background:var(--danger);color:#fff;border-color:transparent}
.cx-last{display:flex;align-items:center;gap:10px;padding:8px 2px;border-bottom:1px solid var(--line);font-size:.9rem}
.cx-last .b{font-weight:900;min-width:48px;font-variant-numeric:tabular-nums;font-size:1.1rem}
.cx-last .nm{flex:1;min-width:0}
.cx-last .nm small{display:block;color:var(--muted);font-size:.74rem}
.cx-last .t{font-weight:800;font-variant-numeric:tabular-nums;text-align:right}
.cx-flash{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:80;width:min(420px,92vw);border-radius:26px;padding:18px 20px;text-align:center;color:#fff;box-shadow:0 22px 70px rgba(0,0,0,.45);animation:cxpop .18s ease}
@keyframes cxpop{from{transform:translate(-50%,-50%) scale(.85);opacity:0}to{transform:translate(-50%,-50%) scale(1);opacity:1}}
.cx-flash.ok{background:#1B9E5A}.cx-flash.warn{background:#D9822B}.cx-flash.bad{background:#D64545}
.cx-flash .n{font-size:4.2rem;font-weight:900;line-height:1;font-variant-numeric:tabular-nums}
.cx-flash .who{font-size:1.35rem;font-weight:900;margin-top:6px}
.cx-flash .inf{font-size:1rem;font-weight:700;opacity:.95;margin-top:4px}
.cx-flash .rk{font-size:2rem;font-weight:900;margin-top:6px}
.cx-pv{position:fixed;inset:0;z-index:90;background:var(--bg);display:flex;flex-direction:column}
.cx-pv header{background:var(--grad);color:#fff;padding:calc(10px + env(safe-area-inset-top)) 12px 12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.cx-pv header b{flex:1;min-width:120px}
.cx-pv header .btn{padding:9px 12px;font-size:.85rem}
.cx-pv iframe{flex:1;border:0;width:100%;background:#777}
.cx-prof{margin-top:14px}
.cx-prof>summary{font-weight:800;cursor:pointer}
.cx-rk td,.cx-rk th{white-space:nowrap}
.cx-rk td.nmc{white-space:normal}
.cx-warn{background:rgba(214,69,69,.1);border:1px solid rgba(214,69,69,.35);color:var(--danger);border-radius:12px;padding:8px 10px;font-weight:700;font-size:.85rem;margin-top:10px}
</style>`);

(() => {
  const X = () => { if (!DB.cross || typeof DB.cross !== 'object') DB.cross = { events: [] }; if (!Array.isArray(DB.cross.events)) DB.cross.events = []; return DB.cross; };
  const uid = n => { let s = ''; while (s.length < n) s += Math.random().toString(36).slice(2); return s.slice(0, n); };
  let DEV = ''; try { DEV = localStorage.getItem('epsone_dev') || ''; } catch (e) {}
  if (!DEV) { DEV = uid(8); try { localStorage.setItem('epsone_dev', DEV); } catch (e) {} }
  const getCur = () => { try { return localStorage.getItem('epsone_cross_cur') || ''; } catch (e) { return ''; } };
  const setCur = id => { try { localStorage.setItem('epsone_cross_cur', id); } catch (e) {} };
  const commit = () => { save(); window.syncFlush && window.syncFlush(); };
  const LV = ['6', '5', '4', '3'], LVN = { 6: '6e', 5: '5e', 4: '4e', 3: '3e' };
  const SXN = { F: 'Filles', G: 'Garçons', X: 'Mixte' };
  const COLORS = ['#C9A227', '#1E5BD8', '#C0392B', '#0B5FA5', '#1B9E5A', '#7A4FD6', '#E07A1F', '#0FA3B1', '#5B6782', '#8A6D1F'];
  const MAXC = 10, MAXCL = 24, MAXST = 35;
  const tm = ms => ms == null ? '–' : fmt(ms, false);
  const hms = t => t ? new Date(t).toLocaleTimeString('fr-FR') : '';
  const km = v => v ? v.toFixed(1).replace('.', ',') : '–';
  const col = (E, c) => COLORS[E.courses.indexOf(c) % COLORS.length] || COLORS[0];

  const defCourses = () => [
    { name: '6e-5e filles', lv: ['6', '5'], sx: 'F', dist: 1500 },
    { name: '6e-5e garçons', lv: ['6', '5'], sx: 'G', dist: 2000 },
    { name: '4e-3e filles', lv: ['4', '3'], sx: 'F', dist: 2000 },
    { name: '4e-3e garçons', lv: ['4', '3'], sx: 'G', dist: 2500 },
    { name: 'Course adaptée', lv: [...LV], sx: 'X', dist: 1000, main: false },
    { name: 'Course loisir', lv: [...LV], sx: 'X', mode: 'temps', dur: 12, lap: 500, main: false }
  ].map(c => ({ id: uid(5), mode: 'distance', dist: 2000, dur: 12, lap: 500, main: true, start: null, ...c }));
  const newEvent = name => ({ id: uid(4), name: name || 'Cross ' + new Date().getFullYear(), date: new Date().toISOString().slice(0, 10), created: Date.now(),
    courses: defCourses(), classes: [], lv: {}, el: {}, arr: [], bibMode: 'classe', topN: 10 });
  const norm = E => { E.courses = E.courses || []; E.classes = E.classes || []; E.lv = E.lv || {}; E.el = E.el || {}; E.arr = E.arr || []; E.topN = E.topN || 10; E.bibMode = E.bibMode || 'classe'; return E; };

  /* ---------- Élèves, niveaux, courses ---------- */
  const lvOf = (E, c) => { const v = E.lv[c]; if (v === '-') return ''; if (LV.includes(v)) return v; const d = (/\d/.exec(c) || [])[0]; return LV.includes(d) ? d : ''; };
  const key = (c, n) => c + '|' + n;
  const sortCls = (E, L) => [...L].sort((a, b) => LV.indexOf(lvOf(E, a)) - LV.indexOf(lvOf(E, b)) || a.localeCompare(b, 'fr', { numeric: true }));
  const stuOf = (E, c) => studentsOf(c).slice(0, MAXST).map(n => { const k = key(c, n); return { k, cls: c, name: n, lv: lvOf(E, c), ...(E.el[k] || {}) }; });
  const stu = E => sortCls(E, E.classes).flatMap(c => stuOf(E, c));
  const autoCourse = (E, s) => E.courses.find(c => c.main !== false && (c.lv || []).includes(s.lv) && (c.sx === 'X' || c.sx === s.sx)) || null;
  const courseOf = (E, s) => s.st ? null : (s.c && E.courses.find(c => c.id === s.c)) || autoCourse(E, s);
  const setEl = (E, k, patch) => { const o = { ...(E.el[k] || {}), ...patch }; Object.keys(o).forEach(f => { if (o[f] === '' || o[f] == null) delete o[f]; });
    if (Object.keys(o).length) E.el[k] = o; else delete E.el[k]; };

  /* ---------- Classements ---------- */
  function compute(E) {
    const S = stu(E), byBib = new Map(), arrBy = new Map();
    S.forEach(s => { if (s.b) byBib.set(+s.b, s); });
    [...E.arr].sort((a, b) => a.t - b.t).forEach(a => { if (!arrBy.has(+a.b)) arrBy.set(+a.b, []); arrBy.get(+a.b).push(a.t); });
    const cOf = new Map(S.map(s => [s.k, courseOf(E, s)]));
    const courses = E.courses.map(c => {
      const P = S.filter(s => cOf.get(s.k) === c), temps = c.mode === 'temps';
      const rows = P.map(s => {
        const T = (arrBy.get(+s.b) || []).filter(t => c.start && t >= c.start);
        if (temps) { const L = T.filter(t => t <= c.start + c.dur * 60000); return { s, c, laps: L.length, last: L.length ? L[L.length - 1] - c.start : null, dist: L.length * (c.lap || 0), ok: L.length > 0 }; }
        return { s, c, time: T.length ? T[0] - c.start : null, dist: c.dist, ok: T.length > 0 };
      });
      const R = rows.filter(r => r.ok).sort(temps ? (a, b) => b.laps - a.laps || a.last - b.last : (a, b) => a.time - b.time);
      R.forEach((r, i) => { r.place = i + 1; const t = temps ? r.last : r.time; r.speed = t && r.dist ? r.dist / (t / 1000) * 3.6 : 0;
        r.gap = i === 0 ? '' : temps ? (R[0].laps - r.laps ? `−${R[0].laps - r.laps} tour${R[0].laps - r.laps > 1 ? 's' : ''}` : '+' + tm(r.last - R[0].last)) : '+' + tm(r.time - R[0].time); });
      return { c, R, W: rows.filter(r => !r.ok), n: P.length };
    });
    return { S, courses, byBib, arrBy, cOf };
  }
  const perf = r => r.c.mode === 'temps' ? `${r.laps} tour${r.laps > 1 ? 's' : ''} · ${r.dist} m` : tm(r.time);
  function levelRank(E, K, L, sx) {
    return K.courses.filter(x => x.c.main !== false).flatMap(x => x.R).filter(r => r.s.lv === L && (!sx || r.s.sx === sx)).sort((a, b) => b.speed - a.speed);
  }
  /* Classement des classes : points = place dans sa course ; score = moyenne des X meilleures places
     (places manquantes = dernière place du niveau + 1) ; plus petit score = meilleure classe */
  function classRank(E, K, L) {
    const X = Math.max(1, +E.topN || 10), main = K.courses.filter(x => x.c.main !== false && (x.c.lv || []).includes(L));
    const pen = Math.max(0, ...main.map(x => x.R.length)) + 1;
    return E.classes.filter(c => lvOf(E, c) === L).map(cls => {
      const pts = main.flatMap(x => x.R.filter(r => r.s.cls === cls).map(r => r.place)).sort((a, b) => a - b);
      const used = pts.slice(0, X); while (used.length < X) used.push(pen);
      const ins = K.S.filter(s => s.cls === cls && !s.st).length;
      return { cls, score: used.reduce((a, b) => a + b, 0) / X, n: pts.length, ins, pts, miss: Math.max(0, X - pts.length), F: main.filter(x => x.c.sx === 'F').reduce((a, x) => a + x.R.filter(r => r.s.cls === cls).length, 0), G: main.filter(x => x.c.sx === 'G').reduce((a, x) => a + x.R.filter(r => r.s.cls === cls).length, 0) };
    }).sort((a, b) => a.score - b.score || b.n - a.n).map((r, i) => ({ ...r, rk: i + 1 }));
  }

  /* Remise à zéro d'une course : départ annulé + passages de ses coureurs effacés */
  function resetCourse(E, c) {
    const K = compute(E), bibs = new Set(K.S.filter(s => K.cOf.get(s.k) === c && s.b).map(s => +s.b));
    E.arr = E.arr.filter(a => !(bibs.has(+a.b) && a.t >= c.start)); c.start = null;
  }
  /* ---------- Enregistrement d'un passage (caméra ou pavé) ---------- */
  const seen = new Map();   // dossard -> dernier scan caméra (anti-doublon 20 s, propre à la tablette)
  function record(E, bib, src, now = Date.now()) {
    const K = compute(E), s = K.byBib.get(+bib);
    if (!s) return { kind: 'bad', bib, msg: 'Dossard inconnu' };
    const c = K.cOf.get(s.k);
    if (!c) return { kind: 'bad', bib, s, msg: s.st === 'abs' ? 'Élève noté absent' : s.st === 'disp' ? 'Élève noté dispensé' : 'Aucune course pour cet élève' };
    if (!c.start) return { kind: 'warn', bib, s, c, msg: 'Course pas encore partie' };
    if (now < c.start) return { kind: 'warn', bib, s, c, msg: 'Avant le départ' };
    const mine = K.arrBy.get(+bib) || [], after = mine.filter(t => t >= c.start);
    if (c.mode !== 'temps' && after.length) {
      const r = K.courses.find(x => x.c === c).R.find(x => x.s.k === s.k);
      return { kind: 'warn', bib, s, c, r, msg: 'Déjà arrivé' };
    }
    if (c.mode === 'temps') {
      if (now > c.start + c.dur * 60000) return { kind: 'warn', bib, s, c, msg: 'Temps écoulé : passage non compté' };
      const last = after[after.length - 1];
      if (last && now - last < 30000) return { kind: 'warn', bib, s, c, msg: 'Tour trop rapide (< 30 s)' };
    }
    E.arr.push({ id: uid(8), b: +bib, t: now, d: DEV, src }); commit();
    const K2 = compute(E), r = K2.courses.find(x => x.c === c).R.find(x => x.s.k === s.k);
    return { kind: 'ok', bib, s, c, r };
  }
  const parse = txt => { const m = /^EPSX\|([^|]+)\|(\d{1,5})$/.exec(String(txt || '').trim()); return m ? { id: m[1], bib: +m[2] } : null; };
  /* Point d'entrée commun au décodeur caméra et au pavé : renvoie le résultat et l'affiche */
  function handle(txt, src = 'cam') {
    const E = cur(); if (!E) return null;
    let res;
    if (src === 'manual') res = record(E, +txt, 'manual');
    else {
      const p = parse(txt);
      if (!p) res = { kind: 'bad', msg: 'QR code non reconnu' };
      else if (p.id !== E.id) { const o = X().events.find(e => e.id === p.id); res = { kind: 'bad', bib: p.bib, msg: o ? `Dossard du cross « ${o.name} »` : 'Dossard d\'un autre cross' }; }
      else { const l = seen.get(p.bib); if (l && Date.now() - l < 20000) return { kind: 'skip', bib: p.bib }; seen.set(p.bib, Date.now()); res = record(E, p.bib, 'cam'); }
    }
    if (window.__cxUI) window.__cxUI(res);
    return res;
  }
  const cur = () => { const L = X().events; return L.find(e => e.id === getCur()) || L[0] || null; };

  /* ---------- Aperçu avant impression (iframe : fonctionne aussi en web app iPad) ---------- */
  function printPreview(title, html, pdf) {
    const o = document.createElement('div'); o.className = 'cx-pv';
    o.innerHTML = `<header><b>${esc(title)}</b><button class="btn btn-white" data-p>🖨 Imprimer</button>${pdf ? '<button class="btn btn-white" data-pdf>📄 PDF / e-mail</button>' : ''}<button class="btn btn-ghost" style="color:#fff" data-w>↗ Ouvrir</button><button class="btn btn-ghost" style="color:#fff" data-x>✕ Fermer</button></header><iframe title="Aperçu"></iframe>`;
    document.body.appendChild(o);
    const fr = o.querySelector('iframe'); fr.srcdoc = html;
    o.querySelector('[data-x]').onclick = () => o.remove();
    if (pdf) o.querySelector('[data-pdf]').onclick = () => { try { pdf(); } catch (e) { toast('PDF impossible : ' + e.message); } };
    // Impression dans la page même (iPad / iPhone / appli installée : l'impression d'un cadre ou d'une page « blob: » échoue sur Safari)
    o.querySelector('[data-p]').onclick = () => {
      const d = new DOMParser().parseFromString(html, 'text/html'); d.querySelectorAll('script').forEach(x => x.remove());
      document.getElementById('cx-print')?.remove(); document.getElementById('cx-print-css')?.remove();
      const st = document.createElement('style'); st.id = 'cx-print-css'; st.media = 'print';
      st.textContent = [...d.querySelectorAll('style')].map(x => x.textContent).join('\n') + '\nbody>*:not(#cx-print){display:none!important}#cx-print{display:block!important}html,body{background:#fff!important;padding:0!important;margin:0!important;height:auto!important;overflow:visible!important}';
      const box = document.createElement('div'); box.id = 'cx-print'; box.style.display = 'none'; box.innerHTML = d.body.innerHTML;
      document.head.appendChild(st); document.body.appendChild(box);
      const clean = () => { box.remove(); st.remove(); window.removeEventListener('afterprint', clean); };
      window.addEventListener('afterprint', clean);
      const imgs = [...box.querySelectorAll('img')].filter(i => !i.complete);
      Promise.all(imgs.map(i => new Promise(r => { i.onload = i.onerror = r; }))).then(() => setTimeout(() => { try { window.print(); } catch (e) { toast('Impression impossible : essayez « Ouvrir »'); } }, 150));
    };
    o.querySelector('[data-w]').onclick = () => { let w = null; try { w = window.open('', '_blank'); if (w) { w.document.open(); w.document.write(html); w.document.close(); return; } } catch (e) {}
      try { if (w) w.close(); } catch (e) {} toast('Ouverture impossible ici : utilisez « 🖨 Imprimer »'); };
    return o;
  }
  const pageDoc = (title, css, body) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:#0E1A33;-webkit-print-color-adjust:exact;print-color-adjust:exact}
${css}
@media screen{body{background:#777;padding:10px}.page{background:#fff;margin:0 auto 10px;box-shadow:0 2px 12px rgba(0,0,0,.4)}}
@media print{body{zoom:1!important;padding:0;background:none}.page{margin:0;box-shadow:none}}
</style></head><body>${body}<script>function fit(){document.body.style.zoom=Math.min(1,(innerWidth-20)/794)}fit();addEventListener('resize',fit);addEventListener('beforeprint',function(){document.body.style.zoom=1});addEventListener('afterprint',fit);<\/script></body></html>`;

  /* Dossards en PDF (4 par page A4, mêmes informations que l'impression) — pour envoi par e-mail */
  function bibsPdf(E, list) {
    const K = compute(E), P = PdfMini(), CW = 105, CH = 148.5;
    list.forEach((s, i) => {
      if (i % 4 === 0) { P.page(); for (let k = 0; k < 4; k++) P.rect((k % 2) * CW, Math.floor(k / 2) * CH, CW, CH, { stroke: '#999999', dash: [1.2, 1], lw: .3 }); }
      const x0 = (i % 2) * CW, y0 = Math.floor((i % 4) / 2) * CH, c = K.cOf.get(s.k), cc = c ? col(E, c) : '#5B6782', W = CW - 12, cx = x0 + CW / 2;
      P.rect(x0 + 6, y0 + 5, W, 7.5, { fill: cc, r: 2.5 });
      const right = c ? c.name : '—', rw = P.width(right, 10, true);
      P.text(P.fit(E.name, 10, true, W - rw - 8), x0 + 9, y0 + 10.2, 10, { bold: true, color: '#FFFFFF' });
      P.text(right, x0 + 6 + W - 3, y0 + 10.2, 10, { bold: true, color: '#FFFFFF', align: 'right' });
      P.text(String(s.b), cx, y0 + 40, 84, { bold: true, color: '#0E1A33', align: 'center' });
      P.text(P.fit(s.name, 15, true, W), cx, y0 + 48, 15, { bold: true, color: '#0E1A33', align: 'center' });
      P.text(P.fit(s.cls + (c ? ' · ' + (c.mode === 'temps' ? c.dur + ' min' : c.dist + ' m') : ''), 11, true, W), cx, y0 + 54, 11, { bold: true, color: '#444444', align: 'center' });
      const M = QR.matrix(`EPSX|${E.id}|${s.b}`), n = M.length, q = 56 / (n + 8), qx = cx - 28, qy = y0 + CH - 9 - 56;
      M.forEach((row, y) => { let x = 0; while (x < n) { if (!row[x]) { x++; continue; } let e = x; while (e < n && row[e]) e++; P.rect(qx + (x + 4) * q, qy + (y + 4) * q, (e - x) * q + .02, q + .02, { fill: '#000000' }); x = e; } });
      P.text(`Dossard n° ${s.b} · à scanner à l'arrivée`, cx, y0 + CH - 5, 7, { color: '#777777', align: 'center' });
    });
    return P.blob();
  }
  function bibsDoc(E, list) {
    const K = compute(E), cards = list.map(s => { const c = K.cOf.get(s.k), cc = c ? col(E, c) : '#5B6782';
      return `<div class="bib" style="--cc:${cc}"><div class="top"><span>${esc(E.name)}</span><span>${esc(c ? c.name : '—')}</span></div>
        <div class="num">${s.b}</div><div class="nm">${esc(s.name)}</div><div class="cl">${esc(s.cls)}${c ? ' · ' + (c.mode === 'temps' ? c.dur + ' min' : c.dist + ' m') : ''}</div>
        <div class="qr">${QR.svg(`EPSX|${E.id}|${s.b}`, 200, '#000')}</div><div class="ft">Dossard n° ${s.b} · à scanner à l'arrivée</div></div>`; });
    const pages = []; for (let i = 0; i < cards.length; i += 4) pages.push(`<div class="page">${cards.slice(i, i + 4).join('')}${'<div class="bib empty"></div>'.repeat(Math.max(0, 4 - cards.slice(i, i + 4).length))}</div>`);
    return pageDoc('Dossards · ' + E.name, `@page{size:A4 portrait;margin:0}
.page{width:210mm;height:297mm;display:grid;grid-template-columns:105mm 105mm;grid-template-rows:148.5mm 148.5mm;overflow:hidden;break-after:page;page-break-after:always}
.page:last-child{break-after:auto;page-break-after:auto}
.bib{border:.3mm dashed #999;padding:5mm 6mm;display:flex;flex-direction:column;align-items:center;text-align:center;overflow:hidden}
.bib.empty{border-color:#eee}
.top{width:100%;display:flex;justify-content:space-between;gap:3mm;background:var(--cc);color:#fff;border-radius:3mm;padding:2mm 3mm;font-weight:800;font-size:10pt}
.num{font-size:84pt;font-weight:900;line-height:1;margin-top:3mm;letter-spacing:-1pt;font-variant-numeric:tabular-nums}
.nm{font-size:15pt;font-weight:800;margin-top:1mm;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cl{font-size:11pt;color:#444;font-weight:700}
.qr{margin-top:auto}.qr svg{width:56mm;height:56mm;display:block}
.ft{font-size:7pt;color:#777;margin-top:1mm}`, pages.join('') || '<p style="color:#fff">Aucun dossard.</p>');
  }

  function rankDoc(E, sections) {
    return pageDoc('Classements · ' + E.name, `@page{size:A4 portrait;margin:12mm}
.page{width:210mm;min-height:297mm;padding:12mm}@media print{.page{width:auto;min-height:0;padding:0}.sec{break-inside:auto}.sec+.sec{break-before:page}}
h1{font-size:18pt;margin:0 0 2mm}h2{font-size:14pt;margin:6mm 0 2mm}p{margin:0 0 3mm;color:#555;font-size:9pt}
table{width:100%;border-collapse:collapse;font-size:9.5pt}th,td{border-bottom:.2mm solid #ccc;padding:1.4mm 2mm;text-align:left}th{background:#eef2fa;font-size:8pt;text-transform:uppercase}
tr:nth-child(-n+4) td{font-weight:700}`,
    `<div class="page"><h1>${esc(E.name)}</h1><p>${esc(new Date(E.date + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}</p>${sections.map(s => `<div class="sec"><h2>${esc(s.title)}</h2>${s.note ? `<p>${esc(s.note)}</p>` : ''}<table><tr>${s.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${s.rows.map(r => `<tr>${r.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</table></div>`).join('')}</div>`);
  }

  /* Tableaux de classement (communs à l'écran, au CSV et à l'impression) */
  const courseTable = x => ({ title: x.c.name + (x.c.mode === 'temps' ? ` · ${x.c.dur} min (tour ${x.c.lap} m)` : ` · ${x.c.dist} m`),
    head: ['Rang', 'Dossard', 'Élève', 'Classe', x.c.mode === 'temps' ? 'Tours · distance' : 'Temps', x.c.mode === 'temps' ? 'Dernier passage' : 'Écart', 'km/h'],
    rows: [...x.R.map(r => [r.place, r.s.b || '', r.s.name, r.s.cls, perf(r), x.c.mode === 'temps' ? tm(r.last) + (r.gap ? ' (' + r.gap + ')' : '') : r.gap, km(r.speed)]),
      ...x.W.map(r => ['–', r.s.b || '', r.s.name, r.s.cls, x.c.start ? 'non arrivé' : 'non parti', '', ''])] });
  const levelTable = (E, K, L, sx) => ({ title: `Général ${LVN[L]}${sx ? ' · ' + SXN[sx].toLowerCase() : ''}`, note: 'Toutes les courses principales du niveau, classées par vitesse moyenne (distance ÷ temps), pour comparer des courses de longueurs différentes.',
    head: ['Rang', 'Dossard', 'Élève', 'Classe', 'Course', 'Place', 'Perf.', 'km/h'],
    rows: levelRank(E, K, L, sx).map((r, i) => [i + 1, r.s.b || '', r.s.name, r.s.cls, r.c.name, r.place, perf(r), km(r.speed)]) });
  const classTable = (E, K, L) => ({ title: `Classement des classes · ${LVN[L]}`, note: `Points = place dans sa course ; score de classe = moyenne des places des ${E.topN} premiers arrivés de la classe (filles et garçons réunis). Place manquante = dernière place + 1. Le plus petit score gagne.`,
    head: ['Rang', 'Classe', 'Score', 'Arrivés', 'Filles', 'Garçons', `${E.topN} meilleures places`],
    rows: classRank(E, K, L).map(r => [r.rk, r.cls, r.score.toFixed(2).replace('.', ','), `${r.n}/${r.ins}`, r.F, r.G, r.pts.slice(0, E.topN).join(' · ') + (r.miss ? ` (+${r.miss} manquante${r.miss > 1 ? 's' : ''})` : '')]) });

  /* ================= OUTIL ================= */
  let tab = 'courses', insCls = '', msel = null, rv = 'course', rc = '', rl = '6', rsx = '', gsel = new Set(), gstart = new Set();
  TOOL_IMPL.cross = function (el) {
    let stopCam = () => {}, clockIv = null, flashT = null, pad = '';
    const stopAll = () => { stopCam(); stopCam = () => {}; clearInterval(clockIv); clockIv = null; };

    function frame() {
      stopAll();
      const L = X().events;
      if (!L.length) {
        el.innerHTML = `<div class="card" data-cfg><h3>🏁 Nouveau cross</h3><p class="muted" style="margin:6px 0 0">Courses par niveau et par sexe, dossards avec QR code, scan des arrivées sur une ou plusieurs tablettes, classements automatiques.</p>
          <label>Nom</label><input id="cx-nn" value="Cross du collège ${new Date().getFullYear()}"><button class="btn btn-grad btn-block" style="margin-top:12px" id="cx-mk">＋ Créer le cross</button></div>`;
        el.querySelector('#cx-mk').onclick = () => { const E = newEvent(el.querySelector('#cx-nn').value.trim()); X().events.push(E); setCur(E.id); commit(); frame(); };
        return;
      }
      const E = norm(cur()); setCur(E.id);
      el.innerHTML = `<div class="cx-bar" data-cfg="bare"><select id="cx-ev" aria-label="Cross">${L.map(e => `<option value="${esc(e.id)}" ${e === E ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select>
          <button class="btn btn-ghost" id="cx-new" title="Nouveau cross">＋</button><button class="btn btn-ghost" id="cx-dup" title="Dupliquer">⧉</button></div>
        <div class="cx-tabs">${[['courses', '🏁 Courses'], ['inscr', '👥 Inscriptions'], ['bibs', '🎽 Dossards'], ['scan', '📷 Arrivée'], ['rank', '🏆 Classements']].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <div id="cx-body"></div>`;
      el.querySelector('#cx-ev').onchange = e => { setCur(e.target.value); insCls = ''; rc = ''; frame(); };
      el.querySelector('#cx-new').onclick = () => { const n = prompt('Nom du nouveau cross :', 'Cross ' + new Date().getFullYear()); if (!n) return; const N = newEvent(n.trim()); X().events.push(N); setCur(N.id); tab = 'courses'; commit(); frame(); };
      el.querySelector('#cx-dup').onclick = () => { const n = prompt('Nom de la copie (courses, classes, sexes et dossards repris ; départs et arrivées vides) :', E.name + ' (copie)'); if (!n) return;
        const N = JSON.parse(JSON.stringify(E)); Object.assign(N, { id: uid(4), name: n.trim(), created: Date.now(), date: new Date().toISOString().slice(0, 10), arr: [] }); N.courses.forEach(c => { c.start = null; c.id = uid(5); });
        const map = Object.fromEntries(E.courses.map((c, i) => [c.id, N.courses[i].id])); Object.values(N.el).forEach(o => { if (o.c) o.c = map[o.c] || ''; });
        X().events.push(N); setCur(N.id); commit(); toast('Cross dupliqué ✔'); frame(); };
      el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; frame(); });
      const body = el.querySelector('#cx-body');
      ({ courses, inscr, bibs, scan, rank })[tab](body, E);
    }
    const again = () => { const y = el.scrollTop; frame(); el.scrollTop = y; };

    /* ---------- 🏁 Courses ---------- */
    function courses(box, E) {
      const K = compute(E);
      box.innerHTML = `<div class="card" data-cfg><div class="row"><div style="flex:2"><label style="margin-top:0">Nom du cross</label><input id="cx-name" value="${esc(E.name)}"></div><div><label style="margin-top:0">Date</label><input id="cx-date" type="date" value="${esc(E.date || '')}"></div></div></div>
        <div class="section-title"><h2>Courses (${E.courses.length}/${MAXC})</h2>${E.courses.length < MAXC ? '<button class="link" data-cfg="bare" id="cx-add">＋ Ajouter une course</button>' : ''}</div>
        ${E.courses.map((c, i) => { const x = K.courses[i];
          return `<div class="card cx-course" data-cfg style="--cc:${col(E, c)}" data-c="${i}">
          <div class="hd"><span class="cx-dot"></span><input data-f="name" value="${esc(c.name)}" aria-label="Nom de la course"><button class="btn btn-ghost" data-up="${i}" ${i ? '' : 'disabled'} aria-label="Monter">↑</button><button class="btn btn-ghost" data-dn="${i}" ${i < E.courses.length - 1 ? '' : 'disabled'} aria-label="Descendre">↓</button></div>
          <div class="seg" style="margin-top:10px"><button data-mode="distance" class="${c.mode !== 'temps' ? 'on' : ''}">📏 Distance</button><button data-mode="temps" class="${c.mode === 'temps' ? 'on' : ''}">⏱ Temps (tours)</button></div>
          ${c.mode === 'temps' ? `<div class="row"><div><label>Durée (min)</label><input type="number" min="1" data-f="dur" value="${c.dur}"></div><div><label>Longueur du tour (m)</label><input type="number" min="1" data-f="lap" value="${c.lap}"></div></div><p class="muted" style="margin:6px 0 0;font-size:.78rem">Chaque scan sur la ligne = 1 tour (30 s minimum entre 2 tours). Classement : tours, puis heure du dernier passage.</p>`
            : `<div class="row"><div><label>Distance (m)</label><input type="number" min="1" data-f="dist" value="${c.dist}"></div></div>`}
          <label>Niveaux</label><div class="seg">${LV.map(l => `<button data-lv="${l}" class="${(c.lv || []).includes(l) ? 'on' : ''}">${LVN[l]}</button>`).join('')}</div>
          <label>Sexe</label><div class="seg">${['F', 'G', 'X'].map(s => `<button data-sx="${s}" class="${c.sx === s ? 'on' : ''}">${SXN[s]}</button>`).join('')}</div>
          <label class="cx-chk"><input type="checkbox" data-main ${c.main !== false ? 'checked' : ''}> Course principale (affectation automatique + classements généraux et des classes)</label>
          <div class="muted" style="margin-top:8px">${x.n} coureur${x.n > 1 ? 's' : ''} · ${c.start ? `départ ${hms(c.start)} · ${x.R.length} arrivé${x.R.length > 1 ? 's' : ''}` : 'pas encore partie'}</div>
          <button class="btn btn-ghost btn-block" style="margin-top:10px" data-prof data-del="${i}">🗑 Supprimer la course</button></div>`; }).join('')}
        <details class="card cx-prof" data-cfg="bare"><summary data-prof>🔒 Enseignant</summary>
          <h3 style="margin:12px 0 4px">Heures de départ</h3><p class="muted" style="margin:0 0 6px;font-size:.8rem">Pour corriger un départ donné trop tôt ou trop tard.</p>
          ${E.courses.map((c, i) => `<div class="cx-start" style="--cc:${col(E, c)}"><span class="cx-dot"></span><div class="nm">${esc(c.name)}</div><input type="time" step="1" style="width:130px" data-st="${i}" value="${c.start ? new Date(c.start).toTimeString().slice(0, 8) : ''}"><button class="btn btn-ghost" style="flex:0 0 auto;padding:9px" data-stclr="${i}" aria-label="Effacer le départ">✕</button></div>`).join('')}
          <button class="btn btn-ghost btn-block" style="margin-top:12px" id="cx-rz">↺ Remettre le cross à zéro (tous les départs + arrivées)</button>
          <button class="btn btn-ghost btn-block" style="margin-top:8px" id="cx-rarr">↺ Effacer seulement les arrivées (${E.arr.length})</button>
          <button class="btn btn-danger btn-block" style="margin-top:8px" id="cx-delev">🗑 Supprimer ce cross</button></details>`;
      const $ = s => box.querySelector(s);
      $('#cx-name').onchange = e => { E.name = e.target.value.trim() || E.name; commit(); again(); };
      $('#cx-date').onchange = e => { E.date = e.target.value; commit(); };
      if ($('#cx-add')) $('#cx-add').onclick = () => { E.courses.push({ id: uid(5), name: 'Course ' + (E.courses.length + 1), mode: 'distance', dist: 2000, dur: 12, lap: 500, lv: [...LV], sx: 'X', main: false, start: null }); commit(); again(); };
      box.querySelectorAll('[data-c]').forEach(card => { const c = E.courses[+card.dataset.c];
        card.querySelectorAll('[data-f]').forEach(inp => inp.onchange = () => { const f = inp.dataset.f; c[f] = f === 'name' ? (inp.value.trim() || c.name) : Math.max(1, +inp.value || 1); commit(); });
        card.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { c.mode = b.dataset.mode; commit(); again(); });
        card.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => { const l = b.dataset.lv; c.lv = (c.lv || []).includes(l) ? c.lv.filter(x => x !== l) : LV.filter(x => x === l || (c.lv || []).includes(x)); commit(); again(); });
        card.querySelectorAll('[data-sx]').forEach(b => b.onclick = () => { c.sx = b.dataset.sx; commit(); again(); });
        card.querySelector('[data-main]').onchange = e => { c.main = e.target.checked; commit(); again(); };
      });
      const mv = (i, d) => { const a = E.courses; [a[i], a[i + d]] = [a[i + d], a[i]]; commit(); again(); };
      box.querySelectorAll('[data-up]').forEach(b => b.onclick = () => mv(+b.dataset.up, -1));
      box.querySelectorAll('[data-dn]').forEach(b => b.onclick = () => mv(+b.dataset.dn, 1));
      box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const c = E.courses[+b.dataset.del]; if (!confirm(`Supprimer la course « ${c.name} » ?`)) return;
        E.courses = E.courses.filter(x => x !== c); Object.keys(E.el).forEach(k => { if (E.el[k].c === c.id) setEl(E, k, { c: '' }); }); commit(); again(); });
      box.querySelectorAll('[data-st]').forEach(inp => inp.onchange = () => { const c = E.courses[+inp.dataset.st]; if (!inp.value) return;
        const [h, m, s] = inp.value.split(':').map(Number), d = c.start ? new Date(c.start) : new Date(); d.setHours(h, m, s || 0, 0); c.start = d.getTime(); commit(); toast(`Départ « ${c.name} » : ${hms(c.start)}`); });
      box.querySelectorAll('[data-stclr]').forEach(b => b.onclick = () => { const c = E.courses[+b.dataset.stclr]; if (!c.start || !confirm(`Annuler le départ de « ${c.name} » ?`)) return; c.start = null; commit(); again(); });
      $('#cx-rz').onclick = () => { if (!confirm('Remettre ce cross à zéro ?\nTous les départs et toutes les arrivées sont effacés. Les courses, inscriptions et dossards sont conservés.')) return; E.arr = []; E.courses.forEach(c => { c.start = null; }); commit(); toast('↺ Cross remis à zéro'); again(); };
      $('#cx-rarr').onclick = () => { if (!E.arr.length || !confirm('Effacer toutes les arrivées de ce cross ?')) return; E.arr = []; commit(); again(); };
      $('#cx-delev').onclick = () => { if (!confirm(`Supprimer définitivement « ${E.name} » ?`)) return; DB.cross.events = X().events.filter(e => e.id !== E.id); setCur(''); commit(); frame(); };
    }

    /* ---------- 👥 Inscriptions ---------- */
    function inscr(box, E) {
      if (!allCls().length && !otherClasses().length) { box.innerHTML = noClassMsg; return; }
      const K = compute(E), mine = new Set(DB.classes.filter(c => !c.unss).map(c => c.name)), allN = [...new Set([...allCls().filter(c => !c.unss), ...otherClasses()].map(c => c.name))];
      if (!E.classes.includes(insCls)) insCls = sortCls(E, E.classes)[0] || '';
      const S = K.S, noSx = S.filter(s => !s.st && !K.cOf.get(s.k)).length;
      box.innerHTML = `<div class="card" data-cfg><b>Classes participantes (${E.classes.length}/${MAXCL})</b><p class="muted" style="margin:4px 0 0;font-size:.8rem">Niveau déduit du 1er chiffre du nom de la classe (modifiable). ${MAXST} élèves max par classe. Toutes les classes : 🏃 vos classes EPS et 🏫 les autres classes du collège (Mes classes).</p>
          <div class="cx-cls">${sortCls(E, allN).map(c => `<button data-tc="${esc(c)}" class="${E.classes.includes(c) ? 'on' : ''}">${mine.has(c) ? '🏃 ' : ''}${esc(c)}<small>${lvOf(E, c) ? LVN[lvOf(E, c)] : '?'}</small></button>`).join('')}</div>
          ${allN.length > 1 ? `<div class="row" style="margin-top:8px"><button class="btn btn-ghost" id="cx-tall">Tout cocher</button><button class="btn btn-ghost" id="cx-tnone">Tout décocher</button></div>` : ''}
          ${E.classes.length ? `<div class="cx-cls" style="margin-top:12px">${sortCls(E, E.classes).map(c => `<label style="margin:0;display:flex;gap:6px;align-items:center;font-size:.82rem">${esc(c)}<select data-lvc="${esc(c)}" style="width:auto;padding:6px 8px">${['', ...LV].map(l => `<option value="${l}" ${lvOf(E, c) === l ? 'selected' : ''}>${l ? LVN[l] : '—'}</option>`).join('')}</select></label>`).join('')}</div>` : ''}</div>
        ${E.classes.length ? `<div class="card" style="margin-top:12px"><b>Répartition</b>
          <div class="sheet-table"><table><tr><th>Course</th><th>Coureurs</th></tr>${K.courses.map(x => `<tr><td><span class="cx-dot" style="--cc:${col(E, x.c)}"></span> ${esc(x.c.name)}</td><td><b>${x.n}</b></td></tr>`).join('')}
          <tr><td>Absents / dispensés</td><td>${S.filter(s => s.st).length}</td></tr></table></div>
          ${noSx ? `<div class="cx-warn">⚠️ ${noSx} élève${noSx > 1 ? 's' : ''} sans course : indiquez F ou G (ou choisissez une course).</div>` : ''}</div>
        <div class="section-title"><h2>Élèves par classe</h2></div>
        <div class="cx-cls" style="margin-top:0">${sortCls(E, E.classes).map(c => { const n = S.filter(s => s.cls === c && !s.st && !s.sx && !s.c).length; return `<button data-ic="${esc(c)}" class="${c === insCls ? 'on' : ''}">${esc(c)}${n ? `<small>${n} ?</small>` : '<small>✓</small>'}</button>`; }).join('')}</div>
        <div class="card" data-cfg style="margin-top:10px" id="cx-ins"></div>` : '<div class="card empty" style="margin-top:12px">Touchez les classes qui participent au cross.</div>'}`;
      if (box.querySelector('#cx-tall')) box.querySelector('#cx-tall').onclick = () => { const L = sortCls(E, allN); E.classes = L.slice(0, MAXCL); if (L.length > MAXCL) toast(`${MAXCL} classes maximum`); if (!E.classes.includes(insCls)) insCls = E.classes[0] || ''; commit(); again(); };
      if (box.querySelector('#cx-tnone')) box.querySelector('#cx-tnone').onclick = () => { if (!confirm('Retirer toutes les classes de ce cross ? (les réglages des élèves sont conservés)')) return; E.classes = []; commit(); again(); };
      box.querySelectorAll('[data-tc]').forEach(b => b.onclick = () => { const c = b.dataset.tc;
        if (E.classes.includes(c)) E.classes = E.classes.filter(x => x !== c); else { if (E.classes.length >= MAXCL) return toast(`${MAXCL} classes maximum`); E.classes.push(c); insCls = c; }
        E.classes = sortCls(E, E.classes); commit(); again(); });
      box.querySelectorAll('[data-lvc]').forEach(s => s.onchange = () => { const c = s.dataset.lvc, d = (/\d/.exec(c) || [])[0]; if (s.value && s.value !== d) E.lv[c] = s.value; else if (!s.value && LV.includes(d)) E.lv[c] = '-'; else delete E.lv[c]; E.classes = sortCls(E, E.classes); commit(); again(); });
      box.querySelectorAll('[data-ic]').forEach(b => b.onclick = () => { insCls = b.dataset.ic; if (msel) msel = new Set(); again(); });
      const ib = box.querySelector('#cx-ins'); if (ib && insCls) drawClass(ib, E);
    }
    function drawClass(ib, E) {
      const K = compute(E), L = stuOf(E, insCls), all = studentsOf(insCls).length, nF = L.filter(s => s.sx === 'F').length, nG = L.filter(s => s.sx === 'G').length;
      const opts = s => { const a = autoCourse(E, s); return `<option value="">Auto → ${a ? esc(a.name) : '? (sexe)'}</option>${E.courses.map(c => `<option value="${c.id}" ${s.c === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}`; };
      ib.innerHTML = `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b style="flex:1;font-size:1.1rem">${esc(insCls)} <span class="muted">· ${lvOf(E, insCls) ? LVN[lvOf(E, insCls)] : 'niveau ?'} · ${nF} F · ${nG} G</span></b>
          <button class="btn btn-ghost" data-all="F">Tout F</button><button class="btn btn-ghost" data-all="G">Tout G</button><button class="btn ${msel ? 'btn-grad' : 'btn-ghost'}" id="cx-ms">${msel ? '✕ Fin sélection' : '☑️ Sélection multiple'}</button></div>
        ${msel ? `<div class="cx-mbar"><b style="flex:1 1 100%">${msel.size} élève${msel.size > 1 ? 's' : ''} sélectionné${msel.size > 1 ? 's' : ''}</b>
          <button class="btn btn-ghost" id="cx-mall">${msel.size === L.length ? 'Tout décocher' : 'Tout cocher'}</button>
          <select id="cx-mco"><option value="">Auto (course de sa catégorie)</option>${E.courses.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
          <button class="btn btn-grad" id="cx-mgo" ${msel.size ? '' : 'disabled'}>Appliquer</button></div>` : ''}
        ${all > MAXST ? `<div class="cx-warn">Seuls les ${MAXST} premiers élèves de la classe sont inscrits.</div>` : ''}
        ${L.map(s => { const c = K.cOf.get(s.k); return `<div class="cx-st ${s.st ? 'off' : ''} ${msel && msel.has(s.k) ? 'sel' : ''}" data-k="${esc(s.k)}">${msel ? `<input type="checkbox" class="ck" data-ck ${msel.has(s.k) ? 'checked' : ''} aria-label="Sélectionner">` : ''}<div class="nm"><b>${esc(s.name)}</b><small>${s.st ? (s.st === 'abs' ? 'Absent' : 'Dispensé') : c ? esc(c.name) : '⚠️ sans course'}${s.b ? ' · n° ' + s.b : ''}</small></div>
          <div class="cx-fg"><button data-sx="F" class="${s.sx === 'F' ? 'onF' : ''}">F</button><button data-sx="G" class="${s.sx === 'G' ? 'onG' : ''}">G</button></div>
          <select data-co aria-label="Course">${opts(s)}</select>
          <select data-stt aria-label="Présence" style="flex:0 1 110px"><option value="">Présent</option><option value="abs" ${s.st === 'abs' ? 'selected' : ''}>Absent</option><option value="disp" ${s.st === 'disp' ? 'selected' : ''}>Dispensé</option></select></div>`; }).join('')}`;
      const re = () => { const y = el.scrollTop; drawClass(ib, E); el.scrollTop = y; };
      ib.querySelectorAll('[data-all]').forEach(b => b.onclick = () => { L.forEach(s => setEl(E, s.k, { sx: b.dataset.all })); commit(); again(); });
      ib.querySelector('#cx-ms').onclick = () => { msel = msel ? null : new Set(); re(); };
      if (msel) {
        ib.querySelector('#cx-mall').onclick = () => { if (msel.size === L.length) msel.clear(); else L.forEach(s => msel.add(s.k)); re(); };
        ib.querySelector('#cx-mgo').onclick = () => { if (!msel.size) return; const v = ib.querySelector('#cx-mco').value, c = E.courses.find(x => x.id === v);
          msel.forEach(k => setEl(E, k, { c: v })); commit(); toast(`${msel.size} élève${msel.size > 1 ? 's' : ''} → ${c ? c.name : 'course de leur catégorie'}`); msel = new Set(); const y = el.scrollTop; again(); el.scrollTop = y; };
        ib.querySelectorAll('[data-ck]').forEach(x => x.onchange = () => { const k = x.closest('[data-k]').dataset.k; x.checked ? msel.add(k) : msel.delete(k); re(); });
        ib.querySelectorAll('.cx-st .nm').forEach(n => n.onclick = () => { const k = n.closest('[data-k]').dataset.k; msel.has(k) ? msel.delete(k) : msel.add(k); re(); });
      }
      ib.querySelectorAll('[data-k]').forEach(row => { const k = row.dataset.k;
        row.querySelectorAll('[data-sx]').forEach(b => b.onclick = () => { const cur0 = (E.el[k] || {}).sx; setEl(E, k, { sx: cur0 === b.dataset.sx ? '' : b.dataset.sx }); commit(); re(); });
        row.querySelector('[data-co]').onchange = e => { setEl(E, k, { c: e.target.value }); commit(); re(); };
        row.querySelector('[data-stt]').onchange = e => { setEl(E, k, { st: e.target.value }); commit(); re(); };
      });
    }

    /* ---------- 🎽 Dossards ---------- */
    function assignBibs(E, all) {
      if (all) Object.keys(E.el).forEach(k => setEl(E, k, { b: '' }));
      const S = stu(E), used = new Set(S.filter(s => s.b).map(s => +s.b));
      if (E.bibMode === 'suite') { let n = 1; S.forEach(s => { if (s.b) return; while (used.has(n)) n++; used.add(n); setEl(E, s.k, { b: n }); }); }
      else sortCls(E, E.classes).forEach((c, i) => stuOf(E, c).forEach((s, j) => { if (s.b) return; let n = (i + 1) * 100 + j + 1; while (used.has(n)) n++; used.add(n); setEl(E, s.k, { b: n }); }));
      commit();
    }
    function bibs(box, E) {
      if (!E.classes.length) { box.innerHTML = '<div class="card empty">Choisissez d\'abord les classes dans l\'onglet 👥 Inscriptions.</div>'; return; }
      const K = compute(E), S = K.S, miss = S.filter(s => !s.b).length, cnt = {}; S.forEach(s => { if (s.b) cnt[s.b] = (cnt[s.b] || 0) + 1; });
      const dup = Object.keys(cnt).filter(b => cnt[b] > 1);
      if (!gsel.size || [...gsel].some(c => !E.classes.includes(c))) gsel = new Set(E.classes);
      box.innerHTML = `<div class="card" data-cfg><b>Numérotation</b>
          <div class="seg"><button data-bm="classe" class="${E.bibMode !== 'suite' ? 'on' : ''}">Par classe<br><small>101-135, 201-235…</small></button><button data-bm="suite" class="${E.bibMode === 'suite' ? 'on' : ''}">À la suite<br><small>1, 2, 3…</small></button></div>
          <button class="btn btn-grad btn-block" style="margin-top:10px" id="cx-ab">🔢 Attribuer les dossards manquants${miss ? ` (${miss})` : ''}</button>
          ${dup.length ? `<div class="cx-warn">⚠️ Numéros en double : ${dup.join(', ')}</div>` : ''}
          <details class="cx-prof" style="margin-top:10px"><summary data-prof>🔒 Enseignant</summary><button class="btn btn-ghost btn-block" style="margin-top:10px" id="cx-rb">↺ Tout renuméroter</button><button class="btn btn-ghost btn-block" style="margin-top:8px" id="cx-bz">🗑 Effacer tous les numéros de dossard</button></details></div>
        <div class="card" style="margin-top:12px"><b>🖨 Impression</b><p class="muted" style="margin:4px 0 0;font-size:.8rem">4 dossards par page A4 (format A6, traits de coupe), avec le QR code à scanner à l'arrivée.</p>
          <div class="cx-cls">${sortCls(E, E.classes).map(c => `<button data-pc="${esc(c)}" class="${gsel.has(c) ? 'on' : ''}">${esc(c)}</button>`).join('')}</div>
          <label class="cx-chk"><input type="checkbox" id="cx-abs"> Inclure les absents et dispensés</label>
          <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="cx-pp">🖨 Imprimer la sélection</button><button class="btn btn-ghost" id="cx-pa">Tout imprimer</button></div>
          <button class="btn btn-ghost btn-block" style="margin-top:8px" id="cx-pdf">📄 PDF de la sélection (à envoyer par e-mail)</button></div>
        ${sortCls(E, E.classes).map(c => `<div class="section-title"><h2>${esc(c)}</h2><button class="link" data-p1="${esc(c)}">🖨 Imprimer une classe</button></div>
          <div class="card" data-cfg="bare" style="padding:4px 12px">${stuOf(E, c).map(s => { const co = K.cOf.get(s.k); return `<div class="cx-st ${s.st ? 'off' : ''}"><div class="nm"><b>${esc(s.name)}</b><small>${s.st ? (s.st === 'abs' ? 'Absent' : 'Dispensé') : co ? esc(co.name) : '⚠️ sans course'}</small></div><input class="cx-bibin" type="number" inputmode="numeric" data-bk="${esc(s.k)}" value="${s.b || ''}" aria-label="Dossard"></div>`; }).join('')}</div>`).join('')}`;
      const $ = s => box.querySelector(s);
      box.querySelectorAll('[data-bm]').forEach(b => b.onclick = () => { E.bibMode = b.dataset.bm; commit(); again(); });
      $('#cx-ab').onclick = () => { assignBibs(E, false); toast('Dossards attribués ✔'); again(); };
      $('#cx-bz').onclick = () => { if (!confirm('Effacer tous les numéros de dossard ?\nLes passages déjà enregistrés sont aussi effacés.')) return; Object.keys(E.el).forEach(k => setEl(E, k, { b: '' })); E.arr = []; commit(); toast('Numéros de dossard effacés'); again(); };
      $('#cx-rb').onclick = () => { if (!confirm('Renuméroter tous les dossards ? Les dossards déjà imprimés ne correspondront plus.')) return; assignBibs(E, true); again(); };
      box.querySelectorAll('[data-pc]').forEach(b => b.onclick = () => { const c = b.dataset.pc; gsel.has(c) ? gsel.delete(c) : gsel.add(c); b.classList.toggle('on'); });
      box.querySelectorAll('[data-bk]').forEach(inp => inp.onchange = () => { const v = +inp.value || '', k = inp.dataset.bk;
        if (v && stu(E).some(s => s.k !== k && +s.b === v)) { toast(`Le n° ${v} est déjà pris`); inp.value = (E.el[k] || {}).b || ''; return; } setEl(E, k, { b: v }); commit(); });
      const print = cls => { const inc = $('#cx-abs').checked, list = stu(E).filter(s => cls.includes(s.cls) && s.b && (inc || !s.st));
        if (!list.length) return toast(miss ? 'Attribuez d\'abord les dossards' : 'Aucun dossard à imprimer'); printPreview(`Dossards · ${list.length}`, bibsDoc(E, list), () => epsSharePdf(bibsPdf(E, list), `dossards-${E.name}${cls.length === 1 ? '-' + cls[0] : ''}.pdf`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w.-]+/g, '-'), 'Dossards · ' + E.name)); };
      $('#cx-pp').onclick = () => print([...gsel]);
      $('#cx-pdf').onclick = () => { const cls = [...gsel], inc = $('#cx-abs').checked, list = stu(E).filter(s => cls.includes(s.cls) && s.b && (inc || !s.st));
        if (!list.length) return toast(miss ? 'Attribuez d\'abord les dossards' : 'Aucun dossard'); epsSharePdf(bibsPdf(E, list), `dossards-${E.name}${cls.length === 1 ? '-' + cls[0] : ''}.pdf`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w.-]+/g, '-'), 'Dossards · ' + E.name); };
      $('#cx-pa').onclick = () => print(E.classes);
      box.querySelectorAll('[data-p1]').forEach(b => b.onclick = () => print([b.dataset.p1]));
    }

    /* ---------- 📷 Arrivée ---------- */
    function scan(box, E) {
      box.innerHTML = `<div class="cx-scan"><div>
          <div class="card" id="cx-starts"></div>
          <div class="cx-cam" style="margin-top:12px"><video playsinline muted autoplay></video><div class="cx-guide"></div><div class="cx-cmsg" id="cx-cmsg">📷 Touchez « Activer la caméra »</div></div>
          <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="cx-cam">📷 Activer la caméra</button></div>
          <p class="muted" style="margin:8px 2px 0;font-size:.78rem">Présentez le QR code du dossard dans le cadre. Un même dossard est ignoré pendant 20 s.</p></div>
        <div><div class="card"><b>Saisie du n° de dossard</b><div class="cx-disp" id="cx-disp">—</div>
            <div class="cx-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}<button data-k="b" aria-label="Effacer">⌫</button><button data-k="0">0</button><button data-k="ok" class="ok">✓</button></div>
            <button class="btn btn-ghost btn-block" style="margin-top:10px" id="cx-undo">↶ Annuler mon dernier passage</button></div>
          <div class="section-title"><h2>Derniers passages</h2><span class="muted" id="cx-cnt"></span></div><div class="card" style="padding:4px 12px" id="cx-last"></div></div></div>
        <details class="card cx-prof" data-cfg="bare"><summary data-prof>🔒 Enseignant</summary><p class="muted" style="font-size:.82rem">Supprimer un passage enregistré (toutes tablettes). Les heures de départ se corrigent dans l'onglet 🏁 Courses.</p><div id="cx-all"></div></details>`;
      const $ = s => box.querySelector(s), video = box.querySelector('video'), cmsg = $('#cx-cmsg');
      const drawStarts = () => {
        const K = compute(E), ns = E.courses.filter(c => !c.start);
        [...gstart].forEach(id => { if (!ns.some(c => c.id === id)) gstart.delete(id); });
        $('#cx-starts').innerHTML = `${E.courses.map((c, i) => { const x = K.courses[i]; return `<div class="cx-start" style="--cc:${col(E, c)}"><span class="cx-dot"></span><div class="nm">${esc(c.name)}<small>${x.n} coureur${x.n > 1 ? 's' : ''} · ${c.mode === 'temps' ? c.dur + ' min' : c.dist + ' m'}${c.start ? ` · ${x.R.length} arrivé${x.R.length > 1 ? 's' : ''}` : ''}</small></div>
            ${c.start ? `<span class="clk" data-clk="${i}"></span><button class="cx-stop" data-prof data-stop="${i}" aria-label="Arrêter et remettre à zéro">⏹ Stop</button>` : `<button class="cx-go" data-go="${i}">🔫 Départ</button>`}</div>`; }).join('')}
          ${ns.length > 1 ? `<div style="margin-top:10px"><b>Départ groupé</b> <span class="muted" style="font-size:.78rem">· touchez les courses à lancer ensemble</span><div class="cx-gsel">${ns.map(c => `<button data-gs="${c.id}" class="${gstart.has(c.id) ? 'on' : ''}">${esc(c.name)}</button>`).join('')}</div><button class="btn btn-danger btn-block" id="cx-gg">🔫 Départ groupé (${[...gstart].length})</button></div>` : ''}`;
        const go = L => { const t = Date.now(); L.forEach(c => { c.start = t; }); commit(); beep(1500, .5, .5); toast('🔫 Départ : ' + L.map(c => c.name).join(', ')); gstart.clear(); drawStarts(); };
        box.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go([E.courses[+b.dataset.go]]));
        box.querySelectorAll('[data-stop]').forEach(b => b.onclick = () => { const c = E.courses[+b.dataset.stop]; if (!c || !c.start) return;
          if (!confirm(`Arrêter « ${c.name} » et la remettre à zéro ?\nLe départ est annulé et les passages de cette course sont effacés.`)) return;
          resetCourse(E, c); commit(); toast(`⏹ « ${c.name} » remise à zéro`); drawStarts(); drawLast(); });
        box.querySelectorAll('[data-gs]').forEach(b => b.onclick = () => { const id = b.dataset.gs; gstart.has(id) ? gstart.delete(id) : gstart.add(id); drawStarts(); });
        if ($('#cx-gg')) $('#cx-gg').onclick = () => { const L = E.courses.filter(c => gstart.has(c.id) && !c.start); if (!L.length) return toast('Choisissez les courses à lancer'); go(L); };
        tick();
      };
      const tick = () => { const now = Date.now(); box.querySelectorAll('[data-clk]').forEach(s => { const c = E.courses[+s.dataset.clk]; if (!c || !c.start) return;
        if (c.mode === 'temps') { const left = c.start + c.dur * 60000 - now; s.textContent = left > 0 ? '⏳ ' + tm(left) : '🏁 ' + tm(c.dur * 60000); } else s.textContent = tm(now - c.start); }); };
      const drawLast = () => {
        const K = compute(E), rk = new Map(); K.courses.forEach(x => x.R.forEach(r => rk.set(r.s.k, r)));
        const A = [...E.arr].sort((a, b) => b.t - a.t);
        $('#cx-cnt').textContent = `${A.length} passage${A.length > 1 ? 's' : ''}`;
        const row = (a, del) => { const s = K.byBib.get(+a.b), c = s && K.cOf.get(s.k), r = s && rk.get(s.k);
          return `<div class="cx-last"><span class="b">${a.b}</span><div class="nm"><b>${s ? esc(s.name) : 'Dossard inconnu'}</b><small>${s ? esc(s.cls) + ' · ' : ''}${c ? esc(c.name) : ''}${a.d !== DEV ? ' · 📱 autre tablette' : ''}${a.src === 'manual' ? ' · ⌨️' : ''}</small></div>
            <span class="t">${c && c.start ? tm(a.t - c.start) : hms(a.t)}${r && c.mode !== 'temps' ? `<br><small class="muted">${r.place}e</small>` : r ? `<br><small class="muted">${r.laps} t.</small>` : ''}</span>${del ? `<button class="btn btn-ghost" style="flex:0 0 auto;padding:6px 9px" data-rm="${esc(a.id)}">✕</button>` : ''}</div>`; };
        $('#cx-last').innerHTML = A.length ? A.slice(0, 12).map(a => row(a)).join('') : '<div class="empty">Aucun passage pour l\'instant.</div>';
        $('#cx-all').innerHTML = A.map(a => row(a, true)).join('') || '<div class="muted">Aucun passage.</div>';
        box.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { if (!confirm('Supprimer ce passage ?')) return; E.arr = E.arr.filter(a => a.id !== b.dataset.rm); commit(); drawLast(); drawStarts(); });
      };
      const flash = res => {
        if (!res || res.kind === 'skip') return;
        el.querySelector('.cx-flash')?.remove(); clearTimeout(flashT);
        const f = document.createElement('div'); f.className = 'cx-flash ' + res.kind; const s = res.s, c = res.c, r = res.r;
        f.innerHTML = `${res.bib != null ? `<div class="n">${res.bib}</div>` : ''}${s ? `<div class="who">${esc(s.name)}</div><div class="inf">${esc(s.cls)}${c ? ' · ' + esc(c.name) : ''}</div>` : ''}
          ${res.kind === 'ok' && r ? `<div class="rk">${c.mode === 'temps' ? `Tour ${r.laps} · ${r.place}e` : `${r.place}${r.place === 1 ? 'er' : 'e'} · ${tm(r.time)}`}</div>` : ''}${res.msg ? `<div class="inf" style="font-size:1.15rem;margin-top:8px">${esc(res.msg)}${res.r && res.kind === 'warn' && res.r.place ? ` (${res.r.place}e · ${tm(res.r.time)})` : ''}</div>` : ''}`;
        f.onclick = () => f.remove(); el.appendChild(f);
        if (res.kind === 'ok') { beep(1500, .12, .5); setTimeout(() => beep(1900, .12, .5), 130); } else if (res.kind === 'warn') beep(660, .25, .4); else beep(260, .4, .45);
        try { navigator.vibrate && navigator.vibrate(res.kind === 'ok' ? 60 : [80, 60, 80]); } catch (e) {}
        flashT = setTimeout(() => f.remove(), res.kind === 'ok' ? 1800 : 2600);
        drawLast(); if (res.kind === 'ok') drawStarts();
      };
      window.__cxUI = flash;
      /* Pavé numérique */
      const disp = () => { $('#cx-disp').textContent = pad || '—'; };
      box.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = b.dataset.k;
        if (k === 'b') pad = pad.slice(0, -1); else if (k === 'ok') { if (pad) { handle(pad, 'manual'); pad = ''; } } else if (pad.length < 5) pad += k; disp(); });
      $('#cx-undo').onclick = () => { const mine = E.arr.filter(a => a.d === DEV).pop(); if (!mine) return toast('Aucun passage enregistré sur cette tablette');
        if (!confirm(`Annuler le passage du dossard ${mine.b} (${hms(mine.t)}) ?`)) return; E.arr = E.arr.filter(a => a !== mine); seen.delete(+mine.b); commit(); toast('Passage annulé'); drawLast(); drawStarts(); };
      /* Caméra + décodage continu (BarcodeDetector si présent, sinon lecteur intégré js/qrscan.js) */
      let stream = null, iv = null, det = null, busy = false, flip = 0;
      const cv = document.createElement('canvas'), cx2 = cv.getContext('2d', { willReadFrequently: true });
      const frameTick = async () => {
        if (!stream || busy || !video.videoWidth || document.hidden) return; busy = true;
        try {
          let txt = null;
          if (det) { const r = await det.detect(video); if (r && r.length) txt = r[0].rawValue; }
          if (!txt && typeof QRScan !== 'undefined') {
            const vw = video.videoWidth, vh = video.videoHeight; let sx = 0, sy = 0, sw = vw, sh = vh;
            flip ^= 1; if (flip) { sw = Math.round(vw * .55); sh = Math.round(vh * .55); sx = (vw - sw) >> 1; sy = (vh - sh) >> 1; }   // une image sur deux : centre en pleine résolution
            const k = Math.min(1, 640 / Math.max(sw, sh)), w = Math.round(sw * k), h = Math.round(sh * k);
            if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
            cx2.drawImage(video, sx, sy, sw, sh, 0, 0, w, h); txt = QRScan.decode(cx2.getImageData(0, 0, w, h));
          }
          if (txt) handle(txt, 'cam');
        } catch (e) {} finally { busy = false; }
      };
      const camOff = () => { clearInterval(iv); iv = null; if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; video.srcObject = null; };
      const camOn = async () => {
        cmsg.style.display = ''; cmsg.textContent = 'Activation de la caméra…';
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('caméra non disponible sur ce navigateur');
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
          video.srcObject = stream; video.muted = true; video.playsInline = true; await video.play();
          if (!det && 'BarcodeDetector' in window) { try { const F = await BarcodeDetector.getSupportedFormats(); if (F.includes('qr_code')) det = new BarcodeDetector({ formats: ['qr_code'] }); } catch (e) {} }
          cmsg.style.display = 'none'; $('#cx-cam').textContent = '⏸ Arrêter la caméra'; iv = setInterval(frameTick, 100);
        } catch (e) { camOff(); cmsg.style.display = ''; cmsg.innerHTML = `📷 Caméra indisponible<br><small style="font-weight:600">(${esc(e.message || e.name || 'accès refusé')})</small><br><br>Tapez le numéro du dossard sur le pavé.`; $('#cx-cam').textContent = '📷 Réessayer la caméra'; }
      };
      $('#cx-cam').onclick = () => { if (stream) { camOff(); cmsg.style.display = ''; cmsg.textContent = '📷 Caméra arrêtée'; $('#cx-cam').textContent = '📷 Activer la caméra'; } else camOn(); };
      stopCam = () => { camOff(); if (window.__cxUI === flash) window.__cxUI = null; };
      drawStarts(); drawLast(); disp();
      clockIv = setInterval(tick, 250);
      camOn();
      scanRefresh = () => { drawStarts(); drawLast(); };
    }
    let scanRefresh = null;

    /* ---------- 🏆 Classements ---------- */
    function rank(box, E) {
      const K = compute(E);
      if (!E.courses.some(c => c.id === rc)) rc = (E.courses[0] || {}).id || '';
      let T = null;
      const head = `<div class="seg">${[['course', 'Par course'], ['niveau', 'Par niveau'], ['classes', 'Classes']].map(([k, l]) => `<button data-rv="${k}" class="${rv === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
      let sub = '';
      if (rv === 'course') {
        sub = `<div class="cx-cls">${E.courses.map(c => `<button data-rc="${c.id}" class="${c.id === rc ? 'on' : ''}">${esc(c.name)}</button>`).join('')}</div>`;
        const x = K.courses.find(x => x.c.id === rc); if (x) T = courseTable(x);
      } else if (rv === 'niveau') {
        sub = `<div class="cx-cls">${LV.map(l => `<button data-rl="${l}" class="${rl === l ? 'on' : ''}">${LVN[l]}</button>`).join('')}</div><div class="cx-cls">${[['', 'Tous'], ['F', 'Filles'], ['G', 'Garçons']].map(([k, l]) => `<button data-rs="${k}" class="${rsx === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
        T = levelTable(E, K, rl, rsx);
      } else {
        sub = `<div class="cx-cls">${LV.map(l => `<button data-rl="${l}" class="${rl === l ? 'on' : ''}">${LVN[l]}</button>`).join('')}</div>
          <div class="row" data-cfg="bare" style="align-items:center;margin-top:8px"><label style="margin:0;flex:2">Nombre de places retenues par classe (X)</label><input id="cx-topn" type="number" min="1" max="35" value="${E.topN}" style="flex:0 0 80px"></div>`;
        T = classTable(E, K, rl);
      }
      box.innerHTML = `<div class="card">${head}${sub}</div>
        ${T ? `<div class="section-title"><h2>${esc(T.title)}</h2></div>${T.note ? `<p class="muted" style="margin:-4px 2px 8px;font-size:.8rem">${esc(T.note)}</p>` : ''}
          <div class="card sheet-table cx-rk" style="margin-top:0">${T.rows.length ? `<table><tr>${T.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${T.rows.map((r, i) => `<tr>${r.map((v, j) => `<td class="${j === 2 || (rv === 'classes' && j === 1) ? 'nmc' : ''}">${j === 0 && typeof v === 'number' && v <= 3 ? ['🥇', '🥈', '🥉'][v - 1] : j === 2 || (rv === 'classes' && j === 1) ? `<b>${esc(v)}</b>` : esc(v)}</td>`).join('')}</tr>`).join('')}</table>` : '<div class="empty">Aucun résultat pour l\'instant.</div>'}</div>` : ''}
        <div class="row" style="margin-top:12px"><button class="btn btn-ghost" id="cx-csv">📤 Exporter CSV</button><button class="btn btn-ghost" id="cx-pr">🖨 Imprimer</button><button class="btn btn-ghost" id="cx-pall">🖨 Tout imprimer</button></div>
        <button class="btn btn-grad btn-block" data-cfg="bare" style="margin-top:10px" id="cx-save">💾 Envoyer dans « Résultats des élèves »</button>`;
      const $ = s => box.querySelector(s);
      box.querySelectorAll('[data-rv]').forEach(b => b.onclick = () => { rv = b.dataset.rv; again(); });
      box.querySelectorAll('[data-rc]').forEach(b => b.onclick = () => { rc = b.dataset.rc; again(); });
      box.querySelectorAll('[data-rl]').forEach(b => b.onclick = () => { rl = b.dataset.rl; again(); });
      box.querySelectorAll('[data-rs]').forEach(b => b.onclick = () => { rsx = b.dataset.rs; again(); });
      if ($('#cx-topn')) $('#cx-topn').onchange = e => { E.topN = Math.max(1, Math.min(35, +e.target.value || 10)); commit(); again(); };
      const all = () => [...K.courses.map(courseTable), ...LV.flatMap(l => E.classes.some(c => lvOf(E, c) === l) ? [classTable(E, K, l), levelTable(E, K, l, '')] : [])];
      $('#cx-csv').onclick = () => { const L = [T || { title: '', head: [], rows: [] }];
        download(`cross-${E.name}-${T ? T.title : ''}.csv`.replace(/[^\w.-]+/g, '-'), csv(L.flatMap(t => [[t.title], t.head, ...t.rows]))); };
      $('#cx-pr').onclick = () => { if (!T) return; printPreview(T.title, rankDoc(E, [T])); };
      $('#cx-pall').onclick = () => printPreview('Classements', rankDoc(E, all()));
      $('#cx-save').onclick = () => { const n = sendResults(E); if (n) toast(`${n} résultat${n > 1 ? 's' : ''} envoyé${n > 1 ? 's' : ''} ✔`); };
    }

    const onRemote = () => { if (!el.isConnected || document.getElementById('pin-ov') || document.querySelector('.cx-pv')) return;
      const a = document.activeElement; if (a && el.contains(a) && /INPUT|SELECT|TEXTAREA/.test(a.tagName)) return;
      if (tab === 'scan' && scanRefresh) { const E = cur(); if (E && E.id === getCur()) { scanRefresh(); return; } }
      again(); };
    window.addEventListener('eps-remote', onRemote);
    frame();
    return () => { stopAll(); clearTimeout(flashT); window.removeEventListener('eps-remote', onRemote); document.querySelectorAll('.cx-pv').forEach(o => o.remove()); };
  };

  /* Envoi dans « Résultats des élèves » (remplace un envoi précédent du même cross) */
  function sendResults(E) {
    const K = compute(E), R = K.courses.flatMap(x => x.R.map(r => ({ r, n: x.R.length })));
    if (!R.length) { toast('Aucun élève arrivé'); return 0; }
    if (!confirm(`Enregistrer le résultat de ${R.length} élève${R.length > 1 ? 's' : ''} dans « Résultats des élèves » ?`)) return 0;
    DB.resultats = DB.resultats || [];
    const K2 = new Set(R.map(({ r }) => r.s.cls + '|' + r.s.name));
    DB.resultats = DB.resultats.filter(x => !(x.tool === 'cross' && x.label === E.name && K2.has(x.classe + '|' + x.eleve)));
    const now = Date.now();
    R.forEach(({ r, n }) => DB.resultats.push({ date: now, tool: 'cross', label: E.name, classe: r.s.cls, eleve: r.s.name,
      valeur: r.c.mode === 'temps' ? `${r.laps} tour${r.laps > 1 ? 's' : ''} (${r.dist} m)` : tm(r.time),
      detail: `${r.c.name} · ${r.place}${r.place === 1 ? 'er' : 'e'}/${n}${r.c.mode === 'temps' ? '' : ' · ' + r.c.dist + ' m'} · ${km(r.speed)} km/h` }));
    save(); window.syncFlush && window.syncFlush();
    return R.length;
  }

  /* API pour les autres outils (Résultats collectifs) et les tests */
  window.CROSS = { events: () => X().events, compute, classRank, levelRank, handle, parse, record, sendResults, lvOf: (E, c) => lvOf(E, c), dev: () => DEV, perf, tm };
})();
