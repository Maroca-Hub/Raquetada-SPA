import { useRef, useState } from "react";
import type { PlayerProfileOutput } from "../../types";
import { PlayerCard } from "./PlayerCard";
import { Toast } from "../common/Toast";
import { shareNodeAsImage } from "../../lib/shareCard";

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // strip accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "jogador"
  );
}

export function ShareCardButton({ profile }: { profile: PlayerProfileOutput }) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleShare = async () => {
    if (!exportRef.current || busy) return;
    setBusy(true);
    try {
      const profileUrl = `${window.location.origin}/players/${profile.id}`;
      const result = await shareNodeAsImage(exportRef.current, {
        fileName: `card-lob-${slugify(profile.name)}.png`,
        title: `${profile.name} · Lob`,
        text: `Meu card na Lob — GERAL ${profile.currentRating}\nVer meu perfil: ${profileUrl}`,
        url: profileUrl,
      });
      if (result === "downloaded")
        setToast("Imagem do card salva no dispositivo.");
    } catch (err) {
      setToast(`Não foi possível gerar a imagem (${(err as Error).message}).`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        className="btn-primary"
        style={{ width: "100%", borderRadius: "var(--radius-md)" }}
      >
        <span
          className="material-symbols-outlined filled"
          style={{ fontSize: "18px" }}
        >
          share
        </span>
        {busy ? "Gerando imagem..." : "Compartilhar meu card"}
      </button>

      {/* Off-screen, fixed-width render used only as the capture source. */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          pointerEvents: "none",
        }}
      >
        <div
          ref={exportRef}
          style={{
            width: 380,
            padding: 20,
            background: "#0e0e0e",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <PlayerCard profile={profile} showProgress={false} showSkillsRow />
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--primary-fixed)",
              fontFamily: "var(--font-display)",
            }}
          >
            Lob
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
