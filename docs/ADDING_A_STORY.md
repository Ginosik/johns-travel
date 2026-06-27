# Adding a Travel Story

For the complete repeatable production workflow, including the 200-word minimum, vocabulary-sense refinement, ElevenLabs audio, and cover images, see `docs/STORY_PRODUCTION_ROUTINE.md`.

New conversation stories are data-driven. Adding one should not require changes to `App.jsx`, `FeedPage.jsx`, `DayPostPage.jsx`, or the trip-map page.

## 1. Create the story content

Add a file such as `src/data/day3Content.js` and export:

- UI translations for `en` and `pt`
- the English conversation messages, with at least 200 words total
- one full Portuguese translation for every message
- word-level translations used by the hover hints
- bilingual language notes and More?/Mais? note details for every message

Use `day1Content.js` or `day2Content.js` as the shape reference. Keep message and full-translation arrays in the same order.

## 2. Add media

Put cover images in `assets/` and conversation audio in `public/audio/`. Files in the public audio path are requested only when playback begins. Audio files should use a predictable speaker sequence such as:

```text
John-01.mp3
Nicky-01.mp3
John-02.mp3
```

Story-specific audio can live in a folder such as `public/audio/day3/`.

## 3. Register the post

Import the content and media in `src/data/posts.js`, create an audio resolver with `createSpeakerSequenceAudioPathGetter`, and add one object to `posts`.

Each post contains:

- identity: `id`, `day`, `href`, and optional `legacyPaths`
- publishing metadata: `type`, `status`, `location`, and `tags`
- presentation metadata: `tripLabel`, `author`, and `feed`
- story data: avatars, conversation, sentence translations, UI translations, word translations, and audio resolution

Use a unique route such as `/day/3` and a unique ID such as `day-3`.

## 4. Add feed copy

Add the keys referenced by the post's `feed` section to both languages in `src/data/feedTranslations.js`.

## 5. Generate vocabulary senses and audio

Add the story to `docs/conversation-word-posts.json`, then run:

```sh
npm run words:senses
npm run words:validate
npm run audio:elevenlabs -- --post day-3 --output-format mp3_44100_128
```

Refine reusable senses in `docs/word-sense-defaults.json` and post-specific senses in `docs/conversation-word-data/<post-id>/sense-overrides.json`. Do not hand-edit generated vocabulary files.

## 6. Verify the story

Run:

```sh
npm run build
```

The post validator checks required metadata, duplicate IDs and routes, speaker avatars, UI translation keys, audio configuration, conversation/full-translation parity, the 200-word minimum, and bilingual language-note array lengths. Then verify the feed card, direct story URL, conversation progress, translation panel, and audio controls in the browser.
