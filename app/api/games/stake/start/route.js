import { NextResponse } from "next/server";
import { TOTAL_TILES, createStakeSession } from "../store";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const minesCount = Number(body?.minesCount);

    if (!Number.isInteger(minesCount) || minesCount < 1 || minesCount > 24) {
      return NextResponse.json(
        { error: "Mines must be an integer between 1 and 24." },
        { status: 400 }
      );
    }

    const session = createStakeSession(minesCount);
    return NextResponse.json({
      sessionId: session.id,
      totalTiles: TOTAL_TILES,
      minesCount: session.minesCount,
    });
  } catch {
    return NextResponse.json({ error: "Failed to start stake session." }, { status: 500 });
  }
}

