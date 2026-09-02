import type { PlayerProfileOutput } from "../../types";
import { POSITION_LABELS, SKILL_AXES } from "../../services/api";

const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const scale10 = (v?: number) => Math.round((v ?? 0) * 10);

interface PlayerCardProps {
  profile: PlayerProfileOutput;
  showProgress?: boolean;
  showSkillsRow?: boolean;
  showAction?: boolean;
  actionText?: string;
  onAction?: () => void;
}

export function PlayerCard({
  profile,
  showProgress = true,
  showSkillsRow = false,
  showAction = false,
  actionText = "AÇÃO",
  onAction,
}: PlayerCardProps) {
  return (
    <div className="player-card-fut" style={{ padding: 24 }}>
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

      {/* Top bar: total rating + form indicator */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              {profile.currentRating}
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
              Geral
            </span>
          </div>

          <FormIndicator bonus={profile.formBonus} />
        </div>

        {profile.provisional && (
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
            Provisório
          </span>
        )}
      </div>

      {/* Name + position */}
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
            backgroundColor: "var(--surface-container-high)",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary-fixed)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "52px" }}
          >
            person
          </span>
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
          {profile.name}
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
          Lado: {POSITION_LABELS[profile.mainPosition] ?? profile.mainPosition}
        </p>

        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <RatingPill label="Drive" value={profile.ratingDrive} />
          <RatingPill label="Revés" value={profile.ratingReves} />
        </div>
      </div>

      {/* Progress to next rating */}
      {showProgress && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            background: "rgba(14, 14, 14, 0.6)",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--on-surface-variant)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 6,
            }}
          >
            <span>Progresso p/ próximo rating</span>
            <span
              className="font-display"
              style={{ color: "var(--primary-fixed)", fontSize: "13px" }}
            >
              {clampPct(profile.progressToNextRating)}%
            </span>
          </div>
          <div className="stat-bar-track">
            <div
              className="stat-bar-fill"
              style={{ width: `${clampPct(profile.progressToNextRating)}%` }}
            />
          </div>
        </div>
      )}

      {/* Valences row */}
      {showSkillsRow && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: `repeat(${SKILL_AXES.length}, 1fr)`,
            gap: 6,
            background: "rgba(14, 14, 14, 0.6)",
            padding: "14px 10px",
            borderRadius: "14px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {SKILL_AXES.map((s) => (
            <div
              key={s.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: "var(--on-surface-variant)",
                }}
              >
                {s.short}
              </span>
              <span
                className="font-display"
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "var(--primary-fixed)",
                }}
              >
                {scale10(profile.skillRatings[s.key])}
              </span>
            </div>
          ))}
        </div>
      )}

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

function FormIndicator({ bonus }: { bonus: number }) {
  if (!bonus) return null;
  const up = bonus > 0;
  const color = up ? "#3fd07a" : "var(--error)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        color,
        lineHeight: 1,
      }}
      title={up ? "Boa fase" : "Má fase"}
    >
      <span
        className="material-symbols-outlined filled"
        style={{ fontSize: "30px" }}
      >
        {up ? "keyboard_double_arrow_up" : "keyboard_double_arrow_down"}
      </span>
      <span
        className="font-display"
        style={{ fontSize: "18px", fontWeight: 900 }}
      >
        {up ? `+${bonus}` : bonus}
      </span>
    </span>
  );
}

function RatingPill({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <span
        className="font-display"
        style={{
          fontSize: "18px",
          fontWeight: 900,
          color: "var(--on-surface)",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "10px",
          color: "var(--on-surface-variant)",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {label}
      </span>
    </div>
  );
}
