import {
  TICKET_PRIORITIES,
} from "../../constants/supportTicketOptions";

/**
 * Badge permettant d'afficher la priorité d'un ticket.
 *
 * La priorité reçue par le backend est convertie en :
 * - un libellé lisible pour l'utilisateur ;
 * - une couleur Bootstrap adaptée.
 */
export default function TicketPriorityBadge({
  priority,
}) {



  // =====================================================
  // PRIORITÉ COURANTE
  // =====================================================

  /**
   * Recherche la configuration correspondant à la priorité
   * reçue par le backend.
   *
   * Si la valeur est absente ou inconnue, on utilise une
   * configuration générique afin d'éviter d'afficher
   * "undefined".
   */
  const current =
    TICKET_PRIORITIES[priority] || {
      label: priority || "Inconnue",
      color: "secondary",
    };


  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <span className={`badge bg-${current.color}`}>
      {current.label}
    </span>
  );
}