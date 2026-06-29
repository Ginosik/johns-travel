import { expect, test } from "@playwright/test";

const pt = {
  feedTitle: "Aprenda ingl\u00eas com hist\u00f3rias, personagens e pr\u00e1tica guiada.",
  vocabulary: "Vocabul\u00e1rio em contexto",
  day1Subtitle: "Dia 1 - Primeiro dia de viagem",
  day2Subtitle: "Dia 2 - Explorando a Lagoa da Concei\u00e7\u00e3o",
  day2Copy: "Uma lagoa movimentada, um bairro novo e o primeiro pedido de John em portugu\u00eas.",
  day3Subtitle: "Dia 3 - O \u00f4nibus errado para a praia certa",
  day4Subtitle: "Dia 4 - Comprando frutas na feira",
  day4FirstMessage: "I went to a street market this morning, and I learned that fruit can be more confusing than bus routes.",
  day3FirstMessage: "Today I tried to go to Joaquina, but I got on the wrong bus and ended up in Campeche instead.",
  florianopolisIntro: /Florian\u00f3polis, Brasil, portugu\u00eas/,
  olaSelector: '.word[data-translation="ol\u00e1"]',
  firstTranslation: "Ol\u00e1! Como voc\u00ea est\u00e1?",
  nextStory: /Pr\u00f3xima hist\u00f3ria/,
  previousStory: /Hist\u00f3ria anterior/
};

const publishedStories = [
  { href: "/day/1", subtitle: pt.day1Subtitle, firstMessage: "Hello! How are you doing?" },
  { href: "/day/2", subtitle: pt.day2Subtitle, firstMessage: "I finally explored Lagoa da Concei\u00e7\u00e3o today, and I stayed there for most of the afternoon because the place felt alive." },
  { href: "/day/3", subtitle: pt.day3Subtitle, firstMessage: pt.day3FirstMessage },
  { href: "/day/4", subtitle: pt.day4Subtitle, firstMessage: pt.day4FirstMessage }
];

test("renders the public story library in Portuguese by default", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: pt.feedTitle })).toBeVisible();
  await expect(page.getByText(pt.vocabulary, { exact: true })).toBeVisible();
  await expect(page.locator('.character-rail')).toBeVisible();
  await expect(page.locator('.character-rail-item[href="/day/1"]')).toHaveAttribute("data-tooltip", "John");
  await expect(page.locator('.character-rail-item[href="/mariana"]')).toHaveAttribute("data-tooltip", "Mariana");
  await expect(page.locator('.character-rail-item.is-coming-soon')).toHaveAttribute("data-tooltip", "Em breve");
  await expect(page.locator('.top-nav-link[href="/mariana"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");

  for (const story of publishedStories) {
    await expect(page.locator(`a.post-preview[href="${story.href}"]`)).toBeVisible();
    await expect(page.getByText(story.subtitle, { exact: true })).toBeVisible();
  }
});

for (const story of publishedStories) {
  test(`opens ${story.href} from the feed`, async ({ page }) => {
    await page.goto("/");
    await page.locator(`a.post-preview[href="${story.href}"]`).click();

    await expect(page).toHaveURL(new RegExp(`${story.href.replaceAll("/", "\\/")}$`));
    await expect(page.getByText(story.subtitle, { exact: true })).toBeVisible();
    await expect(page.getByText(story.firstMessage, { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
  });
}

test("supports direct story visits, legacy redirects, and unknown stories", async ({ page }) => {
  await page.goto("/day/1");
  await expect(page.locator(".conversation-message")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Come\u00e7ar conversa" })).toBeVisible();
  await page.getByRole("button", { name: "Come\u00e7ar conversa" }).click();
  await expect(page.getByText("Hello! How are you doing?", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();

  await page.goto("/day1.html");
  await expect(page).toHaveURL(/\/day\/1$/);

  await page.goto("/day/999");
  await expect(page.getByRole("heading", { name: "Story not found" })).toBeVisible();
});

test("persists the default Portuguese language across routes and refreshes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: pt.feedTitle })).toBeVisible();

  await page.goto("/day/1");
  await expect(page.getByRole("button", { name: "Come\u00e7ar conversa" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Come\u00e7ar conversa" })).toBeVisible();
});

test("keeps the explicit English choice across client-side story routes", async ({ page }) => {
  await page.goto("/day/1");
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("button", { name: "Portuguese" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "Start conversation" })).toBeVisible();

  await page.getByRole("link", { name: /Next story/ }).click();
  await expect(page).toHaveURL(/\/day\/2$/);
  await expect(page.getByRole("button", { name: "Start conversation" })).toBeVisible();
});

test("starts in Portuguese after a refresh even when English was selected", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: "Read travel stories and learn English from context." })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: pt.feedTitle })).toBeVisible();
  await expect(page.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
});

test("renders Portuguese diacritics across the feed, stories, and vocabulary hints", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: pt.feedTitle })).toBeVisible();
  await expect(page.getByText(pt.day2Subtitle, { exact: true })).toBeVisible();
  await expect(page.getByText(pt.day2Copy, { exact: true })).toBeVisible();

  await page.goto("/day/1");
  await expect(page.getByText(pt.florianopolisIntro)).toBeVisible();
  await page.getByRole("button", { name: "Come\u00e7ar conversa" }).click();
  await expect(page.locator(pt.olaSelector)).toHaveCount(1);
  const translationToggle = page.locator(".translation-toggle");
  if (await translationToggle.getAttribute("aria-expanded") === "false") await translationToggle.click();
  await expect(page.getByText(pt.firstTranslation, { exact: true })).toBeVisible();

  await page.goto("/day/2");
  await expect(page.getByText(pt.day2Subtitle, { exact: true })).toBeVisible();
});

