// ==========================================================
// ACTIONS ADMIN AUTORISÉES SELON LE STATUT
// ==========================================================

export const TEST_DRIVE_ADMIN_ACTIONS = {
  pending: [
    "confirmed",
    "rejected"
  ],

  confirmed: [
    "cancelled",
    "completed"
  ],

  rejected: [],
  cancelled: [],
  completed: []
};


// ==========================================================
// CONFIGURATION DES ACTIONS ADMIN
// ==========================================================

export const TEST_DRIVE_ADMIN_ACTION_CONFIG = {

  confirmed: {
    label: "Confirmer",
    icon: "bi bi-check-circle",
    buttonClass: "btn-success"
  },

  rejected: {
    label: "Refuser",
    icon: "bi bi-x-circle",
    buttonClass: "btn-danger"
  },

  cancelled: {
    label: "Annuler",
    icon: "bi bi-calendar-x",
    buttonClass: "btn-warning"
  },

  completed: {
    label: "Terminer",
    icon: "bi bi-flag",
    buttonClass: "btn-primary"
  }

};



// ==========================================================
// MESSAGES APRÈS MODIFICATION DU STATUT
// ==========================================================

export const TEST_DRIVE_ACTION_MESSAGES = {

  confirmed:
    "Essai routier confirmé avec succès",

  rejected:
    "Essai routier refusé avec succès",

  cancelled:
    "Essai routier annulé avec succès",

  completed:
    "Essai routier marqué comme terminé"

};


// ==========================================================
// CONFIGURATION DES STATISTIQUES
// ==========================================================

export const DEFAULT_TEST_DRIVE_STATS = {
  pending: 0,
  confirmed: 0,
  completed: 0,
  cancelled: 0
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
// ==========================================================
// ICÔNES DE LA TIMELINE
// ==========================================================
export const TEST_DRIVE_EVENT_ICONS = {
  TEST_DRIVE_CREATED: "bi bi-calendar-plus",
  TEST_DRIVE_CONFIRMED: "bi bi-check-circle-fill",
  TEST_DRIVE_REJECTED: "bi bi-x-circle-fill",
  TEST_DRIVE_CANCELLED: "bi bi-calendar-x-fill",
  TEST_DRIVE_COMPLETED: "bi bi-flag-fill",
};

export const TEST_DRIVE_STEPS = [
  {
    key: "pending",
    label: "Demandé",
    icon: "bi bi-send"
  },
  {
    key: "confirmed",
    label: "Confirmé",
    icon: "bi bi-check-circle"
  },
  {
    key: "completed",
    label: "Terminé",
    icon: "bi bi-flag"
  }
];

export const DATE_DISPLAY_STATUSES = [
  "completed",
  "cancelled",
  "rejected"
];

export const TABS = [
  {
    key: "all",
    label: "Tous",
    icon: "bi bi-grid"
  },
  {
    key: "pending",
    label: "En attente",
    icon: "bi bi-hourglass-split"
  },
  {
    key: "confirmed",
    label: "Confirmés",
    icon: "bi bi-check-circle"
  },
  {
    key: "completed",
    label: "Terminés",
    icon: "bi bi-flag"
  },
  {
    key: "cancelled",
    label: "Annulés",
    icon: "bi bi-x-circle"
  }
];