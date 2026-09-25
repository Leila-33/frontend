// ==========================================================
// CONFIGURATION DES RÔLES
// ==========================================================

export const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    color: "danger",
  },

  sales_agent: {
    label: "Commercial",
    color: "success",
  },

  sav_agent: {
    label: "Agent SAV",
    color: "primary",
  },

  client: {
    label: "Client",
    color: "secondary",
  },
};


// ==========================================================
// DASHBOARD PAR RÔLE
// ==========================================================

export const ROLE_DASHBOARD_PATHS = {
  admin: "/admin",
  sales_agent: "/sales",
  sav_agent: "/sav",
  client: "/dashboard",
};


// ==========================================================
// RÉCUPÉRER LE DASHBOARD D'UN UTILISATEUR
// ==========================================================

/**
 * Retourne le chemin du dashboard correspondant au rôle.
 *
 * Un dashboard client est utilisé comme valeur
 * par défaut lorsqu'aucun rôle correspondant n'est trouvé.
 */
export const getDashboardPath = (role) => {
  return ROLE_DASHBOARD_PATHS[role] ?? "/dashboard";
};


// ==========================================================
// RÉCUPÉRER LE LIBELLÉ D'UN RÔLE
// ==========================================================

/**
 * Retourne le libellé français associé à un rôle.
 */
export const getRoleLabel = (role) => {
  return ROLE_CONFIG[role]?.label ?? role ?? "-";
};


// ==========================================================
// RÉCUPÉRER LA COULEUR D'UN RÔLE
// ==========================================================

/**
 * Retourne la couleur Bootstrap associée à un rôle.
 */
export const getRoleColor = (role) => {
  return ROLE_CONFIG[role]?.color ?? "dark";
};