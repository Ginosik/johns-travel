# John's Travel Roadmap

## Remaining Tasks

1. Generalize `Day1Page.jsx` into `DayPostPage.jsx`
   - Make the detail page accept post content, conversation data, translations, avatars, and audio configuration.
   - Keep Day 1 as the first data-backed post using the generic page.

2. Extract audio playback into a reusable hook
   - Move `useMessageAudio` from `Day1Page.jsx` to `src/hooks/useMessageAudio.js`.
   - Reuse it for future conversation posts.

3. Add Day 2 content
   - Add a new feed post in `src/data/posts.js`.
   - Create Day 2 conversation data, translations, and audio assets.
   - Route `/day/2` to the reusable day post page.

4. Improve routing
   - Replace the current `window.location.pathname` routing in `App.jsx`.
   - Consider `react-router-dom` once there are multiple post detail routes.

5. Expand post data structure
   - Keep growing `src/data/posts.js` into the source of truth for feed previews.
   - Add fields only when the UI needs them, such as date, location, cover image, tags, or post type.

## React Flow Feature

Use React Flow to add a visual map of John's trip content.

Possible implementation steps:

1. Install React Flow
   - Add `@xyflow/react` to the project.
   - Import the React Flow base styles in the app.

2. Create a trip map page
   - Add a page such as `src/pages/TripMapPage.jsx`.
   - Represent posts as nodes, for example Day 1, Day 2, Day 3.
   - Connect posts with edges to show story progression.

3. Connect map nodes to posts
   - Clicking a node should navigate to that post's detail route.
   - Use the existing post IDs and routes from `src/data/posts.js`.

4. Store map data separately
   - Add `src/data/tripFlow.js`.
   - Keep nodes and edges data-driven so new posts can appear in the map without rewriting the page.

5. Add navigation
   - Add a way to open the trip map from the feed UI.
   - Consider a top-bar or mobile-bar entry once routing is improved.

## Playwright Testing

Use Playwright to add browser-level tests for the main user flows.

Possible implementation steps:

1. Install Playwright
   - Add `@playwright/test` to the project.
   - Add test scripts such as `test` and `test:ui` to `package.json`.

2. Test feed rendering
   - Verify the feed loads.
   - Verify the composer appears.
   - Verify Day 1 appears as a post preview.

3. Test feed-to-post navigation
   - Click the Day 1 post.
   - Verify the app navigates to `/day/1`.
   - Verify the first message appears when opened from the feed.

4. Test direct Day 1 visits
   - Open `/day/1` directly.
   - Verify the conversation does not start until `Continue` is clicked.
   - Verify `Continue` advances messages.

5. Test language toggles
   - Toggle language on the feed.
   - Toggle language on the Day 1 page.
   - Verify visible text updates.

6. Test responsive layout
   - Add desktop and mobile viewport tests.
   - Verify the mobile bar appears correctly on small screens.

7. Test audio behavior carefully
   - Verify audio buttons render for messages.
   - Avoid brittle assertions on actual audio playback unless browser support is reliable.
   - Prefer checking UI state such as the `is-playing` class after user interaction.

## Completed

- Migrated the project to React/Vite.
- Rebuilt the feed page in React.
- Rebuilt the Day 1 page in React.
- Moved feed and Day 1 content into data files.
- Removed legacy `day1.html` and `scripts/`.
- Extracted shared components:
  - `Avatar.jsx`
  - `LanguageToggle.jsx`
  - `TopBar.jsx`
  - `MobileBar.jsx`
  - `FeedLayout.jsx`
  - `Composer.jsx`
  - `PostPreview.jsx`
  - `PostHeader.jsx`
  - `ConversationMessage.jsx`
  - `TypingMessage.jsx`
  - `HoverableText.jsx`
- Added `src/data/posts.js` and render feed posts with `.map()`.
