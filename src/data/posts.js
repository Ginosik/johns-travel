import johnAvatar from "../../assets/John-mobile.jpg";
import nickyAvatar from "../../assets/Nicky-mobile.jpg";
import day1Cover from "../../assets/feed-day1-cover.jpg";
import day3Cover from "../../assets/feed-day3-cover.jpg";
import day4Cover from "../../assets/feed-day4-cover.jpg";
import lagoaCover from "../../assets/feed-coast-mobile.jpg";
import { createSpeakerSequenceAudioPathGetter } from "../utils/messageAudio.js";
import { validatePosts } from "../utils/validatePosts.js";
import { conversation, conversationLanguageNoteDetails, conversationLanguageNotes, conversationTranslations, day1Translations, wordTranslations } from "./day1Content.js";
import { day2Conversation, day2ConversationLanguageNoteDetails, day2ConversationLanguageNotes, day2ConversationTranslations, day2Translations, day2WordTranslations } from "./day2Content.js";
import { day3Conversation, day3ConversationLanguageNoteDetails, day3ConversationLanguageNotes, day3ConversationTranslations, day3Translations, day3WordTranslations } from "./day3Content.js";
import { day4Conversation, day4ConversationLanguageNoteDetails, day4ConversationLanguageNotes, day4ConversationTranslations, day4Translations, day4WordTranslations } from "./day4Content.js";

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
  ({ message, paddedSequence }) => `/audio/day2/${message.speaker}-${paddedSequence}.mp3`
);

const getDay3AudioPath = createSpeakerSequenceAudioPathGetter(
  day3Conversation,
  ({ message, paddedSequence }) => `/audio/day3/${message.speaker}-${paddedSequence}.mp3`
);

const getDay4AudioPath = createSpeakerSequenceAudioPathGetter(
  day4Conversation,
  ({ message, paddedSequence }) => `/audio/day4/${message.speaker}-${paddedSequence}.mp3`
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
      coverAltKey: "day1CoverAlt",
      coverImage: day1Cover,
      openLabelKey: "openPost",
      subtitleKey: "postSubtitle"
    },
    story: {
      avatars: sharedAvatars,
      conversation,
      languageNotes: conversationLanguageNotes,
      languageNoteDetails: conversationLanguageNoteDetails,
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
      languageNoteDetails: day2ConversationLanguageNoteDetails,
      conversationTranslations: day2ConversationTranslations,
      translations: day2Translations,
      wordTranslations: day2WordTranslations,
      getAudioPath: getDay2AudioPath
    }
  },
  {
    id: "day-3",
    day: 3,
    href: "/day/3",
    type: "conversation",
    status: "published",
    location: {
      name: "Campeche",
      region: "Santa Catarina",
      country: "Brazil"
    },
    tags: ["bus", "directions", "beach", "Campeche"],
    tripLabel: "Day 3 - Wrong Bus to the Right Beach",
    workflow: {
      writingStatus: "written",
      audioStatus: "recorded",
      notes: "Published Campeche story with bus, direction, and beach vocabulary."
    },
    author: sharedAuthor,
    feed: {
      authorNameKey: "profileName",
      ariaLabelKey: "day3PostAria",
      copyKey: "day3PostCopy",
      coverAltKey: "day3CoverAlt",
      coverImage: day3Cover,
      openLabelKey: "openPost",
      subtitleKey: "day3PostSubtitle"
    },
    story: {
      avatars: sharedAvatars,
      conversation: day3Conversation,
      languageNotes: day3ConversationLanguageNotes,
      languageNoteDetails: day3ConversationLanguageNoteDetails,
      conversationTranslations: day3ConversationTranslations,
      translations: day3Translations,
      wordTranslations: day3WordTranslations,
      getAudioPath: getDay3AudioPath
    }
  },
  {
    id: "day-4",
    day: 4,
    href: "/day/4",
    type: "conversation",
    status: "published",
    location: {
      name: "Street market",
      region: "Santa Catarina",
      country: "Brazil"
    },
    tags: ["market", "fruit", "prices", "quantities"],
    tripLabel: "Day 4 - Buying Fruit at a Street Market",
    workflow: {
      writingStatus: "written",
      audioStatus: "recorded",
      notes: "Published street market story with fruit, price, quantity, and sample vocabulary."
    },
    author: sharedAuthor,
    feed: {
      authorNameKey: "profileName",
      ariaLabelKey: "day4PostAria",
      copyKey: "day4PostCopy",
      coverAltKey: "day4CoverAlt",
      coverImage: day4Cover,
      openLabelKey: "openPost",
      subtitleKey: "day4PostSubtitle"
    },
    story: {
      avatars: sharedAvatars,
      conversation: day4Conversation,
      languageNotes: day4ConversationLanguageNotes,
      languageNoteDetails: day4ConversationLanguageNoteDetails,
      conversationTranslations: day4ConversationTranslations,
      translations: day4Translations,
      wordTranslations: day4WordTranslations,
      getAudioPath: getDay4AudioPath
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
