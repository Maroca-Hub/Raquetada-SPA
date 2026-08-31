import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

export function Callback() {
  const auth = useAuth();

  if (auth.error) {
    return <main>Erro ao entrar: {auth.error.message}</main>;
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <main>Entrando...</main>;
}
