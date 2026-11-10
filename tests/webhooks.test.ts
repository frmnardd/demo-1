import { describe, it, expect } from "vitest";
import {
  generateWebhookSecret,
  validateWebhookInput,
} from "../src/lib/webhooks";
import {
  signWebhookPayload,
  verifyWebhookSignature,
} from "../src/lib/webhooks-server";

describe("Enterprise Webhooks Engine", () => {
  it("generates secret key starting with whsec_", () => {
    const secret = generateWebhookSecret();
    expect(secret.startsWith("whsec_")).toBe(true);
    expect(secret.length).toBeGreaterThan(20);
  });

  it("signs payload with HMAC-SHA256 and verifies correctly", () => {
    const secret = "whsec_test_secret_12345";
    const payload = JSON.stringify({ event: "order.created", id: "ord-101" });
    const signature = signWebhookPayload(payload, secret);

    expect(signature).toBeDefined();
    expect(verifyWebhookSignature(payload, signature, secret)).toBe(true);
    expect(verifyWebhookSignature(payload, "invalid_sig", secret)).toBe(false);
  });

  it("validates webhook input correctly", () => {
    expect(validateWebhookInput({ name: "", url: "https://example.com", events: ["order.created"] }).valid).toBe(false);
    expect(validateWebhookInput({ name: "Slack", url: "invalid-url", events: ["order.created"] }).valid).toBe(false);
    expect(validateWebhookInput({ name: "Slack", url: "https://hooks.slack.com", events: [] }).valid).toBe(false);
    expect(validateWebhookInput({ name: "Slack", url: "https://hooks.slack.com", events: ["order.created"] }).valid).toBe(true);
  });
});
