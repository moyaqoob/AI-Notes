import { query } from "../config/db.js"
import type { DashboardData } from "../types/index.js"

export async function getDashboard(userId: string): Promise<DashboardData> {
  const totalRes = await query<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM notes WHERE user_id = $1 AND is_archived = FALSE`,
    [userId]
  )

  const recentRes = await query<{ note_id: string; title: string; updated_at: string }>(
    `SELECT note_id, title, updated_at FROM notes WHERE user_id = $1 AND is_archived = FALSE ORDER BY updated_at DESC LIMIT 5`,
    [userId]
  )

  const tagsRes = await query<{ tag: string; count: string }>(
    `SELECT unnest(tags) as tag, COUNT(*)::text as count FROM notes WHERE user_id = $1 AND is_archived = FALSE GROUP BY tag ORDER BY count DESC LIMIT 5`,
    [userId]
  )

  const statsRes = await query<{ ai_requests: string }>(
    `SELECT COALESCE(ai_requests, 0)::text as ai_requests FROM user_stats WHERE user_id = $1`,
    [userId]
  )

  const activityRes = await query<{ date: string; count: string }>(
    `SELECT DATE(updated_at)::text as date, COUNT(*)::text as count FROM notes WHERE user_id = $1 AND updated_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(updated_at) ORDER BY date`,
    [userId]
  )

  return {
    total_notes: parseInt(totalRes.rows[0]!.count),
    recent_notes: recentRes.rows,
    top_tags: tagsRes.rows.map((r) => ({ tag: r.tag, count: parseInt(r.count) })),
    ai_requests: parseInt(statsRes.rows[0]?.ai_requests ?? "0"),
    weekly_activity: activityRes.rows.map((r) => ({ date: r.date, count: parseInt(r.count) })),
  }
}
