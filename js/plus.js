/* =========================================================
   EPS ONE — Onglet PLUS : mise à jour, partage,
   à propos, confidentialité/RGPD, nouvelle année scolaire
   ========================================================= */
/* Page Ko-fi : laisser vide tant qu'elle n'existe pas (le bouton est alors masqué) */
const KOFI_URL = 'https://ko-fi.com/epsone';
const APP_VERSION = '12.9';
const APP_URL = 'https://steffdelaseuva-hue.github.io/eps-one/';
const CHANGELOG = [
  { v: '12.9', items: ['Nouvel outil Lutte (activités de duel) : lutte au sol / debout, match 1c1, relais (je gagne je reste / les deux sortent), tournoi à élimination, avec observation ou résultats simples ; points attaque (passage arrière, sortie, mise en danger, tombé chronométré), pénalités, formes de corps, observables du défenseur, barème modifiable ; règle d\'or « NE PAS FAIRE MAL ! »'] },
  { v: '12.8', items: ['Page « Mentions légales » (Plus → Aide & infos, À propos, page Confidentialité)'] },
  { v: '12.7', items: ['Démarrage instantané même sans réseau (cache d\'abord, mise à jour en arrière-plan) et bandeau « Nouvelle version prête »','Référencement : titre, description, aperçu de partage, sitemap.xml, robots.txt, données structurées'] },
  { v: '12.6', items: ['Tests 6e : ✕ pour effacer un essai, ↺ par élève, reset des chronos, « ↶ Annuler la dernière saisie » (30 dernières actions), réinitialisation d\'un test pour toute la classe (code enseignant)'] },
  { v: '12.5', items: ['Accueil : « Récemment utilisés » de retour (entre Mes favoris et Par champ d\'apprentissage)'] },
  { v: '12.4', items: ['Accueil réorganisé : Mes favoris · Par champ d\'apprentissage (performance, gymniques & artistiques, duel, APPN) · Autres outils (Cross, Tests 6e, chronos/photo/vidéo, gestion de classe, évaluation) ; « Récemment utilisés » retiré'] },
  { v: '12.3', items: ['Relais : réglage par défaut 3 × 40 m (schéma et tableau des plots)'] },
  { v: '12.2', items: ['Nouvel outil Tests 6e : endurance (Luc Léger, lien Test VMA), force (saut pieds joints), vitesse (30 m) + tests optionnels équilibre, coordination, souplesse, endurance musculaire ; sessions début/fin d\'année et progression','Combiné (duathlon / triathlon) : plusieurs courses (ex. 4 × 3 min) avec récup, projet de course par élève (vitesse, distance ou temps), écart projet / réalisé dans le Bilan ; sauts et lancers sans ET avec élan avec le gain en m et %','Relais : zones de transmission (20 m) et d\'élan (10 m) réglables, schéma et position des plots','Résultats des élèves / collectifs : suppression de plusieurs élèves ou lignes à la fois','Accueil : bouton « ❓ Comment ça marche ? »'] },
  { v: '12.1', items: ['Vidéo différée et Photo-finish : ✏️ dessiner sur l\'image — main levée, trait, flèche, point, cercle, rectangle, angle mesuré en degrés, texte ; couleurs, épaisseur, annuler, effacer, 📸 capture en image'] },
  { v: '12.0', items: ['Tirage au sort : roue qui tourne aux couleurs de l\'app, prénoms des élèves, tic-tic sonore, gagnant en grand avec confettis, sans remise ; « Tirage rapide » toujours disponible'] },
  { v: '11.9', items: ['Crosstraining / HYROX : RUN en tours ou allers-retours → une case à cocher par course (ex. 4 tours = 4 cases), à cocher par le groupe ou par chaque élève (duo/trio/quatuor)'] },
  { v: '11.8', items: ['☕ Soutenir EPS ONE : bouton Ko-fi dans Plus → Aide & infos (facultatif)'] },
  { v: '11.7', items: ['Correctif iPad / iPhone : les boutons protégés par le code (ex. HYROX « Créer une épreuve », ✏️) répondaient mal en mode élève — le pavé du code s\'affiche maintenant','Fluidité : écran qui se figeait quelques secondes (défilement bloqué pendant la synchro, enregistrements trop fréquents) — enregistrements regroupés, défilement toujours libre'] },
  { v: '11.6', items: ['Crosstraining / HYROX : épreuves Individuel / Duo / Trio / Quatuor avec un plan par élève (exercices, répétitions, niveaux), objectif de groupe par famille (ex. 100 répétitions haut du corps en cumulant les élèves), suivi en direct par élève, synthèse individuelle et collective à chaque bloc'] },
  { v: '11.5', items: ['Mes classes : nouvelle catégorie « 🏅 UNSS / AS » — import d\'une liste d\'inscrits (élèves de plusieurs classes) en un seul groupe, utilisable dans tous les outils'] },
  { v: '11.4', items: ['Gym, Demi-fond, Sauvetage : « Envoyer dans Résultats des élèves » accessible aux élèves, avec anti-doublon (un nouvel envoi remplace le précédent, même depuis une autre tablette)'] },
  { v: '11.3', items: ['Code enseignant sur toute l\'app : en mode élève 🔒, les réglages et paramétrages de tous les outils, Mes classes, dispenses, oublis et les données demandent le code ; bouton 🔒/🔓 en haut de l\'écran ; verrouillage automatique réglable par appareil (Plus → Code enseignant)','Demi-fond : nouveaux formats rapides (9 min + 3 min, 6 min + 3 min, 4 × 3 min, 3 × 500 m, 2 × 800 m)'] },
  { v: '11.2', items: ['Nouvel outil Gymnastique (sol, poutre, barres parallèles, barre fixe · tremplin, plinth, mini-trampoline) : 96 éléments A→F par famille, groupes, enchaînement, diaporamas, validation des ateliers, consignes de sécurité','Nouvel outil Demi-fond : enchaînements de courses, repos, groupements, relais, projet, équivalences en plots, bips d\'allure, marche rapide, écart projet / réalisé','Nouvel outil Sauvetage aquatique : bassin, étapes (départ, nage, obstacles, victimes/objets, matériel, geste de secours), relais, projet / réalisé'] },
  { v: '11.1', items: ['Invitation à installer l\'app sur l\'écran d\'accueil (iPhone, iPad, Android) tant qu\'elle est ouverte dans le navigateur ; aussi dans Plus → Installer l\'application'] },
  { v: '11.0', items: ['Acrosport : 4 nouvelles pyramides en semi-renversé (duo et trio, porteurs en trépied ou debout)','Acrosport : ✏️ Créer une pyramide — effectif, porteurs et voltigeurs à faire glisser, posture, inclinaison, bras, prises, plan avant/arrière ; « Copier et modifier » sur les pyramides existantes'] },
  { v: '10.9', items: ['Cross du collège : rubrique à part (accueil et outils), accès direct','Cross : couleur des filles en or (dossards, boutons F) à la place du rose'] },
  { v: '10.8', items: ['Acrosport · liaisons : lien PowerPoint Drive → bouton « 📊 Diaporama » qui ouvre directement dans PowerPoint / Keynote (aperçu rapide retiré)'] },
  { v: '10.7', items: ['Acrosport · liaisons : les liens « Copier le lien » d\'un PowerPoint dans Drive (docs.google.com…rtpof) sont reconnus : aperçu ou ouverture dans PowerPoint / Keynote, sans Google Slides'] },
  { v: '10.6', items: ['Acrosport · liaisons : les liens Google Drive ne s\'ouvrent plus de force dans Google Slides (aperçu rapide ou ouverture dans PowerPoint / Keynote)'] },
  { v: '10.5', items: ['Mes classes : deux catégories, « 🏃 Mes classes EPS » (tous les outils) et « 🏫 Autres classes du collège » (seulement pour le Cross)','Cross : toutes les classes proposées, bouton « Tout cocher », jusqu\'à 24 classes'] },
  { v: '10.4', items: ['Cross : bouton « ⏹ Stop » pour arrêter et remettre à zéro une course lancée','Cross : remise à zéro complète (départs + arrivées) et effacement de tous les numéros de dossard'] },
  { v: '10.3', items: ['Cross : sélection multiple d\'élèves pour les passer d\'un coup en course loisir, adaptée ou autre'] },
  { v: '10.2', items: ['Nouvel outil Cross du collège : courses (6 à 10), dossards QR-codes, scan à l\'arrivée, classements par course, niveau, classes, adaptée et loisir','Duathlon : VMA des élèves (saisie ou récupérée), potentiel VMA du groupe et coefficient de maîtrise sur la distance réglée'] },
  { v: '10.1', items: ['Duathlon : objectifs affichés sous les boutons Étape 1 / 2 / 3'] },
  { v: '10.0', items: ['Séances partagées : une séance Duathlon, Combiné, HYROX ou CO lancée sur une tablette apparaît sur les autres (« 📥 Rejoindre »), chaque tablette choisit son groupe'] },
  { v: '9.9', items: ['Acrosport · liaisons : bouton « 📊 Diaporama » pour les liens PowerPoint, Google Slides, Keynote ou PDF'] },
  { v: '9.8', items: ['Tournois : matchs / défis en cours partagés pour tous les formats (ATP avec observations, championnat, élimination) — rencontre en cours grisée, Annuler / Reprendre', 'Acrosport : filtre « Position du voltigeur » (debout, horizontale, semi-renversé, renversé) + 2 figures semi-renversées', 'Acrosport : onglet « Liaisons dynamiques » avec vidéos, à ajouter à l\'enchaînement'] },
  { v: '9.7', items: ['Pyramide : défis en cours partagés entre les tablettes, équipes / élèves déjà en défi grisés, résultat toujours accepté même si la pyramide a bougé'] },
  { v: '9.6', items: ['Défi ATP : mode « Résultats simples » (défis en cours, saisie du score et de l\'arbitre en fin de match) en plus du mode avec observations', 'Match libre ATP avec arbitre, compté au classement', 'Minuteur retiré · Timer HIIT / Tabata déplacé dans Activités de performance · famille « Chronos / photo / vidéo »'] },
  { v: '9.5', items: ['Multi chrono (12 élèves) : fond clair comme le reste de l\'app (sombre si l\'appareil est en mode sombre), icône dans le même style que les autres outils'] },
  { v: '9.4', items: ['« Chronos EPS » devient « Multi chrono (12 élèves) » aux couleurs d\'EPS ONE (dossards or et bleu, nouvelle icône)', '« Multi-chrono » devient « Multi chrono (6 élèves) »'] },
  { v: '9.3', items: ['Nouvel outil « Résultats collectifs » (Évaluation & suivi) : tournois (championnat, élimination, pyramide, ATP), matchs, HYROX, CO, Combiné, Duathlon, Relais', '« Questions débrief » retiré du menu'] },
  { v: '9.2', items: ['Gestion de match : nouveau format « 🎾 Défi ATP » (classement individuel aux points, défis jusqu\'à 6 places au-dessus, barème selon l\'écart, arbitrage +0,5, confirmation avant enregistrement)'] },
  { v: '9.1', items: ['Accueil et « À propos » : nouveau descriptif de l\'application'] },
  { v: '9.0', items: ['Tournois : envoi immédiat du match enregistré et mise à jour automatique du classement / tableau / pyramide sur les autres tablettes'] },
  { v: '8.9', items: ['Test VMA : voix plus fiable sur iPhone / iPad (déblocage au toucher, voix française, phrases qui ne sont plus avalées)', 'Bouton ♪ : test des bips et de la voix'] },
  { v: '8.8', items: ['Son des bips (bouton ♪) : bips par-dessus la musique, mode enceinte Bluetooth (évite la mise en veille), bouton de test'] },
  { v: '8.7', items: ['Tournois : les règles du match (durée ou points, bonus, statistiques, zones, observations) choisies par l\'enseignant s\'appliquent sur toutes les tablettes'] },
  { v: '8.6', items: ['Code enseignant à 4 chiffres pour quitter la vue élève (« 🔒 Mode enseignant ») — réglage dans Plus → Code enseignant'] },
  { v: '8.5', items: ['Championnat (poules par niveau), Élimination directe et Pyramide des victoires intégrés à Gestion de match (tous les sports, partagés entre les tablettes)', 'Anciens outils Championnat / Tournoi / Pyramide retirés du menu'] },
  { v: '8.4', items: ['Gestion de match : tournois partagés entre les tablettes (championnat aller simple, classement automatique)', 'Chaque tablette choisit sa rencontre ou « Mon équipe » + « Adversaire »'] },
  { v: '8.3', items: ['Passeport : Squats N1 (bas du corps), Gainage latéral N3 (abdominaux / gainage)'] },
  { v: '8.2', items: ['Crosstraining / HYROX : exercices rangés par famille (passeport technique), niveau N1–N4 réglé automatiquement, couleurs des familles', 'Nouveaux exercices : Wall ball, Squats ball, Développé haltères, Farmer carry, Rowing kettlebell', 'Exercices ajoutés : choix de la famille et du niveau'] },
  { v: '8.1', items: ['HYROX, Course d\'orientation, Combiné, Duathlon et Relais alimentent « Résultats des élèves »', 'Séances enregistrées sur plusieurs tablettes (même jour, même classe, même épreuve) regroupées en une seule séance', 'Relais : courses enregistrées et synchronisées'] },
  { v: '8.0', items: ['Vue « tablette d\'un groupe » étendue : Gestion de match (tablette observateurs), Combiné, Duathlon, Relais, Natation (Nager vite / Savoir nager), Escalade, Course d\'orientation · mode enseignant protégé · seuls les groupes avec des données sont enregistrés'] },
  { v: '7.9', items: ['Crosstraining / HYROX : vue élève sur la tablette du groupe (chrono en grand, étapes à cocher bloc par bloc, arrivée), mode enseignant protégé'] },
  { v: '7.8', items: ['Crosstraining / HYROX : choisir le groupe suivi sur chaque tablette ; seuls les groupes partis sont enregistrés'] },
  { v: '7.7', items: ['Dropbox : message d\'erreur détaillé'] },
  { v: '7.6', items: ['Logos Google Drive et Dropbox sur les boutons « Mon cloud »'] },
  { v: '7.5', items: ['Option Dropbox activée dans « Mon cloud »'] },
  { v: '7.4', items: ['Un seul bouton « ☁️ Continuer avec mon cloud » : Google Drive ou Dropbox (Dropbox activé dès que la clé est configurée)'] },
  { v: '7.3', items: ['Écran d\'accueil : « Continuer avec Google Drive » ou « Utiliser sur cet appareil » sans compte ; le compte EPS ONE passe par « J\'ai une invitation »'] },
  { v: '7.2', items: ['Page publique de confidentialité (confidentialite.html)'] },
  { v: '7.1', items: ['Option « Google Drive » activée dans Stockage & synchronisation'] },
  { v: '7.0', items: ['Accès immédiat sans validation pour les utilisateurs qui choisissent leur propre Google Drive ; le compte EPS ONE reste sur invitation'] },
  { v: '6.9', items: ['Page Stockage & synchronisation réorganisée : fonctionnement hors ligne par défaut, options facultatives, modes de stockage'] },
  { v: '6.8', items: ['Nouveau : stockage et synchronisation sur son propre Google Drive (plusieurs tablettes, fusion, tablette de collecte)'] },
  { v: '6.7', items: ['Correction : la page Accès des collègues attend la connexion au lieu d’échouer juste après l’ouverture de l’app'] },
  { v: '6.6', items: ['Groupes préparés : liste de toutes les classes préparées à l’avance, accès direct à chacune'] },
  { v: '6.5', items: ['Crosstraining / HYROX : bouton « 🗑 Retirer » bien visible sur chaque exercice, et gestion des exercices ajoutés à la liste'] },
  { v: '6.4', items: ['Groupes préparés à l’avance par classe (« 💾 Préparer pour plus tard ») dans Gestion de match, tournoi, poule, relais, duathlon, combiné, crosstraining et course d’orientation : on retrouve, modifie ou utilise les groupes de chaque classe'] },
  { v: '6.3', items: ['Plus : ligne Contact (e-mail)'] },
  { v: '6.2', items: ['Accueil : bouton « 📥 Importer vos classes »'] },
  { v: '6.1', items: ['Page Synchronisation : explication Local / Synchronisation précisée'] },
  { v: '6.0', items: ['Page Synchronisation : explication « Local ou synchronisation ? »'] },
  { v: '5.9', items: ['Page Mise à jour : les 5 dernières versions, historique complet repliable'] },
  { v: '5.8', items: ['Correction : les pages Synchronisation et Accès des collègues affichaient aussi le contenu de la page précédente'] },
  { v: '5.7', items: ['Accès des collègues : la synchronisation s’active compte par compte par l’administrateur ; sinon stockage local uniquement'] },
  { v: '5.6', items: ['Tablette de collecte : aucun envoi pendant la séance, bouton « 📤 Envoyer les relevés » en fin de cours (envoi aussi à la mise en veille)'] },
  { v: '5.5', items: ['Synchronisation : le même outil peut être utilisé en même temps sur plusieurs tablettes (2 terrains, plusieurs voies…) ; les séances en cours restent propres à chaque tablette, seuls les résultats enregistrés sont fusionnés'] },
  { v: '5.4', items: ['Accès sur invitation : les collègues demandent un accès, l’administrateur valide ou retire (Plus → Accès des collègues)', 'Synchronisation par fusion : plusieurs tablettes peuvent relever en même temps sur le même compte, tout est regroupé sans écrasement', 'Envois groupés (économie du quota) et mode « Tablette de collecte »'] },
  { v: '5.3', items: ['Sons : les bips sont de nouveau audibles sur iPhone/iPad (tests VMA, chronos, minuteurs…)'] },
  { v: '5.2', items: ['Test VMA 45-15 : bip à chaque plot', 'Test VMA : correction d’un blocage quand aucune classe n’existe', 'Gestion de match : observations individuelles de 2 à 4 joueurs (possessions, tirs, buts/paniers, balles perdues, rebonds au basket)', 'Gestion de match : modifier / supprimer des équipes ou toutes les équipes'] },
  { v: '5.1', items: ['Natation (nager vite) : chronométrage de 1 à 4 nageurs en même temps, avec comptage des coups de bras et indice de nage par ligne'] },
  { v: '5.0', items: ['Escalade : équipes (formation, modification), filtre par équipe dans Passage, défis entre équipes avec choix du grimpeur à chaque voie'] },
  { v: '4.9', items: ['Outils retirés : Journal de musculation et Composition d’équipes (la composition reste intégrée aux outils qui forment des groupes)'] },
  { v: '4.8', items: ['Groupes et participants modifiables pendant la séance (absent, blessé…) : Duathlon, Course d’orientation, Crosstraining / HYROX, Combiné athlétique — les données de l’élève le suivent'] },
  { v: '4.7', items: ['Acrosport : groupes modifiables (déplacer, retirer un absent, ajouter, supprimer un groupe ou tous), vider un enchaînement', 'Gestion de match : zone « Non placés / absents » dans la composition des équipes'] },
  { v: '4.6', items: ['À propos : remerciements mis à jour'] },
  { v: '4.5', items: ['Acrosport : correction des pyramides qui disparaissaient, groupes d’élèves par classe, enchaînement du groupe (pyramides de la banque + photos), présentation', 'Rugby : la ligne d’avantage est intégrée à Gestion de match (sport Rugby) au lieu d’un outil à part'] },
  { v: '4.4', items: ['Natation (nager vite) : liste des élèves de la classe au lieu de la saisie du nom, passage automatique à l’élève suivant'] },
  { v: '4.3', items: ['Course d’orientation : symboles de pinces à points (répertoire de 50 symboles ou dessin libre) à la place des codes, contrôle des cartons par symboles'] },
  { v: '4.2', items: ['Escalade : défis entre élèves (poses de pieds, PME, temps) avec cumul sur les voies de la séance', 'Course d’orientation : codes des balises + contrôle des cartons (lecture automatique de la photo en essai)', 'Nouvel outil Acrosport : banque de pyramides filtrable', 'Natation : Nager vite (indice de nage sur 25 m) / Savoir nager (test)', 'Nouvel outil Rugby · Ligne d’avantage'] },
  { v: '4.1', items: ['Gestion de match : constitution des équipes avec les élèves d’une classe (aléatoire, hétérogène, homogène), déplacement d’un élève d’une équipe à l’autre, joueurs enregistrés avec le match'] },
  { v: '4.0', items: ['Nouvel outil Escalade : voies 3a → 6c avec photo, moulinette / tête, observables (poses de pieds, temps, fluidité, PME), vidéo différée intégrée'] },
  { v: '3.9', items: ['Confidentialité : conseil Safari / Chrome / icône installée'] },
  { v: '3.8', items: ['Confidentialité : précision sur l’hébergement'] },
  { v: '3.7', items: ['Confidentialité : mention du chiffrement de bout en bout'] },
  { v: '3.6', items: ['Connexion au compte : choix Combiner ou Remplacer les données de l’appareil'] },
  { v: '3.5', items: ['Chiffrement de bout en bout de la synchronisation (clé tirée du mot de passe)'] },
  { v: '3.4', items: ['Confidentialité : conseils reformulés'] },
  { v: '3.3', items: ['Choix du mode de stockage au premier lancement (local ou compte e-mail)', 'Indicateur du mode dans Plus', 'Suppression des données en ligne', 'Page Confidentialité & RGPD mise à jour'] },
  { v: '3.2', items: ['Synchronisation branchée sur le projet Firebase EPS ONE'] },
  { v: '3.1', items: ['Synchronisation iPhone ↔ iPad (compte + Firebase)'] },
  { v: '3.0', items: ['Nouvelle adresse : steffdelaseuva-hue.github.io/eps-one/'] },
  { v: '2.9', items: ['Nouveau nom : EPS ONE', 'Nouvelle icône : joueur + traceur'] },
  { v: '2.8', items: ['Grilles d\'évaluation : par points ou par compétences, niveaux personnalisés, descripteurs, import CSV / Excel (iDoceo, tableur) et modèles'] },
  { v: '2.7', items: ['Duathlon : points de lancers avec boutons + / −'] },
  { v: '2.6', items: ['Parkour : ateliers, éléments, niveaux et critères de validation repris de l\'appli Parkour EPS – Arzacq'] },
  { v: '2.5', items: ['Parkour : liste de plusieurs exercices évalués pour chaque élève'] },
  { v: '2.4', items: ['Outils réorganisés par champ d\'apprentissage : performance, gymniques & artistiques, duel, APPN (+ outils transversaux)'] },
  { v: '2.3', items: ['Nouvel outil Combiné athlétique (duathlon / triathlon)', 'Enregistrement des résultats par classe et par élève dans les outils de mesure + outil « Résultats des élèves »'] },
  { v: '2.2', items: ['Nouvel outil Duathlon athlétique : groupes, 3 étapes, points de lancers, tours, temps cumulé, pénalités'] },
  { v: '2.1', items: ['Nouvel outil Parkour (niveau 1 · 6e / niveau 2 · 4e avec fluidité) + lien vers l\'appli Parkour EPS – Arzacq'] },
  { v: '2.0', items: ['Nouvel outil Crosstraining / HYROX : épreuves en blocs, familles, exercices N1-N4, run, groupes duo/trio/quatuor, time cap, écart de temps'] },
  { v: '1.9', items: ['Gestion de match : Ultimate et Volley-ball', 'Nouvel outil Natation : distance, temps, coups de bras'] },
  { v: '1.8', items: ['Nouvel outil Course d\'orientation : parcours, balises niv. 1/2/3, obligatoires/facultatives, pénalités, séances, RK, bilan cumulé'] },
  { v: '1.7', items: ['Gestion de match : ajout de l\'escrime (piste, touches casque / cou / buste / bras / dos)'] },
  { v: '1.6', items: ['Gestion de match : ajout du Shortennis'] },
  { v: '1.5', items: ['Nouvel outil Gestion de match : 7 sports, terrain, match au temps ou au point, bonus, zones visées, statistiques, historique'] },
  { v: '1.4', items: ['Niveaux de jeu des élèves (1, 2, 3)', 'Équipes hétérogènes ou homogènes : Composition d\'équipes, Championnat (une poule par niveau), Tournoi, Relais'] },
  { v: '1.3', items: ['Bouton « Écouter de la musique » en haut de l\'app (Apple Music, Spotify, Deezer, YouTube Music)'] },
  { v: '1.2', items: ['Import : fichiers Numbers reconnus, avec la marche à suivre pour les exporter en Excel'] },
  { v: '1.1', items: ['Mes classes : import de fichiers CSV / Excel', 'Bouton « ＋ Élève » pour ajouter un élève en cours d\'année'] },
  { v: '1.0', items: ['Nouvel outil Test VMA : Luc Léger, VAMEVAL, 45-15, Astrand'] },
  { v: '0.9', items: ['Correctif : affichage de la nouvelle icône sur iPad'] },
  { v: '0.8', items: ['Nouvelle icône de l\'app'] },
  { v: '0.7', items: ['Couleur or (au lieu de jaune)', 'Menu Plus : Partager l\'app, Confidentialité & RGPD, À propos, Mise à jour, Nouvelle année scolaire'] },
  { v: '0.6', items: ['Nouvelles icônes originales', 'Logo Chronos EPS sur son outil'] },
  { v: '0.4', items: ['Onglet Plus : mise à jour, partage par QR code, à propos, confidentialité & RGPD', 'Nouvelle année scolaire (sauvegarde + remise à zéro choisie)'] },
  { v: '0.3', items: ['Nouveau nom : EPS ONE, by Steff64'] },
  { v: '0.2', items: ['Tous les outils disponibles (vidéo différée, photo-finish, grilles, suivi…)', 'Chronos EPS (12 élèves) intégré'] },
  { v: '0.1', items: ['Première version : accueil, onglet OUTILS, favoris'] },
];

