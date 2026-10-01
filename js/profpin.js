/* =========================================================
   EPS ONE — Code enseignant
   Protège le retour au « 🔒 Mode enseignant » sur les tablettes des élèves.
   Code à 4 chiffres, enregistré sous forme d'empreinte (SHA-256), partagé
   entre les tablettes synchronisées de l'enseignant.
   ========================================================= */
document.head.insertAdjacentHTML('beforeend', `<style>
#pin-ov{position:fixed;inset:0;z-index:500;background:rgba(7,18,42,.78);display:grid;place-items:center;padding:16px}
#pin-ov .pin-box{background:var(--card);border-radius:22px;padding:20px 18px;width:100%;max-width:340px;text-align:center;box-shadow:var(--shadow)}
#pin-ov .dots{display:flex;gap:14px;justify-content:center;margin:14px 0 6px}
#pin-ov .dots span{width:18px;height:18px;border-radius:50%;border:2.5px solid var(--navy,#0B2A5B)}
#pin-ov .dots span.on{background:var(--navy,#0B2A5B)}
#pin-ov .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}
#pin-ov .pad button{padding:16px 0;border-radius:16px;border:1.5px solid var(--line);background:var(--card);font-size:1.5rem;font-weight:800;color:var(--text)}
#pin-ov .pad button:active{background:var(--grad-soft)}
#pin-ov .err{color:var(--danger);font-weight:700;min-height:1.3em;font-size:.9rem}
@keyframes pinshake{0%,100%{transform:none}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
#pin-ov .shake{animation:pinshake .3s}
</style>`);

// Code actif : celui de l'enseignant choisi (mode Équipe), sinon le code enseignant de l'appareil/compte
window.curPin = () => { if (window.teamOn && teamOn() && !activeProf()) return 'equipe'; const p = window.activeProf && activeProf(); return p ? p.pin : DB.profPin; };
window.setCurPin = h => { const p = window.activeProf && activeProf(), o = p || DB, k = p ? 'pin' : 'profPin'; if (h) o[k] = h; else delete o[k]; save(); };
const pinHash = async p => { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('epsone-prof|' + p)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); };

// Pavé numérique : mode 'ask' (vérifier), 'new' (créer / modifier le code)
function pinPad(mode, onOK, title, opts = {}) {
  let step = 1, first = '', val = '', err = '';
  const o = document.createElement('div'); o.id = 'pin-ov'; document.body.appendChild(o);
  const close = () => o.remove();
  const draw = shake => {
    const h = mode === 'new' ? (step === 1 ? (opts.newTitle || 'Choisissez un code enseignant') : 'Confirmez le code') : (title || 'Code enseignant');
    o.innerHTML = `<div class="pin-box ${shake ? 'shake' : ''}"><div style="font-size:1.6rem">🔒</div><h3 style="margin:4px 0 0">${h}</h3>
      <p class="muted" style="margin:4px 0 0;font-size:.82rem">${mode === 'new' ? (opts.newHint || '4 chiffres, à garder pour vous : il protège le mode enseignant des tablettes élèves.') : 'Réservé à l\'enseignant.'}</p>
      <div class="dots">${[0, 1, 2, 3].map(i => `<span class="${i < val.length ? 'on' : ''}"></span>`).join('')}</div><div class="err">${err}</div>
      <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}<button data-k="x" style="font-size:1rem">Annuler</button><button data-k="0">0</button><button data-k="b">⌫</button></div></div>`;
    o.querySelectorAll('[data-k]').forEach(b => b.onclick = () => key(b.dataset.k));
  };
  const key = async k => {
    if (k === 'x') return close();
    if (k === 'b') { val = val.slice(0, -1); return draw(); }
    if (val.length >= 4) return; val += k; err = ''; draw(); if (val.length < 4) return;
    if (mode === 'new') {
      if (step === 1) { first = val; val = ''; step = 2; return setTimeout(() => draw(), 150); }
      if (val !== first) { err = 'Les deux codes sont différents'; val = ''; first = ''; step = 1; return setTimeout(() => draw(true), 150); }
      const hv = await pinHash(val); if (opts.onSet) opts.onSet(hv); else setCurPin(hv); save(); close(); toast('🔒 Code enregistré'); window.profUnlock && profUnlock(); onOK && onOK(); return;
    }
    if (await pinHash(val) === (opts.hash || curPin())) { close(); onOK && onOK(); }
    else { err = 'Code incorrect'; val = ''; setTimeout(() => draw(true), 150); }
  };
  draw();
}
// Demande le code (le crée s'il n'existe pas encore), puis lance onOK
window.profAsk = (onOK, title) => window.teamOn && teamOn() && !activeProf() ? openWho(onOK) : pinPad(curPin() ? 'ask' : 'new', onOK, title);

