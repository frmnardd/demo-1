import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, generateApiKeySecret } from "../src/lib/crypto";

describe("Crypto & Hashing Utilities", () => {
  it("hashes password and verifies successfully (Review Focus #1)", () => {
    const raw = "firman173";
    const hash = hashPassword(raw);
    expect(hash).not.toBe(raw);
    expect(verifyPassword(raw, hash)).toBe(true);
    expect(verifyPassword("wrongpass", hash)).toBe(false);
  });

  it("generates live API key with fix_live_ prefix and secure hash", () => {
    const { secretKey, keyPrefix, keyHash } = generateApiKeySecret();
    expect(secretKey.startsWith("fix_live_")).toBe(true);
    expect(keyPrefix.startsWith("fix_live_")).toBe(true);
    expect(keyHash).toBeDefined();
    expect(keyHash).not.toBe(secretKey);
  });
});
