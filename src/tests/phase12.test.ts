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

async function runPhase12Tests() {
  console.log("--- Starting Phase 12 Full Workflow & Invariants Verification ---");

  const db = createTestDatabase();
  const resumesRepo = new ResumesRepository(db);
  const vaultRepo = new VaultRepository(db);
  const profileRepo = new ProfileRepository(db);
  const versionsRepo = new VersionsRepository(db, resumesRepo);

  // Step 1: Open ResumeOS & Profile
  console.log("Step 1: User Profile setup");
  profileRepo.updateProfile({
    fullName: "Abdullah Ramadan",
    email: "abdullah@example.com",
    phone: "+20 100 525 1762",
    location: "Giza, Egypt",
    linkedinUrl: "https://linkedin.com/in/abdullah",
    githubUrl: "https://github.com/abdullah",
  });
  const profile = profileRepo.getProfile();
  assert.equal(profile.fullName, "Abdullah Ramadan");

  // Step 2 & 3: Maintain Career Vault Items
  console.log("Step 2 & 3: Maintain reusable items in Career Vault");
  const cibExperience = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    content: {
      organization: "Commercial International Bank (CIB)",
      title: "Data Intern",
      startDate: "Aug 2025",
      endDate: "Sep 2025",
      location: "Cairo, Egypt",
      link: "https://cibeg.com",
      bullets: [
        "Analyzed transactional data and drafted reporting workflows.",
      ],
    },
  });

  const depiExperience = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    content: {
      organization: "Digital Egypt Pioneers Initiative (DEPI)",
      title: "Power BI Specialist Trainee",
      startDate: "Jun 2025",
      endDate: "Feb 2026",
      location: "Remote",
      link: "https://depi.gov.eg",
      bullets: [
        "Delivered three freelance data projects using Power BI and DAX.",
      ],
    },
  });

  const pipelineProject = vaultRepo.createVaultItem({
    category: "project",
    layout: "timeline",
    content: {
      title: "News Analytics Pipeline",
      organization: "Python, Airflow, Docker, BigQuery",
      link: "https://github.com/abdullah/pipeline",
      bullets: [
        "Built containerized scraper handling **2M+ articles**.",
      ],
    },
  });

  const biSkills = vaultRepo.createVaultItem({
    category: "skill",
    layout: "tags",
    content: {
      category: "BI & Visualization",
      tags: ["Power BI", "Excel", "DAX", "SQL", "Looker Studio"],
    },
  });

  const allVault = vaultRepo.getVaultItems({ includeArchived: true });
  assert.equal(allVault.length, 4);

  // Step 4: Create Data Analyst Resume
  console.log("Step 4: Create a Data Analyst Resume");
  const draftA = getDefaultResumeDraft("Data Analyst");
  draftA.sections.find((s) => s.type === "experience")!.items.push(
    { vaultItemId: cibExperience.id, visible: true, overrides: {} },
    { vaultItemId: depiExperience.id, visible: true, overrides: {} }
  );
  draftA.sections.find((s) => s.type === "projects")!.items.push(
    { vaultItemId: pipelineProject.id, visible: true, overrides: {} }
  );
  draftA.sections.find((s) => s.type === "skills")!.items.push(
    { vaultItemId: biSkills.id, visible: true, overrides: {} }
  );

  const resumeA = resumesRepo.createResume({
    name: "Data Analyst Resume",
    draft: draftA,
  });
  assert.equal(resumeA.name, "Data Analyst Resume");

  // Step 5 & 6: Arrange and Reorder
  console.log("Step 5 & 6: Rearrange items and sections");
  const expSection = resumeA.draft.sections.find((s) => s.type === "experience")!;
  // Reverse order: DEPI first, CIB second
  expSection.items = [expSection.items[1], expSection.items[0]];
  const updatedResumeA = resumesRepo.updateResume(resumeA.id, { draft: resumeA.draft })!;
  assert.equal(updatedResumeA.draft.sections.find((s) => s.type === "experience")!.items[0].vaultItemId, depiExperience.id);

  // Step 7 & 8: Preview & Save Version
  console.log("Step 7 & 8: Preview & Save Version 1");
  const snapshotA1 = resolveResumeSnapshot(updatedResumeA, profile, allVault);
  const versionA1 = versionsRepo.createVersion(updatedResumeA.id, snapshotA1);
  assert.equal(versionA1.versionNumber, 1);
  assert.equal(versionA1.snapshot.professionalTitle, "Data Analyst");

  // Step 9 & 10: Duplicate Resume
  console.log("Step 9 & 10: Duplicate into 'Power BI Developer Resume'");
  const resumeB = resumesRepo.duplicateResume(updatedResumeA.id, {
    name: "Power BI Developer Resume",
    professionalTitle: "Senior Power BI Developer",
  })!;
  assert.equal(resumeB.name, "Power BI Developer Resume");
  assert.equal(resumeB.draft.professionalTitle, "Senior Power BI Developer");

  // Step 11, 12, 13: Change content & apply overrides on Variant B
  console.log("Step 11, 12, 13: Adjust items and tailor overrides on Variant B");
  const draftB = { ...resumeB.draft };
  const expB = draftB.sections.find((s) => s.type === "experience")!;
  expB.items[0].overrides = {
    title: "Lead Power BI Specialist",
    bullets: [
      "Designed enterprise financial models and optimized DAX calculation groups.",
    ],
  };
  const updatedResumeB = resumesRepo.updateResume(resumeB.id, { draft: draftB })!;

  // Invariant 2 Check: Resume A is not modified by Resume B edits
  const recheckResumeA = resumesRepo.getResumeById(resumeA.id)!;
  assert.deepEqual(recheckResumeA.draft.sections.find((s) => s.type === "experience")!.items[0].overrides, {});
  assert.equal(recheckResumeA.draft.professionalTitle, "Data Analyst");

  // Step 14 & 15: Preview and Save Variant B Version 1
  console.log("Step 14 & 15: Preview & Save Version 1 for Variant B");
  const snapshotB1 = resolveResumeSnapshot(updatedResumeB, profile, allVault);
  const versionB1 = versionsRepo.createVersion(updatedResumeB.id, snapshotB1);
  assert.equal(versionB1.versionNumber, 1); // Scoped to Resume B
  assert.equal(versionB1.snapshot.sections.find((s) => s.type === "experience")!.items[0].resolvedContent.title, "Lead Power BI Specialist");

  // Step 16: Modify Career Vault (Invariants 4 & 5)
  console.log("Step 16: Modify Career Vault after versions were saved");
  vaultRepo.updateVaultItem(depiExperience.id, {
    content: {
      organization: "DEPI - Altered in Vault Later",
      title: "Completely Changed Title",
      bullets: ["Vault mutated bullet"],
    },
  });

  // Step 17: Confirm previous saved versions remain completely unchanged
  console.log("Step 17: Confirm historical version snapshots remain frozen");
  const verifyV1 = versionsRepo.getVersionById(versionA1.id)!;
  const historicalDepi = verifyV1.snapshot.sections.find((s) => s.type === "experience")!.items[0];
  assert.equal(historicalDepi.resolvedContent.organization, "Digital Egypt Pioneers Initiative (DEPI)");
  assert.equal(historicalDepi.resolvedContent.title, "Power BI Specialist Trainee");
  assert.equal((historicalDepi.resolvedContent.bullets as string[])[0], "Delivered three freelance data projects using Power BI and DAX.");

  console.log("✓ All 17 Product Success Criteria steps and Invariants successfully verified!");
}

runPhase12Tests().catch((err) => {
  console.error("Phase 12 Test failed:", err);
  process.exit(1);
});
