import { useCallback, useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import DetailLayout from "../../layouts/DetailLayout";
import { ImageCarousel } from "../../components/vehicles/ImageCarousel";
import {
  TEST_DRIVE_ADMIN_ACTION_CONFIG,
  TEST_DRIVE_STATUSES,
  TEST_DRIVE_EVENT_ICONS,
} from "../../constants/testDriveOptions";

import { formatDateTime } from "../../utils/dateUtils";

import {
  getTestDrive,
  cancelTestDrive as cancelTestDriveRequest,
  updateTestDriveStatus,
} from "../../services/testDriveService";

import { useAuth } from "../../contexts/AuthContext";

import TestDriveStatusModal from "../../components/test-drives/TestDriveStatusModal";

import {
  getTestDriveStatusClassName,
  getTestDriveStatusLabel,
} from "../../utils/testDriveUtils";
import { formatAmount } from "../../utils/priceUtils";

export default function TestDriveDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  // Récupération de l'utilisateur connecté afin
  // de déterminer s'il s'agit d'un client ou d'un administrateur.
  const { user } = useAuth();

  // ==========================================================
  // STATE
  // ==========================================================

  // Informations détaillées de l'essai routier.
  const [testDrive, setTestDrive] = useState(null);

  // Essai routier actuellement sélectionné
  // pour une action administrateur.
  const [selected, setSelected] = useState(null);

  // Gestion de la modale de changement de statut.
  //
  // open :
  // indique si la modale est ouverte.
  //
  // type :
  // indique l'action demandée :
  // - confirmed
  // - rejected
  // - cancelled
  // - completed
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null,
  });

  // ==========================================================
  // RÔLE UTILISATEUR
  // ==========================================================

  const isAdmin = user?.role === "admin";

  const isClient = user?.role === "client";

  // ==========================================================
  // CHARGEMENT DES DÉTAILS DE L'ESSAI ROUTIER
  // ==========================================================

  const fetchDetails = useCallback(async () => {
    try {
      const data = await getTestDrive(id);

      setTestDrive(data);
    } catch (err) {
      toast.error("Impossible de charger l’essai routier");

      navigate("/mytestdrives");
    }
  }, [id, navigate]);

  // ==========================================================
  // CHARGEMENT INITIAL
  // ==========================================================

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // ==========================================================
  // ANNULER L'ESSAI CÔTÉ CLIENT
  // ==========================================================

  /**
   * Permet au client d'annuler sa demande d'essai.
   *
   * Cette action utilise la route dédiée :
   *
   * POST /test-drives/{id}/cancel
   */
  const handleCancelTestDrive = async () => {
    try {
      await cancelTestDriveRequest(id);

      toast.success("Essai routier annulé avec succès");

      // Recharge le détail pour afficher
      // le nouveau statut.
      await fetchDetails();
    } catch (err) {
      toast.error(err?.message || "Erreur dans l'annulation");
    }
  };

  // ==========================================================
  // OUVRIR LA MODALE D'ACTION ADMIN
  // ==========================================================

  /**
   * Prépare une action administrateur.
   *
   * action peut prendre les valeurs :
   *
   * - confirmed
   * - rejected
   * - cancelled
   * - completed
   *
   * L'action est stockée dans actionModal puis
   * transmise au composant TestDriveStatusModal.
   */
  const openActionModal = (testDrive, action) => {
    setSelected(testDrive);

    setActionModal({
      open: true,
      type: action,
    });
  };

  // ==========================================================
  // FERMER LA MODALE
  // ==========================================================

  /**
   * Ferme la modale et réinitialise l'essai sélectionné.
   */
  const closeActionModal = () => {
    setActionModal({
      open: false,
      type: null,
    });

    setSelected(null);
  };

  // ==========================================================
  // ACTION ADMIN : CHANGEMENT DE STATUT
  // ==========================================================

  /**
   * Exécute l'action administrative confirmée
   * depuis TestDriveStatusModal.
   *
   * Les différentes actions possibles sont :
   *
   * confirmed
   * rejected
   * cancelled
   * completed
   */
  const handleAction = async () => {
    // Sécurité : aucune action ne peut être exécutée
    // sans essai sélectionné ni type d'action.
    if (!selected || !actionModal.type) {
      return;
    }

    try {
      /**
       * Le backend reste responsable de la validation
       * des droits et des transitions de statut.
       *
       * Exemple :
       *
       * PATCH /test-drives/123/status
       *
       * {
       *   "status": "confirmed"
       * }
       */
      await updateTestDriveStatus(selected.id, actionModal.type);

      // Message affiché après chaque action.
      toast.success(
        TEST_DRIVE_ADMIN_ACTION_CONFIG[actionModal.type].message ||
          "Statut mis à jour avec succès"
      );

      // Fermeture de la modale.
      closeActionModal();

      // Recharge du détail afin de récupérer
      // le nouveau statut et le nouvel historique.
      await fetchDetails();
    } catch (err) {
      toast.error(
        err?.message || "Impossible de modifier le statut de l'essai routier"
      );
    }
  };

  // ==========================================================
  // AJOUTER AU CALENDRIER
  // ==========================================================

  /**
   * Ajoute l'essai routier dans Google Calendar.
   *
   * Cette action est proposée au client uniquement
   * lorsque l'essai a été confirmé.
   */
  const addToCalendar = () => {
    const startDate = new Date(testDrive.appointment_date);

    // Durée estimée de l'essai : 1 heure.
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    /**
     * Google Calendar attend une date
     * au format :
     *
     * YYYYMMDDTHHMMSSZ
     */
    const formatGoogleDate = (date) => {
      return date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    };

    // Nom du véhicule affiché dans le calendrier.
    const vehicleName = `${testDrive.vehicle?.brand || ""} ${
      testDrive.vehicle?.model || ""
    }`.trim();

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(`Essai routier ${vehicleName}`)}` +
      `&dates=${formatGoogleDate(startDate)}` +
      "/" +
      `${formatGoogleDate(endDate)}` +
      `&details=${encodeURIComponent("Essai routier M-Motors")}` +
      `&location=${encodeURIComponent("M-Motors")}`;

    // Ouverture de Google Calendar dans un nouvel onglet.
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ==========================================================
  // CONTACTER LE SUPPORT
  // ==========================================================

  /**
   * Prépare un email destiné au support.
   *
   * L'identifiant et la date de l'essai sont
   * automatiquement ajoutés au message.
   */
  // ==========================================================
  // CONTACTER LE SUPPORT
  // ==========================================================

  const contactSupport = () => {
    const subject = `Support essai routier ${testDrive.id}`;

    const body = `Bonjour,

