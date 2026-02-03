import { test, expect } from "@playwright/test";

const fixturesDir = "tests/fixtures";

const files = [
  `${fixturesDir}/sample-image.png`,
  `${fixturesDir}/sample-audio.mp3`,
];

test("users can upload, archive, restore, and delete assets", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder("your@email.com").fill("asset-tests@local.dev");
  await page.getByPlaceholder("••••••••").first().fill("password");
  await page.getByRole("button", { name: /sign in/i }).first().click();

  await page.waitForURL("**/assets");

  await page.setInputFiles('[data-testid="asset-uploader-input"]', files);
  await expect(page.getByTestId("asset-uploader-file-row")).toHaveCount(2);

  await page.getByTestId("asset-upload-button").click();
  await expect(page.getByTestId("asset-upload-progress").first()).toHaveText("100%", {
    timeout: 10000,
  });

  for (const filename of ["sample-image.png", "sample-audio.mp3"]) {
    const card = page
      .locator('[data-testid^="asset-card-"]')
      .filter({ hasText: filename })
      .first();
    await expect(card).toBeVisible();

    const overlay = card.locator('[data-testid="asset-processing-overlay"]');
    await overlay.waitFor({ state: "visible" });
    await overlay.waitFor({ state: "hidden" });
    await expect(card.locator('[data-testid="asset-card-thumbnail"]')).toBeVisible();
  }

  const newCard = page
    .locator('[data-testid^="asset-card-"]')
    .filter({ hasText: "sample-image.png" })
    .first();
  await newCard.locator('[data-testid="asset-action-menu"]').click();
  await page.getByTestId("asset-action-archive").click();

  await page.getByTestId("asset-tab-archived").click();
  const archivedCard = page
    .locator('[data-testid^="asset-card-"]')
    .filter({ hasText: "sample-image.png" })
    .first();
  await expect(archivedCard).toBeVisible();
  await archivedCard.locator('[data-testid="asset-action-menu"]').click();
  await page.getByTestId("asset-action-restore").click();

  await page.getByTestId("asset-tab-all").click();
  await expect(
    page.locator('[data-testid^="asset-card-"]').filter({ hasText: "sample-image.png" })
  ).toBeVisible();

  const deleteTarget = page
    .locator('[data-testid^="asset-card-"]')
    .filter({ hasText: "sample-image.png" })
    .first();
  await deleteTarget.locator('[data-testid="asset-action-menu"]').click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByTestId("asset-action-delete").click();

  await expect(
    page.locator('[data-testid^="asset-card-"]').filter({ hasText: "sample-image.png" })
  ).toHaveCount(0);
});
