/* =========================================================
   EPS ONE — Configuration Firebase (synchronisation)
   Collez ici l'objet firebaseConfig de votre projet :
   Console Firebase → ⚙️ Paramètres du projet → Vos applications → Web (</>)
   Tant que la valeur est null, la synchronisation est désactivée
   et l'app fonctionne normalement, en local.
   ========================================================= */
window.EPSONE_FIREBASE = {
  apiKey: "AIzaSyACkHY4bC4KqgogaR5BxPjHsj7moQRXuRo",
  authDomain: "eps-one.firebaseapp.com",
  projectId: "eps-one",
  storageBucket: "eps-one.firebasestorage.app",
  messagingSenderId: "917845842523",
  appId: "1:917845842523:web:1767cf964bfbc3b5ab7d7e"
};

/* Exemple (à remplacer par vos valeurs) :
window.EPSONE_FIREBASE = {
  apiKey: "AIza...",
  authDomain: "mon-projet.firebaseapp.com",
  projectId: "mon-projet",
  storageBucket: "mon-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
*/

/* Google Drive (stockage sur le propre Drive de chaque utilisateur) :
   ID client OAuth « Application Web » créé dans la console Google Cloud.
   Tant que la valeur est vide, l'option Google Drive n'apparaît pas. */
window.EPSONE_GDRIVE_CLIENT_ID = '917845842523-ju8i14ch33rdpbbj2tqcrd0lir40ftov.apps.googleusercontent.com';
