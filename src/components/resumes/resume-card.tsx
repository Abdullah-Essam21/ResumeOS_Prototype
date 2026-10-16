"use client";

import Link from "next/link";
import { Resume } from "@/lib/types/resume";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Copy,
  Edit2,
  Archive,
  RotateCcw,
  Trash2,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ResumeCardProps {
  resume: Resume;
  onDuplicate: (resume: Resume) => void;
  onRename: (resume: Resume) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ResumeCard({
  resume,
  onDuplicate,
  onRename,
  onArchive,
  onUnarchive,
  onDelete,
}: ResumeCardProps) {
  const isArchived = Boolean(resume.archivedAt);
  const totalSections = resume.draft.sections.filter((s) => s.visible).length;
  const totalSelectedItems = resume.draft.sections.reduce(
    (acc, s) => acc + s.items.filter((i) => i.visible).length,
    0
  );

  const formattedDate = new Date(resume.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`rounded-xl border bg-white p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
        isArchived
          ? "border-slate-200 bg-slate-50/70 opacity-75"
          : "border-slate-200"
      }`}
    >
      <div>
        {/* Top Badges & Control Bar */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={isArchived ? "secondary" : "default"}
              className="gap-1.5 py-1"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Resume Variant</span>
            </Badge>

            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              {resume.templateId} v{resume.templateVersion}
            </span>

            {isArchived && (
              <Badge variant="accent" className="text-[10px]">
                Archived
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRename(resume)}
              title="Rename Resume"
              className="h-8 w-8 text-slate-500 hover:text-slate-800"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDuplicate(resume)}
              title="Duplicate / Create Variant"
              className="h-8 w-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>

            {isArchived ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onUnarchive(resume.id)}
                title="Restore Resume"
                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onArchive(resume.id)}
                title="Archive Resume"
                className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
              >
                <Archive className="h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(resume.id)}
              title="Delete permanently"
              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Resume Title & Target Role */}
        <div className="space-y-1 mb-4">
          <h3 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
            {resume.name}
          </h3>
          <p className="text-sm font-medium text-indigo-600 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {resume.draft.professionalTitle || "No Professional Title Specified"}
          </p>
        </div>

        {/* Metrics Pill Box */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs mb-4">
          <div>
            <span className="text-slate-400 font-medium">Sections</span>
            <p className="font-semibold text-slate-700 mt-0.5">
              {totalSections} active
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Vault Items</span>
            <p className="font-semibold text-slate-700 mt-0.5">
              {totalSelectedItems} selected
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info & Open CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formattedDate}
        </span>

        <Link href={`/resumes/${resume.id}/builder`}>
          <Button size="sm" className="gap-1.5">
            <span>Open Builder</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
