"use client";

import * as React from "react";
import type { Resume, ResumeDraft } from "@/lib/types/resume";
import type { VaultItem } from "@/lib/types/vault";
import type { Profile } from "@/lib/types/profile";
import { resolveResumeSnapshot } from "@/lib/utils/resolve-snapshot";
import { ClassicTemplateV1 } from "@/templates/classic/v1/ClassicTemplateV1";

export type BuilderPreviewProps = {
  resume: Resume;
  draft: ResumeDraft;
  allVaultItems: VaultItem[];
  profile?: Profile;
};

const defaultProfile: Profile = {
  id: "default",
  fullName: "Your Full Name",
  email: "your.email@example.com",
  phone: "+1 (555) 000-0000",
  location: "City, Country",
  website: "",
  linkedinUrl: "",
  githubUrl: "",
};

export function BuilderPreview({
  resume,
  draft,
  allVaultItems,
  profile,
}: BuilderPreviewProps) {
  // Merge current live draft into resume for snapshot computation
  const liveResume: Resume = React.useMemo(() => {
    return {
      ...resume,
      draft,
    };
  }, [resume, draft]);

  // Compute live normalized snapshot
  const snapshot = React.useMemo(() => {
    return resolveResumeSnapshot(liveResume, profile || defaultProfile, allVaultItems);
  }, [liveResume, profile, allVaultItems]);

  return (
    <div className="w-full flex justify-center py-4">
      <div className="w-[8.5in] bg-white border border-slate-200 shadow-lg rounded-sm overflow-hidden">
        <ClassicTemplateV1 snapshot={snapshot} />
      </div>
    </div>
  );
}
