import { useEffect, useState } from "react";
import apiFetch from "../../services/apiFetch";
import { toast } from "react-toastify";
import {useNavigate} from "react-router-dom";

export default function AdminTestDrives() {
  const navigate = useNavigate();

  const [testDrives, setTestDrives] = useState([]);

  const [selected, setSelected] = useState(null);
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null // confirm | reject | cancel | complete
  });

  // =========================
  // FETCH DATA
  // =========================
  const fetchTestDrives = async () => {
    try {
      const data = await apiFetch("/admin/test-drives", {
        method: "GET",
      });

      setTestDrives(data);

    } catch (err) {
      toast.error("Erreur chargement des essais routiers");
    }
  };

  useEffect(() => {
    fetchTestDrives();
  }, []);

  // =========================
  // ACTION HANDLER
  // =========================
  const handleAction = async () => {

    if (!selected) return;

    try {

      await apiFetch(
        `/admin/test-drives/${selected.id}/status`,
        {
          method: "POST",
          body: {
            status: actionModal.type // "confirm" | "reject" | etc
          }
        }
      );

      toast.success("Action effectuée ✔");

      setActionModal({ open: false, type: null });
      setSelected(null);

      fetchTestDrives();

    } catch (err) {
      toast.error(err?.data?.detail || "Erreur action");
    }
  };

  // =========================
  // STATUS BADGE
  // =========================
  const getBadge = (status) => {

    const map = {
      pending: "badge bg-warning text-dark",
      confirmed: "badge bg-primary",
      cancelled: "badge bg-danger",
      completed: "badge bg-success"
    };

    return map[status] || "badge bg-secondary";
  };

  return (
    <div className="container py-4">

      {/* =========================
          HEADER
      ========================= */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <h3 className="fw-bold">
          Test Drives Admin
        </h3>

      </div>

      {/* =========================
          TABLE
      ========================= */}
      <div className="card shadow-sm">

        <div className="card-body">

          <table className="table align-middle">

            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Véhicule</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {testDrives.map((td) => (

                <tr key={td.id}>

                  <td>
                    {td.user_name}
                  </td>

                  <td>
                    {td.vehicle_name}
                  </td>

                  <td>
                    {new Date(td.appointment_date)
                      .toLocaleString()}
                  </td>

                  <td>
                    <span className={getBadge(td.status)}>
                      {td.status}
                    </span>
                  </td>

                  <td className="d-flex gap-2">

                    {/* VIEW */}
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() =>
                        navigate(`/admin/test-drives/${td.id}`)
                      }
                    >
                      Voir
                    </button>

                    {/* CONFIRM */}
                    {td.status === "pending" && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => {
                          setSelected(td);
                          setActionModal({
                            open: true,
                            type: "confirmed"
                          });
                        }}
                      >
                        Confirmer
                      </button>
                    )}

                    {/* REJECT */}
                    {td.status === "pending" && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          setSelected(td);
                          setActionModal({
                            open: true,
                            type: "rejected"
                          });
                        }}
                      >
                        Refuser
                      </button>
                    )}

                    {/* CANCEL */}
                    {td.status === "confirmed" && (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => {
                          setSelected(td);
                          setActionModal({
                            open: true,
                            type: "cancelled"
                          });
                        }}
                      >
                        Annuler
                      </button>
                    )}

                    {/* COMPLETE */}
                    {td.status === "confirmed" && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSelected(td);
                          setActionModal({
                            open: true,
                            type: "completed"
                          });
                        }}
                      >
                        Terminer
                      </button>
                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================
          MODAL
      ========================= */}
      {actionModal.open && (

        <div className="modal d-block bg-dark bg-opacity-50">

          <div className="modal-dialog">

            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">
                  Confirmation
                </h5>
              </div>

              <div className="modal-body">

                <p>
                  Action :{" "}
                  <strong>
                    {actionModal.type}
                  </strong>
                </p>

                <p>
                  Utilisateur :{" "}
                  <strong>
                    {selected?.user_name}
                  </strong>
                </p>

                <p>
                  Véhicule :{" "}
                  <strong>
                    {selected?.vehicle_name}
                  </strong>
                </p>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setActionModal({
                      open: false,
                      type: null
                    })
                  }
                >
                  Annuler
                </button>

                <button
                  className={`btn ${actionModal.type === "reject"
                      ? "btn-danger"
                      : "btn-success"
                    }`}
                  onClick={handleAction}
                >
                  Confirmer
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}