"use server";

import { revalidatePath } from "next/cache";
import {
  resumesRepository,
  GetResumesOptions,
  UpdateResumeInput,
  DuplicateResumeOptions,
} from "@/lib/db/repositories/resumes.repository";
import { vaultRepository } from "@/lib/db/repositories/vault.repository";
import { profileRepository } from "@/lib/db/repositories/profile.repository";
import {
  Resume,
  CreateResumeInput,
  CreateResumeSchema,
  ResumeSnapshot,
} from "@/lib/types/resume";
import { resolveResumeSnapshot } from "@/lib/utils/resolve-snapshot";

export async function getResumesAction(
  options?: GetResumesOptions
): Promise<{ success: boolean; data?: Resume[]; error?: string }> {
  try {
    const resumes = resumesRepository.getResumes(options);
    return { success: true, data: resumes };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getResumeByIdAction(
  id: string
): Promise<{ success: boolean; data?: Resume | null; error?: string }> {
  try {
    const resume = resumesRepository.getResumeById(id);
    return { success: true, data: resume };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function createResumeAction(
  input: CreateResumeInput
): Promise<{ success: boolean; data?: Resume; error?: string }> {
  try {
    const validated = CreateResumeSchema.parse(input);
    const resume = resumesRepository.createResume(validated);
    revalidatePath("/resumes");
    revalidatePath("/");
    return { success: true, data: resume };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function updateResumeAction(
  id: string,
  input: UpdateResumeInput
): Promise<{ success: boolean; data?: Resume; error?: string }> {
  try {
    const updated = resumesRepository.updateResume(id, input);
    if (!updated) {
      return { success: false, error: "Resume not found" };
    }
    revalidatePath("/resumes");
    revalidatePath(`/resumes/${id}/builder`);
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function duplicateResumeAction(
  id: string,
  options?: string | DuplicateResumeOptions
): Promise<{ success: boolean; data?: Resume; error?: string }> {
  try {
    const duplicated = resumesRepository.duplicateResume(id, options);
    if (!duplicated) {
      return { success: false, error: "Base resume not found" };
    }
    revalidatePath("/resumes");
    revalidatePath("/");
    return { success: true, data: duplicated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function archiveResumeAction(
  id: string
): Promise<{ success: boolean; data?: Resume; error?: string }> {
  try {
    const archived = resumesRepository.archiveResume(id);
    if (!archived) {
      return { success: false, error: "Resume not found" };
    }
    revalidatePath("/resumes");
    revalidatePath("/");
    return { success: true, data: archived };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function unarchiveResumeAction(
  id: string
): Promise<{ success: boolean; data?: Resume; error?: string }> {
  try {
    const unarchived = resumesRepository.unarchiveResume(id);
    if (!unarchived) {
      return { success: false, error: "Resume not found" };
    }
    revalidatePath("/resumes");
    revalidatePath("/");
    return { success: true, data: unarchived };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function deleteResumeAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const deleted = resumesRepository.deleteResume(id);
    revalidatePath("/resumes");
    revalidatePath("/");
    return { success: deleted };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getResumeSnapshotAction(
  resumeId: string
): Promise<{ success: boolean; data?: ResumeSnapshot; error?: string }> {
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
    return { success: true, data: snapshot };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
