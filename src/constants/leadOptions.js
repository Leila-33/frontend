/**
 * Configuration des statuts des leads.
 *
 * Cette configuration constitue la source de vérité
 * pour les libellés et la présentation des statuts
 * utilisés dans le pipeline commercial.
 */
export const LEAD_STATUSES = {
  NEW: {
    label: "Nouveau",
    columnLabel: "Nouveaux",
    className: "bg-secondary",
  },

  ASSIGNED: {
    label: "Assigné",
    columnLabel: "Assignés",
    className: "bg-primary",
  },

  CONTACTED: {
    label: "Contacté",
    columnLabel: "Contactés",
    className: "bg-info",
  },

  QUOTE_SENT: {
    label: "Offre envoyée",
    columnLabel: "Offres envoyées",
    className: "bg-warning text-dark",
  },

  WON: {
    label: "Gagné",
    columnLabel: "Ventes conclues",
    className: "bg-success",
  },

  LOST: {
    label: "Perdu",
    columnLabel: "Prospects perdus",
    className: "bg-danger",
  },
};