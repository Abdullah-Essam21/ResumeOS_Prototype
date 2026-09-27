import Link from "next/link";
import { ArrowLeft, History, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VersionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumeVersionsPage({ params }: VersionsPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/resumes/${id}/builder`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Builder
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <History className="h-6 w-6 text-indigo-600" />
            Version History (Resume #{id})
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable snapshots of your resume. Restoring copies a snapshot into your active draft.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <Clock className="h-10 w-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">No Saved Versions Yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Save an immutable snapshot from the Builder once configured. Saved versions will appear here.
        </p>
      </div>
    </div>
  );
}
