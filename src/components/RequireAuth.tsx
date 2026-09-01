import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApi } from "../hooks/useApi";

export function RequireAuth() {
  const auth = useAuth();
  const api = useApi();
  const location = useLocation();

  const isDemo = localStorage.getItem("raquetada_demo_session") === "true";
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    async function checkProfile() {
      const localOnboardingDone =
        localStorage.getItem("raquetada_onboarding_completed") === "true";

      if (localOnboardingDone) {
        if (active) setHasProfile(true);
        return;
      }

      if (auth.isAuthenticated) {
        setCheckingProfile(true);
        try {
          const profile = await api.players.getMyProfile();
          // Check if profile exists and has a configured name
          if (profile && profile.name && profile.name.trim().length > 0) {
            localStorage.setItem("raquetada_onboarding_completed", "true");
            if (active) setHasProfile(true);
          } else {
            if (active) setHasProfile(false);
          }
        } catch {
          // If profile does not exist yet on backend, user needs onboarding
          if (active) setHasProfile(false);
        } finally {
          if (active) setCheckingProfile(false);
        }
      } else if (isDemo) {
        if (active) setHasProfile(localOnboardingDone);
      }
    }

    if (auth.isAuthenticated || isDemo) {
      checkProfile();
    }

    return () => {
      active = false;
    };
  }, [auth.isAuthenticated, isDemo, api]);

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

  if (!auth.isAuthenticated && !isDemo) {
    return <Navigate to="/login" replace />;
  }

  // If user has no profile and is not currently on /onboarding, redirect to /onboarding automatically
  if (hasProfile === false && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
