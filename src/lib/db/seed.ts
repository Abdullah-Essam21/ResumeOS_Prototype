import type Database from "better-sqlite3";
import { getDb } from "./index";
import { ProfileRepository } from "./repositories/profile.repository";
import { VaultRepository } from "./repositories/vault.repository";
import { ResumesRepository } from "./repositories/resumes.repository";

export function seedDatabase(database: Database.Database = getDb()): void {
  const profileRepo = new ProfileRepository(database);
  const vaultRepo = new VaultRepository(database);
  const resumesRepo = new ResumesRepository(database);

  // 1. Seed or update default profile
  profileRepo.updateProfile({
    fullName: "Abdullah Essam",
    email: "abdullah@example.com",
    phone: "+20 100 000 0000",
    location: "Cairo, Egypt",
    website: "https://abdullahessam.dev",
    linkedinUrl: "https://linkedin.com/in/abdullahessam",
    githubUrl: "https://github.com/abdullahessam",
  });

  // Check if vault items already exist
  const existingVault = vaultRepo.getVaultItems({ includeArchived: true });
  if (existingVault.length > 0) {
    return; // Already seeded
  }

  // 2. Seed Career Vault items
  const expCib = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    displayOrder: 1,
    content: {
      organization: "Commercial International Bank (CIB)",
      title: "Data & BI Intern (Green Leap)",
      startDate: "Aug 2025",
      endDate: "Sep 2025",
      location: "Cairo, Egypt",
      bullets: [
        "Analyzed operational workflows and designed automated internal dashboards.",
        "Worked with SQL queries and Power BI models to present retail banking trends.",
        "Collaborated with cross-functional teams on green financing data initiatives.",
      ],
    },
  });

  const eduModern = vaultRepo.createVaultItem({
    category: "education",
    layout: "timeline",
    displayOrder: 1,
    content: {
      organization: "Modern Academy in Maadi",
      title: "B.Sc. Management Information Systems",
      startDate: "2024",
      endDate: "2028",
      location: "Cairo, Egypt",
      bullets: [
        "Relevant Coursework: Database Management, Systems Analysis, Data Structures, Business Statistics.",
      ],
    },
  });

  const projDashboard = vaultRepo.createVaultItem({
    category: "project",
    layout: "timeline",
    displayOrder: 1,
    content: {
      organization: "Independent Project",
      title: "Egyptian Thanawya Amma Analytics Dashboard",
      startDate: "Jun 2025",
      endDate: "Jul 2025",
      location: "Cairo, Egypt",
      bullets: [
        "Analyzed 700,000+ national high school student exam records using Python and SQL.",
        "Built an interactive Power BI dashboard tracking score distributions and governorate performance.",
        "Optimized DAX measures for real-time filtering across percentiles.",
      ],
    },
  });

  const certGoogle = vaultRepo.createVaultItem({
    category: "certification",
    layout: "record",
    displayOrder: 1,
    content: {
      title: "Google Data Analytics Professional Certificate",
      issuer: "Google / Coursera",
      date: "2025",
      link: "https://coursera.org",
      description:
        "Rigorous 8-course certification covering SQL, R programming, Tableau, and spreadsheet modeling.",
    },
  });

  const achNasa = vaultRepo.createVaultItem({
    category: "achievement",
    layout: "record",
    displayOrder: 1,
    content: {
      title: "NASA Space Apps Cairo 2025",
      issuer: "NASA Space Apps Challenge",
      date: "Oct 2025",
      link: "",
      description:
        "Tech-Ops Volunteer supporting 500+ hackathon participants and judging logistics.",
    },
  });

  const skillProg = vaultRepo.createVaultItem({
    category: "skill",
    layout: "tags",
    displayOrder: 1,
    content: {
      category: "Programming & Querying",
      tags: ["Python", "SQL", "DAX", "R"],
    },
  });

  const skillBi = vaultRepo.createVaultItem({
    category: "skill",
    layout: "tags",
    displayOrder: 2,
    content: {
      category: "BI & Visualization",
      tags: ["Power BI", "Excel", "Data Modeling", "ETL"],
    },
  });

  // 3. Seed initial resumes
  resumesRepo.createResume({
    name: "Data Analyst Resume",
    templateId: "classic",
    templateVersion: 1,
    draft: {
      professionalTitle: "Data Analyst",
      sections: [
        {
          id: "experience",
          type: "experience",
          displayName: "Experience",
          visible: true,
          items: [
            {
              vaultItemId: expCib.id,
              visible: true,
              overrides: {},
            },
          ],
        },
        {
          id: "projects",
          type: "projects",
          displayName: "Key Projects",
          visible: true,
          items: [
            {
              vaultItemId: projDashboard.id,
              visible: true,
              overrides: {},
            },
          ],
        },
        {
          id: "education",
          type: "education",
          displayName: "Education",
          visible: true,
          items: [
            {
              vaultItemId: eduModern.id,
              visible: true,
              overrides: {},
            },
          ],
        },
        {
          id: "skills",
          type: "skills",
          displayName: "Technical Skills",
          visible: true,
          items: [
            {
              vaultItemId: skillProg.id,
              visible: true,
              overrides: {},
            },
            {
              vaultItemId: skillBi.id,
              visible: true,
              overrides: {},
            },
          ],
        },
        {
          id: "certifications",
          type: "certifications",
          displayName: "Certifications",
          visible: true,
          items: [
            {
              vaultItemId: certGoogle.id,
              visible: true,
              overrides: {},
            },
          ],
        },
        {
          id: "achievements",
          type: "achievements",
          displayName: "Volunteer & Achievements",
          visible: true,
          items: [
            {
              vaultItemId: achNasa.id,
              visible: true,
              overrides: {},
            },
          ],
        },
      ],
    },
  });
}
