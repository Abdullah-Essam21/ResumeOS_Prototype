import * as React from "react";
import { ResumeSnapshot, ResolvedResumeSection, ResolvedResumeItem } from "@/lib/types/resume";

export interface ClassicTemplateV1Props {
  snapshot: ResumeSnapshot;
  className?: string;
}

/**
 * Helper to render text with **bold** markers as <strong> tags,
 * matching LaTeX \textbf{...} in Jake's resume.
 */
function FormattedText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  if (parts.length === 1) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-bold text-black">
            {part}
          </strong>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

/**
 * Renders a timeline entry (Experience / Education / Detailed Projects)
 * matching \resumeSubheading in Jake's Resume LaTeX template:
 *
 * \resumeSubheading
 *   {Role / Title or University}{Date / CGPA}
 *   {Organization / Major}{Location / Certificate Link}
 */
function TimelineEntry({
  item,
  sectionType,
}: {
  item: ResolvedResumeItem;
  sectionType: string;
}) {
  const c = item.resolvedContent;
  const organization = String(c.organization || "");
  const title = String(c.title || "");
  const startDate = String(c.startDate || "");
  const endDate = String(c.endDate || "");
  const location = String(c.location || "");
  const link = String(c.link || "");
  const bullets = Array.isArray(c.bullets) ? (c.bullets as string[]) : [];

  const isEducation = sectionType === "education";
  const isExperience = sectionType === "experience";

  // In Jake's Resume:
  // Education: Row 1 = [University, Date/CGPA], Row 2 = [Major / Degree, Location]
  // Experience: Row 1 = [Role / Title, Date], Row 2 = [Company / Organization, Location/Link]
  const topPrimary = isEducation ? (organization || title) : (title || organization);
  const topSecondary =
    startDate && endDate
      ? `${startDate} – ${endDate}`
      : startDate || endDate || "";

  const bottomPrimary = isEducation
    ? (organization ? title : "")
    : (title ? organization : "");

  return (
    <div className="mb-2 last:mb-0">
      {/* Top Row: Primary Title / Org on left, Date / GPA on right */}
      <div className="flex items-baseline justify-between text-[11.5px] leading-snug">
        {isExperience && link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-black no-underline hover:opacity-80 cursor-pointer"
            title="Open link"
          >
            {topPrimary}
          </a>
        ) : (
          <span className="font-bold text-black">{topPrimary}</span>
        )}
        {topSecondary && (
          <span className="text-black font-normal shrink-0 ml-2">
            {topSecondary}
          </span>
        )}
      </div>

      {/* Second Row: Role / Major on left, Location or Certificate Link on right */}
      {(bottomPrimary || location || (!isExperience && link)) && (
        <div className="flex items-baseline justify-between text-[11px] leading-snug">
          <span className="italic text-black font-normal">
            {bottomPrimary}
          </span>
          <span className="italic text-black shrink-0 ml-2">
            {!isExperience && link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-80"
              >
                {location || "Certificate"}
              </a>
            ) : (
              location
            )}
          </span>
        </div>
      )}

      {/* Bullets (\resumeItemList) */}
      {bullets.length > 0 && (
        <ul className="list-disc ml-5 mt-0.5 space-y-0.5 text-[11px] text-black leading-[1.35]">
          {bullets.map((bullet, idx) => (
            <li key={idx} className="pl-0.5">
              <FormattedText text={bullet} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Renders a project entry matching \resumeProjectHeading in LaTeX:
 * \resumeProjectHeading
 *   {\textbf{Project Name} $|$ \emph{Tech Stack}}{\href{url}{\underline{GitHub}}}
 */
function ProjectEntry({ item }: { item: ResolvedResumeItem }) {
  const c = item.resolvedContent;
  const title = String(c.title || c.projectName || "");
  const techStack = String(c.organization || c.description || "");
  const link = String(c.link || "");
  const bullets = Array.isArray(c.bullets) ? (c.bullets as string[]) : [];

  return (
    <div className="mb-2 last:mb-0">
      {/* Heading: Bold Project Name | Italic Technologies, Right-aligned Link */}
      <div className="flex items-baseline justify-between text-[11.5px] leading-snug">
        <div className="text-black">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-black underline underline-offset-2 hover:opacity-80"
              title="View on GitHub"
            >
              {title}
            </a>
          ) : (
            <span className="font-bold">{title}</span>
          )}
          {techStack && (
            <>
              <span className="mx-1.5 text-black font-normal">|</span>
              <span className="italic text-black font-normal">{techStack}</span>
            </>
          )}
        </div>

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-black underline underline-offset-2 shrink-0 ml-2 hover:opacity-80"
          >
            {link.includes("github.com") ? "GitHub" : "Link"}
          </a>
        )}
      </div>

      {/* Bullets */}
      {bullets.length > 0 && (
        <ul className="list-disc ml-5 mt-0.5 space-y-0.5 text-[11px] text-black leading-[1.35]">
          {bullets.map((bullet, idx) => (
            <li key={idx} className="pl-0.5">
              <FormattedText text={bullet} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Renders a skill or tags entry matching \section{Technical Skills} in LaTeX:
 * \textbf{Category}{: Tag 1, Tag 2, Tag 3}
 */
function TagsEntry({ item }: { item: ResolvedResumeItem }) {
  const c = item.resolvedContent;
  const category = String(c.category || "");
  const tags = Array.isArray(c.tags) ? (c.tags as string[]) : [];

  if (!category && tags.length === 0) return null;

  return (
    <div className="text-[11px] text-black leading-snug">
      <span className="font-bold">{category}</span>
      {category && tags.length > 0 && <span className="mr-1">:</span>}
      <span>{tags.join(", ")}</span>
    </div>
  );
}

/**
 * Renders a record entry (Certifications, Achievements, or Simple Records)
 * matching \section{Certifications & Achievements} in LaTeX.
 */
function RecordEntry({ item }: { item: ResolvedResumeItem }) {
  const c = item.resolvedContent;
  const title = String(c.title || "");
  const issuer = String(c.issuer || "");
  const date = String(c.date || "");
  const link = String(c.link || "");
  const description = String(c.description || "");

  return (
    <div className="flex items-baseline justify-between text-[11px] leading-snug mb-1 last:mb-0">
      <div className="text-black">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-2 hover:opacity-80"
          >
            {title}
          </a>
        ) : (
          <span className="font-bold">{title}</span>
        )}
        {issuer && <span className="ml-1 text-black font-normal">({issuer})</span>}
        {description && (
          <span className="ml-1 text-black font-normal">— {description}</span>
        )}
      </div>

      {date && (
        <span className="text-black font-normal shrink-0 ml-2">{date}</span>
      )}
    </div>
  );
}

/**
 * Section dispatcher that selects the right entry layout.
 */
function SectionContent({ section }: { section: ResolvedResumeSection }) {
  const visibleItems = section.items;

  if (visibleItems.length === 0) {
    return (
      <p className="text-[11px] italic text-slate-400">
        No items selected in this section.
      </p>
    );
  }

  // If section type is skills or items are tags layout
  if (section.type === "skills" || visibleItems.every((i) => i.layout === "tags")) {
    return (
      <div className="space-y-0.5">
        {visibleItems.map((item) => (
          <TagsEntry key={item.vaultItemId} item={item} />
        ))}
      </div>
    );
  }

  // If section type is projects
  if (section.type === "projects") {
    return (
      <div className="space-y-2">
        {visibleItems.map((item) =>
          item.layout === "timeline" ? (
            <ProjectEntry key={item.vaultItemId} item={item} />
          ) : (
            <TimelineEntry key={item.vaultItemId} item={item} sectionType={section.type} />
          )
        )}
      </div>
    );
  }

  // If records layout (Certifications, achievements)
  if (visibleItems.every((i) => i.layout === "record")) {
    return (
      <div className="space-y-0.5">
        {visibleItems.map((item) => (
          <RecordEntry key={item.vaultItemId} item={item} />
        ))}
      </div>
    );
  }

  // Default timeline rendering (Experience, Education, etc.)
  return (
    <div className="space-y-2">
      {visibleItems.map((item) => (
        <TimelineEntry key={item.vaultItemId} item={item} sectionType={section.type} />
      ))}
    </div>
  );
}

/**
 * ClassicTemplateV1
 * Professional ATS-friendly single-column layout modeled faithfully after
 * Jake's Resume LaTeX template (Abdullah_Ramadan_Resume.tex).
 */
export function ClassicTemplateV1({
  snapshot,
  className = "",
}: ClassicTemplateV1Props) {
  const { profile, professionalTitle, sections } = snapshot;

  // Contact items for header
  const contactItems: React.ReactNode[] = [];

  if (profile.location) {
    contactItems.push(<span key="loc">{profile.location}</span>);
  }

  if (profile.phone) {
    contactItems.push(
      <a
        key="phone"
        href={`tel:${profile.phone.replace(/\s+/g, "")}`}
        className="underline underline-offset-2 hover:opacity-80"
      >
        {profile.phone}
      </a>
    );
  }

  if (profile.email) {
    contactItems.push(
      <a
        key="email"
        href={`mailto:${profile.email}`}
        className="underline underline-offset-2 hover:opacity-80"
      >
        {profile.email}
      </a>
    );
  }

  if (profile.linkedinUrl) {
    contactItems.push(
      <a
        key="linkedin"
        href={profile.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:opacity-80"
      >
        LinkedIn
      </a>
    );
  }

  if (profile.githubUrl) {
    contactItems.push(
      <a
        key="github"
        href={profile.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:opacity-80"
      >
        GitHub
      </a>
    );
  }

  if (profile.website) {
    contactItems.push(
      <a
        key="website"
        href={profile.website}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:opacity-80"
      >
        Portfolio
      </a>
    );
  }

  // Only render sections that are visible
  const visibleSections = sections.filter((s) => s.visible);

  return (
    <article
      className={`w-full max-w-[8.5in] min-h-[11in] mx-auto bg-white text-black font-serif leading-normal p-8 sm:p-10 print:p-0 print:max-w-none print:shadow-none shadow-sm ${className}`}
      style={{
        fontFamily:
          '"Times New Roman", Times, "Computer Modern Roman", "TeX Gyre Termes", Georgia, Cambria, serif',
      }}
    >
      {/* ---------- HEADING ---------- */}
      <header className="text-center mb-2.5">
        {/* Full Name: Large, Bold, Small-Caps aesthetic */}
        <h1 className="text-2xl sm:text-[25px] font-bold text-black tracking-normal uppercase leading-tight">
          {profile.fullName || "Your Full Name"}
        </h1>

        {/* Target Professional Title */}
        {professionalTitle && (
          <p className="text-[13px] font-normal text-black mt-0.5 leading-tight">
            {professionalTitle}
          </p>
        )}

        {/* Contact Links Row */}
        {contactItems.length > 0 && (
          <div className="text-[11px] text-black mt-1 flex flex-wrap items-center justify-center gap-1.5 leading-tight">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-black font-normal">|</span>}
                {item}
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* ---------- SECTIONS ---------- */}
      <main className="space-y-2">
        {visibleSections.map((section) => (
          <section key={section.id} className="pt-0.5">
            {/* Section Header with horizontal rule (\titlerule) */}
            <div className="border-b border-black pb-[2px] mb-1.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-black">
                {section.displayName}
              </h2>
            </div>

            {/* Section Content */}
            <SectionContent section={section} />
          </section>
        ))}
      </main>
    </article>
  );
}
