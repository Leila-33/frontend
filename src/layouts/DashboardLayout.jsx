import React, { useState } from "react";
import { Outlet } from "react-router-dom";

// ==========================================================
// LAYOUT GÉNÉRIQUE DES ESPACES
// ==========================================================
// Ce composant centralise la structure commune aux différents
// espaces de l'application :
// - sidebar desktop
// - sidebar mobile
// - overlay mobile
// - bouton d'ouverture du menu
// - contenu principal
//
// Les sidebars restent spécifiques à chaque rôle.
// Les compteurs sont également gérés par les layouts
// spécifiques (AdminLayout, SalesLayout, etc.).
// ==========================================================

export default function DashboardLayout({
  sidebar,
  mobileTitle = "Mmotors",
  contentClassName = "p-3 p-lg-4",
}) {
  // ========================================================
  // MENU MOBILE
  // ========================================================

  const [mobileOpen, setMobileOpen] = useState(false);

  // Ferme le menu mobile.
  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <div className="d-flex">
      {/* ====================================================
          SIDEBAR DESKTOP
          ==================================================== */}

      {sidebar(false, closeMobileMenu)}

      {/* ====================================================
          SIDEBAR MOBILE
          ==================================================== */}

      {mobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={closeMobileMenu}
        >
          <div
            className="position-absolute top-0 start-0 bg-white h-100 shadow"
            style={{ width: 280 }}
            onClick={(event) => event.stopPropagation()}
          >
            {sidebar(true, closeMobileMenu)}
          </div>
        </div>
      )}

      {/* ====================================================
          CONTENU PRINCIPAL
          ==================================================== */}

      <div className="flex-grow-1">
        {/* ==================================================
            BARRE MOBILE
            ================================================== */}

        <div className="d-lg-none p-3 border-bottom d-flex align-items-center justify-content-between">
          <button
            type="button"
            className="btn btn-outline-dark btn-sm"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <i className="bi bi-list fs-5" />
          </button>

          <h5 className="mb-0 fw-bold">{mobileTitle}</h5>

          {/* Élément vide permettant de conserver
              le titre centré dans la barre mobile. */}
          <div />
        </div>

        {/* ==================================================
            PAGE
            ================================================== */}

        <div className={contentClassName}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
