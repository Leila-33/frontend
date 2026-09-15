import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function GuestRoute({ children }) {
  const {
    isAuthenticated,
    isAdmin,
    isClient,
    isSavAgent,
    isSalesAgent,
    postLoginRedirect,
  clearPostLoginRedirect,
  } = useAuth();


if (isAuthenticated) {

  if (postLoginRedirect) {

    const redirect = postLoginRedirect;

    clearPostLoginRedirect();

    return <Navigate to={redirect} replace />;
  }
    let redirectTo = "/dashboard"; // fallback client

    if (isAdmin) {
      redirectTo = "/admin/dashboard";
    } else if (isSavAgent) {
      redirectTo = "/sav/dashboard";
    } else if (isSalesAgent) {
      redirectTo = "/sales/dashboard";
    } else if (isClient) {
      redirectTo = "/dashboard";
    }

    return <Navigate to={redirectTo} replace />;
  }

  return children;
}