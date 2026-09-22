import React from "react";
import { useLocation } from "react-router-dom";

import Sidebar from "../Sidebar";
import SidebarNavItem from "../SidebarNavItem";

// ==========================================================
// SIDEBAR ESPACE SERVICE APRÈS-VENTE
// ==========================================================
// La structure commune est gérée par Sidebar.jsx.
//
// Cette sidebar conserve sa logique spécifique :
// - filtres des tickets via l'URL
// - compteur des tickets non lus
// - compteur des tickets ouverts
// - compteur des tickets urgents
// ==========================================================

export default function SavSidebar({
  mobile = false,
  onClickLink,
  unreadTicketCount = 0,
}) {
  const location = useLocation();

  // Récupère le filtre actuellement présent dans l'URL.
  //
  // Exemples :
  // /sav/tickets
  // /sav/tickets?filter=open
  // /sav/tickets?filter=urgent
  const params = new URLSearchParams(location.search);

  const currentFilter = params.get("filter") ?? "all";

  // Permet de vérifier que l'utilisateur se trouve
  // bien sur une page de tickets SAV.
  const isTicketsPage =
    location.pathname.startsWith("/sav/tickets");

  return (
    <Sidebar
      mobile={mobile}
      title="Espace Service Après-Vente"
      userRoleLabel="Agent SAV"
      userIcon="bi-tools"
    >
      {/* ======================================================
          TABLEAU DE BORD
          ====================================================== */}

      <SidebarNavItem
        to="/sav/dashboard"
        icon="bi bi-speedometer2"
        end
        onClick={onClickLink}
      >
        Dashboard
      </SidebarNavItem>

      {/* ======================================================
          TOUS LES TICKETS
          ====================================================== */}
      {/* L'élément est actif uniquement lorsque l'utilisateur
          est sur /sav/tickets sans filtre spécifique. */}

      <SidebarNavItem
        to="/sav/tickets"
        icon="bi bi-headset"
        active={
          isTicketsPage &&
          currentFilter === "all"
        }
        onClick={onClickLink}
      >
        <span className="d-flex align-items-center gap-2">
          Tickets SAV

          {unreadTicketCount > 0 && (
            <span className="badge bg-danger rounded-pill">
              {unreadTicketCount}
            </span>
          )}
        </span>
      </SidebarNavItem>

      {/* ======================================================
          TICKETS OUVERTS
          ====================================================== */}

      <SidebarNavItem
        to="/sav/tickets?filter=open"
        icon="bi bi-folder2-open"
        active={
          isTicketsPage &&
          currentFilter === "open"
        }
        onClick={onClickLink}
      >
        <span className="d-flex align-items-center gap-2">
          Ouverts
        </span>
      </SidebarNavItem>

      {/* ======================================================
          TICKETS URGENTS
          ====================================================== */}

      <SidebarNavItem
        to="/sav/tickets?filter=urgent"
        icon="bi bi-exclamation-triangle"
        active={
          isTicketsPage &&
          currentFilter === "urgent"
        }
        onClick={onClickLink}
      >
        <span className="d-flex align-items-center gap-2">
          Urgents
        </span>
      </SidebarNavItem>

      {/* ======================================================
          STATISTIQUES
          ====================================================== */}

      <SidebarNavItem
        to="/sav/stats"
        icon="bi bi-bar-chart"
        onClick={onClickLink}
      >
        Statistiques
      </SidebarNavItem>
    </Sidebar>
  );
}