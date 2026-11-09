import crypto from "crypto";

export type WebhookEvent = "order.created" | "order.paid" | "order.failed" | "order.deleted";

export interface WebhookRecord {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secretKey: string;
  active: boolean;
  lastDeliveredAt?: string | null;
  lastStatusCode?: number | null;
  createdAt: string;
}

/**
 * Generates an enterprise HMAC secret starting with whsec_
 */
export function generateWebhookSecret(): string {
  const bytes = crypto.randomBytes(24).toString("hex");
  return `whsec_${bytes}`;
}

/**
 * Signs a payload body using HMAC-SHA256
 */
export function signWebhookPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verifies an incoming HMAC-SHA256 signature
 */
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!payload || !signature || !secret) return false;
  try {
    const expected = signWebhookPayload(payload, secret);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Validates webhook configuration input
 */
export function validateWebhookInput(input: {
  name?: string;
  url?: string;
  events?: string[];
}): { valid: boolean; error?: string } {
  if (!input.name || input.name.trim().length === 0) {
    return { valid: false, error: "Webhook identifier/name cannot be empty." };
  }

  if (!input.url) {
    return { valid: false, error: "Target URL cannot be empty." };
  }

  try {
    const parsedUrl = new URL(input.url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return { valid: false, error: "Webhook URL must use HTTP or HTTPS protocol." };
    }
  } catch {
    return { valid: false, error: "Invalid Webhook URL format." };
  }

  if (!input.events || input.events.length === 0) {
    return { valid: false, error: "Please select at least one trigger event." };
  }

  return { valid: true };
}
