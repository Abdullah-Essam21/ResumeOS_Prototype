import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { initializeDatabase } from "../lib/db/schema";
import { ProfileRepository } from "../lib/db/repositories/profile.repository";
import { VaultRepository } from "../lib/db/repositories/vault.repository";

function createTestDatabase(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  initializeDatabase(db);
  return db;
}

async function runPhase3Tests() {
  console.log("--- Starting Phase 3 Profile & Career Vault Tests ---");

  const db = createTestDatabase();
  const profileRepo = new ProfileRepository(db);
  const vaultRepo = new VaultRepository(db);

  // 1. Profile tests
  console.log("Test 1: Profile update & validation");
  const p1 = profileRepo.getProfile();
  assert.equal(p1.fullName, "Your Name");

  const updatedProfile = profileRepo.updateProfile({
    fullName: "Abdullah Essam",
    email: "abdullah@example.com",
    phone: "+20 100 000 0000",
    location: "Cairo, Egypt",
    website: "https://abdullahessam.dev",
    linkedinUrl: "https://linkedin.com/in/abdullahessam",
    githubUrl: "https://github.com/abdullahessam",
  });
  assert.equal(updatedProfile.fullName, "Abdullah Essam");
  assert.equal(updatedProfile.location, "Cairo, Egypt");

  // Invalid email test
  assert.throws(() => {
    profileRepo.updateProfile({
      fullName: "Test",
      email: "not-an-email",
    });
  });

  // 2. Vault item creation for all 3 layouts
  console.log("Test 2: Vault items across timeline, record, and tags layouts");
  
  // Timeline (Experience)
  const exp = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    displayOrder: 1,
    content: {
      organization: "CIB",
      title: "Data Intern",
      startDate: "Aug 2025",
      endDate: "Sep 2025",
      location: "Cairo",
      bullets: ["Automated Excel workflows to Power BI."],
    },
  });
  assert.equal(exp.category, "experience");
  assert.equal(exp.layout, "timeline");

  // Record (Certification)
  const cert = vaultRepo.createVaultItem({
    category: "certification",
    layout: "record",
    displayOrder: 1,
    content: {
      title: "Google Data Analytics",
      issuer: "Google",
      date: "2025",
      link: "https://coursera.org",
      description: "Comprehensive data analytics program",
    },
  });
  assert.equal(cert.category, "certification");
  assert.equal(cert.layout, "record");

  // Tags (Skill)
  const skill = vaultRepo.createVaultItem({
    category: "skill",
    layout: "tags",
    displayOrder: 1,
    content: {
      category: "BI & Analytics",
      tags: ["Power BI", "DAX", "SQL"],
    },
  });
  assert.equal(skill.category, "skill");
  assert.equal(skill.layout, "tags");

  // 3. Vault item partial updates
  console.log("Test 3: Vault item update and merging");
  const updatedExp = vaultRepo.updateVaultItem(exp.id, {
    content: {
      title: "BI Specialist Intern",
    },
  });
  assert.ok(updatedExp);
  const updatedExpContent = updatedExp.content as { title: string; organization: string };
  assert.equal(updatedExpContent.title, "BI Specialist Intern");
  assert.equal(updatedExpContent.organization, "CIB", "Existing organization should be preserved on partial update");

  // 4. Archive, unarchive, and filter
  console.log("Test 4: Soft archival and filtering");
  assert.equal(vaultRepo.getVaultItems().length, 3);

  vaultRepo.archiveVaultItem(exp.id);
  const activeItems = vaultRepo.getVaultItems();
  assert.equal(activeItems.length, 2, "Archived item must be excluded from default query");
  assert.ok(!activeItems.some((i) => i.id === exp.id));

  const allItems = vaultRepo.getVaultItems({ includeArchived: true });
  assert.equal(allItems.length, 3, "Archived item must be present when includeArchived: true");

  vaultRepo.unarchiveVaultItem(exp.id);
  assert.equal(vaultRepo.getVaultItems().length, 3);

  // 5. Deletion
  console.log("Test 5: Vault item deletion");
  const deleted = vaultRepo.deleteVaultItem(cert.id);
  assert.equal(deleted, true);
  assert.equal(vaultRepo.getVaultItems({ includeArchived: true }).length, 2);

  console.log("✓ All Phase 3 Profile & Career Vault tests passed successfully!");
}

runPhase3Tests().catch((err) => {
  console.error("Phase 3 Test failed:", err);
  process.exit(1);
});
