import { test, expect } from '@playwright/test';
import { setupAuthAndMocks } from './utils/auth';
import { selectByLabel } from './utils/interaction';

test.describe.skip('Cadastro de usuário', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthAndMocks(page);
  });

  test('preenche e abre consentimento', async ({ page }) => {
    await page.goto('/user/register');

    // Accept consent dialog if it shows up during registration
    const acceptBtn = page.getByRole('button', { name: /Aceitar Todos/i });
    if (await acceptBtn.count() > 0) {
      await acceptBtn.click().catch(() => {});
      await page.waitForSelector('button:has-text("Aceitar Todos")', { state: 'detached', timeout: 2000 }).catch(() => {});
    }

    // Prefer the app's fake-fill button to populate the form and avoid brittle
    // interactions with custom selects. Fall back to manual fills if it's absent.
    const fillFake = page.getByRole('button', { name: /Preencher com dados fake|🎲 Preencher com dados fake/i });
    if (await fillFake.count() > 0) {
      await fillFake.first().click().catch(() => {});
      await page.waitForTimeout(250);
    } else {
      await page.getByLabel(/Email/i).fill('novo@exemplo.com');
      await page.getByLabel(/Telefone/i).fill('11 99999-9999');
      await page.getByLabel(/Nome completo/i).fill('Usuário E2E');
      await page.getByLabel(/^CPF$/i).fill('123.456.789-00');
      await page.getByLabel(/CEP/i).fill('01001-000');
      await page.getByLabel(/Endereço/i).fill('Rua E2E');
      await page.getByLabel(/Bairro/i).fill('Centro');
      await page.getByLabel(/Cidade/i).fill('São Paulo');
      await page.waitForSelector('input[placeholder="Estado"]', { timeout: 5000 });
      await page.getByPlaceholder('Estado', { exact: true }).fill('SP');
      await page.getByLabel(/Número/i).fill('123');
      await selectByLabel(page, /Tipo de Profissional/i, /Administrador/i);
      await selectByLabel(page, /Perfil de Acesso/i, /.*/i);
      await selectByLabel(page, /Sexo/i, /Masculino/i);
    }

    await page.getByTestId('btn-save-user').click();
    await expect(page.getByTestId('dialog-consent')).toBeVisible();
  });
});
