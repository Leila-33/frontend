import React from "react";

import DashboardLayout from "./DashboardLayout";
import SavSidebar from "../components/layout/sidebars/SAVSidebar";

import { useNotifications } from "../contexts/NotificationContext";

// ==========================================================
// LAYOUT ESPACE SERVICE APRÈS-VENTE
// ==========================================================
// Ce layout contient uniquement les données spécifiques
// au SAV.
//
// La structure desktop/mobile est centralisée dans
// DashboardLayout.jsx.
// ==========================================================

export default function SavLayout() {

  // ========================================================
  // NOTIFICATIONS / COMPTEURS
  // ========================================================

  const {
    unreadTicketCount
  } = useNotifications();


  // ========================================================
  // SIDEBAR
  // ========================================================

  const renderSidebar = (mobile, onClickLink) => (
    <SavSidebar
      mobile={mobile}
      unreadTicketCount={unreadTicketCount}
      onClickLink={onClickLink}
    />
  );


  return (
    <DashboardLayout
      sidebar={renderSidebar}
      mobileTitle="Mmotors"
    />
  );
}