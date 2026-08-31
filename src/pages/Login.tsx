import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

export function Login() {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main>
      <h1>Raquetada</h1>
      <button type="button" onClick={() => void auth.signinRedirect()}>
        Entrar
      </button>
    </main>
  );
}
