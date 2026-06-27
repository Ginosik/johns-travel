import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { conversation as day1Conversation } from "../src/data/day1Content.js";
import { day2Conversation } from "../src/data/day2Content.js";

const API_BASE_URL = "https://api.elevenlabs.io/v1";
const speakerVoiceEnv = {
  John: "ELEVENLABS_VOICE_JOHN",
  Nicky: "ELEVENLABS_VOICE_NICKY"
};
const posts = new Map([
  ["day-1", { id: "day-1", day: 1, conversation: day1Conversation }],
  ["day-2", { id: "day-2", day: 2, conversation: day2Conversation }]
]);

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
  if (outputFormat.startsWith("pcm_")) return "wav";
  if (outputFormat.startsWith("mp3_")) return "mp3";
  if (outputFormat.startsWith("wav_")) return "wav";
  if (outputFormat.startsWith("ulaw_")) return "ulaw";
  return outputFormat.split("_")[0] || "audio";
}

function getPcmSampleRate(outputFormat) {
  if (!outputFormat.startsWith("pcm_")) return null;
  const sampleRate = Number(outputFormat.slice("pcm_".length));
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) throw new Error(`Unsupported PCM output format: ${outputFormat}`);
  return sampleRate;
}

function wrapPcmAsWav(pcmBuffer, sampleRate) {
  const channelCount = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * channelCount * bitsPerSample / 8;
  const blockAlign = channelCount * bitsPerSample / 8;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channelCount, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]);
}

function resolvePost(postId) {
  const normalized = postId.startsWith("day-") ? postId : `day-${postId}`;
  const post = posts.get(normalized);
  if (!post) {
    const available = [...posts.keys()].join(", ");
    throw new Error(`Unknown post "${postId}". Available posts: ${available}`);
  }
  return post;
}

function buildMessageJobs(post, extension) {
  const counts = new Map();
  return post.conversation.map((message, index) => {
    const sequence = (counts.get(message.speaker) ?? 0) + 1;
    counts.set(message.speaker, sequence);
    const paddedSequence = String(sequence).padStart(2, "0");
    const fileName = `${message.speaker}-${paddedSequence}.${extension}`;
    const subdir = post.day === 1 ? "" : `day${post.day}`;
    return {
      index,
      speaker: message.speaker,
      text: message.text,
      sequence,
      fileName,
      publicPath: path.join("public", "audio", subdir, fileName),
      assetPath: path.join("assets", "audios", subdir, fileName)
    };
  });
}

async function createSpeech({ apiKey, voiceId, modelId, outputFormat, text, previousText, nextText, voiceSettings }) {
  const url = new URL(`${API_BASE_URL}/text-to-speech/${voiceId}`);
  url.searchParams.set("output_format", outputFormat);

  const body = {
    text,
    model_id: modelId,
    previous_text: previousText ?? undefined,
    next_text: nextText ?? undefined,
    voice_settings: voiceSettings
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs request failed (${response.status}): ${errorText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function writeAudioFile(filePath, audioBuffer, dryRun) {
  if (dryRun) return;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, audioBuffer);
}

await loadEnvFile(readOption("env", ".env"));

const postId = readOption("post", "day-2");
const outputFormat = readOption("output-format", "pcm_44100");
const extension = readOption("extension", getOutputExtension(outputFormat));
const modelId = readOption("model", process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2");
const dryRun = hasFlag("dry-run");
const skipAssets = hasFlag("skip-assets");
const post = resolvePost(postId);
const apiKey = dryRun ? process.env.ELEVENLABS_API_KEY : getRequiredEnv("ELEVENLABS_API_KEY");
const voiceSettings = {
  stability: Number(readOption("stability", process.env.ELEVENLABS_STABILITY ?? "0.52")),
  similarity_boost: Number(readOption("similarity-boost", process.env.ELEVENLABS_SIMILARITY_BOOST ?? "0.78")),
  style: Number(readOption("style", process.env.ELEVENLABS_STYLE ?? "0.18")),
  use_speaker_boost: readOption("speaker-boost", process.env.ELEVENLABS_SPEAKER_BOOST ?? "true") !== "false"
};
const jobs = buildMessageJobs(post, extension);
const pcmSampleRate = getPcmSampleRate(outputFormat);

console.log(`Generating ${jobs.length} ${post.id} clips with ${modelId} as ${outputFormat}.`);

for (const job of jobs) {
  const envName = speakerVoiceEnv[job.speaker] ?? `ELEVENLABS_VOICE_${job.speaker.toUpperCase()}`;
  const voiceId = dryRun ? process.env[envName] ?? `<${envName}>` : getRequiredEnv(envName);
  const previousText = post.conversation[job.index - 1]?.text;
  const nextText = post.conversation[job.index + 1]?.text;
  const destinationSummary = skipAssets ? job.publicPath : `${job.publicPath} + ${job.assetPath}`;

  console.log(`${String(job.index + 1).padStart(2, "0")}. ${job.speaker} -> ${destinationSummary}`);

  if (dryRun) continue;

  const rawAudio = await createSpeech({
    apiKey,
    voiceId,
    modelId,
    outputFormat,
    text: job.text,
    previousText,
    nextText,
    voiceSettings
  });
  const audioBuffer = pcmSampleRate ? wrapPcmAsWav(rawAudio, pcmSampleRate) : rawAudio;

  await writeAudioFile(job.publicPath, audioBuffer, dryRun);
  if (!skipAssets) await writeAudioFile(job.assetPath, audioBuffer, dryRun);
}

if (dryRun) {
  console.log("Dry run complete. No files were written.");
} else {
  console.log("ElevenLabs audio generation complete.");
}