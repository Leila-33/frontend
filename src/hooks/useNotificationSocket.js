import { useEffect, useRef } from "react";
import { WS_URL } from "../config/api";

// Délai avant de tenter une nouvelle connexion
// lorsque la connexion WebSocket est interrompue.
const RECONNECT_DELAY = 3000;

export default function useNotificationSocket(
  onMessage,
  enabled = true
) {
  // Référence vers la dernière version du callback.
  // Cela évite de recréer la connexion WebSocket
  // lorsque la fonction onMessage change.
  const onMessageRef = useRef(onMessage);

  // Met à jour la référence du callback.
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    // Si l'utilisateur n'est pas authentifié,
    // aucune connexion WebSocket ne doit être créée.
    if (!enabled) {
      return;
    }

    // Référence vers la connexion WebSocket courante.
    let ws = null;

    // Référence vers le timer de reconnexion.
    let reconnectTimer = null;

    // Indique si le WebSocket doit continuer
    // à fonctionner et à se reconnecter.
    let shouldReconnect = true;

    const connect = () => {
      // Évite une nouvelle connexion après le nettoyage.
      if (!shouldReconnect) {
        return;
      }

      console.log("WS CONNECTING");

      /*
       * Le navigateur envoie automatiquement les cookies
       * associés au domaine lors de la connexion WebSocket.
       *
       * Le backend peut ainsi récupérer l'utilisateur
       * à partir du cookie HttpOnly access_token.
       */
      ws = new WebSocket(
        `${WS_URL}/ws/notifications`
      );

      // Connexion WebSocket établie.
      ws.onopen = () => {
        console.log("WS connected");
      };

      // Réception d'un message envoyé par le backend.
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WS message received", data);

          // Utilise toujours la dernière version
          // du callback fourni par le composant.
          onMessageRef.current?.(data);
        } catch (error) {
          console.error(
            "Erreur parsing message WebSocket :",
            error
          );
        }
      };

      // Gestion des erreurs WebSocket.
      ws.onerror = (error) => {
        console.error(
          "WS error",
          error
        );
      };

      // Connexion fermée.
      ws.onclose = (event) => {
        console.log(
          "WS closed",
          event.code,
          event.reason
        );

        // Si le hook est désactivé ou démonté,
        // aucune reconnexion ne doit être effectuée.
        if (!shouldReconnect) {
          return;
        }

        // Programme une nouvelle tentative.
        reconnectTimer = setTimeout(() => {
          connect();
        }, RECONNECT_DELAY);
      };
    };

    // Première connexion.
    connect();

    // Nettoyage lorsque :
    // - le composant est démonté ;
    // - enabled passe à false.
    return () => {
      shouldReconnect = false;

      // Annule une éventuelle reconnexion programmée.
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      // Ferme la connexion active.
      if (ws) {
        ws.close();
      }

      console.log("WS cleanup");
    };
  }, [enabled]);
}