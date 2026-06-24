# Hindi Learning Branch Roadmap

This branch is a practical learning laboratory for studying Hindi from English with John's Travel. The stable English-from-Portuguese experience remains on `main`. Features developed here should be promoted into the shared application only after they prove useful in real study sessions.

## Working Principles

- Keep `main` stable and treat it as the reference implementation.
- Build the smallest useful Hindi learning loop before generalizing the architecture.
- Record friction discovered during real study instead of guessing at every future feature.
- Keep Devanagari, transliteration, translation, pronunciation, and grammar notes as separate content fields.
- Preserve accurate Hindi spelling and natural phrasing as release requirements.
- Commit focused experiments so unsuccessful ideas can be removed cleanly.

## Milestone H1 — Create the First Hindi Learning Story

- [x] Define Hindi-from-English as the active learning direction for this branch.
- [x] Choose a short beginner scenario with approximately 8–12 conversational messages.
- [x] Add natural Hindi translations in Devanagari for every message.
- [x] Make Hindi the primary chat language and show English meanings in word hints.
- [x] Add consistent Latin-script transliteration for every Hindi sentence.
- [x] Add concise English meaning notes where a literal translation would be misleading.
- [x] Render Devanagari with a font stack that remains legible on desktop and mobile.
- [x] Add content validation for missing Hindi, transliteration, or meaning entries.
- [x] Add browser tests for direct visits, progressive reveal, and Devanagari rendering.

## Milestone H2 — Add Pronunciation Support

- [x] Decide whether the first pronunciation model uses recorded audio, generated audio, or both.
- [x] Add Hindi audio at sentence level without downloading it before it is needed.
- [x] Let the learner replay Hindi independently from the English conversation audio.
- [x] Visually associate each audio control with Devanagari and transliteration.
- [ ] Add clear loading, unavailable, retry, playing, and completed audio states.
- [ ] Document pronunciation conventions used by the transliteration system.
- [x] Test audio behavior on desktop and mobile Chromium.

## Milestone H2.1 — Automate Generated Audio With ElevenLabs

- [x] Document a step-by-step ElevenLabs integration plan.
- [x] Add local `.env` loading for ElevenLabs scripts without exposing keys to the browser.
- [x] Add speaker-to-voice mapping with a committed example config.
- [x] Add a voice-list command using the ElevenLabs voices API.
- [x] Add a dry-run command that estimates required characters and checks account character budget.
- [x] Generate only missing or stale sentence audio files.
- [x] Save generation metadata beside every audio file.
- [x] Wire Hindi 1 to generated MP3 files instead of browser speech synthesis.
- [x] Update tests and export manifests so Hindi videos can use real generated audio.

## Milestone H3 — Build a Focused Study Mode

- [ ] Allow Devanagari, transliteration, and English meaning to be shown or hidden independently.
- [ ] Add a reveal sequence that supports attempting recall before seeing the answer.
- [ ] Add sentence-level completion progress.
- [ ] Let the learner mark a sentence as comfortable, difficult, or needing review.
- [ ] Preserve study state while moving between stories during a session.
- [ ] Add keyboard controls that do not conflict with conversation playback.
- [ ] Keep the study interface usable at the existing supported mobile widths.

## Milestone H4 — Learn From Real Usage

- [ ] Use the branch for several complete study sessions before expanding its scope.
- [ ] Keep a lightweight learning log of confusion, friction, and unexpectedly useful behavior.
- [ ] Identify which information is needed most often: pronunciation, word meaning, grammar, or recall history.
- [ ] Identify controls or panels that interrupt concentration.
- [ ] Distinguish content problems from interface problems.
- [ ] Rank discoveries by learning value rather than novelty.
- [ ] Turn repeated problems into small, testable feature proposals.

## Milestone H5 — Add Review and Retention

- [ ] Add a compact queue of sentences marked for review.
- [ ] Support replaying a difficult sentence without replaying the whole story.
- [ ] Add simple recall prompts from English to Hindi and Hindi to English.
- [ ] Decide whether word-level review is useful or whether sentence-level review is sufficient.
- [ ] Store progress locally without requiring an account.
- [ ] Make progress data exportable before introducing cloud storage.
- [ ] Avoid claiming a spaced-repetition model until its scheduling behavior is defined and tested.

## Milestone H6 — Generalize Proven Features

- [ ] Review which Hindi branch features are genuinely language-independent.
- [ ] Replace hard-coded English–Portuguese assumptions with explicit source and target language configuration.
- [ ] Define reusable content fields for native script, transliteration, meaning, audio, and learning notes.
- [ ] Keep transliteration optional for language pairs that do not need it.
- [ ] Preserve the existing Portuguese experience while migrating shared components.
- [ ] Add tests that run equivalent learning flows for Portuguese and Hindi content.
- [ ] Propose selected shared changes for merging into `main` only after review.

## Export Roadmap — Make Playwright Videos Worth Publishing

The current Playwright export proves that the conversation can be rendered into reusable video formats, including Day 1 with recorded audio. Future work should make exports feel like a designed extension of John's Travel rather than a technical capture.

### Milestone E1 — Establish a Designed Export Baseline

