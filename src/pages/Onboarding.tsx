import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { Toast } from "../components/common/Toast";

export function Onboarding() {
  const api = useApi();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.players
      .getMyProfile()
      .then((p) => {
        if (active && p?.name) setName(p.name);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [api]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setToastMessage("Por favor, preencha seu nome.");
      return;
    }
    setSubmitting(true);
    try {
      await api.players.updateMyProfile({ name: name.trim() });
      navigate("/", { replace: true });
    } catch (err) {
      setToastMessage((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-lowest)",
        color: "var(--on-surface)",
        padding: "24px 16px 48px",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "var(--primary-fixed)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Bem-vindo ao Lob
          </span>
          <h1
            className="font-display"
            style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "var(--on-surface)",
              marginTop: 4,
            }}
          >
            Como você quer ser chamado?
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--on-surface-variant)",
              marginTop: 4,
            }}
          >
            Seu geral e seus fundamentos evoluem conforme você joga e recebe
            avaliações.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel"
          style={{
            borderRadius: "20px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              maxLength={120}
              disabled={!loaded}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "var(--surface-container-high)",
                border: "1px solid var(--border-subtle)",
                color: "var(--on-surface)",
                fontSize: "14px",
                outline: "none",
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || !loaded}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              borderRadius: "var(--radius-full)",
            }}
          >
            <span className="material-symbols-outlined filled">
              sports_tennis
            </span>
            {submitting ? "Salvando..." : "Entrar na quadra"}
          </button>
        </form>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
