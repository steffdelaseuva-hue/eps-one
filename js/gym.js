/* =========================================================
   EPS ONE — Outil « Gymnastique »
   Même principe que l'acrosport : groupes, banque d'éléments (filtres),
   enchaînement par groupe (+ photos, présentation plein écran),
   diaporamas / vidéos, validation des ateliers, consignes de sécurité.
   Familles : tourner en avant / en arrière, se renverser, se renverser
   latéralement, voler, voler et tourner. Lettres A → F (A = 1 pt … F = 6 pts).
   Niveau 1 = A à D · Niveau 2 = C à F.
   Pictogrammes : dessins originaux générés en SVG (agrès + gymnaste).
   ========================================================= */
ICONS.gym = '<rect x="2.5" y="18" width="19" height="2.4" rx="1"/><path d="M6 20.4V22M18 20.4V22"/><circle cx="12" cy="14.6" r="1.5"/><path d="M9.6 18 12 12.2 14.4 18M12 12.2V7.2M12 7.2 9 2.6M12 7.2l3 -4.6"/>';

const GYM_FAM = {
  av: { n: 'Tourner en avant', c: '#1E5BD8' },
  ar: { n: 'Tourner en arrière', c: '#7B3FE4' },
  rv: { n: 'Se renverser', c: '#D6336C' },
  lat: { n: 'Se renverser latéralement', c: '#E8710A' },
  vol: { n: 'Voler', c: '#0B9E8C' },
  vrot: { n: 'Voler et tourner', c: '#B8901A' },
};
const GYM_AG = { sol: 'Sol', poutre: 'Poutre', parallele: 'Barres parallèles', fixe: 'Barre fixe', saut: 'Saut (tremplin / plinth)', trampo: 'Mini-trampoline' };
const GYM_AG_S = { sol: 'Sol', poutre: 'Poutre', parallele: 'Parallèles', fixe: 'Barre fixe', saut: 'Saut', trampo: 'Mini-trampo' };
const GYM_AM = { trampo: 'Mini-trampoline', tremplin: 'Tremplin', plinth: 'Plinth' };
const GYM_LT = ['A', 'B', 'C', 'D', 'E', 'F'];
const gymPts = l => GYM_LT.indexOf(l) + 1;
const GYM_NIV = { 1: ['A', 'B', 'C', 'D'], 2: ['C', 'D', 'E', 'F'] };

/* ---------- Banque d'éléments (collège) ----------
   ag agrès · fam famille · lvl lettre · am aménagements · c critères de réussite · s sécurité / parade
   v (facultatif) : posture du pictogramme, sinon déduite du nom · pd : pareur dessiné                */
