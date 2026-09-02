import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import type { MatchOutput } from "../../types";
import {
  formatDateBR,
  maskDateBR,
  maskTimeBR,
  parseDateTimeBR,
  toLocalISOString,
} from "../../lib/brDateTime";

interface EditMatchModalProps {
  match: MatchOutput;
  onClose: () => void;
  onSaved: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  backgroundColor: "var(--surface-container-high)",
  border: "1px solid var(--border-subtle)",
  color: "var(--on-surface)",
  fontSize: "14px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 700,
  color: "var(--on-surface)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

function hhmm(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

export function EditMatchModal({
  match,
  onClose,
  onSaved,
}: EditMatchModalProps) {
  const api = useApi();

  const initial = new Date(match.dateTime);
  const [location, setLocation] = useState(match.location);
  const [date, setDate] = useState(() => formatDateBR(initial));
  const [time, setTime] = useState(() => hhmm(initial));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location.trim()) {
      setError("Informe o local da partida.");
      return;
    }

    const dateTime = parseDateTimeBR(date, time);
    if (!dateTime) {
      setError("Data ou hora inválida. Use dd/mm/aaaa e hh:mm.");
      return;
    }
    if (dateTime.getTime() <= Date.now()) {
      setError("Escolha uma data e hora no futuro.");
      return;
    }

    setSubmitting(true);
    try {
      await api.matches.update(match.id, {
        dateTime: toLocalISOString(dateTime),
        location: location.trim(),
      });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
      onClick={() => !submitting && onClose()}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: "24px",
          padding: "24px",
          backgroundColor: "rgba(19, 19, 19, 0.95)",
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
            marginBottom: "20px",
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: "14px",
          }}
        >
          <h2
            className="font-display"
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--on-surface)",
            }}
          >
            Editar partida
          </h2>
          <button
            type="button"
            onClick={onClose}
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

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label style={labelStyle}>Local</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Arena Zona Sul"
              maxLength={200}
              style={inputStyle}
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label style={labelStyle}>Data</label>
              <input
                type="text"
                inputMode="numeric"
                value={date}
                onChange={(e) => setDate(maskDateBR(e.target.value))}
                placeholder="dd/mm/aaaa"
                maxLength={10}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Hora</label>
              <input
                type="text"
                inputMode="numeric"
                value={time}
                onChange={(e) => setTime(maskTimeBR(e.target.value))}
                placeholder="hh:mm"
                maxLength={5}
                style={inputStyle}
                required
              />
            </div>
          </div>

          {error && (
            <p
              style={{
                color: "var(--error)",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
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
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ flex: 2, fontSize: "15px" }}
            >
              <span className="material-symbols-outlined filled">save</span>
              {submitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
