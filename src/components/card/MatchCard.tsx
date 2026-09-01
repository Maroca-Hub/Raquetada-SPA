import { useNavigate } from "react-router-dom";
import type { Match, Player } from "../../types";

interface MatchCardProps {
  match: Match;
  currentUser: Player;
  onQuickJoin?: (matchId: string) => void;
}

export function MatchCard({ match, currentUser, onQuickJoin }: MatchCardProps) {
  const navigate = useNavigate();

  const confirmedParticipations = match.participations.filter(
    (p) => p.status === "ACCEPTED"
  );
  const confirmedCount = confirmedParticipations.length;
  const maxPlayers = match.maxPlayers || 4;
  const emptySlotsCount = Math.max(0, maxPlayers - confirmedCount);

  const isUserConfirmed = confirmedParticipations.some(
    (p) => p.player.id === currentUser.id
  );
  const isUserPending = match.pendingRequests.some(
    (p) => p.player.id === currentUser.id
  );
  const isOrganizer = match.organizer.id === currentUser.id;

  const handleCardClick = () => {
    navigate(`/matches/${match.id}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOrganizer || isUserConfirmed || isUserPending) {
      navigate(`/matches/${match.id}`);
    } else if (onQuickJoin) {
      onQuickJoin(match.id);
    } else {
      navigate(`/matches/${match.id}`);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="glass-panel animate-fade-in"
      style={{
        borderRadius: "16px",
        padding: "18px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-active)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Header: Club, Time & Court */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3
            className="font-display"
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--on-surface)",
              marginBottom: 4,
            }}
          >
            {match.clubName}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--on-surface-variant)",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              calendar_today
            </span>
            <span>{match.dateTime}</span>
          </div>
        </div>

        <div className="badge-court">
          <span className="dot" />
          <span>{match.courtName}</span>
        </div>
      </div>

      {/* Center: Player Avatars and Price */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 2,
        }}
      >
        {/* Avatars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--on-surface-variant)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Jogadores ({confirmedCount}/{maxPlayers})
          </span>

          <div style={{ display: "flex", alignItems: "center" }}>
            {confirmedParticipations.map((part, index) => (
              <div
                key={part.id}
                title={part.player.name}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "2px solid var(--surface-container)",
                  backgroundColor: "var(--surface-container-high)",
                  overflow: "hidden",
                  marginLeft: index === 0 ? 0 : -8,
                  zIndex: 20 - index,
                  position: "relative",
                }}
              >
                {part.player.avatarUrl ? (
                  <img
                    src={part.player.avatarUrl}
                    alt={part.player.name}
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
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {part.player.name.charAt(0)}
                  </div>
                )}
              </div>
            ))}

            {Array.from({ length: emptySlotsCount }).map((_, index) => (
              <div
                key={`empty-${index}`}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "2px dashed var(--outline-variant)",
                  backgroundColor: "var(--surface-container-high)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--outline)",
                  marginLeft: confirmedCount === 0 && index === 0 ? 0 : -8,
                  zIndex: 10 - index,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  add
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div
            className="font-display"
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--primary-fixed)",
              lineHeight: 1.1,
            }}
          >
            R$ {match.pricePerPerson}
          </div>
          <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", fontWeight: 500 }}>
            por pessoa
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div style={{ marginTop: 2 }}>
        {isOrganizer ? (
          <button
            type="button"
            onClick={handleActionClick}
            className="btn-secondary"
            style={{
              width: "100%",
              backgroundColor: "rgba(210, 240, 0, 0.1)",
              borderColor: "var(--primary-fixed)",
              color: "var(--primary-fixed)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              admin_panel_settings
            </span>
            Gerenciar Partida (Organizador)
            {match.pendingRequests.length > 0 && (
              <span
                style={{
                  background: "var(--primary-fixed)",
                  color: "var(--on-primary-fixed)",
                  borderRadius: "99px",
                  padding: "2px 7px",
                  fontSize: "11px",
                  fontWeight: 800,
                  marginLeft: 4,
                }}
              >
                {match.pendingRequests.length} pendente(s)
              </span>
            )}
          </button>
        ) : isUserConfirmed ? (
          <button
            type="button"
            onClick={handleActionClick}
            className="btn-secondary"
            style={{
              width: "100%",
              color: "var(--primary-fixed)",
              borderColor: "rgba(210, 240, 0, 0.3)",
            }}
          >
            <span className="material-symbols-outlined filled" style={{ fontSize: "18px" }}>
              check_circle
            </span>
            Você está confirmado • Ver detalhes
          </button>
        ) : isUserPending ? (
          <button
            type="button"
            onClick={handleActionClick}
            className="btn-secondary"
            style={{
              width: "100%",
              color: "var(--secondary)",
              borderColor: "rgba(173, 198, 255, 0.3)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              schedule
            </span>
            Aguardando Aprovação • Ver detalhes
          </button>
        ) : emptySlotsCount === 0 ? (
          <button
            type="button"
            onClick={handleActionClick}
            className="btn-secondary"
            style={{ width: "100%", opacity: 0.7 }}
          >
            Partida Cheia • Ver Detalhes
          </button>
        ) : (
          <button
            type="button"
            onClick={handleActionClick}
            className="btn-primary"
            style={{ width: "100%" }}
          >
            Solicitar Entrada
          </button>
        )}
      </div>
    </article>
  );
}
