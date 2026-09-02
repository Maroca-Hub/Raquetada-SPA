import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { isDevSession } from "../devSession";

export function RequireAuth() {
  const auth = useAuth();
  const api = useApi();
  const location = useLocation();

  const devSession = isDevSession();
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    async function checkProfile() {
      setCheckingProfile(true);
      try {
        const profile = await api.players.getMyProfile();
        if (active) setHasProfile(Boolean(profile?.name && profile.name.trim().length > 0));
      } catch {
        // Profile not provisioned yet — send the user through onboarding.
        if (active) setHasProfile(false);
      } finally {
        if (active) setCheckingProfile(false);
      }
    }

    if (auth.isAuthenticated || devSession) {
      checkProfile();
    }

    return () => {
      active = false;
    };
  }, [auth.isAuthenticated, devSession, api]);

  if (auth.isLoading || checkingProfile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--primary-fixed)",
          gap: 12,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "36px", animation: "spin 1s linear infinite" }}
        >
          sports_tennis
        </span>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--on-surface)" }}>
          Carregando perfil...
        </span>
      </div>
    );
  }

  if (!auth.isAuthenticated && !devSession) {
    return <Navigate to="/login" replace />;
  }

  if (hasProfile === false && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
