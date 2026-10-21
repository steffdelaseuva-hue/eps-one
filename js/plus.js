/* =========================================================
   EPS ONE — Onglet PLUS : mise à jour, partage,
   à propos, confidentialité/RGPD, nouvelle année scolaire
   ========================================================= */
/* Page Ko-fi : laisser vide tant qu'elle n'existe pas (le bouton est alors masqué) */
const KOFI_URL = 'https://ko-fi.com/epsone';
const APP_VERSION = '23.114';
const APP_URL = 'https://steffdelaseuva-hue.github.io/eps-one/';
const CHANGELOG = [
  { v: '23.114', items: ['Plus · Nouveautés : seules les 5 dernières versions sont affichées.'] },
  { v: '23.113', items: ['Parkour · ② Créer son enchaînement : bloc « Exigences de l\'enchaînement » comme en gym (points, éléments / minimum, familles / demandées, niveau maximal, alertes).', 'Gymnastique et Acrosport · 🎬 Enchaînement : carte « 🗑 Supprimer / remettre à zéro » (vider l\'enchaînement de l\'élève ou du groupe, effacer sa validation, vider tous les enchaînements de la classe) avec « ↶ Annuler ».'] },
  { v: '23.112', items: ['✅ Validation enseignant (Parkour, Gym, Acrosport) : chaque élève ne voit plus que les éléments de SON enchaînement (et leur niveau), et non ceux de toute la classe ; la note, les fiches et le bilan ne comptent que ceux-là.', 'Le critère « ↳ Niveau » de chaque élément est placé juste sous sa maîtrise, dans sa famille.'] },
  { v: '23.111', items: ['Parkour, Gymnastique et Acrosport · ✅ Validation enseignant : nouveau critère « Niveau des éléments » rempli d\'office pour chaque élément choisi dans l\'enchaînement (Parkour : niveau 1 = insuffisante · 2 = fragile · 3 = satisfaisante · 4 = très bonne ; Acrosport : A · B · C · D ; Gym : A–D en niveau 1, C–F en niveau 2 selon la lettre maximale), modifiable ensuite.', 'Chaque élément / pyramide de l\'enchaînement compte dans la validation : non validé par l\'enseignant = maîtrise insuffisante.'] },
  { v: '23.110', items: ['Gymnastique et Acrosport : bouton ✅ Validation enseignant en haut (critères, note sur 20, poids) ; les éléments / pyramides validés dans l\'enchaînement y sont copiés d\'office pour chaque élève du groupe, modifiables ensuite.', 'Gymnastique et Acrosport : bouton 📊 Bilan en haut (fiches élèves PDF / ZIP, bilan de la classe).'] }
];

const schoolYear = (d = new Date()) => { const y = d.getFullYear(); return d.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };
DB.annee = DB.annee || schoolYear();

document.head.insertAdjacentHTML('beforeend', `<style>
.qr-box{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
.qr-box svg{width:min(240px,70vw);height:auto;border-radius:14px;box-shadow:var(--shadow);border:1px solid var(--line)}
.doc h3{margin:18px 0 6px;font-size:1rem}
.doc p,.doc li{font-size:.92rem;line-height:1.5;margin:0 0 8px}
.doc ul{padding-left:20px;margin:0 0 8px}
.chk{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line);font-size:.92rem}
.chk:last-child{border-bottom:none}
.chk input{width:22px;height:22px;flex:0 0 22px;margin-top:1px;accent-color:var(--blue)}
.step{display:flex;gap:10px;align-items:center;margin:18px 2px 8px}
.step .n{width:28px;height:28px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;font-weight:900;font-size:.85rem;flex:0 0 28px}
.step h3{font-size:1rem;margin:0}
.ver-badge{display:inline-block;padding:3px 10px;border-radius:99px;background:var(--grad);color:#fff;font-weight:800;font-size:.8rem}
</style>`);

/* ---------- Panneau générique (réutilise l'écran d'outil) ---------- */
/* Nouveautés : les petites corrections sont regroupées sous une ligne simple */
const isFix = t => /^(Correction|Corrections)\b|:\s*correction\b/i.test(t);
function clEntry(c) {
  const main = c.items.filter(i => !isFix(i)), fixes = c.items.length - main.length;
  return `<h3><span class="ver-badge">v${c.v}</span></h3><ul>${main.map(i => `<li>${esc(i)}</li>`).join('')}${fixes ? '<li class="muted">Corrections et améliorations</li>' : ''}</ul>`;
}
function openPanel(title, render) {
  currentTool = null;
  document.getElementById('screen-title').textContent = title;
  document.getElementById('screen-star').style.visibility = 'hidden';
  if (typeof cleanup === 'function') { try { cleanup(); } catch (e) {} } cleanup = null;
  const body = document.getElementById('screen-body'); body.className = 'body'; body.innerHTML = '';
  cleanup = render(body) || null;
  document.getElementById('screen').classList.add('open');
  document.getElementById('screen-body').scrollTop = 0;
}
const appLink = () => location.protocol === 'https:' ? location.origin + location.pathname.replace(/[^/]*$/, '') : APP_URL;

/* ---------- 🔄 Mise à jour ---------- */
function openUpdate() {
  openPanel('Mise à jour', el => {
    el.innerHTML = `<div class="card" style="text-align:center">
        <div class="muted">Version installée</div><div style="font-size:2.4rem;font-weight:900;margin:4px 0">v${APP_VERSION}</div>
        <div id="st" class="muted">Recherche d'une nouvelle version…</div>
        <button class="btn btn-grad btn-block" style="margin-top:14px" id="up">🔄 Mettre à jour l'application</button>
        <p class="muted" style="margin:10px 0 0">Recharge la dernière version publiée. Vos données (classes, grilles, suivi…) sont conservées.</p></div>
      <div class="section-title"><h2>Nouveautés</h2></div>
      <div class="card doc">${CHANGELOG.slice(0, 5).map(clEntry).join('')}
        ${CHANGELOG.length > 5 ? `<details style="margin-top:10px"><summary style="cursor:pointer;font-weight:800">Voir tout l'historique (${CHANGELOG.length - 5} versions précédentes)</summary>${CHANGELOG.slice(5).map(clEntry).join('')}</details>` : ''}</div>`;
    const st = el.querySelector('#st');
    fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).then(v => {
      st.innerHTML = v.version !== APP_VERSION
        ? `<b style="color:var(--ok)">Nouvelle version disponible : v${esc(v.version)}</b>`
        : '✔ Vous avez la dernière version.';
    }).catch(() => st.textContent = navigator.onLine ? 'Vérification impossible pour le moment.' : 'Hors connexion : vérification impossible.');
    el.querySelector('#up').onclick = async () => {
      if (!navigator.onLine) return toast('Connexion internet nécessaire');
      toast('Mise à jour…');
      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        if (reg) { await reg.update(); await reg.unregister(); }
        if (window.caches) for (const k of await caches.keys()) await caches.delete(k);
      } catch (e) {}
      location.replace(location.pathname + '?v=' + Date.now() + '#plus');
    };
  });
}

