import type { Request, Response, NextFunction } from "express"
import { verifyToken } from "../utils/jwt.js"

export function middleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" })
    return
  }

  const token = header.slice(7)
  try {
    const payload = verifyToken(token)
    req.user = { id: payload.id, email: payload.email, name: "" }
    next()
  } catch {
    res.status(401).json({ error: "Invalid or expired token" })
  }
}
