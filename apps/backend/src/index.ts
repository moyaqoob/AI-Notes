import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes.js"
import noteRoutes from "./routes/note.routes.js"
import aiRoutes from "./routes/ai.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"
import * as noteService from "./services/note.service.js"
import { errorHandler } from "./middleware/error.middleware.js"
import { runMigrations } from "../migrations/run.js"

const app = express()
const PORT = parseInt(process.env.PORT || "4000", 10)

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }))
app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use("/api/auth", authRoutes)
app.use("/api/notes", noteRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/dashboard", dashboardRoutes)

app.get("/api/share/:share_id", async (req, res, next) => {
  try {
    const shareId = req.params.share_id
    if (!shareId || Array.isArray(shareId)) {
      res.status(400).json({ error: "Share id is required" })
      return
    }
    const note = await noteService.getNoteByShareId(shareId)
    if (!note) {
      res.status(404).json({ error: "Note not found or not public" })
      return
    }
    res.json({ note: { title: note.title, content: note.content, tags: note.tags, updated_at: note.updated_at } })
  } catch (err) {
    next(err)
  }
})

app.use(errorHandler)

await runMigrations()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
