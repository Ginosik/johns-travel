# John's Travel

A React travel-story web experience styled like a social feed. Published posts open interactive conversations with audio playback, word-level hints, and progressive Portuguese translations.

## Files

- `index.html` - Vite entry page
- `src/` - React app source
- `styles.css` - shared layout and visual styling
- `assets/` - profile images, feed images, and audio files
- `docs/ADDING_A_STORY.md` - data-driven workflow for publishing another travel day
- `docs/elevenlabs/README.md` - step-by-step plan for generating conversation audio with ElevenLabs
- `docs/MOBILE_SUPPORT.md` - supported mobile layouts and release-device checklist

## Run locally

Install dependencies and start the Vite dev server:

```sh
npm install
npm run dev
```

## Add another story

Follow [Adding a Travel Story](docs/ADDING_A_STORY.md). New days are registered in `src/data/posts.js` and do not require new page components or route handlers.

## Deployment routing

The app uses browser-based routes such as `/day/1` and `/day/2`. Configure the production host to serve `index.html` as the fallback for unknown file paths so direct story links and browser refreshes reach React Router.

## Playwright browser tests

Install the Playwright browser once after `npm install`:

```sh
npx playwright install chromium
```

Run the full desktop and mobile suite:

```sh
npm test
```

## Record conversation videos

Generate social-ready WebM captures of a conversation post:

```sh
npm run record:post -- --post /day/3
```

Current aliases also work:

```sh
npm run record:hindi
npm run record:post -- --post day-1
npm run record:post -- --post day-2
npm run record:post -- --post hindi-1
```

The exporter creates three visual captures under `videos/<post>/`:

- `youtube-16x9.webm`
- `vertical-9x16.webm`
- `square-1x1.webm`

Use `--output` to choose the folder name:

```sh
npm run record:post -- --post /day/3 --output hindi-1
```

These are visual browser captures. Playwright does not capture speech synthesis audio as an audio track, so narrated exports still need real audio files or a separate audio-mixing step.

For the first post, which already has complete recorded message audio, create WebM videos with the MP3 conversation mixed in:

```sh
npm run record:day1:audio
```

That command exports the YouTube landscape file to `videos/day-1-audio/`. Day 2 also has recorded audio:

```sh
npm run record:day2:audio
```

The generic form is:

```sh
npm run record:post:audio -- --post day-1 --output day-1-audio --format youtube
```

Use `--format vertical` for Reels/Shorts/TikTok, `--format square` for square posts, or render every format:

```sh
npm run record:post:audio -- --post day-1 --output day-1-audio --format vertical
npm run record:day1:audio:all
```

Captions are burned into the video by default with Portuguese translations. Choose `--captions source`, `--captions both`, or `--captions none` when needed:

```sh
npm run record:post:audio -- --post day-1 --output day-1-audio --format youtube --captions both
```

Use `--pace auto`, `--pace youtube`, `--pace shorts`, `--pace square`, or `--pace slow` to tune title-card length, gaps, and extra pauses after long messages:

```sh
npm run record:post:audio -- --post day-1 --format vertical --pace shorts
```

Render only the opening messages when reviewing visual changes:

```sh
npm run record:post:audio -- --post day-1 --output day-1-preview --format youtube --preview-messages 3
```

Each audio-enabled export also writes a matching `.json` metadata file with duration, dimensions, codec, caption mode, audio presence, and source post.

Extract first, middle, and final review frames from an export:

```sh
npm run review:export -- --video videos/day-1-audio/youtube-16x9-audio.webm
```

The review command writes PNG thumbnails and `review.json` beside the export by default, or to a custom folder with `--output`. If the local Chromium build cannot decode the WebM for thumbnails, it still writes a fallback review with file size, VP9 video presence, Opus audio presence, and the decode error.

Check an audio post before rendering:

```sh
npm run export:dry-run -- --post day-1
npm run export:dry-run -- --post day-2
```

Check Portuguese content for missing diacritics, mojibake, and UTF-8 configuration:

```bash
npm run check:portuguese
```

This check also runs automatically before every production build.

Open Playwright's interactive UI—the easiest way to explore, run, and debug individual tests:

```sh
npm run test:ui
```

Inside the UI, choose a test or browser project and press the run button. The timeline, page snapshot, actions, console, and network details appear alongside the test.

Other useful commands:

```sh
npm run test:headed   # Watch tests execute in browser windows
npm run test:debug    # Step through tests with the Playwright Inspector
npm run test:report   # Open the most recent HTML report
npm test -- tests/conversation.spec.js  # Run one test file
```

The test runner starts and stops the local Vite server automatically. If Windows PowerShell blocks npm scripts, use `npm.cmd` instead, for example `npm.cmd run test:ui`.
