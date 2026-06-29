# Mariana Destrava Roadmap

This branch develops **Mariana Destrava**, a separate speaking-activation section for Brazilian adults who understand English but freeze when they need to answer.

Core positioning: **Na hora de responder, da branco.**

## Product Decisions

- Character: Mariana, Brazilian adult in her early 30s.
- Audience: general Brazilian adults who understand English but freeze when speaking.
- Section name: Mariana Destrava.
- Experience model: story first, then practice.
- Navigation: visible in the top nav and introduced through a feed preview.
- First lesson: Can you repeat that?
- Lesson style: short chat in the existing message style, with activities between conversation milestones and a larger practice activity at the end.
- Story language: English dialogue plus Mariana's Portuguese thoughts.
- First activity: Answer Builder.
- Input model: choose/build answers first, no free typing in v1.
- Feedback style: soft coaching, with safe, better, and more natural answer levels.
- Language: Portuguese by default, English toggle available.
- Audio: Mariana voice, added after UI/content shape is validated.
- Business role: lead magnet for private classes.
- Primary CTA: Book a private class via WhatsApp.

## Milestone 1 - Vertical Slice

- [x] Add a dedicated /mariana route.
- [x] Add a top navigation entry for Mariana Destrava.
- [x] Add a feed preview card from the main feed.
- [x] Create Mariana's profile/visual placeholder.
- [x] Build lesson #1: Can you repeat that?
- [x] Include a short story setup in Portuguese.
- [x] Include a short English chat with Portuguese thought moments.
- [x] Add the first Answer Builder activity between chat milestones.
- [x] Add a larger final Answer Builder at the end.
- [x] Add the Book a private class CTA.
- [x] Verify mobile layout and direct route loading.

## Milestone 2 - Reusable Mariana Lesson System

- [x] Move repeated lesson sections into reusable components if lesson #2 confirms the pattern.
- [x] Support multiple Mariana lessons from one index/list page.
- [x] Add validation for lesson IDs, route slugs, prompts, answer options, and missing translations.
- [x] Add a lesson progress state that can persist locally.

## Milestone 3 - Audio and Practice Polish

- [x] Choose a stable ElevenLabs voice for Mariana.
- [x] Generate audio for Mariana lesson #1.
- [x] Add play buttons for Mariana messages and model answers.
- [x] Add an I froze / Help me rescue phrase panel.
- [x] Add optional replay/say-it-out-loud practice prompts.
- [x] Keep scoring soft: no harsh wrong states in v1.

## Milestone 4 - Publishing and Lead Magnet

- [x] Decide final private-class CTA destination.
- [x] Add basic analytics events for opening Mariana, completing activities, and clicking the CTA.
- [x] Prepare Instagram/TikTok scripts from lesson #1.
- [ ] Merge to main only after explicit final review and approval.
