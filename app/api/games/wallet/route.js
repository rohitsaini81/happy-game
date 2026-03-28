import { NextResponse } from "next/server";
import { requireActiveGameUser } from "../_lib/user-points";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await requireActiveGameUser();
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    return NextResponse.json({ points: auth.user.points });
  } catch {
    return NextResponse.json({ error: "Failed to fetch wallet." }, { status: 500 });
  }
}

