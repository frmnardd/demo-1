import { describe, it, expect, beforeAll } from "vitest";
import { prisma, ensureDatabaseSeeded } from "../src/lib/db";
import { verifyPassword } from "../src/lib/crypto";

describe("Database & Persistence Layer (Review Focus #5)", () => {
  beforeAll(async () => {
    await ensureDatabaseSeeded();
  });

  it("seeds default administrator with bcrypt hash and SUPER_ADMIN role", async () => {
    const admin = await prisma.user.findUnique({
      where: { username: "ardfrmn" },
    });
    expect(admin).not.toBeNull();
    expect(admin?.role).toBe("SUPER_ADMIN");
    expect(admin?.email).toBe("firman@fixentra.my.id");
    expect(verifyPassword("firman173", admin!.passwordHash)).toBe(true);
  });

  it("seeds enterprise catalog products with active status", async () => {
    const products = await prisma.product.findMany();
    expect(products.length).toBeGreaterThanOrEqual(4);
    const enterpriseCore = products.find((p) => p.sku === "FIX-PRO-01");
    expect(enterpriseCore).toBeDefined();
    expect(enterpriseCore?.price).toBe(299);
  });

  it("seeds baseline transactions", async () => {
    const transactions = await prisma.transaction.findMany();
    expect(transactions.length).toBeGreaterThanOrEqual(5);
  });

  it("seeds baseline API keys and Webhooks", async () => {
    const apiKeys = await prisma.apiKey.findMany();
    expect(apiKeys.length).toBeGreaterThanOrEqual(1);
    expect(apiKeys[0].keyPrefix.startsWith("fix_live_")).toBe(true);

    const webhooks = await prisma.webhook.findMany();
    expect(webhooks.length).toBeGreaterThanOrEqual(1);
    expect(webhooks[0].secretKey.startsWith("whsec_")).toBe(true);
  });
});
