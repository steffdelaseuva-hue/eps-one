/* =========================================================
   EPS ONE — Danse : banques (inducteurs simples pour les élèves,
   procédés de composition, images originales, œuvres à retrouver,
   textes du domaine public, extraits vidéo, sons générés)
   ========================================================= */

/* ---------- Inducteurs : formulations simples pour les élèves ---------- */
const DA_IND = [
  { k: 'vis', n: 'Ce que je vois, ce que je tiens', ic: '👁️', c: '#1E5BD8', g: [
    ['Un objet', [['🧣', 'Danse avec un foulard'], ['🪑', 'Une chaise : dessus, dessous, autour'], ['🪢', 'Une corde qui relie deux danseurs'], ['📰', 'Un journal qui se froisse'], ['🎈', 'Un ballon à ne jamais lâcher'], ['🎭', 'Un masque : on ne voit pas ton visage'], ['☂️', 'Un parapluie'], ['⭕', 'Un cerceau : dedans, dehors']]],
    ['Une image', [['🖼️', 'Un tableau à « mettre en mouvement »'], ['📷', 'Une photo : rejoue la pose puis fais-la bouger'], ['🌗', 'Ton ombre sur le mur'], ['💡', 'La lumière : danse vers elle ou fuis-la']]],
    ['L\'espace', [['➖', 'Suis une ligne au sol'], ['⭕', 'Danse en cercle'], ['↗️', 'Traverse en diagonale'], ['🟥', 'Reste dans un carré'], ['🧱', 'Un couloir très étroit'], ['🧭', 'Touche les 4 coins de la salle']]]],
    ex: '« Traversez la salle de trois façons différentes en gardant le foulard en contact avec votre partenaire. »' },
  { k: 'son', n: 'Ce que j\'entends', ic: '🎵', c: '#8E44AD', g: [
    ['La musique', [['🐢', 'Musique très lente'], ['🐇', 'Musique très rapide'], ['🥁', 'Des percussions : frappe le sol'], ['🎻', 'Musique douce'], ['🤫', 'Danse dans le silence'], ['🔇', 'Fige-toi quand le son s\'arrête']]],
    ['Des bruits', [['🌧️', 'La pluie'], ['💓', 'Un battement de cœur'], ['🕰️', 'Le tic-tac d\'une horloge'], ['🚧', 'Un chantier'], ['🌊', 'Les vagues'], ['📄', 'Du papier qu\'on froisse']]],
    ['Des mots', [['📜', 'Un poème lu à voix haute'], ['🗣️', 'Un mot crié'], ['🤭', 'Un mot chuchoté'], ['🔢', 'Un compte à rebours']]]],
    ex: '« Dansez uniquement sur les silences de la musique et figez-vous (statue) dès que le son reprend. »' },
  { k: 'cor', n: 'Mon corps', ic: '🤸', c: '#1B9E5A', g: [
    ['Comment je bouge', [['🪶', 'Léger comme une plume'], ['🪨', 'Lourd comme un rocher'], ['🍬', 'Mou comme un chewing-gum'], ['🤖', 'Saccadé comme un robot'], ['💧', 'Fluide comme l\'eau'], ['💪', 'Tout tendu puis tout relâché'], ['😴', 'Très fatigué'], ['⚡', 'Électrique, qui vibre']]],
    ['Vite ou lent, fort ou doux', [['🐌', 'Au ralenti'], ['🏎️', 'En accéléré'], ['🥊', 'Fort, avec énergie'], ['🫧', 'Tout doux, sans bruit'], ['➡️', 'Droit vers un but'], ['〰️', 'En zigzag, en détours']]],
    ['La partie qui guide', [['💪', 'Ton coude guide tout ton corps'], ['🍑', 'Ton bassin guide le mouvement'], ['👀', 'Ton regard guide le mouvement'], ['🙆', 'Ta tête guide le mouvement'], ['🖐️', 'Le bout de tes doigts guide'], ['🦵', 'Tes genoux guident'], ['🔙', 'Ton dos guide']]]],
    ex: '« Le mouvement ne part que du coude : il entraîne tout le reste du corps. »' },
  { k: 'rel', n: 'Avec les autres', ic: '🤝', c: '#E0892F', g: [
    ['À deux', [['🪞', 'Le miroir : fais comme ton partenaire, face à face'], ['👥', 'L\'ombre : derrière lui, fais pareil en même temps'], ['🎎', 'La marionnette : il te guide sans te toucher'], ['↔️', 'L\'un pousse, l\'autre se laisse faire'], ['🏋️', 'Porter / être porté'], ['👣', 'L\'un guide, l\'autre suit']]],
    ['En groupe', [['🟰', 'Tous ensemble, pareil (unisson)'], ['1️⃣', 'Chacun son tour (cascade)'], ['🧍', 'Un seul contre tous'], ['🫂', 'Se regrouper très serré'], ['💨', 'S\'éparpiller dans toute la salle'], ['❓', 'Question / réponse']]],
    ['Une histoire', [['⚔️', 'Le duel'], ['🤝', 'La rencontre'], ['🏃', 'La fuite'], ['🧲', 'S\'attirer'], ['🚫', 'Se rejeter'], ['🐾', 'La poursuite']]]],
    ex: '« L\'un est l\'ombre de l\'autre : reproduisez ses déplacements avec deux secondes de décalage. »' },
  { k: 'sem', n: 'J\'imagine', ic: '💭', c: '#D64545', g: [
    ['Des actions', [['⬇️', 'Tomber'], ['🦘', 'Bondir'], ['⛸️', 'Glisser'], ['🤸', 'S\'étirer'], ['🫠', 'Fondre'], ['💥', 'Exploser'], ['🧶', 'Se nouer'], ['🌪️', 'Tourbillonner'], ['🐍', 'Ramper'], ['🥶', 'Trembler']]],
    ['La nature', [['🌊', 'L\'eau'], ['🔥', 'Le feu'], ['🌬️', 'Le vent'], ['⛈️', 'La tempête'], ['🌳', 'L\'arbre et la forêt'], ['🧊', 'La glace qui fond']]],
    ['Des émotions', [['😨', 'La peur'], ['😄', 'La joie'], ['😡', 'La colère'], ['⏳', 'L\'attente'], ['😢', 'La tristesse'], ['😮', 'La surprise']]],
    ['Des idées', [['🦋', 'Se transformer'], ['🕊️', 'Se libérer'], ['🧱', 'Être enfermé'], ['⏱️', 'Le temps qui passe'], ['🚀', 'La vitesse'], ['👋', 'Se rencontrer']]]],
    ex: '« Enchaînez l\'action "fondre" au sol puis une action "exploser" en hauteur. »' }
];

