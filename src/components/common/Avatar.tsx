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
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--surface-container-highest)",
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: Math.round(size * 0.42),
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
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        (name.trim().charAt(0) || "?").toUpperCase()
      )}
    </div>
  );
}
