import Link from "next/link";
import { ArrowLeft, Sliders, Eye, Printer, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BuilderPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumeBuilderPage({ params }: BuilderPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Builder Top Bar */}
      <div className="border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Link href="/resumes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Resumes
            </Button>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Resume #{id}
          </h2>
          <Badge variant="secondary" className="text-[10px]">Draft</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/resumes/${id}/versions`}>
            <Button variant="outline" size="sm">
              <History className="h-3.5 w-3.5 mr-1" />
              History
            </Button>
          </Link>
          <Link href={`/print?resumeId=${id}`}>
            <Button variant="outline" size="sm">
              <Printer className="h-3.5 w-3.5 mr-1" />
              Print / Export
            </Button>
          </Link>
          <Button size="sm">Save Version</Button>
        </div>
      </div>

      {/* Builder Split Layout (Config + Live Preview placeholder) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Configuration Pane */}
        <div className="w-1/2 border-r border-slate-200 bg-white p-6 overflow-y-auto space-y-6">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm border-b pb-2">
            <Sliders className="h-4 w-4 text-indigo-600" />
            Resume Configuration
          </div>
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 text-sm">
            Builder configuration pane (reordering, item picker, overrides) will be implemented in Phase 6 & 7.
          </div>
        </div>

        {/* Right Column: Live Preview Pane */}
        <div className="w-1/2 bg-slate-100 p-8 overflow-y-auto flex justify-center items-start">
          <div className="w-[8.5in] min-h-[11in] bg-white rounded shadow-sm border border-slate-300 p-12 text-slate-500 text-sm flex flex-col items-center justify-center">
            <Eye className="h-8 w-8 text-slate-400 mb-2" />
            <p className="font-medium text-slate-700">Live Preview Canvas</p>
            <p className="text-xs text-slate-400 mt-1">
              ResumeSnapshot + Template rendering engine will be active in Phase 8 & 9.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
