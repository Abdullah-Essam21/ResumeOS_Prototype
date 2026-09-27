import { vaultRepository } from "@/lib/db/repositories/vault.repository";
import { VaultView } from "@/components/vault/vault-view";

export const dynamic = "force-dynamic";

export default function VaultPage() {
  const items = vaultRepository.getVaultItems({ includeArchived: true });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <VaultView initialItems={items} />
    </div>
  );
}
