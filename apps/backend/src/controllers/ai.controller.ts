import type { Request, Response, NextFunction } from "express"
import { aiProcessSchema } from "../schemas/ai.schema.js"
import * as aiService from "../services/ai.service.js"
import { query } from "../config/db.js"
import { HttpError } from "../utils/http-error.js"

function requireUserId(req: Request): string {
  if (!req.user?.id) throw new HttpError(401, "Unauthorized")
  return req.user.id
}

async function trackAiUsage(userId: string) {
  try {
    await query(
      `INSERT INTO user_stats (user_id, ai_requests) VALUES ($1, 1) ON CONFLICT (user_id) DO UPDATE SET ai_requests = user_stats.ai_requests + 1`,
      [userId]
    )
  } catch (err) {
    console.error("Failed to track AI usage:", err)
  }
}

export async function processNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { content, title } = aiProcessSchema.parse(req.body)
    const result = await aiService.processNoteContent(content, title)
    await trackAiUsage(requireUserId(req))
    res.json(result)
  } catch (err) { next(err) }
}
