import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const source = request.nextUrl.searchParams.get("source");
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const limit = request.nextUrl.searchParams.get("limit");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (source) where.source = source;
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: limit ? parseInt(limit) : undefined,
  });
  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const transaction = await prisma.transaction.create({
    data: {
      type: body.type,
      amount: parseFloat(body.amount),
      currency: body.currency || "USD",
      category: body.category || null,
      description: body.description,
      date: new Date(body.date),
      source: body.source || "manual",
      externalId: body.externalId || null,
    },
  });
  return NextResponse.json(transaction, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const transaction = await prisma.transaction.update({
    where: { id: body.id },
    data: {
      type: body.type,
      amount: parseFloat(body.amount),
      currency: body.currency,
      category: body.category || null,
      description: body.description,
      date: new Date(body.date),
    },
  });
  return NextResponse.json(transaction);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
