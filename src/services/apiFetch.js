import { startLoading, stopLoading } from "./loaderService";
import refreshSession, {
  RefreshSessionError,
} from "./refreshSession";
import { API_URL } from "../config/api";
// ============================================================
// URL DE BASE DE L'API
// ============================================================
// Toutes les requêtes passées à apiFetch() seront préfixées
// par cette URL.
//
// Exemple :
//
// apiFetch("/auth/me")
//
// devient :
//
// http://localhost:8000/api/auth/me

// ============================================================
// ERREUR API PERSONNALISÉE
// ============================================================
// Cette classe permet de représenter les erreurs provenant
// de l'API avec davantage d'informations qu'une Error classique.
//
// Elle conserve notamment :
// - message → message de l'erreur
// - status  → code HTTP
// - data    → réponse complète du backend
export class ApiError extends Error {
  constructor(message, status, data) {
    // Error attend normalement une chaîne de caractères.
    //
    // Si message n'est pas une chaîne, on la transforme en JSON
    // afin d'éviter d'avoir un message invalide.
    super(typeof message === "string" ? message : JSON.stringify(message));

    // Permet d'identifier facilement le type d'erreur.
    this.name = "ApiError";

    // Code HTTP retourné par l'API.
    //
    // Exemple :
    // 400 → erreur client
    // 401 → non authentifié
    // 403 → interdit
    // 404 → ressource inexistante
    // 500 → erreur serveur
    this.status = status;

    // Réponse complète retournée par le backend.
    this.data = data;
  }
}

