import { NavLink } from "react-router-dom";

const ITEMS: { to: string; end?: boolean; icon: string; label: string }[] = [
  { to: "/radar", icon: "radar", label: "Radar" },
  { to: "/", end: true, icon: "sports_tennis", label: "Partidas" },
  { to: "/profile", icon: "person", label: "Perfil" },
];

export function BottomNavigation() {
  return (
    <nav
      className="glass-nav pb-safe"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 68,
        zIndex: 50,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        padding: "0 16px",
      }}
    >
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            textDecoration: "none",
            color: isActive
              ? "var(--primary-fixed)"
              : "var(--on-surface-variant)",
            fontWeight: isActive ? 700 : 500,
            fontSize: "12px",
            flex: 1,
            height: "100%",
            transition: "all 0.15s ease",
            transform: isActive ? "scale(1.02)" : "scale(1)",
          })}
        >
          {({ isActive }) => (
            <>
              <span
                className={`material-symbols-outlined ${isActive ? "filled" : ""}`}
                style={{ fontSize: "24px" }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
