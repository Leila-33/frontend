import React from "react";

export default function TicketStatusBadge({ status }) {

  const map = {
    OPEN: "primary",
    IN_PROGRESS: "warning",
    WAITING_CLIENT: "info",
    CLOSED: "secondary",
  };

  return (
    <span className={`badge bg-${map[status] || "secondary"}`}>
      {status}
    </span>
  );
}