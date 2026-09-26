import { useState } from "react";

/**
 * Zone de réponse d'un ticket SAV.
 *
 * Responsabilités :
 * - permettre à l'utilisateur de rédiger un message ;
 * - empêcher l'envoi d'un message vide ;
 * - transmettre le message au composant parent ;
 * - vider le champ uniquement lorsque l'envoi est accepté.
 *
 * Le composant ne gère pas directement le WebSocket :
 * cette responsabilité appartient au hook `useSupportTicket`.
 */
export default function TicketReplyBox({
  onSend,
  placeholder = "Écrire un message...",
}) {
  // =====================================================
  // ÉTAT DU MESSAGE
  // =====================================================

  /**
   * Contenu actuellement saisi par l'utilisateur.
   */
  const [message, setMessage] = useState("");

  // =====================================================
  // SOUMISSION
  // =====================================================

  /**
   * Gère l'envoi du message.
   *
   * Le message est nettoyé avant d'être transmis afin
   * d'éviter d'envoyer des espaces inutiles.
   *
   * `onSend` peut retourner `false` lorsque l'envoi
   * n'a pas pu être effectué.
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    // Empêche l'envoi d'un message vide.
    if (!trimmedMessage) {
      return;
    }

    const result = onSend(trimmedMessage);

    /**
     * On vide le champ uniquement si `onSend` n'indique
     * pas explicitement un échec.
     *
     * Exemple :
     * - true / undefined → message envoyé → on vide ;
     * - false → problème d'envoi → on conserve le message.
     */
    if (result !== false) {
      setMessage("");
    }
  };

  // =====================================================
  // ÉTAT DU BOUTON
  // =====================================================

  /**
   * Le bouton est désactivé lorsqu'aucun contenu valide
   * n'est présent dans le champ.
   */
  const isDisabled = message.trim().length === 0;

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="card border-0 shadow-sm rounded-4"
      aria-label="Répondre au ticket"
    >
      <div className="card-body p-4">
        {/* =================================================
            CHAMP DE MESSAGE
        ================================================= */}

        <label htmlFor="ticket-reply" className="form-label fw-semibold">
          Votre réponse
        </label>

        <textarea
          id="ticket-reply"
          rows={4}
          className="form-control"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={placeholder}
          aria-label="Message"
        />

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="d-flex justify-content-end mt-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isDisabled}
          >
            <i className="bi bi-send me-2" aria-hidden="true" />
            Envoyer
          </button>
        </div>
      </div>
    </form>
  );
}
