import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";

import {
  BsCheckCircleFill,
  BsChevronRight,
  BsClock,
  BsGear,
  BsShieldCheck,
  BsTools,
  BsUpload,
} from "react-icons/bs";

import apiFetch from "../../services/apiFetch";
import useNotificationSocket from "../../hooks/useNotificationSocket";

// =====================================================
// CONSTANTES
// =====================================================

// Statuts utilisés par le cycle de vie du véhicule.
const STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  APPROVED: "APPROVED",
};

// Liste des travaux possibles lors du reconditionnement.
const TASKS = {
  ENGINE_DIAG: {
    label: "Diagnostic moteur",
    icon: "bi-gear",
  },

  BRAKES_REPLACE: {
    label: "Remplacement des freins",
    icon: "bi-disc",
  },

  TIRES_REPLACE: {
    label: "Remplacement des pneus",
    icon: "bi-circle",
  },

  ELECTRONICS_DIAG: {
    label: "Diagnostic électronique",
    icon: "bi-cpu",
  },

  SAFETY_COMPLIANCE: {
    label: "Mise en conformité sécurité",
    icon: "bi-shield-check",
  },

  NO_REPAIR_NEEDED: {
    label: "Aucune réparation nécessaire",
    icon: "bi-check-circle",
  },
};

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================

