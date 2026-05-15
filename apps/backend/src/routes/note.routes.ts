import { Router } from "express"
import * as noteController from "../controllers/note.controller.js"
import {  middleware } from "../middleware/auth.middleware.js"

const router = Router()

router.use(middleware)

router.get("/", noteController.list)
router.post("/", noteController.create)
router.post("/:id/archive", noteController.archive)
router.post("/:id/unarchive", noteController.unarchive)
router.post("/:id/share", noteController.share)
router.post("/:id/revoke-share", noteController.revokeShare)
router.get("/:id", noteController.getById)
router.patch("/:id", noteController.update)
router.delete("/:id", noteController.remove)

export default router
