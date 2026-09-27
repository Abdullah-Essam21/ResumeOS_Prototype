\# ResumeOS — Local Prototype Technical Specification



\## 1. Product Overview



ResumeOS is a local-first resume management and assembly tool designed to eliminate the need to maintain many manually edited Word documents for different job roles.



The user maintains one \*\*Career Vault\*\* containing reusable professional information.



From that Vault, the user creates multiple \*\*Resume Variants\*\* for different roles, companies, or purposes.



A Resume Variant can be customized with a few clicks:



\* change the professional title

\* add or remove experience

\* add or remove projects

\* reorder content

\* hide/show sections

\* change section names

\* customize individual content

\* create a new resume from an existing resume

\* preview the result

\* print/export it



The central product idea is:



> \*\*Do not rewrite resumes. Assemble and customize them from reusable career information.\*\*



ResumeOS is a \*\*single-user local prototype\*\*.



It is intended to run on the user's own computer and does not require authentication, multi-user support, cloud infrastructure, or internet connectivity for normal operation.



\---



\# 2. Prototype Goal



The prototype should prove that ResumeOS can make creating tailored resumes significantly easier than manually maintaining multiple Word documents.



The primary workflow is:



```text

Career Vault

&#x20;    ↓

Create Resume

&#x20;    ↓

Select reusable content

&#x20;    ↓

Arrange/customize

&#x20;    ↓

Live Preview

&#x20;    ↓

Print / Export

```



A second important workflow is:



```text

Existing Resume

&#x20;    ↓

Duplicate / Create Variant

&#x20;    ↓

Change a few things

&#x20;    ↓

New Resume

```



Example:



```text

Data Analyst Resume

&#x20;       ↓

&#x20;    Duplicate

&#x20;       ↓

Power BI Developer Resume

&#x20;       ↓

Change title

Change selected projects

Adjust skills

&#x20;       ↓

Done

```



Creating the second resume should not require manually copying and editing a Word document.



\---



\# 3. Core Product Principle



ResumeOS should feel like a \*\*resume configuration tool\*\*, not a traditional document editor.



The user should think:



> "Which information do I want in this resume?"



rather than:



> "How do I rewrite this document?"



The system therefore separates:



```text

Career Information

&#x20;       ↓

Resume Configuration

&#x20;       ↓

Rendered Resume

```



Career information is reusable.



Resume configuration determines how that information is used for a particular resume.



\---



\# 4. Prototype Scope



\## Included



The prototype includes:



\* local single-user operation

\* Career Vault

\* profile information

\* reusable experience

\* reusable education

\* reusable projects

\* reusable certifications

\* reusable achievements

\* reusable skills

\* multiple Resume Variants

\* creating resumes from scratch

\* duplicating existing resumes

\* selecting Vault items

\* removing Vault items from a resume

\* reordering items

\* reordering sections

\* hiding/showing sections

\* custom section display names

\* resume-specific overrides

\* changing professional title

\* live resume preview

\* one initial resume template

\* browser print/export

\* immutable saved resume versions/history

\* restoring an old version into the editable resume configuration



\## Explicitly Excluded



The prototype does NOT include:



\* user accounts

\* authentication

\* authorization

\* multi-user support

\* Supabase

\* cloud database

\* RLS

\* applications/job tracking

\* job-board integrations

\* AI resume generation

\* AI job-description matching

\* ATS scoring

\* LinkedIn integration

\* collaboration

\* public resume pages

\* resume sharing

\* analytics

\* cloud PDF generation

\* server-side Chromium

\* DOCX generation

\* multiple visual templates initially



These may be considered later.



\---



\# 5. Local-First Architecture



The prototype runs entirely on the user's computer.



Recommended architecture:



```text

Next.js

&#x20;  │

&#x20;  ├── React UI

&#x20;  │

&#x20;  ├── Server Actions / server-side application logic

&#x20;  │

&#x20;  └── SQLite

&#x20;         │

&#x20;         └── resumeos.db

```



SQLite is the local persistent database.



The application should not require a remote database for normal operation.



The database should be stored locally, for example:



```text

data/resumeos.db

```



The database is the source of truth for mutable application data.



\---



\# 6. Technology Stack



\## Application



\* Next.js

\* React

\* TypeScript

\* App Router



\## UI



