import { useCallback, useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";

import apiFetch from "../services/apiFetch";
import { updateSupportTicketStatus } from "../services/supportTicketService";
import { WS_URL } from "../config/api";

/**
 * Hook centralisant la gestion d'un ticket SAV.
 *
 * Responsabilités :
 * - récupérer le ticket et ses messages ;
 * - maintenir la conversation en temps réel via WebSocket ;
 * - envoyer de nouveaux messages ;
 * - modifier le statut du ticket ;
 * - gérer le défilement automatique vers le dernier message.
 */
export default function useSupportTicket(id) {
  // =====================================================
  // ÉTAT DU TICKET
  // =====================================================

  /**
   * Ticket actuellement consulté.
   */
  const [ticket, setTicket] = useState(null);

  /**
   * Liste des messages associés au ticket.
   */
  const [messages, setMessages] = useState([]);

  // =====================================================
  // RÉFÉRENCES
  // =====================================================

  /**
   * Référence vers la connexion WebSocket.
   *
   * Elle permet notamment d'envoyer un message depuis
   * `sendMessage` sans provoquer de nouveau rendu React.
   */
  const wsRef = useRef(null);

  /**
   * Référence placée après le dernier message.
   *
   * Elle est utilisée pour faire défiler automatiquement
   * la conversation vers le bas.
   */
  const messagesEndRef = useRef(null);

  // =====================================================
  // DROIT DE RÉPONSE
  // =====================================================

  /**
   * Un ticket résolu ou fermé ne peut plus recevoir
   * de nouveau message.
   *
   * Tant que le ticket n'est pas chargé, la réponse
   * n'est pas autorisée.
   */
  const canReply =
    ticket !== null &&
    ticket.status !== "RESOLVED" &&
    ticket.status !== "CLOSED";

  // =====================================================
  // AUTO-SCROLL
  // =====================================================

  /**
   * Positionne la conversation sur le dernier message.
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  /**
   * Lorsque les messages changent, on fait défiler
   * automatiquement la conversation vers le bas.
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // =====================================================
  // RÉCUPÉRATION DU TICKET
  // =====================================================

  /**
   * Récupère le ticket et ses messages depuis l'API.
   *
   * Cette fonction est mémorisée afin de pouvoir être
   * utilisée dans les effets React sans provoquer
   * inutilement de nouvelles exécutions.
   */
  const fetchTicket = useCallback(async () => {
    try {
      const data = await apiFetch(`/support-tickets/${id}`);

      setTicket(data);

      setMessages(data.messages ?? []);
    } catch (error) {
      toast.error(error.message || "Impossible de récupérer le ticket.");
    }
  }, [id]);

  // =====================================================
  // CHARGEMENT INITIAL
  // =====================================================

  /**
   * Charge le ticket lorsque son identifiant change.
   */
  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  // =====================================================
  // CONNEXION WEBSOCKET
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // -----------------------------------------------------
    // AUTHENTIFICATION
    // -----------------------------------------------------

    if (!token) {
      toast.error("Vous devez être connecté.");

      return;
    }

    // -----------------------------------------------------
    // CRÉATION DE LA CONNEXION
    // -----------------------------------------------------

    const ws = new WebSocket(
      `${WS_URL}/ws/support-tickets/${id}?token=${encodeURIComponent(token)}`
    );

    wsRef.current = ws;

    // -----------------------------------------------------
    // CONNEXION ÉTABLIE
    // -----------------------------------------------------

    ws.onopen = () => {
      // La connexion est prête à recevoir/envoyer
      // des messages.
    };

    // -----------------------------------------------------
    // MESSAGE REÇU
    // -----------------------------------------------------

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          // ===============================================
          // NOUVEAU MESSAGE
          // ===============================================

          case "NEW_MESSAGE":
            setMessages((previousMessages) => {
              /**
               * Le backend peut éventuellement renvoyer
               * un message déjà présent dans la liste.
               *
               * On vérifie donc son identifiant avant
               * de l'ajouter afin d'éviter les doublons.
               */
              if (
                previousMessages.some((item) => item.id === message.data.id)
              ) {
                return previousMessages;
              }

              return [...previousMessages, message.data];
            });

            break;

          // ===============================================
          // STATUT MIS À JOUR
          // ===============================================

          case "STATUS_UPDATED":
            setTicket((previousTicket) => {
              /**
               * Le ticket peut ne pas encore être chargé
               * lorsque l'événement WebSocket arrive.
               */
              if (!previousTicket) {
                return previousTicket;
              }

              return {
                ...previousTicket,
                status: message.data.status,
              };
            });

            break;

          // ===============================================
          // TYPE INCONNU
          // ===============================================

          default:
            console.warn("Type de message WebSocket inconnu :", message.type);

            break;
        }
      } catch (error) {
        console.error(
          "Erreur lors du traitement du message WebSocket :",
          error
        );
      }
    };

    // -----------------------------------------------------
    // ERREUR
    // -----------------------------------------------------

    ws.onerror = () => {
      console.error("Erreur de connexion WebSocket.");
    };

    // -----------------------------------------------------
    // FERMETURE
    // -----------------------------------------------------

    ws.onclose = () => {
      /**
       * On ne fait rien ici :
       * la fermeture peut être volontaire lors du
       * changement de ticket ou du démontage du composant.
       */
    };

    // -----------------------------------------------------
    // NETTOYAGE
    // -----------------------------------------------------

    return () => {
      /**
       * On ferme la connexion lorsque le composant
       * est démonté ou lorsque l'identifiant du ticket
       * change.
       */
      ws.close();

      /**
       * On évite de conserver une référence vers une
       * connexion WebSocket fermée.
       */
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };
  }, [id]);

  // =====================================================
  // ENVOI D'UN MESSAGE
  // =====================================================

  /**
   * Envoie un nouveau message au ticket via WebSocket.
   *
   * Retourne :
   * - true si le message a été envoyé ;
   * - false si l'envoi n'a pas pu être effectué.
   */
  const sendMessage = useCallback((message) => {
    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!message?.trim()) {
      return false;
    }

    // -----------------------------------------------------
    // VÉRIFICATION DE LA CONNEXION
    // -----------------------------------------------------

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Connexion WebSocket indisponible.");

      return false;
    }

    // -----------------------------------------------------
    // ENVOI
    // -----------------------------------------------------

    wsRef.current.send(
      JSON.stringify({
        type: "NEW_MESSAGE",

        data: {
          message: message.trim(),
        },
      })
    );

    return true;
  }, []);

  // =====================================================
  // MODIFICATION DU STATUT
  // =====================================================

  /**
   * Modifie le statut du ticket via l'API.
   *
   * Le backend reste responsable de vérifier que la
   * transition de statut est autorisée.
   */
  const updateStatus = useCallback(async (ticketId, status) => {
    try {
      const updated = await updateSupportTicketStatus(ticketId, status);

      // Mise à jour du ticket local.
      setTicket(updated);

      toast.success("Statut mis à jour.");
    } catch (error) {
      toast.error(error.message || "Impossible de mettre à jour le statut.");
    }
  }, []);

  // =====================================================
  // VALEURS EXPOSÉES
  // =====================================================

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
