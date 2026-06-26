import johnAvatar from "../../assets/John-mobile.jpg";
import nickyAvatar from "../../assets/Nicky-mobile.jpg";
import lagoaCover from "../../assets/feed-coast-mobile.jpg";
import { createSpeakerSequenceAudioPathGetter } from "../utils/messageAudio.js";
import { validatePosts } from "../utils/validatePosts.js";
import { conversation, conversationLanguageNotes, conversationTranslations, day1Translations, wordTranslations } from "./day1Content.js";
import { day2Conversation, day2ConversationLanguageNotes, day2ConversationTranslations, day2Translations, day2WordTranslations } from "./day2Content.js";

const sharedAuthor = {
  name: "John",
  avatar: johnAvatar,
  avatarAlt: "John"
};

const sharedAvatars = {
  John: { src: johnAvatar, className: "small" },
  Nicky: { src: nickyAvatar, className: "small nick-avatar" }
};

const getDay1AudioPath = createSpeakerSequenceAudioPathGetter(
  conversation,
  ({ message, paddedSequence }) => `/audio/${message.speaker}-${paddedSequence}.mp3`
);

const getDay2AudioPath = createSpeakerSequenceAudioPathGetter(
  day2Conversation,
  ({ message, paddedSequence }) => `/audio/day2/${message.speaker}-${paddedSequence}.wav`
);

export const posts = validatePosts([
  {
    id: "day-1",
    day: 1,
    href: "/day/1",
    legacyPaths: ["/day1.html"],
    type: "conversation",
    status: "published",
    location: {
      name: "Florianópolis",
      region: "Santa Catarina",
      country: "Brazil"
    },
    tags: ["arrival", "language", "food", "Festa Junina"],
    tripLabel: "Day 1 - First day traveling",
    workflow: {
      writingStatus: "written",
      audioStatus: "recorded",
      notes: "Published foundation story and reusable conversation reference."
    },
    author: sharedAuthor,
    feed: {
      authorNameKey: "profileName",
      ariaLabelKey: "postAria",
      copyKey: "postCopy",
      openLabelKey: "openPost",
      subtitleKey: "postSubtitle"
    },
    story: {
      avatars: sharedAvatars,
      conversation,
      languageNotes: conversationLanguageNotes,
      conversationTranslations,
      translations: day1Translations,
      wordTranslations,
      getAudioPath: getDay1AudioPath
    }
  },
  {
    id: "day-2",
    day: 2,
    href: "/day/2",
    type: "conversation",
    status: "published",
    location: {
      name: "Lagoa da Conceição",
      region: "Santa Catarina",
      country: "Brazil"
    },
    tags: ["lagoon", "neighborhood", "Portuguese", "food"],
    tripLabel: "Day 2 - Exploring Lagoa da Conceição",
    workflow: {
      writingStatus: "written",
      audioStatus: "recorded",
      notes: "Published Lagoa story with generated English audio clips."
    },
    author: sharedAuthor,
    feed: {
      authorNameKey: "profileName",
      ariaLabelKey: "day2PostAria",
      copyKey: "day2PostCopy",
      coverAltKey: "day2CoverAlt",
      coverImage: lagoaCover,
      openLabelKey: "openPost",
      subtitleKey: "day2PostSubtitle"
    },
    story: {
      avatars: sharedAvatars,
      conversation: day2Conversation,
      languageNotes: day2ConversationLanguageNotes,
      conversationTranslations: day2ConversationTranslations,
      translations: day2Translations,
      wordTranslations: day2WordTranslations,
      getAudioPath: getDay2AudioPath
    }
  }
]);

export function getPostById(postId) {
  return posts.find((post) => post.id === postId);
}

export function getPostByPath(path) {
  return posts.find((post) => post.href === path || post.legacyPaths?.includes(path));
}

export function getPublishedPostNeighbors(postId) {
  const publishedPosts = posts.filter((post) => post.status === "published");
  const postIndex = publishedPosts.findIndex((post) => post.id === postId);

  return {
    previousPost: postIndex > 0 ? publishedPosts[postIndex - 1] : null,
    nextPost: postIndex >= 0 && postIndex < publishedPosts.length - 1 ? publishedPosts[postIndex + 1] : null
  };
}
