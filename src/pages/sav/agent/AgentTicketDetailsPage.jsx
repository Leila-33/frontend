/**
 * Page de détail d'un ticket SAV pour un agent.
 *
 * Responsabilités :
 * - récupérer l'identifiant du ticket depuis l'URL ;
 * - charger les données via `useSupportTicket` ;
 * - afficher les informations du ticket ;
 * - afficher la conversation en temps réel ;
 * - permettre à l'agent de répondre ;
 * - permettre la modification du statut.
 */
import { useLocation, useParams } from "react-router-dom";

import useSupportTicket from "../../../hooks/useSupportTicket";

import TicketHeader from "../../../components/sav/chat/TicketHeader";
import TicketMessages from "../../../components/sav/chat/TicketMessages";
import TicketReplyBox from "../../../components/sav/chat/TicketReplyBox";

import DetailLayout from "../../../layouts/DetailLayout";

import { useAuth } from "../../../contexts/AuthContext";

import { getTicketBreadcrumb } from "../../../utils/breadcrumb";


export default function AgentTicketDetailsPage() {

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
   * Son rôle est utilisé pour construire
   * le fil d'Ariane.
   */
  const { user } = useAuth();


  /**
   * Informations de navigation transmises
   * lors de l'ouverture du ticket.
   */
  const location = useLocation();


  /**
   * Filtre utilisé dans la liste précédente.
   *
   * Il permet de conserver le contexte de navigation
   * lors du retour vers la liste des tickets.
   */
  const filter =
    location.state?.filter ?? "all";


  // =====================================================
  // DONNÉES DU TICKET
  // =====================================================

  const {
    ticket,
    messages,
    sendMessage,
    updateStatus,
    messagesEndRef,
    canReply,
  } = useSupportTicket(id);


  // =====================================================
  // CHARGEMENT
  // =====================================================

  /**
   * Tant que le ticket n'est pas chargé,
   * on affiche un état de chargement.
   */
  if (!ticket) {
    return (
      <div className="container py-5 text-center text-muted">

        <div
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        />

        Chargement du ticket...

      </div>
    );
  }


  // =====================================================
  // ÉTAT DU TICKET
  // =====================================================

  /**
   * Un ticket résolu ou fermé ne peut plus
   * être modifié depuis le sélecteur de statut.
   */
  const isClosed =
    ticket.status === "RESOLVED" ||
    ticket.status === "CLOSED";


  // =====================================================
  // BREADCRUMB
  // =====================================================

  /**
   * Le breadcrumb est un tableau d'objets.
   *
   * Il est transmis au `DetailLayout`, qui le donne
   * ensuite au composant `Breadcrumb`.
   */
  const breadcrumb = getTicketBreadcrumb({
    role: user?.role,
    ticketId: ticket.id,
    filter,
  });


  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <DetailLayout
      breadcrumb={breadcrumb}
    >

      {/* =================================================
          CONTENU PRINCIPAL
      ================================================= */}

      <div className="container-fluid py-4">

        {/* =================================================
            EN-TÊTE DU TICKET
        ================================================= */}

        <TicketHeader
          ticket={ticket}
          showStatusSelector={!isClosed}
          onStatusChange={updateStatus}
        />


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <section className="card border-0 shadow-sm rounded-4 mb-4">

          <div className="card-body p-4">

            <h5 className="fw-bold mb-3">
              Description
            </h5>

            <p className="mb-0 text-muted text-break">
              {ticket.description || "Aucune description."}
            </p>

          </div>

        </section>


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
              currentRole="sav_agent"
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
            placeholder="Répondre au client..."
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