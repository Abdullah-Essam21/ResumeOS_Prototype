#!/usr/bin/env node
/**
 * copy-assets.js
 *
 * Copies the Next.js static assets and public directory into the
 * standalone bundle so the production server can serve them correctly.
 *
 * Must be run AFTER `next build` and BEFORE `electron-builder`.
 *
 * See: https://nextjs.org/docs/app/api-reference/next-config-js/output#automatically-copying-traced-files
 */

const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const STANDALONE = path.join(ROOT, ".next", "standalone");
const STATIC_SRC = path.join(ROOT, ".next", "static");
const STATIC_DST = path.join(STANDALONE, ".next", "static");
const PUBLIC_SRC = path.join(ROOT, "public");
const PUBLIC_DST = path.join(STANDALONE, "public");

function copyDir(src, dst) {
  if (!fs.existsSync(src)) {
    console.log(`[copy-assets] Skipping (not found): ${src}`);
    return;
  }
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

if (!fs.existsSync(STANDALONE)) {
  console.error(
    "[copy-assets] ERROR: .next/standalone does not exist.\n" +
      "Run `npm run build` first."
  );
  process.exit(1);
}

console.log("[copy-assets] Copying .next/static → .next/standalone/.next/static …");
copyDir(STATIC_SRC, STATIC_DST);

console.log("[copy-assets] Copying public → .next/standalone/public …");
copyDir(PUBLIC_SRC, PUBLIC_DST);

console.log("[copy-assets] Done.");
