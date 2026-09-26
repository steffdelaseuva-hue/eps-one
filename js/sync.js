/* =========================================================
   EPS ONE — Synchronisation entre appareils (Firebase)
   · Compte e-mail + mot de passe (fiable dans une app installée)
   · Chiffrement de bout en bout : chaque rubrique est chiffrée sur
     l'appareil (AES-256-GCM, clé dérivée du mot de passe, PBKDF2)
     avant l'envoi. Firebase ne stocke que du contenu illisible.
   · epsone/{uid}/data/{rubrique} → { c: chiffré, t: date, dev }
     epsone/{uid}/data/_cle        → témoin permettant de vérifier la clé
   ========================================================= */
const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
const META_KEY = 'epsone_sync_meta', KEY_STORE = 'epsone_key', CHECK_ID = '_cle', CHECK_TXT = 'epsone-ok';
const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h); };
let meta; try { meta = JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch (e) { meta = {}; }
meta.keys = meta.keys || {}; meta.dev = meta.dev || Math.random().toString(36).slice(2, 10);
const saveMeta = () => { try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) {} };

const S = { linkMode: 'merge', ready: false, user: null, status: 'off', last: meta.last || null, err: '', needKey: false, mismatch: false };
window.EPSONE_SYNC = S;
let fb = null, pushTimer = null, unsub = null, applying = false, CK = null;

/* ---------- Chiffrement (WebCrypto) ---------- */
const TE = new TextEncoder(), TD = new TextDecoder();
const toB64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const fromB64 = b => Uint8Array.from(atob(b), c => c.charCodeAt(0));
async function deriveKey(email, password) {
  const base = await crypto.subtle.importKey('raw', TE.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: TE.encode('epsone-v1|' + email.trim().toLowerCase()), iterations: 210000, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}
async function storeKey(email, key) { const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key)); try { localStorage.setItem(KEY_STORE, JSON.stringify({ e: email.trim().toLowerCase(), k: toB64(raw) })); } catch (e) {} }
async function loadKey(email) {
  try { const o = JSON.parse(localStorage.getItem(KEY_STORE)); if (!o || o.e !== email.trim().toLowerCase()) return null;
    return await crypto.subtle.importKey('raw', fromB64(o.k), { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']); } catch (e) { return null; }
}
const forgetKey = () => { CK = null; try { localStorage.removeItem(KEY_STORE); } catch (e) {} };
async function encrypt(str, key = CK) { const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, TE.encode(str)));
  const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12); return toB64(out); }
async function decrypt(b64, key = CK) { const u = fromB64(b64); return TD.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, key, u.subarray(12))); }
async function keyMatches(key) {
  const { doc, getDoc } = fb.fs; const d = await getDoc(doc(fb.db, 'epsone', S.user.uid, 'data', CHECK_ID));
  if (!d.exists()) return null;                                         // pas encore de témoin
  try { return (await decrypt(d.data().c, key)) === CHECK_TXT; } catch (e) { return false; }
}
async function writeCheck() { const { doc, setDoc } = fb.fs; await setDoc(doc(fb.db, 'epsone', S.user.uid, 'data', CHECK_ID), { c: await encrypt(CHECK_TXT), t: Date.now() }); }

/* ---------- Synchronisation par fusion (plusieurs appareils en même temps) ----------
   Chaque appareil garde la « base » : la dernière version reçue du serveur pour chaque rubrique.
   Fusion à 3 voies (base, cet appareil, serveur) : les ajouts des deux côtés sont conservés,
   une suppression faite d'un côté est appliquée, et en cas de conflit sur une même valeur
   c'est cet appareil qui garde la sienne. Les envois passent par une transaction : deux
   tablettes qui envoient en même temps ne s'écrasent pas. */
const BASE_KEY = 'epsone_sync_base';
let BASE; try { BASE = JSON.parse(localStorage.getItem(BASE_KEY)) || {}; } catch (e) { BASE = {}; }
const saveBase = () => { try { localStorage.setItem(BASE_KEY, JSON.stringify(BASE)); } catch (e) {} };
const setBase = (k, v) => { if (v && typeof v === 'object') BASE[k] = JSON.stringify(v); else delete BASE[k]; };
const getBase = k => { try { return BASE[k] != null ? JSON.parse(BASE[k]) : undefined; } catch (e) { return undefined; } };
const jeq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const itemKey = x => isObj(x) ? (x.id != null ? 'id:' + x.id : x.k != null ? 'k:' + x.k : x.name != null ? 'name:' + x.name : x.nom != null ? 'nom:' + x.nom : 'json:' + JSON.stringify(x)) : 'val:' + JSON.stringify(x);
function merge3(base, loc, rem) {
  if (jeq(loc, rem)) return loc;
  if (base === undefined) return mergeData(loc, rem);          // pas d'historique commun : union
  if (jeq(loc, base)) return rem;
  if (jeq(rem, base)) return loc;
  if (Array.isArray(loc) && Array.isArray(rem)) {
    const B = new Map((Array.isArray(base) ? base : []).map(x => [itemKey(x), x]));
    const L = new Map(loc.map(x => [itemKey(x), x])), R = new Map(rem.map(x => [itemKey(x), x]));
    const out = [];
    for (const x of loc) { const k = itemKey(x);
      if (R.has(k)) out.push(isObj(x) || Array.isArray(x) ? merge3(B.get(k), x, R.get(k)) : x);
      else if (!B.has(k)) out.push(x); }                        // ajouté ici ; sinon supprimé sur le serveur
    for (const x of rem) { const k = itemKey(x); if (!L.has(k) && !B.has(k)) out.push(x); }  // ajouté ailleurs
    return out;
  }
  if (isObj(loc) && isObj(rem)) { const b = isObj(base) ? base : {}, out = {};
    for (const k of new Set([...Object.keys(loc), ...Object.keys(rem)])) {
      const inL = k in loc, inR = k in rem, inB = k in b;
      if (inL && inR) out[k] = merge3(inB ? b[k] : undefined, loc[k], rem[k]);
      else if (inL) { if (!inB || !jeq(loc[k], b[k])) out[k] = loc[k]; }   // supprimé ailleurs sauf si modifié ici
      else { if (!inB || !jeq(rem[k], b[k])) out[k] = rem[k]; } }
    return out; }
  return loc;                                                    // valeur simple en conflit : cet appareil garde la sienne
}
const readDoc = async r => { if (!r) return undefined; if (typeof r.c === 'string') return JSON.parse(await decrypt(r.c)); if (typeof r.v === 'string') return JSON.parse(r.v); return undefined; };

