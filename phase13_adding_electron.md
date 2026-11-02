\# Local-First Architecture



The prototype runs entirely on the user's computer.



ResumeOS is a Next.js application packaged inside an Electron desktop shell for Windows and macOS.



The architecture remains local-first and single-user:



```text

Electron

&#x20; │

&#x20; ├── Main Process

&#x20; │     ├── starts/manages the local Next.js application

&#x20; │     └── owns desktop lifecycle

&#x20; │

&#x20; └── BrowserWindow

&#x20;       │

&#x20;       └── Next.js

&#x20;             ├── React UI

&#x20;             ├── Server Actions / server-side application logic

&#x20;             └── SQLite

```



SQLite remains the local persistent database and the source of truth for mutable application data.



\## Development Runtime



During development:



```text

Electron

&#x20;  ↓

http://localhost:3000

&#x20;  ↓

Next.js development server

&#x20;  ↓

SQLite

```



The Electron development shell loads:



```text

http://localhost:3000

```



The normal Next.js development workflow remains available.



\## Production Desktop Runtime



In the packaged application, Electron must not depend on an externally installed Node.js runtime or a remote server.



The preferred production architecture is:



```text

Electron

&#x20;  ↓

embedded/local Next.js production server

&#x20;  ↓

BrowserWindow

&#x20;  ↓

SQLite

```



The Electron main process starts the packaged Next.js production server on a local loopback address and loads that local address in `BrowserWindow`.



The production Next.js application should use a deployable standalone/server build rather than a browser-only static export because ResumeOS uses server-side application logic and SQLite.



A static Next.js export may only be used if all required application functionality is redesigned to work without server-side Next.js functionality. That is not part of this prototype and must not be introduced merely for packaging.



Electron should wait until the local production server is ready before loading the application window.



The production server must bind only to a local interface and must not turn ResumeOS into a remotely accessible web service.



\## Database Location



The development database may use:



```text

data/resumeos.db

```



However, a packaged desktop application must not write mutable user data inside the installed application directory.



The packaged application must resolve the SQLite database to Electron's per-user writable application-data directory, preferably using:



```text

app.getPath('userData')

```



Conceptually:



```text

<userData>/

└── data/

&#x20;   └── resumeos.db

```



The exact platform-specific path is determined by Electron.



This is required because Windows applications may be installed under `Program Files` and macOS applications may be installed under `Applications`, where the application bundle should be treated as read-only or non-user-data storage.



The database path must therefore be provided to the SQLite layer through application configuration rather than being hard-coded as a project-relative path.



The database directory must be created before opening the database if it does not already exist.



\## Data Persistence Rule



The same logical SQLite database is used throughout the application lifecycle:



```text

Development:

project/data/resumeos.db



Packaged desktop:

Electron app.getPath('userData')/data/resumeos.db

```



The location changes between development and packaged environments, but the database schema and application data model do not.



User data must survive:



\* closing the application

\* restarting the application

\* application updates

\* reinstalling the application where the platform preserves the user's application-data directory



An application update must not intentionally overwrite or recreate the user's SQLite database.

"""

text = replace\_section(text, "# 5. Local-First Architecture", "# 6. Technology Stack", section5)



\# Section 6

section6 = r"""# 6. Technology Stack



\## Application



\* Next.js

\* React

\* TypeScript

\* App Router



\## Desktop Runtime



\* Electron

\* Electron `BrowserWindow`

\* Electron main process

\* Electron preload layer where desktop APIs are required

\* `contextIsolation: true`

\* `nodeIntegration: false`



Electron is the desktop shell and lifecycle manager. It must not become a second application UI or a second resume renderer.



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

BrowserWindow

&#x20; ↓

window.print()

&#x20; ↓

Save as PDF

```



`window.print()` must continue to use the browser rendering engine inside the Electron window.



No server-side Chromium is required.



\## Desktop Packaging



Use:



\* Electron

\* `electron-builder`



`electron-builder` is responsible for producing the distributable desktop packages.



The packaging system should produce at minimum:



```text

Windows → .exe installer/distribution

macOS   → .app application bundle

```



The exact installer format and signing/notarization configuration may evolve later, but the application architecture must not depend on a cloud service to build or run the application.

"""

text = replace\_section(text, "# 6. Technology Stack", "# 7. High-Level Domain Model", section6)



\# Phase 13 in development order

text = text.replace(

"""PHASE 12



UX polish + testing

```""",

"""PHASE 12



UX polish + testing

&#x20;      ↓

PHASE 13



Desktop Packaging \& Distribution

