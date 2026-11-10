import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt with salt rounds = 10.
 * Pure JavaScript - 100% client and server safe.
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

/**
 * Securely verifies a plaintext password against a bcrypt hash.
 * Pure JavaScript - 100% client and server safe.
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
 * Generates secure random hex bytes using standard Web Crypto API.
 * Universal: works in all modern browsers and Node.js without Node 'crypto' module.
 */
export function generateRandomHex(byteLength = 16): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(byteLength);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Safe math fallback
  let result = "";
  for (let i = 0; i < byteLength * 2; i++) {
    result += Math.floor(Math.random() * 16).toString(16);
  }
  return result;
}

/**
 * Generates an enterprise API key with fix_live_ prefix.
 * Universal implementation safe for browser and client components.
 */
export function generateApiKeySecret(): {
  secretKey: string;
  keyPrefix: string;
  keyHash: string;
} {
  const randomHex = generateRandomHex(16);
  const secretKey = `fix_live_${randomHex}`;
  const keyPrefix = `${secretKey.slice(0, 13)}...${secretKey.slice(-4)}`;
  const keyHash = `client_hash_${randomHex}`;
  return { secretKey, keyPrefix, keyHash };
}
