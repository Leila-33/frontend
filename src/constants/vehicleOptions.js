export const ENGINE_TYPES = {
  diesel: "Diesel",
  petrol: "Essence",
  electric: "Électrique",
  hybrid: "Hybride",
};

/**
 * Types de véhicules proposés par l'application.
 *
 * Chaque type centralise :
 * - le libellé affiché ;
 * - la couleur Bootstrap associée.
 */
export const VEHICLE_TYPES = {
  sale: {
    label: "Vente",
    color: "primary",
  },

  rent: {
    label: "Location",
    color: "info",
  },
};

// ==========================================================
// ÉTAT DU VÉHICULE REPRIS
// ==========================================================

export const TRADE_IN_CONDITIONS = {
  excellent: "Excellent",
  good: "Bon",
  average: "Moyen",
  poor: "Mauvais",
};