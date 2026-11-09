import { describe, it, expect } from "vitest";
import { accumulateRevenue } from "../src/lib/mock-data";

describe("Review Fixes: Cumulative Revenue KPI", () => {
  it("accumulates revenue across multiple consecutive orders without resetting", () => {
    const initialKpi = "$45,231.89";
    const afterFirstOrder = accumulateRevenue(initialKpi, 100);
    expect(afterFirstOrder).toBe("$45,331.89");

    const afterSecondOrder = accumulateRevenue(afterFirstOrder, 50.5);
    expect(afterSecondOrder).toBe("$45,382.39");
  });
});
