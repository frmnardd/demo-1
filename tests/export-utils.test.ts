import { describe, it, expect } from "vitest";
import { formatTransactionsAsCSV, deriveCustomerDirectory } from "../src/lib/export-utils";
import { Transaction } from "../src/lib/mock-data";

const sampleTransactions: Transaction[] = [
  {
    id: "ORD-001",
    customer: { name: "Alice Smith", email: "alice@example.com", avatar: "AS" },
    amount: 250.5,
    status: "paid",
    date: "2026-11-01",
    itemsCount: 2,
    method: "Credit Card",
    note: "First order",
  },
  {
    id: "ORD-002",
    customer: { name: "Alice Smith", email: "alice@example.com", avatar: "AS" },
    amount: 150.0,
    status: "paid",
    date: "2026-11-05",
    itemsCount: 1,
    method: "PayPal",
    note: "Second order",
  },
];

describe("Export and Data Processing Utilities", () => {
  it("formats transactions into a valid CSV string with headers", () => {
    const csv = formatTransactionsAsCSV(sampleTransactions);
    expect(csv).toContain("Order ID,Customer Name,Customer Email,Amount,Status,Date,Payment Method");
    expect(csv).toContain('"ORD-001","Alice Smith","alice@example.com",250.50,"paid","2026-11-01","Credit Card"');
  });

  it("aggregates customer directory and calculates lifetime spend", () => {
    const customers = deriveCustomerDirectory(sampleTransactions);
    expect(customers).toHaveLength(1);
    expect(customers[0].name).toBe("Alice Smith");
    expect(customers[0].totalOrders).toBe(2);
    expect(customers[0].totalSpent).toBe(400.5);
  });
});
