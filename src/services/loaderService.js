// ============================================================
// CALLBACK DU LOADER
// ============================================================
// Cette variable contient la fonction qui sera appelée
// lorsqu'une requête commence ou se termine.
//
// Elle sera généralement fournie par React afin de permettre
// à un composant d'afficher ou de masquer un loader global.
//
// Exemple :
// registerLoader(setLoading);
//
// Le callback pourra alors être appelé avec true ou false.
let loaderCallback = null;

// ============================================================
// ENREGISTREMENT DU CALLBACK
// ============================================================
// Permet d'enregistrer la fonction qui contrôlera le loader.
//
// Cette fonction est généralement appelée une seule fois,
// par exemple au démarrage de l'application.
//
// callback reçoit un booléen :
// - true  → afficher le loader
// - false → masquer le loader
export function registerLoader(callback) {
  loaderCallback = callback;
}

// ============================================================
// NOMBRE DE REQUÊTES EN COURS
// ============================================================
// Compteur global permettant de savoir combien de requêtes
// sont actuellement en cours.
//
// Pourquoi utiliser un compteur ?
//
// Parce que plusieurs requêtes peuvent être exécutées
// simultanément.
//
// Exemple :
//
// Requête A démarre → pendingRequests = 1
// Requête B démarre → pendingRequests = 2
// Requête A termine  → pendingRequests = 1
// Requête B termine  → pendingRequests = 0
//
// Le loader doit rester visible tant que le compteur est > 0.
let pendingRequests = 0;

// ============================================================
// START LOADING
// ============================================================
// À appeler lorsqu'une requête commence.
//
// Chaque nouvelle requête augmente le compteur.
//
// Exemple :
// startLoading();
// apiFetch(...);
export function startLoading() {
  // Une nouvelle requête est en cours.
  pendingRequests++;

  // Informe le composant qui gère le loader
  // qu'au moins une requête est active.
  //
  // L'opérateur ?. permet d'appeler le callback uniquement
  // s'il a été enregistré.
  //
  // pendingRequests > 0 renvoie toujours true ici.
  loaderCallback?.(pendingRequests > 0);
}

// ============================================================
// STOP LOADING
// ============================================================
// À appeler lorsqu'une requête se termine.
//
// Cette fonction doit normalement être appelée dans un
// "finally" afin d'être exécutée aussi bien en cas de succès
// qu'en cas d'erreur.
//
// Exemple :
//
// startLoading();
//
// try {
//   await apiFetch(...);
// } finally {
//   stopLoading();
// }
export function stopLoading() {
  // Une requête vient de se terminer.
  pendingRequests--;

  // Sécurité :
  // le compteur ne doit jamais être négatif.
  //
  // Cela peut arriver si stopLoading() est appelé plus de fois
  // que startLoading().
  if (pendingRequests < 0) {
    pendingRequests = 0;
  }

  // Met à jour l'état du loader.
  //
  // - true  → au moins une requête est encore en cours
  // - false → toutes les requêtes sont terminées
  loaderCallback?.(pendingRequests > 0);
}
