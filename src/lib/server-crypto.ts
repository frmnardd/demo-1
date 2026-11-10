import crypto from "crypto";

/**
 * Server-only SHA-256 hashing for API keys and tokens.
 */
export function hashApiKey(secretKey: string): string {
  return crypto.createHash("sha256").update(secretKey).digest("hex");
}

/**
 * Server-only key generator for database persistence.
 */
export function generateServerApiKeySecret(): {
  secretKey: string;
  keyPrefix: string;
  keyHash: string;
} {
  const randomHex = crypto.randomBytes(16).toString("hex");
  const secretKey = `fix_live_${randomHex}`;
  const keyPrefix = `${secretKey.slice(0, 13)}...${secretKey.slice(-4)}`;
  const keyHash = crypto.createHash("sha256").update(secretKey).digest("hex");
  return { secretKey, keyPrefix, keyHash };
}
