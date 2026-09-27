"use client";

import * as React from "react";
import {
  VaultItem,
  VaultCategory,
  TimelineContent,
  RecordContent,
  TagsContent,
} from "@/lib/types/vault";
import { VaultItemCard } from "./vault-item-card";
import { VaultItemFormDialog } from "./vault-item-form-dialog";
import {
  archiveVaultItemAction,
  unarchiveVaultItemAction,
  deleteVaultItemAction,
} from "@/lib/actions/vault.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Plus,
  Search,
  Archive,
  Layers,
} from "lucide-react";

interface VaultViewProps {
  initialItems: VaultItem[];
}

const CATEGORY_TABS: { label: string; value: "all" | VaultCategory }[] = [
  { label: "All Items", value: "all" },
  { label: "Experience", value: "experience" },
  { label: "Education", value: "education" },
  { label: "Projects", value: "project" },
  { label: "Certifications", value: "certification" },
  { label: "Achievements", value: "achievement" },
  { label: "Skills", value: "skill" },
];

export function VaultView({ initialItems }: VaultViewProps) {
  const [items, setItems] = React.useState<VaultItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = React.useState<"all" | VaultCategory>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showArchived, setShowArchived] = React.useState(false);

  // Dialog State
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<VaultItem | null>(null);


  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (item: VaultItem) => {
    setEditingItem(item);
    setFormDialogOpen(true);
  };

  const handleArchive = async (id: string) => {
    const res = await archiveVaultItemAction(id);
    if (res.success && res.data) {
      setItems((prev) => prev.map((item) => (item.id === id ? res.data! : item)));
    }
  };

  const handleUnarchive = async (id: string) => {
    const res = await unarchiveVaultItemAction(id);
    if (res.success && res.data) {
      setItems((prev) => prev.map((item) => (item.id === id ? res.data! : item)));
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this vault item? (Tip: You can archive it instead to keep it available for future variants)."
    );
    if (!confirmDelete) return;

    const res = await deleteVaultItemAction(id);
    if (res.success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    // 1. Archive filter
    const isArchived = Boolean(item.archivedAt);
    if (!showArchived && isArchived) return false;
    if (showArchived && !isArchived) return true; // Show both if toggle on

    // 2. Category filter
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false;
    }

    // 3. Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();

    if (item.layout === "timeline") {
      const c = item.content as TimelineContent;
      return (
        c.title?.toLowerCase().includes(q) ||
        c.organization?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.bullets?.some((b) => b.toLowerCase().includes(q))
      );
    } else if (item.layout === "record") {
      const c = item.content as RecordContent;
      return (
        c.title?.toLowerCase().includes(q) ||
        c.issuer?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    } else if (item.layout === "tags") {
      const c = item.content as TagsContent;
      return (
        c.category?.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return false;
  });

  const totalActiveCount = items.filter((i) => !i.archivedAt).length;
  const totalArchivedCount = items.filter((i) => i.archivedAt).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Database className="h-6 w-6 text-indigo-600" />
              Career Vault
            </h1>
            <Badge variant="default" className="font-mono text-xs">
              {totalActiveCount} Active
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Maintain your professional data once. Assemble variants anytime without rewriting.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="shadow-xs">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Vault Item
        </Button>
      </div>

      {/* Filter Tabs, Search Bar, and Archive Toggle */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.value;
              const count =
                tab.value === "all"
                  ? items.filter((i) => (showArchived ? true : !i.archivedAt)).length
                  : items.filter(
                      (i) =>
                        i.category === tab.value &&
                        (showArchived ? true : !i.archivedAt)
                    ).length;

              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedCategory(tab.value)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isActive
                        ? "bg-indigo-500/40 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vault..."
                className="h-9 w-48 sm:w-64 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Show Archived Toggle */}
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                showArchived
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Archived ({totalArchivedCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vault Items Grid / Empty State */}
      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {searchQuery || selectedCategory !== "all"
              ? "No matching items found"
              : "No items in Career Vault yet"}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== "all"
              ? "Try clearing your search query or selecting another category filter."
              : "Add your experiences, education, projects, certifications, or skills to build your vault."}
          </p>
          <div className="mt-6">
            <Button onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add First Item
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <VaultItemCard
              key={item.id}
              item={item}
              onEdit={handleOpenEdit}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Vault Item Form Dialog */}
      <VaultItemFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        editingItem={editingItem}
        defaultCategory={
          selectedCategory === "all" ? "experience" : selectedCategory
        }
        onSaved={() => {
          // Trigger route refresh / local update
          window.location.reload();
        }}
      />
    </div>
  );
}
