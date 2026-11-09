import { describe, it, expect } from "vitest";
import { validateProductInput } from "../src/components/dashboard/products-view";

describe("Product Catalog Validation", () => {
  it("rejects product with empty title or negative price (Review Focus #4)", () => {
    expect(validateProductInput({ title: "", price: 99, sku: "SKU-01" }).valid).toBe(false);
    expect(validateProductInput({ title: "Enterprise", price: -10, sku: "SKU-01" }).valid).toBe(false);
  });

  it("accepts valid product tier", () => {
    expect(validateProductInput({ title: "Enterprise Pro", price: 499, sku: "FIX-ENT" }).valid).toBe(true);
  });
});
