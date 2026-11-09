import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { OrdersTable } from "../src/components/dashboard/orders-table";
import { INITIAL_TRANSACTIONS } from "../src/lib/mock-data";

describe("OrdersTable Component", () => {
  it("renders transaction rows and headers", () => {
    const html = renderToString(
      <OrdersTable
        transactions={INITIAL_TRANSACTIONS}
        onSelectTransaction={() => {}}
        onStatusChange={() => {}}
      />
    );
    expect(html).toContain("Customer");
    expect(html).toContain("Amount");
    expect(html).toContain("Status");
    expect(html).toContain(INITIAL_TRANSACTIONS[0].customer.name);
  });

  it("renders empty state message when transaction list is empty (Review Focus #1)", () => {
    const html = renderToString(
      <OrdersTable
        transactions={[]}
        onSelectTransaction={() => {}}
        onStatusChange={() => {}}
      />
    );
    expect(html).toContain("No orders found");
  });
});
