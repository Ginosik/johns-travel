import { expect, test } from "@playwright/test";

const publishedStories = [
  { href: "/day/1", subtitle: "Day 1 - First day traveling" },
  { href: "/day/2", subtitle: "Day 2 - Exploring Lagoa da Conceição" },
  { href: "/day/3", subtitle: "Hindi 1 - Meeting someone" }
];

test("renders the feed, composer, and every published preview", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("region", { name: "Create post" })).toBeVisible();
  await expect(page.getByRole("button", { name: "What's on your mind, John?" })).toBeVisible();

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
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
  });
}

test("supports direct story visits, legacy redirects, and unknown stories", async ({ page }) => {
  await page.goto("/day/1");
  await expect(page.locator(".conversation-message")).toHaveCount(0);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Hello! How are you doing?", { exact: true })).toBeVisible();

  await page.goto("/day1.html");
  await expect(page).toHaveURL(/\/day\/1$/);

  await page.goto("/day/999");
  await expect(page.getByRole("heading", { name: "Story not found" })).toBeVisible();
});

test("persists the language choice across routes and refreshes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Portuguese" }).click();
  await expect(page.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "No que você está pensando, John?" })).toBeVisible();

  await page.goto("/day/1");
  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
});

test("renders Portuguese diacritics across the feed, stories, and vocabulary hints", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Portuguese" }).click();
  await expect(page.getByRole("button", { name: "No que você está pensando, John?" })).toBeVisible();
  await expect(page.getByText("Dia 2 - Explorando a Lagoa da Conceição", { exact: true })).toBeVisible();
  await expect(page.getByText("Uma lagoa movimentada, um bairro novo e o primeiro pedido de John em português.", { exact: true })).toBeVisible();

  await page.goto("/day/1");
  await expect(page.getByText(/Florianópolis, Brasil, português/)).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.locator('.word[data-translation="olá"]')).toHaveCount(1);
  const translationToggle = page.locator(".translation-toggle");
  if (await translationToggle.getAttribute("aria-expanded") === "false") await translationToggle.click();
  await expect(page.getByText("Olá! Como você está?", { exact: true })).toBeVisible();

  await page.goto("/day/2");
  await expect(page.getByText("Dia 2 - Explorando a Lagoa da Conceição", { exact: true })).toBeVisible();
});

test("provides data-driven previous and next story links", async ({ page }) => {
  await page.goto("/day/1");
  await expect(page.getByRole("link", { name: /Next story/ })).toHaveAttribute("href", "/day/2");

  await page.getByRole("link", { name: /Next story/ }).click();
  await expect(page).toHaveURL(/\/day\/2$/);
  await expect(page.getByRole("link", { name: /Previous story/ })).toHaveAttribute("href", "/day/1");
});
