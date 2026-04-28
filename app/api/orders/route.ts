import { NextRequest, NextResponse } from "next/server";
import { db, orders, orderItems, cartItems, products } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.userId))
    .orderBy(orders.createdAt);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { shippingAddress } = await req.json();
  const session = await getSession();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("ter_cart_session")?.value;

  if (!sessionId && !session?.userId) {
    return NextResponse.json({ error: "No cart session" }, { status: 400 });
  }

  const whereClause = session?.userId
    ? eq(cartItems.userId, session.userId)
    : eq(cartItems.sessionId, sessionId!);

  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      size: cartItems.size,
      colorKey: cartItems.colorKey,
      quantity: cartItems.quantity,
      product: products,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(whereClause);

  if (!items.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const subtotal = items.reduce(
    (sum, i) => sum + parseFloat(i.product!.price) * i.quantity,
    0
  );
  const shipping = subtotal >= 150 ? 0 : 12;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const [order] = await db
    .insert(orders)
    .values({
      userId: session?.userId ?? null,
      sessionId: sessionId ?? null,
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      shippingAddress,
    })
    .returning();

  await db.insert(orderItems).values(
    items.map((i) => ({
      orderId: order.id,
      productId: i.productId,
      productName: i.product!.name,
      size: i.size,
      colorKey: i.colorKey,
      colorTone: i.product!.tone,
      quantity: i.quantity,
      unitPrice: i.product!.price,
    }))
  );

  // Clear cart
  await db.delete(cartItems).where(whereClause);

  return NextResponse.json(order);
}