/* ---------- Envoi (groupé) des rubriques modifiées ---------- */
let pushing = false;
async function pushChanged() {
  if (!fb || !S.user || !CK || S.mismatch || !accessOK() || pushing) return;
  const { doc, runTransaction } = fb.fs;
  const keys = Object.keys(DB).filter(k => meta.keys[k]?.h !== hash(JSON.stringify(DB[k] ?? null)));
  if (!keys.length) return;
  pushing = true; S.status = 'sync'; refreshUI(); let changedLocal = false;
  try {
    for (const k of keys) {
      const ref = doc(fb.db, 'epsone', S.user.uid, 'data', k); let out, t;
      await runTransaction(fb.db, async tx => {
        const d = await tx.get(ref), local = DB[k] ?? null; out = local;
        if (d.exists()) { const r = d.data(); if (!(r.dev === meta.dev && r.t === meta.keys[k]?.t)) out = merge3(getBase(k), local, await readDoc(r)); }
        const j = JSON.stringify(out ?? null); if (j.length > 700000) throw new Error(`Rubrique « ${k} » trop volumineuse pour la synchronisation`);
        t = Date.now(); tx.set(ref, { c: await encrypt(j), t, dev: meta.dev });
      });
      if (!jeq(out, DB[k] ?? null)) { applying = true; DB[k] = out; applying = false; changedLocal = true; }
      setBase(k, out); meta.keys[k] = { h: hash(JSON.stringify(out ?? null)), t };
    }
    S.status = 'ok'; S.err = ''; S.last = meta.last = Date.now();
  } catch (e) { S.status = 'error'; S.err = e.message; }
  pushing = false; saveBase(); saveMeta();
  if (changedLocal) { _save(); try { if (!document.getElementById('screen').classList.contains('open')) renderHome(); } catch (e) {} }
  refreshUI();
}
// Envois groupés : au plus un envoi toutes les 10 s pendant que l'on saisit (économise le quota Firebase)
const PUSH_EVERY = 10000;
const schedulePush = () => { if (applying || !S.user || pushTimer) return; pushTimer = setTimeout(() => { pushTimer = null; pushChanged(); }, PUSH_EVERY); };
window.syncFlush = () => { if (!S.user) return; clearTimeout(pushTimer); pushTimer = setTimeout(() => { pushTimer = null; pushChanged(); }, 1200); };
const forcePushAll = async () => { Object.keys(DB).forEach(k => { meta.keys[k] = { h: 'x', t: meta.keys[k]?.t || 0 }; }); await pushChanged(); };

/* Chaque sauvegarde locale programme un envoi groupé */
const _save = window.save;
window.save = function () { _save(); schedulePush(); };

/* ---------- Réception : fusion des données venues des autres appareils ---------- */
async function applyRemote(k, r) {
  if (k === CHECK_ID || !r) return false;
  if (r.dev === meta.dev && meta.keys[k]?.t >= r.t) return false;          // notre propre envoi
  let rv; try { rv = await readDoc(r); } catch (e) { S.mismatch = true; S.status = 'error'; refreshUI(); return false; }
  if (rv === undefined) return false;
  const local = DB[k] ?? null, m = meta.keys[k], dirty = m && m.h !== hash(JSON.stringify(local));
  const out = !m ? (replaceOnce || local == null ? rv : mergeData(local, rv)) : dirty ? merge3(getBase(k), local, rv) : rv;
  setBase(k, rv);
  applying = true; DB[k] = out; applying = false;
  meta.keys[k] = { h: dirty || !m ? (jeq(out, rv) ? hash(JSON.stringify(rv)) : 'x') : hash(JSON.stringify(rv)), t: r.t };
  return !jeq(out, local);
}
let replaceOnce = false;
async function applySnap(docs) {
  let changed = false;
  for (const x of docs) { if (await applyRemote(x.id, x.data())) changed = true; }
  replaceOnce = false;
  saveBase(); saveMeta();
  if (Object.keys(DB).some(k => meta.keys[k]?.h === 'x')) schedulePush();
  if (changed) { _save(); S.last = meta.last = Date.now(); S.status = 'ok'; refreshUI();
    try { if (!document.getElementById('screen').classList.contains('open')) renderHome(); } catch (e) {}
    toast('🔄 Données synchronisées'); }
}
function listen() {
  const { collection, onSnapshot } = fb.fs;
  unsub && unsub(); unsub = null;
  if (meta.collect) { pullAll(); return; }                              // tablette de collecte : pas d'écoute en direct
  unsub = onSnapshot(collection(fb.db, 'epsone', S.user.uid, 'data'), snap => applySnap(snap.docChanges().filter(c => c.type !== 'removed').map(c => c.doc)),
    e => { S.status = 'error'; S.err = e.message; refreshUI(); });
}
async function pullAll() {
  const { collection, getDocs } = fb.fs;
  try { const snap = await getDocs(collection(fb.db, 'epsone', S.user.uid, 'data')); await applySnap(snap.docs); } catch (e) { S.status = 'error'; S.err = e.message; refreshUI(); }
}

