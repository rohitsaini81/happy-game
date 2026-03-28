import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const resultNumber = Math.floor(Math.random() * 10) + 1;
  return NextResponse.json({ resultNumber });
}
