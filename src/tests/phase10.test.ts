import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { initializeDatabase } from "../lib/db/schema";
import { ResumesRepository } from "../lib/db/repositories/resumes.repository";
import { VaultRepository } from "../lib/db/repositories/vault.repository";
import { ProfileRepository } from "../lib/db/repositories/profile.repository";
import { VersionsRepository } from "../lib/db/repositories/versions.repository";
import { resolveResumeSnapshot } from "../lib/utils/resolve-snapshot";
import { getDefaultResumeDraft } from "../lib/types/resume";

function createTestDatabase(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  initializeDatabase(db);
  return db;
}

async function runPhase10Tests() {
  console.log("--- Starting Phase 10 Immutable Resume Versions & History Tests ---");

  const db = createTestDatabase();
  const resumesRepo = new ResumesRepository(db);
  const vaultRepo = new VaultRepository(db);
  const profileRepo = new ProfileRepository(db);
  const versionsRepo = new VersionsRepository(db, resumesRepo);

  const profile = profileRepo.getProfile();

  // 1. Setup Vault Items
  console.log("Test 1: Create initial Career Vault items");
  const vaultExp = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    content: {
      organization: "DEPI",
      title: "Power BI Intern",
      startDate: "Jun 2025",
      endDate: "Feb 2026",
      location: "Cairo",
      link: "",
      bullets: ["Built dashboard version 1."],
    },
  });

  // 2. Create Resume
  console.log("Test 2: Create resume draft");
  const draft = getDefaultResumeDraft("Data Analyst");
  draft.sections.find((s) => s.type === "experience")!.items.push({
    vaultItemId: vaultExp.id,
    visible: true,
    overrides: {},
  });

  const resume = resumesRepo.createResume({
    name: "Data Analyst Resume",
    draft,
  });

  // 3. Save Version 1
  console.log("Test 3: Save Version 1 snapshot");
  const snapshot1 = resolveResumeSnapshot(resume, profile, [vaultExp]);
  const version1 = versionsRepo.createVersion(resume.id, snapshot1);

  assert.equal(version1.versionNumber, 1);
  assert.equal(version1.resumeId, resume.id);
  assert.equal(version1.snapshot.professionalTitle, "Data Analyst");
  assert.equal(version1.snapshot.sections.find((s) => s.type === "experience")!.items[0].resolvedContent.title, "Power BI Intern");

  // 4. Invariant 32: Sequential atomic version numbering per resume
  console.log("Test 4: Sequential atomic version numbering per resume");
  // Modify draft and save Version 2
  const updatedDraft = {
    ...resume.draft,
    professionalTitle: "Senior Power BI Developer",
  };
  const updatedResume = resumesRepo.updateResume(resume.id, { draft: updatedDraft })!;
  const snapshot2 = resolveResumeSnapshot(updatedResume, profile, [vaultExp]);
  const version2 = versionsRepo.createVersion(resume.id, snapshot2);

  assert.equal(version2.versionNumber, 2);

  // Another resume gets its own version numbering starting from 1
  const otherResume = resumesRepo.createResume({
    name: "Other Resume",
    draft: getDefaultResumeDraft("Other Title"),
  });
  const otherSnapshot = resolveResumeSnapshot(otherResume, profile, []);
  const otherVersion1 = versionsRepo.createVersion(otherResume.id, otherSnapshot);
  assert.equal(otherVersion1.versionNumber, 1);

  // 5. Invariant 4 & 5: Version Immutability & Snapshot Independence from Vault Mutations
  console.log("Test 5: Invariant 4 & 5 - Version 1 remains unchanged after Vault is modified");
  // Mutate the original Vault item
  vaultRepo.updateVaultItem(vaultExp.id, {
    content: {
      organization: "DEPI - Mutated Later",
      title: "Lead Principal Architect",
      bullets: ["New modified bullet point."],
    },
  });

  // Check that Version 1 snapshot retains original data
  const checkV1 = versionsRepo.getVersionById(version1.id)!;
  const v1Exp = checkV1.snapshot.sections.find((s) => s.type === "experience")!.items[0];
  assert.equal(v1Exp.resolvedContent.organization, "DEPI");
  assert.equal(v1Exp.resolvedContent.title, "Power BI Intern");
  assert.equal((v1Exp.resolvedContent.bullets as string[])[0], "Built dashboard version 1.");

  // 6. Invariant 31: Restore historical version into mutable draft
  console.log("Test 6: Invariant 31 - Restore Version 1 into active draft without altering history");
  const restoredDraft = versionsRepo.restoreVersion(version1.id);
  assert.equal(restoredDraft.professionalTitle, "Data Analyst");

  const currentResume = resumesRepo.getResumeById(resume.id)!;
  assert.equal(currentResume.draft.professionalTitle, "Data Analyst");

  // Verify Version 2 in history is still intact
  const checkV2 = versionsRepo.getVersionById(version2.id)!;
  assert.equal(checkV2.versionNumber, 2);
  assert.equal(checkV2.snapshot.professionalTitle, "Senior Power BI Developer");

  // Verify list versions returns [v2, v1] in descending order
  const versionsList = versionsRepo.getVersionsByResumeId(resume.id);
  assert.equal(versionsList.length, 2);
  assert.equal(versionsList[0].versionNumber, 2);
  assert.equal(versionsList[1].versionNumber, 1);

  console.log("✓ All Phase 10 Immutable Resume Versions & History tests passed successfully!");
}

runPhase10Tests().catch((err) => {
  console.error("Phase 10 Test failed:", err);
  process.exit(1);
});
