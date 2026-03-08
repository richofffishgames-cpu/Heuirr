import { Hono } from "hono"
import { db } from "../db"
import { platforms, accounts } from "../db/schema"
import { eq, and } from "drizzle-orm"
import { authMiddleware } from "../middleware/auth"

const player = new Hono()
player.use(authMiddleware)

player.get("/platforms", async (c) => {
  try {
    const allPlatforms = await db.select().from(platforms)
    const user = c.get("user")
    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, user.id))

    const result = allPlatforms.map(p => ({
      ...p,
      account: userAccounts.find(a => a.platformId === p.id) || null
    }))

    return c.json(result)
  } catch (error) {
    console.error("Error fetching platforms:", error)
    return c.json({ error: "Failed to fetch platforms" }, 500)
  }
})

player.post("/platforms/:id/create-account", async (c) => {
  try {
    const idParam = c.req.param("id")
    const platformId = parseInt(idParam)

    if (isNaN(platformId)) {
      return c.json({ error: "Invalid platform ID" }, 400)
    }

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
  } catch (error) {
    console.error("Error creating account:", error)
    return c.json({ error: "Failed to create account" }, 500)
  }
})

export default player
