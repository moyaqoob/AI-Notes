"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { api } from "../lib/api"
import { useAutoSave } from "../hooks/useAutoSave"

interface Note {
  note_id: string
  title: string
  content: string
  tags: string[]
  category: string | null
  is_archived: boolean
  is_public: boolean
  share_id: string | null
  updated_at: string
}

export function NoteEditor({ noteId }: { noteId: string }) {
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiResult, setAiResult] = useState<{ summary: string; action_items: string[]; suggested_title: string } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showDelete, setShowDelete] = useState(false)
  const router = useRouter()

  const autoSaveStatus = useAutoSave(noteId, {
    title: note?.title || "", content: note?.content || "", tags: note?.tags || [], category: note?.category,
  })

  useEffect(() => {
    api.notes.get(noteId)
      .then((res) => {
        setNote(res.note)
        if (res.note.share_id) setShareUrl(`${window.location.origin}/share/${res.note.share_id}`)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [noteId])

  const updateField = useCallback(<K extends keyof Note>(field: K, value: Note[K]) => {
    setNote((prev) => prev ? { ...prev, [field]: value } : prev)
  }, [])

  const handleSave = async () => {
    if (!note) return
    setSaving(true)
    try {
      await api.notes.update(noteId, {
        title: note.title, content: note.content, tags: note.tags, category: note.category,
      })
      router.push("/notes")
    } catch (err) { console.error("Save failed", err) }
    finally { setSaving(false) }
  }

  const handleSummarize = async () => {
    if (!note?.content) return
    setActionError(null)
    setAiLoading(true)
    setAiResult(null)
    try {
      const res = await api.ai.process(note.content, note.title)
      setAiResult(res)
      if (res.suggested_title) updateField("title", res.suggested_title)
      if (res.action_items.length > 0) {
        const formatted = res.action_items.map((item) => `- ${item}`).join("\n")
        updateField("content", formatted)
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "AI processing failed")
    } finally {
      setAiLoading(false)
    }
  }

  const handleArchive = async () => {
    try { await api.notes.archive(noteId); updateField("is_archived", true) }
    catch (err) { console.error("Archive failed", err) }
  }

  const handleUnarchive = async () => {
    try { await api.notes.unarchive(noteId); updateField("is_archived", false) }
    catch (err) { console.error("Unarchive failed", err) }
  }

  const handleDelete = async () => {
    try {
      await api.notes.delete(noteId)
      router.push("/notes")
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Delete failed")
      setShowDelete(false)
    }
  }

  const handleShare = async () => {
    setActionError(null)
    try {
      const res = await api.notes.share(noteId)
      const url = `${window.location.origin}/share/${res.share_id}`
      setShareUrl(url)
      updateField("is_public", true)
      updateField("share_id", res.share_id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Share failed")
    }
  }

  const handleRevokeShare = async () => {
    setActionError(null)
    try {
      await api.notes.revokeShare(noteId)
      setShareUrl("")
      updateField("is_public", false)
      updateField("share_id", null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Revoke failed")
    }
  }

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch { }
  }

  const wordCount = useMemo(() => {
    if (!note?.content) return 0
    return note.content.trim() ? note.content.trim().split(/\s+/).length : 0
  }, [note?.content])

  const charCount = note?.content.length ?? 0

  const saveIndicator = useMemo(() => {
    switch (autoSaveStatus) {
      case "saving": return { text: "Saving...", cls: "saving" }
      case "saved": return { text: "Saved", cls: "saved" }
      case "error": return { text: "Save failed", cls: "error" }
      default: return { text: "Unsaved changes", cls: "idle" }
    }
  }, [autoSaveStatus])

  if (loading) return <div className="loading">Loading note...</div>
  if (!note) return <div className="loading">Note not found</div>

  return (
    <div className="note-editor">
      <div className="editor-toolbar">
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save & Exit"}
        </button>
        <div className="divider" />
        <button className="btn-accent" onClick={handleSummarize} disabled={aiLoading || !note.content}>
          {aiLoading ? "Summarizing..." : "AI Summarizer"}
        </button>
        <div className="spacer" />
        {note.is_archived ? (
          <button onClick={handleUnarchive}>Unarchive</button>
        ) : (
          <button onClick={handleArchive}>Archive</button>
        )}
        {shareUrl ? (
          <>
            <button onClick={copyLink}>{copied ? "Copied!" : "Copy Link"}</button>
            <button onClick={handleRevokeShare}>Revoke</button>
          </>
        ) : (
          <button onClick={handleShare}>Share</button>
        )}
        <div className="divider" />
        <button className="btn-danger" onClick={() => setShowDelete(true)}>Delete</button>
      </div>

      <input
        className="title-input"
        value={note.title}
        onChange={(e) => updateField("title", e.target.value)}
        placeholder="Note title"
      />

      <div className="meta-inputs">
        <input placeholder="Category" value={note.category || ""}
          onChange={(e) => updateField("category", e.target.value || null)} />
        <input placeholder="Tags (comma-separated)" value={note.tags.join(", ")}
          onChange={(e) => updateField("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
      </div>

      <textarea className="content-input" value={note.content}
        onChange={(e) => updateField("content", e.target.value)}
        placeholder="Dump your rough notes here..." rows={20} />

      <div className="editor-statusbar">
        <span className={`save-status ${saveIndicator.cls}`}>
          <span className="status-dot" />
          {saveIndicator.text}
        </span>
        <span className="stats">{wordCount} words · {charCount} chars</span>
      </div>

      {actionError && <p className="action-error">{actionError}</p>}

      {aiResult && (
        <div className="ai-results">
          <h3>AI Summarizer</h3>
          {aiResult.summary && (
            <div className="ai-section"><strong>Summary</strong><p>{aiResult.summary}</p></div>
          )}
          {aiResult.action_items.length > 0 && (
            <div className="ai-section"><strong>Key Points</strong>
              <ul>{aiResult.action_items.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Delete note?</h3>
            <p>This action cannot be undone. The note and all its content will be permanently removed.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
