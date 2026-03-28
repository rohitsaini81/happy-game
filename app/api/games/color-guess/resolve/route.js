import { NextResponse } from "next/server";
import { applyUserBetOutcome, requireActiveGameUser } from "../../_lib/user-points";

export const runtime = "nodejs";

const COLORS = [
  "Red",
  "Green",
  "Blue",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "Teal",
  "Indigo",
  "Lime",
];

export async function POST(request) {
  try {
    const auth = await requireActiveGameUser();
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const body = await request.json().catch(() => ({}));
    const betAmount = Number(body?.betAmount);
    const selectedColor = String(body?.selectedColor || "");

    if (!Number.isInteger(betAmount) || betAmount <= 0) {
      return NextResponse.json({ error: "Bet amount must be a positive integer." }, { status: 400 });
    }
    if (!COLORS.includes(selectedColor)) {
      return NextResponse.json({ error: "Invalid color selection." }, { status: 400 });
    }

    const resultColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const won = resultColor === selectedColor;
    const netDelta = won ? betAmount * 8 : -betAmount;
    const points = await applyUserBetOutcome(auth.user.id, betAmount, netDelta);

    if (points === null) {
      return NextResponse.json({ error: "Insufficient points for this bet." }, { status: 400 });
    }

    return NextResponse.json({ resultColor, won, points });
  } catch {
    return NextResponse.json({ error: "Failed to resolve color guess." }, { status: 500 });
  }
}
