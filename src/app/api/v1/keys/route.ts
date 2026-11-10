import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, ensureDatabaseSeeded } from "@/lib/db";
import { generateApiKeySecret } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limiter";
import { sanitizeObject } from "@/lib/sanitize";

const CreateKeySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  permissions: z.array(z.string()).min(1, "Select at least one permission scope"),
});

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();

  const clientIp = req.headers.get("x-forwarded-for") || "client-local";
  const rateLimit = checkRateLimit(`keys-get-${clientIp}`, 60, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too Many Requests", retryAfter: rateLimit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  try {
    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
    });

    const sanitized = keys.map((k) => {
      let perms: string[] = [];
      try {
        perms = JSON.parse(k.permissions || "[]");
      } catch {
        perms = [];
      }
      return {
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        permissions: perms,
        createdAt: k.createdAt.toISOString().split("T")[0],
        lastUsed: k.lastUsed ? k.lastUsed.toISOString() : null,
        active: k.active,
      };
    });

    return NextResponse.json({ data: sanitized });
  } catch (err) {
    console.error("GET /api/v1/keys error:", err);
    return NextResponse.json({ error: "Failed to list API keys" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();

  try {
    const body = await req.json();
    const parsed = CreateKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, permissions } = sanitizeObject(parsed.data);
    const { secretKey, keyPrefix, keyHash } = generateApiKeySecret();

    const created = await prisma.apiKey.create({
      data: {
        name,
        keyPrefix,
        keyHash,
        permissions: JSON.stringify(permissions),
        active: true,
      },
    });

    return NextResponse.json(
      {
        secretKey,
        keyRecord: {
          id: created.id,
          name: created.name,
          keyPrefix: created.keyPrefix,
          keyHash: created.keyHash,
          permissions,
          createdAt: created.createdAt.toISOString().split("T")[0],
          lastUsed: null,
          active: true,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/v1/keys error:", err);
    return NextResponse.json({ error: "Failed to generate key" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  await ensureDatabaseSeeded();

  try {
    const body = await req.json();
    const { id, active } = body;
    if (!id || typeof active !== "boolean") {
      return NextResponse.json({ error: "id and boolean active required" }, { status: 400 });
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        active: updated.active,
      },
    });
  } catch (err) {
    console.error("PATCH /api/v1/keys error:", err);
    return NextResponse.json({ error: "Failed to update key status" }, { status: 500 });
  }
}
