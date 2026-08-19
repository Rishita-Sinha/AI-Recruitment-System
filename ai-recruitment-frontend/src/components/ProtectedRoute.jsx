import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const storedAuth =
    localStorage.getItem("auth") ||
    sessionStorage.getItem("auth");

  // User is not logged in
  if (!storedAuth) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  try {
    const authData = JSON.parse(storedAuth);

    // Make sure valid recruiter information exists
    if (!authData?.recruiter) {
      localStorage.removeItem("auth");
      sessionStorage.removeItem("auth");

      return <Navigate to="/login" replace />;
    }

    // User is authenticated
    return children;

  } catch (error) {
    console.error("Authentication data error:", error);

    localStorage.removeItem("auth");
    sessionStorage.removeItem("auth");

    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;