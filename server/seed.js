import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_PATH = path.join(__dirname, "users.json");

async function seed() {
  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash = await bcrypt.hash("user123", 10);
  
  const dummyUsers = {
    "admin@soundmatch.com": {
      name: "Admin User",
      email: "admin@soundmatch.com",
      passwordHash: adminHash,
      role: "admin",
      createdAt: new Date().toISOString()
    },
    "user@soundmatch.com": {
      name: "Test User",
      email: "user@soundmatch.com",
      passwordHash: userHash,
      role: "user",
      createdAt: new Date().toISOString()
    }
  };
  
  await fs.writeFile(USERS_PATH, JSON.stringify(dummyUsers, null, 2), "utf-8");
  console.log("Seeded users.json successfully.");
}

seed().catch(console.error);
