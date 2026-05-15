import { Router } from "express"
import { dashboard } from "../controllers/dashboard.controller.js"
import {  middleware } from "../middleware/auth.middleware.js"

const router = Router()
router.use(middleware)
router.get("/", dashboard)

export default router
