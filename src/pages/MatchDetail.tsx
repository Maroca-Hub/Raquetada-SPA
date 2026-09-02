import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
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
  FINISHED: "Concluída",
  CANCELLED: "Cancelada",
};

const COLUMNS_BOTTOM: PadelPosition[] = ["REVES", "DRIVE"];
const COLUMNS_TOP: PadelPosition[] = ["DRIVE", "REVES"];
const columnsForTeam = (team: number) =>
  team === 1 ? COLUMNS_TOP : COLUMNS_BOTTOM;
const POSITION_SHORT: Record<PadelPosition, string> = {
  DRIVE: "Drive",
  REVES: "Revés",
};

const DANGER_BUTTON: React.CSSProperties = {
  backgroundColor: "var(--error-container)",
  color: "var(--error)",
  boxShadow: "none",
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
  const [confirmingCancel, setConfirmingCancel] = useState(false);

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

  const startMs = match ? new Date(match.dateTime).getTime() : 0;
  const [hasStarted, setHasStarted] = useState(false);
  useEffect(() => {
    if (!match) return;
    const check = () => {
      const started = Date.now() >= startMs;
      setHasStarted(started);
      return started;
    };
    if (check()) return;
    const id = window.setInterval(() => {
      if (check()) window.clearInterval(id);
    }, 15000);
    return () => window.clearInterval(id);
  }, [match, startMs]);

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
  const isCancelled = match.status === "CANCELLED";
  const canCancel = isOrganizer && !isFinished && !isCancelled;
  const slotOf = (team: number, position: PadelPosition) =>
    roster.find((p) => p.team === team && p.position === position);

  const handleSlotClick = async (team: number, position: PadelPosition) => {
    if (slotOf(team, position)) return;
    if (isFinished || isCancelled) return;
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

  const handleCancel = async () => {
    try {
      await api.matches.cancel(matchId);
      setToastMessage("Partida cancelada.");
      await loadData();
    } catch (err) {
      setToastMessage((err as Error).message);
    } finally {
      setConfirmingCancel(false);
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

        {/* Organizer: register result */}
        {isOrganizer && match.status === "SCHEDULED" && (
          <LockedUntilStart
            locked={!hasStarted}
            message="Aguarde o início da partida para registrar o resultado."
          >
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
          </LockedUntilStart>
        )}

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
              !isCancelled &&
              (isConfirmed ||
                (!isConfirmed && match.status === "AWAITING_PLAYERS"))
            }
            onPickSlot={handleSlotClick}
          />
        </section>

        {/* Action */}
        <section>
          {isConfirmed && !isOrganizer && !isFinished && !isCancelled ? (
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

        {/* Peer evaluations (finished matches only) */}
        {isFinished && isConfirmed && (
          <LockedUntilStart
            locked={!hasStarted}
            message="Aguarde o início da partida para avaliar os jogadores."
          >
            <EvaluationPanel
              targets={roster.filter((p) => p.player.id !== myId)}
              evaluatedIds={
                new Set(
                  evaluations
                    .filter((e) => e.evaluatorPlayerId === myId)
                    .map((e) => e.evaluatedPlayerId),
                )
              }
              onEvaluate={(playerId, scores) =>
                api.matches.createEvaluation(matchId, {
                  evaluatedPlayerId: playerId,
                  skillRatings: SKILL_ORDER.map((skill) => ({
                    skill,
                    score: scores[skill],
                  })),
                })
              }
              onFinished={async () => {
                setToastMessage("Avaliações concluídas!");
                await loadData();
              }}
            />
          </LockedUntilStart>
        )}

        {canCancel && (
          <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              className="btn-primary"
              style={{ width: "100%", ...DANGER_BUTTON }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                cancel
              </span>
              Cancelar partida
            </button>
          </section>
        )}
      </div>

      {confirmingCancel && (
        <CancelMatchModal
          onConfirm={handleCancel}
          onClose={() => setConfirmingCancel(false)}
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </Layout>
  );
}

function CancelMatchModal({
  onConfirm,
  onClose,
}: {
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const run = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={() => !submitting && onClose()}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: "24px",
          padding: "24px",
          backgroundColor: "rgba(19, 19, 19, 0.97)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="font-display"
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "var(--on-surface)",
            marginBottom: 8,
          }}
        >
          Cancelar partida
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "var(--on-surface-variant)",
            lineHeight: 1.5,
          }}
        >
          Tem certeza que deseja cancelar esta partida? Esta ação não pode ser
          desfeita.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn-secondary"
            style={{ flex: 1 }}
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={run}
            disabled={submitting}
            className="btn-primary"
            style={{ flex: 1, ...DANGER_BUTTON }}
          >
            {submitting ? "Cancelando..." : "Confirmar cancelamento"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
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

function LockedUntilStart({
  locked,
  message,
  children,
}: {
  locked: boolean;
  message: string;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;
  return (
    <div style={{ position: "relative" }}>
      <div
        aria-hidden
        style={{
          opacity: 0.18,
          filter: "saturate(0.5)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "20px",
          background: "rgba(6, 6, 6, 0.72)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--on-surface-variant)",
          }}
        >
          {message}
        </span>
      </div>
    </div>
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
          gap: 18,
          padding: "6px 0",
        }}
      >
        <ScoreInput label="Dupla 1" value={s1} onChange={setS1} />
        <span
          className="font-display"
          style={{
            fontSize: "24px",
            fontWeight: 900,
            color: "var(--on-surface-variant)",
            alignSelf: "flex-end",
            paddingBottom: 8,
          }}
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

const MAX_SCORE = 99;

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: "11px",
          color: "var(--on-surface-variant)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <StepButton
          icon="remove"
          onStep={() => onChange((v) => Math.max(0, v - 1))}
          disabled={value <= 0}
        />
        <span
          className="font-display"
          style={{
            minWidth: 44,
            textAlign: "center",
            fontSize: "38px",
            fontWeight: 900,
            lineHeight: 1,
            color: "var(--primary-fixed)",
          }}
        >
          {value}
        </span>
        <StepButton
          icon="add"
          onStep={() => onChange((v) => Math.min(MAX_SCORE, v + 1))}
          disabled={value >= MAX_SCORE}
        />
      </div>
    </div>
  );
}

function StepButton({
  icon,
  onStep,
  disabled,
}: {
  icon: "remove" | "add";
  onStep: () => void;
  disabled?: boolean;
}) {
  // Guard against the same tap dispatching twice (touch → synthetic click, or a
  // fast double-tap): ignore a repeat within 200ms.
  const lastRef = useRef(0);
  const handle = () => {
    const now = Date.now();
    if (now - lastRef.current < 200) return;
    lastRef.current = now;
    onStep();
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={disabled}
      aria-label={icon === "add" ? "Aumentar" : "Diminuir"}
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface-container-high)",
        border: "1px solid var(--border-subtle)",
        color: "var(--on-surface)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.35 : 1,
        flexShrink: 0,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
        {icon}
      </span>
    </button>
  );
}

function EvaluationPanel({
  targets,
  evaluatedIds,
  onEvaluate,
  onFinished,
}: {
  targets: RosterMemberOutput[];
  evaluatedIds: Set<string>;
  onEvaluate: (
    playerId: string,
    scores: Record<Skill, number>,
  ) => Promise<unknown>;
  onFinished: () => void | Promise<void>;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const pending = targets.filter((p) => !evaluatedIds.has(p.player.id));
  const doneCount = targets.length - pending.length;
  const allDone = pending.length === 0;

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
          color: "var(--on-surface)",
        }}
      >
        Avaliações da partida
      </h2>

      {allDone ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--primary-fixed)",
          }}
        >
          <span
            className="material-symbols-outlined filled"
            style={{ fontSize: "22px" }}
          >
            check_circle
          </span>
          Você já avaliou todos os jogadores desta partida.
        </div>
      ) : (
        <>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>
            {doneCount > 0
              ? `Faltam ${pending.length} de ${targets.length} jogadores.`
              : `Avalie os ${targets.length} jogadores que jogaram com você.`}
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-primary"
            style={{ width: "100%" }}
          >
            {doneCount > 0 ? "Concluir avaliações" : "Iniciar avaliações"}
          </button>
        </>
      )}

      {modalOpen && (
        <EvaluationModal
          players={pending}
          onEvaluate={onEvaluate}
          onClose={(completedAny) => {
            setModalOpen(false);
            if (completedAny) void onFinished();
          }}
        />
      )}
    </section>
  );
}