\* Tailwind CSS

\* shadcn/ui



\## Database



\* SQLite



A lightweight SQLite library/ORM may be used if it simplifies development, but the database model must remain understandable and relational.



\## Validation



\* Zod



Use typed schemas for flexible content stored in JSON.



\## Resume Rendering



\* React

\* HTML

\* CSS

\* Tailwind where appropriate

\* CSS Paged Media

\* `@media print`



\## PDF



For the prototype:



```text

Browser

&#x20;  ↓

window.print()

&#x20;  ↓

Save as PDF

```



No server-side Chromium is required.



\---



\# 7. High-Level Domain Model



The core model is:



```text

Profile

&#x20;  │

&#x20;  ↓

Career Vault

&#x20;  │

&#x20;  ↓

Resume

&#x20;  │

&#x20;  ├── Draft Configuration

&#x20;  │

&#x20;  └── Versions

```



More specifically:



```text

Profile

&#x20;  │

&#x20;  └── Vault Items

&#x20;         │

&#x20;         ├─────────────┐

&#x20;         │             │

&#x20;         ↓             ↓

&#x20;     Resume A       Resume B

&#x20;         │             │

&#x20;         ↓             ↓

&#x20;      Versions       Versions

```



A Resume is a reusable configuration of Career Vault information.



A Version is an immutable historical snapshot of that Resume.



\---



\# 8. Profile



The prototype has exactly one local user profile.



There is no `user\_id`.



Example fields:



```text

profile

\-------

id

full\_name

email

phone

location

website

linkedin\_url

github\_url

created\_at

updated\_at

```



The profile is used when generating resumes.



Profile data can be edited from the application.



\---



\# 9. Career Vault



The Career Vault is the central source of reusable professional information.



It contains information that may be used across many resumes.



Initial categories:



```text

experience

education

project

certification

achievement

skill

custom

```



The database uses a unified `vault\_items` table rather than creating a separate table for each category.



Conceptually:



```text

vault\_items

\-----------

id

category

layout

display\_order

content

archived\_at

created\_at

updated\_at

```



\---



\# 10. Vault Item Categories



\## Experience



Example:



```text

CIB

Green Leap Intern

Aug 2025 – Sep 2025

Cairo, Egypt



• ...

• ...

```



\## Education



Example:



```text

Modern Academy

B.Sc. Management Information Systems

2024 – 2028

```



\## Project



Example:



```text

Egyptian Thanawya Amma Dashboard



• Analyzed 700,000+ student records

• Built Power BI dashboard

• ...

```



\## Certification



Example:



```text

Google Data Analytics Professional Certificate

Google

2025

```



\## Achievement



Example:



```text

NASA Space Apps Cairo 2025

Tech-Ops Volunteer

```



\## Skill



Example:



```text

Programming

Python

SQL

R

```



\---



\# 11. Vault Item Layouts



The initial prototype supports three basic content shapes.



\## Timeline



For experiences, education, and detailed projects.



```text

{

&#x20; organization,

&#x20; title,

&#x20; startDate,

&#x20; endDate,

&#x20; location,

&#x20; bullets

}

```



\## Record



For certifications, achievements, and simple records.



```text

{

&#x20; title,

&#x20; issuer,

&#x20; date,

&#x20; link,

&#x20; description

}

```



\## Tags



For skills and grouped lists.



```text

{

&#x20; category,

&#x20; tags

}

```



The actual TypeScript/Zod schemas should be discriminated by `layout`.



JSON must not become arbitrary unvalidated data.



\---



\# 12. Career Vault Philosophy



The Career Vault represents:



> \*\*Everything the user might want to say about their professional background.\*\*



It does NOT represent one specific resume.



For example, the Vault might contain:



```text

10 experiences

15 projects

8 certifications

40 skills

```



A particular resume may use only:



```text

2 experiences

3 projects

12 skills

```



The unused information remains available for other Resume Variants.



\---



\# 13. Resume



A Resume is a saved configuration built from the Career Vault.



Example:



```text

Data Analyst Resume

Power BI Developer Resume

Business Analyst Resume

General Resume

```



Conceptually:



```text

resumes

\-------

id

name

template\_id

template\_version

draft

archived\_at

created\_at

updated\_at

```



A Resume does not duplicate all Career Vault records.



