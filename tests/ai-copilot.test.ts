import { describe, it, expect } from "vitest";
import { processCopilotQuery } from "../src/components/dashboard/ai-copilot";
import { INITIAL_KPIS, INITIAL_TRANSACTIONS } from "../src/lib/mock-data";

describe("Fixentra AI Copilot Engine", () => {
  it("answers revenue questions using live KPI context", () => {
    const answer = processCopilotQuery("berapa revenue saat ini?", {
      kpis: INITIAL_KPIS,
      transactions: INITIAL_TRANSACTIONS,
    });
    expect(answer).toContain(INITIAL_KPIS[0].value);
  });

  it("summarizes pending orders", () => {
    const answer = processCopilotQuery("pesanan pending", {
      kpis: INITIAL_KPIS,
      transactions: INITIAL_TRANSACTIONS,
    });
    expect(answer.toLowerCase()).toContain("pending");
  });
});
