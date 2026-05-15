import { query } from "../config/db.js"
import type { User } from "../types/index.js"

export async function createUser(name: string, email: string, passwordHash: string): Promise<User> {
  const res = await query<User>(
    `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *`,
    [name, email, passwordHash]
  )
  return res.rows[0]!
}

export async function findUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const res = await query<(User & { password_hash: string })>(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  )
  return res.rows[0] ?? null
}

export async function findUserById(id: string): Promise<User | null> {
  const res = await query<User>(`SELECT * FROM users WHERE id = $1`, [id])
  return res.rows[0] ?? null
}
