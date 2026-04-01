import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const category = request.nextUrl.searchParams.get("category");
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (category) where.category = category;
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }

  const expenses = await prisma.personalExpense.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const expense = await prisma.personalExpense.create({
    data: {
      type: body.type,
      amount: parseFloat(body.amount),
      currency: body.currency || "USD",
      category: body.category || null,
      description: body.description,
      date: new Date(body.date),
    },
  });
  return NextResponse.json(expense, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const expense = await prisma.personalExpense.update({
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
  return NextResponse.json(expense);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  await prisma.personalExpense.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
