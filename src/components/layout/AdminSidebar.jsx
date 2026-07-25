import React from "react";
import { NavLink } from "react-router-dom";

export default function AdminSidebar({
  mobile = false,
  onClickLink,
  pendingCount = 0,
  openTickets = 0
}) {  const navItemClass = ({ isActive }) =>
    `nav-link d-flex align-items-center gap-3 px-3 py-3 rounded-4 transition ${isActive
      ? "bg-dark text-white shadow-sm"
      : "text-dark hover-bg-light"
    }`;

  return (
    <aside
      className={`bg-white border-end vh-100 p-3 d-flex flex-column ${mobile ? "" : "d-none d-lg-flex"
        }`}
      style={{ width: "280px" }}
    >

      {/* ===================== */}
      {/* LOGO */}
      {/* ===================== */}
      <div className="mb-4 px-2">

        <h4 className="fw-bold mb-1">
          Mmotors
        </h4>

        <p className="text-muted small mb-0">
          Administration
        </p>

      </div>

      {/* ===================== */}
      {/* NAVIGATION */}
      {/* ===================== */}
      <NavLink to="/admin/dashboard" className={navItemClass} onClick={onClickLink}>
        <i className="bi bi-grid fs-5" />
        <span>Tableau de bord</span>
      </NavLink>

      <NavLink to="/admin/analytics" className={navItemClass} onClick={onClickLink}>
        <i className="bi bi-bar-chart-line fs-5" />
        <span>Statistiques</span>
      </NavLink>

      <NavLink to="/admin/applications" className={navItemClass} onClick={onClickLink}>
        <i className="bi bi-folder2-open fs-5" />
        <span>Dossiers</span>
      </NavLink>

      {/* NEW */}
      <NavLink
        to="/admin/test-drives"
        className={navItemClass}
        onClick={onClickLink}
      >
        <i className="bi bi-car-front-fill fs-5" />

        <span className="d-flex align-items-center gap-2">

          Essais routiers

          {pendingCount > 0 && (
            <span className="badge bg-danger rounded-pill">
              {pendingCount}
            </span>
          )}

        </span>
      </NavLink>

      <NavLink to="/admin/vehicles" className={navItemClass} onClick={onClickLink}>
        <i className="bi bi-car-front fs-5" />
        <span>Véhicules</span>
      </NavLink>

      <NavLink to="/admin/options" className={navItemClass} onClick={onClickLink}>
        <i className="bi bi-sliders fs-5" />
        <span>Options</span>
      </NavLink>

      {/* ===================== */}
      {/* WARRANTY PLANS */}
      {/* ===================== */}
      <NavLink
        to="/admin/warranty-plans"
        className={navItemClass}
        onClick={onClickLink}
      >
        <i className="bi bi-shield-check fs-5" />
        <span>Plans de garantie</span>
      </NavLink>

      <NavLink to="/admin/users" className={navItemClass} onClick={onClickLink}>
        <i className="bi bi-shield-lock fs-5" />
        <span>Utilisateurs</span>
      </NavLink>


      <NavLink to="/admin/activity" className={navItemClass} onClick={onClickLink}>
        <i className="bi bi-clock-history fs-5" />
        <span>Activité</span>
      </NavLink>

      {/* ===================== */}
      {/* USER CARD */}
      {/* ===================== */}
      <div className="mt-auto pt-4">

        <div className="border rounded-4 p-3 bg-light">

          <div className="d-flex align-items-center gap-3">

            <div
              className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 42, height: 42 }}
            >
              <i className="bi bi-person" />
            </div>

            <div>
              <div className="fw-semibold small">
                Administrateur
              </div>
              <div className="text-muted small">
                admin@autofinance.com
              </div>
            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}