// ==========================================================
// CARTES STATISTIQUES DU DASHBOARD
// ==========================================================

export const ADMIN_DASHBOARD_STAT_CARDS = [
  {
    key: "totalApplications",
    title: "Total dossiers",
    icon: "bi-folder",
    color: "primary",
  },
  {
    key: "pending",
    title: "En attente",
    icon: "bi-clock",
    color: "warning",
  },
  {
    key: "active",
    title: "Actifs",
    icon: "bi-check-circle",
    color: "success",
  },
  {
    key: "rejected",
    title: "Refusés",
    icon: "bi-x-circle",
    color: "danger",
  },
  {
    key: "archived",
    title: "Archivés",
    icon: "bi-archive",
    color: "secondary",
  },
  {
    key: "thisWeek",
    title: "Cette semaine",
    icon: "bi-graph-up",
    color: "info",
  },
];


// ==========================================================
// ACTIONS RAPIDES
// ==========================================================

export const ADMIN_DASHBOARD_QUICK_ACTIONS = [
  {
    label: "Gérer les dossiers",
    path: "/admin/applications",
    icon: "bi-folder",
    buttonClass: "btn-primary",
  },
  {
    label: "Gérer les véhicules",
    path: "/admin/vehicles",
    icon: "bi-car-front",
    buttonClass: "btn-outline-primary",
  },
  {
    label: "Gérer les options",
    path: "/admin/options",
    icon: "bi-list-check",
    buttonClass: "btn-outline-secondary",
  },
];


// ==========================================================
// CARTES STATISTIQUES DU DASHBOARD UTILISATEUR
// ==========================================================

// ==========================================================
// CARTES STATISTIQUES DU DASHBOARD UTILISATEUR
// ==========================================================

export const USER_DASHBOARD_STAT_CARDS = [
  {
    key: "total_applications",
    title: "TOTAL DOSSIERS",
    icon: "bi-folder-fill",
    color: "secondary",
    description: "Tous vos dossiers",
  },
  {
    key: "active_applications",
    title: "DOSSIERS ACTIFS",
    icon: "bi-folder2-open",
    color: "dark",
    description: "Dossiers en cours",
  },
  {
    key: "pending_applications",
    title: "EN ATTENTE",
    icon: "bi-hourglass-split",
    color: "warning",
    description: "En attente de traitement",
  },
  {
    key: "approved_applications",
    title: "DOSSIERS APPROUVÉS",
    icon: "bi-check2-circle",
    color: "success",
    description: "Dossiers approuvés",
    descriptionColor: "success",
  },
];