import { formatDateTime } from "../../../utils/dateUtils";

/**
 * Affiche la conversation d'un ticket SAV.
 *
 * Les messages sont présentés sous forme de bulles :
 * - à droite pour les messages de l'utilisateur courant ;
 * - à gauche pour les messages des autres utilisateurs.
 *
 * `messagesEndRef` permet au composant parent de faire
 * défiler automatiquement la conversation vers le dernier
 * message.
 */
export default function TicketMessages({
  messages = [],
  currentRole,
  messagesEndRef,
}) {
  // =====================================================
  // LISTE VIDE
  // =====================================================

  /**
   * Aucun message n'est encore associé au ticket.
   */
  if (!messages.length) {
    return (
      <div className="text-center text-muted py-5">
        <i
          className="bi bi-chat-square-text fs-2 d-block mb-2"
          aria-hidden="true"
        />

        <div className="fw-semibold">Aucun message</div>

        <small>La conversation ne contient encore aucun message.</small>
      </div>
    );
  }

  // =====================================================
  // AFFICHAGE DES MESSAGES
  // =====================================================

  return (
    <div className="d-flex flex-column gap-3">
      {messages.map((message) => {
        // =================================================
        // EXPÉDITEUR
        // =================================================

        /**
         * Un message appartient à l'utilisateur courant
         * lorsque son rôle correspond au rôle actuellement
         * connecté.
         */
        const isMine = message.sender_role === currentRole;

        // =================================================
        // MESSAGE
        // =================================================

        return (
          <div
            key={message.id}
            className={`d-flex ${
              isMine ? "justify-content-end" : "justify-content-start"
            }`}
          >
            <div
              className={[
                "rounded-4",
                "px-3",
                "py-2",
                "shadow-sm",
                isMine ? "bg-primary text-white" : "bg-light border",
              ].join(" ")}
              style={{
                maxWidth: "min(75%, 650px)",
              }}
            >
              {/* =========================================
                  EXPÉDITEUR
              ========================================= */}

              {!isMine && message.sender_name && (
                <div className="small fw-semibold mb-1">
                  {message.sender_name}
                </div>
              )}

              {/* =========================================
                  CONTENU
              ========================================= */}

              <div
                style={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {message.message}
              </div>

              {/* =========================================
                  DATE
              ========================================= */}

              {formatDateTime(message.created_at) && (
                <div
                  className={`small mt-2 ${
                    isMine ? "text-white-50" : "text-muted"
                  }`}
                >
                  {formatDateTime(message.created_at)}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* =================================================
          POINT DE DÉFILEMENT
          
          Le parent peut utiliser cette référence pour
          positionner automatiquement la conversation sur
          le dernier message.
      ================================================= */}

      <div ref={messagesEndRef} />
    </div>
  );
}
