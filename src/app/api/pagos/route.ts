import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("clientId");
  const status = request.nextUrl.searchParams.get("status");
  const upcoming = request.nextUrl.searchParams.get("upcoming");

  const where: Record<string, unknown> = {};
  if (clientId) where.clientId = clientId;
  if (status) where.status = status;
  if (upcoming === "true") {
    where.status = "pendiente";
    where.dueDate = { gte: new Date() };
  }

  const payments = await prisma.payment.findMany({
    where,
    include: { client: true },
    orderBy: { dueDate: "asc" },
  });
  return NextResponse.json(payments);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const payment = await prisma.payment.create({
    data: {
      clientId: body.clientId,
      amount: parseFloat(body.amount),
      currency: body.currency || "USD",
      status: body.status || "pendiente",
      dueDate: new Date(body.dueDate),
      paidAt: body.status === "pagado" ? new Date() : null,
      description: body.description || null,
      stripeId: body.stripeId || null,
    },
  });
  return NextResponse.json(payment, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const payment = await prisma.payment.update({
    where: { id: body.id },
    data: {
      amount: parseFloat(body.amount),
      currency: body.currency,
      status: body.status,
      dueDate: new Date(body.dueDate),
      paidAt: body.status === "pagado" ? new Date() : null,
      description: body.description || null,
    },
  });
  return NextResponse.json(payment);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  await prisma.payment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
