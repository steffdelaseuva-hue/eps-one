/* =========================================================
   EPS ONE — Invitation à installer l'app sur l'écran d'accueil
   Affichée dans le navigateur (iPhone, iPad, Android) tant que l'app
   n'est pas ouverte depuis son icône. Sur iPhone/iPad, Safari et l'icône
   n'ont pas les mêmes données : on le dit clairement.
   ========================================================= */
ICONS.install = '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M12 7.5v7M9 11.5l3 3 3-3M10.5 18.5h3"/>';
(() => {
  const ua = navigator.userAgent;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  const iosOther = ios && /CriOS|FxiOS|EdgiOS/.test(ua);   // Chrome / Firefox / Edge sur iPhone-iPad
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', () => { try { localStorage.setItem('epsone_inst', 'installed'); } catch (e) {} document.getElementById('inst-ov')?.remove(); });

  document.head.insertAdjacentHTML('beforeend', `<style>
#inst-ov{position:fixed;inset:0;z-index:600;background:rgba(7,18,42,.62);display:flex;padding:16px;overflow:auto}
#inst-ov .ib{margin:auto;background:var(--card,#fff);color:var(--text);border-radius:24px;width:100%;max-width:440px;padding:18px 18px 14px;box-shadow:0 20px 50px rgba(0,0,0,.3)}
#inst-ov .kick{font-size:.78rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
#inst-ov .hero{display:flex;align-items:center;gap:14px;margin:14px 0;padding:14px;border-radius:18px;background:var(--grad-soft);border:1.5px solid var(--line)}
#inst-ov .hero img{width:64px;height:64px;border-radius:16px;box-shadow:0 6px 16px rgba(11,42,91,.25)}
#inst-ov ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
#inst-ov li{display:flex;align-items:center;gap:12px;padding:8px 12px;font-size:.95rem;border-radius:14px;border:1.5px solid var(--line);font-weight:700}
#inst-ov li .n{flex:0 0 28px;height:28px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;font-weight:900;font-size:.9rem}
#inst-ov li svg{flex:0 0 26px;width:26px;height:26px;margin-left:auto}
#inst-ov .warn{margin:12px 0 0;padding:10px 12px;border-radius:12px;background:rgba(201,162,39,.14);font-size:.85rem;line-height:1.4}
#inst-ov .lk{all:unset;display:block;text-align:center;margin-top:10px;font-size:.82rem;color:var(--muted);cursor:pointer;text-decoration:underline}
</style>`);

  const I = {
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="#1E5BD8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M5 11v9h14v-9"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="#1E5BD8" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="#1E5BD8"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
    app: '<img src="icons/icone-v3-180.png" alt="" style="width:26px;height:26px;border-radius:7px">'
  };
  const steps = () => ios ? [
      [iosOther ? 'Touchez le bouton Partager (en haut ou en bas)' : 'Dans Safari, touchez Partager', I.share],
      ['Choisissez « Sur l\'écran d\'accueil »', I.plus],
      ['Touchez « Ajouter »', ''],
      ['Ouvrez ensuite EPS ONE depuis son icône', I.app]]
    : [['Touchez le menu ⋮ du navigateur', I.dots],
      ['Choisissez « Installer l\'application » ou « Ajouter à l\'écran d\'accueil »', I.plus],
      ['Ouvrez ensuite EPS ONE depuis son icône', I.app]];

  window.openInstall = force => {
    if (document.getElementById('inst-ov')) return;
    if (standalone() && !force) return;
    const o = document.createElement('div'); o.id = 'inst-ov';
    const inst = standalone();
    o.innerHTML = `<div class="ib" role="dialog" aria-modal="true">
      <div class="kick">${inst ? 'Application installée ✓' : 'Installez l\'application'}</div>
      <div class="hero"><img src="icons/icone-v3-180.png" alt=""><div><b style="font-size:1.1rem;color:var(--text)">EPS ONE</b><div class="muted" style="font-size:.85rem;line-height:1.35">${inst ? 'Vous utilisez déjà l\'app depuis son icône.' : 'Plein écran, hors connexion, accès en un geste depuis l\'écran d\'accueil.'}</div></div></div>
      ${deferred && !inst ? `<button class="btn btn-grad btn-block" id="inst-go">📲 Installer EPS ONE</button><p class="muted" style="text-align:center;margin:8px 0 10px;font-size:.8rem">ou manuellement :</p>` : ''}
      <ol>${steps().map((s, i) => `<li><span class="n">${i + 1}</span><span>${s[0]}</span>${s[1]}</li>`).join('')}</ol>
      ${ios && !inst ? '<div class="warn">⚠️ Sur iPhone et iPad, <b>Safari et l\'icône n\'ont pas les mêmes données</b>. Installez l\'app <b>avant</b> de saisir vos classes, puis utilisez toujours l\'icône.</div>' : ''}
      <button class="btn btn-grad btn-block" style="margin-top:14px" id="inst-ok">J'ai compris</button>
      ${inst || force ? '' : '<button class="btn btn-ghost btn-block" style="margin-top:8px" id="inst-later">Plus tard</button><button class="lk" id="inst-never">Ne plus afficher (je reste dans le navigateur)</button>'}</div>`;
    document.body.appendChild(o);
    const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
    const close = () => o.remove();
    o.querySelector('#inst-ok').onclick = () => { try { sessionStorage.setItem('epsone_inst_seen', '1'); } catch (e) {} close(); };
    const later = o.querySelector('#inst-later'); if (later) later.onclick = () => { set('epsone_inst_snooze', String(Date.now() + 3 * 864e5)); close(); };
    const never = o.querySelector('#inst-never'); if (never) never.onclick = () => { set('epsone_inst', 'never'); close(); };
    const go = o.querySelector('#inst-go'); if (go) go.onclick = async () => { const d = deferred; deferred = null; d.prompt(); const r = await d.userChoice.catch(() => null); if (r && r.outcome === 'accepted') { set('epsone_inst', 'installed'); close(); } };
  };

  // Affichage automatique : navigateur mobile, app pas ouverte depuis son icône
  const auto = () => {
    if (standalone() || !(ios || android)) return;
    let st = '', snooze = 0, seen = '';
    try { st = localStorage.getItem('epsone_inst') || ''; snooze = +localStorage.getItem('epsone_inst_snooze') || 0; seen = sessionStorage.getItem('epsone_inst_seen') || ''; } catch (e) {}
    if (st === 'never' || seen || Date.now() < snooze) return;
    openInstall();
  };
  if (document.readyState === 'complete') setTimeout(auto, 900); else window.addEventListener('load', () => setTimeout(auto, 900));
})();
