# ElevenLabs Audio Integration Guide

This guide describes how to connect John's Travel to ElevenLabs so conversation audio can be generated automatically from story text. The goal is to make audio creation repeatable, cacheable, and safe, while keeping API keys out of the React app.

## Current Status

The app already supports recorded audio when files exist in `public/audio/`.

- Day 1 uses MP3 files in `public/audio/`.
- Day 2 uses WAV files in `public/audio/day2/`.
- Hindi 1 currently uses browser speech synthesis, not saved audio files.

The ElevenLabs integration should generate real audio files for posts that do not have recorded clips yet, then let the existing playback and export pipeline use those files.

## Important Concepts

ElevenLabs usage is generally measured by characters, not app tokens. Before generating audio, check the account character budget and compare it to the total text that will be sent.

Never put the ElevenLabs API key in browser code, React components, Vite public env vars, or committed files. Use local scripts only.

Useful ElevenLabs docs:

- Text to Speech: `POST /v1/text-to-speech/:voice_id`
  https://elevenlabs.io/docs/api-reference/text-to-speech/convert
- User and subscription info: `GET /v1/user`
  https://elevenlabs.io/docs/api-reference/user/get
- Voices list: `GET /v2/voices`
  https://elevenlabs.io/docs/api-reference/voices/search

## Desired Workflow

The finished workflow should look like this:

```sh
npm run elevenlabs:voices
npm run elevenlabs:dry-run -- --post hindi-1
npm run elevenlabs:generate -- --post hindi-1
npm run record:post:audio -- --post hindi-1 --format youtube
```

The first implementation can support Hindi 1 only. Once stable, it can be generalized to any conversation post.

## Step 1 — Create an ElevenLabs API Key

In ElevenLabs:

1. Open your account or workspace settings.
2. Create an API key.
3. Copy it once.
4. Store it only in a local `.env` file.

Create `.env` in the project root:

```env
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_OUTPUT_FORMAT=mp3_44100_128
```

Add `.env` to `.gitignore` if it is not already ignored.

## Step 2 — Pick Voices for Speakers

Each speaker needs a stable ElevenLabs voice ID.

Run the future voice-list command:

```sh
npm run elevenlabs:voices
```

It should call:

```txt
GET https://api.elevenlabs.io/v2/voices
```

The output should show at least:

```json
[
  {
    "voice_id": "abc123",
    "name": "Example Voice"
  }
]
```

Choose one voice for John and one for Nicky.

## Step 3 — Add Voice Mapping

Create a local config file that maps app speakers to ElevenLabs voices.

Suggested file:

```txt
scripts/elevenlabs-voices.json
```

Example:

```json
{
  "John": {
    "voiceId": "JOHN_VOICE_ID",
    "modelId": "eleven_multilingual_v2",
    "outputFormat": "mp3_44100_128"
  },
  "Nicky": {
    "voiceId": "NICKY_VOICE_ID",
    "modelId": "eleven_multilingual_v2",
    "outputFormat": "mp3_44100_128"
  }
}
```

If this file contains private or paid voice IDs, consider keeping it local and adding a committed example file instead:

```txt
scripts/elevenlabs-voices.example.json
```

## Step 4 — Decide Output Paths

Generated files should go under `public/audio/` so the app and video exporter can use them.

Recommended path pattern:

```txt
public/audio/<post-slug>/<Speaker>-<sequence>.mp3
```

For Hindi 1:

```txt
public/audio/hindi-1/John-01.mp3
public/audio/hindi-1/Nicky-01.mp3
public/audio/hindi-1/John-02.mp3
...
```

The post data should then expose a `getAudioPath` function for Hindi 1, similar to Day 1 and Day 2.

## Step 5 — Add a Dry Run

Before generating audio, run a dry run:

```sh
npm run elevenlabs:dry-run -- --post hindi-1
```

The dry run should:

- Load the target post conversation.
- Count all characters that would be sent to ElevenLabs.
- Check which output files already exist.
- Check which files are missing.
- Read account subscription info from ElevenLabs.
- Compare remaining character budget to required characters.
- Print a clear generation plan.

Expected output shape:

