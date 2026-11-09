import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { InvoiceContent } from "../src/components/dashboard/invoice-modal";
import { Transaction } from "../src/lib/mock-data";

const sampleTx: Transaction = {
  id: "tx-9999",
  customer: {
    name: "Acme Industrial Corp",
    email: "billing@acmeindustrial.com",
    avatar: "/avatars/01.png",
  },
  amount: 222.0,
  status: "paid",
  date: "2026-11-10",
  itemsCount: 2,
  method: "Corporate Card",
  note: "Cloud annual plan",
};

describe("Commercial Invoice Generator", () => {
  it("renders invoice with tax and company details", () => {
    const html = renderToString(<InvoiceContent transaction={sampleTx} />);

    expect(html).toContain("COMMERCIAL INVOICE");
    expect(html).toContain("Fixentra Enterprise");
    expect(html).toContain("Acme Industrial Corp");
    expect(html).toContain("222.00");
    expect(html).toContain("Value-Added Tax (VAT 11%)");
  });
});
