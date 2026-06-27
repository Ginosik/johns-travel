import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { feedTranslations } from "../src/data/feedTranslations.js";
import {
  conversationTranslations,
  day1Translations,
  wordTranslations
} from "../src/data/day1Content.js";
import {
  day2ConversationTranslations,
  day2Translations,
  day2WordTranslations
} from "../src/data/day2Content.js";
import {
  day3ConversationTranslations,
  day3Translations,
  day3WordTranslations
} from "../src/data/day3Content.js";

const portugueseContent = {
  feed: feedTranslations.pt,
  day1Interface: day1Translations.pt,
  day1Sentences: conversationTranslations,
  day1Vocabulary: Object.values(wordTranslations),
  day2Interface: day2Translations.pt,
  day2Sentences: day2ConversationTranslations,
  day2Vocabulary: Object.values(day2WordTranslations),
  day3Interface: day3Translations.pt,
  day3Sentences: day3ConversationTranslations,
  day3Vocabulary: Object.values(day3WordTranslations)
};

const commonUnaccentedWords = [
  "agua", "atualizacao", "cafe", "celebracao", "comeca", "conceicao",
  "estao", "feijao", "florianopolis", "historia", "indisponivel", "inicio",
  "mes", "nao", "navegacao", "onibus", "paises", "pao", "portugues",
  "proxima", "rapido", "sao", "tambem", "traducao", "vitoria", "voce"
];

const failures = [];
const mojibakePattern = /[\u00c3\u00c2\ufffd]|\u00ef\u00bf\u00bd/u;
const replacementQuestionPattern = /(^|[^\p{L}])\?\p{L}|\p{L}\?\p{L}|\p{L}\?\?\p{L}/u;
const unaccentedPattern = new RegExp("\\b(" + commonUnaccentedWords.join("|") + ")\\b", "iu");

function inspect(value, path) {
  if (typeof value === "string") {
    if (mojibakePattern.test(value)) failures.push(path + " contains mojibake: " + value);
    if (replacementQuestionPattern.test(value)) failures.push(path + " contains replacement question marks: " + value);
    const match = value.match(unaccentedPattern);
    if (match) failures.push(path + " contains the unaccented word \"" + match[0] + "\": " + value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => inspect(item, path + "[" + index + "]"));
    return;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => inspect(item, path + "." + key));
  }
}

inspect(portugueseContent, "portugueseContent");

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const indexHtml = await readFile(projectRoot + "/index.html", "utf8");
if (!/<meta\s+charset=["']utf-8["']>/iu.test(indexHtml)) {
  failures.push("index.html must declare UTF-8 with a meta charset tag");
}

if (failures.length > 0) {
  console.error("Portuguese content check failed:\n- " + failures.join("\n- "));
  process.exitCode = 1;
} else {
  console.log("Portuguese content check passed.");
}
