import { z } from "zod"

export const createNoteSchema = z.object({
  title: z.string().max(500).default("Untitled"),
  content: z.string().default(""),
  tags: z.array(z.string().max(50)).max(20).default([]),
  category: z.string().max(100).nullable().optional(),
})

export const updateNoteSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  category: z.string().max(100).nullable().optional(),
  is_archived: z.boolean().optional(),
})
