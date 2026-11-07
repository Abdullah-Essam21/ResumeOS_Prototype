"use client";

import React from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff, Plus, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemRow } from "./item-row";
import { VaultPicker } from "./vault-picker";
import { ItemOverrideModal } from "./item-override-modal";
import type { ResumeDraftSection, ResumeItemOverrides, SectionDisplayMode } from "@/lib/types/resume";
import type { VaultItem } from "@/lib/types/vault";

type SectionRowProps = {
  section: ResumeDraftSection;
  sectionIndex: number;
  totalSections: number;
  allVaultItems: VaultItem[];
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisible: () => void;
  onRename: (newName: string) => void;
  onUpdateDisplayMode?: (mode: SectionDisplayMode) => void;
  onItemMoveUp: (itemIndex: number) => void;
  onItemMoveDown: (itemIndex: number) => void;
  onItemToggleVisible: (itemIndex: number) => void;
  onItemRemove: (itemIndex: number) => void;
  onItemUpdateOverrides: (itemIndex: number, overrides: ResumeItemOverrides) => void;
  onAddFromVault: (vaultItemId: string) => void;
};

export function SectionRow({
  section,
  sectionIndex,
  totalSections,
  allVaultItems,
  onMoveUp,
  onMoveDown,
  onToggleVisible,
  onRename,
  onUpdateDisplayMode,
  onItemMoveUp,
  onItemMoveDown,
  onItemToggleVisible,
  onItemRemove,
  onItemUpdateOverrides,
  onAddFromVault,
}: SectionRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [overrideItemIndex, setOverrideItemIndex] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commitRename = () => {
    if (inputRef.current) {
      const newName = inputRef.current.value.trim();
      if (newName && newName !== section.displayName) {
        onRename(newName);
      }
    }
    setIsEditing(false);
  };

  const alreadySelectedIds = section.items.map((i) => i.vaultItemId);

  const vaultItemMap = React.useMemo(() => {
    const map = new Map<string, VaultItem>();
    for (const v of allVaultItems) {
      map.set(v.id, v);
    }
    return map;
  }, [allVaultItems]);

  const isRecordSection =
    section.type === "certifications" ||
    section.type === "achievements" ||
    section.items.some((i) => vaultItemMap.get(i.vaultItemId)?.layout === "record");

  const activeOverrideItem =
    overrideItemIndex !== null ? section.items[overrideItemIndex] : null;
  const activeVaultItem =
    activeOverrideItem ? vaultItemMap.get(activeOverrideItem.vaultItemId) : undefined;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Section header */}
      <div
        className={`flex items-center gap-1 px-3 py-2 bg-slate-50 ${section.visible ? "" : "opacity-60"}`}
      >
        {/* Expand/Collapse toggle */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="p-1 text-slate-500 hover:text-slate-800 rounded"
          aria-label={expanded ? "Collapse section" : "Expand section"}
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Section name (inline edit) */}
        <div className="flex-1 flex items-center gap-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              key={section.id}
              defaultValue={section.displayName}
              className="flex-1 text-sm font-semibold text-slate-800 bg-white border border-indigo-300 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-indigo-400"
              autoFocus
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setIsEditing(false);
              }}
            />
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="text-sm font-semibold text-slate-800 cursor-pointer hover:text-indigo-600 truncate"
              title="Click to rename display title"
            >
              {section.displayName}
            </span>
          )}

          {isEditing ? (
            <button
              onClick={commitRename}
              className="p-1 text-emerald-600 hover:text-emerald-700"
              aria-label="Confirm rename"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100"
              aria-label="Rename section"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          )}

          <span className="text-[11px] text-slate-400 shrink-0 ml-1">
            ({section.items.length})
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={sectionIndex === 0}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move section up"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={sectionIndex === totalSections - 1}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move section down"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onToggleVisible}
            className="p-1 text-slate-400 hover:text-slate-700 ml-1"
            aria-label={section.visible ? "Hide section" : "Show section"}
          >
            {section.visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded items */}
      {expanded ? (
        <div className="px-2 py-2 bg-white border-t border-slate-100 space-y-1">
          {/* Record Display Mode Selector */}
          {isRecordSection && onUpdateDisplayMode && (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 mb-1.5">
              <span className="text-[11px] font-medium text-slate-600">
                Display Style:
              </span>
              <div className="flex items-center gap-1">
                {[
                  { value: "inline", label: "Inline Flow", desc: "Compact pipe-separated (LaTeX style)" },
                  { value: "grid", label: "2-Column Grid", desc: "Balanced parallel columns" },
                  { value: "stacked", label: "Stacked List", desc: "Full-width traditional rows" },
                ].map((m) => {
                  const currentMode = section.displayMode || "stacked";
                  const isActive = currentMode === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => onUpdateDisplayMode(m.value as SectionDisplayMode)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-200"
                      }`}
                      title={m.desc}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {section.items.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">
              No items — add from Vault below.
            </p>
          ) : (
            section.items.map((item, idx) => (
              <ItemRow
                key={item.vaultItemId}
                item={item}
                itemIndex={idx}
                totalItems={section.items.length}
                vaultItem={vaultItemMap.get(item.vaultItemId)}
                onMoveUp={() => onItemMoveUp(idx)}
                onMoveDown={() => onItemMoveDown(idx)}
                onToggleVisible={() => onItemToggleVisible(idx)}
                onRemove={() => onItemRemove(idx)}
                onOpenOverrides={() => setOverrideItemIndex(idx)}
              />
            ))
          )}

          {/* Add from Vault button */}
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-indigo-700 border-indigo-200 hover:bg-indigo-50 text-xs"
              onClick={() => setPickerOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add from Vault
            </Button>
          </div>
        </div>
      ) : null}

      {/* Vault Picker dialog */}
      <VaultPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        sectionType={section.type}
        allVaultItems={allVaultItems}
        alreadySelectedIds={alreadySelectedIds}
        onAdd={(vaultItemId) => {
          onAddFromVault(vaultItemId);
          setPickerOpen(false);
        }}
      />

      {/* Item Override Modal */}
      {overrideItemIndex !== null && activeOverrideItem && (
        <ItemOverrideModal
          open={true}
          onClose={() => setOverrideItemIndex(null)}
          vaultItem={activeVaultItem}
          sectionType={section.type}
          currentOverrides={activeOverrideItem.overrides ?? {}}
          onSaveOverrides={(newOverrides) => {
            onItemUpdateOverrides(overrideItemIndex, newOverrides);
          }}
        />
      )}
    </div>
  );
}
