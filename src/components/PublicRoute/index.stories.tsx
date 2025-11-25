import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Route, Routes, useNavigate } from 'react-router-dom';
import PublicRoute from './index';
import { useAuthStore, type UserType } from '../../stores/useAuthStore';

const meta = {
  title: 'Components/Routes/PublicRoute',
  component: PublicRoute,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof PublicRoute>;

export default meta;
type Story = StoryObj<typeof PublicRoute>;

const resetAuthStore = (state: Partial<ReturnType<typeof useAuthStore.getState>>) => {
  try {
    localStorage.removeItem('auth-storage');
  } catch {
    // ignore storage failures in Storybook sandbox
  }
  useAuthStore.setState((current) => ({
    ...current,
    ...state,
  }));
};

const AuthControls = ({
  user,
  isAuthenticated,
}: {
  user: UserType | null;
  isAuthenticated: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
      <Button
        variant="contained"
        onClick={() => {
          resetAuthStore({ isAuthenticated: false, user: null, token: null, isLoading: false });
          navigate('/login');
        }}
      >
        Simular usuário deslogado
      </Button>
      <Button
        variant="outlined"
        onClick={() => {
          resetAuthStore({
            isAuthenticated: true,
            user: user ?? {
              nome: 'Ana Souza',
              email: 'ana@example.com',
              cpf: '00000000000',
              roles: ['USER'],
            },
            token: 'fake-token',
            isLoading: false,
          });
          navigate('/login');
        }}
      >
        Simular usuário autenticado
      </Button>
    </Stack>
  );
};

const DemoShell = ({ heading }: { heading: string }) => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h5" gutterBottom>
      {heading}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Navegue entre estados para ver o comportamento. Usuário autenticado é redirecionado para /patients.
    </Typography>
  </Box>
);

const PublicRoutePlayground = ({ authenticated }: { authenticated: boolean }) => {
  useEffect(() => {
    resetAuthStore({
      isAuthenticated: authenticated,
      user: authenticated
        ? {
            nome: 'Ana Souza',
            email: 'ana@example.com',
            cpf: '00000000000',
            roles: ['USER'],
          }
        : null,
      token: authenticated ? 'fake-token' : null,
      isLoading: false,
    });
  }, [authenticated]);

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <DemoShell heading="Página pública (login)" />
            </PublicRoute>
          }
        />
        <Route path="/patients" element={<DemoShell heading="Redirecionado para /patients" />} />
      </Routes>
      <Box sx={{ position: 'fixed', bottom: 24, left: 24 }}>
        <AuthControls user={useAuthStore.getState().user} isAuthenticated={authenticated} />
      </Box>
    </>
  );
};

export const Unauthenticated: Story = {
  parameters: { router: { initialEntries: ['/login'] } },
  render: () => <PublicRoutePlayground authenticated={false} />,
};

export const Authenticated: Story = {
  parameters: { router: { initialEntries: ['/login'] } },
  render: () => <PublicRoutePlayground authenticated />,
};
