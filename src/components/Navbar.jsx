import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import "../styles/Navbar.css";

// ==========================================================
// NAVBAR PRINCIPALE
// ==========================================================
// - identité M-Motors
// - navigation publique
// - notifications
// - compte utilisateur
// - menu responsive
// - navigation selon le rôle
// ==========================================================

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const accountRef = useRef(null);

  const isAuthenticated = Boolean(user);

  // ==========================================================
  // FERMETURE DU MENU
  // ==========================================================

  const closeMenu = () => {
    setIsOpen(false);
    setIsAccountOpen(false);
  };

  // ==========================================================
  // FERMETURE DU DROPDOWN AU CLIC EXTÉRIEUR
  // ==========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ==========================================================
  // FERMER LE MENU LORS D'UN CHANGEMENT DE PAGE
  // ==========================================================

  useEffect(() => {
    setIsOpen(false);
    setIsAccountOpen(false);
  }, [location.pathname]);

  // ==========================================================
  // DASHBOARD SELON LE RÔLE
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
  // RÔLE À AFFICHER
  // ==========================================================

  const getRoleLabel = () => {
    switch (user?.role) {
      case "admin":
        return "Administrateur";

      case "sales_agent":
        return "Commercial";

      case "sav_agent":
        return "Agent SAV";

      case "client":
      default:
        return "Client";
    }
  };

  const roleLabel = getRoleLabel();

  // ==========================================================
  // INITIALISATION AVATAR
  // ==========================================================

  const getInitials = () => {
    const firstInitial = user?.first_name?.charAt(0);
    const lastInitial = user?.last_name?.charAt(0);

    if (firstInitial || lastInitial) {
      return `${firstInitial || ""}${lastInitial || ""}`.toUpperCase();
    }

    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "M";
  };

  const initials = getInitials();

  // ==========================================================
  // LIENS COMPTE SELON LE RÔLE
  // ==========================================================

  const getAccountLinks = () => {
    switch (user?.role) {
      case "admin":
        return [
          {
            to: dashboardPath,
            label: "Tableau de bord",
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

      case "sales_agent":
        return [
          {
            to: dashboardPath,
            label: "Tableau de bord",
            icon: "bi-grid",
          },
          {
            to: "/sales/leads",
            label: "Mes leads",
            icon: "bi-person-lines-fill",
          },
          {
            to: "/vehicles",
            label: "Véhicules",
            icon: "bi-car-front",
          },
        ];

      case "sav_agent":
        return [
          {
            to: dashboardPath,
            label: "Tableau de bord",
            icon: "bi-grid",
          },
          {
            to: "/sav/tickets",
            label: "Tickets SAV",
            icon: "bi-tools",
          },
        ];

      case "client":
      default:
        return [
          {
            to: dashboardPath,
            label: "Tableau de bord",
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

  // ==========================================================
  // NAVIGATION ACTIVE
  // ==========================================================

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  // ==========================================================
  // DÉCONNEXION
  // ==========================================================

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <header className="mm-navbar-wrapper">
      <nav className="mm-navbar">
        <div className="container">
          <div className="mm-navbar-inner">
            {/* ==================================================
                LOGO
            ================================================== */}

            <Link
              to="/"
              className="mm-navbar-brand"
              onClick={closeMenu}
              aria-label="M-Motors - Accueil"
            >
              <span className="mm-navbar-logo">
                <i className="bi bi-car-front-fill" />
              </span>

              <span className="mm-navbar-brand-text">
                <strong>M-MOTORS</strong>
                <small>Vente • Location • Financement</small>
              </span>
            </Link>

            {/* ==================================================
                BOUTON MOBILE
            ================================================== */}

            <button
              type="button"
              className={`mm-navbar-toggle ${isOpen ? "is-open" : ""}`}
              onClick={() => setIsOpen((previous) => !previous)}
              aria-expanded={isOpen}
              aria-controls="main-navbar"
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {/* ==================================================
                CONTENU NAVBAR
            ================================================== */}

            <div
              id="main-navbar"
              className={`mm-navbar-collapse ${isOpen ? "is-open" : ""}`}
            >
              {/* ==================================================
                  NAVIGATION PRINCIPALE
              ================================================== */}

              <div className="mm-navbar-main-links">
                <Link
                  to="/"
                  className={`mm-navbar-link ${isActive("/") ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <span>Accueil</span>
                </Link>

                <Link
                  to="/vehicles"
                  className={`mm-navbar-link ${
                    isActive("/vehicles") ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  <span>Véhicules</span>
                </Link>
              </div>

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <div className="mm-navbar-actions">
                {isAuthenticated ? (
                  <>
                    {/* ------------------------------------------------
                        NOTIFICATIONS
                    ------------------------------------------------ */}

                    <div className="mm-navbar-notification">
                      <NotificationBell />
                    </div>

                    {/* ------------------------------------------------
                        COMPTE
                    ------------------------------------------------ */}

                    <div className="mm-account-wrapper" ref={accountRef}>
                      <button
                        type="button"
                        className={`mm-account-trigger ${
                          isAccountOpen ? "is-open" : ""
                        }`}
                        onClick={() =>
                          setIsAccountOpen((previous) => !previous)
                        }
                        aria-expanded={isAccountOpen}
                        aria-haspopup="menu"
                      >
                        <span className="mm-account-avatar">{initials}</span>

                        <span className="mm-account-summary">
                          <strong>{userName}</strong>
                          <small>{roleLabel}</small>
                        </span>

                        <i
                          className={`bi bi-chevron-down mm-account-chevron ${
                            isAccountOpen ? "rotate" : ""
                          }`}
                        />
                      </button>

                      {/* ------------------------------------------------
                          DROPDOWN
                      ------------------------------------------------ */}

                      {isAccountOpen && (
                        <div className="mm-account-dropdown" role="menu">
                          {/* En-tête */}

                          <div className="mm-dropdown-header">
                            <span className="mm-dropdown-avatar">
                              {initials}
                            </span>

                            <div className="mm-dropdown-user">
                              <strong>{userName}</strong>

                              {user?.email && (
                                <span title={user.email}>{user.email}</span>
                              )}

                              <small>{roleLabel}</small>
                            </div>
                          </div>

                          <div className="mm-dropdown-divider"></div>

                          {/* Liens */}

                          <div className="mm-dropdown-links">
                            {accountLinks.map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                className={`mm-dropdown-link ${
                                  isActive(item.to) ? "active" : ""
                                }`}
                                onClick={closeMenu}
                                role="menuitem"
                              >
                                <span className="mm-dropdown-link-icon">
                                  <i className={`bi ${item.icon}`} />
                                </span>

                                <span>{item.label}</span>

                                <i className="bi bi-chevron-right ms-auto"></i>
                              </Link>
                            ))}
                          </div>

                          <div className="mm-dropdown-divider"></div>

                          {/* Déconnexion */}

                          <button
                            type="button"
                            className="mm-dropdown-logout"
                            onClick={handleLogout}
                          >
                            <span className="mm-dropdown-link-icon">
                              <i className="bi bi-box-arrow-right"></i>
                            </span>

                            <span>Déconnexion</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* ------------------------------------------------
                        CONNEXION
                    ------------------------------------------------ */}

                    <Link
                      to="/login"
                      className="mm-login-link"
                      onClick={closeMenu}
                    >
                      <i className="bi bi-person"></i>
                      <span>Connexion</span>
                    </Link>

                    {/* ------------------------------------------------
                        INSCRIPTION
                    ------------------------------------------------ */}

                    <Link
                      to="/register"
                      className="mm-register-button"
                      onClick={closeMenu}
                    >
                      <span>Créer un compte</span>

                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
