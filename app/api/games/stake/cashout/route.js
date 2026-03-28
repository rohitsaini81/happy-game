import { NextResponse } from "next/server";
import { calculateMultiplier, getStakeSession, endStakeSession } from "../store";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = String(body?.sessionId || "");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }

    const session = getStakeSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session expired or not found." }, { status: 404 });
    }
    if (session.status !== "active") {
      return NextResponse.json({ error: "Session is not active." }, { status: 409 });
    }
    if (session.safeReveals <= 0) {
      return NextResponse.json({ error: "Reveal at least one safe tile before cashout." }, { status: 400 });
    }

    const multiplier = calculateMultiplier(session.minesCount, session.safeReveals);
    session.status = "cashed_out";
    endStakeSession(session.id);

    return NextResponse.json({
      safeReveals: session.safeReveals,
      multiplier,
    });
  } catch {
    return NextResponse.json({ error: "Failed to cash out." }, { status: 500 });
  }
}

