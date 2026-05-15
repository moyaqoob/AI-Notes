export interface User {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Note {
  note_id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  category: string | null
  is_archived: boolean
  share_id: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface AIResponse {
  summary: string
  action_items: string[]
  suggested_title: string
}

export interface DashboardData {
  total_notes: number
  recent_notes: { note_id: string; title: string; updated_at: string }[]
  top_tags: { tag: string; count: number }[]
  ai_requests: number
  weekly_activity: { date: string; count: number }[]
}

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, "id" | "name" | "email">
    }
  }
}
