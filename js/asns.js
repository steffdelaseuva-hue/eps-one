/* =========================================================
   EPS ONE — Attestation « savoir-nager » en sécurité (ASNS) : PDF A4 paysage
   Modèle : Ministère de l'Éducation nationale · arrêté du 28 février 2022.
   Champs : académie, établissement, chef d'établissement, lieu, date (calendrier), signatures dessinées une fois.
   Données : DB.asnsCfg = { acad, etab, chef, fonction, lieu, sigV, sigP, dob: { classe: { élève: 'AAAA-MM-JJ' } } }
   ========================================================= */
const asnsCfg = () => { const c = DB.asnsCfg = DB.asnsCfg || {}; c.dob = c.dob || {}; return c; };
const asnsB64 = s => Uint8Array.from(atob(s), ch => ch.charCodeAt(0));
const asnsFr = iso => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || ''); return m ? `${m[3]}/${m[2]}/${m[1]}` : ''; };
const asnsSession = iso => { const m = /^(\d{4})-(\d\d)/.exec(iso || ''), y = m ? +m[1] : new Date().getFullYear(), mo = m ? +m[2] : new Date().getMonth() + 1; return mo >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };
/* « DUPONT Marie » → nom DUPONT, prénom Marie (les mots en majuscules du début forment le nom) */
function asnsSplit(full) { const p = String(full || '').trim().split(/\s+/); let k = 0; while (k < p.length - 1 && p[k] === p[k].toUpperCase() && /[A-ZÀ-Ý]/.test(p[k])) k++; if (!k) k = 1; return { nom: p.slice(0, k).join(' '), prenom: p.slice(k).join(' ') }; }
function asnsPdf(list, o) {
  const P = PdfMini(), L = 'ASNS_IMG' in window || typeof ASNS_IMG !== 'undefined' ? ASNS_IMG : null, GR = '#6B7280', RED = '#E8382B', top = o.date || '';
  const img = (k, x, y, w, h) => L && L[k] && P.image(asnsB64(L[k].b), L[k].w, L[k].h, x, y, w, h);
  list.forEach(s => {
    P.page(297, 210);
    img('min', 10.5, 11, 50, 32.5); img('badge', 247, 7, 39, 38.7); img('top', 62, 8, 179, 9); img('bot', 9, 196, 283, 12);
    P.text(`SESSION ${asnsSession(o.date)}`, 148.5, 36, 12, { bold: true, align: 'center' });
    P.text('ATTESTATION «SAVOIR-NAGER» EN SÉCURITÉ', 148.5, 66, 24, { bold: true, align: 'center', color: RED });
    P.text('définie par l\'arrêté du 28 février 2022 relatif à l\'attestation «savoir-nager» en sécurité', 148.5, 72, 9.5, { align: 'center', color: GR });
    P.text('L\'attestation du «savoir-nager» en sécurité est délivrée par', 148.5, 85, 14, { align: 'center' });
    P.text(P.fit(`${o.chef || ''}${o.fonction ? ', ' + o.fonction : ''}`, 12.5, true, 270), 148.5, 91, 12.5, { bold: true, align: 'center' });
    P.text('Nom :', 55, 107, 11, { color: GR }); P.text(P.fit(s.nom || '', 13, true, 90), 67, 107, 13, { bold: true });
    P.text('Prénom :', 208, 107, 11, { color: GR }); P.text(P.fit(s.prenom || '', 13, true, 60), 227, 107, 13, { bold: true });
    P.text('Date de naissance :', 130, 115, 11, { color: GR, align: 'right' }); P.text(asnsFr(s.dob), 132, 115, 13, { bold: true });
    P.text('Académie :', 69, 132, 11, { color: GR }); P.text(P.fit(o.acad || '', 13, true, 70), 92, 132, 13, { bold: true });
    P.text('Établissement :', 155, 132, 11, { color: GR }); P.text(P.fit((o.etab || '').toUpperCase(), 13, true, 100), 184, 132, 13, { bold: true });
    P.text('Fait à', 26, 150, 11, { color: GR }); P.text(P.fit(o.lieu || '', 11, true, 70), 38, 150, 11, { bold: true });
    const x0 = 38 + P.width(P.fit(o.lieu || '', 11, true, 70), 11, true) + 1.5; P.text(', le', x0, 150, 11, { color: GR }); P.text(asnsFr(o.date), x0 + 8, 150, 11, { bold: true });
    P.text('Visa du responsable de l\'établissement', 36, 162, 11, { color: GR }); P.text('Professeur (PO)', 191, 162, 11, { color: GR });
    if (o.stamp) { const k = Math.min(70 / o.stamp.w, 32 / o.stamp.h); P.image(asnsB64(o.stamp.b), o.stamp.w, o.stamp.h, 38, 164, o.stamp.w * k, o.stamp.h * k); }
    else if (o.sigV) P.image(asnsB64(o.sigV.b), o.sigV.w, o.sigV.h, 40, 165, 55, Math.min(28, 55 * o.sigV.h / o.sigV.w));
    if (o.sigP) P.image(asnsB64(o.sigP.b), o.sigP.w, o.sigP.h, 190, 165, 55, Math.min(28, 55 * o.sigP.h / o.sigP.w));
  });
  return P.blob();
}
/* Zone de signature à dessiner (doigt / stylet) → JPEG en base64 */
function asnsPad(host, key, label) {
  const c = asnsCfg(), cv = document.createElement('canvas'); cv.width = 440; cv.height = 150; cv.style.cssText = 'width:100%;max-width:440px;height:auto;aspect-ratio:440/150;border:1.5px dashed var(--line);border-radius:12px;background:#fff;touch-action:none';
  const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 440, 150); x.lineWidth = 2.4; x.lineCap = 'round'; x.strokeStyle = '#111';
  const draw = d => { const i = new Image(); i.onload = () => x.drawImage(i, 0, 0); i.src = 'data:image/jpeg;base64,' + d.b; }; if (c[key]) draw(c[key]);
  let on = false; const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 440 / r.width, (e.clientY - r.top) * 150 / r.height]; };
  cv.onpointerdown = e => { on = true; cv.setPointerCapture(e.pointerId); const [a, b] = pt(e); x.beginPath(); x.moveTo(a, b); x.lineTo(a + .1, b + .1); x.stroke(); };
  cv.onpointermove = e => { if (!on) return; const [a, b] = pt(e); x.lineTo(a, b); x.stroke(); };
  cv.onpointerup = cv.onpointercancel = () => { if (!on) return; on = false; c[key] = { w: 440, h: 150, b: cv.toDataURL('image/jpeg', .9).split(',')[1] }; save(); };
  host.innerHTML = `<label>${label}</label>`; host.appendChild(cv);
  const r = document.createElement('div'); r.className = 'row'; r.style.marginTop = '4px'; r.innerHTML = '<button class="btn btn-ghost" style="padding:6px 10px">🧽 Effacer</button><span class="muted" style="font-size:.78rem;flex:2">Dessine avec le doigt : la signature est conservée pour les prochaines attestations.</span>';
  r.querySelector('button').onclick = () => { x.fillStyle = '#fff'; x.fillRect(0, 0, 440, 150); delete c[key]; save(); }; host.appendChild(r);
}
/* Fenêtre « Attestation » : names = élèves validés de la classe ; un seul → fiche modifiable, sinon tout le lot */
function asnsDialog(cls, names, only) {
  const c = asnsCfg(), o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:330;background:var(--bg,#fff);overflow:auto;padding:14px 14px 40px'; document.body.appendChild(o);
  const today = new Date(), iso = c.date || new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10), sp = asnsSplit(only || ''), dob = (c.dob[cls] || {})[only] || '';
  o.innerHTML = `<div style="max-width:700px;margin:0 auto"><div style="display:flex;align-items:center;gap:8px"><h2 style="flex:1;margin:0;font-size:1.15rem">📄 Attestation « savoir-nager » en sécurité</h2><button class="btn btn-ghost" data-q>✕ Fermer</button></div>
    <div class="card" style="margin-top:12px"><b>${only ? esc(only) : `${names.length} élève(s) validé(s) · ${esc(cls)}`}</b>
      ${only ? `<div class="row"><div><label>Nom</label><input id="an" value="${esc(sp.nom)}"></div><div><label>Prénom</label><input id="ap" value="${esc(sp.prenom)}"></div></div><label>Date de naissance</label><input type="date" id="ad" value="${esc(dob)}">` : '<div class="muted" style="font-size:.82rem">Les dates de naissance déjà saisies sont reprises ; sinon la case reste vide à compléter à la main.</div>'}</div>
    <div class="card" style="margin-top:10px"><div class="row"><div><label style="margin-top:0">Académie</label><input id="ac" value="${esc(c.acad || '')}" placeholder="Bordeaux, Versailles, Montpellier…"></div><div><label style="margin-top:0">Établissement</label><input id="et" value="${esc(c.etab || '')}" placeholder="CLG … "></div></div>
      <div class="row"><div><label>Délivrée par</label><input id="ch" value="${esc(c.chef || '')}" placeholder="M DUPONT"></div><div><label>Fonction</label><input id="fo" value="${esc(c.fonction || '')}" placeholder="Principal du collège de …"></div></div>
      <div class="row"><div><label>Lieu (Fait à)</label><input id="li" value="${esc(c.lieu || '')}"></div><div><label>Date</label><input type="date" id="dt" value="${iso}"></div></div></div>
    <div class="card" style="margin-top:10px"><b>🖋 Tampon de l'établissement + signature du chef d'établissement</b><div class="muted" style="font-size:.8rem">Photo ou image du tampon signé (fond blanc). Elle est conservée et placée dans la case « Visa » de chaque attestation.</div><div id="st" style="margin-top:8px"></div><input type="file" accept="image/*" id="stf" style="margin-top:6px"></div>
    <div class="card" style="margin-top:10px"><div class="muted" style="font-size:.8rem;margin-bottom:6px">Ou, sans tampon : signature dessinée.</div><div id="pv"></div><div id="pp" style="margin-top:10px"></div></div>
    <button class="btn btn-grad btn-block" style="margin-top:12px;padding:15px" id="go">📄 ${only ? 'Générer le PDF' : 'Générer ' + names.length + ' PDF (un par élève)'}</button></div>`;
  const $ = s => o.querySelector(s); asnsPad($('#pv'), 'sigV', 'Visa du responsable de l\'établissement (signature)'); asnsPad($('#pp'), 'sigP', 'Professeur (signature)');
  $('[data-q]').onclick = () => o.remove();
  const showSt = () => { $('#st').innerHTML = c.stamp ? `<img src="data:image/jpeg;base64,${c.stamp.b}" style="max-width:220px;max-height:140px;border:1px solid var(--line);border-radius:8px;background:#fff"><div><button class="btn btn-ghost" style="padding:6px 10px;margin-top:6px" id="stx">🗑 Retirer le tampon</button></div>` : '<div class="muted" style="font-size:.85rem">Aucun tampon enregistré.</div>'; if ($('#stx')) $('#stx').onclick = () => { delete c.stamp; save(); showSt(); }; };
  showSt();
  $('#stf').onchange = e => { const f = e.target.files[0]; if (!f) return; const u = URL.createObjectURL(f), im = new Image(); im.onload = () => { const k = Math.min(1, 700 / Math.max(im.width, im.height)), w = Math.round(im.width * k), h = Math.round(im.height * k), cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0, w, h); c.stamp = { w, h, b: cv.toDataURL('image/jpeg', .9).split(',')[1] }; URL.revokeObjectURL(u); save(); showSt(); toast('Tampon enregistré ✔'); }; im.src = u; };
  $('#go').onclick = async () => {
    c.acad = $('#ac').value.trim(); c.etab = $('#et').value.trim(); c.chef = $('#ch').value.trim(); c.fonction = $('#fo').value.trim(); c.lieu = $('#li').value.trim(); const date = $('#dt').value; c.date = date;
    let list; if (only) { const d = $('#ad').value; (c.dob[cls] = c.dob[cls] || {})[only] = d; list = [{ nom: $('#an').value.trim(), prenom: $('#ap').value.trim(), dob: d }]; }
    else list = names.map(n => ({ ...asnsSplit(n), dob: (c.dob[cls] || {})[n] || '' }));
    save(); const base = { ...c, date }, safe = t => String(t).replace(/[^\w.-]+/g, '-');
    const files = list.map((x, i) => ({ blob: asnsPdf([x], base), name: `attestation-savoir-nager-${safe(x.nom + '-' + x.prenom)}.pdf` }));
    if (files.length === 1) await epsSharePdf(files[0].blob, files[0].name, 'Attestation savoir-nager'); else await epsSharePdfs(files, 'Attestations savoir-nager'); };
}
window.asnsDialog = asnsDialog;
