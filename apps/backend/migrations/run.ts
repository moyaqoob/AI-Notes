import { existsSync, readdirSync, readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { query } from "../src/config/db.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

function resolveMigrationsDir(): string {
  const candidates = [
    process.env.MIGRATIONS_DIR,
    __dirname,
    join(__dirname, "migrations"),
    join(process.cwd(), "migrations"),
    join(process.cwd(), "dist", "migrations"),
  ].filter((dir): dir is string => Boolean(dir))

  for (const dir of candidates) {
    if (!existsSync(dir)) continue
    const hasSql = readdirSync(dir).some((f) => f.endsWith(".sql"))
    if (hasSql) return dir
  }

  throw new Error("Migrations directory not found. Run db:migrate from apps/backend or set MIGRATIONS_DIR.")
}

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

  const migrationsDir = resolveMigrationsDir()
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort()

  for (const file of files) {
    if (await isApplied(file)) {
      console.log(`Skipping migration (already applied): ${file}`)
      continue
    }

    const sql = readFileSync(join(migrationsDir, file), "utf-8")
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
