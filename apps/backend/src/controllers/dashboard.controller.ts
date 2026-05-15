import type { Request, Response } from "express"
import { getDashboard } from "../services/dashboard.service.js"

export async function dashboard(req: Request, res: Response) {
  const data = await getDashboard(req.user!.id)
  res.json(data)
}
