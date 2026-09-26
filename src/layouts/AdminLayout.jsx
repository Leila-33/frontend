import React from "react";

import DashboardLayout from "./DashboardLayout";
import AdminSidebar from "../components/layout/sidebars/AdminSidebar";

import { useNotifications } from "../contexts/NotificationContext";

// ==========================================================
// LAYOUT ADMINISTRATION
// ==========================================================
// Ce layout contient uniquement la logique spécifique
// à l'espace administrateur.
//
// La structure commune desktop/mobile est gérée par :
// DashboardLayout.jsx
// ==========================================================

export default function AdminLayout() {
  // ========================================================
  // NOTIFICATIONS / COMPTEURS
  // ========================================================

  const { pendingTestDriveCount, unreadNotificationCount } = useNotifications();

  // ========================================================
  // SIDEBAR
  // ========================================================

  const renderSidebar = (mobile, onClickLink) => (
    <AdminSidebar
      mobile={mobile}
      unreadNotificationCount={unreadNotificationCount}
      pendingCount={pendingTestDriveCount}
      onClickLink={onClickLink}
    />
  );

  return <DashboardLayout sidebar={renderSidebar} mobileTitle="Mmotors" />;
}
