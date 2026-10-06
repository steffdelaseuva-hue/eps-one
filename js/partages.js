/* =========================================================
   EPS ONE — Séances partagées entre tablettes
   Une séance lancée sur une tablette (Duathlon, Combiné, Crosstraining,
   Course d'orientation, Demi-fond, Sauvetage, Escalade, Natation) publie un MODÈLE (groupes + épreuve, sans
   résultats) dans DB.partages (synchronisé). Les autres tablettes du
   même compte peuvent la « Rejoindre » puis suivre un groupe.
   La séance en cours (current / only) reste propre à chaque tablette.
   ========================================================= */
const partDay = t => new Date(t).toDateString();
// Partages du jour pour un outil (les plus anciens sont nettoyés)
function partToday(tool) {
  const L = Array.isArray(DB.partages) ? DB.partages : null; if (!L) return [];
  const today = partDay(Date.now()), old = L.filter(x => !x || partDay(x.date) !== today);
  if (old.length) { DB.partages = L.filter(x => !old.includes(x)); save(); }
  return DB.partages.filter(x => x.tool === tool).sort((a, b) => b.date - a.date);
}
const partGet = id => (Array.isArray(DB.partages) ? DB.partages : []).find(x => x && x.id === id);
// Publie (create = true) ou met à jour le modèle d'une séance ; id = id de la séance en cours
function partPublish(tool, id, info, create) {
  if (!id) return;
  const o = partGet(id);
  if (!o) { if (!create) return; if (!Array.isArray(DB.partages)) DB.partages = [];
    DB.partages.push({ id, tool, date: Date.now(), ...JSON.parse(JSON.stringify(info)) }); save(); return; }
  const n = JSON.parse(JSON.stringify(info));
  if (JSON.stringify(Object.keys(n).map(k => o[k])) === JSON.stringify(Object.values(n))) return;   // rien de changé
  Object.assign(o, n); save();
}
function partRemove(id) { if (!Array.isArray(DB.partages)) return; const n = DB.partages.filter(x => x && x.id !== id); if (n.length !== DB.partages.length) { DB.partages = n; save(); } }
// Abandon sur la tablette qui a lancé la séance : retirer aussi le partage ?
function partAskRemove(cur) {
  // abandon volontaire : on oublie aussi la copie de secours de cette séance
  try { PART_BAK_TOOLS.forEach(k => { const b = partBakGet(k); if (b && b.cur && cur && b.cur.id === cur.id) localStorage.removeItem(partBakKey(k)); }); } catch (e) {}
  if (!cur || cur.joined || !partGet(cur.id)) return;
  if (confirm('Retirer aussi cette séance des autres tablettes ?\n(Les tablettes qui l\'ont déjà rejointe peuvent continuer.)')) partRemove(cur.id);
}

/* Carte « Séances en cours sur vos autres tablettes » en haut de l'écran de préparation */
function partMount(box, tool, onJoin) {
  let host = box.querySelector('.part-card');
  if (!host) { host = document.createElement('div'); host.className = 'part-card'; box.prepend(host); }
  const draw = () => {
    const L = partToday(tool), REC = PART_BAK_TOOLS.includes(tool) ? partRecoverHTML(tool) : '';
    host.innerHTML = REC + (L.length ? `<div class="card" style="margin-bottom:12px;border:2px solid var(--gold,#E8B931)"><h3 style="margin-top:0">📥 Séances en cours sur vos autres tablettes</h3>
        ${L.map(p => `<div style="padding:10px 0;border-top:1px solid var(--line)"><div style="display:flex;gap:8px;align-items:flex-start"><div style="flex:1"><b style="font-size:1.08rem">${esc(p.nom || 'Séance')}</b>
            <div class="muted">${[p.classe ? esc(p.classe) : '', new Date(p.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), `${p.ng} ${p.indiv ? 'élève' : 'groupe'}${p.ng > 1 ? 's' : ''}`, p.ep ? esc(p.ep) : ''].filter(Boolean).join(' · ')}</div></div>
            <button class="btn btn-ghost" data-cfg="bare" data-px="${esc(p.id)}" title="Retirer cette séance des tablettes" style="padding:8px 12px">✕</button></div>
          <button class="btn btn-grad btn-block" data-pj="${esc(p.id)}" style="margin-top:8px;padding:16px;font-size:1.15rem">▶ Rejoindre</button></div>`).join('')}
        <p class="muted" style="margin:8px 0 0;font-size:.8rem">Une séance lancée ici apparaît sur vos autres tablettes (même compte, synchronisées) : elles peuvent la rejoindre et suivre un groupe.</p></div>`
      : `<p class="muted" style="margin:0 0 10px;font-size:.8rem">📥 Une séance lancée ici apparaît sur vos autres tablettes (même compte, synchronisées) : elles peuvent la rejoindre et suivre un groupe.</p>`);
    if (REC) partRecoverBind(host, tool);
    host.querySelectorAll('[data-pj]').forEach(b => b.onclick = () => { const p = partGet(b.dataset.pj); if (!p) { toast('Cette séance n\'est plus partagée'); return draw(); } onJoin(JSON.parse(JSON.stringify(p))); });
    host.querySelectorAll('[data-px]').forEach(b => b.onclick = () => { const p = partGet(b.dataset.px);
      if (p && confirm(`Retirer « ${p.nom || 'Séance'} » des autres tablettes ?\n(Les tablettes qui l'ont déjà rejointe peuvent continuer.)`)) { partRemove(p.id); toast('Séance retirée'); } draw(); });
  };
  draw();
  // mise à jour quand la synchronisation apporte une nouvelle séance
  window.removeEventListener('eps-remote', window._partRf);
  window._partRf = () => { if (host.isConnected) draw(); else window.removeEventListener('eps-remote', window._partRf); };
  window.addEventListener('eps-remote', window._partRf);
}

