import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { initializeDatabase } from "./schema";

const globalForDb = globalThis as unknown as {
  __resumeos_db?: Database.Database;
};

export function getDatabasePath(): string {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  return path.join(process.cwd(), "data", "resumeos.db");
}

export function createDatabaseConnection(dbPath: string = getDatabasePath()): Database.Database {
  if (dbPath !== ":memory:") {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(dbPath);

  // Configure SQLite options
  db.pragma("foreign_keys = ON");
  if (dbPath !== ":memory:") {
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
  }

  // Ensure tables and initial state exist
  initializeDatabase(db);

  return db;
}

export function getDb(): Database.Database {
  if (process.env.NODE_ENV === "production") {
    return createDatabaseConnection();
  }

  if (!globalForDb.__resumeos_db) {
    globalForDb.__resumeos_db = createDatabaseConnection();
  }

  return globalForDb.__resumeos_db;
}

export const db = getDb();
