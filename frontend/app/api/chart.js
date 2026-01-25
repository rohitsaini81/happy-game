import { NextResponse } from "next/server.js";
import pool from "./db.js"


export const chart = (date) => {
  const december2025 = {
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


  return december2025;
}



export const fetch_result = async (gameCode) => {
  try {
    const result = await pool.query(
      `
      SELECT
        h.id,
        h.result_date,
        h.formal_name,
        h.code,
        h.result
      FROM "happy-game-result" h
      WHERE h.code = $1
      ORDER BY h.result_date;
      `,
      [gameCode]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('fetch_result error:', error)
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  }
}



// e.g:await fetch_result('FARIDABAD')
// await fetch_result('SHREE_GANESH')
// await fetch_result('HYDERABAD')






export const fetchTodayYesterdayResult = async (gameCode) => {
  try {

    const today = new Date()
    const todayDate = today.toISOString().split('T')[0]
    const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    
    const result = await pool.query(
      `
      SELECT
        MAX(CASE WHEN result_date = $1 THEN result END) AS today,
        MAX(CASE WHEN result_date = $2 THEN result END) AS yesterday
      FROM "happy-game-result"
      WHERE code = $3;
      `,
      [todayDate, yesterdayDate, gameCode]
    )

    const row = result.rows[0]

    return NextResponse.json({
      game:gameCode,
      today: row.today,
      yesterday: row.yesterday
    })
  } catch (error) {
    console.error('fetchTodayYesterdayResult error:', error)
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  }
}






// e.g:await fetchTodayYesterdayResult('HYDERABAD')
// await fetchTodayYesterdayResult('FARIDABAD')
// await fetchTodayYesterdayResult('SHREE_GANESH')



export const fetchGames = async () => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        code,
        formal_name
      FROM games
      ORDER BY id;
      `
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('fetchGames error:', error)
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  }
}


// export const fetch_result_by_month = async (
//   gameCode,
//   year,
//   month
// ) => {
//   try {
//     const params = [year, month]
//     let gameFilter = ''

//     if (gameCode) {
//       gameFilter = 'AND h.code = $3'
//       params.push(gameCode)
//     }

//     const query = `
//       SELECT
//         h.id,
//         h.result_date,
//         h.formal_name,
//         h.code,
//         h.result
//       FROM "happy-game-result" h
//       WHERE EXTRACT(YEAR FROM h.result_date) = $1
//         AND EXTRACT(MONTH FROM h.result_date) = $2
//         ${gameFilter}
//       ORDER BY h.result_date;
//     `

//     const result = await pool.query(query, params)
//     return NextResponse.json(result.rows)
//   } catch (error) {
//     console.error('fetch_result_by_month error:', error)
//     return NextResponse.json(
//       { error: 'Database error' },
//       { status: 500 }
//     )
//   }
// }



export const fetch_result_by_month = async (gameCode, year, month) => {
  try {
    const params = [year, month]
    let gameFilter = ''

    if (gameCode) {
      gameFilter = 'AND h.code = $3'
      params.push(gameCode)
    }

    const query = `
      SELECT
        h.result_date,
        h.formal_name,
        h.result
      FROM "happy-game-result" h
      WHERE EXTRACT(YEAR FROM h.result_date) = $1
        AND EXTRACT(MONTH FROM h.result_date) = $2
        ${gameFilter}
      ORDER BY h.result_date, h.formal_name;
    `

    const result = await pool.query(query, params)
    const rowsData = result.rows

    if (!rowsData || rowsData.length === 0) {
      return NextResponse.json({
        month: `${month}-${year}`,
        columns: [],
        rows: []
      })
    }

    // 1️⃣ Get unique game names in the order they appear
    const columns = Array.from(new Set(rowsData.map(r => r.formal_name)))

    // 2️⃣ Group by date
    const rowsMap = {}
    rowsData.forEach(r => {
      if (!r.result_date || !r.formal_name) return

      const d = new Date(r.result_date)
      if (isNaN(d)) return

      // format as dd-mm-yyyy
      const dateKey = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`

      if (!rowsMap[dateKey]) {
        rowsMap[dateKey] = {}
        columns.forEach(col => { rowsMap[dateKey][col] = null })
      }

      rowsMap[dateKey][r.formal_name] = r.result != null ? String(r.result) : null
    })

    // 3️⃣ Convert to array sorted by date
    const rows = Object.entries(rowsMap)
      .sort(([a], [b]) => {
        const [dayA, monthA, yearA] = a.split('-').map(Number)
        const [dayB, monthB, yearB] = b.split('-').map(Number)
        return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB)
      })
      .map(([date, valuesMap]) => ({
        date,
        values: columns.map(col => valuesMap[col] != null ? valuesMap[col] : "—")
      }))

    // 4️⃣ Build final object like your december2025 example
    return NextResponse.json({
      month: `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`,
      columns,
      rows
    })
  } catch (error) {
    console.error('fetch_result_by_month error:', error)
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  }
}