/* Fusion « Combiner » : ajoute les données du compte sans effacer celles de l'appareil.
   Listes : éléments rapprochés par id, sinon par nom (ex. classes), sans doublon.
   Objets : fusion clé par clé ; en cas de conflit sur une valeur simple, l'appareil garde la sienne. */
const isObj = x => x && typeof x === 'object' && !Array.isArray(x);
function mergeData(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    const out = a.slice(), keyOf = x => isObj(x) ? (x.id != null ? 'id:' + x.id : x.name != null ? 'name:' + x.name : 'json:' + JSON.stringify(x)) : 'val:' + JSON.stringify(x);
    const idx = new Map(out.map((x, i) => [keyOf(x), i]));
    for (const x of b) { const k = keyOf(x);
      if (!idx.has(k)) { idx.set(k, out.length); out.push(x); }
      else if (isObj(x)) out[idx.get(k)] = mergeData(out[idx.get(k)], x); }
    return out;
  }
  if (isObj(a) && isObj(b)) { const out = { ...a };
    for (const k of Object.keys(b)) out[k] = (out[k] === undefined || out[k] === null) ? b[k] : mergeData(out[k], b[k]);
    return out; }
  return a;
}

/* Branchement d'un appareil sur le compte (clé disponible) */
async function startSync() {
  if (!accessOK() || !S.user) return;
  S.needKey = false; S.mismatch = false;
  const ok = await keyMatches(CK);
  if (ok === false) { S.mismatch = true; S.status = 'error'; refreshUI(); return; }
  const { collection, getDocs } = fb.fs;
  const snap = await getDocs(collection(fb.db, 'epsone', S.user.uid, 'data'));
  const remoteHasData = snap.docs.some(d => d.id !== CHECK_ID), localHasData = DB.classes?.length || DB.grilles?.length || Object.keys(meta.keys).length;
  if (remoteHasData && localHasData && !meta.linked) {
    if (S.linkMode !== 'replace') {                                       // Combiner : on fusionne, rien n'est effacé
      for (const d of snap.docs) {
        if (d.id === CHECK_ID) continue; const r = d.data(); let v;
        try { v = typeof r.c === 'string' ? await decrypt(r.c) : r.v; } catch (e) { continue; }
        if (typeof v !== 'string') continue;
        try { DB[d.id] = DB[d.id] === undefined ? JSON.parse(v) : mergeData(DB[d.id], JSON.parse(v)); } catch (e) {}
      }
      _save(); meta.keys = {}; meta.linked = true; saveMeta();
      if (ok === null) await writeCheck();
      await forcePushAll(); listen(); refreshUI();
      try { if (!document.getElementById('screen').classList.contains('open')) renderHome(); } catch (e) {}
      toast('🔄 Données combinées'); return;
    }
    meta.keys = {}; replaceOnce = true;                                   // Remplacer : l'appareil reprend la sauvegarde du compte
  }
  if (!remoteHasData) meta.keys = {};
  meta.linked = true; saveMeta();
  listen();                                                             // applique les données du compte
  if (ok === null) { await writeCheck(); setTimeout(forcePushAll, 2500); } // 1er chiffrement : tout renvoyer chiffré
  else setTimeout(pushChanged, 2500);
  refreshUI();
}

/* ---------- Accès sur invitation ----------
   access/{uid} = { email, status: 'pending' | 'approved' | 'refused', date }
   L'administrateur approuve les comptes. Un appareil approuvé une fois reste
   utilisable (y compris en stockage local) tant que l'accès n'est pas retiré. */
