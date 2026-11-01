# EPS ONE — by Steff64

Boîte à outils web pour l'EPS (dégradé or → bleu, onglet OUTILS).

- `index.html` : l'app (accueil, onglet OUTILS, sauvegarde)
- `js/outils-plus.js` : outils complémentaires (vidéo différée, photo-finish, grilles, suivi…)
- `outils/chronos-eps.html` : Chronos EPS (chrono central + 12 chronos élèves)
- `sw.js` + `manifest.webmanifest` : installation sur l'écran d'accueil et hors ligne

Déploiement : dépôt sur la Forge des communs numériques éducatifs (forge.apps.education.fr/bardynstephane/eps-one), publié automatiquement par GitLab Pages (.gitlab-ci.yml) sur https://bardynstephane.forge.apps.education.fr/eps-one/. Copie de transition sur GitHub Pages (steffdelaseuva-hue.github.io/eps-one), mise à jour par le même git push.
Licence : GNU GPL v3 (fichier LICENSE).
La caméra (vidéo différée, photo-finish) nécessite HTTPS : elle fonctionne sur la Forge comme sur GitHub Pages.
