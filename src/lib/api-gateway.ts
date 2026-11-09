import { hashApiKey } from "./crypto";
import { prisma } from "./db";

export type ApiScope = "read:orders" | "write:orders" | "read:analytics";

export interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string | null;
  active: boolean;
}

/**
 * Extracts a Bearer token from the HTTP Authorization header.
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Verifies whether an API key possesses a required permission scope and is active.
 */
export function verifyApiKeyScope(key: ApiKeyRecord, requiredScope: string): boolean {
  if (!key.active) return false;
  return key.permissions.includes(requiredScope);
}

/**
 * Validates incoming Bearer token against database-backed API keys and enforces scoping.
 */
export async function authenticateApiKey(
  authHeader: string | null,
  requiredScope: string
): Promise<{ valid: boolean; apiKey?: ApiKeyRecord; error?: string; status: number }> {
  const token = extractBearerToken(authHeader);

  if (!token) {
    return {
      valid: false,
      error: "Unauthorized: Missing or malformed Authorization header. Use 'Bearer fix_live_...'",
      status: 401,
    };
  }

  if (!token.startsWith("fix_live_")) {
    return {
      valid: false,
      error: "Unauthorized: Invalid API key format. Production keys must begin with 'fix_live_'",
      status: 401,
    };
  }

  const tokenHash = hashApiKey(token);

  try {
    const dbKey = await prisma.apiKey.findUnique({
      where: { keyHash: tokenHash },
    });

    if (!dbKey) {
      return {
        valid: false,
        error: "Unauthorized: API key not recognized.",
        status: 401,
      };
    }

    if (!dbKey.active) {
      return {
        valid: false,
        error: "Unauthorized: API key has been revoked or deactivated.",
        status: 401,
      };
    }

    let permissions: string[] = [];
    try {
      permissions = JSON.parse(dbKey.permissions);
    } catch {
      permissions = [];
    }

    const record: ApiKeyRecord = {
      id: dbKey.id,
      name: dbKey.name,
      keyPrefix: dbKey.keyPrefix,
      keyHash: dbKey.keyHash,
      permissions,
      createdAt: dbKey.createdAt.toISOString(),
      lastUsed: dbKey.lastUsed ? dbKey.lastUsed.toISOString() : null,
      active: dbKey.active,
    };

    if (!verifyApiKeyScope(record, requiredScope)) {
      return {
        valid: false,
        error: `Forbidden: API key lacks required '${requiredScope}' permission.`,
        status: 403,
      };
    }

    // Asynchronously update lastUsed timestamp
    prisma.apiKey
      .update({
        where: { id: dbKey.id },
        data: { lastUsed: new Date() },
      })
      .catch((err) => console.error("Failed to update apiKey lastUsed", err));

    return {
      valid: true,
      apiKey: record,
      status: 200,
    };
  } catch (err) {
    console.error("API key lookup error:", err);
    return {
      valid: false,
      error: "Internal server error during authentication.",
      status: 500,
    };
  }
}
