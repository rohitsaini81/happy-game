import {fetch_result, fetch_result_by_month, fetchTodayYesterdayResult} from "./api/chart.js"

export default async function Home() {

  // const response = await fetch_result('SHREE_GANESH');
  const sg = await fetchTodayYesterdayResult('SHREE_GANESH').then((res)=>res.json());
  const gb = await fetchTodayYesterdayResult('GHAZIABAD').then((res)=>res.json());
  const fd = await fetchTodayYesterdayResult('FARIDABAD').then((res)=>res.json());
  const january = await fetch_result_by_month('', 2026, 1).then(data=>data.json())
  
  const data = [sg, gb, fd];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center px-4 py-6">
      <HeroSection gb={gb.today || "WAIT"} hb={"WAIT"} />
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
                    {item.yesterday}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400">Today</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {item.today}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CalendarChart data={january || december2025} />;
    </div>
  );
}



export function HeroSection({hb, gb}) {
  const navItems = [
    { label: "SATTA KING", active: true },
    { label: "RECORD CHART" },
    { label: "SATTA CHART" },
  ];

  return (
    <section className="w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white">

      {/* Navbar */}
      <div className="w-full flex justify-center px-3 pt-3">
        <div className="w-full max-w-6xl flex gap-2">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition
                ${item.active
                  ? "bg-blue-700"
                  : "bg-blue-900/70 hover:bg-blue-800"
                }`}
            >
              {item.label}
            </button>
          ))}
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
            HYDERABAD
          </p>

          <p className="text-yellow-400 text-2xl font-extrabold">
            {hb}
          </p>

          <p className="text-emerald-400 text-xl font-bold">
            GHAZIABAD
          </p>

          <p className="text-yellow-400 text-lg font-semibold">
            {gb}
          </p>
        </div>
      </div>
    </section>
  );
}









export function CalendarChart({ data }) {
  const chartData = data
  console.log(chartData)

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


