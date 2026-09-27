"use server";

import { revalidatePath } from "next/cache";
import {
  vaultRepository,
  GetVaultItemsOptions,
} from "@/lib/db/repositories/vault.repository";
import {
  VaultItem,
  CreateVaultItemInput,
  CreateVaultItemSchema,
  UpdateVaultItemInput,
  UpdateVaultItemSchema,
} from "@/lib/types/vault";

export async function getVaultItemsAction(
  options?: GetVaultItemsOptions
): Promise<{ success: boolean; data?: VaultItem[]; error?: string }> {
  try {
    const items = vaultRepository.getVaultItems(options);
    return { success: true, data: items };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function createVaultItemAction(
  input: CreateVaultItemInput
): Promise<{ success: boolean; data?: VaultItem; error?: string }> {
  try {
    const validated = CreateVaultItemSchema.parse(input);
    const item = vaultRepository.createVaultItem(validated);
    revalidatePath("/vault");
    revalidatePath("/");
    return { success: true, data: item };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function updateVaultItemAction(
  id: string,
  input: UpdateVaultItemInput
): Promise<{ success: boolean; data?: VaultItem; error?: string }> {
  try {
    const validated = UpdateVaultItemSchema.parse(input);
    const item = vaultRepository.updateVaultItem(id, validated);
    if (!item) {
      return { success: false, error: "Vault item not found" };
    }
    revalidatePath("/vault");
    revalidatePath("/");
    return { success: true, data: item };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function archiveVaultItemAction(
  id: string
): Promise<{ success: boolean; data?: VaultItem; error?: string }> {
  try {
    const item = vaultRepository.archiveVaultItem(id);
    if (!item) {
      return { success: false, error: "Vault item not found" };
    }
    revalidatePath("/vault");
    revalidatePath("/");
    return { success: true, data: item };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function unarchiveVaultItemAction(
  id: string
): Promise<{ success: boolean; data?: VaultItem; error?: string }> {
  try {
    const item = vaultRepository.unarchiveVaultItem(id);
    if (!item) {
      return { success: false, error: "Vault item not found" };
    }
    revalidatePath("/vault");
    revalidatePath("/");
    return { success: true, data: item };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function deleteVaultItemAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const deleted = vaultRepository.deleteVaultItem(id);
    revalidatePath("/vault");
    revalidatePath("/");
    return { success: deleted };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
