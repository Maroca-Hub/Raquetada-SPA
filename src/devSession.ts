// Dev-only login: skips Keycloak and talks to the API running with the
// `development` Spring profile, which auto-authenticates every request as
// `X-User` (defaults to `ana.souza`). No mocked data — all responses come
// from the real API and its dev seeder.

const KEY = "lob_dev_session";

export const DEV_USER = "ana.souza";

export function isDevSession(): boolean {
  return localStorage.getItem(KEY) === "true";
}

export function enableDevSession(): void {
  localStorage.setItem(KEY, "true");
}

export function clearDevSession(): void {
  localStorage.removeItem(KEY);
}
