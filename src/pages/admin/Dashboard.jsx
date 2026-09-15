import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { EVENT_ICONS, DEFAULT_STATUS } from "../../utils/status";
import apiFetch from "../../services/apiFetch";
import { STATUS } from "../../utils/status";

// =========================
// FORMATAGE
// =========================

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("fr-FR");
};

const formatDateTime = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString("fr-FR");
};

const getEventIcon = (type) => {
  return EVENT_ICONS[type] || "bi-bell";
};

// =========================
// CARTE DE STATISTIQUE
// =========================

function StatCard({ title, value, icon, color }) {
  return (
    <div className="col-md-4 col-xl-2">
      <div className="card border-0 shadow-sm rounded-4 h-100">
        <div className="card-body p-4 d-flex justify-content-between align-items-center">
          <div>
            <div className="text-muted small">
              {title}
            </div>

            <div className="fs-3 fw-bold">
              {value ?? 0}
            </div>
          </div>

          <div className={`text-${color} fs-2`}>
            <i className={`bi ${icon}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================
// DASHBOARD ADMIN
// =========================

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    active: 0,
    rejected: 0,
    archived: 0,
    thisWeek: 0,
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);

  // =========================
  // CHARGEMENT DU DASHBOARD
  // =========================

  const fetchDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const data = await apiFetch("/admin/dashboard");

      const dashboardStats = data?.stats || {};

      setStats({
        totalApplications:
          dashboardStats.total_applications ?? 0,

        pending:
          dashboardStats.pending_applications ?? 0,

        active:
          dashboardStats.active_applications ?? 0,

        rejected:
          dashboardStats.rejected_applications ?? 0,

        archived:
          dashboardStats.archived_applications ?? 0,

        thisWeek:
          dashboardStats.applications_this_week ?? 0,
      });

      setRecentApplications(
        Array.isArray(data?.recent_applications)
          ? data.recent_applications
          : []
      );

      setRecentEvents(
        Array.isArray(data?.recent_events)
          ? data.recent_events
          : []
      );
    } catch (err) {
      console.error("fetchDashboard error:", err);

      toast.error(
        err?.message ||
        "Erreur lors du chargement du tableau de bord"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // CHARGEMENT INITIAL
  // =========================

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="container py-4">

      {/* =========================
          HEADER
      ========================= */}

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Tableau de bord Admin
          </h2>

          <p className="text-muted mb-0">
            Vue globale de l’activité
          </p>
        </div>

        <button
          type="button"
          className="btn btn-light border rounded-pill"
          onClick={fetchDashboard}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Actualisation...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-2" />
              Actualiser
            </>
          )}
        </button>

      </div>

      {/* =========================
          STATISTIQUES
      ========================= */}

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
          title="Actifs"
          value={stats.active}
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

      {/* =========================
          CONTENU PRINCIPAL
      ========================= */}

      <div className="row g-4">

        {/* =========================
            DOSSIERS RÉCENTS
        ========================= */}

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-3">

                <h5 className="fw-semibold mb-0">
                  Dossiers récents
                </h5>

                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-pill"
                  onClick={() =>
                    navigate("/admin/applications")
                  }
                >
                  Voir tout
                </button>

              </div>

              {loading ? (
                <div className="text-center py-5 text-muted">
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />

                  Chargement...
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-folder-x fs-2 d-block mb-2" />

                  <div className="small">
                    Aucun dossier récent
                  </div>
                </div>
              ) : (
                <div className="table-responsive">

                  <table className="table align-middle mb-0">

                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Statut</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>

                      {recentApplications.map((app) => {

                        const status =
                          STATUS[app.status] ||
                          DEFAULT_STATUS;

                        return (
                          <tr
                            key={app.id}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              navigate(
                                `/admin/applications/${app.id}`
                              )
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                navigate(
                                  `/admin/applications/${app.id}`
                                );
                              }
                            }}
                            style={{
                              cursor: "pointer",
                            }}
                          >

                            <td className="fw-semibold">
                              #{app.id?.slice(0, 8) || "-"}
                            </td>

                            <td>
                              {app.first_name || ""}{" "}
                              {app.last_name || ""}
                            </td>

                            <td>
                              <span
                                className={`badge bg-${status.color}`}
                              >
                                {status.label}
                              </span>
                            </td>

                            <td className="text-muted">
                              {formatDate(app.created_at)}
                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* =========================
            ACTIONS RAPIDES
        ========================= */}

        <div className="col-lg-4">

          <div className="card border-0 shadow-sm rounded-4 h-100">

            <div className="card-body p-4">

              <h5 className="fw-semibold mb-3">
                Actions rapides
              </h5>

              <button
                type="button"
                className="btn btn-primary w-100 mb-2"
                onClick={() =>
                  navigate("/admin/applications")
                }
              >
                <i className="bi bi-folder me-2" />
                Gérer les dossiers
              </button>

              <button
                type="button"
                className="btn btn-outline-primary w-100 mb-2"
                onClick={() =>
                  navigate("/admin/vehicles")
                }
              >
                <i className="bi bi-car-front me-2" />
                Gérer les véhicules
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() =>
                  navigate("/admin/options")
                }
              >
                <i className="bi bi-list-check me-2" />
                Gérer les options
              </button>

            </div>

          </div>

        </div>

        {/* =========================
            ACTIVITÉ RÉCENTE
        ========================= */}

        <div className="col-12">

          <div className="card border-0 shadow-sm rounded-4">

            <div className="card-body p-4">

              <h5 className="fw-semibold mb-3">
                Activité récente
              </h5>

              {loading ? (
                <div className="text-center py-4 text-muted">

                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />

                  Chargement...
                </div>
              ) : recentEvents.length === 0 ? (
                <div className="text-muted small">
                  Aucun événement récent.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">

                  {recentEvents.map((event) => (

                    <div
                      key={event.id}
                      className="d-flex gap-3 align-items-start"
                    >

                      {/* Icône associée au type d'événement */}
                      <div
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "40px",
                          height: "40px",
                        }}
                      >
                        <i
                          className={`bi ${getEventIcon(
                            event.type
                          )}`}
                        />
                      </div>

                      {/* Informations de l'événement */}
                      <div className="flex-grow-1">

                        <div className="small fw-semibold">
                          {event.message ||
                            "Événement système"}
                        </div>

                        <div className="text-muted small">
                          {formatDateTime(
                            event.created_at
                          )}
                        </div>

                      </div>

                    </div>

                  ))}

                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}