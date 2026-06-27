import { expect, test } from "@playwright/test";

const coreRoutes = ["/", "/day/1", "/day/2", "/trip-map"];
const viewportMatrix = [
  { name: "phone-320", width: 320, height: 700 },
  { name: "phone-360", width: 360, height: 800 },
  { name: "phone-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1024", width: 1024, height: 768 },
  { name: "phone-landscape", width: 844, height: 390 }
];

test("does not show social mobile navigation on the public feed", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Mobile" })).toHaveCount(0);

  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.getByRole("navigation", { name: "Mobile" })).toHaveCount(0);
});

test("keeps the translation panel usable across responsive layouts", async ({ page }) => {
  const sizes = [
    { width: 1280, height: 800 },
    { width: 768, height: 1024 },
    { width: 320, height: 700 },
    { width: 844, height: 390 }
  ];

  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.goto("/day/1");
    const translationToggle = page.locator(".translation-toggle");
    if (await translationToggle.getAttribute("aria-expanded") === "false") {
      await translationToggle.click();
    }
    await expect(page.locator("#conversation-translation")).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
});

test("has no horizontal page overflow at supported widths", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "The viewport matrix runs once.");

  for (const viewport of viewportMatrix) {
    await test.step(viewport.name, async () => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of coreRoutes) {
        await page.goto(route);
        if (route.startsWith("/day/")) {
          const translationToggle = page.locator(".translation-toggle");
          if (await translationToggle.getAttribute("aria-expanded") === "false") {
            await translationToggle.click();
          }
        }

        const dimensions = await page.evaluate(() => ({
          documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
          viewportWidth: window.innerWidth
        }));
        expect(dimensions.documentWidth, `${route} overflowed at ${viewport.name}`).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
      }
    });
  }
});

test("preserves feed scroll and conversation progress on mobile navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 420));
  await page.locator('a.post-preview[href="/day/2"]').scrollIntoViewIfNeeded();
  const feedScroll = await page.evaluate(() => window.scrollY);

  await page.locator('a.post-preview[href="/day/2"]').click();
  await page.goBack();
  await expect.poll(async () => {
    const restoredScroll = await page.evaluate(() => window.scrollY);
    return Math.abs(restoredScroll - feedScroll) <= 24;
  }).toBe(true);

  await page.goto("/day/1");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.locator(".conversation-record .speech:not(.typing-speech)")).toHaveCount(2);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator(".conversation-record .speech:not(.typing-speech)")).toHaveCount(2);
});
