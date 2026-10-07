/* =========================================================
   EPS ONE — Mes classes : import CSV / Excel + ajout d'élève
   Lecture hors ligne : .csv, .txt, .xlsx (Excel), .xls (export HTML)
   ========================================================= */

const TPF = () => window.teamProfOf ? teamProfOf() : undefined;   // mode Équipe : enseignant actif

/* ---------- Lecture des fichiers ---------- */
function decodeText(buf) {
  let t = new TextDecoder('utf-8').decode(buf);
  if (t.includes('�')) t = new TextDecoder('windows-1252').decode(buf); // CSV Excel « à la française »
  return t.replace(/^﻿/, '');
}
function parseCSV(text) {
  const first = text.split(/\r?\n/).find(l => l.trim()) || '';
  const sep = [';', '\t', ','].map(s => [s, first.split(s).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.map(r => r.map(c => c.trim())).filter(r => r.some(c => c));
}
async function unzip(buf) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf), files = {};
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Fichier Excel illisible');
  let p = dv.getUint32(eocd + 16, true); const n = dv.getUint16(eocd + 10, true);
  for (let k = 0; k < n; k++) {
    const method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true),
      xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl));
    files[name] = { method, size, off };
    p += 46 + nl + xl + cl;
  }
  const read = async name => {
    const f = files[name]; if (!f) return null;
    const start = f.off + 30 + dv.getUint16(f.off + 26, true) + dv.getUint16(f.off + 28, true);
    const data = u8.subarray(start, start + f.size);
    if (f.method === 0) return new TextDecoder().decode(data);
    const ds = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return await new Response(ds).text();
  };
  return { names: Object.keys(files), read };
}
async function parseXLSX(buf) {
  const z = await unzip(buf), X = s => new DOMParser().parseFromString(s, 'application/xml');
  const tagText = el => [...el.getElementsByTagName('t')].map(t => t.textContent).join('');
  const ssXml = await z.read('xl/sharedStrings.xml');
  const shared = ssXml ? [...X(ssXml).getElementsByTagName('si')].map(tagText) : [];
  const wb = X(await z.read('xl/workbook.xml'));
  const relsXml = await z.read('xl/_rels/workbook.xml.rels');
  const rels = {}; if (relsXml) [...X(relsXml).getElementsByTagName('Relationship')].forEach(r => rels[r.getAttribute('Id')] = r.getAttribute('Target'));
  const colIdx = ref => { let n = 0; for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
  const sheets = [];
  for (const s of wb.getElementsByTagName('sheet')) {
    const rid = s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
    let target = rels[rid] || `worksheets/sheet${sheets.length + 1}.xml`;
    target = target.replace(/^\/?xl\//, '').replace(/^\//, '');
    const xml = await z.read('xl/' + target); if (!xml) continue;
    const rows = [];
    for (const r of X(xml).getElementsByTagName('row')) {
      const row = [];
      for (const c of r.getElementsByTagName('c')) {
        const t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0]?.textContent ?? '';
        const val = t === 's' ? shared[+v] ?? '' : t === 'inlineStr' ? tagText(c) : v;
        row[colIdx(c.getAttribute('r') || '')] = String(val).trim();
      }
      rows.push(Array.from(row, x => x ?? ''));
    }
    sheets.push({ name: s.getAttribute('name'), rows: rows.filter(r => r.some(c => c)) });
  }
  return sheets.filter(s => s.rows.length);
}
function parseHTMLTable(text) {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return [...doc.querySelectorAll('table')].map((t, i) => ({ name: 'Tableau ' + (i + 1),
    rows: [...t.rows].map(r => [...r.cells].map(c => c.textContent.trim())).filter(r => r.some(c => c)) })).filter(s => s.rows.length);
}
async function readClassFile(file) {
  const buf = await file.arrayBuffer(), u8 = new Uint8Array(buf);
  const NUMBERS_MSG = 'Fichier Numbers : il faut d\'abord l\'exporter en Excel.\n\n'
    + 'Sur iPad / iPhone : ouvrez le fichier dans Numbers → bouton « … » → Exporter → Excel, puis enregistrez-le dans Fichiers.\n\n'
    + 'Sur Mac : Numbers → menu Fichier → Exporter vers → Excel…\n\n'
    + 'Importez ensuite le fichier .xlsx obtenu.';
  if (/\.numbers$/i.test(file.name)) throw new Error(NUMBERS_MSG);
  if (u8[0] === 0x50 && u8[1] === 0x4B) {
    const z = await unzip(buf);
    if (z.names.some(n => /^Index\/.*\.iwa$/.test(n))) throw new Error(NUMBERS_MSG);
    return parseXLSX(buf);                                                                     // .xlsx
  }
  if (u8[0] === 0xD0 && u8[1] === 0xCF) throw new Error('Ancien format Excel (.xls 97-2003). Dans Excel ou Numbers, enregistrez le fichier en .xlsx ou .csv puis réessayez.');
  const text = decodeText(buf);
  if (/^\s*</.test(text)) return parseHTMLTable(text);                                         // .xls exporté en HTML
  return [{ name: file.name.replace(/\.[^.]+$/, ''), rows: parseCSV(text) }];
}

/* ---------- Écran d'import ---------- */
function openClassImport(el, sheets, fileName, back, dest0) {
  let dest = dest0 || 'eps';
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const guess = (hdr, keys, not = []) => hdr.findIndex(h => { const x = norm(h); return keys.some(k => x.includes(k)) && !not.some(k => x.includes(k)); });
  let si = 0;
  const draw = () => {
    const sh = sheets[si], rows = sh.rows;
    const hi = Math.max(0, rows.slice(0, 10).findIndex(r => r.some(c => /nom|eleve|prenom|classe|division/.test(norm(c)))));
    const hdr = rows[hi] || [], width = Math.max(...rows.map(r => r.length));
    const cols = Array.from({ length: width }, (_, k) => hdr[k] || `Colonne ${String.fromCharCode(65 + k)}`);
    let cNom = guess(hdr, ['nom', 'eleve'], ['prenom']), cPre = guess(hdr, ['prenom']), cCla = guess(hdr, ['classe', 'division', 'groupe']);
    if (cNom < 0) cNom = 0;
    const opt = (sel, none) => `${none ? '<option value="-1">— aucune —</option>' : ''}${cols.map((c, k) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${esc(c)}</option>`).join('')}`;
    el.innerHTML = `<div class="card"><h3>📥 Importer « ${esc(fileName)} »</h3>
        ${sheets.length > 1 ? `<label>Feuille</label><select id="sh">${sheets.map((s, k) => `<option value="${k}" ${k === si ? 'selected' : ''}>${esc(s.name)} (${s.rows.length} lignes)</option>`).join('')}</select>
          <label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="per" style="width:auto"> Une classe par feuille (nom de la classe = nom de la feuille)</label>` : ''}
        <label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="hd" ${hi >= 0 && hdr.some(c => /nom|prenom|classe/.test(norm(c))) ? 'checked' : ''} style="width:auto"> La ligne ${hi + 1} contient les titres des colonnes</label>
        <div class="row"><div><label>Colonne NOM</label><select id="cn">${opt(cNom)}</select></div><div><label>Colonne Prénom</label><select id="cp">${opt(cPre, true)}</select></div></div>
        <label>Colonne Classe (si le fichier contient plusieurs classes)</label><select id="cc">${opt(cCla, true)}</select>
        <div id="cnw"><label>Nom de la classe</label><input id="cname" value="${esc(sheets.length > 1 ? sh.name : fileName.replace(/\.[^.]+$/, ''))}"></div>
        <label>Ranger dans</label><div class="seg" id="dst"><button data-dst="eps" class="${dest === 'eps' ? 'on' : ''}">🏃 Mes classes EPS</button><button data-dst="unss" class="${dest === 'unss' ? 'on' : ''}">🏅 UNSS / AS</button><button data-dst="all" class="${dest === 'all' ? 'on' : ''}">🏫 Autres classes</button></div>
        <p class="muted" style="margin:4px 0 0;font-size:.78rem" id="dsth"></p>
        <label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="mg" checked style="width:auto"> Si la classe existe déjà : ajouter seulement les nouveaux élèves</label></div>
      <div class="section-title"><h2>Aperçu</h2></div><div class="card" id="pv"></div>
      <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="ok">✔ Importer</button><button class="btn btn-ghost" id="ko">Annuler</button></div>`;
    const $ = s => el.querySelector(s);
    const orig = {};
    const build = () => {
      const U = dest === 'unss', per = !U && $('#per')?.checked, useHd = $('#hd').checked, n = +$('#cn').value, p = +$('#cp').value, c = +$('#cc').value;
      $('#cnw').style.display = U || !(c >= 0 || per) ? 'block' : 'none';
      $('#cnw label').textContent = U ? 'Nom du groupe UNSS / AS' : 'Nom de la classe';
      if (U && (!$('#cname').dataset.u)) { $('#cname').dataset.u = 1; $('#cname').value = 'UNSS mercredi'; }
      $('#dsth').textContent = U ? 'Tous les élèves du fichier forment UN groupe (ex. « UNSS mercredi »), utilisable dans tous les outils ; la colonne Classe sert seulement à retenir la classe de chaque élève.' : dest === 'all' ? 'Les « autres classes » ne servent qu\'au Cross : elles n\'apparaissent pas dans les outils.' : 'Classes proposées dans tous les outils.';
      const src = per ? sheets.map(s => ({ s, rows: s.rows })) : [{ s: sh, rows }];
      const out = new Map();
      src.forEach(({ s, rows: rr }) => {
        const start = useHd ? (per ? Math.max(0, rr.slice(0, 10).findIndex(r => r.some(x => /nom|prenom/.test(norm(x))))) + 1 : hi + 1) : 0;
        rr.slice(start).forEach(r => {
          const nom = (r[n] || '').trim(), pre = p >= 0 ? (r[p] || '').trim() : '';
          const full = [nom, pre].filter(Boolean).join(' ').replace(/\s+/g, ' ');
          if (!full) return;
          const cls = U ? ($('#cname').value.trim() || 'UNSS') : per ? s.name : c >= 0 ? (r[c] || '').trim() || 'Sans classe' : ($('#cname').value.trim() || 'Nouvelle classe');
          if (U && c >= 0 && (r[c] || '').trim()) orig[full] = (r[c] || '').trim();
          if (!out.has(cls)) out.set(cls, []);
          if (!out.get(cls).includes(full)) out.get(cls).push(full);
        });
      });
      return out;
    };
    const preview = () => { const out = build();
      $('#pv').innerHTML = out.size ? [...out].map(([k, v]) => `<div class="list-item" style="padding:8px 0"><div><b>${esc(k)}</b> — ${v.length} élèves${DB.classes.some(x => x.name === k) ? ' <span class="pill">existe déjà · EPS</span>' : otherClasses().some(x => x.name === k) ? ' <span class="pill">existe déjà · autres</span>' : ''}<div class="muted">${v.slice(0, 4).map(esc).join(', ')}${v.length > 4 ? '…' : ''}</div></div></div>`).join('') : '<div class="empty">Aucun élève trouvé : vérifiez les colonnes choisies.</div>'; };
    ['#hd', '#cn', '#cp', '#cc', '#per', '#cname', '#mg'].forEach(s => { const e = $(s); if (e) e.oninput = e.onchange = preview; });
    el.querySelectorAll('[data-dst]').forEach(b => b.onclick = () => { dest = b.dataset.dst; el.querySelectorAll('[data-dst]').forEach(x => x.classList.toggle('on', x === b)); preview(); });
    if ($('#sh')) $('#sh').onchange = () => { si = +$('#sh').value; draw(); };
    $('#ko').onclick = back;
    $('#ok').onclick = () => {
      const out = build(); if (!out.size) return toast('Aucun élève à importer');
      let nc = 0, ne = 0;
      out.forEach((names, cls) => {
        const ex = DB.classes.find(x => x.name === cls) || otherClasses().find(x => x.name === cls);
        if (dest === 'unss') { const o = {}; names.forEach(x => { if (orig[x]) o[x] = orig[x]; }); if (ex) ex.orig = { ...(ex.orig || {}), ...o }; else { DB.classes.push({ name: cls, students: names, unss: 1, orig: o, ...(TPF() ? { prof: TPF() } : {}) }); nc++; ne += names.length; return; } }
        if (!ex) { (dest === 'all' ? otherClasses() : DB.classes).push({ name: cls, students: names, ...(dest !== 'all' && TPF() ? { prof: TPF() } : {}) }); nc++; ne += names.length; }
        else if ($('#mg').checked) { const add = names.filter(x => !ex.students.includes(x)); ex.students.push(...add); ne += add.length; }
        else { ex.students = names; ne += names.length; }
      });
      save(); toast(`${ne} élève${ne > 1 ? 's' : ''} importé${ne > 1 ? 's' : ''}${nc ? ` · ${nc} classe${nc > 1 ? 's' : ''} créée${nc > 1 ? 's' : ''}` : ''} ✔`); back();
    };
    preview();
  };
  draw();
}

/* ---------- Outil « Mes classes » (remplace la version d'origine) ---------- */
TOOL_IMPL.classes = function (el) {
  const draw = () => {
    const TEAM = window.teamOn && teamOn(), O = otherClasses(), EPS = DB.classes.map((c, i) => ({ c, i })).filter(x => !x.c.unss), UN = DB.classes.map((c, i) => ({ c, i })).filter(x => x.c.unss);
    const origTxt = c => { const v = [...new Set(Object.values(c.orig || {}))].sort((a, b) => a.localeCompare(b, 'fr', { numeric: true })); return v.length ? ' · ' + esc(v.join(', ')) : ''; };
    const item = (c, i, kind) => `<div class="list-item"><div style="flex:1;min-width:0"><b>${esc(c.name)}</b><div class="muted">${c.students.length} élèves${kind === 'unss' ? origTxt(c) : ''}</div>${kind !== 'all' && TEAM ? `<select data-pf="${i}" style="margin-top:6px;padding:6px 8px;font-size:.82rem;width:auto;max-width:100%"><option value="">👥 Commune (toute l'équipe)</option>${teamProfs().map(p => `<option value="${esc(p.id)}" ${c.prof === p.id ? 'selected' : ''}>👤 ${esc(p.name)}</option>`).join('')}</select>` : ''}</div><div class="row" style="flex:0 0 auto;gap:6px;flex-wrap:nowrap">${kind !== 'all' ? `<button class="btn btn-grad" style="padding:9px 11px;white-space:nowrap;font-size:.85rem" data-a="${i}" title="Ajouter un élève">＋ Élève</button>` : ''}${kind === 'unss' ? '' : `<button class="btn btn-ghost" style="padding:9px 10px;white-space:nowrap;font-size:.8rem" data-mv="${kind}:${i}" title="${kind === 'eps' ? 'Déplacer vers Autres classes' : 'Déplacer vers Mes classes EPS'}">${kind === 'eps' ? '→ 🏫' : '→ 🏃 EPS'}</button>`}<button class="btn btn-ghost" style="padding:9px 10px" data-e="${kind}:${i}">✏️</button><button class="btn btn-ghost" style="padding:9px 10px" data-d="${kind}:${i}">🗑</button></div></div>`;
    el.innerHTML = `<div class="card" style="display:flex;align-items:center;gap:12px;background:var(--grad-soft)"><div style="flex:1"><div class="muted">Année scolaire</div><b style="font-size:1.15rem;white-space:nowrap">${esc(DB.annee || '')}</b></div><button class="btn btn-grad" style="flex:0 0 auto;font-size:.85rem;padding:10px 12px" id="ny">🗓 Nouvelle année</button></div>
      <div class="card" style="margin-top:12px"><h3>Importer des classes</h3><p class="muted" style="margin:4px 0 10px">Fichier CSV ou Excel (.xlsx) : export Pronote, ENT ou tableur. Une ou plusieurs classes à la fois. Fichier Numbers : l'app vous indique comment l'exporter en Excel.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px"><button class="btn btn-grad" id="imp">📥 Mes classes EPS</button><button class="btn btn-ghost" id="imp3">📥 Liste UNSS / AS</button><button class="btn btn-ghost" id="imp2">📥 Autres classes du collège</button></div><input type="file" id="f" accept=".csv,.txt,.xlsx,.xls,.numbers,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" hidden></div>
      <div class="card" style="margin-top:12px"><h3>Nouvelle classe</h3><label>Nom</label><input id="cn" placeholder="ex : 6E1">
      <label>Élèves (un par ligne, ou collés depuis un tableur)</label><textarea id="cl" placeholder="DUPONT Léa&#10;MARTIN Hugo"></textarea>
      <label>Ranger dans</label><div class="seg" id="ndst"><button data-nd="eps" class="on">🏃 Classe EPS</button><button data-nd="unss">🏅 UNSS / AS</button><button data-nd="all">🏫 Autres classes</button></div>
      <button class="btn btn-grad btn-block" style="margin-top:10px" id="add">＋ Enregistrer la classe</button></div>
      <div class="section-title"><h2>🏃 ${TEAM ? 'Classes EPS de l\'équipe' : 'Mes classes EPS'} (${EPS.length})</h2></div>
      <p class="muted" style="margin:-4px 4px 8px;font-size:.8rem">${TEAM ? 'Choisissez l\'enseignant de chaque classe : il ne voit que les siennes (et les classes communes) dans les outils.' : 'Classes proposées dans tous les outils.'}</p>
      <div class="card" style="padding:0">${EPS.length ? EPS.map(x => item(x.c, x.i, 'eps')).join('') : '<div class="empty">Aucune classe enregistrée.</div>'}</div>
      <div class="section-title"><h2>🏅 UNSS / AS (${UN.length})</h2></div>
      <p class="muted" style="margin:-4px 4px 8px;font-size:.8rem">Groupes d'élèves de plusieurs classes (ex. « UNSS mercredi »), proposés dans tous les outils comme une classe.</p>
      <div class="card" style="padding:0">${UN.length ? UN.map(x => item(x.c, x.i, 'unss')).join('') : '<div class="empty">Aucun groupe. Importez la liste des inscrits avec « 📥 Liste UNSS / AS » (colonnes Nom, Prénom, Classe).</div>'}</div>
      <div class="section-title"><h2>🏫 Autres classes du collège (${O.length})</h2></div>
      <p class="muted" style="margin:-4px 4px 8px;font-size:.8rem">Classes des collègues, utilisées uniquement pour le Cross (qui voit toutes les classes). Elles n'encombrent pas vos autres outils.</p>
      <div class="card" style="padding:0">${O.length ? O.map((c, i) => item(c, i, 'all')).join('') : '<div class="empty">Aucune pour l\'instant. Importez le fichier de toutes les classes avec « 📥 Autres classes du collège ».</div>'}</div>
      ${O.length ? '<button class="btn btn-ghost btn-block" style="margin-top:10px" id="delall">🗑 Supprimer toutes les autres classes</button>' : ''}`;
    const $ = s => el.querySelector(s), L = k => k === 'all' ? otherClasses() : DB.classes;   // 'eps' et 'unss' : même tableau (DB.classes, drapeau unss)
    let dest = 'eps', nd = 'eps';
    $('#ny').onclick = () => openNewYear('classes');
    $('#imp').onclick = () => { dest = 'eps'; $('#f').click(); };
    $('#imp2').onclick = () => { dest = 'all'; $('#f').click(); };
    $('#imp3').onclick = () => { dest = 'unss'; $('#f').click(); };
    $('#f').onchange = async () => {
      const inp = $('#f'), file = inp.files[0]; if (!file) return; inp.value = '';
      try { const sheets = await readClassFile(file); if (!sheets.length) throw new Error('Aucune donnée trouvée dans ce fichier.'); openClassImport(el, sheets, file.name, draw, dest); }
      catch (e) { alert(e.message || 'Fichier illisible'); }
    };
    el.querySelectorAll('[data-nd]').forEach(b => b.onclick = () => { nd = b.dataset.nd; el.querySelectorAll('[data-nd]').forEach(x => x.classList.toggle('on', x === b)); });
    $('#add').onclick = () => { const name = $('#cn').value.trim(), st = namesFrom('cl');
      if (!name || !st.length) return toast('Nom et élèves requis');
      const ex = DB.classes.find(c => c.name === name) || otherClasses().find(c => c.name === name);
      if (ex) ex.students = st; else L(nd).push({ name, students: st, ...(nd === 'unss' ? { unss: 1 } : {}), ...(nd !== 'all' && TPF() ? { prof: TPF() } : {}) });
      save(); toast('Classe enregistrée ✔'); draw(); };
    el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const c = DB.classes[b.dataset.a], n = (prompt(`Nouvel élève en ${c.name} (NOM Prénom) :`) || '').trim().replace(/\s+/g, ' ');
      if (!n) return; if (c.students.includes(n)) return toast('Cet élève est déjà dans la classe');
      c.students.push(n); save(); toast(`${n} ajouté·e en ${c.name} ✔`); draw(); });
    const ref = v => { const [k, i] = v.split(':'); return { k, i: +i, A: L(k) }; };
    el.querySelectorAll('[data-mv]').forEach(b => b.onclick = () => { const { k, i, A } = ref(b.dataset.mv), c = A.splice(i, 1)[0]; window.epsClsDeleted && epsClsDeleted(k === 'all' ? 'classesAll' : 'classes', c); L(k === 'eps' ? 'all' : 'eps').push(c);
      save(); toast(`${c.name} → ${k === 'eps' ? 'Autres classes' : 'Mes classes EPS'}`); draw(); });
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (confirm('Supprimer cette classe ?')) { const { k, i, A } = ref(b.dataset.d); window.epsClsDeleted && epsClsDeleted(k === 'all' ? 'classesAll' : 'classes', A[i]); A.splice(i, 1); save(); draw(); } });
    el.querySelectorAll('[data-e]').forEach(b => b.onclick = () => { const { k, i, A } = ref(b.dataset.e), c = A[i]; $('#cn').value = c.name; $('#cl').value = c.students.join('\n');
      nd = k === 'eps' && c.unss ? 'unss' : k; el.querySelectorAll('[data-nd]').forEach(x => x.classList.toggle('on', x.dataset.nd === nd)); $('#cn').scrollIntoView({ behavior: 'smooth' }); });
    el.querySelectorAll('[data-pf]').forEach(sl => sl.onchange = () => { const c = DB.classes[+sl.dataset.pf]; if (sl.value) c.prof = sl.value; else delete c.prof; save(); toast(`${c.name} → ${sl.value ? teamProfs().find(p => p.id === sl.value).name : 'commune'}`); });
    if ($('#delall')) $('#delall').onclick = () => { if (!confirm(`Supprimer les ${otherClasses().length} autres classes du collège ?\nVos classes EPS sont conservées.`)) return; DB.classesAll = []; save(); draw(); };
  };
  draw();
};
