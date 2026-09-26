// =====================================================
// IMPORTS
// =====================================================
import { useEffect } from "react";
import { useCalendar } from "../../hooks/useCalendar";
import "../../styles/Calendar.css";

// =====================================================
// COMPOSANT CALENDRIER
// =====================================================

/**
 * Affiche le calendrier de disponibilité d'un véhicule.
 *
 * La logique de gestion des dates est centralisée
 * dans le hook useCalendar.
 */
export default function Calendar({
  vehicle,
  unavailableRanges = [],
  onDatesChange,
  onValidityChange,
}) {
  // ===================================================
  // HOOK CALENDRIER
  // ===================================================

  const {
    days,
    weekDays,
    monthLabel,

    previousMonth,
    nextMonth,
    isCurrentMonth,

    selectedDates,
    setHoverDate,

    handleSelectDate,

    isBlocked,
    isInRangePreview,
    isInSelectedRange,

    isFormValid,
  } = useCalendar(vehicle, unavailableRanges);

  // =====================================================
  // TRANSMISSION DES DONNÉES AU PARENT
  // =====================================================

  /**
   * Informe VehicleDetail des dates sélectionnées.
   */
  useEffect(() => {
    onDatesChange?.(selectedDates);
  }, [selectedDates, onDatesChange]);

  /**
   * Informe VehicleDetail de la validité
   * de la période sélectionnée.
   */
  useEffect(() => {
    onValidityChange?.(isFormValid);
  }, [isFormValid, onValidityChange]);
  // ===================================================
  // AFFICHAGE
  // ===================================================

  return (
    <div className="calendar">
      {/* ============================================= */}
      {/* NAVIGATION DU MOIS                            */}
      {/* ============================================= */}

      <div className="d-flex align-items-center justify-content-between mb-3">
        {/* Mois précédent */}
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={previousMonth}
          disabled={isCurrentMonth}
          aria-label="Mois précédent"
        >
          ←
        </button>

        {/* Mois affiché */}
        <h5 className="mb-0 text-capitalize">{monthLabel}</h5>

        {/* Mois suivant */}
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={nextMonth}
          aria-label="Mois suivant"
        >
          →
        </button>
      </div>

      {/* ============================================= */}
      {/* GRILLE DU CALENDRIER                          */}
      {/* ============================================= */}

      <div className="calendar-grid">
        {/* =========================================== */}
        {/* JOURS DE LA SEMAINE                         */}
        {/* =========================================== */}

        {weekDays.map((day, index) => (
          <div key={index} className="calendar-weekday">
            {day}
          </div>
        ))}

        {/* =========================================== */}
        {/* JOURS DU MOIS                              */}
        {/* =========================================== */}

        {days.map((date, index) => {
          // -------------------------------------------
          // CASE VIDE
          // -------------------------------------------

          /**
           * Les cases null correspondent aux espaces
           * nécessaires avant le premier jour du mois.
           */
          if (!date) {
            return (
              <div key={`empty-${index}`} className="calendar-day empty" />
            );
          }

          const selectedRange = isInSelectedRange(date);
          // -------------------------------------------
          // ÉTAT DE LA DATE
          // -------------------------------------------

          const blocked = isBlocked(date);

          const preview = isInRangePreview(date);

          // -------------------------------------------
          // JOUR DU CALENDRIER
          // -------------------------------------------

          return (
            <button
              key={date.toISOString()}
              type="button"

              // Une date bloquée ne peut pas être
              // sélectionnée.
              disabled={blocked}

              className={`
                calendar-day
                ${blocked ? "blocked" : ""}
                ${preview ? "preview" : ""}
                ${selectedRange ? "selected-range" : ""}
                ${
                  selectedDates.start &&
                  date.getTime() === selectedDates.start.getTime()
                    ? "selected"
                    : ""
                }
                ${
                  selectedDates.end &&
                  date.getTime() === selectedDates.end.getTime()
                    ? "selected"
                    : ""
                }
`}

              // Sélection de la date.
              onClick={() => handleSelectDate(date)}

              // Permet d'afficher l'aperçu de la
              // période lors du survol.
              onMouseEnter={() => setHoverDate(date)}

              onMouseLeave={() => setHoverDate(null)}

              aria-label={date.toLocaleDateString("fr-FR")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* ============================================= */}
      {/* PÉRIODE SÉLECTIONNÉE                          */}
      {/* ============================================= */}

      {selectedDates.start && selectedDates.end && (
        <div className="mt-3 text-center">
          <small className="text-muted">
            Du {selectedDates.start.toLocaleDateString("fr-FR")} au{" "}
            {selectedDates.end.toLocaleDateString("fr-FR")}
          </small>
        </div>
      )}
    </div>
  );
}
