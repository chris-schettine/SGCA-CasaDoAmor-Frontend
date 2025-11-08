import type { Meta, StoryObj } from '@storybook/react';
import TableUsers from '.';

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
