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
  ["day/2", "day-2"]
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

  if (normalizedPost === "day-1") {
    return {
      outputSlug: "day-1",
      title: "John's Travel",
      subtitle: "Day 1 - First day traveling",
      location: "Florianópolis, Brazil",
      closingTitle: "More from Florianópolis soon",
      closingSubtitle: "John's Travel",
      theme: {
        ...sharedTheme,
        backgroundImage: await createImageDataUrl(path.resolve("assets", "feed-coast-mobile.jpg"), "image/jpeg")
      },
      messages: createMessages(
        day1Conversation,
        day1ConversationTranslations,
        (message, sequence) => `/audio/${message.speaker}-${String(sequence).padStart(2, "0")}.mp3`
      )
    };
  }

  if (normalizedPost === "day-2") {
    return {
      outputSlug: "day-2",
      title: "John's Travel",
      subtitle: "Day 2 - Exploring Lagoa da Conceição",
      location: "Lagoa da Conceição, Brazil",
      closingTitle: "More from Lagoa soon",
      closingSubtitle: "John's Travel",
      theme: {
        ...sharedTheme,
        backgroundImage: await createImageDataUrl(path.resolve("assets", "feed-coast-mobile.jpg"), "image/jpeg")
      },
      messages: createMessages(
        day2Conversation,
        day2ConversationTranslations,
        (message, sequence) => `/audio/day2/${message.speaker}-${String(sequence).padStart(2, "0")}.mp3`
      )
    };
  }

  throw new Error(`Audio export does not support "${post}" yet. Use day-1 or day-2.`);
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
