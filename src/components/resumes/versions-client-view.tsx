"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  RotateCcw,
  Eye,
  Calendar,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { restoreResumeVersionAction } from "@/lib/actions/versions.actions";
import { ClassicTemplateV1 } from "@/templates/classic/v1/ClassicTemplateV1";
import type { Resume, ResumeVersion } from "@/lib/types/resume";

export type VersionsClientViewProps = {
  resume: Resume;
  versions: ResumeVersion[];
};

export function VersionsClientView({
  resume,
  versions,
}: VersionsClientViewProps) {
  const router = useRouter();
  const [selectedVersion, setSelectedVersion] = React.useState<ResumeVersion | null>(null);
  const [restoreConfirmVersion, setRestoreConfirmVersion] = React.useState<ResumeVersion | null>(null);
  const [isRestoring, setIsRestoring] = React.useState(false);

  const handleConfirmRestore = async () => {
    if (!restoreConfirmVersion) return;
    setIsRestoring(true);
    try {
      const res = await restoreResumeVersionAction(restoreConfirmVersion.id);
      if (res.success) {
        setRestoreConfirmVersion(null);
        router.push(`/resumes/${resume.id}/builder`);
      } else {
        alert(res.error || "Failed to restore version.");
        setIsRestoring(false);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
      setIsRestoring(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href={`/resumes/${resume.id}/builder`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Builder
          </Button>
        </Link>
        <span className="text-xs text-slate-500 font-mono">
          Resume ID: {resume.id.slice(0, 8)}…
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {resume.name}
            </h1>
            <Badge variant="secondary" className="text-xs">
              Version History
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Immutable snapshots of this resume. Each version is fully frozen and self-contained (Invariant 4 & 5).
          </p>
        </div>

        <Link href={`/resumes/${resume.id}/builder`}>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            Active Draft
          </Button>
        </Link>
      </div>

      {/* Version List or Empty State */}
      {versions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <Clock className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Saved Versions Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            To create an immutable historical snapshot, open the Builder and click the &ldquo;Save Version&rdquo; button in the top bar.
          </p>
          <div className="mt-5">
            <Link href={`/resumes/${resume.id}/builder`}>
              <Button size="sm">Go to Builder</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold uppercase tracking-wider">
            <span>Historical Versions ({versions.length})</span>
            <span>Chronological order</span>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            {versions.map((ver) => {
              const dateFormatted = new Date(ver.createdAt).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              const sectionCount = ver.snapshot.sections.filter((s) => s.visible).length;
              const itemCount = ver.snapshot.sections
                .filter((s) => s.visible)
                .reduce((acc, s) => acc + s.items.length, 0);

              return (
                <div
                  key={ver.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        v{ver.versionNumber}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-medium text-slate-700 text-sm">
                        {ver.snapshot.professionalTitle || "General Resume"}
                      </span>
                      <Badge variant="accent" className="text-[10px] font-mono">
                        {ver.templateId} v{ver.templateVersion}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {dateFormatted}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>
                        {sectionCount} sections, {itemCount} items
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVersion(ver)}
                      className="gap-1.5 text-xs text-slate-700"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      View Snapshot
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRestoreConfirmVersion(ver)}
                      className="gap-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore Draft
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Historical Snapshot Modal */}
      {selectedVersion && (
        <Dialog
          open={Boolean(selectedVersion)}
          onOpenChange={(open) => !open && setSelectedVersion(null)}
        >
          <DialogContent
            onClose={() => setSelectedVersion(null)}
            className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
              <div>
                <DialogTitle className="text-base flex items-center gap-2">
                  <span>Version {selectedVersion.versionNumber} Snapshot</span>
                  <Badge variant="secondary" className="text-[10px]">
                    Immutable
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Created {new Date(selectedVersion.createdAt).toLocaleString()}
                </DialogDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRestoreConfirmVersion(selectedVersion);
                  setSelectedVersion(null);
                }}
                className="gap-1.5 text-xs text-indigo-700 border-indigo-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore this version
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-100 p-6 flex justify-center">
              <div className="w-[8.5in] bg-white border border-slate-200 shadow-md">
                <ClassicTemplateV1 snapshot={selectedVersion.snapshot} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Restore Confirmation Dialog */}
      {restoreConfirmVersion && (
        <Dialog
          open={Boolean(restoreConfirmVersion)}
          onOpenChange={(open) => !open && setRestoreConfirmVersion(null)}
        >
          <DialogContent
            onClose={() => setRestoreConfirmVersion(null)}
            className="max-w-md"
          >
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle>Restore Version {restoreConfirmVersion.versionNumber}?</DialogTitle>
                  <DialogDescription>
                    This will copy the historical snapshot into your active draft so you can edit it.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <p className="font-semibold text-slate-800">
                Invariant 4 & 5 Guarantee:
              </p>
              <p>
                Version {restoreConfirmVersion.versionNumber} itself will remain completely unchanged and preserved in your history.
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRestoreConfirmVersion(null)}
                disabled={isRestoring}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="gap-1.5"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Restoring…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirm & Restore
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
