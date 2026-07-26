import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiFetch from "../../services/apiFetch";
import { STATUS } from "../../utils/status";

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [testDrives, setTestDrives] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // =========================
  // LOAD
  // =========================
  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const [
          applicationsRes,
          testDrivesRes,
          notificationsRes
        ] = await Promise.all([
          apiFetch("/applications/me"),
          apiFetch("/test-drives/me"),
          apiFetch("/notifications/me")
        ]);

        setApplications(applicationsRes);
        setTestDrives(testDrivesRes);
        setNotifications(notificationsRes);

      } catch (err) {
        console.log(err);
      }
    };

    fetchDashboard();

  }, []);

  // =========================
  // STATS
  // =========================
  const pendingApplications = (applications?.items || []).filter(
    a => a.status === "pending"
  ).length;

  const approvedApplications = (applications?.items || []).filter(
    a => a.status === "approved"
  ).length;

  const unreadNotifications = notifications.filter(
    n => n.status !== "read"
  ).length;

  const upcomingTestDrive = testDrives.find(
    td =>
      td.status === "confirmed" &&
      new Date(td.appointment_date) > new Date()
  );



  return (
    <div
      className="container py-4"
      style={{ maxWidth: 1400 }}
    >

      {/* ================= HERO ================= */}
      <div
        className="p-4 p-lg-5 rounded-5 mb-4 text-white position-relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #111 0%, #1f1f1f 100%)"
        }}
      >

        <div className="position-relative">

          <div className="d-flex align-items-center gap-3 mb-3">

            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-white text-dark"
              style={{
                width: 60,
                height: 60,
                fontSize: 28
              }}
            >
              <i className="bi bi-speedometer2"></i>
            </div>

            <div>
              <h2 className="fw-bold mb-1">
                Tableau de bord
              </h2>

              <p className="mb-0 text-light opacity-75">
                Gérez vos dossiers et vos essais routiers
              </p>
            </div>

          </div>

          <div className="d-flex flex-wrap gap-3 mt-4">

            <Link
              to="/search"
              className="btn btn-light rounded-pill px-4"
            >
              <i className="bi bi-search me-2"></i>
              Rechercher un véhicule
            </Link>

            <Link
              to="/applications"
              className="btn btn-outline-light rounded-pill px-4"
            >
              <i className="bi bi-folder2-open me-2"></i>
              Mes dossiers
            </Link>

          </div>

        </div>

      </div>

      {/* ================= STATS ================= */}
      <div className="row g-4 mb-4">

        {/* DOSSIERS */}
        <div className="col-md-4">

          <div className="card border-0 shadow-sm rounded-5 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted fw-semibold">
                    DOSSIERS ACTIFS
                  </small>

                  <h2 className="fw-bold mt-2 mb-0">
                    {applications.total}
                  </h2>

                </div>

                <div
                  className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center"
                  style={{
                    width: 60,
                    height: 60,
                    fontSize: 24
                  }}
                >
                  <i className="bi bi-folder2-open"></i>
                </div>

              </div>

              <div className="mt-4">

                <small className="text-muted">
                  {pendingApplications} en attente
                </small>

              </div>

            </div>

          </div>

        </div>

        {/* APPROUVÉS */}
        <div className="col-md-4">

          <div className="card border-0 shadow-sm rounded-5 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted fw-semibold">
                    DOSSIERS APPROUVÉS
                  </small>

                  <h2 className="fw-bold mt-2 mb-0">
                    {approvedApplications}
                  </h2>

                </div>

                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                  style={{
                    width: 60,
                    height: 60,
                    fontSize: 24
                  }}
                >
                  <i className="bi bi-check2-circle"></i>
                </div>

              </div>

              <div className="mt-4">

                <small className="text-success">
                  Financements validés
                </small>

              </div>

            </div>

          </div>

        </div>

        {/* NOTIFS */}
        <div className="col-md-4">

          <div className="card border-0 shadow-sm rounded-5 h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted fw-semibold">
                    NOTIFICATIONS
                  </small>

                  <h2 className="fw-bold mt-2 mb-0">
                    {unreadNotifications}
                  </h2>

                </div>

                <div
                  className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center"
                  style={{
                    width: 60,
                    height: 60,
                    fontSize: 24
                  }}
                >
                  <i className="bi bi-bell-fill"></i>
                </div>

              </div>

              <div className="mt-4">

                <small className="text-muted">
                  Non lues
                </small>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================= CONTENT ================= */}
      <div className="row g-4">

        {/* ================= LEFT ================= */}
        <div className="col-lg-8">

          {/* TEST DRIVE */}
          <div className="card border-0 shadow-sm rounded-5 mb-4">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <h5 className="fw-bold mb-0">
                  <i className="bi bi-car-front-fill me-2"></i>
                  Prochain essai routier
                </h5>

                <Link
                  to="/test-drives"
                  className="btn btn-sm btn-outline-dark rounded-pill"
                >
                  Voir tout
                </Link>

              </div>

              {!upcomingTestDrive && (

                <div className="text-center py-5 text-muted">

                  <i
                    className="bi bi-calendar-x"
                    style={{ fontSize: 40 }}
                  ></i>

                  <p className="mt-3 mb-0">
                    Aucun essai confirmé
                  </p>

                </div>

              )}

              {upcomingTestDrive && (

                <div
                  className="p-4 rounded-5"
                  style={{
                    background: "#f8f9fa"
                  }}
                >

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                    <div>

                      <h4 className="fw-bold mb-2">

                        {upcomingTestDrive.vehicle?.brand}{" "}
                        {upcomingTestDrive.vehicle?.model}

                      </h4>

                      <div className="text-muted">

                        <i className="bi bi-calendar-event me-2"></i>

                        {new Date(
                          upcomingTestDrive.appointment_date
                        ).toLocaleString()}

                      </div>

                    </div>

                    <Link
                      to={`/test-drives/${upcomingTestDrive.id}`}
                      className="btn btn-dark rounded-pill px-4"
                    >
                      Voir détails
                    </Link>

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* APPLICATIONS */}
          <div className="card border-0 shadow-sm rounded-5">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <h5 className="fw-bold mb-0">
                  <i className="bi bi-folder-fill me-2"></i>
                  Mes dossiers
                </h5>

                <Link
                  to="/applications"
                  className="btn btn-sm btn-outline-dark rounded-pill"
                >
                  Voir tout
                </Link>

              </div>

              <div className="d-flex flex-column gap-3">
{applications?.items?.slice(0, 3).map(app => (

  <Link
    key={app.id}
    to={`/applications/${app.id}`}
    className="text-decoration-none text-dark"
  >

    <div
      className="p-4 rounded-5 border bg-white"
    >

      <div className="d-flex justify-content-between align-items-center">


        <div>


          <div className="fw-bold mb-2">

            Dossier #

            {
              app.id
              ?
              app.id.slice(0,8)
              :
              "N/A"
            }

          </div>


          <div className="small text-muted">

            <i className="bi bi-clock me-1"></i>


            {
              app.created_at
              &&
              new Date(
                app.created_at
              ).toLocaleDateString()
            }


          </div>


        </div>


        <span
          className={
            `badge rounded-pill px-3 py-2 bg-${
              STATUS[app.status]?.color
              ??
              "secondary"
            }`
          }
        >

          {
            STATUS[app.status]?.label
            ??
            app.status
          }

        </span>


      </div>


    </div>


  </Link>

))}
              </div>

            </div>

          </div>

        </div>

        {/* ================= RIGHT ================= */}
        <div className="col-lg-4">

          {/* QUICK ACTIONS */}
          <div className="card border-0 shadow-sm rounded-5 mb-4">

            <div className="card-body p-4">

              <h5 className="fw-bold mb-4">

                <i className="bi bi-lightning-charge-fill me-2"></i>
                Actions rapides

              </h5>

              <div className="d-grid gap-3">

                <Link
                  to="/search"
                  className="btn btn-dark rounded-pill py-3"
                >
                  <i className="bi bi-search me-2"></i>
                  Rechercher un véhicule
                </Link>

                <Link
                  to="/applications"
                  className="btn btn-outline-dark rounded-pill py-3"
                >
                  <i className="bi bi-folder2-open me-2"></i>
                  Voir mes dossiers
                </Link>

                <Link
                  to="/notifications"
                  className="btn btn-outline-dark rounded-pill py-3"
                >
                  <i className="bi bi-bell me-2"></i>
                  Notifications
                </Link>

              </div>

            </div>

          </div>

          {/* NOTIFICATIONS */}
          <div className="card border-0 shadow-sm rounded-5">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <h5 className="fw-bold mb-0">

                  <i className="bi bi-activity me-2"></i>
                  Activité récente

                </h5>

                <Link
                  to="/notifications"
                  className="small text-decoration-none"
                >
                  Tout voir
                </Link>

              </div>

              <div className="d-flex flex-column gap-4">

                {notifications.slice(0, 5).map(notif => (

                  <div
                    key={notif.id}
                    className="d-flex gap-3"
                  >

                    <div
                      className={`
                        rounded-circle
                        d-flex
                        align-items-center
                        justify-content-center
                        ${notif.status !== "read"
                          ? "bg-warning"
                          : "bg-light"
                        }
                      `}
                      style={{
                        width: 42,
                        height: 42,
                        flexShrink: 0
                      }}
                    >

                      <i className="bi bi-bell-fill"></i>

                    </div>

                    <div>

                      <div className="fw-semibold">
                        {notif.title}
                      </div>

                      <div className="small text-muted">
                        {notif.message}
                      </div>

                      <div className="small text-muted mt-1">
                        {new Date(
                          notif.created_at
                        ).toLocaleString()}
                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}