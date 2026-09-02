import { useState, useEffect, useCallback } from "react";
import { Layout } from "../components/layout/Layout";
import { MatchCard } from "../components/card/MatchCard";
import { CreateMatchModal } from "../components/match/CreateMatchModal";
import { Toast } from "../components/common/Toast";
import { useApi } from "../hooks/useApi";
import type { MatchOutput, MatchStatus, ParticipationOutput } from "../types";

type StatusFilter = MatchStatus | "ALL";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Todas" },
  { id: "AWAITING_PLAYERS", label: "Abertas" },
  { id: "SCHEDULED", label: "Confirmadas" },
  { id: "FINISHED", label: "Finalizadas" },
];

export function Matches() {
  const api = useApi();

  const [selectedFilter, setSelectedFilter] = useState<StatusFilter>("ALL");
  const [matches, setMatches] = useState<MatchOutput[]>([]);
  const [rosters, setRosters] = useState<Record<string, ParticipationOutput[]>>({});
  const [myId, setMyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [me, matchList] = await Promise.all([
        api.players.getMyProfile(),
        api.matches.list(selectedFilter === "ALL" ? undefined : { status: selectedFilter }),
      ]);
      setMyId(me.id);

      const rosterEntries = await Promise.all(
        matchList.map(async (m) => {
          try {
            return [m.id, await api.matches.listParticipations(m.id)] as const;
          } catch {
            return [m.id, [] as ParticipationOutput[]] as const;
          }
        })
      );
      setError(null);
      setMatches(matchList);
      setRosters(Object.fromEntries(rosterEntries));
    } catch (err) {
      setError((err as Error).message);
      setMatches([]);
      setRosters({});
    } finally {
      setLoading(false);
    }
  }, [api, selectedFilter]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadData();
    })();
  }, [loadData]);

  const handleJoin = async (matchId: string) => {
    // Joining needs a slot; take the first free one.
    const roster = rosters[matchId] ?? [];
    const taken = new Set(roster.map((p) => `${p.team}-${p.position}`));
    const slot = (["1-DRIVE", "1-REVES", "2-DRIVE", "2-REVES"] as const).find((s) => !taken.has(s));
    if (!slot) {
      setToastMessage("Partida cheia.");
      return;
    }
    const [team, position] = slot.split("-") as ["1" | "2", "DRIVE" | "REVES"];
    try {
      await api.matches.join(matchId, { team: Number(team), position });
      setToastMessage("Você entrou na partida!");
      await loadData();
    } catch (err) {
      setToastMessage(`Erro ao entrar: ${(err as Error).message}`);
    }
  };

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <section
          className="glass-panel animate-fade-in"
          style={{
            borderRadius: "18px",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, rgba(210, 240, 0, 0.12) 0%, rgba(20, 20, 20, 0.8) 100%)",
            border: "1px solid rgba(210, 240, 0, 0.3)",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "var(--primary-fixed)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Organize seu jogo
            </span>
            <h2
              className="font-display"
              style={{ fontSize: "16px", fontWeight: 800, color: "var(--on-surface)", marginTop: 2 }}
            >
              Quer marcar uma partida?
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
            style={{ padding: "10px 18px", fontSize: "13px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap" }}
          >
            <span className="material-symbols-outlined filled" style={{ fontSize: "18px" }}>
              add
            </span>
            Criar partida
          </button>
        </section>

        <section
          className="no-scrollbar"
          style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}
        >
          {FILTERS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedFilter(opt.id)}
              className={`filter-chip ${selectedFilter === opt.id ? "active" : ""}`}
            >
              {opt.label}
            </button>
          ))}
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--primary-fixed)" }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}
              >
                sports_tennis
              </span>
              <p style={{ marginTop: 8, fontSize: "13px", fontWeight: 600 }}>Carregando partidas...</p>
            </div>
          ) : error ? (
            <div
              className="glass-panel"
              style={{ borderRadius: "16px", padding: "28px 20px", textAlign: "center", color: "var(--error)" }}
            >
              <p style={{ fontWeight: 600 }}>Não foi possível carregar as partidas.</p>
              <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: 4 }}>{error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  loadData();
                }}
                className="btn-secondary"
                style={{ marginTop: 12 }}
              >
                Tentar novamente
              </button>
            </div>
          ) : matches.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                borderRadius: "16px",
                padding: "36px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--on-surface-variant)" }}>
                sports_tennis
              </span>
              <p style={{ fontWeight: 600, color: "var(--on-surface)" }}>Nenhuma partida para este filtro.</p>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setSelectedFilter("ALL")} className="btn-secondary">
                  Ver todas
                </button>
                <button type="button" onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
                  Criar uma agora
                </button>
              </div>
            </div>
          ) : (
            matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                roster={rosters[match.id] ?? []}
                myId={myId}
                onJoin={handleJoin}
              />
            ))
          )}
        </section>
      </div>

      <CreateMatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(msg) => {
          setToastMessage(msg);
          loadData();
        }}
      />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </Layout>
  );
}
