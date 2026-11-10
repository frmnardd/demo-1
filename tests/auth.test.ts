import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateCredentials } from "../src/lib/auth";
import { hashPassword } from "../src/lib/crypto";

const storage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => {
    storage[key] = value;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  },
};

(globalThis as any).window = globalThis;
(globalThis as any).localStorage = mockLocalStorage;

describe("Authentication Engine", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("authenticates valid username and password (ardfrmn : firman173)", () => {
    const result = validateCredentials("ardfrmn", "firman173");
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("authenticates when username has leading/trailing whitespace", () => {
    const result = validateCredentials("  ardfrmn  ", "firman173");
    expect(result.success).toBe(true);
  });

  it("authenticates with updated password after administrative password change", () => {
    const newHash = hashPassword("newSecurePass2026!");
    localStorage.setItem("fixentra_admin_password_hash", newHash);

    // Old password should fail
    expect(validateCredentials("ardfrmn", "firman173").success).toBe(false);

    // New password should succeed
    const res = validateCredentials("ardfrmn", "newSecurePass2026!");
    expect(res.success).toBe(true);
  });

  it("rejects invalid username or password (Review Focus #1)", () => {
    expect(validateCredentials("wronguser", "firman173").success).toBe(false);
    expect(validateCredentials("ardfrmn", "wrongpass").success).toBe(false);
    expect(validateCredentials("", "").success).toBe(false);
  });
});
