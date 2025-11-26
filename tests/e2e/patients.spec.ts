import { test, expect } from '@playwright/test';
import { setupAuthAndMocks } from './utils/auth';
import { selectByLabel } from './utils/interaction';

test.describe.skip('Cadastro de paciente', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthAndMocks(page);
  });

  test('passo 1 -> passo 2 e salvar', async ({ page }) => {
    await page.goto('/patient/register');

    // If a consent dialog appears, accept it so the form is interactable.
    const acceptBtn = page.getByRole('button', { name: /Aceitar Todos/i });
    if (await acceptBtn.count() > 0) {
      await acceptBtn.click().catch(() => {});
      await page.waitForSelector('button:has-text("Aceitar Todos")', { state: 'detached', timeout: 2000 }).catch(() => {});
    }

    // Use the app helper to fill fake data when available to avoid fragile
    // interactions with complex selects.
    const fillFake = page.getByRole('button', { name: /Preencher com dados fake|🎲 Preencher com dados fake/i });
    if (await fillFake.count() > 0) {
      await fillFake.first().click().catch(() => {});
      // small pause for the UI to populate
      await page.waitForTimeout(250);
      // Ensure Sexo / Gênero was populated by the fake-fill; if not, set it.
      const sexoCombo = page.getByRole('combobox', { name: /Sexo \/ Gênero/i });
      if (await sexoCombo.count() > 0) {
        const inner = sexoCombo.first().locator('input, textarea');
        let sexoValue = '';
        if (await inner.count() > 0) {
          sexoValue = await inner.first().inputValue().catch(() => '');
        } else {
          sexoValue = await sexoCombo.first().innerText().catch(() => '');
        }
        if (!sexoValue || sexoValue.trim() === '') {
          // Try to open the combobox and choose the option from the overlay
          const sexoCombo = page.getByRole('combobox', { name: /Sexo \/ Gênero/i }).first();
          if (await sexoCombo.count() > 0) {
            await sexoCombo.click().catch(() => {});
            // wait for overlay listbox/menu to appear
            const listbox = page.getByRole('listbox');
            const menu = page.getByRole('menu');
            if ((await listbox.count()) === 0 && (await menu.count()) === 0) {
              // give the overlay a bit more time
              await page.waitForTimeout(250);
            }
            // try listbox first
            if (await listbox.count() > 0) {
              const opt = listbox.first().getByRole('option', { name: /Masculino/i });
              if (await opt.count() > 0) {
                await opt.first().click();
              } else {
                const textOpt = listbox.first().getByText(/Masculino/i);
                if (await textOpt.count() > 0) await textOpt.first().click();
              }
            } else if (await menu.count() > 0) {
              const opt = menu.first().getByText(/Masculino/i);
              if (await opt.count() > 0) await opt.first().click();
            } else {
              // fallback to clicking a visible text option anywhere
              const anyOpt = page.getByText(/Masculino/i).first();
              if (await anyOpt.count() > 0) {
                await anyOpt.first().click().catch(() => {});
              }
            }
            // small wait for the control to reflect selection
            await page.waitForTimeout(150);
          }
        }
      }
    } else {
      // fallback to manual fills when the fake button is not present
      await page.getByLabel(/nome completo do paciente/i).fill('Paciente E2E');
      await page.getByLabel(/^CPF$/i).fill('123.456.789-00');
      await page.getByLabel(/Data de Nascimento/i).fill('01/01/1980');
      await page.getByLabel(/CEP/i).fill('01001-000');
      await page.getByLabel(/Endereço/i).fill('Rua Teste');
      await page.getByLabel(/Bairro/i).fill('Centro');
      await page.getByLabel(/Cidade/i).fill('São Paulo');
      await page.waitForSelector('input[placeholder="Estado"]', { timeout: 5000 });
      await page.getByPlaceholder('Estado').fill('SP');
      await page.getByLabel(/Número/i).fill('123');
      await page.getByLabel(/Telefone/i).fill('11 99999-9999');
      await page.getByLabel(/E-mail/i).fill('paciente@e2e.com');
      // Explicit combobox -> listbox selection for Sexo (avoids select helper)
      try {
        const sexoComboManual = page.getByRole('combobox', { name: /Sexo \/ Gênero/i }).first();
        if (await sexoComboManual.count() > 0) {
          await sexoComboManual.click().catch(() => {});
          // wait shortly for overlay
          await page.waitForTimeout(150);
          const listboxManual = page.getByRole('listbox');
          if (await listboxManual.count() > 0) {
            const opt = listboxManual.first().getByRole('option', { name: /Masculino/i });
            if (await opt.count() > 0) {
              await opt.first().click();
            } else {
              const txt = listboxManual.first().getByText(/Masculino/i);
              if (await txt.count() > 0) await txt.first().click();
            }
          } else {
            // keyboard fallback
            await sexoComboManual.press('ArrowDown').catch(() => {});
            await page.keyboard.press('Enter').catch(() => {});
          }
          await page.waitForTimeout(100);
        }
      } catch {
        // ignore failures here; test will fail later if mandatory field not set
      }
    }

    await page.getByRole('button', { name: /Próximo/i }).click();
    await expect(page.getByText(/Informações Clínicas/i)).toBeVisible();

    await page.getByTestId('btn-save-patient').click();
    await expect(page.getByText(/Paciente cadastrado com sucesso/i)).toBeVisible();
  });
});
