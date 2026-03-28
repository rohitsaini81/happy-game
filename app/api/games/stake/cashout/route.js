import { NextResponse } from "next/server";
import { calculateMultiplier, getStakeSession, endStakeSession } from "../store";
import { creditUserPoints, requireActiveGameUser } from "../../_lib/user-points";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const auth = await requireActiveGameUser();
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const body = await request.json().catch(() => ({}));
    const sessionId = String(body?.sessionId || "");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }

    const session = getStakeSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session expired or not found." }, { status: 404 });
    }
    if (session.userId !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden session access." }, { status: 403 });
    }
    if (session.status !== "active") {
      return NextResponse.json({ error: "Session is not active." }, { status: 409 });
    }
    if (session.safeReveals <= 0) {
      return NextResponse.json({ error: "Reveal at least one safe tile before cashout." }, { status: 400 });
    }

    const multiplier = calculateMultiplier(session.minesCount, session.safeReveals);
    const payout = Math.floor(session.betAmount * multiplier);
    const points = await creditUserPoints(auth.user.id, payout);
    if (points === null) {
      return NextResponse.json({ error: "Unable to update points." }, { status: 500 });
    }

    session.status = "cashed_out";
    endStakeSession(session.id);

    return NextResponse.json({
      safeReveals: session.safeReveals,
      multiplier,
      payout,
      points,
    });
  } catch {
    return NextResponse.json({ error: "Failed to cash out." }, { status: 500 });
  }
}
