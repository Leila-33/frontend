import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiFetch from "../../services/apiFetch";
import { STATUS } from "../../utils/status";


/**
 * DashboardPage
 *
 * Tableau de bord de l'utilisateur connecté.
 *
 * Le dashboard récupère toutes ses données
 * depuis une seule route backend :
 *
 * GET /dashboard
 *
 * Le backend retourne :
 *
 * - total_applications
 * - active_applications
 * - approved_applications
 * - pending_applications
 * - applications
 * - upcoming_test_drive
 * - unread_notifications
 * - notifications
 *
 * Le frontend a donc uniquement pour responsabilité
 * d'afficher les données reçues.
 */
export default function DashboardPage() {

  /**
   * Données du dashboard retournées par l'API.
   *
   * Valeur initiale permettant d'éviter les erreurs
   * pendant le chargement.
   */
  const [dashboard, setDashboard] = useState({
    total_applications: 0,
    active_applications: 0,
    approved_applications: 0,
    pending_applications: 0,
    applications: [],
    upcoming_test_drive: null,
    unread_notifications: 0,
    notifications: [],
  });


  // ============================================================
  // CHARGEMENT DU DASHBOARD
  // ============================================================

  /**
   * Chargement des données du tableau de bord.
   */
  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const response = await apiFetch("/dashboard");

        setDashboard(response);

      } catch (err) {

        console.error(
          "Erreur lors du chargement du dashboard :",
          err
        );

      }
    };


    fetchDashboard();

  }, []);


  // ============================================================
  // DONNÉES DU DASHBOARD
  // ============================================================

  const {
    total_applications,
    active_applications,
    approved_applications,
    pending_applications,
    applications,
    upcoming_test_drive,
    unread_notifications,
    notifications,
  } = dashboard;


  // ============================================================
  // AFFICHAGE
  // ============================================================

  return (

    <div
      className="container py-4"
      style={{ maxWidth: 1400 }}
    >

      {/* ========================================================
          HERO / EN-TÊTE
          ======================================================== */}

      <div
        className="p-4 p-lg-5 rounded-5 mb-4 text-white position-relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #111 0%, #1f1f1f 100%)"
        }}
      >

        <div className="position-relative">

          {/* Icône + titre */}
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


          {/* Actions principales */}
          <div className="d-flex flex-wrap gap-3 mt-4">

            <Link
              to="/vehicles"
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



{/* ========================================================
    STATISTIQUES
    ======================================================== */}

