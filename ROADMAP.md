# John's Travel Roadmap

This roadmap turns John's Travel from a single interactive story into a reusable, testable travel-journal experience. Check off each item as it lands; a milestone is complete when all of its tasks are checked.

## Milestone 1 — Establish the Current Experience

- [x] Build a social-feed-style home page.
- [x] Add a Day 1 post preview and interactive conversation page.
- [x] Add Portuguese translations and message audio playback.
- [x] Add baseline responsive navigation and mobile styling.
- [x] Create a developer-only trip map at `/trip-map`.
- [x] Add trip-map themes, density controls, and edge styles.
- [x] Keep the trip map out of user-facing feed navigation while it is experimental.

## Milestone 2 — Create a Reusable Story System

- [x] Generalize `Day1Page.jsx` into `DayPostPage.jsx`.
- [x] Make the detail page accept post content, conversation data, translations, avatars, and audio configuration.
- [x] Move `useMessageAudio` from `Day1Page.jsx` into `src/hooks/useMessageAudio.js`.
- [x] Replace Day 1-specific audio helpers with a reusable audio-path strategy.
- [x] Keep Day 1 working as the first data-backed story after the refactor.
- [x] Add a reusable story registry with route lookup, author data, avatars, conversations, translations, and audio resolvers.
- [x] Replace Day 1-specific feed navigation with generic post navigation.
- [x] Add a friendly not-found state for an unknown day or post.

## Milestone 3 — Publish Day 2

- [x] Choose the Day 2 location and story beat.
- [x] Add the Day 2 feed preview to `src/data/posts.js`.
- [x] Create Day 2 conversation content and translations.
- [x] Add and verify Day 2 avatars, cover imagery, and audio assets.
- [x] Route `/day/2` through the reusable day-post page.
- [x] Verify that Day 1 and Day 2 can both be opened from the feed and visited directly.

## Milestone 4 — Make Content Data-Driven

- [x] Make `src/data/posts.js` the source of truth for feed previews and story routes.
- [x] Add useful post fields such as date, location, cover image, tags, post type, and publication status.
- [x] Move each story's conversation and translations into a consistent content schema.
- [x] Generate feed-to-post navigation from post data instead of post-specific callbacks.
- [x] Add lightweight content validation for missing IDs, routes, translations, or media.
- [x] Document how to add a new travel day without editing page components.

## Milestone 5 — Upgrade Routing and Navigation

- [x] Add `react-router-dom`.
- [x] Replace manual `window.location.pathname` and `history.pushState` routing in `App.jsx`.
- [x] Support feed, day detail, trip map, and not-found routes declaratively.
- [x] Preserve browser back/forward behavior and direct-link loading.
- [x] Restore a visitor's language choice across routes and refreshes.
- [x] Add previous-day and next-day navigation to story pages.

## Milestone 6 — Turn the Trip Map into a Content Workbench

- [x] Create custom React Flow nodes for `day`, `location`, `conversation`, `audio`, and `draft` content.
- [x] Keep custom node components in `src/components/flow/`.
- [x] Add statuses such as `planned`, `written`, `audio-needed`, `recorded`, and `published`.
- [x] Store flow and status metadata in post data or `src/data/tripFlow.js`.
- [x] Add a read-only selected-node inspector with route, status, audio state, and notes.
- [x] Add timeline, branching-story, and location-based layout modes.
- [x] Add visibility filters for content type and publication status.
- [x] Keep layouts data-driven so new posts appear without page rewrites.
- [x] Create a developer-only mapped-words dashboard at `/dev/words`.
- [x] Add searchable vocabulary rows for surface words, lemmas, senses, Portuguese meanings, notes, and examples.
- [x] Add developer filters for post scope, part of speech, minimum usage count, missing Portuguese mappings, and sort order.
- [x] Keep the words dashboard out of user-facing feed navigation.

## Milestone 6.1 - Build Hierarchical Vocabulary Study Data

- [x] Treat the aggregate vocabulary files as a study index, not the only source of dashboard data.
- [x] Generate `conversation-word-counts.json` and `conversation-word-senses.json` for every individual post.
- [x] Store post-level vocabulary files in a predictable hierarchy so Day 1 and Day 2 each own their own small-scale data.
- [x] Preserve aggregate all-post files for whole-trip study views.
- [x] Update the developer words dashboard so multiple selected posts can be combined into one study set.
- [x] Recalculate dashboard totals, unique words, unique senses, and filtered results from the selected post set.
- [x] Keep the hierarchy ready for future posts without manually rewriting dashboard logic for every new day.
- [x] Document the generated data contract clearly enough that future study tools can reuse it.

## Milestone 6.2 - Make Vocabulary Sense Generation Scalable

