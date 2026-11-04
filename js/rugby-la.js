/*! EPS ONE — Copyright (C) 2026 Steff64 — Logiciel libre sous licence GNU GPL v3 avec conditions supplémentaires (voir LICENSE). */
/* =========================================================
   EPS ONE — Outil « Rugby · Ligne d'avantage »
   Observations individuelles : attaque (recule / avance / essai), défense (bloque)
   Points = nombre d'actions · Avec bonus = actions × valeur choisie
   ========================================================= */
DB.rugbyLA = DB.rugbyLA || { obs: [], val: { recule: 1, avance: 3, bloque: 1, essai: 5 } };
if (DB.rugbyLA.val && DB.rugbyLA.val.essai == null) DB.rugbyLA.val.essai = 5;
ICONS.rugbyla = '<ellipse cx="12" cy="12" rx="7.5" ry="4.5" transform="rotate(-35 12 12)"/><path d="M9.5 14.5l5-5M10 11.5l2.5 2.5M12 9.5l2.5 2.5"/><path d="M2 21h20" stroke-dasharray="2 2"/>';

const RLA = {
  recule: { l: 'Recule', g: 'Attaque', col: '#D8433B', ic: '<path d="M30 12 12 30M12 30h13M12 30V17" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
  avance: { l: 'Avance', g: 'Attaque', col: '#2E9E55', ic: '<path d="M12 30 30 12M30 12H17M30 12v13" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
  essai: { l: 'Essai', g: 'Attaque', col: '#C9A227', ic: '<ellipse cx="21" cy="21" rx="11" ry="7" transform="rotate(-35 21 21)" stroke="#fff" stroke-width="4" fill="none"/><path d="M8 36h26" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' },
  bloque: { l: 'Bloque', g: 'Défense', col: '#1E5BD8', ic: '<rect x="9" y="9" width="24" height="24" rx="4" stroke="#fff" stroke-width="5" fill="none"/><path d="M15 21h12" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' },
};
const rlaPts = (c, v) => Object.keys(RLA).reduce((a, k) => a + (c[k] || 0), 0);
const rlaBonus = (c, v) => Object.keys(RLA).reduce((a, k) => a + (c[k] || 0) * (v[k] || 0), 0);
function rlaPie(c) {
  const tot = rlaPts(c); if (!tot) return '<div class="muted" style="text-align:center;padding:20px 0">Le graphique apparaît dès la première action.</div>';
  let a0 = -Math.PI / 2, out = '';
  Object.entries(RLA).forEach(([k, x]) => { const n = c[k] || 0; if (!n) return; const a1 = a0 + n / tot * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0;
    const p = (a, r) => `${(60 + r * Math.cos(a)).toFixed(2)},${(60 + r * Math.sin(a)).toFixed(2)}`;
    out += n === tot ? `<circle cx="60" cy="60" r="44" fill="none" stroke="${x.col}" stroke-width="26"/>`
      : `<path d="M${p(a0, 57)} A57 57 0 ${big} 1 ${p(a1, 57)} L${p(a1, 31)} A31 31 0 ${big} 0 ${p(a0, 31)}Z" fill="${x.col}"/>`;
    const am = (a0 + a1) / 2; out += `<text x="${(60 + 44 * Math.cos(am)).toFixed(1)}" y="${(60 + 44 * Math.sin(am) + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">${Math.round(n / tot * 100)}%</text>`;
    a0 = a1; });
  return `<div style="display:flex;align-items:center;gap:14px;justify-content:center"><svg viewBox="0 0 120 120" style="width:150px;height:150px">${out}</svg>
    <div>${Object.entries(RLA).map(([k, x]) => `<div style="display:flex;align-items:center;gap:6px;margin:4px 0;font-weight:700"><span style="width:12px;height:12px;border-radius:50%;background:${x.col}"></span>${x.l} · ${c[k] || 0}</div>`).join('')}</div></div>`;
}

TOOL_IMPL.rugbyla = function (el) {
  const R = DB.rugbyLA, V = R.val;
  if (!DB.classes.length) { el.innerHTML = noClassMsg; return; }
  const E0 = () => ({ recule: 0, avance: 0, essai: 0, bloque: 0 });
  let cls = DB.classes.some(c => c.name === DB.lastClass) ? DB.lastClass : DB.classes[0].name, obs = '', nObs = Math.min(4, Math.max(1, +R.n || 1));
  let slots = Array.from({ length: 4 }, (_, i) => ({ si: i, C: E0(), hist: [] }));   // jusqu'à 4 joueurs observés en même temps sur la tablette
  const draw = () => {
    const st = studentsOf(cls); slots.forEach(s => { if (s.si >= st.length) s.si = 0; });
    const act = slots.slice(0, nObs);
    el.innerHTML = `<div class="card"><div class="row"><div data-cfg="bare"><label>Classe</label><select id="rc">${DB.classes.map(c => `<option ${c.name === cls ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div><label>👁 Observateur</label><select id="ro"><option value="">—</option>${st.map(n => `<option ${n === obs ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div></div>
        <label>🏉 Nombre de joueurs observés sur cette tablette</label><div class="tog" id="rn">${[1, 2, 3, 4].map(n => `<button data-rn="${n}" class="${nObs === n ? 'on' : ''}">${n} joueur${n > 1 ? 's' : ''}</button>`).join('')}</div>
        <label style="margin-top:8px">Valeur bonus de chaque action</label>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${Object.entries(RLA).map(([k, x]) => `<div style="text-align:center"><div style="font-size:.7rem;font-weight:800;color:${x.col}">${x.l}</div><select data-cfg="bare" data-val="${k}" style="padding:5px;width:100%">${[0, 1, 2, 3, 4, 5].map(v => `<option ${v === V[k] ? 'selected' : ''}>${v}</option>`).join('')}</select></div>`).join('')}</div></div>
      ${act.map((s, i) => `<div class="card" style="margin-top:12px;border-top:5px solid ${['#B8912A', '#1E5BD8', '#2E9E55', '#D8433B'][i]}">
        <label style="margin-top:0">🏉 Joueur ${nObs > 1 ? i + 1 : ''}</label><select data-rj="${i}" style="font-weight:800">${st.map((n, k) => `<option value="${k}" ${k === s.si ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
        <div style="display:grid;grid-template-columns:repeat(${nObs > 2 ? 2 : 4},1fr);gap:6px;margin-top:8px">
        ${Object.entries(RLA).map(([k, x]) => `<button data-add="${k}" data-i="${i}" style="border:none;border-radius:14px;background:${x.col};color:#fff;padding:8px 2px;cursor:pointer">
            <svg viewBox="0 0 42 42" style="width:${nObs > 2 ? 30 : 34}px;height:${nObs > 2 ? 30 : 34}px">${x.ic}</svg><div style="font-weight:900;font-size:.85rem">${x.l}</div><div style="font-size:1.6rem;font-weight:900;line-height:1.1">${s.C[k]}</div></button>`).join('')}</div>
        <div class="result" style="margin-top:8px"><div class="card"><b>${rlaPts(s.C)}</b><small>actions</small></div><div class="card"><b>${rlaBonus(s.C, V)}</b><small>avec bonus</small></div></div>
        ${nObs <= 2 ? `<div style="margin-top:8px">${rlaPie(s.C)}</div>` : ''}
        <div class="row" style="margin-top:8px"><button class="btn btn-ghost" data-ru="${i}" ${s.hist.length ? '' : 'disabled'}>↶ Annuler</button><button class="btn btn-ghost" data-rz="${i}">Réinitialiser</button><button class="btn btn-grad" data-rs="${i}">💾 Enregistrer</button></div></div>`).join('')}
      ${nObs > 1 ? '<button class="btn btn-grad btn-block" style="margin-top:12px" id="rsa">💾 Enregistrer tous les joueurs</button>' : ''}
      <div class="section-title"><h2>Relevés · ${esc(cls)}</h2>${R.obs.some(o => o.classe === cls) ? '<button class="link" id="rx">Exporter CSV</button>' : ''}</div>
      <div class="card sheet-table">${(() => { const L = R.obs.filter(o => o.classe === cls).slice().reverse(); return L.length ? `<table><tr><th>Joueur</th><th>Date</th><th>Recule</th><th>Avance</th><th>Essai</th><th>Bloque</th><th>Points</th><th>Bonus</th><th>Observateur</th><th></th></tr>
        ${L.map(o => `<tr><td><b>${esc(o.eleve)}</b></td><td>${new Date(o.date).toLocaleDateString('fr-FR')}</td><td>${o.c.recule}</td><td>${o.c.avance}</td><td>${o.c.essai || 0}</td><td>${o.c.bloque}</td><td><b>${rlaPts(o.c)}</b></td><td><b>${rlaBonus(o.c, o.v)}</b></td><td>${esc(o.obs || '')}</td><td><button class="btn btn-ghost" data-cfg="bare" style="padding:4px 8px" data-x="${o.id}">✕</button></td></tr>`).join('')}</table>` : '<div class="empty">Aucun relevé pour cette classe.</div>'; })()}</div>`;
    const $ = s => el.querySelector(s);
    $('#rc').onchange = e => { cls = e.target.value; DB.lastClass = cls; slots.forEach((s, i) => s.si = i); save(); draw(); };
    $('#ro').onchange = e => { obs = e.target.value; };
    el.querySelectorAll('[data-rn]').forEach(b => b.onclick = () => { nObs = +b.dataset.rn; R.n = nObs; save(); draw(); });
    el.querySelectorAll('[data-rj]').forEach(s => s.onchange = () => { slots[+s.dataset.rj].si = +s.value; draw(); });
    el.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { const s = slots[+b.dataset.i], k = b.dataset.add; s.C[k]++; s.hist.push(k); beep(1100, .05, .2); draw(); });
    el.querySelectorAll('[data-val]').forEach(s => s.onchange = () => { V[s.dataset.val] = +s.value; save(); draw(); });
    el.querySelectorAll('[data-ru]').forEach(b => b.onclick = () => { const s = slots[+b.dataset.ru], k = s.hist.pop(); if (k) s.C[k] = Math.max(0, s.C[k] - 1); draw(); });
    el.querySelectorAll('[data-rz]').forEach(b => b.onclick = () => { const s = slots[+b.dataset.rz]; if (rlaPts(s.C) && !confirm('Remettre les compteurs à zéro ?')) return; s.C = E0(); s.hist = []; draw(); });
    const saveSlot = (s, quiet) => { const n = st[s.si]; if (!n) { quiet || toast('Classe vide'); return false; } if (!rlaPts(s.C)) { quiet || toast('Aucune action relevée'); return false; }
      R.obs.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), date: Date.now(), classe: cls, eleve: n, obs, c: { ...s.C }, v: { ...V } });
      saveResult({ tool: 'rugbyla', label: 'Ligne d\'avantage', classe: cls, eleve: n, valeur: `${rlaBonus(s.C, V)} pts (bonus)`, detail: `recule ${s.C.recule} · avance ${s.C.avance} · essai ${s.C.essai || 0} · bloque ${s.C.bloque}` });
      s.C = E0(); s.hist = []; if (s.si + nObs < st.length) s.si += nObs; return n; };
    el.querySelectorAll('[data-rs]').forEach(b => b.onclick = () => { const n = saveSlot(slots[+b.dataset.rs]); if (n) { toast(`${n} : enregistré ✔`); draw(); } });
    if ($('#rsa')) $('#rsa').onclick = () => { const done = act.map(s => saveSlot(s, true)).filter(Boolean); if (!done.length) return toast('Aucune action relevée'); toast(`${done.length} joueur${done.length > 1 ? 's' : ''} enregistré${done.length > 1 ? 's' : ''} ✔`); draw(); };
    el.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { if (!confirm('Supprimer ce relevé ?')) return; R.obs.splice(R.obs.findIndex(o => o.id === b.dataset.x), 1); save(); draw(); });
    if ($('#rx')) $('#rx').onclick = () => download(`ligne-avantage-${cls}.csv`, csv([['Joueur', 'Date', 'Observateur', 'Recule', 'Avance', 'Essai', 'Bloque', 'Points', 'Avec bonus', 'Valeurs (R/A/E/B)'],
      ...R.obs.filter(o => o.classe === cls).map(o => [o.eleve, new Date(o.date).toLocaleDateString('fr-FR'), o.obs || '', o.c.recule, o.c.avance, o.c.essai || 0, o.c.bloque, rlaPts(o.c), rlaBonus(o.c, o.v), `${o.v.recule}/${o.v.avance}/${o.v.essai || 0}/${o.v.bloque}`])]));
  };
  draw();
};
