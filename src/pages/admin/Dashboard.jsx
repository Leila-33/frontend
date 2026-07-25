import { useEffect, useState } from "react";
import apiFetch from "../../services/apiFetch";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { STATUS } from "../../utilis/status";

export default function AdminDashboard() {

  const navigate = useNavigate();
const [recentEvents, setRecentEvents] = useState([]);
  const [stats, setStats] = useState({
    total_applications: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    archived: 0,
    draft: 0
  });

  const [recentApplications, setRecentApplications] = useState([]);

  // =========================
  // FETCH DASHBOARD
  // =========================
const fetchDashboard = async () => {
  try {
    const data = await apiFetch("/admin/dashboard", {
    });

    setStats({
      totalApplications: data.stats.total_applications,
      pending: data.stats.pending_applications,
      approved: data.stats.approved_applications,
      rejected: data.stats.rejected_applications,
      archived: data.stats.archived_applications,
      thisWeek: data.stats.applications_this_week
    });

    setRecentApplications(data.recent_applications || []);
    setRecentEvents(data.recent_events || []);

  } catch (err) {
    console.error(err);
    toast.error("Erreur dashboard");
  }
};

  useEffect(() => {
    fetchDashboard();
  }, []);


function getEventIcon(type) {
  const map = {
    application_created: "bi-plus-circle",
    application_submitted: "bi-send",
    application_approved: "bi-check-circle",
    application_rejected: "bi-x-circle",
    application_archived: "bi-archive",
    application_restored: "bi-arrow-counterclockwise",
    document_validated: "bi-file-check",
    document_rejected: "bi-file-x"
  };

  return map[type] || "bi-bell";
}
  // =========================
  // UI CARD
  // =========================
  const StatCard = ({ title, value, icon, color }) => (
    <div className="col-md-3">

      <div className="card border-0 shadow-sm rounded-4">

        <div className="card-body p-4 d-flex justify-content-between align-items-center">

          <div>
            <div className="text-muted small">{title}</div>
            <div className="fs-3 fw-bold">{value ?? 0}</div>
          </div>

          <div className={`text-${color} fs-2`}>
            <i className={`bi ${icon}`}></i>
          </div>

        </div>

      </div>

    </div>
  );

  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Dashboard Admin</h2>
        <p className="text-muted">Vue globale de l’activité</p>
      </div>

      {/* STATS */}
      <div className="row g-3 mb-4">

    <StatCard
  title="Total dossiers"
  value={stats.totalApplications}
  icon="bi-folder"
  color="primary"
/>

<StatCard
  title="En attente"
  value={stats.pending}
  icon="bi-clock"
  color="warning"
/>

<StatCard
  title="Validés"
  value={stats.approved}
  icon="bi-check-circle"
  color="success"
/>

<StatCard
  title="Refusés"
  value={stats.rejected}
  icon="bi-x-circle"
  color="danger"
/>

<StatCard
  title="Archivés"
  value={stats.archived}
  icon="bi-archive"
  color="secondary"
/>

<StatCard
  title="Cette semaine"
  value={stats.thisWeek}
  icon="bi-graph-up"
  color="info"
/>
      </div>

      {/* RECENTS */}
      <div className="row g-4">

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between mb-3">

                <h5 className="fw-semibold">Dossiers récents</h5>

                <button
                  className="btn btn-light btn-sm rounded-pill"
                  onClick={() => navigate("/admin/applications")}
                >
                  Voir tout
                </button>

              </div>

              <div className="table-responsive">

                <table className="table align-middle">

                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Client</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>

                    {(recentApplications || []).map(app => (

                      <tr
                        key={app.id}
                        onClick={() =>
                          navigate(`/admin/applications/${app.id}`)
                        }
                        style={{ cursor: "pointer" }}
                      >

                        <td className="fw-semibold">
                          #{app.id.slice(0, 8)}
                        </td>

                        <td>
                          {app.first_name} {app.last_name}
                        </td>

                        <td>
                          <span
                                                    className={`badge bg-${STATUS[app.status]?.color}`}
                                                  >
                                                    {STATUS[app.status]?.label}
                                                  </span>
                        </td>

                        <td className="text-muted">
                          {app.created_at
                            ? new Date(app.created_at).toLocaleDateString()
                            : "-"}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </div>

        {/* QUICK ACTIONS */}
        <div className="col-lg-4">

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-4">

              <h5 className="fw-semibold mb-3">
                Actions rapides
              </h5>

              <button
                className="btn btn-primary w-100 mb-2"
                onClick={() => navigate("/admin/applications")}
              >
                Gérer les dossiers
              </button>

              <button
                className="btn btn-outline-primary w-100 mb-2"
                onClick={() => navigate("/admin/vehicles")}
              >
                Gérer les véhicules
              </button>

              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => navigate("/admin/options")}
              >
                Gérer les options
              </button>

            </div>

          </div>

        </div>

        {/* RECENT EVENTS */}
<div className="card border-0 shadow-sm rounded-4 mt-4">

  <div className="card-body p-4">

    <h5 className="fw-semibold mb-3">
      Activité récente
    </h5>

    <div className="d-flex flex-column gap-3">

      {recentEvents.length === 0 && (
        <div className="text-muted small">
          Aucun événement
        </div>
      )}

      {recentEvents.map((event) => (
        <div
          key={event.id}
          className="d-flex gap-2 align-items-start"
        >

          {/* ICON */}
          <div className="mt-1">
            <i
              className={`bi ${
                getEventIcon(event.type)
              }`}
            />
          </div>

          {/* CONTENT */}
          <div className="flex-grow-1">

            <div className="small fw-semibold">
              {event.message}
            </div>

            <div className="text-muted small">
              {new Date(event.created_at).toLocaleString()}
            </div>

          </div>

        </div>
      ))}

    </div>

  </div>

</div>

      </div>

    </div>
  );
}