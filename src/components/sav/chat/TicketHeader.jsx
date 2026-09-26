import TicketStatusBadge from "../TicketStatusBadge";
import TicketPriorityBadge from "../TicketPriorityBadge";
import TicketCategoryBadge from "../TicketCategoryBadge";
import { TICKET_STATUSES } from "../../../constants/supportTicketOptions";

/**
 * En-tête de la page de détail d'un ticket.
 *
 * Présente les principales informations du ticket :
 * - son identifiant ;
 * - son sujet ;
 * - sa catégorie ;
 * - sa priorité ;
 * - son statut.
 *
 * Lorsque `showStatusSelector` est activé, un sélecteur
 * permet également à l'utilisateur autorisé de modifier
 * le statut du ticket.
 */
export default function TicketHeader({
  ticket,
  showStatusSelector = false,
  onStatusChange,
}) {
  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <header className="border-bottom pb-4 mb-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-4">
        {/* =================================================
            INFORMATIONS DU TICKET
        ================================================= */}

        <div className="flex-grow-1 min-w-0">
          {/* =================================================
              IDENTIFIANT
          ================================================= */}

          <div className="text-muted small mb-2">Ticket #{ticket.id}</div>

          {/* =================================================
              SUJET
          ================================================= */}

          <h1 className="h3 fw-bold mb-3 text-break">
            {ticket.subject || "Sans sujet"}
          </h1>

          {/* =================================================
              BADGES
          ================================================= */}

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <TicketCategoryBadge category={ticket.category} />

            <TicketPriorityBadge priority={ticket.priority} />

            <TicketStatusBadge status={ticket.status} />
          </div>
        </div>

        {/* =================================================
            ACTION DE STATUT
        ================================================= */}

        {showStatusSelector && (
          <div className="flex-shrink-0">
            <label
              htmlFor="ticket-status"
              className="form-label small fw-semibold text-muted mb-2"
            >
              Statut du ticket
            </label>
            <select
              id="ticket-status"
              className="form-select"
              value={ticket.status}
              onChange={(event) =>
                onStatusChange(ticket.id, event.target.value)
              }
              aria-label="Modifier le statut du ticket"
            >
              {Object.entries(TICKET_STATUSES).map(([value, option]) => (
                <option key={value} value={value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </header>
  );
}
