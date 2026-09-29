/* =========================================================
   EPS ONE — Séances partagées entre tablettes
   Une séance lancée sur une tablette (Duathlon, Combiné, Crosstraining,
   Course d'orientation) publie un MODÈLE (groupes + épreuve, sans
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
  if (!cur || cur.joined || !partGet(cur.id)) return;
  if (confirm('Retirer aussi cette séance des autres tablettes ?\n(Les tablettes qui l\'ont déjà rejointe peuvent continuer.)')) partRemove(cur.id);
}

/* Carte « Séances en cours sur vos autres tablettes » en haut de l'écran de préparation */
function partMount(box, tool, onJoin) {
  let host = box.querySelector('.part-card');
  if (!host) { host = document.createElement('div'); host.className = 'part-card'; box.prepend(host); }
  const draw = () => {
    const L = partToday(tool);
    host.innerHTML = L.length ? `<div class="card" style="margin-bottom:12px;border:2px solid var(--gold,#E8B931)"><h3 style="margin-top:0">📥 Séances en cours sur vos autres tablettes</h3>
        ${L.map(p => `<div style="padding:10px 0;border-top:1px solid var(--line)"><div style="display:flex;gap:8px;align-items:flex-start"><div style="flex:1"><b style="font-size:1.08rem">${esc(p.nom || 'Séance')}</b>
            <div class="muted">${[p.classe ? esc(p.classe) : '', new Date(p.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), `${p.ng} ${p.indiv ? 'élève' : 'groupe'}${p.ng > 1 ? 's' : ''}`, p.ep ? esc(p.ep) : ''].filter(Boolean).join(' · ')}</div></div>
            <button class="btn btn-ghost" data-px="${esc(p.id)}" title="Retirer cette séance des tablettes" style="padding:8px 12px">✕</button></div>
          <button class="btn btn-grad btn-block" data-pj="${esc(p.id)}" style="margin-top:8px;padding:16px;font-size:1.15rem">▶ Rejoindre</button></div>`).join('')}
        <p class="muted" style="margin:8px 0 0;font-size:.8rem">Une séance lancée ici apparaît sur vos autres tablettes (même compte, synchronisées) : elles peuvent la rejoindre et suivre un groupe.</p></div>`
      : `<p class="muted" style="margin:0 0 10px;font-size:.8rem">📥 Une séance lancée ici apparaît sur vos autres tablettes (même compte, synchronisées) : elles peuvent la rejoindre et suivre un groupe.</p>`;
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
    <button class="btn btn-ghost btn-block" data-pg="" style="margin-top:14px;padding:16px;font-size:1.1rem">👩‍🏫 Tous les ${indiv ? 'élèves' : 'groupes'} (tablette enseignant)</button>`;
  box.querySelectorAll('[data-pg]').forEach(b => b.onclick = () => onPick(b.dataset.pg === '' ? null : +b.dataset.pg));
}
