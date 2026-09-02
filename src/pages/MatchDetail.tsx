import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { ShareButton } from "../components/common/ShareButton";
import { Toast } from "../components/common/Toast";
import { useApi } from "../hooks/useApi";
import {
  POSITION_LABELS,
  SKILL_LABELS,
  SKILL_ORDER,
  formatMatchDateTime,
} from "../services/api";
import type {
  EvaluationOutput,
  MatchOutput,
  PadelPosition,
  RosterMemberOutput,
  Skill,
} from "../types";

const STATUS_LABEL: Record<string, string> = {
  AWAITING_PLAYERS: "Aguardando jogadores",
  SCHEDULED: "Confirmada",
  FINISHED: "Finalizada",
};

const COLUMNS_BOTTOM: PadelPosition[] = ["REVES", "DRIVE"];
const COLUMNS_TOP: PadelPosition[] = ["DRIVE", "REVES"];
const columnsForTeam = (team: number) =>
  team === 1 ? COLUMNS_TOP : COLUMNS_BOTTOM;
const POSITION_SHORT: Record<PadelPosition, string> = {
  DRIVE: "Drive",
  REVES: "Revés",
};

export function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const matchId = id ?? "";
  const api = useApi();

  const [myId, setMyId] = useState("");
  const [match, setMatch] = useState<MatchOutput | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [me, matchOutput] = await Promise.all([
        api.players.getMyProfile(),
        api.matches.get(matchId),
      ]);
      setNotFound(false);
      setMyId(me.id);
      setMatch(matchOutput);

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
    void (async () => {
      setLoading(true);
      await loadData();
    })();
  }, [loadData]);

  if (loading) {
    return (
      <Layout showBack title="Carregando...">
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--primary-fixed)",
          }}
        >
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
        <div
          className="glass-panel"
          style={{
            borderRadius: "16px",
            padding: "32px 20px",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: 16 }}>
            {notFound
              ? "Esta partida não existe."
              : "Não foi possível carregar a partida."}
          </p>
          <Link to="/" className="btn-primary">
            Voltar ao feed
          </Link>
        </div>
      </Layout>
    );
  }

  const roster = match.roster;
  const isOrganizer = match.organizer.id === myId;
  const isConfirmed = roster.some((p) => p.player.id === myId);
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
        setToastMessage(
          `Você mudou para a Dupla ${team} · ${POSITION_LABELS[position]}.`,
        );
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
          style={{
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
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
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "var(--on-surface)",
                  marginTop: 2,
                }}
              >
                {match.location}
              </h1>
            </div>
            <div className="badge-court" style={{ maxWidth: "45%" }}>
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
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--on-surface-variant)",
                  display: "block",
                }}
              >
                Vagas
              </span>
              <span
                className="font-display"
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "var(--primary-fixed)",
                }}
              >
                {roster.length}/4
              </span>
            </div>
            <div>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--on-surface-variant)",
                  display: "block",
                }}
              >
                Horário
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 2,
                  fontWeight: 700,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "16px", color: "var(--primary-fixed)" }}
                >
                  schedule
                </span>
                <span style={{ fontSize: "13px" }}>
                  {formatMatchDateTime(match.dateTime)}
                </span>
              </div>
            </div>

            {isFinished &&
              match.scorePair1 != null &&
              match.scorePair2 != null && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--on-surface-variant)",
                      display: "block",
                    }}
                  >
                    Resultado
                  </span>
                  <span
                    className="font-display"
                    style={{
                      fontSize: "20px",
                      fontWeight: 900,
                      color: "var(--on-surface)",
                    }}
                  >
                    {match.scorePair1} — {match.scorePair2}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--on-surface-variant)",
                      marginLeft: 8,
                    }}
                  >
                    (Dupla 1 x Dupla 2)
                  </span>
                </div>
              )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
            }}
          >
            <span style={{ color: "var(--on-surface-variant)" }}>
              Organizado por:
            </span>
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
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}
              >
                chevron_right
              </span>
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
          style={{
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h2
            className="font-display"
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--on-surface)",
            }}
          >
            Escalação
          </h2>

          <CourtLineup
            slotOf={slotOf}
            myId={myId}
            canPickSlot={(team, position) =>
              !slotOf(team, position) &&
              !isFinished &&
              (isConfirmed ||
                (!isConfirmed && match.status === "AWAITING_PLAYERS"))
            }
            onPickSlot={handleSlotClick}
          />
        </section>

        {/* Action */}
        <section>
          {isConfirmed && !isOrganizer && !isFinished ? (
            <button
              type="button"
              onClick={handleLeave}
              className="btn-secondary"
              style={{
                width: "100%",
                color: "var(--error)",
                borderColor: "rgba(255, 180, 171, 0.3)",
              }}
            >
              Sair da partida
            </button>
          ) : !isConfirmed && !isFull && match.status === "AWAITING_PLAYERS" ? (
            <div
              className="glass-panel"
              style={{
                borderRadius: "14px",
                padding: "16px",
                textAlign: "center",
                color: "var(--on-surface-variant)",
              }}
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
                await api.matches.registerResult(matchId, {
                  scorePair1,
                  scorePair2,
                });
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
                  skillRatings: SKILL_ORDER.map((skill) => ({
                    skill,
                    score: scores[skill],
                  })),
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

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </Layout>
  );
}