const GYM_E = (() => {
  const L = [];
  const E = (id, ag, fam, lvl, n, c, s, x) => L.push({ id, ag, fam, lvl, n, c, s, ...(x || {}) });
  // ===== SOL =====
  E('s01', 'sol', 'av', 'A', 'Roulade avant groupée sur plan incliné', 'Menton rentré, dos rond, se relever sans l\'aide des mains.', 'Mains à plat largeur d\'épaules, rouler sur le haut du dos, jamais sur la tête ; plan incliné stable.');
  E('s02', 'sol', 'av', 'B', 'Roulade avant groupée arrivée debout', 'Départ debout, arrivée debout sans poser les mains ni les genoux.', 'Tapis jointifs ; poser les mains avant la nuque, ne pas se jeter sur la tête.');
  E('s03', 'sol', 'av', 'C', 'Roulade avant jambes écartées', 'Jambes tendues écartées, mains poussent entre les jambes pour arriver debout.', 'Échauffer les ischio-jambiers ; tapis assez long pour l\'arrivée.');
  E('s04', 'sol', 'av', 'D', 'Roulade avant jambes tendues serrées', 'Jambes tendues et serrées tout le long, arrivée debout en fermant le buste sur les jambes.', 'Souplesse nécessaire : ne pas forcer sur le dos, rouler lentement.');
  E('s05', 'sol', 'av', 'E', 'Roulade plongée', 'Envol visible avant la pose des mains, bras qui amortissent, arrivée debout.', 'Tapis épais ; envol bas au début, toujours amortir avec les bras.');
  E('s06', 'sol', 'av', 'F', 'ATR roulé bras tendus', 'Passage par l\'ATR aligné, bras qui fléchissent lentement, roulade avant jusqu\'à l\'arrivée debout.', 'Parade à côté (hanche + épaule) ; rentrer la tête avant de rouler.', { v: 'hs', pd: 1 });
  E('s07', 'sol', 'ar', 'A', 'Roulade arrière sur plan incliné', 'Mains à plat près des oreilles, pousser pour dégager la tête, arrivée à genoux.', 'Rouler sur les épaules, jamais sur la tête ; plan incliné stable.');
  E('s08', 'sol', 'ar', 'B', 'Roulade arrière groupée arrivée accroupie', 'Rester groupé, poussée des mains, arrivée sur les pieds.', 'Mains doigts vers les épaules pour protéger la nuque.');
  E('s09', 'sol', 'ar', 'C', 'Roulade arrière jambes écartées arrivée debout', 'Jambes tendues écartées, poussée des bras, arrivée debout jambes écartées.', 'Poussée des bras obligatoire pour libérer la tête.');
  E('s10', 'sol', 'ar', 'D', 'Roulade arrière jambes tendues arrivée debout', 'Jambes tendues serrées, forte poussée des bras, arrivée debout.', 'Échauffer poignets et épaules ; ne pas écraser la nuque.');
  E('s11', 'sol', 'ar', 'E', 'Roulade arrière passage à l\'ATR', 'Pendant la roulade, extension des hanches et poussée des bras jusqu\'à l\'ATR, retour debout.', 'Parade aux hanches ; maîtriser d\'abord la roulade arrière jambes tendues.', { v: 'hs', pd: 1 });
  E('s12', 'sol', 'ar', 'F', 'Flic-flac arrière', 'Départ debout, bascule arrière sur les mains, repoussée et arrivée debout.', 'Deux pareurs obligatoires (dos + cuisses), tapis épais ; réservé aux experts.', { v: 'hsArch', pd: 1 });
  E('s13', 'sol', 'rv', 'A', 'Chandelle', 'Corps aligné à la verticale sur les épaules, mains soutiennent le dos, tenue 3 s.', 'Poids sur les épaules, jamais sur la nuque ; sur tapis.');
  E('s14', 'sol', 'rv', 'B', 'Trépied (équilibre tête-mains)', 'Tête et mains forment un triangle, jambes à la verticale, tenue 3 s.', 'Poser le haut du front, pas le sommet du crâne ; sortir en roulade avant groupée.');
  E('s15', 'sol', 'rv', 'C', 'ATR passé', 'Jambes lancées l\'une après l\'autre, passage à la verticale, retour sur la jambe d\'appel.', 'Bras tendus verrouillés, regard sur les mains ; espace dégagé.');
  E('s16', 'sol', 'rv', 'C', 'Pont', 'Départ couché sur le dos, poussée bras et jambes, bassin haut, bras tendus, tenue 3 s.', 'Mains à plat doigts vers les pieds ; échauffer poignets et dos.');
  E('s17', 'sol', 'rv', 'D', 'ATR tenu', 'Corps aligné et gainé à la verticale, tenue 2 s, retour jambes serrées.', 'Parade latérale aux cuisses ; savoir sortir en roulade ou en quart de tour.', { pd: 1 });
  E('s18', 'sol', 'rv', 'D', 'Descente en pont arrière', 'Départ debout bras en haut, descente contrôlée en regardant les mains, arrivée en pont bras tendus.', 'Parade au bas du dos ; toujours sur tapis.', { pd: 1 });
  E('s19', 'sol', 'rv', 'E', 'Renversement arrière', 'Passage par le pont, jambes l\'une après l\'autre par-dessus, arrivée debout en fente.', 'Parade sous le dos ; souplesse d\'épaules nécessaire.', { v: 'walk' });
  E('s20', 'sol', 'rv', 'E', 'Renversement avant', 'Départ en fente, ATR jambes écartées, passage par le pont, arrivée debout.', 'Parade au dos ; maîtriser l\'ATR et le pont.', { v: 'walk', m: -1 });
  E('s21', 'sol', 'rv', 'F', 'Saut de mains', 'Élan, mains à bout de bras, repoussée des épaules, envol et arrivée debout.', 'Deux pareurs (épaule + dos) et tapis épais pour débuter.', { pd: 1 });
  E('s22', 'sol', 'lat', 'A', 'Petite roue jambes fléchies', 'Main, main, pied, pied posés l\'un après l\'autre sur une ligne.', 'Mains à plat doigts écartés ; sur tapis.');
  E('s23', 'sol', 'lat', 'B', 'Roue', 'Passage à la verticale bras et jambes tendus, sur une ligne, arrivée de profil.', 'Regard sur les mains ; 3 m d\'espace libre.');
  E('s24', 'sol', 'lat', 'C', 'Deux roues enchaînées', 'Deux roues alignées sans arrêt, rythme régulier, jambes tendues.', 'Espace dégagé ; arrêter en cas de déséquilibre.');
  E('s25', 'sol', 'lat', 'D', 'Rondade', 'Pose des mains en quart de tour, jambes serrées à la verticale, arrivée pieds joints face au départ.', 'Élan court et contrôlé ; tapis de réception.');
  E('s26', 'sol', 'lat', 'E', 'Roue sur une main', 'Roue avec appui sur une seule main, corps tendu, sur une ligne.', 'Maîtriser la roue ; poignets échauffés.');
  E('s27', 'sol', 'lat', 'F', 'Rondade – saut extension 1/2 tour', 'Rondade suivie aussitôt d\'un saut extension 1/2 tour, réception stabilisée.', 'Tapis de réception épais, élan limité.', { v: 'rond' });
  E('s28', 'sol', 'vol', 'A', 'Saut extension', 'Bras en haut, corps gainé, pointes tendues, réception pieds joints stable.', 'Réception genoux fléchis, sur tapis.');
  E('s29', 'sol', 'vol', 'B', 'Saut groupé', 'Genoux à la poitrine au sommet du saut, réception stable.', 'Réception amortie sur tapis.');
  E('s31', 'sol', 'vol', 'C', 'Saut écart', 'Jambes tendues écartées à l\'horizontale, bras vers les pointes, réception stable.', 'Échauffer les adducteurs ; réception pieds joints.');
  E('s32', 'sol', 'vol', 'D', 'Saut carpé jambes serrées', 'Jambes tendues serrées montées à l\'horizontale, mains vers les pieds.', 'Réception pieds joints, genoux fléchis.');
  E('s33', 'sol', 'vol', 'E', 'Saut enjambé', 'Grand écart en l\'air (≥ 120°), jambes tendues, réception sur la jambe avant.', 'Échauffer les ischio-jambiers.');
  E('s34', 'sol', 'vol', 'F', 'Saut enjambé changé', 'Lancer une jambe, changer de jambe en l\'air, finir en enjambé.', 'Réception amortie sur tapis.', { v: 'split', m: -1 });
  E('s35', 'sol', 'vrot', 'A', 'Saut extension 1/2 tour', 'Rotation de 180° autour de l\'axe du corps, réception stable face opposée.', 'Réception pieds joints genoux fléchis.');
  E('s36', 'sol', 'vrot', 'B', 'Saut extension 1 tour', 'Rotation complète (360°) bras serrés, réception face au départ.', 'Espace libre, réception stabilisée.');
  E('s37', 'sol', 'vrot', 'C', 'Saut groupé 1/2 tour', 'Groupé au sommet et demi-tour, réception stable.', 'Ouvrir le corps avant la réception.');
  E('s38', 'sol', 'vrot', 'D', 'Saut groupé 1 tour', 'Groupé et tour complet, réception face au départ.', 'Réception amortie, espace libre.');
  E('s39', 'sol', 'vrot', 'E', 'Salto avant groupé (tremplin)', 'Impulsion bras en haut, groupé serré, rotation avant complète, arrivée debout.', 'Parade obligatoire, tapis épais de réception, élan contrôlé.', { am: ['tremplin'], pd: 1 });
  E('s40', 'sol', 'vrot', 'F', 'Salto avant groupé', 'Depuis la course, impulsion pieds joints, rotation complète, arrivée debout.', 'Parade et tapis épais ; réservé aux élèves experts.', { pd: 1 });
  // ===== POUTRE (basse) =====
  E('p01', 'poutre', 'vol', 'A', 'Sortie saut extension', 'Au bout de la poutre, saut bras en haut, réception pieds joints stable.', 'Tapis de réception au bout de la poutre.');
  E('p02', 'poutre', 'vol', 'B', 'Sortie saut groupé', 'Groupé au sommet, réception pieds joints stable.', 'Tapis de réception ; sauter vers l\'avant, loin de la poutre.');
  E('p03', 'poutre', 'vol', 'C', 'Saut de chat sur la poutre', 'Genoux montés l\'un après l\'autre, retour sur la poutre sans chute.', 'Poutre basse et tapis autour ; regard au bout de la poutre.', { v: 'cat' });
  E('p04', 'poutre', 'vol', 'C', 'Sortie saut écart', 'Jambes tendues écartées, réception stable.', 'Sauter loin de la poutre, tapis de réception.');
  E('p05', 'poutre', 'vol', 'E', 'Saut enjambé sur la poutre', 'Écart en l\'air, retour sur la jambe avant dans l\'axe.', 'Poutre basse habillée, tapis de chaque côté.');
  E('p06', 'poutre', 'vrot', 'B', 'Sortie saut extension 1/2 tour', 'Demi-tour en l\'air, réception stable face à la poutre.', 'Tapis de réception ; sauter vers l\'avant.');
  E('p07', 'poutre', 'vrot', 'D', '1/2 tour sauté sur la poutre', 'Saut avec demi-tour et retour sur la poutre sans chute.', 'Poutre basse, tapis autour.', { v: 'ext' });
  E('p08', 'poutre', 'vrot', 'E', 'Sortie saut extension 1 tour', 'Tour complet en l\'air, réception stable.', 'Tapis de réception épais.');
  E('p09', 'poutre', 'av', 'B', 'Descente en roulade avant sur tapis surélevé', 'Mains sur la poutre, roulade avant contrôlée vers le tapis, arrivée accroupie.', 'Tapis au niveau de la poutre, parade au dos.');
  E('p10', 'poutre', 'av', 'D', 'Roulade avant sur la poutre', 'Mains agrippent la poutre, roulade dans l\'axe, arrivée accroupie sur la poutre.', 'Poutre basse habillée, pareur à côté.', { pd: 1 });
  E('p11', 'poutre', 'ar', 'E', 'Roulade arrière sur la poutre', 'Tête sur le côté de la poutre, mains agrippent, arrivée à genoux dans l\'axe.', 'Poutre basse habillée, parade aux hanches.', { pd: 1 });
  E('p12', 'poutre', 'rv', 'C', 'Chandelle sur la poutre', 'Mains agrippent la poutre, corps vertical, tenue 2 s.', 'Poutre basse habillée, tapis autour.');
  E('p13', 'poutre', 'rv', 'E', 'ATR passé sur la poutre', 'Jambes lancées l\'une après l\'autre, passage à la verticale, retour dans l\'axe.', 'Parade latérale, poutre basse, tapis autour.', { pd: 1 });
  E('p14', 'poutre', 'lat', 'C', 'Sortie en roue', 'Mains au bout de la poutre, roue et réception stable de profil.', 'Tapis de réception épais au bout de la poutre.');
  E('p15', 'poutre', 'lat', 'D', 'Sortie en rondade', 'Mains au bout de la poutre, jambes serrées, réception pieds joints face à la poutre.', 'Tapis épais, parade à la taille.');
  E('p16', 'poutre', 'lat', 'F', 'Roue sur la poutre', 'Mains puis pieds posés dans l\'axe de la poutre, sans chute.', 'Commencer sur une ligne au sol puis poutre basse, parade.');
  // ===== BARRE FIXE =====
  E('x01', 'fixe', 'av', 'A', 'Descente en roulade avant de l\'appui', 'De l\'appui tendu, enrouler le buste vers l\'avant et descendre lentement jusqu\'aux pieds.', 'Mains en pronation qui ne lâchent pas, tapis sous la barre.', { v: 'fold' });
  E('x02', 'fixe', 'av', 'D', 'Tour d\'appui avant', 'De l\'appui, rotation avant autour de la barre et retour à l\'appui, bras tendus.', 'Prise en supination, parade aux épaules et aux cuisses.', { v: 'support', pd: 1 });
  E('x03', 'fixe', 'ar', 'A', 'Montée par renversement avec aide (plinth)', 'Pied d\'appel sur le plinth, jambes lancées, bassin à la barre, arrivée à l\'appui.', 'Plinth stable à hauteur de hanches, parade au dos.', { am: ['plinth'], v: 'pikeOver' });
  E('x04', 'fixe', 'ar', 'C', 'Montée par renversement', 'Bras fléchis, bassin amené à la barre, passage à l\'appui tendu.', 'Parade au bas du dos et aux jambes ; tapis.', { v: 'pikeOver', pd: 1 });
  E('x05', 'fixe', 'ar', 'D', 'Tour d\'appui arrière', 'Élan de jambes, bassin collé à la barre, rotation arrière et retour à l\'appui.', 'Parade aux cuisses ; garder le bassin contre la barre.', { v: 'support' });
  E('x06', 'fixe', 'ar', 'E', 'Montée par renversement + tour d\'appui arrière', 'Les deux éléments enchaînés sans arrêt, bras tendus à l\'appui.', 'Parade ; maîtriser chaque élément séparément.', { v: 'support' });
  E('x07', 'fixe', 'rv', 'A', 'Cochon pendu', 'Suspendu par les genoux, tête en bas, bras relâchés, tenue 3 s.', 'Barre basse, tapis épais, parade aux épaules pour la sortie.');
  E('x08', 'fixe', 'rv', 'B', 'Suspension renversée groupée', 'Mains à la barre, genoux à la poitrine, tête en bas, tenue 3 s.', 'Tapis sous la barre, redescendre lentement les pieds.');
  E('x09', 'fixe', 'vol', 'A', 'Saut à l\'appui tendu', 'Impulsion sur le tremplin, arrivée à l\'appui bras tendus, corps gainé.', 'Tremplin stable, barre à hauteur de hanches.', { am: ['tremplin'], v: 'support' });
  E('x10', 'fixe', 'vol', 'B', 'Sortie par élan arrière', 'De l\'appui, élan arrière des jambes, lâcher et réception stable derrière la barre.', 'Tapis de réception ; repousser la barre.', { v: 'flyBack' });
  E('x11', 'fixe', 'vol', 'E', 'Sortie en filé (bascule)', 'Jambes lancées sous la barre, corps tendu, lâcher en avant et réception debout.', 'Tapis épais, parade au dos.', { v: 'fly', pd: 1 });
  E('x12', 'fixe', 'vrot', 'F', 'Sortie en filé 1/2 tour', 'Filé puis demi-tour en l\'air, réception stable face à la barre.', 'Tapis épais, parade.', { v: 'fly' });
  // ===== BARRES PARALLÈLES =====
  E('b01', 'parallele', 'vol', 'A', 'Balancers en appui tendu', 'Bras tendus, épaules au-dessus des mains, balancers amples jambes serrées.', 'Tapis sous et autour des barres ; barres à hauteur de poitrine.', { v: 'swingF' });
  E('b02', 'parallele', 'vol', 'B', 'Sortie de balancer avant', 'Au balancer avant, passage des jambes par-dessus la barre, réception de profil.', 'Tapis de réception, main qui reste sur la barre.', { v: 'swingF' });
  E('b03', 'parallele', 'vol', 'C', 'Sortie de balancer arrière', 'Au balancer arrière, passage par-dessus la barre, réception stable.', 'Tapis de réception ; repousser la barre.', { v: 'swingB' });
  E('b04', 'parallele', 'vrot', 'D', 'Sortie de balancer avant 1/2 tour', 'Sortie avec demi-tour, réception face aux barres.', 'Tapis de réception épais.', { v: 'swingF' });
  E('b05', 'parallele', 'av', 'B', 'Roulade avant de l\'assis écarté à l\'assis écarté', 'Mains devant les cuisses, coudes ouverts, roulade sur les bras, retour assis écarté.', 'Barres basses habillées, parade sous les épaules.', { v: 'rollBar' });
  E('b06', 'parallele', 'av', 'C', 'Roulade avant sur les barres', 'De l\'appui brachial, roulade avant jambes écartées, arrivée à l\'appui brachial.', 'Parade sous les barres ; coudes ouverts.', { v: 'rollBar', pd: 1 });
  E('b07', 'parallele', 'rv', 'C', 'Appui brachial renversé groupé', 'Bras sur les barres, bassin au-dessus des épaules, genoux groupés, tenue 2 s.', 'Parade à côté des barres, tapis.', { v: 'shTuck' });
  E('b08', 'parallele', 'rv', 'D', 'ATR d\'épaules', 'Corps aligné à la verticale, appui sur les bras et les épaules, tenue 2 s.', 'Parade aux cuisses ; coudes ouverts, barres habillées.', { v: 'shStand', pd: 1 });
  E('b09', 'parallele', 'ar', 'E', 'Roulade arrière de l\'assis écarté', 'Bras sur les barres, roulade arrière et arrivée à l\'appui brachial jambes écartées.', 'Parade aux hanches, barres habillées.', { v: 'rollBarB' });
  // ===== SAUT (tremplin / plinth) =====
  E('v01', 'saut', 'vol', 'A', 'Saut à genoux sur le plinth + saut extension', 'Arrivée à genoux sur le plinth, relevé et saut extension, réception stable.', 'Plinth habillé, tremplin fixé, tapis de réception.', { am: ['tremplin', 'plinth'], v: 'kneel' });
  E('v02', 'saut', 'vol', 'B', 'Saut accroupi sur le plinth + saut extension', 'Mains puis pieds sur le plinth, relevé et saut extension.', 'Tremplin fixé, parade à côté du plinth.', { am: ['tremplin', 'plinth'], v: 'squatBox' });
  E('v03', 'saut', 'vol', 'C', 'Saut accroupi par-dessus le plinth', 'Appui des mains, genoux groupés entre les bras, réception debout stable.', 'Parade à la sortie du plinth (bras et épaule).', { am: ['tremplin', 'plinth'], v: 'tuckV', pd: 1 });
  E('v04', 'saut', 'vol', 'C', 'Saut écart par-dessus le plinth', 'Repoussée des mains, jambes tendues écartées, réception debout stable.', 'Parade face au sauteur, plinth en travers.', { am: ['tremplin', 'plinth'], v: 'pikeV', pd: 1 });
  E('v05', 'saut', 'vrot', 'C', 'Saut sur le plinth + sortie saut extension 1/2 tour', 'Arrivée debout sur le plinth, saut extension demi-tour, réception stable.', 'Tapis de réception, plinth bas.', { am: ['tremplin', 'plinth'], v: 'ext' });
  E('v06', 'saut', 'av', 'B', 'Roulade avant sur le plinth', 'Impulsion tremplin, mains sur le plinth, roulade dans l\'axe.', 'Plinth habillé en long, parade à côté.', { am: ['tremplin', 'plinth'] });
  E('v07', 'saut', 'av', 'D', 'Plongée roulade sur le plinth', 'Envol avant la pose des mains, bras amortissent, roulade dans l\'axe.', 'Plinth habillé en long, tapis épais au bout.', { am: ['tremplin', 'plinth'], v: 'dive' });
  E('v08', 'saut', 'lat', 'D', 'Roue sur le plinth', 'Mains sur le plinth, passage jambes tendues à la verticale, réception de profil.', 'Plinth bas, tapis épais de réception.', { am: ['tremplin', 'plinth'] });
  E('v09', 'saut', 'rv', 'E', 'Saut de lune', 'Impulsion, passage à l\'ATR sur le plinth, arrivée allongé sur le dos sur tapis épais.', 'Tapis très épais, parade ; mains à plat sur le plinth.', { am: ['tremplin', 'plinth'], v: 'hs', pd: 1 });
  E('v10', 'saut', 'rv', 'F', 'Saut de mains sur le plinth', 'Repoussée des épaules sur le plinth, envol et réception debout.', 'Deux pareurs, tapis épais de réception.', { am: ['tremplin', 'plinth'], v: 'hsArch', pd: 1 });
  // ===== MINI-TRAMPOLINE =====
  E('t01', 'trampo', 'vol', 'A', 'Saut extension', 'Impulsion pieds joints au centre de la toile, corps gainé, réception stable.', 'Tapis de réception épais, un élève à la fois.', { am: ['trampo'] });
  E('t02', 'trampo', 'vol', 'B', 'Saut groupé', 'Groupé au sommet, ouverture avant la réception.', 'Tapis épais, réception pieds joints.', { am: ['trampo'] });
  E('t03', 'trampo', 'vol', 'C', 'Saut écart', 'Jambes tendues écartées à l\'horizontale, réception stable.', 'Tapis épais ; ne pas se pencher en avant.', { am: ['trampo'] });
  E('t04', 'trampo', 'vol', 'D', 'Saut carpé jambes serrées', 'Jambes tendues serrées à l\'horizontale, buste droit, réception stable.', 'Tapis épais, parade à la réception.', { am: ['trampo'] });
  E('t05', 'trampo', 'vrot', 'B', 'Saut extension 1/2 tour', 'Demi-tour en l\'air, réception stable face au mini-trampoline.', 'Tapis épais, espace libre.', { am: ['trampo'] });
  E('t06', 'trampo', 'vrot', 'C', 'Saut extension 1 tour', 'Tour complet, réception stable.', 'Tapis épais, espace libre.', { am: ['trampo'] });
  E('t07', 'trampo', 'av', 'C', 'Saut + roulade avant sur le tapis', 'Saut extension puis roulade avant groupée sur le tapis, arrivée debout.', 'Tapis épais et long, rouler sur le haut du dos.', { am: ['trampo'] });
  E('t08', 'trampo', 'av', 'D', 'Plongée roulade', 'Envol, pose des mains sur le tapis, roulade et arrivée debout.', 'Tapis très épais ; bras qui amortissent.', { am: ['trampo'], v: 'dive' });
  E('t09', 'trampo', 'vrot', 'E', 'Salto avant groupé (avec parade)', 'Impulsion bras en haut, groupé serré, rotation complète, arrivée debout.', 'Parade obligatoire, tapis très épais.', { am: ['trampo'], pd: 1 });
  E('t10', 'trampo', 'vrot', 'F', 'Salto avant carpé (avec parade)', 'Carpé jambes tendues, rotation complète, arrivée debout.', 'Parade obligatoire, tapis très épais ; experts.', { am: ['trampo'], pd: 1 });
  return L;
})();

