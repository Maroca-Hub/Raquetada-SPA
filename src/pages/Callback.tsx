import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

export function Callback() {
  const auth = useAuth();

  if (auth.error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          color: "var(--error)",
          textAlign: "center",
          gap: 12,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>
          error
        </span>
        <h2 className="font-display" style={{ fontSize: "20px" }}>
          Erro na autenticação
        </h2>
        <p style={{ color: "var(--on-surface-variant)", fontSize: "14px" }}>{auth.error.message}</p>
        <a href="/login" className="btn-secondary" style={{ marginTop: 12 }}>
          Voltar ao Login
        </a>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--primary-fixed)",
        gap: 12,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "36px", animation: "spin 1s linear infinite" }}>
        sports_tennis
      </span>
      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--on-surface)" }}>
        Autenticando com Keycloak...
      </span>
    </div>
  );
}
