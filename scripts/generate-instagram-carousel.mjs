import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { conversation, wordTranslations } from "../src/data/day1Content.js";
import { day2Conversation, day2WordTranslations } from "../src/data/day2Content.js";
import { day3Conversation, day3WordTranslations } from "../src/data/day3Content.js";
import { day4Conversation, day4WordTranslations } from "../src/data/day4Content.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const postArgIndex = args.indexOf("--post");
const requestedPost = postArgIndex >= 0 ? args[postArgIndex + 1] : "day-1";

const accountProfiles = {
  conversante: {
    handle: "@conversante42",
    role: "Hub principal",
    cta: "Pratique a história completa no Conversante."
  },
  john: {
    handle: "Série de viagem do John",
    role: "Conta de história de viagem",
    cta: "Acompanhe a viagem do John, uma conversa curta por vez."
  },
  mariana: {
    handle: "Série de prática da Mariana",
    role: "Conta de prática guiada",
    cta: "Use os posts da Mariana para praticar fala com foco."
  }
};

function cleanText(value) {
  return String(value ?? "")
    .replaceAll("\u00c3\u00a1", "a")
    .replaceAll("\u00c3\u00a2", "a")
    .replaceAll("\u00c3\u00a3", "a")
    .replaceAll("\u00c3\u00a7", "c")
    .replaceAll("\u00c3\u00a9", "e")
    .replaceAll("\u00c3\u00aa", "e")
    .replaceAll("\u00c3\u00ad", "i")
    .replaceAll("\u00c3\u00b3", "o")
    .replaceAll("\u00c3\u00b4", "o")
    .replaceAll("\u00c3\u00b5", "o")
    .replaceAll("\u00c3\u00ba", "u")
    .replaceAll("\u00c3\u0081", "A")
    .replaceAll("\u00c3\u0089", "E")
}

function pickVocabulary(wordList, translations) {
  return wordList.map((word) => ({ word, translation: cleanText(translations[word.toLowerCase()] ?? "") }));
}

