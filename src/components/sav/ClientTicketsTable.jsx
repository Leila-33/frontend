/**
 * Tableau des tickets du client connecté.
 *
 * Le composant réutilise `TicketTable`, mais adapte les
 * données afin que le client soit identifié comme
 * "Moi" dans le tableau.
 */
import TicketTable from "./TicketTable";

export default function ClientTicketsTable({ tickets = [] }) {
  // =====================================================
  // ADAPTATION DES DONNÉES CLIENT
  // =====================================================

  /**
   * Le tableau générique affiche normalement le nom et
   * l'identifiant du client associé au ticket.
   *
   * Dans l'espace client, tous les tickets appartiennent
   * à l'utilisateur connecté.
   *
   * On remplace donc ces informations par "Moi" afin
   * d'éviter d'afficher inutilement les informations
   * techniques de l'utilisateur.
   */
  const adaptedTickets = tickets.map((ticket) => ({
    ...ticket,

    user_id: "Moi",
    user_name: "Moi",
  }));

  // =====================================================
  // AFFICHAGE
  // =====================================================

  /**
   * On réutilise le tableau générique des tickets.
   *
   * `basePath` permet à `TicketActions` de construire
   * les liens correspondant à l'espace client.
   */
  return <TicketTable tickets={adaptedTickets} basePath="/support-tickets" />;
}
