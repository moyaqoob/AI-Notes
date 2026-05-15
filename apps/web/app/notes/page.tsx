"use client"

import { AuthGuard } from "../../components/AuthGuard"
import { NoteList } from "../../components/NoteList"
import Link from "next/link"
import { useAuth } from "../../context/AuthContext"

export default function NotesPage() {
  const { logout } = useAuth()

  return (
    <AuthGuard>
      <div className="app-layout">
        <header className="app-header">
          <span className="logo">AI Notes</span>
          <nav>
            <Link href="/notes" className="active">Notes</Link>
            <Link href="/notes/archived">Archived</Link>
            <Link href="/dashboard">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </nav>
        </header>
        <main className="app-main">
          <NoteList />
        </main>
      </div>
    </AuthGuard>
  )
}
