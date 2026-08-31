import { useAuth } from "react-oidc-context";
import { Navigate, Outlet } from "react-router-dom";

export function RequireAuth() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <main>Carregando...</main>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
