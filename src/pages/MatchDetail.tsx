import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Layout } from "../components/layout/Layout";
import { ShareButton } from "../components/common/ShareButton";
import { Toast } from "../components/common/Toast";
import { useApi } from "../hooks/useApi";
import { mapMatchOutputToMatch, mapPlayerOutputToPlayer } from "../services/api";
import { mockService, subscribeToMatches } from "../services/mockData";
import type { Match, Player, Participation } from "../types";

export function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const matchId = id || "match-1";
  const auth = useAuth();
  const api = useApi();
  const isDemo = localStorage.getItem("raquetada_demo_session") === "true";

  const [currentUser, setCurrentUser] = useState<Player>(mockService.getCurrentUser());
  const [match, setMatch] = useState<Match | undefined>(mockService.getMatchById(matchId));
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    if (auth.isAuthenticated) {
      try {
        const meOutput = await api.players.getMyProfile();
        setCurrentUser(mapPlayerOutputToPlayer(meOutput));

        const matchOutput = await api.matches.get(matchId);
        const rosterOutputs = await api.matches.listParticipations(matchId);
        setMatch(mapMatchOutputToMatch(matchOutput, rosterOutputs));
      } catch (err) {
        console.error("API error in MatchDetail:", err);
        setMatch(undefined);
      }
    } else if (isDemo) {
      setMatch(mockService.getMatchById(matchId));
      setCurrentUser(mockService.getCurrentUser());
    } else {
      setMatch(undefined);
    }
    setLoading(false);
  }, [auth.isAuthenticated, isDemo, api, matchId]);

  useEffect(() => {
    loadData();

    if (!auth.isAuthenticated) {
      const unsubscribe = subscribeToMatches(() => {
        setMatch(mockService.getMatchById(matchId));
      });
      return unsubscribe;
    }
  }, [loadData, auth.isAuthenticated, matchId]);

  if (loading) {
    return (
      <Layout showBack title="Carregando...">
        <div style={{ textAlign: "center", padding: "40px", color: "var(--primary-fixed)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}>
            sports_tennis
          </span>
          <p style={{ marginTop: 8, fontSize: "13px", fontWeight: 600 }}>Carregando detalhes da partida...</p>
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout showBack title="Partida não encontrada">
        <div
          className="glass-panel"
          style={{
            borderRadius: "16px",
            padding: "32px 20px",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: 16 }}>Esta partida não existe ou foi cancelada.</p>
          <Link to="/" className="btn-primary">
            Voltar ao Feed
          </Link>
        </div>
      </Layout>
    );
  }

  const isOrganizer = match.organizer.id === currentUser.id;

  const confirmedParticipations = match.participations.filter(
    (p) => p.status === "ACCEPTED"
  );
  const team1Players = confirmedParticipations.filter((p) => p.team === 1);
  const team2Players = confirmedParticipations.filter((p) => p.team === 2);

  const isUserConfirmed = confirmedParticipations.some(
    (p) => p.player.id === currentUser.id
  );
  const isUserPending = match.pendingRequests?.some(
    (p) => p.player.id === currentUser.id
  );
  const isFull = confirmedParticipations.length >= match.maxPlayers;

  const userParticipation = confirmedParticipations.find(
    (p) => p.player.id === currentUser.id
  );

  const handleRequestJoin = async (targetTeam?: number) => {
    if (auth.isAuthenticated) {
      try {
        const team = targetTeam || (team1Players.length < 2 ? 1 : 2);
        await api.matches.join(match.id, { team });
        setToastMessage("Você entrou na partida com sucesso!");
        await loadData();
      } catch (err) {
        setToastMessage(`Erro ao entrar: ${(err as Error).message}`);
      }
    } else {
      const result = mockService.requestToJoinMatch(match.id, currentUser);
      setToastMessage(result.message);
    }
  };

  const handleLeaveMatch = async () => {
    if (auth.isAuthenticated) {
      try {
        await api.matches.leave(match.id);
        setToastMessage("Você saiu da partida.");
        await loadData();
      } catch (err) {
        setToastMessage(`Erro ao sair: ${(err as Error).message}`);
      }
    } else {
      setToastMessage("Você saiu da partida.");
    }
  };

  const handleChangeTeam = async (newTeam: number) => {
    if (auth.isAuthenticated) {
      try {
        await api.matches.changeTeam(match.id, { team: newTeam });
        setToastMessage(`Você mudou para a Dupla ${newTeam}!`);
        await loadData();
      } catch (err) {
        setToastMessage(`Erro ao mudar de time: ${(err as Error).message}`);
      }
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const success = mockService.acceptParticipation(match.id, requestId);
    if (success) {
      setToastMessage("Jogador aceito na partida com sucesso!");
    }
  };

  const handleRejectRequest = (requestId: string) => {
    const success = mockService.rejectParticipation(match.id, requestId);
    if (success) {
      setToastMessage("Solicitação recusada.");
    }
  };

  return (
    <Layout showBack title={match.clubName}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Match Header Card */}
        <section
          className="glass-panel animate-fade-in"
          style={{
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--primary-fixed)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Partida de Padel
              </span>
              <h1
                className="font-display"
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "var(--on-surface)",
                  marginTop: 2,
                }}
              >
                {match.clubName}
              </h1>
            </div>

            <div className="badge-court">
              <span className="dot" />
              <span>{match.courtName}</span>
            </div>
          </div>

          {/* Key Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              background: "rgba(14, 14, 14, 0.6)",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", display: "block" }}>
                Horário
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, fontWeight: 700 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--primary-fixed)" }}>
                  schedule
                </span>
                <span style={{ fontSize: "13px" }}>{match.dateTime}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", display: "block" }}>
                Status
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, fontWeight: 800 }}>
                <span
                  className="font-display"
                  style={{
                    fontSize: "14px",
                    color: match.status === "FINISHED" ? "var(--on-surface-variant)" : "var(--primary-fixed)",
                  }}
                >
                  {match.status === "AWAITING_PLAYERS"
                    ? "Aguardando Jogadores"
                    : match.status === "SCHEDULED"
                    ? "Confirmada / Agendada"
                    : "Finalizada"}
                </span>
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", display: "block" }}>
                Endereço
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, fontSize: "12px", color: "var(--on-surface)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--secondary)" }}>
                  location_on
                </span>
                <span>{match.location}</span>
              </div>
            </div>

            {match.levelRequired && (
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", display: "block" }}>
                  Nível Sugerido
                </span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--on-surface)" }}>
                  {match.levelRequired}
                </span>
              </div>
            )}
          </div>

          {/* Organizer badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
            <span style={{ color: "var(--on-surface-variant)" }}>Organizado por:</span>
            <Link
              to={`/players/${match.organizer.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--primary-fixed)",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              <span>{match.organizer.name}</span>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
            </Link>
          </div>

          {/* Share Action */}
          <div style={{ marginTop: 4 }}>
            <ShareButton
              matchId={match.id}
              title={match.clubName}
              location={match.location}
              dateTime={match.dateTime}
              variant="outline"
            />
          </div>
        </section>

        {/* Court Layout / Players Section */}
        <section
          className="glass-panel animate-fade-in"
          style={{
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2
              className="font-display"
              style={{ fontSize: "18px", fontWeight: 800, color: "var(--on-surface)" }}
            >
              Quadra & Escalação
            </h2>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--primary-fixed)",
                background: "rgba(210, 240, 0, 0.12)",
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
              }}
            >
              {confirmedParticipations.length}/4 Vagas Preenchidas
            </span>
          </div>

          {/* Teams Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Dupla 1 */}
            <div
              style={{
                background: "rgba(14, 14, 14, 0.7)",
                borderRadius: "14px",
                padding: "14px",
                border: "1px solid rgba(210, 240, 0, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary-fixed)" }} />
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--primary-fixed)", textTransform: "uppercase" }}>
                    Dupla 1
                  </span>
                </div>
                {auth.isAuthenticated && userParticipation?.team === 2 && team1Players.length < 2 && (
                  <button
                    type="button"
                    onClick={() => handleChangeTeam(1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary-fixed)",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Mudar para cá
                  </button>
                )}
              </div>

              <PlayerSlot
                slotNumber={1}
                participation={team1Players[0]}
                onSelectEmpty={() => !isUserConfirmed && handleRequestJoin(1)}
              />
              <PlayerSlot
                slotNumber={2}
                participation={team1Players[1]}
                onSelectEmpty={() => !isUserConfirmed && handleRequestJoin(1)}
              />
            </div>

            {/* Dupla 2 */}
            <div
              style={{
                background: "rgba(14, 14, 14, 0.7)",
                borderRadius: "14px",
                padding: "14px",
                border: "1px solid rgba(173, 198, 255, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--secondary)" }} />
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--secondary)", textTransform: "uppercase" }}>
                    Dupla 2
                  </span>
                </div>
                {auth.isAuthenticated && userParticipation?.team === 1 && team2Players.length < 2 && (
                  <button
                    type="button"
                    onClick={() => handleChangeTeam(2)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--secondary)",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Mudar para cá
                  </button>
                )}
              </div>

              <PlayerSlot
                slotNumber={3}
                participation={team2Players[0]}
                onSelectEmpty={() => !isUserConfirmed && handleRequestJoin(2)}
              />
              <PlayerSlot
                slotNumber={4}
                participation={team2Players[1]}
                onSelectEmpty={() => !isUserConfirmed && handleRequestJoin(2)}
              />
            </div>
          </div>
        </section>

        {/* Admin Management Panel for Demo Mode */}
        {isOrganizer && !auth.isAuthenticated && match.pendingRequests && match.pendingRequests.length > 0 && (
          <section
            className="glass-panel animate-fade-in"
            style={{
              borderRadius: "20px",
              padding: "20px",
              border: "1px solid rgba(210, 240, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--primary-fixed)", fontSize: "22px" }}
                >
                  admin_panel_settings
                </span>
                <h2
                  className="font-display"
                  style={{ fontSize: "17px", fontWeight: 800, color: "var(--primary-fixed)" }}
                >
                  Painel do Organizador
                </h2>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  background: "var(--surface-container-highest)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  color: "var(--on-surface-variant)",
                }}
              >
                {match.pendingRequests.length} pendente(s)
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {match.pendingRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    background: "rgba(14, 14, 14, 0.8)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "12px",
                    padding: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Link
                    to={`/players/${req.player.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      textDecoration: "none",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid var(--primary-fixed)",
                        backgroundColor: "var(--surface-container-high)",
                      }}
                    >
                      {req.player.avatarUrl ? (
                        <img
                          src={req.player.avatarUrl}
                          alt={req.player.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--primary-fixed)",
                            fontWeight: 700,
                          }}
                        >
                          {req.player.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--on-surface)" }}>
                        {req.player.name}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
                        OVR {req.player.rating} • {req.player.preferredSide}
                      </span>
                    </div>
                  </Link>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(req.id)}
                      title="Aceitar na partida"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "var(--primary-fixed)",
                        color: "var(--on-primary-fixed)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                      }}
                    >
                      <span className="material-symbols-outlined filled" style={{ fontSize: "20px" }}>
                        check
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRejectRequest(req.id)}
                      title="Recusar"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "rgba(255, 180, 171, 0.15)",
                        color: "var(--error)",
                        border: "1px solid rgba(255, 180, 171, 0.3)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                        close
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Player Join Action Section */}
        <section style={{ marginTop: 8 }}>
          {isUserConfirmed ? (
            <div
              style={{
                background: "rgba(210, 240, 0, 0.1)",
                border: "1px solid var(--primary-fixed)",
                borderRadius: "14px",
                padding: "16px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span className="material-symbols-outlined filled" style={{ color: "var(--primary-fixed)", fontSize: "28px" }}>
                check_circle
              </span>
              <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--primary-fixed)" }}>
                Você está confirmado nesta partida (Dupla {userParticipation?.team})!
              </span>
              <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
                Compareça no local 10 minutos antes do horário marcado.
              </span>
              <button
                type="button"
                onClick={handleLeaveMatch}
                className="btn-secondary"
                style={{
                  marginTop: 6,
                  color: "var(--error)",
                  borderColor: "rgba(255, 180, 171, 0.3)",
                  fontSize: "12px",
                }}
              >
                Sair da Partida
              </button>
            </div>
          ) : isUserPending ? (
            <div
              style={{
                background: "rgba(173, 198, 255, 0.1)",
                border: "1px solid var(--secondary)",
                borderRadius: "14px",
                padding: "16px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "var(--secondary)", fontSize: "28px" }}>
                schedule
              </span>
              <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--secondary)" }}>
                Solicitação Pendente de Aprovação
              </span>
              <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
                O organizador ({match.organizer.name}) recebeu seu pedido e irá avaliar sua vaga.
              </span>
            </div>
          ) : isFull ? (
            <div
              className="glass-panel"
              style={{
                borderRadius: "14px",
                padding: "16px",
                textAlign: "center",
                color: "var(--on-surface-variant)",
              }}
            >
              <span style={{ fontWeight: 700 }}>Esta partida já está com todas as vagas preenchidas.</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleRequestJoin()}
              className="btn-primary"
              style={{ width: "100%", padding: "14px", fontSize: "16px" }}
            >
              <span className="material-symbols-outlined filled">sports_tennis</span>
              Quero Jogar / Entrar na Partida
            </button>
          )}
        </section>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </Layout>
  );
}

function PlayerSlot({
  slotNumber,
  participation,
  onSelectEmpty,
}: {
  slotNumber: number;
  participation?: Participation;
  onSelectEmpty?: () => void;
}) {
  if (!participation) {
    return (
      <div
        onClick={onSelectEmpty}
        style={{
          border: "2px dashed var(--outline-variant)",
          borderRadius: "10px",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255, 255, 255, 0.02)",
          cursor: onSelectEmpty ? "pointer" : "default",
          transition: "all 0.15s ease",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--surface-container-high)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--outline)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            add
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "var(--on-surface-variant)", fontWeight: 500 }}>
          Vaga {slotNumber} {onSelectEmpty ? "• Clique para entrar" : "aberta"}
        </span>
      </div>
    );
  }

  const player = participation.player;

  return (
    <Link
      to={`/players/${player.id}`}
      style={{
        background: "var(--surface-container-high)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        padding: "8px 10px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid var(--primary-fixed)",
          backgroundColor: "var(--surface-container-highest)",
          flexShrink: 0,
        }}
      >
        {player.avatarUrl ? (
          <img
            src={player.avatarUrl}
            alt={player.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary-fixed)",
              fontWeight: 700,
              fontSize: "12px",
            }}
          >
            {player.name.charAt(0)}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--on-surface)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {player.name}
        </span>
        <span style={{ fontSize: "10px", color: "var(--on-surface-variant)", fontWeight: 600 }}>
          OVR {player.rating} • {player.preferredSide}
        </span>
      </div>
    </Link>
  );
}
