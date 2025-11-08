import type { Meta, StoryObj } from '@storybook/react';
import { AuditLogPage } from '.';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const meta: Meta<typeof AuditLogPage> = {
  title: 'Pages/AuditLogPage',
  component: AuditLogPage,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AuditLogPage>;

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    tanstackQuery: {
      queries: [
        {
          queryKey: ['auditPerfis'],
          status: 'loading',
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
          queryKey: ['auditPerfis'],
          status: 'success',
          data: { relatorioLogins: { tentativas: [] } },
        },
      ],
    },
  },
};