/* ---------- Procédés de composition ---------- */
const DA_PROC = [
  { k: 'tps', n: 'Le temps', ic: '⏱️', c: '#0B5FA5', L: [
    ['🌊', 'Le canon / la cascade', 'La même phrase, mais chacun démarre un peu après l\'autre.'],
    ['🟰', 'L\'unisson', 'Tout le monde fait exactement le même mouvement au même moment.'],
    ['⏩', 'L\'accélération / la rupture de tempo', 'Le même geste en accéléré (urgence) ou au super-ralenti (apesanteur).'],
    ['🔁', 'La répétition / la boucle', 'Répéter un geste plusieurs fois, comme un refrain ou une routine.'],
    ['🧊', 'L\'arrêt (freeze)', 'Se figer en statue pendant que le temps continue.']] },
  { k: 'esp', n: 'L\'espace', ic: '🗺️', c: '#1B9E5A', L: [
    ['🪞', 'Le miroir / l\'inversion', 'Faire comme le partenaire en face, ou inverser gauche / droite, haut / bas.'],
    ['🔍', 'Petit espace / grand espace', 'La même phrase serrés dans un petit coin, puis en prenant toute la salle.'],
    ['↕️', 'Le changement de niveau', 'Refaire le mouvement au sol (bas) ou en sautant (haut).'],
    ['🧭', 'Le changement d\'orientation', 'Le même geste face au public, de dos, de profil ou en diagonale.'],
    ['🫂', 'Se regrouper / se disperser', 'Tous serrés dans un noyau, puis on s\'éparpille d\'un coup.']] },
  { k: 'rel', n: 'Le groupe et l\'autre', ic: '👥', c: '#E0892F', L: [
    ['❓', 'Question / réponse (chœur / soliste)', 'Un élève ou un petit groupe propose, les autres répondent par un autre mouvement.'],
    ['👤', 'L\'ombre', 'Un danseur derrière l\'autre fait exactement pareil en même temps.'],
    ['☯️', 'Le contraste / l\'opposition', 'Faire l\'inverse du partenaire : fluide et lent contre saccadé et rapide, sauter quand l\'autre tombe.'],
    ['🤲', 'Le contact / la manipulation', 'Porter, guider, pousser, tirer, se laisser tomber sur l\'autre.']] },
  { k: 'ene', n: 'L\'énergie et la transformation', ic: '⚡', c: '#8E44AD', L: [
    ['🦋', 'La métamorphose', 'Transformer un geste en changeant son énergie : de lourd et ancré à léger et aérien.'],
    ['🧬', 'L\'hybridation', 'Mélanger deux phrases différentes pour n\'en faire qu\'une.'],
    ['🔎', 'Agrandir / réduire', 'Faire le geste en très grand (bras, jambes) ou en tout petit (mains, tête, regard).']] }
];

