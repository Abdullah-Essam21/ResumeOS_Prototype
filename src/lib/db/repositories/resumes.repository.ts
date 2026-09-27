import type Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { getDb } from "../index";
import {
  Resume,
  ResumeSchema,
  ResumeDraft,
  ResumeDraftSchema,
  CreateResumeInput,
  CreateResumeSchema,
} from "@/lib/types/resume";

interface ResumeRow {
  id: string;
  name: string;
  template_id: string;
  template_version: number;
  draft: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToResume(row: ResumeRow): Resume {
  let parsedDraft: unknown;
  try {
    parsedDraft = JSON.parse(row.draft);
  } catch (err) {
    throw new Error(`Failed to parse draft JSON for resume ${row.id}: ${String(err)}`);
  }

  return ResumeSchema.parse({
    id: row.id,
    name: row.name,
    templateId: row.template_id,
    templateVersion: row.template_version,
    draft: parsedDraft,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export interface GetResumesOptions {
  includeArchived?: boolean;
}

export interface UpdateResumeInput {
  name?: string;
  templateId?: string;
  templateVersion?: number;
  draft?: ResumeDraft;
}

export class ResumesRepository {
  constructor(private db: Database.Database = getDb()) {}

  getResumes(options: GetResumesOptions = {}): Resume[] {
    const { includeArchived = false } = options;
    const query = includeArchived
      ? "SELECT * FROM resumes ORDER BY updated_at DESC"
      : "SELECT * FROM resumes WHERE archived_at IS NULL ORDER BY updated_at DESC";

    const rows = this.db.prepare(query).all() as ResumeRow[];
    return rows.map(mapRowToResume);
  }

  getResumeById(id: string): Resume | null {
    const row = this.db
      .prepare<[string], ResumeRow>("SELECT * FROM resumes WHERE id = ?")
      .get(id);

    return row ? mapRowToResume(row) : null;
  }

  createResume(input: CreateResumeInput): Resume {
    const validated = CreateResumeSchema.parse(input);
    const id = randomUUID();
    const now = new Date().toISOString();

    const initialDraft: ResumeDraft = validated.draft ?? {
      professionalTitle: "",
      sections: [],
    };
    const draftJson = JSON.stringify(initialDraft);

    this.db
      .prepare(
        `
        INSERT INTO resumes (
          id, name, template_id, template_version, draft, archived_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?)
      `
      )
      .run(
        id,
        validated.name,
        validated.templateId ?? "classic",
        validated.templateVersion ?? 1,
        draftJson,
        now,
        now
      );

    const created = this.getResumeById(id);
    if (!created) {
      throw new Error(`Failed to retrieve newly created resume ${id}`);
    }
    return created;
  }

  updateResume(id: string, input: UpdateResumeInput): Resume | null {
    const existing = this.getResumeById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const updatedName = input.name ?? existing.name;
    const updatedTemplateId = input.templateId ?? existing.templateId;
    const updatedTemplateVersion = input.templateVersion ?? existing.templateVersion;

    let updatedDraftJson = JSON.stringify(existing.draft);
    if (input.draft) {
      const validatedDraft = ResumeDraftSchema.parse(input.draft);
      updatedDraftJson = JSON.stringify(validatedDraft);
    }

    this.db
      .prepare(
        `
        UPDATE resumes
        SET name = ?,
            template_id = ?,
            template_version = ?,
            draft = ?,
            updated_at = ?
        WHERE id = ?
      `
      )
      .run(
        updatedName,
        updatedTemplateId,
        updatedTemplateVersion,
        updatedDraftJson,
        now,
        id
      );

    return this.getResumeById(id);
  }

  duplicateResume(id: string, newName?: string): Resume {
    const original = this.getResumeById(id);
    if (!original) {
      throw new Error(`Cannot duplicate resume: resume ${id} not found.`);
    }

    const duplicateName = newName?.trim() || `${original.name} (Copy)`;
    // Create deep copy of draft
    const clonedDraft: ResumeDraft = JSON.parse(JSON.stringify(original.draft));

    return this.createResume({
      name: duplicateName,
      templateId: original.templateId,
      templateVersion: original.templateVersion,
      draft: clonedDraft,
    });
  }

  archiveResume(id: string): Resume | null {
    const now = new Date().toISOString();
    this.db
      .prepare("UPDATE resumes SET archived_at = ?, updated_at = ? WHERE id = ?")
      .run(now, now, id);

    return this.getResumeById(id);
  }

  unarchiveResume(id: string): Resume | null {
    const now = new Date().toISOString();
    this.db
      .prepare("UPDATE resumes SET archived_at = NULL, updated_at = ? WHERE id = ?")
      .run(now, id);

    return this.getResumeById(id);
  }

  deleteResume(id: string): boolean {
    const result = this.db.prepare("DELETE FROM resumes WHERE id = ?").run(id);
    return result.changes > 0;
  }
}

export const resumesRepository = new ResumesRepository();
