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
  const BAK_DB = 'epsone-bak', KEEP = 7, LOST = 'epsone_cls_lost', IMG = /^(acroImg_|gymImg_|escImg_|danseImg_)/;
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
  window.epsClsKeep = (k, out, rem) => {
    if (!CK.includes(k) || !Array.isArray(out) || !Array.isArray(rem)) return out;
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

  /* ---------- Écran « Copies de secours » ---------- */
  window.openBackups = () => openPanel('Copies de secours', async el => {
    const draw = async () => {
      let L = []; try { L = await bakAll(); } catch (e) {}
      const lost = lsGet(LOST, []);
      el.innerHTML = `<div class="card"><b>🛟 Copies de secours automatiques</b><p class="muted" style="margin:6px 0 0;font-size:.85rem">Une copie par jour, à la première ouverture de l'app (${KEEP} derniers jours), sur <b>cette</b> tablette. Les photos et vidéos ne sont pas dedans (elles sont rangées à part).</p>
          <button class="btn btn-ghost btn-block" style="margin-top:10px" id="bk-now">📸 Faire une copie maintenant</button></div>
        ${L.length ? L.map((x, i) => `<div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><div><b>${new Date(x.t).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</b> <span class="muted">· ${new Date(x.t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            <div class="muted" style="font-size:.82rem">${x.nc} classe${x.nc > 1 ? 's' : ''} · ${x.nr} résultat${x.nr > 1 ? 's' : ''} · ${Math.round(x.j.length / 1024)} Ko</div></div></div>
            <div class="row" style="margin-top:8px;gap:6px"><button class="btn btn-grad" style="padding:9px" data-rc="${i}">↶ Récupérer les classes manquantes</button><button class="btn btn-ghost" style="padding:9px" data-dl="${i}">⬇️ Télécharger</button></div>
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
      A('[data-lr]').forEach(b => b.onclick = () => { const x = lost[+b.dataset.lr]; const n = epsClsGuardOff(() => restoreList(x.k, x.list));
        save(); window.syncFlush && window.syncFlush(); try { renderHome(); } catch (e) {} toast(n ? `${n} classe${n > 1 ? 's' : ''} restaurée${n > 1 ? 's' : ''} ✔` : 'Classes déjà présentes'); });
    };
    draw();
  });
})();
