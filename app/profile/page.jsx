import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/session";

async function logoutAction() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.set("session", "", { path: "/", maxAge: 0 });
  cookieStore.set("admin_auth", "", { path: "/", maxAge: 0 });
  redirect("/login");
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const user = getSessionUser(cookieStore);

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-sky-100 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-emerald-200 bg-white p-6 shadow-xl shadow-emerald-100/70 sm:p-8">
        <h1 className="text-2xl font-bold text-emerald-700">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Logged-in user details</p>

        <div className="mt-6 flex items-center gap-4">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name || "User"}
              className="h-16 w-16 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-500">
              NA
            </div>
          )}
          <div>
            <div className="text-lg font-semibold text-slate-800">{user.name || "Unknown user"}</div>
            <div className="text-sm text-slate-600">{user.email || "No email"}</div>
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div>
            <span className="font-semibold">User ID:</span> {user.id || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Points:</span> {user.points ?? "N/A"}
          </div>
          <div>
            <span className="font-semibold">Issued At:</span>{" "}
            {user.iat ? new Date(user.iat * 1000).toLocaleString() : "N/A"}
          </div>
          <div>
            <span className="font-semibold">Session Expires:</span>{" "}
            {user.exp ? new Date(user.exp * 1000).toLocaleString() : "N/A"}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
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
