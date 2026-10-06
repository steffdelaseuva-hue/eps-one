/* =========================================================
   EPS ONE — Outil « Danse »
   1/ Œuvre ou thème (banque + œuvres ajoutées par l'enseignant, avec photo)
   2/ Inducteurs : 5 familles, choix à la main ou tirage au sort (verrouillage)
   3/ Vidéo : filmer les groupes (gardé sur la tablette) et comparer 2 vidéos
   Données : DB.danse = { cur, fiches, vids, custom, nb }
   ========================================================= */
ICONS.danse = '<circle cx="13" cy="4" r="2"/><path d="M13 6.5 11 12l3 3-1 6M11 12l-4 2M13 8l5-2.5M14 15l4 1"/>';

/* ---------- Banque d'œuvres / thèmes (pistes de mouvement) ---------- */
const DA_OEU = [
  { cat: 'Arts visuels', ic: '🎨', L: [
    { n: 'Composition VIII', a: 'Vassily Kandinsky', d: 1923, p: 'Traduire les formes géométriques et les couleurs en mouvements.', t: [['Point noir / cercle', 'Mouvement circulaire autour du centre du corps'], ['Lignes droites / piques', 'Trajectoires directes, attaques sèches avec les membres'], ['Grilles / damier', 'Déplacements en angles droits, cadrage de l\'espace'], ['Angles', 'Ruptures de rythme'], ['Zones de couleur claire', 'Flottement, déplacements légers et aériens']] },
    { n: 'La Grande Vague de Kanagawa', a: 'Hokusai', d: 1831, p: 'Amplitude, accumulation et effondrement.', t: [['La vague qui se forme', 'Le groupe se rassemble et grandit (bas → haut)'], ['La crête suspendue', 'Suspension, arrêt en déséquilibre'], ['L\'effondrement', 'Chute en cascade, retour au sol'], ['Les barques', 'Résister, se laisser emporter']] },
    { n: 'L\'Homme qui marche', a: 'Alberto Giacometti', d: 1960, p: 'Étirement, lenteur, fragilité et déséquilibre.', t: [['Corps filiforme', 'S\'étirer vers le haut, se grandir'], ['Le pas suspendu', 'Marche très lente, transferts de poids'], ['Fragilité', 'Équilibres précaires, presque tomber']] },
    { n: 'Œuvres de Keith Haring', a: 'Keith Haring', d: '1980s', p: 'Postures, arrêts sur image (flash), énergie saccadée, formes corporelles expressives.', t: [['Silhouettes cernées', 'Postures très lisibles, bras et jambes « graphiques »'], ['Traits de mouvement', 'Saccades, vibrations'], ['Personnages reliés', 'Portés, appuis, enchevêtrements']] },
    { n: 'La Danse', a: 'Henri Matisse', d: 1910, p: 'Ronde, élan, liens par les mains.', t: [['La ronde', 'Tourner ensemble, unisson'], ['Les mains qui se lâchent', 'Rompre / renouer le contact'], ['Corps penchés', 'Déséquilibres partagés']] },
    { n: 'Le Cri', a: 'Edvard Munch', d: 1893, p: 'Distorsion du corps ; contraste entre le visage déformé, les lignes ondulantes du paysage et les silhouettes droites à l\'arrière-plan.', t: [['Visage déformé', 'Gestuelle déformée, liquide, expressive (mains sur le visage)'], ['Ciel et paysage ondulants', 'Ondulations du buste et de tout le corps'], ['Silhouettes droites', 'Traversées sur des lignes droites, rigides, indifférentes']],
      c: 'Un élève exécute une gestuelle déformée, liquide et expressive (ondulations du buste, mains sur le visage), pendant que deux autres traversent l\'espace sur des lignes droites, rigides et indifférentes.' },
    { n: 'Nu descendant un escalier n° 2', a: 'Marcel Duchamp', d: 1912, p: 'Formes facettées et géométriques empilées en diagonale : angles, superposition, trajectoire diagonale.', t: [['Formes facettées', 'Postures angulaires : coudes, genoux, buste cassé'], ['Empilement', 'S\'emboîter les uns derrière les autres'], ['La diagonale', 'Traverser la salle uniquement en diagonale']],
      c: 'Traversez la salle uniquement en diagonale, en n\'utilisant que des postures angulaires (coudes, genoux, buste cassé) et en vous emboîtant les uns derrière les autres.' },
    { n: 'La Nuit étoilée', a: 'Vincent van Gogh', d: 1889, p: 'Tourbillons, spirales, fluidité.', t: [['Tourbillons', 'Tours, spirales, enroulements'], ['Le cyprès', 'Verticalité, flamme qui monte'], ['Étoiles', 'Petits éclats, gestes brefs']] },
    { n: 'Composition en rouge, jaune et bleu', a: 'Piet Mondrian', d: 1930, p: 'Lignes orthogonales, blocs de couleur.', t: [['Lignes noires', 'Trajets droits, changements de direction à 90°'], ['Blocs de couleur', 'Zones d\'arrêt, de groupe']] },
    { n: 'La Persistance de la mémoire', a: 'Salvador Dalí', d: 1931, p: 'Mollesse, temps qui fond.', t: [['Montres molles', 'Fondre, s\'écouler au sol'], ['Paysage immobile', 'Lenteur, suspension du temps']] },
    { n: 'La Valse', a: 'Camille Claudel', d: 1893, p: 'Couple, tourner, déséquilibre partagé.', t: [['Le couple enlacé', 'Contact, contrepoids'], ['Le tourbillon', 'Tourner à deux']] },
    { n: 'Mobiles', a: 'Alexander Calder', d: '1930s', p: 'Équilibre, suspension, mouvements reliés.', t: [['Éléments suspendus', 'Un mouvement en entraîne un autre (réaction en chaîne)'], ['Équilibre', 'Contrepoids entre danseurs']] },
    { n: 'Danseuses (La Classe de danse)', a: 'Edgar Degas', d: 1874, p: 'Attente, échauffement, poses.', t: [['Danseuses au repos', 'Immobilité / reprise du mouvement'], ['Le maître', 'Un meneur, les autres suivent']] }
  ] },
  { cat: 'Architecture', ic: '🏛️', L: [
    { n: 'La Tour Eiffel', a: 'Gustave Eiffel', d: 1889, p: 'Verticalité, entrelacs, ascension.', t: [['Les piliers', 'Appuis solides, bases larges'], ['Le treillis', 'Bras et jambes entrecroisés'], ['Le sommet', 'Monter, s\'affiner']] },
    { n: 'Musée Guggenheim de Bilbao', a: 'Frank Gehry', d: 1997, p: 'Courbes, ondulations, reflets.', t: [['Façades courbes', 'Mouvements enveloppants'], ['Reflets', 'Miroir à deux']] },
    { n: 'Viaduc de Millau', a: 'Norman Foster', d: 2004, p: 'Lignes, tension, haubans.', t: [['Haubans', 'Lignes tendues entre deux danseurs'], ['Le tablier', 'Trajet long et continu']] }
  ] },
  { cat: 'Littérature & poésie', ic: '📖', L: [
    { n: 'Liberté', a: 'Paul Éluard', d: 1942, p: 'Chaque strophe devient une phrase chorégraphique qui s\'élargit.', t: [['« J\'écris ton nom »', 'Écrire un mot avec une partie du corps'], ['Les strophes', 'Une phrase de plus à chaque strophe'], ['Le dernier vers', 'Ouverture, libération de l\'espace']] },
    { n: 'Haïkus', a: 'Poésie japonaise', d: '', p: 'Trame rythmique ou émotionnelle courte : 3 temps.', t: [['3 vers', '3 mouvements enchaînés (5-7-5 temps)'], ['L\'image du haïku', 'Une sensation à traduire']] },
    { n: 'Le Mythe de Sisyphe', a: 'Mythologie grecque', d: '', p: 'Effort répétitif, pesanteur, chute et recommencement.', t: [['Pousser le rocher', 'Effort, poids, lenteur'], ['La chute', 'Tout s\'effondre'], ['Recommencer', 'Répétition, accumulation de fatigue']] },
    { n: 'La Métamorphose', a: 'Ovide / Kafka', d: '', p: 'Transformation progressive du corps (humain → animal / insecte).', t: [['Avant', 'Gestes humains quotidiens'], ['Pendant', 'Le corps se transforme partie par partie'], ['Après', 'Nouvelle façon de se déplacer']] },
    { n: 'Le Chêne et le Roseau', a: 'Jean de La Fontaine', d: 1668, p: 'Opposition de deux polarités : rigidité contre souplesse.', t: [['Le chêne', 'Corps tonique, rigide, ancré'], ['Le roseau', 'Corps souple, plie sans rompre'], ['La tempête', 'Le vent fait plier, le chêne tombe']] },
    { n: 'Il pleut (Calligrammes)', a: 'Guillaume Apollinaire', d: 1918, p: 'Lettres qui tombent : chutes, verticalité.', t: [['Lettres qui coulent', 'Descendre, glisser vers le sol'], ['Les lignes', 'Trajets parallèles']] }
  ] },
  { cat: 'Histoire & société', ic: '🏛', L: [
    { n: 'La Révolution / La Révolte', a: '', d: '', p: 'Opposition, rassemblement (effet de masse), conquête de l\'espace, rupture.', t: [['Le peuple', 'Rassemblement, unisson'], ['L\'affrontement', 'Deux groupes face à face'], ['La conquête', 'Avancer, prendre l\'espace']] },
    { n: 'La chute du mur de Berlin', a: '', d: 1989, p: 'De la séparation à l\'union et à la déconstruction.', t: [['Le mur invisible', 'Deux groupes séparés, ne se touchent pas'], ['La brèche', 'Un passage s\'ouvre'], ['La rencontre', 'Union, mélange des groupes']] },
    { n: 'Le travail à la chaîne', a: 'Révolution industrielle / Les Temps modernes', d: '', p: 'Gestes répétitifs, mécaniques, synchronisés, puis dérèglement de la machine.', t: [['La chaîne', 'Gestes répétés en ligne, synchronisés'], ['La cadence', 'Accélération'], ['Le dérèglement', 'Saccades, désynchronisation']] },
    { n: 'La migration / Le voyage', a: '', d: '', p: 'Traversée de l\'espace, valises imaginaires, soutien mutuel, usure.', t: [['La traversée', 'Grand trajet d\'un bout à l\'autre'], ['Les valises', 'Porter un poids imaginaire'], ['L\'entraide', 'Porter, soutenir, relever']] }
  ] },
  { cat: 'Musique & spectacle', ic: '🎵', L: [
    { n: 'Le Sacre du printemps', a: 'Igor Stravinsky', d: 1913, p: 'Mouvements ancrés dans le sol, pulsation primitive, énergie brute.', t: [['Pulsation', 'Frapper le sol, rebonds'], ['Le rituel', 'Cercle, élu au centre']] },
    { n: 'L\'Apprenti sorcier', a: 'Paul Dukas', d: 1897, p: 'Montée en puissance, répétition incontrôlable.', t: [['Le balai', 'Un geste répété qui se multiplie'], ['Le débordement', 'Accumulation, chaos']] },
    { n: 'Boléro', a: 'Maurice Ravel', d: 1928, p: 'Répétition, crescendo, accumulation.', t: [['Le thème répété', 'Une phrase reprise par de plus en plus de danseurs'], ['Le crescendo', 'Amplitude et énergie croissantes']] },
    { n: 'Gymnopédie n° 1', a: 'Erik Satie', d: 1888, p: 'Lenteur, continuité, douceur.', t: [['Tempo lent', 'Mouvements continus, sans arrêt']] },
    { n: 'Clapping Music', a: 'Steve Reich', d: 1972, p: 'Canon, décalage.', t: [['Le décalage', 'Même phrase, départs décalés (canon)']] },
    { n: 'Bandes dessinées / romans graphiques', a: '', d: '', p: 'Reproduire la succession des cases.', t: [['Vignettes', 'Arrêts sur image'], ['Ellipses', 'Transitions rapides'], ['Onomatopées', 'Gestes explosifs']] },
  ] },
  { cat: 'Cinéma & récits', ic: '🎬', L: [
    { n: 'Contagion', a: 'Steven Soderbergh', d: 2011, p: 'La propagation : contact et transmission, isolement contre groupe, invasion de l\'espace à partir d\'un point.', t: [['Gros plan sur les mains', 'Contact / toucher'], ['Affiche « biorisque »', 'Espace / forme du groupe'], ['Le geste « se toucher le visage »', 'Énergie / rupture'], ['Pulsation musicale', 'Temps / rythme'], ['L\'isolement / le groupe', 'Un corps contraint, en quarantaine, face à la masse en mouvement'], ['L\'invasion de l\'espace', 'Occuper peu à peu tout l\'espace scénique à partir d\'un seul point']],
      c: 'Créez un canon où chaque danseur reproduit la même phrase avec un temps de retard, puis vient toucher un camarade pour lui transmettre le mouvement.',
      x: [{ ty: '🎬 Vidéo', n: 'La scène du restaurant : la chaîne de transmission (début du film)', e: 'En gros plan, une série de contacts anodins : un bol de cacahuètes, une carte bancaire tendue au serveur, le lecteur de carte, puis la poignée de porte.', i: 'La micro-transmission et la réaction en chaîne.', c: 'En quatuor : le danseur 1 initie un geste précis sur une partie de son corps (ex. toucher son épaule). Dès qu\'il entre en contact avec le danseur 2, il lui « donne » ce geste. Le danseur 2 l\'incorpore, le transforme et le transmet au danseur 3, et ainsi de suite.' },
        { ty: '🖼️ Visuel', n: 'L\'affiche du film / le symbole biorisque', e: 'Un symbole compact, aux formes rayonnantes et symétriques.', i: 'L\'espace et la forme du groupe.', c: 'Partez d\'un noyau compact (le symbole). À partir de ce noyau, créez 3 formes géométriques successives (symétriques puis dissymétriques) en explorant les niveaux haut, moyen et bas, sans jamais rompre le contact.' },
        { ty: '📖 Texte', n: 'Les explications de l\'épidémiologiste (Dr Erin Mears)', e: 'Elle rappelle que l\'on se touche le visage plusieurs fois par minute, entre deux contacts avec des poignées de porte, des boutons d\'ascenseur, des tasses… et les autres.', i: 'L\'impulsion irrépressible, le mouvement réflexe / incontrôlé.', c: 'Construisez une phrase chorégraphique fluide (déplacements, tours). Insérez-y de manière brutale et répétitive des « tics », gestes réflexes vers le visage ou le buste. Le geste réflexe doit interrompre net la trajectoire du corps (rupture d\'énergie).' },
        { ty: '🎵 Son', n: 'La bande originale (Cliff Martinez)', e: 'Une musique électronique sur un battement de synthétiseur répétitif, sec et lancinant (type stéthoscope / pulsation cardiaque).', i: 'La régularité mécanique percutée par la panique.', c: 'Groupe séparé en deux : le groupe A marche sur la pulsation exacte de la musique, de manière robotique et froide (robots / virus). Le groupe B évolue en contre-temps total, avec des mouvements saccadés, de fuite ou de déséquilibre (la panique).' }] },
    { n: 'Matrix · la multiplication de l\'agent Smith', a: 'Lana et Lilly Wachowski', d: 2003, p: 'Réplication mécanique et propagation ; ralentis (bullet time), murs invisibles.', t: [['Le personnage qui se multiplie', 'Contagion séquentielle : un geste repris par un, puis deux, puis tous'], ['Bullet time', 'Ralentis extrêmes, suspensions'], ['Murs invisibles', 'Blocages physiques, rebonds sur une paroi imaginaire']],
      c: 'Partez d\'un solo immobile au centre. Dès qu\'un danseur touche le sol, un autre se déclenche et reproduit le même geste : le groupe envahit l\'espace par contagion.' },
    { n: 'Un monde · l\'exclusion', a: 'Laura Wandel', d: 2021, p: 'Harcèlement, figure du bouc émissaire : encerclement, pression, effet de meute.', t: [['Le rejet / le cercle', 'Cercle hermétique (dos tournés, bloc compact) ; un élève tente d\'y entrer ou d\'en sortir'], ['La pression / l\'asphyxie', 'Le groupe resserre l\'espace autour d\'un élève (encerclement répétitif)'], ['L\'effet de meute', 'Le groupe imite et amplifie les gestes d\'un meneur ; la victime s\'effondre vers le sol']],
      c: 'À 5 contre 1 : le groupe forme un mur mobile qui se resserre. L\'élève au centre utilise glissés et esquives sans jamais toucher le groupe. Variante à 4 contre 1 : la masse impose un rythme lourd et répétitif, l\'élève seul tente d\'imposer un rythme fluide.' },
    { n: 'West Side Story', a: 'Robert Wise / Steven Spielberg', d: 1961, p: 'Dualité des bandes, affrontement, fuite.', t: [['Deux bandes', 'Deux groupes qui se défient en miroir'], ['La fuite', 'Courses, dispersion, cachettes']] },
    { n: 'Les Temps modernes', a: 'Charlie Chaplin', d: 1936, p: 'Déshumanisation, travail mécanique : gestuelle robotique, saccadée, synchronisée, puis dérèglement de la machine.', t: [['La chaîne de montage', 'Répéter le geste de serrer des boulons, corps-machine synchronisé'], ['Le corps qui continue seul', 'Répétition frénétique, automate, perte de contrôle'], ['Le dérèglement', 'La cadence s\'emballe : rupture (chute, saut, tournoiement)']],
      c: 'Créez une boucle de 3 gestes mécaniques très précis. Augmentez progressivement la vitesse jusqu\'à ce que le mouvement se dérègle et provoque une rupture (chute, saut, tournoiement).' },
    { n: 'Black Swan', a: 'Darren Aronofsky', d: 2010, p: 'Métamorphose et dualité : de la rigidité / perfection à la déconstruction / lâcher-prise ; le miroir, la double personnalité.', t: [['La perfection', 'Gestes précis, tenus, rigides'], ['Le double', 'Miroir à deux, l\'un déforme l\'autre'], ['Le lâcher-prise', 'Déconstruction, relâchement, amplitude']] },
    { n: 'La Peste', a: 'Albert Camus', d: 1947, p: 'Le déni (« un mauvais rêve qui va passer ») percuté par la réalité, le poids, la pesanteur.', t: [['Le déni', 'Marche suspendue, légère, aérienne'], ['La réalité', 'Effondrements subis, poids vers le sol']],
      c: 'Alternez une marche suspendue, aérienne (« le mauvais rêve »), et des effondrements subis au sol dès qu\'un signal sonore retentit.' },
    { n: 'Chronophotographies', a: 'Étienne-Jules Marey / Eadweard Muybridge', d: '1880s', p: 'Une seule photo décompose un saut ou une course en images superposées : décomposition du mouvement, ralenti.', t: [['Images superposées', 'Arrêts sur image successifs'], ['Les niveaux', 'Haut, moyen, bas']],
      c: 'Décomposez une chute ou un saut en 5 arrêts sur image successifs (travaillez les niveaux : haut, moyen, bas).' },
    { n: 'Le langage du cinéma', a: 'Grille de transposition d\'un film', d: '', p: 'Transposer les procédés du film en procédés chorégraphiques.', t: [['Bande-son / silence', 'Danser sur le tempo musical, puis dans le silence complet pour créer une gêne'], ['Cadrage (gros plan / plan large)', 'Solo / duo dans un petit espace, puis toute la salle par le groupe'], ['Montage (cut / ralenti)', 'Mouvements secs et ruptures soudaines, puis ralentis extrêmes (lenteur, poids)'], ['Flash-back', 'Rejouer une phrase à l\'envers ou au ralenti']] }
  ] },
  { cat: 'Danse (repères)', ic: '💃', L: [
    { n: 'Café Müller', a: 'Pina Bausch', d: 1978, p: 'Chaises, obstacles, chute / rattraper.', t: [['Les chaises', 'Contourner, écarter les obstacles'], ['Tomber / rattraper', 'Confiance, portés']] },
    { n: 'Danse serpentine', a: 'Loïe Fuller', d: 1892, p: 'Tissu, spirales, lumière.', t: [['Le tissu', 'Prolonger le geste avec un objet'], ['Spirales', 'Tourner, enrouler']] },
    { n: 'L\'Après-midi d\'un faune', a: 'Vaslav Nijinski', d: 1912, p: 'Profil, frise, lenteur.', t: [['La frise', 'Se déplacer de profil, à plat'], ['Lenteur', 'Gestes suspendus']] }
  ] },
  { cat: 'Thèmes', ic: '💡', L: [
    { n: 'La métamorphose', p: 'Se transformer progressivement.' }, { n: 'La liberté', p: 'Se libérer d\'une contrainte, ouvrir l\'espace.' },
    { n: 'La rencontre', p: 'S\'approcher, se découvrir, se quitter.' }, { n: 'La vitesse', p: 'Contrastes vite / lent, accélérations.' },
    { n: 'Le temps qui passe', p: 'Ralentir, répéter, vieillir, cycles.' }, { n: 'L\'enfermement', p: 'Espace réduit, murs invisibles.' },
    { n: 'La foule', p: 'Effet de masse, anonymat, individu dans le groupe.' }, { n: 'Les éléments', p: 'Eau, feu, vent, terre : qualités de mouvement.' }
  ] }
];