const ADMIN_EMAIL = 'steffdelaseuva@gmail.com', ACC_KEY = 'epsone_access';
const isAdminUser = u => !!u && (u.email || '').toLowerCase() === ADMIN_EMAIL;
let accCache; try { accCache = JSON.parse(localStorage.getItem(ACC_KEY)) || null; } catch (e) { accCache = null; }
const setAcc = v => { accCache = v; try { v ? localStorage.setItem(ACC_KEY, JSON.stringify(v)) : localStorage.removeItem(ACC_KEY); } catch (e) {} };
const deviceOK = () => !!accCache && (accCache.st === 'approved' || accCache.st === 'admin');
let accUnsub = null, gateBooted = false;
S.access = null;                                  // 'admin' | 'approved' | 'pending' | 'refused' | 'error'
function watchAccess(u) {
  accUnsub && accUnsub(); accUnsub = null;
  if (isAdminUser(u)) { S.access = 'admin'; setAcc({ st: 'admin', email: u.email }); return Promise.resolve('admin'); }
  const { doc, getDoc, setDoc, onSnapshot } = fb.fs, ref = doc(fb.db, 'access', u.uid);
  return (async () => {
    try { const d = await getDoc(ref);
      if (!d.exists()) await setDoc(ref, { email: u.email, status: 'pending', date: Date.now() });
    } catch (e) { S.access = deviceOK() ? accCache.st : 'error'; gate(); return S.access; }
    return new Promise(res => { let first = true;
      accUnsub = onSnapshot(ref, snap => { const st = snap.exists() ? snap.data().status : 'pending'; const was = S.access; S.access = st;
        if (st === 'approved') setAcc({ st: 'approved', email: u.email }); else if (st === 'refused') setAcc(null);
        if (first) { first = false; res(st); } else { gate(); if (st === 'approved' && was !== 'approved') { toast('✅ Accès validé'); S.user && startSync().catch(() => {}); } } },
        () => { S.access = deviceOK() ? accCache.st : 'error'; if (first) { first = false; res(S.access); } gate(); });
    });
  })();
}
const accessOK = () => S.access === 'admin' || S.access === 'approved' || (!S.user && deviceOK());
function gate() {
  let g = document.getElementById('eps-gate');
  if (!window.EPSONE_FIREBASE || accessOK()) { if (g) g.remove(); try { renderPlus(); } catch (e) {} return; }
  if (!g) { g = document.createElement('div'); g.id = 'eps-gate';
    g.style.cssText = 'position:fixed;inset:0;z-index:400;background:var(--bg,#F2F5FB);overflow:auto;padding:24px 16px;display:flex;justify-content:center;align-items:flex-start'; document.body.appendChild(g); }
  const errP = S.err ? `<p style="color:var(--danger);font-size:.85rem">${esc(S.err)}</p>` : '';
  const head = `<div style="text-align:center;margin:10px 0 16px"><img src="icons/icone-v3-192.png" alt="" style="width:76px;height:76px;border-radius:18px"><h2 style="margin:10px 0 2px">EPS ONE</h2><div class="muted">Accès réservé</div></div>`;
  let body;
  if (!gateBooted) body = `<div class="card" style="text-align:center"><p class="muted" style="margin:0">Chargement…</p></div>`;
  else if (!S.ready) body = `<div class="card"><h3>📶 Connexion nécessaire</h3><p class="muted">La première connexion à EPS ONE demande internet. Vérifiez la connexion puis réessayez.</p><button class="btn btn-grad btn-block" onclick="location.reload()">Réessayer</button></div>`;
  else if (!S.user) body = `<div class="card"><h3>🔑 Connexion</h3>
      <p class="muted" style="margin:4px 0 0">EPS ONE est accessible sur invitation. Créez un compte : votre demande sera validée par l'administrateur.</p>
      <label>E-mail</label><input id="gt-mail" type="email" autocomplete="username" value="${esc(meta.mail || '')}">
      <label>Mot de passe (6 caractères minimum)</label><input id="gt-pass" type="password" autocomplete="current-password">${errP}
      <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="gt-in">Se connecter</button><button class="btn btn-ghost" id="gt-new">Demander un accès</button></div>
      <button class="link" style="margin-top:10px" id="gt-forgot">Mot de passe oublié ?</button></div>`;
  else if (S.access === 'refused') body = `<div class="card"><h3>⛔ Accès refusé</h3><p class="muted">Le compte <b>${esc(S.user.email)}</b> n'a pas accès à EPS ONE.</p><button class="btn btn-ghost btn-block" id="gt-out">Se déconnecter</button></div>`;
  else body = `<div class="card"><h3>⏳ Demande en attente</h3>
      <p style="line-height:1.45">Votre demande d'accès pour <b>${esc(S.user.email)}</b> a été envoyée. L'app s'ouvrira automatiquement dès que l'administrateur l'aura validée.</p>${S.access === 'error' ? '<p class="muted" style="font-size:.82rem">Vérification impossible pour le moment (connexion ?).</p>' : ''}
      <button class="btn btn-ghost btn-block" id="gt-out">Se déconnecter</button></div>`;
  g.innerHTML = `<div style="max-width:440px;width:100%">${head}${body}</div>`;
  const $ = q => g.querySelector(q);
  const run = async fn => { S.err = ''; try { await fn(); } catch (e) { S.err = ({ 'auth/invalid-credential': 'E-mail ou mot de passe incorrect.', 'auth/email-already-in-use': 'Un compte existe déjà avec cet e-mail : connectez-vous.', 'auth/weak-password': 'Mot de passe trop court (6 caractères minimum).', 'auth/invalid-email': 'E-mail invalide.', 'auth/network-request-failed': 'Pas de connexion internet.', 'auth/too-many-requests': 'Trop d\'essais : réessayez plus tard.' })[e.code] || e.message; } gate(); };
  if ($('#gt-in')) {
    const creds = () => { const m = $('#gt-mail').value.trim(), p = $('#gt-pass').value; meta.mail = m; saveMeta(); if (!m || !p) throw new Error('E-mail et mot de passe requis.'); return [m, p]; };
    const login = create => run(async () => { const [m, p] = creds(); CK = await deriveKey(m, p); setMode('cloud');
      try { await (create ? fb.authM.createUserWithEmailAndPassword : fb.authM.signInWithEmailAndPassword)(fb.auth, m, p); await storeKey(m, CK); } catch (e) { CK = null; throw e; } });
    $('#gt-in').onclick = () => login(false); $('#gt-new').onclick = () => login(true);
    $('#gt-forgot').onclick = () => run(async () => { const m = $('#gt-mail').value.trim(); if (!m) throw new Error('Indiquez votre e-mail.'); await fb.authM.sendPasswordResetEmail(fb.auth, m); toast('E-mail de réinitialisation envoyé'); });
  }
  if ($('#gt-out')) $('#gt-out').onclick = () => run(async () => { forgetKey(); await fb.authM.signOut(fb.auth); });
}
window.isEpsAdmin = () => isAdminUser(S.user);

