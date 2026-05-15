"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { AuthGuard } from "../../../components/AuthGuard"
import { NoteEditor } from "../../../components/NoteEditor"

export default function NotePage() {
  const params = useParams()
  const noteId = params.id as string

  return (
    <AuthGuard>
      <div className="app-layout">
        <header className="app-header">
          <Link href="/notes" className="back-link">← Back to Notes</Link>
        </header>
        <main className="app-main">
          <NoteEditor noteId={noteId} />
        </main>
      </div>
    </AuthGuard>
  )
}
