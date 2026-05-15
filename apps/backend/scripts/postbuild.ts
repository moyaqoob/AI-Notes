import { cpSync, mkdirSync } from "fs"
import { join } from "path"

const root = join(import.meta.dir, "..")
const distMigrations = join(root, "dist", "migrations")

mkdirSync(distMigrations, { recursive: true })
cpSync(join(root, "migrations"), distMigrations, { recursive: true })
console.log("Copied migrations to dist/migrations")