// Tous les boutons « 🔒 Mode enseignant » (id gv-prof) et zones marquées data-prof passent par le code
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('#gv-prof,[data-prof]'); if (!t) return;
  if (window.__profPass) { window.__profPass = false; return; }
  if (t.id !== 'gv-prof' && window.profUnlocked && profUnlocked()) return;   // appareil déverrouillé : pas de code
  const det = t.tagName === 'SUMMARY' && t.parentElement; if (det && det.open) return;   // refermer : pas de code
  e.preventDefault(); e.stopImmediatePropagation();
  profAsk(() => { window.__profPass = true; const oc = window.confirm; window.confirm = () => true; try { t.click(); } finally { window.confirm = oc; window.__profPass = false; } });
}, true);

/* Réglage dans Plus → Code enseignant */
window.openProfPin = () => {
  const panel = () => openPanel('Code enseignant', el => {
    el.innerHTML = `${window.activeProf && activeProf() ? `<div class="card" style="margin-bottom:12px;background:var(--grad-soft)">👥 <b>Mode Équipe</b> : vous réglez le code perso de <b>${esc(activeProf().name)}</b>. Les collègues gèrent le leur dans « Qui fait cours ? ».</div>` : ''}<div class="card doc"><p style="margin:0;line-height:1.5">Ce code à 4 chiffres protège les <b>réglages de tous les outils</b>, Mes classes, les données, et le retour au <b>🔒 Mode enseignant</b> des tablettes « un groupe ». Il est le même sur toutes vos tablettes synchronisées.</p></div>
      <div class="card" style="margin-top:12px"><p style="margin:0"><b>${curPin() ? '✅ Un code est défini.' : 'Aucun code pour l\'instant.'}</b></p>
        <button class="btn btn-grad btn-block" style="margin-top:12px" id="pp-new">${curPin() ? '✏️ Modifier le code' : '🔒 Créer un code'}</button>
        ${curPin() ? '<button class="btn btn-ghost btn-block" style="margin-top:8px" id="pp-del">Supprimer le code</button>' : ''}</div>
      ${curPin() ? `<div class="card" style="margin-top:12px"><b>Verrouillage de cet appareil</b><p class="muted" style="margin:4px 0 8px;font-size:.82rem">En mode élève (🔒), les réglages des outils, Mes classes et les données demandent le code. Le bouton 🔒/🔓 en haut de l'écran verrouille ou déverrouille à tout moment.</p>
        ${[['auto', '🔒 Verrouillé à l\'ouverture et après 15 min sans activité', 'Conseillé pour les tablettes de la classe'], ['launch', '🔒 Verrouillé à chaque ouverture de l\'app', 'Reste déverrouillé tant que l\'app est ouverte'], ['off', '🔓 Jamais verrouillé (appareil personnel)', 'Votre téléphone : pas de code pour les réglages']].map(([k, l, d]) => `<label style="display:flex;gap:10px;align-items:flex-start;margin:8px 0;cursor:pointer"><input type="radio" name="pplm" value="${k}" ${lockMode() === k ? 'checked' : ''} style="width:auto;margin-top:3px"><span><b>${l}</b><br><span class="muted" style="font-size:.8rem">${d}</span></span></label>`).join('')}</div>` : ''}
      ${curPin() ? `<details class="card" style="margin-top:12px"><summary style="font-weight:800;cursor:pointer">Code oublié ?</summary><p class="muted" style="font-size:.85rem">Tapez <b>REINITIALISER</b> pour effacer le code, puis créez-en un nouveau.</p><input id="pp-r" placeholder="REINITIALISER" autocapitalize="characters"><button class="btn btn-ghost btn-block" style="margin-top:8px" id="pp-rst">Effacer le code</button></details>` : ''}`;
    el.querySelectorAll('[name="pplm"]').forEach(r => r.onchange = () => { const v = r.value; profGate(() => { try { localStorage.setItem(LOCK_KEY, v); } catch (e) {} if (v !== 'off') profUnlock(); lockUI(); toast('Réglage enregistré'); }); });
    el.querySelector('#pp-new').onclick = () => curPin() ? profAsk(() => pinPad('new', panel), 'Code actuel') : pinPad('new', panel);
    const d = el.querySelector('#pp-del'); if (d) d.onclick = () => profAsk(() => { setCurPin(null); save(); lockUI(); toast('Code supprimé'); panel(); }, 'Code actuel');
    const r = el.querySelector('#pp-rst'); if (r) r.onclick = () => { if (el.querySelector('#pp-r').value.trim().toUpperCase() !== 'REINITIALISER') return toast('Tapez REINITIALISER'); setCurPin(null); save(); lockUI(); toast('Code effacé'); panel(); };
  });
  panel();
};

