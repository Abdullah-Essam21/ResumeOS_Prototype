import { Profile } from "@/lib/types/profile";
import { VaultItem } from "@/lib/types/vault";
import {
  Resume,
  ResumeSnapshot,
  ResumeSnapshotSchema,
  ResolvedResumeSection,
  ResolvedResumeItem,
} from "@/lib/types/resume";

/**
 * Resolves a Resume draft into a self-contained, normalized ResumeSnapshot.
 * Resolves all referenced Career Vault items and merges item-level overrides
 * into `resolvedContent`.
 */
export function resolveResumeSnapshot(
  resume: Resume,
  profile: Profile,
  vaultItems: VaultItem[]
): ResumeSnapshot {
  const vaultMap = new Map<string, VaultItem>();
  for (const item of vaultItems) {
    vaultMap.set(item.id, item);
  }

  const resolvedSections: ResolvedResumeSection[] = resume.draft.sections.map((section) => {
    const resolvedItems: ResolvedResumeItem[] = section.items
      .map((draftItem) => {
        const vaultItem = vaultMap.get(draftItem.vaultItemId);
        if (!vaultItem) {
          // If vault item is not found, return an empty placeholder
          return {
            vaultItemId: draftItem.vaultItemId,
            category: section.type,
            layout: "record",
            content: {},
            overrides: draftItem.overrides ?? {},
            resolvedContent: { ...draftItem.overrides },
          };
        }

        const rawContent = vaultItem.content as Record<string, unknown>;
        const overrides = (draftItem.overrides ?? {}) as Record<string, unknown>;

        // Clean overrides: only include defined, non-empty keys
        const effectiveOverrides: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(overrides)) {
          if (value !== undefined && value !== null && value !== "") {
            effectiveOverrides[key] = value;
          }
        }

        const resolvedContent: Record<string, unknown> = {
          ...rawContent,
          ...effectiveOverrides,
        };

        return {
          vaultItemId: vaultItem.id,
          category: vaultItem.category,
          layout: vaultItem.layout,
          content: rawContent,
          overrides: draftItem.overrides ?? {},
          resolvedContent,
        };
      });

    return {
      id: section.id,
      type: section.type,
      displayName: section.displayName,
      visible: section.visible,
      items: resolvedItems,
    };
  });

  const rawSnapshot = {
    schemaVersion: 1,
    templateId: resume.templateId || "classic",
    templateVersion: resume.templateVersion || 1,
    profile,
    professionalTitle: resume.draft.professionalTitle || "",
    sections: resolvedSections,
  };

  return ResumeSnapshotSchema.parse(rawSnapshot);
}
