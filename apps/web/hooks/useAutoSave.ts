"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { api } from "../lib/api"

export function useAutoSave(
  noteId: string,
  data: { title: string; content: string; tags: string[]; category?: string | null },
  delay = 2000
) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  const save = useCallback(async () => {
    setStatus("saving")
    try {
      await api.notes.update(noteId, data)
      setStatus("saved")
    } catch {
      setStatus("error")
    }
  }, [noteId, data])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setStatus("idle")
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(save, delay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [noteId, data.title, data.content, data.tags, data.category, delay, save])

  return status
}
