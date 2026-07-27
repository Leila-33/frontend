import React from "react";

export default function TicketPriorityBadge({ priority }) {

  const map = {

    LOW: {
      label: "Faible",
      color: "success"
    },

    MEDIUM: {
      label: "Normale",
      color: "warning"
    },

    HIGH: {
      label: "Haute",
      color: "danger"
    },

    URGENT: {
      label: "Urgente",
      color: "dark"
    },

  };


  const current = map[priority] || {
    label: priority,
    color: "secondary"
  };


  return (
    <span className={`badge bg-${current.color}`}>
      {current.label}
    </span>
  );
}