/* ---------- 🔗 Partager l'app ---------- */
function openShare() {
  const url = appLink();
  openPanel('Partager l\'app', el => {
    el.innerHTML = `<div class="card qr-box"><h3>EPS ONE</h3>${QR.svg(url)}<div class="muted" style="word-break:break-all">${esc(url)}</div>
        <div class="row" style="width:100%;margin-top:6px"><button class="btn btn-grad" id="sh">📤 Partager</button><button class="btn btn-ghost" id="cp">📋 Copier le lien</button></div></div>`;
    const copy = async t => { try { await navigator.clipboard.writeText(t); toast('Copié ✔'); } catch (e) { prompt('Copiez :', t); } };
    el.querySelector('#sh').onclick = async () => { if (navigator.share) { try { await navigator.share({ title: 'EPS ONE', url }); } catch (e) {} } else copy(url); };
    el.querySelector('#cp').onclick = () => copy(url);
  });
}

/* ---------- ℹ️ À propos ---------- */
function openAbout() {
  openPanel('À propos', el => {
    el.innerHTML = `<div class="hero" style="text-align:center"><img class="logo" src="icons/icone-v3-192.png" alt="" style="margin:0 auto 10px;width:72px;height:72px;border-radius:18px">
        <h2>EPS ONE</h2><p style="margin:6px auto 0">by <b>Steff64</b> · version ${APP_VERSION}</p></div>
      <div class="card doc" style="margin-top:14px">
        <h3>🎯 L'objectif</h3>
        <p>Réunir dans une seule application les outils numériques utiles en cours d'EPS, classés par champs d'apprentissage : gestion de séance par les élèves et le prof, gestion de match en synchronisation live multi-tablettes (résultats envoyés sur la tablette du prof en direct et/ou en fin de séance), multi-chronos, tirages au sort, équipes, calculs VMA, évaluation et suivi des élèves, sur tablette, téléphone ou ordinateur.</p>
        <h3>🧰 Ce qu'elle contient</h3>
        <p>${TOOLS.length} outils répartis en ${CATS.length} domaines : ${CATS.map(c => c.name).join(' · ')}.</p>
        <h3>📲 Installer l'app</h3>
        <ul><li><b>iPad / iPhone</b> : ouvrir dans Safari → bouton Partager ⬆️ → « Sur l'écran d'accueil ».</li>
          <li><b>Android</b> : ouvrir dans Chrome → menu ⋮ → « Installer l'application ».</li>
          <li><b>Ordinateur</b> : Chrome ou Edge → icône d'installation dans la barre d'adresse.</li></ul>
        <p>Une fois installée, l'application fonctionne aussi hors connexion, au gymnase comme sur le stade.</p>
        <h3>💾 Changer d'appareil</h3>
        <p>Plus → « Exporter mes données » sur l'ancien appareil, puis « Importer une sauvegarde » sur le nouveau.</p>
        <h3>🙏 Remerciements</h3>
        <p>Conception et développement : Steff64, professeur d'EPS.</p>
        <p style="margin-top:12px"><a href="mentions-legales.html" target="_blank" rel="noopener">⚖️ Mentions légales</a> · <a href="confidentialite.html" target="_blank" rel="noopener">🔒 Politique de confidentialité</a></p>
      </div>`;
  });
}