/* Panneau administrateur : valider les demandes */
window.openAccessAdmin = () => openPanel('Accès des collègues', el => {
  const box = document.createElement('div'); el.appendChild(box);
  if (!isAdminUser(S.user) || !fb) { box.innerHTML = '<div class="card empty">Réservé à l\'administrateur connecté.</div>'; return; }
  const { collection, onSnapshot, doc, setDoc, deleteDoc } = fb.fs; let list = [];
  const LBL = { pending: ['⏳ En attente', 'var(--gold)'], approved: ['✅ Autorisé', '#1B9E5A'], refused: ['⛔ Refusé', 'var(--danger)'] };
  const draw = () => { const order = { pending: 0, approved: 1, refused: 2 }; list.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3) || (b.date || 0) - (a.date || 0));
    box.innerHTML = `<div class="card"><p style="margin:0;line-height:1.45">Les collègues créent leur compte depuis l'écran « Accès réservé ». Leur demande apparaît ici : <b>vous seul</b> décidez qui peut utiliser EPS ONE.</p>
      <p class="muted" style="margin:6px 0 0;font-size:.82rem">${list.filter(x => x.status === 'pending').length} en attente · ${list.filter(x => x.status === 'approved').length} autorisé(s)</p></div>
      ${list.length ? list.map(x => `<div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="word-break:break-all">${esc(x.email || x.id)}</b><span style="font-weight:800;font-size:.8rem;color:${(LBL[x.status] || ['', 'inherit'])[1]};white-space:nowrap">${(LBL[x.status] || [x.status])[0]}</span></div>
        <div class="muted" style="font-size:.78rem">Demande du ${x.date ? new Date(x.date).toLocaleDateString('fr-FR') : '?'}</div>
        <div class="row" style="margin-top:8px;gap:6px">${x.status !== 'approved' ? `<button class="btn btn-grad" data-ok="${x.id}">✅ Autoriser</button>` : ''}${x.status !== 'refused' ? `<button class="btn btn-ghost" data-ko="${x.id}">${x.status === 'approved' ? '⛔ Retirer l\'accès' : '⛔ Refuser'}</button>` : ''}<button class="btn btn-ghost" style="flex:0 0 44px" data-rm="${x.id}">🗑</button></div></div>`).join('')
        : '<div class="card empty" style="margin-top:10px">Aucune demande pour l\'instant.</div>'}`;
    const set = (id, st) => { const { id: _i, ...rest } = list.find(x => x.id === id) || {}; setDoc(doc(fb.db, 'access', id), { ...rest, status: st, decided: Date.now() }).then(() => toast(st === 'approved' ? 'Accès autorisé ✔' : 'Accès retiré')).catch(e => toast(e.message)); };
    box.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => set(b.dataset.ok, 'approved'));
    box.querySelectorAll('[data-ko]').forEach(b => b.onclick = () => { if (confirm('Refuser / retirer l\'accès à ce compte ?')) set(b.dataset.ko, 'refused'); });
    box.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { if (confirm('Effacer cette demande de la liste ? (le compte pourra redemander un accès)')) deleteDoc(doc(fb.db, 'access', b.dataset.rm)).catch(e => toast(e.message)); }); };
  const un = onSnapshot(collection(fb.db, 'access'), snap => { list = snap.docs.map(d => ({ id: d.id, ...d.data() })); draw(); }, e => { box.innerHTML = `<div class="card empty">Lecture impossible : ${esc(e.message)}<br>Les règles Firestore ont-elles été publiées ?</div>`; });
  const obs = new MutationObserver(() => { if (!box.isConnected) { un(); obs.disconnect(); } }); obs.observe(document.body, { childList: true, subtree: true });
});

