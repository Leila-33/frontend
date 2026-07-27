import { useParams } from "react-router-dom";

import useSupportTicket from "../../../hooks/useSupportTicket";
import TicketHeader from "../../../components/sav/chat/TicketHeader";
import TicketMessages from "../../../components/sav/chat/TicketMessages";
import TicketReplyBox from "../../../components/sav/chat/TicketReplyBox";
import { useAuth } from "../../../context/AuthContext";
import { getTicketBreadcrumb } from "../../../utils/breadcrumb";
import DetailLayout from "../../../layouts/DetailLayout";

export default function ClientTicketDetailPage() {

  const { id } = useParams();

  const { user } = useAuth();

  const {
    ticket,
    messages,
    sendMessage,
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



  return (

    <DetailLayout

      breadcrumb={
        getTicketBreadcrumb({
          role: user?.role,
          ticketId: ticket.id,
        })
      }

    >


      <div className="container py-4">


        {/* HEADER */}

        <TicketHeader

          ticket={ticket}

          showStatusSelector={false}

        />



        {/* MESSAGES */}

        <div

          className="card shadow-sm mb-3"

          style={{
            height: "60vh",
            overflowY: "auto"
          }}

        >

          <div className="card-body">


            <TicketMessages

              messages={messages}

              currentRole="CLIENT"

              messagesEndRef={messagesEndRef}

            />


          </div>

        </div>



        {/* INPUT */}

        {canReply ? (

          <TicketReplyBox

            onSend={sendMessage}

            placeholder="Écrire votre message..."

          />


        ) : (

          <div className="alert alert-secondary">

            Ce ticket est clôturé.
            Il n'est plus possible d'envoyer de message.

          </div>

        )}


      </div>


    </DetailLayout>

  );

}