It references reusable Vault information through its draft configuration.



\---



\# 14. Resume Creation



The user should be able to create a Resume in two primary ways.



\## Create Blank Resume



```text

\+ New Resume

&#x20;    ↓

Blank Resume

```



The user selects the required Vault content.



\## Create From Existing Resume



```text

Data Analyst Resume

&#x20;      ↓

Create Variant

&#x20;      ↓

Power BI Developer Resume

```



The new Resume receives a copy of the original Resume's current draft configuration.



The two Resumes then become independent.



Changing one does not modify the other.



\---



\# 15. Resume Duplication



Duplication is a first-class feature.



The user should be able to select:



```text

Duplicate Resume

```



or:



```text

Create Variant

```



The system should immediately create a new editable Resume based on the existing configuration.



Example:



```text

Data Analyst Resume

&#x20;      ↓

Duplicate

&#x20;      ↓

Data Analyst Resume Copy

```



The user can then rename it:



```text

Power BI Developer Resume

```



and make a few changes.



This should be significantly faster than copying a Word document.



\---



\# 16. Resume Draft



Each Resume has one mutable draft.



The draft determines:



\* which sections exist

\* which Vault items are selected

\* ordering

\* visibility

\* section names

\* resume-specific overrides

\* template configuration



Example:



```json

{

&#x20; "sections": \[

&#x20;   {

&#x20;     "id": "experience",

&#x20;     "type": "experience",

&#x20;     "displayName": "Experience",

&#x20;     "items": \[

&#x20;       {

&#x20;         "vaultItemId": "123",

&#x20;         "overrides": {}

&#x20;       },

&#x20;       {

&#x20;         "vaultItemId": "456",

&#x20;         "overrides": {

&#x20;           "title": "Power BI Developer"

&#x20;         }

&#x20;       }

&#x20;     ]

&#x20;   },

&#x20;   {

&#x20;     "id": "projects",

&#x20;     "type": "projects",

&#x20;     "displayName": "Projects",

&#x20;     "items": \[

&#x20;       {

&#x20;         "vaultItemId": "789",

&#x20;         "overrides": {}

&#x20;       }

&#x20;     ]

&#x20;   }

&#x20; ]

}

```



The draft is mutable.



\---



\# 17. Resume-Specific Overrides



This is a core feature.



The Career Vault stores the original professional information.



A Resume can override how that information is presented.



Example:



Career Vault:



```text

Role:

Power BI Specialist Intern

```



Resume A:



```text

Power BI Specialist Intern

```



Resume B:



```text

Power BI Developer

```



The Career Vault record remains unchanged.



The override exists only on Resume B.



Possible override targets include:



\* title

\* role

\* project name

\* description

\* bullets

\* organization display name

\* date display

\* location display

\* visibility



The prototype should start with the most useful overrides rather than attempting to make every field editable immediately.



\---



\# 18. Professional Title



The resume's professional title should be easy to change.



Example:



```text

Data Analyst

```



can become:



```text

Power BI Developer

```



without editing the Career Vault.



This should require only a few clicks.



The professional title is Resume-specific.



\---



\# 19. Section Customization



Resume sections have two separate concepts:



```text

type

displayName

```



`type` is semantic and used by the system.



`displayName` is user-facing.



For example:



```text

type:

projects



displayName:

Open Source Contributions

```



The renderer should continue to understand this as the Projects section even though the visible heading has changed.



Do not infer semantic meaning from `displayName`.



\---



\# 20. Resume Builder



The Resume Builder is the central UI of ResumeOS.



It should prioritize fast configuration over document editing.



The user should be able to:



\* add Vault items

\* remove Vault items

\* reorder Vault items

\* reorder sections

\* hide/show sections

\* rename sections

\* edit supported overrides

\* change professional title

\* create variants

\* preview changes immediately



The builder should use client-side reactive state for immediate interaction.



Changes should be persisted without blocking the editing experience.



\---



\# 21. Builder UX Principle



The Builder should communicate:



> "Configure this resume."



Not:



> "Write this resume from scratch."



The user should not repeatedly copy/paste text between resumes.



Common operations should require a few clicks.



\---



\# 22. Recommended Builder Layout



Conceptually:



