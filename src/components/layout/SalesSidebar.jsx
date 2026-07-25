import React from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function SalesSidebar({
  mobile = false,
  onClickLink,
  unreadNotificationCount = 0,
  newLeadsCount = 0,
  myLeadsCount = 0,
  quotesCount = 0,
  applicationsCount = 0,
}) {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const currentFilter = params.get("filter") ?? "all";

  const navItemClass = (active) =>
    `nav-link d-flex align-items-center gap-3 px-3 py-3 rounded-4 transition ${
      active
        ? "bg-dark text-white shadow-sm"
        : "text-dark hover-bg-light"
    }`;

  return (
    <aside
      className={`bg-white border-end vh-100 p-3 d-flex flex-column ${
        mobile ? "" : "d-none d-lg-flex"
      }`}
      style={{ width: "280px" }}
    >
      {/* HEADER */}
      <div className="mb-4 px-2">
        <h4 className="fw-bold mb-1">Mmotors</h4>
        <p className="text-muted small mb-0">
          Espace Commercial
        </p>
      </div>

      {/* DASHBOARD */}
      <NavLink
        to="/sales/dashboard"
        className={({ isActive }) => navItemClass(isActive)}
        onClick={onClickLink}
      >
        <i className="bi bi-speedometer2 fs-5" />
        <span>Tableau de bord</span>
      </NavLink>

      {/* MY LEADS (KANBAN) */}
      <NavLink
        to="/sales/leads?filter=my"
        className={() => navItemClass(currentFilter === "my")}
        onClick={onClickLink}
      >
        <i className="bi bi-kanban fs-5" />
        <span className="d-flex align-items-center gap-2">
          Mes Leads
          {myLeadsCount > 0 && (
            <span className="badge bg-dark rounded-pill">
              {myLeadsCount}
            </span>
          )}
        </span>
      </NavLink>

      {/* UNASSIGNED LEADS */}
      <NavLink
        to="/sales/leads?filter=unassigned"
        className={() => navItemClass(currentFilter === "unassigned")}
        onClick={onClickLink}
      >
        <i className="bi bi-inbox fs-5" />
        <span className="d-flex align-items-center gap-2">
          Leads disponibles
          {newLeadsCount > 0 && (
            <span className="badge bg-danger rounded-pill">
              {newLeadsCount}
            </span>
          )}
        </span>
      </NavLink>

      {/* QUOTES */}
      <NavLink
        to="/sales/quotes"
        className={({ isActive }) => navItemClass(isActive)}
        onClick={onClickLink}
      >
        <i className="bi bi-file-earmark-text fs-5" />
        <span className="d-flex align-items-center gap-2">
          Offres
          {quotesCount > 0 && (
            <span className="badge bg-primary rounded-pill">
              {quotesCount}
            </span>
          )}
        </span>
      </NavLink>
      
{/* NOTIFICATIONS */}
<NavLink
  to="/notifications"
  className={({ isActive }) => navItemClass(isActive)}
  onClick={onClickLink}
>
  <i className="bi bi-bell fs-5" />

  <span className="d-flex align-items-center gap-2">

    Notifications

    {unreadNotificationCount > 0 && (
      <span className="badge bg-danger rounded-pill">
        {unreadNotificationCount}
      </span>
    )}

  </span>

</NavLink>

      {/* APPLICATIONS */}
      <NavLink
        to="/sales/applications"
        className={({ isActive }) => navItemClass(isActive)}
        onClick={onClickLink}
      >
        <i className="bi bi-card-checklist fs-5" />
        <span className="d-flex align-items-center gap-2">
          Dossiers
          {applicationsCount > 0 && (
            <span className="badge bg-success rounded-pill">
              {applicationsCount}
            </span>
          )}
        </span>
      </NavLink>

      {/* VEHICLES */}
      <NavLink
        to="/sales/vehicles"
        className={({ isActive }) => navItemClass(isActive)}
        onClick={onClickLink}
      >
        <i className="bi bi-car-front fs-5" />
        <span>Véhicules</span>
      </NavLink>

      {/* STATISTICS */}
      <NavLink
        to="/sales/stats"
        className={({ isActive }) => navItemClass(isActive)}
        onClick={onClickLink}
      >
        <i className="bi bi-bar-chart fs-5" />
        <span>Statistiques</span>
      </NavLink>

      {/* USER */}
      <div className="mt-auto pt-4">
        <div className="border rounded-4 p-3 bg-light">
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 42, height: 42 }}
            >
              <i className="bi bi-person-badge" />
            </div>

            <div>
              <div className="fw-semibold small">Sales Agent</div>
              <div className="text-muted small">sales@mmotors.com</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}