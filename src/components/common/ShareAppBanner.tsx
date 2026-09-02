import { useState } from "react";
import { Toast } from "./Toast";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for insecure contexts / older browsers.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

export function ShareAppBanner() {
  const [toast, setToast] = useState<string | null>(null);

  const handleCopy = async () => {
    const ok = await copyToClipboard(window.location.origin);
    setToast(ok ? "Link do app copiado!" : "Não foi possível copiar o link.");
  };

  return (
    <>
      <section
        className="glass-panel animate-fade-in"
        style={{
          borderRadius: "18px",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          background:
            "linear-gradient(135deg, rgba(210, 240, 0, 0.12) 0%, rgba(20, 20, 20, 0.8) 100%)",
          border: "1px solid rgba(210, 240, 0, 0.3)",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--primary-fixed)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Incentive a comunidade
          </span>
          <h2
            className="font-display"
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: "var(--on-surface)",
              marginTop: 2,
            }}
          >
            Convide seus parceiros de quadra
          </h2>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="btn-primary"
          style={{
            padding: "10px 18px",
            fontSize: "13px",
            borderRadius: "var(--radius-full)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <span
            className="material-symbols-outlined filled"
            style={{ fontSize: "18px" }}
          >
            content_copy
          </span>
          Copiar link
        </button>
      </section>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
