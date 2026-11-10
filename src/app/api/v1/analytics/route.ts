import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-gateway";
import { prisma, ensureDatabaseSeeded } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();

  // Rate Limiting
  const clientIp = req.headers.get("x-forwarded-for") || "client-local";
  const rateLimit = checkRateLimit(`analytics-get-${clientIp}`, 60, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too Many Requests. Rate limit exceeded.", retryAfter: rateLimit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const auth = await authenticateApiKey(req.headers.get("authorization"), "read:analytics");
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const transactions = await prisma.transaction.findMany();

    const totalOrders = transactions.length;
    let totalRevenue = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    for (const tx of transactions) {
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

    return NextResponse.json(
      {
        data: {
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalOrders,
          paidCount,
          pendingCount,
          failedCount,
          averageOrderValue: paidCount > 0 ? Number((totalRevenue / paidCount).toFixed(2)) : 0,
        },
        meta: {
          queriedBy: auth.apiKey?.name,
          timestamp: new Date().toISOString(),
          rateLimitRemaining: rateLimit.remaining,
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (err) {
    console.error("GET /api/v1/analytics error:", err);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
