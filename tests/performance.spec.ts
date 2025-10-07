import { test, expect } from '@playwright/test';

const projectSetupSkeletonSelector = '[data-testid="project-setup-skeleton"]';
const shotSkeletonSelector = '[data-testid="shot-card-skeleton"]';

const mockStream = `event: shot\ndata: {"id":"shot-1","status":"creating","scene_id":"scene-virtual","shot_number":1}\n\n` +
  `event: shot\ndata: {"id":"shot-1","status":"ready","scene_id":"scene-virtual","shot_number":1,"visual_prompt":"Test","title":"Mock"}\n\n` +
  'event: done\ndata: {"completed":true}\n\n';

test.beforeEach(async ({ page }) => {
  await page.route('**/gen/shots', async route => {
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache'
      },
      body: mockStream
    });
  });
});

test('project setup skeleton appears under 200ms', async ({ page }) => {
  const start = Date.now();
  await page.goto('/project-setup');
  await page.waitForSelector(projectSetupSkeletonSelector, { timeout: 200 });
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThanOrEqual(200);
});

test('shot placeholders stream within 400ms', async ({ page }) => {
  await page.goto('/timeline/test-project');
  const streamButton = page.getByRole('button', { name: /auto-generate/i });
  await expect(streamButton).toBeVisible();
  const clickStart = Date.now();
  await streamButton.click();
  await page.waitForSelector(shotSkeletonSelector, { timeout: 400 });
  const elapsed = Date.now() - clickStart;
  expect(elapsed).toBeLessThanOrEqual(400);
});

test('tab transitions respond under 200ms', async ({ page }) => {
  await page.goto('/project-setup');
  const settingsTab = page.getByRole('button', { name: /settings/i });
  await expect(settingsTab).toBeVisible();
  const interactionDuration = await settingsTab.evaluate(async (button) => {
    const start = performance.now();
    (button as HTMLButtonElement).click();
    await new Promise(requestAnimationFrame);
    return performance.now() - start;
  });
  expect(interactionDuration).toBeLessThanOrEqual(200);
});
