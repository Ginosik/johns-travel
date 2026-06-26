import { mkdir, readFile, writeFile } from "node:fs/promises";

const TOKEN_PATTERN = /[\p{L}\p{N}]+(?:['\u2019][\p{L}\p{N}]+)?/gu;
const RIGHT_SINGLE_QUOTE = String.fromCharCode(0x2019);

const paths = {
  defaults: "docs/word-sense-defaults.json",
  manifest: "docs/conversation-word-posts.json",
  outputDirectory: "docs/conversation-word-data",
  review: "docs/conversation-word-review.json"
};

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (fallback !== null && error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function loadPosts() {
  const manifest = await readJson(paths.manifest);
  return Promise.all(
    manifest.map(async (entry) => {
      const contentModule = await import(new URL(entry.module, import.meta.url));
      const messages = contentModule[entry.conversationExport];
      const wordTranslations = contentModule[entry.wordTranslationsExport];

      if (!Array.isArray(messages)) {
        throw new Error(`Post ${entry.id} has no conversation export named ${entry.conversationExport}.`);
      }
      if (!wordTranslations || typeof wordTranslations !== "object") {
        throw new Error(`Post ${entry.id} has no word translation export named ${entry.wordTranslationsExport}.`);
      }

      return {
        id: entry.id,
        messages,
        wordTranslations
      };
    })
  );
}

async function loadSenseDefaults() {
  const defaults = await readJson(paths.defaults);
  return {
    senses: defaults.senses ?? {},
    pronunciations: defaults.pronunciations ?? {}
  };
}

async function loadPostOverrides(post) {
  const overridePath = `${paths.outputDirectory}/${post.id}/sense-overrides.json`;
  const overrides = await readJson(overridePath, []);
  const problems = [];
  const byOccurrence = new Map();

  overrides.forEach((override, index) => {
    const token = tokenize(post.messages[override.messageIndex] ?? { text: "" })[override.tokenIndex];
    if (!token) {
      problems.push({
        type: "stale-token-override",
        postId: post.id,
        overridePath,
        index,
        messageIndex: override.messageIndex,
        tokenIndex: override.tokenIndex,
        note: "No token exists at this message/token position."
      });
      return;
    }

    if (override.word && override.word !== token.word) {
      problems.push({
        type: "token-word-mismatch",
        postId: post.id,
        overridePath,
        index,
        messageIndex: override.messageIndex,
        tokenIndex: override.tokenIndex,
        expectedWord: override.word,
        actualWord: token.word,
        sentence: post.messages[override.messageIndex].text
      });
    }

    byOccurrence.set(createOccurrenceKey(post.id, override.messageIndex, override.tokenIndex), sanitizeOverride(override));
  });

  return { byOccurrence, problems };
}

function sanitizeOverride(override) {
  const { messageIndex, tokenIndex, word, ...sense } = override;
  return sense;
}

function tokenize(message) {
  return [...message.text.matchAll(TOKEN_PATTERN)].map((match, tokenIndex) => ({
    tokenIndex,
    surface: match[0],
    word: match[0].toLocaleLowerCase("en-US").replaceAll(RIGHT_SINGLE_QUOTE, "'")
  }));
}

function createOccurrenceKey(postId, messageIndex, tokenIndex) {
  return `${postId}:${messageIndex}:${tokenIndex}`;
}

function createDefaultSense(word, wordTranslations, defaults) {
  const details = defaults.senses[word] ?? {};
  const pronunciation = defaults.pronunciations[word] ?? {};
  const lemma = details.lemma ?? word;
  return {
    senseId: details.senseId ?? `${lemma.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, "_")}_default`,
    lemma,
    partOfSpeech: details.partOfSpeech ?? "unknown",
    meaningPt: details.meaningPt ?? wordTranslations[word] ?? null,
    grammarPt: details.grammarPt ?? null,
    notePt: details.notePt ?? null,
    ...pronunciation
  };
}

function addOccurrence(target, occurrence) {
  const { word, senseId } = occurrence;
  target[word] ??= {
    totalCount: 0,
    senses: {}
  };
  target[word].totalCount += 1;
  target[word].senses[senseId] ??= {
    count: 0,
    lemma: occurrence.lemma,
    partOfSpeech: occurrence.partOfSpeech,
    meaningPt: occurrence.meaningPt,
    grammarPt: occurrence.grammarPt,
    notePt: occurrence.notePt,
    languageTag: occurrence.languageTag,
    languageName: occurrence.languageName,
    ipa: occurrence.ipa,
    audioPrompt: occurrence.audioPrompt,
    audioPromptNote: occurrence.audioPromptNote,
    examples: []
  };
  const sense = target[word].senses[senseId];
  sense.count += 1;
  if (sense.examples.length < 3 && !sense.examples.includes(occurrence.sentence)) {
    sense.examples.push(occurrence.sentence);
  }
}

function sortCounts(value) {
  return Object.fromEntries(
    Object.entries(value)
      .sort(([wordA, dataA], [wordB, dataB]) => dataB.totalCount - dataA.totalCount || wordA.localeCompare(wordB))
      .map(([word, data]) => [
        word,
        {
          totalCount: data.totalCount,
          senses: Object.fromEntries(
            Object.entries(data.senses)
              .sort(([senseA, dataA], [senseB, dataB]) => dataB.count - dataA.count || senseA.localeCompare(senseB))
              .map(([senseId, sense]) => [senseId, Object.fromEntries(Object.entries(sense).filter(([, item]) => item !== null))])
          )
        }
      ])
  );
}

function createTotals(sortedCounts) {
  return {
    occurrences: Object.values(sortedCounts).reduce((total, item) => total + item.totalCount, 0),
    uniqueSurfaceWords: Object.keys(sortedCounts).length,
    uniqueSenses: Object.values(sortedCounts).reduce((total, item) => total + Object.keys(item.senses).length, 0)
  };
}

function createPlainCounts(sortedCounts) {
  return Object.fromEntries(Object.entries(sortedCounts).map(([word, data]) => [word, data.totalCount]));
}

const normalization = "Case-insensitive; curly apostrophes normalized to straight apostrophes; punctuation excluded; accented words count as one word.";
const annotation = "Default senses come from docs/word-sense-defaults.json. Context-sensitive words use post-level sense-overrides.json files keyed by message index and token index.";
const generatedHierarchy = "Per-post study files live in docs/conversation-word-data/<post-id>/conversation-word-counts.json and conversation-word-senses.json.";

function createSource(posts) {
  return `Dialog text only from ${posts.map((post) => post.id).join(", ")} content modules listed in docs/conversation-word-posts.json`;
}

function createCountsOutput({ postId = null, sortedCounts, byPostCounts = null, source }) {
  const totals = createTotals(sortedCounts);
  const output = {
    source,
    normalization,
    hierarchy: generatedHierarchy,
    totals: {
      totalWords: totals.occurrences,
      uniqueWords: totals.uniqueSurfaceWords
    },
    counts: createPlainCounts(sortedCounts)
  };

  if (postId) output.postId = postId;
  if (byPostCounts) {
    output.byPost = Object.fromEntries(
      Object.entries(byPostCounts).map(([itemPostId, itemCounts]) => {
        const itemTotals = createTotals(itemCounts);
        return [itemPostId, {
          totalWords: itemTotals.occurrences,
          uniqueWords: itemTotals.uniqueSurfaceWords,
          path: `docs/conversation-word-data/${itemPostId}/conversation-word-counts.json`
        }];
      })
    );
  }

  return output;
}

function createSensesOutput({ postId = null, sortedCounts, byPostCounts = null, source }) {
  const output = {
    source,
    normalization,
    annotation,
    hierarchy: generatedHierarchy,
    totals: createTotals(sortedCounts),
    counts: sortedCounts
  };

  if (postId) output.postId = postId;
  if (byPostCounts) {
    output.byPost = Object.fromEntries(
      Object.entries(byPostCounts).map(([itemPostId, itemCounts]) => [itemPostId, itemCounts])
    );
  }

  return output;
}

function createReviewReport({ occurrences, overrideProblems, sortedByPost }) {
  const unknownPartsOfSpeech = new Map();
  const missingMeanings = new Map();
  const countMismatches = [];

  for (const occurrence of occurrences) {
    const reviewKey = `${occurrence.postId}:${occurrence.word}:${occurrence.senseId}`;
    const item = {
      postId: occurrence.postId,
      messageIndex: occurrence.messageIndex,
      tokenIndex: occurrence.tokenIndex,
      word: occurrence.word,
      surface: occurrence.surface,
      sentence: occurrence.sentence
    };

    if (occurrence.partOfSpeech === "unknown" && !unknownPartsOfSpeech.has(reviewKey)) {
      unknownPartsOfSpeech.set(reviewKey, item);
    }
    if (!occurrence.meaningPt && !missingMeanings.has(reviewKey)) {
      missingMeanings.set(reviewKey, item);
    }
  }

  const unknownPartOfSpeechItems = [...unknownPartsOfSpeech.values()];
  const missingMeaningItems = [...missingMeanings.values()];

  for (const [postId, postCounts] of Object.entries(sortedByPost)) {
    for (const [word, entry] of Object.entries(postCounts)) {
      const senseTotal = Object.values(entry.senses).reduce((total, sense) => total + sense.count, 0);
      if (senseTotal !== entry.totalCount) {
        countMismatches.push({ postId, word, totalCount: entry.totalCount, senseTotal });
      }
    }
  }

  return {
    summary: {
      staleOverrides: overrideProblems.length,
      countMismatches: countMismatches.length,
      missingMeanings: missingMeaningItems.length,
      unknownPartsOfSpeech: unknownPartOfSpeechItems.length
    },
    workflow: [
      "Run npm run words:senses after editing conversation content.",
      "Open this review report and fix structural issues first.",
      "Add reusable entries to docs/word-sense-defaults.json.",
      "Add context-specific entries to docs/conversation-word-data/<post-id>/sense-overrides.json.",
      "Run npm run words:senses again, then npm run words:validate."
    ],
    structuralIssues: {
      staleOverrides: overrideProblems,
      countMismatches
    },
    reviewNeeded: {
      missingMeanings: missingMeaningItems,
      unknownPartsOfSpeech: unknownPartOfSpeechItems
    }
  };
}

async function buildVocabularyStudyData() {
  const posts = await loadPosts();
  const defaults = await loadSenseDefaults();
  const source = createSource(posts);
  const counts = {};
  const byPost = {};
  const occurrences = [];
  const overrideProblems = [];

  for (const post of posts) {
    byPost[post.id] = {};
    const { byOccurrence, problems } = await loadPostOverrides(post);
    overrideProblems.push(...problems);

    post.messages.forEach((message, messageIndex) => {
      tokenize(message).forEach((token) => {
        const override = byOccurrence.get(createOccurrenceKey(post.id, messageIndex, token.tokenIndex));
        const sense = override ?? createDefaultSense(token.word, post.wordTranslations, defaults);
        const occurrence = {
          ...sense,
          postId: post.id,
          messageIndex,
          speaker: message.speaker,
          sentence: message.text,
          surface: token.surface,
          tokenIndex: token.tokenIndex,
          word: token.word
        };
        occurrences.push(occurrence);
        addOccurrence(counts, occurrence);
        addOccurrence(byPost[post.id], occurrence);
      });
    });
  }

  const sortedCounts = sortCounts(counts);
  const sortedByPost = Object.fromEntries(
    Object.entries(byPost).map(([postId, postCounts]) => [postId, sortCounts(postCounts)])
  );
  const reviewReport = createReviewReport({ occurrences, overrideProblems, sortedByPost });

  await mkdir(paths.outputDirectory, { recursive: true });
  await writeFile(
    "docs/conversation-word-counts.json",
    `${JSON.stringify(createCountsOutput({ sortedCounts, byPostCounts: sortedByPost, source }), null, 2)}\n`
  );
  await writeFile(
    "docs/conversation-word-senses.json",
    `${JSON.stringify(createSensesOutput({ sortedCounts, byPostCounts: sortedByPost, source }), null, 2)}\n`
  );
  await writeFile(paths.review, `${JSON.stringify(reviewReport, null, 2)}\n`);

  for (const [postId, postCounts] of Object.entries(sortedByPost)) {
    const directory = `${paths.outputDirectory}/${postId}`;
    await mkdir(directory, { recursive: true });
    await writeFile(
      `${directory}/conversation-word-counts.json`,
      `${JSON.stringify(createCountsOutput({ postId, sortedCounts: postCounts, source }), null, 2)}\n`
    );
    await writeFile(
      `${directory}/conversation-word-senses.json`,
      `${JSON.stringify(createSensesOutput({ postId, sortedCounts: postCounts, source }), null, 2)}\n`
    );
  }

  return reviewReport;
}

const reviewReport = await buildVocabularyStudyData();
const { summary } = reviewReport;
console.log(
  `Vocabulary data generated. Review: ${summary.staleOverrides} stale overrides, ${summary.countMismatches} count mismatches, ${summary.missingMeanings} missing meanings, ${summary.unknownPartsOfSpeech} unknown parts of speech.`
);
