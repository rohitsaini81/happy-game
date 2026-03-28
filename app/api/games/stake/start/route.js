import { NextResponse } from "next/server";
import { TOTAL_TILES, createStakeSession } from "../store";
import { debitUserPoints, requireActiveGameUser } from "../../_lib/user-points";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const auth = await requireActiveGameUser();
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const body = await request.json().catch(() => ({}));
    const minesCount = Number(body?.minesCount);
    const betAmount = Number(body?.betAmount);

    if (!Number.isInteger(minesCount) || minesCount < 1 || minesCount > 24) {
      return NextResponse.json(
        { error: "Mines must be an integer between 1 and 24." },
        { status: 400 }
      );
    }
    if (!Number.isInteger(betAmount) || betAmount <= 0) {
      return NextResponse.json(
        { error: "Bet amount must be a positive integer." },
        { status: 400 }
      );
    }

    const points = await debitUserPoints(auth.user.id, betAmount);
    if (points === null) {
      return NextResponse.json({ error: "Insufficient points for this bet." }, { status: 400 });
    }

    const session = createStakeSession({ userId: auth.user.id, minesCount, betAmount });
    return NextResponse.json({
      sessionId: session.id,
      totalTiles: TOTAL_TILES,
      minesCount: session.minesCount,
      betAmount: session.betAmount,
      points,
    });
  } catch {
    return NextResponse.json({ error: "Failed to start stake session." }, { status: 500 });
  }
}