J’ai une question concernant mon essai routier du ${formatDateTime(
      testDrive.appointment_date
    )}.

Merci.`;

    const params = new URLSearchParams({
      subject,
      body,
    });

    window.location.href = `mailto:support@mmotors.com?${params.toString()}`;
  };

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (!testDrive) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />

        <p className="mt-3 text-muted">Chargement de l'essai routier...</p>
      </div>
    );
  }

  // ==========================================================
  // STATUT
  // ==========================================================

  const status =
    TEST_DRIVE_STATUSES[testDrive.status] || TEST_DRIVE_STATUSES.pending;

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <>
      <DetailLayout
        showBackButton
        breadcrumb={[
          {
            label: "Mes essais routiers",
            path: "/mytestdrives",
          },
          {
            label: `${testDrive.vehicle?.brand || ""} ${
              testDrive.vehicle?.model || ""
            }`,
          },
        ]}
      >
        <div className="container py-4">
          <div className="row g-4">
            {/* ==================================================
                LEFT SIDE
            ================================================== */}

            <div className="col-lg-8">
              {/* =================================================
                  VEHICLE CARD
              ================================================= */}

              <div
                className="
                  card
                  border-0
                  shadow-sm
                  rounded-4
                  overflow-hidden
                "
              >
                {/* ===============================================
                    IMAGE DU VÉHICULE
                ================================================ */}

                <ImageCarousel
                  images={testDrive.vehicle?.images || []}
                  height={320}
                />

                {/* =============================================
                  INFORMATIONS DU VÉHICULE
                ============================================= */}

                <div className="card-body p-4">
                  <div
                    className="
      d-flex
      justify-content-between
      align-items-start
      mb-3
    "
                  >
                    <div>
                      <h2 className="fw-bold mb-1">
                        {testDrive.vehicle?.brand} {testDrive.vehicle?.model}
                      </h2>

                      <p className="text-muted mb-2">Essai routier</p>

                      {/* ===========================================
          IMMATRICULATION
      =========================================== */}

                      {testDrive.vehicle?.license_plate && (
                        <div className="mb-1">
                          <small className="text-muted me-2">
                            Immatriculation :
                          </small>

                          <span className="fw-semibold">
                            {testDrive.vehicle.license_plate}
                          </span>
                        </div>
                      )}

                      {/* ===========================================
          PRIX
      =========================================== */}

                      {testDrive.vehicle?.price !== null &&
                        testDrive.vehicle?.price !== undefined && (
                          <div>
                            <small className="text-muted me-2">Prix :</small>

                            <span className="fw-semibold">
                              {formatAmount(testDrive.vehicle.price)}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* ===========================================
        STATUT
    =========================================== */}

                    <span
                      className={`badge ${getTestDriveStatusClassName(testDrive.status)} px-3 py-2`}
                    >
                      {getTestDriveStatusLabel(testDrive.status)}
                    </span>
                  </div>

                  {/* =============================================
                      DATE DU RENDEZ-VOUS
                  ============================================= */}

                  <div className="mb-4">
                    <small
                      className="
                        text-muted
                        d-block
                      "
                    >
                      Date du rendez-vous
                    </small>

                    <div
                      className="
                        fw-semibold
                        fs-5
                      "
                    >
                      {formatDateTime(testDrive.appointment_date)}
                    </div>
                  </div>

                  {/* =============================================
                      COMMENTAIRE
                  ============================================= */}

                  {testDrive.comment && (
                    <div className="mb-4">
                      <small
                        className="
                          text-muted
                          d-block
                          mb-1
                        "
                      >
                        Commentaire
                      </small>

                      <div
                        className="
                          bg-light
                          rounded-3
                          p-3
                        "
                      >
                        {testDrive.comment}
                      </div>
                    </div>
                  )}

                  {/* =============================================
                      PROGRESSION
                  ============================================= */}

                  <div>
                    <div
                      className="
                        d-flex
                        justify-content-between
                        mb-2
                      "
                    >
                      <small className="text-muted">Progression</small>

                      <small className="fw-semibold">{status.progress}%</small>
                    </div>

                    <div
                      className="progress"
                      style={{
                        height: "8px",
                      }}
                    >
                      <div
                        className="progress-bar"
                        style={{
                          width: `${status.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  HISTORIQUE
              ================================================= */}

              <div
                className="
                  card
                  border-0
                  shadow-sm
                  rounded-4
                  mt-4
                "
              >
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-4">Historique</h4>

                  {testDrive.timeline?.length ? (
                    <div className="position-relative">
                      {/* =========================================
                          LIGNE VERTICALE
                      ========================================= */}

                      <div
                        style={{
                          position: "absolute",
                          left: "18px",
                          top: 0,
                          bottom: 0,
                          width: "2px",
                          background: "#e9ecef",
                        }}
                      />

                      {/* =========================================
                          ÉVÉNEMENTS
                      ========================================= */}

                      {testDrive.timeline.map((event, index) => (
                        <div
                          key={index}
                          className="
                              d-flex
                              mb-4
                              position-relative
                            "
                        >
                          {/* ===================================
                                ICÔNE
                            =================================== */}

                          <div
                            className="
                                rounded-circle
                                bg-white
                                border
                                shadow-sm
                                d-flex
                                align-items-center
                                justify-content-center
                              "
                            style={{
                              width: "38px",
                              height: "38px",
                              zIndex: 2,
                            }}
                          >
                            <i
                              className={
                                TEST_DRIVE_EVENT_ICONS[event.type] ||
                                "bi bi-info-circle"
                              }
                            />
                          </div>

                          {/* ===================================
                                INFORMATIONS
                            =================================== */}

                          <div className="ms-3">
                            <div className="fw-semibold">{event.message}</div>

                            <small className="text-muted">
                              {formatDateTime(event.date)}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">Aucun historique disponible.</p>
                  )}
                </div>
              </div>
            </div>

            {/* ==================================================
                RIGHT SIDE
            ================================================== */}

            <div className="col-lg-4">
              {/* =================================================
                  INFORMATIONS UTILISATEUR
              ================================================= */}

              <div
                className="
                  card
                  border-0
                  shadow-sm
                  rounded-4
                  mb-4
                "
              >
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Mes informations</h5>

                  <small
                    className="
                      text-muted
                      d-block
                    "
                  >
                    Nom
                  </small>

                  <div
                    className="
                      fw-semibold
                      mb-3
                    "
                  >
                    {testDrive.user?.name}
                  </div>

                  <small
                    className="
                      text-muted
                      d-block
                    "
                  >
                    Email
                  </small>

                  <div className="fw-semibold">{testDrive.user?.email}</div>
                </div>
              </div>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div
                className="
                  card
                  border-0
                  shadow-sm
                  rounded-4
                "
              >
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Actions</h5>

                  {/* =================================================
                      ACTIONS CLIENT
                  ================================================= */}

                  {isClient && (
                    <>
                      {/* =============================================
                          AJOUTER AU CALENDRIER
                          Disponible uniquement lorsque l'essai
                          est confirmé.
                      ============================================= */}

                      {testDrive.status === "confirmed" && (
                        <button
                          type="button"
                          className="
                            btn
                            btn-primary
                            w-100
                            mb-2
                          "
                          onClick={addToCalendar}
                        >
                          <i
                            className="
                              bi
                              bi-calendar-plus
                              me-2
                            "
                          />
                          Ajouter au calendrier
                        </button>
                      )}

                      {/* =============================================
                          CONTACTER LE SUPPORT
                      ============================================= */}

                      <button
                        type="button"
                        className="
                          btn
                          btn-outline-dark
                          w-100
                          mb-2
                        "
                        onClick={contactSupport}
                      >
                        <i
                          className="
                            bi
                            bi-headset
                            me-2
                          "
                        />
                        Contacter le support
                      </button>

                      {/* =============================================
                          ANNULER LA DEMANDE
                          Le client peut annuler uniquement
                          lorsque la demande est encore en attente.
                      ============================================= */}

                      {testDrive.status === "pending" && (
                        <button
                          type="button"
                          className="
                            btn
                            btn-outline-danger
                            w-100
                          "
                          onClick={handleCancelTestDrive}
                        >
                          <i
                            className="
                              bi
                              bi-x-circle
                              me-2
                            "
                          />
                          Annuler la demande
                        </button>
                      )}
                    </>
                  )}

                  {/* =================================================
                      ACTIONS ADMIN
                  ================================================= */}

                  {isAdmin && (
                    <>
                      {/* =============================================
                          ESSAI EN ATTENTE
                          Actions disponibles :
                          - Confirmer
                          - Refuser
                      ============================================= */}

                      {testDrive.status === "pending" && (
                        <div className="d-grid gap-2">
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={() =>
                              openActionModal(testDrive, "confirmed")
                            }
                          >
                            <i
                              className="
                                bi
                                bi-check-circle
                                me-2
                              "
                            />
                            Confirmer
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() =>
                              openActionModal(testDrive, "rejected")
                            }
                          >
                            <i
                              className="
                                bi
                                bi-x-circle
                                me-2
                              "
                            />
                            Refuser
                          </button>
                        </div>
                      )}

                      {/* =============================================
                          ESSAI CONFIRMÉ
                          Actions disponibles :
                          - Annuler
                          - Terminer
                      ============================================= */}

                      {testDrive.status === "confirmed" && (
                        <div className="d-grid gap-2">
                          <button
                            type="button"
                            className="btn btn-warning"
                            onClick={() =>
                              openActionModal(testDrive, "cancelled")
                            }
                          >
                            <i
                              className="
                                bi
                                bi-calendar-x
                                me-2
                              "
                            />
                            Annuler
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                              openActionModal(testDrive, "completed")
                            }
                          >
                            <i
                              className="
                                bi
                                bi-flag
                                me-2
                              "
                            />
                            Terminer
                          </button>
                        </div>
                      )}

                      {/* =============================================
                          AUTRES STATUTS
                          Une fois l'essai :
                          - refusé
                          - annulé
                          - terminé
                          aucune nouvelle action n'est disponible.
                      ============================================= */}

                      {["rejected", "cancelled", "completed"].includes(
                        testDrive.status
                      ) && (
                        <div
                          className="
                            alert
                            alert-light
                            border
                            mb-0
                          "
                        >
                          <i
                            className="
                              bi
                              bi-info-circle
                              me-2
                            "
                          />
                          Aucune action supplémentaire n'est disponible pour cet
                          essai.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DetailLayout>

      {/* ========================================================
          MODALE DES ACTIONS ADMIN
      ========================================================

          La modale reçoit :

          open :
          indique si elle doit être affichée.

          type :
          indique l'action à confirmer.

          testDrive :
          contient l'essai concerné.

          onConfirm :
          exécute réellement la modification du statut.

          onClose :
          ferme la modale.

      ======================================================== */}

      <TestDriveStatusModal
        open={actionModal.open}
        type={actionModal.type}
        testDrive={selected}
        onConfirm={handleAction}
        onClose={closeActionModal}
      />
    </>
  );
}
