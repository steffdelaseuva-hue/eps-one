/* =========================================================
   EPS ONE — Onglet PLUS : mise à jour, partage,
   à propos, confidentialité/RGPD, nouvelle année scolaire
   ========================================================= */
/* Page Ko-fi : laisser vide tant qu'elle n'existe pas (le bouton est alors masqué) */
const KOFI_URL = 'https://ko-fi.com/epsone';
const APP_VERSION = '21.6';
const APP_URL = 'https://steffdelaseuva-hue.github.io/eps-one/';
const CHANGELOG = [
  { v: '21.6', items: ['Cross : chaque tablette cale automatiquement son horloge sur l\'heure du serveur (départs, TOP et arrivées comparables même si une tablette est mal réglée) ; l\'état de l\'horloge s\'affiche dans la carte « Arrivées »', 'Cross : bouton « 🗑 Effacer tous les départs, TOP et passages » (Enseignant) pour remettre un cross à zéro après un test, en gardant inscriptions et dossards ; « ↺ » aussi disponible sur une course terminée'] },
  { v: '21.5', items: ['Cross : la liste des derniers passages affiche le temps de course ⏱ en gros et l\'heure d\'arrivée en petit (ou « départ pas reçu » si le TOP départ n\'est pas encore arrivé sur la tablette)'] },
  { v: '21.4', items: ['Cross : bouton « 🏁 Terminée » sur chaque course — le chrono s\'arrête, le classement est figé, les scans suivants sont refusés (« ↩ Rouvrir » possible) ; le bouton passe au vert quand tous les coureurs sont arrivés (« 🎉 tous arrivés »)'] },
  { v: '21.3', items: ['Cross : avec plusieurs tablettes synchronisées en direct, la liste des arrivées, les TOP et les départs s\'affichent et s\'enregistrent immédiatement (l\'écran restait figé jusqu\'au rechargement)', 'Cross : le bouton « ⏹ Stop » devient « ↺ Faux départ » (inutile en fin de course : le chrono s\'arrête pour chaque coureur à son arrivée)'] },
  { v: '21.2', items: ['Cross : nouveau mode d\'arrivée « 🏁 TOP sur la ligne » pour un classement exact — une tablette « Ligne » par couloir (gros bouton TOP au passage de chaque coureur) et une tablette « Scan » au bout du couloir ; le n-ième dossard scanné reçoit l\'heure du n-ième TOP', 'Fonctionne sans réseau pendant la course (tout se regroupe à la synchronisation) ; temps provisoire ⏳ tant que le TOP n\'est pas reçu ; écran « Contrôle TOP ↔ dossards » pour corriger un TOP oublié ou en trop'] },
  { v: '21.1', items: ['Confidentialité & RGPD : chiffrement de bout en bout avec Google Drive et Dropbox, et nouvelle rubrique « Caméra, photos et vidéos » (ce qui reste sur l\'appareil, ce qui est partagé chiffré, droit à l\'image)'] },
  { v: '21.0', items: ['Google Drive / Dropbox : chiffrement de bout en bout (comme Firebase) avec une phrase de chiffrement choisie par l\'enseignant — le cloud ne stocke plus que du contenu illisible ; la phrase est demandée une fois sur chaque appareil (Plus → Stockage & synchronisation)'] },
  { v: '20.9', items: ['Synchronisation : les grosses rubriques (historique des matchs…) sont découpées en plusieurs morceaux — elles ne sont plus bloquées par la limite de taille (« trop volumineuse »), qui empêchait les matchs de partir vers les autres tablettes', 'Une rubrique en erreur ne bloque plus l\'envoi des autres, et une erreur de synchronisation est maintenant signalée à l\'écran'] },
  { v: '20.8', items: ['Camemberts de résultats : camemberts pleins, une part par critère avec le pourcentage écrit dans la part (au lieu des anneaux)'] },
  { v: '20.7', items: ['Gestion de match · championnat par poule : l\'arbitre de chaque rencontre est désigné automatiquement à l\'avance dans la liste des tours (équipe exempte d\'abord, arbitrages équilibrés) ; « Jouer ce match » et « Match suivant » le reprennent, export CSV compris'] },
  { v: '20.6', items: ['Duathlon : impossible de passer à l\'étape 2 ou 3 tant que le chrono de l\'étape précédente n\'est pas arrêté (🔒 sur la tablette d\'un groupe ; côté enseignant, blocage tant qu\'un groupe est encore en course)', 'Défi ATP : classement de départ au choix — ordre alphabétique, au hasard ou par niveau (2 à 6 niveaux, écart de points réglable ; tirage au sort au sein d\'un niveau)'] },
  { v: '20.5', items: ['Interclasses : choisir soit le nombre d\'équipes, soit le nombre de joueurs par équipe (le nombre d\'équipes est alors calculé) ; aperçu « 11 équipes de 6 à 7 joueurs » avant de créer'] },
  { v: '20.4', items: ['Interclasses : boutons de points adaptés au sport et modifiables (rugby 5 / 2 / 3, basket 1 / 2 / 3…)', 'Interclasses : points bonus donnés par l\'enseignant pendant le match (valeurs réglables : 3, 5, 10, 100, 1000…), ajoutés au score et affichés « dont bonus » ; « ↶ Annuler le dernier ajout » dans la feuille de score'] },
  { v: '20.3', items: ['Nouvel outil « Interclasses » (Activités de duel · sports collectifs) : 2 classes ou plus, équipes par classe ou mélangées (tirage équilibré, déplacements d\'élèves, absents), handball / basket / football / rugby / ultimate / volley', 'Formule poules + phases finales (des 16es à la finale, 3e place) ou championnat simple, aller ou aller-retour, plusieurs terrains (une poule par terrain ou placement libre)', 'Calendrier par rotations avec chrono commun, arbitres désignés parmi les équipes au repos, points V/N/D/forfait, bonus offensif et défensif, classements et tableau final automatiques, export CSV et envoi dans Résultats des élèves'] },
  { v: '20.2', items: ['Correction : la flèche retour ne répondait plus dans « Copies de secours »'] },
  { v: '20.1', items: ['Synchronisation plus sûre : une classe n\'est plus jamais retirée du compte si elle n\'a pas été supprimée volontairement (Mes classes) — un appareil resté en retard, à la mémoire pleine ou fermé trop vite ne peut plus effacer les classes des collègues', 'Les données reçues sont enregistrées sur l\'appareil avant la mise à jour de la synchronisation ; un appareil en retard refait une fusion sans suppression'] },
  { v: '20.0', items: ['Mon cloud : Dropbox proposé en premier (« conseillé » : connexion durable)', 'Google Drive : la connexion (limitée à 1 h par Google) est renouvelée automatiquement au premier toucher dans l\'app, puis la synchronisation reprend'] },
  { v: '19.9', items: ['Google Drive / Dropbox : le compte connecté est affiché (le même doit être utilisé sur tous les appareils)', 'Nouveaux boutons « 🔍 Vérifier ce qui est sur Google Drive » (classes sur le cloud / sur l\'appareil) et « ⬇️ Tout récupérer »', 'Quand la connexion Google a expiré (au bout d\'1 h), une pastille « 🔑 Reconnecter pour envoyer » apparaît : plus de modifications qui restent bloquées sans le savoir'] },
  { v: '19.8', items: ['Cross : un cross créé avec « Dupliquer » accepte aussi au scan les dossards QR déjà imprimés du cross d\'origine (mêmes numéros, mêmes élèves)'] },
  { v: '19.7', items: ['🛟 Copies de secours automatiques : une copie par jour sur chaque tablette (7 derniers jours) — Plus → Copies de secours : récupérer les classes manquantes, télécharger la copie ou tout remettre comme ce jour-là', 'Protection des classes : si une synchronisation (autre tablette ou autre connexion au compte) supprime des classes, un bandeau prévient et propose « ↶ Restaurer »'] },
  { v: '19.6', items: ['Mode Équipe EPS : chaque enseignant ne voit plus que ses propres résultats dans les outils (duathlon, combiné, crosstraining, CO, demi-fond, sauvetage, natation, escalade, relais, tournois et matchs, lutte, dispenses, résultats collectifs) — rien n\'est effacé, les données du collègue sont seulement masquées ; « Voir toutes les classes de l\'équipe » réaffiche tout'] },
  { v: '19.5', items: ['Natation : bouton ✅ Validation enseignant seulement en « Nager vite » (le test « Savoir nager » est déjà une validation)'] },
  { v: '19.4', items: ['Mode Équipe EPS (compte partagé entre collègues) : « Séances en cours sur vos autres tablettes » ne montre plus que les séances de l\'enseignant actif et de ses classes'] },
  { v: '19.3', items: ['Validation enseignant (✅) en sports collectifs : critères propres à chaque sport (handball, basket-ball, football, volley-ball, rugby, ultimate) ou « Général », tous modifiables', 'Bouton ✅ Validation enseignant aussi en natation, sauvetage aquatique, crosstraining / HYROX et cross : créez vos critères (ou ajoutez les critères proposés 💡)'] },
  { v: '19.2', items: ['Cross : décalage des départs différés réglable en minutes et en secondes (ex. 0 min 30 s)', 'Validation enseignant (✅) aussi dans les activités de duel : sports collectifs, sports de raquette, escrime et lutte — critères rangés en Attaque / Défense / Rôles (porteur, tireur, passeur, non-porteur, prise d\'informations, choix, replacement, arbitrage…), 4 niveaux de maîtrise en couleur, critères modifiables'] },
  { v: '19.1', items: ['Cross : départs différés dans les réglages de chaque course — une ou plusieurs classes, un ou plusieurs élèves partent plus tard, avec un décalage en minutes (départ automatique) ou leur propre « 🔫 TOP » ; leur temps est compté depuis leur départ', 'Validation enseignant (bouton ✅ en haut de l\'outil, protégé par le code enseignant) en combiné, demi-fond, duathlon, danse, escalade et course d\'orientation : 4 niveaux de maîtrise par critère et par élève, tableau de la classe, critères modifiables, export CSV, bilan enregistré dans Résultats des élèves'] },
  { v: '19.0', items: ['Escalade : choix de l\'assureur et du contre-assureur pour chaque passage (à la main, « 🎲 Assureurs au hasard » ou « 🎲 Cordée complète au hasard » — le tirage choisit ceux qui ont le moins tenu le rôle) ; sur la tablette d\'une cordée, rotation automatique après chaque voie', 'Escalade · Résultats : tableau « 🪢 Rôles dans la cordée » (nombre de fois grimpeur, assureur, contre-assureur par élève), cordée affichée sur chaque passage et dans l\'export CSV'] },
  { v: '18.9', items: ['Élimination directe : carte « 🎯 Match suivant » avec les arbitres désignés automatiquement — les perdants des tours précédents arbitrent (le moins d\'arbitrages d\'abord) ; au 1er tour, arbitres pris parmi ceux qui attendent leur match ; « ⏭ Autre match » et « 🔄 Autres arbitres »'] },
  { v: '18.8', items: ['Tournois en poules (championnat) : carte « 🎯 Match suivant » dans chaque poule — l\'appli désigne qui joue (les plus reposés d\'abord) et qui arbitre (1 ou 2 arbitres selon le nombre de joueurs de la poule, le moins d\'arbitrages d\'abord) ; « ⏭ Autre match » et « 🔄 Autres arbitres » si besoin ; arbitres affichés sur chaque rencontre, colonne ⚖️ (nombre d\'arbitrages) au classement et dans l\'export CSV'] },
  { v: '18.7', items: ['Photos (acrosport, gym, escalade, danse) rangées à part sur la tablette : l\'enregistrement redevient instantané même avec beaucoup de photos, et elles ne remplissent plus l\'espace limité des données (déplacement automatique au premier lancement, synchronisation inchangée)', 'Plus › « 💾 Espace utilisé » : jauge des données, nombre et poids des photos, espace des vidéos ; alerte si la mémoire de la tablette est pleine'] },
  { v: '18.6', items: ['Danse · Banque : une œuvre célèbre dont l\'image est ajoutée n\'affiche plus « Voir l\'œuvre » ni « Changer » ; touchez l\'image pour l\'agrandir'] },
  { v: '18.5', items: ['Danse : dans le projet en cours, chaque élément se retire avec ✕ (œuvre, supports, inducteurs, procédés) et « 🗑 Tout supprimer » vide le projet (↶ Annuler possible)', 'Danse : tirage au sort dans la banque — un support au hasard du type affiché, ou « un de chaque » (image, texte, vidéo, musique), selon le niveau choisi'] },
  { v: '18.4', items: ['Danse : musiques des œuvres (Boléro, Sacre du printemps, Apprenti sorcier, Grieg, Satie, Vivaldi, Saint-Saëns, Lac des cygnes…) avec un lien direct vers Apple Music, Spotify, Deezer et YouTube Music ; ajout de vos propres liens de musique ou fichiers audio', 'Danse : images des œuvres d\'architecture (Tour Eiffel, Guggenheim de Bilbao, Viaduc de Millau) dans l\'onglet Œuvre, la Banque et l\'affichage en grand'] },
  { v: '18.3', items: ['Danse : nouvel onglet « 🗂️ Banque » — images à danser (dessinées pour l\'appli), œuvres célèbres à retrouver et à ajouter en photo, textes (La Fontaine, Hugo, Verlaine, Rimbaud, Apollinaire, Éluard, haïkus), extraits vidéo (lien de recherche ou votre propre fichier), 12 sons créés par l\'appli (cœur, pulsations, pluie, vent, tambours…) et vos propres images, textes, vidéos et sons ; chaque support s\'ajoute au projet et s\'affiche en grand', 'Danse : inducteurs reformulés simplement pour les élèves (« Léger comme une plume », « Ton coude guide tout ton corps »…)', 'Danse : nouvel onglet « 🧩 Procédés » de composition (temps, espace, groupe, énergie) à choisir ou tirer au sort', 'Danse : tout est classé en Niveau 1 (basiques) et Niveau 2 (plus complexes), avec un filtre et des tirages par niveau'] },
  { v: '18.2', items: ['Danse : les œuvres peuvent proposer des extraits précis (🎬 vidéo, 🖼️ visuel, 📖 texte, 🎵 son) avec l\'extrait, l\'inducteur et la consigne pour les élèves — exemple complet avec Contagion (scène du restaurant, affiche biorisque, explications de l\'épidémiologiste, bande originale) et son récapitulatif des déclencheurs ; affichés aussi en grand pour la classe'] },
  { v: '18.1', items: ['Nouvel outil « Danse » (Activités gymniques & artistiques) : 1/ choisir une œuvre ou un thème (arts visuels, architecture, littérature, histoire, musique, cinéma & récits, repères en danse, thèmes) avec pistes, grille de transposition « élément de l\'œuvre → consigne de mouvement » et consigne type, ou ajouter ses propres œuvres avec photo ; 2/ inducteurs en 5 familles (visuels, sonores, corporels, relationnels, imaginaires) choisis à la main ou tirés au sort, avec verrouillage 🔒 ; 3/ projets enregistrés par groupe, affichage en grand pour les élèves ; 4/ filmer les groupes et comparer deux vidéos côte à côte (départs calés, lecture synchronisée, ralenti)'] },
  { v: '18.0', items: ['Montée-descente : vrais terrains dessinés (badminton vert, shortennis bleu, tennis terre battue, table de tennis de table) séparés par le filet — les joueurs se placent de chaque côté du filet, avec une petite zone ⚖️ arbitres à chaque bout du filet ; même dessin dans « 📺 Afficher les terrains »'] },
  { v: '17.9', items: ['Nouvel outil « Montée-descente » (Activités de duel · Sports de raquette) : en fin de séance, touchez un ou plusieurs élèves puis le terrain où ils ont fini (zone Joueurs ou Arbitres) ; badminton, shortennis, tennis (6 terrains en 12 demi-terrains ou terrains entiers) et tennis de table (12 tables), nombre de terrains réglable ; jusqu\'à 6 joueurs et 4 arbitres par demi-terrain ou table (le double sur un terrain entier) ; placement gardé par classe et par sport pour la séance suivante, ↶ Annuler, et « 📺 Afficher les terrains » en grand pour les élèves'] },
  { v: '17.8', items: ['Cross à plusieurs tablettes sans connexion : une tablette qui n\'a pas reçu le TOP DÉPART enregistre quand même les passages (rang calculé après synchronisation) ; en course aux tours, un même tour scanné sur deux tablettes n\'est compté qu\'une fois'] },
  { v: '17.7', items: ['Cross : l\'onglet « 📷 Arrivée » devient « 🔫 TOP DÉPART ! » (boutons « 🔫 TOP DÉPART ! » par course et départ groupé, puis scan des arrivées dans le même onglet)'] },
  { v: '17.6', items: ['Cross : les dossards indiquent ce que le coureur doit faire — course à la distance : la distance, et le nombre de tours si la longueur du tour est indiquée (ex. « 1200 m · 3 tours ») ; course aux tours (le maximum de tours dans le temps) : « Course aux tours · boucle de … m »'] },
  { v: '17.4', items: ['Cross : « 📄 Un PDF par classe » — un fichier de dossards par classe sélectionnée (plus léger), tous joints d\'un coup au même e-mail via le menu Partager'] },
  { v: '17.3', items: ['Cross : le PDF des dossards indique le nombre de dossards et de pages (aussi dans le nom du fichier) ; sur iPhone / iPad, « 🖨 Imprimer » passe par ce PDF complet (menu Partager → Imprimer)'] },
  { v: '17.2', items: ['Cross : « 📄 PDF » des dossards (4 par page A4, QR codes) à envoyer par e-mail — sur iPhone / iPad la feuille de partage s\'ouvre (Mail, Fichiers, AirDrop…), sur ordinateur le PDF est téléchargé. Bouton dans l\'onglet Dossards et dans l\'aperçu avant impression'] },
  { v: '17.1', items: ['Cross : impression des dossards et des classements corrigée sur iPhone / iPad (le bouton « 🖨 Imprimer » imprime directement les dossards ; « ↗ Ouvrir » ne renvoie plus d\'erreur Safari)'] },
  { v: '17.0', items: ['Gymnastique : le lien du diaporama saisi sur un élément est copié dans tous les éléments (case « Le même lien pour tous les éléments », décochable pour un lien propre à un élément, ↶ Annuler). Acrosport : une nouvelle liaison reprend le dernier lien, case « Le même lien pour toutes les liaisons »', 'Gymnastique et Acrosport : « 🎬 Ajouter une vidéo » en plus de la photo (filmer ou choisir une vidéo), pour chaque élément ou figure de l\'enchaînement ; lecture en grand avec ralenti ×0,25 / ×0,5, aussi dans « ▶ Présenter l\'enchaînement ». Les vidéos restent sur la tablette qui les a filmées (trop lourdes pour la synchronisation)', 'Synthèses en camemberts pour les sports collectifs, de raquette et de combat : part des points, origine des points, points normaux / points bonus de chaque équipe ; dans le bilan du match, les tournois (points, victoires, normaux / bonus), les Résultats collectifs, les Résultats des élèves (synthèse de la classe et d\'un élève : matchs gagnés / nuls / perdus, points normaux / bonus de son équipe, observations, combats de lutte) et la lutte (bilan du combat, synthèse de la classe et d\'un élève)'] },
  { v: '16.8', items: ['Championnat : taille des poules au choix (3, 4, 5 ou 6 équipes ou joueurs), répartition au hasard possible, matchs aller-retour', 'Tournois : règles des matchs modifiables en cours de tournoi (temps / points, bonus, statistiques, observations individuelles) ; chaque tablette peut n\'afficher que sa poule', 'Raquettes et escrime : « 👤 Match en simple » — choisir directement 2 élèves', 'Synthèse de match : camemberts (part des points, origine des points : points, bonus +5, +10…) et observations individuelles en fiches lisibles par joueur', 'Course d\'orientation : parcours différent par groupe / élève ou « choix libre » de N balises ; suivi enseignant uniquement (coupons papier) ; « 🔁 repartir sur un nouveau parcours » après chaque arrivée'] },
  { v: '16.7', items: ['Groupes / équipes : 4e mode « ✋ Manuel » partout (à côté d\'Aléatoire, Hétérogène, Homogène) — groupes à gauche, liste des élèves à droite ; seuls les élèves placés participent (une seule équipe, 2 joueurs…), idéal sans synchronisation', 'Modification des groupes : on peut sélectionner plusieurs élèves à la fois puis toucher le groupe de destination'] },
  { v: '16.6', items: ['Tournois : un tournoi reste dans « Tournois en cours » tant qu\'il n\'est pas terminé, même plusieurs semaines après (il disparaissait au bout de 7 jours) ; « ✔ Terminer le tournoi » le range dans « 📁 Tournois terminés », réouvrable ; un tournoi supprimé peut être restauré', 'Défi ATP : l\'enseignant peut modifier les points d\'un élève (classement recalculé, ajustements annulables) ; toucher un nom dans le classement affiche tous ses défis', 'Historique des défis repliable ; composition des équipes visible sous leur nom (flèche) et dans « 👥 Composition des équipes »', 'Au lancement d\'un match ou d\'un défi de tournoi, l\'écran n\'affiche plus que le match à jouer (réglages masqués, affichables)', 'Séances partagées (HYROX, duathlon, combiné, demi-fond, sauvetage, CO) : une séance non enregistrée qui disparaît de la tablette peut être reprise (« ♻️ Séance interrompue ») pour terminer et envoyer les résultats'] },
  { v: '16.5', items: ['Gymnastique : enchaînement individuel — « Élève ou groupe » en haut, chaque élève crée le sien (les groupes restent possibles)', 'Gymnastique et Acrosport : pendant « ▶ Présenter l\'enchaînement », l\'enseignant valide chaque élément (maîtrise insuffisante, fragile, satisfaisante, très bonne) ; bilan affiché sous l\'enchaînement', 'Acrosport : exigences de l\'enchaînement réglables (nombre de pyramides, niveau maximal, duos / trios / quatuors minimum, voltigeurs renversés obligatoires)', 'Composition des groupes : « Classer les élèves par niveau » (« niveau de jeu » réservé aux activités de duel)', 'Course d\'orientation : 90 symboles de balises au lieu de 50'] },
  { v: '16.4', items: ['Gymnastique : nouveau bouton « 📄 Démarche avec fiches + QR codes » — fiches Sol 4e / 3e par atelier (éléments par famille et par niveau), à télécharger (recto-verso ou 1 page) ou à ouvrir dans l\'appli : touchez un QR code pour lancer la vidéo', 'Parkour : lien vers l\'appli Parkour-Freerun du collège d\'Arzacq mis en valeur avec son logo'] },
  { v: '16.3', items: ['Test VMA : la voix annonce d\'abord « Attention… départ dans 3 secondes », puis le décompte 3-2-1 commence (il ne démarre plus pendant l\'annonce)'] },
  { v: '16.1', items: ['Acrosport · Sécurité : chaque prise de mains a maintenant son dessin (porteur en bleu, voltigeur en or) pour voir clairement où et comment placer les mains'] },
  { v: '16.0', items: ['Parkour : la fluidité devient un niveau de maîtrise — 3 appuis entre les éléments = très satisfaisant, 4 = satisfaisant, 5 = fragile, 6 et + = insuffisant (niveau global = moyenne des liaisons)', 'Parkour : suppression d\'un coup à chaque étape (« 🗑 Tout supprimer » les éléments, « Tout retirer » de l\'enchaînement, « Tout effacer » les validations), 🗑 sur l\'enchaînement enregistré, remise à zéro de l\'élève ou de la classe — avec « ↶ Annuler »', 'Acrosport : un seul filtre « Renversé (ATR) » regroupe les voltigeurs renversés et semi-renversés'] },
  { v: '15.9', items: ['Parkour niveau 2 : à l\'étape ③ Validation, le prof touche le nombre d\'appuis observés entre chaque élément de l\'enchaînement (3, 4, 5, 6+) et règle l\'objectif → « Fluidité validée » ou « Trop d\'appuis »'] },
  { v: '15.8', items: ['Acrosport : 44 nouvelles pyramides (duos, trios, quatuors) avec un niveau de référence A → D, nouvelle position « Voltigeur à l\'équerre », nouvelles postures (pont, fente, allongé, à genoux sur les talons…) ; le filtre « Renversé » inclut les semi-renversés', 'Acrosport : onglet « 🛡️ Sécurité » — règle d\'or, zones d\'appui autorisées / interdites, rôles porteur / voltigeur / pareur, prises de mains', 'Parkour : 3 étapes ① Choisir ses éléments · ② Créer son enchaînement · ③ Validation ; en niveau 2 (4e), fluidité réglable (3, 4, 5 ou 6+ appuis entre les éléments) et validée'] },
  { v: '15.7', items: ['Nouvel outil « Tests 2nde (évaluations nationales) » : endurance (Luc Léger), force (saut en longueur sans élan), vitesse (50 m) — même fonctionnement que les Tests 6e (sessions début / fin d\'année, tableau, bilan, export CSV)'] },
  { v: '15.6', items: ['Acrosport : niveau de difficulté A (facile) · B (moyen) · C (difficile) · D (très difficile) sur chaque pyramide — calculé automatiquement (appuis des porteurs, nombre d\'étages, position du voltigeur, combinaisons), modifiable à la main dans la fiche (bouton « Auto » pour revenir au calcul) ; nouveau filtre « Niveau de difficulté »'] },
  { v: '15.5', items: ['Lutte : bouton « 🗑 Supprimer tous les relais et tournois en cours » et, dans un relais à plusieurs zones, « Supprimer toutes les zones de ce relais »'] },
  { v: '15.4', items: ['Combiné · saisie des résultats prof : colonne « 🎯 Projet » pour chaque course (temps visé ou distance visée) → écart au projet calculé'] },
  { v: '15.3', items: ['Lutte · relais en équipe : 1 à 8 zones de combat (2 équipes par zone) ; chaque zone devient un relais partagé avec les tablettes'] },
  { v: '15.2', items: ['« ✍️ Saisie des résultats prof (sans lancer l\'épreuve) » : Combiné / Triathlon, Duathlon, Natation, HYROX / Crosstraining — un tableau de la classe à remplir, résultats envoyés au Bilan et aux Résultats des élèves', 'Projets (Combiné, Demi-fond, Sauvetage) : un élève à la fois avec ◀ liste ▶, au lieu d\'une longue liste', 'Combiné : boutons « 🎯 Saisir les projets » et « ▶ Préparer la saisie directement » à la fin des réglages ; « ▶ Préparer la saisie » dans l\'onglet Projets'] },
  { v: '15.1', items: ['Multi chrono (12 élèves) : s\'affiche correctement dans l\'app (il montrait l\'accueil d\'EPS ONE) ; « Plein écran » reste dans l\'app avec un bouton ✕ pour revenir'] },
  { v: '15.0', items: ['Toutes les fenêtres (choix, aperçus, réglages…) : bouton ✕ toujours visible en haut à droite et défilement possible quand la fenêtre dépasse l\'écran (iPhone, iPad)'] },
  { v: '14.9', items: ['Combiné athlétique « sans + avec élan » : la meilleure performance sans élan (saut et lancer) est saisie en début d\'épreuve comme référence, juste au-dessus des essais avec élan ; écart en mètres et en %'] },
  { v: '14.7', items: ['Équipe EPS : bouton 😀 dédié pour choisir l\'avatar (photo, Memoji, émoji), légende des boutons'] },
  { v: '14.6', items: ['Escrime : préparation en 4 étapes (assaut, tournoi style ATP, championnat, élimination, pyramide · déroulement · tireurs · réglages)'] },
  { v: '14.5', items: ['Sports collectifs : préparation en 4 étapes (forme · déroulement · équipes · réglages) et match en « résultats simples »', 'Équipe EPS : avatar de chaque enseignant (photo, capture de son Memoji ou émoji) à la place des initiales'] },
  { v: '14.4', items: ['Sports de raquette : préparation en 4 étapes comme la Lutte — 1. sport et forme de pratique (match, Défi ATP, championnat, élimination, pyramide) · 2. déroulement (avec observation / résultats simples) · 3. joueurs ou équipes · 4. réglages', 'Match isolé en « résultats simples » : on saisit seulement le score final'] },
  { v: '14.3', items: ['« Comment ça marche ? » : étape à part « 👥 Équipe EPS · tablettes partagées » (6 étapes)', 'Liens directs à partager : …/eps-one/#equipe (ouvre cette étape) et …/eps-one/#aide'] },
  { v: '14.2', items: ['« Comment ça marche ? » : le mode Équipe EPS (tablettes partagées) est présenté à l\'étape 3'] },
  { v: '14.1', items: ['Gestion de match · sports collectifs : Défi ATP retiré (format individuel)', 'Escrime : « 🤺 Tournoi style ATP »', 'Lutte : nouveau « 🤼 Tournoi style ATP » (classement aux points, défis jusqu\'à 6 places au-dessus, arbitrage +0,5, partagé entre tablettes)', 'Dispenses : bouton ✏️ pour modifier une dispense enregistrée'] },
  { v: '14.0', items: ['Correction importante : quand une autre tablette envoyait ses résultats pendant la séance, l\'outil ouvert pouvait enregistrer dans une ancienne copie des données (résultats d\'un groupe perdus). Corrigé dans Duathlon, Demi-fond, Sauvetage, Escalade, Acrosport, Parkour', 'Fenêtre « Groupes de la séance » : bouton ✔ Terminé toujours visible en haut, défilement conservé'] },
  { v: '13.9', items: ['Synchronisation Dropbox / Google Drive : plusieurs tablettes qui envoient en même temps ne peuvent plus effacer l\'envoi d\'une autre (écriture conditionnelle Dropbox, double vérification Drive)', 'Duathlon : carte « 📤 Envois de cette tablette » (✅ envoyé · ⏳ en attente · ⚠️ absent → 🔁 Renvoyer, copie de secours sur la tablette)', 'Duathlon : suivi « 📥 Résultats reçus des tablettes » groupe par groupe sur la tablette enseignant'] },
  { v: '13.8', items: ['Mode élève (🔒) : onglets « 📊 Résultats / Bilan » des outils protégés par le code (y compris quand l\'outil y bascule après un enregistrement)', 'Mode élève : listes de résultats limitées à la classe en cours (Natation, Lutte), historique des matchs masqué, export protégé'] },
  { v: '13.7', items: ['Mode élève (🔒) : les élèves restent dans l\'outil ouvert — quitter l\'outil, en ouvrir un autre ou changer d\'onglet (Accueil / Outils / Plus) demande le code enseignant'] },
  { v: '13.6', items: ['Duathlon étape 3 (binômes) : un seul compteur de tours pour le binôme (8 tours en binôme, et non 8 + 8) — réglable par étape à la préparation'] },
  { v: '13.5', items: ['Escalade : les cordées sont proposées aux autres tablettes (« ▶ Rejoindre » puis choix de la cordée)', 'Natation : « Une tablette par ligne d\'eau » — le prof répartit la classe en 2 à 6 lignes, chaque tablette rejoint sa ligne'] },
  { v: '13.4', items: ['Duathlon : les tours (＋/−) sont bloqués tant que le groupe n\'a pas atteint les points de lancers de l\'étape (15 / 20 / 30, réglables), message « course ouverte » dès qu\'ils sont atteints', 'Duathlon : lancers non valides placés juste sous les points de lancers'] },
  { v: '13.3', items: ['Activités de performance : sous-groupes APSA et Outils', 'Activités de duel : Sports collectifs (Gestion de match + Table de marque), Sports de raquette (carte dédiée) et Sports de combat (Escrime et Lutte en cartes séparées) — matchs, tournois et historiques conservés'] },
  { v: '13.2', items: ['Dispenses : liste déroulante des élèves de la classe choisie (fonctionne sur iPhone/iPad), élèves déjà dispensés signalés, saisie libre possible'] },
  { v: '13.1', items: ['Vitesse de course : distance, temps, vitesse, VMA et % VMA interdépendants (2 valeurs saisies → la 3e est calculée, ex. VMA + % + durée → distance)'] },
  { v: '13.0', items: ['Nouveau mode « Équipe EPS » pour les lots de tablettes partagées (Plus → Équipe EPS) : « Qui fait cours ? », code perso par enseignant, chacun retrouve ses classes et ses favoris', 'Mes classes : choix de l\'enseignant de chaque classe (ou classe commune)', 'Conseil de stockage pour les équipes : Dropbox (connexion durable sur tablettes partagées)'] },
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
          <li><b>Chiffrement de bout en bout aussi avec Google Drive et Dropbox</b> (recommandé : Plus → Stockage & synchronisation → « 🔒 Chiffrer mes données ») : avec une <b>phrase de chiffrement</b> choisie par l'enseignant, les données sont chiffrées sur l'appareil (AES-256) avant l'envoi. Google ou Dropbox ne stockent que du contenu illisible. La phrase est saisie une fois sur chaque appareil et n'est jamais envoyée ; en cas d'oubli, les données du cloud deviennent illisibles, celles des appareils sont conservées.</li>
          <li>Vous pouvez à tout moment <b>supprimer toutes vos données en ligne</b> (Plus → Stockage & synchronisation) : la synchronisation s'arrête et les données restent seulement sur l'appareil.</li>
          <li><b>Conseil</b> : en mode synchronisé, préférez <b>prénom + initiale</b> pour les élèves. Pour toute question sur l'usage d'outils numériques avec des données d'élèves, votre établissement reste l'interlocuteur de référence.</li></ul>
        <h3>📷 Caméra, photos et vidéos</h3>
        <ul><li><b>Vidéo différée, photo-finish, scan des dossards</b> : la caméra n'est utilisée que pendant que l'outil est ouvert ; les images restent en mémoire vive, ne sont jamais enregistrées ni envoyées.</li>
          <li><b>Vidéos</b> ajoutées en danse, gym ou acrosport : enregistrées <b>uniquement sur l'appareil</b>, jamais envoyées en ligne.</li>
          <li><b>Photos</b> ajoutées en acrosport, gym, escalade ou danse : enregistrées sur l'appareil et, si la synchronisation est activée, partagées avec vos autres appareils <b>chiffrées de bout en bout</b> (Firebase, ou Google Drive / Dropbox avec phrase de chiffrement).</li>
          <li><b>Droit à l'image</b> : photographier ou filmer des élèves suppose l'autorisation des responsables légaux (souvent recueillie par l'établissement en début d'année). Effacez les photos et vidéos qui ne servent plus, au plus tard en fin d'année.</li></ul>
        <h3>🌐 Hébergement</h3>
        <p>L'application est hébergée sur GitHub Pages. Comme pour tout site web, l'hébergeur peut enregistrer des données techniques de connexion (adresse IP) lors du chargement de la page. Aucune donnée d'élève ne transite par ce biais (en mode synchronisé, elles transitent uniquement vers Firebase, ou vers votre Google Drive / Dropbox, chiffrées de bout en bout).</p>
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
          <div class="card"><b>${DB.classes.length}</b><small>classes</small></div><div class="card"><b>${nbEleves}</b><small>élèves</small></div><div class="card"><b>${size} Ko</b><small>données</small></div></div>
        <div id="mem-g" style="margin-top:12px"></div>
        <div class="row" style="margin-top:12px"><button class="btn btn-ghost" onclick="exportData()">💾 Exporter</button><button class="btn btn-danger" id="del">🗑 Tout effacer</button></div></div>`;
    el.querySelector('#del').onclick = () => { resetAll(); closeTool(); };
    memGauge(el.querySelector('#mem-g'), size);
  });
}

/* ---------- 💾 Jauge « Espace utilisé » ---------- */
function openStorage() {
  openPanel('Espace utilisé', el => {
    const size = (() => { try { return Math.round(((localStorage.getItem('mesOutilsEPS_v1') || '').length + (localStorage.getItem('chronos-eps-v1') || '').length) / 1024); } catch (e) { return 0; } })();
    el.innerHTML = `<div class="card"><div id="mem-g"></div><button class="btn btn-ghost btn-block" style="margin-top:12px" onclick="exportData()">💾 Exporter une sauvegarde</button></div>
      <p class="muted" style="margin:12px 4px;font-size:.82rem">Les photos (acrosport, gym, escalade, danse) et les vidéos sont rangées à part : elles ne remplissent pas l'espace des données et sont synchronisées comme avant (sauf les vidéos, qui restent sur la tablette qui les a filmées).</p>`;
    memGauge(el.querySelector('#mem-g'), size);
  });
}
async function memGauge(box, dataKo) {
  if (!box) return;
  const imgK = Object.keys(DB).filter(k => /^(acroImg_|gymImg_|escImg_|danseImg_)/.test(k) && DB[k]), imgKo = Math.round(imgK.reduce((a, k) => a + String(DB[k]).length, 0) / 1024);
  let tot = null; try { if (navigator.storage && navigator.storage.estimate) tot = await navigator.storage.estimate(); } catch (e) {}
  const pct = Math.min(100, Math.round(dataKo / 4800 * 100)), col = pct > 85 ? 'var(--danger,#D64545)' : pct > 60 ? '#E0892F' : 'var(--ok,#1B9E5A)';
  const mo = b => (b / 1048576).toFixed(b > 1048576 * 10 ? 0 : 1).replace('.', ',') + ' Mo';
  box.innerHTML = `<b>💾 Espace utilisé</b>
    <div style="margin-top:6px;font-size:.85rem">Données (classes, résultats, réglages…) : <b>${dataKo} Ko</b> sur ~5 Mo</div>
    <div style="height:12px;border-radius:99px;background:var(--line);overflow:hidden;margin-top:4px"><i style="display:block;height:100%;width:${Math.max(2, pct)}%;background:${col}"></i></div>
    <div class="muted" style="font-size:.78rem;margin-top:4px">${pct > 85 ? '⚠️ Presque plein : exportez puis faites du tri (anciennes séances, résultats).' : 'Rangées à part, sans cette limite :'}</div>
    <div style="font-size:.85rem;margin-top:4px">🖼️ Photos : <b>${imgK.length}</b> (${imgKo} Ko)${tot && tot.usage != null ? ` · 🎬 Vidéos et appli : <b>${mo(tot.usage)}</b>${tot.quota ? ` sur ${mo(tot.quota)} disponibles` : ''}` : ''}</div>`;
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
      download(`eps-one-sauvegarde-${DB.annee}.json`, JSON.stringify({ ...JSON.parse(JSON.stringify(DB)), exportDate: new Date().toISOString() }, null, 2), 'application/json');
      saved = true; $('#bks').textContent = '✔ Sauvegarde téléchargée'; };
    $('#go').onclick = () => {
      const ny = $('#ny').value.trim() || next;
      if (!saved && !confirm('Vous n\'avez pas téléchargé de sauvegarde. Continuer quand même ?')) return;
      if (!confirm(`Démarrer l'année ${ny} ?\nLes éléments cochés seront définitivement effacés de cet appareil.`)) return;
      if (opt('classes')) {
        if (!opt('keepNames') && window.epsClsDeleted) { (dbGet('classes') || []).forEach(c => epsClsDeleted('classes', c)); (DB.classesAll || []).forEach(c => epsClsDeleted('classesAll', c)); }
        (window.epsClsGuardOff || (f => f()))(() => dbSet('classes', opt('keepNames') ? (dbGet('classes') || []).map(c => ({ name: c.name, students: [], ...(c.prof ? { prof: c.prof } : {}), ...(c.unss ? { unss: 1 } : {}) })) : []));
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
      ${item('lock', 'navy', 'Code enseignant', (window.curPin ? curPin() : DB.profPin) ? 'Code défini · protège les réglages des outils' : 'Protéger les réglages des outils face aux élèves', 'openProfPin()')}
      ${item('team', 'grad', 'Équipe EPS · tablettes partagées', window.teamOn && teamOn() ? `Mode Équipe · ${teamProfs().length} enseignant(s)${activeProf() ? ' · ' + esc(activeProf().name) : ''}` : 'Plusieurs collègues sur le même lot de tablettes', 'openTeam()')}
      ${window.isEpsAdmin && window.isEpsAdmin() ? item('lock', 'gold', 'Accès des collègues', 'Valider ou retirer les accès à EPS ONE', 'openAccessAdmin()') : ''}
      ${item('save', 'navy', 'Espace utilisé', 'Données, photos et vidéos sur cette tablette', 'openStorage()')}
      ${item('restore', 'grad', 'Copies de secours', 'Une copie automatique par jour · récupérer des classes', 'openBackups()')}
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
window.openHowTo = to => openPanel('Comment ça marche ?', el => {
  const step = (n, t, d, btn) => `<div class="card" style="display:flex;gap:14px;align-items:flex-start;margin-top:12px">
      <div style="flex:0 0 38px;height:38px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;font-weight:900;font-size:1.1rem">${n}</div>
      <div style="flex:1;min-width:0"><b style="font-size:1.05rem">${t}</b><p class="muted" style="margin:4px 0 0;line-height:1.45">${d}</p>${btn || ''}</div></div>`;
  const b = (label, fn) => `<button class="btn btn-ghost" style="margin-top:10px" onclick="${fn}">${label}</button>`;
  el.innerHTML = `<p style="margin:0 0 4px;line-height:1.5">EPS ONE réunit vos outils de cours dans une seule app, <b>sans compte obligatoire</b> et <b>sans publicité</b>. En 6 étapes :</p>
    ${step(1, '📥 Importez ou créez vos classes', 'Fichier Pronote / ENT (CSV ou Excel) ou saisie à la main. Rangez-les en <b>classes EPS</b>, <b>UNSS / AS</b> ou <b>autres classes</b> (cross).', b('📥 Mes classes', "openImportClasses()"))}
    ${step(2, '🧰 Utilisez les outils', 'Chronos, matchs, cross, HYROX, acrosport, gym, demi-fond… Vos classes sont déjà dedans : choisissez la classe, les élèves et les groupes apparaissent.', b('Ouvrir les OUTILS →', "closeTool();go('outils')"))}
    ${step(3, '📶 Hors ligne ou en synchro entre tablettes', 'Sans réseau, tout fonctionne et reste sur l\'appareil. Avec la synchronisation (votre cloud ou un compte EPS ONE), chaque groupe peut avoir sa tablette et les résultats arrivent en direct sur la vôtre.', b('🔄 Synchronisation', "openSync()"))}
    <div id="howto-equipe">${step(4, '👥 Équipe EPS · tablettes partagées', 'Plusieurs collègues sur le <b>même lot de tablettes</b>, avec un seul compte pour l\'équipe (Dropbox conseillé). En début de cours, chacun touche <b>son nom</b> (« Qui fait cours ? ») et tape <b>son code</b> : il retrouve ses classes et ses favoris, sans se déconnecter. Un collègue seul dans son établissement n\'en a pas besoin.', b('👥 Régler l\'équipe', "openTeam()"))}</div>
    ${step(5, '🔒 Confiez les tablettes aux élèves', 'Créez votre <b>code enseignant</b> : les élèves utilisent les outils (chronos, coches, projets…) mais ne peuvent pas modifier vos réglages. Le bouton 🔒/🔓 en haut verrouille avant de passer la tablette.', b('🔒 Code enseignant', "openProfPin()"))}
    ${step(6, '📊 Retrouvez les résultats', 'Les résultats de chaque outil arrivent dans <b>Résultats des élèves</b> (individuel) et <b>Résultats collectifs</b> (groupes, tournois), exportables en CSV.', b('📊 Résultats des élèves', "openTool('resultats')"))}
    <p class="muted" style="margin:14px 2px 0;font-size:.85rem">🔗 Lien direct vers une étape à envoyer aux collègues : <b>…/eps-one/#equipe</b> (équipe) ou <b>…/eps-one/#aide</b> (cette page).</p>
    <p class="muted" style="margin:8px 2px 0;font-size:.85rem">Astuce : installez l'app sur l'écran d'accueil (Plus → Installer l'application) et ajoutez vos outils préférés en ☆ favoris.</p>`;
  if (to) setTimeout(() => { const x = el.querySelector('#howto-' + to); if (x) { x.scrollIntoView({ behavior: 'smooth', block: 'start' }); x.firstElementChild.style.boxShadow = '0 0 0 3px var(--blue,#1E5BD8)'; } }, 250);
});
