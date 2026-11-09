import { describe, it, expect } from "vitest";
import { validateOrderInput } from "../src/components/dashboard/create-order-dialog";

describe("validateOrderInput", () => {
  it("rejects empty customer name and invalid amount", () => {
    const result = validateOrderInput({
      customer: { name: "", email: "test@example.com", avatar: "" },
      amount: 0,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.amount).toBeDefined();
  });

  it("accepts valid order input with positive amount", () => {
    const result = validateOrderInput({
      customer: { name: "John Doe", email: "john@example.com", avatar: "" },
      amount: 150,
    });
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });
});
