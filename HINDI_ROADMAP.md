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

- [ ] Define Hindi-from-English as the active learning direction for this branch.
- [ ] Choose a short beginner scenario with approximately 8–12 conversational messages.
- [ ] Add natural Hindi translations in Devanagari for every message.
- [ ] Add consistent Latin-script transliteration for every Hindi sentence.
- [ ] Add concise English meaning notes where a literal translation would be misleading.
- [ ] Render Devanagari with a font stack that remains legible on desktop and mobile.
- [ ] Add content validation for missing Hindi, transliteration, or meaning entries.
- [ ] Add browser tests for direct visits, progressive reveal, and Devanagari rendering.

## Milestone H2 — Add Pronunciation Support

- [ ] Decide whether the first pronunciation model uses recorded audio, generated audio, or both.
- [ ] Add Hindi audio at sentence level without downloading it before it is needed.
- [ ] Let the learner replay Hindi independently from the English conversation audio.
- [ ] Visually associate each audio control with Devanagari and transliteration.
- [ ] Add clear loading, unavailable, retry, playing, and completed audio states.
- [ ] Document pronunciation conventions used by the transliteration system.
- [ ] Test audio behavior on desktop and mobile Chromium.

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

## Learning Log

Add dated observations here during real use. Describe what happened, why it affected learning, and the smallest change that might improve it.

<!-- Example:
### YYYY-MM-DD

- Observation:
- Learning impact:
- Possible improvement:
-->
