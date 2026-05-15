import { Router } from "express"
import * as aiController from "../controllers/ai.controller.js"
import { middleware } from "../middleware/auth.middleware.js"

const router = Router()
router.use(middleware)
router.post("/process", aiController.processNote)

export default router
