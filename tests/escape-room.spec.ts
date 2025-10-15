import { test, expect } from "@playwright/test";

test("can navigate to /escape-room", async ({ page }) => {
  // Expect a title "to contain" a substring.
  page.goto("/");
  page.getByRole("link", { name: / *escape *room */i }).click();
  await expect(page).toHaveURL(/.*\/escape-room/);
});

test.describe("/escape-room", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/escape-room");
  });

  test("can use default image", async ({ page }) => {
    // Use Default Image
    await page
      .getByRole("button", { name: / *use *default *image */i })
      .click();

    await expect(page.getByRole("img", { name: / *preview */i })).toBeVisible();
  });

  test("can add question", async ({ page }) => {
    // Use Default Image
    await page
      .getByRole("button", { name: / *use *default *image */i })
      .click();

    // Adds question
    await page.locator("div#canvas").click({
      position: { x: 500, y: 500 },
    });

    // Close modal
    await page.locator("body").press("Escape");

    await expect(
      page.getByRole("img", { name: / *question *sprite */i }),
    ).toBeVisible();
  });

  test("can remove question", async ({ page }) => {
    // Use Default Image
    await page
      .getByRole("button", { name: / *use *default *image */i })
      .click();

    // Adds question
    await page.locator("div#canvas").click({
      position: { x: 500, y: 500 },
    });

    // Close modal
    await page.locator("body").press("Escape");

    // Removes question
    await page
      .getByRole("img", { name: / *question *sprite */i })
      .locator("xpath=ancestor::button")
      .click({ modifiers: ["ControlOrMeta"] });

    // Assert the question sprite is deleted
    await expect(
      page.getByRole("img", { name: / *question *sprite */i }),
    ).toHaveCount(0);
  });

  test("can preview", async ({ page }) => {
    // Use Default Image
    await page
      .getByRole("button", { name: / *use *default *image */i })
      .click();

    // Adds question
    await page.locator("div#canvas").click({
      position: { x: 500, y: 500 },
    });

    // Close modal
    await page.locator("body").press("Escape");

    await page.getByRole("button", { name: / *preview */i }).click();
    const newPage = await page.context().waitForEvent("page");

    await expect(newPage).toHaveURL(/.*s3.*amazonaws\.com.*\.html/i);
  });
});
