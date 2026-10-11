import { API_URL } from "../config/api";

// ============================================================
// ÉTAT PARTAGÉ DU RENOUVELLEMENT
// ============================================================
// Cette variable permet de partager une seule requête de
// refresh entre plusieurs appels API simultanés.
//
// Exemple :
//
// Requête A → 401
// Requête B → 401
// Requête C → 401
//
// Au lieu d'envoyer 3 requêtes /auth/refresh,
// une seule requête de refresh sera créée.
//
// Les autres requêtes attendront la même Promise.

// Une seule requête de refresh peut être exécutée à la fois,
// même si apiFetch et le WebSocket la demandent simultanément.
let refreshPromise = null;

// Callback enregistré par le contexte d'authentification.
// Il permet de déclencher logout() sans importer useAuth ici.
let authenticationFailureHandler = null;

/**
 * Enregistre le mécanisme de déconnexion de l'application.
 *
 * À appeler depuis AuthContext, dans un effet React.
 */
export function setAuthenticationFailureHandler(handler) {
  authenticationFailureHandler = handler;
}

/**
 * Erreur spécifique au renouvellement de session.
 */
export class RefreshSessionError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "RefreshSessionError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Renouvelle la session à l'aide du cookie HttpOnly.
 *
 * Retourne le nouvel access_token.
 *
 * Une erreur 401/403 indique que le refresh token
 * est refusé ou que la session n'est plus valide.
 *
 * Une erreur réseau ou serveur temporaire ne doit pas
 * automatiquement déconnecter l'utilisateur.
 */
async function performRefresh() {
  let response;

  try {
    response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    throw new RefreshSessionError(
      "Serveur inaccessible pendant le renouvellement.",
      0
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    // La réponse peut ne pas contenir de JSON valide.
  }

  if (!response.ok) {
    const error = new RefreshSessionError(
      "Impossible de renouveler la session.",
      response.status,
      data
    );

    // Déconnexion uniquement lorsque le backend refuse
    // définitivement les informations d'authentification.
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      try {
        await authenticationFailureHandler?.();
      } catch (logoutError) {
        console.error(
          "Erreur lors de la déconnexion :",
          logoutError
        );
      }
    }

    throw error;
  }

  if (
    typeof data?.access_token !== "string" ||
    !data.access_token
  ) {
    // Une réponse incorrecte n'est pas assimilée à un
    // refus d'authentification : il peut s'agir d'une
    // erreur de contrat API.
    throw new RefreshSessionError(
      "Réponse de renouvellement invalide.",
      0,
      data
    );
  }

  // Conserve la compatibilité avec apiFetch, qui utilise
  // actuellement l'access token dans Authorization.
  localStorage.setItem("access_token", data.access_token);

  return data.access_token;
}

/**
 * Fonction publique de renouvellement.
 *
 * Tous les appels simultanés attendent la même Promise.
 */
export default function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}