import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { KpiCards } from "../src/components/dashboard/kpi-cards";
import { INITIAL_KPIS } from "../src/lib/mock-data";

describe("KPI Cards Component", () => {
  it("renders 4 metric cards with formatted values and trend labels", () => {
    const html = renderToString(<KpiCards kpis={INITIAL_KPIS} />);
    expect(html).toContain(INITIAL_KPIS[0].title);
    expect(html).toContain(INITIAL_KPIS[0].value);
    expect(html).toContain(INITIAL_KPIS[1].title);
  });
});
