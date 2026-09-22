import { useParams } from "react-router-dom";

import useSupportTicket from "../../../hooks/useSupportTicket";

import TicketHeader from "../../../components/sav/chat/TicketHeader";
import TicketMessages from "../../../components/sav/chat/TicketMessages";
import TicketReplyBox from "../../../components/sav/chat/TicketReplyBox";

import { useAuth } from "../../../contexts/AuthContext";

import { getTicketBreadcrumb } from "../../../utils/breadcrumb";

import DetailLayout from "../../../layouts/DetailLayout";


/**
 * Page de détail d'un ticket SAV pour un client.
 *
 * Responsabilités :
 * - récupérer l'identifiant du ticket depuis l'URL ;
 * - récupérer l'utilisateur connecté ;
 * - charger le ticket et ses messages via `useSupportTicket` ;
 * - afficher les informations du ticket ;
 * - afficher la conversation en temps réel ;
 * - permettre au client de répondre lorsque le ticket est ouvert.
 *
 * La logique métier et la communication WebSocket
 * sont centralisées dans `useSupportTicket`.
 */
export default function ClientTicketDetailPage() {

  // =====================================================
  // PARAMÈTRES ET CONTEXTE
  // =====================================================

  /**
   * Identifiant du ticket récupéré depuis l'URL.
   */
  const { id } = useParams();


  /**
   * Utilisateur actuellement connecté.
   *
   * Son rôle permet notamment de construire
   * le fil d'Ariane.
   */
  const { user } = useAuth();


  // =====================================================
  // DONNÉES DU TICKET
  // =====================================================

  const {
    ticket,
    messages,
    sendMessage,
    messagesEndRef,
    canReply,
  } = useSupportTicket(id);


  // =====================================================
  // CHARGEMENT
  // =====================================================

  /**
   * Tant que le ticket n'est pas disponible,
   * on affiche un état de chargement.
   */
  if (!ticket) {
    return (
      <div
        className="container py-5 text-center text-muted"
        role="status"
        aria-live="polite"
      >
        <div
          className="spinner-border spinner-border-sm me-2"
          aria-hidden="true"
        />

        Chargement du ticket...
      </div>
    );
  }


  // =====================================================
  // BREADCRUMB
  // =====================================================

  /**
   * Construction du fil d'Ariane.
   *
   * Le rôle client permet à `getTicketBreadcrumb`
   * de générer le lien "Mes tickets".
   */
  const breadcrumb = getTicketBreadcrumb({
    role: user?.role,
    ticketId: ticket.id,
  });


  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <DetailLayout
      breadcrumb={breadcrumb}
    >

      <div className="container-fluid py-4">

        {/* =================================================
            EN-TÊTE DU TICKET
        ================================================= */}

        <TicketHeader
          ticket={ticket}
          showStatusSelector={false}
        />


        {/* =================================================
            CONVERSATION
        ================================================= */}

        <section
          className="card border-0 shadow-sm rounded-4 mb-4"
          style={{
            height: "60vh",
            overflowY: "auto",
          }}
          aria-label="Conversation du ticket"
        >

          <div className="card-body p-4">

            <TicketMessages
              messages={messages}
              currentRole="client"
              messagesEndRef={messagesEndRef}
            />

          </div>

        </section>


        {/* =================================================
            RÉPONSE
        ================================================= */}

        {canReply ? (

          <TicketReplyBox
            onSend={sendMessage}
            placeholder="Écrire votre message..."
          />

        ) : (

          <div
            className="alert alert-secondary d-flex align-items-center gap-2"
            role="status"
          >

            <i
              className="bi bi-lock"
              aria-hidden="true"
            />

            <span>
              Ce ticket est clôturé.
              Il n'est plus possible d'envoyer de message.
            </span>

          </div>

        )}

      </div>

    </DetailLayout>
  );
}