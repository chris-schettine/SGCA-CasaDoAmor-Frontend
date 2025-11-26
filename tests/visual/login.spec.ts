import { test, expect } from '@playwright/test';

test.describe('Login page snapshots', () => {
  test('desktop login default', async ({ page }) => {
    await page.goto('/login');
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page).toHaveScreenshot('login-desktop.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('mobile login default', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await expect(page).toHaveScreenshot('login-mobile.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });
});
