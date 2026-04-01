import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || "";
  const clients = await prisma.client.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { company: { contains: search } },
          ],
        }
      : undefined,
    include: { payments: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const client = await prisma.client.create({
    data: {
      name: body.name,
      email: body.email || null,
      company: body.company || null,
      phone: body.phone || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(client, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const client = await prisma.client.update({
    where: { id: body.id },
    data: {
      name: body.name,
      email: body.email || null,
      company: body.company || null,
      phone: body.phone || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(client);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
