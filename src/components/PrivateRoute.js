import { Navigate } from "react-router-dom";
import { useAdminAuth, hasPermission } from "../contexts/AdminAuthContext";

export default function PrivateRoute({ children, requiredPermission }) {
  const { adminToken, adminInfo } = useAdminAuth();
  const token = adminToken || localStorage.getItem("adminToken");
  const info = adminInfo || JSON.parse(localStorage.getItem("adminInfo") || "null");

  if (!token) {
    // No token -> redirect to login
    return <Navigate to="/login" />;
  }

  // If a specific permission is required, check it
  if (requiredPermission) {
    if (!hasPermission(info, requiredPermission)) {
      // Redirect to products page if no permission
      return <Navigate to="/products" />;
    }
  }

  // Has token -> show component
  return children;
}
