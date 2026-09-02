import { useNavigate } from "react-router-dom";
import type { MatchOutput } from "../../types";
import { formatMatchDateTime } from "../../services/api";

interface MatchCardProps {
  match: MatchOutput;
  myId: string;
  onJoin?: (matchId: string) => void;
}

const MATCH_CAPACITY = 4;

const STATUS_LABEL: Record<string, string> = {
  AWAITING_PLAYERS: "Aguardando jogadores",
  SCHEDULED: "Confirmada",
  FINISHED: "Finalizada",
};

export function MatchCard({ match, myId, onJoin }: MatchCardProps) {
  const navigate = useNavigate();

  const roster = match.roster;
  const confirmedCount = roster.length;
  const emptySlots = Math.max(0, MATCH_CAPACITY - confirmedCount);
  const isOrganizer = match.organizer.id === myId;
  const isConfirmed = roster.some((p) => p.player.id === myId);
  const isFull = confirmedCount >= MATCH_CAPACITY;
  const canJoin =
    !isOrganizer &&
    !isConfirmed &&
    !isFull &&
    match.status === "AWAITING_PLAYERS";

  const goToDetail = () => navigate(`/matches/${match.id}`);

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canJoin && onJoin) onJoin(match.id);
    else goToDetail();
  };

  return (
    <article
      onClick={goToDetail}
      className="glass-panel animate-fade-in"
      style={{
        borderRadius: "16px",
        padding: "18px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            className="font-display"
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--on-surface)",
              marginBottom: 4,
            }}
          >
            {match.location}
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
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              calendar_today
            </span>
            <span>{formatMatchDateTime(match.dateTime)}</span>
          </div>
        </div>

        <div className="badge-court" style={{ maxWidth: "45%" }}>
          <span className="dot" />
          <span>{STATUS_LABEL[match.status] ?? match.status}</span>
        </div>
      </div>

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
          Jogadores ({confirmedCount}/{MATCH_CAPACITY})
        </span>

        <div style={{ display: "flex", alignItems: "center" }}>
          {roster.map((part, index) => (
            <div
              key={`${part.team}-${part.position}`}
              title={`${part.player.name} · GRL ${part.player.rating}`}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "2px solid var(--surface-container)",
                backgroundColor: "var(--surface-container-high)",
                marginLeft: index === 0 ? 0 : -8,
                zIndex: 20 - index,
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
          ))}

          {Array.from({ length: emptySlots }).map((_, index) => (
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
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}
              >
                add
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        {isOrganizer ? (
          <button
            type="button"
            onClick={handleAction}
            className="btn-secondary"
            style={{
              width: "100%",
              backgroundColor: "rgba(210, 240, 0, 0.1)",
              borderColor: "var(--primary-fixed)",
              color: "var(--primary-fixed)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              admin_panel_settings
            </span>
            Gerenciar partida
          </button>
        ) : isConfirmed ? (
          <button
            type="button"
            onClick={handleAction}
            className="btn-secondary"
            style={{
              width: "100%",
              color: "var(--primary-fixed)",
              borderColor: "rgba(210, 240, 0, 0.3)",
            }}
          >
            <span
              className="material-symbols-outlined filled"
              style={{ fontSize: "18px" }}
            >
              check_circle
            </span>
            Você está confirmado · Ver detalhes
          </button>
        ) : isFull || match.status !== "AWAITING_PLAYERS" ? (
          <button
            type="button"
            onClick={handleAction}
            className="btn-secondary"
            style={{ width: "100%", opacity: 0.7 }}
          >
            {isFull ? "Partida cheia" : "Ver detalhes"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAction}
            className="btn-primary"
            style={{ width: "100%" }}
          >
            Entrar na partida
          </button>
        )}
      </div>
    </article>
  );
}
