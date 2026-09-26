import { useState } from "react";
import { BsCalendarCheck, BsCheckCircle, BsXCircle } from "react-icons/bs";
import { toast } from "react-toastify";

import apiFetch from "../../services/apiFetch";

export default function AvailabilityModal({ vehicle, onClose }) {
  /* =======================================================
     ÉTAT - VÉRIFICATION DES DATES
  ======================================================= */

  /**
   * Dates utilisées pour vérifier la disponibilité
   * du véhicule sur une période donnée.
   */
  const [dateCheck, setDateCheck] = useState({
    start: "",
    end: "",
  });

  /**
   * Erreurs associées aux champs de dates.
   *
   * Exemple :
   * {
   *   start: "Date de départ requise",
   *   end: "Date de retour requise"
   * }
   */
  const [dateErrors, setDateErrors] = useState({});

  /**
   * Résultat de la vérification de disponibilité.
   *
   * null  = aucune vérification effectuée
   * true  = véhicule disponible
   * false = véhicule indisponible
   */
  const [reservationAvailability, setReservationAvailability] = useState(null);

  /* =======================================================
     VALIDATION DES DATES
  ======================================================= */

  /**
   * Vérifie les dates saisies par l'utilisateur.
   *
   * Règles :
   * - la date de départ est obligatoire ;
   * - la date de retour est obligatoire ;
   * - le départ ne peut pas être antérieur à aujourd'hui ;
   * - le retour doit être strictement postérieur au départ.
   *
   * Les dates sont comparées sous forme de chaînes YYYY-MM-DD
   * afin d'éviter les problèmes liés aux fuseaux horaires.
   */
  const validateDates = (start, end) => {
    const errors = {};

    /* -------------------------------------------------------
       CHAMPS OBLIGATOIRES
    ------------------------------------------------------- */

    if (!start) {
      errors.start = "Date de départ requise";
    }

    if (!end) {
      errors.end = "Date de retour requise";
    }

    /* -------------------------------------------------------
       VALIDATION DES DATES
    ------------------------------------------------------- */

    if (start && end) {
      /*
       * Date actuelle au format YYYY-MM-DD.
       *
       * Le décalage horaire local est pris en compte avant
       * la conversion en ISO.
       */
      const currentDate = new Date();

      const todayString = new Date(
        currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      // La date de départ doit être aujourd'hui ou ultérieure.
      if (start < todayString) {
        errors.start = "La date de départ doit être aujourd'hui ou ultérieure";
      }

      // La date de retour doit être après la date de départ.
      if (end <= start) {
        errors.end = "La date de retour doit être après le départ";
      }
    }

    setDateErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* =======================================================
     MODIFICATION DE LA DATE DE DÉPART
  ======================================================= */

  const handleStartChange = (value) => {
    const newState = {
      ...dateCheck,
      start: value,
    };

    setDateCheck(newState);

    /*
     * Une nouvelle saisie invalide le résultat
     * de disponibilité précédent.
     */
    setReservationAvailability(null);

    validateDates(newState.start, newState.end);
  };

  /* =======================================================
     MODIFICATION DE LA DATE DE RETOUR
  ======================================================= */

  const handleEndChange = (value) => {
    const newState = {
      ...dateCheck,
      end: value,
    };

    setDateCheck(newState);

    /*
     * Une nouvelle saisie invalide le résultat
     * de disponibilité précédent.
     */
    setReservationAvailability(null);

    validateDates(newState.start, newState.end);
  };

  /* =======================================================
     VÉRIFICATION DE DISPONIBILITÉ
  ======================================================= */

  /**
   * Vérifie auprès de l'API si le véhicule est disponible
   * sur la période sélectionnée.
   */
  const handleCheck = async () => {
    const { start, end } = dateCheck;

    /*
     * Sécurité supplémentaire :
     * on ne lance pas la requête sans les informations nécessaires.
     */
    if (!vehicle || !start || !end) {
      return;
    }

    /*
     * On effectue une dernière validation avant
     * d'appeler l'API.
     */
    if (!validateDates(start, end)) {
      return;
    }

    try {
      const response = await apiFetch("/reservations/check", {
        method: "POST",
        body: {
          vehicle_id: vehicle.id,
          start_date: start,
          end_date: end,
        },
      });

      setReservationAvailability(response.available);
    } catch (err) {
      toast.error(
        err.message || "Erreur lors de la vérification de la disponibilité"
      );
    }
  };

  /* =======================================================
     DATE MINIMALE
  ======================================================= */

  /**
   * Date minimale autorisée pour le départ :
   * aujourd'hui.
   */
  const currentDate = new Date();

  const today = new Date(
    currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  /* =======================================================
     SÉCURITÉ
  ======================================================= */

  if (!vehicle) {
    return null;
  }

  /* =======================================================
     AFFICHAGE
  ======================================================= */

  return (
    <div
      className="modal d-block"
      style={{
        background: "rgba(0, 0, 0, 0.6)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`availability-modal-title-${vehicle.id}`}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4 rounded-4">
          <h5 id={`availability-modal-title-${vehicle.id}`} className="mb-1">
            Vérifier la disponibilité
          </h5>

          <p className="text-muted small mb-3">
            {vehicle.brand} {vehicle.model}
          </p>

          {/* ------------------------------------------------
              DATE DE DÉPART
          ------------------------------------------------ */}

          <label htmlFor={`start-date-${vehicle.id}`} className="form-label">
            Date de départ
          </label>

          <input
            id={`start-date-${vehicle.id}`}
            type="date"
            className={`form-control mb-2 ${
              dateErrors.start ? "is-invalid" : ""
            }`}
            value={dateCheck.start}
            min={today}
            onChange={(event) => handleStartChange(event.target.value)}
          />

          {dateErrors.start && (
            <div className="invalid-feedback d-block">{dateErrors.start}</div>
          )}

          {/* ------------------------------------------------
              DATE DE RETOUR
          ------------------------------------------------ */}

          <label htmlFor={`end-date-${vehicle.id}`} className="form-label mt-2">
            Date de retour
          </label>

          <input
            id={`end-date-${vehicle.id}`}
            type="date"
            className={`form-control mb-2 ${
              dateErrors.end ? "is-invalid" : ""
            }`}
            value={dateCheck.end}
            min={dateCheck.start || today}
            onChange={(event) => handleEndChange(event.target.value)}
          />

          {dateErrors.end && (
            <div className="invalid-feedback d-block">{dateErrors.end}</div>
          )}

          {/* ------------------------------------------------
              BOUTON DE VÉRIFICATION
          ------------------------------------------------ */}

          <button
            type="button"
            className="btn btn-dark w-100 mt-2"
            onClick={handleCheck}
            disabled={
              !dateCheck.start ||
              !dateCheck.end ||
              Object.keys(dateErrors).length > 0
            }
          >
            <BsCalendarCheck className="me-2" />
            Vérifier la disponibilité
          </button>

          {/* ------------------------------------------------
              RÉSULTAT
          ------------------------------------------------ */}

          {reservationAvailability !== null && (
            <div className="mt-3 text-center">
              {reservationAvailability ? (
                <span className="text-success fw-bold">
                  <BsCheckCircle className="me-1" />
                  Véhicule disponible
                </span>
              ) : (
                <span className="text-danger fw-bold">
                  <BsXCircle className="me-1" />
                  Véhicule indisponible
                </span>
              )}
            </div>
          )}

          {/* ------------------------------------------------
              FERMETURE
          ------------------------------------------------ */}

          <button
            type="button"
            className="btn btn-outline-dark mt-3 w-100"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
