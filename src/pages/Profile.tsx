import { useState, useEffect, useCallback } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { PlayerCard } from "../components/card/PlayerCard";
import { Toast } from "../components/common/Toast";
import { useApi } from "../hooks/useApi";
import { isRatingReliable } from "../services/api";
import { clearDevSession, isDevSession } from "../devSession";
import type { PlayerProfileOutput } from "../types";

export function Profile() {
  const auth = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PlayerProfileOutput | null>(null);
  const [evaluationCount, setEvaluationCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await api.players.getMyProfile();
      setProfile(me);
      try {
        const evals = await api.players.listReceivedEvaluations(me.id);
        setEvaluationCount(evals.length);
      } catch {
        setEvaluationCount(null);
      }
    } catch (err) {
      setError((err as Error).message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSignOut = async () => {
    clearDevSession();
    if (auth.isAuthenticated) {
      try {
        await auth.signoutRedirect();
        return;
      } catch {
        await auth.removeUser();
      }
    }
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <Layout title="Meu perfil">
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--primary-fixed)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}
          >
            sports_tennis
          </span>
          <p style={{ marginTop: 8, fontSize: "13px", fontWeight: 600 }}>
            Carregando perfil...
          </p>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout title="Meu perfil">
        <div
          className="glass-panel"
          style={{
            borderRadius: "16px",
            padding: "28px 20px",
            textAlign: "center",
            color: "var(--error)",
          }}
        >
          <p style={{ fontWeight: 600 }}>
            Não foi possível carregar seu perfil.
          </p>
          {error && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--on-surface-variant)",
                marginTop: 4,
              }}
            >
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={loadProfile}
            className="btn-secondary"
            style={{ marginTop: 12 }}
          >
            Tentar novamente
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Meu perfil">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <section className="animate-fade-in">
          <PlayerCard profile={profile} showSkills />
        </section>

        <section
          className="glass-panel animate-fade-in"
          style={{
            borderRadius: "16px",
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "var(--on-surface-variant)" }}>
              Avaliações recebidas
            </span>
            <span style={{ fontWeight: 700 }}>{evaluationCount ?? "—"}</span>
          </div>
          {!isRatingReliable(profile.reliability) && (
            <p style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
              Você tem poucas partidas recentes, então seu rating pode não
              refletir bem o seu nível atual. Jogue e receba mais avaliações
              para consolidá-lo.
            </p>
          )}
        </section>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            paddingTop: "12px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/onboarding")}
            className="btn-primary"
            style={{ width: "100%", borderRadius: "var(--radius-md)" }}
          >
            <span
              className="material-symbols-outlined filled"
              style={{ fontSize: "18px" }}
            >
              edit
            </span>
            Editar meu nome
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="btn-secondary"
            style={{
              width: "100%",
              color: "var(--error)",
              borderColor: "rgba(255, 180, 171, 0.2)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              logout
            </span>
            {isDevSession() && !auth.isAuthenticated
              ? "Sair do modo dev"
              : "Sair da conta"}
          </button>
        </section>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </Layout>
  );
}