const schoolYear = (d = new Date()) => { const y = d.getFullYear(); return d.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };
DB.annee = DB.annee || schoolYear();

document.head.insertAdjacentHTML('beforeend', `<style>
.qr-box{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
.qr-box svg{width:min(240px,70vw);height:auto;border-radius:14px;box-shadow:var(--shadow);border:1px solid var(--line)}
.doc h3{margin:18px 0 6px;font-size:1rem}
.doc p,.doc li{font-size:.92rem;line-height:1.5;margin:0 0 8px}
.doc ul{padding-left:20px;margin:0 0 8px}
.chk{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line);font-size:.92rem}
.chk:last-child{border-bottom:none}
.chk input{width:22px;height:22px;flex:0 0 22px;margin-top:1px;accent-color:var(--blue)}
.step{display:flex;gap:10px;align-items:center;margin:18px 2px 8px}
.step .n{width:28px;height:28px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;font-weight:900;font-size:.85rem;flex:0 0 28px}
.step h3{font-size:1rem;margin:0}
.ver-badge{display:inline-block;padding:3px 10px;border-radius:99px;background:var(--grad);color:#fff;font-weight:800;font-size:.8rem}
</style>`);

/* ---------- Panneau générique (réutilise l'écran d'outil) ---------- */
/* Nouveautés : les petites corrections sont regroupées sous une ligne simple */
const isFix = t => /^(Correction|Corrections)\b|:\s*correction\b/i.test(t);
function clEntry(c) {
  const main = c.items.filter(i => !isFix(i)), fixes = c.items.length - main.length;
  return `<h3><span class="ver-badge">v${c.v}</span></h3><ul>${main.map(i => `<li>${esc(i)}</li>`).join('')}${fixes ? '<li class="muted">Corrections et améliorations</li>' : ''}</ul>`;
}
function openPanel(title, render) {
  currentTool = null;
  document.getElementById('screen-title').textContent = title;
  document.getElementById('screen-star').style.visibility = 'hidden';
  if (typeof cleanup === 'function') { try { cleanup(); } catch (e) {} } cleanup = null;
  const body = document.getElementById('screen-body'); body.className = 'body'; body.innerHTML = '';
  cleanup = render(body) || null;
  document.getElementById('screen').classList.add('open');
  document.getElementById('screen-body').scrollTop = 0;
}
const appLink = () => location.protocol === 'https:' ? location.origin + location.pathname.replace(/[^/]*$/, '') : APP_URL;

