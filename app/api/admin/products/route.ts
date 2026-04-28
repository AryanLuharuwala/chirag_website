import { NextRequest, NextResponse } from "next/server";
import { db, products } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(products).orderBy(products.position);
  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const allowed = ["name", "description", "price", "colorKey", "tone", "inStock", "position", "visualConfig"];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  if (!Object.keys(filtered).length) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const [updated] = await db
    .update(products)
    .set({ ...filtered, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();

  return NextResponse.json(updated);
}
