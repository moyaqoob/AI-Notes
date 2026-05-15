import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().max(255),
  password: z.string().min(6).max(128),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
