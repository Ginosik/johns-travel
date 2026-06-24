import { loadEnvFile } from "./load-env.mjs";

loadEnvFile();

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  throw new Error("ELEVENLABS_API_KEY is required. Add it to .env or the shell environment.");
}

const response = await fetch("https://api.elevenlabs.io/v2/voices", {
  headers: { "xi-api-key": apiKey }
});

if (!response.ok) {
  throw new Error(`ElevenLabs voices request failed: ${response.status} ${await response.text()}`);
}

const data = await response.json();
const voices = (data.voices ?? []).map((voice) => ({
  category: voice.category,
  name: voice.name,
  voiceId: voice.voice_id
}));

console.log(JSON.stringify(voices, null, 2));
