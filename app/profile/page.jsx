import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/session";
import { findUserById } from "@/app/lib/auth-user";

async function logoutAction() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.set("session", "", { path: "/", maxAge: 0 });
  cookieStore.set("admin_auth", "", { path: "/", maxAge: 0 });
  redirect("/login");
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const sessionUser = getSessionUser(cookieStore);

  if (!sessionUser?.id) {
    redirect("/login");
  }

  const dbUser = await findUserById(sessionUser.id);
  if (!dbUser || dbUser.is_active === false) {
    cookieStore.set("session", "", { path: "/", maxAge: 0 });
    cookieStore.set("admin_auth", "", { path: "/", maxAge: 0 });
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-sky-100 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-emerald-200 bg-white p-6 shadow-xl shadow-emerald-100/70 sm:p-8">
        <h1 className="text-2xl font-bold text-emerald-700">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">User details fetched from database</p>

        <div className="mt-6 flex items-center gap-4">
          {dbUser.profile_picture ? (
            <img
              src={dbUser.profile_picture}
              alt={dbUser.name || "User"}
              className="h-16 w-16 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-500">
              NA
            </div>
          )}
          <div>
            <div className="text-lg font-semibold text-slate-800">{dbUser.name || "Unknown user"}</div>
            <div className="text-sm text-slate-600">{dbUser.email || "No email"}</div>
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div>
            <span className="font-semibold">User ID:</span> {dbUser.id || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Points:</span> {dbUser.points ?? "N/A"}
          </div>
          <div>
            <span className="font-semibold">Profile Picture:</span>{" "}
            {dbUser.profile_picture || "N/A"}
          </div>
          <div>
            <span className="font-semibold">User Type ID:</span>{" "}
            {dbUser.user_type_id ?? "N/A"}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Home
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
