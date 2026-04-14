import { Navigate } from "react-router-dom";

export const getStoredRole = () =>
  (localStorage.getItem("adminRole") || "").toLowerCase();

export const getDefaultRouteByRole = (role) => {
  if (role === "admin") {
    return "/dashboard";
  }

  if (role === "instructor") {
    return "/instructor-dashboard";
  }

  return "/login";
};

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = getStoredRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return children;
};

export const RoleLandingRoute = () => {
  const token = localStorage.getItem("token");
  const role = getStoredRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRouteByRole(role)} replace />;
};
