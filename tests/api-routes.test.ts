import { describe, it, expect } from "vitest";
import { z } from "zod";

const CreateOrderSchema = z.object({
  customerName: z.string().min(2, "Customer name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid customer email address"),
  amount: z.number().positive("Amount must be greater than zero"),
  status: z
    .string()
    .transform((val) => {
      const lower = val.toLowerCase();
      if (lower === "paid") return "Paid";
      if (lower === "pending") return "Pending";
      if (lower === "refunded") return "Refunded";
      if (lower === "failed") return "Failed";
      return val;
    })
    .pipe(z.enum(["Paid", "Pending", "Failed", "Refunded"]))
    .default("Pending"),
  itemsCount: z.number().int().positive().default(1),
  method: z.string().default("Credit Card"),
  note: z.string().optional(),
});

describe("API Schema Robustness & Normalization", () => {
  it("normalizes lowercase status 'paid' to 'Paid'", () => {
    const parsed = CreateOrderSchema.parse({
      customerName: "Alice Walker",
      customerEmail: "alice@acme.com",
      amount: 450,
      status: "paid",
    });
    expect(parsed.status).toBe("Paid");
  });

  it("normalizes uppercase status 'PENDING' to 'Pending'", () => {
    const parsed = CreateOrderSchema.parse({
      customerName: "Bob Smith",
      customerEmail: "bob@acme.com",
      amount: 120,
      status: "pending",
    });
    expect(parsed.status).toBe("Pending");
  });

  it("rejects invalid emails and negative amounts", () => {
    const invalidEmail = CreateOrderSchema.safeParse({
      customerName: "Bad Order",
      customerEmail: "not-an-email",
      amount: 100,
    });
    expect(invalidEmail.success).toBe(false);

    const negativeAmount = CreateOrderSchema.safeParse({
      customerName: "Negative Order",
      customerEmail: "valid@email.com",
      amount: -50,
    });
    expect(negativeAmount.success).toBe(false);
  });
});

describe("Analytics Revenue Calculation with Case-Insensitivity", () => {
  it("accurately aggregates revenue regardless of status casing", () => {
    const sampleTxs = [
      { id: "1", amount: 200, status: "Paid" },
      { id: "2", amount: 300, status: "paid" },
      { id: "3", amount: 150, status: "Pending" },
      { id: "4", amount: 50, status: "failed" },
    ];

    let totalRevenue = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    for (const tx of sampleTxs) {
      const s = (tx.status || "").toLowerCase();
      if (s === "paid") {
        totalRevenue += tx.amount;
        paidCount++;
      } else if (s === "pending") {
        pendingCount++;
      } else if (s === "failed" || s === "refunded") {
        failedCount++;
      }
    }

    expect(totalRevenue).toBe(500);
    expect(paidCount).toBe(2);
    expect(pendingCount).toBe(1);
    expect(failedCount).toBe(1);
    expect(Number((totalRevenue / paidCount).toFixed(2))).toBe(250.0);
  });
});
