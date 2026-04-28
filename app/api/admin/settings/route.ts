import { NextRequest, NextResponse } from "next/server";
import { db, siteSettings } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db.select().from(siteSettings);
  const map: Record<string, unknown> = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  return NextResponse.json(map);
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, updatedAt: new Date() },
      });
  }
  return NextResponse.json({ ok: true });
}
