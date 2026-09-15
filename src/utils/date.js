// ==========================================================
// FORMATER UNE DATE AVEC DATE + HEURE
// ==========================================================

export const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString(
    "fr-FR",
    {
      dateStyle: "short",
      timeStyle: "short"
    }
  );
};


// ==========================================================
// FORMATER UNE DATE RELATIVE POUR UN RENDEZ-VOUS
// ==========================================================

export const formatAppointmentDate = (dateString) => {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);
  const today = new Date();

  // On compare uniquement les dates,
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
    (appointmentDay - currentDay) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return `Aujourd'hui à ${date.toLocaleTimeString(
      "fr-FR",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    )}`;
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

export const isToday = (date) => {
  if (!date) {
    return false;
  }

  const value = new Date(date);
  const today = new Date();

  return (
    value.getDate() === today.getDate() &&
    value.getMonth() === today.getMonth() &&
    value.getFullYear() === today.getFullYear()
  );
};