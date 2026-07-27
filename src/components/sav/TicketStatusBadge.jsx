import React from "react";

export default function TicketStatusBadge({ status }) {

  const map = {
    OPEN: {
      label: "Ouvert",
      color: "primary"
    },

    IN_PROGRESS: {
      label: "En cours",
      color: "warning"
    },

    WAITING_CUSTOMER: {
      label: "En attente client",
      color: "info"
    },

    RESOLVED: {
      label: "Résolu",
      color: "success"
    },

    CLOSED: {
      label: "Fermé",
      color: "secondary"
    },
  };


  const current = map[status] || {
    label: status,
    color: "secondary"
  };


  return (
    <span className={`badge bg-${current.color}`}>
      {current.label}
    </span>
  );
}