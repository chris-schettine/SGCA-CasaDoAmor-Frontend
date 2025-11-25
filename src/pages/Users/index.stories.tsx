import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Users from './index';
import { Box } from '@mui/material';
import type { PageUserResponseDTO, UserResponseDTO, PerfilDTO } from '../../api/admin.dto';
import { userKeys } from '../../hooks/useAdmin';
import { adminService } from '../../api/admin.service';

const meta: Meta<typeof Users> = {
  title: 'Pages/Users',
  component: Users,
  tags: ['a11y-fix'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof Users>;

const mockProfiles: PerfilDTO[] = [
  {
    id: 1,
    nome: 'Administrador',
    descricao: 'Acesso total ao sistema',
    permissoes: [],
    totalPermissoes: 0,
  },
];

const createUser = (overrides: Partial<UserResponseDTO>): UserResponseDTO => {
  const timestamp = new Date().toISOString();
  return {
    id: 0,
    uuid: 'storybook-user-uuid',
    nome: 'Usuário Exemplo',
    email: 'usuario@example.com',
    cpf: '00000000000',
    telefone: '(11) 99999-9999',
    tipo: 'ADMINISTRADOR',
    ativo: true,
    emailVerificado: true,
    ultimoLoginEm: timestamp,
    criadoEm: timestamp,
    atualizadoEm: timestamp,
    perfis: mockProfiles,
    ...overrides,
  };
};

const createPageData = (content: UserResponseDTO[]): PageUserResponseDTO => ({
  content,
  totalElements: content.length,
  totalPages: content.length > 0 ? 1 : 0,
  size: 10,
  number: 0,
  sort: [],
  pageable: {
    offset: 0,
    pageNumber: 0,
    pageSize: 10,
    paged: true,
    sort: [],
    unpaged: false,
  },
  first: true,
  last: true,
  numberOfElements: content.length,
  empty: content.length === 0,
});

const defaultUsers: UserResponseDTO[] = [
  createUser({
    id: 1,
    uuid: 'storybook-user-1',
    nome: 'Dra. Ana Martins',
    email: 'ana.martins@example.com',
    cpf: '12345678901',
    telefone: '(11) 91234-5678',
    tipo: 'MÉDICO',
    perfis: mockProfiles,
  }),
  createUser({
    id: 2,
    uuid: 'storybook-user-2',
    nome: 'Carlos Ferreira',
    email: 'carlos.ferreira@example.com',
    cpf: '98765432100',
    telefone: '(11) 99876-5432',
    tipo: 'FISIOTERAPEUTA',
    ativo: false,
  }),
  createUser({
    id: 3,
    uuid: 'storybook-user-3',
    nome: 'Juliana Costa',
    email: 'juliana.costa@example.com',
    cpf: '45678912300',
    telefone: '(11) 95555-6677',
    tipo: 'ADMINISTRADOR',
  }),
];

const defaultPageData = createPageData(defaultUsers);
const emptyPageData = createPageData([]);

const originalListUsers = adminService.listUsers.bind(adminService);
const originalToggleUserStatus = adminService.toggleUserStatus.bind(adminService);

const applyServiceMocks = (pageData: PageUserResponseDTO) => {
  adminService.listUsers = async (...args: Parameters<typeof originalListUsers>) => {
    void args;
    return pageData;
  };
  adminService.toggleUserStatus = async (...args: Parameters<typeof originalToggleUserStatus>) => {
    void args;
    return undefined as unknown as ReturnType<typeof originalToggleUserStatus>;
  };
};

const resetServiceMocks = () => {
  adminService.listUsers = originalListUsers;
  adminService.toggleUserStatus = originalToggleUserStatus;
};

const buildReactQueryParameters = (pageData: PageUserResponseDTO) => ({
  initialQueries: [
    {
      queryKey: userKeys.list({ page: 0, size: 10, searchText: '' }),
      data: pageData,
    },
  ],
});

export const Default: Story = {
  parameters: {
    reactQuery: buildReactQueryParameters(defaultPageData),
  },
  loaders: [async () => {
    applyServiceMocks(defaultPageData);
    return {};
  }],
  decorators: [
    (Story) => {
      React.useEffect(() => resetServiceMocks, []);
      return <Story />;
    },
  ],
};

export const EmptyList: Story = {
  parameters: {
    reactQuery: buildReactQueryParameters(emptyPageData),
  },
  loaders: [async () => {
    applyServiceMocks(emptyPageData);
    return {};
  }],
  decorators: [
    (Story) => {
      React.useEffect(() => resetServiceMocks, []);
      return <Story />;
    },
  ],
};

export const NonAdminViewer: Story = {
  parameters: {
    reactQuery: buildReactQueryParameters(defaultPageData),
    auth: {
      user: {
        nome: 'Colaborador Casa do Amor',
        email: 'viewer@example.com',
        cpf: '11122233344',
        roles: ['USER'],
        tipoUsuario: 'COLABORADOR',
      },
    },
  },
  loaders: [async () => {
    applyServiceMocks(defaultPageData);
    return {};
  }],
  decorators: [
    (Story) => {
      React.useEffect(() => resetServiceMocks, []);
      return <Story />;
    },
  ],
};
