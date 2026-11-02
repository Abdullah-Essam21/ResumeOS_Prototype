"use server";

import { revalidatePath } from "next/cache";
import { versionsRepository } from "@/lib/db/repositories/versions.repository";
import { resumesRepository } from "@/lib/db/repositories/resumes.repository";
import { vaultRepository } from "@/lib/db/repositories/vault.repository";
import { profileRepository } from "@/lib/db/repositories/profile.repository";
import { resolveResumeSnapshot } from "@/lib/utils/resolve-snapshot";
import type { ResumeVersion, ResumeDraft } from "@/lib/types/resume";

export async function getVersionsByResumeIdAction(
  resumeId: string
): Promise<{ success: boolean; data?: ResumeVersion[]; error?: string }> {
  try {
    const versions = versionsRepository.getVersionsByResumeId(resumeId);
    return { success: true, data: versions };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getVersionByIdAction(
  id: string
): Promise<{ success: boolean; data?: ResumeVersion | null; error?: string }> {
  try {
    const version = versionsRepository.getVersionById(id);
    return { success: true, data: version };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Creates an immutable version snapshot from the current resume draft.
 * Invariants:
 * - Version number is sequentially generated within a database transaction (Invariant: Version Numbering).
 * - Version snapshot is completely self-contained and frozen (Invariants 4 & 5).
 */
export async function saveResumeVersionAction(
  resumeId: string
): Promise<{ success: boolean; data?: ResumeVersion; error?: string }> {
  try {
    const resume = resumesRepository.getResumeById(resumeId);
    if (!resume) {
      return { success: false, error: "Resume not found" };
    }

    const vaultItems = vaultRepository.getVaultItems({ includeArchived: true });
    let profile;
    try {
      profile = profileRepository.getProfile();
    } catch {
      profile = {
        id: "default",
        fullName: "Your Full Name",
        email: "",
        phone: "",
        location: "",
        website: "",
        linkedinUrl: "",
        githubUrl: "",
      };
    }

    const snapshot = resolveResumeSnapshot(resume, profile, vaultItems);
    const newVersion = versionsRepository.createVersion(resumeId, snapshot);

    revalidatePath(`/resumes/${resumeId}/versions`);
    revalidatePath(`/resumes/${resumeId}/builder`);
    revalidatePath("/resumes");

    return { success: true, data: newVersion };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Restores an immutable version back into the resume's active mutable draft.
 * Invariant: Does NOT modify or erase the historical version record.
 */
export async function restoreResumeVersionAction(
  versionId: string
): Promise<{ success: boolean; data?: ResumeDraft; error?: string }> {
  try {
    const version = versionsRepository.getVersionById(versionId);
    if (!version) {
      return { success: false, error: "Version not found" };
    }

    const restoredDraft = versionsRepository.restoreVersion(versionId);

    revalidatePath(`/resumes/${version.resumeId}/builder`);
    revalidatePath(`/resumes/${version.resumeId}/versions`);
    revalidatePath("/resumes");

    return { success: true, data: restoredDraft };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
