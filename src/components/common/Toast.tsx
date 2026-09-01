import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "info" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === "success";
  const isError = type === "error";

  return (
    <div
      style={{
        position: "fixed",
        top: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 20px",
        borderRadius: "12px",
        background: "rgba(20, 20, 20, 0.95)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${isSuccess ? "var(--primary-fixed)" : isError ? "var(--error)" : "var(--secondary)"}`,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: 600,
        maxWidth: "90vw",
        animation: "fadeIn 0.25s ease-out",
      }}
    >
      <span
        className="material-symbols-outlined filled"
        style={{
          color: isSuccess ? "var(--primary-fixed)" : isError ? "var(--error)" : "var(--secondary)",
          fontSize: "20px",
        }}
      >
        {isSuccess ? "check_circle" : isError ? "error" : "info"}
      </span>
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255, 255, 255, 0.5)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          marginLeft: 8,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
      </button>
    </div>
  );
}
