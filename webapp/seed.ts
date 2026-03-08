import { db } from "./src/db";
import { users, platforms } from "./src/db/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed Admin User
  await db.insert(users).values({
    username: "admin",
    password: "password",
    role: "admin",
  }).onConflictDoNothing();

  // Seed Player User
  await db.insert(users).values({
    username: "player1",
    password: "password",
    role: "player",
  }).onConflictDoNothing();

  // Seed Platforms
  const platformData = [
    {
      name: "Orion",
      imageUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&auto=format&fit=crop&q=60",
      playUrl: "https://example.com/play/orion",
    },
    {
      name: "Nebula",
      imageUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&auto=format&fit=crop&q=60",
      playUrl: "https://example.com/play/nebula",
    },
    {
      name: "Supernova",
      imageUrl: "https://images.unsplash.com/photo-1614850523592-807211516e6d?w=800&auto=format&fit=crop&q=60",
      playUrl: "https://example.com/play/supernova",
    },
    {
      name: "Stardust",
      imageUrl: "https://images.unsplash.com/photo-1614850523827-023812f8670f?w=800&auto=format&fit=crop&q=60",
      playUrl: "https://example.com/play/stardust",
    }
  ];

  for (const platform of platformData) {
    await db.insert(platforms).values(platform).onConflictDoNothing();
  }

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
