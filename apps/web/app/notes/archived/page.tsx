"use client"

import { AuthGuard } from "../../../components/AuthGuard"
import { NoteList } from "../../../components/NoteList"
import Link from "next/link"

export default function ArchivedNotesPage() {
  return (
    <AuthGuard>
      <div className="app-layout">
        <header className="app-header">
          <span className="logo">AI Notes</span>
          <nav>
            <Link href="/notes">Notes</Link>
            <Link href="/notes/archived" className="active">Archived</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </header>
        <main className="app-main">
          <NoteList archived />
        </main>
      </div>
    </AuthGuard>
  )
}
