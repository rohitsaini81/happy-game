"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import initialState from "./state";
import { signJwt } from "@/app/lib/jwt";
import { findUserByEmail, toSessionUser } from "@/app/lib/auth-user";
import { verifyPassword } from "@/app/lib/password";

export async function loginAction(_prevState, formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();

  const fieldErrors = {};
  if (!email) fieldErrors.email = "Email is required";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Enter a valid email";
  }
  if (!password) fieldErrors.password = "Password is required";

  if (Object.keys(fieldErrors).length > 0) {
    return { ...initialState, ok: false, message: "Fix the errors below.", fieldErrors };
  }

  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASSWORD;

  const cookieStore = await cookies();
  if (expectedUser && expectedPass && email === expectedUser && password === expectedPass) {
    cookieStore.set("admin_auth", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
    });

    redirect("/admin");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return {
      ...initialState,
      ok: false,
      message: "JWT_SECRET is not configured on the server.",
    };
  }

  try {
    const user = await findUserByEmail(email);
    if (!user?.password_hash) {
      return { ...initialState, ok: false, message: "Invalid email or password." };
    }

    if (user.is_active === false) {
      return { ...initialState, ok: false, message: "Your account is inactive." };
    }

    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return { ...initialState, ok: false, message: "Invalid email or password." };
    }

    const now = Math.floor(Date.now() / 1000);
    const sessionUser = toSessionUser(user);
    const token = signJwt(
      {
        ...sessionUser,
        iat: now,
        exp: now + 60 * 60 * 24 * 7,
      },
      jwtSecret
    );

    cookieStore.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set("admin_auth", "", { path: "/", maxAge: 0 });

    redirect("/profile");
  } catch {
    return {
      ...initialState,
      ok: false,
      message: "Unable to log in right now. Please try again.",
    };
  }
}
