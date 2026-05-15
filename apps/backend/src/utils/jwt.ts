import jwt from "jsonwebtoken"

const SECRET = process.env.JWT_SECRET || "ai-notes-secret-change-in-production"
const EXPIRES_IN = "7d"

export function signToken(payload: { id: string; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { id: string; email: string; iat: number; exp: number }
}
