import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiKey } from "@/lib/api-gateway";
import { prisma, ensureDatabaseSeeded } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limiter";
import { sanitizeObject } from "@/lib/sanitize";

const CreateOrderSchema = z.object({
  customerName: z.string().min(2, "Customer name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid customer email address"),
  amount: z.number().positive("Amount must be greater than zero"),
  status: z.enum(["Paid", "Pending", "Failed"]).default("Pending"),
  itemsCount: z.number().int().positive().default(1),
  method: z.string().default("Credit Card"),
  note: z.string().optional(),
});

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();

  // Rate Limiting
  const clientIp = req.headers.get("x-forwarded-for") || "client-local";
  const rateLimit = checkRateLimit(`orders-get-${clientIp}`, 100, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too Many Requests. Rate limit exceeded.", retryAfter: rateLimit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const auth = await authenticateApiKey(req.headers.get("authorization"), "read:orders");
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const orders = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        data: orders,
        meta: {
          total: orders.length,
          retrievedAt: new Date().toISOString(),
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
    console.error("GET /api/v1/orders error:", err);
    return NextResponse.json({ error: "Failed to query orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();

  // Rate Limiting
  const clientIp = req.headers.get("x-forwarded-for") || "client-local";
  const rateLimit = checkRateLimit(`orders-post-${clientIp}`, 30, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too Many Requests. Rate limit exceeded.", retryAfter: rateLimit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const auth = await authenticateApiKey(req.headers.get("authorization"), "write:orders");
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Sanitize input to eliminate XSS injections
    const sanitized = sanitizeObject(parsed.data);
    const { customerName, customerEmail, amount, status, itemsCount, method, note } = sanitized;
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];

    const order = await prisma.transaction.create({
      data: {
        customerName,
        customerEmail,
        amount,
        status,
        date: dateStr,
        itemsCount,
        method,
        note,
      },
    });

    // Record immutable audit trail
    await prisma.auditLog.create({
      data: {
        type: "order_create",
        description: `API Order created for ${customerName} ($${amount}) via ${auth.apiKey?.name || "API Key"}`,
        actor: auth.apiKey?.name || "API_CLIENT",
        timestamp: "Just now",
      },
    });

    return NextResponse.json(
      { success: true, data: order },
      {
        status: 201,
        headers: { "X-RateLimit-Remaining": String(rateLimit.remaining) },
      }
    );
  } catch (err) {
    console.error("POST /api/v1/orders error:", err);
    return NextResponse.json({ error: "Invalid JSON body or internal error" }, { status: 400 });
  }
}
