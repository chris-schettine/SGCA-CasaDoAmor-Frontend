import type { Meta, StoryObj } from '@storybook/react';
import MockAdapter from 'axios-mock-adapter';
import TableUsers from '.';
import { api } from '../../../api/api.gateway';

// Basic mock to avoid real network calls during stories/tests.
const usersMock = new MockAdapter(api, { delayResponse: 25 });
usersMock.onGet('/admin/users').reply(200, {
  content: [
    {
      id: 1,
      nome: 'Admin Story',
      email: 'admin@storybook.test',
      cpf: '00000000000',
      perfis: ['ADMIN'],
    },
  ],
  totalElements: 1,
});
usersMock.onAny().passThrough();

const meta: Meta<typeof TableUsers> = {
  title: 'Components/Table/TableUsers',
  component: TableUsers,
  decorators: [
    (Story) => <Story />,
  ],
};

export default meta;
type Story = StoryObj<typeof TableUsers>;

export const Default: Story = {};

export const WithSearch: Story = {
  args: {
    searchText: 'Admin',
  },
};

export const Loading: Story = {
  parameters: {
    tanstackQuery: {
      queries: [
        {
          queryKey: ['users'],
          status: 'loading',
        },
      ],
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    tanstackQuery: {
      queries: [
        {
          queryKey: ['users'],
          status: 'error',
          error: new globalThis.Error('Erro ao carregar usuários'),
        },
      ],
    },
  },
};

export const Empty: Story = {
  parameters: {
    tanstackQuery: {
      queries: [
        {
          queryKey: ['users'],
          status: 'success',
          data: { content: [], totalElements: 0 },
        },
      ],
    },
  },
};
