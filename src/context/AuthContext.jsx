import { createContext, useContext, useState, useEffect } from "react";
import apiFetch from "../services/apiFetch";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH ME
  // =========================
  const fetchMe = async () => {

    try {

      const me = await apiFetch("/auth/me");
      setUser(me);

      return me;

    } catch (err) {

      console.error("Auth error:", err);

      setUser(null);
      localStorage.removeItem("access_token");

      throw err;
    }
  };

  // =========================
  // INIT AUTH
  // =========================
useEffect(() => {

  const init = async () => {

    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      await fetchMe();
    } catch (_) {
      // déjà géré dans fetchMe
    } finally {
      setLoading(false);
    }
  };

  init();

}, []);

  // =========================
  // LOGIN
  // =========================
  const login = async (tokens) => {

    localStorage.setItem("access_token", tokens.access_token);

    await fetchMe(); // IMPORTANT 🔥
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {

    localStorage.removeItem("access_token");

    setUser(null);
  };

const updateUser = (newUser) => {
  setUser(prev => ({
    ...prev,
    ...newUser
  }));
};


const [postLoginRedirect, setPostLoginRedirect] = useState(null);

const clearPostLoginRedirect = () => {
  setPostLoginRedirect(null);
};

return (
  <AuthContext.Provider
    value={{
      user,
      setUser,
      login,
      logout,
      fetchMe,
      loading,
      updateUser,

      // Redirection après connexion
      postLoginRedirect,
      setPostLoginRedirect,
      clearPostLoginRedirect,
    }}
  >
    {children}
  </AuthContext.Provider>
);
}

// =========================
// HOOK
// =========================
export const useAuth = () => {

  const context = useContext(AuthContext);

  const isAuthenticated = !!context.user;

  const isAdmin =
    context.user?.role === "admin";

  const isClient =
    context.user?.role === "client";

  const isSavAgent =
    context.user?.role === "sav_agent";

  const isSalesAgent =
    context.user?.role === "sales_agent";

  const isEmployee =
    isAdmin ||
    isSalesAgent ||
    isSavAgent;

  return {
    ...context,
    isAuthenticated,
    isAdmin,
    isClient,
    isSavAgent,
    isSalesAgent,
    isEmployee,
  };
};