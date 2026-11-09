import { describe, it, expect } from "vitest";
import { verifyApiKeyScope, extractBearerToken, ApiKeyRecord } from "../src/lib/api-gateway";

const sampleKey: ApiKeyRecord = {
  id: "key-1",
  name: "Production Webhook Key",
  keyPrefix: "fix_live_9f8a",
  keyHash: "hashed_value",
  permissions: ["read:orders", "read:analytics"],
  createdAt: "2026-11-10",
  active: true,
};

describe("API Gateway Security", () => {
  it("authorizes when required scope is present", () => {
    expect(verifyApiKeyScope(sampleKey, "read:orders")).toBe(true);
    expect(verifyApiKeyScope(sampleKey, "read:analytics")).toBe(true);
  });

  it("denies access when required scope is missing (Review Focus #2)", () => {
    expect(verifyApiKeyScope(sampleKey, "write:orders")).toBe(false);
  });

  it("extracts bearer token from authorization header correctly", () => {
    expect(extractBearerToken("Bearer fix_live_123456")).toBe("fix_live_123456");
    expect(extractBearerToken("bearer fix_live_abcdef")).toBe("fix_live_abcdef");
    expect(extractBearerToken("InvalidHeader")).toBeNull();
    expect(extractBearerToken(null)).toBeNull();
  });
});
