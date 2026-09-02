import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import type { PadelPosition } from "../../types";
import { POSITION_LABELS } from "../../services/api";

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
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

function defaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function CreateMatchModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateMatchModalProps) {
  const api = useApi();
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("19:30");
  const [position, setPosition] = useState<PadelPosition>("DRIVE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location.trim()) {
      setError("Informe o local da partida.");
      return;
    }

    const dateTime = new Date(`${date}T${time}:00`);
    if (Number.isNaN(dateTime.getTime()) || dateTime.getTime() <= Date.now()) {
      setError("Escolha uma data e hora no futuro.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.matches.create({
        dateTime: dateTime.toISOString(),
        location: location.trim(),
        position,
      });
      onClose();
      onSuccess("Partida criada com sucesso!");
      navigate(`/matches/${created.id}`);
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
      onClick={onClose}
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
            Criar nova partida
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
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Hora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Sua posição</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as PadelPosition)}
              style={inputStyle}
            >
              <option value="DRIVE" style={{ background: "#1c1b1b" }}>
                {POSITION_LABELS.DRIVE}
              </option>
              <option value="REVES" style={{ background: "#1c1b1b" }}>
                {POSITION_LABELS.REVES}
              </option>
            </select>
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
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ flex: 2, fontSize: "15px" }}
            >
              <span className="material-symbols-outlined filled">
                add_circle
              </span>
              {submitting ? "Publicando..." : "Publicar partida"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
