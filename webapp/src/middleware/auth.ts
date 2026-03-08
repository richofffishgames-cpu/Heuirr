import { Hono } from "hono"
import { verifyToken } from "../services/jwt"

export const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization")
  if (!authHeader?.startsWith("Bearer ")) return c.json({ error: "Unauthorized" }, 401)

  const token = authHeader.split(" ")[1]
  const payload = await verifyToken(token)

  if (!payload) return c.json({ error: "Invalid token" }, 401)

  c.set("user", payload)
  await next()
}

export const adminMiddleware = async (c: any, next: any) => {
  const user = c.get("user")
  if (user.role !== "admin") return c.json({ error: "Forbidden" }, 403)
  await next()
}
