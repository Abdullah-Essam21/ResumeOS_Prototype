"use client";

import * as React from "react";
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
import { Sparkles, RotateCcw, Plus, Trash2 } from "lucide-react";
import type { ResumeItemOverrides } from "@/lib/types/resume";
import type { VaultItem, TimelineContent, RecordContent, TagsContent } from "@/lib/types/vault";

export type ItemOverrideModalProps = {
  open: boolean;
  onClose: () => void;
  vaultItem: VaultItem | undefined;
  sectionType: string;
  currentOverrides: ResumeItemOverrides;
  onSaveOverrides: (overrides: ResumeItemOverrides) => void;
};

export function ItemOverrideModal({
  open,
  onClose,
  vaultItem,
  sectionType,
  currentOverrides,
  onSaveOverrides,
}: ItemOverrideModalProps) {
  if (!vaultItem) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent onClose={onClose} className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Tailor for this Resume</DialogTitle>
              <DialogDescription>
                Customize fields for this specific resume. The original Career Vault item will remain untouched (Invariant 2).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <OverrideForm
          key={vaultItem.id}
          vaultItem={vaultItem}
          sectionType={sectionType}
          currentOverrides={currentOverrides}
          onClose={onClose}
          onSave={onSaveOverrides}
        />
      </DialogContent>
    </Dialog>
  );
}

