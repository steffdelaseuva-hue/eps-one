/* =========================================================
   EPS ONE — Bouton « Écouter de la musique »
   Ouvre l'application de musique installée sur l'appareil.
   ========================================================= */
ICONS.music = '<path d="M9 18V5.5l11-2.5v12.5"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/>';

const MUSIC_APPS = [
  { id: 'apple',   name: 'Apple Music (iTunes)', app: 'music://',        web: 'https://music.apple.com/' },
  { id: 'spotify', name: 'Spotify',              app: 'spotify://',      web: 'https://open.spotify.com/' },
  { id: 'deezer',  name: 'Deezer',               app: 'deezer://',       web: 'https://www.deezer.com/' },
  { id: 'ytm',     name: 'YouTube Music',        app: 'youtubemusic://', web: 'https://music.youtube.com/' },
];

function openMusicApp(i, el) {
  const a = MUSIC_APPS[i]; let left = false;
  const onHide = () => { if (document.hidden) left = true; };
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('blur', onHide);
  location.href = a.app;
  setTimeout(() => {
    document.removeEventListener('visibilitychange', onHide); window.removeEventListener('blur', onHide);
    if (left) return;
    const box = el.querySelector(`[data-fb="${i}"]`);
    if (box) box.innerHTML = `<span class="muted">Application non trouvée sur cet appareil.</span> <a class="link" href="${a.web}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Ouvrir la version web</a>`;
  }, 1800);
}

function openMusic() {
  openPanel('Écouter de la musique', el => {
    el.innerHTML = `<div class="card" style="padding:0">${MUSIC_APPS.map((a, i) => `
        <div class="menu-item" data-m="${i}"><span class="mi-ic grad">${ico('music')}</span><span style="flex:1"><b>${a.name}</b><span class="muted" data-fb="${i}">Ouvrir l'application</span></span><span class="chev">›</span></div>`).join('')}</div>
      <p class="muted" style="margin:14px 4px">Lancez votre playlist puis revenez dans EPS ONE : la musique continue en fond pendant que vous utilisez les outils.</p>
      <div class="section-title"><h2>🔊 Son des bips (cet appareil)</h2></div>
      <div class="card">
        <label style="display:flex;gap:10px;align-items:flex-start;color:var(--text);font-weight:700"><input type="checkbox" id="au-mix" ${audioPrefs().mix ? 'checked' : ''} style="width:auto;margin-top:3px"><span>🎵 Bips par-dessus la musique<br><span class="muted" style="font-weight:400;font-size:.82rem">La musique (Spotify, Apple Music…) continue pendant les bips au lieu d'être coupée. Sur iPhone / iPad, le mode silencieux doit être désactivé.</span></span></label>
        <label style="display:flex;gap:10px;align-items:flex-start;margin-top:12px;color:var(--text);font-weight:700"><input type="checkbox" id="au-bt" ${audioPrefs().bt ? 'checked' : ''} style="width:auto;margin-top:3px"><span>🔈 Enceinte Bluetooth<br><span class="muted" style="font-weight:400;font-size:.82rem">Garde l'enceinte éveillée (signal inaudible) pour qu'elle ne coupe pas les bips courts. À activer une fois l'enceinte connectée.</span></span></label>
        <button class="btn btn-ghost btn-block" style="margin-top:12px" id="au-test">🔔 Tester un bip</button></div>`;
    const setA = (k, v) => { DB.tablette = DB.tablette || {}; DB.tablette.audio = { ...(DB.tablette.audio || {}), [k]: v }; save(); unlockAudio(); };
    el.querySelector('#au-mix').onchange = e => setA('mix', e.target.checked);
    el.querySelector('#au-bt').onchange = e => setA('bt', e.target.checked);
    el.querySelector('#au-test').onclick = () => { unlockAudio(); [0, 400, 800].forEach((d, i) => setTimeout(() => beep(i === 2 ? 1300 : 880, .18), d)); };
    el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => openMusicApp(+b.dataset.m, el));
  });
}

/* Bouton dans la barre du haut, à côté de la loupe */
(() => {
  const search = document.querySelector('.topbar .icon-btn');
  if (!search) return;
  const btn = document.createElement('button');
  btn.className = 'icon-btn'; btn.setAttribute('aria-label', 'Écouter de la musique');
  btn.innerHTML = ico('music'); btn.onclick = openMusic;
  search.parentNode.insertBefore(btn, search);
  search.style.marginLeft = '8px';
})();
