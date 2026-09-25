import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiFetch from "../../services/apiFetch";

import {
  APPLICATION_STATUSES,
} from "../../constants/applicationOptions";

import {
  USER_DASHBOARD_STAT_CARDS,
} from "../../constants/dashboardOptions";

import {
  formatDate,
  formatDateTime,
} from "../../utils/dateUtils";


// ==========================================================
// DONNÉES PAR DÉFAUT DU DASHBOARD
// ==========================================================

const DEFAULT_DASHBOARD = {
  total_applications: 0,
  active_applications: 0,
  approved_applications: 0,
  pending_applications: 0,
  applications: [],
  upcoming_test_drive: null,
  unread_notifications: 0,
  notifications: [],
};


// ==========================================================
// CARTE STATISTIQUE
// ==========================================================

function StatCard({
  title,
  value,
  icon,
  color,
  description,
  descriptionColor = "muted",
}) {
  return (
    <div className="col-md-6 col-xl-3">

      <div className="card border-0 shadow-sm rounded-5 h-100">

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center">

            {/* ------------------------------------------------
                INFORMATIONS
                ------------------------------------------------ */}

            <div>

              <small className="text-muted fw-semibold">
                {title}
              </small>

              <h2 className="fw-bold mt-2 mb-0">
                {value}
              </h2>

            </div>


            {/* ------------------------------------------------
                ICÔNE
                ------------------------------------------------ */}

            <div
              className={`
                rounded-circle
                bg-${color}
                ${
                  color === "warning"
                    ? "text-dark"
                    : "text-white"
                }
                d-flex
                align-items-center
                justify-content-center
              `}
              style={{
                width: 60,
                height: 60,
                fontSize: 24,
              }}
            >
              <i className={`bi ${icon}`}></i>
            </div>

          </div>


          {/* ------------------------------------------------
              DESCRIPTION
              ------------------------------------------------ */}

          <div className="mt-4">

            <small
              className={
                descriptionColor === "muted"
                  ? "text-muted"
                  : `text-${descriptionColor}`
              }
            >
              {description}
            </small>

          </div>

        </div>

      </div>

    </div>
  );
}


// ==========================================================
// DASHBOARD UTILISATEUR
// ==========================================================

/**
 * DashboardPage
 *
 * Tableau de bord de l'utilisateur connecté.
 *
 * Les données sont récupérées depuis une seule route :
 *
 * GET /dashboard
 *
 * Le backend retourne notamment :
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
 * Le frontend est principalement responsable
 * de la présentation de ces données.
 */
