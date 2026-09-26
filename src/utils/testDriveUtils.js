import {
  TEST_DRIVE_STATUSES,
  DEFAULT_TEST_DRIVE_STATS,
  DATE_DISPLAY_STATUSES,
} from "../constants/testDriveOptions";
import { formatAppointmentDate } from "./dateUtils";

// ==========================================================
// CONFIGURATION D'UN STATUT
// ==========================================================

/**
 * Retourne la configuration d'un statut d'essai routier.
 */
export const getTestDriveStatusConfig = (status) => {
  return (
    TEST_DRIVE_STATUSES[status] ?? {
      label: "Inconnu",
      className: "badge bg-secondary",
      step: -1,
      progress: 0,
    }
  );
};

// ==========================================================
// LIBELLÉ D'UN STATUT
// ==========================================================

/**
 * Retourne le libellé d'un statut d'essai routier.
 */
export const getTestDriveStatusLabel = (status) => {
  return getTestDriveStatusConfig(status).label;
};

// ==========================================================
// COULEUR D'UN STATUT
// ==========================================================

/**
 * Retourne la classe Bootstrap correspondant au statut.
 */
export const getTestDriveStatusColor = (status) => {
  const className = getTestDriveStatusConfig(status).className;

  return className.replace("badge ", "").replace("text-dark", "").trim();
};

// ==========================================================
// CLASSE CSS D'UN STATUT
// ==========================================================

/**
 * Retourne la classe CSS Bootstrap correspondant au statut.
 */
export const getTestDriveStatusClassName = (status) => {
  return getTestDriveStatusConfig(status).className;
};

// ==========================================================
// STATISTIQUES PAR DÉFAUT
// ==========================================================

/**
 * Retourne les statistiques avec des valeurs par défaut.
 */
export const getTestDriveStats = (stats) => {
  return {
    ...DEFAULT_TEST_DRIVE_STATS,
    ...(stats ?? {}),
  };
};

// ==========================================================
// LIBELLÉ DE LA DATE DE RENDEZ-VOUS
// ==========================================================

/**
 * Retourne le libellé de la date du rendez-vous
 * selon le statut de l'essai routier.
 *
 * Les essais terminés, annulés ou refusés affichent
 * la date complète du rendez-vous.
 * Les autres utilisent un affichage relatif.
 */
export const getAppointmentLabel = (testDrive) => {
  if (DATE_DISPLAY_STATUSES.includes(testDrive.status)) {
    return new Date(testDrive.appointment_date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return formatAppointmentDate(testDrive.appointment_date);
};
