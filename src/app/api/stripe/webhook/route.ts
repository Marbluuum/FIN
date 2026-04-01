import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret no configurado" }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Sin firma" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-03-25.dahlia",
    });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    await prisma.transaction.create({
      data: {
        type: "ingreso",
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        description: paymentIntent.description || "Pago via Stripe",
        date: new Date(paymentIntent.created * 1000),
        source: "stripe",
        externalId: paymentIntent.id,
      },
    });

    // Update matching payment if exists
    if (paymentIntent.id) {
      await prisma.payment.updateMany({
        where: { stripeId: paymentIntent.id },
        data: { status: "pagado", paidAt: new Date() },
      });
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;

    await prisma.transaction.create({
      data: {
        type: "ingreso",
        amount: (invoice.amount_paid || 0) / 100,
        currency: (invoice.currency || "usd").toUpperCase(),
        description: `Factura Stripe: ${invoice.number || invoice.id}`,
        date: new Date(),
        source: "stripe",
        externalId: invoice.id,
      },
    });
  }

  return NextResponse.json({ received: true });
}
