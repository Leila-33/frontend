import React from "react";

import Sidebar from "../Sidebar";
import SidebarNavItem from "../SidebarNavItem";

// ==========================================================
// SIDEBAR ADMINISTRATION
// ==========================================================
// Cette sidebar contient uniquement la navigation spécifique
// à l'espace administrateur.
//
// La structure commune de la sidebar est gérée par :
// - Sidebar.jsx
// - SidebarNavItem.jsx
//
// Le compteur des essais routiers en attente reste spécifique
// à l'administration.
// ==========================================================

export default function AdminSidebar({
  mobile = false,
  onClickLink,
  unreadNotificationCount = 0,
  pendingCount = 0,
}) {
  return (
    <Sidebar
      mobile={mobile}
      title="Administration"
      userRoleLabel="Administrateur"
      userIcon="bi-shield-lock-fill"
    >
      {/* ======================================================
          TABLEAU DE BORD
          ====================================================== */}

      <SidebarNavItem
        to="/admin/dashboard"
        icon="bi bi-grid"
        onClick={onClickLink}
        end
      >
        Tableau de bord
      </SidebarNavItem>

      {/* ======================================================
          STATISTIQUES
          ====================================================== */}

      <SidebarNavItem
        to="/admin/analytics"
        icon="bi bi-bar-chart-line"
        onClick={onClickLink}
      >
        Statistiques
      </SidebarNavItem>

      {/* ======================================================
          DOSSIERS
          ====================================================== */}

      <SidebarNavItem
        to="/admin/applications"
        icon="bi bi-folder2-open"
        onClick={onClickLink}
      >
        Dossiers
      </SidebarNavItem>

      {/* ======================================================
          ESSAIS ROUTIERS
          ====================================================== */}

      <SidebarNavItem
        to="/admin/test-drives"
        icon="bi bi-car-front-fill"
        onClick={onClickLink}
      >
        <span className="d-flex align-items-center gap-2">
          Essais routiers
          {/* Affiche uniquement le badge lorsqu'il existe
              des essais routiers en attente. */}
          {pendingCount > 0 && (
            <span className="badge bg-danger rounded-pill">{pendingCount}</span>
          )}
        </span>
      </SidebarNavItem>

      {/* ======================================================
          VÉHICULES
          ====================================================== */}

      <SidebarNavItem
        to="/admin/vehicles"
        icon="bi bi-car-front"
        onClick={onClickLink}
      >
        Véhicules
      </SidebarNavItem>

      {/* ======================================================
          OPTIONS
          ====================================================== */}

      <SidebarNavItem
        to="/admin/options"
        icon="bi bi-sliders"
        onClick={onClickLink}
      >
        Options
      </SidebarNavItem>

      {/* ======================================================
          PLANS DE GARANTIE
          ====================================================== */}

      <SidebarNavItem
        to="/admin/warranty-plans"
        icon="bi bi-shield-check"
        onClick={onClickLink}
      >
        Plans de garantie
      </SidebarNavItem>

      {/* ======================================================
          UTILISATEURS
          ====================================================== */}

      <SidebarNavItem
        to="/admin/users"
        icon="bi bi-shield-lock"
        onClick={onClickLink}
      >
        Utilisateurs
      </SidebarNavItem>

      {/* ======================================================
          NOTIFICATIONS
          ====================================================== */}

      <SidebarNavItem
        to="/admin/notifications"
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
          ACTIVITÉ
          ====================================================== */}

      <SidebarNavItem
        to="/admin/activity"
        icon="bi bi-clock-history"
        onClick={onClickLink}
      >
        Activité
      </SidebarNavItem>
    </Sidebar>
  );
}