export default function InspectionStepper({
  vehicle,
  vehicleId,
  user,
  loadVehicle,
}) {
  // ===================================================
  // ÉTATS
  // ===================================================

  // Informations de l'inspection technique.
  const [inspection, setInspection] = useState(null);

  // Informations du reconditionnement.
  const [reconditioning, setReconditioning] = useState(null);

  // Indique si le cycle de vie est en cours de chargement.
  const [loading, setLoading] = useState(false);

  // Identifie l'action actuellement exécutée.
  // Cela permet d'afficher un loader sur le bon bouton.
  const [actionLoading, setActionLoading] = useState(null);

  // ===================================================
  // CHARGEMENT DU CYCLE DE VIE
  // ===================================================

  const loadVehicleLifecycle = useCallback(async () => {
    // Aucun chargement possible sans identifiant véhicule.
    if (!vehicleId) {
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch(`/admin/vehicles/${vehicleId}/lifecycle`, {
        method: "GET",
      });

      // Mise à jour des informations reçues du backend.
      setInspection(data.inspection ?? null);

      setReconditioning(data.reconditioning ?? null);
    } catch (err) {
      console.error("Erreur chargement du cycle de vie :", err);

      toast.error(err.message || "Impossible de charger le cycle de vie");

      // Réinitialisation des données en cas d'erreur.
      setInspection(null);
      setReconditioning(null);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  // Chargement initial et rechargement lorsque
  // l'identifiant du véhicule change.
  useEffect(() => {
    loadVehicleLifecycle();
  }, [loadVehicleLifecycle]);

  // ===================================================
  // RÉCEPTION DES ÉVÉNEMENTS WEBSOCKET
  // ===================================================

  const handleSocketEvent = useCallback(
    (data) => {
      // On ignore les événements qui concernent
      // un autre véhicule.
      if (String(data.vehicle_id) !== String(vehicleId)) {
        return;
      }

      // Mise à jour de l'inspection en temps réel.
      if (data.event === "inspection_updated") {
        setInspection(data.inspection ?? null);
      }

      // Mise à jour du reconditionnement en temps réel.
      if (data.event === "reconditioning_updated") {
        setReconditioning(data.reconditioning ?? null);
      }
    },
    [vehicleId]
  );

  useNotificationSocket(handleSocketEvent, !!user);

  // ===================================================
  // STATUTS CALCULÉS
  // ===================================================

  const inspectionStatus = inspection?.status;

  const reconditioningStatus = reconditioning?.status;

  // L'inspection est terminée lorsque son statut
  // est COMPLETED.
  const inspectionDone = inspectionStatus === STATUS.COMPLETED;

  // Le reconditionnement est en cours.
  const reconditioningRunning = reconditioningStatus === STATUS.IN_PROGRESS;

  // Le reconditionnement est terminé lorsque son statut
  // est COMPLETED ou APPROVED.
  const reconditioningFinished =
    reconditioningStatus === STATUS.COMPLETED ||
    reconditioningStatus === STATUS.APPROVED;

  // La validation finale est considérée comme terminée
  // lorsque le reconditionnement est APPROVED.
  const finalCheckDone = reconditioningStatus === STATUS.APPROVED;

  // Le véhicule est déjà publié.
  const isPublished = vehicle?.status === "PUBLISHED";

  // ===================================================
  // CONDITIONS D'ACTION
  // ===================================================

  // Le reconditionnement peut démarrer uniquement
  // après la fin de l'inspection.
  const canStartReconditioning =
    inspectionDone && !reconditioningRunning && !reconditioningFinished;

  // La validation finale peut démarrer uniquement
  // après la fin du reconditionnement.
  const canStartFinalCheck = reconditioningFinished && !finalCheckDone;

  // La publication peut démarrer uniquement
  // après la validation finale.
  const canPublishVehicle = finalCheckDone && !isPublished;

  // ===================================================
  // DÉMARRER L'INSPECTION
  // ===================================================

  const startInspection = async () => {
    setActionLoading("inspection");

    try {
      await apiFetch(`/admin/inspections/${vehicleId}/start`, {
        method: "POST",
      });

      toast.success("Inspection démarrée");

      // Recharge les informations depuis le backend.
      await loadVehicleLifecycle();
    } catch (err) {
      toast.error(err.message || "Erreur lors du lancement de l'inspection");
    } finally {
      setActionLoading(null);
    }
  };

  // ===================================================
  // DÉMARRER LE RECONDITIONNEMENT
  // ===================================================

  const startReconditioning = async () => {
    setActionLoading("reconditioning");

    try {
      await apiFetch(`/admin/reconditionings/${vehicleId}/start`, {
        method: "POST",
      });

      toast.success("Reconditionnement démarré");

      await loadVehicleLifecycle();
    } catch (err) {
      toast.error(
        err.message || "Erreur lors du lancement du reconditionnement"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ===================================================
  // VALIDATION FINALE
  // ===================================================

  const handleFinalCheck = async () => {
    setActionLoading("final-check");

    try {
      await apiFetch(`/admin/vehicles/${vehicleId}/final-check`, {
        method: "POST",
      });

      toast.success("Validation finale effectuée");

      await loadVehicleLifecycle();
    } catch (err) {
      toast.error(err.message || "Erreur lors de la validation finale");
    } finally {
      setActionLoading(null);
    }
  };

  // ===================================================
  // PUBLICATION DU VÉHICULE
  // ===================================================

  const publishVehicle = async () => {
    setActionLoading("publish");

    try {
      await apiFetch(`/admin/vehicles/${vehicleId}/publish`, {
        method: "POST",
      });

      toast.success("Véhicule publié");

      // Actualise les données du cycle de vie.
      await loadVehicleLifecycle();

      // Actualise également les données générales
      // du véhicule si une fonction est fournie.
      if (loadVehicle) {
        await loadVehicle();
      }
    } catch (err) {
      toast.error(err.message || "Erreur lors de la publication");
    } finally {
      setActionLoading(null);
    }
  };

  // ===================================================
  // CONFIGURATION DES ÉTAPES
  // ===================================================

  // useMemo permet de reconstruire la liste des étapes
  // uniquement lorsque leurs états changent.
  const steps = useMemo(
    () => [
      {
        number: 1,
        title: "Inspection technique",
        icon: <BsGear />,
        completed: inspectionDone,
        running: inspectionStatus === STATUS.IN_PROGRESS,
        waiting: !inspection,
      },

      {
        number: 2,
        title: "Reconditionnement",
        icon: <BsTools />,
        completed: reconditioningFinished,
        running: reconditioningRunning,
        waiting: !inspectionDone,
      },

      {
        number: 3,
        title: "Validation finale",
        icon: <BsShieldCheck />,
        completed: finalCheckDone,
        running: false,
        waiting: !reconditioningFinished,
      },

      {
        number: 4,
        title: "Publication",
        icon: <BsUpload />,
        completed: isPublished,
        running: false,
        waiting: !finalCheckDone,
      },
    ],
    [
      inspection,
      inspectionDone,
      inspectionStatus,
      reconditioningFinished,
      reconditioningRunning,
      finalCheckDone,
      isPublished,
    ]
  );

  // ===================================================
  // AFFICHAGE DU STATUT D'UNE ÉTAPE
  // ===================================================

  const renderStatus = (step) => {
    // Une étape terminée est prioritaire.
    if (step.completed) {
      return (
        <span className="text-success small">
          <BsCheckCircleFill className="me-1" />
          Terminée
        </span>
      );
    }

    // Affichage du statut pendant le traitement.
    if (step.running) {
      return (
        <span className="text-primary small">
          <BsClock className="me-1" />
          En cours...
        </span>
      );
    }

    // Étape bloquée en attente de l'étape précédente.
    if (step.waiting) {
      return <span className="text-muted small">En attente</span>;
    }

    // Étape disponible.
    return <span className="text-warning small">Prête à démarrer</span>;
  };

  // ===================================================
  // CHARGEMENT INITIAL
  // ===================================================

  if (loading) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>

          <p className="text-muted mt-3 mb-0">Chargement du cycle de vie...</p>
        </div>
      </div>
    );
  }

  // ===================================================
  // RENDU PRINCIPAL
  // ===================================================

  return (
    <div className="card border-0 shadow-sm rounded-4">
      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div className="card-header bg-white border-0 p-4">
        <div
          className="
            d-flex
            justify-content-between
            align-items-center
            gap-3
          "
        >
          <div>
            <h5 className="fw-bold mb-1">Cycle de vie du véhicule</h5>

            <p className="text-muted small mb-0">
              Inspection, reconditionnement et publication
            </p>
          </div>

          <span className="badge bg-light text-dark border">4 étapes</span>
        </div>
      </div>

      {/* =================================================
          STEPPER
      ================================================= */}

      <div className="card-body p-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`
              position-relative
              ${step.number < steps.length ? "pb-4" : ""}
            `}
          >
            {/* -------------------------------------------
                LIGNE VERTICALE ENTRE LES ÉTAPES
            ------------------------------------------- */}

            {step.number < steps.length && (
              <div
                className={`
                  position-absolute
                  ${step.completed ? "bg-success" : "bg-light"}
                `}
                style={{
                  width: "2px",
                  height: "calc(100% - 28px)",
                  left: "20px",
                  top: "40px",
                }}
              />
            )}

            <div className="d-flex gap-3">
              {/* -----------------------------------------
                  NUMÉRO DE L'ÉTAPE
              ----------------------------------------- */}

              <div
                className={`
                  rounded-circle
                  d-flex
                  align-items-center
                  justify-content-center
                  flex-shrink-0
                  ${
                    step.completed
                      ? "bg-success text-white"
                      : step.running
                        ? "bg-primary text-white"
                        : "bg-light text-secondary"
                  }
                `}
                style={{
                  width: "40px",
                  height: "40px",
                  zIndex: 1,
                }}
              >
                {step.completed ? <BsCheckCircleFill /> : step.number}
              </div>

              {/* -----------------------------------------
                  CONTENU DE L'ÉTAPE
              ----------------------------------------- */}

              <div className="flex-grow-1">
                <div
                  className="
                    d-flex
                    justify-content-between
                    align-items-start
                    gap-3
                  "
                >
                  <div>
                    <h6 className="fw-semibold mb-1">{step.title}</h6>

                    {renderStatus(step)}
                  </div>

                  <BsChevronRight className="text-muted mt-1" />
                </div>

                {/* =======================================
                    ÉTAPE 1 : INSPECTION
                ======================================= */}

                {step.number === 1 && (
                  <InspectionContent
                    inspection={inspection}
                    inspectionStatus={inspectionStatus}
                    onStart={startInspection}
                    loading={actionLoading === "inspection"}
                  />
                )}

                {/* =======================================
                    ÉTAPE 2 : RECONDITIONNEMENT
                ======================================= */}

                {step.number === 2 && (
                  <ReconditioningContent
                    inspectionDone={inspectionDone}
                    reconditioning={reconditioning}
                    reconditioningFinished={reconditioningFinished}
                    canStart={canStartReconditioning}
                    onStart={startReconditioning}
                    loading={actionLoading === "reconditioning"}
                  />
                )}

                {/* =======================================
                    ÉTAPE 3 : VALIDATION FINALE
                ======================================= */}

                {step.number === 3 && (
                  <FinalCheckContent
                    reconditioningFinished={reconditioningFinished}
                    finalCheckDone={finalCheckDone}
                    canStart={canStartFinalCheck}
                    onStart={handleFinalCheck}
                    loading={actionLoading === "final-check"}
                  />
                )}

                {/* =======================================
                    ÉTAPE 4 : PUBLICATION
                ======================================= */}

                {step.number === 4 && (
                  <PublicationContent
                    finalCheckDone={finalCheckDone}
                    isPublished={isPublished}
                    canPublish={canPublishVehicle}
                    onPublish={publishVehicle}
                    loading={actionLoading === "publish"}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// BOUTON D'ACTION RÉUTILISABLE
// =====================================================

function ActionButton({
  children,
  loading,
  onClick,
  variant = "primary",
  disabled = false,
}) {
  return (
    <button
      type="button"
      className={`
        btn
        btn-${variant}
        btn-sm
        rounded-pill
        px-3
      `}
      onClick={onClick}
      disabled={loading || disabled}
    >
      {/* Loader affiché pendant l'appel API. */}
      {loading && (
        <span
          className="
            spinner-border
            spinner-border-sm
            me-2
          "
          aria-hidden="true"
        />
      )}

      {children}
    </button>
  );
}

// =====================================================
// CONTENU DE L'INSPECTION
// =====================================================

function InspectionContent({ inspection, inspectionStatus, onStart, loading }) {
  // -----------------------------------------------
  // AUCUNE INSPECTION
  // -----------------------------------------------

  if (!inspection) {
    return (
      <div className="mt-3">
        <p className="text-muted small mb-3">
          Aucune inspection n'a encore été lancée.
        </p>

        <ActionButton variant="warning" onClick={onStart} loading={loading}>
          Lancer l'inspection
        </ActionButton>
      </div>
    );
  }

  // -----------------------------------------------
  // INSPECTION EN ÉCHEC
  // -----------------------------------------------

  if (inspectionStatus === STATUS.FAILED) {
    return (
      <div className="alert alert-danger mt-3 mb-0 py-2">
        Échec de l'inspection.
      </div>
    );
  }

  // -----------------------------------------------
  // INSPECTION EN COURS
  // -----------------------------------------------

  if (inspectionStatus !== STATUS.COMPLETED) {
    return (
      <p className="text-muted small mt-3 mb-0">
        Analyse technique en cours...
      </p>
    );
  }

  // -----------------------------------------------
  // SCORES DE L'INSPECTION
  // -----------------------------------------------

  const scores = [
    {
      label: "Moteur",
      value: inspection.engine_score,
    },

    {
      label: "Freins",
      value: inspection.brakes_score,
    },

    {
      label: "Pneus",
      value: inspection.tires_score,
    },

    {
      label: "Électronique",
      value: inspection.electronics_score,
    },

    {
      label: "Sécurité",
      value: inspection.safety_score,
    },
  ];

  return (
    <div className="mt-3">
      <div className="row g-2">
        {scores.map((score) => (
          <div key={score.label} className="col-6 col-lg-4">
            <div className="bg-light rounded-3 p-3">
              <div className="text-muted small mb-1">{score.label}</div>

              <div className="fw-bold">
                {score.value ?? "—"}

                <span className="text-muted small"> / 100</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------
          DÉFAUTS DÉTECTÉS
      --------------------------------------------- */}

      {inspection.failures?.length > 0 && (
        <div className="alert alert-danger mt-3 mb-0">
          <strong className="small">Défauts détectés</strong>

          <ul className="small mb-0 mt-2">
            {inspection.failures.map((failure, index) => (
              <li key={index}>{failure}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// =====================================================
// CONTENU DU RECONDITIONNEMENT
// =====================================================

function ReconditioningContent({
  inspectionDone,
  reconditioning,
  reconditioningFinished,
  canStart,
  onStart,
  loading,
}) {
  // -----------------------------------------------
  // INSPECTION NON TERMINÉE
  // -----------------------------------------------

  if (!inspectionDone) {
    return (
      <p className="text-muted small mt-3 mb-0">
        L'inspection doit être terminée avant de démarrer le reconditionnement.
      </p>
    );
  }

  // -----------------------------------------------
  // RECONDITIONNEMENT NON DÉMARRÉ
  // -----------------------------------------------

  if (!reconditioning) {
    return (
      <div className="mt-3">
        <p className="text-muted small mb-3">
          Le reconditionnement peut maintenant être lancé.
        </p>

        <ActionButton
          variant="warning"
          onClick={onStart}
          loading={loading}
          disabled={!canStart}
        >
          Lancer le reconditionnement
        </ActionButton>
      </div>
    );
  }

  // -----------------------------------------------
  // RECONDITIONNEMENT EN COURS
  // -----------------------------------------------

  if (!reconditioningFinished) {
    return (
      <p className="text-primary small mt-3 mb-0">
        Travaux de reconditionnement en cours...
      </p>
    );
  }

  // -----------------------------------------------
  // RÉSULTAT DU RECONDITIONNEMENT
  // -----------------------------------------------

  return (
    <div className="bg-light rounded-3 p-3 mt-3">
      <div className="row g-3">
        {/* COÛT ESTIMÉ */}
        <div className="col-sm-6">
          <div className="text-muted small">Coût estimé</div>

          <div className="fw-semibold">{reconditioning.cost ?? "—"} €</div>
        </div>

        {/* DURÉE ESTIMÉE */}
        <div className="col-sm-6">
          <div className="text-muted small">Durée estimée</div>

          <div className="fw-semibold">
            {reconditioning.duration_days ?? "—"}{" "}
            {reconditioning.duration_days > 1 ? "jours" : "jour"}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------
          TRAVAUX DE RECONDITIONNEMENT
      --------------------------------------------- */}

      {reconditioning.tasks?.length > 0 && (
        <div className="mt-3 pt-3 border-top">
          <div className="fw-semibold small mb-2">
            Travaux réalisés ou prévus
          </div>

          <ul className="list-unstyled small mb-0">
            {reconditioning.tasks.map((task, index) => {
              const taskInfo = TASKS[task];

              return (
                <li key={index} className="mb-2">
                  <i
                    className={`
                        bi
                        ${taskInfo?.icon ?? "bi-tools"}
                        me-2
                      `}
                  />

                  {taskInfo?.label ?? task}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// =====================================================
// CONTENU DE LA VALIDATION FINALE
// =====================================================

function FinalCheckContent({
  reconditioningFinished,
  finalCheckDone,
  canStart,
  onStart,
  loading,
}) {
  // -----------------------------------------------
  // RECONDITIONNEMENT NON TERMINÉ
  // -----------------------------------------------

  if (!reconditioningFinished) {
    return (
      <p className="text-muted small mt-3 mb-0">
        Le reconditionnement doit être terminé avant la validation finale.
      </p>
    );
  }

  // -----------------------------------------------
  // VALIDATION DÉJÀ EFFECTUÉE
  // -----------------------------------------------

  if (finalCheckDone) {
    return (
      <p className="text-success small mt-3 mb-0">
        <BsCheckCircleFill className="me-1" />
        Véhicule validé et prêt à être publié.
      </p>
    );
  }

  // -----------------------------------------------
  // BOUTON DE VALIDATION
  // -----------------------------------------------

  return (
    <div className="mt-3">
      <p className="text-muted small mb-3">
        Le véhicule peut maintenant être validé.
      </p>

      <ActionButton
        variant="success"
        onClick={onStart}
        loading={loading}
        disabled={!canStart}
      >
        Valider le véhicule
      </ActionButton>
    </div>
  );
}

// =====================================================
// CONTENU DE LA PUBLICATION
// =====================================================

function PublicationContent({
  finalCheckDone,
  isPublished,
  canPublish,
  onPublish,
  loading,
}) {
  // -----------------------------------------------
  // VALIDATION FINALE NON EFFECTUÉE
  // -----------------------------------------------

  if (!finalCheckDone) {
    return (
      <p className="text-muted small mt-3 mb-0">
        La validation finale est nécessaire avant de publier le véhicule.
      </p>
    );
  }

  // -----------------------------------------------
  // VÉHICULE DÉJÀ PUBLIÉ
  // -----------------------------------------------

  if (isPublished) {
    return (
      <p className="text-success small mt-3 mb-0">
        <BsCheckCircleFill className="me-1" />
        Véhicule publié et visible par les clients.
      </p>
    );
  }

  // -----------------------------------------------
  // BOUTON DE PUBLICATION
  // -----------------------------------------------

  return (
    <div className="mt-3">
      <p className="text-muted small mb-3">
        Le véhicule est prêt à être publié.
      </p>

      <ActionButton
        variant="primary"
        onClick={onPublish}
        loading={loading}
        disabled={!canPublish}
      >
        Publier le véhicule
      </ActionButton>
    </div>
  );
}
