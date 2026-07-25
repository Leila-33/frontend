import apiFetch from "../../../services/apiFetch";
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
 * Met à jour le statut
 */
export function updateSupportTicketStatus(
  ticketId,
  status,
) {
  return apiFetch(
    `/support-tickets/${ticketId}/status`,
    {
      method: "PATCH",
      body: { status },
    }
  );
}

/**
 * Archive un ticket
 */
export function archiveSupportTicket(
  ticketId,
) {
  return apiFetch(
    `/support-tickets/${ticketId}/archive`,
    {
      method: "PATCH",
    }
  );
}