/* ---------- Images originales (inducteurs visuels dessinés pour l'appli) ---------- */
const DA_SVG = (() => {
  const W = (b, inner) => `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;border-radius:10px;background:${b}">${inner}</svg>`;
  const rnd = (s => () => (s = (s * 9301 + 49297) % 233280) / 233280)(7);
  const fig = (x, y, s, c, lean = 0) => `<g transform="translate(${x} ${y}) rotate(${lean}) scale(${s})" stroke="${c}" stroke-width="3" stroke-linecap="round" fill="none"><circle cx="0" cy="-30" r="5" fill="${c}"/><path d="M0-24v18M0-18l-8 8M0-18l8 6M0-6l-6 14M0-6l7 14"/></g>`;
  return [
    { k: 'lc', n: 'Lignes et cercles', c: 'Lignes droites = gestes secs et directs ; cercles = gestes ronds et fluides ; angles = cassures du rythme.',
      s: W('#F4EFE3', `<g stroke="#1B1F2A" stroke-width="2.4">${[[10, 120, 150, 20], [40, 10, 120, 130], [60, 130, 190, 60], [5, 60, 110, 70]].map(([a, b, c, d]) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`).join('')}</g><circle cx="150" cy="40" r="22" fill="#1B1F2A"/><circle cx="150" cy="40" r="11" fill="#7B4FA6"/><circle cx="45" cy="35" r="13" fill="#E8B830"/><circle cx="170" cy="110" r="9" fill="#D64545"/><circle cx="85" cy="95" r="6" fill="#1E5BD8"/><path d="M95 60l18-14 6 22z" fill="#E0892F"/>`) },
    { k: 'sp', n: 'La spirale', c: 'Partir du centre et s\'enrouler / se dérouler : tours, enroulements, trajets en spirale.',
      s: W('#EAF2FF', `<path d="${Array.from({ length: 120 }, (_, i) => { const a = i / 6, r = 2 + i * .55; return (i ? 'L' : 'M') + (100 + r * Math.cos(a)).toFixed(1) + ' ' + (70 + r * Math.sin(a)).toFixed(1); }).join('')}" fill="none" stroke="#1E5BD8" stroke-width="3" stroke-linecap="round"/>`) },
    { k: 'va', n: 'La vague', c: 'Monter, rester suspendu en haut, puis s\'effondrer : en groupe, comme une vague qui se forme et retombe.',
      s: W('#E6F4F7', `${[0, 1, 2, 3].map(i => `<path d="M0 ${110 - i * 14} C40 ${70 - i * 20} 70 ${40 - i * 10} 110 ${60 - i * 12} S170 ${120 - i * 10} 200 ${100 - i * 14}" fill="none" stroke="${['#0B4A8F', '#1E5BD8', '#5B8DEF', '#A9C6F7'][i]}" stroke-width="${5 - i}"/>`).join('')}<circle cx="112" cy="42" r="4" fill="#fff" stroke="#0B4A8F"/>`) },
    { k: 'da', n: 'Le damier qui se déforme', c: 'Se déplacer en angles droits, sur une grille… puis la grille se tord : le mouvement se déforme.',
      s: W('#fff', Array.from({ length: 6 }, (_, y) => Array.from({ length: 9 }, (_, x) => (x + y) % 2 ? '' : `<rect x="${12 + x * 20 + y * y * 1.6}" y="${12 + y * 19}" width="${18 - y * 1.5}" height="17" transform="rotate(${y * 4 - 8} ${100} ${70})" fill="#1B1F2A"/>`).join('')).join('')) },
    { k: 'ex', n: 'L\'explosion', c: 'Partir tous d\'un point serré puis exploser dans toutes les directions.',
      s: W('#FFF3E8', `${Array.from({ length: 22 }, (_, i) => { const a = i / 22 * Math.PI * 2, r1 = 10 + rnd() * 10, r2 = 45 + rnd() * 30; return `<line x1="${(100 + r1 * Math.cos(a)).toFixed(1)}" y1="${(70 + r1 * Math.sin(a)).toFixed(1)}" x2="${(100 + r2 * Math.cos(a)).toFixed(1)}" y2="${(70 + r2 * Math.sin(a)).toFixed(1)}" stroke="${['#D64545', '#E0892F', '#E8B830'][i % 3]}" stroke-width="${2 + i % 3}" stroke-linecap="round"/>`; }).join('')}<circle cx="100" cy="70" r="9" fill="#D64545"/>`) },
    { k: 'pl', n: 'La pluie', c: 'Des gestes qui tombent : verticaux, du haut vers le bas, de plus en plus vite.',
      s: W('#E9EEF5', Array.from({ length: 46 }, () => { const x = rnd() * 200, y = rnd() * 130; return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - 3).toFixed(1)}" y2="${(y + 12).toFixed(1)}" stroke="#5B6782" stroke-width="2" stroke-linecap="round"/>`; }).join('') + '<path d="M0 132h200" stroke="#5B6782" stroke-width="3"/>') },
    { k: 'fo', n: 'La foule en marche', c: 'Tous marchent dans la même direction… un seul s\'arrête ou va à contre-sens.',
      s: W('#F2F2F2', [20, 45, 70, 95, 120, 145, 170].map((x, i) => fig(x, 112 - (i % 2) * 8, 1.15, i === 4 ? '#D64545' : '#1B1F2A', i === 4 ? 0 : 8)).join('') + '<path d="M10 130h180" stroke="#999" stroke-width="2"/>') },
    { k: 'di', n: 'L\'escalier en diagonale', c: 'Traverser en diagonale avec des postures cassées (coudes, genoux), en s\'emboîtant les uns derrière les autres.',
      s: W('#F7F1E8', `<path d="M15 125h30v-22h30v-22h30v-22h30v-22h30v-22" fill="none" stroke="#8A6D1F" stroke-width="4"/>${[30, 60, 90, 120, 150].map((x, i) => fig(x, 120 - i * 22, .8, '#1B1F2A', 20)).join('')}`) },
    { k: 'no', n: 'Le noyau et la dispersion', c: 'Très serrés au centre, puis éparpillés partout : jouer sur la densité.',
      s: W('#fff', Array.from({ length: 70 }, (_, i) => { const a = rnd() * 6.28, r = i < 40 ? rnd() * 16 : 30 + rnd() * 60; return `<circle cx="${(100 + r * Math.cos(a) * 1.3).toFixed(1)}" cy="${(70 + r * Math.sin(a) * .8).toFixed(1)}" r="${i < 40 ? 3 : 4}" fill="${i < 40 ? '#0B2A5B' : '#C9A227'}"/>`; }).join('')) },
    { k: 'ra', n: 'Rond contre anguleux', c: 'Un danseur tout en courbes, l\'autre tout en angles : deux façons de bouger qui s\'opposent.',
      s: W('#F4F4FA', `<path d="M15 70 C35 20 60 120 80 70 S120 20 100 100" fill="none" stroke="#1E5BD8" stroke-width="5" stroke-linecap="round"/><path d="M110 110l15-60 15 45 15-70 15 55 15-30" fill="none" stroke="#D64545" stroke-width="5" stroke-linejoin="miter"/>`) },
    { k: 'on', n: 'Les ondes', c: 'Un geste au centre qui se propage vers l\'extérieur, de danseur en danseur, comme un caillou dans l\'eau.',
      s: W('#E6F7F1', [10, 24, 40, 58, 78, 100].map((r, i) => `<ellipse cx="100" cy="70" rx="${r * 1.4}" ry="${r * .7}" fill="none" stroke="#16A3A3" stroke-width="${3 - i * .35}" opacity="${1 - i * .13}"/>`).join('') + '<circle cx="100" cy="70" r="5" fill="#0B4A8F"/>') },
    { k: 'mo', n: 'L\'équilibre suspendu', c: 'Comme un mobile : si l\'un bouge, tous les autres réagissent pour garder l\'équilibre.',
      s: W('#FBF7EE', `<g stroke="#1B1F2A" stroke-width="2" fill="none"><path d="M100 0v20M40 20h120M40 20v25M160 20v15M10 45h60M130 35h60M10 45v30M70 45v20M130 35v40M190 35v18"/></g><circle cx="10" cy="82" r="8" fill="#D64545"/><circle cx="70" cy="72" r="7" fill="#E8B830"/><circle cx="130" cy="84" r="10" fill="#1E5BD8"/><path d="M182 53h16l-8 14z" fill="#1B9E5A"/>`) },
    { k: 'om', n: 'Les ombres', c: 'Chaque danseur a une ombre qui le suit en même temps… ou avec un temps de retard.',
      s: W('#EDEDED', [40, 100, 160].map(x => fig(x + 10, 118, 1.6, '#B5B5B5', 10) + fig(x, 112, 1.6, '#1B1F2A', 4)).join('')) },
    { k: 'la', n: 'Le labyrinthe', c: 'Avancer sans jamais aller tout droit : bloqué, demi-tour, chercher la sortie.',
      s: W('#fff', `<path d="M20 20h160v100H20V35h130v70H50V50h70v40H80V65h20" fill="none" stroke="#0B2A5B" stroke-width="5" stroke-linejoin="round"/>`) }
  ];
})();

