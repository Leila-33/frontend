// ==========================================================
// FORMATER UNE DATE
// ==========================================================

/**
 * Formate une date pour l'affichage.
 *
 * Format : DD/MM/YYYY
 */
export const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ==========================================================
// FORMATER UNE DATE AVEC DATE + HEURE
// ==========================================================

/**
 * Formate une date avec l'heure.
 *
 * Format : DD/MM/YYYY HH:MM
 */
export const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

// ==========================================================
// FORMATER UNIQUEMENT L'HEURE
// ==========================================================

/**
 * Formate uniquement l'heure.
 *
 * Format : HH:MM
 */
export const formatTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ==========================================================
// FORMATER UNE DATE POUR L'API
// ==========================================================

/**
 * Formate une date pour l'API.
 *
 * Format : YYYY-MM-DD
 */
export const formatDateForApi = (value) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-CA").format(date);
};

// ==========================================================
// FORMATER UNE DATE RELATIVE POUR UN RENDEZ-VOUS
// ==========================================================

/**
 * Formate une date de rendez-vous relativement à aujourd'hui.
 *
 * Exemples :
 * - Aujourd'hui à 14:30
 * - Demain
 * - Hier
 * - Dans 3 jours
 * - Il y a 2 jours
 */
export const formatAppointmentDate = (dateString) => {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const today = new Date();

  // Compare uniquement les dates,
  // sans tenir compte de l'heure.
  const appointmentDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const currentDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diffDays = Math.round(
    (appointmentDay - currentDay) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return `Aujourd'hui à ${formatTime(date)}`;
  }

  if (diffDays === 1) {
    return "Demain";
  }

  if (diffDays === -1) {
    return "Hier";
  }

  if (diffDays > 1) {
    return `Dans ${diffDays} jours`;
  }

  return `Il y a ${Math.abs(diffDays)} jours`;
};

// ==========================================================
// SAVOIR SI UNE DATE CORRESPOND À AUJOURD'HUI
// ==========================================================

/**
 * Vérifie si une date correspond à aujourd'hui.
 */
export const isToday = (value) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// ==========================================================
// FORMATER UNE DATE POUR UN GRAPHIQUE
// ==========================================================

/**
 * Formate une date destinée à être affichée sur un graphique.
 *
 * La date est attendue au format YYYY-MM-DD.
 *
 * Format retourné : DD/MM
 *
 * Exemple :
 * "2026-09-24" → "24/09"
 */
export const formatChartDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
};

// ==========================================================
// FORMATER UN MOIS POUR UN GRAPHIQUE
// ==========================================================

/**
 * Formate un mois destiné à être affiché sur un graphique.
 *
 * Le mois est attendu au format YYYY-MM.
 *
 * Format retourné : mois abrégé + année.
 *
 * Exemple :
 * "2026-09" → "sept. 2026"
 */
export const formatMonth = (value) => {
  if (!value) {
    return "";
  }

  const [year, monthNumber] = value.split("-");

  const date = new Date(Number(year), Number(monthNumber) - 1, 1);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });
};
