import { z } from "zod"

export const aiProcessSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
})
