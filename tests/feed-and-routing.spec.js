import { expect, test } from "@playwright/test";

const pt = {
  feedTitle: "Leia hist\u00f3rias de viagem e aprenda ingl\u00eas pelo contexto.",
  vocabulary: "Vocabul\u00e1rio em contexto",
  day1Subtitle: "Dia 1 - Primeiro dia de viagem",
  day2Subtitle: "Dia 2 - Explorando a Lagoa da Concei\u00e7\u00e3o",
  day2Copy: "Uma lagoa movimentada, um bairro novo e o primeiro pedido de John em portugu\u00eas.",
  day3Subtitle: "Dia 3 - O \u00f4nibus errado para a praia certa",
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
  { href: "/day/3", subtitle: pt.day3Subtitle, firstMessage: pt.day3FirstMessage }
];

test("renders the public story library in Portuguese by default", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: pt.feedTitle })).toBeVisible();
  await expect(page.getByText(pt.vocabulary, { exact: true })).toBeVisible();
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
});