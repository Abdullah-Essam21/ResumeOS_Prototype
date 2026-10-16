"use client";

import { ChevronUp, ChevronDown, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResumeDraftItem } from "@/lib/types/resume";
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

type ItemRowProps = {
  item: ResumeDraftItem;
  itemIndex: number;
  totalItems: number;
  vaultItem: VaultItem | undefined;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisible: () => void;
  onRemove: () => void;
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
}: ItemRowProps) {
  const summary = vaultItem ? vaultItemSummary(vaultItem) : `Unknown item (${item.vaultItemId.slice(0, 8)}…)`;

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-50 group text-sm">
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
      <span
        className={`flex-1 truncate text-slate-700 ${item.visible ? "" : "line-through text-slate-400"}`}
      >
        {summary}
      </span>

      {/* Actions (revealed on hover) */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onToggleVisible}
          aria-label={item.visible ? "Hide item" : "Show item"}
        >
          {item.visible ? (
            <Eye className="h-3.5 w-3.5 text-slate-500" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-slate-400" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
          onClick={onRemove}
          aria-label="Remove item"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
