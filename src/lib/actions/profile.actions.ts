"use server";

import { revalidatePath } from "next/cache";
import { profileRepository } from "@/lib/db/repositories/profile.repository";
import { Profile, UpdateProfileInput, UpdateProfileSchema } from "@/lib/types/profile";

export async function getProfileAction(): Promise<{ success: boolean; data?: Profile; error?: string }> {
  try {
    const profile = profileRepository.getProfile();
    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function updateProfileAction(
  input: UpdateProfileInput
): Promise<{ success: boolean; data?: Profile; error?: string }> {
  try {
    const validated = UpdateProfileSchema.parse(input);
    const updated = profileRepository.updateProfile(validated);
    revalidatePath("/");
    revalidatePath("/vault");
    revalidatePath("/resumes");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
