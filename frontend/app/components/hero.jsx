export default function HeroSection() {
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
            73
          </p>

          <p className="text-emerald-400 text-xl font-bold">
            GHAZIABAD
          </p>

          <p className="text-yellow-400 text-lg font-semibold">
            Wait
          </p>
        </div>
      </div>
    </section>
  );
}
