import { readFile } from "node:fs/promises";

const files = [
  "docs/conversation-word-counts.json",
  "docs/conversation-word-senses.json",
  "docs/conversation-word-review.json"
];

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function validateCountShape(countsOutput, sensesOutput, label) {
  const problems = [];
  const totalWords = Object.values(countsOutput.counts).reduce((total, count) => total + count, 0);
  const totalOccurrences = Object.values(sensesOutput.counts).reduce((total, entry) => total + entry.totalCount, 0);

  if (totalWords !== countsOutput.totals.totalWords) {
    problems.push(`${label}: count file totalWords is ${countsOutput.totals.totalWords}, but entries sum to ${totalWords}.`);
  }
  if (totalOccurrences !== sensesOutput.totals.occurrences) {
    problems.push(`${label}: senses file occurrences is ${sensesOutput.totals.occurrences}, but entries sum to ${totalOccurrences}.`);
  }

  for (const [word, entry] of Object.entries(sensesOutput.counts)) {
    const senseTotal = Object.values(entry.senses).reduce((total, sense) => total + sense.count, 0);
    if (senseTotal !== entry.totalCount) {
      problems.push(`${label}: ${word} has totalCount ${entry.totalCount}, but senses sum to ${senseTotal}.`);
    }
    if (countsOutput.counts[word] !== entry.totalCount) {
      problems.push(`${label}: ${word} count mismatch between counts and senses files.`);
    }
  }

  return problems;
}

const [countsOutput, sensesOutput, review] = await Promise.all(files.map(readJson));
const problems = validateCountShape(countsOutput, sensesOutput, "aggregate");

for (const [postId, postMeta] of Object.entries(countsOutput.byPost ?? {})) {
  const postCounts = await readJson(postMeta.path);
  const postSenses = await readJson(`docs/conversation-word-data/${postId}/conversation-word-senses.json`);
  problems.push(...validateCountShape(postCounts, postSenses, postId));
}

const structuralIssues = review.structuralIssues ?? {};
const staleOverrides = structuralIssues.staleOverrides?.length ?? 0;
const countMismatches = structuralIssues.countMismatches?.length ?? 0;
const missingLanguageMetadata = review.reviewNeeded?.missingLanguageMetadata?.length ?? 0;

if (staleOverrides || countMismatches) {
  problems.push(`review report has ${staleOverrides} stale overrides and ${countMismatches} count mismatches.`);
}
if (missingLanguageMetadata) {
  problems.push(`review report has ${missingLanguageMetadata} non-English-looking words without language metadata.`);
}

const summary = review.summary ?? {};
console.log("Vocabulary validation summary:");
console.log(`- stale overrides: ${summary.staleOverrides ?? 0}`);
console.log(`- count mismatches: ${summary.countMismatches ?? 0}`);
console.log(`- missing meanings needing review: ${summary.missingMeanings ?? 0}`);
console.log(`- missing language metadata needing review: ${summary.missingLanguageMetadata ?? 0}`);
console.log(`- unknown parts of speech needing review: ${summary.unknownPartsOfSpeech ?? 0}`);

if (problems.length > 0) {
  console.error("\nStructural vocabulary issues:");
  problems.forEach((problem) => console.error(`- ${problem}`));
  process.exitCode = 1;
}