/* =========================================================
   Verrou enseignant global
   · Zones de réglage marquées data-cfg : touchées en « mode élève » → code demandé.
     À l'intérieur, data-free rend un élément utilisable par les élèves (saisie de résultats…).
   · Outils entièrement réservés : TOOL_PROF (ex. Mes classes).
   · Une fois le code saisi, l'appareil reste déverrouillé (selon le réglage de l'appareil) ;
     le bouton 🔒/🔓 de l'en-tête reverrouille avant de confier la tablette aux élèves.
   · data-prof (actions sensibles) : sans code si l'appareil est déverrouillé, sauf #gv-prof
     (sortie de la vue « un groupe ») qui demande toujours le code.
   ========================================================= */
const TOOL_PROF = new Set(['classes', 'dispenses', 'oubli']);
const LOCK_KEY = 'epsone_lock_mode';          // 'auto' (défaut) · 'launch' · 'off'  — propre à l'appareil
const LOCK_IDLE = 15 * 60 * 1000;
let profOpenUntil = 0;
const lockMode = () => { try { return localStorage.getItem(LOCK_KEY) || 'auto'; } catch (e) { return 'auto'; } };
window.profUnlocked = () => !curPin() || lockMode() === 'off' || Date.now() < profOpenUntil;
window.profUnlock = () => { profOpenUntil = lockMode() === 'auto' ? Date.now() + LOCK_IDLE : Infinity; lockUI(); };
window.profLock = () => { profOpenUntil = 0; lockUI(); };
window.profGate = (onOK, title) => profUnlocked() ? onOK() : profAsk(() => { profUnlock(); onOK(); }, title);

document.head.insertAdjacentHTML('beforeend', `<style>
body.prof-locked [data-cfg]{position:relative}
body.prof-locked [data-cfg]:not([data-cfg="bare"])::after{content:'🔒';position:absolute;top:6px;right:8px;font-size:.75rem;opacity:.55;pointer-events:none;z-index:2}
.lock-btn{font-size:1.05rem}
</style>`);

