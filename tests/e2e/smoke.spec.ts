import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test('selects a sport and exposes sport-specific modules and export presets', async ({ page }) => {
  await page.goto('');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.locator('#sport-option-basketball').click();

  await expect(page.locator('#btn-change-sport')).toContainText('บาสเกตบอล');
  await page.locator('#workflow-step-5').click();
  await expect(page.locator('#module-toggle-foulA')).toHaveCount(1);
  await expect(page.locator('#module-toggle-yellowCardA')).toHaveCount(0);

  await page.locator('#workflow-step-7').click();
  await expect(page.locator('#export-mode-hd720')).toBeVisible();
});

test('saves and reloads a named project snapshot', async ({ page }) => {
  await page.goto('');
  await page.locator('#sport-option-football').click();
  await page.locator('#btn-save').click();
  await page.locator('#project-name-input').fill('Smoke Match');
  await page.locator('#btn-save-named-project').click();
  await expect(page.getByText('Smoke Match', { exact: true })).toBeVisible();
});
