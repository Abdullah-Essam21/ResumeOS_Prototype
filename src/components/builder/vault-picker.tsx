"use client";

import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { VaultItem } from "@/lib/types/vault";

const SECTION_CATEGORY_MAP: Record<string, string[]> = {
  experience: ["experience"],
  projects: ["project"],
  education: ["education"],
  skills: ["skill"],
  certifications: ["certification"],
  achievements: ["achievement"],
};

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

type VaultPickerProps = {
  open: boolean;
  onClose: () => void;
  sectionType: string;
  allVaultItems: VaultItem[];
  alreadySelectedIds: string[];
  onAdd: (vaultItemId: string) => void;
};

export function VaultPicker({
  open,
  onClose,
  sectionType,
  allVaultItems,
  alreadySelectedIds,
  onAdd,
}: VaultPickerProps) {
  const [search, setSearch] = React.useState("");

  const allowedCategories = SECTION_CATEGORY_MAP[sectionType];

  const filtered = allVaultItems.filter((item) => {
    const categoryMatch = allowedCategories
      ? allowedCategories.includes(item.category)
      : true;
    const searchMatch =
      search.trim() === "" ||
      vaultItemSummary(item).toLowerCase().includes(search.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add from Vault</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            className="pl-8"
            placeholder="Search vault items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Results */}
        <div className="mt-2 flex flex-col gap-1 max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              No matching vault items found.
            </p>
          ) : (
            filtered.map((item) => {
              const alreadyAdded = alreadySelectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded hover:bg-slate-50"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-slate-800 truncate">
                      {vaultItemSummary(item)}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      {item.category} · {item.layout}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={alreadyAdded ? "outline" : "default"}
                    disabled={alreadyAdded}
                    className="shrink-0"
                    onClick={() => {
                      onAdd(item.id);
                    }}
                  >
                    {alreadyAdded ? "Added" : "Add"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
