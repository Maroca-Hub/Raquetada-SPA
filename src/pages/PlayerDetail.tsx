import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { PlayerCard } from "../components/card/PlayerCard";
import { useApi } from "../hooks/useApi";
import { isRatingReliable } from "../services/api";
import type { PlayerProfileOutput } from "../types";

export function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const playerId = id ?? "";
  const api = useApi();

  const [profile, setProfile] = useState<PlayerProfileOutput | null>(null);
  const [evaluationCount, setEvaluationCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const output = await api.players.get(playerId);
        if (cancelled) return;
        setError(null);
        setProfile(output);
        try {
          const evals = await api.players.listReceivedEvaluations(playerId);
          if (!cancelled) setEvaluationCount(evals.length);
        } catch {
          if (!cancelled) setEvaluationCount(null);
        }
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, playerId]);

  if (loading) {
    return (
      <Layout showBack title="Carregando...">
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
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout showBack title="Jogador não encontrado">
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
            Não foi possível carregar este jogador.
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
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack title={profile.name}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
              Este jogador tem poucas partidas recentes, então o geral pode não
              refletir bem o nível atual.
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
}
