import { seedDatabase } from "../lib/db/seed";
import { getDb } from "../lib/db";

console.log("Seeding ResumeOS database...");
const db = getDb();
seedDatabase(db);
console.log("Database seeded successfully!");
