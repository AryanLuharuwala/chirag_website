import { NextRequest, NextResponse } from "next/server";
import { db, cartItems, products } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

async function getSessionId() {
  const cookieStore = await cookies();
  let sid = cookieStore.get("ter_cart_session")?.value;
  if (!sid) {
    sid = uuidv4();
    cookieStore.set("ter_cart_session", sid, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    });
  }
  return sid;
}

export async function GET() {
  const session = await getSession();
  const sessionId = await getSessionId();

  const whereClause = session?.userId
    ? eq(cartItems.userId, session.userId)
    : eq(cartItems.sessionId, sessionId);

  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      size: cartItems.size,
      colorKey: cartItems.colorKey,
      quantity: cartItems.quantity,
      product: {
        name: products.name,
        price: products.price,
        slug: products.slug,
        tone: products.tone,
        category: products.category,
      },
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(whereClause);

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { productId, size, colorKey, quantity = 1 } = await req.json();
  const session = await getSession();
  const sessionId = await getSessionId();

  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.productId, productId),
        eq(cartItems.size, size),
        eq(cartItems.colorKey, colorKey),
        session?.userId
          ? eq(cartItems.userId, session.userId)
          : eq(cartItems.sessionId, sessionId)
      )
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
    return NextResponse.json({ ok: true, action: "updated" });
  }

  await db.insert(cartItems).values({
    sessionId,
    userId: session?.userId ?? null,
    productId,
    size,
    colorKey,
    quantity,
  });

  return NextResponse.json({ ok: true, action: "added" });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(cartItems).where(eq(cartItems.id, id));
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const { id, quantity } = await req.json();
  if (quantity < 1) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
  }
  return NextResponse.json({ ok: true });
}
