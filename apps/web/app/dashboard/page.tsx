"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AuthGuard } from "../../components/AuthGuard"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../lib/api"

interface DashboardData {
  total_notes: number
  recent_notes: { note_id: string; title: string; updated_at: string }[]
  top_tags: { tag: string; count: number }[]
  ai_requests: number
  weekly_activity: { date: string; count: number }[]
}

export default function DashboardPage() {
  const { logout } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    api.dashboard.get().then(setData).catch(console.error)
  }, [])

  const weekTotal = data?.weekly_activity.reduce((s, d) => s + d.count, 0) ?? 0
  const maxActivity = Math.max(...(data?.weekly_activity.map((d) => d.count) || [1]), 1)

  return (
    <AuthGuard>
      <div className="app-layout">
        <header className="app-header">
          <span className="logo">AI Notes</span>
          <nav>
            <Link href="/notes">Notes</Link>
            <Link href="/notes/archived">Archived</Link>
            <Link href="/dashboard" className="active">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </nav>
        </header>
        <main className="app-main">
          <div className="dashboard">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{data?.total_notes ?? "—"}</span>
                <span className="stat-label">Total notes</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{data?.ai_requests ?? "—"}</span>
                <span className="stat-label">AI requests</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{data?.top_tags.length ?? "—"}</span>
                <span className="stat-label">Unique tags</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{weekTotal}</span>
                <span className="stat-label">This week</span>
              </div>
            </div>

            <div className="dashboard-section">
              <h3>Weekly Activity</h3>
              <div className="activity-bars">
                {data?.weekly_activity.map((d) => (
                  <div key={d.date} className="activity-bar-wrap">
                    <div className="activity-bar"
                      style={{ height: `${Math.max(d.count / maxActivity * 140, 4)}px` }} />
                    <span className="activity-label">
                      {new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                    <span className="activity-count">{d.count}</span>
                  </div>
                ))}
                {(!data?.weekly_activity.length) && <p className="empty">No activity this week.</p>}
              </div>
            </div>

            <div className="dashboard-split">
              <div className="dashboard-section">
                <h3>Recent Notes</h3>
                {data?.recent_notes.map((n) => (
                  <Link key={n.note_id} href={`/notes/${n.note_id}`} className="recent-item">
                    <span>{n.title}</span>
                    <span className="date">{new Date(n.updated_at).toLocaleDateString()}</span>
                  </Link>
                ))}
                {!data?.recent_notes.length && <p className="empty">No recent notes.</p>}
              </div>
              <div className="dashboard-section">
                <h3>Most Used Tags</h3>
                {data?.top_tags.map((t) => (
                  <div key={t.tag} className="tag-row">
                    <span className="tag">{t.tag}</span>
                    <span className="tag-count">{t.count} notes</span>
                  </div>
                ))}
                {!data?.top_tags.length && <p className="empty">No tags yet.</p>}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
