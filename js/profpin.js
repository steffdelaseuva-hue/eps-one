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

const pinHash = async p => { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('epsone-prof|' + p)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); };

// Pavé numérique : mode 'ask' (vérifier), 'new' (créer / modifier le code)
function pinPad(mode, onOK, title) {
  let step = 1, first = '', val = '', err = '';
  const o = document.createElement('div'); o.id = 'pin-ov'; document.body.appendChild(o);
  const close = () => o.remove();
  const draw = shake => {
    const h = mode === 'new' ? (step === 1 ? 'Choisissez un code enseignant' : 'Confirmez le code') : (title || 'Code enseignant');
    o.innerHTML = `<div class="pin-box ${shake ? 'shake' : ''}"><div style="font-size:1.6rem">🔒</div><h3 style="margin:4px 0 0">${h}</h3>
      <p class="muted" style="margin:4px 0 0;font-size:.82rem">${mode === 'new' ? '4 chiffres, à garder pour vous : il protège le mode enseignant des tablettes élèves.' : 'Réservé à l\'enseignant.'}</p>
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
      DB.profPin = await pinHash(val); save(); close(); toast('🔒 Code enseignant enregistré'); onOK && onOK(); return;
    }
    if (await pinHash(val) === DB.profPin) { close(); onOK && onOK(); }
    else { err = 'Code incorrect'; val = ''; setTimeout(() => draw(true), 150); }
  };
  draw();
}
// Demande le code (le crée s'il n'existe pas encore), puis lance onOK
window.profAsk = (onOK, title) => pinPad(DB.profPin ? 'ask' : 'new', onOK, title);

// Tous les boutons « 🔒 Mode enseignant » (id gv-prof) et zones marquées data-prof passent par le code
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('#gv-prof,[data-prof]'); if (!t) return;
  if (window.__profPass) { window.__profPass = false; return; }
  const det = t.tagName === 'SUMMARY' && t.parentElement; if (det && det.open) return;   // refermer : pas de code
  e.preventDefault(); e.stopImmediatePropagation();
  profAsk(() => { window.__profPass = true; const oc = window.confirm; window.confirm = () => true; try { t.click(); } finally { window.confirm = oc; window.__profPass = false; } });
}, true);

/* Réglage dans Plus → Code enseignant */
window.openProfPin = () => {
  const panel = () => openPanel('Code enseignant', el => {
    el.innerHTML = `<div class="card doc"><p style="margin:0;line-height:1.5">Sur les tablettes des élèves (vue « un groupe »), le retour au <b>🔒 Mode enseignant</b> demande ce code à 4 chiffres. Il est le même sur toutes vos tablettes synchronisées.</p></div>
      <div class="card" style="margin-top:12px"><p style="margin:0"><b>${DB.profPin ? '✅ Un code est défini.' : 'Aucun code pour l\'instant.'}</b></p>
        <button class="btn btn-grad btn-block" style="margin-top:12px" id="pp-new">${DB.profPin ? '✏️ Modifier le code' : '🔒 Créer un code'}</button>
        ${DB.profPin ? '<button class="btn btn-ghost btn-block" style="margin-top:8px" id="pp-del">Supprimer le code</button>' : ''}</div>
      ${DB.profPin ? `<details class="card" style="margin-top:12px"><summary style="font-weight:800;cursor:pointer">Code oublié ?</summary><p class="muted" style="font-size:.85rem">Tapez <b>REINITIALISER</b> pour effacer le code, puis créez-en un nouveau.</p><input id="pp-r" placeholder="REINITIALISER" autocapitalize="characters"><button class="btn btn-ghost btn-block" style="margin-top:8px" id="pp-rst">Effacer le code</button></details>` : ''}`;
    el.querySelector('#pp-new').onclick = () => DB.profPin ? profAsk(() => pinPad('new', panel), 'Code actuel') : pinPad('new', panel);
    const d = el.querySelector('#pp-del'); if (d) d.onclick = () => profAsk(() => { delete DB.profPin; save(); toast('Code supprimé'); panel(); }, 'Code actuel');
    const r = el.querySelector('#pp-rst'); if (r) r.onclick = () => { if (el.querySelector('#pp-r').value.trim().toUpperCase() !== 'REINITIALISER') return toast('Tapez REINITIALISER'); delete DB.profPin; save(); toast('Code effacé'); panel(); };
  });
  panel();
};
