import { NextRequest, NextResponse } from "next/server";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { db, cartItems, products } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(_req: NextRequest) {
  const stripe = getStripe();
  if (!stripeEnabled || !stripe) {
    return NextResponse.json({ disabled: true }, { status: 503 });
  }

  const session = await getSession();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("ter_cart_session")?.value;

  const whereClause = session?.userId
    ? eq(cartItems.userId, session.userId)
    : eq(cartItems.sessionId, sessionId!);

  const items = await db
    .select({ quantity: cartItems.quantity, product: products })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(whereClause);

  if (!items.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const lineItems = items.map((i) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: i.product!.name,
        description: i.product!.description,
      },
      unit_amount: Math.round(parseFloat(i.product!.price) * 100),
    },
    quantity: i.quantity,
  }));

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/bag`,
    shipping_address_collection: { allowed_countries: ["US", "PT", "GB", "DE", "FR"] },
    automatic_tax: { enabled: true },
    metadata: {
      cartSessionId: sessionId ?? "",
      userId: session?.userId ?? "",
    },
  });

  return NextResponse.json({ url: stripeSession.url });
}
