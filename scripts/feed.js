const composerButton = document.querySelector("#openComposer");
const languageToggle = document.querySelector("#languageToggle");
let currentLanguage = "en";
let composerDrafting = false;

const translations = {
  en: {
    search: "Search Social",
    profileName: "John's Travel",
    composer: "What's on your mind, John?",
    composerDraft: "Drafting a new travel update...",
    photo: "Photo",
    postAria: "Open John's first day traveling post",
    postSubtitle: "Day 1 - First day traveling",
    postCopy: "John's first day traveling.",
    openPost: "Open post",
    toggle: "Portuguese"
  },
  pt: {
    search: "Pesquisar Social",
    profileName: "John's Travel",
    composer: "No que voce esta pensando, John?",
    composerDraft: "Escrevendo uma nova atualizacao de viagem...",
    photo: "Foto",
    postAria: "Abrir o post do primeiro dia de viagem de John",
    postSubtitle: "Dia 1 - Primeiro dia viajando",
    postCopy: "O primeiro dia de viagem de John.",
    openPost: "Abrir post",
    toggle: "English"
  }
};

function applyLanguage() {
  const strings = translations[currentLanguage];

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = key === "composer" && composerDrafting ? strings.composerDraft : strings[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = strings[element.dataset.i18nPlaceholder];
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", strings[element.dataset.i18nAriaLabel]);
  });

  languageToggle.textContent = strings.toggle;
  languageToggle.setAttribute("aria-pressed", currentLanguage === "pt");
  document.documentElement.lang = currentLanguage === "pt" ? "pt-BR" : "en";
}

composerButton.addEventListener("click", () => {
  composerDrafting = true;
  composerButton.textContent = translations[currentLanguage].composerDraft;
  composerButton.style.color = "#1d2129";
});

languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "pt" : "en";
  applyLanguage();
});
