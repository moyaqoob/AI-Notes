import type { AIResponse } from "../types/index.js"
import { HttpError } from "../utils/http-error.js"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAPI_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export async function processNoteContent(content: string, title?: string): Promise<AIResponse> {
  const prompt = `You are an AI note-taking assistant. A user has dumped rough, unorganized notes and wants clear structured output.

${title ? `Title: "${title}"` : ""}
Note content:
"""
${content}
"""

Analyze the content above and return a JSON object with exactly these fields:
- "summary": a concise 1-2 sentence summary of what this is about
- "action_items": an array of clear, specific key points and action items extracted from the content. Each item should be concrete and actionable. Ignore filler text.
- "suggested_title": a clean, descriptive title (max 8 words)

Return ONLY valid JSON. No markdown, no code fences.`

  const raw = await callGemini(prompt)
  try {
    const parsed = JSON.parse(raw) as AIResponse
    return {
      summary: parsed.summary || "",
      action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
      suggested_title: parsed.suggested_title || "",
    }
  } catch {
    return { summary: raw, action_items: [], suggested_title: "" }
  }
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new HttpError(503, "AI is not configured. Add GEMINI_API_KEY to your .env file.")

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error("Gemini API error:", response.status, errorBody)
    if (response.status === 429) throw new HttpError(429, "AI rate limit reached. Wait a moment and try again.")
    if (response.status === 401 || response.status === 403) throw new HttpError(503, "Invalid AI API key. Check GEMINI_API_KEY in .env.")
    if (response.status === 404) throw new HttpError(503, `AI model "${GEMINI_MODEL}" is not available. Set GEMINI_MODEL in .env.`)
    throw new HttpError(502, "AI service is temporarily unavailable.")
  }

  const data = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new HttpError(502, "Empty response from AI provider.")

  return text.trim()
}
