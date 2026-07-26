import React from "react";

export default function TicketTabs({ activeTab, setActiveTab, total }) {
  return (
    <div className="d-flex gap-2 mb-3">

      <button
        className={`btn ${activeTab === "ACTIVE" ? "btn-dark" : "btn-outline-dark"}`}
        onClick={() => setActiveTab("ACTIVE")}
      >
        Actifs ({total})
      </button>

      <button
        className={`btn ${activeTab === "ARCHIVED" ? "btn-dark" : "btn-outline-dark"}`}
        onClick={() => setActiveTab("ARCHIVED")}
      >
        Archivés
      </button>

    </div>
  );
}