const socialPosts = {
  "day-1": {
    id: "day-1",
    day: 1,
    title: "John's Travel - Day 1",
    subtitle: "First day traveling",
    subtitlePt: "Dia 1 - Primeiro dia de viagem",
    destinationPath: "/day/1/static",
    sourcePostPath: "/day/1",
    audience: "Brasileiros aprendendo inglês que gostam de praticar com histórias curtas.",
    promise: "Pratique inglês de viagem com uma conversa simples sobre o Brasil.",
    hook: "A short English conversation before John travels to Brazil.",
    hookPt: "Uma conversa curta em inglês antes da viagem de John ao Brasil.",
    setup: "John is getting ready to travel to Brazil.",
    setupPt: "John está se preparando para viajar ao Brasil.",
    context: "John tells Nicky he will travel to Florianópolis. Nicky reacts, asks questions, and the conversation keeps moving.",
    contextPt: "John conta para Nicky que vai viajar para Florianópolis. Nicky reage, faz perguntas e a conversa continua de um jeito natural.",
    usefulLine: "That sounds exciting. That's in Brazil, right?",
    usefulLineNote: "A natural way to react and check information at the same time.",
    usefulLineNotePt: "Uma forma natural de reagir com entusiasmo e confirmar uma informação ao mesmo tempo.",
    languagePoint: "They don't speak Spanish in Brazil. They speak Portuguese.",
    languagePointNote: "Direct, clear, and still friendly.",
    languagePointNotePt: "Direto, claro e ainda amigável.",
    conversation,
    vocabulary: pickVocabulary(["travel", "exciting", "Brazil", "Portuguese", "food", "winter", "celebration"], wordTranslations)
  },
  "day-2": {
    id: "day-2",
    day: 2,
    title: "John's Travel - Day 2",
    subtitle: "Exploring Lagoa da Conceição",
    subtitlePt: "Dia 2 - Explorando a Lagoa da Conceição",
    destinationPath: "/day/2/static",
    sourcePostPath: "/day/2",
    audience: "Brasileiros aprendendo inglês que querem vocabulário útil de viagem e cidade.",
    promise: "Pratique inglês para explorar lugares, pedir comida e aprender palavras locais.",
    hook: "John explores Lagoa da Conceição and tries Portuguese in the real world.",
    hookPt: "John explora a Lagoa da Conceição e tenta usar português no mundo real.",
    setup: "John spends the afternoon near the lagoon, cafés, boats, and busy streets.",
    setupPt: "John passa a tarde perto da lagoa, de cafés, barcos e ruas movimentadas.",
    context: "The conversation moves from sightseeing to ordering coffee, then to the local words John learns along the way.",
    contextPt: "A conversa vai de passeio pela cidade a pedido de café, com palavras locais que aparecem no caminho.",
    usefulLine: "It is both. There is a lagoon connected to the sea and a neighborhood around it.",
    usefulLineNote: "A clean way to explain that two answers are true at the same time.",
    usefulLineNotePt: "Uma forma simples de explicar que duas respostas podem estar certas ao mesmo tempo.",
    languagePoint: "The cashier answered so fast that I only smiled, paid, and repeated obrigado.",
    languagePointNote: "A realistic travel moment: partial understanding still counts as practice.",
    languagePointNotePt: "Um momento realista de viagem: entender só uma parte também conta como prática.",
    conversation: day2Conversation,
    vocabulary: pickVocabulary(["lagoon", "bridge", "busy", "coffee", "water", "people", "word"], day2WordTranslations)
  },
  "day-3": {
    id: "day-3",
    day: 3,
    title: "John's Travel - Day 3",
    subtitle: "Wrong bus to the right beach",
    subtitlePt: "Dia 3 - O ônibus errado para a praia certa",
    destinationPath: "/day/3/static",
    sourcePostPath: "/day/3",
    audience: "Brasileiros aprendendo inglês que gostam de histórias de viagem com erros, direções e improviso.",
    promise: "Pratique inglês para falar de erros, transporte, direções e calma em situações inesperadas.",
    hook: "John takes the wrong bus and turns the mistake into a beach story.",
    hookPt: "John pega o ônibus errado e transforma o erro em uma história de praia.",
    setup: "John tries to go to Joaquina, gets on the wrong bus, and ends up in Campeche.",
    setupPt: "John tenta ir para a Joaquina, pega o ônibus errado e acaba em Campeche.",
    context: "The story uses confusion, directions, and a lucky change of plans to teach practical travel English.",
    contextPt: "A história usa confusão, direções e uma mudança de planos para ensinar inglês prático de viagem.",
    usefulLine: "That sounds like a very lucky mistake.",
    usefulLineNote: "A friendly reaction that turns a problem into a story.",
    usefulLineNotePt: "Uma reação amigável que transforma um problema em história.",
    languagePoint: "I was not completely lost, but I was definitely temporarily confused.",
    languagePointNote: "A memorable way to soften a mistake and keep the tone playful.",
    languagePointNotePt: "Um jeito memorável de suavizar um erro e manter o tom leve.",
    conversation: day3Conversation,
    vocabulary: pickVocabulary(["bus", "wrong", "beach", "lost", "market", "water", "calm"], day3WordTranslations)
  },
  "day-4": {
    id: "day-4",
    day: 4,
    title: "John's Travel - Day 4",
    subtitle: "Buying fruit at a street market",
    subtitlePt: "Dia 4 - Comprando frutas na feira",
    destinationPath: "/day/4/static",
    sourcePostPath: "/day/4",
    audience: "Brasileiros aprendendo inglês que querem vocabulário de feira, comida, preço e quantidade em contexto.",
    promise: "Pratique inglês para perguntar nomes, preços, quantidades e provar comidas em uma feira.",
    hook: "John visits a street market and learns that fruit can be surprisingly confusing.",
    hookPt: "John visita uma feira e descobre que comprar frutas pode ser mais confuso do que parece.",
    setup: "John tries unfamiliar fruit, asks questions, and learns useful market vocabulary.",
    setupPt: "John prova frutas desconhecidas, faz perguntas e aprende vocabulário útil de feira.",
    context: "The conversation focuses on names, prices, samples, and buying a normal amount of fruit.",
    contextPt: "A conversa foca em nomes, preços, amostras e em como comprar uma quantidade normal de fruta.",
    usefulLine: "What is this called?",
    usefulLineNote: "A simple question you can use any time you do not know an object's name.",
    usefulLineNotePt: "Uma pergunta simples para usar sempre que você não souber o nome de alguma coisa.",
    languagePoint: "I did not know if the price was for one fruit, one kilo, or a whole bag.",
    languagePointNote: "A practical phrase for explaining uncertainty between options.",
    languagePointNotePt: "Uma frase prática para explicar dúvida entre opções.",
    conversation: day4Conversation,
    vocabulary: pickVocabulary(["fruit", "market", "sweet", "sour", "ripe", "expensive", "price"], day4WordTranslations)
  }
};

function assertSupportedPost(postId) {
  if (postId === "all") return;
  if (!socialPosts[postId]) {
    const supportedPosts = Object.keys(socialPosts).join(", ");
    throw new Error(`Unsupported post "${postId}". Supported posts: ${supportedPosts}, all`);
  }
}

