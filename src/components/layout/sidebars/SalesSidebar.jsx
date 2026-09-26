import React from "react";
import { useLocation } from "react-router-dom";

import Sidebar from "../Sidebar";
import SidebarNavItem from "../SidebarNavItem";

// ==========================================================
// SIDEBAR ESPACE COMMERCIAL
// ==========================================================
// La structure générale est gérée par Sidebar.jsx.
//
// Cette sidebar conserve sa logique spécifique :
// - filtre des leads via l'URL
// - compteur de mes leads
// - compteur des leads disponibles
// - compteur des notifications
// ==========================================================

export default function SalesSidebar({
  mobile = false,
  onClickLink,
  unreadNotificationCount = 0,
  newLeadsCount = 0,
  myLeadsCount = 0,
}) {
  const location = useLocation();

  // Récupère le filtre actuellement présent dans l'URL.
  //
  // Exemple :
  // /sales/leads?filter=my
  // /sales/leads?filter=unassigned
  const params = new URLSearchParams(location.search);

  const currentFilter = params.get("filter") ?? "all";

  return (
    <Sidebar
      mobile={mobile}
      title="Espace Commercial"
      userRoleLabel="Commercial"
      userIcon="bi-briefcase-fill"
    >
      {/* ======================================================
          TABLEAU DE BORD
          ====================================================== */}

      <SidebarNavItem
        to="/sales/dashboard"
        icon="bi bi-speedometer2"
        onClick={onClickLink}
      >
        Tableau de bord
      </SidebarNavItem>

      {/* ======================================================
          MES LEADS
          ====================================================== */}
      {/* L'état actif dépend du paramètre ?filter=my.
          On ne se base donc pas uniquement sur NavLink. */}

      <SidebarNavItem
        to="/sales/leads?filter=my"
        icon="bi bi-kanban"
        active={currentFilter === "my"}
        onClick={onClickLink}
      >
        <span className="d-flex align-items-center gap-2">
          Mes Leads
          {myLeadsCount > 0 && (
            <span className="badge bg-dark rounded-pill">{myLeadsCount}</span>
          )}
        </span>
      </SidebarNavItem>

      {/* ======================================================
          LEADS DISPONIBLES
          ====================================================== */}

      <SidebarNavItem
        to="/sales/leads?filter=unassigned"
        icon="bi bi-inbox"
        active={currentFilter === "unassigned"}
        onClick={onClickLink}
      >
        <span className="d-flex align-items-center gap-2">
          Leads disponibles
          {newLeadsCount > 0 && (
            <span className="badge bg-danger rounded-pill">
              {newLeadsCount}
            </span>
          )}
        </span>
      </SidebarNavItem>

      {/* ======================================================
          NOTIFICATIONS
          ====================================================== */}

      <SidebarNavItem
        to="/sales/notifications"
        icon="bi bi-bell"
        onClick={onClickLink}
      >
        <span className="d-flex align-items-center gap-2">
          Notifications
          {unreadNotificationCount > 0 && (
            <span className="badge bg-danger rounded-pill">
              {unreadNotificationCount}
            </span>
          )}
        </span>
      </SidebarNavItem>

      {/* ======================================================
          VÉHICULES
          ====================================================== */}

      <SidebarNavItem
        to="/sales/vehicles"
        icon="bi bi-car-front"
        onClick={onClickLink}
      >
        Véhicules
      </SidebarNavItem>
    </Sidebar>
  );
}
