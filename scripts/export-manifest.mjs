import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  conversation as day1Conversation,
  conversationTranslations as day1ConversationTranslations
} from "../src/data/day1Content.js";
import {
  day2Conversation,
  day2ConversationTranslations
} from "../src/data/day2Content.js";
import {
  day3Conversation,
  day3ConversationTranslations
} from "../src/data/day3Content.js";
import {
  day4Conversation,
  day4ConversationTranslations
} from "../src/data/day4Content.js";

const postAliases = new Map([
  ["day-1", "day-1"],
  ["day1", "day-1"],
  ["1", "day-1"],
  ["/day/1", "day-1"],
  ["day/1", "day-1"],
  ["day-2", "day-2"],
  ["day2", "day-2"],
  ["2", "day-2"],
  ["/day/2", "day-2"],
  ["day/2", "day-2"],
  ["day-3", "day-3"],
  ["day3", "day-3"],
  ["3", "day-3"],
  ["/day/3", "day-3"],
  ["day/3", "day-3"],
  ["day-4", "day-4"],
  ["day4", "day-4"],
  ["4", "day-4"],
  ["/day/4", "day-4"],
  ["day/4", "day-4"]
]);

async function createImageDataUrl(filePath, mimeType) {
  const bytes = await readFile(filePath);
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

function createMessages(conversation, translations, audioPathForMessage, options = {}) {
  const speakerCounts = new Map();

  return conversation.map((message, index) => {
    const sequence = (speakerCounts.get(message.speaker) ?? 0) + 1;
    speakerCounts.set(message.speaker, sequence);

    return {
      speaker: message.speaker,
      text: message.text,
      translation: translations[index],
      transliteration: options.transliterations?.[index] ?? null,
      meaningNote: options.meaningNotes?.[index] ?? null,
      side: message.speaker === "Nicky" ? "right" : "left",
      audioPath: audioPathForMessage(message, sequence)
    };
  });
}

export function normalizeExportPost(post) {
  return postAliases.get(post.trim().toLocaleLowerCase()) ?? null;
}

export async function getConversationExportManifest(post) {
  const normalizedPost = normalizeExportPost(post);
  const sharedTheme = {
    johnAvatar: await createImageDataUrl(path.resolve("assets", "John-mobile.jpg"), "image/jpeg"),
    nickyAvatar: await createImageDataUrl(path.resolve("assets", "Nicky-mobile.jpg"), "image/jpeg")
  };

  const exportPosts = {
    "day-1": {
      audioBasePath: "/audio",
      backgroundImage: "feed-day1-cover.jpg",
      closingTitle: "More from Florianópolis soon",
      conversation: day1Conversation,
      location: "Florianópolis, Brazil",
      subtitle: "Day 1 - First day traveling",
      translations: day1ConversationTranslations
    },
    "day-2": {
      audioBasePath: "/audio/day2",
      backgroundImage: "feed-coast-mobile.jpg",
      closingTitle: "More from Lagoa soon",
      conversation: day2Conversation,
      location: "Lagoa da Conceição, Brazil",
      subtitle: "Day 2 - Exploring Lagoa da Conceição",
      translations: day2ConversationTranslations
    },
    "day-3": {
      audioBasePath: "/audio/day3",
      backgroundImage: "feed-day3-cover.jpg",
      closingTitle: "More from Campeche soon",
      conversation: day3Conversation,
      location: "Campeche, Brazil",
      subtitle: "Day 3 - Wrong Bus to the Right Beach",
      translations: day3ConversationTranslations
    },
    "day-4": {
      audioBasePath: "/audio/day4",
      backgroundImage: "feed-day4-cover.jpg",
      closingTitle: "More from the market soon",
      conversation: day4Conversation,
      location: "Street market, Santa Catarina",
      subtitle: "Day 4 - Buying Fruit at a Street Market",
      translations: day4ConversationTranslations
    }
  };

  const exportPost = exportPosts[normalizedPost];
  if (!exportPost) throw new Error(`Audio export does not support "${post}" yet. Use day-1, day-2, day-3, or day-4.`);

  return {
    outputSlug: normalizedPost,
    title: "John's Travel",
    subtitle: exportPost.subtitle,
    location: exportPost.location,
    closingTitle: exportPost.closingTitle,
    closingSubtitle: "John's Travel",
    theme: {
      ...sharedTheme,
      backgroundImage: await createImageDataUrl(path.resolve("assets", exportPost.backgroundImage), "image/jpeg")
    },
    messages: createMessages(
      exportPost.conversation,
      exportPost.translations,
      (message, sequence) => `${exportPost.audioBasePath}/${message.speaker}-${String(sequence).padStart(2, "0")}.mp3`
    )
  };
}

export function buildDryRunSummary(manifest) {
  return {
    audioFiles: manifest.messages.map((message) => message.audioPath),
    messageCount: manifest.messages.length,
    outputSlug: manifest.outputSlug,
    post: manifest.outputSlug,
    subtitle: manifest.subtitle,
    title: manifest.title,
    translations: manifest.messages.filter((message) => Boolean(message.translation)).length
  };
}
