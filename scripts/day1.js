const translations = {
  en: {
    backLink: "Back to feed",
    title: "John's Travel",
    subtitle: "Day 1 - First day traveling",
    intro: "John's first day traveling starts with a conversation about Florianopolis, Brazil, Portuguese, food, winter, and Festa Junina.",
    complete: "Conversation complete",
    toggle: "Portuguese"
  },
  pt: {
    backLink: "Voltar para o feed",
    title: "John's Travel",
    subtitle: "Dia 1 - Primeiro dia viajando",
    intro: "O primeiro dia de viagem de John começa com uma conversa sobre Florianópolis, Brasil, português, comida, inverno e Festa Junina.",
    complete: "Conversa completa",
    toggle: "English"
  }
};

const conversation = [
  { speaker: "John", className: "john", avatar: "J", text: "Hello! How are you doing?" },
  { speaker: "Nicky", className: "nick", avatar: "N", text: "I'm doing alright. What about you?" },
  { speaker: "John", className: "john", avatar: "J", text: "I'm fine. I'll travel to Florianopolis this month." },
  { speaker: "Nicky", className: "nick", avatar: "N", text: "That sounds exciting. That's in Brazil, right?" },
  { speaker: "John", className: "john", avatar: "J", text: "Yes, in the south of Brazil. I heard that people there speak very fast." },
  { speaker: "Nicky", className: "nick", avatar: "N", text: "Oh, really? Do you think you'll learn Spanish?" },
  { speaker: "John", className: "john", avatar: "J", text: "They don't speak Spanish in Brazil. They speak Portuguese." },
  { speaker: "Nicky", className: "nick", avatar: "N", text: "I see. I got it mixed up with other South American countries, then." },
  { speaker: "John", className: "john", avatar: "J", text: "Fair enough, but I won't focus too much on the language at first, just a few words." },
  { speaker: "Nicky", className: "nick", avatar: "N", text: "What nice things are you expecting to see there?" },
  { speaker: "John", className: "john", avatar: "J", text: "They have nice beaches and good food." },
  { speaker: "Nicky", className: "nick", avatar: "N", text: "Is there any local food you're looking forward to trying?" },
  { speaker: "John", className: "john", avatar: "J", text: "Yes, I saw on YouTube that I should try feijoada, which is like a bean stew, and farofa, which is cassava flour." },
  { speaker: "Nicky", className: "nick", avatar: "N", text: "Wow, I wish I could go too! Don't forget to send photos!" },
  { speaker: "John", className: "john", avatar: "J", text: "For sure. I'll keep in touch and tell you all about my adventures." },
  { speaker: "Nicky", className: "nick", avatar: "N", text: "I'm searching online right now. It's winter in Brazil, right?" },
  { speaker: "John", className: "john", avatar: "J", text: "Yes, and it's colder in the south." },
  { speaker: "Nicky", className: "nick", avatar: "N", text: "Hmm, do you think it will snow?" },
  { speaker: "John", className: "john", avatar: "J", text: "Probably not, but they have a national celebration happening called Festa Junina." },
  { speaker: "Nicky", className: "nick", avatar: "N", text: "I've never heard of it. I can't wait to know more!" }
];

