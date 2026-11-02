import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { initializeDatabase } from "../lib/db/schema";
import { ResumesRepository } from "../lib/db/repositories/resumes.repository";
import { VaultRepository } from "../lib/db/repositories/vault.repository";
import { ProfileRepository } from "../lib/db/repositories/profile.repository";
import { resolveResumeSnapshot } from "../lib/utils/resolve-snapshot";
import { getDefaultResumeDraft } from "../lib/types/resume";

function createTestDatabase(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  initializeDatabase(db);
  return db;
}

async function runPhase7Tests() {
  console.log("--- Starting Phase 7 Resume-Specific Overrides Tests ---");

  const db = createTestDatabase();
  const resumesRepo = new ResumesRepository(db);
  const vaultRepo = new VaultRepository(db);
  const profileRepo = new ProfileRepository(db);

  const profile = profileRepo.getProfile();

  // 1. Setup shared Career Vault items
  console.log("Test 1: Create canonical Career Vault items");
  const originalVaultExperience = vaultRepo.createVaultItem({
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
        "Analyzed operational datasets using Excel and Python.",
        "Created routine management status reports.",
      ],
    },
  });

  const originalVaultProject = vaultRepo.createVaultItem({
    category: "project",
    layout: "timeline",
    content: {
      title: "Supply Chain Analytics Dashboard",
      organization: "Power BI, SQL, DAX",
      link: "https://github.com/test/supply-chain",
      bullets: [
        "Built Power BI dashboard for 180k rows.",
      ],
    },
  });

  const originalVaultSkill = vaultRepo.createVaultItem({
    category: "skill",
    layout: "tags",
    content: {
      category: "BI & Analytics",
      tags: ["Power BI", "Excel", "Tableau", "Looker", "SQL", "Python"],
    },
  });

  // 2. Create Resume A (Base resume with no overrides)
  console.log("Test 2: Create Resume A with default vault references");
  const draftA = getDefaultResumeDraft("General Data Analyst");
  draftA.sections.find((s) => s.type === "experience")!.items.push({
    vaultItemId: originalVaultExperience.id,
    visible: true,
    overrides: {},
  });
  draftA.sections.find((s) => s.type === "projects")!.items.push({
    vaultItemId: originalVaultProject.id,
    visible: true,
    overrides: {},
  });
  draftA.sections.find((s) => s.type === "skills")!.items.push({
    vaultItemId: originalVaultSkill.id,
    visible: true,
    overrides: {},
  });

  const resumeA = resumesRepo.createResume({
    name: "Resume A - General Data Analyst",
    draft: draftA,
  });

  // 3. Duplicate Resume A to Resume B (Invariant 2: Independence)
  console.log("Test 3: Fork Resume B as a specialized variant");
  const resumeB = resumesRepo.duplicateResume(resumeA.id, {
    name: "Resume B - Senior Power BI Specialist",
    professionalTitle: "Lead Power BI Developer",
  });
  assert.ok(resumeB);

  // 4. Apply deep overrides on Resume B
  console.log("Test 4: Apply item-level overrides on Resume B (role, bullets, tech stack, skills)");
  const draftB = { ...resumeB.draft };
  const expSectionB = draftB.sections.find((s) => s.type === "experience")!;
  expSectionB.items[0].overrides = {
    title: "Power BI & Analytics Specialist", // Override role title
    organization: "CIB - Sustainability & Analytics Division", // Override company display
    bullets: [
      "Completed rigorous sustainability program and delivered **three freelance data projects**.",
      "Achieved **perfect score** on final certification exam.",
    ],
  };

  const projSectionB = draftB.sections.find((s) => s.type === "projects")!;
  projSectionB.items[0].overrides = {
    title: "Enterprise Supply Chain Optimization Pipeline", // Override project title
    organization: "Power BI (Star Schema, DAX, Time Intelligence), SQL Window Functions", // Override tech stack
    link: "https://github.com/test/enterprise-supply-chain", // Override repo link
  };

  const skillSectionB = draftB.sections.find((s) => s.type === "skills")!;
  skillSectionB.items[0].overrides = {
    tags: ["Power BI (DAX, Data Modeling)", "SQL Window Functions"], // Tailor to target role
  };

  const updatedResumeB = resumesRepo.updateResume(resumeB.id, { draft: draftB });
  assert.ok(updatedResumeB);

  // 5. Invariant 1 & 2 Verification: Career Vault remains pristine
  console.log("Test 5: Invariant 1 & 2 - Career Vault record remains completely untouched");
  const vaultCheck = vaultRepo.getVaultItemById(originalVaultExperience.id);
  assert.ok(vaultCheck);
  const vaultContent = vaultCheck.content as Record<string, unknown>;
  assert.equal(vaultContent.title, "Data Intern");
  assert.equal(vaultContent.organization, "Commercial International Bank (CIB)");
  assert.equal((vaultContent.bullets as string[])[0], "Analyzed operational datasets using Excel and Python.");

  // 6. Invariant 2 Verification: Resume A remains completely untouched
  console.log("Test 6: Invariant 2 - Resume A draft remains unaffected by Resume B overrides");
  const resumeACheck = resumesRepo.getResumeById(resumeA.id)!;
  const expA = resumeACheck.draft.sections.find((s) => s.type === "experience")!.items[0];
  assert.deepEqual(expA.overrides, {});

  const snapshotA = resolveResumeSnapshot(resumeACheck, profile, [
    originalVaultExperience,
    originalVaultProject,
    originalVaultSkill,
  ]);
  const resolvedExpA = snapshotA.sections.find((s) => s.type === "experience")!.items[0];
  assert.equal(resolvedExpA.resolvedContent.title, "Data Intern");
  assert.equal(resolvedExpA.resolvedContent.organization, "Commercial International Bank (CIB)");

  // 7. Verify Resume B snapshot renders all overrides correctly
  console.log("Test 7: Resume B snapshot resolves and reflects all tailored overrides");
  const snapshotB = resolveResumeSnapshot(updatedResumeB, profile, [
    originalVaultExperience,
    originalVaultProject,
    originalVaultSkill,
  ]);

  const resolvedExpB = snapshotB.sections.find((s) => s.type === "experience")!.items[0];
  assert.equal(resolvedExpB.resolvedContent.title, "Power BI & Analytics Specialist");
  assert.equal(resolvedExpB.resolvedContent.organization, "CIB - Sustainability & Analytics Division");
  assert.equal(
    (resolvedExpB.resolvedContent.bullets as string[])[0],
    "Completed rigorous sustainability program and delivered **three freelance data projects**."
  );

  const resolvedProjB = snapshotB.sections.find((s) => s.type === "projects")!.items[0];
  assert.equal(resolvedProjB.resolvedContent.title, "Enterprise Supply Chain Optimization Pipeline");
  assert.equal(
    resolvedProjB.resolvedContent.organization,
    "Power BI (Star Schema, DAX, Time Intelligence), SQL Window Functions"
  );
  assert.equal(resolvedProjB.resolvedContent.link, "https://github.com/test/enterprise-supply-chain");

  const resolvedSkillB = snapshotB.sections.find((s) => s.type === "skills")!.items[0];
  assert.deepEqual(resolvedSkillB.resolvedContent.tags, [
    "Power BI (DAX, Data Modeling)",
    "SQL Window Functions",
  ]);

  console.log("✓ All Phase 7 Resume-Specific Overrides tests passed successfully!");
}

runPhase7Tests().catch((err) => {
  console.error("Phase 7 Test failed:", err);
  process.exit(1);
});