<div className="row g-4 mb-4">


  {/* --------------------------------------------------------
      TOTAL DES DOSSIERS
      -------------------------------------------------------- */}

  <div className="col-md-6 col-xl-3">

    <div className="card border-0 shadow-sm rounded-5 h-100">

      <div className="card-body p-4">

        <div className="d-flex justify-content-between align-items-center">

          <div>

            <small className="text-muted fw-semibold">
              TOTAL DOSSIERS
            </small>

            <h2 className="fw-bold mt-2 mb-0">
              {total_applications}
            </h2>

          </div>


          <div
            className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
            style={{
              width: 60,
              height: 60,
              fontSize: 24
            }}
          >
            <i className="bi bi-folder-fill"></i>
          </div>

        </div>


        <div className="mt-4">

          <small className="text-muted">
            Tous vos dossiers
          </small>

        </div>

      </div>

    </div>

  </div>


  {/* --------------------------------------------------------
      DOSSIERS ACTIFS
      -------------------------------------------------------- */}

  <div className="col-md-6 col-xl-3">

    <div className="card border-0 shadow-sm rounded-5 h-100">

      <div className="card-body p-4">

        <div className="d-flex justify-content-between align-items-center">

          <div>

            <small className="text-muted fw-semibold">
              DOSSIERS ACTIFS
            </small>

            <h2 className="fw-bold mt-2 mb-0">
              {active_applications}
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
            {pending_applications} en attente
          </small>

        </div>

      </div>

    </div>

  </div>


  {/* --------------------------------------------------------
      DOSSIERS APPROUVÉS
      -------------------------------------------------------- */}

  <div className="col-md-6 col-xl-3">

    <div className="card border-0 shadow-sm rounded-5 h-100">

      <div className="card-body p-4">

        <div className="d-flex justify-content-between align-items-center">

          <div>

            <small className="text-muted fw-semibold">
              DOSSIERS APPROUVÉS
            </small>

            <h2 className="fw-bold mt-2 mb-0">
              {approved_applications}
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
            Dossiers approuvés
          </small>

        </div>

      </div>

    </div>

  </div>


  {/* --------------------------------------------------------
      NOTIFICATIONS NON LUES
      -------------------------------------------------------- */}

  <div className="col-md-6 col-xl-3">

    <div className="card border-0 shadow-sm rounded-5 h-100">

      <div className="card-body p-4">

        <div className="d-flex justify-content-between align-items-center">

          <div>

            <small className="text-muted fw-semibold">
              NOTIFICATIONS
            </small>

            <h2 className="fw-bold mt-2 mb-0">
              {unread_notifications}
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



      {/* ========================================================
          CONTENU PRINCIPAL
          ======================================================== */}

      <div className="row g-4">


        {/* ========================================================
            COLONNE GAUCHE
            ======================================================== */}

        <div className="col-lg-8">


          {/* --------------------------------------------------------
              PROCHAIN ESSAI ROUTIER
              -------------------------------------------------------- */}

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


              {/* Aucun essai confirmé */}

              {!upcoming_test_drive && (

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


              {/* Essai confirmé */}

              {upcoming_test_drive && (

                <div
                  className="p-4 rounded-5"
                  style={{
                    background: "#f8f9fa"
                  }}
                >

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                    <div>

                      <h4 className="fw-bold mb-2">

                        {upcoming_test_drive.vehicle?.brand}{" "}
                        {upcoming_test_drive.vehicle?.model}

                      </h4>


                      <div className="text-muted">

                        <i className="bi bi-calendar-event me-2"></i>

                        {new Date(
                          upcoming_test_drive.appointment_date
                        ).toLocaleString()}

                      </div>

                    </div>


                    <Link
                      to={`/test-drives/${upcoming_test_drive.id}`}
                      className="btn btn-dark rounded-pill px-4"
                    >
                      Voir détails
                    </Link>

                  </div>

                </div>

              )}

            </div>

          </div>


          {/* --------------------------------------------------------
              DOSSIERS RÉCENTS
              -------------------------------------------------------- */}

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

                {applications.map(app => (

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

                          {/* Identifiant du dossier */}

                          <div className="fw-bold mb-2">

                            Dossier #

                            {
                              app.id
                                ? app.id.slice(0, 8)
                                : "N/A"
                            }

                          </div>


                          {/* Date de création */}

                          <div className="small text-muted">

                            <i className="bi bi-clock me-1"></i>

                            {
                              app.created_at &&
                              new Date(
                                app.created_at
                              ).toLocaleDateString()
                            }

                          </div>

                        </div>


                        {/* Statut */}

                        <span
                          className={
                            `badge rounded-pill px-3 py-2 bg-${
                              STATUS[app.status]?.color
                              ?? "secondary"
                            }`
                          }
                        >

                          {
                            STATUS[app.status]?.label
                            ?? app.status
                          }

                        </span>

                      </div>

                    </div>

                  </Link>

                ))}


                {/* Aucun dossier */}

                {applications.length === 0 && (

                  <div className="text-center py-5 text-muted">

                    <i
                      className="bi bi-folder-x"
                      style={{ fontSize: 40 }}
                    ></i>

                    <p className="mt-3 mb-0">
                      Aucun dossier
                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>


        {/* ========================================================
            COLONNE DROITE
            ======================================================== */}

        <div className="col-lg-4">


          {/* --------------------------------------------------------
              ACTIONS RAPIDES
              -------------------------------------------------------- */}

          <div className="card border-0 shadow-sm rounded-5 mb-4">

            <div className="card-body p-4">

              <h5 className="fw-bold mb-4">

                <i className="bi bi-lightning-charge-fill me-2"></i>

                Actions rapides

              </h5>


              <div className="d-grid gap-3">


                <Link
                  to="/vehicles"
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


          {/* --------------------------------------------------------
              ACTIVITÉ RÉCENTE
              -------------------------------------------------------- */}

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

                {notifications.map(notif => (

                  <div
                    key={notif.id}
                    className="d-flex gap-3"
                  >

                    {/* Icône */}

                    <div
                      className={`
                        rounded-circle
                        d-flex
                        align-items-center
                        justify-content-center
                        ${
                          notif.status !== "read"
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


                    {/* Contenu */}

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


                {/* Aucune notification */}

                {notifications.length === 0 && (

                  <div className="text-center py-4 text-muted">

                    <i
                      className="bi bi-bell-slash"
                      style={{ fontSize: 32 }}
                    ></i>

                    <p className="mt-2 mb-0">
                      Aucune notification récente
                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