/* ---------- Œuvres célèbres : à retrouver en image (lien de recherche) ou à ajouter avec sa photo ---------- */
const DA_ART = [
  ['Composition VIII', 'Vassily Kandinsky', 'Lignes droites = gestes secs ; cercles = gestes ronds ; damiers = déplacements en angles droits.'],
  ['La Grande Vague de Kanagawa', 'Hokusai', 'Monter, être suspendu, s\'effondrer en groupe.'],
  ['La Nuit étoilée', 'Vincent van Gogh', 'Tourbillons : tours, spirales, enroulements.'],
  ['Le Cri', 'Edvard Munch', 'Corps qui se tord et ondule, contre des passants droits et indifférents.'],
  ['La Danse', 'Henri Matisse', 'Ronde, élan, mains qui se lâchent et se rattrapent.'],
  ['Nu descendant un escalier n° 2', 'Marcel Duchamp', 'Postures angulaires en diagonale, emboîtées.'],
  ['L\'Homme qui marche', 'Alberto Giacometti', 'Corps étiré, marche lente, fragile.'],
  ['Œuvres de Keith Haring', 'Keith Haring', 'Postures très lisibles, arrêts sur image, énergie saccadée.'],
  ['La Persistance de la mémoire', 'Salvador Dalí', 'Fondre, s\'écouler, temps suspendu.'],
  ['Composition en rouge, jaune et bleu', 'Piet Mondrian', 'Trajets droits, angles à 90°, zones d\'arrêt.'],
  ['Chronophotographie d\'un saut', 'Étienne-Jules Marey', 'Décomposer un saut en 5 arrêts sur image.'],
  ['La Valse', 'Camille Claudel', 'Couple enlacé, tourner à deux, déséquilibre partagé.']
];

