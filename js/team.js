/* =========================================================
   EPS ONE — Mode « Équipe EPS » (tablettes partagées)
   · Un seul compte (cloud ou invitation) pour toute l'équipe.
   · DB.team = { on, profs: [{ id, name, pin, favs }] } : synchronisé.
   · Le prof actif est propre à chaque appareil (localStorage).
   · Quand un prof est actif, DB.classes ne montre que SES classes
     (+ les classes sans prof). Les données complètes restent intactes :
     sauvegarde, export et synchronisation passent par dbGet / dbSet.
   · Les favoris et « Récemment utilisés » sont propres à chaque prof.
   ========================================================= */
ICONS.team = '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.6 13.4A5 5 0 0 1 21 18.5"/>';
(() => {
  const ACT = 'epsone_prof_actif', ALL = 'epsone_team_all';
  const ls = { get: k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }, set: (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} } };
  const teamProfs = () => (DB.team && Array.isArray(DB.team.profs)) ? DB.team.profs : [];
  const teamOn = () => !!(DB.team && DB.team.on && teamProfs().length);
  const activeProf = () => teamOn() ? teamProfs().find(p => p.id === ls.get(ACT)) || null : null;
  const seeAll = () => ls.get(ALL) === '1';
  Object.assign(window, { teamOn, teamProfs, activeProf, teamProfOf: () => (activeProf() || {}).id });

  /* ---------- Vue filtrée de DB.classes / favs / recent ---------- */
  const RAW = {}, KEYS = ['classes', 'favs', 'recent'];
  const view = k => {
    const p = activeProf();
    if (k === 'classes') {
      const a = Array.isArray(RAW.classes) ? RAW.classes : (RAW.classes = []);
      if (!p || seeAll() || (typeof currentTool !== 'undefined' && currentTool === 'classes')) return a;   // Mes classes : toute l'équipe
      const ids = new Set(teamProfs().map(x => x.id));
      return a.filter(c => !c.prof || c.prof === p.id || !ids.has(c.prof));
    }
    if (!p) return Array.isArray(RAW[k]) ? RAW[k] : (RAW[k] = []);
    if (k === 'recent') { const R = DB.recentBy = DB.recentBy || {}; return Array.isArray(R[p.id]) ? R[p.id] : (R[p.id] = []); }   // propre à l'appareil
    if (!Array.isArray(p.favs)) p.favs = [...(RAW.favs || [])];
    return p.favs;
  };
  const setView = (k, v) => { const p = activeProf(); if (k === 'classes' || !p) RAW[k] = v; else if (k === 'recent') (DB.recentBy = DB.recentBy || {})[p.id] = v; else p.favs = v; };
  window.teamInstall = () => {
    KEYS.forEach(k => {
      const d = Object.getOwnPropertyDescriptor(DB, k); if (d && d.get) return;
      RAW[k] = DB[k]; delete DB[k];
      Object.defineProperty(DB, k, { enumerable: true, configurable: true, get: () => view(k), set: v => setView(k, v) });
    });
    Object.defineProperty(DB, 'toJSON', { configurable: true, enumerable: false, writable: true,
      value() { const o = {}; Object.keys(this).forEach(k => { o[k] = KEYS.includes(k) ? RAW[k] : this[k]; }); return o; } });
  };
  // Accès aux données complètes (sauvegarde, synchronisation, Cross…)
  window.dbGet = k => KEYS.includes(k) && Object.getOwnPropertyDescriptor(DB, k)?.get ? RAW[k] : DB[k];
  window.dbSet = (k, v) => { if (KEYS.includes(k) && Object.getOwnPropertyDescriptor(DB, k)?.get) RAW[k] = v; else DB[k] = v; };
  teamInstall();

  const uid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const COLS = ['#1E5BD8', '#C9A227', '#16A34A', '#DC2626', '#7C3AED', '#0891B2', '#EA580C', '#DB2777'];
  const col = p => COLS[Math.max(0, teamProfs().indexOf(p)) % COLS.length];
  const ini = n => (n || '?').replace(/^(M\.|Mme|Mr|Mlle)\s*/i, '').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  /* Avatar : photo (ex. capture de son Memoji), émoji choisi, ou initiales */
  const av = (p, st = '') => p && p.ava && /^data:image\//.test(p.ava) ? `<span class="team-av" style="background:#fff;overflow:hidden;${st}"><img src="${p.ava}" alt="" style="width:100%;height:100%;object-fit:cover"></span>`
    : p && p.emo ? `<span class="team-av" style="background:var(--grad-soft);${st}"><span style="font-size:1.55em;line-height:1">${esc(p.emo)}</span></span>`
    : `<span class="team-av" style="background:${p ? col(p) : '#64748B'};${st}">${p ? esc(ini(p.name)) : '?'}</span>`;
  const EMO = ['🧑‍🏫', '👨‍🏫', '👩‍🏫', '🧔', '👨', '👩', '🧑', '👱‍♂️', '👱‍♀️', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '👨‍🦲', '🧑‍🦲', '🧓', '👴', '👵', '🧕', '👲', '🤠', '😎', '🤓', '🥸', '😄', '🙂', '😁', '🦸', '🦸‍♀️', '🧙', '🏃', '🏃‍♀️', '🤸', '🏋️', '🚴', '🏊', '⛹️', '🤾', '🧗', '🤺', '🐯', '🦁', '🐺', '🦊', '🐻', '🐼', '🦅', '🐬', '⚽', '🏀', '🏐', '🏉', '🎾', '🏸', '🏓', '🥇'];
  // Photo réduite à 128 px (JPEG) : légère à synchroniser
  const readAva = file => new Promise((ok, ko) => { const u = URL.createObjectURL(file), im = new Image();
    im.onload = () => { const S2 = 128, c = document.createElement('canvas'), k = Math.max(S2 / im.width, S2 / im.height), w = im.width * k, h = im.height * k; c.width = c.height = S2;
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, S2, S2); g.drawImage(im, (S2 - w) / 2, (S2 - h) / 2, w, h); URL.revokeObjectURL(u); ok(c.toDataURL('image/jpeg', .8)); };
    im.onerror = () => { URL.revokeObjectURL(u); ko(new Error('Image illisible')); }; im.src = u; });
  function pickAva(p, done) {
    const o = document.createElement('div'); o.id = 'ava-ov'; o.style.cssText = 'position:fixed;inset:0;z-index:460;background:rgba(7,18,42,.7);display:flex;padding:16px;overflow:auto';
    o.innerHTML = `<div class="card" style="margin:auto;max-width:460px;width:100%"><div style="display:flex;align-items:center;gap:10px">${av(p)}<h3 style="flex:1;margin:0">Avatar de ${esc(p.name)}</h3><button class="btn btn-ghost" style="flex:0 0 auto;width:auto" id="av-x">✕</button></div>
      <label class="btn btn-grad btn-block" style="display:block;text-align:center;cursor:pointer;margin-top:12px">📷 Photo ou capture de son Memoji<input id="av-f" type="file" accept="image/*" hidden></label>
      <p class="muted" style="font-size:.78rem;margin:6px 0 0">Memoji : dans Messages, envoyez-vous votre Memoji (autocollant), enregistrez l'image, puis choisissez-la ici.</p>
      <label>Ou un émoji</label><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:6px">${EMO.map(e => `<button class="btn btn-ghost" style="font-size:1.6rem;padding:6px 0" data-em="${e}">${e}</button>`).join('')}</div>
      <button class="btn btn-ghost btn-block" style="margin-top:12px" id="av-i">Revenir aux initiales</button></div>`;
    document.body.appendChild(o);
    const fin = () => { o.remove(); save(); refresh(); done && done(); };
    o.querySelector('#av-x').onclick = () => o.remove();
    o.querySelector('#av-i').onclick = () => { delete p.ava; delete p.emo; fin(); };
    o.querySelectorAll('[data-em]').forEach(b => b.onclick = () => { p.emo = b.dataset.em; delete p.ava; fin(); });
    o.querySelector('#av-f').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { p.ava = await readAva(f); delete p.emo; fin(); } catch (er) { toast(er.message); } };
  }
  window.teamAvatar = av;
  const nbCls = p => (dbGet('classes') || []).filter(c => c.prof === p.id).length;
  const refresh = () => { try { renderHome(); renderTools(); } catch (e) {} try { renderPlus(); } catch (e) {} chip(); };

  document.head.insertAdjacentHTML('beforeend', `<style>
#who-ov{position:fixed;inset:0;z-index:450;background:rgba(7,18,42,.7);display:flex;padding:16px;overflow:auto}
#who-ov .wb{margin:auto;background:var(--card);border-radius:24px;width:100%;max-width:460px;padding:20px 18px 16px;box-shadow:0 20px 50px rgba(0,0,0,.3)}
#who-ov .wg{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-top:14px}
#who-ov .wp{all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 8px;border-radius:18px;border:2px solid var(--line);text-align:center;font-weight:800;color:var(--text)}
#who-ov .wp.on{border-color:var(--blue,#1E5BD8);background:var(--grad-soft)}
.team-av{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:900;font-size:1.15rem;flex:0 0 auto}
#team-chip{all:unset;cursor:pointer;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.18);border-radius:999px;padding:5px 10px 5px 5px;font-weight:800;font-size:.85rem;color:#fff;max-width:42vw}
#team-chip .team-av{width:26px;height:26px;font-size:.72rem;border:1.5px solid #fff}
#team-chip span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style>`);

  /* ---------- Pastille du prof actif (barre du haut) ---------- */
  function chip() {
    let c = document.getElementById('team-chip');
    if (!teamOn()) { if (c) c.remove(); return; }
    if (!c) { c = document.createElement('button'); c.id = 'team-chip'; c.type = 'button'; c.onclick = () => openWho();
      const sp = document.querySelector('.topbar .spacer'); if (sp) sp.after(c); else return; }
    const p = activeProf();
    c.innerHTML = p ? `${av(p)}<span>${esc(p.name)}</span>` : `${av(null)}<span>Qui fait cours ?</span>`;
    c.title = 'Changer d\'enseignant';
  }

  /* ---------- « Qui fait cours ? » ---------- */
  const choose = (p, done) => {
    const ok = () => { ls.set(ACT, p.id); window.profUnlock && profUnlock(); document.getElementById('who-ov')?.remove(); refresh(); toast(`👤 ${p.name} : vos classes et vos favoris`); done && done(); };
    if (p.pin && activeProf() === p && window.profUnlocked && profUnlocked()) return ok();
    if (p.pin) pinPad('ask', ok, `Code de ${p.name}`, { hash: p.pin });
    else pinPad('new', ok, '', { newTitle: `${p.name} : choisissez votre code`, newHint: 'Votre code perso à 4 chiffres : il ouvre votre espace et protège vos réglages.', onSet: h => { p.pin = h; save(); } });
  };
  window.openWho = done => {
    if (!teamOn() || document.getElementById('who-ov')) return;
    const cur = activeProf(), o = document.createElement('div'); o.id = 'who-ov';
    o.innerHTML = `<div class="wb" role="dialog" aria-modal="true"><div style="text-align:center"><div style="font-size:1.8rem">👋</div><h2 style="margin:2px 0 0">Qui fait cours ?</h2>
      <p class="muted" style="margin:4px 0 0;font-size:.85rem">Touchez votre nom puis tapez votre code : vous retrouvez vos classes et vos favoris.</p></div>
      <div class="wg">${teamProfs().map((p, i) => `<button class="wp ${p === cur ? 'on' : ''}" data-i="${i}">${av(p)}<span>${esc(p.name)}</span>${p.pin ? '' : '<small class="muted" style="font-weight:600">1re fois : créer mon code</small>'}</button>`).join('')}</div>
      ${cur ? `<button class="btn btn-ghost btn-block" style="margin-top:14px" id="who-keep">Continuer avec ${esc(cur.name)} · mode élève 🔒</button>` : ''}
      <button class="link" style="display:block;margin:12px auto 0" id="who-x">${cur ? 'Fermer' : 'Plus tard'}</button></div>`;
    document.body.appendChild(o);
    o.querySelectorAll('[data-i]').forEach(b => b.onclick = () => choose(teamProfs()[+b.dataset.i], done));
    const k = o.querySelector('#who-keep'); if (k) k.onclick = () => { window.profLock && profLock(); o.remove(); toast('🔒 Mode élève'); };
    o.querySelector('#who-x').onclick = () => o.remove();
  };

  /* ---------- Réglage : Plus → Équipe EPS ---------- */
  window.openTeam = () => {
    const panel = () => openPanel('Équipe EPS · tablettes partagées', el => {
      const on = teamOn(), cur = activeProf();
      el.innerHTML = `<div class="card doc"><p style="margin:0;line-height:1.5">Pour une équipe EPS qui partage <b>un lot de tablettes</b> : un seul compte pour toute l'équipe. En début de cours, chaque collègue touche <b>son nom</b> (« Qui fait cours ? ») et tape <b>son code perso</b> : il retrouve <b>ses classes</b> et ses favoris, et son code protège les réglages. Pas de déconnexion entre deux cours.</p></div>
        ${on ? `<div class="section-title"><h2>Enseignants (${teamProfs().length})</h2></div>
        <div class="card" style="padding:0">${teamProfs().map((p, i) => `<div class="list-item"><button class="btn" data-ava="${i}" title="Changer l\'avatar" style="all:unset;cursor:pointer;position:relative">${av(p, 'width:44px;height:44px;font-size:1rem')}<span style="position:absolute;right:-4px;bottom:-4px;font-size:.75rem">📷</span></button>
          <div style="flex:1;min-width:0;margin-left:10px"><b>${esc(p.name)}</b>${p === cur ? ' <span class="pill">sur cet appareil</span>' : ''}<div class="muted" style="font-size:.8rem">${nbCls(p)} classe(s) · ${p.pin ? '🔒 code défini' : '⚠️ code à créer à la 1re connexion'}</div></div>
          <div class="row" style="flex:0 0 auto;gap:6px"><button class="btn btn-ghost" style="padding:9px 10px" data-ava="${i}" title="Avatar : photo, Memoji ou émoji">😀</button><button class="btn btn-ghost" style="padding:9px 10px" data-rn="${i}" title="Renommer">✏️</button><button class="btn btn-ghost" style="padding:9px 10px" data-pk="${i}" title="Effacer le code (oublié)">🔑</button><button class="btn btn-ghost" style="padding:9px 10px" data-rm="${i}" title="Retirer">🗑</button></div></div>`).join('')}</div>
        <p class="muted" style="font-size:.8rem;margin:6px 4px 0">😀 Avatar (photo, capture de son Memoji ou émoji) · ✏️ Nom affiché · 🔑 Code oublié · 🗑 Retirer</p>
        <div class="card" style="margin-top:10px"><label style="margin-top:0">Ajouter un collègue</label><div class="row"><input id="tm-n" placeholder="ex : Mme Durand"><button class="btn btn-grad" style="flex:0 0 auto" id="tm-add">＋ Ajouter</button></div>
          <p class="muted" style="margin:6px 0 0;font-size:.8rem">Il choisira lui-même son code à sa première connexion (« Qui fait cours ? »).</p></div>
        <div class="card" style="margin-top:10px"><button class="btn btn-grad btn-block" id="tm-who">👋 Qui fait cours ? (changer d'enseignant)</button>
          <label style="display:flex;gap:10px;align-items:flex-start;margin-top:12px;cursor:pointer"><input type="checkbox" id="tm-all" ${seeAll() ? 'checked' : ''} style="width:auto;margin-top:3px"><span><b>Afficher les classes de toute l'équipe sur cet appareil</b><br><span class="muted" style="font-size:.8rem">Sinon, chaque enseignant ne voit que ses classes (et les classes communes). Le rattachement d'une classe se règle dans Mes classes.</span></span></label></div>`
        : `<div class="card" style="margin-top:12px"><label style="margin-top:0">Votre nom (affiché sur les tablettes)</label><input id="tm-me" placeholder="ex : M. Bardyn">
          <button class="btn btn-grad btn-block" style="margin-top:10px" id="tm-on">👥 Activer le mode Équipe</button>
          <p class="muted" style="margin:8px 0 0;font-size:.8rem">Vos classes actuelles vous seront rattachées. ${DB.profPin ? 'Votre code enseignant actuel devient votre code perso.' : ''} Vous ajoutez ensuite vos collègues.</p></div>`}
        <div class="card" style="margin-top:12px;border:1.5px solid var(--line)"><h3 style="margin:0">☁️ Quel stockage pour une équipe ?</h3>
          <p style="margin:6px 0 0;line-height:1.5;font-size:.9rem">Créez <b>un compte commun à l'équipe</b> (ex. eps.moncollege@…) et connectez chaque tablette <b>une seule fois</b>.</p>
          <ul style="margin:6px 0 0;padding-left:18px;line-height:1.5;font-size:.9rem">
            <li><b>Dropbox : conseillé.</b> La connexion reste active durablement sur des tablettes partagées.</li>
            <li><b>Google Drive</b> : fonctionne aussi, mais peut redemander la connexion de temps en temps.</li>
            <li><b>Compte EPS ONE sur invitation</b> : possible, sur demande.</li></ul>
          <p class="muted" style="margin:6px 0 0;font-size:.82rem">Sur les tablettes des élèves, cochez « 📥 Tablette de collecte » quand elle est proposée. Les données restent sur le cloud de l'équipe : aucun envoi vers l'éditeur d'EPS ONE.</p>
          <button class="btn btn-ghost btn-block" style="margin-top:10px" onclick="openSync()">Stockage & synchronisation ›</button></div>
        ${on ? '<button class="btn btn-ghost btn-block" style="margin-top:12px" id="tm-off">Désactiver le mode Équipe</button>' : ''}`;
      const $ = s => el.querySelector(s);
      if (!on) { $('#tm-on').onclick = () => {
        const name = $('#tm-me').value.trim(); if (!name) return toast('Indiquez votre nom');
        const me = { id: uid(), name }; if (DB.profPin) me.pin = DB.profPin;
        const prev = DB.team && DB.team.profs || [];
        DB.team = { on: 1, profs: prev.length ? prev : [me] };
        const mine = prev.length ? prev[0] : me;
        (dbGet('classes') || []).forEach(c => { if (!c.prof) c.prof = mine.id; });
        ls.set(ACT, mine.id); save(); refresh(); toast('👥 Mode Équipe activé'); panel();
        if (!mine.pin) choose(mine);
      }; return; }
      $('#tm-add').onclick = () => { const n = $('#tm-n').value.trim(); if (!n) return toast('Nom requis');
        if (teamProfs().some(p => p.name.toLowerCase() === n.toLowerCase())) return toast('Ce nom existe déjà');
        DB.team.profs.push({ id: uid(), name: n }); save(); toast(`${n} ajouté·e ✔`); refresh(); panel(); };
      el.querySelectorAll('[data-ava]').forEach(b => b.onclick = () => pickAva(teamProfs()[+b.dataset.ava], panel));
      el.querySelectorAll('[data-rn]').forEach(b => b.onclick = () => { const p = teamProfs()[+b.dataset.rn], n = (prompt('Nom affiché :', p.name) || '').trim(); if (!n) return; p.name = n; save(); refresh(); panel(); });
      el.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { const p = teamProfs()[+b.dataset.pk]; if (!p.pin) return toast('Aucun code pour l\'instant');
        if (!confirm(`Effacer le code de ${p.name} ?\n(code oublié : il en choisira un nouveau à sa prochaine connexion)`)) return; delete p.pin; save(); refresh(); panel(); });
      el.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { const p = teamProfs()[+b.dataset.rm];
        if (teamProfs().length === 1) return toast('Il faut au moins un enseignant (ou désactivez le mode Équipe)');
        if (!confirm(`Retirer ${p.name} de l'équipe ?\nSes ${nbCls(p)} classe(s) restent et deviennent communes à toute l'équipe.`)) return;
        (dbGet('classes') || []).forEach(c => { if (c.prof === p.id) delete c.prof; });
        DB.team.profs = teamProfs().filter(x => x !== p); if (ls.get(ACT) === p.id) ls.set(ACT, ''); save(); refresh(); panel(); });
      $('#tm-who').onclick = () => openWho(() => panel());
      $('#tm-all').onchange = e => { ls.set(ALL, e.target.checked ? '1' : ''); refresh(); toast(e.target.checked ? 'Toutes les classes de l\'équipe' : 'Seulement les classes de l\'enseignant'); };
      $('#tm-off').onclick = () => { if (!confirm('Désactiver le mode Équipe ?\nToutes les classes redeviennent visibles. Les enseignants et le rattachement des classes sont conservés si vous le réactivez.')) return;
        DB.team.on = 0; save(); refresh(); toast('Mode Équipe désactivé'); panel(); };
    });
    panel();
  };

  /* ---------- Démarrage ---------- */
  chip(); try { renderHome(); } catch (e) {}
  // Tablettes : « Qui fait cours ? » à l'ouverture (sauf appareil personnel jamais verrouillé)
  const boot = (n = 0) => {
    if (!teamOn()) return;
    const gate = document.getElementById('eps-gate') || document.getElementById('inst-ov') || document.getElementById('screen')?.classList.contains('open');
    if (gate) { if (n < 60) setTimeout(() => boot(n + 1), 2000); return; }
    const mode = typeof lockMode === 'function' ? lockMode() : 'auto';
    if (!activeProf() || mode !== 'off') openWho();
  };
  window.addEventListener('load', () => setTimeout(boot, 1200));
  // Données reçues d'un autre appareil (équipe modifiée) : mettre la pastille à jour
  setInterval(chip, 5000);
})();