/* ---------- Postures (repère : bassin en 0,0 ; y vers le haut ; angles en degrés, 0 = haut, 90 = avant) ---------- */
const GYM_Q = {
  up: { t: 0, l1: [178, 180], l2: [182, 180], a1: [8, 2], a2: [-8, -2] },
  stand: { t: 0, l1: [178, 180], l2: [182, 180], a1: [172, 178], a2: [186, 182] },
  tuck: { t: 0, h: 25, l1: [40, 165], l2: [50, 172], a1: [110, 165], a2: [118, 170] },
  tuckV: { t: 20, h: 25, l1: [55, 170], l2: [62, 176], a1: [168, 178], a2: [174, 182] },
  pike: { t: 18, h: 20, l1: [88, 90], l2: [93, 92], a1: [118, 100], a2: [124, 104] },
  pikeV: { t: 35, h: 15, l1: [80, 88], l2: [86, 92], a1: [172, 178], a2: [178, 182] },
  strad: { t: 0, h: 0, l1: [108, 100], l2: [252, 260], a1: [125, 110], a2: [235, 250] },
  star: { t: 0, h: 0, l1: [150, 150], l2: [210, 210], a1: [40, 42], a2: [-40, -42] },
  starBent: { t: 0, h: 0, l1: [130, 195], l2: [230, 165], a1: [40, 42], a2: [-40, -42] },
  split: { t: 0, h: 0, l1: [90, 92], l2: [262, 264], a1: [40, 60], a2: [-60, -80] },
  cat: { t: 0, h: 0, l1: [95, 180], l2: [160, 200], a1: [30, 330], a2: [-30, 30] },
  squat: { t: 25, h: 10, l1: [70, 195], l2: [75, 198], a1: [95, 95], a2: [100, 98] },
  kneel: { t: 0, l1: [180, 270], l2: [182, 272], a1: [8, 2], a2: [-8, -2] },
  bridge: { t: 235, h: 20, l1: [140, 182], l2: [146, 186], a1: [215, 190], a2: [220, 194] },
  walk: { t: 235, h: 20, l1: [140, 182], l2: [15, 15], a1: [215, 190], a2: [220, 194] },
  candle: { t: 180, h: 90, l1: [0, 0], l2: [3, 3], a1: [90, 0], a2: [95, 5] },
  tripod: { t: 180, h: 0, l1: [0, 0], l2: [3, 3], a1: [90, 180], a2: [95, 180] },
  hs: { t: 180, h: 0, l1: [-2, 0], l2: [2, 0], a1: [174, 178], a2: [186, 182] },
  hsSplit: { t: 180, h: 0, l1: [-28, -28], l2: [28, 28], a1: [174, 178], a2: [186, 182] },
  hsArch: { t: 195, h: -10, l1: [25, 30], l2: [30, 36], a1: [172, 176], a2: [180, 182] },
  rollF: { t: 290, h: 30, l1: [335, 100], l2: [345, 108], a1: [45, 100], a2: [52, 106] },
  rollB: { t: 290, h: 20, l1: [330, 95], l2: [340, 102], a1: [350, 220], a2: [356, 226] },
  rollFS: { t: 290, h: 25, l1: [28, 28], l2: [34, 34], a1: [40, 55], a2: [46, 60] },
  rollBS: { t: 290, h: 20, l1: [318, 318], l2: [326, 326], a1: [350, 220], a2: [356, 226] },
  rond: { t: 180, h: 0, l1: [-3, 0], l2: [3, 0], a1: [140, 138], a2: [220, 222] },
  dive: { t: 120, h: 0, l1: [290, 290], l2: [295, 295], a1: [125, 130], a2: [130, 135] },
  hang: { t: 0, l1: [180, 180], l2: [182, 182], a1: [4, 0], a2: [-4, 0] },
  support: { t: 16, l1: [192, 186], l2: [188, 182], a1: [178, 180], a2: [181, 182] },
  swingF: { t: -12, l1: [130, 130], l2: [135, 135], a1: [178, 180], a2: [182, 182] },
  swingB: { t: 25, l1: [245, 245], l2: [250, 250], a1: [178, 180], a2: [182, 182] },
  pig: { t: 180, h: 0, l1: [0, 140], l2: [5, 146], a1: [180, 182], a2: [186, 186] },
  tuckHang: { t: 160, h: 10, l1: [200, 325], l2: [210, 332], a1: [355, 2], a2: [5, 8] },
  pikeOver: { t: 165, h: 0, l1: [318, 318], l2: [312, 312], a1: [40, 310], a2: [45, 315] },
  fold: { t: 150, h: 15, l1: [200, 185], l2: [206, 190], a1: [340, 345], a2: [346, 350] },
  fly: { t: 280, h: 0, l1: [95, 95], l2: [100, 100], a1: [285, 285], a2: [290, 290] },
  flyBack: { t: -10, h: 0, l1: [175, 180], l2: [180, 185], a1: [40, 35], a2: [46, 40] },
  brach: { t: 0, l1: [180, 180], l2: [182, 182], a1: [90, 92], a2: [270, 268] },
  shStand: { t: 180, h: 0, l1: [0, 0], l2: [3, 3], a1: [55, 140], a2: [60, 145] },
  shTuck: { t: 180, h: 0, l1: [35, 185], l2: [42, 190], a1: [55, 140], a2: [60, 145] },
  rollBar: { t: 175, h: 0, l1: [262, 262], l2: [270, 270], a1: [55, 140], a2: [60, 145] },
  rollBarB: { t: 185, h: 0, l1: [98, 98], l2: [90, 90], a1: [55, 140], a2: [60, 145] },
  spot: { t: 12, h: 5, l1: [172, 180], l2: [195, 180], a1: [75, 55], a2: [95, 70] },
};
const GYM_SK = (() => {
  const L = { tr: 30, hd: 10, th: 24, sh: 24, ua: 17, fa: 17 };
  const go = (p, a, l) => { const r = a * Math.PI / 180; return [p[0] + Math.sin(r) * l, p[1] + Math.cos(r) * l]; };
  const joints = (k, R = 0, m = 1) => {
    const q = GYM_Q[k] || GYM_Q.up, A = a => a + R, p = [0, 0], n = go(p, A(q.t), L.tr);
    const j = { h: go(n, A(q.t + (q.h || 0)), L.hd), n, p };
    j.k1 = go(p, A(q.l1[0]), L.th); j.f1 = go(j.k1, A(q.l1[1]), L.sh); j.k2 = go(p, A(q.l2[0]), L.th); j.f2 = go(j.k2, A(q.l2[1]), L.sh);
    j.e1 = go(n, A(q.a1[0]), L.ua); j.m1 = go(j.e1, A(q.a1[1]), L.fa); j.e2 = go(n, A(q.a2[0]), L.ua); j.m2 = go(j.e2, A(q.a2[1]), L.fa);
    if (m < 0) for (const x in j) j[x] = [-j[x][0], j[x][1]];
    return j;
  };
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  // place une posture : ancre = articulation, 'hands', 'feet', 'min' (point le plus bas posé sur y)
  const place = (k, anc, at, o = {}) => {
    const j = joints(k, o.R || 0, o.m || 1);
    let a;
    if (anc === 'min') a = [j.p[0], Math.min(...Object.entries(j).map(([n, v]) => v[1] - (n === 'h' ? 7 : 2.75)))];
    else if (anc === 'hands') a = mid(j.m1, j.m2); else if (anc === 'feet') a = mid(j.f1, j.f2); else if (anc === 'knees') a = mid(j.k1, j.k2); else a = j[anc];
    for (const x in j) j[x] = [j[x][0] - a[0] + at[0], j[x][1] - a[1] + at[1]];
    return j;
  };
  return { joints, place };
})();

/* Posture déduite du nom (éléments de la banque sans « v » et éléments créés par l'enseignant) */
function gymPoseOf(e) {
  if (e.v && GYM_Q[e.v]) return e.v;
  const n = (e.n || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), has = (...w) => w.some(x => n.includes(x));
  const ag = e.ag;
  if (ag === 'fixe') { if (has('cochon')) return 'pig'; if (has('suspension renversee')) return 'tuckHang'; if (has('montee par renversement')) return 'pikeOver'; if (has('file', 'bascule')) return 'fly';
    if (has('roulade')) return 'fold'; if (has('sortie')) return 'flyBack'; if (has('suspension')) return 'hang'; if (!['vol', 'vrot'].includes(e.fam) || has('appui')) return 'support'; }
  if (ag === 'parallele') { if (has('atr', 'epaules')) return 'shStand'; if (has('renverse')) return 'shTuck'; if (has('roulade arriere')) return 'rollBarB'; if (has('roulade')) return 'rollBar';
    if (has('arriere')) return 'swingB'; return 'swingF'; }
  if (has('chandelle')) return 'candle'; if (has('trepied', 'tete-mains')) return 'tripod';
  if (has('saut de mains', 'flic', 'lune')) return 'hsArch'; if (has('renversement')) return 'walk'; if (has('pont')) return 'bridge';
  if (has('atr passe')) return 'hsSplit'; if (has('atr', 'appui renverse')) return 'hs';
  if (has('rondade')) return 'rond'; if (has('roue')) return has('flechi') ? 'starBent' : 'star';
  if (has('plonge')) return 'dive';
  if (has('roulade')) { const b = has('arriere'), s = has('ecart', 'tendu'); return b ? (s ? 'rollBS' : 'rollB') : (s ? 'rollFS' : 'rollF'); }
  if (has('salto')) return has('carpe') ? 'pike' : 'tuck';
  if (has('genoux')) return 'kneel'; if (has('accroupi')) return ag === 'saut' ? (has('dessus') ? 'tuckV' : 'squatBox') : 'squat';
  if (has('enjambe')) return 'split'; if (has('chat')) return 'cat'; if (has('ecart')) return ag === 'saut' ? 'pikeV' : 'strad';
  if (has('carpe')) return ag === 'saut' ? 'pikeV' : 'pike'; if (has('groupe')) return 'tuck';
  if (has('extension', 'tour')) return 'up';
  return { av: 'rollF', ar: 'rollB', rv: 'hs', lat: 'star', vol: 'up', vrot: 'up' }[e.fam] || 'up';
}
const GYM_AIR = ['up', 'ext', 'tuck', 'pike', 'strad', 'split', 'cat'];

/* Scène : agrès + gymnaste(s) + flèche de rotation */
function gymScene(e) {
  let pose = gymPoseOf(e); const ag = e.ag, m = e.m || 1, P = GYM_SK.place, fam = e.fam;
  const nm = (e.n || '').toLowerCase(), sortie = /sortie|descente/.test(nm), salto = /salto/.test(nm), tour = /tour/.test(nm) && fam === 'vrot' && !salto;
  let j, R = 0, arr = fam, rot = 0;
  if (pose === 'ext') pose = 'up';
  if (pose === 'squatBox') pose = 'squat';
  const air = GYM_AIR.includes(pose) && !['saut'].includes(ag) || salto;
  if (salto) R = 150;
  const inv = { star: 180, starBent: 180 }[pose] || 0; if (inv) R = inv;
  if (ag === 'sol') {
    if (air) j = P(pose, 'min', [0, 40], { R, m });
    else if (['hs', 'hsSplit', 'hsArch', 'star', 'starBent', 'rond'].includes(pose)) j = P(pose, 'hands', [0, 8.75], { R, m });
    else j = P(pose, 'min', [0, 6], { R, m });
  } else if (ag === 'poutre') {
    if (sortie && air) j = P(pose, 'min', [72, 34], { R, m });
    else if (air) j = P(pose, 'min', [-40, 72], { R, m });
    else if (sortie && ['star', 'starBent'].includes(pose)) j = P(pose, 'hands', [18, 52.75], { R, m });
    else if (sortie && pose === 'rond') j = P(pose, 'hands', [18, 52.75], { R, m });
    else if (['hs', 'hsSplit', 'hsArch', 'star', 'starBent', 'rond'].includes(pose)) j = P(pose, 'hands', [-40, 52.75], { R, m });
    else if (sortie) j = P(pose, 'min', [8, 50], { R, m });
    else j = P(pose, 'min', [-40, 50], { R, m });
  } else if (ag === 'fixe') {
    const B = [0, 125];
    if (pose === 'pig') j = P(pose, 'k1', [B[0], B[1] + 4], { m });
    else if (pose === 'pikeOver') j = P(pose, 'p', [B[0] - 3, B[1] + 5], { m });
    else if (pose === 'fold') j = P(pose, 'p', [B[0] - 3, B[1] + 5], { m });
    else if (pose === 'fly') j = P(pose, 'min', [62, 62], { m });
    else if (pose === 'flyBack') j = P(pose, 'min', [-62, 22], { m });
    else if (pose === 'hang' || pose === 'tuckHang') j = P(pose, 'hands', [B[0], B[1]], { m });
    else j = P('support', 'hands', [B[0], B[1]], { m });
  } else if (ag === 'parallele') {
    const B = [0, 85];
    if (['shStand', 'shTuck', 'rollBar', 'rollBarB'].includes(pose)) j = P(pose, 'n', [B[0], B[1] + 3], { m });
    else if (pose === 'brach') j = P(pose, 'n', [B[0], B[1] + 3], { m });
    else if (sortie || fam === 'vrot') j = P('up', 'min', [95, 30], { m, R: 0 });
    else j = P(['swingF', 'swingB', 'support'].includes(pose) ? pose : 'support', 'hands', [B[0], B[1]], { m });
  } else if (ag === 'saut') {
    const top = 50;
    if (pose === 'tuckV' || pose === 'pikeV') j = P(pose, 'hands', [6, top + 2.75], { m });
    else if (pose === 'kneel') j = P(pose, 'knees', [0, top + 2.75], { m });
    else if (pose === 'squat') j = P(pose, 'min', [0, top], { m });
    else if (['hs', 'hsSplit', 'hsArch', 'star', 'starBent'].includes(pose)) j = P(pose, 'hands', [0, top + 2.75], { R, m });
    else if (pose === 'dive') j = P(pose, 'hands', [-4, top + 10], { m });
    else if (/sortie/.test(nm)) j = P(pose, 'min', [88, 34], { R, m });
    else if (air) j = P(pose, 'min', [0, top + 22], { R, m });
    else j = P(pose, 'min', [0, top], { R, m });
  } else if (ag === 'trampo') {
    if (pose === 'dive') j = P(pose, 'hands', [70, 30], { m });
    else if (/roulade/.test(nm)) j = P('rollF', 'min', [78, 14], { m });
    else j = P(pose, 'min', [36, 64], { R, m });
  }
  if (!j) j = P(pose, 'min', [0, 6], { R, m });
  const figs = [{ j }];
  if (tour) arr = 'twist'; else if (fam === 'vrot') arr = salto ? 'av' : 'twist'; else if (fam === 'vol') arr = 'vol';
  if (e.m < 0 && (arr === 'av' || arr === 'ar')) arr = arr === 'av' ? 'ar' : 'av';
  return { ag, figs, arr, pd: !!e.pd, am: e.am || [] };
}