// ============================================================
// API FETCH
// ============================================================
// Fonction centrale utilisée pour effectuer les appels API.
//
// Elle permet de centraliser :
// - les headers
// - le token JWT
// - la conversion JSON
// - le refresh token
// - la gestion des erreurs
// - le loader global
async function apiFetch(url, options = {}) {
  // ==========================================================
  // OPTIONS DE LA REQUÊTE
  // ==========================================================
  // On récupère les options utiles et on donne une valeur
  // par défaut à method.
  //
  // Les autres options sont conservées dans "rest".
  const { method = "GET", body, headers = {}, ...rest } = options;

  // ==========================================================
  // APPEL HTTP INTERNE
  // ==========================================================
  // Cette fonction effectue réellement la requête HTTP.
  //
  // Elle reçoit le token à utiliser pour la requête.
  const callApi = async (token) => {
    // --------------------------------------------------------
    // CONSTRUCTION DES HEADERS
    // --------------------------------------------------------
    // Si le body est un FormData, on ne définit PAS
    // manuellement Content-Type.
    //
    // Le navigateur doit lui-même définir le Content-Type
    // avec le boundary nécessaire au multipart/form-data.
    //
    // Pour les autres objets, on utilise JSON.
    const finalHeaders = {
      ...(body instanceof FormData
        ? {}
        : {
            "Content-Type": "application/json",
          }),

      // Les headers fournis explicitement par l'appelant
      // peuvent remplacer les valeurs précédentes.
      ...headers,
    };

    // --------------------------------------------------------
    // TOKEN JWT
    // --------------------------------------------------------
    // Si un token existe, on ajoute l'en-tête Authorization.
    //
    // Le backend FastAPI pourra alors récupérer le token
    // grâce au schéma Bearer.
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }

    // --------------------------------------------------------
    // CONVERSION DU BODY
    // --------------------------------------------------------
    // Si le body est un objet JavaScript classique,
    // on le transforme en JSON.
    //
    // Exemple :
    //
    // {
    //   email: "test@test.com"
    // }
    //
    // devient :
    //
    // '{"email":"test@test.com"}'
    //
    // En revanche, FormData doit rester tel quel.
    const finalBody =
      body && typeof body === "object" && !(body instanceof FormData)
        ? JSON.stringify(body)
        : body;

    // --------------------------------------------------------
    // FETCH
    // --------------------------------------------------------
    // Effectue la requête HTTP vers le backend.
    return fetch(API_URL + url, {
      method,

      headers: finalHeaders,

      // GET ne doit pas envoyer de body.
      body: method === "GET" ? undefined : finalBody,

      // Permet notamment d'envoyer les cookies avec
      // les requêtes cross-origin.
      //
      // C'est important ici pour le refresh token
      // puisqu'il est stocké dans un cookie HttpOnly.
      credentials: "include",

      // Toutes les autres options fournies à apiFetch
      // sont transmises à fetch().
      ...rest,
    });
  };

  // ==========================================================
  // DÉMARRAGE DU LOADER
  // ==========================================================
  // Signale qu'une nouvelle requête API commence.
  //
  // loaderService augmente alors pendingRequests.
  //
  // Si c'est la première requête :
  //
  // pendingRequests = 1
  //
  // le loader devient visible.
  startLoading();

  try {
    // ========================================================
    // RÉCUPÉRATION DU TOKEN
    // ========================================================
    // Récupère le token actuellement enregistré dans
    // localStorage.
    let token = localStorage.getItem("access_token");

    // ========================================================
    // PREMIER APPEL API
    // ========================================================
    // On effectue la requête avec le token actuel.
    let res = await callApi(token);

// ========================================================
// REFRESH TOKEN
// ========================================================

// Si le backend retourne 401, on tente de renouveler
// la session à l'aide du cookie HttpOnly refresh_token.
//
// Le renouvellement est centralisé dans refreshSession.js,
// partagé avec le hook WebSocket.

const isAuthenticationRoute =
  url === "/auth/login" ||
  url === "/auth/refresh"||
  url === "/auth/logout";

if (res.status === 401 && token && !isAuthenticationRoute) {
  try {
    // ----------------------------------------------------
    // RENOUVELLEMENT PARTAGÉ
    // ----------------------------------------------------

    // apiFetch et useNotificationSocket utilisent la même
    // fonction et la même Promise de renouvellement.
    token = await refreshSession();

    // ----------------------------------------------------
    // REJOUER LA REQUÊTE INITIALE
    // ----------------------------------------------------

    // La première requête a échoué avec 401.
    // On la rejoue une seule fois avec le nouveau token.
    res = await callApi(token);

  } catch (err) {
    // ----------------------------------------------------
    // ÉCHEC DU RENOUVELLEMENT
    // ----------------------------------------------------

    if (err instanceof RefreshSessionError) {
      // Un refus définitif d'authentification est déjà
      // transmis au gestionnaire de déconnexion par
      // refreshSession.js.

      // Une erreur réseau ou un HTTP 500 ne doit pas être
      // transformé artificiellement en erreur 401.
      throw new ApiError(
        err.message,
        err.status,
        err.data
      );
    }

    // Préserve les autres erreurs sans les masquer.
    throw err;
  }
}

    // ========================================================
    // PARSE RESPONSE
    // ========================================================
    // Variable qui contiendra la réponse JSON du backend.
    let data = null;

    try {
      // Tentative de lecture de la réponse sous forme JSON.
      data = await res.json();
    } catch {
      // Certaines réponses HTTP peuvent ne pas contenir
      // de JSON.
      //
      // Dans ce cas, data reste null.
      data = null;
    }

    // ========================================================
    // GESTION DES ERREURS
    // ========================================================
    // res.ok vaut true pour les statuts HTTP 200-299.
    //
    // Si ce n'est pas le cas, on transforme la réponse
    // backend en ApiError.
    if (!res.ok) {
      // Message d'erreur par défaut.
      let message = "API_ERROR";

      // ------------------------------------------------------
      // FORMAT FASTAPI / VALIDATION
      // ------------------------------------------------------
      // Le backend peut retourner un tableau dans "detail".
      //
      // Exemple :
      //
      // {
      //   "detail": [
      //     {
      //       "message": "Email invalide"
      //     }
      //   ]
      // }
      //
      // On récupère ici le message de la première erreur.
      if (Array.isArray(data?.detail)) {
        message = data.detail[0]?.message || "VALIDATION_ERROR";
      }

      // ------------------------------------------------------
      // DETAIL SOUS FORME DE CHAÎNE
      // ------------------------------------------------------
      // Exemple :
      //
      // {
      //   "detail": "Utilisateur introuvable"
      // }
      else if (typeof data?.detail === "string") {
        message = data.detail;
      }

      // ------------------------------------------------------
      // FORMAT AVEC MESSAGE
      // ------------------------------------------------------
      // Permet également de gérer une réponse comme :
      //
      // {
      //   "message": "Une erreur est survenue"
      // }
      else if (data?.message) {
        message = data.message;
      }

      // Transformation en erreur personnalisée.
      throw new ApiError(message, res.status, data);
    }

    // ========================================================
    // SUCCÈS
    // ========================================================
    // Si la réponse HTTP est correcte, on retourne les
    // données au composant qui a appelé apiFetch().
    return data;
  } catch (err) {
    // ========================================================
    // ERREUR RÉSEAU
    // ========================================================
    // Une erreur réseau n'a généralement pas de propriété
    // "status".
    //
    // Exemple :
    // - backend arrêté
    // - problème réseau
    // - serveur inaccessible
    //
    // On transforme donc l'erreur native en ApiError
    // avec un status à 0.
    if (!err.status) {
      throw new ApiError("Erreur réseau (serveur inaccessible)", 0, null);
    }

    // ========================================================
    // AUTRES ERREURS
    // ========================================================
    // Si l'erreur possède déjà un status, elle est probablement
    // une ApiError.
    //
    // On la transmet telle quelle.
    throw err;
  } finally {
    // ========================================================
    // ARRÊT DU LOADER
    // ========================================================
    // Le finally est exécuté dans tous les cas :
    //
    // - requête réussie
    // - erreur HTTP
    // - erreur réseau
    // - refresh réussi
    // - refresh échoué
    //
    // On signale donc que cette requête est terminée.
    stopLoading();
  }
}

// ============================================================
// EXPORT
// ============================================================
// apiFetch devient la fonction utilisée par le reste
// de l'application pour effectuer les appels API.
export default apiFetch;
