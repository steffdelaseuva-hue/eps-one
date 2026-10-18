/* Statistiques de visite anonymes (GoatCounter) : uniquement sur le site publié.
   Aucun cookie, aucune donnée personnelle, aucune donnée de l'app n'est envoyée. Sans effet hors-ligne. */
(function () {
  if (location.hostname !== 'steffdelaseuva-hue.github.io') return;      // jamais en local, ni ailleurs
  try {
    const s = document.createElement('script');
    s.async = true; s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', 'https://steffepsone.goatcounter.com/count');
    document.head.appendChild(s);
  } catch (e) {}
})();
