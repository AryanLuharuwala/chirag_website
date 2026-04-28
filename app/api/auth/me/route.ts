import { NextResponse } from "next/server";
import { getSession, getUserById } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null);
  const user = await getUserById(session.userId);
  if (!user) return NextResponse.json(null);
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
