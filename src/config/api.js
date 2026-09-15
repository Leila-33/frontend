// config/api.js

export const API_URL =
  window.location.protocol === "https:"
    ? "https://api.mmotors.com/api"
    : "http://localhost:8000/api";

export const WS_URL =
  window.location.protocol === "https:"
    ? "wss://api.mmotors.com/api"
    : "ws://localhost:8000/api";