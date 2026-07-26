import React from "react";

export default function TicketCategoryBadge({ category }) {

  const config = {
    GENERAL: { label: "Général", color: "secondary" },
    FINANCING: { label: "Financement", color: "info" },
    DELIVERY: { label: "Livraison", color: "primary" },
    WARRANTY: { label: "Garantie", color: "success" },
    VEHICLE_ISSUE: { label: "Problème véhicule", color: "danger" },
    DOCUMENTS: { label: "Documents", color: "dark" },
    PAYMENT: { label: "Paiement", color: "warning" },
    OTHER: { label: "Autre", color: "secondary" },
  };

  const cat = config[category] || config.OTHER;

  return (
    <span className={`badge bg-${cat.color}`}>
      {cat.label}
    </span>
  );
}