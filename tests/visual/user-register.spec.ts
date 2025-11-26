import { test, expect } from '@playwright/test';
import { loginAs } from '../e2e/utils/auth';

const mockRoles = [
  { id: 1, nome: 'Administrador' },
  { id: 2, nome: 'Recepcionista' },
];

test.describe('Visual - User Register', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.route('**/admin/perfis**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockRoles),
      });
    });
  });

  test('user register desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/user/register');
    await expect(page).toHaveScreenshot('user-register-desktop.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('user register mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/user/register');
    await expect(page).toHaveScreenshot('user-register-mobile.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });
});
