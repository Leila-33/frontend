import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import apiFetch from "../../services/apiFetch";

// =====================================================
// CONFIGURATION DES STATUTS
// =====================================================

const TEST_DRIVE_STATUS_CONFIG = {
  pending: {
    title: "Demande en attente",
    message: "Vous avez déjà un essai routier en attente de confirmation.",
    icon: "bi-hourglass-split",
    color: "warning",
  },

  confirmed: {
    title: "Essai routier confirmé",
    message: "Votre essai routier est confirmé.",
    icon: "bi-check-circle",
    color: "success",
  },

  rejected: {
    title: "Demande refusée",
    message: "Votre demande d'essai routier a été refusée.",
    icon: "bi-x-circle",
    color: "danger",
  },

  cancelled: {
    title: "Essai routier annulé",
    message: "Votre essai routier a été annulé.",
    icon: "bi-calendar-x",
    color: "secondary",
  },

  completed: {
    title: "Essai routier terminé",
    message: "Vous avez déjà effectué cet essai routier.",
    icon: "bi-flag",
    color: "success",
  },
};

// =====================================================
// COMPOSANT : TEST DRIVE MODAL
// =====================================================

// Modale permettant à un utilisateur authentifié de :
//
// 1. consulter un essai routier existant ;
// 2. accéder à la page de détail de cet essai ;
// 3. demander un nouvel essai si l'ancien a été refusé
//    ou annulé ;
// 4. sélectionner une date et un créneau ;
// 5. ajouter éventuellement un commentaire ;
// 6. envoyer une demande d'essai routier.
//
// Le composant reçoit `existingTestDrive` depuis VehicleDetail.
// La recherche de l'essai existant n'est donc pas effectuée
// dans cette modale.

