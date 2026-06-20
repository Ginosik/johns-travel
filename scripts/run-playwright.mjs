import { spawn, spawnSync } from "node:child_process";

const host = "127.0.0.1";
const port = "4173";
const appUrl = `http://${host}:${port}`;
const forwardedArguments = process.argv.slice(2);

const vite = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "--host", host, "--port", port],
  { stdio: "inherit" }
);

function stopVite() {
  if (vite.exitCode !== null) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(vite.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    vite.kill("SIGTERM");
  }
}

async function waitForVite() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (vite.exitCode !== null) throw new Error("Vite exited before the test server became ready.");

    try {
      const response = await fetch(appUrl);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${appUrl}.`);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopVite();
    process.exit(130);
  });
}

let finalExitCode = 1;

try {
  await waitForVite();

  const playwright = spawnSync(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test", ...forwardedArguments],
    {
      env: { ...process.env, PW_EXTERNAL_SERVER: "1" },
      stdio: "inherit"
    }
  );

  if (playwright.error) throw playwright.error;
  finalExitCode = playwright.status ?? 1;
} catch (error) {
  console.error(error.message);
} finally {
  stopVite();
}

process.exit(finalExitCode);
