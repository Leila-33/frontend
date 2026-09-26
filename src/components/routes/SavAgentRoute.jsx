import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const SavAgentRoute = () => {
  const { isAuthenticated, isSavAgent, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSavAgent) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default SavAgentRoute;
