import { test, expect } from '@playwright/test';
import { loginAs } from '../e2e/utils/auth';

test.describe('Visual - Patient Register', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('patient register step 1 desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/patient/register');
    await expect(page).toHaveScreenshot('patient-register-step1-desktop.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('patient register step 1 mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/patient/register');
    await expect(page).toHaveScreenshot('patient-register-step1-mobile.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });
});
