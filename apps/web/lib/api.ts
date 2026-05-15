const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({} as { error?: string }))
    const message = typeof body.error === "string" ? body.error : `Request failed (${res.status} ${res.statusText})`
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  auth: {
    signup: (body: { name: string; email: string; password: string }) =>
      request<{ user: any; token: string }>("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request<{ user: any; token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
    me: () => request<{ user: any }>("/api/auth/me"),
  },
  notes: {
    list: (params?: { archived?: boolean; keyword?: string; tag?: string }) => {
      const q = new URLSearchParams()
      if (params?.archived) q.set("archived", "true")
      if (params?.keyword) q.set("keyword", params.keyword)
      if (params?.tag) q.set("tag", params.tag)
      const qs = q.toString()
      return request<{ notes: any[] }>(`/api/notes${qs ? "?" + qs : ""}`)
    },
    get: (id: string) => request<{ note: any }>(`/api/notes/${id}`),
    create: (body: { title?: string; content?: string; tags?: string[]; category?: string }) =>
      request<{ note: any }>("/api/notes", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) =>
      request<{ note: any }>(`/api/notes/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    archive: (id: string) => request<{ note: any }>(`/api/notes/${id}/archive`, { method: "POST" }),
    unarchive: (id: string) => request<{ note: any }>(`/api/notes/${id}/unarchive`, { method: "POST" }),
    delete: (id: string) => request<void>(`/api/notes/${id}`, { method: "DELETE" }),
    share: (id: string) => request<{ share_id: string; share_url: string }>(`/api/notes/${id}/share`, { method: "POST" }),
    revokeShare: (id: string) => request<{ note: any }>(`/api/notes/${id}/revoke-share`, { method: "POST" }),
  },
  share: {
    get: (shareId: string) =>
      request<{ note: { title: string; content: string; tags: string[]; updated_at: string } }>(`/api/share/${shareId}`),
  },
  ai: {
    process: (content: string, title?: string) =>
      request<{ summary: string; action_items: string[]; suggested_title: string }>("/api/ai/process", {
        method: "POST", body: JSON.stringify({ content, title }),
      }),
  },
  dashboard: {
    get: () =>
      request<{ total_notes: number; recent_notes: { note_id: string; title: string; updated_at: string }[]; top_tags: { tag: string; count: number }[]; ai_requests: number; weekly_activity: { date: string; count: number }[] }>("/api/dashboard"),
  },
}
