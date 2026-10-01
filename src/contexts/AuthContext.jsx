import { createContext, useContext, useState, useEffect } from "react";
import apiFetch from "../services/apiFetch";

// ============================================================
// CONTEXTE D'AUTHENTIFICATION
// ============================================================
// Le contexte permet de partager les informations d'authentification
// avec tous les composants React de l'application.
//
// Il contiendra notamment :
// - l'utilisateur connecté
// - les fonctions login / logout
// - l'état de chargement de l'authentification
// - les informations de redirection après connexion
const AuthContext = createContext();

// ============================================================
// AUTH PROVIDER
// ============================================================
// AuthProvider englobe l'application et fournit les données
// d'authentification à tous les composants enfants.
//
// Tous les composants situés dans <App /> pourront utiliser
// le hook useAuth().
export function AuthProvider({ children }) {
  // Utilisateur actuellement connecté.
  // null signifie qu'aucun utilisateur n'est authentifié.
  const [user, setUser] = useState(null);

  // Indique si l'application est encore en train de vérifier
  // l'état de l'authentification au démarrage.
  //
  // Cela permet notamment d'éviter d'afficher momentanément
  // une page non authentifiée avant d'avoir vérifié le token.
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // FETCH ME
  // ==========================================================
  // Récupère les informations de l'utilisateur actuellement
  // authentifié auprès du backend.
  //
  // Le token est normalement récupéré automatiquement par
  // apiFetch et envoyé dans la requête.
  const fetchMe = async () => {
    try {
      // Appel de l'endpoint permettant de récupérer
      // l'utilisateur actuellement connecté.
      const me = await apiFetch("/auth/me");

      // Stocke l'utilisateur dans le contexte.
      setUser(me);

      return me;
    } catch (err) {
      // Une erreur peut notamment signifier que le token
      // est invalide ou expiré.
      console.error("Auth error:", err);

      // L'utilisateur n'est donc plus considéré comme connecté.
      setUser(null);

      // Suppression du token devenu invalide.
      localStorage.removeItem("access_token");

      // On laisse l'appelant gérer l'erreur si nécessaire.
      throw err;
    }
  };

  // ==========================================================
  // INIT AUTH
  // ==========================================================
  // Ce useEffect est exécuté une seule fois au chargement
  // du AuthProvider.
  //
  // Son objectif est de restaurer la session utilisateur
  // lorsqu'un token existe déjà dans le navigateur.
  useEffect(() => {
    const init = async () => {
      // Vérifie si un token d'accès existe dans le navigateur.
      const token = localStorage.getItem("access_token");

      // Aucun token :
      // il n'y a pas de session à restaurer.
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Un token existe : on vérifie qu'il est toujours valide
        // en récupérant l'utilisateur connecté.
        await fetchMe();
      } catch (_) {
        // L'erreur est déjà traitée dans fetchMe().
        //
        // On ne fait donc rien ici.
      } finally {
        // Dans tous les cas, la vérification d'authentification
        // est terminée.
        setLoading(false);
      }
    };

    init();
  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================
  // Appelé après une authentification réussie.
  //
  // Le backend retourne généralement un access_token.
  // Celui-ci est sauvegardé afin de pouvoir authentifier
  // les prochaines requêtes API.
  const login = async (token) => {
    // Sauvegarde du token d'accès dans le navigateur.
    localStorage.setItem("access_token", token);

    // IMPORTANT :
    // Après avoir enregistré le token, on récupère les
    // informations complètes de l'utilisateur.
    //
    // Cela permet notamment de connaître son rôle :
    // admin, client, sales_agent, sav_agent, etc.
    await fetchMe();
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================
  // Déconnecte l'utilisateur.
  //
  // On prévient d'abord le backend afin qu'il puisse effectuer
  // les éventuelles opérations nécessaires côté serveur.
  const logout = async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      // Même si l'appel backend échoue, on poursuit la
      // déconnexion côté frontend.
      console.error("Erreur lors de la déconnexion", error);
    } finally {
      // Suppression du token local.
      localStorage.removeItem("access_token");

      // Suppression de l'utilisateur du contexte.
      //
      // L'application considère alors immédiatement
      // l'utilisateur comme déconnecté.
      setUser(null);
    }
  };

  // ==========================================================
  // UPDATE USER
  // ==========================================================
  // Permet de modifier localement certaines informations
  // de l'utilisateur sans devoir refaire immédiatement
  // une requête /auth/me.
  //
  // Exemple :
  // updateUser({ first_name: "Jean" })
  //
  // Les anciennes propriétés sont conservées grâce au spread
  // de l'utilisateur précédent.
  const updateUser = (newUser) => {
    setUser((prev) => ({
      ...prev,
      ...newUser,
    }));
  };

  // ==========================================================
  // POST LOGIN REDIRECT
  // ==========================================================
  // Permet de mémoriser une URL vers laquelle l'utilisateur
  // doit être redirigé après sa connexion.
  //
  // Exemple :
  // Un utilisateur essaie d'accéder à /applications.
  // Il est redirigé vers /login.
  // Après connexion, on peut le renvoyer vers /applications.
  const [postLoginRedirect, setPostLoginRedirect] = useState(null);

  // Supprime la redirection mémorisée après qu'elle
  // a été utilisée.
  const clearPostLoginRedirect = () => {
    setPostLoginRedirect(null);
  };

  // ==========================================================
  // CONTEXT PROVIDER
  // ==========================================================
  // Toutes les valeurs placées dans "value" seront accessibles
  // depuis les composants utilisant useAuth().
  return (
    <AuthContext.Provider
      value={{
        // Utilisateur connecté
        user,

        // Permet de modifier directement l'utilisateur
        setUser,

        // Authentification
        login,

        // Déconnexion
        logout,

        // Récupération de l'utilisateur connecté
        fetchMe,

        // État de chargement de l'authentification
        loading,

        // Mise à jour partielle de l'utilisateur
        updateUser,

        // ------------------------------------------------------
        // Redirection après connexion
        // ------------------------------------------------------
        postLoginRedirect,
        setPostLoginRedirect,
        clearPostLoginRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK useAuth
// ============================================================
// Ce hook simplifie l'utilisation du contexte d'authentification.
//
// Au lieu d'écrire :
// const context = useContext(AuthContext);
//
// Les composants peuvent simplement faire :
// const { user, isAdmin } = useAuth();
//
// Le hook ajoute également plusieurs informations pratiques
// permettant de vérifier le rôle de l'utilisateur.
export const useAuth = () => {
  // Récupération du contexte.
  const context = useContext(AuthContext);

  // ==========================================================
  // AUTHENTIFICATION
  // ==========================================================
  // Si user contient un objet, l'utilisateur est connecté.
  // Si user vaut null, l'utilisateur n'est pas connecté.
  const isAuthenticated = !!context.user;

  // ==========================================================
  // RÔLE ADMIN
  // ==========================================================
  const isAdmin = context.user?.role === "admin";

  // ==========================================================
  // RÔLE CLIENT
  // ==========================================================
  const isClient = context.user?.role === "client";

  // ==========================================================
  // RÔLE AGENT SAV
  // ==========================================================
  const isSavAgent = context.user?.role === "sav_agent";

  // ==========================================================
  // RÔLE AGENT COMMERCIAL
  // ==========================================================
  const isSalesAgent = context.user?.role === "sales_agent";

  // ==========================================================
  // EMPLOYÉ
  // ==========================================================
  // Un employé est ici considéré comme :
  //
  // - administrateur
  // - agent commercial
  // - agent SAV
  //
  // Cela permet ensuite de faire facilement des contrôles
  // comme :
  //
  // if (isEmployee) {
  //     ...
  // }
  const isEmployee = isSalesAgent || isSavAgent;

  // ==========================================================
  // RETOUR DU HOOK
  // ==========================================================
  // On retourne :
  //
  // 1. Toutes les valeurs et fonctions du contexte
  // 2. Les informations calculées sur l'authentification
  //    et les rôles.
  return {
    ...context,

    isAuthenticated,
    isAdmin,
    isClient,
    isSavAgent,
    isSalesAgent,
    isEmployee,
  };
};
