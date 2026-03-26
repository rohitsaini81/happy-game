"use client";

import { useActionState } from "react";
import { useState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import initialState from "./state";

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-100 via-rose-100 to-sky-100 px-4 py-10">
      <Link
        href="/"
        aria-label="Back to home"
        className="absolute left-4 top-4 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        ← Home
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-xl shadow-rose-200/40 sm:p-7">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-rose-700">Login</h1>
          <p className="mt-1 text-sm text-slate-600">Enter mobile number and password</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Mobile Number</label>
            <input
              name="username"
              autoComplete="tel"
              inputMode="numeric"
              placeholder="Type mobile number"
            className="mt-1.5 w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            />
            {state?.fieldErrors?.username ? (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.username}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Type password"
                className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 pr-20 text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {state?.fieldErrors?.password ? (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.password}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 py-2.5 text-base font-semibold text-white transition hover:from-rose-600 hover:to-pink-600"
          >
            Sign In
          </button>

          {state?.message ? (
            <div
              className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}
            >
              {state.message}
            </div>
          ) : null}

          <div className="my-1 border-t border-slate-200" />

          <button
            type="button"
            onClick={() => window.location.assign("/api/auth/google")}
            className="rounded-lg border border-[#db4437] bg-[#db4437] py-2.5 text-sm font-semibold text-white transition hover:bg-[#c7372d]"
          >
            Continue with Google
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#1877f2] bg-[#1877f2] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1366cf]"
          >
            Continue with Facebook
          </button>

          <div className="mt-1 text-center text-sm text-slate-600">
            New user?{" "}
            <Link href="/signup" className="font-semibold text-rose-700 underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
