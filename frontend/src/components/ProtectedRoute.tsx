import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!accessToken || !user) {
    // Redirect to login page, preserving the attempted destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.name)) {
    // If user role is not allowed, redirect to their role's default view
    let defaultRedirect = "/login";
    const roleName = user.role.name.toLowerCase();
    
    if (roleName === "admin") {
      defaultRedirect = "/admin/dashboard";
    } else if (roleName === "manager" || roleName === "project manager") {
      defaultRedirect = "/manager/dashboard";
    } else if (roleName === "employee") {
      defaultRedirect = "/employee/dashboard";
    }

    return <Navigate to={defaultRedirect} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
