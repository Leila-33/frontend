import { TICKET_STATUSES } from "../../constants/supportTicketOptions";

/**
 * Badge permettant d'afficher le statut d'un ticket.
 *
 * La configuration du statut est centralisée dans
 * `supportTicketOptions.js` afin d'éviter de dupliquer
 * les libellés et les couleurs dans les composants.
 */
export default function TicketStatusBadge({ status }) {
  // =====================================================
  // STATUT COURANT
  // =====================================================

  /**
   * Recherche la configuration correspondant au statut
   * reçu par le backend.
   *
   * Une configuration générique est utilisée si le statut
   * est absent ou inconnu.
   */
  const current = TICKET_STATUSES[status] || {
    label: status || "Inconnu",
    color: "secondary",
  };

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return <span className={`badge bg-${current.color}`}>{current.label}</span>;
}
