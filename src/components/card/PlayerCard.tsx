import type { Player } from "../../types";

interface PlayerCardProps {
  player: Player;
  showAttributes?: boolean;
  showAction?: boolean;
  actionText?: string;
  onAction?: () => void;
}

export function PlayerCard({
  player,
  showAttributes = true,
  showAction = false,
  actionText = "DESAFIAR",
  onAction,
}: PlayerCardProps) {
  const getTierClass = (tier: string) => {
    switch (tier) {
      case "DIAMANTE":
        return "badge-tier-diamante";
      case "OURO":
        return "badge-tier-ouro";
      case "PRATA":
        return "badge-tier-prata";
      default:
        return "badge-tier-bronze";
    }
  };

  const getSideText = (side: string) => {
    switch (side) {
      case "DRIVE":
        return "Lado: Drive (Direita)";
      case "REVES":
        return "Lado: Revés (Esquerda)";
      default:
        return "Lado: Ambos os Lados";
    }
  };

  return (
    <div className="player-card-fut" style={{ padding: 24 }}>
      {/* Background glow effects */}
      <div
        className="glow-ambient"
        style={{
          width: 140,
          height: 140,
          background: "rgba(210, 240, 0, 0.15)",
          top: -20,
          right: -20,
        }}
      />

      {/* Top Bar: Rating & Badges */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
          zIndex: 2,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            className="font-display"
            style={{
              fontSize: "44px",
              fontWeight: 900,
              lineHeight: 1,
              color: "var(--primary-fixed)",
              letterSpacing: "-0.04em",
            }}
          >
            {player.rating}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--on-surface-variant)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            OVERALL
          </span>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span className={`badge-tier ${getTierClass(player.tier)}`}>
            {player.tier}
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: "4px",
              background: "rgba(173, 198, 255, 0.15)",
              color: "var(--secondary)",
              border: "1px solid rgba(173, 198, 255, 0.3)",
            }}
          >
            {player.preferredSide}
          </span>
        </div>
      </div>

      {/* Center: Avatar Photo & Name */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
          marginBottom: 20,
        }}
      >
        <div
          className="neon-glow"
          style={{
            width: 104,
            height: 104,
            borderRadius: "50%",
            border: "3px solid var(--primary-fixed)",
            overflow: "hidden",
            backgroundColor: "var(--surface-container-high)",
            marginBottom: 14,
            position: "relative",
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
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "52px" }}>
                person
              </span>
            </div>
          )}
        </div>

        <h2
          className="font-display"
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "var(--on-surface)",
            letterSpacing: "-0.01em",
          }}
        >
          {player.name} {player.nickname ? `"${player.nickname}"` : ""}
        </h2>

        <p
          style={{
            fontSize: "12px",
            color: "var(--on-surface-variant)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginTop: 4,
          }}
        >
          {player.level} • {getSideText(player.preferredSide)}
        </p>
      </div>

      {/* Attributes Bars */}
      {showAttributes && player.stats && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            position: "relative",
            zIndex: 2,
            background: "rgba(14, 14, 14, 0.6)",
            padding: "14px 16px",
            borderRadius: "14px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--on-surface-variant)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 2,
            }}
          >
            Atributos Físicos e Técnicos
          </div>

          <AttributeItem label="Potência" value={player.stats.power} />
          <AttributeItem label="Velocidade" value={player.stats.speed} />
          <AttributeItem label="Técnica" value={player.stats.technique} />
          <AttributeItem label="Resistência" value={player.stats.stamina} />
        </div>
      )}

      {/* Action Button */}
      {showAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-primary"
          style={{
            width: "100%",
            marginTop: 16,
            position: "relative",
            zIndex: 2,
            borderRadius: "var(--radius-full)",
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

function AttributeItem({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        <span style={{ color: "var(--on-surface)" }}>{label}</span>
        <span style={{ color: "var(--primary-fixed)", fontFamily: "var(--font-display)" }}>
          {value}/100
        </span>
      </div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