function sentenceText(value) {
  const text = cleanText(value).trim();
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function buildConversationExcerpt(post, limit = 3) {
  return post.conversation
    .slice(0, limit)
    .map((message) => `${message.speaker}: "${cleanText(message.text)}"`);
}

function buildVocabularyPreview(post, limit = 5) {
  return post.vocabulary
    .filter((item) => item.translation)
    .slice(0, limit)
    .map((item) => `${item.word} = ${item.translation}`);
}

function buildSlides(post) {
  const conversationExcerpt = buildConversationExcerpt(post);

  return [
    {
      number: 1,
      type: "hook",
      headline: post.subtitlePt,
      body: `${post.setupPt} ${post.hookPt}`
    },
    {
      number: 2,
      type: "story-context",
      headline: "Trecho da conversa em inglês",
      body: conversationExcerpt
    },
    {
      number: 3,
      type: "dialogue",
      headline: "Frase para praticar",
      body: post.usefulLine,
      note: post.usefulLineNotePt
    },
    {
      number: 4,
      type: "language-point",
      headline: "Pequena frase, valor real de viagem",
      body: post.languagePoint,
      note: post.languagePointNotePt
    },
    {
      number: 5,
      type: "vocabulary",
      headline: "Vocabulário do dia",
      body: buildVocabularyPreview(post)
    },
    {
      number: 6,
      type: "cta",
      headline: "Leia, ouça e revise",
      body: `Abra a lição completa do ${post.subtitlePt} no Conversante e pratique a conversa linha por linha.`,
      cta: "conversante.net"
    }
  ];
}

function buildCaption(post) {
  const conversationExcerpt = buildConversationExcerpt(post).join("\n");
  const vocabularyPreview = buildVocabularyPreview(post).join(", ");

  return [
    `${post.subtitlePt}: ${sentenceText(post.hookPt)}`,
    "",
    `Cena do dia: ${sentenceText(post.setupPt)}`,
    "",
    "Trecho da conversa em inglês:",
    conversationExcerpt,
    "",
    `Frase para praticar: "${cleanText(post.usefulLine)}"`,
    vocabularyPreview ? `Vocabulário do dia: ${vocabularyPreview}.` : "",
    "",
    "Abra a lição completa no Conversante para ler, ouvir e revisar linha por linha.",
    "",
    "#aprendaingles #ingles #inglesonline #englishpractice #vocabulario #conversante #inglesparabrasileiros"
  ].filter((line) => line !== "").join("\n");
}

function buildAltText(post, slides) {
  return slides
    .map((slide) => {
      const body = Array.isArray(slide.body) ? slide.body.join("; ") : slide.body;
      return `Slide ${slide.number}: ${slide.headline}. ${body}`;
    })
    .join("\n");
}

function writeTextFile(filePath, value) {
  fs.writeFileSync(filePath, `${value.trim()}\n`, "utf8");
}

function writePost(post) {
  const slides = buildSlides(post);
  const outputDir = path.join(projectRoot, "public", "social", post.id);
  const manifest = {
    id: post.id,
    title: post.title,
    subtitle: post.subtitlePt,
    destinationPath: post.destinationPath,
    sourcePostPath: post.sourcePostPath,
    visualAssetPath: `/social/${post.id}/art/cover.png`,
    visualAssetAlt: `Ilustração editorial para ${post.subtitlePt}.`,
    audience: post.audience,
    promise: post.promise,
    hook: post.hookPt,
    accounts: accountProfiles,
    contentNotes: [post.setupPt, post.contextPt, post.usefulLineNotePt, post.languagePointNotePt],
    featuredLines: post.conversation.slice(0, 8).map((message) => ({
      speaker: message.speaker,
      text: cleanText(message.text)
    })),
    slides,
    caption: buildCaption(post),
    altText: buildAltText(post, slides),
    status: "copy-ready"
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "carousel.json"), JSON.stringify(manifest, null, 2));
  writeTextFile(path.join(outputDir, "caption.txt"), manifest.caption);
  writeTextFile(path.join(outputDir, "alt-text.txt"), manifest.altText);
  writeTextFile(
    path.join(outputDir, "README.md"),
    `# ${post.title} Instagram Carousel\n\nGenerated files for the Conversante social preview workflow.\n\n- carousel.json: structured source for slides and visual rendering.\n- caption.txt: Instagram caption draft.\n- alt-text.txt: accessibility text for the carousel.\n- preview.html and slides/: rendered by npm run social:render.\n- ${post.id}-instagram-package.zip: generated by npm run social:package.\n`
  );

  process.stdout.write(`Generated Instagram carousel copy for ${post.id} in ${path.relative(projectRoot, outputDir)}\n`);
}

assertSupportedPost(requestedPost);
const postsToWrite = requestedPost === "all" ? Object.values(socialPosts) : [socialPosts[requestedPost]];
postsToWrite.forEach(writePost);