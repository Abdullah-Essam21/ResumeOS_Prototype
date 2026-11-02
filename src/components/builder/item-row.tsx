"use client";

import { ChevronUp, ChevronDown, Eye, EyeOff, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResumeDraftItem, ResumeItemOverrides } from "@/lib/types/resume";
import type { VaultItem } from "@/lib/types/vault";

function vaultItemSummary(item: VaultItem, overrides: ResumeItemOverrides = {}): string {
  const c = item.content as Record<string, unknown>;
  const o = overrides as Record<string, unknown>;

  const displayOrg = String(o.organization ?? c.organization ?? "");
  const displayTitle = String(o.title ?? c.title ?? "");

  if (item.layout === "timeline") {
    return `${displayOrg} — ${displayTitle}`;
  } else if (item.layout === "record") {
    return displayTitle || String(c.title ?? "");
  } else {
    return `${String(c.category ?? "")} skills`;
  }
}

type ItemRowProps = {
  item: ResumeDraftItem;
  itemIndex: number;
  totalItems: number;
  vaultItem: VaultItem | undefined;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisible: () => void;
  onRemove: () => void;
  onOpenOverrides: () => void;
};

export function ItemRow({
  item,
  itemIndex,
  totalItems,
  vaultItem,
  onMoveUp,
  onMoveDown,
  onToggleVisible,
  onRemove,
  onOpenOverrides,
}: ItemRowProps) {
  const hasOverrides = item.overrides && Object.keys(item.overrides).length > 0;
  const summary = vaultItem
    ? vaultItemSummary(vaultItem, item.overrides)
    : `Unknown item (${item.vaultItemId.slice(0, 8)}…)`;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-50 group text-sm">
      {/* Reorder */}
      <div className="flex flex-col shrink-0">
        <button
          onClick={onMoveUp}
          disabled={itemIndex === 0}
          className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Move item up"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={itemIndex === totalItems - 1}
          className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Move item down"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Summary text */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span
          className={`truncate text-slate-700 ${item.visible ? "" : "line-through text-slate-400"}`}
        >
          {summary}
        </span>
        {hasOverrides && (
          <span
            className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0"
            title="Has variant-specific content overrides"
          >
            Tailored
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        {/* Tailor / Override button */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 ${
            hasOverrides
              ? "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              : "text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
          }`}
          onClick={onOpenOverrides}
          title="Tailor content for this resume"
          aria-label="Tailor content"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </Button>

        {/* Visibility toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onToggleVisible}
          aria-label={item.visible ? "Hide item" : "Show item"}
          title={item.visible ? "Hide item" : "Show item"}
        >
          {item.visible ? (
            <Eye className="h-3.5 w-3.5 text-slate-500" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-slate-400" />
          )}
        </Button>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-slate-400 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
          aria-label="Remove item"
          title="Remove from this section"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