/* ---------- Démarrage ---------- */
async function boot() {
  if (!window.EPSONE_FIREBASE) { S.status = 'unconfigured'; refreshUI(); return; }
  try {
    const [appM, authM, fsM] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')]);
    const app = appM.initializeApp(window.EPSONE_FIREBASE, 'epsone');
    const auth = authM.getAuth(app);
    let db; try { db = fsM.initializeFirestore(app, { localCache: fsM.persistentLocalCache() }); } catch (e) { db = fsM.getFirestore(app); }
    fb = { auth, authM, db, fs: fsM }; S.ready = true;
    authM.onAuthStateChanged(auth, async u => {
      S.user = u; S.status = u ? 'ok' : 'off'; S.needKey = false; S.mismatch = false; gateBooted = true;
      if (u) { S.access = null; await watchAccess(u); gate(); if (!accessOK()) { refreshUI(); return; }
        CK = CK || await loadKey(u.email); if (!CK) { S.needKey = true; refreshUI(); return; }
        try { await startSync(); } catch (e) { S.status = 'error'; S.err = e.message; } }
      else { unsub && unsub(); unsub = null; accUnsub && accUnsub(); accUnsub = null; S.access = null; gate(); }
      refreshUI();
    });
  } catch (e) { S.status = 'error'; S.err = 'Connexion à Firebase impossible (hors ligne ?)'; gateBooted = true; gate(); refreshUI(); }
}
window.addEventListener('online', () => S.user && pushChanged());
document.addEventListener('visibilitychange', () => { if (!S.user) return; if (document.visibilityState === 'hidden') { clearTimeout(pushTimer); pushTimer = null; pushChanged(); } else { pushChanged(); if (meta.collect) pullAll(); } });
window.addEventListener('pagehide', () => { if (S.user) pushChanged(); });

/* ---------- Interface ---------- */
const statusText = () => S.user ? (S.needKey ? 'Mode : synchronisé · mot de passe requis' : S.mismatch ? 'Mode : synchronisé · clé à mettre à jour' : ({ sync: 'Mode : synchronisé · envoi…', error: 'Mode : synchronisé · erreur' })[S.status] || `Mode : synchronisé · ${S.user.email}`) : 'Mode : stockage local (cet appareil uniquement)';
function refreshUI() {
  const sub = document.getElementById('sync-sub'); if (sub) sub.textContent = statusText();
  const box = document.getElementById('sync-panel'); if (box) drawPanel(box);
}
const E2E_TXT = `<div class="card" style="margin-top:12px"><h3>🔒 Chiffrement de bout en bout</h3>
  <p style="margin:6px 0;font-size:.9rem;line-height:1.45">Vos données sont <b>chiffrées sur cet appareil avant l'envoi</b> (AES-256), avec une clé tirée de votre mot de passe. Firebase ne stocke que du contenu illisible : <b>personne d'autre — ni Google, ni l'administrateur du projet — ne peut les lire</b>.</p>
  <p class="muted" style="margin:0;font-size:.82rem">⚠️ Si vous oubliez votre mot de passe, les données en ligne deviennent illisibles. Celles de vos appareils sont conservées et pourront être renvoyées après la réinitialisation.</p></div>`;
