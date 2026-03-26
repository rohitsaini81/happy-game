import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set("session", "", { path: "/", maxAge: 0 });
  cookieStore.set("admin_auth", "", { path: "/", maxAge: 0 });

  return NextResponse.json({ ok: true });
}
