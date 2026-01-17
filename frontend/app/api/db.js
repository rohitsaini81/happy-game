import { Pool } from 'pg'
const connectionString = process.env.DATABASE_URL
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

export default pool
