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

async function runPhase4Tests() {
  console.log("--- Starting Phase 4 Resume Creation & List Tests ---");

  const db = createTestDatabase();
  const resumesRepo = new ResumesRepository(db);
  const vaultRepo = new VaultRepository(db);

  // Seed a vault item to reference in resumes
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
      bullets: ["Automated dashboards"],
    },
  });

  // Test 1: Create Blank Resume (with default sections)
  console.log("Test 1: Create Blank Resume with default semantic sections");
  const blankResume = resumesRepo.createResume({
    name: "General Resume",
  });
  assert.ok(blankResume.id);
  assert.equal(blankResume.name, "General Resume");
  assert.equal(blankResume.draft.sections.length, 6, "Default draft should include 6 standard sections");
  assert.equal(blankResume.draft.sections[0].type, "experience");
  assert.equal(blankResume.draft.sections[1].type, "projects");

  // Test 2: Create Resume with Target Title and custom draft
  console.log("Test 2: Create Resume with target title and draft");
  const dataAnalystResume = resumesRepo.createResume({
    name: "Data Analyst Resume",
    draft: {
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
              visible: true,
              overrides: { title: "Junior Data Analyst" },
            },
          ],
        },
      ],
    },
  });
  assert.equal(dataAnalystResume.name, "Data Analyst Resume");
  assert.equal(dataAnalystResume.draft.professionalTitle, "Data Analyst");

  // Test 3: List resumes (order by updated_at DESC)
  console.log("Test 3: List resumes");
  const list = resumesRepo.getResumes();
  assert.equal(list.length, 2);
  assert.equal(list[0].id, dataAnalystResume.id); // Most recently updated/created

  // Test 4: Rename and Update Resume
  console.log("Test 4: Rename and update resume");
  const updated = resumesRepo.updateResume(dataAnalystResume.id, {
    name: "Senior Data Analyst Resume",
    draft: {
      ...dataAnalystResume.draft,
      professionalTitle: "Senior Data Analyst",
    },
  });
  assert.ok(updated);
  assert.equal(updated.name, "Senior Data Analyst Resume");
  assert.equal(updated.draft.professionalTitle, "Senior Data Analyst");

  // Test 5: Duplicate Resume / Fork Variant (Invariant 2)
  console.log("Test 5: Duplicate resume into independent variant (Invariant 2)");
  const powerBiVariant = resumesRepo.duplicateResume(
    dataAnalystResume.id,
    "Power BI Developer Resume"
  );
  assert.notEqual(powerBiVariant.id, dataAnalystResume.id);
  assert.equal(powerBiVariant.name, "Power BI Developer Resume");
  assert.equal(powerBiVariant.draft.professionalTitle, "Senior Data Analyst");

  // Mutate duplicate variant
  resumesRepo.updateResume(powerBiVariant.id, {
    draft: {
      professionalTitle: "Power BI Specialist",
      sections: [],
    },
  });

  // Verify original was unaffected
  const reloadedOriginal = resumesRepo.getResumeById(dataAnalystResume.id);
  assert.equal(reloadedOriginal?.draft.professionalTitle, "Senior Data Analyst");
  assert.equal(reloadedOriginal?.draft.sections.length, 1);

  // Test 6: Archive / Unarchive Resume
  console.log("Test 6: Soft archival and filtering");
  resumesRepo.archiveResume(blankResume.id);

  const activeResumes = resumesRepo.getResumes();
  assert.equal(activeResumes.length, 2);
  assert.ok(!activeResumes.some((r) => r.id === blankResume.id));

  const allResumes = resumesRepo.getResumes({ includeArchived: true });
  assert.equal(allResumes.length, 3);
  assert.ok(allResumes.some((r) => r.id === blankResume.id));

  resumesRepo.unarchiveResume(blankResume.id);
  assert.equal(resumesRepo.getResumes().length, 3);

  // Test 7: Delete resume
  console.log("Test 7: Delete resume");
  const deleted = resumesRepo.deleteResume(blankResume.id);
  assert.equal(deleted, true);
  assert.equal(resumesRepo.getResumes({ includeArchived: true }).length, 2);

  console.log("✓ All Phase 4 Resume Creation & List tests passed successfully!");
}

runPhase4Tests().catch((err) => {
  console.error("Phase 4 Test failed:", err);
  process.exit(1);
});
