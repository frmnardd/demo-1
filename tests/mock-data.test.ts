import { describe, it, expect } from "vitest";
import { filterTransactions, sortTransactions, Transaction } from "../src/lib/mock-data";

const sampleData: Transaction[] = [
  { id: "ORD-001", customer: { name: "Alice Smith", email: "alice@example.com", avatar: "" }, amount: 250, status: "paid", date: "2026-11-01", itemsCount: 2, method: "Credit Card" },
  { id: "ORD-002", customer: { name: "Bob Jones", email: "bob@example.com", avatar: "" }, amount: 120, status: "pending", date: "2026-11-03", itemsCount: 1, method: "PayPal" },
  { id: "ORD-003", customer: { name: "Charlie Brown", email: "charlie@example.com", avatar: "" }, amount: 480, status: "refunded", date: "2026-11-02", itemsCount: 4, method: "Bank Transfer" },
];

describe("Mock Data Helpers", () => {
  it("filters transactions by search query (case-insensitive)", () => {
    const result = filterTransactions(sampleData, "alice", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("ORD-001");
  });

  it("filters transactions by status", () => {
    const result = filterTransactions(sampleData, "", "pending");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("ORD-002");
  });

  it("returns empty array when search query matches nothing (Review Focus #1)", () => {
    const result = filterTransactions(sampleData, "nonexistent person", "all");
    expect(result).toEqual([]);
  });

  it("sorts transactions by amount ascending and descending", () => {
    const asc = sortTransactions(sampleData, "amount", "asc");
    expect(asc[0].amount).toBe(120);
    const desc = sortTransactions(sampleData, "amount", "desc");
    expect(desc[0].amount).toBe(480);
  });

  it("sorts transactions by customer name correctly", () => {
    const asc = sortTransactions(sampleData, "customer", "asc");
    expect(asc[0].customer.name).toBe("Alice Smith");
    expect(asc[2].customer.name).toBe("Charlie Brown");

    const desc = sortTransactions(sampleData, "customer", "desc");
    expect(desc[0].customer.name).toBe("Charlie Brown");
    expect(desc[2].customer.name).toBe("Alice Smith");
  });
});
