import { hashPassword, verifyPassword } from "./crypto";

export const VALID_USER = "ardfrmn";
// Default admin bcrypt hash generated securely
const ADMIN_HASH = hashPassword("firman173");
const AUTH_KEY = "fixentra_auth_session";

export type UserRole = "SUPER_ADMIN" | "FINANCE_MANAGER" | "OPERATOR";

export interface AuthUser {
  username: string;
  role: UserRole;
  name: string;
  email: string;
}

export interface AuthSession {
  authenticated: boolean;
  username: string | null;
  role?: UserRole;
  name?: string;
  email?: string;
  timestamp?: number;
}

/**
 * Enterprise authentication engine verifying credentials via bcrypt.
 */
export function authenticateUser(
  username: string,
  password: string
): { success: boolean; user?: AuthUser; error?: string } {
  const cleanUser = username?.trim() || "";
  const cleanPass = password || "";

  if (!cleanUser || !cleanPass) {
    return { success: false, error: "Username and password are required." };
  }

  // Check default enterprise administrator
  if (cleanUser === "ardfrmn" && verifyPassword(cleanPass, ADMIN_HASH)) {
    return {
      success: true,
      user: {
        username: "ardfrmn",
        role: "SUPER_ADMIN",
        name: "Firman Ardiansyah",
        email: "firman@fixentra.my.id",
      },
    };
  }

  // Check provisioned team members in browser storage if available
  if (typeof window !== "undefined") {
    try {
      const teamRaw = localStorage.getItem("fixentra_team_members");
      if (teamRaw) {
        const members = JSON.parse(teamRaw);
        if (Array.isArray(members)) {
          const matched = members.find(
            (m) => m.username?.toLowerCase() === cleanUser.toLowerCase()
          );
          if (matched && matched.passwordHash && verifyPassword(cleanPass, matched.passwordHash)) {
            return {
              success: true,
              user: {
                username: matched.username,
                role: matched.role || "OPERATOR",
                name: matched.name || matched.username,
                email: matched.email || `${matched.username}@fixentra.my.id`,
              },
            };
          }
        }
      }
    } catch {
      // Continue to unauthorized response
    }
  }

  return { success: false, error: "Invalid username or password. Access denied." };
}

/**
 * Backward compatibility helper for legacy call sites.
 */
export function validateCredentials(
  username: string,
  password: string
): { success: boolean; error?: string; user?: AuthUser } {
  const res = authenticateUser(username, password);
  return {
    success: res.success,
    error: res.error,
    user: res.user,
  };
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

export function setStoredSession(
  userOrUsername: string | AuthUser,
  remember = true
): void {
  if (typeof window === "undefined") return;

  const session: AuthSession =
    typeof userOrUsername === "string"
      ? {
          authenticated: true,
          username: userOrUsername.trim(),
          role: userOrUsername.trim() === "ardfrmn" ? "SUPER_ADMIN" : "OPERATOR",
          timestamp: Date.now(),
        }
      : {
          authenticated: true,
          username: userOrUsername.username,
          role: userOrUsername.role,
          name: userOrUsername.name,
          email: userOrUsername.email,
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