const neutralStars = () =>
  Object.fromEntries(SKILL_ORDER.map((s) => [s, 2.5])) as Record<Skill, number>;

function EvaluationModal({
  players,
  onEvaluate,
  onClose,
}: {
  players: RosterMemberOutput[];
  onEvaluate: (
    playerId: string,
    scores: Record<Skill, number>,
  ) => Promise<unknown>;
  onClose: (completedAny: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [stars, setStars] = useState<Record<Skill, number>>(neutralStars);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const completedRef = useRef(false);

  const current = players[index];

  const handleSubmit = async () => {
    if (!current || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const scores = Object.fromEntries(
        SKILL_ORDER.map((s) => [s, Math.round(stars[s] * 2)]),
      ) as Record<Skill, number>;
      await onEvaluate(current.player.id, scores);
      completedRef.current = true;
      if (index + 1 >= players.length) {
        onClose(true);
      } else {
        setIndex(index + 1);
        setStars(neutralStars());
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
      }}
      onClick={() => onClose(completedRef.current)}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: 460,
          borderRadius: "24px",
          padding: "24px",
          backgroundColor: "rgba(19, 19, 19, 0.97)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: "14px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--on-surface-variant)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Jogador {index + 1} de {players.length}
            </span>
            <h2
              className="font-display"
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "var(--on-surface)",
              }}
            >
              {current?.player.name ?? ""}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onClose(completedRef.current)}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "var(--surface-container-high)",
              border: "1px solid var(--border-subtle)",
              color: "var(--on-surface-variant)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              close
            </span>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {SKILL_ORDER.map((skill) => (
            <div
              key={skill}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--on-surface)",
                }}
              >
                {SKILL_LABELS[skill]}
              </span>
              <StarRating
                value={stars[skill]}
                onChange={(v) => setStars((prev) => ({ ...prev, [skill]: v }))}
              />
            </div>
          ))}
        </div>

        {error && (
          <p
            style={{
              color: "var(--error)",
              fontSize: "13px",
              fontWeight: 600,
              marginTop: 12,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary"
          style={{ width: "100%", marginTop: 18 }}
        >
          {submitting
            ? "Enviando..."
            : index + 1 >= players.length
              ? "Enviar e concluir"
              : "Enviar e próximo"}
        </button>
      </div>
    </div>,
    document.body,
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const kind = value >= i ? "full" : value >= i - 0.5 ? "half" : "empty";
        return (
          <div key={i} style={{ position: "relative", width: 30, height: 30 }}>
            <span
              className={`material-symbols-outlined ${kind !== "empty" ? "filled" : ""}`}
              style={{
                position: "absolute",
                inset: 0,
                fontSize: "30px",
                pointerEvents: "none",
                color:
                  kind === "empty" ? "var(--outline)" : "var(--primary-fixed)",
              }}
            >
              {kind === "half" ? "star_half" : "star"}
            </span>
            <button
              type="button"
              aria-label={`${i - 0.5} estrelas`}
              onClick={() => onChange(i - 0.5)}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "50%",
                height: "100%",
                padding: 0,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            />
            <button
              type="button"
              aria-label={`${i} estrelas`}
              onClick={() => onChange(i)}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "50%",
                height: "100%",
                padding: 0,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
