import { describe, it, expect } from "vitest";
import { createAuditEntry } from "../src/lib/audit-log";
import { formatDataAsJSON } from "../src/lib/export-utils";

describe("Audit Log & JSON Export", () => {
  it("creates formatted audit log entry (Review Focus #5)", () => {
    const entry = createAuditEntry("ORDER_CREATED", "Order ORD-999 created", "ardfrmn");
    expect(entry.type).toBe("ORDER_CREATED");
    expect(entry.actor).toBe("ardfrmn");
    expect(entry.timestamp).toBeDefined();
  });

  it("formats dataset into valid JSON string", () => {
    const json = formatDataAsJSON({ test: true });
    expect(JSON.parse(json)).toEqual({ test: true });
  });
});