/* ---------- 🔄 Mise à jour ---------- */
function openUpdate() {
  openPanel('Mise à jour', el => {
    el.innerHTML = `<div class="card" style="text-align:center">
        <div class="muted">Version installée</div><div style="font-size:2.4rem;font-weight:900;margin:4px 0">v${APP_VERSION}</div>
        <div id="st" class="muted">Recherche d'une nouvelle version…</div>
        <button class="btn btn-grad btn-block" style="margin-top:14px" id="up">🔄 Mettre à jour l'application</button>
        <p class="muted" style="margin:10px 0 0">Recharge la dernière version publiée. Vos données (classes, grilles, suivi…) sont conservées.</p></div>
      <div class="section-title"><h2>Nouveautés</h2></div>
      <div class="card doc">${CHANGELOG.slice(0, 5).map(clEntry).join('')}
        ${CHANGELOG.length > 5 ? `<details style="margin-top:10px"><summary style="cursor:pointer;font-weight:800">Voir tout l'historique (${CHANGELOG.length - 5} versions précédentes)</summary>${CHANGELOG.slice(5).map(clEntry).join('')}</details>` : ''}</div>`;
    const st = el.querySelector('#st');
    fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).then(v => {
      st.innerHTML = v.version !== APP_VERSION
        ? `<b style="color:var(--ok)">Nouvelle version disponible : v${esc(v.version)}</b>`
        : '✔ Vous avez la dernière version.';
    }).catch(() => st.textContent = navigator.onLine ? 'Vérification impossible pour le moment.' : 'Hors connexion : vérification impossible.');
    el.querySelector('#up').onclick = async () => {
      if (!navigator.onLine) return toast('Connexion internet nécessaire');
      toast('Mise à jour…');
      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        if (reg) { await reg.update(); await reg.unregister(); }
        if (window.caches) for (const k of await caches.keys()) await caches.delete(k);
      } catch (e) {}
      location.replace(location.pathname + '?v=' + Date.now() + '#plus');
    };
  });
}

