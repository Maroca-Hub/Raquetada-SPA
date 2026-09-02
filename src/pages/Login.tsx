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
        background:
          "radial-gradient(circle at 50% 30%, #1f2a10 0%, #0e0e0e 70%)",
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
          <h1
            className="title-lob"
            style={{ fontSize: "32px", lineHeight: 1.1 }}
          >
            LOB
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--on-surface-variant)",
              marginTop: 6,
              fontWeight: 500,
            }}
          >
            Ranking da comunidade de padel, com evolução do seu perfil e
            fundamentos.
          </p>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: 8,
          }}
        >
          {/* Main Production Login Button */}
          <button
            type="button"
            onClick={() => void auth.signinRedirect()}
            className="btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: "15px" }}
          >
            <span className="material-symbols-outlined filled">login</span>
            Entrar
          </button>

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
            <button
              type="button"
              onClick={handleDevLogin}
              className="btn-secondary"
              style={{ width: "100%", padding: "20px", fontSize: "13px" }}
            >
              Entrar com conta de testes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
