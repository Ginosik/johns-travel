# John's Travel

A React travel-story web experience styled like a social feed. Published posts open interactive conversations with audio playback, word-level hints, and progressive Portuguese translations.

## Files

- `index.html` - Vite entry page
- `src/` - React app source
- `styles.css` - shared layout and visual styling
- `assets/` - profile images, feed images, and audio files
- `docs/ADDING_A_STORY.md` - data-driven workflow for publishing another travel day
- `docs/MOBILE_SUPPORT.md` - supported mobile layouts and release-device checklist

## Run locally

Install dependencies and start the Vite dev server:

```sh
npm install
npm run dev
```

## Add another story

Follow [Adding a Travel Story](docs/ADDING_A_STORY.md). New days are registered in `src/data/posts.js` and do not require new page components or route handlers.

## Record Conversation Videos

Generate social-ready WebM captures of an existing conversation post:

```sh
npm run record:post -- --post day-1
npm run record:post -- --post day-2
```

The visual recorder creates landscape, vertical, and square files under `videos/<post>/`. These browser captures do not include an audio track.

For posts with recorded message audio, render a canvas-based WebM with audio mixed in:

```sh
npm run record:day1:audio
npm run record:day2:audio
```

Useful options:

```sh
npm run record:post:audio -- --post day-1 --format vertical --pace shorts
npm run record:post:audio -- --post day-1 --format youtube --captions both
npm run record:post:audio -- --post day-1 --format youtube --preview-messages 3
```

Check audio availability before rendering:

```sh
npm run export:dry-run -- --post day-1
npm run export:dry-run -- --post day-2
```

Extract review frames and metadata from an exported video:

```sh
npm run review:export -- --video videos/day-1-audio/youtube-16x9-audio.webm
```

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
