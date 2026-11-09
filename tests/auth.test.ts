import { describe, it, expect } from "vitest";
import { validateCredentials } from "../src/lib/auth";

describe("Authentication Engine", () => {
  it("authenticates valid username and password (ardfrmn : firman173)", () => {
    const result = validateCredentials("ardfrmn", "firman173");
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("authenticates when username has leading/trailing whitespace", () => {
    const result = validateCredentials("  ardfrmn  ", "firman173");
    expect(result.success).toBe(true);
  });

  it("rejects invalid username or password (Review Focus #1)", () => {
    expect(validateCredentials("wronguser", "firman173").success).toBe(false);
    expect(validateCredentials("ardfrmn", "wrongpass").success).toBe(false);
    expect(validateCredentials("", "").success).toBe(false);
  });
});
