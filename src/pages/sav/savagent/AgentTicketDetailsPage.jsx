import { useParams } from "react-router-dom";

import useSupportTicket from "../hooks/useSupportTicket";
import TicketHeader from "../components/chat/TicketHeader";
import TicketMessages from "../components/chat/TicketMessages";
import TicketReplyBox from "../components/chat/TicketReplyBox";

export default function AgentTicketDetailsPage() {
  const { id } = useParams();

  const {
    ticket,
    messages,
    sendMessage,
    updateStatus,
    messagesEndRef,
    canReply,
  } = useSupportTicket(id);

  if (!ticket) {
    return (
      <div className="container py-5 text-center text-muted">
        Chargement...
      </div>
    );
  }

  const isClosed =
    ticket.status === "RESOLVED" ||
    ticket.status === "CLOSED";

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <TicketHeader
        ticket={ticket}
        showStatusSelector={!isClosed}
        onStatusChange={updateStatus}
      />

      {/* DESCRIPTION */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5>Description</h5>
          <p className="mb-0">{ticket.subject}</p>
        </div>
      </div>

      {/* MESSAGES */}
      <div
        className="card shadow-sm mb-4"
        style={{ height: "60vh", overflowY: "auto" }}
      >
        <div className="card-body">
          <TicketMessages
            messages={messages}
            currentRole="sav_agent"
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>

      {/* REPLY */}
      {canReply ? (
        <TicketReplyBox
          onSend={sendMessage}
          placeholder="Répondre au client..."
        />
      ) : (
        <div className="alert alert-secondary">
          Ce ticket est clôturé. Il n'est plus possible d'envoyer de message.
        </div>
      )}

    </div>
  );
}