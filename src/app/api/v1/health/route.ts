import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    gateway: "Fixentra Enterprise REST Gateway",
    version: "3.0.0",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
}
