import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { cors } from "hono/cors"
import auth from "./src/api/auth"
import player from "./src/api/player"
import admin from "./src/api/admin"

const app = new Hono()

app.use("*", cors())

app.route("/api/auth", auth)
app.route("/api/player", player)
app.route("/api/admin", admin)

serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