function lockUI() {
  const locked = !!curPin() && !profUnlocked();
  document.body.classList.toggle('prof-locked', locked);
  document.querySelectorAll('.lock-btn').forEach(b => { b.style.display = curPin() && lockMode() !== 'off' ? '' : 'none'; b.textContent = locked ? '🔒' : '🔓';
    b.title = b.ariaLabel = locked ? 'Mode élève : touchez pour déverrouiller (code enseignant)' : 'Mode enseignant : touchez pour verrouiller avant de confier l\'appareil'; });
}
window.lockUI = lockUI;
const lockBtnClick = () => {
  if (!curPin()) return openProfPin();
  if (profUnlocked()) { profLock(); toast('🔒 Mode élève : réglages verrouillés'); }
  else profAsk(() => { profUnlock(); toast('🔓 Mode enseignant'); }, 'Déverrouiller');
};
// Boutons 🔒/🔓 dans la barre du haut et dans l'en-tête des outils
(() => {
  const mk = () => { const b = document.createElement('button'); b.className = 'icon-btn lock-btn'; b.type = 'button'; b.onclick = lockBtnClick; return b; };
  const tb = document.querySelector('.topbar .spacer'); if (tb) tb.after(mk());
  const star = document.getElementById('screen-star'); if (star) star.before(mk());
  lockUI();
})();

// Délai d'inactivité : chaque geste de l'enseignant prolonge le déverrouillage
document.addEventListener('pointerdown', () => { if (curPin() && lockMode() === 'auto' && Date.now() < profOpenUntil) profOpenUntil = Date.now() + LOCK_IDLE; }, true);
setInterval(lockUI, 20000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) lockUI(); });

// Interception des zones de réglage en mode élève
// · aucun écouteur « touchstart » : sur iPhone/iPad, bloquer touchstart supprime le « click » (bouton muet)
//   et un écouteur tactile non passif fige le défilement quand l'app calcule (synchro…)
// · pointerdown : on arrête seulement la propagation (et le focus des champs) ; le défilement reste libre
// · click / focusin : bloqués dans la zone et ouvrent le pavé du code
const cfgTarget = t => { if (!t || !t.closest) return null; if (t.closest('#pin-ov,[data-free]')) return null;
  const inProfTool = TOOL_PROF.has(typeof currentTool !== 'undefined' ? currentTool : '') && t.closest('#screen-body');
  return inProfTool || t.closest('[data-cfg]'); };
const lockAsk = () => { if (!document.getElementById('pin-ov')) profAsk(() => { profUnlock(); toast('🔓 Mode enseignant : vous pouvez modifier les réglages'); }, 'Réglages réservés à l\'enseignant'); };
['pointerdown', 'click', 'focusin', 'change', 'input', 'keydown'].forEach(type => document.addEventListener(type, e => {
  if (!curPin() || profUnlocked()) return;
  if (!cfgTarget(e.target)) return;
  if (type === 'keydown' && !['Enter', ' '].includes(e.key) && !(e.target.matches && e.target.matches('input,textarea,select'))) return;
  e.stopImmediatePropagation();
  if (type === 'pointerdown') { if (e.target.matches && e.target.matches('input,select,textarea') && e.cancelable) e.preventDefault(); return; }
  if (e.cancelable) e.preventDefault();
  if (type === 'focusin') { if (e.target.blur) e.target.blur(); lockAsk(); }
  if (type === 'click') lockAsk();
}, { capture: true }));

/* =========================================================
   Navigation verrouillée en mode élève
   Appareil verrouillé (🔒) : les élèves restent dans l'outil ouvert.
   Ouvrir un autre outil, revenir à l'accueil, changer d'onglet
   (Accueil / Outils / Plus) demande le code enseignant.
   ========================================================= */
