import crypto from "crypto";

/**
 * Signs a payload body using HMAC-SHA256 (Server-Only).
 */
export function signWebhookPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verifies an incoming HMAC-SHA256 signature using timing-safe comparison (Server-Only).
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!payload || !signature || !secret) return false;
  try {
    const expected = signWebhookPayload(payload, secret);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
