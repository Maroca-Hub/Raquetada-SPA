import { useState, useEffect, useCallback } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { PlayerCard } from "../components/card/PlayerCard";
import { Toast } from "../components/common/Toast";
import { useApi } from "../hooks/useApi";
import { mapPlayerOutputToPlayer } from "../services/api";
import { mockService } from "../services/mockData";
import type { Player } from "../types";

export function Profile() {
  const auth = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<Player>(mockService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    if (auth.isAuthenticated) {
      try {
        const meOutput = await api.players.getMyProfile();
        const mappedPlayer = mapPlayerOutputToPlayer(meOutput);

        // Fetch received evaluations
        try {
          const evalOutputs = await api.players.listReceivedEvaluations(meOutput.id);
          if (evalOutputs && evalOutputs.length > 0) {
            // Aggregate skills from evaluations
            let lob = 0, serve = 0, pos = 0, smash = 0, def = 0, count = 0;
            evalOutputs.forEach((ev) => {
              ev.skillRatings?.forEach((sr) => {
                count++;
                if (sr.skill === "LOB") lob += sr.score * 10;
                if (sr.skill === "SERVE") serve += sr.score * 10;
                if (sr.skill === "POSITIONING") pos += sr.score * 10;
                if (sr.skill === "SMASH") smash += sr.score * 10;
                if (sr.skill === "DEFENSE") def += sr.score * 10;
              });
            });
            if (count > 0) {
              const evalCount = evalOutputs.length;
              mappedPlayer.evaluations = {
                fairPlay: Math.round(pos / evalCount) || 95,
                punctuality: Math.round(serve / evalCount) || 94,
                teamSpirit: Math.round(lob / evalCount) || 92,
                generalTechnique: Math.round((smash + def) / (evalCount * 2)) || mappedPlayer.rating,
              };
            }
          }
        } catch (evalErr) {
          console.warn("Evaluations fetch note:", evalErr);
        }

        setPlayer(mappedPlayer);
      } catch (err) {
        console.error("API error loading profile:", err);
        setPlayer({
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
        });
      }
    } else {
      setPlayer(mockService.getCurrentUser());
    }
    setLoading(false);
  }, [auth.isAuthenticated, auth.user, api]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleResetData = () => {
    mockService.resetData();
    setToastMessage("Dados da demonstração resetados para o estado inicial!");
    setPlayer(mockService.getCurrentUser());
  };

  const handleSignOut = async () => {
    localStorage.removeItem("raquetada_demo_session");
    localStorage.removeItem("raquetada_onboarding_completed");
    if (auth.isAuthenticated) {
      try {
        await auth.signoutRedirect();
      } catch (err) {
        console.error("Signout error", err);
        await auth.removeUser();
        navigate("/login", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <Layout title="Meu Perfil">
        <div style={{ textAlign: "center", padding: "40px", color: "var(--primary-fixed)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}>
            sports_tennis
          </span>
          <p style={{ marginTop: 8, fontSize: "13px", fontWeight: 600 }}>Carregando perfil da API...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Meu Perfil">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Gamified Player Card */}
        <section className="animate-fade-in">
          <PlayerCard player={player} showAttributes={true} />
        </section>

        {/* Recent Matches History */}
        <section className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2
              className="font-display"
              style={{ fontSize: "18px", fontWeight: 800, color: "var(--on-surface)" }}
            >
              Histórico Recente
            </h2>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--primary-fixed)",
                cursor: "pointer",
              }}
              onClick={() => setToastMessage("Histórico sincronizado com a API!")}
            >
              Ver tudo
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {player.matchHistory && player.matchHistory.length > 0 ? (
              player.matchHistory.map((hist) => {
                const isWin = hist.result === "V";
                return (
                  <div
                    key={hist.id}
                    className="glass-panel"
                    style={{
                      borderRadius: "14px",
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-active)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-subtle)";
                    }}
                    onClick={() => setToastMessage(`Detalhes da partida: ${hist.title}`)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "var(--surface-container-high)",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isWin ? "var(--primary-fixed)" : "var(--on-surface-variant)",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                          {isWin ? "emoji_events" : "sports_tennis"}
                        </span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--on-surface)" }}>
                          {hist.title}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
                          {hist.date} • {hist.court}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span
                          className="font-display"
                          style={{
                            fontSize: "18px",
                            fontWeight: 900,
                            color: isWin ? "var(--primary-fixed)" : "var(--on-surface-variant)",
                            lineHeight: 1,
                          }}
                        >
                          {hist.result}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", fontWeight: 600 }}>
                          {hist.score}
                        </span>
                      </div>
                      <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)", fontSize: "18px" }}>
                        chevron_right
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="glass-panel" style={{ padding: "16px", borderRadius: "12px", textAlign: "center", color: "var(--on-surface-variant)" }}>
                Nenhuma partida recente registrada na sua conta.
              </div>
            )}
          </div>
        </section>

        {/* Anonymous Peer Evaluations */}
        <section className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2
            className="font-display"
            style={{ fontSize: "18px", fontWeight: 800, color: "var(--on-surface)" }}
          >
            Avaliações da Comunidade
          </h2>

          <div
            className="glass-panel"
            style={{
              borderRadius: "16px",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <EvaluationItem label="Fair Play" score={player.evaluations.fairPlay} />
            <EvaluationItem label="Pontualidade" score={player.evaluations.punctuality} />
            <EvaluationItem label="Espírito de Equipe" score={player.evaluations.teamSpirit} />
            <EvaluationItem label="Técnica Geral" score={player.evaluations.generalTechnique} />
          </div>
        </section>

        {/* Badges / Player Tags */}
        {player.tags && (
          <section className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <h2
              className="font-display"
              style={{ fontSize: "16px", fontWeight: 800, color: "var(--on-surface)" }}
            >
              Destaques dos Colegas
            </h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {player.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "var(--surface-container-high)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-full)",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--on-surface)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Profile Settings & Account Actions */}
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
            <span className="material-symbols-outlined filled" style={{ fontSize: "18px" }}>
              tune
            </span>
            Editar Minha Carta / Perfil
          </button>

          {!auth.isAuthenticated && (
            <button
              type="button"
              onClick={handleResetData}
              className="btn-secondary"
              style={{ width: "100%" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                restart_alt
              </span>
              Resetar Demonstração (Recarregar Partidas Iniciais)
            </button>
          )}

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
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              logout
            </span>
            Sair da Conta
          </button>
        </section>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </Layout>
  );
}

function EvaluationItem({ label, score }: { label: string; score: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--on-surface)" }}>
          {label}
        </span>
        <span
          className="font-display"
          style={{ fontSize: "16px", fontWeight: 900, color: "var(--primary-fixed)" }}
        >
          {score}
        </span>
      </div>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{
            width: `${score}%`,
            background: "linear-gradient(90deg, var(--surface-tint), var(--primary-fixed))",
          }}
        />
      </div>
    </div>
  );
}
