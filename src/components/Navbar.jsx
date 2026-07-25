import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {

  const { user, logout, isAdmin } = useAuth();
  const isAuthenticated = !!user;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

      <div className="container">

        {/* BRAND */}
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-car-front me-2"></i>
          Mmotors
        </Link>

        {/* TOGGLER MOBILE */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* MENU */}
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>

          <ul className="
            navbar-nav
            ms-auto
            d-flex
            flex-column
            flex-lg-row
            align-items-center
            justify-content-lg-end
            justify-content-center
            gap-3
            w-100
            text-center
            text-lg-end
          ">
{isAuthenticated && (
 <div className="dropdown">
  <button className="btn btn-dark dropdown-toggle" data-bs-toggle="dropdown">
    Mon compte
  </button>

  <ul className="dropdown-menu dropdown-menu-end">
    <li><Link className="dropdown-item" to="/dashboard">Dashboard</Link></li>
    <li><Link className="dropdown-item" to="/mytestdrives">Mes essais</Link></li>
    <li><Link className="dropdown-item" to="/applications">Mes dossiers</Link></li>
    <li><Link className="dropdown-item" to="/profile">Profil</Link></li>
  </ul>
</div>
)}
            {/* NOTIFICATIONS */}
            {isAuthenticated && (
              <li className="nav-item">
                <NotificationBell />
              </li>
            )}

            {/* LOGOUT */}
            {isAuthenticated && (
              <li className="nav-item">
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                >
                  Déconnexion
                </button>
              </li>
            )}

            {/* LOGIN */}
            {!isAuthenticated && (
              <li className="nav-item">
                <Link
                  className="nav-link text-center text-lg-end"
                  to="/login"
                  onClick={() => setIsOpen(false)}
                >
                  Connexion
                </Link>
              </li>
            )}

          </ul>

        </div>

      </div>

    </nav>
  );
}