```text

┌─────────────────────────────────────────────────────────────┐

│ ResumeOS     Power BI Developer Resume     \[Save] \[⋮]      │

├──────────────────────┬──────────────────────────────────────┤

│                      │                                      │

│ RESUME CONFIGURATION │          LIVE PREVIEW                │

│                      │                                      │

│ Professional Title   │          Abdullah Essam              │

│ \[Power BI Developer] │          Power BI Developer          │

│                      │                                      │

│ EXPERIENCE           │          EXPERIENCE                  │

│ ☰ CIB                │          CIB                         │

│ ☰ DEPI               │          DEPI                        │

│ + Add from Vault     │                                      │

│                      │          PROJECTS                    │

│ PROJECTS             │          Supply Chain Dashboard      │

│ ☰ Supply Chain       │          HR Analytics Dashboard      │

│ ☰ HR Analytics       │                                      │

│ + Add from Vault     │          SKILLS                      │

│                      │          Power BI · DAX · SQL        │

│ SKILLS               │                                      │

│ ☰ Power BI           │                                      │

│ ☰ DAX                │                                      │

│ ☰ SQL                │                                      │

└──────────────────────┴──────────────────────────────────────┘

```



The exact UI may evolve.



The important requirement is fast configuration and immediate visual feedback.



\---



\# 23. Live Preview



The preview must render from a normalized ResumeSnapshot.



The preview should not directly query the database.



Architecture:



```text

Database

&#x20;  ↓

Resume Draft

&#x20;  ↓

Resolve Vault Items

&#x20;  ↓

ResumeSnapshot

&#x20;  ↓

React Template

&#x20;  ↓

HTML/CSS

&#x20;  ↓

Preview

```



The same renderer should be used for printing.



\---



\# 24. ResumeSnapshot



Introduce a normalized snapshot model.



Conceptually:



```ts

type ResumeSnapshot = {

&#x20; schemaVersion: number

&#x20; templateId: string

&#x20; templateVersion: number

&#x20; profile: ProfileSnapshot

&#x20; professionalTitle: string

&#x20; sections: ResumeSection\[]

}

```



A ResumeSnapshot contains the resolved content required to render the resume.



The renderer should not need to know where the data came from.



\---



\# 25. Snapshot Independence



A generated Resume Version must contain resolved content.



It must not depend on mutable Vault records.



Example:



```text

Vault

CIB

"Data Intern"

&#x20;    ↓

Create Version 1

&#x20;    ↓

Snapshot contains:

"CIB"

"Data Intern"

```



Later:



```text

Vault

CIB

"Power BI Developer"

```



Version 1 must still display:



```text

CIB

Data Intern

```



This is a core invariant.



\---



\# 26. Template System



The prototype initially has one template:



```text

Classic v1

```



Template structure:



```text

templates/

└── classic/

&#x20;   └── v1/

&#x20;       └── ClassicTemplateV1.tsx

```



The template receives a ResumeSnapshot.



It does not access the database.



It does not know about Vault items.



It does not know about Resume Drafts.



It only renders the snapshot.



\---



\# 27. Template Versioning



Templates are explicitly versioned.



Example:



```text

classic/v1

classic/v2

```



Once a template version is used by a saved historical Resume Version, its rendering behavior should not be changed in place.



A future template change should create a new version.



\---



\# 28. Printing / PDF



The prototype uses browser printing.



The canonical rendering path is:



```text

ResumeSnapshot

&#x20;     ↓

React Template

&#x20;     ↓

HTML/CSS

&#x20;     ↓

Browser Preview

&#x20;     ↓

window.print()

&#x20;     ↓

Save as PDF

```



Use:



```css

@media print

@page

```



for print styling.



Do not create a second PDF-specific rendering engine.



Do not use `@react-pdf/renderer`.



Do not introduce Playwright or server-side Chromium in the prototype.



\---



\# 29. Saved Resume Versions



The prototype should preserve historical Resume Versions.



Conceptually:



```text

resume\_versions

\---------------

id

resume\_id

version\_number

schema\_version

template\_id

template\_version

snapshot

created\_at

```



A Version is immutable.



Once created, it must never change because:



\* the Vault changed

\* the Resume Draft changed

\* the user changed the profile

\* the template was updated



\---



\# 30. Version History



Each Resume should have a Version History.



Example:



```text

Power BI Developer Resume



Version 3    Sep 27

Version 2    Sep 24

Version 1    Sep 20

```



