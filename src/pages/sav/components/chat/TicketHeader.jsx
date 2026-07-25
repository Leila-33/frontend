import TicketStatusBadge from "../TicketStatusBadge";
import TicketPriorityBadge from "../TicketPriorityBadge";
import TicketCategoryBadge from "../TicketCategoryBadge";

export default function TicketHeader({
  ticket,
  showStatusSelector = false,
  onStatusChange,
}) {
  return (
    <div className="d-flex justify-content-between align-items-start mb-4">

      <div>

        <h2 className="mb-2">
          {ticket.subject}
        </h2>

        <div className="d-flex gap-2 flex-wrap">

          <TicketCategoryBadge category={ticket.category} />

          <TicketPriorityBadge priority={ticket.priority} />

          <TicketStatusBadge status={ticket.status} />

        </div>

      </div>

      {showStatusSelector && (
        <select
          className="form-select"
          style={{ width: 220 }}
          value={ticket.status}
          onChange={(e) => onStatusChange(ticket.id, e.target.value)}
        >
          <option value="OPEN">Ouvert</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="RESOLVED">Résolu</option>
          <option value="CLOSED">Fermé</option>
        </select>
      )}

    </div>
  );
}