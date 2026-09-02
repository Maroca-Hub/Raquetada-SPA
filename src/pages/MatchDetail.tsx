import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { ShareButton } from "../components/common/ShareButton";
import { Toast } from "../components/common/Toast";
import { useApi } from "../hooks/useApi";
import { POSITION_LABELS, SKILL_LABELS, SKILL_ORDER, formatMatchDateTime } from "../services/api";
import type {
  EvaluationOutput,
  MatchOutput,
  PadelPosition,
  ParticipationOutput,
  Skill,
} from "../types";

const STATUS_LABEL: Record<string, string> = {
  AWAITING_PLAYERS: "Aguardando jogadores",
  SCHEDULED: "Confirmada",
  FINISHED: "Finalizada",
};

const SLOTS: { team: number; position: PadelPosition }[] = [
  { team: 1, position: "DRIVE" },
  { team: 1, position: "REVES" },
  { team: 2, position: "DRIVE" },
  { team: 2, position: "REVES" },
];

export function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const matchId = id ?? "";
  const api = useApi();

  const [myId, setMyId] = useState("");
  const [match, setMatch] = useState<MatchOutput | null>(null);
  const [roster, setRoster] = useState<ParticipationOutput[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [me, matchOutput, rosterOutput] = await Promise.all([
        api.players.getMyProfile(),
        api.matches.get(matchId),
        api.matches.listParticipations(matchId),
      ]);
      setMyId(me.id);
      setMatch(matchOutput);
      setRoster(rosterOutput);

      if (matchOutput.status === "FINISHED") {
        try {
          setEvaluations(await api.matches.listEvaluations(matchId));
        } catch {
          setEvaluations([]);
        }
      } else {
        setEvaluations([]);
      }
    } catch (err) {
      if ((err as { status?: number }).status === 404) setNotFound(true);
      setMatch(null);
    } finally {
      setLoading(false);
    }
  }, [api, matchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <Layout showBack title="Carregando...">
        <div style={{ textAlign: "center", padding: "40px", color: "var(--primary-fixed)" }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}
          >
            sports_tennis
          </span>
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout showBack title="Partida não encontrada">
        <div className="glass-panel" style={{ borderRadius: "16px", padding: "32px 20px", textAlign: "center" }}>
          <p style={{ marginBottom: 16 }}>
            {notFound ? "Esta partida não existe." : "Não foi possível carregar a partida."}
          </p>
          <Link to="/" className="btn-primary">
            Voltar ao feed
          </Link>
        </div>
      </Layout>
    );
  }

  const isOrganizer = match.organizer.id === myId;
  const myParticipation = roster.find((p) => p.player.id === myId);
  const isConfirmed = Boolean(myParticipation);
  const isFull = roster.length >= 4;
  const isFinished = match.status === "FINISHED";
  const slotOf = (team: number, position: PadelPosition) =>
    roster.find((p) => p.team === team && p.position === position);

  const handleSlotClick = async (team: number, position: PadelPosition) => {
    if (slotOf(team, position)) return;
    try {
      if (!isConfirmed) {
        if (match.status !== "AWAITING_PLAYERS") return;
        await api.matches.join(matchId, { team, position });
        setToastMessage("Você entrou na partida!");
      } else {
        await api.matches.changeSlot(matchId, { team, position });
        setToastMessage(`Você mudou para a Dupla ${team} · ${POSITION_LABELS[position]}.`);
      }
      await loadData();
    } catch (err) {
      setToastMessage((err as Error).message);
    }
  };

  const handleLeave = async () => {
    try {
      await api.matches.leave(matchId);
      setToastMessage("Você saiu da partida.");
      await loadData();
    } catch (err) {
      setToastMessage((err as Error).message);
    }
  };

  return (
    <Layout showBack title={match.location}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Header */}
        <section
          className="glass-panel animate-fade-in"
          style={{ borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
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
                style={{ fontSize: "22px", fontWeight: 900, color: "var(--on-surface)", marginTop: 2 }}
              >
                {match.location}
              </h1>
            </div>
            <div className="badge-court">
              <span className="dot" />
              <span>{STATUS_LABEL[match.status] ?? match.status}</span>
            </div>
          </div>

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
              <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", display: "block" }}>Horário</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, fontWeight: 700 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--primary-fixed)" }}>
                  schedule
                </span>
                <span style={{ fontSize: "13px" }}>{formatMatchDateTime(match.dateTime)}</span>
              </div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", display: "block" }}>Vagas</span>
              <span className="font-display" style={{ fontSize: "14px", fontWeight: 800, color: "var(--primary-fixed)" }}>
                {roster.length}/4
              </span>
            </div>
            {isFinished && match.scorePair1 != null && match.scorePair2 != null && (
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", display: "block" }}>Resultado</span>
                <span className="font-display" style={{ fontSize: "20px", fontWeight: 900, color: "var(--on-surface)" }}>
                  {match.scorePair1} — {match.scorePair2}
                </span>
                <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", marginLeft: 8 }}>
                  (Dupla 1 x Dupla 2)
                </span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
            <span style={{ color: "var(--on-surface-variant)" }}>Organizado por:</span>
            <Link
              to={`/players/${match.organizer.id}`}
              style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--primary-fixed)", textDecoration: "none", fontWeight: 700 }}
            >
              <span>{match.organizer.name}</span>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
            </Link>
          </div>

          <ShareButton
            matchId={match.id}
            title={match.location}
            location={match.location}
            dateTime={formatMatchDateTime(match.dateTime)}
            variant="outline"
          />
        </section>

        {/* Court */}
        <section
          className="glass-panel animate-fade-in"
          style={{ borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <h2 className="font-display" style={{ fontSize: "18px", fontWeight: 800, color: "var(--on-surface)" }}>
            Quadra & escalação
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[1, 2].map((team) => (
              <div
                key={team}
                style={{
                  background: "rgba(14, 14, 14, 0.7)",
                  borderRadius: "14px",
                  padding: "14px",
                  border: `1px solid ${team === 1 ? "rgba(210, 240, 0, 0.2)" : "rgba(173, 198, 255, 0.2)"}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: team === 1 ? "var(--primary-fixed)" : "var(--secondary)",
                    textTransform: "uppercase",
                    borderBottom: "1px solid var(--border-subtle)",
                    paddingBottom: 6,
                  }}
                >
                  Dupla {team}
                </span>

                {SLOTS.filter((s) => s.team === team).map((s) => {
                  const part = slotOf(s.team, s.position);
                  const clickable =
                    !part &&
                    !isFinished &&
                    ((isConfirmed && match.status !== "FINISHED") ||
                      (!isConfirmed && match.status === "AWAITING_PLAYERS"));
                  return (
                    <PlayerSlot
                      key={s.position}
                      position={s.position}
                      participation={part}
                      onClick={clickable ? () => handleSlotClick(s.team, s.position) : undefined}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* Action */}
        <section>
          {isConfirmed && !isOrganizer && !isFinished ? (
            <button
              type="button"
              onClick={handleLeave}
              className="btn-secondary"
              style={{ width: "100%", color: "var(--error)", borderColor: "rgba(255, 180, 171, 0.3)" }}
            >
              Sair da partida
            </button>
          ) : !isConfirmed && !isFull && match.status === "AWAITING_PLAYERS" ? (
            <div
              className="glass-panel"
              style={{ borderRadius: "14px", padding: "16px", textAlign: "center", color: "var(--on-surface-variant)" }}
            >
              Toque em uma vaga livre acima para entrar na partida.
            </div>
          ) : null}
        </section>

        {/* Organizer: register result */}
        {isOrganizer && match.status === "SCHEDULED" && (
          <ResultForm
            onSubmit={async (scorePair1, scorePair2) => {
              try {
                await api.matches.registerResult(matchId, { scorePair1, scorePair2 });
                setToastMessage("Resultado registrado!");
                await loadData();
              } catch (err) {
                setToastMessage((err as Error).message);
              }
            }}
          />
        )}

        {/* Peer evaluations (finished matches only) */}
        {isFinished && isConfirmed && (
          <EvaluationSection
            roster={roster}
            myId={myId}
            evaluations={evaluations}
            onSubmit={async (evaluatedPlayerId, scores) => {
              try {
                await api.matches.createEvaluation(matchId, {
                  evaluatedPlayerId,
                  skillRatings: SKILL_ORDER.map((skill) => ({ skill, score: scores[skill] })),
                });
                setToastMessage("Avaliação enviada!");
                await loadData();
              } catch (err) {
                setToastMessage((err as Error).message);
              }
            }}
          />
        )}
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </Layout>
  );
}

function PlayerSlot({
  position,
  participation,
  onClick,
}: {
  position: PadelPosition;
  participation?: ParticipationOutput;
  onClick?: () => void;
}) {
  if (!participation) {
    return (
      <div
        onClick={onClick}
        style={{
          border: "2px dashed var(--outline-variant)",
          borderRadius: "10px",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: onClick ? "pointer" : "default",
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
          {POSITION_LABELS[position]} {onClick ? "· toque para entrar" : "· livre"}
        </span>
      </div>
    );
  }

  return (
    <Link
      to={`/players/${participation.player.id}`}
      style={{
        background: "var(--surface-container-high)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        padding: "8px 10px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "2px solid var(--primary-fixed)",
          backgroundColor: "var(--surface-container-highest)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--primary-fixed)",
          fontWeight: 700,
          fontSize: "12px",
          flexShrink: 0,
        }}
      >
        {participation.player.name.charAt(0)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
          {participation.player.name}
        </span>
        <span style={{ fontSize: "10px", color: "var(--on-surface-variant)", fontWeight: 600 }}>
          OVR {participation.player.rating} · {POSITION_LABELS[participation.position]}
        </span>
      </div>
    </Link>
  );
}

function ResultForm({ onSubmit }: { onSubmit: (scorePair1: number, scorePair2: number) => void }) {
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);

  return (
    <section
      className="glass-panel animate-fade-in"
      style={{ borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}
    >
      <h2 className="font-display" style={{ fontSize: "17px", fontWeight: 800, color: "var(--primary-fixed)" }}>
        Registrar resultado
      </h2>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <ScoreInput label="Dupla 1" value={s1} onChange={setS1} />
        <span className="font-display" style={{ fontSize: "20px", fontWeight: 900 }}>x</span>
        <ScoreInput label="Dupla 2" value={s2} onChange={setS2} />
      </div>
      <button
        type="button"
        onClick={() => onSubmit(s1, s2)}
        disabled={s1 === s2}
        className="btn-primary"
        style={{ width: "100%" }}
      >
        {s1 === s2 ? "Os placares não podem empatar" : "Confirmar resultado"}
      </button>
    </section>
  );
}

function ScoreInput({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", fontWeight: 700 }}>{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        style={{
          width: 64,
          padding: "10px",
          borderRadius: "10px",
          backgroundColor: "var(--surface-container-high)",
          border: "1px solid var(--border-subtle)",
          color: "var(--primary-fixed)",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "18px",
          textAlign: "center",
          outline: "none",
        }}
      />
    </div>
  );
}

function EvaluationSection({
  roster,
  myId,
  evaluations,
  onSubmit,
}: {
  roster: ParticipationOutput[];
  myId: string;
  evaluations: EvaluationOutput[];
  onSubmit: (evaluatedPlayerId: string, scores: Record<Skill, number>) => void;
}) {
  const evaluatedByMe = new Set(
    evaluations.filter((e) => e.evaluatorPlayerId === myId).map((e) => e.evaluatedPlayerId)
  );
  const targets = roster.filter((p) => p.player.id !== myId);

  return (
    <section
      className="glass-panel animate-fade-in"
      style={{ borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <h2 className="font-display" style={{ fontSize: "17px", fontWeight: 800, color: "var(--on-surface)" }}>
        Avaliar fundamentos dos colegas
      </h2>
      {targets.map((p) =>
        evaluatedByMe.has(p.player.id) ? (
          <div key={p.id} style={{ fontSize: "13px", color: "var(--on-surface-variant)", fontWeight: 600 }}>
            ✓ {p.player.name} já avaliado
          </div>
        ) : (
          <EvaluationForm key={p.id} name={p.player.name} onSubmit={(scores) => onSubmit(p.player.id, scores)} />
        )
      )}
    </section>
  );
}

function EvaluationForm({
  name,
  onSubmit,
}: {
  name: string;
  onSubmit: (scores: Record<Skill, number>) => void;
}) {
  const [scores, setScores] = useState<Record<Skill, number>>(
    () => Object.fromEntries(SKILL_ORDER.map((s) => [s, 5])) as Record<Skill, number>
  );

  return (
    <div
      style={{
        background: "rgba(14, 14, 14, 0.7)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "12px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--on-surface)" }}>{name}</span>
      {SKILL_ORDER.map((skill) => (
        <label key={skill} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "12px" }}>
          <span style={{ width: 110, color: "var(--on-surface)", fontWeight: 600 }}>{SKILL_LABELS[skill]}</span>
          <input
            type="range"
            min={1}
            max={10}
            value={scores[skill]}
            onChange={(e) => setScores((prev) => ({ ...prev, [skill]: Number(e.target.value) }))}
            style={{ flex: 1 }}
          />
          <span
            className="font-display"
            style={{ width: 24, textAlign: "right", color: "var(--primary-fixed)", fontWeight: 800 }}
          >
            {scores[skill]}
          </span>
        </label>
      ))}
      <button type="button" onClick={() => onSubmit(scores)} className="btn-primary" style={{ width: "100%" }}>
        Enviar avaliação
      </button>
    </div>
  );
}
