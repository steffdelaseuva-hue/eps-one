/* =========================================================
   EPS ONE — Changement d'adresse : GitHub → Forge des communs
   Visible UNIQUEMENT sur l'ancienne adresse (steffdelaseuva-hue.github.io).
   - une fenêtre d'information au lancement (jusqu'à « J'ai compris »)
   - un bandeau permanent en haut de l'Accueil avec le nouveau lien
   ========================================================= */
(function () {
  if (location.hostname !== 'steffdelaseuva-hue.github.io') return;
  const NEW_URL = 'https://bardynstephane.forge.apps.education.fr/eps-one/';
  const KEY = 'eps-migration-forge-vu';
  const seen = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
  const setSeen = () => { try { localStorage.setItem(KEY, '1'); } catch (e) {} };

  const css = document.createElement('style');
  css.textContent = `
  .mig-banner{display:flex;gap:12px;align-items:center;margin:0 0 14px;padding:12px 14px;border-radius:var(--radius,18px);
    background:var(--grad-soft);border:2px solid var(--gold,#C9A227);color:var(--text)}
  .mig-banner b{display:block;font-size:.98rem}
  .mig-banner small{display:block;color:var(--muted);font-size:.8rem;line-height:1.35;margin-top:2px}
  .mig-banner .mig-txt{flex:1;min-width:0}
  .mig-banner a{flex:0 0 auto;text-decoration:none;font-weight:800;font-size:.85rem;color:#fff;background:var(--grad);padding:9px 12px;border-radius:12px;white-space:nowrap}
  .mig-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(7,18,42,.72);display:flex;align-items:center;justify-content:center;
    padding:max(14px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))}
  .mig-box{background:var(--card,#fff);color:var(--text);border-radius:20px;max-width:560px;width:100%;max-height:100%;overflow:auto;box-shadow:0 18px 50px rgba(0,0,0,.4)}
  .mig-head{background:var(--grad);color:#fff;padding:18px 20px}
  .mig-head h2{margin:0;font-size:1.25rem;line-height:1.2}
  .mig-head p{margin:6px 0 0;font-size:.88rem;opacity:.95}
  .mig-body{padding:16px 20px 6px;font-size:.92rem;line-height:1.45}
  .mig-body h3{font-size:.95rem;margin:14px 0 6px}
  .mig-body ul{margin:0;padding-left:1.15em}
  .mig-body li{margin:4px 0}
  .mig-url{display:block;word-break:break-all;font-weight:700;background:var(--grad-soft);border-radius:10px;padding:9px 11px;margin:8px 0 2px;color:var(--text)}
  .mig-foot{display:flex;flex-wrap:wrap;gap:8px;padding:12px 20px 18px}
  .mig-foot a,.mig-foot button{flex:1 1 180px;text-align:center;font:inherit;font-weight:800;border-radius:12px;padding:12px 14px;cursor:pointer;text-decoration:none;border:0}
  .mig-go{background:var(--grad);color:#fff}
  .mig-ok{background:transparent;color:var(--text);border:2px solid var(--line) !important}`;
  document.head.appendChild(css);

  /* Bandeau permanent dans l'Accueil */
  const banner = () => {
    const home = document.getElementById('view-accueil');
    if (!home || home.querySelector('.mig-banner')) return;
    const d = document.createElement('div');
    d.className = 'mig-banner';
    d.innerHTML = `<div class="mig-txt"><b>🏠 EPS ONE a déménagé</b><small>Nouvelle adresse sur la Forge des communs numériques éducatifs (Éducation nationale). Cette ancienne adresse reste ouverte pendant la transition.</small></div>
      <a href="${NEW_URL}" rel="noopener">Ouvrir ↗</a>`;
    home.insertBefore(d, home.firstChild);
    d.querySelector('.mig-txt').addEventListener('click', popup);
  };

  /* Fenêtre d'information */
  function popup() {
    if (document.querySelector('.mig-ov')) return;
    const o = document.createElement('div');
    o.className = 'mig-ov';
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'mig-t');
    o.innerHTML = `<div class="mig-box">
      <div class="mig-head"><h2 id="mig-t">EPS ONE change d'adresse</h2><p>L'application est désormais hébergée sur la Forge des communs numériques éducatifs.</p></div>
      <div class="mig-body">
        <span class="mig-url">${NEW_URL}</span>
        <h3>Pourquoi ce changement ?</h3>
        <ul>
          <li>La Forge est un <b>service public de l'Éducation nationale</b> (apps.education.fr), destiné aux enseignants qui créent des ressources pour l'école.</li>
          <li>Elle remplace GitHub, un hébergeur américain : un cadre <b>plus adapté à un usage scolaire</b> et à la protection des données.</li>
          <li>Le code d'EPS ONE y est publié en <b>logiciel libre</b> (licence GPL v3) : l'application reste gratuite, sans publicité.</li>
        </ul>
        <h3>Que dois-je faire ?</h3>
        <ul>
          <li><b>Compte EPS ONE (synchronisation)</b> : ouvrez la nouvelle adresse et connectez-vous avec le même compte. Vos données reviennent automatiquement.</li>
          <li><b>Mon cloud (Dropbox, Google Drive)</b> : ouvrez la nouvelle adresse et reconnectez votre cloud.</li>
          <li><b>Sans synchronisation</b> : vos données restent liées à cette ancienne adresse. Ici, faites <b>Plus → Sauvegardes → exporter</b>, puis importez le fichier sur la nouvelle adresse.</li>
          <li><b>Icône sur l'écran d'accueil</b> : ajoutez la nouvelle adresse depuis Safari (Partager → Sur l'écran d'accueil), puis supprimez l'ancienne icône une fois vos données retrouvées.</li>
        </ul>
        <p style="margin:12px 0 0;color:var(--muted);font-size:.84rem">Cette ancienne adresse reste disponible pendant la transition. Le lien vers la nouvelle adresse reste affiché en haut de l'Accueil.</p>
      </div>
      <div class="mig-foot"><a class="mig-go" href="${NEW_URL}" rel="noopener">Ouvrir la nouvelle adresse ↗</a><button type="button" class="mig-ok">J'ai compris</button></div></div>`;
    const close = () => { setSeen(); o.remove(); document.removeEventListener('keydown', esc); };
    const esc = e => { if (e.key === 'Escape') close(); };
    o.querySelector('.mig-ok').addEventListener('click', close);
    o.querySelector('.mig-go').addEventListener('click', setSeen);
    document.addEventListener('keydown', esc);
    document.body.appendChild(o);
    o.querySelector('.mig-ok').focus({ preventScroll: true });
    o.querySelector('.mig-box').scrollTop = 0;
  }

  const start = () => { banner(); if (!seen()) popup(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
