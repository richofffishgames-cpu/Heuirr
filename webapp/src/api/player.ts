import { Hono } from "hono"
import { db } from "../db"
import { platforms, accounts } from "../db/schema"
import { eq, and } from "drizzle-orm"
import { authMiddleware } from "../middleware/auth"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const player = new Hono()
player.use(authMiddleware)

player.get("/platforms", async (c) => {
  const allPlatforms = await db.select().from(platforms)
  const user = c.get("user")
  const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, user.id))

  const result = allPlatforms.map(p => ({
    ...p,
    account: userAccounts.find(a => a.platformId === p.id) || null
  }))

  return c.json(result)
})

player.post("/platforms/:id/create-account", async (c) => {
  const platformId = parseInt(c.req.param("id"))
  const user = c.get("user")

  const existing = await db.query.accounts.findFirst({
    where: and(eq(accounts.userId, user.id), eq(accounts.platformId, platformId))
  })

  if (existing) return c.json({ error: "Account already exists" }, 400)

  const [newAccount] = await db.insert(accounts).values({
    userId: user.id,
    platformId,
    username: `${user.username}_${Math.random().toString(36).substring(7)}`,
    password: Math.random().toString(36).substring(7),
  }).returning()

  return c.json(newAccount)
})

export default player