/* ---------- Textes (domaine public) ---------- */
const DA_TXT = [
  { n: 'Le Chêne et le Roseau (extrait)', a: 'Jean de La Fontaine, 1668', t: 'Le Chêne un jour dit au Roseau :\n« Vous avez bien sujet d\'accuser la Nature ;\nUn Roitelet pour vous est un pesant fardeau.\nLe moindre vent, qui d\'aventure\nFait rider la face de l\'eau,\nVous oblige à baisser la tête […] »\n[…]\n« Je plie, et ne romps pas. »',
    c: 'Un danseur est le chêne (tonique, rigide, ancré), l\'autre le roseau (souple, il plie). Le vent souffle de plus en plus fort : le roseau plie et se relève, le chêne finit par tomber.' },
  { n: 'Demain, dès l\'aube…', a: 'Victor Hugo, 1856', t: 'Demain, dès l\'aube, à l\'heure où blanchit la campagne,\nJe partirai. Vois-tu, je sais que tu m\'attends.\nJ\'irai par la forêt, j\'irai par la montagne.\nJe ne puis demeurer loin de toi plus longtemps.',
    c: 'Une longue marche qui traverse toute la salle : chaque vers est un paysage différent (forêt, montagne) et une façon de marcher différente.' },
  { n: 'Chanson d\'automne', a: 'Paul Verlaine, 1866', t: 'Les sanglots longs\nDes violons\nDe l\'automne\nBlessent mon cœur\nD\'une langueur\nMonotone.',
    c: 'Des gestes longs et lents qui s\'étirent, puis qui retombent ; répétez la phrase comme une plainte (boucle).' },
  { n: 'Sensation', a: 'Arthur Rimbaud, 1870', t: 'Par les soirs bleus d\'été, j\'irai dans les sentiers,\nPicoté par les blés, fouler l\'herbe menue :\nRêveur, j\'en sentirai la fraîcheur à mes pieds.\nJe laisserai le vent baigner ma tête nue.',
    c: 'Danser les sensations : les pieds qui sentent le sol, le vent sur la tête ; des gestes légers et ouverts.' },
  { n: 'Il pleut (Calligrammes)', a: 'Guillaume Apollinaire, 1918', t: 'Il pleut des voix de femmes comme si elles étaient mortes même dans le souvenir\nc\'est vous aussi qu\'il pleut merveilleuses rencontres de ma vie ô gouttelettes […]',
    c: 'Le poème est écrit en lignes qui tombent : chaque danseur « tombe » en ligne verticale, l\'un après l\'autre (cascade).' },
  { n: 'Liberté (début)', a: 'Paul Éluard, 1942', t: 'Sur mes cahiers d\'écolier\nSur mon pupitre et les arbres\nSur le sable sur la neige\nJ\'écris ton nom […]\n\nEt par le pouvoir d\'un mot\nJe recommence ma vie\nJe suis né pour te connaître\nPour te nommer\n\nLiberté.',
    c: 'Chaque strophe ajoute un mouvement à la phrase (accumulation). « J\'écris ton nom » : écrire le mot avec une partie du corps. Au dernier mot, ouvrir tout l\'espace.' },
  { n: 'Haïku de la grenouille', a: 'Matsuo Bashō, 1686 (traduction libre)', t: 'Le vieil étang —\nune grenouille plonge,\nle bruit de l\'eau.',
    c: '3 vers = 3 temps : immobilité (l\'étang), une action soudaine (le plongeon), puis l\'onde qui se propage dans le groupe.' },
  { n: 'Haïku du papillon', a: 'Kobayashi Issa (traduction libre)', t: 'Sur la cloche du temple\nposé, il dort —\nun papillon.',
    c: 'Contraste : un groupe lourd et immobile (la cloche) et un danseur léger, presque immobile, posé dessus.' }
];

