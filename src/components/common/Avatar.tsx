import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  /** Extra styles for the circle (border, glow class via className, etc.). */
  style?: React.CSSProperties;
  className?: string;
  /** Color of the fallback initial. */
  letterColor?: string;
}

/**
 * Round player avatar. Shows the photo when `src` is set (and loads); otherwise
 * falls back to the first letter of the name.
 */
export function Avatar({
  src,
  name,
  size = 38,
  style,
  className,
  letterColor = "var(--on-surface)",
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--surface-container-highest)",
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: Math.round(size * 0.42),
        lineHeight: 1,
        color: letterColor,
        ...style,
      }}
    >
      {showImg ? (
        <img
          src={src as string}
          alt={name}
          crossOrigin="anonymous"
          onError={() => setFailed(true)}
          // Clip the photo on the <img> itself rather than with `overflow:
          // hidden` on the wrapper — the latter makes html-to-image bail
          // mid-render, dropping the card's gradient/glow in exports.
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ) : (
        <span>{(name.trim().charAt(0) || "?").toUpperCase()}</span>
      )}
    </div>
  );
}
