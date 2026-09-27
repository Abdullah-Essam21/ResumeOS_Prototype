import type Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { getDb } from "../index";
import {
  VaultItem,
  VaultItemSchema,
  VaultCategory,
  CreateVaultItemInput,
  CreateVaultItemSchema,
  UpdateVaultItemInput,
  UpdateVaultItemSchema,
} from "@/lib/types/vault";

interface VaultItemRow {
  id: string;
  category: string;
  layout: string;
  display_order: number;
  content: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToVaultItem(row: VaultItemRow): VaultItem {
  let parsedContent: unknown;
  try {
    parsedContent = JSON.parse(row.content);
  } catch (err) {
    throw new Error(`Failed to parse content JSON for vault item ${row.id}: ${String(err)}`);
  }

  return VaultItemSchema.parse({
    id: row.id,
    category: row.category,
    layout: row.layout,
    displayOrder: row.display_order,
    content: parsedContent,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export interface GetVaultItemsOptions {
  category?: VaultCategory;
  includeArchived?: boolean;
}

export class VaultRepository {
  constructor(private db: Database.Database = getDb()) {}

  getVaultItems(options: GetVaultItemsOptions = {}): VaultItem[] {
    const { category, includeArchived = false } = options;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (!includeArchived) {
      conditions.push("archived_at IS NULL");
    }

    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const query = `
      SELECT * FROM vault_items
      ${whereClause}
      ORDER BY display_order ASC, created_at DESC
    `;

    const rows = this.db.prepare(query).all(...params) as VaultItemRow[];
    return rows.map(mapRowToVaultItem);
  }

  getVaultItemById(id: string): VaultItem | null {
    const row = this.db
      .prepare<[string], VaultItemRow>("SELECT * FROM vault_items WHERE id = ?")
      .get(id);

    return row ? mapRowToVaultItem(row) : null;
  }

  createVaultItem(input: CreateVaultItemInput): VaultItem {
    const validated = CreateVaultItemSchema.parse(input);
    const id = randomUUID();
    const now = new Date().toISOString();
    const contentJson = JSON.stringify(validated.content);

    this.db
      .prepare(
        `
        INSERT INTO vault_items (
          id, category, layout, display_order, content, archived_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?)
      `
      )
      .run(
        id,
        validated.category,
        validated.layout,
        validated.displayOrder ?? 0,
        contentJson,
        now,
        now
      );

    const created = this.getVaultItemById(id);
    if (!created) {
      throw new Error(`Failed to retrieve newly created vault item ${id}`);
    }
    return created;
  }

  updateVaultItem(id: string, input: UpdateVaultItemInput): VaultItem | null {
    const existing = this.getVaultItemById(id);
    if (!existing) {
      return null;
    }

    const validated = UpdateVaultItemSchema.parse(input);
    const now = new Date().toISOString();

    const updatedCategory = validated.category ?? existing.category;
    const updatedLayout = validated.layout ?? existing.layout;
    const updatedDisplayOrder = validated.displayOrder ?? existing.displayOrder;
    const mergedContent = validated.content
      ? { ...(existing.content as Record<string, unknown>), ...(validated.content as Record<string, unknown>) }
      : existing.content;
    const updatedContent = JSON.stringify(mergedContent);

    this.db
      .prepare(
        `
        UPDATE vault_items
        SET category = ?,
            layout = ?,
            display_order = ?,
            content = ?,
            updated_at = ?
        WHERE id = ?
      `
      )
      .run(
        updatedCategory,
        updatedLayout,
        updatedDisplayOrder,
        updatedContent,
        now,
        id
      );

    return this.getVaultItemById(id);
  }

  archiveVaultItem(id: string): VaultItem | null {
    const now = new Date().toISOString();
    this.db
      .prepare("UPDATE vault_items SET archived_at = ?, updated_at = ? WHERE id = ?")
      .run(now, now, id);

    return this.getVaultItemById(id);
  }

  unarchiveVaultItem(id: string): VaultItem | null {
    const now = new Date().toISOString();
    this.db
      .prepare("UPDATE vault_items SET archived_at = NULL, updated_at = ? WHERE id = ?")
      .run(now, id);

    return this.getVaultItemById(id);
  }

  deleteVaultItem(id: string): boolean {
    const result = this.db.prepare("DELETE FROM vault_items WHERE id = ?").run(id);
    return result.changes > 0;
  }
}

export const vaultRepository = new VaultRepository();
