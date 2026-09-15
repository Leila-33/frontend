import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import apiFetch from "../services/apiFetch";
import useNotificationSocket from "./useNotificationSocket";

export default function InspectionStepper({
  vehicle,
  setVehicle,
  vehicleId,
  user,
  loadVehicle,

}) {
  const [inspection, setInspection] = useState(null);
  const [reconditioning, setReconditioning] = useState(null);

  // =========================
  // LOAD LIFECYCLE
  // =========================
  const loadVehicleLifecycle = useCallback(async () => {
    if (!vehicleId) return;

    try {
      const data = await apiFetch(
        `/admin/vehicles/${vehicleId}/lifecycle`,
        {
          method: "GET",
        }
      );

      setInspection(data.inspection || null);
      setReconditioning(data.reconditioning || null);

    } catch {
      setInspection(null);
      setReconditioning(null);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadVehicleLifecycle();
  }, [loadVehicleLifecycle]);

  // =========================
  // START INSPECTION
  // =========================
  const startInspection = async () => {
    try {
      await apiFetch(
        `/admin/inspections/${vehicleId}/start`,
        {
          method: "POST",
        }
      );

      toast.success("Inspection démarrée");

      setInspection(prev => ({
        ...prev,
        status: "PENDING"
      }));

    } catch (err) {
      toast.error(err.message || "Erreur lancement inspection");
    }
  };

  // =========================
  // START RECONDITIONING
  // =========================
  const startReconditioning = async () => {
    try {
      await apiFetch(
        `/admin/reconditionings/${vehicleId}/start`,
        {
          method: "POST",
        }
      );

      toast.success("Reconditionnement démarré");

      setReconditioning(prev => ({
        ...prev,
        status: "PENDING"
      }));

    } catch (err) {
      toast.error(err.message || "Erreur reconditionnement");
    }
  };

  // =========================
  // WEBSOCKET INSPECTION
  // =========================
useNotificationSocket(user?.id, (data) => {

  console.log("WS GLOBAL:", data);

  if (data.vehicle_id !== vehicleId) return;

  switch (data.event) {

    case "inspection_updated":
      console.log("INSPECTION UPDATE");
      setInspection(data.inspection);
      break;

    case "reconditioning_updated":
      console.log("RECONDITIONING UPDATE");
      setReconditioning(data.reconditioning);
      break;

    default:
      break;
  }
});
  // =========================
  // STATUS
  // =========================
  const inspectionStatus = inspection?.status;
  const reconditioningStatus = reconditioning?.status;
  const inspectionDone = inspectionStatus === "COMPLETED";

  const reconditioningRunning = reconditioningStatus === "IN_PROGRESS";
  const reconditioningDone = reconditioningStatus === "COMPLETED";
const finalCheckDone = reconditioning?.status === "APPROVED";


const canStartReconditioning =
  inspectionDone &&
  !reconditioningRunning &&
  !reconditioningDone &&
  !finalCheckDone;
  
const isReconditioningFinished =
  reconditioningStatus === "COMPLETED" ||
  reconditioningStatus === "APPROVED";

const canStartFinalCheck =
  isReconditioningFinished &&
  !finalCheckDone;

const isPublished =
  vehicle?.status === "PUBLISHED";

const canPublishVehicle =
  finalCheckDone && !isPublished;

const publishVehicle = async () => {
  try {
    const updatedVehicle = await apiFetch(
      `/admin/vehicles/${vehicleId}/publish`,
      {
        method: "POST",
      }
    );

    toast.success("Véhicule publié");

    loadVehicle();

  } catch (err) {
    toast.error(err.message || "Erreur publication");
  }
};

const TASKS = {
  ENGINE_DIAG: {
    label: "Diagnostic moteur",
    icon: "bi-gear"
  },
  BRAKES_REPLACE: {
    label: "Remplacement des freins",
    icon: "bi-disc"
  },
  TIRES_REPLACE: {
    label: "Remplacement des pneus",
    icon: "bi-circle"
  },
  ELECTRONICS_DIAG: {
    label: "Diagnostic électronique",
    icon: "bi-cpu"
  },
  SAFETY_COMPLIANCE: {
    label: "Mise en conformité sécurité",
    icon: "bi-shield-check"
  },
  NO_REPAIR_NEEDED: {
    label: "Aucune réparation nécessaire",
    icon: "bi-check-circle"
  }
};


// =========================
  const handleFinalCheck = async () => {
    try {
      await apiFetch(
        `/admin/vehicles/${vehicleId}/final-check`,
        {
          method: "POST",
        }
      );

      toast.success("Final check fait");

      setReconditioning(prev => ({
        ...prev,
        status: "APPROVED"
      }));


    } catch (err) {
      toast.error(err.message || "Erreur final check");
    }
  };

 
  return (
    <div className="border rounded-4 p-4 bg-white">

      <h5 className="fw-bold mb-4">
        Inspection véhicule
      </h5>

      {/* ================= STEP 1 ================= */}
      <div className="d-flex align-items-center gap-3 mb-4">

  <div
    className={`rounded-circle d-flex align-items-center justify-content-center ${
      inspectionDone
        ? "bg-success text-white"
        : inspectionStatus === "IN_PROGRESS"
        ? "bg-warning text-white"
        : "bg-light"
    }`}
    style={{ width: 40, height: 40 }}
  >
    1
  </div>

  <div className="flex-grow-1">

    <div className="fw-semibold">
      Inspection technique
    </div>
{!inspection && (
  <small className="text-muted">
    Aucune inspection lancée
  </small>
)}
    {inspectionStatus === "PENDING" && (
      <small className="text-muted">
        Non démarrée
      </small>
    )}

    {inspectionStatus === "IN_PROGRESS" && (
      <small className="text-warning">
        Analyse en cours...
      </small>
    )}

    {inspectionStatus === "COMPLETED" && (
      <small className="text-success">
        Terminée
      </small>
    )}

    {inspectionStatus === "FAILED" && (
      <small className="text-danger">
        Échec inspection
      </small>
    )}

  </div>

  {!inspection && (
    <button
      className="btn btn-warning btn-sm"
      onClick={startInspection}
    >
      Lancer inspection
    </button>
  )}
 {/* RESULTAT INSPECTION */}

        {inspection && inspectionStatus === "COMPLETED" && (
          <div className="mt-3 border rounded p-3 bg-light">

            <div className="row g-2">

              <div className="col-md-4">
                Moteur : {inspection.engine_score}/100
              </div>

              <div className="col-md-4">
                Freins : {inspection.brakes_score}/100
              </div>

              <div className="col-md-4">
                Pneus : {inspection.tires_score}/100
              </div>

              <div className="col-md-4">
                Électronique : {inspection.electronics_score}/100
              </div>

              <div className="col-md-4">
                Sécurité : {inspection.safety_score}/100
              </div>

            </div>

            {inspection.failures?.length > 0 && (
              <>
                <hr />

                <strong>Défauts détectés</strong>

                <ul className="mb-0">
                  {inspection.failures.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </>
            )}

          </div>
        )}
</div>

      {/* ================= STEP 2 ================= */}
    <div className="d-flex align-items-center gap-3 mb-4">

  <div
    className={`rounded-circle d-flex align-items-center justify-content-center ${
  isReconditioningFinished
    ? "bg-success text-white"
    : reconditioningRunning
    ? "bg-warning text-white"
    : "bg-light"
}`}
    style={{ width: 40, height: 40 }}
  >
    2
  </div>

  <div className="flex-grow-1">

    <div className="fw-semibold">
      Reconditionnement
    </div>

    {!inspectionDone && (
      <small className="text-muted">
        En attente inspection
      </small>
    )}

    {canStartReconditioning && (
      <small className="text-warning">
        Prêt à démarrer
      </small>
    )}

    {reconditioningRunning && (
      <small className="text-primary">
        Reconditionnement en cours...
      </small>
    )}

    {isReconditioningFinished && (
  <small className="text-success">
    Reconditionnement terminé
  </small>
)}
  </div>

  {!reconditioning && (
    <button
      className="btn btn-warning btn-sm"
      onClick={startReconditioning}
    >
      Lancer reconditionnement
    </button>
  )}
       {/* RESULTAT RECONDITIONNEMENT */}

       {isReconditioningFinished && (
  <div className="mt-3 border rounded p-3 bg-light">

    <div>
      Coût estimé : {reconditioning.cost} €
    </div>

    {reconditioning?.duration_days && (
  <div>
    Durée estimée : {reconditioning.duration_days}{" "}
    {reconditioning.duration_days > 1 ? "jours" : "jour"}
  </div>
)}

    <div>
      Statut : terminé
    </div>

    {reconditioning.tasks?.length > 0 && (
  <>
    <hr />

    <strong>Travaux à réaliser</strong>

    <ul className="mb-0">
  {reconditioning.tasks.map((task, i) => (
    <li key={i}>
      <i className={`bi ${TASKS[task]?.icon} me-2`} />
      {TASKS[task]?.label ?? task}
    </li>
  ))}
</ul>
  </>
)}

  </div>
)}

</div>
{/* ================= STEP 3 ================= */}

<div className="d-flex align-items-center gap-3 mb-4">

  <div
    className={`rounded-circle d-flex align-items-center justify-content-center ${
      finalCheckDone
        ? "bg-success text-white"
        : "bg-light"
    }`}
    style={{ width: 40, height: 40 }}
  >
    3
  </div>

  <div className="flex-grow-1">

    <div className="fw-semibold">
      Validation finale
    </div>

    {!isReconditioningFinished && (
      <small className="text-muted">
        En attente du reconditionnement
      </small>
    )}

    {canStartFinalCheck && (
      <small className="text-warning">
        Prêt à être validé
      </small>
    )}

    {finalCheckDone && (
      <small className="text-success">
        Véhicule prêt à la vente
      </small>
    )} 

  </div>

  {canStartFinalCheck && (
    <button
      className="btn btn-success btn-sm"
      onClick={handleFinalCheck}
    >
      Valider le véhicule
    </button>
  )}

</div>

{/* ================= STEP 4 ================= */}

<div className="d-flex align-items-center gap-3 mb-4">

  <div
    className={`rounded-circle d-flex align-items-center justify-content-center ${
      isPublished
        ? "bg-success text-white"
        : "bg-light"
    }`}
    style={{ width: 40, height: 40 }}
  >
    4
  </div>

  <div className="flex-grow-1">

    <div className="fw-semibold">
      Publication
    </div>

    {!finalCheckDone && (
      <small className="text-muted">
        En attente de validation finale
      </small>
    )}

    {canPublishVehicle && (
      <small className="text-warning">
        Prêt à être publié
      </small>
    )}

    {isPublished && (
      <small className="text-success">
        Véhicule publié et visible aux clients
      </small>
    )}

  </div>

  {canPublishVehicle && (
    <button
      className="btn btn-primary btn-sm"
      onClick={publishVehicle}
    >
      Publier le véhicule
    </button>
  )}

</div>
    </div>
  );
}