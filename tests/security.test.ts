import { describe, it, expect } from "vitest";
import { checkRateLimit, resetRateLimits } from "../src/lib/rate-limiter";
import { sanitizeText, sanitizeObject } from "../src/lib/sanitize";

describe("Enterprise Rate Limiter", () => {
  it("allows requests within window threshold", () => {
    resetRateLimits();
    const id = "ip-127-0-0-1";
    // Limit is 5 for this test bucket
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(id, 5, 60000);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(5 - (i + 1));
    }
  });

  it("blocks requests exceeding window threshold and provides retry-after", () => {
    resetRateLimits();
    const id = "ip-abuser";
    for (let i = 0; i < 3; i++) {
      checkRateLimit(id, 3, 60000);
    }
    const blocked = checkRateLimit(id, 3, 60000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe("Enterprise Input Sanitizer", () => {
  it("strips malicious script tags and HTML injection", () => {
    const malicious = "<script>alert('xss')</script>Hello <b>World</b>";
    const cleaned = sanitizeText(malicious);
    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("</script>");
    expect(cleaned).toContain("Hello World");
  });

  it("sanitizes nested object strings safely", () => {
    const input = {
      note: "<img src=x onerror=alert(1)>Payment for servers",
      amount: 150,
      customer: {
        name: "<a href='javascript:steal()'>John Doe</a>",
      },
    };
    const cleaned = sanitizeObject(input);
    expect(cleaned.note).not.toContain("onerror");
    expect(cleaned.customer.name).not.toContain("javascript:");
    expect(cleaned.amount).toBe(150);
  });
});
