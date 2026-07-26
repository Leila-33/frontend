// utils/status.js

export const STATUS = {
  draft: { label: "Brouillon", color: "secondary" },
  submitted: { label: "Soumis", color: "warning" },
  approved: { label: "Validé", color: "success" },
  rejected: { label: "Refusé", color: "danger" },
  paid: { label: "Payé", color: "info" },
  completed: { label: "Terminé", color: "primary" },
  cancelled: { label: "Annulé", color: "dark" },
  archived: { label: "Archivé", color: "dark" }
};

export const VEHICLE_TYPE = {
  sale: { label: "Vente", color: "primary" },
  rent: { label: "Location", color: "info" }
};

export const INSPECTION_UI = {
  PENDING: { label: "En file", color: "info", icon: "bi-clock" },
  IN_PROGRESS: { label: "En cours", color: "warning", icon: "bi-gear" },
  COMPLETED: { label: "Terminé", color: "success", icon: "bi-check-circle" },
  FAILED: { label: "Échec", color: "danger", icon: "bi-x-circle" }
};


export const leadStatusConfig = {

  NEW: {
    label: "Nouveau",
    className: "bg-secondary",
  },

  ASSIGNED: {
    label: "Assigné",
    className: "bg-primary",
  },

  CONTACTED: {
    label: "Contacté",
    className: "bg-info",
  },

  QUOTE_SENT: {
    label: "Offre envoyée",
    className: "bg-warning text-dark",
  },

  WON: {
    label: "Gagné",
    className: "bg-success",
  },

  LOST: {
    label: "Perdu",
    className: "bg-danger",
  },

};

export const quoteStatusConfig = {

  DRAFT: {
    label: "Brouillon",
    className: "bg-secondary",
  },

  SENT: {
    title: "Offres en attente de votre réponse",
    label: "En attente de votre réponse",
    className: "bg-primary",
  },

  ACCEPTED: {
    title: "Offres acceptées",
    label: "Offre acceptée",
    className: "bg-success",
  },

  REJECTED: {
    title: "Offres refusées",
    label: "Offre refusée",
    className: "bg-danger",
  },

  EXPIRED: {
    title: "Offres expirées",
    label: "Offre expirée",
    className: "bg-secondary",
  },

};

export const testDriveStatusConfig = {
  pending: {
    label: "En attente",
    className: "badge bg-warning text-dark",
    step: 0,
    progress: 25
  },
  confirmed: {
    label: "Confirmé",
    className: "badge bg-primary",
    step: 1,
    progress: 60
  },
  rejected: {
    label: "Refusé",
    className: "badge bg-danger",
    step: -1,
    progress: 0
  },
  cancelled: {
    label: "Annulé",
    className: "badge bg-danger",
    step: -1,
    progress: 0
  },
  completed: {
    label: "Terminé",
    className: "badge bg-success",
    step: 2,
    progress: 100
  }
};