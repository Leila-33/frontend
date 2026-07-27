import React from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function SavSidebar({
  mobile = false,
  onClickLink,
  unreadTicketCount = 0,
  openTickets = 0,
  urgentTickets = 0,
}) {
  const location = useLocation();

  const params = new URLSearchParams(location.search);

  const currentFilter = params.get("filter") ?? "all";
  const isTicketsPage =
  location.pathname.startsWith("/sav/tickets");
  
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
          Espace Service Après-Vente
        </p>
      </div>

      {/* DASHBOARD */}
      <NavLink
  to="/sav/dashboard"
  end
  className={({ isActive }) =>
    navItemClass(isActive)
  }
  onClick={onClickLink}
>
  <i className="bi bi-speedometer2 fs-5" />
  <span>Dashboard</span>
</NavLink>
      {/* TOUS LES TICKETS */}
      <NavLink
  to="/sav/tickets"
  end
  className={() =>
    navItemClass(
      isTicketsPage &&
      currentFilter === "all"
    )
  }
          onClick={onClickLink}

>

        <i className="bi bi-headset fs-5" />
        <span className="d-flex align-items-center gap-2">
          Tickets SAV
          {unreadTicketCount > 0 && (
            <span className="badge bg-danger rounded-pill">
              {unreadTicketCount}
            </span>
          )}
        </span>
      </NavLink>

      {/* OUVERTS */}
      <NavLink
        to="/sav/tickets?filter=open"
className={() =>
  navItemClass(
    isTicketsPage &&
    currentFilter === "open"
  )
}        onClick={onClickLink}
      >
        <i className="bi bi-folder2-open fs-5" />
        <span className="d-flex align-items-center gap-2">
          Ouverts
          {openTickets > 0 && (
            <span className="badge bg-primary rounded-pill">
              {openTickets}
            </span>
          )}
        </span>
      </NavLink>

      {/* URGENTS */}
      <NavLink
        to="/sav/tickets?filter=urgent"
className={() =>
  navItemClass(
    isTicketsPage &&
    currentFilter === "urgent"
  )
}        onClick={onClickLink}
      >
        <i className="bi bi-exclamation-triangle fs-5" />
        <span className="d-flex align-items-center gap-2">
          Urgents
          {urgentTickets > 0 && (
            <span className="badge bg-warning text-dark rounded-pill">
              {urgentTickets}
            </span>
          )}
        </span>
      </NavLink>

      {/* STATISTIQUES */}
      <NavLink
        to="/sav/stats"
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
              <div className="fw-semibold small">Agent SAV</div>
              <div className="text-muted small">sav@mmotors.com</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}