/* =========================================================
   EPS ONE — Stockage & synchronisation sur SON PROPRE Google Drive
   · Connexion Google (Google Identity Services), autorisation limitée au
     dossier caché réservé à l'app (drive.appdata) : l'app ne voit rien d'autre.
   · Un fichier par rubrique dans ce dossier ; fusion à 3 voies comme la
     synchronisation EPS ONE (plusieurs tablettes, suppressions respectées).
   · Rien ne passe par le Firebase de l'administrateur.
   ========================================================= */
(() => {
  const CID = () => window.EPSONE_GDRIVE_CLIENT_ID || '';
  const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
  const API = 'https://www.googleapis.com/drive/v3', UP = 'https://www.googleapis.com/upload/drive/v3';
  const STORE = 'epsone_store', META = 'epsone_gd_meta', BASEK = 'epsone_gd_base', TOK = 'epsone_gd_token';
  const L = () => window.EPS_SYNC_LIB;
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} } };
  const on = () => ls.get(STORE) === 'gdrive';
  let meta; try { meta = JSON.parse(ls.get(META)) || {}; } catch (e) { meta = {}; }
  meta.keys = meta.keys || {}; meta.mt = meta.mt || {}; meta.dev = meta.dev || Math.random().toString(36).slice(2, 10);
  let BASE; try { BASE = JSON.parse(ls.get(BASEK)) || {}; } catch (e) { BASE = {}; }
  const saveMeta = () => ls.set(META, JSON.stringify(meta)), saveBase = () => ls.set(BASEK, JSON.stringify(BASE));
  const getBase = k => { try { return BASE[k] != null ? JSON.parse(BASE[k]) : undefined; } catch (e) { return undefined; } };
  const setBase = (k, v) => { BASE[k] = JSON.stringify(v ?? null); };
  const G = { status: 'off', err: '', last: meta.last || null, busy: false, needAuth: false };
  window.EPSONE_GD = G;

  /* ---------- Connexion Google ---------- */
  let tok = null; try { tok = JSON.parse(ls.get(TOK)); } catch (e) {}
  const tokenOK = () => tok && tok.exp > Date.now() + 60000;
  let gisP = null;
  const loadGIS = () => gisP || (gisP = new Promise((ok, ko) => { if (window.google?.accounts?.oauth2) return ok();
    const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = ok; s.onerror = () => { gisP = null; ko(new Error('Connexion à Google impossible (hors ligne ?)')); }; document.head.appendChild(s); }));
  // Demande un jeton : à appeler depuis un toucher (sinon le navigateur peut bloquer la fenêtre Google)
  async function requestToken(prompt) {
    if (!CID()) throw new Error('Google Drive n\'est pas encore configuré par l\'administrateur.');
    await loadGIS();
    return new Promise((ok, ko) => {
      const c = google.accounts.oauth2.initTokenClient({ client_id: CID(), scope: SCOPE, callback: r => {
        if (r.error) return ko(new Error(r.error === 'access_denied' ? 'Autorisation refusée.' : r.error));
        tok = { t: r.access_token, exp: Date.now() + (r.expires_in || 3600) * 1000 }; ls.set(TOK, JSON.stringify(tok)); G.needAuth = false; ok(); },
        error_callback: e => ko(new Error(e?.type === 'popup_closed' ? 'Fenêtre Google fermée.' : 'Connexion Google interrompue.')) });
      c.requestAccessToken({ prompt: prompt || '' });
    });
  }
  async function api(url, opt = {}) {
    if (!tokenOK()) { G.needAuth = true; throw new Error('Reconnexion à Google nécessaire'); }
    const r = await fetch(url, { ...opt, headers: { ...(opt.headers || {}), Authorization: 'Bearer ' + tok.t } });
    if (r.status === 401) { tok = null; ls.set(TOK, null); G.needAuth = true; throw new Error('Reconnexion à Google nécessaire'); }
    if (!r.ok) throw new Error('Google Drive : erreur ' + r.status);
    return r;
  }
  const FN = k => 'epsone_' + k + '.json', KEY = n => n.replace(/^epsone_/, '').replace(/\.json$/, '');
  async function listFiles() {
    const r = await api(`${API}/files?spaces=appDataFolder&pageSize=1000&fields=files(id,name,modifiedTime)`);
    return (await r.json()).files || [];
  }
  const readFile = async id => (await api(`${API}/files/${id}?alt=media`)).json();
  async function writeFile(k, id, obj) {
    const body = JSON.stringify(obj);
    if (id) { const r = await api(`${UP}/files/${id}?uploadType=media&fields=id,modifiedTime`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body }); return r.json(); }
    const b = 'epsone' + Math.random().toString(36).slice(2);
    const mp = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: FN(k), parents: ['appDataFolder'] })}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${b}--`;
    const r = await api(`${UP}/files?uploadType=multipart&fields=id,modifiedTime`, { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b }, body: mp });
    return r.json();
  }
  const valOf = f => { try { return JSON.parse(f.v); } catch (e) { return undefined; } };

  /* ---------- Réception ---------- */
  let applying = false;
  async function pull() {
    if (!on() || !L() || !tokenOK()) return false;
    const files = await listFiles(); let changed = false;
    for (const f of files) {
      const k = KEY(f.name); if (!L().syncKeys().includes(k) && DB[k] !== undefined) continue;
      if (meta.mt[k] === f.modifiedTime) continue;
      const doc = await readFile(f.id); meta.mt[k] = f.modifiedTime; meta.ids = meta.ids || {}; meta.ids[k] = f.id;
      if (doc.dev === meta.dev && doc.t === meta.keys[k]?.t) continue;
      let rv = valOf(doc); if (rv === undefined) continue; rv = L().outb(k, rv);
      const local = L().outb(k), m = meta.keys[k], dirty = m && m.h !== L().hash(JSON.stringify(local));
      const out = !m ? (local == null ? rv : L().mergeData(local, rv)) : dirty ? L().merge3(getBase(k), local, rv) : rv;
      setBase(k, rv); applying = true; DB[k] = L().withLocal(k, out); applying = false;
      meta.keys[k] = { h: L().jeq(out, rv) ? L().hash(JSON.stringify(rv)) : 'x', t: doc.t };
      if (!L().jeq(out, local)) changed = true;
    }
    saveMeta(); saveBase();
    if (changed) { applying = true; window.save(); applying = false; try { if (!document.getElementById('screen').classList.contains('open')) renderHome(); } catch (e) {} toast('🔄 Données Google Drive synchronisées'); }
    return changed;
  }

  /* ---------- Envoi (lecture → fusion → écriture → vérification) ---------- */
  const pending = () => on() && L() ? L().syncKeys().filter(k => meta.keys[k]?.h !== L().hash(JSON.stringify(L().outb(k)))) : [];
  async function push() {
    if (!on() || !L() || G.busy) return;
    const keys = pending(); if (!keys.length) { G.status = 'ok'; draw(); return; }
    G.busy = true; G.status = 'sync'; draw();
    try {
      const files = await listFiles(), byName = Object.fromEntries(files.map(f => [KEY(f.name), f]));
      for (const k of keys) {
        const f = byName[k]; let base = getBase(k), local = L().outb(k), remote = f ? valOf(await readFile(f.id)) : undefined, out, t, id = f && f.id;
        for (let attempt = 0; attempt < 3; attempt++) {
          out = remote === undefined ? local : L().merge3(base, local, L().outb(k, remote));
          t = Date.now(); const w = await writeFile(k, id, { t, dev: meta.dev, v: JSON.stringify(out ?? null) }); id = w.id; meta.mt[k] = w.modifiedTime;
          // vérification : une autre tablette a-t-elle écrit en même temps ?
          const back = await readFile(id); if (back.dev === meta.dev && back.t === t) break;
          base = remote === undefined ? undefined : L().outb(k, remote); local = out; remote = valOf(back);
        }
        meta.ids = meta.ids || {}; meta.ids[k] = id; setBase(k, out); meta.keys[k] = { h: L().hash(JSON.stringify(out ?? null)), t };
        if (!L().jeq(out, L().outb(k))) { applying = true; DB[k] = L().withLocal(k, out); window.save(); applying = false; }
      }
      G.status = 'ok'; G.err = ''; G.last = meta.last = Date.now();
    } catch (e) { G.status = 'error'; G.err = e.message; }
    G.busy = false; saveMeta(); saveBase(); draw(); pill();
  }

  /* ---------- Rythme : envois groupés, ou fin de séance en mode collecte ---------- */
  let timer = null;
  const _save = window.save;
  window.save = function () { _save(); if (applying || !on()) return; if (meta.collect) { setTimeout(pill, 50); return; } if (!timer) timer = setTimeout(() => { timer = null; push(); }, 15000); };
  setInterval(() => { if (on() && !meta.collect && document.visibilityState === 'visible' && tokenOK()) pull().catch(() => {}); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!on() || !tokenOK()) return; if (document.visibilityState === 'hidden') push(); else pull().then(() => !meta.collect && push()).catch(() => {}); });
  function pill() {
    let b = document.getElementById('gd-pill'); const n = on() && meta.collect ? pending().length : 0;
    if (!n) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('button'); b.id = 'gd-pill'; b.className = 'btn btn-grad';
      b.style.cssText = 'position:fixed;right:14px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:150;padding:12px 16px;border-radius:999px;box-shadow:var(--shadow);font-weight:800;width:auto';
      b.onclick = () => sendNow(); document.body.appendChild(b); }
    b.textContent = `📤 Envoyer sur Drive (${n})`;
  }
  async function sendNow() { try { if (!tokenOK()) await requestToken(''); await push(); await pull(); toast(pending().length ? 'Envoi incomplet : réessayez' : 'Drive à jour ✔'); } catch (e) { G.err = e.message; toast(e.message); } draw(); pill(); }

  /* ---------- Carte dans la page Synchronisation ---------- */
  let host = null;
  function draw() {
    if (!host || !host.isConnected) return;
    const S = window.EPSONE_SYNC || {}, approved = L() ? L().accessOK() : true;
    if (!CID()) { host.innerHTML = ''; return; }
    const last = G.last ? new Date(G.last).toLocaleString('fr-FR') : 'jamais';
    host.innerHTML = on() ? `<div class="card" style="border:2px solid #1E5BD8"><h3>🟢 Google Drive activé</h3>
        <p style="margin:6px 0;line-height:1.45">Vos données sont enregistrées sur <b>votre propre Google Drive</b>, dans un dossier caché réservé à EPS ONE. Connectez le même compte Google sur vos autres tablettes.</p>
        <p class="muted" style="margin:0;font-size:.82rem">État : ${G.status === 'sync' ? 'envoi…' : G.status === 'error' ? 'erreur' : 'à jour'} · dernière synchro : ${last}${pending().length ? ` · ${pending().length} rubrique(s) à envoyer` : ''}</p>
        ${G.err ? `<p style="color:var(--danger);font-size:.85rem">${esc(G.err)}</p>` : ''}
        ${!tokenOK() ? '<button class="btn btn-grad btn-block" style="margin-top:10px" id="gd-re">🔑 Reconnecter Google Drive</button>' : `<button class="btn btn-grad btn-block" style="margin-top:10px" id="gd-now">🔄 Synchroniser maintenant</button>`}
        <label style="display:flex;gap:8px;align-items:flex-start;margin-top:12px;color:var(--text);font-weight:600"><input type="checkbox" id="gd-col" ${meta.collect ? 'checked' : ''} style="width:auto;margin-top:3px"><span>📥 Tablette de collecte (envoi en fin de séance)<br><span class="muted" style="font-weight:400;font-size:.82rem">Rien n'est envoyé pendant la séance ; touchez « 📤 Envoyer sur Drive » à la fin du cours.</span></span></label>
        <button class="btn btn-ghost btn-block" style="margin-top:10px" id="gd-off">Arrêter Google Drive sur cet appareil</button></div>`
      : `<div class="card"><h3>🟦 Mon propre cloud : Google Drive</h3>
        <p style="margin:6px 0;line-height:1.45">Enregistrez et synchronisez vos données sur <b>votre Google Drive</b> (plusieurs tablettes, fusion en fin de cours), sans passer par le serveur d'EPS ONE.</p>
        <p class="muted" style="margin:0;font-size:.82rem">L'app n'a accès qu'à un dossier caché qui lui est réservé : elle ne voit pas vos autres fichiers.</p>
        <p class="muted" style="margin:6px 0 0;font-size:.82rem">⚠️ Avant d'activer, assurez-vous que ce fournisseur est conforme à la réglementation de votre établissement.</p>
        ${G.err ? `<p style="color:var(--danger);font-size:.85rem">${esc(G.err)}</p>` : ''}
        <button class="btn btn-grad btn-block" style="margin-top:10px" id="gd-on">Se connecter avec Google</button></div>`;
    const $ = q => host.querySelector(q);
    if ($('#gd-on')) $('#gd-on').onclick = () => connect();
    if ($('#gd-re')) $('#gd-re').onclick = () => sendNow();
    if ($('#gd-now')) $('#gd-now').onclick = () => sendNow();
    if ($('#gd-col')) $('#gd-col').onchange = e => { meta.collect = e.target.checked; saveMeta(); pill(); if (!meta.collect) push(); draw(); };
    if ($('#gd-off')) $('#gd-off').onclick = () => { if (!confirm('Arrêter Google Drive sur cet appareil ?\nVos données restent sur cet appareil et sur votre Drive.\nSans compte EPS ONE autorisé, l\'écran « Accès réservé » réapparaîtra.')) return;
      ls.set(STORE, null); try { tok && google.accounts.oauth2.revoke(tok.t); } catch (e) {} tok = null; ls.set(TOK, null); pill(); L() && L().resumeFirebase(); L() && L().refreshUI(); L() && L().gate(); draw(); toast('Google Drive arrêté'); };
  }
  // Connexion Google Drive (aussi utilisée par l'écran d'accès : pas besoin de validation par l'administrateur)
  async function connect() { G.err = ''; try { await requestToken('consent'); ls.set(STORE, 'gdrive'); L() && L().stopFirebase();
      meta.keys = {}; meta.mt = {}; BASE = {}; saveMeta(); saveBase(); L() && L().gate(); await pull(); await push(); toast('Google Drive activé ✔'); } catch (e) { G.err = e.message; toast(e.message); } L() && L().refreshUI(); draw(); }
  window.gdConnect = connect;
  window.gdRender = h => { host = h; draw(); };
  // Démarrage : récupérer les nouveautés si Drive est actif
  setTimeout(() => { pill(); if (on() && tokenOK() && !meta.collect) pull().catch(() => {}); }, 2500);
})();