const daImgKey = id => 'danseImg_' + id;
/* Extrait précis d'une œuvre (vidéo, visuel, texte, son) + inducteur + consigne */
const daX = (x, dark) => `<div style="border-radius:12px;padding:10px 12px;${dark ? 'background:rgba(255,255,255,.1)' : 'border:1.5px solid var(--line)'}"><div style="font-weight:900">${x.ty} · ${esc(x.n)}</div>
  <div style="font-size:.84rem;margin-top:4px"><strong>L'extrait :</strong> ${esc(x.e)}</div><div style="font-size:.84rem;margin-top:2px"><strong>L'inducteur :</strong> ${esc(x.i)}</div>
  <div style="font-size:.86rem;margin-top:6px;padding:7px 9px;border-radius:9px;background:${dark ? 'rgba(255,255,255,.12)' : 'rgba(142,68,173,.1)'}">💬 <strong>Consigne :</strong> ${esc(x.c)}</div></div>`;

TOOL_IMPL.danse = function (el) {
  const D = () => { if (!DB.danse || typeof DB.danse !== 'object') DB.danse = {}; const d = DB.danse;
    d.cur = d.cur || { o: null, ind: [] }; d.cur.ind = d.cur.ind || []; d.cur.sup = d.cur.sup || []; d.cur.proc = d.cur.proc || [];
    d.fiches = d.fiches || []; d.vids = d.vids || []; d.custom = d.custom || []; d.nb = d.nb || { vis: 1, son: 1, cor: 1, rel: 1, sem: 1 }; d.np = d.np || { tps: 1, esp: 1, rel: 1, ene: 0 };
    d.bank = d.bank || {}; ['img', 'txt', 'vid', 'snd'].forEach(k => { d.bank[k] = d.bank[k] || []; }); d.bank.av = d.bank.av || {}; if (d.lv == null) d.lv = 0; return d; };
  let tab = 'oeuvre', oCat = 0, oOpen = null, undo = null, cmp = [null, null], vf = '', bt = 'img', sndStop = null, sndKey = '';
  const ok = n => !D().lv || daLv(n) === D().lv;
  const lvB = n => `<span class="da-lv ${daLv(n) === 2 ? 'l2' : ''}">N${daLv(n)}</span>`;
  const sndOff = () => { if (sndStop) { sndStop(); sndStop = null; sndKey = ''; } };
  if (!document.getElementById('da-css')) document.head.insertAdjacentHTML('beforeend', `<style id="da-css">
.da-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:2px}.da-tabs button{padding:10px 4px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.82rem;color:var(--text)}
.da-tabs button.on{background:var(--grad);color:#fff;border-color:transparent}
.da-cur{margin-top:12px;border-left:6px solid #8E44AD}
.da-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.da-chip{padding:7px 11px;border-radius:99px;border:1.5px solid var(--line);background:var(--card);font-weight:700;font-size:.84rem;color:var(--text);cursor:pointer}
.da-chip.on{color:#fff;border-color:transparent}
.da-cats{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-top:10px}.da-cats button{flex:0 0 auto;padding:8px 12px;border-radius:99px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.8rem;color:var(--text)}
.da-cats button.on{background:#8E44AD;color:#fff;border-color:transparent}
.da-o{margin-top:8px;padding:10px 12px;cursor:pointer}.da-o.sel{outline:3px solid #8E44AD;outline-offset:-3px}
.da-o b{display:block}.da-o .muted{font-size:.8rem}
.da-tr{width:100%;border-collapse:collapse;margin-top:8px;font-size:.85rem}.da-tr td{padding:6px 4px;border-top:1px solid var(--line);vertical-align:top}.da-tr td:first-child{font-weight:800;width:40%}
.da-card{border-radius:16px;padding:12px 14px;color:#fff;margin-top:8px;position:relative}
.da-card small{display:block;padding-right:40px;font-weight:800;opacity:.9;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em}
.da-card b{display:block;font-size:1.25rem;margin-top:2px}
.da-card .lk{position:absolute;top:8px;right:10px;background:rgba(255,255,255,.25);border:0;color:#fff;border-radius:10px;padding:5px 8px;font-size:.9rem}
.da-nb{display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center;margin-top:6px;font-size:.88rem;font-weight:700}
.da-nb .seg{display:flex;gap:4px}.da-nb .seg button{width:34px;padding:6px 0;border-radius:9px;border:1.5px solid var(--line);background:var(--card);font-weight:800;color:var(--text)}.da-nb .seg button.on{background:var(--navy,#0B2A5B);color:#fff;border-color:transparent}
.da-vg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
@media (max-width:620px){.da-vg{grid-template-columns:1fr}}
.da-vg video{width:100%;max-height:52vh;background:#000;border-radius:12px;display:block}
.da-v{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid var(--line)}
.da-ov{position:fixed;inset:0;z-index:320;background:#0E1A33;color:#fff;overflow:auto;padding:18px}
.da-ov h1{font-size:clamp(1.6rem,5vw,2.6rem);margin:6px 0}
.da-tabs{grid-template-columns:repeat(3,1fr)}
.da-lv{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:6px;font-size:.66rem;font-weight:900;background:#1B9E5A;color:#fff;vertical-align:middle}.da-lv.l2{background:#D64545}
.da-lvs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}.da-lvs button{padding:8px 4px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);font-weight:800;font-size:.78rem;color:var(--text)}
.da-lvs button.on{background:var(--navy,#0B2A5B);color:#fff;border-color:transparent}
.da-bg{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-top:10px}
.da-bi{padding:10px;display:flex;flex-direction:column;gap:6px}.da-bi .muted{font-size:.8rem}
.da-bi.on{outline:3px solid #8E44AD;outline-offset:-3px}
.da-txt{white-space:pre-line;font-family:Georgia,'Times New Roman',serif;font-size:.95rem;line-height:1.45;padding:8px 10px;border-left:4px solid #8E44AD;background:rgba(142,68,173,.06);border-radius:8px}
.da-pr{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-top:1px solid var(--line);cursor:pointer}.da-pr .em{font-size:1.5rem;line-height:1}.da-pr b{display:block}
.da-pr.on b{color:var(--c)}.da-pr .ck{margin-left:auto;font-size:1.2rem}
.da-ov .da-txt{font-size:1.3rem;color:#fff;background:rgba(255,255,255,.08)}
</style>`);
  const commit = () => { save(); window.syncFlush && window.syncFlush(); };
  const allO = () => [...DA_OEU, { cat: 'Mes œuvres', ic: '⭐', L: D().custom }];
  const famOf = k => DA_IND.find(f => f.k === k) || DA_IND[0];
  const prOf = k => DA_PROC.find(f => f.k === k) || DA_PROC[0];
  const indChip = x => { const f = famOf(x.f); return `<span class="da-chip on" style="background:${f.c}">${x.e || f.ic} ${esc(x.t)}</span>`; };
  const prChip = x => { const f = prOf(x.f); return `<span class="da-chip on" style="background:${f.c}">${x.e || f.ic} ${esc(x.t)}</span>`; };
  /* Supports de la banque : { ty: img|txt|vid|snd, k } → { n, html (aperçu), big (grand) } */
  const supOf = s => { const d = D();
    if (s.ty === 'img') { if (s.k.startsWith('svg:')) { const x = DA_SVG.find(y => y.k === s.k.slice(4)); return x && { n: x.n, c: x.c, html: x.s }; }
      if (s.k.startsWith('art:')) { const a = DA_ART[+s.k.slice(4)], im = DB[daImgKey('art' + s.k.slice(4))]; return a && { n: a[0] + ' · ' + a[1], c: a[2], html: im ? `<img src="${im}" style="width:100%;border-radius:10px">` : '' }; }
      const m = d.bank.img.find(y => y.id === s.k.slice(3)), im = m && DB[daImgKey(m.id)]; return m && { n: m.n, c: m.c, html: im ? `<img src="${im}" style="width:100%;border-radius:10px">` : '' }; }
    if (s.ty === 'txt') { const x = s.k.startsWith('txt:') ? DA_TXT[+s.k.slice(4)] : d.bank.txt.find(y => y.id === s.k.slice(3)); return x && { n: x.n + (x.a ? ' · ' + x.a : ''), c: x.c, html: `<div class="da-txt">${esc(x.t)}</div>` }; }
    if (s.ty === 'vid') { const x = s.k.startsWith('vid:') ? DA_VID[+s.k.slice(4)] : null, m = !x && d.bank.vid.find(y => y.id === s.k.slice(3)); return x ? { n: x[0], c: x[2], vid: d.bank.av[s.k] } : m && { n: m.n, c: m.c, vid: m.id, url: m.url }; }
    if (s.ty === 'snd') { const x = s.k.startsWith('snd:') ? DA_SND.find(y => y[0] === s.k.slice(4)) : null, m = !x && d.bank.snd.find(y => y.id === s.k.slice(3)); return x ? { n: x[1] + ' ' + x[2], c: x[3], gen: x[0] } : m && { n: '🎵 ' + m.n, c: m.c, aud: m.id }; }
    return null; };
  const supChip = s => { const x = supOf(s); return x ? `<span class="da-chip on" style="background:#5B6782">${{ img: '🖼️', txt: '📖', vid: '🎬', snd: '🎵' }[s.ty]} ${esc(x.n)}</span>` : ''; };
  const hasSup = (ty, k) => D().cur.sup.some(s => s.ty === ty && s.k === k);
  const togSup = (ty, k) => { const C = D().cur, i = C.sup.findIndex(s => s.ty === ty && s.k === k); snapCur(i >= 0 ? 'support retiré' : 'support ajouté'); if (i >= 0) C.sup.splice(i, 1); else C.sup.push({ ty, k }); commit(); toast(i >= 0 ? 'Retiré du projet' : 'Ajouté au projet ✔'); };
  const playSnd = (k, btn) => { if (sndKey === k) { sndOff(); return false; } sndOff(); sndStop = daSound(k); sndKey = k; return true; };
  const playAud = async id => { const u = await epsVidUrl(id); if (!u) return toast('Son enregistré sur une autre tablette'); sndOff(); const a = new Audio(u); a.loop = true; a.play().catch(() => {}); sndStop = () => a.pause(); sndKey = 'a:' + id; };
  const oLine = o => o ? `${esc(o.n)}${o.a ? ' · ' + esc(o.a) : ''}${o.d ? ' (' + esc(String(o.d)) + ')' : ''}` : '';
  const curCard = () => { const C = D().cur, o = C.o, img = o && o.img ? DB[daImgKey(o.img)] : null;
    return `<div class="card da-cur"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div><small class="muted" style="font-weight:800">🎬 PROJET EN COURS</small>
        <div style="font-weight:900;font-size:1.05rem;margin-top:2px">${o ? oLine(o) : '<span class="muted">Aucune œuvre / thème choisi</span>'}</div>${o && o.p ? `<div class="muted" style="font-size:.82rem">${esc(o.p)}</div>` : ''}</div>
        ${img ? `<img src="${img}" data-zi style="width:70px;height:70px;object-fit:cover;border-radius:10px;cursor:zoom-in">` : ''}</div>
      ${C.sup.length ? `<div class="da-chips">${C.sup.map(supChip).join('')}</div>` : ''}
      <div class="da-chips">${C.ind.length ? C.ind.map(indChip).join('') : '<span class="muted" style="font-size:.82rem">Aucun inducteur</span>'}</div>
      ${C.proc.length ? `<div class="da-chips">${C.proc.map(prChip).join('')}</div>` : ''}
      <div class="row" style="margin-top:10px;gap:6px"><button class="btn btn-grad" style="padding:9px" id="da-big">📺 Afficher en grand</button><button class="btn btn-ghost" style="padding:9px" id="da-sv">💾 Enregistrer pour un groupe</button></div>
      ${undo ? `<button class="btn btn-ghost btn-block" style="margin-top:6px;padding:8px" id="da-undo">↶ Annuler : ${esc(undo.l)}</button>` : ''}</div>`; };
  const snapCur = l => { undo = { l, v: JSON.stringify(D().cur) }; };

  function frame() {
    el.innerHTML = `<div class="da-tabs">${[['oeuvre', '🎨 Œuvre / thème'], ['banque', '🗂️ Banque'], ['ind', '🎲 Inducteurs'], ['proc', '🧩 Procédés'], ['fiches', '📋 Groupes'], ['video', '🎬 Vidéo']].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      ${['oeuvre', 'banque', 'ind', 'proc'].includes(tab) ? `<div class="da-lvs">${[[0, 'Tous les niveaux'], [1, '🟢 Niveau 1 · basiques'], [2, '🔴 Niveau 2 · plus complexes']].map(([v, l]) => `<button data-lvl="${v}" class="${D().lv === v ? 'on' : ''}">${l}</button>`).join('')}</div>${curCard()}` : ''}<div id="da-b"></div>`;
    el.querySelectorAll('[data-lvl]').forEach(b => b.onclick = () => { D().lv = +b.dataset.lvl; commit(); frame(); });
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { sndOff(); tab = b.dataset.tab; frame(); });
    const $ = q => el.querySelector(q);
    if ($('#da-big')) $('#da-big').onclick = () => big(D().cur);
    if ($('#da-sv')) $('#da-sv').onclick = saveFiche;
    if ($('#da-undo')) $('#da-undo').onclick = () => { D().cur = JSON.parse(undo.v); undo = null; commit(); frame(); };
    if ($('[data-zi]')) $('[data-zi]').onclick = e => acroZoom(e.target.src);
    ({ oeuvre: tabO, banque: tabB, ind: tabI, proc: tabP, fiches: tabF, video: tabV })[tab](el.querySelector('#da-b'));
  }

  /* ---------- 🎨 Œuvre / thème ---------- */
  function tabO(box) {
    const A = allO(), cat = A[oCat] || A[0], C = D().cur;
    box.innerHTML = `<div class="da-cats">${A.map((c, i) => `<button data-oc="${i}" class="${i === oCat ? 'on' : ''}">${c.ic} ${esc(c.cat)}${c.cat === 'Mes œuvres' ? ` (${c.L.length})` : ''}</button>`).join('')}</div>
      <button class="btn btn-ghost btn-block" style="margin-top:8px" id="da-ro">🎲 Œuvre ou thème au hasard (${esc(cat.cat)})</button>
      ${cat.L.map((o, i) => { if (cat.cat !== 'Mes œuvres' && !ok(o.n)) return ''; const on = C.o && C.o.n === o.n, op = oOpen === oCat + '|' + i, img = o.img ? DB[daImgKey(o.img)] : null;
        return `<div class="card da-o ${on ? 'sel' : ''}" data-oi="${i}"><div style="display:flex;gap:10px;align-items:flex-start">${img ? `<img src="${img}" style="width:56px;height:56px;object-fit:cover;border-radius:8px">` : ''}<div style="flex:1;min-width:0"><b>${on ? '✔ ' : ''}${esc(o.n)}${cat.cat !== 'Mes œuvres' ? lvB(o.n) : ''}</b><div class="muted">${[o.a, o.d].filter(Boolean).map(esc).join(' · ')}</div><div style="font-size:.84rem;margin-top:3px">${esc(o.p || '')}</div></div></div>
          ${op && (o.x || []).length ? `<div style="margin-top:8px;display:grid;gap:6px">${o.x.map(x => daX(x)).join('')}</div>` : ''}
          ${op && o.c ? `<div style="margin-top:8px;font-size:.85rem;padding:8px 10px;border-radius:10px;background:rgba(142,68,173,.1)">💬 <strong>Consigne :</strong> ${esc(o.c)}</div>` : ''}
          ${op && (o.t || []).length ? `<table class="da-tr"><tr><td class="muted">Élément de l'œuvre</td><td class="muted" style="font-weight:800">Consigne de mouvement</td></tr>${o.t.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</table>` : ''}
          <div class="row" style="margin-top:8px;gap:6px">${(o.t || []).length || o.c || (o.x || []).length ? `<button class="btn btn-ghost" style="padding:7px" data-ot="${i}">${op ? '▴ Masquer' : (o.x || []).length ? '▾ Extraits & transposition' : '▾ Transposition'}</button>` : ''}<button class="btn ${on ? 'btn-ghost' : 'btn-grad'}" style="padding:7px" data-os="${i}">${on ? '✕ Retirer' : '✔ Choisir'}</button>${cat.cat === 'Mes œuvres' ? `<button class="btn btn-ghost" style="padding:7px" data-cx="${i}">🗑</button>` : ''}</div></div>`; }).join('') || '<div class="card empty" style="margin-top:8px">Aucune œuvre ajoutée.</div>'}
      <details class="card" style="margin-top:12px" ${cat.cat === 'Mes œuvres' && !cat.L.length ? 'open' : ''}><summary style="font-weight:800;cursor:pointer">＋ Ajouter une œuvre / un thème</summary>
        <label>Titre</label><input id="da-cn" placeholder="Ex. : Les Nymphéas">
        <div class="row"><div><label>Auteur</label><input id="da-ca"></div><div><label>Date</label><input id="da-cd"></div></div>
        <label>Pistes de mouvement</label><textarea id="da-cp" style="min-height:60px" placeholder="Ex. : reflets, flottement, lenteur"></textarea>
        <label>Consigne type (facultatif)</label><textarea id="da-cc" style="min-height:50px"></textarea>
        <label>Transposition (une ligne par élément : élément = consigne)</label><textarea id="da-ct" style="min-height:70px" placeholder="Nénuphars = îlots, regroupements&#10;Reflets dans l'eau = miroir à deux"></textarea>
        <label class="btn btn-ghost" style="display:block;text-align:center;cursor:pointer;margin-top:10px">📷 Photo de l'œuvre (facultatif)<input id="da-ci" type="file" accept="image/*" style="display:none"></label><div class="muted" id="da-cim" style="font-size:.78rem"></div>
        <button class="btn btn-grad btn-block" style="margin-top:10px" id="da-cs">💾 Ajouter et choisir</button></details>`;
    const $ = q => box.querySelector(q); let photo = null;
    box.querySelectorAll('[data-oc]').forEach(b => b.onclick = () => { oCat = +b.dataset.oc; oOpen = null; tabO(box); });
    box.querySelectorAll('[data-ot]').forEach(b => b.onclick = () => { const k = oCat + '|' + b.dataset.ot; oOpen = oOpen === k ? null : k; tabO(box); });
    const pickO = o => { snapCur('œuvre / thème'); D().cur.o = o ? { n: o.n, a: o.a || '', d: o.d || '', p: o.p || '', t: o.t || [], c: o.c || '', x: o.x || [], img: o.img || null } : null; commit(); frame(); };
    box.querySelectorAll('[data-os]').forEach(b => b.onclick = () => { const o = cat.L[+b.dataset.os]; pickO(C.o && C.o.n === o.n ? null : o); });
    $('#da-ro').onclick = () => { const L = cat.L.filter(o => cat.cat === 'Mes œuvres' || ok(o.n)); if (!L.length) return toast('Aucune œuvre dans cette catégorie'); const o = L[Math.floor(Math.random() * L.length)]; pickO(o); toast('🎲 ' + o.n); };
    box.querySelectorAll('[data-cx]').forEach(b => b.onclick = () => { const o = cat.L[+b.dataset.cx]; if (!confirm(`Supprimer « ${o.n} » de mes œuvres ?`)) return; D().custom.splice(+b.dataset.cx, 1); if (o.img) DB[daImgKey(o.img)] = null; commit(); tabO(box); });
    $('#da-ci').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { photo = await acroPhoto(f); $('#da-cim').textContent = 'Photo prête ✔'; } catch (er) { toast(er.message); } };
    $('#da-cs').onclick = () => { const n = $('#da-cn').value.trim(); if (!n) return toast('Indiquez le titre');
      const t = $('#da-ct').value.split('\n').map(l => l.split(/\s*[=:→]\s*/)).filter(x => x[0] && x[0].trim()).map(([a, ...b]) => [a.trim(), b.join(' ').trim()]);
      const o = { n, a: $('#da-ca').value.trim(), d: $('#da-cd').value.trim(), p: $('#da-cp').value.trim(), c: $('#da-cc').value.trim(), t };
      if (photo) { o.img = Date.now().toString(36); DB[daImgKey(o.img)] = photo; }
      D().custom.push(o); oCat = allO().length - 1; pickO(o); };
  }

  /* ---------- 🎲 Inducteurs (formulés pour les élèves) ---------- */
  const rollBox = (title, F, nb, attr) => `<div class="card" style="margin-top:12px"><b>${title}</b><div class="muted" style="font-size:.8rem">Combien par famille, puis « Tirer ». 🔒 sur une carte = gardée au prochain tirage.</div>
      ${F.map(f => `<div class="da-nb"><span>${f.ic} ${f.n}</span><div class="seg">${[0, 1, 2, 3].map(n => `<button ${attr}="${f.k}|${n}" class="${(nb[f.k] ?? 1) === n ? 'on' : ''}">${n}</button>`).join('')}</div></div>`).join('')}`;
  const bigCards = (L, fam, lkAttr) => L.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px">${L.map((x, i) => { const f = fam(x.f); return `<div class="da-card" style="background:${f.c}"><small>${f.ic} ${f.n}</small><b><span style="font-size:1.6rem">${x.e || ''}</span> ${esc(x.t)}</b>${x.s ? `<div style="font-size:.82rem;opacity:.92;margin-top:4px">${esc(x.s)}</div>` : ''}${lkAttr ? `<button class="lk" ${lkAttr}="${i}">${x.lock ? '🔒' : '🔓'}</button>` : ''}</div>`; }).join('')}</div>` : '';
  function tabI(box) {
    const d = D(), C = d.cur, has = (f, t) => C.ind.some(x => x.f === f && x.t === t);
    box.innerHTML = `${rollBox('🎲 Tirer au sort des inducteurs', DA_IND, d.nb, 'data-nb')}
        <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="da-roll">🎲 Tirer au sort</button>${C.ind.length ? '<button class="btn btn-ghost" id="da-clr">🗑 Tout retirer</button>' : ''}</div></div>
      ${bigCards(C.ind, famOf, 'data-lk')}
      <div class="section-title"><h2>Choisir à la main</h2></div>
      ${DA_IND.map(f => `<details class="card" style="margin-top:8px;border-left:6px solid ${f.c}"><summary style="font-weight:800;cursor:pointer">${f.ic} ${f.n} <span class="muted" style="font-size:.8rem">(${C.ind.filter(x => x.f === f.k).length})</span></summary>
        ${f.g.map(([g, L]) => `<div class="muted" style="font-size:.75rem;font-weight:800;margin-top:8px">${esc(g)}</div><div class="da-chips" style="margin-top:4px"> ${L.filter(([, t]) => ok(t)).map(([e, t]) => `<span class="da-chip ${has(f.k, t) ? 'on' : ''}" style="${has(f.k, t) ? 'background:' + f.c : ''}" data-ip="${f.k}|${esc(g)}|${esc(t)}|${e}">${e} ${esc(t)}${D().lv ? '' : lvB(t)}</span>`).join('')}</div>`).join('')}
        <div class="row" style="margin-top:8px;gap:6px"><input data-iadd="${f.k}" placeholder="Autre inducteur…" style="flex:2"><button class="btn btn-ghost" style="padding:8px" data-iok="${f.k}">＋</button></div>
        <p class="muted" style="font-size:.8rem;margin:8px 0 0">💬 Exemple : ${esc(f.ex)}</p></details>`).join('')}`;
    const $ = q => box.querySelector(q);
    box.querySelectorAll('[data-nb]').forEach(b => b.onclick = () => { const [k, n] = b.dataset.nb.split('|'); d.nb[k] = +n; commit(); tabI(box); });
    $('#da-roll').onclick = () => { snapCur('tirage'); const keep = C.ind.filter(x => x.lock), out = [...keep];
      DA_IND.forEach(f => { const want = d.nb[f.k] ?? 1, have = keep.filter(x => x.f === f.k).length; const pool = f.g.flatMap(([g, L]) => L.filter(([, t]) => ok(t)).map(([e, t]) => ({ f: f.k, g, t, e }))).filter(x => !out.some(y => y.f === x.f && y.t === x.t));
        for (let i = have; i < want && pool.length; i++) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); });
      C.ind = out; commit(); frame(); };
    if ($('#da-clr')) $('#da-clr').onclick = () => { snapCur('inducteurs retirés'); C.ind = []; commit(); frame(); };
    box.querySelectorAll('[data-lk]').forEach(b => b.onclick = () => { const x = C.ind[+b.dataset.lk]; x.lock = !x.lock; commit(); tabI(box); });
    box.querySelectorAll('[data-ip]').forEach(c => c.onclick = () => { const [f, g, t, e] = c.dataset.ip.split('|'); const i = C.ind.findIndex(x => x.f === f && x.t === t);
      if (i >= 0) C.ind.splice(i, 1); else C.ind.push({ f, g, t, e }); commit(); const op = [...box.querySelectorAll('details')].map(x => x.open); frame(); el.querySelectorAll('#da-b details').forEach((x, k) => { x.open = op[k]; }); });
    box.querySelectorAll('[data-iok]').forEach(b => b.onclick = () => { const f = b.dataset.iok, inp = box.querySelector(`[data-iadd="${f}"]`), t = inp.value.trim(); if (!t) return; C.ind.push({ f, g: 'Perso', t, e: '✏️' }); commit(); frame(); });
  }

  /* ---------- 🧩 Procédés de composition ---------- */
  function tabP(box) {
    const d = D(), C = d.cur, has = t => C.proc.some(x => x.t === t);
    box.innerHTML = `${rollBox('🎲 Tirer au sort des procédés', DA_PROC, d.np, 'data-np')}
        <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="da-proll">🎲 Tirer au sort</button>${C.proc.length ? '<button class="btn btn-ghost" id="da-pclr">🗑 Tout retirer</button>' : ''}</div></div>
      ${bigCards(C.proc, prOf, 'data-plk')}
      <div class="section-title"><h2>Les procédés pour composer</h2></div>
      ${DA_PROC.map(f => `<div class="card" style="margin-top:8px;border-left:6px solid ${f.c}"><b>${f.ic} ${f.n}</b>
        ${f.L.filter(y => ok(y[1])).map(([e, t, x]) => `<div class="da-pr ${has(t) ? 'on' : ''}" style="--c:${f.c}" data-pp="${f.k}|${esc(t)}"><span class="em">${e}</span><div><b>${esc(t)}${lvB(t)}</b><div class="muted" style="font-size:.84rem">${esc(x)}</div></div><span class="ck">${has(t) ? '✅' : '＋'}</span></div>`).join('')}</div>`).join('')}`;
    const $ = q => box.querySelector(q), find = (k, t) => { const f = prOf(k), it = f.L.find(y => y[1] === t); return { f: k, e: it[0], t, s: it[2] }; };
    box.querySelectorAll('[data-np]').forEach(b => b.onclick = () => { const [k, n] = b.dataset.np.split('|'); d.np[k] = +n; commit(); tabP(box); });
    $('#da-proll').onclick = () => { snapCur('tirage des procédés'); const keep = C.proc.filter(x => x.lock), out = [...keep];
      DA_PROC.forEach(f => { const want = d.np[f.k] ?? 1, have = keep.filter(x => x.f === f.k).length, pool = f.L.filter(y => ok(y[1]) && !out.some(z => z.t === y[1]));
        for (let i = have; i < want && pool.length; i++) out.push(find(f.k, pool.splice(Math.floor(Math.random() * pool.length), 1)[0][1])); });
      C.proc = out; commit(); frame(); };
    if ($('#da-pclr')) $('#da-pclr').onclick = () => { snapCur('procédés retirés'); C.proc = []; commit(); frame(); };
    box.querySelectorAll('[data-plk]').forEach(b => b.onclick = () => { const x = C.proc[+b.dataset.plk]; x.lock = !x.lock; commit(); tabP(box); });
    box.querySelectorAll('[data-pp]').forEach(r => r.onclick = () => { const [k, t] = r.dataset.pp.split('|'), i = C.proc.findIndex(x => x.t === t); if (i >= 0) C.proc.splice(i, 1); else C.proc.push(find(k, t)); commit(); const y = window.scrollY; frame(); });
  }

  /* ---------- 🗂️ Banque : images, textes, extraits vidéo, sons ---------- */
  function tabB(box) {
    const d = D(), B = d.bank, add = (ty, k, on) => `<button class="btn ${on ? 'btn-ghost' : 'btn-grad'}" style="padding:7px" data-sup="${ty}|${k}">${on ? '✕ Retirer du projet' : '➕ Au projet'}</button>`;
    const q = s => encodeURIComponent(s), card = (ty, k, inner) => `<div class="card da-bi ${hasSup(ty, k) ? 'on' : ''}">${inner}<div class="row" style="gap:6px">${add(ty, k, hasSup(ty, k))}</div></div>`;
    let body = '';
    if (bt === 'img') body = `<div class="section-title"><h2>Images à danser</h2><span class="muted" style="font-size:.75rem">dessinées pour l'appli</span></div>
      <div class="da-bg">${DA_SVG.filter(x => ok(x.k)).map(x => card('img', 'svg:' + x.k, `${x.s}<b>${esc(x.n)}${lvB(x.k)}</b><div class="muted">${esc(x.c)}</div><button class="btn btn-ghost" style="padding:6px" data-zsvg="${x.k}">🔍 En grand</button>`)).join('')}</div>
      <div class="section-title"><h2>Œuvres célèbres</h2></div><p class="muted" style="font-size:.78rem;margin:0 2px">« 🔎 Voir l'œuvre » ouvre une recherche d'images ; enregistrez l'image puis « 📷 Ajouter l'image » pour l'avoir dans l'appli (vous la projetez ensuite en grand).</p>
      <div class="da-bg">${DA_ART.map((a, i) => { if (!ok(a[0])) return ''; const im = DB[daImgKey('art' + i)]; return card('img', 'art:' + i, `${im ? `<img src="${im}" style="width:100%;border-radius:10px">` : ''}<b>${esc(a[0])}${lvB(a[0])}</b><div class="muted">${esc(a[1])}</div><div style="font-size:.82rem">${esc(a[2])}</div>
        <div class="row" style="gap:6px"><a class="btn btn-ghost" style="padding:6px;text-align:center" href="https://www.google.com/search?tbm=isch&q=${q(a[0] + ' ' + a[1])}" target="_blank" rel="noopener">🔎 Voir l'œuvre</a><label class="btn btn-ghost" style="padding:6px;text-align:center;margin:0;cursor:pointer">📷 ${im ? 'Changer' : 'Ajouter l\'image'}<input type="file" accept="image/*" data-artimg="${i}" style="display:none"></label></div>`); }).join('')}</div>
      <div class="section-title"><h2>Mes images (${B.img.length})</h2></div>
      <div class="da-bg">${B.img.map(m => { const im = DB[daImgKey(m.id)]; return card('img', 'my' + m.id.slice(0, 0) + ':' + m.id, `${im ? `<img src="${im}" style="width:100%;border-radius:10px">` : ''}<b>${esc(m.n)}</b><div class="muted">${esc(m.c || '')}</div><button class="btn btn-ghost" style="padding:6px" data-bx="img|${m.id}">🗑 Supprimer</button>`); }).join('')}</div>
      <div class="card" style="margin-top:10px"><b>＋ Ajouter une image</b><input id="bn" placeholder="Titre" style="margin-top:6px"><input id="bc" placeholder="Consigne / piste de mouvement" style="margin-top:6px"><label class="btn btn-grad" style="display:block;text-align:center;cursor:pointer;margin-top:8px">📷 Choisir l'image<input id="bf" type="file" accept="image/*" style="display:none"></label></div>`;
    if (bt === 'txt') body = `<div class="da-bg" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">${DA_TXT.map((x, i) => !ok(x.n) ? '' : card('txt', 'txt:' + i, `<b>📖 ${esc(x.n)}${lvB(x.n)}</b><div class="muted">${esc(x.a)}</div><div class="da-txt">${esc(x.t)}</div><div style="font-size:.84rem">💬 ${esc(x.c)}</div>`)).join('')}
        ${B.txt.map(x => card('txt', 'my:' + x.id, `<b>📖 ${esc(x.n)}</b><div class="muted">${esc(x.a || '')}</div><div class="da-txt">${esc(x.t)}</div>${x.c ? `<div style="font-size:.84rem">💬 ${esc(x.c)}</div>` : ''}<button class="btn btn-ghost" style="padding:6px" data-bx="txt|${x.id}">🗑 Supprimer</button>`)).join('')}</div>
      <div class="card" style="margin-top:10px"><b>＋ Ajouter un texte</b><input id="bn" placeholder="Titre" style="margin-top:6px"><input id="ba" placeholder="Auteur" style="margin-top:6px"><textarea id="bt" placeholder="Le texte (poème, extrait, citation…)" style="min-height:90px;margin-top:6px"></textarea><input id="bc" placeholder="Consigne pour les élèves" style="margin-top:6px"><button class="btn btn-grad btn-block" style="margin-top:8px" id="bok">💾 Ajouter</button></div>`;
    if (bt === 'vid') body = `<p class="muted" style="font-size:.78rem;margin:10px 2px 0">« ▶ Trouver l'extrait » ouvre une recherche de la vidéo. Vous pouvez aussi joindre votre propre fichier vidéo de l'extrait (gardé sur cette tablette).</p>
      <div class="da-bg">${DA_VID.map((x, i) => { if (!ok(x[0])) return ''; const k = 'vid:' + i, own = d.bank.av[k]; return card('vid', k, `<b>🎬 ${esc(x[0])}${lvB(x[0])}</b><div style="font-size:.84rem">💬 ${esc(x[2])}</div>
        <div class="row" style="gap:6px"><a class="btn btn-ghost" style="padding:6px;text-align:center" href="https://www.youtube.com/results?search_query=${q(x[1])}" target="_blank" rel="noopener">▶ Trouver l'extrait</a><label class="btn btn-ghost" style="padding:6px;text-align:center;margin:0;cursor:pointer">📎 ${own ? 'Changer' : 'Ma vidéo'}<input type="file" accept="video/*" data-avid="${k}" style="display:none"></label>${own ? `<button class="btn btn-ghost" style="padding:6px" data-pv="${own}">▶ Lire</button>` : ''}</div>`); }).join('')}
        ${B.vid.map(m => card('vid', 'my:' + m.id, `<b>🎬 ${esc(m.n)}</b>${m.c ? `<div style="font-size:.84rem">💬 ${esc(m.c)}</div>` : ''}<div class="row" style="gap:6px">${m.url ? `<a class="btn btn-ghost" style="padding:6px;text-align:center" href="${esc(m.url)}" target="_blank" rel="noopener">▶ Ouvrir le lien</a>` : `<button class="btn btn-ghost" style="padding:6px" data-pv="${m.id}">▶ Lire</button>`}<button class="btn btn-ghost" style="padding:6px" data-bx="vid|${m.id}">🗑</button></div>`)).join('')}</div>
      <div class="card" style="margin-top:10px"><b>＋ Ajouter un extrait vidéo</b><input id="bn" placeholder="Titre (ex. : Pina Bausch, la chute)" style="margin-top:6px"><input id="bc" placeholder="Consigne pour les élèves" style="margin-top:6px"><input id="bu" placeholder="Lien (YouTube, ENT…) — ou fichier ci-dessous" inputmode="url" autocapitalize="off" style="margin-top:6px">
        <div class="row" style="margin-top:8px;gap:6px"><button class="btn btn-grad" id="bok">💾 Ajouter le lien</button><label class="btn btn-ghost" style="text-align:center;margin:0;cursor:pointer">🎬 Fichier vidéo<input id="bf" type="file" accept="video/*" style="display:none"></label></div></div>`;
    if (bt === 'snd') body = `<p class="muted" style="font-size:.78rem;margin:10px 2px 0">Sons créés par l'appli (aucun fichier, fonctionne sans connexion). Touchez ▶ pour écouter, ⏹ pour arrêter.</p>
      <div class="da-bg">${DA_SND.filter(x => ok(x[0])).map(([k, e, n, c]) => card('snd', 'snd:' + k, `<b style="font-size:1.05rem">${e} ${esc(n)}${lvB(k)}</b><div style="font-size:.84rem">💬 ${esc(c)}</div><button class="btn ${sndKey === k ? 'btn-grad' : 'btn-ghost'}" style="padding:7px" data-snd="${k}">${sndKey === k ? '⏹ Arrêter' : '▶ Écouter'}</button>`)).join('')}
        ${B.snd.map(m => card('snd', 'my:' + m.id, `<b>🎵 ${esc(m.n)}</b>${m.c ? `<div style="font-size:.84rem">💬 ${esc(m.c)}</div>` : ''}<div class="row" style="gap:6px"><button class="btn ${sndKey === 'a:' + m.id ? 'btn-grad' : 'btn-ghost'}" style="padding:6px" data-aud="${m.id}">${sndKey === 'a:' + m.id ? '⏹ Arrêter' : '▶ Écouter'}</button><button class="btn btn-ghost" style="padding:6px" data-bx="snd|${m.id}">🗑</button></div>`)).join('')}</div>
      <div class="card" style="margin-top:10px"><b>＋ Ajouter un son ou une musique</b><input id="bn" placeholder="Titre" style="margin-top:6px"><input id="bc" placeholder="Consigne pour les élèves" style="margin-top:6px"><label class="btn btn-grad" style="display:block;text-align:center;cursor:pointer;margin-top:8px">🎵 Choisir le fichier audio<input id="bf" type="file" accept="audio/*" style="display:none"></label><p class="muted" style="font-size:.75rem;margin:6px 0 0">Gardé sur cette tablette.</p></div>`;
    box.innerHTML = `<div class="da-cats">${[['img', '🖼️ Images'], ['txt', '📖 Textes'], ['vid', '🎬 Vidéos'], ['snd', '🎵 Sons']].map(([k, l]) => `<button data-bt="${k}" class="${bt === k ? 'on' : ''}">${l}</button>`).join('')}</div>${body}`;
    const $ = s => box.querySelector(s), val = s => ($(s) ? $(s).value.trim() : ''), id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    box.querySelectorAll('[data-bt]').forEach(b => b.onclick = () => { sndOff(); bt = b.dataset.bt; tabB(box); });
    box.querySelectorAll('[data-sup]').forEach(b => b.onclick = () => { const [ty, ...k] = b.dataset.sup.split('|'); togSup(ty, k.join('|')); frame(); });
    box.querySelectorAll('[data-zsvg]').forEach(b => b.onclick = () => { const x = DA_SVG.find(y => y.k === b.dataset.zsvg); big({ o: null, ind: [], sup: [{ ty: 'img', k: 'svg:' + x.k }], proc: [] }); });
    box.querySelectorAll('[data-artimg]').forEach(i => i.onchange = async e => { const f = e.target.files[0]; if (!f) return; try { DB[daImgKey('art' + i.dataset.artimg)] = await acroPhoto(f); commit(); tabB(box); } catch (er) { toast(er.message); } });
    box.querySelectorAll('[data-bx]').forEach(b => b.onclick = () => { const [ty, i2] = b.dataset.bx.split('|'), L = B[ty], m = L.find(x => x.id === i2); if (!m || !confirm(`Supprimer « ${m.n} » de la banque ?`)) return;
      B[ty] = L.filter(x => x.id !== i2); if (ty === 'img') DB[daImgKey(i2)] = null; if ((ty === 'vid' && !m.url) || ty === 'snd') epsVidDel(i2); d.cur.sup = d.cur.sup.filter(s => !(s.ty === ty && s.k === 'my:' + i2)); commit(); tabB(box); });
    box.querySelectorAll('[data-snd]').forEach(b => b.onclick = () => { playSnd(b.dataset.snd); tabB(box); });
    box.querySelectorAll('[data-aud]').forEach(b => b.onclick = async () => { if (sndKey === 'a:' + b.dataset.aud) sndOff(); else await playAud(b.dataset.aud); tabB(box); });
    box.querySelectorAll('[data-pv]').forEach(b => b.onclick = async () => { const u = await epsVidUrl(b.dataset.pv); u ? epsVidPlay(u) : toast('Vidéo enregistrée sur une autre tablette'); });
    box.querySelectorAll('[data-avid]').forEach(i => i.onchange = async e => { const f = e.target.files[0]; if (!f) return; const k = i.dataset.avid, vid = d.bank.av[k] || 'dav' + id(); toast('🎬 Enregistrement…');
      try { await epsVidPut(vid, f); d.bank.av[k] = vid; commit(); toast('Vidéo jointe ✔ (sur cette tablette)'); tabB(box); } catch (er) { toast('Impossible : ' + (er.message || 'espace insuffisant')); } });
    if ($('#bf')) $('#bf').onchange = async e => { const f = e.target.files[0]; if (!f) return; const n = val('#bn') || f.name.replace(/\.[^.]+$/, ''), c = val('#bc'), i2 = id();
      try { if (bt === 'img') { DB[daImgKey(i2)] = await acroPhoto(f); B.img.push({ id: i2, n, c }); }
        else { toast('Enregistrement…'); await epsVidPut(i2, f); B[bt].push({ id: i2, n, c }); }
        commit(); toast('Ajouté à la banque ✔'); tabB(box); } catch (er) { toast('Impossible : ' + (er.message || '')); } };
    if ($('#bok')) $('#bok').onclick = () => { const n = val('#bn'); if (!n) return toast('Indiquez un titre');
      if (bt === 'txt') { const t = $('#bt').value.trim(); if (!t) return toast('Collez le texte'); B.txt.push({ id: id(), n, a: val('#ba'), t, c: val('#bc') }); }
      else { const u = val('#bu'); if (!/^https?:\/\//i.test(u)) return toast('Le lien doit commencer par https://'); B.vid.push({ id: id(), n, c: val('#bc'), url: u }); }
      commit(); toast('Ajouté à la banque ✔'); tabB(box); };
  }

  /* ---------- 📋 Groupes (projets enregistrés) ---------- */
  function saveFiche() {
    const C = D().cur; if (!C.o && !C.ind.length && !C.sup.length && !C.proc.length) return toast('Choisissez d\'abord une œuvre, des supports, des inducteurs ou des procédés');
    const cl = DB.classes.some(c => c.name === DB.lastClass) ? DB.lastClass : (DB.classes[0] || {}).name || '';
    const o = document.createElement('div'); o.className = 'gy-ov'; o.style.cssText = 'position:fixed;inset:0;z-index:310;background:rgba(0,0,0,.45);display:grid;place-items:center;padding:14px';
    const st = c => studentsOf(c) || [];
    const draw = c => { o.innerHTML = `<div class="card" style="max-width:520px;width:100%;max-height:90vh;overflow:auto"><h3 style="margin:0">💾 Enregistrer le projet</h3>
        <label>Nom du groupe</label><input id="fn" value="Groupe ${D().fiches.filter(f => f.cls === c).length + 1}">
        ${DB.classes.length ? `<label>Classe</label><select id="fc">${DB.classes.map(x => `<option ${x.name === c ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
        <label>Élèves du groupe</label><div class="da-chips">${st(c).map(n => `<label class="da-chip" style="display:inline-flex;gap:6px;align-items:center;margin:0"><input type="checkbox" value="${esc(n)}" style="width:auto;margin:0">${esc(n)}</label>`).join('')}</div>` : ''}
        <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="fok">💾 Enregistrer</button><button class="btn btn-ghost" id="fx">Annuler</button></div></div>`;
      const q = s => o.querySelector(s);
      if (q('#fc')) q('#fc').onchange = e => draw(e.target.value);
      q('#fx').onclick = () => o.remove();
      q('#fok').onclick = () => { const f = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), nom: q('#fn').value.trim() || 'Groupe', cls: q('#fc') ? q('#fc').value : '', el: [...o.querySelectorAll('input[type=checkbox]:checked')].map(x => x.value), o: C.o ? JSON.parse(JSON.stringify(C.o)) : null, ind: C.ind.map(x => ({ f: x.f, g: x.g, t: x.t, e: x.e })), sup: C.sup.map(x => ({ ...x })), proc: C.proc.map(x => ({ f: x.f, t: x.t, e: x.e, s: x.s })), date: Date.now() };
        D().fiches.push(f); commit(); o.remove(); toast(`Projet enregistré pour ${f.nom} ✔`); tab = 'fiches'; frame(); }; };
    draw(cl); document.body.appendChild(o);
  }
  function tabF(box) {
    const d = D(), F = d.fiches.slice().reverse();
    box.innerHTML = `<p class="muted" style="font-size:.82rem;margin:10px 2px 0">Chaque groupe garde son œuvre, ses inducteurs et ses vidéos.</p>
      ${undo && undo.f ? `<button class="btn btn-grad btn-block" style="margin-top:8px" id="da-fu">↶ Annuler : ${esc(undo.l)}</button>` : ''}
      ${F.length ? F.map(f => { const nv = d.vids.filter(v => v.fid === f.id).length; return `<div class="card" style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:8px"><div><b>${esc(f.nom)}</b> <span class="muted" style="font-size:.8rem">${esc(f.cls || '')} · ${new Date(f.date).toLocaleDateString('fr-FR')}</span>${f.el.length ? `<div class="muted" style="font-size:.8rem">${f.el.map(esc).join(', ')}</div>` : ''}</div></div>
          ${f.o ? `<div style="margin-top:6px;font-weight:800">🎨 ${oLine(f.o)}</div>` : ''}
          ${(f.sup || []).length ? `<div class="da-chips">${f.sup.map(supChip).join('')}</div>` : ''}<div class="da-chips">${f.ind.map(indChip).join('')}</div>${(f.proc || []).length ? `<div class="da-chips">${f.proc.map(prChip).join('')}</div>` : ''}
          <div class="row" style="margin-top:8px;gap:6px"><button class="btn btn-ghost" style="padding:7px" data-fb="${f.id}">📺 Afficher</button><button class="btn btn-ghost" style="padding:7px" data-fl="${f.id}">↻ Reprendre</button><button class="btn btn-ghost" style="padding:7px" data-fv="${f.id}">🎬 Vidéos (${nv})</button><button class="btn btn-ghost" style="padding:7px" data-fx="${f.id}">🗑</button></div></div>`; }).join('')
        : '<div class="card empty" style="margin-top:10px">Aucun projet enregistré. Choisissez une œuvre et des inducteurs puis « 💾 Enregistrer pour un groupe ».</div>'}`;
    const by = id => d.fiches.find(f => f.id === id), $ = q => box.querySelector(q);
    box.querySelectorAll('[data-fb]').forEach(b => b.onclick = () => big(by(b.dataset.fb)));
    box.querySelectorAll('[data-fl]').forEach(b => b.onclick = () => { const f = by(b.dataset.fl); snapCur('projet repris'); d.cur = { o: f.o, ind: f.ind.map(x => ({ ...x })), sup: (f.sup || []).map(x => ({ ...x })), proc: (f.proc || []).map(x => ({ ...x })) }; commit(); tab = 'ind'; frame(); toast('Projet repris ✔'); });
    box.querySelectorAll('[data-fv]').forEach(b => b.onclick = () => { vf = b.dataset.fv; tab = 'video'; frame(); });
    box.querySelectorAll('[data-fx]').forEach(b => b.onclick = () => { const f = by(b.dataset.fx); if (!confirm(`Supprimer le projet « ${f.nom} » ? (ses vidéos restent dans l'onglet Vidéo)`)) return;
      undo = { l: 'projet ' + f.nom + ' supprimé', f: JSON.stringify(f), v: JSON.stringify(d.cur) }; d.fiches = d.fiches.filter(x => x.id !== f.id); commit(); tabF(box); });
    if ($('#da-fu')) $('#da-fu').onclick = () => { d.fiches.push(JSON.parse(undo.f)); undo = null; commit(); tabF(box); };
  }

  /* ---------- 📺 Affichage en grand (élèves) ---------- */
  function big(P) {
    const o = document.createElement('div'); o.className = 'da-ov'; const img = P.o && P.o.img ? DB[daImgKey(P.o.img)] : null;
    o.innerHTML = `<div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="opacity:.8">${P.nom ? esc(P.nom) : '💃 Danse'}</b><button class="btn btn-white" style="flex:0 0 auto" data-q>✕ Fermer</button></div>
      ${P.o ? `<h1>🎨 ${esc(P.o.n)}</h1><div style="opacity:.85;font-size:1.1rem">${[P.o.a, P.o.d].filter(Boolean).map(esc).join(' · ')}</div>${P.o.p ? `<p style="font-size:1.2rem">${esc(P.o.p)}</p>` : ''}` : ''}
      ${P.o && P.o.c ? `<p style="font-size:1.25rem;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.12)">💬 ${esc(P.o.c)}</p>` : ''}
      ${P.o && (P.o.x || []).length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;margin:10px 0">${P.o.x.map(x => daX(x, true)).join('')}</div>` : ''}
      ${img ? `<img src="${img}" style="max-width:100%;max-height:45vh;border-radius:14px;display:block;margin:10px 0">` : ''}
      ${P.o && (P.o.t || []).length ? `<table class="da-tr" style="color:#fff;font-size:1.05rem">${P.o.t.map(([a, b]) => `<tr><td style="border-color:rgba(255,255,255,.2)">${esc(a)}</td><td style="border-color:rgba(255,255,255,.2)">${esc(b)}</td></tr>`).join('')}</table>` : ''}
      ${(P.sup || []).map(sp => { const x = supOf(sp); if (!x) return ''; return `<div style="margin-top:14px"><h2 style="margin:0 0 6px">${{ img: '🖼️', txt: '📖', vid: '🎬', snd: '🎵' }[sp.ty]} ${esc(x.n)}</h2>${x.html ? `<div style="max-width:760px">${x.html}</div>` : ''}
        ${x.gen ? `<button class="btn btn-white" style="margin-top:6px" data-bsnd="${x.gen}">▶ Écouter</button>` : ''}${x.aud ? `<button class="btn btn-white" style="margin-top:6px" data-baud="${x.aud}">▶ Écouter</button>` : ''}${x.vid ? `<button class="btn btn-white" style="margin-top:6px" data-bvid="${x.vid}">▶ Voir la vidéo</button>` : ''}${x.url ? `<a class="btn btn-white" style="margin-top:6px;display:inline-block" href="${esc(x.url)}" target="_blank" rel="noopener">▶ Ouvrir le lien</a>` : ''}
        ${x.c ? `<p style="font-size:1.2rem;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.12)">💬 ${esc(x.c)}</p>` : ''}</div>`; }).join('')}
      ${(P.ind || []).length ? `<h2 style="margin:16px 0 6px">🎲 Inducteurs</h2>${bigCards(P.ind, famOf)}` : ''}
      ${(P.proc || []).length ? `<h2 style="margin:16px 0 6px">🧩 Procédés de composition</h2>${bigCards(P.proc, prOf)}` : ''}`;
    o.querySelectorAll('.da-card b').forEach(b => { b.style.fontSize = '1.5rem'; });
    o.querySelectorAll('[data-bsnd]').forEach(b => b.onclick = () => { const on = playSnd(b.dataset.bsnd); b.textContent = on ? '⏹ Arrêter' : '▶ Écouter'; });
    o.querySelectorAll('[data-baud]').forEach(b => b.onclick = async () => { if (sndKey === 'a:' + b.dataset.baud) { sndOff(); b.textContent = '▶ Écouter'; } else { await playAud(b.dataset.baud); b.textContent = '⏹ Arrêter'; } });
    o.querySelectorAll('[data-bvid]').forEach(b => b.onclick = async () => { const u = await epsVidUrl(b.dataset.bvid); u ? epsVidPlay(u) : toast('Vidéo enregistrée sur une autre tablette'); });
    o.querySelector('[data-q]').onclick = () => { sndOff(); o.remove(); }; document.body.appendChild(o);
  }

  /* ---------- 🎬 Vidéo : filmer et comparer ---------- */
  function tabV(box) {
    const d = D(), F = d.fiches, V = d.vids.filter(v => !vf || v.fid === vf).slice().reverse(), fn = id => (F.find(f => f.id === id) || {}).nom || 'Sans groupe';
    cmp = cmp.map(id => d.vids.some(v => v.id === id) ? id : null);
    box.innerHTML = `<div class="card" style="margin-top:12px"><label style="margin-top:0">Groupe</label><select id="da-vf"><option value="">Tous les groupes</option>${F.map(f => `<option value="${f.id}" ${f.id === vf ? 'selected' : ''}>${esc(f.nom)}${f.cls ? ' · ' + esc(f.cls) : ''}</option>`).join('')}</select>
        <label class="btn btn-grad" style="display:block;text-align:center;cursor:pointer;margin-top:10px">🎬 Filmer / ajouter une vidéo${vf ? ' · ' + esc(fn(vf)) : ''}<input id="da-vin" type="file" accept="video/*" capture="environment" style="display:none"></label>
        <p class="muted" style="font-size:.75rem;margin:6px 0 0">Les vidéos restent sur cette tablette (trop lourdes pour la synchronisation).</p></div>
      <div class="section-title"><h2>Vidéos (${V.length})</h2><span class="muted" style="font-size:.78rem">A / B : choisir pour comparer</span></div>
      <div class="card" style="padding:2px 12px">${V.length ? V.map(v => `<div class="da-v"><div style="flex:1;min-width:0"><b>${esc(v.n)}</b><div class="muted" style="font-size:.75rem">${esc(fn(v.fid))} · ${new Date(v.d).toLocaleString('fr-FR').slice(0, 16)}</div></div>
          <button class="btn ${cmp[0] === v.id ? 'btn-grad' : 'btn-ghost'}" style="flex:0 0 auto;padding:6px 10px" data-ca="${v.id}">A</button><button class="btn ${cmp[1] === v.id ? 'btn-grad' : 'btn-ghost'}" style="flex:0 0 auto;padding:6px 10px" data-cb="${v.id}">B</button>
          <button class="btn btn-ghost" style="flex:0 0 auto;padding:6px 10px" data-vp="${v.id}">▶</button><button class="btn btn-ghost" style="flex:0 0 auto;padding:6px 10px" data-vr="${v.id}">✏️</button><button class="btn btn-ghost" style="flex:0 0 auto;padding:6px 10px" data-vx="${v.id}">🗑</button></div>`).join('') : '<div class="empty">Aucune vidéo.</div>'}</div>
      ${cmp[0] || cmp[1] ? `<div class="section-title"><h2>⚖️ Comparer</h2></div><div class="card">
        <div class="da-vg">${[0, 1].map(k => `<div><b>${'AB'[k]} · ${cmp[k] ? esc((d.vids.find(v => v.id === cmp[k]) || {}).n || '') : '—'}</b><div data-cv="${k}" style="margin-top:4px">${cmp[k] ? '<div class="muted">Chargement…</div>' : '<div class="empty">Choisissez une vidéo ' + 'AB'[k] + '</div>'}</div>
          ${cmp[k] ? `<button class="btn btn-ghost btn-block" style="margin-top:6px;padding:7px" data-mk="${k}">📍 Départ ici (<span data-off="${k}">0,0</span> s)</button>` : ''}</div>`).join('')}</div>
        <div class="row" style="margin-top:10px;gap:6px"><button class="btn btn-grad" id="da-sp">▶ Lecture synchronisée</button><button class="btn btn-ghost" id="da-ss">⏸ Pause</button></div>
        <div class="tog" style="margin-top:8px;justify-content:center">${[.25, .5, 1].map(r => `<button data-rt="${r}" class="${r === 1 ? 'on' : ''}">×${String(r).replace('.', ',')}</button>`).join('')}</div>
        <p class="muted" style="font-size:.75rem;margin:6px 0 0">Calez chaque vidéo sur le même moment (début de la chorégraphie) avec « 📍 Départ ici », puis lancez la lecture synchronisée.</p></div>` : ''}`;
    const $ = q => box.querySelector(q);
    $('#da-vf').onchange = e => { vf = e.target.value; tabV(box); };
    $('#da-vin').onchange = async e => { const f = e.target.files[0]; if (!f) return; if (f.size > 600 * 1024 * 1024) return toast('Vidéo trop lourde (600 Mo max)');
      const id = 'dv' + Date.now().toString(36); toast('🎬 Enregistrement de la vidéo…');
      try { await epsVidPut(id, f); const n = d.vids.filter(v => v.fid === vf).length + 1; d.vids.push({ id, fid: vf, n: `${vf ? fn(vf) : 'Vidéo'} · essai ${n}`, d: Date.now() }); commit(); toast('Vidéo enregistrée ✔'); tabV(box); } catch (er) { toast('Impossible d\'enregistrer : ' + (er.message || 'espace insuffisant')); } };
    box.querySelectorAll('[data-ca]').forEach(b => b.onclick = () => { cmp[0] = cmp[0] === b.dataset.ca ? null : b.dataset.ca; tabV(box); });
    box.querySelectorAll('[data-cb]').forEach(b => b.onclick = () => { cmp[1] = cmp[1] === b.dataset.cb ? null : b.dataset.cb; tabV(box); });
    box.querySelectorAll('[data-vp]').forEach(b => b.onclick = async () => { const u = await epsVidUrl(b.dataset.vp); u ? epsVidPlay(u) : toast('Vidéo filmée sur une autre tablette'); });
    box.querySelectorAll('[data-vr]').forEach(b => b.onclick = () => { const v = d.vids.find(x => x.id === b.dataset.vr), n = prompt('Nom de la vidéo :', v.n); if (n && n.trim()) { v.n = n.trim(); commit(); tabV(box); } });
    box.querySelectorAll('[data-vx]').forEach(b => b.onclick = () => { const v = d.vids.find(x => x.id === b.dataset.vx); if (!confirm(`Supprimer la vidéo « ${v.n} » ? (définitif)`)) return; d.vids = d.vids.filter(x => x.id !== v.id); epsVidDel(v.id); commit(); tabV(box); });
    // comparaison
    const vids = [null, null], off = [0, 0];
    [0, 1].forEach(async k => { if (!cmp[k]) return; const u = await epsVidUrl(cmp[k]), h = box.querySelector(`[data-cv="${k}"]`); if (!h) return;
      if (!u) { h.innerHTML = '<div class="empty">Vidéo filmée sur une autre tablette</div>'; return; }
      h.innerHTML = `<video src="${u}" controls playsinline preload="metadata"></video>`; vids[k] = h.querySelector('video'); });
    box.querySelectorAll('[data-mk]').forEach(b => b.onclick = () => { const k = +b.dataset.mk; if (!vids[k]) return; off[k] = vids[k].currentTime; box.querySelector(`[data-off="${k}"]`).textContent = off[k].toFixed(1).replace('.', ','); toast(`Départ ${'AB'[k]} calé ✔`); });
    if ($('#da-sp')) $('#da-sp').onclick = () => vids.forEach((v, k) => { if (!v) return; v.pause(); v.currentTime = off[k]; v.play().catch(() => {}); });
    if ($('#da-ss')) $('#da-ss').onclick = () => vids.forEach(v => v && v.pause());
    box.querySelectorAll('[data-rt]').forEach(b => b.onclick = () => { vids.forEach(v => { if (v) v.playbackRate = +b.dataset.rt; }); box.querySelectorAll('[data-rt]').forEach(x => x.classList.toggle('on', x === b)); });
  }

  frame();
  return () => sndOff();
};
