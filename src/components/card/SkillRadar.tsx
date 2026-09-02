import type { Skill } from "../../types";
import { SKILL_AXES } from "../../services/api";

const RADAR_SKILLS = SKILL_AXES;

export function SkillRadar({ skills }: { skills: Partial<Record<Skill, number>> }) {
  return (
    <section
      className="glass-panel animate-fade-in"
      style={{
        borderRadius: "16px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <h2
        className="font-display"
        style={{
          fontSize: "13px",
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--on-surface-variant)",
        }}
      >
        Radar de fundamentos
      </h2>
      <RadarChart skills={skills} />
    </section>
  );
}

function RadarChart({ skills }: { skills: Partial<Record<Skill, number>> }) {
  const size = 250;
  const cx = size / 2;
  const cy = size / 2 + 4;
  const R = 76;
  const N = RADAR_SKILLS.length;

  const angleOf = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
  const point = (i: number, frac: number) => {
    const r = R * frac;
    return [cx + r * Math.cos(angleOf(i)), cy + r * Math.sin(angleOf(i))] as const;
  };
  const ringPoints = (frac: number) =>
    RADAR_SKILLS.map((_, i) => point(i, frac).join(",")).join(" ");

  const dataPoints = RADAR_SKILLS.map((s, i) => {
    const v = Math.max(0, Math.min(10, skills[s.key] ?? 0)) / 10;
    return point(i, v).join(",");
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ display: "block" }}>
      {[1, 0.66, 0.33].map((f) => (
        <polygon
          key={f}
          points={ringPoints(f)}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={1}
        />
      ))}
      {RADAR_SKILLS.map((_, i) => {
        const [x, y] = point(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--border-subtle)"
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={dataPoints}
        fill="rgba(210, 240, 0, 0.14)"
        stroke="var(--primary-fixed)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {RADAR_SKILLS.map((s, i) => {
        const [lx, ly] = point(i, 1.2);
        const level = Math.round((skills[s.key] ?? 0) * 10);
        return (
          <text key={s.key} x={lx} y={ly} textAnchor="middle" fontSize="10" fontWeight={700}>
            <tspan x={lx} dy="-1" fill="var(--on-surface-variant)">
              {s.short}
            </tspan>
            <tspan x={lx} dy="11" className="font-display" fill="var(--primary-fixed)">
              {level}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
