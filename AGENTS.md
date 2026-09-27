<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Custom Git & GitHub Rules
1. **Branching:** Work on feature branches (`feat/hero-section`, `fix/nav-bar`).
2. **Commits:** Write clear, concise messages (`feat: add contact form`).
3. **Merging:** Merge directly into `main` locally once a feature works, then push (`git merge feat/nav-bar` -> `git push origin main`).
4. **Cleanliness:** Delete feature branches after merging. Never push broken code to `main`.