# Story Production Routine

This is the repeatable routine for producing a new Conversante travel story. The goal is to keep every story useful for English learners while keeping the production process scalable as the trip grows.

## Quality Gates

Every new conversation story must include:

- At least 200 words in the English conversation text.
- A clear travel activity, location, language focus, vocabulary theme, and small conflict or surprise.
- Portuguese UI copy, full-sentence translations, word hover translations, and bilingual language notes when useful.
- Scalable vocabulary data generated from scripts, not hand-edited generated JSON.
- Refined conversation-word senses through defaults and post-level overrides.
- ElevenLabs audio using the standard John and Nicky voice IDs from .env.
- A cover image saved in assets/ and wired into the feed card.
- A passing production build before commit.

The 200-word minimum is enforced by src/utils/validatePosts.js during npm run build.

## 1. Pick The Story Idea

Start from docs/TRAVEL_STORY_IDEAS.md or src/data/storyIdeas.js.

Before writing, confirm:

- Location
- Activity
- Language focus
- Vocabulary theme
- Conversation conflict
- Intended day number and route, such as day-3 and /day/3

## 2. Draft The Conversation

Create a content module such as src/data/day3Content.js using Day 1 or Day 2 as the shape reference.

The English conversation should:

- Use John and Nicky unless the story intentionally introduces another speaker.
- Contain at least 200 words across conversation[*].text.
- Stay beginner-friendly but natural.
- Include specific travel details instead of generic sightseeing.
- Create useful vocabulary through context, not word lists.
- Keep each message short enough for comfortable audio playback.

A good target is 14 to 24 messages and 220 to 320 total conversation words.

## 3. Add Translations And Learning Data

In the same content module, add:

- conversationTranslations: one Portuguese sentence translation for every English message.
- languageNotes: bilingual short notes with en and pt arrays, each the same length as the conversation.
- languageNoteDetails: bilingual expanded explanations with en and pt arrays, each the same length as the conversation.
- wordTranslations: hover-level Portuguese meanings for useful words in the conversation.
- UI translations for both en and pt, including languageNoteMoreLabel and languageNoteLessLabel.

Keep every note, detail, and translation array in the same order as the English conversation.

### Language Notes

Language notes are for English learners. Portuguese is the default because the public app opens in Portuguese, but learners can switch the app to English and read the same notes in English.

Use this structure for every new story:

~~~js
export const day3ConversationLanguageNotes = {
  en: [
    "Short English note for message 1."
  ],
  pt: [
    "Nota curta em portugues para a mensagem 1."
  ]
};

export const day3ConversationLanguageNoteDetails = {
  en: [
    "Longer English explanation revealed by the More? button."
  ],
  pt: [
    "Explicacao maior em portugues revelada pelo botao Mais?."
  ]
};
~~~

The short note should explain the immediate phrase or structure. The detail should add the learner-friendly reason, usage context, contrast, or grammar pattern.

Button labels come from the story UI translations:

~~~js
languageNoteMoreLabel: "More?" // en
languageNoteLessLabel: "Less"
languageNoteMoreLabel: "Mais?" // pt
languageNoteLessLabel: "Menos"
~~~

The validator expects bilingual note arrays to match the conversation length when notes are provided.

## 4. Register The Story

Update src/data/posts.js with:

- The new content imports.
- A cover image import.
- A getDayNAudioPath resolver using /audio/dayN/{speaker}-{sequence}.mp3.
- A new post entry with id, day, href, location, tags, workflow, feed keys, and story data.

Update src/data/feedTranslations.js with feed card copy and cover alt text in English and Portuguese.

Update docs/conversation-word-posts.json with the new post module and export names. This manifest is shared by vocabulary generation and ElevenLabs audio generation.

## 5. Generate And Refine Vocabulary Senses

Run:

~~~sh
npm run words:senses
npm run words:validate
~~~

Then inspect:

~~~text
docs/conversation-word-review.json
~~~

Refinement rules:

- Add reusable word decisions to docs/word-sense-defaults.json.
- Add context-specific decisions to docs/conversation-word-data/<post-id>/sense-overrides.json.
- Do not hand-edit generated conversation-word-counts.json or conversation-word-senses.json files.
- Regenerate after every defaults or override change.
- Mark every embedded non-English token with languageTag and languageName in defaults or overrides. For Portuguese from Brazil, use languageTag "pt-BR" and languageName "Portuguese".
- Treat names and quoted local words deliberately. If the word should not be read as English in /dev/words, add language metadata or a clear note.
- Check docs/conversation-word-review.json for missingLanguageMetadata before approving the story.
- Repeat until npm run words:validate has no structural issues and the review report is acceptable.

The review report may still list words needing judgment. That is expected during refinement; the important part is that the remaining items are intentional and reviewed.

## 6. Generate ElevenLabs Audio

Make sure .env contains:

~~~text
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_JOHN=
ELEVENLABS_VOICE_NICKY=
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_STABILITY=0.52
ELEVENLABS_SIMILARITY_BOOST=0.78
ELEVENLABS_STYLE=0.18
ELEVENLABS_SPEAKER_BOOST=true
~~~

Generate a future day with:

~~~sh
npm run audio:elevenlabs -- --post day-3 --output-format mp3_44100_128
~~~

The generator reads docs/conversation-word-posts.json, so future posts only need to be added to that manifest. Audio is written to both:

~~~text
public/audio/day3/
assets/audios/day3/
~~~

Use the same John and Nicky voice IDs for every story unless the character changes.

## 7. Generate The Cover Image

For each story, generate a horizontal cover image that shows the actual activity or setting. Avoid abstract gradients or generic travel stock imagery.

Recommended prompt shape:

~~~text
Use case: photorealistic-natural
Asset type: website story cover image
Primary request: cover image for Day N - <story title>
Scene/backdrop: <specific place and activity>
Subject: <objects or scene details from the story>
Style/medium: realistic editorial travel photography
Composition/framing: horizontal 16:10 cover, clear focal point, no text
Lighting/mood: natural, warm, readable
Color palette: navy, turquoise, coral, warm off-white, mint, sand accents
Constraints: no readable words, no logos, no watermark, no distorted text
~~~

Save the final optimized image in assets/, for example:

~~~text
assets/feed-day3-cover.jpg
~~~

Then import it in src/data/posts.js and add coverAltKey translations in src/data/feedTranslations.js.

## 8. Verify Locally

Run:

~~~sh
npm run build
~~~

Then open:

~~~text
http://localhost:5173/
http://localhost:5173/day/3
http://localhost:5173/trip-map
http://localhost:5173/dev/words
~~~

Check:

- The feed card appears in Portuguese by default.
- The cover image loads and has useful alt text.
- The conversation starts empty and advances with Continuar.
- The translation panel matches revealed messages.
- Short language notes and expanded More?/Mais? explanations appear in Portuguese by default and switch to English when the app language changes.
- Every audio button plays the expected voice.
- Vocabulary hover hints and the dev words dashboard include the new story.
- In /dev/words, Portuguese words such as "onde", "ponto", "ônibus", or local place names are not silently labeled as English. Untagged rows should appear as "Assumed English" and be reviewed before publishing.
- The trip map shows the story as planned, written, recorded, or published as appropriate.

## 9. Commit Only Production Assets

Commit:

- Source files
- Generated vocabulary JSON
- Public audio files
- Asset audio copies
- Cover image
- Documentation updates

Do not commit:

- .env
- local backup folders
- raw oversized image drafts
- temporary exports
- videos unless intentionally publishing them
