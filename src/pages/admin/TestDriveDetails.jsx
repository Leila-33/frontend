import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiFetch from "../../services/apiFetch";
import { toast } from "react-toastify";

export default function TestDriveDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [testDrive, setTestDrive] = useState(null);

  // =========================
  // FETCH
  // =========================
  const fetchTestDrive = async () => {

    try {

      const data = await apiFetch(
        `/admin/test-drives/${id}`,
        {
          method: "GET"}
      );

      setTestDrive(data);

    } catch (err) {

      toast.error("Impossible de charger l’essai routier");

      navigate("/admin/test-drives");

    }
  };

  useEffect(() => {
    fetchTestDrive();
  }, [id]);

  // =========================
  // ACTION
  // =========================
  const updateStatus = async (action) => {

    try {

        await apiFetch(
        `/admin/test-drives/${id}/status`,
        {
          method: "POST",
          body: {
            status: action
          }
        }
      );

      toast.success("Statut mis à jour");

      fetchTestDrive();

    } catch (err) {
      toast.error("Erreur action");
    }
  };

  if (!testDrive) {
    return (
      <div className="container py-5 text-center text-muted">
        Chargement...
      </div>
    );
  }

  return (
    <div className="container py-4">

      {/* =========================
          HEADER (Stripe style)
      ========================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h3 className="fw-bold mb-1">
            Essai routier
          </h3>

          <small className="text-muted">
            ID #{testDrive.id}
          </small>
        </div>

        <span className={`badge px-3 py-2 ${
          testDrive.status === "pending"
            ? "bg-warning text-dark"
            : testDrive.status === "confirmed"
              ? "bg-primary"
              : testDrive.status === "completed"
                ? "bg-success"
                : "bg-danger"
        }`}>
          {testDrive.status}
        </span>

      </div>

      {/* =========================
          GRID LAYOUT
      ========================= */}
      <div className="row g-4">

        {/* LEFT */}
        <div className="col-lg-8">

          {/* =========================
              CARD USER
          ========================= */}
          <div className="card shadow-sm mb-3">

            <div className="card-body">

              <h6 className="text-muted mb-3">
                Client
              </h6>

              <div className="fw-bold">
                {testDrive.user_name}
              </div>

              <div className="text-muted">
                {testDrive.user_email}
              </div>

    
            </div>

          </div>

          {/* =========================
              VEHICLE
          ========================= */}
          <div className="card shadow-sm mb-3">

            <div className="card-body">

              <h6 className="text-muted mb-3">
                Véhicule
              </h6>

              <div className="fw-bold">
                {testDrive.vehicle_name}
              </div>

              <div className="text-muted">
                {testDrive.vehicle_price} €
              </div>
              <div className="text-muted">
                {testDrive.vehicle_license_plate}
              </div>

            </div>

          </div>

          {/* =========================
              APPOINTMENT
          ========================= */}
          <div className="card shadow-sm">

            <div className="card-body">

              <h6 className="text-muted mb-3">
                Rendez-vous
              </h6>

              <div className="fw-bold">
                {new Date(testDrive.appointment_date).toLocaleString()}
              </div>

              {testDrive.comment && (
                <p className="text-muted mt-2">
                  {testDrive.comment}
                </p>
              )}

            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="col-lg-4">

          {/* =========================
              ACTIONS (Stripe style)
          ========================= */}
          <div className="card shadow-sm mb-3">

            <div className="card-body">

              <h6 className="text-muted mb-3">
                Actions
              </h6>

              {testDrive.status === "pending" && (
                <>
                  <button
                    className="btn btn-success w-100 mb-2"
                    onClick={() => updateStatus("confirmed")}
                  >
                    Confirmer
                  </button>

                  <button
                    className="btn btn-danger w-100"
                    onClick={() => updateStatus("rejected")}
                  >
                    Refuser
                  </button>
                </>
              )}

              {testDrive.status === "confirmed" && (
                <>
                  <button
                    className="btn btn-warning w-100 mb-2"
                    onClick={() => updateStatus("cancelled")}
                  >
                    Annuler
                  </button>

                  <button
                    className="btn btn-primary w-100"
                    onClick={() => updateStatus("completed")}
                  >
                    Terminer
                  </button>
                </>
              )}

              {testDrive.status === "completed" && (
                <div className="text-success small">
                  Essai terminé ✔
                </div>
              )}

            </div>

          </div>

          {/* =========================
              TIMELINE (Stripe style)
          ========================= */}
          <div className="card shadow-sm">

            <div className="card-body">

              <h6 className="text-muted mb-3">
                Activité
              </h6>

              <ul className="list-unstyled">

                {testDrive.events?.map((event) => (
                  <li key={event.id} className="mb-3">

                    <div className="small fw-bold">
                      {event.type}
                    </div>

                    <div className="text-muted small">
                      {event.message}
                    </div>

                    <div className="text-muted" style={{ fontSize: "12px" }}>
                      {new Date(event.created_at).toLocaleString()}
                    </div>

                  </li>
                ))}

              </ul>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}