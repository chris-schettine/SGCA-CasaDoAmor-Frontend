import { test, expect } from '@playwright/test';
import { loginAs } from '../e2e/utils/auth';

const mockSession = {
  nome: 'Usuário Perfil',
  email: 'perfil@example.com',
  cpf: '12345678900',
  perfis: [{ nome: 'ADMINISTRADOR' }],
  tipo: 'ADMINISTRADOR',
  uuid: 'perfil-uuid',
  telefone: '11999999999',
  dadosPessoais: {
    sexo: 'MASCULINO',
  },
  endereco: {
    logradouro: 'Rua Teste',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    numero: '123',
    cep: '01001000',
  },
};

test.describe('Visual - Meu Perfil', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.route('**/auth/me**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSession),
      });
    });
  });

  test('profile desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/my-profile');
    await expect(page).toHaveScreenshot('profile-desktop.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('profile mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/my-profile');
    await expect(page).toHaveScreenshot('profile-mobile.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });
});
