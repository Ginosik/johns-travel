import { expect, test } from "@playwright/test";

const translations = {
  first: "Ol\u00e1! Como voc\u00ea est\u00e1?",
  second: "Estou bem. E voc\u00ea?"
};

async function switchToEnglish(page) {
  const englishToggle = page.getByRole("button", { name: "English" });
  if (await englishToggle.count()) {
    await englishToggle.click();
  }
}

test("reveals only translations for messages that have unfolded", async ({ page }) => {
  await page.goto("/day/1");
  await switchToEnglish(page);

  const toggle = page.locator(".translation-toggle");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".translation-waiting")).toBeVisible();
  await expect(page.locator(".translation-line")).toHaveCount(0);

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator(".translation-line")).toHaveCount(1);
  await expect(page.locator(".translation-line").first()).toContainText(translations.first);

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator(".translation-line")).toHaveCount(2);
  await expect(page.getByText(translations.second, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Hide translation" }).click();
  await expect(page.locator("#conversation-translation")).toHaveCount(0);
});

test("uses stable UI state when audio cannot load", async ({ page }) => {
  await page.route("**/audio/**", (route) => route.abort());
  await page.goto("/day/1");
  await switchToEnglish(page);
  await page.getByRole("button", { name: "Continue" }).click();

  const audioButton = page.locator(".message-play-button");
  await expect(audioButton).toHaveClass(/is-(error|waiting)/);
  await expect(page.getByRole("status")).toHaveText(/Audio unavailable|Tap again to start audio/);
});

test("shows progress and highlights each newest translation", async ({ page }) => {
  await page.goto("/day/1");
  await switchToEnglish(page);
  await expect(page.locator(".conversation-progress")).toHaveText("0 of 20");
  await page.getByRole("button", { name: "Show translation" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.locator(".conversation-progress")).toHaveText("1 of 20");
  await expect(page.locator(".translation-line.is-new")).toHaveCount(1);
  await expect(page.locator(".translation-panel-progress")).toHaveText("1 of 20");
});

test("closes translation with Escape, restores focus, and keeps the preference between stories", async ({ page }) => {
  await page.goto("/day/1");
  await switchToEnglish(page);
  const toggle = page.getByRole("button", { name: "Show translation" });
  await toggle.click();
  await page.keyboard.press("Escape");

  await expect(page.locator("#conversation-translation")).toHaveCount(0);
  await expect(toggle).toBeFocused();

  await toggle.click();
  await page.getByRole("link", { name: /Next story/ }).click();
  await expect(page.locator("#conversation-translation")).toBeVisible();
  await expect(page.getByRole("button", { name: "Hide translation" })).toHaveAttribute("aria-expanded", "true");
});

test("supports keyboard conversation controls and accessible translation updates", async ({ page }) => {
  await page.goto("/day/1");
  await switchToEnglish(page);
  await page.locator("body").press("Enter");
  await expect(page.getByText("Hello! How are you doing?", { exact: true })).toBeVisible();

  const toggle = page.locator(".translation-toggle");
  await toggle.focus();
  await toggle.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".translation-transcript")).toHaveAttribute("aria-live", "polite");
  await expect(page.getByRole("complementary", { name: "Portuguese translation" })).toBeVisible();
});