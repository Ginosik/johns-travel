import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { hindi1Conversation } from "../src/data/hindi1Content.js";
import { loadEnvFile } from "./load-env.mjs";

loadEnvFile();

function readOption(name) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1) return process.argv[index + 1];

  return null;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function hashText(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function createHindi1Plan(voiceConfig) {
  const speakerCounts = new Map();

  return hindi1Conversation.map((message) => {
    const sequence = (speakerCounts.get(message.speaker) ?? 0) + 1;
    speakerCounts.set(message.speaker, sequence);

    const speakerConfig = voiceConfig[message.speaker];
    if (!speakerConfig?.name || !speakerConfig?.languageCode) {
      throw new Error(`Missing Google TTS voice config for speaker "${message.speaker}".`);
    }

    const paddedSequence = String(sequence).padStart(2, "0");
    const outputFile = path.resolve("public", "audio", "hindi-1", `${message.speaker}-${paddedSequence}.mp3`);
    const metadataFile = outputFile.replace(/\.mp3$/u, ".json");
    const audioConfig = {
      audioEncoding: "MP3",
      speakingRate: speakerConfig.speakingRate ?? 0.95
    };
    const voice = {
      languageCode: speakerConfig.languageCode,
      name: speakerConfig.name,
      ssmlGender: speakerConfig.ssmlGender
    };
    const hashInput = JSON.stringify({
      audioConfig,
      provider: "google-tts",
      text: message.text,
      voice
    });

    return {
      audioConfig,
      metadataFile,
      outputFile,
      provider: "google-tts",
      speaker: message.speaker,
      text: message.text,
      textHash: hashText(hashInput),
      voice
    };
  });
}

async function isStale(item) {
  if (!existsSync(item.outputFile) || !existsSync(item.metadataFile)) return true;

  try {
    const metadata = await readJson(item.metadataFile);
    return metadata.textHash !== item.textHash;
  } catch {
    return true;
  }
}

async function generateAudio(apiKey, item) {
  const url = new URL("https://texttospeech.googleapis.com/v1/text:synthesize");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, {
    body: JSON.stringify({
      audioConfig: item.audioConfig,
      input: { text: item.text },
      voice: item.voice
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Google TTS failed for ${item.speaker}: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  if (!data.audioContent) {
    throw new Error(`Google TTS returned no audioContent for ${item.speaker}.`);
  }

  await mkdir(path.dirname(item.outputFile), { recursive: true });
  await writeFile(item.outputFile, Buffer.from(data.audioContent, "base64"));
  await writeFile(item.metadataFile, `${JSON.stringify({
    audioConfig: item.audioConfig,
    generatedAt: new Date().toISOString(),
    provider: item.provider,
    speaker: item.speaker,
    text: item.text,
    textHash: item.textHash,
    voice: item.voice
  }, null, 2)}\n`);
}

const post = readOption("post") ?? "hindi-1";
if (!["hindi-1", "hindi1", "day-3", "day3", "3", "/day/3"].includes(post.toLocaleLowerCase())) {
  throw new Error("Google TTS generation currently supports hindi-1 only.");
}

const apiKey = process.env.GOOGLE_TTS_API_KEY;
if (!apiKey && !hasFlag("dry-run")) {
  throw new Error("GOOGLE_TTS_API_KEY is required. Add it to .env or the shell environment.");
}

const requestedVoiceConfigPath = path.resolve(readOption("voices") ?? "scripts/google-tts-voices.json");
if (!existsSync(requestedVoiceConfigPath)) {
  throw new Error(`Voice config not found: ${requestedVoiceConfigPath}.`);
}

const voiceConfig = await readJson(requestedVoiceConfigPath);
const plan = createHindi1Plan(voiceConfig);
const staleItems = [];

for (const item of plan) {
  if (await isStale(item)) staleItems.push(item);
}

const summary = {
  apiKeyPresent: Boolean(apiKey),
  charactersRequired: staleItems.reduce((total, item) => total + item.text.length, 0),
  filesToGenerate: staleItems.map((item) => path.relative(process.cwd(), item.outputFile)),
  messages: plan.length,
  post: "hindi-1",
  provider: "google-tts",
  ready: Boolean(apiKey)
};

console.log(JSON.stringify(summary, null, 2));

if (!apiKey && hasFlag("dry-run")) {
  process.exitCode = 1;
} else if (!hasFlag("dry-run")) {
  for (const item of staleItems) {
    console.log(`Generating ${path.relative(process.cwd(), item.outputFile)}...`);
    await generateAudio(apiKey, item);
  }
}
