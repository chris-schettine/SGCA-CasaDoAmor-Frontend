import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button } from '@mui/material';
import PageHeader from './index';
import SearchBar from '../SearchBar';

const meta = {
  title: 'Components/Layout/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    action: { control: false },
    searchComponent: { control: false },
  },
  args: {
    title: 'Lista de Pacientes',
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Basic: Story = {};

export const WithSubtitle: Story = {
  args: {
    subtitle: 'Administre os usuários do sistema',
  },
};

export const WithAction: Story = {
  args: {
    subtitle: 'Gerencie os pacientes cadastrados',
    action: <Button variant="contained">Novo paciente</Button>,
  },
};

export const WithSearch: Story = {
  args: {
    searchComponent: (
      <SearchBar
        placeholder="Buscar sessão..."
        value=""
        onChange={(value: string) => console.log('Busca:', value)}
      />
    ),
  },
};

export const Complete: Story = {
  args: {
    subtitle: 'Histórico de ações no sistema',
    searchComponent: (
      <SearchBar
        placeholder="Buscar por usuário ou ação"
        value=""
        onChange={(value: string) => console.log('Busca:', value)}
      />
    ),
    action: (
      <Button variant="contained" color="primary">
        Exportar CSV
      </Button>
    ),
  },
};

export const WithMultipleActions: Story = {
  args: {
    subtitle: 'Gere e exporte relatórios',
    action: (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined">Limpar filtros</Button>
        <Button variant="contained">Gerar relatório</Button>
      </Box>
    ),
  },
};
