import type Database from "better-sqlite3";
import { getDb } from "../index";
import {
  Profile,
  ProfileSchema,
  UpdateProfileInput,
  UpdateProfileSchema,
} from "@/lib/types/profile";

interface ProfileRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToProfile(row: ProfileRow): Profile {
  return ProfileSchema.parse({
    id: row.id,
    fullName: row.full_name,
    email: row.email || "",
    phone: row.phone || "",
    location: row.location || "",
    website: row.website || "",
    linkedinUrl: row.linkedin_url || "",
    githubUrl: row.github_url || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export class ProfileRepository {
  constructor(private db: Database.Database = getDb()) {}

  getProfile(): Profile {
    const row = this.db
      .prepare<[], ProfileRow>("SELECT * FROM profile WHERE id = 'default'")
      .get();

    if (!row) {
      throw new Error("Default profile row not found in database.");
    }

    return mapRowToProfile(row);
  }

  updateProfile(input: UpdateProfileInput): Profile {
    const validated = UpdateProfileSchema.parse(input);
    const now = new Date().toISOString();

    this.db
      .prepare(
        `
        UPDATE profile
        SET full_name = ?,
            email = ?,
            phone = ?,
            location = ?,
            website = ?,
            linkedin_url = ?,
            github_url = ?,
            updated_at = ?
        WHERE id = 'default'
      `
      )
      .run(
        validated.fullName,
        validated.email || "",
        validated.phone || "",
        validated.location || "",
        validated.website || "",
        validated.linkedinUrl || "",
        validated.githubUrl || "",
        now
      );

    return this.getProfile();
  }
}

export const profileRepository = new ProfileRepository();
