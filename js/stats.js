/* Statistiques de visite anonymes (GoatCounter) : uniquement sur le site publié.
   Aucun cookie, aucune donnée personnelle, aucune donnée de l'app n'est envoyée. Sans effet hors-ligne. */
(function () {
  /* Réglage « ne pas compter mes visites » (propre à chaque appareil / à l'icône de l'écran d'accueil) : même clé que GoatCounter (#toggle-goatcounter) */
  const off = () => { try { return localStorage.getItem('skipgc') === 't'; } catch (e) { return false; } };
  /* 5 appuis rapides sur la ligne de version (onglet Plus) : active / désactive le comptage de ses propres visites sur cet appareil */
  let taps = 0, tapT = null;
  window.epsStatsTap = () => { taps++; clearTimeout(tapT); tapT = setTimeout(() => { taps = 0; }, 2500);
    if (taps >= 5) { taps = 0; window.epsStatsToggle(); } };
  window.epsStatsLabel = () => off() ? '✅ Mes visites ne sont pas comptées (toucher pour les recompter)' : '🚫 Ne pas compter mes visites sur cet appareil';
  window.epsStatsToggle = b => { try { off() ? localStorage.removeItem('skipgc') : localStorage.setItem('skipgc', 't'); } catch (e) {}
    if (b) b.textContent = window.epsStatsLabel(); try { toast(off() ? 'Vos visites ne seront plus comptées sur cet appareil' : 'Vos visites seront de nouveau comptées'); } catch (e) {} };
  if (off()) return;
  if (location.hostname !== 'steffdelaseuva-hue.github.io') return;      // jamais en local, ni ailleurs
  try {
    const s = document.createElement('script');
    s.async = true; s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', 'https://steffepsone.goatcounter.com/count');
    document.head.appendChild(s);
  } catch (e) {}
})();
