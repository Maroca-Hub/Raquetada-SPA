import { useState, useEffect, useCallback } from "react";
import { useAuth } from "react-oidc-context";
import { Layout } from "../components/layout/Layout";
import { MatchCard } from "../components/card/MatchCard";
import { CreateMatchModal } from "../components/match/CreateMatchModal";
import { Toast } from "../components/common/Toast";
import { useApi } from "../hooks/useApi";
import { mapMatchOutputToMatch, mapPlayerOutputToPlayer } from "../services/api";
import { mockService, subscribeToMatches } from "../services/mockData";
import type { Match, Player } from "../types";

export function Matches() {
  const auth = useAuth();
  const api = useApi();
  const isDemo = localStorage.getItem("raquetada_demo_session") === "true";

  const [selectedFilter, setSelectedFilter] = useState<string>("today");
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentUser, setCurrentUser] = useState<Player>(() => {
    if (auth.isAuthenticated) {
      return {
        id: auth.user?.profile?.sub || "me",
        name: auth.user?.profile?.name || auth.user?.profile?.preferred_username || "Jogador",
        email: auth.user?.profile?.email || "",
        rating: 52,
        tier: "BRONZE",
        level: "Nível 3.0 - Iniciante",
        preferredSide: "AMBOS",
        stats: { power: 0, speed: 0, technique: 0, stamina: 0 },
        evaluations: { fairPlay: 0, punctuality: 0, teamSpirit: 0, generalTechnique: 0 },
        tags: [],
      };
    }
    return mockService.getCurrentUser();
  });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    if (auth.isAuthenticated) {
      try {
        // Fetch current user from API
        try {
          const meOutput = await api.players.getMyProfile();
          if (meOutput) {
            const me = mapPlayerOutputToPlayer(meOutput);
            setCurrentUser(me);
          }
        } catch (meErr) {
          console.warn("Could not fetch user profile from API:", meErr);
        }

        // Fetch matches from API
        const matchOutputs = await api.matches.list();
        if (Array.isArray(matchOutputs)) {
          const matchesWithRoster = await Promise.all(
            matchOutputs.map(async (m) => {
              try {
                const roster = await api.matches.listParticipations(m.id);
                return mapMatchOutputToMatch(m, roster);
              } catch {
                return mapMatchOutputToMatch(m, []);
              }
            })
          );
          setMatches(matchesWithRoster);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error("API error loading matches:", err);
        setMatches([]);
      }
    } else if (isDemo) {
      // Demo / offline mode only
      setMatches([...mockService.getMatches()]);
      setCurrentUser(mockService.getCurrentUser());
    } else {
      setMatches([]);
    }
    setLoading(false);
  }, [auth.isAuthenticated, isDemo, api]);

  useEffect(() => {
    loadData();

    // In demo mode only, subscribe to local storage changes
    if (!auth.isAuthenticated && isDemo) {
      const unsubscribe = subscribeToMatches(() => {
        setMatches([...mockService.getMatches()]);
        setCurrentUser(mockService.getCurrentUser());
      });
      return unsubscribe;
    }
  }, [loadData, auth.isAuthenticated, isDemo]);

  const filterOptions = [
    { id: "today", label: "Hoje" },
    { id: "tomorrow", label: "Amanhã" },
    { id: "saturday", label: "Sábado" },
    { id: "sunday", label: "Domingo" },
    { id: "all", label: "Todas" },
  ];

  const filteredMatches = matches.filter((match) => {
    if (selectedFilter === "all") return true;
    return match.dateCategory === selectedFilter;
  });

  const handleQuickJoin = async (matchId: string) => {
    if (auth.isAuthenticated) {
      try {
        await api.matches.join(matchId, { team: 1 });
        setToastMessage("Você entrou na partida com sucesso!");
        await loadData();
      } catch (err) {
        setToastMessage(`Erro ao entrar: ${(err as Error).message}`);
      }
    } else {
      const result = mockService.requestToJoinMatch(matchId, currentUser);
      setToastMessage(result.message);
    }
  };

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Create Match Banner / Action */}
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
              Organize seu Jogo
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
            style={{
              padding: "10px 18px",
              fontSize: "13px",
              borderRadius: "var(--radius-full)",
              whiteSpace: "nowrap",
            }}
          >
            <span className="material-symbols-outlined filled" style={{ fontSize: "18px" }}>
              add
            </span>
            Criar Partida
          </button>
        </section>

        {/* Quick Day Filter Selector */}
        <section
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {filterOptions.map((opt) => (
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

        {/* Match Feed List */}
        <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--primary-fixed)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}>
                sports_tennis
              </span>
              <p style={{ marginTop: 8, fontSize: "13px", fontWeight: 600 }}>Carregando partidas...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
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
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "40px", color: "var(--on-surface-variant)" }}
              >
                sports_tennis
              </span>
              <p style={{ fontWeight: 600, color: "var(--on-surface)" }}>
                Nenhuma partida aberta para este dia.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setSelectedFilter("all")}
                  className="btn-secondary"
                >
                  Ver todas as partidas
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary"
                >
                  Criar uma agora
                </button>
              </div>
            </div>
          ) : (
            filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                currentUser={currentUser}
                onQuickJoin={handleQuickJoin}
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

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </Layout>
  );
}