/* ---------- 🔗 Partager l'app ---------- */
function openShare() {
  const url = appLink();
  openPanel('Partager l\'app', el => {
    el.innerHTML = `<div class="card qr-box"><h3>EPS ONE</h3>${QR.svg(url)}<div class="muted" style="word-break:break-all">${esc(url)}</div>
        <div class="row" style="width:100%;margin-top:6px"><button class="btn btn-grad" id="sh">📤 Partager</button><button class="btn btn-ghost" id="cp">📋 Copier le lien</button></div></div>`;
    const copy = async t => { try { await navigator.clipboard.writeText(t); toast('Copié ✔'); } catch (e) { prompt('Copiez :', t); } };
    el.querySelector('#sh').onclick = async () => { if (navigator.share) { try { await navigator.share({ title: 'EPS ONE', url }); } catch (e) {} } else copy(url); };
    el.querySelector('#cp').onclick = () => copy(url);
  });
}

/* ---------- ℹ️ À propos ---------- */
function openAbout() {
  openPanel('À propos', el => {
    el.innerHTML = `<div class="hero" style="text-align:center"><img class="logo" src="icons/icone-v3-192.png" alt="" style="margin:0 auto 10px;width:72px;height:72px;border-radius:18px">
        <h2>EPS ONE</h2><p style="margin:6px auto 0">by <b>Steff64</b> · version ${APP_VERSION}</p></div>
      <div class="card doc" style="margin-top:14px">
        <h3>🎯 L'objectif</h3>
        <p>Réunir dans une seule application les outils numériques utiles en cours d'EPS, classés par champs d'apprentissage : gestion de séance par les élèves et le prof, gestion de match en synchronisation live multi-tablettes (résultats envoyés sur la tablette du prof en direct et/ou en fin de séance), multi-chronos, tirages au sort, équipes, calculs VMA, évaluation et suivi des élèves, sur tablette, téléphone ou ordinateur.</p>
        <h3>🧰 Ce qu'elle contient</h3>
        <p>${TOOLS.length} outils répartis en ${CATS.length} domaines : ${CATS.map(c => c.name).join(' · ')}.</p>
        <h3>📲 Installer l'app</h3>
        <ul><li><b>iPad / iPhone</b> : ouvrir dans Safari → bouton Partager ⬆️ → « Sur l'écran d'accueil ».</li>
          <li><b>Android</b> : ouvrir dans Chrome → menu ⋮ → « Installer l'application ».</li>
          <li><b>Ordinateur</b> : Chrome ou Edge → icône d'installation dans la barre d'adresse.</li></ul>
        <p>Une fois installée, l'application fonctionne aussi hors connexion, au gymnase comme sur le stade.</p>
        <h3>💾 Changer d'appareil</h3>
        <p>Plus → « Exporter mes données » sur l'ancien appareil, puis « Importer une sauvegarde » sur le nouveau.</p>
        <h3>🙏 Remerciements</h3>
        <p>Conception et développement : Steff64, professeur d'EPS.</p>
        <p style="margin-top:12px"><a href="mentions-legales.html" target="_blank" rel="noopener">⚖️ Mentions légales</a> · <a href="confidentialite.html" target="_blank" rel="noopener">🔒 Politique de confidentialité</a></p>
      </div>`;
  });
}

