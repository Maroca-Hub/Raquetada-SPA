import { useState } from "react";
import { Toast } from "./Toast";

interface ShareButtonProps {
  matchId: string;
  title: string;
  location: string;
  dateTime: string;
  variant?: "primary" | "icon" | "outline";
}

export function ShareButton({
  matchId,
  title,
  location,
  dateTime,
  variant = "outline",
}: ShareButtonProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/matches/${matchId}`;
    const shareText = `🎾 Bora jogar Padel no ${title}?\n📅 ${dateTime}\n📍 ${location}\nEntre na partida: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Partida de Padel: ${title}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setToastMessage("Link da partida copiado para a área de transferência!");
      })
      .catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setToastMessage("Link copiado com sucesso!");
      });
  };

  return (
    <>
      {variant === "icon" && (
        <button
          type="button"
          onClick={handleShare}
          title="Compartilhar Partida"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "var(--surface-container-high)",
            border: "1px solid var(--border-subtle)",
            color: "var(--primary-fixed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary-fixed)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>share</span>
        </button>
      )}

      {variant === "outline" && (
        <button
          type="button"
          onClick={handleShare}
          className="btn-outline-lime"
          style={{ width: "100%" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>share</span>
          Compartilhar Partida
        </button>
      )}

      {variant === "primary" && (
        <button
          type="button"
          onClick={handleShare}
          className="btn-primary"
          style={{ width: "100%" }}
        >
          <span className="material-symbols-outlined filled" style={{ fontSize: "18px" }}>share</span>
          Convidar Amigos
        </button>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
}
