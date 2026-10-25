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

async function runTemplateTests() {
  console.log("--- Starting ClassicTemplateV1 & Snapshot Resolution Tests ---");

  const db = createTestDatabase();
  const resumesRepo = new ResumesRepository(db);
  const vaultRepo = new VaultRepository(db);
  const profileRepo = new ProfileRepository(db);

  // 1. Setup profile matching Abdullah_Ramadan_Resume.tex
  profileRepo.updateProfile({
    fullName: "Abdullah Ramadan",
    email: "abdullahramadan661@gmail.com",
    phone: "+20 100 525 1762",
    location: "Giza, Egypt",
    linkedinUrl: "https://www.linkedin.com/in/abdullah-ramadan661/",
    githubUrl: "https://github.com/Abdullah-Essam21",
  });
  const profile = profileRepo.getProfile();

  // 2. Add sample vault items matching the LaTeX template
  console.log("Test 1: Create vault items for Education, Experience, Projects, Skills");
  const eduItem = vaultRepo.createVaultItem({
    category: "education",
    layout: "timeline",
    content: {
      organization: "Modern Academy for Computer Science & Management Technology",
      title: "Major: Management Information Systems (MIS)",
      startDate: "",
      endDate: "Expected Jun 2026",
      location: "CGPA: 3.61 / 4.0",
      link: "",
      bullets: [],
    },
  });

  const expItem = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    content: {
      organization: "Digital Egypt Pioneers Initiative (DEPI)",
      title: "Power BI Specialist Intern",
      startDate: "Jun 2025",
      endDate: "Feb 2026",
      location: "Cairo, Egypt",
      link: "https://depi.gov.eg",
      bullets: [
        "Completed intensive training in Data Analytics, Statistics, and delivered **three freelance data projects**.",
        "Led the final project team: assigned tasks, coordinated effort and ensured all deadlines were met.",
      ],
    },
  });

  const projItem = vaultRepo.createVaultItem({
    category: "project",
    layout: "timeline",
    content: {
      title: "Egyptian News Analytics Pipeline",
      organization: "Python, Airflow, Docker, Scrapy, PyArrow, BigQuery",
      link: "https://github.com/Abdullah-Essam21/news_pipline",
      bullets: [
        "Built a containerized Airflow pipeline that scrapes **2M+ articles** (2013–2026).",
        "Wrote adaptive parsing logic achieving **100% content capture**.",
      ],
    },
  });

  const skillItem = vaultRepo.createVaultItem({
    category: "skill",
    layout: "tags",
    content: {
      category: "BI & Visualization",
      tags: ["Power BI (DAX, Power Query, Data Modeling)", "Excel (Pivot Tables, Lookups)", "Looker Studio"],
    },
  });

  const certItem = vaultRepo.createVaultItem({
    category: "certification",
    layout: "record",
    content: {
      title: "Google Data Analytics Professional",
      issuer: "Google",
      date: "2025",
      link: "https://drive.google.com/file/d/sample/view",
      description: "Comprehensive data analytics specialization",
    },
  });

  const allVaultItems = vaultRepo.getVaultItems({ includeArchived: true });
  assert.equal(allVaultItems.length, 5);

  // 3. Create resume draft
  console.log("Test 2: Create resume and populate draft sections");
  const draft = getDefaultResumeDraft("Data Analyst | Power BI Specialist");
  
  // Populate sections with vault item IDs
  const eduSec = draft.sections.find((s) => s.type === "education")!;
  eduSec.items.push({ vaultItemId: eduItem.id, visible: true, overrides: {} });

  const expSec = draft.sections.find((s) => s.type === "experience")!;
  expSec.items.push({
    vaultItemId: expItem.id,
    visible: true,
    overrides: {
      title: "Senior Power BI Specialist Intern", // Override role for this variant!
      link: "https://depi-alumni.gov.eg", // Override link for this variant!
    },
  });

  const projSec = draft.sections.find((s) => s.type === "projects")!;
  projSec.items.push({ vaultItemId: projItem.id, visible: true, overrides: {} });

  const skillSec = draft.sections.find((s) => s.type === "skills")!;
  skillSec.items.push({ vaultItemId: skillItem.id, visible: true, overrides: {} });

  const certSec = draft.sections.find((s) => s.type === "certifications")!;
  certSec.items.push({ vaultItemId: certItem.id, visible: true, overrides: {} });

  const resume = resumesRepo.createResume({
    name: "Power BI Specialist Resume",
    draft,
  });

  // 4. Resolve ResumeSnapshot
  console.log("Test 3: Resolve normalized ResumeSnapshot");
  const snapshot = resolveResumeSnapshot(resume, profile, allVaultItems);

  assert.equal(snapshot.templateId, "classic");
  assert.equal(snapshot.templateVersion, 1);
  assert.equal(snapshot.profile.fullName, "Abdullah Ramadan");
  assert.equal(snapshot.professionalTitle, "Data Analyst | Power BI Specialist");
  assert.equal(snapshot.sections.length, 6);

  // 5. Test override application in resolved snapshot
  console.log("Test 4: Verify item-level override is reflected in snapshot");
  const resolvedExpSec = snapshot.sections.find((s) => s.type === "experience")!;
  assert.equal(resolvedExpSec.items.length, 1);
  // Original was "Power BI Specialist Intern", override is "Senior Power BI Specialist Intern"
  assert.equal(resolvedExpSec.items[0].content.title, "Power BI Specialist Intern");
  assert.equal(resolvedExpSec.items[0].resolvedContent.title, "Senior Power BI Specialist Intern");
  assert.equal(resolvedExpSec.items[0].resolvedContent.link, "https://depi-alumni.gov.eg");

  // 6. Test timeline item bullets & GitHub project link
  console.log("Test 5: Verify project GitHub link, tech stack, and bullets");
  const resolvedProjSec = snapshot.sections.find((s) => s.type === "projects")!;
  assert.equal(resolvedProjSec.items.length, 1);
  assert.equal(resolvedProjSec.items[0].resolvedContent.title, "Egyptian News Analytics Pipeline");
  assert.equal(resolvedProjSec.items[0].resolvedContent.link, "https://github.com/Abdullah-Essam21/news_pipline");
  const bullets = resolvedProjSec.items[0].resolvedContent.bullets as string[];
  assert.ok(bullets[0].includes("**2M+ articles**"));

  // 7. Test tags layout (Skills)
  console.log("Test 6: Verify skills tags layout");
  const resolvedSkillSec = snapshot.sections.find((s) => s.type === "skills")!;
  assert.equal(resolvedSkillSec.items[0].layout, "tags");
  assert.equal(resolvedSkillSec.items[0].resolvedContent.category, "BI & Visualization");

  console.log("✓ All ClassicTemplateV1 & Snapshot Resolution tests passed successfully!");
}

runTemplateTests().catch((err) => {
  console.error("Template Test failed:", err);
  process.exit(1);
});