- [x] Refactor `scripts/build-conversation-word-senses.mjs` so it stays a generator engine instead of becoming the long-term home for all vocabulary decisions.
- [x] Move reusable default sense metadata into a dedicated data file such as `docs/word-sense-defaults.json`.
- [x] Move per-post context overrides into post-owned files such as `docs/conversation-word-data/day-1/sense-overrides.json`.
- [x] Load future posts from the story registry or another data-driven manifest instead of manually extending the script's `posts` array.
- [x] Add a concise validation command that reports unknown parts of speech, missing Portuguese meanings, count mismatches, and stale token overrides.
- [x] Add a review report that highlights only the words and occurrences needing human judgment after generation.
- [x] Document the repeatable workflow: generate vocabulary data, inspect the review report, add defaults or overrides, regenerate, and validate.
- [x] Keep the process reliable for many future posts without hand-editing generated JSON files.

## Milestone 7 — Make the Core Experience Mobile-Ready

- [x] Add baseline feed breakpoints for tablet and mobile layouts.
- [x] Stack the conversation translation panel below the chat on narrow screens.
- [x] Audit every core page at 320px, 360px, 390px, 768px, and 1024px widths.
- [x] Prevent horizontal overflow in the feed, story pages, translation panel, and trip map.
- [x] Keep avatars, message bubbles, audio controls, and long translated sentences readable at narrow widths.
- [x] Give all interactive controls a minimum touch target of approximately 44 by 44 pixels.
- [x] Add mobile-safe spacing around the back link, language toggle, translation toggle, and conversation controls.
- [x] Keep the primary `Continue` action reachable during long conversations without covering messages.
- [x] Respect iOS safe-area insets around fixed or sticky controls.
- [x] Verify that opening and closing the translation panel does not cause disruptive scroll jumps.
- [x] Make the translation panel header remain visible while its mobile transcript scrolls.
- [x] Handle portrait and landscape orientation changes without losing conversation progress.
- [x] Verify audio playback and autoplay fallback behavior in mobile Chromium.
- [x] Add clear mobile audio loading and failure feedback for slow or interrupted connections.
- [x] Lazy-load feed imagery and avoid downloading story audio before it is needed.
- [x] Compress oversized avatars and cover images for mobile bandwidth and memory limits.
- [x] Preserve feed and conversation scroll position when navigating back on mobile.
- [x] Ensure browser zoom and text-size changes do not clip controls or overlap chat content.
- [x] Test with the on-screen keyboard open anywhere text input is available.
- [x] Verify Android Chrome-compatible behavior with mobile Chromium emulation.
- [ ] Verify the experience on a physical or hosted iOS Safari device before public release.
- [x] Document the supported mobile browsers and minimum viewport width.

## Milestone 8 — Add Browser-Level Confidence

- [x] Install `@playwright/test` and add `test` and `test:ui` scripts.
- [x] Test that the feed, composer, and published post previews render.
- [x] Test feed-to-story navigation for every published day.
- [x] Test direct story visits and the `Continue` interaction.
- [x] Test language toggles on both feed and story pages.
- [x] Test opening, closing, and progressively updating the full-translation panel.
- [x] Verify that the translation panel shows only messages already revealed in the conversation.
- [x] Test desktop and mobile layouts, including the mobile bar and safe-area spacing.
- [x] Test the translation panel at desktop, tablet, narrow mobile, and landscape mobile widths.
- [x] Add viewport coverage for 320px, 360px, 390px, 768px, and desktop widths.
- [x] Test that no core page introduces horizontal scrolling at supported widths.
- [x] Test conversation progress and scroll restoration across mobile navigation.
- [x] Test audio controls using stable UI state rather than brittle playback timing.
- [x] Add an accessibility smoke test for keyboard controls, expanded state, and live translation updates.
- [x] Run the production build and browser tests in continuous integration.
- [ ] Add browser coverage for the developer-only `/dev/words` dashboard search and filters.
- [x] Repair the current `src/data/day2Content.js` parse issue so production builds can run again.

## Milestone 9 — Polish the Conversation and Translation Experience

- [x] Add complete Portuguese sentence translations for the Day 1 conversation.
- [x] Add a compact button to show or hide the full translation.
- [x] Reveal translated lines progressively as conversation messages appear.
- [x] Keep the translation panel beside the conversation on wider screens.
- [x] Stack the translation panel below the conversation on smaller screens.
- [x] Automatically keep the newest translated line visible inside the panel.
- [x] Localize translation controls and empty-state copy in English and Portuguese.
- [x] Expose the panel's expanded state and live updates to assistive technology.
- [x] Add a visible conversation progress indicator, such as `4 of 20`.
- [x] Add a subtle “new translation” highlight that does not distract from the active message.
- [x] Add a clear fallback when a message is missing its full-sentence translation.
- [x] Validate that conversation and translation arrays contain the same number of entries.
- [x] Allow the translation panel to be closed with `Escape` and return focus to its toggle.
- [x] Decide whether the panel preference should persist while navigating between stories.
- [x] Review the Portuguese sentences for accents, punctuation, natural phrasing, and regional clarity.
- [x] Keep speaker colors and names visually aligned between chat messages and translated lines.
- [x] Add a compact panel header that remains visible while its transcript scrolls.