(() => {
  const navLocked = () => !!curPin() && !profUnlocked();
  const guard = (name, label) => {
    const fn = window[name]; if (typeof fn !== 'function' || fn.__guarded) return;
    const g = function (...a) {
      if (window.__navPass) { window.__navPass = false; return fn.apply(this, a); }   // enchaînement prévu par un outil (ex. Tests 6e → Test VMA)
      if (!navLocked() || (name === 'closeTool' && typeof currentTool !== 'undefined' && !currentTool)) return fn.apply(this, a);   // panneaux d'aide : fermeture libre
      if (document.getElementById('pin-ov') || document.getElementById('who-ov')) return;
      profAsk(() => { profUnlock(); toast('🔓 Mode enseignant'); fn.apply(this, a); }, label);
    };
    g.__guarded = true; window[name] = g;
  };
  guard('openTool', 'Changer d\'outil : code enseignant');
  guard('closeTool', 'Quitter l\'outil : code enseignant');
  guard('go', 'Navigation réservée à l\'enseignant');
})();

/* =========================================================
   Résultats protégés en mode élève
   · Onglets « 📊 Résultats / Bilan » des outils : code enseignant.
   · Si un outil affiche lui-même cet onglet (ex. après « Enregistrer »
     sur la tablette d'un groupe), le contenu est masqué jusqu'au code.
   · Listes de résultats affichées dans les outils : limitées à la classe
     en cours (voir eleveMode() dans natation, lutte, match).
   ========================================================= */
window.eleveMode = () => !!curPin() && !profUnlocked();
(() => {
  const RES = new Set(['resultats', 'res', 'bilan']);
  const isRes = b => b && b.dataset && RES.has(b.dataset.tab);
  const SEL = '#screen-body [data-tab], #screen-body #lu-bil';
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest(SEL); if (!t || !eleveMode()) return;
    if (t.id !== 'lu-bil' && !isRes(t)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (window.__resPass) return;
    profAsk(() => { profUnlock(); window.__resPass = false; t.click(); }, 'Résultats réservés à l\'enseignant');
  }, true);
  // Contenu d'un onglet résultats affiché alors que l'appareil est verrouillé → masqué
  const mask = () => {
    const body = document.getElementById('screen-body'); if (!body) return;
    const locked = eleveMode();
    body.querySelectorAll('.co-tabs, .t6-tabs').forEach(bar => {
      const on = [...bar.querySelectorAll('[data-tab]')].find(b => b.classList.contains('on'));
      const hide = locked && isRes(on);
      let card = bar.nextElementSibling && bar.nextElementSibling.classList.contains('res-lock') ? bar.nextElementSibling : null;
      const sibs = []; for (let n = bar.nextElementSibling; n; n = n.nextElementSibling) if (!n.classList.contains('res-lock')) sibs.push(n);
      sibs.forEach(n => { if (hide) { if (n.style.display !== 'none') { n.dataset.resHid = '1'; n.style.display = 'none'; } } else if (n.dataset.resHid) { n.style.display = ''; delete n.dataset.resHid; } });
      if (hide && !card) { card = document.createElement('div'); card.className = 'card res-lock'; card.style.cssText = 'text-align:center;padding:26px 16px';
        card.innerHTML = '<div style="font-size:2rem">🔒</div><b style="font-size:1.1rem">Résultats réservés à l\'enseignant</b><p class="muted" style="margin:6px 0 12px">Les résultats enregistrés sont bien conservés.</p><button class="btn btn-grad" type="button">🔓 Code enseignant</button>';
        card.querySelector('button').onclick = () => profAsk(() => { profUnlock(); mask(); }, 'Résultats réservés à l\'enseignant');
        bar.after(card); }
      if (!hide && card) card.remove();
    });
  };
  const start = () => { const body = document.getElementById('screen-body'); if (!body) return;
    let q = false; new MutationObserver(() => { if (q) return; q = true; requestAnimationFrame(() => { q = false; mask(); }); }).observe(body, { childList: true, subtree: true }); };
  start();
  const lu = window.lockUI; window.lockUI = function () { lu.apply(this, arguments); try { mask(); } catch (e) {} };
})();