```json
{
  "post": "hindi-1",
  "messages": 10,
  "charactersRequired": 312,
  "characterCount": 17231,
  "characterLimit": 100000,
  "remainingCharacters": 82769,
  "missingAudio": [
    "public/audio/hindi-1/John-01.mp3"
  ],
  "ready": true
}
```

If `ready` is false, do not generate.

## Step 6 — Generate Only Missing or Stale Audio

Generation should be conservative. Do not regenerate every file by default.

The script should skip a message when:

- The output audio file already exists.
- A metadata file proves the text, voice ID, model ID, and output format have not changed.

Suggested metadata next to each audio file:

```txt
public/audio/hindi-1/John-01.json
```

Example metadata:

```json
{
  "provider": "elevenlabs",
  "voiceId": "JOHN_VOICE_ID",
  "modelId": "eleven_multilingual_v2",
  "outputFormat": "mp3_44100_128",
  "text": "नमस्ते! मेरा नाम जॉन है।",
  "textHash": "sha256...",
  "generatedAt": "2026-06-23T00:00:00.000Z"
}
```

## Step 7 — Call ElevenLabs Text to Speech

For each missing or stale message, call:

```txt
POST https://api.elevenlabs.io/v1/text-to-speech/:voice_id?output_format=mp3_44100_128
```

Headers:

```txt
xi-api-key: <ELEVENLABS_API_KEY>
Content-Type: application/json
```

Body:

```json
{
  "text": "नमस्ते! मेरा नाम जॉन है।",
  "model_id": "eleven_multilingual_v2"
}
```

Save the response bytes directly as `.mp3`.

## Step 8 — Wire Generated Audio Into the App

After files exist, update the Hindi post in `src/data/posts.js`.

Example shape:

```js
const getHindi1AudioPath = createSpeakerSequenceAudioPathGetter(
  hindi1Conversation,
  ({ message, paddedSequence }) => `/audio/hindi-1/${message.speaker}-${paddedSequence}.mp3`
);
```

Then add this to the Hindi story:

```js
getAudioPath: getHindi1AudioPath
```

Also update the workflow status:

```js
audioStatus: "recorded"
```

or use a clearer future value if validation supports it:

```js
audioStatus: "generated"
```

## Step 9 — Validate App Playback

Run:

```sh
npm run build
npm test -- tests/hindi-learning.spec.js
```

Then manually open `/day/3` and confirm:

- Each revealed message has an audio button.
- Audio loads only when needed.
- John and Nicky use the expected voices.
- Hindi pronunciation sounds acceptable.
- The browser speech-synthesis fallback is no longer the primary path.

## Step 10 — Export Video With Real Audio

Once Hindi audio files exist and the manifest supports Hindi:

```sh
npm run export:dry-run -- --post hindi-1
npm run record:post:audio -- --post hindi-1 --format youtube --captions both
```

The video exporter should use the generated MP3 files, just like Day 1 and Day 2.

## Recommended Scripts

Add these scripts when implementation begins:

These scripts are available:

```json
{
  "elevenlabs:voices": "node scripts/elevenlabs-voices.mjs",
  "elevenlabs:dry-run": "node scripts/elevenlabs-generate-audio.mjs --dry-run",
  "elevenlabs:generate": "node scripts/elevenlabs-generate-audio.mjs"
}
```

## Safety Rules

- Never commit `.env` or API keys.
- Never expose `ELEVENLABS_API_KEY` through Vite frontend env vars.
- Always dry-run before generation.
- Always show estimated character usage before spending account credits.
- Prefer generating only missing or stale files.
- Keep generated audio metadata so accidental regeneration is avoidable.
- Be careful with cloned voices and permissions. Only use voices you have the right to use.

## First Implementation Checklist

- [x] Add `.env` support for local scripts.
- [x] Add `scripts/elevenlabs-voices.example.json`.
- [x] Add a voice-list script.
- [x] Add a dry-run generator mode.
- [x] Add character budget checking through `GET /v1/user`.
- [x] Add TTS generation through `POST /v1/text-to-speech/:voice_id`.
- [ ] Save generated MP3 files under `public/audio/hindi-1/`.
- [ ] Save metadata JSON beside every generated audio file.
- [x] Wire Hindi 1 to `getAudioPath`.
- [ ] Update validation to allow generated ElevenLabs audio.
- [x] Add tests for generated-audio path presence.
- [ ] Export Hindi 1 video using real generated audio.
