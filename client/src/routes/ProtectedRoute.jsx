import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LoadingScreen from "../components/layout/LoadingScreen";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles) {
    const userRole = user.role;
    const isAllowed = allowedRoles.some((r) => {
      if (r === userRole) return true;
      if (r === "STUDENT" && (userRole === "TRAINEE" || userRole === "STUDENT")) return true;
      if (r === "TRAINEE" && (userRole === "TRAINEE" || userRole === "STUDENT")) return true;
      if (r === "TEACHER" && (userRole === "TRAINER" || userRole === "TEACHER")) return true;
      if (r === "TRAINER" && (userRole === "TRAINER" || userRole === "TEACHER")) return true;
      if (r === "ADMIN" && userRole === "ADMIN") return true;
      return false;
    });

    if (!isAllowed) return <Navigate to="/dashboard" replace />;
  }

  return children;
}