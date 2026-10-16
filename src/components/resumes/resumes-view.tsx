"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Resume } from "@/lib/types/resume";
import { ResumeCard } from "./resume-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  duplicateResumeAction,
  archiveResumeAction,
  unarchiveResumeAction,
  deleteResumeAction,
  updateResumeAction,
} from "@/lib/actions/resumes.actions";
import {
  FileText,
  Plus,
  Search,
  Archive,
  Copy,
  Edit2,
  Loader2,
} from "lucide-react";

interface ResumesViewProps {
  initialResumes: Resume[];
}

export function ResumesView({ initialResumes }: ResumesViewProps) {
  const router = useRouter();
  const [resumes, setResumes] = React.useState<Resume[]>(initialResumes);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showArchived, setShowArchived] = React.useState(false);

  // Duplicate Dialog state
  const [duplicateDialogOpen, setDuplicateDialogOpen] = React.useState(false);
  const [duplicatingResume, setDuplicatingResume] = React.useState<Resume | null>(null);
  const [duplicateName, setDuplicateName] = React.useState("");
  const [duplicateTitle, setDuplicateTitle] = React.useState("");
  const [isDuplicating, setIsDuplicating] = React.useState(false);

  // Rename Dialog state
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const [renamingResume, setRenamingResume] = React.useState<Resume | null>(null);
  const [renameTitle, setRenameTitle] = React.useState("");
  const [renameName, setRenameName] = React.useState("");
  const [isRenaming, setIsRenaming] = React.useState(false);

  const handleOpenDuplicate = (resume: Resume) => {
    setDuplicatingResume(resume);
    setDuplicateName(`${resume.name} (Variant)`);
    setDuplicateTitle(resume.draft.professionalTitle || "");
    setDuplicateDialogOpen(true);
  };

  const handleConfirmDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicatingResume) return;
    setIsDuplicating(true);

    const res = await duplicateResumeAction(duplicatingResume.id, {
      name: duplicateName.trim() || undefined,
      professionalTitle: duplicateTitle.trim() || undefined,
    });
    setIsDuplicating(false);

    if (res.success && res.data) {
      setResumes((prev) => [res.data!, ...prev]);
      setDuplicateDialogOpen(false);
      // Navigate to the newly duplicated resume's builder
      router.push(`/resumes/${res.data.id}/builder`);
    } else {
      alert(res.error || "Failed to duplicate resume");
    }
  };

  const handleOpenRename = (resume: Resume) => {
    setRenamingResume(resume);
    setRenameName(resume.name);
    setRenameTitle(resume.draft.professionalTitle || "");
    setRenameDialogOpen(true);
  };

  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingResume) return;
    setIsRenaming(true);

    const updatedDraft = {
      ...renamingResume.draft,
      professionalTitle: renameTitle.trim(),
    };

    const res = await updateResumeAction(renamingResume.id, {
      name: renameName.trim(),
      draft: updatedDraft,
    });
    setIsRenaming(false);

    if (res.success && res.data) {
      setResumes((prev) =>
        prev.map((r) => (r.id === renamingResume.id ? res.data! : r))
      );
      setRenameDialogOpen(false);
    } else {
      alert(res.error || "Failed to update resume details");
    }
  };

  const handleArchive = async (id: string) => {
    const res = await archiveResumeAction(id);
    if (res.success && res.data) {
      setResumes((prev) =>
        prev.map((r) => (r.id === id ? res.data! : r))
      );
    }
  };

  const handleUnarchive = async (id: string) => {
    const res = await unarchiveResumeAction(id);
    if (res.success && res.data) {
      setResumes((prev) =>
        prev.map((r) => (r.id === id ? res.data! : r))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this resume variant? (Archiving is recommended instead so your history is preserved)."
    );
    if (!confirmDelete) return;

    const res = await deleteResumeAction(id);
    if (res.success) {
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert(res.error || "Failed to delete resume");
    }
  };

  const filteredResumes = resumes.filter((resume) => {
    const isArchived = Boolean(resume.archivedAt);
    if (!showArchived && isArchived) return false;
    if (showArchived && !isArchived) return true;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      resume.name.toLowerCase().includes(q) ||
      resume.draft.professionalTitle?.toLowerCase().includes(q)
    );
  });

  const totalActiveCount = resumes.filter((r) => !r.archivedAt).length;
  const totalArchivedCount = resumes.filter((r) => r.archivedAt).length;

  return (
    <div className="space-y-6">
      {/* Top Header & New Resume CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-600" />
              My Resumes
            </h1>
            <Badge variant="default" className="font-mono text-xs">
              {totalActiveCount} Active
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your tailored resume variants. Customize titles, items, and layouts with a few clicks.
          </p>
        </div>

        <Link href="/resumes/new">
          <Button className="shadow-xs">
            <Plus className="h-4 w-4 mr-1.5" />
            Create Resume
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resumes by name or title..."
            className="h-9 w-64 sm:w-80 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            showArchived
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Archive className="h-3.5 w-3.5" />
          <span>Archived Resumes ({totalArchivedCount})</span>
        </button>
      </div>

      {/* Resumes Grid / Empty State */}
      {filteredResumes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {searchQuery
              ? "No matching resumes found"
              : "No resume variants yet"}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? "Try adjusting your search query."
              : "Create your first resume variant or duplicate an existing one to get started."}
          </p>
          <div className="mt-6">
            <Link href="/resumes/new">
              <Button>
                <Plus className="h-4 w-4 mr-1.5" />
                Create First Resume
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onDuplicate={handleOpenDuplicate}
              onRename={handleOpenRename}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent onClose={() => setDuplicateDialogOpen(false)}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Copy className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle>Duplicate Resume Variant</DialogTitle>
                <DialogDescription>
                  Creates an independent copy of this resume configuration.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleConfirmDuplicate} className="space-y-4 mt-4">
            {duplicatingResume && (
              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Forking from:</span>
                  <p className="font-semibold text-slate-800">{duplicatingResume.name}</p>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono">
                  {duplicatingResume.draft.sections.length} sections copied
                </Badge>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="duplicateName">New Resume Variant Name *</Label>
              <Input
                id="duplicateName"
                required
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                placeholder="e.g. Power BI Developer Resume"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duplicateTitle">Target Professional Title</Label>
              <Input
                id="duplicateTitle"
                value={duplicateTitle}
                onChange={(e) => setDuplicateTitle(e.target.value)}
                placeholder="e.g. Power BI Developer"
              />
              <p className="text-[11px] text-slate-500">
                You can change this or customize items anytime inside the Builder.
              </p>
            </div>

            <div className="rounded-lg bg-indigo-50/60 p-3 text-[11px] text-indigo-900 border border-indigo-100 leading-relaxed">
              💡 <strong>Invariant 2:</strong> This variant is completely independent. Changes made here will never modify the original resume.
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDuplicateDialogOpen(false)}
                disabled={isDuplicating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isDuplicating}>
                {isDuplicating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Duplicating...
                  </>
                ) : (
                  "Create Variant"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename / Edit Details Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent onClose={() => setRenameDialogOpen(false)}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Edit2 className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle>Edit Resume Name & Title</DialogTitle>
                <DialogDescription>
                  Quickly change how this resume is named and its target professional title.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleConfirmRename} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="renameName">Resume Name *</Label>
              <Input
                id="renameName"
                required
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder="e.g. Data Analyst Resume"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="renameTitle">Target Professional Title</Label>
              <Input
                id="renameTitle"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                placeholder="e.g. Senior Power BI Developer"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameDialogOpen(false)}
                disabled={isRenaming}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isRenaming}>
                {isRenaming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
