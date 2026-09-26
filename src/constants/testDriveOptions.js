// ==========================================================
// STATUTS DES ESSAIS
// ==========================================================

export const TEST_DRIVE_STATUSES = {
  pending: {
    label: "En attente",
    className: "badge bg-warning text-dark",
    step: 0,
    progress: 25,
  },

  confirmed: {
    label: "Confirmé",
    className: "badge bg-primary",
    step: 1,
    progress: 60,
  },

  rejected: {
    label: "Refusé",
    className: "badge bg-danger",
    step: -1,
    progress: 0,
  },

  cancelled: {
    label: "Annulé",
    className: "badge bg-danger",
    step: -1,
    progress: 0,
  },

  completed: {
    label: "Terminé",
    className: "badge bg-success",
    step: 2,
    progress: 100,
  },
};

// ==========================================================
// ACTIONS ADMIN AUTORISÉES SELON LE STATUT
// ==========================================================

export const TEST_DRIVE_ADMIN_ACTIONS = {
  pending: ["confirmed", "rejected"],
  confirmed: ["cancelled", "completed"],
  rejected: [],
  cancelled: [],
  completed: [],
};

// ==========================================================
// CONFIGURATION DES ACTIONS ADMIN
// ==========================================================

export const TEST_DRIVE_ADMIN_ACTION_CONFIG = {
  confirmed: {
    label: "Confirmer",
    icon: "bi-check-circle",
    buttonClass: "btn-success",
    message: "Essai routier confirmé avec succès",
  },

  rejected: {
    label: "Refuser",
    icon: "bi-x-circle",
    buttonClass: "btn-danger",
    message: "Essai routier refusé avec succès",
  },

  cancelled: {
    label: "Annuler",
    icon: "bi-calendar-x",
    buttonClass: "btn-warning",
    message: "Essai routier annulé avec succès",
  },

  completed: {
    label: "Terminer",
    icon: "bi-flag",
    buttonClass: "btn-primary",
    message: "Essai routier marqué comme terminé",
  },
};

// ==========================================================
// STATISTIQUES PAR DÉFAUT
// ==========================================================

export const DEFAULT_TEST_DRIVE_STATS = {
  pending: 0,
  confirmed: 0,
  completed: 0,
  cancelled: 0,
};

// ==========================================================
// ICÔNES DE LA TIMELINE
// ==========================================================

export const TEST_DRIVE_EVENT_ICONS = {
  test_drive_created: "bi-calendar-plus",
  test_drive_confirmed: "bi-check-circle-fill",
  test_drive_rejected: "bi-x-circle-fill",
  test_drive_cancelled: "bi-calendar-x-fill",
  test_drive_completed: "bi-flag-fill",
};

// ==========================================================
// ÉTAPES DE LA TIMELINE
// ==========================================================

export const TEST_DRIVE_STEPS = [
  {
    key: "pending",
    label: "Demandé",
    icon: "bi-send",
  },

  {
    key: "confirmed",
    label: "Confirmé",
    icon: "bi-check-circle",
  },

  {
    key: "completed",
    label: "Terminé",
    icon: "bi-flag",
  },
];

// ==========================================================
// STATUTS POUR L'AFFICHAGE DE LA DATE
// ==========================================================

export const DATE_DISPLAY_STATUSES = ["completed", "cancelled", "rejected"];

// ==========================================================
// ONGLETS
// ==========================================================

export const TEST_DRIVE_TABS = [
  {
    key: "all",
    label: "Tous",
    icon: "bi-grid",
  },

  {
    key: "pending",
    label: "En attente",
    icon: "bi-hourglass-split",
  },

  {
    key: "confirmed",
    label: "Confirmés",
    icon: "bi-check-circle",
  },

  {
    key: "completed",
    label: "Terminés",
    icon: "bi-flag",
  },

  {
    key: "cancelled",
    label: "Annulés",
    icon: "bi-x-circle",
  },
];

export const TEST_DRIVE_STAT_CARD_COLORS = {
  pending: "warning",
  confirmed: "primary",
  completed: "success",
  cancelled: "danger",
};

// ==========================================================
// CARTES STATISTIQUES
// ==========================================================

export const TEST_DRIVE_STAT_CARDS = [
  {
    key: "total",
    label: "Total",
    icon: "bi-calendar3",
    colorClass: "bg-primary-subtle text-primary",
  },
  {
    key: "pending",
    label: "En attente",
    icon: "bi-hourglass-split",
    colorClass: "bg-warning-subtle text-warning-emphasis",
  },
  {
    key: "confirmed",
    label: "Confirmés",
    icon: "bi-check-circle",
    colorClass: "bg-success-subtle text-success",
  },
  {
    key: "completed",
    label: "Terminés",
    icon: "bi-flag",
    colorClass: "bg-info-subtle text-info-emphasis",
  },
];
