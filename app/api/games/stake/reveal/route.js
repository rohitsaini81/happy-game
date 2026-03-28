import { NextResponse } from "next/server";
import { TOTAL_TILES, calculateMultiplier, getStakeSession } from "../store";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = String(body?.sessionId || "");
    const tileIndex = Number(body?.tileIndex);

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }

    if (!Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= TOTAL_TILES) {
      return NextResponse.json({ error: "Invalid tile index." }, { status: 400 });
    }

    const session = getStakeSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session expired or not found." }, { status: 404 });
    }
    if (session.status !== "active") {
      return NextResponse.json({ error: "Session is not active." }, { status: 409 });
    }
    if (session.revealedIndexes.has(tileIndex)) {
      return NextResponse.json({ error: "Tile already revealed." }, { status: 409 });
    }

    session.revealedIndexes.add(tileIndex);
    const isMine = session.mineIndexes.has(tileIndex);

    if (isMine) {
      session.status = "lost";
      return NextResponse.json({
        isMine: true,
        mineIndexes: Array.from(session.mineIndexes),
      });
    }

    session.safeReveals += 1;
    const multiplier = calculateMultiplier(session.minesCount, session.safeReveals);

    return NextResponse.json({
      isMine: false,
      safeReveals: session.safeReveals,
      multiplier,
    });
  } catch {
    return NextResponse.json({ error: "Failed to reveal tile." }, { status: 500 });
  }
}

