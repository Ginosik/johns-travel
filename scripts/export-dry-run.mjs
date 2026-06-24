import { access, stat } from "node:fs/promises";
import path from "node:path";
import {
  buildDryRunSummary,
  getConversationExportManifest
} from "./export-manifest.mjs";

function readOption(name) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1) return process.argv[index + 1];

  return null;
}

function publicPathToFilePath(publicPath) {
  return path.resolve("public", publicPath.replace(/^\//, ""));
}

const requestedPost = readOption("post") ?? "day-1";
const manifest = await getConversationExportManifest(requestedPost);
const summary = buildDryRunSummary(manifest);
const audio = [];

for (const audioPath of summary.audioFiles) {
  const filePath = publicPathToFilePath(audioPath);
  try {
    await access(filePath);
    const stats = await stat(filePath);
    audio.push({ path: audioPath, bytes: stats.size, exists: true });
  } catch {
    audio.push({ path: audioPath, bytes: 0, exists: false });
  }
}

const missingAudio = audio.filter((entry) => !entry.exists);
const result = {
  ...summary,
  audio,
  missingAudio: missingAudio.map((entry) => entry.path),
  ready: missingAudio.length === 0
};

console.log(JSON.stringify(result, null, 2));

if (!result.ready) {
  process.exitCode = 1;
}
