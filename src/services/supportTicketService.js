import apiFetch from "./apiFetch";
/**
 * Récupère une page de tickets
 */
export function findSupportTickets(query) {
  const params = new URLSearchParams(query).toString();

  return apiFetch(`/support-tickets?${params}`, {
  });
}

/**
 * Récupère un ticket
 */
export function getSupportTicket(ticketId) {
  return apiFetch(`/support-tickets/${ticketId}`, {
  });
}

/**
 * Crée un ticket
 */
export function createSupportTicket(payload) {
  return apiFetch("/support-tickets", {
    method: "POST",
    body: payload,
  });
}

/**
 * Envoie un message
 */
export function sendSupportTicketMessage(
  ticketId,
  message,
) {
  return apiFetch(
    `/support-tickets/${ticketId}/messages`,
    {
      method: "POST",
      body: { message },
    }
  );
}

/**
 * Archive un ticket SAV.
 *
 * L'archivage est réservé aux actions effectuées
 * depuis l'espace agent.
 *
 * @param {string|number} ticketId
 * @returns {Promise<Object>}
 */
export function archiveSupportTicket(ticketId) {
  return apiFetch(
    `/agent/support-tickets/${ticketId}/archive`,
    {
      method: "PATCH",
    }
  );
}


/**
 * Met à jour le statut d'un ticket SAV.
 *
 * @param {string|number} ticketId
 * @param {string} status
 * @returns {Promise<Object>}
 */
export function updateSupportTicketStatus(
  ticketId,
  status
) {
  return apiFetch(
    `/agent/support-tickets/${ticketId}/status`,
    {
      method: "PATCH",
      body: {
        status,
      },
    }
  );
}