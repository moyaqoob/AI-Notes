"use client"

import Link from "next/link"
import { api } from "../lib/api"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface Note {
  note_id: string
  title: string
  tags: string[]
  category: string | null
  is_archived: boolean
  updated_at: string
}

export function NoteList({ archived }: { archived?: boolean }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState("")
  const [tagFilter, setTagFilter] = useState("")
  const router = useRouter()

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { archived }
      if (keyword) params.keyword = keyword
      if (tagFilter) params.tag = tagFilter
      const res = await api.notes.list(params)
      setNotes(res.notes)
    } catch (err) {
      console.error("Failed to fetch notes", err)
    } finally {
      setLoading(false)
    }
  }, [archived, keyword, tagFilter])

  useEffect(() => {
    const timer = setTimeout(fetchNotes, 300)
    return () => clearTimeout(timer)
  }, [fetchNotes])

  const handleCreate = async () => {
    try {
      const res = await api.notes.create({ title: "Untitled" })
      router.push(`/notes/${res.note.note_id}`)
    } catch (err) {
      console.error("Failed to create note", err)
    }
  }

  const allTags = [...new Set(notes.flatMap((n) => n.tags))]

  if (loading && notes.length === 0) return <div className="loading">Loading notes...</div>

  return (
    <div className="note-list">
      <div className="note-list-header">
        <h2>{archived ? "Archived Notes" : "Notes"}</h2>
        {!archived && <button onClick={handleCreate}>+ New Note</button>}
      </div>

      <div className="search-bar">
        <input placeholder="Search notes..." value={keyword}
          onChange={(e) => setKeyword(e.target.value)} />
        {allTags.length > 0 && (
          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
            <option value="">All tags</option>
            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {notes.length === 0 && <p className="empty">No notes found.</p>}

      {notes.map((note) => (
        <Link href={`/notes/${note.note_id}`} key={note.note_id} className="note-card">
          <div className="card-top">
            <h3>{note.title}</h3>
            <span className="date">{new Date(note.updated_at).toLocaleDateString()}</span>
          </div>
          <div className="card-meta">
            {note.category && <span className="category">{note.category}</span>}
            {note.tags.length > 0 && (
              <div className="tags">
                {note.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
