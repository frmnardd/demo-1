import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  let dbStatus = "healthy";
  let latencyMs = 0;
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    latencyMs = Date.now() - start;
  } catch {
    dbStatus = "unavailable";
  }

  return NextResponse.json({
    status: dbStatus === "healthy" ? "healthy" : "degraded",
    gateway: "Fixentra Enterprise REST Gateway",
    version: "3.5.0",
    environment: process.env.NODE_ENV || "production",
    database: {
      status: dbStatus,
      engine: "SQLite (Prisma ORM)",
      latencyMs,
    },
    timestamp: new Date().toISOString(),
  });
}
