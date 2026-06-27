const MIN_CONVERSATION_WORDS = 200;
const WORD_TOKEN_PATTERN = /[\p{L}\p{N}]+(?:['\u2019][\p{L}\p{N}]+)?/gu;

const STORY_TRANSLATION_KEYS = [
  "audioError",
  "audioLoading",
  "audioReplay",
  "audioRetry",
  "audioWaiting",
  "backLink",
  "complete",
  "continue",
  "startConversation",
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
  "translationWaiting",
  "languageNoteMoreLabel",
  "languageNoteLessLabel"
];

function countConversationWords(conversation) {
  return conversation.reduce((total, message) => total + (message.text.match(WORD_TOKEN_PATTERN) ?? []).length, 0);
}

function languageArrayMatchesConversation(value, conversation) {
  if (Array.isArray(value)) return value.length === conversation?.length;
  if (!value || typeof value !== "object") return false;
  return ["en", "pt"].every((language) => Array.isArray(value[language]) && value[language].length === conversation?.length);
}

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
    const languageNotes = post.story?.languageNotes;
    const languageNoteDetails = post.story?.languageNoteDetails;

    if (!Array.isArray(conversation) || conversation.length === 0) {
      errors.push(`${path}.story.conversation must contain at least one message`);
    } else {
      const conversationWordCount = countConversationWords(conversation);
      if (conversationWordCount < MIN_CONVERSATION_WORDS) {
        errors.push(`${path}.story.conversation has ${conversationWordCount} words; each conversation needs at least ${MIN_CONVERSATION_WORDS} words.`);
      }

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

    if (languageNotes !== undefined) {
      if (!languageArrayMatchesConversation(languageNotes, conversation)) {
        errors.push(`${path}.story.languageNotes must include en and pt arrays matching the conversation length when provided`);
      }

      if (languageNoteDetails !== undefined && !languageArrayMatchesConversation(languageNoteDetails, conversation)) {
        errors.push(`${path}.story.languageNoteDetails must include en and pt arrays matching the conversation length when provided`);
      }

      ["en", "pt"].forEach((language) => {
        addMissingValueError(errors, post.story?.translations?.[language]?.languageNoteLabel, `${path}.story.translations.${language}.languageNoteLabel`);
      });
    }

    if (typeof post.story?.getAudioPath !== "function") {
      errors.push(`${path}.story.getAudioPath must be a function`);
    } else if (Array.isArray(conversation)) {
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
    });
  });

  if (errors.length > 0) {
    throw new Error(`Invalid post data:\n- ${errors.join("\n- ")}`);
  }

  return posts;
}
