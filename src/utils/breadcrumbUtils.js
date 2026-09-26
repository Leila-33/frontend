/**
 * Construit le fil d'Ariane d'une page de détail de ticket.
 *
 * Le breadcrumb est adapté au rôle de l'utilisateur :
 * - agent SAV : retour vers la liste des tickets SAV ;
 * - client : retour vers ses propres tickets ;
 * - autre rôle : breadcrumb générique.
 *
 * Chaque élément retourné possède :
 * - `label` : texte affiché ;
 * - `path`  : route vers laquelle l'utilisateur peut revenir.
 *
 * Le dernier élément ne possède volontairement pas de `path`,
 * car il représente la page actuellement consultée.
 *
 * @param {Object} params
 * @param {string} params.role
 * @param {string|number} params.ticketId
 * @param {string|null} params.filter
 *
 * @returns {Array<{label: string, path?: string}>}
 */
export function getTicketBreadcrumb({ role, ticketId, filter = null }) {
  // =====================================================
  // LIBELLÉS DES FILTRES SAV
  // =====================================================

  /**
   * Libellés utilisés dans le breadcrumb lorsque l'agent
   * arrive depuis une liste filtrée.
   */
  const filterLabels = {
    all: "Tous les tickets",
    open: "Tickets ouverts",
    urgent: "Tickets urgents",
  };

  // =====================================================
  // BREADCRUMB COMMUN
  // =====================================================

  /**
   * Le dernier élément correspond toujours au ticket
   * actuellement consulté.
   *
   * Il n'a volontairement pas de `path` :
   * le composant Breadcrumb l'affichera comme élément actif.
   */
  const currentTicket = {
    label: `Ticket #${ticketId}`,
  };

  // =====================================================
  // AGENT SAV
  // =====================================================

  if (role === "sav_agent") {
    /**
     * Si un filtre est présent, on conserve celui-ci
     * lors du retour vers la liste.
     *
     * Si le filtre est inconnu, on utilise simplement
     * la liste générale des tickets.
     */
    const filterLabel = filterLabels[filter] || "Tickets";

    const ticketListPath = filter
      ? `/sav/tickets?filter=${encodeURIComponent(filter)}`
      : "/sav/tickets";

    return [
      {
        label: filterLabel,
        path: ticketListPath,
      },
      currentTicket,
    ];
  }

  // =====================================================
  // CLIENT
  // =====================================================

  if (role === "client") {
    return [
      {
        label: "Mes tickets",
        path: "/support-tickets",
      },
      currentTicket,
    ];
  }

  // =====================================================
  // RÔLE NON IDENTIFIÉ
  // =====================================================

  /**
   * Fallback utilisé si aucun rôle connu n'est fourni.
   *
   * Cela permet notamment d'éviter un breadcrumb vide
   * pendant certaines phases de chargement ou si un nouveau
   * rôle est ajouté ultérieurement.
   */
  return [
    {
      label: "Tickets",
    },
    currentTicket,
  ];
}
