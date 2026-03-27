import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { signJwt } from "@/app/lib/jwt";
import { upsertGoogleUser, toSessionUser } from "@/app/lib/auth-user";

export const runtime = "nodejs";

const decodeJwtPayload = (token) => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  cookieStore.set("oauth_state", "", { path: "/", maxAge: 0 });

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;
  const jwtSecret = process.env.JWT_SECRET;

  if (!clientId || !clientSecret || !redirectUri || !jwtSecret) {
    return NextResponse.json(
      { error: "Missing OAuth or JWT env vars" },
      { status: 500 }
    );
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    return NextResponse.json(
      { error: "Token exchange failed", detail },
      { status: 500 }
    );
  }

  const tokens = await tokenRes.json();
  const payload = decodeJwtPayload(tokens.id_token);

  if (!payload?.sub) {
    return NextResponse.json(
      { error: "Invalid id_token payload" },
      { status: 500 }
    );
  }
  if (!payload?.email) {
    return NextResponse.json(
      { error: "Google account email is required" },
      { status: 500 }
    );
  }

  const appUser = await upsertGoogleUser({
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
  });

  const now = Math.floor(Date.now() / 1000);
  const user = {
    ...toSessionUser(appUser),
    iat: now,
    exp: now + 60 * 60 * 24 * 7,
  };

  const session = signJwt(user, jwtSecret);

  cookieStore.set("session", session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set("admin_auth", "", { path: "/", maxAge: 0 });

  return NextResponse.redirect(new URL("/profile", request.url));
}