function drawPanel(el) {
  el.id = 'sync-panel';
  if (S.status === 'unconfigured') {
    el.innerHTML = `<div class="card doc"><h3>☁️ Synchronisation iPhone ↔ iPad</h3><p>La synchronisation n'est pas encore configurée.</p>
      <p class="muted">Il faut coller la configuration de votre projet Firebase dans le fichier <code>js/firebase-config.js</code>, puis republier l'app.</p></div>`; return;
  }
  const last = S.last ? new Date(S.last).toLocaleString('fr-FR') : 'jamais';
  const errP = S.err ? `<p style="color:var(--danger);font-size:.85rem">${esc(S.err)}</p>` : '';
  if (S.user && S.needKey) {
    el.innerHTML = `<div class="card"><h3>🔒 Activer le chiffrement sur cet appareil</h3>
        <p class="muted" style="margin:4px 0 0">Compte : <b>${esc(S.user.email)}</b>. Saisissez votre mot de passe une fois : il sert à créer la clé de chiffrement de cet appareil. La synchronisation reprend ensuite automatiquement.</p>
        <label>Mot de passe</label><input id="sy-kp" type="password" autocomplete="current-password">${errP}
        <button class="btn btn-grad btn-block" style="margin-top:12px" id="sy-kgo">🔒 Activer le chiffrement</button>
        <button class="link" style="margin-top:10px" id="sy-kout">Se déconnecter</button></div>${E2E_TXT}`;
  } else if (S.user && S.mismatch) {
    el.innerHTML = `<div class="card"><h3>🔑 Clé de chiffrement différente</h3>
        <p style="font-size:.9rem;line-height:1.45;margin:6px 0">Les données en ligne ont été chiffrées avec un autre mot de passe (mot de passe réinitialisé ou changé sur un autre appareil ?).</p>
        <label>Mot de passe utilisé sur l'autre appareil</label><input id="sy-mp" type="password">${errP}
        <button class="btn btn-grad btn-block" style="margin-top:10px" id="sy-mgo">Déverrouiller avec ce mot de passe</button>
        <p class="muted" style="margin:14px 0 6px;font-size:.82rem">Ou bien : remplacer les données en ligne par celles de cet appareil (elles seront chiffrées avec votre mot de passe actuel ; les autres appareils devront saisir ce mot de passe).</p>
        <button class="btn btn-danger btn-block" id="sy-mrep">Remplacer les données en ligne par celles de cet appareil</button></div>`;
  } else if (S.user) {
    el.innerHTML = `<div class="card"><h3>☁️ Synchronisation activée</h3>
        <p style="margin:6px 0">Compte : <b>${esc(S.user.email)}</b></p><p class="muted" style="margin:0">État : ${statusText()} · dernière synchro : ${last}</p>${errP}
        <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="sy-now">🔄 Synchroniser maintenant</button><button class="btn btn-ghost" id="sy-out">Revenir en stockage local</button></div>
        <label style="display:flex;gap:8px;align-items:flex-start;margin-top:14px;color:var(--text);font-weight:600"><input type="checkbox" id="sy-col" ${meta.collect ? 'checked' : ''} style="width:auto;margin-top:3px"><span>📥 Tablette de collecte<br><span class="muted" style="font-weight:400;font-size:.82rem">Pour les tablettes prêtées pendant un cours : elles envoient leurs relevés sans suivre en direct les autres appareils (économise le quota). Les données de toutes les tablettes se retrouvent fusionnées sur votre compte.</span></span></label></div>
      ${E2E_TXT}
      <div class="card" style="margin-top:12px"><h3>🗑 Supprimer mes données en ligne</h3>
        <p class="muted" style="margin:4px 0 10px">Efface toutes vos données stockées sur Firebase et arrête la synchronisation. Les données restent sur cet appareil.</p>
        <button class="btn btn-danger btn-block" id="sy-del">Supprimer mes données en ligne</button></div>
      <p class="muted" style="margin:12px 4px">Connectez-vous avec le même compte sur l'iPhone et l'iPad : classes, résultats, grilles, séances… se mettent à jour automatiquement. Sans réseau, l'app continue de marcher et se synchronise au retour de la connexion.</p>`;
  } else {
    el.innerHTML = `<div class="card" style="background:var(--grad-soft)"><b>📱 Mode actuel : stockage local</b><p class="muted" style="margin:4px 0 0">Vos données restent uniquement sur cet appareil. Connectez-vous ci-dessous pour les synchroniser avec vos autres appareils.</p></div>
      <div class="card" style="margin-top:12px"><h3>☁️ Passer en mode « compte e-mail »</h3>
        <p class="muted" style="margin:4px 0 0">Créez un compte une fois, puis connectez-vous avec le même compte sur chaque appareil.</p>
        <p style="margin:12px 0 6px;font-weight:700;font-size:.92rem">Si ce compte contient déjà des données, que faire de celles de cet appareil ?</p>
        <label class="card" style="display:flex;gap:10px;align-items:flex-start;padding:10px 12px;margin:0 0 8px;border:1.5px solid var(--line);cursor:pointer;color:var(--text);font-weight:400"><input type="radio" name="sy-lm" value="merge" ${S.linkMode !== 'replace' ? 'checked' : ''} style="width:auto;margin-top:3px"><span><b>Combiner</b><br><span class="muted" style="font-size:.85rem">Ajoute les données du compte sans effacer celles de l'appareil.</span></span></label>
        <label class="card" style="display:flex;gap:10px;align-items:flex-start;padding:10px 12px;margin:0;border:1.5px solid var(--line);cursor:pointer;color:var(--text);font-weight:400"><input type="radio" name="sy-lm" value="replace" ${S.linkMode === 'replace' ? 'checked' : ''} style="width:auto;margin-top:3px"><span><b>Remplacer</b><br><span class="muted" style="font-size:.85rem">Efface cet appareil puis récupère les données du compte.</span></span></label>
        <label>E-mail</label><input id="sy-mail" type="email" autocomplete="username" value="${esc(meta.mail || '')}">
        <label>Mot de passe (6 caractères minimum)</label><input id="sy-pass" type="password" autocomplete="current-password">${errP}
        <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="sy-in">Se connecter</button><button class="btn btn-ghost" id="sy-new">Créer un compte</button></div>
        <button class="link" style="margin-top:10px" id="sy-forgot">Mot de passe oublié ?</button></div>
      ${E2E_TXT}`;
  }
  const $ = s => el.querySelector(s);
  const run = async fn => { S.err = ''; try { await fn(); } catch (e) { S.err = ({ 'auth/invalid-credential': 'E-mail ou mot de passe incorrect.', 'auth/wrong-password': 'Mot de passe incorrect.', 'auth/user-not-found': 'Aucun compte avec cet e-mail.', 'auth/email-already-in-use': 'Un compte existe déjà avec cet e-mail : connectez-vous.', 'auth/weak-password': 'Mot de passe trop court (6 caractères minimum).', 'auth/invalid-email': 'E-mail invalide.', 'auth/network-request-failed': 'Pas de connexion internet.', 'auth/too-many-requests': 'Trop d\'essais : réessayez dans quelques minutes.' })[e.code] || e.message; } refreshUI(); };
  const verifyPassword = async p => { const c = fb.authM.EmailAuthProvider.credential(S.user.email, p); await fb.authM.reauthenticateWithCredential(fb.auth.currentUser, c); };
  if (S.user && S.needKey) {
    $('#sy-kgo').onclick = () => run(async () => { const p = $('#sy-kp').value; if (!p) throw new Error('Saisissez votre mot de passe.');
      await verifyPassword(p); CK = await deriveKey(S.user.email, p); await storeKey(S.user.email, CK); await startSync(); toast('Chiffrement activé ✔'); });
    $('#sy-kout').onclick = () => run(async () => { setMode('local'); forgetKey(); await fb.authM.signOut(fb.auth); });
  } else if (S.user && S.mismatch) {
    $('#sy-mgo').onclick = () => run(async () => { const p = $('#sy-mp').value; if (!p) throw new Error('Saisissez le mot de passe.');
      const k = await deriveKey(S.user.email, p); if ((await keyMatches(k)) !== true) throw new Error('Ce mot de passe ne correspond pas aux données en ligne.');
      CK = k; await storeKey(S.user.email, CK); await startSync(); toast('Données déverrouillées ✔'); });
    $('#sy-mrep').onclick = () => run(async () => { if (!confirm('Remplacer toutes les données en ligne par celles de cet appareil ?')) return;
      unsub && unsub(); unsub = null; S.mismatch = false; await writeCheck(); await forcePushAll(); meta.linked = true; saveMeta(); listen(); toast('Données en ligne remplacées ✔'); });
  } else if (S.user) {
    $('#sy-now').onclick = () => run(async () => { await forcePushAll(); await pullAll(); toast('Synchronisé ✔'); });
    $('#sy-col').onchange = e => { meta.collect = e.target.checked; saveMeta(); listen(); toast(meta.collect ? 'Tablette de collecte ✔' : 'Synchronisation en direct ✔'); };
    $('#sy-out').onclick = () => run(async () => { if (!confirm('Revenir en stockage local ?\nLa synchronisation s\'arrête sur cet appareil. Vos données restent ici et en ligne.')) return; setMode('local'); forgetKey(); await fb.authM.signOut(fb.auth); });
    $('#sy-del').onclick = () => run(async () => {
      if (!confirm('Supprimer toutes vos données en ligne ?\nElles resteront seulement sur cet appareil. Vos autres appareils ne seront plus synchronisés.')) return;
      const { collection, getDocs, deleteDoc } = fb.fs; unsub && unsub(); unsub = null;
      const snap = await getDocs(collection(fb.db, 'epsone', S.user.uid, 'data'));
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
      let accountMsg = '';
      try { await fb.authM.deleteUser(fb.auth.currentUser); accountMsg = ' et compte supprimé'; } catch (e) { await fb.authM.signOut(fb.auth); }
      meta.keys = {}; meta.linked = false; saveMeta(); BASE = {}; saveBase(); forgetKey(); setMode('local');
      toast('Données en ligne supprimées' + accountMsg + ' ✔');
    });
  } else {
    el.querySelectorAll('[name=sy-lm]').forEach(r => r.onchange = () => { S.linkMode = r.value; });
    const creds = () => { const m = $('#sy-mail').value.trim(), p = $('#sy-pass').value; meta.mail = m; saveMeta(); return [m, p]; };
    const login = create => run(async () => { if (!fb) throw new Error('Firebase indisponible (hors ligne ?)');
      const [m, p] = creds(); if (!m || !p) throw new Error('E-mail et mot de passe requis.');
      CK = await deriveKey(m, p); setMode('cloud');
      try { await (create ? fb.authM.createUserWithEmailAndPassword : fb.authM.signInWithEmailAndPassword)(fb.auth, m, p); await storeKey(m, CK); }
      catch (e) { CK = null; throw e; } });
    $('#sy-in').onclick = () => login(false);
    $('#sy-new').onclick = () => login(true);
    $('#sy-forgot').onclick = () => run(async () => { const [m] = creds(); if (!m) throw new Error('Indiquez votre e-mail.'); await fb.authM.sendPasswordResetEmail(fb.auth, m); toast('E-mail de réinitialisation envoyé'); });
  }
}
window.openSync = () => openPanel('Synchronisation', el => { const d = document.createElement('div'); el.appendChild(d); drawPanel(d); });
window.syncStatusText = statusText;

