import { readdirSync, readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { query } from "../src/config/db.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

async function isApplied(filename: string): Promise<boolean> {
  const res = await query<{ filename: string }>(
    `SELECT filename FROM schema_migrations WHERE filename = $1`,
    [filename]
  )
  return res.rows.length > 0
}

async function markApplied(filename: string) {
  await query(`INSERT INTO schema_migrations (filename) VALUES ($1)`, [filename])
}

export async function runMigrations() {
  await ensureMigrationsTable()

  const files = readdirSync(__dirname)
    .filter((f) => f.endsWith(".sql"))
    .sort()

  for (const file of files) {
    if (await isApplied(file)) {
      console.log(`Skipping migration (already applied): ${file}`)
      continue
    }

    const sql = readFileSync(join(__dirname, file), "utf-8")
    console.log(`Running migration: ${file}`)
    await query(sql)
    await markApplied(file)
    console.log(`  ✓ ${file}`)
  }

  console.log("All migrations complete.")
}

if (import.meta.main) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