/* Choix du groupe suivi par cette tablette, juste après « Rejoindre » */
function partPickGroup(box, groups, onPick, indiv) {
  box.innerHTML = `<div class="card" style="text-align:center"><div style="font-weight:900;font-size:1.3rem">📱 ${indiv ? 'Quel élève' : 'Quel groupe'} suit cette tablette ?</div>
      <p class="muted" style="margin:6px 0 0">Les élèves ne verront que ${indiv ? 'leur fiche' : 'leur groupe'}. Le « 🔒 Mode enseignant » permet de revenir à tous les groupes.</p></div>
    ${groups.map((g, i) => `<button class="btn btn-grad btn-block" data-pg="${i}" style="margin-top:10px;padding:16px;font-size:1.2rem;text-align:left;display:block">${esc(g.name)}${!indiv && g.members && g.members.length ? `<div style="font-size:.85rem;font-weight:600;opacity:.9">${g.members.map(esc).join(', ')}</div>` : ''}</button>`).join('')}
    <button class="btn btn-ghost btn-block" data-cfg="bare" data-pg="" style="margin-top:14px;padding:16px;font-size:1.1rem">👩‍🏫 Tous les ${indiv ? 'élèves' : 'groupes'} (tablette enseignant)</button>`;
  box.querySelectorAll('[data-pg]').forEach(b => b.onclick = () => onPick(b.dataset.pg === '' ? null : +b.dataset.pg));
}

/* =========================================================
   Envois de cette tablette (fin de séance)
   Chaque résultat enregistré sur la tablette est noté dans DB.envois
   (propre à l'appareil, jamais synchronisé) avec une copie de secours.
   La carte montre, groupe par groupe : ✅ envoyé · ⏳ en attente · ⚠️ absent
   (copie de secours → « Renvoyer »), et l'état de la synchronisation.
   ========================================================= */
