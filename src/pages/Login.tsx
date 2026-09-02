import { useAuth } from "react-oidc-context";
import { Navigate, useNavigate } from "react-router-dom";
import { enableDevSession, isDevSession } from "../devSession";

export function Login() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (auth.isAuthenticated || isDevSession()) {
    return <Navigate to="/" replace />;
  }

  const handleDevLogin = async () => {
    enableDevSession();
    // Drop any stale OIDC session so the app can't fall back to that identity.
    try {
      await auth.removeUser();
    } catch {
      // ignore — nothing to clear
    }
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "radial-gradient(circle at 50% 30%, #1f2a10 0%, #0e0e0e 70%)",
        position: "relative",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: "24px",
          padding: "36px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "24px",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
        }}
      >
        {/* Brand Icon */}
        <div
          className="neon-glow"
          style={{
            width: 72,
            height: 72,
            borderRadius: "20px",
            backgroundColor: "rgba(210, 240, 0, 0.15)",
            border: "2px solid var(--primary-fixed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary-fixed)",
          }}
        >
          <span
            className="material-symbols-outlined filled"
            style={{ fontSize: "40px" }}
          >
            sports_tennis
          </span>
        </div>

        <div>
          <h1 className="title-raquetada" style={{ fontSize: "32px", lineHeight: 1.1 }}>
            RAQUETADA
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--on-surface-variant)",
              marginTop: 6,
              fontWeight: 500,
            }}
          >
            Partidas de Padel, Rankings Gamificados e Estatísticas
          </p>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px", marginTop: 8 }}>
          {/* Main Production Login Button */}
          <button
            type="button"
            onClick={() => void auth.signinRedirect()}
            className="btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: "15px" }}
          >
            <span className="material-symbols-outlined filled">login</span>
            Entrar na Conta
          </button>

          {/* Dev-only Mock Login option */}
          {import.meta.env.DEV && (
            <div
              style={{
                marginTop: 8,
                borderTop: "1px dashed rgba(210, 240, 0, 0.25)",
                paddingTop: 14,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--primary-fixed)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                🛠️ Modo Desenvolvimento
              </span>
              <button
                type="button"
                onClick={handleDevLogin}
                className="btn-secondary"
                style={{ width: "100%", padding: "10px", fontSize: "13px" }}
              >
                <span className="material-symbols-outlined">play_circle</span>
                Entrar em modo dev (sem Keycloak)
              </button>
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 16, width: "100%" }}>
          <span style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
            ⚡ Performance Dark • Padel Match Evolution
          </span>
        </div>
      </div>
    </div>
  );
}
