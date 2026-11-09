import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt with salt rounds = 10.
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

/**
 * Securely verifies a plaintext password against a bcrypt hash.
 */
export function verifyPassword(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

/**
 * Generates an enterprise API key with fix_live_ prefix and SHA-256 hash.
 */
export function generateApiKeySecret(): { secretKey: string; keyPrefix: string; keyHash: string } {
  const randomHex = crypto.randomBytes(16).toString("hex");
  const secretKey = `fix_live_${randomHex}`;
  const keyPrefix = `${secretKey.slice(0, 13)}...${secretKey.slice(-4)}`;
  const keyHash = crypto.createHash("sha256").update(secretKey).digest("hex");
  return { secretKey, keyPrefix, keyHash };
}

/**
 * Hashes an incoming API key secret with SHA-256 to compare with stored hash.
 */
export function hashApiKey(secretKey: string): string {
  return crypto.createHash("sha256").update(secretKey).digest("hex");
}