export default function DashboardPage() {

  // ========================================================
  // ÉTAT
  // ========================================================

  const [dashboard, setDashboard] = useState(
    DEFAULT_DASHBOARD
  );

  const [loading, setLoading] = useState(true);


  // ========================================================
  // CHARGEMENT DU DASHBOARD
  // ========================================================

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const response = await apiFetch(
          "/dashboard"
        );

        setDashboard({
          ...DEFAULT_DASHBOARD,
          ...response,

          // Sécurise les listes utilisées
          // avec .map().
          applications:
            response.applications ?? [],

          notifications:
            response.notifications ?? [],
        });

      } catch (err) {

        console.error(
          "Erreur lors du chargement du dashboard :",
          err
        );

      } finally {

        setLoading(false);

      }
    };


    fetchDashboard();

  }, []);


  // ========================================================
  // DONNÉES DU DASHBOARD
  // ========================================================

  const {
    applications,
    upcoming_test_drive,
    unread_notifications,
    notifications,
  } = dashboard;


  // ========================================================
  // AFFICHAGE DU CHARGEMENT
  // ========================================================

  if (loading) {

    return (

      <div className="container py-5">

        <div className="text-center text-muted">

          <div
            className="spinner-border"
            role="status"
            aria-hidden="true"
          ></div>

          <p className="mt-3 mb-0">
            Chargement du tableau de bord...
          </p>

        </div>

      </div>

    );

  }


  // ========================================================
  // AFFICHAGE
  // ========================================================

  return (

    <div
      className="container py-4"
      style={{ maxWidth: 1400 }}
    >

      {/* ====================================================
          HERO / EN-TÊTE
          ==================================================== */}

      <div
        className="p-4 p-lg-5 rounded-5 mb-4 text-white position-relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #111 0%, #1f1f1f 100%)",
        }}
      >

        <div className="position-relative">

          {/* ------------------------------------------------
              ICÔNE + TITRE
              ------------------------------------------------ */}

          <div className="d-flex align-items-center gap-3 mb-3">

            <div
              className="
                d-flex
                align-items-center
                justify-content-center
                rounded-circle
                bg-white
                text-dark
              "
              style={{
                width: 60,
                height: 60,
                fontSize: 28,
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


          {/* ------------------------------------------------
              ACTIONS PRINCIPALES
              ------------------------------------------------ */}

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


      {/* ====================================================
          STATISTIQUES DES DOSSIERS
          ==================================================== */}

      <div className="row g-4 mb-4">

        {USER_DASHBOARD_STAT_CARDS.map((card) => (

          <StatCard
            key={card.key}
            title={card.title}
            value={dashboard[card.key]}
            icon={card.icon}
            color={card.color}
            description={card.description}
            descriptionColor={
              card.descriptionColor
            }
          />

        ))}

      </div>


      {/* ====================================================
          CONTENU PRINCIPAL
          ==================================================== */}

      <div className="row g-4">


        {/* ==================================================
            COLONNE GAUCHE
            ================================================== */}

        <div className="col-lg-8">


          {/* ------------------------------------------------
              PROCHAIN ESSAI ROUTIER
              ------------------------------------------------ */}

          <div className="card border-0 shadow-sm rounded-5 mb-4">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <h5 className="fw-bold mb-0">

                  <i className="bi bi-car-front-fill me-2"></i>

                  Prochain essai routier

                </h5>


                <Link
                  to="/mytestdrives"
                  className="btn btn-sm btn-outline-dark rounded-pill"
                >
                  Voir tout
                </Link>

              </div>


              {/* ------------------------------------------------
                  AUCUN ESSAI CONFIRMÉ
                  ------------------------------------------------ */}

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


              {/* ------------------------------------------------
                  ESSAI CONFIRMÉ
                  ------------------------------------------------ */}

              {upcoming_test_drive && (

                <div
                  className="p-4 rounded-5"
                  style={{
                    background: "#f8f9fa",
                  }}
                >

                  <div
                    className="
                      d-flex
                      flex-column
                      flex-md-row
                      justify-content-between
                      align-items-md-center
                      gap-3
                    "
                  >

                    <div>

                      <h4 className="fw-bold mb-2">

                        {upcoming_test_drive.vehicle?.brand}{" "}

                        {upcoming_test_drive.vehicle?.model}

                      </h4>


                      <div className="text-muted">

                        <i className="bi bi-calendar-event me-2"></i>

                        {formatDateTime(
                          upcoming_test_drive.appointment_date
                        )}

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


          {/* ------------------------------------------------
              DOSSIERS RÉCENTS
              ------------------------------------------------ */}

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

                {applications.map((app) => (

                  <Link
                    key={app.id}
                    to={`/applications/${app.id}`}
                    className="text-decoration-none text-dark"
                  >

                    <div className="p-4 rounded-5 border bg-white">

                      <div className="d-flex justify-content-between align-items-center">

                        {/* ------------------------------------
                            INFORMATIONS DU DOSSIER
                            ------------------------------------ */}

                        <div>

                          <div className="fw-bold mb-2">

                            Dossier #

                            {app.id
                              ? app.id.slice(0, 8)
                              : "N/A"}

                          </div>


                          <div className="small text-muted">

                            <i className="bi bi-clock me-1"></i>

                            {formatDate(
                              app.created_at
                            )}

                          </div>

                        </div>


                        {/* ------------------------------------
                            STATUT
                            ------------------------------------ */}

                        <span
                          className={`
                            badge
                            rounded-pill
                            px-3
                            py-2
                            bg-${
                              APPLICATION_STATUSES[
                                app.status
                              ]?.color ?? "secondary"
                            }
                          `}
                        >
                          {
                            APPLICATION_STATUSES[
                              app.status
                            ]?.label ?? app.status
                          }
                        </span>

                      </div>

                    </div>

                  </Link>

                ))}


                {/* ------------------------------------------------
                    AUCUN DOSSIER
                    ------------------------------------------------ */}

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


        {/* ==================================================
            COLONNE DROITE
            ================================================== */}

        <div className="col-lg-4">


          {/* ------------------------------------------------
              ACTIONS RAPIDES
              ------------------------------------------------ */}

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

                  {unread_notifications > 0 && (

                    <span className="badge bg-warning text-dark rounded-pill ms-2">
                      {unread_notifications}
                    </span>

                  )}

                </Link>

              </div>

            </div>

          </div>


          {/* ------------------------------------------------
              ACTIVITÉ RÉCENTE
              ------------------------------------------------ */}

          <div className="card border-0 shadow-sm rounded-5">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <h5 className="fw-bold mb-0">

                  <i className="bi bi-activity me-2"></i>

                  Activité récente

                  {unread_notifications > 0 && (

                    <span className="badge bg-warning text-dark rounded-pill ms-2">
                      {unread_notifications}
                    </span>

                  )}

                </h5>


                <Link
                  to="/notifications"
                  className="small text-decoration-none"
                >
                  Tout voir
                </Link>

              </div>


              <div className="d-flex flex-column gap-4">

                {notifications.map((notif) => (

                  <div
                    key={notif.id}
                    className="d-flex gap-3"
                  >

                    {/* ----------------------------------------
                        ICÔNE
                        ---------------------------------------- */}

                    <div
                      className={`
                        rounded-circle
                        d-flex
                        align-items-center
                        justify-content-center
                        ${
                          notif.status !== "read"
                            ? "bg-warning text-dark"
                            : "bg-light text-muted"
                        }
                      `}
                      style={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                      }}
                    >

                      <i className="bi bi-bell-fill"></i>

                    </div>


                    {/* ----------------------------------------
                        CONTENU
                        ---------------------------------------- */}

                    <div>

                      <div className="fw-semibold">
                        {notif.title}
                      </div>


                      <div className="small text-muted">
                        {notif.message}
                      </div>


                      <div className="small text-muted mt-1">
                        {formatDateTime(
                          notif.created_at
                        )}
                      </div>

                    </div>

                  </div>

                ))}


                {/* ------------------------------------------------
                    AUCUNE NOTIFICATION
                    ------------------------------------------------ */}

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