export const STATUS = {

  draft: {
    label: "Brouillon",
    color: "secondary"
  },

  submitted: {
    label: "Soumis",
    color: "warning"
  },

  processing: {
    label: "Pris en charge",
    color: "primary"
  },

  approved: {
    label: "Validé",
    color: "success"
  },

  rejected: {
    label: "Refusé",
    color: "danger"
  },

  paid: {
    label: "Payé",
    color: "info"
  },

  completed: {
    label: "Terminé",
    color: "success"
  },

  cancelled: {
    label: "Annulé",
    color: "dark"
  },

  archived: {
    label: "Archivé",
    color: "dark"
  }

};
// Configuration des différents statuts de document.
// =========================
// CONSTANTES
// =========================

export const REQUIRED_DOCUMENT_TYPES = [
  "identity",
  "address_proof",
  "payslip",
  "rib"
];

export const DOCUMENT_STATUS = {
  missing: {
    label: "Manquant",
    description: "Document requis",
    color: "secondary",
    icon: "bi-file-earmark"
  },

  pending: {
    label: "En attente",
    description: "En attente de validation",
    color: "warning",
    icon: "bi-hourglass-split"
  },

  validated: {
    label: "Validé",
    description: "Document validé",
    color: "success",
    icon: "bi-check-lg"
  },

  rejected: {
    label: "Refusé",
    description: "Document refusé",
    color: "danger",
    icon: "bi-x-lg"
  }
};

// Libellés des différents types de documents utilisés dans l'application.
export const DOCUMENT_LABELS = {
  identity: "Pièce d'identité",
  address_proof: "Justificatif de domicile",
  payslip: "Bulletin de salaire",
  rib: "RIB",
};

export const EVENT_ICONS = {
  application_created: "bi-plus-circle",
  application_submitted: "bi-send",
  application_approved: "bi-check-circle",
  application_rejected: "bi-x-circle",
  application_archived: "bi-archive",
  application_restored: "bi-arrow-counterclockwise",
  document_validated: "bi-file-check",
  document_rejected: "bi-file-x"
};

export const DEFAULT_STATUS = {
  label: "Inconnu",
  color: "secondary",
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