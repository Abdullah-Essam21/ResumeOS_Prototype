import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { initializeDatabase } from "../lib/db/schema";
import { ResumesRepository } from "../lib/db/repositories/resumes.repository";
import { VaultRepository } from "../lib/db/repositories/vault.repository";
import { getDefaultResumeDraft } from "../lib/types/resume";

function createTestDatabase(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  initializeDatabase(db);
  return db;
}

async function runPhase6Tests() {
  console.log("--- Starting Phase 6 Resume Builder Tests ---");

  const db = createTestDatabase();
  const resumesRepo = new ResumesRepository(db);
  const vaultRepo = new VaultRepository(db);

  // 1. Seed vault items
  const expItem1 = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    content: {
      organization: "CIB",
      title: "Data Intern",
      bullets: ["Built automated reporting"],
    },
  });

  const expItem2 = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    content: {
      organization: "DEPI",
      title: "BI Specialist Trainee",
      bullets: ["Power BI dashboards"],
    },
  });

  // 2. Create resume with default draft
  console.log("Test 1: Initialize resume draft");
  const resume = resumesRepo.createResume({
    name: "Data Analyst Resume",
    draft: getDefaultResumeDraft("Data Analyst"),
  });
  assert.equal(resume.draft.professionalTitle, "Data Analyst");
  assert.equal(resume.draft.sections.length, 6);

  // 3. Add items from vault into a section
  console.log("Test 2: Add items from Vault into Experience section");
  const expSectionIndex = resume.draft.sections.findIndex((s) => s.type === "experience");
  assert.ok(expSectionIndex >= 0);

  const updatedSections = [...resume.draft.sections];
  updatedSections[expSectionIndex] = {
    ...updatedSections[expSectionIndex],
    items: [
      { vaultItemId: expItem1.id, visible: true, overrides: {} },
      { vaultItemId: expItem2.id, visible: true, overrides: {} },
    ],
  };

  const saved1 = resumesRepo.updateResume(resume.id, {
    draft: {
      ...resume.draft,
      sections: updatedSections,
    },
  });
  assert.ok(saved1);
  assert.equal(saved1.draft.sections[expSectionIndex].items.length, 2);
  assert.equal(saved1.draft.sections[expSectionIndex].items[0].vaultItemId, expItem1.id);

  // 4. Item reordering (move second item up)
  console.log("Test 3: Item reordering within section");
  const reorderedItems = [
    saved1.draft.sections[expSectionIndex].items[1],
    saved1.draft.sections[expSectionIndex].items[0],
  ];
  updatedSections[expSectionIndex] = {
    ...updatedSections[expSectionIndex],
    items: reorderedItems,
  };

  const saved2 = resumesRepo.updateResume(resume.id, {
    draft: {
      ...saved1.draft,
      sections: updatedSections,
    },
  });
  assert.ok(saved2);
  assert.equal(saved2.draft.sections[expSectionIndex].items[0].vaultItemId, expItem2.id);
  assert.equal(saved2.draft.sections[expSectionIndex].items[1].vaultItemId, expItem1.id);

  // 5. Invariant 7: Custom Section Display Name (type stays semantic, displayName changes)
  console.log("Test 4: Invariant 7 - Rename section display name without changing semantic type");
  updatedSections[expSectionIndex] = {
    ...updatedSections[expSectionIndex],
    displayName: "Professional Work Experience",
  };

  const saved3 = resumesRepo.updateResume(resume.id, {
    draft: {
      ...saved2.draft,
      sections: updatedSections,
    },
  });
  assert.ok(saved3);
  assert.equal(saved3.draft.sections[expSectionIndex].type, "experience"); // Semantic type preserved!
  assert.equal(saved3.draft.sections[expSectionIndex].displayName, "Professional Work Experience");

  // 6. Section reordering (move Projects section to the first position)
  console.log("Test 5: Section reordering");
  const projSection = saved3.draft.sections.find((s) => s.type === "projects");
  const otherSections = saved3.draft.sections.filter((s) => s.type !== "projects");
  const reorderedSections = [projSection!, ...otherSections];

  const saved4 = resumesRepo.updateResume(resume.id, {
    draft: {
      ...saved3.draft,
      sections: reorderedSections,
    },
  });
  assert.ok(saved4);
  assert.equal(saved4.draft.sections[0].type, "projects");
  assert.equal(saved4.draft.sections[1].type, "experience");

  // 7. Toggle visibility (hide section and hide individual item)
  console.log("Test 6: Toggle section and item visibility");
  reorderedSections[0] = { ...reorderedSections[0], visible: false }; // Hide projects
  reorderedSections[1].items[0] = { ...reorderedSections[1].items[0], visible: false }; // Hide first experience

  const saved5 = resumesRepo.updateResume(resume.id, {
    draft: {
      ...saved4.draft,
      sections: reorderedSections,
    },
  });
  assert.ok(saved5);
  assert.equal(saved5.draft.sections[0].visible, false);
  assert.equal(saved5.draft.sections[1].items[0].visible, false);

  // 8. Edit Professional Target Title
  console.log("Test 7: Edit professional target title");
  const saved6 = resumesRepo.updateResume(resume.id, {
    draft: {
      ...saved5.draft,
      professionalTitle: "Lead Business Intelligence Engineer",
    },
  });
  assert.ok(saved6);
  assert.equal(saved6.draft.professionalTitle, "Lead Business Intelligence Engineer");

  // 9. Remove item from section
  console.log("Test 8: Remove item from section");
  reorderedSections[1].items = [reorderedSections[1].items[1]]; // Keep only 1 item

  const saved7 = resumesRepo.updateResume(resume.id, {
    draft: {
      ...saved6.draft,
      sections: reorderedSections,
    },
  });
  assert.ok(saved7);
  assert.equal(saved7.draft.sections[1].items.length, 1);
  assert.equal(saved7.draft.sections[1].items[0].vaultItemId, expItem1.id);

  console.log("✓ All Phase 6 Resume Builder tests passed successfully!");
}

runPhase6Tests().catch((err) => {
  console.error("Phase 6 Test failed:", err);
  process.exit(1);
});
