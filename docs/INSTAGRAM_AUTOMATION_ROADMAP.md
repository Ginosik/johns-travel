# Instagram Automation Roadmap

This roadmap covers the Instagram promotion pipeline for Conversante, starting with reviewable carousel content and growing into optional automatic publishing through the Instagram Graph API. The first audience is Brazilians learning English, so carousel framing, captions, CTAs, and review copy should be in Portuguese; English should appear as the practice material itself.

## Product Goal

Create a repeatable workflow where every Conversante post can produce polished Instagram assets for:

- [x] `@conversante42` as the main hub.
- [ ] A John-focused page for the travel story series.
- [ ] A Mariana-focused page for the coaching/destrava series.

The first target is John's Day 1 post. The safest path is to generate and review content locally first, then add publishing only after the Instagram/Meta account setup is ready.

## Milestone 1 - Local Carousel Content

Status: complete for Day 1

Goal: generate the written parts of an Instagram carousel from app content without requiring Instagram credentials.

Deliverables:

- [x] A script that creates per-post social folders under `public/social/`.
- [x] Slide copy for a Day 1 carousel.
- [x] Caption text, hashtags, CTA, and alt text.
- [x] Portuguese-first framing for Brazilian learners, with English reserved for conversation excerpts and practice phrases.
- [x] A small README explaining what was generated and where it should be reviewed.

Acceptance criteria:

- [x] Running `npm run social:generate -- --post day-1` creates `public/social/day-1/`.
- [x] The generated copy is useful without manual hunting through the app.
- [x] The generated copy is understandable to beginner/intermediate Brazilian learners before they read the English examples.
- [x] The content is separate from the final rendered images, so copy can be reviewed before design work starts.

## Milestone 2 - Carousel Visual Rendering

Status: in progress

Goal: turn the carousel content into ready-to-post image files.

Deliverables:

- [x] A reusable visual template for 1080x1350 carousel slides.
- [x] PNG export for each Day 1 slide.
- [ ] Visual variants for the main Conversante hub, John, and Mariana accounts.
- [x] A generated HTML preview before export.
- [x] Generated visual assets for Days 1-4, used as editorial backgrounds on the first carousel slide.

Acceptance criteria:

- [x] Day 1 exports a complete carousel image set.
- [x] Text fits on mobile-safe Instagram dimensions.
- [x] The brand, post title, and CTA are visible without feeling crowded.
- [x] The first slide has a concrete visual cue for the day while preserving readable lesson copy.

## Milestone 3 - Review And Export Workflow

Status: planned

Goal: make the creator workflow comfortable before automation.

Deliverables:

- [ ] A preview route or static review page for generated social posts.
- [ ] Export package containing images, caption, hashtags, alt text, and destination link.
- [ ] Manual approval checklist before any publishing action.

Acceptance criteria:

- [ ] A generated post can be reviewed in one place.
- [ ] The export package is ready for manual Instagram posting.
- [ ] Nothing is published automatically from local generation.

## Milestone 4 - Instagram Publishing Backend

Status: planned

Goal: add optional automatic posting through Meta's official publishing flow.

Requirements:

- [ ] Instagram Professional account for each account that will publish.
- [ ] Connected Facebook Page for each Instagram account.
- [ ] Meta Developer app with the required Instagram Graph API permissions.
- [ ] Server-side token storage through environment variables or a secrets manager.

Deliverables:

- [ ] Backend endpoint or serverless function for creating media containers.
- [ ] Carousel publishing flow for multiple slides.
- [ ] Secure handling of access tokens.
- [ ] Clear failure states for expired permissions, missing account setup, or rejected media.

Acceptance criteria:

- [ ] Publishing works only from server-side code.
- [ ] No access tokens are committed to the repository.
- [ ] Manual review remains part of the flow unless explicitly disabled.

## Milestone 5 - Scheduling And Analytics

Status: planned

Goal: promote consistently and learn what content works.

Deliverables:

- [ ] Content calendar data model.
- [ ] Scheduled publishing queue.
- [ ] UTM links per campaign/account/post.
- [ ] Basic analytics notes for impressions, saves, clicks, and follows.

Acceptance criteria:

- [ ] Posts can be planned ahead by account and campaign.
- [ ] Captions and CTAs include trackable links where useful.
- [ ] Results can inform future carousel structure.

## Milestone 6 - Multi-Account Expansion

Status: planned

Goal: support the main Conversante page plus character/topic pages without duplicating work.

Deliverables:

- [ ] Account profiles for Conversante, John, and Mariana.
- [ ] Per-account voice, CTA, hashtag, and link rules.
- [ ] Cross-posting guidance so each account has a distinct reason to exist.

Acceptance criteria:

- [ ] The same lesson can produce account-specific copy.
- [ ] John content feels travel-story driven.
- [ ] Mariana content feels coaching/practice driven.
- [ ] The main hub ties both series back to Conversante.

## Current Next Step

Review the generated Day 1 carousel images, then decide whether to refine the visual style or move into a formal review/export page.