## Milestone 10 — Restore Portuguese Diacritics Across the Application

- [x] Audit every reader-facing Portuguese string in the feed, story pages, conversations, translation panels, navigation, controls, empty states, audio feedback, and error messages.
- [x] Restore all required Portuguese diacritics, including acute accents, circumflexes, tildes, cedillas, and grave accents.
- [x] Correct place names and proper nouns such as `Florianópolis` and `Lagoa da Conceição` everywhere they appear.
- [x] Review full-sentence translations for natural Brazilian Portuguese after restoring their diacritics.
- [x] Review word-by-word hover translations so vocabulary hints use correct Portuguese spelling.
- [x] Ensure source files, HTML, and the production build consistently use UTF-8 without mojibake or stripped characters.
- [x] Add automated checks that catch common unaccented Portuguese words in reader-facing content.
- [x] Add browser tests covering representative accented text on the feed and every published story.
- [x] Perform a final visual review to ensure diacritics are rendered clearly by the application fonts at desktop and mobile sizes.

## Milestone 11 — Polish the Overall Reader Experience

- [ ] Add loading, empty, and media-error states.
- [ ] Show a useful audio error message with a retry action when playback fails.
- [ ] Distinguish audio loading, playing, paused, completed, and unavailable states.
- [ ] Add visible focus styles and complete keyboard navigation.
- [ ] Respect reduced-motion preferences for typing and transition effects.
- [ ] Audit color contrast, semantic headings, labels, and screen-reader announcements.
- [ ] Test zoom up to 200% without clipped controls or overlapping conversation content.
- [x] Add a polished completion state with a route to the next story or back to the feed.
- [ ] Preserve reading position when returning from a story to the feed.
- [ ] Optimize image and audio loading so the feed opens quickly.
- [ ] Compress remaining oversized desktop imagery without visible quality loss.
- [ ] Preload only the next useful audio clip instead of the entire conversation.
- [ ] Add shareable page titles, descriptions, and social preview metadata per story.
- [ ] Add chapter markers for conversations that grow beyond a comfortable single-session length.
- [ ] Add a final visual consistency pass for spacing, typography, shadows, and button states.

## Milestone 11.1 — Prepare the Public Website Release

- [x] Map the public purpose: a story-learning website for reading travel conversations and learning English from context.
- [x] Remove fake social interactions from the main page, including composer, search, sidebar profile navigation, and mobile social navigation.
- [x] Add a learning-oriented main-page intro that explains stories, Portuguese support, and vocabulary-in-context.
- [x] Keep developer-only routes out of public navigation.
- [x] Set the initial public domain and site-level metadata for `https://conversante.net/`.
- [ ] Decide whether direct access to developer-only routes should be blocked in production.
- [ ] Add story-level metadata for browser titles, descriptions, and social previews.
- [ ] Add a social preview image for link sharing.
- [ ] Confirm DNS, hosting target, and canonical `www` behavior for `conversante.net`.
- [ ] Add visible learning signals to story cards, such as audio availability, vocabulary count, or English level.
- [x] Improve the story completion state with a clear next-story path and return-to-library action.
- [ ] Review the public copy in English and Portuguese for clarity, tone, and launch readiness.
- [ ] Run a final public-readiness pass on desktop and mobile before deployment.

## Milestone 12 — Expand Beyond Conversation Posts

- [ ] Add a photo-journal post type with a small gallery.
- [ ] Add a location entry with map coordinates and practical notes.
- [ ] Add tags or filters for places, food, people, and travel days.
- [ ] Add a polished chronological trip timeline for readers.
- [ ] Decide whether the React Flow map should remain developer-only or inspire a simplified reader-facing map.
- [ ] If the map becomes public, add mobile behavior, accessible alternatives, and clear navigation.

## Milestone 13 — Release the First Complete Trip Chapter

- [ ] Publish at least three complete, translated travel days.
- [ ] Complete accessibility, responsive, and cross-browser checks.
- [ ] Complete the real-device mobile release checklist.
- [ ] Add a production deployment workflow.
- [ ] Configure analytics with a privacy-conscious approach.
- [ ] Add a concise content and media backup process.
- [ ] Tag the first stable release as `v1.0.0`.

## Future Ideas

- [ ] Offer optional continuous audio playback for a full conversation.
- [ ] Add offline reading for previously opened stories.
- [ ] Let readers bookmark a story or resume where they stopped.
- [ ] Add a lightweight trip search.
- [ ] Add export or copy helpers to the developer vocabulary dashboard for lesson planning.
- [ ] Explore an authoring tool only after the content schema has stabilized.