```""",

1,

)



\# Insert Phase 13 before old section 46

phase13 = r"""# 46. Phase 13 — Desktop Packaging \& Distribution



Phase 13 packages the completed local ResumeOS application as a desktop application for Windows and macOS.



This phase packages the existing architecture rather than redesigning it.



The following must remain true:



\* ResumeOS remains single-user.

\* ResumeOS remains local-first.

\* SQLite remains the persistent source of truth.

\* No authentication is introduced.

\* No cloud database is introduced.

\* No job application system is introduced.

\* No second resume renderer is introduced.

\* No server-side Chromium is introduced.



\## 46.1 Desktop Runtime Architecture



The packaged application consists of:



```text

Electron Main Process

&#x20;       │

&#x20;       ├── starts local Next.js production server

&#x20;       │

&#x20;       └── creates BrowserWindow

&#x20;                   │

&#x20;                   ↓

&#x20;            Next.js application

&#x20;                   │

&#x20;                   ├── React UI

&#x20;                   ├── Server Actions / server logic

&#x20;                   └── SQLite

```



Electron is the desktop shell and lifecycle manager.



Next.js remains the application framework.



React remains the UI layer.



SQLite remains the local database.



Electron must not duplicate domain logic that belongs in the Next.js application.



\## 46.2 Development Mode



Development should remain simple:



```text

npm run dev

&#x20;     ↓

Next.js → http://localhost:3000

&#x20;     ↑

Electron BrowserWindow

```



When running the Electron development shell, Electron loads:



```text

http://localhost:3000

```



The development Next.js server remains responsible for the application.



This allows normal Next.js development and debugging without requiring a packaged build for every change.



\## 46.3 Production Build



Production packaging should use the existing Next.js application as the source of the desktop UI and server-side logic.



The preferred production flow is:



```text

Next.js production build

&#x20;       ↓

standalone/local server bundle

&#x20;       ↓

Electron package

&#x20;       ↓

Windows .exe / macOS .app

```



The packaged Electron main process starts the bundled Next.js server on a local loopback port.



Electron then loads the local application URL.



The production application must not require:



\* an internet connection

\* a remote web server

\* an externally installed Node.js runtime

\* a cloud database

\* server-side Chromium



The package must contain everything required to run the local application.



\## 46.4 Next.js Production Integration



The Next.js build configuration must be compatible with the Electron packaging strategy.



Prefer a production server/standalone output because ResumeOS currently relies on:



\* server-side application logic

\* Server Actions

\* SQLite access



Do not switch to `output: 'export'` solely to make Electron packaging easier.



A static export is not equivalent to the current architecture because it removes the server runtime required by the local SQLite-backed application.



If a future architecture intentionally removes all server-side requirements, a static export may be reconsidered separately. That would be an architectural change and is outside Phase 13.



\## 46.5 Electron Main Process Responsibilities



The Electron main process should be responsible for:



\* creating the main `BrowserWindow`

\* starting the local Next.js production server in packaged mode

\* waiting for the local server to become ready

\* loading the local application URL

\* resolving the persistent user-data directory

\* handling application lifecycle events

\* handling desktop-specific functionality only when required



The Electron main process should not:



\* contain resume business logic

\* render resume HTML

\* implement a second template system

\* directly manipulate Resume Draft structures unless a desktop integration explicitly requires it



The existing Next.js application remains the owner of application behavior.



\## 46.6 Electron Security Baseline



The desktop shell should use a secure Electron configuration.



At minimum:



```text

contextIsolation: true

nodeIntegration: false

```



The renderer should not receive unrestricted Node.js access.



If the renderer ever needs a desktop-only capability, expose only the smallest required API through a preload layer.



Do not expose the entire Electron or Node.js API to the renderer.



The local Next.js server should bind only to a local interface.



\## 46.7 Production SQLite Path



The packaged application must resolve the database path from Electron's writable user-data directory.



Conceptually:



```text

const userData = app.getPath('userData')



databasePath = path.join(userData, 'data', 'resumeos.db')

```



The exact implementation may use an equivalent safe Electron-supported directory API, but it must satisfy the same requirement.



The application must never assume that this path is the same as:



```text

process.cwd()

```



or:



```text

\_\_dirname

```



for mutable user data.



Application code and packaged assets may live inside the installed application directory.



Mutable SQLite data must live in the per-user writable application-data directory.



\## 46.8 Development vs Packaged Database Configuration



The database layer should accept a resolved database path.



Conceptually:



```text

Development

DATABASE\_PATH = project/data/resumeos.db



Packaged

DATABASE\_PATH = app.getPath('userData')/data/resumeos.db

