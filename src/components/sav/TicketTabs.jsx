export default function TicketTabs({ activeTab, setActiveTab, total }) {
  // =====================================================
  // CHANGEMENT D'ONGLET
  // =====================================================

  /**
   * Active l'onglet demandé.
   *
   * Le composant parent reste responsable de la gestion
   * de l'état `activeTab`.
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div
      className="d-flex gap-2 mb-3"
      role="tablist"
      aria-label="Filtre des tickets"
    >
      {/* =================================================
          TICKETS ACTIFS
      ================================================= */}

      <button
        type="button"
        className={`btn ${
          activeTab === "ACTIVE" ? "btn-dark" : "btn-outline-dark"
        }`}
        onClick={() => handleTabChange("ACTIVE")}
        role="tab"
        aria-selected={activeTab === "ACTIVE"}
      >
        Actifs ({total})
      </button>

      {/* =================================================
          TICKETS ARCHIVÉS
      ================================================= */}

      <button
        type="button"
        className={`btn ${
          activeTab === "ARCHIVED" ? "btn-dark" : "btn-outline-dark"
        }`}
        onClick={() => handleTabChange("ARCHIVED")}
        role="tab"
        aria-selected={activeTab === "ARCHIVED"}
      >
        Archivés
      </button>
    </div>
  );
}
