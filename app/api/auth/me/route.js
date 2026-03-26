import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const user = getSessionUser(cookieStore);

  return NextResponse.json({ user }, { status: 200 });
}
