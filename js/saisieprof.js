/* =========================================================
   EPS ONE — « Saisie des résultats prof (sans lancer l'épreuve) »
   Tableau générique : une ligne par élève (ou groupe), quelques champs
   (temps m:ss, nombre, case à cocher). Utilisé par Combiné, Duathlon,
   Natation, HYROX / Crosstraining.
   ========================================================= */
const SP_BTN = '✍️ Saisie des résultats prof (sans lancer l\'épreuve)';
// « 1:30 », « 1'30 », « 90 », « 1:30,5 » → secondes
function spTime(s) {
  s = String(s || '').trim().replace(/['’]/g, ':').replace(',', '.'); if (!s) return null;
  if (s.includes(':')) { const p = s.split(':').map(Number); if (p.some(isNaN)) return NaN; return p.reduce((a, x) => a * 60 + x, 0); }
  const n = +s; return isNaN(n) ? NaN : n;
}
const spNum = s => { s = String(s || '').trim().replace(',', '.'); if (!s) return null; const n = +s; return isNaN(n) || n < 0 ? NaN : n; };
const spFmtT = t => { if (t == null || isNaN(t)) return ''; const m = Math.floor(t / 60), s = t - m * 60; return `${m}:${(Math.round(s * 10) / 10).toFixed(s % 1 ? 1 : 0).padStart(s % 1 ? 4 : 2, '0').replace('.', ',')}`; };
/* o = { title, help, rows:[{ label, sub }], fields:[{ k, l, type:'time'|'num'|'check', ph }], values:[{…}], onSave(values), onCancel } */
function spTable(box, o) {
  const V = o.values || o.rows.map(() => ({}));
  const cell = (f, r, i) => f.type === 'check'
    ? `<td style="text-align:center"><input type="checkbox" data-sp="${i}|${f.k}" ${V[i][f.k] ? 'checked' : ''} style="width:22px;height:22px"></td>`
    : `<td><input data-sp="${i}|${f.k}" inputmode="decimal" value="${V[i][f.k] == null ? '' : esc(f.type === 'time' ? spFmtT(V[i][f.k]) : String(V[i][f.k]).replace('.', ','))}" placeholder="${esc(f.ph || (f.type === 'time' ? 'm:ss' : ''))}" style="min-width:70px;padding:8px;text-align:center"></td>`;
  box.innerHTML = `<div class="card"><h3 style="margin-top:0">✍️ ${esc(o.title || 'Saisie des résultats')}</h3>
      <p class="muted" style="margin:0;font-size:.85rem">${o.help || 'Remplissez seulement ce que vous avez relevé : les lignes vides sont ignorées. Temps au format 2:35 (ou 2:35,4).'}</p></div>
    <div class="card sheet-table" style="margin-top:10px;overflow:auto"><table><tr><th>${esc(o.who || 'Élève')}</th>${o.fields.map(f => `<th>${esc(f.l)}</th>`).join('')}</tr>
      ${o.rows.map((r, i) => `<tr><td><b>${esc(r.label)}</b>${r.sub ? `<div class="muted" style="font-size:.72rem">${esc(r.sub)}</div>` : ''}</td>${o.fields.map(f => cell(f, r, i)).join('')}</tr>`).join('')}</table></div>
    <button class="btn btn-grad btn-block" style="margin-top:12px;padding:15px" id="sp-ok">💾 Enregistrer les résultats</button>
    <button class="btn btn-ghost btn-block" style="margin-top:8px" id="sp-x">${esc(o.cancelLbl || 'Annuler')}</button>`;
  const read = () => { let bad = null;
    box.querySelectorAll('[data-sp]').forEach(inp => { const [i, k] = inp.dataset.sp.split('|'), f = o.fields.find(x => x.k === k);
      if (f.type === 'check') { V[+i][k] = inp.checked; return; }
      const v = f.type === 'time' ? spTime(inp.value) : spNum(inp.value);
      if (v != null && isNaN(v)) { bad = bad || inp; inp.style.borderColor = 'var(--danger)'; } else { inp.style.borderColor = ''; V[+i][k] = v; } });
    return bad; };
  // les valeurs restent en mémoire si l'écran est redessiné
  box.querySelectorAll('[data-sp]').forEach(inp => inp.onchange = () => read());
  box.querySelector('#sp-ok').onclick = () => { const bad = read(); if (bad) { bad.focus(); return toast('Valeur non reconnue (temps : 2:35)'); }
    const filled = V.filter(v => o.fields.some(f => f.type === 'check' ? v[f.k] : v[f.k] != null));
    if (!filled.length) return toast('Aucun résultat saisi');
    o.onSave(V); };
  box.querySelector('#sp-x').onclick = () => { read(); o.onCancel && o.onCancel(); };
}
