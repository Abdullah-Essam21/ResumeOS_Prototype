import { notFound } from "next/navigation";
import { resumesRepository } from "@/lib/db/repositories/resumes.repository";
import { versionsRepository } from "@/lib/db/repositories/versions.repository";
import { VersionsClientView } from "@/components/resumes/versions-client-view";

type VersionsPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function ResumeVersionsPage({ params }: VersionsPageProps) {
  const { id } = await params;
  const resume = resumesRepository.getResumeById(id);

  if (!resume) {
    notFound();
  }

  const versions = versionsRepository.getVersionsByResumeId(id);

  return <VersionsClientView resume={resume} versions={versions} />;
}
