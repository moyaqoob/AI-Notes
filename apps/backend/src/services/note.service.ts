import { query } from "../config/db.js"
import type { Note } from "../types/index.js"

export async function createNote(userId: string, data: { title: string; content: string; tags: string[]; category?: string | null }): Promise<Note> {
  const res = await query<Note>(
    `INSERT INTO notes (user_id, title, content, tags, category) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, data.title, data.content, data.tags, data.category ?? null]
  )
  return res.rows[0]!
}

export async function getNotesByUser(userId: string, includeArchived = false): Promise<Note[]> {
  const archivedClause = includeArchived ? "" : "AND is_archived = FALSE"
  const res = await query<Note>(
    `SELECT * FROM notes WHERE user_id = $1 ${archivedClause} ORDER BY updated_at DESC`,
    [userId]
  )
  return res.rows
}

export async function searchNotes(
  userId: string,
  opts: { keyword?: string; tag?: string; archived?: boolean }
): Promise<Note[]> {
  const conditions: string[] = ["user_id = $1"]
  const values: any[] = [userId]
  let idx = 2

  if (!opts.archived) {
    conditions.push(`is_archived = FALSE`)
  }

  if (opts.keyword) {
    conditions.push(`(title ILIKE $${idx} OR content ILIKE $${idx})`)
    values.push(`%${opts.keyword}%`)
    idx++
  }

  if (opts.tag) {
    conditions.push(`$${idx} = ANY(tags)`)
    values.push(opts.tag)
    idx++
  }

  const res = await query<Note>(
    `SELECT * FROM notes WHERE ${conditions.join(" AND ")} ORDER BY updated_at DESC`,
    values
  )
  return res.rows
}

export async function getNoteById(noteId: string, userId: string): Promise<Note | null> {
  const res = await query<Note>(
    `SELECT * FROM notes WHERE note_id = $1 AND user_id = $2`,
    [noteId, userId]
  )
  return res.rows[0] ?? null
}

export async function updateNote(
  noteId: string,
  userId: string,
  data: Partial<Pick<Note, "title" | "content" | "tags" | "category" | "is_archived" | "is_public">>
): Promise<Note | null> {
  const fields: string[] = []
  const values: any[] = []
  let idx = 1

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx}`)
      values.push(value)
      idx++
    }
  }

  if (fields.length === 0) return getNoteById(noteId, userId)

  fields.push(`updated_at = NOW()`)
  values.push(noteId, userId)

  const res = await query<Note>(
    `UPDATE notes SET ${fields.join(", ")} WHERE note_id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
    values
  )
  return res.rows[0] ?? null
}

export async function archiveNote(noteId: string, userId: string): Promise<Note | null> {
  return updateNote(noteId, userId, { is_archived: true })
}

export async function unarchiveNote(noteId: string, userId: string): Promise<Note | null> {
  return updateNote(noteId, userId, { is_archived: false })
}

export async function deleteNote(noteId: string, userId: string): Promise<boolean> {
  const res = await query(`DELETE FROM notes WHERE note_id = $1 AND user_id = $2`, [noteId, userId])
  return (res.rowCount ?? 0) > 0
}

export async function generateShareId(noteId: string, userId: string): Promise<Note | null> {
  const res = await query<Note>(
    `UPDATE notes SET share_id = gen_random_uuid(), is_public = TRUE, updated_at = NOW() WHERE note_id = $1 AND user_id = $2 RETURNING *`,
    [noteId, userId]
  )
  return res.rows[0] ?? null
}

export async function revokeShareId(noteId: string, userId: string): Promise<Note | null> {
  const res = await query<Note>(
    `UPDATE notes SET share_id = NULL, is_public = FALSE, updated_at = NOW() WHERE note_id = $1 AND user_id = $2 RETURNING *`,
    [noteId, userId]
  )
  return res.rows[0] ?? null
}

export async function getNoteByShareId(shareId: string): Promise<Note | null> {
  const res = await query<Note>(
    `SELECT * FROM notes WHERE share_id = $1 AND is_public = TRUE`,
    [shareId]
  )
  return res.rows[0] ?? null
}
