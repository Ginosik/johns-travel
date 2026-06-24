import { expect, test } from "@playwright/test";

test("opens the first English-to-Hindi story from the feed and directly", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a.post-preview[href="/day/3"]')).toBeVisible();
  await page.locator('a.post-preview[href="/day/3"]').click();

  await expect(page).toHaveURL(/\/day\/3$/);
  await expect(page.getByLabel("Learning direction: English → Hindi")).toBeVisible();
  await expect(page.getByRole("button", { name: "Show Hindi" })).toBeVisible();

  await page.goto("/day/3");
  await expect(page.getByText("Hindi 1 - Meeting someone", { exact: true })).toBeVisible();
});

test("reveals Devanagari, transliteration, and learning notes progressively", async ({ page }) => {
  await page.goto("/day/3");
  await page.getByRole("button", { name: "Show Hindi" }).click();
  await expect(page.getByRole("complementary", { name: "Hindi" })).toBeVisible();
  await expect(page.locator(".translation-line")).toHaveCount(0);

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator('.conversation-record .speech-text[lang="hi"]')).toHaveCount(1);
  await expect(page.locator('.conversation-record .word[data-translation="hello"]')).toHaveText("नमस्ते!");
  await expect(page.getByText("Hello! My name is John.", { exact: true })).toHaveCount(0);
  await expect(page.locator(".translation-native")).toHaveText("नमस्ते! मेरा नाम जॉन है।");
  await expect(page.locator(".translation-transliteration")).toContainText("Namaste! Mera naam John hai.");
  await expect(page.locator(".translation-meaning")).toContainText("Namaste is a respectful greeting that works throughout the day.");
  await expect(page.locator(".message-play-button:not(.pronunciation-button)")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Replay John's message" })).toHaveCount(1);

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator(".translation-line")).toHaveCount(2);
  await expect(page.locator(".translation-native")).toHaveCount(2);
  await expect(page.locator('.conversation-record .word[data-translation="you (respectful)"]')).toHaveCount(1);
});

test("uses generated Hindi audio files instead of browser speech synthesis", async ({ page }) => {
  const requestedAudio = [];
  await page.route("**/audio/hindi-1/**", (route) => {
    requestedAudio.push(new URL(route.request().url()).pathname);
    route.abort();
  });
  await page.goto("/day/3");
  await page.getByRole("button", { name: "Continue" }).click();

  const audioButton = page.locator(".message-play-button:not(.pronunciation-button)").first();
  await audioButton.click();

  await expect.poll(() => requestedAudio.length).toBeGreaterThanOrEqual(1);
  expect(requestedAudio).toContain("/audio/hindi-1/John-01.mp3");
  await expect(audioButton).toHaveClass(/is-(error|waiting)/);
  await expect(page.getByRole("status")).toHaveText(/Audio unavailable|Tap again to start audio/);
});

test("renders all ten Hindi entries without clipping or horizontal overflow", async ({ page }) => {
  await page.goto("/day/3");
  await page.getByRole("button", { name: "Show Hindi" }).click();

  for (let index = 0; index < 10; index += 1) {
    await page.getByRole("button", { name: "Continue" }).click();
  }

  await expect(page.locator(".translation-line")).toHaveCount(10);
  await expect(
    page.locator(".conversation-record .speech-text").filter({ hasText: "आपसे मिलकर खुशी हुई। फिर मिलेंगे!" })
  ).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Conversation complete" })).toBeDisabled();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});
