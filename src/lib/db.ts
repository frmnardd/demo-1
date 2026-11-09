import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./crypto";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Self-healing seeder: ensures default admin user, baseline enterprise products,
 * and transactions are populated upon initial startup.
 */
export async function ensureDatabaseSeeded(): Promise<void> {
  try {
    // Check if default admin exists
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      await prisma.user.create({
        data: {
          username: "ardfrmn",
          passwordHash: hashPassword("firman173"),
          name: "Firman Ardiansyah",
          email: "firman@fixentra.my.id",
          role: "SUPER_ADMIN",
        },
      });
    }

    // Check if baseline products exist
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      await prisma.product.createMany({
        data: [
          {
            sku: "FIX-PRO-01",
            title: "Enterprise Core Platform",
            description: "Full-suite financial operations, live audit logs, and priority multi-region compute.",
            price: 299,
            interval: "month",
            tierBadge: "Popular",
            features: JSON.stringify(["Unlimited Orders", "Sub-second Audit Log", "Multi-region Failover", "24/7 SLA Support"]),
            active: true,
          },
          {
            sku: "FIX-API-02",
            title: "Developer API Gateway",
            description: "High-throughput Bearer token gateway with fine-grained RBAC and automated rate limits.",
            price: 99,
            interval: "month",
            tierBadge: "Developer",
            features: JSON.stringify(["1,000,000 API Requests/mo", "Live Webhook Delivery", "Custom Token Scoping", "Realtime Metrics"]),
            active: true,
          },
          {
            sku: "FIX-SEC-03",
            title: "Zero-Trust Security Shield",
            description: "Enterprise bcrypt encryption, session revocation, and immutable compliance trail.",
            price: 149,
            interval: "month",
            tierBadge: "Enterprise",
            features: JSON.stringify(["SOC-2 Ready Audit Trail", "Bcrypt Key Hardening", "IP Whitelisting", "Automated Pen-testing"]),
            active: true,
          },
          {
            sku: "FIX-ST-04",
            title: "Starter Developer Pass",
            description: "Essential dashboard analytics and single-tenant SQLite durability for emerging teams.",
            price: 49,
            interval: "month",
            tierBadge: null,
            features: JSON.stringify(["Up to 50,000 Orders", "CSV/JSON Streaming Export", "Single API Key", "Standard Support"]),
            active: true,
          },
        ],
      });
    }

    // Check if transactions exist
    const txCount = await prisma.transaction.count();
    if (txCount === 0) {
      await prisma.transaction.createMany({
        data: [
          {
            customerName: "Liam Johnson",
            customerEmail: "liam@acmecorp.com",
            amount: 250.0,
            status: "Paid",
            date: "2026-11-09",
            itemsCount: 2,
            method: "Credit Card",
            note: "Enterprise quarterly renewal",
          },
          {
            customerName: "Olivia Smith",
            customerEmail: "olivia@linearscale.io",
            amount: 150.0,
            status: "Paid",
            date: "2026-11-08",
            itemsCount: 1,
            method: "Credit Card",
            note: "Annual subscription tier",
          },
          {
            customerName: "Noah Williams",
            customerEmail: "noah@fintechpulse.net",
            amount: 350.0,
            status: "Pending",
            date: "2026-11-07",
            itemsCount: 3,
            method: "Bank Transfer",
            note: "Awaiting bank settlement",
          },
          {
            customerName: "Emma Brown",
            customerEmail: "emma@apexcloud.co",
            amount: 450.0,
            status: "Paid",
            date: "2026-11-06",
            itemsCount: 4,
            method: "Credit Card",
            note: "Multi-seat platform license",
          },
          {
            customerName: "James Jones",
            customerEmail: "james@sentinelcore.org",
            amount: 550.0,
            status: "Failed",
            date: "2026-11-05",
            itemsCount: 5,
            method: "Credit Card",
            note: "Payment processor timeout",
          },
        ],
      });
    }
  } catch (err) {
    console.error("Database seeding check failed:", err);
  }
}
