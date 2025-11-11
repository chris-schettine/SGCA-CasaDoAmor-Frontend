import type { Meta, StoryObj } from '@storybook/react';
import ConsentimentoForm from '.';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof ConsentimentoForm> = {
  title: 'Components/ConsentimentoForm',
  component: ConsentimentoForm,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    profissionalUuid: 'uuid-exemplo-123',
  },
};

export default meta;
type Story = StoryObj<typeof ConsentimentoForm>;

export const Default: Story = {};

export const ComCallbacks: Story = {
  args: {
    onSuccess: () => alert('Consentimento registrado com sucesso!'),
    onCancel: () => alert('Cancelado'),
  },
};
