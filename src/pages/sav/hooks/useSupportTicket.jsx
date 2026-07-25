import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../../../services/apiFetch";
import { updateSupportTicketStatus } from "../service/supportTicketService";

export default function useSupportTicket(id) {
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
const canReply =
  ticket &&
  ticket.status !== "RESOLVED" &&
  ticket.status !== "CLOSED";
  // =====================
  // AUTO SCROLL
  // =====================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // =====================
  // FETCH TICKET
  // =====================
  const fetchTicket = useCallback(async () => {
    try {
      const data = await apiFetch(`/support-tickets/${id}`, {
      });

      setTicket(data);
      setMessages(data.messages || []);
    } catch (err) {
      toast.error(err.message);
    }
  }, [id]);

  // =====================
  // CONNECT WS
  // =====================
  useEffect(() => {
    fetchTicket();

    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Vous devez être connecté.");
      return;
    }

    const ws = new WebSocket(
      `ws://localhost:8000/api/ws/support-tickets/${id}?token=${encodeURIComponent(
        token
      )}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
  try {
    const msg = JSON.parse(event.data);

    switch (msg.type) {

      case "NEW_MESSAGE":
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.data.id)) {
            return prev;
          }

          return [...prev, msg.data];
        });
        break;

      case "STATUS_UPDATED":
        setTicket((prev) => ({
          ...prev,
          status: msg.data.status,
        }));
        break;

      default:
        console.warn("Unknown WS message:", msg.type);
        break;
    }

  } catch (err) {
    console.error(err);
  }
};

    ws.onerror = (err) => {
      console.error(err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [id, fetchTicket]);

  // =====================
  // SEND MESSAGE
  // =====================
  const sendMessage = (message) => {
    if (!message.trim()) return false;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Connexion WebSocket indisponible.");
      return false;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "NEW_MESSAGE",
        data: {
          message,
        },
      })
    );

    return true;
  };

  // =====================
  // UPDATE STATUS
  // =====================
const updateStatus = async (ticketId, status) => {
 const updated = await updateSupportTicketStatus(
  ticketId,
  status,
);

setTicket(updated);

toast.success("Statut mis à jour");
};

  return {
    ticket,
    messages,
    fetchTicket,
    sendMessage,
    updateStatus,
    messagesEndRef,
    canReply,
  };
}