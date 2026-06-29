import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { marianaContent } from "../src/data/marianaContent.js";

const API_BASE_URL = "https://api.elevenlabs.io/v1";

function readOption(name, fallback = null) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1) return process.argv[index + 1];

  return fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

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

function getOutputExtension(outputFormat) {
  if (outputFormat.startsWith("mp3_")) return "mp3";
  if (outputFormat.startsWith("wav_")) return "wav";
  return outputFormat.split("_")[0] || "audio";
}

function publicAudioPathToFilePath(audioPath) {
  const normalized = audioPath.replace(/^\//, "");
  if (!normalized.startsWith("audio/mariana/")) {
    throw new Error(`Mariana audio path must stay inside /audio/mariana/: ${audioPath}`);
  }
  return path.join("public", normalized);
}

function buildJobs(lessonSlug, extension) {
  const lessons = marianaContent.en.lessons.filter((lesson) => !lessonSlug || lesson.slug === lessonSlug || lesson.id === lessonSlug);
  if (lessons.length === 0) throw new Error(`No Mariana lesson matched "${lessonSlug}".`);

  const jobs = [];
  for (const lesson of lessons) {
    for (const step of lesson.steps) {
      if (step.type === "message" && step.message.speaker === "Mariana" && step.message.audioPath) {
        jobs.push({
          kind: "message",
          lessonId: lesson.id,
          label: `${lesson.id} Mariana message`,
          text: step.message.text,
          audioPath: step.message.audioPath
        });
      }

      if (step.type === "activity") {
        for (const answer of step.activity.answers) {
          if (!answer.audioPath) continue;
          jobs.push({
            kind: "model-answer",
            lessonId: lesson.id,
            label: `${step.activity.id} ${answer.level}`,
            text: answer.text,
            audioPath: answer.audioPath
          });
        }
      }
    }
  }

  const invalidExtension = jobs.find((job) => path.extname(job.audioPath).slice(1) !== extension);
  if (invalidExtension) {
    throw new Error(`Output format creates .${extension}, but ${invalidExtension.audioPath} has a different extension.`);
  }

  return jobs;
}

async function createSpeech({ apiKey, modelId, outputFormat, text, voiceId, voiceSettings }) {
  const url = new URL(`${API_BASE_URL}/text-to-speech/${voiceId}`);
  url.searchParams.set("output_format", outputFormat);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: voiceSettings
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs request failed (${response.status}): ${errorText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

await loadEnvFile(readOption("env", ".env"));

const outputFormat = readOption("output-format", "mp3_44100_128");
const extension = readOption("extension", getOutputExtension(outputFormat));
const modelId = readOption("model", process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2");
const dryRun = hasFlag("dry-run");
const lesson = readOption("lesson", "repeat-that");
const apiKey = dryRun ? process.env.ELEVENLABS_API_KEY : getRequiredEnv("ELEVENLABS_API_KEY");
const voiceId = dryRun ? process.env.ELEVENLABS_VOICE_MARIANA ?? "<ELEVENLABS_VOICE_MARIANA>" : getRequiredEnv("ELEVENLABS_VOICE_MARIANA");
const voiceSettings = {
  stability: Number(readOption("stability", process.env.ELEVENLABS_MARIANA_STABILITY ?? "0.82")),
  similarity_boost: Number(readOption("similarity-boost", process.env.ELEVENLABS_MARIANA_SIMILARITY_BOOST ?? "0.86")),
  style: Number(readOption("style", process.env.ELEVENLABS_MARIANA_STYLE ?? "0.05")),
  use_speaker_boost: readOption("speaker-boost", process.env.ELEVENLABS_MARIANA_SPEAKER_BOOST ?? "true") !== "false"
};

const jobs = buildJobs(lesson, extension);
console.log(`Generating ${jobs.length} Mariana clips for ${lesson} with ${modelId} as ${outputFormat}.`);

for (const [index, job] of jobs.entries()) {
  const filePath = publicAudioPathToFilePath(job.audioPath);
  console.log(`${String(index + 1).padStart(2, "0")}. ${job.label} -> ${filePath}`);

  if (dryRun) continue;

  const audio = await createSpeech({
    apiKey,
    modelId,
    outputFormat,
    text: job.text,
    voiceId,
    voiceSettings
  });

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, audio);
}

if (dryRun) {
  console.log("Dry run complete. No files were written.");
} else {
  console.log("Mariana ElevenLabs audio generation complete.");
}
