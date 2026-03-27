"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useState } from "react";
import { signupAction } from "./actions";
import initialState from "./state";

export default function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-100 via-emerald-100 to-lime-100 px-4 py-10">
      <Link
        href="/"
        aria-label="Back to home"
        className="absolute left-4 top-4 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        ← Home
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-6 shadow-xl shadow-emerald-200/50 sm:p-7">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-emerald-700">Sign Up</h1>
          <p className="mt-1 text-sm text-slate-600">Create a new account</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Name</label>
            <input
              name="name"
              autoComplete="name"
              placeholder="Type your name"
              className="mt-1.5 w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            {state?.fieldErrors?.name ? (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Type email"
              className="mt-1.5 w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            {state?.fieldErrors?.email ? (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Type password"
                className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 pr-20 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {state?.fieldErrors?.password ? (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
            <div className="relative mt-1.5">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                placeholder="Type password again"
                className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 pr-20 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {state?.fieldErrors?.confirm_password ? (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.confirm_password}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-base font-semibold text-white transition hover:from-emerald-600 hover:to-cyan-600"
          >
            Create Account
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
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-emerald-700 underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
