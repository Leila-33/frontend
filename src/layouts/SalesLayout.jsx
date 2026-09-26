import React from "react";

import DashboardLayout from "./DashboardLayout";
import SalesSidebar from "../components/layout/sidebars/SalesSidebar";

import useSalesNotifications from "../hooks/useSalesNotifications";
import { useNotifications } from "../contexts/NotificationContext";

// ==========================================================
// LAYOUT ESPACE COMMERCIAL
// ==========================================================
// Ce layout contient uniquement les données spécifiques
// à l'espace commercial :
// - nouveaux leads
// - mes leads
// - notifications non lues
//
// La structure desktop/mobile est centralisée dans
// DashboardLayout.jsx.
// ==========================================================

export default function SalesLayout() {
  // ========================================================
  // COMPTEURS COMMERCIAUX
  // ========================================================

  const { newLeadsCount, myLeadsCount } = useSalesNotifications();

  // ========================================================
  // NOTIFICATIONS
  // ========================================================

  const { unreadNotificationCount } = useNotifications();

  // ========================================================
  // SIDEBAR
  // ========================================================

  const renderSidebar = (mobile, onClickLink) => (
    <SalesSidebar
      mobile={mobile}
      newLeadsCount={newLeadsCount}
      myLeadsCount={myLeadsCount}
      unreadNotificationCount={unreadNotificationCount}
      onClickLink={onClickLink}
    />
  );

  return (
    <DashboardLayout
      sidebar={renderSidebar}
      mobileTitle="Mmotors • Espace commercial"
    />
  );
}
