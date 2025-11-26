import { test, expect } from '@playwright/test';

const mockSessions = [
  {
    id: 1,
    criadoEm: '2024-02-01T12:00:00Z',
    expiraEm: '2024-02-01T18:00:00Z',
    ipOrigem: '192.168.0.10',
    userAgent: 'Chrome on macOS',
    ativo: true,
    atual: false,
    usuario: { nome: 'João Silva', cpf: '123.456.789-00' },
  },
  {
    id: 2,
    criadoEm: '2024-02-02T10:00:00Z',
    expiraEm: '2024-02-02T16:00:00Z',
    ipOrigem: '10.0.0.5',
    userAgent: 'Safari on iOS',
    ativo: true,
    atual: true,
    usuario: { nome: 'Maria Souza', cpf: '987.654.321-00' },
  },
];

test.describe('Sessions page snapshots', () => {
  test('desktop list', async ({ page }) => {
    await page.route('**/auth/sessoes*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ totalSessoes: mockSessions.length, sessoes: mockSessions }),
      });
    });

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/sessions');

    await expect(page).toHaveScreenshot('sessions-desktop.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('mobile list', async ({ page }) => {
    await page.route('**/auth/sessoes*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ totalSessoes: mockSessions.length, sessoes: mockSessions }),
      });
    });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sessions');

    await expect(page).toHaveScreenshot('sessions-mobile.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });
});