function CourtLineup({
  slotOf,
  myId,
  canPickSlot,
  onPickSlot,
}: {
  slotOf: (
    team: number,
    position: PadelPosition,
  ) => RosterMemberOutput | undefined;
  myId: string;
  canPickSlot: (team: number, position: PadelPosition) => boolean;
  onPickSlot: (team: number, position: PadelPosition) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <PositionHeaders columns={COLUMNS_TOP} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          border: "1px solid var(--border-subtle)",
          borderRadius: "16px",
          overflow: "hidden",
          background: "rgba(14, 14, 14, 0.7)",
        }}
      >
        {[1, 2].map((team) =>
          columnsForTeam(team).map((position, colIndex) => (
            <CourtCell
              key={`${team}-${position}`}
              part={slotOf(team, position)}
              isMe={slotOf(team, position)?.player.id === myId}
              isTopRow={team === 1}
              isLeftCol={colIndex === 0}
              clickable={canPickSlot(team, position)}
              onClick={() => onPickSlot(team, position)}
            />
          )),
        )}
      </div>

      <PositionHeaders columns={COLUMNS_BOTTOM} />
    </div>
  );
}

function PositionHeaders({ columns }: { columns: PadelPosition[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {columns.map((position) => (
        <div
          key={position}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--on-surface-variant)",
              background: "var(--surface-container-high)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              padding: "3px 14px",
            }}
          >
            {POSITION_SHORT[position]}
          </span>
        </div>
      ))}
    </div>
  );
}

