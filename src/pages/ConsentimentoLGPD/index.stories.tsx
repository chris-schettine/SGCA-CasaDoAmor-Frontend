import type { Meta, StoryObj } from '@storybook/react';
import ConsentimentoLGPDPage from '.';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import { consentimentoKeys } from '../../hooks/useConsentimento';
import type { PageConsentimentoResponseDTO } from '../../api/consentimento.dto';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const mockConsentimentos: PageConsentimentoResponseDTO = {
  content: [
    {
      id: 1,
      uuid: 'consent-1',
      profissionalUuid: 'prof-123',
      versaoTermo: '1.0.0',
      escopo: 'GERAL',
      concorda: true,
      ipOrigem: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      metadata: '{"dispositivo": "desktop"}',
      dataConsentimento: '2024-01-15T10:30:00',
      criadoEm: '2024-01-15T10:30:00',
    },
    {
      id: 2,
      uuid: 'consent-2',
      profissionalUuid: 'prof-123',
      versaoTermo: '1.0.0',
      escopo: 'COMPARTILHAMENTO_DADOS',
      concorda: false,
      ipOrigem: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
      dataConsentimento: '2024-02-20T14:15:00',
      criadoEm: '2024-02-20T14:15:00',
    },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 10,
  number: 0,
  first: true,
  last: true,
  empty: false,
  pageable: {
    offset: 0,
    pageNumber: 0,
    pageSize: 10,
    paged: true,
    unpaged: false,
    sort: [],
  },
  numberOfElements: 2,
  sort: [],
};

const meta: Meta<typeof ConsentimentoLGPDPage> = {
  title: 'Pages/ConsentimentoLGPD',
  component: ConsentimentoLGPDPage,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ConsentimentoLGPDPage>;

export const Default: Story = {
  parameters: {
    tanstackQuery: {
      queries: [
        {
          queryKey: consentimentoKeys.list('prof-123', { page: 0, size: 10 }),
          data: mockConsentimentos,
        },
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    tanstackQuery: {
      queries: [
        {
          queryKey: consentimentoKeys.list('prof-123', { page: 0, size: 10 }),
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
          queryKey: consentimentoKeys.list('prof-123', { page: 0, size: 10 }),
          data: {
            ...mockConsentimentos,
            content: [],
            totalElements: 0,
            empty: true,
          },
        },
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    tanstackQuery: {
      queries: [
        {
          queryKey: consentimentoKeys.list('prof-123', { page: 0, size: 10 }),
          status: 'error',
        },
      ],
    },
  },
};
