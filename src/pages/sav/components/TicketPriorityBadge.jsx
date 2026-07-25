import React from "react";

export default function TicketPriorityBadge({ priority }) {
  const map = {
    LOW: "success",
    MEDIUM: "warning",
    HIGH: "danger",
    URGENT: "dark",
  };

  return (
    <span className={`badge bg-${map[priority] || "secondary"}`}>
      {priority}
    </span>
  );
}