const wordTranslations = {
  a: "um / uma",
  about: "sobre",
  adventures: "aventuras",
  all: "tudo",
  alright: "bem",
  american: "americano / americana",
  and: "e",
  any: "algum / alguma",
  are: "estão / são",
  as: "como",
  at: "em",
  be: "ser / estar",
  beaches: "praias",
  bean: "feijão",
  brazil: "Brasil",
  but: "mas",
  by: "por",
  called: "chamado",
  can: "poder",
  "can't": "não posso / não consigo",
  cassava: "mandioca",
  celebration: "celebração",
  cold: "frio",
  colder: "mais frio",
  conversation: "conversa",
  countries: "países",
  could: "poderia",
  do: "fazer",
  doing: "indo / fazendo",
  "don't": "não",
  exciting: "empolgante",
  expecting: "esperando",
  enough: "suficiente",
  fair: "justo",
  farofa: "farofa",
  fast: "rápido",
  festa: "festa",
  feijoada: "feijoada",
  few: "poucos",
  fine: "bem",
  first: "primeiro",
  florianopolis: "Florianópolis",
  flour: "farinha",
  focus: "focar",
  food: "comida",
  for: "para",
  forget: "esquecer",
  forward: "ansioso / ansiosa",
  go: "ir",
  good: "bom / boa",
  got: "peguei / entendi",
  happening: "acontecendo",
  have: "ter",
  heard: "ouvi",
  hello: "olá",
  hmm: "hmm",
  how: "como",
  i: "eu",
  "i'll": "eu vou",
  "i'm": "eu estou",
  "i've": "eu tenho",
  in: "em",
  internet: "internet",
  is: "é / está",
  it: "isso / ele",
  "it's": "é / está",
  junina: "junina",
  just: "apenas",
  know: "saber",
  keep: "manter",
  language: "idioma",
  learn: "aprender",
  like: "como",
  local: "local",
  looking: "procurando",
  mixed: "confundi",
  month: "mês",
  more: "mais",
  much: "muito",
  my: "meu / minha",
  national: "nacional",
  never: "nunca",
  nice: "legal / bom",
  not: "não",
  now: "agora",
  of: "de",
  oh: "ah",
  on: "em",
  online: "online",
  other: "outros",
  people: "pessoas",
  photos: "fotos",
  portuguese: "português",
  probably: "provavelmente",
  really: "mesmo",
  right: "certo",
  saw: "vi",
  searching: "pesquisando",
  see: "ver",
  send: "enviar",
  should: "deveria",
  snow: "nevar",
  sounds: "soa / parece",
  south: "sul",
  southern: "do sul",
  spanish: "espanhol",
  speak: "falar",
  stew: "ensopado",
  sure: "claro",
  that: "isso / aquele",
  "that's": "isso é",
  the: "o / a",
  then: "então",
  there: "lá",
  they: "eles",
  things: "coisas",
  this: "este / esta",
  think: "achar",
  touch: "contato",
  tell: "contar",
  to: "para",
  too: "também",
  travel: "viajar",
  traveling: "viajando",
  try: "experimentar",
  trying: "experimentando / tentando",
  up: "para cima",
  very: "muito",
  wait: "esperar",
  what: "o que",
  which: "que",
  will: "vai / irá",
  winter: "inverno",
  wish: "desejar",
  with: "com",
  "won't": "não vou",
  words: "palavras",
  wow: "uau",
  yes: "sim",
  you: "você",
  youtube: "YouTube",
  "you'll": "você vai",
  "you're": "você está",
  your: "seu / sua"
};

const record = document.querySelector("#conversationRecord");
const continueButton = document.querySelector("#continueConversation");
const languageToggle = document.querySelector("#languageToggle");
const startOverlay = document.querySelector("#startOverlay");
const startConversationButton = document.querySelector("#startConversation");
let currentLanguage = "en";
let nextMessageIndex = 0;
let typingIndicator = null;
let pendingAutoplay = null;
const audioCounts = {
  John: 0,
  Nicky: 0
};
let currentAudio = null;
let currentAudioButton = null;

function makeAvatar(message) {
  const avatar = document.createElement("div");
  avatar.className = `avatar small${message.className === "nick" ? " nick-avatar" : ""}`;
  const image = document.createElement("img");
  image.src = message.speaker === "Nicky" ? "assets/Nicky.png" : "assets/John.png";
  image.alt = message.speaker;
  avatar.append(image);
  return avatar;
}

function makeWordHoverable(paragraph, text) {
  const words = text.split(/(\s+)/);
  paragraph.textContent = "";

  words.forEach((part) => {
    if (/^\s+$/.test(part)) {
      paragraph.append(document.createTextNode(part));
      return;
    }

        const word = document.createElement("span");
        word.className = "word";
        word.textContent = part;
        const normalizedWord = part.toLowerCase().replace(/^[^a-z']+|[^a-z']+$/g, "");

        if (wordTranslations[normalizedWord]) {
          word.dataset.translation = wordTranslations[normalizedWord];
          word.tabIndex = 0;
        }

        paragraph.append(word);
      });
}

function getAudioPath(message) {
  audioCounts[message.speaker] += 1;
  const audioNumber = String(audioCounts[message.speaker]).padStart(2, "0");
  return `assets/audios/${message.speaker}-${audioNumber}.mp3`;
}