/* ---------- 🔒 Confidentialité & RGPD ---------- */
function openPrivacy() {
  openPanel('Confidentialité & RGPD', el => {
    const size = (() => { try { return Math.round(((localStorage.getItem('mesOutilsEPS_v1') || '').length + (localStorage.getItem('chronos-eps-v1') || '').length) / 1024); } catch (e) { return 0; } })();
    const nbEleves = DB.classes.reduce((a, c) => a + c.students.length, 0);
    el.innerHTML = `<div class="card doc">
        <h3>🔐 En résumé</h3>
        <ul><li><b>Deux modes au choix</b> : <b>stockage local</b> (par défaut, rien n'est envoyé en ligne) ou <b>compte e-mail</b> pour synchroniser ses appareils.</li>
          <li><b>Aucune publicité</b>, aucun cookie de suivi, aucune statistique de visite.</li>
          <li><b>Accès</b> : sans compte en stockage local, avec son propre cloud (Google Drive, Dropbox), ou avec un compte EPS ONE sur invitation (validé par l'administrateur). L'adresse e-mail, l'état de la demande (en attente, autorisé, refusé) et l'activation ou non de la synchronisation sont enregistrés, non chiffrés, uniquement pour gérer les autorisations.</li>
          <li>Mode actuel sur cet appareil : <b>${window.EPSONE_SYNC && window.EPSONE_SYNC.user ? 'Synchronisé (' + esc(window.EPSONE_SYNC.user.email) + ')' : 'Stockage local'}</b>.</li></ul>
        <h3>📱 Mode « Stockage local »</h3>
        <p>Classes, listes d'élèves, évaluations, suivi, dispenses… sont enregistrés uniquement dans le navigateur de cet appareil (stockage local). Rien n'est envoyé sur un serveur, rien n'est partagé. Effacer les données de Safari/Chrome ou désinstaller l'app les supprime : pensez à exporter régulièrement une sauvegarde.</p>
        <h3>☁️ Mode « Compte e-mail » (synchronisation)</h3>
        <ul><li>Les données sont copiées dans une base de données <b>Google Firebase (Cloud Firestore)</b>, hébergée <b>en Europe (Paris, europe-west9)</b>, pour être retrouvées sur vos autres appareils.</li>
          <li><b>Chiffrement de bout en bout</b> : les données sont chiffrées sur votre appareil avant l'envoi (AES-256), avec une clé tirée de votre mot de passe. Firebase ne stocke que du contenu illisible : <b>ni Google, ni l'administrateur du projet ne peuvent les lire</b>.</li>
          <li>Elles sont rattachées à votre compte : les règles de sécurité font que <b>seul votre compte peut les lire ou les modifier</b>.</li>
          <li>L'adresse e-mail sert uniquement à la connexion. Le mot de passe est géré par Firebase Authentication ; l'app ne le conserve pas, elle s'en sert seulement sur l'appareil pour créer la clé de chiffrement. En cas d'oubli, les données en ligne deviennent illisibles, mais celles de vos appareils sont conservées.</li>
          <li><b>Option « Mon cloud » (Google Drive, Dropbox ou iCloud Drive)</b> : si vous la choisissez, vos données sont enregistrées sur <b>votre propre</b> Google Drive ou Dropbox, dans un dossier réservé à EPS ONE (l'app n'a accès à aucun autre fichier), ou dans un <b>fichier de sauvegarde</b> que vous rangez vous-même dans votre iCloud Drive (sauvegarde manuelle, sans synchronisation). Elles ne passent pas par le serveur d'EPS ONE et sont alors soumises aux conditions de votre compte chez ce fournisseur.</li>
          <li><b>Chiffrement de bout en bout aussi avec Google Drive, Dropbox et iCloud Drive</b> (Google Drive et Dropbox, recommandé : Plus → Stockage & synchronisation → « 🔒 Chiffrer mes données ») : avec une <b>phrase de chiffrement</b> choisie par l'enseignant, les données sont chiffrées sur l'appareil (AES-256) avant l'envoi. Google ou Dropbox ne stockent que du contenu illisible. La phrase est saisie une fois sur chaque appareil et n'est jamais envoyée ; en cas d'oubli, les données du cloud deviennent illisibles, celles des appareils sont conservées. <b>iCloud Drive</b> : le fichier de sauvegarde est <b>toujours chiffré</b> sur l'appareil (AES-256) avec un mot de passe choisi au moment de la sauvegarde, et demandé à la restauration ; Apple ne stocke que du contenu illisible. En cas d'oubli du mot de passe, ce fichier devient illisible.</li>
          <li>Vous pouvez à tout moment <b>supprimer toutes vos données en ligne</b> (Plus → Stockage & synchronisation) : la synchronisation s'arrête et les données restent seulement sur l'appareil.</li>
          <li><b>Conseil</b> : en mode synchronisé, préférez <b>prénom + initiale</b> pour les élèves. Pour toute question sur l'usage d'outils numériques avec des données d'élèves, votre établissement reste l'interlocuteur de référence.</li></ul>
        <h3>📊 Statistiques de visite</h3>
        <ul><li><b>Mesure d'audience</b> : le nombre de visites est compté de façon anonyme avec <b>GoatCounter</b>, sans cookie, et seulement sur le site publié (steffdelaseuva-hue.github.io). Rien de ce que vous saisissez dans l'app n'est transmis.</li></ul>
        <h3>📷 Caméra, photos et vidéos</h3>
        <ul><li><b>Vidéo différée, photo-finish, scan des dossards</b> : la caméra n'est utilisée que pendant que l'outil est ouvert ; les images restent en mémoire vive, ne sont jamais enregistrées ni envoyées.</li>
          <li><b>Vidéos</b> ajoutées en danse, gym ou acrosport : enregistrées <b>uniquement sur l'appareil</b>, jamais envoyées en ligne.</li>
          <li><b>Photos</b> ajoutées en acrosport, gym, escalade ou danse : enregistrées sur l'appareil et, si la synchronisation est activée, partagées avec vos autres appareils <b>chiffrées de bout en bout</b> (Firebase, ou Google Drive / Dropbox avec phrase de chiffrement).</li>
          <li><b>Droit à l'image</b> : photographier ou filmer des élèves suppose l'autorisation des responsables légaux (souvent recueillie par l'établissement en début d'année). Effacez les photos et vidéos qui ne servent plus, au plus tard en fin d'année.</li></ul>
        <h3>🌐 Hébergement</h3>
        <p>L'application est hébergée sur GitHub Pages. Comme pour tout site web, l'hébergeur peut enregistrer des données techniques de connexion (adresse IP) lors du chargement de la page. Aucune donnée d'élève ne transite par ce biais (en mode synchronisé, elles transitent uniquement vers Firebase, ou vers votre Google Drive / Dropbox, chiffrées de bout en bout).</p>
        <h3>🧑‍🏫 Bonnes pratiques pour l'enseignant</h3>
        <ul><li><b>Minimiser</b> : prénom + initiale du nom suffisent le plus souvent.</li>
          <li><b>Dispenses</b> : ne pas saisir de motif médical ni de diagnostic, seulement les dates et les aménagements.</li>
          <li><b>Exports</b> (CSV, JSON) : les ranger dans un espace sécurisé (ENT, espace professionnel), pas sur une clé USB perdue ou un cloud personnel.</li>
          <li><b>Appareil</b> : verrouiller la tablette par un code, surtout si elle est partagée.</li>
          <li><b>Toujours la même entrée</b> : sur iPhone/iPad, Safari, Chrome et l'icône installée sur l'écran d'accueil ne partagent pas les mêmes données. Utilisez toujours la même (de préférence l'icône installée). En mode « Compte e-mail », connectez-vous avec le même compte pour retrouver vos données partout.</li>
          <li><b>Durée</b> : effacer les données en fin d'année avec « Nouvelle année scolaire ».</li></ul>
        <p class="muted">Ces informations sont données à titre indicatif et ne constituent pas un avis juridique.</p>
      </div>
      <div class="section-title"><h2>Mes données sur cet appareil</h2></div>
      <div class="card"><div class="result" style="margin-top:0">
          <div class="card"><b>${DB.classes.length}</b><small>classes</small></div><div class="card"><b>${nbEleves}</b><small>élèves</small></div><div class="card"><b>${size} Ko</b><small>données</small></div></div>
        <div id="mem-g" style="margin-top:12px"></div>
        <div class="row" style="margin-top:12px"><button class="btn btn-ghost" onclick="exportData()">💾 Exporter</button><button class="btn btn-danger" id="del">🗑 Tout effacer</button></div></div>`;
    el.querySelector('#del').onclick = () => { resetAll(); closeTool(); };
    memGauge(el.querySelector('#mem-g'));
  });
}

