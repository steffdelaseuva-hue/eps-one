/* =========================================================
   EPS ONE — Stockage & synchronisation sur SON PROPRE cloud
   (Google Drive, Dropbox). Rien ne passe par le Firebase de l'administrateur.
   · Chaque service n'a accès qu'à un dossier réservé à l'app.
   · Un fichier par rubrique ; fusion à 3 voies comme la synchronisation
     EPS ONE (plusieurs tablettes, suppressions respectées, tablette de collecte).
   ========================================================= */
(() => {
  const STORE = 'epsone_store';
  const L = () => window.EPS_SYNC_LIB;
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} } };
  const jget = k => { try { return JSON.parse(ls.get(k)); } catch (e) { return null; } };
  const FN = k => 'epsone_' + k + '.json', KEY = n => n.replace(/^epsone_/, '').replace(/\.json$/, '');
  const ENGINES = {};

  /* =================== Moteur générique =================== */
  function makeCloud(P) {
    const on = () => ls.get(STORE) === P.id;
    let meta = jget(P.metaK) || {}; meta.keys = meta.keys || {}; meta.mt = meta.mt || {}; meta.dev = meta.dev || Math.random().toString(36).slice(2, 10);
    let BASE = jget(P.baseK) || {};
    const saveMeta = () => ls.set(P.metaK, JSON.stringify(meta)), saveBase = () => ls.set(P.baseK, JSON.stringify(BASE));
    const getBase = k => { try { return BASE[k] != null ? JSON.parse(BASE[k]) : undefined; } catch (e) { return undefined; } };
    const setBase = (k, v) => { BASE[k] = JSON.stringify(v ?? null); };
    const C = { status: 'off', err: '', last: meta.last || null, busy: false };
    const valOf = f => { try { return JSON.parse(f.v); } catch (e) { return undefined; } };

    let applying = false;
    async function pull() {
      if (!on() || !L() || !(await P.ensure())) return false;
      const files = await P.list(); let changed = false;
      for (const f of files) {
        const k = f.key; if (!L().syncKeys().includes(k) && DB[k] !== undefined) continue;
        if (meta.mt[k] === f.mt) continue;
        const doc = await P.read(f.id); meta.mt[k] = f.mt;
        if (doc.dev === meta.dev && doc.t === meta.keys[k]?.t) continue;
        let rv = valOf(doc); if (rv === undefined) continue; rv = L().outb(k, rv);
        const local = L().outb(k), m = meta.keys[k], dirty = m && m.h !== L().hash(JSON.stringify(local));
        const out = !m ? (local == null ? rv : L().mergeData(local, rv)) : dirty ? L().merge3(getBase(k), local, rv) : rv;
        setBase(k, rv); applying = true; DB[k] = L().withLocal(k, out); applying = false;
        meta.keys[k] = { h: L().jeq(out, rv) ? L().hash(JSON.stringify(rv)) : 'x', t: doc.t };
        if (!L().jeq(out, local)) changed = true;
      }
      saveMeta(); saveBase();
      if (changed) { applying = true; window.save(); applying = false; try { if (!document.getElementById('screen').classList.contains('open')) renderHome(); } catch (e) {} toast(`🔄 Données ${P.name} synchronisées`); }
      return changed;
    }

    /* Envoi : lecture → fusion → écriture → vérification */
    const pending = () => on() && L() ? L().syncKeys().filter(k => meta.keys[k]?.h !== L().hash(JSON.stringify(L().outb(k)))) : [];
    async function push() {
      if (!on() || !L() || C.busy) return;
      const keys = pending(); if (!keys.length) { C.status = 'ok'; draw(); return; }
      C.busy = true; C.status = 'sync'; draw();
      try {
        if (!(await P.ensure())) throw new Error(`Reconnexion à ${P.name} nécessaire`);
        const files = await P.list(), byKey = Object.fromEntries(files.map(f => [f.key, f]));
        for (const k of keys) {
          const f = byKey[k]; let base = getBase(k), local = L().outb(k), remote = f ? valOf(await P.read(f.id)) : undefined, out, t, id = f && f.id;
          for (let attempt = 0; attempt < 3; attempt++) {
            out = remote === undefined ? local : L().merge3(base, local, L().outb(k, remote));
            t = Date.now(); const w = await P.write(k, id, { t, dev: meta.dev, v: JSON.stringify(out ?? null) }); id = w.id; meta.mt[k] = w.mt;
            // une autre tablette a-t-elle écrit en même temps ?
            const back = await P.read(id); if (back.dev === meta.dev && back.t === t) break;
            base = remote === undefined ? undefined : L().outb(k, remote); local = out; remote = valOf(back);
          }
          setBase(k, out); meta.keys[k] = { h: L().hash(JSON.stringify(out ?? null)), t };
          if (!L().jeq(out, L().outb(k))) { applying = true; DB[k] = L().withLocal(k, out); window.save(); applying = false; }
        }
        C.status = 'ok'; C.err = ''; C.last = meta.last = Date.now();
      } catch (e) { C.status = 'error'; C.err = e.message; }
      C.busy = false; saveMeta(); saveBase(); draw(); pill();
    }

    /* Rythme : envois groupés, ou fin de séance en mode collecte */
    let timer = null;
    const _save = window.save;
    window.save = function () { _save(); if (applying || !on()) return; if (meta.collect) { setTimeout(pill, 50); return; } if (!timer) timer = setTimeout(() => { timer = null; push(); }, 15000); };
    setInterval(() => { if (on() && !meta.collect && document.visibilityState === 'visible' && P.hasToken()) pull().catch(() => {}); }, 60000);
    document.addEventListener('visibilitychange', () => { if (!on() || !P.hasToken()) return; if (document.visibilityState === 'hidden') push(); else pull().then(() => !meta.collect && push()).catch(() => {}); });
    function pill() {
      const pid = P.id + '-pill'; let b = document.getElementById(pid); const n = on() && meta.collect ? pending().length : 0;
      if (!n) { if (b) b.remove(); return; }
      if (!b) { b = document.createElement('button'); b.id = pid; b.className = 'btn btn-grad';
        b.style.cssText = 'position:fixed;right:14px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:150;padding:12px 16px;border-radius:999px;box-shadow:var(--shadow);font-weight:800;width:auto';
        b.onclick = () => sendNow(); document.body.appendChild(b); }
      b.textContent = `📤 Envoyer sur ${P.name} (${n})`;
    }
    async function sendNow() { try { if (!(await P.ensure())) await P.reauth(); await push(); await pull(); toast(pending().length ? 'Envoi incomplet : réessayez' : `${P.name} à jour ✔`); } catch (e) { C.err = e.message; toast(e.message); } draw(); pill(); }

    /* Carte dans la page Stockage & synchronisation */
    let host = null;
    function draw() {
      if (!host || !host.isConnected) return;
      const last = C.last ? new Date(C.last).toLocaleString('fr-FR') : 'jamais';
      const other = !on() && Object.values(ENGINES).find(e => e.on());
      host.innerHTML = on() ? `<div class="card" style="border:2px solid #1E5BD8"><h3>🟢 ${P.name} activé</h3>
          <p style="margin:6px 0;line-height:1.45">Vos données sont enregistrées sur <b>votre propre ${P.name}</b>, ${P.where}. Connectez le même compte sur vos autres tablettes.</p>
          <p class="muted" style="margin:0;font-size:.82rem">État : ${C.status === 'sync' ? 'envoi…' : C.status === 'error' ? 'erreur' : 'à jour'} · dernière synchro : ${last}${pending().length ? ` · ${pending().length} rubrique(s) à envoyer` : ''}</p>
          ${C.err ? `<p style="color:var(--danger);font-size:.85rem">${esc(C.err)}</p>` : ''}
          ${!P.hasToken() ? `<button class="btn btn-grad btn-block" style="margin-top:10px" id="cl-re">🔑 Reconnecter ${P.name}</button>` : `<button class="btn btn-grad btn-block" style="margin-top:10px" id="cl-now">🔄 Synchroniser maintenant</button>`}
          <label style="display:flex;gap:8px;align-items:flex-start;margin-top:12px;color:var(--text);font-weight:600"><input type="checkbox" id="cl-col" ${meta.collect ? 'checked' : ''} style="width:auto;margin-top:3px"><span>📥 Tablette de collecte (envoi en fin de séance)<br><span class="muted" style="font-weight:400;font-size:.82rem">Rien n'est envoyé pendant la séance ; touchez « 📤 Envoyer sur ${P.name} » à la fin du cours.</span></span></label>
          <button class="btn btn-ghost btn-block" style="margin-top:10px" id="cl-off">Arrêter ${P.name} sur cet appareil</button></div>`
        : `<div class="card"><h3>${P.icon} ${P.name}</h3>
          <p style="margin:6px 0;line-height:1.45">Enregistrez et synchronisez vos données sur <b>votre ${P.name}</b> (plusieurs tablettes, fusion en fin de cours), sans passer par le serveur d'EPS ONE.</p>
          <p class="muted" style="margin:0;font-size:.82rem">${P.scopeTxt}</p>
          ${C.err ? `<p style="color:var(--danger);font-size:.85rem">${esc(C.err)}</p>` : ''}
          ${other ? `<p class="muted" style="margin:8px 0 0;font-size:.82rem">⏸ Arrêtez d'abord ${other.P.name} pour choisir ce service.</p>` : `<button class="btn btn-grad btn-block" style="margin-top:10px" id="cl-on">Se connecter avec ${P.name}</button>`}</div>`;
      const $ = q => host.querySelector(q);
      if ($('#cl-on')) $('#cl-on').onclick = () => connect();
      if ($('#cl-re')) $('#cl-re').onclick = () => sendNow();
      if ($('#cl-now')) $('#cl-now').onclick = () => sendNow();
      if ($('#cl-col')) $('#cl-col').onchange = e => { meta.collect = e.target.checked; saveMeta(); pill(); if (!meta.collect) push(); draw(); };
      if ($('#cl-off')) $('#cl-off').onclick = () => { if (!confirm(`Arrêter ${P.name} sur cet appareil ?\nVos données restent sur cet appareil et sur votre ${P.name}.\nVous pourrez continuer sans synchronisation (données sur cet appareil).`)) return;
        ls.set(STORE, null); ls.set('epsone_free', '1'); try { P.revoke(); } catch (e) {} pill(); L() && L().resumeFirebase(); L() && L().refreshUI(); L() && L().gate(); window.cloudRefresh && window.cloudRefresh(); toast(`${P.name} arrêté`); };
    }

    // Activation après autorisation (pas besoin de validation par l'administrateur)
    async function activate() {
      ls.set(STORE, P.id); L() && L().stopFirebase();
      meta.keys = {}; meta.mt = {}; BASE = {}; saveMeta(); saveBase(); L() && L().gate();
      await pull(); await push(); toast(`${P.name} activé ✔`);
    }
    async function connect() { C.err = ''; try { if ((await P.authorize()) === 'redirect') return; await activate(); } catch (e) { C.err = e.message; toast(e.message); } L() && L().refreshUI(); draw(); }
    const E = { P, on, C, collect: () => !!meta.collect, pull, push, pill, connect, activate, draw: h => { if (h) host = h; draw(); } };
    ENGINES[P.id] = E;
    return E;
  }

  /* =================== Google Drive =================== */
  (() => {
    const CID = () => window.EPSONE_GDRIVE_CLIENT_ID || '';
    const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
    const API = 'https://www.googleapis.com/drive/v3', UP = 'https://www.googleapis.com/upload/drive/v3', TOK = 'epsone_gd_token';
    let tok = jget(TOK);
    const tokenOK = () => !!tok && tok.exp > Date.now() + 60000;
    let gisP = null;
    const loadGIS = () => gisP || (gisP = new Promise((ok, ko) => { if (window.google?.accounts?.oauth2) return ok();
      const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = ok; s.onerror = () => { gisP = null; ko(new Error('Connexion à Google impossible (hors ligne ?)')); }; document.head.appendChild(s); }));
    // à appeler depuis un toucher (sinon le navigateur peut bloquer la fenêtre Google)
    async function requestToken(prompt) {
      if (!CID()) throw new Error('Google Drive n\'est pas encore configuré par l\'administrateur.');
      await loadGIS();
      return new Promise((ok, ko) => {
        const c = google.accounts.oauth2.initTokenClient({ client_id: CID(), scope: SCOPE, callback: r => {
          if (r.error) return ko(new Error(r.error === 'access_denied' ? 'Autorisation refusée.' : r.error));
          tok = { t: r.access_token, exp: Date.now() + (r.expires_in || 3600) * 1000 }; ls.set(TOK, JSON.stringify(tok)); ok(); },
          error_callback: e => ko(new Error(e?.type === 'popup_closed' ? 'Fenêtre Google fermée.' : 'Connexion Google interrompue.')) });
        c.requestAccessToken({ prompt: prompt || '' });
      });
    }
    async function api(url, opt = {}) {
      if (!tokenOK()) throw new Error('Reconnexion à Google nécessaire');
      const r = await fetch(url, { ...opt, headers: { ...(opt.headers || {}), Authorization: 'Bearer ' + tok.t } });
      if (r.status === 401) { tok = null; ls.set(TOK, null); throw new Error('Reconnexion à Google nécessaire'); }
      if (!r.ok) throw new Error('Google Drive : erreur ' + r.status);
      return r;
    }
    makeCloud({
      id: 'gdrive', name: 'Google Drive', icon: '<img src="icons/gdrive.png" alt="" style="width:1.3em;height:1.3em;vertical-align:-.28em;border-radius:5px;background:#fff">', metaK: 'epsone_gd_meta', baseK: 'epsone_gd_base',
      where: 'dans un dossier caché réservé à EPS ONE',
      scopeTxt: 'L\'app n\'a accès qu\'à un dossier caché qui lui est réservé : elle ne voit pas vos autres fichiers.',
      configured: () => !!CID(), hasToken: tokenOK, ensure: async () => tokenOK(),
      authorize: () => requestToken('consent'), reauth: () => requestToken(''),
      list: async () => ((await (await api(`${API}/files?spaces=appDataFolder&pageSize=1000&fields=files(id,name,modifiedTime)`)).json()).files || [])
        .filter(f => /^epsone_.*\.json$/.test(f.name)).map(f => ({ id: f.id, key: KEY(f.name), mt: f.modifiedTime })),
      read: async id => (await api(`${API}/files/${id}?alt=media`)).json(),
      write: async (k, id, obj) => {
        const body = JSON.stringify(obj); let r;
        if (id) r = await api(`${UP}/files/${id}?uploadType=media&fields=id,modifiedTime`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body });
        else { const b = 'epsone' + Math.random().toString(36).slice(2);
          const mp = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: FN(k), parents: ['appDataFolder'] })}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${b}--`;
          r = await api(`${UP}/files?uploadType=multipart&fields=id,modifiedTime`, { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b }, body: mp }); }
        const j = await r.json(); return { id: j.id, mt: j.modifiedTime };
      },
      revoke: () => { try { tok && google.accounts.oauth2.revoke(tok.t); } catch (e) {} tok = null; ls.set(TOK, null); },
    });
  })();

  /* =================== Dropbox (OAuth PKCE, dossier « Applications/EPS ONE ») =================== */
  (() => {
    const KEYAPP = () => window.EPSONE_DROPBOX_APP_KEY || '';
    const TOK = 'epsone_dbx_token', PKCE = 'epsone_dbx_pkce';
    const API = 'https://api.dropboxapi.com', CONT = 'https://content.dropboxapi.com';
    const RURI = () => location.origin + location.pathname.replace(/index\.html$/, '');
    let tok = jget(TOK);                                   // { t, exp, r }
    const saveTok = () => ls.set(TOK, tok ? JSON.stringify(tok) : null);
    const tokenOK = () => !!tok && tok.exp > Date.now() + 60000;
    const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const rnd = n => { const a = new Uint8Array(n); crypto.getRandomValues(a); return b64u(a); };
    async function tokenReq(params) {
      const r = await fetch(API + '/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: KEYAPP(), ...params }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.access_token) throw new Error('Dropbox : ' + (j.error_description || j.error || 'connexion refusée'));
      tok = { t: j.access_token, exp: Date.now() + (j.expires_in || 14400) * 1000, r: j.refresh_token || tok?.r }; saveTok();
    }
    let refreshing = null;
    async function ensure() {
      if (tokenOK()) return true;
      if (!tok?.r) return false;
      try { await (refreshing || (refreshing = tokenReq({ grant_type: 'refresh_token', refresh_token: tok.r }))); return true; }
      catch (e) { return false; } finally { refreshing = null; }
    }
    // Ouvre la page Dropbox (même fenêtre) ; retour automatique dans l'app
    async function authorize() {
      if (!KEYAPP()) throw new Error('Dropbox n\'est pas encore configuré par l\'administrateur.');
      const v = rnd(48), s = rnd(16), ch = b64u(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)));
      ls.set(PKCE, JSON.stringify({ v, s, uri: RURI() }));
      location.href = 'https://www.dropbox.com/oauth2/authorize?' + new URLSearchParams({ client_id: KEYAPP(), response_type: 'code', code_challenge: ch, code_challenge_method: 'S256', redirect_uri: RURI(), token_access_type: 'offline', state: s });
      return 'redirect';
    }
    async function api(url, opt = {}, retry = true) {
      if (!(await ensure())) throw new Error('Reconnexion à Dropbox nécessaire');
      const r = await fetch(url, { method: 'POST', ...opt, headers: { ...(opt.headers || {}), Authorization: 'Bearer ' + tok.t } });
      if (r.status === 401) { if (retry && tok?.r) { tok.exp = 0; return api(url, opt, false); } tok = null; saveTok(); throw new Error('Reconnexion à Dropbox nécessaire'); }
      return r;
    }
    // Message d'erreur détaillé renvoyé par Dropbox (aide au diagnostic)
    const fail = async (r, step) => { let t = ''; try { t = (await r.text()).replace(/\s+/g, ' ').slice(0, 220); } catch (e) {} throw new Error(`Dropbox (${step}) : erreur ${r.status}${t ? ' · ' + t : ''}`); };
    const arg = o => JSON.stringify(o).replace(/[\u007f-￿]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
    const E = makeCloud({
      id: 'dropbox', name: 'Dropbox', icon: '<img src="icons/dropbox.png" alt="" style="width:1.3em;height:1.3em;vertical-align:-.28em;border-radius:5px;background:#fff">', metaK: 'epsone_dbx_meta', baseK: 'epsone_dbx_base',
      where: 'dans le dossier « Applications/EPS ONE »',
      scopeTxt: 'L\'app n\'a accès qu\'à son propre dossier « Applications/EPS ONE » : elle ne voit pas vos autres fichiers.',
      configured: () => !!KEYAPP(), hasToken: () => tokenOK() || !!tok?.r, ensure, authorize, reauth: authorize,
      list: async () => {
        let out = [], r = await api(API + '/2/files/list_folder', { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '', limit: 2000 }) });
        if (r.status === 409) return [];
        if (!r.ok) await fail(r, 'liste');
        let j = await r.json(); out = out.concat(j.entries);
        while (j.has_more) { r = await api(API + '/2/files/list_folder/continue', { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cursor: j.cursor }) }); if (!r.ok) await fail(r, 'liste'); j = await r.json(); out = out.concat(j.entries); }
        return out.filter(e => e['.tag'] === 'file' && /^epsone_.*\.json$/.test(e.name)).map(e => ({ id: e.id, key: KEY(e.name), mt: e.rev }));
      },
      read: async id => { const r = await api(CONT + '/2/files/download', { headers: { 'Dropbox-API-Arg': arg({ path: id }) } }); if (!r.ok) await fail(r, 'lecture'); return JSON.parse(await r.text()); },
      write: async (k, id, obj) => {
        const r = await api(CONT + '/2/files/upload', { headers: { 'Content-Type': 'application/octet-stream', 'Dropbox-API-Arg': arg({ path: '/' + FN(k), mode: 'overwrite', mute: true }) }, body: JSON.stringify(obj) });
        if (!r.ok) await fail(r, 'envoi');
        const j = await r.json(); return { id: j.id, mt: j.rev };
      },
      revoke: () => { const t = tok?.t; tok = null; saveTok(); if (t) fetch(API + '/2/auth/token/revoke', { method: 'POST', headers: { Authorization: 'Bearer ' + t } }).catch(() => {}); },
    });
    // Retour de la page Dropbox : ?code=…&state=…
    const q = new URLSearchParams(location.search), pk = jget(PKCE);
    if (pk && q.get('state') === pk.s && (q.get('code') || q.get('error'))) {
      history.replaceState(null, '', location.pathname + location.hash); ls.set(PKCE, null);
      if (q.get('error')) setTimeout(() => toast('Dropbox : autorisation refusée'), 800);
      else tokenReq({ code: q.get('code'), grant_type: 'authorization_code', code_verifier: pk.v, redirect_uri: pk.uri })
        .then(() => { const go = () => L() ? E.activate().catch(e => toast(e.message)).then(() => L().refreshUI()) : setTimeout(go, 200); go(); })
        .catch(e => setTimeout(() => toast(e.message), 800));
    }
  })();

  /* =================== Accès communs =================== */
  const list = () => Object.values(ENGINES);
  window.EPS_CLOUDS = () => list().filter(e => e.P.configured()).map(e => ({ id: e.P.id, name: e.P.name, icon: e.P.icon }));
  window.cloudActive = () => { const e = list().find(x => x.on()); return e ? { id: e.P.id, name: e.P.name } : null; };
  window.cloudConnect = id => ENGINES[id] && ENGINES[id].connect();
  window.gdConnect = () => window.cloudConnect('gdrive');
  let hosts = [];
  window.cloudRender = h => { h.innerHTML = ''; hosts = [];
    list().filter(e => e.P.configured()).forEach(e => { const d = document.createElement('div'); d.style.marginTop = '10px'; h.appendChild(d); hosts.push([e, d]); e.draw(d); }); };
  window.cloudRefresh = () => hosts.forEach(([e, d]) => e.draw(d));
  // Démarrage : récupérer les nouveautés si un cloud est actif
  setTimeout(() => list().forEach(e => { e.pill(); if (e.on() && e.P.hasToken() && !e.collect()) e.pull().catch(() => {}); }), 2500);
})();
