import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { isDevSession } from "../devSession";
import {
  clearPostLoginRedirect,
  peekPostLoginRedirect,
  savePostLoginRedirect,
} from "../postLoginRedirect";

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

  const currentPath = location.pathname + location.search + location.hash;
  const pendingRedirect = peekPostLoginRedirect();

  useEffect(() => {
    // Once the user is on solid ground (authenticated with a usable profile),
    // the remembered deep link has served its purpose.
    if ((auth.isAuthenticated || devSession) && hasProfile && pendingRedirect) {
      clearPostLoginRedirect();
    }
  }, [auth.isAuthenticated, devSession, hasProfile, pendingRedirect]);

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
    savePostLoginRedirect(currentPath);
    return <Navigate to="/login" replace />;
  }

  if (hasProfile === false && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (
    hasProfile &&
    location.pathname !== "/onboarding" &&
    pendingRedirect &&
    pendingRedirect !== currentPath
  ) {
    return <Navigate to={pendingRedirect} replace />;
  }

  return <Outlet />;
}
