import { prisma } from "@/lib/prisma";
import { getBinanceClient } from "@/lib/binance";
import { NextResponse } from "next/server";

export async function GET() {
  const config = await prisma.integrationConfig.findUnique({
    where: { provider: "binance" },
  });

  if (!config || !config.enabled || !config.apiSecret) {
    return NextResponse.json({ error: "Binance no está configurado" }, { status: 400 });
  }

  try {
    const client = await getBinanceClient(config.apiKey, config.apiSecret);
    const account = await client.getAccountInfo();

    const balances = account.balances
      .filter((b: { free: string; locked: string }) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map((b: { asset: string; free: string; locked: string }) => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
        total: parseFloat(b.free) + parseFloat(b.locked),
      }));

    return NextResponse.json({ balances });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