/* ---------- 💾 Jauge « Espace utilisé » ---------- */
const MEM_MAX = 5242880;   // ~5 Mo de caractères (Safari compte 2 octets par caractère)
function memStats() {
  const o = { main: 0, maps: 0, sync: 0, other: 0 };
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i), v = localStorage.getItem(k) || '', n = (k.length + v.length) * 2;
    if (k === 'mesOutilsEPS_v1') o.main += n; else if (k === 'epsone_sync_base') o.sync += n; else o.other += n; } } catch (e) {}
  try { const co = DB.co || {}, len = m => m && m.img ? m.img.length * 2 : 0; o.maps = (co.lieux || []).reduce((a, l) => a + len(l.map), 0) + (co.parcours || []).reduce((a, q) => a + len(q.map), 0); } catch (e) {}
  o.main = Math.max(0, o.main - o.maps); o.total = o.main + o.maps + o.sync + o.other; return o;
}
/* ☁️ Sauvegarde manuelle dans le Nuage (Apps Éducation) ou tout autre espace : fichier JSON daté, menu de partage de l'appareil.
   Ce n'est PAS une synchronisation : le Nuage n'autorise pas les connexions automatiques depuis une application web. */
/* Ouvre la page d'installation de l'app Nextcloud adaptée à l'appareil (App Store, Google Play ou site officiel) */
window.epsNextcloudInstall = () => {
  const ua = navigator.userAgent || '', ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), and = /Android/.test(ua);
  const url = ios ? 'https://apps.apple.com/app/nextcloud/id1125420102' : and ? 'https://play.google.com/store/apps/details?id=com.nextcloud.client' : 'https://nextcloud.com/install/#install-clients';
  window.open(url, '_blank', 'noopener');
};
/* 🔒 Chiffrement des sauvegardes iCloud : AES-256-GCM, clé tirée du mot de passe (PBKDF2, 210 000 itérations, sel aléatoire).
   Le fichier reste un .json, mais ne contient que du contenu illisible sans le mot de passe. */
const BK_TE = new TextEncoder(), BK_TD = new TextDecoder();
const bkB64 = u => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const bkUnB64 = b => Uint8Array.from(atob(b), c => c.charCodeAt(0));
async function bkKey(pw, salt) { const base = await crypto.subtle.importKey('raw', BK_TE.encode(pw), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']); }
window.epsEncryptBackup = async (str, pw) => { const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await bkKey(pw, salt), BK_TE.encode(str)));
  return JSON.stringify({ epsone: 'sauvegarde-chiffree', v: 1, alg: 'AES-256-GCM/PBKDF2-SHA256-210000', salt: bkB64(salt), iv: bkB64(iv), data: bkB64(ct) }); };
