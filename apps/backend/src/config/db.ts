import pg from "pg"

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES,
  max: 10,
  idleTimeoutMillis: 30000,
})

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err)
})

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
) {
  const start = Date.now()
  const res = await pool.query<T>(text, params)
  const duration = Date.now() - start
  console.log("executed query", { text: text.slice(0, 80), duration, rows: res.rowCount })
  return res
}

export async function getClient() {
  const client = await pool.connect()
  return client
}

export { pg }
