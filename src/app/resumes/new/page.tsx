import { resumesRepository } from "@/lib/db/repositories/resumes.repository";
import { CreateResumeForm } from "@/components/resumes/create-resume-form";

export const dynamic = "force-dynamic";

export default function NewResumePage() {
  const existingResumes = resumesRepository.getResumes({ includeArchived: false });

  return <CreateResumeForm existingResumes={existingResumes} />;
}
