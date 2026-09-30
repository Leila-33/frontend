// config/api.js
const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api"
    : `${window.location.origin}/api`;

const WS_URL =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:8000/api"
    : (
        window.location.protocol === "https:"
          ? `wss://${window.location.host}/api`
          : `ws://${window.location.host}/api`
      );

export { API_URL, WS_URL };