import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { initializeDatabase } from "../lib/db/schema";
import { ResumesRepository } from "../lib/db/repositories/resumes.repository";
import { VaultRepository } from "../lib/db/repositories/vault.repository";

function createTestDatabase(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  initializeDatabase(db);
  return db;
}

async function runPhase5Tests() {
  console.log("--- Starting Phase 5 Resume Duplication / Variants Tests ---");

  const db = createTestDatabase();
  const resumesRepo = new ResumesRepository(db);
  const vaultRepo = new VaultRepository(db);

  // 1. Seed reusable vault items
  const expItem = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    displayOrder: 1,
    content: {
      organization: "CIB",
      title: "Data Intern",
      startDate: "Aug 2025",
      endDate: "Sep 2025",
      bullets: ["Automated reporting workflows."],
    },
  });

  const projItem = vaultRepo.createVaultItem({
    category: "project",
    layout: "timeline",
    displayOrder: 1,
    content: {
      organization: "Personal",
      title: "Thanawya Dashboard",
      startDate: "Jun 2025",
      endDate: "Jul 2025",
      bullets: ["Power BI dashboard analyzing 700k records."],
    },
  });

  // 2. Create Base Resume: Data Analyst Resume
  console.log("Test 1: Base resume creation");
  const baseResume = resumesRepo.createResume({
    name: "Data Analyst Resume",
    draft: {
      professionalTitle: "Data Analyst",
      sections: [
        {
          id: "exp",
          type: "experience",
          displayName: "Experience",
          visible: true,
          items: [
            {
              vaultItemId: expItem.id,
              visible: true,
              overrides: {
                title: "Junior Data Analyst",
              },
            },
          ],
        },
        {
          id: "proj",
          type: "projects",
          displayName: "Projects",
          visible: true,
          items: [
            {
              vaultItemId: projItem.id,
              visible: true,
              overrides: {},
            },
          ],
        },
      ],
    },
  });

  // 3. Duplicate Base into Variant: Power BI Developer Resume (spec Section 2 & 15 workflow)
  console.log("Test 2: Fast variant creation with new title (Section 41 workflow)");
  const pbiVariant = resumesRepo.duplicateResume(baseResume.id, {
    name: "Power BI Developer Resume",
    professionalTitle: "Power BI Developer",
  });

  assert.notEqual(pbiVariant.id, baseResume.id);
  assert.equal(pbiVariant.name, "Power BI Developer Resume");
  assert.equal(pbiVariant.draft.professionalTitle, "Power BI Developer");
  assert.equal(pbiVariant.draft.sections.length, 2);
  assert.equal(pbiVariant.draft.sections[0].items[0].overrides.title, "Junior Data Analyst");

  // 4. Invariant 2: Independent custom overrides on Variant
  console.log("Test 3: Invariant 2 - Variant item override independence");
  const updatedVariantSections = JSON.parse(JSON.stringify(pbiVariant.draft.sections));
  // Change override on variant to "Power BI Developer Intern"
  updatedVariantSections[0].items[0].overrides.title = "Power BI Developer Intern";

  resumesRepo.updateResume(pbiVariant.id, {
    draft: {
      professionalTitle: "Power BI Specialist",
      sections: updatedVariantSections,
    },
  });

  // Verify Base resume retains original override "Junior Data Analyst" and title "Data Analyst"
  const reloadedBase = resumesRepo.getResumeById(baseResume.id);
  assert.equal(reloadedBase?.draft.professionalTitle, "Data Analyst");
  assert.equal(reloadedBase?.draft.sections[0].items[0].overrides.title, "Junior Data Analyst");

  // Verify Variant has its updated override
  const reloadedVariant = resumesRepo.getResumeById(pbiVariant.id);
  assert.equal(reloadedVariant?.draft.professionalTitle, "Power BI Specialist");
  assert.equal(reloadedVariant?.draft.sections[0].items[0].overrides.title, "Power BI Developer Intern");

  // 5. Multi-generation duplication (Forking from a variant)
  console.log("Test 4: Multi-generation variant forking");
  const subVariant = resumesRepo.duplicateResume(pbiVariant.id, {
    name: "BI Team Lead Resume",
    professionalTitle: "BI Team Lead",
  });
  assert.notEqual(subVariant.id, pbiVariant.id);
  assert.equal(subVariant.name, "BI Team Lead Resume");
  assert.equal(subVariant.draft.professionalTitle, "BI Team Lead");
  assert.equal(subVariant.draft.sections[0].items[0].overrides.title, "Power BI Developer Intern");

  console.log("✓ All Phase 5 Resume Duplication / Variants tests passed successfully!");
}

runPhase5Tests().catch((err) => {
  console.error("Phase 5 Test failed:", err);
  process.exit(1);
});
