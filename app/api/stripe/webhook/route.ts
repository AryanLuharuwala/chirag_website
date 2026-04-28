import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db, orders, cartItems } from "@/lib/db";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { cartSessionId, userId } = session.metadata ?? {};

    // Update order status
    if (session.payment_intent) {
      await db
        .update(orders)
        .set({ status: "confirmed", stripePaymentIntentId: session.payment_intent as string })
        .where(eq(orders.stripePaymentIntentId, session.payment_intent as string));
    }

    // Clear cart
    if (userId) {
      await db.delete(cartItems).where(eq(cartItems.userId, userId));
    } else if (cartSessionId) {
      await db.delete(cartItems).where(eq(cartItems.sessionId, cartSessionId));
    }
  }

  return NextResponse.json({ received: true });
}
