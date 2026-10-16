"use client";

import type { Resume, ResumeDraft } from "@/lib/types/resume";
import type { VaultItem } from "@/lib/types/vault";

function vaultItemSummary(item: VaultItem): string {
  const c = item.content as Record<string, unknown>;
  if (item.layout === "timeline") {
    return `${String(c.organization ?? "")} — ${String(c.title ?? "")}`;
  } else if (item.layout === "record") {
    return String(c.title ?? "");
  } else {
    return `${String(c.category ?? "")} skills`;
  }
}

type BuilderPreviewProps = {
  resume: Resume;
  draft: ResumeDraft;
  allVaultItems: VaultItem[];
};

export function BuilderPreview({ resume, draft, allVaultItems }: BuilderPreviewProps) {
  const vaultMap = new Map<string, VaultItem>();
  for (const v of allVaultItems) {
    vaultMap.set(v.id, v);
  }

  const visibleSections = draft.sections.filter((s) => s.visible);

  return (
    <div className="w-full max-w-[780px] min-h-[1000px] bg-white rounded shadow border border-slate-200 px-14 py-12 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-300 pb-5 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{resume.name}</h1>
        {draft.professionalTitle ? (
          <p className="mt-1 text-base text-indigo-600 font-medium">
            {draft.professionalTitle}
          </p>
        ) : null}
      </div>

      {/* Sections */}
      {visibleSections.length === 0 ? (
        <p className="text-sm text-slate-400 italic text-center pt-10">
          No visible sections yet. Add and enable sections in the left pane.
        </p>
      ) : (
        visibleSections.map((section) => {
          const visibleItems = section.items.filter((i) => i.visible);
          return (
            <div key={section.id} className="mb-7">
              {/* Section heading */}
              <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 border-b border-slate-200 pb-1 mb-3">
                {section.displayName}
              </h2>

              {visibleItems.length === 0 ? (
                <p className="text-xs text-slate-400 italic pl-1">
                  No items in this section.
                </p>
              ) : (
                <ul className="space-y-2">
                  {visibleItems.map((draftItem) => {
                    const vaultItem = vaultMap.get(draftItem.vaultItemId);
                    return (
                      <li key={draftItem.vaultItemId} className="text-sm text-slate-700">
                        {vaultItem ? vaultItemSummary(vaultItem) : `Item ${draftItem.vaultItemId.slice(0, 8)}…`}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
