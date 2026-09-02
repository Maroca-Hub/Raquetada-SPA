import { useNavigate, useLocation, Link } from "react-router-dom";

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
}

export function TopHeader({ title, showBack }: TopHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/" || location.pathname === "/feed";
  const shouldShowBack = showBack ?? !isHome;

  return (
    <header
      className="glass-header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {shouldShowBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: "var(--surface-container-high)",
              border: "1px solid var(--border-subtle)",
              color: "var(--on-surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px" }}
            >
              arrow_back
            </span>
          </button>
        ) : (
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                backgroundColor: "rgba(210, 240, 0, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(210, 240, 0, 0.3)",
              }}
            >
              <span
                className="material-symbols-outlined filled"
                style={{ color: "var(--primary-fixed)", fontSize: "20px" }}
              >
                sports_tennis
              </span>
            </div>
            <span className="title-lob" style={{ fontSize: "20px" }}>
              LOB
            </span>
          </Link>
        )}

        {shouldShowBack && title && (
          <span
            className="font-display"
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--on-surface)",
            }}
          >
            {title}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link
          to="/profile"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "var(--surface-container-high)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            color: "var(--primary-fixed)",
            overflow: "hidden",
          }}
          title="Meu Perfil"
        >
          <span
            className="material-symbols-outlined filled"
            style={{ fontSize: "20px" }}
          >
            person
          </span>
        </Link>
      </div>
    </header>
  );
}
