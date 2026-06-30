import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { conversation, conversationTranslations, wordTranslations } from "../src/data/day1Content.js";
import { day2Conversation, day2ConversationTranslations, day2WordTranslations } from "../src/data/day2Content.js";
import { day3Conversation, day3ConversationTranslations, day3WordTranslations } from "../src/data/day3Content.js";
import { day4Conversation, day4ConversationTranslations, day4WordTranslations } from "../src/data/day4Content.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "public", "anki");
const workDir = path.join(projectRoot, ".tmp-anki");
const payloadPath = path.join(workDir, "anki-decks.json");
const packerPath = path.join(__dirname, "write-anki-package.py");

function normalizeVocabularyValue(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function isUsefulVocabularyEntry(word, translation) {
  const normalizedWord = normalizeVocabularyValue(word);
  const normalizedTranslations = String(translation ?? "")
    .split("/")
    .map(normalizeVocabularyValue)
    .filter(Boolean);

  return normalizedWord && !normalizedTranslations.includes(normalizedWord);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findExampleForWord(post, word) {
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(word)}([^\\p{L}\\p{N}]|$)`, "iu");
  const index = post.story.conversation.findIndex((message) => pattern.test(message.text));

  if (index >= 0) {
    return {
      text: post.story.conversation[index].text,
      translation: post.story.conversationTranslations[index] ?? ""
    };
  }

  return {
    text: post.story.conversation[0]?.text ?? "",
    translation: post.story.conversationTranslations[0] ?? ""
  };
}

function getDeckCards(post) {
  return Object.entries(post.story.wordTranslations ?? {})
    .filter(([word, translation]) => isUsefulVocabularyEntry(word, translation))
    .sort(([wordA], [wordB]) => wordA.localeCompare(wordB))
    .map(([word, translation]) => {
      const example = findExampleForWord(post, word);
      return {
        word,
        translation,
        example: example.text,
        exampleTranslation: example.translation,
        source: post.tripLabel
      };
    });
}

const ankiPosts = [
  {
    id: "day-1",
    day: 1,
    tripLabel: "Day 1 - First day traveling",
    story: { conversation, conversationTranslations, wordTranslations }
  },
  {
    id: "day-2",
    day: 2,
    tripLabel: "Day 2 - Exploring Lagoa da Conceição",
    story: { conversation: day2Conversation, conversationTranslations: day2ConversationTranslations, wordTranslations: day2WordTranslations }
  },
  {
    id: "day-3",
    day: 3,
    tripLabel: "Day 3 - Wrong Bus to the Right Beach",
    story: { conversation: day3Conversation, conversationTranslations: day3ConversationTranslations, wordTranslations: day3WordTranslations }
  },
  {
    id: "day-4",
    day: 4,
    tripLabel: "Day 4 - Buying Fruit at a Street Market",
    story: { conversation: day4Conversation, conversationTranslations: day4ConversationTranslations, wordTranslations: day4WordTranslations }
  }
];

const decks = ankiPosts.map((post) => ({
  id: post.id,
  day: post.day,
  filename: `${post.id}.apkg`,
  title: `Conversante - ${post.tripLabel}`,
  cards: getDeckCards(post)
}));

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(workDir, { recursive: true });
fs.writeFileSync(payloadPath, JSON.stringify({ outputDir, decks }, null, 2));

const result = spawnSync("python", [packerPath, payloadPath], {
  cwd: projectRoot,
  encoding: "utf8",
  stdio: "pipe"
});

if (result.status !== 0) {
  process.stderr.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

fs.rmSync(workDir, { recursive: true, force: true });
process.stdout.write(result.stdout);
