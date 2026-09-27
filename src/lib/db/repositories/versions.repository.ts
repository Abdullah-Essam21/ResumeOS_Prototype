import type Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { getDb } from "../index";
import {
  ResumeVersion,
  ResumeVersionSchema,
  ResumeSnapshot,
  ResumeSnapshotSchema,
  ResumeDraft,
} from "@/lib/types/resume";
import { resumesRepository, ResumesRepository } from "./resumes.repository";

interface ResumeVersionRow {
  id: string;
  resume_id: string;
  version_number: number;
  schema_version: number;
  template_id: string;
  template_version: number;
  snapshot: string;
  created_at: string;
}

function mapRowToResumeVersion(row: ResumeVersionRow): ResumeVersion {
  let parsedSnapshot: unknown;
  try {
    parsedSnapshot = JSON.parse(row.snapshot);
  } catch (err) {
    throw new Error(
      `Failed to parse snapshot JSON for version ${row.id}: ${String(err)}`
    );
  }

  return ResumeVersionSchema.parse({
    id: row.id,
    resumeId: row.resume_id,
    versionNumber: row.version_number,
    schemaVersion: row.schema_version,
    templateId: row.template_id,
    templateVersion: row.template_version,
    snapshot: parsedSnapshot,
    createdAt: row.created_at,
  });
}

export class VersionsRepository {
  constructor(
    private db: Database.Database = getDb(),
    private resumesRepo: ResumesRepository = resumesRepository
  ) {}

  getVersionsByResumeId(resumeId: string): ResumeVersion[] {
    const rows = this.db
      .prepare(
        `
        SELECT * FROM resume_versions
        WHERE resume_id = ?
        ORDER BY version_number DESC
      `
      )
      .all(resumeId) as ResumeVersionRow[];

    return rows.map(mapRowToResumeVersion);
  }

  getVersionById(id: string): ResumeVersion | null {
    const row = this.db
      .prepare<[string], ResumeVersionRow>(
        "SELECT * FROM resume_versions WHERE id = ?"
      )
      .get(id);

    return row ? mapRowToResumeVersion(row) : null;
  }

  createVersion(resumeId: string, snapshot: ResumeSnapshot): ResumeVersion {
    const validatedSnapshot = ResumeSnapshotSchema.parse(snapshot);
    const id = randomUUID();
    const now = new Date().toISOString();
    const snapshotJson = JSON.stringify(validatedSnapshot);

    // Use a transaction to ensure unique, atomic sequential version numbering
    const transaction = this.db.transaction(() => {
      // Ensure resume exists
      const resumeExists = this.db
        .prepare("SELECT id FROM resumes WHERE id = ?")
        .get(resumeId);

      if (!resumeExists) {
        throw new Error(
          `Cannot create version: Resume with ID ${resumeId} does not exist.`
        );
      }

      // Calculate next version number scoped to this resume
      const maxRow = this.db
        .prepare<[string], { next_version: number }>(
          `
          SELECT COALESCE(MAX(version_number), 0) + 1 AS next_version
          FROM resume_versions
          WHERE resume_id = ?
        `
        )
        .get(resumeId);

      const nextVersion = maxRow?.next_version ?? 1;

      this.db
        .prepare(
          `
          INSERT INTO resume_versions (
            id, resume_id, version_number, schema_version, template_id, template_version, snapshot, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `
        )
        .run(
          id,
          resumeId,
          nextVersion,
          validatedSnapshot.schemaVersion,
          validatedSnapshot.templateId,
          validatedSnapshot.templateVersion,
          snapshotJson,
          now
        );
    });

    transaction();

    const created = this.getVersionById(id);
    if (!created) {
      throw new Error(`Failed to retrieve newly created resume version ${id}`);
    }
    return created;
  }

  /**
   * Restores an immutable version back into the resume's mutable draft.
   * Invariant: Does NOT modify the historical version itself.
   */
  restoreVersion(versionId: string): ResumeDraft {
    const version = this.getVersionById(versionId);
    if (!version) {
      throw new Error(`Version ${versionId} not found.`);
    }

    const { snapshot } = version;

    // Convert resolved snapshot structure back into an editable draft configuration
    const restoredDraft: ResumeDraft = {
      professionalTitle: snapshot.professionalTitle,
      sections: snapshot.sections.map((section) => ({
        id: section.id,
        type: section.type,
        displayName: section.displayName,
        visible: section.visible,
        items: section.items.map((item) => ({
          vaultItemId: item.vaultItemId,
          visible: true,
          overrides: item.overrides,
        })),
      })),
    };

    this.resumesRepo.updateResume(version.resumeId, {
      templateId: snapshot.templateId,
      templateVersion: snapshot.templateVersion,
      draft: restoredDraft,
    });

    return restoredDraft;
  }
}

export const versionsRepository = new VersionsRepository();
