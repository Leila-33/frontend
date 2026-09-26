import { useCallback, useMemo, useState } from "react";

/**
 * Hook permettant de gérer un calendrier de réservation
 * pour un véhicule.
 *
 * Il gère notamment :
 * - les dates sélectionnées ;
 * - les dates indisponibles ;
 * - les dates passées ;
 * - la prévisualisation d'une période ;
 * - la validation d'une période ;
 * - la navigation entre les mois.
 *
 * @param {Object} vehicle
 * @param {Array} unavailableRanges
 */
export function useCalendar(vehicle, unavailableRanges = []) {
  // =====================================================
  // DATE ACTUELLE
  // =====================================================

  /**
   * Date actuelle utilisée ailleurs dans le hook.
   */
  const today = new Date();

  /**
   * Date actuelle sans l'heure.
   */
  const todayStart = useMemo(() => {
    const currentDate = new Date();

    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
  }, []);

  // =====================================================
  // MOIS ACTUELLEMENT AFFICHÉ
  // =====================================================

  // Le calendrier est initialisé sur le mois actuel.
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // =====================================================
  // DATES SÉLECTIONNÉES
  // =====================================================

  // Stockage de la date de début et de la date de fin
  // de la période sélectionnée.
  const [selectedDates, setSelectedDates] = useState({
    start: null,
    end: null,
  });

  // Date actuellement survolée par la souris.
  // Elle permet d'afficher une prévisualisation
  // de la période avant la deuxième sélection.
  const [hoverDate, setHoverDate] = useState(null);

  // =====================================================
  // OUTIL DE NORMALISATION DES DATES
  // =====================================================

  /**
   * Supprime l'heure, les minutes et les secondes
   * d'une date afin de comparer uniquement le jour.
   */
  const normalizeDate = (date) => {
    const normalized = new Date(date);

    return new Date(
      normalized.getFullYear(),
      normalized.getMonth(),
      normalized.getDate()
    );
  };

  // =====================================================
  // VÉRIFICATION DES DATES BLOQUÉES
  // =====================================================

  /**
   * Vérifie si une date ne peut pas être sélectionnée.
   *
   * Une date est bloquée si :
   * - elle est antérieure à aujourd'hui ;
   * - elle se trouve dans une période déjà réservée.
   */
  const isBlocked = useCallback(
    (date) => {
      const currentDate = normalizeDate(date);

      // Les dates passées ne sont pas disponibles.
      if (currentDate < todayStart) {
        return true;
      }

      // Vérification des périodes d'indisponibilité
      // fournies par le backend.
      return unavailableRanges.some((range) => {
        const rangeStart = normalizeDate(range.start);
        const rangeEnd = normalizeDate(range.end);

        return currentDate >= rangeStart && currentDate <= rangeEnd;
      });
    },
    [unavailableRanges, todayStart]
  );
  // =====================================================
  // SÉLECTION D'UNE DATE
  // =====================================================

  /**
   * Gère la sélection d'une date dans le calendrier.
   *
   * Premier clic :
   * → définit la date de début.
   *
   * Deuxième clic :
   * → définit la date de fin.
   */
  const handleSelectDate = (date) => {
    // Une date bloquée ne peut pas être sélectionnée.
    if (isBlocked(date)) {
      return;
    }

    // Si aucune date de début n'est sélectionnée,
    // ou si une période complète existe déjà,
    // on commence une nouvelle sélection.
    if (!selectedDates.start || selectedDates.end) {
      setSelectedDates({
        start: date,
        end: null,
      });

      setHoverDate(null);

      return;
    }

    const start = normalizeDate(selectedDates.start);

    const end = normalizeDate(date);

    // Si l'utilisateur sélectionne une date
    // antérieure à la date de début,
    // les deux dates sont automatiquement inversées.
    if (end < start) {
      setSelectedDates({
        start: date,
        end: selectedDates.start,
      });

      setHoverDate(null);

      return;
    }

    // ===================================================
    // VÉRIFICATION DE LA PÉRIODE
    // ===================================================

    // On parcourt chaque jour compris entre
    // la date de début et la date de fin.
    const currentDate = new Date(start);

    while (currentDate <= end) {
      // Si une seule date de la période est bloquée,
      // la sélection est refusée.
      if (isBlocked(currentDate)) {
        return;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // La période est valide :
    // on enregistre la date de fin.
    setSelectedDates({
      start: selectedDates.start,
      end: date,
    });

    setHoverDate(null);
  };

  // =====================================================
  // PRÉVISUALISATION DE LA PÉRIODE
  // =====================================================

  /**
   * Détermine si une date se trouve dans la période
   * actuellement prévisualisée lors du survol.
   */
  const isInRangePreview = (date) => {
    // Pas de prévisualisation si :
    // - aucune date de début ;
    // - une période est déjà complète ;
    // - aucune date n'est survolée.
    if (!selectedDates.start || selectedDates.end || !hoverDate) {
      return false;
    }

    const start = normalizeDate(selectedDates.start);

    const hover = normalizeDate(hoverDate);

    const currentDate = normalizeDate(date);

    // Permet de gérer le cas où l'utilisateur
    // survole une date située avant la date de début.
    const previewStart = start < hover ? start : hover;

    const previewEnd = start < hover ? hover : start;

    return currentDate >= previewStart && currentDate <= previewEnd;
  };

  // =====================================================
  // VÉRIFICATION DES DATES DANS LA PÉRIODE SÉLECTIONNÉE
  // =====================================================

  /**
   * Vérifie si une date se trouve entre la date de début
   * et la date de fin sélectionnées.
   */
  const isInSelectedRange = (date) => {
    if (!selectedDates.start || !selectedDates.end) {
      return false;
    }

    const currentDate = normalizeDate(date);

    const startDate = normalizeDate(selectedDates.start);

    const endDate = normalizeDate(selectedDates.end);

    return currentDate >= startDate && currentDate <= endDate;
  };
  // =====================================================
  // VALIDATION DE LA PÉRIODE
  // =====================================================

  /**
   * Vérifie que la période sélectionnée
   * ne contient aucune date bloquée.
   */
  const isRangeValid = useMemo(() => {
    // Une période nécessite une date de début
    // et une date de fin.
    if (!selectedDates.start || !selectedDates.end) {
      return false;
    }

    const start = normalizeDate(selectedDates.start);

    const end = normalizeDate(selectedDates.end);

    const currentDate = new Date(start);

    // Vérification de chaque jour de la période.
    while (currentDate <= end) {
      if (isBlocked(currentDate)) {
        return false;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return true;
  }, [selectedDates, isBlocked]);

  // =====================================================
  // VALIDATION DU FORMULAIRE
  // =====================================================

  /**
   * Pour un véhicule à la vente, aucune période
   * de réservation n'est nécessaire.
   *
   * Pour une location, une période complète
   * et valide est obligatoire.
   */
  const isFormValid =
    vehicle?.type !== "rent"
      ? true
      : Boolean(selectedDates.start && selectedDates.end && isRangeValid);

  // =====================================================
  // NAVIGATION ENTRE LES MOIS
  // =====================================================

  /**
   * Indique si le calendrier affiche actuellement
   * le mois en cours.
   */
  const isCurrentMonth =
    currentMonth.getFullYear() === todayStart.getFullYear() &&
    currentMonth.getMonth() === todayStart.getMonth();

  /**
   * Affiche le mois précédent.
   *
   * La navigation est bloquée lorsque le calendrier
   * se trouve déjà sur le mois actuel.
   */
  const previousMonth = () => {
    if (isCurrentMonth) {
      return;
    }

    setCurrentMonth((prev) => {
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });
  };

  /**
   * Affiche le mois suivant.
   */
  const nextMonth = () => {
    setCurrentMonth((prev) => {
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });
  };

  // =====================================================
  // JOURS DE LA SEMAINE
  // =====================================================

  // Le calendrier commence volontairement par lundi,
  // conformément à l'affichage habituel en France.
  const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

  // =====================================================
  // GÉNÉRATION DES JOURS DU MOIS
  // =====================================================

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Premier jour du mois.
    const firstDay = new Date(year, month, 1);

    // Dernier jour du mois.
    const lastDay = new Date(year, month + 1, 0);

    const monthDays = [];

    // ===================================================
    // CASES VIDES AVANT LE PREMIER JOUR
    // ===================================================

    /**
     * JavaScript retourne :
     *
     * dimanche = 0
     * lundi    = 1
     * mardi    = 2
     * ...
     * samedi   = 6
     *
     * On transforme cette valeur pour obtenir :
     *
     * lundi    = 0
     * mardi    = 1
     * ...
     * dimanche = 6
     */
    const firstDayIndex = (firstDay.getDay() + 6) % 7;

    // Ajout des cases vides nécessaires
    // pour aligner correctement le premier jour.
    for (let index = 0; index < firstDayIndex; index++) {
      monthDays.push(null);
    }

    // ===================================================
    // AJOUT DES JOURS DU MOIS
    // ===================================================

    for (let day = 1; day <= lastDay.getDate(); day++) {
      monthDays.push(new Date(year, month, day));
    }

    return monthDays;
  }, [currentMonth]);

  // =====================================================
  // NOM DU MOIS
  // =====================================================

  /**
   * Génère le libellé du mois affiché
   * en français.
   *
   * Exemple :
   * "septembre 2026"
   */
  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(currentMonth);
  }, [currentMonth]);

  // =====================================================
  // VALEURS RETOURNÉES PAR LE HOOK
  // =====================================================

  return {
    // Dates sélectionnées
    selectedDates,
    setSelectedDates,

    // Gestion du survol
    hoverDate,
    setHoverDate,

    // Vérification des disponibilités
    isBlocked,

    // Sélection des dates
    handleSelectDate,
    isInRangePreview,
    isInSelectedRange,

    // Validation
    isRangeValid,
    isFormValid,

    // Informations du calendrier
    days,
    weekDays,
    monthLabel,
    currentMonth,

    // Navigation entre les mois
    previousMonth,
    nextMonth,
    isCurrentMonth,
  };
}
