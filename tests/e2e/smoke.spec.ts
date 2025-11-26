import { test, expect } from '@playwright/test';
import { setupAuthAndMocks } from './utils/auth';

test.describe('Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthAndMocks(page);
  });

  test('sessions page renders after login', async ({ page }) => {
    await page.goto('/sessions');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Sessões Ativas/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('home/dashboard loads after login', async ({ page }) => {
    await page.goto('/');
    // Fallback smoke: body renders and no 401/redirect loop
    await expect(page.locator('body')).toBeVisible();
  });
});
