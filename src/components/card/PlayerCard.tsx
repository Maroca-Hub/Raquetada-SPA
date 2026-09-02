import type { PlayerProfileOutput, Skill } from "../../types";
import { FORM_LABELS, POSITION_LABELS, SKILL_LABELS, SKILL_ORDER } from "../../services/api";

interface PlayerCardProps {
  profile: PlayerProfileOutput;
  showSkills?: boolean;
  showAction?: boolean;
  actionText?: string;
  onAction?: () => void;
}

export function PlayerCard({
  profile,
  showSkills = true,
  showAction = false,
  actionText = "AÇÃO",
  onAction,
}: PlayerCardProps) {
  const formDelta = profile.formBonus > 0 ? `+${profile.formBonus}` : `${profile.formBonus}`;

  return (
    <div className="player-card-fut" style={{ padding: 24 }}>
      <div
        className="glow-ambient"
        style={{ width: 140, height: 140, background: "rgba(210, 240, 0, 0.15)", top: -20, right: -20 }}
      />

      {/* Top bar: overall + form / provisional badges */}
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
            Rating atual · base {profile.rating}
          </span>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: "4px",
              background: "rgba(210, 240, 0, 0.15)",
              color: "var(--primary-fixed)",
              border: "1px solid rgba(210, 240, 0, 0.3)",
            }}
          >
            Forma: {FORM_LABELS[profile.form] ?? profile.form} ({formDelta})
          </span>
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
          <span className="material-symbols-outlined" style={{ fontSize: "52px" }}>
            person
          </span>
        </div>

        <h2
          className="font-display"
          style={{ fontSize: "22px", fontWeight: 800, color: "var(--on-surface)", letterSpacing: "-0.01em" }}
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

      {/* Skill ratings (0..10, from peer evaluations) */}
      {showSkills && (
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
            Fundamentos avaliados
          </div>

          {SKILL_ORDER.map((skill) => (
            <SkillItem
              key={skill}
              label={SKILL_LABELS[skill]}
              value={profile.skillRatings[skill as Skill]}
            />
          ))}
        </div>
      )}

      {showAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-primary"
          style={{ width: "100%", marginTop: 16, position: "relative", zIndex: 2, borderRadius: "var(--radius-full)" }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

function RatingPill({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span
        className="font-display"
        style={{ fontSize: "18px", fontWeight: 900, color: "var(--on-surface)", lineHeight: 1 }}
      >
        {value}
      </span>
      <span
        style={{ fontSize: "10px", color: "var(--on-surface-variant)", textTransform: "uppercase", fontWeight: 700 }}
      >
        {label}
      </span>
    </div>
  );
}

function SkillItem({ label, value }: { label: string; value?: number }) {
  const has = typeof value === "number";
  const pct = has ? Math.max(0, Math.min(100, (value as number) * 10)) : 0;
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
          {has ? `${(value as number).toFixed(1)}/10` : "—"}
        </span>
      </div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