test("provides data-driven previous and next story links", async ({ page }) => {
  await page.goto("/day/1");
  await expect(page.getByRole("link", { name: pt.nextStory })).toHaveAttribute("href", "/day/2");

  await page.getByRole("link", { name: pt.nextStory }).click();
  await expect(page).toHaveURL(/\/day\/2$/);
  await expect(page.getByRole("link", { name: pt.previousStory })).toHaveAttribute("href", "/day/1");

  await page.goto("/day/3");
  await expect(page.getByRole("link", { name: pt.nextStory })).toHaveAttribute("href", "/day/4");
  await page.getByRole("link", { name: pt.nextStory }).click();
  await expect(page).toHaveURL(/\/day\/4$/);
  await expect(page.getByRole("link", { name: pt.previousStory })).toHaveAttribute("href", "/day/3");
});

test("opens the Mariana Destrava practice section", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a.post-preview.mariana-feed-preview[href="/mariana"]')).toBeVisible();
  await expect(page.getByText("Mariana Destrava", { exact: true })).toBeVisible();

  await page.locator('a.post-preview.mariana-feed-preview[href="/mariana"]').click();
  await expect(page).toHaveURL(/\/mariana$/);
  await expect(page.getByRole("heading", { name: "Na hora de responder, d\u00e1 branco." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Can you repeat that?" })).toBeVisible();
  await expect(page.getByText("Answer Builder", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Agendar aula particular" })).toHaveCount(2);
  await expect(page.locator(".mariana-cta-link")).toHaveAttribute("href", /wa\.me\/5548984844747/);
  await expect(page.locator(".mariana-cta-link")).toHaveAttribute("href", /Luis/);
  await expect(page.locator(".mariana-primary-button")).toHaveAttribute("href", /aulas%20particulares%20de%20ingl%C3%AAs%20da%20Conversante/);
  await expect(page.locator(".mariana-primary-button")).toHaveAttribute("href", /wa\.me\/5548984844747/);
});


test("persists Mariana Answer Builder choices", async ({ page }) => {
  await page.goto("/mariana");
  await page.evaluate(() => window.localStorage.removeItem("conversante:mariana-progress"));
  await page.reload();
  const naturalAnswer = page.getByRole("button", { name: /Mais natural Sorry, can you repeat that/ });
  await naturalAnswer.click();
  await expect(naturalAnswer).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".mariana-progress")).toContainText("Progresso: 1/2");
  await expect(page.getByText("Fale em voz alta", { exact: true })).toBeVisible();
  await expect(page.locator(".mariana-say-it-line")).toHaveText("Sorry, can you repeat that?");

  await page.reload();
  await expect(page.getByRole("button", { name: /Mais natural Sorry, can you repeat that/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".mariana-progress")).toContainText("Progresso: 1/2");
});

test("shows Mariana rescue help and audio controls", async ({ page }) => {
  await page.goto("/mariana");

  await page.getByRole("button", { name: "Travei. Me ajuda." }).click();
  await expect(page.locator(".mariana-help-panel").getByText("Could you speak a little slower?", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Esconder frases de resgate" })).toHaveAttribute("aria-expanded", "true");

  await expect(page.getByRole("button", { name: /Ouvir frase: Yes, I can hear you/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Ouvir resposta modelo: Can you repeat that, please/ })).toBeVisible();
});

test("tracks Mariana lead-magnet analytics events", async ({ page }) => {
  await page.addInitScript(() => {
    window.__conversanteEvents = [];
    window.addEventListener("conversante:analytics", (event) => {
      window.__conversanteEvents.push(event.detail);
    });
  });

  await page.goto("/mariana");
  await expect.poll(() => page.evaluate(() => window.__conversanteEvents)).toContainEqual(expect.objectContaining({
    name: "mariana_opened",
    properties: expect.objectContaining({ language: "pt", lesson_count: 1 })
  }));

  await page.evaluate(() => window.localStorage.removeItem("conversante:mariana-progress"));
  await page.reload();
  await page.getByRole("button", { name: /Mais natural Sorry, can you repeat that/ }).click();
  await expect.poll(() => page.evaluate(() => window.__conversanteEvents)).toContainEqual(expect.objectContaining({
    name: "mariana_activity_completed",
    properties: expect.objectContaining({ lesson_id: "repeat-that", activity_id: "repeat-safe", selected_level: "natural" })
  }));

  await page.getByRole("link", { name: "Agendar aula particular" }).first().click();
  await expect.poll(() => page.evaluate(() => window.__conversanteEvents)).toContainEqual(expect.objectContaining({
    name: "mariana_cta_clicked",
    properties: expect.objectContaining({ destination: "whatsapp", language: "pt", location: "hero" })
  }));
});
