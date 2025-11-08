import type { Meta, StoryObj } from '@storybook/react';
import TablePatients from '.';

const meta: Meta<typeof TablePatients> = {
  title: 'Components/Table/TablePatients',
  component: TablePatients,
  decorators: [
    (Story) => <Story />,
  ],
};

export default meta;
type Story = StoryObj<typeof TablePatients>;

export const Default: Story = {};

export const WithSearch: Story = {
  args: {
    searchText: 'Fulano',
  },
};

export const Loading: Story = {
  parameters: {
    tanstackQuery: {
      queries: [
        {
          queryKey: ['patients'],
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
          queryKey: ['patients'],
          status: 'error',
          error: new globalThis.Error('Erro ao carregar pacientes'),
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
          queryKey: ['patients'],
          status: 'success',
          data: { nodes: [], totalCount: 0 },
        },
      ],
    },
  },
};
