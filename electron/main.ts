/**
 * Electron Main Process — ResumeOS Desktop Shell
 *
 * Responsibilities:
 *  - Resolve writable userData path and inject DATABASE_PATH for the Next.js server
 *  - Find a free ephemeral loopback port (never hardcode 3000)
 *  - In dev: load http://localhost:3000 (assumes `npm run dev` is already running)
 *  - In prod: spawn .next/standalone/server.js, wait for it to be ready, then open BrowserWindow
 *  - Guarantee full process-tree cleanup on quit (tree-kill) to prevent orphaned servers
 *  - Security baseline: contextIsolation=true, nodeIntegration=false, webSecurity=true
 */

import { app, BrowserWindow, shell } from "electron";
import { spawn, ChildProcess } from "child_process";
import * as net from "net";
import * as path from "path";
import * as fs from "fs";
import * as http from "http";
import treeKill from "tree-kill";

// ─── Constants ────────────────────────────────────────────────────────────────

const IS_DEV = !app.isPackaged;
const DEV_URL = "http://localhost:3000";

// ─── State ────────────────────────────────────────────────────────────────────

let mainWindow: BrowserWindow | null = null;
let nextServerProcess: ChildProcess | null = null;
let serverPort: number | null = null;

// ─── Port Utilities ───────────────────────────────────────────────────────────

/** Returns a guaranteed-free ephemeral port on 127.0.0.1 */
function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not determine free port"));
        return;
      }
      const port = address.port;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

// ─── Readiness Check ─────────────────────────────────────────────────────────

/** Poll the local server until it responds or we give up */
function waitForServer(
  port: number,
  maxAttempts = 60,
  intervalMs = 500
): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    function attempt() {
      attempts++;
      http
        .get(`http://127.0.0.1:${port}`, (res) => {
          res.resume(); // drain
          resolve();
        })
        .on("error", () => {
          if (attempts >= maxAttempts) {
            reject(
              new Error(
                `Next.js server did not become ready after ${maxAttempts} attempts on port ${port}`
              )
            );
            return;
          }
          setTimeout(attempt, intervalMs);
        });
    }

    attempt();
  });
}

// ─── Next.js Server ──────────────────────────────────────────────────────────

async function startNextServer(): Promise<number> {
  const port = await findFreePort();
  serverPort = port;

  // Resolve standalone server path relative to the app directory (works both
  // inside asar.unpacked and a plain extracted layout)
  const appDir = app.isPackaged
    ? path.join(process.resourcesPath, "app.asar.unpacked")
    : path.join(__dirname, "..");

  const serverScript = path.join(appDir, ".next", "standalone", "server.js");

  if (!fs.existsSync(serverScript)) {
    throw new Error(
      `Next.js standalone server not found at: ${serverScript}\n` +
        `Run 'npm run build' to generate the production build.`
    );
  }

  // Writable user-data directory — never inside Program Files / App bundle
  const userData = app.getPath("userData");
  const dbDir = path.join(userData, "data");
  fs.mkdirSync(dbDir, { recursive: true });
  const databasePath = path.join(dbDir, "resumeos.db");

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    DATABASE_PATH: databasePath,
    NODE_ENV: "production",
    // next/standalone requires these paths for static file resolution
    NEXT_SHARP_PATH: path.join(
      appDir,
      ".next",
      "standalone",
      "node_modules",
      "sharp"
    ),
  };

  console.log(`[ResumeOS] Starting Next.js server on port ${port}`);
  console.log(`[ResumeOS] DATABASE_PATH = ${databasePath}`);
  console.log(`[ResumeOS] server.js = ${serverScript}`);

  // Use Electron's bundled Node to spawn the Next.js server so there is no
  // dependency on an externally-installed Node.js runtime.
  const nodeExec = process.execPath;

  nextServerProcess = spawn(nodeExec, [serverScript], {
    env,
    stdio: "pipe",
    // Detach=false keeps the child in our process group so tree-kill reaches it
  });

  nextServerProcess.stdout?.on("data", (d: Buffer) =>
    console.log(`[next] ${d.toString().trim()}`)
  );
  nextServerProcess.stderr?.on("data", (d: Buffer) =>
    console.error(`[next:err] ${d.toString().trim()}`)
  );

  nextServerProcess.on("exit", (code, signal) => {
    console.log(`[ResumeOS] Next.js server exited (code=${code}, signal=${signal})`);
    nextServerProcess = null;
  });

  await waitForServer(port);
  console.log(`[ResumeOS] Next.js server ready at http://127.0.0.1:${port}`);

  return port;
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

function killNextServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!nextServerProcess || nextServerProcess.pid == null) {
      resolve();
      return;
    }

    const pid = nextServerProcess.pid;
    console.log(`[ResumeOS] Killing Next.js server process tree (pid=${pid})`);

    treeKill(pid, "SIGTERM", (err) => {
      if (err) {
        console.error(`[ResumeOS] tree-kill failed: ${err.message}`);
        // Force-kill as fallback
        try {
          treeKill(pid, "SIGKILL");
        } catch {
          // ignore
        }
      }
      nextServerProcess = null;
      resolve();
    });
  });
}

// ─── BrowserWindow ────────────────────────────────────────────────────────────

function createWindow(url: string) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "ResumeOS",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.loadURL(url);

  // Open external links in the default OS browser, not inside Electron
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (targetUrl.startsWith("http://127.0.0.1") || targetUrl.startsWith(DEV_URL)) {
      return { action: "allow" };
    }
    shell.openExternal(targetUrl);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────

app.on("ready", async () => {
  try {
    if (IS_DEV) {
      // Development: assume `npm run dev` is already serving on :3000
      console.log(`[ResumeOS] Dev mode — loading ${DEV_URL}`);
      createWindow(DEV_URL);
    } else {
      // Production: start embedded Next.js server then open window
      const port = await startNextServer();
      createWindow(`http://127.0.0.1:${port}`);
    }
  } catch (err) {
    console.error("[ResumeOS] Fatal startup error:", err);
    app.quit();
  }
});

// Re-open window on macOS dock click when all windows are closed
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0 && serverPort !== null) {
    const url = IS_DEV ? DEV_URL : `http://127.0.0.1:${serverPort}`;
    createWindow(url);
  }
});

// Graceful shutdown — kill Next.js child process tree before quitting
app.on("before-quit", async (event) => {
  if (nextServerProcess) {
    event.preventDefault();
    await killNextServer();
    app.quit();
  }
});

app.on("window-all-closed", () => {
  // On macOS, apps conventionally stay alive until Cmd+Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Fallback cleanup for SIGINT / SIGTERM (e.g. terminal Ctrl+C)
process.on("SIGINT", async () => {
  await killNextServer();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await killNextServer();
  process.exit(0);
});
