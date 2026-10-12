/* =========================================================
   EPS ONE — Copies de secours & protection des classes
   1) Une copie de secours automatique par jour (7 derniers jours),
      sur cet appareil (IndexedDB « epsone-bak »), sans les photos.
      Plus → Copies de secours : restaurer les classes seulement,
      tout restaurer, ou télécharger la copie (fichier JSON).
   2) Garde des classes : si une synchronisation (autre tablette,
      Firebase, Drive, Dropbox) fait disparaître des classes, elles
      sont mises de côté et un bandeau propose de les restaurer.
   ========================================================= */
(() => {
  const BAK_DB = 'epsone-bak', KEEP = 12, LOST = 'epsone_cls_lost', IMG = /^(acroImg_|gymImg_|escImg_|danseImg_)/;
  const CK = ['classes', 'classesAll'];
  const day = (t = Date.now()) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const getK = k => window.dbGet ? dbGet(k) : DB[k];
  const setK = (k, v) => window.dbSet ? dbSet(k, v) : (DB[k] = v);
  const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  /* ---------- IndexedDB ---------- */
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((ok, ko) => { const r = indexedDB.open(BAK_DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('b'); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); }));
  const tx = (mode, fn) => open().then(db => new Promise((ok, ko) => { const t = db.transaction('b', mode), st = t.objectStore('b'), out = fn(st); t.oncomplete = () => ok(out instanceof IDBRequest ? out.result : out); t.onerror = () => ko(t.error); }));
  const bakAll = () => open().then(db => new Promise((ok, ko) => { const L = [], r = db.transaction('b').objectStore('b').openCursor();
    r.onsuccess = () => { const c = r.result; if (c) { L.push({ k: c.key, ...c.value }); c.continue(); } else ok(L.sort((a, b) => b.t - a.t)); }; r.onerror = () => ko(r.error); }));
  // Copie des données (sans les photos, déjà rangées à part)
  const snapJSON = () => { const o = JSON.parse(JSON.stringify(DB)); Object.keys(o).forEach(k => { if (IMG.test(k)) delete o[k]; }); return JSON.stringify(o); };
  const stats = j => { try { const o = JSON.parse(j); return { nc: (o.classes || []).length + (o.classesAll || []).length, nr: (o.resultats || []).length }; } catch (e) { return { nc: 0, nr: 0 }; } };

  async function dailyBackup(force) {
    try {
      const k = day(); if (!force) { const have = await tx('readonly', st => st.get(k)); if (have) return; }
      const j = snapJSON(); if ((JSON.parse(j).classes || []).length === 0 && !force) return;   // rien d'utile à garder
      await tx('readwrite', st => st.put({ t: Date.now(), j, ...stats(j) }, k));
      const L = await bakAll(); if (L.length > KEEP) await tx('readwrite', st => L.slice(KEEP).forEach(x => st.delete(x.k)));
    } catch (e) { /* stockage indisponible : on ignore */ }
  }
  window.epsBackupNow = () => dailyBackup(true);
  // Copie de sécurité juste avant qu'une synchronisation fasse DIMINUER des données de cet appareil (au plus 5 conservées)
  window.epsSafetyBackup = async why => {
    try { const j = snapJSON(), t = Date.now(); await tx('readwrite', st => st.put({ t, j, ...stats(j), why }, 'sync-' + t));
      const L = (await bakAll()).filter(x => String(x.k).startsWith('sync-')); if (L.length > 5) await tx('readwrite', st => L.slice(5).forEach(x => st.delete(x.k))); } catch (e) {}
  };
  // au démarrage, avant que la synchronisation n'apporte des changements
  try { dailyBackup(); } catch (e) {}

  /* ---------- Garde des classes ---------- */
  /* Suppressions VOLONTAIRES faites sur cet appareil (Mes classes, nouvelle année…) :
     seules celles-ci peuvent retirer une classe du compte. Une classe absente de cet appareil
     pour une autre raison (appareil resté en retard, mémoire pleine, app fermée trop tôt…)
     est gardée lors de la synchronisation au lieu d'être effacée partout. */
  const DEL = 'epsone_cls_del', DEL_DAYS = 45;
  window.epsClsDeleted = (k, c) => { if (!c || !c.name) return; const o = lsGet(DEL, {}); o[k + '|' + c.name] = Date.now(); lsSet(DEL, o); };
  const delOK = (k, n) => { const t = lsGet(DEL, {})[k + '|' + n]; return t && Date.now() - t < DEL_DAYS * 864e5; };
  // out = résultat de la fusion ; rem = version du serveur / cloud
  /* ---------- Garde générale : la synchronisation ne supprime plus rien « toute seule » ----------
     Une suppression est VOLONTAIRE si elle est faite sur cet appareil pendant qu'on utilise l'app : elle est
     détectée à chaque enregistrement (un élément identifié, ou une clé d'objet, qui disparaît) et notée dans
     un carnet de suppressions. Lors d'une synchronisation, tout élément que le serveur possède encore et que la
     fusion ferait disparaître est remis, sauf s'il figure dans le carnet. Valable pour toutes les rubriques. */
  const TOMB_DB = 'epsone-tomb', TOMB_DAYS = 45, TOMB_MAX = 30000, MAXD = 4;
  let TOMB = {}, tombDirty = false, SNAP = {};
  const hsh = str => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const ikey = (x, d) => { if (!x || typeof x !== 'object' || Array.isArray(x)) return null; const k = x.id != null ? 'id:' + x.id : x.k != null ? 'k:' + x.k : x.name != null ? 'name:' + x.name : x.nom != null ? 'nom:' + x.nom : null;
    if (k != null || d > 1) return k; try { const j = JSON.stringify(x); return j.length < 1500 ? 'j:' + hsh(j) : null; } catch (e) { return null; } };   // sans identifiant (ex. anciens résultats) : empreinte du contenu, aux 2 premiers niveaux
  const isO = x => x && typeof x === 'object' && !Array.isArray(x);
  const SKIP = k => /^(recent|recentBy|envois|lastClass|natLanes|natMode|acroFiltre|matchTeams|tablette)$/.test(k) || IMG.test(k);
  function walk(v, p, d, out) {
    if (d > MAXD || !v || typeof v !== 'object') return;
    if (Array.isArray(v)) { if (v.length > 6000) return; for (const x of v) { const k = ikey(x, d); if (k == null) continue; const q = p + '/' + k; out.add(q); walk(x, q, d + 1, out); } }
    else for (const k of Object.keys(v)) { if (k[0] === '_') continue; const c = v[k]; if (!c || typeof c !== 'object') continue; const q = p + '/' + k; out.add(q); walk(c, q, d + 1, out); }
  }
  const snapOf = k => { const o = new Set(); try { walk(getK(k), k, 0, o); } catch (e) {} return o; };
  window.epsSnapKey = k => { if (!SKIP(k)) SNAP[k] = snapOf(k); };       // appelé après chaque écriture venant de la synchronisation : ce n'est pas une suppression volontaire
  const tombPut = () => { tombDirty = true; clearTimeout(tombPut.t); tombPut.t = setTimeout(async () => { if (!tombDirty) return; tombDirty = false;
    try { const db = await new Promise((ok, ko) => { const r = indexedDB.open(TOMB_DB, 1); r.onupgradeneeded = () => r.result.createObjectStore('b'); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
      await new Promise((ok, ko) => { const t = db.transaction('b', 'readwrite'); t.objectStore('b').put(JSON.stringify(TOMB), 'tomb'); t.oncomplete = ok; t.onerror = () => ko(t.error); }); } catch (e) {} }, 2000); };
  window.epsTombReady = (async () => { try { const db = await new Promise((ok, ko) => { const r = indexedDB.open(TOMB_DB, 1); r.onupgradeneeded = () => r.result.createObjectStore('b'); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
    const v = await new Promise(res => { const q = db.transaction('b').objectStore('b').get('tomb'); q.onsuccess = () => res(q.result); q.onerror = () => res(null); });
    if (v) { const o = JSON.parse(v), lim = Date.now() - TOMB_DAYS * 864e5; Object.keys(o).forEach(h => { if (o[h] > lim) TOMB[h] = o[h]; }); } } catch (e) {}
    Object.keys(DB).forEach(k => { if (!SKIP(k)) SNAP[k] = snapOf(k); }); })();
  const tomb = p => TOMB[hsh(p)] != null;
  function tombScan() {                                                  // à chaque enregistrement : ce qui a disparu depuis le dernier passage = supprimé volontairement
    const now = Date.now(); let n = 0;
    Object.keys(DB).forEach(k => { if (SKIP(k)) return; const cur = snapOf(k), old = SNAP[k];
      if (old) old.forEach(p => { if (!cur.has(p)) { TOMB[hsh(p)] = now; n++; } }); SNAP[k] = cur; });
    if (n) { const ks = Object.keys(TOMB); if (ks.length > TOMB_MAX) ks.sort((a, b) => TOMB[a] - TOMB[b]).slice(0, ks.length - TOMB_MAX).forEach(h => delete TOMB[h]); tombPut(); }
  }
  { const sv = window.saveNow; if (typeof sv === 'function') window.saveNow = function () { try { tombScan(); } catch (e) {} return sv.apply(this, arguments); }; }
  const clone = x => JSON.parse(JSON.stringify(x));
  function restore(o, r, p, d, F) {                                         // remet ce que le serveur possède et que la fusion a fait disparaître
    if (d > MAXD) return o;
    if (Array.isArray(o) && Array.isArray(r)) { let res = o, have = null;
      for (const x of r) { const k = ikey(x, d); if (k == null) continue; if (!have) have = new Map(o.map((y, i) => [ikey(y, d), i]));
        if (!have.has(k)) { if (F || !tomb(p + '/' + k)) { if (res === o) res = o.slice(); res.push(clone(x)); } }
        else if (isO(x)) { const i = have.get(k), nv = restore(o[i], x, p + '/' + k, d + 1, F); if (nv !== o[i]) { if (res === o) res = o.slice(); res[i] = nv; } } }
      return res; }
    if (isO(o) && isO(r)) { let res = o;
      for (const k of Object.keys(r)) { if (k[0] === '_') continue; const c = r[k]; if (!c || typeof c !== 'object') continue;
        if (!(k in o) || o[k] == null) { if (F || !tomb(p + '/' + k)) { if (res === o) res = { ...o }; res[k] = clone(c); } }
        else { const nv = restore(o[k], c, p + '/' + k, d + 1, F); if (nv !== o[k]) { if (res === o) res = { ...o }; res[k] = nv; } } }
      return res; }
    return o;
  }
  const keepAll = (k, out, rem) => { if (SKIP(k) || out == null || rem == null) return out;
    try { const res = restore(out, rem, k, 0); if (res !== out) { try { console.warn('EPS ONE : éléments gardés (suppression non volontaire évitée) dans', k); } catch (e) {} } return res; } catch (e) { return out; } };
  /* Récupération générale « sans rien supprimer » depuis une copie : ajoute à l'état actuel tout élément absent (toutes rubriques) */
  function restoreAll(o) {
    const det = {};
    epsClsGuardOff(() => Object.keys(o || {}).forEach(k => { if (SKIP(k) || o[k] == null || typeof o[k] !== 'object') return;
      const before = snapOf(k); const cur = getK(k);
      if (cur == null) setK(k, clone(o[k])); else { const nv = restore(cur, o[k], k, 0, true); if (nv !== cur) setK(k, nv); }
      const after = snapOf(k); let n = 0; after.forEach(p => { if (!before.has(p)) n++; }); if (n) det[k] = n; try { window.epsSnapKey && epsSnapKey(k); } catch (e) {} }));
    return det;
  }
  window.epsItemDeleted = () => {};                                      // ancien appel : la détection est maintenant automatique
  window.epsClsKeep = (k, out, rem) => {
    if (!CK.includes(k)) return keepAll(k, out, rem);
    if (!Array.isArray(out) || !Array.isArray(rem)) return out;
    const have = new Set(out.map(c => c && c.name)), back = rem.filter(c => c && c.name && !have.has(c.name) && !delOK(k, c.name));
    if (!back.length) return out;
    try { console.warn('EPS ONE : classes gardées (suppression non volontaire évitée)', back.map(c => c.name)); } catch (e) {}
    return [...out, ...JSON.parse(JSON.stringify(back))];
  };
  // une classe recréée (même nom) n'est plus considérée comme supprimée
  setInterval(() => { try { const o = lsGet(DEL, {}); let ch = 0; CK.forEach(k => (getK(k) || []).forEach(c => { if (c && o[k + '|' + c.name]) { delete o[k + '|' + c.name]; ch = 1; } })); if (ch) lsSet(DEL, o); } catch (e) {} }, 30000);
  let guardOff = 0;
  window.epsClsGuardOff = fn => { guardOff++; try { return fn(); } finally { guardOff--; } };
  const prevSet = window.dbSet;
  if (typeof prevSet === 'function') {
    window.dbSet = function (k, v) {
      if (!guardOff && CK.includes(k) && Array.isArray(v)) {
        const before = Array.isArray(getK(k)) ? getK(k) : [], now = new Set(v.map(c => c && c.name));
        const gone = before.filter(c => c && c.name && !now.has(c.name));
        if (gone.length) { const L = lsGet(LOST, []); L.unshift({ id: Date.now().toString(36), t: Date.now(), k, list: JSON.parse(JSON.stringify(gone)) }); lsSet(LOST, L.slice(0, 10)); setTimeout(banner, 300); }
      }
      return prevSet.apply(this, arguments);
    };
  }
  function restoreList(k, list) {
    const cur = Array.isArray(getK(k)) ? getK(k) : [], have = new Set(cur.map(c => c.name)), add = list.filter(c => !have.has(c.name));
    if (add.length) { setK(k, [...cur, ...JSON.parse(JSON.stringify(add))]); }
    return add.length;
  }
  function banner() {
    const L = lsGet(LOST, []).filter(x => !x.seen); document.getElementById('cls-lost')?.remove(); if (!L.length) return;
    const names = [...new Set(L.flatMap(x => x.list.map(c => c.name)))];
    const b = document.createElement('div'); b.id = 'cls-lost';
    b.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:420;max-width:640px;margin:0 auto;background:var(--card,#fff);border:2px solid var(--danger,#D64545);border-radius:18px;padding:12px 14px;box-shadow:0 12px 34px rgba(0,0,0,.25)';
    b.innerHTML = `<b>⚠️ ${names.length} classe${names.length > 1 ? 's' : ''} supprimée${names.length > 1 ? 's' : ''} par la synchronisation</b>
      <div class="muted" style="font-size:.85rem;margin-top:4px">${names.map(esc).join(', ')} — effacée${names.length > 1 ? 's' : ''} depuis une autre tablette ou une autre connexion au compte.</div>
      <div class="row" style="margin-top:10px;gap:8px"><button class="btn btn-grad" id="cl-rs">↶ Restaurer</button><button class="btn btn-ghost" id="cl-ok">C'était voulu</button></div>`;
    document.body.appendChild(b);
    const done = () => { lsSet(LOST, lsGet(LOST, []).map(x => ({ ...x, seen: 1 }))); b.remove(); };
    b.querySelector('#cl-ok').onclick = done;
    b.querySelector('#cl-rs').onclick = () => { let n = 0; L.slice().reverse().forEach(x => { n += epsClsGuardOff(() => restoreList(x.k, x.list)); });
      done(); save(); window.syncFlush && window.syncFlush(); try { renderHome(); } catch (e) {} toast(n ? `${n} classe${n > 1 ? 's' : ''} restaurée${n > 1 ? 's' : ''} ✔` : 'Classes déjà présentes'); };
  }
  setTimeout(banner, 1500);

  /* Récupération « sans rien supprimer » : ajoute à l'état actuel les lieux, parcours, séances de C.O. et épreuves de cross
     d'une copie, quand ils sont absents (même identifiant). Le reste des données n'est pas touché. */
  function restoreCO(o) {
    let n = { lieux: 0, parcours: 0, seances: 0, cross: 0 };
    const add = (cur, arr, cnt) => { (arr || []).forEach(x => { if (x && x.id != null && !cur.some(y => y && y.id === x.id)) { cur.push(JSON.parse(JSON.stringify(x))); n[cnt]++; } }); };
    epsClsGuardOff(() => {
      if (o.co) { DB.co = DB.co || { parcours: [], seances: [], current: null }; DB.co.lieux = DB.co.lieux || []; DB.co.parcours = DB.co.parcours || []; DB.co.seances = DB.co.seances || [];
        add(DB.co.lieux, o.co.lieux, 'lieux'); add(DB.co.parcours, o.co.parcours, 'parcours'); add(DB.co.seances, o.co.seances, 'seances'); }
      if (o.cross && Array.isArray(o.cross.events)) { DB.cross = DB.cross || { events: [] }; DB.cross.events = DB.cross.events || []; add(DB.cross.events, o.cross.events, 'cross'); }
    });
    return n;
  }
  const coMsg = n => { const t = [n.lieux && `${n.lieux} lieu${n.lieux > 1 ? 'x' : ''}`, n.parcours && `${n.parcours} parcours`, n.seances && `${n.seances} séance${n.seances > 1 ? 's' : ''} de C.O.`, n.cross && `${n.cross} cross`].filter(Boolean); return t.length ? t.join(' · ') + ' récupéré(s) ✔' : 'Rien à récupérer : tout est déjà présent'; };
  const coCount = j => { try { const o = JSON.parse(j); return { l: ((o.co || {}).lieux || []).length, p: ((o.co || {}).parcours || []).length, x: ((o.cross || {}).events || []).length }; } catch (e) { return { l: 0, p: 0, x: 0 }; } };

  /* ---------- Écran « Copies de secours » ---------- */
  window.openBackups = () => openPanel('Copies de secours', el => {
    const draw = async () => {
      let L = []; try { L = await bakAll(); } catch (e) {}
      const lost = lsGet(LOST, []);
      el.innerHTML = `<div class="card"><b>🛟 Copies de secours automatiques</b><p class="muted" style="margin:6px 0 0;font-size:.85rem">Une copie par jour, à la première ouverture de l'app (${KEEP} derniers jours), sur <b>cette</b> tablette. Les photos et vidéos ne sont pas dedans (elles sont rangées à part).</p>
          <button class="btn btn-grad btn-block" style="margin-top:10px" id="bk-file">📂 Récupérer C.O. + cross depuis un fichier de secours (.json)</button><input type="file" id="bk-fi" accept=".json,application/json" multiple hidden>
          <button class="btn btn-ghost btn-block" style="margin-top:8px" id="bk-file2">🧩 Récupérer tout ce qui manque depuis un fichier (.json)</button><input type="file" id="bk-fi2" accept=".json,application/json" multiple hidden>
          ${L.length > 2 ? '<button class="btn btn-ghost btn-block" style="margin-top:10px" id="bk-old">🗑 Supprimer les anciennes (garder les 2 plus récentes)</button>' : ''}
          <button class="btn btn-ghost btn-block" style="margin-top:10px" id="bk-now">📸 Faire une copie maintenant</button></div>
        ${L.length ? L.map((x, i) => `<div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><div>${String(x.k).startsWith('sync-') ? '<span class="muted" style="font-size:.78rem">🛡 Copie automatique avant une synchronisation qui retirait des données</span><br>' : ''}<b>${new Date(x.t).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</b> <span class="muted">· ${new Date(x.t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            <div class="muted" style="font-size:.82rem">${x.nc} classe${x.nc > 1 ? 's' : ''} · ${x.nr} résultat${x.nr > 1 ? 's' : ''} · ${(() => { const c = coCount(x.j); return `🧭 ${c.l} lieu${c.l > 1 ? 'x' : ''}, ${c.p} parcours · 🏃 ${c.x} cross`; })()} · ${Math.round(x.j.length / 1024)} Ko</div></div></div>
            <div class="row" style="margin-top:8px;gap:6px"><button class="btn btn-grad" style="padding:9px" data-rc="${i}">↶ Récupérer les classes manquantes</button><button class="btn btn-ghost" style="padding:9px" data-dl="${i}">⬇️ Télécharger</button></div>
            <button class="btn btn-ghost btn-block" style="margin-top:6px;padding:9px" data-rall="${i}">🧩 Récupérer tout ce qui manque (toutes les données, sans rien supprimer)</button>
            <button class="btn btn-ghost btn-block" style="margin-top:6px;padding:9px" data-rco="${i}">🧭 Récupérer C.O. + cross (sans rien supprimer)</button>
            <button class="btn btn-ghost btn-block" style="margin-top:6px;padding:9px;font-size:.85rem" data-rm="${i}">🗑 Supprimer cette copie</button>
            <button class="btn btn-ghost btn-block" style="margin-top:6px;padding:9px;font-size:.85rem" data-ra="${i}">⚠️ Tout remettre comme ce jour-là</button></div>`).join('')
          : '<div class="card empty" style="margin-top:10px">Pas encore de copie : elle sera faite à la prochaine ouverture de l\'app (ou touchez « Faire une copie maintenant »).</div>'}
        ${lost.length ? `<div class="section-title"><h2>Classes supprimées par la synchronisation</h2></div>${lost.map((x, i) => `<div class="list-item"><div style="flex:1"><b>${x.list.map(c => esc(c.name)).join(', ')}</b><div class="muted" style="font-size:.8rem">${new Date(x.t).toLocaleString('fr-FR')}</div></div><button class="btn btn-grad" style="flex:0 0 auto;padding:8px 12px" data-lr="${i}">↶ Restaurer</button></div>`).join('')}` : ''}`;
      const A = s => el.querySelectorAll(s);
      el.querySelector('#bk-now').onclick = async () => { await dailyBackup(true); toast('Copie enregistrée ✔'); draw(); };
      A('[data-dl]').forEach(b => b.onclick = () => { const x = L[+b.dataset.dl]; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([x.j], { type: 'application/json' })); a.download = 'eps-one-secours-' + day(x.t) + '.json'; a.click(); });
      A('[data-rc]').forEach(b => b.onclick = () => { const o = JSON.parse(L[+b.dataset.rc].j); let n = 0;
        epsClsGuardOff(() => CK.forEach(k => { if (Array.isArray(o[k])) n += restoreList(k, o[k]); }));
        save(); window.syncFlush && window.syncFlush(); try { renderHome(); } catch (e) {} toast(n ? `${n} classe${n > 1 ? 's' : ''} récupérée${n > 1 ? 's' : ''} ✔` : 'Aucune classe manquante'); });
      A('[data-ra]').forEach(b => b.onclick = async () => { const x = L[+b.dataset.ra];
        if (!confirm(`Tout remettre comme le ${new Date(x.t).toLocaleDateString('fr-FR')} ?\nCe qui a été fait depuis sera perdu (sur toutes les tablettes synchronisées).\nUne copie de l'état actuel est faite avant, au cas où.`)) return;
        try { await tx('readwrite', st => st.put({ t: Date.now(), j: snapJSON(), ...stats(snapJSON()) }, 'avant-' + Date.now())); } catch (e) {}
        const o = JSON.parse(x.j); Object.keys(DB).forEach(k => { if (IMG.test(k)) o[k] = DB[k]; });   // garder les photos
        epsClsGuardOff(() => { DB = Object.assign({ favs: [], recent: [], classes: [], dispenses: [], oublis: {}, journal: [], grilles: [], suivi: {}, debrief: [], annee: DB.annee }, o); window.teamInstall && teamInstall(); });
        saveNow(); window.syncFlush && window.syncFlush(); try { renderHome(); } catch (e) {} toast('Données restaurées ✔'); draw(); });
      const allMsg = d => { const t = Object.entries(d); return t.length ? t.map(([k, n]) => `${k} : ${n}`).join(' · ') + ' récupéré(s) ✔' : 'Rien à récupérer : tout est déjà présent'; };
      A('[data-rall]').forEach(b => b.onclick = () => { if (!confirm('Ajouter à l\'état actuel tout ce que cette copie contient et qui manque (résultats, validations, grilles, tournois, C.O., cross…) ?\nRien n\'est supprimé.\nAttention : ce que tu aurais supprimé volontairement depuis cette date réapparaîtra.')) return;
        const d = restoreAll(JSON.parse(L[+b.dataset.rall].j)); save(); window.syncFlush && window.syncFlush(); try { renderHome(); } catch (e) {} toast(allMsg(d)); });
      { const fb2 = el.querySelector('#bk-file2'), fi2 = el.querySelector('#bk-fi2'); if (fb2) fb2.onclick = () => { if (confirm('Ajouter tout ce que le fichier contient et qui manque (toutes rubriques), sans rien supprimer ?\nCe que tu aurais supprimé volontairement depuis la date du fichier réapparaîtra.')) fi2.click(); };
        if (fi2) fi2.onchange = async () => { for (const f of [...fi2.files]) { try { const d = restoreAll(JSON.parse(await f.text())); save(); toast(f.name + ' : ' + allMsg(d)); } catch (e) { toast('Fichier illisible : ' + f.name); } }
          window.syncFlush && window.syncFlush(); try { renderHome(); } catch (e) {} fi2.value = ''; }; }
      A('[data-rm]').forEach(b => b.onclick = async () => { const x = L[+b.dataset.rm]; if (!confirm('Supprimer définitivement cette copie du ' + new Date(x.t).toLocaleDateString('fr-FR') + ' ?')) return; await tx('readwrite', st => st.delete(x.k)); toast('Copie supprimée'); draw(); });
      { const ob = el.querySelector('#bk-old'); if (ob) ob.onclick = async () => { const keep = L.slice(0, 2); if (!confirm('Supprimer toutes les copies sauf les 2 plus récentes ?')) return; await tx('readwrite', st => L.slice(2).forEach(x => st.delete(x.k))); toast((L.length - 2) + ' copie(s) supprimée(s)'); draw(); }; }
      A('[data-rco]').forEach(b => b.onclick = () => { const n = restoreCO(JSON.parse(L[+b.dataset.rco].j)); save(); window.syncFlush && window.syncFlush(); try { renderHome(); } catch (e) {} toast(coMsg(n)); });
      { const fb = el.querySelector('#bk-file'), fi = el.querySelector('#bk-fi'); if (fb) fb.onclick = () => fi.click();
        if (fi) fi.onchange = async () => { for (const f of [...fi.files]) { try { const o = JSON.parse(await f.text()); const n = restoreCO(o); save(); toast(f.name + ' : ' + coMsg(n)); } catch (e) { toast('Fichier illisible : ' + f.name); } }
          window.syncFlush && window.syncFlush(); try { renderHome(); } catch (e) {} fi.value = ''; }; }
      A('[data-lr]').forEach(b => b.onclick = () => { const x = lost[+b.dataset.lr]; const n = epsClsGuardOff(() => restoreList(x.k, x.list));
        save(); window.syncFlush && window.syncFlush(); try { renderHome(); } catch (e) {} toast(n ? `${n} classe${n > 1 ? 's' : ''} restaurée${n > 1 ? 's' : ''} ✔` : 'Classes déjà présentes'); });
    };
    draw();
  });
})();
