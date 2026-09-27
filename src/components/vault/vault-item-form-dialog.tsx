"use client";

import * as React from "react";
import {
  VaultItem,
  VaultCategory,
  VaultLayout,
  TimelineContent,
  RecordContent,
  TagsContent,
} from "@/lib/types/vault";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createVaultItemAction,
  updateVaultItemAction,
} from "@/lib/actions/vault.actions";
import { Plus, Trash2, Loader2, Sparkles } from "lucide-react";

interface VaultItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: VaultItem | null;
  defaultCategory?: VaultCategory;
  onSaved?: () => void;
}

const CATEGORIES: { label: string; value: VaultCategory; defaultLayout: VaultLayout }[] = [
  { label: "Experience", value: "experience", defaultLayout: "timeline" },
  { label: "Education", value: "education", defaultLayout: "timeline" },
  { label: "Projects", value: "project", defaultLayout: "timeline" },
  { label: "Certifications", value: "certification", defaultLayout: "record" },
  { label: "Achievements", value: "achievement", defaultLayout: "record" },
  { label: "Skills", value: "skill", defaultLayout: "tags" },
  { label: "Custom", value: "custom", defaultLayout: "timeline" },
];

function VaultItemInnerForm({
  editingItem,
  defaultCategory = "experience",
  onClose,
  onSaved,
}: {
  editingItem?: VaultItem | null;
  defaultCategory?: VaultCategory;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [category, setCategory] = React.useState<VaultCategory>(() => {
    return editingItem ? editingItem.category : defaultCategory;
  });

  const [layout, setLayout] = React.useState<VaultLayout>(() => {
    if (editingItem) return editingItem.layout;
    const match = CATEGORIES.find((c) => c.value === defaultCategory);
    return match?.defaultLayout || "timeline";
  });

  // Timeline layout fields
  const [timelineOrg, setTimelineOrg] = React.useState(() => {
    if (editingItem && editingItem.layout === "timeline") {
      return (editingItem.content as TimelineContent).organization || "";
    }
    return "";
  });
  const [timelineTitle, setTimelineTitle] = React.useState(() => {
    if (editingItem && editingItem.layout === "timeline") {
      return (editingItem.content as TimelineContent).title || "";
    }
    return "";
  });
  const [timelineStartDate, setTimelineStartDate] = React.useState(() => {
    if (editingItem && editingItem.layout === "timeline") {
      return (editingItem.content as TimelineContent).startDate || "";
    }
    return "";
  });
  const [timelineEndDate, setTimelineEndDate] = React.useState(() => {
    if (editingItem && editingItem.layout === "timeline") {
      return (editingItem.content as TimelineContent).endDate || "";
    }
    return "";
  });
  const [timelineLocation, setTimelineLocation] = React.useState(() => {
    if (editingItem && editingItem.layout === "timeline") {
      return (editingItem.content as TimelineContent).location || "";
    }
    return "";
  });
  const [timelineBullets, setTimelineBullets] = React.useState<string[]>(() => {
    if (editingItem && editingItem.layout === "timeline") {
      const bullets = (editingItem.content as TimelineContent).bullets;
      return bullets && bullets.length > 0 ? bullets : [""];
    }
    return [""];
  });

  // Record layout fields
  const [recordTitle, setRecordTitle] = React.useState(() => {
    if (editingItem && editingItem.layout === "record") {
      return (editingItem.content as RecordContent).title || "";
    }
    return "";
  });
  const [recordIssuer, setRecordIssuer] = React.useState(() => {
    if (editingItem && editingItem.layout === "record") {
      return (editingItem.content as RecordContent).issuer || "";
    }
    return "";
  });
  const [recordDate, setRecordDate] = React.useState(() => {
    if (editingItem && editingItem.layout === "record") {
      return (editingItem.content as RecordContent).date || "";
    }
    return "";
  });
  const [recordLink, setRecordLink] = React.useState(() => {
    if (editingItem && editingItem.layout === "record") {
      return (editingItem.content as RecordContent).link || "";
    }
    return "";
  });
  const [recordDesc, setRecordDesc] = React.useState(() => {
    if (editingItem && editingItem.layout === "record") {
      return (editingItem.content as RecordContent).description || "";
    }
    return "";
  });

  // Tags layout fields
  const [tagsGroup, setTagsGroup] = React.useState(() => {
    if (editingItem && editingItem.layout === "tags") {
      return (editingItem.content as TagsContent).category || "";
    }
    return "";
  });
  const [tagsListString, setTagsListString] = React.useState(() => {
    if (editingItem && editingItem.layout === "tags") {
      const tags = (editingItem.content as TagsContent).tags;
      return tags ? tags.join(", ") : "";
    }
    return "";
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleCategoryChange = (newCat: VaultCategory) => {
    setCategory(newCat);
    if (!editingItem) {
      const match = CATEGORIES.find((c) => c.value === newCat);
      if (match) {
        setLayout(match.defaultLayout);
      }
    }
  };

  const handleAddBullet = () => {
    setTimelineBullets((prev) => [...prev, ""]);
  };

  const handleUpdateBullet = (index: number, val: string) => {
    setTimelineBullets((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleRemoveBullet = (index: number) => {
    setTimelineBullets((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : [""];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    let content: TimelineContent | RecordContent | TagsContent;

    if (layout === "timeline") {
      const filteredBullets = timelineBullets
        .map((b) => b.trim())
        .filter((b) => b.length > 0);
      content = {
        organization: timelineOrg.trim(),
        title: timelineTitle.trim(),
        startDate: timelineStartDate.trim(),
        endDate: timelineEndDate.trim(),
        location: timelineLocation.trim(),
        bullets: filteredBullets,
      };
    } else if (layout === "record") {
      content = {
        title: recordTitle.trim(),
        issuer: recordIssuer.trim(),
        date: recordDate.trim(),
        link: recordLink.trim(),
        description: recordDesc.trim(),
      };
    } else {
      const tags = tagsListString
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      content = {
        category: tagsGroup.trim(),
        tags: tags,
      };
    }

    try {
      if (editingItem) {
        const res = await updateVaultItemAction(editingItem.id, {
          category,
          layout,
          content,
        });
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createVaultItemAction({
          category,
          layout,
          content,
        });
        if (!res.success) throw new Error(res.error);
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[75vh] overflow-y-auto px-1">
      {errorMsg && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Category & Layout Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            value={category}
            onChange={(e) =>
              handleCategoryChange(e.target.value as VaultCategory)
            }
            className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="layout">Layout Type *</Label>
          <select
            id="layout"
            value={layout}
            onChange={(e) => setLayout(e.target.value as VaultLayout)}
            className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <option value="timeline">Timeline (Org, Role, Dates, Bullets)</option>
            <option value="record">Record (Title, Issuer, Date, Link)</option>
            <option value="tags">Tags (Skill Group, Chip List)</option>
          </select>
        </div>
      </div>

      {/* Dynamic Content Fields based on Layout */}
      {layout === "timeline" && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="timelineTitle">Title / Role / Degree *</Label>
              <Input
                id="timelineTitle"
                required
                placeholder="e.g. Data Intern, B.Sc. Computer Science"
                value={timelineTitle}
                onChange={(e) => setTimelineTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timelineOrg">Organization / Company / School *</Label>
              <Input
                id="timelineOrg"
                required
                placeholder="e.g. CIB, Cairo University"
                value={timelineOrg}
                onChange={(e) => setTimelineOrg(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="timelineStartDate">Start Date</Label>
              <Input
                id="timelineStartDate"
                placeholder="e.g. Aug 2024"
                value={timelineStartDate}
                onChange={(e) => setTimelineStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timelineEndDate">End Date</Label>
              <Input
                id="timelineEndDate"
                placeholder="e.g. Present, Sep 2025"
                value={timelineEndDate}
                onChange={(e) => setTimelineEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timelineLocation">Location</Label>
              <Input
                id="timelineLocation"
                placeholder="e.g. Cairo, Egypt (or Remote)"
                value={timelineLocation}
                onChange={(e) => setTimelineLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Accomplishment Bullets</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddBullet}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Bullet
              </Button>
            </div>
            <div className="space-y-2">
              {timelineBullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-xs text-slate-400 mt-2 font-mono">
                    {idx + 1}.
                  </span>
                  <Input
                    value={bullet}
                    onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                    placeholder="Action verb + context + measurable result..."
                    className="flex-1 text-xs"
                  />
                  {timelineBullets.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveBullet(idx)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {layout === "record" && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="recordTitle">Title / Name *</Label>
              <Input
                id="recordTitle"
                required
                placeholder="e.g. Google Data Analytics Certificate"
                value={recordTitle}
                onChange={(e) => setRecordTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recordIssuer">Issuer / Organization</Label>
              <Input
                id="recordIssuer"
                placeholder="e.g. Google / Coursera, NASA"
                value={recordIssuer}
                onChange={(e) => setRecordIssuer(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="recordDate">Date / Year</Label>
              <Input
                id="recordDate"
                placeholder="e.g. 2025"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recordLink">Credential / External Link</Label>
              <Input
                id="recordLink"
                placeholder="https://..."
                value={recordLink}
                onChange={(e) => setRecordLink(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recordDesc">Description</Label>
            <Textarea
              id="recordDesc"
              placeholder="Key competencies, scope, or details..."
              value={recordDesc}
              onChange={(e) => setRecordDesc(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      )}

      {layout === "tags" && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <Label htmlFor="tagsGroup">Category / Group Name *</Label>
            <Input
              id="tagsGroup"
              required
              placeholder="e.g. Programming, BI Tools, Cloud & Databases"
              value={tagsGroup}
              onChange={(e) => setTagsGroup(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagsListString">Tags (comma-separated) *</Label>
            <Input
              id="tagsListString"
              required
              placeholder="Python, SQL, Power BI, DAX, Excel"
              value={tagsListString}
              onChange={(e) => setTagsListString(e.target.value)}
            />
            <p className="text-[11px] text-slate-500">
              Separate each skill or tool with a comma.
            </p>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              Saving...
            </>
          ) : editingItem ? (
            "Save Changes"
          ) : (
            "Add to Vault"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function VaultItemFormDialog({
  open,
  onOpenChange,
  editingItem,
  defaultCategory = "experience",
  onSaved,
}: VaultItemFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>
                {editingItem ? "Edit Vault Item" : "Add Career Vault Item"}
              </DialogTitle>
              <DialogDescription>
                Store reusable career records that can be referenced by any resume variant.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {open && (
          <VaultItemInnerForm
            key={editingItem ? editingItem.id : `new-${defaultCategory}`}
            editingItem={editingItem}
            defaultCategory={defaultCategory}
            onClose={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