- [ ] Define a visual direction for exported videos that matches the app: social feed warmth, travel diary texture, clear chat pacing, and strong speaker identity.
- [x] Replace the plain canvas background with a branded scene that uses real app assets, such as avatars, feed imagery, location color, and subtle paper or map texture.
- [ ] Create reusable export themes for travel conversations and language-learning conversations.
- [x] Add a title card and ending card with story title, location, and a small John's Travel mark.
- [x] Improve message bubble layout so it feels intentionally composed in 16:9, 9:16, and 1:1 rather than merely scaled.
- [ ] Use typography, spacing, and color tokens derived from the app instead of separate hard-coded export values.
- [ ] Add a quick visual review checklist before treating an export as publishable.

### Milestone E2 — Improve Motion and Conversation Pacing

- [x] Animate each message with app-like entrance motion, including subtle speaker-side movement and opacity easing.
- [x] Sync message reveal timing to audio duration for recorded-audio posts instead of using fixed delays.
- [x] Keep the active message visually emphasized while older messages settle into the background.
- [x] Add smooth transcript scrolling or stacked-window behavior that avoids abrupt jumps when the conversation grows.
- [x] Add optional pauses after important or long messages so viewers can read comfortably.
- [x] Support per-platform pacing presets for YouTube, Shorts/Reels, and square feed posts.
- [x] Add a preview mode that renders a short 10–15 second sample before committing to a full export.

### Milestone E3 — Add Platform-Ready Captions and Text Treatment

- [x] Add burned-in captions that can show source language, target translation, or both depending on the post.
- [ ] For Hindi exports, support Devanagari, transliteration, and English meaning as configurable caption layers.
- [x] Keep caption text inside safe areas for YouTube, Instagram Reels, TikTok, and square feeds.
- [x] Add speaker labels or avatar chips that stay readable on mobile screens.
- [x] Add styling for long lines, names, diacritics, and native-script text without clipping.
- [x] Let exports choose between clean captions, learning captions, and no captions.
- [ ] Add screenshot assertions for caption safe-area and overflow checks.

### Milestone E3.1 — Fix Export Chat Layout Bugs

- [x] Rework bubble vertical metrics so speaker label and message text are visually centered inside each chat bubble.
- [x] Replace the current fixed bubble height formula with measured text-block height plus balanced top and bottom padding.
- [x] Tune speaker-label spacing separately from message-text spacing so short messages do not appear bottom-heavy.
- [x] Verify John and Nicky bubbles use equivalent vertical rhythm even though their colors and alignment differ.
- [x] Move captions out of the chat stack's visual path so they never sit on top of active or recently displayed messages.
- [x] Reserve a dedicated caption band before computing the chat transcript window, rather than drawing captions after chat layout as an overlay.
- [x] Add per-format caption placement rules for 16:9, 9:16, and 1:1 exports, including mobile-safe lower-third margins.
- [x] Add a preview fixture with short, medium, long, and diacritic-heavy messages to inspect bubble centering and caption placement quickly.
- [ ] Add automated screenshot checks for bubble text vertical centering and caption/chat non-overlap.
- [x] Regenerate Day 1 preview exports after the layout fix and compare the first, middle, and final frames manually.

### Milestone E4 — Strengthen Audio Production

- [ ] Normalize recorded message loudness so John and Nicky are balanced across the whole export.
- [ ] Add configurable silence between clips and optional room tone to avoid abrupt cuts.
- [ ] Add optional background music with automatic ducking under speech.
- [ ] Generate a single mixed audio timeline before video recording when possible.
- [ ] Add waveform or speaking-state visual accents that respond to the active clip.
- [ ] Detect missing, clipped, or unusually quiet audio files before export starts.
- [ ] Document when to use recorded audio, generated speech, or silent visual exports.

### Milestone E5 — Build a Reusable Export Pipeline

- [x] Move post metadata, message text, audio paths, translations, and export options into a shared manifest builder.
- [ ] Support any published conversation post without maintaining per-post recorder code.
- [ ] Add CLI options for `--post`, `--format`, `--theme`, `--captions`, `--audio`, `--speed`, and `--output`.
- [ ] Add `ffmpeg` integration for MP4 conversion when it is installed, while keeping WebM as the no-extra-dependency fallback.
- [x] Produce export metadata next to each video: duration, dimensions, codec, audio presence, source post, and render timestamp.
- [x] Add a dry-run command that reports expected duration, missing assets, and output files.
- [ ] Keep generated videos ignored by git while preserving scripts, manifests, and docs.

### Milestone E6 — Quality Gates for Publishable Output

- [ ] Add automated video smoke checks for dimensions, duration, nonblank frames, and audio-track presence.
- [ ] Add thumbnail extraction for quick visual review of the first, middle, and final frames.
- [x] Add a fallback export review that records file size, VP9 video presence, Opus audio presence, and decode errors when thumbnails cannot be extracted.
- [ ] Add platform-specific acceptance checks, including minimum resolution and safe-area margins.
- [ ] Create sample exports for Day 1, Day 2, and Hindi 1 and compare them against a small design checklist.
- [ ] Track export problems in a lightweight log: visual issue, audio issue, platform issue, and smallest next fix.
- [ ] Add a release checklist for uploading to YouTube, Instagram, and TikTok.
- [ ] Review which export improvements should become app UI improvements and which should stay video-only.

## Learning Log

Add dated observations here during real use. Describe what happened, why it affected learning, and the smallest change that might improve it.

<!-- Example:
### YYYY-MM-DD

- Observation:
- Learning impact:
- Possible improvement:
-->
