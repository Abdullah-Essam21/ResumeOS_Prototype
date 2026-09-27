"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function PrintContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-6">
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
            Print Preview {resumeId ? `(Resume #${resumeId})` : ""}
          </span>
        </div>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
      </div>

      {/* Printable Sheet */}
      <div className="w-[8.5in] min-h-[11in] bg-white shadow-lg p-12 print:shadow-none print:p-0 print:w-full">
        <div className="text-center text-slate-500 py-20 border border-dashed border-slate-200 rounded">
          <p className="font-semibold text-slate-700">Resume Print Canvas</p>
          <p className="text-xs text-slate-400 mt-1">
            Template rendering output will be rendered here for high-fidelity print & PDF export.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading print canvas...</div>}>
      <PrintContent />
    </Suspense>
  );
}