window.epsIsEncryptedBackup = o => !!(o && o.epsone === 'sauvegarde-chiffree' && o.data);
window.epsDecryptBackup = async (o, pw) => BK_TD.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bkUnB64(o.iv) }, await bkKey(pw, bkUnB64(o.salt)), bkUnB64(o.data)));
function openNuageBackup(kind) {
  const ic = kind === 'icloud';
  openPanel(ic ? 'Sauvegarde dans iCloud' : 'Sauvegarde dans mon Nuage', el => {
    const last = () => { const t = (DB.tablette || {}).nuageLast; if (!t) return '<b>Aucune sauvegarde faite depuis cet appareil.</b>'; const j = Math.floor((Date.now() - t) / 864e5);
      return `Dernière sauvegarde : <b>${new Date(t).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</b>${j >= 7 ? ` <span style="color:#D64545;font-weight:800">(il y a ${j} jours : pensez à en refaire une)</span>` : j === 0 ? ' (aujourd\'hui)' : ` (il y a ${j} jour${j > 1 ? 's' : ''})`}`; };
    const where = ic ? `<div class="card" style="margin-top:12px"><div style="display:flex;gap:10px;align-items:center"><img src="icons/icloud.png" alt="iCloud" style="width:44px;height:44px;flex:0 0 auto;object-fit:contain"><b>Ranger le fichier dans iCloud Drive</b></div>
        <ol style="margin:8px 0 0 18px;padding:0;font-size:.88rem;line-height:1.5"><li><b>iPad / iPhone</b> : dans le menu qui s'ouvre, choisissez <i>Enregistrer dans Fichiers</i>, puis <b>iCloud Drive</b> et un dossier de votre choix.</li>
          <li><b>Mac</b> : le fichier est téléchargé ; glissez-le dans <i>iCloud Drive</i> (Finder).</li>
          <li><b>Windows / autre</b> : déposez-le sur <b>icloud.com</b> → Drive.</li></ol>
        <p class="muted" style="margin:8px 0 0;font-size:.8rem">iCloud est surtout pratique avec des appareils Apple. Il faut un identifiant Apple et de la place libre dans iCloud.</p>
        <button class="btn btn-ghost btn-block" style="margin-top:8px" id="nb-files" hidden>📂 Ouvrir l'app Fichiers</button></div>` : `<div class="card" style="margin-top:12px"><b>Où l'enregistrer ?</b>
        <div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(30,91,216,.08)"><div style="display:flex;gap:10px;align-items:center"><img src="icons/nextcloud.png" alt="Nextcloud" style="width:44px;height:44px;flex:0 0 auto;border-radius:10px"><b>Ranger le fichier dans le Nuage depuis une tablette ou un téléphone</b></div>
        <p style="margin:6px 0 0;font-size:.85rem;line-height:1.45">Il faut d'abord installer l'app gratuite <b>Nextcloud</b> (le Nuage Apps Éducation est un Nextcloud). Ouvrez-la, choisissez <i>Se connecter</i> et saisissez l'adresse <b>https://nuage13.apps.education.fr</b> (selon votre académie, l'adresse peut différer : voir portail.apps.education.fr → « Le nuage »). Ensuite, « Enregistrer dans Fichiers » proposera votre Nuage.</p>
        <button class="btn btn-ghost btn-block" style="margin-top:8px" onclick="epsNextcloudInstall()">📲 Installer l'app Nextcloud</button></div>
        <ol style="margin:6px 0 0 18px;padding:0;font-size:.88rem;line-height:1.5"><li><b>iPad / iPhone</b> : dans le menu qui s'ouvre, choisissez <i>Enregistrer dans Fichiers</i>, puis <b>iCloud Drive</b> ou le dossier de votre Nuage (l'app <b>Nextcloud</b> doit être installée et connectée). Ou choisissez directement l'app Nextcloud si elle apparaît.</li>
          <li><b>Ordinateur</b> : le fichier est téléchargé ; glissez-le dans le dossier synchronisé de votre Nuage (ou déposez-le sur le site du Nuage).</li>
          <li><b>Android</b> : menu de partage → Nextcloud.</li></ol>
        <p class="muted" style="margin:8px 0 0;font-size:.8rem">Aide pour connecter votre compte Apps Éducation au Nuage : portail.apps.education.fr → « Le nuage ».</p></div>`;
    el.innerHTML = `<div class="card" style="border:2px solid #E0892F"><b>⚠️ Ce n'est pas une synchronisation</b>
        <p style="margin:6px 0 0;font-size:.9rem">Cette sauvegarde est un <b>fichier</b> que vous rangez dans votre Nuage (Apps Éducation), dans iCloud Drive ou ailleurs. Elle <b>ne synchronise pas</b> les tablettes entre elles : chaque tablette garde ses propres données. Pour partager les données entre plusieurs tablettes, utilisez plutôt Dropbox ou Google Drive (ou Équipe EPS).</p></div>
      <div class="card" style="margin-top:12px"><b>📤 Faire une sauvegarde</b>
        <p class="muted" style="margin:6px 0 0;font-size:.85rem">Un fichier <b>EPS-ONE-sauvegarde-${ic ? 'iCloud-' : ''}date.json</b> est créé avec toutes les données de cet appareil (classes, élèves, résultats, séances…).</p>
        ${ic ? `<div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(30,158,90,.10)"><b>🔒 Fichier chiffré de bout en bout</b>
          <p style="margin:6px 0 0;font-size:.85rem;line-height:1.45">Le fichier est <b>chiffré sur cet appareil</b> (AES-256) avec le mot de passe choisi ci-dessous, avant d'aller dans iCloud. Ni Apple ni personne d'autre ne peut le lire sans ce mot de passe.</p>
          <input id="nb-p1" type="password" placeholder="Mot de passe de la sauvegarde" autocomplete="new-password" style="margin-top:8px">
          <input id="nb-p2" type="password" placeholder="Confirmer le mot de passe" autocomplete="new-password" style="margin-top:6px">
          <p class="muted" style="margin:6px 0 0;font-size:.8rem">⚠️ Notez-le bien : il sera demandé pour restaurer. <b>Mot de passe oublié = sauvegarde illisible.</b></p></div>` : ''}
        <p id="nb-last" style="margin:8px 0 0;font-size:.88rem">${last()}</p>
        <button class="btn btn-grad btn-block" style="margin-top:10px;padding:14px" id="nb-go">${ic ? '📤 Créer la sauvegarde et l\'envoyer vers iCloud' : '📤 Créer la sauvegarde et l\'envoyer au Nuage'}</button></div>
      ${where}
      <div class="card" style="margin-top:12px"><b>📥 Restaurer une sauvegarde</b>
        <p class="muted" style="margin:6px 0 0;font-size:.85rem">Sur la tablette à restaurer : ${ic ? 'récupérez le fichier depuis iCloud Drive (app Fichiers)' : 'récupérez le fichier depuis le Nuage (app Fichiers / Nextcloud)'}, puis choisissez-le ici. Les données de l'appareil sont remplacées par celles du fichier.${ic ? ' Le mot de passe de la sauvegarde vous sera demandé.' : ''}</p>
        <button class="btn btn-ghost btn-block" style="margin-top:10px" id="nb-imp">📥 Choisir un fichier de sauvegarde</button></div>`;
    { const fb = el.querySelector('#nb-files'); if (fb && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))) { fb.hidden = false; fb.onclick = () => { location.href = 'shareddocuments://'; }; } }
    el.querySelector('#nb-imp').onclick = () => { const i = document.getElementById('imp'); if (i) i.click(); else toast('Importer : Plus → Importer une sauvegarde'); };
    el.querySelector('#nb-go').onclick = async () => {
      try { window.saveNow && saveNow(); } catch (e) {}
      let payload = JSON.stringify(DB, null, 2);
      if (ic) { const p1 = el.querySelector('#nb-p1').value, p2 = el.querySelector('#nb-p2').value;
        if (p1.length < 6) { toast('Choisissez un mot de passe (6 caractères minimum)'); return; }
        if (p1 !== p2) { toast('Les deux mots de passe ne correspondent pas'); return; }
        try { payload = await epsEncryptBackup(payload, p1); } catch (e) { toast('Chiffrement impossible sur cet appareil'); return; } }
      const name = 'EPS-ONE-sauvegarde-' + (ic ? 'iCloud-' : '') + new Date().toISOString().slice(0, 10) + '.json', blob = new Blob([payload], { type: 'application/json' });
      const f = new File([blob], name, { type: 'application/json' }); let done = false;
      try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'Sauvegarde EPS ONE' }); done = true; } } catch (e) { if (e && e.name === 'AbortError') return; }
      if (!done) { const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); toast(ic ? 'Fichier chiffré téléchargé : rangez-le dans iCloud Drive' : 'Fichier téléchargé : rangez-le dans votre Nuage'); }
      DB.tablette = DB.tablette || {}; DB.tablette.nuageLast = Date.now(); save(); el.querySelector('#nb-last').innerHTML = last();
    };
  });
}
function openStorage() {
  openPanel('Espace utilisé', el => {
    el.innerHTML = `<div class="card"><div id="mem-g"></div><button class="btn btn-ghost btn-block" style="margin-top:12px" onclick="exportData()">💾 Exporter une sauvegarde</button></div>
      <p class="muted" style="margin:12px 4px;font-size:.82rem">Les photos (acrosport, gym, escalade, danse) et les vidéos sont rangées à part : elles ne remplissent pas cet espace. Les cartes de course d'orientation, elles, y sont comprises .</p>`;
    memGauge(el.querySelector('#mem-g'));
    el.insertAdjacentHTML('beforeend', '<div class="card" style="margin-top:12px"><b>🗑 Supprimer des données</b><p class="muted" style="margin:6px 0 0;font-size:.85rem">Vider les équipes et groupes créés, les bilans et résultats, ou les séances terminées.</p><button class="btn btn-grad btn-block" style="margin-top:10px" id="mem-data">🗑 Choisir ce qu\'il faut supprimer</button></div>');
    el.querySelector('#mem-data').onclick = () => openStoredData();
  });
}
/* Réduit les cartes de C.O. (≤ 1200 px, JPEG) pour libérer de la place */
async function coShrinkMaps() {
  const list = []; const co = DB.co || {};
  (co.lieux || []).forEach(l => l.map && l.map.img && list.push(l.map)); (co.parcours || []).forEach(q => q.map && q.map.img && list.push(q.map));
  let gain = 0;
  for (const m of list) { if (m.img.length < 120000) continue;
    await new Promise(res => { const im = new Image(); im.onload = () => { try { const r = Math.min(1, 1200 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * r); c.height = Math.round(im.height * r);
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height); const u = c.toDataURL('image/jpeg', .6);
      if (u.length < m.img.length * .9) { gain += (m.img.length - u.length) * 2; m.img = u; m.w = c.width; m.h = c.height; } } catch (e) {} res(); }; im.onerror = res; im.src = m.img; }); }
  return gain;
}
async function memGauge(box) {
  if (!box) return;
  const st = memStats(), pct = Math.min(100, Math.round(st.total / MEM_MAX * 100)), col = pct > 85 ? 'var(--danger,#D64545)' : pct > 60 ? '#E0892F' : 'var(--ok,#1B9E5A)';
  const imgK = Object.keys(DB).filter(k => /^(acroImg_|gymImg_|escImg_|danseImg_)/.test(k) && DB[k]), imgKo = Math.round(imgK.reduce((a, k) => a + String(DB[k]).length, 0) / 1024);
  let tot = null; try { if (navigator.storage && navigator.storage.estimate) tot = await navigator.storage.estimate(); } catch (e) {}
  const mo = b => (b / 1048576).toFixed(b > 1048576 * 10 ? 0 : 1).replace('.', ',') + ' Mo', ko = b => Math.round(b / 1024) + ' Ko';
  box.innerHTML = `<b>💾 Espace utilisé</b>
    <div style="margin-top:6px;font-size:.85rem"><b>${mo(st.total)}</b> sur ~5 Mo (${pct} %)</div>
    <div style="height:12px;border-radius:99px;background:var(--line);overflow:hidden;margin-top:4px"><i style="display:block;height:100%;width:${Math.max(2, pct)}%;background:${col}"></i></div>
    <div style="font-size:.82rem;margin-top:6px;line-height:1.6">📚 Données (classes, résultats, réglages) : <b>${ko(st.main)}</b><br>🗺 Cartes de course d'orientation : <b>${ko(st.maps)}</b><br>${st.sync ? `🔄 Copie de synchronisation : <b>${ko(st.sync)}</b><br>` : ''}🧩 Autres : <b>${ko(st.other)}</b></div>
    <div class="muted" style="font-size:.78rem;margin-top:6px">${pct > 85 ? '⚠️ Presque plein : les modifications risquent de ne plus être enregistrées. Réduisez les cartes ou exportez puis faites du tri.' : 'Marge suffisante.'}</div>
    ${(() => { try { const top = Object.keys(DB).filter(k => !/^(acroImg_|gymImg_|escImg_|danseImg_)/.test(k)).map(k => [k, JSON.stringify(DB[k] ?? null).length * 2]).filter(x => x[1] > 40000).sort((a, b) => b[1] - a[1]).slice(0, 5); return top.length ? `<div class="muted" style="font-size:.78rem;margin-top:6px">Plus gros postes de données : ${top.map(([k, n]) => `<b>${esc(k)}</b> ${ko(n)}`).join(' · ')}</div>` : ''; } catch (e) { return ''; } })()}
    ${st.maps > 200000 ? '<button class="btn btn-grad btn-block" id="mem-shr" style="margin-top:10px">🗺 Réduire la taille des cartes de C.O.</button>' : ''}
    <div style="font-size:.85rem;margin-top:10px">🖼️ Photos (stockées à part) : <b>${imgK.length}</b> (${imgKo} Ko)${tot && tot.usage != null ? ` · 🎬 Vidéos et appli : <b>${mo(tot.usage)}</b>${tot.quota ? ` sur ${mo(tot.quota)} disponibles` : ''}` : ''}</div>`;
  const b = box.querySelector('#mem-shr');
  if (b) b.onclick = async () => { b.disabled = true; b.textContent = 'Réduction en cours…'; const g = await coShrinkMaps(); try { save(); } catch (e) {} toast(g > 0 ? `✔ ${mo(g)} libérés` : 'Cartes déjà légères'); memGauge(box); };
}

