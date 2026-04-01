import { prisma } from "@/lib/prisma";
import { getMercuryClient } from "@/lib/mercury";
import { NextResponse } from "next/server";

export async function GET() {
  const config = await prisma.integrationConfig.findUnique({
    where: { provider: "mercury" },
  });

  if (!config || !config.enabled) {
    return NextResponse.json({ error: "Mercury no está configurado" }, { status: 400 });
  }

  try {
    const client = await getMercuryClient(config.apiKey);
    const accounts = await client.getAccounts();

    let synced = 0;
    for (const account of accounts) {
      const transactions = await client.getTransactions(account.id, { limit: 50 });

      for (const tx of transactions) {
        const existing = await prisma.transaction.findFirst({
          where: { externalId: tx.id },
        });

        if (!existing) {
          await prisma.transaction.create({
            data: {
              type: tx.amount > 0 ? "ingreso" : "egreso",
              amount: Math.abs(tx.amount),
              currency: "USD",
              category: tx.details?.category || null,
              description: tx.details?.description || tx.bankDescription || "Mercury transaction",
              date: new Date(tx.postedDate || tx.createdAt),
              source: "mercury",
              externalId: tx.id,
            },
          });
          synced++;
        }
      }
    }

    return NextResponse.json({ success: true, synced, accounts: accounts.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
