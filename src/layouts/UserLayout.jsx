import React from "react";

import DashboardLayout from "./DashboardLayout";
import UserSidebar from "../components/layout/sidebars/UserSidebar";

import { useNotifications } from "../contexts/NotificationContext";

// ==========================================================
// LAYOUT ESPACE CLIENT
// ==========================================================
// Ce layout contient uniquement les compteurs spécifiques
// à l'espace client.
//
// La structure desktop/mobile est centralisée dans
// DashboardLayout.jsx.
// ==========================================================

export default function UserLayout() {
  // ========================================================
  // NOTIFICATIONS / COMPTEURS
  // ========================================================

  const {
    unreadNotificationCount,
    unreadTicketCount,
    actionRequiredQuoteCount,
  } = useNotifications();

  // ========================================================
  // SIDEBAR
  // ========================================================

  const renderSidebar = (mobile, onClickLink) => (
    <UserSidebar
      mobile={mobile}
      unreadTicketCount={unreadTicketCount}
      unreadNotificationCount={unreadNotificationCount}
      actionRequiredQuoteCount={actionRequiredQuoteCount}
      onClickLink={onClickLink}
    />
  );

  return <DashboardLayout sidebar={renderSidebar} mobileTitle="Mmotors" />;
}
