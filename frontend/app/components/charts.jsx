export default function CalendarChart({ data }) {
  return (
    <section className="w-full bg-slate-100 px-3 py-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="bg-blue-700 text-white text-center py-3 font-semibold">
          {data.month} – Record Chart
        </div>

        {/* Column Headers */}
        <div className="flex text-xs font-semibold bg-slate-200 border-b">
          <div className="w-28 shrink-0 px-2 py-2 text-black text-center">
            Date
          </div>

          <div className="flex flex-1">
            {data.columns.map((col, i) => (
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
          {data.rows.map((row, i) => (
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
