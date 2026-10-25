"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getResumeSnapshotAction } from "@/lib/actions/resumes.actions";
import { ResumeSnapshot } from "@/lib/types/resume";
import { ClassicTemplateV1 } from "@/templates/classic/v1/ClassicTemplateV1";

function PrintViewer({ resumeId }: { resumeId: string }) {
  const [snapshot, setSnapshot] = React.useState<ResumeSnapshot | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchSnapshot() {
      const res = await getResumeSnapshotAction(resumeId);
      if (!isMounted) return;

      if (res.success && res.data) {
        setSnapshot(res.data);
      } else {
        setError(res.error || "Failed to load resume snapshot");
      }
      setLoading(false);
    }

    fetchSnapshot();

    return () => {
      isMounted = false;
    };
  }, [resumeId]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-6 print:py-0 print:bg-white">
      {/* Print Controls (hidden during print) */}
      <div className="no-print mb-6 w-full max-w-[8.5in] flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span className="text-sm font-semibold text-slate-800">
            Print / Export PDF {snapshot ? `— ${snapshot.professionalTitle || snapshot.profile.fullName}` : ""}
          </span>
        </div>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
      </div>

      {/* Printable Sheet */}
      <div className="w-full flex justify-center">
        {loading ? (
          <div className="w-[8.5in] min-h-[11in] bg-white shadow-lg p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-sm">Preparing ATS-friendly printable document…</p>
          </div>
        ) : error || !snapshot ? (
          <div className="w-[8.5in] min-h-[11in] bg-white shadow-lg p-12 flex flex-col items-center justify-center text-center">
            <p className="text-base font-semibold text-slate-700">Resume Not Found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {error || "Please select a valid resume to print."}
            </p>
          </div>
        ) : (
          <ClassicTemplateV1 snapshot={snapshot} />
        )}
      </div>
    </div>
  );
}

function PrintContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  if (!resumeId) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center py-6">
        <div className="w-[8.5in] min-h-[11in] bg-white shadow-lg p-12 flex flex-col items-center justify-center text-center">
          <p className="text-base font-semibold text-slate-700">Resume Not Specified</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Please navigate from the Resume Builder or select a resume to print.
          </p>
        </div>
      </div>
    );
  }

  return <PrintViewer key={resumeId} resumeId={resumeId} />;
}

export default function PrintPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">
          Loading print canvas...
        </div>
      }
    >
      <PrintContent />
    </Suspense>
  );
}
