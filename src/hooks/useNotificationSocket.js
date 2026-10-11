import { useEffect, useRef } from "react";

import { WS_URL } from "../config/api";
import refreshSession, {
  RefreshSessionError,
} from "../services/refreshSession";

// Délai avant une nouvelle tentative de connexion.
const RECONNECT_DELAY = 3000;

export default function useNotificationSocket(
  onMessage,
  enabled = true
) {
  // Conserve toujours le dernier callback React.
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // --------------------------------------------------------
    // ÉTAT LOCAL DU WEBSOCKET
    // --------------------------------------------------------

    let ws = null;
    let reconnectTimer = null;
    let shouldReconnect = true;
    let connecting = false;
    let authenticationFailed = false;

    // Indique que la page est temporairement masquée
    // ou mise en cache par le navigateur.
    let pageHidden = document.visibilityState === "hidden";

    // Une restauration peut arriver pendant le refresh.
    let reconnectWhenReady = false;

    // --------------------------------------------------------
    // PROGRAMMER UNE RECONNEXION
    // --------------------------------------------------------

    const scheduleReconnect = (delay = RECONNECT_DELAY) => {
      if (
        !shouldReconnect ||
        pageHidden ||
        authenticationFailed
      ) {
        return;
      }

      // Évite plusieurs timers simultanés.
      clearTimeout(reconnectTimer);

      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    };

    // --------------------------------------------------------
    // CONNEXION WEBSOCKET
    // --------------------------------------------------------

    const connect = async () => {
      if (
        !shouldReconnect ||
        pageHidden ||
        connecting ||
        authenticationFailed
      ) {
        return;
      }

      connecting = true;

      try {
        // Renouvelle la session avant chaque connexion.
        // refreshSession partage la requête HTTP en cours.
        await refreshSession();

        // La page a pu être masquée pendant le refresh.
        if (!shouldReconnect || pageHidden) {
          return;
        }

        // Construit l'URL à partir de la configuration.
        // WS_URL doit être une URL de base valide.
        const baseUrl = WS_URL.replace(/\/+$/, "");
        const socketUrl = new URL(
          `${baseUrl}/ws/notifications`
        );

        // HTTPS -> WSS ; HTTP -> WS.
        socketUrl.protocol =
          socketUrl.protocol === "https:" ||
          socketUrl.protocol === "wss:"
            ? "wss:"
            : "ws:";

        ws = new WebSocket(socketUrl.toString());

        // ----------------------------------------------------
        // CONNEXION ÉTABLIE
        // ----------------------------------------------------

        ws.onopen = () => {
          console.log("WS connected");
        };

        // ----------------------------------------------------
        // RÉCEPTION DES NOTIFICATIONS
        // ----------------------------------------------------

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessageRef.current?.(data);
          } catch (error) {
            console.error(
              "Erreur lors du traitement du message WebSocket",
              error
            );
          }
        };

        // ----------------------------------------------------
        // ERREUR WEBSOCKET
        // ----------------------------------------------------

        ws.onerror = (error) => {
          // L'événement error ne donne pas toujours
          // la cause précise de l'échec.
          console.error("WS error", error);
        };

        // ----------------------------------------------------
        // FERMETURE WEBSOCKET
        // ----------------------------------------------------

        ws.onclose = (event) => {
          console.log(
            "WS closed",
            event.code,
            event.reason
          );

          // Pas de reconnexion si la page est masquée,
          // démontée ou si l'authentification a échoué.
          if (
            !shouldReconnect ||
            pageHidden ||
            authenticationFailed
          ) {
            return;
          }

          scheduleReconnect();
        };
      } catch (error) {
        if (!shouldReconnect || pageHidden) {
          return;
        }

        console.error(
          "Impossible d'établir le WebSocket",
          error
        );

        // Échec définitif du renouvellement de session.
        if (
          error instanceof RefreshSessionError &&
          (error.status === 401 || error.status === 403)
        ) {
          // refreshSession.js déclenche déjà le gestionnaire
          // de déconnexion de l'AuthContext.
          authenticationFailed = true;
          return;
        }

        // Une erreur réseau ou un HTTP 500 est temporaire :
        // on réessaiera sans déconnecter l'utilisateur.
        scheduleReconnect();
      } finally {
        connecting = false;

        // Si la page a été restaurée pendant le refresh,
        // relance la connexion maintenant que le refresh
        // précédent est terminé.
        if (
          reconnectWhenReady &&
          shouldReconnect &&
          !pageHidden &&
          !authenticationFailed
        ) {
          reconnectWhenReady = false;
          connect();
        }
      }
    };

    // --------------------------------------------------------
    // GESTION DU BFCache
    // --------------------------------------------------------

    const handlePageHide = () => {
      pageHidden = true;
      clearTimeout(reconnectTimer);
      reconnectTimer = null;

      // Ferme proprement le socket sans déclencher
      // une reconnexion automatique dans onclose.
      if (ws) {
        const currentWs = ws;
        ws = null;

        currentWs.onclose = null;
        currentWs.onerror = null;
        currentWs.onopen = null;
        currentWs.onmessage = null;

        if (
          currentWs.readyState === WebSocket.OPEN ||
          currentWs.readyState === WebSocket.CONNECTING
        ) {
          currentWs.close(1000, "Page mise en veille");
        }
      }
    };

    const handlePageShow = (event) => {
      // Le navigateur a restauré la page depuis le BFCache.
      if (!event.persisted) {
        return;
      }

      pageHidden = false;

      if (connecting) {
        // Le refresh est encore en cours.
        // La connexion sera relancée dans finally.
        reconnectWhenReady = true;
      } else {
        // Reconnexion immédiate après restauration.
        scheduleReconnect(0);
      }
    };

    const handleVisibilityChange = () => {
      // Évite de laisser un timer tourner en arrière-plan.
      if (document.visibilityState === "hidden") {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    // Première connexion.
    connect();

    // --------------------------------------------------------
    // NETTOYAGE REACT
    // --------------------------------------------------------

    return () => {
      shouldReconnect = false;
      reconnectWhenReady = false;

      clearTimeout(reconnectTimer);

      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      if (ws) {
        const currentWs = ws;
        ws = null;

        currentWs.onclose = null;
        currentWs.onerror = null;
        currentWs.onopen = null;
        currentWs.onmessage = null;

        if (
          currentWs.readyState === WebSocket.OPEN ||
          currentWs.readyState === WebSocket.CONNECTING
        ) {
          currentWs.close(1000, "Nettoyage React");
        }
      }

      console.log("WS cleanup");
    };
  }, [enabled]);
}