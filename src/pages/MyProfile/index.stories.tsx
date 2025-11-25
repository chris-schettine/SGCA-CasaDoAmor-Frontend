import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MyProfilePage from '.';
import { AuthProvider } from '../../contexts/AuthContext';
import { authService } from '../../api/auth.service';
import { adminService } from '../../api/admin.service';
import type { AuthSessionResponse } from '../../api/auth.dto';
import MockAdapter from 'axios-mock-adapter';
import { api } from '../../api/api.gateway';

const meta: Meta<typeof MyProfilePage> = {
  title: 'Pages/MyProfilePage',
  component: MyProfilePage,
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MyProfilePage>;

const mockSession: AuthSessionResponse = {
  nome: 'Dra. Maria Silva',
  email: 'maria.silva@example.com',
  cpf: '12345678900',
  tipo: 'MEDICO',
  perfis: [{ id: 1, nome: 'Médico', descricao: '', permissoes: [], totalPermissoes: 0 }],
  telefone: '(11) 99999-9999',
  dadosPessoais: {
    dataNascimento: '1990-01-01',
    naturalidade: 'São Paulo',
    sexo: 'FEMININO',
  },
  endereco: {
    cep: '12345678',
    endereco: 'Rua Exemplo',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    numero: '100',
    complemento: '',
  },
};

// Defensive safety: ensure the small test helper object `__test` exists in the
// page context for Storybook test-runner environments that might evaluate
// scripts before the preview/head injection has run.
if (typeof window !== 'undefined' && typeof (window as any).__test === 'undefined') {
  (window as any).__test = Object.assign(() => {}, { disableAnimations: true });
}

const originalAuthSession = authService.getActiveSession.bind(authService);
const originalChangePassword = authService.changePassword.bind(authService);
const originalUpdateUser = adminService.updateUser.bind(adminService);

// Apply API and service mocks eagerly so requests never reach the real backend.
const mock = new MockAdapter(api, { delayResponse: 25 });
mock.onGet('/auth/me').reply(200, mockSession);
mock.onPost('/auth/change-password').reply(200);
mock.onPost('/auth/logout').reply(200);
mock.onAny().passThrough();

authService.getActiveSession = async () => mockSession;
authService.changePassword = async () => undefined;
adminService.updateUser = async () => undefined as unknown as ReturnType<typeof originalUpdateUser>;

export const Default: Story = {
  render: () => <MyProfilePage />,
};

export const Loading: Story = {
  render: () => {
    const LoadingWrapper: React.FC = () => {
      React.useEffect(() => {
        const original = authService.getActiveSession;
        authService.getActiveSession = async () => new Promise(() => undefined);
        return () => {
          authService.getActiveSession = original;
        };
      }, []);
      return <MyProfilePage />;
    };
    return <LoadingWrapper />;
  },
};
