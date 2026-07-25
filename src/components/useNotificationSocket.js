import { useEffect } from "react";
const WS_URL =
  window.location.protocol === "https:"
    ? "wss://api.mmotors.com"
    : "ws://localhost:8000/api";
    
export default function useNotificationSocket(userId, onMessage) {
useEffect(() => {
  if (!userId) return;

  console.log("WS CONNECTING for", userId);
  const ws = new WebSocket(`${WS_URL}/ws/notifications/${userId}`);

  ws.onopen = () => console.log("WS connected");

  ws.onmessage = (event) => {
    console.log("RAW WS:", event.data);

    const data = JSON.parse(event.data);
    onMessage?.(data);
  };

  ws.onerror = (e) => console.log("WS error", e);

  return () => {
    console.log("WS closing");
    ws.close();
  };
}, [userId]); // 👈 IMPORTANT
}