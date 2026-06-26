# Public Release Audit

John's Travel is moving from a development prototype toward a public website for reading travel stories and learning English from context.

Public domain: `https://conversante.net/`

## Public Positioning

The first public version should feel like a small story-learning library:

- English conversations are the main reading experience.
- Portuguese translations support comprehension.
- Audio helps listening practice.
- Vocabulary hints help readers learn from the sentence they are reading.

## Main Page Map

Keep on the main page:

- Published story cards.
- Day, location, and short story description.
- Cover imagery where available.
- Clear action to open a story.
- Language toggle.
- Short learning-oriented introduction.

Remove or avoid on the main page:

- Fake posting/composer UI.
- Fake social search until real search exists.
- Account/profile sidebars.
- Social mobile navigation.
- Developer-only routes or experimental tooling in public navigation.

Possible later additions:

- Story difficulty.
- Estimated reading/listening time.
- Vocabulary count.
- Filters by location, topic, or level.
- Latest/new story indicator.

## Story Page Map

Keep on story pages:

- Conversation-first layout.
- Continue/reveal interaction.
- Audio replay controls.
- Portuguese translation panel.
- Vocabulary hover/tap hints.
- Previous/next story navigation.

Polish before public release:

- Stronger completion state.
- Clearer audio error/retry experience.
- Metadata per story for browser title and sharing.
- Final copy review for English and Portuguese.
## Metadata and Domain

Current public domain:

- `https://conversante.net/`

Site-level metadata should use Conversante as the public brand while individual stories can still feature John's Travel as the story universe.

Before launch:

- Confirm DNS and hosting target.
- Confirm canonical URL behavior with and without `www`.
- Add story-specific titles and descriptions.
- Add a social preview image.

## Developer-Only Areas

Keep hidden from public navigation:

- `/trip-map`
- `/dev/words`

Before public deployment, decide whether deployment rules should block direct access to developer-only routes or whether hidden direct routes are acceptable for the first private/public test.

