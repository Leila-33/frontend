import React from "react";

import Sidebar from "../Sidebar";
import SidebarNavItem from "../SidebarNavItem";

// ==========================================================
// SIDEBAR ESPACE CLIENT
// ==========================================================
// La structure commune est gérée par Sidebar.jsx.
//
// Cette sidebar contient uniquement les éléments propres
// à l'espace client :
// - essais routiers
// - dossiers
// - offres
// - notifications
// - support / SAV
// - favoris
//
// Les compteurs sont transmis par le composant parent.
// ==========================================================

export default function UserSidebar({
  mobile = false,
  onClickLink,
  unreadNotificationCount = 0,
  pendingTestDrives = 0,
  unreadTicketCount = 0,
  actionRequiredQuoteCount = 0,
}) {
  return (
    <Sidebar
      mobile={mobile}
      title="Espace client"
      userRoleLabel="Client"
      userIcon="bi-car-front-fill"
    >
      {/* ======================================================
          TABLEAU DE BORD
          ====================================================== */}

      <SidebarNavItem to="/dashboard" icon="bi bi-grid" onClick={onClickLink}>
        Dashboard
      </SidebarNavItem>

      {/* ======================================================
          ESSAIS ROUTIERS
          ====================================================== */}

      <SidebarNavItem
        to="/mytestdrives"
        icon="bi bi-car-front"
        onClick={onClickLink}
      >
        <span className="d-flex align-items-center gap-2">
          Mes essais
          {pendingTestDrives > 0 && (
            <span className="badge bg-primary rounded-pill">
              {pendingTestDrives}
            </span>
          )}
        </span>
      </SidebarNavItem>

      {/* ======================================================
          DOSSIERS
          ====================================================== */}

      <SidebarNavItem
        to="/applications"
        icon="bi bi-folder2-open"
        onClick={onClickLink}
      >
        Dossiers
      </SidebarNavItem>

      {/* ======================================================
          OFFRES
          ====================================================== */}

      <SidebarNavItem
        to="/quotes"
        icon="bi bi-file-earmark-text"
        onClick={onClickLink}
      >
        <span className="d-flex align-items-center gap-2">
          Mes offres
          {actionRequiredQuoteCount > 0 && (
            <span className="badge bg-primary rounded-pill">
              {actionRequiredQuoteCount}
            </span>
          )}
        </span>
      </SidebarNavItem>

      {/* ======================================================
          NOTIFICATIONS
          ====================================================== */}

      <SidebarNavItem
        to="/notifications"
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
          SUPPORT / SAV
          ====================================================== */}

      <SidebarNavItem
        to="/support-tickets"
        icon="bi bi-headset"
        onClick={onClickLink}
      >
        <span className="d-flex align-items-center gap-2">
          Support / SAV
          {unreadTicketCount > 0 && (
            <span className="badge bg-danger rounded-pill">
              {unreadTicketCount}
            </span>
          )}
        </span>
      </SidebarNavItem>

      {/* ======================================================
          FAVORIS
          ====================================================== */}

      <SidebarNavItem to="/favorites" icon="bi bi-heart" onClick={onClickLink}>
        Favoris
      </SidebarNavItem>
    </Sidebar>
  );
}
