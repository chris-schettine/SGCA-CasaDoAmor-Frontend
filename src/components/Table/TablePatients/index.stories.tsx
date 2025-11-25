import type { Meta, StoryObj } from '@storybook/react';
import MockAdapter from 'axios-mock-adapter';
import TablePatients from '.';
import { api } from '../../../api/api.gateway';

// Guarantee the helper used by Storybook Test Runner exists even if the page context resets.
if (typeof window !== 'undefined' && typeof (window as any).__test === 'undefined') {
  (window as any).__test = Object.assign(() => {}, { disableAnimations: true });
}

// Set up a shared mock once so requests never escape to the network during stories/tests.
const mock = new MockAdapter(api, { delayResponse: 50 });
mock.onGet(/\/pacientes\//).reply(200, {
  nodes: [
    {
      id: '1',
      dadoPessoal: { nome: 'Maria Souza', cpf: '12345678900', rg: '1234567' },
      endereco: { logradouro: 'Rua A', numero: 123, bairro: 'Centro', cidade: 'SP', estado: 'SP' },
    },
    {
      id: '2',
      dadoPessoal: { nome: 'João Silva', cpf: '98765432100', rg: '7654321' },
      endereco: { logradouro: 'Av B', numero: 456, bairro: 'Jardins', cidade: 'SP', estado: 'SP' },
    },
  ],
  totalCount: 2,
});
mock.onAny().passThrough();

const meta: Meta<typeof TablePatients> = {
  title: 'Components/Table/TablePatients',
  component: TablePatients,
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
  args: {
    mockState: {
      isLoading: true,
    },
  },
};

export const ErrorState: Story = {
  args: {
    mockState: {
      error: new Error('Erro ao carregar pacientes'),
    },
  },
};

export const Empty: Story = {
  args: {
    mockState: {
      data: { nodes: [], totalCount: 0 },
    },
  },
};
