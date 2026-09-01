import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useApi } from "../../hooks/useApi";
import { mockService } from "../../services/mockData";

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const DAY_OPTIONS = [
  { id: "today", label: "Hoje", daysOffset: 0 },
  { id: "tomorrow", label: "Amanhã", daysOffset: 1 },
  { id: "saturday", label: "Sábado", daysOffset: 5 },
  { id: "sunday", label: "Domingo", daysOffset: 6 },
] as const;

const LEVEL_OPTIONS = [
  "Todos os níveis",
  "Iniciante (Nível 2.0 a 3.5)",
  "Intermediário (Nível 4.0 a 4.5)",
  "Avançado (Nível 5.0 a 5.5)",
  "Pro / Especial (Nível 6.0+)",
];

export function CreateMatchModal({ isOpen, onClose, onSuccess }: CreateMatchModalProps) {
  const auth = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  const [clubName, setClubName] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [dayCategory, setDayCategory] = useState<"today" | "tomorrow" | "saturday" | "sunday">("today");
  const [timeRange, setTimeRange] = useState("19:30 - 21:00");
  const [price, setPrice] = useState(45);
  const [level, setLevel] = useState("Todos os níveis");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clubName.trim()) {
      alert("Por favor, informe o nome do clube ou local da partida.");
      return;
    }

    setSubmitting(true);
    const dayObj = DAY_OPTIONS.find((d) => d.id === dayCategory) || DAY_OPTIONS[0];
    const formattedDateTime = `${dayObj.label}, ${timeRange}`;
    const locationString = additionalInfo.trim()
      ? `${clubName.trim()} — ${additionalInfo.trim()}`
      : clubName.trim();
    const courtName = additionalInfo.trim() || "Quadra Aberta";

    if (auth.isAuthenticated) {
      try {
        // Build ISO string for API
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + dayObj.daysOffset);
        const timeParts = timeRange.split("-")[0].trim().split(":");
        const hours = Number(timeParts[0]) || 19;
        const minutes = Number(timeParts[1]) || 30;
        targetDate.setHours(hours, minutes, 0, 0);

        const createdMatchOutput = await api.matches.create({
          dateTime: targetDate.toISOString(),
          location: locationString,
        });

        // Automatically join Dupla 1 as organizer
        try {
          await api.matches.join(createdMatchOutput.id, { team: 1 });
        } catch (joinErr) {
          console.warn("Auto-join participation note:", joinErr);
        }

        onClose();
        onSuccess(`Partida criada com sucesso no ${clubName.trim()}!`);
        navigate(`/matches/${createdMatchOutput.id}`);
      } catch (err) {
        console.error("API create match error:", err);
        // Fallback to local
        const localMatch = mockService.createMatch({
          clubName: clubName.trim(),
          courtName,
          location: locationString,
          dateTime: formattedDateTime,
          dateCategory: dayCategory,
          pricePerPerson: Number(price) || 45,
          levelRequired: level,
        });
        onClose();
        onSuccess(`Partida criada com sucesso!`);
        navigate(`/matches/${localMatch.id}`);
      }
    } else {
      const createdMatch = mockService.createMatch({
        clubName: clubName.trim(),
        courtName,
        location: locationString,
        dateTime: formattedDateTime,
        dateCategory: dayCategory,
        pricePerPerson: Number(price) || 45,
        levelRequired: level,
      });

      onClose();
      onSuccess(`Partida criada com sucesso no ${createdMatch.clubName}!`);
      navigate(`/matches/${createdMatch.id}`);
    }

    setSubmitting(false);
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
          position: "relative",
          animation: "fadeIn 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "rgba(210, 240, 0, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-fixed)",
                border: "1px solid rgba(210, 240, 0, 0.3)",
              }}
            >
              <span className="material-symbols-outlined filled" style={{ fontSize: "22px" }}>
                sports_tennis
              </span>
            </div>
            <div>
              <h2
                className="font-display"
                style={{ fontSize: "20px", fontWeight: 800, color: "var(--on-surface)" }}
              >
                Criar Nova Partida
              </h2>
            </div>
          </div>

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
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              close
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Clube / Arena */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--on-surface)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Nome do Clube / Local
            </label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="Ex: Padel Pro Arena, Clube de Padel Elite..."
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: "var(--surface-container-high)",
                border: "1px solid var(--border-subtle)",
                color: "var(--on-surface)",
                fontSize: "14px",
                outline: "none",
              }}
              required
            />
          </div>

          {/* Informações adicionais / Quadra */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--on-surface)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Quadra / Informações Adicionais (Opcional)
            </label>
            <input
              type="text"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Ex: Quadra 2, Quadra Central coberta, etc."
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: "var(--surface-container-high)",
                border: "1px solid var(--border-subtle)",
                color: "var(--on-surface)",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {/* Dia & Horário */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--on-surface)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Dia
              </label>
              <select
                value={dayCategory}
                onChange={(e) => setDayCategory(e.target.value as "today" | "tomorrow" | "saturday" | "sunday")}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "var(--surface-container-high)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--on-surface)",
                  fontSize: "14px",
                  outline: "none",
                }}
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d.id} value={d.id} style={{ background: "#1c1b1b" }}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--on-surface)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Horário
              </label>
              <input
                type="text"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                placeholder="Ex: 19:30 - 21:00"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "var(--surface-container-high)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--on-surface)",
                  fontSize: "14px",
                  outline: "none",
                }}
                required
              />
            </div>
          </div>

          {/* Preço & Nível */}
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "12px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--on-surface)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                R$ / Pessoa
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "var(--surface-container-high)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--primary-fixed)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "16px",
                  outline: "none",
                }}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--on-surface)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Nível Sugerido
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "var(--surface-container-high)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--on-surface)",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                {LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl} value={lvl} style={{ background: "#1c1b1b" }}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
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
              <span className="material-symbols-outlined filled">add_circle</span>
              {submitting ? "Publicando..." : "Publicar Partida"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
