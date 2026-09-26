import { useEffect, useRef } from "react";
import { WS_URL } from "../config/api";

const RECONNECT_DELAY = 3000;

export default function useNotificationSocket(userId, onMessage) {
  const onMessageRef = useRef(onMessage);

  // Garde toujours la dernière version du callback
  // sans recréer la connexion WebSocket.
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId) return;

    let ws = null;
    let reconnectTimer = null;
    let shouldReconnect = true;

    const connect = () => {
      if (!shouldReconnect) return;

      console.log("WS CONNECTING for", userId);

      ws = new WebSocket(`${WS_URL}/ws/notifications/${userId}`);

      ws.onopen = () => {
        console.log("WS connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WS EVENT TYPE:", data.type);
          console.log("WS DATA:", data);
          onMessageRef.current?.(data);
        } catch (error) {
          console.error("Erreur parsing message WebSocket :", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WS error", error);
      };

      ws.onclose = (event) => {
        console.log("WS closed", event.code, event.reason);

        if (!shouldReconnect) return;

        reconnectTimer = setTimeout(() => {
          connect();
        }, RECONNECT_DELAY);
      };
    };

    connect();

    return () => {
      shouldReconnect = false;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      if (ws) {
        ws.close();
      }

      console.log("WS cleanup");
    };
  }, [userId]);
}
