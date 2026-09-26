import {
  EVENT_CATEGORIES,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_CONFIG,
  DEFAULT_EVENT_TYPE_CONFIG,
} from "../constants/eventOptions";

/**
 * Retourne le label lisible d'un événement.
 */
export const getEventTypeLabel = (type) => {
  return EVENT_TYPE_LABELS[type] ?? type?.replaceAll("_", " ") ?? "Événement";
};

/**
 * Détermine la catégorie d'un événement
 * à partir de son type technique.
 */
export const getEventCategory = (type) => {
  if (!type) {
    return null;
  }

  // Certaines catégories ne correspondent
  // pas directement au premier segment du type.
  if (type.startsWith("deposit")) {
    return "payment";
  }

  if (type.startsWith("support_ticket_")) {
    return "support_ticket";
  }

  if (type.startsWith("test_drive_")) {
    return "test_drive";
  }

  if (type.startsWith("final_check_")) {
    return "final_check";
  }

  if (type.startsWith("reconditioning_")) {
    return "reconditioning";
  }

  return type.split("_")[0];
};

/**
 * Retourne la configuration de la catégorie
 * associée à un événement.
 */
export const getEventCategoryConfig = (type) => {
  const category = getEventCategory(type);

  return (
    EVENT_CATEGORIES[category] ?? {
      label: "Autre",
      color: "secondary",
    }
  );
};

/**
 * Retourne la couleur Bootstrap d'un événement.
 */
export const getEventTypeColor = (type) => {
  return getEventCategoryConfig(type).color;
};

/**
 * Retourne le label de la catégorie d'un événement.
 */
export const getEventCategoryLabel = (type) => {
  return getEventCategoryConfig(type).label;
};

// ==========================================================
// ICÔNE D'UN ÉVÉNEMENT
// ==========================================================

/**
 * Retourne l'icône Bootstrap correspondant au type
 * d'événement.
 */
export const getEventIcon = (type) => {
  return EVENT_TYPE_CONFIG[type]?.icon ?? DEFAULT_EVENT_TYPE_CONFIG.icon;
};
