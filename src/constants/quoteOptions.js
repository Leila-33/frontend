/**
 * Configuration des statuts des offres commerciales.
 *
 * Cette configuration constitue la source de vérité
 * pour :
 * - les libellés des statuts ;
 * - les couleurs des badges ;
 * - les titres utilisés dans les listes et tableaux ;
 * - l'affichage des offres dans l'interface commerciale.
 */
export const QUOTE_STATUSES = {
  DRAFT: {
    label: "Brouillon",
    agentLabel: "Brouillon",
    clientLabel: "Brouillon",
    className: "bg-secondary",
  },

  SENT: {
    title: "Offres en attente de réponse",
    label: "En attente de réponse",
    agentLabel: "En attente de la réponse du client",
    clientLabel: "En attente de votre réponse",
    className: "bg-primary",
  },

  ACCEPTED: {
    title: "Offres acceptées",
    label: "Acceptée",
    agentLabel: "Offre acceptée",
    clientLabel: "Offre acceptée",
    className: "bg-success",
  },

  REJECTED: {
    title: "Offres refusées",
    label: "Refusée",
    agentLabel: "Offre refusée",
    clientLabel: "Offre refusée",
    className: "bg-danger",
  },

  EXPIRED: {
    title: "Offres expirées",
    label: "Expirée",
    agentLabel: "Offre expirée",
    clientLabel: "Offre expirée",
    className: "bg-secondary",
  },
};

export const QUOTE_REFUSAL_REASONS = {
  PRICE: "Prix trop élevé",
  MONTHLY_PAYMENT: "Mensualité trop élevée",
  FINANCING: "Conditions de financement",
  VEHICLE: "Le véhicule ne correspond plus",
  PURCHASE_ELSEWHERE: "J'ai acheté ailleurs",
  OTHER: "Autre",
};
