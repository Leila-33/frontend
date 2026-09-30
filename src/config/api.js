// config/api.js
const API_URL = `${window.location.origin}/api`;

const WS_URL =
  window.location.protocol === "https:"
    ? `wss://${window.location.host}/api`
    : `ws://${window.location.host}/api`;

export { API_URL, WS_URL };