/* ---------- Extraits vidéo (lien de recherche) ---------- */
const DA_VID = [
  ['Contagion · la scène du restaurant', 'contagion restaurant scene', 'En quatuor, un geste se transmet de danseur en danseur par le contact.'],
  ['Matrix Reloaded · l\'agent Smith se multiplie', 'matrix reloaded agent smith multiply', 'Un solo au centre ; dès qu\'un danseur touche le sol, un autre se déclenche et reproduit le geste.'],
  ['Les Temps modernes · la chaîne de montage', 'temps modernes chaplin chaine de montage', 'Boucle de 3 gestes mécaniques, de plus en plus vite, jusqu\'au dérèglement.'],
  ['Un monde · bande-annonce', 'un monde laura wandel bande annonce', 'À 5 contre 1 : un mur mobile qui se resserre, l\'élève au centre esquive sans toucher.'],
  ['West Side Story · le prologue', 'west side story prologue', 'Deux bandes se défient en miroir, claquements de doigts, arrêts nets.'],
  ['Loïe Fuller · la danse serpentine (1896)', 'loie fuller danse serpentine lumiere 1896', 'Prolonger les gestes avec un tissu : spirales, vagues.'],
  ['Muybridge · le cheval au galop', 'muybridge horse in motion', 'Décomposer un mouvement en arrêts sur image successifs.'],
  ['Rosas danst Rosas · Anne Teresa De Keersmaeker', 'rosas danst rosas', 'Unisson, répétition et décalages avec des chaises.'],
  ['Café Müller · Pina Bausch', 'pina bausch cafe muller', 'Chaises comme obstacles ; tomber et être rattrapé.'],
  ['May B · Maguy Marin', 'maguy marin may b', 'Groupe serré qui avance en piétinant, corps lourds et fatigués.'],
  ['Black Swan · bande-annonce', 'black swan bande annonce', 'Le double : miroir à deux, de la perfection au lâcher-prise.']
];

/* ---------- Sons générés par l'appli (sans fichier, hors connexion) ---------- */
const DA_SND = [
  ['coeur', '💓', 'Battement de cœur', 'Le cœur qui bat : gestes pulsés, puis de plus en plus calmes.'],
  ['metro60', '🐢', 'Pulsation lente (60)', 'Un geste par battement : très lent, très précis.'],
  ['metro140', '🐇', 'Pulsation rapide (140)', 'Gestes rapides et nets sur chaque battement.'],
  ['tictac', '🕰️', 'Tic-tac d\'horloge', 'Gestes mécaniques, comme les aiguilles d\'une horloge.'],
  ['pluie', '🌧️', 'La pluie', 'Des gestes qui tombent, légers puis de plus en plus nombreux.'],
  ['vent', '🌬️', 'Le vent', 'Se laisser pousser, plier, résister au vent.'],
  ['drone', '🌫️', 'Nappe grave', 'Mouvements continus, lents, sans arrêt.'],
  ['electro', '🎛️', 'Pulsation électro', 'Groupe A sur la pulsation (robots), groupe B à contre-temps (panique).'],
  ['tambour', '🥁', 'Tambours', 'Frapper le sol, rebonds, énergie brute.'],
  ['boite', '🎶', 'Boîte à musique', 'Légèreté, gestes délicats, petits tours.'],
  ['alterne', '🔇', 'Son / silence', 'On danse pendant le son, on se fige pendant le silence (ou l\'inverse).'],
  ['gong', '🔔', 'Gong (signal)', 'À chaque coup de gong : changement de direction ou chute.']
];
let DA_AC = null;
/* Joue un son en boucle ; renvoie une fonction d'arrêt */
function daSound(kind) {
  const AC = DA_AC || (DA_AC = new (window.AudioContext || window.webkitAudioContext)()); if (AC.state === 'suspended') AC.resume();
  const out = AC.createGain(); out.gain.value = .8; out.connect(AC.destination); let stop = false; const timers = [];
  const at = (fn, ms) => timers.push(setTimeout(() => !stop && fn(), ms)), every = (fn, ms) => { fn(); timers.push(setInterval(() => !stop && fn(), ms)); };
  const tone = (f, d, type = 'sine', v = .4, t0 = AC.currentTime, slide) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + d);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + d + .05); };
  const noise = () => { const b = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = AC.createBufferSource(); s.buffer = b; s.loop = true; return s; };
  const nodes = [];
  const PENTA = [523, 587, 659, 784, 880, 1047];
  switch (kind) {
    case 'coeur': every(() => { tone(60, .18, 'sine', .9, AC.currentTime, 40); tone(55, .16, 'sine', .7, AC.currentTime + .28, 38); }, 1000); break;
    case 'metro60': every(() => tone(1000, .05, 'square', .25), 1000); break;
    case 'metro140': every(() => tone(1000, .04, 'square', .22), 60000 / 140); break;
    case 'tictac': { let i = 0; every(() => tone(i++ % 2 ? 900 : 1300, .03, 'square', .2), 500); break; }
    case 'pluie': case 'vent': { const n = noise(), f = AC.createBiquadFilter(), g = AC.createGain(); f.type = kind === 'pluie' ? 'highpass' : 'lowpass'; f.frequency.value = kind === 'pluie' ? 2500 : 500; g.gain.value = kind === 'pluie' ? .25 : .5;
      n.connect(f); f.connect(g); g.connect(out); n.start(); nodes.push(n);
      if (kind === 'vent') every(() => { const t = AC.currentTime; g.gain.linearRampToValueAtTime(.15 + Math.random() * .6, t + 1.5); f.frequency.linearRampToValueAtTime(250 + Math.random() * 700, t + 1.5); }, 1500);
      else every(() => tone(3000 + Math.random() * 3000, .02, 'sine', .08), 90); break; }
    case 'drone': [55, 82.5, 110.3].forEach(fq => { const o = AC.createOscillator(), g = AC.createGain(), f = AC.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = fq; f.type = 'lowpass'; f.frequency.value = 400; g.gain.value = .12; o.connect(f); f.connect(g); g.connect(out); o.start(); nodes.push(o); }); break;
    case 'electro': { let i = 0; every(() => { tone(150, .15, 'sine', .8, AC.currentTime, 45); if (i % 2) tone(1760, .05, 'square', .06); if (i++ % 8 === 6) tone(220, .3, 'sawtooth', .12); }, 500); break; }
    case 'tambour': { let i = 0; every(() => { const acc = [1, 0, 0, 1, 0, 1, 0, 0][i++ % 8]; tone(acc ? 70 : 110, acc ? .35 : .15, 'sine', acc ? 1 : .45, AC.currentTime, 40); }, 230); break; }
    case 'boite': { let i = 0; every(() => tone(PENTA[[0, 2, 4, 5, 4, 2, 1, 3][i++ % 8]], .9, 'triangle', .18), 420); break; }
    case 'alterne': { let i = 0; every(() => { const on = Math.floor(i++ / 12) % 2 === 0; if (on) tone(PENTA[Math.floor(Math.random() * 6)] / 2, .5, 'triangle', .22); }, 500); break; }
    case 'gong': every(() => { [110, 220.5, 331, 497].forEach((f, k) => tone(f, 5, 'sine', .35 / (k + 1))); }, 8000); break;
  }
  return () => { stop = true; timers.forEach(t => { clearTimeout(t); clearInterval(t); }); nodes.forEach(n => { try { n.stop(); } catch (e) {} });
    try { out.gain.setTargetAtTime(0, AC.currentTime, .05); setTimeout(() => out.disconnect(), 400); } catch (e) {} };
}

