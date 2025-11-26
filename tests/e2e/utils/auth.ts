import type { Page } from '@playwright/test';

type SeedUser = {
  nome: string;
  email: string;
  cpf: string;
  roles: string[];
  tipoUsuario?: string;
  uuid?: string;
};

const fallbackUser: SeedUser = {
  nome: 'Usuário E2E',
  email: 'e2e@example.com',
  cpf: '00000000000',
  roles: ['ADMINISTRADOR'],
  tipoUsuario: 'ADMINISTRADOR',
  uuid: 'e2e-uuid',
};

/**
 * Injeta sessão autenticada via localStorage para rotas protegidas.
 * Ajuste o token/usuário conforme ambiente real ou mocks.
 */
export async function loginAs(page: Page, user: SeedUser = fallbackUser, token = 'e2e-token') {
  await page.addInitScript(
    ({ injectedUser, injectedToken }) => {
      const authStorage = {
        state: {
          token: injectedToken,
          user: injectedUser,
          isAuthenticated: true,
        },
        version: 0,
      };
      try {
        localStorage.setItem('authToken', injectedToken);
        localStorage.setItem('authUser', JSON.stringify(injectedUser));
        localStorage.setItem('auth-storage', JSON.stringify(authStorage));
      } catch (e) {
        // ignore storage failures in tests
        console.warn('[e2e] failed to seed auth storage', e);
      }
    },
    { injectedUser: user, injectedToken: token }
  );
}

/**
 * Convenience helper that seeds auth storage and also installs
 * common network mocks and consent snapshot so tests don't get
 * redirected to `/login` or blocked by the global consent dialog.
 */
export async function setupAuthAndMocks(page: Page, user: SeedUser = fallbackUser, token = 'e2e-token') {
  await loginAs(page, user, token);

  // Mock auth/me so the app believes the token is valid when it
  // performs the server-side check during navigation.
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ nome: user.nome, email: user.email, cpf: user.cpf, perfis: [{ nome: 'ADMINISTRADOR' }], tipoUsuario: user.tipoUsuario || 'ADMINISTRADOR', uuid: user.uuid || 'e2e-uuid' }),
    });
  });

  // Mock consent endpoints and pre-seed a consent snapshot in localStorage
  // so the consent dialog does not block tests.
  const mockConsent = {
    id: 1,
    tipo: 'LGPD',
    concedido: true,
    versao: '1.0.0',
    criadoEm: '2025-01-01T00:00:00Z',
  };
  await page.route('**/api/usuarios/**/consentimentos-lgpd', async (route) => {
    const req = route.request();
    if (req.method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockConsent]) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockConsent) });
    }
  });

  await page.addInitScript(() => {
    try {
      const keyCpf = 'casa-amor-lgpd-consent:00000000000';
      const keyUuid = 'casa-amor-lgpd-consent:e2e-uuid';
      const snapshot = {
        version: '1.0.0',
        acceptedAt: '2025-01-01T00:00:00Z',
        accepted: true,
        consents: [
          { tipo: 'LGPD', concedido: true, versao: '1.0.0', criadoEm: '2025-01-01T00:00:00Z' },
        ],
      };
      localStorage.setItem(keyCpf, JSON.stringify(snapshot));
      localStorage.setItem(keyUuid, JSON.stringify(snapshot));
    } catch {
      // ignore
    }
  });

  // Defensive: remove consent dialog/backdrops if they appear (helps tests that
  // navigate to registration pages where the dialog may be shown for other
  // CPFs). This runs early on every page load.
  await page.addInitScript(() => {
    try {
      const removeConsent = () => {
        try {
          const modal = document.querySelector('[data-testid="dialog-consent"]');
          if (modal && modal.parentElement) modal.remove();
          document.querySelectorAll('.MuiModal-root, .MuiDialog-container').forEach((el) => {
            try { el.remove(); } catch { /* ignore */ }
          });
        } catch (e) {
          // ignore
        }
      };
      // Run once immediately and then observe DOM for later inserts
      removeConsent();
      const obs = new MutationObserver(removeConsent);
      obs.observe(document, { childList: true, subtree: true });
      // keep observer alive for test duration
      (window as any).__e2e_remove_consent_observer = obs;
    } catch {
      // ignore
    }
  });

  // Also attempt to auto-click any visible "Aceitar Todos" button as it
  // appears. This handles cases where the consent dialog is rendered without
  // the data-testid or different container classes.
  await page.addInitScript(() => {
    try {
      const clickAcceptIfPresent = () => {
        try {
          const buttons = Array.from(document.querySelectorAll('button'));
          for (const b of buttons) {
            const txt = (b.textContent || '').trim();
            if (/Aceitar Todos/i.test(txt) || /Aceitar tudo/i.test(txt)) {
              try { (b as HTMLButtonElement).click(); } catch { /* ignore */ }
            }
          }
        } catch { /* ignore */ }
      };
      clickAcceptIfPresent();
      const obs2 = new MutationObserver(clickAcceptIfPresent);
      obs2.observe(document, { childList: true, subtree: true });
      (window as any).__e2e_click_accept_observer = obs2;
    } catch { /* ignore */ }
  });

  // Provide a simple sessions mock so pages that show sessions render a header
  // and list properly during smoke tests.
  const mockSession = {
    id: 1,
    criadoEm: '2024-02-01T12:00:00Z',
    expiraEm: '2024-02-01T18:00:00Z',
    ipOrigem: '127.0.0.1',
    userAgent: 'Playwright',
    ativo: true,
    atual: false,
    usuario: { nome: user.nome, cpf: user.cpf },
  };
  await page.route('**/auth/sessoes*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalSessoes: 1, sessoes: [mockSession] }) });
  });
  await page.route('**/admin/audit/sessions', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ totalSessoes: 1, sessoes: [mockSession] }) });
  });
}