function gymSVG(e, big) {
  const S = gymScene(e), col = (GYM_FAM[e.fam] || GYM_FAM.av).c, J = S.figs[0].j;
  const pts = Object.values(J), xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  let fx0 = Math.min(...xs), fx1 = Math.max(...xs), fy0 = Math.min(...ys), fy1 = Math.max(...ys);
  const fc = [(fx0 + fx1) / 2, (fy0 + fy1) / 2];
  // pareur
  let spot = null;
  if (S.pd) { const floor = S.ag === 'trampo' ? 14 : 6, sx = S.ag === 'fixe' ? 40 : S.ag === 'parallele' ? 40 : S.ag === 'poutre' ? fx1 + 22 : S.ag === 'saut' ? 62 : S.ag === 'trampo' ? 100 : fx1 + 26;
    spot = GYM_SK.place('spot', 'min', [sx, floor], { m: -1 }); }
  // agrès : éléments dessinés + boîte englobante
  const AG = [], bx = [fx0, fx1, Math.min(fy0, 0), fy1];
  const grow = (x0, x1, y0, y1) => { bx[0] = Math.min(bx[0], x0); bx[1] = Math.max(bx[1], x1); bx[2] = Math.min(bx[2], y0); bx[3] = Math.max(bx[3], y1); };
  if (spot) { const sp = Object.values(spot); grow(Math.min(...sp.map(p => p[0])), Math.max(...sp.map(p => p[0])), 0, Math.max(...sp.map(p => p[1]))); }
  const tapis = (x0, x1, h = 6) => { AG.push(['rect', x0, 0, x1 - x0, h, 'tap']); grow(x0, x1, 0, h); };
  if (S.ag === 'sol') { tapis(Math.min(bx[0], -60) - 14, Math.max(bx[1], 60) + 14); if (S.am.includes('tremplin')) { AG.push(['poly', [[-110, 6], [-70, 6], [-70, 18]], 'trem']); grow(-112, 0, 0, 18); } }
  if (S.ag === 'poutre') { AG.push(['rect', -110, 44, 140, 8, 'wood'], ['poly', [[-92, 44], [-84, 44], [-80, 0], [-96, 0]], 'leg'], ['poly', [[4, 44], [12, 44], [16, 0], [0, 0]], 'leg']); grow(-112, 32, 0, 52); tapis(-120, Math.max(bx[1], 60) + 16); }
  if (S.ag === 'fixe') { AG.push(['line', -52, 125, 52, 125, 'bar'], ['line', -50, 125, -50, 0, 'post'], ['line', 50, 125, 50, 0, 'post'], ['line', -50, 125, -80, 0, 'cable'], ['line', 50, 125, 80, 0, 'cable']); grow(-82, 82, 0, 128); tapis(Math.min(bx[0], -90) - 6, Math.max(bx[1], 90) + 6); if (S.am.includes('plinth')) { AG.push(['rect', -58, 6, 34, 52, 'box']); } if (S.am.includes('tremplin')) AG.push(['poly', [[-64, 6], [-24, 6], [-24, 18]], 'trem']); }
  if (S.ag === 'parallele') { AG.push(['line', -78, 89, 72, 89, 'bar2'], ['line', -72, 85, 78, 85, 'bar'], ['line', -52, 85, -52, 0, 'post'], ['line', 56, 85, 56, 0, 'post']); grow(-80, 80, 0, 90); tapis(Math.min(bx[0], -90) - 6, Math.max(bx[1], 90) + 6); }
  if (S.ag === 'saut') { AG.push(['poly', [[-110, 0], [-66, 0], [-66, 14]], 'trem'], ['poly', [[-34, 0], [34, 0], [30, 50], [-30, 50]], 'box'], ['rect', -30, 44, 60, 6, 'pad'], ['line', -33, 12, 33, 12, 'boxl'], ['line', -32, 24, 32, 24, 'boxl'], ['line', -31, 36, 31, 36, 'boxl']); grow(-112, 34, 0, 50); tapis(36, Math.max(bx[1], 120) + 12, 10); }
  if (S.ag === 'trampo') { AG.push(['poly', [[-94, 12], [-36, 30], [-36, 24], [-94, 6]], 'frame'], ['line', -88, 13, -42, 27, 'bed'], ['line', -90, 8, -94, 0, 'post'], ['line', -40, 25, -36, 0, 'post'], ['line', -40, 25, -60, 0, 'post']); grow(-98, -30, 0, 32); tapis(8, Math.max(bx[1], 130) + 10, 14); }
  // flèches
  const ARR = [];
  const pad = 10;
  if (S.arr === 'av' || S.arr === 'ar' || S.arr === 'lat') {
    const r = Math.max(34, Math.max(fx1 - fx0, fy1 - fy0) / 2 + 12), cw = S.arr !== 'ar', a0 = cw ? 150 : 30, a1 = cw ? 40 : 140;
    ARR.push({ k: 'arc', c: fc, r, a0, a1, cw }); grow(fc[0] - r - 4, fc[0] + r + 4, fc[1] - r, fc[1] + r + 6);
  } else if (S.arr === 'twist') {
    const cy = J.p[1] + 8, cx = J.p[0]; ARR.push({ k: 'twist', c: [cx, cy] }); grow(cx - 30, cx + 30, cy - 10, cy + 10);
  } else if (S.arr === 'vol') {
    const base = Math.max(fy0 - 30, S.ag === 'poutre' ? 0 : 0), y0 = fy0 - 6; ARR.push({ k: 'traj', x0: fc[0] - 62, x1: fc[0] + 62, y: fy0 - 26 > 6 ? fy0 - 26 : 6, top: y0 });
  }
  const x0 = bx[0] - pad, x1 = bx[1] + pad, y1 = bx[3] + pad, y0 = Math.min(bx[2], 0) - 4, W = x1 - x0, H = y1 - y0;
  const T = ([x, y]) => [+(x - x0).toFixed(1), +(y1 - y).toFixed(1)];
  const tp = p => T(p).join(',');
  const C = { tap: 'fill="var(--gtap,#BFD6F6)" stroke="none"', wood: 'fill="#C8955A"', leg: 'fill="var(--gleg,#8C98B0)"', bar: 'stroke="var(--gbar,#5B6782)" stroke-width="4" stroke-linecap="round"', bar2: 'stroke="var(--gbar,#5B6782)" stroke-width="4" stroke-linecap="round" opacity=".4"',
    post: 'stroke="var(--gleg,#8C98B0)" stroke-width="3"', cable: 'stroke="var(--gleg,#8C98B0)" stroke-width="1.2" stroke-dasharray="3 3"', trem: 'fill="#D9A441"', box: 'fill="#D9B98A" stroke="#A57C45" stroke-width="1.5"', pad: 'fill="#B5523B"', boxl: 'stroke="#A57C45" stroke-width="1.5"', bed: 'stroke="var(--text,#1d2230)" stroke-width="4" stroke-linecap="round"', frame: 'fill="#E5484D"' };
  const agSvg = AG.map(a => {
    if (a[0] === 'rect') { const p = T([a[1], a[2] + a[4]]); return `<rect x="${p[0]}" y="${p[1]}" width="${a[3]}" height="${a[4]}" rx="${a[5] === 'tap' ? 3 : 2}" ${C[a[5]]}/>`; }
    if (a[0] === 'poly') return `<polygon points="${a[1].map(tp).join(' ')}" ${C[a[2]]}/>`;
    if (a[0] === 'line') { const p = T([a[1], a[2]]), q = T([a[3], a[4]]); return `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" ${C[a[5]]}/>`; }
    return '';
  }).join('');
  const person = (j, c, op) => { const L = (...k) => `<polyline points="${k.map(n => tp(j[n])).join(' ')}"/>`, h = T(j.h);
    return `<g stroke="${c}" fill="none" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" opacity="${op}">${L('m2', 'e2', 'n')}${L('f2', 'k2', 'p')}${L('f1', 'k1', 'p', 'n')}${L('n', 'e1', 'm1')}<circle cx="${h[0]}" cy="${h[1]}" r="7" fill="${c}" stroke="none"/></g>`; };
  const arrSvg = ARR.map(a => {
    const head = (p, d) => { const n = [-d[1], d[0]], t = [p[0] + d[0] * 8, p[1] + d[1] * 8], b1 = [p[0] + n[0] * 5, p[1] + n[1] * 5], b2 = [p[0] - n[0] * 5, p[1] - n[1] * 5];
      return `<polygon points="${[t, b1, b2].map(tp).join(' ')}" fill="${col}"/>`; };
    if (a.k === 'arc') { const P = t => [a.c[0] + a.r * Math.cos(t * Math.PI / 180), a.c[1] + a.r * Math.sin(t * Math.PI / 180)], s = P(a.a0), f = P(a.a1), th = a.a1 * Math.PI / 180;
      const d = a.cw ? [Math.sin(th), -Math.cos(th)] : [-Math.sin(th), Math.cos(th)];
      return `<path d="M${tp(s)} A${a.r.toFixed(1)} ${a.r.toFixed(1)} 0 0 ${a.cw ? 1 : 0} ${tp(f)}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round" opacity=".85"/>${head(f, d)}`; }
    if (a.k === 'twist') { const c = T(a.c); return `<path d="M${c[0] - 26},${c[1] - 2} A26 8 0 1 0 ${c[0] + 22},${c[1] - 6}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round" opacity=".85"/>
      <polygon points="${c[0] + 30},${c[1] - 1} ${c[0] + 18},${c[1] - 2} ${c[0] + 24},${c[1] - 11}" fill="${col}"/>`; }
    if (a.k === 'traj') { const s = T([a.x0, a.y]), f = T([a.x1, a.y]), cp = T([(a.x0 + a.x1) / 2, a.y + 2 * (a.top - a.y)]);
      return `<path d="M${s[0]},${s[1]} Q${cp[0]},${cp[1]} ${f[0]},${f[1]}" fill="none" stroke="${col}" stroke-width="2.5" stroke-dasharray="5 5" opacity=".75"/><polygon points="${f[0] + 3},${f[1] + 6} ${f[0] - 7},${f[1] + 1} ${f[0] + 1},${f[1] - 6}" fill="${col}" opacity=".85"/>`; }
    return '';
  }).join('');
  return `<svg viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" style="width:100%;height:${big ? 'auto' : '110px'};max-height:${big ? '50vh' : '110px'};display:block" role="img" aria-label="${esc(e.n)}">
    <line x1="0" y1="${(y1).toFixed(1)}" x2="${W.toFixed(0)}" y2="${(y1).toFixed(1)}" stroke="var(--line)" stroke-width="3"/>${agSvg}${arrSvg}${spot ? person(spot, 'var(--muted)', .45) : ''}${person(J, col, 1)}</svg>`;
}

/* ---------- Données de l'outil (tout sous DB.gym ; photos : une rubrique par photo) ---------- */
function gymDB() {
  const G = DB.gym = DB.gym || {};
  G.groupes = G.groupes || {}; G.liens = G.liens || []; G.elinks = G.elinks || {}; G.edits = G.edits || {}; G.custom = G.custom || [];
  G.valid = G.valid || {}; G.secu = G.secu || {};
  const def = (k, d) => { G[k] = G[k] || {}; for (const x in d) if (!(x in G[k])) G[k][x] = d[x]; };   // complète sans remplacer l'objet
  def('req', { ag: 'sol', min: 5, fam: 4, max: 'F' }); def('filt', { ag: '', fam: '', niv: '', lt: '', am: '' });
  return G;
}
const gymAll = () => { const G = gymDB(); return [...GYM_E, ...G.custom].map(e => G.edits[e.id] ? { ...e, ...G.edits[e.id], edited: 1 } : e); };
const gymFind = id => gymAll().find(e => e.id === id);
const gymImgKey = id => 'gymImg_' + id;
const gymLt = (e, big) => { const c = (GYM_FAM[e.fam] || GYM_FAM.av).c; return `<span class="gy-lt${big ? ' big' : ''}" style="--c:${c}">${esc(e.lvl)}</span>`; };
const GYM_POSES = { '': 'Auto (d\'après le nom)', up: 'Extension (bras en haut)', tuck: 'Groupé', pike: 'Carpé', strad: 'Écart (de face)', split: 'Enjambé', cat: 'Saut de chat',
  rollF: 'Roulade avant', rollB: 'Roulade arrière', rollFS: 'Roulade avant jambes tendues', rollBS: 'Roulade arrière jambes tendues', dive: 'Plongée', hs: 'ATR', hsSplit: 'ATR jambes écartées',
  hsArch: 'Saut de mains / flic-flac', star: 'Roue', rond: 'Rondade', bridge: 'Pont', walk: 'Renversement', candle: 'Chandelle', tripod: 'Trépied', kneel: 'À genoux', squat: 'Accroupi',
  support: 'Appui (barre)', hang: 'Suspension (barre)', pig: 'Cochon pendu', pikeOver: 'Montée par renversement', fly: 'Sortie en filé', swingF: 'Balancer avant', swingB: 'Balancer arrière', shStand: 'ATR d\'épaules', rollBar: 'Roulade sur les barres' };
