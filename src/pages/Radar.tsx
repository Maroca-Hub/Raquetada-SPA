import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { useApi } from "../hooks/useApi";
import type { PlayerOutput, PlayerSort } from "../types";

const POSITION_SHORT: Record<string, string> = { DRIVE: "Drive", REVES: "Revés" };

export function Radar() {
  const api = useApi();

  const [players, setPlayers] = useState<PlayerOutput[]>([]);
  const [sort, setSort] = useState<PlayerSort>("RATING_DESC");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await api.players.list({ sort });
        if (cancelled) return;
        setError(null);
        setPlayers(list);
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          setPlayers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, sort]);

  const isDesc = sort === "RATING_DESC";

  return (
    <Layout title="Radar">
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--on-surface-variant)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {players.length} jogador{players.length === 1 ? "" : "es"}
          </span>

          <button
            type="button"
            onClick={() =>
              setSort((s) =>
                s === "RATING_DESC" ? "RATING_ASC" : "RATING_DESC",
              )
            }
            className="filter-chip active"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              {isDesc ? "arrow_downward" : "arrow_upward"}
            </span>
            {isDesc ? "Maior geral" : "Menor geral"}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--primary-fixed)" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}
            >
              sports_tennis
            </span>
            <p style={{ marginTop: 8, fontSize: "13px", fontWeight: 600 }}>Carregando jogadores...</p>
          </div>
        ) : error ? (
          <div
            className="glass-panel"
            style={{ borderRadius: "16px", padding: "28px 20px", textAlign: "center", color: "var(--error)" }}
          >
            <p style={{ fontWeight: 600 }}>Não foi possível carregar os jogadores.</p>
            <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: 4 }}>{error}</p>
          </div>
        ) : players.length === 0 ? (
          <div
            className="glass-panel"
            style={{ borderRadius: "16px", padding: "36px 20px", textAlign: "center", color: "var(--on-surface-variant)" }}
          >
            Nenhum jogador cadastrado ainda.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {players.map((p, index) => (
              <Link
                key={p.id}
                to={`/players/${p.id}`}
                className="glass-panel"
                style={{
                  borderRadius: "14px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span
                  className="font-display"
                  style={{
                    width: 24,
                    textAlign: "right",
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "var(--on-surface-variant)",
                  }}
                >
                  {index + 1}
                </span>

                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: "2px solid var(--primary-fixed)",
                    backgroundColor: "var(--surface-container-highest)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary-fixed)",
                    fontWeight: 700,
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--on-surface)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.name}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", fontWeight: 600 }}>
                    {p.mainPosition ? POSITION_SHORT[p.mainPosition] : "Sem partidas"}
                  </span>
                </div>

                <span
                  className="font-display"
                  style={{
                    fontSize: "20px",
                    fontWeight: 900,
                    color: "var(--primary-fixed)",
                    lineHeight: 1,
                  }}
                >
                  {p.rating}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
