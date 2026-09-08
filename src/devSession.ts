// Dev-only login: skips Keycloak and talks to the API running with the
// `development` Spring profile, which auto-authenticates every request as
// `X-User` (defaults to `ana.souza`). No mocked data — all responses come
// from the real API and its dev seeder.

const KEY = "lob_dev_session";

export const DEV_USER = "ana.souza";

// Purge any dev-session flag left on devices that used the test account
// before it was removed from production builds.
if (!import.meta.env.DEV) {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore — storage unavailable
  }
}

export function isDevSession(): boolean {
  return import.meta.env.DEV && localStorage.getItem(KEY) === "true";
}

export function enableDevSession(): void {
  localStorage.setItem(KEY, "true");
}

export function clearDevSession(): void {
  localStorage.removeItem(KEY);
}
