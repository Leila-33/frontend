/**
 * Statuts possibles d'un dossier.
 *
 * Chaque statut centralise :
 * - le libellé affiché ;
 * - la couleur Bootstrap utilisée dans l'interface.
 */
export const APPLICATION_STATUSES = {
  draft: {
    label: "Brouillon",
    color: "secondary",
  },

  submitted: {
    label: "Soumis",
    color: "warning",
  },

  processing: {
    label: "Pris en charge",
    color: "primary",
  },

  approved: {
    label: "Validé",
    color: "success",
  },

  rejected: {
    label: "Refusé",
    color: "danger",
  },

  paid: {
    label: "Payé",
    color: "info",
  },

  completed: {
    label: "Terminé",
    color: "success",
  },

  cancelled: {
    label: "Annulé",
    color: "dark",
  },

  archived: {
    label: "Archivé",
    color: "dark",
  },
};

export const DEFAULT_STATUS = {
  label: "Inconnu",
  color: "secondary",
};

// ==========================================================
// CONFIGURATION DES MODALES D'ACTIONS
// ==========================================================

export const APPLICATION_ACTION_MODAL_CONFIG = {
  process: {
    title: "Prendre en charge le dossier",
    description:
      "Le dossier sera marqué comme pris en charge.",
  },

  delete: {
    title: "Supprimer le dossier",
    description:
      "Cette action est irréversible.",
  },

  archive: {
    title: "Archiver le dossier",
    description:
      "Le dossier sera masqué mais conservé.",
  },

  restore_cancelled: {
    title: "Restaurer le dossier annulé",
    description:
      "Le dossier annulé sera réactivé dans le workflow.",
  },

  restore: {
    title: "Restaurer le dossier",
    description:
      "Le dossier sera restauré.",
  },

  cancel: {
    title: "Annuler le dossier",
    description:
      "Le dossier sera marqué comme annulé.",
  },
};