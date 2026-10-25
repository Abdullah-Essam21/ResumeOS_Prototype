"use client";

import React from "react";
import { Loader2, Sliders, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SectionRow } from "./section-row";
import { BuilderPreview } from "./builder-preview";
import { updateResumeAction } from "@/lib/actions/resumes.actions";
import type { Resume, ResumeDraft, ResumeDraftSection } from "@/lib/types/resume";
import type { VaultItem } from "@/lib/types/vault";
import type { Profile } from "@/lib/types/profile";

type BuilderClientProps = {
  resume: Resume;
  allVaultItems: VaultItem[];
  profile?: Profile;
};

function moveItem<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  if (toIndex < 0 || toIndex >= arr.length) return arr;
  const next = [...arr];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

export function BuilderClient({ resume, allVaultItems, profile }: BuilderClientProps) {
  const [draft, setDraft] = React.useState<ResumeDraft>(() => resume.draft);
  const [isSaving, setIsSaving] = React.useState(false);
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = React.useCallback(
    (newDraft: ResumeDraft) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setIsSaving(true);
      saveTimerRef.current = setTimeout(async () => {
        await updateResumeAction(resume.id, { draft: newDraft });
        setIsSaving(false);
      }, 500);
    },
    [resume.id]
  );

  const updateDraft = React.useCallback(
    (updater: (prev: ResumeDraft) => ResumeDraft) => {
      setDraft((prev) => {
        const next = updater(prev);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  // Professional title handlers
  const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newTitle = e.currentTarget.value.trim();
    if (newTitle !== draft.professionalTitle) {
      updateDraft((prev) => ({ ...prev, professionalTitle: newTitle }));
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  // Section-level mutators
  const updateSection = (
    index: number,
    updater: (sec: ResumeDraftSection) => ResumeDraftSection
  ) => {
    updateDraft((prev) => {
      const nextSections = [...prev.sections];
      nextSections[index] = updater(nextSections[index]);
      return { ...prev, sections: nextSections };
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top action/status bar inside builder */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Sliders className="h-3.5 w-3.5 text-slate-400" />
          <span>Resume Configuration</span>
        </div>
        <div>
          {isSaving ? (
            <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </span>
          ) : (
            <span className="text-slate-400">Auto-saved</span>
          )}
        </div>
      </div>

      {/* Main split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Configuration pane */}
        <div className="w-1/2 border-r border-slate-200 bg-white overflow-y-auto p-6 space-y-6">
          {/* Professional Target Title */}
          <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <label
              htmlFor="target-title-input"
              className="text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              Target Professional Title
            </label>
            <p className="text-xs text-slate-500">
              Customize the subtitle heading for this resume variant without touching your Vault.
            </p>
            <Input
              id="target-title-input"
              defaultValue={draft.professionalTitle}
              key={draft.professionalTitle}
              placeholder="e.g. Senior Data Analyst / Power BI Specialist"
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="mt-1 bg-white"
            />
          </div>

          {/* Sections list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Sections & Content ({draft.sections.length})
              </h3>
              <span className="text-xs text-slate-400">Reorder with ▲ ▼</span>
            </div>

            {draft.sections.map((section, sectionIndex) => (
              <SectionRow
                key={section.id}
                section={section}
                sectionIndex={sectionIndex}
                totalSections={draft.sections.length}
                allVaultItems={allVaultItems}
                onMoveUp={() =>
                  updateDraft((prev) => ({
                    ...prev,
                    sections: moveItem(prev.sections, sectionIndex, sectionIndex - 1),
                  }))
                }
                onMoveDown={() =>
                  updateDraft((prev) => ({
                    ...prev,
                    sections: moveItem(prev.sections, sectionIndex, sectionIndex + 1),
                  }))
                }
                onToggleVisible={() =>
                  updateSection(sectionIndex, (s) => ({
                    ...s,
                    visible: !s.visible,
                  }))
                }
                onRename={(newDisplayName) =>
                  updateSection(sectionIndex, (s) => ({
                    ...s,
                    displayName: newDisplayName,
                  }))
                }
                onItemMoveUp={(itemIndex) =>
                  updateSection(sectionIndex, (s) => ({
                    ...s,
                    items: moveItem(s.items, itemIndex, itemIndex - 1),
                  }))
                }
                onItemMoveDown={(itemIndex) =>
                  updateSection(sectionIndex, (s) => ({
                    ...s,
                    items: moveItem(s.items, itemIndex, itemIndex + 1),
                  }))
                }
                onItemToggleVisible={(itemIndex) =>
                  updateSection(sectionIndex, (s) => {
                    const items = [...s.items];
                    items[itemIndex] = {
                      ...items[itemIndex],
                      visible: !items[itemIndex].visible,
                    };
                    return { ...s, items };
                  })
                }
                onItemRemove={(itemIndex) =>
                  updateSection(sectionIndex, (s) => ({
                    ...s,
                    items: s.items.filter((_, i) => i !== itemIndex),
                  }))
                }
                onAddFromVault={(vaultItemId) =>
                  updateSection(sectionIndex, (s) => ({
                    ...s,
                    items: [
                      ...s.items,
                      { vaultItemId, visible: true, overrides: {} },
                    ],
                  }))
                }
              />
            ))}
          </div>
        </div>

        {/* Right: Preview pane */}
        <div className="w-1/2 bg-slate-100 overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-2 text-slate-700 font-semibold text-sm sticky top-0 z-10 shadow-xs">
            <Eye className="h-4 w-4 text-indigo-600" />
            Live Preview (ATS Classic v1)
          </div>
          <div className="p-8 flex justify-center">
            <BuilderPreview
              resume={resume}
              draft={draft}
              allVaultItems={allVaultItems}
              profile={profile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
