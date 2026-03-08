import { Hono } from "hono"
import { db } from "../db"
import { users } from "../db/schema"
import { eq } from "drizzle-orm"
import { createToken } from "../services/jwt"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const auth = new Hono()

auth.post("/register", zValidator("json", z.object({
  username: z.string(),
  password: z.string(),
})), async (c) => {
  const { username, password } = c.req.valid("json")
  try {
    const [newUser] = await db.insert(users).values({
      username,
      password, // In real app, hash this
      role: "player"
    }).returning()
    return c.json({ user: { id: newUser.id, username: newUser.username } })
  } catch (e) {
    return c.json({ error: "Username already exists" }, 400)
  }
})

auth.post("/login", zValidator("json", z.object({
  username: z.string(),
  password: z.string(),
})), async (c) => {
  const { username, password } = c.req.valid("json")
  const user = await db.query.users.findFirst({
    where: (u, { eq, and }) => and(eq(u.username, username), eq(u.password, password))
  })

  if (!user) return c.json({ error: "Invalid credentials" }, 401)

  const token = await createToken({ id: user.id, username: user.username, role: user.role })
  return c.json({ token, user: { id: user.id, username: user.username, role: user.role } })
})

export default auth
