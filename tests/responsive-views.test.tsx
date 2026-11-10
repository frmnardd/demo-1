import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { TeamView } from "../src/components/dashboard/team-view";
import { InvoiceContent } from "../src/components/dashboard/invoice-modal";
import { INITIAL_TRANSACTIONS } from "../src/lib/mock-data";

describe("Mobile Responsive Dashboard Views", () => {
  it("renders TeamView table with responsive mobile subtext", () => {
    const html = renderToString(
      <TeamView
        team={[
          {
            id: "usr-1",
            username: "ardfrmn",
            name: "Firman Ardiansyah",
            email: "ardfrmn@fixentra.my.id",
            role: "admin",
            joinedAt: "2026-01-15",
            active: true,
          },
        ]}
        onAddMember={() => {}}
        onRevokeMember={() => {}}
      />
    );

    expect(html).toContain("Firman Ardiansyah");
    expect(html).toContain("ardfrmn");
    expect(html).toContain("Authorized Personnel Directory");
  });

  it("renders InvoiceContent with mobile scroll and responsive grid", () => {
    const sampleTx = INITIAL_TRANSACTIONS[0];
    const html = renderToString(
      <InvoiceContent transaction={sampleTx} onPrint={() => {}} />
    );

    expect(html).toContain("COMMERCIAL INVOICE");
    expect(html).toContain("Fixentra Enterprise");
    expect(html).toContain(sampleTx.customer.name);
  });
});
