import { resumesRepository } from "@/lib/db/repositories/resumes.repository";
import { ResumesView } from "@/components/resumes/resumes-view";

export const dynamic = "force-dynamic";

export default function ResumesPage() {
  const resumes = resumesRepository.getResumes({ includeArchived: true });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ResumesView initialResumes={resumes} />
    </div>
  );
}
