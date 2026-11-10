import { generateRandomHex } from "./crypto";

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
 * Generates an enterprise HMAC secret starting with whsec_.
 * Client-safe using Web Crypto API.
 */
export function generateWebhookSecret(): string {
  const hex = generateRandomHex(24);
  return `whsec_${hex}`;
}

/**
 * Validates webhook configuration input.
 */
export function validateWebhookInput(input: {
  name?: string;
  url?: string;
  events?: string[];
}): { valid: boolean; error?: string } {
  if (!input.name || input.name.trim().length === 0) {
    return { valid: false, error: "Webhook endpoint name cannot be empty." };
  }

  if (!input.url || input.url.trim().length === 0) {
    return { valid: false, error: "Target URL endpoint is required." };
  }

  try {
    const parsed = new URL(input.url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { valid: false, error: "Target URL must begin with http:// or https://" };
    }
  } catch {
    return { valid: false, error: "Please enter a valid HTTP/HTTPS URL." };
  }

  if (!input.events || input.events.length === 0) {
    return { valid: false, error: "Select at least one subscribed event topic." };
  }

  return { valid: true };
}
