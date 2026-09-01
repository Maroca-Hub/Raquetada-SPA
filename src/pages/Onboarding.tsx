import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useApi } from "../hooks/useApi";
import { PlayerCard } from "../components/card/PlayerCard";
import { Toast } from "../components/common/Toast";
import { mockService } from "../services/mockData";
import type { Player, PreferredSide } from "../types";

const AVATAR_PRESETS = [
  {
    id: "avatar-1",
    label: "Foco Total",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-2",
    label: "Guerreira",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-3",
    label: "Paredão",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "avatar-4",
    label: "Dinâmica",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
  },
];

const AVAILABLE_TAGS = [
  "Agressivo na Rede",
  "Bom Saque",
  "Comunicação Clara",
  "Fair Play",
  "Smash Potente",
  "Ótima Defesa",
  "Lobs Perfeitos",
  "Paredão de Fundo",
  "Vibora Agressiva",
  "Espírito de Equipe",
];

const SIDE_OPTIONS: { id: PreferredSide; label: string; desc: string }[] = [
  { id: "DRIVE", label: "Drive (Direita)", desc: "Construção de pontos e consistência" },
  { id: "REVES", label: "Revés (Esquerda)", desc: "Finalizações e bolas aéreas" },
  { id: "AMBOS", label: "Ambos os Lados", desc: "Versatilidade e adaptação" },
];

const LEVEL_OPTIONS = [
  "Nível 3.0 - Iniciante",
  "Nível 4.0 - Intermediário",
  "Nível 5.0 - Avançado",
  "Nível 6.0 - Pro / Especial",
];

export function Onboarding() {
  const auth = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const initialUser = mockService.getCurrentUser();

  const [name, setName] = useState(initialUser.name || "");
  const [nickname, setNickname] = useState(initialUser.nickname || "");
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl || AVATAR_PRESETS[0].url);
  const [preferredSide, setPreferredSide] = useState<PreferredSide>(initialUser.preferredSide || "DRIVE");
  const [level, setLevel] = useState(initialUser.level || "Nível 3.0 - Iniciante");

  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialUser.tags && initialUser.tags.length > 0
      ? initialUser.tags
      : ["Fair Play", "Comunicação Clara"]
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial rating is 52 (Bronze tier), platform-driven attributes
  const initialRating = 52;

  // Temporary preview player
  const previewPlayer: Player = {
    id: auth.user?.profile?.sub || initialUser.id || "player-me",
    email: auth.user?.profile?.email || initialUser.email || "atleta@padel.com",
    name: name.trim() || "Seu Nome",
    nickname: nickname.trim() || undefined,
    avatarUrl,
    rating: initialRating,
    tier: "BRONZE",
    level,
    preferredSide,
    stats: {
      power: 0,
      speed: 0,
      technique: 0,
      stamina: 0,
    },
    evaluations: {
      fairPlay: 0,
      punctuality: 0,
      teamSpirit: 0,
      generalTechnique: 0,
    },
    tags: selectedTags,
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      } else {
        setToastMessage("Você pode escolher até 5 tags de destaque.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setToastMessage("Por favor, preencha seu nome.");
      return;
    }

    if (auth.isAuthenticated) {
      try {
        await api.players.updateMyProfile({ name: name.trim() });
      } catch (err) {
        console.warn("API profile update note:", err);
      }
    }

    mockService.saveCurrentUser(previewPlayer);
    localStorage.setItem("raquetada_onboarding_completed", "true");

    setToastMessage("Carta de jogador salva com sucesso!");
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-lowest)",
        color: "var(--on-surface)",
        paddingTop: "24px",
        paddingBottom: "48px",
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header Title */}
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "var(--primary-fixed)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Configuração de Jogador
          </span>
          <h1
            className="font-display"
            style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "var(--on-surface)",
              marginTop: 4,
            }}
          >
            Crie sua Carta Gamificada
          </h1>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginTop: 4 }}>
            Personalize sua identidade e posição. Seu rating inicial (52) evoluirá conforme suas partidas.
          </p>
        </div>

        {/* Live FUT Card Preview */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--primary-fixed)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            ⚡ Preview em Tempo Real
          </div>
          <PlayerCard player={previewPlayer} showAttributes={true} />
        </div>

        {/* Customization Form */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel"
          style={{
            borderRadius: "24px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Section 1: Identidade */}
          <div>
            <h2
              className="font-display"
              style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-fixed)", marginBottom: 12 }}
            >
              1. Identidade & Apelido
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: 6 }}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
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

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: 6 }}>
                  Apelido em Quadra
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ex: O Trovão, Paredão"
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
                />
              </div>
            </div>
          </div>

          {/* Section 2: Avatar Photo Presets */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: 8 }}>
              Escolha seu Avatar Esportivo
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              {AVATAR_PRESETS.map((p) => {
                const isSelected = avatarUrl === p.url;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAvatarUrl(p.url)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      background: isSelected ? "rgba(210, 240, 0, 0.15)" : "var(--surface-container-high)",
                      border: `2px solid ${isSelected ? "var(--primary-fixed)" : "transparent"}`,
                      borderRadius: "14px",
                      padding: "8px 4px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid var(--border-subtle)",
                      }}
                    >
                      <img src={p.url} alt={p.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: isSelected ? "var(--primary-fixed)" : "var(--on-surface-variant)",
                      }}
                    >
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Lado & Nível */}
          <div>
            <h2
              className="font-display"
              style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-fixed)", marginBottom: 12 }}
            >
              2. Posição e Nível Inicial
            </h2>

            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: 8 }}>
              Lado Preferido na Quadra
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "14px" }}>
              {SIDE_OPTIONS.map((opt) => {
                const isSelected = preferredSide === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPreferredSide(opt.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "10px 6px",
                      borderRadius: "10px",
                      backgroundColor: isSelected ? "var(--primary-fixed)" : "var(--surface-container-high)",
                      color: isSelected ? "var(--on-primary-fixed)" : "var(--on-surface)",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "12px",
                      transition: "all 0.15s",
                    }}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: 6 }}>
              Categoria
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
                fontSize: "14px",
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

          {/* Section 4: Tags de Destaque */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: 8 }}>
              3. Destaques do seu Estilo de Jogo (Escolha até 5)
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: "99px",
                      backgroundColor: isSelected ? "var(--primary-fixed)" : "var(--surface-container-high)",
                      color: isSelected ? "var(--on-primary-fixed)" : "var(--on-surface-variant)",
                      border: `1px solid ${isSelected ? "var(--primary-fixed)" : "var(--border-subtle)"}`,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating Info Box */}
          <div
            style={{
              background: "rgba(210, 240, 0, 0.08)",
              border: "1px solid rgba(210, 240, 0, 0.2)",
              borderRadius: "12px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span className="material-symbols-outlined filled" style={{ color: "var(--primary-fixed)", fontSize: "20px" }}>
              info
            </span>
            <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
              Seus atributos e rating inicial (52) serão calculados e evoluirão dinamicamente pela plataforma conforme suas partidas e avaliações.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              marginTop: "4px",
              borderRadius: "var(--radius-full)",
            }}
          >
            <span className="material-symbols-outlined filled">sports_tennis</span>
            Salvar & Entrar na Quadra
          </button>
        </form>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
