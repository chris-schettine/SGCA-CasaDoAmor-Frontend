import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import type { Preview } from '@storybook/react-vite';
import type { Decorator } from '@storybook/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { setQueryClient, useAuthStore, type UserType } from '../src/stores/useAuthStore';

const theme = createTheme();

const withProviders: Decorator = (Story, context) => {
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

    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
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
  },
};

export default preview;
