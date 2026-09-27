import type Database from "better-sqlite3";

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY DEFAULT 'default',
  full_name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  location TEXT DEFAULT '',
  website TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vault_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  layout TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  archived_at TEXT DEFAULT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vault_items_category ON vault_items(category);
CREATE INDEX IF NOT EXISTS idx_vault_items_archived ON vault_items(archived_at);
CREATE INDEX IF NOT EXISTS idx_vault_items_display_order ON vault_items(display_order);

CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'classic',
  template_version INTEGER NOT NULL DEFAULT 1,
  draft TEXT NOT NULL,
  archived_at TEXT DEFAULT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resumes_archived ON resumes(archived_at);
CREATE INDEX IF NOT EXISTS idx_resumes_updated ON resumes(updated_at DESC);

CREATE TABLE IF NOT EXISTS resume_versions (
  id TEXT PRIMARY KEY,
  resume_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  template_id TEXT NOT NULL,
  template_version INTEGER NOT NULL DEFAULT 1,
  snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  UNIQUE(resume_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_resume_versions_resume ON resume_versions(resume_id, version_number DESC);
`;

export function initializeDatabase(db: Database.Database): void {
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA_SQL);

  // Initialize a default profile row if none exists
  const existingProfile = db
    .prepare("SELECT id FROM profile WHERE id = 'default'")
    .get();

  if (!existingProfile) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO profile (id, full_name, email, phone, location, website, linkedin_url, github_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "default",
      "Your Name",
      "",
      "",
      "",
      "",
      "",
      "",
      now,
      now
    );
  }
}
