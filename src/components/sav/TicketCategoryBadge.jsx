import {
  TICKET_CATEGORIES,
} from "../../constants/supportTicketOptions";

/**
 * Badge permettant d'afficher la catégorie d'un ticket.
 *
 * La catégorie reçue par le backend est convertie en :
 * - un libellé compréhensible pour l'utilisateur ;
 * - une couleur Bootstrap adaptée.
 */
export default function TicketCategoryBadge({
  category,
}) {

  

  // =====================================================
  // CATÉGORIE COURANTE
  // =====================================================

  /**
   * Recherche la configuration correspondant à la catégorie
   * reçue par le backend.
   *
   * Si la catégorie est absente ou inconnue, la catégorie
   * "OTHER" est utilisée comme valeur de secours.
   */
  const current =
    TICKET_CATEGORIES[category] ||
    TICKET_CATEGORIES.OTHER;


  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <span className={`badge bg-${current.color}`}>
      {current.label}
    </span>
  );
}