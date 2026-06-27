import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const API_BASE_URL = "https://api.elevenlabs.io/v1";

async function loadEnvFile(filePath = ".env") {
  if (!existsSync(filePath)) return;

  const content = await readFile(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to .env or your shell environment.`);
  return value;
}

await loadEnvFile();

const response = await fetch(`${API_BASE_URL}/voices`, {
  headers: { "xi-api-key": getRequiredEnv("ELEVENLABS_API_KEY") }
});

if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`ElevenLabs voices request failed (${response.status}): ${errorText}`);
}

const data = await response.json();
const voices = data.voices ?? [];
for (const voice of voices) {
  const labels = voice.labels ? Object.entries(voice.labels).map(([key, value]) => `${key}:${value}`).join(", ") : "";
  console.log(`${voice.name}\t${voice.voice_id}\t${labels}`);
}

console.log(`Listed ${voices.length} voices.`);