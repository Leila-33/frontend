import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "./NotificationBell";

// ==========================================================
// NAVBAR PRINCIPALE
// ==========================================================
// Cette navbar centralise :
// - l'identité Mmotors
// - le menu responsive
// - les notifications
// - l'accès au compte
// - la déconnexion
//
// Les liens affichés dans "Mon compte" sont adaptés
// au rôle de l'utilisateur connecté.
// ==========================================================

export default function Navbar() {
  const { user, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);

  const isAuthenticated = Boolean(user);

  // ==========================================================
  // FERMER LE MENU MOBILE
  // ==========================================================

  const closeMenu = () => {
    setIsOpen(false);
  };

  // ==========================================================
  // DASHBOARD SELON LE RÔLE
  // ==========================================================
  // On garde cette logique directement dans la navbar afin
  // d'éviter une dépendance supplémentaire vers roles.js.
  // ==========================================================

  const getDashboardPath = () => {
    switch (user?.role) {
      case "admin":
        return "/admin";

      case "sales_agent":
        return "/sales";

      case "sav_agent":
        return "/sav";

      case "client":
      default:
        return "/dashboard";
    }
  };

  const dashboardPath = getDashboardPath();

  // ==========================================================
  // NOM À AFFICHER
  // ==========================================================

  const userName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "Mon compte";

  // ==========================================================
  // LIENS DU COMPTE SELON LE RÔLE
  // ==========================================================

  const getAccountLinks = () => {
    switch (user?.role) {
      // ------------------------------------------------------
      // ADMINISTRATEUR
      // ------------------------------------------------------

      case "admin":
        return [
          {
            to: dashboardPath,
            label: "Dashboard",
            icon: "bi-grid",
          },
          {
            to: "/admin/users",
            label: "Utilisateurs",
            icon: "bi-people",
          },
          {
            to: "/admin/vehicles",
            label: "Véhicules",
            icon: "bi-car-front",
          },
        ];

      // ------------------------------------------------------
      // COMMERCIAL
      // ------------------------------------------------------

      case "sales_agent":
        return [
          {
            to: dashboardPath,
            label: "Dashboard",
            icon: "bi-grid",
          },
          {
            to: "/sales/leads",
            label: "Mes leads",
            icon: "bi-person-lines-fill",
          },
          {
            to: "/sales/vehicles",
            label: "Véhicules",
            icon: "bi-car-front",
          },
        ];

      // ------------------------------------------------------
      // SAV
      // ------------------------------------------------------

      case "sav_agent":
        return [
          {
            to: dashboardPath,
            label: "Dashboard",
            icon: "bi-grid",
          },
          {
            to: "/sav/tickets",
            label: "Tickets SAV",
            icon: "bi-tools",
          },
        ];

      // ------------------------------------------------------
      // CLIENT
      // ------------------------------------------------------

      case "client":
      default:
        return [
          {
            to: dashboardPath,
            label: "Dashboard",
            icon: "bi-grid",
          },
          {
            to: "/mytestdrives",
            label: "Mes essais",
            icon: "bi-car-front",
          },
          {
            to: "/applications",
            label: "Mes dossiers",
            icon: "bi-folder2-open",
          },
        ];
    }
  };

  const accountLinks = getAccountLinks();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
      <div className="container">
        {/* ==================================================
            LOGO
        ================================================== */}

        <Link
          className="navbar-brand d-flex align-items-center gap-2 fw-bold"
          to="/"
          onClick={closeMenu}
        >
          <span
            className="d-flex align-items-center justify-content-center bg-white text-dark rounded-3"
            style={{
              width: 36,
              height: 36,
            }}
          >
            <i className="bi bi-car-front-fill" />
          </span>

          <span>Mmotors</span>
        </Link>

        {/* ==================================================
            BOUTON MOBILE
        ================================================== */}

        <button
          type="button"
          className="navbar-toggler border-0 shadow-none"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          aria-controls="main-navbar"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* ==================================================
            MENU PRINCIPAL
        ================================================== */}

        <div
          id="main-navbar"
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
        >
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {/* ==================================================
                UTILISATEUR CONNECTÉ
            ================================================== */}

            {isAuthenticated && (
              <>
                {/* ------------------------------------------------
                    NOTIFICATIONS
                ------------------------------------------------ */}

                <li className="nav-item d-flex align-items-center">
                  <NotificationBell />
                </li>

                {/* ------------------------------------------------
                    COMPTE
                ------------------------------------------------ */}

                <li className="nav-item dropdown">
                  <button
                    type="button"
                    className="btn btn-dark d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {/* Avatar */}

                    <span
                      className="d-flex align-items-center justify-content-center bg-secondary rounded-circle"
                      style={{
                        width: 34,
                        height: 34,
                      }}
                    >
                      <i className="bi bi-person-fill" />
                    </span>

                    {/* Nom */}

                    <span className="d-none d-md-inline text-start">
                      <span className="d-block small fw-semibold">
                        {userName}
                      </span>

                      <span className="d-block text-white-50 small">
                        Mon compte
                      </span>
                    </span>

                    <i className="bi bi-chevron-down small" />
                  </button>

                  {/* ------------------------------------------------
                      MENU DROPDOWN
                  ------------------------------------------------ */}

                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 mt-2 p-2">
                    {/* Informations utilisateur */}

                    <li className="px-3 py-2">
                      <div className="fw-semibold">{userName}</div>

                      {user?.email && (
                        <div className="text-muted small text-truncate">
                          {user.email}
                        </div>
                      )}
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    {/* Liens du rôle */}

                    {accountLinks.map((item) => (
                      <li key={item.to}>
                        <Link
                          className="dropdown-item rounded-3 py-2"
                          to={item.to}
                          onClick={closeMenu}
                        >
                          <i className={`bi ${item.icon} me-2`} />

                          {item.label}
                        </Link>
                      </li>
                    ))}

                    {/* Profil */}

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    {/* Déconnexion */}

                    <li>
                      <button
                        type="button"
                        className="dropdown-item rounded-3 py-2 text-danger"
                        onClick={() => {
                          logout();
                          closeMenu();
                        }}
                      >
                        <i className="bi bi-box-arrow-right me-2" />
                        Déconnexion
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}

            {/* ==================================================
                UTILISATEUR NON CONNECTÉ
            ================================================== */}

            {!isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link px-3"
                    to="/login"
                    onClick={closeMenu}
                  >
                    <i className="bi bi-box-arrow-in-right me-2" />
                    Connexion
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="btn btn-light btn-sm px-3 rounded-3 fw-semibold"
                    to="/register"
                    onClick={closeMenu}
                  >
                    Créer un compte
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
