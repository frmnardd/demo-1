import { describe, it, expect } from "vitest";
import { validateApiKeyInput } from "../src/components/dashboard/developer-portal";

describe("Developer Portal Key Generator", () => {
  it("rejects empty key name or empty permissions", () => {
    expect(validateApiKeyInput({ name: "", permissions: ["read:orders"] }).valid).toBe(false);
    expect(validateApiKeyInput({ name: "CI/CD Token", permissions: [] }).valid).toBe(false);
  });

  it("accepts valid key generation input", () => {
    expect(validateApiKeyInput({ name: "Zapier Integration", permissions: ["read:orders"] }).valid).toBe(true);
  });
});