/* ---------- Niveaux : 1 = les basiques, 2 = les plus complexes (tout ce qui n'est pas listé ici est de niveau 1) ---------- */
const DA_N2 = new Set([
  // inducteurs
  'Un masque : on ne voit pas ton visage', 'Un tableau à « mettre en mouvement »', 'Une photo : rejoue la pose puis fais-la bouger', 'Ton ombre sur le mur', 'La lumière : danse vers elle ou fuis-la', 'Un couloir très étroit',
  'Un chantier', 'Du papier qu\'on froisse', 'Un poème lu à voix haute', 'Un mot crié', 'Un mot chuchoté', 'Fige-toi quand le son s\'arrête',
  'Tout tendu puis tout relâché', 'Très fatigué', 'Électrique, qui vibre', 'Droit vers un but', 'En zigzag, en détours', 'Ton bassin guide le mouvement', 'Ton regard guide le mouvement', 'Ton dos guide', 'Tes genoux guident', 'Le bout de tes doigts guide',
  'La marionnette : il te guide sans te toucher', 'Porter / être porté', 'Un seul contre tous', 'Question / réponse', 'S\'attirer', 'Se rejeter',
  'Se nouer', 'Fondre', 'Trembler', 'La glace qui fond', 'L\'attente', 'La surprise', 'Se transformer', 'Se libérer', 'Être enfermé', 'Le temps qui passe',
  // procédés
  'L\'accélération / la rupture de tempo', 'Petit espace / grand espace', 'Le changement d\'orientation', 'Le contraste / l\'opposition', 'Le contact / la manipulation', 'La métamorphose', 'L\'hybridation', 'Agrandir / réduire',
  // images
  'lc', 'da', 'ra', 'mo', 'la', 'di',
  // œuvres célèbres / textes / vidéos / sons
  'Composition VIII', 'Nu descendant un escalier n° 2', 'L\'Homme qui marche', 'La Persistance de la mémoire', 'La Valse',
  'Chanson d\'automne', 'Sensation', 'Il pleut (Calligrammes)', 'Liberté (début)', 'Haïku du papillon',
  'Un monde · bande-annonce', 'Rosas danst Rosas · Anne Teresa De Keersmaeker', 'Café Müller · Pina Bausch', 'May B · Maguy Marin', 'Black Swan · bande-annonce',
  'drone', 'electro', 'alterne',
  // œuvres / thèmes de l'onglet Œuvre
  'Composition VIII', 'L\'Homme qui marche', 'Œuvres de Keith Haring', 'Le Cri', 'Nu descendant un escalier n° 2', 'La Persistance de la mémoire', 'La Valse', 'Mobiles', 'Musée Guggenheim de Bilbao', 'Viaduc de Millau',
  'Liberté', 'Le Mythe de Sisyphe', 'La Métamorphose', 'Il pleut (Calligrammes)', 'La Révolution / La Révolte', 'La chute du mur de Berlin', 'La migration / Le voyage',
  'Le Sacre du printemps', 'Clapping Music', 'Contagion', 'Un monde · l\'exclusion', 'Black Swan', 'La Peste', 'Le langage du cinéma', 'Café Müller', 'L\'Après-midi d\'un faune',
  'La métamorphose', 'Le temps qui passe', 'L\'enfermement', 'La foule'
]);
const daLv = n => DA_N2.has(n) || (typeof DA_MUS_N2 !== 'undefined' && DA_MUS_N2.has(n)) ? 2 : 1;