const partSync = () => (window.cloudInfo && cloudInfo()) || (window.syncInfo && syncInfo()) || null;
function partOutboxAdd(tool, rec, label) {
  const L = Array.isArray(DB.envois) ? DB.envois : [];
  L.push({ tool, id: rec.id, date: Date.now(), label, rec: JSON.parse(JSON.stringify(rec)) });
  DB.envois = L.slice(-40); save();
}
function partOutboxCard(host, tool, list, restore) {
  let iv = null;
  const draw = () => {
    if (!host.isConnected) { clearInterval(iv); return; }
    const E = (Array.isArray(DB.envois) ? DB.envois : []).filter(e => e.tool === tool && Date.now() - e.date < 7 * 864e5).reverse();
    if (!E.length) { host.innerHTML = ''; return; }
    const S = partSync(), have = new Set(list().map(r => r.id)), sent = S && !S.pending && S.status !== 'error' && S.status !== 'sync';
    const net = !S ? '📱 Pas de synchronisation : les résultats restent sur cette tablette'
      : S.status === 'error' ? `⚠️ ${esc(S.name)} : ${esc(S.err || 'erreur d\'envoi')}`
      : S.status === 'sync' ? '⏳ Envoi en cours…' : S.pending ? `⏳ ${S.pending} rubrique(s) à envoyer (réseau ?)` : `✅ Tout est envoyé sur ${esc(S.name)}`;
    host.innerHTML = `<div class="card" style="margin-bottom:12px;border:2px solid ${sent ? '#1B9E5A' : 'var(--gold,#E8B931)'}"><h3 style="margin-top:0">📤 Envois de cette tablette</h3>
      <div style="font-weight:800;margin:4px 0 8px;color:${sent ? '#1B9E5A' : S && S.status === 'error' ? 'var(--danger)' : 'inherit'}">${net}</div>
      ${E.slice(0, 8).map((e, i) => { const ok = have.has(e.id);
        return `<div style="display:flex;gap:8px;align-items:center;padding:8px 0;border-top:1px solid var(--line)"><div style="flex:1;min-width:0"><b>${esc(e.label || 'Résultats')}</b>
          <div class="muted" style="font-size:.8rem">${new Date(e.date).toLocaleString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</div></div>
          <span style="font-weight:800;white-space:nowrap">${!ok ? '⚠️ absent' : !S ? '📱 enregistré' : sent ? '✅ envoyé' : '⏳ en attente'}</span>
          ${!ok ? `<button class="btn btn-grad" style="flex:0 0 auto;padding:8px 12px" data-ob="${i}">🔁 Renvoyer</button>` : ''}</div>`; }).join('')}
      ${S && (S.pending || S.status === 'error') ? '<button class="btn btn-grad btn-block" style="margin-top:8px" id="ob-send">📤 Envoyer maintenant</button>' : ''}</div>`;
    host.querySelectorAll('[data-ob]').forEach(b => b.onclick = () => { const e = E[+b.dataset.ob]; if (!list().some(r => r.id === e.id)) restore(JSON.parse(JSON.stringify(e.rec))); save(); toast('Résultats remis en place ✔ · envoi…'); const s = partSync(); if (s) s.send(); draw(); });
    const sb = host.querySelector('#ob-send'); if (sb) sb.onclick = async () => { const s = partSync(); if (!s) return; sb.disabled = true; sb.textContent = '⏳ Envoi…'; try { await s.send(); } catch (e) {} draw(); };
  };
  draw(); iv = setInterval(draw, 2500);
}

/* =========================================================
   Copie de secours de la séance en cours (propre à la tablette)
   Si une séance disparaît avant d'avoir été enregistrée (fermeture,
   rechargement, autre manipulation), la carte « ♻️ Séance interrompue »
   permet de la reprendre et d'enregistrer les résultats.
   ========================================================= */
const PART_BAK_TOOLS = ['wod', 'duathlon', 'combine', 'co', 'demifond', 'sauvetage'];
const partBakKey = k => 'epsone_bak_' + k;
const partBakGet = k => { try { return JSON.parse(localStorage.getItem(partBakKey(k)) || 'null'); } catch (e) { return null; } };
let _partBakT = null;
function partBackupNow() {
  _partBakT = null;
  PART_BAK_TOOLS.forEach(k => { const D = DB[k]; if (!D || typeof D !== 'object') return;
    const c = D.current, b = partBakGet(k);
    try {
      if (c && c.id && !c.manual) localStorage.setItem(partBakKey(k), JSON.stringify({ date: Date.now(), cur: c }));
      else if (b && b.cur) { // séance terminée : enregistrée ailleurs dans l'outil ? on oublie la copie
        const rest = JSON.stringify({ ...D, current: null });
        if (rest.includes(b.cur.id) || Date.now() - b.date > 3 * 864e5) localStorage.removeItem(partBakKey(k));
      }
    } catch (e) {}
  });
}
(() => { const _ps = window.save; window.save = function () { _ps.apply(this, arguments); if (!_partBakT) _partBakT = setTimeout(partBackupNow, 800); }; })();
// Carte de reprise, affichée dans l'écran de préparation (via partMount)
function partRecoverHTML(k) {
  const D = DB[k], b = partBakGet(k); if (!D || D.current || !b || !b.cur) return '';
  if (JSON.stringify({ ...D, current: null }).includes(b.cur.id)) { try { localStorage.removeItem(partBakKey(k)); } catch (e) {} return ''; }
  const c = b.cur, nom = (c.snap && c.snap.nom) || (c.cfg && c.cfg.nom) || c.nom || 'Séance', gs = Array.isArray(c.groups) ? c.groups : [];
  const fin = gs.filter(g => g.arr || g.capped || g.fin || g.done).length;
  return `<div class="card" style="margin-bottom:12px;border:2px solid #1B9E5A"><h3 style="margin-top:0">♻️ Séance interrompue sur cette tablette</h3>
    <div><b>${esc(nom)}</b> <span class="muted">· ${c.classe ? esc(c.classe) + ' · ' : ''}${new Date(c.date || b.date).toLocaleString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}${gs.length ? ` · ${gs.length} groupe${gs.length > 1 ? 's' : ''}${fin ? `, ${fin} terminé${fin > 1 ? 's' : ''}` : ''}` : ''}</span></div>
    <p class="muted" style="margin:6px 0 8px;font-size:.82rem">Elle n'a pas été enregistrée : reprenez-la pour terminer et envoyer les résultats.</p>
    <div class="row"><button class="btn btn-grad" data-rec="${k}">▶ Reprendre la séance</button><button class="btn btn-ghost" style="flex:0 0 auto" data-recx="${k}">✕ Oublier</button></div></div>`;
}
function partRecoverBind(host, k) {
  host.querySelectorAll('[data-rec]').forEach(b => b.onclick = () => { const bk = partBakGet(k); if (!bk || !bk.cur) return; DB[k].current = bk.cur; saveNow && saveNow(); toast('Séance reprise ✔');
    window.__navPass = true; openTool(currentTool); });
  host.querySelectorAll('[data-recx]').forEach(b => b.onclick = () => { if (!confirm('Oublier cette séance interrompue ? Ses résultats non enregistrés seront perdus.')) return; try { localStorage.removeItem(partBakKey(k)); } catch (e) {} b.closest('.card').remove(); });
}