/* ---------- 🔒 Confidentialité & RGPD ---------- */
function openPrivacy() {
  openPanel('Confidentialité & RGPD', el => {
    const size = (() => { try { return Math.round(((localStorage.getItem('mesOutilsEPS_v1') || '').length + (localStorage.getItem('chronos-eps-v1') || '').length) / 1024); } catch (e) { return 0; } })();
    const nbEleves = DB.classes.reduce((a, c) => a + c.students.length, 0);
    el.innerHTML = `<div class="card doc">
        <h3>🔐 En résumé</h3>
        <ul><li><b>Deux modes au choix</b> : <b>stockage local</b> (par défaut, rien n'est envoyé en ligne) ou <b>compte e-mail</b> pour synchroniser ses appareils.</li>
          <li><b>Aucune publicité</b>, aucun cookie de suivi, aucune statistique de visite.</li>
          <li><b>Accès</b> : sans compte en stockage local, avec son propre cloud (Google Drive, Dropbox), ou avec un compte EPS ONE sur invitation (validé par l'administrateur). L'adresse e-mail, l'état de la demande (en attente, autorisé, refusé) et l'activation ou non de la synchronisation sont enregistrés, non chiffrés, uniquement pour gérer les autorisations.</li>
          <li>Mode actuel sur cet appareil : <b>${window.EPSONE_SYNC && window.EPSONE_SYNC.user ? 'Synchronisé (' + esc(window.EPSONE_SYNC.user.email) + ')' : 'Stockage local'}</b>.</li></ul>
        <h3>📱 Mode « Stockage local »</h3>
        <p>Classes, listes d'élèves, évaluations, suivi, dispenses… sont enregistrés uniquement dans le navigateur de cet appareil (stockage local). Rien n'est envoyé sur un serveur, rien n'est partagé. Effacer les données de Safari/Chrome ou désinstaller l'app les supprime : pensez à exporter régulièrement une sauvegarde.</p>
        <h3>☁️ Mode « Compte e-mail » (synchronisation)</h3>
        <ul><li>Les données sont copiées dans une base de données <b>Google Firebase (Cloud Firestore)</b>, hébergée <b>en Europe (Paris, europe-west9)</b>, pour être retrouvées sur vos autres appareils.</li>
          <li><b>Chiffrement de bout en bout</b> : les données sont chiffrées sur votre appareil avant l'envoi (AES-256), avec une clé tirée de votre mot de passe. Firebase ne stocke que du contenu illisible : <b>ni Google, ni l'administrateur du projet ne peuvent les lire</b>.</li>
          <li>Elles sont rattachées à votre compte : les règles de sécurité font que <b>seul votre compte peut les lire ou les modifier</b>.</li>
          <li>L'adresse e-mail sert uniquement à la connexion. Le mot de passe est géré par Firebase Authentication ; l'app ne le conserve pas, elle s'en sert seulement sur l'appareil pour créer la clé de chiffrement. En cas d'oubli, les données en ligne deviennent illisibles, mais celles de vos appareils sont conservées.</li>
          <li><b>Option « Mon cloud » (Google Drive ou Dropbox)</b> : si vous la choisissez, vos données sont enregistrées sur <b>votre propre</b> Google Drive ou Dropbox, dans un dossier réservé à EPS ONE (l'app n'a accès à aucun autre fichier), et ne passent pas par le serveur d'EPS ONE. Elles sont alors soumises aux conditions de votre compte chez ce fournisseur.</li>
          <li>Vous pouvez à tout moment <b>supprimer toutes vos données en ligne</b> (Plus → Stockage & synchronisation) : la synchronisation s'arrête et les données restent seulement sur l'appareil.</li>
          <li><b>Conseil</b> : en mode synchronisé, préférez <b>prénom + initiale</b> pour les élèves. Pour toute question sur l'usage d'outils numériques avec des données d'élèves, votre établissement reste l'interlocuteur de référence.</li></ul>
        <h3>📷 Caméra</h3>
        <p>La vidéo différée et le photo-finish utilisent la caméra uniquement pendant que l'outil est ouvert. Les images restent en mémoire vive, ne sont jamais enregistrées ni envoyées, et sont effacées à la fermeture de l'outil.</p>
        <h3>🌐 Hébergement</h3>
        <p>L'application est hébergée sur GitHub Pages. Comme pour tout site web, l'hébergeur peut enregistrer des données techniques de connexion (adresse IP) lors du chargement de la page. Aucune donnée d'élève ne transite par ce biais (en mode synchronisé, elles transitent uniquement vers Firebase, chiffrées de bout en bout).</p>
        <h3>🧑‍🏫 Bonnes pratiques pour l'enseignant</h3>
        <ul><li><b>Minimiser</b> : prénom + initiale du nom suffisent le plus souvent.</li>
          <li><b>Dispenses</b> : ne pas saisir de motif médical ni de diagnostic, seulement les dates et les aménagements.</li>
          <li><b>Exports</b> (CSV, JSON) : les ranger dans un espace sécurisé (ENT, espace professionnel), pas sur une clé USB perdue ou un cloud personnel.</li>
          <li><b>Appareil</b> : verrouiller la tablette par un code, surtout si elle est partagée.</li>
          <li><b>Toujours la même entrée</b> : sur iPhone/iPad, Safari, Chrome et l'icône installée sur l'écran d'accueil ne partagent pas les mêmes données. Utilisez toujours la même (de préférence l'icône installée). En mode « Compte e-mail », connectez-vous avec le même compte pour retrouver vos données partout.</li>
          <li><b>Durée</b> : effacer les données en fin d'année avec « Nouvelle année scolaire ».</li></ul>
        <p class="muted">Ces informations sont données à titre indicatif et ne constituent pas un avis juridique.</p>
      </div>
      <div class="section-title"><h2>Mes données sur cet appareil</h2></div>
      <div class="card"><div class="result" style="margin-top:0">
          <div class="card"><b>${DB.classes.length}</b><small>classes</small></div><div class="card"><b>${nbEleves}</b><small>élèves</small></div><div class="card"><b>${size} Ko</b><small>stockés</small></div></div>
        <div class="row" style="margin-top:12px"><button class="btn btn-ghost" onclick="exportData()">💾 Exporter</button><button class="btn btn-danger" id="del">🗑 Tout effacer</button></div></div>`;
    el.querySelector('#del').onclick = () => { resetAll(); closeTool(); };
  });
}

