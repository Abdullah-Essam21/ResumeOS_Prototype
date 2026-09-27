import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResumesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-indigo-600" />
            My Resumes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your tailored resume variants. Duplicate to create new variants in seconds.
          </p>
        </div>
        <Link href="/resumes/new">
          <Button>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Resume
          </Button>
        </Link>
      </div>

      {/* Empty State / Initial Placeholder */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No Resumes Yet</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
          Start by creating your first resume or variant. You will be able to assemble content from your Career Vault.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/resumes/new">
            <Button>
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Resume
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
