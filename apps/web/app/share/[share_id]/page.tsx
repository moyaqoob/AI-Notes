"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "../../../lib/api"

export default function SharedNotePage() {
  const params = useParams()
  const [note, setNote] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    api.share.get(params.share_id as string)
      .then((res) => setNote(res.note))
      .catch((err) => setError(err.message))
  }, [params.share_id])

  if (error) return (
    <div className="public-share-page">
      <div className="public-share-card"><h1>404</h1><p>{error}</p></div>
    </div>
  )

  if (!note) return <div className="public-share-page"><div className="public-share-card"><p>Loading...</p></div></div>

  return (
    <div className="public-share-page">
      <div className="public-share-card">
        <h1>{note.title}</h1>
        {note.tags?.length > 0 && (
          <div className="tags">{note.tags.map((t: string) => <span key={t} className="tag">{t}</span>)}</div>
        )}
        <div className="public-note-content">{note.content}</div>
        <p className="date">Last updated: {new Date(note.updated_at).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
