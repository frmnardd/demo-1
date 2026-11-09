export const VALID_USER = "ardfrmn";
export const VALID_PASS = "firman173";
const AUTH_KEY = "fixentra_auth_session";

export interface AuthSession {
  authenticated: boolean;
  username: string | null;
  timestamp?: number;
}

export function validateCredentials(
  username: string,
  password: string
): { success: boolean; error?: string } {
  const cleanUser = username.trim();
  const cleanPass = password;

  if (!cleanUser || !cleanPass) {
    return { success: false, error: "Username dan password tidak boleh kosong." };
  }

  if (cleanUser === VALID_USER && cleanPass === VALID_PASS) {
    return { success: true };
  }

  return { success: false, error: "Username atau password salah. Silakan coba lagi." };
}

export function getStoredSession(): AuthSession {
  if (typeof window === "undefined") {
    return { authenticated: false, username: null };
  }

  try {
    const raw = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
    if (!raw) return { authenticated: false, username: null };

    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed && parsed.authenticated) {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to read auth session", err);
  }

  return { authenticated: false, username: null };
}

export function setStoredSession(username: string, remember = true): void {
  if (typeof window === "undefined") return;

  const session: AuthSession = {
    authenticated: true,
    username: username.trim(),
    timestamp: Date.now(),
  };

  const serialized = JSON.stringify(session);
  if (remember) {
    localStorage.setItem(AUTH_KEY, serialized);
  } else {
    sessionStorage.setItem(AUTH_KEY, serialized);
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
}