The user can open an old version and view exactly what it contained.



\---



\# 31. Restore



Restoring an old version does not modify the historical version.



Instead:



```text

Version 1

&#x20;   ↓

Restore

&#x20;   ↓

Current Draft

```



The snapshot is copied into the mutable draft/configuration.



The user can then modify it.



A new version can later be saved.



\---



\# 32. Version Numbering



Version numbers are scoped to each Resume.



Example:



```text

Data Analyst Resume

v1

v2

v3



Power BI Developer Resume

v1

v2

```



The prototype should ensure that two versions of the same Resume cannot receive the same version number.



Use a database transaction when creating versions.



The implementation does not need to solve distributed multi-user concurrency because the prototype is local single-user software.



\---



\# 33. Local Persistence



All persistent data should survive application restarts.



The prototype must not depend on:



\* React state alone

\* browser memory alone

\* temporary mock data



SQLite is the persistent source of truth.



\---



\# 34. Archive Instead of Destructive Delete



Vault items and Resumes should preferably support archival.



For example:



```text

archived\_at

```



This prevents accidental destructive deletion of reusable information.



The UI can hide archived items from normal selection while retaining them in the database.



\---



\# 35. Data Relationships



Conceptually:



```text

Profile

&#x20;  │

&#x20;  └── Vault Items

&#x20;         │

&#x20;         │ referenced by

&#x20;         ↓

&#x20;       Resume

&#x20;         │

&#x20;         ├── Draft

&#x20;         │

&#x20;         └── Versions

&#x20;                 │

&#x20;                 └── Snapshot

```



A Version's snapshot is independent of current Vault data.



\---



\# 36. Suggested Database Tables



The prototype initially needs:



```text

profile



vault\_items



resumes



resume\_versions

```



No application/job-tracking table is required.



\---



\# 37. Application Navigation



The initial application can contain:



```text

/

├── dashboard

├── vault

├── resumes

│   ├── new

│   └── \[id]

│       ├── builder

│       └── versions

└── print

```



There is no:



```text

/login

/signup

/applications

```



in the local prototype.



\---



\# 38. Dashboard



The Dashboard should provide a quick overview.



Possible content:



```text

ResumeOS



Career Vault

42 items



My Resumes



Data Analyst

Power BI Developer

Business Analyst

General



\[ + Create Resume ]

```



The Dashboard should remain simple.



\---



\# 39. Career Vault UI



The Vault should allow the user to:



\* view all items

\* filter by category

\* create items

\* edit items

\* archive items

\* search items



A category filter could include:



```text

All

Experience

Education

Projects

Certifications

Achievements

Skills

```



\---



\# 40. Resume List UI



The Resume list should make variants easy to manage.



Example:



```text

My Resumes



┌───────────────────────────────┐

│ Data Analyst                  │

│ Updated 2 hours ago           │

│                               │

│ \[Open] \[Duplicate] \[⋮]       │

└───────────────────────────────┘



┌───────────────────────────────┐

│ Power BI Developer            │

│ Updated yesterday             │

│                               │

│ \[Open] \[Duplicate] \[⋮]       │

└───────────────────────────────┘

```



Duplication should be highly visible.



\---



\# 41. Fast Customization



The prototype should optimize common actions.



Common changes should require very few interactions:



\### Change professional title



```text

Open Resume

→ Edit title

→ Done

```



\### Create a Power BI version



```text

Duplicate Resume

→ Rename

→ Change title

→ Adjust content

→ Done

```



\### Remove a project



```text

Resume Builder

→ Hide/remove project

→ Done

```



\### Add a project



```text

Resume Builder

→ Add from Vault

→ Select project

→ Done

```



\### Reorder projects



```text

Drag

→ Drop

→ Done

```



\---



\# 42. The Product Should Avoid Word-Document Thinking



Do not design the application around:



```text

Open document

→ manually edit paragraphs

→ Save As

→ copy file

→ rename file

→ repeat

```



Instead:



```text

Maintain information once

→ reuse it

→ configure variants

→ generate resumes

```



\---



\# 43. Core Invariants



The following must always remain true.



\## Invariant 1 — Vault Reusability



A Vault item can be reused by multiple Resumes.



\## Invariant 2 — Resume Independence



Duplicating a Resume creates an independent configuration.



