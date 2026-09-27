import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { initializeDatabase } from "../lib/db/schema";
import { ProfileRepository } from "../lib/db/repositories/profile.repository";
import { VaultRepository } from "../lib/db/repositories/vault.repository";
import { ResumesRepository } from "../lib/db/repositories/resumes.repository";
import { VersionsRepository } from "../lib/db/repositories/versions.repository";
import { ResumeSnapshot } from "../lib/types/resume";

function createTestDatabase(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  initializeDatabase(db);
  return db;
}

async function runTests() {
  console.log("--- Starting Phase 2 SQLite Database & Schema Tests ---");

  const db = createTestDatabase();
  const profileRepo = new ProfileRepository(db);
  const vaultRepo = new VaultRepository(db);
  const resumesRepo = new ResumesRepository(db);
  const versionsRepo = new VersionsRepository(db, resumesRepo);

  // Test 1: Profile CRUD
  console.log("Test 1: Profile repository");
  const defaultProfile = profileRepo.getProfile();
  assert.equal(defaultProfile.id, "default");
  assert.equal(defaultProfile.fullName, "Your Name");

  const updatedProfile = profileRepo.updateProfile({
    fullName: "Abdullah Essam",
    email: "abdullah@example.com",
    phone: "+201000000000",
    location: "Cairo, Egypt",
    website: "https://abdullahessam.dev",
    linkedinUrl: "https://linkedin.com/in/abdullahessam",
    githubUrl: "https://github.com/abdullahessam",
  });
  assert.equal(updatedProfile.fullName, "Abdullah Essam");
  assert.equal(updatedProfile.email, "abdullah@example.com");

  // Test 2: Vault Item creation (Timeline, Record, Tags)
  console.log("Test 2: Vault item creation and layouts");
  const expItem = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    displayOrder: 1,
    content: {
      organization: "CIB",
      title: "Data Intern",
      startDate: "Aug 2025",
      endDate: "Sep 2025",
      location: "Cairo",
      bullets: ["Built reporting pipelines."],
    },
  });
  assert.ok(expItem.id);
  assert.equal(expItem.category, "experience");
  assert.equal(expItem.layout, "timeline");

  const certItem = vaultRepo.createVaultItem({
    category: "certification",
    layout: "record",
    displayOrder: 1,
    content: {
      title: "Google Data Analytics",
      issuer: "Google",
      date: "2025",
      link: "https://coursera.org",
      description: "Data analytics certification",
    },
  });
  assert.equal(certItem.category, "certification");

  const skillItem = vaultRepo.createVaultItem({
    category: "skill",
    layout: "tags",
    displayOrder: 1,
    content: {
      category: "BI Tools",
      tags: ["Power BI", "DAX", "SQL"],
    },
  });
  assert.equal(skillItem.category, "skill");

  // Test 3: Filtering & Archival
  console.log("Test 3: Filtering and soft archival (Invariant: Archive instead of delete)");
  const experienceItems = vaultRepo.getVaultItems({ category: "experience" });
  assert.equal(experienceItems.length, 1);
  assert.equal(experienceItems[0].id, expItem.id);

  // Archive certItem
  vaultRepo.archiveVaultItem(certItem.id);
  const activeItems = vaultRepo.getVaultItems();
  assert.ok(!activeItems.some((i) => i.id === certItem.id), "Archived item should be excluded by default");

  const allItems = vaultRepo.getVaultItems({ includeArchived: true });
  assert.ok(allItems.some((i) => i.id === certItem.id), "Archived item should be present when includeArchived=true");

  // Unarchive
  vaultRepo.unarchiveVaultItem(certItem.id);
  const activeAfterUnarchive = vaultRepo.getVaultItems();
  assert.ok(activeAfterUnarchive.some((i) => i.id === certItem.id));

  // Test 4: Resume creation & Invariant 2 (Duplication Independence)
  console.log("Test 4: Resume duplication & independence (Invariant 2)");
  const resumeA = resumesRepo.createResume({
    name: "Data Analyst Resume",
    draft: {
      professionalTitle: "Data Analyst",
      sections: [
        {
          id: "exp-sec",
          type: "experience",
          displayName: "Experience",
          visible: true,
          items: [
            {
              vaultItemId: expItem.id,
              visible: true,
              overrides: { title: "Junior Data Analyst" },
            },
          ],
        },
      ],
    },
  });
  assert.equal(resumeA.name, "Data Analyst Resume");

  // Duplicate Resume A to Resume B
  const resumeB = resumesRepo.duplicateResume(resumeA.id, "Power BI Developer Resume");
  assert.notEqual(resumeA.id, resumeB.id);
  assert.equal(resumeB.name, "Power BI Developer Resume");
  assert.equal(resumeB.draft.professionalTitle, "Data Analyst");

  // Modify Resume B
  resumesRepo.updateResume(resumeB.id, {
    draft: {
      professionalTitle: "Power BI Developer",
      sections: resumeB.draft.sections,
    },
  });

  // Verify Resume A was NOT modified
  const reloadedResumeA = resumesRepo.getResumeById(resumeA.id);
  assert.equal(reloadedResumeA?.draft.professionalTitle, "Data Analyst");

  const reloadedResumeB = resumesRepo.getResumeById(resumeB.id);
  assert.equal(reloadedResumeB?.draft.professionalTitle, "Power BI Developer");

  // Test 5: Versioning & Invariant 4 & 5 (Immutability & Snapshot Independence)
  console.log("Test 5: Version immutability & Snapshot independence (Invariants 4 & 5)");

  const snapshotV1: ResumeSnapshot = {
    schemaVersion: 1,
    templateId: "classic",
    templateVersion: 1,
    profile: updatedProfile,
    professionalTitle: "Data Analyst",
    sections: [
      {
        id: "exp-sec",
        type: "experience",
        displayName: "Work Experience",
        visible: true,
        items: [
          {
            vaultItemId: expItem.id,
            category: "experience",
            layout: "timeline",
            content: expItem.content as Record<string, unknown>,
            overrides: {},
            resolvedContent: expItem.content as Record<string, unknown>,
          },
        ],
      },
    ],
  };

  const v1 = versionsRepo.createVersion(resumeA.id, snapshotV1);
  assert.equal(v1.versionNumber, 1);
  assert.equal(v1.snapshot.professionalTitle, "Data Analyst");

  // Create Version 2 for resumeA
  const snapshotV2: ResumeSnapshot = {
    ...snapshotV1,
    professionalTitle: "Senior Analyst",
  };
  const v2 = versionsRepo.createVersion(resumeA.id, snapshotV2);
  assert.equal(v2.versionNumber, 2);

  // Resume B should have its own version sequence starting at 1
  const v1ResumeB = versionsRepo.createVersion(resumeB.id, snapshotV1);
  assert.equal(v1ResumeB.versionNumber, 1);

  // Now, mutate the vault item in Career Vault:
  vaultRepo.updateVaultItem(expItem.id, {
    content: {
      organization: "CIB Renamed",
      title: "VP of Data",
      startDate: "2026",
      endDate: "2027",
      bullets: ["Promoted"],
    },
  });

  // Invariant 5 check: Version 1 snapshot must still contain original "CIB" organization
  const reloadedV1 = versionsRepo.getVersionById(v1.id);
  const v1Content = reloadedV1?.snapshot.sections[0].items[0].resolvedContent as { organization: string };
  assert.equal(v1Content.organization, "CIB", "Snapshot must remain immutable even when Career Vault changes!");

  // Test 6: Restore version
  console.log("Test 6: Restore version to mutable draft");
  versionsRepo.restoreVersion(v1.id);
  const resumeAfterRestore = resumesRepo.getResumeById(resumeA.id);
  assert.equal(resumeAfterRestore?.draft.professionalTitle, "Data Analyst");

  console.log("✓ All Phase 2 SQLite & Schema tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
