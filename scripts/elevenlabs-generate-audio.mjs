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

function getVoiceSettings(speakerConfig) {
  return speakerConfig.voiceSettings ?? {
    stability: 0.75,
    similarity_boost: 0.85,
    style: 0,
    use_speaker_boost: true
  };
}

function createHindi1Plan(voiceConfig) {
  const speakerCounts = new Map();

  return hindi1Conversation.map((message, index) => {
    const sequence = (speakerCounts.get(message.speaker) ?? 0) + 1;
    speakerCounts.set(message.speaker, sequence);

    const speakerConfig = voiceConfig[message.speaker];
    if (!speakerConfig?.voiceId) {
      throw new Error(`Missing ElevenLabs voiceId for speaker "${message.speaker}".`);
    }

    const paddedSequence = String(sequence).padStart(2, "0");
    const outputFile = path.resolve("public", "audio", "hindi-1", `${message.speaker}-${paddedSequence}.mp3`);
    const metadataFile = outputFile.replace(/\.mp3$/u, ".json");
    const languageCode = speakerConfig.languageCode ?? "hi";
    const modelId = speakerConfig.modelId ?? process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
    const outputFormat = speakerConfig.outputFormat ?? process.env.ELEVENLABS_OUTPUT_FORMAT ?? "mp3_44100_128";
    const voiceSettings = getVoiceSettings(speakerConfig);
    const hashInput = JSON.stringify({
      languageCode,
      modelId,
      nextText: hindi1Conversation[index + 1]?.text ?? "",
      outputFormat,
      previousText: hindi1Conversation[index - 1]?.text ?? "",
      text: message.text,
      voiceId: speakerConfig.voiceId,
      voiceSettings
    });

    return {
      metadataFile,
      languageCode,
      modelId,
      nextText: hindi1Conversation[index + 1]?.text ?? "",
      outputFile,
      outputFormat,
      previousText: hindi1Conversation[index - 1]?.text ?? "",
      speaker: message.speaker,
      text: message.text,
      textHash: hashText(hashInput),
      voiceId: speakerConfig.voiceId,
      voiceSettings
    };
  });
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function getUsage(apiKey) {
  const response = await fetch("https://api.elevenlabs.io/v1/user", {
    headers: { "xi-api-key": apiKey }
  });

  if (!response.ok) {
    if (response.status === 401) {
      const errorText = await response.text();
      if (errorText.includes("missing_permissions")) {
        return {
          characterCount: null,
          characterLimit: null,
          remainingCharacters: null,
          usageAvailable: false,
          usageWarning: "ElevenLabs API key does not include user_read permission; quota was not checked."
        };
      }
    }

    throw new Error(`ElevenLabs user request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const subscription = data.subscription ?? {};
  const characterCount = subscription.character_count ?? 0;
  const characterLimit = subscription.character_limit ?? 0;

  return {
    characterCount,
    characterLimit,
    remainingCharacters: Math.max(0, characterLimit - characterCount),
    usageAvailable: true,
    usageWarning: null
  };
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
  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${item.voiceId}`);
  url.searchParams.set("output_format", item.outputFormat);

  const response = await fetch(url, {
    body: JSON.stringify({
      language_code: item.languageCode,
      model_id: item.modelId,
      next_text: item.nextText,
      previous_text: item.previousText,
      text: item.text,
      voice_settings: item.voiceSettings
    }),
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS failed for ${item.speaker}: ${response.status} ${await response.text()}`);
  }

  await mkdir(path.dirname(item.outputFile), { recursive: true });
  await writeFile(item.outputFile, Buffer.from(await response.arrayBuffer()));
  await writeFile(item.metadataFile, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    languageCode: item.languageCode,
    modelId: item.modelId,
    outputFormat: item.outputFormat,
    provider: "elevenlabs",
    speaker: item.speaker,
    text: item.text,
    textHash: item.textHash,
    voiceId: item.voiceId,
    voiceSettings: item.voiceSettings
  }, null, 2)}\n`);
}

const post = readOption("post") ?? "hindi-1";
if (!["hindi-1", "hindi1", "day-3", "day3", "3", "/day/3"].includes(post.toLocaleLowerCase())) {
  throw new Error("ElevenLabs generation currently supports hindi-1 only.");
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey && !hasFlag("dry-run")) {
  throw new Error("ELEVENLABS_API_KEY is required. Add it to .env or the shell environment.");
}

const requestedVoiceConfigPath = path.resolve(readOption("voices") ?? "scripts/elevenlabs-voices.json");
const voiceConfigPath = existsSync(requestedVoiceConfigPath)
  ? requestedVoiceConfigPath
  : path.resolve("scripts/elevenlabs-voices.example.json");
if (!existsSync(voiceConfigPath)) {
  throw new Error(`Voice config not found: ${requestedVoiceConfigPath}. Copy scripts/elevenlabs-voices.example.json first.`);
}

const voiceConfig = await readJson(voiceConfigPath);
const plan = createHindi1Plan(voiceConfig);
const staleItems = [];

for (const item of plan) {
  if (await isStale(item)) staleItems.push(item);
}

const requiredCharacters = staleItems.reduce((total, item) => total + item.text.length, 0);
const usage = apiKey
  ? await getUsage(apiKey)
  : { characterCount: null, characterLimit: null, remainingCharacters: null, usageAvailable: false, usageWarning: null };
const ready = Boolean(apiKey) && (usage.usageAvailable ? usage.remainingCharacters >= requiredCharacters : true);
const summary = {
  ...usage,
  apiKeyPresent: Boolean(apiKey),
  charactersRequired: requiredCharacters,
  filesToGenerate: staleItems.map((item) => path.relative(process.cwd(), item.outputFile)),
  messages: plan.length,
  post: "hindi-1",
  ready
};

console.log(JSON.stringify(summary, null, 2));

if (!ready) {
  process.exitCode = 1;
} else if (!hasFlag("dry-run")) {
  for (const item of staleItems) {
    console.log(`Generating ${path.relative(process.cwd(), item.outputFile)}...`);
    await generateAudio(apiKey, item);
  }
}
