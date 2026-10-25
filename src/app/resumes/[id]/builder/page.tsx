import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, History, Copy, Printer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resumesRepository } from "@/lib/db/repositories/resumes.repository";
import { vaultRepository } from "@/lib/db/repositories/vault.repository";
import { profileRepository } from "@/lib/db/repositories/profile.repository";
import { BuilderClient } from "@/components/builder/builder-client";

type BuilderPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function ResumeBuilderPage({ params }: BuilderPageProps) {
  const { id } = await params;
  const resume = resumesRepository.getResumeById(id);

  if (!resume) {
    notFound();
  }

  const vaultItems = vaultRepository.getVaultItems({ includeArchived: false });
  let profile;
  try {
    profile = profileRepository.getProfile();
  } catch {
    profile = undefined;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Builder Top Bar */}
      <div className="border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between no-print shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/resumes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Resumes
            </Button>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-sm">{resume.name}</h2>
            {resume.draft.professionalTitle ? (
              <span className="text-xs text-indigo-600 font-medium hidden sm:inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {resume.draft.professionalTitle}
              </span>
            ) : null}
            <Badge variant="secondary" className="text-[10px]">
              Draft
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/resumes/new">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Fork Variant</span>
            </Button>
          </Link>
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

      {/* Builder interactive split layout */}
      <div className="flex-1 overflow-hidden">
        <BuilderClient resume={resume} allVaultItems={vaultItems} profile={profile} />
      </div>
    </div>
  );
}
