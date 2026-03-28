import { NextResponse } from "next/server";
import { applyUserBetOutcome, requireActiveGameUser } from "../../_lib/user-points";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const auth = await requireActiveGameUser();
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const body = await request.json().catch(() => ({}));
    const betAmount = Number(body?.betAmount);
    const selectedNumber = Number(body?.selectedNumber);

    if (!Number.isInteger(betAmount) || betAmount <= 0) {
      return NextResponse.json({ error: "Bet amount must be a positive integer." }, { status: 400 });
    }
    if (!Number.isInteger(selectedNumber) || selectedNumber < 1 || selectedNumber > 10) {
      return NextResponse.json({ error: "Selected number must be between 1 and 10." }, { status: 400 });
    }

    const resultNumber = Math.floor(Math.random() * 10) + 1;
    const won = resultNumber === selectedNumber;
    const netDelta = won ? betAmount * 8 : -betAmount;
    const points = await applyUserBetOutcome(auth.user.id, betAmount, netDelta);

    if (points === null) {
      return NextResponse.json({ error: "Insufficient points for this bet." }, { status: 400 });
    }

    return NextResponse.json({ resultNumber, won, points });
  } catch {
    return NextResponse.json({ error: "Failed to resolve number guess." }, { status: 500 });
  }
}
