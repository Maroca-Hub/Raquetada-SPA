// Remembers the in-app destination a logged-out user tried to open, so the
// login / onboarding flow can drop them back on it instead of the home feed.

const KEY = "lob_post_login_redirect";

export function savePostLoginRedirect(path: string): void {
  if (
    !path ||
    path === "/" ||
    path.startsWith("/login") ||
    path.startsWith("/callback")
  ) {
    return;
  }
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    // sessionStorage unavailable — resume simply won't happen.
  }
}

export function peekPostLoginRedirect(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearPostLoginRedirect(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