/* ---------- 🗓 Nouvelle année scolaire ---------- */
function openNewYear(back) {
  const next = (() => { const m = /^(\d{4})-(\d{4})$/.exec(DB.annee); return m ? `${+m[1] + 1}-${+m[2] + 1}` : schoolYear(); })();
  const counts = {
    classes: DB.classes.length, evals: DB.grilles.reduce((a, g) => a + Object.keys(g.evals || {}).length, 0),
    suivi: Object.keys(DB.suivi).length, dispenses: DB.dispenses.length, oublis: Object.keys(DB.oublis).length, journal: DB.journal.length,
  };
  const OPTS = [
    ['classes', true, `Classes et listes d'élèves (${counts.classes}) + prénoms de Chronos EPS`],
    ['keepNames', false, `↳ … mais garder les noms de classes (listes vidées)`],
    ['evals', true, `Évaluations saisies dans les grilles (${counts.evals} classe·s) — les grilles sont conservées`],
    ['suivi', true, `Tableaux de suivi (${counts.suivi})`],
    ['dispenses', true, `Dispenses (${counts.dispenses})`],
    ['oublis', true, `Oublis de tenue (${counts.oublis} classe·s)`],
    ['grilles', false, `Mes modèles de grilles d'évaluation (${DB.grilles.length})`],
    ['debrief', false, `Mes questions de débrief (${DB.debrief.length})`],
    ['favs', false, 'Favoris et outils récents'],
  ];
  openPanel('Nouvelle année scolaire', el => {
    let saved = false;
    el.innerHTML = `<div class="card" style="text-align:center"><div class="muted">Année en cours</div><div style="font-size:1.8rem;font-weight:900">${esc(DB.annee)}</div></div>
      <div class="step"><span class="n">1</span><h3>Sauvegarder l'année ${esc(DB.annee)}</h3></div>
      <div class="card"><p class="muted" style="margin:0 0 10px">Fortement conseillé : un fichier de sauvegarde permet de tout retrouver plus tard (Plus → Importer).</p>
        <button class="btn btn-grad btn-block" id="bk">💾 Télécharger la sauvegarde ${esc(DB.annee)}</button><div id="bks" class="muted" style="margin-top:8px;text-align:center"></div></div>
      <div class="step"><span class="n">2</span><h3>Choisir ce qu'on remet à zéro</h3></div>
      <div class="card">${OPTS.map(([k, on, l]) => `<label class="chk"><input type="checkbox" data-k="${k}" ${on ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
      <div class="step"><span class="n">3</span><h3>Démarrer la nouvelle année</h3></div>
      <div class="card"><label>Nouvelle année</label><input id="ny" value="${esc(next)}">
        <button class="btn btn-grad btn-block" style="margin-top:12px" id="go">🚀 Démarrer l'année</button></div>`;
    const $ = s => el.querySelector(s), opt = k => $(`[data-k="${k}"]`).checked;
    $('#bk').onclick = () => {
      download(`eps-one-sauvegarde-${DB.annee}.json`, JSON.stringify({ ...DB, exportDate: new Date().toISOString() }, null, 2), 'application/json');
      saved = true; $('#bks').textContent = '✔ Sauvegarde téléchargée'; };
    $('#go').onclick = () => {
      const ny = $('#ny').value.trim() || next;
      if (!saved && !confirm('Vous n\'avez pas téléchargé de sauvegarde. Continuer quand même ?')) return;
      if (!confirm(`Démarrer l'année ${ny} ?\nLes éléments cochés seront définitivement effacés de cet appareil.`)) return;
      if (opt('classes')) {
        DB.classes = opt('keepNames') ? DB.classes.map(c => ({ name: c.name, students: [] })) : [];
        DB.classesAll = opt('keepNames') ? (DB.classesAll || []).map(c => ({ name: c.name, students: [] })) : [];
        try { const S = JSON.parse(localStorage.getItem('chronos-eps-v1')); if (Array.isArray(S)) { S.forEach(c => c.name = ''); localStorage.setItem('chronos-eps-v1', JSON.stringify(S)); } } catch (e) {}
      }
      if (opt('grilles')) DB.grilles = []; else if (opt('evals')) DB.grilles.forEach(g => g.evals = {});
      if (opt('suivi')) DB.suivi = {};
      if (opt('dispenses')) DB.dispenses = [];
      if (opt('oublis')) DB.oublis = {};

      if (opt('debrief')) DB.debrief = [];
      if (opt('favs')) { DB.favs = []; DB.recent = []; }
      DB.annee = ny; save(); renderHome(); renderPlusYear();
      toast(`Bonne année scolaire ${ny} ! 🎉`);
      if (back) { closeTool(); openTool(back); } else closeTool();
    };
  });
}


/* ---------- Styles menu Plus / accueil ---------- */
document.head.insertAdjacentHTML('beforeend', `<style>
.menu-sec{margin:22px 4px 8px;font-size:.78rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted)}
.menu-item{display:flex;align-items:center;gap:14px;padding:12px 14px;border-bottom:1px solid var(--line);cursor:pointer;text-decoration:none;color:inherit}
.menu-item:last-child{border-bottom:none}
.menu-item:active{background:var(--grad-soft)}
.mi-ic{position:relative;width:48px;height:48px;flex:0 0 48px;border-radius:14px;display:grid;place-items:center;font-size:1.35rem;border:1px solid var(--line);box-shadow:0 3px 8px rgba(11,42,91,.08)}
.mi-ic .ico{width:26px;height:26px}.mi-ic .ico-img{width:48px;height:48px;border-radius:14px}
.mi-ic.gold{background:linear-gradient(135deg,rgba(212,175,55,.22),rgba(212,175,55,.08))}
.mi-ic.blue{background:linear-gradient(135deg,rgba(30,91,216,.18),rgba(30,91,216,.06))}
.mi-ic.navy{background:linear-gradient(135deg,rgba(11,42,91,.14),rgba(11,42,91,.04))}
.mi-ic.grad{background:var(--grad-soft)}
.menu-item b{display:block;font-size:1rem}
.menu-item .muted{font-size:.84rem}
.menu-item .chev{margin-left:auto;color:var(--muted);font-size:1.2rem}
details.faq{border-bottom:1px solid var(--line);padding:12px 0}
</style>`);

/* ---------- Menu Plus ---------- */
function renderPlus() {
  const box = document.getElementById('plus-menu'); if (!box) return;
  const item = (ic, color, title, sub, action) =>
    `<div onclick="${action}" class="menu-item"><span class="mi-ic ${color}">${ico(ic)}</span><span><b>${title}</b><span class="muted">${sub}</span></span><span class="chev">›</span></div>`;
  box.innerHTML = `
    <div class="menu-sec">Données & partage</div>
    <div class="card" style="padding:0" data-cfg>
      ${item('update', 'grad', 'Stockage & synchronisation', `<span id="sync-sub">${window.syncStatusText ? window.syncStatusText() : 'Mode : stockage local'}</span>`, 'openSync()')}
      ${item('lock', 'navy', 'Code enseignant', DB.profPin ? 'Code défini · protège les réglages des outils' : 'Protéger les réglages des outils face aux élèves', 'openProfPin()')}
      ${window.isEpsAdmin && window.isEpsAdmin() ? item('lock', 'gold', 'Accès des collègues', 'Valider ou retirer les accès à EPS ONE', 'openAccessAdmin()') : ''}
      ${item('save', 'blue', 'Exporter mes données', 'Fichier de sauvegarde JSON', 'exportData()')}
      ${item('restore', 'blue', 'Importer une sauvegarde', 'Restaurer depuis un fichier JSON', "document.getElementById('imp').click()")}
      ${item('share', 'grad', 'Partager l\'app', 'QR code et lien', 'openShare()')}
    </div>
    <div class="menu-sec">Aide & infos</div>
    <div class="card" style="padding:0">
      ${item('lock', 'navy', 'Confidentialité & RGPD', 'Données, caméra, suppression', 'openPrivacy()')}
      ${item('install', 'gold', 'Installer l\'application', 'Sur l\'écran d\'accueil de l\'iPhone, l\'iPad ou Android', 'openInstall(true)')}
      ${KOFI_URL ? item('coffee', 'gold', '☕ Soutenir EPS ONE', 'Offrir un café sur Ko-fi (facultatif · page en anglais, carte ou PayPal)', `window.open('${KOFI_URL}','_blank','noopener')`) : ''}
      ${item('info', 'navy', 'Mentions légales', 'Éditeur, hébergement, responsabilité', "window.open('mentions-legales.html','_blank','noopener')")}
      ${item('info', 'navy', 'À propos', 'Objectif, installation, crédits', 'openAbout()')}
      ${item('update', 'grad', 'Mise à jour', `Version ${APP_VERSION} · nouveautés`, 'openUpdate()')}
      ${item('mail', 'blue', 'Contact', 'steffdelaseuva@gmail.com', "location.href='mailto:steffdelaseuva@gmail.com?subject=EPS%20ONE'")}
    </div>
    <div class="menu-sec">Année scolaire</div>
    <div class="card" style="padding:0" data-cfg>
      ${item('calendar', 'gold', 'Nouvelle année scolaire', `Année en cours : ${esc(DB.annee)} · archiver ou repartir à zéro`, 'openNewYear()')}
      ${item('trash', 'navy', '<span style="color:var(--danger)">Tout effacer</span>', 'Supprime toutes les données de cet appareil', 'resetAll()')}
    </div>
    <p class="muted" style="text-align:center;margin:22px 0 6px">EPS ONE · v${APP_VERSION} · by <b>Steff64</b></p>`;
}
const renderPlusYear = renderPlus;

const _renderHome = renderHome;
renderHome = function () { _renderHome(); renderPlus(); };
renderHome();


/* ---------- « Comment ça marche ? » (accueil) ---------- */
window.openHowTo = () => openPanel('Comment ça marche ?', el => {
  const step = (n, t, d, btn) => `<div class="card" style="display:flex;gap:14px;align-items:flex-start;margin-top:12px">
      <div style="flex:0 0 38px;height:38px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;font-weight:900;font-size:1.1rem">${n}</div>
      <div style="flex:1;min-width:0"><b style="font-size:1.05rem">${t}</b><p class="muted" style="margin:4px 0 0;line-height:1.45">${d}</p>${btn || ''}</div></div>`;
  const b = (label, fn) => `<button class="btn btn-ghost" style="margin-top:10px" onclick="${fn}">${label}</button>`;
  el.innerHTML = `<p style="margin:0 0 4px;line-height:1.5">EPS ONE réunit vos outils de cours dans une seule app, <b>sans compte obligatoire</b> et <b>sans publicité</b>. En 5 étapes :</p>
    ${step(1, '📥 Importez ou créez vos classes', 'Fichier Pronote / ENT (CSV ou Excel) ou saisie à la main. Rangez-les en <b>classes EPS</b>, <b>UNSS / AS</b> ou <b>autres classes</b> (cross).', b('📥 Mes classes', "openImportClasses()"))}
    ${step(2, '🧰 Utilisez les outils', 'Chronos, matchs, cross, HYROX, acrosport, gym, demi-fond… Vos classes sont déjà dedans : choisissez la classe, les élèves et les groupes apparaissent.', b('Ouvrir les OUTILS →', "closeTool();go('outils')"))}
    ${step(3, '📶 Hors ligne ou en synchro entre tablettes', 'Sans réseau, tout fonctionne et reste sur l\'appareil. Avec la synchronisation (votre cloud ou un compte EPS ONE), chaque groupe peut avoir sa tablette et les résultats arrivent en direct sur la vôtre.', b('🔄 Synchronisation', "openSync()"))}
    ${step(4, '🔒 Confiez les tablettes aux élèves', 'Créez votre <b>code enseignant</b> : les élèves utilisent les outils (chronos, coches, projets…) mais ne peuvent pas modifier vos réglages. Le bouton 🔒/🔓 en haut verrouille avant de passer la tablette.', b('🔒 Code enseignant', "openProfPin()"))}
    ${step(5, '📊 Retrouvez les résultats', 'Les résultats de chaque outil arrivent dans <b>Résultats des élèves</b> (individuel) et <b>Résultats collectifs</b> (groupes, tournois), exportables en CSV.', b('📊 Résultats des élèves', "openTool('resultats')"))}
    <p class="muted" style="margin:14px 2px 0;font-size:.85rem">Astuce : installez l'app sur l'écran d'accueil (Plus → Installer l'application) et ajoutez vos outils préférés en ☆ favoris.</p>`;
});
