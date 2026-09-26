import AppRoutes from "./routes/AppRoutes";
import "./App.css";

import GlobalLoader from "./components/GlobalLoader";

import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// =========================
// APP CONTENT
// =========================
function AppContent() {
  const { loading } = useAuth();

  // WAIT AUTH INIT
  if (loading) {
    return null;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <GlobalLoader />

      <AppRoutes />
    </>
  );
}

// =========================
// ROOT APP
// =========================
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