export default function TestDriveModal({
  show,
  onClose,
  vehicleId,
  existingTestDrive,
  onCreated,
}) {
  const navigate = useNavigate();

  // =====================================================
  // ÉTATS
  // =====================================================

  // Commentaire facultatif ajouté à la demande.
  const [comment, setComment] = useState("");

  // Liste des créneaux disponibles.
  const [availability, setAvailability] = useState([]);

  // Créneau actuellement sélectionné.
  const [selectedHour, setSelectedHour] = useState("");

  // Date actuellement sélectionnée.
  const [selectedDate, setSelectedDate] = useState("");

  // Indique si les créneaux sont en cours de chargement.
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Indique si la demande est en cours d'envoi.
  const [submitting, setSubmitting] = useState(false);

  // Indique que l'utilisateur souhaite créer
  // un nouvel essai malgré l'existence d'un ancien essai.
  const [creatingNewTestDrive, setCreatingNewTestDrive] = useState(false);

  // =====================================================
  // CONFIGURATION DE L'ESSAI EXISTANT
  // =====================================================

  // Récupère la configuration correspondant au statut.
  const existingTestDriveInfo = existingTestDrive
    ? TEST_DRIVE_STATUS_CONFIG[existingTestDrive.status]
    : null;

  // Les statuts suivants autorisent une nouvelle demande.
  const canCreateNewTestDrive = ["rejected", "cancelled"].includes(
    existingTestDrive?.status
  );

  // Détermine si les informations de l'ancien essai
  // doivent être affichées.
  const shouldShowExistingTestDrive =
    Boolean(existingTestDrive) && !creatingNewTestDrive;

  // =====================================================
  // RÉINITIALISATION DU FORMULAIRE
  // =====================================================

  const resetForm = () => {
    setComment("");
    setAvailability([]);
    setSelectedHour("");
    setSelectedDate("");
    setLoadingAvailability(false);
    setSubmitting(false);
  };

  // =====================================================
  // RÉINITIALISATION À L'OUVERTURE
  // =====================================================

  // Lorsque la modale est ouverte pour un nouvel essai,
  // on affiche par défaut les informations de l'essai existant.
  useEffect(() => {
    if (show) {
      setCreatingNewTestDrive(false);
    }
  }, [show, existingTestDrive?.id]);

  // =====================================================
  // FERMETURE DE LA MODALE
  // =====================================================

  const handleClose = () => {
    // Réinitialise le formulaire.
    resetForm();

    // Réinitialise également le mode de création.
    setCreatingNewTestDrive(false);

    // Ferme la modale.
    onClose();
  };

  // =====================================================
  // NAVIGATION VERS LE DÉTAIL
  // =====================================================

  const handleViewExistingTestDrive = () => {
    if (!existingTestDrive?.id) {
      toast.error("Impossible d'accéder à cet essai routier.");

      return;
    }

    // Ferme la modale avant la navigation.
    onClose();

    // Redirige vers la page de détail de l'essai.
    navigate(`/test-drives/${existingTestDrive.id}`);
  };

  // =====================================================
  // CHARGEMENT DES CRÉNEAUX
  // =====================================================

  const fetchAvailability = async (date) => {
    if (!date || !vehicleId) {
      return;
    }

    setLoadingAvailability(true);

    // Réinitialise l'ancien créneau.
    setSelectedHour("");

    // Supprime les anciens créneaux pendant le chargement.
    setAvailability([]);

    try {
      const params = new URLSearchParams({
        vehicle_id: String(vehicleId),
        date,
      });

      const response = await apiFetch(
        `/test-drives/availability?${params.toString()}`
      );

      setAvailability(response?.available_slots || []);
    } catch (err) {
      toast.error(
        err?.data?.detail ||
          err?.message ||
          "Impossible de charger les créneaux disponibles."
      );

      setAvailability([]);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // =====================================================
  // CHANGEMENT DE DATE
  // =====================================================

  const handleDateChange = (event) => {
    const date = event.target.value;

    setSelectedDate(date);
    setSelectedHour("");

    fetchAvailability(date);
  };

  // =====================================================
  // SOUMISSION DE LA DEMANDE
  // =====================================================

  const submitTestDrive = async () => {
    // -----------------------------------------------------
    // VALIDATION DES DONNÉES
    // -----------------------------------------------------

    if (!vehicleId) {
      toast.error("Véhicule invalide.");

      return;
    }

    if (!selectedDate || !selectedHour) {
      toast.error("Choisissez une date et un créneau.");

      return;
    }

    // -----------------------------------------------------
    // VALIDATION DU CRÉNEAU
    // -----------------------------------------------------

    const appointmentDate = new Date(selectedHour);

    if (Number.isNaN(appointmentDate.getTime())) {
      toast.error("Le créneau sélectionné est invalide.");

      return;
    }

    if (appointmentDate.getTime() < Date.now()) {
      toast.error("La date du rendez-vous ne peut pas être dans le passé.");

      return;
    }

    // -----------------------------------------------------
    // ENVOI DE LA DEMANDE
    // -----------------------------------------------------

    setSubmitting(true);

    try {
      await apiFetch("/test-drives", {
        method: "POST",

        body: {
          vehicle_id: vehicleId,

          // Conversion en UTC avant transmission.
          appointment_date: appointmentDate.toISOString(),

          // Un commentaire vide devient null.
          comment: comment.trim() || null,
        },
      });

      // ---------------------------------------------------
      // SUCCÈS
      // ---------------------------------------------------

      toast.success("Demande d'essai routier envoyée ✔");

      resetForm();

      setCreatingNewTestDrive(false);

      // Recharge l'essai dans VehicleDetail
      if (onCreated) {
        await onCreated();
      }

      onClose();
    } catch (err) {
      // ---------------------------------------------------
      // ERREUR
      // ---------------------------------------------------

      toast.error(
        err?.data?.detail ||
          err?.message ||
          "Impossible d'envoyer la demande d'essai routier."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DATE MINIMALE
  // =====================================================

  const today = new Date().toISOString().split("T")[0];

  // =====================================================
  // RENDU CONDITIONNEL
  // =====================================================

  if (!show) {
    return null;
  }

  return (
    <div
      className="modal fade show d-block bg-dark bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-drive-modal-title"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow">
          {/* =================================================
              HEADER
              ================================================= */}

          <div className="modal-header border-0">
            <h5 id="test-drive-modal-title" className="modal-title fw-bold">
              {shouldShowExistingTestDrive
                ? "Mon essai routier"
                : "Réserver un essai routier"}
            </h5>

            <button
              type="button"
              className="btn-close"
              aria-label="Fermer"
              onClick={handleClose}
              disabled={submitting}
            />
          </div>

          {/* =================================================
              BODY : ESSAI EXISTANT
              ================================================= */}

          {shouldShowExistingTestDrive ? (
            <div className="modal-body p-4">
              <div className="bg-light rounded-4 p-4">
                {/* =========================================
                    ICÔNE DU STATUT
                    ========================================= */}

                <div className="text-center mb-4">
                  <div
                    className={`
                      d-inline-flex
                      align-items-center
                      justify-content-center
                      rounded-circle
                      bg-${existingTestDriveInfo?.color || "secondary"}
                      bg-opacity-10
                      text-${existingTestDriveInfo?.color || "secondary"}
                    `}
                    style={{
                      width: "64px",
                      height: "64px",
                    }}
                  >
                    <i
                      className={`
                        bi
                        ${existingTestDriveInfo?.icon || "bi-info-circle"}
                        fs-3
                      `}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* =========================================
                    TITRE ET MESSAGE
                    ========================================= */}

                <h5 className="text-center fw-semibold mb-3">
                  {existingTestDriveInfo?.title || "Essai routier existant"}
                </h5>

                <p className="text-center text-muted mb-4">
                  {existingTestDriveInfo?.message ||
                    "Vous avez déjà une demande d'essai routier pour ce véhicule."}
                </p>

                {/* =========================================
                    INFORMATIONS DU RENDEZ-VOUS
                    ========================================= */}

                {existingTestDrive.appointment_date && (
                  <div className="border rounded-3 bg-white p-3 mb-4">
                    <div className="mb-2">
                      <small className="text-muted d-block mb-1">
                        Date du rendez-vous
                      </small>

                      <span className="fw-semibold">
                        {new Date(
                          existingTestDrive.appointment_date
                        ).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    <div>
                      <small className="text-muted d-block mb-1">Heure</small>

                      <span className="fw-semibold">
                        {new Date(
                          existingTestDrive.appointment_date
                        ).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* =========================================
                    ACTIONS
                    ========================================= */}

                {canCreateNewTestDrive ? (
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={() => {
                      setCreatingNewTestDrive(true);
                    }}
                  >
                    <i
                      className="bi bi-calendar-plus me-2"
                      aria-hidden="true"
                    />
                    Demander un nouvel essai routier
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={handleViewExistingTestDrive}
                  >
                    Voir mon essai routier
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* =================================================
               BODY : FORMULAIRE
               ================================================= */

            <>
              <div className="modal-body">
                {/* =========================================
                    DATE
                    ========================================= */}

                <div className="mb-3">
                  <label
                    htmlFor="test-drive-date"
                    className="form-label fw-medium"
                  >
                    Date
                  </label>

                  <input
                    id="test-drive-date"
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    min={today}
                    onChange={handleDateChange}
                    disabled={submitting}
                  />
                </div>

                {/* =========================================
                    CRÉNEAUX DISPONIBLES
                    ========================================= */}

                {selectedDate && (
                  <div className="mb-4">
                    <label className="form-label fw-medium d-block">
                      Créneau
                    </label>

                    {/* ---------------------------------------
                        CHARGEMENT
                        --------------------------------------- */}

                    {loadingAvailability && (
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <div
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        />

                        <span>Chargement des créneaux...</span>
                      </div>
                    )}

                    {/* ---------------------------------------
                        AUCUN CRÉNEAU
                        --------------------------------------- */}

                    {!loadingAvailability && availability.length === 0 && (
                      <div className="text-muted small">
                        Aucun créneau disponible pour cette date.
                      </div>
                    )}

                    {/* ---------------------------------------
                        LISTE DES CRÉNEAUX
                        --------------------------------------- */}

                    {!loadingAvailability && availability.length > 0 && (
                      <div className="d-flex flex-wrap gap-2">
                        {availability.map((slot) => {
                          const slotDate = new Date(slot);

                          const formattedTime = slotDate.toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          );

                          const isSelected = selectedHour === slot;

                          return (
                            <button
                              key={slot}
                              type="button"
                              className={`
                                  btn
                                  btn-sm
                                  ${
                                    isSelected
                                      ? "btn-primary"
                                      : "btn-outline-primary"
                                  }
                                `}
                              onClick={() => {
                                setSelectedHour(slot);
                              }}
                              disabled={submitting}
                              aria-pressed={isSelected}
                            >
                              {formattedTime}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* =========================================
                    COMMENTAIRE
                    ========================================= */}

                <div>
                  <label
                    htmlFor="test-drive-comment"
                    className="form-label fw-medium"
                  >
                    Commentaire
                    <span className="text-muted fw-normal"> (optionnel)</span>
                  </label>

                  <textarea
                    id="test-drive-comment"
                    className="form-control"
                    rows="3"
                    placeholder="Ex. : je préfère une boîte automatique..."
                    value={comment}
                    onChange={(event) => {
                      setComment(event.target.value);
                    }}
                    disabled={submitting}
                    maxLength={500}
                  />

                  <div className="text-end mt-1">
                    <small className="text-muted">{comment.length}/500</small>
                  </div>
                </div>
              </div>

              {/* =================================================
                  FOOTER : FORMULAIRE
                  ================================================= */}

              <div className="modal-footer border-0">
                {/* ---------------------------------------------
                    ANNULATION
                    --------------------------------------------- */}

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={handleClose}
                  disabled={submitting}
                >
                  Annuler
                </button>

                {/* ---------------------------------------------
                    CONFIRMATION
                    --------------------------------------------- */}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={submitTestDrive}
                  disabled={
                    submitting ||
                    loadingAvailability ||
                    !selectedDate ||
                    !selectedHour
                  }
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Envoi...
                    </>
                  ) : (
                    "Confirmer"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
