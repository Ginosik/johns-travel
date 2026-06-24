import { chromium } from "@playwright/test";
import { mkdir, rename, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const host = "127.0.0.1";
const port = "4173";
const baseUrl = `http://${host}:${port}`;
const revealDelayMs = Number(process.env.REVEAL_DELAY_MS ?? 1300);
const introDelayMs = Number(process.env.INTRO_DELAY_MS ?? 1200);
const outroDelayMs = Number(process.env.OUTRO_DELAY_MS ?? 2200);
const postAliases = new Map([
  ["day-1", "/day/1"],
  ["day1", "/day/1"],
  ["1", "/day/1"],
  ["day-2", "/day/2"],
  ["day2", "/day/2"],
  ["2", "/day/2"],
  ["hindi-1", "/day/3"],
  ["hindi1", "/day/3"],
  ["day-3", "/day/3"],
  ["day3", "/day/3"],
  ["3", "/day/3"]
]);

const formats = [
  {
    name: "youtube-16x9",
    viewport: { width: 1920, height: 1080 },
    videoSize: { width: 1920, height: 1080 }
  },
  {
    name: "vertical-9x16",
    viewport: { width: 1080, height: 1920 },
    videoSize: { width: 1080, height: 1920 }
  },
  {
    name: "square-1x1",
    viewport: { width: 1080, height: 1080 },
    videoSize: { width: 1080, height: 1080 }
  }
];

function readOption(name) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1) return process.argv[index + 1];

  return null;
}

function resolvePostPath(post) {
  const normalized = post.trim();
  if (normalized.startsWith("/")) return normalized;
  if (normalized.startsWith("day/")) return `/${normalized}`;
  return postAliases.get(normalized.toLocaleLowerCase()) ?? null;
}

function slugifyPostPath(postPath) {
  return postPath
    .replace(/^\/+/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLocaleLowerCase();
}

function startViteIfNeeded() {
  const vite = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "--host", host, "--port", port],
    { stdio: "ignore" }
  );

  return vite;
}

function stopProcess(processHandle) {
  if (!processHandle || processHandle.exitCode !== null) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(processHandle.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    processHandle.kill("SIGTERM");
  }
}

async function waitForApp() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep waiting while Vite starts.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${baseUrl}.`);
}

async function recordFormat(format, postPath, outputDir) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: format.viewport,
    recordVideo: {
      dir: outputDir,
      size: format.videoSize
    }
  });
  const page = await context.newPage();

  await page.goto(`${baseUrl}${postPath}`, { waitUntil: "networkidle" });
  if (await page.getByRole("heading", { name: "Story not found" }).count()) {
    throw new Error(`No post was found at ${postPath}.`);
  }

  await page.addStyleTag({
    content: `
      body {
        background: #f6f2ea !important;
      }

      .topbar,
      .mobile-bar,
      .post-page-actions,
      .post-copy,
      .learning-direction,
      .conversation-toolbar,
      .conversation-controls,
      .story-navigation {
        display: none !important;
      }

      .app-shell,
      .main,
      .post-page,
      .detail-post {
        min-height: 100vh !important;
      }

      .main {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .post-page {
        display: grid !important;
        width: 100% !important;
        max-width: none !important;
        padding: clamp(28px, 4vw, 72px) !important;
        place-items: center !important;
      }

      .detail-post {
        width: min(100%, 980px) !important;
        margin: 0 !important;
        padding: clamp(22px, 3vw, 48px) !important;
        border: 0 !important;
        box-shadow: none !important;
        background: transparent !important;
      }

      .post-header {
        margin-bottom: clamp(20px, 3vw, 40px) !important;
      }

      .post-header h1 {
        font-size: clamp(34px, 5vw, 76px) !important;
        line-height: 1 !important;
      }

      .post-header p {
        font-size: clamp(16px, 2vw, 28px) !important;
      }

      .conversation-layout,
      .conversation-column,
      .conversation-record {
        width: 100% !important;
        max-width: none !important;
      }

      .conversation-record {
        max-height: none !important;
        padding: 0 !important;
        overflow: visible !important;
      }

      .conversation-message {
        animation: capture-message-in 420ms ease-out both;
      }

      .message-content {
        max-width: min(78%, 780px) !important;
      }

      .speech {
        max-width: none !important;
        padding: clamp(14px, 2vw, 26px) clamp(16px, 2.4vw, 30px) !important;
        border-radius: 22px !important;
        font-size: clamp(22px, 3vw, 42px) !important;
        box-shadow: 0 16px 40px rgba(17, 24, 39, .14) !important;
      }

      .speech strong {
        font-size: clamp(14px, 1.5vw, 22px) !important;
      }

      .speech-text[lang="hi"] {
        font-size: clamp(28px, 4vw, 56px) !important;
        line-height: 1.45 !important;
      }

      .message-play-button,
      .message-audio-feedback {
        display: none !important;
      }

      @keyframes capture-message-in {
        from {
          opacity: 0;
          transform: translateY(18px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  });

  await page.waitForTimeout(introDelayMs);

  const continueButton = page.locator(".continue-button");
  for (let index = 0; index < 80; index += 1) {
    if (await continueButton.isDisabled()) break;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(revealDelayMs);
  }

  await page.waitForTimeout(outroDelayMs);

  const video = page.video();
  await context.close();
  await browser.close();

  const temporaryVideoPath = await video.path();
  const finalVideoPath = path.join(outputDir, `${format.name}.webm`);
  await rm(finalVideoPath, { force: true });
  await rename(temporaryVideoPath, finalVideoPath);
  return finalVideoPath;
}

const requestedPost = readOption("post") ?? "hindi-1";
const postPath = resolvePostPath(requestedPost);
if (!postPath) {
  throw new Error(`Unknown post "${requestedPost}". Use a route like /day/3 or an alias like hindi-1.`);
}

const outputSlug = readOption("output") ?? slugifyPostPath(postPath);
const outputDir = path.resolve("videos", outputSlug);
await mkdir(outputDir, { recursive: true });

let vite = null;
if (!existsSync("node_modules/vite/bin/vite.js")) {
  throw new Error("Vite is not installed. Run npm install before recording.");
}

try {
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) vite = startViteIfNeeded();
  } catch {
    vite = startViteIfNeeded();
  }

  await waitForApp();

  const outputs = [];
  for (const format of formats) {
    console.log(`Recording ${requestedPost} as ${format.name}...`);
    outputs.push(await recordFormat(format, postPath, outputDir));
  }

  console.log("\nConversation videos exported:");
  outputs.forEach((filePath) => console.log(`- ${filePath}`));
} finally {
  stopProcess(vite);
}

process.exit(0);
