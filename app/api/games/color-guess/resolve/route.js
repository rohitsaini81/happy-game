import { NextResponse } from "next/server";

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

export async function POST() {
  const resultColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  return NextResponse.json({ resultColor });
}
