import React from "react";
import TicketPriorityBadge from "./TicketPriorityBadge";
import TicketActions from "./TicketActions";

export default function TicketRow({ ticket, basePath, onArchive, onTakeOwnership}) {
  const isNew = ticket.unread === true;

  return (
    <tr className={isNew ? "fw-bold" : ""}>

      {/* BADGE NEW */}
      <td>
        {isNew && <span className="badge bg-danger">NEW</span>}
      </td>

      {/* SUBJECT */}
      <td>
        <div>{ticket.subject}</div>
        <small className="text-muted">#{ticket.id}</small>
      </td>

      {/* CLIENT */}
      <td>{ticket.user_name || ticket.user_id}</td>

      {/* CATEGORY */}
      <td>{ticket.category}</td>

      {/* PRIORITY */}
      <td>
        <TicketPriorityBadge priority={ticket.priority} />
      </td>

      {/* STATUS */}
      <td>{ticket.status}</td>

      {/* LAST ACTIVITY */}
      <td>
        <div className="d-flex flex-column">
          <small>{ticket.last_actor}</small>
          <small className="text-muted">
            {ticket.last_message_preview}
          </small>
        </div>
      </td>

      {/* ACTIONS */}
      <td>
<TicketActions
    ticket={ticket}
    basePath={basePath}
    onArchive={onArchive}
    onTakeOwnership={onTakeOwnership}
/>      </td>

    </tr>
  );
}