/**
 * Options disponibles pour les priorités des tickets SAV.
 *
 * Utilisées par les badges et les formulaires.
 */
export const TICKET_PRIORITIES = {
  LOW: {
    label: "Faible",
    color: "success",
  },

  MEDIUM: {
    label: "Normale",
    color: "warning",
  },

  HIGH: {
    label: "Haute",
    color: "danger",
  },

  URGENT: {
    label: "Urgente",
    color: "dark",
  },
};


/**
 * Options disponibles pour les catégories des tickets SAV.
 *
 * Utilisées par les badges et les formulaires.
 */
export const TICKET_CATEGORIES = {
  GENERAL: {
    label: "Général",
    color: "secondary",
  },

  FINANCING: {
    label: "Financement",
    color: "info",
  },

  DELIVERY: {
    label: "Livraison",
    color: "primary",
  },

  WARRANTY: {
    label: "Garantie",
    color: "success",
  },

  VEHICLE_ISSUE: {
    label: "Problème véhicule",
    color: "danger",
  },

  DOCUMENTS: {
    label: "Documents",
    color: "dark",
  },

  PAYMENT: {
    label: "Paiement",
    color: "warning",
  },

  OTHER: {
    label: "Autre",
    color: "secondary",
  },
};


/**
 * Options disponibles pour les statuts des tickets SAV.
 *
 * Utilisées par les badges et les composants permettant
 * de sélectionner ou d'afficher le statut d'un ticket.
 */
export const TICKET_STATUSES = {
  OPEN: {
    label: "Ouvert",
    color: "primary",
  },

  IN_PROGRESS: {
    label: "En cours",
    color: "warning",
  },

  WAITING_CUSTOMER: {
    label: "En attente client",
    color: "info",
  },

  RESOLVED: {
    label: "Résolu",
    color: "success",
  },

  CLOSED: {
    label: "Fermé",
    color: "secondary",
  },
};