function OverrideForm({
  vaultItem,
  sectionType,
  currentOverrides,
  onClose,
  onSave,
}: {
  vaultItem: VaultItem;
  sectionType: string;
  currentOverrides: ResumeItemOverrides;
  onClose: () => void;
  onSave: (overrides: ResumeItemOverrides) => void;
}) {
  const isTimeline = vaultItem.layout === "timeline";
  const isRecord = vaultItem.layout === "record";
  const isTags = vaultItem.layout === "tags";
  const isProject = sectionType === "projects" || vaultItem.category === "project";

  const timelineContent = isTimeline ? (vaultItem.content as TimelineContent) : null;
  const recordContent = isRecord ? (vaultItem.content as RecordContent) : null;
  const tagsContent = isTags ? (vaultItem.content as TagsContent) : null;

  // Title / Role / Project Name
  const originalTitle = timelineContent?.title || recordContent?.title || "";
  const [overrideTitle, setOverrideTitle] = React.useState<string>(
    currentOverrides.title !== undefined ? String(currentOverrides.title) : ""
  );

  // Organization / Tech stack / School
  const originalOrg = timelineContent?.organization || "";
  const [overrideOrg, setOverrideOrg] = React.useState<string>(
    currentOverrides.organization !== undefined ? String(currentOverrides.organization) : ""
  );

  // Location / CGPA / Subtitle
  const originalLocation = timelineContent?.location || "";
  const [overrideLocation, setOverrideLocation] = React.useState<string>(
    currentOverrides.location !== undefined ? String(currentOverrides.location) : ""
  );

  // Start Date & End Date
  const originalStartDate = timelineContent?.startDate || "";
  const [overrideStartDate, setOverrideStartDate] = React.useState<string>(
    currentOverrides.startDate !== undefined ? String(currentOverrides.startDate) : ""
  );

  const originalEndDate = timelineContent?.endDate || "";
  const [overrideEndDate, setOverrideEndDate] = React.useState<string>(
    currentOverrides.endDate !== undefined ? String(currentOverrides.endDate) : ""
  );

  // Link (GitHub, Company, Credential)
  const originalLink = timelineContent?.link || recordContent?.link || "";
  const [overrideLink, setOverrideLink] = React.useState<string>(
    currentOverrides.link !== undefined ? String(currentOverrides.link) : ""
  );

  const originalLinkLabel = timelineContent?.linkLabel || recordContent?.linkLabel || "";
  const [overrideLinkLabel, setOverrideLinkLabel] = React.useState<string>(
    currentOverrides.linkLabel !== undefined ? String(currentOverrides.linkLabel) : ""
  );

  // Record Issuer & Date & Description
  const originalIssuer = recordContent?.issuer || "";
  const [overrideIssuer, setOverrideIssuer] = React.useState<string>(
    (currentOverrides as Record<string, unknown>).issuer !== undefined
      ? String((currentOverrides as Record<string, unknown>).issuer)
      : ""
  );

  const originalDate = recordContent?.date || "";
  const [overrideDate, setOverrideDate] = React.useState<string>(
    (currentOverrides as Record<string, unknown>).date !== undefined
      ? String((currentOverrides as Record<string, unknown>).date)
      : ""
  );

  const originalDescription = recordContent?.description || "";
  const [overrideDescription, setOverrideDescription] = React.useState<string>(
    currentOverrides.description !== undefined ? String(currentOverrides.description) : ""
  );

  // Bullets (Timeline)
  const originalBullets = timelineContent?.bullets || [];
  const [overrideBullets, setOverrideBullets] = React.useState<string[]>(() => {
    if (Array.isArray(currentOverrides.bullets)) {
      return currentOverrides.bullets;
    }
    return originalBullets.length > 0 ? [...originalBullets] : [""];
  });
  const [hasCustomBullets, setHasCustomBullets] = React.useState<boolean>(() => {
    return Array.isArray(currentOverrides.bullets);
  });

  // Tags (Skills)
  const originalTags = tagsContent?.tags || [];
  const [overrideTagsString, setOverrideTagsString] = React.useState<string>(() => {
    if (Array.isArray(currentOverrides.tags)) {
      return currentOverrides.tags.join(", ");
    }
    return "";
  });

  const handleResetAll = () => {
    setOverrideTitle("");
    setOverrideOrg("");
    setOverrideLocation("");
    setOverrideStartDate("");
    setOverrideEndDate("");
    setOverrideLink("");
    setOverrideLinkLabel("");
    setOverrideIssuer("");
    setOverrideDate("");
    setOverrideDescription("");
    setOverrideBullets([...originalBullets]);
    setHasCustomBullets(false);
    setOverrideTagsString("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newOverrides: ResumeItemOverrides = {};

    if (overrideTitle.trim() && overrideTitle.trim() !== originalTitle) {
      newOverrides.title = overrideTitle.trim();
    }
    if (overrideOrg.trim() && overrideOrg.trim() !== originalOrg) {
      newOverrides.organization = overrideOrg.trim();
    }
    if (overrideLocation.trim() && overrideLocation.trim() !== originalLocation) {
      newOverrides.location = overrideLocation.trim();
    }
    if (overrideStartDate.trim() && overrideStartDate.trim() !== originalStartDate) {
      newOverrides.startDate = overrideStartDate.trim();
    }
    if (overrideEndDate.trim() && overrideEndDate.trim() !== originalEndDate) {
      newOverrides.endDate = overrideEndDate.trim();
    }
    if (overrideLink.trim() && overrideLink.trim() !== originalLink) {
      newOverrides.link = overrideLink.trim();
    }
    if (overrideLinkLabel.trim() && overrideLinkLabel.trim() !== originalLinkLabel) {
      newOverrides.linkLabel = overrideLinkLabel.trim();
    }
    if (overrideIssuer.trim() !== originalIssuer) {
      (newOverrides as Record<string, unknown>).issuer = overrideIssuer.trim();
    }
    if (overrideDate.trim() !== originalDate) {
      (newOverrides as Record<string, unknown>).date = overrideDate.trim();
    }
    if (overrideDescription.trim() && overrideDescription.trim() !== originalDescription) {
      newOverrides.description = overrideDescription.trim();
    }

    if (hasCustomBullets) {
      const cleaned = overrideBullets.map((b) => b.trim()).filter((b) => b.length > 0);
      newOverrides.bullets = cleaned;
    }

    if (overrideTagsString.trim()) {
      const cleanedTags = overrideTagsString
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (cleanedTags.join(", ") !== originalTags.join(", ")) {
        newOverrides.tags = cleanedTags;
      }
    }

    onSave(newOverrides);
    onClose();
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto px-1">
      {/* Header Info Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center justify-between">
        <div>
          <span className="font-semibold text-slate-800">Original Vault Item:</span>{" "}
          <span className="italic">{originalTitle || originalOrg || tagsContent?.category}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResetAll}
          className="h-7 text-xs text-slate-500 hover:text-slate-800"
          title="Clear all overrides back to Vault defaults"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset to Vault Default
        </Button>
      </div>

      {/* Timeline Layout Fields */}
      {isTimeline && (
        <div className="space-y-3.5">
          {/* Title / Role */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="overrideTitle" className="text-xs">
                {isProject ? "Project Name" : "Role / Title"}
              </Label>
              {overrideTitle && (
                <span className="text-[10px] text-indigo-600 font-medium">Overridden</span>
              )}
            </div>
            <Input
              id="overrideTitle"
              value={overrideTitle}
              onChange={(e) => setOverrideTitle(e.target.value)}
              placeholder={`Default: "${originalTitle}"`}
              className="text-xs"
            />
          </div>

          {/* Org / Technologies */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="overrideOrg" className="text-xs">
                {isProject ? "Tech Stack / Technologies" : "Company / Organization"}
              </Label>
              {overrideOrg && (
                <span className="text-[10px] text-indigo-600 font-medium">Overridden</span>
              )}
            </div>
            <Input
              id="overrideOrg"
              value={overrideOrg}
              onChange={(e) => setOverrideOrg(e.target.value)}
              placeholder={`Default: "${originalOrg}"`}
              className="text-xs"
            />
          </div>

          {/* Dates & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="overrideStartDate" className="text-xs">Start Date</Label>
                {overrideStartDate && (
                  <span className="text-[10px] text-indigo-600 font-medium">Overridden</span>
                )}
              </div>
              <Input
                id="overrideStartDate"
                value={overrideStartDate}
                onChange={(e) => setOverrideStartDate(e.target.value)}
                placeholder={originalStartDate ? `Default: "${originalStartDate}"` : "e.g. 2024"}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="overrideEndDate" className="text-xs">End Date</Label>
                {overrideEndDate && (
                  <span className="text-[10px] text-indigo-600 font-medium">Overridden</span>
                )}
              </div>
              <Input
                id="overrideEndDate"
                value={overrideEndDate}
                onChange={(e) => setOverrideEndDate(e.target.value)}
                placeholder={originalEndDate ? `Default: "${originalEndDate}"` : "e.g. Present"}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="overrideLocation" className="text-xs">Location / Subtitle</Label>
                {overrideLocation && (
                  <span className="text-[10px] text-indigo-600 font-medium">Overridden</span>
                )}
              </div>
              <Input
                id="overrideLocation"
                value={overrideLocation}
                onChange={(e) => setOverrideLocation(e.target.value)}
                placeholder={originalLocation ? `Default: "${originalLocation}"` : "e.g. Cairo"}
                className="text-xs"
              />
            </div>
          </div>

          {/* Link URL & Label */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="overrideLink" className="text-xs">
                  {isProject ? "Project URL" : "Role / Organization URL"}
                </Label>
                {overrideLink && (
                  <span className="text-[10px] text-indigo-600 font-medium">Overridden</span>
                )}
              </div>
              <Input
                id="overrideLink"
                value={overrideLink}
                onChange={(e) => setOverrideLink(e.target.value)}
                placeholder={originalLink ? `Default: "${originalLink}"` : "https://..."}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="overrideLinkLabel" className="text-xs">
                  Link Title
                </Label>
                {overrideLinkLabel && (
                  <span className="text-[10px] text-indigo-600 font-medium">Overridden</span>
                )}
              </div>
              <Input
                id="overrideLinkLabel"
                value={overrideLinkLabel}
                onChange={(e) => setOverrideLinkLabel(e.target.value)}
                placeholder={
                  originalLinkLabel ||
                  ((overrideLink || originalLink).includes("github.com") ? "GitHub" : "Link")
                }
                className="text-xs"
              />
            </div>
          </div>

          {/* Accomplishment Bullets */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs">Accomplishment Bullets</Label>
                <p className="text-[10px] text-slate-500">
                  Tailor bullets with specific metrics and bold keywords (e.g. **2M+ articles**) for this role.
                </p>
              </div>
              <div className="flex items-center gap-1">
                {hasCustomBullets && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOverrideBullets([...originalBullets]);
                      setHasCustomBullets(false);
                    }}
                    className="h-6 text-[11px] text-slate-500 hover:text-slate-800"
                  >
                    Reset Bullets
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHasCustomBullets(true);
                    setOverrideBullets((prev) => [...prev, ""]);
                  }}
                  className="h-6 text-[11px]"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Bullet
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {overrideBullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-[11px] text-slate-400 mt-2 font-mono">
                    {idx + 1}.
                  </span>
                  <Textarea
                    value={bullet}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHasCustomBullets(true);
                      setOverrideBullets((prev) => {
                        const copy = [...prev];
                        copy[idx] = val;
                        return copy;
                      });
                    }}
                    placeholder="Accomplishment bullet..."
                    className="text-xs min-h-[44px] py-1.5"
                    rows={2}
                  />
                  {overrideBullets.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setHasCustomBullets(true);
                        setOverrideBullets((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="h-7 w-7 text-slate-400 hover:text-red-600 mt-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Record Layout Fields (Certifications, Achievements) */}
      {isRecord && (
        <div className="space-y-3.5">
          <div className="space-y-1">
            <Label htmlFor="overrideTitle" className="text-xs">Title / Certification</Label>
            <Input
              id="overrideTitle"
              value={overrideTitle}
              onChange={(e) => setOverrideTitle(e.target.value)}
              placeholder={`Default: "${originalTitle}"`}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="overrideIssuer" className="text-xs">Issuer / Organization</Label>
              <Input
                id="overrideIssuer"
                value={overrideIssuer}
                onChange={(e) => setOverrideIssuer(e.target.value)}
                placeholder={`Default: "${originalIssuer}"`}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="overrideDate" className="text-xs">Date / Year</Label>
              <Input
                id="overrideDate"
                value={overrideDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                placeholder={`Default: "${originalDate}"`}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="overrideLink" className="text-xs">Credential Link</Label>
              <Input
                id="overrideLink"
                value={overrideLink}
                onChange={(e) => setOverrideLink(e.target.value)}
                placeholder={originalLink ? `Default: "${originalLink}"` : "https://..."}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="overrideLinkLabel" className="text-xs">Link Title</Label>
              <Input
                id="overrideLinkLabel"
                value={overrideLinkLabel}
                onChange={(e) => setOverrideLinkLabel(e.target.value)}
                placeholder={originalLinkLabel || "Certificate"}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="overrideDesc" className="text-xs">Description</Label>
            <Textarea
              id="overrideDesc"
              value={overrideDescription}
              onChange={(e) => setOverrideDescription(e.target.value)}
              placeholder={originalDescription ? `Default: "${originalDescription}"` : "Details..."}
              className="text-xs"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Tags Layout Fields (Skills) */}
      {isTags && (
        <div className="space-y-3.5">
          <div className="space-y-1">
            <Label htmlFor="overrideTagsString" className="text-xs">
              Selected Skills for {tagsContent?.category} (comma-separated)
            </Label>
            <Input
              id="overrideTagsString"
              value={overrideTagsString}
              onChange={(e) => setOverrideTagsString(e.target.value)}
              placeholder={`Default: "${originalTags.join(", ")}"`}
              className="text-xs"
            />
            <p className="text-[10px] text-slate-500">
              Only include the specific skills relevant to this resume variant.
            </p>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} size="sm">
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Save Overrides
        </Button>
      </DialogFooter>
    </form>
  );
}