```



The database abstraction must not contain duplicated database schemas for these environments.



Only the resolved file location changes.



The same migrations/schema definition must be used in both environments.



\## 46.9 Database Initialization



When ResumeOS starts:



1\. Resolve the correct database directory.

2\. Create the directory if necessary.

3\. Open the SQLite database.

4\. Run the required schema/migration checks.

5\. Start/continue the Next.js application.

6\. Create the Electron window after the local application is ready.



Database initialization must be deterministic.



The application must not delete and recreate the database simply because the application version changed.



Existing user data must be preserved.



\## 46.10 Application Updates



Application updates must separate application files from user data.



Conceptually:



```text

Installed Application

&#x20;   ├── Electron

&#x20;   ├── Next.js

&#x20;   ├── React UI

&#x20;   └── static/application assets



User Data

&#x20;   └── Electron userData

&#x20;         └── data

&#x20;               └── resumeos.db

```



Updating the application must replace application files without replacing the user's database.



If database migrations are required in a future release, they must be explicit, ordered, and safe for an existing local database.



\## 46.11 Printing and PDF in Electron



Printing remains part of the existing browser-based architecture.



The canonical flow is:



```text

ResumeSnapshot

&#x20;     ↓

React Template

&#x20;     ↓

HTML/CSS

&#x20;     ↓

Electron BrowserWindow

&#x20;     ↓

window.print()

&#x20;     ↓

Save as PDF

```



The desktop shell must not introduce a second PDF rendering path.



The same `@media print` and `@page` rules must continue to apply.



A packaged desktop build must therefore produce the same resume content and print layout as the normal browser development environment, subject only to normal browser/platform printing differences.



\## 46.12 Build and Packaging Scripts



The project should provide explicit scripts with clear responsibilities.



Conceptually:



```text

npm run dev

npm run build

npm run electron:dev

npm run electron:build

npm run package:win

npm run package:mac

```



The exact script names may differ, but they must clearly separate:



\* Next.js development

\* Next.js production build

\* Electron development

\* Electron packaging



A packaging command should build the Next.js production application before invoking `electron-builder`.



Packaging must fail clearly if the required Next.js production artifacts are missing.



\## 46.13 Packaging Configuration



`electron-builder` configuration should define:



\* application identifier

\* application name

\* main-process entry point

\* packaged Next.js server/assets

\* preload assets if used

\* Windows target(s)

\* macOS target(s)

\* files that must be included in the final package

\* files/directories that must not be treated as mutable user data



The SQLite database must not be bundled as the writable production database.



A seed/demo database may be included only if explicitly required, and it must be copied to the user's writable data directory rather than modified inside the application package.



\## 46.14 Windows Distribution



The Windows build must produce a usable `.exe` distribution.



The application must work when installed under a protected location such as:



```text

C:\\Program Files\\ResumeOS

```



The application must not attempt to write:



```text

C:\\Program Files\\ResumeOS\\data\\resumeos.db

```



Instead, the writable database belongs under Electron's `userData` directory.



\## 46.15 macOS Distribution



The macOS build must produce a usable `.app` application bundle.



The application must not treat:



```text

/Applications/ResumeOS.app

```



as the location for mutable SQLite data.



The writable database belongs under Electron's `userData` directory.



Code signing and notarization may be added for public distribution, but they are packaging/distribution concerns and must not change the ResumeOS domain architecture.



\## 46.16 Packaging Verification Checklist



Before considering Phase 13 complete, verify:



```text

Development

&#x20;   ✓ Next.js starts normally

&#x20;   ✓ Electron loads http://localhost:3000

&#x20;   ✓ SQLite reads/writes correctly



Windows packaged build

&#x20;   ✓ .exe is produced

&#x20;   ✓ application starts after installation

&#x20;   ✓ SQLite is created in userData

&#x20;   ✓ data survives restart

&#x20;   ✓ data is not written into Program Files

&#x20;   ✓ resume builder works

&#x20;   ✓ preview works

&#x20;   ✓ window.print() works

&#x20;   ✓ Save as PDF works



macOS packaged build

&#x20;   ✓ .app is produced

&#x20;   ✓ application starts

&#x20;   ✓ SQLite is created in userData

&#x20;   ✓ data survives restart

&#x20;   ✓ data is not written into the application bundle

&#x20;   ✓ resume builder works

&#x20;   ✓ preview works

&#x20;   ✓ window.print() works

&#x20;   ✓ Save as PDF works

```



The final test must also confirm:



```text

Career Vault

&#x20;   ↓

Resume Variant

&#x20;   ↓

ResumeSnapshot

&#x20;   ↓

Preview

&#x20;   ↓

Print

```



continues to use the same canonical renderer in development and in the packaged desktop application.