/* ---------- Mode de stockage (par appareil) ---------- */
function getMode() { try { return localStorage.getItem('epsone_mode'); } catch (e) { return null; } }
function setMode(m) { try { localStorage.setItem('epsone_mode', m); } catch (e) {} try { renderPlus(); } catch (e) {} }
function chooser() {
  if (getMode() || meta.linked || !window.EPSONE_FIREBASE) { if (!getMode()) setMode(meta.linked ? 'cloud' : 'local'); return; }
  const o = document.createElement('div');
  o.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(7,18,42,.72);display:grid;place-items:center;padding:16px';
  o.innerHTML = `<div class="card" style="max-width:460px;width:100%">
      <h3 style="font-size:1.2rem">Où enregistrer vos données ?</h3>
      <p class="muted" style="margin:6px 0 12px">Vous pourrez changer d'avis à tout moment dans Plus → Stockage & synchronisation.</p>
      <button class="menu-item card" data-m="local" style="width:100%;text-align:left;margin-bottom:10px;border:1.5px solid var(--line)"><span class="mi-ic blue" style="font-size:1.4rem">📱</span><span><b>Stockage local</b><span class="muted">Les données restent sur cet appareil. Rien n'est envoyé en ligne.</span></span></button>
      <button class="menu-item card" data-m="cloud" style="width:100%;text-align:left;border:1.5px solid var(--line)"><span class="mi-ic gold" style="font-size:1.4rem">☁️</span><span><b>Compte e-mail</b><span class="muted">Synchronisation entre vos appareils (iPhone, iPad, ordinateur). Données chiffrées sur l'appareil, stockées en Europe, lisibles par vous seul.</span></span></button>
    </div>`;
  document.body.appendChild(o);
  o.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { const m = b.dataset.m; o.remove();
    if (m === 'local') { setMode('local'); toast('Mode stockage local ✔'); } else { setMode('cloud'); window.openSync(); } });
}

boot();
try { renderPlus(); } catch (e) {}
gate(); setTimeout(() => { if (!gateBooted && deviceOK()) { gateBooted = true; gate(); } }, 6000);
