import type { Request, Response } from "express"
import { createNoteSchema, updateNoteSchema } from "../schemas/note.schema.js"
import * as noteService from "../services/note.service.js"
import type { Note } from "../types/index.js"
import { HttpError } from "../utils/http-error.js"

function requireUserId(req: Request): string {
  if (!req.user?.id) throw new HttpError(401, "Unauthorized")
  return req.user.id
}

function requireNoteId(req: Request): string {
  const id = req.params.id
  if (!id || Array.isArray(id)) throw new HttpError(400, "Note id is required")
  return id
}

function requireNote(note: Note | null): Note {
  if (!note) throw new HttpError(404, "Note not found")
  return note
}

export async function create(req: Request, res: Response) {
  const data = createNoteSchema.parse(req.body)
  const note = await noteService.createNote(requireUserId(req), data)
  if (!note) throw new HttpError(500, "Failed to create note")
  res.status(201).json({ note })
}

export async function list(req: Request, res: Response) {
  const userId = requireUserId(req)
  const { archived, keyword, tag } = req.query as Record<string, string | undefined>
  const notes = keyword || tag
    ? await noteService.searchNotes(userId, { keyword, tag, archived: archived === "true" })
    : await noteService.getNotesByUser(userId, archived === "true")
  res.json({ notes })
}

export async function getById(req: Request, res: Response) {
  const note = requireNote(
    await noteService.getNoteById(requireNoteId(req), requireUserId(req))
  )
  res.json({ note })
}

export async function update(req: Request, res: Response) {
  const data = updateNoteSchema.parse(req.body)
  const note = requireNote(
    await noteService.updateNote(requireNoteId(req), requireUserId(req), data)
  )
  res.json({ note })
}

export async function archive(req: Request, res: Response) {
  const note = requireNote(
    await noteService.archiveNote(requireNoteId(req), requireUserId(req))
  )
  res.json({ note })
}

export async function unarchive(req: Request, res: Response) {
  const note = requireNote(
    await noteService.unarchiveNote(requireNoteId(req), requireUserId(req))
  )
  res.json({ note })
}

export async function remove(req: Request, res: Response) {
  const deleted = await noteService.deleteNote(requireNoteId(req), requireUserId(req))
  if (!deleted) throw new HttpError(404, "Note not found")
  res.status(204).send()
}

export async function share(req: Request, res: Response) {
  const note = requireNote(
    await noteService.generateShareId(requireNoteId(req), requireUserId(req))
  )
  if (!note.share_id) throw new HttpError(500, "Failed to generate share link")
  res.json({ share_id: note.share_id, share_url: `/share/${note.share_id}` })
}

export async function revokeShare(req: Request, res: Response) {
  const note = requireNote(
    await noteService.revokeShareId(requireNoteId(req), requireUserId(req))
  )
  res.json({ note })
}
