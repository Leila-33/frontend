import {
  startLoading,
  stopLoading
} from "./loaderService";
const API_URL = "http://localhost:8000/api";

// =========================
// API FETCH CENTRALISÉ
// =========================
let refreshPromise = null;

export class ApiError extends Error {
  constructor(message, status, data) {
    super(typeof message === "string" ? message : JSON.stringify(message));
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function apiFetch(url, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    ...rest
  } = options;

  const callApi = async (token) => {
    const finalHeaders = {
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...headers,
    };

    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }

    const finalBody =
      body && typeof body === "object" && !(body instanceof FormData)
        ? JSON.stringify(body)
        : body;

    return fetch(API_URL + url, {
      method,
      headers: finalHeaders,
      body: method === "GET" ? undefined : finalBody,
      credentials: "include",
      ...rest,
    });
  };

startLoading();
  try {
    let token = localStorage.getItem("access_token");

    let res = await callApi(token);

    // =========================
    // REFRESH TOKEN
    // =========================
    if (res.status === 401 && token) {

      if (!refreshPromise) {
        refreshPromise = fetch(API_URL + "/auth/refresh", {
          method: "POST",
          credentials: "include",
        })
          .then(async (r) => {
            const data = await r.json();
            if (!r.ok) {
              throw new ApiError("Session expirée", r.status, data);
            }
            return data;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const refreshData = await refreshPromise;

        token = refreshData.access_token;
        localStorage.setItem("access_token", token);

        res = await callApi(token);
      } catch (err) {
        localStorage.removeItem("access_token");
        throw new ApiError("Session expirée", 401, null);
      }
    }

    // =========================
    // PARSE RESPONSE
    // =========================
    let data = null;

    try {
      data = await res.json();
    } catch {
      data = null;
    }

    // =========================
    // ERROR HANDLING (FASTAPI CLEAN FORMAT)
    // =========================
    if (!res.ok) {

      let message = "API_ERROR";

      // 🔥 TON FORMAT BACKEND
      if (Array.isArray(data?.detail)) {
        message = data.detail[0]?.message || "VALIDATION_ERROR";
      }

      else if (typeof data?.detail === "string") {
        message = data.detail;
      }

      else if (data?.message) {
        message = data.message;
      }

      throw new ApiError(message, res.status, data);
    }

    return data;

  } catch (err) {

    // NETWORK ERROR
    if (!err.status) {
      throw new ApiError(
        "Erreur réseau (serveur inaccessible)",
        0,
        null
      );
    }

    throw err;

  } finally {
    stopLoading();
  }
}

export default apiFetch;