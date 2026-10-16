"use client";

import React from "react";
import { Loader2, Sliders, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SectionRow } from "./section-row";
import { BuilderPreview } from "./builder-preview";
import { updateResumeAction } from "@/lib/actions/resumes.actions";
import type { Resume, ResumeDraft, ResumeDraftSection } from "@/lib/types/resume";
import type { VaultItem } from "@/lib/types/vault";

type BuilderClientProps = {
  resume: Resume;
  allVaultItems: VaultItem[];
};

function moveItem<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  if (toIndex < 0 || toIndex >= arr.length) return arr;
  const next = [...arr];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

export function BuilderClient({ resume, allVaultItems }: BuilderClientProps) {
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

  // Section mutation helpers
  const updateSection = (
    sectionIndex: number,
    updater: (prev: ResumeDraftSection) => ResumeDraftSection
  ) => {
    updateDraft((prev) => {
      const sections = [...prev.sections];
      sections[sectionIndex] = updater(sections[sectionIndex]);
      return { ...prev, sections };
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar row: title field + saving indicator */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-100 bg-white">
        <label className="text-xs font-medium text-slate-500 shrink-0">
          Professional Title
        </label>
        <Input
          key={resume.id}
          className="max-w-xs h-7 text-sm"
          defaultValue={draft.professionalTitle}
          placeholder="e.g. Senior Software Engineer"
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
        />
        {isSaving ? (
          <span className="flex items-center gap-1 text-xs text-indigo-500 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving…
          </span>
        ) : (
          <span className="text-xs text-slate-400">Auto-saved</span>
        )}
      </div>

      {/* Split panes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Configuration pane */}
        <div className="w-1/2 border-r border-slate-200 bg-white overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <Sliders className="h-4 w-4 text-indigo-600" />
            Resume Configuration
          </div>

          <div className="px-4 py-4 space-y-3">
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
                  updateSection(sectionIndex, (s) => ({ ...s, visible: !s.visible }))
                }
                onRename={(newName) =>
                  updateSection(sectionIndex, (s) => ({ ...s, displayName: newName }))
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
          <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <Eye className="h-4 w-4 text-indigo-600" />
            Preview
          </div>
          <div className="p-8 flex justify-center">
            <BuilderPreview
              resume={resume}
              draft={draft}
              allVaultItems={allVaultItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
