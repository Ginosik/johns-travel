const STORY_TRANSLATION_KEYS = [
  "audioError",
  "audioLoading",
  "audioReplay",
  "audioRetry",
  "audioWaiting",
  "backLink",
  "complete",
  "continue",
  "conversationLabel",
  "hideTranslation",
  "intro",
  "nextStory",
  "previousStory",
  "showTranslation",
  "storyNavigationLabel",
  "subtitle",
  "title",
  "toggle",
  "translationTitle",
  "translationMissing",
  "progressLabel",
  "progressOf",
  "translationWaiting"
];

function addMissingValueError(errors, value, path) {
  if (value === undefined || value === null || value === "") {
    errors.push(`${path} is required`);
  }
}

export function validatePosts(posts) {
  const errors = [];
  const ids = new Set();
  const paths = new Set();

  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error("Post data must contain at least one post.");
  }

  posts.forEach((post, postIndex) => {
    const path = `posts[${postIndex}]`;

    addMissingValueError(errors, post.id, `${path}.id`);
    addMissingValueError(errors, post.day, `${path}.day`);
    addMissingValueError(errors, post.href, `${path}.href`);
    addMissingValueError(errors, post.type, `${path}.type`);
    addMissingValueError(errors, post.status, `${path}.status`);
    addMissingValueError(errors, post.workflow?.writingStatus, `${path}.workflow.writingStatus`);
    addMissingValueError(errors, post.workflow?.audioStatus, `${path}.workflow.audioStatus`);
    addMissingValueError(errors, post.location?.name, `${path}.location.name`);
    addMissingValueError(errors, post.location?.country, `${path}.location.country`);
    addMissingValueError(errors, post.author?.name, `${path}.author.name`);
    addMissingValueError(errors, post.author?.avatar, `${path}.author.avatar`);
    addMissingValueError(errors, post.feed?.authorNameKey, `${path}.feed.authorNameKey`);
    addMissingValueError(errors, post.feed?.ariaLabelKey, `${path}.feed.ariaLabelKey`);
    addMissingValueError(errors, post.feed?.subtitleKey, `${path}.feed.subtitleKey`);
    addMissingValueError(errors, post.feed?.copyKey, `${path}.feed.copyKey`);
    addMissingValueError(errors, post.feed?.openLabelKey, `${path}.feed.openLabelKey`);

    if (post.feed?.coverImage && !post.feed.coverAltKey) {
      errors.push(`${path}.feed.coverAltKey is required when a cover image is provided`);
    }

    if (ids.has(post.id)) errors.push(`${path}.id duplicates "${post.id}"`);
    if (paths.has(post.href)) errors.push(`${path}.href duplicates "${post.href}"`);
    ids.add(post.id);
    paths.add(post.href);

    if (!Array.isArray(post.tags) || post.tags.length === 0) {
      errors.push(`${path}.tags must contain at least one tag`);
    }

    const conversation = post.story?.conversation;
    const translations = post.story?.conversationTranslations;
    const isHindiStory = post.story?.targetLanguage?.code === "hi";

    if (!Array.isArray(conversation) || conversation.length === 0) {
      errors.push(`${path}.story.conversation must contain at least one message`);
    } else {
      conversation.forEach((message, messageIndex) => {
        addMissingValueError(errors, message.speaker, `${path}.story.conversation[${messageIndex}].speaker`);
        addMissingValueError(errors, message.text, `${path}.story.conversation[${messageIndex}].text`);
        if (message.speaker && !post.story?.avatars?.[message.speaker]) {
          errors.push(`${path}.story.avatars is missing speaker "${message.speaker}"`);
        }
      });
    }

    if (!Array.isArray(translations) || translations.length !== conversation?.length) {
      errors.push(`${path}.story.conversationTranslations must match the conversation length`);
    } else {
      translations.forEach((translation, translationIndex) => {
        addMissingValueError(errors, translation, `${path}.story.conversationTranslations[${translationIndex}]`);
      });
    }

    if (isHindiStory) {
      if (post.story?.chatLanguage?.code !== "hi") {
        errors.push(`${path}.story.chatLanguage.code must be "hi" for Hindi chat`);
      }
      addMissingValueError(errors, post.story?.chatLanguage?.name, `${path}.story.chatLanguage.name`);
      if (!post.story?.getAudioPath) {
        addMissingValueError(errors, post.story?.pronunciation?.language, `${path}.story.pronunciation.language`);
        addMissingValueError(errors, post.story?.pronunciation?.type, `${path}.story.pronunciation.type`);
      }
      addMissingValueError(errors, post.story?.sourceLanguage?.code, `${path}.story.sourceLanguage.code`);
      addMissingValueError(errors, post.story?.sourceLanguage?.name, `${path}.story.sourceLanguage.name`);
      addMissingValueError(errors, post.story?.targetLanguage?.name, `${path}.story.targetLanguage.name`);
      addMissingValueError(errors, post.story?.targetLanguage?.badge, `${path}.story.targetLanguage.badge`);

      [
        ["transliterations", post.story?.transliterations],
        ["meaningNotes", post.story?.meaningNotes]
      ].forEach(([field, entries]) => {
        if (!Array.isArray(entries) || entries.length !== conversation?.length) {
          errors.push(`${path}.story.${field} must match the conversation length`);
          return;
        }

        entries.forEach((entry, entryIndex) => {
          addMissingValueError(errors, entry, `${path}.story.${field}[${entryIndex}]`);
        });
      });

      translations?.forEach((translation, translationIndex) => {
        if (translation && !/[\u0900-\u097f]/u.test(translation)) {
          errors.push(`${path}.story.conversationTranslations[${translationIndex}] must contain Devanagari text`);
        }
      });

      conversation?.forEach((message, messageIndex) => {
        if (message.text && !/[\u0900-\u097f]/u.test(message.text)) {
          errors.push(`${path}.story.conversation[${messageIndex}].text must contain Devanagari text`);
        }
      });
    }

    if (post.workflow?.audioStatus === "recorded" && typeof post.story?.getAudioPath !== "function") {
      errors.push(`${path}.story.getAudioPath must be a function when audio is recorded`);
    } else if (post.workflow?.audioStatus === "recorded" && Array.isArray(conversation)) {
      conversation.forEach((message, messageIndex) => {
        try {
          addMissingValueError(errors, post.story.getAudioPath(message, messageIndex), `${path}.story audio for message ${messageIndex}`);
        } catch (error) {
          errors.push(`${path}.story audio for message ${messageIndex} could not be resolved: ${error.message}`);
        }
      });
    }

    ["en", "pt"].forEach((language) => {
      STORY_TRANSLATION_KEYS.forEach((key) => {
        addMissingValueError(errors, post.story?.translations?.[language]?.[key], `${path}.story.translations.${language}.${key}`);
      });

      if (isHindiStory) {
        [
          "learningDirection",
          "meaningLabel",
          "pronunciationLoading",
          "pronunciationReplay",
          "pronunciationUnavailable",
          "transliterationLabel"
        ].forEach((key) => {
          addMissingValueError(errors, post.story?.translations?.[language]?.[key], `${path}.story.translations.${language}.${key}`);
        });
      }
    });
  });

  if (errors.length > 0) {
    throw new Error(`Invalid post data:\n- ${errors.join("\n- ")}`);
  }

  return posts;
}
