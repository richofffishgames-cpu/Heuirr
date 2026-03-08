import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<"admin" | "player">().default("player").notNull(),
});

export const platforms = sqliteTable("platforms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  playUrl: text("play_url").notNull(),
});

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  platformId: integer("platform_id").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
});