function playMessageAudio(audioPath, button, audio = new Audio(audioPath)) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudioButton?.classList.remove("is-playing");

  currentAudio = audio;
  currentAudioButton = button;
  button.classList.add("is-playing");

  currentAudio.addEventListener("ended", () => {
    button.classList.remove("is-playing");
  }, { once: true });

  currentAudio.addEventListener("error", () => {
    button.classList.remove("is-playing");
  }, { once: true });

  return currentAudio.play().then(() => true).catch(() => {
    button.classList.remove("is-playing");
    return false;
  });
}

function playPendingAutoplay() {
  if (!pendingAutoplay) return;

  const { audioPath, button, audio } = pendingAutoplay;
  pendingAutoplay = null;
  playMessageAudio(audioPath, button, audio);
}

function waitForAudioUnlock(audioPath, button, audio = null) {
  pendingAutoplay = { audioPath, button, audio: audio ?? new Audio(audioPath) };
  document.addEventListener("pointerdown", playPendingAutoplay, { once: true, capture: true });
  document.addEventListener("keydown", playPendingAutoplay, { once: true, capture: true });
}

function playMessageAudioWhenPossible(audioPath, button, audio = null) {
  const playbackAudio = audio ?? new Audio(audioPath);

  playMessageAudio(audioPath, button, playbackAudio).then((started) => {
    if (!started) {
      waitForAudioUnlock(audioPath, button, playbackAudio);
    }
  });
}

function makePlayButton(message, audioPath) {
  const button = document.createElement("button");
  button.className = "message-play-button";
  button.type = "button";
  button.setAttribute("aria-label", `Replay ${message.speaker}'s message`);

  button.addEventListener("click", () => {
    playMessageAudio(audioPath, button);
  });

  return button;
}

function renderMessage(message, preparedAudio = null) {
  const row = document.createElement("div");
  row.className = `conversation-message ${message.className}`;
  const audioPath = getAudioPath(message);

  const speech = document.createElement("div");
  speech.className = "speech";

  const speaker = document.createElement("strong");
  speaker.textContent = message.speaker;

  const text = document.createElement("p");
  makeWordHoverable(text, message.text);
  const playButton = makePlayButton(message, audioPath);

  speech.append(speaker, text);
  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.append(speech, playButton);

  row.append(makeAvatar(message), messageContent);
  record.append(row);
  playMessageAudioWhenPossible(audioPath, playButton, preparedAudio);
}

function renderTyping(message) {
  if (!message) return;

  typingIndicator = document.createElement("div");
  typingIndicator.className = `conversation-message ${message.className} typing-message`;
  typingIndicator.setAttribute("aria-label", `${message.speaker} is typing`);

  const speech = document.createElement("div");
  speech.className = "speech typing-speech";
  speech.innerHTML = `
    <strong>${message.speaker}</strong>
    <span class="typing-dots" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </span>
  `;

  typingIndicator.append(makeAvatar(message), speech);
  record.append(typingIndicator);
}

function scrollToLatest() {
  record.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function advanceConversation(preparedAudio = null) {
  if (continueButton.disabled) return;
  if (nextMessageIndex >= conversation.length) return;

  const message = conversation[nextMessageIndex];
  typingIndicator?.remove();
  typingIndicator = null;
  renderMessage(message, preparedAudio);
  nextMessageIndex += 1;

  if (nextMessageIndex < conversation.length) {
    renderTyping(conversation[nextMessageIndex]);
  } else {
    continueButton.textContent = translations[currentLanguage].complete;
    continueButton.disabled = true;
  }

  scrollToLatest();
}

continueButton.addEventListener("click", () => {
  advanceConversation();
});

languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "pt" : "en";
  const strings = translations[currentLanguage];

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = strings[element.dataset.i18n];
  });

  languageToggle.textContent = strings.toggle;
  languageToggle.setAttribute("aria-pressed", currentLanguage === "pt");
  document.documentElement.lang = currentLanguage === "pt" ? "pt-BR" : "en";

  if (continueButton.disabled) {
    continueButton.textContent = strings.complete;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  if (event.target.closest("a, button, input, textarea, select")) return;

  event.preventDefault();
  advanceConversation();
});

function startConversation() {
  continueButton.disabled = true;
  startOverlay.hidden = true;
  continueButton.disabled = false;
  advanceConversation();
}

continueButton.disabled = true;
startConversationButton.addEventListener("click", startConversation);
