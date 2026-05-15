import type { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { HttpError } from "../utils/http-error.js"

function isPgError(err: unknown): err is Error & { code: string } {
  return err instanceof Error && "code" in err && typeof (err as { code: unknown }).code === "string"
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.issues.map((e) => ({
        path: (e.path as (string | number)[]).join("."),
        message: e.message,
      })),
    })
    return
  }

  if (isPgError(err)) {
    if (err.code === "42703") {
      res.status(503).json({ error: "Database schema is out of date. Restart the server after running migrations." })
      return
    }
    if (err.code === "23505") {
      res.status(409).json({ error: "Resource already exists" })
      return
    }
  }

  console.error("Unhandled error:", err)
  res.status(500).json({ error: "Internal server error" })
}
