import { db } from "./db";
import { users, itemGroups } from "@shared/schema";
import bcrypt from "bcryptjs";

async function runSeed() {
  console.log("Seeding database...");
  try {
    // Seed admin
    const passwordHash = await bcrypt.hash("147388", 10);
    await db.insert(users).values({
      username: "admin",
      passwordHash,
      displayName: "Administrador",
      role: "ADMIN",
      isActive: true,
    }).onConflictDoNothing({ target: users.username });

    // Seed some item groups
    await db.insert(itemGroups).values([
      { name: "Eletrônicos" },
      { name: "Mecânicos" },
      { name: "Embalagens" },
      { name: "Matéria-Prima" }
    ]).onConflictDoNothing({ target: itemGroups.name });

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error during seed:", error);
    process.exit(1);
  }
}

runSeed();