function CourtCell({
  part,
  isMe,
  isTopRow,
  isLeftCol,
  clickable,
  onClick,
}: {
  part?: RosterMemberOutput;
  isMe: boolean;
  isTopRow: boolean;
  isLeftCol: boolean;
  clickable: boolean;
  onClick: () => void;
}) {
  const cellStyle: React.CSSProperties = {
    minHeight: 240,
    padding: "18px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRight: isLeftCol ? "1px solid var(--border-subtle)" : undefined,
    borderBottom: isTopRow ? "2px solid rgba(210, 240, 0, 0.25)" : undefined,
  };

  if (!part) {
    return (
      <div
        onClick={clickable ? onClick : undefined}
        style={{ ...cellStyle, cursor: clickable ? "pointer" : "default" }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            border: "2px dashed var(--primary-fixed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary-fixed)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "26px" }}
          >
            add
          </span>
        </div>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 800,
            color: "var(--primary-fixed)",
          }}
        >
          Vaga
        </span>
      </div>
    );
  }

  return (
    <Link
      to={`/players/${part.player.id}`}
      style={{ ...cellStyle, textDecoration: "none" }}
    >
      <div style={{ position: "relative" }}>
        <div
          className={isMe ? "neon-glow" : undefined}
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            border: `3px solid ${isMe ? "var(--primary-fixed)" : "var(--outline-variant)"}`,
            backgroundColor: "var(--surface-container-highest)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isMe ? "var(--primary-fixed)" : "var(--on-surface)",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "20px",
          }}
        >
          {part.player.name.charAt(0).toUpperCase()}
        </div>
        <span
          style={{
            position: "absolute",
            right: -2,
            bottom: -2,
            minWidth: 20,
            height: 20,
            padding: "0 4px",
            borderRadius: "999px",
            background: isMe
              ? "var(--primary-fixed)"
              : "var(--surface-container-highest)",
            color: isMe ? "var(--on-primary-fixed)" : "var(--on-surface)",
            border: "2px solid var(--surface-container)",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {part.player.rating}
        </span>
      </div>

      <span
        style={{
          fontSize: "15px",
          fontWeight: 800,
          color: "var(--on-surface)",
          maxWidth: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {isMe ? "Você" : part.player.name}
      </span>
    </Link>
  );
}

function ResultForm({
  onSubmit,
}: {
  onSubmit: (scorePair1: number, scorePair2: number) => void;
}) {
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);

  return (
    <section
      className="glass-panel animate-fade-in"
      style={{
        borderRadius: "20px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <h2
        className="font-display"
        style={{
          fontSize: "17px",
          fontWeight: 800,
          color: "var(--primary-fixed)",
        }}
      >
        Registrar resultado
      </h2>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <ScoreInput label="Dupla 1" value={s1} onChange={setS1} />
        <span
          className="font-display"
          style={{ fontSize: "20px", fontWeight: 900 }}
        >
          x
        </span>
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

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: "11px",
          color: "var(--on-surface-variant)",
          fontWeight: 700,
        }}
      >
        {label}
      </span>
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
  roster: RosterMemberOutput[];
  myId: string;
  evaluations: EvaluationOutput[];
  onSubmit: (evaluatedPlayerId: string, scores: Record<Skill, number>) => void;
}) {
  const evaluatedByMe = new Set(
    evaluations
      .filter((e) => e.evaluatorPlayerId === myId)
      .map((e) => e.evaluatedPlayerId),
  );
  const targets = roster.filter((p) => p.player.id !== myId);

  return (
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
      <h2
        className="font-display"
        style={{
          fontSize: "17px",
          fontWeight: 800,
          color: "var(--on-surface)",
        }}
      >
        Avaliar fundamentos dos colegas
      </h2>
      {targets.map((p) =>
        evaluatedByMe.has(p.player.id) ? (
          <div
            key={p.player.id}
            style={{
              fontSize: "13px",
              color: "var(--on-surface-variant)",
              fontWeight: 600,
            }}
          >
            ✓ {p.player.name} já avaliado
          </div>
        ) : (
          <EvaluationForm
            key={p.player.id}
            name={p.player.name}
            onSubmit={(scores) => onSubmit(p.player.id, scores)}
          />
        ),
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
    () =>
      Object.fromEntries(SKILL_ORDER.map((s) => [s, 5])) as Record<
        Skill,
        number
      >,
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
      <span
        style={{
          fontWeight: 700,
          fontSize: "14px",
          color: "var(--on-surface)",
        }}
      >
        {name}
      </span>
      {SKILL_ORDER.map((skill) => (
        <label
          key={skill}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "12px",
          }}
        >
          <span
            style={{ width: 110, color: "var(--on-surface)", fontWeight: 600 }}
          >
            {SKILL_LABELS[skill]}
          </span>
          <input
            type="range"
            min={1}
            max={10}
            value={scores[skill]}
            onChange={(e) =>
              setScores((prev) => ({
                ...prev,
                [skill]: Number(e.target.value),
              }))
            }
            style={{ flex: 1 }}
          />
          <span
            className="font-display"
            style={{
              width: 24,
              textAlign: "right",
              color: "var(--primary-fixed)",
              fontWeight: 800,
            }}
          >
            {scores[skill]}
          </span>
        </label>
      ))}
      <button
        type="button"
        onClick={() => onSubmit(scores)}
        className="btn-primary"
        style={{ width: "100%" }}
      >
        Enviar avaliação
      </button>
    </div>
  );
}
