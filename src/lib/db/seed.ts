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
    fullName: "Abdullah Ramadan",
    email: "abdullahramadan661@gmail.com",
    phone: "+20 100 525 1762",
    location: "Giza, Egypt",
    linkedinUrl: "https://www.linkedin.com/in/abdullah-ramadan661/",
    githubUrl: "https://github.com/Abdullah-Essam21",
    website: "",
  });

  // Check if vault items already exist
  const existingVault = vaultRepo.getVaultItems({ includeArchived: true });
  if (existingVault.length > 0) {
    return; // Already seeded
  }

  // 2. Seed Career Vault items from Abdullah_Ramadan_Resume.tex
  const eduModern = vaultRepo.createVaultItem({
    category: "education",
    layout: "timeline",
    displayOrder: 1,
    content: {
      organization: "Modern Academy for Computer Science & Management Technology",
      title: "Major: Management Information Systems (MIS)",
      startDate: "",
      endDate: "",
      location: "CGPA: 3.61 / 4.0",
      link: "",
      linkLabel: "",
      bullets: [],
    },
  });

  const skillBi = vaultRepo.createVaultItem({
    category: "skill",
    layout: "tags",
    displayOrder: 1,
    content: {
      category: "BI & Visualization",
      tags: [
        "Power BI (DAX, Power Query, Data Modeling)",
        "Excel (Pivot Tables, Lookups)",
        "Looker Studio",
      ],
    },
  });

  const skillDe = vaultRepo.createVaultItem({
    category: "skill",
    layout: "tags",
    displayOrder: 2,
    content: {
      category: "Data Engineering",
      tags: [
        "Apache Airflow",
        "ETL/ELT",
        "dbt",
        "Star/Snowflake Schema",
        "Data Warehousing",
        "Google BigQuery",
      ],
    },
  });

  const skillLang = vaultRepo.createVaultItem({
    category: "skill",
    layout: "tags",
    displayOrder: 3,
    content: {
      category: "Languages & Libraries",
      tags: [
        "SQL (Window Functions, CTEs, Joins)",
        "Python (Pandas, Polars, PyArrow, PySpark, Scrapy)",
      ],
    },
  });

  const skillTools = vaultRepo.createVaultItem({
    category: "skill",
    layout: "tags",
    displayOrder: 4,
    content: {
      category: "Tools",
      tags: [
        "Docker",
        "Git/GitHub",
        "Jupyter Notebooks",
        "VS Code",
        "Claude Code",
      ],
    },
  });

  const projNews = vaultRepo.createVaultItem({
    category: "project",
    layout: "timeline",
    displayOrder: 1,
    content: {
      title: "Egyptian News Analytics Pipeline",
      organization: "Python, Airflow, Docker, Scrapy, PyArrow, BigQuery",
      link: "https://github.com/Abdullah-Essam21/news_pipline",
      linkLabel: "GitHub",
      startDate: "",
      endDate: "",
      location: "",
      bullets: [
        "Built a containerized Airflow pipeline that scrapes **2M+ articles** (2013–2026) from a leading Egyptian news site, converts JSONL to Parquet with PyArrow, and loads them into BigQuery for SQL and Power BI trend analysis.",
        "Wrote adaptive parsing logic for inconsistent HTML schemas, achieving **100% content capture**.",
        "Reached **1,200+ pages/min** scraping throughput using the Asyncio Proactor event loop.",
      ],
    },
  });

  const projThanawya = vaultRepo.createVaultItem({
    category: "project",
    layout: "timeline",
    displayOrder: 2,
    content: {
      title: "Egyptian Thanawya Amma 2024 & 2025 Results Dashboard",
      organization: "Python, Polars, Power BI",
      link: "https://github.com/Abdullah-Essam21/Egyptian-Thanawya-Amma-2024-Dashboard",
      linkLabel: "GitHub",
      startDate: "",
      endDate: "",
      location: "",
      bullets: [
        "Scraped and consolidated **700K+ exam records** from multiple national systems using asynchronous Python; cleaned and validated them with Polars and Power Query.",
        "Designed an interactive Power BI dashboard that identifies at-risk schools needing government support and flags statistical anomalies indicative of fraud.",
      ],
    },
  });

  const projEcommerce = vaultRepo.createVaultItem({
    category: "project",
    layout: "timeline",
    displayOrder: 3,
    content: {
      title: "E-commerce Sales & Logistics Analysis",
      organization: "Power BI, Power Query, DAX",
      link: "https://github.com/Abdullah-Essam21/Supply-Chain-Analytics-Dashboard-In-Power-Bi",
      linkLabel: "GitHub",
      startDate: "",
      endDate: "",
      location: "",
      bullets: [
        "Transformed a flat file of **180K+ rows and 50+ columns** into an optimized Star Schema in Power Query, including a role-playing date dimension (`USERELATIONSHIP`).",
        "Wrote DAX measures for time intelligence, financial ratios and moving averages; built a dashboard covering operational bottlenecks and customer segmentation.",
      ],
    },
  });

  const expDepi = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    displayOrder: 1,
    content: {
      title: "Power BI Specialist Intern",
      organization: "Digital Egypt Pioneers Initiative (DEPI)",
      startDate: "Jun 2025",
      endDate: "Feb 2026",
      location: "",
      link: "https://drive.google.com/file/d/11SxDxDuJZW7hVigGw6L17-LEO_tty_kU/view?usp=sharing",
      linkLabel: "Certificate",
      bullets: [
        "Completed intensive training in Data Analytics, Statistics, Excel, Power BI/DAX, Azure and Tableau, and delivered **three freelance data projects** for real clients.",
        "Led the final project team: assigned tasks, coordinated effort and ensured all deadlines were met.",
      ],
    },
  });

  const expCib = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    displayOrder: 2,
    content: {
      title: "Business & Sustainability Intern",
      organization: "Commercial International Bank (CIB)",
      startDate: "Aug 2025",
      endDate: "Sep 2025",
      location: "",
      link: "https://drive.google.com/file/d/1ZLAXv5plE2ZGpbVVy8S03Cb2eSB0BRa1/view?usp=drive_link",
      linkLabel: "Certificate",
      bullets: [
        "Completed a 3-week program on sustainability, responsible AI and green finance, applying data-driven insights to business challenges in workshops with CIB partners.",
        "Achieved top performance on CIBOAT assessments and a **perfect score** on the final certification exam.",
      ],
    },
  });

  const expGdg = vaultRepo.createVaultItem({
    category: "experience",
    layout: "timeline",
    displayOrder: 3,
    content: {
      title: "Data Analysis Instructor",
      organization: "Google Developer Groups (GDG) on Campus",
      startDate: "Oct 2024",
      endDate: "Apr 2025",
      location: "",
      link: "",
      linkLabel: "",
      bullets: [
        "Taught Python and data visualization workshops to **10+ students**, including live-coding sessions on real data challenges.",
        "Coached participants on KPI reporting and stakeholder-focused dashboard design.",
      ],
    },
  });

  const certGoogle = vaultRepo.createVaultItem({
    category: "certification",
    layout: "record",
    displayOrder: 1,
    content: {
      title: "Google Data Analytics Professional",
      issuer: "Google",
      date: "",
      link: "https://drive.google.com/file/d/1U0_dg8F3SlnHQzE1fxgUkn2GIDmLbTXS/view?usp=sharing",
      linkLabel: "Certificate",
      description: "",
    },
  });

  const certMckinsey = vaultRepo.createVaultItem({
    category: "certification",
    layout: "record",
    displayOrder: 2,
    content: {
      title: "McKinsey Forward Program",
      issuer: "McKinsey",
      date: "",
      link: "https://drive.google.com/file/d/1vZ9XkmlFC-ZVMtdyJ6gZLSGq-moJ_AAo/view?usp=drive_link",
      linkLabel: "Certificate",
      description: "",
    },
  });

  const certSas = vaultRepo.createVaultItem({
    category: "certification",
    layout: "record",
    displayOrder: 3,
    content: {
      title: "SAS Responsible AI",
      issuer: "SAS / Credly",
      date: "",
      link: "https://www.credly.com/badges/1bc173f1-897d-432e-a187-d370e1f4a50c/public_url",
      linkLabel: "Badge",
      description: "",
    },
  });

  const certEnglish = vaultRepo.createVaultItem({
    category: "certification",
    layout: "record",
    displayOrder: 4,
    content: {
      title: "Business English",
      issuer: "",
      date: "",
      link: "https://drive.google.com/file/d/1YESVkvw9zLRs-MK2OC6l9Z-LDeAQQ3Zs/view?usp=sharing",
      linkLabel: "Certificate",
      description: "",
    },
  });

  const achSql = vaultRepo.createVaultItem({
    category: "achievement",
    layout: "record",
    displayOrder: 5,
    content: {
      title: "SQL Practice",
      issuer: "",
      date: "",
      link: "",
      linkLabel: "",
      description: "Solved 200+ advanced problems on SQLZoo and DataLemur (self-joins, window functions, subqueries)",
    },
  });

  // 3. Seed initial resume matching Abdullah_Ramadan_Resume.tex
  resumesRepo.createResume({
    name: "Abdullah Ramadan — Data Analyst & Power BI",
    templateId: "classic",
    templateVersion: 1,
    draft: {
      professionalTitle: "Data Analyst | Power BI Specialist",
      sections: [
        {
          id: "education",
          type: "education",
          displayName: "Education",
          visible: true,
          displayMode: "stacked",
          items: [{ vaultItemId: eduModern.id, visible: true, overrides: {} }],
        },
        {
          id: "skills",
          type: "skills",
          displayName: "Technical Skills",
          visible: true,
          displayMode: "stacked",
          items: [
            { vaultItemId: skillBi.id, visible: true, overrides: {} },
            { vaultItemId: skillDe.id, visible: true, overrides: {} },
            { vaultItemId: skillLang.id, visible: true, overrides: {} },
            { vaultItemId: skillTools.id, visible: true, overrides: {} },
          ],
        },
        {
          id: "projects",
          type: "projects",
          displayName: "Projects",
          visible: true,
          displayMode: "stacked",
          items: [
            { vaultItemId: projNews.id, visible: true, overrides: {} },
            { vaultItemId: projThanawya.id, visible: true, overrides: {} },
            { vaultItemId: projEcommerce.id, visible: true, overrides: {} },
          ],
        },
        {
          id: "experience",
          type: "experience",
          displayName: "Experience",
          visible: true,
          displayMode: "stacked",
          items: [
            { vaultItemId: expDepi.id, visible: true, overrides: {} },
            { vaultItemId: expCib.id, visible: true, overrides: {} },
            { vaultItemId: expGdg.id, visible: true, overrides: {} },
          ],
        },
        {
          id: "certifications",
          type: "certifications",
          displayName: "Certifications & Achievements",
          visible: true,
          displayMode: "inline",
          items: [
            { vaultItemId: certGoogle.id, visible: true, overrides: {} },
            { vaultItemId: certMckinsey.id, visible: true, overrides: {} },
            { vaultItemId: certSas.id, visible: true, overrides: {} },
            { vaultItemId: certEnglish.id, visible: true, overrides: {} },
            { vaultItemId: achSql.id, visible: true, overrides: {} },
          ],
        },
      ],
    },
  });
}