const GYM_SECU = {
  gen: ['Échauffement articulaire complet : poignets, épaules, nuque, dos, chevilles.', 'Tenue adaptée : cheveux attachés, ni bijoux ni montre, poches vides, pieds nus ou chaussons.',
    'Un seul élève à la fois par atelier ; les autres attendent à distance, sans pousser.', 'Tapis jointifs, sans trou ni chevauchement, vérifiés avant chaque passage.',
    'Ne tenter un élément que si l\'étape précédente est validée ; respecter le niveau autorisé.', 'Savoir sortir d\'un élément (roulade, quart de tour, réception) avant de le tenter.',
    'Parade : pareur du côté de la rotation, mains prêtes, sans gêner le gymnaste.', 'Arrêt immédiat en cas de douleur, de fatigue ou de peur.', 'Matériel installé et rangé sous le contrôle de l\'enseignant.'],
  sol: ['Tapis jointifs sur toute la longueur de la piste.', 'Rouler sur le haut du dos, jamais sur la tête ni la nuque.', 'Mains à plat, doigts écartés, bras verrouillés (ATR, roue, rondade).',
    '2 m d\'espace libre autour de l\'élève ; départ au signal.', 'Plan incliné et tapis épais pour débuter roulades et saut de mains.'],
  poutre: ['Progresser : ligne au sol → banc → poutre basse habillée.', 'Tapis de chaque côté et au bout de la poutre.', 'Regard fixé au bout de la poutre, bras en balancier.',
    'En cas de déséquilibre : descendre en sautant sur le côté, pieds joints.', 'Pareur qui marche à côté et donne la main aux débutants.'],
  parallele: ['Hauteur réglée (épaules de l\'élève), verrous serrés.', 'Tapis sous et autour des barres, y compris aux sorties.', 'Bras tendus en appui, mains toujours sur les barres.',
    'Parade sous les barres pour les roulades et l\'ATR d\'épaules.', 'Magnésie pour éviter que les mains glissent.'],
  fixe: ['Barre à hauteur de poitrine ou de hanches ; câbles et verrous vérifiés.', 'Prise fermée : le pouce autour de la barre en permanence.', 'Tapis sous la barre et dans la zone de sortie.',
    'Parade aux épaules et aux cuisses pour les tours et les montées.', 'Magnésie ; ne jamais lâcher la barre sans consigne.'],
  saut: ['Tremplin fixé (ne glisse pas), plinth stable à hauteur adaptée.', 'Course d\'élan mesurée avec repère au sol ; un seul sauteur à la fois.', 'Impulsion pieds joints sur le tremplin, mains à plat sur le plinth.',
    'Tapis de réception épais ; réception pieds joints, genoux fléchis.', 'Pareur à la sortie du plinth, du côté de la rotation.'],
  trampo: ['Mini-trampoline stable, pieds bloqués, ressorts couverts.', 'Tapis de réception épais et long devant le mini-trampoline.', 'Impulsion au centre de la toile, bras qui montent, regard devant.',
    'Aucun salto sans parade et sans autorisation de l\'enseignant.', 'Attendre que le tapis soit libre avant de s\'élancer.'],
};

document.head.insertAdjacentHTML('beforeend', `<style>
.gy-tabs{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(104px,1fr))}
.gy-tabs button{font-size:.82rem;padding:10px 4px;white-space:nowrap}
.gy-lt{display:inline-grid;place-items:center;min-width:26px;height:26px;padding:0 5px;border-radius:8px;background:var(--c);color:#fff;font-weight:900;font-size:.9rem;line-height:1}
.gy-lt.big{min-width:40px;height:40px;font-size:1.3rem;border-radius:12px}
.gy-fam{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:18px 2px 8px;padding-left:10px;border-left:6px solid var(--c)}
.gy-fam h2{font-size:1rem;font-weight:800;margin:0;flex:1 1 auto}
.gy-card{padding:10px;border:1.5px solid var(--line);position:relative;border-top:4px solid var(--c)}
.gy-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:10px}
.gy-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:99px;border:1.5px solid var(--line);font-weight:800;font-size:.78rem;background:var(--card)}
.gy-chip.ok{background:rgba(27,158,90,.14);border-color:rgba(27,158,90,.45);color:var(--ok)}
.gy-dot{width:10px;height:10px;border-radius:50%;background:var(--c);display:inline-block;flex:0 0 auto}
.gy-warn{background:rgba(214,69,69,.10);border:1px solid rgba(214,69,69,.3);color:var(--danger);border-radius:12px;padding:8px 12px;font-size:.85rem;margin-top:8px}
.gy-tbl{overflow:auto;margin-top:10px;border:1px solid var(--line);border-radius:14px;background:var(--card);max-height:70vh}
.gy-tbl table{border-collapse:separate;border-spacing:0;min-width:100%}
.gy-tbl th,.gy-tbl td{padding:4px;text-align:center;border-bottom:1px solid var(--line);font-size:.8rem}
.gy-tbl thead th{position:sticky;top:0;background:var(--card);z-index:2}
.gy-tbl thead tr:nth-child(2) th{top:26px}
.gy-tbl th:first-child,.gy-tbl td:first-child{position:sticky;left:0;background:var(--card);z-index:1;text-align:left;font-weight:800;min-width:90px;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-left:8px}
.gy-tbl thead th:first-child{z-index:3}
.gy-tbl th{text-transform:none;letter-spacing:0}
.gy-vn{writing-mode:vertical-rl;transform:rotate(180deg);max-height:165px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;font-size:.7rem;margin:0 auto 4px}
.gy-v{width:34px;height:34px;border-radius:9px;border:1.5px solid var(--line);background:var(--card);font-weight:900;color:var(--muted);cursor:pointer}
.gy-v.on{background:var(--c);color:#fff;border-color:transparent}
.gy-ov{position:fixed;inset:0;z-index:300;background:rgba(7,18,42,.72);display:grid;place-items:center;padding:16px}
.gy-ov>.card{max-width:580px;width:100%;max-height:92vh;overflow:auto}
.gy-secu li{margin:4px 0;line-height:1.4}
</style>`);

