import {fetch_result_by_month, fetchTodayYesterdayResult, fetchGames} from "./api/chart.js"
import Link from "next/link";
import SignInPopup from "./components/signin-popup";
import { cookies } from "next/headers";
import { getSessionUser } from "@/app/lib/session";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionUser = getSessionUser(cookieStore);
  const isLoggedIn = Boolean(sessionUser);

  const gamesResponse = await fetchGames();
  const gamesPayload = await gamesResponse.json().catch(() => []);
  const games = Array.isArray(gamesPayload) ? gamesPayload : [];
  const gameCodes = (games || []).map((game) => game.code);
  const results = await Promise.all(
    gameCodes.map((code) =>
      fetchTodayYesterdayResult(code)
        .then((res) => res.json())
        .catch(() => null)
    )
  );
  const gameNameMap = Object.fromEntries(
    (games || []).map((game) => [game.code, game.formal_name || game.code])
  );
  const safeResults = results.filter((row) => row && row.game);
  const resultMap = Object.fromEntries(safeResults.map((row) => [row.game, row]));
  const todayResults = safeResults.filter((row) => row?.today != null);
  const firstToday = todayResults[0];
  const secondToday = todayResults[1];

  const sg = resultMap.SHREE_GANESH || {
    game: "SHREE_GANESH",
    today: null,
    yesterday: null,
  };
  const gb = resultMap.GHAZIABAD || {
    game: "GHAZIABAD",
    today: null,
    yesterday: null,
  };
  const fd = resultMap.FARIDABAD || {
    game: "FARIDABAD",
    today: null,
    yesterday: null,
  };
  const januaryResponse = await fetch_result_by_month("", 2026, 1);
  const januaryPayload = await januaryResponse.json().catch(() => null);
  const january =
    januaryPayload && typeof januaryPayload === "object" ? januaryPayload : null;
  const calendarData =
    january && Array.isArray(january.columns) && Array.isArray(january.rows)
      ? january
      : december2025;
  
  const data = [sg, gb, fd];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center px-4 py-6">
      <HeroSection
        firstGameName={firstToday?.game ? gameNameMap[firstToday.game] : "HYDERABAD"}
        firstGameValue={firstToday?.today ?? "WAIT"}
        secondGameName={
          secondToday?.game ? gameNameMap[secondToday.game] : "GHAZIABAD"
        }
        secondGameValue={secondToday?.today ?? "WAIT"}
        sessionUser={sessionUser}
      />
      {/* Header */}
      <div className="w-full max-w-3xl text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">SATTA KING</h1>
        <p className="text-sm text-slate-500">
          Yesterday And Today Result
        </p>
      </div>

      {/* Cards */}
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="font-semibold text-slate-800">
                  {item.game}
                </h2>
                <p className="text-xs text-slate-500">
                  Time: {item?.time}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400">Yesterday</span>
                  <span className="text-lg font-bold text-slate-700">
                    {item.yesterday ?? "WAIT"}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400">Today</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {item.today ?? "WAIT"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CalendarChart data={calendarData} />;
      <a
        href="https://wa.me/8199889776"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600"
      >
        <svg
          viewBox="0 0 32 32"
          className="h-6 w-6"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M19.11 17.44c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.47.13-.62.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.2-.24-.58-.48-.5-.66-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.13 3.24 5.16 4.55.72.3 1.28.48 1.72.62.72.23 1.38.2 1.9.12.58-.08 1.76-.72 2-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35m-3.07 9.12h-.01c-2.06 0-4.08-.55-5.85-1.6l-.42-.25-4.34 1.14 1.16-4.23-.27-.43A10.6 10.6 0 0 1 5.44 16c0-5.86 4.77-10.62 10.63-10.62 2.84 0 5.5 1.1 7.5 3.1a10.54 10.54 0 0 1 3.1 7.5c0 5.86-4.77 10.63-10.63 10.63m9.04-19.67A12.75 12.75 0 0 0 16.07 2C9.4 2 4 7.4 4 14.06c0 2.05.53 4.06 1.55 5.85L3.9 26l6.28-1.64a12.64 12.64 0 0 0 5.9 1.51h.01c6.66 0 12.06-5.4 12.06-12.06 0-3.22-1.25-6.26-3.55-8.52"
          />
        </svg>
      </a>
      {!isLoggedIn ? <SignInPopup /> : null}
    </div>
  );
}