/* ---------- 🗓 Nouvelle année scolaire ---------- */
function openNewYear(back) {
  const next = (() => { const m = /^(\d{4})-(\d{4})$/.exec(DB.annee); return m ? `${+m[1] + 1}-${+m[2] + 1}` : schoolYear(); })();
  const counts = {
    classes: DB.classes.length, evals: DB.grilles.reduce((a, g) => a + Object.keys(g.evals || {}).length, 0),
    suivi: Object.keys(DB.suivi).length, dispenses: DB.dispenses.length, oublis: Object.keys(DB.oublis).length, journal: DB.journal.length,
  };
  const OPTS = [
    ['classes', true, `Classes et listes d'élèves (${counts.classes}) + prénoms de Chronos EPS`],
    ['keepNames', false, `↳ … mais garder les noms de classes (listes vidées)`],
    ['evals', true, `Évaluations saisies dans les grilles (${counts.evals} classe·s) — les grilles sont conservées`],
    ['suivi', true, `Tableaux de suivi (${counts.suivi})`],
    ['dispenses', true, `Dispenses (${counts.dispenses})`],
    ['oublis', true, `Oublis de tenue (${counts.oublis} classe·s)`],
    ['grilles', false, `Mes modèles de grilles d'évaluation (${DB.grilles.length})`],
    ['debrief', false, `Mes questions de débrief (${DB.debrief.length})`],
    ['favs', false, 'Favoris et outils récents'],
  ];
  openPanel('Nouvelle année scolaire', el => {
    let saved = false;
    el.innerHTML = `<div class="card" style="text-align:center"><div class="muted">Année en cours</div><div style="font-size:1.8rem;font-weight:900">${esc(DB.annee)}</div></div>
      <div class="step"><span class="n">1</span><h3>Sauvegarder l'année ${esc(DB.annee)}</h3></div>
      <div class="card"><p class="muted" style="margin:0 0 10px">Fortement conseillé : un fichier de sauvegarde permet de tout retrouver plus tard (Plus → Importer).</p>
        <button class="btn btn-grad btn-block" id="bk">💾 Télécharger la sauvegarde ${esc(DB.annee)}</button><div id="bks" class="muted" style="margin-top:8px;text-align:center"></div></div>
      <div class="step"><span class="n">2</span><h3>Choisir ce qu'on remet à zéro</h3></div>
      <div class="card">${OPTS.map(([k, on, l]) => `<label class="chk"><input type="checkbox" data-k="${k}" ${on ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
      <div class="step"><span class="n">3</span><h3>Démarrer la nouvelle année</h3></div>
      <div class="card"><label>Nouvelle année</label><input id="ny" value="${esc(next)}">
        <button class="btn btn-grad btn-block" style="margin-top:12px" id="go">🚀 Démarrer l'année</button></div>`;
    const $ = s => el.querySelector(s), opt = k => $(`[data-k="${k}"]`).checked;
    $('#bk').onclick = () => {
      download(`eps-one-sauvegarde-${DB.annee}.json`, JSON.stringify({ ...JSON.parse(JSON.stringify(DB)), exportDate: new Date().toISOString() }, null, 2), 'application/json');
      saved = true; $('#bks').textContent = '✔ Sauvegarde téléchargée'; };
    $('#go').onclick = () => {
      const ny = $('#ny').value.trim() || next;
      if (!saved && !confirm('Vous n\'avez pas téléchargé de sauvegarde. Continuer quand même ?')) return;
      if (!confirm(`Démarrer l'année ${ny} ?\nLes éléments cochés seront définitivement effacés de cet appareil.`)) return;
      if (opt('classes')) {
        if (!opt('keepNames') && window.epsClsDeleted) { (dbGet('classes') || []).forEach(c => epsClsDeleted('classes', c)); (DB.classesAll || []).forEach(c => epsClsDeleted('classesAll', c)); }
        (window.epsClsGuardOff || (f => f()))(() => dbSet('classes', opt('keepNames') ? (dbGet('classes') || []).map(c => ({ name: c.name, students: [], ...(c.prof ? { prof: c.prof } : {}), ...(c.unss ? { unss: 1 } : {}) })) : []));
        DB.classesAll = opt('keepNames') ? (DB.classesAll || []).map(c => ({ name: c.name, students: [] })) : [];
        try { const S = JSON.parse(localStorage.getItem('chronos-eps-v1')); if (Array.isArray(S)) { S.forEach(c => c.name = ''); localStorage.setItem('chronos-eps-v1', JSON.stringify(S)); } } catch (e) {}
      }
      if (opt('grilles')) DB.grilles = []; else if (opt('evals')) DB.grilles.forEach(g => g.evals = {});
      if (opt('suivi')) DB.suivi = {};
      if (opt('dispenses')) DB.dispenses = [];
      if (opt('oublis')) DB.oublis = {};

      if (opt('debrief')) DB.debrief = [];
      if (opt('favs')) { DB.favs = []; DB.recent = []; }
      DB.annee = ny; save(); renderHome(); renderPlusYear();
      toast(`Bonne année scolaire ${ny} ! 🎉`);
      if (back) { closeTool(); openTool(back); } else closeTool();
    };
  });
}


/* ---------- Styles menu Plus / accueil ---------- */
document.head.insertAdjacentHTML('beforeend', `<style>
.menu-sec{margin:22px 4px 8px;font-size:.78rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted)}
.menu-item{display:flex;align-items:center;gap:14px;padding:12px 14px;border-bottom:1px solid var(--line);cursor:pointer;text-decoration:none;color:inherit}
.menu-item:last-child{border-bottom:none}
.menu-item:active{background:var(--grad-soft)}
.mi-ic{position:relative;width:48px;height:48px;flex:0 0 48px;border-radius:14px;display:grid;place-items:center;font-size:1.35rem;border:1px solid var(--line);box-shadow:0 3px 8px rgba(11,42,91,.08)}
.mi-ic .ico{width:26px;height:26px}.mi-ic .ico-img{width:48px;height:48px;border-radius:14px}
.mi-ic.gold{background:linear-gradient(135deg,rgba(212,175,55,.22),rgba(212,175,55,.08))}
.mi-ic.blue{background:linear-gradient(135deg,rgba(30,91,216,.18),rgba(30,91,216,.06))}
.mi-ic.navy{background:linear-gradient(135deg,rgba(11,42,91,.14),rgba(11,42,91,.04))}
.mi-ic.grad{background:var(--grad-soft)}
.menu-item b{display:block;font-size:1rem}
.menu-item .muted{font-size:.84rem}
.menu-item .chev{margin-left:auto;color:var(--muted);font-size:1.2rem}
details.faq{border-bottom:1px solid var(--line);padding:12px 0}
</style>`);

/* ---------- Menu Plus ---------- */
function renderPlus() {
  const box = document.getElementById('plus-menu'); if (!box) return;
  const item = (ic, color, title, sub, action) =>
    `<div onclick="${action}" class="menu-item"><span class="mi-ic ${color}">${ico(ic)}</span><span><b>${title}</b><span class="muted">${sub}</span></span><span class="chev">›</span></div>`;
  box.innerHTML = `
    <div class="menu-sec">Données & partage</div>
    <div class="card" style="padding:0" data-cfg>
      ${item('update', 'grad', 'Stockage & synchronisation', `<span id="sync-sub">${window.syncStatusText ? window.syncStatusText() : 'Mode : stockage local'}</span>`, 'openSync()')}
      ${item('lock', 'navy', 'Code enseignant', (window.curPin ? curPin() : DB.profPin) ? 'Code défini · protège les réglages des outils' : 'Protéger les réglages des outils face aux élèves', 'openProfPin()')}
      ${item('team', 'grad', 'Équipe EPS · tablettes partagées', window.teamOn && teamOn() ? `Mode Équipe · ${teamProfs().length} enseignant(s)${activeProf() ? ' · ' + esc(activeProf().name) : ''}` : 'Plusieurs collègues sur le même lot de tablettes', 'openTeam()')}
      ${window.isEpsAdmin && window.isEpsAdmin() ? item('lock', 'gold', 'Accès des collègues', 'Valider ou retirer les accès à EPS ONE', 'openAccessAdmin()') : ''}
      ${item('save', 'gold', 'Bilans & fiches élèves', 'Résultats par classe et par outil (camemberts) + une fiche en couleurs par élève, en PDF', 'openBilan({ fiches: true })')}
      ${item('save', 'navy', 'Espace utilisé', 'Données, photos et vidéos sur cette tablette', 'openStorage()')}
      ${item('restore', 'grad', 'Copies de secours', 'Une copie automatique par jour · récupérer des classes', 'openBackups()')}
      ${item('share', 'blue', 'Sauvegarde Nuage ou iCloud', 'Fichier à ranger dans le Nuage Apps Éducation ou iCloud Drive (pas de synchronisation)', 'openNuageBackup()')}
      ${item('save', 'blue', 'Exporter mes données', 'Fichier de sauvegarde JSON', 'exportData()')}
      ${item('restore', 'blue', 'Importer une sauvegarde', 'Restaurer depuis un fichier JSON', "document.getElementById('imp').click()")}
      ${item('share', 'grad', 'Partager l\'app', 'QR code et lien', 'openShare()')}
    </div>
    <div class="menu-sec">Aide & infos</div>
    <div class="card" style="padding:0">
      ${item('lock', 'navy', 'Confidentialité & RGPD', 'Données, caméra, suppression', 'openPrivacy()')}
      ${item('install', 'gold', 'Installer l\'application', 'Sur l\'écran d\'accueil de l\'iPhone, l\'iPad ou Android', 'openInstall(true)')}
      ${KOFI_URL ? item('coffee', 'gold', '☕ Soutenir EPS ONE', 'Offrir un café sur Ko-fi (facultatif · page en anglais, carte ou PayPal)', `window.open('${KOFI_URL}','_blank','noopener')`) : ''}
      ${item('info', 'navy', 'Mentions légales', 'Éditeur, hébergement, responsabilité', "window.open('mentions-legales.html','_blank','noopener')")}
      ${item('info', 'navy', 'À propos', 'Objectif, installation, crédits', 'openAbout()')}
      ${item('update', 'grad', 'Mise à jour', `Version ${APP_VERSION} · nouveautés`, 'openUpdate()')}
      ${item('mail', 'blue', 'Contact', 'steffdelaseuva@gmail.com', "location.href='mailto:steffdelaseuva@gmail.com?subject=EPS%20ONE'")}
    </div>
    <div class="menu-sec">Année scolaire</div>
    <div class="card" style="padding:0" data-cfg>
      ${item('calendar', 'gold', 'Nouvelle année scolaire', `Année en cours : ${esc(DB.annee)} · archiver ou repartir à zéro`, 'openNewYear()')}
      ${item('trash', 'navy', '<span style="color:var(--danger)">Tout effacer</span>', 'Supprime toutes les données de cet appareil', 'resetAll()')}
    </div>
    <p class="muted" style="text-align:center;margin:22px 0 6px;-webkit-user-select:none;user-select:none" onclick="window.epsStatsTap && epsStatsTap()">EPS ONE · v${APP_VERSION} · by <b>Steff64</b></p>`;
}
const renderPlusYear = renderPlus;

const _renderHome = renderHome;
renderHome = function () { _renderHome(); renderPlus(); };
renderHome();


/* ---------- « Comment ça marche ? » (accueil) ---------- */
window.openHowTo = to => openPanel('Comment ça marche ?', el => {
  const step = (n, t, d, btn) => `<div class="card" style="display:flex;gap:14px;align-items:flex-start;margin-top:12px">
      <div style="flex:0 0 38px;height:38px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;font-weight:900;font-size:1.1rem">${n}</div>
      <div style="flex:1;min-width:0"><b style="font-size:1.05rem">${t}</b><p class="muted" style="margin:4px 0 0;line-height:1.45">${d}</p>${btn || ''}</div></div>`;
  const b = (label, fn) => `<button class="btn btn-ghost" style="margin-top:10px" onclick="${fn}">${label}</button>`;
  el.innerHTML = `<p style="margin:0 0 4px;line-height:1.5">EPS ONE réunit vos outils de cours dans une seule app, <b>sans compte obligatoire</b> et <b>sans publicité</b>. En 6 étapes :</p>
    ${step(1, '📥 Importez ou créez vos classes', 'Fichier Pronote / ENT (CSV ou Excel) ou saisie à la main. Rangez-les en <b>classes EPS</b>, <b>UNSS / AS</b> ou <b>autres classes</b> (cross).', b('📥 Mes classes', "openImportClasses()"))}
    ${step(2, '🧰 Utilisez les outils', 'Chronos, matchs, cross, HYROX, acrosport, gym, demi-fond… Vos classes sont déjà dedans : choisissez la classe, les élèves et les groupes apparaissent.', b('Ouvrir les OUTILS →', "closeTool();go('outils')"))}
    ${step(3, '📶 Hors ligne ou en synchro entre tablettes', 'Sans réseau, tout fonctionne et reste sur l\'appareil. Avec la synchronisation (votre cloud ou un compte EPS ONE), chaque groupe peut avoir sa tablette et les résultats arrivent en direct sur la vôtre. Vous pouvez aussi sauvegarder un fichier dans votre <b>Nuage Apps Éducation</b> ou dans <b>iCloud</b> (sans synchronisation).', b('🔄 Stockage et/ou synchronisation', "openSync()"))}
    <div id="howto-equipe">${step(4, '👥 Équipe EPS · tablettes partagées', 'Plusieurs collègues sur le <b>même lot de tablettes</b>, avec un seul compte pour l\'équipe (Dropbox conseillé). En début de cours, chacun touche <b>son nom</b> (« Qui fait cours ? ») et tape <b>son code</b> : il retrouve ses classes et ses favoris, sans se déconnecter. Un collègue seul dans son établissement n\'en a pas besoin.', b('👥 Régler l\'équipe', "openTeam()"))}</div>
    ${step(5, '🔒 Confiez les tablettes aux élèves', 'Créez votre <b>code enseignant</b> : les élèves utilisent les outils (chronos, coches, projets…) mais ne peuvent pas modifier vos réglages. Le bouton 🔒/🔓 en haut verrouille avant de passer la tablette.', b('🔒 Code enseignant', "openProfPin()"))}
    ${step(6, '📊 Retrouvez les résultats', 'Les résultats de chaque outil arrivent dans <b>Résultats des élèves</b> (individuel) et <b>Résultats collectifs</b> (groupes, tournois), exportables en CSV.', b('📊 Résultats des élèves', "openTool('resultats')"))}
    <p class="muted" style="margin:14px 2px 0;font-size:.85rem">🔗 Lien direct vers une étape à envoyer aux collègues : <b>…/eps-one/#equipe</b> (équipe) ou <b>…/eps-one/#aide</b> (cette page).</p>
    <p class="muted" style="margin:8px 2px 0;font-size:.85rem">Astuce : installez l'app sur l'écran d'accueil (Plus → Installer l'application) et ajoutez vos outils préférés en ☆ favoris.</p>`;
  if (to) setTimeout(() => { const x = el.querySelector('#howto-' + to); if (x) { x.scrollIntoView({ behavior: 'smooth', block: 'start' }); x.firstElementChild.style.boxShadow = '0 0 0 3px var(--blue,#1E5BD8)'; } }, 250);
});
