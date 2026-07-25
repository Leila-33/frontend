import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SalesAgentRoute = () => {

  const {
    isAuthenticated,
    isSalesAgent,
    loading
  } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!isSalesAgent) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
};

export default SalesAgentRoute;