import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const configs = await prisma.integrationConfig.findMany();
  // Mask API keys for security
  const masked = configs.map((c) => ({
    ...c,
    apiKey: c.apiKey ? `${c.apiKey.slice(0, 6)}...${c.apiKey.slice(-4)}` : "",
    apiSecret: c.apiSecret ? "••••••••" : null,
  }));
  return NextResponse.json(masked);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const config = await prisma.integrationConfig.upsert({
    where: { provider: body.provider },
    update: {
      apiKey: body.apiKey,
      apiSecret: body.apiSecret || null,
      enabled: body.enabled ?? true,
      metadata: body.metadata || null,
    },
    create: {
      provider: body.provider,
      apiKey: body.apiKey,
      apiSecret: body.apiSecret || null,
      enabled: body.enabled ?? true,
      metadata: body.metadata || null,
    },
  });
  return NextResponse.json(config);
}

export async function DELETE(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  if (!provider) return NextResponse.json({ error: "Provider requerido" }, { status: 400 });
  await prisma.integrationConfig.delete({ where: { provider } });
  return NextResponse.json({ success: true });
}