/* ---------- Musiques des œuvres : lien direct vers les plateformes (Apple Music, Spotify, Deezer, YouTube Music) ---------- */
const DA_MUS = [
  ['Boléro', 'Maurice Ravel', 'Ravel Boléro', 'Une phrase reprise par de plus en plus de danseurs, de plus en plus fort (accumulation).'],
  ['Le Sacre du printemps', 'Igor Stravinsky', 'Stravinsky Le Sacre du printemps', 'Frapper le sol, rebonds, énergie brute ; un cercle, un élu au centre.'],
  ['L\'Apprenti sorcier', 'Paul Dukas', 'Dukas L\'Apprenti sorcier', 'Un geste répété qui se multiplie et déborde : le chaos.'],
  ['Dans l\'antre du roi de la montagne', 'Edvard Grieg', 'Grieg Peer Gynt Dans l\'antre du roi de la montagne', 'La même phrase de plus en plus vite et de plus en plus fort, jusqu\'à la rupture.'],
  ['Gymnopédie n° 1', 'Erik Satie', 'Satie Gymnopédie 1', 'Gestes lents et continus, sans jamais s\'arrêter.'],
  ['Les Quatre Saisons · L\'Hiver', 'Antonio Vivaldi', 'Vivaldi Quatre Saisons Hiver', 'Le froid : tremblements, gestes saccadés, se serrer les uns contre les autres.'],
  ['Le Carnaval des animaux · Aquarium', 'Camille Saint-Saëns', 'Saint-Saëns Carnaval des animaux Aquarium', 'Flotter, onduler, glisser comme dans l\'eau.'],
  ['Danse macabre', 'Camille Saint-Saëns', 'Saint-Saëns Danse macabre', 'Des corps raides qui se réveillent, s\'animent puis se figent au chant du coq.'],
  ['Le Vol du bourdon', 'Nikolaï Rimski-Korsakov', 'Rimski-Korsakov Le Vol du bourdon', 'Petits gestes très rapides, trajets en zigzag.'],
  ['Clapping Music', 'Steve Reich', 'Steve Reich Clapping Music', 'Même phrase, départs décalés (canon), puis on se retrouve.'],
  ['Contagion · bande originale', 'Cliff Martinez', 'Cliff Martinez Contagion', 'Groupe A sur la pulsation (robots), groupe B à contre-temps (panique).'],
  ['Le Lac des cygnes', 'Piotr Ilitch Tchaïkovski', 'Tchaikovsky Lac des cygnes', 'Bras comme des ailes, glisser, se poser ; le cygne blanc contre le cygne noir.']
];
const DA_MUS_N2 = new Set(['Clapping Music', 'Contagion · bande originale', 'Danse macabre', 'Le Sacre du printemps']);
/* Boutons d'écoute : la plateforme s'ouvre sur la recherche du morceau (l'application s'ouvre si elle est installée) */
const daMusLinks = (q, dark) => { const e = encodeURIComponent(q), st = `padding:6px 9px;font-size:.78rem;text-align:center${dark ? ';background:#fff;color:#0E1A33' : ''}`;
  return `<div style="display:flex;flex-wrap:wrap;gap:5px">${[['Apple Music', 'https://music.apple.com/fr/search?term=' + e], ['Spotify', 'https://open.spotify.com/search/' + e], ['Deezer', 'https://www.deezer.com/fr/search/' + e], ['YouTube Music', 'https://music.youtube.com/search?q=' + e]]
    .map(([n, u]) => `<a class="btn btn-ghost" style="${st}" href="${u}" target="_blank" rel="noopener">🎵 ${n}</a>`).join('')}</div>`; };
