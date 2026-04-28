import { NextRequest, NextResponse } from "next/server";
import { db, products } from "@/lib/db";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("cat");
  const color = searchParams.get("color");

  let query = db.select().from(products)
    .where(eq(products.inStock, true))
    .orderBy(asc(products.position));

  const rows = await query;
  const filtered = rows.filter((p) => {
    if (cat && cat !== "All" && p.category !== cat) return false;
    if (color && color !== "all" && p.colorKey !== color) return false;
    return true;
  });

  return NextResponse.json(filtered);
}
