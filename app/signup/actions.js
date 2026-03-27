"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signJwt } from "@/app/lib/jwt";
import { createUserWithPassword, toSessionUser } from "@/app/lib/auth-user";
import { hashPassword } from "@/app/lib/password";
import initialState from "./state";

export async function signupAction(_prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const confirmPassword = String(formData.get("confirm_password") || "").trim();

  const fieldErrors = {};

  if (!name) fieldErrors.name = "Name is required";
  if (!email) fieldErrors.email = "Email is required";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Enter a valid email";
  }
  if (!password) fieldErrors.password = "Password is required";
  if (password && password.length < 6) {
    fieldErrors.password = "Password must be at least 6 characters";
  }
  if (!confirmPassword) fieldErrors.confirm_password = "Confirm your password";
  if (password && confirmPassword && password !== confirmPassword) {
    fieldErrors.confirm_password = "Passwords do not match";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ...initialState, ok: false, message: "Fix the errors below.", fieldErrors };
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
    const passwordHash = await hashPassword(password);
    const user = await createUserWithPassword({ name, email, passwordHash });

    const now = Math.floor(Date.now() / 1000);
    const token = signJwt(
      {
        ...toSessionUser(user),
        iat: now,
        exp: now + 60 * 60 * 24 * 7,
      },
      jwtSecret
    );

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("admin_auth", "", { path: "/", maxAge: 0 });

    redirect("/profile");
  } catch (error) {
    if (error?.code === "23505") {
      return {
        ...initialState,
        ok: false,
        message: "Email is already registered.",
        fieldErrors: { email: "Email already exists" },
      };
    }

    return {
      ...initialState,
      ok: false,
      message: "Failed to create account. Please try again.",
    };
  }
}