Changing Resume A must not modify Resume B.



\## Invariant 3 — Draft Mutability



The current Resume Draft can change freely.



\## Invariant 4 — Version Immutability



A saved Resume Version never changes.



\## Invariant 5 — Snapshot Independence



A Version does not depend on mutable Vault content.



\## Invariant 6 — Template Versioning



Historical versions retain their original template version.



\## Invariant 7 — Semantic Sections



Section semantics are determined by `type`, not `displayName`.



\## Invariant 8 — Fast Variant Creation



Creating a new Resume from an existing Resume should not require manually recreating its content.



\## Invariant 9 — Local Persistence



Data survives application restarts.



\## Invariant 10 — Single Canonical Renderer



Preview and print use the same React/HTML/CSS rendering system.



\---



\# 44. Prototype Success Criteria



The prototype is successful when the following workflow feels fast and natural:



```text

1\. Open ResumeOS.



2\. Open Career Vault.



3\. Add or maintain professional information.



4\. Create a Data Analyst Resume.



5\. Select relevant experience/projects/skills.



6\. Arrange them.



7\. Preview the resume.



8\. Print/save it as PDF.



9\. Duplicate the resume.



10\. Rename it "Power BI Developer Resume".



11\. Change the professional title.



12\. Remove/add a few projects or skills.



13\. Make a resume-specific content override if needed.



14\. Preview the new resume.



15\. Print/save it.



16\. Modify the Career Vault.



17\. Confirm previous saved versions remain unchanged.

```



The entire process should be dramatically easier than maintaining separate Word documents.



\---



\# 45. MVP Development Order



Implement in this order:



```text

PHASE 1

Basic local Next.js application

&#x20;       ↓

PHASE 2

SQLite database + schema

&#x20;       ↓

PHASE 3

Profile + Career Vault

&#x20;       ↓

PHASE 4

Resume creation + Resume list

&#x20;       ↓

PHASE 5

Resume duplication / variants

&#x20;       ↓

PHASE 6

Resume Builder

&#x20;       ↓

PHASE 7

Resume-specific overrides

&#x20;       ↓

PHASE 8

ResumeSnapshot + Classic v1

&#x20;       ↓

PHASE 9

Live Preview + Browser Print

&#x20;       ↓

PHASE 10

Immutable Resume Versions

&#x20;       ↓

PHASE 11

Version History + Restore

&#x20;       ↓

PHASE 12

UX polish + testing

```



\---



\# 46. What Should NOT Be Optimized Yet



Do not spend significant development time on:



\* authentication

\* deployment

\* cloud infrastructure

\* multi-user architecture

\* database scalability

\* distributed locking

\* serverless PDF rendering

\* AI

\* ATS optimization

\* job applications

\* integrations

\* multiple visual templates



The prototype's purpose is to prove the \*\*resume assembly and customization experience\*\*.



\---



\# 47. Future Evolution



If the prototype proves useful, it can later evolve into a multi-user application.



The conceptual domain model should remain:



```text

Profile

&#x20;  ↓

Career Vault

&#x20;  ↓

Resume

&#x20;  ↓

Draft

&#x20;  ↓

Resume Version

```



A future SaaS architecture could replace:



```text

SQLite

```



with:



```text

PostgreSQL / Supabase

```



and add:



```text

User

Authentication

RLS

Multi-tenancy

```



without fundamentally changing the product concept.



This is a future concern and should not complicate the prototype.



\---



\# 48. Final Product Philosophy



ResumeOS should solve a simple but annoying problem:



> A person's professional information is mostly reusable, but traditional resume workflows force them to repeatedly copy, edit, and maintain separate documents.



ResumeOS changes the workflow from:



```text

Write Resume

&#x20;    ↓

Copy Resume

&#x20;    ↓

Edit Copy

&#x20;    ↓

Save another Word document

&#x20;    ↓

Repeat

```



to:



```text

Maintain Career Vault

&#x20;       ↓

Create Resume Variant

&#x20;       ↓

Configure in a few clicks

&#x20;       ↓

Preview

&#x20;       ↓

Export

```



The user should be able to maintain many targeted resumes without maintaining many manually duplicated documents.



The central experience should always be:



> \*\*"I already have the information. I just need to decide how I want this particular resume to present it."\*\*



