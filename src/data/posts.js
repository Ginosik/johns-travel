import johnAvatar from "../../assets/John-mobile.jpg";
import nickyAvatar from "../../assets/Nicky-mobile.jpg";
import lagoaCover from "../../assets/feed-coast-mobile.jpg";
import hindiCover from "../../assets/feed-cafe-mobile.jpg";
import { createSpeakerSequenceAudioPathGetter } from "../utils/messageAudio.js";
import { validatePosts } from "../utils/validatePosts.js";
import { conversation, conversationTranslations, day1Translations, wordTranslations } from "./day1Content.js";
import { day2Conversation, day2ConversationTranslations, day2Translations, day2WordTranslations } from "./day2Content.js";
import {
  hindi1Conversation,
  hindi1ConversationTranslations,
  hindi1MeaningNotes,
  hindi1Translations,
  hindi1Transliterations,
  hindi1WordTranslations
} from "./hindi1Content.js";

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

const getHindi1AudioPath = createSpeakerSequenceAudioPathGetter(
  hindi1Conversation,
  ({ message, paddedSequence }) => `/audio/hindi-1/${message.speaker}-${paddedSequence}.mp3`
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
      conversationTranslations: day2ConversationTranslations,
      translations: day2Translations,
      wordTranslations: day2WordTranslations,
      getAudioPath: getDay2AudioPath
    }
  },
  {
    id: "hindi-1",
    day: 3,
    href: "/day/3",
    type: "conversation",
    status: "published",
    location: {
      name: "New Delhi",
      region: "Delhi",
      country: "India"
    },
    tags: ["Hindi", "beginner", "greetings", "introductions"],
    tripLabel: "Hindi 1 - Meeting someone",
    workflow: {
      writingStatus: "written",
      audioStatus: "generated",
      notes: "First English-to-Hindi learning story; pronunciation is expected from generated sentence audio files."
    },
    author: sharedAuthor,
    feed: {
      authorNameKey: "profileName",
      ariaLabelKey: "hindi1PostAria",
      copyKey: "hindi1PostCopy",
      coverAltKey: "hindi1CoverAlt",
      coverImage: hindiCover,
      openLabelKey: "openPost",
      subtitleKey: "hindi1PostSubtitle"
    },
    story: {
      avatars: sharedAvatars,
      chatLanguage: { code: "hi", name: "Hindi" },
      conversation: hindi1Conversation,
      conversationTranslations: hindi1ConversationTranslations,
      getAudioPath: getHindi1AudioPath,
      meaningNotes: hindi1MeaningNotes,
      sourceLanguage: { code: "en", name: "English" },
      targetLanguage: { code: "hi", name: "Hindi", badge: "HI" },
      translations: hindi1Translations,
      transliterations: hindi1Transliterations,
      wordTranslations: hindi1WordTranslations
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
