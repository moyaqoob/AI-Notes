import type { Request, Response } from "express"
import { signupSchema, loginSchema } from "../schemas/auth.schema.js"
import { createUser, findUserByEmail, findUserById } from "../services/auth.service.js"
import { signToken } from "../utils/jwt.js"
import { sanitizeUser } from "../utils/helpers.js"

export async function signup(req: Request, res: Response) {
  const { name, email, password } = signupSchema.parse(req.body)

  const existing = await findUserByEmail(email)
  if (existing) {
    res.status(409).json({ error: "Email already registered" })
    return
  }

  const passwordHash = await Bun.password.hash(password)
  const user = await createUser(name, email, passwordHash)
  const token = signToken({ id: user.id, email: user.email })

  res.status(201).json({ user: sanitizeUser(user), token })
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body)

  const user = await findUserByEmail(email)
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" })
    return
  }

  const valid = await Bun.password.verify(password, user.password_hash)
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" })
    return
  }

  const token = signToken({ id: user.id, email: user.email })
  res.json({ user: sanitizeUser(user), token })
}

export async function me(req: Request, res: Response) {
  const user = await findUserById(req.user!.id)
  if (!user) {
    res.status(404).json({ error: "User not found" })
    return
  }
  res.json({ user: sanitizeUser(user) })
}
