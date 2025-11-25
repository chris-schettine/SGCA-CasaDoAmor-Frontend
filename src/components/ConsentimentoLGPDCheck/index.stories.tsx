import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, type PropsWithChildren } from 'react';
import { Box, Typography } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ConsentimentoLGPDCheck from './index';
import { ThemeProvider } from '../../contexts/ThemeContext';
import TransitionProvider from '../../motion/TransitionProvider';
import { ToastContainerWrapper } from '../ToastContainerWrapper';
import { useAuthStore, type UserType } from '../../stores/useAuthStore';
import { consentimentoService } from '../../api/consentimento.service';
import { ConsentStore } from '../../consent/store/consentStore';

const meta = {
  title: 'Components/Routes/ConsentimentoLGPDCheck',
  component: ConsentimentoLGPDCheck,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    // component renders based on global auth/consent state
  },
} satisfies Meta<typeof ConsentimentoLGPDCheck>;

export default meta;
type Story = StoryObj<typeof ConsentimentoLGPDCheck>;

const defaultUser: UserType = {
  nome: 'Fulano da Silva',
  email: 'fulano@example.com',
  cpf: '12345678901',
  roles: ['USER'],
};

// Avoid real network calls in Storybook by stubbing the consent service once, before hooks run
(consentimentoService as any).listarConsentimentosPorCpf = async () => [];
(consentimentoService as any).registrarConsentimentoPorCpf = async () => ({ ok: true });
(consentimentoService as any).registrarConsentimento = async () => ({ ok: true });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: Infinity,
    },
  },
});

const resetConsentStorage = () => {
  try {
    sessionStorage.removeItem('consentimento-lgpd-checked');
    sessionStorage.removeItem('consentimento-api-called');
    sessionStorage.removeItem('consentimento-pending');
    sessionStorage.removeItem('consentimento-logout-pending');
  } catch {
    // ignore storage errors in Storybook
  }
  try {
    localStorage.removeItem('consent-store:global');
  } catch {
    // ignore
  }
};

const setupAuth = (user: UserType | null, isAuthenticated: boolean) => {
  try {
    localStorage.removeItem('auth-storage');
  } catch {
    // ignore
  }
  useAuthStore.setState((current) => ({
    ...current,
    user,
    isAuthenticated,
    token: isAuthenticated ? 'fake-token' : null,
    isLoading: false,
  }));
};

const Providers = ({ children }: PropsWithChildren) => (
  <ThemeProvider>
    <TransitionProvider>
      <QueryClientProvider client={queryClient}>
        <ToastContainerWrapper />
        {children}
      </QueryClientProvider>
    </TransitionProvider>
  </ThemeProvider>
);

const StoryLayout = ({ title }: { title: string }) => (
  <Box sx={{ p: 4, display: 'grid', gap: 2, maxWidth: 720 }}>
    <Typography variant="h5">{title}</Typography>
    <Typography variant="body2" color="text.secondary">
      Este componente verifica consentimento LGPD na navegação e abre o diálogo obrigatório quando não encontra
      registros. Interaja com o modal para ver as ações simuladas.
    </Typography>
    <ConsentimentoLGPDCheck />
  </Box>
);

export const SemConsentimento: Story = {
  parameters: { router: { initialEntries: ['/patients'] } },
  render: () => {
    useEffect(() => {
      resetConsentStorage();
      setupAuth(defaultUser, true);
    }, []);

    return (
      <Providers>
        <StoryLayout title="Sem consentimento (dialogo abre automaticamente)" />
      </Providers>
    );
  },
};

export const ConsentimentoJaRegistrado: Story = {
  parameters: { router: { initialEntries: ['/patients'] } },
  render: () => {
    useEffect(() => {
      resetConsentStorage();
      setupAuth(defaultUser, true);
      // Preenche snapshot local para simular consentimento existente
      ConsentStore.save(defaultUser.cpf, ConsentStore.getAcceptAllChoices(), { requireApi: false }).catch(() => undefined);
      try {
        sessionStorage.setItem('consentimento-lgpd-checked', 'true');
      } catch {
        // ignore
      }
    }, []);

    return (
      <Providers>
        <StoryLayout title="Consentimento já registrado (nenhum dialogo visível)" />
      </Providers>
    );
  },
};
