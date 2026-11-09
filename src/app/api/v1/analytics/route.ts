import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-gateway";
import { prisma, ensureDatabaseSeeded } from "@/lib/db";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();

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
      if (tx.status === "Paid") {
        totalRevenue += tx.amount;
        paidCount++;
      } else if (tx.status === "Pending") {
        pendingCount++;
      } else if (tx.status === "Failed") {
        failedCount++;
      }
    }

    return NextResponse.json({
      data: {
        totalRevenue,
        totalOrders,
        paidCount,
        pendingCount,
        failedCount,
        averageOrderValue: totalOrders > 0 ? totalRevenue / (paidCount || 1) : 0,
      },
      meta: {
        queriedBy: auth.apiKey?.name,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("GET /api/v1/analytics error:", err);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
