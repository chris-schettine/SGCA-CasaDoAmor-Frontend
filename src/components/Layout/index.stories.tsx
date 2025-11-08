import type { Meta, StoryObj } from '@storybook/react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { AuthContext, type UserType } from '../../contexts/AuthContext';
import Layout from './index';
import { theme } from '../../theme';

const mockUser: UserType = {
  nome: 'Usuário Comum',
  email: 'user@example.com',
  cpf: '111.111.111-11',
  roles: ['USER'],
  tipoUsuario: 'USUARIO',
};

const mockAdmin: UserType = {
  nome: 'Administrador',
  email: 'admin@example.com',
  cpf: '222.222.222-22',
  roles: ['ADMIN'],
  tipoUsuario: 'ADMINISTRADOR',
};

const MockPage = ({ title }: { title: string }) => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4">{title}</Typography>
    <Typography>
      This is a placeholder page content. The layout surrounds this area.
    </Typography>
  </Box>
);

const meta: Meta<typeof Layout> = {
  title: 'Components/Navigation/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
    router: {
      initialEntries: ['/patients'],
    },
  },
  decorators: [
    (Story, { args }) => {
      const authValue = {
        isAuthenticated: true,
        user: args.isAdmin ? mockAdmin : mockUser,
        token: 'fake-token',
        login: () => {},
        logout: () => {},
        isLoading: false,
      };

      return (
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={authValue}>
            <Routes>
              <Route element={<Story />}>
                <Route path="/patients" element={<MockPage title="Pacientes" />} />
                <Route path="/users" element={<MockPage title="Usuários" />} />
                <Route path="/sessions" element={<MockPage title="Sessões Ativas" />} />
                <Route path="/auditoria" element={<MockPage title="Auditoria" />} />
                <Route path="/profile" element={<MockPage title="Meu Perfil" />} />
              </Route>
            </Routes>
          </AuthContext.Provider>
        </ThemeProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Layout>;

export const AsUser: Story = {
  args: {
    isAdmin: false,
  },
  name: 'Logged in as User',
};

export const AsAdmin: Story = {
  args: {
    isAdmin: true,
  },
  name: 'Logged in as Admin',
};
