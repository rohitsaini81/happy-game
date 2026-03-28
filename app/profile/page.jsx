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
    <main className="min-h-screen bg-[#0f1722] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-[#2a3d4d] bg-[#13212c] shadow-2xl shadow-black/40">
        <div className="border-b border-[#2a3d4d] bg-gradient-to-r from-[#0b2f2e] via-[#123b3a] to-[#18494a] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {dbUser.profile_picture ? (
                <img
                  src={dbUser.profile_picture}
                  alt={dbUser.name || "User"}
                  className="h-16 w-16 rounded-full border-2 border-[#00e701] object-cover shadow-lg shadow-[#00e701]/20"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#00e701] bg-[#1e2f3c] text-lg font-bold text-[#00e701]">
                  {(dbUser.name || dbUser.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#90a6b7]">Player Profile</p>
                <h1 className="text-2xl font-bold text-white">{dbUser.name || "Unknown user"}</h1>
                <p className="text-sm text-[#b7c6d1]">{dbUser.email || "No email"}</p>
              </div>
            </div>
            <div className="rounded-xl border border-[#2f4553] bg-[#0f212e] px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-widest text-[#8aa0b2]">Wallet Points</p>
              <p className="text-2xl font-extrabold text-[#00e701]">{dbUser.points ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          <div className="rounded-xl border border-[#2f4553] bg-[#0f212e] p-4">
            <p className="text-xs uppercase tracking-widest text-[#8aa0b2]">User ID</p>
            <p className="mt-2 text-xl font-bold text-white">{dbUser.id || "N/A"}</p>
          </div>
          <div className="rounded-xl border border-[#2f4553] bg-[#0f212e] p-4">
            <p className="text-xs uppercase tracking-widest text-[#8aa0b2]">Account Status</p>
            <p className="mt-2 text-xl font-bold text-[#00e701]">Active</p>
          </div>
          <div className="rounded-xl border border-[#2f4553] bg-[#0f212e] p-4">
            <p className="text-xs uppercase tracking-widest text-[#8aa0b2]">Role</p>
            <p className="mt-2 text-xl font-bold text-white">Player</p>
          </div>
        </div>

        <div className="mx-6 rounded-xl border border-[#2f4553] bg-[#0f212e] p-4 text-sm text-[#d4e0e7] sm:mx-8">
          <div>
            <span className="font-semibold text-white">User ID:</span> {dbUser.id || "N/A"}
          </div>
          <div className="mt-2">
            <span className="font-semibold text-white">Points:</span> {dbUser.points ?? "N/A"}
          </div>
          {/* <div className="mt-2">
            <span className="font-semibold text-white">Profile Picture:</span>{" "}
            {dbUser.profile_picture || "N/A"}
          </div> */}
          {/* <div className="mt-2">
            <span className="font-semibold text-white">User Type ID:</span>{" "}
            {dbUser.user_type_id ?? "N/A"}
          </div> */}
        </div>

        <div className="flex flex-wrap gap-3 p-6 sm:p-8">
          <Link
            href="/"
            className="rounded-lg border border-[#2f4553] bg-[#1a2c38] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#213743]"
          >
            Back To Home
          </Link>
          <Link
            href="/playible-online-games"
            className="rounded-lg border border-[#00e701] bg-[#00e701] px-4 py-2 text-sm font-semibold text-[#071824] transition hover:bg-[#4bff4f]"
          >
            Open Games
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-[#ff5a72] bg-[#2a1a22] px-4 py-2 text-sm font-semibold text-[#ff8b9d] transition hover:bg-[#3a2230]"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
