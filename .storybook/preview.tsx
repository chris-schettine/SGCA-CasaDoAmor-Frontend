// storybook preview: providers only — visual/theme providers are moved into components
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import type { Preview } from '@storybook/react-vite';
import type { Decorator } from '@storybook/react';
import React, { useMemo } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { setQueryClient, useAuthStore, type UserType } from '../src/stores/useAuthStore';
import { ConsentContext } from '../src/consent/provider/ConsentProvider';
import type { ConsentContextValue } from '../src/consent/types/consent.types';
// createAppTheme was used by the old global theme decorator; theme handling moved to components
import TransitionProvider from '../src/motion/TransitionProvider';

// Safety: some storybook test code references a global helper called __test during page.evaluate.
// Ensure it exists so tests don't fail with ReferenceError in some runner environments.
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).__test === 'undefined') {
  // Provide a no-op function object so stories and tests can call __test()
  // without hitting ReferenceError. Also set a flag to disable animations
  // during automated test runs so axe tests evaluate stable final UI states.
  const noop = Object.assign(() => {}, { disableAnimations: true });
  (globalThis as any).__test = noop;
}
// Some runners execute in a real browser context; mirror __test on window to avoid ReferenceError.
if (typeof window !== 'undefined' && typeof (window as any).__test === 'undefined') {
  (window as any).__test = (globalThis as any).__test ?? Object.assign(() => {}, { disableAnimations: true });
}

// If we're running under the Storybook test-runner, apply a test-only
// high-contrast CSS override for common selectors. Axe sometimes reads
// computed colors from duplicates/animation clones; this forces a stable
// dark color and removes blending/opacity for smoke-test runs.
// Keep __test injected (done above) — we no longer add test-only forcing styles here.

const withProviders: Decorator = (Story, context) => {
  // Theme is intentionally NOT provided here anymore. Stories/components
  // should include ThemeProvider themselves when they need theme-aware rendering.
  const initialEntries = context.parameters?.router?.initialEntries ?? ['/'];
  const authParam = context.parameters?.auth ?? {};
  const reactQueryParam = context.parameters?.reactQuery ?? {};

  type StorybookAuthParam = {
    isAuthenticated?: boolean;
    user?: UserType;
    token?: string;
  };

  type StorybookReactQueryParam = {
    initialQueries?: Array<{ queryKey: QueryKey; data: unknown }>;
  };

  const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [queryClient] = React.useState(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              retry: 0,
              refetchOnWindowFocus: false,
            },
          },
        })
    );

    React.useEffect(() => {
      setQueryClient(queryClient);
      return () => {
        queryClient.clear();
      };
    }, [queryClient]);

    const authOptions = authParam as StorybookAuthParam;

    const defaultUser = React.useMemo<UserType>(
      () => ({
        nome: 'Administrador Storybook',
        email: 'storybook@example.com',
        cpf: '00000000000',
        roles: ['ADMIN'],
        tipoUsuario: 'ADMINISTRADOR',
      }),
      []
    );

    const resolvedAuthState = React.useMemo(
      () => ({
        isAuthenticated:
          typeof authOptions.isAuthenticated === 'boolean'
            ? authOptions.isAuthenticated
            : true,
        user: authOptions.user ?? defaultUser,
        token: authOptions.token ?? 'storybook-token',
      }),
      [authOptions.isAuthenticated, authOptions.token, authOptions.user, defaultUser]
    );

    React.useEffect(() => {
      useAuthStore.setState({
        ...resolvedAuthState,
        isLoading: false,
      });

      return () => {
        useAuthStore.setState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
      };
    }, [resolvedAuthState]);

    const reactQueryOptions = reactQueryParam as StorybookReactQueryParam;

    const initialQueries = React.useMemo(
      () => reactQueryOptions.initialQueries ?? [],
      [reactQueryOptions.initialQueries]
    );

    React.useEffect(() => {
      if (!initialQueries.length) {
        return;
      }

      initialQueries.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });
    }, [initialQueries, queryClient]);

    // Mock consent context to avoid errors when a story uses useConsent without wrapping provider
    const mockConsentValue = React.useMemo<ConsentContextValue>(
      () => ({
        state: { type: 'consented', choices: {}, timestamp: new Date().toISOString() },
        hasConsent: () => true,
        openDialog: () => {},
        withdrawConsent: async () => {},
        isLoading: false,
        choices: {},
        dialogOpen: false,
        dialogRequired: false,
      }),
      []
    );

    return (
      <QueryClientProvider client={queryClient}>
        <TransitionProvider>
          <ConsentContext.Provider value={mockConsentValue}>
            {children}
          </ConsentContext.Provider>
        </TransitionProvider>
      </QueryClientProvider>
    );
  };

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <Providers>
        <Story />
      </Providers>
    </MemoryRouter>
  );
};

const preview: Preview = {
  decorators: [withProviders],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
    // Make accessibility (axe) violations fail the test-runner.
    // This ensures CI will alert on regressions instead of logging warnings.
    a11y: {
      // Test mode 'error' causes the test-runner to treat violations as test failures
      test: 'error',
    },
  },
  // Note: theme global is intentionally removed — components should manage their own theme provider.
};

export default preview;
