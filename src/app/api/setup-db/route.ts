import { createClient } from "@libsql/client";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return NextResponse.json(
      { error: "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required" },
      { status: 500 }
    );
  }

  const client = createClient({ url, authToken });

  try {
    await client.executeMultiple(`
      CREATE TABLE IF NOT EXISTS "Client" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "company" TEXT,
        "phone" TEXT,
        "notes" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "Payment" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "clientId" TEXT NOT NULL,
        "amount" REAL NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'USD',
        "status" TEXT NOT NULL DEFAULT 'pendiente',
        "paidAt" DATETIME,
        "dueDate" DATETIME NOT NULL,
        "description" TEXT,
        "stripeId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "type" TEXT NOT NULL,
        "amount" REAL NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'USD',
        "category" TEXT,
        "description" TEXT NOT NULL,
        "date" DATETIME NOT NULL,
        "source" TEXT NOT NULL DEFAULT 'manual',
        "externalId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "PersonalExpense" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "type" TEXT NOT NULL,
        "amount" REAL NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'USD',
        "category" TEXT,
        "description" TEXT NOT NULL,
        "date" DATETIME NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "IntegrationConfig" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "provider" TEXT NOT NULL UNIQUE,
        "apiKey" TEXT NOT NULL,
        "apiSecret" TEXT,
        "enabled" BOOLEAN NOT NULL DEFAULT 0,
        "metadata" TEXT
      );
    `);

    const tables = await client.execute(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream_%'`
    );

    return NextResponse.json({
      success: true,
      tables: tables.rows.map((r) => r.name),
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
