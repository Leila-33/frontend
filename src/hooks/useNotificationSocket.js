import { useEffect, useRef } from "react";
import { WS_URL } from "../config/api";

// Délai avant de tenter une nouvelle connexion
// lorsque la connexion WebSocket est interrompue.
const RECONNECT_DELAY = 3000;


export default function useNotificationSocket(onMessage) {
  // Référence vers la dernière version du callback.
  // Cela permet de recevoir les nouvelles fonctions onMessage
  // sans recréer la connexion WebSocket à chaque changement.
  const onMessageRef = useRef(onMessage);

  // Met à jour la référence du callback lorsque celui-ci change.
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    // Référence vers la connexion WebSocket courante.
    let ws = null;

    // Référence vers le timer utilisé pour la reconnexion.
    let reconnectTimer = null;

    // Indique si la connexion doit continuer à fonctionner.
    // Passe à false lors du démontage du composant.
    let shouldReconnect = true;

    const connect = () => {
      // Évite de créer une nouvelle connexion
      // après le démontage du composant.
      if (!shouldReconnect) {
        return;
      }

      console.log("WS CONNECTING");

      /*
       * Le navigateur envoie automatiquement le cookie
       * HttpOnly access_token lors de la connexion WebSocket.
       *
       * Le backend récupère ensuite l'utilisateur à partir
       * de ce token.
       */
      ws = new WebSocket(
        `${WS_URL}/ws/notifications`
      );

      // Connexion WebSocket établie avec succès.
      ws.onopen = () => {
        console.log("WS connected");
      };

      // Réception d'un message envoyé par le backend.
      ws.onmessage = (event) => {
        try {
          // Les messages WebSocket sont reçus sous forme de texte.
          // Ils sont convertis en objet JavaScript.
          const data = JSON.parse(event.data);

          console.log("WS message", data);

          // Utilise toujours la dernière version du callback.
          onMessageRef.current?.(data);
        } catch (error) {
          // Gestion d'un message qui ne contient pas
          // un JSON valide.
          console.error(
            "Erreur parsing message WebSocket :",
            error
          );
        }
      };

      // Gestion des erreurs de connexion WebSocket.
      ws.onerror = (error) => {
        console.error("WS error", error);
      };

      // Appelé lorsque la connexion est fermée.
      ws.onclose = (event) => {
        console.log(
          "WS closed",
          event.code,
          event.reason
        );

        // Si le composant a été démonté,
        // aucune reconnexion ne doit être effectuée.
        if (!shouldReconnect) {
          return;
        }

        // Attend quelques secondes avant de tenter
        // une nouvelle connexion.
        reconnectTimer = setTimeout(() => {
          connect();
        }, RECONNECT_DELAY);
      };
    };

    // Première connexion WebSocket.
    connect();

    // Nettoyage lors du démontage du composant.
    return () => {
      // Empêche toute nouvelle tentative de reconnexion.
      shouldReconnect = false;

      // Annule une éventuelle reconnexion programmée.
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      // Ferme proprement la connexion WebSocket active.
      if (ws) {
        ws.close();
      }

      console.log("WS cleanup");
    };
  }, []);
}