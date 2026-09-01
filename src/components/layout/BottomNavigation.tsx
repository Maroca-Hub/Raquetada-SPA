import { NavLink } from "react-router-dom";

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
      <NavLink
        to="/"
        end
        style={({ isActive }) => ({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          textDecoration: "none",
          color: isActive ? "var(--primary-fixed)" : "var(--on-surface-variant)",
          fontWeight: isActive ? 700 : 500,
          fontSize: "12px",
          width: "50%",
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
              sports_tennis
            </span>
            <span>Partidas</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/profile"
        style={({ isActive }) => ({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          textDecoration: "none",
          color: isActive ? "var(--primary-fixed)" : "var(--on-surface-variant)",
          fontWeight: isActive ? 700 : 500,
          fontSize: "12px",
          width: "50%",
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
              person
            </span>
            <span>Perfil</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}
