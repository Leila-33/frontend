import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ClientRoute = () => {
  const { isAuthenticated, isClient, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isClient) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ClientRoute;
