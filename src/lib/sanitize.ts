/**
 * Enterprise input sanitizer to protect against XSS and injection attacks.
 */
export function sanitizeText(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  return raw
    // Strip dangerous tags completely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Strip any remaining html tags while preserving inner text
    .replace(/<[^>]+>/g, "")
    // Strip javascript: pseudo-protocol
    .replace(/javascript:[^"'\s]*/gi, "")
    // Strip onerror, onclick, etc. patterns
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .trim();
}

/**
 * Deeply sanitizes all string properties in a payload object.
 */
export function sanitizeObject<T>(input: T): T {
  if (input === null || input === undefined) return input;

  if (typeof input === "string") {
    return sanitizeText(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof input === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      output[key] = sanitizeObject(value);
    }
    return output as T;
  }

  return input;
}