export function HeroSection({
  firstGameName,
  firstGameValue,
  secondGameName,
  secondGameValue,
  sessionUser,
}) {
  const navItems = [
    { label: "SATTA KING", href: "/", active: true },
    { label: "RECORD CHART" },
    { label: "SATTA CHART" },
    { label: "PLAYIBLE ONLINE GAMES", href: "/playible-online-games" },
  ];

  return (
    <section className="w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white">

      {/* Navbar */}
      <div className="w-full flex justify-center px-3 pt-3">
        <div className="flex w-full max-w-6xl flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            {navItems.map((item, index) => (
              item.href ? (
                <Link
                  key={index}
                  href={item.href}
                  className={`w-full rounded-lg px-3 py-2 text-center text-sm font-semibold transition sm:flex-1
                  ${item.active
                    ? "bg-blue-700"
                    : "bg-blue-900/70 hover:bg-blue-800"
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={index}
                  type="button"
                  className="w-full rounded-lg bg-blue-900/70 px-3 py-2 text-sm font-semibold transition hover:bg-blue-800 sm:flex-1"
                >
                  {item.label}
                </button>
              )
            ))}
          </div>
          {sessionUser ? (
            <Link
              href="/profile"
              aria-label="Go to profile"
              className="flex w-full shrink-0 items-center justify-center sm:w-auto"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 text-sm font-bold text-white shadow-md ring-2 ring-white/80 transition hover:scale-105">
                {(sessionUser.name || sessionUser.email || "U").charAt(0).toUpperCase()}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-full shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-600 sm:w-auto"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Hero Content */}
      <div className="w-full flex flex-col items-center text-center px-4 py-6 gap-3">
        <p className="text-sm tracking-wide text-slate-300">
          SUPER FAST KING LIVE RESULT
        </p>

        <p className="text-yellow-400 font-bold text-lg">
          www.11satta.in
        </p>

        <p className="text-xs text-slate-300 max-w-3xl">
          DELHI SATTA KING LIVE TODAYS RESULT
        </p>

        {/* Marquee-style text (static, clean version) */}

        <div className="w-full max-w-5xl bg-blue-900/60 overflow-hidden rounded-md px-3 py-2 text-xs text-slate-200">
          {/* <marquee> */}
          <p className="marquee w-full  ">
            <b>SATTA KING, SATTA KING RECORD, SATTA KING RECORD CHART,PATNA CITY SATTA CHART, SATTA KING ONLINE RESULT, JAY BHOLE  SATTA  ,

              BIKANER SUPER SATTA  ,

              DESAWER SATTA  ,

              PROFIT BAZZAR SATTA  ,

              HYDERABAD DAY SATTA  ,

              YAMUNA  CITY SATTA  ,

              A1 SADAR BAZAR SATTA  ,

              KUWAIT CITY SATTA  ,

              MIRZAPUR SATTA  ,

              DELHI SATTA SATTA  ,

              CHANDIGARH CITY SATTA  ,

              RAJSHREE SATTA  ,

              NEW GAJIYABAD SATTA  ,

              HR KING SATTA  ,

              JAY  LAXMI SATTA  ,

              ALWAR BAJAR SATTA  ,

              NEW  TAJ  CHHOTU SATTA  ,

              DELHI BAZAR SATTA  ,

              AHMEDABAD SATTA  ,

              PALAMPUR (PP) SATTA  ,

              SHREE GANESH SATTA  ,

              KOHINOOR SATTA  ,

              FARIDABAD SATTA  ,

              DUBAI SATTA SATTA  ,

              PARAS SATTA  ,

              HYDERABAD  GOLD SATTA  ,

              MALAMAL BAZAR SATTA  ,

              PUSHKAR SATTA  ,

              UP MATKA SATTA  ,

              HYDERABAD SATTA  ,

              GHAZIABAD SATTA  ,

              BHAGYA SHREE SATTA  ,

              DS KING SATTA  ,

              CHAR MINAR SATTA  ,

              HAMJAPUR SATTA  ,

              SUPER PANJAB SATTA  ,

              GALI SATTA  ,

              SATTA KING FAST</b>
          {/* </marquee>       */}
          </p>
            </div>

        {/* Online badge */}
        <span className="mt-2 inline-block bg-indigo-400 text-white text-xs px-3 py-1 rounded-full">
          3 ONLINE
        </span>
      </div>

      {/* Live Result Box */}
      <div className="w-full flex flex-col items-center justify-center px-3 pb-6">
        <div className="w-full ">
          <h1 className="text-center">SATTA KING</h1>
          <h3 className="text-center">Yesterday And Today Result</h3>
        </div>
        <div className="w-full max-w-5xl rounded-xl border-2 border-emerald-500 bg-black/90 px-4 py-6 flex flex-col items-center gap-3">

          <p className="text-yellow-400 text-sm font-semibold">
            25-12-2025 09:01:51 PM
          </p>

          <p className="text-xs text-slate-300">
            डायरेक्ट सट्टा-किंग कंपनी से रिजल्ट देखने के लिए रुके रहिये
          </p>

          <p className="text-emerald-400 text-xl font-bold">
            {firstGameName}
          </p>

          <p className="text-yellow-400 text-2xl font-extrabold">
            {firstGameValue}
          </p>

          <p className="text-emerald-400 text-xl font-bold">
            {secondGameName}
          </p>

          <p className="text-yellow-400 text-lg font-semibold">
            {secondGameValue}
          </p>
        </div>
      </div>
    </section>
  );
}









export function CalendarChart({ data }) {
  const chartData =
    data && Array.isArray(data.columns) && Array.isArray(data.rows)
      ? data
      : december2025;

  return (
    <section className="w-full bg-slate-100 px-3 py-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="bg-blue-700 text-white text-center py-3 font-semibold">
          {chartData.month} – Record Chart
        </div>

        {/* Column Headers */}
        <div className="flex text-xs font-semibold bg-slate-200 border-b">
          <div className="w-28 shrink-0 px-2 py-2 text-black text-center">
            Date
          </div>

          <div className="flex flex-1">
            {chartData.columns.map((col, i) => (
              <div
                key={i}
                className="flex-1 px-2 py-2 text-center border-l"
              >
                <span className="text-black">
                  {col}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="max-h-[70vh] overflow-y-auto">
          {chartData.rows.map((row, i) => (
            <div
              key={i}
              className="flex text-sm border-b last:border-none"
            >
              <div className="w-28 text-black shrink-0 bg-yellow-300 text-center px-2 py-2 font-medium">
                {row.date}
              </div>

              <div className="flex flex-1">
                {row.values.map((val, j) => (
                  <div
                    key={j}
                    className="flex-1 px-2 py-2 text-center text-black border-l"
                  >
                    <span className="text-black">
                      {val || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}







export const december2025 = {
  month: "December 2025",
  columns: [
    "FARIDABAD",
    "MALAMAL BAZAR",
    "HYDERABAD",
    "GHAZIABAD",
  ],
  rows: [
    { date: "01-12-2025", values: ["86", "86", "31", "63"] },
    { date: "02-12-2025", values: ["19", "49", "18", "82"] },
    { date: "03-12-2025", values: ["69", "04", "34", "91"] },
    { date: "04-12-2025", values: ["35", "44", "20", "98"] },
    { date: "05-12-2025", values: ["67", "16", "87", "72"] },
    { date: "06-12-2025", values: ["92", "40", "06", "12"] },
    { date: "07-12-2025", values: ["41", "87", "09", "72"] },
    { date: "08-12-2025", values: ["38", "28", "38", "25"] },
    { date: "09-12-2025", values: ["39", "57", "73", "91"] },
    { date: "10-12-2025", values: ["33", "76", "73", "07"] },
    { date: "11-12-2025", values: ["61", "24", "58", "72"] },
    { date: "12-12-2025", values: ["57", "55", "31", "11"] },
    { date: "13-12-2025", values: ["73", "92", "52", "85"] },
    { date: "14-12-2025", values: ["58", "37", "20", "66"] },
    { date: "15-12-2025", values: ["89", "21", "41", "19"] },
    { date: "16-12-2025", values: ["21", "75", "43", "64"] },
    { date: "17-12-2025", values: ["82", "06", "58", "19"] },
    { date: "18-12-2025", values: ["81", "71", "71", "07"] },
    { date: "19-12-2025", values: ["58", "23", "76", "53"] },
    { date: "20-12-2025", values: ["61", "14", "62", "49"] },
    { date: "21-12-2025", values: ["45", "79", "48", "03"] },
    { date: "22-12-2025", values: ["12", "65", "69", "65"] },
    { date: "23-12-2025", values: ["55", "40", "82", "69"] },
    { date: "24-12-2025", values: ["63", "39", "28", "22"] },
    { date: "25-12-2025", values: ["56", "69", "73", ""] },
  ],
};
