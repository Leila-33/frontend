import React from "react";
import { NavLink } from "react-router-dom";

export default function UserSidebar({
  mobile = false,
  onClickLink,
  unreadNotificationCount = 0,
  pendingTestDrives = 0,
  unreadTicketCount = 0,
  actionRequiredQuoteCount = 0
}) {

  const navItemClass = ({ isActive }) =>
    `nav-link d-flex align-items-center gap-3 px-3 py-3 rounded-4 transition ${
      isActive
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

      {/* ===================== */}
      {/* LOGO */}
      {/* ===================== */}
      <div className="mb-4 px-2">

        <h4 className="fw-bold mb-1">
          Mmotors
        </h4>

        <p className="text-muted small mb-0">
          Espace client
        </p>

      </div>

      {/* ===================== */}
      {/* NAVIGATION */}
      {/* ===================== */}

      <NavLink to="/dashboard" className={navItemClass} onClick={onClickLink}>
        <i className="bi bi-grid fs-5" />
        <span>Dashboard</span>
      </NavLink>

      <NavLink to="/mytestdrives" className={navItemClass} onClick={onClickLink}>
        <i className="bi bi-car-front fs-5" />
        <span className="d-flex align-items-center gap-2">

          Mes essais

          {pendingTestDrives > 0 && (
            <span className="badge bg-primary rounded-pill">
              {pendingTestDrives}
            </span>
          )}

        </span>
      </NavLink>

      <NavLink to="/applications" className={navItemClass} onClick={onClickLink}>
        <i className="bi bi-folder2-open fs-5" />
        <span>Dossiers</span>
      </NavLink>
<NavLink 
  to="/quotes" 
  className={navItemClass} 
  onClick={onClickLink}
>
  <i className="bi bi-file-earmark-text fs-5" />

  <span className="d-flex align-items-center gap-2">

    Mes offres

{actionRequiredQuoteCount > 0 && (
  <span className="badge bg-primary rounded-pill">
    {actionRequiredQuoteCount}
  </span>
)}

  </span>

</NavLink>
      <NavLink to="/notifications" className={navItemClass} onClick={onClickLink}>
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
      <NavLink to="/support-tickets" className={navItemClass} onClick={onClickLink}>
  <i className="bi bi-headset fs-5" />

  <span className="d-flex align-items-center gap-2">
    Support / SAV

    {unreadTicketCount > 0 && (
      <span className="badge bg-danger text-dark rounded-pill">
        {unreadTicketCount}
      </span>
    )}
  </span>
</NavLink>

      <NavLink to="/favorites" className={navItemClass} onClick={onClickLink}>
        <i className="bi bi-heart fs-5" />
        <span>Favoris</span>
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
                Espace utilisateur
              </div>
              <div className="text-muted small">
                client@mmotors.com
              </div>
            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}