TOOL_IMPL.gym = function (el) {
  const Gd = gymDB(), F = Gd.filt;
  let tab = 'elements', cls = DB.classes.some(c => c.name === DB.lastClass) ? DB.lastClass : (DB.classes[0] || {}).name || '', gi = 0;
  let vAg = 'sol', vNiv = '1';
  const groups = () => (Gd.groupes[cls] = Gd.groupes[cls] || []);
  const G = () => groups()[gi] || null;
  if (G()) tab = 'ench';
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const clearImgs = list => list.forEach(g => g.seq.forEach(it => { if (it.img) DB[gymImgKey(it.img)] = null; }));

  function frame() {
    const gs = cls ? groups() : []; if (gi >= gs.length) gi = 0;
    el.innerHTML = `${DB.classes.length ? `<div class="card"><div class="row"><div><label style="margin-top:0">Classe</label><select id="gcl">${DB.classes.map(c => `<option ${c.name === cls ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div><label style="margin-top:0">Groupe</label><select id="ggr">${gs.length ? gs.map((g, k) => `<option value="${k}" ${k === gi ? 'selected' : ''}>${esc(g.name)} (${g.seq.length})</option>`).join('') : '<option>— aucun groupe —</option>'}</select></div></div></div>` : ''}
      <div class="co-tabs gy-tabs" style="margin-top:12px">${[['groupes', '👥 Groupes'], ['elements', '🤸 Éléments'], ['diapos', '🔗 Diaporamas'], ['ench', '🎬 Enchaînement'], ['valid', '✅ Validation'], ['secu', '⚠️ Sécurité']].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div><div id="gb"></div>`;
    el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; frame(); });
    const $ = s => el.querySelector(s);
    if ($('#gcl')) $('#gcl').onchange = e => { cls = e.target.value; DB.lastClass = cls; gi = 0; save(); frame(); };
    if ($('#ggr') && gs.length) $('#ggr').onchange = e => { gi = +e.target.value; frame(); };
    ({ groupes: tabGroupes, elements: tabElements, diapos: tabDiapos, ench: tabEnch, valid: tabValid, secu: tabSecu })[tab]($('#gb'));
  }

  /* ---------- 👥 Groupes ---------- */
  let selSt = null;
  function tabGroupes(box) {
    if (!DB.classes.length) { box.innerHTML = noClassMsg; return; }
    const gs = groups(), placed = new Set(gs.flatMap(g => g.members)), free = studentsOf(cls).filter(n => !placed.has(n));
    const on = (g, n) => selSt && selSt.g === g && selSt.n === n;
    const chip = (g, n) => `<button class="pl-chip" data-st="${g}" data-n="${esc(n)}" style="padding:6px 10px;border-radius:10px;border:1.5px solid var(--line);background:${on(g, n) ? 'var(--grad)' : 'var(--card)'};color:${on(g, n) ? '#fff' : 'inherit'};font-weight:700;font-size:.85rem;cursor:pointer">${esc(n)}</button>`;
    box.innerHTML = `<details class="card" ${gs.length ? '' : 'open'}><summary style="font-weight:800;cursor:pointer">🧩 ${gs.length ? 'Refaire les groupes automatiquement' : 'Former les groupes'}</summary><div id="gycmp" style="margin-top:6px"></div></details>
      <div class="section-title"><h2>Groupes de ${esc(cls)} (${gs.length})</h2>${gs.length ? '<button class="link" id="gydel">Supprimer tous les groupes</button>' : ''}</div>
      ${gs.length || free.length ? `<p class="muted" style="margin:-4px 0 8px;font-size:.82rem">Touchez un élève, puis un autre groupe pour l'y déplacer, ou « Non placés / absents » pour le retirer.</p>` : ''}
      <div class="teams">${gs.map((g, k) => `<div class="card team" data-drop="${k}" style="cursor:pointer;border-top:5px solid ${k === gi ? 'var(--gold)' : 'var(--line)'}">
          <h3><span>${esc(g.name)}</span><span class="muted">${g.members.length}</span></h3>
          <div style="display:flex;flex-wrap:wrap;gap:5px">${g.members.map(n => chip(k, n)).join('') || '<span class="muted">Groupe vide</span>'}</div>
          <div class="muted" style="font-size:.78rem;margin-top:6px">${g.seq.length} élément(s) dans l'enchaînement</div>
          <div class="row" style="margin-top:8px;gap:6px"><button class="btn btn-grad" style="padding:8px" data-open="${k}">🎬 Ouvrir</button><button class="btn btn-ghost" style="padding:8px;flex:0 0 42px" data-ren="${k}">✏️</button><button class="btn btn-ghost" style="padding:8px;flex:0 0 42px" data-gdel="${k}">🗑</button></div></div>`).join('')}
        <div class="card team" data-drop="-1" style="cursor:pointer;border-top:5px dashed var(--line);background:var(--grad-soft)"><h3><span>Non placés / absents</span><span class="muted">${free.length}</span></h3>
          <div style="display:flex;flex-wrap:wrap;gap:5px">${free.map(n => chip(-1, n)).join('') || '<span class="muted">Tous les élèves sont dans un groupe.</span>'}</div></div></div>
      <button class="btn btn-ghost btn-block" style="margin-top:12px" id="gyadd">＋ Nouveau groupe</button>`;
    mountComposer(box.querySelector('#gycmp'), { id: 'gyg', prep: false, modes: ['random', 'hetero', 'homo'], button: '👥 Former les groupes',
      onTeams: teams => { if (gs.some(g => g.seq.length) && !confirm('Remplacer les groupes existants ? Leurs enchaînements seront supprimés.')) return;
        clearImgs(gs); Gd.groupes[cls] = teams.map(t => ({ id: newId(), name: t.name.replace('Équipe', 'Groupe'), members: t.members.map(m => m.n), seq: [] }));
        gi = 0; selSt = null; save(); toast('Groupes formés ✔'); frame(); } });
    const sel = box.querySelector('#gyg-cls'); if (sel) { sel.value = cls; sel.dispatchEvent(new Event('change')); }
    const k = box.querySelector('#gyg-k'), v = box.querySelector('#gyg-v'); if (k && v) { k.value = 's'; v.value = 3; }
    box.querySelectorAll('[data-st]').forEach(b => b.onclick = e => { e.stopPropagation(); const g = +b.dataset.st, n = b.dataset.n; selSt = on(g, n) ? null : { g, n }; tabGroupes(box); });
    box.querySelectorAll('[data-drop]').forEach(c => c.onclick = () => { if (!selSt) return; const to = +c.dataset.drop;
      if (to !== selSt.g) { if (selSt.g >= 0) { const m = gs[selSt.g].members; m.splice(m.indexOf(selSt.n), 1); } if (to >= 0) gs[to].members.push(selSt.n); save(); }
      selSt = null; frame(); });
    box.querySelectorAll('[data-open]').forEach(b => b.onclick = e => { e.stopPropagation(); gi = +b.dataset.open; tab = 'ench'; frame(); });
    box.querySelectorAll('[data-ren]').forEach(b => b.onclick = e => { e.stopPropagation(); const g = gs[+b.dataset.ren], n = prompt('Nom du groupe', g.name); if (n && n.trim()) { g.name = n.trim(); save(); frame(); } });
    box.querySelectorAll('[data-gdel]').forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.gdel, g = gs[i];
      if (!confirm(`Supprimer ${g.name} ?${g.seq.length ? '\nSon enchaînement sera supprimé.' : ''}\nSes élèves passent dans « Non placés ».`)) return;
      clearImgs([g]); gs.splice(i, 1); if (gi >= gs.length) gi = Math.max(0, gs.length - 1); selSt = null; save(); frame(); });
    box.querySelector('#gyadd').onclick = () => { gs.push({ id: newId(), name: 'Groupe ' + (gs.length + 1), members: [], seq: [] }); gi = gs.length - 1; save(); frame(); };
    const d = box.querySelector('#gydel'); if (d) d.onclick = () => { if (!confirm('Supprimer tous les groupes de la classe et leurs enchaînements ?')) return; clearImgs(gs); Gd.groupes[cls] = []; gi = 0; selSt = null; save(); frame(); };
  }

  /* ---------- 🤸 Éléments ---------- */
  const chips = (key, opts) => `<div class="tog">${opts.map(([v, l]) => `<button data-f="${key}" data-v="${v}" class="${String(F[key]) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  const famLinks = (f, ag) => Gd.liens.filter(l => l.url && l.fam === f && (!l.ag || !ag || l.ag === ag));
  const match = e => (!F.ag || e.ag === F.ag) && (!F.fam || e.fam === F.fam) && (!F.niv || GYM_NIV[F.niv].includes(e.lvl)) && (!F.lt || e.lvl === F.lt)
    && (!F.am || (F.am === 'avec' ? (e.am || []).length > 0 : !(e.am || []).length));
  const card = (e, g) => { const c = GYM_FAM[e.fam].c;
    return `<div class="card gy-card" style="--c:${c}"><button data-id="${e.id}" style="all:unset;display:block;cursor:pointer;width:100%">${gymSVG(e)}
      <b style="display:block;margin-top:6px;line-height:1.2">${e.custom || e.edited ? '✏️ ' : ''}${esc(e.n)}</b>
      <div style="display:flex;align-items:center;gap:6px;margin-top:6px">${gymLt(e)}<span class="muted" style="font-size:.74rem;line-height:1.2">${gymPts(e.lvl)} pt${gymPts(e.lvl) > 1 ? 's' : ''} · ${GYM_AG_S[e.ag]}${(e.am || []).filter(a => !(a === 'trampo' && e.ag === 'trampo')).map(a => ' · ' + GYM_AM[a]).join('')}</span></div></button>
      ${g ? `<button class="btn btn-grad" data-add="${e.id}" style="position:absolute;top:6px;right:6px;padding:4px 10px" aria-label="Ajouter">＋</button>` : ''}</div>`; };
  function tabElements(box) {
    const all = gymAll(), list = all.filter(match), g = G();
    const byF = Object.keys(GYM_FAM).map(f => [f, list.filter(e => e.fam === f).sort((a, b) => a.lvl.localeCompare(b.lvl) || a.ag.localeCompare(b.ag))]).filter(([, l]) => l.length);
    box.innerHTML = `<button class="btn btn-grad btn-block" id="gynew" style="margin-bottom:12px">✏️ Créer un élément</button>
      <details class="card" ${Object.values(F).some(Boolean) || !g ? 'open' : ''}><summary style="font-weight:800;cursor:pointer">🔎 Filtres${Object.values(F).some(Boolean) ? ' (actifs)' : ''}</summary>
        <label>Agrès</label>${chips('ag', [['', 'Tous'], ...Object.entries(GYM_AG)])}
        <label>Famille</label>${chips('fam', [['', 'Toutes'], ...Object.entries(GYM_FAM).map(([k, f]) => [k, `<span class="gy-dot" style="--c:${f.c}"></span> ${f.n}`])])}
        <label>Niveau</label>${chips('niv', [['', 'Tous'], ['1', 'Niveau 1 (A–D)'], ['2', 'Niveau 2 (C–F)']])}
        <label>Lettre</label>${chips('lt', [['', 'Toutes'], ...GYM_LT.map(l => [l, `${l} · ${gymPts(l)} pt${l === 'A' ? '' : 's'}`])])}
        <label>Aménagement (tremplin, plinth, mini-trampoline)</label>${chips('am', [['', 'Tous'], ['avec', 'Avec aménagement'], ['sans', 'Sans aménagement']])}
        ${Object.values(F).some(Boolean) ? '<button class="link" id="gyfx" style="margin-top:10px">✕ Effacer les filtres</button>' : ''}</details>
      <div class="section-title"><h2>${list.length} élément${list.length > 1 ? 's' : ''}</h2><span class="muted" style="font-size:.78rem">A = 1 pt … F = 6 pts</span></div>
      ${g ? `<p class="muted" style="margin:-4px 0 8px;font-size:.82rem">Touchez ＋ pour ajouter un élément à l'enchaînement de <b>${esc(g.name)}</b>.</p>` : ''}
      ${byF.map(([f, l]) => `<div class="gy-fam" style="--c:${GYM_FAM[f].c}"><h2>${GYM_FAM[f].n} <span class="muted" style="font-weight:700">(${l.length})</span></h2>
          ${famLinks(f, F.ag).map(li => `<button class="btn btn-ghost" style="flex:0 0 auto;padding:6px 10px;font-size:.8rem" data-fl="${li.id}" title="${esc(li.n)}">${acroBtn(li.url)} · ${esc(li.n)}</button>`).join('')}</div>
        <div class="gy-grid">${l.map(e => card(e, g)).join('')}</div>`).join('') || '<div class="card empty">Aucun élément avec ces critères.</div>'}`;
    box.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { F[b.dataset.f] = b.dataset.v; save(); tabElements(box); });
    const fx = box.querySelector('#gyfx'); if (fx) fx.onclick = () => { Object.keys(F).forEach(k => F[k] = ''); save(); tabElements(box); };
    box.querySelectorAll('[data-id]').forEach(b => b.onclick = () => detail(gymFind(b.dataset.id)));
    box.querySelectorAll('[data-add]').forEach(b => b.onclick = () => addEl(b.dataset.add));
    box.querySelectorAll('[data-fl]').forEach(b => b.onclick = () => acroVideo(Gd.liens.find(x => x.id === b.dataset.fl)));
    box.querySelector('#gynew').onclick = () => editor(null);
  }
  const addEl = id => { const g = G(); if (!g) return toast('Formez d\'abord un groupe'); g.seq.push({ k: newId(), t: 'el', el: id }); save(); toast(`Ajouté à ${g.name} (${g.seq.length}) ✔`); frame(); };

  function detail(e) {
    if (!e) return;
    const o = document.createElement('div'), g = G(), f = GYM_FAM[e.fam], url = Gd.elinks[e.id] || '';
    const rel = Gd.liens.filter(l => l.url && (l.fam === e.fam || !l.fam) && (!l.ag || l.ag === e.ag) && (l.fam || l.ag));
    o.className = 'gy-ov';
    o.innerHTML = `<div class="card" style="border-top:6px solid ${f.c}">
        <div style="display:flex;gap:10px;align-items:flex-start">${gymLt(e, true)}<div style="flex:1;min-width:0"><h3 style="font-size:1.2rem;margin:0">${esc(e.n)}</h3>
          <div class="muted" style="font-size:.82rem;margin-top:2px">${GYM_AG[e.ag]} · <b style="color:${f.c}">${f.n}</b> · ${gymPts(e.lvl)} pt${gymPts(e.lvl) > 1 ? 's' : ''} · Niveau ${GYM_NIV[1].includes(e.lvl) && GYM_NIV[2].includes(e.lvl) ? '1 et 2' : GYM_NIV[1].includes(e.lvl) ? '1' : '2'}</div></div></div>
        <div style="margin-top:10px">${gymSVG(e, true)}</div>
        ${(e.am || []).length ? `<p style="margin:10px 0 4px"><b>Aménagement :</b> ${e.am.map(a => GYM_AM[a]).join(', ')}</p>` : ''}
        <p style="margin:8px 0 4px"><b>✅ Critères de réussite :</b> ${esc(e.c || '—')}</p>
        <p style="margin:4px 0"><b>⚠️ Sécurité / parade :</b> ${esc(e.s || '—')}</p>
        ${url || rel.length ? `<div class="row" style="margin-top:10px;gap:6px">${url ? `<button class="btn btn-grad" id="gyvl">${acroBtn(url)} de l'élément</button>` : ''}${rel.map(l => `<button class="btn btn-ghost" data-rl="${l.id}">${acroBtn(l.url)} · ${esc(l.n)}</button>`).join('')}</div>` : ''}
        ${g ? `<button class="btn btn-grad btn-block" style="margin-top:12px" id="gyadd1">➕ Ajouter à l'enchaînement de ${esc(g.name)}</button>` : ''}
        <details class="card" style="margin-top:12px;padding:10px 12px"><summary data-prof style="font-weight:800;cursor:pointer">🔒 Lien diaporama / vidéo de l'élément</summary>
          <input id="gyurl" value="${esc(url)}" placeholder="https://… (PowerPoint, Google Slides, PDF, YouTube, vidéo…)" inputmode="url" autocapitalize="off" style="margin-top:8px">
          <div class="row" style="margin-top:8px"><button class="btn btn-grad" id="gyurls">💾 Enregistrer le lien</button>${url ? '<button class="btn btn-ghost" id="gyurlx">🗑 Retirer</button>' : ''}</div></details>
        <div class="row" style="margin-top:10px"><button class="btn btn-ghost" data-prof id="gyed">✏️ Modifier</button>${e.custom ? '<button class="btn btn-ghost" data-prof id="gydl">🗑 Supprimer</button>' : e.edited ? '<button class="btn btn-ghost" data-prof id="gyrs">↺ Rétablir l\'original</button>' : ''}</div>
        <button class="btn btn-ghost btn-block" style="margin-top:8px" id="gyx">Fermer</button></div>`;
    const close = () => o.remove();
    o.onclick = ev => { if (ev.target === o) close(); };
    const $ = s => o.querySelector(s);
    $('#gyx').onclick = close;
    if ($('#gyvl')) $('#gyvl').onclick = () => acroVideo({ n: e.n, url });
    o.querySelectorAll('[data-rl]').forEach(b => b.onclick = () => acroVideo(Gd.liens.find(x => x.id === b.dataset.rl)));
    if ($('#gyadd1')) $('#gyadd1').onclick = () => { close(); addEl(e.id); };
    $('#gyurls').onclick = () => { const u = $('#gyurl').value.trim(); if (u && !/^https?:\/\//i.test(u)) return toast('Le lien doit commencer par https://');
      if (u) Gd.elinks[e.id] = u; else delete Gd.elinks[e.id]; save(); toast('Lien enregistré ✔'); close(); detail(gymFind(e.id)); };
    if ($('#gyurlx')) $('#gyurlx').onclick = () => { delete Gd.elinks[e.id]; save(); toast('Lien retiré'); close(); detail(gymFind(e.id)); };
    $('#gyed').onclick = () => { close(); editor(e); };
    if ($('#gydl')) $('#gydl').onclick = () => { if (!confirm(`Supprimer « ${e.n} » ?`)) return; Gd.custom = Gd.custom.filter(x => x.id !== e.id); delete Gd.elinks[e.id]; save(); toast('Élément supprimé'); close(); frame(); };
    if ($('#gyrs')) $('#gyrs').onclick = () => { if (!confirm('Rétablir le nom, la lettre et les textes d\'origine ?')) return; delete Gd.edits[e.id]; save(); toast('Élément rétabli'); close(); frame(); };
    document.body.appendChild(o);
  }

  /* Création / modification d'un élément */
  function editor(src) {
    const custom = !src || src.custom, base = src ? GYM_E.find(x => x.id === src.id) : null;
    const E = src ? { ...src, am: [...(src.am || [])] } : { n: '', ag: F.ag || 'sol', fam: F.fam || 'av', lvl: F.lt || 'A', am: [], c: '', s: '', v: '' };
    const o = document.createElement('div'); o.className = 'gy-ov'; document.body.appendChild(o);
    const draw = () => {
      o.innerHTML = `<div class="card"><div style="display:flex;align-items:center;gap:10px"><h3 style="flex:1;margin:0">${src ? '✏️ Modifier l\'élément' : '✏️ Nouvel élément'}</h3><button class="btn btn-ghost" id="gex" style="flex:0 0 auto">✕</button></div>
        <div id="gepv" style="margin-top:8px;border-radius:12px;background:var(--grad-soft);padding:6px">${gymSVG(E, true)}</div>
        <label>Nom</label><input id="gen" value="${esc(E.n)}" placeholder="ex : Roulade avant jambes écartées">
        ${custom ? `<div class="row"><div><label>Agrès</label><select id="gea">${Object.entries(GYM_AG).map(([k, l]) => `<option value="${k}" ${E.ag === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Famille</label><select id="gef">${Object.entries(GYM_FAM).map(([k, f]) => `<option value="${k}" ${E.fam === k ? 'selected' : ''}>${f.n}</option>`).join('')}</select></div></div>` : `<p class="muted" style="margin:6px 0 0;font-size:.82rem">${GYM_AG[E.ag]} · ${GYM_FAM[E.fam].n}</p>`}
        <label>Lettre (valeur)</label><div class="tog">${GYM_LT.map(l => `<button data-lt="${l}" class="${E.lvl === l ? 'on' : ''}">${l} · ${gymPts(l)}</button>`).join('')}</div>
        ${custom ? `<label>Aménagement</label><div class="tog">${Object.entries(GYM_AM).map(([k, l]) => `<button data-am="${k}" class="${E.am.includes(k) ? 'on' : ''}">${l}</button>`).join('')}</div>
          <label>Pictogramme</label><select id="gev">${Object.entries(GYM_POSES).map(([k, l]) => `<option value="${k}" ${(E.v || '') === k ? 'selected' : ''}>${l}</option>`).join('')}</select>` : ''}
        <label>Critères de réussite</label><textarea id="gec" rows="2">${esc(E.c || '')}</textarea>
        <label>Sécurité / parade</label><textarea id="ges" rows="2">${esc(E.s || '')}</textarea>
        <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="geok">💾 Enregistrer</button><button class="btn btn-ghost" id="geko">Annuler</button></div></div>`;
      const $ = s => o.querySelector(s), pv = () => { $('#gepv').innerHTML = gymSVG(E, true); };
      $('#gen').oninput = ev => { E.n = ev.target.value; if (custom) pv(); };
      $('#gec').oninput = ev => { E.c = ev.target.value; }; $('#ges').oninput = ev => { E.s = ev.target.value; };
      if ($('#gea')) $('#gea').onchange = ev => { E.ag = ev.target.value; pv(); };
      if ($('#gef')) $('#gef').onchange = ev => { E.fam = ev.target.value; pv(); };
      if ($('#gev')) $('#gev').onchange = ev => { E.v = ev.target.value; pv(); };
      o.querySelectorAll('[data-lt]').forEach(b => b.onclick = () => { E.lvl = b.dataset.lt; o.querySelectorAll('[data-lt]').forEach(x => x.classList.toggle('on', x === b)); });
      o.querySelectorAll('[data-am]').forEach(b => b.onclick = () => { const k = b.dataset.am, i = E.am.indexOf(k); if (i >= 0) E.am.splice(i, 1); else E.am.push(k); b.classList.toggle('on', i < 0); pv(); });
      $('#gex').onclick = $('#geko').onclick = () => o.remove();
      $('#geok').onclick = () => {
        const n = E.n.trim(); if (!n) { toast('Donnez un nom à l\'élément'); $('#gen').focus(); return; }
        if (custom) { const x = { id: src ? src.id : 'g' + newId(), n, ag: E.ag, fam: E.fam, lvl: E.lvl, am: [...E.am], c: E.c.trim(), s: E.s.trim(), custom: 1 }; if (E.v) x.v = E.v;
          const i = Gd.custom.findIndex(y => y.id === x.id); if (i >= 0) Gd.custom[i] = x; else Gd.custom.push(x); }
        else { const d = {}; ['n', 'c', 's', 'lvl'].forEach(k => { const v = k === 'n' ? n : (E[k] || '').trim(); if (v !== base[k]) d[k] = v; });
          if (Object.keys(d).length) Gd.edits[src.id] = d; else delete Gd.edits[src.id]; }
        save(); o.remove(); toast('Élément enregistré ✔'); frame();
      };
    };
    draw();
  }

  /* ---------- 🔗 Diaporamas ---------- */
  let liEdit = null;
  function tabDiapos(box) {
    const L = Gd.liens, ed = liEdit === 'new' ? { n: '', url: '', d: '', fam: F.fam || '', ag: F.ag || '' } : L.find(x => x.id === liEdit);
    box.innerHTML = `<div class="card doc"><p style="margin:0;line-height:1.45">Vos <b>diaporamas</b> (PowerPoint, Google Slides, PDF) et <b>vidéos</b> de démonstration, par famille et/ou par agrès. Un diaporama associé à une famille s'affiche aussi en tête de cette famille dans l'onglet 🤸 Éléments.</p></div>
      ${ed ? `<div class="card" style="margin-top:12px"><h3>${liEdit === 'new' ? 'Nouveau diaporama / vidéo' : 'Modifier'}</h3>
        <label>Nom</label><input id="gln" value="${esc(ed.n)}" placeholder="Ex. : Tourner en avant – Niveau 1">
        <label>Lien</label><input id="glu" value="${esc(ed.url)}" placeholder="https://… (PowerPoint, Google Slides, PDF, YouTube, vidéo…)" inputmode="url" autocapitalize="off">
        <div class="row"><div><label>Famille</label><select id="glf"><option value="">— Aucune —</option>${Object.entries(GYM_FAM).map(([k, f]) => `<option value="${k}" ${ed.fam === k ? 'selected' : ''}>${f.n}</option>`).join('')}</select></div>
          <div><label>Agrès</label><select id="gla"><option value="">— Tous —</option>${Object.entries(GYM_AG).map(([k, l]) => `<option value="${k}" ${ed.ag === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
        <label>Description</label><textarea id="gld" style="min-height:60px">${esc(ed.d || '')}</textarea>
        <div class="row" style="margin-top:10px"><button class="btn btn-grad" id="gls">💾 Enregistrer</button><button class="btn btn-ghost" id="glc">Annuler</button></div></div>`
      : '<button class="btn btn-grad btn-block" style="margin-top:12px" id="glnew">＋ Ajouter un diaporama / une vidéo</button>'}
      <div class="section-title"><h2>${L.length} diaporama${L.length > 1 ? 's' : ''} / vidéo${L.length > 1 ? 's' : ''}</h2></div>
      ${L.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">${L.map(x => `<div class="card" style="padding:12px;${x.fam ? `border-left:6px solid ${GYM_FAM[x.fam].c}` : ''}">
          <b style="font-size:1.05rem">🔗 ${esc(x.n)}</b>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px">${x.fam ? `<span class="gy-chip"><span class="gy-dot" style="--c:${GYM_FAM[x.fam].c}"></span>${GYM_FAM[x.fam].n}</span>` : ''}${x.ag ? `<span class="gy-chip">${GYM_AG_S[x.ag]}</span>` : ''}</div>
          ${x.d ? `<div class="muted" style="font-size:.85rem;margin-top:6px">${esc(x.d)}</div>` : ''}
          <div class="row" style="margin-top:10px;gap:6px">${x.url ? `<button class="btn btn-grad" data-lv="${x.id}">${acroBtn(x.url)}</button>` : '<span class="muted" style="font-size:.8rem">Pas de lien</span>'}
            <button class="btn btn-ghost" style="flex:0 0 46px;padding:6px" data-le="${x.id}" aria-label="Modifier">✏️</button><button class="btn btn-ghost" style="flex:0 0 46px;padding:6px" data-lx="${x.id}" aria-label="Supprimer">🗑</button></div></div>`).join('')}</div>`
      : '<div class="card empty">Aucun diaporama pour l\'instant. Ajoutez vos liens (ex. : « Tourner en avant – Niveau 1 », « Barre fixe »).</div>'}`;
    const $ = q => box.querySelector(q);
    if ($('#glnew')) $('#glnew').onclick = () => { liEdit = 'new'; tabDiapos(box); };
    if ($('#glc')) $('#glc').onclick = () => { liEdit = null; tabDiapos(box); };
    if ($('#gls')) $('#gls').onclick = () => { const n = $('#gln').value.trim(), url = $('#glu').value.trim(), d = $('#gld').value.trim(), fam = $('#glf').value, ag = $('#gla').value;
      if (!n) return toast('Indiquez un nom'); if (url && !/^https?:\/\//i.test(url)) return toast('Le lien doit commencer par https://');
      if (liEdit === 'new') L.push({ id: newId(), n, url, d, fam, ag }); else Object.assign(L.find(x => x.id === liEdit), { n, url, d, fam, ag });
      liEdit = null; save(); toast('Diaporama enregistré ✔'); tabDiapos(box); };
    box.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => acroVideo(L.find(x => x.id === b.dataset.lv)));
    box.querySelectorAll('[data-le]').forEach(b => b.onclick = () => { liEdit = b.dataset.le; tabDiapos(box); window.scrollTo(0, 0); });
    box.querySelectorAll('[data-lx]').forEach(b => b.onclick = () => { if (!confirm('Supprimer ce lien ?')) return; Gd.liens = Gd.liens.filter(x => x.id !== b.dataset.lx); save(); tabDiapos(box); });
  }

  /* ---------- 🎬 Enchaînement ---------- */
  function reqCheck(g) {
    const R = Gd.req, els = g.seq.filter(it => it.t === 'el').map(it => gymFind(it.el)).filter(Boolean);
    const fams = new Set(els.map(e => e.fam)), pts = els.reduce((a, e) => a + gymPts(e.lvl), 0), W = [];
    if (els.length < R.min) W.push(`${els.length} élément${els.length > 1 ? 's' : ''} sur ${R.min} demandés.`);
    if (fams.size < R.fam) W.push(`${fams.size} famille${fams.size > 1 ? 's' : ''} sur ${R.fam} demandées.`);
    const over = els.filter(e => gymPts(e.lvl) > gymPts(R.max)); if (over.length) W.push(`Lettre au-dessus de ${R.max} : ${[...new Set(over.map(e => e.n))].join(', ')}.`);
    const off = R.ag ? els.filter(e => e.ag !== R.ag) : []; if (off.length) W.push(`Hors agrès (${GYM_AG_S[R.ag]}) : ${[...new Set(off.map(e => e.n))].join(', ')}.`);
    return { els, fams, pts, W };
  }
  let reqOpen = false;
  function tabEnch(box) {
    if (!DB.classes.length) { box.innerHTML = noClassMsg; return; }
    const g = G();
    if (!g) { box.innerHTML = `<div class="card empty">Formez d'abord les groupes de la classe.<br><br><button class="btn btn-grad" id="gygo">👥 Former les groupes</button></div>`; box.querySelector('#gygo').onclick = () => { tab = 'groupes'; frame(); }; return; }
    const R = Gd.req, C = reqCheck(g);
    box.innerHTML = `<div class="card"><b>${esc(g.name)}</b><div class="muted">${g.members.map(esc).join(', ') || 'Aucun élève'}</div></div>
      <div class="card" style="margin-top:12px">
        <div class="result" style="margin-top:0"><div class="card"><b>${C.pts}</b><small>points</small></div><div class="card"><b>${C.els.length}</b><small>élément${C.els.length > 1 ? 's' : ''} / ${R.min}</small></div><div class="card"><b>${C.fams.size}</b><small>famille${C.fams.size > 1 ? 's' : ''} / ${R.fam}</small></div></div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">${Object.entries(GYM_FAM).map(([k, f]) => `<span class="gy-chip ${C.fams.has(k) ? 'ok' : ''}"><span class="gy-dot" style="--c:${f.c}"></span>${C.fams.has(k) ? '✓ ' : ''}${f.n}</span>`).join('')}</div>
        ${C.W.length ? `<div class="gy-warn">⚠️ ${C.W.map(esc).join('<br>⚠️ ')}</div>` : '<div class="gy-chip ok" style="margin-top:10px">✓ Exigences respectées</div>'}
        <details id="greq" style="margin-top:10px" ${reqOpen ? 'open' : ''}><summary class="muted" style="cursor:pointer;font-weight:800">⚙️ Exigences de l'enchaînement</summary>
          <div class="row"><div><label>Agrès</label><select id="grag"><option value="">Tous</option>${Object.entries(GYM_AG).map(([k, l]) => `<option value="${k}" ${R.ag === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
            <div><label>Lettre maximale</label><select id="grmx">${GYM_LT.map(l => `<option ${R.max === l ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
          <div class="row"><div><label>Éléments minimum</label><input id="grmn" type="number" min="1" max="20" value="${R.min}"></div><div><label>Familles différentes</label><input id="grfm" type="number" min="1" max="6" value="${R.fam}"></div></div></details></div>
      <div class="row" style="margin-top:12px"><button class="btn btn-ghost" id="gyel">🤸 Ajouter un élément</button>
        <label class="btn btn-ghost" style="display:block;text-align:center;cursor:pointer;margin:0">📷 Ajouter une photo<input id="gyph" type="file" accept="image/*" capture="environment" style="display:none"></label></div>
      ${g.seq.length ? `<button class="btn btn-grad btn-block" style="margin-top:10px" id="gyplay">▶ Présenter l'enchaînement</button>` : ''}
      <div class="section-title"><h2>Enchaînement (${g.seq.length})</h2>${g.seq.length ? '<button class="link" id="gyclr">🗑 Vider</button>' : ''}</div>
      ${g.seq.length ? `<div style="display:flex;flex-direction:column;gap:10px">${g.seq.map((it, k) => { const e = it.t === 'el' ? gymFind(it.el) : null, img = it.img ? DB[gymImgKey(it.img)] : null, c = e ? GYM_FAM[e.fam].c : 'var(--line)';
        return `<div class="card" style="padding:10px;display:flex;gap:10px;align-items:center;border-left:6px solid ${c}">
          <div style="flex:0 0 30px;height:30px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;font-weight:900">${k + 1}</div>
          <div style="flex:1;min-width:0;display:flex;gap:8px;align-items:center">
            ${e ? `<div style="flex:1;min-width:0;cursor:pointer" data-det="${esc(e.id)}">${gymSVG(e)}</div>` : it.t === 'el' ? '<div class="muted" style="flex:1">Élément supprimé</div>' : ''}
            ${img ? `<img src="${img}" data-z="${k}" style="flex:1;min-width:0;max-height:110px;object-fit:contain;border-radius:10px;background:#000;cursor:zoom-in">` : ''}</div>
          <div style="flex:0 0 auto;display:flex;flex-direction:column;gap:4px;align-items:stretch;max-width:124px">
            <div style="font-size:.78rem;font-weight:800;line-height:1.2">${e ? `${gymLt(e)} ${esc(e.n)}` : 'Photo'}</div>
            ${e ? `<label class="btn btn-ghost" style="padding:5px 8px;font-size:.75rem;cursor:pointer;margin:0;text-align:center">📷 ${img ? 'Changer' : 'Photo'}<input data-ph="${k}" type="file" accept="image/*" capture="environment" style="display:none"></label>` : ''}
            <div style="display:flex;gap:4px"><button class="btn btn-ghost" style="padding:5px 8px" data-up="${k}" ${k ? '' : 'disabled'}>↑</button><button class="btn btn-ghost" style="padding:5px 8px" data-dn="${k}" ${k < g.seq.length - 1 ? '' : 'disabled'}>↓</button><button class="btn btn-ghost" style="padding:5px 8px" data-rm="${k}">✕</button></div></div></div>`; }).join('')}</div>`
        : '<div class="card empty">L\'enchaînement est vide : ajoutez des éléments de la banque ou des photos du groupe.</div>'}`;
    const $ = s => box.querySelector(s);
    const setR = (k, v) => { R[k] = v; save(); tabEnch(box); };
    $('#grag').onchange = e => setR('ag', e.target.value); $('#grmx').onchange = e => setR('max', e.target.value);
    $('#grmn').onchange = e => setR('min', Math.max(1, Math.min(20, +e.target.value || 5))); $('#grfm').onchange = e => setR('fam', Math.max(1, Math.min(6, +e.target.value || 4)));
    $('#greq').ontoggle = e => { reqOpen = e.target.open; };
    $('#gyel').onclick = () => { if (R.ag && !F.ag) { F.ag = R.ag; save(); } tab = 'elements'; frame(); };
    box.querySelectorAll('[data-det]').forEach(d => d.onclick = () => detail(gymFind(d.dataset.det)));
    const setImg = async (file, it) => { try { const d = await acroPhoto(file); const id = it.img || newId(); DB[gymImgKey(id)] = d; it.img = id; save(); tabEnch(box); } catch (e) { toast(e.message); } };
    $('#gyph').onchange = e => { const f = e.target.files[0]; if (!f) return; const it = { k: newId(), t: 'photo' }; g.seq.push(it); setImg(f, it); };
    box.querySelectorAll('[data-ph]').forEach(i => i.onchange = e => { const f = e.target.files[0]; if (f) setImg(f, g.seq[+i.dataset.ph]); });
    box.querySelectorAll('[data-z]').forEach(i => i.onclick = () => acroZoom(i.src));
    const mv = (k, d) => { const [x] = g.seq.splice(k, 1); g.seq.splice(k + d, 0, x); save(); tabEnch(box); };
    box.querySelectorAll('[data-up]').forEach(b => b.onclick = () => mv(+b.dataset.up, -1));
    box.querySelectorAll('[data-dn]').forEach(b => b.onclick = () => mv(+b.dataset.dn, 1));
    box.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { if (!confirm('Retirer cet élément de l\'enchaînement ?')) return; const [x] = g.seq.splice(+b.dataset.rm, 1); if (x.img) DB[gymImgKey(x.img)] = null; save(); frame(); });
    if ($('#gyplay')) $('#gyplay').onclick = () => present(g);
    if ($('#gyclr')) $('#gyclr').onclick = () => { if (!confirm(`Vider l'enchaînement de ${g.name} ?`)) return; clearImgs([g]); g.seq = []; save(); frame(); };
  }
  function present(g) {
    let k = 0; const o = document.createElement('div');
    o.style.cssText = 'position:fixed;inset:0;z-index:310;background:var(--bg,#fff);display:flex;flex-direction:column;padding:16px;overflow:auto';
    const show = () => { const it = g.seq[k], e = it.t === 'el' ? gymFind(it.el) : null, img = it.img ? DB[gymImgKey(it.img)] : null, url = e && Gd.elinks[e.id];
      o.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>${esc(g.name)} · ${k + 1} / ${g.seq.length}</b><button class="btn btn-ghost" style="flex:0 0 auto" id="pq">✕ Fermer</button></div>
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:10px 0">${e ? gymLt(e, true) : ''}<h3 style="margin:0;font-size:1.3rem">${e ? esc(e.n) : 'Photo ' + (k + 1)}</h3></div>
        ${e ? `<p class="muted" style="text-align:center;margin:0 0 6px">${GYM_AG[e.ag]} · <b style="color:${GYM_FAM[e.fam].c}">${GYM_FAM[e.fam].n}</b> · ${gymPts(e.lvl)} pt${gymPts(e.lvl) > 1 ? 's' : ''}</p>` : ''}
        <div style="flex:1;display:flex;gap:12px;align-items:center;justify-content:center;min-height:0;flex-wrap:wrap">${e ? `<div style="flex:1 1 280px;max-width:560px">${gymSVG(e, true)}</div>` : ''}${img ? `<img src="${img}" style="flex:1 1 280px;max-width:520px;max-height:62vh;object-fit:contain;border-radius:12px">` : ''}</div>
        ${e ? `<p style="text-align:center;margin:10px auto 0;max-width:620px"><b>✅</b> ${esc(e.c || '')}</p>` : ''}
        ${url ? `<div style="text-align:center;margin-top:8px"><button class="btn btn-grad" id="pv">${acroBtn(url)}</button></div>` : ''}
        <div class="row" style="margin-top:12px"><button class="btn btn-ghost" id="pp" ${k ? '' : 'disabled'}>← Précédent</button><button class="btn btn-grad" id="pn" ${k < g.seq.length - 1 ? '' : 'disabled'}>Suivant →</button></div>`;
      o.querySelector('#pq').onclick = () => o.remove();
      if (o.querySelector('#pv')) o.querySelector('#pv').onclick = () => acroVideo({ n: e.n, url });
      o.querySelector('#pp').onclick = () => { k--; show(); }; o.querySelector('#pn').onclick = () => { k++; show(); }; };
    show(); document.body.appendChild(o);
  }

  /* ---------- ✅ Validation des ateliers ---------- */
  function tabValid(box) {
    if (!DB.classes.length) { box.innerHTML = noClassMsg; return; }
    const st = studentsOf(cls), V = (Gd.valid[cls] = Gd.valid[cls] || {});
    const agEls = gymAll().filter(e => e.ag === vAg), cols = agEls.filter(e => !vNiv || GYM_NIV[vNiv].includes(e.lvl));
    const fams = Object.keys(GYM_FAM).map(f => [f, cols.filter(e => e.fam === f).sort((a, b) => a.lvl.localeCompare(b.lvl))]).filter(([, l]) => l.length);
    const ordered = fams.flatMap(([, l]) => l);
    const stat = n => { const v = V[n] || {}, ok = agEls.filter(e => v[e.id]); const best = {};
      ok.forEach(e => { if (!best[e.fam] || gymPts(e.lvl) > gymPts(best[e.fam])) best[e.fam] = e.lvl; });
      return { pts: ok.reduce((a, e) => a + gymPts(e.lvl), 0), n: ok.length, best }; };
    const bestHtml = b => Object.keys(GYM_FAM).map(f => `<span class="gy-lt" style="--c:${b[f] ? GYM_FAM[f].c : 'var(--line)'};min-width:20px;height:20px;font-size:.7rem;border-radius:6px;color:${b[f] ? '#fff' : 'var(--muted)'}" title="${GYM_FAM[f].n}">${b[f] || '·'}</span>`).join('');
    box.innerHTML = `<div class="card"><h3 style="margin:0 0 4px">Validation des ateliers</h3><p class="muted" style="margin:0 0 6px;font-size:.82rem">Choisissez l'agrès et le niveau, puis touchez une case pour valider (ou dévalider) un élément réussi.</p>
        <label>Agrès</label><div class="tog">${Object.entries(GYM_AG_S).map(([k, l]) => `<button data-va="${k}" class="${vAg === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <label>Niveau</label><div class="tog">${[['1', 'Niveau 1 (A–D)'], ['2', 'Niveau 2 (C–F)'], ['', 'Toutes les lettres']].map(([k, l]) => `<button data-vn="${k}" class="${vNiv === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      ${!st.length ? '<div class="card empty" style="margin-top:12px">Aucun élève dans cette classe.</div>' : !ordered.length ? '<div class="card empty" style="margin-top:12px">Aucun élément pour cet agrès et ce niveau.</div>' : `
      <div class="gy-tbl"><table><thead><tr><th rowspan="2">${esc(cls)}</th>${fams.map(([f, l]) => `<th colspan="${l.length}" style="background:${GYM_FAM[f].c};color:#fff;font-size:.7rem;white-space:nowrap;overflow:hidden;max-width:${l.length * 44}px;text-overflow:ellipsis;height:26px">${GYM_FAM[f].n}</th>`).join('')}<th rowspan="2">Pts</th><th rowspan="2" style="min-width:150px">Meilleure lettre<br>par famille</th></tr>
        <tr>${ordered.map(e => `<th style="vertical-align:bottom;min-width:40px" title="${esc(e.n)}"><div class="gy-vn">${esc(e.n)}</div>${gymLt(e)}</th>`).join('')}</tr></thead>
        <tbody>${st.map((n, i) => { const S = stat(n), v = V[n] || {};
          return `<tr data-row="${i}"><td title="${esc(n)}">${esc(n)}</td>${ordered.map(e => `<td><button class="gy-v ${v[e.id] ? 'on' : ''}" style="--c:${GYM_FAM[e.fam].c}" data-vc="${i}|${esc(e.id)}" aria-label="${esc(n)} : ${esc(e.n)}">${v[e.id] ? '✓' : e.lvl}</button></td>`).join('')}
            <td><b data-pts="${i}">${S.pts}</b></td><td data-best="${i}" style="white-space:nowrap">${bestHtml(S.best)}</td></tr>`; }).join('')}</tbody></table></div>
      <p class="muted" style="font-size:.78rem;margin:6px 2px 0">Points et meilleures lettres : tous les éléments validés sur l'agrès ${esc(GYM_AG_S[vAg])} (A = 1 pt … F = 6 pts).</p>
      <div class="row" style="margin-top:12px"><button class="btn btn-grad" id="gvres">📤 Envoyer dans Résultats des élèves</button><button class="btn btn-ghost" id="gvcsv">⬇️ Export CSV</button></div>`}`;
    box.querySelectorAll('[data-va]').forEach(b => b.onclick = () => { vAg = b.dataset.va; tabValid(box); });
    box.querySelectorAll('[data-vn]').forEach(b => b.onclick = () => { vNiv = b.dataset.vn; tabValid(box); });
    box.querySelectorAll('[data-vc]').forEach(b => b.onclick = () => { const [i, id] = b.dataset.vc.split('|'), n = st[+i], v = (V[n] = V[n] || {}), e = gymFind(id);
      if (v[id]) delete v[id]; else v[id] = Date.now(); save();
      b.classList.toggle('on', !!v[id]); b.textContent = v[id] ? '✓' : e.lvl;
      const S = stat(n); box.querySelector(`[data-pts="${i}"]`).textContent = S.pts; box.querySelector(`[data-best="${i}"]`).innerHTML = bestHtml(S.best); });
    const bestTxt = b => Object.keys(GYM_FAM).filter(f => b[f]).map(f => `${GYM_FAM[f].n} ${b[f]}`).join(' · ');
    const res = box.querySelector('#gvres'); if (res) res.onclick = () => {
      const rows = st.map(n => ({ n, S: stat(n) })).filter(r => r.S.n);
      if (!rows.length) return toast('Aucune validation à envoyer');
      if (!confirm(`Enregistrer ${rows.length} résultat(s) « Gymnastique · ${GYM_AG_S[vAg]} » dans Résultats des élèves ?`)) return;
      rows.forEach(r => saveResult({ tool: 'gym', label: 'Gymnastique · ' + GYM_AG_S[vAg], classe: cls, eleve: r.n, valeur: `${r.S.pts} pts · ${r.S.n} élément${r.S.n > 1 ? 's' : ''}`, detail: bestTxt(r.S.best) }));
      toast(`${rows.length} résultat(s) enregistré(s) ✔`); };
    const cv = box.querySelector('#gvcsv'); if (cv) cv.onclick = () => {
      const rows = [['Élève', ...ordered.map(e => `${e.lvl} – ${e.n}`), 'Points (agrès)', 'Éléments validés', ...Object.values(GYM_FAM).map(f => 'Meilleure lettre : ' + f.n)],
        ...st.map(n => { const S = stat(n), v = V[n] || {}; return [n, ...ordered.map(e => v[e.id] ? 'X' : ''), S.pts, S.n, ...Object.keys(GYM_FAM).map(f => S.best[f] || '')]; })];
      download(`gym-${cls}-${vAg}${vNiv ? '-niveau' + vNiv : ''}.csv`.replace(/[^\w.-]+/g, '-'), csv(rows)); };
  }

  /* ---------- ⚠️ Sécurité ---------- */
  let secEdit = null;
  function tabSecu(box) {
    const S = Gd.secu, parts = [['gen', 'Règles générales', '⚠️'], ...Object.entries(GYM_AG).map(([k, l]) => [k, l, '🤸'])];
    box.innerHTML = `<div class="card doc"><p style="margin:0;line-height:1.45"><b>Consignes de sécurité</b> à rappeler avant chaque séance et à chaque atelier. Ajoutez vos propres consignes sous chaque rubrique.</p></div>
      ${parts.map(([k, l, ic]) => `<div class="card gy-secu" style="margin-top:12px"><h3 style="margin:0 0 6px">${ic} ${esc(l)}</h3><ul style="margin:0;padding-left:20px">${GYM_SECU[k].map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        ${S[k] && secEdit !== k ? `<div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:var(--grad-soft)"><b>📝 Mes consignes</b><div style="white-space:pre-wrap;margin-top:4px">${esc(S[k])}</div></div>` : ''}
        ${secEdit === k ? `<label>📝 Mes consignes</label><textarea id="gsx" style="min-height:90px" placeholder="Une consigne par ligne">${esc(S[k] || '')}</textarea>
          <div class="row" style="margin-top:8px"><button class="btn btn-grad" id="gss">💾 Enregistrer</button><button class="btn btn-ghost" id="gsc">Annuler</button></div>`
        : `<button class="link" style="margin-top:8px" data-prof data-se="${k}">✏️ ${S[k] ? 'Modifier mes consignes' : 'Ajouter mes consignes'}</button>`}</div>`).join('')}`;
    box.querySelectorAll('[data-se]').forEach(b => b.onclick = () => { secEdit = b.dataset.se; tabSecu(box); const t = box.querySelector('#gsx'); if (t) t.focus(); });
    const s = box.querySelector('#gss'); if (s) s.onclick = () => { const v = box.querySelector('#gsx').value.trim(); if (v) S[secEdit] = v; else delete S[secEdit]; secEdit = null; save(); toast('Consignes enregistrées ✔'); tabSecu(box); };
    const c = box.querySelector('#gsc'); if (c) c.onclick = () => { secEdit = null; tabSecu(box); };
  }

  frame();
};
