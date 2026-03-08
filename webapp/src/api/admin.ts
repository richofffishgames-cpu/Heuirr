import { Hono } from "hono"
import { db } from "../db"
import { platforms } from "../db/schema"
import { eq } from "drizzle-orm"
import { authMiddleware, adminMiddleware } from "../middleware/auth"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const admin = new Hono()
admin.use(authMiddleware, adminMiddleware)

admin.get("/platforms", async (c) => {
  return c.json(await db.select().from(platforms))
})

admin.post("/platforms", zValidator("json", z.object({
  name: z.string(),
  imageUrl: z.string(),
  playUrl: z.string(),
})), async (c) => {
  const data = c.req.valid("json")
  const [newPlatform] = await db.insert(platforms).values(data).returning()
  return c.json(newPlatform)
})

export default admin
